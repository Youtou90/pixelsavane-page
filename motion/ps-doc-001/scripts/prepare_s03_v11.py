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
