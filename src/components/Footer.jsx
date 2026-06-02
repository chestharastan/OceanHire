import { Anchor, Linkedin, Instagram, Facebook } from 'lucide-react'

const cols = [
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#about' },
      { label: 'Departments', href: '#departments' },
      { label: 'FAQ', href: '#faq' },
      { label: 'Contact', href: '#contact' },
    ],
  },
  {
    title: 'Candidates',
    links: [
      { label: 'Apply Now', href: '#apply' },
      { label: 'Document Checklist', href: '#apply' },
      { label: 'Life at Sea', href: '#about' },
      { label: 'FAQ', href: '#faq' },
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
  return (
    <footer className="border-t border-white/10 bg-navy-900 text-slate-300">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <a href="#home" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-ocean to-navy-700 ring-1 ring-gold/40">
              <Anchor className="h-5 w-5 text-gold" strokeWidth={2.2} />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-white">
              Ocean<span className="text-gold">Hire</span>
            </span>
          </a>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            Specialist maritime and cruise recruitment. Connecting great people with
            great fleets, fairly and transparently.
          </p>
          <div className="mt-5 flex gap-3">
            {socials.map((s) => (
              <a key={s.label} href={s.href} aria-label={s.label}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-300 transition-colors hover:bg-gold hover:text-navy-900">
                <s.icon className="h-[18px] w-[18px]" />
              </a>
            ))}
          </div>
        </div>

        {cols.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">{col.title}</h4>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm text-slate-400 transition-colors hover:text-gold">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 sm:flex-row">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} OceanHire. All rights reserved.
          </p>
          <p className="text-sm text-slate-500">Charting careers across every ocean.</p>
        </div>
      </div>
    </footer>
  )
}
