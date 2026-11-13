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

// Repère de mise en page du logo : un carré de 1080 unités (le logo officiel 1254 px y est affiché par réduction
// uniforme ×0,861). Décalage pour centrer le bloc symbole + wordmark + signature dans le 1920x1080.
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
