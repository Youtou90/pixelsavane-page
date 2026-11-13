import React from 'react';
import {random, staticFile, useCurrentFrame} from 'remotion';

/** Grain argentique discret (texture locale tuilée, décalée à chaque image). */
export const FilmGrain: React.FC<{opacity?: number}> = ({opacity = 0.06}) => {
  const f = useCurrentFrame();
  const x = Math.floor(random(`gx${f}`) * 512), y = Math.floor(random(`gy${f}`) * 512);
  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', opacity, mixBlendMode: 'overlay',
      backgroundImage: `url(${staticFile('s03/grain.png')})`, backgroundPosition: `${x}px ${y}px`}} />
  );
};
