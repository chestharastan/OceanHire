import { useEffect, useMemo, useRef } from 'react'
import { ArrowRight, ChevronDown } from 'lucide-react'
import Split from './Split.jsx'
import { onFrame, scrollToId } from '../lib/scroll.js'
import { useCountdown } from '../lib/hooks.js'
import { prefersReducedMotion } from '../lib/quality.js'
import { nextIntake } from '../config/site.js'

// HERO — a 200svh section with a sticky 100svh stage.
// The extra 100svh of scroll is the "dive": the WebGL camera (three/backdrop.js)
// tilts down and plunges through the surface while this copy lifts away and a
// serif "Dive in." surfaces. Scroll progress comes from the shared store, and
// only transform/opacity are written (compositor-only, no layout).
const smooth = (a, b, v) => {
  const t = Math.min(Math.max((v - a) / (b - a), 0), 1)
  return t * t * (3 - 2 * t)
}

function Countdown({ cd }) {
  const cells = [['d', 'Days'], ['h', 'Hrs'], ['m', 'Min'], ['s', 'Sec']]
  return (
    <div>
      <p className="eyebrow mb-2.5 text-foam/80">Next crew intake closes in</p>
      <div className="inline-flex divide-x divide-foam/25 rounded-xl border border-foam/30 bg-abyss/25 backdrop-blur-sm" role="timer" aria-label="Time until the next intake closes">
        {cells.map(([k, label]) => (
          <div key={k} className="min-w-[3.6rem] px-3 py-2 text-center sm:min-w-[4.4rem] sm:px-4">
            <span className="condensed num block text-[2rem] leading-none sm:text-[2.7rem]">{String(cd[k]).padStart(2, '0')}</span>
            <span className="eyebrow mt-1 block text-[0.58rem] text-foam/70">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Hero({ ready }) {
  const head = useRef(null)
  const low = useRef(null)
  const shade = useRef(null)
  const cap = useRef(null)
  const cd = useCountdown(useMemo(() => nextIntake(), []))

  useEffect(() => {
    if (prefersReducedMotion()) return
    let key = ''
    return onFrame((s) => {
      const p = s.heroP
      const k = p.toFixed(3)
      if (k === key) return
      key = k
      if (head.current) {
        head.current.style.transform = `translate3d(0,${(-p * 24).toFixed(2)}vh,0) scale(${(1 + p * 0.14).toFixed(3)})`
        head.current.style.opacity = String(1 - smooth(0.1, 0.48, p))
      }
      if (low.current) {
        low.current.style.transform = `translate3d(0,${(-p * 10).toFixed(2)}vh,0)`
        low.current.style.opacity = String(1 - smooth(0.04, 0.3, p))
      }
      if (shade.current) shade.current.style.opacity = String(1 - smooth(0.04, 0.35, p))
      if (cap.current) cap.current.style.opacity = String(smooth(0.5, 0.68, p) * (1 - smooth(0.88, 1, p)))
    })
  }, [])

  const go = (id) => (e) => {
    e.preventDefault()
    scrollToId(id)
  }

  return (
    <section id="home" className="relative h-[200svh] motion-reduce:h-[100svh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Soft shade so the light copy stays readable over the sun-glitter on the water */}
        <div
          ref={shade}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[66%] bg-gradient-to-t from-abyss/85 via-abyss/45 to-transparent sm:h-[48%] sm:from-abyss/70 sm:via-abyss/25"
        />
        <div className="container-x relative flex h-full flex-col justify-between pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-24 sm:pt-28">
          {/* Headline — wide caps with a serif-italic accent (Noomo + Beagle pairing) */}
          <h1
            ref={head}
            className="display gpu text-ink"
            style={{ fontSize: 'clamp(2.4rem, 8.4vw, 8.2rem)', transformOrigin: '30% 60%' }}
          >
            <Split className="block" text="Your career" start={ready} />
            <span className="block text-right sm:pr-[7vw]" style={{ fontSize: '1.22em', lineHeight: 0.9 }}>
              <Split text={[{ t: 'at', c: 'serif-i' }, { t: 'sea', c: 'serif-i' }]} start={ready} delay={140} />
            </span>
            <Split className="block" text="starts here" start={ready} delay={280} />
          </h1>

          <div
            ref={low}
            className={`gpu grid items-end gap-6 text-foam transition-opacity duration-1000 [text-shadow:0_1px_20px_rgba(4,16,32,0.55)] md:grid-cols-12 ${
              ready ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="order-2 md:order-1 md:col-span-4">
              <Countdown cd={cd} />
            </div>

            <div className="order-3 hidden justify-center md:order-2 md:col-span-3 md:flex">
              <button type="button" onClick={go('about')} className="group flex flex-col items-center gap-3" aria-label="Scroll down">
                <span className="eyebrow text-foam/80">Scroll</span>
                <span className="bob grid h-12 w-12 place-items-center rounded-full border border-foam/50 transition-colors group-hover:bg-foam group-hover:text-ink">
                  <ChevronDown className="h-5 w-5" />
                </span>
              </button>
            </div>

            <div className="order-1 md:order-3 md:col-span-5 md:max-w-md md:justify-self-end">
              <p className="text-[0.95rem] leading-relaxed text-foam/90 sm:text-base">
                OceanHire connects skilled professionals with leading cruise lines and shipping companies worldwide. From deck to
                dining, we help you find a role that takes your career across the horizon.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3 [text-shadow:none]">
                <a href="#apply" onClick={go('apply')} className="btn btn-primary">
                  Apply now <ArrowRight className="arrow h-4 w-4" />
                </a>
                <a href="#departments" onClick={go('departments')} className="btn btn-ghost">
                  Explore departments
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Surfaces mid-dive */}
        <div ref={cap} aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0">
          <span className="serif-i text-[clamp(3.4rem,14vw,11rem)] text-foam">Dive in.</span>
        </div>
      </div>
    </section>
  )
}
