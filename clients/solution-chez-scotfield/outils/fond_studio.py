#!/usr/bin/env python3
"""
Détoure une photo produit et la pose sur un fond studio blanc (ombre douce au sol).

Usage :
  python3 outils/fond_studio.py --tout            traite toutes les photos de donnees/photos_studio.json
  python3 outils/fond_studio.py --tout <id> …     seulement certains produits
  python3 outils/fond_studio.py <source> <sortie.jpg> [--boite X0 Y0 X1 Y1] [--modele …] [--convexe] [--pied]

Dépendances : pip install "rembg[cpu]" pillow   (le modèle est téléchargé au premier lancement)
Format de sortie : JPEG 960×720 (4:3), produit centré, posé au sol.
"""
import argparse
from PIL import Image, ImageDraw, ImageFilter

L, H = 960, 720
_sessions = {}

def session(modele='isnet-general-use'):
    if modele not in _sessions:
        from rembg import new_session
        _sessions[modele] = new_session(modele)
    return _sessions[modele]

def nettoyer(alpha):
    """Garde le produit (plus grande zone + zones importantes), retire les débris, bouche les trous (écran, clavier)."""
    import numpy as np
    from scipy import ndimage
    a = np.array(alpha).astype(np.float32)
    m = a > 110
    lab, n = ndimage.label(m)
    if n:
        tailles = ndimage.sum(m, lab, range(1, n + 1))
        garder = [i + 1 for i, t in enumerate(tailles) if t >= tailles.max() * 0.04]
        m = np.isin(lab, garder)
    m = ndimage.binary_closing(m, iterations=3)
    m = ndimage.binary_fill_holes(m)
    a = np.where(m, np.maximum(a, 255 * ndimage.binary_erosion(m, iterations=2)), 0)
    return Image.fromarray(a.clip(0, 255).astype('uint8')).filter(ImageFilter.GaussianBlur(.6))

def fond():
    """Blanc studio : centre blanc pur, bords très légèrement grisés (teinte verte de la marque)."""
    f = Image.new('RGB', (L, H), (255, 255, 255))
    vignette = Image.new('L', (L, H), 0)
    d = ImageDraw.Draw(vignette)
    d.ellipse((-L * .25, -H * .35, L * 1.25, H * 1.25), fill=255)
    vignette = vignette.filter(ImageFilter.GaussianBlur(120))
    bord = Image.new('RGB', (L, H), (241, 243, 238))
    return Image.composite(f, bord, vignette)

def masque_fond_clair(im):
    """Pour une photo déjà sur fond blanc/gris clair : tout ce qui n'est pas clair et neutre est le produit."""
    import numpy as np
    a = np.array(im).astype(int)
    mn, mx = a.min(axis=2), a.max(axis=2)
    m = (mn < 222) | ((mx - mn) > 28)
    return Image.fromarray((m * 255).astype('uint8'))

def enveloppe(alpha):
    """Contour convexe : pour un objet plat et fermé (ordinateur rabattu), supprime les encoches parasites."""
    import numpy as np
    from scipy.spatial import ConvexHull
    pts = np.argwhere(np.array(alpha) > 128)[:, ::-1]
    hull = ConvexHull(pts)
    m = Image.new('L', alpha.size, 0)
    ImageDraw.Draw(m).polygon([tuple(map(float, pts[i])) for i in hull.vertices], fill=255)
    return m.filter(ImageFilter.GaussianBlur(.6))

def couper_pied(alpha, ratio=.3):
    """Retire, en partant du bas, les rangées étroites (pied de support, bord de table) sous le produit."""
    import numpy as np
    a = np.array(alpha)
    largeurs = (a > 128).sum(axis=1)
    seuil = largeurs.max() * ratio
    y = len(largeurs) - 1
    while y > 0 and largeurs[y] < seuil:
        a[y, :] = 0; y -= 1
    return Image.fromarray(a)

def poser(source, sortie, boite=None, modele='isnet-general-use', convexe=False, pied=False):
    """modele : nom d'un modèle rembg, ou 'fond-clair' pour une photo déjà sur fond blanc."""
    im = Image.open(source).convert('RGB')
    if boite:
        im = im.crop(boite)
    if modele == 'fond-clair':
        alpha = nettoyer(masque_fond_clair(im))
    else:
        from rembg import remove
        detoure = remove(im, session=session(modele), post_process_mask=True)
        alpha = nettoyer(detoure.getchannel('A'))
    if convexe:
        alpha = enveloppe(alpha)
    if pied:
        alpha = couper_pied(alpha)
    detoure = im.convert('RGBA'); detoure.putalpha(alpha)
    bbox = alpha.getbbox()
    if not bbox:
        raise SystemExit(f'Aucun produit détecté dans {source}')
    produit = detoure.crop(bbox)
    # mise à l'échelle : 84 % de la largeur ou 74 % de la hauteur au maximum
    e = min(L * .84 / produit.width, H * .74 / produit.height)
    produit = produit.resize((round(produit.width * e), round(produit.height * e)), Image.LANCZOS)
    x = (L - produit.width) // 2
    y = round(H * .87) - produit.height          # posé au sol, à 87 % de la hauteur
    y = max(round(H * .06), y)
    toile = fond()
    # ombre de contact : ellipse floue sous le produit
    ombre = Image.new('L', (L, H), 0)
    d = ImageDraw.Draw(ombre)
    d.ellipse((x + produit.width * .06, y + produit.height - 14, x + produit.width * .94, y + produit.height + 16), fill=95)
    ombre = ombre.filter(ImageFilter.GaussianBlur(14))
    toile.paste(Image.new('RGB', (L, H), (40, 44, 36)), (0, 0), ombre)
    toile.paste(produit, (x, y), produit)
    toile.save(sortie, quality=88, optimize=True, progressive=True)

def tout(seulement=None):
    """Traite toutes les photos listées dans donnees/photos_studio.json (un modèle à la fois, pour la mémoire)."""
    import json, gc
    from pathlib import Path
    racine = Path(__file__).resolve().parent.parent
    recette = json.loads((racine / 'donnees/photos_studio.json').read_text(encoding='utf-8'))
    taches = [(d, i, o) for d, liste in recette.items() if not d.startswith('_') for i, o in liste.items() if not seulement or i in seulement]
    for modele in sorted({o['modele'] for _, _, o in taches}):
        for d, i, o in taches:
            if o['modele'] != modele:
                continue
            poser(racine / f'src/assets/produits-originaux/{d}/{i}.jpg', racine / f'src/assets/produits/{d}/{i}.jpg',
                  None, modele, o.get('convexe', False), o.get('pied', False))
            print('fond studio :', d, i)
        _sessions.clear(); gc.collect()

if __name__ == '__main__':
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == '--tout':
        tout(sys.argv[2:]); raise SystemExit
    a = argparse.ArgumentParser()
    a.add_argument('source'); a.add_argument('sortie')
    a.add_argument('--boite', type=int, nargs=4, metavar=('X0', 'Y0', 'X1', 'Y1'))
    a.add_argument('--modele', default='isnet-general-use', help="isnet-general-use, birefnet-general, u2net… ou 'fond-clair'")
    a.add_argument('--convexe', action='store_true', help='contour convexe (objet plat fermé)')
    a.add_argument('--pied', action='store_true', help='retire un pied de support / bord de table sous le produit')
    o = a.parse_args()
    poser(o.source, o.sortie, tuple(o.boite) if o.boite else None, o.modele, o.convexe, o.pied)
