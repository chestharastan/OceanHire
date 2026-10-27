import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Anchor, Gauge, X } from 'lucide-react'
import Split from './Split.jsx'
import Reveal from './Reveal.jsx'
import LazyStage from '../three/LazyStage.jsx'
import { DEPARTMENTS } from '../config/site.js'
import { bus } from '../lib/hooks.js'
import { isCoarsePointer } from '../lib/quality.js'
import { scrollToId } from '../lib/scroll.js'

// SET SAIL — a playable sea map (three/sail.js), after Bruno Simon's drivable portfolio.
// Controls are only captured while "at the helm", so the page scrolls normally otherwise.
//   keyboard: W A S D / arrows · Shift boost · R respawn · Esc leave
//   touch:    on-screen joystick + boost button
const KEYS = {
  KeyW: 'up', ArrowUp: 'up', KeyS: 'down', ArrowDown: 'down',
  KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right',
  ShiftLeft: 'boost', ShiftRight: 'boost',
}

function Radar({ draw }) {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    c.width = 120 * dpr
    c.height = 120 * dpr
    ctx.scale(dpr, dpr)
    draw.current = (h) => {
      ctx.clearRect(0, 0, 120, 120)
      ctx.fillStyle = 'rgba(6,24,43,0.7)'
      ctx.beginPath()
      ctx.arc(60, 60, 58, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(125,227,214,0.35)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(60, 60, 58, 0, Math.PI * 2)
      ctx.arc(60, 60, 30, 0, Math.PI * 2)
      ctx.stroke()
      // world → radar, rotated so the boat always points "up"
      const k = 56 / 160
      const cos = Math.cos(h.h)
      const sin = Math.sin(h.h)
      h.islands.forEach((isl, i) => {
        const dx = isl.x - h.x
        const dz = isl.z - h.z
        // boat forward = (sin h, cos h); screen-up = forward, screen-right = -x side
        const fwd = dx * sin + dz * cos
        const right = -(dx * cos - dz * sin)
        const px = 60 + right * k
        const py = 60 - fwd * k
        if (Math.hypot(px - 60, py - 60) > 56) return
        ctx.fillStyle = DEPARTMENTS[i].hue
        ctx.beginPath()
        ctx.arc(px, py, 3.5, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.fillStyle = '#f4f6fb'
      ctx.beginPath()
      ctx.moveTo(60, 52)
      ctx.lineTo(65, 66)
      ctx.lineTo(55, 66)
      ctx.closePath()
      ctx.fill()
    }
  }, [draw])
  return <canvas ref={ref} className="h-[120px] w-[120px]" aria-hidden="true" />
}

export default function Sail() {
  const [active, setActive] = useState(false)
  const [dock, setDock] = useState(-1)
  const [speed, setSpeed] = useState(0)
  const stage = useRef(null)
  const box = useRef(null)
  const labels = useRef([])
  const radar = useRef(null)
  const keys = useRef(new Set())
  const stick = useRef({ x: 0, y: 0, on: false })
  const knob = useRef(null)
  const touch = useRef(typeof window !== 'undefined' && isCoarsePointer()).current

  const push = useCallback(() => {
    const k = keys.current
    const up = k.has('up') - k.has('down')
    const turn = k.has('left') - k.has('right')
    const s = stick.current
    stage.current?.api.setInput({
      throttle: s.on ? -s.y : up,
      steer: s.on ? -s.x : turn,
      boost: k.has('boost'),
    })
  }, [])

  const onStage = useCallback((s) => {
    stage.current = s
    if (!s) return
    s.api.setLabels(labels.current)
    s.api.on('onDock', (i) => setDock(i))
    let lastSpeed = 0
    s.api.on('onHud', (h) => {
      radar.current?.(h)
      const sp = Math.round(Math.abs(h.v) * 3.2)
      if (sp !== lastSpeed) setSpeed((lastSpeed = sp))
    })
  }, [])

  const release = useCallback(() => {
    setActive(false)
    keys.current.clear()
    stick.current.on = false
    stage.current?.api.setActive(false)
  }, [])

  // Keep the latest docked island readable from the (long-lived) key handler.
  const dockRef = useRef(-1)
  dockRef.current = dock
  const applyFor = (i) => {
    bus.emit('select-department', DEPARTMENTS[i].name)
    release()
    scrollToId('apply')
  }

  const takeHelm = () => {
    setActive(true)
    stage.current?.api.setActive(true)
  }

  // Keyboard — only while at the helm
  useEffect(() => {
    if (!active) return
    const down = (e) => {
      if (e.code === 'Escape') return release()
      if (e.code === 'KeyR') return stage.current?.api.respawn()
      if (e.code === 'Enter' && dockRef.current >= 0) {
        e.preventDefault()
        return applyFor(dockRef.current)
      }
      const k = KEYS[e.code]
      if (!k) return
      e.preventDefault() // stop arrows / WASD scrolling the page
      keys.current.add(k)
      push()
    }
    const up = (e) => {
      const k = KEYS[e.code]
      if (!k) return
      keys.current.delete(k)
      push()
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', release)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', release)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, push, release])

  // Let go of the helm when the map scrolls out of view
  useEffect(() => {
    const io = new IntersectionObserver((entries) => !entries[entries.length - 1].isIntersecting && release(), { threshold: 0.05 })
    io.observe(box.current)
    return () => io.disconnect()
  }, [release])

  // Touch joystick
  const stickDown = (e) => {
    stick.current.on = true
    e.currentTarget.setPointerCapture?.(e.pointerId)
    stickMove(e)
  }
  const stickMove = (e) => {
    if (!stick.current.on) return
    const r = e.currentTarget.getBoundingClientRect()
    let dx = e.clientX - (r.left + r.width / 2)
    let dy = e.clientY - (r.top + r.height / 2)
    const max = r.width / 2 - 14
    const d = Math.hypot(dx, dy)
    if (d > max) {
      dx = (dx / d) * max
      dy = (dy / d) * max
    }
    stick.current.x = dx / max
    stick.current.y = dy / max
    if (knob.current) knob.current.style.transform = `translate3d(${dx}px,${dy}px,0)`
    push()
  }
  const stickUp = () => {
    stick.current = { x: 0, y: 0, on: false }
    if (knob.current) knob.current.style.transform = 'translate3d(0,0,0)'
    push()
  }
  const boostTouch = (on) => {
    on ? keys.current.add('boost') : keys.current.delete('boost')
    push()
  }

  const near = dock >= 0 ? DEPARTMENTS[dock] : null

  return (
    <section id="sail" className="relative py-24 sm:py-32">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <Reveal>
              <span className="eyebrow text-aqua">Set sail · interactive</span>
            </Reveal>
            <Split as="h2" className="display mt-5 block text-[clamp(2rem,5.6vw,5rem)]" text={[{ t: 'Take' }, { t: 'the' }, { t: 'helm', c: 'serif-i' }]} />
          </div>
          <Reveal delay={150}>
            <p className="max-w-md leading-relaxed text-foam/70">
              Six ports, one per department. Sail up to a glowing ring to dock and meet the crew. It&apos;s a playful extra —
              every department is also listed above.{' '}
              <a href="#voyage" onClick={(e) => { e.preventDefault(); scrollToId('voyage') }} className="underline decoration-foam/30 underline-offset-4 hover:decoration-foam">
                Skip the map
              </a>
            </p>
          </Reveal>
        </div>

        <div
          ref={box}
          className="relative mt-10 aspect-[4/5] border border-foam/12 overflow-hidden rounded-3xl sm:aspect-[16/10] lg:aspect-[16/8]"
          style={{ touchAction: 'pan-y' }}
          role="region"
          aria-label="Interactive sailing map. Optional. Use W A S D or arrow keys to steer, Escape to leave."
        >
          <LazyStage
            load={() => import('../three/sail.js')}
            onStage={onStage}
            className="absolute inset-0"
            fallback={<div className="grid h-full place-items-center p-6 text-center text-sm text-foam/50">Interactive map unavailable on this device.</div>}
          />

          {/* Island names, pinned in 3D */}
          {DEPARTMENTS.map((d, i) => (
            <span
              key={d.id}
              ref={(el) => (labels.current[i] = el)}
              className="pointer-events-none absolute left-0 top-0 z-10 opacity-0"
              style={{ willChange: 'transform' }}
            >
              <span className="eyebrow block -translate-x-1/2 whitespace-nowrap rounded-full bg-abyss/65 px-3 py-1.5 text-[0.62rem] backdrop-blur-sm" style={{ boxShadow: `inset 0 0 0 1px ${d.hue}66` }}>
                <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full" style={{ background: d.hue }} />
                {d.name}
              </span>
            </span>
          ))}

          {/* Start overlay */}
          {!active && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gradient-to-t from-abyss/70 via-abyss/10 to-transparent p-6 text-center">
              <button type="button" onClick={takeHelm} className="btn btn-primary">
                <Anchor className="h-4 w-4" /> Take the helm
              </button>
              <p className="eyebrow mt-5 hidden text-foam/70 sm:block">W A S D / arrows · Shift to boost · Esc to leave</p>
              <p className="eyebrow mt-5 text-foam/70 sm:hidden">Use the joystick to steer</p>
            </div>
          )}

          {/* HUD */}
          {active && (
            <>
              <button type="button" onClick={release} className="eyebrow absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full bg-abyss/70 px-4 py-2.5 backdrop-blur-sm hover:bg-abyss">
                <X className="h-3.5 w-3.5" /> Leave helm
              </button>
              <div className="absolute right-4 top-4 z-20 flex flex-col items-end gap-2">
                <Radar draw={radar} />
                <span className="eyebrow num flex items-center gap-2 rounded-full bg-abyss/70 px-3 py-1.5 text-[0.62rem]">
                  <Gauge className="h-3.5 w-3.5 text-aqua" /> {speed} kn
                </span>
              </div>
            </>
          )}

          {/* Touch controls */}
          {active && touch && (
            <>
              <div
                className="absolute bottom-5 left-5 z-20 h-28 w-28 touch-none rounded-full border border-foam/30 bg-abyss/40 backdrop-blur-sm"
                style={{ touchAction: 'none' }}
                onPointerDown={stickDown}
                onPointerMove={stickMove}
                onPointerUp={stickUp}
                onPointerCancel={stickUp}
                aria-label="Steering joystick"
              >
                <div ref={knob} className="absolute left-1/2 top-1/2 -ml-6 -mt-6 h-12 w-12 rounded-full bg-foam/90 shadow-lg" />
              </div>
              <button
                type="button"
                className="eyebrow absolute bottom-8 right-5 z-20 grid h-16 w-16 touch-none place-items-center rounded-full border border-aqua/60 bg-abyss/50 text-aqua"
                onPointerDown={() => boostTouch(true)}
                onPointerUp={() => boostTouch(false)}
                onPointerCancel={() => boostTouch(false)}
              >
                Boost
              </button>
            </>
          )}

          {/* Docked card */}
          <div
            className={`pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center p-4 transition-all duration-500 ${
              near ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            } ${active && touch ? 'sm:pb-4 pb-36' : ''}`}
          >
            {near && (
              <div className="glass pointer-events-auto w-full max-w-md rounded-2xl p-5 text-left" style={{ borderColor: `${near.hue}66` }}>
                <p className="eyebrow" style={{ color: near.hue }}>Docked · Department</p>
                <h3 className="display mt-2 text-2xl">{near.name}</h3>
                <p className="eyebrow mt-3 text-foam/60">{near.roles}</p>
                <p className="mt-2 text-sm leading-relaxed text-foam/75">{near.text}</p>
                <button type="button" onClick={() => applyFor(dock)} className="btn btn-primary mt-4 w-full">
                  Apply for {near.name} <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
