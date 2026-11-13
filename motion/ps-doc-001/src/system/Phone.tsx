import React from 'react';

/** Cadre de smartphone générique (aucune marque, aucune interface de plateforme réelle). */
export const Phone: React.FC<{x: number; y: number; w: number; h: number; rotate?: number; opacity?: number; children: React.ReactNode}> = ({
  x, y, w, h, rotate = 0, opacity = 1, children,
}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w + 24, height: h + 24, borderRadius: 54, padding: 12,
    background: 'linear-gradient(160deg, #2a2a2e, #0b0b0d 60%)', boxShadow: '0 40px 90px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.08)',
    transform: `rotate(${rotate}deg)`, opacity}}>
    <div style={{position: 'relative', width: w, height: h, borderRadius: 42, overflow: 'hidden', background: '#000'}}>
      {children}
      <div style={{position: 'absolute', top: 12, left: '50%', width: 96, height: 26, marginLeft: -48, borderRadius: 13, background: '#000'}} />
    </div>
  </div>
);
