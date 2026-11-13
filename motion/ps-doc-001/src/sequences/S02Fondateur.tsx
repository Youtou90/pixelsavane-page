import React, {useMemo} from 'react';
import {AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {C, FONTS} from '../system/brand';
import {useBrandFonts} from '../system/fonts';
import {clamp, easeIn, easeInOut, easeOut, lerp} from '../system/motion';

/**
 * SÉQUENCE 02 (00:25–00:50 du film, 25 s) — « La naissance d'une conviction ».
 * PROPOSITION VISUELLE (maquette muette) soumise à la DA :
 *  A. titre de chapitre ;
 *  B. entrepreneurs, PME, commerçants, entreprises : panneaux en pixels (motion design pur,
 *     en attente de photos réelles autorisées — aucune image générée) ;
 *  C. révélation du portrait réel d'Oscar YOUTOU (photo originale, sans retouche ni IA) ;
 *  D. identification « Oscar YOUTOU — Fondateur et Directeur Créatif ».
 * Aucun texte de narration n'est inventé : le script validé n'a pas encore été transmis.
 */

const FPS = 25;

// Pictogrammes construits en carrés (grilles 9×9) — vocabulaire « pixels » de la charte
const ICONS: Record<string, string[]> = {
  entrepreneurs: [ // personne + bulle d'idée
    '......o..',
    '.....ooo.',
    '..ww..o..',
    '.wwww....',
    '.wwww....',
    '..ww.....',
    '.wwwwww..',
    'wwwwwwww.',
    'wwwwwwww.',
  ],
  pme: [ // mallette
    '...www...',
    '..w...w..',
    'wwwwwwwww',
    'w.......w',
    'wwwwowwww',
    'w.......w',
    'w.......w',
    'wwwwwwwww',
    '.........',
  ],
  commercants: [ // échoppe avec auvent
    'ooooooooo',
    'owowowowo',
    'ooooooooo',
    '.w.....w.',
    '.w.www.w.',
    '.w.w.w.w.',
    '.w.w.w.w.',
    'wwwwwwwww',
    '.........',
  ],
  entreprises: [ // immeuble
    '...wwww..',
    '...w..w..',
    'www.o.w..',
    'w.w.o.www',
    'www.o.w.w',
    'w.w.o.www',
    'www.o.w.w',
    'w.w.o.w.w',
    'wwwwwwwww',
  ],
};

const PANELS = [
  {key: 'entrepreneurs', label: 'Entrepreneurs'},
  {key: 'pme', label: 'PME'},
  {key: 'commercants', label: 'Commerçants'},
  {key: 'entreprises', label: 'Entreprises'},
];

// Géométrie du portrait : affiché SOUS sa résolution native (820×1081) → aucun agrandissement
const PORTRAIT = {w: 758, h: 1000, left: 1030, top: 40};
const CELL = 38;

export const S02Fondateur: React.FC = () => {
  useBrandFonts();
  const f = useCurrentFrame();
  const sec = f / FPS;

  // ——— A. Titre de chapitre (0–3,6 s) ———
  const titleIn = interpolate(sec, [0.4, 1.4], [0, 1], {...clamp, easing: easeOut});
  const titleOut = interpolate(sec, [3.0, 3.7], [0, 1], {...clamp, easing: easeIn});
  const chapterTag = interpolate(sec, [3.4, 4.0, 23.6, 24.4], [0, 1, 1, 0], clamp);

  // ——— B. Panneaux (3,4–11,4 s) ———
  const panelsOut = interpolate(sec, [10.6, 11.6], [0, 1], {...clamp, easing: easeIn});
  const drift = interpolate(sec, [3, 12], [30, -30]);

  // ——— C. Portrait (11,6–25 s) ———
  const kb = interpolate(sec, [11.6, 25], [1, 1.04], {...clamp, easing: easeInOut}); // reste < résolution native
  const portraitOut = interpolate(sec, [23.6, 24.6], [1, 0], {...clamp, easing: easeIn});
  const cells = useMemo(() => {
    const cols = Math.ceil(PORTRAIT.w / CELL), rows = Math.ceil(PORTRAIT.h / CELL);
    const fx = cols * 0.5, fy = rows * 0.32; // révélation depuis le visage vers l'extérieur
    const out: {x: number; y: number; t: number}[] = [];
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const d = Math.hypot((i - fx) / cols, (j - fy) / rows);
      out.push({x: i * CELL, y: j * CELL, t: 11.7 + d * 2.2 + random(`c${i}-${j}`) * 0.5});
    }
    return out;
  }, []);

  // ——— D. Identification (14,6–24 s) ———
  const ltSquare = interpolate(sec, [14.6, 15.0], [0, 1], {...clamp, easing: easeOut});
  const ltName = interpolate(sec, [14.8, 15.7], [0, 1], {...clamp, easing: easeOut});
  const ltLine = interpolate(sec, [15.2, 16.2], [0, 1], {...clamp, easing: easeInOut});
  const ltRole = interpolate(sec, [15.6, 16.4], [0, 1], {...clamp, easing: easeOut});
  const ltOut = interpolate(sec, [23.4, 24.2], [0, 1], {...clamp, easing: easeIn});

  return (
    <AbsoluteFill style={{backgroundColor: C.noir, overflow: 'hidden'}}>
      {/* lumière orange de fond, maîtrisée */}
      <div style={{position: 'absolute', left: -200, top: 250, width: 1400, height: 900, borderRadius: '50%',
        background: `radial-gradient(ellipse, ${C.orange}22 0%, ${C.orange}00 60%)`, opacity: 1 - panelsOut * 0.5}} />
      <div style={{position: 'absolute', left: 950, top: -100, width: 1100, height: 1200, borderRadius: '50%',
        background: `radial-gradient(ellipse, ${C.orange}26 0%, ${C.orange}00 62%)`,
        opacity: interpolate(sec, [11.5, 14], [0, 1], clamp) * portraitOut}} />

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

      {/* repère de chapitre permanent */}
      <div style={{position: 'absolute', left: 96, top: 72, ...FONTS.sousTitre, fontSize: 18, letterSpacing: '0.24em',
        color: C.gris, opacity: chapterTag, display: 'flex', alignItems: 'center', gap: 14}}>
        <div style={{width: 10, height: 10, background: C.orange}} />02 — LA NAISSANCE D'UNE CONVICTION
      </div>

      {/* B — panneaux entrepreneurs / PME / commerçants / entreprises */}
      {sec > 3.2 && sec < 11.8 && PANELS.map((p, i) => {
        const t0 = 3.4 + i * 0.45;
        const u = interpolate(sec, [t0, t0 + 1.1], [0, 1], {...clamp, easing: easeOut});
        const W = 360, H = 520, gap = 44;
        const x = 960 - (4 * W + 3 * gap) / 2 + i * (W + gap) + drift * (0.6 + i * 0.15);
        const y = 300 + (1 - u) * 60;
        const grid = ICONS[p.key];
        const cs = 26; // taille d'un pixel du pictogramme
        return (
          <div key={p.key} style={{position: 'absolute', left: x, top: y, width: W, height: H,
            opacity: u * (1 - panelsOut),
            background: `linear-gradient(180deg, #17171A 0%, #121214 60%, ${C.orange}1f 100%)`,
            border: '1px solid rgba(250,250,250,0.07)',
            transform: `scale(${1 - panelsOut * 0.04})`}}>
            {/* pictogramme qui s'assemble pixel par pixel */}
            {grid.flatMap((row, r) => row.split('').map((ch, c) => {
              if (ch === '.') return null;
              const k = random(`${p.key}-${r}-${c}`);
              const a = interpolate(sec, [t0 + 0.3 + k * 0.9, t0 + 0.8 + k * 0.9], [0, 1], {...clamp, easing: easeOut});
              const out = interpolate(sec, [10.5 + k * 0.5, 11.2 + k * 0.5], [0, 1], {...clamp, easing: easeIn});
              const sx = (random(`${p.key}-${r}-${c}-x`) - 0.5) * 300, sy = (random(`${p.key}-${r}-${c}-y`) - 0.5) * 300;
              return (
                <div key={`${r}-${c}`} style={{position: 'absolute',
                  left: (W - 9 * cs) / 2 + c * cs + sx * (1 - a) + out * 400, top: 110 + r * cs + sy * (1 - a) - out * 120,
                  width: cs - 3, height: cs - 3, opacity: a * (1 - out),
                  background: ch === 'o' ? C.orange : C.blanc,
                  boxShadow: ch === 'o' ? `0 0 12px ${C.orange}aa` : undefined}} />
              );
            }))}
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 58, textAlign: 'center', ...FONTS.sousTitre,
              fontSize: 30, color: C.blanc, opacity: interpolate(sec, [t0 + 0.6, t0 + 1.3], [0, 1], clamp)}}>{p.label}</div>
            <div style={{position: 'absolute', left: (W - 40) / 2, bottom: 38, width: 40, height: 3, background: C.orange,
              opacity: interpolate(sec, [t0 + 0.8, t0 + 1.4], [0, 1], clamp)}} />
          </div>
        );
      })}

      {/* C — portrait réel d'Oscar, révélé par une grille de pixels */}
      {sec > 11.5 && (
        <div style={{position: 'absolute', left: PORTRAIT.left, top: PORTRAIT.top, width: PORTRAIT.w, height: PORTRAIT.h,
          overflow: 'hidden', opacity: portraitOut}}>
          <Img src={staticFile('portrait-oscar.jpg')} style={{width: PORTRAIT.w, height: PORTRAIT.h, objectFit: 'cover',
            transform: `scale(${kb})`, transformOrigin: '50% 30%'}} />
          {/* fondus de bord vers le noir de la charte (la photo elle-même n'est pas retouchée) */}
          <div style={{position: 'absolute', inset: 0, background: `linear-gradient(90deg, ${C.noir} 0%, ${C.noir}00 22%, ${C.noir}00 88%, ${C.noir} 100%)`}} />
          <div style={{position: 'absolute', inset: 0, background: `linear-gradient(0deg, ${C.noir} 0%, ${C.noir}00 20%, ${C.noir}00 92%, ${C.noir} 100%)`}} />
          {cells.map((c, i) => {
            const u = (sec - c.t) / 0.4;
            if (u >= 1) return null;
            return (
              <div key={i} style={{position: 'absolute', left: c.x, top: c.y, width: CELL, height: CELL,
                background: u < 0 ? C.noir : C.orange, opacity: u < 0 ? 1 : (1 - u) * 0.85}} />
            );
          })}
        </div>
      )}

      {/* D — identification du fondateur */}
      {sec > 14.5 && (
        <div style={{position: 'absolute', left: 150, top: 640, opacity: 1 - ltOut, transform: `translateY(${-ltOut * 10}px)`}}>
          <div style={{width: 18, height: 18, background: C.orange, transform: `scale(${ltSquare})`,
            boxShadow: `0 0 18px ${C.orange}99`, marginBottom: 26}} />
          <div style={{overflow: 'hidden', paddingBottom: 6}}>
            <div style={{...FONTS.titre, fontSize: 84, color: C.blanc, lineHeight: 1, letterSpacing: '-0.01em',
              transform: `translateY(${(1 - ltName) * 100}%)`}}>
              Oscar <span style={{color: C.blanc}}>YOUTOU</span>
            </div>
          </div>
          <div style={{width: lerp(0, 560, ltLine), height: 3, background: `linear-gradient(90deg, ${C.orange}, #FFC24A)`, margin: '24px 0 22px'}} />
          <div style={{...FONTS.sousTitre, fontSize: 34, color: C.blanc, opacity: ltRole * 0.86,
            transform: `translateX(${(1 - ltRole) * -16}px)`}}>
            Fondateur et Directeur Créatif
          </div>
        </div>
      )}

      {/* filigrane de maquette (proposition non définitive) */}
      <div style={{position: 'absolute', right: 40, bottom: 28, ...FONTS.texte, fontSize: 16, color: C.gris, opacity: 0.8}}>
        Maquette S02 — proposition DA · muette · {sec < 11.5 ? 'pictogrammes en attente de photos réelles autorisées' : 'portrait original (dépôt, 820×1081)'}
      </div>

      {/* vignettage */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 58%, rgba(0,0,0,0.5) 100%)'}} />
    </AbsoluteFill>
  );
};
