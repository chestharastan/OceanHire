// A "stage" owns one WebGL canvas: renderer, camera, resize handling, adaptive
// resolution, frame-rate cap, visibility pausing and full disposal. All three
// scenes (hero backdrop, wireframe ship, sailable map) are built on it, so the
// performance rules live in exactly one place:
//
//  • one shared rAF loop (lib/scroll.js) — no per-scene requestAnimationFrame
//  • skips update + render while the canvas is off-screen or the tab is hidden
//  • pixel ratio is capped per device tier and lowered live by the governor
//  • canvas is created imperatively, so React StrictMode remounts get a fresh GL context
//  • everything (geometries, materials, textures, context) is released on dispose
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  ACESFilmicToneMapping,
} from 'three'
import { onFrame } from '../lib/scroll.js'
import { BUDGET, createGovernor } from '../lib/quality.js'

/** Shared counter: how many "heavy" interactive canvases are on screen right now. */
export const perf = { heavy: 0 }

// Opt-in performance HUD: open the site with ?debug to see per-canvas FPS, draw
// calls, triangles and the live resolution scale chosen by the governor.
const DEBUG = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug')
const debugLines = new Map()
let debugEl = null
function debugReport(name, text) {
  if (!DEBUG) return
  if (!debugEl) {
    debugEl = document.createElement('pre')
    debugEl.style.cssText =
      'position:fixed;left:8px;bottom:8px;z-index:9999;margin:0;padding:8px 10px;font:11px/1.45 ui-monospace,monospace;color:#7de3d6;background:rgba(2,10,20,.8);border-radius:8px;pointer-events:none;white-space:pre'
    document.body.appendChild(debugEl)
  }
  if (text == null) debugLines.delete(name)
  else debugLines.set(name, text)
  debugEl.textContent = [...debugLines.values()].join('\n')
}

export function disposeObject(root) {
  root.traverse((o) => {
    o.geometry?.dispose?.()
    const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []
    for (const m of mats) {
      for (const k in m) if (m[k] && m[k].isTexture) m[k].dispose()
      m.dispose?.()
    }
  })
}

/**
 * @param {HTMLElement} container element the canvas is appended to
 * @param {object} opts
 *   tier   0|1|2 device tier
 *   fixed  size to the window (hero backdrop) instead of the container
 *   heavy  counts toward perf.heavy while visible (interactive sections)
 *   fov    vertical field of view
 *   name   label used by the ?debug overlay
 *   build  ({renderer, scene, camera, budget, tier}) => { update(dt,t,s), resize(w,h,aspect), dispose() }
 */
export function createStage(container, { tier, fixed = false, heavy = false, fov = 50, build, onFirstFrame, name = 'scene' }) {
  const budget = BUDGET[tier]
  const canvas = document.createElement('canvas')
  canvas.style.cssText = 'display:block;width:100%;height:100%;touch-action:inherit'
  container.appendChild(canvas)

  let renderer
  try {
    renderer = new WebGLRenderer({ canvas, antialias: budget.msaa, alpha: false, stencil: false })
  } catch (err) {
    canvas.remove()
    return null // WebGL unavailable → caller falls back to the CSS backdrop
  }
  const basePR = Math.min(window.devicePixelRatio || 1, budget.dpr)
  renderer.setPixelRatio(basePR)
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 1

  const scene = new Scene()
  const camera = new PerspectiveCamera(fov, 1, 0.1, 2000)
  const api = build({ renderer, scene, camera, budget, tier })

  let w = 0
  let h = 0
  let visible = true
  let lost = false
  let counted = false
  let acc = 0
  let first = true
  let fpsEma = 60
  let lastDebug = 0
  const interval = 1000 / budget.fps

  const governor = createGovernor({
    targetMs: interval + 2,
    onScale: (s) => {
      renderer.setPixelRatio(basePR * s)
      renderer.setSize(w, h, false)
    },
  })

  const resize = () => {
    const cw = fixed ? window.innerWidth : container.clientWidth
    const ch = fixed ? window.innerHeight : container.clientHeight
    if (!cw || !ch) return
    // Mobile browsers resize the viewport as the URL bar shows/hides while
    // scrolling. Ignore small height-only changes so we don't reallocate the
    // drawing buffer mid-scroll.
    if (fixed && w && cw === w && Math.abs(ch - h) < 160) return
    w = cw
    h = ch
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    api.resize?.(w, h, camera.aspect)
  }
  resize()

  let ro = null
  if (fixed) window.addEventListener('resize', resize, { passive: true })
  else if ('ResizeObserver' in window) {
    ro = new ResizeObserver(resize)
    ro.observe(container)
  }

  const onLost = (e) => {
    e.preventDefault()
    lost = true
  }
  const onRestored = () => {
    lost = false
  }
  canvas.addEventListener('webglcontextlost', onLost)
  canvas.addEventListener('webglcontextrestored', onRestored)

  const unsub = onFrame((s, dt, time) => {
    if (!visible || lost) return
    // Frame cap: when an interactive section is on screen the ambient backdrop
    // drops to half rate so the two don't fight for the GPU.
    const step = !heavy && !fixed ? interval : fixed && perf.heavy > 0 ? interval * 2 : interval
    acc += dt
    if (acc < step - 1) return
    const d = acc
    acc = 0
    api.update(Math.min(d, 64) / 1000, time / 1000, s)
    renderer.render(scene, camera)
    governor.tick(d)
    if (DEBUG) {
      fpsEma += (1000 / d - fpsEma) * 0.1
      if (time - lastDebug > 500) {
        lastDebug = time
        const i = renderer.info.render
        debugReport(name, `${name.padEnd(9)} ${fpsEma.toFixed(0).padStart(3)} fps · ${String(i.calls).padStart(3)} draws · ${(i.triangles / 1000).toFixed(1)}k tris · dpr ${renderer.getPixelRatio().toFixed(2)} · tier ${tier}`)
      }
    }
    if (first) {
      first = false
      onFirstFrame?.()
    }
  })

  return {
    canvas,
    renderer,
    scene,
    camera,
    api,
    setVisible(v) {
      visible = v
      if (heavy) {
        if (v && !counted) perf.heavy++
        if (!v && counted) perf.heavy--
        counted = v
      }
    },
    dispose() {
      unsub()
      debugReport(name, null)
      if (counted) perf.heavy--
      counted = false
      ro?.disconnect()
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      api.dispose?.()
      disposeObject(scene)
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    },
  }
}
