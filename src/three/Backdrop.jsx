import { useEffect, useRef } from 'react'
import { createStage } from './stage.js'
import { buildBackdrop } from './backdrop.js'
import { detectTier } from '../lib/quality.js'

// Fixed full-screen WebGL canvas behind the page. Loaded lazily (see App.jsx) so
// the three.js chunk never blocks first paint. `100lvh` keeps the canvas a
// constant size while mobile URL bars show/hide.
export default function Backdrop({ onReady, onFail }) {
  const host = useRef(null)

  useEffect(() => {
    const stage = createStage(host.current, {
      tier: detectTier(),
      fixed: true,
      name: 'backdrop',
      fov: 48,
      build: buildBackdrop,
      onFirstFrame: onReady,
    })
    if (!stage) onFail?.()
    return () => stage?.dispose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div ref={host} aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 -z-10" style={{ height: '100lvh' }} />
}
