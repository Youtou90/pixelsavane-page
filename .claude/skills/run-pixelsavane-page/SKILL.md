---
name: run-pixelsavane-page
description: Run, preview, and drive the PixelSavane landing page (single static index.html + CSS, no JS). Use when asked to start or serve the page, take a desktop or mobile screenshot, check the WhatsApp order links / pricing section / FAQ, or verify a change in a real browser.
---

One static page: `index.html` + `tokens.css` + `style.css` + `images/`. No build, no JS, no package.json. Drive it with `.claude/skills/run-pixelsavane-page/driver.mjs`: it serves the repo on a random local port, opens headless Chromium (Playwright), and runs one command per stdin line.

All paths are relative to the repo root.

## Prerequisites

Node 22 and the globally installed `playwright` (Chromium in `/opt/pw-browsers`) — already present in the Claude Code cloud container. The driver falls back to `$(npm root -g)/playwright`. Google Fonts load fine through the proxy.

## Run (agent path)

```bash
node .claude/skills/run-pixelsavane-page/driver.mjs <<'EOF'
nav /
shot accueil
click a[href="#formules"]
sleep 800
eval [location.hash, Math.round(document.getElementById('formules').getBoundingClientRect().top)]
eval [...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)
click #formules a[href*="Growth"]
sleep 500
errors
EOF
```

Expected: `["#formules",0]`, `[]` (no broken images), `popup: https://wa.me/237696229416?text=...Growth%20(95%20000%20FCFA)...`, `errors` → `(none)`. Screenshots in `/tmp/shots/` (override with `SHOTS=`). **Open the PNGs and look at them.**

Mobile (use `view`, not `shot` — see Gotchas):

```bash
node .claude/skills/run-pixelsavane-page/driver.mjs --mobile <<'EOF'
nav /
view accueil-mobile
click .faq summary
eval [...document.querySelectorAll('details')].map(d=>d.open)
eval document.getElementById('formules').scrollIntoView()
sleep 800
view formules-mobile
EOF
```

| flag / command | what it does |
|---|---|
| `--mobile` | iPhone 13 viewport/UA (DPR 3) |
| `nav <path>` | go to path, wait for network idle |
| `click <sel>` / `fill <sel> <text>` / `press <key>` | input (8 s timeout) |
| `wait <sel>` / `text <sel>` / `eval <js>` / `sleep <ms>` | observe |
| `shot [name]` / `view [name]` / `shotel <sel> [name]` | full-page / viewport-only / element screenshot → `/tmp/shots/<name>.png` |
| `errors` | console errors+warnings since last call, then clear |

Links with `target=_blank` are printed as `popup: <url>`; wa.me is stubbed, never contacted.

## Run (human path)

```bash
python3 -m http.server 8000   # -> http://localhost:8000/ ; Ctrl-C to stop
```

## Test

No test suite. The driver flow above is the check.

## Gotchas

- **`html { scroll-behavior: smooth }`**: anchor clicks and `scrollTo` animate. `sleep 800` before `view`/`eval scrollY`, or you capture the top of the page.
- **Mobile full-page `shot` is 1170×~22000 px** (DPR 3): unreadable when viewed. Use `view` after scrolling, or `shotel <section-selector>`.
- **Sticky "Commander sur WhatsApp · dès 50 000 FCFA" bar** on mobile covers the bottom of every viewport shot — expected, not a bug.
- **WhatsApp links are plain `<a href="https://wa.me/...?text=...">`** in `index.html` (header, three `#formules` cards, final CTA). Prices live both in the visible text and in the URL-encoded `text=` — change both.
- Popups from `target=_blank` start at `about:blank`; the driver waits for them to load before printing the URL (otherwise you get `popup: ` with nothing).
