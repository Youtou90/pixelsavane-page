# PIXELSAVANE — PS-PODCAST-002

**Production :** Animatrice solo
**Référence :** [`PS-PODCAST-002-reference.png`](PS-PODCAST-002-reference.png) (1672 × 941, 16:9)

## Contenu du dossier

| Fichier | Rôle |
|---|---|
| [`fiche-direction-artistique.md`](fiche-direction-artistique.md) | Analyse de la référence : composition, personnage, décor, lumière |
| [`prompt-principal.txt`](prompt-principal.txt) | Prompt de génération principal (EN), version sans texte ni logo |
| [`negative-prompt.txt`](negative-prompt.txt) | Negative prompt (EN) |
| [`formats.md`](formats.md) | Spécifications 16:9 et 9:16, suffixes de prompt, version commerciale |
| [`controle-qualite.md`](controle-qualite.md) | Grille de contrôle qualité avant validation |
| `PS-PODCAST-002-reference.png` | Image de référence |

## Utilisation

1. Prendre `prompt-principal.txt`.
2. Ajouter le suffixe du format voulu (voir `formats.md`).
3. Renseigner `negative-prompt.txt` si l'outil le permet (Stable Diffusion, Flux, Leonardo).
   - Midjourney : `--no text, logo, watermark, extra fingers, plastic skin`
   - GPT-Image / Higgsfield : la dernière phrase du prompt principal suffit.
4. Valider chaque image avec `controle-qualite.md` (13 points, tous obligatoires).
5. Ajouter titre, logo PixelSavane et CTA en post-production, sur un calque séparé.

## Règle

Ne pas modifier le concept original sans justification écrite.
