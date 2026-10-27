import { useEffect, useRef, useState } from 'react'
import { onFrame, scroll } from './scroll.js'
import { prefersReducedMotion } from './quality.js'

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)

/**
 * Cached document-space geometry for an element. Reading getBoundingClientRect
 * every frame forces layout; instead we measure once (and on resize / layout
 * change) and compute positions from scroll.y — pure arithmetic per frame.
 */
export function useCachedRect(ref) {
  const rect = useRef({ top: 0, height: 0 })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      // Remove any transform we applied ourselves so it doesn't pollute the reading.
      const prev = el.style.transform
      el.style.transform = 'none'
      const r = el.getBoundingClientRect()
      el.style.transform = prev
      rect.current.top = r.top + window.scrollY
      rect.current.height = r.height
    }
    measure()
    const ro = 'ResizeObserver' in window ? new ResizeObserver(measure) : null
    ro?.observe(document.body)
    window.addEventListener('resize', measure, { passive: true })
    window.addEventListener('load', measure)
    return () => {
      ro?.disconnect()
      window.removeEventListener('resize', measure)
      window.removeEventListener('load', measure)
    }
  }, [ref])
  return rect
}

/**
 * Parallax: translate an element by (distance-from-viewport-centre * speed).
 *   speed > 0 → drifts against the scroll (feels far away / slow)
 *   speed < 0 → drifts with the scroll   (feels close / fast)
 * Writes only a transform (GPU-composited) and skips work while off-screen.
 */
export function useParallax(ref, { speed = 0.2, axis = 'y', scale = null } = {}) {
  const rect = useCachedRect(ref)
  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    let lastKey = ''
    return onFrame((s) => {
      const { top, height } = rect.current
      const centre = top + height / 2 - s.y - s.vh / 2 // px from viewport centre
      if (Math.abs(centre) > s.vh + height) return // far off-screen
      const off = -centre * speed
      let z = scale ? scale[0] + (scale[1] - scale[0]) * clamp01(1 - (centre + s.vh / 2) / (s.vh + height)) : 1
      const key = off.toFixed(1) + z.toFixed(3)
      if (key === lastKey) return
      lastKey = key
      const t = axis === 'x' ? `translate3d(${off.toFixed(1)}px,0,0)` : `translate3d(0,${off.toFixed(1)}px,0)`
      el.style.transform = scale ? `${t} scale(${z.toFixed(3)})` : t
    })
    // `scale` is a [from, to] pair; depend on its values, not the array identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, speed, axis, scale?.[0], scale?.[1]])
}

/**
 * Reports how far a tall (pinned) section has been scrolled through, 0..1.
 * progress = 0 when its top reaches the viewport top, 1 when its bottom
 * reaches the viewport bottom.
 */
export function useSectionProgress(ref, cb) {
  const rect = useCachedRect(ref)
  const cbRef = useRef(cb)
  cbRef.current = cb
  useEffect(() => {
    return onFrame((s) => {
      const { top, height } = rect.current
      const span = Math.max(height - s.vh, 1)
      cbRef.current(clamp01((s.y - top) / span), s)
    })
  }, [rect])
}

/**
 * 0 → 1 as an in-flow element travels up the screen: 0 when its top is at
 * `start` × viewport height, 1 when its bottom reaches `end` × viewport height.
 * Used for scroll-lit text and similar reveals.
 */
export function useViewProgress(ref, cb, { start = 0.9, end = 0.4 } = {}) {
  const rect = useCachedRect(ref)
  const cbRef = useRef(cb)
  cbRef.current = cb
  useEffect(() => {
    return onFrame((s) => {
      const { top, height } = rect.current
      const topY = top - s.y
      const p = clamp01((s.vh * start - topY) / (s.vh * (start - end) + height))
      cbRef.current(p)
    })
  }, [rect, start, end])
}

/** True once the element has entered the viewport (optionally re-arms when it leaves). */
export function useInView(ref, { once = true, margin = '0px 0px -8% 0px', threshold = 0.15 } = {}) {
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      setSeen(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[entries.length - 1] // latest state wins
        if (e.isIntersecting) {
          setSeen(true)
          if (once) io.disconnect()
        } else if (!once) setSeen(false)
      },
      { threshold, rootMargin: margin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, once, margin, threshold])
  return seen
}

/** Live countdown to `target` (Date). Returns { d, h, m, s, done }. Ticks once a second. */
export function useCountdown(target) {
  const calc = () => {
    const diff = Math.max(target.getTime() - Date.now(), 0)
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff / 3600000) % 24),
      m: Math.floor((diff / 60000) % 60),
      s: Math.floor((diff / 1000) % 60),
      done: diff === 0,
    }
  }
  const [t, setT] = useState(calc)
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.getTime()])
  return t
}

/** Tiny pub/sub on window so far-apart components (sail map → apply form) can talk. */
export const bus = {
  emit: (name, detail) => window.dispatchEvent(new CustomEvent(`oh:${name}`, { detail })),
  on: (name, fn) => {
    const h = (e) => fn(e.detail)
    window.addEventListener(`oh:${name}`, h)
    return () => window.removeEventListener(`oh:${name}`, h)
  },
}

export { scroll }
