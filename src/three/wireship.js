// WIREFRAME SHIP — the "Departments" centrepiece (after Igloo's glowing line-art igloo).
//
// A cruise ship generated entirely from code as ONE LineSegments draw call. Every
// segment carries a `zone` id (0 Deck, 1 Engine, 2 Hospitality, 3 Entertainment,
// 4 Medical, 5 Administration, -1 hull). A uniform picks the active zone: its lines
// brighten and tint with the department colour, everything else dims, and a soft
// additive volume wraps the zone. Drag to orbit (vertical page-scroll still works
// on touch); it auto-rotates until touched.
//
// MEDIA HOOK: if config/media.js MODELS.ship.src is set, a GLB can replace the
// procedural hull — see `loadShipModel` (loaded lazily, nothing shipped otherwise).
import {
  Group,
  Mesh,
  LineSegments,
  Points,
  BufferGeometry,
  Float32BufferAttribute,
  ShaderMaterial,
  BoxGeometry,
  EdgesGeometry,
  Color,
  Vector3,
  AdditiveBlending,
  DoubleSide,
} from 'three'
import { createStage } from './stage.js'
import { DEPARTMENTS } from '../config/site.js'
import { MODELS } from '../config/media.js'

const TAU = Math.PI * 2
const L = 10 // ship length (x), bow = +x
const B = 1.9 // beam
const HULL_H = 0.9
const WATERLINE = 0.55

const smoothstep = (a, b, v) => {
  const t = Math.min(Math.max((v - a) / (b - a), 0), 1)
  return t * t * (3 - 2 * t)
}

// Half-breadth profile along the hull, x01 = 0 (stern) → 1 (bow)
function hullBreadth(x01) {
  if (x01 < 0.58) return 0.78 + 0.22 * smoothstep(0, 0.14, x01)
  const t = (x01 - 0.58) / 0.42
  return Math.pow(Math.max(1 - Math.pow(t, 1.7), 0), 0.75)
}
const xAt = (x01) => -L / 2 + L * x01
const hb = (x01, y01) => hullBreadth(x01) * (B / 2) * (0.55 + 0.45 * Math.pow(y01, 0.7))

// First matching rule decides which department a segment belongs to.
function zoneFor(x01, y, part) {
  if (part === 'funnel' || part === 'prop') return 1
  if (part === 'bridge' || part === 'mast') return 0
  if (part === 'cross') return 4
  if (y < WATERLINE && x01 < 0.5) return 1
  if (x01 >= 0.8 && y >= WATERLINE) return 0
  if (y >= 1.86 && x01 <= 0.64) return 3
  if (y >= 1.62 && x01 <= 0.5) return 3
  if (y >= 1.38 && y < 1.62 && x01 >= 0.58 && x01 <= 0.74) return 4
  if (x01 >= 0.62 && y >= HULL_H) return 5
  if (x01 >= 0.15 && x01 <= 0.62 && y >= HULL_H) return 2
  return -1
}

// Where each department's label pins to, and the bounding volume of its glow.
const ZONE_ANCHOR = [
  new Vector3(xAt(0.74), 2.5, 0), // 0 Deck — bridge
  new Vector3(xAt(0.34), 2.95, 0), // 1 Engine — funnel
  new Vector3(xAt(0.4), 1.3, 0.85), // 2 Hospitality — mid decks
  new Vector3(xAt(0.3), 2.25, 0), // 3 Entertainment — pool deck
  new Vector3(xAt(0.66), 1.5, 0.82), // 4 Medical — cross
  new Vector3(xAt(0.72), 1.0, 0.8), // 5 Administration
]
const ZONE_BOX = [
  { c: [xAt(0.78), 1.6, 0], s: [2.6, 1.6, 1.4] },
  { c: [xAt(0.28), 1.25, 0], s: [3.4, 2.6, 1.7] },
  { c: [xAt(0.38), 1.25, 0], s: [4.4, 0.55, 1.65] },
  { c: [xAt(0.33), 2.0, 0], s: [3.0, 0.7, 1.3] },
  { c: [xAt(0.66), 1.5, 0], s: [1.6, 0.34, 1.6] },
  { c: [xAt(0.72), 1.1, 0], s: [1.9, 0.9, 1.5] },
]

function buildShipLines() {
  const pos = []
  const zone = []
  const seg = (a, b, part) => {
    const mx = (a[0] + b[0]) / 2
    const my = (a[1] + b[1]) / 2
    const z = zoneFor((mx + L / 2) / L, my, part)
    pos.push(a[0], a[1], a[2], b[0], b[1], b[2])
    zone.push(z, z)
  }
  const poly = (pts, part, close = false) => {
    for (let i = 0; i < pts.length - 1; i++) seg(pts[i], pts[i + 1], part)
    if (close) seg(pts[pts.length - 1], pts[0], part)
  }

  // ── Hull ──
  const N = 44
  for (const y01 of [0, 0.3, 0.6, 1]) {
    const y = y01 * HULL_H
    const side = (s) =>
      Array.from({ length: N + 1 }, (_, i) => {
        const x01 = i / N
        return [xAt(x01), y, s * hb(x01, y01)]
      })
    poly(side(1))
    poly(side(-1))
    seg([xAt(0), y, hb(0, y01)], [xAt(0), y, -hb(0, y01)]) // transom
  }
  // keel + frames
  poly(Array.from({ length: N + 1 }, (_, i) => [xAt(i / N), 0, 0]))
  for (let i = 0; i <= 22; i++) {
    const x01 = i / 22
    const pts = []
    for (const [y01, s] of [[1, 1], [0.6, 1], [0.3, 1], [0, 0], [0.3, -1], [0.6, -1], [1, -1]]) {
      pts.push([xAt(x01), y01 * HULL_H, s * hb(x01, y01)])
    }
    poly(pts)
  }

  // ── Superstructure: stacked decks with window rows ──
  const decks = [
    [0.08, 0.84, 0.86], [0.1, 0.8, 0.82], [0.14, 0.76, 0.78], [0.2, 0.7, 0.7], [0.26, 0.62, 0.58],
  ]
  decks.forEach(([a, b, w], k) => {
    const y0 = HULL_H + k * 0.24
    const y1 = y0 + 0.24
    const half = (B / 2) * w
    const xa = xAt(a)
    const xb = xAt(b)
    const nose = 0.35 // chamfered forward corners
    const outline = (y) => [
      [xa, y, -half], [xa, y, half], [xb - nose, y, half], [xb, y, half * 0.45],
      [xb, y, -half * 0.45], [xb - nose, y, -half],
    ]
    poly(outline(y0), 'deck', true)
    poly(outline(y1), 'deck', true)
    outline(y0).forEach((p, i) => seg(p, [p[0], y1, p[2]], 'deck'))
    // window rows on both sides
    for (let x = xa + 0.35; x < xb - nose - 0.2; x += 0.34) {
      for (const s of [-1, 1]) seg([x, y0 + 0.12, s * half], [x + 0.18, y0 + 0.12, s * half], 'deck')
    }
  })

  // Lifeboats on the first deck
  for (let i = 0; i < 6; i++) {
    const x = xAt(0.28 + i * 0.07)
    for (const s of [-1, 1]) {
      const z = s * (B / 2) * 0.9
      poly([[x, HULL_H + 0.08, z], [x + 0.3, HULL_H + 0.08, z], [x + 0.3, HULL_H + 0.2, z], [x, HULL_H + 0.2, z]], 'deck', true)
    }
  }

  // Pool on the top aft deck (Entertainment)
  const py = HULL_H + 5 * 0.24
  const pool = [[xAt(0.3), py, -0.2], [xAt(0.42), py, -0.2], [xAt(0.42), py, 0.2], [xAt(0.3), py, 0.2]]
  poly(pool, 'deck', true)

  // Funnel (Engine): three oval rings + raked top + ribs
  const fx = xAt(0.34)
  const fyBase = py
  const ring = (y, rx, rz, dx = 0) => Array.from({ length: 21 }, (_, i) => [fx + dx + Math.cos((i / 20) * TAU) * rx, y, Math.sin((i / 20) * TAU) * rz])
  const rings = [ring(fyBase, 0.55, 0.3), ring(fyBase + 0.4, 0.5, 0.27, 0.05), ring(fyBase + 0.8, 0.45, 0.25, 0.14)]
  rings.forEach((r) => poly(r, 'funnel'))
  for (let i = 0; i < 20; i += 2) {
    seg(rings[0][i], rings[1][i], 'funnel')
    seg(rings[1][i], rings[2][i], 'funnel')
  }

  // Bridge + wings + mast (Deck)
  const bx0 = xAt(0.64)
  const bx1 = xAt(0.77)
  const by0 = HULL_H + 4 * 0.24
  const by1 = by0 + 0.34
  const bh = 0.62
  poly([[bx0, by0, -bh], [bx1, by0, -bh * 0.7], [bx1, by0, bh * 0.7], [bx0, by0, bh]], 'bridge', true)
  poly([[bx0, by1, -bh], [bx1, by1, -bh * 0.7], [bx1, by1, bh * 0.7], [bx0, by1, bh]], 'bridge', true)
  ;[[bx0, -bh], [bx1, -bh * 0.7], [bx1, bh * 0.7], [bx0, bh]].forEach(([x, z]) => seg([x, by0, z], [x, by1, z], 'bridge'))
  seg([bx0 + 0.1, by0, -1.05], [bx0 + 0.1, by0, 1.05], 'bridge') // wings
  seg([xAt(0.7), by1, 0], [xAt(0.7), by1 + 0.65, 0], 'mast')
  seg([xAt(0.7), by1 + 0.5, -0.25], [xAt(0.7), by1 + 0.5, 0.25], 'mast')

  // Medical cross on each flank
  for (const s of [-1, 1]) {
    const cx = xAt(0.66)
    const cy = HULL_H + 2 * 0.24 + 0.12
    const z = s * (B / 2) * 0.78 * 1.02
    seg([cx - 0.16, cy, z], [cx + 0.16, cy, z], 'cross')
    seg([cx, cy - 0.16, z], [cx, cy + 0.16, z], 'cross')
  }

  // Propeller + rudder (Engine)
  const prop = Array.from({ length: 25 }, (_, i) => [xAt(0.02), 0.28 + Math.cos((i / 24) * TAU) * 0.3, Math.sin((i / 24) * TAU) * 0.3])
  poly(prop, 'prop')
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * TAU
    seg([xAt(0.02), 0.28, 0], [xAt(0.02), 0.28 + Math.cos(a) * 0.3, Math.sin(a) * 0.3], 'prop')
  }

  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setAttribute('aZone', new Float32BufferAttribute(zone, 1))
  return g
}

const lineMat = (uniforms) =>
  new ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute float aZone;
      varying float vZone;
      varying float vY;
      void main(){
        vZone = aZone;
        vY = position.y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uBase, uHue;
      uniform float uActive, uMix, uTime;
      varying float vZone;
      varying float vY;
      void main(){
        float on = step(abs(vZone - uActive), 0.5) * step(-0.5, uActive);
        float dim = mix(1.0, 0.22, uMix * (1.0 - on));
        vec3 col = mix(uBase, uHue, on * uMix);
        float pulse = 1.0 + on * uMix * 0.3 * sin(uTime * 3.2);
        float a = 0.95 * dim * pulse;
        // slight fade of the hull below the waterline for depth
        a *= mix(0.72, 1.0, smoothstep(0.0, 0.6, vY));
        gl_FragColor = vec4(col * (1.0 + on * uMix * 0.7), a);
        #include <colorspace_fragment>
      }`,
  })

// Rippling reference grid under the ship + drifting "+" markers (Igloo's floating cells).
function buildWaterGrid() {
  const pos = []
  const R = 13
  const step = 0.9
  const n = Math.round(R / step)
  for (let i = -n; i <= n; i++) {
    for (let j = -n; j < n; j++) {
      pos.push(i * step, 0, j * step, i * step, 0, (j + 1) * step) // lines along z
      pos.push(j * step, 0, i * step, (j + 1) * step, 0, i * step) // lines along x
    }
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  const m = new ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uTime;
      varying float vA;
      void main(){
        vec3 p = position;
        p.y += sin(p.x * 0.7 + uTime * 0.9) * 0.07 + sin(p.z * 0.9 - uTime * 1.2) * 0.06;
        vA = 1.0 - smoothstep(3.0, 13.0, length(p.xz));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      varying float vA;
      void main(){
        gl_FragColor = vec4(0.49, 0.89, 0.84, vA * 0.16);
        #include <colorspace_fragment>
      }`,
  })
  const grid = new LineSegments(g, m)
  grid.position.y = WATERLINE
  return grid
}

function buildMarkers(count) {
  const pos = []
  for (let i = 0; i < count; i++) {
    const a = Math.random() * TAU
    const r = 6 + Math.random() * 9
    pos.push(Math.cos(a) * r, Math.random() * 6 - 0.5, Math.sin(a) * r)
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  const m = new ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uTime;
      void main(){
        vec3 p = position;
        p.y += sin(uTime * 0.4 + p.x) * 0.3;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = clamp(60.0 / -mv.z, 1.5, 4.0) * 2.0;
      }`,
    fragmentShader: /* glsl */ `
      void main(){
        vec2 c = abs(gl_PointCoord - 0.5);
        float plus = step(min(c.x, c.y), 0.06) * step(max(c.x, c.y), 0.5);   // "+" glyph
        if (plus < 0.5) discard;
        gl_FragColor = vec4(0.85, 0.97, 1.0, 0.5);
        #include <colorspace_fragment>
      }`,
  })
  return new Points(g, m)
}

/**
 * OPTIONAL: replace the procedural hull with the supplied model (config/media.js).
 * The model's edges are drawn with the same shader; department zones are guessed
 * from each edge's position along the ship, so highlighting still works.
 */
async function loadShipModel(group, material) {
  if (!MODELS.ship.src) return false
  const { loadShipModel: load } = await import('./model.js')
  const model = await load(MODELS.ship.src, { length: L })
  model.rotation.y = Math.PI / 2 // source bow is +Z, this scene's bow is +X
  model.updateMatrixWorld(true)
  const height = Math.max(model.userData.height, 0.001)
  const pos = []
  const zone = []
  model.traverse((o) => {
    if (!o.isMesh) return
    const g = new EdgesGeometry(o.geometry, 25)
    g.applyMatrix4(o.matrixWorld)
    const a = g.attributes.position
    for (let i = 0; i < a.count; i += 2) {
      const mx = (a.getX(i) + a.getX(i + 1)) / 2
      const my = (a.getY(i) + a.getY(i + 1)) / 2
      // express height in the procedural ship's units so the same zone rules apply
      const z = zoneFor((mx + L / 2) / L, (my / height) * 3.0)
      for (const k of [i, i + 1]) {
        pos.push(a.getX(k), a.getY(k), a.getZ(k))
        zone.push(z)
      }
    }
    g.dispose()
  })
  const geo = new BufferGeometry()
  geo.setAttribute('position', new Float32BufferAttribute(pos, 3))
  geo.setAttribute('aZone', new Float32BufferAttribute(zone, 1))
  group.add(new LineSegments(geo, material))
  return true
}

function build({ scene, camera, budget }) {
  scene.background = new Color('#061a2e')
  const ship = new Group()
  const uniforms = {
    uBase: { value: new Color('#bfe9ff') },
    uHue: { value: new Color('#7de3d6') },
    uActive: { value: -1 },
    uMix: { value: 0 },
    uTime: { value: 0 },
  }
  const mat = lineMat(uniforms)
  const lines = new LineSegments(buildShipLines(), mat)
  ship.add(lines)
  loadShipModel(ship, mat).then((replaced) => replaced && (lines.visible = false)).catch(() => {})

  // Glow volume around the active zone
  const glow = new Mesh(
    new BoxGeometry(1, 1, 1),
    new ShaderMaterial({
      uniforms: { uHue: uniforms.uHue, uAmt: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      side: DoubleSide,
      vertexShader: /* glsl */ `
        varying vec3 vN; varying vec3 vV;
        void main(){
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vN = normalize(normalMatrix * normal);
          vV = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uHue; uniform float uAmt;
        varying vec3 vN; varying vec3 vV;
        void main(){
          float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.0);
          gl_FragColor = vec4(uHue, (0.05 + f * 0.22) * uAmt);
          #include <colorspace_fragment>
        }`,
    }),
  )
  glow.visible = false
  ship.add(glow)

  const water = buildWaterGrid()
  const markers = buildMarkers(budget.snow > 300 ? 60 : 30)
  scene.add(ship, water, markers)

  // Orbit state
  const st = { yaw: -0.6, vel: 0.0, target: -0.6, dragging: false, auto: true, active: -1, mixT: 0, aspect: 1 }
  const labelPos = DEPARTMENTS.map(() => ({ x: 0, y: 0, vis: false }))
  const v = new Vector3()
  const gbox = { c: new Vector3(), s: new Vector3() }
  const labels = []

  function frameCamera() {
    const fov = camera.fov * (Math.PI / 180)
    const aspect = st.aspect
    const dist = Math.max((L * 0.56) / (Math.tan(fov / 2) * Math.min(aspect, 1.7)), 10)
    const pitch = 0.52
    camera.position.set(Math.sin(st.yaw) * Math.cos(pitch) * dist, Math.sin(pitch) * dist + 1, Math.cos(st.yaw) * Math.cos(pitch) * dist)
    camera.lookAt(0, 1.05, 0)
  }

  return {
    resize(w, h, aspect) {
      st.aspect = aspect
      camera.fov = aspect < 0.9 ? 40 : 30
      camera.updateProjectionMatrix()
      frameCamera()
    },
    update(dt, time) {
      uniforms.uTime.value = time
      water.material.uniforms.uTime.value = time
      markers.material.uniforms.uTime.value = time

      // orbit: inertia after drag, slow auto-rotate otherwise
      if (!st.dragging) {
        st.vel *= Math.exp(-3 * dt)
        st.yaw += st.vel * dt
        if (st.auto) st.yaw += 0.16 * dt
      }
      ship.rotation.z = Math.sin(time * 0.8) * 0.018
      ship.position.y = Math.sin(time * 1.1) * 0.04

      // emphasis transition + glow volume
      const goal = st.active >= 0 ? 1 : 0
      st.mixT += (goal - st.mixT) * (1 - Math.exp(-6 * dt))
      uniforms.uMix.value = st.mixT
      uniforms.uActive.value = st.active
      if (st.active >= 0) {
        const d = DEPARTMENTS[st.active]
        uniforms.uHue.value.set(d.hue)
        const b = ZONE_BOX[st.active]
        gbox.c.set(...b.c)
        gbox.s.set(...b.s)
        glow.position.lerp(gbox.c, 1 - Math.exp(-8 * dt))
        glow.scale.lerp(gbox.s, 1 - Math.exp(-8 * dt))
      }
      glow.visible = st.mixT > 0.02 && st.active >= 0
      glow.material.uniforms.uAmt.value = st.mixT

      frameCamera()
      ship.updateMatrixWorld(true)
      camera.updateMatrixWorld()

      // project label anchors into CSS pixels for the HTML hotspots
      const w = st.w || 1
      const h = st.h || 1
      ZONE_ANCHOR.forEach((a, i) => {
        v.copy(a).applyMatrix4(ship.matrixWorld).project(camera)
        const p = labelPos[i]
        p.x = (v.x * 0.5 + 0.5) * w
        p.y = (-v.y * 0.5 + 0.5) * h
        p.vis = v.z < 1
        const el = labels[i]
        if (el) {
          el.style.transform = `translate3d(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px,0)`
          el.style.opacity = p.vis ? '1' : '0'
        }
      })
    },
    // ── controls used by the React wrapper ──
    setSize(w, h) {
      st.w = w
      st.h = h
    },
    setLabels(els) {
      labels.length = 0
      els.forEach((e, i) => (labels[i] = e))
    },
    setActive(i) {
      st.active = i
    },
    drag(dx) {
      st.dragging = true
      st.auto = false
      st.yaw += dx * 0.008
      st.vel = dx * 0.008 * 60
    },
    release() {
      st.dragging = false
    },
    dispose() {},
  }
}

export function create(container, tier) {
  const stage = createStage(container, { tier, heavy: true, fov: 30, build, name: 'ship' })
  if (!stage) return null
  // keep CSS-pixel size available for label projection
  const ro = new ResizeObserver(() => stage.api.setSize(container.clientWidth, container.clientHeight))
  ro.observe(container)
  stage.api.setSize(container.clientWidth, container.clientHeight)
  const dispose = stage.dispose
  stage.dispose = () => {
    ro.disconnect()
    dispose()
  }
  return stage
}
