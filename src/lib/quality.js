// Device capability detection + a runtime frame-time governor.
//
// Heavy 3D must degrade gracefully, so every WebGL scene reads its budget from
// here instead of hard-coding numbers:
//   tier 0  low     – old/small phones, Save-Data, <=2 cores or <=2 GB RAM
//   tier 1  medium  – most phones and tablets (coarse pointer / narrow screen)
//   tier 2  high    – desktop / laptop
// On top of the static tier, `createGovernor` watches real frame times and
// lowers the render resolution if the device can't keep up (and raises it back
// when there is headroom), so a mid-range phone still scrolls smoothly.

const prefersReducedMotionQuery = '(prefers-reduced-motion: reduce)'

export function prefersReducedMotion() {
  return typeof matchMedia === 'function' && matchMedia(prefersReducedMotionQuery).matches
}

export function isCoarsePointer() {
  return typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches
}

export function detectTier() {
  if (typeof window === 'undefined') return 1
  const mem = navigator.deviceMemory || 4
  const cores = navigator.hardwareConcurrency || 4
  const saveData = !!navigator.connection?.saveData
  const small = Math.min(window.innerWidth, window.innerHeight) < 600
  let tier = isCoarsePointer() || small ? 1 : 2
  if (mem <= 2 || cores <= 2 || saveData) tier = 0
  // Allow manual override for testing: ?q=0|1|2
  const forced = new URLSearchParams(window.location.search).get('q')
  if (forced !== null && ['0', '1', '2'].includes(forced)) tier = Number(forced)
  return tier
}

// Per-tier budgets. Scenes pick what they need.
export const BUDGET = {
  0: { dpr: 1, fps: 30, oceanRings: 36, oceanSeg: 64, snow: 160, jellies: 1, tentacles: 8, msaa: false, grain: false },
  1: { dpr: 1.5, fps: 60, oceanRings: 52, oceanSeg: 96, snow: 360, jellies: 3, tentacles: 12, msaa: true, grain: true },
  2: { dpr: 2, fps: 60, oceanRings: 72, oceanSeg: 160, snow: 700, jellies: 4, tentacles: 16, msaa: true, grain: true },
}

/**
 * Dynamic-resolution controller. Feed it each frame's delta (ms); when the
 * smoothed frame time stays above the target it steps `scale` down, and when
 * there is sustained headroom it steps back up. Hysteresis + a cooldown stop it
 * from oscillating (changing pixel ratio reallocates the drawing buffer).
 */
export function createGovernor({ targetMs = 18, onScale }) {
  let ema = targetMs
  let slow = 0
  let fast = 0
  let cooldown = 0
  let scale = 1
  let warmup = 90 // skip the first frames: shader compilation + texture uploads always hitch
  return {
    get scale() {
      return scale
    },
    tick(dtMs) {
      if (warmup > 0) {
        warmup--
        return
      }
      // Ignore the huge deltas produced by tab switches / GC hiccups.
      if (dtMs > 200) return
      ema += (dtMs - ema) * 0.08
      if (cooldown > 0) {
        cooldown -= dtMs
        return
      }
      if (ema > targetMs * 1.25) {
        slow++
        fast = 0
      } else if (ema < targetMs * 0.7) {
        fast++
        slow = 0
      } else {
        slow = fast = 0
      }
      if (slow > 40 && scale > 0.55) {
        scale = Math.max(0.55, scale - 0.15)
        slow = 0
        cooldown = 1500
        onScale?.(scale)
      } else if (fast > 360 && scale < 1) {
        scale = Math.min(1, scale + 0.15)
        fast = 0
        cooldown = 1500
        onScale?.(scale)
      }
    },
  }
}
