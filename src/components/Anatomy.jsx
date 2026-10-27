import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Plus, Minus } from 'lucide-react'
import Split from './Split.jsx'
import Reveal from './Reveal.jsx'
import LazyStage from '../three/LazyStage.jsx'
import { DEPARTMENTS } from '../config/site.js'
import { bus } from '../lib/hooks.js'
import { scrollToId } from '../lib/scroll.js'

// DEPARTMENTS — an interactive wireframe cruise ship (three/wireship.js).
// Picking a department in the list lights up the matching zone of the ship;
// dragging the ship orbits it. It auto-cycles until the visitor interacts.
// With no WebGL the list still works on its own.
export default function Anatomy() {
  const [active, setActive] = useState(0)
  const [auto, setAuto] = useState(true)
  const stage = useRef(null)
  const labels = useRef([])
  const drag = useRef(null)

  const select = useCallback((i, manual = true) => {
    setActive(i)
    if (manual) setAuto(false)
  }, [])

  // keep the 3D scene in sync with the list
  useEffect(() => {
    stage.current?.api.setActive(active)
  }, [active])

  // gentle auto-cycle until the visitor takes over
  useEffect(() => {
    if (!auto) return
    const id = setInterval(() => setActive((a) => (a + 1) % DEPARTMENTS.length), 4200)
    return () => clearInterval(id)
  }, [auto])

  const onStage = useCallback(
    (s) => {
      stage.current = s
      if (s) {
        s.api.setLabels(labels.current)
        s.api.setActive(active)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const apply = (name) => {
    bus.emit('select-department', name)
    scrollToId('apply')
  }

  // orbit by dragging (vertical swipes still scroll the page: touch-action: pan-y)
  const down = (e) => {
    drag.current = e.clientX
    e.currentTarget.setPointerCapture?.(e.pointerId)
    setAuto(false)
  }
  const move = (e) => {
    if (drag.current == null) return
    stage.current?.api.drag(e.clientX - drag.current)
    drag.current = e.clientX
  }
  const up = () => {
    drag.current = null
    stage.current?.api.release()
  }

  return (
    <section id="departments" className="relative py-24 sm:py-32">
      <div className="container-x">
        <div className="max-w-3xl">
          <Reveal>
            <span className="eyebrow text-aqua">Onboard departments</span>
          </Reveal>
          <Split as="h2" className="display mt-5 block text-[clamp(2rem,5.6vw,5rem)]" text="Find your place in the crew" />
          <Reveal delay={150}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-foam/70">
              Whatever your trade or talent, there&apos;s a role for you on board. Pick a department to see where it lives on the ship —
              and drag the ship to turn it.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid items-start gap-8 lg:mt-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
          {/* 3D ship */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-24">
            <div
              className="relative aspect-[4/3] cursor-grab border border-foam/12 touch-pan-y select-none overflow-hidden rounded-3xl active:cursor-grabbing sm:aspect-[16/11]"
              style={{ touchAction: 'pan-y' }}
              onPointerDown={down}
              onPointerMove={move}
              onPointerUp={up}
              onPointerCancel={up}
              role="img"
              aria-label="Interactive wireframe of a cruise ship with the six onboard departments highlighted"
            >
              <LazyStage
                load={() => import('../three/wireship.js')}
                onStage={onStage}
                className="absolute inset-0"
                fallback={<div className="grid h-full place-items-center p-6 text-center text-sm text-foam/50">3D view unavailable on this device — see the department list.</div>}
              />
              {/* soft vignette over the canvas */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_50%,transparent_55%,rgba(2,10,20,0.6))]" />
              {/* hotspots — positioned every frame by the scene */}
              {DEPARTMENTS.map((d, i) => (
                <button
                  key={d.id}
                  ref={(el) => (labels.current[i] = el)}
                  type="button"
                  onClick={() => select(i)}
                  onPointerDown={(e) => e.stopPropagation()}
                  aria-label={`Highlight ${d.name}`}
                  className="absolute left-0 top-0 z-10 opacity-0 transition-opacity duration-300"
                  style={{ willChange: 'transform' }}
                >
                  <span className="relative flex -translate-x-1/2 -translate-y-1/2 items-center gap-2">
                    <span
                      className={`block rounded-full border transition-all duration-300 ${active === i ? 'h-3.5 w-3.5' : 'h-2.5 w-2.5 opacity-70'}`}
                      style={{ borderColor: d.hue, background: active === i ? d.hue : 'transparent', boxShadow: active === i ? `0 0 18px ${d.hue}` : 'none' }}
                    />
                    <span
                      className={`eyebrow whitespace-nowrap rounded-full bg-abyss/70 px-2.5 py-1 text-[0.6rem] backdrop-blur-sm transition-opacity duration-300 ${
                        active === i ? 'opacity-100' : 'opacity-0 sm:opacity-60'
                      }`}
                    >
                      {d.name}
                    </span>
                  </span>
                </button>
              ))}
              <span className="eyebrow pointer-events-none absolute bottom-4 left-5 text-[0.6rem] text-foam/40">Drag to rotate</span>
            </div>
          </div>

          {/* Department list */}
          <ul className="order-2 divide-y divide-foam/10 border-y border-foam/10 lg:order-1" aria-label="Departments">
            {DEPARTMENTS.map((d, i) => {
              const on = active === i
              return (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => select(i)}
                    onMouseEnter={() => matchMedia('(hover: hover)').matches && select(i)}
                    aria-expanded={on}
                    aria-controls={`dept-${d.id}`}
                    className="group flex w-full items-center gap-5 py-5 text-left sm:py-6"
                  >
                    <span className="num serif-i w-8 text-lg" style={{ color: on ? d.hue : 'rgba(244,246,251,.4)' }}>
                      0{i + 1}
                    </span>
                    <span className={`display flex-1 text-[clamp(1.35rem,2.6vw,2.1rem)] transition-opacity ${on ? 'opacity-100' : 'opacity-55 group-hover:opacity-90'}`}>
                      {d.name}
                    </span>
                    <span className="grid h-9 w-9 place-items-center rounded-full border border-foam/20 transition-colors" style={on ? { background: d.hue, color: '#07101d', borderColor: d.hue } : undefined}>
                      {on ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </span>
                  </button>
                  <div id={`dept-${d.id}`} role="region" className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${on ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <div className="pb-6 pl-[3.25rem] pr-2">
                        <p className="eyebrow mb-3 text-foam/60">{d.roles}</p>
                        <p className="max-w-md leading-relaxed text-foam/75">{d.text}</p>
                        <button
                          type="button"
                          onClick={() => apply(d.name)}
                          tabIndex={on ? 0 : -1}
                          className="eyebrow mt-5 inline-flex items-center gap-2 border-b border-foam/40 pb-1 transition-colors hover:border-foam"
                        >
                          Apply for {d.name} <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
