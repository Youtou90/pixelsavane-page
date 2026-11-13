# PS-DOC-001 — Rapport technique · Ouverture v1.3

**Statut : soumise à la validation du directeur artistique.** Aucune autre séquence ne sera produite avant cette validation.

---

## 1. Livrables (`motion/ps-doc-001/out/`)

| Livrable | Fichier |
|---|---|
| **Vidéo finale de l'ouverture v1.3** | `PixelSavane_S01_Ouverture_v1.3_1080p25.mp4` |
| **Dernière image (image 374) en PNG** | `S01_derniere-image_v1.3.png` |
| Planche des 8 temps | `S01_storyboard_v1.3.jpg` |
| Code source | `src/sequences/S01Ouverture.tsx` (séquence), `src/system/` (briques communes), `scripts/` (découpe du logo, son) |
| Versions précédentes | `archives/` (v1.1, v1.2) |

## 2. Corrections de la validation PS-DOC-001-A

| # | Demande | Réalisation v1.3 |
|---|---|---|
| 1 | Les particules forment le symbole PS, convergence progressive et contrôlée | **Convergence en deux temps.** De 6,0 à 7,8 s, les 412 particules quittent le nuage et forment un **essaim lâche** qui dessine déjà le PS, avec un léger flottement. Ensuite, **chaque particule se verrouille une à une sur son pixel exact**, et ce verrouillage dévoile sous elle une tuile de 17 px découpée dans le **vrai calque du logo** : les particules construisent littéralement le symbole. Ordre : les 16 carrés du nuage de pixels (7,35–7,8 s), puis le P du pied du fût vers la boucle (7,9–9,75 s), puis le S de la tête vers la queue (9,85–11,7 s). Une fois chaque lettre complète, le calque officiel entier prend le relais (bords antialiasés compris), avec un reflet discret |
| 2 | Logo officiel importé, non reconstruit, proportions, dégradés et pixels préservés | Voir § 3 |
| 3 | Wordmark animé sans couper les lettres, mot complet visible à la fin | Le wordmark officiel est découpé en **10 éléments entiers** (P · i · x · e · l · Sa · v · a · n · e ; le « S » et le « a » se touchent dans le dessin d'origine et restent soudés). Chaque élément apparaît **en entier** (fondu, montée de 18 px, mise au point), en cascade de 11,9 à 12,95 s. Plus aucun balayage ne coupe une lettre. L'union des 10 éléments reproduit le calque wordmark à l'identique (écart d'alpha : 0) |
| 4 | Signature exacte, lisible en 1920 × 1080 | Texte exact : « Le numérique au service de votre croissance. » (une seule constante dans le code, `SIGNATURE` dans `src/system/brand.ts`). Inter Regular 38,8 px : capitales de 28 px, minuscules de 21 px, blanc #FAFAFA sur noir. Taille validée en v1.2 (+28 %) |
| 5 | Logo complet centré, fond noir, lumière orange discrète, logo immobile à la fin | Bloc complet (symbole, wordmark, signature, trait) mesuré sur la dernière image : centre à **(959,5 ; 539,5)** pour (960 ; 540). Fond #0E0E10, halo orange réduit (opacité 0,26), vignettage. **Plan totalement fixe de 13,48 s à 15,00 s (1,52 s)** : caméra posée dès 12,6 s, particules d'ambiance éteintes, aucun scintillement. Mesuré sur le MP4 : écart entre ces images ≤ 6/255 (bruit d'encodage seulement) |
| 6 | 15 s, 25 fps, 1920 × 1080, MP4 H.264 | Voir § 4 |

Calendrier ajusté pour libérer le plan fixe final : le wordmark arrive à 11,9 s (au lieu de 12 s) et la signature à 12,7 s (au lieu de 14 s). Les autres temps du scénario sont inchangés.

## 3. Confirmation : logo officiel importé, non redessiné

- **Source.** C'est le fichier logo téléversé par le fondateur lui-même (compte GitHub Youtou90, commit `39584a3` du 27/10/2026). Il est conservé intact, en lecture seule, dans `motion/sources/` (SHA-256 `80f1ba81…c525f4`).
- **Méthode.** `scripts/extract_layers.py` **découpe** ce fichier en calques transparents (nuage de pixels, P avec triangle de lecture, S, lettres du wordmark, trait orange) au moyen de masques géométriques et colorimétriques. Aucun tracé, aucune vectorisation, aucune IA. L'ancienne signature est exclue des calques.
- **Proportions.** Les calques sont affichés à l'échelle **1:1** sur l'image finale : aucun redimensionnement, aucune déformation. Le seul mouvement d'échelle est le travelling uniforme (0,93 → 1,00), terminé à 12,6 s.
- **Vérification sur la dernière image.** La zone symbole + wordmark de `S01_derniere-image_v1.3.png`, comparée pixel par pixel au fichier du fondateur, donne un écart moyen de **0,05/255** (99 % des pixels ≤ 2/255). Dégradés et pixels sont donc préservés.
- **Réserve maintenue.** Le fichier `1000324473.png` cité dans le dossier n'a toujours pas été transmis à l'environnement. S'il diffère du fichier téléversé, il suffit de le déposer dans `motion/sources/` et de lancer `npm run layers` puis `npm run render:s01` ; aucun code d'animation n'est à modifier.

## 4. Paramètres vidéo et audio (mesurés avec ffprobe et ffmpeg)

| Paramètre | Valeur |
|---|---|
| Conteneur / codec | MP4, H.264 High, x264 CRF 14, preset slow (≈ 2,5 Mb/s) |
| Image | 1920 × 1080, 16:9, yuv420p, BT.709, plage TV |
| Cadence et durée | 25/1 fps, **375 images, piste vidéo de 15,000 s exactement** (le conteneur affiche 15,019 s à cause du remplissage technique des trames AAC) |
| Audio | AAC-LC 320 kb/s, 48 kHz, stéréo ; −15,9 LUFS intégré, crête −1,0 dBFS |
| Ouverture | noir vidéo pur (Y max = 16) de 0 à 1,95 s, silence jusqu'à 1,4 s |
| Son v1.3 | recalé : clics cristallins de verrouillage pendant la construction du P et du S, impacts à 7,95 s et 9,85 s, souffle et nappe sur le wordmark (11,7 s), carillon sur la signature (12,7 s), nappe tenue pendant le plan fixe puis fondu |

## 5. Ressources utilisées

| Ressource | Origine | Droits | Usage |
|---|---|---|---|
| Logo PixelSavane | Fichier téléversé par le fondateur (`motion/sources/`) | Propriété PixelSavane | Calques découpés, échelle 1:1 |
| Inter | `@fontsource/inter` | SIL Open Font License 1.1 | Signature |
| Son | Synthétisé localement (`scripts/sound_design.py`) | Création originale, aucun sample | Bande son |
| Remotion 4 + React 18, FFmpeg/x264 | npm, système | Remotion : gratuit jusqu'à 3 personnes ; MIT ; LGPL/GPL | Rendu et encodage |

Aucune image générée par IA, aucune banque d'images, aucune API payante.

## 6. Proposition visuelle S02 (présentée en v1.2, en attente d'avis) — « La naissance d'une conviction » (25 s)

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

## 7. Organisation

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

## 8. En attente avant les autres séquences

- [ ] Logo officiel haute résolution `1000324473.png`
- [ ] Portrait original `1000323407.png`
- [ ] Script de narration validé
- [ ] Charte graphique (présentations)
- [ ] Liste des créations PixelSavane utilisables dans le film
- [ ] **Validation de l'ouverture v1.3 par la DA** (préalable à toute autre séquence)
