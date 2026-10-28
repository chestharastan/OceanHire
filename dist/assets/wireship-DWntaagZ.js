import{C as G,G as U,a2 as I,c as $,l as X,r as C,a1 as q,A as F,V as z,B as Y,F as V,a0 as J}from"./three-NIiJnJgy.js";import{c as K}from"./stage-Hep5ater.js";import{D}from"./index-BiJ8OCcl.js";import"./react-cxkclgJA.js";const k=Math.PI*2,E=10,W=1.9,b=.9,O=.55,Q=(t,c,n)=>{const a=Math.min(Math.max((n-t)/(c-t),0),1);return a*a*(3-2*a)};function ee(t){if(t<.58)return .78+.22*Q(0,.14,t);const c=(t-.58)/.42;return Math.pow(Math.max(1-Math.pow(c,1.7),0),.75)}const i=t=>-E/2+E*t,P=(t,c)=>ee(t)*(W/2)*(.55+.45*Math.pow(c,.7));function te(t,c,n){return n==="funnel"||n==="prop"?1:n==="bridge"||n==="mast"?0:n==="cross"?4:c<O&&t<.5?1:t>=.8&&c>=O?0:c>=1.86&&t<=.64||c>=1.62&&t<=.5?3:c>=1.38&&c<1.62&&t>=.58&&t<=.74?4:t>=.62&&c>=b?5:t>=.15&&t<=.62&&c>=b?2:-1}const oe=[new z(i(.74),2.5,0),new z(i(.34),2.95,0),new z(i(.4),1.3,.85),new z(i(.3),2.25,0),new z(i(.66),1.5,.82),new z(i(.72),1,.8)],ne=[{c:[i(.78),1.6,0],s:[2.6,1.6,1.4]},{c:[i(.28),1.25,0],s:[3.4,2.6,1.7]},{c:[i(.38),1.25,0],s:[4.4,.55,1.65]},{c:[i(.33),2,0],s:[3,.7,1.3]},{c:[i(.66),1.5,0],s:[1.6,.34,1.6]},{c:[i(.72),1.1,0],s:[1.9,.9,1.5]}];function se(){const t=[],c=[],n=(e,o,u)=>{const l=(e[0]+o[0])/2,f=(e[1]+o[1])/2,M=te((l+E/2)/E,f,u);t.push(e[0],e[1],e[2],o[0],o[1],o[2]),c.push(M,M)},a=(e,o,u=!1)=>{for(let l=0;l<e.length-1;l++)n(e[l],e[l+1],o);u&&n(e[e.length-1],e[0],o)};for(const e of[0,.3,.6,1]){const o=e*b,u=l=>Array.from({length:45},(f,M)=>{const _=M/44;return[i(_),o,l*P(_,e)]});a(u(1)),a(u(-1)),n([i(0),o,P(0,e)],[i(0),o,-P(0,e)])}a(Array.from({length:45},(e,o)=>[i(o/44),0,0]));for(let e=0;e<=22;e++){const o=e/22,u=[];for(const[l,f]of[[1,1],[.6,1],[.3,1],[0,0],[.3,-1],[.6,-1],[1,-1]])u.push([i(o),l*b,f*P(o,l)]);a(u)}[[.08,.84,.86],[.1,.8,.82],[.14,.76,.78],[.2,.7,.7],[.26,.62,.58]].forEach(([e,o,u],l)=>{const f=b+l*.24,M=f+.24,_=W/2*u,Z=i(e),B=i(o),j=.35,L=m=>[[Z,m,-_],[Z,m,_],[B-j,m,_],[B,m,_*.45],[B,m,-_*.45],[B-j,m,-_]];a(L(f),"deck",!0),a(L(M),"deck",!0),L(f).forEach((m,R)=>n(m,[m[0],M,m[2]],"deck"));for(let m=Z+.35;m<B-j-.2;m+=.34)for(const R of[-1,1])n([m,f+.12,R*_],[m+.18,f+.12,R*_],"deck")});for(let e=0;e<6;e++){const o=i(.28+e*.07);for(const u of[-1,1]){const l=u*(W/2)*.9;a([[o,b+.08,l],[o+.3,b+.08,l],[o+.3,b+.2,l],[o,b+.2,l]],"deck",!0)}}const d=b+5*.24,p=[[i(.3),d,-.2],[i(.42),d,-.2],[i(.42),d,.2],[i(.3),d,.2]];a(p,"deck",!0);const A=i(.34),H=d,s=(e,o,u,l=0)=>Array.from({length:21},(f,M)=>[A+l+Math.cos(M/20*k)*o,e,Math.sin(M/20*k)*u]),N=[s(H,.55,.3),s(H+.4,.5,.27,.05),s(H+.8,.45,.25,.14)];N.forEach(e=>a(e,"funnel"));for(let e=0;e<20;e+=2)n(N[0][e],N[1][e],"funnel"),n(N[1][e],N[2][e],"funnel");const x=i(.64),T=i(.77),w=b+4*.24,y=w+.34,r=.62;a([[x,w,-r],[T,w,-r*.7],[T,w,r*.7],[x,w,r]],"bridge",!0),a([[x,y,-r],[T,y,-r*.7],[T,y,r*.7],[x,y,r]],"bridge",!0),[[x,-r],[T,-r*.7],[T,r*.7],[x,r]].forEach(([e,o])=>n([e,w,o],[e,y,o],"bridge")),n([x+.1,w,-1.05],[x+.1,w,1.05],"bridge"),n([i(.7),y,0],[i(.7),y+.65,0],"mast"),n([i(.7),y+.5,-.25],[i(.7),y+.5,.25],"mast");for(const e of[-1,1]){const o=i(.66),u=b+2*.24+.12,l=e*(W/2)*.78*1.02;n([o-.16,u,l],[o+.16,u,l],"cross"),n([o,u-.16,l],[o,u+.16,l],"cross")}const h=Array.from({length:25},(e,o)=>[i(.02),.28+Math.cos(o/24*k)*.3,Math.sin(o/24*k)*.3]);a(h,"prop");for(let e=0;e<3;e++){const o=e/3*k;n([i(.02),.28,0],[i(.02),.28+Math.cos(o)*.3,Math.sin(o)*.3],"prop")}const g=new Y;return g.setAttribute("position",new V(t,3)),g.setAttribute("aZone",new V(c,1)),g}const ie=t=>new C({uniforms:t,transparent:!0,depthWrite:!1,blending:F,vertexShader:`
      attribute float aZone;
      varying float vZone;
      varying float vY;
      void main(){
        vZone = aZone;
        vY = position.y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,fragmentShader:`
      uniform vec3 uBase, uHue;
      uniform float uActive, uMix, uTime;
      varying float vZone;
      varying float vY;
      void main(){
        float on = step(abs(vZone - uActive), 0.5) * step(-0.5, uActive);
        float dim = mix(1.0, 0.22, uMix * (1.0 - on));
        vec3 col = mix(uBase, uHue, on * uMix);
        float pulse = 1.0 + on * uMix * 0.3 * sin(uTime * 3.2);
        float a = 0.95 * dim * pulse;
        // slight fade of the hull below the waterline for depth
        a *= mix(0.72, 1.0, smoothstep(0.0, 0.6, vY));
        gl_FragColor = vec4(col * (1.0 + on * uMix * 0.7), a);
        #include <colorspace_fragment>
      }`});function ae(){const t=[],a=Math.round(14.444444444444445);for(let p=-a;p<=a;p++)for(let A=-a;A<a;A++)t.push(p*.9,0,A*.9,p*.9,0,(A+1)*.9),t.push(A*.9,0,p*.9,(A+1)*.9,0,p*.9);const v=new Y;v.setAttribute("position",new V(t,3));const S=new C({uniforms:{uTime:{value:0}},transparent:!0,depthWrite:!1,blending:F,vertexShader:`
      uniform float uTime;
      varying float vA;
      void main(){
        vec3 p = position;
        p.y += sin(p.x * 0.7 + uTime * 0.9) * 0.07 + sin(p.z * 0.9 - uTime * 1.2) * 0.06;
        vA = 1.0 - smoothstep(3.0, 13.0, length(p.xz));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,fragmentShader:`
      varying float vA;
      void main(){
        gl_FragColor = vec4(0.49, 0.89, 0.84, vA * 0.16);
        #include <colorspace_fragment>
      }`}),d=new I(v,S);return d.position.y=O,d}function re(t){const c=[];for(let v=0;v<t;v++){const S=Math.random()*k,d=6+Math.random()*9;c.push(Math.cos(S)*d,Math.random()*6-.5,Math.sin(S)*d)}const n=new Y;n.setAttribute("position",new V(c,3));const a=new C({uniforms:{uTime:{value:0}},transparent:!0,depthWrite:!1,blending:F,vertexShader:`
      uniform float uTime;
      void main(){
        vec3 p = position;
        p.y += sin(uTime * 0.4 + p.x) * 0.3;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = clamp(60.0 / -mv.z, 1.5, 4.0) * 2.0;
      }`,fragmentShader:`
      void main(){
        vec2 c = abs(gl_PointCoord - 0.5);
        float plus = step(min(c.x, c.y), 0.06) * step(max(c.x, c.y), 0.5);   // "+" glyph
        if (plus < 0.5) discard;
        gl_FragColor = vec4(0.85, 0.97, 1.0, 0.5);
        #include <colorspace_fragment>
      }`});return new J(n,a)}async function ce(t,c){return!1}function le({scene:t,camera:c,budget:n}){t.background=new G("#061a2e");const a=new U,v={uBase:{value:new G("#bfe9ff")},uHue:{value:new G("#7de3d6")},uActive:{value:-1},uMix:{value:0},uTime:{value:0}},S=ie(v),d=new I(se(),S);a.add(d),ce().then(r=>r&&(d.visible=!1)).catch(()=>{});const p=new $(new X(1,1,1),new C({uniforms:{uHue:v.uHue,uAmt:{value:0}},transparent:!0,depthWrite:!1,blending:F,side:q,vertexShader:`
        varying vec3 vN; varying vec3 vV;
        void main(){
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vN = normalize(normalMatrix * normal);
          vV = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }`,fragmentShader:`
        uniform vec3 uHue; uniform float uAmt;
        varying vec3 vN; varying vec3 vV;
        void main(){
          float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.0);
          gl_FragColor = vec4(uHue, (0.05 + f * 0.22) * uAmt);
          #include <colorspace_fragment>
        }`}));p.visible=!1,a.add(p);const A=ae(),H=re(n.snow>300?60:30);t.add(a,A,H);const s={yaw:-.6,vel:0,dragging:!1,auto:!0,active:-1,mixT:0,aspect:1},N=D.map(()=>({x:0,y:0,vis:!1})),x=new z,T={c:new z,s:new z},w=[];function y(){const r=c.fov*(Math.PI/180),h=s.aspect,g=Math.max(E*.56/(Math.tan(r/2)*Math.min(h,1.7)),10),e=.52;c.position.set(Math.sin(s.yaw)*Math.cos(e)*g,Math.sin(e)*g+1,Math.cos(s.yaw)*Math.cos(e)*g),c.lookAt(0,1.05,0)}return{resize(r,h,g){s.aspect=g,c.fov=g<.9?40:30,c.updateProjectionMatrix(),y()},update(r,h){v.uTime.value=h,A.material.uniforms.uTime.value=h,H.material.uniforms.uTime.value=h,s.dragging||(s.vel*=Math.exp(-3*r),s.yaw+=s.vel*r,s.auto&&(s.yaw+=.16*r)),a.rotation.z=Math.sin(h*.8)*.018,a.position.y=Math.sin(h*1.1)*.04;const g=s.active>=0?1:0;if(s.mixT+=(g-s.mixT)*(1-Math.exp(-6*r)),v.uMix.value=s.mixT,v.uActive.value=s.active,s.active>=0){const u=D[s.active];v.uHue.value.set(u.hue);const l=ne[s.active];T.c.set(...l.c),T.s.set(...l.s),p.position.lerp(T.c,1-Math.exp(-8*r)),p.scale.lerp(T.s,1-Math.exp(-8*r))}p.visible=s.mixT>.02&&s.active>=0,p.material.uniforms.uAmt.value=s.mixT,y(),a.updateMatrixWorld(!0),c.updateMatrixWorld();const e=s.w||1,o=s.h||1;oe.forEach((u,l)=>{x.copy(u).applyMatrix4(a.matrixWorld).project(c);const f=N[l];f.x=(x.x*.5+.5)*e,f.y=(-x.y*.5+.5)*o,f.vis=x.z<1;const M=w[l];M&&(M.style.transform=`translate3d(${f.x.toFixed(1)}px,${f.y.toFixed(1)}px,0)`,M.style.opacity=f.vis?"1":"0")})},setSize(r,h){s.w=r,s.h=h},setLabels(r){w.length=0,r.forEach((h,g)=>w[g]=h)},setActive(r){s.active=r},drag(r){s.dragging=!0,s.auto=!1,s.yaw+=r*.008,s.vel=r*.008*60},release(){s.dragging=!1},dispose(){}}}function me(t,c){const n=K(t,{tier:c,heavy:!0,fov:30,build:le,name:"ship"});if(!n)return null;const a=new ResizeObserver(()=>n.api.setSize(t.clientWidth,t.clientHeight));a.observe(t),n.api.setSize(t.clientWidth,t.clientHeight);const v=n.dispose;return n.dispose=()=>{a.disconnect(),v()},n}export{me as create};
