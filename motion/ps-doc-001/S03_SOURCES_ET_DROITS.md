# S03 — Sources des visuels et statut des droits

Séquence : « La créativité au service des marques » (v1.0, maquette muette de 35 s).

## 1. Visuels utilisés

Toutes les images proviennent des **créations PixelSavane déjà publiées sur le site de l'agence** (dossier `assets/img/` du dépôt). Elles sont copiées **à l'identique** dans `public/s03/` par `scripts/prepare_s03.py`. Aucune image n'a été générée, retouchée ni téléchargée pour cette séquence.

| Fichier S03 | Source dans le dépôt | Taille | SHA-256 |
|---|---|---|---|
| `watafufu-conditionnement.jpg` | `assets/img/demo-watafufu-conditionnement.jpg` | 1080×1080 | `60a7e4a812eb…` |
| `watafufu-accord.jpg` | `assets/img/demo-watafufu-accord.jpg` | 864×1079 | `a91ff6d359bb…` |
| `ugc-selfie.jpg` | `assets/img/ugc-selfie.jpg` | 768×1376 | `6fb596eb2184…` |
| `avatar-portrait-rue.jpg` | `assets/img/ia-portrait-rue.jpg` | 670×1200 | `1d35656a8acf…` |
| `photo-beaute.jpg` | `assets/img/demo-portrait-beaute.jpg` | 864×1079 | `336840a31fdd…` |
| `photo-noir-blanc.jpg` | `assets/img/ia-portrait-noir-blanc.jpg` | 895×1200 | `e599cac8cb41…` |
| `photo-affiche-mode.jpg` | `assets/img/ia-affiche-mode.jpg` | 966×1200 | `371072419b01…` |
| `social-projecteur.jpg` | `assets/img/projecteur-noel.jpg` | 899×1080 | `1ef78f1df5bf…` |
| `social-voyage.jpg` | `assets/img/demo-voyage.jpg` | 1080×1080 | `081d960a45ef…` |
| `social-salon.jpg` | `assets/img/ia-lifestyle-salon.jpg` | 669×1200 | `524e4b66d347…` |

| Démonstration | Visuels | Ce qui est montré à l'écran | Statut |
|---|---|---|---|
| 01 Publicité cinématographique · produit physique | `watafufu-conditionnement`, `watafufu-accord` | Diptyque 2,39:1, mouvements de caméra, fuite de lumière, grain | ⚠️ **À confirmer par Oscar.** Wata Fufu apparaît sur le site comme nom de l'agent IA comptable de PixelSavane et comme « marque Wata Fufu ». S'agit-il d'une marque réelle (la sienne, ou celle d'un client) ou d'une marque inventée ? Si c'est un client, son accord écrit est nécessaire ; sinon, la mention « marque fictive » sera ajoutée |
| 02 Publicité UGC · créateur ou avatar IA | `ugc-selfie`, `avatar-portrait-rue` | Téléphone générique, sous-titres de démonstration, « Thé glacé · marque fictive », compte `@createur.demo` | Personnes générées par IA, produit et compte fictifs. Aucune plateforme réelle n'est imitée (interface générique, sans logo) |
| 03 Photographie commerciale premium | `photo-beaute`, `photo-noir-blanc`, `photo-affiche-mode` | Mise en page éditoriale, campagne « ÉCLAT · Sérum visage · marque fictive » | Images générées par IA. « ÉCLAT » est un nom de démonstration présenté comme fictif. Le slogan « FASHION CONSUMES. » fait partie de l'image d'origine du site |
| 04 Contenus réseaux sociaux | `social-projecteur`, `social-voyage`, `social-salon` | Trois formats : 4:5, 1:1, 9:16, compte `@marque.demo` | Produit sans marque (mini projecteur), compte fictif. **Aucun chiffre d'audience ni résultat n'est affiché** |

Chaque démonstration porte à l'écran une mention « Démonstration PixelSavane · visuels générés par IA · marque fictive ». Ainsi, aucune image n'est présentée comme un témoignage ou une réalisation pour un client.

## 2. Visuels du site EXCLUS (marques réelles)

| Fichier | Marque réelle visible | Décision |
|---|---|---|
| `images/demo-soda.jpg` | Coca-Cola (logo, bouteille, « Depuis 1886 ») | Exclu |
| `assets/img/demo-parfum.jpg` | Dior « Sauvage » | Exclu |
| `images/demo-ketchup.jpg` | Flacon de ketchup Heinz | Exclu |
| `assets/img/ia-sabot-rue.jpg`, `ia-sabot-studio.jpg` | Sabots Crocs avec logo | Exclus |
| `assets/img/demo-cube.jpg` | Cube de type Rubik's (forme protégée) | Exclu par prudence |

Recommandation hors film : ces visuels utilisent des marques déposées sans autorisation et sont aussi affichés sur le site public de PixelSavane. Il serait prudent de les remplacer par des marques fictives.

## 3. Points à confirmer par Oscar

1. **Outil et licence de génération** des visuels IA du site : outil utilisé, et droits d'usage commercial accordés par cet outil (formule gratuite ou payante).
2. **Statut de Wata Fufu** (démonstration 01) : voir ci-dessus.
3. **Nouveaux visuels.** La génération de visuels supplémentaires avec des marques fictives et un casting africain (par exemple via le compte Higgsfield connecté : 10 crédits, formule gratuite) n'a **pas** été utilisée. Elle demande votre accord sur le coût et la vérification préalable des conditions d'usage commercial de la formule gratuite.

## 4. Autres ressources

| Ressource | Origine | Droits |
|---|---|---|
| Grain de film `s03/grain.png` | Généré localement (bruit gaussien, `prepare_s03.py`) | Création originale |
| Lettres du wordmark (carton de fin) | Calques découpés dans `motion/sources/1000324473.png` | Propriété PixelSavane |
| Polices Space Grotesk, Sora, Inter | `@fontsource` | SIL Open Font License 1.1 |
