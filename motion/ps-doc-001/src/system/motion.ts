import {Easing} from 'remotion';

// Courbes de la bible visuelle
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1); // apparitions
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1); // déplacements, balayages
export const easeIn = Easing.bezier(0.55, 0, 1, 0.45);
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
