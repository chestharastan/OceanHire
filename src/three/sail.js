// SAIL THE MAP — an arcade sailing world, our take on Bruno Simon's drivable portfolio.
// Instead of driving a car between projects you sail a small cruise boat between the
// six department islands. Sail up to a port (the glowing ring) to dock and read the roles.
//
// • Same Gerstner ocean + sky as the hero (three/water.js) in a golden-hour palette
// • Boat physics are a few lines of arcade maths (thrust, drag, speed-scaled turning),
//   no physics engine — circles for island collisions
// • The boat bobs on the REAL wave height via waveHeight() (CPU mirror of the shader)
// • Islands are procedural low-poly (displaced icosahedrons, vertex colours) and all palm
//   trees are two InstancedMeshes; the whole scene is ~30 draw calls
// MEDIA HOOK: MODELS.ship.src (config/media.js) replaces the procedural boat with a GLB.
import {
  Group,
  Mesh,
  Points,
  InstancedMesh,
  Object3D,
  IcosahedronGeometry,
  CylinderGeometry,
  ConeGeometry,
  TorusGeometry,
  ExtrudeGeometry,
  BoxGeometry,
  BufferGeometry,
  BufferAttribute,
  Shape,
  Color,
  FogExp2,
  MeshLambertMaterial,
  MeshBasicMaterial,
  ShaderMaterial,
  DirectionalLight,
  HemisphereLight,
  AdditiveBlending,
  DoubleSide,
  Vector3,
} from 'three'
import { createStage } from './stage.js'
import { createEnv, createSky, createOcean, waveHeight } from './water.js'
import { DEPARTMENTS } from '../config/site.js'
import { MODELS } from '../config/media.js'

const TAU = Math.PI * 2
const WORLD = 150 // sailable radius
const DOCK_RANGE = 7

// Cheap deterministic hash → [0,1)
const rnd = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

function buildIsland(r, hue, seed) {
  const geo = new IcosahedronGeometry(1, 2)
  const pos = geo.attributes.position
  const col = new Float32Array(pos.count * 3)
  const sand = new Color('#ead7a4')
  const grass = new Color('#5fae6a')
  const grassDark = new Color('#3f8a58')
  const rock = new Color(hue).lerp(new Color('#7a8a86'), 0.65)
  const c = new Color()
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i)
    let y = pos.getY(i)
    let z = pos.getZ(i)
    // noise is a pure function of position, so shared corners of flat faces stay welded
    const n = 0.13 * Math.sin(3.1 * x + seed) * Math.sin(2.7 * y + seed * 0.7) + 0.1 * Math.sin(4.3 * z + seed * 1.3)
    x *= r * (1 + n)
    z *= r * (1 + n)
    y *= r * 0.34 * (1 + n * 1.6)
    pos.setXYZ(i, x, y, z)
    const t = y / (r * 0.34)
    if (t < 0.12) c.copy(sand)
    else if (t < 0.55) c.copy(grass).lerp(grassDark, rnd(i) * 0.5)
    else c.copy(grassDark).lerp(rock, Math.min((t - 0.55) * 2.2, 1))
    col[i * 3] = c.r
    col[i * 3 + 1] = c.g
    col[i * 3 + 2] = c.b
  }
  geo.setAttribute('color', new BufferAttribute(col, 3))
  geo.computeVertexNormals() // non-indexed → flat, faceted low-poly look
  return geo
}

function buildBoat() {
  const boat = new Group()
  const hullShape = (s) => {
    const sh = new Shape()
    sh.moveTo(-0.75 * s, 2)
    sh.lineTo(0.75 * s, 2)
    sh.lineTo(0.8 * s, -0.6)
    sh.quadraticCurveTo(0.6 * s, -1.6, 0, -2.3)
    sh.quadraticCurveTo(-0.6 * s, -1.6, -0.8 * s, -0.6)
    sh.closePath()
    return sh
  }
  const extrude = (shape, depth) => {
    const g = new ExtrudeGeometry(shape, { depth, bevelEnabled: false })
    g.rotateX(-Math.PI / 2) // extrusion axis → up, shape's -y (bow) → +z (forward)
    return g
  }
  const lower = new Mesh(extrude(hullShape(0.96), 0.4), new MeshLambertMaterial({ color: '#0d3556' }))
  lower.position.y = -0.1
  const upper = new Mesh(extrude(hullShape(1), 0.38), new MeshLambertMaterial({ color: '#f4f6fb' }))
  upper.position.y = 0.3
  const cabin = new Mesh(new BoxGeometry(1.15, 0.62, 1.4), new MeshLambertMaterial({ color: '#eaeef7' }))
  cabin.position.set(0, 0.99, -0.35)
  const glass = new Mesh(new BoxGeometry(1.18, 0.2, 1.0), new MeshLambertMaterial({ color: '#0b1b2e' }))
  glass.position.set(0, 1.05, -0.2)
  const funnel = new Mesh(new CylinderGeometry(0.2, 0.26, 0.7, 10), new MeshLambertMaterial({ color: '#f3c892' }))
  funnel.position.set(0, 1.55, -0.85)
  boat.add(lower, upper, cabin, glass, funnel)
  boat.scale.setScalar(1.1)
  return boat
}

function build({ scene, camera, budget }) {
  // ── World ──
  const palette = { sun: '#ffcf9a', horizon: '#f9d9bf', zenith: '#8fb1dc', deep: '#16507a', shallow: '#47a3b8' }
  const env = createEnv(palette)
  env.uSunDir.value.set(-0.5, 0.22, -0.8).normalize()
  env.uFogDensity.value = 0.0036
  scene.fog = new FogExp2(palette.horizon, 0.0036)
  scene.add(createSky(env))
  const ocean = createOcean(env, { radius: 330, rings: budget.oceanRings, seg: budget.oceanSeg })
  scene.add(ocean)

  const sun = new DirectionalLight('#ffd9a8', 2.6)
  sun.position.set(-50, 40, -80)
  scene.add(sun, new HemisphereLight('#cfe0ff', '#5a7a6a', 1.0))

  // ── Islands ──
  const islandMat = new MeshLambertMaterial({ vertexColors: true, flatShading: true })
  const islands = DEPARTMENTS.map((d, i) => {
    const { x, z, r } = d.island
    const g = new Group()
    g.position.set(x, -r * 0.04, z)
    g.add(new Mesh(buildIsland(r, d.hue, i * 7.3 + 1), islandMat))
    scene.add(g)
    // dock ring sits on the water, on the side facing the middle of the map
    const toC = new Vector3(-x, 0, -z).normalize()
    const dock = new Vector3(x + toC.x * (r + 5), 0, z + toC.z * (r + 5))
    const ring = new Mesh(
      new TorusGeometry(3, 0.14, 8, 44),
      new MeshBasicMaterial({ color: d.hue, transparent: true, opacity: 0.95, blending: AdditiveBlending, depthWrite: false }),
    )
    ring.rotation.x = Math.PI / 2
    ring.position.copy(dock)
    scene.add(ring)
    // lighthouse-style beam over the island so each port is visible from afar
    const beam = new Mesh(
      new CylinderGeometry(0.7, 1.4, 34, 14, 1, true),
      new ShaderMaterial({
        uniforms: { uHue: { value: new Color(d.hue) } },
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        side: DoubleSide,
        vertexShader: `varying float vY; void main(){ vY = uv.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `
          uniform vec3 uHue; varying float vY;
          void main(){
            gl_FragColor = vec4(uHue, pow(vY, 1.6) * 0.42);
            #include <colorspace_fragment>
          }`,
      }),
    )
    beam.position.set(x, 17 + r * 0.3, z)
    scene.add(beam)
    return { ...d.island, dock, ring, beam, idx: i, label: null }
  })

  // Palms: every island's trees share two instanced meshes
  const palmsPer = budget.snow > 300 ? 7 : 4
  const trunks = new InstancedMesh(new CylinderGeometry(0.1, 0.17, 1.9, 5), new MeshLambertMaterial({ color: '#8a6a45' }), islands.length * palmsPer)
  const crowns = new InstancedMesh(new ConeGeometry(1.1, 0.7, 6), new MeshLambertMaterial({ color: '#3f9a5a', flatShading: true }), islands.length * palmsPer)
  const dummy = new Object3D()
  let pi = 0
  islands.forEach((isl, i) => {
    for (let k = 0; k < palmsPer; k++) {
      const a = rnd(i * 31 + k * 7) * TAU
      const f = 0.15 + rnd(i * 13 + k * 3) * 0.5
      const px = isl.x + Math.cos(a) * isl.r * f
      const pz = isl.z + Math.sin(a) * isl.r * f
      const py = isl.r * 0.34 * (1 - f * f) * 0.85
      dummy.position.set(px, py + 0.9, pz)
      dummy.rotation.set((rnd(k + i) - 0.5) * 0.25, 0, (rnd(k * 5 + i) - 0.5) * 0.25)
      dummy.scale.setScalar(0.8 + rnd(i + k * 11) * 0.5)
      dummy.updateMatrix()
      trunks.setMatrixAt(pi, dummy.matrix)
      dummy.position.y += 1.05 * dummy.scale.x
      dummy.rotation.y = rnd(k) * TAU
      dummy.updateMatrix()
      crowns.setMatrixAt(pi, dummy.matrix)
      pi++
    }
  })
  scene.add(trunks, crowns)

  // ── Boat ──
  let boat = buildBoat()
  scene.add(boat)
  if (MODELS.ship.src) {
    import('./model.js')
      .then(({ loadShipModel }) => loadShipModel(MODELS.ship.src, { length: 5 }))
      .then((model) => {
        scene.remove(boat)
        const holder = new Group()
        holder.add(model)
        boat = holder
        scene.add(boat)
      })
      .catch(() => {}) // keep the procedural boat if the file is missing
  }

  // Wake: ring buffer of foam puffs, animated on the GPU from a birth time
  const WAKE = 90
  const wakePos = new Float32Array(WAKE * 3)
  const wakeBorn = new Float32Array(WAKE).fill(-100)
  const wakeGeo = new BufferGeometry()
  wakeGeo.setAttribute('position', new BufferAttribute(wakePos, 3))
  wakeGeo.setAttribute('aBorn', new BufferAttribute(wakeBorn, 1))
  const wake = new Points(
    wakeGeo,
    new ShaderMaterial({
      uniforms: { uNow: { value: 0 }, uPR: { value: 1 } },
      transparent: true,
      depthWrite: false,
      vertexShader: `
        uniform float uNow, uPR; attribute float aBorn; varying float vA;
        void main(){
          float age = uNow - aBorn;
          vA = clamp(1.0 - age / 2.6, 0.0, 1.0);
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = vA > 0.0 ? clamp((7.0 + age * 14.0) * uPR * (60.0 / -mv.z), 1.0, 90.0) : 0.0;
        }`,
      fragmentShader: `
        varying float vA;
        void main(){
          float r = length(gl_PointCoord - 0.5) * 2.0;
          float a = smoothstep(1.0, 0.2, r) * vA * 0.4;
          if (a < 0.01) discard;
          gl_FragColor = vec4(0.96, 0.98, 1.0, a);
          #include <colorspace_fragment>
        }`,
    }),
  )
  wake.frustumCulled = false
  scene.add(wake)
  let wakeIdx = 0
  let wakeTimer = 0

  // ── State ──
  const S = { x: 0, z: -6, h: 0, v: 0, active: false, th: 0, st: 0, boost: false, dock: -1, hudT: 0, w: 1, h2: 1 }
  const camPos = new Vector3(0, 8, -18)
  const camLook = new Vector3()
  const tmp = new Vector3()
  const input = { throttle: 0, steer: 0, boost: false }
  const labels = []
  const hooks = { onDock: null, onHud: null }

  function respawn() {
    S.x = 0
    S.z = -6
    S.h = 0
    S.v = 0
  }

  function update(dt, time) {
    env.uTime.value = time
    wake.material.uniforms.uNow.value = time

    // Idle demo cruise vs player control
    let throttle = input.throttle
    let steer = input.steer
    if (!S.active) {
      throttle = 0.5
      steer = Math.sin(time * 0.35) * 0.55
      // steer away from the edge of the map while cruising
      if (Math.hypot(S.x, S.z) > WORLD * 0.7) steer = 1
    }
    const boost = S.active && input.boost
    const accel = boost ? 15 : 9
    S.v += (throttle * accel - (0.9 + Math.abs(S.v) * 0.06) * S.v) * dt
    const speedF = Math.min(Math.abs(S.v) / 5, 1)
    S.h += steer * 1.7 * (0.25 + 0.75 * speedF) * (S.v >= -0.2 ? 1 : -1) * dt
    S.x += Math.sin(S.h) * S.v * dt
    S.z += Math.cos(S.h) * S.v * dt

    // Islands are solid
    for (const isl of islands) {
      const dx = S.x - isl.x
      const dz = S.z - isl.z
      const dist = Math.hypot(dx, dz) || 0.001
      const min = isl.r * 0.95 + 1.8
      if (dist < min) {
        S.x = isl.x + (dx / dist) * min
        S.z = isl.z + (dz / dist) * min
        S.v *= 0.55
      }
    }
    // Soft world edge
    const rr = Math.hypot(S.x, S.z)
    if (rr > WORLD) {
      S.x *= WORLD / rr
      S.z *= WORLD / rr
      S.v *= 0.7
    }

    // Bob + tilt on the real waves
    const f = 1.8
    const hb = waveHeight(S.x + Math.sin(S.h) * f, S.z + Math.cos(S.h) * f, time)
    const hs = waveHeight(S.x - Math.sin(S.h) * f, S.z - Math.cos(S.h) * f, time)
    const hl = waveHeight(S.x + Math.cos(S.h) * 0.9, S.z - Math.sin(S.h) * 0.9, time)
    const hr = waveHeight(S.x - Math.cos(S.h) * 0.9, S.z + Math.sin(S.h) * 0.9, time)
    boat.position.set(S.x, (hb + hs + hl + hr) / 4 + 0.05, S.z)
    boat.rotation.set(Math.atan2(hs - hb, f * 2) * 0.9, S.h, Math.atan2(hl - hr, 1.8) * 0.9 - steer * 0.12 * speedF, 'YXZ')

    // Wake puffs from the stern
    wakeTimer += dt
    if (Math.abs(S.v) > 1.2 && wakeTimer > 0.045) {
      wakeTimer = 0
      const i = wakeIdx++ % WAKE
      const jx = (Math.random() - 0.5) * 0.8
      wakePos[i * 3] = S.x - Math.sin(S.h) * 2.4 + Math.cos(S.h) * jx
      wakePos[i * 3 + 1] = 0.1
      wakePos[i * 3 + 2] = S.z - Math.cos(S.h) * 2.4 - Math.sin(S.h) * jx
      wakeBorn[i] = time
      wakeGeo.attributes.position.needsUpdate = true
      wakeGeo.attributes.aBorn.needsUpdate = true
    }
    wake.material.uniforms.uPR.value = 1

    // Chase camera (smoothed) — a little further back and higher when going fast
    const back = 15 + Math.abs(S.v) * 0.5
    tmp.set(S.x - Math.sin(S.h) * back, 8.5 + Math.abs(S.v) * 0.15, S.z - Math.cos(S.h) * back)
    camPos.lerp(tmp, 1 - Math.exp(-3.2 * dt))
    camera.position.copy(camPos)
    camLook.set(S.x + Math.sin(S.h) * 7, 1.2, S.z + Math.cos(S.h) * 7)
    camera.lookAt(camLook)
    camera.updateMatrixWorld()

    ocean.position.set(Math.round(camera.position.x / 4) * 4, 0, Math.round(camera.position.z / 4) * 4)

    // Port rings pulse; find the nearest dock in range
    let near = -1
    let nearD = DOCK_RANGE
    for (const isl of islands) {
      const s = 1 + Math.sin(time * 2.2 + isl.idx) * 0.06
      isl.ring.scale.set(s, s, s)
      isl.ring.position.y = waveHeight(isl.dock.x, isl.dock.z, time) + 0.2
      const d = Math.hypot(S.x - isl.dock.x, S.z - isl.dock.z)
      if (d < nearD) {
        near = isl.idx
        nearD = d
      }
    }
    if (near !== S.dock) {
      S.dock = near
      hooks.onDock?.(near)
    }

    // HTML island labels: project world → CSS px, fade with distance
    for (const isl of islands) {
      const el = labels[isl.idx]
      if (!el) continue
      tmp.set(isl.x, 8 + isl.r * 0.3, isl.z).project(camera)
      const dist = Math.hypot(S.x - isl.x, S.z - isl.z)
      const vis = tmp.z < 1 && dist < 95
      el.style.transform = `translate3d(${((tmp.x * 0.5 + 0.5) * S.w).toFixed(1)}px,${((-tmp.y * 0.5 + 0.5) * S.h2).toFixed(1)}px,0)`
      el.style.opacity = vis ? String(Math.min(1, (95 - dist) / 40)) : '0'
    }

    // 10 Hz HUD feed for the radar
    S.hudT += dt
    if (S.hudT > 0.1) {
      S.hudT = 0
      hooks.onHud?.({ x: S.x, z: S.z, h: S.h, v: S.v, islands })
    }
  }

  return {
    resize(w, h, aspect) {
      camera.fov = aspect < 0.9 ? 66 : 55
      camera.updateProjectionMatrix()
    },
    update,
    setInput(i) {
      input.throttle = i.throttle ?? input.throttle
      input.steer = i.steer ?? input.steer
      input.boost = i.boost ?? input.boost
    },
    setActive(a) {
      S.active = a
      if (!a) {
        input.throttle = 0
        input.steer = 0
        input.boost = false
      }
    },
    setSize(w, h) {
      S.w = w
      S.h2 = h
    },
    setLabels(els) {
      labels.length = 0
      els.forEach((e, i) => (labels[i] = e))
    },
    on(name, fn) {
      hooks[name] = fn
    },
    respawn,
    dispose() {
      scene.fog = null
    },
  }
}

export function create(container, tier) {
  const stage = createStage(container, { tier, heavy: true, fov: 55, build, name: 'sail' })
  if (!stage) return null
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
