// ─────────────────────────────────────────────────────────────────────────────
// MEDIA MANIFEST — the one file to edit when photos / videos / 3D models arrive.
//
// Every image, video and 3D model on the site is a "slot" declared here and
// rendered through <MediaSlot id="…" />. While `src` is null the slot shows a
// labelled blueprint placeholder (with the recommended size + format), so the
// layout is final and nothing shifts when real media drops in.
//
// To add real media:
//   1. Put the file in  /public/media/   (e.g. public/media/crew-bridge.jpg)
//   2. Set its slot's  src: '/media/crew-bridge.jpg'
//   3. (optional) add  srcSet / poster / alt — that's it. No component changes.
//
// kind: 'image' | 'video'            aspect: CSS aspect-ratio (w / h)
// Recommended: images as WebP/AVIF ≤ 300 KB; video as MP4 (H.264) ≤ 3 MB, muted loop.
// ─────────────────────────────────────────────────────────────────────────────

const slot = (label, hint, aspect = '4 / 5', kind = 'image') => ({
  kind,
  aspect,
  label,
  hint,
  src: null, // ← set to '/media/your-file.webp'
  srcSet: null, // ← optional, e.g. '/media/a-800.webp 800w, /media/a-1600.webp 1600w'
  poster: null, // ← video only
  alt: label,
})

export const MEDIA = {
  // About section portrait, parallax-zoomed on scroll
  about: slot('Crew portrait', 'Portrait of crew on deck at golden hour · 1600×2000 · WebP', '4 / 5'),

  // Pinned "Process" story — one backdrop per chapter
  voyage1: slot('Chapter 01 · Apply', 'Candidate filling the form on a phone · 1600×2000', '4 / 5'),
  voyage2: slot('Chapter 02 · Review', 'Crewing office, recruiter on a call · 1600×2000', '4 / 5'),
  voyage3: slot('Chapter 03 · Prepare', 'Passport, seaman’s book & safety training · 1600×2000', '4 / 5'),
  voyage4: slot('Chapter 04 · Match', 'Contract signing / handshake · 1600×2000', '4 / 5'),
  voyage5: slot('Chapter 05 · Embark', 'Crew boarding at the gangway · 1600×2000 or a 6s MP4 loop', '4 / 5'),

  // "Life at sea" horizontal gallery (add or remove entries freely)
  gallery: [
    { ...slot('The bridge', 'Officers on watch, wide shot · 1600×2000', '4 / 5') },
    { ...slot('The galley', 'Chefs plating at pace · 1600×1200', '4 / 3') },
    { ...slot('Engine control room', 'Engineers at the console · 1600×2000', '4 / 5') },
    { ...slot('The theatre', 'Performers backstage / on stage · 1600×1200', '4 / 3') },
    { ...slot('Sick bay', 'Medical team on shift · 1600×2000', '4 / 5') },
    { ...slot('Crew mess', 'Crew from 60+ nations at table · 1600×1200', '4 / 3') },
  ],

  // Optional hero reel — a looping clip that can sit behind the 3D scene
  heroReel: slot('Hero reel', 'Cinematic 8s loop, ship at sea · 1920×1080 MP4 ≤ 3 MB', '16 / 9', 'video'),
}

// 3D models (.glb). Both are OPTIONAL: when `src` is null the site builds its own
// procedural ship, so nothing is missing. When set, the model replaces it.
//   target ≤ 2 MB, ~30k triangles, Draco/meshopt compressed, +Z = bow, origin at keel centre.
export const MODELS = {
  ship: {
    src: null, // ← '/models/cruise-ship.glb'
    hint: 'Cruise ship · used for the wireframe anatomy and the sailable boat',
  },
}
