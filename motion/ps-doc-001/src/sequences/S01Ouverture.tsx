import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {C, LOGO_X, LOGO_Y, s, SIGNATURE, toFrame} from '../system/brand';
import {useBrandFonts} from '../system/fonts';
import {clamp, easeIn, easeInOut, easeOut, lerp} from '../system/motion';
import {Glint as GlintBase} from '../system/Glint';
import squaresData from '../../public/squares.json';
import pointsData from '../../public/points.json';
import lettersData from '../../public/wordmark-letters.json';

const letters = lettersData as {file: string; x: number; y: number; w: number; h: number}[];

/**
 * SÉQUENCE 01 (0–15 s) — Ouverture / logo animé PS-001-A.
 * Calques extraits du fichier logo original d'Oscar (motion/sources/), posés à l'échelle 1:1.
 */

const CX = 960;
const CY = 540;
const FOCAL = 900; // profondeur de champ : projection perspective des particules
const CELL = 17; // pas d'échantillonnage du P et du S = taille d'une tuile du vrai logo
const LOCK_DUR = 0.45; // durée du dernier trajet essaim → pixel exact
// Calendrier de la convergence en deux temps (s)
const LOCK = {gather0: 6.0, c0: 7.35, p0: 7.9, s0: 9.85, span: 1.4};
const P_DONE = LOCK.p0 + LOCK.span + LOCK_DUR; // ≈ 9,75 s
const S_DONE = LOCK.s0 + LOCK.span + LOCK_DUR; // ≈ 11,7 s

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
  ox: number; oy: number; oz: number; // décalage de l'essaim lâche (étape 1 de convergence)
  lockT: number; // instant du verrouillage sur le pixel exact (étape 2)
  qx: number; qy: number; // point source dans le logo (repère 1080×1080)
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
      ox: Math.cos(r(10) * 6.283) * (25 + r(11) * 70),
      oy: Math.sin(r(10) * 6.283) * (25 + r(11) * 70),
      oz: 120 + r(12) * 220,
      lockT: 0, qx: 0, qy: 0,
    });
  };
  squaresData.squares.forEach((q, i) => {
    const p = toFrame(q.x, q.y);
    push('cluster', q.color, p.x, p.y, q.w, q.h, i);
    list[list.length - 1].lockT = LOCK.c0 + random(`lk-c-${i}`) * 0.45;
  });
  const addLetter = (kind: 'p' | 's', pts: {x: number; y: number; color: string}[], start: number, span: number, key: (q: {x: number; y: number}) => number) => {
    // ordre de verrouillage : le tracé de la lettre se construit progressivement
    const order = pts.map((q, i) => ({i, k: key(q)})).sort((a, b) => a.k - b.k);
    const rank = new Map(order.map((o, r) => [o.i, r / (pts.length - 1)]));
    pts.forEach((q, i) => {
      const p = toFrame(q.x - CELL / 2, q.y - CELL / 2);
      push(kind, q.color, p.x, p.y, CELL, CELL, i);
      const pt = list[list.length - 1];
      pt.lockT = start + (rank.get(i) ?? 0) * span + (random(`lk-${kind}-${i}`) - 0.5) * 0.12;
      pt.qx = q.x; pt.qy = q.y;
    });
  };
  // P : du pied du fût vers la boucle (bas → haut) ; S : de la tête vers la queue (haut → bas)
  addLetter('p', pointsData.p, LOCK.p0, LOCK.span, (q) => -q.y + 0.25 * q.x);
  addLetter('s', pointsData.s, LOCK.s0, LOCK.span, (q) => q.y - 0.35 * q.x);
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

// Signature officielle — Inter Regular (charte), +28 % par rapport à la v1.1 (validé v1.2).
export type OpeningProps = {withAudio?: boolean};
const SIG = {fontSize: 38.8, letterSpacing: '0.07em', top: 797};
// Centre horizontal du bloc logo (centre du wordmark) dans l'image — sert à centrer signature et trait.
const LOCKUP_CX = LOGO_X + 546.5;
const SIG_CX = LOCKUP_CX + (0.07 * 38.8) / 2; // compense l'interlettrage après le dernier caractère
// Trait orange (raster d'origine, jamais déformé) : translaté pour rester sous « votre croissance ».
const SWOOSH_DX = Math.round(LOCKUP_CX + 233.8 - 747.5 - LOGO_X);
const SWOOSH_DY = 9;

// Calendrier v1.3 (s)
const T = {
  wordmark0: 11.9, // apparition des lettres entières du wordmark
  sig0: 12.7, // signature
  swoosh0: 13.05,
  still: 13.5, // à partir d'ici : image totalement fixe jusqu'à 15,0 s
};

export const S01Ouverture: React.FC<OpeningProps> = ({withAudio = true}) => {
  useBrandFonts();
  const f = useCurrentFrame();
  const sec = f / 25;
  const particles = useMemo(buildParticles, []);

  // ——— Caméra : léger travelling avant, posé à l'échelle 1:1 exacte à 12,6 s ———
  const camEase = {...clamp, easing: Easing.bezier(0.33, 0, 0.2, 1)};
  const cam = interpolate(f, [s(2), s(12.6)], [0.93, 1], camEase);
  const camY = interpolate(f, [s(2), s(12.6)], [14, 0], camEase);

  // ——— Fond : noir absolu 0–2 s, puis noir PixelSavane ———
  const bgMix = interpolate(f, [s(2), s(3.5)], [0, 1], clamp);

  // ——— Lumière orange discrète (constante pendant le plan final fixe) ———
  const seedGlow = interpolate(f, [s(2), s(2.5), s(4), s(4.6)], [0, 1, 1, 0.25], clamp);
  const flashP = interpolate(sec, [LOCK.p0, LOCK.p0 + 0.5, P_DONE, P_DONE + 0.8], [0, 0.45, 0.6, 0], clamp);
  const flashS = interpolate(sec, [LOCK.s0, LOCK.s0 + 0.5, S_DONE, S_DONE + 0.8], [0, 0.4, 0.55, 0], clamp);
  const ambient = interpolate(sec, [2.2, 4, 7.8, 12, 13], [0, 0.12, 0.4, 0.3, 0.26], clamp);

  // ——— Pixel d'origine (2–4 s) ———
  const seedIn = interpolate(f, [s(2), s(2.7)], [0, 1], {...clamp, easing: easeOut});
  const seedOut = interpolate(f, [s(4), s(4.35)], [1, 0], {...clamp, easing: easeIn});
  const breathe = 1 + 0.06 * Math.sin((sec - 2) * Math.PI * 1.1) * (sec > 2.7 ? 1 : 0);
  const seedSize = 16 * seedIn * breathe * (sec > 4 ? 1 + 0.6 * (1 - seedOut) : 1);

  // ——— Calques complets du logo : ils prennent le relais des tuiles une fois chaque lettre construite ———
  const pixelsIn = interpolate(sec, [LOCK.c0 + 0.6, LOCK.c0 + 1.0], [0, 1], clamp);
  const pFull = interpolate(sec, [P_DONE - 0.15, P_DONE + 0.25], [0, 1], clamp);
  const sFull = interpolate(sec, [S_DONE - 0.15, S_DONE + 0.25], [0, 1], clamp);
  const swoosh = interpolate(sec, [T.swoosh0, T.swoosh0 + 0.45], [0, 1], {...clamp, easing: easeInOut});

  const p0 = toFrame(470, 420); // centre du P
  const s0 = toFrame(700, 420); // centre du S
  const layer = {position: 'absolute' as const, left: LOGO_X, top: LOGO_Y, width: 1080, height: 1080};

  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      {withAudio && <Audio src={staticFile('sound.wav')} />}
      <AbsoluteFill style={{backgroundColor: C.noir, opacity: bgMix}} />

      <AbsoluteFill style={{transform: `translateY(${camY}px) scale(${cam})`, transformOrigin: '960px 540px'}}>
        {/* halos orange : pixel d'origine, ambiance, construction du P puis du S */}
        <div style={{position: 'absolute', left: CX - 260, top: CY - 260, width: 520, height: 520, borderRadius: '50%',
          background: `radial-gradient(circle, ${C.orange}55 0%, ${C.orange}00 65%)`, opacity: seedGlow * seedOut}} />
        <div style={{position: 'absolute', left: LOCKUP_CX - 700, top: toFrame(0, 430).y - 420, width: 1400, height: 840, borderRadius: '50%',
          background: `radial-gradient(ellipse, ${C.orange}2e 0%, ${C.orange}00 62%)`, opacity: ambient}} />
        <div style={{position: 'absolute', left: p0.x - 380, top: p0.y - 380, width: 760, height: 760, borderRadius: '50%',
          background: `radial-gradient(circle, ${C.orange}55 0%, ${C.orange}00 60%)`, opacity: flashP}} />
        <div style={{position: 'absolute', left: s0.x - 380, top: s0.y - 380, width: 760, height: 760, borderRadius: '50%',
          background: `radial-gradient(circle, #FFB15477 0%, ${C.orange}00 60%)`, opacity: flashS}} />

        {/* tuiles du VRAI logo : chaque particule verrouillée dévoile le morceau du calque officiel sous elle */}
        {sec > LOCK.p0 && pFull < 1 && particles.map((pt, i) => {
          if (pt.kind !== 'p') return null;
          const u = interpolate(sec, [pt.lockT + LOCK_DUR - 0.05, pt.lockT + LOCK_DUR + 0.2], [0, 1], clamp);
          if (u <= 0) return null;
          const glow = interpolate(sec, [pt.lockT + LOCK_DUR, pt.lockT + LOCK_DUR + 0.5], [1.9, 1], clamp);
          return <div key={`tp${i}`} style={tile('ps-p.png', pt, u, glow)} />;
        })}
        {sec > LOCK.s0 && sFull < 1 && particles.map((pt, i) => {
          if (pt.kind !== 's') return null;
          const u = interpolate(sec, [pt.lockT + LOCK_DUR - 0.05, pt.lockT + LOCK_DUR + 0.2], [0, 1], clamp);
          if (u <= 0) return null;
          const glow = interpolate(sec, [pt.lockT + LOCK_DUR, pt.lockT + LOCK_DUR + 0.5], [1.8, 1], clamp);
          return <div key={`ts${i}`} style={tile('ps-s.png', pt, u, glow)} />;
        })}

        {/* particules */}
        {sec >= 4 && sec < T.still && particles.map((pt, i) => {
          const burstU = interpolate(sec, [4 + pt.burst * 0.6, 5.6 + pt.burst * 0.5], [0, 1], {...clamp, easing: easeOut});
          if (burstU <= 0) return null;
          const drift = Math.max(0, sec - 4.5);
          let x = lerp(CX, pt.cx + pt.vx * drift, burstU);
          let y = lerp(CY, pt.cy + pt.vy * drift, burstU);
          let z = lerp(0, pt.cz, burstU);
          const size = pt.size;
          let op = interpolate(burstU, [0, 0.15], [0, 1], clamp);
          let w = size, h = size;

          if (pt.kind !== 'free') {
            const tx = pt.tx + pt.tw / 2, ty = pt.ty + pt.th / 2;
            // Étape 1 (6–7,8 s) : convergence douce vers un essaim lâche qui dessine déjà le PS
            const g = interpolate(sec, [LOCK.gather0 + pt.conv, LOCK.gather0 + 1.3 + pt.conv], [0, 1], {...clamp, easing: easeInOut});
            const hover = Math.sin(sec * 2.2 + pt.seed * 12) * 3;
            const lx = tx + pt.ox + hover, ly = ty + pt.oy - hover, lz = pt.oz;
            if (g > 0) {
              const nx = -(ly - y), ny = lx - x;
              const bend = Math.sin(Math.PI * g) * (pt.seed - 0.5) * 0.3;
              x = lerp(x, lx, g) + nx * bend;
              y = lerp(y, ly, g) + ny * bend;
              z = lerp(z, lz, g);
              w = h = lerp(size, Math.min(size, 10), g);
            }
            // Étape 2 : verrouillage, un par un, sur le pixel exact du logo
            const lk = interpolate(sec, [pt.lockT, pt.lockT + LOCK_DUR], [0, 1], {...clamp, easing: easeInOut});
            if (lk > 0) {
              x = lerp(x, tx, lk);
              y = lerp(y, ty, lk);
              z = lerp(z, 0, lk);
              w = lerp(w, pt.tw, lk);
              h = lerp(h, pt.th, lk);
            }
            if (pt.kind === 'cluster') op *= 1 - pixelsIn;
            else op *= interpolate(sec, [pt.lockT + LOCK_DUR, pt.lockT + LOCK_DUR + 0.25], [1, 0], clamp);
          } else {
            op *= interpolate(sec, [6.2, 8.2], [0.55, 0.16], clamp) * interpolate(sec, [12.4, T.still - 0.1], [1, 0], clamp);
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

        {/* logo officiel : calques importés du fichier du fondateur, échelle 1:1, proportions intactes */}
        <Img src={staticFile('ps-pixels.png')} style={{...layer, opacity: pixelsIn}} />
        <Img src={staticFile('ps-p.png')} style={{...layer, opacity: pFull}} />
        <Glint src={staticFile('ps-p.png')} t={interpolate(sec, [P_DONE, P_DONE + 0.8], [0, 1], clamp)} angle={110} opacity={0.4} />
        <Img src={staticFile('ps-s.png')} style={{...layer, opacity: sFull}} />
        <Glint src={staticFile('ps-s.png')} t={interpolate(sec, [S_DONE, S_DONE + 0.8], [0, 1], clamp)} angle={110} opacity={0.35} />

        {/* wordmark : chaque lettre apparaît ENTIÈRE (aucune coupe), mot complet visible à la fin */}
        {letters.map((l, i) => {
          const t0 = T.wordmark0 + i * 0.06;
          const u = interpolate(sec, [t0, t0 + 0.5], [0, 1], {...clamp, easing: easeOut});
          if (u <= 0) return null;
          return (
            <Img key={l.file} src={staticFile(l.file)} style={{position: 'absolute', left: LOGO_X + l.x, top: LOGO_Y + l.y, width: l.w, height: l.h,
              opacity: u, transform: u < 1 ? `translateY(${(1 - u) * 18}px)` : undefined,
              filter: u < 0.999 ? `blur(${((1 - u) * 6).toFixed(2)}px)` : undefined}} />
          );
        })}

        {/* signature officielle, texte exact, Inter Regular 38,8 px */}
        <div style={{position: 'absolute', left: SIG_CX - 960, width: 1920, top: toFrame(0, SIG.top).y, textAlign: 'center',
          fontFamily: 'Inter', fontWeight: 400, fontSize: SIG.fontSize, letterSpacing: SIG.letterSpacing, color: C.blanc, whiteSpace: 'pre'}}>
          {SIGNATURE.split('').map((ch, i) => {
            const u = interpolate(sec, [T.sig0 + i * 0.008, T.sig0 + 0.3 + i * 0.008], [0, 1], {...clamp, easing: easeOut});
            return (
              <span key={i} style={{display: 'inline-block', opacity: u, transform: u < 1 ? `translateY(${(1 - u) * 10}px)` : undefined,
                filter: u < 0.999 ? `blur(${(1 - u) * 4}px)` : undefined}}>{ch}</span>
            );
          })}
        </div>
        <Img src={staticFile('ps-swoosh.png')} style={{...layer, left: LOGO_X + SWOOSH_DX, top: LOGO_Y + SWOOSH_DY,
          clipPath: `inset(0 ${100 - lerp(54.5, 84, swoosh)}% 0 0)`, opacity: swoosh > 0 ? 1 : 0}} />
      </AbsoluteFill>

      {/* vignettage cinéma */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)'}} />
    </AbsoluteFill>
  );
};

// Tuile 17×17 px découpée dans le calque officiel (background-position) : aucun redessin.
function tile(file: string, pt: Particle, opacity: number, brightness: number): React.CSSProperties {
  const x = pt.qx - CELL / 2, y = pt.qy - CELL / 2;
  return {
    position: 'absolute', left: LOGO_X + x, top: LOGO_Y + y, width: CELL + 1, height: CELL + 1, // +1 px : recouvrement, pas de joint visible
    backgroundImage: `url(${staticFile(file)})`, backgroundSize: '1080px 1080px', backgroundPosition: `${-x}px ${-y}px`,
    opacity, filter: brightness > 1.001 ? `brightness(${brightness.toFixed(3)})` : undefined,
  };
}
