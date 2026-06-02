import { Ship, Cog, UtensilsCrossed, Music4, Stethoscope, ClipboardList, ArrowUpRight } from 'lucide-react'
import Reveal from './Reveal.jsx'

const departments = [
  {
    icon: Ship,
    name: 'Deck',
    roles: 'Captains, Officers, Bosuns, Able Seamen',
    text: 'Navigation, safety and seamanship — the backbone of every vessel.',
  },
  {
    icon: Cog,
    name: 'Engine',
    roles: 'Chief Engineers, ETOs, Motormen, Fitters',
    text: 'Keep propulsion, power and systems running across every voyage.',
  },
  {
    icon: UtensilsCrossed,
    name: 'Hospitality',
    roles: 'Chefs, Waiters, Bartenders, Housekeeping',
    text: 'Deliver world-class dining and guest experiences at sea.',
  },
  {
    icon: Music4,
    name: 'Entertainment',
    roles: 'Performers, DJs, Hosts, Technicians',
    text: 'Bring energy to the stage, deck parties and guest activities.',
  },
  {
    icon: Stethoscope,
    name: 'Medical',
    roles: 'Doctors, Nurses, Paramedics',
    text: 'Provide onboard care and emergency response for crew and guests.',
  },
  {
    icon: ClipboardList,
    name: 'Administration',
    roles: 'Pursers, HR, Crew Office, Finance',
    text: 'Run the shoreside-at-sea operations that keep everything in order.',
  },
]

export default function Departments() {
  return (
    <section id="departments" className="bg-slate-50 py-20 sm:py-28">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-ocean">
            Onboard Departments
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
            Find your place in the crew
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Whatever your trade or talent, there&apos;s a role for you on board. Explore
            the six departments we recruit for across cruise and merchant fleets.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((d, i) => (
            <Reveal
              as="a"
              key={d.name}
              href="#apply"
              delay={(i % 3) * 110}
              className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-card transition-all hover:-translate-y-1 hover:border-ocean/30 hover:shadow-soft"
            >
              <ArrowUpRight className="absolute right-5 top-5 h-5 w-5 text-slate-300 transition-colors group-hover:text-gold" />
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-ocean to-navy-700 text-gold shadow-sm transition-transform group-hover:scale-105">
                <d.icon className="h-7 w-7" strokeWidth={1.9} />
              </span>
              <h3 className="mt-5 text-xl font-bold text-navy-900">{d.name}</h3>
              <p className="mt-1 text-sm font-medium text-ocean">{d.roles}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{d.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
