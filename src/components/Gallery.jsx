import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import MediaSlot from './MediaSlot.jsx'
import Split from './Split.jsx'
import Reveal from './Reveal.jsx'
import { MEDIA } from '../config/media.js'

// LIFE AT SEA — a native scroll-snap carousel (smooth, accessible, great on
// touch) with mouse drag on desktop and a light parallax inside each card.
// Add or remove slots in config/media.js (MEDIA.gallery) — nothing here changes.
export default function Gallery() {
  const scroller = useRef(null)
  const cards = useRef([])
  const bar = useRef(null)
  const [dragging, setDragging] = useState(false)
  const drag = useRef({ x: 0, left: 0, id: null, moved: false })
  const items = MEDIA.gallery

  // Parallax inside each card + progress bar. One rAF-throttled scroll listener;
  // reads offsets first, then writes styles (no layout thrash).
  const update = useCallback(() => {
    const sc = scroller.current
    if (!sc) return
    const mid = sc.scrollLeft + sc.clientWidth / 2
    cards.current.forEach((c) => {
      if (!c) return
      const d = (c.offsetLeft + c.offsetWidth / 2 - mid) / sc.clientWidth // −1…1 around the centre
      const inner = c.firstChild?.firstChild // wrapper (clips) → layer (moves)
      if (inner) inner.style.transform = `translate3d(${(d * -7).toFixed(2)}%,0,0) scale(1.18)`
    })
    const max = sc.scrollWidth - sc.clientWidth
    if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? (sc.scrollLeft / max).toFixed(3) : 0})`
  }, [])

  useEffect(() => {
    const sc = scroller.current
    let raf = 0
    const on = () => {
      if (!raf) raf = requestAnimationFrame(() => ((raf = 0), update()))
    }
    update()
    sc.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on, { passive: true })
    return () => {
      sc.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
      cancelAnimationFrame(raf)
    }
  }, [update])

  const by = (dir) => {
    const sc = scroller.current
    const w = cards.current[0]?.offsetWidth || sc.clientWidth * 0.5
    sc.scrollBy({ left: dir * (w + 20), behavior: 'smooth' })
  }

  // Mouse drag-to-scroll (touch already scrolls natively)
  const down = (e) => {
    if (e.pointerType !== 'mouse') return
    drag.current = { x: e.clientX, left: scroller.current.scrollLeft, id: e.pointerId, moved: false }
    setDragging(true)
    scroller.current.setPointerCapture?.(e.pointerId)
  }
  const move = (e) => {
    if (!dragging) return
    const dx = e.clientX - drag.current.x
    if (Math.abs(dx) > 3) drag.current.moved = true
    scroller.current.scrollLeft = drag.current.left - dx
  }
  const up = () => setDragging(false)

  return (
    <section id="life" className="relative py-24 sm:py-32">
      <div className="container-x flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
        <div>
          <Reveal>
            <span className="eyebrow text-aqua">Life at sea</span>
          </Reveal>
          <Split as="h2" className="display mt-5 block text-[clamp(2rem,5.6vw,5rem)]" text={[{ t: 'Moments' }, { t: 'from' }, { t: 'the' }, { t: 'crew', c: 'serif-i' }]} />
        </div>
        <div className="flex items-center gap-3">
          <span className="num eyebrow mr-2 text-foam/50">{String(items.length).padStart(2, '0')} moments</span>
          <button type="button" onClick={() => by(-1)} aria-label="Previous" className="grid h-12 w-12 place-items-center rounded-full border border-foam/25 transition-colors hover:bg-foam hover:text-ink">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => by(1)} aria-label="Next" className="grid h-12 w-12 place-items-center rounded-full border border-foam/25 transition-colors hover:bg-foam hover:text-ink">
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scroller}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        className={`no-scrollbar mt-12 flex items-end gap-5 overflow-x-auto px-[var(--gutter)] pb-4 ${
          dragging ? 'cursor-grabbing select-none' : 'cursor-grab snap-x snap-mandatory'
        }`}
        style={{ scrollPaddingInline: 'var(--gutter)' }}
        tabIndex={0}
        role="region"
        aria-label="Photo gallery — scroll horizontally"
      >
        {items.map((m, i) => (
          <figure
            key={m.label}
            ref={(el) => (cards.current[i] = el)}
            className="w-[78vw] shrink-0 snap-start sm:w-[44vw] lg:w-[30vw] xl:w-[26vw]"
          >
            {/* inner layer is what the parallax moves; the wrapper clips it */}
            <div className="overflow-hidden rounded-3xl" style={{ aspectRatio: m.aspect }}>
              <div className="gpu relative h-full w-full" style={{ transform: 'scale(1.18)' }}>
                <MediaSlot item={m} fill rounded="rounded-none" />
              </div>
            </div>
            <figcaption className="mt-4 flex items-baseline justify-between gap-4">
              <span className="serif text-2xl">{m.label}</span>
              <span className="num eyebrow text-foam/40">
                {String(i + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
              </span>
            </figcaption>
          </figure>
        ))}
        <div className="w-[var(--gutter)] shrink-0" aria-hidden="true" />
      </div>

      <div className="container-x mt-8">
        <div className="h-px w-full bg-foam/15">
          <div ref={bar} className="h-px origin-left bg-aqua" style={{ transform: 'scaleX(0)' }} />
        </div>
      </div>
    </section>
  )
}
