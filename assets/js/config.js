/* PixelSavane™ : réglages du site, à un seul endroit.
   Oscar, c'est ici que tu colles tes liens : ils se remplissent partout d'un coup.
   Un lien laissé vide ("") garde le bouton tel quel, avec la mention « lien à venir ». */
window.PS_CONFIG = {
  whatsapp: "237696229416",

  /* Pages de vente, une par service : là où les clients voient l'offre et le prix.
     Les liens sont écrits directement dans les pages (cartes services, tableau, page Services). */
  pageDeVente: "https://pixelsavane-page.vercel.app/",

  /* Réseaux PixelSavane™ (à venir) */
  facebook: "",
  tiktok: "",
  youtube: "",

  /* Profil LinkedIn d'Oscar (page À propos) */
  linkedin: "",

  /* Liens de Samuel Abena, s'il donne son accord (page À propos) */
  samuelYoutube: "",
  samuelFacebook: "",

  /* Tarifs de lancement en FCFA : gardés ici pour mémoire, NON affichés sur le site vitrine.
     Les clients les voient sur chaque page de vente (FichiersDevPagDeVente/outils/generer.py). */
  prix: {
    pubs: 30000,          // 2 vidéos UGC + 4 visuels
    pagesDeVente: 50000,
    agents: 75000,        // + 20 000 FCFA par mois
    sites: 100000,
    applications: 150000  // à partir de, outil simple, sur devis
  }
};
