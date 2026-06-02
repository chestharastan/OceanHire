import { Anchor } from 'lucide-react'

export default function Logo({ light = false }) {
  return (
    <a href="#home" className="group flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-ocean to-navy-700 ring-1 ring-gold/40 transition-transform group-hover:scale-105">
        <Anchor className="h-5 w-5 text-gold" strokeWidth={2.2} />
      </span>
      <span className={`text-lg font-extrabold tracking-tight ${light ? 'text-white' : 'text-navy-900'}`}>
        Ocean<span className="text-gold">Hire</span>
      </span>
    </a>
  )
}
