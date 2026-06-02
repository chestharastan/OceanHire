import { useState } from 'react'
import {
  User, Briefcase, FileText, Sparkles, CheckCircle2, Send, Loader2,
} from 'lucide-react'
import Reveal from './Reveal.jsx'

const departments = ['Deck', 'Engine', 'Hospitality', 'Entertainment', 'Medical', 'Administration']
const englishLevels = ['Basic', 'Intermediate', 'Fluent', 'Native']

// Small presentational helpers ------------------------------------------------

function SectionHeading({ icon: Icon, step, title, desc }) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-ocean/10 text-ocean">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">{step}</p>
        <h3 className="text-lg font-bold text-navy-900">{title}</h3>
        {desc && <p className="text-sm text-slate-500">{desc}</p>}
      </div>
    </div>
  )
}

function Field({ label, name, type = 'text', required, placeholder, value, onChange, children, full }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label htmlFor={name} className="field-label">
        {label} {required && <span className="text-ocean">*</span>}
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
        {label} {required && <span className="text-ocean">*</span>}
      </span>
      <div className="flex gap-2">
        {['Yes', 'No'].map((opt) => {
          const active = value === opt
          return (
            <label
              key={opt}
              className={`flex flex-1 cursor-pointer items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'border-ocean bg-ocean text-white shadow-sm'
                  : 'border-slate-300 bg-white text-navy-800 hover:border-ocean/50'
              }`}
            >
              <input
                type="radio"
                name={name}
                value={opt}
                checked={active}
                onChange={onChange}
                required={required}
                className="sr-only"
              />
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

export default function ApplyForm() {
  const [data, setData] = useState(initialState)
  const [status, setStatus] = useState('idle') // idle | submitting | success
  const [files, setFiles] = useState({ cv: '', passport: '', certificates: '' })

  const update = (e) => setData((d) => ({ ...d, [e.target.name]: e.target.value }))
  const updateFile = (e) =>
    setFiles((f) => ({ ...f, [e.target.name]: e.target.files?.[0]?.name || '' }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setStatus('submitting')
    // Demo only — no backend. Simulate a network round-trip.
    setTimeout(() => {
      setStatus('success')
      window.scrollTo({ top: document.getElementById('apply').offsetTop - 80, behavior: 'smooth' })
    }, 1100)
  }

  const reset = () => {
    setData(initialState)
    setFiles({ cv: '', passport: '', certificates: '' })
    setStatus('idle')
  }

  if (status === 'success') {
    return (
      <section id="apply" className="bg-white py-20 sm:py-28">
        <div className="container-x">
          <div className="mx-auto max-w-xl rounded-3xl border border-slate-100 bg-slate-50/70 p-10 text-center shadow-soft">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle2 className="h-9 w-9" />
            </span>
            <h2 className="mt-6 text-2xl font-extrabold text-navy-900">Application received!</h2>
            <p className="mt-3 text-slate-600">
              Thank you, <span className="font-semibold text-navy-900">{data.fullName || 'sailor'}</span>.
              Your application for{' '}
              <span className="font-semibold text-ocean">{data.position || 'a role at sea'}</span>{' '}
              has been submitted. Our crewing team will review your profile and reach out
              by email within 3–5 business days.
            </p>
            <button
              onClick={reset}
              className="mt-8 inline-flex items-center justify-center rounded-full bg-ocean px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-ocean-500"
            >
              Submit another application
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="apply" className="bg-white py-20 sm:py-28">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-ocean">
            Join the Crew
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
            Apply Now
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Complete the application below. Fields marked with{' '}
            <span className="font-semibold text-ocean">*</span> are required — the rest
            help us match you faster.
          </p>
        </Reveal>

        <Reveal
          as="form"
          delay={100}
          onSubmit={handleSubmit}
          className="mx-auto mt-12 max-w-3xl space-y-10 rounded-3xl border border-slate-100 bg-white p-6 shadow-soft sm:p-10"
        >
          {/* PERSONAL ---------------------------------------------------------- */}
          <fieldset>
            <SectionHeading
              icon={User}
              step="Step 1"
              title="Personal details"
              desc="Tell us who you are and how to reach you."
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full Name" name="fullName" required value={data.fullName} onChange={update} placeholder="Jordan Rivera" />
              <Field label="Date of Birth" name="dob" type="date" required value={data.dob} onChange={update} />
              <Field label="Nationality" name="nationality" required value={data.nationality} onChange={update} placeholder="e.g. Filipino" />
              <Field label="Email" name="email" type="email" required value={data.email} onChange={update} placeholder="you@email.com" />
              <Field label="Phone" name="phone" type="tel" required value={data.phone} onChange={update} placeholder="+1 555 123 4567" />
              <Field label="WhatsApp Number" name="whatsapp" type="tel" value={data.whatsapp} onChange={update} placeholder="+1 555 123 4567" />
              <Field label="Current Location" name="location" required full value={data.location} onChange={update} placeholder="City, Country" />
            </div>
          </fieldset>

          <hr className="border-slate-100" />

          {/* PROFESSIONAL ------------------------------------------------------ */}
          <fieldset>
            <SectionHeading
              icon={Briefcase}
              step="Step 2"
              title="Professional background"
              desc="Your experience and the role you're after."
            />
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
                  {englishLevels.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </Field>

              <YesNo label="Maritime Experience" name="maritimeExp" required value={data.maritimeExp} onChange={update} />
              <YesNo label="Cruise Ship Experience" name="cruiseExp" required value={data.cruiseExp} onChange={update} />

              <Field label="Other Languages" name="languages" full value={data.languages} onChange={update} placeholder="e.g. Spanish, Tagalog, Italian" />
            </div>
          </fieldset>

          <hr className="border-slate-100" />

          {/* DOCUMENTS --------------------------------------------------------- */}
          <fieldset>
            <SectionHeading
              icon={FileText}
              step="Step 3"
              title="Documents"
              desc="Upload your CV. Passport and certificates are optional but speed things up."
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="CV / Resume" name="cv" required full>
                <input id="cv" name="cv" type="file" required accept=".pdf,.doc,.docx" onChange={updateFile} className="file-field" />
                {files.cv && <p className="mt-1.5 text-xs text-green-600">Selected: {files.cv}</p>}
              </Field>
              <Field label="Passport (optional)" name="passport">
                <input id="passport" name="passport" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={updateFile} className="file-field" />
                {files.passport && <p className="mt-1.5 text-xs text-green-600">Selected: {files.passport}</p>}
              </Field>
              <Field label="Certificates (optional)" name="certificates">
                <input id="certificates" name="certificates" type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={updateFile} className="file-field" />
                {files.certificates && <p className="mt-1.5 text-xs text-green-600">Selected: {files.certificates}</p>}
              </Field>
            </div>
          </fieldset>

          <hr className="border-slate-100" />

          {/* ADDITIONAL -------------------------------------------------------- */}
          <fieldset>
            <SectionHeading
              icon={Sparkles}
              step="Step 4"
              title="A little more"
              desc="Availability and what draws you to life at sea."
            />
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

          {/* SUBMIT ------------------------------------------------------------ */}
          <div className="flex flex-col items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-8 py-4 text-base font-bold text-navy-900 shadow-lg shadow-gold/20 transition-all hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              {status === 'submitting' ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Submitting…</>
              ) : (
                <><Send className="h-5 w-5 transition-transform group-hover:translate-x-0.5" /> Submit Application</>
              )}
            </button>
            <p className="text-xs text-slate-400">
              By submitting you agree to OceanHire processing your data for recruitment purposes.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
