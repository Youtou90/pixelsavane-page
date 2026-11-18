#!/usr/bin/env python3
"""
Solution Chez Scotfield — générateur du site vitrine.

Usage :  python3 outils/construire.py
Lit     : donnees/boutique.json, donnees/produits.json, donnees/icones.json, src/
Produit : public/  (le dossier à mettre en ligne, tel quel)

Dépendance : Pillow (pip install pillow) pour optimiser les photos.
"""
import html, json, shutil, sys, urllib.parse
from datetime import date
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
SRC, PUB, DON = RACINE / 'src', RACINE / 'public', RACINE / 'donnees'

B = json.loads((DON / 'boutique.json').read_text(encoding='utf-8'))
P = json.loads((DON / 'produits.json').read_text(encoding='utf-8'))
ICONES = json.loads((DON / 'icones.json').read_text(encoding='utf-8'))
USAGES = B['usages']
E = html.escape


# ------------------------------------------------------------------ photos
def filigrane(im):
    """Version démo : « DÉMO · PixelSavane » répété en diagonale + pastille en bas à gauche. Les sources restent propres."""
    from PIL import Image, ImageDraw, ImageFont
    police = RACINE / 'outils/polices/Montserrat-ExtraBold.ttf'
    def fonte(t):
        try:
            return ImageFont.truetype(str(police), t)
        except OSError:
            return ImageFont.load_default()
    l, h = im.size
    texte = f'DÉMO · {B["realisation"]["nom"]}'
    # 1) motif diagonal répété, blanc translucide avec un léger contour sombre (lisible sur fond clair comme sombre)
    f = fonte(max(14, round(l * 0.042)))
    tl, th = f.getbbox(texte)[2:]
    tuile = Image.new('RGBA', (tl + 60, th + 20), (0, 0, 0, 0))
    ImageDraw.Draw(tuile).text((30, 4), texte, font=f, fill=(255, 255, 255, 92),
                               stroke_width=max(1, round(l / 480)), stroke_fill=(0, 0, 0, 46))
    tuile = tuile.rotate(28, expand=True, resample=Image.BICUBIC)
    calque = Image.new('RGBA', (l, h), (0, 0, 0, 0))
    pas_x, pas_y = round(tuile.width * 0.95), round(tuile.height * 1.15)
    for i, y in enumerate(range(-tuile.height, h + tuile.height, pas_y)):
        for x in range(-tuile.width + (i % 2) * pas_x // 2, l + tuile.width, pas_x):
            calque.alpha_composite(tuile, (x, y))
    # 2) pastille nette en bas à gauche
    fp = fonte(max(12, round(l * 0.03)))
    pl, ph = fp.getbbox(texte)[2:]
    m, px, py = round(l * .025), round(l * .018), round(l * .012)
    d = ImageDraw.Draw(calque)
    d.rounded_rectangle((m, h - m - ph - 2 * py, m + pl + 2 * px, h - m), radius=round(ph * .45), fill=(11, 11, 11, 200))
    d.text((m + px, h - m - ph - py - fp.getbbox(texte)[1] // 2), texte, font=fp, fill=(245, 196, 0, 255))
    return Image.alpha_composite(im.convert('RGBA'), calque).convert('RGB')


def preparer_photos():
    """Copie chaque photo produit en JPEG (repli) + WebP 480 et 960 px. Filigrane en mode démo. Retourne {chemin: (l, h)}."""
    try:
        from PIL import Image
    except ImportError:
        sys.exit('Pillow manquant : pip install pillow')
    mode = 'demo' if B['demo'] else 'officiel'
    temoin = PUB / 'assets/produits/.mode'
    tout_refaire = not temoin.exists() or temoin.read_text() != mode   # changement démo <-> officiel : on régénère tout
    dims = {}
    for dossier in sorted((SRC / 'assets/produits').iterdir()):
        sortie = PUB / 'assets/produits' / dossier.name
        sortie.mkdir(parents=True, exist_ok=True)
        for jpg in sorted(dossier.glob('*.jpg')):
            base = sortie / jpg.stem
            im = Image.open(jpg).convert('RGB')
            if im.width > 960:
                im = im.resize((960, round(im.height * 960 / im.width)), Image.LANCZOS)
            dims[f'{dossier.name}/{jpg.stem}'] = im.size
            if not tout_refaire and base.with_suffix('.jpg').exists() and base.with_suffix('.jpg').stat().st_mtime >= jpg.stat().st_mtime:
                continue  # déjà à jour
            if B['demo']:
                im = filigrane(im)
            im.save(base.with_suffix('.jpg'), quality=82, optimize=True, progressive=True)
            for w in (480, 960):
                r = im if im.width <= w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
                r.save(f'{base}-{w}.webp', 'WEBP', quality=74, method=6)
    temoin.write_text(mode)
    return dims


# ------------------------------------------------------------------ briques
def wa(msg, numero=None):
    return f'https://wa.me/{numero or B["whatsapp"]["numero"]}?text=' + urllib.parse.quote(msg)

def ico(n):
    return f'<svg viewBox="0 0 24 24" aria-hidden="true">{ICONES[n]}</svg>'

WA_ICO = ico('whatsapp').replace('<svg ', '<svg fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" ')
RUBAN = '<span class="ruban"><span class="fin">Solution</span> <b>Chez Scotfield</b></span>'
DIMS = {}
# Mention de prix identique sur TOUS les articles (aucun prix affiché : le client le demande sur WhatsApp)
LIBELLE_PRIX = 'Prix en boutique'
AIDE_PRIX = 'Demandez le prix du jour sur WhatsApp'

def fcfa(n):
    return f'{n:,}'.replace(',', ' ') + ' F CFA'

def photo(dossier, ident, alt, sizes='(max-width:600px) 92vw, 300px', titre=None):
    l, h = DIMS[f'{dossier}/{ident}']
    base = f'assets/produits/{dossier}/{ident}'
    return (f'<picture><source type="image/webp" srcset="{base}-480.webp 480w, {base}-960.webp {l}w" sizes="{sizes}">'
            f'<img src="{base}.jpg" alt="{E(alt)}" width="{l}" height="{h}" loading="lazy" decoding="async" '
            f'data-zoom="{base}-960.webp" data-titre="{E(titre or alt)}"></picture>')

def tuile(n, titre, texte):
    return f'<div class="tuile"><span class="ico">{ico(n)}</span><div><h3>{titre}</h3><p>{texte}</p></div></div>'

def machine(m):
    u0 = m['usages'][0]
    tag = f'<span class="tag{" rouge" if u0 == "thinkpad" else ""}">{USAGES[u0]}</span>'
    specs = ''.join(f'<div><dt>{E(s["label"])}</dt><dd>{E(s["valeur"])}</dd></div>' for s in m['specs'])
    prix = f'<p class="prix-m demande">{LIBELLE_PRIX}<small>{AIDE_PRIX}</small></p>'
    note = f'<p class="note-m">{E(m["note"])}</p>' if m.get('note') else ''
    msg = f"Bonjour {B['nom']}, je suis intéressé(e) par le {m['nom']}. Est-il disponible et quel est son prix ?"
    return f'''<article class="machine" data-usages="{' '.join(m['usages'])}" id="{m['id']}">
  <div class="photo-m">{photo(m['dossier'], m['id'], m['nom'])}<div class="tags">{tag}</div></div>
  <div class="corps-m"><h3>{E(m['nom'])}</h3><dl>{specs}</dl>{note}
  <div class="pied-m">{prix}<a class="btn btn-vert" href="{wa(msg)}" target="_blank" rel="noopener">{WA_ICO}Commander</a></div></div>
</article>'''

def affiche(f):
    """Fiche « affiche » façon publicité de la boutique (imprimantes)."""
    barres = ''.join(f'<span>{E(x)}</span>' for x in f['barres'])
    puces = ''.join(f'<li>{p}</li>' for p in f['puces'])
    prix = LIBELLE_PRIX
    return f'''<article class="fiche" id="{f['id']}">
  {RUBAN}
  <div class="corps">
    <div><h3>{E(f['nom'])}</h3><p class="barres" style="margin-top:.2rem">{barres}</p></div>
    <div class="photo">{photo(f['dossier'], f['id'], f['alt'], '(max-width:820px) 92vw, 560px', f['nom'])}</div>
    <ul>{puces}</ul>
    <div class="pied"><p class="prix" style="margin:0">{prix}<small>{AIDE_PRIX}</small></p>
    <a class="btn btn-vert" href="{wa(f"Bonjour, je suis intéressé(e) par : {f['nom']}. Quel est le prix ?")}" target="_blank" rel="noopener">{WA_ICO}Commander</a></div>
  </div>
</article>'''


# ------------------------------------------------------------------ gabarit
def entete(actif):
    liens = [('accueil', 'index.html', 'Accueil'), ('produits', 'produits.html', 'Produits'), ('contact', 'contact.html', 'Contact')]
    nav = ''.join(f'<a href="{h}"' + (' aria-current="page"' if k == actif else '') + f'>{t}</a>' for k, h, t in liens)
    return f'''<header class="entete"><div class="wrap">
  <a class="marque" href="index.html" aria-label="{B['nom']}, accueil"><img src="assets/logo/logo-scs.svg" alt="Logo SCS Info-Télécom" width="74" height="49">{RUBAN}</a>
  <nav class="nav" aria-label="Navigation principale">{nav}<a class="btn btn-vert btn-wa" href="{wa(f"Bonjour {B['nom']}, j'ai une question.")}" target="_blank" rel="noopener">{WA_ICO}<span>WhatsApp</span></a></nav>
</div></header>'''

def bande_demo():
    """Bandeau « Version démo » : affiché tant que demo = true (retiré après paiement). Non masquable."""
    if not B['demo']:
        return ''
    r = B['realisation']
    lien = wa(f"Bonjour {r['nom']}, j'ai vu la démo du site {B['nom']}.", r['whatsapp'])
    return (f'<div class="demo" role="note" aria-label="Version de démonstration"><div class="wrap">'
            f'<span class="demo-badge">Version démo</span>'
            f'<span class="demo-txt"><span class="long">Site de démonstration réalisé par </span><span class="court">Réalisé par </span><b>{r["nom"]}</b></span>'
            f'<a class="demo-lien" href="{lien}" target="_blank" rel="noopener"><span class="long">WhatsApp </span>{r["affiche"]}</a></div></div>')

def bande_mardi():
    if not B['journee_thinkpad']['actif']:
        return ''
    return ('<a class="bande-mardi" href="index.html#journee-thinkpad"><span class="wrap"><i class="point" aria-hidden="true"></i>'
            '<b>Mardi = Journée ThinkPad</b><span class="txt">Lenovo ThinkPad soldés, uniquement le mardi</span>'
            '<span class="quand" data-mardi-court>Voir l’offre →</span></span></a>')

def pied():
    a, w, r = B['appels'], B['whatsapp'], B['realisation']
    autres = ' · '.join(n['affiche'] for n in B['autres_numeros'])
    return f'''<section class="bande" aria-label="Coordonnées"><div class="wrap">
  <div><span class="tel-role">Appels & commandes</span><a class="tel" href="tel:{a['numero']}">{a['affiche']}<small>100% Original</small></a>
  <span class="tel-autres"><b>WhatsApp : {w['affiche']}</b>{'<br>Aussi : ' + autres if autres else ''}</span></div>
  <span class="sep" aria-hidden="true"></span>
  <p class="lieu" style="margin:0"><span>Nous sommes situés</span><b>{B['adresse']}</b></p>
</div></section>
<footer class="bas"><div class="wrap">
  <span>© {date.today().year} {B['nom']} · {B['marque_courte']} · {B['ville']}, Cameroun<br><span class="credit">Site réalisé par <b>{r['nom']}</b> · <a href="https://wa.me/{r['whatsapp']}" target="_blank" rel="noopener">WhatsApp {r['affiche']}</a></span></span>
  <nav aria-label="Pied de page"><a href="index.html">Accueil</a><a href="produits.html">Produits</a><a href="contact.html">Contact</a><a href="{B['tiktok']['url']}" target="_blank" rel="noopener">TikTok</a></nav>
</div></footer>
<a class="wa-flottant" href="{wa(f"Bonjour {B['nom']}, j'ai une question.")}" target="_blank" rel="noopener" aria-label="Écrire à la boutique sur WhatsApp">{WA_ICO}<span>Une question ?</span></a>
<div class="visionneuse" id="visionneuse" role="dialog" aria-modal="true" aria-label="Photo du produit" hidden>
  <button class="v-fermer" type="button" aria-label="Fermer">×</button>
  <button class="v-nav v-prec" type="button" aria-label="Photo précédente">‹</button>
  <figure><img alt=""><figcaption><b class="v-titre"></b><span class="v-prix"></span><a class="btn btn-vert v-wa" target="_blank" rel="noopener">{WA_ICO}Commander</a><span class="v-compte"></span></figcaption></figure>
  <button class="v-nav v-suiv" type="button" aria-label="Photo suivante">›</button>
</div>'''

def schema_boutique():
    a = B['appels']
    d = {'@context': 'https://schema.org', '@type': 'ElectronicsStore', 'name': B['nom'],
         'telephone': a['numero'], 'address': {'@type': 'PostalAddress', 'streetAddress': 'En face de la Poste Centrale',
         'addressLocality': B['ville'], 'addressRegion': B['region'], 'addressCountry': B['pays']},
         'openingHours': B['horaires']['schema'], 'sameAs': [B['tiktok']['url']], 'image': 'assets/icones/og-image.jpg'}
    if B['url_site']:
        d['url'] = B['url_site']
        d['image'] = B['url_site'].rstrip('/') + '/assets/icones/og-image.jpg'
    return '<script type="application/ld+json">' + json.dumps(d, ensure_ascii=False) + '</script>'

def page(fichier, titre, desc, actif, corps, schema=False):
    url = B['url_site'].rstrip('/')
    canon = f'<link rel="canonical" href="{url}/{"" if fichier == "index.html" else fichier}">' if url else ''
    og_img = f'{url}/assets/icones/og-image.jpg' if url else 'assets/icones/og-image.jpg'
    robots = '<meta name="robots" content="noindex">' if B['demo'] else ''
    doc = f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{E(titre)}</title>
<meta name="description" content="{E(desc)}">
<meta name="theme-color" content="#4E7407">
{robots}{canon}
<meta property="og:type" content="website"><meta property="og:locale" content="fr_FR">
<meta property="og:title" content="{E(titre)}"><meta property="og:description" content="{E(desc)}">
<meta property="og:image" content="{og_img}"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="assets/logo/logo-scs.svg" type="image/svg+xml">
<link rel="icon" href="assets/icones/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="assets/icones/apple-touch-icon.png">
<link rel="manifest" href="site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;600;700;800;900&family=Roboto+Condensed:wght@400;500;700&display=swap">
<link rel="stylesheet" href="css/style.css">
{schema_boutique() if schema else ''}
</head>
<body data-wa="{B['whatsapp']['numero']}">
<div class="haut-fixe">
{bande_demo()}
{entete(actif)}
</div>
{bande_mardi()}
<main id="contenu">
{corps}
</main>
{pied()}
<script src="js/site.js" defer></script>
</body>
</html>
'''
    (PUB / fichier).write_text(doc, encoding='utf-8')


# ------------------------------------------------------------------ pages
def section_thinkpad():
    tp = B['journee_thinkpad']
    if not tp['actif']:
        return ''
    jours = ''.join(f'<div class="jour{" mardi" if c == "Mar" else ""}" data-jour="{i}"><span>{c}</span>'
                    + ('<i class="point"></i><b>ThinkPad</b>' if c == 'Mar' else '') + '</div>'
                    for i, c in enumerate(['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']))
    vedette = next((m for m in P['portables'] if m['id'] == tp.get('vedette')), None)
    carte = ''
    if vedette:
        resume = ' · '.join(s['valeur'] for s in vedette['specs'][:3]) + ' · ' + next((s['valeur'] for s in vedette['specs'] if s['label'] == 'Écran'), '')
        carte = (f'<a class="tp-vedette" href="produits.html#{vedette["id"]}"><img src="assets/produits/{vedette["dossier"]}/{vedette["id"]}-480.webp" '
                 f'alt="{E(vedette["nom"])}" width="480" height="360" loading="lazy" decoding="async"><span><small>En vedette ce mardi</small>'
                 f'<b>{E(vedette["nom"])}</b>{E(resume)}<em>Prix du mardi sur WhatsApp →</em></span></a>')
    return f'''<section class="thinkpad" id="journee-thinkpad" aria-labelledby="tp-titre"><div class="wrap tp-grille">
  <div>
    <p class="tp-eti"><i class="point" aria-hidden="true"></i>Le rendez-vous de la semaine</p>
    <h2 id="tp-titre">Tous les mardis, c’est la <span>Journée ThinkPad</span>.</h2>
    <p class="tp-txt">Chaque mardi, et uniquement le mardi, {B['nom']} solde ses ordinateurs portables <b>Lenovo ThinkPad</b>, nouveaux arrivages compris. Robustes, clavier de référence, faits pour travailler : c’est le jour pour en profiter.</p>
    <p class="tp-statut" data-mardi-long>Prochaine Journée ThinkPad : mardi</p>
    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:1.2rem">
      <a class="btn btn-vert" href="{wa(f"Bonjour {B['nom']}, je viens pour la Journée ThinkPad du mardi. Quels ThinkPad sont soldés ?")}" target="_blank" rel="noopener">{WA_ICO}Réserver mon ThinkPad</a>
      <a class="btn tp-btn" href="contact.html">Venir en boutique</a>
    </div>
  </div>
  <div class="semaine" role="img" aria-label="Semaine : la Journée ThinkPad a lieu le mardi">
    <div class="jours">{jours}</div>
    <p class="semaine-leg">Soldes ThinkPad · mardi uniquement · dans la limite du stock</p>
    {carte}
  </div>
</div></section>'''

RANGEE = f'''<div class="rangee">
  <div>{ico('badge')}<h3>100% Original</h3><p>Des produits authentiques, jamais de copies</p></div>
  <div>{ico('bouclier')}<h3>Garantie</h3><p>Sur les produits, selon le modèle</p></div>
  <div>{ico('conseil')}<h3>Conseil avant achat</h3><p>On vous aide à choisir selon votre budget</p></div>
  <div>{ico('repere')}<h3>Facile à trouver</h3><p>En face de la Poste Centrale de Bertoua</p></div>
</div>'''

def page_accueil():
    rayons = B['rayons']
    cats = ''.join(f'<a class="cat" href="produits.html#{r["id"]}"><span class="ico">{ico(r["icone"])}</span><div><h3>{r["titre"]}</h3>'
                   f'<p>{r["texte"]}</p><span class="fleche">Voir le rayon →</span></div></a>' for r in rayons)
    selection = [m for m in P['portables'] if m.get('accueil')][:4]
    w, a = B['whatsapp'], B['appels']
    autres = ' · '.join(n['affiche'] for n in B['autres_numeros'])
    corps = f'''<section class="heros"><div class="wrap grille">
  <div>
    <p class="etiquette">Boutique informatique & télécom · {B['ville']}</p>
    <h1 style="margin-top:.6rem">Tout le matériel informatique, au même endroit.</h1>
    <p class="sous-titre">(Ordinateurs, téléphones, imprimantes & sono)</p>
    <p class="barres"><span>Portables</span><span>Desktops</span><span>Téléphones</span><span>Imprimantes</span><span>Projecteurs</span><span>Baffles</span></p>
    <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:1.6rem">
      <a class="btn btn-vert" href="{wa(f"Bonjour {B['nom']}, je cherche un produit.")}" target="_blank" rel="noopener">{WA_ICO}Écrire sur WhatsApp</a>
      <a class="btn btn-contour" href="produits.html">Voir les produits</a>
    </div>
  </div>
  <div class="tuiles">
    {tuile('portable', 'Ordinateurs portables & de bureau', 'Pour l’école, le bureau et l’entreprise')}
    {tuile('telephone', 'Téléphones & accessoires', 'Smartphones, chargeurs, écouteurs')}
    {tuile('imprimante', 'Imprimantes', 'Réservoirs d’encre, Wi-Fi, thermiques')}
    {tuile('projecteur', 'Vidéoprojecteurs', 'Réunions, écoles, cinéma à la maison')}
    {tuile('baffle', 'Baffles & sono', 'Bluetooth, enceintes amplifiées, micros')}
  </div>
</div>
<div class="wrap">{RANGEE}</div>
</section>
{section_thinkpad()}
<section class="section fond-tuile"><div class="wrap">
  <div class="section-tete"><div><p class="etiquette">Nos rayons</p><h2>Que cherchez-vous aujourd’hui ?</h2></div>
  <a class="btn btn-noir" href="produits.html">Tout le catalogue</a></div>
  <div class="categories">{cats}</div>
</div></section>
<section class="section"><div class="wrap">
  <div class="section-tete"><div><p class="etiquette">Arrivage · Ordinateurs portables</p><h2>Les portables du moment</h2>
  <p>Photos réelles des machines disponibles. Pour le prix, écrivez au vendeur sur WhatsApp : il vous répond selon le stock.</p></div>
  <a class="btn btn-noir" href="produits.html#portables">Voir les {len(P['portables'])} portables</a></div>
  <div class="machines">{''.join(machine(m) for m in selection)}</div>
</div></section>
<section class="section fond-tuile"><div class="wrap">
  <div class="section-tete"><div><p class="etiquette">En vitrine</p><h2>Imprimantes du moment</h2>
  <p>Le stock change souvent. Écrivez-nous sur WhatsApp pour connaître les arrivages et les prix du jour.</p></div></div>
  <div class="fiches">{''.join(affiche(f) for f in P['imprimantes'])}</div>
</div></section>
<section class="section"><div class="wrap contact-grille">
  <div><p class="etiquette">Passez nous voir</p><h2>En face de la Poste Centrale, à {B['ville']}.</h2>
  <p style="max-width:52ch">Venez voir et tester le matériel en boutique, ou commandez directement par WhatsApp. On vous répond, on vous conseille et on vous met le produit de côté.</p>
  <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:1rem"><a class="btn btn-noir" href="contact.html">Itinéraire & horaires</a></div></div>
  <div class="carte-info">
    {tuile('whatsapp', 'WhatsApp principal', w['affiche'])}
    {tuile('combine', 'Appels & commandes', a['affiche'] + ('<br>Aussi : ' + autres if autres else ''))}
    {tuile('repere', 'Adresse', B['adresse'])}
    {tuile('tiktok', 'TikTok', B['tiktok']['pseudo'])}
  </div>
</div></section>'''
    page('index.html', f'{B["nom"]} – Informatique à {B["ville"]}',
         f'Ordinateurs portables, desktops, téléphones, imprimantes, vidéoprojecteurs et baffles à {B["ville"]}, en face de la Poste Centrale. Journée ThinkPad tous les mardis. 100% Original.',
         'accueil', corps, schema=True)

def page_produits():
    filtres = '<button type="button" aria-pressed="true" data-filtre="tout">Tout</button>' + ''.join(
        f'<button type="button" aria-pressed="false" data-filtre="{r["id"]}">{r["titre"]}</button>' for r in B['rayons'])
    rayons = ''
    for r in B['rayons']:
        k = r['id']
        tete = f'''<div class="rayon-tete"><span class="ico">{ico(r["icone"])}</span><div><h2>{r["titre"]}</h2><p>{r["texte"]}</p></div>
  <a class="btn btn-vert" href="{wa(f"Bonjour {B['nom']}, je cherche : {r['titre'].lower()}. Qu'avez-vous en stock ?")}" target="_blank" rel="noopener">{WA_ICO}Stock du jour</a></div>'''
        if k == 'portables':
            lp = P['portables']
            chips = f'<button type="button" aria-pressed="true" data-usage="tout">Tous ({len(lp)})</button>' + ''.join(
                f'<button type="button" aria-pressed="false" data-usage="{u}">{t}</button>'
                for u, t in USAGES.items() if any(u in m['usages'] for m in lp))
            rappel = ('<a class="rappel-tp" href="index.html#journee-thinkpad"><i class="point" aria-hidden="true"></i><span><b>Mardi = Journée ThinkPad.</b> '
                      'Les Lenovo ThinkPad sont soldés tous les mardis, uniquement ce jour-là.</span><span class="quand" data-mardi-court>Voir →</span></a>'
                      if B['journee_thinkpad']['actif'] else '')
            contenu = (f'{rappel}<div class="filtres sous" role="group" aria-label="Filtrer les portables par usage">{chips}</div>'
                       f'<div class="machines">{"".join(machine(m) for m in lp)}</div>'
                       '<p class="note" style="margin-top:14px">Le stock évolue chaque semaine. Vous ne voyez pas votre modèle ? Demandez-le sur WhatsApp, on vous le trouve.</p>')
        else:
            contenu = '<div class="gammes">' + ''.join(f'<div class="gamme"><h3>{g["titre"]}</h3><p>{g["texte"]}</p></div>' for g in r['gammes']) + '</div>'
            if k == 'projecteurs' and P['projecteurs']:
                contenu += f'<div class="machines" style="margin-top:18px">{"".join(machine(m) for m in P["projecteurs"])}</div>'
            if k == 'imprimantes' and P['imprimantes']:
                contenu += f'<div class="fiches" style="margin-top:18px">{"".join(affiche(f) for f in P["imprimantes"])}</div>'
        rayons += f'<section class="rayon" id="{k}" data-rayon="{k}">\n  {tete}\n  {contenu}\n</section>\n'
    corps = f'''<section class="titre-page"><div class="wrap">
  {RUBAN}
  <h1>Nos produits</h1>
  <p class="sous-titre">(Garantis, 100% Original)</p>
  <p class="barres"><span>Choisissez un rayon</span><span>Demandez le stock du jour</span><span>Passez en boutique</span></p>
  <div class="filtres" role="group" aria-label="Filtrer par rayon">{filtres}</div>
</div></section>
<div class="wrap" style="padding-bottom:40px">{rayons}</div>'''
    page('produits.html', f'Produits – {B["nom"]}',
         f'Catalogue de {B["nom"]} à {B["ville"]} : ordinateurs portables, desktops, téléphones, imprimantes, vidéoprojecteurs, baffles.',
         'produits', corps)

def page_contact():
    w, a = B['whatsapp'], B['appels']
    autres = '<br>'.join(f'<a href="tel:{n["numero"]}" style="color:var(--noir)">{n["affiche"]}</a>' for n in B['autres_numeros'])
    opts = ''.join(f'<option>{r["titre"]}</option>' for r in B['rayons'])
    horaires = ('<!-- À CONFIRMER PAR LA BOUTIQUE : horaires -->' if B['horaires'].get('a_confirmer') else '') + tuile('horloge', 'Horaires', B['horaires']['texte'])
    corps = f'''<section class="titre-page"><div class="wrap">
  {RUBAN}
  <h1>Contact & accès</h1>
  <p class="sous-titre">(On vous répond sur WhatsApp)</p>
  <p class="barres"><span>Appel</span><span>WhatsApp</span><span>Boutique</span></p>
</div></section>
<section class="section" style="padding-top:28px"><div class="wrap contact-grille">
  <div style="display:grid;gap:22px">
    <div class="carte-info">
      <div class="tuile"><span class="ico">{ico('whatsapp')}</span><div><h3>WhatsApp principal</h3><p><a href="https://wa.me/{w['numero']}" target="_blank" rel="noopener" style="color:var(--noir);font-weight:700">{w['affiche']}</a><button class="copier" type="button" data-copier="+{w['numero']}">Copier</button></p></div></div>
      <div class="tuile"><span class="ico">{ico('combine')}</span><div><h3>Appels & commandes</h3><p><a href="tel:{a['numero']}" style="color:var(--noir);font-weight:700">{a['affiche']}</a><button class="copier" type="button" data-copier="{a['numero']}">Copier</button><br><span style="font-size:.88rem">Commandes, prix, disponibilité</span></p></div></div>
      {'<div class="tuile"><span class="ico">' + ico('combine') + '</span><div><h3>Autres numéros</h3><p>' + autres + '</p></div></div>' if autres else ''}
      {tuile('repere', 'Adresse', B['adresse_longue'])}
      {horaires}
      <div class="tuile"><span class="ico">{ico('tiktok')}</span><div><h3>TikTok</h3><p><a href="{B['tiktok']['url']}" target="_blank" rel="noopener" style="color:var(--noir)">{B['tiktok']['pseudo']}</a></p></div></div>
    </div>
    <div><h2 style="font-size:1.5rem">Comment nous trouver</h2>
    <ol class="etapes" style="margin-top:14px">
      <li><span>Rendez-vous à la <b style="color:var(--noir)">Poste Centrale de {B['ville']}</b>.</span></li>
      <li><span>Placez-vous face à l’entrée de la Poste : la boutique est juste en face.</span></li>
      <li><span>Repérez l’enseigne verte <b style="color:var(--noir)">SCS – {B['nom']}</b>.</span></li>
    </ol>
    <p style="margin-top:14px"><a class="btn btn-contour" href="https://www.google.com/maps/search/?api=1&amp;query=Poste+Centrale+Bertoua+Cameroun" target="_blank" rel="noopener">{ico('repere').replace('<svg ', '<svg fill="none" stroke="currentColor" stroke-width="1.9" ')}Ouvrir dans Google Maps</a></p></div>
  </div>
  <form class="formulaire" id="form-wa" novalidate>
    <div><h2 style="font-size:1.5rem">Demander un prix</h2><p class="note" style="margin-top:.3rem">Remplissez le formulaire : il prépare votre message et l’ouvre dans WhatsApp.</p></div>
    <div class="duo">
      <div><label for="nom">Votre nom</label><input id="nom" name="nom" autocomplete="name" placeholder="Ex. : Mme Ngono"></div>
      <div><label for="quartier">Votre quartier / ville</label><input id="quartier" name="quartier" placeholder="Ex. : Bertoua"></div>
    </div>
    <div><label for="rayon">Rayon</label><select id="rayon" name="rayon">{opts}<option>Autre</option></select></div>
    <div><label for="besoin">Ce que vous cherchez</label><textarea id="besoin" name="besoin" rows="4" placeholder="Ex. : un portable pour les études, budget autour de 250 000 FCFA"></textarea></div>
    <button class="btn btn-vert" type="submit" style="justify-self:start">{WA_ICO}Envoyer sur WhatsApp</button>
    <p class="note" id="form-retour" aria-live="polite"></p>
  </form>
</div></section>'''
    page('contact.html', f'Contact – {B["nom"]}',
         f'Contactez {B["nom"]} à {B["ville"]} : WhatsApp {w["affiche"]}, appels {a["affiche"]}, en face de la Poste Centrale.',
         'contact', corps)

def page_404():
    corps = f'''<section class="titre-page" style="padding-bottom:60px"><div class="wrap">
  {RUBAN}
  <h1>Page introuvable</h1>
  <p class="sous-titre">(Erreur 404)</p>
  <p style="max-width:52ch">Cette page n’existe pas ou a été déplacée. Le produit que vous cherchez est peut-être dans le catalogue, ou demandez-le directement sur WhatsApp.</p>
  <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:1.4rem"><a class="btn btn-noir" href="produits.html">Voir les produits</a><a class="btn btn-contour" href="index.html">Retour à l’accueil</a></div>
</div></section>'''
    page('404.html', f'Page introuvable – {B["nom"]}', f'Page introuvable sur le site de {B["nom"]}.', '', corps)


# ------------------------------------------------------------------ fichiers annexes
def annexes():
    url = B['url_site'].rstrip('/')
    if B['demo']:
        robots = 'User-agent: *\nDisallow: /\n'
    else:
        robots = 'User-agent: *\nAllow: /\n' + (f'Sitemap: {url}/sitemap.xml\n' if url else '')
    (PUB / 'robots.txt').write_text(robots, encoding='utf-8')
    if url:
        jour = date.today().isoformat()
        urls = ''.join(f'<url><loc>{url}/{p}</loc><lastmod>{jour}</lastmod></url>' for p in ['', 'produits.html', 'contact.html'])
        (PUB / 'sitemap.xml').write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{urls}</urlset>\n', encoding='utf-8')
    manifest = {'name': B['nom'], 'short_name': 'Scotfield', 'start_url': 'index.html', 'display': 'standalone', 'lang': 'fr',
                'background_color': '#FFFFFF', 'theme_color': '#4E7407',
                'icons': [{'src': 'assets/icones/icone-192.png', 'sizes': '192x192', 'type': 'image/png'},
                          {'src': 'assets/icones/icone-512.png', 'sizes': '512x512', 'type': 'image/png'}]}
    (PUB / 'site.webmanifest').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')


# ------------------------------------------------------------------ principal
def main():
    global DIMS
    if PUB.exists():
        for p in PUB.iterdir():   # on garde public/assets/produits (cache des photos optimisées)
            if p.name != 'assets':
                shutil.rmtree(p) if p.is_dir() else p.unlink()
    PUB.mkdir(exist_ok=True)
    for d in ('css', 'js'):
        shutil.copytree(SRC / d, PUB / d, dirs_exist_ok=True)
    for d in ('logo', 'icones'):
        if (SRC / 'assets' / d).exists():
            shutil.copytree(SRC / 'assets' / d, PUB / 'assets' / d, dirs_exist_ok=True)
    shutil.copy(SRC / 'charte-graphique.html', PUB / 'charte-graphique.html')
    DIMS = preparer_photos()
    manquantes = [f'{m["dossier"]}/{m["id"]}' for groupe in ('portables', 'projecteurs', 'imprimantes') for m in P[groupe] if f'{m["dossier"]}/{m["id"]}' not in DIMS]
    if manquantes:
        sys.exit('Photo manquante dans src/assets/produits/ : ' + ', '.join(manquantes))
    page_accueil(); page_produits(); page_contact(); page_404(); annexes()
    n = sum(len(P[g]) for g in ('portables', 'projecteurs', 'imprimantes'))
    print(f'Site construit dans public/ : 4 pages, {n} produits, {len(DIMS)} photos.'
          + ('  [MODE DÉMO : bandeau démo + noindex]' if B['demo'] else ''))

if __name__ == '__main__':
    main()
