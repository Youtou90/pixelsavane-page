import React from 'react';
import {AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {C, FONTS} from '../system/brand';
import {useBrandFonts} from '../system/fonts';
import {clamp, easeIn, easeInOut, easeOut, lerp} from '../system/motion';
import {PixelWipe} from '../system/PixelWipe';
import {FilmGrain} from '../system/FilmGrain';
import {ChapterTag, DemoLabel, EndCard, Scrim, Shot, Title} from './S03Creativite_v1_0';
import available from '../../public/s03v11/available.json';

/**
 * SÉQUENCE 03 — « La créativité au service des marques » — v1.1, maquette muette (35 s).
 * Les images des quatre démonstrations sont fournies par Oscar (motion/sources/s03-v1.1/, voir
 * motion/S03_v1.1_COMMANDE_IMAGES.md) : aucune n'est générée ni retouchée ici.
 * TOUS les textes sont composés au montage (typographies officielles), jamais dans les images.
 * Une image pas encore fournie s'affiche comme un cadre « Image à fournir ».
 * Marques de démonstration : Bissap Kéla, SAYÉ, Maison Adjoa (fictives) ; Wata Fufu (confirmée par la DA).
 */

const FPS = 25;
const sec = (s: number) => Math.round(s * FPS);
const CUT = [3.0, 10.4, 17.8, 25.2, 32.6];
const DUR = 35;
const AV = available as Record<string, {file: string; w: number; h: number; ratio: string}>;
const has = (n: string) => Boolean(AV[n]);

// Image fournie (cadrage « cover » + caméra lente) ou cadre d'attente lisible
const Pic: React.FC<{name: string; ratio: string; w: number; h: number; zoom?: number; ox?: number; oy?: number; px?: number; style?: React.CSSProperties}> = ({
  name, ratio, w, h, zoom = 1, ox = 0.5, oy = 0.5, px = 0, style,
}) => {
  const a = AV[name];
  if (a) return <Shot src={staticFile(a.file)} nat={[a.w, a.h]} w={w} h={h} zoom={zoom} ox={ox} oy={oy} px={px} style={style} />;
  return (
    <div style={{position: 'absolute', width: w, height: h, background: '#141416', border: `2px dashed ${C.orange}88`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, boxSizing: 'border-box', ...style}}>
      <div style={{width: 14, height: 14, background: C.orange}} />
      <div style={{...FONTS.sousTitre, fontSize: Math.max(16, Math.min(26, w / 18)), color: C.blanc}}>Image à fournir</div>
      <div style={{...FONTS.texte, fontSize: Math.max(13, Math.min(18, w / 26)), color: C.gris}}>{name} · {ratio}</div>
    </div>
  );
};

const fade = (t: number, a: number, b: number, d = 0.25) => interpolate(t, [a - d, a, b - d, b], [0, 1, 1, 0], clamp);

// ——— 01 · Publicité cinématographique : Wata Fufu ———
const Demo1: React.FC = () => {
  const t = useCurrentFrame() / FPS, len = CUT[1] - CUT[0];
  const BAR = 140, W = 1920, H = 1080 - 2 * BAR;
  const withService = has('watafufu-service');
  const shots = withService
    ? [{n: 'watafufu-hero', a: 0, b: 2.3}, {n: 'watafufu-texture', a: 2.3, b: 4.2}, {n: 'watafufu-conditionnement', a: 4.2, b: 5.9}, {n: 'watafufu-service', a: 5.9, b: len + 0.3}]
    : [{n: 'watafufu-hero', a: 0, b: 2.6}, {n: 'watafufu-texture', a: 2.6, b: 4.8}, {n: 'watafufu-conditionnement', a: 4.8, b: len + 0.3}];
  const brand = interpolate(t, [0.7, 1.5, 2.0, 2.4], [0, 1, 1, 0], clamp);
  const endBrand = interpolate(t, [len - 1.6, len - 1.0], [0, 1], {...clamp, easing: easeOut});
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {shots.map((s, i) => {
        const o = i === 0 ? interpolate(t, [s.b - 0.25, s.b], [1, 0], clamp) : fade(t, s.a + 0.25, s.b);
        if (o <= 0) return null;
        const u = (t - s.a) / (s.b - s.a);
        return (
          <div key={s.n} style={{position: 'absolute', left: 0, top: BAR, width: W, height: H, overflow: 'hidden', opacity: o}}>
            <Pic name={s.n} ratio="16:9" w={W} h={H} zoom={lerp(1.0, 1.07, u)} px={i % 2 ? lerp(-12, 12, u) : lerp(12, -12, u)} />
          </div>
        );
      })}
      {/* lumière publicitaire : balayage orange discret */}
      <div style={{position: 'absolute', left: lerp(-700, 1400, t / len), top: 80, width: 1100, height: 920, borderRadius: '50%',
        background: `radial-gradient(ellipse, ${C.orange}40 0%, ${C.orange}00 60%)`, mixBlendMode: 'screen', opacity: 0.7}} />
      {/* nom du produit, composé au montage */}
      <div style={{position: 'absolute', right: 140, top: 420, textAlign: 'right', opacity: brand, transform: `translateY(${(1 - brand) * 14}px)`, zIndex: 12}}>
        <div style={{...FONTS.titre, fontSize: 92, letterSpacing: '0.16em', color: C.blanc, textShadow: '0 6px 30px rgba(0,0,0,0.6)'}}>WATA FUFU</div>
        <div style={{...FONTS.sousTitre, fontSize: 26, color: C.blanc, opacity: 0.9}}>Farine de fufu</div>
      </div>
      <div style={{position: 'absolute', right: 140, bottom: BAR + 50, textAlign: 'right', opacity: endBrand, zIndex: 12}}>
        <div style={{...FONTS.titre, fontSize: 64, letterSpacing: '0.16em', color: C.blanc, textShadow: '0 6px 30px rgba(0,0,0,0.6)'}}>WATA FUFU</div>
        <div style={{width: lerp(0, 160, endBrand), height: 3, background: C.orange, marginLeft: 'auto', marginTop: 10}} />
      </div>
      <Scrim />
      <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: BAR, background: '#000', zIndex: 15}} />
      <div style={{position: 'absolute', left: 0, bottom: 0, width: 1920, height: BAR, background: '#000', zIndex: 15}} />
      <div style={{position: 'absolute', right: 96, top: 58, zIndex: 16, ...FONTS.texte, fontSize: 15, letterSpacing: '0.18em', color: C.gris}}>
        VISUEL PUBLICITAIRE DE DÉMONSTRATION · 2,39:1
      </div>
      <DemoLabel n="01" title="Publicité cinématographique" sub="Produit physique · gros plans, texture, conditionnement"
        note="Wata Fufu · démonstration PixelSavane, images publicitaires (non documentaires)" t={t} len={len} bottom={170} />
    </AbsoluteFill>
  );
};

// ——— 02 · Publicité UGC : créatrice africaine, produit fictif ———
const UGC = [
  {n: 'ugc-1', a: 0.0, b: 2.5, cap: ['Vous connaissez le', 'bissap Kéla ?'], hi: 1},
  {n: 'ugc-2', a: 2.5, b: 4.9, cap: ['Frais, naturel,', 'pas trop sucré…'], hi: 0},
  {n: 'ugc-3', a: 4.9, b: 7.6, cap: ['Mon nouveau', 'réflexe.'], hi: 1},
];
const NOTES = ['Accroche dès les 3 premières secondes', 'Sous-titres lisibles même sans le son', 'Format vertical 9:16 prêt à publier'];
const Demo2: React.FC = () => {
  const t = useCurrentFrame() / FPS, len = CUT[2] - CUT[1];
  const FW = 506, FH = 900, FX = 900, FY = 90;
  const inU = interpolate(t, [0.1, 0.9], [0, 1], {...clamp, easing: easeOut});
  return (
    <AbsoluteFill style={{background: C.noir}}>
      <div style={{position: 'absolute', left: FX - 300, top: 0, width: FW + 600, height: 1080, background: `radial-gradient(ellipse, ${C.orange}24 0%, ${C.orange}00 60%)`}} />
      <div style={{position: 'absolute', left: FX, top: FY + (1 - inU) * 60, width: FW, height: FH, borderRadius: 30, overflow: 'hidden', opacity: inU,
        boxShadow: `0 40px 100px rgba(0,0,0,0.6), 0 0 0 2px ${C.orange}55`}}>
        {UGC.map((c) => {
          if (t < c.a || t >= c.b) return null; // coupes franches, style UGC
          const u = (t - c.a) / (c.b - c.a);
          return <Pic key={c.n} name={c.n} ratio="9:16" w={FW} h={FH} zoom={lerp(1.0, 1.06, u)} oy={0.4} />;
        })}
        {/* sous-titres UGC très lisibles */}
        {UGC.map((c) => {
          const o = interpolate(t, [c.a, c.a + 0.15, c.b - 0.1, c.b], [0, 1, 1, 0], clamp);
          if (o <= 0) return null;
          const pop = interpolate(t, [c.a, c.a + 0.2], [0.9, 1], {...clamp, easing: easeOut});
          return (
            <div key={`cap-${c.n}`} style={{position: 'absolute', left: 30, right: 30, bottom: 170, textAlign: 'center', opacity: o, transform: `scale(${pop})`}}>
              {c.cap.map((line, k) => (
                <div key={k} style={{display: 'inline-block', margin: '4px 0', padding: '6px 16px', borderRadius: 12,
                  background: k === c.hi ? C.orange : 'rgba(14,14,16,0.85)', color: k === c.hi ? C.noir : C.blanc,
                  ...FONTS.titre, fontSize: 42, lineHeight: 1.15}}>{line}</div>
              ))}
            </div>
          );
        })}
        <div style={{position: 'absolute', left: 24, top: 24, padding: '8px 14px', borderRadius: 12, background: 'rgba(14,14,16,0.8)',
          ...FONTS.texte, fontWeight: 500, fontSize: 18, color: C.blanc}}>Bissap Kéla · marque fictive</div>
      </div>
      {/* annotations de savoir-faire */}
      {NOTES.map((txt, i) => {
        const u = interpolate(t, [1.2 + i * 0.5, 1.8 + i * 0.5], [0, 1], {...clamp, easing: easeOut});
        const o = interpolate(t, [len - 0.6, len - 0.25], [1, 0], clamp);
        return (
          <div key={txt} style={{position: 'absolute', left: FX + FW + 50, top: 330 + i * 120, display: 'flex', alignItems: 'center', gap: 18, opacity: u * o,
            transform: `translateX(${(1 - u) * 20}px)`}}>
            <div style={{width: lerp(0, 40, u), height: 2, background: C.orange}} />
            <div style={{...FONTS.sousTitre, fontSize: 24, color: C.blanc, width: 360, lineHeight: 1.3}}>{txt}</div>
          </div>
        );
      })}
      <Scrim />
      <DemoLabel n="02" title="Publicité UGC" sub="Créatrice de contenu · format social vertical"
        note="Démonstration PixelSavane · images générées par IA · produit et marque fictifs" t={t} len={len} />
    </AbsoluteFill>
  );
};

// ——— 03 · Photographie commerciale : mini-campagne SAYÉ ———
const SAYE = [
  {n: 'saye-produit', cap: 'Photographie produit'},
  {n: 'saye-portrait', cap: 'Portrait publicitaire'},
  {n: 'saye-editorial', cap: 'Photographie éditoriale'},
];
const Demo3: React.FC = () => {
  const t = useCurrentFrame() / FPS, len = CUT[3] - CUT[2];
  const CW = 380, CH = 475, X0 = 620, GAP = 30, Y = 300;
  const brand = interpolate(t, [0.3, 1.1], [0, 1], {...clamp, easing: easeOut});
  return (
    <AbsoluteFill style={{background: '#0b0a09'}}>
      <div style={{position: 'absolute', left: 560, top: 120, width: 1360, height: 900, borderRadius: '50%', background: `radial-gradient(ellipse, ${C.orange}22 0%, ${C.orange}00 62%)`}} />
      {/* identité de la marque fictive, commune aux trois visuels */}
      <div style={{position: 'absolute', left: X0, width: 3 * CW + 2 * GAP, top: 168, textAlign: 'center', opacity: brand}}>
        <div style={{...FONTS.titre, fontSize: 56, letterSpacing: '0.42em', color: C.blanc, marginRight: '-0.42em'}}>SAYÉ</div>
        <div style={{...FONTS.sousTitre, fontSize: 20, color: C.orange, letterSpacing: '0.12em', marginTop: 6}}>Soins au beurre de karité · marque fictive</div>
      </div>
      {SAYE.map((c, i) => {
        const u = interpolate(t, [0.6 + i * 0.35, 1.6 + i * 0.35], [0, 1], {...clamp, easing: easeInOut});
        const cap = interpolate(t, [1.4 + i * 0.35, 2.0 + i * 0.35], [0, 1], clamp);
        return (
          <div key={c.n} style={{position: 'absolute', left: X0 + i * (CW + GAP), top: Y}}>
            <div style={{position: 'relative', width: CW, height: CH, overflow: 'hidden', clipPath: `inset(${(1 - u) * 100}% 0 0 0)`,
              boxShadow: '0 30px 70px rgba(0,0,0,0.5)'}}>
              <Pic name={c.n} ratio="4:5" w={CW} h={CH} zoom={lerp(1.0, 1.05, t / len)} oy={0.4} />
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 20, opacity: cap}}>
              <div style={{width: 10, height: 10, background: C.orange}} />
              <div style={{...FONTS.sousTitre, fontSize: 22, color: C.blanc}}>{c.cap}</div>
            </div>
          </div>
        );
      })}
      <Scrim />
      <DemoLabel n="03" title="Photographie commerciale" sub="Une campagne cohérente : produit, portrait, éditorial"
        note="SAYÉ · marque fictive, projet de démonstration · images générées par IA" t={t} len={len} />
    </AbsoluteFill>
  );
};

// ——— 04 · Réseaux sociaux : mini-campagne Maison Adjoa ———
const CTA: React.FC<{label: string; size?: number}> = ({label, size = 20}) => (
  <div style={{display: 'inline-block', padding: `${size * 0.5}px ${size * 1.1}px`, borderRadius: 999, background: C.orange,
    ...FONTS.texte, fontWeight: 500, fontSize: size, color: C.noir}}>{label}</div>
);
const Demo4: React.FC = () => {
  const t = useCurrentFrame() / FPS, len = CUT[4] - CUT[3];
  const u = (d: number) => interpolate(t, [0.3 + d, 1.3 + d], [0, 1], {...clamp, easing: easeOut});
  const f = (k: number) => Math.sin(t * 1.2 + k) * 5;
  const shade = 'linear-gradient(180deg, rgba(14,14,16,0.78) 0%, rgba(14,14,16,0) 38%, rgba(14,14,16,0) 58%, rgba(14,14,16,0.85) 100%)';
  const brand = u(0);
  return (
    <AbsoluteFill style={{background: C.noir}}>
      <div style={{position: 'absolute', left: 560, top: 100, width: 1360, height: 950, borderRadius: '50%', background: `radial-gradient(ellipse, ${C.orange}22 0%, ${C.orange}00 62%)`}} />
      <div style={{position: 'absolute', left: 620, top: 150, opacity: brand, display: 'flex', alignItems: 'baseline', gap: 18}}>
        <div style={{...FONTS.titre, fontSize: 34, letterSpacing: '0.3em', color: C.blanc}}>MAISON ADJOA</div>
        <div style={{...FONTS.texte, fontSize: 16, color: C.gris}}>pâtisserie artisanale · marque fictive</div>
      </div>
      {/* Publicité 4:5 */}
      <div style={{position: 'absolute', left: 620, top: 240 + (1 - u(0.1)) * 120 + f(0), opacity: u(0.1)}}>
        <div style={{position: 'relative', width: 400, height: 500, borderRadius: 16, overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,0.55)'}}>
          <Pic name="adjoa-45" ratio="4:5" w={400} h={500} zoom={lerp(1, 1.05, t / len)} />
          <div style={{position: 'absolute', inset: 0, background: shade}} />
          <div style={{position: 'absolute', left: 28, top: 28, right: 28}}>
            <div style={{...FONTS.titre, fontSize: 40, lineHeight: 1.05, color: C.blanc}}>Nouveautés du week-end</div>
            <div style={{...FONTS.sousTitre, fontSize: 20, color: C.blanc, opacity: 0.9, marginTop: 10}}>Viennoiseries faites maison</div>
          </div>
          <div style={{position: 'absolute', left: 28, bottom: 28}}><CTA label="Commander" /></div>
        </div>
        <div style={{...FONTS.sousTitre, fontSize: 20, color: C.blanc, opacity: 0.85, marginTop: 16, textAlign: 'center'}}>Publicité 4:5</div>
      </div>
      {/* Publication 1:1 */}
      <div style={{position: 'absolute', left: 1050, top: 300 + (1 - u(0.45)) * 120 + f(1.5), opacity: u(0.45)}}>
        <div style={{position: 'relative', width: 400, height: 400, borderRadius: 16, overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,0.55)'}}>
          <Pic name="adjoa-11" ratio="1:1" w={400} h={400} zoom={lerp(1.05, 1, t / len)} />
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(14,14,16,0.85) 0%, rgba(14,14,16,0) 45%)'}} />
          <div style={{position: 'absolute', left: 26, right: 26, bottom: 24}}>
            <div style={{...FONTS.titre, fontSize: 34, lineHeight: 1.1, color: C.blanc}}>Fait maison,<br />chaque matin.</div>
          </div>
        </div>
        <div style={{...FONTS.sousTitre, fontSize: 20, color: C.blanc, opacity: 0.85, marginTop: 16, textAlign: 'center'}}>Publication 1:1</div>
      </div>
      {/* Story 9:16 */}
      <div style={{position: 'absolute', left: 1490, top: 200 + (1 - u(0.8)) * 120 + f(3), opacity: u(0.8)}}>
        <div style={{position: 'relative', width: 320, height: 569, borderRadius: 22, overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,0.55)'}}>
          <Pic name="adjoa-916" ratio="9:16" w={320} h={569} zoom={lerp(1, 1.06, t / len)} oy={0.45} />
          <div style={{position: 'absolute', inset: 0, background: shade}} />
          <div style={{position: 'absolute', left: 14, right: 14, top: 14, height: 3, borderRadius: 2, background: 'rgba(250,250,250,0.3)'}}>
            <div style={{width: `${Math.min(100, (t / (len - 0.4)) * 100)}%`, height: '100%', background: C.blanc}} />
          </div>
          <div style={{position: 'absolute', left: 22, right: 22, top: 40}}>
            <div style={{...FONTS.sousTitre, fontSize: 16, letterSpacing: '0.2em', color: C.orange}}>MAISON ADJOA</div>
            <div style={{...FONTS.titre, fontSize: 36, lineHeight: 1.05, color: C.blanc, marginTop: 8}}>Ouvert dès 7 h</div>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 30, textAlign: 'center'}}><CTA label="Commander maintenant" size={18} /></div>
        </div>
        <div style={{...FONTS.sousTitre, fontSize: 20, color: C.blanc, opacity: 0.85, marginTop: 16, textAlign: 'center'}}>Story 9:16</div>
      </div>
      <Scrim />
      <DemoLabel n="04" title="Contenus pour les réseaux sociaux" sub="Une campagne déclinée en trois formats"
        note="Maison Adjoa · marque fictive, projet de démonstration · images générées par IA" t={t} len={len} />
    </AbsoluteFill>
  );
};

export const S03Creativite: React.FC = () => {
  useBrandFonts();
  const f = useCurrentFrame();
  const t = f / FPS;
  const tag = interpolate(t, [CUT[0] + 0.3, CUT[0] + 0.9, CUT[4] - 0.4, CUT[4]], [0, 1, 1, 0], clamp);
  const fadeOut = interpolate(t, [DUR - 0.5, DUR], [1, 0], {...clamp, easing: easeIn});
  const missing = 13 - Object.keys(AV).length;
  return (
    <AbsoluteFill style={{backgroundColor: C.noir}}>
      <AbsoluteFill style={{opacity: fadeOut}}>
        <Sequence from={0} durationInFrames={sec(CUT[0])}><Title /></Sequence>
        <Sequence from={sec(CUT[0])} durationInFrames={sec(CUT[1] - CUT[0])}><Demo1 /></Sequence>
        <Sequence from={sec(CUT[1])} durationInFrames={sec(CUT[2] - CUT[1])}><Demo2 /></Sequence>
        <Sequence from={sec(CUT[2])} durationInFrames={sec(CUT[3] - CUT[2])}><Demo3 /></Sequence>
        <Sequence from={sec(CUT[3])} durationInFrames={sec(CUT[4] - CUT[3])}><Demo4 /></Sequence>
        <Sequence from={sec(CUT[4])} durationInFrames={sec(DUR - CUT[4])}><EndCard /></Sequence>
        <ChapterTag opacity={tag} />
        {CUT.map((c) => <PixelWipe key={c} t={t - c} />)}
        <FilmGrain opacity={0.06} />
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 60%, rgba(0,0,0,0.45) 100%)', pointerEvents: 'none'}} />
      </AbsoluteFill>
      <div style={{position: 'absolute', right: 40, top: 22, ...FONTS.texte, fontSize: 14, color: C.gris, opacity: 0.6 * fadeOut}}>
        Maquette S03 v1.1 · muette{missing > 0 ? ` · ${missing} image(s) à fournir` : ''}
      </div>
    </AbsoluteFill>
  );
};
