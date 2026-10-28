// Desktop post-processing: gives the render a photographic, filmic finish.
//
//   scene (HDR) → bloom (sun disc, glints and brass highlights glow)
//               → grade  (soft-knee highlight roll-off, vignette, a hint of chromatic aberration)
//               → output (sRGB)
//
// Only built for the high device tier. It renders into a half-float, 4× MSAA target
// so highlights above 1.0 survive long enough to bloom. The frame-time governor can
// switch it off at runtime (see backdrop.js `quality`), which is the first thing to
// go on a struggling GPU — before any resolution is sacrificed.
import { Vector2, WebGLRenderTarget, HalfFloatType } from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

const GRADE = {
  uniforms: { tDiffuse: { value: null }, uVig: { value: 0.18 }, uCA: { value: 0.0014 }, uKnee: { value: 0.8 } },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uVig, uCA, uKnee;
    varying vec2 vUv;
    // Linear up to the knee, then an exponential shoulder easing toward 1.0:
    // mid-tones are untouched, highlights roll off instead of clipping flat.
    vec3 shoulder(vec3 x){
      vec3 over = max(x - vec3(uKnee), vec3(0.0));
      return min(x, vec3(uKnee)) + (1.0 - uKnee) * (1.0 - exp(-over / (1.0 - uKnee)));
    }
    void main(){
      vec2 c = vUv - 0.5;
      float r2 = dot(c, c);
      vec2 off = c * uCA * (1.0 + r2 * 4.0);          // chromatic aberration grows toward the edges
      vec3 col = vec3(texture2D(tDiffuse, vUv + off).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - off).b);
      // The composer renders in linear HDR where the renderer would normally tone-map the PBR pieces
      // (ACES). Reproduce its contrast on the mid-tones plus a touch of saturation so both tiers match.
      vec3 sc = clamp(col, 0.0, 1.0);
      col = mix(col, col - sc + sc * sc * (3.0 - 2.0 * sc), 0.32);
      float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
      col = mix(vec3(l), col, 1.08);
      col = shoulder(col);
      col *= 1.0 - uVig * smoothstep(0.12, 0.85, r2 * 2.2);
      gl_FragColor = vec4(col, 1.0);
    }`,
}

export function createPost(renderer, scene, camera, w, h) {
  const pr = renderer.getPixelRatio()
  const target = new WebGLRenderTarget(w * pr, h * pr, { type: HalfFloatType, samples: 4 })
  const composer = new EffectComposer(renderer, target)
  composer.setPixelRatio(pr)
  composer.setSize(w, h)
  composer.addPass(new RenderPass(scene, camera))
  // strength, radius, threshold — the threshold sits well above 1.0 so only the sun, glitter and
  // specular glints bloom; the bright sky itself must not fog the frame
  composer.addPass(new UnrealBloomPass(new Vector2(w, h), 0.5, 0.45, 1.6))
  composer.addPass(new ShaderPass(GRADE))
  composer.addPass(new OutputPass())

  return {
    enabled: true,
    render(dt) {
      composer.render(dt)
    },
    setSize(nw, nh) {
      composer.setPixelRatio(renderer.getPixelRatio())
      composer.setSize(nw, nh)
    },
    dispose() {
      composer.passes.forEach((p) => p.dispose?.())
      composer.dispose?.()
      target.dispose()
    },
  }
}
