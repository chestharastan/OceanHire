// HERO BACKDROP — one fixed, full-screen WebGL scene behind the whole page.
//
//   scroll 0 ─────────────► hero end ─────────────────────────────► page end
//   pastel dawn sky + ocean   camera tilts down & DIVES    keeps sinking into the abyss
//   glass anchor / helm /     through the surface           bioluminescent jellyfish,
//   compass floating above                                  marine snow, light shafts
//
// Everything is driven by `scroll.heroP` (the dive) and `scroll.depth` (page
// progress) from the shared scroll store, so the 3D world and the DOM stay in
// lock-step. Visual references: Noomo (frosted pearly 3D forms on a pastel
// gradient, a jellyfish), Igloo (soft light + drifting particles).
import {
  Group,
  Mesh,
  Points,
  LineSegments,
  BufferGeometry,
  BufferAttribute,
  Float32BufferAttribute,
  ShaderMaterial,
  PlaneGeometry,
  SphereGeometry,
  CylinderGeometry,
  TorusGeometry,
  ConeGeometry,
  ExtrudeGeometry,
  Shape,
  MeshPhysicalMaterial,
  DirectionalLight,
  HemisphereLight,
  PMREMGenerator,
  Color,
  Vector3,
  AdditiveBlending,
  DoubleSide,
} from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { createEnv, createSky, createOcean } from './water.js'

const TAU = Math.PI * 2
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)
const smooth = (a, b, v) => {
  const t = clamp01((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const damp = (cur, target, rate, dt) => cur + (target - cur) * (1 - Math.exp(-rate * dt))

/** Smooth path through [x, value] keys (cubic Hermite, finite-difference tangents). */
function path(keys, x) {
  const n = keys.length
  if (x <= keys[0][0]) return keys[0][1]
  if (x >= keys[n - 1][0]) return keys[n - 1][1]
  let i = 1
  while (keys[i][0] < x) i++
  const [x0, y0] = keys[i - 1]
  const [x1, y1] = keys[i]
  const m0 = i > 1 ? (y1 - keys[i - 2][1]) / (x1 - keys[i - 2][0]) : (y1 - y0) / (x1 - x0)
  const m1 = i < n - 1 ? (keys[i + 1][1] - y0) / (keys[i + 1][0] - x0) : (y1 - y0) / (x1 - x0)
  const h = x1 - x0
  const t = (x - x0) / h
  const t2 = t * t
  const t3 = t2 * t
  return (2 * t3 - 3 * t2 + 1) * y0 + (t3 - 2 * t2 + t) * h * m0 + (-2 * t3 + 3 * t2) * y1 + (t3 - t2) * h * m1
}

// Camera dive keyframes over hero progress s = 0..1
const CAM_Y = [[0, 3.6], [0.35, 1.7], [0.6, 0.0], [0.8, -3.4], [1, -8]]
const CAM_Z = [[0, 14], [0.35, 12], [0.6, 9.5], [0.8, 7.5], [1, 6.5]]
const LOOK_Y = [[0, 6.0], [0.35, 2.6], [0.6, -1.4], [0.8, -7], [1, -14]]
const LOOK_Z = [[0, 0], [0.4, -2], [1, -3]]

// Underwater colour ramp by depth (units below the surface)
const UW = [
  [0, new Color('#3ba8c6'), new Color('#0f4f78')],
  [14, new Color('#1b6b93'), new Color('#0a3354')],
  [45, new Color('#0b3a5c'), new Color('#061f36')],
  [95, new Color('#051d33'), new Color('#020a14')],
]
function underwater(D, outTop, outBot) {
  let i = 1
  while (i < UW.length - 1 && D > UW[i][0]) i++
  const [d0, t0, b0] = UW[i - 1]
  const [d1, t1, b1] = UW[i]
  const k = clamp01((D - d0) / (d1 - d0))
  outTop.copy(t0).lerp(t1, k)
  outBot.copy(b0).lerp(b1, k)
}

// ── Glass hero pieces ───────────────────────────────────────────────────────
function buildAnchor() {
  const parts = []
  parts.push(new CylinderGeometry(0.09, 0.09, 2.6, 18))
  const stock = new CylinderGeometry(0.075, 0.075, 1.3, 14)
  stock.rotateZ(Math.PI / 2)
  stock.translate(0, 0.75, 0)
  parts.push(stock)
  const ring = new TorusGeometry(0.24, 0.06, 12, 28)
  ring.translate(0, 1.55, 0)
  parts.push(ring)
  const arms = new TorusGeometry(0.95, 0.095, 14, 44, Math.PI)
  arms.rotateZ(Math.PI)
  arms.translate(0, -0.35, 0)
  parts.push(arms)
  for (const sx of [-1, 1]) {
    const fluke = new ConeGeometry(0.26, 0.62, 5)
    fluke.rotateZ(-sx * 0.55)
    fluke.translate(sx * 0.98, -0.2, 0)
    parts.push(fluke)
  }
  const g = mergeGeometries(parts)
  parts.forEach((p) => p.dispose())
  return g
}

function buildHelm() {
  const parts = [new TorusGeometry(1.0, 0.085, 16, 64)]
  parts.push(new SphereGeometry(0.22, 20, 14))
  for (let i = 0; i < 4; i++) {
    const spoke = new CylinderGeometry(0.04, 0.04, 2.5, 10)
    spoke.rotateZ((i * Math.PI) / 4)
    parts.push(spoke)
  }
  for (let i = 0; i < 8; i++) {
    const handle = new CylinderGeometry(0.055, 0.045, 0.55, 10)
    handle.translate(0, 1.28, 0)
    handle.rotateZ((i * TAU) / 8)
    parts.push(handle)
  }
  const g = mergeGeometries(parts)
  parts.forEach((p) => p.dispose())
  return g
}

function buildStar() {
  const s = new Shape()
  const pts = 8
  for (let i = 0; i < pts * 2; i++) {
    const a = (i / (pts * 2)) * TAU - Math.PI / 2
    const major = i % 4 === 0
    const r = i % 2 === 1 ? 0.3 : major ? 1.35 : 0.85
    const x = Math.cos(a) * r
    const y = Math.sin(a) * r
    i === 0 ? s.moveTo(x, y) : s.lineTo(x, y)
  }
  s.closePath()
  const g = new ExtrudeGeometry(s, { depth: 0.22, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 2 })
  g.center()
  return g
}

// ── Jellyfish ───────────────────────────────────────────────────────────────
function createJelly(env, { tentacles, colA, colB, phase }) {
  const own = {
    uPhase: { value: phase },
    uColA: { value: new Color(colA) },
    uColB: { value: new Color(colB) },
  }
  const bell = new Mesh(
    new SphereGeometry(1, 26, 14, 0, TAU, 0, Math.PI * 0.52),
    new ShaderMaterial({
      uniforms: { ...env, ...own },
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      side: DoubleSide,
      vertexShader: /* glsl */ `
        uniform float uTime, uPhase;
        varying vec3 vN; varying vec3 vWorld; varying vec3 vLocal;
        void main(){
          vec3 p = position;
          float pulse = sin(uTime * 1.6 + uPhase);
          p.xz *= 1.0 + 0.10 * pulse;
          p.y  *= 1.0 - 0.14 * pulse;
          p.xz *= 1.0 + smoothstep(0.35, 0.0, position.y) * 0.15 * pulse;   // flaring rim
          vLocal = position;
          vN = normalize(mat3(modelMatrix) * normal);
          vec4 wp = modelMatrix * vec4(p, 1.0);
          vWorld = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColA, uColB, uFogColor;
        uniform float uFogDensity, uDim;
        varying vec3 vN; varying vec3 vWorld; varying vec3 vLocal;
        void main(){
          vec3 V = normalize(cameraPosition - vWorld);
          float fres = pow(1.0 - abs(dot(normalize(vN), V)), 2.2);
          float h = clamp(vLocal.y, 0.0, 1.0);
          float veins = pow(abs(sin(atan(vLocal.z, vLocal.x) * 8.0)), 10.0) * (1.0 - h);
          vec3 col = mix(uColB, uColA, h) * (0.55 + fres * 1.1) + uColA * veins * 0.5;
          float a = 0.10 + fres * 0.75 + veins * 0.14 + smoothstep(0.3, 0.0, h) * 0.3;
          float dist = distance(cameraPosition, vWorld);
          float f = (1.0 - exp(-pow(dist * uFogDensity, 2.0))) * 0.6;
          gl_FragColor = vec4(col, a * (1.0 - f) * uDim);
          #include <colorspace_fragment>
        }`,
    }),
  )

  // Tentacles: thin additive lines animated entirely on the GPU.
  const S = 22
  const data = []
  for (let i = 0; i < tentacles; i++) {
    const a = (i / tentacles) * TAU
    const seed = Math.random()
    for (let s = 0; s < S; s++) {
      data.push(a, s / S, seed, a, (s + 1) / S, seed)
    }
  }
  const geo = new BufferGeometry()
  geo.setAttribute('position', new Float32BufferAttribute(new Float32Array((data.length / 3) * 3), 3))
  geo.setAttribute('aData', new Float32BufferAttribute(data, 3))
  const lines = new LineSegments(
    geo,
    new ShaderMaterial({
      uniforms: { ...env, ...own, uLen: { value: 2.4 } },
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      vertexShader: /* glsl */ `
        attribute vec3 aData;
        uniform float uTime, uPhase, uLen;
        varying float vT; varying vec3 vWorld;
        void main(){
          float a = aData.x; float t = aData.y; float seed = aData.z;
          float pulse = sin(uTime * 1.6 + uPhase);
          float R = 0.78 * (1.0 + 0.10 * pulse);
          vec3 p = vec3(cos(a) * R, -0.02, sin(a) * R);
          float L = uLen * (0.7 + 0.6 * fract(seed * 7.13));
          p.y -= t * L;
          p.x += sin(t * 5.0 - uTime * 1.8 + seed * 6.28) * 0.18 * t + cos(a) * t * 0.15 * (1.0 - pulse * 0.5);
          p.z += cos(t * 4.0 - uTime * 1.5 + seed * 3.10) * 0.18 * t + sin(a) * t * 0.15 * (1.0 - pulse * 0.5);
          vT = t;
          vec4 wp = modelMatrix * vec4(p, 1.0);
          vWorld = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColA, uColB;
        uniform float uFogDensity, uDim;
        varying float vT; varying vec3 vWorld;
        void main(){
          float dist = distance(cameraPosition, vWorld);
          float f = (1.0 - exp(-pow(dist * uFogDensity, 2.0))) * 0.6;
          vec3 col = mix(uColA, uColB, vT);
          gl_FragColor = vec4(col, ((1.0 - vT) * 0.75 + 0.08) * (1.0 - f) * uDim);
          #include <colorspace_fragment>
        }`,
    }),
  )
  const g = new Group()
  g.add(bell, lines)
  return g
}

// ── Marine snow ─────────────────────────────────────────────────────────────
function createSnow(env, count) {
  const pos = new Float32Array(count * 3)
  const seed = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    pos[i * 3] = Math.random()
    pos[i * 3 + 1] = Math.random()
    pos[i * 3 + 2] = Math.random()
    seed[i] = Math.random()
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(pos, 3))
  g.setAttribute('aSeed', new BufferAttribute(seed, 1))
  const m = new ShaderMaterial({
    uniforms: { uTime: env.uTime, uSub: env.uSub, uPR: { value: 1 }, uTint: { value: new Color('#bfeef0') } },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uTime, uSub, uPR;
      attribute float aSeed;
      varying float vA;
      void main(){
        vec3 box = vec3(38.0, 54.0, 38.0);
        vec3 q = position * box;
        q.y -= uTime * (0.25 + aSeed * 0.3);                 // slow fall
        q.x += sin(uTime * 0.3 + aSeed * 20.0) * 0.8;        // lazy drift
        q = mod(q - cameraPosition + box * 0.5, box) - box * 0.5;  // wrap the volume around the camera
        vec4 mv = viewMatrix * vec4(q + cameraPosition, 1.0);
        gl_Position = projectionMatrix * mv;
        float d = -mv.z;
        gl_PointSize = clamp(70.0 / d * uPR * (0.6 + aSeed), 1.0, 12.0 * uPR);
        vA = uSub * smoothstep(42.0, 5.0, d) * (0.3 + 0.7 * aSeed);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uTint;
      varying float vA;
      void main(){
        float r = length(gl_PointCoord - 0.5) * 2.0;
        float a = smoothstep(1.0, 0.1, r) * vA;
        if (a < 0.01) discard;
        gl_FragColor = vec4(uTint, a);
        #include <colorspace_fragment>
      }`,
  })
  const p = new Points(g, m)
  p.frustumCulled = false
  return p
}

// ── Light shafts ────────────────────────────────────────────────────────────
function createShafts(env, count) {
  const group = new Group()
  const geo = new PlaneGeometry(1, 1)
  for (let i = 0; i < count; i++) {
    const mat = new ShaderMaterial({
      uniforms: { uShaft: env.uShaft, uTime: env.uTime, uAmt: env.uShaftAmt, uSeed: { value: Math.random() } },
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      side: DoubleSide,
      vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uShaft; uniform float uTime, uAmt, uSeed;
        varying vec2 vUv;
        void main(){
          float side = pow(1.0 - abs(vUv.x - 0.5) * 2.0, 1.6);
          float vert = pow(vUv.y, 1.5);
          float flick = 0.72 + 0.28 * sin(uTime * 0.6 + uSeed * 6.0 + vUv.y * 3.0);
          float a = side * vert * flick * uAmt * 0.22;
          if (a < 0.002) discard;
          gl_FragColor = vec4(uShaft, a);
          #include <colorspace_fragment>
        }`,
    })
    const m = new Mesh(geo, mat)
    m.scale.set(2.2 + Math.random() * 3.2, 110, 1)
    m.position.set((Math.random() - 0.5) * 36, -30, -6 - Math.random() * 26)
    m.rotation.y = (Math.random() - 0.5) * 1.2
    m.rotation.z = 0.28 + (Math.random() - 0.5) * 0.12
    group.add(m)
  }
  return group
}

// ── Scene ───────────────────────────────────────────────────────────────────
export function buildBackdrop({ renderer, scene, camera, budget }) {
  const env = createEnv()
  scene.add(createSky(env))
  const ocean = createOcean(env, { radius: 420, rings: budget.oceanRings, seg: budget.oceanSeg })
  scene.add(ocean)

  // Image-based lighting: a studio "room" gives the glass pieces crisp reflections.
  const pmrem = new PMREMGenerator(renderer)
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04)
  scene.environment = envRT.texture
  pmrem.dispose()

  const sun = new DirectionalLight('#ffe2bd', 2.4)
  sun.position.copy(env.uSunDir.value).multiplyScalar(30)
  scene.add(sun, new HemisphereLight('#dfe8ff', '#6f8fb5', 0.6))

  // Glass pieces — pearly, iridescent, no transmission pass (cheap on phones).
  const mat = (color) =>
    new MeshPhysicalMaterial({
      color,
      roughness: 0.14,
      metalness: 0.1,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      iridescence: 0.7,
      iridescenceIOR: 1.35,
      iridescenceThicknessRange: [120, 420],
      envMapIntensity: 1.15,
    })
  const shapes = new Group()
  const anchor = new Mesh(buildAnchor(), mat('#eef2fb'))
  const helm = new Mesh(buildHelm(), mat('#e0e9fb'))
  const star = new Mesh(buildStar(), mat('#fbeade'))
  const pearlGeo = new SphereGeometry(1, 32, 20)
  const pearls = [0.34, 0.22, 0.46].map((r, i) => {
    const p = new Mesh(pearlGeo, mat(['#f6f0ff', '#e6f3fb', '#fdeee6'][i]))
    p.scale.setScalar(r)
    return p
  })
  shapes.add(anchor, helm, star, ...pearls)
  scene.add(shapes)

  // Underwater life
  const jellyDefs = [
    { p: [-4.5, -16, -7], s: 1.5, a: '#c66bff', b: '#5a2bd6', ph: 0.0 },
    { p: [6.5, -30, -13], s: 2.2, a: '#6fe0d2', b: '#1d6a8f', ph: 1.7 },
    { p: [-8.0, -48, -15], s: 2.7, a: '#ff8fd0', b: '#8a2bd6', ph: 3.1 },
    { p: [7.0, -66, -9], s: 1.9, a: '#8fd3ff', b: '#3b4bd6', ph: 4.4 },
  ].slice(0, budget.jellies)
  const jellies = jellyDefs.map((d) => {
    const j = createJelly(env, { tentacles: budget.tentacles, colA: d.a, colB: d.b, phase: d.ph })
    j.scale.setScalar(d.s)
    j.position.set(...d.p)
    scene.add(j)
    return { obj: j, ...d }
  })
  const snow = createSnow(env, budget.snow)
  scene.add(snow)
  const shafts = createShafts(env, budget.jellies > 1 ? 7 : 4)
  scene.add(shafts)

  // Pointer parallax (desktop only — touch devices have no hover position)
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 }
  const onMove = (e) => {
    ptr.tx = (e.clientX / window.innerWidth) * 2 - 1
    ptr.ty = (e.clientY / window.innerHeight) * 2 - 1
  }
  const fine = matchMedia('(pointer: fine)').matches
  if (fine) window.addEventListener('pointermove', onMove, { passive: true })

  // Responsive layout of the floating pieces
  const layout = { anchor: null, helm: null, star: null, pearls: [] }
  let jellyK = 1
  function place(aspect) {
    const portrait = aspect < 0.9
    jellyK = portrait ? 0.55 : 1
    env.uDim.value = portrait ? 0.5 : 0.78
    camera.fov = portrait ? 64 : 48
    camera.updateProjectionMatrix()
    const dist = 12
    const halfH = Math.tan((camera.fov * Math.PI) / 360) * dist
    const halfW = halfH * aspect
    const k = portrait ? 0.62 : 1
    const baseY = 5.6
    const at = (fx, fy, z, scale) => ({ x: fx * halfW, y: baseY + fy * halfH, z, scale })
    layout.anchor = portrait ? at(0.52, 0.18, 2, 1.0 * k) : at(0.56, 0.02, 2, 1.0)
    layout.helm = portrait ? at(-0.6, -0.3, 3.5, 0.95 * k) : at(-0.74, -0.2, 3.5, 0.9)
    layout.star = portrait ? at(0.05, 0.72, 0, 0.7 * k) : at(-0.12, 0.62, 0, 0.7)
    layout.pearls = [at(0.1, -0.1, 5, 1), at(0.86, 0.5, 1, 1), at(-0.35, 0.05, 6, 1)]
    anchor.scale.setScalar(layout.anchor.scale)
    helm.scale.setScalar(layout.helm.scale)
    star.scale.setScalar(layout.star.scale)
  }

  const col = new Color()
  const top = new Color()
  const bot = new Color()
  const look = new Vector3()
  const cam = { y: 3.6, z: 14, ly: 6, lz: 0 }
  let aspectNow = 1

  function update(dt, time, s) {
    env.uTime.value = time
    const dive = s.heroP
    const deep = clamp01((s.y - s.heroLen) / Math.max(s.docH - s.vh - s.heroLen, 1))

    // Camera path: scripted dive during the hero, then a slow descent for the rest of the page.
    const ty = path(CAM_Y, dive) - deep * 72
    const tz = path(CAM_Z, dive)
    const tly = path(LOOK_Y, dive) - deep * 72
    const tlz = path(LOOK_Z, dive)
    cam.y = damp(cam.y, ty, 7, dt)
    cam.z = damp(cam.z, tz, 7, dt)
    cam.ly = damp(cam.ly, tly, 7, dt)
    cam.lz = damp(cam.lz, tlz, 7, dt)
    ptr.x = damp(ptr.x, ptr.tx, 3, dt)
    ptr.y = damp(ptr.y, ptr.ty, 3, dt)
    camera.position.set(ptr.x * 0.9, cam.y + ptr.y * -0.25, cam.z)
    look.set(ptr.x * 0.5, cam.ly, cam.lz)
    camera.lookAt(look)

    // Above / below the surface
    const D = Math.max(0, -cam.y)
    const sub = smooth(0.5, -0.8, cam.y)
    env.uSub.value = sub
    underwater(D, top, bot)
    env.uDeepTop.value.copy(top)
    env.uDeepBottom.value.copy(bot)
    env.uShaftAmt.value = sub * Math.exp(-D / 40)
    col.copy(bot).lerp(top, 0.342) // what the dome shows at the horizon = underwater fog colour
    env.uFogColor.value.copy(env.uHorizon.value).lerp(col, sub)
    env.uFogDensity.value = 0.0042 + sub * (0.011 + D * 0.0004)

    ocean.position.set(camera.position.x, 0, camera.position.z)
    ocean.visible = D < 60

    // Floating glass pieces: only drawn while they can be seen
    const showShapes = dive < 0.82
    shapes.visible = showShapes
    if (showShapes) {
      const L = layout
      // Pieces sway back and forth rather than spinning, so the thin anchor/star never go edge-on.
      const spin = Math.sin(time * 0.33 + s.y * 0.0009)
      const set = (m, l, i, rx, ry, rz) => {
        m.position.set(l.x + ptr.x * 0.25 * (i + 1), l.y + Math.sin(time * 0.6 + i * 1.7) * 0.18 + dive * 3, l.z)
        m.rotation.set(rx, ry, rz)
      }
      set(anchor, L.anchor, 0, Math.sin(time * 0.4) * 0.12, spin * 0.75 + ptr.x * 0.3, Math.sin(time * 0.35) * 0.14 - 0.1)
      set(helm, L.helm, 1, -0.2 + ptr.y * 0.2, -0.35 + ptr.x * 0.3 + spin * 0.25, time * 0.12)
      set(star, L.star, 2, Math.sin(time * 0.5) * 0.3, spin * 0.9, 0.2)
      pearls.forEach((p, i) => {
        const l = L.pearls[i]
        p.position.set(l.x, l.y + Math.sin(time * 0.7 + i * 2.1) * 0.25 + dive * 4, l.z)
      })
    }

    // Underwater creatures: skip entirely while still above the surface
    const under = cam.y < 6
    jellies.forEach((j, i) => {
      j.obj.visible = under
      if (!under) return
      j.obj.scale.setScalar(j.s * jellyK)
      const t = time * 0.12 + i * 2
      j.obj.position.x = j.p[0] + Math.sin(t) * 1.6
      j.obj.position.y = j.p[1] + Math.sin(time * 0.5 + i) * 0.6
      j.obj.rotation.y = time * 0.08 + i
    })
    snow.visible = sub > 0.02
    snow.material.uniforms.uPR.value = renderer.getPixelRatio()
    shafts.visible = env.uShaftAmt.value > 0.01
  }

  return {
    resize(w, h, aspect) {
      aspectNow = aspect
      place(aspect)
    },
    update,
    dispose() {
      window.removeEventListener('pointermove', onMove)
      envRT.dispose()
      scene.environment = null
    },
    get aspect() {
      return aspectNow
    },
  }
}
