import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import Logo from './Logo.jsx'
import { NAV } from '../config/site.js'
import { onFrame, scrollToId, scrollToTop, setScrollLocked } from '../lib/scroll.js'

// Minimal, Noomo-style bar: logo left, small caps links right. It
//  • flips ink ↔ foam depending on whether it sits over the light dawn hero or the dark sea,
//  • slides away while scrolling down and returns on scroll up (more room on phones),
//  • becomes a full-screen menu on small screens.
export default function Navbar() {
  const [tone, setTone] = useState('ink') // 'ink' over the pale sky, 'foam' once underwater
  const [hidden, setHidden] = useState(false)
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)
  const last = useRef(0)

  useEffect(() => {
    // Mirror the state in closure variables so React is only poked on real changes.
    let tn = 'ink'
    let sd = false
    let hd = false
    return onFrame((s) => {
      const nextTone = s.heroP < 0.22 ? 'ink' : 'foam'
      if (nextTone !== tn) setTone((tn = nextTone))
      const nextSolid = s.y > 40
      if (nextSolid !== sd) setSolid((sd = nextSolid))
      const dy = s.y - last.current
      if (Math.abs(dy) > 6) {
        const hide = dy > 0 && s.y > 200
        if (hide !== hd) setHidden((hd = hide))
        last.current = s.y
      }
    })
  }, [])

  // Lock page scroll only while the full-screen menu is open (never on mount,
  // so we can't accidentally unlock the intro's scroll lock).
  useEffect(() => {
    if (!open) return
    setScrollLocked(true)
    return () => setScrollLocked(false)
  }, [open])

  const go = (id) => (e) => {
    e.preventDefault()
    setOpen(false)
    // Wait a beat so the body scroll-lock is released before we scroll.
    setTimeout(() => scrollToId(id), open ? 60 : 0)
  }

  const ink = tone === 'ink' && !open
  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color] duration-500 ease-out ${
          hidden && !open ? '-translate-y-full' : 'translate-y-0'
        } ${solid && !open ? 'bg-abyss/55 backdrop-blur-md' : ''} ${ink ? 'text-ink' : 'text-foam'}`}
      >
        <nav className="container-x flex h-16 items-center justify-between sm:h-20" aria-label="Main">
          <Logo onClick={(e) => { e.preventDefault(); setOpen(false); scrollToTop() }} />

          <div className="hidden items-center gap-9 lg:flex">
            {NAV.filter((n) => n.id !== 'apply').map((l) => (
              <a key={l.id} href={`#${l.id}`} onClick={go(l.id)} className="eyebrow relative py-2 opacity-80 transition-opacity hover:opacity-100">
                {l.label}
              </a>
            ))}
            <a
              href="#apply"
              onClick={go('apply')}
              className={`eyebrow inline-flex items-center gap-2 rounded-full border px-5 py-2.5 transition-colors ${
                ink ? 'border-ink/40 hover:bg-ink hover:text-foam' : 'border-foam/40 hover:bg-foam hover:text-ink'
              }`}
            >
              Apply <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="eyebrow flex items-center gap-3 py-2 lg:hidden"
          >
            {open ? 'Close' : 'Menu'}
            <span className="relative block h-2.5 w-6">
              <span className={`absolute left-0 h-px w-full bg-current transition-transform duration-300 ${open ? 'top-1/2 rotate-45' : 'top-0'}`} />
              <span className={`absolute left-0 h-px w-full bg-current transition-transform duration-300 ${open ? 'top-1/2 -rotate-45' : 'bottom-0'}`} />
            </span>
          </button>
        </nav>
      </header>

      {/* Full-screen mobile menu */}
      <div
        id="mobile-menu"
        aria-hidden={!open}
        className={`fixed inset-0 z-40 flex flex-col justify-center bg-abyss px-[var(--pad)] text-foam transition-[clip-path] duration-700 ease-out lg:hidden ${
          open ? '[clip-path:inset(0_0_0_0)]' : '[clip-path:inset(0_0_100%_0)] pointer-events-none'
        }`}
      >
        <ul className="space-y-2">
          {NAV.map((l, i) => (
            <li key={l.id} className="overflow-hidden">
              <a
                href={`#${l.id}`}
                onClick={go(l.id)}
                tabIndex={open ? 0 : -1}
                className="display block py-1 text-[clamp(1.6rem,8vw,3.4rem)] whitespace-nowrap transition-transform duration-700 ease-out"
                style={{ transform: open ? 'none' : 'translateY(110%)', transitionDelay: `${open ? 150 + i * 60 : 0}ms` }}
              >
                <span className="num serif-i mr-3 text-base text-aqua">0{i + 1}</span>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="eyebrow absolute bottom-8 left-[var(--pad)] text-foam/40">Maritime &amp; cruise recruitment</p>
      </div>
    </>
  )
}
