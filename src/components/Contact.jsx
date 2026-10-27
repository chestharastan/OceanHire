import { useState } from 'react'
import { Mail, MapPin, Phone, Send, CheckCircle2 } from 'lucide-react'
import Reveal from './Reveal.jsx'
import Split from './Split.jsx'
import { CONTACT } from '../config/site.js'

const details = [
  { icon: Mail, label: 'Email', value: CONTACT.email, href: `mailto:${CONTACT.email}` },
  { icon: Phone, label: 'Phone', value: CONTACT.phone, href: CONTACT.phoneHref },
  { icon: MapPin, label: 'Office', value: CONTACT.office, href: null },
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
    <section id="contact" className="relative py-24 sm:py-32">
      <div className="container-x grid gap-14 lg:grid-cols-2 lg:gap-24">
        <div>
          <Reveal>
            <span className="eyebrow text-aqua">Get in touch</span>
          </Reveal>
          <Split as="h2" className="display mt-5 block text-[clamp(2.2rem,5.4vw,5rem)]" text={[{ t: 'Let’s' }, { t: 'chart' }, { t: 'your' }, { t: 'course', c: 'serif-i' }]} />
          <Reveal delay={150}>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-foam/70">
              Have a question about a role, your documents or the joining process? Send us a message and our crewing team will get back to you.
            </p>
          </Reveal>

          <ul className="mt-12 space-y-6">
            {details.map((d, i) => {
              const inner = (
                <span className="flex items-center gap-5">
                  <span className="grid h-12 w-12 flex-none place-items-center rounded-full border border-foam/20 text-aqua transition-colors group-hover:bg-foam group-hover:text-ink">
                    <d.icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="eyebrow block text-foam/50">{d.label}</span>
                    <span className="mt-1 block text-lg">{d.value}</span>
                  </span>
                </span>
              )
              return (
                <Reveal as="li" key={d.label} delay={i * 90}>
                  {d.href ? (
                    <a href={d.href} className="group block">
                      {inner}
                    </a>
                  ) : (
                    <div className="group">{inner}</div>
                  )}
                </Reveal>
              )
            })}
          </ul>
        </div>

        {/* Contact form */}
        <Reveal delay={120} className="glass rounded-3xl p-6 sm:p-10">
          {sent ? (
            <div className="flex h-full min-h-[22rem] flex-col items-center justify-center py-10 text-center" role="status" aria-live="polite">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-aqua/15 text-aqua">
                <CheckCircle2 className="h-8 w-8" />
              </span>
              <h3 className="serif mt-6 text-4xl">Message sent</h3>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-foam/65">Thanks for reaching out — we&apos;ll reply to {form.email || 'your email'} shortly.</p>
              <button
                onClick={() => { setSent(false); setForm({ name: '', email: '', message: '' }) }}
                className="eyebrow mt-8 border-b border-foam/40 pb-1 hover:border-foam"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-6" aria-label="Contact form">
              <div>
                <label htmlFor="c-name" className="field-label">Name</label>
                <input id="c-name" name="name" required value={form.name} onChange={update} placeholder="Your name" autoComplete="name" className="field" />
              </div>
              <div>
                <label htmlFor="c-email" className="field-label">Email</label>
                <input id="c-email" name="email" type="email" required value={form.email} onChange={update} placeholder="you@email.com" autoComplete="email" className="field" />
              </div>
              <div>
                <label htmlFor="c-message" className="field-label">Message</label>
                <textarea id="c-message" name="message" required rows={5} value={form.message} onChange={update} placeholder="How can we help?" className="field resize-none" />
              </div>
              <button type="submit" className="btn btn-aqua w-full">
                <Send className="h-4 w-4" /> Send message
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  )
}
