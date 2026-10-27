import { useEffect, useState } from 'react'

// Intro loader — a scalloped gold ring with a live percentage, after the
// Persepolis Reimagined preloader. The percentage is real: it advances as the
// fonts and the 3D chunk actually become ready, then the curtain lifts.
//
// The progress loop lives HERE (not in <App>) so the 60 fps counter only
// re-renders this tiny component instead of the whole page.
const SCALLOPS = Array.from({ length: 36 }, (_, i) => {
  const a = (i / 36) * Math.PI * 2
  return { cx: 100 + Math.cos(a) * 86, cy: 100 + Math.sin(a) * 86 }
})
const R = 66
const CIRC = 2 * Math.PI * R

/**
 * @param glReady  ref whose `.current` flips to true when the 3D scene painted (or is not needed)
 * @param onLeave  curtain starts lifting (page content can begin its entrance)
 * @param onGone   curtain fully gone — unlock scrolling
 */
export default function Loader({ glReady, onLeave, onGone }) {
  const [pct, setPct] = useState(0)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    let fonts = !document.fonts
    document.fonts?.ready.then(() => (fonts = true)).catch(() => (fonts = true))
    const t0 = performance.now()
    let raf
    let value = 0
    const tick = () => {
      const el = performance.now() - t0
      const timedOut = el > 7000 // never trap the visitor behind a slow network
      const target = 12 + (fonts || timedOut ? 28 : 0) + (glReady.current || timedOut ? 60 : 0)
      value = Math.min(value + (target - value) * 0.07 + 0.12, target)
      setPct(value)
      if (value >= 99.5 && el > 1100) {
        setPct(100)
        setLeaving(true)
        onLeave?.()
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!leaving) return
    const t = setTimeout(() => onGone?.(), 1100)
    return () => clearTimeout(t)
  }, [leaving, onGone])

  return (
    <div
      role="status"
      aria-label="Loading OceanHire"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-abyss"
      style={{
        transform: leaving ? 'translate3d(0,-100%,0)' : 'none',
        transition: 'transform 1s cubic-bezier(0.76, 0, 0.24, 1)',
        background: 'radial-gradient(120% 90% at 50% 40%, #0d2a44 0%, #040f1c 70%)',
      }}
    >
      <span className="display absolute left-[var(--pad)] top-6 text-sm tracking-[0.06em] text-foam">
        Ocean<span className="opacity-60">Hire</span>
      </span>
      <div className="relative h-[min(60vw,220px)] w-[min(60vw,220px)]" style={{ opacity: leaving ? 0 : 1, transition: 'opacity .5s' }}>
        <svg viewBox="0 0 200 200" className="ring-spin absolute inset-0 h-full w-full text-sun" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
          {SCALLOPS.map((c, i) => (
            <circle key={i} cx={c.cx} cy={c.cy} r="13" opacity="0.8" />
          ))}
        </svg>
        <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full -rotate-90 text-sun" fill="none" stroke="currentColor" aria-hidden="true">
          <circle cx="100" cy="100" r={R} strokeWidth="1" opacity="0.2" />
          <circle cx="100" cy="100" r={R} strokeWidth="1.5" strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - pct / 100)} strokeLinecap="round" />
        </svg>
        <span aria-hidden="true" className="serif num absolute inset-0 flex items-center justify-center text-[clamp(2rem,9vw,3.2rem)] text-sun">
          {Math.round(pct)}
        </span>
      </div>
      <span className="eyebrow absolute bottom-8 text-foam/50">Charting your course</span>
    </div>
  )
}
