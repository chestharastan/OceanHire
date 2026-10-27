import { useEffect, useRef } from 'react'
import { MEDIA } from '../config/media.js'

// One component for every image / video on the site.
//   <MediaSlot id="about" />            → looks the slot up in config/media.js
//   <MediaSlot item={MEDIA.gallery[0]} />  → or pass the slot object directly
// While `src` is null it renders a labelled placeholder showing the recommended
// size and format; once a real file is set in the manifest it renders the media
// (lazy-loaded; videos only play while on screen to save battery and data).
export default function MediaSlot({ id, item, className = '', fill = false, rounded = 'rounded-2xl', children }) {
  const m = item || MEDIA[id]
  const videoRef = useRef(null)

  useEffect(() => {
    const v = videoRef.current
    if (!v || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver((entries) => (entries[entries.length - 1].isIntersecting ? v.play().catch(() => {}) : v.pause()), {
      threshold: 0.25,
    })
    io.observe(v)
    return () => io.disconnect()
  }, [m?.src])

  if (!m) return null
  const box = fill ? 'absolute inset-0' : 'relative w-full'
  const style = fill ? undefined : { aspectRatio: m.aspect }

  if (m.src) {
    return (
      <div className={`${box} overflow-hidden ${rounded} ${className}`} style={style}>
        {m.kind === 'video' ? (
          <video
            ref={videoRef}
            src={m.src}
            poster={m.poster || undefined}
            muted
            loop
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
          />
        ) : (
          <img
            src={m.src}
            srcSet={m.srcSet || undefined}
            sizes="(min-width: 1024px) 40vw, 90vw"
            alt={m.alt}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        )}
        {children}
      </div>
    )
  }

  return (
    <div className={`ph ${box} ${rounded} ${className}`} style={style} role="img" aria-label={`Placeholder: ${m.label}`}>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
        <span className="eyebrow text-aqua/80">Placeholder · {m.kind}</span>
        <span className="serif text-[clamp(1.4rem,2.4vw,2rem)] leading-tight text-foam">{m.label}</span>
        <span className="max-w-[26ch] text-[11px] leading-snug text-foam/50">{m.hint}</span>
      </div>
      <span className="num absolute bottom-3 left-4 text-[10px] tracking-[0.2em] text-foam/35">{m.aspect.replace(' / ', ':')}</span>
      {children}
    </div>
  )
}
