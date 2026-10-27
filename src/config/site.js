import { Ship, Cog, UtensilsCrossed, Music4, Stethoscope, ClipboardList } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for copy + structured data. The nav, the interactive
// wireframe ship, the sailable island map and the application form all read the
// DEPARTMENTS list, so they can never drift apart.
// ─────────────────────────────────────────────────────────────────────────────

export const NAV = [
  { id: 'about', label: 'About' },
  { id: 'departments', label: 'Departments' },
  { id: 'voyage', label: 'Process' },
  { id: 'apply', label: 'Apply' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Contact' },
]

// Sections shown in the side dot-pager (Curvy Beagle style), top → bottom.
export const PAGER = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'departments', label: 'Departments' },
  { id: 'sail', label: 'Set sail' },
  { id: 'voyage', label: 'Process' },
  { id: 'life', label: 'Life at sea' },
  { id: 'apply', label: 'Apply' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Contact' },
]

export const STATS = [
  { value: 40, suffix: '+', label: 'Cruise lines & fleets' },
  { value: 6, suffix: '', label: 'Onboard departments' },
  { value: 12, suffix: 'k+', label: 'Crew placed at sea' },
]

// `zone` = where the department lives on the wireframe ship (see three/wireship.js)
// `island` = where its port sits on the sailable map (x, z in world units, r = radius)
// `hue` = accent used for that department's highlight in 3D
export const DEPARTMENTS = [
  {
    id: 'deck',
    name: 'Deck',
    icon: Ship,
    roles: 'Captains, Officers, Bosuns, Able Seamen',
    text: 'Navigation, safety and seamanship — the backbone of every vessel.',
    zone: 0,
    hue: '#7de3d6',
    island: { x: 78, z: -30, r: 9 },
  },
  {
    id: 'engine',
    name: 'Engine',
    icon: Cog,
    roles: 'Chief Engineers, ETOs, Motormen, Fitters',
    text: 'Keep propulsion, power and systems running across every voyage.',
    zone: 1,
    hue: '#f3c892',
    island: { x: 40, z: 70, r: 8 },
  },
  {
    id: 'hospitality',
    name: 'Hospitality',
    icon: UtensilsCrossed,
    roles: 'Chefs, Waiters, Bartenders, Housekeeping',
    text: 'Deliver world-class dining and guest experiences at sea.',
    zone: 2,
    hue: '#ff9db8',
    island: { x: -35, z: 78, r: 10 },
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: Music4,
    roles: 'Performers, DJs, Hosts, Technicians',
    text: 'Bring energy to the stage, deck parties and guest activities.',
    zone: 3,
    hue: '#c69bff',
    island: { x: -82, z: 22, r: 9 },
  },
  {
    id: 'medical',
    name: 'Medical',
    icon: Stethoscope,
    roles: 'Doctors, Nurses, Paramedics',
    text: 'Provide onboard care and emergency response for crew and guests.',
    zone: 4,
    hue: '#8fd3ff',
    island: { x: -50, z: -66, r: 8 },
  },
  {
    id: 'administration',
    name: 'Administration',
    icon: ClipboardList,
    roles: 'Pursers, HR, Crew Office, Finance',
    text: 'Run the shoreside-at-sea operations that keep everything in order.',
    zone: 5,
    hue: '#ffd27d',
    island: { x: 20, z: -88, r: 9 },
  },
]

export const PILLARS = [
  {
    title: 'Guided every step',
    text: 'From application to embarkation, a dedicated coordinator supports your documents, visas and joining details.',
  },
  {
    title: 'Fair & transparent',
    text: 'No hidden recruitment fees. Clear contracts that follow Maritime Labour Convention standards.',
  },
  {
    title: 'Right fit, first time',
    text: 'We match your skills, certifications and ambitions to roles where you will genuinely thrive.',
  },
]

// The hiring journey, told as a pinned scroll story (Persepolis style).
export const VOYAGE = [
  {
    n: '01',
    title: 'Apply',
    line: 'Tell us who you are.',
    text: 'Complete the application and upload your CV. It takes about ten minutes — passport and certificates are optional but speed things up.',
    media: 'voyage1',
  },
  {
    n: '02',
    title: 'Review',
    line: 'A real person reads it.',
    text: 'Our crewing team reviews your profile and replies within 3–5 business days with next steps or a role that fits.',
    media: 'voyage2',
  },
  {
    n: '03',
    title: 'Prepare',
    line: 'We sort the paperwork.',
    text: 'Medicals, STCW training, seaman’s book and visas. You get a personalised checklist and a coordinator to answer every question.',
    media: 'voyage3',
  },
  {
    n: '04',
    title: 'Match',
    line: 'A contract that fits.',
    text: 'Clear terms that follow the Maritime Labour Convention — no recruitment fees, ever. Contracts typically run 4 to 9 months.',
    media: 'voyage4',
  },
  {
    n: '05',
    title: 'Embark',
    line: 'Join your vessel.',
    text: 'From interview to joining usually takes 4–10 weeks. Then the gangway lifts and your career at sea begins.',
    media: 'voyage5',
  },
]

export const FAQS = [
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

export const CONTACT = {
  email: 'crew@oceanhire.com',
  phone: '+1 (305) 555-0142',
  phoneHref: 'tel:+13055550142',
  office: 'Port Boulevard, Miami, FL',
}

export const MARQUEE_WORDS = ['Deck', 'Engine', 'Hospitality', 'Entertainment', 'Medical', 'Administration']

export const ENGLISH_LEVELS = ['Basic', 'Intermediate', 'Fluent', 'Native']

// ── Intake countdown (hero + apply) ─────────────────────────────────────────
// PLACEHOLDER: replace with the real application deadline, e.g.
//   export const INTAKE_CLOSES_AT = new Date('2026-12-15T12:00:00Z')
// While null, the site auto-rolls to the next 15th of the month so the
// countdown is never stale.
export const INTAKE_CLOSES_AT = null

export function nextIntake(now = new Date()) {
  if (INTAKE_CLOSES_AT) return INTAKE_CLOSES_AT
  const y = now.getUTCFullYear()
  const m = now.getUTCMonth()
  let d = new Date(Date.UTC(y, m, 15, 12, 0, 0))
  if (d <= now) d = new Date(Date.UTC(y, m + 1, 15, 12, 0, 0))
  return d
}
