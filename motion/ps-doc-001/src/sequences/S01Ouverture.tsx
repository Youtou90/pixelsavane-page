import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {C, LOGO_X, LOGO_Y, s, SIGNATURE, toFrame} from '../system/brand';
import {useBrandFonts} from '../system/fonts';
import {clamp, easeIn, easeInOut, easeOut, lerp} from '../system/motion';
import {Glint as GlintBase} from '../system/Glint';
import squaresData from '../../public/squares.json';
import pointsData from '../../public/points.json';

/**
 * SÉQUENCE 01 (0–15 s) — Ouverture / logo animé PS-001-A.
 * Calques extraits du fichier logo original d'Oscar (motion/sources/), posés à l'échelle 1:1.
 */

const CX = 960;
const CY = 540;
const FOCAL = 900; // profondeur de champ : projection perspective des particules

type Kind = 'cluster' | 'p' | 's' | 'free';
type Particle = {
  kind: Kind;
  color: string;
  tx: number; ty: number; tw: number; th: number; // cible (repère image)
  cx: number; cy: number; cz: number; // position du nuage dispersé (3D)
  vx: number; vy: number; // dérive lente
  burst: number; // délai d'éclatement (s)
  conv: number; // délai de convergence (s)
  size: number;
  seed: number;
};


function buildParticles(): Particle[] {
  const list: Particle[] = [];
  const push = (kind: Kind, color: string, tx: number, ty: number, tw: number, th: number, i: number) => {
    const r = (k: number) => random(`${kind}-${i}-${k}`);
    // nuage : couronne elliptique autour du centre, en profondeur
    const ang = r(1) * Math.PI * 2;
    const rad = 180 + Math.pow(r(2), 0.7) * 620;
    list.push({
      kind, color, tx, ty, tw, th,
      cx: CX + Math.cos(ang) * rad * 1.35,
      cy: CY + Math.sin(ang) * rad * 0.62,
      cz: lerp(-350, 700, r(3)),
      vx: (r(4) - 0.5) * 26,
      vy: (r(5) - 0.5) * 18,
      burst: r(6) * 0.9,
      conv: kind === 'cluster' ? 0.35 + r(7) * 0.25 : kind === 'free' ? 0 : r(7) * 0.45,
      size: kind === 'free' ? 4 + r(8) * 10 : 7 + r(8) * 9,
      seed: r(9),
    });
  };
  squaresData.squares.forEach((q, i) => {
    const p = toFrame(q.x, q.y);
    push('cluster', q.color, p.x, p.y, q.w, q.h, i);
  });
  pointsData.p.forEach((q, i) => {
    const p = toFrame(q.x, q.y);
    push('p', q.color, p.x - 5, p.y - 5, 10, 10, i);
  });
  pointsData.s.forEach((q, i) => {
    const p = toFrame(q.x, q.y);
    push('s', q.color, p.x - 5, p.y - 5, 10, 10, i);
  });
  // particules libres d'arrière-plan (bokeh) : ne convergent pas, donnent la profondeur
  const palette = [C.orange, C.orange, C.blanc, C.gris, C.vert];
  for (let i = 0; i < 70; i++) {
    push('free', palette[Math.floor(random(`fc-${i}`) * palette.length)], 0, 0, 0, 0, i);
  }
  return list;
}

const Glint: React.FC<{src: string; t: number; angle: number; opacity?: number}> = (p) => (
  <GlintBase {...p} left={LOGO_X} top={LOGO_Y} width={1080} height={1080} />
);

// Signature officielle — Inter Regular (charte). v1.2 : +28 % par rapport à la v1.1 (30,3 px) à la demande de la DA.
export type OpeningProps = {withAudio?: boolean};
const SIG = {fontSize: 38.8, letterSpacing: '0.07em', top: 797, shift: 11};
// Le trait orange (raster d'origine, non déformé) suit la signature agrandie : simple translation.
const SWOOSH_DX = 36;
const SWOOSH_DY = 9;

export const S01Ouverture: React.FC<OpeningProps> = ({withAudio = true}) => {
  useBrandFonts();
  const f = useCurrentFrame();
  const sec = f / 25;
  const particles = useMemo(buildParticles, []);

  // ——— Caméra : léger travelling avant, se pose à l'échelle 1:1 exacte à 14,4 s ———
  const cam = interpolate(f, [s(2), s(14.4)], [0.93, 1], {...clamp, easing: Easing.bezier(0.33, 0, 0.2, 1)});
  const camY = interpolate(f, [s(2), s(14.4)], [14, 0], {...clamp, easing: Easing.bezier(0.33, 0, 0.2, 1)});

  // ——— Fond : noir absolu 0–2 s, puis noir PixelSavane ———
  const bgMix = interpolate(f, [s(2), s(3.5)], [0, 1], clamp);

  // ——— Lumière orange maîtrisée ———
  const seedGlow = interpolate(f, [s(2), s(2.5), s(4), s(4.6)], [0, 1, 1, 0.25], clamp);
  const flashP = interpolate(f, [s(7.8), s(8.05), s(9.4)], [0, 1, 0], clamp);
  const flashS = interpolate(f, [s(9.8), s(10.05), s(11.4)], [0, 1, 0], clamp);
  const ambient = interpolate(f, [s(2.2), s(4), s(7.8), s(12), s(14.5)], [0, 0.12, 0.45, 0.42, 0.3], clamp);

  // ——— Pixel d'origine (2–4 s) ———
  const seedIn = interpolate(f, [s(2), s(2.7)], [0, 1], {...clamp, easing: easeOut});
  const seedOut = interpolate(f, [s(4), s(4.35)], [1, 0], {...clamp, easing: easeIn});
  const breathe = 1 + 0.06 * Math.sin((sec - 2) * Math.PI * 1.1) * (sec > 2.7 ? 1 : 0);
  const seedSize = 16 * seedIn * breathe * (sec > 4 ? 1 + 0.6 * (1 - seedOut) : 1);

  // ——— Révélations des calques du logo (raster source intact) ———
  const pixelsIn = interpolate(f, [s(7.75), s(8.2)], [0, 1], clamp);
  const pReveal = interpolate(f, [s(8), s(9.1)], [0, 1], {...clamp, easing: easeInOut});
  const pBright = interpolate(f, [s(8), s(9.6)], [1.7, 1], {...clamp, easing: easeOut});
  const sReveal = interpolate(f, [s(10), s(11.1)], [0, 1], {...clamp, easing: easeInOut});
  const sBright = interpolate(f, [s(10), s(11.6)], [1.6, 1], {...clamp, easing: easeOut});
  const wReveal = interpolate(f, [s(12), s(13.2)], [0, 1], {...clamp, easing: easeInOut});
  const wRise = interpolate(f, [s(12), s(13.1)], [16, 0], {...clamp, easing: easeOut});
  const wBlur = interpolate(f, [s(12), s(12.9)], [8, 0], {...clamp, easing: easeOut});
  const swoosh = interpolate(f, [s(14.3), s(14.85)], [0, 1], {...clamp, easing: easeInOut});

  // masques en dégradé doux (bord de 18 %) qui balaient chaque lettre
  const sweepMask = (u: number, angle: number) => {
    const p = lerp(-20, 120, u);
    return `linear-gradient(${angle}deg, #000 ${p - 18}%, transparent ${p}%)`;
  };

  const p0 = toFrame(470, 420); // centre du P
  const s0 = toFrame(700, 420); // centre du S

  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      {withAudio && <Audio src={staticFile('sound.wav')} />}
      <AbsoluteFill style={{backgroundColor: C.noir, opacity: bgMix}} />

      <AbsoluteFill style={{transform: `translateY(${camY}px) scale(${cam})`, transformOrigin: '960px 540px'}}>
        {/* halo orange : pixel d'origine, ambiance, puis flashs P et S */}
        <div style={{position: 'absolute', left: CX - 260, top: CY - 260, width: 520, height: 520, borderRadius: '50%',
          background: `radial-gradient(circle, ${C.orange}55 0%, ${C.orange}00 65%)`, opacity: seedGlow * seedOut + 0}} />
        <div style={{position: 'absolute', left: CX - 700, top: toFrame(0, 420).y - 420, width: 1400, height: 840, borderRadius: '50%',
          background: `radial-gradient(ellipse, ${C.orange}2e 0%, ${C.orange}00 62%)`, opacity: ambient}} />
        <div style={{position: 'absolute', left: p0.x - 420, top: p0.y - 420, width: 840, height: 840, borderRadius: '50%',
          background: `radial-gradient(circle, ${C.orange}66 0%, ${C.orange}00 60%)`, opacity: flashP}} />
        <div style={{position: 'absolute', left: s0.x - 420, top: s0.y - 420, width: 840, height: 840, borderRadius: '50%',
          background: `radial-gradient(circle, #FFB15488 0%, ${C.orange}00 60%)`, opacity: flashS}} />

        {/* particules */}
        {sec >= 4 && particles.map((pt, i) => {
          const burstU = interpolate(sec, [4 + pt.burst * 0.6, 5.6 + pt.burst * 0.5], [0, 1], {...clamp, easing: easeOut});
          if (burstU <= 0) return null;
          const drift = Math.max(0, sec - 4.5);
          let x = lerp(CX, pt.cx + pt.vx * drift, burstU);
          let y = lerp(CY, pt.cy + pt.vy * drift, burstU);
          let z = lerp(0, pt.cz, burstU);
          let size = pt.size;
          let op = interpolate(burstU, [0, 0.15], [0, 1], clamp);
          let w = size, h = size;

          if (pt.kind !== 'free') {
            const cu = interpolate(sec, [6 + pt.conv, 7.6 + pt.conv * 0.5], [0, 1], {...clamp, easing: easeInOut});
            if (cu > 0) {
              const tx = pt.tx + pt.tw / 2, ty = pt.ty + pt.th / 2;
              // trajectoire courbe (léger tourbillon) vers la cible
              const sx = x, sy = y;
              const nx = -(ty - sy), ny = tx - sx;
              const bend = Math.sin(Math.PI * cu) * (pt.seed - 0.5) * 0.35;
              x = lerp(sx, tx, cu) + nx * bend;
              y = lerp(sy, ty, cu) + ny * bend;
              z = lerp(z, 0, cu);
              w = lerp(size, pt.tw, cu);
              h = lerp(size, pt.th, cu);
            }
            // fondu une fois la lettre révélée
            if (pt.kind === 'cluster') op *= 1 - pixelsIn;
            if (pt.kind === 'p') op *= interpolate(sec, [8.0, 8.9], [1, 0], clamp);
            if (pt.kind === 's') {
              const twinkle = 0.55 + 0.45 * Math.sin(sec * 9 + pt.seed * 20);
              op *= interpolate(sec, [7.9, 8.4], [1, 0.35 + 0.25 * twinkle], clamp);
              op *= interpolate(sec, [10.0, 10.9], [1, 0], clamp);
            }
          } else {
            op *= interpolate(sec, [6.2, 8.2], [0.55, 0.16], clamp) * interpolate(sec, [13.5, 14.8], [1, 0.4], clamp);
            x += Math.sin(sec * 0.4 + pt.seed * 6) * 12;
          }
          if (op <= 0.003) return null;

          // projection perspective
          const k = FOCAL / (FOCAL + z);
          const px = CX + (x - CX) * k;
          const py = CY + (y - CY) * k;
          const blur = pt.kind === 'free' ? Math.abs(z) / 140 + 1.2 : Math.max(0, z - 250) / 160;
          const depthFade = interpolate(z, [-350, 0, 700], [0.85, 1, 0.45], clamp);
          const rr = parseInt(pt.color.slice(1, 3), 16), bb = parseInt(pt.color.slice(5, 7), 16);
          const isOrange = rr - bb > 80;
          return (
            <div key={i} style={{
              position: 'absolute', left: px - (w * k) / 2, top: py - (h * k) / 2, width: w * k, height: h * k,
              backgroundColor: pt.color, opacity: op * depthFade,
              filter: blur > 0.3 ? `blur(${blur.toFixed(2)}px)` : undefined,
              boxShadow: pt.kind !== 'free' && isOrange ? `0 0 ${8 * k}px ${C.orange}88` : undefined,
            }} />
          );
        })}

        {/* pixel d'origine */}
        {sec >= 2 && sec < 4.4 && (
          <div style={{position: 'absolute', left: CX - seedSize / 2, top: CY - seedSize / 2, width: seedSize, height: seedSize,
            backgroundColor: C.orange, opacity: seedOut,
            boxShadow: `0 0 ${18 * seedIn}px ${C.orange}, 0 0 ${60 * seedIn}px ${C.orange}99`}} />
        )}

        {/* logo : calques extraits du fichier original, posés à l'échelle 1:1 */}
        <Img src={staticFile('ps-pixels.png')} style={{position: 'absolute', left: LOGO_X, top: LOGO_Y, width: 1080, height: 1080, opacity: pixelsIn}} />
        {pReveal > 0 && (
          <Img src={staticFile('ps-p.png')} style={{position: 'absolute', left: LOGO_X, top: LOGO_Y, width: 1080, height: 1080,
            WebkitMaskImage: sweepMask(pReveal, 20), maskImage: sweepMask(pReveal, 20), filter: pBright > 1.001 ? `brightness(${pBright})` : undefined}} />
        )}
        <Glint src={staticFile('ps-p.png')} t={interpolate(sec, [8.5, 9.7], [0, 1], clamp)} angle={110} />
        {sReveal > 0 && (
          <Img src={staticFile('ps-s.png')} style={{position: 'absolute', left: LOGO_X, top: LOGO_Y, width: 1080, height: 1080,
            WebkitMaskImage: sweepMask(sReveal, 200), maskImage: sweepMask(sReveal, 200), filter: sBright > 1.001 ? `brightness(${sBright})` : undefined}} />
        )}
        <Glint src={staticFile('ps-s.png')} t={interpolate(sec, [10.5, 11.7], [0, 1], clamp)} angle={110} opacity={0.45} />

        {wReveal > 0 && (
          <Img src={staticFile('ps-wordmark.png')} style={{position: 'absolute', left: LOGO_X, top: LOGO_Y + wRise, width: 1080, height: 1080,
            WebkitMaskImage: sweepMask(wReveal, 90), maskImage: sweepMask(wReveal, 90), filter: wBlur > 0.05 ? `blur(${wBlur}px)` : undefined}} />
        )}
        <Glint src={staticFile('ps-wordmark.png')} t={interpolate(sec, [13.0, 13.9], [0, 1], clamp)} angle={100} opacity={0.4} />

        {/* signature officielle recomposée en typographie (police selon la charte) */}
        <div style={{position: 'absolute', left: 0, width: 1920, top: toFrame(0, SIG.top).y, textAlign: 'center',
          fontFamily: 'Inter', fontWeight: 400, fontSize: SIG.fontSize, letterSpacing: SIG.letterSpacing, color: C.blanc, whiteSpace: 'pre'}}>
          <span style={{display: 'inline-block', transform: `translateX(${SIG.shift}px)`}}>
            {SIGNATURE.split('').map((ch, i) => {
              const u = interpolate(sec, [14 + i * 0.011, 14.32 + i * 0.011], [0, 1], {...clamp, easing: easeOut});
              return (
                <span key={i} style={{display: 'inline-block', opacity: u, transform: `translateY(${(1 - u) * 10}px)`,
                  filter: u < 0.999 ? `blur(${(1 - u) * 4}px)` : undefined}}>{ch}</span>
              );
            })}
          </span>
        </div>
        <Img src={staticFile('ps-swoosh.png')} style={{position: 'absolute', left: LOGO_X + SWOOSH_DX, top: LOGO_Y + SWOOSH_DY, width: 1080, height: 1080,
          clipPath: `inset(0 ${100 - lerp(54.5, 84, swoosh)}% 0 0)`, opacity: swoosh > 0 ? 1 : 0}} />
      </AbsoluteFill>

      {/* vignettage cinéma */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)'}} />
    </AbsoluteFill>
  );
};
