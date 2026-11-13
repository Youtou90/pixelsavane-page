import React from 'react';
import {lerp} from './motion';

/** Reflet lumineux qui balaie la forme exacte d'un calque (le calque sert de masque). */
export const Glint: React.FC<{src: string; t: number; angle: number; opacity?: number; left: number; top: number; width: number; height: number}> = ({
  src, t, angle, opacity = 0.55, left, top, width, height,
}) => {
  if (t <= 0 || t >= 1) return null;
  const pos = lerp(-30, 130, t);
  return (
    <div
      style={{
        position: 'absolute', left, top, width, height,
        WebkitMaskImage: `url(${src})`, WebkitMaskSize: `${width}px ${height}px`, maskImage: `url(${src})`, maskSize: `${width}px ${height}px`,
        background: `linear-gradient(${angle}deg, transparent ${pos - 12}%, rgba(255,246,230,${opacity}) ${pos}%, transparent ${pos + 12}%)`,
        mixBlendMode: 'screen',
      }}
    />
  );
};
