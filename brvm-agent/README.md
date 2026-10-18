# Agent portefeuille BRVM

Agent Claude qui suit votre portefeuille BRVM (compte Coris Bourse 001717101) :
cours du jour via recherche web, plus-values frais inclus, simulations de vente,
alertes de cours, analyse de diversification et dividendes.

## Installation

```bash
cd brvm-agent
pip install -r requirements.txt
export ANTHROPIC_API_KEY=sk-ant-...      # clé sur console.anthropic.com
```

## Utilisation

```bash
python portfolio.py                       # rapport rapide, sans IA ni internet
python agent.py                           # discussion interactive
python agent.py "Mets à jour les cours et fais-moi le point"
```

Exemples de questions :
- « Mets à jour les cours de mes titres et dis-moi où j'en suis. »
- « Combien je touche si je vends mes 2 SNTS à 48 000 ? »
- « Préviens-moi si ORAC passe sous 20 000. »
- « Quels dividendes vais-je toucher en 2027 et quand ? »
- « Mon portefeuille est-il trop concentré ? »
- « J'ai acheté 10 SGBC à 28 500 aujourd'hui, avis ORB260001, frais 4 200. »

## Fichiers

| Fichier | Rôle |
|---|---|
| `portefeuille.json` | Opérations (issues des avis d'opéré), derniers cours connus, alertes |
| `portfolio.py` | Calculs : PRU frais inclus (coût moyen pondéré), plus-values, barème Coris Bourse |
| `agent.py` | Agent Claude (outils locaux + recherche/lecture web) |

Barème de frais déduit des avis d'opéré (identique au franc près) : BRVM 0,20 %,
DC/BR 0,10 %, courtage 0,80 %, TOB 15 % du courtage — soit ≈ 1,22 % par transaction.
Le point mort d'une ligne est donc ≈ +2,5 % au-dessus du cours d'achat.

L'agent ne passe aucun ordre : il conseille, vous décidez. Ce n'est pas un conseil
financier agréé.
