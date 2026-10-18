"""Agent conversationnel pour suivre un portefeuille BRVM avec Claude.

Usage :
    python agent.py                 # discussion interactive
    python agent.py "Mets à jour les cours et fais-moi le point"
"""

from __future__ import annotations

import json
import sys
from datetime import date

import anthropic
from anthropic import beta_tool

import portfolio as pf

MODEL = "claude-opus-5-5"
MAX_REPRISES = 5

SYSTEM = f"""Tu es l'assistant d'investissement personnel d'un investisseur particulier \
sur la BRVM (Bourse Régionale des Valeurs Mobilières, Abidjan), via la SGI Coris Bourse. \
Tu réponds en français, en FCFA (XOF), de façon concise et chiffrée.

Ce que tu sais faire :
- Consulter le portefeuille (outil voir_portefeuille) : positions, PRU frais inclus, \
plus-values, poids de chaque ligne.
- Chercher les cours du jour et l'actualité des sociétés sur le web (brvm.org, \
sikafinance.com, richbourse.com, presse financière), puis enregistrer les cours trouvés \
avec mettre_a_jour_cours. Indique toujours la date et la source d'un cours ; si tu ne \
trouves pas de cours fiable pour un titre, dis-le plutôt que d'inventer.
- Enregistrer un nouvel achat ou une vente (enregistrer_operation) quand l'utilisateur \
te donne un avis d'opéré ou te le demande explicitement.
- Simuler une vente (simuler_vente) avec les frais Coris Bourse.
- Gérer des alertes de cours (ajouter_alerte) et les vérifier après chaque mise à jour.
- Analyser : diversification (secteurs, pays), dividendes attendus, rendement, \
calendrier des assemblées générales et détachements de dividendes.

Règles :
- Ne passe jamais d'ordre toi-même : tu conseilles, l'utilisateur décide et passe ses \
ordres auprès de sa SGI.
- Distingue clairement les faits (cours, dividendes publiés) de ton avis.
- Rappelle brièvement qu'il ne s'agit pas d'un conseil financier agréé quand tu \
recommandes d'acheter ou de vendre.

Date du jour : {date.today().isoformat()}."""


@beta_tool
def voir_portefeuille() -> str:
    """Renvoie la synthèse du portefeuille : lignes, quantités, PRU, dernier cours connu \
et sa date, valeur, poids, plus-values latentes et réalisées, alertes actives."""
    return json.dumps(pf.synthese(pf.charger()), ensure_ascii=False)


@beta_tool
def mettre_a_jour_cours(cours: list[dict]) -> str:
    """Enregistre les derniers cours de clôture trouvés pour un ou plusieurs titres.

    Args:
        cours: Liste d'objets {"ticker": "SNTS", "cours": 25500, "date": "AAAA-MM-JJ", "source": "brvm.org"}.
    """
    data = pf.charger()
    maj = []
    for c in cours:
        ticker = str(c["ticker"]).upper()
        data["cours"][ticker] = {"cours": float(c["cours"]), "date": c["date"], "source": c.get("source", "")}
        maj.append(ticker)
    declenchees = []
    for a in data.get("alertes", []):
        c = data["cours"].get(a["ticker"])
        if not c:
            continue
        if (a["condition"] == "au_dessus" and c["cours"] >= a["seuil"]) or (
            a["condition"] == "en_dessous" and c["cours"] <= a["seuil"]
        ):
            declenchees.append({**a, "cours_actuel": c["cours"]})
    pf.sauvegarder(data)
    return json.dumps({"mis_a_jour": maj, "alertes_declenchees": declenchees}, ensure_ascii=False)


@beta_tool
def enregistrer_operation(
    date_operation: str, sens: str, ticker: str, nom: str, quantite: int, cours: float,
    frais: float | None = None, reference: str = "",
) -> str:
    """Ajoute un achat ou une vente exécuté au portefeuille.

    Args:
        date_operation: Date d'exécution, format AAAA-MM-JJ.
        sens: "A" pour achat, "V" pour vente.
        ticker: Code BRVM du titre (ex. SNTS, ORAC, SGBC).
        nom: Nom de la société.
        quantite: Nombre de titres exécutés.
        cours: Cours d'exécution en FCFA.
        frais: Total des frais de l'avis d'opéré ; si absent, estimé avec le barème Coris Bourse.
        reference: Numéro d'ordre figurant sur l'avis d'opéré.
    """
    sens = sens.upper()
    if sens not in ("A", "V") or quantite <= 0:
        return "Erreur : sens doit valoir A ou V et la quantité être positive."
    data = pf.charger()
    if sens == "V":
        detenu = next((p.quantite for p in pf.positions(data) if p.ticker == ticker.upper()), 0)
        if quantite > detenu:
            return f"Erreur : vente de {quantite} {ticker} alors que seulement {detenu} sont détenus."
    brut = quantite * cours
    if frais is None:
        frais = pf.frais_transaction(brut)["total"]
    net = brut + frais if sens == "A" else brut - frais
    data["operations"].append({
        "date": date_operation, "sens": sens, "ticker": ticker.upper(), "nom": nom,
        "quantite": quantite, "cours": cours, "brut": brut, "frais": frais, "net": net,
        "ref": reference,
    })
    data["cours"].setdefault(ticker.upper(), {"cours": cours, "date": date_operation, "source": "avis d'opéré"})
    pf.sauvegarder(data)
    return f"Opération enregistrée : {sens} {quantite} {ticker.upper()} à {cours} (net {pf.fmt(net)} FCFA)."


@beta_tool
def simuler_vente(ticker: str, quantite: int, cours: float) -> str:
    """Calcule le produit net et la plus-value d'une vente hypothétique, frais Coris Bourse inclus.

    Args:
        ticker: Code BRVM du titre détenu.
        quantite: Nombre de titres à vendre.
        cours: Cours de vente envisagé en FCFA.
    """
    pos = next((p for p in pf.positions(pf.charger()) if p.ticker == ticker.upper()), None)
    if not pos or pos.quantite < quantite:
        return f"Erreur : position insuffisante sur {ticker}."
    brut = quantite * cours
    frais = pf.frais_transaction(brut)
    net = brut - frais["total"]
    pv = net - pos.pru * quantite
    return json.dumps({
        "brut": brut, "frais": frais, "net": net, "pru": round(pos.pru, 2),
        "plus_value": round(pv), "plus_value_pct": round(pv / (pos.pru * quantite) * 100, 2),
        "cours_point_mort": round(pos.pru / (1 - sum((pf.TAUX_BRVM, pf.TAUX_DCBR, pf.TAUX_COURTAGE * (1 + pf.TAUX_TOB)))), 2),
    }, ensure_ascii=False)


@beta_tool
def ajouter_alerte(ticker: str, condition: str, seuil: float, note: str = "") -> str:
    """Crée une alerte de cours, vérifiée à chaque mise à jour des cours.

    Args:
        ticker: Code BRVM du titre.
        condition: "au_dessus" ou "en_dessous".
        seuil: Cours seuil en FCFA.
        note: Raison de l'alerte (ex. "prise de bénéfices").
    """
    if condition not in ("au_dessus", "en_dessous"):
        return "Erreur : condition doit valoir au_dessus ou en_dessous."
    data = pf.charger()
    data.setdefault("alertes", []).append({"ticker": ticker.upper(), "condition": condition, "seuil": seuil, "note": note})
    pf.sauvegarder(data)
    return f"Alerte ajoutée : {ticker.upper()} {condition.replace('_', ' ')} de {pf.fmt(seuil)} FCFA."


TOOLS = [
    voir_portefeuille, mettre_a_jour_cours, enregistrer_operation, simuler_vente, ajouter_alerte,
    {"type": "web_search_20260209", "name": "web_search", "max_uses": 8},
    {"type": "web_fetch_20260209", "name": "web_fetch", "max_uses": 8},
]


def tour(client: anthropic.Anthropic, messages: list) -> None:
    """Exécute un tour d'agent ; relance le runner si le serveur met le tour en pause."""
    for _ in range(MAX_REPRISES):
        runner = client.beta.messages.tool_runner(
            model=MODEL,
            max_tokens=16000,
            system=SYSTEM,
            tools=TOOLS,
            messages=messages,
            thinking={"type": "adaptive"},
            output_config={"effort": "high"},
            betas=["server-side-fallback-2026-07-01"],
            fallbacks="default",
        )
        dernier = None
        for message in runner:
            dernier = message
            messages.append({"role": "assistant", "content": message.content})
            for bloc in message.content:
                if bloc.type == "text" and bloc.text.strip():
                    print(bloc.text)
                elif bloc.type in ("tool_use", "server_tool_use"):
                    print(f"  · {bloc.name}…", file=sys.stderr)
            reponse = runner.generate_tool_call_response()
            if reponse is not None:
                messages.append(reponse)
        if dernier is None or dernier.stop_reason != "pause_turn":
            if dernier is not None and dernier.stop_reason == "refusal":
                print("(La requête a été refusée par le modèle.)")
            return
    print("(Tour interrompu : trop de reprises.)")


def main() -> None:
    client = anthropic.Anthropic()
    messages: list = []
    if len(sys.argv) > 1:
        messages.append({"role": "user", "content": " ".join(sys.argv[1:])})
        tour(client, messages)
        return
    print("Agent portefeuille BRVM — tapez votre question (Ctrl+D pour quitter).\n")
    print(pf.rapport_texte(pf.charger()), "\n")
    while True:
        try:
            question = input("> ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            break
        if question:
            messages.append({"role": "user", "content": question})
            tour(client, messages)
            print()


if __name__ == "__main__":
    main()
