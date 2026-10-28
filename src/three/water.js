// Shared ocean + sky. Used by the hero backdrop and the sailable map.
//
// SKY — a gradient dome with lit, drifting FBM clouds, thin cirrus and an HDR sun
// disc (values > 1, so the desktop bloom pass makes it glow). The dome is drawn
// LAST with its depth pushed to the far plane, so the fragment shader only runs on
// pixels the ocean/objects did not already cover (early-z), instead of the whole
// screen. A single `uSub` uniform cross-fades it into the underwater column.
//
// OCEAN — four summed Gerstner waves in the vertex shader (analytic normals) plus
// scrolling gradient-noise micro-detail in the fragment shader. The fragment
// blends a body colour with a Fresnel reflection of the SAME sky (clouds included),
// adds backlit-crest translucency, noise-driven foam and a sun glitter path, and
// looks different from below the surface (Snell's window).
//
// Quality is a build-time option (noise octaves are compile-time constants), so
// phones get a leaner shader than desktops — see BUDGET in lib/quality.js.
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
    uSunDir: { value: new Vector3(-0.24, 0.3, -0.92).normalize() },
    uSunCol: { value: c(palette.sun ?? '#ffd9a8') },
    uHorizon: { value: c(palette.horizon ?? '#f4d9cc') },
    uZenith: { value: c(palette.zenith ?? '#8ea6d8') },
    uCloudLit: { value: c(palette.cloudLit ?? '#fff1e8') },
    uCloudShadow: { value: c(palette.cloudShadow ?? '#8791c0') },
    uDeep: { value: c(palette.deep ?? '#1f4f7a') },
    uShallow: { value: c(palette.shallow ?? '#4f9bb8') },
    uFogColor: { value: c(palette.horizon ?? '#f4d9cc') },
    uFogDensity: { value: 0.0042 },
    uSub: { value: 0 },
    uBelow: { value: 0 }, // 1 only while baking the reflection environment: below the horizon = sea
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

// Value noise WITH analytic derivatives (Inigo Quilez): .x = value, .yz = gradient.
// The gradient is what gives the water its fine, correctly-lit surface detail.
const GLSL_NOISE = /* glsl */ `
  vec3 noised(vec2 x){
    vec2 p = floor(x);
    vec2 w = fract(x);
    vec2 u = w * w * w * (w * (w * 6.0 - 15.0) + 10.0);
    vec2 du = 30.0 * w * w * (w * (w - 2.0) + 1.0);
    float a = hash12(p);
    float b = hash12(p + vec2(1.0, 0.0));
    float c = hash12(p + vec2(0.0, 1.0));
    float d = hash12(p + vec2(1.0, 1.0));
    float k1 = b - a;
    float k2 = c - a;
    float k4 = a - b - c + d;
    return vec3(a + k1 * u.x + k2 * u.y + k4 * u.x * u.y, du * vec2(k1 + k4 * u.y, k2 + k4 * u.x));
  }
`

// Sky colour model shared by the dome and the ocean's reflection.
// Needs CLOUD_OCT (octave count); defining CLOUD_LIT adds sun-side shading + cirrus.
const SKY_CORE = /* glsl */ `
  uniform vec3 uHorizon, uZenith, uSunCol, uSunDir, uCloudLit, uCloudShadow;
  uniform float uTime;

  float fbm(vec2 p){
    float s = 0.0;
    float a = 0.5;
    for (int i = 0; i < CLOUD_OCT; i++) {
      s += a * noised(p).x;
      p = mat2(1.6, 1.2, -1.2, 1.6) * p;
      a *= 0.5;
    }
    return s;
  }

  vec3 skyBase(vec3 d){
    float h = max(d.y, 0.0);
    vec3 c = mix(uHorizon, uZenith, pow(h, 0.45));
    float s = max(dot(d, uSunDir), 0.0);
    c += uSunCol * (pow(s, 8.0) * 0.10 + pow(s, 64.0) * 0.22);   // soft sun-side glow
    return c;
  }

  // returns vec4(colour, coverage)
  vec4 applyClouds(vec3 col, vec3 d){
    float up = d.y;
    if (up < 0.012) return vec4(col, 0.0);
    // project onto a plane: clouds shrink toward the horizon like real perspective
    vec2 p = d.xz / (up + 0.16) * 1.35 + vec2(uTime * 0.0045, uTime * 0.0016);
    float n = fbm(p);
    float cov = smoothstep(0.50, 0.80, n) * smoothstep(0.012, 0.20, up);
    #ifdef CLOUD_LIT
      float n2 = fbm(p + uSunDir.xz * 0.32);
      float lit = clamp(0.58 + (n - n2) * 3.6, 0.0, 1.0);
    #else
      float lit = 0.62;
    #endif
    vec3 cc = mix(uCloudShadow, uCloudLit, lit);
    cc += uSunCol * pow(max(dot(d, uSunDir), 0.0), 5.0) * 0.5;      // sun-lit rims
    col = mix(col, cc, cov * 0.92);
    #ifdef CLOUD_LIT
      // thin stretched cirrus streaks high up
      float ci = fbm(vec2(p.x * 0.3 + 3.1, p.y * 1.9));
      col = mix(col, uCloudLit, smoothstep(0.55, 0.92, ci) * 0.20 * smoothstep(0.1, 0.5, up));
    #endif
    return vec4(col, cov);
  }
`

/**
 * @param opts.cloudOct  FBM octaves for clouds (2 phone … 5 desktop)
 * @param opts.lit       sun-side cloud shading + cirrus (desktop)
 */
export function createSky(env, { cloudOct = 3, lit = false } = {}) {
  const mat = new ShaderMaterial({
    uniforms: env,
    side: BackSide,
    depthWrite: false,
    depthTest: true,
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main(){
        vDir = position;
        // Re-centre the dome on the camera in the shader, then push it to the far plane so
        // depth testing skips every pixel the ocean or an object already covered.
        vec4 clip = projectionMatrix * viewMatrix * vec4(position * 900.0 + cameraPosition, 1.0);
        clip.z = clip.w * 0.99999;
        gl_Position = clip;
      }`,
    fragmentShader: /* glsl */ `
      #define CLOUD_OCT ${cloudOct}
      ${lit ? '#define CLOUD_LIT' : ''}
      ${GLSL_COMMON}
      ${GLSL_NOISE}
      ${SKY_CORE}
      uniform vec3 uDeepTop, uDeepBottom, uShaft, uDeep;
      uniform float uSub, uShaftAmt, uBelow;
      varying vec3 vDir;
      void main(){
        vec3 d = normalize(vDir);
        vec3 above = skyBase(d);
        if (uBelow > 0.0) above = mix(above, uDeep * 1.15, smoothstep(0.0, -0.3, d.y) * uBelow);
        vec4 cl = applyClouds(above, d);
        above = cl.rgb;
        // HDR sun disc (>1): the desktop bloom pass turns this into a real glow
        float sd = max(dot(d, uSunDir), 0.0);
        // …wrapped in a soft halo so the sun reads as a light source even where there is no bloom (phones)
        above += uSunCol * (smoothstep(0.99930, 0.99978, sd) * 9.0 + pow(sd, 900.0) * 0.9 + pow(sd, 160.0) * 0.18) * (1.0 - cl.a * 0.9);

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
  mesh.renderOrder = 100 // after everything opaque, so early-z can reject covered pixels
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

/**
 * @param opts.detail  octaves of micro-detail normal noise (1 phone … 3 desktop)
 * @param opts.reflOct octaves of the clouds reflected in the water
 */
export function createOcean(env, { radius = 420, rings = 72, seg = 160, detail = 2, reflOct = 2 } = {}) {
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
      #define DETAIL_OCT ${detail}
      #define CLOUD_OCT ${reflOct}
      ${GLSL_COMMON}
      ${GLSL_NOISE}
      ${SKY_CORE}
      uniform vec3 uDeep, uShallow, uFogColor;
      uniform float uFogDensity;
      varying vec3 vWorld;
      varying vec3 vN;
      void main(){
        vec3 V = normalize(cameraPosition - vWorld);
        vec3 N = normalize(vN);
        bool under = !gl_FrontFacing;
        if (under) N = -N;
        vec2 q = vWorld.xz;
        float dist = distance(cameraPosition, vWorld);

        // ── micro-detail: scrolling gradient-noise normals, faded with distance (no moiré) ──
        float detailFade = 1.0 - smoothstep(22.0, 190.0, dist);
        vec2 g = vec2(0.0);
        float amp = 0.6;
        float fr = 0.85;
        for (int i = 0; i < DETAIL_OCT; i++) {
          vec2 flow = vec2(uTime * (0.10 + 0.07 * float(i)), -uTime * (0.06 + 0.03 * float(i)));
          g += noised(q * fr + flow).yz * amp;
          amp *= 0.5;
          fr *= 2.15;
        }
        N = normalize(N + vec3(g.x, 0.0, g.y) * 0.20 * detailFade);

        vec3 col;
        if (!under) {
          float ndv = max(dot(N, V), 0.0);
          float fres = 0.02 + 0.98 * pow(1.0 - ndv, 5.0);
          vec3 R = reflect(-V, N);
          R.y = abs(R.y);
          vec3 refl = applyClouds(skyBase(R), R).rgb;

          // body colour: darker in troughs, lighter / greener toward crests
          float crest = clamp(vWorld.y * 0.85 + 0.45, 0.0, 1.0);
          vec3 body = mix(uDeep, uShallow, crest * 0.65 + 0.12 * ndv);

          // translucency: crests glow turquoise when we look toward the sun through them
          vec3 Ls = normalize(vec3(uSunDir.x, 0.0, uSunDir.z));
          vec3 Vh = normalize(vec3(-V.x, 0.0, -V.z));
          float back = pow(clamp(dot(Vh, Ls), 0.0, 1.0), 3.0);
          body += vec3(0.07, 0.42, 0.40) * back * smoothstep(0.10, 0.75, vWorld.y) * (1.0 - fres) * 1.1;

          col = mix(body, refl, fres);

          // sun glitter: a sharp core + a broad sheen; the micro normals make it sparkle
          float sp = max(dot(R, uSunDir), 0.0);
          col += uSunCol * (pow(sp, 420.0) * 3.6 + pow(sp, 70.0) * 0.30);

          // foam: noise-broken crest lines that fade with distance
          float fn = noised(q * 1.35 + vec2(uTime * 0.12, 0.0)).x;
          float foam = smoothstep(0.50, 0.80, vWorld.y + (fn - 0.5) * 0.5) * (1.0 - smoothstep(12.0, 75.0, dist));
          col = mix(col, vec3(0.97, 0.98, 1.0), foam * 0.55);
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
