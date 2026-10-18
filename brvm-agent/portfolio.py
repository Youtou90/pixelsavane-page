"""Logique du portefeuille BRVM : positions, PRU, plus-values, frais Coris Bourse.

Aucune dépendance à l'API Claude : ce module peut être utilisé seul
(`python portfolio.py` affiche le rapport).
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import date
from pathlib import Path

FICHIER = Path(__file__).with_name("portefeuille.json")

# Barème observé sur les avis d'opéré Coris Bourse (en % du montant brut) :
# commission BRVM 0,20 %, DC/BR 0,10 %, courtage 0,80 %, TOB 15 % du courtage.
TAUX_BRVM = 0.002
TAUX_DCBR = 0.001
TAUX_COURTAGE = 0.008
TAUX_TOB = 0.15


def frais_transaction(brut: float) -> dict:
    brvm = round(brut * TAUX_BRVM)
    dcbr = round(brut * TAUX_DCBR)
    courtage = round(brut * TAUX_COURTAGE)
    tob = round(courtage * TAUX_TOB)
    return {"brvm": brvm, "dcbr": dcbr, "courtage": courtage, "tob": tob,
            "total": brvm + dcbr + courtage + tob}


def charger(fichier: Path = FICHIER) -> dict:
    return json.loads(fichier.read_text(encoding="utf-8"))


def sauvegarder(data: dict, fichier: Path = FICHIER) -> None:
    fichier.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


@dataclass
class Position:
    ticker: str
    nom: str
    quantite: int
    cout_total: float  # frais d'achat inclus
    pv_realisee: float
    cours: float | None
    date_cours: str | None

    @property
    def pru(self) -> float:
        return self.cout_total / self.quantite if self.quantite else 0.0

    @property
    def valeur(self) -> float:
        return (self.cours or 0) * self.quantite

    @property
    def pv_latente(self) -> float:
        return self.valeur - self.cout_total

    @property
    def pv_latente_pct(self) -> float:
        return self.pv_latente / self.cout_total * 100 if self.cout_total else 0.0


def positions(data: dict) -> list[Position]:
    """Agrège les opérations en positions (méthode du coût moyen pondéré)."""
    pos: dict[str, Position] = {}
    for op in sorted(data["operations"], key=lambda o: o["date"]):
        p = pos.setdefault(op["ticker"], Position(op["ticker"], op["nom"], 0, 0.0, 0.0, None, None))
        if op["sens"] == "A":
            p.quantite += op["quantite"]
            p.cout_total += op["net"]
        else:
            pru = p.pru
            p.pv_realisee += op["net"] - pru * op["quantite"]
            p.cout_total -= pru * op["quantite"]
            p.quantite -= op["quantite"]
    for p in pos.values():
        c = data["cours"].get(p.ticker)
        if c:
            p.cours, p.date_cours = c["cours"], c["date"]
    return sorted(pos.values(), key=lambda p: -p.valeur)


def synthese(data: dict) -> dict:
    ps = positions(data)
    ouvertes = [p for p in ps if p.quantite > 0]
    investi = sum(p.cout_total for p in ouvertes)
    valeur = sum(p.valeur for p in ouvertes)
    return {
        "date": date.today().isoformat(),
        "investi": round(investi),
        "valeur_marche": round(valeur),
        "pv_latente": round(valeur - investi),
        "pv_latente_pct": round((valeur - investi) / investi * 100, 2) if investi else 0,
        "pv_realisee": round(sum(p.pv_realisee for p in ps)),
        "lignes": [
            {
                "ticker": p.ticker,
                "nom": p.nom,
                "quantite": p.quantite,
                "pru": round(p.pru, 2),
                "cours": p.cours,
                "date_cours": p.date_cours,
                "valeur": round(p.valeur),
                "poids_pct": round(p.valeur / valeur * 100, 2) if valeur else 0,
                "pv_latente": round(p.pv_latente),
                "pv_latente_pct": round(p.pv_latente_pct, 2),
            }
            for p in ouvertes
        ],
        "alertes": data.get("alertes", []),
    }


def fmt(n: float) -> str:
    return f"{n:,.0f}".replace(",", " ")


def rapport_texte(data: dict) -> str:
    s = synthese(data)
    lignes = [
        f"Portefeuille BRVM au {s['date']}",
        f"{'Titre':<6} {'Qté':>4} {'PRU':>9} {'Cours':>8} {'Valeur':>10} {'Poids':>6} {'+/- latente':>12} {'%':>7}  Cours du",
    ]
    for l in s["lignes"]:
        lignes.append(
            f"{l['ticker']:<6} {l['quantite']:>4} {fmt(l['pru']):>9} {fmt(l['cours'] or 0):>8} "
            f"{fmt(l['valeur']):>10} {l['poids_pct']:>5.1f}% {fmt(l['pv_latente']):>12} "
            f"{l['pv_latente_pct']:>6.2f}%  {l['date_cours']}"
        )
    lignes += [
        "",
        f"Investi (frais inclus) : {fmt(s['investi'])} FCFA",
        f"Valeur de marché       : {fmt(s['valeur_marche'])} FCFA",
        f"Plus-value latente     : {fmt(s['pv_latente'])} FCFA ({s['pv_latente_pct']} %)",
        f"Plus-value réalisée    : {fmt(s['pv_realisee'])} FCFA",
    ]
    return "\n".join(lignes)


if __name__ == "__main__":
    print(rapport_texte(charger()))
