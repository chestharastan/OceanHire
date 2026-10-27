import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import Reveal from './Reveal.jsx'
import Split from './Split.jsx'
import { FAQS } from '../config/site.js'

// Accordion (Manus-style FAQ). The answer panel animates with grid-rows 0fr → 1fr,
// which transitions height without measuring anything in JS.
function Item({ i, faq, open, onToggle }) {
  const id = `faq-${i}`
  return (
    <div className="border-b border-foam/12">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={id}
          className="group flex w-full items-start gap-5 py-6 text-left sm:gap-8 sm:py-8"
        >
          <span className="num serif-i pt-1 text-lg text-aqua">0{i + 1}</span>
          <span className={`serif flex-1 text-[clamp(1.5rem,2.8vw,2.3rem)] leading-[1.1] transition-opacity ${open ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
            {faq.q}
          </span>
          <span className={`mt-1 grid h-9 w-9 flex-none place-items-center rounded-full border transition-colors ${open ? 'border-foam bg-foam text-ink' : 'border-foam/25'}`}>
            {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </span>
        </button>
      </h3>
      <div id={id} role="region" className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <p className="max-w-2xl pb-8 pl-[2.9rem] pr-14 leading-relaxed text-foam/70 sm:pl-[3.9rem]">{faq.a}</p>
        </div>
      </div>
    </div>
  )
}

export default function FAQ() {
  const [open, setOpen] = useState(0)

  return (
    <section id="faq" className="relative py-24 sm:py-32">
      <div className="container-x grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <span className="eyebrow text-aqua">FAQ</span>
          </Reveal>
          <Split as="h2" className="display mt-5 block text-[clamp(2.2rem,5vw,4.4rem)]" text={[{ t: 'Questions,' }, { t: 'answered', c: 'serif-i' }]} />
          <Reveal delay={150}>
            <p className="mt-6 max-w-sm text-lg leading-relaxed text-foam/70">
              Everything you need to know before setting sail with OceanHire. Still unsure? Reach out via the contact form below.
            </p>
          </Reveal>
        </div>

        <Reveal delay={100}>
          <div className="border-t border-foam/12">
            {FAQS.map((faq, i) => (
              <Item key={faq.q} i={i} faq={faq} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
