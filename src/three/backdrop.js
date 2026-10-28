// HERO BACKDROP — one fixed, full-screen WebGL scene behind the whole page.
//
//   scroll 0 ─────────────► hero end ─────────────────────────────► page end
//   dawn sky (lit clouds)     camera tilts down & DIVES    keeps sinking into the abyss
//   + detailed ocean          through the surface           bioluminescent jellyfish,
//   brass/glass helm, anchor,                               marine snow, light shafts
//   a cruise liner on the horizon
//
// Everything is driven by `scroll.heroP` (the dive) and `scroll.depth` (page
// progress) from the shared scroll store, so the 3D world and the DOM stay in
// lock-step. Visual references: Noomo (refractive glass forms on a pastel
// gradient, a jellyfish), Igloo (soft light + drifting particles).
//
// Premium finish: the glass and brass reflect an environment BAKED FROM THE SAME SKY
// shader (so highlights match the real clouds and sun); on desktop a bloom + highlight
// roll-off + vignette pass adds a filmic look, and glass really refracts the scene.
import {
  Group,
  Scene,
  Mesh,
  Points,
  LineSegments,
  BufferGeometry,
  BufferAttribute,
  Float32BufferAttribute,
  ShaderMaterial,
  PlaneGeometry,
  SphereGeometry,
  DirectionalLight,
  HemisphereLight,
  PMREMGenerator,
  FogExp2,
  Color,
  Vector3,
  AdditiveBlending,
  DoubleSide,
  NoToneMapping,
  ACESFilmicToneMapping,
} from 'three'
import { createEnv, createSky, createOcean, waveHeight } from './water.js'
import { makeMaterials, createHelm, createAnchor } from './hero-objects.js'
import { createCruiseShip } from './ship.js'
import { createPost } from './post.js'

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


// ── Bokeh motes ─────────────────────────────────────────────────────────────
// Soft out-of-focus discs drifting in the hero light — the cue that this was "shot",
// not rendered flat. Additive, no depth write, a single Points draw call.
function createBokeh(env, count) {
  const pos = new Float32Array(count * 3)
  const size = new Float32Array(count)
  const seed = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 24
    pos[i * 3 + 1] = 1.0 + Math.random() * 9
    pos[i * 3 + 2] = 1 + Math.random() * 11
    size[i] = 16 + Math.pow(Math.random(), 3) * 84
    seed[i] = Math.random()
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(pos, 3))
  g.setAttribute('aSize', new BufferAttribute(size, 1))
  g.setAttribute('aSeed', new BufferAttribute(seed, 1))
  const m = new ShaderMaterial({
    uniforms: { uTime: env.uTime, uPR: { value: 1 }, uAmt: { value: 1 }, uK: { value: 1 }, uTint: { value: new Color('#fff1de') } },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uTime, uPR, uAmt, uK;
      attribute float aSize, aSeed;
      varying float vA;
      void main(){
        vec3 p = position;
        p.y += sin(uTime * 0.25 + aSeed * 20.0) * 0.35;
        p.x += sin(uTime * 0.18 + aSeed * 11.0) * 0.4;
        vec4 mv = viewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float d = -mv.z;
        gl_PointSize = aSize * uK * uPR * (10.0 / d);
        vA = uAmt * (0.35 + 0.65 * fract(aSeed * 7.3)) * smoothstep(1.5, 5.0, d);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uTint;
      varying float vA;
      void main(){
        float r = length(gl_PointCoord - 0.5) * 2.0;
        float disc = smoothstep(1.0, 0.9, r);
        float ring = smoothstep(0.55, 0.95, r);       // brighter rim, like a real lens bokeh
        float a = disc * (0.35 + 0.65 * ring) * vA * 0.14;
        if (a < 0.003) discard;
        gl_FragColor = vec4(uTint, a);
        #include <colorspace_fragment>
      }`,
  })
  const p = new Points(g, m)
  p.frustumCulled = false
  return p
}

/** Render the sky shader into a cube and prefilter it: reflections now match the real clouds/sun. */
function bakeSkyEnvironment(renderer, env) {
  const s = new Scene()
  const dome = createSky(env, { cloudOct: 3, lit: false })
  s.add(dome)
  env.uBelow.value = 1 // below the horizon the environment shows sea, not more sky
  const pm = new PMREMGenerator(renderer)
  const rt = pm.fromScene(s, 0)
  pm.dispose()
  env.uBelow.value = 0
  dome.geometry.dispose()
  dome.material.dispose()
  return rt
}

// ── Scene ───────────────────────────────────────────────────────────────────
export function buildBackdrop({ renderer, scene, camera, budget }) {
  const env = createEnv()
  scene.add(createSky(env, { cloudOct: budget.cloudOct, lit: budget.cloudLit }))
  const ocean = createOcean(env, { radius: 420, rings: budget.oceanRings, seg: budget.oceanSeg, detail: budget.oceanDetail, reflOct: budget.reflOct })
  scene.add(ocean)
  // PBR objects (the ship, the hero pieces) share the horizon haze via normal scene fog.
  scene.fog = new FogExp2(env.uHorizon.value.clone(), env.uFogDensity.value)

  const envRT = bakeSkyEnvironment(renderer, env)
  scene.environment = envRT.texture

  const sun = new DirectionalLight('#ffe2bd', 2.6)
  sun.position.copy(env.uSunDir.value).multiplyScalar(30)
  scene.add(sun, new HemisphereLight('#dfe8ff', '#6f8fb5', 0.45))

  // Hero pieces: a brass-and-glass ship's wheel and a crystal anchor
  const mats = makeMaterials(budget.glass)
  const helm = createHelm(mats)
  const anchor = createAnchor(mats)
  const hero = new Group()
  hero.add(helm, anchor)
  scene.add(hero)

  // A cruise liner on the horizon
  const ship = createCruiseShip()
  ship.scale.setScalar(1.15)
  ship.rotation.y = -0.8
  scene.add(ship)

  const bokeh = budget.bokeh ? createBokeh(env, budget.bokeh) : null
  if (bokeh) scene.add(bokeh)

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

  // Post-processing (desktop): the composer owns tone mapping, so the renderer's is off while it runs.
  let post = null
  if (budget.post) {
    post = createPost(renderer, scene, camera, window.innerWidth, window.innerHeight)
    renderer.toneMapping = NoToneMapping
  }

  // Pointer parallax (desktop only — touch devices have no hover position)
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 }
  const onMove = (e) => {
    ptr.tx = (e.clientX / window.innerWidth) * 2 - 1
    ptr.ty = (e.clientY / window.innerHeight) * 2 - 1
  }
  const fine = matchMedia('(pointer: fine)').matches
  if (fine) window.addEventListener('pointermove', onMove, { passive: true })

  // Responsive layout of the hero pieces + horizon ship
  const layout = { helm: null, anchor: null, shipX: 52 }
  let pitchBias = 0 // portrait: look lower at rest so the horizon clears the body copy
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
    pitchBias = portrait ? 2.2 : 0
    const baseY = 5.6 - pitchBias
    const at = (fx, fy, z, scale) => ({ x: fx * halfW, y: baseY + fy * halfH, z, scale })
    layout.helm = portrait ? at(0.5, 0.3, 0, 0.8) : at(0.66, 0.0, 0, 1.4)
    layout.anchor = portrait ? at(-0.46, 0.07, 2, 0.52) : at(-0.58, -0.4, 2, 1.05)
    layout.shipX = portrait ? 6 : -4
  }

  const top = new Color()
  const bot = new Color()
  const mid = new Color()
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
    const tly = path(LOOK_Y, dive) - deep * 72 - pitchBias * (1 - smooth(0, 0.35, dive))
    const tlz = path(LOOK_Z, dive)
    cam.y = damp(cam.y, ty, 7, dt)
    cam.z = damp(cam.z, tz, 7, dt)
    cam.ly = damp(cam.ly, tly, 7, dt)
    cam.lz = damp(cam.lz, tlz, 7, dt)
    ptr.x = damp(ptr.x, ptr.tx, 3, dt)
    ptr.y = damp(ptr.y, ptr.ty, 3, dt)
    // a whisper of handheld drift so the frame is never perfectly still
    const sway = (1 - dive) * 0.06
    camera.position.set(ptr.x * 0.9 + Math.sin(time * 0.31) * sway, cam.y + ptr.y * -0.25 + Math.sin(time * 0.43) * sway, cam.z)
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
    mid.copy(bot).lerp(top, 0.342) // what the dome shows at the horizon = underwater fog colour
    env.uFogColor.value.copy(env.uHorizon.value).lerp(mid, sub)
    env.uFogDensity.value = 0.0042 + sub * (0.011 + D * 0.0004)
    scene.fog.color.copy(env.uFogColor.value)
    scene.fog.density = env.uFogDensity.value

    ocean.position.set(camera.position.x, 0, camera.position.z)
    ocean.visible = D < 60

    // Hero pieces: only drawn while they can be seen
    const showHero = dive < 0.82
    hero.visible = showHero
    if (showHero) {
      const L = layout
      helm.position.set(L.helm.x + ptr.x * 0.3, L.helm.y + Math.sin(time * 0.5) * 0.12 + dive * 3, L.helm.z)
      helm.scale.setScalar(L.helm.scale)
      helm.rotation.set(-0.14 + ptr.y * 0.14, -0.4 + ptr.x * 0.25 + Math.sin(time * 0.3) * 0.1, time * 0.05 + s.y * 0.0008)
      anchor.position.set(L.anchor.x + ptr.x * 0.5, L.anchor.y + Math.sin(time * 0.6 + 1.7) * 0.16 + dive * 4, L.anchor.z)
      anchor.scale.setScalar(L.anchor.scale)
      anchor.rotation.set(Math.sin(time * 0.4) * 0.08, -0.35 + Math.sin(time * 0.33) * 0.4 + ptr.x * 0.25, 0.3 + Math.sin(time * 0.35) * 0.1)
    }

    // Horizon ship: drifts, rides the swell, gone once we dive
    ship.visible = cam.y > 1.2 && dive < 0.75
    if (ship.visible) {
      ship.position.set(layout.shipX + Math.sin(time * 0.05) * 3, waveHeight(layout.shipX, -125, time) * 0.35 - 0.1, -125)
      ship.rotation.z = Math.sin(time * 0.55) * 0.012
    }

    if (bokeh) {
      bokeh.visible = sub < 0.5 && dive < 0.7
      bokeh.material.uniforms.uAmt.value = (1 - sub) * (1 - smooth(0.0, 0.6, dive))
      bokeh.material.uniforms.uPR.value = renderer.getPixelRatio()
      bokeh.material.uniforms.uK.value = Math.min(1, window.innerWidth / 1200)
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
      post?.setSize(w, h)
    },
    update,
    // take over rendering while post-processing is on
    render(dt) {
      if (!post?.enabled) return false
      post.render(dt)
      return true
    },
    // the governor calls this first when frames are slow: drop post-processing before any resolution
    quality(scale, w, h) {
      if (!post?.enabled) return
      if (scale < 0.85) {
        post.enabled = false
        renderer.toneMapping = ACESFilmicToneMapping
      } else post.setSize(w, h)
    },
    dispose() {
      window.removeEventListener('pointermove', onMove)
      post?.dispose()
      envRT.dispose()
      scene.environment = null
      scene.fog = null
    },
    get aspect() {
      return aspectNow
    },
  }
}
