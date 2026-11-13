import React from 'react';
import {Composition} from 'remotion';
import {S01Ouverture} from './sequences/S01Ouverture';
import {S02Fondateur} from './sequences/S02Fondateur';

// Une composition par séquence (25 fps, 1920×1080). Le master 180 s assemblera ces composants
// avec <Series> une fois les ressources officielles et le script reçus.
const common = {fps: 25, width: 1920, height: 1080} as const;

export const Root: React.FC = () => (
  <>
    <Composition id="S01-Ouverture" component={S01Ouverture} durationInFrames={375} {...common} defaultProps={{withAudio: true}} />
    <Composition id="S02-Fondateur" component={S02Fondateur} durationInFrames={625} {...common} />
  </>
);
