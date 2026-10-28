import{V as S,r as m,a6 as C,c as h,S as D,a1 as k,C as z,B as T,a as p}from"./three-NIiJnJgy.js";const w=Math.PI*2,f=[[1,.25,.14,22],[.6,.8,.11,12],[-.4,.9,.09,6.5],[.9,-.5,.06,3.2]];function _(a,e,t){let i=0;for(const[r,n,l,s]of f){const o=Math.hypot(r,n),c=w/s,u=Math.sqrt(9.8/c),d=c*(r/o*a+n/o*e-u*t);i+=l/c*Math.sin(d)}return i}function W(a={}){const e=t=>new z(t);return{uTime:{value:0},uSunDir:{value:new S(-.24,.3,-.92).normalize()},uSunCol:{value:e(a.sun??"#ffd9a8")},uHorizon:{value:e(a.horizon??"#f4d9cc")},uZenith:{value:e(a.zenith??"#8ea6d8")},uCloudLit:{value:e(a.cloudLit??"#fff1e8")},uCloudShadow:{value:e(a.cloudShadow??"#8791c0")},uDeep:{value:e(a.deep??"#1f4f7a")},uShallow:{value:e(a.shallow??"#4f9bb8")},uFogColor:{value:e(a.horizon??"#f4d9cc")},uFogDensity:{value:.0042},uSub:{value:0},uBelow:{value:0},uDeepTop:{value:e("#2f8fb5")},uDeepBottom:{value:e("#0d4a73")},uShaft:{value:e("#9fe8e0")},uShaftAmt:{value:0},uDim:{value:.78}}}const x=`
  float hash12(vec2 p){
    vec3 p3 = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }
`,y=`
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
`,g=`
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
`;function O(a,{cloudOct:e=3,lit:t=!1}={}){const i=new m({uniforms:a,side:C,depthWrite:!1,depthTest:!0,vertexShader:`
      varying vec3 vDir;
      void main(){
        vDir = position;
        // Re-centre the dome on the camera in the shader, then push it to the far plane so
        // depth testing skips every pixel the ocean or an object already covered.
        vec4 clip = projectionMatrix * viewMatrix * vec4(position * 900.0 + cameraPosition, 1.0);
        clip.z = clip.w * 0.99999;
        gl_Position = clip;
      }`,fragmentShader:`
      #define CLOUD_OCT ${e}
      ${t?"#define CLOUD_LIT":""}
      ${x}
      ${y}
      ${g}
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
      }`}),r=new h(new D(1,24,12),i);return r.frustumCulled=!1,r.renderOrder=100,r}function L(a,e,t){const i=new Float32Array((e+1)*t*3);for(let o=0;o<=e;o++){const c=a*Math.pow(o/e,2.4);for(let u=0;u<t;u++){const d=u/t*w,v=(o*t+u)*3;i[v]=Math.cos(d)*c,i[v+2]=Math.sin(d)*c}}const r=e*t*6,n=(e+1)*t>65535?new Uint32Array(r):new Uint16Array(r);let l=0;for(let o=0;o<e;o++)for(let c=0;c<t;c++){const u=o*t+c,d=o*t+(c+1)%t,v=(o+1)*t+c,b=(o+1)*t+(c+1)%t;n[l++]=u,n[l++]=d,n[l++]=v,n[l++]=d,n[l++]=b,n[l++]=v}const s=new T;return s.setAttribute("position",new p(i,3)),s.setIndex(new p(n,1)),s.boundingSphere=null,s}function M(a,{radius:e=420,rings:t=72,seg:i=160,detail:r=2,reflOct:n=2}={}){const l=new m({uniforms:a,side:k,vertexShader:`
      uniform float uTime;
      varying vec3 vWorld;
      varying vec3 vN;
      const vec4 W0 = vec4(${f[0].map(o=>o.toFixed(2)).join(",")});
      const vec4 W1 = vec4(${f[1].map(o=>o.toFixed(2)).join(",")});
      const vec4 W2 = vec4(${f[2].map(o=>o.toFixed(2)).join(",")});
      const vec4 W3 = vec4(${f[3].map(o=>o.toFixed(2)).join(",")});
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
      }`,fragmentShader:`
      #define DETAIL_OCT ${r}
      #define CLOUD_OCT ${n}
      ${x}
      ${y}
      ${g}
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
      }`}),s=new h(L(e,t,i),l);return s.frustumCulled=!1,s}export{O as a,M as b,W as c,_ as w};
