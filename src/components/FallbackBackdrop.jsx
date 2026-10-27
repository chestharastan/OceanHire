import { useEffect, useRef } from 'react'
import { onFrame } from '../lib/scroll.js'

// CSS-only stand-in for the WebGL backdrop. Shown until the 3D chunk has painted
// its first frame, and permanently when WebGL is unavailable or the visitor
// prefers reduced motion. Same colour story (dawn → deep → abyss), but it is
// just three stacked gradients whose opacity follows the scroll — no GPU cost.
const smooth = (a, b, v) => {
  const t = Math.min(Math.max((v - a) / (b - a), 0), 1)
  return t * t * (3 - 2 * t)
}

export default function FallbackBackdrop({ active }) {
  const sky = useRef(null)
  const abyss = useRef(null)

  useEffect(() => {
    if (!active) return
    return onFrame((s) => {
      if (sky.current) sky.current.style.opacity = String(1 - smooth(0.1, 0.9, s.heroP))
      if (abyss.current) abyss.current.style.opacity = String(Math.min(s.depth * 1.1, 0.9))
    })
  }, [active])

  if (!active) return null
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-20">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,#3ba8c6 0%,#0f4f78 38%,#06182b 100%)' }} />
      <div ref={abyss} className="absolute inset-0 bg-abyss" style={{ opacity: 0 }} />
      <div
        ref={sky}
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg,#aebfe3 0%,#d9dfee 52%,#f6e4dc 70%,#7fa3c4 100%)' }}
      />
    </div>
  )
}
