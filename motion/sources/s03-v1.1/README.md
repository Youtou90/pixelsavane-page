# Images S03 v1.1 — dépôt

Déposer ici les images commandées dans `motion/S03_v1.1_COMMANDE_IMAGES.md`, **avec exactement ces noms**
(extension .png, .jpg ou .webp) :

ugc-1 · ugc-2 · ugc-3 (créatrice UGC)
avatar-ia (vidéo .mp4 de préférence, sinon image)
eclat-produit · eclat-portrait · eclat-affiche-fond (facultative)
adjoa-45 · adjoa-11 · adjoa-916

Wata Fufu : réalisé à partir des visuels réels de `recus-2026-11-13/`.

Puis, dans `motion/ps-doc-001/` : `npm run prepare:s03` → `npm run render:s03` → `npm run stills:s03`.
Les images ne sont jamais modifiées : elles sont copiées telles quelles et leur empreinte SHA-256 est enregistrée.

## Registre des ressources et licences (`REGISTRE_RESSOURCES.json`)

Pour chaque ressource reçue, `npm run check:s03` enregistre automatiquement le statut, le chemin de l'original, les dimensions et l'empreinte SHA-256.
Les champs suivants sont remplis **uniquement à partir des informations d'Oscar**, jamais déduits :
- `outil` et `date_generation` ;
- `licence.usage_commercial_verifie` et `licence.source_conditions` (lien ou extrait des conditions d'utilisation de l'outil) ;
- `controle_visuel` : rempli après examen de chaque image (casting africain, aucun texte, aucun logo tiers, photoréalisme, cohérence de campagne).

L'export définitif (`npm run render:s03-final`) est refusé tant qu'un de ces points manque.
