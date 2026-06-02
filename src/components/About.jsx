import { Compass, ShieldCheck, LifeBuoy, Waves } from 'lucide-react'
import Reveal from './Reveal.jsx'
import Parallax from './Parallax.jsx'

const pillars = [
  {
    icon: Compass,
    title: 'Guided every step',
    text: 'From application to embarkation, a dedicated coordinator supports your documents, visas and joining details.',
  },
  {
    icon: ShieldCheck,
    title: 'Fair & transparent',
    text: 'No hidden recruitment fees. Clear contracts that follow Maritime Labour Convention standards.',
  },
  {
    icon: LifeBuoy,
    title: 'Right fit, first time',
    text: 'We match your skills, certifications and ambitions to roles where you will genuinely thrive.',
  },
]

export default function About() {
  return (
    <section id="about" className="relative overflow-hidden bg-white py-20 sm:py-28">
      {/* Soft parallax accent drifting behind the content */}
      <Parallax speed={0.4} className="pointer-events-none absolute -right-20 top-10 -z-10">
        <div className="h-72 w-72 rounded-full bg-ocean/5 blur-3xl" />
      </Parallax>

      <div className="container-x grid items-start gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-ocean">
            <Waves className="h-4 w-4" /> About OceanHire
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
            We crew the world&apos;s fleets with people who love the sea
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-slate-600">
            OceanHire is a specialist maritime recruitment agency built by former crew
            and shoreside professionals. Our mission is simple: to open the gangway to
            rewarding careers at sea for talented people, and to give cruise lines and
            shipowners the reliable, well-prepared crew they depend on.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            We believe a great voyage starts with a great hire — so we treat every
            candidate as a colleague we&apos;d be proud to sail alongside.
          </p>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
          {pillars.map((p, i) => (
            <Reveal
              key={p.title}
              delay={i * 120}
              className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-5 shadow-card transition-transform hover:-translate-y-0.5"
            >
              <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-ocean/10 text-ocean">
                <p.icon className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-base font-bold text-navy-900">{p.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
