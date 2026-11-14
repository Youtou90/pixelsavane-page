"""Contrôle final de S03 avant l'export définitif v1.2 (ordre de la DA du 14/11/2026).

Écrit S03_v1.2_LISTE_DE_CONTROLE.md et sort en erreur (code 1) si un point bloquant subsiste :
  - ressource principale manquante (= emplacement « Image à fournir » dans la vidéo) ;
  - dimensions sous le minimum de la commande, ou format (ratio) non conforme ;
  - empreinte SHA-256 différente de celle du registre (fichier modifié) ;
  - outil, date de génération ou vérification de l'usage commercial non renseignés ;
  - contrôle visuel incomplet (casting africain, aucun texte, aucun logo tiers, photoréalisme, cohérence) ;
  - code de la séquence utilisant encore un cadre d'attente en mode final.
Les points Wata Fufu (propriété, autorisation de publication) sont signalés : obligatoires avant toute publication externe.
"""
import hashlib, json, os, subprocess, sys
from datetime import date

REG = '../sources/s03-v1.1/REGISTRE_RESSOURCES.json'
OUT = 'S03_v1.2_LISTE_DE_CONTROLE.md'
reg = json.load(open(REG))
R = {'4:5': 0.8, '1:1': 1.0, '9:16': 9 / 16}

def dims(path):
    if path.endswith(('.mp4', '.mov')):
        o = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=width,height,duration',
                            '-of', 'csv=p=0', path], capture_output=True, text=True).stdout.strip().split(',')
        return int(o[0]), int(o[1]), float(o[2]) if len(o) > 2 and o[2] not in ('', 'N/A') else None
    from PIL import Image
    w, h = Image.open(path).size
    return w, h, None

bloquants, alertes, lignes = [], [], []
for r in reg['ressources']:
    n, ok = r['nom'], True
    if r['statut'] != 'reçue' or not r.get('fichier_original'):
        if r['obligatoire']:
            bloquants.append(f'`{n}` manquante : un cadre « Image à fournir » subsisterait'); ok = False
        lignes.append((n, r['usage'], '⬜ manquante' if r['obligatoire'] else '— facultative, absente')); continue
    path = r['fichier_original'].replace('motion/', '../')
    if not os.path.exists(path):
        bloquants.append(f'`{n}` : fichier original introuvable ({r["fichier_original"]})'); ok = False
    else:
        if hashlib.sha256(open(path, 'rb').read()).hexdigest() != r['sha256']:
            bloquants.append(f'`{n}` : empreinte SHA-256 différente du registre (fichier modifié)'); ok = False
        w, h, dur = dims(path)
        mw, mh = r['taille_min']
        if w < mw or h < mh:
            bloquants.append(f'`{n}` : {w}×{h}, en dessous du minimum {mw}×{mh}'); ok = False
        if abs(w / h - R[r['ratio']]) / R[r['ratio']] > 0.02:
            bloquants.append(f'`{n}` : format {w}×{h} non conforme au {r["ratio"]} demandé'); ok = False
        if dur is not None and dur < 6:
            alertes.append(f'`{n}` : vidéo de {dur:.1f} s (6 à 8 s demandées)')
    if not r.get('outil') or not r.get('date_generation'):
        bloquants.append(f'`{n}` : outil ou date de génération non renseigné'); ok = False
    lic = r['licence']
    if not lic.get('usage_commercial_verifie') or not lic.get('source_conditions'):
        bloquants.append(f'`{n}` : usage commercial non vérifié (source des conditions exigée)'); ok = False
    cv = r['controle_visuel']
    manquants = [k for k in ('casting_africain', 'aucun_texte', 'aucun_logo_tiers', 'photorealisme', 'coherence_campagne') if cv.get(k) is not True]
    if manquants:
        bloquants.append(f'`{n}` : contrôle visuel incomplet ou négatif ({", ".join(manquants)})'); ok = False
    lignes.append((n, r['usage'], '✅ conforme' if ok else '❌ à reprendre'))

# Le mode final de la séquence refuse les cadres d'attente (vérification statique du code)
src = open('src/sequences/S03Creativite.tsx', encoding='utf-8').read()
if 'MODE FINAL' not in src:
    bloquants.append('Code : le verrou « mode final » est absent de S03Creativite.tsx')

wf = reg['wata_fufu']
if 'confirm' not in str(wf.get('statut_propriete_marque', '')).lower() or 'à confirmer' in str(wf.get('statut_propriete_marque', '')):
    alertes.append('Wata Fufu : propriété de la marque à confirmer avant toute publication externe')
if 'à confirmer' in str(wf.get('autorisation_publication', '')):
    alertes.append('Wata Fufu : autorisation d’utiliser les publications à confirmer avant toute publication externe')
for o in wf['originaux']:
    if os.path.exists(o['fichier'].replace('motion/', '../')) and hashlib.sha256(open(o['fichier'].replace('motion/', '../'), 'rb').read()).hexdigest() != o['sha256']:
        bloquants.append(f'Wata Fufu : {o["fichier"]} modifié (empreinte différente)')
    if not o.get('usage_commercial_verifie'):
        alertes.append(f'Wata Fufu : outil et licence de {os.path.basename(o["fichier"])} à préciser')

n_ok = sum(1 for _, _, s in lignes if s.startswith('✅'))
n_req = sum(r['obligatoire'] for r in reg['ressources'])
md = [f'# S03 v1.2 — Liste de contrôle avant export définitif', '',
      f'Contrôle automatique du {date.today().isoformat()} (`npm run check:s03`).', '',
      f'**Résultat : {"✅ EXPORT AUTORISÉ" if not bloquants else "⛔ EXPORT BLOQUÉ"}** — {n_ok}/{n_req} ressources principales conformes.', '',
      '## Ressources', '', '| Ressource | Usage | État |', '|---|---|---|']
md += [f'| `{n}` | {u} | {s} |' for n, u, s in lignes]
md += ['', '## Points bloquants', ''] + ([f'- {b}' for b in bloquants] or ['- Aucun.'])
md += ['', '## Alertes (non bloquantes pour l’export interne, obligatoires avant publication externe)', ''] + ([f'- {a}' for a in alertes] or ['- Aucune.'])
md += ['', '## Contrôles visuels faits à la main à chaque réception (consignés dans le registre)', '',
       '- Casting africain, aucun texte ni logo tiers dans l’image, photoréalisme publicitaire, cohérence de chaque campagne (même produit, mêmes couleurs, même direction photo).',
       '- Après le rendu : lisibilité des textes sur les captures, signature PixelSavane (#FAFAFA, centrée), absence de marques tierces.', '']
open(OUT, 'w').write('\n'.join(md))
print('\n'.join(md[4:6]))
if bloquants:
    print(f'{len(bloquants)} point(s) bloquant(s) — voir {OUT}')
    sys.exit(1)
