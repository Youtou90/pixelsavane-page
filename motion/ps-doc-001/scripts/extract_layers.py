"""Découpe le logo source (raster original, jamais redessiné) en calques PNG transparents.
Usage : python3 scripts/extract_layers.py <logo_source.jpg|png>
Sorties dans public/ : ps-pixels.png, ps-p.png, ps-s.png, ps-wordmark.png, ps-swoosh.png, squares.json
Chaque calque garde la taille du logo source (1080x1080) : superposés, ils reconstituent le logo à l'identique.
"""
import sys, json
import numpy as np
from PIL import Image
from scipy import ndimage as nd

# Source par défaut : fichier logo tel que téléversé par Oscar (commit 39584a3), avec l'ancienne signature.
src = sys.argv[1] if len(sys.argv) > 1 else '../sources/logo-pixelsavane_original_upload-39584a3.jpg'
rgb = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
H, W, _ = rgb.shape
mx = rgb.max(2); mn = rgb.min(2)
sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 0)
yy, xx = np.mgrid[0:H, 0:W]

# Alpha « dé-prémultiplié » sur fond noir : couleur*alpha == pixel source => recomposition exacte sur noir.
alpha = np.clip((mx - 4) / 90.0, 0, 1)
col = np.where(alpha[..., None] > 0, rgb / np.maximum(alpha[..., None], 1e-3), 0)
col = np.clip(col, 0, 255)

def save(mask, name):
    a = (alpha * mask.astype(np.float32))
    out = np.dstack([col, a * 255]).round().astype(np.uint8)
    Image.fromarray(out, 'RGBA').save(f'public/{name}')

symbol = (yy >= 200) & (yy < 640)
cluster = symbol & (((yy < 300) & (xx < 355)) | ((yy >= 300) & (yy < 448) & (xx < 384)) | ((yy >= 448) & (yy < 482) & (xx < 362)) | ((yy >= 482) & (yy < 505) & (xx < 340)))
s_letter = symbol & ~cluster & (xx > 500) & (sat > 0.35)
p_letter = symbol & ~cluster & ~s_letter
word = (yy >= 640) & (yy < 786)  # l'ancienne signature commence à y=786 : exclue
swoosh = (yy >= 840) & (yy < 900) & (sat > 0.35)

save(cluster, 'ps-pixels.png')
save(p_letter, 'ps-p.png')
save(s_letter, 'ps-s.png')
save(word, 'ps-wordmark.png')
save(swoosh, 'ps-swoosh.png')

# Carrés du nuage de pixels : position + couleur moyenne, pour que les particules convergent exactement dessus.
core = nd.binary_erosion(cluster & (mx > 60), iterations=3)  # sépare les carrés qui se touchent en diagonale
lab, n = nd.label(core)
squares = []
for i, sl in enumerate(nd.find_objects(lab)):
    m = lab[sl] == i + 1
    if m.sum() < 60: continue
    y0, x0 = sl[0].start - 3, sl[1].start - 3
    h, w = sl[0].stop - sl[0].start + 6, sl[1].stop - sl[1].start + 6
    c = rgb[sl][m].mean(0)
    squares.append(dict(x=int(x0), y=int(y0), w=int(w), h=int(h), color='#%02x%02x%02x' % tuple(int(v) for v in c)))
json.dump(dict(width=W, height=H, squares=squares), open('public/squares.json', 'w'), indent=1)

# Contrôle : la superposition des calques doit reproduire la source.
rec = np.zeros_like(rgb)
for nm in ['ps-pixels.png', 'ps-p.png', 'ps-s.png', 'ps-wordmark.png', 'ps-swoosh.png']:
    L = np.asarray(Image.open('public/' + nm)).astype(np.float32)
    a = L[..., 3:] / 255
    rec = L[..., :3] * a + rec * (1 - a)
keep = ~((yy >= 786) & (yy < 900) & (sat <= 0.35))  # hors ancienne signature « Des contenus qui font vendre. » (retirée volontairement)
err = np.abs(rec - rgb)[keep]
print(f'{len(squares)} carrés ; erreur de recomposition moy={err.mean():.3f} max={err.max():.1f}')

# Points d'arrivée des particules sur le P et le S (grille régulière dans la forme pleine).
def sample(mask, step, name):
    pts = []
    full = mask & (alpha > 0.95)
    for y in range(0, H, step):
        for x in range(0, W, step):
            if full[y, x]:
                c = rgb[y, x]
                pts.append(dict(x=x, y=y, color='#%02x%02x%02x' % tuple(int(v) for v in c)))
    return pts
pts = dict(p=sample(p_letter, 17, 'p'), s=sample(s_letter, 17, 's'))
json.dump(pts, open('public/points.json', 'w'))
print('points P', len(pts['p']), 'S', len(pts['s']))
