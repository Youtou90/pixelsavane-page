"""S03 v1.1 : intègre les images fournies par Oscar (motion/sources/s03-v1.1/), sans aucune retouche.
Copie chaque image attendue dans public/s03v11/ et écrit public/s03v11/available.json
(nom, taille, empreinte). Une image absente est signalée ; la séquence affiche alors un cadre « Image à fournir ».
"""
import json, hashlib, shutil, os
from PIL import Image

# Ordre de correction DA « S03 v1.1 » (rév. 2) : Wata Fufu = matériel réel (voir plus bas) ;
# UGC = A créatrice (3 images) + B avatar IA (image ou vidéo) ; cosmétique = ÉCLAT ; réseaux sociaux = Maison Adjoa.
EXPECTED = {
    'ugc-1': '9:16', 'ugc-2': '9:16', 'ugc-3': '9:16',
    'avatar-ia': '9:16',
    'eclat-produit': '4:5', 'eclat-portrait': '4:5',
    'adjoa-45': '4:5', 'adjoa-11': '1:1', 'adjoa-916': '9:16',
}
OPTIONAL = {'eclat-affiche-fond': '4:5'}
EXPECTED.update(OPTIONAL)
SRC = '../sources/s03-v1.1'
os.makedirs('public/s03v11', exist_ok=True)
avail = {}
for name, ratio in EXPECTED.items():
    found = next((f'{SRC}/{name}{ext}' for ext in (('.mp4', '.mov', '.png', '.jpg', '.jpeg', '.webp') if name == 'avatar-ia' else ('.png', '.jpg', '.jpeg', '.webp')) if os.path.exists(f'{SRC}/{name}{ext}')), None)
    if not found:
        print(f'  manquante : {name} ({ratio})'); continue
    ext = os.path.splitext(found)[1]
    dst = f'public/s03v11/{name}{ext}'
    shutil.copyfile(found, dst)
    if ext in ('.mp4', '.mov'):
        w, h = 1080, 1920  # vidéo verticale attendue (dimensions vérifiées au rendu)
    else:
        w, h = Image.open(found).size
    avail[name] = dict(file=f's03v11/{name}{ext}', w=w, h=h, ratio=ratio, video=ext in ('.mp4', '.mov'),
                       sha256=hashlib.sha256(open(found, 'rb').read()).hexdigest())
    print(f'  OK : {name}{ext} {w}×{h}')
json.dump(avail, open('public/s03v11/available.json', 'w'), indent=1)
print(f'{len(avail)}/{len(EXPECTED)} images disponibles')

# ——— Wata Fufu : matériel réel transmis le 13/11 (publications de la campagne) ———
# Recadrages exacts des zones photographiques (pixels inchangés, enregistrés sans perte en PNG)
# + copies intégrales des publications. Source : motion/sources/s03-v1.1/recus-2026-11-13/
R = '../sources/s03-v1.1/recus-2026-11-13'
CROPS = {
    'wf-texture.png': ('1000250139.jpg', (95, 255, 935, 745)),      # gros plan texture du fufu
    'wf-boules.png': ('1000250101.jpg', (140, 300, 905, 712)),     # conditionnement en boules
    'wf-sac.png': ('1000250140.jpg', (55, 215, 965, 875)),          # sac en volume (plan large)
    'wf-sac-gros-plan.png': ('1000250100.jpg', (255, 250, 750, 640)),  # gros plan du sac : tissage, coutures, étiquette
}
wf = {}
for dst, (src, box) in CROPS.items():
    if not os.path.exists(f'{R}/{src}'): continue
    im = Image.open(f'{R}/{src}').convert('RGB').crop(box)
    im.save(f'public/s03v11/{dst}')
    wf[dst[:-4]] = dict(file=f's03v11/{dst}', w=im.width, h=im.height, src=src, box=box)
for src in ['1000250101.jpg', '1000250139.jpg', '1000250152.jpg']:
    if os.path.exists(f'{R}/{src}'):
        shutil.copyfile(f'{R}/{src}', f'public/s03v11/wf-post-{src}')
        w, h = Image.open(f'{R}/{src}').size
        wf[f'post-{src[:-4]}'] = dict(file=f's03v11/wf-post-{src}', w=w, h=h, src=src)
json.dump(wf, open('public/s03v11/watafufu-reel.json', 'w'), indent=1)
print('Wata Fufu (réel) :', ', '.join(wf))

# ——— Mise à jour du registre (statut, fichier original, dimensions, SHA-256) ———
# Les champs outil, date de génération, licence et contrôle visuel ne sont JAMAIS remplis automatiquement.
REG = '../sources/s03-v1.1/REGISTRE_RESSOURCES.json'
if os.path.exists(REG):
    reg = json.load(open(REG))
    for r in reg['ressources']:
        a = avail.get(r['nom'])
        if a:
            src = next(f'{SRC}/{r["nom"]}{e}' for e in ('.mp4', '.mov', '.png', '.jpg', '.jpeg', '.webp') if os.path.exists(f'{SRC}/{r["nom"]}{e}'))
            if r.get('sha256') and r['sha256'] != a['sha256']:
                print(f'  ⚠️  {r["nom"]} : fichier remplacé (nouvelle empreinte) — contrôle visuel et licence à refaire')
                r['controle_visuel'] = {k: None for k in r['controle_visuel']}
            r.update(statut='reçue', fichier_original=src.replace('../', 'motion/'), sha256=a['sha256'], dimensions=[a['w'], a['h']])
        else:
            r.update(statut='manquante', fichier_original=None, sha256=None, dimensions=None)
    json.dump(reg, open(REG, 'w'), indent=1, ensure_ascii=False)
    print('registre mis à jour :', sum(r['statut'] == 'reçue' for r in reg['ressources'] if r['obligatoire']), '/',
          sum(r['obligatoire'] for r in reg['ressources']), 'ressources principales reçues')
