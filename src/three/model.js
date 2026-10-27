// OPTIONAL 3D-model hook. When MODELS.ship.src is set in config/media.js the
// scenes load that .glb/.gltf instead of building their procedural ship. The
// loader (and its ~50 kB of code) is imported on demand, so it costs nothing
// until a model is actually supplied.
//
// Models are normalised so any export works: centred on the origin, keel at
// y = 0, scaled so the longer horizontal axis equals `length`.
// Convention: the bow should point to +Z in the source file.
import { Box3, Vector3, Group } from 'three'

export async function loadShipModel(src, { length }) {
  const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
  const gltf = await new GLTFLoader().loadAsync(src)
  const root = gltf.scene
  const box = new Box3().setFromObject(root)
  const size = box.getSize(new Vector3())
  const center = box.getCenter(new Vector3())
  root.position.set(-center.x, -box.min.y, -center.z)
  const holder = new Group()
  holder.add(root)
  holder.scale.setScalar(length / Math.max(size.x, size.z, 0.0001))
  holder.userData.height = size.y * holder.scale.y
  return holder
}
