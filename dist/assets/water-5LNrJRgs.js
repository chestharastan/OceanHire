import{V as S,l as p,a as b,b as h,g as z,m as D,C,d as F,e as m}from"./three-DwKm7zLB.js";const x=Math.PI*2,f=[[1,.25,.14,22],[.6,.8,.11,12],[-.4,.9,.09,6.5],[.9,-.5,.06,3.2]];function M(a,o,e){let c=0;for(const[l,i,t,v]of f){const n=Math.hypot(l,i),r=x/v,s=Math.sqrt(9.8/r),u=r*(l/n*a+i/n*o-s*e);c+=t/r*Math.sin(u)}return c}function T(a={}){const o=e=>new C(e);return{uTime:{value:0},uSunDir:{value:new S(-.35,.3,-.88).normalize()},uSunCol:{value:o(a.sun??"#ffd9a8")},uHorizon:{value:o(a.horizon??"#f6e4dc")},uZenith:{value:o(a.zenith??"#aebfe3")},uDeep:{value:o(a.deep??"#1f4f7a")},uShallow:{value:o(a.shallow??"#4f9bb8")},uFogColor:{value:o(a.horizon??"#f6e4dc")},uFogDensity:{value:.0042},uSub:{value:0},uDeepTop:{value:o("#2f8fb5")},uDeepBottom:{value:o("#0d4a73")},uShaft:{value:o("#9fe8e0")},uShaftAmt:{value:0},uDim:{value:.78}}}const w=`
  float hash12(vec2 p){
    vec3 p3 = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }
`,y=`
  uniform vec3 uHorizon, uZenith, uSunCol, uSunDir;
  vec3 skyCol(vec3 d){
    float h = max(d.y, 0.0);
    vec3 c = mix(uHorizon, uZenith, pow(h, 0.5));
    float s = max(dot(d, uSunDir), 0.0);
    c += uSunCol * (pow(s, 12.0) * 0.25 + pow(s, 220.0) * 1.2);
    return c;
  }
`;function N(a){const o=new p({uniforms:a,side:b,depthWrite:!1,depthTest:!1,vertexShader:`
      varying vec3 vDir;
      void main(){
        vDir = position;
        // The dome is re-centred on the camera in the shader, so the mesh never moves.
        gl_Position = projectionMatrix * viewMatrix * vec4(position * 900.0 + cameraPosition, 1.0);
      }`,fragmentShader:`
      ${w}
      ${y}
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
      }`}),e=new h(new z(1,24,12),o);return e.frustumCulled=!1,e.renderOrder=-10,e}function W(a,o,e){const c=new Float32Array((o+1)*e*3);for(let n=0;n<=o;n++){const r=a*Math.pow(n/o,2.4);for(let s=0;s<e;s++){const u=s/e*x,d=(n*e+s)*3;c[d]=Math.cos(u)*r,c[d+2]=Math.sin(u)*r}}const l=o*e*6,i=(o+1)*e>65535?new Uint32Array(l):new Uint16Array(l);let t=0;for(let n=0;n<o;n++)for(let r=0;r<e;r++){const s=n*e+r,u=n*e+(r+1)%e,d=(n+1)*e+r,g=(n+1)*e+(r+1)%e;i[t++]=s,i[t++]=u,i[t++]=d,i[t++]=u,i[t++]=g,i[t++]=d}const v=new F;return v.setAttribute("position",new m(c,3)),v.setIndex(new m(i,1)),v.boundingSphere=null,v}function _(a,{radius:o=420,rings:e=72,seg:c=160}={}){const l=new p({uniforms:a,side:D,vertexShader:`
      uniform float uTime;
      varying vec3 vWorld;
      varying vec3 vN;
      const vec4 W0 = vec4(${f[0].map(t=>t.toFixed(2)).join(",")});
      const vec4 W1 = vec4(${f[1].map(t=>t.toFixed(2)).join(",")});
      const vec4 W2 = vec4(${f[2].map(t=>t.toFixed(2)).join(",")});
      const vec4 W3 = vec4(${f[3].map(t=>t.toFixed(2)).join(",")});
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
      ${w}
      ${y}
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
      }`}),i=new h(W(o,e,c),l);return i.frustumCulled=!1,i}export{N as a,_ as b,T as c,M as w};
