// Detailed hero pieces for the backdrop: a ship's wheel and an anchor.
//
// Instead of stacking primitives (cylinders + cones read as "plastic"), these are
// built from turned profiles: LatheGeometry for the balusters, hubs and rims,
// TubeGeometry for the anchor arms and rope, bevelled ExtrudeGeometry for the
// flukes. Two materials give the premium contrast: polished BRASS (reflects the
// baked dawn sky) and GLASS — real refraction + dispersion on desktop
// (transmission), a cheap iridescent clearcoat on phones.
import {
  Group,
  Mesh,
  Color,
  Vector2,
  Vector3,
  Curve,
  Shape,
  SplineCurve,
  CatmullRomCurve3,
  LatheGeometry,
  TubeGeometry,
  ExtrudeGeometry,
  TorusGeometry,
  SphereGeometry,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
} from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

const TAU = Math.PI * 2

/** Merge any mix of indexed / non-indexed geometries into one. */
function merged(list) {
  const g = mergeGeometries(list.map((x) => (x.index ? x.toNonIndexed() : x)))
  list.forEach((x) => x.dispose())
  return g
}

/** Closed, counter-clockwise rounded-rectangle profile (x = radius, y = axial) to revolve into a ring. */
function ringProfile(cx, hw, hh, r = 0.025, seg = 4) {
  const pts = []
  const corner = (ox, oy, a0) => {
    for (let i = 0; i <= seg; i++) {
      const a = a0 + (i / seg) * (Math.PI / 2)
      pts.push(new Vector2(ox + Math.cos(a) * r, oy + Math.sin(a) * r))
    }
  }
  corner(cx + hw - r, -hh + r, -Math.PI / 2)
  corner(cx + hw - r, hh - r, 0)
  corner(cx - hw + r, hh - r, Math.PI / 2)
  corner(cx - hw + r, -hh + r, Math.PI)
  pts.push(pts[0].clone())
  return pts
}

/** Smooth a list of [radius, y] knots into a lathe profile that starts and ends on the axis. */
function turned(knots, steps = 64) {
  const y0 = knots[0][1]
  const y1 = knots[knots.length - 1][1]
  const curve = new SplineCurve(knots.map(([r, y]) => new Vector2(r, y)))
  return [new Vector2(0, y0), ...curve.getPoints(steps), new Vector2(0, y1)]
}

/** A helix as a Curve, used for the rope twisting around the anchor shank. */
class Helix extends Curve {
  constructor(radius, y0, y1, turns, phase = 0) {
    super()
    Object.assign(this, { radius, y0, y1, turns, phase })
  }
  getPoint(t, target = new Vector3()) {
    const a = this.phase + t * this.turns * TAU
    return target.set(Math.cos(a) * this.radius, this.y0 + (this.y1 - this.y0) * t, Math.sin(a) * this.radius)
  }
}

// ── Materials ───────────────────────────────────────────────────────────────
export function makeMaterials(kind) {
  const brass = new MeshPhysicalMaterial({
    color: '#dcae62',
    metalness: 1,
    roughness: 0.22,
    clearcoat: 0.35,
    clearcoatRoughness: 0.18,
    envMapIntensity: 1.5,
  })
  const bronze = new MeshPhysicalMaterial({
    color: '#a9763a',
    metalness: 1,
    roughness: 0.3,
    clearcoat: 0.5,
    clearcoatRoughness: 0.2,
    envMapIntensity: 1.35,
  })
  const rope = new MeshStandardMaterial({ color: '#e6d8b2', roughness: 0.82, metalness: 0, envMapIntensity: 0.5 })
  const glass =
    kind === 'transmission'
      ? new MeshPhysicalMaterial({
          color: '#ffffff',
          metalness: 0,
          roughness: 0.05,
          transmission: 1,
          thickness: 1.3,
          ior: 1.48,
          dispersion: 0.4, // a touch of chromatic fringing on the edges, as real crystal has
          attenuationColor: new Color('#cfe3ff'),
          attenuationDistance: 3,
          clearcoat: 1,
          clearcoatRoughness: 0.04,
          envMapIntensity: 1.25,
        })
      : new MeshPhysicalMaterial({
          color: '#e6eefc',
          metalness: 0.1,
          roughness: 0.1,
          clearcoat: 1,
          clearcoatRoughness: 0.06,
          iridescence: 0.6,
          iridescenceIOR: 1.35,
          iridescenceThicknessRange: [120, 420],
          envMapIntensity: 1.2,
        })
  return { brass, bronze, rope, glass }
}

// ── Ship's wheel ────────────────────────────────────────────────────────────
// Brass hub + ten turned spokes whose handles reach past a glass rim. Axis = +Z (faces the camera).
export function createHelm({ brass, glass }) {
  const SPOKES = 10
  const brassParts = []

  // hub: beaded barrel + domed front cap
  const hub = new LatheGeometry(
    turned(
      [
        [0.12, -0.18], [0.17, -0.15], [0.18, -0.1], [0.145, -0.085], [0.18, -0.06], [0.2, -0.02],
        [0.2, 0.02], [0.18, 0.06], [0.145, 0.085], [0.18, 0.1], [0.17, 0.15], [0.12, 0.18],
      ],
      48,
    ),
    64,
  )
  hub.rotateX(Math.PI / 2)
  brassParts.push(hub)
  const cap = new SphereGeometry(0.105, 32, 16, 0, TAU, 0, Math.PI / 2)
  cap.rotateX(Math.PI / 2)
  cap.translate(0, 0, 0.175)
  brassParts.push(cap)

  // turned baluster spokes: bead → long taper → collar where it passes the rim → swelling handle → knob
  const baluster = turned(
    [
      [0.04, 0.14], [0.05, 0.2], [0.034, 0.26], [0.056, 0.34], [0.036, 0.4], [0.03, 0.55], [0.032, 0.75],
      [0.052, 0.8], [0.06, 0.86], [0.052, 0.92], [0.036, 0.98], [0.04, 1.05], [0.06, 1.12], [0.07, 1.2],
      [0.058, 1.27], [0.034, 1.31],
    ],
    72,
  )
  for (let i = 0; i < SPOKES; i++) {
    const s = new LatheGeometry(baluster, 14)
    s.rotateZ((i / SPOKES) * TAU)
    brassParts.push(s)
  }

  // inner decorative ring + bands that wrap the glass rim's edges
  for (const [cx, hw, hh, r] of [[0.34, 0.03, 0.05, 0.02], [0.945, 0.016, 0.098, 0.008], [0.775, 0.016, 0.098, 0.008]]) {
    const ring = new LatheGeometry(ringProfile(cx, hw, hh, r, 3), 96)
    ring.rotateX(Math.PI / 2)
    brassParts.push(ring)
  }

  // the rim — thick glass that refracts the sea and sky behind it
  const rim = new LatheGeometry(ringProfile(0.86, 0.08, 0.085, 0.034, 5), 128)
  rim.rotateX(Math.PI / 2)

  const g = new Group()
  g.add(new Mesh(merged(brassParts), brass), new Mesh(rim, glass))
  return g
}

// ── Anchor ──────────────────────────────────────────────────────────────────
// Bronze shank, stock, curved arms and bevelled flukes; brass ring + collars; a twisted rope. Height ≈ 3.
// (Glass was tried here first — against a bright dawn sky it simply disappears.)
export function createAnchor({ brass, bronze, rope }) {
  const bodyParts = [] // the bronze body

  // shank (slightly swollen at the crown and top)
  bodyParts.push(
    new LatheGeometry(
      turned(
        [[0.11, -1.33], [0.15, -1.26], [0.13, -1.1], [0.1, -0.8], [0.082, -0.2], [0.08, 0.6], [0.1, 1.0], [0.095, 1.2]],
        56,
      ),
      40,
    ),
  )

  // stock: a horizontal bar with bulbous ends
  const stock = new LatheGeometry(
    turned([[0.05, -0.82], [0.06, -0.6], [0.045, -0.2], [0.045, 0.2], [0.06, 0.6], [0.05, 0.82]], 40),
    28,
  )
  stock.rotateZ(Math.PI / 2)
  stock.translate(0, 0.86, 0)
  bodyParts.push(stock)

  // arms: one smooth curve through the crown, ending in the fluke seats
  const arms = new TubeGeometry(
    new CatmullRomCurve3([
      new Vector3(-1.12, -0.45, 0), new Vector3(-1.0, -0.85, 0), new Vector3(-0.62, -1.15, 0), new Vector3(-0.2, -1.3, 0),
      new Vector3(0, -1.33, 0), new Vector3(0.2, -1.3, 0), new Vector3(0.62, -1.15, 0), new Vector3(1.0, -0.85, 0),
      new Vector3(1.12, -0.45, 0),
    ]),
    120,
    0.085,
    22,
    false,
  )
  bodyParts.push(arms)

  // flukes: bevelled spade shapes (catch the light along their edges)
  const spade = new Shape()
  spade.moveTo(0, 0)
  spade.bezierCurveTo(0.24, 0.05, 0.27, 0.32, 0, 0.64)
  spade.bezierCurveTo(-0.27, 0.32, -0.24, 0.05, 0, 0)
  for (const side of [-1, 1]) {
    const f = new ExtrudeGeometry(spade, {
      depth: 0.06,
      bevelEnabled: true,
      bevelThickness: 0.035,
      bevelSize: 0.035,
      bevelSegments: 5,
      curveSegments: 28,
    })
    f.translate(0, -0.03, -0.03)
    f.rotateZ(-side * 0.32)
    f.translate(side * 1.12, -0.5, 0)
    bodyParts.push(f)
  }

  // brass: top ring + three collars on the shank
  const brassParts = []
  const ring = new TorusGeometry(0.27, 0.048, 24, 64)
  ring.translate(0, 1.42, 0)
  brassParts.push(ring)
  for (const y of [-0.98, 0.62, 1.12]) {
    const c = new TorusGeometry(0.125, 0.032, 16, 40)
    c.rotateX(Math.PI / 2)
    c.translate(0, y, 0)
    brassParts.push(c)
  }

  // rope: two helical strands twisting around the shank
  const ropeParts = [0, Math.PI].map((phase) => new TubeGeometry(new Helix(0.15, -0.9, 0.52, 5, phase), 280, 0.034, 10, false))

  const g = new Group()
  g.add(new Mesh(merged(bodyParts), bronze), new Mesh(merged(brassParts), brass), new Mesh(merged(ropeParts), rope))
  g.children.forEach((m) => m.position.set(0, -0.17, 0)) // centre the whole thing
  return g
}
