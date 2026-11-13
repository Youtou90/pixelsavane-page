"""Découpe le logo officiel (raster original, jamais redessiné) en calques PNG transparents.

Usage : python3 scripts/extract_layers.py [logo_source]
Source par défaut : ../sources/1000324473.png (logo officiel transmis par le fondateur, 1254×1254,
avec l'ancienne signature « Des contenus qui font vendre. », exclue ici).

Le script est indépendant de la résolution : les repères ont été mesurés sur la mise en page
1080×1080 du même logo et sont multipliés par k = largeur / 1080.
Sorties dans public/ :
  - ps-pixels.png, ps-p.png, ps-s.png, ps-swoosh.png : calques à la résolution NATIVE de la source ;
  - wm-XX.png : lettres entières du wordmark (résolution native) ;
  - squares.json, points.json, wordmark-letters.json : positions exprimées en « unités 1080 »
    (repère de mise en page de l'animation ; le logo est affiché sur 1080 unités de côté).
Superposés, les calques reconstituent la source à l'identique (hors ancienne signature).
"""
import sys, json
import numpy as np
from PIL import Image
from scipy import ndimage as nd

src = sys.argv[1] if len(sys.argv) > 1 else '../sources/1000324473.png'
rgb = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
H, W, _ = rgb.shape
k = W / 1080.0  # facteur d'échelle par rapport à la mise en page de référence
S = lambda v: int(round(v * k))
mx = rgb.max(2); mn = rgb.min(2)
sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 0)
yy, xx = np.mgrid[0:H, 0:W]

# Alpha « dé-prémultiplié » sur fond noir : couleur × alpha == pixel source → recomposition exacte sur noir.
alpha = np.clip((mx - 4) / 90.0, 0, 1)
col = np.clip(np.where(alpha[..., None] > 0, rgb / np.maximum(alpha[..., None], 1e-3), 0), 0, 255)

def layer(mask):
    a = alpha * mask.astype(np.float32)
    return np.dstack([col, a * 255]).round().astype(np.uint8)

def save(mask, name):
    Image.fromarray(layer(mask), 'RGBA').save(f'public/{name}')

# ——— Zones (repères mesurés en unités 1080, mis à l'échelle) ———
symbol = (yy >= S(200)) & (yy < S(640))
cluster = symbol & (((yy < S(300)) & (xx < S(355))) | ((yy >= S(300)) & (yy < S(448)) & (xx < S(384)))
                    | ((yy >= S(448)) & (yy < S(482)) & (xx < S(362))) | ((yy >= S(482)) & (yy < S(505)) & (xx < S(340))))
s_letter = symbol & ~cluster & (xx > S(500)) & (sat > 0.35)
p_letter = symbol & ~cluster & ~s_letter
word = (yy >= S(640)) & (yy < S(786))  # l'ancienne signature commence plus bas : exclue
swoosh = (yy >= S(840)) & (yy < S(900)) & (sat > 0.35)  # trait orange ; l'ancienne signature (blanche) est exclue

save(cluster, 'ps-pixels.png')
save(p_letter, 'ps-p.png')
save(s_letter, 'ps-s.png')
save(word, 'ps-wordmark.png')
save(swoosh, 'ps-swoosh.png')

# ——— Carrés du nuage de pixels : cibles exactes des particules ———
core = nd.binary_erosion(cluster & (mx > 60), iterations=max(1, S(3)))  # sépare les carrés qui se touchent
lab, n = nd.label(core)
squares = []
for i, sl in enumerate(nd.find_objects(lab)):
    m = lab[sl] == i + 1
    if m.sum() < 60 * k * k: continue
    e = S(3)
    y0, x0 = sl[0].start - e, sl[1].start - e
    h, w = sl[0].stop - sl[0].start + 2 * e, sl[1].stop - sl[1].start + 2 * e
    c = rgb[sl][m].mean(0)
    squares.append(dict(x=round(x0 / k, 2), y=round(y0 / k, 2), w=round(w / k, 2), h=round(h / k, 2),
                        color='#%02x%02x%02x' % tuple(int(v) for v in c)))
json.dump(dict(source=src, width=W, height=H, scale=k, squares=squares), open('public/squares.json', 'w'), indent=1)

# ——— Points d'arrivée sur le P et le S (grille régulière ; une tuile par point) ———
STEP = S(17)
def sample(mask):
    pts = []
    full = mask & (alpha > 0.95)
    for y in range(0, H, STEP):
        for x in range(0, W, STEP):
            if full[y, x]:
                pts.append(dict(x=round(x / k, 2), y=round(y / k, 2), color='#%02x%02x%02x' % tuple(int(v) for v in rgb[y, x])))
    return pts
pts = dict(cell=round(STEP / k, 3), p=sample(p_letter), s=sample(s_letter))
json.dump(pts, open('public/points.json', 'w'))

# ——— Wordmark découpé en lettres ENTIÈRES ———
# Composantes connexes ; chaque pixel semi-transparent est attribué à la lettre la plus proche.
# « Sa » se touchent dans le dessin d'origine : ils restent un seul élément. Union des lettres = calque wordmark.
WM = layer(word)
wa = WM[..., 3]
lab, n = nd.label(wa > 128)
_, (iy, ix) = nd.distance_transform_edt(lab == 0, return_indices=True)
owner = lab[iy, ix] * (wa > 0)
comps = sorted([dict(ids=[i + 1], x0=o[1].start, x1=o[1].stop, y0=o[0].start, y1=o[0].stop)
                for i, o in enumerate(nd.find_objects(lab))], key=lambda c: c['x0'])
merged = []
for c in comps:  # rattache le point du i à son fût
    if merged and c['x0'] < merged[-1]['x1'] and (c['y1'] <= S(680) or merged[-1]['y1'] <= S(680)) and abs(c['x0'] - merged[-1]['x0']) < S(6):
        m = merged[-1]; m['ids'] += c['ids']
        m.update(x0=min(m['x0'], c['x0']), x1=max(m['x1'], c['x1']), y0=min(m['y0'], c['y0']), y1=max(m['y1'], c['y1']))
    else:
        merged.append(c)
letters = []
for i, c in enumerate(merged):
    mask = np.isin(owner, c['ids'])
    ys, xs = np.where(mask)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    L = WM.copy(); L[..., 3] = np.where(mask, wa, 0)
    Image.fromarray(L[y0:y1, x0:x1], 'RGBA').save(f'public/wm-{i:02d}.png')
    letters.append(dict(file=f'wm-{i:02d}.png', x=round(x0 / k, 3), y=round(y0 / k, 3), w=round((x1 - x0) / k, 3), h=round((y1 - y0) / k, 3)))
json.dump(letters, open('public/wordmark-letters.json', 'w'), indent=1)
rec_a = np.zeros(wa.shape)
for c in merged:
    rec_a += np.where(np.isin(owner, c['ids']), wa, 0)

# ——— Contrôles ———
rec = np.zeros_like(rgb)
for nm in ['ps-pixels.png', 'ps-p.png', 'ps-s.png', 'ps-wordmark.png', 'ps-swoosh.png']:
    Lr = np.asarray(Image.open('public/' + nm)).astype(np.float32)
    a = Lr[..., 3:] / 255
    rec = Lr[..., :3] * a + rec * (1 - a)
keep = ~((yy >= S(786)) & (yy < S(900)) & (sat <= 0.35))  # hors ancienne signature (retirée volontairement)
err = np.abs(rec - rgb)[keep]
old_sig = (yy >= S(786)) & (yy < S(840))
residue = sum((np.asarray(Image.open('public/' + nm))[..., 3][old_sig] > 20).sum() for nm in ['ps-wordmark.png', 'ps-swoosh.png'])
print(f'source {src} : {W}×{H}, k = {k:.4f}')
print(f'{len(squares)} carrés ; points P {len(pts["p"])}, S {len(pts["s"])} (tuile {pts["cell"]} unités)')
print(f'wordmark : {len(letters)} éléments entiers ; écart d\'alpha avec le calque complet = {np.abs(rec_a - wa).max():.0f}')
print(f'recomposition des calques vs source : écart moyen {err.mean():.3f}, max {err.max():.1f} (sur 255)')
print(f'pixels de l\'ancienne signature restant dans les calques : {residue}')
