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

## Adding your media (nothing is hard-coded)

Every image/video/3D model is a *slot* declared in **`src/config/media.js`**. Until you set a `src`, the slot shows a
labelled placeholder with the recommended size, so the layout is already final.

1. Drop the file into `public/media/` (images / video) or `public/models/` (`.glb`).
2. In `src/config/media.js` set that slot's `src`, e.g. `src: '/media/crew-bridge.webp'` (add `srcSet` / `poster` if you have them).
3. Done — no component changes. Add/remove entries in `MEDIA.gallery` freely.

Recommended: images WebP/AVIF ≤ 300 KB · video MP4 (H.264) ≤ 3 MB, muted loop · GLB ≤ 2 MB, ~30k tris, Draco/meshopt.
Setting `MODELS.ship.src` swaps the procedural ship for your model in both the wireframe view and the sailing boat.

Other content lives in **`src/config/site.js`** (departments, process steps, FAQ, contact, stats). The intake
countdown auto-rolls to the 15th of each month until you set `INTAKE_CLOSES_AT`.

## Performance design

* **One shared animation loop** (`lib/scroll.js`): all scroll effects and all WebGL scenes subscribe to a single
  `requestAnimationFrame`; it stops when the tab is hidden. Element positions are cached, so there are no per-frame layout reads.
* **three.js is a separate lazy chunk** (~143 kB gzip) fetched after first paint; the page is interactive without it.
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
  three/    stage.js (renderer runtime) · water.js (ocean + sky shaders) · backdrop.js · wireship.js · sail.js · LazyStage.jsx
  components/  one file per section + Loader, Navbar, DotNav, MediaSlot, Split, Reveal
```

## Notes
* The application and contact forms are front-end only (they simulate a request) — connect them to your backend/email service.
* Hero stats (40+ fleets, 12k+ crew…) and the office/phone details are the original site's copy; replace with real figures.
