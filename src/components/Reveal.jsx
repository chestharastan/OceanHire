import { useRef } from 'react'
import { useInView } from '../lib/hooks.js'

// Fades + lifts its children in when scrolled into view (styles in index.css).
// `delay` (ms) staggers siblings; `y` is how far it travels.
export default function Reveal({ as: Tag = 'div', delay = 0, y = 32, className = '', children, ...rest }) {
  const ref = useRef(null)
  const seen = useInView(ref)
  return (
    <Tag
      ref={ref}
      className={`reveal ${seen ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms`, '--reveal-y': `${y}px` }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
