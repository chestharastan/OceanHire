import { ArrowUp, Linkedin, Instagram, Facebook } from 'lucide-react'
import Logo from './Logo.jsx'
import { scrollToId, scrollToTop } from '../lib/scroll.js'
import { photoCredits } from '../config/media.js'

const cols = [
  {
    title: 'Company',
    links: [
      { label: 'About', id: 'about' },
      { label: 'Departments', id: 'departments' },
      { label: 'Process', id: 'voyage' },
      { label: 'Contact', id: 'contact' },
    ],
  },
  {
    title: 'Candidates',
    links: [
      { label: 'Apply Now', id: 'apply' },
      { label: 'Life at Sea', id: 'life' },
      { label: 'Set sail', id: 'sail' },
      { label: 'FAQ', id: 'faq' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'MLC Compliance', href: '#' },
      { label: 'Cookie Policy', href: '#' },
    ],
  },
]

const socials = [
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Facebook, href: '#', label: 'Facebook' },
]

export default function Footer() {
  const credits = photoCredits()
  return (
    <footer className="relative overflow-hidden border-t border-foam/10 bg-abyss/40 backdrop-blur-[2px]">
      <div className="container-x grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-5 text-sm leading-relaxed text-foam/55">
            Specialist maritime and cruise recruitment. Connecting great people with great fleets, fairly and transparently.
          </p>
          <div className="mt-6 flex gap-3">
            {socials.map((s) => (
              <a key={s.label} href={s.href} aria-label={s.label} className="grid h-10 w-10 place-items-center rounded-full border border-foam/20 transition-colors hover:bg-foam hover:text-ink">
                <s.icon className="h-[17px] w-[17px]" />
              </a>
            ))}
          </div>
        </div>

        {cols.map((col) => (
          <div key={col.title}>
            <h4 className="eyebrow text-foam/45">{col.title}</h4>
            <ul className="mt-5 space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.id ? `#${l.id}` : l.href}
                    onClick={l.id ? (e) => { e.preventDefault(); scrollToId(l.id) } : undefined}
                    className="text-sm text-foam/75 transition-colors hover:text-aqua"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Photography credits — generated from config/media.js, so they track whatever photos are live */}
      {credits.length > 0 && (
        <p className="container-x pb-8 text-xs leading-relaxed text-foam/35">
          Photography via{' '}
          <a href="https://unsplash.com" className="underline decoration-foam/20 underline-offset-2 hover:text-foam/70">
            Unsplash
          </a>
          :{' '}
          {credits.map((c, i) => (
            <span key={c.name}>
              <a href={c.url} className="underline decoration-foam/20 underline-offset-2 hover:text-foam/70">
                {c.name}
              </a>
              {i < credits.length - 1 ? ', ' : '.'}
            </span>
          ))}{' '}
          Images are illustrative.
        </p>
      )}

      {/* Giant wordmark, clipped at the bottom edge (Noomo-style footer) */}
      <div aria-hidden="true" className="pointer-events-none -mb-[2.2vw] select-none whitespace-nowrap text-center">
        <span className="display block text-[12.1vw] leading-[0.8] text-foam/[0.07]">OceanHire</span>
      </div>

      <div className="border-t border-foam/10">
        <div className="container-x flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="text-sm text-foam/45">© {new Date().getFullYear()} OceanHire. All rights reserved.</p>
          <button type="button" onClick={scrollToTop} className="eyebrow group flex items-center gap-3 text-foam/60 transition-colors hover:text-foam">
            Back to surface
            <span className="grid h-9 w-9 place-items-center rounded-full border border-foam/25 transition-colors group-hover:bg-foam group-hover:text-ink">
              <ArrowUp className="h-4 w-4" />
            </span>
          </button>
        </div>
      </div>
    </footer>
  )
}
