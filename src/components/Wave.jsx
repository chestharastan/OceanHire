// Decorative SVG wave divider. `flip` points it upward; `className` sets fill color.
export default function Wave({ flip = false, className = 'text-white' }) {
  return (
    <div className={`pointer-events-none w-full leading-none ${flip ? 'rotate-180' : ''}`} aria-hidden="true">
      <svg
        className={`h-12 w-full sm:h-16 ${className}`}
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        fill="currentColor"
      >
        <path d="M0,32 C240,80 480,0 720,24 C960,48 1200,80 1440,40 L1440,80 L0,80 Z" />
      </svg>
    </div>
  )
}
