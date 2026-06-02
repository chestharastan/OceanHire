import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import Logo from './Logo.jsx'

const links = [
  { href: '#about', label: 'About' },
  { href: '#departments', label: 'Departments' },
  { href: '#apply', label: 'Apply' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contact', label: 'Contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 shadow-soft backdrop-blur-md'
          : 'bg-transparent'
      }`}
    >
      <nav className="container-x flex h-16 items-center justify-between sm:h-20">
        <Logo light={!scrolled} />

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors hover:text-gold ${
                scrolled ? 'text-navy-800' : 'text-white/90'
              }`}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#apply"
            className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-navy-900 shadow-sm transition-all hover:bg-gold-400 hover:shadow-md"
          >
            Apply Now
          </a>
        </div>

        <button
          className={`md:hidden ${scrolled ? 'text-navy-900' : 'text-white'}`}
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden">
          <div className="container-x flex flex-col gap-1 border-t border-slate-200 bg-white pb-4 pt-2 shadow-soft">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-base font-medium text-navy-800 hover:bg-slate-100"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#apply"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-gold px-5 py-3 text-center text-base font-semibold text-navy-900"
            >
              Apply Now
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
