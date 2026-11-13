import React from 'react';
import {AbsoluteFill, Img, interpolate, OffthreadVideo, random, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {C, FONTS, SIGNATURE} from '../system/brand';
import {useBrandFonts} from '../system/fonts';
import {clamp, easeIn, easeInOut, easeOut, lerp} from '../system/motion';
import {PixelWipe} from '../system/PixelWipe';
import {FilmGrain} from '../system/FilmGrain';
import {ChapterTag, DemoLabel, Scrim, Shot, Title} from './S03Creativite_v1_0';
import available from '../../public/s03v11/available.json';
import wfReel from '../../public/s03v11/watafufu-reel.json';
import letters from '../../public/wordmark-letters.json';

/**
 * SÉQUENCE 03 — « La créativité au service des marques » — v1.1 (ordre de correction DA, rév. 2), maquette muette, 35 s.
 *  01 Wata Fufu (B2B) : matériel réel de la marque (recadrages exacts de ses publications).
 *  02 UGC : A créatrice africaine (3 images 9:16) + B avatar IA (image ou vidéo 9:16), clairement distingués.
 *  03 ÉCLAT (marque fictive) : photographie produit, portrait publicitaire, affiche composée au montage.
 *  04 Maison Adjoa (marque fictive) : une campagne, trois compositions propres à chaque format.
 * Tous les textes sont composés au montage. Une image non fournie s'affiche comme un cadre « Image à fournir ».
 */

const FPS = 25;
const sec = (s: number) => Math.round(s * FPS);
const CUT = [3.0, 10.4, 17.8, 25.2, 32.6];
const DUR = 35;
type Asset = {file: string; w: number; h: number; ratio?: string; video?: boolean};
const AV = available as Record<string, Asset>;
const WF = wfReel as Record<string, Asset>;
const fade = (t: number, a: number, b: number, d = 0.25) => interpolate(t, [a - d, a, b - d, b], [0, 1, 1, 0], clamp);

// Image (ou vidéo) fournie en cadrage « cover », sinon cadre d'attente lisible
const Pic: React.FC<{name: string; ratio: string; w: number; h: number; zoom?: number; ox?: number; oy?: number; px?: number; style?: React.CSSProperties}> = ({
  name, ratio, w, h, zoom = 1, ox = 0.5, oy = 0.5, px = 0, style,
}) => {
  const a = AV[name];
  if (a?.video) {
    return (
      <div style={{position: 'absolute', width: w, height: h, overflow: 'hidden', ...style}}>
        <OffthreadVideo src={staticFile(a.file)} muted style={{width: w, height: h, objectFit: 'cover', transform: `scale(${zoom})`}} />
      </div>
    );
  }
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

// Plan net (taille plafonnée pour limiter l'agrandissement) sur fond plein cadre flou de la même image
const RealShot: React.FC<{n: string; x: number; y: number; w: number; h: number; o: number; u: number; cap: string; dir?: number}> = ({n, x, y, w, h, o, u, cap, dir = 1}) => {
  const a = WF[n];
  if (!a || o <= 0) return null;
  return (
    <>
      <div style={{position: 'absolute', left: x, top: y, width: w, height: h, overflow: 'hidden', opacity: o, borderRadius: 4, zIndex: 11,
        boxShadow: '0 40px 100px rgba(0,0,0,0.65)'}}>
        <Shot src={staticFile(a.file)} nat={[a.w, a.h]} w={w} h={h} zoom={lerp(1.0, 1.06, u)} px={dir * lerp(10, -10, u)} />
        <div style={{position: 'absolute', inset: 0, background: `linear-gradient(115deg, ${C.orange}30 0%, ${C.orange}00 35%)`, mixBlendMode: 'soft-light'}} />
      </div>
      <div style={{position: 'absolute', left: x + 20, top: y + 18, zIndex: 12, ...FONTS.texte, fontWeight: 500, fontSize: 14, letterSpacing: '0.22em',
        color: C.blanc, opacity: o, padding: '6px 12px', borderRadius: 8, background: 'rgba(14,14,16,0.78)'}}>{cap.toUpperCase()}</div>
    </>
  );
};
const Blurred: React.FC<{n: string; o: number; top: number; h: number}> = ({n, o, top, h}) => {
  const a = WF[n];
  if (!a || o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 0, top, width: 1920, height: h, overflow: 'hidden', opacity: o}}>
      <Shot src={staticFile(a.file)} nat={[a.w, a.h]} w={1920} h={h} zoom={1.1} style={{filter: 'blur(30px) brightness(0.22) saturate(1.1)'}} />
    </div>
  );
};

// ——— 01 · Wata Fufu : publicité B2B (matériel réel) ———
const B2B_FACTS = [ // reprises textuelles des publications de la marque (aucune caractéristique inventée)
  {post: 'post-1000250101', txt: 'Livraison à Douala et Yaoundé'},
  {post: 'post-1000250139', txt: 'Frais · Blanc · Livré chez vous'},
  {post: 'post-1000250152', txt: 'Qualité constante, lot après lot'},
];
const Demo1: React.FC = () => {
  const t = useCurrentFrame() / FPS, len = CUT[1] - CUT[0];
  const BAR = 140, H = 1080 - 2 * BAR;
  // A (0–3,3 s) : diptyque gros plans sac + texture ; B (3,3–5,4 s) : conditionnement ; C (5,4–7,4 s) : offre professionnelle
  const oA = interpolate(t, [0, 0.3, 3.05, 3.35], [0, 1, 1, 0], clamp);
  const oB = fade(t, 3.35, 5.6);
  const oC = interpolate(t, [5.4, 5.8], [0, 1], clamp);
  const brand = interpolate(t, [0.7, 1.4, 5.2, 5.6], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Blurred n="wf-sac-gros-plan" o={oA} top={BAR} h={H} />
      <Blurred n="wf-boules" o={oB} top={BAR} h={H} />
      <div style={{position: 'absolute', left: 0, top: BAR, width: 1920, height: H, opacity: oC,
        background: `radial-gradient(ellipse at 68% 45%, #1d1a14 0%, #0b0a09 70%)`}} />
      {/* A : gros plans (taille d'affichage ≤ 1,3× la source) */}
      <RealShot n="wf-sac-gros-plan" cap="L'emballage" x={640} y={238} w={630} h={496} o={oA} u={t / 3.4} />
      <RealShot n="wf-texture" cap="Le produit" x={1290} y={238} w={540} h={496} o={oA} u={t / 3.4} dir={-1} />
      {/* B : conditionnement */}
      <RealShot n="wf-boules" cap="Le conditionnement" x={760} y={262} w={1000} h={540} o={oB} u={(t - 3.1) / 2.6} />
      {/* nom du produit */}
      <div style={{position: 'absolute', right: 110, bottom: BAR + 46, textAlign: 'right', opacity: brand * (1 - oC), zIndex: 13,
        transform: `translateY(${(1 - brand) * 12}px)`}}>
        <div style={{...FONTS.titre, fontSize: 64, letterSpacing: '0.16em', color: C.blanc, textShadow: '0 6px 30px rgba(0,0,0,0.8)'}}>WATA FUFU</div>
        <div style={{...FONTS.sousTitre, fontSize: 22, color: C.blanc, textShadow: '0 2px 12px rgba(0,0,0,0.8)'}}>Fufu de manioc · Est-Cameroun</div>
      </div>
      {/* C : présentation B2B, appuyée sur les publications réelles de la marque */}
      {oC > 0 && (
        <>
          <div style={{position: 'absolute', left: 700, top: BAR + 46, zIndex: 13, opacity: oC}}>
            <div style={{...FONTS.sousTitre, fontSize: 18, letterSpacing: '0.24em', color: C.orange}}>OFFRE PROFESSIONNELLE</div>
            <div style={{...FONTS.titre, fontSize: 44, color: C.blanc, marginTop: 8}}>Sacs disponibles en volume</div>
          </div>
          {B2B_FACTS.map((f, i) => {
            const a = WF[f.post];
            const u = interpolate(t, [5.6 + i * 0.15, 6.3 + i * 0.15], [0, 1], {...clamp, easing: easeOut});
            const S = 340, X = 700 + i * (S + 40);
            return (
              <div key={f.post} style={{position: 'absolute', left: X, top: BAR + 190 + (1 - u) * 60, opacity: u, zIndex: 13}}>
                <div style={{width: S, height: S, borderRadius: 6, overflow: 'hidden', position: 'relative', boxShadow: '0 30px 70px rgba(0,0,0,0.6)'}}>
                  {a && <Shot src={staticFile(a.file)} nat={[a.w, a.h]} w={S} h={S} zoom={1} />}
                </div>
                <div style={{display: 'flex', gap: 10, alignItems: 'center', marginTop: 18}}>
                  <div style={{width: 8, height: 8, background: C.orange, flex: 'none'}} />
                  <div style={{...FONTS.sousTitre, fontSize: 20, color: C.blanc}}>{f.txt}</div>
                </div>
              </div>
            );
          })}
        </>
      )}
      <Scrim />
      <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: BAR, background: '#000', zIndex: 15}} />
      <div style={{position: 'absolute', left: 0, bottom: 0, width: 1920, height: BAR, background: '#000', zIndex: 15}} />
      <DemoLabel n="01" title="Publicité produit · B2B" sub="Marque africaine · vente en volume"
        note="Wata Fufu · visuels publicitaires de la marque (images non documentaires)" t={t} len={len} bottom={170} />
    </AbsoluteFill>
  );
};

// ——— 02 · UGC : A créatrice + B avatar IA ———
const CAP_A = [
  {a: 0.3, b: 1.5, n: 'ugc-1', l: ['Vous connaissez', 'le bissap Kéla ?']},
  {a: 1.5, b: 2.7, n: 'ugc-2', l: ['Frais, naturel,', 'pas trop sucré…']},
  {a: 2.7, b: 3.8, n: 'ugc-3', l: ['Mon nouveau', 'réflexe.']},
];
const CAP_B = [
  {a: 4.0, b: 5.6, l: ['Bonjour ! Je vous', 'présente Bissap Kéla.']},
  {a: 5.6, b: 7.2, l: ['Une boisson au bissap,', 'prête à boire.']},
];
const Captions: React.FC<{t: number; a: number; b: number; lines: string[]}> = ({t, a, b, lines}) => {
  const o = interpolate(t, [a, a + 0.15, b - 0.1, b], [0, 1, 1, 0], clamp);
  if (o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 20, right: 20, bottom: 120, textAlign: 'center', opacity: o, zIndex: 3}}>
      {lines.map((line, k) => (
        <div key={k} style={{display: 'inline-block', margin: '3px 0', padding: '5px 14px', borderRadius: 10,
          background: k === 1 ? C.orange : 'rgba(14,14,16,0.86)', color: k === 1 ? C.noir : C.blanc, ...FONTS.titre, fontSize: 34, lineHeight: 1.15}}>{line}</div>
      ))}
    </div>
  );
};
const Demo2: React.FC = () => {
  const t = useCurrentFrame() / FPS, len = CUT[2] - CUT[1];
  const FW = 430, FH = 764, Y = 168;
  const XA = 690, XB = 1240;
  const focusB = interpolate(t, [3.8, 4.2], [0, 1], {...clamp, easing: easeInOut});
  const inA = interpolate(t, [0.05, 0.7], [0, 1], {...clamp, easing: easeOut});
  const inB = interpolate(t, [0.3, 1.0], [0, 1], {...clamp, easing: easeOut});
  const frame = (x: number, active: number, inn: number, children: React.ReactNode, tag: string, sub: string) => (
    <div style={{position: 'absolute', left: x, top: Y + (1 - inn) * 60, opacity: inn * lerp(0.38, 1, active)}}>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 14}}>
        <div style={{...FONTS.titre, fontSize: 26, color: active > 0.5 ? C.orange : C.gris}}>{tag}</div>
        <div style={{...FONTS.sousTitre, fontSize: 18, color: C.blanc, opacity: 0.85}}>{sub}</div>
      </div>
      <div style={{position: 'relative', width: FW, height: FH, borderRadius: 26, overflow: 'hidden',
        boxShadow: active > 0.5 ? `0 40px 100px rgba(0,0,0,0.6), 0 0 0 2px ${C.orange}66` : '0 30px 70px rgba(0,0,0,0.5)'}}>{children}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{background: C.noir}}>
      <div style={{position: 'absolute', left: lerp(500, 1050, focusB), top: 40, width: 900, height: 1040, borderRadius: '50%',
        background: `radial-gradient(ellipse, ${C.orange}22 0%, ${C.orange}00 62%)`}} />
      {frame(XA, 1 - focusB, inA, (
        <>
          {CAP_A.map((c) => (t >= c.a - 0.3 && t < (c === CAP_A[2] ? 99 : c.b)) &&
            <Pic key={c.n} name={c.n} ratio="9:16" w={FW} h={FH} zoom={lerp(1, 1.05, (t - c.a) / 2)} oy={0.4} />)}
          {CAP_A.map((c) => <Captions key={c.n} t={t} a={c.a} b={c.b} lines={c.l} />)}
          <div style={{position: 'absolute', left: 18, top: 18, padding: '7px 12px', borderRadius: 10, background: 'rgba(14,14,16,0.82)',
            ...FONTS.texte, fontWeight: 500, fontSize: 15, color: C.blanc, zIndex: 3}}>Bissap Kéla · marque fictive</div>
        </>
      ), 'A', 'Créatrice UGC')}
      {frame(XB, focusB, inB, (
        <>
          <Pic name="avatar-ia" ratio="9:16" w={FW} h={FH} zoom={lerp(1, 1.04, Math.max(0, t - 3.8) / 3.6)} oy={0.35} />
          {CAP_B.map((c, i) => <Captions key={i} t={t} a={c.a} b={c.b} lines={c.l} />)}
          <div style={{position: 'absolute', left: 18, top: 18, padding: '7px 12px', borderRadius: 10, background: 'rgba(14,14,16,0.82)',
            ...FONTS.texte, fontWeight: 500, fontSize: 15, color: C.blanc, zIndex: 3}}>Avatar IA · personnage généré</div>
        </>
      ), 'B', 'Avatar IA')}
      <Scrim />
      <DemoLabel n="02" title="Publicité UGC" sub="Créatrice de contenu et avatar IA"
        note="Démonstration PixelSavane · personnes générées par IA · produit et marque fictifs" t={t} len={len} />
    </AbsoluteFill>
  );
};

// ——— 03 · ÉCLAT : campagne cosmétique (marque fictive) ———
const Demo3: React.FC = () => {
  const t = useCurrentFrame() / FPS, len = CUT[3] - CUT[2];
  const CW = 380, CH = 475, X0 = 640, GAP = 34, Y = 290;
  const brand = interpolate(t, [0.3, 1.1], [0, 1], {...clamp, easing: easeOut});
  const card = (i: number) => interpolate(t, [0.6 + i * 0.4, 1.6 + i * 0.4], [0, 1], {...clamp, easing: easeInOut});
  const caption = (i: number, txt: string) => (
    <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 20, opacity: interpolate(t, [1.4 + i * 0.4, 2.0 + i * 0.4], [0, 1], clamp)}}>
      <div style={{width: 10, height: 10, background: C.orange}} />
      <div style={{...FONTS.sousTitre, fontSize: 22, color: C.blanc}}>{txt}</div>
    </div>
  );
  const z = lerp(1.0, 1.05, t / len);
  return (
    <AbsoluteFill style={{background: '#0b0a09'}}>
      <div style={{position: 'absolute', left: 560, top: 100, width: 1360, height: 940, borderRadius: '50%', background: `radial-gradient(ellipse, ${C.orange}22 0%, ${C.orange}00 62%)`}} />
      <div style={{position: 'absolute', left: X0, width: 3 * CW + 2 * GAP, top: 160, textAlign: 'center', opacity: brand}}>
        <div style={{...FONTS.titre, fontSize: 56, letterSpacing: '0.42em', color: C.blanc, marginRight: '-0.42em'}}>ÉCLAT</div>
        <div style={{...FONTS.sousTitre, fontSize: 20, color: C.orange, letterSpacing: '0.12em', marginTop: 6}}>Sérum visage · marque fictive</div>
      </div>
      {/* 1. photographie produit */}
      <div style={{position: 'absolute', left: X0, top: Y}}>
        <div style={{position: 'relative', width: CW, height: CH, overflow: 'hidden', clipPath: `inset(${(1 - card(0)) * 100}% 0 0 0)`, boxShadow: '0 30px 70px rgba(0,0,0,0.5)'}}>
          <Pic name="eclat-produit" ratio="4:5" w={CW} h={CH} zoom={z} />
        </div>
        {caption(0, 'Photographie produit')}
      </div>
      {/* 2. portrait publicitaire */}
      <div style={{position: 'absolute', left: X0 + CW + GAP, top: Y}}>
        <div style={{position: 'relative', width: CW, height: CH, overflow: 'hidden', clipPath: `inset(${(1 - card(1)) * 100}% 0 0 0)`, boxShadow: '0 30px 70px rgba(0,0,0,0.5)'}}>
          <Pic name="eclat-portrait" ratio="4:5" w={CW} h={CH} zoom={z} oy={0.3} />
        </div>
        {caption(1, 'Portrait publicitaire')}
      </div>
      {/* 3. affiche commerciale, composée au montage à partir des images de la campagne */}
      <div style={{position: 'absolute', left: X0 + 2 * (CW + GAP), top: Y}}>
        <div style={{position: 'relative', width: CW, height: CH, overflow: 'hidden', clipPath: `inset(${(1 - card(2)) * 100}% 0 0 0)`, boxShadow: '0 30px 70px rgba(0,0,0,0.5)', background: '#120e0a'}}>
          <Pic name={AV['eclat-affiche-fond'] ? 'eclat-affiche-fond' : 'eclat-portrait'} ratio="4:5" w={CW} h={CH} zoom={1.08} oy={0.3} />
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,8,6,0.75) 0%, rgba(10,8,6,0) 40%, rgba(10,8,6,0) 55%, rgba(10,8,6,0.9) 100%)'}} />
          <div style={{position: 'absolute', left: 28, right: 28, top: 28}}>
            <div style={{...FONTS.titre, fontSize: 22, letterSpacing: '0.4em', color: C.orange}}>ÉCLAT</div>
            <div style={{...FONTS.titre, fontSize: 40, lineHeight: 1.05, color: C.blanc, marginTop: 10}}>Révélez votre éclat.</div>
          </div>
          <div style={{position: 'absolute', left: 28, right: 28, bottom: 26, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <div style={{...FONTS.sousTitre, fontSize: 17, color: C.blanc}}>Sérum visage</div>
            <div style={{padding: '9px 18px', borderRadius: 999, background: C.orange, ...FONTS.texte, fontWeight: 500, fontSize: 16, color: C.noir}}>Découvrir</div>
          </div>
        </div>
        {caption(2, 'Affiche commerciale')}
      </div>
      <Scrim />
      <DemoLabel n="03" title="Photographie commerciale" sub="Une campagne : produit, portrait, affiche"
        note="ÉCLAT · marque fictive, projet de démonstration · images générées par IA" t={t} len={len} />
    </AbsoluteFill>
  );
};

// ——— 04 · Réseaux sociaux : une campagne, trois formats (Maison Adjoa, marque fictive) ———
const CTA: React.FC<{label: string; size?: number}> = ({label, size = 20}) => (
  <div style={{display: 'inline-block', padding: `${size * 0.5}px ${size * 1.1}px`, borderRadius: 999, background: C.orange,
    ...FONTS.texte, fontWeight: 500, fontSize: size, color: C.noir}}>{label}</div>
);
const Demo4: React.FC = () => {
  const t = useCurrentFrame() / FPS, len = CUT[4] - CUT[3];
  const u = (d: number) => interpolate(t, [0.3 + d, 1.3 + d], [0, 1], {...clamp, easing: easeOut});
  const shade = 'linear-gradient(180deg, rgba(14,14,16,0.78) 0%, rgba(14,14,16,0) 38%, rgba(14,14,16,0) 58%, rgba(14,14,16,0.85) 100%)';
  const label = (txt: string) => <div style={{...FONTS.sousTitre, fontSize: 20, color: C.blanc, opacity: 0.85, marginTop: 16, textAlign: 'center'}}>{txt}</div>;
  return (
    <AbsoluteFill style={{background: C.noir}}>
      <div style={{position: 'absolute', left: 560, top: 100, width: 1360, height: 950, borderRadius: '50%', background: `radial-gradient(ellipse, ${C.orange}22 0%, ${C.orange}00 62%)`}} />
      <div style={{position: 'absolute', left: 620, top: 150, opacity: u(0), display: 'flex', alignItems: 'baseline', gap: 18}}>
        <div style={{...FONTS.titre, fontSize: 34, letterSpacing: '0.3em', color: C.blanc}}>MAISON ADJOA</div>
        <div style={{...FONTS.texte, fontSize: 16, color: C.gris}}>pâtisserie artisanale · marque fictive</div>
      </div>
      {/* 4:5 — titre en haut, bouton en bas */}
      <div style={{position: 'absolute', left: 620, top: 240 + (1 - u(0.1)) * 120, opacity: u(0.1)}}>
        <div style={{position: 'relative', width: 400, height: 500, borderRadius: 16, overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,0.55)'}}>
          <Pic name="adjoa-45" ratio="4:5" w={400} h={500} zoom={lerp(1, 1.04, t / len)} />
          <div style={{position: 'absolute', inset: 0, background: shade}} />
          <div style={{position: 'absolute', left: 28, top: 28, right: 28}}>
            <div style={{...FONTS.titre, fontSize: 40, lineHeight: 1.05, color: C.blanc}}>Nouveautés du week-end</div>
            <div style={{...FONTS.sousTitre, fontSize: 20, color: C.blanc, opacity: 0.9, marginTop: 10}}>Viennoiseries faites maison</div>
          </div>
          <div style={{position: 'absolute', left: 28, bottom: 28}}><CTA label="Commander" /></div>
        </div>
        {label('Publicité 4:5')}
      </div>
      {/* 1:1 — accroche courte en bas à gauche */}
      <div style={{position: 'absolute', left: 1050, top: 300 + (1 - u(0.45)) * 120, opacity: u(0.45)}}>
        <div style={{position: 'relative', width: 400, height: 400, borderRadius: 16, overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,0.55)'}}>
          <Pic name="adjoa-11" ratio="1:1" w={400} h={400} zoom={lerp(1.04, 1, t / len)} />
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(14,14,16,0.85) 0%, rgba(14,14,16,0) 45%)'}} />
          <div style={{position: 'absolute', left: 26, right: 26, bottom: 24, ...FONTS.titre, fontSize: 34, lineHeight: 1.1, color: C.blanc}}>Fait maison,<br />chaque matin.</div>
        </div>
        {label('Publication 1:1')}
      </div>
      {/* 9:16 — marque et horaire en haut, bouton centré en bas, zone sûre respectée */}
      <div style={{position: 'absolute', left: 1490, top: 200 + (1 - u(0.8)) * 120, opacity: u(0.8)}}>
        <div style={{position: 'relative', width: 320, height: 569, borderRadius: 22, overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,0.55)'}}>
          <Pic name="adjoa-916" ratio="9:16" w={320} h={569} zoom={lerp(1, 1.05, t / len)} oy={0.45} />
          <div style={{position: 'absolute', inset: 0, background: shade}} />
          <div style={{position: 'absolute', left: 22, right: 22, top: 44}}>
            <div style={{...FONTS.sousTitre, fontSize: 16, letterSpacing: '0.2em', color: C.orange}}>MAISON ADJOA</div>
            <div style={{...FONTS.titre, fontSize: 36, lineHeight: 1.05, color: C.blanc, marginTop: 8}}>Ouvert dès 7 h</div>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 44, textAlign: 'center'}}><CTA label="Commander maintenant" size={18} /></div>
        </div>
        {label('Story 9:16')}
      </div>
      <Scrim />
      <DemoLabel n="04" title="Contenus pour les réseaux sociaux" sub="Une campagne, trois formats"
        note="Maison Adjoa · marque fictive, projet de démonstration · images générées par IA" t={t} len={len} />
    </AbsoluteFill>
  );
};

// ——— Carton de fin : logo officiel + signature #FAFAFA, centrés, hors grain et vignettage ———
const EndCard: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const SC = 0.62;
  const L = letters as {file: string; x: number; y: number; w: number; h: number}[];
  const minX = Math.min(...L.map((l) => l.x)), maxX = Math.max(...L.map((l) => l.x + l.w));
  const minY = Math.min(...L.map((l) => l.y)), maxY = Math.max(...L.map((l) => l.y + l.h));
  const GAP = 44, SIG_H = 50; // hauteur du bloc : wordmark + espace + ligne de signature
  const blockH = (maxY - minY) * SC + GAP + SIG_H;
  const top0 = 540 - blockH / 2;
  const left = 960 - ((minX + maxX) / 2) * SC, top = top0 - minY * SC;
  const sig = interpolate(t, [0.9, 1.6], [0, 1], {...clamp, easing: easeOut});
  return (
    <AbsoluteFill style={{background: C.noir}}>
      <div style={{position: 'absolute', left: 560, top: 190, width: 800, height: 700, borderRadius: '50%',
        background: `radial-gradient(ellipse, ${C.orange}1e 0%, ${C.orange}00 60%)`}} />
      {L.map((l, i) => {
        const u = interpolate(t, [0.2 + i * 0.05, 0.7 + i * 0.05], [0, 1], {...clamp, easing: easeOut});
        return (
          <Img key={l.file} src={staticFile(l.file)} style={{position: 'absolute', left: left + l.x * SC, top: top + l.y * SC + (1 - u) * 14,
            width: l.w * SC, height: l.h * SC, opacity: u, filter: u < 0.999 ? `blur(${(1 - u) * 5}px)` : undefined}} />
        );
      })}
      <div style={{position: 'absolute', left: 0, width: 1920, top: top0 + (maxY - minY) * SC + GAP, height: SIG_H, display: 'flex',
        alignItems: 'center', justifyContent: 'center', ...FONTS.texte, fontSize: 38, letterSpacing: '0.04em', color: '#FAFAFA',
        opacity: sig, transform: `translateY(${(1 - sig) * 10}px)`}}>
        <span style={{marginRight: '-0.04em'}}>{SIGNATURE}</span>
      </div>
      {[...Array(10)].map((_, k) => {
        const v = interpolate(t, [0.1 + random(`e${k}`) * 0.6, 0.8 + random(`e${k}`) * 0.6], [0, 1], clamp);
        const x = random(`ex${k}`) < 0.5 ? 380 + random(`ex2${k}`) * 260 : 1280 + random(`ex2${k}`) * 260;
        return <div key={k} style={{position: 'absolute', left: x, top: 330 + random(`ey${k}`) * 420, width: 8 + random(`es${k}`) * 8,
          height: 8 + random(`es${k}`) * 8, background: k % 4 === 0 ? C.blanc : C.orange, opacity: (1 - Math.abs(v * 2 - 1)) * 0.5}} />;
      })}
    </AbsoluteFill>
  );
};

export const S03Creativite: React.FC = () => {
  useBrandFonts();
  const f = useCurrentFrame();
  const t = f / FPS;
  const tag = interpolate(t, [CUT[0] + 0.3, CUT[0] + 0.9, CUT[4] - 0.4, CUT[4]], [0, 1, 1, 0], clamp);
  const endOut = interpolate(t, [DUR - 0.3, DUR], [1, 0], {...clamp, easing: easeIn});
  const missing = Object.keys({'ugc-1': 1, 'ugc-2': 1, 'ugc-3': 1, 'avatar-ia': 1, 'eclat-produit': 1, 'eclat-portrait': 1, 'adjoa-45': 1, 'adjoa-11': 1, 'adjoa-916': 1})
    .filter((k) => !AV[k]).length;
  return (
    <AbsoluteFill style={{backgroundColor: C.noir}}>
      <Sequence from={0} durationInFrames={sec(CUT[0])}><Title /></Sequence>
      <Sequence from={sec(CUT[0])} durationInFrames={sec(CUT[1] - CUT[0])}><Demo1 /></Sequence>
      <Sequence from={sec(CUT[1])} durationInFrames={sec(CUT[2] - CUT[1])}><Demo2 /></Sequence>
      <Sequence from={sec(CUT[2])} durationInFrames={sec(CUT[3] - CUT[2])}><Demo3 /></Sequence>
      <Sequence from={sec(CUT[3])} durationInFrames={sec(CUT[4] - CUT[3])}><Demo4 /></Sequence>
      {t < CUT[4] && (
        <>
          <ChapterTag opacity={tag} />
          <FilmGrain opacity={0.05} />
          <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 60%, rgba(0,0,0,0.45) 100%)', pointerEvents: 'none'}} />
        </>
      )}
      {/* carton de fin rendu au-dessus du grain et du vignettage : contraste intact de la signature */}
      <Sequence from={sec(CUT[4])} durationInFrames={sec(DUR - CUT[4])}><AbsoluteFill style={{opacity: endOut}}><EndCard /></AbsoluteFill></Sequence>
      {CUT.map((c) => <PixelWipe key={c} t={t - c} />)}
      {t < CUT[4] && (
        <div style={{position: 'absolute', right: 40, top: 22, ...FONTS.texte, fontSize: 14, color: C.gris, opacity: 0.6}}>
          Maquette S03 v1.1 · muette{missing > 0 ? ` · ${missing} visuel(s) à fournir` : ''}
        </div>
      )}
    </AbsoluteFill>
  );
};
