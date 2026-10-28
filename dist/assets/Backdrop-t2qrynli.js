import{d as Xe,j as qe}from"./index-BiJ8OCcl.js";import{r as _e}from"./react-cxkclgJA.js";import{c as Ye}from"./stage-Hep5ater.js";import{B as Q,a as O,M as Z,b as z,C as g,L as N,S as Be,G as W,c as w,T as Ce,d as Ze,V as T,e as De,E as Fe,f as Pe,g as $e,h as _,i as Je,j as $,I as et,k as tt,O as st,l as Ue,m as pe,n as it,P as Ie,o as Ge,p as Ne,R as ot,q as at,F as oe,r as A,U as ae,W as j,H as V,N as rt,s as nt,A as L,t as lt,u as ut,v as ct,w as ft,x as ht,y as dt,z as Oe,D as mt,J as pt,K as gt,Q as vt,X as bt,Y as wt,Z as xt,_ as Mt,$ as Tt,a0 as Le,a1 as He,a2 as yt}from"./three-NIiJnJgy.js";import{c as St,a as We,b as _t,w as Ct}from"./water-4cU813Ak.js";function ke(a,e=!1){const s=a[0].index!==null,t=new Set(Object.keys(a[0].attributes)),o=new Set(Object.keys(a[0].morphAttributes)),i={},r={},n=a[0].morphTargetsRelative,u=new Q;let d=0;for(let l=0;l<a.length;++l){const c=a[l];let f=0;if(s!==(c.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+l+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const h in c.attributes){if(!t.has(h))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+l+'. All geometries must have compatible attributes; make sure "'+h+'" attribute exists among all geometries, or in none of them.'),null;i[h]===void 0&&(i[h]=[]),i[h].push(c.attributes[h]),f++}if(f!==t.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+l+". Make sure all geometries have the same number of attributes."),null;if(n!==c.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+l+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const h in c.morphAttributes){if(!o.has(h))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+l+".  .morphAttributes must be consistent throughout all geometries."),null;r[h]===void 0&&(r[h]=[]),r[h].push(c.morphAttributes[h])}if(e){let h;if(s)h=c.index.count;else if(c.attributes.position!==void 0)h=c.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+l+". The geometry must have either an index or a position attribute"),null;u.addGroup(d,h,l),d+=h}}if(s){let l=0;const c=[];for(let f=0;f<a.length;++f){const h=a[f].index;for(let b=0;b<h.count;++b)c.push(h.getX(b)+l);l+=a[f].attributes.position.count}u.setIndex(c)}for(const l in i){const c=Ae(i[l]);if(!c)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+l+" attribute."),null;u.setAttribute(l,c)}for(const l in r){const c=r[l][0].length;if(c!==0){u.morphAttributes=u.morphAttributes||{},u.morphAttributes[l]=[];for(let f=0;f<c;++f){const h=[];for(let y=0;y<r[l].length;++y)h.push(r[l][y][f]);const b=Ae(h);if(!b)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+l+" morphAttribute."),null;u.morphAttributes[l].push(b)}}}return u}function Ae(a){let e,s,t,o=-1,i=0;for(let d=0;d<a.length;++d){const l=a[d];if(e===void 0&&(e=l.array.constructor),e!==l.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(s===void 0&&(s=l.itemSize),s!==l.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(t===void 0&&(t=l.normalized),t!==l.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(o===-1&&(o=l.gpuType),o!==l.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;i+=l.count*s}const r=new e(i),n=new O(r,s,t);let u=0;for(let d=0;d<a.length;++d){const l=a[d];if(l.isInterleavedBufferAttribute){const c=u/s;for(let f=0,h=l.count;f<h;f++)for(let b=0;b<s;b++){const y=l.getComponent(f,b);n.setComponent(f+c,b,y)}}else r.set(l.array,u);u+=l.count*s}return o!==void 0&&(n.gpuType=o),n}const ge=Math.PI*2;function se(a){const e=ke(a.map(s=>s.index?s.toNonIndexed():s));return a.forEach(s=>s.dispose()),e}function Re(a,e,s,t=.025,o=4){const i=[],r=(n,u,d)=>{for(let l=0;l<=o;l++){const c=d+l/o*(Math.PI/2);i.push(new _(n+Math.cos(c)*t,u+Math.sin(c)*t))}};return r(a+e-t,-s+t,-Math.PI/2),r(a+e-t,s-t,0),r(a-e+t,s-t,Math.PI/2),r(a-e+t,-s+t,Math.PI),i.push(i[0].clone()),i}function re(a,e=64){const s=a[0][1],t=a[a.length-1][1],o=new $e(a.map(([i,r])=>new _(i,r)));return[new _(0,s),...o.getPoints(e),new _(0,t)]}class Pt extends Je{constructor(e,s,t,o,i=0){super(),Object.assign(this,{radius:e,y0:s,y1:t,turns:o,phase:i})}getPoint(e,s=new T){const t=this.phase+e*this.turns*ge;return s.set(Math.cos(t)*this.radius,this.y0+(this.y1-this.y0)*e,Math.sin(t)*this.radius)}}function At(a){const e=new Z({color:"#dcae62",metalness:1,roughness:.22,clearcoat:.35,clearcoatRoughness:.18,envMapIntensity:1.5}),s=new Z({color:"#a9763a",metalness:1,roughness:.3,clearcoat:.5,clearcoatRoughness:.2,envMapIntensity:1.35}),t=new z({color:"#e6d8b2",roughness:.82,metalness:0,envMapIntensity:.5}),o=a==="transmission"?new Z({color:"#ffffff",metalness:0,roughness:.05,transmission:1,thickness:1.3,ior:1.48,dispersion:.4,attenuationColor:new g("#cfe3ff"),attenuationDistance:3,clearcoat:1,clearcoatRoughness:.04,envMapIntensity:1.25}):new Z({color:"#e6eefc",metalness:.1,roughness:.1,clearcoat:1,clearcoatRoughness:.06,iridescence:.6,iridescenceIOR:1.35,iridescenceThicknessRange:[120,420],envMapIntensity:1.2});return{brass:e,bronze:s,rope:t,glass:o}}function Rt({brass:a,glass:e}){const t=[],o=new N(re([[.12,-.18],[.17,-.15],[.18,-.1],[.145,-.085],[.18,-.06],[.2,-.02],[.2,.02],[.18,.06],[.145,.085],[.18,.1],[.17,.15],[.12,.18]],48),64);o.rotateX(Math.PI/2),t.push(o);const i=new Be(.105,32,16,0,ge,0,Math.PI/2);i.rotateX(Math.PI/2),i.translate(0,0,.175),t.push(i);const r=re([[.04,.14],[.05,.2],[.034,.26],[.056,.34],[.036,.4],[.03,.55],[.032,.75],[.052,.8],[.06,.86],[.052,.92],[.036,.98],[.04,1.05],[.06,1.12],[.07,1.2],[.058,1.27],[.034,1.31]],72);for(let d=0;d<10;d++){const l=new N(r,14);l.rotateZ(d/10*ge),t.push(l)}for(const[d,l,c,f]of[[.34,.03,.05,.02],[.945,.016,.098,.008],[.775,.016,.098,.008]]){const h=new N(Re(d,l,c,f,3),96);h.rotateX(Math.PI/2),t.push(h)}const n=new N(Re(.86,.08,.085,.034,5),128);n.rotateX(Math.PI/2);const u=new W;return u.add(new w(se(t),a),new w(n,e)),u}function Et({brass:a,bronze:e,rope:s}){const t=[];t.push(new N(re([[.11,-1.33],[.15,-1.26],[.13,-1.1],[.1,-.8],[.082,-.2],[.08,.6],[.1,1],[.095,1.2]],56),40));const o=new N(re([[.05,-.82],[.06,-.6],[.045,-.2],[.045,.2],[.06,.6],[.05,.82]],40),28);o.rotateZ(Math.PI/2),o.translate(0,.86,0),t.push(o);const i=new Ce(new Ze([new T(-1.12,-.45,0),new T(-1,-.85,0),new T(-.62,-1.15,0),new T(-.2,-1.3,0),new T(0,-1.33,0),new T(.2,-1.3,0),new T(.62,-1.15,0),new T(1,-.85,0),new T(1.12,-.45,0)]),120,.085,22,!1);t.push(i);const r=new De;r.moveTo(0,0),r.bezierCurveTo(.24,.05,.27,.32,0,.64),r.bezierCurveTo(-.27,.32,-.24,.05,0,0);for(const c of[-1,1]){const f=new Fe(r,{depth:.06,bevelEnabled:!0,bevelThickness:.035,bevelSize:.035,bevelSegments:5,curveSegments:28});f.translate(0,-.03,-.03),f.rotateZ(-c*.32),f.translate(c*1.12,-.5,0),t.push(f)}const n=[],u=new Pe(.27,.048,24,64);u.translate(0,1.42,0),n.push(u);for(const c of[-.98,.62,1.12]){const f=new Pe(.125,.032,16,40);f.rotateX(Math.PI/2),f.translate(0,c,0),n.push(f)}const d=[0,Math.PI].map(c=>new Ce(new Pt(.15,-.9,.52,5,c),280,.034,10,!1)),l=new W;return l.add(new w(se(t),e),new w(se(n),a),new w(se(d),s)),l.children.forEach(c=>c.position.set(0,-.17,0)),l}function zt(){const s=r=>{const n=document.createElement("canvas");n.width=128,n.height=32,r(n.getContext("2d"));const u=new Ge(n);return u.wrapS=ot,u.colorSpace=Ne,u.anisotropy=4,u},t=[1,1,0,1,1,1,0,1],o=s(r=>{r.fillStyle="#eef2f8",r.fillRect(0,0,128,32),r.fillStyle="#26364d";for(let n=0;n<8;n++)r.fillRect(4+n*16,11,12,9);r.fillStyle="rgba(0,0,0,0.12)",r.fillRect(0,29,128,3)}),i=s(r=>{r.fillStyle="#000",r.fillRect(0,0,128,32),r.fillStyle="#ffd08a";for(let n=0;n<8;n++)t[n]&&r.fillRect(5+n*16,12,10,7)});return{wall:o,glow:i}}function I(a,e,s,t,o){const i=new Ue(a,e,s),r=i.attributes.uv,n=a/4;for(let u=16;u<24;u++)r.setX(u,r.getX(u)*n);return i.translate(t,o,0),i}function Bt(){const a=new W,{wall:e,glow:s}=zt(),t=new De;t.moveTo(-18,-2.3),t.lineTo(-18,2.3),t.lineTo(8,2.5),t.quadraticCurveTo(16,2.1,18.5,0),t.quadraticCurveTo(16,-2.1,8,-2.5),t.closePath();const o=(R,X)=>{const E=new Fe(t,{depth:R,bevelEnabled:!0,bevelSize:.12,bevelThickness:.12,bevelSegments:2});return E.rotateX(-Math.PI/2),E.translate(0,X,0),E};a.add(new w(o(2.4,-1.2),new z({color:"#0c1c30",roughness:.6,metalness:.1,envMapIntensity:.45}))),a.add(new w(o(1.3,1.2),new z({color:"#f3f5f9",roughness:.6,metalness:.05,envMapIntensity:.7})));const i=2.5,r=[I(31,1.1,4.6,-1.5,i+.55),I(30,1.1,4.3,-1.5,i+1.65),I(28,1.1,4.1,-2,i+2.75),I(25,1.1,3.8,-2.5,i+3.85),I(19,1,3.2,-4.5,i+4.9),I(3.2,1.3,4.4,11,i+2.2)],n=ke(r);r.forEach(R=>R.dispose()),a.add(new w(n,new z({map:e,emissiveMap:s,emissive:new g("#ffd9a0"),emissiveIntensity:2.2,roughness:.6,metalness:.02})));const u=new w(new $(1.15,1.45,3.4,20),new z({color:"#f1f3f7",roughness:.5}));u.position.set(-3.5,i+7.3,0),u.rotation.z=.07;const d=new w(new $(1.17,1.17,.7,20),new z({color:"#f3c892",roughness:.35,metalness:.4}));d.position.set(-3.55,i+8.4,0),d.rotation.z=.07;const l=new w(new $(1.2,1.17,.35,20),new z({color:"#1a2230",roughness:.6}));l.position.set(-3.6,i+9.1,0),l.rotation.z=.07,a.add(u,d,l);const c=new et(new tt(.3,1.1,4,8).rotateZ(Math.PI/2),new z({color:"#ff7a45",roughness:.55}),24),f=new st;let h=0;for(let R=0;R<12;R++)for(const X of[-1,1])f.position.set(-11+R*2.1,i+.2,X*2.55),f.updateMatrix(),c.setMatrixAt(h++,f.matrix);a.add(c);const b=new z({color:"#cfd6e2",roughness:.4,metalness:.5}),y=new w(new $(.07,.1,3.2,8),b);y.position.set(10.8,i+4.6,0);const D=new w(new Ue(.12,.12,1.6),b);D.position.set(10.8,i+5.4,0),a.add(y,D);const K=new pe({map:Dt(),transparent:!0,depthWrite:!1,opacity:.85}),C=new w(new it(t,12),new pe({color:"#ffffff",transparent:!0,opacity:.4,depthWrite:!1}));C.rotation.x=-Math.PI/2,C.scale.set(1.1,1.22,1),C.position.y=.35;const v=new w(new Ie(70,14),K);return v.rotation.x=-Math.PI/2,v.position.set(-52,.3,0),a.add(C,v),a}function Dt(){const a=document.createElement("canvas");a.width=256,a.height=64;const e=a.getContext("2d");for(let t=0;t<700;t++){const o=Math.pow(Math.random(),1.4)*256,i=o/256,r=4+i*24,n=32+(Math.random()-.5)*2*r*(.4+Math.random()*.6);e.fillStyle=`rgba(255,255,255,${(.05+.3*i*Math.random()).toFixed(3)})`,e.beginPath(),e.arc(o,n,1.2+Math.random()*3.2*i,0,Math.PI*2),e.fill()}const s=new Ge(a);return s.colorSpace=Ne,s}const ie={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class k{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const Ft=new at(-1,1,1,-1,0,1);class Ut extends Q{constructor(){super(),this.setAttribute("position",new oe([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new oe([0,2,0,0,2,0],2))}}const It=new Ut;class ve{constructor(e){this._mesh=new w(It,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,Ft)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class je extends k{constructor(e,s="tDiffuse"){super(),this.textureID=s,this.uniforms=null,this.material=null,e instanceof A?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=ae.clone(e.uniforms),this.material=new A({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new ve(this.material)}render(e,s,t){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=t.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(s),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}class Ee extends k{constructor(e,s){super(),this.scene=e,this.camera=s,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,s,t){const o=e.getContext(),i=e.state;i.buffers.color.setMask(!1),i.buffers.depth.setMask(!1),i.buffers.color.setLocked(!0),i.buffers.depth.setLocked(!0);let r,n;this.inverse?(r=0,n=1):(r=1,n=0),i.buffers.stencil.setTest(!0),i.buffers.stencil.setOp(o.REPLACE,o.REPLACE,o.REPLACE),i.buffers.stencil.setFunc(o.ALWAYS,r,4294967295),i.buffers.stencil.setClear(n),i.buffers.stencil.setLocked(!0),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(s),this.clear&&e.clear(),e.render(this.scene,this.camera),i.buffers.color.setLocked(!1),i.buffers.depth.setLocked(!1),i.buffers.color.setMask(!0),i.buffers.depth.setMask(!0),i.buffers.stencil.setLocked(!1),i.buffers.stencil.setFunc(o.EQUAL,1,4294967295),i.buffers.stencil.setOp(o.KEEP,o.KEEP,o.KEEP),i.buffers.stencil.setLocked(!0)}}class Gt extends k{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class Nt{constructor(e,s){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),s===void 0){const t=e.getSize(new _);this._width=t.width,this._height=t.height,s=new j(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:V}),s.texture.name="EffectComposer.rt1"}else this._width=s.width,this._height=s.height;this.renderTarget1=s,this.renderTarget2=s.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new je(ie),this.copyPass.material.blending=rt,this.timer=new nt}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,s){this.passes.splice(s,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const s=this.passes.indexOf(e);s!==-1&&this.passes.splice(s,1)}isLastEnabledPass(e){for(let s=e+1;s<this.passes.length;s++)if(this.passes[s].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());const s=this.renderer.getRenderTarget();let t=!1;for(let o=0,i=this.passes.length;o<i;o++){const r=this.passes[o];if(r.enabled!==!1){if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(o),r.render(this.renderer,this.writeBuffer,this.readBuffer,e,t),r.needsSwap){if(t){const n=this.renderer.getContext(),u=this.renderer.state.buffers.stencil;u.setFunc(n.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),u.setFunc(n.EQUAL,1,4294967295)}this.swapBuffers()}Ee!==void 0&&(r instanceof Ee?t=!0:r instanceof Gt&&(t=!1))}}this.renderer.setRenderTarget(s)}reset(e){if(e===void 0){const s=this.renderer.getSize(new _);this._pixelRatio=this.renderer.getPixelRatio(),this._width=s.width,this._height=s.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,s){this._width=e,this._height=s;const t=this._width*this._pixelRatio,o=this._height*this._pixelRatio;this.renderTarget1.setSize(t,o),this.renderTarget2.setSize(t,o);for(let i=0;i<this.passes.length;i++)this.passes[i].setSize(t,o)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class Ot extends k{constructor(e,s,t=null,o=null,i=null){super(),this.scene=e,this.camera=s,this.overrideMaterial=t,this.clearColor=o,this.clearAlpha=i,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new g}render(e,s,t){const o=e.autoClear;e.autoClear=!1;let i,r;this.overrideMaterial!==null&&(r=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(i=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:t),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(i),this.overrideMaterial!==null&&(this.scene.overrideMaterial=r),e.autoClear=o}}const Lt={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new g(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class H extends k{constructor(e,s=1,t,o){super(),this.strength=s,this.radius=t,this.threshold=o,this.resolution=e!==void 0?new _(e.x,e.y):new _(256,256),this.clearColor=new g(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let i=Math.round(this.resolution.x/2),r=Math.round(this.resolution.y/2);this.renderTargetBright=new j(i,r,{type:V,depthBuffer:!1}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let l=0;l<this.nMips;l++){const c=new j(i,r,{type:V,depthBuffer:!1});c.texture.name="UnrealBloomPass.h"+l,c.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(c);const f=new j(i,r,{type:V,depthBuffer:!1});f.texture.name="UnrealBloomPass.v"+l,f.texture.generateMipmaps=!1,this.renderTargetsVertical.push(f),i=Math.round(i/2),r=Math.round(r/2)}const n=Lt;this.highPassUniforms=ae.clone(n.uniforms),this.highPassUniforms.luminosityThreshold.value=o,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new A({uniforms:this.highPassUniforms,vertexShader:n.vertexShader,fragmentShader:n.fragmentShader}),this.separableBlurMaterials=[];const u=[6,10,14,18,22];i=Math.round(this.resolution.x/2),r=Math.round(this.resolution.y/2);for(let l=0;l<this.nMips;l++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(u[l])),this.separableBlurMaterials[l].uniforms.invSize.value=new _(1/i,1/r),i=Math.round(i/2),r=Math.round(r/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=s,this.compositeMaterial.uniforms.bloomRadius.value=.1;const d=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=d,this.bloomTintColors=[new T(1,1,1),new T(1,1,1),new T(1,1,1),new T(1,1,1),new T(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=ae.clone(ie.uniforms),this.blendMaterial=new A({uniforms:this.copyUniforms,vertexShader:ie.vertexShader,fragmentShader:ie.fragmentShader,premultipliedAlpha:!0,blending:L,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new g,this._oldClearAlpha=1,this._basic=new pe,this._fsQuad=new ve(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,s){let t=Math.round(e/2),o=Math.round(s/2);this.renderTargetBright.setSize(t,o);for(let i=0;i<this.nMips;i++)this.renderTargetsHorizontal[i].setSize(t,o),this.renderTargetsVertical[i].setSize(t,o),this.separableBlurMaterials[i].uniforms.invSize.value=new _(1/t,1/o),t=Math.round(t/2),o=Math.round(o/2)}render(e,s,t,o,i){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();const r=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),i&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=t.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=t.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let n=this.renderTargetBright;for(let u=0;u<this.nMips;u++)this._fsQuad.material=this.separableBlurMaterials[u],this.separableBlurMaterials[u].uniforms.colorTexture.value=n.texture,this.separableBlurMaterials[u].uniforms.direction.value=H.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[u]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[u].uniforms.colorTexture.value=this.renderTargetsHorizontal[u].texture,this.separableBlurMaterials[u].uniforms.direction.value=H.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[u]),e.clear(),this._fsQuad.render(e),n=this.renderTargetsVertical[u];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,i&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=r}_getSeparableBlurMaterial(e){const s=[],t=e/3;for(let r=0;r<e;r++)s.push(.39894*Math.exp(-.5*r*r/(t*t))/t);const o=[],i=[];for(let r=1;r<e;r+=2){const n=s[r],u=r+1<e?s[r+1]:0,d=n+u;o.push((r*n+(r+1)*u)/d),i.push(d)}return new A({defines:{KERNEL_PAIRS:o.length},uniforms:{colorTexture:{value:null},invSize:{value:new _(.5,.5)},direction:{value:new _(.5,.5)},centerWeight:{value:s[0]},gaussianOffsets:{value:o},gaussianWeights:{value:i}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float centerWeight;
				uniform float gaussianOffsets[KERNEL_PAIRS];
				uniform float gaussianWeights[KERNEL_PAIRS];

				void main() {

					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * centerWeight;

					for ( int i = 0; i < KERNEL_PAIRS; i ++ ) {

						vec2 uvOffset = direction * invSize * gaussianOffsets[ i ];
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * gaussianWeights[ i ];

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new A({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}}H.BlurDirectionX=new _(1,0);H.BlurDirectionY=new _(0,1);const J={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};class Ht extends k{constructor(){super(),this.isOutputPass=!0,this.uniforms=ae.clone(J.uniforms),this.material=new lt({name:J.name,uniforms:this.uniforms,vertexShader:J.vertexShader,fragmentShader:J.fragmentShader}),this._fsQuad=new ve(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,s,t){this.uniforms.tDiffuse.value=t.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},ut.getTransfer(this._outputColorSpace)===ct&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===ft?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===ht?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===dt?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===Oe?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===mt?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===pt?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===gt&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(s),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}const Wt={uniforms:{tDiffuse:{value:null},uVig:{value:.18},uCA:{value:.0014},uKnee:{value:.8}},vertexShader:`
    varying vec2 vUv;
    void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,fragmentShader:`
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
    }`};function kt(a,e,s,t,o){const i=a.getPixelRatio(),r=new j(t*i,o*i,{type:V,samples:4}),n=new Nt(a,r);return n.setPixelRatio(i),n.setSize(t,o),n.addPass(new Ot(e,s)),n.addPass(new H(new _(t,o),.5,.45,1.6)),n.addPass(new je(Wt)),n.addPass(new Ht),{enabled:!0,render(u){n.render(u)},setSize(u,d){n.setPixelRatio(a.getPixelRatio()),n.setSize(u,d)},dispose(){n.passes.forEach(u=>u.dispose?.()),n.dispose?.(),r.dispose()}}}const ze=Math.PI*2,be=a=>a<0?0:a>1?1:a,me=(a,e,s)=>{const t=be((s-a)/(e-a));return t*t*(3-2*t)},G=(a,e,s,t)=>a+(e-a)*(1-Math.exp(-s*t));function ee(a,e){const s=a.length;if(e<=a[0][0])return a[0][1];if(e>=a[s-1][0])return a[s-1][1];let t=1;for(;a[t][0]<e;)t++;const[o,i]=a[t-1],[r,n]=a[t],u=t>1?(n-a[t-2][1])/(r-a[t-2][0]):(n-i)/(r-o),d=t<s-1?(a[t+1][1]-i)/(a[t+1][0]-o):(n-i)/(r-o),l=r-o,c=(e-o)/l,f=c*c,h=f*c;return(2*h-3*f+1)*i+(h-2*f+c)*l*u+(-2*h+3*f)*n+(h-f)*l*d}const jt=[[0,3.6],[.35,1.7],[.6,0],[.8,-3.4],[1,-8]],Vt=[[0,14],[.35,12],[.6,9.5],[.8,7.5],[1,6.5]],Qt=[[0,6],[.35,2.6],[.6,-1.4],[.8,-7],[1,-14]],Kt=[[0,0],[.4,-2],[1,-3]],te=[[0,new g("#3ba8c6"),new g("#0f4f78")],[14,new g("#1b6b93"),new g("#0a3354")],[45,new g("#0b3a5c"),new g("#061f36")],[95,new g("#051d33"),new g("#020a14")]];function Xt(a,e,s){let t=1;for(;t<te.length-1&&a>te[t][0];)t++;const[o,i,r]=te[t-1],[n,u,d]=te[t],l=be((a-o)/(n-o));e.copy(i).lerp(u,l),s.copy(r).lerp(d,l)}function qt(a,{tentacles:e,colA:s,colB:t,phase:o}){const i={uPhase:{value:o},uColA:{value:new g(s)},uColB:{value:new g(t)}},r=new w(new Be(1,26,14,0,ze,0,Math.PI*.52),new A({uniforms:{...a,...i},transparent:!0,depthWrite:!1,blending:L,side:He,vertexShader:`
        uniform float uTime, uPhase;
        varying vec3 vN; varying vec3 vWorld; varying vec3 vLocal;
        void main(){
          vec3 p = position;
          float pulse = sin(uTime * 1.6 + uPhase);
          p.xz *= 1.0 + 0.10 * pulse;
          p.y  *= 1.0 - 0.14 * pulse;
          p.xz *= 1.0 + smoothstep(0.35, 0.0, position.y) * 0.15 * pulse;   // flaring rim
          vLocal = position;
          vN = normalize(mat3(modelMatrix) * normal);
          vec4 wp = modelMatrix * vec4(p, 1.0);
          vWorld = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }`,fragmentShader:`
        uniform vec3 uColA, uColB, uFogColor;
        uniform float uFogDensity, uDim;
        varying vec3 vN; varying vec3 vWorld; varying vec3 vLocal;
        void main(){
          vec3 V = normalize(cameraPosition - vWorld);
          float fres = pow(1.0 - abs(dot(normalize(vN), V)), 2.2);
          float h = clamp(vLocal.y, 0.0, 1.0);
          float veins = pow(abs(sin(atan(vLocal.z, vLocal.x) * 8.0)), 10.0) * (1.0 - h);
          vec3 col = mix(uColB, uColA, h) * (0.55 + fres * 1.1) + uColA * veins * 0.5;
          float a = 0.10 + fres * 0.75 + veins * 0.14 + smoothstep(0.3, 0.0, h) * 0.3;
          float dist = distance(cameraPosition, vWorld);
          float f = (1.0 - exp(-pow(dist * uFogDensity, 2.0))) * 0.6;
          gl_FragColor = vec4(col, a * (1.0 - f) * uDim);
          #include <colorspace_fragment>
        }`})),n=22,u=[];for(let f=0;f<e;f++){const h=f/e*ze,b=Math.random();for(let y=0;y<n;y++)u.push(h,y/n,b,h,(y+1)/n,b)}const d=new Q;d.setAttribute("position",new oe(new Float32Array(u.length/3*3),3)),d.setAttribute("aData",new oe(u,3));const l=new yt(d,new A({uniforms:{...a,...i,uLen:{value:2.4}},transparent:!0,depthWrite:!1,blending:L,vertexShader:`
        attribute vec3 aData;
        uniform float uTime, uPhase, uLen;
        varying float vT; varying vec3 vWorld;
        void main(){
          float a = aData.x; float t = aData.y; float seed = aData.z;
          float pulse = sin(uTime * 1.6 + uPhase);
          float R = 0.78 * (1.0 + 0.10 * pulse);
          vec3 p = vec3(cos(a) * R, -0.02, sin(a) * R);
          float L = uLen * (0.7 + 0.6 * fract(seed * 7.13));
          p.y -= t * L;
          p.x += sin(t * 5.0 - uTime * 1.8 + seed * 6.28) * 0.18 * t + cos(a) * t * 0.15 * (1.0 - pulse * 0.5);
          p.z += cos(t * 4.0 - uTime * 1.5 + seed * 3.10) * 0.18 * t + sin(a) * t * 0.15 * (1.0 - pulse * 0.5);
          vT = t;
          vec4 wp = modelMatrix * vec4(p, 1.0);
          vWorld = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }`,fragmentShader:`
        uniform vec3 uColA, uColB;
        uniform float uFogDensity, uDim;
        varying float vT; varying vec3 vWorld;
        void main(){
          float dist = distance(cameraPosition, vWorld);
          float f = (1.0 - exp(-pow(dist * uFogDensity, 2.0))) * 0.6;
          vec3 col = mix(uColA, uColB, vT);
          gl_FragColor = vec4(col, ((1.0 - vT) * 0.75 + 0.08) * (1.0 - f) * uDim);
          #include <colorspace_fragment>
        }`})),c=new W;return c.add(r,l),c}function Yt(a,e){const s=new Float32Array(e*3),t=new Float32Array(e);for(let n=0;n<e;n++)s[n*3]=Math.random(),s[n*3+1]=Math.random(),s[n*3+2]=Math.random(),t[n]=Math.random();const o=new Q;o.setAttribute("position",new O(s,3)),o.setAttribute("aSeed",new O(t,1));const i=new A({uniforms:{uTime:a.uTime,uSub:a.uSub,uPR:{value:1},uTint:{value:new g("#bfeef0")}},transparent:!0,depthWrite:!1,blending:L,vertexShader:`
      uniform float uTime, uSub, uPR;
      attribute float aSeed;
      varying float vA;
      void main(){
        vec3 box = vec3(38.0, 54.0, 38.0);
        vec3 q = position * box;
        q.y -= uTime * (0.25 + aSeed * 0.3);                 // slow fall
        q.x += sin(uTime * 0.3 + aSeed * 20.0) * 0.8;        // lazy drift
        q = mod(q - cameraPosition + box * 0.5, box) - box * 0.5;  // wrap the volume around the camera
        vec4 mv = viewMatrix * vec4(q + cameraPosition, 1.0);
        gl_Position = projectionMatrix * mv;
        float d = -mv.z;
        gl_PointSize = clamp(70.0 / d * uPR * (0.6 + aSeed), 1.0, 12.0 * uPR);
        vA = uSub * smoothstep(42.0, 5.0, d) * (0.3 + 0.7 * aSeed);
      }`,fragmentShader:`
      uniform vec3 uTint;
      varying float vA;
      void main(){
        float r = length(gl_PointCoord - 0.5) * 2.0;
        float a = smoothstep(1.0, 0.1, r) * vA;
        if (a < 0.01) discard;
        gl_FragColor = vec4(uTint, a);
        #include <colorspace_fragment>
      }`}),r=new Le(o,i);return r.frustumCulled=!1,r}function Zt(a,e){const s=new W,t=new Ie(1,1);for(let o=0;o<e;o++){const i=new A({uniforms:{uShaft:a.uShaft,uTime:a.uTime,uAmt:a.uShaftAmt,uSeed:{value:Math.random()}},transparent:!0,depthWrite:!1,blending:L,side:He,vertexShader:"varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`
        uniform vec3 uShaft; uniform float uTime, uAmt, uSeed;
        varying vec2 vUv;
        void main(){
          float side = pow(1.0 - abs(vUv.x - 0.5) * 2.0, 1.6);
          float vert = pow(vUv.y, 1.5);
          float flick = 0.72 + 0.28 * sin(uTime * 0.6 + uSeed * 6.0 + vUv.y * 3.0);
          float a = side * vert * flick * uAmt * 0.22;
          if (a < 0.002) discard;
          gl_FragColor = vec4(uShaft, a);
          #include <colorspace_fragment>
        }`}),r=new w(t,i);r.scale.set(2.2+Math.random()*3.2,110,1),r.position.set((Math.random()-.5)*36,-30,-6-Math.random()*26),r.rotation.y=(Math.random()-.5)*1.2,r.rotation.z=.28+(Math.random()-.5)*.12,s.add(r)}return s}function $t(a,e){const s=new Float32Array(e*3),t=new Float32Array(e),o=new Float32Array(e);for(let u=0;u<e;u++)s[u*3]=(Math.random()-.5)*24,s[u*3+1]=1+Math.random()*9,s[u*3+2]=1+Math.random()*11,t[u]=16+Math.pow(Math.random(),3)*84,o[u]=Math.random();const i=new Q;i.setAttribute("position",new O(s,3)),i.setAttribute("aSize",new O(t,1)),i.setAttribute("aSeed",new O(o,1));const r=new A({uniforms:{uTime:a.uTime,uPR:{value:1},uAmt:{value:1},uK:{value:1},uTint:{value:new g("#fff1de")}},transparent:!0,depthWrite:!1,blending:L,vertexShader:`
      uniform float uTime, uPR, uAmt, uK;
      attribute float aSize, aSeed;
      varying float vA;
      void main(){
        vec3 p = position;
        p.y += sin(uTime * 0.25 + aSeed * 20.0) * 0.35;
        p.x += sin(uTime * 0.18 + aSeed * 11.0) * 0.4;
        vec4 mv = viewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float d = -mv.z;
        gl_PointSize = aSize * uK * uPR * (10.0 / d);
        vA = uAmt * (0.35 + 0.65 * fract(aSeed * 7.3)) * smoothstep(1.5, 5.0, d);
      }`,fragmentShader:`
      uniform vec3 uTint;
      varying float vA;
      void main(){
        float r = length(gl_PointCoord - 0.5) * 2.0;
        float disc = smoothstep(1.0, 0.9, r);
        float ring = smoothstep(0.55, 0.95, r);       // brighter rim, like a real lens bokeh
        float a = disc * (0.35 + 0.65 * ring) * vA * 0.14;
        if (a < 0.003) discard;
        gl_FragColor = vec4(uTint, a);
        #include <colorspace_fragment>
      }`}),n=new Le(i,r);return n.frustumCulled=!1,n}function Jt(a,e){const s=new Mt,t=We(e,{cloudOct:3,lit:!1});s.add(t),e.uBelow.value=1;const o=new Tt(a),i=o.fromScene(s,0);return o.dispose(),e.uBelow.value=0,t.geometry.dispose(),t.material.dispose(),i}function es({renderer:a,scene:e,camera:s,budget:t}){const o=St();e.add(We(o,{cloudOct:t.cloudOct,lit:t.cloudLit}));const i=_t(o,{radius:420,rings:t.oceanRings,seg:t.oceanSeg,detail:t.oceanDetail,reflOct:t.reflOct});e.add(i),e.fog=new vt(o.uHorizon.value.clone(),o.uFogDensity.value);const r=Jt(a,o);e.environment=r.texture;const n=new bt("#ffe2bd",2.6);n.position.copy(o.uSunDir.value).multiplyScalar(30),e.add(n,new wt("#dfe8ff","#6f8fb5",.45));const u=At(t.glass),d=Rt(u),l=Et(u),c=new W;c.add(d,l),e.add(c);const f=Bt();f.scale.setScalar(1.15),f.rotation.y=-.8,e.add(f);const h=t.bokeh?$t(o,t.bokeh):null;h&&e.add(h);const y=[{p:[-4.5,-16,-7],s:1.5,a:"#c66bff",b:"#5a2bd6",ph:0},{p:[6.5,-30,-13],s:2.2,a:"#6fe0d2",b:"#1d6a8f",ph:1.7},{p:[-8,-48,-15],s:2.7,a:"#ff8fd0",b:"#8a2bd6",ph:3.1},{p:[7,-66,-9],s:1.9,a:"#8fd3ff",b:"#3b4bd6",ph:4.4}].slice(0,t.jellies).map(p=>{const m=qt(o,{tentacles:t.tentacles,colA:p.a,colB:p.b,phase:p.ph});return m.scale.setScalar(p.s),m.position.set(...p.p),e.add(m),{obj:m,...p}}),D=Yt(o,t.snow);e.add(D);const K=Zt(o,t.jellies>1?7:4);e.add(K);let C=null;t.post&&(C=kt(a,e,s,window.innerWidth,window.innerHeight),a.toneMapping=xt);const v={x:0,y:0,tx:0,ty:0},R=p=>{v.tx=p.clientX/window.innerWidth*2-1,v.ty=p.clientY/window.innerHeight*2-1};matchMedia("(pointer: fine)").matches&&window.addEventListener("pointermove",R,{passive:!0});const E={helm:null,anchor:null,shipX:52};let ne=0,we=1;function Ve(p){const m=p<.9;we=m?.55:1,o.uDim.value=m?.5:.78,s.fov=m?64:48,s.updateProjectionMatrix();const S=Math.tan(s.fov*Math.PI/360)*12,q=S*p;ne=m?2.2:0;const ce=5.6-ne,F=(fe,he,Y,U)=>({x:fe*q,y:ce+he*S,z:Y,scale:U});E.helm=m?F(.5,.3,0,.8):F(.66,0,0,1.4),E.anchor=m?F(-.46,.07,2,.52):F(-.58,-.4,2,1.05),E.shipX=m?6:-4}const le=new g,ue=new g,xe=new g,Me=new T,M={y:3.6,z:14,ly:6,lz:0};let Te=1;function Qe(p,m,P){o.uTime.value=m;const S=P.heroP,q=be((P.y-P.heroLen)/Math.max(P.docH-P.vh-P.heroLen,1)),ce=ee(jt,S)-q*72,F=ee(Vt,S),fe=ee(Qt,S)-q*72-ne*(1-me(0,.35,S)),he=ee(Kt,S);M.y=G(M.y,ce,7,p),M.z=G(M.z,F,7,p),M.ly=G(M.ly,fe,7,p),M.lz=G(M.lz,he,7,p),v.x=G(v.x,v.tx,3,p),v.y=G(v.y,v.ty,3,p);const Y=(1-S)*.06;s.position.set(v.x*.9+Math.sin(m*.31)*Y,M.y+v.y*-.25+Math.sin(m*.43)*Y,M.z),Me.set(v.x*.5,M.ly,M.lz),s.lookAt(Me);const U=Math.max(0,-M.y),B=me(.5,-.8,M.y);o.uSub.value=B,Xt(U,le,ue),o.uDeepTop.value.copy(le),o.uDeepBottom.value.copy(ue),o.uShaftAmt.value=B*Math.exp(-U/40),xe.copy(ue).lerp(le,.342),o.uFogColor.value.copy(o.uHorizon.value).lerp(xe,B),o.uFogDensity.value=.0042+B*(.011+U*4e-4),e.fog.color.copy(o.uFogColor.value),e.fog.density=o.uFogDensity.value,i.position.set(s.position.x,0,s.position.z),i.visible=U<60;const ye=S<.82;if(c.visible=ye,ye){const x=E;d.position.set(x.helm.x+v.x*.3,x.helm.y+Math.sin(m*.5)*.12+S*3,x.helm.z),d.scale.setScalar(x.helm.scale),d.rotation.set(-.14+v.y*.14,-.4+v.x*.25+Math.sin(m*.3)*.1,m*.05+P.y*8e-4),l.position.set(x.anchor.x+v.x*.5,x.anchor.y+Math.sin(m*.6+1.7)*.16+S*4,x.anchor.z),l.scale.setScalar(x.anchor.scale),l.rotation.set(Math.sin(m*.4)*.08,-.35+Math.sin(m*.33)*.4+v.x*.25,.3+Math.sin(m*.35)*.1)}f.visible=M.y>1.2&&S<.75,f.visible&&(f.position.set(E.shipX+Math.sin(m*.05)*3,Ct(E.shipX,-125,m)*.35-.1,-125),f.rotation.z=Math.sin(m*.55)*.012),h&&(h.visible=B<.5&&S<.7,h.material.uniforms.uAmt.value=(1-B)*(1-me(0,.6,S)),h.material.uniforms.uPR.value=a.getPixelRatio(),h.material.uniforms.uK.value=Math.min(1,window.innerWidth/1200));const Se=M.y<6;y.forEach((x,de)=>{if(x.obj.visible=Se,!Se)return;x.obj.scale.setScalar(x.s*we);const Ke=m*.12+de*2;x.obj.position.x=x.p[0]+Math.sin(Ke)*1.6,x.obj.position.y=x.p[1]+Math.sin(m*.5+de)*.6,x.obj.rotation.y=m*.08+de}),D.visible=B>.02,D.material.uniforms.uPR.value=a.getPixelRatio(),K.visible=o.uShaftAmt.value>.01}return{resize(p,m,P){Te=P,Ve(P),C?.setSize(p,m)},update:Qe,render(p){return C?.enabled?(C.render(p),!0):!1},quality(p,m,P){C?.enabled&&(p<.85?(C.enabled=!1,a.toneMapping=Oe):C.setSize(m,P))},dispose(){window.removeEventListener("pointermove",R),C?.dispose(),r.dispose(),e.environment=null,e.fog=null},get aspect(){return Te}}}function rs({onReady:a,onFail:e}){const s=_e.useRef(null);return _e.useEffect(()=>{const t=Ye(s.current,{tier:Xe(),fixed:!0,name:"backdrop",fov:48,build:es,onFirstFrame:a});return t||e?.(),()=>t?.dispose()},[]),qe.jsx("div",{ref:s,"aria-hidden":"true",className:"pointer-events-none fixed inset-x-0 top-0 -z-10",style:{height:"100lvh"}})}export{rs as default};
