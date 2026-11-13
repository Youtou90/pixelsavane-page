# PS-DOC-001 — Film institutionnel PixelSavane (180 s)
## Phases 1 à 4 : audit, préproduction, prototype, présentation pour validation

Rédigé par l'ingénieur de production (Claude Code), à l'attention du directeur artistique et d'Oscar YOUTOU.
**Statut : en attente de validation. La production intégrale n'est pas lancée.**

---

## PHASE 1 — AUDIT TECHNIQUE

### 1.1 Machine

| Élément | Constat | Conséquence |
|---|---|---|
| Type | Conteneur cloud Linux (Ubuntu 24.04), éphémère | Tout livrable doit être commité et poussé sur Git |
| Processeur | 4 cœurs Intel Xeon 2,1 GHz | Rendu Remotion mesuré : **15 s de film en ~45 s**, soit ~10 min estimées pour le master de 180 s |
| Mémoire | 15 Go, sans swap | Suffisant pour Remotion et FFmpeg en 1080p |
| Carte graphique | **Aucune** (ni GPU, ni accélération) | Pas de génération d'images ou de vidéos par IA en local (Stable Diffusion sur CPU : plusieurs minutes par image, et modèles inaccessibles, voir 1.3). Blender seulement en rendu CPU lent |
| Disque | ~29 Go disponibles | Suffisant (rushes 1080p, versions intermédiaires) |
| Réseau | Registres npm et PyPI accessibles. **Bloqués** : huggingface.co, github.com (téléchargements), pexels, unsplash, naciscdn | Pas de téléchargement de voix TTS, de banques d'images ni de modèles sans ouverture d'accès |

### 1.2 Logiciels disponibles

| Outil | Statut | Usage prévu |
|---|---|---|
| FFmpeg 6.1 | ✅ x264, x265, ProRes, VP9, AV1, AAC, sous-titres, loudnorm | Encodage, master, déclinaisons, normalisation sonore, incrustation SRT |
| Node.js 22 + npm | ✅ | Remotion 4 + React 18 (moteur de motion design) |
| Chromium headless | ✅ préinstallé | Rendu Remotion |
| Python 3.13 | ✅ numpy, scipy, Pillow, onnxruntime | Traitement d'images, synthèse sonore, moteur TTS local (si voix disponible) |
| ImageMagick, git, git-lfs | ✅ | Traitement d'images, versionnage des médias lourds |
| Polices de la charte | ✅ installées : Space Grotesk, Sora, Inter (licence libre OFL, via `@fontsource`) | Titres, sous-titres, textes |
| Fond de carte Afrique | ✅ `world-atlas` (données Natural Earth, domaine public, licence ISC) | Séquence 06 |
| DaVinci Resolve | ❌ indisponible (interface graphique, pas de Linux sans tête) | Remplacé par Remotion + FFmpeg (étalonnage par LUT et filtres) |
| Blender | ❌ absent, installable mais rendu CPU seul | Non recommandé, sauf besoin 3D ponctuel |
| Synthèse vocale locale | ⚠️ moteur Piper installable via PyPI, mais **voix françaises hébergées sur huggingface.co (bloqué)** | Voir décision D3 |

### 1.3 Ressources

| Ressource | Statut | Remarque |
|---|---|---|
| Logo `1000324473.png` | ❌ **non transmis** dans l'environnement | Le prototype utilise le logo officiel du dépôt, `assets/img/logo-pixelsavane.jpg` (1080×1080), qui porte **déjà** la nouvelle signature. Le pipeline accepte n'importe quel fichier source : `python3 scripts/extract_layers.py <fichier>` |
| Portrait `1000323407.png` | ❌ **non transmis** | Deux portraits d'Oscar sont dans le dépôt : `oscar-portrait-pro.jpg` (820×1081, fond studio sombre, idéal) et `oscar-youtou.jpg` (800×999, cadre domestique). **Résolution limite** : utilisable en demi-écran ou en cadrage ¾ sans agrandissement, insuffisante en plein écran 1080p net |
| Script de narration (dossier éditorial PS-DOC-001) | ❌ **non transmis** | Bloquant pour le minutage, la voix et les sous-titres |
| Présentations de charte graphique | ❌ **non transmises** | Le prototype applique les couleurs et les typographies listées dans le dossier de production |
| Images d'entreprises africaines (séq. 01, 02, 06) | ❌ aucune source autorisée | Voir décision D4 |
| Visuels de réalisations PixelSavane | ⚠️ présents dans le dépôt (`demo-*.jpg`, `ia-*.jpg`, `real-*.jpg`, `kameleo-*.jpg`) | Utilisables en séquences 03 et 04 **seulement si Oscar confirme** que ce sont des créations de l'agence, et avec la mention « exemple de création » (jamais présentés comme résultats clients) |

Aucun fichier source n'a été écrasé : les calques du logo sont des fichiers dérivés, dans `motion/ps-001-a/public/`.

---

## PHASE 2 — PRÉPRODUCTION

### 2.1 Architecture de production proposée

Un **seul projet Remotion** sert de moteur. Chaque séquence est un composant React, et les déclinaisons sont des compositions du même code.

```
motion/
├── ps-001-a/                    ← prototype de l'ouverture (livré, v1.0 et v1.1)
└── ps-doc-001/                  ← film complet (à créer après validation)
    ├── src/
    │   ├── system/              ← bibliothèque réutilisable (point 9 du dossier)
    │   │   ├── brand.ts         (couleurs, polices, courbes, durées, grille)
    │   │   ├── PixelField.tsx   (particules carrées 3D, dispersion et convergence vers une forme)
    │   │   ├── LogoReveal.tsx   (logo animé : l'ouverture PS-001-A)
    │   │   ├── PixelWipe.tsx    (transitions par pixels)
    │   │   ├── KineticTitle.tsx (titres cinétiques Space Grotesk / Sora)
    │   │   ├── LowerThird.tsx   (identification « Oscar YOUTOU — Fondateur et Directeur Créatif »)
    │   │   ├── ServiceCard.tsx  (présentation des services, icônes géométriques)
    │   │   ├── StepTimeline.tsx (méthode 01 → 04)
    │   │   ├── AfricaMap.tsx    (carte en pixels + connexions orange)
    │   │   ├── PhotoPlate.tsx   (photo : Ken Burns lent, étalonnage noir et orange, grain)
    │   │   └── Subtitles.tsx    (sous-titres incrustés, synchronisés sur le fichier SRT)
    │   ├── sequences/S01…S07.tsx
    │   ├── Master.tsx           ← 180 s, 16:9
    │   └── Variants.tsx         ← 9:16, 1:1, bande-annonce 30 s, intro et outro seules, logo animé
    ├── public/                  ← ressources officielles (copies, jamais modifiées) et dérivés
    ├── audio/                   ← musique, ambiances, voix (brutes et traitées), mixage
    ├── subtitles/ps-doc-001.fr.srt
    ├── scripts/                 ← découpe du logo, synthèse et mixage audio, export des déclinaisons
    └── out/                     ← livrables
```

- **Mise en page responsive.** Chaque composant lit le format (`16:9`, `9:16` ou `1:1`) et recompose sa mise en page, au lieu de recadrer bêtement le master.
- **Son.** Trois pistes : musique, ambiances et voix. Le mixage se fait dans FFmpeg, avec atténuation de la musique sous la voix (sidechain), normalisation à −14 LUFS pour le web et crête à −1 dBTP.
- **Sous-titres.** Un fichier `.srt` français unique sert à la fois au fichier livré à part et à l'incrustation dans la version sous-titrée.

### 2.2 Bible visuelle (appliquée dans le prototype)

| Élément | Règle |
|---|---|
| Fond | Noir profond #0E0E10, vignettage léger, noir absolu #000 seulement en ouverture et en fermeture |
| Accent | Orange Savane #F28C28, en lumière maîtrisée : halos radiaux à 20–40 % d'opacité, jamais d'aplats massifs |
| Textes | Blanc #FAFAFA, gris graphite #70757A pour les textes secondaires, vert forêt #3F7C48 en touches rares (connexions de la carte, détails) |
| Typographie | Space Grotesk Bold pour les titres, Sora SemiBold pour les sous-titres, Inter Regular pour les textes, la signature et les sous-titres |
| Pixels | Toujours carrés, sans rotation, avec profondeur par perspective et flou. Les tailles reprennent celles des carrés du logo |
| Mouvement | Apparitions en `cubic-bezier(.16,1,.3,1)`, déplacements en `(.65,0,.35,1)`. Caméra lente : travelling ≤ 7 % par plan |
| Transitions | Balayage par pixels (`PixelWipe`), dissolution en particules, fondu au noir entre les chapitres |
| Photos | Étalonnage noir et orange, Ken Burns lent, aucun texte généré dans l'image : tous les textes sont ajoutés au montage |
| Logo | Calques extraits du fichier officiel, à l'échelle 1:1 sur l'image finale, proportions intactes |

### 2.3 Storyboard (proposition à valider, minutage final après réception du script)

| Séq. | Temps | Image | Habillage | Musique |
|---|---|---|---|---|
| 01 L'attention | 00:00–00:25 | **0–15 s : ouverture PS-001-A** (validée en prototype). 15–25 s : les pixels quittent le logo et forment une mosaïque qui se résout en images d'entreprises africaines (voir D4) | Titre cinétique d'accroche | Mystérieuse : nappe, pings |
| 02 La conviction | 00:25–00:50 | Plans d'entrepreneurs, PME, commerçants, puis **portrait réel d'Oscar** (`oscar-portrait-pro`, fidèle, sans retouche IA) révélé par balayage de pixels, en cadrage mi-écran | Bandeau « Oscar YOUTOU — Fondateur et Directeur Créatif » | Montée douce |
| 03 Expertises créatives | 00:50–01:25 | 4 cartes services : publicité IA, UGC et avatars IA, photo produit, réseaux sociaux. Illustrées par des créations PixelSavane confirmées par Oscar, marquées « exemple de création » | Titres Space Grotesk, compteur 01–04 | Dynamique, intensification |
| 04 Solutions numériques | 01:25–02:00 | Maquettes animées en vecteur : site web, page de vente, application, agent IA (bulle de conversation), automatisation (flux de nœuds) | Interfaces dessinées en SVG, aucune capture inventée | Rythmée |
| 05 Méthode | 02:00–02:25 | Frise 01 STRATÉGIE → 02 CRÉATION → 03 PRODUCTION → 04 LIVRAISON, chaque étape construite par des pixels | Infographie | Pulsée, régulière |
| 06 Ambition | 02:25–02:45 | Carte de l'Afrique **en pixels carrés**, pays francophones allumés en orange, connexions animées entre villes | Données géographiques Natural Earth (domaine public) | Ample, inspirante |
| 07 Signature | 02:45–03:00 | Retour au noir, puis animation des pixels, logo officiel et signature (outro réutilisable, même moteur que l'ouverture) | « Le numérique au service de votre croissance. » + contact (à confirmer) | Résolution finale |

Règle éthique appliquée : aucune scène ne montre Oscar dans une situation qu'il n'a pas vécue, aucune image illustrative n'est présentée comme un témoignage ou une preuve de réalisation client.

---

## PHASE 3 — PROTOTYPE : ouverture 15 s

Livré dans `motion/ps-001-a/` (détails dans `RAPPORT_TECHNIQUE.md`).

| Version | Différence | Fichiers |
|---|---|---|
| **v1.1 (recommandée, conforme à la charte)** | Signature en **Inter Regular**, calée au pixel sur la position et la largeur de la signature du logo (802 px, capitales de 22 px) | `out/PixelSavane_Ouverture_PS-001-A_v1.1_Inter_1080p25.mp4`, `out/derniere-image_v1.1_Inter.png` |
| v1.0 | Signature en Montserrat Regular, plus proche du dessin d'origine du logo | `out/PixelSavane_Ouverture_PS-001-A_v1.0_Montserrat_1080p25.mp4`, `out/derniere-image_v1.0_Montserrat.png` |

Contrôles effectués : 1920×1080, 25 fps, 375 images, H.264 High en yuv420p BT.709, AAC 48 kHz stéréo à −16,5 LUFS (crête −1,1 dBFS), noir vidéo pur de 0 à 2 s, logo final à l'échelle 1:1.

---

## PHASE 4 — DÉCISIONS ATTENDUES (DA et Oscar)

| # | Question | Recommandation de l'ingénieur |
|---|---|---|
| **D1** | Transmettre `1000324473.png` (logo) et `1000323407.png` (portrait) dans le dépôt, par exemple dans `motion/sources/` | Indispensable pour garantir l'usage des fichiers officiels. Le portrait en haute définition (≥ 1920 px de haut) permettrait le plein cadre |
| **D2** | Transmettre le script de narration validé et les présentations de charte | Bloquant pour le minutage, la voix et les sous-titres |
| **D3** | Voix off | **Recommandé : Oscar enregistre lui-même** (smartphone, pièce calme, ~3 min). Je traite le son (réduction de bruit, égalisation, compression, normalisation) : authentique et gratuit. Solution de repli : voix masculine française du moteur libre Piper, ce qui demande d'autoriser l'accès à huggingface.co dans l'environnement et de vérifier la licence de chaque voix |
| **D4** | Images d'entreprises et d'entrepreneurs africains | Aucune génération IA locale possible (pas de GPU) et aucune API payante autorisée. Options : (a) photos et vidéos réelles d'Oscar ou de clients ayant donné leur accord ; (b) banques gratuites Pexels / Unsplash, dont la licence autorise l'usage commercial, après ouverture de l'accès réseau ; (c) traitement 100 % motion design (silhouettes et scènes stylisées en pixels). **Recommandé : (a) + (c)**, puis (b) en complément |
| **D5** | Signature : Inter (v1.1, charte) ou Montserrat (v1.0, dessin du logo) | v1.1 Inter, par cohérence avec tous les textes du film |
| **D6** | Musique : composition originale synthétisée localement (comme le sound design du prototype) ou morceau sous licence libre fourni par la DA | Composition originale : aucun risque de droits, progression calée image par image |
| **D7** | Contact en fin de film (site, WhatsApp) | À fournir si souhaité |

À réception de la validation et des ressources D1 à D3, je lance la **Phase 5** séquence par séquence, avec une présentation pour validation après chacune.
