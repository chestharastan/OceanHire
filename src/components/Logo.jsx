import { Anchor } from 'lucide-react'

// Colour comes from the parent (currentColor), so the nav can flip it between
// the light dawn hero and the dark sea below.
export default function Logo({ className = '', onClick }) {
  return (
    <a href="#home" onClick={onClick} aria-label="OceanHire — home" className={`group inline-flex items-center gap-3 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-cur transition-transform duration-500 group-hover:rotate-[360deg]">
        <Anchor className="h-[18px] w-[18px]" strokeWidth={1.8} />
      </span>
      <span className="display text-[0.95rem] tracking-[0.06em]">
        Ocean<span className="opacity-60">Hire</span>
      </span>
    </a>
  )
}
