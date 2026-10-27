import { useRef } from 'react'
import { useInView } from '../lib/hooks.js'

// Headline that rises word-by-word out of a mask (CSS in index.css, `.split`).
// `text` is a string, or an array of { t, c } tokens when some words need their
// own class (e.g. a serif-italic accent inside an all-caps headline):
//   <Split text={[{ t: 'Your' }, { t: 'career', c: 'serif-i' }]} />
export default function Split({ text, as: Tag = 'span', className = '', delay = 0, start = true }) {
  const ref = useRef(null)
  const seen = useInView(ref, { threshold: 0.2, margin: '0px 0px -5% 0px' })
  const tokens = typeof text === 'string' ? text.split(' ').map((t) => ({ t })) : text
  const label = tokens.map((k) => k.t).join(' ')
  return (
    <Tag
      ref={ref}
      aria-label={label}
      className={`split ${seen && start ? 'is-visible' : ''} ${className}`}
      style={{ '--d': `${delay}ms` }}
    >
      {tokens.map((k, i) => (
        <span key={i} aria-hidden="true">
          <span className="w">
            <span className={`wi ${k.c || ''}`} style={{ '--i': i }}>
              {k.t}
            </span>
          </span>{' '}
        </span>
      ))}
    </Tag>
  )
}
