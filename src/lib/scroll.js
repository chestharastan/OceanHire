// Scroll engine: smooth scrolling (Lenis) + ONE shared requestAnimationFrame loop.
//
// Every scroll-linked effect (parallax, the hero dive, the marquee, the WebGL
// scenes) subscribes to `onFrame` instead of running its own rAF / scroll
// listener. That keeps the main thread to a single tick per frame, avoids
// repeated layout reads (element positions are cached, see hooks.js) and lets
// the loop stop entirely when the tab is hidden.
import Lenis from 'lenis'
import { prefersReducedMotion, isCoarsePointer } from './quality.js'

/** Live scroll state, mutated in place every frame. Read it, never store it. */
export const scroll = {
  y: 0, // px scrolled
  vy: 0, // smoothed velocity, px/frame-ish (signed)
  vh: 0, // viewport height
  vw: 0, // viewport width
  docH: 1, // total document height
  heroLen: 1, // scroll distance (px) over which the hero "dive" plays
  heroP: 0, // 0..1 progress through the dive
  depth: 0, // 0..1 progress through the whole page (drives how deep the sea gets)
}

const listeners = new Set()
let lenis = null
let raf = 0
let last = 0
let started = false

function measure() {
  scroll.vh = window.innerHeight
  scroll.vw = window.innerWidth
  scroll.docH = Math.max(document.documentElement.scrollHeight, 1)
  const hero = document.getElementById('home')
  scroll.heroLen = hero ? Math.max(hero.offsetHeight - scroll.vh, 1) : scroll.vh
}

function tick(time) {
  raf = requestAnimationFrame(tick)
  const dt = Math.min(time - last, 100)
  last = time
  if (lenis) lenis.raf(time)
  const y = lenis ? lenis.scroll : window.scrollY
  scroll.vy += ((y - scroll.y) - scroll.vy) * 0.2
  scroll.y = y
  scroll.heroP = Math.min(Math.max(y / scroll.heroLen, 0), 1)
  scroll.depth = Math.min(Math.max(y / Math.max(scroll.docH - scroll.vh, 1), 0), 1)
  for (const fn of listeners) fn(scroll, dt, time)
}

function loop() {
  if (raf || document.hidden) return
  last = performance.now()
  raf = requestAnimationFrame(tick)
}

/** Subscribe to the shared frame loop. Returns an unsubscribe function. */
export function onFrame(fn) {
  listeners.add(fn)
  loop()
  return () => listeners.delete(fn)
}

export function initScroll() {
  if (started) return
  started = true
  measure()

  // Smooth wheel scrolling on desktop only. Touch devices keep native momentum
  // scrolling (smoother, battery-friendly, and no scroll-jacking surprises).
  if (!prefersReducedMotion() && !isCoarsePointer()) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true, anchors: false })
    // The intro may already have locked scrolling before we got here.
    if (document.documentElement.style.overflow === 'hidden') lenis.stop()
  }

  let t = 0
  const remeasure = () => {
    clearTimeout(t)
    t = setTimeout(measure, 120)
  }
  window.addEventListener('resize', remeasure, { passive: true })
  // Layout shifts (fonts, accordions, lazy media) change document height.
  if ('ResizeObserver' in window) new ResizeObserver(remeasure).observe(document.body)

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(raf)
      raf = 0
    } else {
      loop()
    }
  })
  loop()
}

/** Re-read viewport / document sizes (call after big layout changes). */
export const remeasure = measure

/** Smooth-scroll to an element id (works with or without Lenis). */
export function scrollToId(id, { offset = 0, duration = 1.5 } = {}) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset, duration, easing: (x) => 1 - Math.pow(1 - x, 4) })
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
}

/** Smooth-scroll to an absolute document position. */
export function scrollToY(y, { duration = 1.6 } = {}) {
  if (lenis) lenis.scrollTo(y, { duration, easing: (x) => 1 - Math.pow(1 - x, 4) })
  else window.scrollTo({ top: y, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { duration: 2, easing: (x) => 1 - Math.pow(1 - x, 4) })
  else window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}

/** Pause / resume scrolling (used while the mobile menu is open). */
export function setScrollLocked(locked) {
  if (lenis) locked ? lenis.stop() : lenis.start()
  document.documentElement.style.overflow = locked ? 'hidden' : ''
}
