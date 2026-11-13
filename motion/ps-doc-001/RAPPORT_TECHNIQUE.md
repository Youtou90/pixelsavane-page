# PS-DOC-001 — Rapport technique · Ouverture v1.4

**Statut : soumise à la validation du directeur artistique.** Aucune autre séquence ne sera produite avant cette validation.

---

## 0. Nouveautés v1.4 : logo officiel `1000324473.png`

- **Import.** Le logo officiel transmis par le fondateur (PNG 1254×1254) est archivé intact dans `motion/sources/1000324473.png`, en lecture seule (SHA-256 `ef2a067d…12f5d7`). C'est désormais la **seule source** des calques du logo.
- **Vérification.** Il s'agit du même dessin que le fichier 1080 px utilisé jusqu'en v1.3, en plus haute définition : rapport exact de 1,161, contenu aux mêmes positions relatives.
- **Découpe.** `scripts/extract_layers.py` est devenu indépendant de la résolution. Il découpe le fichier HD en calques (nuage de pixels, P avec triangle de lecture, S, trait orange) et en **11 lettres entières** (P · i · x · e · l · S · a · v · a · n · e : dans le fichier HD, le S et le a ne se touchent plus).
  - Recomposition des calques par rapport au fichier officiel : écart moyen **0,14/255**.
  - Pixels de l'ancienne signature restant dans les calques : **0**.
- **Affichage.** Les calques HD sont affichés dans le même cadre de mise en page qu'en v1.3, par **réduction uniforme ×0,861** (identique en largeur et en hauteur, donc proportions intactes). Une réduction depuis un fichier plus grand donne une image plus nette que l'ancien fichier 1080 px. La composition validée (taille, centrage, signature, trait) ne change pas.
- **Intégrité sur la dernière image.** Symbole et wordmark, comparés au fichier officiel réduit au même cadre :
  - intérieur des formes : écart moyen **0,87/255** ;
  - 2 px de bord : écart moyen 17,6/255, dû au filtre de réduction du navigateur (un autre filtre que celui de référence), pas à la forme.
- **Signature.** Seule la signature est remplacée : « Le numérique au service de votre croissance. », avec le point final du texte validé par la DA. Pour retirer le point, il suffit de modifier la constante `SIGNATURE` dans `src/system/brand.ts`.

## 1. Livrables S01 (`motion/ps-doc-001/out/`)

| Livrable | Fichier |
|---|---|
| **Vidéo finale de l'ouverture v1.4** | `PixelSavane_S01_Ouverture_v1.4_1080p25.mp4` |
| **Dernière image (image 374) en PNG** | `S01_derniere-image_v1.4.png` |
| Code source | `src/sequences/S01Ouverture.tsx` (séquence), `src/system/` (briques communes), `scripts/` (découpe du logo, son) |
| Versions précédentes | `archives/` (v1.1 à v1.3) |

## 2. Corrections de la validation PS-DOC-001-A

| # | Demande | Réalisation (v1.3, conservée en v1.4) |
|---|---|---|
| 1 | Les particules forment le symbole PS, convergence progressive et contrôlée | **Convergence en deux temps.** De 6,0 à 7,8 s, les 412 particules quittent le nuage et forment un **essaim lâche** qui dessine déjà le PS, avec un léger flottement. Ensuite, **chaque particule se verrouille une à une sur son pixel exact**, et ce verrouillage dévoile sous elle une tuile de 17 px découpée dans le **vrai calque du logo** : les particules construisent littéralement le symbole. Ordre : les 16 carrés du nuage de pixels (7,35–7,8 s), puis le P du pied du fût vers la boucle (7,9–9,75 s), puis le S de la tête vers la queue (9,85–11,7 s). Une fois chaque lettre complète, le calque officiel entier prend le relais (bords antialiasés compris), avec un reflet discret |
| 2 | Logo officiel importé, non reconstruit, proportions, dégradés et pixels préservés | Voir § 3 |
| 3 | Wordmark animé sans couper les lettres, mot complet visible à la fin | Le wordmark officiel est découpé en **lettres entières** : 11 en v1.4 à partir du fichier HD (10 en v1.3, où le S et le a se touchaient). Chaque lettre apparaît **en entier** (fondu, montée de 18 px, mise au point), en cascade de 11,9 à 13 s. Plus aucun balayage ne coupe une lettre. L'union des lettres reproduit le calque wordmark à l'identique (écart d'alpha : 0) |
| 4 | Signature exacte, lisible en 1920 × 1080 | Texte exact : « Le numérique au service de votre croissance. » (une seule constante dans le code, `SIGNATURE` dans `src/system/brand.ts`). Inter Regular 38,8 px : capitales de 28 px, minuscules de 21 px, blanc #FAFAFA sur noir. Taille validée en v1.2 (+28 %) |
| 5 | Logo complet centré, fond noir, lumière orange discrète, logo immobile à la fin | Bloc complet (symbole, wordmark, signature, trait) mesuré sur la dernière image : centre à **(959,5 ; 539,5)** pour (960 ; 540). Fond #0E0E10, halo orange réduit (opacité 0,26), vignettage. **Plan totalement fixe de 13,44 s à 15,00 s (1,56 s, mesuré en v1.4)** : caméra posée dès 12,6 s, particules d'ambiance éteintes, aucun scintillement. Mesuré sur le MP4 : écart entre ces images ≤ 6/255 (bruit d'encodage seulement) |
| 6 | 15 s, 25 fps, 1920 × 1080, MP4 H.264 | Voir § 4 |

Calendrier ajusté pour libérer le plan fixe final : le wordmark arrive à 11,9 s (au lieu de 12 s) et la signature à 12,7 s (au lieu de 14 s). Les autres temps du scénario sont inchangés.

## 3. Historique v1.3 : origine du logo avant réception du fichier officiel

- **Source.** C'est le fichier logo téléversé par le fondateur lui-même (compte GitHub Youtou90, commit `39584a3` du 27/10/2026). Il est conservé intact, en lecture seule, dans `motion/sources/` (SHA-256 `80f1ba81…c525f4`).
- **Méthode.** `scripts/extract_layers.py` **découpe** ce fichier en calques transparents (nuage de pixels, P avec triangle de lecture, S, lettres du wordmark, trait orange) au moyen de masques géométriques et colorimétriques. Aucun tracé, aucune vectorisation, aucune IA. L'ancienne signature est exclue des calques.
- **Proportions.** Les calques sont affichés à l'échelle **1:1** sur l'image finale : aucun redimensionnement, aucune déformation. Le seul mouvement d'échelle est le travelling uniforme (0,93 → 1,00), terminé à 12,6 s.
- **Vérification sur la dernière image.** La zone symbole + wordmark de `S01_derniere-image_v1.4.png`, comparée pixel par pixel au fichier du fondateur, donne un écart moyen de **0,05/255** (99 % des pixels ≤ 2/255). Dégradés et pixels sont donc préservés.
- **Réserve levée en v1.4** : `1000324473.png` a été reçu et sert désormais de source (voir § 0).

## 4. Paramètres vidéo et audio (mesurés avec ffprobe et ffmpeg)

| Paramètre | Valeur |
|---|---|
| Conteneur / codec | MP4, H.264 High, x264 CRF 14, preset slow (≈ 2,3 Mb/s) |
| Image | 1920 × 1080, 16:9, yuv420p, BT.709, plage TV |
| Cadence et durée | 25/1 fps, **375 images, piste vidéo de 15,000 s exactement** (le conteneur affiche 15,019 s à cause du remplissage technique des trames AAC) |
| Audio | AAC-LC 320 kb/s, 48 kHz, stéréo ; −15,9 LUFS intégré, crête −1,0 dBFS |
| Ouverture | noir vidéo pur (Y max = 16) de 0 à 1,95 s, silence jusqu'à 1,4 s |
| Son v1.3 | recalé : clics cristallins de verrouillage pendant la construction du P et du S, impacts à 7,95 s et 9,85 s, souffle et nappe sur le wordmark (11,7 s), carillon sur la signature (12,7 s), nappe tenue pendant le plan fixe puis fondu |

## 5. Ressources utilisées

| Ressource | Origine | Droits | Usage |
|---|---|---|---|
| Logo PixelSavane | `motion/sources/1000324473.png`, transmis par le fondateur | Propriété PixelSavane | Calques découpés, réduction uniforme ×0,861 |
| Portrait d'Oscar YOUTOU | `motion/sources/1000338417.png`, transmis par le fondateur | Propriété du fondateur | S02 : affiché tel quel, échelle ≤ 0,94, sans retouche |
| Inter, Space Grotesk, Sora | `@fontsource` | SIL Open Font License 1.1 | Signature, titres, sous-titres |
| Pictogrammes S02 | Dessinés au trait dans `scripts/prepare_s02.py` | Création originale | Panneaux S02 |
| Son | Synthétisé localement (`scripts/sound_design.py`) | Création originale, aucun sample | Bande son S01 (S02 muette) |
| Remotion 4 + React 18, FFmpeg/x264 | npm, système | Remotion : gratuit jusqu'à 3 personnes ; MIT ; LGPL/GPL | Rendu et encodage |

Aucune image générée par IA, aucune banque d'images, aucune API payante.

## 6. Séquence S02 v1.3 — « La naissance d'une conviction » (25 s, muette)

**Statut : soumise à la validation du directeur artistique.** S03 ne sera pas commencée avant cette validation, et S01 v1.4 n'a pas été modifiée.

### 6.1 Livrables

| Livrable | Fichier |
|---|---|
| Vidéo | `out/PixelSavane_S02_Fondateur_v1.3_1080p25.mp4` |
| Capture 1 : panneaux (9,0 s) | `out/S02_v1.3_capture-1-panneaux_225.png` |
| Capture 2 : révélation par pixels (12,2 s) | `out/S02_v1.3_capture-2-revelation_305.png` |
| Capture 3 : identification (20,0 s) | `out/S02_v1.3_capture-3-identification_500.png` |
| Code source | `src/sequences/S02Fondateur.tsx`, `scripts/prepare_s02.py` |
| Version précédente | `out/archives/` (maquette v1.2) |

Paramètres mesurés : H.264 High, 1920 × 1080, 16:9, yuv420p BT.709, **25/1 fps, 625 images, 25,000 s**, **aucune piste audio** (maquette muette, sans voix artificielle). Débit ≈ 7,4 Mb/s : la mosaïque de pixels et le tissu imprimé sont riches en détails, et ce débit évite les artefacts de compression.

### 6.2 Corrections demandées

| # | Demande | Réalisation |
|---|---|---|
| 1 | Portrait : première des trois nouvelles photos, mains jointes, vêtement imprimé | **`1000338417.png`**, la première des trois par ordre de numéro (assis dans le fauteuil, mains jointes, wax vert, bleu et jaune, fond studio). Copie identique octet pour octet de `motion/sources/` (vérifiée avec `cmp`). Aucune retouche, aucun filtre, aucune IA. L'ancienne photo en blanc et gris est retirée du projet. Recadrage : on rogne seulement 116 px en bas de l'image (jambes) ; visage et vêtement sont entiers |
| 2 | Révélation progressive par pixels, puis caméra lente, portrait grand | De 10,5 à 11,4 s, les panneaux se brisent : leurs pixels s'envolent. **550 carrés** partent des panneaux et volent vers le cadre du portrait. Ils se posent **du visage vers l'extérieur** (11,4 → 13,4 s) en formant une **mosaïque** (couleur moyenne de la photo à chaque endroit), où l'on reconnaît déjà Oscar. Puis chaque carré se résout en **photo nette** (découpe exacte de l'original), et la photo entière prend le relais à 14,3 s. **Caméra numérique** : travelling avant lent de 1,00 à 1,08, centré sur le visage, avec léger panoramique (11,2 → 25 s). Le portrait occupe **toute la hauteur** de l'image (1080 px) sur la moitié droite (990 px de large). Échelle d'affichage maximale : 0,868 × 1,08 = **0,94, donc jamais d'agrandissement** au-delà de la résolution native |
| 3 | Pictogrammes premium, pixels conservés, rien d'enfantin | Pictogrammes **dessinés au trait** (vectoriel), puis **rasterisés sur une grille fine de 30 × 30** : trait d'un seul pixel calé sur la grille, pixels de 7 px au pas de 9 px. Le **blanc domine**, avec des **accents orange rares** (flèche de croissance, fermoir, auvent, fenêtres éclairées). Panneaux sombres avec bordure fine, numéro 01–04 en Sora, filet orange, halo orange discret en pied. Chaque pixel se pose un à un, du haut vers le bas |
| 4 | Identification | **OSCAR YOUTOU** en Space Grotesk Bold 88 px, filet dégradé orange, puis **Fondateur et Directeur Créatif** en Sora SemiBold 34 px. Entrée à 14,9 s, sortie à 24,1 s |
| 5 | Audio | Aucune voix artificielle. La vidéo est livrée **sans piste audio** en attendant l'enregistrement définitif |

### 6.3 Déroulé

| Temps | Contenu |
|---|---|
| 0,4–3,7 s | Titre « 02 · La naissance d'une conviction » |
| 3,4–10,5 s | Les quatre panneaux entrent l'un après l'autre et leurs pictogrammes s'assemblent pixel par pixel |
| 10,5–11,4 s | Les panneaux se dissolvent et leurs pixels s'envolent vers la droite |
| 11,4–13,4 s | Mosaïque du portrait, du visage vers l'extérieur |
| 12,0–14,7 s | Chaque carré se résout en photo nette ; photo entière à 14,3 s |
| 11,2–25 s | Travelling avant lent sur le visage |
| 14,9–24,1 s | Identification |
| 24,2–25 s | Fondu au noir |

Un filigrane discret en bas à gauche (« Maquette S02 v1.3 · muette ») signale la maquette. Il sera retiré au montage final.

## 6 bis. Séquence S03 v1.0 — « La créativité au service des marques » (35 s, muette)

**Statut : soumise à la validation du directeur artistique.** S04 ne sera pas commencée avant cette validation.

### Livrables

| Livrable | Fichier |
|---|---|
| Vidéo | `out/PixelSavane_S03_Creativite_v1.0_1080p25.mp4` |
| Capture 1 : publicité cinématographique (7,0 s) | `out/S03_v1.0_capture-1-pub-cinema_175.png` |
| Capture 2 : UGC et avatar IA (15,2 s) | `out/S03_v1.0_capture-2-ugc_380.png` |
| Capture 3 : photographie premium (22,4 s) | `out/S03_v1.0_capture-3-photo-premium_560.png` |
| Capture 4 : réseaux sociaux (30,0 s) | `out/S03_v1.0_capture-4-reseaux-sociaux_750.png` |
| Code source | `src/sequences/S03Creativite.tsx` ; nouvelles briques `src/system/PixelWipe.tsx`, `FilmGrain.tsx`, `Phone.tsx` ; `scripts/prepare_s03.py` |
| Sources des visuels et droits | `S03_SOURCES_ET_DROITS.md` |

Paramètres mesurés : H.264 High, 1920 × 1080, 16:9, yuv420p BT.709, **25/1 fps, 875 images, 35,000 s**, **sans piste audio**. Débit ≈ 7,7 Mb/s (33,8 Mo) : le grain de film et les photos détaillées demandent ce débit pour éviter les blocs de compression.

### Déroulé

| Temps | Contenu |
|---|---|
| 0–3,0 s | Titre « 03 · La créativité au service des marques » |
| 3,0–10,4 s | **01 · Publicité cinématographique, produit physique.** Diptyque au format cinéma 2,39:1 (bandes noires), deux plans révélés en volets avec mouvements de caméra opposés, filet orange, fuite de lumière orange, grain |
| 10,4–17,8 s | **02 · Publicité UGC.** Vidéo de créateur au format 9:16 dans un téléphone générique (barre de progression, compte fictif, sous-titres animés façon UGC, étiquette « Thé glacé · marque fictive »), avatar IA en second plan, ambiance floutée |
| 17,8–25,2 s | **03 · Photographie commerciale premium.** Mise en page éditoriale : image de campagne beauté révélée en rideau, typographie « ÉCLAT · marque fictive », colonne portrait noir et blanc et affiche de mode |
| 25,2–32,6 s | **04 · Contenus réseaux sociaux.** Trois formats flottants (publicité 4:5, post carré 1:1, story 9:16), compte fictif `@marque.demo`, aucun chiffre d'audience inventé |
| 32,6–35 s | Carton de fin : **PixelSavane** (lettres du wordmark officiel) et « Le numérique au service de votre croissance. » |

Transitions : vague de pixels (front orange, cœur noir) à chaque coupe. Habillage : repère de chapitre, numéro et titre de démonstration (Space Grotesk Bold), sous-titre (Sora SemiBold), mention de démonstration (Inter), grain de film et vignettage.

### Limites de cette v1.0

- **Résolution des visuels source.** Les visuels du site font 670 à 1080 px de large. Ils sont présentés en cadres (diptyque, téléphones, cartes) pour éviter tout agrandissement fort. Seule exception : l'image de droite du diptyque 01 est agrandie de 11 %.
- **Casting.** Les démonstrations 02 à 04 montrent surtout des personnes non africaines, faute d'autres visuels sans marque réelle. Pour qu'un dirigeant africain s'y reconnaisse, de nouveaux visuels avec un casting africain et des marques fictives seraient préférables (voir `S03_SOURCES_ET_DROITS.md`, § 3).

## 6 ter. Séquence S03 v1.1 — révision artistique (en attente des images)

**Statut :** code et mise en page prêts ; **images à fournir par Oscar** (décision du 13/11 : Oscar produit les images avec son outil habituel, dont il maîtrise les droits). La v1.0 est archivée (`out/archives/`, code dans `src/sequences/S03Creativite_v1_0.tsx`).

- **Commande d'images.** `motion/S03_v1.1_COMMANDE_IMAGES.md` liste 12 images obligatoires et 1 facultative : noms de fichiers, formats, résolutions minimales, indications de prompt, règles (aucun texte ni logo dans les images, casting africain, palette noir et orange, aucune marque réelle).
- **Dépôt.** Les images vont dans `motion/sources/s03-v1.1/`. `npm run prepare:s03` les copie telles quelles dans `public/s03v11/` et enregistre leur taille et leur empreinte SHA-256 (`available.json`).
- **Maquette de mise en page.** `out/PixelSavane_S03_v1.1_maquette-mise-en-page_1080p25.mp4` montre la composition définitive (35 s, 875 images), avec un cadre « Image à fournir » à la place de chaque image attendue.

| Démonstration | Ce que fait la v1.1 |
|---|---|
| 01 Wata Fufu | Trois ou quatre plans plein cadre 2,39:1 (héros, texture en gros plan, conditionnement, service) enchaînés en fondus avec mouvements de caméra opposés, lumière publicitaire orange. Nom « WATA FUFU » et « Farine de fufu » composés au montage. Mention « visuel publicitaire de démonstration », pour ne pas présenter les images comme documentaires |
| 02 UGC | Vrai cadre 9:16 (506 × 900) sans fausse interface. Trois plans en coupes franches avec la même créatrice. Sous-titres en Space Grotesk 42 px sur pastilles contrastées, étiquette « Bissap Kéla · marque fictive ». Trois annotations de savoir-faire (accroche, sous-titres, format) |
| 03 SAYÉ | Mini-campagne : identité de marque commune (nom, sous-titre), photographie produit, portrait publicitaire et photographie éditoriale révélés en rideau, avec leur légende |
| 04 Maison Adjoa | Une marque, trois formats cohérents. Titres, accroches et boutons d'action composés au montage pour une lisibilité parfaite : « Nouveautés du week-end » et « Commander » (4:5), « Fait maison, chaque matin. » (1:1), « Ouvert dès 7 h » et « Commander maintenant » (9:16) |

Dès réception des images : `npm run prepare:s03 && npm run render:s03 && npm run stills:s03`, puis contrôle visuel et livraison de S03 v1.1 avec quatre captures et le registre des droits mis à jour.

### Mise à jour du 13/11 : matériel réel reçu (12 visuels)

Le détail des 12 visuels reçus est dans `motion/sources/s03-v1.1/recus-2026-11-13/README.md` (originaux en lecture seule, empreintes SHA-256).

- **Démonstration 01, Wata Fufu : réalisée avec le matériel réel.** Trois plans tirés de recadrages exacts des publications de la marque (zones photographiques, pixels inchangés) :
  - « Texture » : gros plan du fufu ;
  - « Conditionnement » : boules emballées, bol et fufu cuit ;
  - « Volume » : sac.

  Chaque plan est un cadre net de 1180 × 620, avec le même plan flouté et assombri en plein écran derrière (effet de profondeur de champ qui masque l'agrandissement d'environ 1,3 à 1,5 fois), un mouvement de caméra lent et une lumière orange. Le nom « WATA FUFU · Fufu frais · Est-Cameroun » est composé au montage. Le plan se termine sur trois publications entières de la campagne (« Déclinaison en publications pour les réseaux sociaux »). Capture : `out/S03_v1.1_capture-1-pub-cinema_wata-fufu_110.png`.
- **Non utilisées :**
  - les cinq affiches « PixelSavana » : autre nom, logo et couleur que la charte, chiffres d'engagement présentés comme réels, logos de plateformes réelles ;
  - `1000251162.png` : version HD du visuel « voyage » déjà connu, sans emploi dans le cahier des charges v1.1 ;
  - `1000250151.jpg` : doublon.
- **Toujours manquantes** (voir `motion/S03_v1.1_COMMANDE_IMAGES.md`) : 02 UGC (`ugc-1` à `ugc-3`), 03 SAYÉ (`saye-produit`, `saye-portrait`, `saye-editorial`), 04 Maison Adjoa (`adjoa-45`, `adjoa-11`, `adjoa-916`). La maquette `out/PixelSavane_S03_v1.1_maquette-mise-en-page_1080p25.mp4` a été mise à jour : démonstration 01 définitive, cadres d'attente pour 02 à 04.

### Ordre de correction S03 v1.1 (révision 2 de la DA)

- **01 Wata Fufu · B2B** (matériel réel) :
  - **0 à 3,3 s** : diptyque de gros plans, « L'emballage » (sac : tissage, coutures, étiquette) et « Le produit » (texture) ;
  - **3,3 à 5,6 s** : « Le conditionnement » ;
  - **5,4 à 7,4 s** : écran « Offre professionnelle · Sacs disponibles en volume », avec trois publications réelles et leurs messages repris mot pour mot.

  Plans nets affichés à au plus 1,3 fois leur taille, sur un fond flou assombri. Légendes sur pastilles sombres pour rester lisibles. Captures : `out/S03_v1.1_capture-1-wata-fufu-b2b_110.png` et `out/S03_v1.1_capture-1b-wata-fufu-offre-b2b_245.png`.
- **02 UGC** : deux cadres 9:16 côte à côte, nettement distingués (« A · Créatrice UGC », « B · Avatar IA »). La mise au point passe de A à B à 4 s. Sous-titres français en Space Grotesk 34 px sur pastilles contrastées. L'avatar B accepte une **vidéo** (`avatar-ia.mp4`, lue sans le son pour la maquette) ou une image. Les annotations décoratives de la version précédente sont supprimées (« ne pas multiplier les effets »).
- **03 ÉCLAT** : un seul produit (sérum visage), trois visuels sous une identité commune : photographie produit, portrait publicitaire, et **affiche commerciale composée au montage** (titre « Révélez votre éclat. », bouton « Découvrir », mention « marque fictive »). Les photos éditoriales sans rapport avec la campagne sont supprimées.
- **04 Maison Adjoa** : une campagne en trois compositions propres à chaque format (4:5 : titre en haut et bouton en bas ; 1:1 : accroche en bas à gauche ; 9:16 : marque et horaire en haut, bouton centré dans la zone sûre).
- **Signature finale corrigée.** Le carton de fin est désormais rendu **au-dessus** du grain et du vignettage. Logo officiel et signature en Inter 38 px, couleur **#FAFAFA exacte** (mesurée : 250, 250, 250) sur #0E0E10, contraste d'environ 18:1. Bloc centré, mesuré à (959,5 ; 539) pour (960 ; 540). Capture : `out/S03_v1.1_capture-5-signature_855.png`.
- **En attente** : visuels des démonstrations 02 à 04, détaillés dans `motion/S03_v1.1_COMMANDE_IMAGES.md` (révision 2). Sources et droits : `S03_v1.1_SOURCES_ET_DROITS.md`. La maquette `out/PixelSavane_S03_v1.1_maquette-mise-en-page_1080p25.mp4` (35 s, 875 images) montre l'état actuel.

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

- [ ] Portrait original `1000323407.png`
- [ ] Script de narration validé
- [ ] Charte graphique (présentations)
- [ ] Liste des créations PixelSavane utilisables dans le film
- [x] Logo officiel haute résolution (`1000324473.png`, reçu le 13/11)
- [ ] **Validation de l'ouverture v1.4 par la DA**
- [x] Validation de S02 v1.3 par la DA
- [x] Revue de S03 v1.0 par la DA (révision v1.1 demandée)
- [ ] **Images S03 v1.1 à fournir par Oscar** (`motion/S03_v1.1_COMMANDE_IMAGES.md`)
- [ ] **Validation de S03 v1.1 par la DA** (préalable à S04)
- [ ] Statut de Wata Fufu, outil et licence des visuels IA du site (voir `S03_SOURCES_ET_DROITS.md`)
- [ ] Enregistrement définitif de la voix off (préalable à toute autre séquence)
