import React, {useMemo} from 'react';
import {AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {C, FONTS} from '../system/brand';
import {useBrandFonts} from '../system/fonts';
import {clamp, easeIn, easeInOut, easeOut, lerp} from '../system/motion';
import mosaic from '../../public/s02-portrait-mosaic.json';
import icons from '../../public/s02-icons.json';

/**
 * SÉQUENCE 02 (00:25–00:50 du film, 25 s) — « La naissance d'une conviction » — v1.3, maquette muette.
 *  A. titre de chapitre ;
 *  B. Entrepreneurs · PME · Commerçants · Entreprises : pictogrammes au trait rasterisés en pixels fins ;
 *  C. les panneaux se brisent en pixels qui volent vers le portrait et le composent en mosaïque,
 *     chaque carré se résout ensuite en photo nette ; puis mouvement de caméra lent ;
 *  D. identification « OSCAR YOUTOU — Fondateur et Directeur Créatif ».
 * Portrait : motion/sources/1000338417.png, affiché tel quel (aucune retouche, aucune IA, jamais agrandi).
 */

const FPS = 25;

type Pix = {c: number; r: number; a: number; o: number};
const ICON_SET = icons as unknown as Record<string, Pix[]> & {cols: number};

const PANELS = [
  {key: 'entrepreneurs', label: 'Entrepreneurs'},
  {key: 'pme', label: 'PME'},
  {key: 'commercants', label: 'Commerçants'},
  {key: 'entreprises', label: 'Entreprises'},
];
const PW = 340, PH = 470, PGAP = 36, PTOP = 330;
const panelX = (i: number) => 960 - (4 * PW + 3 * PGAP) / 2 + i * (PW + PGAP);
const PITCH = 9, PSIZE = 7; // pas et taille d'un pixel de pictogramme

// Cadre du portrait (doit correspondre à scripts/prepare_s02.py)
const BOX = {left: 930, top: 0, w: 990, h: 1080};
const M = mosaic as {dw: number; dh: number; oy: number; cell: number; face: number[]; cells: {i: number; j: number; c: string}[]};

const T = {
  title: [0.4, 3.7],
  panels0: 3.4,
  breakup: 10.5, // les panneaux se brisent en pixels
  arrive0: 11.4, // premiers carrés posés sur le portrait
  arriveSpan: 2.0,
  sharpen: 0.55, // délai mosaïque → photo nette pour chaque carré
  full: 14.3, // la photo entière prend le relais (identique)
  lt0: 14.9, // identification
  out: 24.1,
};

export const S02Fondateur: React.FC = () => {
  useBrandFonts();
  const f = useCurrentFrame();
  const sec = f / FPS;

  // ——— A. Titre ———
  const titleIn = interpolate(sec, [T.title[0], T.title[0] + 1], [0, 1], {...clamp, easing: easeOut});
  const titleOut = interpolate(sec, [3.0, T.title[1]], [0, 1], {...clamp, easing: easeIn});
  const chapterTag = interpolate(sec, [3.4, 4.0, 23.6, 24.4], [0, 1, 1, 0], clamp);

  // ——— B. Panneaux ———
  const panelsOut = interpolate(sec, [T.breakup, T.breakup + 0.7], [0, 1], {...clamp, easing: easeIn});
  const drift = interpolate(sec, [3, 11], [24, -24]);

  // ——— C. Portrait ———
  const cells = useMemo(() => {
    const [fx, fy] = M.face;
    const maxD = Math.hypot(M.dw, M.dh) * 0.75;
    return M.cells.map((c, k) => {
      const cx = c.i * M.cell + M.cell / 2, cy = c.j * M.cell + M.cell / 2 + M.oy;
      const d = Math.min(1, Math.hypot(cx - fx, cy - fy - M.oy) / maxD);
      const arrive = T.arrive0 + d * T.arriveSpan + (random(`a${k}`) - 0.5) * 0.25;
      // point de départ : un des panneaux qui se brisent (repère du cadre portrait)
      const pi = Math.floor(random(`p${k}`) * 4);
      const sx = panelX(pi) + random(`x${k}`) * PW - BOX.left;
      const sy = PTOP + 60 + random(`y${k}`) * (PH - 120) - BOX.top;
      return {...c, cx, cy, arrive, sx, sy, depart: Math.max(T.breakup, arrive - 1.05)};
    });
  }, []);
  const cam = interpolate(sec, [11.2, 25], [1, 1.08], {...clamp, easing: easeInOut}); // reste < résolution native
  const camX = interpolate(sec, [11.2, 25], [0, -14], {...clamp, easing: easeInOut});
  const fullIn = interpolate(sec, [T.full, T.full + 0.4], [0, 1], clamp);
  const boxEdges = interpolate(sec, [11.2, 12.4], [0, 1], clamp);
  const endFade = interpolate(sec, [24.2, 25], [1, 0], {...clamp, easing: easeIn});

  // ——— D. Identification ———
  const ltSquare = interpolate(sec, [T.lt0, T.lt0 + 0.4], [0, 1], {...clamp, easing: easeOut});
  const ltName = interpolate(sec, [T.lt0 + 0.2, T.lt0 + 1.1], [0, 1], {...clamp, easing: easeOut});
  const ltLine = interpolate(sec, [T.lt0 + 0.6, T.lt0 + 1.6], [0, 1], {...clamp, easing: easeInOut});
  const ltRole = interpolate(sec, [T.lt0 + 1.0, T.lt0 + 1.8], [0, 1], {...clamp, easing: easeOut});
  const ltOut = interpolate(sec, [T.out, T.out + 0.8], [0, 1], {...clamp, easing: easeIn});

  const origin = `${M.face[0]}px ${M.face[1] + M.oy}px`;

  return (
    <AbsoluteFill style={{backgroundColor: C.noir, overflow: 'hidden'}}>
      {/* lumière orange de fond, discrète */}
      <div style={{position: 'absolute', left: -200, top: 260, width: 1400, height: 900, borderRadius: '50%',
        background: `radial-gradient(ellipse, ${C.orange}1f 0%, ${C.orange}00 60%)`, opacity: 1 - panelsOut * 0.6}} />
      <div style={{position: 'absolute', left: 900, top: -120, width: 1200, height: 1300, borderRadius: '50%',
        background: `radial-gradient(ellipse, ${C.orange}24 0%, ${C.orange}00 62%)`,
        opacity: interpolate(sec, [11, 13.5], [0, 1], clamp) * endFade}} />

      {/* A — titre */}
      {sec < 3.8 && (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: 1 - titleOut}}>
          <div style={{...FONTS.sousTitre, fontSize: 26, letterSpacing: '0.3em', color: C.orange,
            opacity: titleIn, transform: `translateY(${(1 - titleIn) * 14}px)`}}>02</div>
          <div style={{...FONTS.titre, fontSize: 92, color: C.blanc, marginTop: 18, letterSpacing: '-0.01em',
            opacity: titleIn, transform: `translateY(${(1 - titleIn) * 24 - titleOut * 30}px)`,
            filter: titleIn < 1 ? `blur(${(1 - titleIn) * 8}px)` : undefined}}>
            La naissance d'une conviction
          </div>
          <div style={{width: lerp(0, 140, titleIn), height: 4, background: C.orange, marginTop: 28}} />
        </AbsoluteFill>
      )}

      {/* repère de chapitre */}
      <div style={{position: 'absolute', left: 96, top: 72, ...FONTS.sousTitre, fontSize: 18, letterSpacing: '0.24em',
        color: C.gris, opacity: chapterTag, display: 'flex', alignItems: 'center', gap: 14}}>
        <div style={{width: 10, height: 10, background: C.orange}} />02 — LA NAISSANCE D'UNE CONVICTION
      </div>

      {/* B — panneaux premium */}
      {sec > 3.2 && sec < T.breakup + 1.2 && PANELS.map((p, i) => {
        const t0 = T.panels0 + i * 0.45;
        const u = interpolate(sec, [t0, t0 + 1.1], [0, 1], {...clamp, easing: easeOut});
        const x = panelX(i) + drift * (0.6 + i * 0.15);
        const y = PTOP + (1 - u) * 50;
        const grid = ICON_SET[p.key];
        const iconW = ICON_SET.cols * PITCH;
        return (
          <div key={p.key} style={{position: 'absolute', left: x, top: y, width: PW, height: PH, opacity: u}}>
            {/* cadre : se dissout au moment où les pixels s'envolent */}
            <div style={{position: 'absolute', inset: 0, opacity: 1 - panelsOut,
              background: `linear-gradient(180deg, #161619 0%, #111113 70%, #17120d 100%)`,
              border: '1px solid rgba(250,250,250,0.06)', boxShadow: '0 30px 60px rgba(0,0,0,0.35)'}}>
              <div style={{position: 'absolute', left: 0, top: 0, height: 2, width: lerp(0, 56, u), background: C.orange}} />
              <div style={{position: 'absolute', left: 26, top: 24, ...FONTS.sousTitre, fontSize: 15, letterSpacing: '0.2em', color: C.gris}}>
                0{i + 1}
              </div>
              <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 180,
                background: `radial-gradient(ellipse at 50% 100%, ${C.orange}26 0%, ${C.orange}00 70%)`}} />
              <div style={{position: 'absolute', left: 0, right: 0, bottom: 56, textAlign: 'center', ...FONTS.sousTitre,
                fontSize: 28, color: C.blanc, opacity: interpolate(sec, [t0 + 0.7, t0 + 1.4], [0, 1], clamp)}}>{p.label}</div>
              <div style={{position: 'absolute', left: (PW - 36) / 2, bottom: 38, width: 36, height: 2, background: C.orange,
                opacity: interpolate(sec, [t0 + 0.9, t0 + 1.5], [0, 1], clamp)}} />
            </div>
            {/* pictogramme : pixels qui se posent un à un, du haut vers le bas */}
            {grid.map((px, k) => {
              const rk = random(`${p.key}-${k}`);
              const a0 = t0 + 0.25 + (px.r / ICON_SET.cols) * 0.8 + rk * 0.35;
              const a = interpolate(sec, [a0, a0 + 0.6], [0, 1], {...clamp, easing: easeOut});
              const out = interpolate(sec, [T.breakup + rk * 0.4, T.breakup + 0.5 + rk * 0.4], [0, 1], {...clamp, easing: easeIn});
              if (a <= 0 || out >= 1) return null;
              const sx = (random(`${p.key}-${k}-x`) - 0.5) * 220, sy = (random(`${p.key}-${k}-y`) - 0.5) * 220;
              return (
                <div key={k} style={{position: 'absolute',
                  left: (PW - iconW) / 2 + px.c * PITCH + sx * (1 - a) + out * (300 + rk * 300),
                  top: 70 + px.r * PITCH + sy * (1 - a) - out * 60 * (rk - 0.3),
                  width: PSIZE, height: PSIZE, opacity: a * px.a * (1 - out),
                  background: px.o ? C.orange : C.blanc,
                  boxShadow: px.o ? `0 0 8px ${C.orange}99` : undefined}} />
              );
            })}
          </div>
        );
      })}

      {/* C — portrait réel : mosaïque de pixels qui se résout en photo nette, puis caméra lente */}
      {sec > T.breakup && (
        <div style={{position: 'absolute', left: BOX.left, top: BOX.top, width: BOX.w, height: BOX.h, opacity: endFade}}>
          {/* calque photo, rogné au cadre : photo entière + carrés nets (même transformation de caméra) */}
          <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
            <div style={{position: 'absolute', inset: 0, transform: `translateX(${camX}px) scale(${cam})`, transformOrigin: origin}}>
              {/* toujours monté (opacité 0 au début) : garantit le chargement de la photo avant le rendu des carrés */}
              <Img src={staticFile('portrait-oscar-1000338417.png')} style={{position: 'absolute', left: 0, top: M.oy, width: M.dw, height: M.dh, opacity: fullIn}} />
              {fullIn < 1 && cells.map((c, k) => {
                const sharp = interpolate(sec, [c.arrive + T.sharpen, c.arrive + T.sharpen + 0.4], [0, 1], clamp);
                if (sharp <= 0) return null;
                const tx = c.i * M.cell, ty = c.j * M.cell + M.oy;
                return (
                  <div key={k} style={{position: 'absolute', left: tx, top: ty, width: M.cell + 1, height: M.cell + 1, opacity: sharp,
                    backgroundImage: `url(${staticFile('portrait-oscar-1000338417.png')})`,
                    backgroundSize: `${M.dw}px ${M.dh}px`, backgroundPosition: `${-tx}px ${-(ty - M.oy)}px`}} />
                );
              })}
            </div>
          </div>
          {/* calque pixels, non rogné : carrés qui volent depuis les panneaux puis mosaïque */}
          <div style={{position: 'absolute', inset: 0, transform: `translateX(${camX}px) scale(${cam})`, transformOrigin: origin}}>
            {fullIn < 1 && cells.map((c, k) => {
              const fly = interpolate(sec, [c.depart, c.arrive], [0, 1], {...clamp, easing: easeInOut});
              if (fly <= 0) return null;
              const sharp = interpolate(sec, [c.arrive + T.sharpen, c.arrive + T.sharpen + 0.4], [0, 1], clamp);
              if (sharp >= 1) return null;
              const tx = c.i * M.cell, ty = c.j * M.cell + M.oy;
              const landed = sec >= c.arrive;
              const size = lerp(9, M.cell - 4, fly);
              const x = lerp(c.sx, tx + (M.cell - size) / 2, fly), y = lerp(c.sy, ty + (M.cell - size) / 2, fly);
              const flash = interpolate(sec, [c.arrive, c.arrive + 0.35], [1, 0], clamp);
              return (
                <div key={k} style={{position: 'absolute', left: landed ? tx + 1.5 : x, top: landed ? ty + 1.5 : y,
                  width: landed ? M.cell - 3 : size, height: landed ? M.cell - 3 : size,
                  background: landed ? c.c : (k % 3 === 0 ? C.blanc : C.orange),
                  opacity: (landed ? 1 : 0.55 + 0.45 * fly) * (1 - sharp),
                  boxShadow: landed && flash > 0 ? `0 0 ${14 * flash}px ${C.orange}` : undefined}} />
              );
            })}
          </div>
          {/* fondus de bord vers le noir de la charte (la photo elle-même n'est pas retouchée) */}
          <div style={{position: 'absolute', inset: 0, opacity: boxEdges, pointerEvents: 'none',
            background: `linear-gradient(90deg, ${C.noir} 0%, ${C.noir}00 24%)`}} />
          <div style={{position: 'absolute', inset: 0, opacity: boxEdges, pointerEvents: 'none',
            background: `linear-gradient(0deg, ${C.noir} 0%, ${C.noir}00 12%, ${C.noir}00 94%, ${C.noir} 100%)`}} />
        </div>
      )}

      {/* D — identification */}
      {sec > T.lt0 - 0.1 && (
        <div style={{position: 'absolute', left: 120, top: 600, opacity: (1 - ltOut) * endFade, transform: `translateY(${-ltOut * 10}px)`}}>
          <div style={{width: 18, height: 18, background: C.orange, transform: `scale(${ltSquare})`,
            boxShadow: `0 0 18px ${C.orange}99`, marginBottom: 28}} />
          <div style={{overflow: 'hidden', paddingBottom: 6}}>
            <div style={{...FONTS.titre, fontSize: 88, color: C.blanc, lineHeight: 1, letterSpacing: '0.01em',
              transform: `translateY(${(1 - ltName) * 100}%)`}}>
              OSCAR YOUTOU
            </div>
          </div>
          <div style={{width: lerp(0, 600, ltLine), height: 3, background: `linear-gradient(90deg, ${C.orange}, #FFC24A)`, margin: '26px 0 22px'}} />
          <div style={{...FONTS.sousTitre, fontSize: 34, color: C.blanc, opacity: ltRole * 0.88,
            transform: `translateX(${(1 - ltRole) * -16}px)`}}>
            Fondateur et Directeur Créatif
          </div>
        </div>
      )}

      {/* filigrane de maquette */}
      <div style={{position: 'absolute', left: 96, bottom: 26, ...FONTS.texte, fontSize: 15, color: C.gris, opacity: 0.75}}>
        Maquette S02 v1.3 · muette · portrait original 1000338417.png
      </div>

      {/* vignettage */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 58%, rgba(0,0,0,0.5) 100%)', pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
