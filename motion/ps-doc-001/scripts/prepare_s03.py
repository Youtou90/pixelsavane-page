"""Prépare les ressources de la séquence S03 (aucune génération, aucune retouche des visuels).
- Copie à l'identique des créations PixelSavane retenues (dépôt du site) dans public/s03/.
- Génère une texture de grain argentique (bruit gaussien, création locale) pour la finition cinéma.
Les visuels montrant une marque réelle (Coca-Cola, Dior, Heinz, Crocs, cube de type Rubik's) sont EXCLUS.
"""
import shutil, json, hashlib
import numpy as np
from PIL import Image

SEL = {
    # démonstration 1 — publicité cinématographique, produit physique (marque Wata Fufu : statut à confirmer)
    'watafufu-conditionnement.jpg': '../../assets/img/demo-watafufu-conditionnement.jpg',
    'watafufu-accord.jpg': '../../assets/img/demo-watafufu-accord.jpg',
    # démonstration 2 — UGC / avatar IA
    'ugc-selfie.jpg': '../../assets/img/ugc-selfie.jpg',
    'avatar-portrait-rue.jpg': '../../assets/img/ia-portrait-rue.jpg',
    # démonstration 3 — photographie commerciale premium
    'photo-beaute.jpg': '../../assets/img/demo-portrait-beaute.jpg',
    'photo-noir-blanc.jpg': '../../assets/img/ia-portrait-noir-blanc.jpg',
    'photo-affiche-mode.jpg': '../../assets/img/ia-affiche-mode.jpg',
    # démonstration 4 — contenus réseaux sociaux
    'social-projecteur.jpg': '../../assets/img/projecteur-noel.jpg',
    'social-voyage.jpg': '../../assets/img/demo-voyage.jpg',
    'social-salon.jpg': '../../assets/img/ia-lifestyle-salon.jpg',
}
manifest = []
for dst, src in SEL.items():
    shutil.copyfile(src, f'public/s03/{dst}')
    im = Image.open(src)
    manifest.append(dict(file=dst, source=src.replace('../../', ''), size=im.size,
                         sha256=hashlib.sha256(open(src, 'rb').read()).hexdigest()))
json.dump(manifest, open('public/s03/manifest.json', 'w'), indent=1, ensure_ascii=False)

# grain : 512×512, gris neutre, tuilé et décalé à chaque image
rng = np.random.default_rng(3)
g = np.clip(128 + rng.normal(0, 38, (512, 512)), 0, 255).astype(np.uint8)
Image.fromarray(g, 'L').save('public/s03/grain.png')
for m in manifest: print(f"{m['file']:28s} {m['size'][0]}×{m['size'][1]}  <- {m['source']}")
