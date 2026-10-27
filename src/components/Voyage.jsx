import { useRef, useState } from 'react'
import MediaSlot from './MediaSlot.jsx'
import Split from './Split.jsx'
import Reveal from './Reveal.jsx'
import { MEDIA } from '../config/media.js'
import { VOYAGE } from '../config/site.js'
import { useSectionProgress } from '../lib/hooks.js'
import { prefersReducedMotion } from '../lib/quality.js'
import { scrollToY } from '../lib/scroll.js'

// THE PROCESS — a pinned scroll story (after Persepolis Reimagined's cinematic
// scroll narrative). The section is 600svh tall with a sticky 100svh stage; scroll
// progress picks the chapter and drives a slow "zoom-out" on the chapter image.
// Per-frame work is limited to a few transforms; React state only changes when the
// chapter changes. Reduced-motion visitors get a plain stacked list instead.
const N = VOYAGE.length
const SCALLOPS = Array.from({ length: 30 }, (_, i) => {
  const a = (i / 30) * Math.PI * 2
  return [100 + Math.cos(a) * 88, 100 + Math.sin(a) * 88]
})
const R = 70
const CIRC = 2 * Math.PI * R

function Ring({ n }) {
  return (
    <div className="relative h-24 w-24 sm:h-32 sm:w-32">
      <svg viewBox="0 0 200 200" className="ring-spin absolute inset-0 text-sun" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
        {SCALLOPS.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="12" opacity="0.7" />
        ))}
      </svg>
      <svg viewBox="0 0 200 200" className="absolute inset-0 -rotate-90 text-sun" fill="none" stroke="currentColor" aria-hidden="true">
        <circle cx="100" cy="100" r={R} strokeWidth="1" opacity="0.2" />
        {/* progress arc: --p (0..1) is written on the section each frame */}
        <circle cx="100" cy="100" r={R} strokeWidth="2" strokeLinecap="round" strokeDasharray={CIRC} style={{ strokeDashoffset: `calc(${CIRC} * (1 - var(--p, 0)))` }} />
      </svg>
      <span className="serif num absolute inset-0 grid place-items-center text-4xl text-sun sm:text-5xl">{n}</span>
    </div>
  )
}

export default function Voyage() {
  const section = useRef(null)
  const media = useRef([])
  const [idx, setIdx] = useState(0)
  const cur = useRef(0)
  const lastP = useRef('')
  const reduce = useRef(prefersReducedMotion()).current

  useSectionProgress(section, (p) => {
    if (reduce) return
    const t = p * N
    const i = Math.min(Math.floor(t), N - 1)
    const cp = Math.min(t - i, 1) // progress within the chapter
    if (i !== cur.current) {
      cur.current = i
      setIdx(i)
    }
    const pv = p.toFixed(3)
    if (pv !== lastP.current) {
      lastP.current = pv
      section.current.style.setProperty('--p', pv)
    }
    // Slow zoom-out on the active image
    const el = media.current[i]
    if (el) el.style.transform = `scale(${(1.22 - cp * 0.2).toFixed(4)}) translate3d(0,${((0.5 - cp) * 24).toFixed(2)}px,0)`
  })

  const jump = (i) => {
    const el = section.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    scrollToY(top + (i / N) * (el.offsetHeight - window.innerHeight) + 4)
  }

  if (reduce) {
    return (
      <section id="voyage" className="py-24">
        <div className="container-x">
          <h2 className="display text-[clamp(2rem,5.6vw,5rem)]">From application to embarkation</h2>
          <ol className="mt-12 grid gap-10 md:grid-cols-2">
            {VOYAGE.map((c) => (
              <li key={c.n}>
                <MediaSlot id={c.media} />
                <p className="num serif-i mt-5 text-xl text-sun">{c.n}</p>
                <h3 className="display text-2xl">{c.title}</h3>
                <p className="mt-2 text-foam/70">{c.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    )
  }

  return (
    <section id="voyage" ref={section} className="relative" style={{ height: `${N * 85 + 100}svh` }}>
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
        {/* heading */}
        <div className="container-x pt-24 sm:pt-28">
          <Reveal>
            <span className="eyebrow text-aqua">The process</span>
          </Reveal>
          <Split as="h2" className="display mt-3 block text-[clamp(1.5rem,3.6vw,3.2rem)]" text="From application to embarkation" />
        </div>

        <div className="container-x grid min-h-0 flex-1 items-center gap-5 py-4 sm:gap-8 lg:grid-cols-12 lg:gap-14">
          {/* chapter text */}
          <div className="relative order-2 min-h-[13.5rem] sm:min-h-[15rem] lg:order-1 lg:col-span-6 lg:min-h-[20rem]">
            <div className="absolute left-0 top-0 hidden lg:block">
              <Ring n={VOYAGE[idx].n} />
            </div>
            {VOYAGE.map((c, i) => {
              const on = i === idx
              return (
                <div
                  key={c.n}
                  aria-hidden={!on}
                  className="absolute inset-0 transition-[opacity,transform] duration-700 ease-out lg:pl-44 lg:pt-3"
                  style={{ opacity: on ? 1 : 0, transform: on ? 'none' : `translate3d(0,${i < idx ? -28 : 28}px,0)`, pointerEvents: on ? 'auto' : 'none' }}
                >
                  <p className="eyebrow flex items-center gap-3 text-sun">
                    <span className="num">{c.n}</span>
                    <span className="h-px w-10 bg-sun/60" />
                    {c.title}
                  </p>
                  <p className="serif mt-3 text-[clamp(2.2rem,5.4vw,4.6rem)] leading-[1.02]">{c.line}</p>
                  <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-foam/70 sm:text-base">{c.text}</p>
                </div>
              )
            })}
          </div>

          {/* chapter image — crossfades, slowly zooming out */}
          <div className="relative order-1 mx-auto aspect-[16/10] w-full max-w-xl lg:order-2 lg:col-span-6 lg:aspect-[4/4.2] lg:max-w-none">
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              {VOYAGE.map((c, i) => (
                <div
                  key={c.n}
                  className="absolute inset-0 transition-opacity duration-700"
                  style={{ opacity: i === idx ? 1 : 0 }}
                  aria-hidden={i !== idx}
                >
                  <div ref={(el) => (media.current[i] = el)} className="gpu absolute inset-0" style={{ transform: 'scale(1.22)' }}>
                    <MediaSlot item={{ ...MEDIA[c.media], aspect: '1 / 1' }} fill rounded="rounded-none" />
                  </div>
                </div>
              ))}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-abyss/50 via-transparent to-transparent" />
            </div>
            {/* ring sits on the image corner on small screens */}
            <div className="absolute -bottom-6 -right-2 scale-[0.7] lg:hidden">
              <Ring n={VOYAGE[idx].n} />
            </div>
          </div>
        </div>

        {/* chapter index */}
        <div className="container-x pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <ul className="flex gap-2 sm:gap-4" aria-label="Chapters">
            {VOYAGE.map((c, i) => (
              <li key={c.n} className="flex-1">
                <button type="button" onClick={() => jump(i)} className="group block w-full text-left" aria-current={i === idx ? 'step' : undefined}>
                  <span className="block h-px w-full bg-foam/20">
                    <span className="block h-px bg-sun transition-all duration-700" style={{ width: i <= idx ? '100%' : '0%' }} />
                  </span>
                  <span className={`eyebrow mt-3 block text-[0.6rem] transition-colors ${i === idx ? 'text-sun' : 'text-foam/40 group-hover:text-foam/80'}`}>
                    <span className="hidden sm:inline">{c.n} · </span>
                    {c.title}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
