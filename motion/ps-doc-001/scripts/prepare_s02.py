"""Prépare les données de la séquence S02 (aucune image générée, aucun redessin du portrait).

1. Portrait : copie à l'identique de motion/sources/1000338417.png -> public/portrait-oscar-1000338417.png,
   puis calcul de la mosaïque de révélation (couleur moyenne de chaque carré de la photo, telle qu'affichée).
2. Pictogrammes premium : dessins au trait (vectoriels, PIL) rasterisés sur une grille fine de pixels ;
   l'opacité de chaque pixel suit le taux de couverture du trait (effet demi-teinte), accents orange séparés.
Sorties : public/s02-portrait-mosaic.json, public/s02-icons.json
"""
import json, shutil
import numpy as np
from PIL import Image, ImageDraw

SRC = '../sources/1000338417.png'
DST = 'public/portrait-oscar-1000338417.png'
shutil.copyfile(SRC, DST)

# ——— Géométrie d'affichage du portrait (doit correspondre à S02Fondateur.tsx) ———
BOX_W, BOX_H = 990, 1080          # cadre du portrait dans l'image 1920×1080
im = Image.open(SRC).convert('RGB')
sc = max(BOX_W / im.width, BOX_H / im.height)   # « cover », toujours < 1 : jamais d'agrandissement
DW, DH = round(im.width * sc), round(im.height * sc)
OY = -round((DH - BOX_H) * 0.15)                 # recadrage vertical : on garde la tête, on rogne surtout le bas
CELL = 45
disp = np.asarray(im.resize((DW, DH), Image.LANCZOS)).astype(np.float32)
cols, rows = int(np.ceil(DW / CELL)), int(np.ceil(DH / CELL))
cells = []
for j in range(rows):
    for i in range(cols):
        blk = disp[j * CELL:(j + 1) * CELL, i * CELL:(i + 1) * CELL]
        y_on_screen = j * CELL + OY
        if y_on_screen + CELL < 0 or y_on_screen > BOX_H: continue
        c = blk.reshape(-1, 3).mean(0)
        cells.append(dict(i=i, j=j, c='#%02x%02x%02x' % tuple(int(v) for v in c)))
# centre du visage (repéré sur la photo source) pour ordonner la révélation du visage vers l'extérieur
FACE = (555 * sc, 290 * sc)
json.dump(dict(src=DST, natural=[im.width, im.height], scale=round(sc, 5), dw=DW, dh=DH, oy=OY, cell=CELL,
               face=[round(FACE[0], 1), round(FACE[1], 1)], cells=cells), open('public/s02-portrait-mosaic.json', 'w'))
print(f'portrait {im.width}×{im.height} -> affiché {DW}×{DH} (échelle {sc:.3f}, < 1), {len(cells)} carrés de {CELL} px')

# ——— Pictogrammes : trait vectoriel fin -> grille fine de pixels (un pixel de trait) ———
N = 30          # grille 30×30
R = 600         # résolution de dessin (20 px par case)
LW = 20         # épaisseur du trait = une case

def icon(draw_white, draw_orange):
    W = Image.new('L', (R, R), 0); O = Image.new('L', (R, R), 0)
    draw_white(ImageDraw.Draw(W)); draw_orange(ImageDraw.Draw(O))
    out = []
    w = np.asarray(W.resize((N, N), Image.BOX)) / 255.0
    o = np.asarray(O.resize((N, N), Image.BOX)) / 255.0
    for r in range(N):
        for c in range(N):
            if o[r, c] > 0.3: out.append(dict(c=c, r=r, a=round(min(1, o[r, c] * 1.4), 2), o=1))
            elif w[r, c] > 0.3: out.append(dict(c=c, r=r, a=round(min(1, w[r, c] * 1.4), 2), o=0))
    return out

# Tracés calés sur la grille : une ligne passe au centre d'une case (20k+10),
# un rectangle commence sur un bord de case (20k) et finit sur 20m+19 → trait d'exactement un pixel.
C = lambda k: 20 * k + 10
def rect(d, c0, r0, c1, r1, **kw):
    d.rectangle([20 * c0, 20 * r0, 20 * c1 + 19, 20 * r1 + 19], **kw)

def entrepreneurs_w(d):   # buste au trait
    d.ellipse([180, 60, 320, 200], outline=255, width=LW)
    d.arc([100, 260, 400, 560], 180, 360, fill=255, width=LW)
    d.line([C(3), C(26), C(21), C(26)], fill=255, width=LW)
def entrepreneurs_o(d):   # flèche de croissance, à l'écart du buste
    d.line([(C(22), C(21)), (C(24), C(17)), (C(26), C(19)), (C(28), C(12))], fill=255, width=LW, joint='curve')
    d.line([(C(26), C(12)), (C(28), C(12)), (C(28), C(14))], fill=255, width=LW)

def pme_w(d):             # mallette
    rect(d, 3, 10, 26, 25, outline=255, width=LW)
    rect(d, 11, 6, 18, 10, outline=255, width=LW)
    d.line([C(3), C(16), C(26), C(16)], fill=255, width=LW)
def pme_o(d):             # fermoir
    rect(d, 14, 15, 15, 18, fill=255)

def commercants_w(d):     # boutique : montants, vitrine, porte
    d.line([C(5), C(12), C(5), C(26)], fill=255, width=LW); d.line([C(24), C(12), C(24), C(26)], fill=255, width=LW)
    d.line([C(2), C(26), C(27), C(26)], fill=255, width=LW)
    rect(d, 8, 16, 14, 21, outline=255, width=LW)
    rect(d, 17, 16, 21, 26, outline=255, width=LW)
def commercants_o(d):     # auvent rayé
    d.line([C(3), C(6), C(26), C(6)], fill=255, width=LW)
    for k in range(3, 26, 4):
        rect(d, k, 7, k + 1, 10, fill=255)

def entreprises_w(d):     # deux immeubles
    rect(d, 3, 10, 12, 26, outline=255, width=LW)
    rect(d, 15, 4, 26, 26, outline=255, width=LW)
    d.line([C(1), C(26), C(28), C(26)], fill=255, width=LW)
def entreprises_o(d):     # fenêtres éclairées (pixels isolés)
    for (c, r) in [(6, 14), (9, 14), (6, 18), (9, 22), (18, 8), (23, 8), (18, 12), (23, 16), (18, 20), (23, 22)]:
        rect(d, c, r, c, r, fill=255)

icons = dict(cols=N, entrepreneurs=icon(entrepreneurs_w, entrepreneurs_o), pme=icon(pme_w, pme_o),
             commercants=icon(commercants_w, commercants_o), entreprises=icon(entreprises_w, entreprises_o))
json.dump(icons, open('public/s02-icons.json', 'w'))
print('pictogrammes :', {k: len(v) for k, v in icons.items() if k != 'cols'}, 'pixels')
