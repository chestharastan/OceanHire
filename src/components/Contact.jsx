import { useState } from 'react'
import { Mail, MapPin, Phone, Send, CheckCircle2 } from 'lucide-react'
import Wave from './Wave.jsx'
import Reveal from './Reveal.jsx'
import Parallax from './Parallax.jsx'

const details = [
  { icon: Mail, label: 'Email', value: 'crew@oceanhire.com', href: 'mailto:crew@oceanhire.com' },
  { icon: Phone, label: 'Phone', value: '+1 (305) 555-0142', href: 'tel:+13055550142' },
  { icon: MapPin, label: 'Office', value: 'Port Boulevard, Miami, FL', href: null },
]

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  const submit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <section id="contact" className="relative isolate overflow-hidden bg-navy-900">
      <div className="rotate-180">
        <Wave className="text-slate-50" />
      </div>

      <Parallax speed={0.45} className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-20 h-80 w-80 rounded-full bg-ocean/30 blur-3xl animate-float-slow" />
      </Parallax>
      <Parallax speed={0.65} className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-gold/10 blur-3xl animate-float" />
      </Parallax>

      <div className="container-x grid gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <span className="text-sm font-semibold uppercase tracking-wider text-gold">
            Get in touch
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Let&apos;s chart your course
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-300">
            Have a question about a role, your documents or the joining process? Send us
            a message and our crewing team will get back to you.
          </p>

          <div className="mt-10 space-y-5">
            {details.map((d) => {
              const content = (
                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-white/10 text-gold">
                    <d.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-400">{d.label}</p>
                    <p className="text-base font-medium text-white">{d.value}</p>
                  </div>
                </div>
              )
              return d.href ? (
                <a key={d.label} href={d.href} className="block transition-opacity hover:opacity-80">{content}</a>
              ) : (
                <div key={d.label}>{content}</div>
              )
            })}
          </div>
        </Reveal>

        {/* Contact form */}
        <Reveal delay={120} className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur-md sm:p-8">
          {sent ? (
            <div className="flex h-full flex-col items-center justify-center py-10 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                <CheckCircle2 className="h-8 w-8" />
              </span>
              <h3 className="mt-5 text-xl font-bold text-white">Message sent</h3>
              <p className="mt-2 max-w-xs text-sm text-slate-300">
                Thanks for reaching out — we&apos;ll reply to {form.email || 'your email'} shortly.
              </p>
              <button
                onClick={() => { setSent(false); setForm({ name: '', email: '', message: '' }) }}
                className="mt-6 text-sm font-semibold text-gold hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label htmlFor="c-name" className="mb-1.5 block text-sm font-medium text-slate-200">Name</label>
                <input id="c-name" name="name" required value={form.name} onChange={update}
                  placeholder="Your name"
                  className="w-full rounded-lg border border-white/15 bg-white/10 px-3.5 py-2.5 text-[15px] text-white placeholder:text-slate-400 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30" />
              </div>
              <div>
                <label htmlFor="c-email" className="mb-1.5 block text-sm font-medium text-slate-200">Email</label>
                <input id="c-email" name="email" type="email" required value={form.email} onChange={update}
                  placeholder="you@email.com"
                  className="w-full rounded-lg border border-white/15 bg-white/10 px-3.5 py-2.5 text-[15px] text-white placeholder:text-slate-400 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30" />
              </div>
              <div>
                <label htmlFor="c-message" className="mb-1.5 block text-sm font-medium text-slate-200">Message</label>
                <textarea id="c-message" name="message" required rows={4} value={form.message} onChange={update}
                  placeholder="How can we help?"
                  className="w-full resize-none rounded-lg border border-white/15 bg-white/10 px-3.5 py-2.5 text-[15px] text-white placeholder:text-slate-400 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30" />
              </div>
              <button type="submit"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-base font-bold text-navy-900 transition-colors hover:bg-gold-400">
                <Send className="h-5 w-5 transition-transform group-hover:translate-x-0.5" /> Send Message
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  )
}
