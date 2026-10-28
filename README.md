# OceanHire

Maritime & cruise recruitment site — React 18 · Vite · Tailwind · three.js · Lenis.

One continuous **descent**: a pastel dawn sky and ocean (hero) → you dive through the surface →
bioluminescent deep sea for the rest of the page. A single fixed WebGL scene is driven by scroll,
with two interactive 3D sections and a pinned scroll story.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run preview
```

## Design references → what was built

| Reference | Borrowed idea | Where |
|---|---|---|
| noomoagency.com | Huge expanded all-caps type over pastel gradient, pearly 3D forms, jellyfish, client marquee | Hero (`Hero.jsx`, `three/backdrop.js`), `Marquee.jsx` |
| igloo.inc | Glowing isometric wireframe line-art, soft drifting particles | Departments wireframe ship (`three/wireship.js`) |
| bruno-simon.com | A drivable 3D world instead of a menu | "Take the helm" sailing map (`three/sail.js`, `Sail.jsx`) |
| persepolis.getty.edu | Gold ring preloader, film grain, serif scroll-story with progress ring | `Loader.jsx`, `Voyage.jsx`, `.grain` |
| simplychocolate.dk | Heavy condensed numerals, countdown boxes | Stats (`About.jsx`), intake countdown (`Hero.jsx`) |
| curvy.dk/beagle | Sans + serif pairing, side dot pager, circular scroll cue | `DotNav.jsx`, `index.css` |
| grakhxci.manus.space | Section structure: countdown, cards, gallery slider, FAQ accordion, RSVP form | `Gallery.jsx`, `FAQ.jsx`, `ApplyForm.jsx` |

Typography: **Archivo** variable (wide caps at `font-stretch: 125%`, condensed at `62%`, body at `100%`) +
**Instrument Serif** italic accents. Both are self-hosted via `@fontsource` (no Google Fonts request).

## Photos & media (nothing is hard-coded)

Every image/video/3D model is a *slot* declared in **`src/config/media.js`** and rendered by `<MediaSlot>`.

The site currently ships **14 free-to-use stock photos from [Unsplash](https://unsplash.com)** (Unsplash License: free for
commercial use, attribution not required — but credited in the footer anyway). They live in `public/media/` as an 800 px and a
1400 px WebP each (~1.6 MB for all, lazy-loaded, served with `srcset`). They are **illustrative** — swap in photos of your own
crew and vessels when you have them.

To replace a photo:

1. Export it as WebP/AVIF (≈800 px and ≈1400 px wide) into `public/media/`, named `<slug>-800.webp` / `<slug>-1400.webp`.
2. In `src/config/media.js` point the slot at the new slug (the `photo('slug', {…})` helper builds `src` + `srcSet`), and set
   `alt` (describe the picture), `focus` (the point that must stay in frame when the photo is cropped, e.g. `'50% 30%'`) and
   `credit` (or drop `credit` for your own photos — the footer credit line is generated from the manifest).
3. Done — no component changes. Add/remove entries in `MEDIA.gallery` freely (keep a tall `4 / 5` / short `4 / 3` rhythm).

A slot built with `slot('Label', 'hint')` instead of `photo(…)` shows a labelled placeholder with the recommended size.
Recommended: images WebP/AVIF ≤ 300 KB · video MP4 (H.264) ≤ 3 MB, muted loop · GLB ≤ 2 MB, ~30k tris, Draco/meshopt.
Setting `MODELS.ship.src` swaps the procedural ship for your model in both the wireframe view and the sailing boat.

Other content lives in **`src/config/site.js`** (departments, process steps, FAQ, contact, stats). The intake
countdown auto-rolls to the 15th of each month until you set `INTAKE_CLOSES_AT`.

## The hero scene

The hero is a photographic dawn rather than a flat render: all of it is procedural, nothing is a downloaded asset.

* **Sky** — FBM cloud layers with sun-side lighting and cirrus, a warm HDR sun disc with a soft halo.
* **Ocean** — Gerstner swell plus a micro-normal detail layer, backlit turquoise crests, noise foam, sun glitter and
  reflections of the real sky (`three/water.js`).
* **Brass-and-glass ship's wheel and bronze anchor** — turned lathe profiles, tubes and bevelled extrusions with PBR metal
  and, on desktop, real refraction + dispersion in the glass rim (`three/hero-objects.js`).
* **Cruise liner on the horizon** — stacked decks with a tiled, lit-window texture, funnel, lifeboats, foam collar and
  wake (`three/ship.js`).
* **Reflections / lighting** — the sky shader is baked once into a PMREM environment map so the metal and glass reflect the
  actual clouds and sun.
* **Film finish (desktop)** — HDR render target → bloom on the sun and glitter only → soft-knee highlight roll-off,
  vignette and a hint of chromatic aberration (`three/post.js`). The governor drops this first on a slow GPU, before any
  resolution is sacrificed.
* Phones and low-end devices keep the same composition with cheaper materials (iridescent clearcoat instead of
  transmission, fewer cloud octaves, no post-processing). The portrait layout tilts the camera so the horizon and ship
  sit in the gap between the headline and the copy.

## Performance design

* **One shared animation loop** (`lib/scroll.js`): all scroll effects and all WebGL scenes subscribe to a single
  `requestAnimationFrame`; it stops when the tab is hidden. Element positions are cached, so there are no per-frame layout reads.
* **three.js is a separate lazy chunk** (~145 kB gzip) fetched after first paint; the page is interactive without it.
* **Device tiers** (`lib/quality.js`): low / medium / high set pixel-ratio cap, ocean mesh density, particle & creature counts,
  MSAA, film grain and `backdrop-filter` use. Force one with `?q=0|1|2`.
* **Live governor**: if frame times stay high it lowers render resolution (and raises it again when there is headroom).
* **Max ~2 GL contexts**: the backdrop plus one interactive canvas; the ship / sailing canvases are created only near the
  viewport, paused when off-screen and fully disposed when far away.
* ~10–19 draw calls and <30k triangles per canvas. Particles, jellyfish, wake and waves animate in shaders, not in JS.
* Smooth wheel scrolling (Lenis) only on desktop; touch devices keep native momentum scrolling.
* **Graceful fallbacks**: no WebGL, a failed 3D chunk or `prefers-reduced-motion` → a CSS gradient backdrop with identical
  colours, and the pinned story becomes a normal list.

Add **`?debug`** to the URL for a live overlay (FPS, draw calls, triangles, resolution scale per canvas) — handy for testing on a real phone.

## Project structure

```
src/
  config/   site.js (copy + data) · media.js (media manifest)
  lib/      scroll.js (Lenis + shared loop) · hooks.js (parallax, progress…) · quality.js (tiers + governor)
  three/    stage.js (renderer runtime) · water.js (ocean + sky shaders) · backdrop.js · hero-objects.js · ship.js · post.js · wireship.js · sail.js · LazyStage.jsx
  components/  one file per section + Loader, Navbar, DotNav, MediaSlot, Split, Reveal
```

## Notes
* The application and contact forms are front-end only (they simulate a request) — connect them to your backend/email service.
* Hero stats (40+ fleets, 12k+ crew…) and the office/phone details are the original site's copy; replace with real figures.
