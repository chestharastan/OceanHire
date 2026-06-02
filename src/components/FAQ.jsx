import { useState } from 'react'
import { Plus, Minus, HelpCircle } from 'lucide-react'
import Reveal from './Reveal.jsx'

const faqs = [
  {
    q: 'Do I need previous maritime experience to apply?',
    a: 'Not always. Many hospitality, entertainment and administration roles welcome talented people from shoreside industries. Deck, engine and medical positions usually require relevant certification and sea time, which we will guide you through.',
  },
  {
    q: 'Does OceanHire charge candidates a recruitment fee?',
    a: 'No. In line with the Maritime Labour Convention, we never charge seafarers a fee to be placed. Our services to candidates are completely free — employers cover the cost of recruitment.',
  },
  {
    q: 'What documents and certifications will I need?',
    a: 'At minimum an up-to-date CV and a valid passport. Depending on the role you may also need STCW basic safety training, a seaman’s book, a medical (ENG1 or equivalent) and trade-specific certificates. We will give you a personalised checklist after your application.',
  },
  {
    q: 'How long are contracts and what is the pay like?',
    a: 'Contracts typically run from 4 to 9 months on board followed by paid or unpaid leave, depending on the company and department. Salaries vary by role, rank and fleet; your coordinator will share exact figures for any position you are matched with.',
  },
  {
    q: 'How long does the hiring process take?',
    a: 'After you apply, expect an initial response within 3–5 business days. From interview to joining a vessel usually takes 4–10 weeks, mostly driven by document processing, medicals and visa timelines.',
  },
]

function Item({ faq, open, onToggle }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-colors hover:border-ocean/30">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-base font-semibold text-navy-900">{faq.q}</span>
        <span className={`flex h-8 w-8 flex-none items-center justify-center rounded-full transition-colors ${open ? 'bg-ocean text-white' : 'bg-slate-100 text-ocean'}`}>
          {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </span>
      </button>
      <div className={`grid transition-all duration-300 ease-in-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <p className="px-6 pb-5 text-sm leading-relaxed text-slate-600">{faq.a}</p>
        </div>
      </div>
    </div>
  )
}

export default function FAQ() {
  const [open, setOpen] = useState(0)

  return (
    <section id="faq" className="bg-slate-50 py-20 sm:py-28">
      <div className="container-x grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-ocean">
            <HelpCircle className="h-4 w-4" /> FAQ
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
            Questions, answered
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Everything you need to know before setting sail with OceanHire. Still unsure?
            Reach out via the contact form below.
          </p>
        </Reveal>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <Reveal key={faq.q} delay={i * 80}>
              <Item faq={faq} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
