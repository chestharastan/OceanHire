import { useEffect, useRef } from 'react'
import { MARQUEE_WORDS } from '../config/site.js'
import { onFrame } from '../lib/scroll.js'
import { prefersReducedMotion } from '../lib/quality.js'

// Two counter-moving rows of giant condensed type (Noomo's client marquee ×
// Simply Chocolate's heavy condensed caps). The base drift is constant; the
// scroll velocity adds speed and a slight skew, so the text "feels" the scroll.
// Only transforms are written, and a row is only a duplicated strip that wraps.
function Strip({ outline, ariaHidden = true }) {
  return (
    <div className="flex shrink-0 items-center" aria-hidden={ariaHidden}>
      {MARQUEE_WORDS.map((w) => (
        <span key={w} className="flex items-center">
          <span className={`condensed px-[2vw] text-[clamp(4.5rem,15vw,13rem)] ${outline ? 'outline-text' : 'text-foam'}`}>{w}</span>
          <span className="h-[1.6vw] min-h-3 w-[1.6vw] min-w-3 rotate-45 bg-aqua" />
        </span>
      ))}
    </div>
  )
}

export default function Marquee() {
  const a = useRef(null)
  const b = useRef(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    let wa = 0
    let wb = 0
    let xa = 0
    let xb = 0
    const measure = () => {
      wa = a.current ? a.current.scrollWidth / 2 : 0
      wb = b.current ? b.current.scrollWidth / 2 : 0
      xb = -wb / 2
    }
    measure()
    window.addEventListener('resize', measure, { passive: true })
    return onFrame((s, dt) => {
      if (!wa) return measure()
      const v = Math.max(-60, Math.min(60, s.vy))
      xa -= 0.045 * dt + v * 0.45
      xb += 0.035 * dt + v * 0.45
      if (xa <= -wa) xa += wa
      if (xa > 0) xa -= wa
      if (xb >= 0) xb -= wb
      if (xb < -wb) xb += wb
      const skew = (-v * 0.12).toFixed(2)
      a.current.style.transform = `translate3d(${xa.toFixed(1)}px,0,0) skewX(${skew}deg)`
      b.current.style.transform = `translate3d(${xb.toFixed(1)}px,0,0) skewX(${skew}deg)`
    })
  }, [])

  return (
    <section aria-label="Departments we recruit for" className="relative select-none overflow-hidden py-10 sm:py-16">
      <p className="sr-only">We recruit for: {MARQUEE_WORDS.join(', ')}.</p>
      <div ref={a} className="gpu flex w-max">
        <Strip />
        <Strip />
      </div>
      <div ref={b} className="gpu mt-2 flex w-max sm:mt-4">
        <Strip outline />
        <Strip outline />
      </div>
    </section>
  )
}
