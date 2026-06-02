import { ArrowRight, Ship, Globe2, BadgeCheck, Anchor } from 'lucide-react'
import Wave from './Wave.jsx'
import Parallax from './Parallax.jsx'

const stats = [
  { value: '40+', label: 'Cruise lines & fleets' },
  { value: '6', label: 'Onboard departments' },
  { value: '12k+', label: 'Crew placed at sea' },
]

// A handful of rising bubbles with varied size / position / timing.
const bubbles = [
  { left: '8%', size: 14, delay: '0s', dur: '13s' },
  { left: '20%', size: 8, delay: '4s', dur: '17s' },
  { left: '34%', size: 20, delay: '2s', dur: '15s' },
  { left: '52%', size: 10, delay: '6s', dur: '19s' },
  { left: '67%', size: 16, delay: '1s', dur: '14s' },
  { left: '81%', size: 9, delay: '5s', dur: '18s' },
  { left: '92%', size: 13, delay: '3s', dur: '16s' },
]

export default function Hero() {
  return (
    <section id="home" className="relative isolate overflow-hidden bg-navy-900">
      {/* Background gradient + parallax glows ------------------------------- */}
      <div className="absolute inset-0 -z-30 bg-gradient-to-b from-navy-900 via-navy-800 to-ocean-600/40" />

      <Parallax speed={0.35} className="absolute inset-0 -z-20">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-ocean/30 blur-3xl animate-float-slow" />
      </Parallax>
      <Parallax speed={0.55} className="absolute inset-0 -z-20">
        <div className="absolute left-1/4 top-1/3 h-72 w-72 rounded-full bg-gold/10 blur-3xl animate-float" />
      </Parallax>

      {/* Faint horizon grid — drifts slowly as you scroll */}
      <Parallax speed={0.15} className="absolute inset-0 -z-20">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(transparent 95%, #ffffff 95%), linear-gradient(90deg, transparent 95%, #ffffff 95%)',
            backgroundSize: '60px 60px',
          }}
        />
      </Parallax>

      {/* Drifting anchor watermark deep in the background */}
      <Parallax speed={0.7} className="pointer-events-none absolute -z-20 right-[8%] top-24 hidden lg:block">
        <Anchor className="h-40 w-40 text-white/[0.04] animate-float-slow" strokeWidth={1.2} />
      </Parallax>

      {/* Rising bubbles */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        {bubbles.map((b, i) => (
          <span
            key={i}
            className="bubble"
            style={{
              left: b.left,
              width: b.size,
              height: b.size,
              animationDelay: b.delay,
              animationDuration: b.dur,
            }}
          />
        ))}
      </div>

      <div className="container-x flex flex-col items-start gap-10 pb-32 pt-32 sm:pt-40 lg:flex-row lg:items-center lg:gap-16 lg:pb-40">
        {/* Foreground copy — drifts up slightly faster than the background */}
        <Parallax speed={-0.06} className="max-w-2xl">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-gold backdrop-blur">
              <Ship className="h-4 w-4" />
              Maritime & Cruise Recruitment
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Your Career at Sea
              <span className="block bg-gradient-to-r from-gold via-gold-400 to-gold bg-clip-text text-transparent">
                Starts Here
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
              OceanHire connects skilled professionals with leading cruise lines and
              shipping companies worldwide. From deck to dining, we help you find a
              role that takes your career across the horizon.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#apply"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-gold px-7 py-3.5 text-base font-semibold text-navy-900 shadow-lg shadow-gold/20 transition-all hover:bg-gold-400 hover:shadow-gold/30"
              >
                Apply Now
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#departments"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white/10"
              >
                Explore Departments
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck className="h-4 w-4 text-gold" /> MLC-compliant placements
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Globe2 className="h-4 w-4 text-gold" /> 60+ nationalities onboard
              </span>
            </div>
          </div>
        </Parallax>

        {/* Stat panel — floats with a gentler parallax for depth */}
        <Parallax speed={0.12} className="w-full max-w-sm lg:ml-auto">
          <div
            className="animate-fade-up rounded-2xl border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur-md sm:p-8"
            style={{ animationDelay: '120ms' }}
          >
            <p className="text-sm font-medium uppercase tracking-wider text-gold">
              Trusted by crew worldwide
            </p>
            <div className="mt-6 space-y-6">
              {stats.map((s) => (
                <div key={s.label} className="flex items-baseline gap-4 border-b border-white/10 pb-5 last:border-0 last:pb-0">
                  <span className="text-4xl font-extrabold text-white">{s.value}</span>
                  <span className="text-sm text-slate-300">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Parallax>
      </div>

      {/* Layered, drifting wave divider for a sense of motion at the shoreline */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 sm:h-20">
        <div className="wave-layer wave-drift-slow opacity-30">
          <Wave className="text-white" />
        </div>
        <div className="wave-layer wave-drift-fast opacity-50">
          <Wave className="text-slate-100" />
        </div>
        <div className="wave-layer">
          <Wave className="text-white" />
        </div>
      </div>
    </section>
  )
}
