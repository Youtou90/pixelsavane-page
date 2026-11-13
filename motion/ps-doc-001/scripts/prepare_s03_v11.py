"""S03 v1.1 : intègre les images fournies par Oscar (motion/sources/s03-v1.1/), sans aucune retouche.
Copie chaque image attendue dans public/s03v11/ et écrit public/s03v11/available.json
(nom, taille, empreinte). Une image absente est signalée ; la séquence affiche alors un cadre « Image à fournir ».
"""
import json, hashlib, shutil, os
from PIL import Image

EXPECTED = {
    'watafufu-hero': '16:9', 'watafufu-texture': '16:9', 'watafufu-conditionnement': '16:9', 'watafufu-service': '16:9',
    'ugc-1': '9:16', 'ugc-2': '9:16', 'ugc-3': '9:16',
    'saye-produit': '4:5', 'saye-portrait': '4:5', 'saye-editorial': '4:5',
    'adjoa-45': '4:5', 'adjoa-11': '1:1', 'adjoa-916': '9:16',
}
SRC = '../sources/s03-v1.1'
os.makedirs('public/s03v11', exist_ok=True)
avail = {}
for name, ratio in EXPECTED.items():
    found = next((f'{SRC}/{name}{ext}' for ext in ('.png', '.jpg', '.jpeg', '.webp') if os.path.exists(f'{SRC}/{name}{ext}')), None)
    if not found:
        print(f'  manquante : {name} ({ratio})'); continue
    ext = os.path.splitext(found)[1]
    dst = f'public/s03v11/{name}{ext}'
    shutil.copyfile(found, dst)
    w, h = Image.open(found).size
    avail[name] = dict(file=f's03v11/{name}{ext}', w=w, h=h, ratio=ratio,
                       sha256=hashlib.sha256(open(found, 'rb').read()).hexdigest())
    print(f'  OK : {name}{ext} {w}×{h}')
json.dump(avail, open('public/s03v11/available.json', 'w'), indent=1)
print(f'{len(avail)}/{len(EXPECTED)} images disponibles')

# ——— Wata Fufu : matériel réel transmis le 13/11 (publications de la campagne) ———
# Recadrages exacts des zones photographiques (pixels inchangés, enregistrés sans perte en PNG)
# + copies intégrales des publications. Source : motion/sources/s03-v1.1/recus-2026-11-13/
R = '../sources/s03-v1.1/recus-2026-11-13'
CROPS = {
    'wf-texture.png': ('1000250139.jpg', (95, 255, 935, 745)),      # gros plan texture
    'wf-boules.png': ('1000250101.jpg', (140, 300, 905, 712)),     # conditionnement en boules
    'wf-sac.png': ('1000250140.jpg', (55, 215, 965, 875)),          # sac en volume
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
