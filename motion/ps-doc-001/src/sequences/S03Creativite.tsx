import React from 'react';
import {AbsoluteFill, Img, interpolate, random, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {C, FONTS, SIGNATURE} from '../system/brand';
import {useBrandFonts} from '../system/fonts';
import {clamp, easeIn, easeInOut, easeOut, lerp} from '../system/motion';
import {PixelWipe} from '../system/PixelWipe';
import {FilmGrain} from '../system/FilmGrain';
import {Phone} from '../system/Phone';
import letters from '../../public/wordmark-letters.json';

/**
 * SÉQUENCE 03 — « La créativité au service des marques » — v1.0, maquette muette (35 s).
 * Quatre démonstrations construites avec des créations PixelSavane du site (visuels générés par IA par l'agence).
 * Aucun visuel montrant une marque réelle n'est utilisé. Les marques citées à l'écran sont fictives,
 * sauf Wata Fufu (marque liée à PixelSavane, statut à confirmer par le fondateur).
 * Aucune donnée chiffrée, aucun client, aucun résultat n'est inventé.
 */

const FPS = 25;
const sec = (s: number) => Math.round(s * FPS);
const img = (f: string) => staticFile(`s03/${f}`);

// Découpage (s)
const CUT = [3.0, 10.4, 17.8, 25.2, 32.6];
const DUR = 35;

// ——— Habillage commun ———
const ChapterTag: React.FC<{opacity: number}> = ({opacity}) => (
  <div style={{position: 'absolute', left: 96, top: 72, ...FONTS.sousTitre, fontSize: 18, letterSpacing: '0.24em',
    color: C.gris, opacity, display: 'flex', alignItems: 'center', gap: 14, zIndex: 20}}>
    <div style={{width: 10, height: 10, background: C.orange}} />03 — LA CRÉATIVITÉ AU SERVICE DES MARQUES
  </div>
);

const DemoLabel: React.FC<{n: string; title: string; sub: string; note: string; t: number; len: number; bottom?: number}> = ({n, title, sub, note, t, len, bottom = 96}) => {
  const u = interpolate(t, [0.5, 1.3], [0, 1], {...clamp, easing: easeOut});
  const o = interpolate(t, [len - 0.7, len - 0.3], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', left: 96, bottom, opacity: u * o, zIndex: 20, maxWidth: 520}}>
      <div style={{...FONTS.sousTitre, fontSize: 18, letterSpacing: '0.24em', color: C.orange, marginBottom: 14}}>{n}</div>
      <div style={{overflow: 'hidden'}}>
        <div style={{...FONTS.titre, fontSize: 50, lineHeight: 1.05, color: C.blanc, transform: `translateY(${(1 - u) * 100}%)`}}>{title}</div>
      </div>
      <div style={{width: lerp(0, 120, u), height: 3, background: C.orange, margin: '20px 0 16px'}} />
      <div style={{...FONTS.sousTitre, fontSize: 24, color: C.blanc, opacity: 0.85}}>{sub}</div>
      <div style={{...FONTS.texte, fontSize: 15, color: C.gris, marginTop: 14, lineHeight: 1.4}}>{note}</div>
    </div>
  );
};

const Scrim: React.FC = () => (
  <div style={{position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none',
    background: 'linear-gradient(90deg, rgba(14,14,16,0.92) 0%, rgba(14,14,16,0.55) 30%, rgba(14,14,16,0) 50%)'}} />
);

// Image recadrée façon « cover » dans un cadre, avec mouvement de caméra lent
const Shot: React.FC<{src: string; nat: [number, number]; w: number; h: number; zoom: number; px?: number; py?: number; ox?: number; oy?: number; style?: React.CSSProperties}> = ({
  src, nat, w, h, zoom, px = 0, py = 0, ox = 0.5, oy = 0.5, style,
}) => {
  const sc = Math.max(w / nat[0], h / nat[1]) * zoom;
  const dw = nat[0] * sc, dh = nat[1] * sc;
  return (
    <div style={{position: 'absolute', overflow: 'hidden', width: w, height: h, ...style}}>
      <Img src={src} style={{position: 'absolute', width: dw, height: dh, left: (w - dw) * ox + px, top: (h - dh) * oy + py}} />
    </div>
  );
};

// ——— 0. Titre ———
const Title: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const u = interpolate(t, [0.3, 1.3], [0, 1], {...clamp, easing: easeOut});
  const o = interpolate(t, [2.4, 3.0], [0, 1], {...clamp, easing: easeIn});
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: 1 - o}}>
      <div style={{...FONTS.sousTitre, fontSize: 26, letterSpacing: '0.3em', color: C.orange, opacity: u}}>03</div>
      <div style={{...FONTS.titre, fontSize: 84, color: C.blanc, marginTop: 18, letterSpacing: '-0.01em', textAlign: 'center',
        opacity: u, transform: `translateY(${(1 - u) * 24 - o * 30}px)`, filter: u < 1 ? `blur(${(1 - u) * 8}px)` : undefined}}>
        La créativité au service des marques
      </div>
      <div style={{width: lerp(0, 140, u), height: 4, background: C.orange, marginTop: 28}} />
    </AbsoluteFill>
  );
};

// ——— 1. Publicité cinématographique, produit physique ———
const Demo1: React.FC = () => {
  const t = useCurrentFrame() / FPS, len = CUT[1] - CUT[0];
  const BAR = 140, H = 1080 - 2 * BAR;
  const inL = interpolate(t, [0.1, 1.1], [0, 1], {...clamp, easing: easeOut});
  const inR = interpolate(t, [0.8, 1.8], [0, 1], {...clamp, easing: easeOut});
  const leak = interpolate(t, [1.2, 3.8, 6.5], [0, 1, 0.2], clamp);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {/* diptyque cinéma : deux plans du même film, mouvements opposés */}
      <div style={{position: 'absolute', left: 0, top: BAR, width: 960, height: H, overflow: 'hidden', clipPath: `inset(0 ${(1 - inL) * 100}% 0 0)`}}>
        <Shot src={img('watafufu-conditionnement.jpg')} nat={[1080, 1080]} w={960} h={H} zoom={lerp(1.0, 1.08, t / len)} ox={0.5} oy={0.55} />
      </div>
      <div style={{position: 'absolute', left: 962, top: BAR, width: 958, height: H, overflow: 'hidden', clipPath: `inset(0 0 0 ${(1 - inR) * 100}%)`}}>
        <Shot src={img('watafufu-accord.jpg')} nat={[864, 1079]} w={958} h={H} zoom={lerp(1.06, 1.0, t / len)} ox={0.5} oy={0.35} px={lerp(10, -10, t / len)} />
      </div>
      <div style={{position: 'absolute', left: 959, top: BAR, width: 2, height: H * inR, background: C.orange, opacity: 0.8}} />
      {/* fuite de lumière orange, étalonnage chaud */}
      <div style={{position: 'absolute', left: lerp(-600, 900, t / len), top: 100, width: 1200, height: 900, borderRadius: '50%',
        background: `radial-gradient(ellipse, ${C.orange}55 0%, ${C.orange}00 60%)`, mixBlendMode: 'screen', opacity: leak}} />
      <Scrim />
      {/* bandes cinéma 2,39:1 */}
      <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: BAR, background: '#000', zIndex: 15}} />
      <div style={{position: 'absolute', left: 0, bottom: 0, width: 1920, height: BAR, background: '#000', zIndex: 15}} />
      <div style={{position: 'absolute', right: 96, top: 58, zIndex: 16, ...FONTS.texte, fontSize: 15, letterSpacing: '0.2em', color: C.gris,
        opacity: interpolate(t, [0.6, 1.2], [0, 1], clamp)}}>FILM PRODUIT · 2,39:1</div>
      <DemoLabel n="01" title="Publicité cinématographique" sub="Produit physique · film de marque"
        note="Démonstration PixelSavane · visuels générés par IA · marque Wata Fufu (statut à confirmer)" t={t} len={len} bottom={170} />
    </AbsoluteFill>
  );
};

// ——— 2. UGC : créateur et avatar IA ———
const CAPTIONS = [
  {a: 0.9, b: 2.6, txt: 'J’ai testé ce thé glacé…'},
  {a: 2.6, b: 4.2, txt: '…et honnêtement ?'},
  {a: 4.2, b: 6.6, txt: 'Je ne m’en passe plus.'},
];
const Demo2: React.FC = () => {
  const t = useCurrentFrame() / FPS, len = CUT[2] - CUT[1];
  const p1 = interpolate(t, [0.2, 1.2], [0, 1], {...clamp, easing: easeOut});
  const p2 = interpolate(t, [0.6, 1.6], [0, 1], {...clamp, easing: easeOut});
  const float = Math.sin(t * 1.4) * 6;
  const SW = 430, SH = 764;
  return (
    <AbsoluteFill style={{background: C.noir}}>
      {/* ambiance : même image, très floutée et assombrie */}
      <Shot src={img('ugc-selfie.jpg')} nat={[768, 1376]} w={1920} h={1080} zoom={1} oy={0.4}
        style={{filter: 'blur(48px) brightness(0.32) saturate(1.2)', transform: 'scale(1.1)'}} />
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 65% 50%, ${C.orange}22 0%, ${C.noir}00 55%)`}} />
      {/* avatar IA (second plan) */}
      <Phone x={620} y={200 + (1 - p2) * 120 - float * 0.6} w={300} h={533} rotate={-6} opacity={p2 * 0.95}>
        <Shot src={img('avatar-portrait-rue.jpg')} nat={[670, 1200]} w={300} h={533} zoom={lerp(1, 1.06, t / len)} oy={0.3} />
        <div style={{position: 'absolute', left: 16, top: 48, padding: '6px 12px', borderRadius: 14, background: 'rgba(0,0,0,0.55)',
          ...FONTS.texte, fontWeight: 500, fontSize: 14, color: C.blanc}}>Avatar IA</div>
      </Phone>
      {/* vidéo UGC (premier plan) */}
      <Phone x={1100} y={130 + (1 - p1) * 120 + float} w={SW} h={SH} opacity={p1}>
        <Shot src={img('ugc-selfie.jpg')} nat={[768, 1376]} w={SW} h={SH} zoom={lerp(1, 1.05, t / len)} oy={0.4} />
        {/* barre de progression */}
        <div style={{position: 'absolute', left: 18, right: 18, top: 50, height: 3, background: 'rgba(255,255,255,0.3)', borderRadius: 2}}>
          <div style={{width: `${Math.min(100, (t / (len - 0.4)) * 100)}%`, height: '100%', background: C.blanc, borderRadius: 2}} />
        </div>
        <div style={{position: 'absolute', left: 18, top: 66, display: 'flex', alignItems: 'center', gap: 10}}>
          <div style={{width: 34, height: 34, borderRadius: 17, background: C.orange}} />
          <div style={{...FONTS.texte, fontWeight: 500, fontSize: 16, color: C.blanc, textShadow: '0 1px 6px rgba(0,0,0,0.6)'}}>@createur.demo</div>
        </div>
        {/* sous-titres animés façon UGC */}
        {CAPTIONS.map((c) => {
          const u = interpolate(t, [c.a, c.a + 0.25, c.b - 0.15, c.b], [0, 1, 1, 0], clamp);
          if (u <= 0) return null;
          return (
            <div key={c.txt} style={{position: 'absolute', left: 24, right: 24, bottom: 150, textAlign: 'center', opacity: u,
              transform: `scale(${0.92 + 0.08 * Math.min(1, u * 1.5)})`}}>
              <span style={{...FONTS.titre, fontSize: 30, color: C.blanc, background: 'rgba(14,14,16,0.72)', padding: '6px 14px',
                borderRadius: 10, boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone', lineHeight: 1.5}}>{c.txt}</span>
            </div>
          );
        })}
        <div style={{position: 'absolute', left: 18, bottom: 36, padding: '8px 14px', borderRadius: 12, background: C.orange,
          ...FONTS.texte, fontWeight: 500, fontSize: 15, color: C.noir, opacity: interpolate(t, [4.4, 4.8], [0, 1], clamp)}}>
          Thé glacé · marque fictive
        </div>
      </Phone>
      <Scrim />
      <DemoLabel n="02" title="Publicité UGC" sub="Créateur de contenu ou avatar IA"
        note="Démonstration PixelSavane · personnes et scènes générées par IA · produit et marque fictifs" t={t} len={len} />
    </AbsoluteFill>
  );
};

// ——— 3. Photographie commerciale premium ———
const Demo3: React.FC = () => {
  const t = useCurrentFrame() / FPS, len = CUT[3] - CUT[2];
  const hero = interpolate(t, [0.2, 1.4], [0, 1], {...clamp, easing: easeInOut});
  const a = interpolate(t, [0.9, 1.8], [0, 1], {...clamp, easing: easeOut});
  const b = interpolate(t, [1.2, 2.1], [0, 1], {...clamp, easing: easeOut});
  const txt = interpolate(t, [2.2, 3.0], [0, 1], {...clamp, easing: easeOut});
  return (
    <AbsoluteFill style={{background: '#0a0a0b'}}>
      <div style={{position: 'absolute', left: 1000, top: 0, width: 920, height: 1080, background: `radial-gradient(ellipse at 50% 40%, ${C.orange}1c 0%, #0a0a0b00 65%)`}} />
      {/* colonne secondaire */}
      <div style={{position: 'absolute', left: 630, top: 110 + (1 - a) * 80, opacity: a}}>
        <Shot src={img('photo-noir-blanc.jpg')} nat={[895, 1200]} w={330} h={420} zoom={lerp(1, 1.05, t / len)} oy={0.3} />
      </div>
      <div style={{position: 'absolute', left: 630, top: 560 + (1 - b) * 80, opacity: b}}>
        <Shot src={img('photo-affiche-mode.jpg')} nat={[966, 1200]} w={330} h={410} zoom={lerp(1.04, 1, t / len)} oy={0.35} />
      </div>
      {/* image principale de campagne, révélée en rideau */}
      <div style={{position: 'absolute', left: 1000, top: 40, width: 800, height: 1000, clipPath: `inset(${(1 - hero) * 100}% 0 0 0)`}}>
        <Shot src={img('photo-beaute.jpg')} nat={[864, 1079]} w={800} h={1000} zoom={lerp(1.0, 1.05, t / len)} oy={0.3} />
        {/* typographie de campagne (marque fictive) */}
        <div style={{position: 'absolute', left: 48, bottom: 56, opacity: txt, transform: `translateY(${(1 - txt) * 16}px)`}}>
          <div style={{...FONTS.titre, fontSize: 64, color: C.blanc, letterSpacing: '0.14em', textShadow: '0 4px 24px rgba(0,0,0,0.5)'}}>ÉCLAT</div>
          <div style={{...FONTS.sousTitre, fontSize: 22, color: C.blanc, opacity: 0.9, marginTop: 6}}>Sérum visage · marque fictive</div>
        </div>
      </div>
      <Scrim />
      <DemoLabel n="03" title="Photographie commerciale premium" sub="Campagne, portrait, mode et beauté"
        note="Démonstration PixelSavane · images générées par IA · marque fictive" t={t} len={len} />
    </AbsoluteFill>
  );
};

// ——— 4. Contenus réseaux sociaux ———
const FormatCard: React.FC<{x: number; y: number; w: number; h: number; u: number; label: string; float: number; children: React.ReactNode}> = ({x, y, w, h, u, label, float, children}) => (
  <div style={{position: 'absolute', left: x, top: y + (1 - u) * 140 + float, opacity: u}}>
    <div style={{width: w, background: '#151517', borderRadius: 18, overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,0.55)',
      border: '1px solid rgba(250,250,250,0.07)'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px'}}>
        <div style={{width: 28, height: 28, borderRadius: 14, background: C.orange}} />
        <div style={{...FONTS.texte, fontWeight: 500, fontSize: 14, color: C.blanc}}>@marque.demo</div>
        <div style={{...FONTS.texte, fontSize: 13, color: C.gris, marginLeft: 'auto'}}>Sponsorisé</div>
      </div>
      <div style={{position: 'relative', width: w, height: h}}>{children}</div>
      <div style={{height: 44}} />
    </div>
    <div style={{...FONTS.sousTitre, fontSize: 20, color: C.blanc, marginTop: 18, textAlign: 'center', opacity: 0.9}}>{label}</div>
  </div>
);
const Demo4: React.FC = () => {
  const t = useCurrentFrame() / FPS, len = CUT[4] - CUT[3];
  const u1 = interpolate(t, [0.2, 1.2], [0, 1], {...clamp, easing: easeOut});
  const u2 = interpolate(t, [0.55, 1.55], [0, 1], {...clamp, easing: easeOut});
  const u3 = interpolate(t, [0.9, 1.9], [0, 1], {...clamp, easing: easeOut});
  return (
    <AbsoluteFill style={{background: C.noir}}>
      <div style={{position: 'absolute', left: 500, top: 80, width: 1400, height: 1000, borderRadius: '50%',
        background: `radial-gradient(ellipse, ${C.orange}22 0%, ${C.orange}00 62%)`}} />
      <FormatCard x={600} y={170} w={420} h={504} u={u1} label="Publicité 4:5" float={Math.sin(t * 1.2) * 6}>
        <Shot src={img('social-projecteur.jpg')} nat={[899, 1080]} w={420} h={504} zoom={lerp(1, 1.04, t / len)} />
      </FormatCard>
      <FormatCard x={1070} y={250} w={400} h={400} u={u2} label="Post carré 1:1" float={Math.sin(t * 1.2 + 1.5) * 6}>
        <Shot src={img('social-voyage.jpg')} nat={[1080, 1080]} w={400} h={400} zoom={lerp(1.04, 1, t / len)} />
      </FormatCard>
      <div style={{position: 'absolute', left: 0, top: 0, opacity: u3}}>
        <Phone x={1520} y={130 + (1 - u3) * 140 + Math.sin(t * 1.2 + 3) * 6} w={330} h={587}>
          <Shot src={img('social-salon.jpg')} nat={[669, 1200]} w={330} h={587} zoom={lerp(1, 1.06, t / len)} oy={0.4} />
          <div style={{position: 'absolute', left: 14, right: 14, top: 44, height: 3, background: 'rgba(255,255,255,0.3)', borderRadius: 2}}>
            <div style={{width: `${Math.min(100, (t / (len - 0.4)) * 100)}%`, height: '100%', background: C.blanc}} />
          </div>
        </Phone>
        <div style={{position: 'absolute', left: 1520, width: 354, top: 760 + (1 - u3) * 140, ...FONTS.sousTitre, fontSize: 20,
          color: C.blanc, textAlign: 'center', opacity: 0.9}}>Story 9:16</div>
      </div>
      <Scrim />
      <DemoLabel n="04" title="Contenus pour les réseaux sociaux" sub="Formats publicitaires prêts à publier"
        note="Démonstration PixelSavane · visuels générés par IA · comptes et marques fictifs" t={t} len={len} />
    </AbsoluteFill>
  );
};

// ——— Carton de fin : PIXELSAVANE + signature ———
const EndCard: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const SC = 0.62;
  const left = 960 - 547 * SC, top = 470 - 713 * SC;
  const sig = interpolate(t, [0.9, 1.6], [0, 1], {...clamp, easing: easeOut});
  return (
    <AbsoluteFill style={{background: C.noir}}>
      <div style={{position: 'absolute', left: 560, top: 140, width: 800, height: 700, borderRadius: '50%',
        background: `radial-gradient(ellipse, ${C.orange}26 0%, ${C.orange}00 60%)`}} />
      {(letters as {file: string; x: number; y: number; w: number; h: number}[]).map((l, i) => {
        const u = interpolate(t, [0.2 + i * 0.05, 0.7 + i * 0.05], [0, 1], {...clamp, easing: easeOut});
        return (
          <Img key={l.file} src={staticFile(l.file)} style={{position: 'absolute', left: left + l.x * SC, top: top + l.y * SC + (1 - u) * 14,
            width: l.w * SC, height: l.h * SC, opacity: u, filter: u < 0.999 ? `blur(${(1 - u) * 5}px)` : undefined}} />
        );
      })}
      <div style={{position: 'absolute', left: 0, width: 1920, top: 560, textAlign: 'center', ...FONTS.texte, fontSize: 34,
        letterSpacing: '0.06em', color: C.blanc, opacity: sig, transform: `translateY(${(1 - sig) * 10}px)`}}>{SIGNATURE}</div>
      {[...Array(14)].map((_, k) => {
        const u = interpolate(t, [0.1 + random(`e${k}`) * 0.8, 0.9 + random(`e${k}`) * 0.8], [0, 1], clamp);
        return <div key={k} style={{position: 'absolute', left: 520 + random(`ex${k}`) * 880, top: 300 + random(`ey${k}`) * 420, width: 8 + random(`es${k}`) * 10,
          height: 8 + random(`es${k}`) * 10, background: k % 4 === 0 ? C.blanc : C.orange, opacity: (1 - Math.abs(u * 2 - 1)) * 0.6}} />;
      })}
    </AbsoluteFill>
  );
};

export const S03Creativite: React.FC = () => {
  useBrandFonts();
  const f = useCurrentFrame();
  const t = f / FPS;
  const tag = interpolate(t, [CUT[0] + 0.3, CUT[0] + 0.9, CUT[4] - 0.4, CUT[4]], [0, 1, 1, 0], clamp);
  const fadeOut = interpolate(t, [DUR - 0.5, DUR], [1, 0], clamp);
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
        <FilmGrain opacity={0.07} />
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 60%, rgba(0,0,0,0.45) 100%)', pointerEvents: 'none'}} />
      </AbsoluteFill>
      <div style={{position: 'absolute', right: 40, top: 22, ...FONTS.texte, fontSize: 14, color: C.gris, opacity: 0.6 * fadeOut}}>
        Maquette S03 v1.0 · muette
      </div>
    </AbsoluteFill>
  );
};
