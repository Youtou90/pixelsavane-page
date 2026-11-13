# PS-DOC-001 — Rapport technique · Ouverture v1.2 et proposition S02

**Statut : soumis à la validation du directeur artistique.** Le master de 180 s n'est pas commencé (voir § 7).

---

## 1. Livrables (`motion/ps-doc-001/out/`)

| Livrable | Fichier |
|---|---|
| Vidéo d'ouverture v1.2 définitive (15 s) | `PixelSavane_S01_Ouverture_v1.2_1080p25.mp4` |
| Dernière image en PNG (image 374) | `S01_derniere-image_v1.2.png` |
| Test de lisibilité mobile | `S01_test-lisibilite-mobile_v1.2.png` |
| Proposition visuelle S02 « Fondateur » (25 s, sans son) | `PixelSavane_S02_Fondateur_proposition_1080p25.mp4` |
| Images clés S02 | `S02_styleframe_070.png` (titre), `_260.png` (panneaux), `_470.png` (identification) |
| Archives (v1.1 acceptée comme base) | `archives/` |
| Code source | `src/` (voir § 6) |

## 2. Corrections A demandées par la DA

### A.1–A.2 — Comparaison du logo avec le fichier officiel

Le fichier `1000324473.png` n'a toujours pas été transmis. La comparaison a donc été faite avec **le seul fichier d'Oscar disponible** : le logo qu'il a lui-même téléversé dans le dépôt (compte Youtou90, commit `39584a3` du 27/10/2026).

Constat important : le logo utilisé en v1.0 et v1.1 (`assets/img/logo-pixelsavane.jpg`, version actuelle) **n'était pas ce fichier d'origine**. C'est une version dérivée, créée le 01/11/2026 (commit `f24c2a2`) pour remplacer l'ancienne signature par la nouvelle, puis réenregistrée en JPEG. La mesure pixel par pixel entre les deux versions donne :

| Zone | Écart maximal | Interprétation |
|---|---|---|
| Symbole PS (pixels, P, triangle de lecture, S, dégradés) | ≤ 20/255 sur 268 pixels isolés, moyenne 0,44 | Bruit de recompression JPEG, invisible. Aucune différence de forme, de couleur ni de dégradé |
| Wordmark « PixelSavane » | < 40/255, moyenne < 1 | Idem |
| Zone de signature | jusqu'à 255/255 | Remplacement volontaire du slogan |

**Correction appliquée en v1.2 :** les calques sont désormais extraits **directement du fichier d'origine d'Oscar** (copie intacte, en lecture seule, dans `motion/sources/`). L'ancienne signature est entièrement exclue : aucun pixel de « Des contenus qui font vendre. » ne subsiste dans les calques (vérification : 0 pixel visible sous la ligne y = 786 dans les calques symbole et wordmark). Les calques superposés reconstituent le fichier d'origine avec un écart moyen de 0,8/255.

**Réserve :** l'identité stricte avec `1000324473.png` ne pourra être confirmée qu'à réception de ce fichier. Dès qu'il sera dans `motion/sources/`, il suffit de relancer `npm run layers` pour régénérer les calques depuis la source haute résolution, sans toucher au code de l'animation.

### A.3 — Signature agrandie de 28 %

| | v1.1 | v1.2 |
|---|---|---|
| Police | Inter Regular | Inter Regular |
| Corps | 30,3 px | **38,8 px (+28 %)** |
| Hauteur des capitales | 22 px | 28 px |
| Interlettrage | 0,12 em | 0,07 em |
| Largeur de la ligne | 804 px | 947 px (wordmark : 832 px) |

Point d'arbitrage pour la DA : avec l'interlettrage d'origine, +28 % aurait donné une ligne de 996 px, qui dépasse le wordmark de 20 %. J'ai resserré l'interlettrage pour garder un bloc compact. La taille des lettres est bien +28 %. La valeur se règle dans une seule constante (`SIG` dans `src/sequences/S01Ouverture.tsx`).

Le trait orange d'origine suit la signature par simple translation (+36 px, +9 px), sans déformation, pour rester sous « votre croissance ». L'ensemble du bloc reste centré verticalement (centre à y = 538 sur 540).

### A.4 — Lisibilité sur mobile (`S01_test-lisibilite-mobile_v1.2.png`)

Simulation sur un écran de téléphone standard (390 × 844 points) :

| Lecture | Hauteur des capitales v1.1 | v1.2 | Verdict |
|---|---|---|---|
| Téléphone horizontal, plein écran | 8,0 pt | **10,2 pt** | Lisible, l'équivalent d'un texte de 14 pt |
| Téléphone vertical, vidéo 16:9 intégrée dans le fil | 4,5 pt | 5,7 pt | Trop petit pour une lecture confortable |

Le cas vertical est une limite du format 16:9 lui-même. Elle sera traitée dans les versions **9:16 et 1:1** prévues au dossier, où la signature sera composée plus grande. Je ne propose pas de grossir davantage la version 16:9, ce qui déséquilibrerait le logo.

### A.5–A.6 — Composition et intégrité

- Le fond reste noir (#000 puis #0E0E10), avec un éclairage orange #F28C28.
- Le logo est affiché à l'échelle 1:1 sur l'image finale, sans étirement ni redimensionnement non proportionnel. La seule mise à l'échelle est le léger travelling (0,93 → 1,00), toujours uniforme.

## 3. Paramètres vidéo et audio (mesurés avec ffprobe et ffmpeg)

| Paramètre | S01 Ouverture v1.2 | S02 proposition |
|---|---|---|
| Conteneur | MP4 | MP4 |
| Vidéo | H.264 High, 1920×1080, 16:9 | idem |
| Cadence | 25/1 fps, 375 images | 25/1 fps, 625 images |
| Durée | 15,0 s | 25,0 s |
| Pixels | yuv420p, BT.709, plage TV | idem |
| Encodage | x264 CRF 14, preset slow, ≈ 2,5 Mb/s | idem, ≈ 1,8 Mb/s |
| Audio | AAC-LC 320 kb/s, 48 kHz, stéréo | sans son (maquette) |
| Loudness | −16,5 LUFS intégré, LRA 6,5 LU, crête −1,1 dBFS | — |
| Ouverture | noir vidéo pur (Y max = 16) de 0 à 1,95 s | — |
| Contrôle de la dernière image | image 374 du MP4 contre le PNG : écart moyen 1,5/255 (compression) | — |
| SHA-256 | `b4e02b59…7953e4` | `82c21c02…4a44` |

## 4. Rapport des ressources utilisées

| Ressource | Origine | Licence / droits | Usage |
|---|---|---|---|
| Logo PixelSavane | Fichier d'Oscar, commit `39584a3` (`motion/sources/`) | Propriété PixelSavane | S01 : calques extraits sans redessin |
| Portrait d'Oscar YOUTOU | Fichier d'Oscar, commit `c639ed4` (`motion/sources/`), 820×1081 | Propriété du fondateur | S02 : affiché à 92–96 % de sa taille native, jamais agrandi, sans retouche |
| Inter, Space Grotesk, Sora | `@fontsource` (npm) | SIL Open Font License 1.1 | Textes, titres, sous-titres |
| Sound design S01 | Synthétisé localement (`scripts/sound_design.py`) | Création originale, aucun sample | Bande son S01 |
| Pictogrammes S02 | Dessinés en grilles de carrés dans le code | Création originale | S02 |
| Remotion 4, React 18 | npm | Remotion : gratuit pour les particuliers et les entreprises de 3 personnes au plus. React : MIT | Moteur de rendu |
| FFmpeg / x264 | Système | LGPL / GPL | Encodage |

Aucune image générée par IA, aucune banque d'images, aucune API payante.

## 5. Proposition visuelle S02 — « La naissance d'une conviction » (25 s)

| Temps | Contenu |
|---|---|
| 0–3,7 s | Titre de chapitre : « 02 » en Sora orange, « La naissance d'une conviction » en Space Grotesk Bold 92 px, filet orange |
| 3,4–11,6 s | Quatre panneaux **Entrepreneurs · PME · Commerçants · Entreprises** : pictogrammes qui s'assemblent pixel par pixel, libellés en Sora SemiBold |
| 10,6–11,8 s | Les pixels des panneaux s'envolent vers la droite, vers la zone du portrait |
| 11,7–14,4 s | **Portrait réel d'Oscar** révélé par une grille de carrés de 38 px, du visage vers l'extérieur, avec un éclat orange à chaque carré. Mouvement lent (Ken Burns 1,00 → 1,04, sans jamais dépasser la résolution native), bords fondus dans le noir de la charte |
| 14,6–24 s | Identification : carré orange, **Oscar YOUTOU** (Space Grotesk Bold 84 px), filet dégradé orange, **Fondateur et Directeur Créatif** (Sora SemiBold 34 px) |
| 23,4–25 s | Sortie au noir |

Règles respectées :

- La photo d'Oscar est affichée telle quelle : ni retouche, ni IA, ni mise en scène inventée.
- Les « entrepreneurs, PME, commerçants » sont représentés en **motion design pur** en attendant des photos réelles autorisées. Aucune personne fictive n'est fabriquée.
- Aucun texte de narration n'est inventé : la maquette est muette tant que le script validé n'est pas transmis.
- Un filigrane « Maquette S02 » signale qu'il s'agit d'une proposition. Il disparaîtra en production.

Questions pour la DA sur S02 :

1. Les pictogrammes sont-ils une piste à garder en complément des futures photos réelles, ou seulement un emplacement provisoire ?
2. Le portrait est placé à droite, avec le nom à gauche. Faut-il le garder ainsi ou le centrer ?
3. Pour un portrait en plein cadre, il faudra le fichier `1000323407.png` en haute définition.

## 6. Organisation (point D)

```
motion/
├── sources/                     ← médias ORIGINAUX, séparés, en lecture seule, avec manifeste SHA-256
├── PS-DOC-001_AUDIT_PREPRODUCTION.md
└── ps-doc-001/                  ← projet Remotion unique, modulaire
    ├── src/
    │   ├── Root.tsx             ← une composition par séquence (S01-Ouverture, S02-Fondateur…)
    │   ├── system/              ← briques communes : brand.ts (couleurs, polices, signature),
    │   │                          fonts.ts, motion.ts (courbes), Glint.tsx (reflets)
    │   └── sequences/           ← UN composant indépendant par séquence
    │       ├── S01Ouverture.tsx
    │       └── S02Fondateur.tsx
    ├── public/                  ← fichiers DÉRIVÉS (calques du logo, copie du portrait, son)
    ├── scripts/                 ← extract_layers.py, sound_design.py
    └── out/                     ← livrables (+ archives/ des versions précédentes)
```

Commandes : `npm install`, puis `npm run layers`, `npm run sound`, `npm run render:s01`, `npm run still:s01`, `npm run render:s02`. Pour prévisualiser : `npm run studio`.

**Sauvegarde distante.** Le code, les médias originaux et les livrables sont poussés sur GitHub (`Youtou90/pixelsavane-page`, branche `ccr-389f389b-72caos`). Après chaque envoi, je vérifie que le commit distant est bien identique au commit local (`git ls-remote`) : un commit local n'est jamais considéré comme une sauvegarde. Le dossier `motion/` est exclu du déploiement Vercel du site.

Recommandation pour la suite : quand les rushes et les médias HD arriveront (centaines de Mo), les stocker avec Git LFS ou sur un Google Drive dédié, et ne garder dans Git que leur manifeste SHA-256.

## 7. En attente avant le master de 180 s (point C)

- [ ] Logo officiel haute résolution `1000324473.png`
- [ ] Portrait original `1000323407.png`
- [ ] Script de narration validé
- [ ] Charte graphique (présentations)
- [ ] Liste des créations PixelSavane utilisables dans le film
- [ ] Validation de l'ouverture v1.2 et de la proposition S02 par la DA
