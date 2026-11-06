# Spécifications des formats — PS-PODCAST-002

Les deux formats partent du même `prompt-principal.txt`. On y ajoute le suffixe du format voulu.

## A. Format paysage 16:9 (format de référence)

- **Résolution :** 1920 × 1080 au minimum, 3840 × 2160 recommandé pour le master.
- **Paramètres :** `--ar 16:9` (Midjourney) ou `aspect_ratio: 16:9`.
- **Usage :** miniature YouTube, bannière de site, LinkedIn, couverture d'épisode.
- **Cadrage :** identique à la référence. La moitié gauche (étagère, lampe) laisse naturellement de la place pour un titre ajouté plus tard en post-production. Aucun texte n'est généré.

**Suffixe à ajouter au prompt :**

```
Wide 16:9 horizontal composition, subject slightly right of center, background shelf and Edison lamp occupying the left third, microphone boom arm crossing from the right.
```

## B. Format vertical 9:16 (déclinaison)

- **Résolution :** 1080 × 1920 au minimum, 2160 × 3840 recommandé.
- **Paramètres :** `--ar 9:16` ou `aspect_ratio: 9:16`.
- **Usage :** Reels, TikTok, statuts WhatsApp, Stories.

**Adaptations nécessaires** (le format l'impose, le concept ne change pas) :

- Le sujet est centré. Le cadre va du haut du chignon jusqu'à la table, comme un plan taille un peu plus serré.
- Le micro reste à droite. Le bras articulé entre en diagonale par le bord droit, vers le milieu de la hauteur, et ne doit pas masquer le visage ni la main.
- L'étagère et la lampe Edison passent derrière l'épaule gauche, en haut à gauche. Les lames rétroéclairées occupent le bord droit.
- Le mug reste en bas. L'ordinateur est réduit à un bord ou retiré, faute de largeur.
- **Zones à garder libres pour l'interface des réseaux sociaux :** environ 250 px en haut et 340 px en bas, en 1080 × 1920. Le visage et la main doivent rester dans la zone centrale.

**Suffixe à ajouter au prompt :**

```
Vertical 9:16 portrait composition, subject centered, framed from top of the bun to the desk, microphone boom arm entering diagonally from the right edge without covering the face or hand, Edison lamp and bookshelf behind her left shoulder in the upper left, backlit wooden slats along the right edge, black mug at the bottom, face and gesturing hand within the central safe area.
```

**Méthode recommandée :** générer le 9:16 directement. Si on part du master 16:9, il faut un outpainting vertical (`reframe` ou `outpaint`) plutôt qu'un simple recadrage, sinon on perd la main et le micro.

## Version commerciale sans texte (les deux formats)

- **Pas de texte :** aucun texte, logo ni watermark n'est généré. Les marques visibles sur la référence, sur le micro et l'arceau du casque, sont neutralisées.
- **Titres des livres :** les dos de livres restent flous et illisibles.
- **Habillage :** le titre de l'épisode, le logo PixelSavane et le CTA s'ajoutent après coup dans Canva ou en post-production, sur un calque séparé.
