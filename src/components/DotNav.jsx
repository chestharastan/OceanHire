import { useEffect, useState } from 'react'
import { PAGER } from '../config/site.js'
import { scrollToId } from '../lib/scroll.js'

// Vertical dot pager on the right edge (Curvy Beagle). Tracks which section
// currently owns the middle of the viewport with one IntersectionObserver.
export default function DotNav() {
  const [active, setActive] = useState('home')

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    PAGER.forEach((p) => {
      const el = document.getElementById(p.id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  const light = active === 'home'
  return (
    <nav aria-label="Sections" className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 xl:block">
      <ul className="flex flex-col items-end gap-3.5">
        {PAGER.map((p) => {
          const on = active === p.id
          return (
            <li key={p.id}>
              <a
                href={`#${p.id}`}
                onClick={(e) => { e.preventDefault(); scrollToId(p.id) }}
                aria-label={p.label}
                aria-current={on ? 'true' : undefined}
                className="group flex items-center gap-3"
              >
                <span className={`eyebrow translate-x-2 text-[0.62rem] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 ${light ? 'text-ink' : 'text-foam'}`}>
                  {p.label}
                </span>
                <span
                  className={`block rounded-full transition-all duration-300 ${on ? 'h-2.5 w-2.5' : 'h-1.5 w-1.5 opacity-50'} ${
                    light ? 'bg-ink' : on ? 'bg-aqua' : 'bg-foam'
                  }`}
                />
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
