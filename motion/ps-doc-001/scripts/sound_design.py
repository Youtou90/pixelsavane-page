"""Sound design cinématique 15 s (calé sur l'ouverture v1.3), 100 % synthétisé (numpy/scipy) : aucun sample, aucune licence.
Calé sur le scénario PS-001-A (25 fps). Sortie : public/sound.wav (48 kHz, stéréo, 24 bits -> 16 bits PCM).
"""
import numpy as np, wave
from scipy.signal import fftconvolve, butter, sosfilt

SR = 48000; DUR = 15.0; N = int(SR * DUR)
rng = np.random.default_rng(7)
t = np.arange(N) / SR
L = np.zeros(N); R = np.zeros(N)

def add(sig, start, pan=0.0, gain=1.0):
    i = int(start * SR); sig = sig[: max(0, N - i)] * gain
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    L[i:i + len(sig)] += sig * l * 1.414; R[i:i + len(sig)] += sig * r * 1.414

def env(n, a, d, curve=4.0):
    e = np.ones(n); na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na) ** 2
    e[na:] = np.exp(-curve * np.linspace(0, 1, n - na)) if d else 1
    return e

def lp(x, f, o=4): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi): return sosfilt(butter(2, [lo, hi], 'band', fs=SR, output='sos'), x)

# 1) Nappe grave (drone) : entre doucement à 1.4 s, s'ouvre jusqu'à 14 s
def drone():
    n = int(13.6 * SR); tt = np.arange(n) / SR
    f = 55.0
    s = sum(np.sin(2 * np.pi * f * k * tt * (1 + 0.0007 * k * np.sin(0.3 * tt))) / k ** 1.4 for k in (1, 2, 3, 4, 6))
    s = lp(s, 380)
    e = np.clip(tt / 3.0, 0, 1) ** 2 * (0.55 + 0.45 * np.clip((tt - 4.6) / 6, 0, 1))
    e *= np.clip((13.6 - tt) / 1.2, 0, 1)
    return s * e
add(drone(), 1.4, gain=0.16)

# 2) Le premier pixel : un « ping » cristallin à 2.0 s
def ping(f, dur=1.6, bright=1.0):
    n = int(dur * SR); tt = np.arange(n) / SR
    s = np.sin(2*np.pi*f*tt) + 0.35*bright*np.sin(2*np.pi*f*2.76*tt)*np.exp(-6*tt) + 0.2*np.sin(2*np.pi*f*5.4*tt)*np.exp(-12*tt)
    return s * env(n, 0.003, 1, 5.5)
add(ping(1318.5, 2.2), 2.0, pan=0.0, gain=0.22)
add(ping(659.25, 2.2, 0.5), 2.0, pan=0.0, gain=0.10)

# 3) Multiplication / dispersion (4–6 s) : pluie de micro-blips stéréo de plus en plus dense
notes = [1318.5, 1567.98, 1975.5, 2349.3, 2637.0, 1760.0]
for i in range(70):
    u = (i / 70) ** 0.7
    st = 4.0 + u * 2.0 + rng.uniform(-0.03, 0.03)
    add(ping(rng.choice(notes) * rng.choice([1, 2]), 0.35, 0.6), st, pan=rng.uniform(-0.9, 0.9), gain=0.045 * (1 - 0.4 * u))
# souffle granuleux qui se disperse
n = int(2.4 * SR); g = hp(rng.standard_normal(n), 3000) * np.sin(np.linspace(0, np.pi, n)) ** 2
add(g, 3.9, pan=-0.3, gain=0.025); add(g[::-1].copy(), 3.9, pan=0.3, gain=0.025)

# 4) Convergence (6–8 s) : riser (bruit filtré + glissando) qui aspire tout vers le centre
def riser(dur, f0, f1):
    n = int(dur * SR); tt = np.arange(n) / SR; u = tt / dur
    noise = rng.standard_normal(n); out = np.zeros(n)
    for a in range(0, n, 2400):  # filtre passe-bande glissant par blocs
        fc = f0 * (f1 / f0) ** (a / n)
        seg = bp(noise[max(0, a - 2400): a + 2400], fc * 0.7, min(fc * 1.4, 20000))
        out[a:a + 2400] = seg[-min(2400, n - a):] if a else seg[:2400]
    tone = np.sin(2 * np.pi * np.cumsum(220 * (4 ** u)) / SR) * 0.25
    return (out + tone) * u ** 2.2
add(riser(2.0, 300, 7000), 6.0, pan=-0.15, gain=0.16)
add(riser(2.0, 330, 7600), 6.0, pan=0.15, gain=0.16)
# petit vide juste avant l'impact : on coupe la fin du riser par un fondu court à 7.96 s

# 5) Impacts : P (8 s) puis S (10 s, plus brillant)
def impact(f0=48, dur=3.5, bright=0.5):
    n = int(dur * SR); tt = np.arange(n) / SR
    sub = np.sin(2 * np.pi * (f0 * tt + 40 * (1 - np.exp(-tt * 18)) / 18)) * np.exp(-tt * 1.6)
    thump = lp(rng.standard_normal(n), 900) * np.exp(-tt * 28)
    air = hp(rng.standard_normal(n), 4000) * np.exp(-tt * 9) * bright
    return sub * 0.9 + thump * 0.6 + air * 0.25
add(impact(46, 4.0, 0.4), 7.95, gain=0.42)
add(impact(52, 3.5, 0.9), 9.85, gain=0.36)
# chatoiement « orange » du S : accord brillant
for k, f in enumerate([880.0, 1108.7, 1318.5, 1760.0]):
    add(ping(f, 2.6, 0.4), 9.85 + 0.04 * k, pan=(-0.5 + k / 3), gain=0.05)

# 5b) Verrouillage des pixels : micro-clics cristallins pendant la construction du P (7,9–9,75 s) et du S (9,85–11,7 s)
for (a, b, base) in [(7.9, 9.75, 2637.0), (9.85, 11.7, 3135.96)]:
    for i in range(46):
        st = a + (b - a) * (i / 46) + rng.uniform(-0.02, 0.02)
        add(ping(base * rng.choice([1, 1.122, 1.335]), 0.18, 0.3), st, pan=rng.uniform(-0.5, 0.5), gain=0.03)

# 6) Wordmark (12 s) : souffle aérien + nappe d'accord qui s'ouvre (La majeur 9)
n = int(2.2 * SR); w = bp(rng.standard_normal(n), 1500, 9000) * np.sin(np.linspace(0, np.pi, n)) ** 3
add(w, 11.7, pan=-0.6, gain=0.06); add(w[::-1].copy(), 11.7, pan=0.6, gain=0.06)
def pad(freqs, dur):
    n = int(dur * SR); tt = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * tt + np.sin(2 * np.pi * 0.2 * tt) * 0.3) + 0.3 * np.sin(2 * np.pi * f * 2.001 * tt) for f in freqs)
    e = np.clip(tt / 1.4, 0, 1) ** 2 * np.clip((dur - tt) / 1.0, 0, 1)
    return lp(s, 2500) * e / len(freqs)
add(pad([220.0, 277.18, 329.63, 493.88], 3.3), 11.7, gain=0.20)  # tenue pendant le plan final fixe

# 7) Signature (12,7 s) : carillon final doux qui résout
add(ping(1760.0, 1.6, 0.3), 12.75, pan=0.2, gain=0.08)
add(ping(1318.5, 1.6, 0.3), 12.7, pan=-0.2, gain=0.08)

# Réverbération (IR synthétique à décroissance exponentielle, stéréo décorrélée)
def ir(seed, dur=2.6):
    r = np.random.default_rng(seed); n = int(dur * SR); tt = np.arange(n) / SR
    return lp(r.standard_normal(n), 7000) * np.exp(-tt * 2.8) * 0.02
wetL = fftconvolve(L, ir(1))[:N]; wetR = fftconvolve(R, ir(2))[:N]
L = L * 0.8 + wetL * 0.9; R = R * 0.8 + wetR * 0.9

# Silence strict 0–1.4 s, fondu de sortie sur les 0.25 dernières secondes
fade = np.ones(N); fade[: int(1.4 * SR)] = 0; k = int(0.25 * SR); fade[-k:] = np.linspace(1, 0, k) ** 2
L *= fade; R *= fade
peak = max(np.abs(L).max(), np.abs(R).max()); g = 10 ** (-1 / 20) / peak
st = (np.stack([L, R], 1) * g * 32767).astype(np.int16)
with wave.open('public/sound.wav', 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes(st.tobytes())
rms = np.sqrt(np.mean((np.stack([L, R]) * g) ** 2))
print(f'sound.wav écrit — crête -1 dBFS, RMS {20*np.log10(rms):.1f} dBFS')
