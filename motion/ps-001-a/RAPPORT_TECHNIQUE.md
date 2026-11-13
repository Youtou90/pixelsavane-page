# PS-001-A — Ouverture PixelSavane 15 s · Rapport technique

**Statut : livré pour validation artistique (DA).** Le documentaire complet n'a pas été produit.

## 1. Livrables

| Livrable | Fichier |
|---|---|
| Vidéo MP4 15 s, v1.1 (signature Inter, charte PS-DOC-001) | `out/PixelSavane_Ouverture_PS-001-A_v1.1_Inter_1080p25.mp4` |
| Vidéo MP4 15 s, v1.0 (signature Montserrat) | `out/PixelSavane_Ouverture_PS-001-A_v1.0_Montserrat_1080p25.mp4` |
| Captures de la dernière image (frame 374) | `out/derniere-image_v1.1_Inter.png`, `out/derniere-image_v1.0_Montserrat.png` |
| Planche des 8 temps du scénario | `out/storyboard.jpg` |
| Code source Remotion | `src/` (`PSOpening.tsx`, `brand.ts`, `Root.tsx`, `index.ts`) |
| Découpe du logo en calques | `scripts/extract_layers.py` → `public/ps-*.png`, `squares.json`, `points.json` |
| Sound design | `scripts/sound_design.py` → `public/sound.wav` |

## 2. Spécifications vérifiées (ffprobe / ffmpeg)

| Paramètre | Demandé | Mesuré |
|---|---|---|
| Résolution | 1920×1080, 16:9 | 1920×1080 |
| Cadence | 25 fps | 25/1, 375 images |
| Durée | 15 s | 15,0 s |
| Vidéo | H.264 | H.264 High, yuv420p, BT.709, plage TV, CRF 14, preset slow (~2,8 Mb/s) |
| Audio | — | AAC-LC 320 kb/s, 48 kHz stéréo, **−16,5 LUFS intégré**, crête −1,1 dBFS |
| 00–02 s noir absolu | — | luminance max = 16 (noir vidéo exact) sur toutes les images de 0 à 1,95 s, et silence total jusqu'à 1,4 s |

## 3. Logo : intégrité du fichier source

- **Fichier source.** `/mnt/data/1000324473.png` n'existe pas dans cet environnement. J'ai utilisé le logo officiel du dépôt, `assets/img/logo-pixelsavane.jpg` (1080×1080). Il comporte le même symbole PS et le même wordmark, et sa signature est déjà la nouvelle : l'ancienne signature « Des contenus qui font vendre » n'apparaît nulle part.
- **Aucun redessin, aucune IA.** `extract_layers.py` découpe le raster original en 5 calques transparents (nuage de pixels, P avec le bouton lecture, S, wordmark, trait orange). Le découpage se fait uniquement par masques géométriques et colorimétriques. L'alpha est « dé-prémultiplié » sur fond noir, donc les calques superposés reconstituent la source : écart moyen 0,8/255, écart max 5/255 (bruit JPEG des bords).
- **Échelle 1:1.** Les calques sont posés à leur taille native (1 pixel source = 1 pixel vidéo) sur la dernière image. Le léger travelling avant (0,93 → 1,00) se termine exactement à 1,00 à 14,4 s, donc l'image finale est à pleine netteté, sans aucun agrandissement.
- **Signature recomposée.** « Le numérique au service de votre croissance. » est retirée du raster et réécrite en texte vectoriel, en Inter Regular 30,3 px avec un interlettrage de 0,12 em (v1.1, charte PS-DOC-001), ou en Montserrat Regular 31,2 px avec 0,08 em (v1.0). Ces deux polices sont sous licence libre OFL, via `@fontsource`. Taille, interlettrage et position ont été calés au pixel sur le logo officiel : hauteur de capitale 22 px, largeur 802 px contre 804 px dans la source. Le trait orange d'origine (raster) est conservé et se dessine de gauche à droite.

## 4. Déroulé (25 fps)

| Temps | Images | Action | Son |
|---|---|---|---|
| 00–02 | 0–49 | Noir absolu (#000) | Silence, puis entrée d'une nappe grave à 1,4 s |
| 02–04 | 50–99 | Un pixel orange #F28C28 apparaît au centre, avec un halo et une légère respiration. Le fond glisse vers le noir PixelSavane #0E0E10 | « Ping » cristallin (Mi6 + Mi5) |
| 04–06 | 100–149 | Le pixel éclate en 482 particules carrées (412 destinées au logo + 70 de fond en orange, blanc, gris et vert), dispersées dans un nuage 3D avec projection perspective et flou de profondeur | Pluie de micro-blips stéréo, souffle granuleux |
| 06–08 | 150–199 | Convergence en trajectoires courbes : 16 particules rejoignent la position, la taille et la couleur exactes des carrés du logo, les autres dessinent le P et le S. Fondu enchaîné vers le calque raster des pixels à 7,8 s | Riser (bruit filtré glissant + glissando) |
| 08–10 | 200–249 | Révélation du P par un balayage diagonal doux, avec un flash d'exposition, un halo orange et un reflet lumineux découpé à la forme du P. Le S reste en pointillés scintillants | Impact grave (sub 46 Hz + thump) |
| 10–12 | 250–299 | Révélation du S orange (balayage inverse, halo ambré, reflet) | Second impact plus brillant + accord scintillant |
| 12–14 | 300–349 | Wordmark PixelSavane : balayage gauche → droite, montée de 16 px, mise au point (flou 8 → 0), reflet | Souffle aérien + nappe d'accord (La maj. 9) |
| 14–15 | 350–374 | Signature lettre par lettre (fondu + montée + mise au point, décalage de 11 ms par lettre), puis tracé du trait orange. Image figée et nette à partir de 14,85 s | Carillon final, fondu de sortie |

Courbes : sortie `cubic-bezier(.16,1,.3,1)` pour les apparitions, `(.65,0,.35,1)` pour les déplacements et les balayages. Le hasard est déterministe (`random(seed)` de Remotion) : chaque rendu est identique.

## 5. Chaîne technique (100 % gratuite, sans API ni abonnement)

- **Remotion 4 + React 18** (CSS, masques CSS, rendu Chromium headless) pour l'image. **FFmpeg / x264 + AAC** pour l'encodage.
- **Python (numpy, scipy, Pillow)** pour la découpe du logo et la synthèse sonore. Le son est entièrement synthétisé (oscillateurs, bruit filtré, réverbération par convolution avec une réponse impulsionnelle générée) : aucun sample, aucun droit tiers.
- **Montserrat** (SIL Open Font License).
- Licence Remotion : gratuite pour les particuliers et les entreprises de 3 personnes au plus. Au-delà, une licence entreprise Remotion est requise.

## 6. Reproduire le rendu

```bash
cd motion/ps-001-a
npm install
npm run layers   # découpe le logo source en calques (public/)
npm run sound    # génère public/sound.wav
npm run studio   # prévisualisation interactive (optionnel)
npm run render              # → v1.1 Inter
npm run render:montserrat   # → v1.0 Montserrat
npm run still               # → out/derniere-image_v1.1_Inter.png
```

Pour utiliser un autre fichier source (par exemple `1000324473.png`) : `python3 scripts/extract_layers.py <chemin>`. Les masques de découpe supposent la même mise en page 1080×1080 que le logo officiel.

## 7. Points soumis à la DA

1. Fichier source : merci de confirmer que `logo-pixelsavane.jpg` correspond bien au logo attendu, ou de fournir `1000324473.png`.
2. Le trait orange sous la signature est conservé tel quel depuis le logo. Il peut être retiré si la DA le souhaite.
3. Quelques particules vertes (#3F7C48) et grises (#70757A) d'arrière-plan apportent la profondeur. Le vert peut être retiré si la DA le réserve à d'autres usages.
