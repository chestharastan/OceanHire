// ─────────────────────────────────────────────────────────────────────────────
// MEDIA MANIFEST — the one file to edit when photos / videos / 3D models change.
//
// Every image, video and 3D model on the site is a "slot" declared here and
// rendered through <MediaSlot id="…" />. A slot with a `src` shows that media; a
// slot WITHOUT one shows a labelled placeholder (with recommended size/format),
// so the layout never shifts when real media is dropped in.
//
// To swap a photo:
//   1. Put the files in  /public/media/   (we ship an 800 px and a 1400 px WebP of each)
//   2. Point the slot's  src / srcSet  at them (see `photo()` below)
//   3. Set `alt` (describe what is shown), `focus` (the point that must stay in frame
//      when the photo is cropped to the slot) and `credit` if the licence asks for it.
//
// To go back to a placeholder, build the slot with `slot(...)` instead of `photo(...)`.
// Recommended: images WebP/AVIF ≤ 300 KB; video MP4 (H.264) ≤ 3 MB, muted loop.
//
// PHOTOS: the current images are free-to-use stock photos from Unsplash (Unsplash
// License — free for commercial use, attribution not required but given in the
// footer). They are ILLUSTRATIVE: swap in photos of your own crew and vessels when
// you have them.
// ─────────────────────────────────────────────────────────────────────────────

// Placeholder slot (no media yet)
const slot = (label, hint, aspect = '4 / 5', kind = 'image') => ({
  kind,
  aspect,
  label,
  hint,
  src: null, // ← set to '/media/your-file.webp'
  srcSet: null, // ← optional, e.g. '/media/a-800.webp 800w, /media/a-1400.webp 1400w'
  poster: null, // ← video only
  alt: label,
})

// Photo slot: expects /public/media/<slug>-800.webp and <slug>-1400.webp
const photo = (slug, { label, alt, aspect, focus = '50% 50%', sizes, by, page }) => ({
  kind: 'image',
  aspect,
  label,
  hint: '',
  src: `/media/${slug}-1400.webp`,
  srcSet: `/media/${slug}-800.webp 800w, /media/${slug}-1400.webp 1400w`,
  sizes,
  focus, // CSS object-position: where to anchor the crop
  poster: null,
  alt,
  credit: { name: by, url: page },
})

const U = 'https://unsplash.com/photos/'
// The process frame is cropped & slowly zoomed, so ask for a larger source than its CSS width.
const SIZES_HALF = '(min-width: 1024px) 64vw, 100vw'
const SIZES_CARD = '(min-width: 1280px) 26vw, (min-width: 1024px) 30vw, (min-width: 640px) 44vw, 78vw'

export const MEDIA = {
  // About section portrait, parallax-zoomed on scroll
  about: photo('about-crew', {
    label: 'Crew portrait',
    alt: 'A woman at a vessel’s wheel on deck, looking out to sea through binoculars',
    aspect: '4 / 5',
    focus: '50% 32%',
    sizes: '(min-width: 1024px) 46vw, 92vw',
    by: 'Luke Bender',
    page: U + 'woman-standing-in-front-of-captains-wheel-dX2Q6AYWxAI',
  }),

  // Pinned "Process" story — one backdrop per chapter
  voyage1: photo('voyage-apply', {
    label: 'Chapter 01 · Apply',
    alt: 'Hands holding a smartphone',
    aspect: '1 / 1',
    focus: '45% 50%',
    sizes: SIZES_HALF,
    by: 'Priscilla Du Preez',
    page: U + 'person-using-smartphone-BjhUu6BpUZA',
  }),
  voyage2: photo('voyage-review', {
    label: 'Chapter 02 · Review',
    alt: 'A recruiter smiling and waving during a video call on a laptop',
    aspect: '1 / 1',
    focus: '48% 45%',
    sizes: SIZES_HALF,
    by: 'Vitaly Gariev',
    page: U + 'woman-waving-during-a-video-call-on-her-laptop-nSj0hdQUrW0',
  }),
  voyage3: photo('voyage-prepare', {
    label: 'Chapter 03 · Prepare',
    alt: 'A hand holding a passport in front of a bright window',
    aspect: '1 / 1',
    focus: '50% 42%',
    sizes: SIZES_HALF,
    by: 'Omar Ramadan',
    page: U + 'a-person-holding-a-passport-in-their-hand-cx2pDIsxGvg',
  }),
  voyage4: photo('voyage-match', {
    label: 'Chapter 04 · Match',
    alt: 'Two professionals shaking hands to agree a contract',
    aspect: '1 / 1',
    focus: '52% 60%',
    sizes: SIZES_HALF,
    by: 'Ambre Estève',
    page: U + 'two-business-partners-shaking-hands-in-agreement-gdCwuKCuJWY',
  }),
  voyage5: photo('voyage-embark', {
    label: 'Chapter 05 · Embark',
    alt: 'A ship’s deck rail with a lifebuoy overlooking calm water at sunset',
    aspect: '1 / 1',
    focus: '78% 40%',
    sizes: SIZES_HALF,
    by: 'Petar Sajko',
    page: U + 'a-ships-deck-overlooks-the-beautiful-ocean-K805aHztIms',
  }),

  // "Life at sea" horizontal gallery (add or remove entries freely; keep a tall/short rhythm)
  gallery: [
    photo('gallery-bridge', {
      label: 'The bridge',
      alt: 'A man at the helm in a vessel’s wheelhouse',
      aspect: '4 / 5',
      focus: '40% 45%',
      sizes: SIZES_CARD,
      by: 'Clara Franceschi',
      page: U + 'a-man-sitting-at-the-helm-of-a-boat-aNMLQCNhXqA',
    }),
    photo('gallery-engine', {
      label: 'Engine control room',
      alt: 'Two large green motors in a ship’s engine room',
      aspect: '4 / 3',
      sizes: SIZES_CARD,
      by: 'Bernd Dittrich',
      page: U + 'a-couple-of-green-machines-sitting-inside-of-a-building-JKTTnxWhNeg',
    }),
    photo('gallery-theatre', {
      label: 'The theatre',
      alt: 'Two dancers performing on a stage under warm lights',
      aspect: '4 / 5',
      focus: '55% 55%',
      sizes: SIZES_CARD,
      by: 'Kazuo ota',
      page: U + 'two-dancers-in-colorful-costumes-performing-on-stage-G1axyxs_fXo',
    }),
    photo('gallery-galley', {
      label: 'The galley',
      alt: 'Two chefs at work in a busy stainless-steel galley',
      aspect: '4 / 3',
      focus: '50% 55%',
      sizes: SIZES_CARD,
      by: 'hybridnighthawk',
      page: U + 'a-couple-of-chefs-working-in-a-kitchen-u0NElYxby4c',
    }),
    photo('gallery-sickbay', {
      label: 'Sick bay',
      alt: 'A smiling doctor with a stethoscope at a desk',
      aspect: '4 / 5',
      focus: '50% 40%',
      sizes: SIZES_CARD,
      by: 'Vitaly Gariev',
      page: U + 'a-female-doctor-wearing-a-stethoscope-sits-at-her-desk-_zbqco3m7dA',
    }),
    photo('gallery-mess', {
      label: 'Crew mess',
      alt: 'A group sharing a meal around a long table, seen from above',
      aspect: '4 / 3',
      sizes: SIZES_CARD,
      by: 'Spencer Davis',
      page: U + 'a-group-of-people-sitting-around-a-table-with-food-vJsj-hgOEG0',
    }),
    photo('gallery-frontofhouse', {
      label: 'Front of house',
      alt: 'A waiter serving guests at a café table',
      aspect: '4 / 3',
      focus: '62% 50%',
      sizes: SIZES_CARD,
      by: 'Vitaly Gariev',
      page: U + 'a-waiter-serves-food-to-a-couple-in-a-restaurant-M5Rd9A4d64A',
    }),
    photo('gallery-port', {
      label: 'Evening in port',
      alt: 'A cruise ship lit up in harbour at dusk',
      aspect: '4 / 3',
      focus: '63% 42%',
      sizes: SIZES_CARD,
      by: 'Vidar Nordli-Mathisen',
      page: U + 'large-cruise-ship-docked-in-a-harbor-at-dusk-Tp71k99hcBY',
    }),
  ],

  // Optional hero reel — a looping clip that can sit behind the 3D scene (still a placeholder)
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

/** Unique photographer credits for every photo slot — rendered in the footer. */
export function photoCredits() {
  const all = [MEDIA.about, MEDIA.voyage1, MEDIA.voyage2, MEDIA.voyage3, MEDIA.voyage4, MEDIA.voyage5, ...MEDIA.gallery]
  const seen = new Map()
  for (const m of all) if (m.credit && !seen.has(m.credit.name)) seen.set(m.credit.name, m.credit.url)
  return [...seen].map(([name, url]) => ({ name, url }))
}
