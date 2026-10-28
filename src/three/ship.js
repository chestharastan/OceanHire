// A procedural cruise liner for the horizon of the hero. It is only ~10 % of the
// screen wide, so the detail that sells it is in the details: a navy hull under a
// white one, five stepped decks with rows of tiny windows (a tiled texture, some
// lit warm for dawn), a gold funnel, lifeboats and a radar mast. The whole ship is
// ~7 draw calls and is fogged into the horizon haze by the scene fog.
import {
  Group,
  Mesh,
  InstancedMesh,
  Object3D,
  BoxGeometry,
  CylinderGeometry,
  CapsuleGeometry,
  ExtrudeGeometry,
  ShapeGeometry,
  PlaneGeometry,
  MeshBasicMaterial,
  Shape,
  CanvasTexture,
  RepeatWrapping,
  SRGBColorSpace,
  MeshStandardMaterial,
  Color,
} from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// Window tile: 8 windows per 128 px; the second texture marks which are lit.
function windowTextures() {
  const W = 128
  const H = 32
  const mk = (draw) => {
    const c = document.createElement('canvas')
    c.width = W
    c.height = H
    draw(c.getContext('2d'))
    const t = new CanvasTexture(c)
    t.wrapS = RepeatWrapping
    t.colorSpace = SRGBColorSpace
    t.anisotropy = 4
    return t
  }
  const lit = [1, 1, 0, 1, 1, 1, 0, 1]
  const wall = mk((g) => {
    g.fillStyle = '#eef2f8'
    g.fillRect(0, 0, W, H)
    g.fillStyle = '#26364d'
    for (let i = 0; i < 8; i++) g.fillRect(4 + i * 16, 11, 12, 9)
    g.fillStyle = 'rgba(0,0,0,0.12)'
    g.fillRect(0, H - 3, W, 3)
  })
  const glow = mk((g) => {
    g.fillStyle = '#000'
    g.fillRect(0, 0, W, H)
    g.fillStyle = '#ffd08a'
    for (let i = 0; i < 8; i++) if (lit[i]) g.fillRect(5 + i * 16, 12, 10, 7)
  })
  return { wall, glow }
}

/** A deck block whose side faces tile the window texture along its length. */
function deck(len, h, w, x, y) {
  const g = new BoxGeometry(len, h, w)
  const uv = g.attributes.uv
  const tiles = len / 4
  // BoxGeometry face order: +x, -x, +y, -y, +z, -z (4 vertices each) — scale U on the long sides (±z)
  for (let i = 16; i < 24; i++) uv.setX(i, uv.getX(i) * tiles)
  g.translate(x, y, 0)
  return g
}

/** Ship length ≈ 36 units, bow toward +X, waterline at y = 0. */
export function createCruiseShip() {
  const ship = new Group()
  const { wall, glow } = windowTextures()

  // hulls: navy below, white above (top-view outline extruded upward)
  const outline = new Shape()
  outline.moveTo(-18, -2.3)
  outline.lineTo(-18, 2.3)
  outline.lineTo(8, 2.5)
  outline.quadraticCurveTo(16, 2.1, 18.5, 0)
  outline.quadraticCurveTo(16, -2.1, 8, -2.5)
  outline.closePath()
  const hull = (depth, y) => {
    const g = new ExtrudeGeometry(outline, { depth, bevelEnabled: true, bevelSize: 0.12, bevelThickness: 0.12, bevelSegments: 2 })
    g.rotateX(-Math.PI / 2) // extrusion axis → up
    g.translate(0, y, 0)
    return g
  }
  ship.add(new Mesh(hull(2.4, -1.2), new MeshStandardMaterial({ color: '#0c1c30', roughness: 0.6, metalness: 0.1, envMapIntensity: 0.45 })))
  ship.add(new Mesh(hull(1.3, 1.2), new MeshStandardMaterial({ color: '#f3f5f9', roughness: 0.6, metalness: 0.05, envMapIntensity: 0.7 })))

  // superstructure: five stepped decks + the bridge, one draw call, windows via tiled texture
  const y0 = 2.5
  const decks = [
    deck(31, 1.1, 4.6, -1.5, y0 + 0.55),
    deck(30, 1.1, 4.3, -1.5, y0 + 1.65),
    deck(28, 1.1, 4.1, -2.0, y0 + 2.75),
    deck(25, 1.1, 3.8, -2.5, y0 + 3.85),
    deck(19, 1.0, 3.2, -4.5, y0 + 4.9),
    deck(3.2, 1.3, 4.4, 11.0, y0 + 2.2), // bridge
  ]
  const superstructure = mergeGeometries(decks)
  decks.forEach((d) => d.dispose())
  ship.add(
    new Mesh(
      superstructure,
      new MeshStandardMaterial({
        map: wall,
        emissiveMap: glow,
        emissive: new Color('#ffd9a0'),
        emissiveIntensity: 2.2,
        roughness: 0.6,
        metalness: 0.02,
      }),
    ),
  )

  // funnel: swept-back body with a gold band and dark cap
  const funnel = new Mesh(new CylinderGeometry(1.15, 1.45, 3.4, 20), new MeshStandardMaterial({ color: '#f1f3f7', roughness: 0.5 }))
  funnel.position.set(-3.5, y0 + 7.3, 0)
  funnel.rotation.z = 0.07
  const band = new Mesh(new CylinderGeometry(1.17, 1.17, 0.7, 20), new MeshStandardMaterial({ color: '#f3c892', roughness: 0.35, metalness: 0.4 }))
  band.position.set(-3.55, y0 + 8.4, 0)
  band.rotation.z = 0.07
  const cap = new Mesh(new CylinderGeometry(1.2, 1.17, 0.35, 20), new MeshStandardMaterial({ color: '#1a2230', roughness: 0.6 }))
  cap.position.set(-3.6, y0 + 9.1, 0)
  cap.rotation.z = 0.07
  ship.add(funnel, band, cap)

  // lifeboats along the first deck, both sides
  const boats = new InstancedMesh(
    new CapsuleGeometry(0.3, 1.1, 4, 8).rotateZ(Math.PI / 2),
    new MeshStandardMaterial({ color: '#ff7a45', roughness: 0.55 }),
    24,
  )
  const o = new Object3D()
  let n = 0
  for (let i = 0; i < 12; i++) {
    for (const s of [-1, 1]) {
      o.position.set(-11 + i * 2.1, y0 + 0.2, s * 2.55)
      o.updateMatrix()
      boats.setMatrixAt(n++, o.matrix)
    }
  }
  ship.add(boats)

  // radar mast + crossbar on the bridge
  const mastMat = new MeshStandardMaterial({ color: '#cfd6e2', roughness: 0.4, metalness: 0.5 })
  const mast = new Mesh(new CylinderGeometry(0.07, 0.1, 3.2, 8), mastMat)
  mast.position.set(10.8, y0 + 4.6, 0)
  const bar = new Mesh(new BoxGeometry(0.12, 0.12, 1.6), mastMat)
  bar.position.set(10.8, y0 + 5.4, 0)
  ship.add(mast, bar)

  // foam: a collar around the waterline plus a wake streaming astern — seats the hull in the sea
  const foam = new MeshBasicMaterial({ map: wakeTexture(), transparent: true, depthWrite: false, opacity: 0.85 })
  const collar = new Mesh(new ShapeGeometry(outline, 12), new MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.4, depthWrite: false }))
  collar.rotation.x = -Math.PI / 2
  collar.scale.set(1.1, 1.22, 1) // a little longer and wider than the hull outline
  collar.position.y = 0.35
  const wake = new Mesh(new PlaneGeometry(70, 14), foam)
  wake.rotation.x = -Math.PI / 2
  wake.position.set(-52, 0.3, 0)
  ship.add(collar, wake)

  return ship
}

/** Streak of white water: dense and wide at the stern, thinning to nothing — used for the wake. */
function wakeTexture() {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 64
  const g = c.getContext('2d')
  for (let i = 0; i < 700; i++) {
    const x = Math.pow(Math.random(), 1.4) * 256 // 0 = far astern … 256 = at the stern
    const t = x / 256
    const spread = 4 + t * 24
    const y = 32 + (Math.random() - 0.5) * 2 * spread * (0.4 + Math.random() * 0.6)
    g.fillStyle = `rgba(255,255,255,${(0.05 + 0.3 * t * Math.random()).toFixed(3)})`
    g.beginPath()
    g.arc(x, y, 1.2 + Math.random() * 3.2 * t, 0, Math.PI * 2)
    g.fill()
  }
  const t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace
  return t
}
