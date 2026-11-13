import React, {useMemo} from 'react';
import {random} from 'remotion';
import {C} from './brand';

/**
 * Transition par pixels de la charte : une vague de carrés couvre l'image (front orange, cœur noir),
 * puis se retire en révélant le plan suivant. t = temps relatif au point de coupe (s).
 */
export const PixelWipe: React.FC<{t: number; half?: number; cols?: number}> = ({t, half = 0.38, cols = 32}) => {
  const rows = Math.round((cols * 1080) / 1920);
  const cw = 1920 / cols, ch = 1080 / rows;
  const cells = useMemo(() => {
    const out: {x: number; y: number; d: number}[] = [];
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const d = (i / cols) * 0.75 + (j / rows) * 0.25; // vague diagonale gauche → droite
      out.push({x: i * cw, y: j * ch, d: Math.min(1, d * 0.8 + random(`pw${i}-${j}`) * 0.2)});
    }
    return out;
  }, [cols, rows, cw, ch]);
  if (t <= -half || t >= half) return null;
  const covering = t < 0;
  const p = covering ? (t + half) / half : t / half; // 0 → 1 dans chaque phase
  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      {cells.map((c, k) => {
        const local = Math.max(0, Math.min(1, (p - c.d * 0.7) / 0.3));
        const s = covering ? local : 1 - local;
        if (s <= 0) return null;
        const edge = s < 0.999;
        return (
          <div key={k} style={{position: 'absolute', left: c.x, top: c.y, width: cw + 0.5, height: ch + 0.5,
            transform: edge ? `scale(${s})` : undefined, background: edge ? C.orange : C.noir,
            boxShadow: edge ? `0 0 10px ${C.orange}88` : undefined}} />
        );
      })}
    </div>
  );
};
