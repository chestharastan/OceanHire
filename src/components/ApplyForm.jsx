import { useEffect, useMemo, useState } from 'react'
import { User, Briefcase, FileText, Sparkles, CheckCircle2, Send, Loader2 } from 'lucide-react'
import Reveal from './Reveal.jsx'
import Split from './Split.jsx'
import { DEPARTMENTS, ENGLISH_LEVELS, nextIntake } from '../config/site.js'
import { bus, useCountdown } from '../lib/hooks.js'
import { scrollToId } from '../lib/scroll.js'

const departments = DEPARTMENTS.map((d) => d.name)

// Small presentational helpers ------------------------------------------------

function SectionHeading({ icon: Icon, step, title, desc }) {
  return (
    <div className="mb-7 flex items-start gap-4">
      <span className="grid h-11 w-11 flex-none place-items-center rounded-full border border-foam/25 text-aqua">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <div>
        <p className="eyebrow text-aqua">{step}</p>
        <h3 className="display mt-1.5 text-[1.25rem]">{title}</h3>
        {desc && <p className="mt-1.5 text-sm text-foam/55">{desc}</p>}
      </div>
    </div>
  )
}

function Field({ label, name, type = 'text', required, placeholder, value, onChange, children, full, autoComplete }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label htmlFor={name} className="field-label">
        {label} {required && <span className="text-aqua">*</span>}
      </label>
      {children ?? (
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className="field"
        />
      )}
    </div>
  )
}

// Yes/No radio pill group
function YesNo({ label, name, value, onChange, required }) {
  return (
    <div>
      <span className="field-label">
        {label} {required && <span className="text-aqua">*</span>}
      </span>
      <div className="flex gap-2" role="radiogroup" aria-label={label}>
        {['Yes', 'No'].map((opt) => {
          const active = value === opt
          return (
            <label
              key={opt}
              className={`flex flex-1 cursor-pointer items-center justify-center rounded-xl border px-4 py-3 text-sm font-medium transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-aqua ${
                active ? 'border-foam bg-foam text-ink' : 'border-white/15 bg-white/[0.05] text-foam hover:border-white/40'
              }`}
            >
              <input type="radio" name={name} value={opt} checked={active} onChange={onChange} required={required} className="sr-only" />
              {opt}
            </label>
          )
        })}
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------

const initialState = {
  fullName: '', dob: '', nationality: '', email: '', phone: '', whatsapp: '', location: '',
  position: '', department: '', experience: '', maritimeExp: '', cruiseExp: '',
  english: '', languages: '',
  availability: '', internationalExp: '', motivation: '',
}
const REQUIRED = [
  'fullName', 'dob', 'nationality', 'email', 'phone', 'location', 'position', 'department',
  'experience', 'english', 'maritimeExp', 'cruiseExp', 'availability', 'internationalExp', 'motivation',
]

export default function ApplyForm() {
  const [data, setData] = useState(initialState)
  const [status, setStatus] = useState('idle') // idle | submitting | success
  const [files, setFiles] = useState({ cv: '', passport: '', certificates: '' })
  const cd = useCountdown(useMemo(() => nextIntake(), []))

  const update = (e) => setData((d) => ({ ...d, [e.target.name]: e.target.value }))
  const updateFile = (e) => setFiles((f) => ({ ...f, [e.target.name]: e.target.files?.[0]?.name || '' }))

  // The sailing map / department list can pre-select a department here.
  useEffect(() => bus.on('select-department', (name) => setData((d) => ({ ...d, department: name }))), [])

  const done = REQUIRED.filter((k) => String(data[k]).trim() !== '').length + (files.cv ? 1 : 0)
  const pct = Math.round((done / (REQUIRED.length + 1)) * 100)

  const handleSubmit = (e) => {
    e.preventDefault()
    setStatus('submitting')
    // Demo only — no backend. Simulate a network round-trip.
    setTimeout(() => {
      setStatus('success')
      requestAnimationFrame(() => scrollToId('apply', { offset: -40 }))
    }, 1100)
  }

  const reset = () => {
    setData(initialState)
    setFiles({ cv: '', passport: '', certificates: '' })
    setStatus('idle')
  }

  if (status === 'success') {
    return (
      <section id="apply" className="relative py-24 sm:py-32">
        <div className="container-x">
          <div className="glass mx-auto max-w-2xl rounded-3xl p-10 text-center sm:p-14" role="status" aria-live="polite">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-aqua/15 text-aqua">
              <CheckCircle2 className="h-9 w-9" />
            </span>
            <h2 className="serif mt-8 text-[clamp(2.4rem,6vw,4rem)] leading-none">
              Welcome aboard, <span className="serif-i text-sun">{data.fullName.split(' ')[0] || 'sailor'}</span>.
            </h2>
            <p className="mx-auto mt-6 max-w-md leading-relaxed text-foam/70">
              Your application for <span className="font-semibold text-foam">{data.position || 'a role at sea'}</span> has been submitted. Our
              crewing team will review your profile and reach out by email within 3–5 business days.
            </p>
            <button onClick={reset} className="btn btn-ghost mt-10">
              Submit another application
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="apply" className="relative py-24 sm:py-32">
      <div className="container-x">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <span className="eyebrow text-aqua">Join the crew</span>
          </Reveal>
          <Split as="h2" className="display mt-5 block text-[clamp(2.4rem,7vw,6rem)]" text="Apply now" />
          <Reveal delay={150} className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-md text-lg leading-relaxed text-foam/70">
              Complete the application below. Fields marked with <span className="font-semibold text-aqua">*</span> are required — the rest
              help us match you faster.
            </p>
            <p className="eyebrow num rounded-full border border-foam/20 px-4 py-2.5 text-foam/70">
              Intake closes in {cd.d}d {String(cd.h).padStart(2, '0')}h {String(cd.m).padStart(2, '0')}m
            </p>
          </Reveal>

          <Reveal
            as="form"
            delay={100}
            onSubmit={handleSubmit}
            className="glass mt-12 space-y-10 rounded-3xl p-6 sm:p-12"
            aria-label="Crew application"
          >
            {/* completion meter */}
            <div>
              <div className="eyebrow mb-3 flex justify-between text-foam/55">
                <span>Application progress</span>
                <span className="num text-foam">{pct}%</span>
              </div>
              <div className="h-px w-full bg-foam/15" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Application completion">
                <div className="h-px origin-left bg-aqua transition-transform duration-500" style={{ transform: `scaleX(${pct / 100})` }} />
              </div>
            </div>

            {/* PERSONAL */}
            <fieldset>
              <legend className="sr-only">Personal details</legend>
              <SectionHeading icon={User} step="Step 1" title="Personal details" desc="Tell us who you are and how to reach you." />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full Name" name="fullName" required value={data.fullName} onChange={update} placeholder="Jordan Rivera" autoComplete="name" />
                <Field label="Date of Birth" name="dob" type="date" required value={data.dob} onChange={update} autoComplete="bday" />
                <Field label="Nationality" name="nationality" required value={data.nationality} onChange={update} placeholder="e.g. Filipino" />
                <Field label="Email" name="email" type="email" required value={data.email} onChange={update} placeholder="you@email.com" autoComplete="email" />
                <Field label="Phone" name="phone" type="tel" required value={data.phone} onChange={update} placeholder="+1 555 123 4567" autoComplete="tel" />
                <Field label="WhatsApp Number" name="whatsapp" type="tel" value={data.whatsapp} onChange={update} placeholder="+1 555 123 4567" />
                <Field label="Current Location" name="location" required full value={data.location} onChange={update} placeholder="City, Country" />
              </div>
            </fieldset>

            <hr className="border-foam/10" />

            {/* PROFESSIONAL */}
            <fieldset>
              <legend className="sr-only">Professional background</legend>
              <SectionHeading icon={Briefcase} step="Step 2" title="Professional background" desc="Your experience and the role you're after." />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Desired Position" name="position" required value={data.position} onChange={update} placeholder="e.g. 2nd Engineer" />

                <Field label="Department" name="department" required>
                  <select id="department" name="department" required value={data.department} onChange={update} className="field">
                    <option value="" disabled>Select a department</option>
                    {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>

                <Field label="Years of Experience" name="experience" type="number" required value={data.experience} onChange={update} placeholder="e.g. 5" />

                <Field label="English Level" name="english" required>
                  <select id="english" name="english" required value={data.english} onChange={update} className="field">
                    <option value="" disabled>Select your level</option>
                    {ENGLISH_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </Field>

                <YesNo label="Maritime Experience" name="maritimeExp" required value={data.maritimeExp} onChange={update} />
                <YesNo label="Cruise Ship Experience" name="cruiseExp" required value={data.cruiseExp} onChange={update} />

                <Field label="Other Languages" name="languages" full value={data.languages} onChange={update} placeholder="e.g. Spanish, Tagalog, Italian" />
              </div>
            </fieldset>

            <hr className="border-foam/10" />

            {/* DOCUMENTS */}
            <fieldset>
              <legend className="sr-only">Documents</legend>
              <SectionHeading icon={FileText} step="Step 3" title="Documents" desc="Upload your CV. Passport and certificates are optional but speed things up." />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="CV / Resume" name="cv" required full>
                  <input id="cv" name="cv" type="file" required accept=".pdf,.doc,.docx" onChange={updateFile} className="file-field" />
                  {files.cv && <p className="mt-2 text-xs text-aqua">Selected: {files.cv}</p>}
                </Field>
                <Field label="Passport (optional)" name="passport">
                  <input id="passport" name="passport" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={updateFile} className="file-field" />
                  {files.passport && <p className="mt-2 text-xs text-aqua">Selected: {files.passport}</p>}
                </Field>
                <Field label="Certificates (optional)" name="certificates">
                  <input id="certificates" name="certificates" type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={updateFile} className="file-field" />
                  {files.certificates && <p className="mt-2 text-xs text-aqua">Selected: {files.certificates}</p>}
                </Field>
              </div>
            </fieldset>

            <hr className="border-foam/10" />

            {/* ADDITIONAL */}
            <fieldset>
              <legend className="sr-only">A little more</legend>
              <SectionHeading icon={Sparkles} step="Step 4" title="A little more" desc="Availability and what draws you to life at sea." />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Availability Date" name="availability" type="date" required value={data.availability} onChange={update} />
                <YesNo label="International Work Experience" name="internationalExp" required value={data.internationalExp} onChange={update} />
                <Field label="Motivation for Working at Sea" name="motivation" required full>
                  <textarea
                    id="motivation" name="motivation" required rows={4}
                    value={data.motivation} onChange={update}
                    placeholder="Tell us why you want to build your career at sea…"
                    className="field resize-none"
                  />
                </Field>
              </div>
            </fieldset>

            {/* SUBMIT */}
            <div className="flex flex-col items-center gap-4 pt-2">
              <button type="submit" disabled={status === 'submitting'} className="btn btn-aqua w-full disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:px-12 sm:py-4">
                {status === 'submitting' ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                ) : (
                  <><Send className="h-4 w-4" /> Submit application</>
                )}
              </button>
              <p className="text-center text-xs text-foam/40">By submitting you agree to OceanHire processing your data for recruitment purposes.</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
