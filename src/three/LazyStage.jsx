import { useEffect, useRef, useState } from 'react'
import { detectTier } from '../lib/quality.js'

// Mounts a WebGL stage only while its container is near the viewport, and tears
// it down again when it is far away. This keeps at most two GL contexts alive
// (the backdrop + one interactive canvas), which matters on phones where
// browsers cap contexts and GPU memory is tight.
//
//   load     () => import('./wireship.js')   (module exports create(container, tier))
//   onStage  receives the stage once created (and null when it is disposed)
//   fallback rendered if WebGL is unavailable
export default function LazyStage({ load, onStage, className = '', style, fallback = null, children }) {
  const host = useRef(null)
  const [failed, setFailed] = useState(false)
  const cb = useRef(onStage)
  cb.current = onStage

  useEffect(() => {
    let stage = null
    let wanted = false
    let visible = false
    let cancelled = false
    // Generation counter: if the section scrolls out and back in while the async
    // import is still pending, the stale completion must not create a second stage.
    let gen = 0

    const mount = async () => {
      if (wanted) return
      wanted = true
      const mine = ++gen
      try {
        const mod = await load()
        if (cancelled || !wanted || mine !== gen) return
        stage = mod.create(host.current, detectTier())
        if (!stage) return setFailed(true)
        stage.setVisible(visible)
        cb.current?.(stage)
      } catch (err) {
        console.error('Could not start 3D scene', err)
        setFailed(true)
      }
    }
    const unmount = () => {
      wanted = false
      gen++
      if (stage) {
        stage.dispose()
        stage = null
        cb.current?.(null)
      }
    }

    // `near` creates/destroys; `vis` pauses rendering when scrolled just out of view.
    // NB: a callback batch can hold several queued changes (enter → leave during a fast
    // scroll). Always act on the LAST entry, never the first, or a stale "enter" would win.
    const near = new IntersectionObserver((entries) => (entries[entries.length - 1].isIntersecting ? mount() : unmount()), { rootMargin: '60% 0px' })
    const vis = new IntersectionObserver((entries) => {
      visible = entries[entries.length - 1].isIntersecting
      stage?.setVisible(visible)
    })
    near.observe(host.current)
    vis.observe(host.current)
    return () => {
      cancelled = true
      near.disconnect()
      vis.disconnect()
      unmount()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={host} className={className} style={style}>
      {failed ? fallback : null}
      {children}
    </div>
  )
}
