# Médias originaux — PS-DOC-001

Ce dossier conserve les **médias originaux**, séparés des fichiers dérivés utilisés par le moteur (`ps-doc-001/public/`).
Ils ne sont jamais modifiés : ce sont des extractions octet pour octet des fichiers téléversés par Oscar YOUTOU (compte GitHub Youtou90), en lecture seule.

| Fichier | Origine | Dimensions | SHA-256 |
|---|---|---|---|
| `1000324473.png` | **Logo officiel** transmis par le fondateur dans la conversation de production le 13/11/2026, PNG tel que reçu. Porte l'ancienne signature « Des contenus qui font vendre. » (exclue des calques) | 1254×1254 | `ef2a067d0dd87e8d7f023061b87d4445e4a11feb6c6bd0b3f8b02242a812f5d7` |
| `logo-pixelsavane_original_upload-39584a3.jpg` | Téléversé par Youtou90 le 27/10/2026 (commit `39584a3`). Porte l'**ancienne** signature « Des contenus qui font vendre. » | 1080×1080 | `80f1ba8155c7e440729beb8d7839db1038de3cdd3a1fd77c97850f83c8c525f4` |
| `oscar-portrait-pro_original_upload-c639ed4.jpg` | Téléversé par Youtou90 le 25/10/2026 (commit `c639ed4`), identique à `assets/img/oscar-portrait-pro.jpg` | 820×1081 | `3ebd666331d031bd8f3883189c73afddedd323ca7c16e166edd895a5e24c8525` |
| `1000338419.png` | Transmis dans la conversation de production le 13/11/2026, fichier PNG tel que reçu. Portrait assis, main au menton, fauteuil cuir, lampe à gauche | 1122×1402 | `9b0cf12cac6c7889e07894315975e5d3f133b496ada21e098d6ec53e82e89684` |
| `1000338417.png` | Idem. Portrait assis, mains jointes, fond studio brun uni | 1141×1378 | `436dc266ca9e37db91fb3e83f1b62833fb77b2f0967f33a9119615ef8fd016c3` |
| `1000338418.png` | Idem. Portrait assis, doigts croisés, lampe en osier et plante, boiseries | 1122×1402 | `8a9804c2c61c5a84e164c0aa80d1f9c33408d8316d7b04310a63b9850d52d860` |

Le logo `1000324473.png` est la **source de référence** de l'animation depuis la v1.4 (`npm run layers`). L'ancien fichier `logo-pixelsavane_original_upload-39584a3.jpg` est le même dessin en 1080 px, conservé pour mémoire.

**À confirmer :** `1000323407.png` (portrait cité dans le dossier) est-il remplacé par les trois portraits ci-dessus ?

Pour vérifier qu'un fichier n'a pas changé : `sha256sum motion/sources/*`.
