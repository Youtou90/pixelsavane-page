// Identité PixelSavane — couleurs officielles
export const C = {
  noir: '#0E0E10',
  orange: '#F28C28',
  blanc: '#FAFAFA',
  gris: '#70757A',
  vert: '#3F7C48',
};
export const FPS = 25;
export const s = (sec: number) => Math.round(sec * FPS); // secondes -> frames

// Le logo source (1080x1080) est posé à l'échelle 1:1 (aucune perte de qualité).
// Décalage pour centrer le bloc symbole + wordmark + signature (y 223→876 dans la source) dans le 1920x1080.
export const LOGO_X = 413;
export const LOGO_Y = -14;
export const toFrame = (x: number, y: number) => ({x: x + LOGO_X, y: y + LOGO_Y});

// Typographies de la charte PS-DOC-001 (licence OFL, via @fontsource)
export const FONTS = {
  titre: {fontFamily: 'Space Grotesk', fontWeight: 700}, // titres
  sousTitre: {fontFamily: 'Sora', fontWeight: 600}, // sous-titres
  texte: {fontFamily: 'Inter', fontWeight: 400}, // textes, signature, sous-titres du film
} as const;

export const SIGNATURE = 'Le numérique au service de votre croissance.';
