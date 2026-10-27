import { useEffect, useRef, useState } from 'react'
import Reveal from './Reveal.jsx'
import MediaSlot from './MediaSlot.jsx'
import { PILLARS, STATS } from '../config/site.js'
import { useInView, useParallax, useViewProgress } from '../lib/hooks.js'
import { prefersReducedMotion } from '../lib/quality.js'

// Words that "light up" as you scroll through the statement (Persepolis-style
// scroll storytelling). Only an opacity flips per word, and only when the count
// of lit words actually changes.
function ScrollWords({ text, className = '' }) {
  const ref = useRef(null)
  const words = text.split(' ')
  const lit = useRef(-1)
  const reduce = useRef(prefersReducedMotion()).current

  useViewProgress(
    ref,
    (p) => {
      if (reduce) return
      const n = Math.round(p * (words.length + 1))
      if (n === lit.current) return
      lit.current = n
      const spans = ref.current.children
      for (let i = 0; i < spans.length; i++) spans[i].style.opacity = i < n ? '1' : '0.16'
    },
    { start: 0.85, end: 0.5 },
  )

  return (
    <p ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden="true" className="transition-opacity duration-500" style={{ opacity: reduce ? 1 : 0.16 }}>
          {w}{' '}
        </span>
      ))}
    </p>
  )
}

function CountUp({ to, suffix = '' }) {
  const ref = useRef(null)
  const seen = useInView(ref, { threshold: 0.4 })
  const [v, setV] = useState(prefersReducedMotion() ? to : 0)
  useEffect(() => {
    if (!seen || prefersReducedMotion()) return setV(to)
    const t0 = performance.now()
    let raf
    const tick = (t) => {
      const k = Math.min((t - t0) / 1600, 1)
      setV(Math.round(to * (1 - Math.pow(1 - k, 3))))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [seen, to])
  return (
    <span ref={ref} className="num">
      {v}
      {suffix}
    </span>
  )
}

export default function About() {
  const mediaInner = useRef(null)
  // Image drifts and zooms from 1.3× down to 1× as it crosses the screen.
  useParallax(mediaInner, { speed: 0.06, scale: [1.3, 1.02] })

  return (
    <section id="about" className="relative py-24 sm:py-36">
      <div className="container-x">
        <Reveal>
          <span className="eyebrow text-aqua">About OceanHire</span>
        </Reveal>

        <ScrollWords
          className="serif mt-8 max-w-[22ch] text-[clamp(2.4rem,7vw,6.4rem)] leading-[1.02] sm:max-w-[20ch]"
          text="We crew the world’s fleets with people who love the sea."
        />

        <div className="mt-16 grid items-start gap-12 lg:mt-28 lg:grid-cols-12 lg:gap-16">
          <div className="space-y-6 lg:col-span-5 lg:pt-20">
            <Reveal>
              <p className="text-lg leading-relaxed text-foam/75">
                OceanHire is a specialist maritime recruitment agency built by former crew and shoreside professionals. Our mission is
                simple: to open the gangway to rewarding careers at sea for talented people, and to give cruise lines and shipowners the
                reliable, well-prepared crew they depend on.
              </p>
            </Reveal>
            <Reveal delay={120}>
              <p className="text-lg leading-relaxed text-foam/75">
                We believe a great voyage starts with a great hire — so we treat every candidate as a colleague we&apos;d be proud to sail
                alongside.
              </p>
            </Reveal>
          </div>

          {/* Zoom-parallax media */}
          <div className="lg:col-span-6 lg:col-start-7">
            <div className="overflow-hidden rounded-3xl">
              <div ref={mediaInner} className="gpu">
                <MediaSlot id="about" rounded="rounded-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Pillars */}
        <ul className="mt-24 grid gap-10 border-t border-foam/15 pt-10 md:grid-cols-3 md:gap-8">
          {PILLARS.map((p, i) => (
            <Reveal as="li" key={p.title} delay={i * 110}>
              <span className="num serif-i text-xl text-aqua">0{i + 1}</span>
              <h3 className="display mt-4 text-[1.35rem]">{p.title}</h3>
              <p className="mt-3 max-w-xs leading-relaxed text-foam/65">{p.text}</p>
            </Reveal>
          ))}
        </ul>

        {/* Stats */}
        <dl className="mt-24 grid grid-cols-1 gap-10 sm:grid-cols-3">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 100} className="flex flex-col border-l border-foam/20 pl-6">
              <dt className="eyebrow order-2 mt-3 text-foam/60">{s.label}</dt>
              <dd className="condensed order-1 text-[clamp(4.5rem,11vw,9rem)] text-foam">
                <CountUp to={s.value} suffix={s.suffix} />
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  )
}
