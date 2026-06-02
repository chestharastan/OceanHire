import { useEffect, useRef } from 'react'

// Scroll-driven parallax wrapper. Translates its children relative to how far
// the element's centre sits from the viewport centre, so layers with different
// `speed` values drift at different rates and create depth.
//   speed > 0  → moves opposite to scroll (appears further away / slower)
//   speed < 0  → moves with scroll (appears closer / faster)
export default function Parallax({
  speed = 0.2,
  axis = 'y',
  as: Tag = 'div',
  className = '',
  children,
  ...rest
}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0
    const update = () => {
      raf = 0
      const rect = el.getBoundingClientRect()
      const viewH = window.innerHeight || document.documentElement.clientHeight
      const fromCentre = rect.top + rect.height / 2 - viewH / 2
      const offset = -(fromCentre * speed)
      el.style.transform =
        axis === 'x'
          ? `translate3d(${offset.toFixed(1)}px,0,0)`
          : `translate3d(0,${offset.toFixed(1)}px,0)`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [speed, axis])

  return (
    <Tag ref={ref} className={className} style={{ willChange: 'transform' }} {...rest}>
      {children}
    </Tag>
  )
}
