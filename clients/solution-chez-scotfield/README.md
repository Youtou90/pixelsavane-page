# Site vitrine – Solution Chez Scotfield (Bertoua)

Site de la boutique informatique **Solution Chez Scotfield / SCS Info-Télécom**, en face de la Poste Centrale de Bertoua.
Réalisé par **PixelSavane** (WhatsApp +237 696 22 94 16).

Site statique : HTML, CSS et JavaScript sans framework. Il est rapide sur mobile et en 3G, et peut être hébergé n'importe où.

## Pages

| Page | Fichier | Contenu |
|---|---|---|
| Accueil | `index.html` | Présentation, Journée ThinkPad du mardi, rayons, portables du moment, imprimantes, accès boutique |
| Produits | `produits.html` | 6 rayons filtrables, fiches produits avec photo, prix et bouton WhatsApp |
| Contact | `contact.html` | Numéros, adresse, horaires, itinéraire, formulaire qui prépare un message WhatsApp |
| Erreur | `404.html` | Page introuvable |
| Charte | `charte-graphique.html` | Logo, couleurs, typographie (référence interne) |

## Structure du projet

```
donnees/
  boutique.json    numéros, adresse, horaires, mode démo, Journée ThinkPad, rayons
  produits.json    catalogue : portables, vidéoprojecteurs, imprimantes
  icones.json      pictogrammes du site
src/
  css/style.css    charte graphique (couleurs, typo, composants)
  js/site.js       interactions : filtres, cascade, visionneuse photo, Journée ThinkPad
  assets/logo/     logo SCS en SVG (couleur, blanc, noir) + original
  assets/icones/   favicons, icône mobile, image d'aperçu de partage (og-image.jpg)
  assets/produits/ photos d'origine des produits (JPEG 4:3, 960×720 conseillé)
outils/
  construire.py    génère le site complet dans public/
public/            LE SITE À METTRE EN LIGNE (généré, ne pas modifier à la main)
```

## Construire le site

Il faut Python 3.9 ou plus récent et Pillow (`pip install pillow`).

```bash
python3 outils/construire.py
```

Le dossier `public/` est alors prêt. Pour le voir en local :

```bash
cd public && python3 -m http.server 8000   # puis ouvrir http://localhost:8000
```

## Tâches courantes

### Ajouter un produit
1. Déposer la photo dans `src/assets/produits/portables/` (ou `projecteurs/`, `imprimantes/`), nommée par l'identifiant, par exemple `hp-elitebook-840.jpg`.
2. Ajouter une entrée dans `donnees/produits.json` :
   ```json
   {
     "id": "hp-elitebook-840",
     "nom": "HP EliteBook 840 G8",
     "dossier": "portables",
     "usages": ["pro"],
     "prix": 280000,
     "specs": [
       {"label": "Processeur", "valeur": "Intel Core i5 11e gén."},
       {"label": "Mémoire", "valeur": "16 Go"},
       {"label": "Stockage", "valeur": "512 Go SSD"},
       {"label": "Écran", "valeur": "14 pouces FHD"}
     ],
     "note": "Clavier rétroéclairé",
     "accueil": false
   }
   ```
   - `prix` : un nombre en F CFA, ou `null` pour afficher « Prix sur demande ».
   - `usages` : `thinkpad`, `gaming`, `pro`, `ultra`, `creation`. Le premier usage de la liste sert de badge sur la photo.
   - `accueil: true` : le produit apparaît sur la page d'accueil (4 au maximum).
3. Relancer `python3 outils/construire.py`. Les versions WebP et JPEG de la photo sont créées automatiquement.

### Retirer un produit vendu
Supprimer son entrée dans `produits.json`, puis relancer la construction.

### Changer un numéro, l'adresse ou les horaires
Tout se trouve dans `donnees/boutique.json` :
- `whatsapp` : numéro principal. Tous les boutons WhatsApp du site l'utilisent.
- `appels` : numéro d'appel affiché en grand.
- `autres_numeros` : numéros secondaires.
- `horaires` : `texte` est affiché sur le site, `schema` est lu par Google (format `Mo-Sa 08:00-19:00`).

### Journée ThinkPad (mardi)
Elle se règle dans `boutique.json`, rubrique `journee_thinkpad` :
- `actif` : `true` ou `false`, pour afficher ou masquer la bande et la section.
- `vedette` : identifiant du ThinkPad mis en avant.

La date du prochain mardi se calcule toute seule à l'heure de Bertoua (UTC+1). Le mardi, la bande passe au rouge avec « C'est aujourd'hui ! ».

## Passer de la démo au site officiel (après paiement)

Tant que `"demo": true`, un bandeau **VERSION DÉMO · réalisé par PixelSavane · WhatsApp +237 696 22 94 16** reste collé en haut de chaque page, même pendant le défilement. Il ne peut pas être fermé par le visiteur et il est lisible de 320 px à l'écran d'ordinateur. Il est retiré **uniquement après le paiement de Solution Chez Scotfield**.

Dans `donnees/boutique.json` :
```json
"demo": false,
"url_site": "https://www.votre-domaine.com"
```
Puis relancer la construction. Cela :
- retire la bande « Version démo » (la mention « Site réalisé par PixelSavane » reste en pied de page) ;
- autorise Google à indexer le site (`robots.txt` et suppression de `noindex`) ;
- crée `sitemap.xml` et les liens canoniques avec la vraie adresse.

## Mise en ligne

Le contenu du dossier `public/` suffit. Trois options :
- **Netlify Drop** (le plus simple, gratuit) : glisser le dossier `public/` sur https://app.netlify.com/drop.
- **Vercel / GitHub Pages** : publier le dossier `public/`.
- **Hébergeur classique (cPanel, FTP)** : envoyer le contenu de `public/` dans `public_html/`. Régler la page d'erreur 404 sur `404.html`.

## Ce qui est inclus

- **Mobile d'abord :** testé de 360 px à 1366 px, sans défilement horizontal, avec le respect des encoches iPhone (safe-area).
- **Rapide :** photos WebP en 480 et 960 px avec repli JPEG, chargement différé des images, script en `defer`, aucune bibliothèque externe.
- **Interactif :**
  - apparition des fiches en cascade ;
  - visionneuse photo plein écran, avec glissement du doigt, flèches du clavier et Échap ;
  - filtres par rayon et par usage ;
  - bouton WhatsApp flottant, en-tête qui se compacte au défilement ;
  - formulaire qui prépare le message WhatsApp ;
  - boutons « Copier » sur les numéros.
- **Accessible :** focus visible, navigation au clavier, textes alternatifs, respect de « réduire les animations ».
- **Référencement :**
  - titres et descriptions par page ;
  - Open Graph, avec une image d'aperçu pour WhatsApp et Facebook ;
  - données structurées `ElectronicsStore` (Google Maps / recherche locale) ;
  - sitemap, robots.txt, manifest et favicons.

## À confirmer avec la boutique

- **Horaires d'ouverture :** valeur provisoire « Lundi – samedi : 8 h – 19 h ».
- **Orthographe du nom :** « Scotfield » (site) ou « Scofield » (affiches).
- **État des portables :** neuf ou occasion.
- **Fiches incomplètes :** caractéristiques complètes de l'Acer Nitro 5, de l'Asus ROG Strix, de l'Acer F17, du Lenovo compact et du Panasonic.
- **Prix :** prix des produits marqués « Prix sur demande ».
- **Numéro 674 827 999 :** il figure sur l'affiche ThinkPad. Faut-il l'ajouter ?
