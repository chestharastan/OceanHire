// Shared ocean + sky. Used by the hero backdrop and the sailable map.
//
// OCEAN — four summed Gerstner waves displaced in the vertex shader (analytic
// normals, no textures). The fragment shader blends a body colour with a
// reflection of the procedural sky by Fresnel, adds a sun glint and crest foam,
// and looks different from below the surface (a bright "Snell's window").
// The mesh is a polar grid: dense rings near the camera where detail matters,
// sparse far away, so ~10k vertices give a convincing horizon.
//
// SKY — a gradient dome that follows the camera. A single `uSub` uniform
// cross-fades it into the underwater water-column gradient when diving.
import {
  BufferGeometry,
  BufferAttribute,
  Color,
  Vector3,
  ShaderMaterial,
  SphereGeometry,
  Mesh,
  DoubleSide,
  BackSide,
} from 'three'

const TAU = Math.PI * 2

// dir.x, dir.y (wave direction), steepness, wavelength  — keep in sync with GLSL below
export const WAVES = [
  [1.0, 0.25, 0.14, 22.0],
  [0.6, 0.8, 0.11, 12.0],
  [-0.4, 0.9, 0.09, 6.5],
  [0.9, -0.5, 0.06, 3.2],
]

/** CPU mirror of the vertex shader's height — lets boats bob on the real waves. */
export function waveHeight(x, z, t) {
  let y = 0
  for (const [dx, dz, steep, wl] of WAVES) {
    const len = Math.hypot(dx, dz)
    const k = TAU / wl
    const c = Math.sqrt(9.8 / k)
    const f = k * ((dx / len) * x + (dz / len) * z - c * t)
    y += (steep / k) * Math.sin(f)
  }
  return y
}

/** Uniforms shared by every custom material in a scene (mutated once per frame). */
export function createEnv(palette = {}) {
  const c = (hex) => new Color(hex)
  return {
    uTime: { value: 0 },
    uSunDir: { value: new Vector3(-0.35, 0.3, -0.88).normalize() },
    uSunCol: { value: c(palette.sun ?? '#ffd9a8') },
    uHorizon: { value: c(palette.horizon ?? '#f6e4dc') },
    uZenith: { value: c(palette.zenith ?? '#aebfe3') },
    uDeep: { value: c(palette.deep ?? '#1f4f7a') },
    uShallow: { value: c(palette.shallow ?? '#4f9bb8') },
    uFogColor: { value: c(palette.horizon ?? '#f6e4dc') },
    uFogDensity: { value: 0.0042 },
    uSub: { value: 0 },
    uDeepTop: { value: c('#2f8fb5') },
    uDeepBottom: { value: c('#0d4a73') },
    uShaft: { value: c('#9fe8e0') },
    uShaftAmt: { value: 0 },
    uDim: { value: 0.78 }, // overall opacity of bioluminescent creatures (lowered on narrow screens)
  }
}

export const GLSL_COMMON = /* glsl */ `
  float hash12(vec2 p){
    vec3 p3 = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }
`

const SKY_FN = /* glsl */ `
  uniform vec3 uHorizon, uZenith, uSunCol, uSunDir;
  vec3 skyCol(vec3 d){
    float h = max(d.y, 0.0);
    vec3 c = mix(uHorizon, uZenith, pow(h, 0.5));
    float s = max(dot(d, uSunDir), 0.0);
    c += uSunCol * (pow(s, 12.0) * 0.25 + pow(s, 220.0) * 1.2);
    return c;
  }
`

export function createSky(env) {
  const mat = new ShaderMaterial({
    uniforms: env,
    side: BackSide,
    depthWrite: false,
    depthTest: false,
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main(){
        vDir = position;
        // The dome is re-centred on the camera in the shader, so the mesh never moves.
        gl_Position = projectionMatrix * viewMatrix * vec4(position * 900.0 + cameraPosition, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      ${GLSL_COMMON}
      ${SKY_FN}
      uniform vec3 uDeepTop, uDeepBottom, uShaft;
      uniform float uSub, uShaftAmt;
      varying vec3 vDir;
      void main(){
        vec3 d = normalize(vDir);
        vec3 above = skyCol(d);
        float g = smoothstep(-0.55, 0.85, d.y);
        vec3 below = mix(uDeepBottom, uDeepTop, g);
        below += uShaft * pow(max(d.y, 0.0), 5.0) * uShaftAmt;
        vec3 col = mix(above, below, uSub);
        col += (hash12(gl_FragCoord.xy) - 0.5) / 255.0;   // dither: no banding in dark gradients
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
  })
  const mesh = new Mesh(new SphereGeometry(1, 24, 12), mat)
  mesh.frustumCulled = false
  mesh.renderOrder = -10
  return mesh
}

/** Polar grid, dense near the centre. Vertices lie in the XZ plane, normals face +Y. */
export function createOceanGeometry(radius, rings, seg) {
  const pos = new Float32Array((rings + 1) * seg * 3)
  for (let i = 0; i <= rings; i++) {
    const r = radius * Math.pow(i / rings, 2.4)
    for (let j = 0; j < seg; j++) {
      const a = (j / seg) * TAU
      const o = (i * seg + j) * 3
      pos[o] = Math.cos(a) * r
      pos[o + 2] = Math.sin(a) * r
    }
  }
  const count = rings * seg * 6
  const idx = (rings + 1) * seg > 65535 ? new Uint32Array(count) : new Uint16Array(count)
  let k = 0
  for (let i = 0; i < rings; i++) {
    for (let j = 0; j < seg; j++) {
      const a = i * seg + j
      const b = i * seg + ((j + 1) % seg)
      const c = (i + 1) * seg + j
      const d = (i + 1) * seg + ((j + 1) % seg)
      idx[k++] = a; idx[k++] = b; idx[k++] = c
      idx[k++] = b; idx[k++] = d; idx[k++] = c
    }
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(pos, 3))
  g.setIndex(new BufferAttribute(idx, 1))
  g.boundingSphere = null
  return g
}

export function createOcean(env, { radius = 420, rings = 72, seg = 160 } = {}) {
  const mat = new ShaderMaterial({
    uniforms: env,
    side: DoubleSide,
    vertexShader: /* glsl */ `
      uniform float uTime;
      varying vec3 vWorld;
      varying vec3 vN;
      const vec4 W0 = vec4(${WAVES[0].map((n) => n.toFixed(2)).join(',')});
      const vec4 W1 = vec4(${WAVES[1].map((n) => n.toFixed(2)).join(',')});
      const vec4 W2 = vec4(${WAVES[2].map((n) => n.toFixed(2)).join(',')});
      const vec4 W3 = vec4(${WAVES[3].map((n) => n.toFixed(2)).join(',')});
      vec3 gerstner(vec4 w, vec3 p, float amp, inout vec3 tg, inout vec3 bn){
        float steep = w.z * amp;
        float k = 6.28318 / w.w;
        float c = sqrt(9.8 / k);
        vec2 d = normalize(w.xy);
        float f = k * (dot(d, p.xz) - c * uTime);
        float a = steep / k;
        float s = sin(f);
        float co = cos(f);
        tg += vec3(-d.x * d.x * steep * s, d.x * steep * co, -d.x * d.y * steep * s);
        bn += vec3(-d.x * d.y * steep * s, d.y * steep * co, -d.y * d.y * steep * s);
        return vec3(d.x * a * co, a * s, d.y * a * co);
      }
      void main(){
        vec3 p = (modelMatrix * vec4(position, 1.0)).xyz;
        // Fade the two short waves with distance: avoids aliasing and saves detail we can't see.
        float hf = 1.0 - smoothstep(30.0, 110.0, distance(p.xz, cameraPosition.xz));
        vec3 tg = vec3(1.0, 0.0, 0.0);
        vec3 bn = vec3(0.0, 0.0, 1.0);
        vec3 o = gerstner(W0, p, 1.0, tg, bn);
        o += gerstner(W1, p, 1.0, tg, bn);
        o += gerstner(W2, p, hf, tg, bn);
        o += gerstner(W3, p, hf, tg, bn);
        p += o;
        vN = normalize(cross(bn, tg));
        vWorld = p;
        gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      ${GLSL_COMMON}
      ${SKY_FN}
      uniform vec3 uDeep, uShallow, uFogColor;
      uniform float uFogDensity, uTime;
      varying vec3 vWorld;
      varying vec3 vN;
      void main(){
        vec3 V = normalize(cameraPosition - vWorld);
        vec3 N = normalize(vN);
        bool under = !gl_FrontFacing;
        if (under) N = -N;
        vec2 q = vWorld.xz;
        // cheap ripple detail layered on the analytic normal
        float dist = distance(cameraPosition, vWorld);
        float rip = 1.0 - smoothstep(15.0, 80.0, dist);   // fade ripples with distance → no moiré at the horizon
        N = normalize(N + rip * vec3(
          sin(q.x * 1.9 + uTime * 1.3) * 0.045 + sin(q.y * 3.1 - uTime * 1.7) * 0.025, 0.0,
          cos(q.y * 2.3 + uTime * 1.1) * 0.045 + cos(q.x * 3.7 + uTime * 1.9) * 0.025));
        vec3 col;
        if (!under) {
          float ndv = max(dot(N, V), 0.0);
          float fres = 0.02 + 0.98 * pow(1.0 - ndv, 5.0);
          vec3 R = reflect(-V, N);
          R.y = abs(R.y);
          vec3 body = mix(uDeep, uShallow, clamp(0.35 + vWorld.y * 0.5, 0.0, 1.0) * (0.5 + 0.5 * ndv));
          col = mix(body, skyCol(R), fres);
          col += uSunCol * pow(max(dot(R, uSunDir), 0.0), 300.0) * 2.5;
          // Soft crest foam, faded out with distance so it never turns into far-field speckle.
          float crest = smoothstep(0.50, 0.86, vWorld.y) * (0.65 + 0.35 * sin(q.x * 1.3 + q.y * 0.9 + uTime * 0.8));
          col = mix(col, vec3(0.97, 0.98, 1.0), crest * 0.5 * (1.0 - smoothstep(10.0, 60.0, dist)));
        } else {
          float look = clamp(-V.y, 0.0, 1.0);          // 1 = looking straight up at the surface
          vec3 window = mix(uShallow, uHorizon, 0.5) * 1.25;
          vec3 tir = mix(uDeep, uShallow, 0.4) * 0.8;   // total internal reflection at grazing angles
          col = mix(tir, window, smoothstep(0.30, 0.9, look));
          col += mix(uSunCol, vec3(0.75, 1.0, 1.0), 0.6) * pow(max(dot(-V, uSunDir), 0.0), 40.0) * 0.35;
        }
        float f = 1.0 - exp(-pow(dist * uFogDensity, 2.0));
        col = mix(col, uFogColor, clamp(f, 0.0, 1.0));
        col += (hash12(gl_FragCoord.xy) - 0.5) / 255.0;
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
  })
  const mesh = new Mesh(createOceanGeometry(radius, rings, seg), mat)
  mesh.frustumCulled = false
  return mesh
}
