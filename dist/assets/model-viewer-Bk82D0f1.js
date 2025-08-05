/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const _c=globalThis,hd=_c.ShadowRoot&&(_c.ShadyCSS===void 0||_c.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,rg=Symbol(),Vd=new WeakMap;let Sb=class{constructor(e,t,n){if(this._$cssResult$=!0,n!==rg)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(hd&&e===void 0){const n=t!==void 0&&t.length===1;n&&(e=Vd.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&Vd.set(t,e))}return e}toString(){return this.cssText}};const Cb=r=>new Sb(typeof r=="string"?r:r+"",void 0,rg),Ib=(r,e)=>{if(hd)r.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const n=document.createElement("style"),i=_c.litNonce;i!==void 0&&n.setAttribute("nonce",i),n.textContent=t.cssText,r.appendChild(n)}},Wd=hd?r=>r:r=>r instanceof CSSStyleSheet?(e=>{let t="";for(const n of e.cssRules)t+=n.cssText;return Cb(t)})(r):r;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:Mb,defineProperty:wb,getOwnPropertyDescriptor:Tb,getOwnPropertyNames:Rb,getOwnPropertySymbols:Bb,getPrototypeOf:Db}=Object,Zi=globalThis,qd=Zi.trustedTypes,Lb=qd?qd.emptyScript:"",Fb=Zi.reactiveElementPolyfillSupport,Qa=(r,e)=>r,Rc={toAttribute(r,e){switch(e){case Boolean:r=r?Lb:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,e){let t=r;switch(e){case Boolean:t=r!==null;break;case Number:t=r===null?null:Number(r);break;case Object:case Array:try{t=JSON.parse(r)}catch{t=null}}return t}},ud=(r,e)=>!Mb(r,e),Xd={attribute:!0,type:String,converter:Rc,reflect:!1,useDefault:!1,hasChanged:ud};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),Zi.litPropertyMetadata??(Zi.litPropertyMetadata=new WeakMap);let Cs=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??(this.l=[])).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=Xd){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const n=Symbol(),i=this.getPropertyDescriptor(e,n,t);i!==void 0&&wb(this.prototype,e,i)}}static getPropertyDescriptor(e,t,n){const{get:i,set:s}=Tb(this.prototype,e)??{get(){return this[t]},set(a){this[t]=a}};return{get:i,set(a){const o=i?.call(this);s?.call(this,a),this.requestUpdate(e,o,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Xd}static _$Ei(){if(this.hasOwnProperty(Qa("elementProperties")))return;const e=Db(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(Qa("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(Qa("properties"))){const t=this.properties,n=[...Rb(t),...Bb(t)];for(const i of n)this.createProperty(i,t[i])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[n,i]of t)this.elementProperties.set(n,i)}this._$Eh=new Map;for(const[t,n]of this.elementProperties){const i=this._$Eu(t,n);i!==void 0&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const n=new Set(e.flat(1/0).reverse());for(const i of n)t.unshift(Wd(i))}else e!==void 0&&t.push(Wd(e));return t}static _$Eu(e,t){const n=t.attribute;return n===!1?void 0:typeof n=="string"?n:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??(this._$EO=new Set)).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Ib(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){const n=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,n);if(i!==void 0&&n.reflect===!0){const s=(n.converter?.toAttribute!==void 0?n.converter:Rc).toAttribute(t,n.type);this._$Em=e,s==null?this.removeAttribute(i):this.setAttribute(i,s),this._$Em=null}}_$AK(e,t){const n=this.constructor,i=n._$Eh.get(e);if(i!==void 0&&this._$Em!==i){const s=n.getPropertyOptions(i),a=typeof s.converter=="function"?{fromAttribute:s.converter}:s.converter?.fromAttribute!==void 0?s.converter:Rc;this._$Em=i;const o=a.fromAttribute(t,s.type);this[i]=o??this._$Ej?.get(i)??o,this._$Em=null}}requestUpdate(e,t,n){if(e!==void 0){const i=this.constructor,s=this[e];if(n??(n=i.getPropertyOptions(e)),!((n.hasChanged??ud)(s,t)||n.useDefault&&n.reflect&&s===this._$Ej?.get(e)&&!this.hasAttribute(i._$Eu(e,n))))return;this.C(e,t,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:i,wrapped:s},a){n&&!(this._$Ej??(this._$Ej=new Map)).has(e)&&(this._$Ej.set(e,a??t??this[e]),s!==!0||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),i===!0&&this._$Em!==e&&(this._$Eq??(this._$Eq=new Set)).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[i,s]of this._$Ep)this[i]=s;this._$Ep=void 0}const n=this.constructor.elementProperties;if(n.size>0)for(const[i,s]of n){const{wrapped:a}=s,o=this[i];a!==!0||this._$AL.has(i)||o===void 0||this.C(i,void 0,s,o)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(t)):this._$EM()}catch(n){throw e=!1,this._$EM(),n}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&(this._$Eq=this._$Eq.forEach(t=>this._$ET(t,this[t]))),this._$EM()}updated(e){}firstUpdated(e){}};Cs.elementStyles=[],Cs.shadowRootOptions={mode:"open"},Cs[Qa("elementProperties")]=new Map,Cs[Qa("finalized")]=new Map,Fb?.({ReactiveElement:Cs}),(Zi.reactiveElementVersions??(Zi.reactiveElementVersions=[])).push("2.1.1");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Pb={attribute:!0,type:String,converter:Rc,reflect:!1,hasChanged:ud},Ub=(r=Pb,e,t)=>{const{kind:n,metadata:i}=t;let s=globalThis.litPropertyMetadata.get(i);if(s===void 0&&globalThis.litPropertyMetadata.set(i,s=new Map),n==="setter"&&((r=Object.create(r)).wrapped=!0),s.set(t.name,r),n==="accessor"){const{name:a}=t;return{set(o){const c=e.get.call(this);e.set.call(this,o),this.requestUpdate(a,c,r)},init(o){return o!==void 0&&this.C(a,void 0,r,o),o}}}if(n==="setter"){const{name:a}=t;return function(o){const c=this[a];e.call(this,o),this.requestUpdate(a,c,r)}}throw Error("Unsupported decorator location: "+n)};function De(r){return(e,t)=>typeof t=="object"?Ub(r,e,t):((n,i,s)=>{const a=i.hasOwnProperty(s);return i.constructor.createProperty(s,n),a?Object.getOwnPropertyDescriptor(i,s):void 0})(r,e,t)}/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Zc="179",Nb=0,$d=1,Ob=2,ag=1,kb=2,Ci=3,Xn=0,jt=1,Wt=2,ri=0,Rr=1,jd=2,Yd=3,Kd=4,Qb=5,Is=100,Gb=101,Hb=102,zb=103,Vb=104,Wb=200,qb=201,Xb=202,$b=203,fu=204,pu=205,jb=206,Yb=207,Kb=208,Jb=209,Zb=210,e_=211,t_=212,n_=213,i_=214,Au=0,mu=1,gu=2,kr=3,bu=4,_u=5,Eu=6,xu=7,og=0,s_=1,r_=2,ai=0,cg=1,lg=2,hg=3,ug=4,a_=5,dg=6,Xa=7,Jd="attached",o_="detached",Qr=300,Us=301,Gr=302,Bc=303,vu=304,el=306,$n=1e3,Dt=1001,Ns=1002,Ot=1003,lo=1004,ji=1005,Ze=1006,Rs=1007,hn=1008,Zd=1008,It=1009,dd=1010,fd=1011,$a=1012,tl=1013,ts=1014,Lt=1015,Nt=1016,pd=1017,Ad=1018,ja=1020,fg=35902,pg=1021,Ag=1022,xt=1023,Ya=1026,Ka=1027,Yi=1028,md=1029,ws=1030,gd=1031,bd=1033,Br=33776,Bs=33777,Dr=33778,Ds=33779,Dc=35840,yu=35841,Lc=35842,Su=35843,Fc=36196,Ja=37492,Za=37496,Ls=37808,Cu=37809,Iu=37810,Mu=37811,eo=37812,wu=37813,Tu=37814,Ru=37815,Bu=37816,Du=37817,Lu=37818,Fu=37819,Pu=37820,Uu=37821,Fs=36492,Nu=36494,Pc=36495,mg=36283,Ou=36284,ku=36285,Qu=36286,to=2200,Lr=2201,Uc=2202,Hr=2300,zr=2301,dl=2302,Sr=2400,Cr=2401,Nc=2402,_d=2500,c_=2501,l_=0,gg=1,Gu=2,h_=3200,u_=3201,bg=0,d_=1,Dn="",mt="srgb",gt="srgb-linear",Oc="linear",ut="srgb",Vs=7680,ef=519,f_=512,p_=513,A_=514,_g=515,m_=516,g_=517,b_=518,__=519,Hu=35044,tf="300 es",ii=2e3,kc=2001;class jn{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){const n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){const n=this._listeners;if(n===void 0)return;const i=n[e];if(i!==void 0){const s=i.indexOf(t);s!==-1&&i.splice(s,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const n=t[e.type];if(n!==void 0){e.target=this;const i=n.slice(0);for(let s=0,a=i.length;s<a;s++)i[s].call(this,e);e.target=null}}}const Yt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let nf=1234567;const Ga=Math.PI/180,Vr=180/Math.PI;function Wn(){const r=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Yt[r&255]+Yt[r>>8&255]+Yt[r>>16&255]+Yt[r>>24&255]+"-"+Yt[e&255]+Yt[e>>8&255]+"-"+Yt[e>>16&15|64]+Yt[e>>24&255]+"-"+Yt[t&63|128]+Yt[t>>8&255]+"-"+Yt[t>>16&255]+Yt[t>>24&255]+Yt[n&255]+Yt[n>>8&255]+Yt[n>>16&255]+Yt[n>>24&255]).toLowerCase()}function qe(r,e,t){return Math.max(e,Math.min(t,r))}function Ed(r,e){return(r%e+e)%e}function E_(r,e,t,n,i){return n+(r-e)*(i-n)/(t-e)}function x_(r,e,t){return r!==e?(t-r)/(e-r):0}function Ha(r,e,t){return(1-t)*r+t*e}function v_(r,e,t,n){return Ha(r,e,1-Math.exp(-t*n))}function y_(r,e=1){return e-Math.abs(Ed(r,e*2)-e)}function S_(r,e,t){return r<=e?0:r>=t?1:(r=(r-e)/(t-e),r*r*(3-2*r))}function C_(r,e,t){return r<=e?0:r>=t?1:(r=(r-e)/(t-e),r*r*r*(r*(r*6-15)+10))}function I_(r,e){return r+Math.floor(Math.random()*(e-r+1))}function M_(r,e){return r+Math.random()*(e-r)}function w_(r){return r*(.5-Math.random())}function T_(r){r!==void 0&&(nf=r);let e=nf+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function R_(r){return r*Ga}function B_(r){return r*Vr}function D_(r){return(r&r-1)===0&&r!==0}function L_(r){return Math.pow(2,Math.ceil(Math.log(r)/Math.LN2))}function F_(r){return Math.pow(2,Math.floor(Math.log(r)/Math.LN2))}function P_(r,e,t,n,i){const s=Math.cos,a=Math.sin,o=s(t/2),c=a(t/2),l=s((e+n)/2),u=a((e+n)/2),h=s((e-n)/2),d=a((e-n)/2),f=s((n-e)/2),A=a((n-e)/2);switch(i){case"XYX":r.set(o*u,c*h,c*d,o*l);break;case"YZY":r.set(c*d,o*u,c*h,o*l);break;case"ZXZ":r.set(c*h,c*d,o*u,o*l);break;case"XZX":r.set(o*u,c*A,c*f,o*l);break;case"YXY":r.set(c*f,o*u,c*A,o*l);break;case"ZYZ":r.set(c*A,c*f,o*u,o*l);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+i)}}function Hn(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return r/4294967295;case Uint16Array:return r/65535;case Uint8Array:return r/255;case Int32Array:return Math.max(r/2147483647,-1);case Int16Array:return Math.max(r/32767,-1);case Int8Array:return Math.max(r/127,-1);default:throw new Error("Invalid component type.")}}function ct(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return Math.round(r*4294967295);case Uint16Array:return Math.round(r*65535);case Uint8Array:return Math.round(r*255);case Int32Array:return Math.round(r*2147483647);case Int16Array:return Math.round(r*32767);case Int8Array:return Math.round(r*127);default:throw new Error("Invalid component type.")}}const Qc={DEG2RAD:Ga,RAD2DEG:Vr,generateUUID:Wn,clamp:qe,euclideanModulo:Ed,mapLinear:E_,inverseLerp:x_,lerp:Ha,damp:v_,pingpong:y_,smoothstep:S_,smootherstep:C_,randInt:I_,randFloat:M_,randFloatSpread:w_,seededRandom:T_,degToRad:R_,radToDeg:B_,isPowerOfTwo:D_,ceilPowerOfTwo:L_,floorPowerOfTwo:F_,setQuaternionFromProperEuler:P_,normalize:ct,denormalize:Hn};class ke{constructor(e=0,t=0){ke.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=qe(this.x,e.x,t.x),this.y=qe(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=qe(this.x,e,t),this.y=qe(this.y,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(qe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(qe(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),i=Math.sin(t),s=this.x-e.x,a=this.y-e.y;return this.x=s*n-a*i+e.x,this.y=s*i+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class un{constructor(e=0,t=0,n=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=i}static slerpFlat(e,t,n,i,s,a,o){let c=n[i+0],l=n[i+1],u=n[i+2],h=n[i+3];const d=s[a+0],f=s[a+1],A=s[a+2],g=s[a+3];if(o===0){e[t+0]=c,e[t+1]=l,e[t+2]=u,e[t+3]=h;return}if(o===1){e[t+0]=d,e[t+1]=f,e[t+2]=A,e[t+3]=g;return}if(h!==g||c!==d||l!==f||u!==A){let m=1-o;const p=c*d+l*f+u*A+h*g,E=p>=0?1:-1,_=1-p*p;if(_>Number.EPSILON){const x=Math.sqrt(_),I=Math.atan2(x,p*E);m=Math.sin(m*I)/x,o=Math.sin(o*I)/x}const b=o*E;if(c=c*m+d*b,l=l*m+f*b,u=u*m+A*b,h=h*m+g*b,m===1-o){const x=1/Math.sqrt(c*c+l*l+u*u+h*h);c*=x,l*=x,u*=x,h*=x}}e[t]=c,e[t+1]=l,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,n,i,s,a){const o=n[i],c=n[i+1],l=n[i+2],u=n[i+3],h=s[a],d=s[a+1],f=s[a+2],A=s[a+3];return e[t]=o*A+u*h+c*f-l*d,e[t+1]=c*A+u*d+l*h-o*f,e[t+2]=l*A+u*f+o*d-c*h,e[t+3]=u*A-o*h-c*d-l*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,i=e._y,s=e._z,a=e._order,o=Math.cos,c=Math.sin,l=o(n/2),u=o(i/2),h=o(s/2),d=c(n/2),f=c(i/2),A=c(s/2);switch(a){case"XYZ":this._x=d*u*h+l*f*A,this._y=l*f*h-d*u*A,this._z=l*u*A+d*f*h,this._w=l*u*h-d*f*A;break;case"YXZ":this._x=d*u*h+l*f*A,this._y=l*f*h-d*u*A,this._z=l*u*A-d*f*h,this._w=l*u*h+d*f*A;break;case"ZXY":this._x=d*u*h-l*f*A,this._y=l*f*h+d*u*A,this._z=l*u*A+d*f*h,this._w=l*u*h-d*f*A;break;case"ZYX":this._x=d*u*h-l*f*A,this._y=l*f*h+d*u*A,this._z=l*u*A-d*f*h,this._w=l*u*h+d*f*A;break;case"YZX":this._x=d*u*h+l*f*A,this._y=l*f*h+d*u*A,this._z=l*u*A-d*f*h,this._w=l*u*h-d*f*A;break;case"XZY":this._x=d*u*h-l*f*A,this._y=l*f*h-d*u*A,this._z=l*u*A+d*f*h,this._w=l*u*h+d*f*A;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],i=t[4],s=t[8],a=t[1],o=t[5],c=t[9],l=t[2],u=t[6],h=t[10],d=n+o+h;if(d>0){const f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(u-c)*f,this._y=(s-l)*f,this._z=(a-i)*f}else if(n>o&&n>h){const f=2*Math.sqrt(1+n-o-h);this._w=(u-c)/f,this._x=.25*f,this._y=(i+a)/f,this._z=(s+l)/f}else if(o>h){const f=2*Math.sqrt(1+o-n-h);this._w=(s-l)/f,this._x=(i+a)/f,this._y=.25*f,this._z=(c+u)/f}else{const f=2*Math.sqrt(1+h-n-o);this._w=(a-i)/f,this._x=(s+l)/f,this._y=(c+u)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(qe(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,i=e._y,s=e._z,a=e._w,o=t._x,c=t._y,l=t._z,u=t._w;return this._x=n*u+a*o+i*l-s*c,this._y=i*u+a*c+s*o-n*l,this._z=s*u+a*l+n*c-i*o,this._w=a*u-n*o-i*c-s*l,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,i=this._y,s=this._z,a=this._w;let o=a*e._w+n*e._x+i*e._y+s*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=n,this._y=i,this._z=s,this;const c=1-o*o;if(c<=Number.EPSILON){const f=1-t;return this._w=f*a+t*this._w,this._x=f*n+t*this._x,this._y=f*i+t*this._y,this._z=f*s+t*this._z,this.normalize(),this}const l=Math.sqrt(c),u=Math.atan2(l,o),h=Math.sin((1-t)*u)/l,d=Math.sin(t*u)/l;return this._w=a*h+this._w*d,this._x=n*h+this._x*d,this._y=i*h+this._y*d,this._z=s*h+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),s=Math.sqrt(n);return this.set(i*Math.sin(e),i*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class B{constructor(e=0,t=0,n=0){B.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(sf.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(sf.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,i=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*i,this.y=s[1]*t+s[4]*n+s[7]*i,this.z=s[2]*t+s[5]*n+s[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,s=e.elements,a=1/(s[3]*t+s[7]*n+s[11]*i+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*i+s[12])*a,this.y=(s[1]*t+s[5]*n+s[9]*i+s[13])*a,this.z=(s[2]*t+s[6]*n+s[10]*i+s[14])*a,this}applyQuaternion(e){const t=this.x,n=this.y,i=this.z,s=e.x,a=e.y,o=e.z,c=e.w,l=2*(a*i-o*n),u=2*(o*t-s*i),h=2*(s*n-a*t);return this.x=t+c*l+a*h-o*u,this.y=n+c*u+o*l-s*h,this.z=i+c*h+s*u-a*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,i=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*i,this.y=s[1]*t+s[5]*n+s[9]*i,this.z=s[2]*t+s[6]*n+s[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=qe(this.x,e.x,t.x),this.y=qe(this.y,e.y,t.y),this.z=qe(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=qe(this.x,e,t),this.y=qe(this.y,e,t),this.z=qe(this.z,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(qe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,i=e.y,s=e.z,a=t.x,o=t.y,c=t.z;return this.x=i*c-s*o,this.y=s*a-n*c,this.z=n*o-i*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return fl.copy(this).projectOnVector(e),this.sub(fl)}reflect(e){return this.sub(fl.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(qe(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const fl=new B,sf=new un;class Qe{constructor(e,t,n,i,s,a,o,c,l){Qe.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,i,s,a,o,c,l)}set(e,t,n,i,s,a,o,c,l){const u=this.elements;return u[0]=e,u[1]=i,u[2]=o,u[3]=t,u[4]=s,u[5]=c,u[6]=n,u[7]=a,u[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,s=this.elements,a=n[0],o=n[3],c=n[6],l=n[1],u=n[4],h=n[7],d=n[2],f=n[5],A=n[8],g=i[0],m=i[3],p=i[6],E=i[1],_=i[4],b=i[7],x=i[2],I=i[5],M=i[8];return s[0]=a*g+o*E+c*x,s[3]=a*m+o*_+c*I,s[6]=a*p+o*b+c*M,s[1]=l*g+u*E+h*x,s[4]=l*m+u*_+h*I,s[7]=l*p+u*b+h*M,s[2]=d*g+f*E+A*x,s[5]=d*m+f*_+A*I,s[8]=d*p+f*b+A*M,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],a=e[4],o=e[5],c=e[6],l=e[7],u=e[8];return t*a*u-t*o*l-n*s*u+n*o*c+i*s*l-i*a*c}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],a=e[4],o=e[5],c=e[6],l=e[7],u=e[8],h=u*a-o*l,d=o*c-u*s,f=l*s-a*c,A=t*h+n*d+i*f;if(A===0)return this.set(0,0,0,0,0,0,0,0,0);const g=1/A;return e[0]=h*g,e[1]=(i*l-u*n)*g,e[2]=(o*n-i*a)*g,e[3]=d*g,e[4]=(u*t-i*c)*g,e[5]=(i*s-o*t)*g,e[6]=f*g,e[7]=(n*c-l*t)*g,e[8]=(a*t-n*s)*g,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,s,a,o){const c=Math.cos(s),l=Math.sin(s);return this.set(n*c,n*l,-n*(c*a+l*o)+a+e,-i*l,i*c,-i*(-l*a+c*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(pl.makeScale(e,t)),this}rotate(e){return this.premultiply(pl.makeRotation(-e)),this}translate(e,t){return this.premultiply(pl.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const pl=new Qe;function Eg(r){for(let e=r.length-1;e>=0;--e)if(r[e]>=65535)return!0;return!1}function no(r){return document.createElementNS("http://www.w3.org/1999/xhtml",r)}function U_(){const r=no("canvas");return r.style.display="block",r}const rf={};function Fr(r){r in rf||(rf[r]=!0,console.warn(r))}function N_(r,e,t){return new Promise(function(n,i){function s(){switch(r.clientWaitSync(e,r.SYNC_FLUSH_COMMANDS_BIT,0)){case r.WAIT_FAILED:i();break;case r.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:n()}}setTimeout(s,t)})}const af=new Qe().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),of=new Qe().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function O_(){const r={enabled:!0,workingColorSpace:gt,spaces:{},convert:function(i,s,a){return this.enabled===!1||s===a||!s||!a||(this.spaces[s].transfer===ut&&(i.r=Bi(i.r),i.g=Bi(i.g),i.b=Bi(i.b)),this.spaces[s].primaries!==this.spaces[a].primaries&&(i.applyMatrix3(this.spaces[s].toXYZ),i.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===ut&&(i.r=Pr(i.r),i.g=Pr(i.g),i.b=Pr(i.b))),i},workingToColorSpace:function(i,s){return this.convert(i,this.workingColorSpace,s)},colorSpaceToWorking:function(i,s){return this.convert(i,s,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===Dn?Oc:this.spaces[i].transfer},getLuminanceCoefficients:function(i,s=this.workingColorSpace){return i.fromArray(this.spaces[s].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,s,a){return i.copy(this.spaces[s].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(i,s){return Fr("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),r.workingToColorSpace(i,s)},toWorkingColorSpace:function(i,s){return Fr("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),r.colorSpaceToWorking(i,s)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return r.define({[gt]:{primaries:e,whitePoint:n,transfer:Oc,toXYZ:af,fromXYZ:of,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:mt},outputColorSpaceConfig:{drawingBufferColorSpace:mt}},[mt]:{primaries:e,whitePoint:n,transfer:ut,toXYZ:af,fromXYZ:of,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:mt}}}),r}const Je=O_();function Bi(r){return r<.04045?r*.0773993808:Math.pow(r*.9478672986+.0521327014,2.4)}function Pr(r){return r<.0031308?r*12.92:1.055*Math.pow(r,.41666)-.055}let Ws;class xg{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Ws===void 0&&(Ws=no("canvas")),Ws.width=e.width,Ws.height=e.height;const i=Ws.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),n=Ws}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=no("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const i=n.getImageData(0,0,e.width,e.height),s=i.data;for(let a=0;a<s.length;a++)s[a]=Bi(s[a]/255)*255;return n.putImageData(i,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Bi(t[n]/255)*255):t[n]=Bi(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let k_=0;class nl{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:k_++}),this.uuid=Wn(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let s;if(Array.isArray(i)){s=[];for(let a=0,o=i.length;a<o;a++)i[a].isDataTexture?s.push(Al(i[a].image)):s.push(Al(i[a]))}else s=Al(i);n.url=s}return t||(e.images[this.uuid]=n),n}}function Al(r){return typeof HTMLImageElement<"u"&&r instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&r instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&r instanceof ImageBitmap?xg.getDataURL(r):r.data?{data:Array.from(r.data),width:r.width,height:r.height,type:r.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let Q_=0;const ml=new B;let vt=class Ec extends jn{constructor(e=Ec.DEFAULT_IMAGE,t=Ec.DEFAULT_MAPPING,n=Dt,i=Dt,s=Ze,a=hn,o=xt,c=It,l=Ec.DEFAULT_ANISOTROPY,u=Dn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Q_++}),this.uuid=Wn(),this.name="",this.source=new nl(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=s,this.minFilter=a,this.anisotropy=l,this.format=o,this.internalFormat=null,this.type=c,this.offset=new ke(0,0),this.repeat=new ke(1,1),this.center=new ke(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Qe,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(ml).x}get height(){return this.source.getSize(ml).y}get depth(){return this.source.getSize(ml).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const i=this[t];if(i===void 0){console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`);continue}i&&n&&i.isVector2&&n.isVector2||i&&n&&i.isVector3&&n.isVector3||i&&n&&i.isMatrix3&&n.isMatrix3?i.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Qr)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case $n:e.x=e.x-Math.floor(e.x);break;case Dt:e.x=e.x<0?0:1;break;case Ns:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case $n:e.y=e.y-Math.floor(e.y);break;case Dt:e.y=e.y<0?0:1;break;case Ns:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};vt.DEFAULT_IMAGE=null;vt.DEFAULT_MAPPING=Qr;vt.DEFAULT_ANISOTROPY=1;class it{constructor(e=0,t=0,n=0,i=1){it.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,s=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*i+a[12]*s,this.y=a[1]*t+a[5]*n+a[9]*i+a[13]*s,this.z=a[2]*t+a[6]*n+a[10]*i+a[14]*s,this.w=a[3]*t+a[7]*n+a[11]*i+a[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,i,s;const c=e.elements,l=c[0],u=c[4],h=c[8],d=c[1],f=c[5],A=c[9],g=c[2],m=c[6],p=c[10];if(Math.abs(u-d)<.01&&Math.abs(h-g)<.01&&Math.abs(A-m)<.01){if(Math.abs(u+d)<.1&&Math.abs(h+g)<.1&&Math.abs(A+m)<.1&&Math.abs(l+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const _=(l+1)/2,b=(f+1)/2,x=(p+1)/2,I=(u+d)/4,M=(h+g)/4,w=(A+m)/4;return _>b&&_>x?_<.01?(n=0,i=.707106781,s=.707106781):(n=Math.sqrt(_),i=I/n,s=M/n):b>x?b<.01?(n=.707106781,i=0,s=.707106781):(i=Math.sqrt(b),n=I/i,s=w/i):x<.01?(n=.707106781,i=.707106781,s=0):(s=Math.sqrt(x),n=M/s,i=w/s),this.set(n,i,s,t),this}let E=Math.sqrt((m-A)*(m-A)+(h-g)*(h-g)+(d-u)*(d-u));return Math.abs(E)<.001&&(E=1),this.x=(m-A)/E,this.y=(h-g)/E,this.z=(d-u)/E,this.w=Math.acos((l+f+p-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=qe(this.x,e.x,t.x),this.y=qe(this.y,e.y,t.y),this.z=qe(this.z,e.z,t.z),this.w=qe(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=qe(this.x,e,t),this.y=qe(this.y,e,t),this.z=qe(this.z,e,t),this.w=qe(this.w,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(qe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class G_ extends jn{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Ze,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new it(0,0,e,t),this.scissorTest=!1,this.viewport=new it(0,0,e,t);const i={width:e,height:t,depth:n.depth},s=new vt(i);this.textures=[];const a=n.count;for(let o=0;o<a;o++)this.textures[o]=s.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){const t={minFilter:Ze,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let i=0,s=this.textures.length;i<s;i++)this.textures[i].image.width=e,this.textures[i].image.height=t,this.textures[i].image.depth=n,this.textures[i].isArrayTexture=this.textures[i].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const i=Object.assign({},e.textures[t].image);this.textures[t].source=new nl(i)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Pn extends G_{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class vg extends vt{constructor(e=null,t=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=Ot,this.minFilter=Ot,this.wrapR=Dt,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class yg extends vt{constructor(e=null,t=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=Ot,this.minFilter=Ot,this.wrapR=Dt,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class ln{constructor(e=new B(1/0,1/0,1/0),t=new B(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(On.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(On.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=On.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const s=n.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=s.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,On):On.fromBufferAttribute(s,a),On.applyMatrix4(e.matrixWorld),this.expandByPoint(On);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),bo.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),bo.copy(n.boundingBox)),bo.applyMatrix4(e.matrixWorld),this.union(bo)}const i=e.children;for(let s=0,a=i.length;s<a;s++)this.expandByObject(i[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,On),On.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(sa),_o.subVectors(this.max,sa),qs.subVectors(e.a,sa),Xs.subVectors(e.b,sa),$s.subVectors(e.c,sa),Pi.subVectors(Xs,qs),Ui.subVectors($s,Xs),rs.subVectors(qs,$s);let t=[0,-Pi.z,Pi.y,0,-Ui.z,Ui.y,0,-rs.z,rs.y,Pi.z,0,-Pi.x,Ui.z,0,-Ui.x,rs.z,0,-rs.x,-Pi.y,Pi.x,0,-Ui.y,Ui.x,0,-rs.y,rs.x,0];return!gl(t,qs,Xs,$s,_o)||(t=[1,0,0,0,1,0,0,0,1],!gl(t,qs,Xs,$s,_o))?!1:(Eo.crossVectors(Pi,Ui),t=[Eo.x,Eo.y,Eo.z],gl(t,qs,Xs,$s,_o))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,On).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(On).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(di[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),di[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),di[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),di[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),di[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),di[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),di[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),di[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(di),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const di=[new B,new B,new B,new B,new B,new B,new B,new B],On=new B,bo=new ln,qs=new B,Xs=new B,$s=new B,Pi=new B,Ui=new B,rs=new B,sa=new B,_o=new B,Eo=new B,as=new B;function gl(r,e,t,n,i){for(let s=0,a=r.length-3;s<=a;s+=3){as.fromArray(r,s);const o=i.x*Math.abs(as.x)+i.y*Math.abs(as.y)+i.z*Math.abs(as.z),c=e.dot(as),l=t.dot(as),u=n.dot(as);if(Math.max(-Math.max(c,l,u),Math.min(c,l,u))>o)return!1}return!0}const H_=new ln,ra=new B,bl=new B;class Nn{constructor(e=new B,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):H_.setFromPoints(e).getCenter(n);let i=0;for(let s=0,a=e.length;s<a;s++)i=Math.max(i,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;ra.subVectors(e,this.center);const t=ra.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),i=(n-this.radius)*.5;this.center.addScaledVector(ra,i/n),this.radius+=i}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(bl.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(ra.copy(e.center).add(bl)),this.expandByPoint(ra.copy(e.center).sub(bl))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}const fi=new B,_l=new B,xo=new B,Ni=new B,El=new B,vo=new B,xl=new B;class ho{constructor(e=new B,t=new B(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,fi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=fi.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(fi.copy(this.origin).addScaledVector(this.direction,t),fi.distanceToSquared(e))}distanceSqToSegment(e,t,n,i){_l.copy(e).add(t).multiplyScalar(.5),xo.copy(t).sub(e).normalize(),Ni.copy(this.origin).sub(_l);const s=e.distanceTo(t)*.5,a=-this.direction.dot(xo),o=Ni.dot(this.direction),c=-Ni.dot(xo),l=Ni.lengthSq(),u=Math.abs(1-a*a);let h,d,f,A;if(u>0)if(h=a*c-o,d=a*o-c,A=s*u,h>=0)if(d>=-A)if(d<=A){const g=1/u;h*=g,d*=g,f=h*(h+a*d+2*o)+d*(a*h+d+2*c)+l}else d=s,h=Math.max(0,-(a*d+o)),f=-h*h+d*(d+2*c)+l;else d=-s,h=Math.max(0,-(a*d+o)),f=-h*h+d*(d+2*c)+l;else d<=-A?(h=Math.max(0,-(-a*s+o)),d=h>0?-s:Math.min(Math.max(-s,-c),s),f=-h*h+d*(d+2*c)+l):d<=A?(h=0,d=Math.min(Math.max(-s,-c),s),f=d*(d+2*c)+l):(h=Math.max(0,-(a*s+o)),d=h>0?s:Math.min(Math.max(-s,-c),s),f=-h*h+d*(d+2*c)+l);else d=a>0?-s:s,h=Math.max(0,-(a*d+o)),f=-h*h+d*(d+2*c)+l;return n&&n.copy(this.origin).addScaledVector(this.direction,h),i&&i.copy(_l).addScaledVector(xo,d),f}intersectSphere(e,t){fi.subVectors(e.center,this.origin);const n=fi.dot(this.direction),i=fi.dot(fi)-n*n,s=e.radius*e.radius;if(i>s)return null;const a=Math.sqrt(s-i),o=n-a,c=n+a;return c<0?null:o<0?this.at(c,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,i,s,a,o,c;const l=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,d=this.origin;return l>=0?(n=(e.min.x-d.x)*l,i=(e.max.x-d.x)*l):(n=(e.max.x-d.x)*l,i=(e.min.x-d.x)*l),u>=0?(s=(e.min.y-d.y)*u,a=(e.max.y-d.y)*u):(s=(e.max.y-d.y)*u,a=(e.min.y-d.y)*u),n>a||s>i||((s>n||isNaN(n))&&(n=s),(a<i||isNaN(i))&&(i=a),h>=0?(o=(e.min.z-d.z)*h,c=(e.max.z-d.z)*h):(o=(e.max.z-d.z)*h,c=(e.min.z-d.z)*h),n>c||o>i)||((o>n||n!==n)&&(n=o),(c<i||i!==i)&&(i=c),i<0)?null:this.at(n>=0?n:i,t)}intersectsBox(e){return this.intersectBox(e,fi)!==null}intersectTriangle(e,t,n,i,s){El.subVectors(t,e),vo.subVectors(n,e),xl.crossVectors(El,vo);let a=this.direction.dot(xl),o;if(a>0){if(i)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Ni.subVectors(this.origin,e);const c=o*this.direction.dot(vo.crossVectors(Ni,vo));if(c<0)return null;const l=o*this.direction.dot(El.cross(Ni));if(l<0||c+l>a)return null;const u=-o*Ni.dot(xl);return u<0?null:this.at(u/a,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Ne{constructor(e,t,n,i,s,a,o,c,l,u,h,d,f,A,g,m){Ne.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,i,s,a,o,c,l,u,h,d,f,A,g,m)}set(e,t,n,i,s,a,o,c,l,u,h,d,f,A,g,m){const p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=i,p[1]=s,p[5]=a,p[9]=o,p[13]=c,p[2]=l,p[6]=u,p[10]=h,p[14]=d,p[3]=f,p[7]=A,p[11]=g,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Ne().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,i=1/js.setFromMatrixColumn(e,0).length(),s=1/js.setFromMatrixColumn(e,1).length(),a=1/js.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,i=e.y,s=e.z,a=Math.cos(n),o=Math.sin(n),c=Math.cos(i),l=Math.sin(i),u=Math.cos(s),h=Math.sin(s);if(e.order==="XYZ"){const d=a*u,f=a*h,A=o*u,g=o*h;t[0]=c*u,t[4]=-c*h,t[8]=l,t[1]=f+A*l,t[5]=d-g*l,t[9]=-o*c,t[2]=g-d*l,t[6]=A+f*l,t[10]=a*c}else if(e.order==="YXZ"){const d=c*u,f=c*h,A=l*u,g=l*h;t[0]=d+g*o,t[4]=A*o-f,t[8]=a*l,t[1]=a*h,t[5]=a*u,t[9]=-o,t[2]=f*o-A,t[6]=g+d*o,t[10]=a*c}else if(e.order==="ZXY"){const d=c*u,f=c*h,A=l*u,g=l*h;t[0]=d-g*o,t[4]=-a*h,t[8]=A+f*o,t[1]=f+A*o,t[5]=a*u,t[9]=g-d*o,t[2]=-a*l,t[6]=o,t[10]=a*c}else if(e.order==="ZYX"){const d=a*u,f=a*h,A=o*u,g=o*h;t[0]=c*u,t[4]=A*l-f,t[8]=d*l+g,t[1]=c*h,t[5]=g*l+d,t[9]=f*l-A,t[2]=-l,t[6]=o*c,t[10]=a*c}else if(e.order==="YZX"){const d=a*c,f=a*l,A=o*c,g=o*l;t[0]=c*u,t[4]=g-d*h,t[8]=A*h+f,t[1]=h,t[5]=a*u,t[9]=-o*u,t[2]=-l*u,t[6]=f*h+A,t[10]=d-g*h}else if(e.order==="XZY"){const d=a*c,f=a*l,A=o*c,g=o*l;t[0]=c*u,t[4]=-h,t[8]=l*u,t[1]=d*h+g,t[5]=a*u,t[9]=f*h-A,t[2]=A*h-f,t[6]=o*u,t[10]=g*h+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(z_,e,V_)}lookAt(e,t,n){const i=this.elements;return bn.subVectors(e,t),bn.lengthSq()===0&&(bn.z=1),bn.normalize(),Oi.crossVectors(n,bn),Oi.lengthSq()===0&&(Math.abs(n.z)===1?bn.x+=1e-4:bn.z+=1e-4,bn.normalize(),Oi.crossVectors(n,bn)),Oi.normalize(),yo.crossVectors(bn,Oi),i[0]=Oi.x,i[4]=yo.x,i[8]=bn.x,i[1]=Oi.y,i[5]=yo.y,i[9]=bn.y,i[2]=Oi.z,i[6]=yo.z,i[10]=bn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,s=this.elements,a=n[0],o=n[4],c=n[8],l=n[12],u=n[1],h=n[5],d=n[9],f=n[13],A=n[2],g=n[6],m=n[10],p=n[14],E=n[3],_=n[7],b=n[11],x=n[15],I=i[0],M=i[4],w=i[8],v=i[12],y=i[1],T=i[5],k=i[9],U=i[13],F=i[2],H=i[6],O=i[10],W=i[14],Q=i[3],Y=i[7],Z=i[11],re=i[15];return s[0]=a*I+o*y+c*F+l*Q,s[4]=a*M+o*T+c*H+l*Y,s[8]=a*w+o*k+c*O+l*Z,s[12]=a*v+o*U+c*W+l*re,s[1]=u*I+h*y+d*F+f*Q,s[5]=u*M+h*T+d*H+f*Y,s[9]=u*w+h*k+d*O+f*Z,s[13]=u*v+h*U+d*W+f*re,s[2]=A*I+g*y+m*F+p*Q,s[6]=A*M+g*T+m*H+p*Y,s[10]=A*w+g*k+m*O+p*Z,s[14]=A*v+g*U+m*W+p*re,s[3]=E*I+_*y+b*F+x*Q,s[7]=E*M+_*T+b*H+x*Y,s[11]=E*w+_*k+b*O+x*Z,s[15]=E*v+_*U+b*W+x*re,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],i=e[8],s=e[12],a=e[1],o=e[5],c=e[9],l=e[13],u=e[2],h=e[6],d=e[10],f=e[14],A=e[3],g=e[7],m=e[11],p=e[15];return A*(+s*c*h-i*l*h-s*o*d+n*l*d+i*o*f-n*c*f)+g*(+t*c*f-t*l*d+s*a*d-i*a*f+i*l*u-s*c*u)+m*(+t*l*h-t*o*f-s*a*h+n*a*f+s*o*u-n*l*u)+p*(-i*o*u-t*c*h+t*o*d+i*a*h-n*a*d+n*c*u)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const i=this.elements;return e.isVector3?(i[12]=e.x,i[13]=e.y,i[14]=e.z):(i[12]=e,i[13]=t,i[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],a=e[4],o=e[5],c=e[6],l=e[7],u=e[8],h=e[9],d=e[10],f=e[11],A=e[12],g=e[13],m=e[14],p=e[15],E=h*m*l-g*d*l+g*c*f-o*m*f-h*c*p+o*d*p,_=A*d*l-u*m*l-A*c*f+a*m*f+u*c*p-a*d*p,b=u*g*l-A*h*l+A*o*f-a*g*f-u*o*p+a*h*p,x=A*h*c-u*g*c-A*o*d+a*g*d+u*o*m-a*h*m,I=t*E+n*_+i*b+s*x;if(I===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const M=1/I;return e[0]=E*M,e[1]=(g*d*s-h*m*s-g*i*f+n*m*f+h*i*p-n*d*p)*M,e[2]=(o*m*s-g*c*s+g*i*l-n*m*l-o*i*p+n*c*p)*M,e[3]=(h*c*s-o*d*s-h*i*l+n*d*l+o*i*f-n*c*f)*M,e[4]=_*M,e[5]=(u*m*s-A*d*s+A*i*f-t*m*f-u*i*p+t*d*p)*M,e[6]=(A*c*s-a*m*s-A*i*l+t*m*l+a*i*p-t*c*p)*M,e[7]=(a*d*s-u*c*s+u*i*l-t*d*l-a*i*f+t*c*f)*M,e[8]=b*M,e[9]=(A*h*s-u*g*s-A*n*f+t*g*f+u*n*p-t*h*p)*M,e[10]=(a*g*s-A*o*s+A*n*l-t*g*l-a*n*p+t*o*p)*M,e[11]=(u*o*s-a*h*s-u*n*l+t*h*l+a*n*f-t*o*f)*M,e[12]=x*M,e[13]=(u*g*i-A*h*i+A*n*d-t*g*d-u*n*m+t*h*m)*M,e[14]=(A*o*i-a*g*i-A*n*c+t*g*c+a*n*m-t*o*m)*M,e[15]=(a*h*i-u*o*i+u*n*c-t*h*c-a*n*d+t*o*d)*M,this}scale(e){const t=this.elements,n=e.x,i=e.y,s=e.z;return t[0]*=n,t[4]*=i,t[8]*=s,t[1]*=n,t[5]*=i,t[9]*=s,t[2]*=n,t[6]*=i,t[10]*=s,t[3]*=n,t[7]*=i,t[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),i=Math.sin(t),s=1-n,a=e.x,o=e.y,c=e.z,l=s*a,u=s*o;return this.set(l*a+n,l*o-i*c,l*c+i*o,0,l*o+i*c,u*o+n,u*c-i*a,0,l*c-i*o,u*c+i*a,s*c*c+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,i,s,a){return this.set(1,n,s,0,e,1,a,0,t,i,1,0,0,0,0,1),this}compose(e,t,n){const i=this.elements,s=t._x,a=t._y,o=t._z,c=t._w,l=s+s,u=a+a,h=o+o,d=s*l,f=s*u,A=s*h,g=a*u,m=a*h,p=o*h,E=c*l,_=c*u,b=c*h,x=n.x,I=n.y,M=n.z;return i[0]=(1-(g+p))*x,i[1]=(f+b)*x,i[2]=(A-_)*x,i[3]=0,i[4]=(f-b)*I,i[5]=(1-(d+p))*I,i[6]=(m+E)*I,i[7]=0,i[8]=(A+_)*M,i[9]=(m-E)*M,i[10]=(1-(d+g))*M,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){const i=this.elements;let s=js.set(i[0],i[1],i[2]).length();const a=js.set(i[4],i[5],i[6]).length(),o=js.set(i[8],i[9],i[10]).length();this.determinant()<0&&(s=-s),e.x=i[12],e.y=i[13],e.z=i[14],kn.copy(this);const l=1/s,u=1/a,h=1/o;return kn.elements[0]*=l,kn.elements[1]*=l,kn.elements[2]*=l,kn.elements[4]*=u,kn.elements[5]*=u,kn.elements[6]*=u,kn.elements[8]*=h,kn.elements[9]*=h,kn.elements[10]*=h,t.setFromRotationMatrix(kn),n.x=s,n.y=a,n.z=o,this}makePerspective(e,t,n,i,s,a,o=ii,c=!1){const l=this.elements,u=2*s/(t-e),h=2*s/(n-i),d=(t+e)/(t-e),f=(n+i)/(n-i);let A,g;if(c)A=s/(a-s),g=a*s/(a-s);else if(o===ii)A=-(a+s)/(a-s),g=-2*a*s/(a-s);else if(o===kc)A=-a/(a-s),g=-a*s/(a-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=u,l[4]=0,l[8]=d,l[12]=0,l[1]=0,l[5]=h,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=A,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,i,s,a,o=ii,c=!1){const l=this.elements,u=2/(t-e),h=2/(n-i),d=-(t+e)/(t-e),f=-(n+i)/(n-i);let A,g;if(c)A=1/(a-s),g=a/(a-s);else if(o===ii)A=-2/(a-s),g=-(a+s)/(a-s);else if(o===kc)A=-1/(a-s),g=-s/(a-s);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=u,l[4]=0,l[8]=0,l[12]=d,l[1]=0,l[5]=h,l[9]=0,l[13]=f,l[2]=0,l[6]=0,l[10]=A,l[14]=g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const js=new B,kn=new Ne,z_=new B(0,0,0),V_=new B(1,1,1),Oi=new B,yo=new B,bn=new B,cf=new Ne,lf=new un;class Un{constructor(e=0,t=0,n=0,i=Un.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i=this._order){return this._x=e,this._y=t,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const i=e.elements,s=i[0],a=i[4],o=i[8],c=i[1],l=i[5],u=i[9],h=i[2],d=i[6],f=i[10];switch(t){case"XYZ":this._y=Math.asin(qe(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,f),this._z=Math.atan2(-a,s)):(this._x=Math.atan2(d,l),this._z=0);break;case"YXZ":this._x=Math.asin(-qe(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-h,s),this._z=0);break;case"ZXY":this._x=Math.asin(qe(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-h,f),this._z=Math.atan2(-a,l)):(this._y=0,this._z=Math.atan2(c,s));break;case"ZYX":this._y=Math.asin(-qe(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(c,s)):(this._x=0,this._z=Math.atan2(-a,l));break;case"YZX":this._z=Math.asin(qe(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-u,l),this._y=Math.atan2(-h,s)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-qe(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,l),this._y=Math.atan2(o,s)):(this._x=Math.atan2(-u,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return cf.makeRotationFromQuaternion(e),this.setFromRotationMatrix(cf,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return lf.setFromEuler(this),this.setFromQuaternion(lf,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Un.DEFAULT_ORDER="XYZ";class xd{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let W_=0;const hf=new B,Ys=new un,pi=new Ne,So=new B,aa=new B,q_=new B,X_=new un,uf=new B(1,0,0),df=new B(0,1,0),ff=new B(0,0,1),pf={type:"added"},$_={type:"removed"},Ks={type:"childadded",child:null},vl={type:"childremoved",child:null};class pt extends jn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:W_++}),this.uuid=Wn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=pt.DEFAULT_UP.clone();const e=new B,t=new Un,n=new un,i=new B(1,1,1);function s(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(s),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Ne},normalMatrix:{value:new Qe}}),this.matrix=new Ne,this.matrixWorld=new Ne,this.matrixAutoUpdate=pt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=pt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new xd,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Ys.setFromAxisAngle(e,t),this.quaternion.multiply(Ys),this}rotateOnWorldAxis(e,t){return Ys.setFromAxisAngle(e,t),this.quaternion.premultiply(Ys),this}rotateX(e){return this.rotateOnAxis(uf,e)}rotateY(e){return this.rotateOnAxis(df,e)}rotateZ(e){return this.rotateOnAxis(ff,e)}translateOnAxis(e,t){return hf.copy(e).applyQuaternion(this.quaternion),this.position.add(hf.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(uf,e)}translateY(e){return this.translateOnAxis(df,e)}translateZ(e){return this.translateOnAxis(ff,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(pi.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?So.copy(e):So.set(e,t,n);const i=this.parent;this.updateWorldMatrix(!0,!1),aa.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?pi.lookAt(aa,So,this.up):pi.lookAt(So,aa,this.up),this.quaternion.setFromRotationMatrix(pi),i&&(pi.extractRotation(i.matrixWorld),Ys.setFromRotationMatrix(pi),this.quaternion.premultiply(Ys.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(pf),Ks.child=e,this.dispatchEvent(Ks),Ks.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent($_),vl.child=e,this.dispatchEvent(vl),vl.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),pi.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),pi.multiply(e.parent.matrixWorld)),e.applyMatrix4(pi),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(pf),Ks.child=e,this.dispatchEvent(Ks),Ks.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){const a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const i=this.children;for(let s=0,a=i.length;s<a;s++)i[s].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(aa,e,q_),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(aa,X_,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const i=this.children;for(let s=0,a=i.length;s<a;s++)i[s].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const i={};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),i.instanceInfo=this._instanceInfo.map(o=>({...o})),i.availableInstanceIds=this._availableInstanceIds.slice(),i.availableGeometryIds=this._availableGeometryIds.slice(),i.nextIndexStart=this._nextIndexStart,i.nextVertexStart=this._nextVertexStart,i.geometryCount=this._geometryCount,i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.matricesTexture=this._matricesTexture.toJSON(e),i.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(i.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(i.boundingBox=this.boundingBox.toJSON()));function s(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=s(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const c=o.shapes;if(Array.isArray(c))for(let l=0,u=c.length;l<u;l++){const h=c[l];s(e.shapes,h)}else s(e.shapes,c)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let c=0,l=this.material.length;c<l;c++)o.push(s(e.materials,this.material[c]));i.material=o}else i.material=s(e.materials,this.material);if(this.children.length>0){i.children=[];for(let o=0;o<this.children.length;o++)i.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let o=0;o<this.animations.length;o++){const c=this.animations[o];i.animations.push(s(e.animations,c))}}if(t){const o=a(e.geometries),c=a(e.materials),l=a(e.textures),u=a(e.images),h=a(e.shapes),d=a(e.skeletons),f=a(e.animations),A=a(e.nodes);o.length>0&&(n.geometries=o),c.length>0&&(n.materials=c),l.length>0&&(n.textures=l),u.length>0&&(n.images=u),h.length>0&&(n.shapes=h),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),A.length>0&&(n.nodes=A)}return n.object=i,n;function a(o){const c=[];for(const l in o){const u=o[l];delete u.metadata,c.push(u)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const i=e.children[n];this.add(i.clone())}return this}}pt.DEFAULT_UP=new B(0,1,0);pt.DEFAULT_MATRIX_AUTO_UPDATE=!0;pt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Qn=new B,Ai=new B,yl=new B,mi=new B,Js=new B,Zs=new B,Af=new B,Sl=new B,Cl=new B,Il=new B,Ml=new it,wl=new it,Tl=new it;class xn{constructor(e=new B,t=new B,n=new B){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i.subVectors(n,t),Qn.subVectors(e,t),i.cross(Qn);const s=i.lengthSq();return s>0?i.multiplyScalar(1/Math.sqrt(s)):i.set(0,0,0)}static getBarycoord(e,t,n,i,s){Qn.subVectors(i,t),Ai.subVectors(n,t),yl.subVectors(e,t);const a=Qn.dot(Qn),o=Qn.dot(Ai),c=Qn.dot(yl),l=Ai.dot(Ai),u=Ai.dot(yl),h=a*l-o*o;if(h===0)return s.set(0,0,0),null;const d=1/h,f=(l*c-o*u)*d,A=(a*u-o*c)*d;return s.set(1-f-A,A,f)}static containsPoint(e,t,n,i){return this.getBarycoord(e,t,n,i,mi)===null?!1:mi.x>=0&&mi.y>=0&&mi.x+mi.y<=1}static getInterpolation(e,t,n,i,s,a,o,c){return this.getBarycoord(e,t,n,i,mi)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(s,mi.x),c.addScaledVector(a,mi.y),c.addScaledVector(o,mi.z),c)}static getInterpolatedAttribute(e,t,n,i,s,a){return Ml.setScalar(0),wl.setScalar(0),Tl.setScalar(0),Ml.fromBufferAttribute(e,t),wl.fromBufferAttribute(e,n),Tl.fromBufferAttribute(e,i),a.setScalar(0),a.addScaledVector(Ml,s.x),a.addScaledVector(wl,s.y),a.addScaledVector(Tl,s.z),a}static isFrontFacing(e,t,n,i){return Qn.subVectors(n,t),Ai.subVectors(e,t),Qn.cross(Ai).dot(i)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}setFromAttributeAndIndices(e,t,n,i){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Qn.subVectors(this.c,this.b),Ai.subVectors(this.a,this.b),Qn.cross(Ai).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return xn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return xn.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,i,s){return xn.getInterpolation(e,this.a,this.b,this.c,t,n,i,s)}containsPoint(e){return xn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return xn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,i=this.b,s=this.c;let a,o;Js.subVectors(i,n),Zs.subVectors(s,n),Sl.subVectors(e,n);const c=Js.dot(Sl),l=Zs.dot(Sl);if(c<=0&&l<=0)return t.copy(n);Cl.subVectors(e,i);const u=Js.dot(Cl),h=Zs.dot(Cl);if(u>=0&&h<=u)return t.copy(i);const d=c*h-u*l;if(d<=0&&c>=0&&u<=0)return a=c/(c-u),t.copy(n).addScaledVector(Js,a);Il.subVectors(e,s);const f=Js.dot(Il),A=Zs.dot(Il);if(A>=0&&f<=A)return t.copy(s);const g=f*l-c*A;if(g<=0&&l>=0&&A<=0)return o=l/(l-A),t.copy(n).addScaledVector(Zs,o);const m=u*A-f*h;if(m<=0&&h-u>=0&&f-A>=0)return Af.subVectors(s,i),o=(h-u)/(h-u+(f-A)),t.copy(i).addScaledVector(Af,o);const p=1/(m+g+d);return a=g*p,o=d*p,t.copy(n).addScaledVector(Js,a).addScaledVector(Zs,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Sg={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ki={h:0,s:0,l:0},Co={h:0,s:0,l:0};function Rl(r,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?r+(e-r)*6*t:t<1/2?e:t<2/3?r+(e-r)*6*(2/3-t):r}class Me{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const i=e;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=mt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Je.colorSpaceToWorking(this,t),this}setRGB(e,t,n,i=Je.workingColorSpace){return this.r=e,this.g=t,this.b=n,Je.colorSpaceToWorking(this,i),this}setHSL(e,t,n,i=Je.workingColorSpace){if(e=Ed(e,1),t=qe(t,0,1),n=qe(n,0,1),t===0)this.r=this.g=this.b=n;else{const s=n<=.5?n*(1+t):n+t-n*t,a=2*n-s;this.r=Rl(a,s,e+1/3),this.g=Rl(a,s,e),this.b=Rl(a,s,e-1/3)}return Je.colorSpaceToWorking(this,i),this}setStyle(e,t=mt){function n(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const a=i[1],o=i[2];switch(a){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=i[1],a=s.length;if(a===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=mt){const n=Sg[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Bi(e.r),this.g=Bi(e.g),this.b=Bi(e.b),this}copyLinearToSRGB(e){return this.r=Pr(e.r),this.g=Pr(e.g),this.b=Pr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=mt){return Je.workingToColorSpace(Kt.copy(this),e),Math.round(qe(Kt.r*255,0,255))*65536+Math.round(qe(Kt.g*255,0,255))*256+Math.round(qe(Kt.b*255,0,255))}getHexString(e=mt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Je.workingColorSpace){Je.workingToColorSpace(Kt.copy(this),t);const n=Kt.r,i=Kt.g,s=Kt.b,a=Math.max(n,i,s),o=Math.min(n,i,s);let c,l;const u=(o+a)/2;if(o===a)c=0,l=0;else{const h=a-o;switch(l=u<=.5?h/(a+o):h/(2-a-o),a){case n:c=(i-s)/h+(i<s?6:0);break;case i:c=(s-n)/h+2;break;case s:c=(n-i)/h+4;break}c/=6}return e.h=c,e.s=l,e.l=u,e}getRGB(e,t=Je.workingColorSpace){return Je.workingToColorSpace(Kt.copy(this),t),e.r=Kt.r,e.g=Kt.g,e.b=Kt.b,e}getStyle(e=mt){Je.workingToColorSpace(Kt.copy(this),e);const t=Kt.r,n=Kt.g,i=Kt.b;return e!==mt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(e,t,n){return this.getHSL(ki),this.setHSL(ki.h+e,ki.s+t,ki.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(ki),e.getHSL(Co);const n=Ha(ki.h,Co.h,t),i=Ha(ki.s,Co.s,t),s=Ha(ki.l,Co.l,t);return this.setHSL(n,i,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,i=this.b,s=e.elements;return this.r=s[0]*t+s[3]*n+s[6]*i,this.g=s[1]*t+s[4]*n+s[7]*i,this.b=s[2]*t+s[5]*n+s[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Kt=new Me;Me.NAMES=Sg;let j_=0,qn=class extends jn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:j_++}),this.uuid=Wn(),this.name="",this.type="Material",this.blending=Rr,this.side=Xn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=fu,this.blendDst=pu,this.blendEquation=Is,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Me(0,0,0),this.blendAlpha=0,this.depthFunc=kr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=ef,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Vs,this.stencilZFail=Vs,this.stencilZPass=Vs,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const i=this[t];if(i===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Rr&&(n.blending=this.blending),this.side!==Xn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==fu&&(n.blendSrc=this.blendSrc),this.blendDst!==pu&&(n.blendDst=this.blendDst),this.blendEquation!==Is&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==kr&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==ef&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Vs&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Vs&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Vs&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(s){const a=[];for(const o in s){const c=s[o];delete c.metadata,a.push(c)}return a}if(t){const s=i(e.textures),a=i(e.images);s.length>0&&(n.textures=s),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const i=t.length;n=new Array(i);for(let s=0;s!==i;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}};class Fn extends qn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Me(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Un,this.combine=og,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const wi=Y_();function Y_(){const r=new ArrayBuffer(4),e=new Float32Array(r),t=new Uint32Array(r),n=new Uint32Array(512),i=new Uint32Array(512);for(let c=0;c<256;++c){const l=c-127;l<-27?(n[c]=0,n[c|256]=32768,i[c]=24,i[c|256]=24):l<-14?(n[c]=1024>>-l-14,n[c|256]=1024>>-l-14|32768,i[c]=-l-1,i[c|256]=-l-1):l<=15?(n[c]=l+15<<10,n[c|256]=l+15<<10|32768,i[c]=13,i[c|256]=13):l<128?(n[c]=31744,n[c|256]=64512,i[c]=24,i[c|256]=24):(n[c]=31744,n[c|256]=64512,i[c]=13,i[c|256]=13)}const s=new Uint32Array(2048),a=new Uint32Array(64),o=new Uint32Array(64);for(let c=1;c<1024;++c){let l=c<<13,u=0;for(;(l&8388608)===0;)l<<=1,u-=8388608;l&=-8388609,u+=947912704,s[c]=l|u}for(let c=1024;c<2048;++c)s[c]=939524096+(c-1024<<13);for(let c=1;c<31;++c)a[c]=c<<23;a[31]=1199570944,a[32]=2147483648;for(let c=33;c<63;++c)a[c]=2147483648+(c-32<<23);a[63]=3347054592;for(let c=1;c<64;++c)c!==32&&(o[c]=1024);return{floatView:e,uint32View:t,baseTable:n,shiftTable:i,mantissaTable:s,exponentTable:a,offsetTable:o}}function K_(r){Math.abs(r)>65504&&console.warn("THREE.DataUtils.toHalfFloat(): Value out of range."),r=qe(r,-65504,65504),wi.floatView[0]=r;const e=wi.uint32View[0],t=e>>23&511;return wi.baseTable[t]+((e&8388607)>>wi.shiftTable[t])}function J_(r){const e=r>>10;return wi.uint32View[0]=wi.mantissaTable[wi.offsetTable[e]+(r&1023)]+wi.exponentTable[e],wi.floatView[0]}class Io{static toHalfFloat(e){return K_(e)}static fromHalfFloat(e){return J_(e)}}const Pt=new B,Mo=new ke;let Z_=0;class yt{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Z_++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Hu,this.updateRanges=[],this.gpuType=Lt,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,s=this.itemSize;i<s;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Mo.fromBufferAttribute(this,t),Mo.applyMatrix3(e),this.setXY(t,Mo.x,Mo.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Pt.fromBufferAttribute(this,t),Pt.applyMatrix3(e),this.setXYZ(t,Pt.x,Pt.y,Pt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Pt.fromBufferAttribute(this,t),Pt.applyMatrix4(e),this.setXYZ(t,Pt.x,Pt.y,Pt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Pt.fromBufferAttribute(this,t),Pt.applyNormalMatrix(e),this.setXYZ(t,Pt.x,Pt.y,Pt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Pt.fromBufferAttribute(this,t),Pt.transformDirection(e),this.setXYZ(t,Pt.x,Pt.y,Pt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Hn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=ct(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Hn(t,this.array)),t}setX(e,t){return this.normalized&&(t=ct(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Hn(t,this.array)),t}setY(e,t){return this.normalized&&(t=ct(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Hn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=ct(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Hn(t,this.array)),t}setW(e,t){return this.normalized&&(t=ct(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=ct(t,this.array),n=ct(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){return e*=this.itemSize,this.normalized&&(t=ct(t,this.array),n=ct(n,this.array),i=ct(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,s){return e*=this.itemSize,this.normalized&&(t=ct(t,this.array),n=ct(n,this.array),i=ct(i,this.array),s=ct(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Hu&&(e.usage=this.usage),e}}class Cg extends yt{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class Ig extends yt{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class Cn extends yt{constructor(e,t,n){super(new Float32Array(e),t,n)}}let eE=0;const Tn=new Ne,Bl=new pt,er=new B,_n=new ln,oa=new ln,Ht=new B;class An extends jn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:eE++}),this.uuid=Wn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Eg(e)?Ig:Cg)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const s=new Qe().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}const i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(e),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Tn.makeRotationFromQuaternion(e),this.applyMatrix4(Tn),this}rotateX(e){return Tn.makeRotationX(e),this.applyMatrix4(Tn),this}rotateY(e){return Tn.makeRotationY(e),this.applyMatrix4(Tn),this}rotateZ(e){return Tn.makeRotationZ(e),this.applyMatrix4(Tn),this}translate(e,t,n){return Tn.makeTranslation(e,t,n),this.applyMatrix4(Tn),this}scale(e,t,n){return Tn.makeScale(e,t,n),this.applyMatrix4(Tn),this}lookAt(e){return Bl.lookAt(e),Bl.updateMatrix(),this.applyMatrix4(Bl.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(er).negate(),this.translate(er.x,er.y,er.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let i=0,s=e.length;i<s;i++){const a=e[i];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Cn(n,3))}else{const n=Math.min(e.length,t.count);for(let i=0;i<n;i++){const s=e[i];t.setXYZ(i,s.x,s.y,s.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ln);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new B(-1/0,-1/0,-1/0),new B(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){const s=t[n];_n.setFromBufferAttribute(s),this.morphTargetsRelative?(Ht.addVectors(this.boundingBox.min,_n.min),this.boundingBox.expandByPoint(Ht),Ht.addVectors(this.boundingBox.max,_n.max),this.boundingBox.expandByPoint(Ht)):(this.boundingBox.expandByPoint(_n.min),this.boundingBox.expandByPoint(_n.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Nn);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new B,1/0);return}if(e){const n=this.boundingSphere.center;if(_n.setFromBufferAttribute(e),t)for(let s=0,a=t.length;s<a;s++){const o=t[s];oa.setFromBufferAttribute(o),this.morphTargetsRelative?(Ht.addVectors(_n.min,oa.min),_n.expandByPoint(Ht),Ht.addVectors(_n.max,oa.max),_n.expandByPoint(Ht)):(_n.expandByPoint(oa.min),_n.expandByPoint(oa.max))}_n.getCenter(n);let i=0;for(let s=0,a=e.count;s<a;s++)Ht.fromBufferAttribute(e,s),i=Math.max(i,n.distanceToSquared(Ht));if(t)for(let s=0,a=t.length;s<a;s++){const o=t[s],c=this.morphTargetsRelative;for(let l=0,u=o.count;l<u;l++)Ht.fromBufferAttribute(o,l),c&&(er.fromBufferAttribute(e,l),Ht.add(er)),i=Math.max(i,n.distanceToSquared(Ht))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,i=t.normal,s=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new yt(new Float32Array(4*n.count),4));const a=this.getAttribute("tangent"),o=[],c=[];for(let w=0;w<n.count;w++)o[w]=new B,c[w]=new B;const l=new B,u=new B,h=new B,d=new ke,f=new ke,A=new ke,g=new B,m=new B;function p(w,v,y){l.fromBufferAttribute(n,w),u.fromBufferAttribute(n,v),h.fromBufferAttribute(n,y),d.fromBufferAttribute(s,w),f.fromBufferAttribute(s,v),A.fromBufferAttribute(s,y),u.sub(l),h.sub(l),f.sub(d),A.sub(d);const T=1/(f.x*A.y-A.x*f.y);isFinite(T)&&(g.copy(u).multiplyScalar(A.y).addScaledVector(h,-f.y).multiplyScalar(T),m.copy(h).multiplyScalar(f.x).addScaledVector(u,-A.x).multiplyScalar(T),o[w].add(g),o[v].add(g),o[y].add(g),c[w].add(m),c[v].add(m),c[y].add(m))}let E=this.groups;E.length===0&&(E=[{start:0,count:e.count}]);for(let w=0,v=E.length;w<v;++w){const y=E[w],T=y.start,k=y.count;for(let U=T,F=T+k;U<F;U+=3)p(e.getX(U+0),e.getX(U+1),e.getX(U+2))}const _=new B,b=new B,x=new B,I=new B;function M(w){x.fromBufferAttribute(i,w),I.copy(x);const v=o[w];_.copy(v),_.sub(x.multiplyScalar(x.dot(v))).normalize(),b.crossVectors(I,v);const T=b.dot(c[w])<0?-1:1;a.setXYZW(w,_.x,_.y,_.z,T)}for(let w=0,v=E.length;w<v;++w){const y=E[w],T=y.start,k=y.count;for(let U=T,F=T+k;U<F;U+=3)M(e.getX(U+0)),M(e.getX(U+1)),M(e.getX(U+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new yt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);const i=new B,s=new B,a=new B,o=new B,c=new B,l=new B,u=new B,h=new B;if(e)for(let d=0,f=e.count;d<f;d+=3){const A=e.getX(d+0),g=e.getX(d+1),m=e.getX(d+2);i.fromBufferAttribute(t,A),s.fromBufferAttribute(t,g),a.fromBufferAttribute(t,m),u.subVectors(a,s),h.subVectors(i,s),u.cross(h),o.fromBufferAttribute(n,A),c.fromBufferAttribute(n,g),l.fromBufferAttribute(n,m),o.add(u),c.add(u),l.add(u),n.setXYZ(A,o.x,o.y,o.z),n.setXYZ(g,c.x,c.y,c.z),n.setXYZ(m,l.x,l.y,l.z)}else for(let d=0,f=t.count;d<f;d+=3)i.fromBufferAttribute(t,d+0),s.fromBufferAttribute(t,d+1),a.fromBufferAttribute(t,d+2),u.subVectors(a,s),h.subVectors(i,s),u.cross(h),n.setXYZ(d+0,u.x,u.y,u.z),n.setXYZ(d+1,u.x,u.y,u.z),n.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Ht.fromBufferAttribute(e,t),Ht.normalize(),e.setXYZ(t,Ht.x,Ht.y,Ht.z)}toNonIndexed(){function e(o,c){const l=o.array,u=o.itemSize,h=o.normalized,d=new l.constructor(c.length*u);let f=0,A=0;for(let g=0,m=c.length;g<m;g++){o.isInterleavedBufferAttribute?f=c[g]*o.data.stride+o.offset:f=c[g]*u;for(let p=0;p<u;p++)d[A++]=l[f++]}return new yt(d,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new An,n=this.index.array,i=this.attributes;for(const o in i){const c=i[o],l=e(c,n);t.setAttribute(o,l)}const s=this.morphAttributes;for(const o in s){const c=[],l=s[o];for(let u=0,h=l.length;u<h;u++){const d=l[u],f=e(d,n);c.push(f)}t.morphAttributes[o]=c}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,c=a.length;o<c;o++){const l=a[o];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const c=this.parameters;for(const l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const c in n){const l=n[c];e.data.attributes[c]=l.toJSON(e.data)}const i={};let s=!1;for(const c in this.morphAttributes){const l=this.morphAttributes[c],u=[];for(let h=0,d=l.length;h<d;h++){const f=l[h];u.push(f.toJSON(e.data))}u.length>0&&(i[c]=u,s=!0)}s&&(e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone());const i=e.attributes;for(const l in i){const u=i[l];this.setAttribute(l,u.clone(t))}const s=e.morphAttributes;for(const l in s){const u=[],h=s[l];for(let d=0,f=h.length;d<f;d++)u.push(h[d].clone(t));this.morphAttributes[l]=u}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let l=0,u=a.length;l<u;l++){const h=a[l];this.addGroup(h.start,h.count,h.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const mf=new Ne,os=new ho,wo=new Nn,gf=new B,To=new B,Ro=new B,Bo=new B,Dl=new B,Do=new B,bf=new B,Lo=new B;class dt extends pt{constructor(e=new An,t=new Fn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=i.length;s<a;s++){const o=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}getVertexPosition(e,t){const n=this.geometry,i=n.attributes.position,s=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(i,e);const o=this.morphTargetInfluences;if(s&&o){Do.set(0,0,0);for(let c=0,l=s.length;c<l;c++){const u=o[c],h=s[c];u!==0&&(Dl.fromBufferAttribute(h,e),a?Do.addScaledVector(Dl,u):Do.addScaledVector(Dl.sub(t),u))}t.add(Do)}return t}raycast(e,t){const n=this.geometry,i=this.material,s=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),wo.copy(n.boundingSphere),wo.applyMatrix4(s),os.copy(e.ray).recast(e.near),!(wo.containsPoint(os.origin)===!1&&(os.intersectSphere(wo,gf)===null||os.origin.distanceToSquared(gf)>(e.far-e.near)**2))&&(mf.copy(s).invert(),os.copy(e.ray).applyMatrix4(mf),!(n.boundingBox!==null&&os.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,os)))}_computeIntersections(e,t,n){let i;const s=this.geometry,a=this.material,o=s.index,c=s.attributes.position,l=s.attributes.uv,u=s.attributes.uv1,h=s.attributes.normal,d=s.groups,f=s.drawRange;if(o!==null)if(Array.isArray(a))for(let A=0,g=d.length;A<g;A++){const m=d[A],p=a[m.materialIndex],E=Math.max(m.start,f.start),_=Math.min(o.count,Math.min(m.start+m.count,f.start+f.count));for(let b=E,x=_;b<x;b+=3){const I=o.getX(b),M=o.getX(b+1),w=o.getX(b+2);i=Fo(this,p,e,n,l,u,h,I,M,w),i&&(i.faceIndex=Math.floor(b/3),i.face.materialIndex=m.materialIndex,t.push(i))}}else{const A=Math.max(0,f.start),g=Math.min(o.count,f.start+f.count);for(let m=A,p=g;m<p;m+=3){const E=o.getX(m),_=o.getX(m+1),b=o.getX(m+2);i=Fo(this,a,e,n,l,u,h,E,_,b),i&&(i.faceIndex=Math.floor(m/3),t.push(i))}}else if(c!==void 0)if(Array.isArray(a))for(let A=0,g=d.length;A<g;A++){const m=d[A],p=a[m.materialIndex],E=Math.max(m.start,f.start),_=Math.min(c.count,Math.min(m.start+m.count,f.start+f.count));for(let b=E,x=_;b<x;b+=3){const I=b,M=b+1,w=b+2;i=Fo(this,p,e,n,l,u,h,I,M,w),i&&(i.faceIndex=Math.floor(b/3),i.face.materialIndex=m.materialIndex,t.push(i))}}else{const A=Math.max(0,f.start),g=Math.min(c.count,f.start+f.count);for(let m=A,p=g;m<p;m+=3){const E=m,_=m+1,b=m+2;i=Fo(this,a,e,n,l,u,h,E,_,b),i&&(i.faceIndex=Math.floor(m/3),t.push(i))}}}}function tE(r,e,t,n,i,s,a,o){let c;if(e.side===jt?c=n.intersectTriangle(a,s,i,!0,o):c=n.intersectTriangle(i,s,a,e.side===Xn,o),c===null)return null;Lo.copy(o),Lo.applyMatrix4(r.matrixWorld);const l=t.ray.origin.distanceTo(Lo);return l<t.near||l>t.far?null:{distance:l,point:Lo.clone(),object:r}}function Fo(r,e,t,n,i,s,a,o,c,l){r.getVertexPosition(o,To),r.getVertexPosition(c,Ro),r.getVertexPosition(l,Bo);const u=tE(r,e,t,n,To,Ro,Bo,bf);if(u){const h=new B;xn.getBarycoord(bf,To,Ro,Bo,h),i&&(u.uv=xn.getInterpolatedAttribute(i,o,c,l,h,new ke)),s&&(u.uv1=xn.getInterpolatedAttribute(s,o,c,l,h,new ke)),a&&(u.normal=xn.getInterpolatedAttribute(a,o,c,l,h,new B),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));const d={a:o,b:c,c:l,normal:new B,materialIndex:0};xn.getNormal(To,Ro,Bo,d.normal),u.face=d,u.barycoord=h}return u}class Li extends An{constructor(e=1,t=1,n=1,i=1,s=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:i,heightSegments:s,depthSegments:a};const o=this;i=Math.floor(i),s=Math.floor(s),a=Math.floor(a);const c=[],l=[],u=[],h=[];let d=0,f=0;A("z","y","x",-1,-1,n,t,e,a,s,0),A("z","y","x",1,-1,n,t,-e,a,s,1),A("x","z","y",1,1,e,n,t,i,a,2),A("x","z","y",1,-1,e,n,-t,i,a,3),A("x","y","z",1,-1,e,t,n,i,s,4),A("x","y","z",-1,-1,e,t,-n,i,s,5),this.setIndex(c),this.setAttribute("position",new Cn(l,3)),this.setAttribute("normal",new Cn(u,3)),this.setAttribute("uv",new Cn(h,2));function A(g,m,p,E,_,b,x,I,M,w,v){const y=b/M,T=x/w,k=b/2,U=x/2,F=I/2,H=M+1,O=w+1;let W=0,Q=0;const Y=new B;for(let Z=0;Z<O;Z++){const re=Z*T-U;for(let fe=0;fe<H;fe++){const Be=fe*y-k;Y[g]=Be*E,Y[m]=re*_,Y[p]=F,l.push(Y.x,Y.y,Y.z),Y[g]=0,Y[m]=0,Y[p]=I>0?1:-1,u.push(Y.x,Y.y,Y.z),h.push(fe/M),h.push(1-Z/w),W+=1}}for(let Z=0;Z<w;Z++)for(let re=0;re<M;re++){const fe=d+re+H*Z,Be=d+re+H*(Z+1),Ge=d+(re+1)+H*(Z+1),q=d+(re+1)+H*Z;c.push(fe,Be,q),c.push(Be,Ge,q),Q+=6}o.addGroup(f,Q,v),f+=Q,d+=W}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Li(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Wr(r){const e={};for(const t in r){e[t]={};for(const n in r[t]){const i=r[t][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=i.clone():Array.isArray(i)?e[t][n]=i.slice():e[t][n]=i}}return e}function rn(r){const e={};for(let t=0;t<r.length;t++){const n=Wr(r[t]);for(const i in n)e[i]=n[i]}return e}function nE(r){const e=[];for(let t=0;t<r.length;t++)e.push(r[t].clone());return e}function Mg(r){const e=r.getRenderTarget();return e===null?r.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Je.workingColorSpace}const iE={clone:Wr,merge:rn};var sE=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,rE=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class In extends qn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=sE,this.fragmentShader=rE,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Wr(e.uniforms),this.uniformsGroups=nE(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const i in this.uniforms){const a=this.uniforms[i].value;a&&a.isTexture?t.uniforms[i]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[i]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[i]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[i]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[i]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[i]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[i]={type:"m4",value:a.toArray()}:t.uniforms[i]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class wg extends pt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ne,this.projectionMatrix=new Ne,this.projectionMatrixInverse=new Ne,this.coordinateSystem=ii,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Qi=new B,_f=new ke,Ef=new ke;class $t extends wg{constructor(e=50,t=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Vr*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Ga*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Vr*2*Math.atan(Math.tan(Ga*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Qi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Qi.x,Qi.y).multiplyScalar(-e/Qi.z),Qi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Qi.x,Qi.y).multiplyScalar(-e/Qi.z)}getViewSize(e,t){return this.getViewBounds(e,_f,Ef),t.subVectors(Ef,_f)}setViewOffset(e,t,n,i,s,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Ga*.5*this.fov)/this.zoom,n=2*t,i=this.aspect*n,s=-.5*i;const a=this.view;if(this.view!==null&&this.view.enabled){const c=a.fullWidth,l=a.fullHeight;s+=a.offsetX*i/c,t-=a.offsetY*n/l,i*=a.width/c,n*=a.height/l}const o=this.filmOffset;o!==0&&(s+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+i,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const tr=-90,nr=1;class zu extends pt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const i=new $t(tr,nr,e,t);i.layers=this.layers,this.add(i);const s=new $t(tr,nr,e,t);s.layers=this.layers,this.add(s);const a=new $t(tr,nr,e,t);a.layers=this.layers,this.add(a);const o=new $t(tr,nr,e,t);o.layers=this.layers,this.add(o);const c=new $t(tr,nr,e,t);c.layers=this.layers,this.add(c);const l=new $t(tr,nr,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,i,s,a,o,c]=t;for(const l of t)this.remove(l);if(e===ii)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===kc)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,a,o,c,l,u]=this.children,h=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),A=e.xr.enabled;e.xr.enabled=!1;const g=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,i),e.render(t,s),e.setRenderTarget(n,1,i),e.render(t,a),e.setRenderTarget(n,2,i),e.render(t,o),e.setRenderTarget(n,3,i),e.render(t,c),e.setRenderTarget(n,4,i),e.render(t,l),n.texture.generateMipmaps=g,e.setRenderTarget(n,5,i),e.render(t,u),e.setRenderTarget(h,d,f),e.xr.enabled=A,n.texture.needsPMREMUpdate=!0}}class Tg extends vt{constructor(e=[],t=Us,n,i,s,a,o,c,l,u){super(e,t,n,i,s,a,o,c,l,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class vd extends Pn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},i=[n,n,n,n,n,n];this.texture=new Tg(i),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new Li(5,5,5),s=new In({name:"CubemapFromEquirect",uniforms:Wr(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:jt,blending:ri});s.uniforms.tEquirect.value=t;const a=new dt(i,s),o=t.minFilter;return t.minFilter===hn&&(t.minFilter=Ze),new zu(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,i=!0){const s=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,i);e.setRenderTarget(s)}}class Ki extends pt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const aE={type:"move"};class Ll{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ki,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ki,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new B,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new B),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ki,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new B,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new B),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let i=null,s=null,a=null;const o=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){a=!0;for(const g of e.hand.values()){const m=t.getJointPose(g,n),p=this._getHandJoint(l,g);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}const u=l.joints["index-finger-tip"],h=l.joints["thumb-tip"],d=u.position.distanceTo(h.position),f=.02,A=.005;l.inputState.pinching&&d>f+A?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&d<=f-A&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,n),s!==null&&(c.matrix.fromArray(s.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,s.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(s.linearVelocity)):c.hasLinearVelocity=!1,s.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(s.angularVelocity)):c.hasAngularVelocity=!1));o!==null&&(i=t.getPose(e.targetRaySpace,n),i===null&&s!==null&&(i=s),i!==null&&(o.matrix.fromArray(i.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,i.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(i.linearVelocity)):o.hasLinearVelocity=!1,i.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(i.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(aE)))}return o!==null&&(o.visible=i!==null),c!==null&&(c.visible=s!==null),l!==null&&(l.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new Ki;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}class Os extends pt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Un,this.environmentIntensity=1,this.environmentRotation=new Un,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class oE{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=Hu,this.updateRanges=[],this.version=0,this.uuid=Wn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let i=0,s=this.stride;i<s;i++)this.array[e+i]=t.array[n+i];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Wn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Wn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const nn=new B;class yd{constructor(e,t,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=i}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)nn.fromBufferAttribute(this,t),nn.applyMatrix4(e),this.setXYZ(t,nn.x,nn.y,nn.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)nn.fromBufferAttribute(this,t),nn.applyNormalMatrix(e),this.setXYZ(t,nn.x,nn.y,nn.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)nn.fromBufferAttribute(this,t),nn.transformDirection(e),this.setXYZ(t,nn.x,nn.y,nn.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=Hn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=ct(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=ct(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=ct(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=ct(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=ct(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Hn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Hn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Hn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Hn(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=ct(t,this.array),n=ct(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=ct(t,this.array),n=ct(n,this.array),i=ct(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this}setXYZW(e,t,n,i,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=ct(t,this.array),n=ct(n,this.array),i=ct(i,this.array),s=ct(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this.data.array[e+3]=s,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[i+s])}return new yt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new yd(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[i+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}const xf=new B,vf=new it,yf=new it,cE=new B,Sf=new Ne,Po=new B,Fl=new Nn,Cf=new Ne,Pl=new ho;class lE extends dt{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=Jd,this.bindMatrix=new Ne,this.bindMatrixInverse=new Ne,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const e=this.geometry;this.boundingBox===null&&(this.boundingBox=new ln),this.boundingBox.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Po),this.boundingBox.expandByPoint(Po)}computeBoundingSphere(){const e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new Nn),this.boundingSphere.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Po),this.boundingSphere.expandByPoint(Po)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){const n=this.material,i=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Fl.copy(this.boundingSphere),Fl.applyMatrix4(i),e.ray.intersectsSphere(Fl)!==!1&&(Cf.copy(i).invert(),Pl.copy(e.ray).applyMatrix4(Cf),!(this.boundingBox!==null&&Pl.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,Pl)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new it,t=this.geometry.attributes.skinWeight;for(let n=0,i=t.count;n<i;n++){e.fromBufferAttribute(t,n);const s=1/e.manhattanLength();s!==1/0?e.multiplyScalar(s):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===Jd?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===o_?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){const n=this.skeleton,i=this.geometry;vf.fromBufferAttribute(i.attributes.skinIndex,e),yf.fromBufferAttribute(i.attributes.skinWeight,e),xf.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let s=0;s<4;s++){const a=yf.getComponent(s);if(a!==0){const o=vf.getComponent(s);Sf.multiplyMatrices(n.bones[o].matrixWorld,n.boneInverses[o]),t.addScaledVector(cE.copy(xf).applyMatrix4(Sf),a)}}return t.applyMatrix4(this.bindMatrixInverse)}}class Rg extends pt{constructor(){super(),this.isBone=!0,this.type="Bone"}}class uo extends vt{constructor(e=null,t=1,n=1,i,s,a,o,c,l=Ot,u=Ot,h,d){super(null,a,o,c,l,u,i,s,h,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const If=new Ne,hE=new Ne;class Sd{constructor(e=[],t=[]){this.uuid=Wn(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){const e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,i=this.bones.length;n<i;n++)this.boneInverses.push(new Ne)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){const n=new Ne;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){const e=this.bones,t=this.boneInverses,n=this.boneMatrices,i=this.boneTexture;for(let s=0,a=e.length;s<a;s++){const o=e[s]?e[s].matrixWorld:hE;If.multiplyMatrices(o,t[s]),If.toArray(n,s*16)}i!==null&&(i.needsUpdate=!0)}clone(){return new Sd(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);const t=new Float32Array(e*e*4);t.set(this.boneMatrices);const n=new uo(t,e,e,xt,Lt);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){const i=this.bones[t];if(i.name===e)return i}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,i=e.bones.length;n<i;n++){const s=e.bones[n];let a=t[s];a===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",s),a=new Rg),this.bones.push(a),this.boneInverses.push(new Ne().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){const e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;const t=this.bones,n=this.boneInverses;for(let i=0,s=t.length;i<s;i++){const a=t[i];e.bones.push(a.uuid);const o=n[i];e.boneInverses.push(o.toArray())}return e}}class Vu extends yt{constructor(e,t,n,i=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const ir=new Ne,Mf=new Ne,Uo=[],wf=new ln,uE=new Ne,ca=new dt,la=new Nn;class dE extends dt{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Vu(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,uE)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new ln),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,ir),wf.copy(e.boundingBox).applyMatrix4(ir),this.boundingBox.union(wf)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Nn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,ir),la.copy(e.boundingSphere).applyMatrix4(ir),this.boundingSphere.union(la)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const n=t.morphTargetInfluences,i=this.morphTexture.source.data.data,s=n.length+1,a=e*s+1;for(let o=0;o<n.length;o++)n[o]=i[a+o]}raycast(e,t){const n=this.matrixWorld,i=this.count;if(ca.geometry=this.geometry,ca.material=this.material,ca.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),la.copy(this.boundingSphere),la.applyMatrix4(n),e.ray.intersectsSphere(la)!==!1))for(let s=0;s<i;s++){this.getMatrixAt(s,ir),Mf.multiplyMatrices(n,ir),ca.matrixWorld=Mf,ca.raycast(e,Uo);for(let a=0,o=Uo.length;a<o;a++){const c=Uo[a];c.instanceId=s,c.object=this,t.push(c)}Uo.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Vu(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const n=t.morphTargetInfluences,i=n.length+1;this.morphTexture===null&&(this.morphTexture=new uo(new Float32Array(i*this.count),i,this.count,Yi,Lt));const s=this.morphTexture.source.data.data;let a=0;for(let l=0;l<n.length;l++)a+=n[l];const o=this.geometry.morphTargetsRelative?1:1-a,c=i*e;s[c]=o,s.set(n,c+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}}const Ul=new B,fE=new B,pE=new Qe;class bs{constructor(e=new B(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const i=Ul.subVectors(n,t).cross(fE.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(Ul),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/i;return s<0||s>1?null:t.copy(e.start).addScaledVector(n,s)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||pE.getNormalMatrix(e),i=this.coplanarPoint(Ul).applyMatrix4(e),s=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const cs=new Nn,AE=new ke(.5,.5),No=new B;class Cd{constructor(e=new bs,t=new bs,n=new bs,i=new bs,s=new bs,a=new bs){this.planes=[e,t,n,i,s,a]}set(e,t,n,i,s,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(i),o[4].copy(s),o[5].copy(a),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=ii,n=!1){const i=this.planes,s=e.elements,a=s[0],o=s[1],c=s[2],l=s[3],u=s[4],h=s[5],d=s[6],f=s[7],A=s[8],g=s[9],m=s[10],p=s[11],E=s[12],_=s[13],b=s[14],x=s[15];if(i[0].setComponents(l-a,f-u,p-A,x-E).normalize(),i[1].setComponents(l+a,f+u,p+A,x+E).normalize(),i[2].setComponents(l+o,f+h,p+g,x+_).normalize(),i[3].setComponents(l-o,f-h,p-g,x-_).normalize(),n)i[4].setComponents(c,d,m,b).normalize(),i[5].setComponents(l-c,f-d,p-m,x-b).normalize();else if(i[4].setComponents(l-c,f-d,p-m,x-b).normalize(),t===ii)i[5].setComponents(l+c,f+d,p+m,x+b).normalize();else if(t===kc)i[5].setComponents(c,d,m,b).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),cs.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),cs.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(cs)}intersectsSprite(e){cs.center.set(0,0,0);const t=AE.distanceTo(e.center);return cs.radius=.7071067811865476+t,cs.applyMatrix4(e.matrixWorld),this.intersectsSphere(cs)}intersectsSphere(e){const t=this.planes,n=e.center,i=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const i=t[n];if(No.x=i.normal.x>0?e.max.x:e.min.x,No.y=i.normal.y>0?e.max.y:e.min.y,No.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(No)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class Bg extends qn{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Me(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Gc=new B,Hc=new B,Tf=new Ne,ha=new ho,Oo=new Nn,Nl=new B,Rf=new B;class io extends pt{constructor(e=new An,t=new Bg){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let i=1,s=t.count;i<s;i++)Gc.fromBufferAttribute(t,i-1),Hc.fromBufferAttribute(t,i),n[i]=n[i-1],n[i]+=Gc.distanceTo(Hc);e.setAttribute("lineDistance",new Cn(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,s=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Oo.copy(n.boundingSphere),Oo.applyMatrix4(i),Oo.radius+=s,e.ray.intersectsSphere(Oo)===!1)return;Tf.copy(i).invert(),ha.copy(e.ray).applyMatrix4(Tf);const o=s/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,l=this.isLineSegments?2:1,u=n.index,d=n.attributes.position;if(u!==null){const f=Math.max(0,a.start),A=Math.min(u.count,a.start+a.count);for(let g=f,m=A-1;g<m;g+=l){const p=u.getX(g),E=u.getX(g+1),_=ko(this,e,ha,c,p,E,g);_&&t.push(_)}if(this.isLineLoop){const g=u.getX(A-1),m=u.getX(f),p=ko(this,e,ha,c,g,m,A-1);p&&t.push(p)}}else{const f=Math.max(0,a.start),A=Math.min(d.count,a.start+a.count);for(let g=f,m=A-1;g<m;g+=l){const p=ko(this,e,ha,c,g,g+1,g);p&&t.push(p)}if(this.isLineLoop){const g=ko(this,e,ha,c,A-1,f,A-1);g&&t.push(g)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=i.length;s<a;s++){const o=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}}function ko(r,e,t,n,i,s,a){const o=r.geometry.attributes.position;if(Gc.fromBufferAttribute(o,i),Hc.fromBufferAttribute(o,s),t.distanceSqToSegment(Gc,Hc,Nl,Rf)>n)return;Nl.applyMatrix4(r.matrixWorld);const l=e.ray.origin.distanceTo(Nl);if(!(l<e.near||l>e.far))return{distance:l,point:Rf.clone().applyMatrix4(r.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:r}}const Bf=new B,Df=new B;class mE extends io{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let i=0,s=t.count;i<s;i+=2)Bf.fromBufferAttribute(t,i),Df.fromBufferAttribute(t,i+1),n[i]=i===0?0:n[i-1],n[i+1]=n[i]+Bf.distanceTo(Df);e.setAttribute("lineDistance",new Cn(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class gE extends io{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}}class Dg extends qn{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Me(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const Lf=new Ne,Wu=new ho,Qo=new Nn,Go=new B;class bE extends pt{constructor(e=new An,t=new Dg){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,s=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Qo.copy(n.boundingSphere),Qo.applyMatrix4(i),Qo.radius+=s,e.ray.intersectsSphere(Qo)===!1)return;Lf.copy(i).invert(),Wu.copy(e.ray).applyMatrix4(Lf);const o=s/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,l=n.index,h=n.attributes.position;if(l!==null){const d=Math.max(0,a.start),f=Math.min(l.count,a.start+a.count);for(let A=d,g=f;A<g;A++){const m=l.getX(A);Go.fromBufferAttribute(h,m),Ff(Go,m,c,i,e,t,this)}}else{const d=Math.max(0,a.start),f=Math.min(h.count,a.start+a.count);for(let A=d,g=f;A<g;A++)Go.fromBufferAttribute(h,A),Ff(Go,A,c,i,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=i.length;s<a;s++){const o=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}}function Ff(r,e,t,n,i,s,a){const o=Wu.distanceSqToPoint(r);if(o<t){const c=new B;Wu.closestPointToPoint(r,c),c.applyMatrix4(n);const l=i.ray.origin.distanceTo(c);if(l<i.near||l>i.far)return;s.push({distance:l,distanceToRay:Math.sqrt(o),point:c,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}class _E extends vt{constructor(e,t,n,i,s=Ze,a=Ze,o,c,l){super(e,t,n,i,s,a,o,c,l),this.isVideoTexture=!0,this.generateMipmaps=!1,this._requestVideoFrameCallbackId=0;const u=this;function h(){u.needsUpdate=!0,u._requestVideoFrameCallbackId=e.requestVideoFrameCallback(h)}"requestVideoFrameCallback"in e&&(this._requestVideoFrameCallbackId=e.requestVideoFrameCallback(h))}clone(){return new this.constructor(this.image).copy(this)}update(){const e=this.image;"requestVideoFrameCallback"in e===!1&&e.readyState>=e.HAVE_CURRENT_DATA&&(this.needsUpdate=!0)}dispose(){this._requestVideoFrameCallbackId!==0&&this.source.data.cancelVideoFrameCallback(this._requestVideoFrameCallbackId),super.dispose()}}class Ps extends vt{constructor(e,t,n,i,s,a,o,c,l,u,h,d){super(null,a,o,c,l,u,i,s,h,d),this.isCompressedTexture=!0,this.image={width:t,height:n},this.mipmaps=e,this.flipY=!1,this.generateMipmaps=!1}}class EE extends Ps{constructor(e,t,n,i,s,a){super(e,t,n,s,a),this.isCompressedArrayTexture=!0,this.image.depth=i,this.wrapR=Dt,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class xE extends Ps{constructor(e,t,n){super(void 0,e[0].width,e[0].height,t,n,Us),this.isCompressedCubeTexture=!0,this.isCubeTexture=!0,this.image=e}}class vE extends vt{constructor(e,t,n,i,s,a,o,c,l){super(e,t,n,i,s,a,o,c,l),this.isCanvasTexture=!0,this.needsUpdate=!0}}class Lg extends vt{constructor(e,t,n=ts,i,s,a,o=Ot,c=Ot,l,u=Ya,h=1){if(u!==Ya&&u!==Ka)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const d={width:e,height:t,depth:h};super(d,i,s,a,o,c,u,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new nl(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class Fi extends An{constructor(e=1,t=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:i};const s=e/2,a=t/2,o=Math.floor(n),c=Math.floor(i),l=o+1,u=c+1,h=e/o,d=t/c,f=[],A=[],g=[],m=[];for(let p=0;p<u;p++){const E=p*d-a;for(let _=0;_<l;_++){const b=_*h-s;A.push(b,-E,0),g.push(0,0,1),m.push(_/o),m.push(1-p/c)}}for(let p=0;p<c;p++)for(let E=0;E<o;E++){const _=E+l*p,b=E+l*(p+1),x=E+1+l*(p+1),I=E+1+l*p;f.push(_,b,I),f.push(b,x,I)}this.setIndex(f),this.setAttribute("position",new Cn(A,3)),this.setAttribute("normal",new Cn(g,3)),this.setAttribute("uv",new Cn(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Fi(e.width,e.height,e.widthSegments,e.heightSegments)}}class Id extends An{constructor(e=1,t=32,n=16,i=0,s=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:i,phiLength:s,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const c=Math.min(a+o,Math.PI);let l=0;const u=[],h=new B,d=new B,f=[],A=[],g=[],m=[];for(let p=0;p<=n;p++){const E=[],_=p/n;let b=0;p===0&&a===0?b=.5/t:p===n&&c===Math.PI&&(b=-.5/t);for(let x=0;x<=t;x++){const I=x/t;h.x=-e*Math.cos(i+I*s)*Math.sin(a+_*o),h.y=e*Math.cos(a+_*o),h.z=e*Math.sin(i+I*s)*Math.sin(a+_*o),A.push(h.x,h.y,h.z),d.copy(h).normalize(),g.push(d.x,d.y,d.z),m.push(I+b,1-_),E.push(l++)}u.push(E)}for(let p=0;p<n;p++)for(let E=0;E<t;E++){const _=u[p][E+1],b=u[p][E],x=u[p+1][E],I=u[p+1][E+1];(p!==0||a>0)&&f.push(_,b,I),(p!==n-1||c<Math.PI)&&f.push(b,x,I)}this.setIndex(f),this.setAttribute("position",new Cn(A,3)),this.setAttribute("normal",new Cn(g,3)),this.setAttribute("uv",new Cn(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Id(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class so extends qn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Me(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Me(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=bg,this.normalScale=new ke(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Un,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class li extends so{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new ke(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return qe(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Me(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Me(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Me(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class Fg extends qn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=h_,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class yE extends qn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}function Ho(r,e){return!r||r.constructor===e?r:typeof e.BYTES_PER_ELEMENT=="number"?new e(r):Array.prototype.slice.call(r)}function SE(r){return ArrayBuffer.isView(r)&&!(r instanceof DataView)}function CE(r){function e(i,s){return r[i]-r[s]}const t=r.length,n=new Array(t);for(let i=0;i!==t;++i)n[i]=i;return n.sort(e),n}function Pf(r,e,t){const n=r.length,i=new r.constructor(n);for(let s=0,a=0;a!==n;++s){const o=t[s]*e;for(let c=0;c!==e;++c)i[a++]=r[o+c]}return i}function Pg(r,e,t,n){let i=1,s=r[0];for(;s!==void 0&&s[n]===void 0;)s=r[i++];if(s===void 0)return;let a=s[n];if(a!==void 0)if(Array.isArray(a))do a=s[n],a!==void 0&&(e.push(s.time),t.push(...a)),s=r[i++];while(s!==void 0);else if(a.toArray!==void 0)do a=s[n],a!==void 0&&(e.push(s.time),a.toArray(t,t.length)),s=r[i++];while(s!==void 0);else do a=s[n],a!==void 0&&(e.push(s.time),t.push(a)),s=r[i++];while(s!==void 0)}class fo{constructor(e,t,n,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let n=this._cachedIndex,i=t[n],s=t[n-1];e:{t:{let a;n:{i:if(!(e<i)){for(let o=n+2;;){if(i===void 0){if(e<s)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(s=i,i=t[++n],e<i)break t}a=t.length;break n}if(!(e>=s)){const o=t[1];e<o&&(n=2,s=o);for(let c=n-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===c)break;if(i=s,s=t[--n-1],e>=s)break t}a=n,n=0;break n}break e}for(;n<a;){const o=n+a>>>1;e<t[o]?a=o:n=o+1}if(i=t[n],s=t[n-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,s,i)}return this.interpolate_(n,s,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,s=e*i;for(let a=0;a!==i;++a)t[a]=n[s+a];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}}class IE extends fo{constructor(e,t,n,i){super(e,t,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Sr,endingEnd:Sr}}intervalChanged_(e,t,n){const i=this.parameterPositions;let s=e-2,a=e+1,o=i[s],c=i[a];if(o===void 0)switch(this.getSettings_().endingStart){case Cr:s=e,o=2*t-n;break;case Nc:s=i.length-2,o=t+i[s]-i[s+1];break;default:s=e,o=n}if(c===void 0)switch(this.getSettings_().endingEnd){case Cr:a=e,c=2*n-t;break;case Nc:a=1,c=n+i[1]-i[0];break;default:a=e-1,c=t}const l=(n-t)*.5,u=this.valueSize;this._weightPrev=l/(t-o),this._weightNext=l/(c-n),this._offsetPrev=s*u,this._offsetNext=a*u}interpolate_(e,t,n,i){const s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,u=this._offsetPrev,h=this._offsetNext,d=this._weightPrev,f=this._weightNext,A=(n-t)/(i-t),g=A*A,m=g*A,p=-d*m+2*d*g-d*A,E=(1+d)*m+(-1.5-2*d)*g+(-.5+d)*A+1,_=(-1-f)*m+(1.5+f)*g+.5*A,b=f*m-f*g;for(let x=0;x!==o;++x)s[x]=p*a[u+x]+E*a[l+x]+_*a[c+x]+b*a[h+x];return s}}class Ug extends fo{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,u=(n-t)/(i-t),h=1-u;for(let d=0;d!==o;++d)s[d]=a[l+d]*h+a[c+d]*u;return s}}class ME extends fo{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e){return this.copySampleValue_(e-1)}}class Yn{constructor(e,t,n,i){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Ho(t,this.TimeBufferType),this.values=Ho(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Ho(e.times,Array),values:Ho(e.values,Array)};const i=e.getInterpolation();i!==e.DefaultInterpolation&&(n.interpolation=i)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new ME(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Ug(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new IE(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case Hr:t=this.InterpolantFactoryMethodDiscrete;break;case zr:t=this.InterpolantFactoryMethodLinear;break;case dl:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){const n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Hr;case this.InterpolantFactoryMethodLinear:return zr;case this.InterpolantFactoryMethodSmooth:return dl}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]*=e}return this}trim(e,t){const n=this.times,i=n.length;let s=0,a=i-1;for(;s!==i&&n[s]<e;)++s;for(;a!==-1&&n[a]>t;)--a;if(++a,s!==0||a!==i){s>=a&&(a=Math.max(a,1),s=a-1);const o=this.getValueSize();this.times=n.slice(s,a),this.values=this.values.slice(s*o,a*o)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);const n=this.times,i=this.values,s=n.length;s===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==s;o++){const c=n[o];if(typeof c=="number"&&isNaN(c)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,o,c),e=!1;break}if(a!==null&&a>c){console.error("THREE.KeyframeTrack: Out of order keys.",this,o,c,a),e=!1;break}a=c}if(i!==void 0&&SE(i))for(let o=0,c=i.length;o!==c;++o){const l=i[o];if(isNaN(l)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,o,l),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===dl,s=e.length-1;let a=1;for(let o=1;o<s;++o){let c=!1;const l=e[o],u=e[o+1];if(l!==u&&(o!==1||l!==e[0]))if(i)c=!0;else{const h=o*n,d=h-n,f=h+n;for(let A=0;A!==n;++A){const g=t[h+A];if(g!==t[d+A]||g!==t[f+A]){c=!0;break}}}if(c){if(o!==a){e[a]=e[o];const h=o*n,d=a*n;for(let f=0;f!==n;++f)t[d+f]=t[h+f]}++a}}if(s>0){e[a]=e[s];for(let o=s*n,c=a*n,l=0;l!==n;++l)t[c+l]=t[o+l];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),n=this.constructor,i=new n(this.name,e,t);return i.createInterpolant=this.createInterpolant,i}}Yn.prototype.ValueTypeName="";Yn.prototype.TimeBufferType=Float32Array;Yn.prototype.ValueBufferType=Float32Array;Yn.prototype.DefaultInterpolation=zr;class Jr extends Yn{constructor(e,t,n){super(e,t,n)}}Jr.prototype.ValueTypeName="bool";Jr.prototype.ValueBufferType=Array;Jr.prototype.DefaultInterpolation=Hr;Jr.prototype.InterpolantFactoryMethodLinear=void 0;Jr.prototype.InterpolantFactoryMethodSmooth=void 0;class Ng extends Yn{constructor(e,t,n,i){super(e,t,n,i)}}Ng.prototype.ValueTypeName="color";class qr extends Yn{constructor(e,t,n,i){super(e,t,n,i)}}qr.prototype.ValueTypeName="number";class wE extends fo{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=(n-t)/(i-t);let l=e*o;for(let u=l+o;l!==u;l+=4)un.slerpFlat(s,0,a,l-o,a,l,c);return s}}class Xr extends Yn{constructor(e,t,n,i){super(e,t,n,i)}InterpolantFactoryMethodLinear(e){return new wE(this.times,this.values,this.getValueSize(),e)}}Xr.prototype.ValueTypeName="quaternion";Xr.prototype.InterpolantFactoryMethodSmooth=void 0;class Zr extends Yn{constructor(e,t,n){super(e,t,n)}}Zr.prototype.ValueTypeName="string";Zr.prototype.ValueBufferType=Array;Zr.prototype.DefaultInterpolation=Hr;Zr.prototype.InterpolantFactoryMethodLinear=void 0;Zr.prototype.InterpolantFactoryMethodSmooth=void 0;class $r extends Yn{constructor(e,t,n,i){super(e,t,n,i)}}$r.prototype.ValueTypeName="vector";class qu{constructor(e="",t=-1,n=[],i=_d){this.name=e,this.tracks=n,this.duration=t,this.blendMode=i,this.uuid=Wn(),this.duration<0&&this.resetDuration()}static parse(e){const t=[],n=e.tracks,i=1/(e.fps||1);for(let a=0,o=n.length;a!==o;++a)t.push(RE(n[a]).scale(i));const s=new this(e.name,e.duration,t,e.blendMode);return s.uuid=e.uuid,s}static toJSON(e){const t=[],n=e.tracks,i={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode};for(let s=0,a=n.length;s!==a;++s)t.push(Yn.toJSON(n[s]));return i}static CreateFromMorphTargetSequence(e,t,n,i){const s=t.length,a=[];for(let o=0;o<s;o++){let c=[],l=[];c.push((o+s-1)%s,o,(o+1)%s),l.push(0,1,0);const u=CE(c);c=Pf(c,1,u),l=Pf(l,1,u),!i&&c[0]===0&&(c.push(s),l.push(l[0])),a.push(new qr(".morphTargetInfluences["+t[o].name+"]",c,l).scale(1/n))}return new this(e,-1,a)}static findByName(e,t){let n=e;if(!Array.isArray(e)){const i=e;n=i.geometry&&i.geometry.animations||i.animations}for(let i=0;i<n.length;i++)if(n[i].name===t)return n[i];return null}static CreateClipsFromMorphTargetSequences(e,t,n){const i={},s=/^([\w-]*?)([\d]+)$/;for(let o=0,c=e.length;o<c;o++){const l=e[o],u=l.name.match(s);if(u&&u.length>1){const h=u[1];let d=i[h];d||(i[h]=d=[]),d.push(l)}}const a=[];for(const o in i)a.push(this.CreateFromMorphTargetSequence(o,i[o],t,n));return a}static parseAnimation(e,t){if(console.warn("THREE.AnimationClip: parseAnimation() is deprecated and will be removed with r185"),!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;const n=function(h,d,f,A,g){if(f.length!==0){const m=[],p=[];Pg(f,m,p,A),m.length!==0&&g.push(new h(d,m,p))}},i=[],s=e.name||"default",a=e.fps||30,o=e.blendMode;let c=e.length||-1;const l=e.hierarchy||[];for(let h=0;h<l.length;h++){const d=l[h].keys;if(!(!d||d.length===0))if(d[0].morphTargets){const f={};let A;for(A=0;A<d.length;A++)if(d[A].morphTargets)for(let g=0;g<d[A].morphTargets.length;g++)f[d[A].morphTargets[g]]=-1;for(const g in f){const m=[],p=[];for(let E=0;E!==d[A].morphTargets.length;++E){const _=d[A];m.push(_.time),p.push(_.morphTarget===g?1:0)}i.push(new qr(".morphTargetInfluence["+g+"]",m,p))}c=f.length*a}else{const f=".bones["+t[h].name+"]";n($r,f+".position",d,"pos",i),n(Xr,f+".quaternion",d,"rot",i),n($r,f+".scale",d,"scl",i)}}return i.length===0?null:new this(s,c,i,o)}resetDuration(){const e=this.tracks;let t=0;for(let n=0,i=e.length;n!==i;++n){const s=this.tracks[n];t=Math.max(t,s.times[s.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let t=0;t<this.tracks.length;t++)e.push(this.tracks[t].clone());return new this.constructor(this.name,this.duration,e,this.blendMode)}toJSON(){return this.constructor.toJSON(this)}}function TE(r){switch(r.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return qr;case"vector":case"vector2":case"vector3":case"vector4":return $r;case"color":return Ng;case"quaternion":return Xr;case"bool":case"boolean":return Jr;case"string":return Zr}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+r)}function RE(r){if(r.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=TE(r.type);if(r.times===void 0){const t=[],n=[];Pg(r.keys,t,n,"value"),r.times=t,r.values=n}return e.parse!==void 0?e.parse(r):new e(r.name,r.times,r.values,r.interpolation)}const Ti={enabled:!1,files:{},add:function(r,e){this.enabled!==!1&&(this.files[r]=e)},get:function(r){if(this.enabled!==!1)return this.files[r]},remove:function(r){delete this.files[r]},clear:function(){this.files={}}};class Og{constructor(e,t,n){const i=this;let s=!1,a=0,o=0,c;const l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.abortController=new AbortController,this.itemStart=function(u){o++,s===!1&&i.onStart!==void 0&&i.onStart(u,a,o),s=!0},this.itemEnd=function(u){a++,i.onProgress!==void 0&&i.onProgress(u,a,o),a===o&&(s=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(u){i.onError!==void 0&&i.onError(u)},this.resolveURL=function(u){return c?c(u):u},this.setURLModifier=function(u){return c=u,this},this.addHandler=function(u,h){return l.push(u,h),this},this.removeHandler=function(u){const h=l.indexOf(u);return h!==-1&&l.splice(h,2),this},this.getHandler=function(u){for(let h=0,d=l.length;h<d;h+=2){const f=l[h],A=l[h+1];if(f.global&&(f.lastIndex=0),f.test(u))return A}return null},this.abort=function(){return this.abortController.abort(),this.abortController=new AbortController,this}}}const BE=new Og;class hi{constructor(e){this.manager=e!==void 0?e:BE,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){const n=this;return new Promise(function(i,s){n.load(e,i,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}}hi.DEFAULT_MATERIAL_NAME="__DEFAULT";const gi={};class DE extends Error{constructor(e,t){super(e),this.response=t}}class Di extends hi{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=Ti.get(`file:${e}`);if(s!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(s),this.manager.itemEnd(e)},0),s;if(gi[e]!==void 0){gi[e].push({onLoad:t,onProgress:n,onError:i});return}gi[e]=[],gi[e].push({onLoad:t,onProgress:n,onError:i});const a=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),o=this.mimeType,c=this.responseType;fetch(a).then(l=>{if(l.status===200||l.status===0){if(l.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||l.body===void 0||l.body.getReader===void 0)return l;const u=gi[e],h=l.body.getReader(),d=l.headers.get("X-File-Size")||l.headers.get("Content-Length"),f=d?parseInt(d):0,A=f!==0;let g=0;const m=new ReadableStream({start(p){E();function E(){h.read().then(({done:_,value:b})=>{if(_)p.close();else{g+=b.byteLength;const x=new ProgressEvent("progress",{lengthComputable:A,loaded:g,total:f});for(let I=0,M=u.length;I<M;I++){const w=u[I];w.onProgress&&w.onProgress(x)}p.enqueue(b),E()}},_=>{p.error(_)})}}});return new Response(m)}else throw new DE(`fetch for "${l.url}" responded with ${l.status}: ${l.statusText}`,l)}).then(l=>{switch(c){case"arraybuffer":return l.arrayBuffer();case"blob":return l.blob();case"document":return l.text().then(u=>new DOMParser().parseFromString(u,o));case"json":return l.json();default:if(o==="")return l.text();{const h=/charset="?([^;"\s]*)"?/i.exec(o),d=h&&h[1]?h[1].toLowerCase():void 0,f=new TextDecoder(d);return l.arrayBuffer().then(A=>f.decode(A))}}}).then(l=>{Ti.add(`file:${e}`,l);const u=gi[e];delete gi[e];for(let h=0,d=u.length;h<d;h++){const f=u[h];f.onLoad&&f.onLoad(l)}}).catch(l=>{const u=gi[e];if(u===void 0)throw this.manager.itemError(e),l;delete gi[e];for(let h=0,d=u.length;h<d;h++){const f=u[h];f.onError&&f.onError(l)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}const sr=new WeakMap;class LE extends hi{constructor(e){super(e)}load(e,t,n,i){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=this,a=Ti.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)s.manager.itemStart(e),setTimeout(function(){t&&t(a),s.manager.itemEnd(e)},0);else{let h=sr.get(a);h===void 0&&(h=[],sr.set(a,h)),h.push({onLoad:t,onError:i})}return a}const o=no("img");function c(){u(),t&&t(this);const h=sr.get(this)||[];for(let d=0;d<h.length;d++){const f=h[d];f.onLoad&&f.onLoad(this)}sr.delete(this),s.manager.itemEnd(e)}function l(h){u(),i&&i(h),Ti.remove(`image:${e}`);const d=sr.get(this)||[];for(let f=0;f<d.length;f++){const A=d[f];A.onError&&A.onError(h)}sr.delete(this),s.manager.itemError(e),s.manager.itemEnd(e)}function u(){o.removeEventListener("load",c,!1),o.removeEventListener("error",l,!1)}return o.addEventListener("load",c,!1),o.addEventListener("error",l,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),Ti.add(`image:${e}`,o),s.manager.itemStart(e),o.src=e,o}}class FE extends hi{constructor(e){super(e)}load(e,t,n,i){const s=this,a=new uo,o=new Di(this.manager);return o.setResponseType("arraybuffer"),o.setRequestHeader(this.requestHeader),o.setPath(this.path),o.setWithCredentials(s.withCredentials),o.load(e,function(c){let l;try{l=s.parse(c)}catch(u){if(i!==void 0)i(u);else{console.error(u);return}}l.image!==void 0?a.image=l.image:l.data!==void 0&&(a.image.width=l.width,a.image.height=l.height,a.image.data=l.data),a.wrapS=l.wrapS!==void 0?l.wrapS:Dt,a.wrapT=l.wrapT!==void 0?l.wrapT:Dt,a.magFilter=l.magFilter!==void 0?l.magFilter:Ze,a.minFilter=l.minFilter!==void 0?l.minFilter:Ze,a.anisotropy=l.anisotropy!==void 0?l.anisotropy:1,l.colorSpace!==void 0&&(a.colorSpace=l.colorSpace),l.flipY!==void 0&&(a.flipY=l.flipY),l.format!==void 0&&(a.format=l.format),l.type!==void 0&&(a.type=l.type),l.mipmaps!==void 0&&(a.mipmaps=l.mipmaps,a.minFilter=hn),l.mipmapCount===1&&(a.minFilter=Ze),l.generateMipmaps!==void 0&&(a.generateMipmaps=l.generateMipmaps),a.needsUpdate=!0,t&&t(a,l)},n,i),a}}class kg extends hi{constructor(e){super(e)}load(e,t,n,i){const s=new vt,a=new LE(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){s.image=o,s.needsUpdate=!0,t!==void 0&&t(s)},n,i),s}}class il extends pt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Me(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}const Ol=new Ne,Uf=new B,Nf=new B;class Md{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ke(512,512),this.mapType=It,this.map=null,this.mapPass=null,this.matrix=new Ne,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Cd,this._frameExtents=new ke(1,1),this._viewportCount=1,this._viewports=[new it(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;Uf.setFromMatrixPosition(e.matrixWorld),t.position.copy(Uf),Nf.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Nf),t.updateMatrixWorld(),Ol.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Ol,t.coordinateSystem,t.reversedDepth),t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Ol)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class PE extends Md{constructor(){super(new $t(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){const t=this.camera,n=Vr*2*e.angle*this.focus,i=this.mapSize.width/this.mapSize.height*this.aspect,s=e.distance||t.far;(n!==t.fov||i!==t.aspect||s!==t.far)&&(t.fov=n,t.aspect=i,t.far=s,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class UE extends il{constructor(e,t,n=0,i=Math.PI/3,s=0,a=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(pt.DEFAULT_UP),this.updateMatrix(),this.target=new pt,this.distance=n,this.angle=i,this.penumbra=s,this.decay=a,this.map=null,this.shadow=new PE}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}const Of=new Ne,ua=new B,kl=new B;class NE extends Md{constructor(){super(new $t(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new ke(4,2),this._viewportCount=6,this._viewports=[new it(2,1,1,1),new it(0,1,1,1),new it(3,1,1,1),new it(1,1,1,1),new it(3,0,1,1),new it(1,0,1,1)],this._cubeDirections=[new B(1,0,0),new B(-1,0,0),new B(0,0,1),new B(0,0,-1),new B(0,1,0),new B(0,-1,0)],this._cubeUps=[new B(0,1,0),new B(0,1,0),new B(0,1,0),new B(0,1,0),new B(0,0,1),new B(0,0,-1)]}updateMatrices(e,t=0){const n=this.camera,i=this.matrix,s=e.distance||n.far;s!==n.far&&(n.far=s,n.updateProjectionMatrix()),ua.setFromMatrixPosition(e.matrixWorld),n.position.copy(ua),kl.copy(n.position),kl.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(kl),n.updateMatrixWorld(),i.makeTranslation(-ua.x,-ua.y,-ua.z),Of.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Of,n.coordinateSystem,n.reversedDepth)}}class Qg extends il{constructor(e,t,n=0,i=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new NE}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class ea extends wg{constructor(e=-1,t=1,n=1,i=-1,s=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=s,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,s,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2;let s=n-e,a=n+e,o=i+t,c=i-t;if(this.view!==null&&this.view.enabled){const l=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=l*this.view.offsetX,a=s+l*this.view.width,o-=u*this.view.offsetY,c=o-u*this.view.height}this.projectionMatrix.makeOrthographic(s,a,o,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class OE extends Md{constructor(){super(new ea(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Gg extends il{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(pt.DEFAULT_UP),this.updateMatrix(),this.target=new pt,this.shadow=new OE}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class kE{constructor(){this.isSphericalHarmonics3=!0,this.coefficients=[];for(let e=0;e<9;e++)this.coefficients.push(new B)}set(e){for(let t=0;t<9;t++)this.coefficients[t].copy(e[t]);return this}zero(){for(let e=0;e<9;e++)this.coefficients[e].set(0,0,0);return this}getAt(e,t){const n=e.x,i=e.y,s=e.z,a=this.coefficients;return t.copy(a[0]).multiplyScalar(.282095),t.addScaledVector(a[1],.488603*i),t.addScaledVector(a[2],.488603*s),t.addScaledVector(a[3],.488603*n),t.addScaledVector(a[4],1.092548*(n*i)),t.addScaledVector(a[5],1.092548*(i*s)),t.addScaledVector(a[6],.315392*(3*s*s-1)),t.addScaledVector(a[7],1.092548*(n*s)),t.addScaledVector(a[8],.546274*(n*n-i*i)),t}getIrradianceAt(e,t){const n=e.x,i=e.y,s=e.z,a=this.coefficients;return t.copy(a[0]).multiplyScalar(.886227),t.addScaledVector(a[1],2*.511664*i),t.addScaledVector(a[2],2*.511664*s),t.addScaledVector(a[3],2*.511664*n),t.addScaledVector(a[4],2*.429043*n*i),t.addScaledVector(a[5],2*.429043*i*s),t.addScaledVector(a[6],.743125*s*s-.247708),t.addScaledVector(a[7],2*.429043*n*s),t.addScaledVector(a[8],.429043*(n*n-i*i)),t}add(e){for(let t=0;t<9;t++)this.coefficients[t].add(e.coefficients[t]);return this}addScaledSH(e,t){for(let n=0;n<9;n++)this.coefficients[n].addScaledVector(e.coefficients[n],t);return this}scale(e){for(let t=0;t<9;t++)this.coefficients[t].multiplyScalar(e);return this}lerp(e,t){for(let n=0;n<9;n++)this.coefficients[n].lerp(e.coefficients[n],t);return this}equals(e){for(let t=0;t<9;t++)if(!this.coefficients[t].equals(e.coefficients[t]))return!1;return!0}copy(e){return this.set(e.coefficients)}clone(){return new this.constructor().copy(this)}fromArray(e,t=0){const n=this.coefficients;for(let i=0;i<9;i++)n[i].fromArray(e,t+i*3);return this}toArray(e=[],t=0){const n=this.coefficients;for(let i=0;i<9;i++)n[i].toArray(e,t+i*3);return e}static getBasisAt(e,t){const n=e.x,i=e.y,s=e.z;t[0]=.282095,t[1]=.488603*i,t[2]=.488603*s,t[3]=.488603*n,t[4]=1.092548*n*i,t[5]=1.092548*i*s,t[6]=.315392*(3*s*s-1),t[7]=1.092548*n*s,t[8]=.546274*(n*n-i*i)}}class QE extends il{constructor(e=new kE,t=1){super(void 0,t),this.isLightProbe=!0,this.sh=e}copy(e){return super.copy(e),this.sh.copy(e.sh),this}fromJSON(e){return this.intensity=e.intensity,this.sh.fromArray(e.sh),this}toJSON(e){const t=super.toJSON(e);return t.object.sh=this.sh.toArray(),t}}class za{static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}const Ql=new WeakMap;class GE extends hi{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=this,a=Ti.get(`image-bitmap:${e}`);if(a!==void 0){if(s.manager.itemStart(e),a.then){a.then(l=>{if(Ql.has(a)===!0)i&&i(Ql.get(a)),s.manager.itemError(e),s.manager.itemEnd(e);else return t&&t(l),s.manager.itemEnd(e),l});return}return setTimeout(function(){t&&t(a),s.manager.itemEnd(e)},0),a}const o={};o.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",o.headers=this.requestHeader,o.signal=typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;const c=fetch(e,o).then(function(l){return l.blob()}).then(function(l){return createImageBitmap(l,Object.assign(s.options,{colorSpaceConversion:"none"}))}).then(function(l){return Ti.add(`image-bitmap:${e}`,l),t&&t(l),s.manager.itemEnd(e),l}).catch(function(l){i&&i(l),Ql.set(c,l),Ti.remove(`image-bitmap:${e}`),s.manager.itemError(e),s.manager.itemEnd(e)});Ti.add(`image-bitmap:${e}`,c),s.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}class HE extends $t{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}class zE{constructor(e,t,n){this.binding=e,this.valueSize=n;let i,s,a;switch(t){case"quaternion":i=this._slerp,s=this._slerpAdditive,a=this._setAdditiveIdentityQuaternion,this.buffer=new Float64Array(n*6),this._workIndex=5;break;case"string":case"bool":i=this._select,s=this._select,a=this._setAdditiveIdentityOther,this.buffer=new Array(n*5);break;default:i=this._lerp,s=this._lerpAdditive,a=this._setAdditiveIdentityNumeric,this.buffer=new Float64Array(n*5)}this._mixBufferRegion=i,this._mixBufferRegionAdditive=s,this._setIdentity=a,this._origIndex=3,this._addIndex=4,this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,this.useCount=0,this.referenceCount=0}accumulate(e,t){const n=this.buffer,i=this.valueSize,s=e*i+i;let a=this.cumulativeWeight;if(a===0){for(let o=0;o!==i;++o)n[s+o]=n[o];a=t}else{a+=t;const o=t/a;this._mixBufferRegion(n,s,0,o,i)}this.cumulativeWeight=a}accumulateAdditive(e){const t=this.buffer,n=this.valueSize,i=n*this._addIndex;this.cumulativeWeightAdditive===0&&this._setIdentity(),this._mixBufferRegionAdditive(t,i,0,e,n),this.cumulativeWeightAdditive+=e}apply(e){const t=this.valueSize,n=this.buffer,i=e*t+t,s=this.cumulativeWeight,a=this.cumulativeWeightAdditive,o=this.binding;if(this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,s<1){const c=t*this._origIndex;this._mixBufferRegion(n,i,c,1-s,t)}a>0&&this._mixBufferRegionAdditive(n,i,this._addIndex*t,1,t);for(let c=t,l=t+t;c!==l;++c)if(n[c]!==n[c+t]){o.setValue(n,i);break}}saveOriginalState(){const e=this.binding,t=this.buffer,n=this.valueSize,i=n*this._origIndex;e.getValue(t,i);for(let s=n,a=i;s!==a;++s)t[s]=t[i+s%n];this._setIdentity(),this.cumulativeWeight=0,this.cumulativeWeightAdditive=0}restoreOriginalState(){const e=this.valueSize*3;this.binding.setValue(this.buffer,e)}_setAdditiveIdentityNumeric(){const e=this._addIndex*this.valueSize,t=e+this.valueSize;for(let n=e;n<t;n++)this.buffer[n]=0}_setAdditiveIdentityQuaternion(){this._setAdditiveIdentityNumeric(),this.buffer[this._addIndex*this.valueSize+3]=1}_setAdditiveIdentityOther(){const e=this._origIndex*this.valueSize,t=this._addIndex*this.valueSize;for(let n=0;n<this.valueSize;n++)this.buffer[t+n]=this.buffer[e+n]}_select(e,t,n,i,s){if(i>=.5)for(let a=0;a!==s;++a)e[t+a]=e[n+a]}_slerp(e,t,n,i){un.slerpFlat(e,t,e,t,e,n,i)}_slerpAdditive(e,t,n,i,s){const a=this._workIndex*s;un.multiplyQuaternionsFlat(e,a,e,t,e,n),un.slerpFlat(e,t,e,t,e,a,i)}_lerp(e,t,n,i,s){const a=1-i;for(let o=0;o!==s;++o){const c=t+o;e[c]=e[c]*a+e[n+o]*i}}_lerpAdditive(e,t,n,i,s){for(let a=0;a!==s;++a){const o=t+a;e[o]=e[o]+e[n+a]*i}}}const wd="\\[\\]\\.:\\/",VE=new RegExp("["+wd+"]","g"),Td="[^"+wd+"]",WE="[^"+wd.replace("\\.","")+"]",qE=/((?:WC+[\/:])*)/.source.replace("WC",Td),XE=/(WCOD+)?/.source.replace("WCOD",WE),$E=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Td),jE=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Td),YE=new RegExp("^"+qE+XE+$E+jE+"$"),KE=["material","materials","bones","map"];class JE{constructor(e,t,n){const i=n||et.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,i)}getValue(e,t){this.bind();const n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(e,t)}setValue(e,t){const n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,s=n.length;i!==s;++i)n[i].setValue(e,t)}bind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}}class et{constructor(e,t,n){this.path=t,this.parsedPath=n||et.parseTrackName(t),this.node=et.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new et.Composite(e,t,n):new et(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(VE,"")}static parseTrackName(e){const t=YE.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);const n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){const s=n.nodeName.substring(i+1);KE.indexOf(s)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=s)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){const n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){const n=function(s){for(let a=0;a<s.length;a++){const o=s[a];if(o.name===t||o.uuid===t)return o;const c=n(o.children);if(c)return c}return null},i=n(e.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){const n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)e[t++]=n[i]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){const n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++]}_setValue_array_setNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node;const t=this.parsedPath,n=t.objectName,i=t.propertyName;let s=t.propertyIndex;if(e||(e=et.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let l=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===l){l=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(l!==void 0){if(e[l]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[l]}}const a=e[i];if(a===void 0){const l=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+l+"."+i+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(s!==void 0){if(i==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}c=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=s}else a.fromArray!==void 0&&a.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(c=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}et.Composite=JE;et.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};et.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};et.prototype.GetterByBindingType=[et.prototype._getValue_direct,et.prototype._getValue_array,et.prototype._getValue_arrayElement,et.prototype._getValue_toArray];et.prototype.SetterByBindingTypeAndVersioning=[[et.prototype._setValue_direct,et.prototype._setValue_direct_setNeedsUpdate,et.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[et.prototype._setValue_array,et.prototype._setValue_array_setNeedsUpdate,et.prototype._setValue_array_setMatrixWorldNeedsUpdate],[et.prototype._setValue_arrayElement,et.prototype._setValue_arrayElement_setNeedsUpdate,et.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[et.prototype._setValue_fromArray,et.prototype._setValue_fromArray_setNeedsUpdate,et.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];class ZE{constructor(e,t,n=null,i=t.blendMode){this._mixer=e,this._clip=t,this._localRoot=n,this.blendMode=i;const s=t.tracks,a=s.length,o=new Array(a),c={endingStart:Sr,endingEnd:Sr};for(let l=0;l!==a;++l){const u=s[l].createInterpolant(null);o[l]=u,u.settings=c}this._interpolantSettings=c,this._interpolants=o,this._propertyBindings=new Array(a),this._cacheIndex=null,this._byClipCacheIndex=null,this._timeScaleInterpolant=null,this._weightInterpolant=null,this.loop=Lr,this._loopCount=-1,this._startTime=null,this.time=0,this.timeScale=1,this._effectiveTimeScale=1,this.weight=1,this._effectiveWeight=1,this.repetitions=1/0,this.paused=!1,this.enabled=!0,this.clampWhenFinished=!1,this.zeroSlopeAtStart=!0,this.zeroSlopeAtEnd=!0}play(){return this._mixer._activateAction(this),this}stop(){return this._mixer._deactivateAction(this),this.reset()}reset(){return this.paused=!1,this.enabled=!0,this.time=0,this._loopCount=-1,this._startTime=null,this.stopFading().stopWarping()}isRunning(){return this.enabled&&!this.paused&&this.timeScale!==0&&this._startTime===null&&this._mixer._isActiveAction(this)}isScheduled(){return this._mixer._isActiveAction(this)}startAt(e){return this._startTime=e,this}setLoop(e,t){return this.loop=e,this.repetitions=t,this}setEffectiveWeight(e){return this.weight=e,this._effectiveWeight=this.enabled?e:0,this.stopFading()}getEffectiveWeight(){return this._effectiveWeight}fadeIn(e){return this._scheduleFading(e,0,1)}fadeOut(e){return this._scheduleFading(e,1,0)}crossFadeFrom(e,t,n=!1){if(e.fadeOut(t),this.fadeIn(t),n===!0){const i=this._clip.duration,s=e._clip.duration,a=s/i,o=i/s;e.warp(1,a,t),this.warp(o,1,t)}return this}crossFadeTo(e,t,n=!1){return e.crossFadeFrom(this,t,n)}stopFading(){const e=this._weightInterpolant;return e!==null&&(this._weightInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}setEffectiveTimeScale(e){return this.timeScale=e,this._effectiveTimeScale=this.paused?0:e,this.stopWarping()}getEffectiveTimeScale(){return this._effectiveTimeScale}setDuration(e){return this.timeScale=this._clip.duration/e,this.stopWarping()}syncWith(e){return this.time=e.time,this.timeScale=e.timeScale,this.stopWarping()}halt(e){return this.warp(this._effectiveTimeScale,0,e)}warp(e,t,n){const i=this._mixer,s=i.time,a=this.timeScale;let o=this._timeScaleInterpolant;o===null&&(o=i._lendControlInterpolant(),this._timeScaleInterpolant=o);const c=o.parameterPositions,l=o.sampleValues;return c[0]=s,c[1]=s+n,l[0]=e/a,l[1]=t/a,this}stopWarping(){const e=this._timeScaleInterpolant;return e!==null&&(this._timeScaleInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}getMixer(){return this._mixer}getClip(){return this._clip}getRoot(){return this._localRoot||this._mixer._root}_update(e,t,n,i){if(!this.enabled){this._updateWeight(e);return}const s=this._startTime;if(s!==null){const c=(e-s)*n;c<0||n===0?t=0:(this._startTime=null,t=n*c)}t*=this._updateTimeScale(e);const a=this._updateTime(t),o=this._updateWeight(e);if(o>0){const c=this._interpolants,l=this._propertyBindings;switch(this.blendMode){case c_:for(let u=0,h=c.length;u!==h;++u)c[u].evaluate(a),l[u].accumulateAdditive(o);break;case _d:default:for(let u=0,h=c.length;u!==h;++u)c[u].evaluate(a),l[u].accumulate(i,o)}}}_updateWeight(e){let t=0;if(this.enabled){t=this.weight;const n=this._weightInterpolant;if(n!==null){const i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(this.stopFading(),i===0&&(this.enabled=!1))}}return this._effectiveWeight=t,t}_updateTimeScale(e){let t=0;if(!this.paused){t=this.timeScale;const n=this._timeScaleInterpolant;if(n!==null){const i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(this.stopWarping(),t===0?this.paused=!0:this.timeScale=t)}}return this._effectiveTimeScale=t,t}_updateTime(e){const t=this._clip.duration,n=this.loop;let i=this.time+e,s=this._loopCount;const a=n===Uc;if(e===0)return s===-1?i:a&&(s&1)===1?t-i:i;if(n===to){s===-1&&(this._loopCount=0,this._setEndings(!0,!0,!1));e:{if(i>=t)i=t;else if(i<0)i=0;else{this.time=i;break e}this.clampWhenFinished?this.paused=!0:this.enabled=!1,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e<0?-1:1})}}else{if(s===-1&&(e>=0?(s=0,this._setEndings(!0,this.repetitions===0,a)):this._setEndings(this.repetitions===0,!0,a)),i>=t||i<0){const o=Math.floor(i/t);i-=t*o,s+=Math.abs(o);const c=this.repetitions-s;if(c<=0)this.clampWhenFinished?this.paused=!0:this.enabled=!1,i=e>0?t:0,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e>0?1:-1});else{if(c===1){const l=e<0;this._setEndings(l,!l,a)}else this._setEndings(!1,!1,a);this._loopCount=s,this.time=i,this._mixer.dispatchEvent({type:"loop",action:this,loopDelta:o})}}else this.time=i;if(a&&(s&1)===1)return t-i}return i}_setEndings(e,t,n){const i=this._interpolantSettings;n?(i.endingStart=Cr,i.endingEnd=Cr):(e?i.endingStart=this.zeroSlopeAtStart?Cr:Sr:i.endingStart=Nc,t?i.endingEnd=this.zeroSlopeAtEnd?Cr:Sr:i.endingEnd=Nc)}_scheduleFading(e,t,n){const i=this._mixer,s=i.time;let a=this._weightInterpolant;a===null&&(a=i._lendControlInterpolant(),this._weightInterpolant=a);const o=a.parameterPositions,c=a.sampleValues;return o[0]=s,c[0]=t,o[1]=s+e,c[1]=n,this}}const ex=new Float32Array(1);class tx extends jn{constructor(e){super(),this._root=e,this._initMemoryManager(),this._accuIndex=0,this.time=0,this.timeScale=1}_bindAction(e,t){const n=e._localRoot||this._root,i=e._clip.tracks,s=i.length,a=e._propertyBindings,o=e._interpolants,c=n.uuid,l=this._bindingsByRootAndName;let u=l[c];u===void 0&&(u={},l[c]=u);for(let h=0;h!==s;++h){const d=i[h],f=d.name;let A=u[f];if(A!==void 0)++A.referenceCount,a[h]=A;else{if(A=a[h],A!==void 0){A._cacheIndex===null&&(++A.referenceCount,this._addInactiveBinding(A,c,f));continue}const g=t&&t._propertyBindings[h].binding.parsedPath;A=new zE(et.create(n,f,g),d.ValueTypeName,d.getValueSize()),++A.referenceCount,this._addInactiveBinding(A,c,f),a[h]=A}o[h].resultBuffer=A.buffer}}_activateAction(e){if(!this._isActiveAction(e)){if(e._cacheIndex===null){const n=(e._localRoot||this._root).uuid,i=e._clip.uuid,s=this._actionsByClip[i];this._bindAction(e,s&&s.knownActions[0]),this._addInactiveAction(e,i,n)}const t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){const s=t[n];s.useCount++===0&&(this._lendBinding(s),s.saveOriginalState())}this._lendAction(e)}}_deactivateAction(e){if(this._isActiveAction(e)){const t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){const s=t[n];--s.useCount===0&&(s.restoreOriginalState(),this._takeBackBinding(s))}this._takeBackAction(e)}}_initMemoryManager(){this._actions=[],this._nActiveActions=0,this._actionsByClip={},this._bindings=[],this._nActiveBindings=0,this._bindingsByRootAndName={},this._controlInterpolants=[],this._nActiveControlInterpolants=0;const e=this;this.stats={actions:{get total(){return e._actions.length},get inUse(){return e._nActiveActions}},bindings:{get total(){return e._bindings.length},get inUse(){return e._nActiveBindings}},controlInterpolants:{get total(){return e._controlInterpolants.length},get inUse(){return e._nActiveControlInterpolants}}}}_isActiveAction(e){const t=e._cacheIndex;return t!==null&&t<this._nActiveActions}_addInactiveAction(e,t,n){const i=this._actions,s=this._actionsByClip;let a=s[t];if(a===void 0)a={knownActions:[e],actionByRoot:{}},e._byClipCacheIndex=0,s[t]=a;else{const o=a.knownActions;e._byClipCacheIndex=o.length,o.push(e)}e._cacheIndex=i.length,i.push(e),a.actionByRoot[n]=e}_removeInactiveAction(e){const t=this._actions,n=t[t.length-1],i=e._cacheIndex;n._cacheIndex=i,t[i]=n,t.pop(),e._cacheIndex=null;const s=e._clip.uuid,a=this._actionsByClip,o=a[s],c=o.knownActions,l=c[c.length-1],u=e._byClipCacheIndex;l._byClipCacheIndex=u,c[u]=l,c.pop(),e._byClipCacheIndex=null;const h=o.actionByRoot,d=(e._localRoot||this._root).uuid;delete h[d],c.length===0&&delete a[s],this._removeInactiveBindingsForAction(e)}_removeInactiveBindingsForAction(e){const t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){const s=t[n];--s.referenceCount===0&&this._removeInactiveBinding(s)}}_lendAction(e){const t=this._actions,n=e._cacheIndex,i=this._nActiveActions++,s=t[i];e._cacheIndex=i,t[i]=e,s._cacheIndex=n,t[n]=s}_takeBackAction(e){const t=this._actions,n=e._cacheIndex,i=--this._nActiveActions,s=t[i];e._cacheIndex=i,t[i]=e,s._cacheIndex=n,t[n]=s}_addInactiveBinding(e,t,n){const i=this._bindingsByRootAndName,s=this._bindings;let a=i[t];a===void 0&&(a={},i[t]=a),a[n]=e,e._cacheIndex=s.length,s.push(e)}_removeInactiveBinding(e){const t=this._bindings,n=e.binding,i=n.rootNode.uuid,s=n.path,a=this._bindingsByRootAndName,o=a[i],c=t[t.length-1],l=e._cacheIndex;c._cacheIndex=l,t[l]=c,t.pop(),delete o[s],Object.keys(o).length===0&&delete a[i]}_lendBinding(e){const t=this._bindings,n=e._cacheIndex,i=this._nActiveBindings++,s=t[i];e._cacheIndex=i,t[i]=e,s._cacheIndex=n,t[n]=s}_takeBackBinding(e){const t=this._bindings,n=e._cacheIndex,i=--this._nActiveBindings,s=t[i];e._cacheIndex=i,t[i]=e,s._cacheIndex=n,t[n]=s}_lendControlInterpolant(){const e=this._controlInterpolants,t=this._nActiveControlInterpolants++;let n=e[t];return n===void 0&&(n=new Ug(new Float32Array(2),new Float32Array(2),1,ex),n.__cacheIndex=t,e[t]=n),n}_takeBackControlInterpolant(e){const t=this._controlInterpolants,n=e.__cacheIndex,i=--this._nActiveControlInterpolants,s=t[i];e.__cacheIndex=i,t[i]=e,s.__cacheIndex=n,t[n]=s}clipAction(e,t,n){const i=t||this._root,s=i.uuid;let a=typeof e=="string"?qu.findByName(i,e):e;const o=a!==null?a.uuid:e,c=this._actionsByClip[o];let l=null;if(n===void 0&&(a!==null?n=a.blendMode:n=_d),c!==void 0){const h=c.actionByRoot[s];if(h!==void 0&&h.blendMode===n)return h;l=c.knownActions[0],a===null&&(a=l._clip)}if(a===null)return null;const u=new ZE(this,a,t,n);return this._bindAction(u,l),this._addInactiveAction(u,o,s),u}existingAction(e,t){const n=t||this._root,i=n.uuid,s=typeof e=="string"?qu.findByName(n,e):e,a=s?s.uuid:e,o=this._actionsByClip[a];return o!==void 0&&o.actionByRoot[i]||null}stopAllAction(){const e=this._actions,t=this._nActiveActions;for(let n=t-1;n>=0;--n)e[n].stop();return this}update(e){e*=this.timeScale;const t=this._actions,n=this._nActiveActions,i=this.time+=e,s=Math.sign(e),a=this._accuIndex^=1;for(let l=0;l!==n;++l)t[l]._update(i,e,s,a);const o=this._bindings,c=this._nActiveBindings;for(let l=0;l!==c;++l)o[l].apply(a);return this}setTime(e){this.time=0;for(let t=0;t<this._actions.length;t++)this._actions[t].time=0;return this.update(e)}getRoot(){return this._root}uncacheClip(e){const t=this._actions,n=e.uuid,i=this._actionsByClip,s=i[n];if(s!==void 0){const a=s.knownActions;for(let o=0,c=a.length;o!==c;++o){const l=a[o];this._deactivateAction(l);const u=l._cacheIndex,h=t[t.length-1];l._cacheIndex=null,l._byClipCacheIndex=null,h._cacheIndex=u,t[u]=h,t.pop(),this._removeInactiveBindingsForAction(l)}delete i[n]}}uncacheRoot(e){const t=e.uuid,n=this._actionsByClip;for(const a in n){const o=n[a].actionByRoot,c=o[t];c!==void 0&&(this._deactivateAction(c),this._removeInactiveAction(c))}const i=this._bindingsByRootAndName,s=i[t];if(s!==void 0)for(const a in s){const o=s[a];o.restoreOriginalState(),this._removeInactiveBinding(o)}}uncacheAction(e,t){const n=this.existingAction(e,t);n!==null&&(this._deactivateAction(n),this._removeInactiveAction(n))}}const kf=new Ne;class nx{constructor(e,t,n=0,i=1/0){this.ray=new ho(e,t),this.near=n,this.far=i,this.camera=null,this.layers=new xd,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return kf.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(kf),this}intersectObject(e,t=!0,n=[]){return Xu(e,this,n,t),n.sort(Qf),n}intersectObjects(e,t=!0,n=[]){for(let i=0,s=e.length;i<s;i++)Xu(e[i],this,n,t);return n.sort(Qf),n}}function Qf(r,e){return r.distance-e.distance}function Xu(r,e,t,n){let i=!0;if(r.layers.test(e.layers)&&r.raycast(e,t)===!1&&(i=!1),i===!0&&n===!0){const s=r.children;for(let a=0,o=s.length;a<o;a++)Xu(s[a],e,t,!0)}}class xc{constructor(e=1,t=0,n=0){this.radius=e,this.phi=t,this.theta=n}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=qe(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(qe(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}function Gf(r,e,t,n){const i=ix(n);switch(t){case pg:return r*e;case Yi:return r*e/i.components*i.byteLength;case md:return r*e/i.components*i.byteLength;case ws:return r*e*2/i.components*i.byteLength;case gd:return r*e*2/i.components*i.byteLength;case Ag:return r*e*3/i.components*i.byteLength;case xt:return r*e*4/i.components*i.byteLength;case bd:return r*e*4/i.components*i.byteLength;case Br:case Bs:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*8;case Dr:case Ds:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case yu:case Su:return Math.max(r,16)*Math.max(e,8)/4;case Dc:case Lc:return Math.max(r,8)*Math.max(e,8)/2;case Fc:case Ja:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*8;case Za:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case Ls:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case Cu:return Math.floor((r+4)/5)*Math.floor((e+3)/4)*16;case Iu:return Math.floor((r+4)/5)*Math.floor((e+4)/5)*16;case Mu:return Math.floor((r+5)/6)*Math.floor((e+4)/5)*16;case eo:return Math.floor((r+5)/6)*Math.floor((e+5)/6)*16;case wu:return Math.floor((r+7)/8)*Math.floor((e+4)/5)*16;case Tu:return Math.floor((r+7)/8)*Math.floor((e+5)/6)*16;case Ru:return Math.floor((r+7)/8)*Math.floor((e+7)/8)*16;case Bu:return Math.floor((r+9)/10)*Math.floor((e+4)/5)*16;case Du:return Math.floor((r+9)/10)*Math.floor((e+5)/6)*16;case Lu:return Math.floor((r+9)/10)*Math.floor((e+7)/8)*16;case Fu:return Math.floor((r+9)/10)*Math.floor((e+9)/10)*16;case Pu:return Math.floor((r+11)/12)*Math.floor((e+9)/10)*16;case Uu:return Math.floor((r+11)/12)*Math.floor((e+11)/12)*16;case Fs:case Nu:case Pc:return Math.ceil(r/4)*Math.ceil(e/4)*16;case mg:case Ou:return Math.ceil(r/4)*Math.ceil(e/4)*8;case ku:case Qu:return Math.ceil(r/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function ix(r){switch(r){case It:case dd:return{byteLength:1,components:1};case $a:case fd:case Nt:return{byteLength:2,components:1};case pd:case Ad:return{byteLength:2,components:4};case ts:case tl:case Lt:return{byteLength:4,components:1};case fg:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${r}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Zc}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Zc);/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function Hg(){let r=null,e=!1,t=null,n=null;function i(s,a){t(s,a),n=r.requestAnimationFrame(i)}return{start:function(){e!==!0&&t!==null&&(n=r.requestAnimationFrame(i),e=!0)},stop:function(){r.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){r=s}}}function sx(r){const e=new WeakMap;function t(o,c){const l=o.array,u=o.usage,h=l.byteLength,d=r.createBuffer();r.bindBuffer(c,d),r.bufferData(c,l,u),o.onUploadCallback();let f;if(l instanceof Float32Array)f=r.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)f=r.HALF_FLOAT;else if(l instanceof Uint16Array)o.isFloat16BufferAttribute?f=r.HALF_FLOAT:f=r.UNSIGNED_SHORT;else if(l instanceof Int16Array)f=r.SHORT;else if(l instanceof Uint32Array)f=r.UNSIGNED_INT;else if(l instanceof Int32Array)f=r.INT;else if(l instanceof Int8Array)f=r.BYTE;else if(l instanceof Uint8Array)f=r.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)f=r.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:d,type:f,bytesPerElement:l.BYTES_PER_ELEMENT,version:o.version,size:h}}function n(o,c,l){const u=c.array,h=c.updateRanges;if(r.bindBuffer(l,o),h.length===0)r.bufferSubData(l,0,u);else{h.sort((f,A)=>f.start-A.start);let d=0;for(let f=1;f<h.length;f++){const A=h[d],g=h[f];g.start<=A.start+A.count+1?A.count=Math.max(A.count,g.start+g.count-A.start):(++d,h[d]=g)}h.length=d+1;for(let f=0,A=h.length;f<A;f++){const g=h[f];r.bufferSubData(l,g.start*u.BYTES_PER_ELEMENT,u,g.start,g.count)}c.clearUpdateRanges()}c.onUploadCallback()}function i(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function s(o){o.isInterleavedBufferAttribute&&(o=o.data);const c=e.get(o);c&&(r.deleteBuffer(c.buffer),e.delete(o))}function a(o,c){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const u=e.get(o);(!u||u.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const l=e.get(o);if(l===void 0)e.set(o,t(o,c));else if(l.version<o.version){if(l.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(l.buffer,o,c),l.version=o.version}}return{get:i,remove:s,update:a}}var rx=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,ax=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,ox=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,cx=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,lx=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,hx=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,ux=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,dx=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,fx=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,px=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Ax=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,mx=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,gx=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,bx=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,_x=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Ex=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,xx=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,vx=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,yx=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Sx=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Cx=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Ix=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Mx=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,wx=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Tx=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Rx=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Bx=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Dx=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Lx=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Fx=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Px="gl_FragColor = linearToOutputTexel( gl_FragColor );",Ux=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Nx=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Ox=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,kx=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Qx=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Gx=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Hx=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,zx=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Vx=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Wx=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,qx=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Xx=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,$x=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,jx=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Yx=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,Kx=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Jx=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Zx=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,ev=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,tv=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,nv=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,iv=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,sv=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,rv=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,av=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,ov=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,cv=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,lv=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,hv=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,uv=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,dv=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,fv=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,pv=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Av=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,mv=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,gv=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,bv=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,_v=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Ev=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,xv=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,vv=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,yv=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Sv=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Cv=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Iv=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Mv=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,wv=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Tv=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Rv=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Bv=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Dv=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Lv=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,Fv=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Pv=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Uv=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Nv=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Ov=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,kv=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Qv=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSEDEPTHBUF
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSEDEPTHBUF
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare , distribution.x );
		#endif
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,Gv=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Hv=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,zv=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Vv=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Wv=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,qv=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Xv=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,$v=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,jv=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Yv=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Kv=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Jv=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Zv=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,ey=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,ty=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,ny=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,iy=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const sy=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,ry=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ay=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,oy=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cy=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,ly=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,hy=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,uy=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSEDEPTHBUF
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,dy=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,fy=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,py=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Ay=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,my=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,gy=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,by=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,_y=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Ey=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,xy=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,vy=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,yy=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Sy=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Cy=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Iy=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,My=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,wy=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Ty=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Ry=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,By=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Dy=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Ly=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Fy=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Py=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Uy=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Ny=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Ve={alphahash_fragment:rx,alphahash_pars_fragment:ax,alphamap_fragment:ox,alphamap_pars_fragment:cx,alphatest_fragment:lx,alphatest_pars_fragment:hx,aomap_fragment:ux,aomap_pars_fragment:dx,batching_pars_vertex:fx,batching_vertex:px,begin_vertex:Ax,beginnormal_vertex:mx,bsdfs:gx,iridescence_fragment:bx,bumpmap_pars_fragment:_x,clipping_planes_fragment:Ex,clipping_planes_pars_fragment:xx,clipping_planes_pars_vertex:vx,clipping_planes_vertex:yx,color_fragment:Sx,color_pars_fragment:Cx,color_pars_vertex:Ix,color_vertex:Mx,common:wx,cube_uv_reflection_fragment:Tx,defaultnormal_vertex:Rx,displacementmap_pars_vertex:Bx,displacementmap_vertex:Dx,emissivemap_fragment:Lx,emissivemap_pars_fragment:Fx,colorspace_fragment:Px,colorspace_pars_fragment:Ux,envmap_fragment:Nx,envmap_common_pars_fragment:Ox,envmap_pars_fragment:kx,envmap_pars_vertex:Qx,envmap_physical_pars_fragment:Kx,envmap_vertex:Gx,fog_vertex:Hx,fog_pars_vertex:zx,fog_fragment:Vx,fog_pars_fragment:Wx,gradientmap_pars_fragment:qx,lightmap_pars_fragment:Xx,lights_lambert_fragment:$x,lights_lambert_pars_fragment:jx,lights_pars_begin:Yx,lights_toon_fragment:Jx,lights_toon_pars_fragment:Zx,lights_phong_fragment:ev,lights_phong_pars_fragment:tv,lights_physical_fragment:nv,lights_physical_pars_fragment:iv,lights_fragment_begin:sv,lights_fragment_maps:rv,lights_fragment_end:av,logdepthbuf_fragment:ov,logdepthbuf_pars_fragment:cv,logdepthbuf_pars_vertex:lv,logdepthbuf_vertex:hv,map_fragment:uv,map_pars_fragment:dv,map_particle_fragment:fv,map_particle_pars_fragment:pv,metalnessmap_fragment:Av,metalnessmap_pars_fragment:mv,morphinstance_vertex:gv,morphcolor_vertex:bv,morphnormal_vertex:_v,morphtarget_pars_vertex:Ev,morphtarget_vertex:xv,normal_fragment_begin:vv,normal_fragment_maps:yv,normal_pars_fragment:Sv,normal_pars_vertex:Cv,normal_vertex:Iv,normalmap_pars_fragment:Mv,clearcoat_normal_fragment_begin:wv,clearcoat_normal_fragment_maps:Tv,clearcoat_pars_fragment:Rv,iridescence_pars_fragment:Bv,opaque_fragment:Dv,packing:Lv,premultiplied_alpha_fragment:Fv,project_vertex:Pv,dithering_fragment:Uv,dithering_pars_fragment:Nv,roughnessmap_fragment:Ov,roughnessmap_pars_fragment:kv,shadowmap_pars_fragment:Qv,shadowmap_pars_vertex:Gv,shadowmap_vertex:Hv,shadowmask_pars_fragment:zv,skinbase_vertex:Vv,skinning_pars_vertex:Wv,skinning_vertex:qv,skinnormal_vertex:Xv,specularmap_fragment:$v,specularmap_pars_fragment:jv,tonemapping_fragment:Yv,tonemapping_pars_fragment:Kv,transmission_fragment:Jv,transmission_pars_fragment:Zv,uv_pars_fragment:ey,uv_pars_vertex:ty,uv_vertex:ny,worldpos_vertex:iy,background_vert:sy,background_frag:ry,backgroundCube_vert:ay,backgroundCube_frag:oy,cube_vert:cy,cube_frag:ly,depth_vert:hy,depth_frag:uy,distanceRGBA_vert:dy,distanceRGBA_frag:fy,equirect_vert:py,equirect_frag:Ay,linedashed_vert:my,linedashed_frag:gy,meshbasic_vert:by,meshbasic_frag:_y,meshlambert_vert:Ey,meshlambert_frag:xy,meshmatcap_vert:vy,meshmatcap_frag:yy,meshnormal_vert:Sy,meshnormal_frag:Cy,meshphong_vert:Iy,meshphong_frag:My,meshphysical_vert:wy,meshphysical_frag:Ty,meshtoon_vert:Ry,meshtoon_frag:By,points_vert:Dy,points_frag:Ly,shadow_vert:Fy,shadow_frag:Py,sprite_vert:Uy,sprite_frag:Ny},le={common:{diffuse:{value:new Me(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Qe},alphaMap:{value:null},alphaMapTransform:{value:new Qe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Qe}},envmap:{envMap:{value:null},envMapRotation:{value:new Qe},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Qe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Qe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Qe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Qe},normalScale:{value:new ke(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Qe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Qe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Qe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Qe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Me(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Me(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Qe},alphaTest:{value:0},uvTransform:{value:new Qe}},sprite:{diffuse:{value:new Me(16777215)},opacity:{value:1},center:{value:new ke(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Qe},alphaMap:{value:null},alphaMapTransform:{value:new Qe},alphaTest:{value:0}}},ei={basic:{uniforms:rn([le.common,le.specularmap,le.envmap,le.aomap,le.lightmap,le.fog]),vertexShader:Ve.meshbasic_vert,fragmentShader:Ve.meshbasic_frag},lambert:{uniforms:rn([le.common,le.specularmap,le.envmap,le.aomap,le.lightmap,le.emissivemap,le.bumpmap,le.normalmap,le.displacementmap,le.fog,le.lights,{emissive:{value:new Me(0)}}]),vertexShader:Ve.meshlambert_vert,fragmentShader:Ve.meshlambert_frag},phong:{uniforms:rn([le.common,le.specularmap,le.envmap,le.aomap,le.lightmap,le.emissivemap,le.bumpmap,le.normalmap,le.displacementmap,le.fog,le.lights,{emissive:{value:new Me(0)},specular:{value:new Me(1118481)},shininess:{value:30}}]),vertexShader:Ve.meshphong_vert,fragmentShader:Ve.meshphong_frag},standard:{uniforms:rn([le.common,le.envmap,le.aomap,le.lightmap,le.emissivemap,le.bumpmap,le.normalmap,le.displacementmap,le.roughnessmap,le.metalnessmap,le.fog,le.lights,{emissive:{value:new Me(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ve.meshphysical_vert,fragmentShader:Ve.meshphysical_frag},toon:{uniforms:rn([le.common,le.aomap,le.lightmap,le.emissivemap,le.bumpmap,le.normalmap,le.displacementmap,le.gradientmap,le.fog,le.lights,{emissive:{value:new Me(0)}}]),vertexShader:Ve.meshtoon_vert,fragmentShader:Ve.meshtoon_frag},matcap:{uniforms:rn([le.common,le.bumpmap,le.normalmap,le.displacementmap,le.fog,{matcap:{value:null}}]),vertexShader:Ve.meshmatcap_vert,fragmentShader:Ve.meshmatcap_frag},points:{uniforms:rn([le.points,le.fog]),vertexShader:Ve.points_vert,fragmentShader:Ve.points_frag},dashed:{uniforms:rn([le.common,le.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ve.linedashed_vert,fragmentShader:Ve.linedashed_frag},depth:{uniforms:rn([le.common,le.displacementmap]),vertexShader:Ve.depth_vert,fragmentShader:Ve.depth_frag},normal:{uniforms:rn([le.common,le.bumpmap,le.normalmap,le.displacementmap,{opacity:{value:1}}]),vertexShader:Ve.meshnormal_vert,fragmentShader:Ve.meshnormal_frag},sprite:{uniforms:rn([le.sprite,le.fog]),vertexShader:Ve.sprite_vert,fragmentShader:Ve.sprite_frag},background:{uniforms:{uvTransform:{value:new Qe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ve.background_vert,fragmentShader:Ve.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Qe}},vertexShader:Ve.backgroundCube_vert,fragmentShader:Ve.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ve.cube_vert,fragmentShader:Ve.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ve.equirect_vert,fragmentShader:Ve.equirect_frag},distanceRGBA:{uniforms:rn([le.common,le.displacementmap,{referencePosition:{value:new B},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ve.distanceRGBA_vert,fragmentShader:Ve.distanceRGBA_frag},shadow:{uniforms:rn([le.lights,le.fog,{color:{value:new Me(0)},opacity:{value:1}}]),vertexShader:Ve.shadow_vert,fragmentShader:Ve.shadow_frag}};ei.physical={uniforms:rn([ei.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Qe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Qe},clearcoatNormalScale:{value:new ke(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Qe},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Qe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Qe},sheen:{value:0},sheenColor:{value:new Me(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Qe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Qe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Qe},transmissionSamplerSize:{value:new ke},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Qe},attenuationDistance:{value:0},attenuationColor:{value:new Me(0)},specularColor:{value:new Me(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Qe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Qe},anisotropyVector:{value:new ke},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Qe}}]),vertexShader:Ve.meshphysical_vert,fragmentShader:Ve.meshphysical_frag};const zo={r:0,b:0,g:0},ls=new Un,Oy=new Ne;function ky(r,e,t,n,i,s,a){const o=new Me(0);let c=s===!0?0:1,l,u,h=null,d=0,f=null;function A(_){let b=_.isScene===!0?_.background:null;return b&&b.isTexture&&(b=(_.backgroundBlurriness>0?t:e).get(b)),b}function g(_){let b=!1;const x=A(_);x===null?p(o,c):x&&x.isColor&&(p(x,1),b=!0);const I=r.xr.getEnvironmentBlendMode();I==="additive"?n.buffers.color.setClear(0,0,0,1,a):I==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(r.autoClear||b)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),r.clear(r.autoClearColor,r.autoClearDepth,r.autoClearStencil))}function m(_,b){const x=A(b);x&&(x.isCubeTexture||x.mapping===el)?(u===void 0&&(u=new dt(new Li(1,1,1),new In({name:"BackgroundCubeMaterial",uniforms:Wr(ei.backgroundCube.uniforms),vertexShader:ei.backgroundCube.vertexShader,fragmentShader:ei.backgroundCube.fragmentShader,side:jt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(I,M,w){this.matrixWorld.copyPosition(w.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(u)),ls.copy(b.backgroundRotation),ls.x*=-1,ls.y*=-1,ls.z*=-1,x.isCubeTexture&&x.isRenderTargetTexture===!1&&(ls.y*=-1,ls.z*=-1),u.material.uniforms.envMap.value=x,u.material.uniforms.flipEnvMap.value=x.isCubeTexture&&x.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=b.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(Oy.makeRotationFromEuler(ls)),u.material.toneMapped=Je.getTransfer(x.colorSpace)!==ut,(h!==x||d!==x.version||f!==r.toneMapping)&&(u.material.needsUpdate=!0,h=x,d=x.version,f=r.toneMapping),u.layers.enableAll(),_.unshift(u,u.geometry,u.material,0,0,null)):x&&x.isTexture&&(l===void 0&&(l=new dt(new Fi(2,2),new In({name:"BackgroundMaterial",uniforms:Wr(ei.background.uniforms),vertexShader:ei.background.vertexShader,fragmentShader:ei.background.fragmentShader,side:Xn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=x,l.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,l.material.toneMapped=Je.getTransfer(x.colorSpace)!==ut,x.matrixAutoUpdate===!0&&x.updateMatrix(),l.material.uniforms.uvTransform.value.copy(x.matrix),(h!==x||d!==x.version||f!==r.toneMapping)&&(l.material.needsUpdate=!0,h=x,d=x.version,f=r.toneMapping),l.layers.enableAll(),_.unshift(l,l.geometry,l.material,0,0,null))}function p(_,b){_.getRGB(zo,Mg(r)),n.buffers.color.setClear(zo.r,zo.g,zo.b,b,a)}function E(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return o},setClearColor:function(_,b=1){o.set(_),c=b,p(o,c)},getClearAlpha:function(){return c},setClearAlpha:function(_){c=_,p(o,c)},render:g,addToRenderList:m,dispose:E}}function Qy(r,e){const t=r.getParameter(r.MAX_VERTEX_ATTRIBS),n={},i=d(null);let s=i,a=!1;function o(y,T,k,U,F){let H=!1;const O=h(U,k,T);s!==O&&(s=O,l(s.object)),H=f(y,U,k,F),H&&A(y,U,k,F),F!==null&&e.update(F,r.ELEMENT_ARRAY_BUFFER),(H||a)&&(a=!1,b(y,T,k,U),F!==null&&r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,e.get(F).buffer))}function c(){return r.createVertexArray()}function l(y){return r.bindVertexArray(y)}function u(y){return r.deleteVertexArray(y)}function h(y,T,k){const U=k.wireframe===!0;let F=n[y.id];F===void 0&&(F={},n[y.id]=F);let H=F[T.id];H===void 0&&(H={},F[T.id]=H);let O=H[U];return O===void 0&&(O=d(c()),H[U]=O),O}function d(y){const T=[],k=[],U=[];for(let F=0;F<t;F++)T[F]=0,k[F]=0,U[F]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:T,enabledAttributes:k,attributeDivisors:U,object:y,attributes:{},index:null}}function f(y,T,k,U){const F=s.attributes,H=T.attributes;let O=0;const W=k.getAttributes();for(const Q in W)if(W[Q].location>=0){const Z=F[Q];let re=H[Q];if(re===void 0&&(Q==="instanceMatrix"&&y.instanceMatrix&&(re=y.instanceMatrix),Q==="instanceColor"&&y.instanceColor&&(re=y.instanceColor)),Z===void 0||Z.attribute!==re||re&&Z.data!==re.data)return!0;O++}return s.attributesNum!==O||s.index!==U}function A(y,T,k,U){const F={},H=T.attributes;let O=0;const W=k.getAttributes();for(const Q in W)if(W[Q].location>=0){let Z=H[Q];Z===void 0&&(Q==="instanceMatrix"&&y.instanceMatrix&&(Z=y.instanceMatrix),Q==="instanceColor"&&y.instanceColor&&(Z=y.instanceColor));const re={};re.attribute=Z,Z&&Z.data&&(re.data=Z.data),F[Q]=re,O++}s.attributes=F,s.attributesNum=O,s.index=U}function g(){const y=s.newAttributes;for(let T=0,k=y.length;T<k;T++)y[T]=0}function m(y){p(y,0)}function p(y,T){const k=s.newAttributes,U=s.enabledAttributes,F=s.attributeDivisors;k[y]=1,U[y]===0&&(r.enableVertexAttribArray(y),U[y]=1),F[y]!==T&&(r.vertexAttribDivisor(y,T),F[y]=T)}function E(){const y=s.newAttributes,T=s.enabledAttributes;for(let k=0,U=T.length;k<U;k++)T[k]!==y[k]&&(r.disableVertexAttribArray(k),T[k]=0)}function _(y,T,k,U,F,H,O){O===!0?r.vertexAttribIPointer(y,T,k,F,H):r.vertexAttribPointer(y,T,k,U,F,H)}function b(y,T,k,U){g();const F=U.attributes,H=k.getAttributes(),O=T.defaultAttributeValues;for(const W in H){const Q=H[W];if(Q.location>=0){let Y=F[W];if(Y===void 0&&(W==="instanceMatrix"&&y.instanceMatrix&&(Y=y.instanceMatrix),W==="instanceColor"&&y.instanceColor&&(Y=y.instanceColor)),Y!==void 0){const Z=Y.normalized,re=Y.itemSize,fe=e.get(Y);if(fe===void 0)continue;const Be=fe.buffer,Ge=fe.type,q=fe.bytesPerElement,oe=Ge===r.INT||Ge===r.UNSIGNED_INT||Y.gpuType===tl;if(Y.isInterleavedBufferAttribute){const se=Y.data,Ce=se.stride,we=Y.offset;if(se.isInstancedInterleavedBuffer){for(let Oe=0;Oe<Q.locationSize;Oe++)p(Q.location+Oe,se.meshPerAttribute);y.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=se.meshPerAttribute*se.count)}else for(let Oe=0;Oe<Q.locationSize;Oe++)m(Q.location+Oe);r.bindBuffer(r.ARRAY_BUFFER,Be);for(let Oe=0;Oe<Q.locationSize;Oe++)_(Q.location+Oe,re/Q.locationSize,Ge,Z,Ce*q,(we+re/Q.locationSize*Oe)*q,oe)}else{if(Y.isInstancedBufferAttribute){for(let se=0;se<Q.locationSize;se++)p(Q.location+se,Y.meshPerAttribute);y.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=Y.meshPerAttribute*Y.count)}else for(let se=0;se<Q.locationSize;se++)m(Q.location+se);r.bindBuffer(r.ARRAY_BUFFER,Be);for(let se=0;se<Q.locationSize;se++)_(Q.location+se,re/Q.locationSize,Ge,Z,re*q,re/Q.locationSize*se*q,oe)}}else if(O!==void 0){const Z=O[W];if(Z!==void 0)switch(Z.length){case 2:r.vertexAttrib2fv(Q.location,Z);break;case 3:r.vertexAttrib3fv(Q.location,Z);break;case 4:r.vertexAttrib4fv(Q.location,Z);break;default:r.vertexAttrib1fv(Q.location,Z)}}}}E()}function x(){w();for(const y in n){const T=n[y];for(const k in T){const U=T[k];for(const F in U)u(U[F].object),delete U[F];delete T[k]}delete n[y]}}function I(y){if(n[y.id]===void 0)return;const T=n[y.id];for(const k in T){const U=T[k];for(const F in U)u(U[F].object),delete U[F];delete T[k]}delete n[y.id]}function M(y){for(const T in n){const k=n[T];if(k[y.id]===void 0)continue;const U=k[y.id];for(const F in U)u(U[F].object),delete U[F];delete k[y.id]}}function w(){v(),a=!0,s!==i&&(s=i,l(s.object))}function v(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:o,reset:w,resetDefaultState:v,dispose:x,releaseStatesOfGeometry:I,releaseStatesOfProgram:M,initAttributes:g,enableAttribute:m,disableUnusedAttributes:E}}function Gy(r,e,t){let n;function i(l){n=l}function s(l,u){r.drawArrays(n,l,u),t.update(u,n,1)}function a(l,u,h){h!==0&&(r.drawArraysInstanced(n,l,u,h),t.update(u,n,h))}function o(l,u,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,u,0,h);let f=0;for(let A=0;A<h;A++)f+=u[A];t.update(f,n,1)}function c(l,u,h,d){if(h===0)return;const f=e.get("WEBGL_multi_draw");if(f===null)for(let A=0;A<l.length;A++)a(l[A],u[A],d[A]);else{f.multiDrawArraysInstancedWEBGL(n,l,0,u,0,d,0,h);let A=0;for(let g=0;g<h;g++)A+=u[g]*d[g];t.update(A,n,1)}}this.setMode=i,this.render=s,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=c}function Hy(r,e,t,n){let i;function s(){if(i!==void 0)return i;if(e.has("EXT_texture_filter_anisotropic")===!0){const M=e.get("EXT_texture_filter_anisotropic");i=r.getParameter(M.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function a(M){return!(M!==xt&&n.convert(M)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(M){const w=M===Nt&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(M!==It&&n.convert(M)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_TYPE)&&M!==Lt&&!w)}function c(M){if(M==="highp"){if(r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.HIGH_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.HIGH_FLOAT).precision>0)return"highp";M="mediump"}return M==="mediump"&&r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.MEDIUM_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=t.precision!==void 0?t.precision:"highp";const u=c(l);u!==l&&(console.warn("THREE.WebGLRenderer:",l,"not supported, using",u,"instead."),l=u);const h=t.logarithmicDepthBuffer===!0,d=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),f=r.getParameter(r.MAX_TEXTURE_IMAGE_UNITS),A=r.getParameter(r.MAX_VERTEX_TEXTURE_IMAGE_UNITS),g=r.getParameter(r.MAX_TEXTURE_SIZE),m=r.getParameter(r.MAX_CUBE_MAP_TEXTURE_SIZE),p=r.getParameter(r.MAX_VERTEX_ATTRIBS),E=r.getParameter(r.MAX_VERTEX_UNIFORM_VECTORS),_=r.getParameter(r.MAX_VARYING_VECTORS),b=r.getParameter(r.MAX_FRAGMENT_UNIFORM_VECTORS),x=A>0,I=r.getParameter(r.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:c,textureFormatReadable:a,textureTypeReadable:o,precision:l,logarithmicDepthBuffer:h,reversedDepthBuffer:d,maxTextures:f,maxVertexTextures:A,maxTextureSize:g,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:E,maxVaryings:_,maxFragmentUniforms:b,vertexTextures:x,maxSamples:I}}function zy(r){const e=this;let t=null,n=0,i=!1,s=!1;const a=new bs,o=new Qe,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(h,d){const f=h.length!==0||d||n!==0||i;return i=d,n=h.length,f},this.beginShadows=function(){s=!0,u(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(h,d){t=u(h,d,0)},this.setState=function(h,d,f){const A=h.clippingPlanes,g=h.clipIntersection,m=h.clipShadows,p=r.get(h);if(!i||A===null||A.length===0||s&&!m)s?u(null):l();else{const E=s?0:n,_=E*4;let b=p.clippingState||null;c.value=b,b=u(A,d,_,f);for(let x=0;x!==_;++x)b[x]=t[x];p.clippingState=b,this.numIntersection=g?this.numPlanes:0,this.numPlanes+=E}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(h,d,f,A){const g=h!==null?h.length:0;let m=null;if(g!==0){if(m=c.value,A!==!0||m===null){const p=f+g*4,E=d.matrixWorldInverse;o.getNormalMatrix(E),(m===null||m.length<p)&&(m=new Float32Array(p));for(let _=0,b=f;_!==g;++_,b+=4)a.copy(h[_]).applyMatrix4(E,o),a.normal.toArray(m,b),m[b+3]=a.constant}c.value=m,c.needsUpdate=!0}return e.numPlanes=g,e.numIntersection=0,m}}function Vy(r){let e=new WeakMap;function t(a,o){return o===Bc?a.mapping=Us:o===vu&&(a.mapping=Gr),a}function n(a){if(a&&a.isTexture){const o=a.mapping;if(o===Bc||o===vu)if(e.has(a)){const c=e.get(a).texture;return t(c,a.mapping)}else{const c=a.image;if(c&&c.height>0){const l=new vd(c.height);return l.fromEquirectangularTexture(r,a),e.set(a,l),a.addEventListener("dispose",i),t(l.texture,a.mapping)}else return null}}return a}function i(a){const o=a.target;o.removeEventListener("dispose",i);const c=e.get(o);c!==void 0&&(e.delete(o),c.dispose())}function s(){e=new WeakMap}return{get:n,dispose:s}}const Ir=4,Hf=[.125,.215,.35,.446,.526,.582],Ms=20,Gl=new ea,zf=new Me;let Hl=null,zl=0,Vl=0,Wl=!1;const _s=(1+Math.sqrt(5))/2,rr=1/_s,Vf=[new B(-_s,rr,0),new B(_s,rr,0),new B(-rr,0,_s),new B(rr,0,_s),new B(0,_s,-rr),new B(0,_s,rr),new B(-1,1,-1),new B(1,1,-1),new B(-1,1,1),new B(1,1,1)],Wy=new B;class Wf{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,i=100,s={}){const{size:a=256,position:o=Wy}=s;Hl=this._renderer.getRenderTarget(),zl=this._renderer.getActiveCubeFace(),Vl=this._renderer.getActiveMipmapLevel(),Wl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);const c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(e,n,i,c,o),t>0&&this._blur(c,0,0,t),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=$f(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Xf(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Hl,zl,Vl),this._renderer.xr.enabled=Wl,e.scissorTest=!1,Vo(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Us||e.mapping===Gr?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Hl=this._renderer.getRenderTarget(),zl=this._renderer.getActiveCubeFace(),Vl=this._renderer.getActiveMipmapLevel(),Wl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Ze,minFilter:Ze,generateMipmaps:!1,type:Nt,format:xt,colorSpace:gt,depthBuffer:!1},i=qf(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=qf(e,t,n);const{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=qy(s)),this._blurMaterial=Xy(s,e,t)}return i}_compileMaterial(e){const t=new dt(this._lodPlanes[0],e);this._renderer.compile(t,Gl)}_sceneToCubeUV(e,t,n,i,s){const c=new $t(90,1,t,n),l=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],h=this._renderer,d=h.autoClear,f=h.toneMapping;h.getClearColor(zf),h.toneMapping=ai,h.autoClear=!1,h.state.buffers.depth.getReversed()&&(h.setRenderTarget(i),h.clearDepth(),h.setRenderTarget(null));const g=new Fn({name:"PMREM.Background",side:jt,depthWrite:!1,depthTest:!1}),m=new dt(new Li,g);let p=!1;const E=e.background;E?E.isColor&&(g.color.copy(E),e.background=null,p=!0):(g.color.copy(zf),p=!0);for(let _=0;_<6;_++){const b=_%3;b===0?(c.up.set(0,l[_],0),c.position.set(s.x,s.y,s.z),c.lookAt(s.x+u[_],s.y,s.z)):b===1?(c.up.set(0,0,l[_]),c.position.set(s.x,s.y,s.z),c.lookAt(s.x,s.y+u[_],s.z)):(c.up.set(0,l[_],0),c.position.set(s.x,s.y,s.z),c.lookAt(s.x,s.y,s.z+u[_]));const x=this._cubeSize;Vo(i,b*x,_>2?x:0,x,x),h.setRenderTarget(i),p&&h.render(m,c),h.render(e,c)}m.geometry.dispose(),m.material.dispose(),h.toneMapping=f,h.autoClear=d,e.background=E}_textureToCubeUV(e,t){const n=this._renderer,i=e.mapping===Us||e.mapping===Gr;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=$f()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Xf());const s=i?this._cubemapMaterial:this._equirectMaterial,a=new dt(this._lodPlanes[0],s),o=s.uniforms;o.envMap.value=e;const c=this._cubeSize;Vo(t,0,0,3*c,2*c),n.setRenderTarget(t),n.render(a,Gl)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const i=this._lodPlanes.length;for(let s=1;s<i;s++){const a=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),o=Vf[(i-s-1)%Vf.length];this._blur(e,s-1,s,a,o)}t.autoClear=n}_blur(e,t,n,i,s){const a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,i,"latitudinal",s),this._halfBlur(a,e,n,n,i,"longitudinal",s)}_halfBlur(e,t,n,i,s,a,o){const c=this._renderer,l=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const u=3,h=new dt(this._lodPlanes[i],l),d=l.uniforms,f=this._sizeLods[n]-1,A=isFinite(s)?Math.PI/(2*f):2*Math.PI/(2*Ms-1),g=s/A,m=isFinite(s)?1+Math.floor(u*g):Ms;m>Ms&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Ms}`);const p=[];let E=0;for(let M=0;M<Ms;++M){const w=M/g,v=Math.exp(-w*w/2);p.push(v),M===0?E+=v:M<m&&(E+=2*v)}for(let M=0;M<p.length;M++)p[M]=p[M]/E;d.envMap.value=e.texture,d.samples.value=m,d.weights.value=p,d.latitudinal.value=a==="latitudinal",o&&(d.poleAxis.value=o);const{_lodMax:_}=this;d.dTheta.value=A,d.mipInt.value=_-n;const b=this._sizeLods[i],x=3*b*(i>_-Ir?i-_+Ir:0),I=4*(this._cubeSize-b);Vo(t,x,I,3*b,2*b),c.setRenderTarget(t),c.render(h,Gl)}}function qy(r){const e=[],t=[],n=[];let i=r;const s=r-Ir+1+Hf.length;for(let a=0;a<s;a++){const o=Math.pow(2,i);t.push(o);let c=1/o;a>r-Ir?c=Hf[a-r+Ir-1]:a===0&&(c=0),n.push(c);const l=1/(o-2),u=-l,h=1+l,d=[u,u,h,u,h,h,u,u,h,h,u,h],f=6,A=6,g=3,m=2,p=1,E=new Float32Array(g*A*f),_=new Float32Array(m*A*f),b=new Float32Array(p*A*f);for(let I=0;I<f;I++){const M=I%3*2/3-1,w=I>2?0:-1,v=[M,w,0,M+2/3,w,0,M+2/3,w+1,0,M,w,0,M+2/3,w+1,0,M,w+1,0];E.set(v,g*A*I),_.set(d,m*A*I);const y=[I,I,I,I,I,I];b.set(y,p*A*I)}const x=new An;x.setAttribute("position",new yt(E,g)),x.setAttribute("uv",new yt(_,m)),x.setAttribute("faceIndex",new yt(b,p)),e.push(x),i>Ir&&i--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function qf(r,e,t){const n=new Pn(r,e,t);return n.texture.mapping=el,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Vo(r,e,t,n,i){r.viewport.set(e,t,n,i),r.scissor.set(e,t,n,i)}function Xy(r,e,t){const n=new Float32Array(Ms),i=new B(0,1,0);return new In({name:"SphericalGaussianBlur",defines:{n:Ms,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${r}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:Rd(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:ri,depthTest:!1,depthWrite:!1})}function Xf(){return new In({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Rd(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:ri,depthTest:!1,depthWrite:!1})}function $f(){return new In({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Rd(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:ri,depthTest:!1,depthWrite:!1})}function Rd(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function $y(r){let e=new WeakMap,t=null;function n(o){if(o&&o.isTexture){const c=o.mapping,l=c===Bc||c===vu,u=c===Us||c===Gr;if(l||u){let h=e.get(o);const d=h!==void 0?h.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==d)return t===null&&(t=new Wf(r)),h=l?t.fromEquirectangular(o,h):t.fromCubemap(o,h),h.texture.pmremVersion=o.pmremVersion,e.set(o,h),h.texture;if(h!==void 0)return h.texture;{const f=o.image;return l&&f&&f.height>0||u&&f&&i(f)?(t===null&&(t=new Wf(r)),h=l?t.fromEquirectangular(o):t.fromCubemap(o),h.texture.pmremVersion=o.pmremVersion,e.set(o,h),o.addEventListener("dispose",s),h.texture):null}}}return o}function i(o){let c=0;const l=6;for(let u=0;u<l;u++)o[u]!==void 0&&c++;return c===l}function s(o){const c=o.target;c.removeEventListener("dispose",s);const l=e.get(c);l!==void 0&&(e.delete(c),l.dispose())}function a(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:a}}function jy(r){const e={};function t(n){if(e[n]!==void 0)return e[n];let i;switch(n){case"WEBGL_depth_texture":i=r.getExtension("WEBGL_depth_texture")||r.getExtension("MOZ_WEBGL_depth_texture")||r.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":i=r.getExtension("EXT_texture_filter_anisotropic")||r.getExtension("MOZ_EXT_texture_filter_anisotropic")||r.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":i=r.getExtension("WEBGL_compressed_texture_s3tc")||r.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":i=r.getExtension("WEBGL_compressed_texture_pvrtc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:i=r.getExtension(n)}return e[n]=i,i}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const i=t(n);return i===null&&Fr("THREE.WebGLRenderer: "+n+" extension not supported."),i}}}function Yy(r,e,t,n){const i={},s=new WeakMap;function a(h){const d=h.target;d.index!==null&&e.remove(d.index);for(const A in d.attributes)e.remove(d.attributes[A]);d.removeEventListener("dispose",a),delete i[d.id];const f=s.get(d);f&&(e.remove(f),s.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function o(h,d){return i[d.id]===!0||(d.addEventListener("dispose",a),i[d.id]=!0,t.memory.geometries++),d}function c(h){const d=h.attributes;for(const f in d)e.update(d[f],r.ARRAY_BUFFER)}function l(h){const d=[],f=h.index,A=h.attributes.position;let g=0;if(f!==null){const E=f.array;g=f.version;for(let _=0,b=E.length;_<b;_+=3){const x=E[_+0],I=E[_+1],M=E[_+2];d.push(x,I,I,M,M,x)}}else if(A!==void 0){const E=A.array;g=A.version;for(let _=0,b=E.length/3-1;_<b;_+=3){const x=_+0,I=_+1,M=_+2;d.push(x,I,I,M,M,x)}}else return;const m=new(Eg(d)?Ig:Cg)(d,1);m.version=g;const p=s.get(h);p&&e.remove(p),s.set(h,m)}function u(h){const d=s.get(h);if(d){const f=h.index;f!==null&&d.version<f.version&&l(h)}else l(h);return s.get(h)}return{get:o,update:c,getWireframeAttribute:u}}function Ky(r,e,t){let n;function i(d){n=d}let s,a;function o(d){s=d.type,a=d.bytesPerElement}function c(d,f){r.drawElements(n,f,s,d*a),t.update(f,n,1)}function l(d,f,A){A!==0&&(r.drawElementsInstanced(n,f,s,d*a,A),t.update(f,n,A))}function u(d,f,A){if(A===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,f,0,s,d,0,A);let m=0;for(let p=0;p<A;p++)m+=f[p];t.update(m,n,1)}function h(d,f,A,g){if(A===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<d.length;p++)l(d[p]/a,f[p],g[p]);else{m.multiDrawElementsInstancedWEBGL(n,f,0,s,d,0,g,0,A);let p=0;for(let E=0;E<A;E++)p+=f[E]*g[E];t.update(p,n,1)}}this.setMode=i,this.setIndex=o,this.render=c,this.renderInstances=l,this.renderMultiDraw=u,this.renderMultiDrawInstances=h}function Jy(r){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(s,a,o){switch(t.calls++,a){case r.TRIANGLES:t.triangles+=o*(s/3);break;case r.LINES:t.lines+=o*(s/2);break;case r.LINE_STRIP:t.lines+=o*(s-1);break;case r.LINE_LOOP:t.lines+=o*s;break;case r.POINTS:t.points+=o*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function i(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:i,update:n}}function Zy(r,e,t){const n=new WeakMap,i=new it;function s(a,o,c){const l=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,h=u!==void 0?u.length:0;let d=n.get(o);if(d===void 0||d.count!==h){let v=function(){M.dispose(),n.delete(o),o.removeEventListener("dispose",v)};d!==void 0&&d.texture.dispose();const f=o.morphAttributes.position!==void 0,A=o.morphAttributes.normal!==void 0,g=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],p=o.morphAttributes.normal||[],E=o.morphAttributes.color||[];let _=0;f===!0&&(_=1),A===!0&&(_=2),g===!0&&(_=3);let b=o.attributes.position.count*_,x=1;b>e.maxTextureSize&&(x=Math.ceil(b/e.maxTextureSize),b=e.maxTextureSize);const I=new Float32Array(b*x*4*h),M=new vg(I,b,x,h);M.type=Lt,M.needsUpdate=!0;const w=_*4;for(let y=0;y<h;y++){const T=m[y],k=p[y],U=E[y],F=b*x*4*y;for(let H=0;H<T.count;H++){const O=H*w;f===!0&&(i.fromBufferAttribute(T,H),I[F+O+0]=i.x,I[F+O+1]=i.y,I[F+O+2]=i.z,I[F+O+3]=0),A===!0&&(i.fromBufferAttribute(k,H),I[F+O+4]=i.x,I[F+O+5]=i.y,I[F+O+6]=i.z,I[F+O+7]=0),g===!0&&(i.fromBufferAttribute(U,H),I[F+O+8]=i.x,I[F+O+9]=i.y,I[F+O+10]=i.z,I[F+O+11]=U.itemSize===4?i.w:1)}}d={count:h,texture:M,size:new ke(b,x)},n.set(o,d),o.addEventListener("dispose",v)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)c.getUniforms().setValue(r,"morphTexture",a.morphTexture,t);else{let f=0;for(let g=0;g<l.length;g++)f+=l[g];const A=o.morphTargetsRelative?1:1-f;c.getUniforms().setValue(r,"morphTargetBaseInfluence",A),c.getUniforms().setValue(r,"morphTargetInfluences",l)}c.getUniforms().setValue(r,"morphTargetsTexture",d.texture,t),c.getUniforms().setValue(r,"morphTargetsTextureSize",d.size)}return{update:s}}function eS(r,e,t,n){let i=new WeakMap;function s(c){const l=n.render.frame,u=c.geometry,h=e.get(c,u);if(i.get(h)!==l&&(e.update(h),i.set(h,l)),c.isInstancedMesh&&(c.hasEventListener("dispose",o)===!1&&c.addEventListener("dispose",o),i.get(c)!==l&&(t.update(c.instanceMatrix,r.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,r.ARRAY_BUFFER),i.set(c,l))),c.isSkinnedMesh){const d=c.skeleton;i.get(d)!==l&&(d.update(),i.set(d,l))}return h}function a(){i=new WeakMap}function o(c){const l=c.target;l.removeEventListener("dispose",o),t.remove(l.instanceMatrix),l.instanceColor!==null&&t.remove(l.instanceColor)}return{update:s,dispose:a}}const zg=new vt,jf=new Lg(1,1),Vg=new vg,Wg=new yg,qg=new Tg,Yf=[],Kf=[],Jf=new Float32Array(16),Zf=new Float32Array(9),ep=new Float32Array(4);function ta(r,e,t){const n=r[0];if(n<=0||n>0)return r;const i=e*t;let s=Yf[i];if(s===void 0&&(s=new Float32Array(i),Yf[i]=s),e!==0){n.toArray(s,0);for(let a=1,o=0;a!==e;++a)o+=t,r[a].toArray(s,o)}return s}function kt(r,e){if(r.length!==e.length)return!1;for(let t=0,n=r.length;t<n;t++)if(r[t]!==e[t])return!1;return!0}function Qt(r,e){for(let t=0,n=e.length;t<n;t++)r[t]=e[t]}function sl(r,e){let t=Kf[e];t===void 0&&(t=new Int32Array(e),Kf[e]=t);for(let n=0;n!==e;++n)t[n]=r.allocateTextureUnit();return t}function tS(r,e){const t=this.cache;t[0]!==e&&(r.uniform1f(this.addr,e),t[0]=e)}function nS(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(kt(t,e))return;r.uniform2fv(this.addr,e),Qt(t,e)}}function iS(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(r.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(kt(t,e))return;r.uniform3fv(this.addr,e),Qt(t,e)}}function sS(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(kt(t,e))return;r.uniform4fv(this.addr,e),Qt(t,e)}}function rS(r,e){const t=this.cache,n=e.elements;if(n===void 0){if(kt(t,e))return;r.uniformMatrix2fv(this.addr,!1,e),Qt(t,e)}else{if(kt(t,n))return;ep.set(n),r.uniformMatrix2fv(this.addr,!1,ep),Qt(t,n)}}function aS(r,e){const t=this.cache,n=e.elements;if(n===void 0){if(kt(t,e))return;r.uniformMatrix3fv(this.addr,!1,e),Qt(t,e)}else{if(kt(t,n))return;Zf.set(n),r.uniformMatrix3fv(this.addr,!1,Zf),Qt(t,n)}}function oS(r,e){const t=this.cache,n=e.elements;if(n===void 0){if(kt(t,e))return;r.uniformMatrix4fv(this.addr,!1,e),Qt(t,e)}else{if(kt(t,n))return;Jf.set(n),r.uniformMatrix4fv(this.addr,!1,Jf),Qt(t,n)}}function cS(r,e){const t=this.cache;t[0]!==e&&(r.uniform1i(this.addr,e),t[0]=e)}function lS(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(kt(t,e))return;r.uniform2iv(this.addr,e),Qt(t,e)}}function hS(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(kt(t,e))return;r.uniform3iv(this.addr,e),Qt(t,e)}}function uS(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(kt(t,e))return;r.uniform4iv(this.addr,e),Qt(t,e)}}function dS(r,e){const t=this.cache;t[0]!==e&&(r.uniform1ui(this.addr,e),t[0]=e)}function fS(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(kt(t,e))return;r.uniform2uiv(this.addr,e),Qt(t,e)}}function pS(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(kt(t,e))return;r.uniform3uiv(this.addr,e),Qt(t,e)}}function AS(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(kt(t,e))return;r.uniform4uiv(this.addr,e),Qt(t,e)}}function mS(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i);let s;this.type===r.SAMPLER_2D_SHADOW?(jf.compareFunction=_g,s=jf):s=zg,t.setTexture2D(e||s,i)}function gS(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTexture3D(e||Wg,i)}function bS(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTextureCube(e||qg,i)}function _S(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTexture2DArray(e||Vg,i)}function ES(r){switch(r){case 5126:return tS;case 35664:return nS;case 35665:return iS;case 35666:return sS;case 35674:return rS;case 35675:return aS;case 35676:return oS;case 5124:case 35670:return cS;case 35667:case 35671:return lS;case 35668:case 35672:return hS;case 35669:case 35673:return uS;case 5125:return dS;case 36294:return fS;case 36295:return pS;case 36296:return AS;case 35678:case 36198:case 36298:case 36306:case 35682:return mS;case 35679:case 36299:case 36307:return gS;case 35680:case 36300:case 36308:case 36293:return bS;case 36289:case 36303:case 36311:case 36292:return _S}}function xS(r,e){r.uniform1fv(this.addr,e)}function vS(r,e){const t=ta(e,this.size,2);r.uniform2fv(this.addr,t)}function yS(r,e){const t=ta(e,this.size,3);r.uniform3fv(this.addr,t)}function SS(r,e){const t=ta(e,this.size,4);r.uniform4fv(this.addr,t)}function CS(r,e){const t=ta(e,this.size,4);r.uniformMatrix2fv(this.addr,!1,t)}function IS(r,e){const t=ta(e,this.size,9);r.uniformMatrix3fv(this.addr,!1,t)}function MS(r,e){const t=ta(e,this.size,16);r.uniformMatrix4fv(this.addr,!1,t)}function wS(r,e){r.uniform1iv(this.addr,e)}function TS(r,e){r.uniform2iv(this.addr,e)}function RS(r,e){r.uniform3iv(this.addr,e)}function BS(r,e){r.uniform4iv(this.addr,e)}function DS(r,e){r.uniform1uiv(this.addr,e)}function LS(r,e){r.uniform2uiv(this.addr,e)}function FS(r,e){r.uniform3uiv(this.addr,e)}function PS(r,e){r.uniform4uiv(this.addr,e)}function US(r,e,t){const n=this.cache,i=e.length,s=sl(t,i);kt(n,s)||(r.uniform1iv(this.addr,s),Qt(n,s));for(let a=0;a!==i;++a)t.setTexture2D(e[a]||zg,s[a])}function NS(r,e,t){const n=this.cache,i=e.length,s=sl(t,i);kt(n,s)||(r.uniform1iv(this.addr,s),Qt(n,s));for(let a=0;a!==i;++a)t.setTexture3D(e[a]||Wg,s[a])}function OS(r,e,t){const n=this.cache,i=e.length,s=sl(t,i);kt(n,s)||(r.uniform1iv(this.addr,s),Qt(n,s));for(let a=0;a!==i;++a)t.setTextureCube(e[a]||qg,s[a])}function kS(r,e,t){const n=this.cache,i=e.length,s=sl(t,i);kt(n,s)||(r.uniform1iv(this.addr,s),Qt(n,s));for(let a=0;a!==i;++a)t.setTexture2DArray(e[a]||Vg,s[a])}function QS(r){switch(r){case 5126:return xS;case 35664:return vS;case 35665:return yS;case 35666:return SS;case 35674:return CS;case 35675:return IS;case 35676:return MS;case 5124:case 35670:return wS;case 35667:case 35671:return TS;case 35668:case 35672:return RS;case 35669:case 35673:return BS;case 5125:return DS;case 36294:return LS;case 36295:return FS;case 36296:return PS;case 35678:case 36198:case 36298:case 36306:case 35682:return US;case 35679:case 36299:case 36307:return NS;case 35680:case 36300:case 36308:case 36293:return OS;case 36289:case 36303:case 36311:case 36292:return kS}}class GS{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=ES(t.type)}}class HS{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=QS(t.type)}}class zS{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const i=this.seq;for(let s=0,a=i.length;s!==a;++s){const o=i[s];o.setValue(e,t[o.id],n)}}}const ql=/(\w+)(\])?(\[|\.)?/g;function tp(r,e){r.seq.push(e),r.map[e.id]=e}function VS(r,e,t){const n=r.name,i=n.length;for(ql.lastIndex=0;;){const s=ql.exec(n),a=ql.lastIndex;let o=s[1];const c=s[2]==="]",l=s[3];if(c&&(o=o|0),l===void 0||l==="["&&a+2===i){tp(t,l===void 0?new GS(o,r,e):new HS(o,r,e));break}else{let h=t.map[o];h===void 0&&(h=new zS(o),tp(t,h)),t=h}}}class vc{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let i=0;i<n;++i){const s=e.getActiveUniform(t,i),a=e.getUniformLocation(t,s.name);VS(s,a,this)}}setValue(e,t,n,i){const s=this.map[t];s!==void 0&&s.setValue(e,n,i)}setOptional(e,t,n){const i=t[n];i!==void 0&&this.setValue(e,n,i)}static upload(e,t,n,i){for(let s=0,a=t.length;s!==a;++s){const o=t[s],c=n[o.id];c.needsUpdate!==!1&&o.setValue(e,c.value,i)}}static seqWithValue(e,t){const n=[];for(let i=0,s=e.length;i!==s;++i){const a=e[i];a.id in t&&n.push(a)}return n}}function np(r,e,t){const n=r.createShader(e);return r.shaderSource(n,t),r.compileShader(n),n}const WS=37297;let qS=0;function XS(r,e){const t=r.split(`
`),n=[],i=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let a=i;a<s;a++){const o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}const ip=new Qe;function $S(r){Je._getMatrix(ip,Je.workingColorSpace,r);const e=`mat3( ${ip.elements.map(t=>t.toFixed(4))} )`;switch(Je.getTransfer(r)){case Oc:return[e,"LinearTransferOETF"];case ut:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",r),[e,"LinearTransferOETF"]}}function sp(r,e,t){const n=r.getShaderParameter(e,r.COMPILE_STATUS),s=(r.getShaderInfoLog(e)||"").trim();if(n&&s==="")return"";const a=/ERROR: 0:(\d+)/.exec(s);if(a){const o=parseInt(a[1]);return t.toUpperCase()+`

`+s+`

`+XS(r.getShaderSource(e),o)}else return s}function jS(r,e){const t=$S(e);return[`vec4 ${r}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function YS(r,e){let t;switch(e){case cg:t="Linear";break;case lg:t="Reinhard";break;case hg:t="Cineon";break;case ug:t="ACESFilmic";break;case dg:t="AgX";break;case Xa:t="Neutral";break;case a_:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+r+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Wo=new B;function KS(){Je.getLuminanceCoefficients(Wo);const r=Wo.x.toFixed(4),e=Wo.y.toFixed(4),t=Wo.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${r}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function JS(r){return[r.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",r.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Da).join(`
`)}function ZS(r){const e=[];for(const t in r){const n=r[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function eC(r,e){const t={},n=r.getProgramParameter(e,r.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){const s=r.getActiveAttrib(e,i),a=s.name;let o=1;s.type===r.FLOAT_MAT2&&(o=2),s.type===r.FLOAT_MAT3&&(o=3),s.type===r.FLOAT_MAT4&&(o=4),t[a]={type:s.type,location:r.getAttribLocation(e,a),locationSize:o}}return t}function Da(r){return r!==""}function rp(r,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return r.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function ap(r,e){return r.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const tC=/^[ \t]*#include +<([\w\d./]+)>/gm;function $u(r){return r.replace(tC,iC)}const nC=new Map;function iC(r,e){let t=Ve[e];if(t===void 0){const n=nC.get(e);if(n!==void 0)t=Ve[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return $u(t)}const sC=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function op(r){return r.replace(sC,rC)}function rC(r,e,t,n){let i="";for(let s=parseInt(e);s<parseInt(t);s++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return i}function cp(r){let e=`precision ${r.precision} float;
	precision ${r.precision} int;
	precision ${r.precision} sampler2D;
	precision ${r.precision} samplerCube;
	precision ${r.precision} sampler3D;
	precision ${r.precision} sampler2DArray;
	precision ${r.precision} sampler2DShadow;
	precision ${r.precision} samplerCubeShadow;
	precision ${r.precision} sampler2DArrayShadow;
	precision ${r.precision} isampler2D;
	precision ${r.precision} isampler3D;
	precision ${r.precision} isamplerCube;
	precision ${r.precision} isampler2DArray;
	precision ${r.precision} usampler2D;
	precision ${r.precision} usampler3D;
	precision ${r.precision} usamplerCube;
	precision ${r.precision} usampler2DArray;
	`;return r.precision==="highp"?e+=`
#define HIGH_PRECISION`:r.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:r.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function aC(r){let e="SHADOWMAP_TYPE_BASIC";return r.shadowMapType===ag?e="SHADOWMAP_TYPE_PCF":r.shadowMapType===kb?e="SHADOWMAP_TYPE_PCF_SOFT":r.shadowMapType===Ci&&(e="SHADOWMAP_TYPE_VSM"),e}function oC(r){let e="ENVMAP_TYPE_CUBE";if(r.envMap)switch(r.envMapMode){case Us:case Gr:e="ENVMAP_TYPE_CUBE";break;case el:e="ENVMAP_TYPE_CUBE_UV";break}return e}function cC(r){let e="ENVMAP_MODE_REFLECTION";if(r.envMap)switch(r.envMapMode){case Gr:e="ENVMAP_MODE_REFRACTION";break}return e}function lC(r){let e="ENVMAP_BLENDING_NONE";if(r.envMap)switch(r.combine){case og:e="ENVMAP_BLENDING_MULTIPLY";break;case s_:e="ENVMAP_BLENDING_MIX";break;case r_:e="ENVMAP_BLENDING_ADD";break}return e}function hC(r){const e=r.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function uC(r,e,t,n){const i=r.getContext(),s=t.defines;let a=t.vertexShader,o=t.fragmentShader;const c=aC(t),l=oC(t),u=cC(t),h=lC(t),d=hC(t),f=JS(t),A=ZS(s),g=i.createProgram();let m,p,E=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,A].filter(Da).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,A].filter(Da).join(`
`),p.length>0&&(p+=`
`)):(m=[cp(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,A,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reversedDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Da).join(`
`),p=[cp(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,A,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reversedDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==ai?"#define TONE_MAPPING":"",t.toneMapping!==ai?Ve.tonemapping_pars_fragment:"",t.toneMapping!==ai?YS("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ve.colorspace_pars_fragment,jS("linearToOutputTexel",t.outputColorSpace),KS(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Da).join(`
`)),a=$u(a),a=rp(a,t),a=ap(a,t),o=$u(o),o=rp(o,t),o=ap(o,t),a=op(a),o=op(o),t.isRawShaderMaterial!==!0&&(E=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",t.glslVersion===tf?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===tf?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const _=E+m+a,b=E+p+o,x=np(i,i.VERTEX_SHADER,_),I=np(i,i.FRAGMENT_SHADER,b);i.attachShader(g,x),i.attachShader(g,I),t.index0AttributeName!==void 0?i.bindAttribLocation(g,0,t.index0AttributeName):t.morphTargets===!0&&i.bindAttribLocation(g,0,"position"),i.linkProgram(g);function M(T){if(r.debug.checkShaderErrors){const k=i.getProgramInfoLog(g)||"",U=i.getShaderInfoLog(x)||"",F=i.getShaderInfoLog(I)||"",H=k.trim(),O=U.trim(),W=F.trim();let Q=!0,Y=!0;if(i.getProgramParameter(g,i.LINK_STATUS)===!1)if(Q=!1,typeof r.debug.onShaderError=="function")r.debug.onShaderError(i,g,x,I);else{const Z=sp(i,x,"vertex"),re=sp(i,I,"fragment");console.error("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(g,i.VALIDATE_STATUS)+`

Material Name: `+T.name+`
Material Type: `+T.type+`

Program Info Log: `+H+`
`+Z+`
`+re)}else H!==""?console.warn("THREE.WebGLProgram: Program Info Log:",H):(O===""||W==="")&&(Y=!1);Y&&(T.diagnostics={runnable:Q,programLog:H,vertexShader:{log:O,prefix:m},fragmentShader:{log:W,prefix:p}})}i.deleteShader(x),i.deleteShader(I),w=new vc(i,g),v=eC(i,g)}let w;this.getUniforms=function(){return w===void 0&&M(this),w};let v;this.getAttributes=function(){return v===void 0&&M(this),v};let y=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return y===!1&&(y=i.getProgramParameter(g,WS)),y},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(g),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=qS++,this.cacheKey=e,this.usedTimes=1,this.program=g,this.vertexShader=x,this.fragmentShader=I,this}let dC=0;class fC{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,i=this._getShaderStage(t),s=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(i)===!1&&(a.add(i),i.usedTimes++),a.has(s)===!1&&(a.add(s),s.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new pC(e),t.set(e,n)),n}}class pC{constructor(e){this.id=dC++,this.code=e,this.usedTimes=0}}function AC(r,e,t,n,i,s,a){const o=new xd,c=new fC,l=new Set,u=[],h=i.logarithmicDepthBuffer,d=i.vertexTextures;let f=i.precision;const A={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(v){return l.add(v),v===0?"uv":`uv${v}`}function m(v,y,T,k,U){const F=k.fog,H=U.geometry,O=v.isMeshStandardMaterial?k.environment:null,W=(v.isMeshStandardMaterial?t:e).get(v.envMap||O),Q=W&&W.mapping===el?W.image.height:null,Y=A[v.type];v.precision!==null&&(f=i.getMaxPrecision(v.precision),f!==v.precision&&console.warn("THREE.WebGLProgram.getParameters:",v.precision,"not supported, using",f,"instead."));const Z=H.morphAttributes.position||H.morphAttributes.normal||H.morphAttributes.color,re=Z!==void 0?Z.length:0;let fe=0;H.morphAttributes.position!==void 0&&(fe=1),H.morphAttributes.normal!==void 0&&(fe=2),H.morphAttributes.color!==void 0&&(fe=3);let Be,Ge,q,oe;if(Y){const rt=ei[Y];Be=rt.vertexShader,Ge=rt.fragmentShader}else Be=v.vertexShader,Ge=v.fragmentShader,c.update(v),q=c.getVertexShaderID(v),oe=c.getFragmentShaderID(v);const se=r.getRenderTarget(),Ce=r.state.buffers.depth.getReversed(),we=U.isInstancedMesh===!0,Oe=U.isBatchedMesh===!0,St=!!v.map,Ye=!!v.matcap,D=!!W,st=!!v.aoMap,Te=!!v.lightMap,nt=!!v.bumpMap,Se=!!v.normalMap,Ct=!!v.displacementMap,ge=!!v.emissiveMap,Xe=!!v.metalnessMap,Gt=!!v.roughnessMap,Ft=v.anisotropy>0,R=v.clearcoat>0,S=v.dispersion>0,G=v.iridescence>0,$=v.sheen>0,K=v.transmission>0,X=Ft&&!!v.anisotropyMap,ye=R&&!!v.clearcoatMap,ae=R&&!!v.clearcoatNormalMap,Ee=R&&!!v.clearcoatRoughnessMap,xe=G&&!!v.iridescenceMap,ne=G&&!!v.iridescenceThicknessMap,de=$&&!!v.sheenColorMap,Fe=$&&!!v.sheenRoughnessMap,ve=!!v.specularMap,he=!!v.specularColorMap,ze=!!v.specularIntensityMap,L=K&&!!v.transmissionMap,ie=K&&!!v.thicknessMap,ce=!!v.gradientMap,me=!!v.alphaMap,ee=v.alphaTest>0,j=!!v.alphaHash,_e=!!v.extensions;let He=ai;v.toneMapped&&(se===null||se.isXRRenderTarget===!0)&&(He=r.toneMapping);const At={shaderID:Y,shaderType:v.type,shaderName:v.name,vertexShader:Be,fragmentShader:Ge,defines:v.defines,customVertexShaderID:q,customFragmentShaderID:oe,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:f,batching:Oe,batchingColor:Oe&&U._colorsTexture!==null,instancing:we,instancingColor:we&&U.instanceColor!==null,instancingMorph:we&&U.morphTexture!==null,supportsVertexTextures:d,outputColorSpace:se===null?r.outputColorSpace:se.isXRRenderTarget===!0?se.texture.colorSpace:gt,alphaToCoverage:!!v.alphaToCoverage,map:St,matcap:Ye,envMap:D,envMapMode:D&&W.mapping,envMapCubeUVHeight:Q,aoMap:st,lightMap:Te,bumpMap:nt,normalMap:Se,displacementMap:d&&Ct,emissiveMap:ge,normalMapObjectSpace:Se&&v.normalMapType===d_,normalMapTangentSpace:Se&&v.normalMapType===bg,metalnessMap:Xe,roughnessMap:Gt,anisotropy:Ft,anisotropyMap:X,clearcoat:R,clearcoatMap:ye,clearcoatNormalMap:ae,clearcoatRoughnessMap:Ee,dispersion:S,iridescence:G,iridescenceMap:xe,iridescenceThicknessMap:ne,sheen:$,sheenColorMap:de,sheenRoughnessMap:Fe,specularMap:ve,specularColorMap:he,specularIntensityMap:ze,transmission:K,transmissionMap:L,thicknessMap:ie,gradientMap:ce,opaque:v.transparent===!1&&v.blending===Rr&&v.alphaToCoverage===!1,alphaMap:me,alphaTest:ee,alphaHash:j,combine:v.combine,mapUv:St&&g(v.map.channel),aoMapUv:st&&g(v.aoMap.channel),lightMapUv:Te&&g(v.lightMap.channel),bumpMapUv:nt&&g(v.bumpMap.channel),normalMapUv:Se&&g(v.normalMap.channel),displacementMapUv:Ct&&g(v.displacementMap.channel),emissiveMapUv:ge&&g(v.emissiveMap.channel),metalnessMapUv:Xe&&g(v.metalnessMap.channel),roughnessMapUv:Gt&&g(v.roughnessMap.channel),anisotropyMapUv:X&&g(v.anisotropyMap.channel),clearcoatMapUv:ye&&g(v.clearcoatMap.channel),clearcoatNormalMapUv:ae&&g(v.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Ee&&g(v.clearcoatRoughnessMap.channel),iridescenceMapUv:xe&&g(v.iridescenceMap.channel),iridescenceThicknessMapUv:ne&&g(v.iridescenceThicknessMap.channel),sheenColorMapUv:de&&g(v.sheenColorMap.channel),sheenRoughnessMapUv:Fe&&g(v.sheenRoughnessMap.channel),specularMapUv:ve&&g(v.specularMap.channel),specularColorMapUv:he&&g(v.specularColorMap.channel),specularIntensityMapUv:ze&&g(v.specularIntensityMap.channel),transmissionMapUv:L&&g(v.transmissionMap.channel),thicknessMapUv:ie&&g(v.thicknessMap.channel),alphaMapUv:me&&g(v.alphaMap.channel),vertexTangents:!!H.attributes.tangent&&(Se||Ft),vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&!!H.attributes.color&&H.attributes.color.itemSize===4,pointsUvs:U.isPoints===!0&&!!H.attributes.uv&&(St||me),fog:!!F,useFog:v.fog===!0,fogExp2:!!F&&F.isFogExp2,flatShading:v.flatShading===!0&&v.wireframe===!1,sizeAttenuation:v.sizeAttenuation===!0,logarithmicDepthBuffer:h,reversedDepthBuffer:Ce,skinning:U.isSkinnedMesh===!0,morphTargets:H.morphAttributes.position!==void 0,morphNormals:H.morphAttributes.normal!==void 0,morphColors:H.morphAttributes.color!==void 0,morphTargetsCount:re,morphTextureStride:fe,numDirLights:y.directional.length,numPointLights:y.point.length,numSpotLights:y.spot.length,numSpotLightMaps:y.spotLightMap.length,numRectAreaLights:y.rectArea.length,numHemiLights:y.hemi.length,numDirLightShadows:y.directionalShadowMap.length,numPointLightShadows:y.pointShadowMap.length,numSpotLightShadows:y.spotShadowMap.length,numSpotLightShadowsWithMaps:y.numSpotLightShadowsWithMaps,numLightProbes:y.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:v.dithering,shadowMapEnabled:r.shadowMap.enabled&&T.length>0,shadowMapType:r.shadowMap.type,toneMapping:He,decodeVideoTexture:St&&v.map.isVideoTexture===!0&&Je.getTransfer(v.map.colorSpace)===ut,decodeVideoTextureEmissive:ge&&v.emissiveMap.isVideoTexture===!0&&Je.getTransfer(v.emissiveMap.colorSpace)===ut,premultipliedAlpha:v.premultipliedAlpha,doubleSided:v.side===Wt,flipSided:v.side===jt,useDepthPacking:v.depthPacking>=0,depthPacking:v.depthPacking||0,index0AttributeName:v.index0AttributeName,extensionClipCullDistance:_e&&v.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(_e&&v.extensions.multiDraw===!0||Oe)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:v.customProgramCacheKey()};return At.vertexUv1s=l.has(1),At.vertexUv2s=l.has(2),At.vertexUv3s=l.has(3),l.clear(),At}function p(v){const y=[];if(v.shaderID?y.push(v.shaderID):(y.push(v.customVertexShaderID),y.push(v.customFragmentShaderID)),v.defines!==void 0)for(const T in v.defines)y.push(T),y.push(v.defines[T]);return v.isRawShaderMaterial===!1&&(E(y,v),_(y,v),y.push(r.outputColorSpace)),y.push(v.customProgramCacheKey),y.join()}function E(v,y){v.push(y.precision),v.push(y.outputColorSpace),v.push(y.envMapMode),v.push(y.envMapCubeUVHeight),v.push(y.mapUv),v.push(y.alphaMapUv),v.push(y.lightMapUv),v.push(y.aoMapUv),v.push(y.bumpMapUv),v.push(y.normalMapUv),v.push(y.displacementMapUv),v.push(y.emissiveMapUv),v.push(y.metalnessMapUv),v.push(y.roughnessMapUv),v.push(y.anisotropyMapUv),v.push(y.clearcoatMapUv),v.push(y.clearcoatNormalMapUv),v.push(y.clearcoatRoughnessMapUv),v.push(y.iridescenceMapUv),v.push(y.iridescenceThicknessMapUv),v.push(y.sheenColorMapUv),v.push(y.sheenRoughnessMapUv),v.push(y.specularMapUv),v.push(y.specularColorMapUv),v.push(y.specularIntensityMapUv),v.push(y.transmissionMapUv),v.push(y.thicknessMapUv),v.push(y.combine),v.push(y.fogExp2),v.push(y.sizeAttenuation),v.push(y.morphTargetsCount),v.push(y.morphAttributeCount),v.push(y.numDirLights),v.push(y.numPointLights),v.push(y.numSpotLights),v.push(y.numSpotLightMaps),v.push(y.numHemiLights),v.push(y.numRectAreaLights),v.push(y.numDirLightShadows),v.push(y.numPointLightShadows),v.push(y.numSpotLightShadows),v.push(y.numSpotLightShadowsWithMaps),v.push(y.numLightProbes),v.push(y.shadowMapType),v.push(y.toneMapping),v.push(y.numClippingPlanes),v.push(y.numClipIntersection),v.push(y.depthPacking)}function _(v,y){o.disableAll(),y.supportsVertexTextures&&o.enable(0),y.instancing&&o.enable(1),y.instancingColor&&o.enable(2),y.instancingMorph&&o.enable(3),y.matcap&&o.enable(4),y.envMap&&o.enable(5),y.normalMapObjectSpace&&o.enable(6),y.normalMapTangentSpace&&o.enable(7),y.clearcoat&&o.enable(8),y.iridescence&&o.enable(9),y.alphaTest&&o.enable(10),y.vertexColors&&o.enable(11),y.vertexAlphas&&o.enable(12),y.vertexUv1s&&o.enable(13),y.vertexUv2s&&o.enable(14),y.vertexUv3s&&o.enable(15),y.vertexTangents&&o.enable(16),y.anisotropy&&o.enable(17),y.alphaHash&&o.enable(18),y.batching&&o.enable(19),y.dispersion&&o.enable(20),y.batchingColor&&o.enable(21),y.gradientMap&&o.enable(22),v.push(o.mask),o.disableAll(),y.fog&&o.enable(0),y.useFog&&o.enable(1),y.flatShading&&o.enable(2),y.logarithmicDepthBuffer&&o.enable(3),y.reversedDepthBuffer&&o.enable(4),y.skinning&&o.enable(5),y.morphTargets&&o.enable(6),y.morphNormals&&o.enable(7),y.morphColors&&o.enable(8),y.premultipliedAlpha&&o.enable(9),y.shadowMapEnabled&&o.enable(10),y.doubleSided&&o.enable(11),y.flipSided&&o.enable(12),y.useDepthPacking&&o.enable(13),y.dithering&&o.enable(14),y.transmission&&o.enable(15),y.sheen&&o.enable(16),y.opaque&&o.enable(17),y.pointsUvs&&o.enable(18),y.decodeVideoTexture&&o.enable(19),y.decodeVideoTextureEmissive&&o.enable(20),y.alphaToCoverage&&o.enable(21),v.push(o.mask)}function b(v){const y=A[v.type];let T;if(y){const k=ei[y];T=iE.clone(k.uniforms)}else T=v.uniforms;return T}function x(v,y){let T;for(let k=0,U=u.length;k<U;k++){const F=u[k];if(F.cacheKey===y){T=F,++T.usedTimes;break}}return T===void 0&&(T=new uC(r,y,v,s),u.push(T)),T}function I(v){if(--v.usedTimes===0){const y=u.indexOf(v);u[y]=u[u.length-1],u.pop(),v.destroy()}}function M(v){c.remove(v)}function w(){c.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:b,acquireProgram:x,releaseProgram:I,releaseShaderCache:M,programs:u,dispose:w}}function mC(){let r=new WeakMap;function e(a){return r.has(a)}function t(a){let o=r.get(a);return o===void 0&&(o={},r.set(a,o)),o}function n(a){r.delete(a)}function i(a,o,c){r.get(a)[o]=c}function s(){r=new WeakMap}return{has:e,get:t,remove:n,update:i,dispose:s}}function gC(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.material.id!==e.material.id?r.material.id-e.material.id:r.z!==e.z?r.z-e.z:r.id-e.id}function lp(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.z!==e.z?e.z-r.z:r.id-e.id}function hp(){const r=[];let e=0;const t=[],n=[],i=[];function s(){e=0,t.length=0,n.length=0,i.length=0}function a(h,d,f,A,g,m){let p=r[e];return p===void 0?(p={id:h.id,object:h,geometry:d,material:f,groupOrder:A,renderOrder:h.renderOrder,z:g,group:m},r[e]=p):(p.id=h.id,p.object=h,p.geometry=d,p.material=f,p.groupOrder=A,p.renderOrder=h.renderOrder,p.z=g,p.group=m),e++,p}function o(h,d,f,A,g,m){const p=a(h,d,f,A,g,m);f.transmission>0?n.push(p):f.transparent===!0?i.push(p):t.push(p)}function c(h,d,f,A,g,m){const p=a(h,d,f,A,g,m);f.transmission>0?n.unshift(p):f.transparent===!0?i.unshift(p):t.unshift(p)}function l(h,d){t.length>1&&t.sort(h||gC),n.length>1&&n.sort(d||lp),i.length>1&&i.sort(d||lp)}function u(){for(let h=e,d=r.length;h<d;h++){const f=r[h];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:n,transparent:i,init:s,push:o,unshift:c,finish:u,sort:l}}function bC(){let r=new WeakMap;function e(n,i){const s=r.get(n);let a;return s===void 0?(a=new hp,r.set(n,[a])):i>=s.length?(a=new hp,s.push(a)):a=s[i],a}function t(){r=new WeakMap}return{get:e,dispose:t}}function _C(){const r={};return{get:function(e){if(r[e.id]!==void 0)return r[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new B,color:new Me};break;case"SpotLight":t={position:new B,direction:new B,color:new Me,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new B,color:new Me,distance:0,decay:0};break;case"HemisphereLight":t={direction:new B,skyColor:new Me,groundColor:new Me};break;case"RectAreaLight":t={color:new Me,position:new B,halfWidth:new B,halfHeight:new B};break}return r[e.id]=t,t}}}function EC(){const r={};return{get:function(e){if(r[e.id]!==void 0)return r[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ke};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ke};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ke,shadowCameraNear:1,shadowCameraFar:1e3};break}return r[e.id]=t,t}}}let xC=0;function vC(r,e){return(e.castShadow?2:0)-(r.castShadow?2:0)+(e.map?1:0)-(r.map?1:0)}function yC(r){const e=new _C,t=EC(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)n.probe.push(new B);const i=new B,s=new Ne,a=new Ne;function o(l){let u=0,h=0,d=0;for(let v=0;v<9;v++)n.probe[v].set(0,0,0);let f=0,A=0,g=0,m=0,p=0,E=0,_=0,b=0,x=0,I=0,M=0;l.sort(vC);for(let v=0,y=l.length;v<y;v++){const T=l[v],k=T.color,U=T.intensity,F=T.distance,H=T.shadow&&T.shadow.map?T.shadow.map.texture:null;if(T.isAmbientLight)u+=k.r*U,h+=k.g*U,d+=k.b*U;else if(T.isLightProbe){for(let O=0;O<9;O++)n.probe[O].addScaledVector(T.sh.coefficients[O],U);M++}else if(T.isDirectionalLight){const O=e.get(T);if(O.color.copy(T.color).multiplyScalar(T.intensity),T.castShadow){const W=T.shadow,Q=t.get(T);Q.shadowIntensity=W.intensity,Q.shadowBias=W.bias,Q.shadowNormalBias=W.normalBias,Q.shadowRadius=W.radius,Q.shadowMapSize=W.mapSize,n.directionalShadow[f]=Q,n.directionalShadowMap[f]=H,n.directionalShadowMatrix[f]=T.shadow.matrix,E++}n.directional[f]=O,f++}else if(T.isSpotLight){const O=e.get(T);O.position.setFromMatrixPosition(T.matrixWorld),O.color.copy(k).multiplyScalar(U),O.distance=F,O.coneCos=Math.cos(T.angle),O.penumbraCos=Math.cos(T.angle*(1-T.penumbra)),O.decay=T.decay,n.spot[g]=O;const W=T.shadow;if(T.map&&(n.spotLightMap[x]=T.map,x++,W.updateMatrices(T),T.castShadow&&I++),n.spotLightMatrix[g]=W.matrix,T.castShadow){const Q=t.get(T);Q.shadowIntensity=W.intensity,Q.shadowBias=W.bias,Q.shadowNormalBias=W.normalBias,Q.shadowRadius=W.radius,Q.shadowMapSize=W.mapSize,n.spotShadow[g]=Q,n.spotShadowMap[g]=H,b++}g++}else if(T.isRectAreaLight){const O=e.get(T);O.color.copy(k).multiplyScalar(U),O.halfWidth.set(T.width*.5,0,0),O.halfHeight.set(0,T.height*.5,0),n.rectArea[m]=O,m++}else if(T.isPointLight){const O=e.get(T);if(O.color.copy(T.color).multiplyScalar(T.intensity),O.distance=T.distance,O.decay=T.decay,T.castShadow){const W=T.shadow,Q=t.get(T);Q.shadowIntensity=W.intensity,Q.shadowBias=W.bias,Q.shadowNormalBias=W.normalBias,Q.shadowRadius=W.radius,Q.shadowMapSize=W.mapSize,Q.shadowCameraNear=W.camera.near,Q.shadowCameraFar=W.camera.far,n.pointShadow[A]=Q,n.pointShadowMap[A]=H,n.pointShadowMatrix[A]=T.shadow.matrix,_++}n.point[A]=O,A++}else if(T.isHemisphereLight){const O=e.get(T);O.skyColor.copy(T.color).multiplyScalar(U),O.groundColor.copy(T.groundColor).multiplyScalar(U),n.hemi[p]=O,p++}}m>0&&(r.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=le.LTC_FLOAT_1,n.rectAreaLTC2=le.LTC_FLOAT_2):(n.rectAreaLTC1=le.LTC_HALF_1,n.rectAreaLTC2=le.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=h,n.ambient[2]=d;const w=n.hash;(w.directionalLength!==f||w.pointLength!==A||w.spotLength!==g||w.rectAreaLength!==m||w.hemiLength!==p||w.numDirectionalShadows!==E||w.numPointShadows!==_||w.numSpotShadows!==b||w.numSpotMaps!==x||w.numLightProbes!==M)&&(n.directional.length=f,n.spot.length=g,n.rectArea.length=m,n.point.length=A,n.hemi.length=p,n.directionalShadow.length=E,n.directionalShadowMap.length=E,n.pointShadow.length=_,n.pointShadowMap.length=_,n.spotShadow.length=b,n.spotShadowMap.length=b,n.directionalShadowMatrix.length=E,n.pointShadowMatrix.length=_,n.spotLightMatrix.length=b+x-I,n.spotLightMap.length=x,n.numSpotLightShadowsWithMaps=I,n.numLightProbes=M,w.directionalLength=f,w.pointLength=A,w.spotLength=g,w.rectAreaLength=m,w.hemiLength=p,w.numDirectionalShadows=E,w.numPointShadows=_,w.numSpotShadows=b,w.numSpotMaps=x,w.numLightProbes=M,n.version=xC++)}function c(l,u){let h=0,d=0,f=0,A=0,g=0;const m=u.matrixWorldInverse;for(let p=0,E=l.length;p<E;p++){const _=l[p];if(_.isDirectionalLight){const b=n.directional[h];b.direction.setFromMatrixPosition(_.matrixWorld),i.setFromMatrixPosition(_.target.matrixWorld),b.direction.sub(i),b.direction.transformDirection(m),h++}else if(_.isSpotLight){const b=n.spot[f];b.position.setFromMatrixPosition(_.matrixWorld),b.position.applyMatrix4(m),b.direction.setFromMatrixPosition(_.matrixWorld),i.setFromMatrixPosition(_.target.matrixWorld),b.direction.sub(i),b.direction.transformDirection(m),f++}else if(_.isRectAreaLight){const b=n.rectArea[A];b.position.setFromMatrixPosition(_.matrixWorld),b.position.applyMatrix4(m),a.identity(),s.copy(_.matrixWorld),s.premultiply(m),a.extractRotation(s),b.halfWidth.set(_.width*.5,0,0),b.halfHeight.set(0,_.height*.5,0),b.halfWidth.applyMatrix4(a),b.halfHeight.applyMatrix4(a),A++}else if(_.isPointLight){const b=n.point[d];b.position.setFromMatrixPosition(_.matrixWorld),b.position.applyMatrix4(m),d++}else if(_.isHemisphereLight){const b=n.hemi[g];b.direction.setFromMatrixPosition(_.matrixWorld),b.direction.transformDirection(m),g++}}}return{setup:o,setupView:c,state:n}}function up(r){const e=new yC(r),t=[],n=[];function i(u){l.camera=u,t.length=0,n.length=0}function s(u){t.push(u)}function a(u){n.push(u)}function o(){e.setup(t)}function c(u){e.setupView(t,u)}const l={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:i,state:l,setupLights:o,setupLightsView:c,pushLight:s,pushShadow:a}}function SC(r){let e=new WeakMap;function t(i,s=0){const a=e.get(i);let o;return a===void 0?(o=new up(r),e.set(i,[o])):s>=a.length?(o=new up(r),a.push(o)):o=a[s],o}function n(){e=new WeakMap}return{get:t,dispose:n}}const CC=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,IC=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function MC(r,e,t){let n=new Cd;const i=new ke,s=new ke,a=new it,o=new Fg({depthPacking:u_}),c=new yE,l={},u=t.maxTextureSize,h={[Xn]:jt,[jt]:Xn,[Wt]:Wt},d=new In({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ke},radius:{value:4}},vertexShader:CC,fragmentShader:IC}),f=d.clone();f.defines.HORIZONTAL_PASS=1;const A=new An;A.setAttribute("position",new yt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const g=new dt(A,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=ag;let p=this.type;this.render=function(I,M,w){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||I.length===0)return;const v=r.getRenderTarget(),y=r.getActiveCubeFace(),T=r.getActiveMipmapLevel(),k=r.state;k.setBlending(ri),k.buffers.depth.getReversed()?k.buffers.color.setClear(0,0,0,0):k.buffers.color.setClear(1,1,1,1),k.buffers.depth.setTest(!0),k.setScissorTest(!1);const U=p!==Ci&&this.type===Ci,F=p===Ci&&this.type!==Ci;for(let H=0,O=I.length;H<O;H++){const W=I[H],Q=W.shadow;if(Q===void 0){console.warn("THREE.WebGLShadowMap:",W,"has no shadow.");continue}if(Q.autoUpdate===!1&&Q.needsUpdate===!1)continue;i.copy(Q.mapSize);const Y=Q.getFrameExtents();if(i.multiply(Y),s.copy(Q.mapSize),(i.x>u||i.y>u)&&(i.x>u&&(s.x=Math.floor(u/Y.x),i.x=s.x*Y.x,Q.mapSize.x=s.x),i.y>u&&(s.y=Math.floor(u/Y.y),i.y=s.y*Y.y,Q.mapSize.y=s.y)),Q.map===null||U===!0||F===!0){const re=this.type!==Ci?{minFilter:Ot,magFilter:Ot}:{};Q.map!==null&&Q.map.dispose(),Q.map=new Pn(i.x,i.y,re),Q.map.texture.name=W.name+".shadowMap",Q.camera.updateProjectionMatrix()}r.setRenderTarget(Q.map),r.clear();const Z=Q.getViewportCount();for(let re=0;re<Z;re++){const fe=Q.getViewport(re);a.set(s.x*fe.x,s.y*fe.y,s.x*fe.z,s.y*fe.w),k.viewport(a),Q.updateMatrices(W,re),n=Q.getFrustum(),b(M,w,Q.camera,W,this.type)}Q.isPointLightShadow!==!0&&this.type===Ci&&E(Q,w),Q.needsUpdate=!1}p=this.type,m.needsUpdate=!1,r.setRenderTarget(v,y,T)};function E(I,M){const w=e.update(g);d.defines.VSM_SAMPLES!==I.blurSamples&&(d.defines.VSM_SAMPLES=I.blurSamples,f.defines.VSM_SAMPLES=I.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),I.mapPass===null&&(I.mapPass=new Pn(i.x,i.y)),d.uniforms.shadow_pass.value=I.map.texture,d.uniforms.resolution.value=I.mapSize,d.uniforms.radius.value=I.radius,r.setRenderTarget(I.mapPass),r.clear(),r.renderBufferDirect(M,null,w,d,g,null),f.uniforms.shadow_pass.value=I.mapPass.texture,f.uniforms.resolution.value=I.mapSize,f.uniforms.radius.value=I.radius,r.setRenderTarget(I.map),r.clear(),r.renderBufferDirect(M,null,w,f,g,null)}function _(I,M,w,v){let y=null;const T=w.isPointLight===!0?I.customDistanceMaterial:I.customDepthMaterial;if(T!==void 0)y=T;else if(y=w.isPointLight===!0?c:o,r.localClippingEnabled&&M.clipShadows===!0&&Array.isArray(M.clippingPlanes)&&M.clippingPlanes.length!==0||M.displacementMap&&M.displacementScale!==0||M.alphaMap&&M.alphaTest>0||M.map&&M.alphaTest>0||M.alphaToCoverage===!0){const k=y.uuid,U=M.uuid;let F=l[k];F===void 0&&(F={},l[k]=F);let H=F[U];H===void 0&&(H=y.clone(),F[U]=H,M.addEventListener("dispose",x)),y=H}if(y.visible=M.visible,y.wireframe=M.wireframe,v===Ci?y.side=M.shadowSide!==null?M.shadowSide:M.side:y.side=M.shadowSide!==null?M.shadowSide:h[M.side],y.alphaMap=M.alphaMap,y.alphaTest=M.alphaToCoverage===!0?.5:M.alphaTest,y.map=M.map,y.clipShadows=M.clipShadows,y.clippingPlanes=M.clippingPlanes,y.clipIntersection=M.clipIntersection,y.displacementMap=M.displacementMap,y.displacementScale=M.displacementScale,y.displacementBias=M.displacementBias,y.wireframeLinewidth=M.wireframeLinewidth,y.linewidth=M.linewidth,w.isPointLight===!0&&y.isMeshDistanceMaterial===!0){const k=r.properties.get(y);k.light=w}return y}function b(I,M,w,v,y){if(I.visible===!1)return;if(I.layers.test(M.layers)&&(I.isMesh||I.isLine||I.isPoints)&&(I.castShadow||I.receiveShadow&&y===Ci)&&(!I.frustumCulled||n.intersectsObject(I))){I.modelViewMatrix.multiplyMatrices(w.matrixWorldInverse,I.matrixWorld);const U=e.update(I),F=I.material;if(Array.isArray(F)){const H=U.groups;for(let O=0,W=H.length;O<W;O++){const Q=H[O],Y=F[Q.materialIndex];if(Y&&Y.visible){const Z=_(I,Y,v,y);I.onBeforeShadow(r,I,M,w,U,Z,Q),r.renderBufferDirect(w,null,U,Z,I,Q),I.onAfterShadow(r,I,M,w,U,Z,Q)}}}else if(F.visible){const H=_(I,F,v,y);I.onBeforeShadow(r,I,M,w,U,H,null),r.renderBufferDirect(w,null,U,H,I,null),I.onAfterShadow(r,I,M,w,U,H,null)}}const k=I.children;for(let U=0,F=k.length;U<F;U++)b(k[U],M,w,v,y)}function x(I){I.target.removeEventListener("dispose",x);for(const w in l){const v=l[w],y=I.target.uuid;y in v&&(v[y].dispose(),delete v[y])}}}const wC={[Au]:mu,[gu]:Eu,[bu]:xu,[kr]:_u,[mu]:Au,[Eu]:gu,[xu]:bu,[_u]:kr};function TC(r,e){function t(){let L=!1;const ie=new it;let ce=null;const me=new it(0,0,0,0);return{setMask:function(ee){ce!==ee&&!L&&(r.colorMask(ee,ee,ee,ee),ce=ee)},setLocked:function(ee){L=ee},setClear:function(ee,j,_e,He,At){At===!0&&(ee*=He,j*=He,_e*=He),ie.set(ee,j,_e,He),me.equals(ie)===!1&&(r.clearColor(ee,j,_e,He),me.copy(ie))},reset:function(){L=!1,ce=null,me.set(-1,0,0,0)}}}function n(){let L=!1,ie=!1,ce=null,me=null,ee=null;return{setReversed:function(j){if(ie!==j){const _e=e.get("EXT_clip_control");j?_e.clipControlEXT(_e.LOWER_LEFT_EXT,_e.ZERO_TO_ONE_EXT):_e.clipControlEXT(_e.LOWER_LEFT_EXT,_e.NEGATIVE_ONE_TO_ONE_EXT),ie=j;const He=ee;ee=null,this.setClear(He)}},getReversed:function(){return ie},setTest:function(j){j?se(r.DEPTH_TEST):Ce(r.DEPTH_TEST)},setMask:function(j){ce!==j&&!L&&(r.depthMask(j),ce=j)},setFunc:function(j){if(ie&&(j=wC[j]),me!==j){switch(j){case Au:r.depthFunc(r.NEVER);break;case mu:r.depthFunc(r.ALWAYS);break;case gu:r.depthFunc(r.LESS);break;case kr:r.depthFunc(r.LEQUAL);break;case bu:r.depthFunc(r.EQUAL);break;case _u:r.depthFunc(r.GEQUAL);break;case Eu:r.depthFunc(r.GREATER);break;case xu:r.depthFunc(r.NOTEQUAL);break;default:r.depthFunc(r.LEQUAL)}me=j}},setLocked:function(j){L=j},setClear:function(j){ee!==j&&(ie&&(j=1-j),r.clearDepth(j),ee=j)},reset:function(){L=!1,ce=null,me=null,ee=null,ie=!1}}}function i(){let L=!1,ie=null,ce=null,me=null,ee=null,j=null,_e=null,He=null,At=null;return{setTest:function(rt){L||(rt?se(r.STENCIL_TEST):Ce(r.STENCIL_TEST))},setMask:function(rt){ie!==rt&&!L&&(r.stencilMask(rt),ie=rt)},setFunc:function(rt,ui,Kn){(ce!==rt||me!==ui||ee!==Kn)&&(r.stencilFunc(rt,ui,Kn),ce=rt,me=ui,ee=Kn)},setOp:function(rt,ui,Kn){(j!==rt||_e!==ui||He!==Kn)&&(r.stencilOp(rt,ui,Kn),j=rt,_e=ui,He=Kn)},setLocked:function(rt){L=rt},setClear:function(rt){At!==rt&&(r.clearStencil(rt),At=rt)},reset:function(){L=!1,ie=null,ce=null,me=null,ee=null,j=null,_e=null,He=null,At=null}}}const s=new t,a=new n,o=new i,c=new WeakMap,l=new WeakMap;let u={},h={},d=new WeakMap,f=[],A=null,g=!1,m=null,p=null,E=null,_=null,b=null,x=null,I=null,M=new Me(0,0,0),w=0,v=!1,y=null,T=null,k=null,U=null,F=null;const H=r.getParameter(r.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let O=!1,W=0;const Q=r.getParameter(r.VERSION);Q.indexOf("WebGL")!==-1?(W=parseFloat(/^WebGL (\d)/.exec(Q)[1]),O=W>=1):Q.indexOf("OpenGL ES")!==-1&&(W=parseFloat(/^OpenGL ES (\d)/.exec(Q)[1]),O=W>=2);let Y=null,Z={};const re=r.getParameter(r.SCISSOR_BOX),fe=r.getParameter(r.VIEWPORT),Be=new it().fromArray(re),Ge=new it().fromArray(fe);function q(L,ie,ce,me){const ee=new Uint8Array(4),j=r.createTexture();r.bindTexture(L,j),r.texParameteri(L,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(L,r.TEXTURE_MAG_FILTER,r.NEAREST);for(let _e=0;_e<ce;_e++)L===r.TEXTURE_3D||L===r.TEXTURE_2D_ARRAY?r.texImage3D(ie,0,r.RGBA,1,1,me,0,r.RGBA,r.UNSIGNED_BYTE,ee):r.texImage2D(ie+_e,0,r.RGBA,1,1,0,r.RGBA,r.UNSIGNED_BYTE,ee);return j}const oe={};oe[r.TEXTURE_2D]=q(r.TEXTURE_2D,r.TEXTURE_2D,1),oe[r.TEXTURE_CUBE_MAP]=q(r.TEXTURE_CUBE_MAP,r.TEXTURE_CUBE_MAP_POSITIVE_X,6),oe[r.TEXTURE_2D_ARRAY]=q(r.TEXTURE_2D_ARRAY,r.TEXTURE_2D_ARRAY,1,1),oe[r.TEXTURE_3D]=q(r.TEXTURE_3D,r.TEXTURE_3D,1,1),s.setClear(0,0,0,1),a.setClear(1),o.setClear(0),se(r.DEPTH_TEST),a.setFunc(kr),nt(!1),Se($d),se(r.CULL_FACE),st(ri);function se(L){u[L]!==!0&&(r.enable(L),u[L]=!0)}function Ce(L){u[L]!==!1&&(r.disable(L),u[L]=!1)}function we(L,ie){return h[L]!==ie?(r.bindFramebuffer(L,ie),h[L]=ie,L===r.DRAW_FRAMEBUFFER&&(h[r.FRAMEBUFFER]=ie),L===r.FRAMEBUFFER&&(h[r.DRAW_FRAMEBUFFER]=ie),!0):!1}function Oe(L,ie){let ce=f,me=!1;if(L){ce=d.get(ie),ce===void 0&&(ce=[],d.set(ie,ce));const ee=L.textures;if(ce.length!==ee.length||ce[0]!==r.COLOR_ATTACHMENT0){for(let j=0,_e=ee.length;j<_e;j++)ce[j]=r.COLOR_ATTACHMENT0+j;ce.length=ee.length,me=!0}}else ce[0]!==r.BACK&&(ce[0]=r.BACK,me=!0);me&&r.drawBuffers(ce)}function St(L){return A!==L?(r.useProgram(L),A=L,!0):!1}const Ye={[Is]:r.FUNC_ADD,[Gb]:r.FUNC_SUBTRACT,[Hb]:r.FUNC_REVERSE_SUBTRACT};Ye[zb]=r.MIN,Ye[Vb]=r.MAX;const D={[Wb]:r.ZERO,[qb]:r.ONE,[Xb]:r.SRC_COLOR,[fu]:r.SRC_ALPHA,[Zb]:r.SRC_ALPHA_SATURATE,[Kb]:r.DST_COLOR,[jb]:r.DST_ALPHA,[$b]:r.ONE_MINUS_SRC_COLOR,[pu]:r.ONE_MINUS_SRC_ALPHA,[Jb]:r.ONE_MINUS_DST_COLOR,[Yb]:r.ONE_MINUS_DST_ALPHA,[e_]:r.CONSTANT_COLOR,[t_]:r.ONE_MINUS_CONSTANT_COLOR,[n_]:r.CONSTANT_ALPHA,[i_]:r.ONE_MINUS_CONSTANT_ALPHA};function st(L,ie,ce,me,ee,j,_e,He,At,rt){if(L===ri){g===!0&&(Ce(r.BLEND),g=!1);return}if(g===!1&&(se(r.BLEND),g=!0),L!==Qb){if(L!==m||rt!==v){if((p!==Is||b!==Is)&&(r.blendEquation(r.FUNC_ADD),p=Is,b=Is),rt)switch(L){case Rr:r.blendFuncSeparate(r.ONE,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case jd:r.blendFunc(r.ONE,r.ONE);break;case Yd:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case Kd:r.blendFuncSeparate(r.DST_COLOR,r.ONE_MINUS_SRC_ALPHA,r.ZERO,r.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",L);break}else switch(L){case Rr:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case jd:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE,r.ONE,r.ONE);break;case Yd:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Kd:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",L);break}E=null,_=null,x=null,I=null,M.set(0,0,0),w=0,m=L,v=rt}return}ee=ee||ie,j=j||ce,_e=_e||me,(ie!==p||ee!==b)&&(r.blendEquationSeparate(Ye[ie],Ye[ee]),p=ie,b=ee),(ce!==E||me!==_||j!==x||_e!==I)&&(r.blendFuncSeparate(D[ce],D[me],D[j],D[_e]),E=ce,_=me,x=j,I=_e),(He.equals(M)===!1||At!==w)&&(r.blendColor(He.r,He.g,He.b,At),M.copy(He),w=At),m=L,v=!1}function Te(L,ie){L.side===Wt?Ce(r.CULL_FACE):se(r.CULL_FACE);let ce=L.side===jt;ie&&(ce=!ce),nt(ce),L.blending===Rr&&L.transparent===!1?st(ri):st(L.blending,L.blendEquation,L.blendSrc,L.blendDst,L.blendEquationAlpha,L.blendSrcAlpha,L.blendDstAlpha,L.blendColor,L.blendAlpha,L.premultipliedAlpha),a.setFunc(L.depthFunc),a.setTest(L.depthTest),a.setMask(L.depthWrite),s.setMask(L.colorWrite);const me=L.stencilWrite;o.setTest(me),me&&(o.setMask(L.stencilWriteMask),o.setFunc(L.stencilFunc,L.stencilRef,L.stencilFuncMask),o.setOp(L.stencilFail,L.stencilZFail,L.stencilZPass)),ge(L.polygonOffset,L.polygonOffsetFactor,L.polygonOffsetUnits),L.alphaToCoverage===!0?se(r.SAMPLE_ALPHA_TO_COVERAGE):Ce(r.SAMPLE_ALPHA_TO_COVERAGE)}function nt(L){y!==L&&(L?r.frontFace(r.CW):r.frontFace(r.CCW),y=L)}function Se(L){L!==Nb?(se(r.CULL_FACE),L!==T&&(L===$d?r.cullFace(r.BACK):L===Ob?r.cullFace(r.FRONT):r.cullFace(r.FRONT_AND_BACK))):Ce(r.CULL_FACE),T=L}function Ct(L){L!==k&&(O&&r.lineWidth(L),k=L)}function ge(L,ie,ce){L?(se(r.POLYGON_OFFSET_FILL),(U!==ie||F!==ce)&&(r.polygonOffset(ie,ce),U=ie,F=ce)):Ce(r.POLYGON_OFFSET_FILL)}function Xe(L){L?se(r.SCISSOR_TEST):Ce(r.SCISSOR_TEST)}function Gt(L){L===void 0&&(L=r.TEXTURE0+H-1),Y!==L&&(r.activeTexture(L),Y=L)}function Ft(L,ie,ce){ce===void 0&&(Y===null?ce=r.TEXTURE0+H-1:ce=Y);let me=Z[ce];me===void 0&&(me={type:void 0,texture:void 0},Z[ce]=me),(me.type!==L||me.texture!==ie)&&(Y!==ce&&(r.activeTexture(ce),Y=ce),r.bindTexture(L,ie||oe[L]),me.type=L,me.texture=ie)}function R(){const L=Z[Y];L!==void 0&&L.type!==void 0&&(r.bindTexture(L.type,null),L.type=void 0,L.texture=void 0)}function S(){try{r.compressedTexImage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function G(){try{r.compressedTexImage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function $(){try{r.texSubImage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function K(){try{r.texSubImage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function X(){try{r.compressedTexSubImage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function ye(){try{r.compressedTexSubImage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function ae(){try{r.texStorage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Ee(){try{r.texStorage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function xe(){try{r.texImage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function ne(){try{r.texImage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function de(L){Be.equals(L)===!1&&(r.scissor(L.x,L.y,L.z,L.w),Be.copy(L))}function Fe(L){Ge.equals(L)===!1&&(r.viewport(L.x,L.y,L.z,L.w),Ge.copy(L))}function ve(L,ie){let ce=l.get(ie);ce===void 0&&(ce=new WeakMap,l.set(ie,ce));let me=ce.get(L);me===void 0&&(me=r.getUniformBlockIndex(ie,L.name),ce.set(L,me))}function he(L,ie){const me=l.get(ie).get(L);c.get(ie)!==me&&(r.uniformBlockBinding(ie,me,L.__bindingPointIndex),c.set(ie,me))}function ze(){r.disable(r.BLEND),r.disable(r.CULL_FACE),r.disable(r.DEPTH_TEST),r.disable(r.POLYGON_OFFSET_FILL),r.disable(r.SCISSOR_TEST),r.disable(r.STENCIL_TEST),r.disable(r.SAMPLE_ALPHA_TO_COVERAGE),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ZERO),r.blendFuncSeparate(r.ONE,r.ZERO,r.ONE,r.ZERO),r.blendColor(0,0,0,0),r.colorMask(!0,!0,!0,!0),r.clearColor(0,0,0,0),r.depthMask(!0),r.depthFunc(r.LESS),a.setReversed(!1),r.clearDepth(1),r.stencilMask(4294967295),r.stencilFunc(r.ALWAYS,0,4294967295),r.stencilOp(r.KEEP,r.KEEP,r.KEEP),r.clearStencil(0),r.cullFace(r.BACK),r.frontFace(r.CCW),r.polygonOffset(0,0),r.activeTexture(r.TEXTURE0),r.bindFramebuffer(r.FRAMEBUFFER,null),r.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),r.bindFramebuffer(r.READ_FRAMEBUFFER,null),r.useProgram(null),r.lineWidth(1),r.scissor(0,0,r.canvas.width,r.canvas.height),r.viewport(0,0,r.canvas.width,r.canvas.height),u={},Y=null,Z={},h={},d=new WeakMap,f=[],A=null,g=!1,m=null,p=null,E=null,_=null,b=null,x=null,I=null,M=new Me(0,0,0),w=0,v=!1,y=null,T=null,k=null,U=null,F=null,Be.set(0,0,r.canvas.width,r.canvas.height),Ge.set(0,0,r.canvas.width,r.canvas.height),s.reset(),a.reset(),o.reset()}return{buffers:{color:s,depth:a,stencil:o},enable:se,disable:Ce,bindFramebuffer:we,drawBuffers:Oe,useProgram:St,setBlending:st,setMaterial:Te,setFlipSided:nt,setCullFace:Se,setLineWidth:Ct,setPolygonOffset:ge,setScissorTest:Xe,activeTexture:Gt,bindTexture:Ft,unbindTexture:R,compressedTexImage2D:S,compressedTexImage3D:G,texImage2D:xe,texImage3D:ne,updateUBOMapping:ve,uniformBlockBinding:he,texStorage2D:ae,texStorage3D:Ee,texSubImage2D:$,texSubImage3D:K,compressedTexSubImage2D:X,compressedTexSubImage3D:ye,scissor:de,viewport:Fe,reset:ze}}function RC(r,e,t,n,i,s,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new ke,u=new WeakMap;let h;const d=new WeakMap;let f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function A(R,S){return f?new OffscreenCanvas(R,S):no("canvas")}function g(R,S,G){let $=1;const K=Ft(R);if((K.width>G||K.height>G)&&($=G/Math.max(K.width,K.height)),$<1)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){const X=Math.floor($*K.width),ye=Math.floor($*K.height);h===void 0&&(h=A(X,ye));const ae=S?A(X,ye):h;return ae.width=X,ae.height=ye,ae.getContext("2d").drawImage(R,0,0,X,ye),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+K.width+"x"+K.height+") to ("+X+"x"+ye+")."),ae}else return"data"in R&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+K.width+"x"+K.height+")."),R;return R}function m(R){return R.generateMipmaps}function p(R){r.generateMipmap(R)}function E(R){return R.isWebGLCubeRenderTarget?r.TEXTURE_CUBE_MAP:R.isWebGL3DRenderTarget?r.TEXTURE_3D:R.isWebGLArrayRenderTarget||R.isCompressedArrayTexture?r.TEXTURE_2D_ARRAY:r.TEXTURE_2D}function _(R,S,G,$,K=!1){if(R!==null){if(r[R]!==void 0)return r[R];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let X=S;if(S===r.RED&&(G===r.FLOAT&&(X=r.R32F),G===r.HALF_FLOAT&&(X=r.R16F),G===r.UNSIGNED_BYTE&&(X=r.R8)),S===r.RED_INTEGER&&(G===r.UNSIGNED_BYTE&&(X=r.R8UI),G===r.UNSIGNED_SHORT&&(X=r.R16UI),G===r.UNSIGNED_INT&&(X=r.R32UI),G===r.BYTE&&(X=r.R8I),G===r.SHORT&&(X=r.R16I),G===r.INT&&(X=r.R32I)),S===r.RG&&(G===r.FLOAT&&(X=r.RG32F),G===r.HALF_FLOAT&&(X=r.RG16F),G===r.UNSIGNED_BYTE&&(X=r.RG8)),S===r.RG_INTEGER&&(G===r.UNSIGNED_BYTE&&(X=r.RG8UI),G===r.UNSIGNED_SHORT&&(X=r.RG16UI),G===r.UNSIGNED_INT&&(X=r.RG32UI),G===r.BYTE&&(X=r.RG8I),G===r.SHORT&&(X=r.RG16I),G===r.INT&&(X=r.RG32I)),S===r.RGB_INTEGER&&(G===r.UNSIGNED_BYTE&&(X=r.RGB8UI),G===r.UNSIGNED_SHORT&&(X=r.RGB16UI),G===r.UNSIGNED_INT&&(X=r.RGB32UI),G===r.BYTE&&(X=r.RGB8I),G===r.SHORT&&(X=r.RGB16I),G===r.INT&&(X=r.RGB32I)),S===r.RGBA_INTEGER&&(G===r.UNSIGNED_BYTE&&(X=r.RGBA8UI),G===r.UNSIGNED_SHORT&&(X=r.RGBA16UI),G===r.UNSIGNED_INT&&(X=r.RGBA32UI),G===r.BYTE&&(X=r.RGBA8I),G===r.SHORT&&(X=r.RGBA16I),G===r.INT&&(X=r.RGBA32I)),S===r.RGB&&G===r.UNSIGNED_INT_5_9_9_9_REV&&(X=r.RGB9_E5),S===r.RGBA){const ye=K?Oc:Je.getTransfer($);G===r.FLOAT&&(X=r.RGBA32F),G===r.HALF_FLOAT&&(X=r.RGBA16F),G===r.UNSIGNED_BYTE&&(X=ye===ut?r.SRGB8_ALPHA8:r.RGBA8),G===r.UNSIGNED_SHORT_4_4_4_4&&(X=r.RGBA4),G===r.UNSIGNED_SHORT_5_5_5_1&&(X=r.RGB5_A1)}return(X===r.R16F||X===r.R32F||X===r.RG16F||X===r.RG32F||X===r.RGBA16F||X===r.RGBA32F)&&e.get("EXT_color_buffer_float"),X}function b(R,S){let G;return R?S===null||S===ts||S===ja?G=r.DEPTH24_STENCIL8:S===Lt?G=r.DEPTH32F_STENCIL8:S===$a&&(G=r.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):S===null||S===ts||S===ja?G=r.DEPTH_COMPONENT24:S===Lt?G=r.DEPTH_COMPONENT32F:S===$a&&(G=r.DEPTH_COMPONENT16),G}function x(R,S){return m(R)===!0||R.isFramebufferTexture&&R.minFilter!==Ot&&R.minFilter!==Ze?Math.log2(Math.max(S.width,S.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?S.mipmaps.length:1}function I(R){const S=R.target;S.removeEventListener("dispose",I),w(S),S.isVideoTexture&&u.delete(S)}function M(R){const S=R.target;S.removeEventListener("dispose",M),y(S)}function w(R){const S=n.get(R);if(S.__webglInit===void 0)return;const G=R.source,$=d.get(G);if($){const K=$[S.__cacheKey];K.usedTimes--,K.usedTimes===0&&v(R),Object.keys($).length===0&&d.delete(G)}n.remove(R)}function v(R){const S=n.get(R);r.deleteTexture(S.__webglTexture);const G=R.source,$=d.get(G);delete $[S.__cacheKey],a.memory.textures--}function y(R){const S=n.get(R);if(R.depthTexture&&(R.depthTexture.dispose(),n.remove(R.depthTexture)),R.isWebGLCubeRenderTarget)for(let $=0;$<6;$++){if(Array.isArray(S.__webglFramebuffer[$]))for(let K=0;K<S.__webglFramebuffer[$].length;K++)r.deleteFramebuffer(S.__webglFramebuffer[$][K]);else r.deleteFramebuffer(S.__webglFramebuffer[$]);S.__webglDepthbuffer&&r.deleteRenderbuffer(S.__webglDepthbuffer[$])}else{if(Array.isArray(S.__webglFramebuffer))for(let $=0;$<S.__webglFramebuffer.length;$++)r.deleteFramebuffer(S.__webglFramebuffer[$]);else r.deleteFramebuffer(S.__webglFramebuffer);if(S.__webglDepthbuffer&&r.deleteRenderbuffer(S.__webglDepthbuffer),S.__webglMultisampledFramebuffer&&r.deleteFramebuffer(S.__webglMultisampledFramebuffer),S.__webglColorRenderbuffer)for(let $=0;$<S.__webglColorRenderbuffer.length;$++)S.__webglColorRenderbuffer[$]&&r.deleteRenderbuffer(S.__webglColorRenderbuffer[$]);S.__webglDepthRenderbuffer&&r.deleteRenderbuffer(S.__webglDepthRenderbuffer)}const G=R.textures;for(let $=0,K=G.length;$<K;$++){const X=n.get(G[$]);X.__webglTexture&&(r.deleteTexture(X.__webglTexture),a.memory.textures--),n.remove(G[$])}n.remove(R)}let T=0;function k(){T=0}function U(){const R=T;return R>=i.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+R+" texture units while this GPU supports only "+i.maxTextures),T+=1,R}function F(R){const S=[];return S.push(R.wrapS),S.push(R.wrapT),S.push(R.wrapR||0),S.push(R.magFilter),S.push(R.minFilter),S.push(R.anisotropy),S.push(R.internalFormat),S.push(R.format),S.push(R.type),S.push(R.generateMipmaps),S.push(R.premultiplyAlpha),S.push(R.flipY),S.push(R.unpackAlignment),S.push(R.colorSpace),S.join()}function H(R,S){const G=n.get(R);if(R.isVideoTexture&&Xe(R),R.isRenderTargetTexture===!1&&R.isExternalTexture!==!0&&R.version>0&&G.__version!==R.version){const $=R.image;if($===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if($.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{oe(G,R,S);return}}else R.isExternalTexture&&(G.__webglTexture=R.sourceTexture?R.sourceTexture:null);t.bindTexture(r.TEXTURE_2D,G.__webglTexture,r.TEXTURE0+S)}function O(R,S){const G=n.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&G.__version!==R.version){oe(G,R,S);return}t.bindTexture(r.TEXTURE_2D_ARRAY,G.__webglTexture,r.TEXTURE0+S)}function W(R,S){const G=n.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&G.__version!==R.version){oe(G,R,S);return}t.bindTexture(r.TEXTURE_3D,G.__webglTexture,r.TEXTURE0+S)}function Q(R,S){const G=n.get(R);if(R.version>0&&G.__version!==R.version){se(G,R,S);return}t.bindTexture(r.TEXTURE_CUBE_MAP,G.__webglTexture,r.TEXTURE0+S)}const Y={[$n]:r.REPEAT,[Dt]:r.CLAMP_TO_EDGE,[Ns]:r.MIRRORED_REPEAT},Z={[Ot]:r.NEAREST,[lo]:r.NEAREST_MIPMAP_NEAREST,[ji]:r.NEAREST_MIPMAP_LINEAR,[Ze]:r.LINEAR,[Rs]:r.LINEAR_MIPMAP_NEAREST,[hn]:r.LINEAR_MIPMAP_LINEAR},re={[f_]:r.NEVER,[__]:r.ALWAYS,[p_]:r.LESS,[_g]:r.LEQUAL,[A_]:r.EQUAL,[b_]:r.GEQUAL,[m_]:r.GREATER,[g_]:r.NOTEQUAL};function fe(R,S){if(S.type===Lt&&e.has("OES_texture_float_linear")===!1&&(S.magFilter===Ze||S.magFilter===Rs||S.magFilter===ji||S.magFilter===hn||S.minFilter===Ze||S.minFilter===Rs||S.minFilter===ji||S.minFilter===hn)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),r.texParameteri(R,r.TEXTURE_WRAP_S,Y[S.wrapS]),r.texParameteri(R,r.TEXTURE_WRAP_T,Y[S.wrapT]),(R===r.TEXTURE_3D||R===r.TEXTURE_2D_ARRAY)&&r.texParameteri(R,r.TEXTURE_WRAP_R,Y[S.wrapR]),r.texParameteri(R,r.TEXTURE_MAG_FILTER,Z[S.magFilter]),r.texParameteri(R,r.TEXTURE_MIN_FILTER,Z[S.minFilter]),S.compareFunction&&(r.texParameteri(R,r.TEXTURE_COMPARE_MODE,r.COMPARE_REF_TO_TEXTURE),r.texParameteri(R,r.TEXTURE_COMPARE_FUNC,re[S.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(S.magFilter===Ot||S.minFilter!==ji&&S.minFilter!==hn||S.type===Lt&&e.has("OES_texture_float_linear")===!1)return;if(S.anisotropy>1||n.get(S).__currentAnisotropy){const G=e.get("EXT_texture_filter_anisotropic");r.texParameterf(R,G.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(S.anisotropy,i.getMaxAnisotropy())),n.get(S).__currentAnisotropy=S.anisotropy}}}function Be(R,S){let G=!1;R.__webglInit===void 0&&(R.__webglInit=!0,S.addEventListener("dispose",I));const $=S.source;let K=d.get($);K===void 0&&(K={},d.set($,K));const X=F(S);if(X!==R.__cacheKey){K[X]===void 0&&(K[X]={texture:r.createTexture(),usedTimes:0},a.memory.textures++,G=!0),K[X].usedTimes++;const ye=K[R.__cacheKey];ye!==void 0&&(K[R.__cacheKey].usedTimes--,ye.usedTimes===0&&v(S)),R.__cacheKey=X,R.__webglTexture=K[X].texture}return G}function Ge(R,S,G){return Math.floor(Math.floor(R/G)/S)}function q(R,S,G,$){const X=R.updateRanges;if(X.length===0)t.texSubImage2D(r.TEXTURE_2D,0,0,0,S.width,S.height,G,$,S.data);else{X.sort((ne,de)=>ne.start-de.start);let ye=0;for(let ne=1;ne<X.length;ne++){const de=X[ye],Fe=X[ne],ve=de.start+de.count,he=Ge(Fe.start,S.width,4),ze=Ge(de.start,S.width,4);Fe.start<=ve+1&&he===ze&&Ge(Fe.start+Fe.count-1,S.width,4)===he?de.count=Math.max(de.count,Fe.start+Fe.count-de.start):(++ye,X[ye]=Fe)}X.length=ye+1;const ae=r.getParameter(r.UNPACK_ROW_LENGTH),Ee=r.getParameter(r.UNPACK_SKIP_PIXELS),xe=r.getParameter(r.UNPACK_SKIP_ROWS);r.pixelStorei(r.UNPACK_ROW_LENGTH,S.width);for(let ne=0,de=X.length;ne<de;ne++){const Fe=X[ne],ve=Math.floor(Fe.start/4),he=Math.ceil(Fe.count/4),ze=ve%S.width,L=Math.floor(ve/S.width),ie=he,ce=1;r.pixelStorei(r.UNPACK_SKIP_PIXELS,ze),r.pixelStorei(r.UNPACK_SKIP_ROWS,L),t.texSubImage2D(r.TEXTURE_2D,0,ze,L,ie,ce,G,$,S.data)}R.clearUpdateRanges(),r.pixelStorei(r.UNPACK_ROW_LENGTH,ae),r.pixelStorei(r.UNPACK_SKIP_PIXELS,Ee),r.pixelStorei(r.UNPACK_SKIP_ROWS,xe)}}function oe(R,S,G){let $=r.TEXTURE_2D;(S.isDataArrayTexture||S.isCompressedArrayTexture)&&($=r.TEXTURE_2D_ARRAY),S.isData3DTexture&&($=r.TEXTURE_3D);const K=Be(R,S),X=S.source;t.bindTexture($,R.__webglTexture,r.TEXTURE0+G);const ye=n.get(X);if(X.version!==ye.__version||K===!0){t.activeTexture(r.TEXTURE0+G);const ae=Je.getPrimaries(Je.workingColorSpace),Ee=S.colorSpace===Dn?null:Je.getPrimaries(S.colorSpace),xe=S.colorSpace===Dn||ae===Ee?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,S.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,S.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,xe);let ne=g(S.image,!1,i.maxTextureSize);ne=Gt(S,ne);const de=s.convert(S.format,S.colorSpace),Fe=s.convert(S.type);let ve=_(S.internalFormat,de,Fe,S.colorSpace,S.isVideoTexture);fe($,S);let he;const ze=S.mipmaps,L=S.isVideoTexture!==!0,ie=ye.__version===void 0||K===!0,ce=X.dataReady,me=x(S,ne);if(S.isDepthTexture)ve=b(S.format===Ka,S.type),ie&&(L?t.texStorage2D(r.TEXTURE_2D,1,ve,ne.width,ne.height):t.texImage2D(r.TEXTURE_2D,0,ve,ne.width,ne.height,0,de,Fe,null));else if(S.isDataTexture)if(ze.length>0){L&&ie&&t.texStorage2D(r.TEXTURE_2D,me,ve,ze[0].width,ze[0].height);for(let ee=0,j=ze.length;ee<j;ee++)he=ze[ee],L?ce&&t.texSubImage2D(r.TEXTURE_2D,ee,0,0,he.width,he.height,de,Fe,he.data):t.texImage2D(r.TEXTURE_2D,ee,ve,he.width,he.height,0,de,Fe,he.data);S.generateMipmaps=!1}else L?(ie&&t.texStorage2D(r.TEXTURE_2D,me,ve,ne.width,ne.height),ce&&q(S,ne,de,Fe)):t.texImage2D(r.TEXTURE_2D,0,ve,ne.width,ne.height,0,de,Fe,ne.data);else if(S.isCompressedTexture)if(S.isCompressedArrayTexture){L&&ie&&t.texStorage3D(r.TEXTURE_2D_ARRAY,me,ve,ze[0].width,ze[0].height,ne.depth);for(let ee=0,j=ze.length;ee<j;ee++)if(he=ze[ee],S.format!==xt)if(de!==null)if(L){if(ce)if(S.layerUpdates.size>0){const _e=Gf(he.width,he.height,S.format,S.type);for(const He of S.layerUpdates){const At=he.data.subarray(He*_e/he.data.BYTES_PER_ELEMENT,(He+1)*_e/he.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,ee,0,0,He,he.width,he.height,1,de,At)}S.clearLayerUpdates()}else t.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,ee,0,0,0,he.width,he.height,ne.depth,de,he.data)}else t.compressedTexImage3D(r.TEXTURE_2D_ARRAY,ee,ve,he.width,he.height,ne.depth,0,he.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else L?ce&&t.texSubImage3D(r.TEXTURE_2D_ARRAY,ee,0,0,0,he.width,he.height,ne.depth,de,Fe,he.data):t.texImage3D(r.TEXTURE_2D_ARRAY,ee,ve,he.width,he.height,ne.depth,0,de,Fe,he.data)}else{L&&ie&&t.texStorage2D(r.TEXTURE_2D,me,ve,ze[0].width,ze[0].height);for(let ee=0,j=ze.length;ee<j;ee++)he=ze[ee],S.format!==xt?de!==null?L?ce&&t.compressedTexSubImage2D(r.TEXTURE_2D,ee,0,0,he.width,he.height,de,he.data):t.compressedTexImage2D(r.TEXTURE_2D,ee,ve,he.width,he.height,0,he.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):L?ce&&t.texSubImage2D(r.TEXTURE_2D,ee,0,0,he.width,he.height,de,Fe,he.data):t.texImage2D(r.TEXTURE_2D,ee,ve,he.width,he.height,0,de,Fe,he.data)}else if(S.isDataArrayTexture)if(L){if(ie&&t.texStorage3D(r.TEXTURE_2D_ARRAY,me,ve,ne.width,ne.height,ne.depth),ce)if(S.layerUpdates.size>0){const ee=Gf(ne.width,ne.height,S.format,S.type);for(const j of S.layerUpdates){const _e=ne.data.subarray(j*ee/ne.data.BYTES_PER_ELEMENT,(j+1)*ee/ne.data.BYTES_PER_ELEMENT);t.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,j,ne.width,ne.height,1,de,Fe,_e)}S.clearLayerUpdates()}else t.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,0,ne.width,ne.height,ne.depth,de,Fe,ne.data)}else t.texImage3D(r.TEXTURE_2D_ARRAY,0,ve,ne.width,ne.height,ne.depth,0,de,Fe,ne.data);else if(S.isData3DTexture)L?(ie&&t.texStorage3D(r.TEXTURE_3D,me,ve,ne.width,ne.height,ne.depth),ce&&t.texSubImage3D(r.TEXTURE_3D,0,0,0,0,ne.width,ne.height,ne.depth,de,Fe,ne.data)):t.texImage3D(r.TEXTURE_3D,0,ve,ne.width,ne.height,ne.depth,0,de,Fe,ne.data);else if(S.isFramebufferTexture){if(ie)if(L)t.texStorage2D(r.TEXTURE_2D,me,ve,ne.width,ne.height);else{let ee=ne.width,j=ne.height;for(let _e=0;_e<me;_e++)t.texImage2D(r.TEXTURE_2D,_e,ve,ee,j,0,de,Fe,null),ee>>=1,j>>=1}}else if(ze.length>0){if(L&&ie){const ee=Ft(ze[0]);t.texStorage2D(r.TEXTURE_2D,me,ve,ee.width,ee.height)}for(let ee=0,j=ze.length;ee<j;ee++)he=ze[ee],L?ce&&t.texSubImage2D(r.TEXTURE_2D,ee,0,0,de,Fe,he):t.texImage2D(r.TEXTURE_2D,ee,ve,de,Fe,he);S.generateMipmaps=!1}else if(L){if(ie){const ee=Ft(ne);t.texStorage2D(r.TEXTURE_2D,me,ve,ee.width,ee.height)}ce&&t.texSubImage2D(r.TEXTURE_2D,0,0,0,de,Fe,ne)}else t.texImage2D(r.TEXTURE_2D,0,ve,de,Fe,ne);m(S)&&p($),ye.__version=X.version,S.onUpdate&&S.onUpdate(S)}R.__version=S.version}function se(R,S,G){if(S.image.length!==6)return;const $=Be(R,S),K=S.source;t.bindTexture(r.TEXTURE_CUBE_MAP,R.__webglTexture,r.TEXTURE0+G);const X=n.get(K);if(K.version!==X.__version||$===!0){t.activeTexture(r.TEXTURE0+G);const ye=Je.getPrimaries(Je.workingColorSpace),ae=S.colorSpace===Dn?null:Je.getPrimaries(S.colorSpace),Ee=S.colorSpace===Dn||ye===ae?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,S.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,S.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ee);const xe=S.isCompressedTexture||S.image[0].isCompressedTexture,ne=S.image[0]&&S.image[0].isDataTexture,de=[];for(let j=0;j<6;j++)!xe&&!ne?de[j]=g(S.image[j],!0,i.maxCubemapSize):de[j]=ne?S.image[j].image:S.image[j],de[j]=Gt(S,de[j]);const Fe=de[0],ve=s.convert(S.format,S.colorSpace),he=s.convert(S.type),ze=_(S.internalFormat,ve,he,S.colorSpace),L=S.isVideoTexture!==!0,ie=X.__version===void 0||$===!0,ce=K.dataReady;let me=x(S,Fe);fe(r.TEXTURE_CUBE_MAP,S);let ee;if(xe){L&&ie&&t.texStorage2D(r.TEXTURE_CUBE_MAP,me,ze,Fe.width,Fe.height);for(let j=0;j<6;j++){ee=de[j].mipmaps;for(let _e=0;_e<ee.length;_e++){const He=ee[_e];S.format!==xt?ve!==null?L?ce&&t.compressedTexSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+j,_e,0,0,He.width,He.height,ve,He.data):t.compressedTexImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+j,_e,ze,He.width,He.height,0,He.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):L?ce&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+j,_e,0,0,He.width,He.height,ve,he,He.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+j,_e,ze,He.width,He.height,0,ve,he,He.data)}}}else{if(ee=S.mipmaps,L&&ie){ee.length>0&&me++;const j=Ft(de[0]);t.texStorage2D(r.TEXTURE_CUBE_MAP,me,ze,j.width,j.height)}for(let j=0;j<6;j++)if(ne){L?ce&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,0,0,de[j].width,de[j].height,ve,he,de[j].data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,ze,de[j].width,de[j].height,0,ve,he,de[j].data);for(let _e=0;_e<ee.length;_e++){const At=ee[_e].image[j].image;L?ce&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+j,_e+1,0,0,At.width,At.height,ve,he,At.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+j,_e+1,ze,At.width,At.height,0,ve,he,At.data)}}else{L?ce&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,0,0,ve,he,de[j]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,ze,ve,he,de[j]);for(let _e=0;_e<ee.length;_e++){const He=ee[_e];L?ce&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+j,_e+1,0,0,ve,he,He.image[j]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+j,_e+1,ze,ve,he,He.image[j])}}}m(S)&&p(r.TEXTURE_CUBE_MAP),X.__version=K.version,S.onUpdate&&S.onUpdate(S)}R.__version=S.version}function Ce(R,S,G,$,K,X){const ye=s.convert(G.format,G.colorSpace),ae=s.convert(G.type),Ee=_(G.internalFormat,ye,ae,G.colorSpace),xe=n.get(S),ne=n.get(G);if(ne.__renderTarget=S,!xe.__hasExternalTextures){const de=Math.max(1,S.width>>X),Fe=Math.max(1,S.height>>X);K===r.TEXTURE_3D||K===r.TEXTURE_2D_ARRAY?t.texImage3D(K,X,Ee,de,Fe,S.depth,0,ye,ae,null):t.texImage2D(K,X,Ee,de,Fe,0,ye,ae,null)}t.bindFramebuffer(r.FRAMEBUFFER,R),ge(S)?o.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,$,K,ne.__webglTexture,0,Ct(S)):(K===r.TEXTURE_2D||K>=r.TEXTURE_CUBE_MAP_POSITIVE_X&&K<=r.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&r.framebufferTexture2D(r.FRAMEBUFFER,$,K,ne.__webglTexture,X),t.bindFramebuffer(r.FRAMEBUFFER,null)}function we(R,S,G){if(r.bindRenderbuffer(r.RENDERBUFFER,R),S.depthBuffer){const $=S.depthTexture,K=$&&$.isDepthTexture?$.type:null,X=b(S.stencilBuffer,K),ye=S.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,ae=Ct(S);ge(S)?o.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,ae,X,S.width,S.height):G?r.renderbufferStorageMultisample(r.RENDERBUFFER,ae,X,S.width,S.height):r.renderbufferStorage(r.RENDERBUFFER,X,S.width,S.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,ye,r.RENDERBUFFER,R)}else{const $=S.textures;for(let K=0;K<$.length;K++){const X=$[K],ye=s.convert(X.format,X.colorSpace),ae=s.convert(X.type),Ee=_(X.internalFormat,ye,ae,X.colorSpace),xe=Ct(S);G&&ge(S)===!1?r.renderbufferStorageMultisample(r.RENDERBUFFER,xe,Ee,S.width,S.height):ge(S)?o.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,xe,Ee,S.width,S.height):r.renderbufferStorage(r.RENDERBUFFER,Ee,S.width,S.height)}}r.bindRenderbuffer(r.RENDERBUFFER,null)}function Oe(R,S){if(S&&S.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(r.FRAMEBUFFER,R),!(S.depthTexture&&S.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const $=n.get(S.depthTexture);$.__renderTarget=S,(!$.__webglTexture||S.depthTexture.image.width!==S.width||S.depthTexture.image.height!==S.height)&&(S.depthTexture.image.width=S.width,S.depthTexture.image.height=S.height,S.depthTexture.needsUpdate=!0),H(S.depthTexture,0);const K=$.__webglTexture,X=Ct(S);if(S.depthTexture.format===Ya)ge(S)?o.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,K,0,X):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,K,0);else if(S.depthTexture.format===Ka)ge(S)?o.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,K,0,X):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,K,0);else throw new Error("Unknown depthTexture format")}function St(R){const S=n.get(R),G=R.isWebGLCubeRenderTarget===!0;if(S.__boundDepthTexture!==R.depthTexture){const $=R.depthTexture;if(S.__depthDisposeCallback&&S.__depthDisposeCallback(),$){const K=()=>{delete S.__boundDepthTexture,delete S.__depthDisposeCallback,$.removeEventListener("dispose",K)};$.addEventListener("dispose",K),S.__depthDisposeCallback=K}S.__boundDepthTexture=$}if(R.depthTexture&&!S.__autoAllocateDepthBuffer){if(G)throw new Error("target.depthTexture not supported in Cube render targets");const $=R.texture.mipmaps;$&&$.length>0?Oe(S.__webglFramebuffer[0],R):Oe(S.__webglFramebuffer,R)}else if(G){S.__webglDepthbuffer=[];for(let $=0;$<6;$++)if(t.bindFramebuffer(r.FRAMEBUFFER,S.__webglFramebuffer[$]),S.__webglDepthbuffer[$]===void 0)S.__webglDepthbuffer[$]=r.createRenderbuffer(),we(S.__webglDepthbuffer[$],R,!1);else{const K=R.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,X=S.__webglDepthbuffer[$];r.bindRenderbuffer(r.RENDERBUFFER,X),r.framebufferRenderbuffer(r.FRAMEBUFFER,K,r.RENDERBUFFER,X)}}else{const $=R.texture.mipmaps;if($&&$.length>0?t.bindFramebuffer(r.FRAMEBUFFER,S.__webglFramebuffer[0]):t.bindFramebuffer(r.FRAMEBUFFER,S.__webglFramebuffer),S.__webglDepthbuffer===void 0)S.__webglDepthbuffer=r.createRenderbuffer(),we(S.__webglDepthbuffer,R,!1);else{const K=R.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,X=S.__webglDepthbuffer;r.bindRenderbuffer(r.RENDERBUFFER,X),r.framebufferRenderbuffer(r.FRAMEBUFFER,K,r.RENDERBUFFER,X)}}t.bindFramebuffer(r.FRAMEBUFFER,null)}function Ye(R,S,G){const $=n.get(R);S!==void 0&&Ce($.__webglFramebuffer,R,R.texture,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,0),G!==void 0&&St(R)}function D(R){const S=R.texture,G=n.get(R),$=n.get(S);R.addEventListener("dispose",M);const K=R.textures,X=R.isWebGLCubeRenderTarget===!0,ye=K.length>1;if(ye||($.__webglTexture===void 0&&($.__webglTexture=r.createTexture()),$.__version=S.version,a.memory.textures++),X){G.__webglFramebuffer=[];for(let ae=0;ae<6;ae++)if(S.mipmaps&&S.mipmaps.length>0){G.__webglFramebuffer[ae]=[];for(let Ee=0;Ee<S.mipmaps.length;Ee++)G.__webglFramebuffer[ae][Ee]=r.createFramebuffer()}else G.__webglFramebuffer[ae]=r.createFramebuffer()}else{if(S.mipmaps&&S.mipmaps.length>0){G.__webglFramebuffer=[];for(let ae=0;ae<S.mipmaps.length;ae++)G.__webglFramebuffer[ae]=r.createFramebuffer()}else G.__webglFramebuffer=r.createFramebuffer();if(ye)for(let ae=0,Ee=K.length;ae<Ee;ae++){const xe=n.get(K[ae]);xe.__webglTexture===void 0&&(xe.__webglTexture=r.createTexture(),a.memory.textures++)}if(R.samples>0&&ge(R)===!1){G.__webglMultisampledFramebuffer=r.createFramebuffer(),G.__webglColorRenderbuffer=[],t.bindFramebuffer(r.FRAMEBUFFER,G.__webglMultisampledFramebuffer);for(let ae=0;ae<K.length;ae++){const Ee=K[ae];G.__webglColorRenderbuffer[ae]=r.createRenderbuffer(),r.bindRenderbuffer(r.RENDERBUFFER,G.__webglColorRenderbuffer[ae]);const xe=s.convert(Ee.format,Ee.colorSpace),ne=s.convert(Ee.type),de=_(Ee.internalFormat,xe,ne,Ee.colorSpace,R.isXRRenderTarget===!0),Fe=Ct(R);r.renderbufferStorageMultisample(r.RENDERBUFFER,Fe,de,R.width,R.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+ae,r.RENDERBUFFER,G.__webglColorRenderbuffer[ae])}r.bindRenderbuffer(r.RENDERBUFFER,null),R.depthBuffer&&(G.__webglDepthRenderbuffer=r.createRenderbuffer(),we(G.__webglDepthRenderbuffer,R,!0)),t.bindFramebuffer(r.FRAMEBUFFER,null)}}if(X){t.bindTexture(r.TEXTURE_CUBE_MAP,$.__webglTexture),fe(r.TEXTURE_CUBE_MAP,S);for(let ae=0;ae<6;ae++)if(S.mipmaps&&S.mipmaps.length>0)for(let Ee=0;Ee<S.mipmaps.length;Ee++)Ce(G.__webglFramebuffer[ae][Ee],R,S,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+ae,Ee);else Ce(G.__webglFramebuffer[ae],R,S,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0);m(S)&&p(r.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(ye){for(let ae=0,Ee=K.length;ae<Ee;ae++){const xe=K[ae],ne=n.get(xe);let de=r.TEXTURE_2D;(R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(de=R.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY),t.bindTexture(de,ne.__webglTexture),fe(de,xe),Ce(G.__webglFramebuffer,R,xe,r.COLOR_ATTACHMENT0+ae,de,0),m(xe)&&p(de)}t.unbindTexture()}else{let ae=r.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(ae=R.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY),t.bindTexture(ae,$.__webglTexture),fe(ae,S),S.mipmaps&&S.mipmaps.length>0)for(let Ee=0;Ee<S.mipmaps.length;Ee++)Ce(G.__webglFramebuffer[Ee],R,S,r.COLOR_ATTACHMENT0,ae,Ee);else Ce(G.__webglFramebuffer,R,S,r.COLOR_ATTACHMENT0,ae,0);m(S)&&p(ae),t.unbindTexture()}R.depthBuffer&&St(R)}function st(R){const S=R.textures;for(let G=0,$=S.length;G<$;G++){const K=S[G];if(m(K)){const X=E(R),ye=n.get(K).__webglTexture;t.bindTexture(X,ye),p(X),t.unbindTexture()}}}const Te=[],nt=[];function Se(R){if(R.samples>0){if(ge(R)===!1){const S=R.textures,G=R.width,$=R.height;let K=r.COLOR_BUFFER_BIT;const X=R.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,ye=n.get(R),ae=S.length>1;if(ae)for(let xe=0;xe<S.length;xe++)t.bindFramebuffer(r.FRAMEBUFFER,ye.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+xe,r.RENDERBUFFER,null),t.bindFramebuffer(r.FRAMEBUFFER,ye.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+xe,r.TEXTURE_2D,null,0);t.bindFramebuffer(r.READ_FRAMEBUFFER,ye.__webglMultisampledFramebuffer);const Ee=R.texture.mipmaps;Ee&&Ee.length>0?t.bindFramebuffer(r.DRAW_FRAMEBUFFER,ye.__webglFramebuffer[0]):t.bindFramebuffer(r.DRAW_FRAMEBUFFER,ye.__webglFramebuffer);for(let xe=0;xe<S.length;xe++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(K|=r.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(K|=r.STENCIL_BUFFER_BIT)),ae){r.framebufferRenderbuffer(r.READ_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.RENDERBUFFER,ye.__webglColorRenderbuffer[xe]);const ne=n.get(S[xe]).__webglTexture;r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,ne,0)}r.blitFramebuffer(0,0,G,$,0,0,G,$,K,r.NEAREST),c===!0&&(Te.length=0,nt.length=0,Te.push(r.COLOR_ATTACHMENT0+xe),R.depthBuffer&&R.resolveDepthBuffer===!1&&(Te.push(X),nt.push(X),r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,nt)),r.invalidateFramebuffer(r.READ_FRAMEBUFFER,Te))}if(t.bindFramebuffer(r.READ_FRAMEBUFFER,null),t.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),ae)for(let xe=0;xe<S.length;xe++){t.bindFramebuffer(r.FRAMEBUFFER,ye.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+xe,r.RENDERBUFFER,ye.__webglColorRenderbuffer[xe]);const ne=n.get(S[xe]).__webglTexture;t.bindFramebuffer(r.FRAMEBUFFER,ye.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+xe,r.TEXTURE_2D,ne,0)}t.bindFramebuffer(r.DRAW_FRAMEBUFFER,ye.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.resolveDepthBuffer===!1&&c){const S=R.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,[S])}}}function Ct(R){return Math.min(i.maxSamples,R.samples)}function ge(R){const S=n.get(R);return R.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&S.__useRenderToTexture!==!1}function Xe(R){const S=a.render.frame;u.get(R)!==S&&(u.set(R,S),R.update())}function Gt(R,S){const G=R.colorSpace,$=R.format,K=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||G!==gt&&G!==Dn&&(Je.getTransfer(G)===ut?($!==xt||K!==It)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",G)),S}function Ft(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(l.width=R.naturalWidth||R.width,l.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(l.width=R.displayWidth,l.height=R.displayHeight):(l.width=R.width,l.height=R.height),l}this.allocateTextureUnit=U,this.resetTextureUnits=k,this.setTexture2D=H,this.setTexture2DArray=O,this.setTexture3D=W,this.setTextureCube=Q,this.rebindTextures=Ye,this.setupRenderTarget=D,this.updateRenderTargetMipmap=st,this.updateMultisampleRenderTarget=Se,this.setupDepthRenderbuffer=St,this.setupFrameBufferTexture=Ce,this.useMultisampledRTT=ge}function BC(r,e){function t(n,i=Dn){let s;const a=Je.getTransfer(i);if(n===It)return r.UNSIGNED_BYTE;if(n===pd)return r.UNSIGNED_SHORT_4_4_4_4;if(n===Ad)return r.UNSIGNED_SHORT_5_5_5_1;if(n===fg)return r.UNSIGNED_INT_5_9_9_9_REV;if(n===dd)return r.BYTE;if(n===fd)return r.SHORT;if(n===$a)return r.UNSIGNED_SHORT;if(n===tl)return r.INT;if(n===ts)return r.UNSIGNED_INT;if(n===Lt)return r.FLOAT;if(n===Nt)return r.HALF_FLOAT;if(n===pg)return r.ALPHA;if(n===Ag)return r.RGB;if(n===xt)return r.RGBA;if(n===Ya)return r.DEPTH_COMPONENT;if(n===Ka)return r.DEPTH_STENCIL;if(n===Yi)return r.RED;if(n===md)return r.RED_INTEGER;if(n===ws)return r.RG;if(n===gd)return r.RG_INTEGER;if(n===bd)return r.RGBA_INTEGER;if(n===Br||n===Bs||n===Dr||n===Ds)if(a===ut)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(n===Br)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Bs)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Dr)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Ds)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(n===Br)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Bs)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Dr)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Ds)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Dc||n===yu||n===Lc||n===Su)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(n===Dc)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===yu)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Lc)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Su)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Fc||n===Ja||n===Za)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(n===Fc||n===Ja)return a===ut?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(n===Za)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===Ls||n===Cu||n===Iu||n===Mu||n===eo||n===wu||n===Tu||n===Ru||n===Bu||n===Du||n===Lu||n===Fu||n===Pu||n===Uu)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(n===Ls)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Cu)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Iu)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Mu)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===eo)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===wu)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Tu)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Ru)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Bu)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Du)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Lu)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Fu)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Pu)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Uu)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Fs||n===Nu||n===Pc)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(n===Fs)return a===ut?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Nu)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Pc)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===mg||n===Ou||n===ku||n===Qu)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(n===Fs)return s.COMPRESSED_RED_RGTC1_EXT;if(n===Ou)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===ku)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Qu)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===ja?r.UNSIGNED_INT_24_8:r[n]!==void 0?r[n]:null}return{convert:t}}class Xg extends vt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}}const DC=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,LC=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class FC{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const n=new Xg(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new In({vertexShader:DC,fragmentShader:LC,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new dt(new Fi(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class PC extends jn{constructor(e,t){super();const n=this;let i=null,s=1,a=null,o="local-floor",c=1,l=null,u=null,h=null,d=null,f=null,A=null;const g=new FC,m={},p=t.getContextAttributes();let E=null,_=null;const b=[],x=[],I=new ke;let M=null;const w=new $t;w.viewport=new it;const v=new $t;v.viewport=new it;const y=[w,v],T=new HE;let k=null,U=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(q){let oe=b[q];return oe===void 0&&(oe=new Ll,b[q]=oe),oe.getTargetRaySpace()},this.getControllerGrip=function(q){let oe=b[q];return oe===void 0&&(oe=new Ll,b[q]=oe),oe.getGripSpace()},this.getHand=function(q){let oe=b[q];return oe===void 0&&(oe=new Ll,b[q]=oe),oe.getHandSpace()};function F(q){const oe=x.indexOf(q.inputSource);if(oe===-1)return;const se=b[oe];se!==void 0&&(se.update(q.inputSource,q.frame,l||a),se.dispatchEvent({type:q.type,data:q.inputSource}))}function H(){i.removeEventListener("select",F),i.removeEventListener("selectstart",F),i.removeEventListener("selectend",F),i.removeEventListener("squeeze",F),i.removeEventListener("squeezestart",F),i.removeEventListener("squeezeend",F),i.removeEventListener("end",H),i.removeEventListener("inputsourceschange",O);for(let q=0;q<b.length;q++){const oe=x[q];oe!==null&&(x[q]=null,b[q].disconnect(oe))}k=null,U=null,g.reset();for(const q in m)delete m[q];e.setRenderTarget(E),f=null,d=null,h=null,i=null,_=null,Ge.stop(),n.isPresenting=!1,e.setPixelRatio(M),e.setSize(I.width,I.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(q){s=q,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(q){o=q,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||a},this.setReferenceSpace=function(q){l=q},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return h},this.getFrame=function(){return A},this.getSession=function(){return i},this.setSession=async function(q){if(i=q,i!==null){if(E=e.getRenderTarget(),i.addEventListener("select",F),i.addEventListener("selectstart",F),i.addEventListener("selectend",F),i.addEventListener("squeeze",F),i.addEventListener("squeezestart",F),i.addEventListener("squeezeend",F),i.addEventListener("end",H),i.addEventListener("inputsourceschange",O),p.xrCompatible!==!0&&await t.makeXRCompatible(),M=e.getPixelRatio(),e.getSize(I),typeof XRWebGLBinding<"u"&&(h=new XRWebGLBinding(i,t)),h!==null&&"createProjectionLayer"in XRWebGLBinding.prototype){let se=null,Ce=null,we=null;p.depth&&(we=p.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,se=p.stencil?Ka:Ya,Ce=p.stencil?ja:ts);const Oe={colorFormat:t.RGBA8,depthFormat:we,scaleFactor:s};d=h.createProjectionLayer(Oe),i.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),_=new Pn(d.textureWidth,d.textureHeight,{format:xt,type:It,depthTexture:new Lg(d.textureWidth,d.textureHeight,Ce,void 0,void 0,void 0,void 0,void 0,void 0,se),stencilBuffer:p.stencil,colorSpace:e.outputColorSpace,samples:p.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}else{const se={antialias:p.antialias,alpha:!0,depth:p.depth,stencil:p.stencil,framebufferScaleFactor:s};f=new XRWebGLLayer(i,t,se),i.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),_=new Pn(f.framebufferWidth,f.framebufferHeight,{format:xt,type:It,colorSpace:e.outputColorSpace,stencilBuffer:p.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}_.isXRRenderTarget=!0,this.setFoveation(c),l=null,a=await i.requestReferenceSpace(o),Ge.setContext(i),Ge.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return g.getDepthTexture()};function O(q){for(let oe=0;oe<q.removed.length;oe++){const se=q.removed[oe],Ce=x.indexOf(se);Ce>=0&&(x[Ce]=null,b[Ce].disconnect(se))}for(let oe=0;oe<q.added.length;oe++){const se=q.added[oe];let Ce=x.indexOf(se);if(Ce===-1){for(let Oe=0;Oe<b.length;Oe++)if(Oe>=x.length){x.push(se),Ce=Oe;break}else if(x[Oe]===null){x[Oe]=se,Ce=Oe;break}if(Ce===-1)break}const we=b[Ce];we&&we.connect(se)}}const W=new B,Q=new B;function Y(q,oe,se){W.setFromMatrixPosition(oe.matrixWorld),Q.setFromMatrixPosition(se.matrixWorld);const Ce=W.distanceTo(Q),we=oe.projectionMatrix.elements,Oe=se.projectionMatrix.elements,St=we[14]/(we[10]-1),Ye=we[14]/(we[10]+1),D=(we[9]+1)/we[5],st=(we[9]-1)/we[5],Te=(we[8]-1)/we[0],nt=(Oe[8]+1)/Oe[0],Se=St*Te,Ct=St*nt,ge=Ce/(-Te+nt),Xe=ge*-Te;if(oe.matrixWorld.decompose(q.position,q.quaternion,q.scale),q.translateX(Xe),q.translateZ(ge),q.matrixWorld.compose(q.position,q.quaternion,q.scale),q.matrixWorldInverse.copy(q.matrixWorld).invert(),we[10]===-1)q.projectionMatrix.copy(oe.projectionMatrix),q.projectionMatrixInverse.copy(oe.projectionMatrixInverse);else{const Gt=St+ge,Ft=Ye+ge,R=Se-Xe,S=Ct+(Ce-Xe),G=D*Ye/Ft*Gt,$=st*Ye/Ft*Gt;q.projectionMatrix.makePerspective(R,S,G,$,Gt,Ft),q.projectionMatrixInverse.copy(q.projectionMatrix).invert()}}function Z(q,oe){oe===null?q.matrixWorld.copy(q.matrix):q.matrixWorld.multiplyMatrices(oe.matrixWorld,q.matrix),q.matrixWorldInverse.copy(q.matrixWorld).invert()}this.updateCamera=function(q){if(i===null)return;let oe=q.near,se=q.far;g.texture!==null&&(g.depthNear>0&&(oe=g.depthNear),g.depthFar>0&&(se=g.depthFar)),T.near=v.near=w.near=oe,T.far=v.far=w.far=se,(k!==T.near||U!==T.far)&&(i.updateRenderState({depthNear:T.near,depthFar:T.far}),k=T.near,U=T.far),T.layers.mask=q.layers.mask|6,w.layers.mask=T.layers.mask&3,v.layers.mask=T.layers.mask&5;const Ce=q.parent,we=T.cameras;Z(T,Ce);for(let Oe=0;Oe<we.length;Oe++)Z(we[Oe],Ce);we.length===2?Y(T,w,v):T.projectionMatrix.copy(w.projectionMatrix),re(q,T,Ce)};function re(q,oe,se){se===null?q.matrix.copy(oe.matrixWorld):(q.matrix.copy(se.matrixWorld),q.matrix.invert(),q.matrix.multiply(oe.matrixWorld)),q.matrix.decompose(q.position,q.quaternion,q.scale),q.updateMatrixWorld(!0),q.projectionMatrix.copy(oe.projectionMatrix),q.projectionMatrixInverse.copy(oe.projectionMatrixInverse),q.isPerspectiveCamera&&(q.fov=Vr*2*Math.atan(1/q.projectionMatrix.elements[5]),q.zoom=1)}this.getCamera=function(){return T},this.getFoveation=function(){if(!(d===null&&f===null))return c},this.setFoveation=function(q){c=q,d!==null&&(d.fixedFoveation=q),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=q)},this.hasDepthSensing=function(){return g.texture!==null},this.getDepthSensingMesh=function(){return g.getMesh(T)},this.getCameraTexture=function(q){return m[q]};let fe=null;function Be(q,oe){if(u=oe.getViewerPose(l||a),A=oe,u!==null){const se=u.views;f!==null&&(e.setRenderTargetFramebuffer(_,f.framebuffer),e.setRenderTarget(_));let Ce=!1;se.length!==T.cameras.length&&(T.cameras.length=0,Ce=!0);for(let Ye=0;Ye<se.length;Ye++){const D=se[Ye];let st=null;if(f!==null)st=f.getViewport(D);else{const nt=h.getViewSubImage(d,D);st=nt.viewport,Ye===0&&(e.setRenderTargetTextures(_,nt.colorTexture,nt.depthStencilTexture),e.setRenderTarget(_))}let Te=y[Ye];Te===void 0&&(Te=new $t,Te.layers.enable(Ye),Te.viewport=new it,y[Ye]=Te),Te.matrix.fromArray(D.transform.matrix),Te.matrix.decompose(Te.position,Te.quaternion,Te.scale),Te.projectionMatrix.fromArray(D.projectionMatrix),Te.projectionMatrixInverse.copy(Te.projectionMatrix).invert(),Te.viewport.set(st.x,st.y,st.width,st.height),Ye===0&&(T.matrix.copy(Te.matrix),T.matrix.decompose(T.position,T.quaternion,T.scale)),Ce===!0&&T.cameras.push(Te)}const we=i.enabledFeatures;if(we&&we.includes("depth-sensing")&&i.depthUsage=="gpu-optimized"&&h){const Ye=h.getDepthInformation(se[0]);Ye&&Ye.isValid&&Ye.texture&&g.init(Ye,i.renderState)}if(we&&we.includes("camera-access")&&(e.state.unbindTexture(),h))for(let Ye=0;Ye<se.length;Ye++){const D=se[Ye].camera;if(D){let st=m[D];st||(st=new Xg,m[D]=st);const Te=h.getCameraImage(D);st.sourceTexture=Te}}}for(let se=0;se<b.length;se++){const Ce=x[se],we=b[se];Ce!==null&&we!==void 0&&we.update(Ce,oe,l||a)}fe&&fe(q,oe),oe.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:oe}),A=null}const Ge=new Hg;Ge.setAnimationLoop(Be),this.setAnimationLoop=function(q){fe=q},this.dispose=function(){}}}const hs=new Un,UC=new Ne;function NC(r,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,Mg(r)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function i(m,p,E,_,b){p.isMeshBasicMaterial||p.isMeshLambertMaterial?s(m,p):p.isMeshToonMaterial?(s(m,p),h(m,p)):p.isMeshPhongMaterial?(s(m,p),u(m,p)):p.isMeshStandardMaterial?(s(m,p),d(m,p),p.isMeshPhysicalMaterial&&f(m,p,b)):p.isMeshMatcapMaterial?(s(m,p),A(m,p)):p.isMeshDepthMaterial?s(m,p):p.isMeshDistanceMaterial?(s(m,p),g(m,p)):p.isMeshNormalMaterial?s(m,p):p.isLineBasicMaterial?(a(m,p),p.isLineDashedMaterial&&o(m,p)):p.isPointsMaterial?c(m,p,E,_):p.isSpriteMaterial?l(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function s(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===jt&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===jt&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);const E=e.get(p),_=E.envMap,b=E.envMapRotation;_&&(m.envMap.value=_,hs.copy(b),hs.x*=-1,hs.y*=-1,hs.z*=-1,_.isCubeTexture&&_.isRenderTargetTexture===!1&&(hs.y*=-1,hs.z*=-1),m.envMapRotation.value.setFromMatrix4(UC.makeRotationFromEuler(hs)),m.flipEnvMap.value=_.isCubeTexture&&_.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function a(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function o(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function c(m,p,E,_){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*E,m.scale.value=_*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function l(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function u(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function h(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function d(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,E){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===jt&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=E.texture,m.transmissionSamplerSize.value.set(E.width,E.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function A(m,p){p.matcap&&(m.matcap.value=p.matcap)}function g(m,p){const E=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(E.matrixWorld),m.nearDistance.value=E.shadow.camera.near,m.farDistance.value=E.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function OC(r,e,t,n){let i={},s={},a=[];const o=r.getParameter(r.MAX_UNIFORM_BUFFER_BINDINGS);function c(E,_){const b=_.program;n.uniformBlockBinding(E,b)}function l(E,_){let b=i[E.id];b===void 0&&(A(E),b=u(E),i[E.id]=b,E.addEventListener("dispose",m));const x=_.program;n.updateUBOMapping(E,x);const I=e.render.frame;s[E.id]!==I&&(d(E),s[E.id]=I)}function u(E){const _=h();E.__bindingPointIndex=_;const b=r.createBuffer(),x=E.__size,I=E.usage;return r.bindBuffer(r.UNIFORM_BUFFER,b),r.bufferData(r.UNIFORM_BUFFER,x,I),r.bindBuffer(r.UNIFORM_BUFFER,null),r.bindBufferBase(r.UNIFORM_BUFFER,_,b),b}function h(){for(let E=0;E<o;E++)if(a.indexOf(E)===-1)return a.push(E),E;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(E){const _=i[E.id],b=E.uniforms,x=E.__cache;r.bindBuffer(r.UNIFORM_BUFFER,_);for(let I=0,M=b.length;I<M;I++){const w=Array.isArray(b[I])?b[I]:[b[I]];for(let v=0,y=w.length;v<y;v++){const T=w[v];if(f(T,I,v,x)===!0){const k=T.__offset,U=Array.isArray(T.value)?T.value:[T.value];let F=0;for(let H=0;H<U.length;H++){const O=U[H],W=g(O);typeof O=="number"||typeof O=="boolean"?(T.__data[0]=O,r.bufferSubData(r.UNIFORM_BUFFER,k+F,T.__data)):O.isMatrix3?(T.__data[0]=O.elements[0],T.__data[1]=O.elements[1],T.__data[2]=O.elements[2],T.__data[3]=0,T.__data[4]=O.elements[3],T.__data[5]=O.elements[4],T.__data[6]=O.elements[5],T.__data[7]=0,T.__data[8]=O.elements[6],T.__data[9]=O.elements[7],T.__data[10]=O.elements[8],T.__data[11]=0):(O.toArray(T.__data,F),F+=W.storage/Float32Array.BYTES_PER_ELEMENT)}r.bufferSubData(r.UNIFORM_BUFFER,k,T.__data)}}}r.bindBuffer(r.UNIFORM_BUFFER,null)}function f(E,_,b,x){const I=E.value,M=_+"_"+b;if(x[M]===void 0)return typeof I=="number"||typeof I=="boolean"?x[M]=I:x[M]=I.clone(),!0;{const w=x[M];if(typeof I=="number"||typeof I=="boolean"){if(w!==I)return x[M]=I,!0}else if(w.equals(I)===!1)return w.copy(I),!0}return!1}function A(E){const _=E.uniforms;let b=0;const x=16;for(let M=0,w=_.length;M<w;M++){const v=Array.isArray(_[M])?_[M]:[_[M]];for(let y=0,T=v.length;y<T;y++){const k=v[y],U=Array.isArray(k.value)?k.value:[k.value];for(let F=0,H=U.length;F<H;F++){const O=U[F],W=g(O),Q=b%x,Y=Q%W.boundary,Z=Q+Y;b+=Y,Z!==0&&x-Z<W.storage&&(b+=x-Z),k.__data=new Float32Array(W.storage/Float32Array.BYTES_PER_ELEMENT),k.__offset=b,b+=W.storage}}}const I=b%x;return I>0&&(b+=x-I),E.__size=b,E.__cache={},this}function g(E){const _={boundary:0,storage:0};return typeof E=="number"||typeof E=="boolean"?(_.boundary=4,_.storage=4):E.isVector2?(_.boundary=8,_.storage=8):E.isVector3||E.isColor?(_.boundary=16,_.storage=12):E.isVector4?(_.boundary=16,_.storage=16):E.isMatrix3?(_.boundary=48,_.storage=48):E.isMatrix4?(_.boundary=64,_.storage=64):E.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",E),_}function m(E){const _=E.target;_.removeEventListener("dispose",m);const b=a.indexOf(_.__bindingPointIndex);a.splice(b,1),r.deleteBuffer(i[_.id]),delete i[_.id],delete s[_.id]}function p(){for(const E in i)r.deleteBuffer(i[E]);a=[],i={},s={}}return{bind:c,update:l,dispose:p}}class $g{constructor(e={}){const{canvas:t=U_(),context:n=null,depth:i=!0,stencil:s=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1,reversedDepthBuffer:d=!1}=e;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=n.getContextAttributes().alpha}else f=a;const A=new Uint32Array(4),g=new Int32Array(4);let m=null,p=null;const E=[],_=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=ai,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const b=this;let x=!1;this._outputColorSpace=mt;let I=0,M=0,w=null,v=-1,y=null;const T=new it,k=new it;let U=null;const F=new Me(0);let H=0,O=t.width,W=t.height,Q=1,Y=null,Z=null;const re=new it(0,0,O,W),fe=new it(0,0,O,W);let Be=!1;const Ge=new Cd;let q=!1,oe=!1;const se=new Ne,Ce=new B,we=new it,Oe={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let St=!1;function Ye(){return w===null?Q:1}let D=n;function st(C,P){return t.getContext(C,P)}try{const C={alpha:!0,depth:i,stencil:s,antialias:o,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Zc}`),t.addEventListener("webglcontextlost",ce,!1),t.addEventListener("webglcontextrestored",me,!1),t.addEventListener("webglcontextcreationerror",ee,!1),D===null){const P="webgl2";if(D=st(P,C),D===null)throw st(P)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(C){throw console.error("THREE.WebGLRenderer: "+C.message),C}let Te,nt,Se,Ct,ge,Xe,Gt,Ft,R,S,G,$,K,X,ye,ae,Ee,xe,ne,de,Fe,ve,he,ze;function L(){Te=new jy(D),Te.init(),ve=new BC(D,Te),nt=new Hy(D,Te,e,ve),Se=new TC(D,Te),nt.reversedDepthBuffer&&d&&Se.buffers.depth.setReversed(!0),Ct=new Jy(D),ge=new mC,Xe=new RC(D,Te,Se,ge,nt,ve,Ct),Gt=new Vy(b),Ft=new $y(b),R=new sx(D),he=new Qy(D,R),S=new Yy(D,R,Ct,he),G=new eS(D,S,R,Ct),ne=new Zy(D,nt,Xe),ae=new zy(ge),$=new AC(b,Gt,Ft,Te,nt,he,ae),K=new NC(b,ge),X=new bC,ye=new SC(Te),xe=new ky(b,Gt,Ft,Se,G,f,c),Ee=new MC(b,G,nt),ze=new OC(D,Ct,nt,Se),de=new Gy(D,Te,Ct),Fe=new Ky(D,Te,Ct),Ct.programs=$.programs,b.capabilities=nt,b.extensions=Te,b.properties=ge,b.renderLists=X,b.shadowMap=Ee,b.state=Se,b.info=Ct}L();const ie=new PC(b,D);this.xr=ie,this.getContext=function(){return D},this.getContextAttributes=function(){return D.getContextAttributes()},this.forceContextLoss=function(){const C=Te.get("WEBGL_lose_context");C&&C.loseContext()},this.forceContextRestore=function(){const C=Te.get("WEBGL_lose_context");C&&C.restoreContext()},this.getPixelRatio=function(){return Q},this.setPixelRatio=function(C){C!==void 0&&(Q=C,this.setSize(O,W,!1))},this.getSize=function(C){return C.set(O,W)},this.setSize=function(C,P,z=!0){if(ie.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}O=C,W=P,t.width=Math.floor(C*Q),t.height=Math.floor(P*Q),z===!0&&(t.style.width=C+"px",t.style.height=P+"px"),this.setViewport(0,0,C,P)},this.getDrawingBufferSize=function(C){return C.set(O*Q,W*Q).floor()},this.setDrawingBufferSize=function(C,P,z){O=C,W=P,Q=z,t.width=Math.floor(C*z),t.height=Math.floor(P*z),this.setViewport(0,0,C,P)},this.getCurrentViewport=function(C){return C.copy(T)},this.getViewport=function(C){return C.copy(re)},this.setViewport=function(C,P,z,V){C.isVector4?re.set(C.x,C.y,C.z,C.w):re.set(C,P,z,V),Se.viewport(T.copy(re).multiplyScalar(Q).round())},this.getScissor=function(C){return C.copy(fe)},this.setScissor=function(C,P,z,V){C.isVector4?fe.set(C.x,C.y,C.z,C.w):fe.set(C,P,z,V),Se.scissor(k.copy(fe).multiplyScalar(Q).round())},this.getScissorTest=function(){return Be},this.setScissorTest=function(C){Se.setScissorTest(Be=C)},this.setOpaqueSort=function(C){Y=C},this.setTransparentSort=function(C){Z=C},this.getClearColor=function(C){return C.copy(xe.getClearColor())},this.setClearColor=function(){xe.setClearColor(...arguments)},this.getClearAlpha=function(){return xe.getClearAlpha()},this.setClearAlpha=function(){xe.setClearAlpha(...arguments)},this.clear=function(C=!0,P=!0,z=!0){let V=0;if(C){let N=!1;if(w!==null){const te=w.texture.format;N=te===bd||te===gd||te===md}if(N){const te=w.texture.type,ue=te===It||te===ts||te===$a||te===ja||te===pd||te===Ad,be=xe.getClearColor(),pe=xe.getClearAlpha(),Le=be.r,Ue=be.g,Ie=be.b;ue?(A[0]=Le,A[1]=Ue,A[2]=Ie,A[3]=pe,D.clearBufferuiv(D.COLOR,0,A)):(g[0]=Le,g[1]=Ue,g[2]=Ie,g[3]=pe,D.clearBufferiv(D.COLOR,0,g))}else V|=D.COLOR_BUFFER_BIT}P&&(V|=D.DEPTH_BUFFER_BIT),z&&(V|=D.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),D.clear(V)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",ce,!1),t.removeEventListener("webglcontextrestored",me,!1),t.removeEventListener("webglcontextcreationerror",ee,!1),xe.dispose(),X.dispose(),ye.dispose(),ge.dispose(),Gt.dispose(),Ft.dispose(),G.dispose(),he.dispose(),ze.dispose(),$.dispose(),ie.dispose(),ie.removeEventListener("sessionstart",Kn),ie.removeEventListener("sessionend",Od),is.stop()};function ce(C){C.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),x=!0}function me(){console.log("THREE.WebGLRenderer: Context Restored."),x=!1;const C=Ct.autoReset,P=Ee.enabled,z=Ee.autoUpdate,V=Ee.needsUpdate,N=Ee.type;L(),Ct.autoReset=C,Ee.enabled=P,Ee.autoUpdate=z,Ee.needsUpdate=V,Ee.type=N}function ee(C){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",C.statusMessage)}function j(C){const P=C.target;P.removeEventListener("dispose",j),_e(P)}function _e(C){He(C),ge.remove(C)}function He(C){const P=ge.get(C).programs;P!==void 0&&(P.forEach(function(z){$.releaseProgram(z)}),C.isShaderMaterial&&$.releaseShaderCache(C))}this.renderBufferDirect=function(C,P,z,V,N,te){P===null&&(P=Oe);const ue=N.isMesh&&N.matrixWorld.determinant()<0,be=bb(C,P,z,V,N);Se.setMaterial(V,ue);let pe=z.index,Le=1;if(V.wireframe===!0){if(pe=S.getWireframeAttribute(z),pe===void 0)return;Le=2}const Ue=z.drawRange,Ie=z.attributes.position;let Ke=Ue.start*Le,ht=(Ue.start+Ue.count)*Le;te!==null&&(Ke=Math.max(Ke,te.start*Le),ht=Math.min(ht,(te.start+te.count)*Le)),pe!==null?(Ke=Math.max(Ke,0),ht=Math.min(ht,pe.count)):Ie!=null&&(Ke=Math.max(Ke,0),ht=Math.min(ht,Ie.count));const Bt=ht-Ke;if(Bt<0||Bt===1/0)return;he.setup(N,V,be,z,pe);let bt,ft=de;if(pe!==null&&(bt=R.get(pe),ft=Fe,ft.setIndex(bt)),N.isMesh)V.wireframe===!0?(Se.setLineWidth(V.wireframeLinewidth*Ye()),ft.setMode(D.LINES)):ft.setMode(D.TRIANGLES);else if(N.isLine){let Re=V.linewidth;Re===void 0&&(Re=1),Se.setLineWidth(Re*Ye()),N.isLineSegments?ft.setMode(D.LINES):N.isLineLoop?ft.setMode(D.LINE_LOOP):ft.setMode(D.LINE_STRIP)}else N.isPoints?ft.setMode(D.POINTS):N.isSprite&&ft.setMode(D.TRIANGLES);if(N.isBatchedMesh)if(N._multiDrawInstances!==null)Fr("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),ft.renderMultiDrawInstances(N._multiDrawStarts,N._multiDrawCounts,N._multiDrawCount,N._multiDrawInstances);else if(Te.get("WEBGL_multi_draw"))ft.renderMultiDraw(N._multiDrawStarts,N._multiDrawCounts,N._multiDrawCount);else{const Re=N._multiDrawStarts,wt=N._multiDrawCounts,tt=N._multiDrawCount,mn=pe?R.get(pe).bytesPerElement:1,zs=ge.get(V).currentProgram.getUniforms();for(let gn=0;gn<tt;gn++)zs.setValue(D,"_gl_DrawID",gn),ft.render(Re[gn]/mn,wt[gn])}else if(N.isInstancedMesh)ft.renderInstances(Ke,Bt,N.count);else if(z.isInstancedBufferGeometry){const Re=z._maxInstanceCount!==void 0?z._maxInstanceCount:1/0,wt=Math.min(z.instanceCount,Re);ft.renderInstances(Ke,Bt,wt)}else ft.render(Ke,Bt)};function At(C,P,z){C.transparent===!0&&C.side===Wt&&C.forceSinglePass===!1?(C.side=jt,C.needsUpdate=!0,go(C,P,z),C.side=Xn,C.needsUpdate=!0,go(C,P,z),C.side=Wt):go(C,P,z)}this.compile=function(C,P,z=null){z===null&&(z=C),p=ye.get(z),p.init(P),_.push(p),z.traverseVisible(function(N){N.isLight&&N.layers.test(P.layers)&&(p.pushLight(N),N.castShadow&&p.pushShadow(N))}),C!==z&&C.traverseVisible(function(N){N.isLight&&N.layers.test(P.layers)&&(p.pushLight(N),N.castShadow&&p.pushShadow(N))}),p.setupLights();const V=new Set;return C.traverse(function(N){if(!(N.isMesh||N.isPoints||N.isLine||N.isSprite))return;const te=N.material;if(te)if(Array.isArray(te))for(let ue=0;ue<te.length;ue++){const be=te[ue];At(be,z,N),V.add(be)}else At(te,z,N),V.add(te)}),p=_.pop(),V},this.compileAsync=function(C,P,z=null){const V=this.compile(C,P,z);return new Promise(N=>{function te(){if(V.forEach(function(ue){ge.get(ue).currentProgram.isReady()&&V.delete(ue)}),V.size===0){N(C);return}setTimeout(te,10)}Te.get("KHR_parallel_shader_compile")!==null?te():setTimeout(te,10)})};let rt=null;function ui(C){rt&&rt(C)}function Kn(){is.stop()}function Od(){is.start()}const is=new Hg;is.setAnimationLoop(ui),typeof self<"u"&&is.setContext(self),this.setAnimationLoop=function(C){rt=C,ie.setAnimationLoop(C),C===null?is.stop():is.start()},ie.addEventListener("sessionstart",Kn),ie.addEventListener("sessionend",Od),this.render=function(C,P){if(P!==void 0&&P.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(x===!0)return;if(C.matrixWorldAutoUpdate===!0&&C.updateMatrixWorld(),P.parent===null&&P.matrixWorldAutoUpdate===!0&&P.updateMatrixWorld(),ie.enabled===!0&&ie.isPresenting===!0&&(ie.cameraAutoUpdate===!0&&ie.updateCamera(P),P=ie.getCamera()),C.isScene===!0&&C.onBeforeRender(b,C,P,w),p=ye.get(C,_.length),p.init(P),_.push(p),se.multiplyMatrices(P.projectionMatrix,P.matrixWorldInverse),Ge.setFromProjectionMatrix(se,ii,P.reversedDepth),oe=this.localClippingEnabled,q=ae.init(this.clippingPlanes,oe),m=X.get(C,E.length),m.init(),E.push(m),ie.enabled===!0&&ie.isPresenting===!0){const te=b.xr.getDepthSensingMesh();te!==null&&hl(te,P,-1/0,b.sortObjects)}hl(C,P,0,b.sortObjects),m.finish(),b.sortObjects===!0&&m.sort(Y,Z),St=ie.enabled===!1||ie.isPresenting===!1||ie.hasDepthSensing()===!1,St&&xe.addToRenderList(m,C),this.info.render.frame++,q===!0&&ae.beginShadows();const z=p.state.shadowsArray;Ee.render(z,C,P),q===!0&&ae.endShadows(),this.info.autoReset===!0&&this.info.reset();const V=m.opaque,N=m.transmissive;if(p.setupLights(),P.isArrayCamera){const te=P.cameras;if(N.length>0)for(let ue=0,be=te.length;ue<be;ue++){const pe=te[ue];Qd(V,N,C,pe)}St&&xe.render(C);for(let ue=0,be=te.length;ue<be;ue++){const pe=te[ue];kd(m,C,pe,pe.viewport)}}else N.length>0&&Qd(V,N,C,P),St&&xe.render(C),kd(m,C,P);w!==null&&M===0&&(Xe.updateMultisampleRenderTarget(w),Xe.updateRenderTargetMipmap(w)),C.isScene===!0&&C.onAfterRender(b,C,P),he.resetDefaultState(),v=-1,y=null,_.pop(),_.length>0?(p=_[_.length-1],q===!0&&ae.setGlobalState(b.clippingPlanes,p.state.camera)):p=null,E.pop(),E.length>0?m=E[E.length-1]:m=null};function hl(C,P,z,V){if(C.visible===!1)return;if(C.layers.test(P.layers)){if(C.isGroup)z=C.renderOrder;else if(C.isLOD)C.autoUpdate===!0&&C.update(P);else if(C.isLight)p.pushLight(C),C.castShadow&&p.pushShadow(C);else if(C.isSprite){if(!C.frustumCulled||Ge.intersectsSprite(C)){V&&we.setFromMatrixPosition(C.matrixWorld).applyMatrix4(se);const ue=G.update(C),be=C.material;be.visible&&m.push(C,ue,be,z,we.z,null)}}else if((C.isMesh||C.isLine||C.isPoints)&&(!C.frustumCulled||Ge.intersectsObject(C))){const ue=G.update(C),be=C.material;if(V&&(C.boundingSphere!==void 0?(C.boundingSphere===null&&C.computeBoundingSphere(),we.copy(C.boundingSphere.center)):(ue.boundingSphere===null&&ue.computeBoundingSphere(),we.copy(ue.boundingSphere.center)),we.applyMatrix4(C.matrixWorld).applyMatrix4(se)),Array.isArray(be)){const pe=ue.groups;for(let Le=0,Ue=pe.length;Le<Ue;Le++){const Ie=pe[Le],Ke=be[Ie.materialIndex];Ke&&Ke.visible&&m.push(C,ue,Ke,z,we.z,Ie)}}else be.visible&&m.push(C,ue,be,z,we.z,null)}}const te=C.children;for(let ue=0,be=te.length;ue<be;ue++)hl(te[ue],P,z,V)}function kd(C,P,z,V){const N=C.opaque,te=C.transmissive,ue=C.transparent;p.setupLightsView(z),q===!0&&ae.setGlobalState(b.clippingPlanes,z),V&&Se.viewport(T.copy(V)),N.length>0&&mo(N,P,z),te.length>0&&mo(te,P,z),ue.length>0&&mo(ue,P,z),Se.buffers.depth.setTest(!0),Se.buffers.depth.setMask(!0),Se.buffers.color.setMask(!0),Se.setPolygonOffset(!1)}function Qd(C,P,z,V){if((z.isScene===!0?z.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[V.id]===void 0&&(p.state.transmissionRenderTarget[V.id]=new Pn(1,1,{generateMipmaps:!0,type:Te.has("EXT_color_buffer_half_float")||Te.has("EXT_color_buffer_float")?Nt:It,minFilter:hn,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Je.workingColorSpace}));const te=p.state.transmissionRenderTarget[V.id],ue=V.viewport||T;te.setSize(ue.z*b.transmissionResolutionScale,ue.w*b.transmissionResolutionScale);const be=b.getRenderTarget(),pe=b.getActiveCubeFace(),Le=b.getActiveMipmapLevel();b.setRenderTarget(te),b.getClearColor(F),H=b.getClearAlpha(),H<1&&b.setClearColor(16777215,.5),b.clear(),St&&xe.render(z);const Ue=b.toneMapping;b.toneMapping=ai;const Ie=V.viewport;if(V.viewport!==void 0&&(V.viewport=void 0),p.setupLightsView(V),q===!0&&ae.setGlobalState(b.clippingPlanes,V),mo(C,z,V),Xe.updateMultisampleRenderTarget(te),Xe.updateRenderTargetMipmap(te),Te.has("WEBGL_multisampled_render_to_texture")===!1){let Ke=!1;for(let ht=0,Bt=P.length;ht<Bt;ht++){const bt=P[ht],ft=bt.object,Re=bt.geometry,wt=bt.material,tt=bt.group;if(wt.side===Wt&&ft.layers.test(V.layers)){const mn=wt.side;wt.side=jt,wt.needsUpdate=!0,Gd(ft,z,V,Re,wt,tt),wt.side=mn,wt.needsUpdate=!0,Ke=!0}}Ke===!0&&(Xe.updateMultisampleRenderTarget(te),Xe.updateRenderTargetMipmap(te))}b.setRenderTarget(be,pe,Le),b.setClearColor(F,H),Ie!==void 0&&(V.viewport=Ie),b.toneMapping=Ue}function mo(C,P,z){const V=P.isScene===!0?P.overrideMaterial:null;for(let N=0,te=C.length;N<te;N++){const ue=C[N],be=ue.object,pe=ue.geometry,Le=ue.group;let Ue=ue.material;Ue.allowOverride===!0&&V!==null&&(Ue=V),be.layers.test(z.layers)&&Gd(be,P,z,pe,Ue,Le)}}function Gd(C,P,z,V,N,te){C.onBeforeRender(b,P,z,V,N,te),C.modelViewMatrix.multiplyMatrices(z.matrixWorldInverse,C.matrixWorld),C.normalMatrix.getNormalMatrix(C.modelViewMatrix),N.onBeforeRender(b,P,z,V,C,te),N.transparent===!0&&N.side===Wt&&N.forceSinglePass===!1?(N.side=jt,N.needsUpdate=!0,b.renderBufferDirect(z,P,V,N,C,te),N.side=Xn,N.needsUpdate=!0,b.renderBufferDirect(z,P,V,N,C,te),N.side=Wt):b.renderBufferDirect(z,P,V,N,C,te),C.onAfterRender(b,P,z,V,N,te)}function go(C,P,z){P.isScene!==!0&&(P=Oe);const V=ge.get(C),N=p.state.lights,te=p.state.shadowsArray,ue=N.state.version,be=$.getParameters(C,N.state,te,P,z),pe=$.getProgramCacheKey(be);let Le=V.programs;V.environment=C.isMeshStandardMaterial?P.environment:null,V.fog=P.fog,V.envMap=(C.isMeshStandardMaterial?Ft:Gt).get(C.envMap||V.environment),V.envMapRotation=V.environment!==null&&C.envMap===null?P.environmentRotation:C.envMapRotation,Le===void 0&&(C.addEventListener("dispose",j),Le=new Map,V.programs=Le);let Ue=Le.get(pe);if(Ue!==void 0){if(V.currentProgram===Ue&&V.lightsStateVersion===ue)return zd(C,be),Ue}else be.uniforms=$.getUniforms(C),C.onBeforeCompile(be,b),Ue=$.acquireProgram(be,pe),Le.set(pe,Ue),V.uniforms=be.uniforms;const Ie=V.uniforms;return(!C.isShaderMaterial&&!C.isRawShaderMaterial||C.clipping===!0)&&(Ie.clippingPlanes=ae.uniform),zd(C,be),V.needsLights=Eb(C),V.lightsStateVersion=ue,V.needsLights&&(Ie.ambientLightColor.value=N.state.ambient,Ie.lightProbe.value=N.state.probe,Ie.directionalLights.value=N.state.directional,Ie.directionalLightShadows.value=N.state.directionalShadow,Ie.spotLights.value=N.state.spot,Ie.spotLightShadows.value=N.state.spotShadow,Ie.rectAreaLights.value=N.state.rectArea,Ie.ltc_1.value=N.state.rectAreaLTC1,Ie.ltc_2.value=N.state.rectAreaLTC2,Ie.pointLights.value=N.state.point,Ie.pointLightShadows.value=N.state.pointShadow,Ie.hemisphereLights.value=N.state.hemi,Ie.directionalShadowMap.value=N.state.directionalShadowMap,Ie.directionalShadowMatrix.value=N.state.directionalShadowMatrix,Ie.spotShadowMap.value=N.state.spotShadowMap,Ie.spotLightMatrix.value=N.state.spotLightMatrix,Ie.spotLightMap.value=N.state.spotLightMap,Ie.pointShadowMap.value=N.state.pointShadowMap,Ie.pointShadowMatrix.value=N.state.pointShadowMatrix),V.currentProgram=Ue,V.uniformsList=null,Ue}function Hd(C){if(C.uniformsList===null){const P=C.currentProgram.getUniforms();C.uniformsList=vc.seqWithValue(P.seq,C.uniforms)}return C.uniformsList}function zd(C,P){const z=ge.get(C);z.outputColorSpace=P.outputColorSpace,z.batching=P.batching,z.batchingColor=P.batchingColor,z.instancing=P.instancing,z.instancingColor=P.instancingColor,z.instancingMorph=P.instancingMorph,z.skinning=P.skinning,z.morphTargets=P.morphTargets,z.morphNormals=P.morphNormals,z.morphColors=P.morphColors,z.morphTargetsCount=P.morphTargetsCount,z.numClippingPlanes=P.numClippingPlanes,z.numIntersection=P.numClipIntersection,z.vertexAlphas=P.vertexAlphas,z.vertexTangents=P.vertexTangents,z.toneMapping=P.toneMapping}function bb(C,P,z,V,N){P.isScene!==!0&&(P=Oe),Xe.resetTextureUnits();const te=P.fog,ue=V.isMeshStandardMaterial?P.environment:null,be=w===null?b.outputColorSpace:w.isXRRenderTarget===!0?w.texture.colorSpace:gt,pe=(V.isMeshStandardMaterial?Ft:Gt).get(V.envMap||ue),Le=V.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,Ue=!!z.attributes.tangent&&(!!V.normalMap||V.anisotropy>0),Ie=!!z.morphAttributes.position,Ke=!!z.morphAttributes.normal,ht=!!z.morphAttributes.color;let Bt=ai;V.toneMapped&&(w===null||w.isXRRenderTarget===!0)&&(Bt=b.toneMapping);const bt=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,ft=bt!==void 0?bt.length:0,Re=ge.get(V),wt=p.state.lights;if(q===!0&&(oe===!0||C!==y)){const tn=C===y&&V.id===v;ae.setState(V,C,tn)}let tt=!1;V.version===Re.__version?(Re.needsLights&&Re.lightsStateVersion!==wt.state.version||Re.outputColorSpace!==be||N.isBatchedMesh&&Re.batching===!1||!N.isBatchedMesh&&Re.batching===!0||N.isBatchedMesh&&Re.batchingColor===!0&&N.colorTexture===null||N.isBatchedMesh&&Re.batchingColor===!1&&N.colorTexture!==null||N.isInstancedMesh&&Re.instancing===!1||!N.isInstancedMesh&&Re.instancing===!0||N.isSkinnedMesh&&Re.skinning===!1||!N.isSkinnedMesh&&Re.skinning===!0||N.isInstancedMesh&&Re.instancingColor===!0&&N.instanceColor===null||N.isInstancedMesh&&Re.instancingColor===!1&&N.instanceColor!==null||N.isInstancedMesh&&Re.instancingMorph===!0&&N.morphTexture===null||N.isInstancedMesh&&Re.instancingMorph===!1&&N.morphTexture!==null||Re.envMap!==pe||V.fog===!0&&Re.fog!==te||Re.numClippingPlanes!==void 0&&(Re.numClippingPlanes!==ae.numPlanes||Re.numIntersection!==ae.numIntersection)||Re.vertexAlphas!==Le||Re.vertexTangents!==Ue||Re.morphTargets!==Ie||Re.morphNormals!==Ke||Re.morphColors!==ht||Re.toneMapping!==Bt||Re.morphTargetsCount!==ft)&&(tt=!0):(tt=!0,Re.__version=V.version);let mn=Re.currentProgram;tt===!0&&(mn=go(V,P,N));let zs=!1,gn=!1,ia=!1;const Tt=mn.getUniforms(),Mn=Re.uniforms;if(Se.useProgram(mn.program)&&(zs=!0,gn=!0,ia=!0),V.id!==v&&(v=V.id,gn=!0),zs||y!==C){Se.buffers.depth.getReversed()&&C.reversedDepth!==!0&&(C._reversedDepth=!0,C.updateProjectionMatrix()),Tt.setValue(D,"projectionMatrix",C.projectionMatrix),Tt.setValue(D,"viewMatrix",C.matrixWorldInverse);const dn=Tt.map.cameraPosition;dn!==void 0&&dn.setValue(D,Ce.setFromMatrixPosition(C.matrixWorld)),nt.logarithmicDepthBuffer&&Tt.setValue(D,"logDepthBufFC",2/(Math.log(C.far+1)/Math.LN2)),(V.isMeshPhongMaterial||V.isMeshToonMaterial||V.isMeshLambertMaterial||V.isMeshBasicMaterial||V.isMeshStandardMaterial||V.isShaderMaterial)&&Tt.setValue(D,"isOrthographic",C.isOrthographicCamera===!0),y!==C&&(y=C,gn=!0,ia=!0)}if(N.isSkinnedMesh){Tt.setOptional(D,N,"bindMatrix"),Tt.setOptional(D,N,"bindMatrixInverse");const tn=N.skeleton;tn&&(tn.boneTexture===null&&tn.computeBoneTexture(),Tt.setValue(D,"boneTexture",tn.boneTexture,Xe))}N.isBatchedMesh&&(Tt.setOptional(D,N,"batchingTexture"),Tt.setValue(D,"batchingTexture",N._matricesTexture,Xe),Tt.setOptional(D,N,"batchingIdTexture"),Tt.setValue(D,"batchingIdTexture",N._indirectTexture,Xe),Tt.setOptional(D,N,"batchingColorTexture"),N._colorsTexture!==null&&Tt.setValue(D,"batchingColorTexture",N._colorsTexture,Xe));const wn=z.morphAttributes;if((wn.position!==void 0||wn.normal!==void 0||wn.color!==void 0)&&ne.update(N,z,mn),(gn||Re.receiveShadow!==N.receiveShadow)&&(Re.receiveShadow=N.receiveShadow,Tt.setValue(D,"receiveShadow",N.receiveShadow)),V.isMeshGouraudMaterial&&V.envMap!==null&&(Mn.envMap.value=pe,Mn.flipEnvMap.value=pe.isCubeTexture&&pe.isRenderTargetTexture===!1?-1:1),V.isMeshStandardMaterial&&V.envMap===null&&P.environment!==null&&(Mn.envMapIntensity.value=P.environmentIntensity),gn&&(Tt.setValue(D,"toneMappingExposure",b.toneMappingExposure),Re.needsLights&&_b(Mn,ia),te&&V.fog===!0&&K.refreshFogUniforms(Mn,te),K.refreshMaterialUniforms(Mn,V,Q,W,p.state.transmissionRenderTarget[C.id]),vc.upload(D,Hd(Re),Mn,Xe)),V.isShaderMaterial&&V.uniformsNeedUpdate===!0&&(vc.upload(D,Hd(Re),Mn,Xe),V.uniformsNeedUpdate=!1),V.isSpriteMaterial&&Tt.setValue(D,"center",N.center),Tt.setValue(D,"modelViewMatrix",N.modelViewMatrix),Tt.setValue(D,"normalMatrix",N.normalMatrix),Tt.setValue(D,"modelMatrix",N.matrixWorld),V.isShaderMaterial||V.isRawShaderMaterial){const tn=V.uniformsGroups;for(let dn=0,ul=tn.length;dn<ul;dn++){const ss=tn[dn];ze.update(ss,mn),ze.bind(ss,mn)}}return mn}function _b(C,P){C.ambientLightColor.needsUpdate=P,C.lightProbe.needsUpdate=P,C.directionalLights.needsUpdate=P,C.directionalLightShadows.needsUpdate=P,C.pointLights.needsUpdate=P,C.pointLightShadows.needsUpdate=P,C.spotLights.needsUpdate=P,C.spotLightShadows.needsUpdate=P,C.rectAreaLights.needsUpdate=P,C.hemisphereLights.needsUpdate=P}function Eb(C){return C.isMeshLambertMaterial||C.isMeshToonMaterial||C.isMeshPhongMaterial||C.isMeshStandardMaterial||C.isShadowMaterial||C.isShaderMaterial&&C.lights===!0}this.getActiveCubeFace=function(){return I},this.getActiveMipmapLevel=function(){return M},this.getRenderTarget=function(){return w},this.setRenderTargetTextures=function(C,P,z){const V=ge.get(C);V.__autoAllocateDepthBuffer=C.resolveDepthBuffer===!1,V.__autoAllocateDepthBuffer===!1&&(V.__useRenderToTexture=!1),ge.get(C.texture).__webglTexture=P,ge.get(C.depthTexture).__webglTexture=V.__autoAllocateDepthBuffer?void 0:z,V.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(C,P){const z=ge.get(C);z.__webglFramebuffer=P,z.__useDefaultFramebuffer=P===void 0};const xb=D.createFramebuffer();this.setRenderTarget=function(C,P=0,z=0){w=C,I=P,M=z;let V=!0,N=null,te=!1,ue=!1;if(C){const pe=ge.get(C);if(pe.__useDefaultFramebuffer!==void 0)Se.bindFramebuffer(D.FRAMEBUFFER,null),V=!1;else if(pe.__webglFramebuffer===void 0)Xe.setupRenderTarget(C);else if(pe.__hasExternalTextures)Xe.rebindTextures(C,ge.get(C.texture).__webglTexture,ge.get(C.depthTexture).__webglTexture);else if(C.depthBuffer){const Ie=C.depthTexture;if(pe.__boundDepthTexture!==Ie){if(Ie!==null&&ge.has(Ie)&&(C.width!==Ie.image.width||C.height!==Ie.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");Xe.setupDepthRenderbuffer(C)}}const Le=C.texture;(Le.isData3DTexture||Le.isDataArrayTexture||Le.isCompressedArrayTexture)&&(ue=!0);const Ue=ge.get(C).__webglFramebuffer;C.isWebGLCubeRenderTarget?(Array.isArray(Ue[P])?N=Ue[P][z]:N=Ue[P],te=!0):C.samples>0&&Xe.useMultisampledRTT(C)===!1?N=ge.get(C).__webglMultisampledFramebuffer:Array.isArray(Ue)?N=Ue[z]:N=Ue,T.copy(C.viewport),k.copy(C.scissor),U=C.scissorTest}else T.copy(re).multiplyScalar(Q).floor(),k.copy(fe).multiplyScalar(Q).floor(),U=Be;if(z!==0&&(N=xb),Se.bindFramebuffer(D.FRAMEBUFFER,N)&&V&&Se.drawBuffers(C,N),Se.viewport(T),Se.scissor(k),Se.setScissorTest(U),te){const pe=ge.get(C.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_CUBE_MAP_POSITIVE_X+P,pe.__webglTexture,z)}else if(ue){const pe=P;for(let Le=0;Le<C.textures.length;Le++){const Ue=ge.get(C.textures[Le]);D.framebufferTextureLayer(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0+Le,Ue.__webglTexture,z,pe)}}else if(C!==null&&z!==0){const pe=ge.get(C.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,pe.__webglTexture,z)}v=-1},this.readRenderTargetPixels=function(C,P,z,V,N,te,ue,be=0){if(!(C&&C.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let pe=ge.get(C).__webglFramebuffer;if(C.isWebGLCubeRenderTarget&&ue!==void 0&&(pe=pe[ue]),pe){Se.bindFramebuffer(D.FRAMEBUFFER,pe);try{const Le=C.textures[be],Ue=Le.format,Ie=Le.type;if(!nt.textureFormatReadable(Ue)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!nt.textureTypeReadable(Ie)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}P>=0&&P<=C.width-V&&z>=0&&z<=C.height-N&&(C.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+be),D.readPixels(P,z,V,N,ve.convert(Ue),ve.convert(Ie),te))}finally{const Le=w!==null?ge.get(w).__webglFramebuffer:null;Se.bindFramebuffer(D.FRAMEBUFFER,Le)}}},this.readRenderTargetPixelsAsync=async function(C,P,z,V,N,te,ue,be=0){if(!(C&&C.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let pe=ge.get(C).__webglFramebuffer;if(C.isWebGLCubeRenderTarget&&ue!==void 0&&(pe=pe[ue]),pe)if(P>=0&&P<=C.width-V&&z>=0&&z<=C.height-N){Se.bindFramebuffer(D.FRAMEBUFFER,pe);const Le=C.textures[be],Ue=Le.format,Ie=Le.type;if(!nt.textureFormatReadable(Ue))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!nt.textureTypeReadable(Ie))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const Ke=D.createBuffer();D.bindBuffer(D.PIXEL_PACK_BUFFER,Ke),D.bufferData(D.PIXEL_PACK_BUFFER,te.byteLength,D.STREAM_READ),C.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+be),D.readPixels(P,z,V,N,ve.convert(Ue),ve.convert(Ie),0);const ht=w!==null?ge.get(w).__webglFramebuffer:null;Se.bindFramebuffer(D.FRAMEBUFFER,ht);const Bt=D.fenceSync(D.SYNC_GPU_COMMANDS_COMPLETE,0);return D.flush(),await N_(D,Bt,4),D.bindBuffer(D.PIXEL_PACK_BUFFER,Ke),D.getBufferSubData(D.PIXEL_PACK_BUFFER,0,te),D.deleteBuffer(Ke),D.deleteSync(Bt),te}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(C,P=null,z=0){const V=Math.pow(2,-z),N=Math.floor(C.image.width*V),te=Math.floor(C.image.height*V),ue=P!==null?P.x:0,be=P!==null?P.y:0;Xe.setTexture2D(C,0),D.copyTexSubImage2D(D.TEXTURE_2D,z,0,0,ue,be,N,te),Se.unbindTexture()};const vb=D.createFramebuffer(),yb=D.createFramebuffer();this.copyTextureToTexture=function(C,P,z=null,V=null,N=0,te=null){te===null&&(N!==0?(Fr("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),te=N,N=0):te=0);let ue,be,pe,Le,Ue,Ie,Ke,ht,Bt;const bt=C.isCompressedTexture?C.mipmaps[te]:C.image;if(z!==null)ue=z.max.x-z.min.x,be=z.max.y-z.min.y,pe=z.isBox3?z.max.z-z.min.z:1,Le=z.min.x,Ue=z.min.y,Ie=z.isBox3?z.min.z:0;else{const wn=Math.pow(2,-N);ue=Math.floor(bt.width*wn),be=Math.floor(bt.height*wn),C.isDataArrayTexture?pe=bt.depth:C.isData3DTexture?pe=Math.floor(bt.depth*wn):pe=1,Le=0,Ue=0,Ie=0}V!==null?(Ke=V.x,ht=V.y,Bt=V.z):(Ke=0,ht=0,Bt=0);const ft=ve.convert(P.format),Re=ve.convert(P.type);let wt;P.isData3DTexture?(Xe.setTexture3D(P,0),wt=D.TEXTURE_3D):P.isDataArrayTexture||P.isCompressedArrayTexture?(Xe.setTexture2DArray(P,0),wt=D.TEXTURE_2D_ARRAY):(Xe.setTexture2D(P,0),wt=D.TEXTURE_2D),D.pixelStorei(D.UNPACK_FLIP_Y_WEBGL,P.flipY),D.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL,P.premultiplyAlpha),D.pixelStorei(D.UNPACK_ALIGNMENT,P.unpackAlignment);const tt=D.getParameter(D.UNPACK_ROW_LENGTH),mn=D.getParameter(D.UNPACK_IMAGE_HEIGHT),zs=D.getParameter(D.UNPACK_SKIP_PIXELS),gn=D.getParameter(D.UNPACK_SKIP_ROWS),ia=D.getParameter(D.UNPACK_SKIP_IMAGES);D.pixelStorei(D.UNPACK_ROW_LENGTH,bt.width),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,bt.height),D.pixelStorei(D.UNPACK_SKIP_PIXELS,Le),D.pixelStorei(D.UNPACK_SKIP_ROWS,Ue),D.pixelStorei(D.UNPACK_SKIP_IMAGES,Ie);const Tt=C.isDataArrayTexture||C.isData3DTexture,Mn=P.isDataArrayTexture||P.isData3DTexture;if(C.isDepthTexture){const wn=ge.get(C),tn=ge.get(P),dn=ge.get(wn.__renderTarget),ul=ge.get(tn.__renderTarget);Se.bindFramebuffer(D.READ_FRAMEBUFFER,dn.__webglFramebuffer),Se.bindFramebuffer(D.DRAW_FRAMEBUFFER,ul.__webglFramebuffer);for(let ss=0;ss<pe;ss++)Tt&&(D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,ge.get(C).__webglTexture,N,Ie+ss),D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,ge.get(P).__webglTexture,te,Bt+ss)),D.blitFramebuffer(Le,Ue,ue,be,Ke,ht,ue,be,D.DEPTH_BUFFER_BIT,D.NEAREST);Se.bindFramebuffer(D.READ_FRAMEBUFFER,null),Se.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else if(N!==0||C.isRenderTargetTexture||ge.has(C)){const wn=ge.get(C),tn=ge.get(P);Se.bindFramebuffer(D.READ_FRAMEBUFFER,vb),Se.bindFramebuffer(D.DRAW_FRAMEBUFFER,yb);for(let dn=0;dn<pe;dn++)Tt?D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,wn.__webglTexture,N,Ie+dn):D.framebufferTexture2D(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,wn.__webglTexture,N),Mn?D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,tn.__webglTexture,te,Bt+dn):D.framebufferTexture2D(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,tn.__webglTexture,te),N!==0?D.blitFramebuffer(Le,Ue,ue,be,Ke,ht,ue,be,D.COLOR_BUFFER_BIT,D.NEAREST):Mn?D.copyTexSubImage3D(wt,te,Ke,ht,Bt+dn,Le,Ue,ue,be):D.copyTexSubImage2D(wt,te,Ke,ht,Le,Ue,ue,be);Se.bindFramebuffer(D.READ_FRAMEBUFFER,null),Se.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else Mn?C.isDataTexture||C.isData3DTexture?D.texSubImage3D(wt,te,Ke,ht,Bt,ue,be,pe,ft,Re,bt.data):P.isCompressedArrayTexture?D.compressedTexSubImage3D(wt,te,Ke,ht,Bt,ue,be,pe,ft,bt.data):D.texSubImage3D(wt,te,Ke,ht,Bt,ue,be,pe,ft,Re,bt):C.isDataTexture?D.texSubImage2D(D.TEXTURE_2D,te,Ke,ht,ue,be,ft,Re,bt.data):C.isCompressedTexture?D.compressedTexSubImage2D(D.TEXTURE_2D,te,Ke,ht,bt.width,bt.height,ft,bt.data):D.texSubImage2D(D.TEXTURE_2D,te,Ke,ht,ue,be,ft,Re,bt);D.pixelStorei(D.UNPACK_ROW_LENGTH,tt),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,mn),D.pixelStorei(D.UNPACK_SKIP_PIXELS,zs),D.pixelStorei(D.UNPACK_SKIP_ROWS,gn),D.pixelStorei(D.UNPACK_SKIP_IMAGES,ia),te===0&&P.generateMipmaps&&D.generateMipmap(wt),Se.unbindTexture()},this.copyTextureToTexture3D=function(C,P,z=null,V=null,N=0){return Fr('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(C,P,z,V,N)},this.initRenderTarget=function(C){ge.get(C).__webglFramebuffer===void 0&&Xe.setupRenderTarget(C)},this.initTexture=function(C){C.isCubeTexture?Xe.setTextureCube(C,0):C.isData3DTexture?Xe.setTexture3D(C,0):C.isDataArrayTexture||C.isCompressedArrayTexture?Xe.setTexture2DArray(C,0):Xe.setTexture2D(C,0),Se.unbindTexture()},this.resetState=function(){I=0,M=0,w=null,Se.reset(),he.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return ii}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=Je._getDrawingBufferColorSpace(e),t.unpackColorSpace=Je._getUnpackColorSpace()}}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Va=globalThis,zc=Va.trustedTypes,dp=zc?zc.createPolicy("lit-html",{createHTML:r=>r}):void 0,jg="$lit$",qi=`lit$${Math.random().toFixed(9).slice(2)}$`,Yg="?"+qi,kC=`<${Yg}>`,ks=document,ro=()=>ks.createComment(""),ao=r=>r===null||typeof r!="object"&&typeof r!="function",Bd=Array.isArray,QC=r=>Bd(r)||typeof r?.[Symbol.iterator]=="function",Xl=`[ 	
\f\r]`,da=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,fp=/-->/g,pp=/>/g,us=RegExp(`>|${Xl}(?:([^\\s"'>=/]+)(${Xl}*=${Xl}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Ap=/'/g,mp=/"/g,Kg=/^(?:script|style|textarea|title)$/i,GC=r=>(e,...t)=>({_$litType$:r,strings:e,values:t}),rl=GC(1),jr=Symbol.for("lit-noChange"),zt=Symbol.for("lit-nothing"),gp=new WeakMap,Ts=ks.createTreeWalker(ks,129);function Jg(r,e){if(!Bd(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return dp!==void 0?dp.createHTML(e):e}const HC=(r,e)=>{const t=r.length-1,n=[];let i,s=e===2?"<svg>":e===3?"<math>":"",a=da;for(let o=0;o<t;o++){const c=r[o];let l,u,h=-1,d=0;for(;d<c.length&&(a.lastIndex=d,u=a.exec(c),u!==null);)d=a.lastIndex,a===da?u[1]==="!--"?a=fp:u[1]!==void 0?a=pp:u[2]!==void 0?(Kg.test(u[2])&&(i=RegExp("</"+u[2],"g")),a=us):u[3]!==void 0&&(a=us):a===us?u[0]===">"?(a=i??da,h=-1):u[1]===void 0?h=-2:(h=a.lastIndex-u[2].length,l=u[1],a=u[3]===void 0?us:u[3]==='"'?mp:Ap):a===mp||a===Ap?a=us:a===fp||a===pp?a=da:(a=us,i=void 0);const f=a===us&&r[o+1].startsWith("/>")?" ":"";s+=a===da?c+kC:h>=0?(n.push(l),c.slice(0,h)+jg+c.slice(h)+qi+f):c+qi+(h===-2?o:f)}return[Jg(r,s+(r[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),n]};class oo{constructor({strings:e,_$litType$:t},n){let i;this.parts=[];let s=0,a=0;const o=e.length-1,c=this.parts,[l,u]=HC(e,t);if(this.el=oo.createElement(l,n),Ts.currentNode=this.el.content,t===2||t===3){const h=this.el.content.firstChild;h.replaceWith(...h.childNodes)}for(;(i=Ts.nextNode())!==null&&c.length<o;){if(i.nodeType===1){if(i.hasAttributes())for(const h of i.getAttributeNames())if(h.endsWith(jg)){const d=u[a++],f=i.getAttribute(h).split(qi),A=/([.?@])?(.*)/.exec(d);c.push({type:1,index:s,name:A[2],strings:f,ctor:A[1]==="."?VC:A[1]==="?"?WC:A[1]==="@"?qC:al}),i.removeAttribute(h)}else h.startsWith(qi)&&(c.push({type:6,index:s}),i.removeAttribute(h));if(Kg.test(i.tagName)){const h=i.textContent.split(qi),d=h.length-1;if(d>0){i.textContent=zc?zc.emptyScript:"";for(let f=0;f<d;f++)i.append(h[f],ro()),Ts.nextNode(),c.push({type:2,index:++s});i.append(h[d],ro())}}}else if(i.nodeType===8)if(i.data===Yg)c.push({type:2,index:s});else{let h=-1;for(;(h=i.data.indexOf(qi,h+1))!==-1;)c.push({type:7,index:s}),h+=qi.length-1}s++}}static createElement(e,t){const n=ks.createElement("template");return n.innerHTML=e,n}}function Yr(r,e,t=r,n){if(e===jr)return e;let i=n!==void 0?t._$Co?.[n]:t._$Cl;const s=ao(e)?void 0:e._$litDirective$;return i?.constructor!==s&&(i?._$AO?.(!1),s===void 0?i=void 0:(i=new s(r),i._$AT(r,t,n)),n!==void 0?(t._$Co??(t._$Co=[]))[n]=i:t._$Cl=i),i!==void 0&&(e=Yr(r,i._$AS(r,e.values),i,n)),e}class zC{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:n}=this._$AD,i=(e?.creationScope??ks).importNode(t,!0);Ts.currentNode=i;let s=Ts.nextNode(),a=0,o=0,c=n[0];for(;c!==void 0;){if(a===c.index){let l;c.type===2?l=new Dd(s,s.nextSibling,this,e):c.type===1?l=new c.ctor(s,c.name,c.strings,this,e):c.type===6&&(l=new XC(s,this,e)),this._$AV.push(l),c=n[++o]}a!==c?.index&&(s=Ts.nextNode(),a++)}return Ts.currentNode=ks,i}p(e){let t=0;for(const n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(e,n,t),t+=n.strings.length-2):n._$AI(e[t])),t++}}let Dd=class Zg{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,i){this.type=2,this._$AH=zt,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=Yr(this,e,t),ao(e)?e===zt||e==null||e===""?(this._$AH!==zt&&this._$AR(),this._$AH=zt):e!==this._$AH&&e!==jr&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):QC(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==zt&&ao(this._$AH)?this._$AA.nextSibling.data=e:this.T(ks.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:n}=e,i=typeof n=="number"?this._$AC(e):(n.el===void 0&&(n.el=oo.createElement(Jg(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===i)this._$AH.p(t);else{const s=new zC(i,this),a=s.u(this.options);s.p(t),this.T(a),this._$AH=s}}_$AC(e){let t=gp.get(e.strings);return t===void 0&&gp.set(e.strings,t=new oo(e)),t}k(e){Bd(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let n,i=0;for(const s of e)i===t.length?t.push(n=new Zg(this.O(ro()),this.O(ro()),this,this.options)):n=t[i],n._$AI(s),i++;i<t.length&&(this._$AR(n&&n._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const n=e.nextSibling;e.remove(),e=n}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}};class al{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,i,s){this.type=1,this._$AH=zt,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=s,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=zt}_$AI(e,t=this,n,i){const s=this.strings;let a=!1;if(s===void 0)e=Yr(this,e,t,0),a=!ao(e)||e!==this._$AH&&e!==jr,a&&(this._$AH=e);else{const o=e;let c,l;for(e=s[0],c=0;c<s.length-1;c++)l=Yr(this,o[n+c],t,c),l===jr&&(l=this._$AH[c]),a||(a=!ao(l)||l!==this._$AH[c]),l===zt?e=zt:e!==zt&&(e+=(l??"")+s[c+1]),this._$AH[c]=l}a&&!i&&this.j(e)}j(e){e===zt?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class VC extends al{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===zt?void 0:e}}let WC=class extends al{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==zt)}};class qC extends al{constructor(e,t,n,i,s){super(e,t,n,i,s),this.type=5}_$AI(e,t=this){if((e=Yr(this,e,t,0)??zt)===jr)return;const n=this._$AH,i=e===zt&&n!==zt||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,s=e!==zt&&(n===zt||i);i&&this.element.removeEventListener(this.name,this,n),s&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class XC{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){Yr(this,e)}}const $C=Va.litHtmlPolyfillSupport;$C?.(oo,Dd),(Va.litHtmlVersions??(Va.litHtmlVersions=[])).push("3.3.1");const e0=(r,e,t)=>{const n=t?.renderBefore??e;let i=n._$litPart$;if(i===void 0){const s=t?.renderBefore??null;n._$litPart$=i=new Dd(e.insertBefore(ro(),s),s,void 0,t??{})}return i._$AI(r),i};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Wa=globalThis;let yc=class extends Cs{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t;const e=super.createRenderRoot();return(t=this.renderOptions).renderBefore??(t.renderBefore=e.firstChild),e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=e0(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return jr}};yc._$litElement$=!0,yc.finalized=!0,Wa.litElementHydrateSupport?.({LitElement:yc});const jC=Wa.litElementPolyfillSupport;jC?.({LitElement:yc});(Wa.litElementVersions??(Wa.litElementVersions=[])).push("4.2.1");/* @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const t0=navigator.xr!=null&&self.XRSession!=null&&navigator.xr.isSessionSupported!=null,n0=t0&&self.XRSession.prototype.requestHitTestSource!=null,$l=self.ResizeObserver!=null,jl=self.IntersectionObserver!=null,i0=n0;(()=>{const r=navigator.userAgent||navigator.vendor||self.opera;let e=!1;return(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(r)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(r.substr(0,4)))&&(e=!0),e})();const YC=/android/i.test(navigator.userAgent),KC=/iPad|iPhone|iPod/.test(navigator.userAgent)&&!self.MSStream||navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1,JC=/firefox/i.test(navigator.userAgent),ZC=/OculusBrowser/.test(navigator.userAgent),eI=YC&&!JC&&!ZC,tI=!!(window.webkit&&window.webkit.messageHandlers),bp=(()=>{if(KC){if(tI)return!!/CriOS\/|EdgiOS\/|FxiOS\/|GSA\/|DuckDuckGo\//.test(navigator.userAgent);{const r=document.createElement("a");return!!(r.relList&&r.relList.supports&&r.relList.supports("ar"))}}else return!1})();/* @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const s0=r=>r&&r!=="null"?nI(r):null,_p=()=>{if(i0)return;const r=[];throw t0||r.push("WebXR Device API"),n0||r.push("WebXR Hit Test API"),new Error(`The following APIs are required for AR, but are missing in this browser: ${r.join(", ")}`)},nI=r=>new URL(r,window.location.toString()).toString(),iI=(r,e)=>{let t=null;const n=(...i)=>{t==null&&(r(...i),t=self.setTimeout(()=>t=null,e))};return n.flush=()=>{t!=null&&(self.clearTimeout(t),t=null)},n},Ep=(r,e)=>{let t=null;return(...n)=>{t!=null&&self.clearTimeout(t),t=self.setTimeout(()=>{t=null,r(...n)},e)}},ni=(r,e,t)=>Math.max(e,Math.min(t,r)),xp=(()=>{const r="model-viewer-debug-mode",e=new RegExp(`[?&]${r}(&|$)`);return()=>self.ModelViewerElement&&self.ModelViewerElement.debugMode||self.location&&self.location.search&&self.location.search.match(e)})(),sI=(r=0)=>new Promise(e=>setTimeout(e,r)),rI=(r,e,t=null)=>new Promise(n=>{function i(s){(!t||t(s))&&(n(s),r.removeEventListener(e,i))}r.addEventListener(e,i)});/* @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var ds=function(r,e,t,n){var i=arguments.length,s=i<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,t):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(r,e,t,n);else for(var o=r.length-1;o>=0;o--)(a=r[o])&&(s=(i<3?a(s):i>3?a(e,t,s):a(e,t))||s);return i>3&&s&&Object.defineProperty(e,t,s),s};const aI=.5,oI=0,cI=1,lI=1,La=Symbol("currentEnvironmentMap"),Fa=Symbol("currentBackground"),Vc=Symbol("updateEnvironment"),qo=Symbol("cancelEnvironmentUpdate"),hI=r=>{var e,t,n;class i extends r{constructor(){super(...arguments),this.environmentImage=null,this.skyboxImage=null,this.shadowIntensity=oI,this.shadowSoftness=cI,this.exposure=lI,this.toneMapping="auto",this.skyboxHeight="0",this[e]=null,this[t]=null,this[n]=null}updated(a){super.updated(a),a.has("shadowIntensity")&&(this[J].setShadowIntensity(this.shadowIntensity*aI),this[qt]()),a.has("shadowSoftness")&&(this[J].setShadowSoftness(this.shadowSoftness),this[qt]()),a.has("exposure")&&(this[J].exposure=this.exposure,this[qt]()),a.has("toneMapping")&&(this[J].toneMapping=this.toneMapping==="aces"?ug:this.toneMapping==="agx"?dg:this.toneMapping==="reinhard"?lg:this.toneMapping==="cineon"?hg:this.toneMapping==="linear"?cg:this.toneMapping==="none"?ai:Xa,this[qt]()),(a.has("environmentImage")||a.has("skyboxImage"))&&this[Kr]()&&this[Vc](),a.has("skyboxHeight")&&(this[J].setGroundedSkybox(),this[qt]())}hasBakedShadow(){return this[J].bakedShadows.size>0}async[(e=La,t=Fa,n=qo,Vc)](){const{skyboxImage:a,environmentImage:o}=this;this[qo]!=null&&(this[qo](),this[qo]=null);const{textureUtils:c}=this[lt];if(c==null)return;const l=this[Qs].beginActivity("environment-update");try{const{environmentMap:u,skybox:h}=await c.generateEnvironmentMapAndSkybox(s0(a),o,d=>l(ni(d,0,1)),this.withCredentials);this[La]!==u&&(this[La]=u,this.dispatchEvent(new CustomEvent("environment-change"))),h!=null?this[Fa]=h.name===u.name?u:h:this[Fa]=null,this[J].setEnvironmentAndSkybox(this[La],this[Fa])}catch(u){if(u instanceof Error)throw this[J].setEnvironmentAndSkybox(null,null),u}finally{l(1)}}}return ds([De({type:String,attribute:"environment-image"})],i.prototype,"environmentImage",void 0),ds([De({type:String,attribute:"skybox-image"})],i.prototype,"skyboxImage",void 0),ds([De({type:Number,attribute:"shadow-intensity"})],i.prototype,"shadowIntensity",void 0),ds([De({type:Number,attribute:"shadow-softness"})],i.prototype,"shadowSoftness",void 0),ds([De({type:Number})],i.prototype,"exposure",void 0),ds([De({type:String,attribute:"tone-mapping"})],i.prototype,"toneMapping",void 0),ds([De({type:String,attribute:"skybox-height"})],i.prototype,"skyboxHeight",void 0),i};/* @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const uI=rl`
<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" fill="#000000">
    <!-- NOTE(cdata): This SVG filter is a stop-gap until we can implement
         support for dynamic re-coloring of UI components -->
    <defs>
      <filter id="drop-shadow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1"/>
        <feOffset dx="0" dy="0" result="offsetblur"/>
        <feFlood flood-color="#000000"/>
        <feComposite in2="offsetblur" operator="in"/>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <path filter="url(#drop-shadow)" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
    <path d="M0 0h24v24H0z" fill="none"/>
</svg>`;/* @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dI=rl`
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="25" height="36">
    <defs>
        <path id="A" d="M.001.232h24.997V36H.001z" />
    </defs>
    <g transform="translate(-11 -4)" fill="none" fill-rule="evenodd">
        <path fill-opacity="0" fill="#fff" d="M0 0h44v44H0z" />
        <g transform="translate(11 3)">
            <path d="M8.733 11.165c.04-1.108.766-2.027 1.743-2.307a2.54 2.54 0 0 1 .628-.089c.16 0 .314.017.463.044 1.088.2 1.9 1.092 1.9 2.16v8.88h1.26c2.943-1.39 5-4.45 5-8.025a9.01 9.01 0 0 0-1.9-5.56l-.43-.5c-.765-.838-1.683-1.522-2.712-2-1.057-.49-2.226-.77-3.46-.77s-2.4.278-3.46.77c-1.03.478-1.947 1.162-2.71 2l-.43.5a9.01 9.01 0 0 0-1.9 5.56 9.04 9.04 0 0 0 .094 1.305c.03.21.088.41.13.617l.136.624c.083.286.196.56.305.832l.124.333a8.78 8.78 0 0 0 .509.953l.065.122a8.69 8.69 0 0 0 3.521 3.191l1.11.537v-9.178z" fill-opacity=".5" fill="#e4e4e4" />
            <path d="M22.94 26.218l-2.76 7.74c-.172.485-.676.8-1.253.8H12.24c-1.606 0-3.092-.68-3.98-1.82-1.592-2.048-3.647-3.822-6.11-5.27-.095-.055-.15-.137-.152-.23-.004-.1.046-.196.193-.297.56-.393 1.234-.6 1.926-.6a3.43 3.43 0 0 1 .691.069l4.922.994V10.972c0-.663.615-1.203 1.37-1.203s1.373.54 1.373 1.203v9.882h2.953c.273 0 .533.073.757.21l6.257 3.874c.027.017.045.042.07.06.41.296.586.77.426 1.22M4.1 16.614c-.024-.04-.042-.083-.065-.122a8.69 8.69 0 0 1-.509-.953c-.048-.107-.08-.223-.124-.333l-.305-.832c-.058-.202-.09-.416-.136-.624l-.13-.617a9.03 9.03 0 0 1-.094-1.305c0-2.107.714-4.04 1.9-5.56l.43-.5c.764-.84 1.682-1.523 2.71-2 1.058-.49 2.226-.77 3.46-.77s2.402.28 3.46.77c1.03.477 1.947 1.16 2.712 2l.428.5a9 9 0 0 1 1.901 5.559c0 3.577-2.056 6.636-5 8.026h-1.26v-8.882c0-1.067-.822-1.96-1.9-2.16-.15-.028-.304-.044-.463-.044-.22 0-.427.037-.628.09-.977.28-1.703 1.198-1.743 2.306v9.178l-1.11-.537C6.18 19.098 4.96 18 4.1 16.614M22.97 24.09l-6.256-3.874c-.102-.063-.218-.098-.33-.144 2.683-1.8 4.354-4.855 4.354-8.243 0-.486-.037-.964-.104-1.43a9.97 9.97 0 0 0-1.57-4.128l-.295-.408-.066-.092a10.05 10.05 0 0 0-.949-1.078c-.342-.334-.708-.643-1.094-.922-1.155-.834-2.492-1.412-3.94-1.65l-.732-.088-.748-.03a9.29 9.29 0 0 0-1.482.119c-1.447.238-2.786.816-3.94 1.65a9.33 9.33 0 0 0-.813.686 9.59 9.59 0 0 0-.845.877l-.385.437-.36.5-.288.468-.418.778-.04.09c-.593 1.28-.93 2.71-.93 4.222 0 3.832 2.182 7.342 5.56 8.938l1.437.68v4.946L5 25.64a4.44 4.44 0 0 0-.888-.086c-.017 0-.034.003-.05.003-.252.004-.503.033-.75.08a5.08 5.08 0 0 0-.237.056c-.193.046-.382.107-.568.18-.075.03-.15.057-.225.1-.25.114-.494.244-.723.405a1.31 1.31 0 0 0-.566 1.122 1.28 1.28 0 0 0 .645 1.051C4 29.925 5.96 31.614 7.473 33.563a5.06 5.06 0 0 0 .434.491c1.086 1.082 2.656 1.713 4.326 1.715h6.697c.748-.001 1.43-.333 1.858-.872.142-.18.256-.38.336-.602l2.757-7.74c.094-.26.13-.53.112-.794s-.088-.52-.203-.76a2.19 2.19 0 0 0-.821-.91" fill-opacity=".6" fill="#000" />
            <path d="M22.444 24.94l-6.257-3.874a1.45 1.45 0 0 0-.757-.211h-2.953v-9.88c0-.663-.616-1.203-1.373-1.203s-1.37.54-1.37 1.203v16.643l-4.922-.994a3.44 3.44 0 0 0-.692-.069 3.35 3.35 0 0 0-1.925.598c-.147.102-.198.198-.194.298.004.094.058.176.153.23 2.462 1.448 4.517 3.22 6.11 5.27.887 1.14 2.373 1.82 3.98 1.82h6.686c.577 0 1.08-.326 1.253-.8l2.76-7.74c.16-.448-.017-.923-.426-1.22-.025-.02-.043-.043-.07-.06z" fill="#fff" />
            <g transform="translate(0 .769)">
                <mask id="B" fill="#fff">
                    <use xlink:href="#A" />
                </mask>
                <path d="M23.993 24.992a1.96 1.96 0 0 1-.111.794l-2.758 7.74c-.08.22-.194.423-.336.602-.427.54-1.11.87-1.857.872h-6.698c-1.67-.002-3.24-.633-4.326-1.715-.154-.154-.3-.318-.434-.49C5.96 30.846 4 29.157 1.646 27.773c-.385-.225-.626-.618-.645-1.05a1.31 1.31 0 0 1 .566-1.122 4.56 4.56 0 0 1 .723-.405l.225-.1a4.3 4.3 0 0 1 .568-.18l.237-.056c.248-.046.5-.075.75-.08.018 0 .034-.003.05-.003.303-.001.597.027.89.086l3.722.752V20.68l-1.436-.68c-3.377-1.596-5.56-5.106-5.56-8.938 0-1.51.336-2.94.93-4.222.015-.03.025-.06.04-.09.127-.267.268-.525.418-.778.093-.16.186-.316.288-.468.063-.095.133-.186.2-.277L3.773 5c.118-.155.26-.29.385-.437.266-.3.544-.604.845-.877a9.33 9.33 0 0 1 .813-.686C6.97 2.167 8.31 1.59 9.757 1.35a9.27 9.27 0 0 1 1.481-.119 8.82 8.82 0 0 1 .748.031c.247.02.49.05.733.088 1.448.238 2.786.816 3.94 1.65.387.28.752.588 1.094.922a9.94 9.94 0 0 1 .949 1.078l.066.092c.102.133.203.268.295.408a9.97 9.97 0 0 1 1.571 4.128c.066.467.103.945.103 1.43 0 3.388-1.67 6.453-4.353 8.243.11.046.227.08.33.144l6.256 3.874c.37.23.645.55.82.9.115.24.185.498.203.76m.697-1.195c-.265-.55-.677-1.007-1.194-1.326l-5.323-3.297c2.255-2.037 3.564-4.97 3.564-8.114 0-2.19-.637-4.304-1.84-6.114-.126-.188-.26-.37-.4-.552-.645-.848-1.402-1.6-2.252-2.204C15.472.91 13.393.232 11.238.232A10.21 10.21 0 0 0 5.23 2.19c-.848.614-1.606 1.356-2.253 2.205-.136.18-.272.363-.398.55C1.374 6.756.737 8.87.737 11.06c0 4.218 2.407 8.08 6.133 9.842l.863.41v3.092l-2.525-.51c-.356-.07-.717-.106-1.076-.106a5.45 5.45 0 0 0-3.14.996c-.653.46-1.022 1.202-.99 1.983a2.28 2.28 0 0 0 1.138 1.872c2.24 1.318 4.106 2.923 5.543 4.772 1.26 1.62 3.333 2.59 5.55 2.592h6.698c1.42-.001 2.68-.86 3.134-2.138l2.76-7.74c.272-.757.224-1.584-.134-2.325" fill-opacity=".05" fill="#000" mask="url(#B)" />
            </g>
        </g>
    </g>
</svg>`;/* @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fI=rl`
<svg version="1.1" id="view_x5F_in_x5F_AR_x5F_icon"
	 xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="24px" height="24px"
	 viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve">
<rect id="Bounding_Box" x="0" y="0" fill="none" width="24" height="24"/>
<g id="Art_layer">
	<path d="M3,4c0-0.55,0.45-1,1-1h2V1H4C2.35,1,1,2.35,1,4v2h2V4z"/>
	<path d="M20,3c0.55,0,1,0.45,1,1v2h2V4c0-1.65-1.35-3-3-3h-2v2H20z"/>
	<path d="M4,21c-0.55,0-1-0.45-1-1v-2H1v2c0,1.65,1.35,3,3,3h2v-2H4z"/>
	<path d="M20,21c0.55,0,1-0.45,1-1v-2h2v2c0,1.65-1.35,3-3,3h-2v-2H20z"/>
	<g>
		<path d="M18.25,7.6l-5.5-3.18c-0.46-0.27-1.04-0.27-1.5,0L5.75,7.6C5.29,7.87,5,8.36,5,8.9v6.35c0,0.54,0.29,1.03,0.75,1.3
			l5.5,3.18c0.46,0.27,1.04,0.27,1.5,0l5.5-3.18c0.46-0.27,0.75-0.76,0.75-1.3V8.9C19,8.36,18.71,7.87,18.25,7.6z M7,14.96v-4.62
			l4,2.32v4.61L7,14.96z M12,10.93L8,8.61l4-2.31l4,2.31L12,10.93z M13,17.27v-4.61l4-2.32v4.62L13,17.27z"/>
	</g>
</g>
</svg>`;/* @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pI=rl`
<style>
:host {
  display: block;
  position: relative;
  contain: strict;
  width: 300px;
  height: 150px;
}

.container {
  position: relative;
  overflow: hidden;
}

.userInput {
  width: 100%;
  height: 100%;
  display: none;
  position: relative;
  outline-offset: -1px;
  outline-width: 1px;
}

canvas {
  position: absolute;
  display: none;
  pointer-events: none;
  /* NOTE(cdata): Chrome 76 and below apparently have a bug
   * that causes our canvas not to display pixels unless it is
   * on its own render layer
   * @see https://github.com/google/model-viewer/pull/755#issuecomment-536597893
   */
  transform: translateZ(0);
}

.show {
  display: block;
}

/* Adapted from HTML5 Boilerplate
 *
 * @see https://github.com/h5bp/html5-boilerplate/blob/ceb4620c78fc82e13534fc44202a3f168754873f/dist/css/main.css#L122-L133 */
.screen-reader-only {
  border: 0;
  left: 0;
  top: 0;
  clip: rect(0, 0, 0, 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
  pointer-events: none;
}

.slot {
  position: absolute;
  pointer-events: none;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.slot > * {
  pointer-events: initial;
}

.annotation-wrapper ::slotted(*) {
  opacity: var(--max-hotspot-opacity, 1);
  transition: opacity 0.3s;
}

.pointer-tumbling .annotation-wrapper ::slotted(*) {
  pointer-events: none;
}

.annotation-wrapper ::slotted(*) {
  pointer-events: initial;
}

.annotation-wrapper.hide ::slotted(*) {
  opacity: var(--min-hotspot-opacity, 0.25);
}

.slot.poster {
  display: none;
  background-color: inherit;
}

.slot.poster.show {
  display: inherit;
}

.slot.poster > * {
  pointer-events: initial;
}

.slot.poster:not(.show) > * {
  pointer-events: none;
}

#default-poster {
  width: 100%;
  height: 100%;
  /* The default poster is a <button> so we need to set display
   * to prevent it from being affected by text-align: */
  display: block;
  position: absolute;
  border: none;
  padding: 0;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  background-color: #fff0;
}

#default-progress-bar {
  display: block;
  position: relative;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

#default-progress-bar > .bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: var(--progress-bar-height, 5px);
  background-color: var(--progress-bar-color, rgba(0, 0, 0, 0.4));
  transition: transform 0.09s;
  transform-origin: top left;
  transform: scaleX(0);
  overflow: hidden;
}

#default-progress-bar > .bar.hide {
  transition: opacity 0.3s 1s;
  opacity: 0;
}

.centered {
  align-items: center;
  justify-content: center;
}

.cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.slot.interaction-prompt {
  display: var(--interaction-prompt-display, flex);
  overflow: hidden;
  opacity: 0;
  will-change: opacity;
  transition: opacity 0.3s;
}

.slot.interaction-prompt.visible {
  opacity: 1;
}

.animated-container {
  will-change: transform, opacity;
  opacity: 0;
  transition: opacity 0.3s;
}

.slot.interaction-prompt > * {
  pointer-events: none;
}

.slot.ar-button {
  -moz-user-select: none;
  -webkit-tap-highlight-color: transparent;
  user-select: none;

  display: var(--ar-button-display, block);
}

.slot.ar-button:not(.enabled) {
  display: none;
}

.fab {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 40px;
  height: 40px;
  cursor: pointer;
  background-color: #fff;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.15);
  border-radius: 100px;
}

.fab > * {
  opacity: 0.87;
}

#default-ar-button {
  position: absolute;
  bottom: 16px;
  right: 16px;
  transform: scale(var(--ar-button-scale, 1));
  transform-origin: bottom right;
}

.slot.pan-target {
  display: block;
  position: absolute;
  width: 0;
  height: 0;
  left: 50%;
  top: 50%;
  transform: translate3d(-50%, -50%, 0);
  background-color: transparent;
  opacity: 0;
  transition: opacity 0.3s;
}

#default-pan-target {
  width: 6px;
  height: 6px;
  border-radius: 6px;
  border: 1px solid white;
  box-shadow: 0px 0px 2px 1px rgba(0, 0, 0, 0.8);
}

.slot.default {
  pointer-events: none;
}

.slot.progress-bar {
  pointer-events: none;
}

.slot.exit-webxr-ar-button {
  pointer-events: none;
}

.slot.exit-webxr-ar-button:not(.enabled) {
  display: none;
}

#default-exit-webxr-ar-button {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: env(safe-area-inset-top, 16px);
  right: 16px;
  width: 40px;
  height: 40px;
  box-sizing: border-box;
}

#default-exit-webxr-ar-button > svg {
  fill: #fff;
}
</style>
<div class="container">
  <div class="userInput" tabindex="0" role="img"
      aria-label="3D model">
      <div class="slot canvas">
        <slot name="canvas">
          <canvas></canvas>
        </slot>
      </div>

  </div>

  <!-- NOTE(cdata): We need to wrap slots because browsers without ShadowDOM
        will have their <slot> elements removed by ShadyCSS -->
  <div class="slot poster">
    <slot name="poster">
      <button type="button" id="default-poster" aria-hidden="true" aria-label="Loading 3D model"></button>
    </slot>
  </div>

  <div class="slot ar-button">
    <slot name="ar-button">
      <a id="default-ar-button" part="default-ar-button" class="fab"
          tabindex="2"
          role="button"
          href="javascript:void(0);"
          aria-label="View in your space">
        ${fI}
      </a>
    </slot>
  </div>

  <div class="slot pan-target">
    <slot name="pan-target">
      <div id="default-pan-target">
      </div>
    </slot>
  </div>

  <div class="slot interaction-prompt cover centered">
    <div id="prompt" class="animated-container">
      <slot name="interaction-prompt" aria-hidden="true">
        ${dI}
      </slot>
    </div>
  </div>

  <div id="finger0" class="animated-container cover">
    <slot name="finger0" aria-hidden="true">
    </slot>
  </div>
  <div id="finger1" class="animated-container cover">
    <slot name="finger1" aria-hidden="true">
    </slot>
  </div>

  <div class="slot default">
    <slot></slot>

    <div class="slot progress-bar">
      <slot name="progress-bar">
        <div id="default-progress-bar" aria-hidden="true">
          <div class="bar" part="default-progress-bar"></div>
        </div>
      </slot>
    </div>

    <div class="slot exit-webxr-ar-button">
      <slot name="exit-webxr-ar-button">
        <a id="default-exit-webxr-ar-button" part="default-exit-webxr-ar-button"
            tabindex="3"
            aria-label="Exit AR"
            aria-hidden="true">
          ${uI}
        </a>
      </slot>
    </div>
  </div>
</div>
<div class="screen-reader-only" role="region" aria-label="Live announcements">
  <span id="status" role="status"></span>
</div>`,AI=r=>{e0(pI,r)};var vp=function(){var r="b9H79Tebbbe8Fv9Gbb9Gvuuuuueu9Giuuub9Geueu9Giuuueuikqbeeedddillviebeoweuec:q:Odkr;leDo9TW9T9VV95dbH9F9F939H79T9F9J9H229F9Jt9VV7bb8A9TW79O9V9Wt9F9KW9J9V9KW9wWVtW949c919M9MWVbeY9TW79O9V9Wt9F9KW9J9V9KW69U9KW949c919M9MWVbdE9TW79O9V9Wt9F9KW9J9V9KW69U9KW949tWG91W9U9JWbiL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9p9JtblK9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9r919HtbvL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVT949Wbol79IV9Rbrq;w8Wqdbk;esezu8Jjjjjbcj;eb9Rgv8Kjjjjbc9:hodnadcefal0mbcuhoaiRbbc:Ge9hmbavaialfgrad9Radz1jjjbhwcj;abad9Uc;WFbGgocjdaocjd6EhDaicefhocbhqdnindndndnaeaq9nmbaDaeaq9RaqaDfae6Egkcsfglcl4cifcd4hxalc9WGgmTmecbhPawcjdfhsaohzinaraz9Rax6mvarazaxfgo9RcK6mvczhlcbhHinalgic9WfgOawcj;cbffhldndndndndnazaOco4fRbbaHcoG4ciGPlbedibkal9cb83ibalcwf9cb83ibxikalaoRblaoRbbgOco4gAaAciSgAE86bbawcj;cbfaifglcGfaoclfaAfgARbbaOcl4ciGgCaCciSgCE86bbalcVfaAaCfgARbbaOcd4ciGgCaCciSgCE86bbalc7faAaCfgARbbaOciGgOaOciSgOE86bbalctfaAaOfgARbbaoRbegOco4gCaCciSgCE86bbalc91faAaCfgARbbaOcl4ciGgCaCciSgCE86bbalc4faAaCfgARbbaOcd4ciGgCaCciSgCE86bbalc93faAaCfgARbbaOciGgOaOciSgOE86bbalc94faAaOfgARbbaoRbdgOco4gCaCciSgCE86bbalc95faAaCfgARbbaOcl4ciGgCaCciSgCE86bbalc96faAaCfgARbbaOcd4ciGgCaCciSgCE86bbalc97faAaCfgARbbaOciGgOaOciSgOE86bbalc98faAaOfgORbbaoRbigoco4gAaAciSgAE86bbalc99faOaAfgORbbaocl4ciGgAaAciSgAE86bbalc9:faOaAfgORbbaocd4ciGgAaAciSgAE86bbalcufaOaAfglRbbaociGgoaociSgoE86bbalaofhoxdkalaoRbwaoRbbgOcl4gAaAcsSgAE86bbawcj;cbfaifglcGfaocwfaAfgARbbaOcsGgOaOcsSgOE86bbalcVfaAaOfgORbbaoRbegAcl4gCaCcsSgCE86bbalc7faOaCfgORbbaAcsGgAaAcsSgAE86bbalctfaOaAfgORbbaoRbdgAcl4gCaCcsSgCE86bbalc91faOaCfgORbbaAcsGgAaAcsSgAE86bbalc4faOaAfgORbbaoRbigAcl4gCaCcsSgCE86bbalc93faOaCfgORbbaAcsGgAaAcsSgAE86bbalc94faOaAfgORbbaoRblgAcl4gCaCcsSgCE86bbalc95faOaCfgORbbaAcsGgAaAcsSgAE86bbalc96faOaAfgORbbaoRbvgAcl4gCaCcsSgCE86bbalc97faOaCfgORbbaAcsGgAaAcsSgAE86bbalc98faOaAfgORbbaoRbogAcl4gCaCcsSgCE86bbalc99faOaCfgORbbaAcsGgAaAcsSgAE86bbalc9:faOaAfgORbbaoRbrgocl4gAaAcsSgAE86bbalcufaOaAfglRbbaocsGgoaocsSgoE86bbalaofhoxekalao8Pbb83bbalcwfaocwf8Pbb83bbaoczfhokdnaiam9pmbaHcdfhHaiczfhlarao9RcL0mekkaiam6mvaoTmvdnakTmbawaPfRbbhHawcj;cbfhlashiakhOinaialRbbgzce4cbazceG9R7aHfgH86bbaiadfhialcefhlaOcufgOmbkkascefhsaohzaPcefgPad9hmbxikkcbc99arao9Radcaadca0ESEhoxlkaoaxad2fhCdnakmbadhlinaoTmlarao9Rax6mlaoaxfhoalcufglmbkaChoxekcbhmawcjdfhAinarao9Rax6miawamfRbbhHawcj;cbfhlaAhiakhOinaialRbbgzce4cbazceG9R7aHfgH86bbaiadfhialcefhlaOcufgOmbkaAcefhAaoaxfhoamcefgmad9hmbkaChokabaqad2fawcjdfakad2z1jjjb8Aawawcjdfakcufad2fadz1jjjb8Aakaqfhqaombkc9:hoxekc9:hokavcj;ebf8Kjjjjbaok;cseHu8Jjjjjbc;ae9Rgv8Kjjjjbc9:hodnaeci9UgrcHfal0mbcuhoaiRbbgwc;WeGc;Ge9hmbawcsGgwce0mbavc;abfcFecjez:jjjjb8AavcUf9cu83ibavc8Wf9cu83ibavcyf9cu83ibavcaf9cu83ibavcKf9cu83ibavczf9cu83ibav9cu83iwav9cu83ibaialfc9WfhDaicefgqarfhidnaeTmbcmcsawceSEhkcbhxcbhmcbhPcbhwcbhlindnaiaD9nmbc9:hoxikdndnaqRbbgoc;Ve0mbavc;abfalaocu7gscl4fcsGcitfgzydlhrazydbhzdnaocsGgHak9pmbavawasfcsGcdtfydbaxaHEhoaHThsdndnadcd9hmbabaPcetfgHaz87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHazBdbaHcwfaoBdbaHclfarBdbkaxasfhxcdhHavawcdtfaoBdbawasfhwcehsalhOxdkdndnaHcsSmbaHc987aHamffcefhoxekaicefhoai8SbbgHcFeGhsdndnaHcu9mmbaohixekaicvfhiascFbGhscrhHdninao8SbbgOcFbGaHtasVhsaOcu9kmeaocefhoaHcrfgHc8J9hmbxdkkaocefhikasce4cbasceG9R7amfhokdndnadcd9hmbabaPcetfgHaz87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHazBdbaHcwfaoBdbaHclfarBdbkcdhHavawcdtfaoBdbcehsawcefhwalhOaohmxekdnaocpe0mbaxcefgHavawaDaocsGfRbbgocl49RcsGcdtfydbaocz6gzEhravawao9RcsGcdtfydbaHazfgAaocsGgHEhoaHThCdndnadcd9hmbabaPcetfgHax87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHaxBdbaHcwfaoBdbaHclfarBdbkcdhsavawcdtfaxBdbavawcefgwcsGcdtfarBdbcihHavc;abfalcitfgOaxBdlaOarBdbavawazfgwcsGcdtfaoBdbalcefcsGhOawaCfhwaxhzaAaCfhxxekaxcbaiRbbgOEgzaoc;:eSgHfhraOcsGhCaOcl4hAdndnaOcs0mbarcefhoxekarhoavawaA9RcsGcdtfydbhrkdndnaCmbaocefhxxekaohxavawaO9RcsGcdtfydbhokdndnaHTmbaicefhHxekaicdfhHai8SbegscFeGhzdnascu9kmbaicofhXazcFbGhzcrhidninaH8SbbgscFbGaitazVhzascu9kmeaHcefhHaicrfgic8J9hmbkaXhHxekaHcefhHkazce4cbazceG9R7amfgmhzkdndnaAcsSmbaHhsxekaHcefhsaH8SbbgicFeGhrdnaicu9kmbaHcvfhXarcFbGhrcrhidninas8SbbgHcFbGaitarVhraHcu9kmeascefhsaicrfgic8J9hmbkaXhsxekascefhskarce4cbarceG9R7amfgmhrkdndnaCcsSmbashixekascefhias8SbbgocFeGhHdnaocu9kmbascvfhXaHcFbGhHcrhodninai8SbbgscFbGaotaHVhHascu9kmeaicefhiaocrfgoc8J9hmbkaXhixekaicefhikaHce4cbaHceG9R7amfgmhokdndnadcd9hmbabaPcetfgHaz87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHazBdbaHcwfaoBdbaHclfarBdbkcdhsavawcdtfazBdbavawcefgwcsGcdtfarBdbcihHavc;abfalcitfgXazBdlaXarBdbavawaOcz6aAcsSVfgwcsGcdtfaoBdbawaCTaCcsSVfhwalcefcsGhOkaqcefhqavc;abfaOcitfgOarBdlaOaoBdbavc;abfalasfcsGcitfgraoBdlarazBdbawcsGhwalaHfcsGhlaPcifgPae6mbkkcbc99aiaDSEhokavc;aef8Kjjjjbaok:flevu8Jjjjjbcz9Rhvc9:hodnaecvfal0mbcuhoaiRbbc;:eGc;qe9hmbav9cb83iwaicefhraialfc98fhwdnaeTmbdnadcdSmbcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcdtfaic8Etc8F91aicd47avcwfaiceGcdtVgoydbfglBdbaoalBdbaDcefgDae9hmbxdkkcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcetfaic8Etc8F91aicd47avcwfaiceGcdtVgoydbfgl87ebaoalBdbaDcefgDae9hmbkkcbc99arawSEhokaok:Lvoeue99dud99eud99dndnadcl9hmbaeTmeindndnabcdfgd8Sbb:Yab8Sbbgi:Ygl:l:tabcefgv8Sbbgo:Ygr:l:tgwJbb;:9cawawNJbbbbawawJbbbb9GgDEgq:mgkaqaicb9iEalMgwawNakaqaocb9iEarMgqaqNMM:r:vglNJbbbZJbbb:;aDEMgr:lJbbb9p9DTmbar:Ohixekcjjjj94hikadai86bbdndnaqalNJbbbZJbbb:;aqJbbbb9GEMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkavad86bbdndnawalNJbbbZJbbb:;awJbbbb9GEMgw:lJbbb9p9DTmbaw:Ohdxekcjjjj94hdkabad86bbabclfhbaecufgembxdkkaeTmbindndnabclfgd8Ueb:Yab8Uebgi:Ygl:l:tabcdfgv8Uebgo:Ygr:l:tgwJb;:FSawawNJbbbbawawJbbbb9GgDEgq:mgkaqaicb9iEalMgwawNakaqaocb9iEarMgqaqNMM:r:vglNJbbbZJbbb:;aDEMgr:lJbbb9p9DTmbar:Ohixekcjjjj94hikadai87ebdndnaqalNJbbbZJbbb:;aqJbbbb9GEMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkavad87ebdndnawalNJbbbZJbbb:;awJbbbb9GEMgw:lJbbb9p9DTmbaw:Ohdxekcjjjj94hdkabad87ebabcwfhbaecufgembkkk;oiliui99iue99dnaeTmbcbhiabhlindndnJ;Zl81Zalcof8UebgvciV:Y:vgoal8Ueb:YNgrJb;:FSNJbbbZJbbb:;arJbbbb9GEMgw:lJbbb9p9DTmbaw:OhDxekcjjjj94hDkalclf8Uebhqalcdf8UebhkabaiavcefciGfcetfaD87ebdndnaoak:YNgwJb;:FSNJbbbZJbbb:;awJbbbb9GEMgx:lJbbb9p9DTmbax:OhDxekcjjjj94hDkabaiavciGfgkcd7cetfaD87ebdndnaoaq:YNgoJb;:FSNJbbbZJbbb:;aoJbbbb9GEMgx:lJbbb9p9DTmbax:OhDxekcjjjj94hDkabaiavcufciGfcetfaD87ebdndnJbbjZararN:tawawN:taoaoN:tgrJbbbbarJbbbb9GE:rJb;:FSNJbbbZMgr:lJbbb9p9DTmbar:Ohvxekcjjjj94hvkabakcetfav87ebalcwfhlaiclfhiaecufgembkkk9mbdnadcd4ae2gdTmbinababydbgecwtcw91:Yaece91cjjj98Gcjjj;8if::NUdbabclfhbadcufgdmbkkk9teiucbcbydj1jjbgeabcifc98GfgbBdj1jjbdndnabZbcztgd9nmbcuhiabad9RcFFifcz4nbcuSmekaehikaik;LeeeudndnaeabVciGTmbabhixekdndnadcz9pmbabhixekabhiinaiaeydbBdbaiclfaeclfydbBdbaicwfaecwfydbBdbaicxfaecxfydbBdbaeczfheaiczfhiadc9Wfgdcs0mbkkadcl6mbinaiaeydbBdbaeclfheaiclfhiadc98fgdci0mbkkdnadTmbinaiaeRbb86bbaicefhiaecefheadcufgdmbkkabk;aeedudndnabciGTmbabhixekaecFeGc:b:c:ew2hldndnadcz9pmbabhixekabhiinaialBdbaicxfalBdbaicwfalBdbaiclfalBdbaiczfhiadc9Wfgdcs0mbkkadcl6mbinaialBdbaiclfhiadc98fgdci0mbkkdnadTmbinaiae86bbaicefhiadcufgdmbkkabkkkebcjwklzNbb",e="b9H79TebbbeKl9Gbb9Gvuuuuueu9Giuuub9Geueuikqbbebeedddilve9Weeeviebeoweuec:q:6dkr;leDo9TW9T9VV95dbH9F9F939H79T9F9J9H229F9Jt9VV7bb8A9TW79O9V9Wt9F9KW9J9V9KW9wWVtW949c919M9MWVbdY9TW79O9V9Wt9F9KW9J9V9KW69U9KW949c919M9MWVblE9TW79O9V9Wt9F9KW9J9V9KW69U9KW949tWG91W9U9JWbvL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9p9JtboK9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9r919HtbrL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVT949Wbwl79IV9RbDq:p9sqlbzik9:evu8Jjjjjbcz9Rhbcbheincbhdcbhiinabcwfadfaicjuaead4ceGglE86bbaialfhiadcefgdcw9hmbkaec:q:yjjbfai86bbaecitc:q1jjbfab8Piw83ibaecefgecjd9hmbkk:N8JlHud97euo978Jjjjjbcj;kb9Rgv8Kjjjjbc9:hodnadcefal0mbcuhoaiRbbc:Ge9hmbavaialfgrad9Rad;8qbbcj;abad9UhlaicefhodnaeTmbadTmbalc;WFbGglcjdalcjd6EhwcbhDinawaeaD9RaDawfae6Egqcsfglc9WGgkci2hxakcethmalcl4cifcd4hPabaDad2fhsakc;ab6hzcbhHincbhOaohAdndninaraA9RaP6meavcj;cbfaOak2fhCaAaPfhocbhidnazmbarao9Rc;Gb6mbcbhlinaCalfhidndndndndnaAalco4fRbbgXciGPlbedibkaipxbbbbbbbbbbbbbbbbpklbxikaiaopbblaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklbaoclfaYpQbfaKc:q:yjjbfRbbfhoxdkaiaopbbwaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklbaocwfaYpQbfaKc:q:yjjbfRbbfhoxekaiaopbbbpklbaoczfhokdndndndndnaXcd4ciGPlbedibkaipxbbbbbbbbbbbbbbbbpklzxikaiaopbblaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklzaoclfaYpQbfaKc:q:yjjbfRbbfhoxdkaiaopbbwaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklzaocwfaYpQbfaKc:q:yjjbfRbbfhoxekaiaopbbbpklzaoczfhokdndndndndnaXcl4ciGPlbedibkaipxbbbbbbbbbbbbbbbbpklaxikaiaopbblaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklaaoclfaYpQbfaKc:q:yjjbfRbbfhoxdkaiaopbbwaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklaaocwfaYpQbfaKc:q:yjjbfRbbfhoxekaiaopbbbpklaaoczfhokdndndndndnaXco4Plbedibkaipxbbbbbbbbbbbbbbbbpkl8WxikaiaopbblaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibaXc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spkl8WaoclfaYpQbfaXc:q:yjjbfRbbfhoxdkaiaopbbwaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibaXc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spkl8WaocwfaYpQbfaXc:q:yjjbfRbbfhoxekaiaopbbbpkl8Waoczfhokalc;abfhialcjefak0meaihlarao9Rc;Fb0mbkkdnaiak9pmbaici4hlinarao9RcK6miaCaifhXdndndndndnaAaico4fRbbalcoG4ciGPlbedibkaXpxbbbbbbbbbbbbbbbbpkbbxikaXaopbblaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spkbbaoclfaYpQbfaKc:q:yjjbfRbbfhoxdkaXaopbbwaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spkbbaocwfaYpQbfaKc:q:yjjbfRbbfhoxekaXaopbbbpkbbaoczfhokalcdfhlaiczfgiak6mbkkaoTmeaohAaOcefgOclSmdxbkkc9:hoxlkdnakTmbavcjdfaHfhiavaHfpbdbhYcbhXinaiavcj;cbfaXfglpblbgLcep9TaLpxeeeeeeeeeeeeeeeegQp9op9Hp9rgLalakfpblbg8Acep9Ta8AaQp9op9Hp9rg8ApmbzeHdOiAlCvXoQrLgEalamfpblbg3cep9Ta3aQp9op9Hp9rg3alaxfpblbg5cep9Ta5aQp9op9Hp9rg5pmbzeHdOiAlCvXoQrLg8EpmbezHdiOAlvCXorQLgQaQpmbedibedibedibediaYp9UgYp9AdbbaiadfglaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaladfglaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaladfglaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaladfglaYaEa8EpmwDKYqk8AExm35Ps8E8FgQaQpmbedibedibedibedip9UgYp9AdbbaladfglaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaladfglaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaladfglaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaladfglaYaLa8ApmwKDYq8AkEx3m5P8Es8FgLa3a5pmwKDYq8AkEx3m5P8Es8Fg8ApmbezHdiOAlvCXorQLgQaQpmbedibedibedibedip9UgYp9AdbbaladfglaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaladfglaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaladfglaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaladfglaYaLa8ApmwDKYqk8AExm35Ps8E8FgQaQpmbedibedibedibedip9UgYp9AdbbaladfglaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaladfglaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaladfglaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaladfhiaXczfgXak6mbkkaHclfgHad6mbkasavcjdfaqad2;8qbbavavcjdfaqcufad2fad;8qbbaqaDfgDae6mbkkcbc99arao9Radcaadca0ESEhokavcj;kbf8Kjjjjbaokwbz:bjjjbk::seHu8Jjjjjbc;ae9Rgv8Kjjjjbc9:hodnaeci9UgrcHfal0mbcuhoaiRbbgwc;WeGc;Ge9hmbawcsGgwce0mbavc;abfcFecje;8kbavcUf9cu83ibavc8Wf9cu83ibavcyf9cu83ibavcaf9cu83ibavcKf9cu83ibavczf9cu83ibav9cu83iwav9cu83ibaialfc9WfhDaicefgqarfhidnaeTmbcmcsawceSEhkcbhxcbhmcbhPcbhwcbhlindnaiaD9nmbc9:hoxikdndnaqRbbgoc;Ve0mbavc;abfalaocu7gscl4fcsGcitfgzydlhrazydbhzdnaocsGgHak9pmbavawasfcsGcdtfydbaxaHEhoaHThsdndnadcd9hmbabaPcetfgHaz87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHazBdbaHcwfaoBdbaHclfarBdbkaxasfhxcdhHavawcdtfaoBdbawasfhwcehsalhOxdkdndnaHcsSmbaHc987aHamffcefhoxekaicefhoai8SbbgHcFeGhsdndnaHcu9mmbaohixekaicvfhiascFbGhscrhHdninao8SbbgOcFbGaHtasVhsaOcu9kmeaocefhoaHcrfgHc8J9hmbxdkkaocefhikasce4cbasceG9R7amfhokdndnadcd9hmbabaPcetfgHaz87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHazBdbaHcwfaoBdbaHclfarBdbkcdhHavawcdtfaoBdbcehsawcefhwalhOaohmxekdnaocpe0mbaxcefgHavawaDaocsGfRbbgocl49RcsGcdtfydbaocz6gzEhravawao9RcsGcdtfydbaHazfgAaocsGgHEhoaHThCdndnadcd9hmbabaPcetfgHax87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHaxBdbaHcwfaoBdbaHclfarBdbkcdhsavawcdtfaxBdbavawcefgwcsGcdtfarBdbcihHavc;abfalcitfgOaxBdlaOarBdbavawazfgwcsGcdtfaoBdbalcefcsGhOawaCfhwaxhzaAaCfhxxekaxcbaiRbbgOEgzaoc;:eSgHfhraOcsGhCaOcl4hAdndnaOcs0mbarcefhoxekarhoavawaA9RcsGcdtfydbhrkdndnaCmbaocefhxxekaohxavawaO9RcsGcdtfydbhokdndnaHTmbaicefhHxekaicdfhHai8SbegscFeGhzdnascu9kmbaicofhXazcFbGhzcrhidninaH8SbbgscFbGaitazVhzascu9kmeaHcefhHaicrfgic8J9hmbkaXhHxekaHcefhHkazce4cbazceG9R7amfgmhzkdndnaAcsSmbaHhsxekaHcefhsaH8SbbgicFeGhrdnaicu9kmbaHcvfhXarcFbGhrcrhidninas8SbbgHcFbGaitarVhraHcu9kmeascefhsaicrfgic8J9hmbkaXhsxekascefhskarce4cbarceG9R7amfgmhrkdndnaCcsSmbashixekascefhias8SbbgocFeGhHdnaocu9kmbascvfhXaHcFbGhHcrhodninai8SbbgscFbGaotaHVhHascu9kmeaicefhiaocrfgoc8J9hmbkaXhixekaicefhikaHce4cbaHceG9R7amfgmhokdndnadcd9hmbabaPcetfgHaz87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHazBdbaHcwfaoBdbaHclfarBdbkcdhsavawcdtfazBdbavawcefgwcsGcdtfarBdbcihHavc;abfalcitfgXazBdlaXarBdbavawaOcz6aAcsSVfgwcsGcdtfaoBdbawaCTaCcsSVfhwalcefcsGhOkaqcefhqavc;abfaOcitfgOarBdlaOaoBdbavc;abfalasfcsGcitfgraoBdlarazBdbawcsGhwalaHfcsGhlaPcifgPae6mbkkcbc99aiaDSEhokavc;aef8Kjjjjbaok:flevu8Jjjjjbcz9Rhvc9:hodnaecvfal0mbcuhoaiRbbc;:eGc;qe9hmbav9cb83iwaicefhraialfc98fhwdnaeTmbdnadcdSmbcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcdtfaic8Etc8F91aicd47avcwfaiceGcdtVgoydbfglBdbaoalBdbaDcefgDae9hmbxdkkcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcetfaic8Etc8F91aicd47avcwfaiceGcdtVgoydbfgl87ebaoalBdbaDcefgDae9hmbkkcbc99arawSEhokaok:wPliuo97eue978Jjjjjbca9Rhiaec98Ghldndnadcl9hmbdnalTmbcbhvabhdinadadpbbbgocKp:RecKp:Sep;6egraocwp:RecKp:Sep;6earp;Geaoczp:RecKp:Sep;6egwp;Gep;Kep;LegDpxbbbbbbbbbbbbbbbbp:2egqarpxbbbjbbbjbbbjbbbjgkp9op9rp;Kegrpxbb;:9cbb;:9cbb;:9cbb;:9cararp;MeaDaDp;Meawaqawakp9op9rp;Kegrarp;Mep;Kep;Kep;Jep;Negwp;Mepxbbn0bbn0bbn0bbn0gqp;KepxFbbbFbbbFbbbFbbbp9oaopxbbbFbbbFbbbFbbbFp9op9qarawp;Meaqp;Kecwp:RepxbFbbbFbbbFbbbFbbp9op9qaDawp;Meaqp;Keczp:RepxbbFbbbFbbbFbbbFbp9op9qpkbbadczfhdavclfgval6mbkkalaeSmeaipxbbbbbbbbbbbbbbbbgqpklbaiabalcdtfgdaeciGglcdtgv;8qbbdnalTmbaiaipblbgocKp:RecKp:Sep;6egraocwp:RecKp:Sep;6earp;Geaoczp:RecKp:Sep;6egwp;Gep;Kep;LegDaqp:2egqarpxbbbjbbbjbbbjbbbjgkp9op9rp;Kegrpxbb;:9cbb;:9cbb;:9cbb;:9cararp;MeaDaDp;Meawaqawakp9op9rp;Kegrarp;Mep;Kep;Kep;Jep;Negwp;Mepxbbn0bbn0bbn0bbn0gqp;KepxFbbbFbbbFbbbFbbbp9oaopxbbbFbbbFbbbFbbbFp9op9qarawp;Meaqp;Kecwp:RepxbFbbbFbbbFbbbFbbp9op9qaDawp;Meaqp;Keczp:RepxbbFbbbFbbbFbbbFbp9op9qpklbkadaiav;8qbbskdnalTmbcbhvabhdinadczfgxaxpbbbgopxbbbbbbFFbbbbbbFFgkp9oadpbbbgDaopmbediwDqkzHOAKY8AEgwczp:Reczp:Sep;6egraDaopmlvorxmPsCXQL358E8FpxFubbFubbFubbFubbp9op;6eawczp:Sep;6egwp;Gearp;Gep;Kep;Legopxbbbbbbbbbbbbbbbbp:2egqarpxbbbjbbbjbbbjbbbjgmp9op9rp;Kegrpxb;:FSb;:FSb;:FSb;:FSararp;Meaoaop;Meawaqawamp9op9rp;Kegrarp;Mep;Kep;Kep;Jep;Negwp;Mepxbbn0bbn0bbn0bbn0gqp;KepxFFbbFFbbFFbbFFbbp9oaoawp;Meaqp;Keczp:Rep9qgoarawp;Meaqp;KepxFFbbFFbbFFbbFFbbp9ogrpmwDKYqk8AExm35Ps8E8Fp9qpkbbadaDakp9oaoarpmbezHdiOAlvCXorQLp9qpkbbadcafhdavclfgval6mbkkalaeSmbaiaeciGgvcitgdfcbcaad9R;8kbaiabalcitfglad;8qbbdnavTmbaiaipblzgopxbbbbbbFFbbbbbbFFgkp9oaipblbgDaopmbediwDqkzHOAKY8AEgwczp:Reczp:Sep;6egraDaopmlvorxmPsCXQL358E8FpxFubbFubbFubbFubbp9op;6eawczp:Sep;6egwp;Gearp;Gep;Kep;Legopxbbbbbbbbbbbbbbbbp:2egqarpxbbbjbbbjbbbjbbbjgmp9op9rp;Kegrpxb;:FSb;:FSb;:FSb;:FSararp;Meaoaop;Meawaqawamp9op9rp;Kegrarp;Mep;Kep;Kep;Jep;Negwp;Mepxbbn0bbn0bbn0bbn0gqp;KepxFFbbFFbbFFbbFFbbp9oaoawp;Meaqp;Keczp:Rep9qgoarawp;Meaqp;KepxFFbbFFbbFFbbFFbbp9ogrpmwDKYqk8AExm35Ps8E8Fp9qpklzaiaDakp9oaoarpmbezHdiOAlvCXorQLp9qpklbkalaiad;8qbbkk;4wllue97euv978Jjjjjbc8W9Rhidnaec98GglTmbcbhvabhoinaiaopbbbgraoczfgwpbbbgDpmlvorxmPsCXQL358E8Fgqczp:Segkclp:RepklbaopxbbjZbbjZbbjZbbjZpx;Zl81Z;Zl81Z;Zl81Z;Zl81Zakpxibbbibbbibbbibbbp9qp;6ep;NegkaraDpmbediwDqkzHOAKY8AEgrczp:Reczp:Sep;6ep;MegDaDp;Meakarczp:Sep;6ep;Megxaxp;Meakaqczp:Reczp:Sep;6ep;Megqaqp;Mep;Kep;Kep;Lepxbbbbbbbbbbbbbbbbp:4ep;Jepxb;:FSb;:FSb;:FSb;:FSgkp;Mepxbbn0bbn0bbn0bbn0grp;KepxFFbbFFbbFFbbFFbbgmp9oaxakp;Mearp;Keczp:Rep9qgxaDakp;Mearp;Keamp9oaqakp;Mearp;Keczp:Rep9qgkpmbezHdiOAlvCXorQLgrp5baipblbpEb:T:j83ibaocwfarp5eaipblbpEe:T:j83ibawaxakpmwDKYqk8AExm35Ps8E8Fgkp5baipblbpEd:T:j83ibaocKfakp5eaipblbpEi:T:j83ibaocafhoavclfgval6mbkkdnalaeSmbaiaeciGgvcitgofcbcaao9R;8kbaiabalcitfgwao;8qbbdnavTmbaiaipblbgraipblzgDpmlvorxmPsCXQL358E8Fgqczp:Segkclp:RepklaaipxbbjZbbjZbbjZbbjZpx;Zl81Z;Zl81Z;Zl81Z;Zl81Zakpxibbbibbbibbbibbbp9qp;6ep;NegkaraDpmbediwDqkzHOAKY8AEgrczp:Reczp:Sep;6ep;MegDaDp;Meakarczp:Sep;6ep;Megxaxp;Meakaqczp:Reczp:Sep;6ep;Megqaqp;Mep;Kep;Kep;Lepxbbbbbbbbbbbbbbbbp:4ep;Jepxb;:FSb;:FSb;:FSb;:FSgkp;Mepxbbn0bbn0bbn0bbn0grp;KepxFFbbFFbbFFbbFFbbgmp9oaxakp;Mearp;Keczp:Rep9qgxaDakp;Mearp;Keamp9oaqakp;Mearp;Keczp:Rep9qgkpmbezHdiOAlvCXorQLgrp5baipblapEb:T:j83ibaiarp5eaipblapEe:T:j83iwaiaxakpmwDKYqk8AExm35Ps8E8Fgkp5baipblapEd:T:j83izaiakp5eaipblapEi:T:j83iKkawaiao;8qbbkk:Pddiue978Jjjjjbc;ab9Rhidnadcd4ae2glc98GgvTmbcbheabhdinadadpbbbgocwp:Recwp:Sep;6eaocep:SepxbbjFbbjFbbjFbbjFp9opxbbjZbbjZbbjZbbjZp:Uep;Mepkbbadczfhdaeclfgeav6mbkkdnavalSmbaialciGgecdtgdVcbc;abad9R;8kbaiabavcdtfgvad;8qbbdnaeTmbaiaipblbgocwp:Recwp:Sep;6eaocep:SepxbbjFbbjFbbjFbbjFp9opxbbjZbbjZbbjZbbjZp:Uep;Mepklbkavaiad;8qbbkk9teiucbcbydj1jjbgeabcifc98GfgbBdj1jjbdndnabZbcztgd9nmbcuhiabad9RcFFifcz4nbcuSmekaehikaikkkebcjwklz:Dbb",t=new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,3,2,0,0,5,3,1,0,1,12,1,0,10,22,2,12,0,65,0,65,0,65,0,252,10,0,0,11,7,0,65,0,253,15,26,11]),n=new Uint8Array([32,0,65,2,1,106,34,33,3,128,11,4,13,64,6,253,10,7,15,116,127,5,8,12,40,16,19,54,20,9,27,255,113,17,42,67,24,23,146,148,18,14,22,45,70,69,56,114,101,21,25,63,75,136,108,28,118,29,73,115]);if(typeof WebAssembly!="object")return{supported:!1};var i=WebAssembly.validate(t)?o(e):o(r),s,a=WebAssembly.instantiate(i,{}).then(function(p){s=p.instance,s.exports.__wasm_call_ctors()});function o(p){for(var E=new Uint8Array(p.length),_=0;_<p.length;++_){var b=p.charCodeAt(_);E[_]=b>96?b-97:b>64?b-39:b+4}for(var x=0,_=0;_<p.length;++_)E[x++]=E[_]<60?n[E[_]]:(E[_]-60)*64+E[++_];return E.buffer.slice(0,x)}function c(p,E,_,b,x,I,M){var w=p.exports.sbrk,v=b+3&-4,y=w(v*x),T=w(I.length),k=new Uint8Array(p.exports.memory.buffer);k.set(I,T);var U=E(y,b,x,T,I.length);if(U==0&&M&&M(y,v,x),_.set(k.subarray(y,y+b*x)),w(y-w(0)),U!=0)throw new Error("Malformed buffer data: "+U)}var l={NONE:"",OCTAHEDRAL:"meshopt_decodeFilterOct",QUATERNION:"meshopt_decodeFilterQuat",EXPONENTIAL:"meshopt_decodeFilterExp"},u={ATTRIBUTES:"meshopt_decodeVertexBuffer",TRIANGLES:"meshopt_decodeIndexBuffer",INDICES:"meshopt_decodeIndexSequence"},h=[],d=0;function f(p){var E={object:new Worker(p),pending:0,requests:{}};return E.object.onmessage=function(_){var b=_.data;E.pending-=b.count,E.requests[b.id][b.action](b.value),delete E.requests[b.id]},E}function A(p){for(var E="self.ready = WebAssembly.instantiate(new Uint8Array(["+new Uint8Array(i)+"]), {}).then(function(result) { result.instance.exports.__wasm_call_ctors(); return result.instance; });self.onmessage = "+m.name+";"+c.toString()+m.toString(),_=new Blob([E],{type:"text/javascript"}),b=URL.createObjectURL(_),x=h.length;x<p;++x)h[x]=f(b);for(var x=p;x<h.length;++x)h[x].object.postMessage({});h.length=p,URL.revokeObjectURL(b)}function g(p,E,_,b,x){for(var I=h[0],M=1;M<h.length;++M)h[M].pending<I.pending&&(I=h[M]);return new Promise(function(w,v){var y=new Uint8Array(_),T=++d;I.pending+=p,I.requests[T]={resolve:w,reject:v},I.object.postMessage({id:T,count:p,size:E,source:y,mode:b,filter:x},[y.buffer])})}function m(p){var E=p.data;if(!E.id)return self.close();self.ready.then(function(_){try{var b=new Uint8Array(E.count*E.size);c(_,_.exports[E.mode],b,E.count,E.size,E.source,_.exports[E.filter]),self.postMessage({id:E.id,count:E.count,action:"resolve",value:b},[b.buffer])}catch(x){self.postMessage({id:E.id,count:E.count,action:"reject",value:x})}})}return{ready:a,supported:!0,useWorkers:function(p){A(p)},decodeVertexBuffer:function(p,E,_,b,x){c(s,s.exports.meshopt_decodeVertexBuffer,p,E,_,b,s.exports[l[x]])},decodeIndexBuffer:function(p,E,_,b){c(s,s.exports.meshopt_decodeIndexBuffer,p,E,_,b)},decodeIndexSequence:function(p,E,_,b){c(s,s.exports.meshopt_decodeIndexSequence,p,E,_,b)},decodeGltfBuffer:function(p,E,_,b,x,I){c(s,s.exports[u[x]],p,E,_,b,s.exports[l[I]])},decodeGltfBufferAsync:function(p,E,_,b,x){return h.length>0?g(p,E,_,u[b],l[x]):a.then(function(){var I=new Uint8Array(p*E);return c(s,s.exports[u[b]],I,p,E,_,s.exports[l[x]]),I})}}}();const Yl=new WeakMap;class mI extends hi{constructor(e){super(e),this.decoderPath="",this.decoderConfig={},this.decoderBinary=null,this.decoderPending=null,this.workerLimit=4,this.workerPool=[],this.workerNextTaskID=1,this.workerSourceURL="",this.defaultAttributeIDs={position:"POSITION",normal:"NORMAL",color:"COLOR",uv:"TEX_COORD"},this.defaultAttributeTypes={position:"Float32Array",normal:"Float32Array",color:"Float32Array",uv:"Float32Array"}}setDecoderPath(e){return this.decoderPath=e,this}setDecoderConfig(e){return this.decoderConfig=e,this}setWorkerLimit(e){return this.workerLimit=e,this}load(e,t,n,i){const s=new Di(this.manager);s.setPath(this.path),s.setResponseType("arraybuffer"),s.setRequestHeader(this.requestHeader),s.setWithCredentials(this.withCredentials),s.load(e,a=>{this.parse(a,t,i)},n,i)}parse(e,t,n=()=>{}){this.decodeDracoFile(e,t,null,null,mt,n).catch(n)}decodeDracoFile(e,t,n,i,s=gt,a=()=>{}){const o={attributeIDs:n||this.defaultAttributeIDs,attributeTypes:i||this.defaultAttributeTypes,useUniqueIDs:!!n,vertexColorSpace:s};return this.decodeGeometry(e,o).then(t).catch(a)}decodeGeometry(e,t){const n=JSON.stringify(t);if(Yl.has(e)){const c=Yl.get(e);if(c.key===n)return c.promise;if(e.byteLength===0)throw new Error("THREE.DRACOLoader: Unable to re-decode a buffer with different settings. Buffer has already been transferred.")}let i;const s=this.workerNextTaskID++,a=e.byteLength,o=this._getWorker(s,a).then(c=>(i=c,new Promise((l,u)=>{i._callbacks[s]={resolve:l,reject:u},i.postMessage({type:"decode",id:s,taskConfig:t,buffer:e},[e])}))).then(c=>this._createGeometry(c.geometry));return o.catch(()=>!0).then(()=>{i&&s&&this._releaseTask(i,s)}),Yl.set(e,{key:n,promise:o}),o}_createGeometry(e){const t=new An;e.index&&t.setIndex(new yt(e.index.array,1));for(let n=0;n<e.attributes.length;n++){const i=e.attributes[n],s=i.name,a=i.array,o=i.itemSize,c=new yt(a,o);s==="color"&&(this._assignVertexColorSpace(c,i.vertexColorSpace),c.normalized=!(a instanceof Float32Array)),t.setAttribute(s,c)}return t}_assignVertexColorSpace(e,t){if(t!==mt)return;const n=new Me;for(let i=0,s=e.count;i<s;i++)n.fromBufferAttribute(e,i),Je.colorSpaceToWorking(n,mt),e.setXYZ(i,n.r,n.g,n.b)}_loadLibrary(e,t){const n=new Di(this.manager);return n.setPath(this.decoderPath),n.setResponseType(t),n.setWithCredentials(this.withCredentials),new Promise((i,s)=>{n.load(e,i,void 0,s)})}preload(){return this._initDecoder(),this}_initDecoder(){if(this.decoderPending)return this.decoderPending;const e=typeof WebAssembly!="object"||this.decoderConfig.type==="js",t=[];return e?t.push(this._loadLibrary("draco_decoder.js","text")):(t.push(this._loadLibrary("draco_wasm_wrapper.js","text")),t.push(this._loadLibrary("draco_decoder.wasm","arraybuffer"))),this.decoderPending=Promise.all(t).then(n=>{const i=n[0];e||(this.decoderConfig.wasmBinary=n[1]);const s=gI.toString(),a=["/* draco decoder */",i,"","/* worker */",s.substring(s.indexOf("{")+1,s.lastIndexOf("}"))].join(`
`);this.workerSourceURL=URL.createObjectURL(new Blob([a]))}),this.decoderPending}_getWorker(e,t){return this._initDecoder().then(()=>{if(this.workerPool.length<this.workerLimit){const i=new Worker(this.workerSourceURL);i._callbacks={},i._taskCosts={},i._taskLoad=0,i.postMessage({type:"init",decoderConfig:this.decoderConfig}),i.onmessage=function(s){const a=s.data;switch(a.type){case"decode":i._callbacks[a.id].resolve(a);break;case"error":i._callbacks[a.id].reject(a);break;default:console.error('THREE.DRACOLoader: Unexpected message, "'+a.type+'"')}},this.workerPool.push(i)}else this.workerPool.sort(function(i,s){return i._taskLoad>s._taskLoad?-1:1});const n=this.workerPool[this.workerPool.length-1];return n._taskCosts[e]=t,n._taskLoad+=t,n})}_releaseTask(e,t){e._taskLoad-=e._taskCosts[t],delete e._callbacks[t],delete e._taskCosts[t]}debug(){console.log("Task load: ",this.workerPool.map(e=>e._taskLoad))}dispose(){for(let e=0;e<this.workerPool.length;++e)this.workerPool[e].terminate();return this.workerPool.length=0,this.workerSourceURL!==""&&URL.revokeObjectURL(this.workerSourceURL),this}}function gI(){let r,e;onmessage=function(a){const o=a.data;switch(o.type){case"init":r=o.decoderConfig,e=new Promise(function(u){r.onModuleLoaded=function(h){u({draco:h})},DracoDecoderModule(r)});break;case"decode":const c=o.buffer,l=o.taskConfig;e.then(u=>{const h=u.draco,d=new h.Decoder;try{const f=t(h,d,new Int8Array(c),l),A=f.attributes.map(g=>g.array.buffer);f.index&&A.push(f.index.array.buffer),self.postMessage({type:"decode",id:o.id,geometry:f},A)}catch(f){console.error(f),self.postMessage({type:"error",id:o.id,error:f.message})}finally{h.destroy(d)}});break}};function t(a,o,c,l){const u=l.attributeIDs,h=l.attributeTypes;let d,f;const A=o.GetEncodedGeometryType(c);if(A===a.TRIANGULAR_MESH)d=new a.Mesh,f=o.DecodeArrayToMesh(c,c.byteLength,d);else if(A===a.POINT_CLOUD)d=new a.PointCloud,f=o.DecodeArrayToPointCloud(c,c.byteLength,d);else throw new Error("THREE.DRACOLoader: Unexpected geometry type.");if(!f.ok()||d.ptr===0)throw new Error("THREE.DRACOLoader: Decoding failed: "+f.error_msg());const g={index:null,attributes:[]};for(const m in u){const p=self[h[m]];let E,_;if(l.useUniqueIDs)_=u[m],E=o.GetAttributeByUniqueId(d,_);else{if(_=o.GetAttributeId(d,a[u[m]]),_===-1)continue;E=o.GetAttribute(d,_)}const b=i(a,o,d,m,p,E);m==="color"&&(b.vertexColorSpace=l.vertexColorSpace),g.attributes.push(b)}return A===a.TRIANGULAR_MESH&&(g.index=n(a,o,d)),a.destroy(d),g}function n(a,o,c){const u=c.num_faces()*3,h=u*4,d=a._malloc(h);o.GetTrianglesUInt32Array(c,h,d);const f=new Uint32Array(a.HEAPF32.buffer,d,u).slice();return a._free(d),{array:f,itemSize:1}}function i(a,o,c,l,u,h){const d=h.num_components(),A=c.num_points()*d,g=A*u.BYTES_PER_ELEMENT,m=s(a,u),p=a._malloc(g);o.GetAttributeDataArrayForAllPoints(c,h,m,g,p);const E=new u(a.HEAPF32.buffer,p,A).slice();return a._free(p),{name:l,array:E,itemSize:d}}function s(a,o){switch(o){case Float32Array:return a.DT_FLOAT32;case Int8Array:return a.DT_INT8;case Int16Array:return a.DT_INT16;case Int32Array:return a.DT_INT32;case Uint8Array:return a.DT_UINT8;case Uint16Array:return a.DT_UINT16;case Uint32Array:return a.DT_UINT32}}}function yp(r,e){if(e===l_)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),r;if(e===Gu||e===gg){let t=r.getIndex();if(t===null){const a=[],o=r.getAttribute("position");if(o!==void 0){for(let c=0;c<o.count;c++)a.push(c);r.setIndex(a),t=r.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),r}const n=t.count-2,i=[];if(e===Gu)for(let a=1;a<=n;a++)i.push(t.getX(0)),i.push(t.getX(a)),i.push(t.getX(a+1));else for(let a=0;a<n;a++)a%2===0?(i.push(t.getX(a)),i.push(t.getX(a+1)),i.push(t.getX(a+2))):(i.push(t.getX(a+2)),i.push(t.getX(a+1)),i.push(t.getX(a)));i.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");const s=r.clone();return s.setIndex(i),s.clearGroups(),s}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),r}class bI extends hi{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new yI(t)}),this.register(function(t){return new SI(t)}),this.register(function(t){return new LI(t)}),this.register(function(t){return new FI(t)}),this.register(function(t){return new PI(t)}),this.register(function(t){return new II(t)}),this.register(function(t){return new MI(t)}),this.register(function(t){return new wI(t)}),this.register(function(t){return new TI(t)}),this.register(function(t){return new vI(t)}),this.register(function(t){return new RI(t)}),this.register(function(t){return new CI(t)}),this.register(function(t){return new DI(t)}),this.register(function(t){return new BI(t)}),this.register(function(t){return new EI(t)}),this.register(function(t){return new UI(t)}),this.register(function(t){return new NI(t)})}load(e,t,n,i){const s=this;let a;if(this.resourcePath!=="")a=this.resourcePath;else if(this.path!==""){const l=za.extractUrlBase(e);a=za.resolveURL(l,this.path)}else a=za.extractUrlBase(e);this.manager.itemStart(e);const o=function(l){i?i(l):console.error(l),s.manager.itemError(e),s.manager.itemEnd(e)},c=new Di(this.manager);c.setPath(this.path),c.setResponseType("arraybuffer"),c.setRequestHeader(this.requestHeader),c.setWithCredentials(this.withCredentials),c.load(e,function(l){try{s.parse(l,a,function(u){t(u),s.manager.itemEnd(e)},o)}catch(u){o(u)}},n,o)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,i){let s;const a={},o={},c=new TextDecoder;if(typeof e=="string")s=JSON.parse(e);else if(e instanceof ArrayBuffer)if(c.decode(new Uint8Array(e,0,4))===r0){try{a[je.KHR_BINARY_GLTF]=new OI(e)}catch(h){i&&i(h);return}s=JSON.parse(a[je.KHR_BINARY_GLTF].content)}else s=JSON.parse(c.decode(e));else s=e;if(s.asset===void 0||s.asset.version[0]<2){i&&i(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}const l=new KI(s,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});l.fileLoader.setRequestHeader(this.requestHeader);for(let u=0;u<this.pluginCallbacks.length;u++){const h=this.pluginCallbacks[u](l);h.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),o[h.name]=h,a[h.name]=!0}if(s.extensionsUsed)for(let u=0;u<s.extensionsUsed.length;++u){const h=s.extensionsUsed[u],d=s.extensionsRequired||[];switch(h){case je.KHR_MATERIALS_UNLIT:a[h]=new xI;break;case je.KHR_DRACO_MESH_COMPRESSION:a[h]=new kI(s,this.dracoLoader);break;case je.KHR_TEXTURE_TRANSFORM:a[h]=new QI;break;case je.KHR_MESH_QUANTIZATION:a[h]=new GI;break;default:d.indexOf(h)>=0&&o[h]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+h+'".')}}l.setExtensions(a),l.setPlugins(o),l.parse(n,i)}parseAsync(e,t){const n=this;return new Promise(function(i,s){n.parse(e,t,i,s)})}}function _I(){let r={};return{get:function(e){return r[e]},add:function(e,t){r[e]=t},remove:function(e){delete r[e]},removeAll:function(){r={}}}}const je={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"};class EI{constructor(e){this.parser=e,this.name=je.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){const e=this.parser,t=this.parser.json.nodes||[];for(let n=0,i=t.length;n<i;n++){const s=t[n];s.extensions&&s.extensions[this.name]&&s.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,s.extensions[this.name].light)}}_loadLight(e){const t=this.parser,n="light:"+e;let i=t.cache.get(n);if(i)return i;const s=t.json,c=((s.extensions&&s.extensions[this.name]||{}).lights||[])[e];let l;const u=new Me(16777215);c.color!==void 0&&u.setRGB(c.color[0],c.color[1],c.color[2],gt);const h=c.range!==void 0?c.range:0;switch(c.type){case"directional":l=new Gg(u),l.target.position.set(0,0,-1),l.add(l.target);break;case"point":l=new Qg(u),l.distance=h;break;case"spot":l=new UE(u),l.distance=h,c.spot=c.spot||{},c.spot.innerConeAngle=c.spot.innerConeAngle!==void 0?c.spot.innerConeAngle:0,c.spot.outerConeAngle=c.spot.outerConeAngle!==void 0?c.spot.outerConeAngle:Math.PI/4,l.angle=c.spot.outerConeAngle,l.penumbra=1-c.spot.innerConeAngle/c.spot.outerConeAngle,l.target.position.set(0,0,-1),l.add(l.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+c.type)}return l.position.set(0,0,0),Mi(l,c),c.intensity!==void 0&&(l.intensity=c.intensity),l.name=t.createUniqueName(c.name||"light_"+e),i=Promise.resolve(l),t.cache.add(n,i),i}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){const t=this,n=this.parser,s=n.json.nodes[e],o=(s.extensions&&s.extensions[this.name]||{}).light;return o===void 0?null:this._loadLight(o).then(function(c){return n._getNodeRef(t.cache,o,c)})}}let xI=class{constructor(){this.name=je.KHR_MATERIALS_UNLIT}getMaterialType(){return Fn}extendParams(e,t,n){const i=[];e.color=new Me(1,1,1),e.opacity=1;const s=t.pbrMetallicRoughness;if(s){if(Array.isArray(s.baseColorFactor)){const a=s.baseColorFactor;e.color.setRGB(a[0],a[1],a[2],gt),e.opacity=a[3]}s.baseColorTexture!==void 0&&i.push(n.assignTexture(e,"map",s.baseColorTexture,mt))}return Promise.all(i)}},vI=class{constructor(e){this.parser=e,this.name=je.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=i.extensions[this.name].emissiveStrength;return s!==void 0&&(t.emissiveIntensity=s),Promise.resolve()}},yI=class{constructor(e){this.parser=e,this.name=je.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:li}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],a=i.extensions[this.name];if(a.clearcoatFactor!==void 0&&(t.clearcoat=a.clearcoatFactor),a.clearcoatTexture!==void 0&&s.push(n.assignTexture(t,"clearcoatMap",a.clearcoatTexture)),a.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=a.clearcoatRoughnessFactor),a.clearcoatRoughnessTexture!==void 0&&s.push(n.assignTexture(t,"clearcoatRoughnessMap",a.clearcoatRoughnessTexture)),a.clearcoatNormalTexture!==void 0&&(s.push(n.assignTexture(t,"clearcoatNormalMap",a.clearcoatNormalTexture)),a.clearcoatNormalTexture.scale!==void 0)){const o=a.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new ke(o,o)}return Promise.all(s)}},SI=class{constructor(e){this.parser=e,this.name=je.KHR_MATERIALS_DISPERSION}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:li}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=i.extensions[this.name];return t.dispersion=s.dispersion!==void 0?s.dispersion:0,Promise.resolve()}},CI=class{constructor(e){this.parser=e,this.name=je.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:li}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],a=i.extensions[this.name];return a.iridescenceFactor!==void 0&&(t.iridescence=a.iridescenceFactor),a.iridescenceTexture!==void 0&&s.push(n.assignTexture(t,"iridescenceMap",a.iridescenceTexture)),a.iridescenceIor!==void 0&&(t.iridescenceIOR=a.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),a.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=a.iridescenceThicknessMinimum),a.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=a.iridescenceThicknessMaximum),a.iridescenceThicknessTexture!==void 0&&s.push(n.assignTexture(t,"iridescenceThicknessMap",a.iridescenceThicknessTexture)),Promise.all(s)}},II=class{constructor(e){this.parser=e,this.name=je.KHR_MATERIALS_SHEEN}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:li}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[];t.sheenColor=new Me(0,0,0),t.sheenRoughness=0,t.sheen=1;const a=i.extensions[this.name];if(a.sheenColorFactor!==void 0){const o=a.sheenColorFactor;t.sheenColor.setRGB(o[0],o[1],o[2],gt)}return a.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=a.sheenRoughnessFactor),a.sheenColorTexture!==void 0&&s.push(n.assignTexture(t,"sheenColorMap",a.sheenColorTexture,mt)),a.sheenRoughnessTexture!==void 0&&s.push(n.assignTexture(t,"sheenRoughnessMap",a.sheenRoughnessTexture)),Promise.all(s)}},MI=class{constructor(e){this.parser=e,this.name=je.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:li}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],a=i.extensions[this.name];return a.transmissionFactor!==void 0&&(t.transmission=a.transmissionFactor),a.transmissionTexture!==void 0&&s.push(n.assignTexture(t,"transmissionMap",a.transmissionTexture)),Promise.all(s)}},wI=class{constructor(e){this.parser=e,this.name=je.KHR_MATERIALS_VOLUME}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:li}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],a=i.extensions[this.name];t.thickness=a.thicknessFactor!==void 0?a.thicknessFactor:0,a.thicknessTexture!==void 0&&s.push(n.assignTexture(t,"thicknessMap",a.thicknessTexture)),t.attenuationDistance=a.attenuationDistance||1/0;const o=a.attenuationColor||[1,1,1];return t.attenuationColor=new Me().setRGB(o[0],o[1],o[2],gt),Promise.all(s)}},TI=class{constructor(e){this.parser=e,this.name=je.KHR_MATERIALS_IOR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:li}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=i.extensions[this.name];return t.ior=s.ior!==void 0?s.ior:1.5,Promise.resolve()}},RI=class{constructor(e){this.parser=e,this.name=je.KHR_MATERIALS_SPECULAR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:li}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],a=i.extensions[this.name];t.specularIntensity=a.specularFactor!==void 0?a.specularFactor:1,a.specularTexture!==void 0&&s.push(n.assignTexture(t,"specularIntensityMap",a.specularTexture));const o=a.specularColorFactor||[1,1,1];return t.specularColor=new Me().setRGB(o[0],o[1],o[2],gt),a.specularColorTexture!==void 0&&s.push(n.assignTexture(t,"specularColorMap",a.specularColorTexture,mt)),Promise.all(s)}},BI=class{constructor(e){this.parser=e,this.name=je.EXT_MATERIALS_BUMP}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:li}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],a=i.extensions[this.name];return t.bumpScale=a.bumpFactor!==void 0?a.bumpFactor:1,a.bumpTexture!==void 0&&s.push(n.assignTexture(t,"bumpMap",a.bumpTexture)),Promise.all(s)}},DI=class{constructor(e){this.parser=e,this.name=je.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:li}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],a=i.extensions[this.name];return a.anisotropyStrength!==void 0&&(t.anisotropy=a.anisotropyStrength),a.anisotropyRotation!==void 0&&(t.anisotropyRotation=a.anisotropyRotation),a.anisotropyTexture!==void 0&&s.push(n.assignTexture(t,"anisotropyMap",a.anisotropyTexture)),Promise.all(s)}};class LI{constructor(e){this.parser=e,this.name=je.KHR_TEXTURE_BASISU}loadTexture(e){const t=this.parser,n=t.json,i=n.textures[e];if(!i.extensions||!i.extensions[this.name])return null;const s=i.extensions[this.name],a=t.options.ktx2Loader;if(!a){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,s.source,a)}}class FI{constructor(e){this.parser=e,this.name=je.EXT_TEXTURE_WEBP}loadTexture(e){const t=this.name,n=this.parser,i=n.json,s=i.textures[e];if(!s.extensions||!s.extensions[t])return null;const a=s.extensions[t],o=i.images[a.source];let c=n.textureLoader;if(o.uri){const l=n.options.manager.getHandler(o.uri);l!==null&&(c=l)}return n.loadTextureImage(e,a.source,c)}}class PI{constructor(e){this.parser=e,this.name=je.EXT_TEXTURE_AVIF}loadTexture(e){const t=this.name,n=this.parser,i=n.json,s=i.textures[e];if(!s.extensions||!s.extensions[t])return null;const a=s.extensions[t],o=i.images[a.source];let c=n.textureLoader;if(o.uri){const l=n.options.manager.getHandler(o.uri);l!==null&&(c=l)}return n.loadTextureImage(e,a.source,c)}}class UI{constructor(e){this.name=je.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){const t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){const i=n.extensions[this.name],s=this.parser.getDependency("buffer",i.buffer),a=this.parser.options.meshoptDecoder;if(!a||!a.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return s.then(function(o){const c=i.byteOffset||0,l=i.byteLength||0,u=i.count,h=i.byteStride,d=new Uint8Array(o,c,l);return a.decodeGltfBufferAsync?a.decodeGltfBufferAsync(u,h,d,i.mode,i.filter).then(function(f){return f.buffer}):a.ready.then(function(){const f=new ArrayBuffer(u*h);return a.decodeGltfBuffer(new Uint8Array(f),u,h,d,i.mode,i.filter),f})})}else return null}}let NI=class{constructor(e){this.name=je.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){const t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;const i=t.meshes[n.mesh];for(const l of i.primitives)if(l.mode!==Bn.TRIANGLES&&l.mode!==Bn.TRIANGLE_STRIP&&l.mode!==Bn.TRIANGLE_FAN&&l.mode!==void 0)return null;const a=n.extensions[this.name].attributes,o=[],c={};for(const l in a)o.push(this.parser.getDependency("accessor",a[l]).then(u=>(c[l]=u,c[l])));return o.length<1?null:(o.push(this.parser.createNodeMesh(e)),Promise.all(o).then(l=>{const u=l.pop(),h=u.isGroup?u.children:[u],d=l[0].count,f=[];for(const A of h){const g=new Ne,m=new B,p=new un,E=new B(1,1,1),_=new dE(A.geometry,A.material,d);for(let b=0;b<d;b++)c.TRANSLATION&&m.fromBufferAttribute(c.TRANSLATION,b),c.ROTATION&&p.fromBufferAttribute(c.ROTATION,b),c.SCALE&&E.fromBufferAttribute(c.SCALE,b),_.setMatrixAt(b,g.compose(m,p,E));for(const b in c)if(b==="_COLOR_0"){const x=c[b];_.instanceColor=new Vu(x.array,x.itemSize,x.normalized)}else b!=="TRANSLATION"&&b!=="ROTATION"&&b!=="SCALE"&&A.geometry.setAttribute(b,c[b]);pt.prototype.copy.call(_,A),this.parser.assignFinalMaterial(_),f.push(_)}return u.isGroup?(u.clear(),u.add(...f),u):f[0]}))}};const r0="glTF",fa=12,Sp={JSON:1313821514,BIN:5130562};class OI{constructor(e){this.name=je.KHR_BINARY_GLTF,this.content=null,this.body=null;const t=new DataView(e,0,fa),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==r0)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");const i=this.header.length-fa,s=new DataView(e,fa);let a=0;for(;a<i;){const o=s.getUint32(a,!0);a+=4;const c=s.getUint32(a,!0);if(a+=4,c===Sp.JSON){const l=new Uint8Array(e,fa+a,o);this.content=n.decode(l)}else if(c===Sp.BIN){const l=fa+a;this.body=e.slice(l,l+o)}a+=o}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}}class kI{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=je.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){const n=this.json,i=this.dracoLoader,s=e.extensions[this.name].bufferView,a=e.extensions[this.name].attributes,o={},c={},l={};for(const u in a){const h=ju[u]||u.toLowerCase();o[h]=a[u]}for(const u in e.attributes){const h=ju[u]||u.toLowerCase();if(a[u]!==void 0){const d=n.accessors[e.attributes[u]],f=Ur[d.componentType];l[h]=f.name,c[h]=d.normalized===!0}}return t.getDependency("bufferView",s).then(function(u){return new Promise(function(h,d){i.decodeDracoFile(u,function(f){for(const A in f.attributes){const g=f.attributes[A],m=c[A];m!==void 0&&(g.normalized=m)}h(f)},o,l,gt,d)})})}}class QI{constructor(){this.name=je.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0||(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0),e}}class GI{constructor(){this.name=je.KHR_MESH_QUANTIZATION}}class a0 extends fo{constructor(e,t,n,i){super(e,t,n,i)}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,s=e*i*3+i;for(let a=0;a!==i;a++)t[a]=n[s+a];return t}interpolate_(e,t,n,i){const s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=o*2,l=o*3,u=i-t,h=(n-t)/u,d=h*h,f=d*h,A=e*l,g=A-l,m=-2*f+3*d,p=f-d,E=1-m,_=p-d+h;for(let b=0;b!==o;b++){const x=a[g+b+o],I=a[g+b+c]*u,M=a[A+b+o],w=a[A+b]*u;s[b]=E*x+_*I+m*M+p*w}return s}}const HI=new un;class zI extends a0{interpolate_(e,t,n,i){const s=super.interpolate_(e,t,n,i);return HI.fromArray(s).normalize().toArray(s),s}}const Bn={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6},Ur={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},Cp={9728:Ot,9729:Ze,9984:lo,9985:Rs,9986:ji,9987:hn},Ip={33071:Dt,33648:Ns,10497:$n},Kl={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},ju={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},Gi={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},VI={CUBICSPLINE:void 0,LINEAR:zr,STEP:Hr},Jl={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function WI(r){return r.DefaultMaterial===void 0&&(r.DefaultMaterial=new so({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:Xn})),r.DefaultMaterial}function fs(r,e,t){for(const n in t.extensions)r[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function Mi(r,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(r.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function qI(r,e,t){let n=!1,i=!1,s=!1;for(let l=0,u=e.length;l<u;l++){const h=e[l];if(h.POSITION!==void 0&&(n=!0),h.NORMAL!==void 0&&(i=!0),h.COLOR_0!==void 0&&(s=!0),n&&i&&s)break}if(!n&&!i&&!s)return Promise.resolve(r);const a=[],o=[],c=[];for(let l=0,u=e.length;l<u;l++){const h=e[l];if(n){const d=h.POSITION!==void 0?t.getDependency("accessor",h.POSITION):r.attributes.position;a.push(d)}if(i){const d=h.NORMAL!==void 0?t.getDependency("accessor",h.NORMAL):r.attributes.normal;o.push(d)}if(s){const d=h.COLOR_0!==void 0?t.getDependency("accessor",h.COLOR_0):r.attributes.color;c.push(d)}}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(c)]).then(function(l){const u=l[0],h=l[1],d=l[2];return n&&(r.morphAttributes.position=u),i&&(r.morphAttributes.normal=h),s&&(r.morphAttributes.color=d),r.morphTargetsRelative=!0,r})}function XI(r,e){if(r.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)r.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){const t=e.extras.targetNames;if(r.morphTargetInfluences.length===t.length){r.morphTargetDictionary={};for(let n=0,i=t.length;n<i;n++)r.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function $I(r){let e;const t=r.extensions&&r.extensions[je.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+Zl(t.attributes):e=r.indices+":"+Zl(r.attributes)+":"+r.mode,r.targets!==void 0)for(let n=0,i=r.targets.length;n<i;n++)e+=":"+Zl(r.targets[n]);return e}function Zl(r){let e="";const t=Object.keys(r).sort();for(let n=0,i=t.length;n<i;n++)e+=t[n]+":"+r[t[n]]+";";return e}function Yu(r){switch(r){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function jI(r){return r.search(/\.jpe?g($|\?)/i)>0||r.search(/^data\:image\/jpeg/)===0?"image/jpeg":r.search(/\.webp($|\?)/i)>0||r.search(/^data\:image\/webp/)===0?"image/webp":r.search(/\.ktx2($|\?)/i)>0||r.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}const YI=new Ne;class KI{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new _I,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,i=-1,s=!1,a=-1;if(typeof navigator<"u"){const o=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(o)===!0;const c=o.match(/Version\/(\d+)/);i=n&&c?parseInt(c[1],10):-1,s=o.indexOf("Firefox")>-1,a=s?o.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&i<17||s&&a<98?this.textureLoader=new kg(this.options.manager):this.textureLoader=new GE(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new Di(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){const n=this,i=this.json,s=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(a){return a._markDefs&&a._markDefs()}),Promise.all(this._invokeAll(function(a){return a.beforeRoot&&a.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(a){const o={scene:a[0][i.scene||0],scenes:a[0],animations:a[1],cameras:a[2],asset:i.asset,parser:n,userData:{}};return fs(s,o,i),Mi(o,i),Promise.all(n._invokeAll(function(c){return c.afterRoot&&c.afterRoot(o)})).then(function(){for(const c of o.scenes)c.updateMatrixWorld();e(o)})}).catch(t)}_markDefs(){const e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let i=0,s=t.length;i<s;i++){const a=t[i].joints;for(let o=0,c=a.length;o<c;o++)e[a[o]].isBone=!0}for(let i=0,s=e.length;i<s;i++){const a=e[i];a.mesh!==void 0&&(this._addNodeRef(this.meshCache,a.mesh),a.skin!==void 0&&(n[a.mesh].isSkinnedMesh=!0)),a.camera!==void 0&&this._addNodeRef(this.cameraCache,a.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;const i=n.clone(),s=(a,o)=>{const c=this.associations.get(a);c!=null&&this.associations.set(o,c);for(const[l,u]of a.children.entries())s(u,o.children[l])};return s(n,i),i.name+="_instance_"+e.uses[t]++,i}_invokeOne(e){const t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){const i=e(t[n]);if(i)return i}return null}_invokeAll(e){const t=Object.values(this.plugins);t.unshift(this);const n=[];for(let i=0;i<t.length;i++){const s=e(t[i]);s&&n.push(s)}return n}getDependency(e,t){const n=e+":"+t;let i=this.cache.get(n);if(!i){switch(e){case"scene":i=this.loadScene(t);break;case"node":i=this._invokeOne(function(s){return s.loadNode&&s.loadNode(t)});break;case"mesh":i=this._invokeOne(function(s){return s.loadMesh&&s.loadMesh(t)});break;case"accessor":i=this.loadAccessor(t);break;case"bufferView":i=this._invokeOne(function(s){return s.loadBufferView&&s.loadBufferView(t)});break;case"buffer":i=this.loadBuffer(t);break;case"material":i=this._invokeOne(function(s){return s.loadMaterial&&s.loadMaterial(t)});break;case"texture":i=this._invokeOne(function(s){return s.loadTexture&&s.loadTexture(t)});break;case"skin":i=this.loadSkin(t);break;case"animation":i=this._invokeOne(function(s){return s.loadAnimation&&s.loadAnimation(t)});break;case"camera":i=this.loadCamera(t);break;default:if(i=this._invokeOne(function(s){return s!=this&&s.getDependency&&s.getDependency(e,t)}),!i)throw new Error("Unknown type: "+e);break}this.cache.add(n,i)}return i}getDependencies(e){let t=this.cache.get(e);if(!t){const n=this,i=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(i.map(function(s,a){return n.getDependency(e,a)})),this.cache.add(e,t)}return t}loadBuffer(e){const t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[je.KHR_BINARY_GLTF].body);const i=this.options;return new Promise(function(s,a){n.load(za.resolveURL(t.uri,i.path),s,void 0,function(){a(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){const t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){const i=t.byteLength||0,s=t.byteOffset||0;return n.slice(s,s+i)})}loadAccessor(e){const t=this,n=this.json,i=this.json.accessors[e];if(i.bufferView===void 0&&i.sparse===void 0){const a=Kl[i.type],o=Ur[i.componentType],c=i.normalized===!0,l=new o(i.count*a);return Promise.resolve(new yt(l,a,c))}const s=[];return i.bufferView!==void 0?s.push(this.getDependency("bufferView",i.bufferView)):s.push(null),i.sparse!==void 0&&(s.push(this.getDependency("bufferView",i.sparse.indices.bufferView)),s.push(this.getDependency("bufferView",i.sparse.values.bufferView))),Promise.all(s).then(function(a){const o=a[0],c=Kl[i.type],l=Ur[i.componentType],u=l.BYTES_PER_ELEMENT,h=u*c,d=i.byteOffset||0,f=i.bufferView!==void 0?n.bufferViews[i.bufferView].byteStride:void 0,A=i.normalized===!0;let g,m;if(f&&f!==h){const p=Math.floor(d/f),E="InterleavedBuffer:"+i.bufferView+":"+i.componentType+":"+p+":"+i.count;let _=t.cache.get(E);_||(g=new l(o,p*f,i.count*f/u),_=new oE(g,f/u),t.cache.add(E,_)),m=new yd(_,c,d%f/u,A)}else o===null?g=new l(i.count*c):g=new l(o,d,i.count*c),m=new yt(g,c,A);if(i.sparse!==void 0){const p=Kl.SCALAR,E=Ur[i.sparse.indices.componentType],_=i.sparse.indices.byteOffset||0,b=i.sparse.values.byteOffset||0,x=new E(a[1],_,i.sparse.count*p),I=new l(a[2],b,i.sparse.count*c);o!==null&&(m=new yt(m.array.slice(),m.itemSize,m.normalized)),m.normalized=!1;for(let M=0,w=x.length;M<w;M++){const v=x[M];if(m.setX(v,I[M*c]),c>=2&&m.setY(v,I[M*c+1]),c>=3&&m.setZ(v,I[M*c+2]),c>=4&&m.setW(v,I[M*c+3]),c>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}m.normalized=A}return m})}loadTexture(e){const t=this.json,n=this.options,s=t.textures[e].source,a=t.images[s];let o=this.textureLoader;if(a.uri){const c=n.manager.getHandler(a.uri);c!==null&&(o=c)}return this.loadTextureImage(e,s,o)}loadTextureImage(e,t,n){const i=this,s=this.json,a=s.textures[e],o=s.images[t],c=(o.uri||o.bufferView)+":"+a.sampler;if(this.textureCache[c])return this.textureCache[c];const l=this.loadImageSource(t,n).then(function(u){u.flipY=!1,u.name=a.name||o.name||"",u.name===""&&typeof o.uri=="string"&&o.uri.startsWith("data:image/")===!1&&(u.name=o.uri);const d=(s.samplers||{})[a.sampler]||{};return u.magFilter=Cp[d.magFilter]||Ze,u.minFilter=Cp[d.minFilter]||hn,u.wrapS=Ip[d.wrapS]||$n,u.wrapT=Ip[d.wrapT]||$n,u.generateMipmaps=!u.isCompressedTexture&&u.minFilter!==Ot&&u.minFilter!==Ze,i.associations.set(u,{textures:e}),u}).catch(function(){return null});return this.textureCache[c]=l,l}loadImageSource(e,t){const n=this,i=this.json,s=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(h=>h.clone());const a=i.images[e],o=self.URL||self.webkitURL;let c=a.uri||"",l=!1;if(a.bufferView!==void 0)c=n.getDependency("bufferView",a.bufferView).then(function(h){l=!0;const d=new Blob([h],{type:a.mimeType});return c=o.createObjectURL(d),c});else if(a.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");const u=Promise.resolve(c).then(function(h){return new Promise(function(d,f){let A=d;t.isImageBitmapLoader===!0&&(A=function(g){const m=new vt(g);m.needsUpdate=!0,d(m)}),t.load(za.resolveURL(h,s.path),A,void 0,f)})}).then(function(h){return l===!0&&o.revokeObjectURL(c),Mi(h,a),h.userData.mimeType=a.mimeType||jI(a.uri),h}).catch(function(h){throw console.error("THREE.GLTFLoader: Couldn't load texture",c),h});return this.sourceCache[e]=u,u}assignTexture(e,t,n,i){const s=this;return this.getDependency("texture",n.index).then(function(a){if(!a)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(a=a.clone(),a.channel=n.texCoord),s.extensions[je.KHR_TEXTURE_TRANSFORM]){const o=n.extensions!==void 0?n.extensions[je.KHR_TEXTURE_TRANSFORM]:void 0;if(o){const c=s.associations.get(a);a=s.extensions[je.KHR_TEXTURE_TRANSFORM].extendTexture(a,o),s.associations.set(a,c)}}return i!==void 0&&(a.colorSpace=i),e[t]=a,a})}assignFinalMaterial(e){const t=e.geometry;let n=e.material;const i=t.attributes.tangent===void 0,s=t.attributes.color!==void 0,a=t.attributes.normal===void 0;if(e.isPoints){const o="PointsMaterial:"+n.uuid;let c=this.cache.get(o);c||(c=new Dg,qn.prototype.copy.call(c,n),c.color.copy(n.color),c.map=n.map,c.sizeAttenuation=!1,this.cache.add(o,c)),n=c}else if(e.isLine){const o="LineBasicMaterial:"+n.uuid;let c=this.cache.get(o);c||(c=new Bg,qn.prototype.copy.call(c,n),c.color.copy(n.color),c.map=n.map,this.cache.add(o,c)),n=c}if(i||s||a){let o="ClonedMaterial:"+n.uuid+":";i&&(o+="derivative-tangents:"),s&&(o+="vertex-colors:"),a&&(o+="flat-shading:");let c=this.cache.get(o);c||(c=n.clone(),s&&(c.vertexColors=!0),a&&(c.flatShading=!0),i&&(c.normalScale&&(c.normalScale.y*=-1),c.clearcoatNormalScale&&(c.clearcoatNormalScale.y*=-1)),this.cache.add(o,c),this.associations.set(c,this.associations.get(n))),n=c}e.material=n}getMaterialType(){return so}loadMaterial(e){const t=this,n=this.json,i=this.extensions,s=n.materials[e];let a;const o={},c=s.extensions||{},l=[];if(c[je.KHR_MATERIALS_UNLIT]){const h=i[je.KHR_MATERIALS_UNLIT];a=h.getMaterialType(),l.push(h.extendParams(o,s,t))}else{const h=s.pbrMetallicRoughness||{};if(o.color=new Me(1,1,1),o.opacity=1,Array.isArray(h.baseColorFactor)){const d=h.baseColorFactor;o.color.setRGB(d[0],d[1],d[2],gt),o.opacity=d[3]}h.baseColorTexture!==void 0&&l.push(t.assignTexture(o,"map",h.baseColorTexture,mt)),o.metalness=h.metallicFactor!==void 0?h.metallicFactor:1,o.roughness=h.roughnessFactor!==void 0?h.roughnessFactor:1,h.metallicRoughnessTexture!==void 0&&(l.push(t.assignTexture(o,"metalnessMap",h.metallicRoughnessTexture)),l.push(t.assignTexture(o,"roughnessMap",h.metallicRoughnessTexture))),a=this._invokeOne(function(d){return d.getMaterialType&&d.getMaterialType(e)}),l.push(Promise.all(this._invokeAll(function(d){return d.extendMaterialParams&&d.extendMaterialParams(e,o)})))}s.doubleSided===!0&&(o.side=Wt);const u=s.alphaMode||Jl.OPAQUE;if(u===Jl.BLEND?(o.transparent=!0,o.depthWrite=!1):(o.transparent=!1,u===Jl.MASK&&(o.alphaTest=s.alphaCutoff!==void 0?s.alphaCutoff:.5)),s.normalTexture!==void 0&&a!==Fn&&(l.push(t.assignTexture(o,"normalMap",s.normalTexture)),o.normalScale=new ke(1,1),s.normalTexture.scale!==void 0)){const h=s.normalTexture.scale;o.normalScale.set(h,h)}if(s.occlusionTexture!==void 0&&a!==Fn&&(l.push(t.assignTexture(o,"aoMap",s.occlusionTexture)),s.occlusionTexture.strength!==void 0&&(o.aoMapIntensity=s.occlusionTexture.strength)),s.emissiveFactor!==void 0&&a!==Fn){const h=s.emissiveFactor;o.emissive=new Me().setRGB(h[0],h[1],h[2],gt)}return s.emissiveTexture!==void 0&&a!==Fn&&l.push(t.assignTexture(o,"emissiveMap",s.emissiveTexture,mt)),Promise.all(l).then(function(){const h=new a(o);return s.name&&(h.name=s.name),Mi(h,s),t.associations.set(h,{materials:e}),s.extensions&&fs(i,h,s),h})}createUniqueName(e){const t=et.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){const t=this,n=this.extensions,i=this.primitiveCache;function s(o){return n[je.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(o,t).then(function(c){return Mp(c,o,t)})}const a=[];for(let o=0,c=e.length;o<c;o++){const l=e[o],u=$I(l),h=i[u];if(h)a.push(h.promise);else{let d;l.extensions&&l.extensions[je.KHR_DRACO_MESH_COMPRESSION]?d=s(l):d=Mp(new An,l,t),i[u]={primitive:l,promise:d},a.push(d)}}return Promise.all(a)}loadMesh(e){const t=this,n=this.json,i=this.extensions,s=n.meshes[e],a=s.primitives,o=[];for(let c=0,l=a.length;c<l;c++){const u=a[c].material===void 0?WI(this.cache):this.getDependency("material",a[c].material);o.push(u)}return o.push(t.loadGeometries(a)),Promise.all(o).then(function(c){const l=c.slice(0,c.length-1),u=c[c.length-1],h=[];for(let f=0,A=u.length;f<A;f++){const g=u[f],m=a[f];let p;const E=l[f];if(m.mode===Bn.TRIANGLES||m.mode===Bn.TRIANGLE_STRIP||m.mode===Bn.TRIANGLE_FAN||m.mode===void 0)p=s.isSkinnedMesh===!0?new lE(g,E):new dt(g,E),p.isSkinnedMesh===!0&&p.normalizeSkinWeights(),m.mode===Bn.TRIANGLE_STRIP?p.geometry=yp(p.geometry,gg):m.mode===Bn.TRIANGLE_FAN&&(p.geometry=yp(p.geometry,Gu));else if(m.mode===Bn.LINES)p=new mE(g,E);else if(m.mode===Bn.LINE_STRIP)p=new io(g,E);else if(m.mode===Bn.LINE_LOOP)p=new gE(g,E);else if(m.mode===Bn.POINTS)p=new bE(g,E);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+m.mode);Object.keys(p.geometry.morphAttributes).length>0&&XI(p,s),p.name=t.createUniqueName(s.name||"mesh_"+e),Mi(p,s),m.extensions&&fs(i,p,m),t.assignFinalMaterial(p),h.push(p)}for(let f=0,A=h.length;f<A;f++)t.associations.set(h[f],{meshes:e,primitives:f});if(h.length===1)return s.extensions&&fs(i,h[0],s),h[0];const d=new Ki;s.extensions&&fs(i,d,s),t.associations.set(d,{meshes:e});for(let f=0,A=h.length;f<A;f++)d.add(h[f]);return d})}loadCamera(e){let t;const n=this.json.cameras[e],i=n[n.type];if(!i){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new $t(Qc.radToDeg(i.yfov),i.aspectRatio||1,i.znear||1,i.zfar||2e6):n.type==="orthographic"&&(t=new ea(-i.xmag,i.xmag,i.ymag,-i.ymag,i.znear,i.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),Mi(t,n),Promise.resolve(t)}loadSkin(e){const t=this.json.skins[e],n=[];for(let i=0,s=t.joints.length;i<s;i++)n.push(this._loadNodeShallow(t.joints[i]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(i){const s=i.pop(),a=i,o=[],c=[];for(let l=0,u=a.length;l<u;l++){const h=a[l];if(h){o.push(h);const d=new Ne;s!==null&&d.fromArray(s.array,l*16),c.push(d)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[l])}return new Sd(o,c)})}loadAnimation(e){const t=this.json,n=this,i=t.animations[e],s=i.name?i.name:"animation_"+e,a=[],o=[],c=[],l=[],u=[];for(let h=0,d=i.channels.length;h<d;h++){const f=i.channels[h],A=i.samplers[f.sampler],g=f.target,m=g.node,p=i.parameters!==void 0?i.parameters[A.input]:A.input,E=i.parameters!==void 0?i.parameters[A.output]:A.output;g.node!==void 0&&(a.push(this.getDependency("node",m)),o.push(this.getDependency("accessor",p)),c.push(this.getDependency("accessor",E)),l.push(A),u.push(g))}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(c),Promise.all(l),Promise.all(u)]).then(function(h){const d=h[0],f=h[1],A=h[2],g=h[3],m=h[4],p=[];for(let E=0,_=d.length;E<_;E++){const b=d[E],x=f[E],I=A[E],M=g[E],w=m[E];if(b===void 0)continue;b.updateMatrix&&b.updateMatrix();const v=n._createAnimationTracks(b,x,I,M,w);if(v)for(let y=0;y<v.length;y++)p.push(v[y])}return new qu(s,void 0,p)})}createNodeMesh(e){const t=this.json,n=this,i=t.nodes[e];return i.mesh===void 0?null:n.getDependency("mesh",i.mesh).then(function(s){const a=n._getNodeRef(n.meshCache,i.mesh,s);return i.weights!==void 0&&a.traverse(function(o){if(o.isMesh)for(let c=0,l=i.weights.length;c<l;c++)o.morphTargetInfluences[c]=i.weights[c]}),a})}loadNode(e){const t=this.json,n=this,i=t.nodes[e],s=n._loadNodeShallow(e),a=[],o=i.children||[];for(let l=0,u=o.length;l<u;l++)a.push(n.getDependency("node",o[l]));const c=i.skin===void 0?Promise.resolve(null):n.getDependency("skin",i.skin);return Promise.all([s,Promise.all(a),c]).then(function(l){const u=l[0],h=l[1],d=l[2];d!==null&&u.traverse(function(f){f.isSkinnedMesh&&f.bind(d,YI)});for(let f=0,A=h.length;f<A;f++)u.add(h[f]);return u})}_loadNodeShallow(e){const t=this.json,n=this.extensions,i=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];const s=t.nodes[e],a=s.name?i.createUniqueName(s.name):"",o=[],c=i._invokeOne(function(l){return l.createNodeMesh&&l.createNodeMesh(e)});return c&&o.push(c),s.camera!==void 0&&o.push(i.getDependency("camera",s.camera).then(function(l){return i._getNodeRef(i.cameraCache,s.camera,l)})),i._invokeAll(function(l){return l.createNodeAttachment&&l.createNodeAttachment(e)}).forEach(function(l){o.push(l)}),this.nodeCache[e]=Promise.all(o).then(function(l){let u;if(s.isBone===!0?u=new Rg:l.length>1?u=new Ki:l.length===1?u=l[0]:u=new pt,u!==l[0])for(let h=0,d=l.length;h<d;h++)u.add(l[h]);if(s.name&&(u.userData.name=s.name,u.name=a),Mi(u,s),s.extensions&&fs(n,u,s),s.matrix!==void 0){const h=new Ne;h.fromArray(s.matrix),u.applyMatrix4(h)}else s.translation!==void 0&&u.position.fromArray(s.translation),s.rotation!==void 0&&u.quaternion.fromArray(s.rotation),s.scale!==void 0&&u.scale.fromArray(s.scale);if(!i.associations.has(u))i.associations.set(u,{});else if(s.mesh!==void 0&&i.meshCache.refs[s.mesh]>1){const h=i.associations.get(u);i.associations.set(u,{...h})}return i.associations.get(u).nodes=e,u}),this.nodeCache[e]}loadScene(e){const t=this.extensions,n=this.json.scenes[e],i=this,s=new Ki;n.name&&(s.name=i.createUniqueName(n.name)),Mi(s,n),n.extensions&&fs(t,s,n);const a=n.nodes||[],o=[];for(let c=0,l=a.length;c<l;c++)o.push(i.getDependency("node",a[c]));return Promise.all(o).then(function(c){for(let u=0,h=c.length;u<h;u++)s.add(c[u]);const l=u=>{const h=new Map;for(const[d,f]of i.associations)(d instanceof qn||d instanceof vt)&&h.set(d,f);return u.traverse(d=>{const f=i.associations.get(d);f!=null&&h.set(d,f)}),h};return i.associations=l(s),s})}_createAnimationTracks(e,t,n,i,s){const a=[],o=e.name?e.name:e.uuid,c=[];Gi[s.path]===Gi.weights?e.traverse(function(d){d.morphTargetInfluences&&c.push(d.name?d.name:d.uuid)}):c.push(o);let l;switch(Gi[s.path]){case Gi.weights:l=qr;break;case Gi.rotation:l=Xr;break;case Gi.translation:case Gi.scale:l=$r;break;default:switch(n.itemSize){case 1:l=qr;break;case 2:case 3:default:l=$r;break}break}const u=i.interpolation!==void 0?VI[i.interpolation]:zr,h=this._getArrayFromAccessor(n);for(let d=0,f=c.length;d<f;d++){const A=new l(c[d]+"."+Gi[s.path],t.array,h,u);i.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(A),a.push(A)}return a}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){const n=Yu(t.constructor),i=new Float32Array(t.length);for(let s=0,a=t.length;s<a;s++)i[s]=t[s]*n;t=i}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){const i=this instanceof Xr?zI:a0;return new i(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}}function JI(r,e,t){const n=e.attributes,i=new ln;if(n.POSITION!==void 0){const o=t.json.accessors[n.POSITION],c=o.min,l=o.max;if(c!==void 0&&l!==void 0){if(i.set(new B(c[0],c[1],c[2]),new B(l[0],l[1],l[2])),o.normalized){const u=Yu(Ur[o.componentType]);i.min.multiplyScalar(u),i.max.multiplyScalar(u)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;const s=e.targets;if(s!==void 0){const o=new B,c=new B;for(let l=0,u=s.length;l<u;l++){const h=s[l];if(h.POSITION!==void 0){const d=t.json.accessors[h.POSITION],f=d.min,A=d.max;if(f!==void 0&&A!==void 0){if(c.setX(Math.max(Math.abs(f[0]),Math.abs(A[0]))),c.setY(Math.max(Math.abs(f[1]),Math.abs(A[1]))),c.setZ(Math.max(Math.abs(f[2]),Math.abs(A[2]))),d.normalized){const g=Yu(Ur[d.componentType]);c.multiplyScalar(g)}o.max(c)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}i.expandByVector(o)}r.boundingBox=i;const a=new Nn;i.getCenter(a.center),a.radius=i.min.distanceTo(i.max)/2,r.boundingSphere=a}function Mp(r,e,t){const n=e.attributes,i=[];function s(a,o){return t.getDependency("accessor",a).then(function(c){r.setAttribute(o,c)})}for(const a in n){const o=ju[a]||a.toLowerCase();o in r.attributes||i.push(s(n[a],o))}if(e.indices!==void 0&&!r.index){const a=t.getDependency("accessor",e.indices).then(function(o){r.setIndex(o)});i.push(a)}return Je.workingColorSpace!==gt&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${Je.workingColorSpace}" not supported.`),Mi(r,e),JI(r,e,t),Promise.all(i).then(function(){return e.targets!==void 0?qI(r,e.targets,t):r})}class ZI{constructor(e=4){this.pool=e,this.queue=[],this.workers=[],this.workersResolve=[],this.workerStatus=0,this.workerCreator=null}_initWorker(e){if(!this.workers[e]){const t=this.workerCreator();t.addEventListener("message",this._onMessage.bind(this,e)),this.workers[e]=t}}_getIdleWorker(){for(let e=0;e<this.pool;e++)if(!(this.workerStatus&1<<e))return e;return-1}_onMessage(e,t){const n=this.workersResolve[e];if(n&&n(t),this.queue.length){const{resolve:i,msg:s,transfer:a}=this.queue.shift();this.workersResolve[e]=i,this.workers[e].postMessage(s,a)}else this.workerStatus^=1<<e}setWorkerCreator(e){this.workerCreator=e}setWorkerLimit(e){this.pool=e}postMessage(e,t){return new Promise(n=>{const i=this._getIdleWorker();i!==-1?(this._initWorker(i),this.workerStatus|=1<<i,this.workersResolve[i]=n,this.workers[i].postMessage(e,t)):this.queue.push({resolve:n,msg:e,transfer:t})})}dispose(){this.workers.forEach(e=>e.terminate()),this.workersResolve.length=0,this.workers.length=0,this.queue.length=0,this.workerStatus=0}}const eM=0,wp=2,tM=1,Tp=2,nM=0,iM=1,sM=10,rM=0,o0=9,c0=15,l0=16,h0=22,u0=37,d0=43,f0=76,p0=83,A0=97,m0=100,g0=103,b0=109,aM=131,oM=132,cM=133,lM=134,hM=137,uM=138,dM=141,fM=142,pM=145,AM=146,_0=148,E0=152,mM=157,gM=158,x0=165,v0=166,Ld=1000066e3;class bM{constructor(){this.vkFormat=0,this.typeSize=1,this.pixelWidth=0,this.pixelHeight=0,this.pixelDepth=0,this.layerCount=0,this.faceCount=1,this.supercompressionScheme=0,this.levels=[],this.dataFormatDescriptor=[{vendorId:0,descriptorType:0,descriptorBlockSize:0,versionNumber:2,colorModel:0,colorPrimaries:1,transferFunction:2,flags:0,texelBlockDimension:[0,0,0,0],bytesPlane:[0,0,0,0,0,0,0,0],samples:[]}],this.keyValue={},this.globalData=null}}class pa{constructor(e,t,n,i){this._dataView=void 0,this._littleEndian=void 0,this._offset=void 0,this._dataView=new DataView(e.buffer,e.byteOffset+t,n),this._littleEndian=i,this._offset=0}_nextUint8(){const e=this._dataView.getUint8(this._offset);return this._offset+=1,e}_nextUint16(){const e=this._dataView.getUint16(this._offset,this._littleEndian);return this._offset+=2,e}_nextUint32(){const e=this._dataView.getUint32(this._offset,this._littleEndian);return this._offset+=4,e}_nextUint64(){const e=this._dataView.getUint32(this._offset,this._littleEndian)+4294967296*this._dataView.getUint32(this._offset+4,this._littleEndian);return this._offset+=8,e}_nextInt32(){const e=this._dataView.getInt32(this._offset,this._littleEndian);return this._offset+=4,e}_nextUint8Array(e){const t=new Uint8Array(this._dataView.buffer,this._dataView.byteOffset+this._offset,e);return this._offset+=e,t}_skip(e){return this._offset+=e,this}_scan(e,t){t===void 0&&(t=0);const n=this._offset;let i=0;for(;this._dataView.getUint8(this._offset)!==t&&i<e;)i++,this._offset++;return i<e&&this._offset++,new Uint8Array(this._dataView.buffer,this._dataView.byteOffset+n,i)}}const sn=[171,75,84,88,32,50,48,187,13,10,26,10];function Rp(r){return new TextDecoder().decode(r)}function _M(r){const e=new Uint8Array(r.buffer,r.byteOffset,sn.length);if(e[0]!==sn[0]||e[1]!==sn[1]||e[2]!==sn[2]||e[3]!==sn[3]||e[4]!==sn[4]||e[5]!==sn[5]||e[6]!==sn[6]||e[7]!==sn[7]||e[8]!==sn[8]||e[9]!==sn[9]||e[10]!==sn[10]||e[11]!==sn[11])throw new Error("Missing KTX 2.0 identifier.");const t=new bM,n=17*Uint32Array.BYTES_PER_ELEMENT,i=new pa(r,sn.length,n,!0);t.vkFormat=i._nextUint32(),t.typeSize=i._nextUint32(),t.pixelWidth=i._nextUint32(),t.pixelHeight=i._nextUint32(),t.pixelDepth=i._nextUint32(),t.layerCount=i._nextUint32(),t.faceCount=i._nextUint32();const s=i._nextUint32();t.supercompressionScheme=i._nextUint32();const a=i._nextUint32(),o=i._nextUint32(),c=i._nextUint32(),l=i._nextUint32(),u=i._nextUint64(),h=i._nextUint64(),d=new pa(r,sn.length+n,3*s*8,!0);for(let W=0;W<s;W++)t.levels.push({levelData:new Uint8Array(r.buffer,r.byteOffset+d._nextUint64(),d._nextUint64()),uncompressedByteLength:d._nextUint64()});const f=new pa(r,a,o,!0),A={vendorId:f._skip(4)._nextUint16(),descriptorType:f._nextUint16(),versionNumber:f._nextUint16(),descriptorBlockSize:f._nextUint16(),colorModel:f._nextUint8(),colorPrimaries:f._nextUint8(),transferFunction:f._nextUint8(),flags:f._nextUint8(),texelBlockDimension:[f._nextUint8(),f._nextUint8(),f._nextUint8(),f._nextUint8()],bytesPlane:[f._nextUint8(),f._nextUint8(),f._nextUint8(),f._nextUint8(),f._nextUint8(),f._nextUint8(),f._nextUint8(),f._nextUint8()],samples:[]},g=(A.descriptorBlockSize/4-6)/4;for(let W=0;W<g;W++){const Q={bitOffset:f._nextUint16(),bitLength:f._nextUint8(),channelType:f._nextUint8(),samplePosition:[f._nextUint8(),f._nextUint8(),f._nextUint8(),f._nextUint8()],sampleLower:-1/0,sampleUpper:1/0};64&Q.channelType?(Q.sampleLower=f._nextInt32(),Q.sampleUpper=f._nextInt32()):(Q.sampleLower=f._nextUint32(),Q.sampleUpper=f._nextUint32()),A.samples[W]=Q}t.dataFormatDescriptor.length=0,t.dataFormatDescriptor.push(A);const m=new pa(r,c,l,!0);for(;m._offset<l;){const W=m._nextUint32(),Q=m._scan(W),Y=Rp(Q);if(t.keyValue[Y]=m._nextUint8Array(W-Q.byteLength-1),Y.match(/^ktx/i)){const Z=Rp(t.keyValue[Y]);t.keyValue[Y]=Z.substring(0,Z.lastIndexOf("\0"))}m._skip(W%4?4-W%4:0)}if(h<=0)return t;const p=new pa(r,u,h,!0),E=p._nextUint16(),_=p._nextUint16(),b=p._nextUint32(),x=p._nextUint32(),I=p._nextUint32(),M=p._nextUint32(),w=[];for(let W=0;W<s;W++)w.push({imageFlags:p._nextUint32(),rgbSliceByteOffset:p._nextUint32(),rgbSliceByteLength:p._nextUint32(),alphaSliceByteOffset:p._nextUint32(),alphaSliceByteLength:p._nextUint32()});const v=u+p._offset,y=v+b,T=y+x,k=T+I,U=new Uint8Array(r.buffer,r.byteOffset+v,b),F=new Uint8Array(r.buffer,r.byteOffset+y,x),H=new Uint8Array(r.buffer,r.byteOffset+T,I),O=new Uint8Array(r.buffer,r.byteOffset+k,M);return t.globalData={endpointCount:E,selectorCount:_,imageDescs:w,endpointsData:U,selectorsData:F,tablesData:H,extendedData:O},t}let eh,Ii,Ku;const th={env:{emscripten_notify_memory_growth:function(r){Ku=new Uint8Array(Ii.exports.memory.buffer)}}};class EM{init(){return eh||(eh=typeof fetch<"u"?fetch("data:application/wasm;base64,"+Bp).then(e=>e.arrayBuffer()).then(e=>WebAssembly.instantiate(e,th)).then(this._init):WebAssembly.instantiate(Buffer.from(Bp,"base64"),th).then(this._init),eh)}_init(e){Ii=e.instance,th.env.emscripten_notify_memory_growth(0)}decode(e,t=0){if(!Ii)throw new Error("ZSTDDecoder: Await .init() before decoding.");const n=e.byteLength,i=Ii.exports.malloc(n);Ku.set(e,i),t=t||Number(Ii.exports.ZSTD_findDecompressedSize(i,n));const s=Ii.exports.malloc(t),a=Ii.exports.ZSTD_decompress(s,t,i,n),o=Ku.slice(s,s+a);return Ii.exports.free(i),Ii.exports.free(s),o}}const Bp="AGFzbQEAAAABpQEVYAF/AX9gAn9/AGADf39/AX9gBX9/f39/AX9gAX8AYAJ/fwF/YAR/f39/AX9gA39/fwBgBn9/f39/fwF/YAd/f39/f39/AX9gAn9/AX5gAn5+AX5gAABgBX9/f39/AGAGf39/f39/AGAIf39/f39/f38AYAl/f39/f39/f38AYAABf2AIf39/f39/f38Bf2ANf39/f39/f39/f39/fwF/YAF/AX4CJwEDZW52H2Vtc2NyaXB0ZW5fbm90aWZ5X21lbW9yeV9ncm93dGgABANpaAEFAAAFAgEFCwACAQABAgIFBQcAAwABDgsBAQcAEhMHAAUBDAQEAAANBwQCAgYCBAgDAwMDBgEACQkHBgICAAYGAgQUBwYGAwIGAAMCAQgBBwUGCgoEEQAEBAEIAwgDBQgDEA8IAAcABAUBcAECAgUEAQCAAgYJAX8BQaCgwAILB2AHBm1lbW9yeQIABm1hbGxvYwAoBGZyZWUAJgxaU1REX2lzRXJyb3IAaBlaU1REX2ZpbmREZWNvbXByZXNzZWRTaXplAFQPWlNURF9kZWNvbXByZXNzAEoGX3N0YXJ0ACQJBwEAQQELASQKussBaA8AIAAgACgCBCABajYCBAsZACAAKAIAIAAoAgRBH3F0QQAgAWtBH3F2CwgAIABBiH9LC34BBH9BAyEBIAAoAgQiA0EgTQRAIAAoAggiASAAKAIQTwRAIAAQDQ8LIAAoAgwiAiABRgRAQQFBAiADQSBJGw8LIAAgASABIAJrIANBA3YiBCABIARrIAJJIgEbIgJrIgQ2AgggACADIAJBA3RrNgIEIAAgBCgAADYCAAsgAQsUAQF/IAAgARACIQIgACABEAEgAgv3AQECfyACRQRAIABCADcCACAAQQA2AhAgAEIANwIIQbh/DwsgACABNgIMIAAgAUEEajYCECACQQRPBEAgACABIAJqIgFBfGoiAzYCCCAAIAMoAAA2AgAgAUF/ai0AACIBBEAgAEEIIAEQFGs2AgQgAg8LIABBADYCBEF/DwsgACABNgIIIAAgAS0AACIDNgIAIAJBfmoiBEEBTQRAIARBAWtFBEAgACABLQACQRB0IANyIgM2AgALIAAgAS0AAUEIdCADajYCAAsgASACakF/ai0AACIBRQRAIABBADYCBEFsDwsgAEEoIAEQFCACQQN0ams2AgQgAgsWACAAIAEpAAA3AAAgACABKQAINwAICy8BAX8gAUECdEGgHWooAgAgACgCAEEgIAEgACgCBGprQR9xdnEhAiAAIAEQASACCyEAIAFCz9bTvtLHq9lCfiAAfEIfiUKHla+vmLbem55/fgsdAQF/IAAoAgggACgCDEYEfyAAKAIEQSBGBUEACwuCBAEDfyACQYDAAE8EQCAAIAEgAhBnIAAPCyAAIAJqIQMCQCAAIAFzQQNxRQRAAkAgAkEBSARAIAAhAgwBCyAAQQNxRQRAIAAhAgwBCyAAIQIDQCACIAEtAAA6AAAgAUEBaiEBIAJBAWoiAiADTw0BIAJBA3ENAAsLAkAgA0F8cSIEQcAASQ0AIAIgBEFAaiIFSw0AA0AgAiABKAIANgIAIAIgASgCBDYCBCACIAEoAgg2AgggAiABKAIMNgIMIAIgASgCEDYCECACIAEoAhQ2AhQgAiABKAIYNgIYIAIgASgCHDYCHCACIAEoAiA2AiAgAiABKAIkNgIkIAIgASgCKDYCKCACIAEoAiw2AiwgAiABKAIwNgIwIAIgASgCNDYCNCACIAEoAjg2AjggAiABKAI8NgI8IAFBQGshASACQUBrIgIgBU0NAAsLIAIgBE8NAQNAIAIgASgCADYCACABQQRqIQEgAkEEaiICIARJDQALDAELIANBBEkEQCAAIQIMAQsgA0F8aiIEIABJBEAgACECDAELIAAhAgNAIAIgAS0AADoAACACIAEtAAE6AAEgAiABLQACOgACIAIgAS0AAzoAAyABQQRqIQEgAkEEaiICIARNDQALCyACIANJBEADQCACIAEtAAA6AAAgAUEBaiEBIAJBAWoiAiADRw0ACwsgAAsMACAAIAEpAAA3AAALQQECfyAAKAIIIgEgACgCEEkEQEEDDwsgACAAKAIEIgJBB3E2AgQgACABIAJBA3ZrIgE2AgggACABKAAANgIAQQALDAAgACABKAIANgAAC/cCAQJ/AkAgACABRg0AAkAgASACaiAASwRAIAAgAmoiBCABSw0BCyAAIAEgAhALDwsgACABc0EDcSEDAkACQCAAIAFJBEAgAwRAIAAhAwwDCyAAQQNxRQRAIAAhAwwCCyAAIQMDQCACRQ0EIAMgAS0AADoAACABQQFqIQEgAkF/aiECIANBAWoiA0EDcQ0ACwwBCwJAIAMNACAEQQNxBEADQCACRQ0FIAAgAkF/aiICaiIDIAEgAmotAAA6AAAgA0EDcQ0ACwsgAkEDTQ0AA0AgACACQXxqIgJqIAEgAmooAgA2AgAgAkEDSw0ACwsgAkUNAgNAIAAgAkF/aiICaiABIAJqLQAAOgAAIAINAAsMAgsgAkEDTQ0AIAIhBANAIAMgASgCADYCACABQQRqIQEgA0EEaiEDIARBfGoiBEEDSw0ACyACQQNxIQILIAJFDQADQCADIAEtAAA6AAAgA0EBaiEDIAFBAWohASACQX9qIgINAAsLIAAL8wICAn8BfgJAIAJFDQAgACACaiIDQX9qIAE6AAAgACABOgAAIAJBA0kNACADQX5qIAE6AAAgACABOgABIANBfWogAToAACAAIAE6AAIgAkEHSQ0AIANBfGogAToAACAAIAE6AAMgAkEJSQ0AIABBACAAa0EDcSIEaiIDIAFB/wFxQYGChAhsIgE2AgAgAyACIARrQXxxIgRqIgJBfGogATYCACAEQQlJDQAgAyABNgIIIAMgATYCBCACQXhqIAE2AgAgAkF0aiABNgIAIARBGUkNACADIAE2AhggAyABNgIUIAMgATYCECADIAE2AgwgAkFwaiABNgIAIAJBbGogATYCACACQWhqIAE2AgAgAkFkaiABNgIAIAQgA0EEcUEYciIEayICQSBJDQAgAa0iBUIghiAFhCEFIAMgBGohAQNAIAEgBTcDGCABIAU3AxAgASAFNwMIIAEgBTcDACABQSBqIQEgAkFgaiICQR9LDQALCyAACy8BAn8gACgCBCAAKAIAQQJ0aiICLQACIQMgACACLwEAIAEgAi0AAxAIajYCACADCy8BAn8gACgCBCAAKAIAQQJ0aiICLQACIQMgACACLwEAIAEgAi0AAxAFajYCACADCx8AIAAgASACKAIEEAg2AgAgARAEGiAAIAJBCGo2AgQLCAAgAGdBH3MLugUBDX8jAEEQayIKJAACfyAEQQNNBEAgCkEANgIMIApBDGogAyAEEAsaIAAgASACIApBDGpBBBAVIgBBbCAAEAMbIAAgACAESxsMAQsgAEEAIAEoAgBBAXRBAmoQECENQVQgAygAACIGQQ9xIgBBCksNABogAiAAQQVqNgIAIAMgBGoiAkF8aiEMIAJBeWohDiACQXtqIRAgAEEGaiELQQQhBSAGQQR2IQRBICAAdCIAQQFyIQkgASgCACEPQQAhAiADIQYCQANAIAlBAkggAiAPS3JFBEAgAiEHAkAgCARAA0AgBEH//wNxQf//A0YEQCAHQRhqIQcgBiAQSQR/IAZBAmoiBigAACAFdgUgBUEQaiEFIARBEHYLIQQMAQsLA0AgBEEDcSIIQQNGBEAgBUECaiEFIARBAnYhBCAHQQNqIQcMAQsLIAcgCGoiByAPSw0EIAVBAmohBQNAIAIgB0kEQCANIAJBAXRqQQA7AQAgAkEBaiECDAELCyAGIA5LQQAgBiAFQQN1aiIHIAxLG0UEQCAHKAAAIAVBB3EiBXYhBAwCCyAEQQJ2IQQLIAYhBwsCfyALQX9qIAQgAEF/anEiBiAAQQF0QX9qIgggCWsiEUkNABogBCAIcSIEQQAgESAEIABIG2shBiALCyEIIA0gAkEBdGogBkF/aiIEOwEAIAlBASAGayAEIAZBAUgbayEJA0AgCSAASARAIABBAXUhACALQX9qIQsMAQsLAn8gByAOS0EAIAcgBSAIaiIFQQN1aiIGIAxLG0UEQCAFQQdxDAELIAUgDCIGIAdrQQN0awshBSACQQFqIQIgBEUhCCAGKAAAIAVBH3F2IQQMAQsLQWwgCUEBRyAFQSBKcg0BGiABIAJBf2o2AgAgBiAFQQdqQQN1aiADawwBC0FQCyEAIApBEGokACAACwkAQQFBBSAAGwsMACAAIAEoAAA2AAALqgMBCn8jAEHwAGsiCiQAIAJBAWohDiAAQQhqIQtBgIAEIAVBf2p0QRB1IQxBACECQQEhBkEBIAV0IglBf2oiDyEIA0AgAiAORkUEQAJAIAEgAkEBdCINai8BACIHQf//A0YEQCALIAhBA3RqIAI2AgQgCEF/aiEIQQEhBwwBCyAGQQAgDCAHQRB0QRB1ShshBgsgCiANaiAHOwEAIAJBAWohAgwBCwsgACAFNgIEIAAgBjYCACAJQQN2IAlBAXZqQQNqIQxBACEAQQAhBkEAIQIDQCAGIA5GBEADQAJAIAAgCUYNACAKIAsgAEEDdGoiASgCBCIGQQF0aiICIAIvAQAiAkEBajsBACABIAUgAhAUayIIOgADIAEgAiAIQf8BcXQgCWs7AQAgASAEIAZBAnQiAmooAgA6AAIgASACIANqKAIANgIEIABBAWohAAwBCwsFIAEgBkEBdGouAQAhDUEAIQcDQCAHIA1ORQRAIAsgAkEDdGogBjYCBANAIAIgDGogD3EiAiAISw0ACyAHQQFqIQcMAQsLIAZBAWohBgwBCwsgCkHwAGokAAsjAEIAIAEQCSAAhUKHla+vmLbem55/fkLj3MqV/M7y9YV/fAsQACAAQn43AwggACABNgIACyQBAX8gAARAIAEoAgQiAgRAIAEoAgggACACEQEADwsgABAmCwsfACAAIAEgAi8BABAINgIAIAEQBBogACACQQRqNgIEC0oBAX9BoCAoAgAiASAAaiIAQX9MBEBBiCBBMDYCAEF/DwsCQCAAPwBBEHRNDQAgABBmDQBBiCBBMDYCAEF/DwtBoCAgADYCACABC9cBAQh/Qbp/IQoCQCACKAIEIgggAigCACIJaiIOIAEgAGtLDQBBbCEKIAkgBCADKAIAIgtrSw0AIAAgCWoiBCACKAIIIgxrIQ0gACABQWBqIg8gCyAJQQAQKSADIAkgC2o2AgACQAJAIAwgBCAFa00EQCANIQUMAQsgDCAEIAZrSw0CIAcgDSAFayIAaiIBIAhqIAdNBEAgBCABIAgQDxoMAgsgBCABQQAgAGsQDyEBIAIgACAIaiIINgIEIAEgAGshBAsgBCAPIAUgCEEBECkLIA4hCgsgCgubAgEBfyMAQYABayINJAAgDSADNgJ8AkAgAkEDSwRAQX8hCQwBCwJAAkACQAJAIAJBAWsOAwADAgELIAZFBEBBuH8hCQwEC0FsIQkgBS0AACICIANLDQMgACAHIAJBAnQiAmooAgAgAiAIaigCABA7IAEgADYCAEEBIQkMAwsgASAJNgIAQQAhCQwCCyAKRQRAQWwhCQwCC0EAIQkgC0UgDEEZSHINAUEIIAR0QQhqIQBBACECA0AgAiAATw0CIAJBQGshAgwAAAsAC0FsIQkgDSANQfwAaiANQfgAaiAFIAYQFSICEAMNACANKAJ4IgMgBEsNACAAIA0gDSgCfCAHIAggAxAYIAEgADYCACACIQkLIA1BgAFqJAAgCQsLACAAIAEgAhALGgsQACAALwAAIAAtAAJBEHRyCy8AAn9BuH8gAUEISQ0AGkFyIAAoAAQiAEF3Sw0AGkG4fyAAQQhqIgAgACABSxsLCwkAIAAgATsAAAsDAAELigYBBX8gACAAKAIAIgVBfnE2AgBBACAAIAVBAXZqQYQgKAIAIgQgAEYbIQECQAJAIAAoAgQiAkUNACACKAIAIgNBAXENACACQQhqIgUgA0EBdkF4aiIDQQggA0EISxtnQR9zQQJ0QYAfaiIDKAIARgRAIAMgAigCDDYCAAsgAigCCCIDBEAgAyACKAIMNgIECyACKAIMIgMEQCADIAIoAgg2AgALIAIgAigCACAAKAIAQX5xajYCAEGEICEAAkACQCABRQ0AIAEgAjYCBCABKAIAIgNBAXENASADQQF2QXhqIgNBCCADQQhLG2dBH3NBAnRBgB9qIgMoAgAgAUEIakYEQCADIAEoAgw2AgALIAEoAggiAwRAIAMgASgCDDYCBAsgASgCDCIDBEAgAyABKAIINgIAQYQgKAIAIQQLIAIgAigCACABKAIAQX5xajYCACABIARGDQAgASABKAIAQQF2akEEaiEACyAAIAI2AgALIAIoAgBBAXZBeGoiAEEIIABBCEsbZ0Efc0ECdEGAH2oiASgCACEAIAEgBTYCACACIAA2AgwgAkEANgIIIABFDQEgACAFNgIADwsCQCABRQ0AIAEoAgAiAkEBcQ0AIAJBAXZBeGoiAkEIIAJBCEsbZ0Efc0ECdEGAH2oiAigCACABQQhqRgRAIAIgASgCDDYCAAsgASgCCCICBEAgAiABKAIMNgIECyABKAIMIgIEQCACIAEoAgg2AgBBhCAoAgAhBAsgACAAKAIAIAEoAgBBfnFqIgI2AgACQCABIARHBEAgASABKAIAQQF2aiAANgIEIAAoAgAhAgwBC0GEICAANgIACyACQQF2QXhqIgFBCCABQQhLG2dBH3NBAnRBgB9qIgIoAgAhASACIABBCGoiAjYCACAAIAE2AgwgAEEANgIIIAFFDQEgASACNgIADwsgBUEBdkF4aiIBQQggAUEISxtnQR9zQQJ0QYAfaiICKAIAIQEgAiAAQQhqIgI2AgAgACABNgIMIABBADYCCCABRQ0AIAEgAjYCAAsLDgAgAARAIABBeGoQJQsLgAIBA38CQCAAQQ9qQXhxQYQgKAIAKAIAQQF2ayICEB1Bf0YNAAJAQYQgKAIAIgAoAgAiAUEBcQ0AIAFBAXZBeGoiAUEIIAFBCEsbZ0Efc0ECdEGAH2oiASgCACAAQQhqRgRAIAEgACgCDDYCAAsgACgCCCIBBEAgASAAKAIMNgIECyAAKAIMIgFFDQAgASAAKAIINgIAC0EBIQEgACAAKAIAIAJBAXRqIgI2AgAgAkEBcQ0AIAJBAXZBeGoiAkEIIAJBCEsbZ0Efc0ECdEGAH2oiAygCACECIAMgAEEIaiIDNgIAIAAgAjYCDCAAQQA2AgggAkUNACACIAM2AgALIAELtwIBA38CQAJAIABBASAAGyICEDgiAA0AAkACQEGEICgCACIARQ0AIAAoAgAiA0EBcQ0AIAAgA0EBcjYCACADQQF2QXhqIgFBCCABQQhLG2dBH3NBAnRBgB9qIgEoAgAgAEEIakYEQCABIAAoAgw2AgALIAAoAggiAQRAIAEgACgCDDYCBAsgACgCDCIBBEAgASAAKAIINgIACyACECchAkEAIQFBhCAoAgAhACACDQEgACAAKAIAQX5xNgIAQQAPCyACQQ9qQXhxIgMQHSICQX9GDQIgAkEHakF4cSIAIAJHBEAgACACaxAdQX9GDQMLAkBBhCAoAgAiAUUEQEGAICAANgIADAELIAAgATYCBAtBhCAgADYCACAAIANBAXRBAXI2AgAMAQsgAEUNAQsgAEEIaiEBCyABC7kDAQJ/IAAgA2ohBQJAIANBB0wEQANAIAAgBU8NAiAAIAItAAA6AAAgAEEBaiEAIAJBAWohAgwAAAsACyAEQQFGBEACQCAAIAJrIgZBB00EQCAAIAItAAA6AAAgACACLQABOgABIAAgAi0AAjoAAiAAIAItAAM6AAMgAEEEaiACIAZBAnQiBkHAHmooAgBqIgIQFyACIAZB4B5qKAIAayECDAELIAAgAhAMCyACQQhqIQIgAEEIaiEACwJAAkACQAJAIAUgAU0EQCAAIANqIQEgBEEBRyAAIAJrQQ9Kcg0BA0AgACACEAwgAkEIaiECIABBCGoiACABSQ0ACwwFCyAAIAFLBEAgACEBDAQLIARBAUcgACACa0EPSnINASAAIQMgAiEEA0AgAyAEEAwgBEEIaiEEIANBCGoiAyABSQ0ACwwCCwNAIAAgAhAHIAJBEGohAiAAQRBqIgAgAUkNAAsMAwsgACEDIAIhBANAIAMgBBAHIARBEGohBCADQRBqIgMgAUkNAAsLIAIgASAAa2ohAgsDQCABIAVPDQEgASACLQAAOgAAIAFBAWohASACQQFqIQIMAAALAAsLQQECfyAAIAAoArjgASIDNgLE4AEgACgCvOABIQQgACABNgK84AEgACABIAJqNgK44AEgACABIAQgA2tqNgLA4AELpgEBAX8gACAAKALs4QEQFjYCyOABIABCADcD+OABIABCADcDuOABIABBwOABakIANwMAIABBqNAAaiIBQYyAgOAANgIAIABBADYCmOIBIABCADcDiOEBIABCAzcDgOEBIABBrNABakHgEikCADcCACAAQbTQAWpB6BIoAgA2AgAgACABNgIMIAAgAEGYIGo2AgggACAAQaAwajYCBCAAIABBEGo2AgALYQEBf0G4fyEDAkAgAUEDSQ0AIAIgABAhIgFBA3YiADYCCCACIAFBAXE2AgQgAiABQQF2QQNxIgM2AgACQCADQX9qIgFBAksNAAJAIAFBAWsOAgEAAgtBbA8LIAAhAwsgAwsMACAAIAEgAkEAEC4LiAQCA38CfiADEBYhBCAAQQBBKBAQIQAgBCACSwRAIAQPCyABRQRAQX8PCwJAAkAgA0EBRg0AIAEoAAAiBkGo6r5pRg0AQXYhAyAGQXBxQdDUtMIBRw0BQQghAyACQQhJDQEgAEEAQSgQECEAIAEoAAQhASAAQQE2AhQgACABrTcDAEEADwsgASACIAMQLyIDIAJLDQAgACADNgIYQXIhAyABIARqIgVBf2otAAAiAkEIcQ0AIAJBIHEiBkUEQEFwIQMgBS0AACIFQacBSw0BIAVBB3GtQgEgBUEDdkEKaq2GIgdCA4h+IAd8IQggBEEBaiEECyACQQZ2IQMgAkECdiEFAkAgAkEDcUF/aiICQQJLBEBBACECDAELAkACQAJAIAJBAWsOAgECAAsgASAEai0AACECIARBAWohBAwCCyABIARqLwAAIQIgBEECaiEEDAELIAEgBGooAAAhAiAEQQRqIQQLIAVBAXEhBQJ+AkACQAJAIANBf2oiA0ECTQRAIANBAWsOAgIDAQtCfyAGRQ0DGiABIARqMQAADAMLIAEgBGovAACtQoACfAwCCyABIARqKAAArQwBCyABIARqKQAACyEHIAAgBTYCICAAIAI2AhwgACAHNwMAQQAhAyAAQQA2AhQgACAHIAggBhsiBzcDCCAAIAdCgIAIIAdCgIAIVBs+AhALIAMLWwEBf0G4fyEDIAIQFiICIAFNBH8gACACakF/ai0AACIAQQNxQQJ0QaAeaigCACACaiAAQQZ2IgFBAnRBsB5qKAIAaiAAQSBxIgBFaiABRSAAQQV2cWoFQbh/CwsdACAAKAKQ4gEQWiAAQQA2AqDiASAAQgA3A5DiAQu1AwEFfyMAQZACayIKJABBuH8hBgJAIAVFDQAgBCwAACIIQf8BcSEHAkAgCEF/TARAIAdBgn9qQQF2IgggBU8NAkFsIQYgB0GBf2oiBUGAAk8NAiAEQQFqIQdBACEGA0AgBiAFTwRAIAUhBiAIIQcMAwUgACAGaiAHIAZBAXZqIgQtAABBBHY6AAAgACAGQQFyaiAELQAAQQ9xOgAAIAZBAmohBgwBCwAACwALIAcgBU8NASAAIARBAWogByAKEFMiBhADDQELIAYhBEEAIQYgAUEAQTQQECEJQQAhBQNAIAQgBkcEQCAAIAZqIggtAAAiAUELSwRAQWwhBgwDBSAJIAFBAnRqIgEgASgCAEEBajYCACAGQQFqIQZBASAILQAAdEEBdSAFaiEFDAILAAsLQWwhBiAFRQ0AIAUQFEEBaiIBQQxLDQAgAyABNgIAQQFBASABdCAFayIDEBQiAXQgA0cNACAAIARqIAFBAWoiADoAACAJIABBAnRqIgAgACgCAEEBajYCACAJKAIEIgBBAkkgAEEBcXINACACIARBAWo2AgAgB0EBaiEGCyAKQZACaiQAIAYLxhEBDH8jAEHwAGsiBSQAQWwhCwJAIANBCkkNACACLwAAIQogAi8AAiEJIAIvAAQhByAFQQhqIAQQDgJAIAMgByAJIApqakEGaiIMSQ0AIAUtAAohCCAFQdgAaiACQQZqIgIgChAGIgsQAw0BIAVBQGsgAiAKaiICIAkQBiILEAMNASAFQShqIAIgCWoiAiAHEAYiCxADDQEgBUEQaiACIAdqIAMgDGsQBiILEAMNASAAIAFqIg9BfWohECAEQQRqIQZBASELIAAgAUEDakECdiIDaiIMIANqIgIgA2oiDiEDIAIhBCAMIQcDQCALIAMgEElxBEAgACAGIAVB2ABqIAgQAkECdGoiCS8BADsAACAFQdgAaiAJLQACEAEgCS0AAyELIAcgBiAFQUBrIAgQAkECdGoiCS8BADsAACAFQUBrIAktAAIQASAJLQADIQogBCAGIAVBKGogCBACQQJ0aiIJLwEAOwAAIAVBKGogCS0AAhABIAktAAMhCSADIAYgBUEQaiAIEAJBAnRqIg0vAQA7AAAgBUEQaiANLQACEAEgDS0AAyENIAAgC2oiCyAGIAVB2ABqIAgQAkECdGoiAC8BADsAACAFQdgAaiAALQACEAEgAC0AAyEAIAcgCmoiCiAGIAVBQGsgCBACQQJ0aiIHLwEAOwAAIAVBQGsgBy0AAhABIActAAMhByAEIAlqIgkgBiAFQShqIAgQAkECdGoiBC8BADsAACAFQShqIAQtAAIQASAELQADIQQgAyANaiIDIAYgBUEQaiAIEAJBAnRqIg0vAQA7AAAgBUEQaiANLQACEAEgACALaiEAIAcgCmohByAEIAlqIQQgAyANLQADaiEDIAVB2ABqEA0gBUFAaxANciAFQShqEA1yIAVBEGoQDXJFIQsMAQsLIAQgDksgByACS3INAEFsIQsgACAMSw0BIAxBfWohCQNAQQAgACAJSSAFQdgAahAEGwRAIAAgBiAFQdgAaiAIEAJBAnRqIgovAQA7AAAgBUHYAGogCi0AAhABIAAgCi0AA2oiACAGIAVB2ABqIAgQAkECdGoiCi8BADsAACAFQdgAaiAKLQACEAEgACAKLQADaiEADAEFIAxBfmohCgNAIAVB2ABqEAQgACAKS3JFBEAgACAGIAVB2ABqIAgQAkECdGoiCS8BADsAACAFQdgAaiAJLQACEAEgACAJLQADaiEADAELCwNAIAAgCk0EQCAAIAYgBUHYAGogCBACQQJ0aiIJLwEAOwAAIAVB2ABqIAktAAIQASAAIAktAANqIQAMAQsLAkAgACAMTw0AIAAgBiAFQdgAaiAIEAIiAEECdGoiDC0AADoAACAMLQADQQFGBEAgBUHYAGogDC0AAhABDAELIAUoAlxBH0sNACAFQdgAaiAGIABBAnRqLQACEAEgBSgCXEEhSQ0AIAVBIDYCXAsgAkF9aiEMA0BBACAHIAxJIAVBQGsQBBsEQCAHIAYgBUFAayAIEAJBAnRqIgAvAQA7AAAgBUFAayAALQACEAEgByAALQADaiIAIAYgBUFAayAIEAJBAnRqIgcvAQA7AAAgBUFAayAHLQACEAEgACAHLQADaiEHDAEFIAJBfmohDANAIAVBQGsQBCAHIAxLckUEQCAHIAYgBUFAayAIEAJBAnRqIgAvAQA7AAAgBUFAayAALQACEAEgByAALQADaiEHDAELCwNAIAcgDE0EQCAHIAYgBUFAayAIEAJBAnRqIgAvAQA7AAAgBUFAayAALQACEAEgByAALQADaiEHDAELCwJAIAcgAk8NACAHIAYgBUFAayAIEAIiAEECdGoiAi0AADoAACACLQADQQFGBEAgBUFAayACLQACEAEMAQsgBSgCREEfSw0AIAVBQGsgBiAAQQJ0ai0AAhABIAUoAkRBIUkNACAFQSA2AkQLIA5BfWohAgNAQQAgBCACSSAFQShqEAQbBEAgBCAGIAVBKGogCBACQQJ0aiIALwEAOwAAIAVBKGogAC0AAhABIAQgAC0AA2oiACAGIAVBKGogCBACQQJ0aiIELwEAOwAAIAVBKGogBC0AAhABIAAgBC0AA2ohBAwBBSAOQX5qIQIDQCAFQShqEAQgBCACS3JFBEAgBCAGIAVBKGogCBACQQJ0aiIALwEAOwAAIAVBKGogAC0AAhABIAQgAC0AA2ohBAwBCwsDQCAEIAJNBEAgBCAGIAVBKGogCBACQQJ0aiIALwEAOwAAIAVBKGogAC0AAhABIAQgAC0AA2ohBAwBCwsCQCAEIA5PDQAgBCAGIAVBKGogCBACIgBBAnRqIgItAAA6AAAgAi0AA0EBRgRAIAVBKGogAi0AAhABDAELIAUoAixBH0sNACAFQShqIAYgAEECdGotAAIQASAFKAIsQSFJDQAgBUEgNgIsCwNAQQAgAyAQSSAFQRBqEAQbBEAgAyAGIAVBEGogCBACQQJ0aiIALwEAOwAAIAVBEGogAC0AAhABIAMgAC0AA2oiACAGIAVBEGogCBACQQJ0aiICLwEAOwAAIAVBEGogAi0AAhABIAAgAi0AA2ohAwwBBSAPQX5qIQIDQCAFQRBqEAQgAyACS3JFBEAgAyAGIAVBEGogCBACQQJ0aiIALwEAOwAAIAVBEGogAC0AAhABIAMgAC0AA2ohAwwBCwsDQCADIAJNBEAgAyAGIAVBEGogCBACQQJ0aiIALwEAOwAAIAVBEGogAC0AAhABIAMgAC0AA2ohAwwBCwsCQCADIA9PDQAgAyAGIAVBEGogCBACIgBBAnRqIgItAAA6AAAgAi0AA0EBRgRAIAVBEGogAi0AAhABDAELIAUoAhRBH0sNACAFQRBqIAYgAEECdGotAAIQASAFKAIUQSFJDQAgBUEgNgIUCyABQWwgBUHYAGoQCiAFQUBrEApxIAVBKGoQCnEgBUEQahAKcRshCwwJCwAACwALAAALAAsAAAsACwAACwALQWwhCwsgBUHwAGokACALC7UEAQ5/IwBBEGsiBiQAIAZBBGogABAOQVQhBQJAIARB3AtJDQAgBi0ABCEHIANB8ARqQQBB7AAQECEIIAdBDEsNACADQdwJaiIJIAggBkEIaiAGQQxqIAEgAhAxIhAQA0UEQCAGKAIMIgQgB0sNASADQdwFaiEPIANBpAVqIREgAEEEaiESIANBqAVqIQEgBCEFA0AgBSICQX9qIQUgCCACQQJ0aigCAEUNAAsgAkEBaiEOQQEhBQNAIAUgDk9FBEAgCCAFQQJ0IgtqKAIAIQwgASALaiAKNgIAIAVBAWohBSAKIAxqIQoMAQsLIAEgCjYCAEEAIQUgBigCCCELA0AgBSALRkUEQCABIAUgCWotAAAiDEECdGoiDSANKAIAIg1BAWo2AgAgDyANQQF0aiINIAw6AAEgDSAFOgAAIAVBAWohBQwBCwtBACEBIANBADYCqAUgBEF/cyAHaiEJQQEhBQNAIAUgDk9FBEAgCCAFQQJ0IgtqKAIAIQwgAyALaiABNgIAIAwgBSAJanQgAWohASAFQQFqIQUMAQsLIAcgBEEBaiIBIAJrIgRrQQFqIQgDQEEBIQUgBCAIT0UEQANAIAUgDk9FBEAgBUECdCIJIAMgBEE0bGpqIAMgCWooAgAgBHY2AgAgBUEBaiEFDAELCyAEQQFqIQQMAQsLIBIgByAPIAogESADIAIgARBkIAZBAToABSAGIAc6AAYgACAGKAIENgIACyAQIQULIAZBEGokACAFC8ENAQt/IwBB8ABrIgUkAEFsIQkCQCADQQpJDQAgAi8AACEKIAIvAAIhDCACLwAEIQYgBUEIaiAEEA4CQCADIAYgCiAMampBBmoiDUkNACAFLQAKIQcgBUHYAGogAkEGaiICIAoQBiIJEAMNASAFQUBrIAIgCmoiAiAMEAYiCRADDQEgBUEoaiACIAxqIgIgBhAGIgkQAw0BIAVBEGogAiAGaiADIA1rEAYiCRADDQEgACABaiIOQX1qIQ8gBEEEaiEGQQEhCSAAIAFBA2pBAnYiAmoiCiACaiIMIAJqIg0hAyAMIQQgCiECA0AgCSADIA9JcQRAIAYgBUHYAGogBxACQQF0aiIILQAAIQsgBUHYAGogCC0AARABIAAgCzoAACAGIAVBQGsgBxACQQF0aiIILQAAIQsgBUFAayAILQABEAEgAiALOgAAIAYgBUEoaiAHEAJBAXRqIggtAAAhCyAFQShqIAgtAAEQASAEIAs6AAAgBiAFQRBqIAcQAkEBdGoiCC0AACELIAVBEGogCC0AARABIAMgCzoAACAGIAVB2ABqIAcQAkEBdGoiCC0AACELIAVB2ABqIAgtAAEQASAAIAs6AAEgBiAFQUBrIAcQAkEBdGoiCC0AACELIAVBQGsgCC0AARABIAIgCzoAASAGIAVBKGogBxACQQF0aiIILQAAIQsgBUEoaiAILQABEAEgBCALOgABIAYgBUEQaiAHEAJBAXRqIggtAAAhCyAFQRBqIAgtAAEQASADIAs6AAEgA0ECaiEDIARBAmohBCACQQJqIQIgAEECaiEAIAkgBUHYAGoQDUVxIAVBQGsQDUVxIAVBKGoQDUVxIAVBEGoQDUVxIQkMAQsLIAQgDUsgAiAMS3INAEFsIQkgACAKSw0BIApBfWohCQNAIAVB2ABqEAQgACAJT3JFBEAgBiAFQdgAaiAHEAJBAXRqIggtAAAhCyAFQdgAaiAILQABEAEgACALOgAAIAYgBUHYAGogBxACQQF0aiIILQAAIQsgBUHYAGogCC0AARABIAAgCzoAASAAQQJqIQAMAQsLA0AgBUHYAGoQBCAAIApPckUEQCAGIAVB2ABqIAcQAkEBdGoiCS0AACEIIAVB2ABqIAktAAEQASAAIAg6AAAgAEEBaiEADAELCwNAIAAgCkkEQCAGIAVB2ABqIAcQAkEBdGoiCS0AACEIIAVB2ABqIAktAAEQASAAIAg6AAAgAEEBaiEADAELCyAMQX1qIQADQCAFQUBrEAQgAiAAT3JFBEAgBiAFQUBrIAcQAkEBdGoiCi0AACEJIAVBQGsgCi0AARABIAIgCToAACAGIAVBQGsgBxACQQF0aiIKLQAAIQkgBUFAayAKLQABEAEgAiAJOgABIAJBAmohAgwBCwsDQCAFQUBrEAQgAiAMT3JFBEAgBiAFQUBrIAcQAkEBdGoiAC0AACEKIAVBQGsgAC0AARABIAIgCjoAACACQQFqIQIMAQsLA0AgAiAMSQRAIAYgBUFAayAHEAJBAXRqIgAtAAAhCiAFQUBrIAAtAAEQASACIAo6AAAgAkEBaiECDAELCyANQX1qIQADQCAFQShqEAQgBCAAT3JFBEAgBiAFQShqIAcQAkEBdGoiAi0AACEKIAVBKGogAi0AARABIAQgCjoAACAGIAVBKGogBxACQQF0aiICLQAAIQogBUEoaiACLQABEAEgBCAKOgABIARBAmohBAwBCwsDQCAFQShqEAQgBCANT3JFBEAgBiAFQShqIAcQAkEBdGoiAC0AACECIAVBKGogAC0AARABIAQgAjoAACAEQQFqIQQMAQsLA0AgBCANSQRAIAYgBUEoaiAHEAJBAXRqIgAtAAAhAiAFQShqIAAtAAEQASAEIAI6AAAgBEEBaiEEDAELCwNAIAVBEGoQBCADIA9PckUEQCAGIAVBEGogBxACQQF0aiIALQAAIQIgBUEQaiAALQABEAEgAyACOgAAIAYgBUEQaiAHEAJBAXRqIgAtAAAhAiAFQRBqIAAtAAEQASADIAI6AAEgA0ECaiEDDAELCwNAIAVBEGoQBCADIA5PckUEQCAGIAVBEGogBxACQQF0aiIALQAAIQIgBUEQaiAALQABEAEgAyACOgAAIANBAWohAwwBCwsDQCADIA5JBEAgBiAFQRBqIAcQAkEBdGoiAC0AACECIAVBEGogAC0AARABIAMgAjoAACADQQFqIQMMAQsLIAFBbCAFQdgAahAKIAVBQGsQCnEgBUEoahAKcSAFQRBqEApxGyEJDAELQWwhCQsgBUHwAGokACAJC8oCAQR/IwBBIGsiBSQAIAUgBBAOIAUtAAIhByAFQQhqIAIgAxAGIgIQA0UEQCAEQQRqIQIgACABaiIDQX1qIQQDQCAFQQhqEAQgACAET3JFBEAgAiAFQQhqIAcQAkEBdGoiBi0AACEIIAVBCGogBi0AARABIAAgCDoAACACIAVBCGogBxACQQF0aiIGLQAAIQggBUEIaiAGLQABEAEgACAIOgABIABBAmohAAwBCwsDQCAFQQhqEAQgACADT3JFBEAgAiAFQQhqIAcQAkEBdGoiBC0AACEGIAVBCGogBC0AARABIAAgBjoAACAAQQFqIQAMAQsLA0AgACADT0UEQCACIAVBCGogBxACQQF0aiIELQAAIQYgBUEIaiAELQABEAEgACAGOgAAIABBAWohAAwBCwsgAUFsIAVBCGoQChshAgsgBUEgaiQAIAILtgMBCX8jAEEQayIGJAAgBkEANgIMIAZBADYCCEFUIQQCQAJAIANBQGsiDCADIAZBCGogBkEMaiABIAIQMSICEAMNACAGQQRqIAAQDiAGKAIMIgcgBi0ABEEBaksNASAAQQRqIQogBkEAOgAFIAYgBzoABiAAIAYoAgQ2AgAgB0EBaiEJQQEhBANAIAQgCUkEQCADIARBAnRqIgEoAgAhACABIAU2AgAgACAEQX9qdCAFaiEFIARBAWohBAwBCwsgB0EBaiEHQQAhBSAGKAIIIQkDQCAFIAlGDQEgAyAFIAxqLQAAIgRBAnRqIgBBASAEdEEBdSILIAAoAgAiAWoiADYCACAHIARrIQhBACEEAkAgC0EDTQRAA0AgBCALRg0CIAogASAEakEBdGoiACAIOgABIAAgBToAACAEQQFqIQQMAAALAAsDQCABIABPDQEgCiABQQF0aiIEIAg6AAEgBCAFOgAAIAQgCDoAAyAEIAU6AAIgBCAIOgAFIAQgBToABCAEIAg6AAcgBCAFOgAGIAFBBGohAQwAAAsACyAFQQFqIQUMAAALAAsgAiEECyAGQRBqJAAgBAutAQECfwJAQYQgKAIAIABHIAAoAgBBAXYiAyABa0F4aiICQXhxQQhHcgR/IAIFIAMQJ0UNASACQQhqC0EQSQ0AIAAgACgCACICQQFxIAAgAWpBD2pBeHEiASAAa0EBdHI2AgAgASAANgIEIAEgASgCAEEBcSAAIAJBAXZqIAFrIgJBAXRyNgIAQYQgIAEgAkH/////B3FqQQRqQYQgKAIAIABGGyABNgIAIAEQJQsLygIBBX8CQAJAAkAgAEEIIABBCEsbZ0EfcyAAaUEBR2oiAUEESSAAIAF2cg0AIAFBAnRB/B5qKAIAIgJFDQADQCACQXhqIgMoAgBBAXZBeGoiBSAATwRAIAIgBUEIIAVBCEsbZ0Efc0ECdEGAH2oiASgCAEYEQCABIAIoAgQ2AgALDAMLIARBHksNASAEQQFqIQQgAigCBCICDQALC0EAIQMgAUEgTw0BA0AgAUECdEGAH2ooAgAiAkUEQCABQR5LIQIgAUEBaiEBIAJFDQEMAwsLIAIgAkF4aiIDKAIAQQF2QXhqIgFBCCABQQhLG2dBH3NBAnRBgB9qIgEoAgBGBEAgASACKAIENgIACwsgAigCACIBBEAgASACKAIENgIECyACKAIEIgEEQCABIAIoAgA2AgALIAMgAygCAEEBcjYCACADIAAQNwsgAwvhCwINfwV+IwBB8ABrIgckACAHIAAoAvDhASIINgJcIAEgAmohDSAIIAAoAoDiAWohDwJAAkAgBUUEQCABIQQMAQsgACgCxOABIRAgACgCwOABIREgACgCvOABIQ4gAEEBNgKM4QFBACEIA0AgCEEDRwRAIAcgCEECdCICaiAAIAJqQazQAWooAgA2AkQgCEEBaiEIDAELC0FsIQwgB0EYaiADIAQQBhADDQEgB0EsaiAHQRhqIAAoAgAQEyAHQTRqIAdBGGogACgCCBATIAdBPGogB0EYaiAAKAIEEBMgDUFgaiESIAEhBEEAIQwDQCAHKAIwIAcoAixBA3RqKQIAIhRCEIinQf8BcSEIIAcoAkAgBygCPEEDdGopAgAiFUIQiKdB/wFxIQsgBygCOCAHKAI0QQN0aikCACIWQiCIpyEJIBVCIIghFyAUQiCIpyECAkAgFkIQiKdB/wFxIgNBAk8EQAJAIAZFIANBGUlyRQRAIAkgB0EYaiADQSAgBygCHGsiCiAKIANLGyIKEAUgAyAKayIDdGohCSAHQRhqEAQaIANFDQEgB0EYaiADEAUgCWohCQwBCyAHQRhqIAMQBSAJaiEJIAdBGGoQBBoLIAcpAkQhGCAHIAk2AkQgByAYNwNIDAELAkAgA0UEQCACBEAgBygCRCEJDAMLIAcoAkghCQwBCwJAAkAgB0EYakEBEAUgCSACRWpqIgNBA0YEQCAHKAJEQX9qIgMgA0VqIQkMAQsgA0ECdCAHaigCRCIJIAlFaiEJIANBAUYNAQsgByAHKAJINgJMCwsgByAHKAJENgJIIAcgCTYCRAsgF6chAyALBEAgB0EYaiALEAUgA2ohAwsgCCALakEUTwRAIAdBGGoQBBoLIAgEQCAHQRhqIAgQBSACaiECCyAHQRhqEAQaIAcgB0EYaiAUQhiIp0H/AXEQCCAUp0H//wNxajYCLCAHIAdBGGogFUIYiKdB/wFxEAggFadB//8DcWo2AjwgB0EYahAEGiAHIAdBGGogFkIYiKdB/wFxEAggFqdB//8DcWo2AjQgByACNgJgIAcoAlwhCiAHIAk2AmggByADNgJkAkACQAJAIAQgAiADaiILaiASSw0AIAIgCmoiEyAPSw0AIA0gBGsgC0Egak8NAQsgByAHKQNoNwMQIAcgBykDYDcDCCAEIA0gB0EIaiAHQdwAaiAPIA4gESAQEB4hCwwBCyACIARqIQggBCAKEAcgAkERTwRAIARBEGohAgNAIAIgCkEQaiIKEAcgAkEQaiICIAhJDQALCyAIIAlrIQIgByATNgJcIAkgCCAOa0sEQCAJIAggEWtLBEBBbCELDAILIBAgAiAOayICaiIKIANqIBBNBEAgCCAKIAMQDxoMAgsgCCAKQQAgAmsQDyEIIAcgAiADaiIDNgJkIAggAmshCCAOIQILIAlBEE8EQCADIAhqIQMDQCAIIAIQByACQRBqIQIgCEEQaiIIIANJDQALDAELAkAgCUEHTQRAIAggAi0AADoAACAIIAItAAE6AAEgCCACLQACOgACIAggAi0AAzoAAyAIQQRqIAIgCUECdCIDQcAeaigCAGoiAhAXIAIgA0HgHmooAgBrIQIgBygCZCEDDAELIAggAhAMCyADQQlJDQAgAyAIaiEDIAhBCGoiCCACQQhqIgJrQQ9MBEADQCAIIAIQDCACQQhqIQIgCEEIaiIIIANJDQAMAgALAAsDQCAIIAIQByACQRBqIQIgCEEQaiIIIANJDQALCyAHQRhqEAQaIAsgDCALEAMiAhshDCAEIAQgC2ogAhshBCAFQX9qIgUNAAsgDBADDQFBbCEMIAdBGGoQBEECSQ0BQQAhCANAIAhBA0cEQCAAIAhBAnQiAmpBrNABaiACIAdqKAJENgIAIAhBAWohCAwBCwsgBygCXCEIC0G6fyEMIA8gCGsiACANIARrSw0AIAQEfyAEIAggABALIABqBUEACyABayEMCyAHQfAAaiQAIAwLkRcCFn8FfiMAQdABayIHJAAgByAAKALw4QEiCDYCvAEgASACaiESIAggACgCgOIBaiETAkACQCAFRQRAIAEhAwwBCyAAKALE4AEhESAAKALA4AEhFSAAKAK84AEhDyAAQQE2AozhAUEAIQgDQCAIQQNHBEAgByAIQQJ0IgJqIAAgAmpBrNABaigCADYCVCAIQQFqIQgMAQsLIAcgETYCZCAHIA82AmAgByABIA9rNgJoQWwhECAHQShqIAMgBBAGEAMNASAFQQQgBUEESBshFyAHQTxqIAdBKGogACgCABATIAdBxABqIAdBKGogACgCCBATIAdBzABqIAdBKGogACgCBBATQQAhBCAHQeAAaiEMIAdB5ABqIQoDQCAHQShqEARBAksgBCAXTnJFBEAgBygCQCAHKAI8QQN0aikCACIdQhCIp0H/AXEhCyAHKAJQIAcoAkxBA3RqKQIAIh5CEIinQf8BcSEJIAcoAkggBygCREEDdGopAgAiH0IgiKchCCAeQiCIISAgHUIgiKchAgJAIB9CEIinQf8BcSIDQQJPBEACQCAGRSADQRlJckUEQCAIIAdBKGogA0EgIAcoAixrIg0gDSADSxsiDRAFIAMgDWsiA3RqIQggB0EoahAEGiADRQ0BIAdBKGogAxAFIAhqIQgMAQsgB0EoaiADEAUgCGohCCAHQShqEAQaCyAHKQJUISEgByAINgJUIAcgITcDWAwBCwJAIANFBEAgAgRAIAcoAlQhCAwDCyAHKAJYIQgMAQsCQAJAIAdBKGpBARAFIAggAkVqaiIDQQNGBEAgBygCVEF/aiIDIANFaiEIDAELIANBAnQgB2ooAlQiCCAIRWohCCADQQFGDQELIAcgBygCWDYCXAsLIAcgBygCVDYCWCAHIAg2AlQLICCnIQMgCQRAIAdBKGogCRAFIANqIQMLIAkgC2pBFE8EQCAHQShqEAQaCyALBEAgB0EoaiALEAUgAmohAgsgB0EoahAEGiAHIAcoAmggAmoiCSADajYCaCAKIAwgCCAJSxsoAgAhDSAHIAdBKGogHUIYiKdB/wFxEAggHadB//8DcWo2AjwgByAHQShqIB5CGIinQf8BcRAIIB6nQf//A3FqNgJMIAdBKGoQBBogB0EoaiAfQhiIp0H/AXEQCCEOIAdB8ABqIARBBHRqIgsgCSANaiAIazYCDCALIAg2AgggCyADNgIEIAsgAjYCACAHIA4gH6dB//8DcWo2AkQgBEEBaiEEDAELCyAEIBdIDQEgEkFgaiEYIAdB4ABqIRogB0HkAGohGyABIQMDQCAHQShqEARBAksgBCAFTnJFBEAgBygCQCAHKAI8QQN0aikCACIdQhCIp0H/AXEhCyAHKAJQIAcoAkxBA3RqKQIAIh5CEIinQf8BcSEIIAcoAkggBygCREEDdGopAgAiH0IgiKchCSAeQiCIISAgHUIgiKchDAJAIB9CEIinQf8BcSICQQJPBEACQCAGRSACQRlJckUEQCAJIAdBKGogAkEgIAcoAixrIgogCiACSxsiChAFIAIgCmsiAnRqIQkgB0EoahAEGiACRQ0BIAdBKGogAhAFIAlqIQkMAQsgB0EoaiACEAUgCWohCSAHQShqEAQaCyAHKQJUISEgByAJNgJUIAcgITcDWAwBCwJAIAJFBEAgDARAIAcoAlQhCQwDCyAHKAJYIQkMAQsCQAJAIAdBKGpBARAFIAkgDEVqaiICQQNGBEAgBygCVEF/aiICIAJFaiEJDAELIAJBAnQgB2ooAlQiCSAJRWohCSACQQFGDQELIAcgBygCWDYCXAsLIAcgBygCVDYCWCAHIAk2AlQLICCnIRQgCARAIAdBKGogCBAFIBRqIRQLIAggC2pBFE8EQCAHQShqEAQaCyALBEAgB0EoaiALEAUgDGohDAsgB0EoahAEGiAHIAcoAmggDGoiGSAUajYCaCAbIBogCSAZSxsoAgAhHCAHIAdBKGogHUIYiKdB/wFxEAggHadB//8DcWo2AjwgByAHQShqIB5CGIinQf8BcRAIIB6nQf//A3FqNgJMIAdBKGoQBBogByAHQShqIB9CGIinQf8BcRAIIB+nQf//A3FqNgJEIAcgB0HwAGogBEEDcUEEdGoiDSkDCCIdNwPIASAHIA0pAwAiHjcDwAECQAJAAkAgBygCvAEiDiAepyICaiIWIBNLDQAgAyAHKALEASIKIAJqIgtqIBhLDQAgEiADayALQSBqTw0BCyAHIAcpA8gBNwMQIAcgBykDwAE3AwggAyASIAdBCGogB0G8AWogEyAPIBUgERAeIQsMAQsgAiADaiEIIAMgDhAHIAJBEU8EQCADQRBqIQIDQCACIA5BEGoiDhAHIAJBEGoiAiAISQ0ACwsgCCAdpyIOayECIAcgFjYCvAEgDiAIIA9rSwRAIA4gCCAVa0sEQEFsIQsMAgsgESACIA9rIgJqIhYgCmogEU0EQCAIIBYgChAPGgwCCyAIIBZBACACaxAPIQggByACIApqIgo2AsQBIAggAmshCCAPIQILIA5BEE8EQCAIIApqIQoDQCAIIAIQByACQRBqIQIgCEEQaiIIIApJDQALDAELAkAgDkEHTQRAIAggAi0AADoAACAIIAItAAE6AAEgCCACLQACOgACIAggAi0AAzoAAyAIQQRqIAIgDkECdCIKQcAeaigCAGoiAhAXIAIgCkHgHmooAgBrIQIgBygCxAEhCgwBCyAIIAIQDAsgCkEJSQ0AIAggCmohCiAIQQhqIgggAkEIaiICa0EPTARAA0AgCCACEAwgAkEIaiECIAhBCGoiCCAKSQ0ADAIACwALA0AgCCACEAcgAkEQaiECIAhBEGoiCCAKSQ0ACwsgCxADBEAgCyEQDAQFIA0gDDYCACANIBkgHGogCWs2AgwgDSAJNgIIIA0gFDYCBCAEQQFqIQQgAyALaiEDDAILAAsLIAQgBUgNASAEIBdrIQtBACEEA0AgCyAFSARAIAcgB0HwAGogC0EDcUEEdGoiAikDCCIdNwPIASAHIAIpAwAiHjcDwAECQAJAAkAgBygCvAEiDCAepyICaiIKIBNLDQAgAyAHKALEASIJIAJqIhBqIBhLDQAgEiADayAQQSBqTw0BCyAHIAcpA8gBNwMgIAcgBykDwAE3AxggAyASIAdBGGogB0G8AWogEyAPIBUgERAeIRAMAQsgAiADaiEIIAMgDBAHIAJBEU8EQCADQRBqIQIDQCACIAxBEGoiDBAHIAJBEGoiAiAISQ0ACwsgCCAdpyIGayECIAcgCjYCvAEgBiAIIA9rSwRAIAYgCCAVa0sEQEFsIRAMAgsgESACIA9rIgJqIgwgCWogEU0EQCAIIAwgCRAPGgwCCyAIIAxBACACaxAPIQggByACIAlqIgk2AsQBIAggAmshCCAPIQILIAZBEE8EQCAIIAlqIQYDQCAIIAIQByACQRBqIQIgCEEQaiIIIAZJDQALDAELAkAgBkEHTQRAIAggAi0AADoAACAIIAItAAE6AAEgCCACLQACOgACIAggAi0AAzoAAyAIQQRqIAIgBkECdCIGQcAeaigCAGoiAhAXIAIgBkHgHmooAgBrIQIgBygCxAEhCQwBCyAIIAIQDAsgCUEJSQ0AIAggCWohBiAIQQhqIgggAkEIaiICa0EPTARAA0AgCCACEAwgAkEIaiECIAhBCGoiCCAGSQ0ADAIACwALA0AgCCACEAcgAkEQaiECIAhBEGoiCCAGSQ0ACwsgEBADDQMgC0EBaiELIAMgEGohAwwBCwsDQCAEQQNHBEAgACAEQQJ0IgJqQazQAWogAiAHaigCVDYCACAEQQFqIQQMAQsLIAcoArwBIQgLQbp/IRAgEyAIayIAIBIgA2tLDQAgAwR/IAMgCCAAEAsgAGoFQQALIAFrIRALIAdB0AFqJAAgEAslACAAQgA3AgAgAEEAOwEIIABBADoACyAAIAE2AgwgACACOgAKC7QFAQN/IwBBMGsiBCQAIABB/wFqIgVBfWohBgJAIAMvAQIEQCAEQRhqIAEgAhAGIgIQAw0BIARBEGogBEEYaiADEBwgBEEIaiAEQRhqIAMQHCAAIQMDQAJAIARBGGoQBCADIAZPckUEQCADIARBEGogBEEYahASOgAAIAMgBEEIaiAEQRhqEBI6AAEgBEEYahAERQ0BIANBAmohAwsgBUF+aiEFAn8DQEG6fyECIAMiASAFSw0FIAEgBEEQaiAEQRhqEBI6AAAgAUEBaiEDIARBGGoQBEEDRgRAQQIhAiAEQQhqDAILIAMgBUsNBSABIARBCGogBEEYahASOgABIAFBAmohA0EDIQIgBEEYahAEQQNHDQALIARBEGoLIQUgAyAFIARBGGoQEjoAACABIAJqIABrIQIMAwsgAyAEQRBqIARBGGoQEjoAAiADIARBCGogBEEYahASOgADIANBBGohAwwAAAsACyAEQRhqIAEgAhAGIgIQAw0AIARBEGogBEEYaiADEBwgBEEIaiAEQRhqIAMQHCAAIQMDQAJAIARBGGoQBCADIAZPckUEQCADIARBEGogBEEYahAROgAAIAMgBEEIaiAEQRhqEBE6AAEgBEEYahAERQ0BIANBAmohAwsgBUF+aiEFAn8DQEG6fyECIAMiASAFSw0EIAEgBEEQaiAEQRhqEBE6AAAgAUEBaiEDIARBGGoQBEEDRgRAQQIhAiAEQQhqDAILIAMgBUsNBCABIARBCGogBEEYahAROgABIAFBAmohA0EDIQIgBEEYahAEQQNHDQALIARBEGoLIQUgAyAFIARBGGoQEToAACABIAJqIABrIQIMAgsgAyAEQRBqIARBGGoQEToAAiADIARBCGogBEEYahAROgADIANBBGohAwwAAAsACyAEQTBqJAAgAgtpAQF/An8CQAJAIAJBB00NACABKAAAQbfIwuF+Rw0AIAAgASgABDYCmOIBQWIgAEEQaiABIAIQPiIDEAMNAhogAEKBgICAEDcDiOEBIAAgASADaiACIANrECoMAQsgACABIAIQKgtBAAsLrQMBBn8jAEGAAWsiAyQAQWIhCAJAIAJBCUkNACAAQZjQAGogAUEIaiIEIAJBeGogAEGY0AAQMyIFEAMiBg0AIANBHzYCfCADIANB/ABqIANB+ABqIAQgBCAFaiAGGyIEIAEgAmoiAiAEaxAVIgUQAw0AIAMoAnwiBkEfSw0AIAMoAngiB0EJTw0AIABBiCBqIAMgBkGAC0GADCAHEBggA0E0NgJ8IAMgA0H8AGogA0H4AGogBCAFaiIEIAIgBGsQFSIFEAMNACADKAJ8IgZBNEsNACADKAJ4IgdBCk8NACAAQZAwaiADIAZBgA1B4A4gBxAYIANBIzYCfCADIANB/ABqIANB+ABqIAQgBWoiBCACIARrEBUiBRADDQAgAygCfCIGQSNLDQAgAygCeCIHQQpPDQAgACADIAZBwBBB0BEgBxAYIAQgBWoiBEEMaiIFIAJLDQAgAiAFayEFQQAhAgNAIAJBA0cEQCAEKAAAIgZBf2ogBU8NAiAAIAJBAnRqQZzQAWogBjYCACACQQFqIQIgBEEEaiEEDAELCyAEIAFrIQgLIANBgAFqJAAgCAtGAQN/IABBCGohAyAAKAIEIQJBACEAA0AgACACdkUEQCABIAMgAEEDdGotAAJBFktqIQEgAEEBaiEADAELCyABQQggAmt0C4YDAQV/Qbh/IQcCQCADRQ0AIAItAAAiBEUEQCABQQA2AgBBAUG4fyADQQFGGw8LAn8gAkEBaiIFIARBGHRBGHUiBkF/Sg0AGiAGQX9GBEAgA0EDSA0CIAUvAABBgP4BaiEEIAJBA2oMAQsgA0ECSA0BIAItAAEgBEEIdHJBgIB+aiEEIAJBAmoLIQUgASAENgIAIAVBAWoiASACIANqIgNLDQBBbCEHIABBEGogACAFLQAAIgVBBnZBI0EJIAEgAyABa0HAEEHQEUHwEiAAKAKM4QEgACgCnOIBIAQQHyIGEAMiCA0AIABBmCBqIABBCGogBUEEdkEDcUEfQQggASABIAZqIAgbIgEgAyABa0GAC0GADEGAFyAAKAKM4QEgACgCnOIBIAQQHyIGEAMiCA0AIABBoDBqIABBBGogBUECdkEDcUE0QQkgASABIAZqIAgbIgEgAyABa0GADUHgDkGQGSAAKAKM4QEgACgCnOIBIAQQHyIAEAMNACAAIAFqIAJrIQcLIAcLrQMBCn8jAEGABGsiCCQAAn9BUiACQf8BSw0AGkFUIANBDEsNABogAkEBaiELIABBBGohCUGAgAQgA0F/anRBEHUhCkEAIQJBASEEQQEgA3QiB0F/aiIMIQUDQCACIAtGRQRAAkAgASACQQF0Ig1qLwEAIgZB//8DRgRAIAkgBUECdGogAjoAAiAFQX9qIQVBASEGDAELIARBACAKIAZBEHRBEHVKGyEECyAIIA1qIAY7AQAgAkEBaiECDAELCyAAIAQ7AQIgACADOwEAIAdBA3YgB0EBdmpBA2ohBkEAIQRBACECA0AgBCALRkUEQCABIARBAXRqLgEAIQpBACEAA0AgACAKTkUEQCAJIAJBAnRqIAQ6AAIDQCACIAZqIAxxIgIgBUsNAAsgAEEBaiEADAELCyAEQQFqIQQMAQsLQX8gAg0AGkEAIQIDfyACIAdGBH9BAAUgCCAJIAJBAnRqIgAtAAJBAXRqIgEgAS8BACIBQQFqOwEAIAAgAyABEBRrIgU6AAMgACABIAVB/wFxdCAHazsBACACQQFqIQIMAQsLCyEFIAhBgARqJAAgBQvjBgEIf0FsIQcCQCACQQNJDQACQAJAAkACQCABLQAAIgNBA3EiCUEBaw4DAwEAAgsgACgCiOEBDQBBYg8LIAJBBUkNAkEDIQYgASgAACEFAn8CQAJAIANBAnZBA3EiCEF+aiIEQQFNBEAgBEEBaw0BDAILIAVBDnZB/wdxIQQgBUEEdkH/B3EhAyAIRQwCCyAFQRJ2IQRBBCEGIAVBBHZB//8AcSEDQQAMAQsgBUEEdkH//w9xIgNBgIAISw0DIAEtAARBCnQgBUEWdnIhBEEFIQZBAAshBSAEIAZqIgogAksNAgJAIANBgQZJDQAgACgCnOIBRQ0AQQAhAgNAIAJBg4ABSw0BIAJBQGshAgwAAAsACwJ/IAlBA0YEQCABIAZqIQEgAEHw4gFqIQIgACgCDCEGIAUEQCACIAMgASAEIAYQXwwCCyACIAMgASAEIAYQXQwBCyAAQbjQAWohAiABIAZqIQEgAEHw4gFqIQYgAEGo0ABqIQggBQRAIAggBiADIAEgBCACEF4MAQsgCCAGIAMgASAEIAIQXAsQAw0CIAAgAzYCgOIBIABBATYCiOEBIAAgAEHw4gFqNgLw4QEgCUECRgRAIAAgAEGo0ABqNgIMCyAAIANqIgBBiOMBakIANwAAIABBgOMBakIANwAAIABB+OIBakIANwAAIABB8OIBakIANwAAIAoPCwJ/AkACQAJAIANBAnZBA3FBf2oiBEECSw0AIARBAWsOAgACAQtBASEEIANBA3YMAgtBAiEEIAEvAABBBHYMAQtBAyEEIAEQIUEEdgsiAyAEaiIFQSBqIAJLBEAgBSACSw0CIABB8OIBaiABIARqIAMQCyEBIAAgAzYCgOIBIAAgATYC8OEBIAEgA2oiAEIANwAYIABCADcAECAAQgA3AAggAEIANwAAIAUPCyAAIAM2AoDiASAAIAEgBGo2AvDhASAFDwsCfwJAAkACQCADQQJ2QQNxQX9qIgRBAksNACAEQQFrDgIAAgELQQEhByADQQN2DAILQQIhByABLwAAQQR2DAELIAJBBEkgARAhIgJBj4CAAUtyDQFBAyEHIAJBBHYLIQIgAEHw4gFqIAEgB2otAAAgAkEgahAQIQEgACACNgKA4gEgACABNgLw4QEgB0EBaiEHCyAHC0sAIABC+erQ0OfJoeThADcDICAAQgA3AxggAELP1tO+0ser2UI3AxAgAELW64Lu6v2J9eAANwMIIABCADcDACAAQShqQQBBKBAQGgviAgICfwV+IABBKGoiASAAKAJIaiECAn4gACkDACIDQiBaBEAgACkDECIEQgeJIAApAwgiBUIBiXwgACkDGCIGQgyJfCAAKQMgIgdCEol8IAUQGSAEEBkgBhAZIAcQGQwBCyAAKQMYQsXP2bLx5brqJ3wLIAN8IQMDQCABQQhqIgAgAk0EQEIAIAEpAAAQCSADhUIbiUKHla+vmLbem55/fkLj3MqV/M7y9YV/fCEDIAAhAQwBCwsCQCABQQRqIgAgAksEQCABIQAMAQsgASgAAK1Ch5Wvr5i23puef34gA4VCF4lCz9bTvtLHq9lCfkL5893xmfaZqxZ8IQMLA0AgACACSQRAIAAxAABCxc/ZsvHluuonfiADhUILiUKHla+vmLbem55/fiEDIABBAWohAAwBCwsgA0IhiCADhULP1tO+0ser2UJ+IgNCHYggA4VC+fPd8Zn2masWfiIDQiCIIAOFC+8CAgJ/BH4gACAAKQMAIAKtfDcDAAJAAkAgACgCSCIDIAJqIgRBH00EQCABRQ0BIAAgA2pBKGogASACECAgACgCSCACaiEEDAELIAEgAmohAgJ/IAMEQCAAQShqIgQgA2ogAUEgIANrECAgACAAKQMIIAQpAAAQCTcDCCAAIAApAxAgACkAMBAJNwMQIAAgACkDGCAAKQA4EAk3AxggACAAKQMgIABBQGspAAAQCTcDICAAKAJIIQMgAEEANgJIIAEgA2tBIGohAQsgAUEgaiACTQsEQCACQWBqIQMgACkDICEFIAApAxghBiAAKQMQIQcgACkDCCEIA0AgCCABKQAAEAkhCCAHIAEpAAgQCSEHIAYgASkAEBAJIQYgBSABKQAYEAkhBSABQSBqIgEgA00NAAsgACAFNwMgIAAgBjcDGCAAIAc3AxAgACAINwMICyABIAJPDQEgAEEoaiABIAIgAWsiBBAgCyAAIAQ2AkgLCy8BAX8gAEUEQEG2f0EAIAMbDwtBun8hBCADIAFNBH8gACACIAMQEBogAwVBun8LCy8BAX8gAEUEQEG2f0EAIAMbDwtBun8hBCADIAFNBH8gACACIAMQCxogAwVBun8LC6gCAQZ/IwBBEGsiByQAIABB2OABaikDAEKAgIAQViEIQbh/IQUCQCAEQf//B0sNACAAIAMgBBBCIgUQAyIGDQAgACgCnOIBIQkgACAHQQxqIAMgAyAFaiAGGyIKIARBACAFIAYbayIGEEAiAxADBEAgAyEFDAELIAcoAgwhBCABRQRAQbp/IQUgBEEASg0BCyAGIANrIQUgAyAKaiEDAkAgCQRAIABBADYCnOIBDAELAkACQAJAIARBBUgNACAAQdjgAWopAwBCgICACFgNAAwBCyAAQQA2ApziAQwBCyAAKAIIED8hBiAAQQA2ApziASAGQRRPDQELIAAgASACIAMgBSAEIAgQOSEFDAELIAAgASACIAMgBSAEIAgQOiEFCyAHQRBqJAAgBQtnACAAQdDgAWogASACIAAoAuzhARAuIgEQAwRAIAEPC0G4fyECAkAgAQ0AIABB7OABaigCACIBBEBBYCECIAAoApjiASABRw0BC0EAIQIgAEHw4AFqKAIARQ0AIABBkOEBahBDCyACCycBAX8QVyIERQRAQUAPCyAEIAAgASACIAMgBBBLEE8hACAEEFYgAAs/AQF/AkACQAJAIAAoAqDiAUEBaiIBQQJLDQAgAUEBaw4CAAECCyAAEDBBAA8LIABBADYCoOIBCyAAKAKU4gELvAMCB38BfiMAQRBrIgkkAEG4fyEGAkAgBCgCACIIQQVBCSAAKALs4QEiBRtJDQAgAygCACIHQQFBBSAFGyAFEC8iBRADBEAgBSEGDAELIAggBUEDakkNACAAIAcgBRBJIgYQAw0AIAEgAmohCiAAQZDhAWohCyAIIAVrIQIgBSAHaiEHIAEhBQNAIAcgAiAJECwiBhADDQEgAkF9aiICIAZJBEBBuH8hBgwCCyAJKAIAIghBAksEQEFsIQYMAgsgB0EDaiEHAn8CQAJAAkAgCEEBaw4CAgABCyAAIAUgCiAFayAHIAYQSAwCCyAFIAogBWsgByAGEEcMAQsgBSAKIAVrIActAAAgCSgCCBBGCyIIEAMEQCAIIQYMAgsgACgC8OABBEAgCyAFIAgQRQsgAiAGayECIAYgB2ohByAFIAhqIQUgCSgCBEUNAAsgACkD0OABIgxCf1IEQEFsIQYgDCAFIAFrrFINAQsgACgC8OABBEBBaiEGIAJBBEkNASALEEQhDCAHKAAAIAynRw0BIAdBBGohByACQXxqIQILIAMgBzYCACAEIAI2AgAgBSABayEGCyAJQRBqJAAgBgsuACAAECsCf0EAQQAQAw0AGiABRSACRXJFBEBBYiAAIAEgAhA9EAMNARoLQQALCzcAIAEEQCAAIAAoAsTgASABKAIEIAEoAghqRzYCnOIBCyAAECtBABADIAFFckUEQCAAIAEQWwsL0QIBB38jAEEQayIGJAAgBiAENgIIIAYgAzYCDCAFBEAgBSgCBCEKIAUoAgghCQsgASEIAkACQANAIAAoAuzhARAWIQsCQANAIAQgC0kNASADKAAAQXBxQdDUtMIBRgRAIAMgBBAiIgcQAw0EIAQgB2shBCADIAdqIQMMAQsLIAYgAzYCDCAGIAQ2AggCQCAFBEAgACAFEE5BACEHQQAQA0UNAQwFCyAAIAogCRBNIgcQAw0ECyAAIAgQUCAMQQFHQQAgACAIIAIgBkEMaiAGQQhqEEwiByIDa0EAIAMQAxtBCkdyRQRAQbh/IQcMBAsgBxADDQMgAiAHayECIAcgCGohCEEBIQwgBigCDCEDIAYoAgghBAwBCwsgBiADNgIMIAYgBDYCCEG4fyEHIAQNASAIIAFrIQcMAQsgBiADNgIMIAYgBDYCCAsgBkEQaiQAIAcLRgECfyABIAAoArjgASICRwRAIAAgAjYCxOABIAAgATYCuOABIAAoArzgASEDIAAgATYCvOABIAAgASADIAJrajYCwOABCwutAgIEfwF+IwBBQGoiBCQAAkACQCACQQhJDQAgASgAAEFwcUHQ1LTCAUcNACABIAIQIiEBIABCADcDCCAAQQA2AgQgACABNgIADAELIARBGGogASACEC0iAxADBEAgACADEBoMAQsgAwRAIABBuH8QGgwBCyACIAQoAjAiA2shAiABIANqIQMDQAJAIAAgAyACIARBCGoQLCIFEAMEfyAFBSACIAVBA2oiBU8NAUG4fwsQGgwCCyAGQQFqIQYgAiAFayECIAMgBWohAyAEKAIMRQ0ACyAEKAI4BEAgAkEDTQRAIABBuH8QGgwCCyADQQRqIQMLIAQoAighAiAEKQMYIQcgAEEANgIEIAAgAyABazYCACAAIAIgBmytIAcgB0J/URs3AwgLIARBQGskAAslAQF/IwBBEGsiAiQAIAIgACABEFEgAigCACEAIAJBEGokACAAC30BBH8jAEGQBGsiBCQAIARB/wE2AggCQCAEQRBqIARBCGogBEEMaiABIAIQFSIGEAMEQCAGIQUMAQtBVCEFIAQoAgwiB0EGSw0AIAMgBEEQaiAEKAIIIAcQQSIFEAMNACAAIAEgBmogAiAGayADEDwhBQsgBEGQBGokACAFC4cBAgJ/An5BABAWIQMCQANAIAEgA08EQAJAIAAoAABBcHFB0NS0wgFGBEAgACABECIiAhADRQ0BQn4PCyAAIAEQVSIEQn1WDQMgBCAFfCIFIARUIQJCfiEEIAINAyAAIAEQUiICEAMNAwsgASACayEBIAAgAmohAAwBCwtCfiAFIAEbIQQLIAQLPwIBfwF+IwBBMGsiAiQAAn5CfiACQQhqIAAgARAtDQAaQgAgAigCHEEBRg0AGiACKQMICyEDIAJBMGokACADC40BAQJ/IwBBMGsiASQAAkAgAEUNACAAKAKI4gENACABIABB/OEBaigCADYCKCABIAApAvThATcDICAAEDAgACgCqOIBIQIgASABKAIoNgIYIAEgASkDIDcDECACIAFBEGoQGyAAQQA2AqjiASABIAEoAig2AgggASABKQMgNwMAIAAgARAbCyABQTBqJAALKgECfyMAQRBrIgAkACAAQQA2AgggAEIANwMAIAAQWCEBIABBEGokACABC4cBAQN/IwBBEGsiAiQAAkAgACgCAEUgACgCBEVzDQAgAiAAKAIINgIIIAIgACkCADcDAAJ/IAIoAgAiAQRAIAIoAghBqOMJIAERBQAMAQtBqOMJECgLIgFFDQAgASAAKQIANwL04QEgAUH84QFqIAAoAgg2AgAgARBZIAEhAwsgAkEQaiQAIAMLywEBAn8jAEEgayIBJAAgAEGBgIDAADYCtOIBIABBADYCiOIBIABBADYC7OEBIABCADcDkOIBIABBADYCpOMJIABBADYC3OIBIABCADcCzOIBIABBADYCvOIBIABBADYCxOABIABCADcCnOIBIABBpOIBakIANwIAIABBrOIBakEANgIAIAFCADcCECABQgA3AhggASABKQMYNwMIIAEgASkDEDcDACABKAIIQQh2QQFxIQIgAEEANgLg4gEgACACNgKM4gEgAUEgaiQAC3YBA38jAEEwayIBJAAgAARAIAEgAEHE0AFqIgIoAgA2AiggASAAKQK80AE3AyAgACgCACEDIAEgAigCADYCGCABIAApArzQATcDECADIAFBEGoQGyABIAEoAig2AgggASABKQMgNwMAIAAgARAbCyABQTBqJAALzAEBAX8gACABKAK00AE2ApjiASAAIAEoAgQiAjYCwOABIAAgAjYCvOABIAAgAiABKAIIaiICNgK44AEgACACNgLE4AEgASgCuNABBEAgAEKBgICAEDcDiOEBIAAgAUGk0ABqNgIMIAAgAUGUIGo2AgggACABQZwwajYCBCAAIAFBDGo2AgAgAEGs0AFqIAFBqNABaigCADYCACAAQbDQAWogAUGs0AFqKAIANgIAIABBtNABaiABQbDQAWooAgA2AgAPCyAAQgA3A4jhAQs7ACACRQRAQbp/DwsgBEUEQEFsDwsgAiAEEGAEQCAAIAEgAiADIAQgBRBhDwsgACABIAIgAyAEIAUQZQtGAQF/IwBBEGsiBSQAIAVBCGogBBAOAn8gBS0ACQRAIAAgASACIAMgBBAyDAELIAAgASACIAMgBBA0CyEAIAVBEGokACAACzQAIAAgAyAEIAUQNiIFEAMEQCAFDwsgBSAESQR/IAEgAiADIAVqIAQgBWsgABA1BUG4fwsLRgEBfyMAQRBrIgUkACAFQQhqIAQQDgJ/IAUtAAkEQCAAIAEgAiADIAQQYgwBCyAAIAEgAiADIAQQNQshACAFQRBqJAAgAAtZAQF/QQ8hAiABIABJBEAgAUEEdCAAbiECCyAAQQh2IgEgAkEYbCIAQYwIaigCAGwgAEGICGooAgBqIgJBA3YgAmogAEGACGooAgAgAEGECGooAgAgAWxqSQs3ACAAIAMgBCAFQYAQEDMiBRADBEAgBQ8LIAUgBEkEfyABIAIgAyAFaiAEIAVrIAAQMgVBuH8LC78DAQN/IwBBIGsiBSQAIAVBCGogAiADEAYiAhADRQRAIAAgAWoiB0F9aiEGIAUgBBAOIARBBGohAiAFLQACIQMDQEEAIAAgBkkgBUEIahAEGwRAIAAgAiAFQQhqIAMQAkECdGoiBC8BADsAACAFQQhqIAQtAAIQASAAIAQtAANqIgQgAiAFQQhqIAMQAkECdGoiAC8BADsAACAFQQhqIAAtAAIQASAEIAAtAANqIQAMAQUgB0F+aiEEA0AgBUEIahAEIAAgBEtyRQRAIAAgAiAFQQhqIAMQAkECdGoiBi8BADsAACAFQQhqIAYtAAIQASAAIAYtAANqIQAMAQsLA0AgACAES0UEQCAAIAIgBUEIaiADEAJBAnRqIgYvAQA7AAAgBUEIaiAGLQACEAEgACAGLQADaiEADAELCwJAIAAgB08NACAAIAIgBUEIaiADEAIiA0ECdGoiAC0AADoAACAALQADQQFGBEAgBUEIaiAALQACEAEMAQsgBSgCDEEfSw0AIAVBCGogAiADQQJ0ai0AAhABIAUoAgxBIUkNACAFQSA2AgwLIAFBbCAFQQhqEAobIQILCwsgBUEgaiQAIAILkgIBBH8jAEFAaiIJJAAgCSADQTQQCyEDAkAgBEECSA0AIAMgBEECdGooAgAhCSADQTxqIAgQIyADQQE6AD8gAyACOgA+QQAhBCADKAI8IQoDQCAEIAlGDQEgACAEQQJ0aiAKNgEAIARBAWohBAwAAAsAC0EAIQkDQCAGIAlGRQRAIAMgBSAJQQF0aiIKLQABIgtBAnRqIgwoAgAhBCADQTxqIAotAABBCHQgCGpB//8DcRAjIANBAjoAPyADIAcgC2siCiACajoAPiAEQQEgASAKa3RqIQogAygCPCELA0AgACAEQQJ0aiALNgEAIARBAWoiBCAKSQ0ACyAMIAo2AgAgCUEBaiEJDAELCyADQUBrJAALowIBCX8jAEHQAGsiCSQAIAlBEGogBUE0EAsaIAcgBmshDyAHIAFrIRADQAJAIAMgCkcEQEEBIAEgByACIApBAXRqIgYtAAEiDGsiCGsiC3QhDSAGLQAAIQ4gCUEQaiAMQQJ0aiIMKAIAIQYgCyAPTwRAIAAgBkECdGogCyAIIAUgCEE0bGogCCAQaiIIQQEgCEEBShsiCCACIAQgCEECdGooAgAiCEEBdGogAyAIayAHIA4QYyAGIA1qIQgMAgsgCUEMaiAOECMgCUEBOgAPIAkgCDoADiAGIA1qIQggCSgCDCELA0AgBiAITw0CIAAgBkECdGogCzYBACAGQQFqIQYMAAALAAsgCUHQAGokAA8LIAwgCDYCACAKQQFqIQoMAAALAAs0ACAAIAMgBCAFEDYiBRADBEAgBQ8LIAUgBEkEfyABIAIgAyAFaiAEIAVrIAAQNAVBuH8LCyMAIAA/AEEQdGtB//8DakEQdkAAQX9GBEBBAA8LQQAQAEEBCzsBAX8gAgRAA0AgACABIAJBgCAgAkGAIEkbIgMQCyEAIAFBgCBqIQEgAEGAIGohACACIANrIgINAAsLCwYAIAAQAwsLqBUJAEGICAsNAQAAAAEAAAACAAAAAgBBoAgLswYBAAAAAQAAAAIAAAACAAAAJgAAAIIAAAAhBQAASgAAAGcIAAAmAAAAwAEAAIAAAABJBQAASgAAAL4IAAApAAAALAIAAIAAAABJBQAASgAAAL4IAAAvAAAAygIAAIAAAACKBQAASgAAAIQJAAA1AAAAcwMAAIAAAACdBQAASgAAAKAJAAA9AAAAgQMAAIAAAADrBQAASwAAAD4KAABEAAAAngMAAIAAAABNBgAASwAAAKoKAABLAAAAswMAAIAAAADBBgAATQAAAB8NAABNAAAAUwQAAIAAAAAjCAAAUQAAAKYPAABUAAAAmQQAAIAAAABLCQAAVwAAALESAABYAAAA2gQAAIAAAABvCQAAXQAAACMUAABUAAAARQUAAIAAAABUCgAAagAAAIwUAABqAAAArwUAAIAAAAB2CQAAfAAAAE4QAAB8AAAA0gIAAIAAAABjBwAAkQAAAJAHAACSAAAAAAAAAAEAAAABAAAABQAAAA0AAAAdAAAAPQAAAH0AAAD9AAAA/QEAAP0DAAD9BwAA/Q8AAP0fAAD9PwAA/X8AAP3/AAD9/wEA/f8DAP3/BwD9/w8A/f8fAP3/PwD9/38A/f//AP3//wH9//8D/f//B/3//w/9//8f/f//P/3//38AAAAAAQAAAAIAAAADAAAABAAAAAUAAAAGAAAABwAAAAgAAAAJAAAACgAAAAsAAAAMAAAADQAAAA4AAAAPAAAAEAAAABEAAAASAAAAEwAAABQAAAAVAAAAFgAAABcAAAAYAAAAGQAAABoAAAAbAAAAHAAAAB0AAAAeAAAAHwAAAAMAAAAEAAAABQAAAAYAAAAHAAAACAAAAAkAAAAKAAAACwAAAAwAAAANAAAADgAAAA8AAAAQAAAAEQAAABIAAAATAAAAFAAAABUAAAAWAAAAFwAAABgAAAAZAAAAGgAAABsAAAAcAAAAHQAAAB4AAAAfAAAAIAAAACEAAAAiAAAAIwAAACUAAAAnAAAAKQAAACsAAAAvAAAAMwAAADsAAABDAAAAUwAAAGMAAACDAAAAAwEAAAMCAAADBAAAAwgAAAMQAAADIAAAA0AAAAOAAAADAAEAQeAPC1EBAAAAAQAAAAEAAAABAAAAAgAAAAIAAAADAAAAAwAAAAQAAAAEAAAABQAAAAcAAAAIAAAACQAAAAoAAAALAAAADAAAAA0AAAAOAAAADwAAABAAQcQQC4sBAQAAAAIAAAADAAAABAAAAAUAAAAGAAAABwAAAAgAAAAJAAAACgAAAAsAAAAMAAAADQAAAA4AAAAPAAAAEAAAABIAAAAUAAAAFgAAABgAAAAcAAAAIAAAACgAAAAwAAAAQAAAAIAAAAAAAQAAAAIAAAAEAAAACAAAABAAAAAgAAAAQAAAAIAAAAAAAQBBkBIL5gQBAAAAAQAAAAEAAAABAAAAAgAAAAIAAAADAAAAAwAAAAQAAAAGAAAABwAAAAgAAAAJAAAACgAAAAsAAAAMAAAADQAAAA4AAAAPAAAAEAAAAAEAAAAEAAAACAAAAAAAAAABAAEBBgAAAAAAAAQAAAAAEAAABAAAAAAgAAAFAQAAAAAAAAUDAAAAAAAABQQAAAAAAAAFBgAAAAAAAAUHAAAAAAAABQkAAAAAAAAFCgAAAAAAAAUMAAAAAAAABg4AAAAAAAEFEAAAAAAAAQUUAAAAAAABBRYAAAAAAAIFHAAAAAAAAwUgAAAAAAAEBTAAAAAgAAYFQAAAAAAABwWAAAAAAAAIBgABAAAAAAoGAAQAAAAADAYAEAAAIAAABAAAAAAAAAAEAQAAAAAAAAUCAAAAIAAABQQAAAAAAAAFBQAAACAAAAUHAAAAAAAABQgAAAAgAAAFCgAAAAAAAAULAAAAAAAABg0AAAAgAAEFEAAAAAAAAQUSAAAAIAABBRYAAAAAAAIFGAAAACAAAwUgAAAAAAADBSgAAAAAAAYEQAAAABAABgRAAAAAIAAHBYAAAAAAAAkGAAIAAAAACwYACAAAMAAABAAAAAAQAAAEAQAAACAAAAUCAAAAIAAABQMAAAAgAAAFBQAAACAAAAUGAAAAIAAABQgAAAAgAAAFCQAAACAAAAULAAAAIAAABQwAAAAAAAAGDwAAACAAAQUSAAAAIAABBRQAAAAgAAIFGAAAACAAAgUcAAAAIAADBSgAAAAgAAQFMAAAAAAAEAYAAAEAAAAPBgCAAAAAAA4GAEAAAAAADQYAIABBgBcLhwIBAAEBBQAAAAAAAAUAAAAAAAAGBD0AAAAAAAkF/QEAAAAADwX9fwAAAAAVBf3/HwAAAAMFBQAAAAAABwR9AAAAAAAMBf0PAAAAABIF/f8DAAAAFwX9/38AAAAFBR0AAAAAAAgE/QAAAAAADgX9PwAAAAAUBf3/DwAAAAIFAQAAABAABwR9AAAAAAALBf0HAAAAABEF/f8BAAAAFgX9/z8AAAAEBQ0AAAAQAAgE/QAAAAAADQX9HwAAAAATBf3/BwAAAAEFAQAAABAABgQ9AAAAAAAKBf0DAAAAABAF/f8AAAAAHAX9//8PAAAbBf3//wcAABoF/f//AwAAGQX9//8BAAAYBf3//wBBkBkLhgQBAAEBBgAAAAAAAAYDAAAAAAAABAQAAAAgAAAFBQAAAAAAAAUGAAAAAAAABQgAAAAAAAAFCQAAAAAAAAULAAAAAAAABg0AAAAAAAAGEAAAAAAAAAYTAAAAAAAABhYAAAAAAAAGGQAAAAAAAAYcAAAAAAAABh8AAAAAAAAGIgAAAAAAAQYlAAAAAAABBikAAAAAAAIGLwAAAAAAAwY7AAAAAAAEBlMAAAAAAAcGgwAAAAAACQYDAgAAEAAABAQAAAAAAAAEBQAAACAAAAUGAAAAAAAABQcAAAAgAAAFCQAAAAAAAAUKAAAAAAAABgwAAAAAAAAGDwAAAAAAAAYSAAAAAAAABhUAAAAAAAAGGAAAAAAAAAYbAAAAAAAABh4AAAAAAAAGIQAAAAAAAQYjAAAAAAABBicAAAAAAAIGKwAAAAAAAwYzAAAAAAAEBkMAAAAAAAUGYwAAAAAACAYDAQAAIAAABAQAAAAwAAAEBAAAABAAAAQFAAAAIAAABQcAAAAgAAAFCAAAACAAAAUKAAAAIAAABQsAAAAAAAAGDgAAAAAAAAYRAAAAAAAABhQAAAAAAAAGFwAAAAAAAAYaAAAAAAAABh0AAAAAAAAGIAAAAAAAEAYDAAEAAAAPBgOAAAAAAA4GA0AAAAAADQYDIAAAAAAMBgMQAAAAAAsGAwgAAAAACgYDBABBpB0L2QEBAAAAAwAAAAcAAAAPAAAAHwAAAD8AAAB/AAAA/wAAAP8BAAD/AwAA/wcAAP8PAAD/HwAA/z8AAP9/AAD//wAA//8BAP//AwD//wcA//8PAP//HwD//z8A//9/AP///wD///8B////A////wf///8P////H////z////9/AAAAAAEAAAACAAAABAAAAAAAAAACAAAABAAAAAgAAAAAAAAAAQAAAAIAAAABAAAABAAAAAQAAAAEAAAABAAAAAgAAAAIAAAACAAAAAcAAAAIAAAACQAAAAoAAAALAEGgIAsDwBBQ",xM="display-p3",vM="display-p3-linear",nh=new WeakMap;let ih=0,sh;class Ln extends hi{constructor(e){super(e),this.transcoderPath="",this.transcoderBinary=null,this.transcoderPending=null,this.workerPool=new ZI,this.workerSourceURL="",this.workerConfig=null,typeof MSC_TRANSCODER<"u"&&console.warn('THREE.KTX2Loader: Please update to latest "basis_transcoder". "msc_basis_transcoder" is no longer supported in three.js r125+.')}setTranscoderPath(e){return this.transcoderPath=e,this}setWorkerLimit(e){return this.workerPool.setWorkerLimit(e),this}async detectSupportAsync(e){return this.workerConfig={astcSupported:await e.hasFeatureAsync("texture-compression-astc"),astcHDRSupported:!1,etc1Supported:await e.hasFeatureAsync("texture-compression-etc1"),etc2Supported:await e.hasFeatureAsync("texture-compression-etc2"),dxtSupported:await e.hasFeatureAsync("texture-compression-bc"),bptcSupported:await e.hasFeatureAsync("texture-compression-bptc"),pvrtcSupported:await e.hasFeatureAsync("texture-compression-pvrtc")},this}detectSupport(e){return e.isWebGPURenderer===!0?this.workerConfig={astcSupported:e.hasFeature("texture-compression-astc"),astcHDRSupported:!1,etc1Supported:e.hasFeature("texture-compression-etc1"),etc2Supported:e.hasFeature("texture-compression-etc2"),dxtSupported:e.hasFeature("texture-compression-bc"),bptcSupported:e.hasFeature("texture-compression-bptc"),pvrtcSupported:e.hasFeature("texture-compression-pvrtc")}:this.workerConfig={astcSupported:e.extensions.has("WEBGL_compressed_texture_astc"),astcHDRSupported:e.extensions.has("WEBGL_compressed_texture_astc")&&e.extensions.get("WEBGL_compressed_texture_astc").getSupportedProfiles().includes("hdr"),etc1Supported:e.extensions.has("WEBGL_compressed_texture_etc1"),etc2Supported:e.extensions.has("WEBGL_compressed_texture_etc"),dxtSupported:e.extensions.has("WEBGL_compressed_texture_s3tc"),bptcSupported:e.extensions.has("EXT_texture_compression_bptc"),pvrtcSupported:e.extensions.has("WEBGL_compressed_texture_pvrtc")||e.extensions.has("WEBKIT_WEBGL_compressed_texture_pvrtc")},this}init(){if(!this.transcoderPending){const e=new Di(this.manager);e.setPath(this.transcoderPath),e.setWithCredentials(this.withCredentials);const t=e.loadAsync("basis_transcoder.js"),n=new Di(this.manager);n.setPath(this.transcoderPath),n.setResponseType("arraybuffer"),n.setWithCredentials(this.withCredentials);const i=n.loadAsync("basis_transcoder.wasm");this.transcoderPending=Promise.all([t,i]).then(([s,a])=>{const o=Ln.BasisWorker.toString(),c=["/* constants */","let _EngineFormat = "+JSON.stringify(Ln.EngineFormat),"let _EngineType = "+JSON.stringify(Ln.EngineType),"let _TranscoderFormat = "+JSON.stringify(Ln.TranscoderFormat),"let _BasisFormat = "+JSON.stringify(Ln.BasisFormat),"/* basis_transcoder.js */",s,"/* worker */",o.substring(o.indexOf("{")+1,o.lastIndexOf("}"))].join(`
`);this.workerSourceURL=URL.createObjectURL(new Blob([c])),this.transcoderBinary=a,this.workerPool.setWorkerCreator(()=>{const l=new Worker(this.workerSourceURL),u=this.transcoderBinary.slice(0);return l.postMessage({type:"init",config:this.workerConfig,transcoderBinary:u},[u]),l})}),ih>0&&console.warn("THREE.KTX2Loader: Multiple active KTX2 loaders may cause performance issues. Use a single KTX2Loader instance, or call .dispose() on old instances."),ih++}return this.transcoderPending}load(e,t,n,i){if(this.workerConfig===null)throw new Error("THREE.KTX2Loader: Missing initialization with `.detectSupport( renderer )`.");const s=new Di(this.manager);s.setPath(this.path),s.setCrossOrigin(this.crossOrigin),s.setWithCredentials(this.withCredentials),s.setResponseType("arraybuffer"),s.load(e,a=>{this.parse(a,t,i)},n,i)}parse(e,t,n){if(this.workerConfig===null)throw new Error("THREE.KTX2Loader: Missing initialization with `.detectSupport( renderer )`.");if(nh.has(e))return nh.get(e).promise.then(t).catch(n);this._createTexture(e).then(i=>t?t(i):null).catch(n)}_createTextureFrom(e,t){const{type:n,error:i,data:{faces:s,width:a,height:o,format:c,type:l,dfdFlags:u}}=e;if(n==="error")return Promise.reject(i);let h;if(t.faceCount===6)h=new xE(s,c,l);else{const d=s[0].mipmaps;h=t.layerCount>1?new EE(d,a,o,t.layerCount,c,l):new Ps(d,a,o,c,l)}return h.minFilter=s[0].mipmaps.length===1?Ze:hn,h.magFilter=Ze,h.generateMipmaps=!1,h.needsUpdate=!0,h.colorSpace=y0(t),h.premultiplyAlpha=!!(u&tM),h}async _createTexture(e,t={}){const n=_M(new Uint8Array(e)),i=n.vkFormat===Ld&&n.dataFormatDescriptor[0].colorModel===167;if(!(n.vkFormat===rM||i&&!this.workerConfig.astcHDRSupported))return SM(n);const a=t,o=this.init().then(()=>this.workerPool.postMessage({type:"transcode",buffer:e,taskConfig:a},[e])).then(c=>this._createTextureFrom(c.data,n));return nh.set(e,{promise:o}),o}dispose(){this.workerPool.dispose(),this.workerSourceURL&&URL.revokeObjectURL(this.workerSourceURL),ih--}}Ln.BasisFormat={ETC1S:0,UASTC:1,UASTC_HDR:2};Ln.TranscoderFormat={ETC1:0,ETC2:1,BC1:2,BC3:3,BC4:4,BC5:5,BC7_M6_OPAQUE_ONLY:6,BC7_M5:7,PVRTC1_4_RGB:8,PVRTC1_4_RGBA:9,ASTC_4x4:10,ATC_RGB:11,ATC_RGBA_INTERPOLATED_ALPHA:12,RGBA32:13,RGB565:14,BGR565:15,RGBA4444:16,BC6H:22,RGB_HALF:24,RGBA_HALF:25};Ln.EngineFormat={RGBAFormat:xt,RGBA_ASTC_4x4_Format:Ls,RGB_BPTC_UNSIGNED_Format:Pc,RGBA_BPTC_Format:Fs,RGBA_ETC2_EAC_Format:Za,RGBA_PVRTC_4BPPV1_Format:Lc,RGBA_S3TC_DXT5_Format:Ds,RGB_ETC1_Format:Fc,RGB_ETC2_Format:Ja,RGB_PVRTC_4BPPV1_Format:Dc,RGBA_S3TC_DXT1_Format:Bs};Ln.EngineType={UnsignedByteType:It,HalfFloatType:Nt,FloatType:Lt};Ln.BasisWorker=function(){let r,e,t;const n=_EngineFormat,i=_EngineType,s=_TranscoderFormat,a=_BasisFormat;self.addEventListener("message",function(A){const g=A.data;switch(g.type){case"init":r=g.config,o(g.transcoderBinary);break;case"transcode":e.then(()=>{try{const{faces:m,buffers:p,width:E,height:_,hasAlpha:b,format:x,type:I,dfdFlags:M}=c(g.buffer);self.postMessage({type:"transcode",id:g.id,data:{faces:m,width:E,height:_,hasAlpha:b,format:x,type:I,dfdFlags:M}},p)}catch(m){console.error(m),self.postMessage({type:"error",id:g.id,error:m.message})}});break}});function o(A){e=new Promise(g=>{t={wasmBinary:A,onRuntimeInitialized:g},BASIS(t)}).then(()=>{t.initializeBasis(),t.KTX2File===void 0&&console.warn("THREE.KTX2Loader: Please update Basis Universal transcoder.")})}function c(A){const g=new t.KTX2File(new Uint8Array(A));function m(){g.close(),g.delete()}if(!g.isValid())throw m(),new Error("THREE.KTX2Loader:	Invalid or unsupported .ktx2 file");let p;if(g.isUASTC())p=a.UASTC;else if(g.isETC1S())p=a.ETC1S;else if(g.isHDR())p=a.UASTC_HDR;else throw new Error("THREE.KTX2Loader: Unknown Basis encoding");const E=g.getWidth(),_=g.getHeight(),b=g.getLayers()||1,x=g.getLevels(),I=g.getFaces(),M=g.getHasAlpha(),w=g.getDFDFlags(),{transcoderFormat:v,engineFormat:y,engineType:T}=h(p,E,_,M);if(!E||!_||!x)throw m(),new Error("THREE.KTX2Loader:	Invalid texture");if(!g.startTranscoding())throw m(),new Error("THREE.KTX2Loader: .startTranscoding failed");const k=[],U=[];for(let F=0;F<I;F++){const H=[];for(let O=0;O<x;O++){const W=[];let Q,Y;for(let re=0;re<b;re++){const fe=g.getImageLevelInfo(O,re,F);F===0&&O===0&&re===0&&(fe.origWidth%4!==0||fe.origHeight%4!==0)&&console.warn("THREE.KTX2Loader: ETC1S and UASTC textures should use multiple-of-four dimensions."),x>1?(Q=fe.origWidth,Y=fe.origHeight):(Q=fe.width,Y=fe.height);let Be=new Uint8Array(g.getImageTranscodedSizeInBytes(O,re,0,v));const Ge=g.transcodeImage(Be,O,re,F,v,0,-1,-1);if(T===i.HalfFloatType&&(Be=new Uint16Array(Be.buffer,Be.byteOffset,Be.byteLength/Uint16Array.BYTES_PER_ELEMENT)),!Ge)throw m(),new Error("THREE.KTX2Loader: .transcodeImage failed.");W.push(Be)}const Z=f(W);H.push({data:Z,width:Q,height:Y}),U.push(Z.buffer)}k.push({mipmaps:H,width:E,height:_,format:y,type:T})}return m(),{faces:k,buffers:U,width:E,height:_,hasAlpha:M,dfdFlags:w,format:y,type:T}}const l=[{if:"astcSupported",basisFormat:[a.UASTC],transcoderFormat:[s.ASTC_4x4,s.ASTC_4x4],engineFormat:[n.RGBA_ASTC_4x4_Format,n.RGBA_ASTC_4x4_Format],engineType:[i.UnsignedByteType],priorityETC1S:1/0,priorityUASTC:1,needsPowerOfTwo:!1},{if:"bptcSupported",basisFormat:[a.ETC1S,a.UASTC],transcoderFormat:[s.BC7_M5,s.BC7_M5],engineFormat:[n.RGBA_BPTC_Format,n.RGBA_BPTC_Format],engineType:[i.UnsignedByteType],priorityETC1S:3,priorityUASTC:2,needsPowerOfTwo:!1},{if:"dxtSupported",basisFormat:[a.ETC1S,a.UASTC],transcoderFormat:[s.BC1,s.BC3],engineFormat:[n.RGBA_S3TC_DXT1_Format,n.RGBA_S3TC_DXT5_Format],engineType:[i.UnsignedByteType],priorityETC1S:4,priorityUASTC:5,needsPowerOfTwo:!1},{if:"etc2Supported",basisFormat:[a.ETC1S,a.UASTC],transcoderFormat:[s.ETC1,s.ETC2],engineFormat:[n.RGB_ETC2_Format,n.RGBA_ETC2_EAC_Format],engineType:[i.UnsignedByteType],priorityETC1S:1,priorityUASTC:3,needsPowerOfTwo:!1},{if:"etc1Supported",basisFormat:[a.ETC1S,a.UASTC],transcoderFormat:[s.ETC1],engineFormat:[n.RGB_ETC1_Format],engineType:[i.UnsignedByteType],priorityETC1S:2,priorityUASTC:4,needsPowerOfTwo:!1},{if:"pvrtcSupported",basisFormat:[a.ETC1S,a.UASTC],transcoderFormat:[s.PVRTC1_4_RGB,s.PVRTC1_4_RGBA],engineFormat:[n.RGB_PVRTC_4BPPV1_Format,n.RGBA_PVRTC_4BPPV1_Format],engineType:[i.UnsignedByteType],priorityETC1S:5,priorityUASTC:6,needsPowerOfTwo:!0},{if:"bptcSupported",basisFormat:[a.UASTC_HDR],transcoderFormat:[s.BC6H],engineFormat:[n.RGB_BPTC_UNSIGNED_Format],engineType:[i.HalfFloatType],priorityHDR:1,needsPowerOfTwo:!1},{basisFormat:[a.ETC1S,a.UASTC],transcoderFormat:[s.RGBA32,s.RGBA32],engineFormat:[n.RGBAFormat,n.RGBAFormat],engineType:[i.UnsignedByteType,i.UnsignedByteType],priorityETC1S:100,priorityUASTC:100,needsPowerOfTwo:!1},{basisFormat:[a.UASTC_HDR],transcoderFormat:[s.RGBA_HALF],engineFormat:[n.RGBAFormat],engineType:[i.HalfFloatType],priorityHDR:100,needsPowerOfTwo:!1}],u={[a.ETC1S]:l.filter(A=>A.basisFormat.includes(a.ETC1S)).sort((A,g)=>A.priorityUASTC-g.priorityUASTC),[a.UASTC]:l.filter(A=>A.basisFormat.includes(a.UASTC)).sort((A,g)=>A.priorityUASTC-g.priorityUASTC),[a.UASTC_HDR]:l.filter(A=>A.basisFormat.includes(a.UASTC_HDR)).sort((A,g)=>A.priorityHDR-g.priorityHDR)};function h(A,g,m,p){const E=u[A];for(let _=0;_<E.length;_++){const b=E[_];if(b.if&&!r[b.if]||!b.basisFormat.includes(A)||p&&b.transcoderFormat.length<2||b.needsPowerOfTwo&&!(d(g)&&d(m)))continue;const x=b.transcoderFormat[p?1:0],I=b.engineFormat[p?1:0],M=b.engineType[0];return{transcoderFormat:x,engineFormat:I,engineType:M}}throw new Error("THREE.KTX2Loader: Failed to identify transcoding target.")}function d(A){return A<=2?!0:(A&A-1)===0&&A!==0}function f(A){if(A.length===1)return A[0];let g=0;for(let E=0;E<A.length;E++){const _=A[E];g+=_.byteLength}const m=new Uint8Array(g);let p=0;for(let E=0;E<A.length;E++){const _=A[E];m.set(_,p),p+=_.byteLength}return m}};const yM=new Set([xt,ws,Yi]),rh={[b0]:xt,[A0]:xt,[u0]:xt,[d0]:xt,[g0]:ws,[p0]:ws,[l0]:ws,[h0]:ws,[m0]:Yi,[f0]:Yi,[c0]:Yi,[o0]:Yi,[_0]:Ja,[E0]:Za,[Ld]:Ls,[gM]:Ls,[mM]:Ls,[v0]:eo,[x0]:eo,[cM]:Bs,[lM]:Bs,[aM]:Br,[oM]:Br,[uM]:Dr,[hM]:Dr,[fM]:Ds,[dM]:Ds,[AM]:Fs,[pM]:Fs},ah={[b0]:Lt,[A0]:Nt,[u0]:It,[d0]:It,[g0]:Lt,[p0]:Nt,[l0]:It,[h0]:It,[m0]:Lt,[f0]:Nt,[c0]:It,[o0]:It,[_0]:It,[E0]:It,[Ld]:Nt,[v0]:It,[x0]:It};async function SM(r){const{vkFormat:e}=r;if(rh[e]===void 0)throw new Error("THREE.KTX2Loader: Unsupported vkFormat.");let t;r.supercompressionScheme===wp&&(sh||(sh=new Promise(async s=>{const a=new EM;await a.init(),s(a)})),t=await sh);const n=[];for(let s=0;s<r.levels.length;s++){const a=Math.max(1,r.pixelWidth>>s),o=Math.max(1,r.pixelHeight>>s),c=r.pixelDepth?Math.max(1,r.pixelDepth>>s):0,l=r.levels[s];let u;if(r.supercompressionScheme===eM)u=l.levelData;else if(r.supercompressionScheme===wp)u=t.decode(l.levelData,l.uncompressedByteLength);else throw new Error("THREE.KTX2Loader: Unsupported supercompressionScheme.");let h;ah[e]===Lt?h=new Float32Array(u.buffer,u.byteOffset,u.byteLength/Float32Array.BYTES_PER_ELEMENT):ah[e]===Nt?h=new Uint16Array(u.buffer,u.byteOffset,u.byteLength/Uint16Array.BYTES_PER_ELEMENT):h=u,n.push({data:h,width:a,height:o,depth:c})}let i;if(yM.has(rh[e]))i=r.pixelDepth===0?new uo(n[0].data,r.pixelWidth,r.pixelHeight):new yg(n[0].data,r.pixelWidth,r.pixelHeight,r.pixelDepth);else{if(r.pixelDepth>0)throw new Error("THREE.KTX2Loader: Unsupported pixelDepth.");i=new Ps(n,r.pixelWidth,r.pixelHeight),i.minFilter=n.length===1?Ze:hn,i.magFilter=Ze}return i.mipmaps=n,i.type=ah[e],i.format=rh[e],i.colorSpace=y0(r),i.needsUpdate=!0,Promise.resolve(i)}function y0(r){const e=r.dataFormatDescriptor[0];return e.colorPrimaries===iM?e.transferFunction===Tp?mt:gt:e.colorPrimaries===sM?e.transferFunction===Tp?xM:vM:(e.colorPrimaries===nM||console.warn(`THREE.KTX2Loader: Unsupported color primaries, "${e.colorPrimaries}"`),Dn)}/* @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Dp,Lp;const Gn=Symbol("retainerCount"),bi=Symbol("recentlyUsed"),Xo=Symbol("evict"),Aa=Symbol("evictionThreshold"),oh=Symbol("cache");class CM{constructor(e,t=5){this[Dp]=new Map,this[Lp]=[],this[oh]=e,this[Aa]=t}set evictionThreshold(e){this[Aa]=e,this[Xo]()}get evictionThreshold(){return this[Aa]}get cache(){return this[oh]}retainerCount(e){return this[Gn].get(e)||0}reset(){this[Gn].clear(),this[bi]=[]}retain(e){this[Gn].has(e)||this[Gn].set(e,0),this[Gn].set(e,this[Gn].get(e)+1);const t=this[bi].indexOf(e);t!==-1&&this[bi].splice(t,1),this[bi].unshift(e),this[Xo]()}release(e){this[Gn].has(e)&&this[Gn].set(e,Math.max(this[Gn].get(e)-1,0)),this[Xo]()}[(Dp=Gn,Lp=bi,Xo)](){if(!(this[bi].length<this[Aa]))for(let e=this[bi].length-1;e>=this[Aa];--e){const t=this[bi][e];this[Gn].get(t)===0&&(this[oh].delete(t),this[bi].splice(e,1))}}}/* @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const IM=r=>{const e=[],t=new Set;for(const n of r){let i=n,s=0;for(;t.has(i);)i=n+"."+ ++s;t.add(i),e.push(i)}return e},MM=r=>{const e=new Map;for(const t of r.mappings)for(const n of t.variants)e.set(n,{material:null,gltfMaterialIndex:t.material});return e};class wM{constructor(e){this.parser=e,this.name="KHR_materials_variants"}afterRoot(e){const t=this.parser,n=t.json;if(n.extensions===void 0||n.extensions[this.name]===void 0)return null;const s=n.extensions[this.name].variants||[],a=IM(s.map(o=>o.name));for(const o of e.scenes)o.traverse(c=>{const l=c;if(!l.material)return;const u=t.associations.get(l);if(u==null||u.meshes==null||u.primitives==null)return;const A=n.meshes[u.meshes].primitives[u.primitives].extensions;!A||!A[this.name]||(l.userData.variantMaterials=MM(A[this.name]))});return e.userData.variants=a,Promise.resolve()}}/* @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var S0,Fp;vt.DEFAULT_ANISOTROPY=4;const TM=(r,e,t=()=>{})=>{const n=i=>{const s=i.loaded/i.total;t(Math.max(0,Math.min(1,isFinite(s)?s:1)))};return new Promise((i,s)=>{e.load(r,i,n,s)})},RM=r=>new Promise((e,t)=>{const n=document.createElement("script");document.body.appendChild(n),n.onload=e,n.onerror=t,n.async=!0,n.src=r}),_i=new Map,ch=new Map;let Pp;const Up=new mI;let Np;const lh=new Ln;let hh,uh;const Es=Symbol("loader"),Wi=Symbol("evictionPolicy"),Op=Symbol("GLTFInstance");class on extends jn{static setDRACODecoderLocation(e){Pp=e,Up.setDecoderPath(e)}static getDRACODecoderLocation(){return Pp}static setKTX2TranscoderLocation(e){Np=e,lh.setTranscoderPath(e)}static getKTX2TranscoderLocation(){return Np}static setMeshoptDecoderLocation(e){hh!==e&&(hh=e,uh=RM(e).then(()=>vp.ready).then(()=>vp))}static getMeshoptDecoderLocation(){return hh}static initializeKTX2Loader(e){lh.detectSupport(e)}static get cache(){return _i}static clearCache(){_i.forEach((e,t)=>{this.delete(t)}),this[Wi].reset()}static has(e){return _i.has(e)}static async delete(e){if(!this.has(e))return;const t=_i.get(e);ch.delete(e),_i.delete(e),(await t).dispose()}static hasFinishedLoading(e){return!!ch.get(e)}constructor(e){super(),this[Fp]=new bI().register(t=>new wM(t)),this[Op]=e,this[Es].setDRACOLoader(Up),this[Es].setKTX2Loader(lh)}get[(S0=Wi,Fp=Es,Wi)](){return this.constructor[Wi]}async preload(e,t,n=()=>{}){if(this[Es].setWithCredentials(t.withCredentials),this.dispatchEvent({type:"preload",element:t,src:e}),!_i.has(e)){uh!=null&&this[Es].setMeshoptDecoder(await uh);const i=TM(e,this[Es],o=>{n(o*.8)}),s=this[Op],a=i.then(o=>s.prepare(o)).then(o=>(n(.9),new s(o))).catch(o=>(console.error(o),new s));_i.set(e,a)}await _i.get(e),ch.set(e,!0),n&&n(1)}async load(e,t,n=()=>{}){await this.preload(e,t,n);const s=await(await _i.get(e)).clone();return this[Wi].retain(e),s.dispose=()=>{this[Wi].release(e)},s}}on[S0]=new CM(on);class BM extends pt{constructor(e=document.createElement("div")){super(),this.isCSS2DObject=!0,this.element=e,this.element.style.position="absolute",this.element.style.userSelect="none",this.element.setAttribute("draggable",!1),this.center=new ke(.5,.5),this.addEventListener("removed",function(){this.traverse(function(t){t.element instanceof t.element.ownerDocument.defaultView.Element&&t.element.parentNode!==null&&t.element.remove()})})}copy(e,t){return super.copy(e,t),this.element=e.element.cloneNode(!0),this.center=e.center,this}}const ar=new B,kp=new Ne,Qp=new Ne,Gp=new B,Hp=new B;class DM{constructor(e={}){const t=this;let n,i,s,a;const o={objects:new WeakMap},c=e.element!==void 0?e.element:document.createElement("div");c.style.overflow="hidden",this.domElement=c,this.getSize=function(){return{width:n,height:i}},this.render=function(A,g){A.matrixWorldAutoUpdate===!0&&A.updateMatrixWorld(),g.parent===null&&g.matrixWorldAutoUpdate===!0&&g.updateMatrixWorld(),kp.copy(g.matrixWorldInverse),Qp.multiplyMatrices(g.projectionMatrix,kp),u(A,A,g),f(A)},this.setSize=function(A,g){n=A,i=g,s=n/2,a=i/2,c.style.width=A+"px",c.style.height=g+"px"};function l(A){A.isCSS2DObject&&(A.element.style.display="none");for(let g=0,m=A.children.length;g<m;g++)l(A.children[g])}function u(A,g,m){if(A.visible===!1){l(A);return}if(A.isCSS2DObject){ar.setFromMatrixPosition(A.matrixWorld),ar.applyMatrix4(Qp);const p=ar.z>=-1&&ar.z<=1&&A.layers.test(m.layers)===!0,E=A.element;E.style.display=p===!0?"":"none",p===!0&&(A.onBeforeRender(t,g,m),E.style.transform="translate("+-100*A.center.x+"%,"+-100*A.center.y+"%)translate("+(ar.x*s+s)+"px,"+(-ar.y*a+a)+"px)",E.parentNode!==c&&c.appendChild(E),A.onAfterRender(t,g,m));const _={distanceToCameraSquared:h(m,A)};o.objects.set(A,_)}for(let p=0,E=A.children.length;p<E;p++)u(A.children[p],g,m)}function h(A,g){return Gp.setFromMatrixPosition(A.matrixWorld),Hp.setFromMatrixPosition(g.matrixWorld),Gp.distanceToSquared(Hp)}function d(A){const g=[];return A.traverseVisible(function(m){m.isCSS2DObject&&g.push(m)}),g}function f(A){const g=d(A).sort(function(p,E){if(p.renderOrder!==E.renderOrder)return E.renderOrder-p.renderOrder;const _=o.objects.get(p).distanceToCameraSquared,b=o.objects.get(E).distanceToCameraSquared;return _-b}),m=g.length;for(let p=0,E=g.length;p<E;p++)g[p].element.style.zIndex=m-p}}}function $o(r,e,t){let n=t;const i=new B;return r.updateWorldMatrix(!0,!0),r.traverseVisible(s=>{const{geometry:a}=s;if(a!==void 0){const{position:o}=a.attributes;if(o!==void 0)for(let c=0,l=o.count;c<l;c++)s.isMesh?s.getVertexPosition(c,i):i.fromBufferAttribute(o,c),s.isSkinnedMesh||i.applyMatrix4(s.matrixWorld),n=e(n,i)}}),n}const zp={POSITION:["byte","byte normalized","unsigned byte","unsigned byte normalized","short","short normalized","unsigned short","unsigned short normalized"],NORMAL:["byte normalized","short normalized"],TANGENT:["byte normalized","short normalized"],TEXCOORD:["byte","byte normalized","unsigned byte","short","short normalized","unsigned short"]};class Wc{constructor(){this.textureUtils=null,this.pluginCallbacks=[],this.register(function(e){return new zM(e)}),this.register(function(e){return new VM(e)}),this.register(function(e){return new $M(e)}),this.register(function(e){return new jM(e)}),this.register(function(e){return new YM(e)}),this.register(function(e){return new KM(e)}),this.register(function(e){return new WM(e)}),this.register(function(e){return new qM(e)}),this.register(function(e){return new XM(e)}),this.register(function(e){return new JM(e)}),this.register(function(e){return new ZM(e)}),this.register(function(e){return new ew(e)}),this.register(function(e){return new tw(e)}),this.register(function(e){return new nw(e)})}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}setTextureUtils(e){return this.textureUtils=e,this}parse(e,t,n,i){const s=new HM,a=[];for(let o=0,c=this.pluginCallbacks.length;o<c;o++)a.push(this.pluginCallbacks[o](s));s.setPlugins(a),s.setTextureUtils(this.textureUtils),s.writeAsync(e,t,i).catch(n)}parseAsync(e,t){const n=this;return new Promise(function(i,s){n.parse(e,i,s,t)})}}const $e={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,BYTE:5120,UNSIGNED_BYTE:5121,SHORT:5122,UNSIGNED_SHORT:5123,INT:5124,UNSIGNED_INT:5125,FLOAT:5126,ARRAY_BUFFER:34962,ELEMENT_ARRAY_BUFFER:34963,NEAREST:9728,LINEAR:9729,NEAREST_MIPMAP_NEAREST:9984,LINEAR_MIPMAP_NEAREST:9985,NEAREST_MIPMAP_LINEAR:9986,LINEAR_MIPMAP_LINEAR:9987,CLAMP_TO_EDGE:33071,MIRRORED_REPEAT:33648,REPEAT:10497},dh="KHR_mesh_quantization",yn={};yn[Ot]=$e.NEAREST;yn[lo]=$e.NEAREST_MIPMAP_NEAREST;yn[ji]=$e.NEAREST_MIPMAP_LINEAR;yn[Ze]=$e.LINEAR;yn[Rs]=$e.LINEAR_MIPMAP_NEAREST;yn[hn]=$e.LINEAR_MIPMAP_LINEAR;yn[Dt]=$e.CLAMP_TO_EDGE;yn[$n]=$e.REPEAT;yn[Ns]=$e.MIRRORED_REPEAT;const Vp={scale:"scale",position:"translation",quaternion:"rotation",morphTargetInfluences:"weights"},LM=new Me,Wp=12,FM=1179937895,PM=2,qp=8,UM=1313821514,NM=5130562;function Pa(r,e){return r.length===e.length&&r.every(function(t,n){return t===e[n]})}function OM(r){return new TextEncoder().encode(r).buffer}function kM(r){return Pa(r.elements,[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])}function QM(r,e,t){const n={min:new Array(r.itemSize).fill(Number.POSITIVE_INFINITY),max:new Array(r.itemSize).fill(Number.NEGATIVE_INFINITY)};for(let i=e;i<e+t;i++)for(let s=0;s<r.itemSize;s++){let a;r.itemSize>4?a=r.array[i*r.itemSize+s]:(s===0?a=r.getX(i):s===1?a=r.getY(i):s===2?a=r.getZ(i):s===3&&(a=r.getW(i)),r.normalized===!0&&(a=Qc.normalize(a,r.array))),n.min[s]=Math.min(n.min[s],a),n.max[s]=Math.max(n.max[s],a)}return n}function C0(r){return Math.ceil(r/4)*4}function fh(r,e=0){const t=C0(r.byteLength);if(t!==r.byteLength){const n=new Uint8Array(t);if(n.set(new Uint8Array(r)),e!==0)for(let i=r.byteLength;i<t;i++)n[i]=e;return n.buffer}return r}function Xp(){return typeof document>"u"&&typeof OffscreenCanvas<"u"?new OffscreenCanvas(1,1):document.createElement("canvas")}function GM(r,e){if(r.toBlob!==void 0)return new Promise(n=>r.toBlob(n,e));let t;return e==="image/jpeg"?t=.92:e==="image/webp"&&(t=.8),r.convertToBlob({type:e,quality:t})}class HM{constructor(){this.plugins=[],this.options={},this.pending=[],this.buffers=[],this.byteOffset=0,this.buffers=[],this.nodeMap=new Map,this.skins=[],this.extensionsUsed={},this.extensionsRequired={},this.uids=new Map,this.uid=0,this.json={asset:{version:"2.0",generator:"THREE.GLTFExporter r"+Zc}},this.cache={meshes:new Map,attributes:new Map,attributesNormalized:new Map,materials:new Map,textures:new Map,images:new Map},this.textureUtils=null}setPlugins(e){this.plugins=e}setTextureUtils(e){this.textureUtils=e}async writeAsync(e,t,n={}){this.options=Object.assign({binary:!1,trs:!1,onlyVisible:!0,maxTextureSize:1/0,animations:[],includeCustomExtensions:!1},n),this.options.animations.length>0&&(this.options.trs=!0),await this.processInputAsync(e),await Promise.all(this.pending);const i=this,s=i.buffers,a=i.json;n=i.options;const o=i.extensionsUsed,c=i.extensionsRequired,l=new Blob(s,{type:"application/octet-stream"}),u=Object.keys(o),h=Object.keys(c);if(u.length>0&&(a.extensionsUsed=u),h.length>0&&(a.extensionsRequired=h),a.buffers&&a.buffers.length>0&&(a.buffers[0].byteLength=l.size),n.binary===!0){const d=new FileReader;d.readAsArrayBuffer(l),d.onloadend=function(){const f=fh(d.result),A=new DataView(new ArrayBuffer(qp));A.setUint32(0,f.byteLength,!0),A.setUint32(4,NM,!0);const g=fh(OM(JSON.stringify(a)),32),m=new DataView(new ArrayBuffer(qp));m.setUint32(0,g.byteLength,!0),m.setUint32(4,UM,!0);const p=new ArrayBuffer(Wp),E=new DataView(p);E.setUint32(0,FM,!0),E.setUint32(4,PM,!0);const _=Wp+m.byteLength+g.byteLength+A.byteLength+f.byteLength;E.setUint32(8,_,!0);const b=new Blob([p,m,g,A,f],{type:"application/octet-stream"}),x=new FileReader;x.readAsArrayBuffer(b),x.onloadend=function(){t(x.result)}}}else if(a.buffers&&a.buffers.length>0){const d=new FileReader;d.readAsDataURL(l),d.onloadend=function(){const f=d.result;a.buffers[0].uri=f,t(a)}}else t(a)}serializeUserData(e,t){if(Object.keys(e.userData).length===0)return;const n=this.options,i=this.extensionsUsed;try{const s=JSON.parse(JSON.stringify(e.userData));if(n.includeCustomExtensions&&s.gltfExtensions){t.extensions===void 0&&(t.extensions={});for(const a in s.gltfExtensions)t.extensions[a]=s.gltfExtensions[a],i[a]=!0;delete s.gltfExtensions}Object.keys(s).length>0&&(t.extras=s)}catch(s){console.warn("THREE.GLTFExporter: userData of '"+e.name+"' won't be serialized because of JSON.stringify error - "+s.message)}}getUID(e,t=!1){if(this.uids.has(e)===!1){const i=new Map;i.set(!0,this.uid++),i.set(!1,this.uid++),this.uids.set(e,i)}return this.uids.get(e).get(t)}isNormalizedNormalAttribute(e){if(this.cache.attributesNormalized.has(e))return!1;const n=new B;for(let i=0,s=e.count;i<s;i++)if(Math.abs(n.fromBufferAttribute(e,i).length()-1)>5e-4)return!1;return!0}createNormalizedNormalAttribute(e){const t=this.cache;if(t.attributesNormalized.has(e))return t.attributesNormalized.get(e);const n=e.clone(),i=new B;for(let s=0,a=n.count;s<a;s++)i.fromBufferAttribute(n,s),i.x===0&&i.y===0&&i.z===0?i.setX(1):i.normalize(),n.setXYZ(s,i.x,i.y,i.z);return t.attributesNormalized.set(e,n),n}applyTextureTransform(e,t){let n=!1;const i={};(t.offset.x!==0||t.offset.y!==0)&&(i.offset=t.offset.toArray(),n=!0),t.rotation!==0&&(i.rotation=t.rotation,n=!0),(t.repeat.x!==1||t.repeat.y!==1)&&(i.scale=t.repeat.toArray(),n=!0),n&&(e.extensions=e.extensions||{},e.extensions.KHR_texture_transform=i,this.extensionsUsed.KHR_texture_transform=!0)}async buildMetalRoughTextureAsync(e,t){if(e===t)return e;function n(f){return f.colorSpace===mt?function(g){return g<.04045?g*.0773993808:Math.pow(g*.9478672986+.0521327014,2.4)}:function(g){return g}}e instanceof Ps&&(e=await this.decompressTextureAsync(e)),t instanceof Ps&&(t=await this.decompressTextureAsync(t));const i=e?e.image:null,s=t?t.image:null,a=Math.max(i?i.width:0,s?s.width:0),o=Math.max(i?i.height:0,s?s.height:0),c=Xp();c.width=a,c.height=o;const l=c.getContext("2d",{willReadFrequently:!0});l.fillStyle="#00ffff",l.fillRect(0,0,a,o);const u=l.getImageData(0,0,a,o);if(i){l.drawImage(i,0,0,a,o);const f=n(e),A=l.getImageData(0,0,a,o).data;for(let g=2;g<A.length;g+=4)u.data[g]=f(A[g]/256)*256}if(s){l.drawImage(s,0,0,a,o);const f=n(t),A=l.getImageData(0,0,a,o).data;for(let g=1;g<A.length;g+=4)u.data[g]=f(A[g]/256)*256}l.putImageData(u,0,0);const d=(e||t).clone();return d.source=new nl(c),d.colorSpace=Dn,d.channel=(e||t).channel,e&&t&&e.channel!==t.channel&&console.warn("THREE.GLTFExporter: UV channels for metalnessMap and roughnessMap textures must match."),console.warn("THREE.GLTFExporter: Merged metalnessMap and roughnessMap textures."),d}async decompressTextureAsync(e,t=1/0){if(this.textureUtils===null)throw new Error("THREE.GLTFExporter: setTextureUtils() must be called to process compressed textures.");return await this.textureUtils.decompress(e,t)}processBuffer(e){const t=this.json,n=this.buffers;return t.buffers||(t.buffers=[{byteLength:0}]),n.push(e),0}processBufferView(e,t,n,i,s){const a=this.json;a.bufferViews||(a.bufferViews=[]);let o;switch(t){case $e.BYTE:case $e.UNSIGNED_BYTE:o=1;break;case $e.SHORT:case $e.UNSIGNED_SHORT:o=2;break;default:o=4}let c=e.itemSize*o;s===$e.ARRAY_BUFFER&&(c=Math.ceil(c/4)*4);const l=C0(i*c),u=new DataView(new ArrayBuffer(l));let h=0;for(let A=n;A<n+i;A++){for(let g=0;g<e.itemSize;g++){let m;e.itemSize>4?m=e.array[A*e.itemSize+g]:(g===0?m=e.getX(A):g===1?m=e.getY(A):g===2?m=e.getZ(A):g===3&&(m=e.getW(A)),e.normalized===!0&&(m=Qc.normalize(m,e.array))),t===$e.FLOAT?u.setFloat32(h,m,!0):t===$e.INT?u.setInt32(h,m,!0):t===$e.UNSIGNED_INT?u.setUint32(h,m,!0):t===$e.SHORT?u.setInt16(h,m,!0):t===$e.UNSIGNED_SHORT?u.setUint16(h,m,!0):t===$e.BYTE?u.setInt8(h,m):t===$e.UNSIGNED_BYTE&&u.setUint8(h,m),h+=o}h%c!==0&&(h+=c-h%c)}const d={buffer:this.processBuffer(u.buffer),byteOffset:this.byteOffset,byteLength:l};return s!==void 0&&(d.target=s),s===$e.ARRAY_BUFFER&&(d.byteStride=c),this.byteOffset+=l,a.bufferViews.push(d),{id:a.bufferViews.length-1,byteLength:0}}processBufferViewImage(e){const t=this,n=t.json;return n.bufferViews||(n.bufferViews=[]),new Promise(function(i){const s=new FileReader;s.readAsArrayBuffer(e),s.onloadend=function(){const a=fh(s.result),o={buffer:t.processBuffer(a),byteOffset:t.byteOffset,byteLength:a.byteLength};t.byteOffset+=a.byteLength,i(n.bufferViews.push(o)-1)}})}processAccessor(e,t,n,i){const s=this.json,a={1:"SCALAR",2:"VEC2",3:"VEC3",4:"VEC4",9:"MAT3",16:"MAT4"};let o;if(e.array.constructor===Float32Array)o=$e.FLOAT;else if(e.array.constructor===Int32Array)o=$e.INT;else if(e.array.constructor===Uint32Array)o=$e.UNSIGNED_INT;else if(e.array.constructor===Int16Array)o=$e.SHORT;else if(e.array.constructor===Uint16Array)o=$e.UNSIGNED_SHORT;else if(e.array.constructor===Int8Array)o=$e.BYTE;else if(e.array.constructor===Uint8Array)o=$e.UNSIGNED_BYTE;else throw new Error("THREE.GLTFExporter: Unsupported bufferAttribute component type: "+e.array.constructor.name);if(n===void 0&&(n=0),(i===void 0||i===1/0)&&(i=e.count),i===0)return null;const c=QM(e,n,i);let l;t!==void 0&&(l=e===t.index?$e.ELEMENT_ARRAY_BUFFER:$e.ARRAY_BUFFER);const u=this.processBufferView(e,o,n,i,l),h={bufferView:u.id,byteOffset:u.byteOffset,componentType:o,count:i,max:c.max,min:c.min,type:a[e.itemSize]};return e.normalized===!0&&(h.normalized=!0),s.accessors||(s.accessors=[]),s.accessors.push(h)-1}processImage(e,t,n,i="image/png"){if(e!==null){const s=this,a=s.cache,o=s.json,c=s.options,l=s.pending;a.images.has(e)||a.images.set(e,{});const u=a.images.get(e),h=i+":flipY/"+n.toString();if(u[h]!==void 0)return u[h];o.images||(o.images=[]);const d={mimeType:i},f=Xp();f.width=Math.min(e.width,c.maxTextureSize),f.height=Math.min(e.height,c.maxTextureSize);const A=f.getContext("2d",{willReadFrequently:!0});if(n===!0&&(A.translate(0,f.height),A.scale(1,-1)),e.data!==void 0){t!==xt&&console.error("GLTFExporter: Only RGBAFormat is supported.",t),(e.width>c.maxTextureSize||e.height>c.maxTextureSize)&&console.warn("GLTFExporter: Image size is bigger than maxTextureSize",e);const m=new Uint8ClampedArray(e.height*e.width*4);for(let p=0;p<m.length;p+=4)m[p+0]=e.data[p+0],m[p+1]=e.data[p+1],m[p+2]=e.data[p+2],m[p+3]=e.data[p+3];A.putImageData(new ImageData(m,e.width,e.height),0,0)}else if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap||typeof OffscreenCanvas<"u"&&e instanceof OffscreenCanvas)A.drawImage(e,0,0,f.width,f.height);else throw new Error("THREE.GLTFExporter: Invalid image type. Use HTMLImageElement, HTMLCanvasElement, ImageBitmap or OffscreenCanvas.");c.binary===!0?l.push(GM(f,i).then(m=>s.processBufferViewImage(m)).then(m=>{d.bufferView=m})):d.uri=xg.getDataURL(f,i);const g=o.images.push(d)-1;return u[h]=g,g}else throw new Error("THREE.GLTFExporter: No valid image data found. Unable to process texture.")}processSampler(e){const t=this.json;t.samplers||(t.samplers=[]);const n={magFilter:yn[e.magFilter],minFilter:yn[e.minFilter],wrapS:yn[e.wrapS],wrapT:yn[e.wrapT]};return t.samplers.push(n)-1}async processTextureAsync(e){const n=this.options,i=this.cache,s=this.json;if(i.textures.has(e))return i.textures.get(e);s.textures||(s.textures=[]),e instanceof Ps&&(e=await this.decompressTextureAsync(e,n.maxTextureSize));let a=e.userData.mimeType;a==="image/webp"&&(a="image/png");const o={sampler:this.processSampler(e),source:this.processImage(e.image,e.format,e.flipY,a)};e.name&&(o.name=e.name),await this._invokeAllAsync(async function(l){l.writeTexture&&await l.writeTexture(e,o)});const c=s.textures.push(o)-1;return i.textures.set(e,c),c}async processMaterialAsync(e){const t=this.cache,n=this.json;if(t.materials.has(e))return t.materials.get(e);if(e.isShaderMaterial)return console.warn("GLTFExporter: THREE.ShaderMaterial not supported."),null;n.materials||(n.materials=[]);const i={pbrMetallicRoughness:{}};e.isMeshStandardMaterial!==!0&&e.isMeshBasicMaterial!==!0&&console.warn("GLTFExporter: Use MeshStandardMaterial or MeshBasicMaterial for best results.");const s=e.color.toArray().concat([e.opacity]);if(Pa(s,[1,1,1,1])||(i.pbrMetallicRoughness.baseColorFactor=s),e.isMeshStandardMaterial?(i.pbrMetallicRoughness.metallicFactor=e.metalness,i.pbrMetallicRoughness.roughnessFactor=e.roughness):(i.pbrMetallicRoughness.metallicFactor=0,i.pbrMetallicRoughness.roughnessFactor=1),e.metalnessMap||e.roughnessMap){const o=await this.buildMetalRoughTextureAsync(e.metalnessMap,e.roughnessMap),c={index:await this.processTextureAsync(o),texCoord:o.channel};this.applyTextureTransform(c,o),i.pbrMetallicRoughness.metallicRoughnessTexture=c}if(e.map){const o={index:await this.processTextureAsync(e.map),texCoord:e.map.channel};this.applyTextureTransform(o,e.map),i.pbrMetallicRoughness.baseColorTexture=o}if(e.emissive){const o=e.emissive;if(Math.max(o.r,o.g,o.b)>0&&(i.emissiveFactor=e.emissive.toArray()),e.emissiveMap){const l={index:await this.processTextureAsync(e.emissiveMap),texCoord:e.emissiveMap.channel};this.applyTextureTransform(l,e.emissiveMap),i.emissiveTexture=l}}if(e.normalMap){const o={index:await this.processTextureAsync(e.normalMap),texCoord:e.normalMap.channel};e.normalScale&&e.normalScale.x!==1&&(o.scale=e.normalScale.x),this.applyTextureTransform(o,e.normalMap),i.normalTexture=o}if(e.aoMap){const o={index:await this.processTextureAsync(e.aoMap),texCoord:e.aoMap.channel};e.aoMapIntensity!==1&&(o.strength=e.aoMapIntensity),this.applyTextureTransform(o,e.aoMap),i.occlusionTexture=o}e.transparent?i.alphaMode="BLEND":e.alphaTest>0&&(i.alphaMode="MASK",i.alphaCutoff=e.alphaTest),e.side===Wt&&(i.doubleSided=!0),e.name!==""&&(i.name=e.name),this.serializeUserData(e,i),await this._invokeAllAsync(async function(o){o.writeMaterialAsync&&await o.writeMaterialAsync(e,i)});const a=n.materials.push(i)-1;return t.materials.set(e,a),a}async processMeshAsync(e){const t=this.cache,n=this.json,i=[e.geometry.uuid];if(Array.isArray(e.material))for(let b=0,x=e.material.length;b<x;b++)i.push(e.material[b].uuid);else i.push(e.material.uuid);const s=i.join(":");if(t.meshes.has(s))return t.meshes.get(s);const a=e.geometry;let o;e.isLineSegments?o=$e.LINES:e.isLineLoop?o=$e.LINE_LOOP:e.isLine?o=$e.LINE_STRIP:e.isPoints?o=$e.POINTS:o=e.material.wireframe?$e.LINES:$e.TRIANGLES;const c={},l={},u=[],h=[],d={uv:"TEXCOORD_0",uv1:"TEXCOORD_1",uv2:"TEXCOORD_2",uv3:"TEXCOORD_3",color:"COLOR_0",skinWeight:"WEIGHTS_0",skinIndex:"JOINTS_0"},f=a.getAttribute("normal");f!==void 0&&!this.isNormalizedNormalAttribute(f)&&(console.warn("THREE.GLTFExporter: Creating normalized normal attribute from the non-normalized one."),a.setAttribute("normal",this.createNormalizedNormalAttribute(f)));let A=null;for(let b in a.attributes){if(b.slice(0,5)==="morph")continue;const x=a.attributes[b];if(b=d[b]||b.toUpperCase(),/^(POSITION|NORMAL|TANGENT|TEXCOORD_\d+|COLOR_\d+|JOINTS_\d+|WEIGHTS_\d+)$/.test(b)||(b="_"+b),t.attributes.has(this.getUID(x))){l[b]=t.attributes.get(this.getUID(x));continue}A=null;const M=x.array;b==="JOINTS_0"&&!(M instanceof Uint16Array)&&!(M instanceof Uint8Array)?(console.warn('GLTFExporter: Attribute "skinIndex" converted to type UNSIGNED_SHORT.'),A=new yt(new Uint16Array(M),x.itemSize,x.normalized)):(M instanceof Uint32Array||M instanceof Int32Array)&&!b.startsWith("_")&&(console.warn(`GLTFExporter: Attribute "${b}" converted to type FLOAT.`),A=Wc.Utils.toFloat32BufferAttribute(x));const w=this.processAccessor(A||x,a);w!==null&&(b.startsWith("_")||this.detectMeshQuantization(b,x),l[b]=w,t.attributes.set(this.getUID(x),w))}if(f!==void 0&&a.setAttribute("normal",f),Object.keys(l).length===0)return null;if(e.morphTargetInfluences!==void 0&&e.morphTargetInfluences.length>0){const b=[],x=[],I={};if(e.morphTargetDictionary!==void 0)for(const M in e.morphTargetDictionary)I[e.morphTargetDictionary[M]]=M;for(let M=0;M<e.morphTargetInfluences.length;++M){const w={};let v=!1;for(const y in a.morphAttributes){if(y!=="position"&&y!=="normal"){v||(console.warn("GLTFExporter: Only POSITION and NORMAL morph are supported."),v=!0);continue}const T=a.morphAttributes[y][M],k=y.toUpperCase(),U=a.attributes[y];if(t.attributes.has(this.getUID(T,!0))){w[k]=t.attributes.get(this.getUID(T,!0));continue}const F=T.clone();if(!a.morphTargetsRelative)for(let H=0,O=T.count;H<O;H++)for(let W=0;W<T.itemSize;W++)W===0&&F.setX(H,T.getX(H)-U.getX(H)),W===1&&F.setY(H,T.getY(H)-U.getY(H)),W===2&&F.setZ(H,T.getZ(H)-U.getZ(H)),W===3&&F.setW(H,T.getW(H)-U.getW(H));w[k]=this.processAccessor(F,a),t.attributes.set(this.getUID(U,!0),w[k])}h.push(w),b.push(e.morphTargetInfluences[M]),e.morphTargetDictionary!==void 0&&x.push(I[M])}c.weights=b,x.length>0&&(c.extras={},c.extras.targetNames=x)}const g=Array.isArray(e.material);if(g&&a.groups.length===0)return null;let m=!1;if(g&&a.index===null){const b=[];for(let x=0,I=a.attributes.position.count;x<I;x++)b[x]=x;a.setIndex(b),m=!0}const p=g?e.material:[e.material],E=g?a.groups:[{materialIndex:0,start:void 0,count:void 0}];for(let b=0,x=E.length;b<x;b++){const I={mode:o,attributes:l};if(this.serializeUserData(a,I),h.length>0&&(I.targets=h),a.index!==null){let w=this.getUID(a.index);(E[b].start!==void 0||E[b].count!==void 0)&&(w+=":"+E[b].start+":"+E[b].count),t.attributes.has(w)?I.indices=t.attributes.get(w):(I.indices=this.processAccessor(a.index,a,E[b].start,E[b].count),t.attributes.set(w,I.indices)),I.indices===null&&delete I.indices}const M=await this.processMaterialAsync(p[E[b].materialIndex]);M!==null&&(I.material=M),u.push(I)}m===!0&&a.setIndex(null),c.primitives=u,n.meshes||(n.meshes=[]),await this._invokeAllAsync(function(b){b.writeMesh&&b.writeMesh(e,c)});const _=n.meshes.push(c)-1;return t.meshes.set(s,_),_}detectMeshQuantization(e,t){if(this.extensionsUsed[dh])return;let n;switch(t.array.constructor){case Int8Array:n="byte";break;case Uint8Array:n="unsigned byte";break;case Int16Array:n="short";break;case Uint16Array:n="unsigned short";break;default:return}t.normalized&&(n+=" normalized");const i=e.split("_",1)[0];zp[i]&&zp[i].includes(n)&&(this.extensionsUsed[dh]=!0,this.extensionsRequired[dh]=!0)}processCamera(e){const t=this.json;t.cameras||(t.cameras=[]);const n=e.isOrthographicCamera,i={type:n?"orthographic":"perspective"};return n?i.orthographic={xmag:e.right*2,ymag:e.top*2,zfar:e.far<=0?.001:e.far,znear:e.near<0?0:e.near}:i.perspective={aspectRatio:e.aspect,yfov:Qc.degToRad(e.fov),zfar:e.far<=0?.001:e.far,znear:e.near<0?0:e.near},e.name!==""&&(i.name=e.type),t.cameras.push(i)-1}processAnimation(e,t){const n=this.json,i=this.nodeMap;n.animations||(n.animations=[]),e=Wc.Utils.mergeMorphTargetTracks(e.clone(),t);const s=e.tracks,a=[],o=[];for(let c=0;c<s.length;++c){const l=s[c],u=et.parseTrackName(l.name);let h=et.findNode(t,u.nodeName);const d=Vp[u.propertyName];if(u.objectName==="bones"&&(h.isSkinnedMesh===!0?h=h.skeleton.getBoneByName(u.objectIndex):h=void 0),!h||!d){console.warn('THREE.GLTFExporter: Could not export animation track "%s".',l.name);continue}const f=1;let A=l.values.length/l.times.length;d===Vp.morphTargetInfluences&&(A/=h.morphTargetInfluences.length);let g;l.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline===!0?(g="CUBICSPLINE",A/=3):l.getInterpolation()===Hr?g="STEP":g="LINEAR",o.push({input:this.processAccessor(new yt(l.times,f)),output:this.processAccessor(new yt(l.values,A)),interpolation:g}),a.push({sampler:o.length-1,target:{node:i.get(h),path:d}})}return n.animations.push({name:e.name||"clip_"+n.animations.length,samplers:o,channels:a}),n.animations.length-1}processSkin(e){const t=this.json,n=this.nodeMap,i=t.nodes[n.get(e)],s=e.skeleton;if(s===void 0)return null;const a=e.skeleton.bones[0];if(a===void 0)return null;const o=[],c=new Float32Array(s.bones.length*16),l=new Ne;for(let h=0;h<s.bones.length;++h)o.push(n.get(s.bones[h])),l.copy(s.boneInverses[h]),l.multiply(e.bindMatrix).toArray(c,h*16);return t.skins===void 0&&(t.skins=[]),t.skins.push({inverseBindMatrices:this.processAccessor(new yt(c,16)),joints:o,skeleton:n.get(a)}),i.skin=t.skins.length-1}async processNodeAsync(e){const t=this.json,n=this.options,i=this.nodeMap;t.nodes||(t.nodes=[]);const s={};if(n.trs){const o=e.quaternion.toArray(),c=e.position.toArray(),l=e.scale.toArray();Pa(o,[0,0,0,1])||(s.rotation=o),Pa(c,[0,0,0])||(s.translation=c),Pa(l,[1,1,1])||(s.scale=l)}else e.matrixAutoUpdate&&e.updateMatrix(),kM(e.matrix)===!1&&(s.matrix=e.matrix.elements);if(e.name!==""&&(s.name=String(e.name)),this.serializeUserData(e,s),e.isMesh||e.isLine||e.isPoints){const o=await this.processMeshAsync(e);o!==null&&(s.mesh=o)}else e.isCamera&&(s.camera=this.processCamera(e));e.isSkinnedMesh&&this.skins.push(e);const a=t.nodes.push(s)-1;if(i.set(e,a),e.children.length>0){const o=[];for(let c=0,l=e.children.length;c<l;c++){const u=e.children[c];if(u.visible||n.onlyVisible===!1){const h=await this.processNodeAsync(u);h!==null&&o.push(h)}}o.length>0&&(s.children=o)}return await this._invokeAllAsync(function(o){o.writeNode&&o.writeNode(e,s)}),a}async processSceneAsync(e){const t=this.json,n=this.options;t.scenes||(t.scenes=[],t.scene=0);const i={};e.name!==""&&(i.name=e.name),t.scenes.push(i);const s=[];for(let a=0,o=e.children.length;a<o;a++){const c=e.children[a];if(c.visible||n.onlyVisible===!1){const l=await this.processNodeAsync(c);l!==null&&s.push(l)}}s.length>0&&(i.nodes=s),this.serializeUserData(e,i)}async processObjectsAsync(e){const t=new Os;t.name="AuxScene";for(let n=0;n<e.length;n++)t.children.push(e[n]);await this.processSceneAsync(t)}async processInputAsync(e){const t=this.options;e=e instanceof Array?e:[e],await this._invokeAllAsync(function(i){i.beforeParse&&i.beforeParse(e)});const n=[];for(let i=0;i<e.length;i++)e[i]instanceof Os?await this.processSceneAsync(e[i]):n.push(e[i]);n.length>0&&await this.processObjectsAsync(n);for(let i=0;i<this.skins.length;++i)this.processSkin(this.skins[i]);for(let i=0;i<t.animations.length;++i)this.processAnimation(t.animations[i],e[0]);await this._invokeAllAsync(function(i){i.afterParse&&i.afterParse(e)})}async _invokeAllAsync(e){for(let t=0,n=this.plugins.length;t<n;t++)await e(this.plugins[t])}}class zM{constructor(e){this.writer=e,this.name="KHR_lights_punctual"}writeNode(e,t){if(!e.isLight)return;if(!e.isDirectionalLight&&!e.isPointLight&&!e.isSpotLight){console.warn("THREE.GLTFExporter: Only directional, point, and spot lights are supported.",e);return}const n=this.writer,i=n.json,s=n.extensionsUsed,a={};e.name&&(a.name=e.name),a.color=e.color.toArray(),a.intensity=e.intensity,e.isDirectionalLight?a.type="directional":e.isPointLight?(a.type="point",e.distance>0&&(a.range=e.distance)):e.isSpotLight&&(a.type="spot",e.distance>0&&(a.range=e.distance),a.spot={},a.spot.innerConeAngle=(1-e.penumbra)*e.angle,a.spot.outerConeAngle=e.angle),e.decay!==void 0&&e.decay!==2&&console.warn("THREE.GLTFExporter: Light decay may be lost. glTF is physically-based, and expects light.decay=2."),e.target&&(e.target.parent!==e||e.target.position.x!==0||e.target.position.y!==0||e.target.position.z!==-1)&&console.warn("THREE.GLTFExporter: Light direction may be lost. For best results, make light.target a child of the light with position 0,0,-1."),s[this.name]||(i.extensions=i.extensions||{},i.extensions[this.name]={lights:[]},s[this.name]=!0);const o=i.extensions[this.name].lights;o.push(a),t.extensions=t.extensions||{},t.extensions[this.name]={light:o.length-1}}}class VM{constructor(e){this.writer=e,this.name="KHR_materials_unlit"}async writeMaterialAsync(e,t){if(!e.isMeshBasicMaterial)return;const i=this.writer.extensionsUsed;t.extensions=t.extensions||{},t.extensions[this.name]={},i[this.name]=!0,t.pbrMetallicRoughness.metallicFactor=0,t.pbrMetallicRoughness.roughnessFactor=.9}}class WM{constructor(e){this.writer=e,this.name="KHR_materials_clearcoat"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.clearcoat===0)return;const n=this.writer,i=n.extensionsUsed,s={};if(s.clearcoatFactor=e.clearcoat,e.clearcoatMap){const a={index:await n.processTextureAsync(e.clearcoatMap),texCoord:e.clearcoatMap.channel};n.applyTextureTransform(a,e.clearcoatMap),s.clearcoatTexture=a}if(s.clearcoatRoughnessFactor=e.clearcoatRoughness,e.clearcoatRoughnessMap){const a={index:await n.processTextureAsync(e.clearcoatRoughnessMap),texCoord:e.clearcoatRoughnessMap.channel};n.applyTextureTransform(a,e.clearcoatRoughnessMap),s.clearcoatRoughnessTexture=a}if(e.clearcoatNormalMap){const a={index:await n.processTextureAsync(e.clearcoatNormalMap),texCoord:e.clearcoatNormalMap.channel};e.clearcoatNormalScale.x!==1&&(a.scale=e.clearcoatNormalScale.x),n.applyTextureTransform(a,e.clearcoatNormalMap),s.clearcoatNormalTexture=a}t.extensions=t.extensions||{},t.extensions[this.name]=s,i[this.name]=!0}}class qM{constructor(e){this.writer=e,this.name="KHR_materials_dispersion"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.dispersion===0)return;const i=this.writer.extensionsUsed,s={};s.dispersion=e.dispersion,t.extensions=t.extensions||{},t.extensions[this.name]=s,i[this.name]=!0}}class XM{constructor(e){this.writer=e,this.name="KHR_materials_iridescence"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.iridescence===0)return;const n=this.writer,i=n.extensionsUsed,s={};if(s.iridescenceFactor=e.iridescence,e.iridescenceMap){const a={index:await n.processTextureAsync(e.iridescenceMap),texCoord:e.iridescenceMap.channel};n.applyTextureTransform(a,e.iridescenceMap),s.iridescenceTexture=a}if(s.iridescenceIor=e.iridescenceIOR,s.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],s.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1],e.iridescenceThicknessMap){const a={index:await n.processTextureAsync(e.iridescenceThicknessMap),texCoord:e.iridescenceThicknessMap.channel};n.applyTextureTransform(a,e.iridescenceThicknessMap),s.iridescenceThicknessTexture=a}t.extensions=t.extensions||{},t.extensions[this.name]=s,i[this.name]=!0}}class $M{constructor(e){this.writer=e,this.name="KHR_materials_transmission"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.transmission===0)return;const n=this.writer,i=n.extensionsUsed,s={};if(s.transmissionFactor=e.transmission,e.transmissionMap){const a={index:await n.processTextureAsync(e.transmissionMap),texCoord:e.transmissionMap.channel};n.applyTextureTransform(a,e.transmissionMap),s.transmissionTexture=a}t.extensions=t.extensions||{},t.extensions[this.name]=s,i[this.name]=!0}}class jM{constructor(e){this.writer=e,this.name="KHR_materials_volume"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.transmission===0)return;const n=this.writer,i=n.extensionsUsed,s={};if(s.thicknessFactor=e.thickness,e.thicknessMap){const a={index:await n.processTextureAsync(e.thicknessMap),texCoord:e.thicknessMap.channel};n.applyTextureTransform(a,e.thicknessMap),s.thicknessTexture=a}e.attenuationDistance!==1/0&&(s.attenuationDistance=e.attenuationDistance),s.attenuationColor=e.attenuationColor.toArray(),t.extensions=t.extensions||{},t.extensions[this.name]=s,i[this.name]=!0}}class YM{constructor(e){this.writer=e,this.name="KHR_materials_ior"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.ior===1.5)return;const i=this.writer.extensionsUsed,s={};s.ior=e.ior,t.extensions=t.extensions||{},t.extensions[this.name]=s,i[this.name]=!0}}class KM{constructor(e){this.writer=e,this.name="KHR_materials_specular"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.specularIntensity===1&&e.specularColor.equals(LM)&&!e.specularIntensityMap&&!e.specularColorMap)return;const n=this.writer,i=n.extensionsUsed,s={};if(e.specularIntensityMap){const a={index:await n.processTextureAsync(e.specularIntensityMap),texCoord:e.specularIntensityMap.channel};n.applyTextureTransform(a,e.specularIntensityMap),s.specularTexture=a}if(e.specularColorMap){const a={index:await n.processTextureAsync(e.specularColorMap),texCoord:e.specularColorMap.channel};n.applyTextureTransform(a,e.specularColorMap),s.specularColorTexture=a}s.specularFactor=e.specularIntensity,s.specularColorFactor=e.specularColor.toArray(),t.extensions=t.extensions||{},t.extensions[this.name]=s,i[this.name]=!0}}class JM{constructor(e){this.writer=e,this.name="KHR_materials_sheen"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.sheen==0)return;const n=this.writer,i=n.extensionsUsed,s={};if(e.sheenRoughnessMap){const a={index:await n.processTextureAsync(e.sheenRoughnessMap),texCoord:e.sheenRoughnessMap.channel};n.applyTextureTransform(a,e.sheenRoughnessMap),s.sheenRoughnessTexture=a}if(e.sheenColorMap){const a={index:await n.processTextureAsync(e.sheenColorMap),texCoord:e.sheenColorMap.channel};n.applyTextureTransform(a,e.sheenColorMap),s.sheenColorTexture=a}s.sheenRoughnessFactor=e.sheenRoughness,s.sheenColorFactor=e.sheenColor.toArray(),t.extensions=t.extensions||{},t.extensions[this.name]=s,i[this.name]=!0}}class ZM{constructor(e){this.writer=e,this.name="KHR_materials_anisotropy"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.anisotropy==0)return;const n=this.writer,i=n.extensionsUsed,s={};if(e.anisotropyMap){const a={index:await n.processTextureAsync(e.anisotropyMap)};n.applyTextureTransform(a,e.anisotropyMap),s.anisotropyTexture=a}s.anisotropyStrength=e.anisotropy,s.anisotropyRotation=e.anisotropyRotation,t.extensions=t.extensions||{},t.extensions[this.name]=s,i[this.name]=!0}}class ew{constructor(e){this.writer=e,this.name="KHR_materials_emissive_strength"}async writeMaterialAsync(e,t){if(!e.isMeshStandardMaterial||e.emissiveIntensity===1)return;const i=this.writer.extensionsUsed,s={};s.emissiveStrength=e.emissiveIntensity,t.extensions=t.extensions||{},t.extensions[this.name]=s,i[this.name]=!0}}class tw{constructor(e){this.writer=e,this.name="EXT_materials_bump"}async writeMaterialAsync(e,t){if(!e.isMeshStandardMaterial||e.bumpScale===1&&!e.bumpMap)return;const n=this.writer,i=n.extensionsUsed,s={};if(e.bumpMap){const a={index:await n.processTextureAsync(e.bumpMap),texCoord:e.bumpMap.channel};n.applyTextureTransform(a,e.bumpMap),s.bumpTexture=a}s.bumpFactor=e.bumpScale,t.extensions=t.extensions||{},t.extensions[this.name]=s,i[this.name]=!0}}class nw{constructor(e){this.writer=e,this.name="EXT_mesh_gpu_instancing"}writeNode(e,t){if(!e.isInstancedMesh)return;const n=this.writer,i=e,s=new Float32Array(i.count*3),a=new Float32Array(i.count*4),o=new Float32Array(i.count*3),c=new Ne,l=new B,u=new un,h=new B;for(let f=0;f<i.count;f++)i.getMatrixAt(f,c),c.decompose(l,u,h),l.toArray(s,f*3),u.toArray(a,f*4),h.toArray(o,f*3);const d={TRANSLATION:n.processAccessor(new yt(s,3)),ROTATION:n.processAccessor(new yt(a,4)),SCALE:n.processAccessor(new yt(o,3))};i.instanceColor&&(d._COLOR_0=n.processAccessor(i.instanceColor)),t.extensions=t.extensions||{},t.extensions[this.name]={attributes:d},n.extensionsUsed[this.name]=!0,n.extensionsRequired[this.name]=!0}}Wc.Utils={insertKeyframe:function(r,e){const n=r.getValueSize(),i=new r.TimeBufferType(r.times.length+1),s=new r.ValueBufferType(r.values.length+n),a=r.createInterpolant(new r.ValueBufferType(n));let o;if(r.times.length===0){i[0]=e;for(let c=0;c<n;c++)s[c]=0;o=0}else if(e<r.times[0]){if(Math.abs(r.times[0]-e)<.001)return 0;i[0]=e,i.set(r.times,1),s.set(a.evaluate(e),0),s.set(r.values,n),o=0}else if(e>r.times[r.times.length-1]){if(Math.abs(r.times[r.times.length-1]-e)<.001)return r.times.length-1;i[i.length-1]=e,i.set(r.times,0),s.set(r.values,0),s.set(a.evaluate(e),r.values.length),o=i.length-1}else for(let c=0;c<r.times.length;c++){if(Math.abs(r.times[c]-e)<.001)return c;if(r.times[c]<e&&r.times[c+1]>e){i.set(r.times.slice(0,c+1),0),i[c+1]=e,i.set(r.times.slice(c+1),c+2),s.set(r.values.slice(0,(c+1)*n),0),s.set(a.evaluate(e),(c+1)*n),s.set(r.values.slice((c+1)*n),(c+2)*n),o=c+1;break}}return r.times=i,r.values=s,o},mergeMorphTargetTracks:function(r,e){const t=[],n={},i=r.tracks;for(let s=0;s<i.length;++s){let a=i[s];const o=et.parseTrackName(a.name),c=et.findNode(e,o.nodeName);if(o.propertyName!=="morphTargetInfluences"||o.propertyIndex===void 0){t.push(a);continue}if(a.createInterpolant!==a.InterpolantFactoryMethodDiscrete&&a.createInterpolant!==a.InterpolantFactoryMethodLinear){if(a.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline)throw new Error("THREE.GLTFExporter: Cannot merge tracks with glTF CUBICSPLINE interpolation.");console.warn("THREE.GLTFExporter: Morph target interpolation mode not yet supported. Using LINEAR instead."),a=a.clone(),a.setInterpolation(zr)}const l=c.morphTargetInfluences.length,u=c.morphTargetDictionary[o.propertyIndex];if(u===void 0)throw new Error("THREE.GLTFExporter: Morph target name not found: "+o.propertyIndex);let h;if(n[c.uuid]===void 0){h=a.clone();const f=new h.ValueBufferType(l*h.times.length);for(let A=0;A<h.times.length;A++)f[A*l+u]=h.values[A];h.name=(o.nodeName||"")+".morphTargetInfluences",h.values=f,n[c.uuid]=h,t.push(h);continue}const d=a.createInterpolant(new a.ValueBufferType(1));h=n[c.uuid];for(let f=0;f<h.times.length;f++)h.values[f*l+u]=d.evaluate(h.times[f]);for(let f=0;f<a.times.length;f++){const A=this.insertKeyframe(h,a.times[f]);h.values[A*l+u]=a.values[f]}}return r.tracks=t,r},toFloat32BufferAttribute:function(r){const e=new yt(new Float32Array(r.count*r.itemSize),r.itemSize,!1);if(!r.normalized&&!r.isInterleavedBufferAttribute)return e.array.set(r.array),e;for(let t=0,n=r.count;t<n;t++)for(let i=0;i<r.itemSize;i++)e.setComponent(t,i,r.getComponent(t,i));return e}};/* @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $p=r=>r.material!==void 0&&r.userData&&r.userData.variantMaterials&&!!Array.from(r.userData.variantMaterials.values()).filter(e=>Sc(e.material)),Sc=r=>r&&r.isMaterial&&!Array.isArray(r);class iw{constructor(e){this.writer=e,this.name="KHR_materials_variants",this.variantNames=[]}beforeParse(e){const t=new Set,n=i=>{if(!$p(i))return;const s=i.userData.variantMaterials,a=i.userData.variantData;for(const[o,c]of a){const l=s.get(c.index);l&&Sc(l.material)&&t.add(o)}};if(Array.isArray(e))for(const i of e)i.traverse(n);else e.traverse(n);t.forEach(i=>this.variantNames.push(i))}async writeMesh(e,t){if(!$p(e))return;const n=e.userData,i=n.variantMaterials,s=n.variantData,a=new Map,o=new Map,c=Array.from(s.values()).sort((h,d)=>h.index-d.index);for(const[h,d]of c.entries())o.set(d.index,h);for(const h of s.values()){const d=i.get(h.index);if(!d||!Sc(d.material))continue;const f=await this.writer.processMaterialAsync(d.material);a.has(f)||a.set(f,{material:f,variants:[]}),a.get(f).variants.push(o.get(h.index))}const l=Array.from(a.values()).map(h=>h.variants.sort((d,f)=>d-f)&&h).sort((h,d)=>h.material-d.material);if(l.length===0)return;const u=Sc(n.originalMaterial)?await this.writer.processMaterialAsync(n.originalMaterial):-1;for(const h of t.primitives)u>=0&&(h.material=u),h.extensions=h.extensions||{},h.extensions[this.name]={mappings:l}}afterParse(){if(this.variantNames.length===0)return;const e=this.writer.json;e.extensions=e.extensions||{};const t=this.variantNames.map(n=>({name:n}));e.extensions[this.name]={variants:t},this.writer.extensionsUsed[this.name]=!0}}class sw{constructor(e,t,n,i,s){this.xrLight=e,this.renderer=t,this.lightProbe=n,this.xrWebGLBinding=null,this.estimationStartCallback=s,this.frameCallback=this.onXRFrame.bind(this);const a=t.xr.getSession();if(i&&"XRWebGLBinding"in window){const o=new vd(16);e.environment=o.texture;const c=t.getContext();switch(a.preferredReflectionFormat){case"srgba8":c.getExtension("EXT_sRGB");break;case"rgba16f":c.getExtension("OES_texture_half_float");break}this.xrWebGLBinding=new XRWebGLBinding(a,c),this.lightProbe.addEventListener("reflectionchange",()=>{this.updateReflection()})}a.requestAnimationFrame(this.frameCallback)}updateReflection(){const e=this.renderer.properties.get(this.xrLight.environment);if(e){const t=this.xrWebGLBinding.getReflectionCubeMap(this.lightProbe);t&&(e.__webglTexture=t,this.xrLight.environment.needsPMREMUpdate=!0)}}onXRFrame(e,t){if(!this.xrLight)return;t.session.requestAnimationFrame(this.frameCallback);const i=t.getLightEstimate(this.lightProbe);if(i){this.xrLight.lightProbe.sh.fromArray(i.sphericalHarmonicsCoefficients),this.xrLight.lightProbe.intensity=1;const s=Math.max(1,Math.max(i.primaryLightIntensity.x,Math.max(i.primaryLightIntensity.y,i.primaryLightIntensity.z)));this.xrLight.directionalLight.color.setRGB(i.primaryLightIntensity.x/s,i.primaryLightIntensity.y/s,i.primaryLightIntensity.z/s),this.xrLight.directionalLight.intensity=s,this.xrLight.directionalLight.position.copy(i.primaryLightDirection),this.estimationStartCallback&&(this.estimationStartCallback(),this.estimationStartCallback=null)}}dispose(){this.xrLight=null,this.renderer=null,this.lightProbe=null,this.xrWebGLBinding=null}}class rw extends Ki{constructor(e,t=!0){super(),this.lightProbe=new QE,this.lightProbe.intensity=0,this.add(this.lightProbe),this.directionalLight=new Gg,this.directionalLight.intensity=0,this.add(this.directionalLight),this.environment=null;let n=null,i=!1;e.xr.addEventListener("sessionstart",()=>{const s=e.xr.getSession();"requestLightProbe"in s&&s.requestLightProbe({reflectionFormat:s.preferredReflectionFormat}).then(a=>{n=new sw(this,e,a,t,()=>{i=!0,this.dispatchEvent({type:"estimationstart"})})})}),e.xr.addEventListener("sessionend",()=>{n&&(n.dispose(),n=null),i&&this.dispatchEvent({type:"estimationend"})}),this.dispose=()=>{n&&(n.dispose(),n=null),this.remove(this.lightProbe),this.lightProbe=null,this.remove(this.directionalLight),this.directionalLight=null,this.environment=null}}}/* @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const I0=1e4,aw=.001,M0=50;class cn{constructor(e=M0){this.velocity=0,this.naturalFrequency=0,this.setDecayTime(e)}setDecayTime(e){this.naturalFrequency=1/Math.max(aw,e)}update(e,t,n,i){const s=2e-4*this.naturalFrequency;if(e==null||i===0||e===t&&this.velocity===0)return t;if(n<0)return e;const a=e-t,o=this.velocity+this.naturalFrequency*a,c=a+n*o,l=Math.exp(-this.naturalFrequency*n),u=(o-this.naturalFrequency*c)*l,h=-this.naturalFrequency*(u+o*l);return Math.abs(u)<s*Math.abs(i)&&h*a>=0?(this.velocity=0,t):(this.velocity=u,t+c*l)}}/* @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ti=.2,jp=.03,ow=.75,w0=12,cw=Math.PI/(2*w0),Yp=new ke,jo=(r,e,t)=>{let n=e>0?t>0?0:-Math.PI/2:t>0?Math.PI/2:Math.PI;for(let i=0;i<=w0;++i)r.push(e+(ti-jp)*Math.cos(n),t+(ti-jp)*Math.sin(n),0,e+ti*Math.cos(n),t+ti*Math.sin(n),0),n+=cw};class Kp extends dt{constructor(e,t){const n=new An,i=[],s=[],{size:a,boundingBox:o}=e,c=a.x/2,l=(t==="back"?a.y:a.z)/2;jo(s,c,l),jo(s,-c,l),jo(s,-c,-l),jo(s,c,-l);const u=s.length/3;for(let f=0;f<u-2;f+=2)i.push(f,f+1,f+3,f,f+3,f+2);const h=u-2;i.push(h,h+1,1,h,1,0),n.setAttribute("position",new Cn(s,3)),n.setIndex(i),super(n),this.side=t;const d=this.material;switch(d.side=Wt,d.transparent=!0,d.opacity=0,this.goalOpacity=0,this.opacityDamper=new cn,this.hitPlane=new dt(new Fi(2*(c+ti),2*(l+ti))),this.hitPlane.visible=!1,this.hitPlane.material.side=Wt,this.add(this.hitPlane),this.hitBox=new dt(new Li(a.x+2*ti,a.y+ti,a.z+2*ti)),this.hitBox.visible=!1,this.hitBox.material.side=Wt,this.add(this.hitBox),o.getCenter(this.position),t){case"bottom":this.rotateX(-Math.PI/2),this.shadowHeight=o.min.y,this.position.y=this.shadowHeight;break;case"back":this.shadowHeight=o.min.z,this.position.z=this.shadowHeight}e.target.add(this),this.hitBox.position.y=(a.y+ti)/2+o.min.y,e.target.add(this.hitBox),this.offsetHeight=0}getHit(e,t,n){Yp.set(t,-n),this.hitPlane.visible=!0;const i=e.positionAndNormalFromPoint(Yp,this.hitPlane);return this.hitPlane.visible=!1,i==null?null:i.position}getExpandedHit(e,t,n){this.hitPlane.scale.set(1e3,1e3,1e3),this.hitPlane.updateMatrixWorld();const i=this.getHit(e,t,n);return this.hitPlane.scale.set(1,1,1),i}controllerIntersection(e,t){this.hitBox.visible=!0;const n=e.hitFromController(t,this.hitBox);return this.hitBox.visible=!1,n}set offsetHeight(e){e-=.001,this.side==="back"?this.position.z=this.shadowHeight+e:this.position.y=this.shadowHeight+e}get offsetHeight(){return this.side==="back"?this.position.z-this.shadowHeight:this.position.y-this.shadowHeight}set show(e){this.goalOpacity=e?ow:0}updateOpacity(e){const t=this.material;t.opacity=this.opacityDamper.update(t.opacity,this.goalOpacity,e,1),this.visible=t.opacity>0}dispose(){const{geometry:e,material:t}=this.hitPlane;e.dispose(),t.dispose(),this.hitBox.geometry.dispose(),this.hitBox.material.dispose(),this.geometry.dispose(),this.material.dispose(),this.hitBox.removeFromParent(),this.removeFromParent()}}/* @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zt=(r,e)=>({type:"number",number:r,unit:e}),Ri=(()=>{const r={};return t=>{const n=t;if(n in r)return r[n];const i=[];let s=0;for(;t;){if(++s>1e3){t="";break}const a=T0(t),o=a.nodes[0];if(o==null||o.terms.length===0)break;i.push(o),t=a.remainingInput}return r[n]=i}})(),T0=(()=>{const r=/^(\-\-|[a-z\u0240-\uffff])/i,e=/^([\*\+\/]|[\-]\s)/i,t=/^[\),]/;return s=>{const a=[];for(;s.length&&(s=s.trim(),!t.test(s));)if(s[0]==="("){const{nodes:o,remainingInput:c}=Jp(s);s=c,a.push({type:"function",name:{type:"ident",value:"calc"},arguments:o})}else if(r.test(s)){const o=lw(s),c=o.nodes[0];if(s=o.remainingInput,s[0]==="("){const{nodes:l,remainingInput:u}=Jp(s);a.push({type:"function",name:c,arguments:l}),s=u}else a.push(c)}else if(e.test(s))a.push({type:"operator",value:s[0]}),s=s.slice(1);else{const{nodes:o,remainingInput:c}=s[0]==="#"?uw(s):hw(s);if(o.length===0)break;a.push(o[0]),s=c}return{nodes:[{type:"expression",terms:a}],remainingInput:s}}})(),lw=(()=>{const r=/[^a-z0-9_\-\u0240-\uffff]/i;return e=>{const t=e.match(r),n=t==null?e:e.substr(0,t.index),i=t==null?"":e.substr(t.index);return{nodes:[{type:"ident",value:n}],remainingInput:i}}})(),hw=(()=>{const r=/[\+\-]?(\d+[\.]\d+|\d+|[\.]\d+)([eE][\+\-]?\d+)?/,e=/^[a-z%]+/i,t=/^(m|mm|cm|rad|deg|[%])$/;return n=>{const i=n.match(r),s=i==null?"0":i[0];n=s==null?n:n.slice(s.length);const a=n.match(e);let o=a!=null&&a[0]!==""?a[0]:null;const c=a==null?n:n.slice(o.length);return o!=null&&!t.test(o)&&(o=null),{nodes:[{type:"number",number:parseFloat(s)||0,unit:o}],remainingInput:c}}})(),uw=(()=>{const r=/^[a-f0-9]*/i;return e=>{e=e.slice(1).trim();const t=e.match(r);return{nodes:t==null?[]:[{type:"hex",value:t[0]}],remainingInput:t==null?e:e.slice(t[0].length)}}})(),Jp=r=>{const e=[];for(r=r.slice(1).trim();r.length;){const t=T0(r);if(e.push(t.nodes[0]),r=t.remainingInput.trim(),r[0]===",")r=r.slice(1).trim();else if(r[0]===")"){r=r.slice(1);break}}return{nodes:e,remainingInput:r}},Zp=Symbol("visitedTypes");class dw{constructor(e){this[Zp]=e}walk(e,t){const n=e.slice();for(;n.length;){const i=n.shift();switch(this[Zp].indexOf(i.type)>-1&&t(i),i.type){case"expression":n.unshift(...i.terms);break;case"function":n.unshift(i.name,...i.arguments);break}}}}const ns=Object.freeze({type:"number",number:0,unit:null});/* @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ol=(r,e=0)=>{let{number:t,unit:n}=r;if(!isFinite(t))t=e,n="rad";else if(r.unit==="rad"||r.unit==null)return r;return{type:"number",number:(n==="deg"&&t!=null?t:0)*Math.PI/180,unit:"rad"}},eA=(r,e=0)=>{let{number:t,unit:n}=r;if(!isFinite(t))t=e,n="m";else if(r.unit==="m")return r;let i;switch(n){default:i=1;break;case"cm":i=1/100;break;case"mm":i=1/1e3;break}return{type:"number",number:i*t,unit:"m"}},si=(()=>{const r=t=>t,e={rad:r,deg:ol,m:r,mm:eA,cm:eA};return(t,n=ns)=>{isFinite(t.number)||(t.number=n.number,t.unit=n.unit);const{unit:i}=t;if(i==null)return t;const s=e[i];return s==null?n:s(t)}})();/* @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var R0,tA,nA;const na=Symbol("evaluate"),Cc=Symbol("lastValue");class Mt{constructor(){this[R0]=null}static evaluatableFor(e,t=ns){if(e instanceof Mt)return e;if(e.type==="number")return e.unit==="%"?new fw(e,t):e;switch(e.name.value){case"calc":return new mw(e,t);case"env":return new pw(e)}return ns}static evaluate(e){return e instanceof Mt?e.evaluate():e}static isConstant(e){return e instanceof Mt?e.isConstant:!0}static applyIntrinsics(e,t){const{basis:n,keywords:i}=t,{auto:s}=i;return n.map((a,o)=>{const c=s[o]==null?a:s[o];let l=e[o]?e[o]:c;if(l.type==="ident"){const u=l.value;u in i&&(l=i[u][o])}return(l==null||l.type==="ident")&&(l=c),l.unit==="%"?Zt(l.number/100*a.number,a.unit):(l=si(l,a),l.unit!==a.unit?a:l)})}get isConstant(){return!1}evaluate(){return(!this.isConstant||this[Cc]==null)&&(this[Cc]=this[na]()),this[Cc]}}R0=Cc;const iA=Symbol("percentage"),ph=Symbol("basis");class fw extends Mt{constructor(e,t){super(),this[iA]=e,this[ph]=t}get isConstant(){return!0}[na](){return Zt(this[iA].number/100*this[ph].number,this[ph].unit)}}const Yo=Symbol("identNode");class pw extends Mt{constructor(e){super(),this[tA]=null;const t=e.arguments.length?e.arguments[0].terms[0]:null;t!=null&&t.type==="ident"&&(this[Yo]=t)}get isConstant(){return!1}[(tA=Yo,na)](){if(this[Yo]!=null)switch(this[Yo].value){case"window-scroll-y":const e=window.pageYOffset,t=Math.max(document.body.scrollHeight,document.body.offsetHeight,document.documentElement.clientHeight,document.documentElement.scrollHeight,document.documentElement.offsetHeight);return{type:"number",number:e/(t-window.innerHeight)||0,unit:null}}return ns}}const Aw=/[\*\/]/,or=Symbol("evaluator");class mw extends Mt{constructor(e,t=ns){if(super(),this[nA]=null,e.arguments.length!==1)return;const n=e.arguments[0].terms.slice(),i=[];for(;n.length;){const s=n.shift();if(i.length>0){const a=i[i.length-1];if(a.type==="operator"&&Aw.test(a.value)){const o=i.pop(),c=i.pop();if(c==null)return;i.push(new rA(o,Mt.evaluatableFor(c,t),Mt.evaluatableFor(s,t)));continue}}i.push(s.type==="operator"?s:Mt.evaluatableFor(s,t))}for(;i.length>2;){const[s,a,o]=i.splice(0,3);if(a.type!=="operator")return;i.unshift(new rA(a,Mt.evaluatableFor(s,t),Mt.evaluatableFor(o,t)))}i.length===1&&(this[or]=i[0])}get isConstant(){return this[or]==null||Mt.isConstant(this[or])}[(nA=or,na)](){return this[or]!=null?Mt.evaluate(this[or]):ns}}const sA=Symbol("operator"),Ah=Symbol("left"),mh=Symbol("right");class rA extends Mt{constructor(e,t,n){super(),this[sA]=e,this[Ah]=t,this[mh]=n}get isConstant(){return Mt.isConstant(this[Ah])&&Mt.isConstant(this[mh])}[na](){const e=si(Mt.evaluate(this[Ah])),t=si(Mt.evaluate(this[mh])),{number:n,unit:i}=e,{number:s,unit:a}=t;if(a!=null&&i!=null&&a!=i)return ns;const o=i||a;let c;switch(this[sA].value){case"+":c=n+s;break;case"-":c=n-s;break;case"/":c=n/s;break;case"*":c=n*s;break;default:return ns}return{type:"number",number:c,unit:o}}}const gh=Symbol("evaluatables"),aA=Symbol("intrinsics");class B0 extends Mt{constructor(e,t){super(),this[aA]=t;const n=e[0],i=n!=null?n.terms:[];this[gh]=t.basis.map((s,a)=>{const o=i[a];return o==null?{type:"ident",value:"auto"}:o.type==="ident"?o:Mt.evaluatableFor(o,s)})}get isConstant(){for(const e of this[gh])if(!Mt.isConstant(e))return!1;return!0}[na](){const e=this[gh].map(t=>Mt.evaluate(t));return Mt.applyIntrinsics(e,this[aA]).map(t=>t.number)}}/* @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var D0,L0,F0,P0;const cr=Symbol("instances"),oA=Symbol("activateListener"),cA=Symbol("deactivateListener"),bh=Symbol("notifyInstances"),lA=Symbol("notify"),hA=Symbol("callback");class Zn{static[bh](){for(const e of Zn[cr])e[lA]()}static[(D0=cr,oA)](){window.addEventListener("scroll",this[bh],{passive:!0})}static[cA](){window.removeEventListener("scroll",this[bh])}constructor(e){this[hA]=e}observe(){Zn[cr].size===0&&Zn[oA](),Zn[cr].add(this)}disconnect(){Zn[cr].delete(this),Zn[cr].size===0&&Zn[cA]()}[lA](){this[hA]()}}Zn[D0]=new Set;const uA=Symbol("computeStyleCallback"),U0=Symbol("astWalker"),Ua=Symbol("dependencies"),N0=Symbol("onScroll");class gw{constructor(e){this[L0]={},this[F0]=new dw(["function"]),this[P0]=()=>{this[uA]({relatedState:"window-scroll"})},this[uA]=e}observeEffectsFor(e){const t={},n=this[Ua];this[U0].walk(e,i=>{const{name:s}=i,o=i.arguments[0].terms[0];if(!(s.value!=="env"||o==null||o.type!=="ident"))switch(o.value){case"window-scroll-y":if(t["window-scroll"]==null){const c="window-scroll"in n?n["window-scroll"]:new Zn(this[N0]);c.observe(),delete n["window-scroll"],t["window-scroll"]=c}break}});for(const i in n)n[i].disconnect();this[Ua]=t}dispose(){for(const e in this[Ua])this[Ua][e].disconnect()}}L0=Ua,F0=U0,P0=N0;/* @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vi=r=>{const e=r.observeEffects||!1,t=r.intrinsics instanceof Function?r.intrinsics:()=>r.intrinsics;return(n,i)=>{const s=n.updated,a=n.connectedCallback,o=n.disconnectedCallback,c=Symbol(`${i}StyleEffector`),l=Symbol(`${i}StyleEvaluator`),u=Symbol(`${i}UpdateEvaluator`),h=Symbol(`${i}EvaluateAndSync`);Object.defineProperties(n,{[c]:{value:null,writable:!0},[l]:{value:null,writable:!0},[u]:{value:function(){const d=Ri(this[i]);this[l]=new B0(d,t(this)),this[c]==null&&e&&(this[c]=new gw(()=>this[h]())),this[c]!=null&&this[c].observeEffectsFor(d)}},[h]:{value:function(){if(this[l]==null)return;const d=this[l].evaluate();this[r.updateHandler](d)}},updated:{value:function(d){d.has(i)&&(this[u](),this[h]()),s.call(this,d)}},connectedCallback:{value:function(){a.call(this),this.requestUpdate(i,this[i])}},disconnectedCallback:{value:function(){o.call(this),this[c]!=null&&(this[c].dispose(),this[c]=null)}}})}};/* @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const O0=r=>r<.5?2*r*r:-1+(4-2*r)*r,bw=(r,e,t=O0)=>n=>r+(e-r)*t(n),_w=(r,e)=>{const t=i=>s=>i+=s,n=e.map(t(0));return i=>{i=ni(i,0,1),i*=n[n.length-1];const s=n.findIndex(c=>c>=i),a=s<1?0:n[s-1],o=n[s];return r[s]((i-a)/(o-a))}},Mr=r=>{const e=[],t=[];let n=r.initialValue;for(let i=0;i<r.keyframes.length;++i){const s=r.keyframes[i],{value:a,frames:o}=s,c=s.ease||O0,l=bw(n,a,c);e.push(l),t.push(o),n=a}return _w(e,t)};/* @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Ut=function(r,e,t,n){var i=arguments.length,s=i<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,t):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(r,e,t,n);else for(var o=r.length-1;o>=0;o--)(a=r[o])&&(s=(i<3?a(s):i>3?a(e,t,s):a(e,t))||s);return i>3&&s&&Object.defineProperty(e,t,s),s};const Ew=5e3,xw=Mr({initialValue:0,keyframes:[{frames:5,value:-1},{frames:1,value:-1},{frames:8,value:1},{frames:1,value:1},{frames:5,value:0},{frames:18,value:0}]}),vw=Mr({initialValue:0,keyframes:[{frames:1,value:1},{frames:5,value:1},{frames:1,value:0},{frames:6,value:0}]}),yw=30,Sw=12,k0="0deg 75deg 105%",Cw="auto auto auto",Iw="auto",Mw=2.2,ww=["front","right","back","left"],Tw=["upper-","","lower-"],Rw=3e3,Bw=". Use mouse, touch or arrow keys to move.",Ko={AUTO:"auto"},_h={BASIC:"basic",WIGGLE:"wiggle"},Dw={NONE:"none"},dA=()=>({basis:[ol(Zt(yw,"deg"))],keywords:{auto:[null]}}),Lw=()=>({basis:[ol(Zt(Sw,"deg"))],keywords:{auto:[null]}}),Q0=(()=>{const r=Ri(k0)[0].terms,e=si(r[0]),t=si(r[1]);return n=>{const i=n[J].idealCameraDistance();return{basis:[e,t,Zt(i,"m")],keywords:{auto:[null,null,Zt(105,"%")]}}}})(),Fw=r=>{const e=Mw*r[J].boundingSphere.radius;return{basis:[Zt(-1/0,"rad"),Zt(0,"rad"),Zt(e,"m")],keywords:{auto:[null,null,null]}}},Pw=r=>{const e=Q0(r),n=new B0([],e).evaluate()[2];return{basis:[Zt(1/0,"rad"),Zt(Math.PI,"rad"),Zt(n,"m")],keywords:{auto:[null,null,null]}}},Uw=r=>{const e=r[J].boundingBox.getCenter(new B);return{basis:[Zt(e.x,"m"),Zt(e.y,"m"),Zt(e.z,"m")],keywords:{auto:[null,null,null]}}},G0=Math.PI/2,Nw=Math.PI/3,Ow=G0/2,kw=2*Math.PI,ot=Symbol("controls"),Ic=Symbol("panElement"),Eh=Symbol("promptElement"),Jo=Symbol("promptAnimatedContainer"),xh=Symbol("fingerAnimatedContainers"),Zo=Symbol("deferInteractionPrompt"),fA=Symbol("updateAria"),Ei=Symbol("a11y"),pA=Symbol("updateA11y"),AA=Symbol("updateCameraForRadius"),lr=Symbol("cancelPrompts"),vh=Symbol("onChange"),ma=Symbol("onPointerChange"),ps=Symbol("waitingToPromptUser"),ec=Symbol("userHasInteracted"),hr=Symbol("promptElementVisibleTime"),ga=Symbol("lastPromptOffset"),tc=Symbol("cancellationSource"),yh=Symbol("lastSpherical"),ba=Symbol("jumpCamera"),Sh=Symbol("initialized"),_a=Symbol("maintainThetaPhi"),mA=Symbol("syncCameraOrbit"),gA=Symbol("syncFieldOfView"),bA=Symbol("syncCameraTarget"),_A=Symbol("syncMinCameraOrbit"),EA=Symbol("syncMaxCameraOrbit"),xA=Symbol("syncMinFieldOfView"),vA=Symbol("syncMaxFieldOfView"),Qw=r=>{var e,t,n,i,s,a,o,c,l,u,h,d,f,A,g,m,p,E;class _ extends r{constructor(){super(...arguments),this.cameraControls=!1,this.cameraOrbit=k0,this.cameraTarget=Cw,this.fieldOfView=Iw,this.minCameraOrbit="auto",this.maxCameraOrbit="auto",this.minFieldOfView="auto",this.maxFieldOfView="auto",this.interactionPromptThreshold=Rw,this.interactionPrompt=Ko.AUTO,this.interactionPromptStyle=_h.WIGGLE,this.orbitSensitivity=1,this.zoomSensitivity=1,this.panSensitivity=1,this.touchAction=Dw.NONE,this.disableZoom=!1,this.disablePan=!1,this.disableTap=!1,this.interpolationDecay=M0,this.a11y=null,this[e]=this.shadowRoot.querySelector(".interaction-prompt"),this[t]=this.shadowRoot.querySelector("#prompt"),this[n]=[this.shadowRoot.querySelector("#finger0"),this.shadowRoot.querySelector("#finger1")],this[i]=this.shadowRoot.querySelector(".pan-target"),this[s]=0,this[a]=1/0,this[o]=!1,this[c]=!1,this[l]=Rt.AUTOMATIC,this[u]=new Vw(this[J].camera,this[zn],this[J]),this[h]=new xc,this[d]=!1,this[f]=!1,this[A]=!1,this[g]={},this[m]=()=>{const x=this[ot].changeSource;this[tc]=x,x===Rt.USER_INTERACTION&&(this[ec]=!0,this[Zo]())},this[p]=()=>{this[fA](),this[qt]();const x=this[ot].changeSource;this.dispatchEvent(new CustomEvent("camera-change",{detail:{source:x}}))},this[E]=x=>{this[Tc].classList.toggle("pointer-tumbling",x.type==="pointer-change-start")}}get inputSensitivity(){return this[ot].inputSensitivity}set inputSensitivity(x){this[ot].inputSensitivity=x}getCameraOrbit(){const{theta:x,phi:I,radius:M}=this[yh];return{theta:x,phi:I,radius:M,toString(){return`${this.theta}rad ${this.phi}rad ${this.radius}m`}}}getCameraTarget(){return $i(this[lt].isPresenting?this[lt].arRenderer.target:this[J].getDynamicTarget())}getFieldOfView(){return this[ot].getFieldOfView()}getMinimumFieldOfView(){return this[ot].options.minimumFieldOfView}getMaximumFieldOfView(){return this[ot].options.maximumFieldOfView}getIdealAspect(){return this[J].idealAspect}jumpCameraToGoal(){this[ba]=!0,this.requestUpdate(ba,!1)}resetInteractionPrompt(){this[ga]=0,this[hr]=1/0,this[ec]=!1,this[ps]=this.interactionPrompt===Ko.AUTO&&this.cameraControls}zoom(x){const I=new WheelEvent("wheel",{deltaY:-30*x});this[zn].dispatchEvent(I)}connectedCallback(){super.connectedCallback(),this[ot].addEventListener("user-interaction",this[lr]),this[ot].addEventListener("pointer-change-start",this[ma]),this[ot].addEventListener("pointer-change-end",this[ma])}disconnectedCallback(){super.disconnectedCallback(),this[ot].removeEventListener("user-interaction",this[lr]),this[ot].removeEventListener("pointer-change-start",this[ma]),this[ot].removeEventListener("pointer-change-end",this[ma])}updated(x){super.updated(x);const I=this[ot],M=this[J];if(x.has("cameraControls")&&(this.cameraControls?(I.enableInteraction(),this.interactionPrompt===Ko.AUTO&&(this[ps]=!0)):(I.disableInteraction(),this[Zo]()),this[zn].setAttribute("aria-label",this[Tr])),x.has("disableZoom")&&(I.disableZoom=this.disableZoom),x.has("disablePan")&&(I.enablePan=!this.disablePan),x.has("disableTap")&&(I.enableTap=!this.disableTap),(x.has("interactionPrompt")||x.has("cameraControls")||x.has("src"))&&(this.interactionPrompt===Ko.AUTO&&this.cameraControls&&!this[ec]?this[ps]=!0:this[Zo]()),x.has("interactionPromptStyle")&&(this[Jo].style.opacity=this.interactionPromptStyle==_h.BASIC?"1":"0"),x.has("touchAction")){const w=this.touchAction;I.applyOptions({touchAction:w}),I.updateTouchActionStyle()}x.has("orbitSensitivity")&&(I.orbitSensitivity=this.orbitSensitivity),x.has("zoomSensitivity")&&(I.zoomSensitivity=this.zoomSensitivity),x.has("panSensitivity")&&(I.panSensitivity=this.panSensitivity),x.has("interpolationDecay")&&(I.setDamperDecayTime(this.interpolationDecay),M.setTargetDamperDecayTime(this.interpolationDecay)),x.has("a11y")&&this[pA](),this[ba]===!0&&Promise.resolve().then(()=>{I.jumpToGoal(),M.jumpToGoal(),this[vh](),this[ba]=!1})}async updateFraming(){const x=this[J],I=x.adjustedFoV(x.framedFoVDeg);await x.updateFraming();const M=x.adjustedFoV(x.framedFoVDeg),w=this[ot].getFieldOfView()/I;this[ot].setFieldOfView(M*w),this[_a]=!0,this.requestUpdate("maxFieldOfView"),this.requestUpdate("fieldOfView"),this.requestUpdate("minCameraOrbit"),this.requestUpdate("maxCameraOrbit"),this.requestUpdate("cameraOrbit"),await this.updateComplete}interact(x,I,M){const w=this[zn],v=this[xh];if(v[0].style.opacity==="1"){console.warn("interact() failed because an existing interaction is running.");return}const y=new Array;y.push({x:Mr(I.x),y:Mr(I.y)});const T=[{x:y[0].x(0),y:y[0].y(0)}];M!=null&&(y.push({x:Mr(M.x),y:Mr(M.y)}),T.push({x:y[1].x(0),y:y[1].y(0)}));let k=performance.now();const{width:U,height:F}=this[J],H=this.getBoundingClientRect(),O=Y=>{for(const[Z,re]of T.entries()){const{style:fe}=v[Z];fe.transform=`translateX(${U*re.x}px) translateY(${F*re.y}px)`,Y==="pointerdown"?fe.opacity="1":Y==="pointerup"&&(fe.opacity="0");const Be={pointerId:Z-5678,pointerType:"touch",target:w,clientX:U*re.x+H.x,clientY:F*re.y+H.y,altKey:!0};w.dispatchEvent(new PointerEvent(Y,Be))}},W=()=>{const Y=this[tc];if(Y!==Rt.AUTOMATIC||!w.isConnected){for(const re of this[xh])re.style.opacity="0";O("pointercancel"),this.dispatchEvent(new CustomEvent("interact-stopped",{detail:{source:Y}})),document.removeEventListener("visibilitychange",Q);return}const Z=Math.min(1,(performance.now()-k)/x);for(const[re,fe]of T.entries())fe.x=y[re].x(Z),fe.y=y[re].y(Z);O("pointermove"),Z<1?requestAnimationFrame(W):(O("pointerup"),this.dispatchEvent(new CustomEvent("interact-stopped",{detail:{source:Rt.AUTOMATIC}})),document.removeEventListener("visibilitychange",Q))},Q=()=>{let Y=0;document.visibilityState==="hidden"?Y=performance.now()-k:k=performance.now()-Y};document.addEventListener("visibilitychange",Q),O("pointerdown"),this[tc]=Rt.AUTOMATIC,requestAnimationFrame(W)}[(e=Eh,t=Jo,n=xh,i=Ic,s=ga,a=hr,o=ec,c=ps,l=tc,u=ot,h=yh,d=ba,f=Sh,A=_a,g=Ei,gA)](x){const I=this[ot],M=this[J];M.framedFoVDeg=x[0]*180/Math.PI,I.changeSource=Rt.NONE,I.setFieldOfView(M.adjustedFoV(M.framedFoVDeg)),this[lr]()}[mA](x){const I=this[ot];if(this[_a]){const{theta:M,phi:w}=this.getCameraOrbit();x[0]=M,x[1]=w,this[_a]=!1}I.changeSource=Rt.NONE,I.setOrbit(x[0],x[1],x[2]),this[lr]()}[_A](x){this[ot].applyOptions({minimumAzimuthalAngle:x[0],minimumPolarAngle:x[1],minimumRadius:x[2]}),this.jumpCameraToGoal()}[EA](x){this[ot].applyOptions({maximumAzimuthalAngle:x[0],maximumPolarAngle:x[1],maximumRadius:x[2]}),this[AA](x[2]),this.jumpCameraToGoal()}[xA](x){this[ot].applyOptions({minimumFieldOfView:x[0]*180/Math.PI}),this.jumpCameraToGoal()}[vA](x){const I=this[J].adjustedFoV(x[0]*180/Math.PI);this[ot].applyOptions({maximumFieldOfView:I}),this.jumpCameraToGoal()}[bA](x){const[I,M,w]=x;this[lt].arRenderer.isPresenting||this[J].setTarget(I,M,w),this[ot].changeSource=Rt.NONE,this[lt].arRenderer.updateTarget(),this[lr]()}[oi](x,I){if(super[oi](x,I),this[lt].isPresenting||!this[Gs]())return;const M=this[ot],w=this[J],v=performance.now();if(this[ps]&&this.loaded&&v>this[ka]+this.interactionPromptThreshold&&(this[ps]=!1,this[hr]=v,this[Eh].classList.add("visible")),isFinite(this[hr])&&this.interactionPromptStyle===_h.WIGGLE){const k=(v-this[hr])/Ew%1,U=xw(k),F=vw(k);if(this[Jo].style.opacity=`${F}`,U!==this[ga]){const H=U*w.width*.05,O=(U-this[ga])*Math.PI/16;this[Jo].style.transform=`translateX(${H}px)`,M.changeSource=Rt.AUTOMATIC,M.adjustOrbit(O,0,0),this[ga]=U}}const y=M.update(x,I),T=w.updateTarget(I);(y||T)&&this[vh]()}[Zo](){this[ps]=!1,this[Eh].classList.remove("visible"),this[hr]=1/0}[AA](x){const I=Math.max(this[J].farRadius(),x),M=0,w=Math.abs(2*I);this[ot].updateNearFar(M,w)}[fA](){const{theta:x,phi:I}=this[ot].getCameraSpherical(this[yh]),M=(4+Math.floor((x%kw+Ow)/G0))%4,w=Math.floor(I/Nw),v=ww[M],T=`${Tw[w]}${v}`,k=T;k in this[Ei]?this[jc](this[Ei][k]):this[jc](`View from stage ${T}`)}get[Tr](){let x=Bw;return"interaction-prompt"in this[Ei]&&(x=`. ${this[Ei]["interaction-prompt"]}`),super[Tr].replace(/\.$/,"")+(this.cameraControls?x:"")}async[Yc](x){const I=this[ot],M=this[J],w=M.adjustedFoV(M.framedFoVDeg);super[Yc](x);const v=M.adjustedFoV(M.framedFoVDeg)/w,y=I.getFieldOfView()*(isFinite(v)?v:1);I.updateAspect(this[J].aspect),this.requestUpdate("maxFieldOfView",this.maxFieldOfView),await this.updateComplete,this[ot].setFieldOfView(y),this.jumpCameraToGoal()}[ci](){super[ci](),this[Sh]?this[_a]=!0:this[Sh]=!0,this.requestUpdate("maxFieldOfView",this.maxFieldOfView),this.requestUpdate("fieldOfView",this.fieldOfView),this.requestUpdate("minCameraOrbit",this.minCameraOrbit),this.requestUpdate("maxCameraOrbit",this.maxCameraOrbit),this.requestUpdate("cameraOrbit",this.cameraOrbit),this.requestUpdate("cameraTarget",this.cameraTarget),this.jumpCameraToGoal()}[(m=lr,p=vh,E=ma,pA)](){if(typeof this.a11y=="string")if(this.a11y.startsWith("{"))try{this[Ei]=JSON.parse(this.a11y)}catch(x){console.warn("Error parsing a11y JSON:",x)}else this.a11y.length>0?console.warn("Error not supported format, should be a JSON string:",this.a11y):this[Ei]={};else typeof this.a11y=="object"&&this.a11y!=null?this[Ei]=Object.assign({},this.a11y):this[Ei]={};this[zn].setAttribute("aria-label",this[Tr])}}return Ut([De({type:Boolean,attribute:"camera-controls"})],_.prototype,"cameraControls",void 0),Ut([Vi({intrinsics:Q0,observeEffects:!0,updateHandler:mA}),De({type:String,attribute:"camera-orbit",hasChanged:()=>!0})],_.prototype,"cameraOrbit",void 0),Ut([Vi({intrinsics:Uw,observeEffects:!0,updateHandler:bA}),De({type:String,attribute:"camera-target",hasChanged:()=>!0})],_.prototype,"cameraTarget",void 0),Ut([Vi({intrinsics:dA,observeEffects:!0,updateHandler:gA}),De({type:String,attribute:"field-of-view",hasChanged:()=>!0})],_.prototype,"fieldOfView",void 0),Ut([Vi({intrinsics:Fw,updateHandler:_A}),De({type:String,attribute:"min-camera-orbit",hasChanged:()=>!0})],_.prototype,"minCameraOrbit",void 0),Ut([Vi({intrinsics:Pw,updateHandler:EA}),De({type:String,attribute:"max-camera-orbit",hasChanged:()=>!0})],_.prototype,"maxCameraOrbit",void 0),Ut([Vi({intrinsics:Lw,updateHandler:xA}),De({type:String,attribute:"min-field-of-view",hasChanged:()=>!0})],_.prototype,"minFieldOfView",void 0),Ut([Vi({intrinsics:dA,updateHandler:vA}),De({type:String,attribute:"max-field-of-view",hasChanged:()=>!0})],_.prototype,"maxFieldOfView",void 0),Ut([De({type:Number,attribute:"interaction-prompt-threshold"})],_.prototype,"interactionPromptThreshold",void 0),Ut([De({type:String,attribute:"interaction-prompt"})],_.prototype,"interactionPrompt",void 0),Ut([De({type:String,attribute:"interaction-prompt-style"})],_.prototype,"interactionPromptStyle",void 0),Ut([De({type:Number,attribute:"orbit-sensitivity"})],_.prototype,"orbitSensitivity",void 0),Ut([De({type:Number,attribute:"zoom-sensitivity"})],_.prototype,"zoomSensitivity",void 0),Ut([De({type:Number,attribute:"pan-sensitivity"})],_.prototype,"panSensitivity",void 0),Ut([De({type:String,attribute:"touch-action"})],_.prototype,"touchAction",void 0),Ut([De({type:Boolean,attribute:"disable-zoom"})],_.prototype,"disableZoom",void 0),Ut([De({type:Boolean,attribute:"disable-pan"})],_.prototype,"disablePan",void 0),Ut([De({type:Boolean,attribute:"disable-tap"})],_.prototype,"disableTap",void 0),Ut([De({type:Number,attribute:"interpolation-decay"})],_.prototype,"interpolationDecay",void 0),Ut([De()],_.prototype,"a11y",void 0),_};/* @license
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gw=.018,yA=2,Hw=300,zw=new ke,SA=new B,CA=Object.freeze({minimumRadius:0,maximumRadius:1/0,minimumPolarAngle:0,maximumPolarAngle:Math.PI,minimumAzimuthalAngle:-1/0,maximumAzimuthalAngle:1/0,minimumFieldOfView:10,maximumFieldOfView:45,touchAction:"none"}),nc=Math.PI/8,ic=.04,sc=10,Rt={USER_INTERACTION:"user-interaction",NONE:"none",AUTOMATIC:"automatic"};class Vw extends jn{constructor(e,t,n){super(),this.camera=e,this.element=t,this.scene=n,this.orbitSensitivity=1,this.zoomSensitivity=1,this.panSensitivity=1,this.inputSensitivity=1,this.changeSource=Rt.NONE,this._interactionEnabled=!1,this._disableZoom=!1,this.isUserPointing=!1,this.enablePan=!0,this.enableTap=!0,this.panProjection=new Qe,this.panPerPixel=0,this.spherical=new xc,this.goalSpherical=new xc,this.thetaDamper=new cn,this.phiDamper=new cn,this.radiusDamper=new cn,this.logFov=Math.log(CA.maximumFieldOfView),this.goalLogFov=this.logFov,this.fovDamper=new cn,this.touchMode=null,this.pointers=[],this.startTime=0,this.startPointerPosition={clientX:0,clientY:0},this.lastSeparation=0,this.touchDecided=!1,this.onContext=i=>{if(this.enablePan)i.preventDefault();else for(const s of this.pointers)this.onPointerUp(new PointerEvent("pointercancel",Object.assign(Object.assign({},this.startPointerPosition),{pointerId:s.id})))},this.touchModeZoom=(i,s)=>{if(!this._disableZoom){const a=this.twoTouchDistance(this.pointers[0],this.pointers[1]),o=ic*this.zoomSensitivity*(this.lastSeparation-a)*50/this.scene.height;this.lastSeparation=a,this.userAdjustOrbit(0,0,o)}this.panPerPixel>0&&this.movePan(i,s)},this.disableScroll=i=>{i.preventDefault()},this.touchModeRotate=(i,s)=>{const{touchAction:a}=this._options;if(!this.touchDecided&&a!=="none"){this.touchDecided=!0;const o=Math.abs(i),c=Math.abs(s);if(this.changeSource===Rt.USER_INTERACTION&&(a==="pan-y"&&c>o||a==="pan-x"&&o>c)){this.touchMode=null;return}else this.element.addEventListener("touchmove",this.disableScroll,{passive:!1})}this.handleSinglePointerMove(i,s)},this.onPointerDown=i=>{if(this.pointers.length>2)return;const{element:s}=this;this.pointers.length===0&&(s.addEventListener("pointermove",this.onPointerMove),s.addEventListener("pointerup",this.onPointerUp),this.touchMode=null,this.touchDecided=!1,this.startPointerPosition.clientX=i.clientX,this.startPointerPosition.clientY=i.clientY,this.startTime=performance.now());try{s.setPointerCapture(i.pointerId)}catch{}this.pointers.push({clientX:i.clientX,clientY:i.clientY,id:i.pointerId}),this.isUserPointing=!1,i.pointerType==="touch"?(this.changeSource=i.altKey?Rt.AUTOMATIC:Rt.USER_INTERACTION,this.onTouchChange(i)):(this.changeSource=Rt.USER_INTERACTION,this.onMouseDown(i)),this.changeSource===Rt.USER_INTERACTION&&this.dispatchEvent({type:"user-interaction"})},this.onPointerMove=i=>{const s=this.pointers.find(l=>l.id===i.pointerId);if(s==null)return;if(i.pointerType==="mouse"&&i.buttons===0){this.onPointerUp(i);return}const a=this.pointers.length,o=(i.clientX-s.clientX)/a,c=(i.clientY-s.clientY)/a;o===0&&c===0||(s.clientX=i.clientX,s.clientY=i.clientY,i.pointerType==="touch"?(this.changeSource=i.altKey?Rt.AUTOMATIC:Rt.USER_INTERACTION,this.touchMode!==null&&this.touchMode(o,c)):(this.changeSource=Rt.USER_INTERACTION,this.panPerPixel>0?this.movePan(o,c):this.handleSinglePointerMove(o,c)))},this.onPointerUp=i=>{const{element:s}=this,a=this.pointers.findIndex(o=>o.id===i.pointerId);a!==-1&&this.pointers.splice(a,1),this.panPerPixel>0&&!i.altKey&&this.resetRadius(),this.pointers.length===0?(s.removeEventListener("pointermove",this.onPointerMove),s.removeEventListener("pointerup",this.onPointerUp),s.removeEventListener("touchmove",this.disableScroll),this.enablePan&&this.enableTap&&this.recenter(i)):this.touchMode!==null&&this.onTouchChange(i),this.scene.element[Ic].style.opacity=0,s.style.cursor="grab",this.panPerPixel=0,this.isUserPointing&&this.dispatchEvent({type:"pointer-change-end"})},this.onWheel=i=>{this.changeSource=Rt.USER_INTERACTION;const s=i.deltaY*(i.deltaMode==1?18:1)*ic*this.zoomSensitivity/30;this.userAdjustOrbit(0,0,s),i.preventDefault(),this.dispatchEvent({type:"user-interaction"})},this.onKeyDown=i=>{const{changeSource:s}=this;this.changeSource=Rt.USER_INTERACTION,(i.shiftKey&&this.enablePan?this.panKeyCodeHandler(i):this.orbitZoomKeyCodeHandler(i))?(i.preventDefault(),this.dispatchEvent({type:"user-interaction"})):this.changeSource=s},this._options=Object.assign({},CA),this.setOrbit(0,Math.PI/2,1),this.setFieldOfView(100),this.jumpToGoal()}get interactionEnabled(){return this._interactionEnabled}enableInteraction(){if(this._interactionEnabled===!1){const{element:e}=this;e.addEventListener("pointerdown",this.onPointerDown),e.addEventListener("pointercancel",this.onPointerUp),this._disableZoom||e.addEventListener("wheel",this.onWheel),e.addEventListener("keydown",this.onKeyDown),e.addEventListener("touchmove",()=>{},{passive:!1}),e.addEventListener("contextmenu",this.onContext),this.element.style.cursor="grab",this._interactionEnabled=!0,this.updateTouchActionStyle()}}disableInteraction(){if(this._interactionEnabled===!0){const{element:e}=this;e.removeEventListener("pointerdown",this.onPointerDown),e.removeEventListener("pointermove",this.onPointerMove),e.removeEventListener("pointerup",this.onPointerUp),e.removeEventListener("pointercancel",this.onPointerUp),e.removeEventListener("wheel",this.onWheel),e.removeEventListener("keydown",this.onKeyDown),e.removeEventListener("contextmenu",this.onContext),e.style.cursor="",this.touchMode=null,this._interactionEnabled=!1,this.updateTouchActionStyle()}}get options(){return this._options}set disableZoom(e){this._disableZoom!=e&&(this._disableZoom=e,e===!0?this.element.removeEventListener("wheel",this.onWheel):this.element.addEventListener("wheel",this.onWheel),this.updateTouchActionStyle())}getCameraSpherical(e=new xc){return e.copy(this.spherical)}getFieldOfView(){return this.camera.fov}applyOptions(e){Object.assign(this._options,e),this.setOrbit(),this.setFieldOfView(Math.exp(this.goalLogFov))}updateNearFar(e,t){this.camera.far=t===0?2:t,this.camera.near=Math.max(e,this.camera.far/1e3),this.camera.updateProjectionMatrix()}updateAspect(e){this.camera.aspect=e,this.camera.updateProjectionMatrix()}setOrbit(e=this.goalSpherical.theta,t=this.goalSpherical.phi,n=this.goalSpherical.radius){const{minimumAzimuthalAngle:i,maximumAzimuthalAngle:s,minimumPolarAngle:a,maximumPolarAngle:o,minimumRadius:c,maximumRadius:l}=this._options,{theta:u,phi:h,radius:d}=this.goalSpherical,f=ni(e,i,s);!isFinite(i)&&!isFinite(s)&&(this.spherical.theta=this.wrapAngle(this.spherical.theta-f)+f);const A=ni(t,a,o),g=ni(n,c,l);return f===u&&A===h&&g===d||!isFinite(f)||!isFinite(A)||!isFinite(g)?!1:(this.goalSpherical.theta=f,this.goalSpherical.phi=A,this.goalSpherical.radius=g,this.goalSpherical.makeSafe(),!0)}setRadius(e){this.goalSpherical.radius=e,this.setOrbit()}setFieldOfView(e){const{minimumFieldOfView:t,maximumFieldOfView:n}=this._options;e=ni(e,t,n),this.goalLogFov=Math.log(e)}setDamperDecayTime(e){this.thetaDamper.setDecayTime(e),this.phiDamper.setDecayTime(e),this.radiusDamper.setDecayTime(e),this.fovDamper.setDecayTime(e)}adjustOrbit(e,t,n){const{theta:i,phi:s,radius:a}=this.goalSpherical,{minimumRadius:o,maximumRadius:c,minimumFieldOfView:l,maximumFieldOfView:u}=this._options,h=this.spherical.theta-i,d=Math.PI-.001,f=i-ni(e,-d-h,d-h),A=s-t,g=n===0?0:((n>0?c:o)-a)/(Math.log(n>0?u:l)-this.goalLogFov),m=a+n*(isFinite(g)?g:(c-o)*2);if(this.setOrbit(f,A,m),n!==0){const p=this.goalLogFov+n;this.setFieldOfView(Math.exp(p))}}jumpToGoal(){this.update(0,I0)}update(e,t){if(this.isStationary())return!1;const{maximumPolarAngle:n,maximumRadius:i}=this._options,s=this.spherical.theta-this.goalSpherical.theta;return Math.abs(s)>Math.PI&&!isFinite(this._options.minimumAzimuthalAngle)&&!isFinite(this._options.maximumAzimuthalAngle)&&(this.spherical.theta-=Math.sign(s)*2*Math.PI),this.spherical.theta=this.thetaDamper.update(this.spherical.theta,this.goalSpherical.theta,t,Math.PI),this.spherical.phi=this.phiDamper.update(this.spherical.phi,this.goalSpherical.phi,t,n),this.spherical.radius=this.radiusDamper.update(this.spherical.radius,this.goalSpherical.radius,t,i),this.logFov=this.fovDamper.update(this.logFov,this.goalLogFov,t,1),this.moveCamera(),!0}updateTouchActionStyle(){const{style:e}=this.element;if(this._interactionEnabled){const{touchAction:t}=this._options;this._disableZoom&&t!=="none"?e.touchAction="manipulation":e.touchAction=t}else e.touchAction=""}isStationary(){return this.goalSpherical.theta===this.spherical.theta&&this.goalSpherical.phi===this.spherical.phi&&this.goalSpherical.radius===this.spherical.radius&&this.goalLogFov===this.logFov}moveCamera(){this.spherical.makeSafe(),this.camera.position.setFromSpherical(this.spherical),this.camera.setRotationFromEuler(new Un(this.spherical.phi-Math.PI/2,this.spherical.theta,0,"YXZ")),this.camera.fov!==Math.exp(this.logFov)&&(this.camera.fov=Math.exp(this.logFov),this.camera.updateProjectionMatrix())}userAdjustOrbit(e,t,n){this.adjustOrbit(e*this.orbitSensitivity*this.inputSensitivity,t*this.orbitSensitivity*this.inputSensitivity,n*this.inputSensitivity)}wrapAngle(e){const t=(e+Math.PI)/(2*Math.PI);return(t-Math.floor(t))*2*Math.PI-Math.PI}pixelLengthToSphericalAngle(e){return 2*Math.PI*e/this.scene.height}twoTouchDistance(e,t){const{clientX:n,clientY:i}=e,{clientX:s,clientY:a}=t,o=s-n,c=a-i;return Math.sqrt(o*o+c*c)}handleSinglePointerMove(e,t){const n=this.pixelLengthToSphericalAngle(e),i=this.pixelLengthToSphericalAngle(t);this.isUserPointing===!1&&(this.isUserPointing=!0,this.dispatchEvent({type:"pointer-change-start"})),this.userAdjustOrbit(n,i,0)}initializePan(){const{theta:e,phi:t}=this.spherical,n=e-this.scene.yaw;this.panPerPixel=Gw*this.panSensitivity/this.scene.height,this.panProjection.set(-Math.cos(n),-Math.cos(t)*Math.sin(n),0,0,Math.sin(t),0,Math.sin(n),-Math.cos(t)*Math.cos(n),0)}movePan(e,t){const{scene:n}=this,i=SA.set(e,t,0).multiplyScalar(this.inputSensitivity),s=this.spherical.radius*Math.exp(this.logFov)*this.panPerPixel;i.multiplyScalar(s);const a=n.getTarget();a.add(i.applyMatrix3(this.panProjection)),n.boundingSphere.clampPoint(a,a),n.setTarget(a.x,a.y,a.z)}recenter(e){if(performance.now()>this.startTime+Hw||Math.abs(e.clientX-this.startPointerPosition.clientX)>yA||Math.abs(e.clientY-this.startPointerPosition.clientY)>yA)return;const{scene:t}=this,n=t.positionAndNormalFromPoint(t.getNDC(e.clientX,e.clientY));if(n==null){const{cameraTarget:i}=t.element;t.element.cameraTarget="",t.element.cameraTarget=i,this.userAdjustOrbit(0,0,1)}else t.target.worldToLocal(n.position),t.setTarget(n.position.x,n.position.y,n.position.z)}resetRadius(){const{scene:e}=this,t=e.positionAndNormalFromPoint(zw.set(0,0));if(t==null)return;e.target.worldToLocal(t.position);const n=e.getTarget(),{theta:i,phi:s}=this.spherical,a=i-e.yaw,o=SA.set(Math.sin(s)*Math.sin(a),Math.cos(s),Math.sin(s)*Math.cos(a)),c=o.dot(t.position.sub(n));n.add(o.multiplyScalar(c)),e.setTarget(n.x,n.y,n.z),this.setOrbit(void 0,void 0,this.goalSpherical.radius-c)}onTouchChange(e){if(this.pointers.length===1)this.touchMode=this.touchModeRotate;else{if(this._disableZoom){this.touchMode=null,this.element.removeEventListener("touchmove",this.disableScroll);return}this.touchMode=this.touchDecided&&this.touchMode===null?null:this.touchModeZoom,this.touchDecided=!0,this.element.addEventListener("touchmove",this.disableScroll,{passive:!1}),this.lastSeparation=this.twoTouchDistance(this.pointers[0],this.pointers[1]),this.enablePan&&this.touchMode!=null&&(this.initializePan(),e.altKey||(this.scene.element[Ic].style.opacity=1))}}onMouseDown(e){this.panPerPixel=0,this.enablePan&&(e.button===2||e.ctrlKey||e.metaKey||e.shiftKey)&&(this.initializePan(),this.scene.element[Ic].style.opacity=1),this.element.style.cursor="grabbing"}orbitZoomKeyCodeHandler(e){let t=!0;switch(e.key){case"PageUp":this.userAdjustOrbit(0,0,ic*this.zoomSensitivity);break;case"PageDown":this.userAdjustOrbit(0,0,-1*ic*this.zoomSensitivity);break;case"ArrowUp":this.userAdjustOrbit(0,-nc,0);break;case"ArrowDown":this.userAdjustOrbit(0,nc,0);break;case"ArrowLeft":this.userAdjustOrbit(-nc,0,0);break;case"ArrowRight":this.userAdjustOrbit(nc,0,0);break;default:t=!1;break}return t}panKeyCodeHandler(e){this.initializePan();let t=!0;switch(e.key){case"ArrowUp":this.movePan(0,-1*sc);break;case"ArrowDown":this.movePan(0,sc);break;case"ArrowLeft":this.movePan(-1*sc,0);break;case"ArrowRight":this.movePan(sc,0);break;default:t=!1;break}return t}}/* @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ww=30,IA=.8,MA=1.5,qw=20,Xw=.2,$w=.25,jw=10,ur=150,wA=5,Yw=.1,Xi={NOT_PRESENTING:"not-presenting",SESSION_STARTED:"session-started",OBJECT_PLACED:"object-placed",FAILED:"failed"},Ju={TRACKING:"tracking",NOT_TRACKING:"not-tracking"},Ea=new B,dr=new un,Kw=new Ne,Jw=new B,Zw=new $t(45,1,.1,100),TA=new An().setFromPoints([new B(0,0,0),new B(0,0,-1)]),eT=new Li;class tT extends jn{constructor(e){super(),this.renderer=e,this.currentSession=null,this.placeOnWall=!1,this.placementBox=null,this.lastTick=null,this.turntableRotation=null,this.oldShadowIntensity=null,this.frame=null,this.initialHitSource=null,this.transientHitTestSource=null,this.inputSource=null,this._presentedScene=null,this.resolveCleanup=null,this.exitWebXRButtonContainer=null,this.overlay=null,this.xrLight=null,this.xrMode=null,this.controller1=null,this.controller2=null,this.selectedController=null,this.tracking=!0,this.frames=0,this.initialized=!1,this.oldTarget=new B,this.placementComplete=!1,this.isTranslating=!1,this.isRotating=!1,this.isTwoFingering=!1,this.lastDragPosition=new B,this.relativeOrientation=new un,this.scaleLine=new io(TA),this.firstRatio=0,this.lastAngle=0,this.goalPosition=new B,this.goalYaw=0,this.goalScale=1,this.xDamper=new cn,this.yDamper=new cn,this.zDamper=new cn,this.yawDamper=new cn,this.pitchDamper=new cn,this.rollDamper=new cn,this.scaleDamper=new cn,this.onExitWebXRButtonContainerClick=()=>this.stopPresenting(),this.onControllerSelectStart=t=>{const n=this.presentedScene,i=t.target;if(this.placementBox.controllerIntersection(n,i)!=null)this.selectedController!=null&&(this.selectedController.userData.line.visible=!1,n.canScale&&(this.isTwoFingering=!0,this.firstRatio=this.controllerSeparation()/n.pivot.scale.x,this.scaleLine.visible=!0)),i.attach(n.pivot),this.selectedController=i,n.setShadowIntensity(.01);else{const s=i===this.controller1?this.controller2:this.controller1;this.relativeOrientation.copy(i.quaternion).invert().multiply(n.pivot.getWorldQuaternion(dr)),s.userData.turning=!1,i.userData.turning=!0,i.userData.line.visible=!1}},this.onControllerSelectEnd=t=>{const n=t.target;if(n.userData.turning=!1,n.userData.line.visible=!0,this.isTwoFingering=!1,this.scaleLine.visible=!1,this.selectedController!=null&&this.selectedController!=n)return;const i=this.presentedScene;i.attach(i.pivot),this.selectedController=null,this.goalYaw=Math.atan2(i.pivot.matrix.elements[8],i.pivot.matrix.elements[10]),this.goalPosition.x=i.pivot.position.x,this.goalPosition.z=i.pivot.position.z},this.onUpdateScene=()=>{this.placementBox!=null&&this.isPresenting&&(this.placementBox.dispose(),this.placementBox=new Kp(this.presentedScene,this.placeOnWall?"back":"bottom"))},this.onSelectStart=t=>{const n=this.transientHitTestSource;if(n==null)return;const i=this.frame.getHitTestResultsForTransientInput(n),s=this.presentedScene,a=this.placementBox;if(i.length===1){this.inputSource=t.inputSource;const{axes:o}=this.inputSource.gamepad,c=a.getHit(this.presentedScene,o[0],o[1]);a.show=!0,c!=null?(this.isTranslating=!0,this.lastDragPosition.copy(c)):this.placeOnWall===!1&&(this.isRotating=!0,this.lastAngle=o[0]*MA)}else if(i.length===2){a.show=!0,this.isTwoFingering=!0;const{separation:o}=this.fingerPolar(i);this.firstRatio=o/s.pivot.scale.x}},this.onSelectEnd=()=>{this.isTranslating=!1,this.isRotating=!1,this.isTwoFingering=!1,this.inputSource=null,this.goalPosition.y+=this.placementBox.offsetHeight*this.presentedScene.scale.x,this.placementBox.show=!1},this.threeRenderer=e.threeRenderer,this.threeRenderer.xr.enabled=!0}async resolveARSession(){_p();const e=await navigator.xr.requestSession("immersive-ar",{requiredFeatures:[],optionalFeatures:["hit-test","dom-overlay","light-estimation"],domOverlay:this.overlay?{root:this.overlay}:void 0});return this.threeRenderer.xr.setReferenceSpaceType("local"),await this.threeRenderer.xr.setSession(e),this.threeRenderer.xr.cameraAutoUpdate=!1,e}get presentedScene(){return this._presentedScene}async supportsPresentation(){try{return _p(),await navigator.xr.isSessionSupported("immersive-ar")}catch(e){return console.warn("Request to present in WebXR denied:"),console.warn(e),console.warn("Falling back to next ar-mode"),!1}}async present(e,t=!1){this.isPresenting&&console.warn("Cannot present while a model is already presenting");let n=new Promise((l,u)=>{requestAnimationFrame(()=>l())});e.setHotspotsVisibility(!1),e.queueRender(),await n,this._presentedScene=e,this.overlay=e.element.shadowRoot.querySelector("div.default"),t===!0&&(this.xrLight=new rw(this.threeRenderer),this.xrLight.addEventListener("estimationstart",()=>{if(!this.isPresenting||this.xrLight==null)return;const l=this.presentedScene;l.add(this.xrLight),l.environment=this.xrLight.environment}));const i=await this.resolveARSession();i.addEventListener("end",()=>{this.postSessionCleanup()},{once:!0});const s=e.element.shadowRoot.querySelector(".slot.exit-webxr-ar-button");s.classList.add("enabled"),s.addEventListener("click",this.onExitWebXRButtonContainerClick),this.exitWebXRButtonContainer=s;const a=await i.requestReferenceSpace("viewer");this.xrMode=i.interactionMode,this.tracking=!0,this.frames=0,this.initialized=!1,this.turntableRotation=e.yaw,this.goalYaw=e.yaw,this.goalScale=1,e.setBackground(null),this.oldShadowIntensity=e.shadowIntensity,e.setShadowIntensity(.01),this.oldTarget.copy(e.getTarget()),e.element.addEventListener("load",this.onUpdateScene);const o=qw*Math.PI/180,c=this.placeOnWall===!0?void 0:new XRRay(new DOMPoint(0,0,0),{x:0,y:-Math.sin(o),z:-Math.cos(o)});i.requestHitTestSource({space:a,offsetRay:c}).then(l=>{this.initialHitSource=l}),this.xrMode!=="screen-space"&&(this.setupControllers(),this.xDamper.setDecayTime(ur),this.yDamper.setDecayTime(ur),this.zDamper.setDecayTime(ur),this.yawDamper.setDecayTime(ur),this.pitchDamper.setDecayTime(ur),this.rollDamper.setDecayTime(ur)),this.currentSession=i,this.placementBox=new Kp(e,this.placeOnWall?"back":"bottom"),this.placementComplete=!1,this.lastTick=performance.now(),this.dispatchEvent({type:"status",status:Xi.SESSION_STARTED})}setupControllers(){this.controller1=this.threeRenderer.xr.getController(0),this.controller1.addEventListener("selectstart",this.onControllerSelectStart),this.controller1.addEventListener("selectend",this.onControllerSelectEnd),this.controller2=this.threeRenderer.xr.getController(1),this.controller2.addEventListener("selectstart",this.onControllerSelectStart),this.controller2.addEventListener("selectend",this.onControllerSelectEnd);const e=this.presentedScene;if(e.add(this.controller1),e.add(this.controller2),!this.controller1.userData.line){const t=new io(TA);t.name="line",t.scale.z=wA,this.controller1.userData.turning=!1,this.controller1.userData.line=t,this.controller1.add(t),this.controller2.userData.turning=!1;const n=t.clone();this.controller2.userData.line=n,this.controller2.add(n),this.scaleLine.name="scale line",this.scaleLine.visible=!1,this.controller1.add(this.scaleLine);const{size:i}=e,s=Yw/Math.max(i.x,i.y,i.z),a=new dt(eT);a.name="box",a.scale.copy(i).multiplyScalar(s),a.visible=!1,this.controller1.userData.box=a,e.add(a);const o=a.clone();this.controller2.userData.box=o,e.add(o)}}hover(e){if(this.xrMode==="screen-space"||this.selectedController==e)return!1;const t=this.presentedScene,n=this.placementBox.controllerIntersection(t,e);return e.userData.box.visible=(n==null||e.userData.turning)&&!this.isTwoFingering,e.userData.line.scale.z=n==null?wA:n.distance,n!=null}controllerSeparation(){return this.controller1.position.distanceTo(this.controller2.position)}async stopPresenting(){if(!this.isPresenting)return;const e=new Promise(t=>{this.resolveCleanup=t});try{await this.currentSession.end(),await e}catch(t){console.warn("Error while trying to end WebXR AR session"),console.warn(t),this.postSessionCleanup()}}get isPresenting(){return this.presentedScene!=null}get target(){return this.oldTarget}updateTarget(){const e=this.presentedScene;if(e!=null){const t=e.getTarget();this.oldTarget.copy(t),this.placeOnWall?t.z=e.boundingBox.min.z:t.y=e.boundingBox.min.y,e.setTarget(t.x,t.y,t.z)}}postSessionCleanup(){const e=this.currentSession;e!=null&&(e.removeEventListener("selectstart",this.onSelectStart),e.removeEventListener("selectend",this.onSelectEnd),this.currentSession=null);const t=this.presentedScene;if(this._presentedScene=null,t!=null){const{element:a}=t;this.xrLight!=null&&(t.remove(this.xrLight),this.xrLight.dispose(),this.xrLight=null),t.add(t.pivot),t.pivot.quaternion.set(0,0,0,1),t.pivot.position.set(0,0,0),t.pivot.scale.set(1,1,1),t.setShadowOffset(0);const o=this.turntableRotation;o!=null&&(t.yaw=o);const c=this.oldShadowIntensity;c!=null&&t.setShadowIntensity(c),t.setEnvironmentAndSkybox(a[La],a[Fa]);const l=this.oldTarget;t.setTarget(l.x,l.y,l.z),t.xrCamera=null,t.element.removeEventListener("load",this.onUpdateScene),t.orientHotspots(0);const{width:u,height:h}=a.getBoundingClientRect();t.setSize(u,h),requestAnimationFrame(()=>{t.element.dispatchEvent(new CustomEvent("camera-change",{detail:{source:Rt.NONE}}))})}this.renderer.height=0;const n=this.exitWebXRButtonContainer;n!=null&&(n.classList.remove("enabled"),n.removeEventListener("click",this.onExitWebXRButtonContainerClick),this.exitWebXRButtonContainer=null);const i=this.transientHitTestSource;i!=null&&(i.cancel(),this.transientHitTestSource=null);const s=this.initialHitSource;s!=null&&(s.cancel(),this.initialHitSource=null),this.placementBox!=null&&(this.placementBox.dispose(),this.placementBox=null),this.xrMode!=="screen-space"&&(this.controller1!=null&&(this.controller1.userData.turning=!1,this.controller1.userData.box.visible=!1,this.controller1.userData.line.visible=!0,this.controller1.removeEventListener("selectstart",this.onControllerSelectStart),this.controller1.removeEventListener("selectend",this.onControllerSelectEnd),this.controller1.removeFromParent(),this.controller1=null),this.controller2!=null&&(this.controller2.userData.turning=!1,this.controller2.userData.box.visible=!1,this.controller2.userData.line.visible=!0,this.controller2.removeEventListener("selectstart",this.onControllerSelectStart),this.controller2.removeEventListener("selectend",this.onControllerSelectEnd),this.controller2.removeFromParent(),this.controller2=null),this.selectedController=null,this.scaleLine.visible=!1),this.isTranslating=!1,this.isRotating=!1,this.isTwoFingering=!1,this.lastTick=null,this.turntableRotation=null,this.oldShadowIntensity=null,this.frame=null,this.inputSource=null,this.overlay=null,this.resolveCleanup!=null&&this.resolveCleanup(),this.dispatchEvent({type:"status",status:Xi.NOT_PRESENTING})}updateView(e){const t=this.presentedScene,n=this.threeRenderer.xr;n.updateCamera(Zw),t.xrCamera=n.getCamera();const{elements:i}=t.getCamera().matrixWorld;if(t.orientHotspots(Math.atan2(i[1],i[5])),this.initialized||(this.placeInitially(),this.initialized=!0),e.requestViewportScale&&e.recommendedViewportScale){const a=e.recommendedViewportScale;e.requestViewportScale(Math.max(a,$w))}const s=n.getBaseLayer();if(s!=null){const a=s instanceof XRWebGLLayer?s.getViewport(e):n.getBinding().getViewSubImage(s,e).viewport;this.threeRenderer.setViewport(a.x,a.y,a.width,a.height)}}placeInitially(){const e=this.presentedScene,{pivot:t,element:n}=e,{position:i}=t,s=e.getCamera(),{width:a,height:o}=this.overlay.getBoundingClientRect();e.setSize(a,o),s.projectionMatrixInverse.copy(s.projectionMatrix).invert();const{theta:c}=n.getCameraOrbit(),l=s.getWorldDirection(Ea);e.yaw=Math.atan2(-l.x,-l.z)-c,this.goalYaw=e.yaw;const u=Math.max(1,2*e.boundingSphere.radius);i.copy(s.position).add(l.multiplyScalar(u)),this.updateTarget();const h=e.getTarget();if(i.add(h).sub(this.oldTarget),this.goalPosition.copy(i),e.setHotspotsVisibility(!0),this.xrMode==="screen-space"){const{session:d}=this.frame;d.addEventListener("selectstart",this.onSelectStart),d.addEventListener("selectend",this.onSelectEnd),d.requestHitTestSourceForTransientInput({profile:"generic-touchscreen"}).then(f=>{this.transientHitTestSource=f})}}getTouchLocation(){const{axes:e}=this.inputSource.gamepad;let t=this.placementBox.getExpandedHit(this.presentedScene,e[0],e[1]);return t!=null&&(Ea.copy(t).sub(this.presentedScene.getCamera().position),Ea.length()>jw)?null:t}getHitPoint(e){const t=this.threeRenderer.xr.getReferenceSpace(),n=e.getPose(t);if(n==null)return null;const i=Kw.fromArray(n.transform.matrix);return this.placeOnWall===!0&&(this.goalYaw=Math.atan2(i.elements[4],i.elements[6])),i.elements[5]>.75!==this.placeOnWall?Jw.setFromMatrixPosition(i):null}moveToFloor(e){const t=this.initialHitSource;if(t==null)return;const n=e.getHitTestResults(t);if(n.length==0)return;const i=n[0],s=this.getHitPoint(i);s!=null&&(this.placementBox.show=!0,this.isTranslating||(this.placeOnWall?this.goalPosition.copy(s):this.goalPosition.y=s.y),t.cancel(),this.initialHitSource=null,this.dispatchEvent({type:"status",status:Xi.OBJECT_PLACED}))}fingerPolar(e){const t=e[0].inputSource.gamepad.axes,n=e[1].inputSource.gamepad.axes,i=n[0]-t[0],s=n[1]-t[1],a=Math.atan2(s,i);let o=this.lastAngle-a;return o>Math.PI?o-=2*Math.PI:o<-Math.PI&&(o+=2*Math.PI),this.lastAngle=a,{separation:Math.sqrt(i*i+s*s),deltaYaw:o}}setScale(e){const t=e/this.firstRatio;this.goalScale=Math.abs(t-1)<Xw?1:t}processInput(e){const t=this.transientHitTestSource;if(t==null||!this.isTranslating&&!this.isTwoFingering&&!this.isRotating)return;const n=e.getHitTestResultsForTransientInput(t),i=this.presentedScene,s=i.pivot.scale.x;if(this.isTwoFingering){if(n.length<2)this.isTwoFingering=!1;else{const{separation:a,deltaYaw:o}=this.fingerPolar(n);this.placeOnWall===!1&&(this.goalYaw+=o),i.canScale&&this.setScale(a)}return}else if(n.length===2){this.isTranslating=!1,this.isRotating=!1,this.isTwoFingering=!0;const{separation:a}=this.fingerPolar(n);this.firstRatio=a/s;return}if(this.isRotating){const a=this.inputSource.gamepad.axes[0]*MA;this.goalYaw+=a-this.lastAngle,this.lastAngle=a}else this.isTranslating&&n.forEach(a=>{if(a.inputSource!==this.inputSource)return;let o=null;if(a.results.length>0&&(o=this.getHitPoint(a.results[0])),o==null&&(o=this.getTouchLocation()),o!=null){if(this.goalPosition.sub(this.lastDragPosition),this.placeOnWall===!1){const c=o.y-this.lastDragPosition.y;if(c<0){this.placementBox.offsetHeight=c/s,this.presentedScene.setShadowOffset(c);const l=Ea.copy(i.getCamera().position),u=-c/(l.y-o.y);l.multiplyScalar(u),o.multiplyScalar(1-u).add(l)}}this.goalPosition.add(o),this.lastDragPosition.copy(o)}})}moveScene(e){const t=this.presentedScene,{pivot:n}=t,i=this.placementBox;if(i.updateOpacity(e),this.controller1&&(this.controller1.userData.turning&&(n.quaternion.copy(this.controller1.quaternion).multiply(this.relativeOrientation),this.selectedController&&this.selectedController===this.controller2&&n.quaternion.premultiply(dr.copy(this.controller2.quaternion).invert())),this.controller1.userData.box.position.copy(this.controller1.position),n.getWorldQuaternion(this.controller1.userData.box.quaternion)),this.controller2&&(this.controller2.userData.turning&&(n.quaternion.copy(this.controller2.quaternion).multiply(this.relativeOrientation),this.selectedController&&this.selectedController===this.controller1&&n.quaternion.premultiply(dr.copy(this.controller1.quaternion).invert())),this.controller2.userData.box.position.copy(this.controller2.position),n.getWorldQuaternion(this.controller2.userData.box.quaternion)),this.controller1&&this.controller2&&this.isTwoFingering){const d=this.controllerSeparation();this.setScale(d),this.scaleLine.scale.z=-d,this.scaleLine.lookAt(this.controller2.position)}const s=t.pivot.scale.x;if(this.goalScale!==s){const d=this.scaleDamper.update(s,this.goalScale,e,1);t.pivot.scale.set(d,d,d)}if(n.parent!==t)return;const{position:a}=n,o=t.boundingSphere.radius,c=this.goalPosition;let l=Rt.NONE;if(!c.equals(a)){l=Rt.USER_INTERACTION;let{x:d,y:f,z:A}=a;if(d=this.xDamper.update(d,c.x,e,o),f=this.yDamper.update(f,c.y,e,o),A=this.zDamper.update(A,c.z,e,o),a.set(d,f,A),this.xrMode==="screen-space"&&!this.isTranslating){const g=c.y-f;this.placementComplete&&this.placeOnWall===!1?(i.offsetHeight=g/t.pivot.scale.x,t.setShadowOffset(g)):g===0&&(this.placementComplete=!0,i.show=!1,t.setShadowIntensity(IA))}this.xrMode!=="screen-space"&&c.equals(a)&&t.setShadowIntensity(IA)}t.updateTarget(e),dr.setFromAxisAngle(Ea.set(0,1,0),this.goalYaw);const u=t.pivot.quaternion.angleTo(dr),h=u-this.yawDamper.update(u,0,e,Math.PI);t.pivot.quaternion.rotateTowards(dr,h),t.element.dispatchEvent(new CustomEvent("camera-change",{detail:{source:l}}))}onWebXRFrame(e,t){if(this.xrMode!=="screen-space"){const o=this.hover(this.controller1),c=this.hover(this.controller2);this.placementBox.show=(o||c)&&!this.isTwoFingering}this.frame=t,++this.frames;const n=this.threeRenderer.xr.getReferenceSpace(),i=t.getViewerPose(n);i==null&&this.tracking===!0&&this.frames>Ww&&(this.tracking=!1,this.dispatchEvent({type:"tracking",status:Ju.NOT_TRACKING}));const s=this.presentedScene;if(i==null||s==null||!s.element.loaded){this.threeRenderer.clear();return}this.tracking===!1&&(this.tracking=!0,this.dispatchEvent({type:"tracking",status:Ju.TRACKING}));let a=!0;for(const o of i.views){if(this.updateView(o),a){this.moveToFloor(t),this.processInput(t);const c=e-this.lastTick;this.moveScene(c),this.renderer.preRender(s,e,c),this.lastTick=e,s.renderShadow(this.threeRenderer)}this.threeRenderer.render(s,s.getCamera()),a=!1}}}function nT(r){const e=new Map,t=new Map,n=r.clone();return H0(r,n,function(i,s){e.set(s,i),t.set(i,s)}),n.traverse(function(i){if(!i.isSkinnedMesh)return;const s=i,a=e.get(i),o=a.skeleton.bones;s.skeleton=a.skeleton.clone(),s.bindMatrix.copy(a.bindMatrix),s.skeleton.bones=o.map(function(c){return t.get(c)}),s.bind(s.skeleton,s.bindMatrix)}),n}function H0(r,e,t){t(r,e);for(let n=0;n<r.children.length;n++)H0(r.children[n],e.children[n],t)}/* @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const RA=Symbol("prepared"),qc=Symbol("prepare"),Jn=Symbol("preparedGLTF"),Xc=Symbol("clone");class iT{static prepare(e){if(e.scene==null)throw new Error("Model does not have a scene");if(e[RA])return e;const t=this[qc](e);return t[RA]=!0,t}static[qc](e){const{scene:t}=e,n=[t];return Object.assign(Object.assign({},e),{scene:t,scenes:n})}get parser(){return this[Jn].parser}get animations(){return this[Jn].animations}get scene(){return this[Jn].scene}get scenes(){return this[Jn].scenes}get cameras(){return this[Jn].cameras}get asset(){return this[Jn].asset}get userData(){return this[Jn].userData}constructor(e){this[Jn]=e}clone(){const e=this.constructor,t=this[Xc]();return new e(t)}dispose(){this.scenes.forEach(e=>{e.traverse(t=>{const n=t;if(!n.material)return;(Array.isArray(n.material)?n.material:[n.material]).forEach(s=>{for(const a in s){const o=s[a];if(o instanceof vt){const c=o.source.data;c.close!=null&&c.close(),o.dispose()}}s.dispose()}),n.geometry.dispose()})})}[Xc](){const e=this[Jn],t=nT(this.scene);sT(t,this.scene);const n=[t],i=e.userData?Object.assign({},e.userData):{};return Object.assign(Object.assign({},e),{scene:t,scenes:n,userData:i})}}const sT=(r,e)=>{z0(r,e,(t,n)=>{n.userData.variantMaterials!==void 0&&(t.userData.variantMaterials=new Map(n.userData.variantMaterials)),n.userData.variantData!==void 0&&(t.userData.variantData=n.userData.variantData),n.userData.originalMaterial!==void 0&&(t.userData.originalMaterial=n.userData.originalMaterial)})},z0=(r,e,t)=>{t(r,e);for(let n=0;n<r.children.length;n++)z0(r.children[n],e.children[n],t)},BA=Symbol("threeGLTF"),DA=Symbol("gltf"),LA=Symbol("gltfElementMap"),FA=Symbol("threeObjectMap"),PA=Symbol("parallelTraverseThreeScene"),UA=Symbol("correlateOriginalThreeGLTF"),NA=Symbol("correlateCloneThreeGLTF");class co{static from(e,t){return t!=null?this[NA](e,t):this[UA](e)}static[UA](e){const t=e.parser.json,n=e.parser.associations,i=new Map,s={name:"Default"},a={index:-1};for(const o of n.keys())o instanceof qn&&n.get(o)==null&&(a.index<0&&(t.materials==null&&(t.materials=[]),a.index=t.materials.length,t.materials.push(s)),o.name=s.name,n.set(o,{materials:a.index}));for(const[o,c]of n){c&&(o.userData=o.userData||{},o.userData.associations=c);for(const l in c)if(l!=null&&l!=="primitives"){const u=l,d=(t[u]||[])[c[u]];if(d==null)continue;let f=i.get(d);f==null&&(f=new Set,i.set(d,f)),f.add(o)}}return new co(e,t,n,i)}static[NA](e,t){const n=t.threeGLTF,i=t.gltf,s=JSON.parse(JSON.stringify(i)),a=new Map,o=new Map;for(let c=0;c<n.scenes.length;c++)this[PA](n.scenes[c],e.scenes[c],(l,u)=>{const h=t.threeObjectMap.get(l);if(h!=null){for(const d in h)if(d!=null&&d!=="primitives"){const f=d,A=h[f],g=s[f][A],m=a.get(u)||{};m[f]=A,a.set(u,m);const p=o.get(g)||new Set;p.add(u),o.set(g,p)}}});return new co(e,s,a,o)}static[PA](e,t,n){const i=(s,a)=>{if(n(s,a),s.isObject3D){const o=s,c=a;if(o.material)if(Array.isArray(o.material))for(let l=0;l<o.material.length;++l)n(o.material[l],c.material[l]);else n(o.material,c.material);for(let l=0;l<s.children.length;++l)i(s.children[l],a.children[l])}};i(e,t)}get threeGLTF(){return this[BA]}get gltf(){return this[DA]}get gltfElementMap(){return this[LA]}get threeObjectMap(){return this[FA]}constructor(e,t,n,i){this[BA]=e,this[DA]=t,this[LA]=i,this[FA]=n}}/* @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xa=Symbol("correlatedSceneGraph");class rT extends iT{static[qc](e){const t=super[qc](e);t[xa]==null&&(t[xa]=co.from(t));const{scene:n}=t,i=new Nn(void 0,1/0);return n.traverse(s=>{s.renderOrder=1e3,s.frustumCulled=!1,s.name||(s.name=s.uuid);const a=s;if(a.material){const{geometry:o}=a;a.castShadow=!0,a.isSkinnedMesh&&(o.boundingSphere=i,o.boundingBox=null);const c=a.material;if(c.isMeshBasicMaterial===!0&&(c.toneMapped=!1),c.shadowSide=Xn,c.aoMap){const{gltf:l,threeObjectMap:u}=t[xa],h=u.get(c);if(l.materials!=null&&h!=null&&h.materials!=null){const d=l.materials[h.materials];d.occlusionTexture&&d.occlusionTexture.texCoord===0&&o.attributes.uv!=null&&o.setAttribute("uv2",o.attributes.uv)}}}}),t}get correlatedSceneGraph(){return this[Jn][xa]}[Xc](){const e=super[Xc](),t=new Map;return e.scene.traverse(n=>{const i=n;if(i.material){const a=i.material;if(a!=null){if(t.has(a.uuid)){i.material=t.get(a.uuid);return}i.material=a.clone(),t.set(a.uuid,i.material)}}const s=n;s.target!==void 0&&s.add(s.target)}),e[xa]=co.from(e,this.correlatedSceneGraph),e}}const V0=(r,e,t)=>{let n;switch(r){case It:n=new Uint8ClampedArray(e*t*4);break;case Nt:n=new Uint16Array(e*t*4);break;case ts:n=new Uint32Array(e*t*4);break;case dd:n=new Int8Array(e*t*4);break;case fd:n=new Int16Array(e*t*4);break;case tl:n=new Int32Array(e*t*4);break;case Lt:n=new Float32Array(e*t*4);break;default:throw new Error("Unsupported data type")}return n};let rc;const aT=(r,e,t,n)=>{if(rc!==void 0)return rc;const i=new Pn(1,1,n);e.setRenderTarget(i);const s=new dt(new Fi,new Fn({color:16777215}));e.render(s,t),e.setRenderTarget(null);const a=V0(r,i.width,i.height);return e.readRenderTargetPixels(i,0,0,i.width,i.height,a),i.dispose(),s.geometry.dispose(),s.material.dispose(),rc=a[0]!==0,rc};class Fd{constructor(e){var t,n,i,s,a,o,c,l,u,h,d,f,A,g,m,p;this._rendererIsDisposable=!1,this._supportsReadPixels=!0,this.render=()=>{this._renderer.setRenderTarget(this._renderTarget);try{this._renderer.render(this._scene,this._camera)}catch(_){throw this._renderer.setRenderTarget(null),_}this._renderer.setRenderTarget(null)},this._width=e.width,this._height=e.height,this._type=e.type,this._colorSpace=e.colorSpace;const E={format:xt,depthBuffer:!1,stencilBuffer:!1,type:this._type,colorSpace:this._colorSpace,anisotropy:((t=e.renderTargetOptions)===null||t===void 0?void 0:t.anisotropy)!==void 0?(n=e.renderTargetOptions)===null||n===void 0?void 0:n.anisotropy:1,generateMipmaps:((i=e.renderTargetOptions)===null||i===void 0?void 0:i.generateMipmaps)!==void 0?(s=e.renderTargetOptions)===null||s===void 0?void 0:s.generateMipmaps:!1,magFilter:((a=e.renderTargetOptions)===null||a===void 0?void 0:a.magFilter)!==void 0?(o=e.renderTargetOptions)===null||o===void 0?void 0:o.magFilter:Ze,minFilter:((c=e.renderTargetOptions)===null||c===void 0?void 0:c.minFilter)!==void 0?(l=e.renderTargetOptions)===null||l===void 0?void 0:l.minFilter:Ze,samples:((u=e.renderTargetOptions)===null||u===void 0?void 0:u.samples)!==void 0?(h=e.renderTargetOptions)===null||h===void 0?void 0:h.samples:void 0,wrapS:((d=e.renderTargetOptions)===null||d===void 0?void 0:d.wrapS)!==void 0?(f=e.renderTargetOptions)===null||f===void 0?void 0:f.wrapS:Dt,wrapT:((A=e.renderTargetOptions)===null||A===void 0?void 0:A.wrapT)!==void 0?(g=e.renderTargetOptions)===null||g===void 0?void 0:g.wrapT:Dt};if(this._material=e.material,e.renderer?this._renderer=e.renderer:(this._renderer=Fd.instantiateRenderer(),this._rendererIsDisposable=!0),this._scene=new Os,this._camera=new ea,this._camera.position.set(0,0,10),this._camera.left=-.5,this._camera.right=.5,this._camera.top=.5,this._camera.bottom=-.5,this._camera.updateProjectionMatrix(),!aT(this._type,this._renderer,this._camera,E)){let _;switch(this._type){case Nt:_=this._renderer.extensions.has("EXT_color_buffer_float")?Lt:void 0;break}_!==void 0?(console.warn(`This browser does not support reading pixels from ${this._type} RenderTargets, switching to ${Lt}`),this._type=_):(this._supportsReadPixels=!1,console.warn("This browser dos not support toArray or toDataTexture, calls to those methods will result in an error thrown"))}this._quad=new dt(new Fi,this._material),this._quad.geometry.computeBoundingBox(),this._scene.add(this._quad),this._renderTarget=new Pn(this.width,this.height,E),this._renderTarget.texture.mapping=((m=e.renderTargetOptions)===null||m===void 0?void 0:m.mapping)!==void 0?(p=e.renderTargetOptions)===null||p===void 0?void 0:p.mapping:Qr}static instantiateRenderer(){const e=new $g;return e.setSize(128,128),e}toArray(){if(!this._supportsReadPixels)throw new Error("Can't read pixels in this browser");const e=V0(this._type,this._width,this._height);return this._renderer.readRenderTargetPixels(this._renderTarget,0,0,this._width,this._height,e),e}toDataTexture(e){const t=new uo(this.toArray(),this.width,this.height,xt,this._type,e?.mapping||Qr,e?.wrapS||Dt,e?.wrapT||Dt,e?.magFilter||Ze,e?.minFilter||Ze,e?.anisotropy||1,gt);return t.generateMipmaps=e?.generateMipmaps!==void 0?e?.generateMipmaps:!1,t}disposeOnDemandRenderer(){this._renderer.setRenderTarget(null),this._rendererIsDisposable&&(this._renderer.dispose(),this._renderer.forceContextLoss())}dispose(e){this.disposeOnDemandRenderer(),e&&this.renderTarget.dispose(),this.material instanceof In&&Object.values(this.material.uniforms).forEach(t=>{t.value instanceof vt&&t.value.dispose()}),Object.values(this.material).forEach(t=>{t instanceof vt&&t.dispose()}),this.material.dispose(),this._quad.geometry.dispose()}get width(){return this._width}set width(e){this._width=e,this._renderTarget.setSize(this._width,this._height)}get height(){return this._height}set height(e){this._height=e,this._renderTarget.setSize(this._width,this._height)}get renderer(){return this._renderer}get renderTarget(){return this._renderTarget}set renderTarget(e){this._renderTarget=e,this._width=e.width,this._height=e.height}get material(){return this._material}get type(){return this._type}get colorSpace(){return this._colorSpace}}const oT=`
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,cT=`
// min half float value
#define HALF_FLOAT_MIN vec3( -65504, -65504, -65504 )
// max half float value
#define HALF_FLOAT_MAX vec3( 65504, 65504, 65504 )

uniform sampler2D sdr;
uniform sampler2D gainMap;
uniform vec3 gamma;
uniform vec3 offsetHdr;
uniform vec3 offsetSdr;
uniform vec3 gainMapMin;
uniform vec3 gainMapMax;
uniform float weightFactor;

varying vec2 vUv;

void main() {
  vec3 rgb = texture2D( sdr, vUv ).rgb;
  vec3 recovery = texture2D( gainMap, vUv ).rgb;
  vec3 logRecovery = pow( recovery, gamma );
  vec3 logBoost = gainMapMin * ( 1.0 - logRecovery ) + gainMapMax * logRecovery;
  vec3 hdrColor = (rgb + offsetSdr) * exp2( logBoost * weightFactor ) - offsetHdr;
  vec3 clampedHdrColor = max( HALF_FLOAT_MIN, min( HALF_FLOAT_MAX, hdrColor ));
  gl_FragColor = vec4( clampedHdrColor , 1.0 );
}
`;class lT extends In{constructor({gamma:e,offsetHdr:t,offsetSdr:n,gainMapMin:i,gainMapMax:s,maxDisplayBoost:a,hdrCapacityMin:o,hdrCapacityMax:c,sdr:l,gainMap:u}){super({name:"GainMapDecoderMaterial",vertexShader:oT,fragmentShader:cT,uniforms:{sdr:{value:l},gainMap:{value:u},gamma:{value:new B(1/e[0],1/e[1],1/e[2])},offsetHdr:{value:new B().fromArray(t)},offsetSdr:{value:new B().fromArray(n)},gainMapMin:{value:new B().fromArray(i)},gainMapMax:{value:new B().fromArray(s)},weightFactor:{value:(Math.log2(a)-o)/(c-o)}},blending:ri,depthTest:!1,depthWrite:!1}),this._maxDisplayBoost=a,this._hdrCapacityMin=o,this._hdrCapacityMax=c,this.needsUpdate=!0,this.uniformsNeedUpdate=!0}get sdr(){return this.uniforms.sdr.value}set sdr(e){this.uniforms.sdr.value=e}get gainMap(){return this.uniforms.gainMap.value}set gainMap(e){this.uniforms.gainMap.value=e}get offsetHdr(){return this.uniforms.offsetHdr.value.toArray()}set offsetHdr(e){this.uniforms.offsetHdr.value.fromArray(e)}get offsetSdr(){return this.uniforms.offsetSdr.value.toArray()}set offsetSdr(e){this.uniforms.offsetSdr.value.fromArray(e)}get gainMapMin(){return this.uniforms.gainMapMin.value.toArray()}set gainMapMin(e){this.uniforms.gainMapMin.value.fromArray(e)}get gainMapMax(){return this.uniforms.gainMapMax.value.toArray()}set gainMapMax(e){this.uniforms.gainMapMax.value.fromArray(e)}get gamma(){const e=this.uniforms.gamma.value;return[1/e.x,1/e.y,1/e.z]}set gamma(e){const t=this.uniforms.gamma.value;t.x=1/e[0],t.y=1/e[1],t.z=1/e[2]}get hdrCapacityMin(){return this._hdrCapacityMin}set hdrCapacityMin(e){this._hdrCapacityMin=e,this.calculateWeight()}get hdrCapacityMax(){return this._hdrCapacityMax}set hdrCapacityMax(e){this._hdrCapacityMax=e,this.calculateWeight()}get maxDisplayBoost(){return this._maxDisplayBoost}set maxDisplayBoost(e){this._maxDisplayBoost=Math.max(1,Math.min(65504,e)),this.calculateWeight()}calculateWeight(){const e=(Math.log2(this._maxDisplayBoost)-this._hdrCapacityMin)/(this._hdrCapacityMax-this._hdrCapacityMin);this.uniforms.weightFactor.value=Math.max(0,Math.min(1,e))}}class W0 extends Error{}class q0 extends Error{}const va=(r,e,t)=>{const n=new RegExp(`${e}="([^"]*)"`,"i").exec(r);if(n)return n[1];const i=new RegExp(`<${e}[^>]*>([\\s\\S]*?)</${e}>`,"i").exec(r);if(i){const s=i[1].match(/<rdf:li>([^<]*)<\/rdf:li>/g);return s&&s.length===3?s.map(a=>a.replace(/<\/?rdf:li>/g,"")):i[1].trim()}if(t!==void 0)return t;throw new Error(`Can't find ${e} in gainmap metadata`)},hT=r=>{let e;typeof TextDecoder<"u"?e=new TextDecoder().decode(r):e=r.toString();let t=e.indexOf("<x:xmpmeta");for(;t!==-1;){const n=e.indexOf("x:xmpmeta>",t),i=e.slice(t,n+10);try{const s=va(i,"hdrgm:GainMapMin","0"),a=va(i,"hdrgm:GainMapMax"),o=va(i,"hdrgm:Gamma","1"),c=va(i,"hdrgm:OffsetSDR","0.015625"),l=va(i,"hdrgm:OffsetHDR","0.015625"),u=/hdrgm:HDRCapacityMin="([^"]*)"/.exec(i),h=u?u[1]:"0",d=/hdrgm:HDRCapacityMax="([^"]*)"/.exec(i);if(!d)throw new Error("Incomplete gainmap metadata");const f=d[1];return{gainMapMin:Array.isArray(s)?s.map(A=>parseFloat(A)):[parseFloat(s),parseFloat(s),parseFloat(s)],gainMapMax:Array.isArray(a)?a.map(A=>parseFloat(A)):[parseFloat(a),parseFloat(a),parseFloat(a)],gamma:Array.isArray(o)?o.map(A=>parseFloat(A)):[parseFloat(o),parseFloat(o),parseFloat(o)],offsetSdr:Array.isArray(c)?c.map(A=>parseFloat(A)):[parseFloat(c),parseFloat(c),parseFloat(c)],offsetHdr:Array.isArray(l)?l.map(A=>parseFloat(A)):[parseFloat(l),parseFloat(l),parseFloat(l)],hdrCapacityMin:parseFloat(h),hdrCapacityMax:parseFloat(f)}}catch{}t=e.indexOf("<x:xmpmeta",n)}};class uT{constructor(e){this.options={debug:e&&e.debug!==void 0?e.debug:!1,extractFII:e&&e.extractFII!==void 0?e.extractFII:!0,extractNonFII:e&&e.extractNonFII!==void 0?e.extractNonFII:!0}}extract(e){return new Promise((t,n)=>{const i=this.options.debug,s=new DataView(e.buffer);if(s.getUint16(0)!==65496){n(new Error("Not a valid jpeg"));return}const a=s.byteLength;let o=2,c=0,l;for(;o<a;){if(++c>250){n(new Error(`Found no marker after ${c} loops 😵`));return}if(s.getUint8(o)!==255){n(new Error(`Not a valid marker at offset 0x${o.toString(16)}, found: 0x${s.getUint8(o).toString(16)}`));return}if(l=s.getUint8(o+1),i&&console.log(`Marker: ${l.toString(16)}`),l===226){i&&console.log("Found APP2 marker (0xffe2)");const u=o+4;if(s.getUint32(u)===1297106432){const h=u+4;let d;if(s.getUint16(h)===18761)d=!1;else if(s.getUint16(h)===19789)d=!0;else{n(new Error("No valid endianness marker found in TIFF header"));return}if(s.getUint16(h+2,!d)!==42){n(new Error("Not valid TIFF data! (no 0x002A marker)"));return}const f=s.getUint32(h+4,!d);if(f<8){n(new Error("Not valid TIFF data! (First offset less than 8)"));return}const A=h+f,g=s.getUint16(A,!d),m=A+2;let p=0;for(let x=m;x<m+12*g;x+=12)s.getUint16(x,!d)===45057&&(p=s.getUint32(x+8,!d));const _=A+2+g*12+4,b=[];for(let x=_;x<_+p*16;x+=16){const I={MPType:s.getUint32(x,!d),size:s.getUint32(x+4,!d),dataOffset:s.getUint32(x+8,!d),dependantImages:s.getUint32(x+12,!d),start:-1,end:-1,isFII:!1};I.dataOffset?(I.start=h+I.dataOffset,I.isFII=!1):(I.start=0,I.isFII=!0),I.end=I.start+I.size,b.push(I)}if(this.options.extractNonFII&&b.length){const x=new Blob([s]),I=[];for(const M of b){if(M.isFII&&!this.options.extractFII)continue;const w=x.slice(M.start,M.end+1,"image/jpeg");I.push(w)}t(I)}}}o+=2+s.getUint16(o+2)}})}}const dT=async r=>{const e=hT(r);if(!e)throw new q0("Gain map XMP metadata not found");const n=await new uT({extractFII:!0,extractNonFII:!0}).extract(r);if(n.length!==2)throw new W0("Gain map recovery image not found");return{sdr:new Uint8Array(await n[0].arrayBuffer()),gainMap:new Uint8Array(await n[1].arrayBuffer()),metadata:e}},OA=r=>new Promise((e,t)=>{const n=document.createElement("img");n.onload=()=>{e(n)},n.onerror=i=>{t(i)},n.src=URL.createObjectURL(r)});class fT extends hi{constructor(e,t){super(t),e&&(this._renderer=e),this._internalLoadingManager=new Og}setRenderer(e){return this._renderer=e,this}setRenderTargetOptions(e){return this._renderTargetOptions=e,this}prepareQuadRenderer(){this._renderer||console.warn("WARNING: An existing WebGL Renderer was not passed to this Loader constructor or in setRenderer, the result of this Loader will need to be converted to a Data Texture with toDataTexture() before you can use it in your renderer.");const e=new lT({gainMapMax:[1,1,1],gainMapMin:[0,0,0],gamma:[1,1,1],offsetHdr:[1,1,1],offsetSdr:[1,1,1],hdrCapacityMax:1,hdrCapacityMin:0,maxDisplayBoost:1,gainMap:new vt,sdr:new vt});return new Fd({width:16,height:16,type:Nt,colorSpace:gt,material:e,renderer:this._renderer,renderTargetOptions:this._renderTargetOptions})}async render(e,t,n,i){const s=i?new Blob([i],{type:"image/jpeg"}):void 0,a=new Blob([n],{type:"image/jpeg"});let o,c,l=!1;if(typeof createImageBitmap>"u"){const d=await Promise.all([s?OA(s):Promise.resolve(void 0),OA(a)]);c=d[0],o=d[1],l=!0}else{const d=await Promise.all([s?createImageBitmap(s,{imageOrientation:"flipY"}):Promise.resolve(void 0),createImageBitmap(a,{imageOrientation:"flipY"})]);c=d[0],o=d[1]}const u=new vt(c||new ImageData(2,2),Qr,Dt,Dt,Ze,Zd,xt,It,1,gt);u.flipY=l,u.needsUpdate=!0;const h=new vt(o,Qr,Dt,Dt,Ze,Zd,xt,It,1,mt);h.flipY=l,h.needsUpdate=!0,e.width=o.width,e.height=o.height,e.material.gainMap=u,e.material.sdr=h,e.material.gainMapMin=t.gainMapMin,e.material.gainMapMax=t.gainMapMax,e.material.offsetHdr=t.offsetHdr,e.material.offsetSdr=t.offsetSdr,e.material.gamma=t.gamma,e.material.hdrCapacityMin=t.hdrCapacityMin,e.material.hdrCapacityMax=t.hdrCapacityMax,e.material.maxDisplayBoost=Math.pow(2,t.hdrCapacityMax),e.material.needsUpdate=!0,e.render()}}class pT extends fT{load(e,t,n,i){const s=this.prepareQuadRenderer(),a=new Di(this._internalLoadingManager);return a.setResponseType("arraybuffer"),a.setRequestHeader(this.requestHeader),a.setPath(this.path),a.setWithCredentials(this.withCredentials),this.manager.itemStart(e),a.load(e,async o=>{if(typeof o=="string")throw new Error("Invalid buffer, received [string], was expecting [ArrayBuffer]");const c=new Uint8Array(o);let l,u,h;try{const d=await dT(c);l=d.sdr,u=d.gainMap,h=d.metadata}catch(d){if(d instanceof q0||d instanceof W0)console.warn(`Failure to reconstruct an HDR image from ${e}: Gain map metadata not found in the file, HDRJPGLoader will render the SDR jpeg`),h={gainMapMin:[0,0,0],gainMapMax:[1,1,1],gamma:[1,1,1],hdrCapacityMin:0,hdrCapacityMax:1,offsetHdr:[0,0,0],offsetSdr:[0,0,0]},l=c;else throw d}try{await this.render(s,h,l,u)}catch(d){this.manager.itemError(e),typeof i=="function"&&i(d),s.disposeOnDemandRenderer();return}typeof t=="function"&&t(s),this.manager.itemEnd(e),s.disposeOnDemandRenderer()},n,o=>{this.manager.itemError(e),typeof i=="function"&&i(o)}),s}}class AT extends FE{constructor(e){super(e),this.type=Nt}parse(e){const a=function(w,v){switch(w){case 1:throw new Error("THREE.RGBELoader: Read Error: "+(v||""));case 2:throw new Error("THREE.RGBELoader: Write Error: "+(v||""));case 3:throw new Error("THREE.RGBELoader: Bad File Format: "+(v||""));default:case 4:throw new Error("THREE.RGBELoader: Memory Error: "+(v||""))}},h=function(w,v,y){v=v||1024;let k=w.pos,U=-1,F=0,H="",O=String.fromCharCode.apply(null,new Uint16Array(w.subarray(k,k+128)));for(;0>(U=O.indexOf(`
`))&&F<v&&k<w.byteLength;)H+=O,F+=O.length,k+=128,O+=String.fromCharCode.apply(null,new Uint16Array(w.subarray(k,k+128)));return-1<U?(w.pos+=F+U+1,H+O.slice(0,U)):!1},d=function(w){const v=/^#\?(\S+)/,y=/^\s*GAMMA\s*=\s*(\d+(\.\d+)?)\s*$/,T=/^\s*EXPOSURE\s*=\s*(\d+(\.\d+)?)\s*$/,k=/^\s*FORMAT=(\S+)\s*$/,U=/^\s*\-Y\s+(\d+)\s+\+X\s+(\d+)\s*$/,F={valid:0,string:"",comments:"",programtype:"RGBE",format:"",gamma:1,exposure:1,width:0,height:0};let H,O;for((w.pos>=w.byteLength||!(H=h(w)))&&a(1,"no header found"),(O=H.match(v))||a(3,"bad initial token"),F.valid|=1,F.programtype=O[1],F.string+=H+`
`;H=h(w),H!==!1;){if(F.string+=H+`
`,H.charAt(0)==="#"){F.comments+=H+`
`;continue}if((O=H.match(y))&&(F.gamma=parseFloat(O[1])),(O=H.match(T))&&(F.exposure=parseFloat(O[1])),(O=H.match(k))&&(F.valid|=2,F.format=O[1]),(O=H.match(U))&&(F.valid|=4,F.height=parseInt(O[1],10),F.width=parseInt(O[2],10)),F.valid&2&&F.valid&4)break}return F.valid&2||a(3,"missing format specifier"),F.valid&4||a(3,"missing image size specifier"),F},f=function(w,v,y){const T=v;if(T<8||T>32767||w[0]!==2||w[1]!==2||w[2]&128)return new Uint8Array(w);T!==(w[2]<<8|w[3])&&a(3,"wrong scanline width");const k=new Uint8Array(4*v*y);k.length||a(4,"unable to allocate buffer space");let U=0,F=0;const H=4*T,O=new Uint8Array(4),W=new Uint8Array(H);let Q=y;for(;Q>0&&F<w.byteLength;){F+4>w.byteLength&&a(1),O[0]=w[F++],O[1]=w[F++],O[2]=w[F++],O[3]=w[F++],(O[0]!=2||O[1]!=2||(O[2]<<8|O[3])!=T)&&a(3,"bad rgbe scanline format");let Y=0,Z;for(;Y<H&&F<w.byteLength;){Z=w[F++];const fe=Z>128;if(fe&&(Z-=128),(Z===0||Y+Z>H)&&a(3,"bad scanline data"),fe){const Be=w[F++];for(let Ge=0;Ge<Z;Ge++)W[Y++]=Be}else W.set(w.subarray(F,F+Z),Y),Y+=Z,F+=Z}const re=T;for(let fe=0;fe<re;fe++){let Be=0;k[U]=W[fe+Be],Be+=T,k[U+1]=W[fe+Be],Be+=T,k[U+2]=W[fe+Be],Be+=T,k[U+3]=W[fe+Be],U+=4}Q--}return k},A=function(w,v,y,T){const k=w[v+3],U=Math.pow(2,k-128)/255;y[T+0]=w[v+0]*U,y[T+1]=w[v+1]*U,y[T+2]=w[v+2]*U,y[T+3]=1},g=function(w,v,y,T){const k=w[v+3],U=Math.pow(2,k-128)/255;y[T+0]=Io.toHalfFloat(Math.min(w[v+0]*U,65504)),y[T+1]=Io.toHalfFloat(Math.min(w[v+1]*U,65504)),y[T+2]=Io.toHalfFloat(Math.min(w[v+2]*U,65504)),y[T+3]=Io.toHalfFloat(1)},m=new Uint8Array(e);m.pos=0;const p=d(m),E=p.width,_=p.height,b=f(m.subarray(m.pos),E,_);let x,I,M;switch(this.type){case Lt:M=b.length/4;const w=new Float32Array(M*4);for(let y=0;y<M;y++)A(b,y*4,w,y*4);x=w,I=Lt;break;case Nt:M=b.length/4;const v=new Uint16Array(M*4);for(let y=0;y<M;y++)g(b,y*4,v,y*4);x=v,I=Nt;break;default:throw new Error("THREE.RGBELoader: Unsupported type: "+this.type)}return{width:E,height:_,data:x,header:p.string,gamma:p.gamma,exposure:p.exposure,type:I}}setDataType(e){return this.type=e,this}load(e,t,n,i){function s(a,o){switch(a.type){case Lt:case Nt:a.colorSpace=gt,a.minFilter=Ze,a.magFilter=Ze,a.generateMipmaps=!1,a.flipY=!0;break}t&&t(a,o)}return super.load(e,s,n,i)}}/* @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mT={topLight:{intensity:500,position:[.418,16.199,.3]},room:{position:[-.757,13.219,.717],scale:[31.713,28.305,28.591]},boxes:[{position:[-10.906,2.009,1.846],rotation:-.195,scale:[2.328,7.905,4.651]},{position:[-5.607,-.754,-.758],rotation:.994,scale:[1.97,1.534,3.955]},{position:[6.167,.857,7.803],rotation:.561,scale:[3.927,6.285,3.687]},{position:[-2.017,.018,6.124],rotation:.333,scale:[2.002,4.566,2.064]},{position:[2.291,-.756,-2.621],rotation:-.286,scale:[1.546,1.552,1.496]},{position:[-2.193,-.369,-5.547],rotation:.516,scale:[3.875,3.487,2.986]}],lights:[{intensity:50,position:[-16.116,14.37,8.208],scale:[.1,2.428,2.739]},{intensity:50,position:[-16.109,18.021,-8.207],scale:[.1,2.425,2.751]},{intensity:17,position:[14.904,12.198,-1.832],scale:[.15,4.265,6.331]},{intensity:43,position:[-.462,8.89,14.52],scale:[4.38,5.441,.088]},{intensity:20,position:[3.235,11.486,-12.541],scale:[2.5,2,.1]},{intensity:100,position:[0,20,0],scale:[1,.1,1]}]},gT={topLight:{intensity:400,position:[.5,14,.5]},room:{position:[0,13.2,0],scale:[31.5,28.5,31.5]},boxes:[{position:[-10.906,-1,1.846],rotation:-.195,scale:[2.328,7.905,4.651]},{position:[-5.607,-.754,-.758],rotation:.994,scale:[1.97,1.534,3.955]},{position:[6.167,-.16,7.803],rotation:.561,scale:[3.927,6.285,3.687]},{position:[-2.017,.018,6.124],rotation:.333,scale:[2.002,4.566,2.064]},{position:[2.291,-.756,-2.621],rotation:-.286,scale:[1.546,1.552,1.496]},{position:[-2.193,-.369,-5.547],rotation:.516,scale:[3.875,3.487,2.986]}],lights:[{intensity:80,position:[-14,10,8],scale:[.1,2.5,2.5]},{intensity:80,position:[-14,14,-4],scale:[.1,2.5,2.5]},{intensity:23,position:[14,12,0],scale:[.1,5,5]},{intensity:16,position:[0,9,14],scale:[5,5,.1]},{intensity:80,position:[7,8,-14],scale:[2.5,2.5,.1]},{intensity:80,position:[-7,16,-14],scale:[2.5,2.5,.1]},{intensity:1,position:[0,20,0],scale:[.1,.1,.1]}]};class kA extends Os{constructor(e){super(),this.position.y=-3.5;const t=new Li;t.deleteAttribute("uv");const n=new so({metalness:0,side:jt}),i=new so({metalness:0}),s=e=="legacy"?mT:gT,a=new Qg(16777215,s.topLight.intensity,28,2);a.position.set(...s.topLight.position),this.add(a);const o=new dt(t,n);o.position.set(...s.room.position),o.scale.set(...s.room.scale),this.add(o);for(const c of s.boxes){const l=new dt(t,i);l.position.set(...c.position),l.rotation.set(0,c.rotation,0),l.scale.set(...c.scale),this.add(l)}for(const c of s.lights){const l=new dt(t,this.createAreaLightMaterial(c.intensity));l.position.set(...c.position),l.scale.set(...c.scale),this.add(l)}}createAreaLightMaterial(e){const t=new Fn;return t.color.setScalar(e),t}}/* @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bT=.04,fr=20,_T=/\.hdr(\.js)?$/;class QA{constructor(e){this.threeRenderer=e,this.lottieLoaderUrl="",this._ldrLoader=null,this._imageLoader=null,this._hdrLoader=null,this._lottieLoader=null,this.generatedEnvironmentMap=null,this.generatedEnvironmentMapAlt=null,this.skyboxCache=new Map,this.blurMaterial=null,this.blurScene=null}ldrLoader(e){return this._ldrLoader==null&&(this._ldrLoader=new kg),this._ldrLoader.setWithCredentials(e),this._ldrLoader}imageLoader(e){return this._imageLoader==null&&(this._imageLoader=new pT(this.threeRenderer)),this._imageLoader.setWithCredentials(e),this._imageLoader}hdrLoader(e){return this._hdrLoader==null&&(this._hdrLoader=new AT,this._hdrLoader.setDataType(Nt)),this._hdrLoader.setWithCredentials(e),this._hdrLoader}async getLottieLoader(e){if(this._lottieLoader==null){const{LottieLoader:t}=await import(this.lottieLoaderUrl);this._lottieLoader=new t}return this._lottieLoader.setWithCredentials(e),this._lottieLoader}async loadImage(e,t){const n=await new Promise((i,s)=>this.ldrLoader(t).load(e,i,()=>{},s));return n.name=e,n.flipY=!1,n}async loadLottie(e,t,n){const i=await this.getLottieLoader(n);i.setQuality(t);const s=await new Promise((a,o)=>i.load(e,a,()=>{},o));return s.name=e,s}async loadEquirect(e,t=!1,n=()=>{}){try{const i=_T.test(e),s=i?this.hdrLoader(t):this.imageLoader(t),a=await new Promise((o,c)=>s.load(e,l=>{const{renderTarget:u}=l;if(u!=null){const{texture:h}=u;l.dispose(!1),o(h)}else o(l)},l=>{n(l.loaded/l.total*.9)},c));return n(1),a.name=e,a.mapping=Bc,i||(a.colorSpace=mt),a}finally{n&&n(1)}}async generateEnvironmentMapAndSkybox(e=null,t=null,n=()=>{},i=!1){const s=t!=="legacy";(t==="legacy"||t==="neutral")&&(t=null),t=s0(t);let a=Promise.resolve(null),o;e&&(a=this.loadEquirectFromUrl(e,i,n)),t?o=this.loadEquirectFromUrl(t,i,n):e?o=this.loadEquirectFromUrl(e,i,n):o=s?this.loadGeneratedEnvironmentMapAlt():this.loadGeneratedEnvironmentMap();const[c,l]=await Promise.all([o,a]);if(c==null)throw new Error("Failed to load environment map.");return{environmentMap:c,skybox:l}}async loadEquirectFromUrl(e,t,n){if(!this.skyboxCache.has(e)){const i=this.loadEquirect(e,t,n);this.skyboxCache.set(e,i)}return this.skyboxCache.get(e)}async GenerateEnvironmentMap(e,t){await sI();const n=this.threeRenderer,i=new vd(256,{generateMipmaps:!1,type:Nt,format:xt,colorSpace:gt,depthBuffer:!0}),s=new zu(.1,100,i),a=s.renderTarget.texture;a.name=t;const o=n.outputColorSpace,c=n.toneMapping;return n.toneMapping=ai,n.outputColorSpace=gt,s.update(n,e),this.blurCubemap(i,bT),n.toneMapping=c,n.outputColorSpace=o,a}async loadGeneratedEnvironmentMap(){return this.generatedEnvironmentMap==null&&(this.generatedEnvironmentMap=this.GenerateEnvironmentMap(new kA("legacy"),"legacy")),this.generatedEnvironmentMap}async loadGeneratedEnvironmentMapAlt(){return this.generatedEnvironmentMapAlt==null&&(this.generatedEnvironmentMapAlt=this.GenerateEnvironmentMap(new kA("neutral"),"neutral")),this.generatedEnvironmentMapAlt}blurCubemap(e,t){if(this.blurMaterial==null){this.blurMaterial=this.getBlurShader(fr);const i=new Li,s=new dt(i,this.blurMaterial);this.blurScene=new Os,this.blurScene.add(s)}const n=e.clone();this.halfblur(e,n,t,"latitudinal"),this.halfblur(n,e,t,"longitudinal")}halfblur(e,t,n,i){const a=e.width,o=isFinite(n)?Math.PI/(2*a):2*Math.PI/(2*fr-1),c=n/o,l=isFinite(n)?1+Math.floor(3*c):fr;l>fr&&console.warn(`sigmaRadians, ${n}, is too large and will clip, as it requested ${l} samples when the maximum is set to ${fr}`);const u=[];let h=0;for(let A=0;A<fr;++A){const g=A/c,m=Math.exp(-g*g/2);u.push(m),A==0?h+=m:A<l&&(h+=2*m)}for(let A=0;A<u.length;A++)u[A]=u[A]/h;const d=this.blurMaterial.uniforms;d.envMap.value=e.texture,d.samples.value=l,d.weights.value=u,d.latitudinal.value=i==="latitudinal",d.dTheta.value=o,new zu(.1,100,t).update(this.threeRenderer,this.blurScene)}getBlurShader(e){const t=new Float32Array(e),n=new B(0,1,0);return new In({name:"SphericalGaussianBlur",defines:{n:e},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:t},latitudinal:{value:!1},dTheta:{value:0},poleAxis:{value:n}},vertexShader:`
      
      varying vec3 vOutputDirection;
  
      void main() {
  
        vOutputDirection = vec3( position );
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  
      }
    `,fragmentShader:`
        varying vec3 vOutputDirection;
  
        uniform samplerCube envMap;
        uniform int samples;
        uniform float weights[ n ];
        uniform bool latitudinal;
        uniform float dTheta;
        uniform vec3 poleAxis;
  
        vec3 getSample( float theta, vec3 axis ) {
  
          float cosTheta = cos( theta );
          // Rodrigues' axis-angle rotation
          vec3 sampleDirection = vOutputDirection * cosTheta
            + cross( axis, vOutputDirection ) * sin( theta )
            + axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );
  
          return vec3( textureCube( envMap, sampleDirection ) );
  
        }
  
        void main() {
  
          vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );
  
          if ( all( equal( axis, vec3( 0.0 ) ) ) ) {
  
            axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );
  
          }
  
          axis = normalize( axis );
  
          gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
          gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );
  
          for ( int i = 1; i < n; i++ ) {
  
            if ( i >= samples ) {
  
              break;
  
            }
  
            float theta = dTheta * float( i );
            gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
            gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );
  
          }
        }
      `,blending:ri,depthTest:!1,depthWrite:!1,side:jt})}async dispose(){for(const[,e]of this.skyboxCache)(await e).dispose();this.generatedEnvironmentMap!=null&&((await this.generatedEnvironmentMap).dispose(),this.generatedEnvironmentMap=null),this.generatedEnvironmentMapAlt!=null&&((await this.generatedEnvironmentMapAlt).dispose(),this.generatedEnvironmentMapAlt=null),this.blurMaterial!=null&&this.blurMaterial.dispose()}}/* @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ET=.2,Ch=40,Ih=60,GA=5,pr=[1,.79,.62,.5,.4,.31,.25],xT=3,HA="high-performance",vT=1.3;class Vn extends jn{static get singleton(){return this._singleton||(this._singleton=new Vn({powerPreference:(self.ModelViewerElement||{}).powerPreference||HA,debug:xp()})),this._singleton}static resetSingleton(){const e=this._singleton.dispose();for(const t of e)t.disconnectedCallback();this._singleton=new Vn({powerPreference:(self.ModelViewerElement||{}).powerPreference||HA,debug:xp()});for(const t of e)t.connectedCallback()}get canRender(){return this.threeRenderer!=null}get scaleFactor(){return pr[this.scaleStep]}set minScale(e){let t=1;for(;t<pr.length&&!(pr[t]<e);)++t;this.lastStep=t-1}constructor(e){super(),this.loader=new on(rT),this.width=0,this.height=0,this.dpr=1,this.scenes=new Set,this.multipleScenesVisible=!1,this.lastTick=performance.now(),this.renderedLastFrame=!1,this.scaleStep=0,this.lastStep=xT,this.avgFrameDuration=(Ih+Ch)/2,this.onWebGLContextLost=t=>{this.dispatchEvent({type:"contextlost",sourceEvent:t})},this.onWebGLContextRestored=()=>{var t;(t=this.textureUtils)===null||t===void 0||t.dispose(),this.textureUtils=new QA(this.threeRenderer);for(const n of this.scenes)n.element[Vc]()},this.dpr=window.devicePixelRatio,this.canvas3D=document.createElement("canvas"),this.canvas3D.id="webgl-canvas",this.canvas3D.classList.add("show");try{this.threeRenderer=new $g({canvas:this.canvas3D,alpha:!0,antialias:!0,powerPreference:e.powerPreference,preserveDrawingBuffer:!0}),this.threeRenderer.autoClear=!0,this.threeRenderer.setPixelRatio(1),this.threeRenderer.debug={checkShaderErrors:!!e.debug,onShaderError:null},this.threeRenderer.toneMapping=Xa}catch(t){console.warn(t)}this.arRenderer=new tT(this),this.textureUtils=this.canRender?new QA(this.threeRenderer):null,on.initializeKTX2Loader(this.threeRenderer),this.canvas3D.addEventListener("webglcontextlost",this.onWebGLContextLost),this.canvas3D.addEventListener("webglcontextrestored",this.onWebGLContextRestored),this.updateRendererSize()}registerScene(e){this.scenes.add(e),e.forceRescale();const t=new ke;this.threeRenderer.getSize(t),e.canvas.width=t.x,e.canvas.height=t.y,this.canRender&&this.scenes.size>0&&this.threeRenderer.setAnimationLoop((n,i)=>this.render(n,i))}unregisterScene(e){this.scenes.delete(e),this.canvas3D.parentElement===e.canvas.parentElement&&e.canvas.parentElement.removeChild(this.canvas3D),this.canRender&&this.scenes.size===0&&this.threeRenderer.setAnimationLoop(null)}displayCanvas(e){return e.element.modelIsVisible&&!this.multipleScenesVisible?this.canvas3D:e.element[sd]}countVisibleScenes(){const{canvas3D:e}=this;let t=0,n=null;for(const s of this.scenes){const{element:a}=s;a.modelIsVisible&&s.externalRenderer==null&&++t,e.parentElement===s.canvas.parentElement&&(n=s)}const i=t>1;if(n!=null){const s=i&&!this.multipleScenesVisible,a=!n.element.modelIsVisible;if(s||a){const{width:o,height:c}=this.sceneSize(n);this.copyPixels(n,o,c),e.parentElement.removeChild(e)}}this.multipleScenesVisible=i}updateRendererSize(){var e;const t=window.devicePixelRatio;if(t!==this.dpr)for(const s of this.scenes){const{element:a}=s;a[yr](a.getBoundingClientRect())}let n=0,i=0;for(const s of this.scenes)n=Math.max(n,s.width),i=Math.max(i,s.height);if(!(n===this.width&&i===this.height&&t===this.dpr)){this.width=n,this.height=i,this.dpr=t,n=Math.ceil(n*t),i=Math.ceil(i*t),this.canRender&&this.threeRenderer.setSize(n,i,!1);for(const s of this.scenes){const{canvas:a}=s;a.width=n,a.height=i,s.forceRescale(),(e=s.effectRenderer)===null||e===void 0||e.setSize(n,i)}}}updateRendererScale(e){const t=this.scaleStep;this.avgFrameDuration+=ni(ET*(e-this.avgFrameDuration),-GA,GA),this.avgFrameDuration>Ih?++this.scaleStep:this.avgFrameDuration<Ch&&this.scaleStep>0&&--this.scaleStep,this.scaleStep=Math.min(this.scaleStep,this.lastStep),t!==this.scaleStep&&(this.avgFrameDuration=(Ih+Ch)/2)}shouldRender(e){if(e.shouldRender())e.scaleStep!=this.scaleStep&&(e.scaleStep=this.scaleStep,this.rescaleCanvas(e));else if(e.scaleStep!=0)e.scaleStep=0,this.rescaleCanvas(e);else return!1;return!0}rescaleCanvas(e){const t=pr[e.scaleStep],n=Math.ceil(this.width/t),i=Math.ceil(this.height/t),{style:s}=e.canvas;s.width=`${n}px`,s.height=`${i}px`,this.canvas3D.style.width=`${n}px`,this.canvas3D.style.height=`${i}px`;const a=this.dpr*t,o=t<1?"GPU throttling":this.dpr!==window.devicePixelRatio?"No meta viewport tag":"";e.element.dispatchEvent(new CustomEvent("render-scale",{detail:{reportedDpr:window.devicePixelRatio,renderedDpr:a,minimumDpr:this.dpr*pr[this.lastStep],pixelWidth:Math.ceil(e.width*a),pixelHeight:Math.ceil(e.height*a),reason:o}}))}sceneSize(e){const{dpr:t}=this,n=pr[e.scaleStep],i=Math.min(Math.ceil(e.width*n*t),this.canvas3D.width),s=Math.min(Math.ceil(e.height*n*t),this.canvas3D.height);return{width:i,height:s}}copyPixels(e,t,n){const i=e.context;if(i==null){console.log("could not acquire 2d context");return}i.clearRect(0,0,t,n),i.drawImage(this.canvas3D,0,0,t,n,0,0,t,n),e.canvas.classList.add("show")}orderedScenes(){const e=[];for(const t of[!1,!0])for(const n of this.scenes)n.element.modelIsVisible===t&&e.push(n);return e}get isPresenting(){return this.arRenderer.isPresenting}preRender(e,t,n){const{element:i,exposure:s,toneMapping:a}=e;i[oi](t,n);const o=typeof s=="number"&&!Number.isNaN(s),c=i.environmentImage,l=i.skyboxImage,u=a===Xa&&(c==="neutral"||c==="legacy"||!c&&!l);this.threeRenderer.toneMappingExposure=(o?s:1)*(u?vT:1)}render(e,t){if(t!=null){this.arRenderer.onWebXRFrame(e,t);return}const n=e-this.lastTick;if(this.lastTick=e,!this.canRender||this.isPresenting)return;this.countVisibleScenes(),this.updateRendererSize(),this.renderedLastFrame&&(this.updateRendererScale(n),this.renderedLastFrame=!1);const{canvas3D:i}=this;for(const s of this.orderedScenes()){const{element:a}=s;if(!a.loaded||!a.modelIsVisible&&s.renderCount>0||(this.preRender(s,e,n),!this.shouldRender(s)))continue;if(s.externalRenderer!=null){const l=s.getCamera();l.updateMatrix();const{matrix:u,projectionMatrix:h}=l,d=u.elements.slice(),f=s.getTarget();d[12]+=f.x,d[13]+=f.y,d[14]+=f.z,s.externalRenderer.render({viewMatrix:d,projectionMatrix:h.elements});continue}if(!a.modelIsVisible&&!this.multipleScenesVisible)for(const l of this.scenes)l.element.modelIsVisible&&l.queueRender();const{width:o,height:c}=this.sceneSize(s);s.renderShadow(this.threeRenderer),this.threeRenderer.setRenderTarget(null),this.threeRenderer.setViewport(0,Math.ceil(this.height*this.dpr)-c,o,c),s.effectRenderer!=null?s.effectRenderer.render(n):(this.threeRenderer.autoClear=!0,this.threeRenderer.toneMapping=s.toneMapping,this.threeRenderer.render(s,s.camera)),this.multipleScenesVisible||!s.element.modelIsVisible&&s.renderCount===0?this.copyPixels(s,o,c):i.parentElement!==s.canvas.parentElement&&(s.canvas.parentElement.appendChild(i),s.canvas.classList.remove("show")),s.hasRendered(),++s.renderCount,this.renderedLastFrame=!0}}dispose(){this.textureUtils!=null&&this.textureUtils.dispose(),this.threeRenderer!=null&&this.threeRenderer.dispose(),this.textureUtils=null,this.threeRenderer=null;const e=[];for(const t of this.scenes)e.push(t.element);return this.canvas3D.removeEventListener("webglcontextlost",this.onWebGLContextLost),this.canvas3D.removeEventListener("webglcontextrestored",this.onWebGLContextRestored),e}}/* @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const We=Symbol("correlatedObjects"),at=Symbol("onUpdate");class po{constructor(e,t){this[at]=e,this[We]=t}}/* @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zA=new Fn,yT=new Fi(2,2);let ST=0;const an=Symbol("threeTexture"),VA=Symbol("threeTextures");class CT extends po{get[an](){var e;return(e=this[We])===null||e===void 0?void 0:e.values().next().value}get[VA](){return this[We]}constructor(e,t){super(e,new Set(t?[t]:[])),this[an].image.src||(this[an].image.src=t.name?t.name:"adhoc_image"+ST++),this[an].image.name||(this[an].image.name=t&&t.image&&t.image.src?t.image.src.split("/").pop():"adhoc_image")}get name(){return this[an].image.name||""}get uri(){return this[an].image.src}get bufferView(){return this[an].image.bufferView}get element(){const e=this[an];if(e&&(e.isCanvasTexture||e.isVideoTexture))return e.image}get animation(){const e=this[an];if(e&&e.isCanvasTexture&&e.animation)return e.animation}get type(){return this.uri!=null?"external":"embedded"}set name(e){for(const t of this[VA])t.image.name=e}update(){const e=this[an];e&&e.isCanvasTexture&&!e.animation&&(this[an].needsUpdate=!0,this[at]())}async createThumbnail(e,t){const n=new Os;zA.map=this[an];const i=new dt(yT,zA);n.add(i);const s=new ea(-1,1,1,-1,0,1),{threeRenderer:a}=Vn.singleton,o=new Pn(e,t);a.setRenderTarget(o),a.render(n,s),a.setRenderTarget(null);const c=new Uint8Array(e*t*4);a.readRenderTargetPixels(o,0,0,e,t,c),Ji.width=e,Ji.height=t;const l=Ji.getContext("2d"),u=l.createImageData(e,t);return u.data.set(c),l.putImageData(u,0,0),new Promise(async(h,d)=>{Ji.toBlob(f=>{if(!f)return d("Failed to capture thumbnail.");h(URL.createObjectURL(f))},"image/png")})}}var Vt;(function(r){r[r.Nearest=9728]="Nearest",r[r.Linear=9729]="Linear",r[r.NearestMipmapNearest=9984]="NearestMipmapNearest",r[r.LinearMipmapNearest=9985]="LinearMipmapNearest",r[r.NearestMipmapLinear=9986]="NearestMipmapLinear",r[r.LinearMipmapLinear=9987]="LinearMipmapLinear"})(Vt||(Vt={}));var es;(function(r){r[r.ClampToEdge=33071]="ClampToEdge",r[r.MirroredRepeat=33648]="MirroredRepeat",r[r.Repeat=10497]="Repeat"})(es||(es={}));/* @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const WA=new Map([[es.Repeat,$n],[es.ClampToEdge,Dt],[es.MirroredRepeat,Ns]]),Zu=new Map([[$n,es.Repeat],[Dt,es.ClampToEdge],[Ns,es.MirroredRepeat]]),IT=new Map([[Vt.Nearest,Ot],[Vt.Linear,Ze],[Vt.NearestMipmapNearest,lo],[Vt.LinearMipmapNearest,Rs],[Vt.NearestMipmapLinear,ji],[Vt.LinearMipmapLinear,hn]]),X0=new Map([[Ot,Vt.Nearest],[Ze,Vt.Linear],[lo,Vt.NearestMipmapNearest],[Rs,Vt.LinearMipmapNearest],[ji,Vt.NearestMipmapLinear],[hn,Vt.LinearMipmapLinear]]),MT=new Map([[Vt.Nearest,Ot],[Vt.Linear,Ze]]),$0=new Map([[Ot,Vt.Nearest],[Ze,Vt.Linear]]),wT=r=>X0.has(r),TT=r=>$0.has(r),RT=r=>Zu.has(r),BT=(r,e)=>{switch(r){case"minFilter":return wT(e);case"magFilter":return TT(e);case"wrapS":case"wrapT":return RT(e);case"rotation":case"repeat":case"offset":return!0;default:throw new Error(`Cannot configure property "${r}" on Sampler`)}},xi=Symbol("threeTexture"),qA=Symbol("threeTextures"),Hi=Symbol("setProperty");class DT extends po{get[xi](){var e;return(e=this[We])===null||e===void 0?void 0:e.values().next().value}get[qA](){return this[We]}constructor(e,t){super(e,new Set(t?[t]:[]))}get name(){return this[xi].name||""}get minFilter(){return X0.get(this[xi].minFilter)}get magFilter(){return $0.get(this[xi].magFilter)}get wrapS(){return Zu.get(this[xi].wrapS)}get wrapT(){return Zu.get(this[xi].wrapT)}get rotation(){return this[xi].rotation}get scale(){return rd(this[xi].repeat)}get offset(){return rd(this[xi].offset)}setMinFilter(e){this[Hi]("minFilter",IT.get(e))}setMagFilter(e){this[Hi]("magFilter",MT.get(e))}setWrapS(e){this[Hi]("wrapS",WA.get(e))}setWrapT(e){this[Hi]("wrapT",WA.get(e))}setRotation(e){e==null&&(e=0),this[Hi]("rotation",e)}setScale(e){e==null&&(e={u:1,v:1}),this[Hi]("repeat",new ke(e.u,e.v))}setOffset(e){e==null&&(e={u:0,v:0}),this[Hi]("offset",new ke(e.u,e.v))}[Hi](e,t){if(BT(e,t))for(const n of this[qA])n[e]=t,n.needsUpdate=!0;this[at]()}}/* @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const XA=Symbol("image"),$A=Symbol("sampler"),jA=Symbol("threeTexture");class j0 extends po{get[jA](){var e;return(e=this[We])===null||e===void 0?void 0:e.values().next().value}constructor(e,t){super(e,new Set(t?[t]:[])),this[$A]=new DT(e,t),this[XA]=new CT(e,t)}get name(){return this[jA].name||""}set name(e){for(const t of this[We])t.name=e}get sampler(){return this[$A]}get source(){return this[XA]}}/* @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Y0,K0,J0;const xs=Symbol("texture"),vs=Symbol("transform"),Mh=Symbol("materials"),YA=Symbol("usage"),Ar=Symbol("onUpdate"),Na=Symbol("activeVideo");var Pe;(function(r){r[r.Base=0]="Base",r[r.MetallicRoughness=1]="MetallicRoughness",r[r.Normal=2]="Normal",r[r.Occlusion=3]="Occlusion",r[r.Emissive=4]="Emissive",r[r.Clearcoat=5]="Clearcoat",r[r.ClearcoatRoughness=6]="ClearcoatRoughness",r[r.ClearcoatNormal=7]="ClearcoatNormal",r[r.SheenColor=8]="SheenColor",r[r.SheenRoughness=9]="SheenRoughness",r[r.Transmission=10]="Transmission",r[r.Thickness=11]="Thickness",r[r.Specular=12]="Specular",r[r.SpecularColor=13]="SpecularColor",r[r.Iridescence=14]="Iridescence",r[r.IridescenceThickness=15]="IridescenceThickness",r[r.Anisotropy=16]="Anisotropy"})(Pe||(Pe={}));class wr{constructor(e,t,n,i){this[Y0]=null,this[K0]={rotation:0,scale:new ke(1,1),offset:new ke(0,0)},this[J0]=!1,n&&(this[vs].rotation=n.rotation,this[vs].scale.copy(n.repeat),this[vs].offset.copy(n.offset),this[xs]=new j0(e,n)),this[Ar]=e,this[Mh]=i,this[YA]=t}get texture(){return this[xs]}setTexture(e){var t,n;const i=e!=null?e.source[an]:null,s=(t=this[xs])===null||t===void 0?void 0:t.source[an];if(s!=null&&s.isVideoTexture?this[Na]=!1:!((n=this[xs])===null||n===void 0)&&n.source.animation&&this[xs].source.animation.removeEventListener("enterFrame",this[Ar]),this[xs]=e,i!=null&&i.isVideoTexture){const o=i.image;if(this[Na]=!0,o.requestVideoFrameCallback!=null){const c=()=>{this[Na]&&(this[Ar](),o.requestVideoFrameCallback(c))};o.requestVideoFrameCallback(c)}else{const c=()=>{this[Na]&&(this[Ar](),requestAnimationFrame(c))};requestAnimationFrame(c)}}else e?.source.animation!=null&&e.source.animation.addEventListener("enterFrame",this[Ar]);let a=mt;if(this[Mh])for(const o of this[Mh]){switch(this[YA]){case Pe.Base:o.map=i;break;case Pe.MetallicRoughness:a=gt,o.metalnessMap=i,o.roughnessMap=i;break;case Pe.Normal:a=gt,o.normalMap=i;break;case Pe.Occlusion:a=gt,o.aoMap=i;break;case Pe.Emissive:o.emissiveMap=i;break;case Pe.Clearcoat:o.clearcoatMap=i;break;case Pe.ClearcoatRoughness:o.clearcoatRoughnessMap=i;break;case Pe.ClearcoatNormal:o.clearcoatNormalMap=i;break;case Pe.SheenColor:o.sheenColorMap=i;break;case Pe.SheenRoughness:o.sheenRoughnessMap=i;break;case Pe.Transmission:o.transmissionMap=i;break;case Pe.Thickness:o.thicknessMap=i;break;case Pe.Specular:o.specularIntensityMap=i;break;case Pe.SpecularColor:o.specularColorMap=i;break;case Pe.Iridescence:o.iridescenceMap=i;break;case Pe.IridescenceThickness:o.iridescenceThicknessMap=i;break;case Pe.Anisotropy:o.anisotropyMap=i;break}o.needsUpdate=!0}i&&(i.colorSpace=a,i.rotation=this[vs].rotation,i.repeat=this[vs].scale,i.offset=this[vs].offset),this[Ar]()}}Y0=xs,K0=vs,J0=Na;/* @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ya=Symbol("threeMaterial"),ac=Symbol("threeMaterials"),KA=Symbol("baseColorTexture"),JA=Symbol("metallicRoughnessTexture");class LT extends po{get[ac](){return this[We]}get[ya](){var e;return(e=this[We])===null||e===void 0?void 0:e.values().next().value}constructor(e,t){super(e,t);const{map:n,metalnessMap:i}=t.values().next().value;this[KA]=new wr(e,Pe.Base,n,t),this[JA]=new wr(e,Pe.MetallicRoughness,i,t)}get baseColorFactor(){const e=[0,0,0,this[ya].opacity];return this[ya].color.toArray(e),e}get metallicFactor(){return this[ya].metalness}get roughnessFactor(){return this[ya].roughness}get baseColorTexture(){return this[KA]}get metallicRoughnessTexture(){return this[JA]}setBaseColorFactor(e){const t=new Me;e instanceof Array?t.fromArray(e):t.set(e);for(const n of this[ac])n.color.set(t),e instanceof Array&&e.length>3?n.opacity=e[3]:(e=[0,0,0,n.opacity],t.toArray(e));this[at]()}setMetallicFactor(e){for(const t of this[ac])t.metalness=e;this[at]()}setRoughnessFactor(e){for(const t of this[ac])t.roughness=e;this[at]()}}/* @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var ZA,em;const tm=Symbol("pbrMetallicRoughness"),nm=Symbol("normalTexture"),im=Symbol("occlusionTexture"),sm=Symbol("emissiveTexture"),_t=Symbol("backingThreeMaterial"),rm=Symbol("applyAlphaCutoff"),wh=Symbol("getAlphaMode"),mr=Symbol("lazyLoadGLTFInfo"),Th=Symbol("initialize"),ed=Symbol("getLoadedMaterial"),Ae=Symbol("ensureMaterialIsLoaded"),am=Symbol("gltfIndex"),Oa=Symbol("setActive"),Nr=Symbol("variantIndices"),Rh=Symbol("isActive"),om=Symbol("modelVariants"),Bh=Symbol("name"),fn=Symbol("pbrTextures");class Dh extends po{get[(ZA=Nr,em=fn,_t)](){return this[We].values().next().value}constructor(e,t,n,i,s,a,o=void 0){super(e,s),this[ZA]=new Set,this[em]=new Map,this[am]=t,this[Rh]=n,this[om]=i,this[Bh]=a,o==null?this[Th]():this[mr]=o}[Th](){const e=this[at],t=this[We];this[tm]=new LT(e,t);const{normalMap:n,aoMap:i,emissiveMap:s}=t.values().next().value;this[nm]=new wr(e,Pe.Normal,n,t),this[im]=new wr(e,Pe.Occlusion,i,t),this[sm]=new wr(e,Pe.Emissive,s,t);const a=o=>{this[fn].set(o,new wr(e,o,null,t))};a(Pe.Clearcoat),a(Pe.ClearcoatRoughness),a(Pe.ClearcoatNormal),a(Pe.SheenColor),a(Pe.SheenRoughness),a(Pe.Transmission),a(Pe.Thickness),a(Pe.Specular),a(Pe.SpecularColor),a(Pe.Iridescence),a(Pe.IridescenceThickness),a(Pe.Anisotropy)}async[ed](){if(this[mr]!=null){const e=await this[mr].doLazyLoad();return this[Th](),this[mr]=void 0,this.ensureLoaded=async()=>{},e}return null}colorFromRgb(e){const t=new Me;return e instanceof Array?t.fromArray(e):t.set(e),t}[Ae](){if(this[mr]!=null)throw new Error(`Material "${this.name}" has not been loaded, call 'await
    myMaterial.ensureLoaded()' before using an unloaded material.`)}async ensureLoaded(){await this[ed]()}get isLoaded(){return this[mr]==null}get isActive(){return this[Rh]}[Oa](e){this[Rh]=e}get name(){return this[Bh]||""}set name(e){if(this[Bh]=e,this[We]!=null)for(const t of this[We])t.name=e}get pbrMetallicRoughness(){return this[Ae](),this[tm]}get normalTexture(){return this[Ae](),this[nm]}get occlusionTexture(){return this[Ae](),this[im]}get emissiveTexture(){return this[Ae](),this[sm]}get emissiveFactor(){return this[Ae](),this[_t].emissive.toArray()}get index(){return this[am]}hasVariant(e){const t=this[om].get(e);return t!=null&&this[Nr].has(t.index)}setEmissiveFactor(e){this[Ae]();const t=this.colorFromRgb(e);for(const n of this[We])n.emissive.set(t);this[at]()}[wh](){return this[_t].transparent?"BLEND":this[_t].alphaTest>0?"MASK":"OPAQUE"}[rm](){this[Ae]();for(const e of this[We])this[wh]()==="MASK"?e.alphaTest==null&&(e.alphaTest=.5):e.alphaTest=void 0,e.needsUpdate=!0}setAlphaCutoff(e){this[Ae]();for(const t of this[We])t.alphaTest=e,t.needsUpdate=!0;this[rm](),this[at]()}getAlphaCutoff(){return this[Ae](),this[_t].alphaTest}setDoubleSided(e){this[Ae]();for(const t of this[We])t.side=e?Wt:Xn,t.needsUpdate=!0;this[at]()}getDoubleSided(){return this[Ae](),this[_t].side==Wt}setAlphaMode(e){this[Ae]();const t=(n,i)=>{n.transparent=i,n.depthWrite=!i};for(const n of this[We])t(n,e==="BLEND"),e==="MASK"?n.alphaTest=.5:n.alphaTest=void 0,n.needsUpdate=!0;this[at]()}getAlphaMode(){return this[Ae](),this[wh]()}get emissiveStrength(){return this[Ae](),this[_t].emissiveIntensity}setEmissiveStrength(e){this[Ae]();for(const t of this[We])t.emissiveIntensity=e;this[at]()}get clearcoatFactor(){return this[Ae](),this[_t].clearcoat}get clearcoatRoughnessFactor(){return this[Ae](),this[_t].clearcoatRoughness}get clearcoatTexture(){return this[Ae](),this[fn].get(Pe.Clearcoat)}get clearcoatRoughnessTexture(){return this[Ae](),this[fn].get(Pe.ClearcoatRoughness)}get clearcoatNormalTexture(){return this[Ae](),this[fn].get(Pe.ClearcoatNormal)}get clearcoatNormalScale(){return this[Ae](),this[_t].clearcoatNormalScale.x}setClearcoatFactor(e){this[Ae]();for(const t of this[We])t.clearcoat=e;this[at]()}setClearcoatRoughnessFactor(e){this[Ae]();for(const t of this[We])t.clearcoatRoughness=e;this[at]()}setClearcoatNormalScale(e){this[Ae]();for(const t of this[We])t.clearcoatNormalScale=new ke(e,e);this[at]()}get ior(){return this[Ae](),this[_t].ior}setIor(e){this[Ae]();for(const t of this[We])t.ior=e;this[at]()}get sheenColorFactor(){return this[Ae](),this[_t].sheenColor.toArray()}get sheenColorTexture(){return this[Ae](),this[fn].get(Pe.SheenColor)}get sheenRoughnessFactor(){return this[Ae](),this[_t].sheenRoughness}get sheenRoughnessTexture(){return this[Ae](),this[fn].get(Pe.SheenRoughness)}setSheenColorFactor(e){this[Ae]();const t=this.colorFromRgb(e);for(const n of this[We])n.sheenColor.set(t),n.sheen=1;this[at]()}setSheenRoughnessFactor(e){this[Ae]();for(const t of this[We])t.sheenRoughness=e,t.sheen=1;this[at]()}get transmissionFactor(){return this[Ae](),this[_t].transmission}get transmissionTexture(){return this[Ae](),this[fn].get(Pe.Transmission)}setTransmissionFactor(e){this[Ae]();for(const t of this[We])t.transmission=e;this[at]()}get thicknessFactor(){return this[Ae](),this[_t].thickness}get thicknessTexture(){return this[Ae](),this[fn].get(Pe.Thickness)}get attenuationDistance(){return this[Ae](),this[_t].attenuationDistance}get attenuationColor(){return this[Ae](),this[_t].attenuationColor.toArray()}setThicknessFactor(e){this[Ae]();for(const t of this[We])t.thickness=e;this[at]()}setAttenuationDistance(e){this[Ae]();for(const t of this[We])t.attenuationDistance=e;this[at]()}setAttenuationColor(e){this[Ae]();const t=this.colorFromRgb(e);for(const n of this[We])n.attenuationColor.set(t);this[at]()}get specularFactor(){return this[Ae](),this[_t].specularIntensity}get specularTexture(){return this[Ae](),this[fn].get(Pe.Specular)}get specularColorFactor(){return this[Ae](),this[_t].specularColor.toArray()}get specularColorTexture(){return this[Ae](),this[fn].get(Pe.SheenColor)}setSpecularFactor(e){this[Ae]();for(const t of this[We])t.specularIntensity=e;this[at]()}setSpecularColorFactor(e){this[Ae]();const t=this.colorFromRgb(e);for(const n of this[We])n.specularColor.set(t);this[at]()}get iridescenceFactor(){return this[Ae](),this[_t].iridescence}get iridescenceTexture(){return this[Ae](),this[fn].get(Pe.Iridescence)}get iridescenceIor(){return this[Ae](),this[_t].iridescenceIOR}get iridescenceThicknessMinimum(){return this[Ae](),this[_t].iridescenceThicknessRange[0]}get iridescenceThicknessMaximum(){return this[Ae](),this[_t].iridescenceThicknessRange[1]}get iridescenceThicknessTexture(){return this[Ae](),this[fn].get(Pe.IridescenceThickness)}setIridescenceFactor(e){this[Ae]();for(const t of this[We])t.iridescence=e;this[at]()}setIridescenceIor(e){this[Ae]();for(const t of this[We])t.iridescenceIOR=e;this[at]()}setIridescenceThicknessMinimum(e){this[Ae]();for(const t of this[We])t.iridescenceThicknessRange[0]=e;this[at]()}setIridescenceThicknessMaximum(e){this[Ae]();for(const t of this[We])t.iridescenceThicknessRange[1]=e;this[at]()}get anisotropyStrength(){return this[Ae](),this[_t].anisotropy}get anisotropyRotation(){return this[Ae](),this[_t].anisotropyRotation}get anisotropyTexture(){return this[Ae](),this[fn].get(Pe.Anisotropy)}setAnisotropyStrength(e){this[Ae]();for(const t of this[We])t.anisotropy=e;this[at]()}setAnisotropyRotation(e){this[Ae]();for(const t of this[We])t.anisotropyRotation=e;this[at]()}}let Z0=class{constructor(e){this.name="",this.children=new Array,this.name=e}};class Lh extends Z0{constructor(e,t,n,i){super(e.name),this.materials=new Map,this.variantToMaterialMap=new Map,this.initialMaterialIdx=0,this.activeMaterialIdx=0,this.mesh=e;const{gltf:s,threeGLTF:a,threeObjectMap:o}=i;this.parser=a.parser,this.modelVariants=n,this.mesh.userData.variantData=n;const c=o.get(e.material);c.materials!=null?this.initialMaterialIdx=this.activeMaterialIdx=c.materials:console.error(`Primitive (${e.name}) missing initial material reference.`);const l=e.userData.associations||{};if(l.meshes==null){console.error("Mesh is missing primitive index association");return}const d=((s.meshes||[])[l.meshes].primitives||[])[l.primitives];if(d==null){console.error("Mesh primitive definition is missing.");return}if(d.material!=null)this.materials.set(d.material,t[d.material]);else{const f=t.findIndex(A=>A.name==="Default");f>=0?this.materials.set(f,t[f]):console.warn("gltfPrimitive has no material!")}if(d.extensions&&d.extensions.KHR_materials_variants){const f=d.extensions.KHR_materials_variants,g=a.parser.json.extensions.KHR_materials_variants.variants;for(const m of f.mappings){const p=t[m.material];this.materials.set(m.material,p);for(const E of m.variants){const{name:_}=g[E];this.variantToMaterialMap.set(E,p),p[Nr].add(E),n.has(_)||n.set(_,{name:_,index:E})}}}}async setActiveMaterial(e){const t=this.materials.get(e);if(e!==this.activeMaterialIdx){const n=t[We],i=await t[ed]();i!=null?this.mesh.material=i:this.mesh.material=n.values().next().value,this.parser.assignFinalMaterial(this.mesh),n.add(this.mesh.material),this.activeMaterialIdx=e}return this.mesh.material}getActiveMaterial(){return this.materials.get(this.activeMaterialIdx)}getMaterial(e){return this.materials.get(e)}async enableVariant(e){if(e==null)return this.setActiveMaterial(this.initialMaterialIdx);if(this.variantToMaterialMap!=null&&this.modelVariants.has(e)){const t=this.modelVariants.get(e);return this.enableVariantHelper(t.index)}return null}async enableVariantHelper(e){if(this.variantToMaterialMap!=null&&e!=null){const t=this.variantToMaterialMap.get(e);if(t!=null)return this.setActiveMaterial(t.index)}return null}async instantiateVariants(){if(this.variantToMaterialMap!=null)for(const e of this.variantToMaterialMap.keys()){const t=this.mesh.userData.variantMaterials.get(e);if(t.material!=null)continue;const n=await this.enableVariantHelper(e);n!=null&&(t.material=n)}}get variantInfo(){return this.variantToMaterialMap}addVariant(e,t){if(!this.ensureVariantIsUnused(t))return!1;this.modelVariants.has(t)||this.modelVariants.set(t,{name:t,index:this.modelVariants.size});const i=this.modelVariants.get(t).index;return e[Nr].add(i),this.variantToMaterialMap.set(i,e),this.materials.set(e.index,e),this.updateVariantUserData(i,e),!0}deleteVariant(e){if(this.variantInfo.has(e)){this.variantInfo.delete(e);const t=this.mesh.userData.variantMaterials;t?.delete(e)}}updateVariantUserData(e,t){t[Nr].add(e),this.mesh.userData.variantData=this.modelVariants,this.mesh.userData.variantMaterials=this.mesh.userData.variantMaterials||new Map,this.mesh.userData.variantMaterials.set(e,{material:t[We].values().next().value,gltfMaterialIndex:t.index})}ensureVariantIsUnused(e){const t=this.modelVariants.get(e);return t!=null&&this.variantInfo.has(t.index)?(console.warn(`Primitive cannot add variant '${e}' for this material, it already exists.`),!1):!0}}/* @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var cm,lm,hm,um,dm,fm;const As=Symbol("materials"),oc=Symbol("hierarchy"),pm=Symbol("roots"),vi=Symbol("primitives"),eb=Symbol("prepareVariantsForExport"),tb=Symbol("switchVariant"),nb=Symbol("materialFromPoint"),td=Symbol("nodeFromPoint"),ib=Symbol("nodeFromIndex"),Jt=Symbol("variantData"),nd=Symbol("availableVariants"),Fh=Symbol("modelOnUpdate"),Am=Symbol("cloneMaterial");class FT{constructor(e,t,n,i){this.gltf=e,this.gltfElementMap=t,this.mapKey=n,this.doLazyLoad=i}}class PT{constructor(e,t=()=>{}){this[cm]=new Array,this[lm]=new Array,this[hm]=new Array,this[um]=new Array,this[dm]=()=>{},this[fm]=new Map,this[Fh]=t;const{gltf:n,threeGLTF:i,gltfElementMap:s}=e;for(const[c,l]of n.materials.entries()){const u=s.get(l);if(u!=null)this[As].push(new Dh(t,c,!0,this[Jt],u,l.name));else{const d=(n.materials||[])[c],f=new Set;s.set(d,f);const A=async()=>{const g=await i.parser.getDependency("material",c);return f.add(g),g};this[As].push(new Dh(t,c,!1,this[Jt],f,l.name,new FT(n,s,d,A)))}}const a=new Map,o=new Array;for(const c of i.scene.children)o.push(c);for(;o.length>0;){const c=o.pop();let l=null;c instanceof dt?(l=new Lh(c,this.materials,this[Jt],e),this[vi].push(l)):l=new Z0(c.name);const u=a.get(c);u!=null?u.children.push(l):this[pm].push(l),this[oc].push(l);for(const h of c.children)o.push(h),a.set(c,l)}}get materials(){return this[As]}[(cm=As,lm=oc,hm=pm,um=vi,dm=Fh,fm=Jt,nd)](){const e=Array.from(this[Jt].values());return e.sort((t,n)=>t.index-n.index),e.map(t=>t.name)}getMaterialByName(e){const t=this[As].filter(n=>n.name===e);return t.length>0?t[0]:null}[ib](e,t){const n=this[oc].find(i=>{if(i instanceof Lh){const{meshes:s,primitives:a}=i.mesh.userData.associations;if(s==e&&a==t)return!0}return!1});return n??null}[td](e){return this[oc].find(t=>t instanceof Lh&&t.mesh===e.object)}[nb](e){return this[td](e).getActiveMaterial()}async[tb](e){for(const t of this[vi])await t.enableVariant(e);for(const t of this.materials)t[Oa](!1);for(const t of this[vi])this.materials[t.getActiveMaterial().index][Oa](!0)}async[eb](){const e=new Array;for(const t of this[vi])e.push(t.instantiateVariants());await Promise.all(e)}[Am](e,t){const n=this.materials[e];n.isLoaded||console.error(`Cloning an unloaded material,
           call 'material.ensureLoaded() before cloning the material.`);const i=n[We],s=new Set;for(const[o,c]of i.entries()){const l=c.clone();l.name=t+(i.size>1?"_inst"+o:""),s.add(l)}const a=new Dh(this[Fh],this[As].length,!1,this[Jt],s,t);return this[As].push(a),a}createMaterialInstanceForVariant(e,t,n,i=!0){let s=null;for(const a of this[vi]){const o=this[Jt].get(n);o!=null&&a.variantInfo.has(o.index)||a.getMaterial(e)!=null&&(this.hasVariant(n)||this.createVariant(n),s==null&&(s=this[Am](e,t)),a.addVariant(s,n))}if(i&&s!=null){s[Oa](!0),this.materials[e][Oa](!1);for(const a of this[vi])a.enableVariant(n)}return s}createVariant(e){this[Jt].has(e)?console.warn(`Variant '${e}'' already exists`):this[Jt].set(e,{name:e,index:this[Jt].size})}hasVariant(e){return this[Jt].has(e)}setMaterialToVariant(e,t){if(this[nd]().find(n=>n===t)==null){console.warn(`Can't add material to '${t}', the variant does not exist.'`);return}if(e<0||e>=this.materials.length){console.error("setMaterialToVariant(): materialIndex is out of bounds.");return}for(const n of this[vi]){const i=n.getMaterial(e);i!=null&&n.addVariant(i,t)}}updateVariantName(e,t){const n=this[Jt].get(e);n!=null&&(n.name=t,this[Jt].set(t,n),this[Jt].delete(e))}deleteVariant(e){const t=this[Jt].get(e);if(t!=null){for(const n of this.materials)n.hasVariant(e)&&n[Nr].delete(t.index);for(const n of this[vi])n.deleteVariant(t.index);this[Jt].delete(e)}}}/* @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Ph=function(r,e,t,n){var i=arguments.length,s=i<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,t):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(r,e,t,n);else for(var o=r.length-1;o>=0;o--)(a=r[o])&&(s=(i<3?a(s):i>3?a(e,t,s):a(e,t))||s);return i>3&&s&&Object.defineProperty(e,t,s),s};const Mc=Symbol("currentGLTF"),wc=Symbol("originalGltfJson"),ys=Symbol("model"),Uh=Symbol("getOnUpdateMethod"),Sa=Symbol("buildTexture"),UT=r=>{var e,t,n;class i extends r{constructor(){super(...arguments),this[e]=void 0,this[t]=null,this[n]=null,this.variantName=null,this.orientation="0 0 0",this.scale="1 1 1"}get model(){return this[ys]}get availableVariants(){return this.model?this.model[nd]():[]}get originalGltfJson(){return this[wc]}[(e=ys,t=Mc,n=wc,Uh)](){return()=>{this[qt]()}}[Sa](a){return a.colorSpace=mt,a.wrapS=$n,a.wrapT=$n,new j0(this[Uh](),a)}async createTexture(a,o="image/png"){const{textureUtils:c}=this[lt],l=await c.loadImage(a,this.withCredentials);return l.userData.mimeType=o,this[Sa](l)}async createLottieTexture(a,o=1){const{textureUtils:c}=this[lt],l=await c.loadLottie(a,o,this.withCredentials);return this[Sa](l)}createVideoTexture(a){const o=document.createElement("video");o.crossOrigin=this.withCredentials?"use-credentials":"anonymous",o.src=a,o.muted=!0,o.playsInline=!0,o.loop=!0,o.play();const c=new _E(o);return this[Sa](c)}createCanvasTexture(){const a=document.createElement("canvas"),o=new vE(a);return this[Sa](o)}async updated(a){if(super.updated(a),a.has("variantName")){const o=this[Qs].beginActivity("variant-update");o(.1);const c=this[ys],{variantName:l}=this;c!=null&&(await c[tb](l),this[qt](),this.dispatchEvent(new CustomEvent("variant-applied"))),o(1)}if(a.has("orientation")||a.has("scale")){if(!this.loaded)return;const o=this[J];o.applyTransform(),o.updateBoundingBox(),o.updateShadow(),this[lt].arRenderer.onUpdateScene(),this[qt]()}}[ci](){super[ci]();const{currentGLTF:a}=this[J];if(a!=null){const{correlatedSceneGraph:o}=a;o!=null&&a!==this[Mc]&&(this[ys]=new PT(o,this[Uh]()),this[wc]=JSON.parse(JSON.stringify(o.gltf))),"variants"in a.userData&&this.requestUpdate("variantName")}this[Mc]=a}async exportScene(a){const o=this[J];return new Promise(async(c,l)=>{const u={binary:!0,onlyVisible:!0,maxTextureSize:1/0,includeCustomExtensions:!1,forceIndices:!1};Object.assign(u,a),u.animations=o.animations,u.truncateDrawRange=!0;const h=o.shadow;let d=!1;h!=null&&(d=h.visible,h.visible=!1),await this[ys][eb](),new Wc().register(A=>new iw(A)).parse(o.model,A=>c(new Blob([u.binary?A:JSON.stringify(A)],{type:u.binary?"application/octet-stream":"application/json"})),()=>l("glTF export failed"),u),h!=null&&(h.visible=d)})}materialFromPoint(a,o){const c=this[ys];if(c==null)return null;const l=this[J],u=l.getNDC(a,o),h=l.hitFromPoint(u);return h==null||h.face==null?null:c[nb](h)}}return Ph([De({type:String,attribute:"variant-name"})],i.prototype,"variantName",void 0),Ph([De({type:String,attribute:"orientation"})],i.prototype,"orientation",void 0),Ph([De({type:String,attribute:"scale"})],i.prototype,"scale",void 0),i};/* @license
 * Copyright 2023 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class NT extends dt{constructor(){super(void 0,new Fn({depthWrite:!1})),this.height=0,this.radius=0,this.resolution=0,this.userData.noHit=!0}get map(){return this.material.map}set map(e){this.material.map=e}isUsable(){return this.height>0&&this.radius>0&&this.geometry!=null&&this.map!=null}updateGeometry(e=this.height,t=this.radius,n=128){(e!=this.height||t!=this.radius||n!=this.resolution)&&(this.height=e,this.radius=t,this.resolution=n,e>0&&t>0&&(this.geometry.dispose(),this.geometry=OT(e,t,n)))}}function OT(r,e,t){const n=new Id(e,2*t,t);n.scale(1,1,-1);const i=n.getAttribute("position"),s=new B;for(let a=0;a<i.count;++a)if(s.fromBufferAttribute(i,a),s.y<0){const o=-r*3/2,c=s.y<o?-r/s.y:1-s.y*s.y/(3*o*o);s.multiplyScalar(c),s.toArray(i.array,3*a)}return i.needsUpdate=!0,n}/* @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cc=new B,Nh=new B,Oh=new B,lc=new Qe,mm=new xn,gm=new un;class sb extends BM{constructor(e){super(document.createElement("div")),this.normal=new B(0,1,0),this.initialized=!1,this.referenceCount=1,this.pivot=document.createElement("div"),this.slot=document.createElement("slot"),this.element.classList.add("annotation-wrapper"),this.slot.name=e.name,this.element.appendChild(this.pivot),this.pivot.appendChild(this.slot),this.updatePosition(e.position),this.updateNormal(e.normal),this.surface=e.surface}get facingCamera(){return!this.element.classList.contains("hide")}show(){(!this.facingCamera||!this.initialized)&&this.updateVisibility(!0)}hide(){(this.facingCamera||!this.initialized)&&this.updateVisibility(!1)}increment(){this.referenceCount++}decrement(){return this.referenceCount>0&&--this.referenceCount,this.referenceCount===0}updatePosition(e){if(e==null)return;const t=Ri(e)[0].terms;for(let n=0;n<3;++n)this.position.setComponent(n,si(t[n]).number);this.updateMatrixWorld()}updateNormal(e){if(e==null)return;const t=Ri(e)[0].terms;for(let n=0;n<3;++n)this.normal.setComponent(n,t[n].number)}updateSurface(){const{mesh:e,tri:t,bary:n}=this;if(e==null||t==null||n==null)return;e.getVertexPosition(t.x,cc),e.getVertexPosition(t.y,Nh),e.getVertexPosition(t.z,Oh),cc.toArray(lc.elements,0),Nh.toArray(lc.elements,3),Oh.toArray(lc.elements,6),this.position.copy(n).applyMatrix3(lc);const i=this.parent;i.worldToLocal(e.localToWorld(this.position)),mm.set(cc,Nh,Oh),mm.getNormal(this.normal).transformDirection(e.matrixWorld);const s=i.parent;gm.setFromAxisAngle(cc.set(0,1,0),-s.rotation.y),this.normal.applyQuaternion(gm)}orient(e){this.pivot.style.transform=`rotate(${e}rad)`}updateVisibility(e){this.element.classList.toggle("hide",!e),this.slot.assignedNodes().forEach(t=>{if(t.nodeType!==Node.ELEMENT_NODE)return;const n=t,i=n.dataset.visibilityAttribute;if(i!=null){const s=`data-${i}`;n.toggleAttribute(s,e)}n.dispatchEvent(new CustomEvent("hotspot-visibility",{detail:{visible:e}}))}),this.initialized=!0}}const kT={name:"HorizontalBlurShader",uniforms:{tDiffuse:{value:null},h:{value:1/512}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform float h;

		varying vec2 vUv;

		void main() {

			vec4 sum = vec4( 0.0 );

			sum += texture2D( tDiffuse, vec2( vUv.x - 4.0 * h, vUv.y ) ) * 0.051;
			sum += texture2D( tDiffuse, vec2( vUv.x - 3.0 * h, vUv.y ) ) * 0.0918;
			sum += texture2D( tDiffuse, vec2( vUv.x - 2.0 * h, vUv.y ) ) * 0.12245;
			sum += texture2D( tDiffuse, vec2( vUv.x - 1.0 * h, vUv.y ) ) * 0.1531;
			sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;
			sum += texture2D( tDiffuse, vec2( vUv.x + 1.0 * h, vUv.y ) ) * 0.1531;
			sum += texture2D( tDiffuse, vec2( vUv.x + 2.0 * h, vUv.y ) ) * 0.12245;
			sum += texture2D( tDiffuse, vec2( vUv.x + 3.0 * h, vUv.y ) ) * 0.0918;
			sum += texture2D( tDiffuse, vec2( vUv.x + 4.0 * h, vUv.y ) ) * 0.051;

			gl_FragColor = sum;

		}`},QT={name:"VerticalBlurShader",uniforms:{tDiffuse:{value:null},v:{value:1/512}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform float v;

		varying vec2 vUv;

		void main() {

			vec4 sum = vec4( 0.0 );

			sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * v ) ) * 0.051;
			sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * v ) ) * 0.0918;
			sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * v ) ) * 0.12245;
			sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * v ) ) * 0.1531;
			sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;
			sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * v ) ) * 0.1531;
			sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * v ) ) * 0.12245;
			sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * v ) ) * 0.0918;
			sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * v ) ) * 0.051;

			gl_FragColor = sum;

		}`};function bm(r,e,t){return(1-t)*r+t*e}/* @license
 * Copyright 2022 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _m=9,GT=6,kh=2,HT=.3;class zT extends pt{constructor(e,t,n){super(),this.camera=new ea,this.renderTarget=null,this.renderTargetBlur=null,this.depthMaterial=new Fg,this.horizontalBlurMaterial=new In(kT),this.verticalBlurMaterial=new In(QT),this.intensity=0,this.softness=1,this.boundingBox=new ln,this.size=new B,this.maxDimension=0,this.isAnimated=!1,this.needsUpdate=!1;const{camera:i}=this;i.rotation.x=Math.PI/2,i.left=-.5,i.right=.5,i.bottom=-.5,i.top=.5,this.add(i);const s=new Fi,a=new Fn({opacity:1,transparent:!0,side:jt});this.floor=new dt(s,a),this.floor.userData.noHit=!0,i.add(this.floor),this.blurPlane=new dt(s),this.blurPlane.visible=!1,i.add(this.blurPlane),e.target.add(this),this.depthMaterial.onBeforeCompile=function(o){o.fragmentShader=o.fragmentShader.replace("gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );","gl_FragColor = vec4( vec3( 0.0 ), ( 1.0 - fragCoordZ ) * opacity );")},this.depthMaterial.side=Wt,this.horizontalBlurMaterial.depthTest=!1,this.verticalBlurMaterial.depthTest=!1,this.setScene(e,t,n)}setScene(e,t,n){const{boundingBox:i,size:s,rotation:a,position:o}=this;if(this.isAnimated=e.animationNames.length>0,this.boundingBox.copy(e.boundingBox),this.size.copy(e.size),this.maxDimension=Math.max(s.x,s.y,s.z)*(this.isAnimated?kh:1),this.boundingBox.getCenter(o),n==="back"){const{min:c,max:l}=i;[c.y,c.z]=[c.z,c.y],[l.y,l.z]=[l.z,l.y],[s.y,s.z]=[s.z,s.y],a.x=Math.PI/2,a.y=Math.PI}else a.x=0,a.y=0;if(this.isAnimated){const c=i.min.y,l=i.max.y;s.y=this.maxDimension,i.expandByVector(s.subScalar(this.maxDimension).multiplyScalar(-.5)),i.min.y=c,i.max.y=l,s.set(this.maxDimension,l-c,this.maxDimension)}n==="bottom"?o.y=i.min.y:o.z=i.min.y,this.setSoftness(t)}setSoftness(e){this.softness=e;const{size:t,camera:n}=this,i=this.isAnimated?kh:1,s=i*Math.pow(2,_m-e*(_m-GT));this.setMapSize(s);const a=t.y/2,o=t.y*i;n.near=0,n.far=bm(o,a,e),this.depthMaterial.opacity=1/e,n.updateProjectionMatrix(),this.setIntensity(this.intensity),this.setOffset(0)}setMapSize(e){const{size:t}=this;this.isAnimated&&(e*=kh);const n=Math.floor(t.x>t.z?e:e*t.x/t.z),i=Math.floor(t.x>t.z?e*t.z/t.x:e),s=10,a=s+n,o=s+i;if(this.renderTarget!=null&&(this.renderTarget.width!==a||this.renderTarget.height!==o)&&(this.renderTarget.dispose(),this.renderTarget=null,this.renderTargetBlur.dispose(),this.renderTargetBlur=null),this.renderTarget==null){const c={format:xt};this.renderTarget=new Pn(a,o,c),this.renderTargetBlur=new Pn(a,o,c),this.floor.material.map=this.renderTarget.texture}this.camera.scale.set(t.x*(1+s/n),t.z*(1+s/i),1),this.needsUpdate=!0}setIntensity(e){this.intensity=e,e>0?(this.visible=!0,this.floor.visible=!0,this.floor.material.opacity=e*bm(HT,1,this.softness*this.softness)):(this.visible=!1,this.floor.visible=!1)}getIntensity(){return this.intensity}setOffset(e){this.floor.position.z=-e+this.gap()}gap(){return .001*this.maxDimension}render(e,t){t.overrideMaterial=this.depthMaterial;const n=e.getClearAlpha();e.setClearAlpha(0),this.floor.visible=!1;const i=e.xr.enabled;e.xr.enabled=!1;const s=e.getRenderTarget();e.setRenderTarget(this.renderTarget),e.render(t,this.camera),t.overrideMaterial=null,this.floor.visible=!0,this.blurShadow(e),e.xr.enabled=i,e.setRenderTarget(s),e.setClearAlpha(n)}blurShadow(e){const{camera:t,horizontalBlurMaterial:n,verticalBlurMaterial:i,renderTarget:s,renderTargetBlur:a,blurPlane:o}=this;o.visible=!0,o.material=n,n.uniforms.h.value=1/this.renderTarget.width,n.uniforms.tDiffuse.value=this.renderTarget.texture,e.setRenderTarget(a),e.render(o,t),o.material=i,i.uniforms.v.value=1/this.renderTarget.height,i.uniforms.tDiffuse.value=this.renderTargetBlur.texture,e.setRenderTarget(s),e.render(o,t),o.visible=!1}dispose(){this.renderTarget!=null&&this.renderTarget.dispose(),this.renderTargetBlur!=null&&this.renderTargetBlur.dispose(),this.depthMaterial.dispose(),this.horizontalBlurMaterial.dispose(),this.verticalBlurMaterial.dispose(),this.floor.material.dispose(),this.floor.geometry.dispose(),this.blurPlane.geometry.dispose(),this.removeFromParent()}}/* @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Em=10,Qh=100,Gh=new B,xm=new B,vm=new B,hc=new nx,VT=new B,Ca=new ke;class WT extends Os{constructor({canvas:e,element:t,width:n,height:i}){super(),this.annotationRenderer=new DM,this.effectRenderer=null,this.schemaElement=document.createElement("script"),this.width=1,this.height=1,this.aspect=1,this.scaleStep=0,this.renderCount=0,this.externalRenderer=null,this.appendedAnimations=[],this.markedAnimations=[],this.camera=new $t(45,1,.1,100),this.xrCamera=null,this.url=null,this.pivot=new pt,this.target=new pt,this.animationNames=[],this.boundingBox=new ln,this.boundingSphere=new Nn,this.size=new B,this.idealAspect=0,this.framedFoVDeg=0,this.shadow=null,this.shadowIntensity=0,this.shadowSoftness=1,this.bakedShadows=new Set,this.exposure=1,this.toneMapping=Xa,this.canScale=!0,this.isDirty=!1,this.goalTarget=new B,this.targetDamperX=new cn,this.targetDamperY=new cn,this.targetDamperZ=new cn,this._currentGLTF=null,this._model=null,this.cancelPendingSourceChange=null,this.animationsByName=new Map,this.currentAnimationAction=null,this.groundedSkybox=new NT,this.name="ModelScene",this.element=t,this.canvas=e,this.camera=new $t(45,1,.1,100),this.camera.name="MainCamera",this.add(this.pivot),this.pivot.name="Pivot",this.pivot.add(this.target),this.setSize(n,i),this.target.name="Target",this.mixer=new tx(this.target);const{domElement:s}=this.annotationRenderer,{style:a}=s;a.display="none",a.pointerEvents="none",a.position="absolute",a.top="0",this.element.shadowRoot.querySelector(".default").appendChild(s),this.schemaElement.setAttribute("type","application/ld+json")}get context(){return this.canvas.getContext("2d")}getCamera(){return this.xrCamera!=null?this.xrCamera:this.camera}queueRender(){this.isDirty=!0}shouldRender(){return this.isDirty}hasRendered(){this.isDirty=!1}forceRescale(){this.scaleStep=-1,this.queueRender()}async setObject(e){this.reset(),this._model=e,this.target.add(e),await this.setupScene()}async setSource(e,t=()=>{}){if(!e||e===this.url){t(1);return}if(this.reset(),this.url=e,this.externalRenderer!=null){const o=await this.externalRenderer.load(t);this.boundingSphere.radius=o.framedRadius,this.idealAspect=o.fieldOfViewAspect;return}this.cancelPendingSourceChange!=null&&(this.cancelPendingSourceChange(),this.cancelPendingSourceChange=null);let n;try{n=await new Promise(async(o,c)=>{this.cancelPendingSourceChange=()=>c();try{const l=await this.element[lt].loader.load(e,this.element,t);o(l)}catch(l){c(l)}})}catch(o){if(o==null)return;throw o}this.cancelPendingSourceChange=null,this.reset(),this.url=e,this._currentGLTF=n,n!=null&&(this._model=n.scene,this.target.add(n.scene));const{animations:i}=n,s=new Map,a=[];for(const o of i)s.set(o.name,o),a.push(o.name);this.animations=i,this.animationsByName=s,this.animationNames=a,await this.setupScene()}async setupScene(){this.applyTransform(),this.updateBoundingBox(),await this.updateFraming(),this.updateShadow(),this.setShadowIntensity(this.shadowIntensity),this.setGroundedSkybox()}reset(){this.url=null,this.renderCount=0,this.queueRender(),this.shadow!=null&&this.shadow.setIntensity(0),this.bakedShadows.clear();const{_model:e}=this;e!=null&&(e.removeFromParent(),this._model=null);const t=this._currentGLTF;t!=null&&(t.dispose(),this._currentGLTF=null),this.currentAnimationAction!=null&&(this.currentAnimationAction.stop(),this.currentAnimationAction=null),this.mixer.stopAllAction(),this.mixer.uncacheRoot(this)}dispose(){this.reset(),this.shadow!=null&&(this.shadow.dispose(),this.shadow=null),this.element[Mc]=null,this.element[wc]=null,this.element[ys]=null}get currentGLTF(){return this._currentGLTF}setSize(e,t){if(!(this.width===e&&this.height===t)){if(this.width=Math.max(e,1),this.height=Math.max(t,1),this.annotationRenderer.setSize(e,t),this.aspect=this.width/this.height,this.externalRenderer!=null){const n=window.devicePixelRatio;this.externalRenderer.resize(e*n,t*n)}this.queueRender()}}markBakedShadow(e){e.userData.noHit=!0,this.bakedShadows.add(e)}unmarkBakedShadow(e){e.userData.noHit=!1,e.visible=!0,this.bakedShadows.delete(e),this.boundingBox.expandByObject(e)}findBakedShadows(e){const t=new ln;e.traverse(n=>{const i=n;if(!i.material||!i.material.transparent)return;t.setFromObject(i);const a=t.getSize(VT),o=Math.min(a.x,a.y,a.z);Math.max(a.x,a.y,a.z)<Qh*o||this.markBakedShadow(i)})}checkBakedShadows(){const{min:e,max:t}=this.boundingBox,n=new ln;this.boundingBox.getSize(this.size);for(const i of this.bakedShadows)n.setFromObject(i),!(n.min.y<e.y+this.size.y/Qh&&n.min.x<=e.x&&n.max.x>=t.x&&n.min.z<=e.z&&n.max.z>=t.z)&&(n.min.z<e.z+this.size.z/Qh&&n.min.x<=e.x&&n.max.x>=t.x&&n.min.y<=e.y&&n.max.y>=t.y||this.unmarkBakedShadow(i))}applyTransform(){const{model:e}=this;if(e==null)return;const t=Ri(this.element.orientation)[0].terms,n=si(t[0]).number,i=si(t[1]).number,s=si(t[2]).number;e.quaternion.setFromEuler(new Un(i,s,n,"YXZ"));const a=Ri(this.element.scale)[0].terms;e.scale.set(a[0].number,a[1].number,a[2].number)}updateBoundingBox(){const{model:e}=this;if(e==null)return;this.target.remove(e),this.findBakedShadows(e);const t=(n,i)=>n.expandByPoint(i);this.setBakedShadowVisibility(!1),this.boundingBox=$o(e,t,new ln),this.boundingBox.isEmpty()&&(this.setBakedShadowVisibility(!0),this.bakedShadows.forEach(n=>this.unmarkBakedShadow(n)),this.boundingBox=$o(e,t,new ln)),this.checkBakedShadows(),this.setBakedShadowVisibility(),this.boundingBox.getSize(this.size),this.target.add(e)}async updateFraming(){const{model:e}=this;if(e==null)return;this.target.remove(e),this.setBakedShadowVisibility(!1);const{center:t}=this.boundingSphere;this.element.requestUpdate("cameraTarget"),await this.element.updateComplete,t.copy(this.getTarget());const n=(s,a)=>Math.max(s,t.distanceToSquared(a));this.boundingSphere.radius=Math.sqrt($o(e,n,0));const i=(s,a)=>{a.sub(t);const o=Math.sqrt(a.x*a.x+a.z*a.z);return Math.max(s,o/(this.idealCameraDistance()-Math.abs(a.y)))};this.idealAspect=$o(e,i,0)/Math.tan(this.framedFoVDeg/2*Math.PI/180),this.setBakedShadowVisibility(),this.target.add(e)}setBakedShadowVisibility(e=this.shadowIntensity<=0){for(const t of this.bakedShadows)t.visible=e}idealCameraDistance(){const e=this.framedFoVDeg/2*Math.PI/180;return this.boundingSphere.radius/Math.sin(e)}adjustedFoV(e){const t=Math.tan(e/2*Math.PI/180)*Math.max(1,this.idealAspect/this.aspect);return 2*Math.atan(t)*180/Math.PI}getNDC(e,t){if(this.xrCamera!=null)Ca.set(e/window.screen.width,t/window.screen.height);else{const n=this.element.getBoundingClientRect();Ca.set((e-n.x)/this.width,(t-n.y)/this.height)}return Ca.multiplyScalar(2).subScalar(1),Ca.y*=-1,Ca}getSize(){return{width:this.width,height:this.height}}setEnvironmentAndSkybox(e,t){this.element[lt].arRenderer.presentedScene!==this&&(this.environment=e,this.setBackground(t),this.queueRender())}setBackground(e){this.groundedSkybox.map=e,this.groundedSkybox.isUsable()?(this.target.add(this.groundedSkybox),this.background=null):(this.target.remove(this.groundedSkybox),this.background=e)}farRadius(){return this.boundingSphere.radius*(this.groundedSkybox.parent!=null?Em:1)}setGroundedSkybox(){const e=Ri(this.element.skyboxHeight)[0].terms[0],t=si(e).number,n=Em*this.boundingSphere.radius;this.groundedSkybox.updateGeometry(t,n),this.groundedSkybox.position.y=t-(this.shadow?2*this.shadow.gap():0),this.setBackground(this.groundedSkybox.map)}setTarget(e,t,n){this.goalTarget.set(-e,-t,-n)}setTargetDamperDecayTime(e){this.targetDamperX.setDecayTime(e),this.targetDamperY.setDecayTime(e),this.targetDamperZ.setDecayTime(e)}getTarget(){return this.goalTarget.clone().multiplyScalar(-1)}getDynamicTarget(){return this.target.position.clone().multiplyScalar(-1)}jumpToGoal(){this.updateTarget(I0)}updateTarget(e){const t=this.goalTarget,n=this.target.position;if(t.equals(n))return!1;{const i=this.boundingSphere.radius/10;let{x:s,y:a,z:o}=n;return s=this.targetDamperX.update(s,t.x,e,i),a=this.targetDamperY.update(a,t.y,e,i),o=this.targetDamperZ.update(o,t.z,e,i),this.groundedSkybox.position.x=-s,this.groundedSkybox.position.z=-o,this.target.position.set(s,a,o),this.target.updateMatrixWorld(),this.queueRender(),!0}}pointTowards(e,t){const{x:n,z:i}=this.position;this.yaw=Math.atan2(e-n,t-i)}get model(){return this._model}set yaw(e){this.pivot.rotation.y=e,this.groundedSkybox.rotation.y=-e,this.queueRender()}get yaw(){return this.pivot.rotation.y}set animationTime(e){this.mixer.setTime(e),this.queueShadowRender()}get animationTime(){if(this.currentAnimationAction!=null){const e=Math.max(this.currentAnimationAction._loopCount,0);return this.currentAnimationAction.loop===Uc&&(e&1)===1?this.duration-this.currentAnimationAction.time:this.currentAnimationAction.time}return 0}set animationTimeScale(e){this.mixer.timeScale=e}get animationTimeScale(){return this.mixer.timeScale}get duration(){return this.currentAnimationAction!=null&&this.currentAnimationAction.getClip()?this.currentAnimationAction.getClip().duration:0}get hasActiveAnimation(){return this.currentAnimationAction!=null}playAnimation(e=null,t=0,n=Lr,i=1/0){if(this._currentGLTF==null)return;const{animations:s}=this;if(s==null||s.length===0)return;let a=null;if(e!=null&&(a=this.animationsByName.get(e),a==null)){const o=parseInt(e);!isNaN(o)&&o>=0&&o<s.length&&(a=s[o])}a==null&&(a=s[0]);try{const{currentAnimationAction:o}=this,c=this.mixer.clipAction(a,this);c.timeScale!=this.element.timeScale&&(c.timeScale=this.element.timeScale),this.currentAnimationAction=c,this.element.paused?this.mixer.stopAllAction():(c.paused=!1,o!=null&&c!==o?c.crossFadeFrom(o,t,!1):this.animationTimeScale>0&&this.animationTime==this.duration&&(this.animationTime=0)),c.setLoop(n,i),c.enabled=!0,c.clampWhenFinished=!0,c.play()}catch(o){console.error(o)}}appendAnimation(e="",t=Lr,n=1/0,i=1,s=1,a=!1,o=!1,c=!0,l=null,u=!1){if(this._currentGLTF==null||e===this.element.animationName)return;const{animations:h}=this;if(h==null||h.length===0)return;let d=null;const f=1.25;if(e&&(d=this.animationsByName.get(e)),d!=null){typeof n=="string"?isNaN(n)?(n=1/0,console.warn("Invalid repetitionCount value, repetitionCount is set to Infinity")):n=Math.max(parseInt(n),1):typeof n=="number"&&n<1&&(n=1),n===1&&t!==to&&(t=to),typeof i=="string"&&(isNaN(i)?(i=1,console.warn("Invalid weight value, weight is set to 1")):i=parseFloat(i)),typeof s=="string"&&(isNaN(s)?(s=1,console.warn("Invalid timeScale value, timeScale is set to 1")):s=parseFloat(s)),typeof a=="string"&&(a.toLowerCase().trim()==="true"?a=!0:a.toLowerCase().trim()==="false"?a=!1:isNaN(a)?(a=!1,console.warn("Invalid fade value, fade is set to false")):a=parseFloat(a)),typeof o=="string"&&(o.toLowerCase().trim()==="true"?o=!0:o.toLowerCase().trim()==="false"?o=!1:isNaN(o)?(o=!1,console.warn("Invalid warp value, warp is set to false")):o=parseFloat(o)),typeof l=="string"&&(isNaN(l)||(l=parseFloat(l)));try{const A=this.mixer.existingAction(d)||this.mixer.clipAction(d,this),g=A.timeScale;u&&this.appendedAnimations.includes(e)&&(this.markedAnimations.map(m=>m.name).includes(e)||this.markedAnimations.push({name:e,loopMode:t,repetitionCount:n})),typeof l=="number"&&(A.time=Math.min(Math.max(l,0),d.duration)),typeof a=="boolean"&&a?A.fadeIn(f):typeof a=="number"?A.fadeIn(Math.max(a,0)):i>=0&&(A.weight=Math.min(Math.max(i,0),1)),typeof o=="boolean"&&o?A.warp(c?g:0,s,f):typeof o=="number"?A.warp(c?g:0,s,Math.max(o,0)):A.timeScale=s,A.isRunning()||(A.time==d.duration&&A.stop(),A.setLoop(t,n),A.paused=!1,A.enabled=!0,A.clampWhenFinished=!0,A.play()),this.appendedAnimations.includes(e)||this.element[J].appendedAnimations.push(e)}catch(A){console.error(A)}}}detachAnimation(e="",t=!0){if(this._currentGLTF==null||e===this.element.animationName)return;const{animations:n}=this;if(n==null||n.length===0)return;let i=null;const s=1.5;if(e&&(i=this.animationsByName.get(e)),i!=null){typeof t=="string"&&(t.toLowerCase().trim()==="true"?t=!0:t.toLowerCase().trim()==="false"?t=!1:isNaN(t)?(t=!0,console.warn("Invalid fade value, fade is set to true")):t=parseFloat(t));try{const a=this.mixer.existingAction(i)||this.mixer.clipAction(i,this);typeof t=="boolean"&&t?a.fadeOut(s):typeof t=="number"?a.fadeOut(Math.max(t,0)):a.stop();const o=this.element[J].appendedAnimations.filter(c=>c!==e);this.element[J].appendedAnimations=o}catch(a){console.error(a)}}}updateAnimationLoop(e="",t=Lr,n=1/0){if(this._currentGLTF==null||e===this.element.animationName)return;const{animations:i}=this;if(i==null||i.length===0)return;let s=null;if(e&&(s=this.animationsByName.get(e)),s!=null)try{const a=this.mixer.existingAction(s)||this.mixer.clipAction(s,this);a.stop(),a.setLoop(t,n),a.play()}catch(a){console.error(a)}}stopAnimation(){this.currentAnimationAction=null,this.mixer.stopAllAction()}updateAnimation(e){this.mixer.update(e),this.queueShadowRender()}subscribeMixerEvent(e,t){this.mixer.addEventListener(e,t)}updateShadow(){const e=this.shadow;if(e!=null){const t=this.element.arPlacement==="wall"?"back":"bottom";e.setScene(this,this.shadowSoftness,t),e.needsUpdate=!0}}renderShadow(e){const t=this.shadow;t!=null&&t.needsUpdate==!0&&(t.render(e,this),t.needsUpdate=!1)}queueShadowRender(){this.shadow!=null&&(this.shadow.needsUpdate=!0)}setShadowIntensity(e){if(this.shadowIntensity=e,this._currentGLTF!=null&&(this.setBakedShadowVisibility(),!(e<=0&&this.shadow==null))){if(this.shadow==null){const t=this.element.arPlacement==="wall"?"back":"bottom";this.shadow=new zT(this,this.shadowSoftness,t)}this.shadow.setIntensity(e)}}setShadowSoftness(e){this.shadowSoftness=e;const t=this.shadow;t?.setSoftness(e)}setShadowOffset(e){const t=this.shadow;t?.setOffset(e)}getHit(e=this){return hc.intersectObject(e,!0).find(n=>n.object.visible&&!n.object.userData.noHit)}hitFromController(e,t=this){return hc.setFromXRController(e),this.getHit(t)}hitFromPoint(e,t=this){return hc.setFromCamera(e,this.getCamera()),this.getHit(t)}positionAndNormalFromPoint(e,t=this){var n;const i=this.hitFromPoint(e,t);if(i==null)return null;const s=i.point,a=i.face!=null?i.face.normal.clone().applyNormalMatrix(new Qe().getNormalMatrix(i.object.matrixWorld)):hc.ray.direction.clone().multiplyScalar(-1),o=(n=i.uv)!==null&&n!==void 0?n:null;return{position:s,normal:a,uv:o}}surfaceFromPoint(e,t=this){const n=this.element.model;if(n==null)return null;const i=this.hitFromPoint(e,t);if(i==null||i.face==null)return null;const s=n[td](i),{meshes:a,primitives:o}=s.mesh.userData.associations,c=new B,l=new B,u=new B,{a:h,b:d,c:f}=i.face,A=i.object;A.getVertexPosition(h,c),A.getVertexPosition(d,l),A.getVertexPosition(f,u);const g=new xn(c,l,u),m=new B;return g.getBarycoord(A.worldToLocal(i.point),m),`${a} ${o} ${h} ${d} ${f} ${m.x.toFixed(3)} ${m.y.toFixed(3)} ${m.z.toFixed(3)}`}addHotspot(e){this.target.add(e),this.annotationRenderer.domElement.appendChild(e.element),this.updateSurfaceHotspot(e)}removeHotspot(e){this.target.remove(e)}forHotspots(e){const{children:t}=this.target;for(let n=0,i=t.length;n<i;n++){const s=t[n];s instanceof sb&&e(s)}}updateSurfaceHotspot(e){if(e.surface==null||this.element.model==null)return;const t=Ri(e.surface)[0].terms;if(t.length!=8){console.warn(e.surface+" does not have exactly 8 numbers.");return}const n=this.element.model[ib](t[0].number,t[1].number);if(n==null){console.warn(e.surface+" does not match a node/primitive in this glTF! Skipping this hotspot.");return}const i=n.mesh.geometry.attributes.position.count,s=new B(t[2].number,t[3].number,t[4].number);if(s.x>=i||s.y>=i||s.z>=i){console.warn(e.surface+" vertex indices out of range in this glTF! Skipping this hotspot.");return}const a=new B(t[5].number,t[6].number,t[7].number);e.mesh=n.mesh,e.tri=s,e.bary=a,e.updateSurface()}animateSurfaceHotspots(){this.element.paused||this.forHotspots(e=>{e.updateSurface()})}updateHotspotsVisibility(e){this.forHotspots(t=>{Gh.copy(e),xm.setFromMatrixPosition(t.matrixWorld),Gh.sub(xm),vm.copy(t.normal).transformDirection(this.target.matrixWorld),Gh.dot(vm)<0?t.hide():t.show()})}orientHotspots(e){this.forHotspots(t=>{t.orient(e)})}setHotspotsVisibility(e){this.forHotspots(t=>{t.visible=e})}updateSchema(e){var t;const{schemaElement:n,element:i}=this,{alt:s,poster:a,iosSrc:o}=i;if(e!=null){const c=[{"@type":"MediaObject",contentUrl:e,encodingFormat:((t=e.split(".").pop())===null||t===void 0?void 0:t.toLowerCase())==="gltf"?"model/gltf+json":"model/gltf-binary"}];o&&c.push({"@type":"MediaObject",contentUrl:o,encodingFormat:"model/vnd.usdz+zip"});const l={"@context":"http://schema.org/","@type":"3DModel",image:a??void 0,name:s??void 0,encoding:c};n.textContent=JSON.stringify(l),document.head.appendChild(n)}else n.parentElement!=null&&n.parentElement.removeChild(n)}}/* @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qT extends EventTarget{constructor(){super(...arguments),this.ongoingActivities=new Set,this.totalProgress=0}get ongoingActivityCount(){return this.ongoingActivities.size}beginActivity(e){const t={progress:0,completed:!1};return this.ongoingActivities.add(t),this.ongoingActivityCount===1&&this.announceTotalProgress(t,0,e),n=>{let i;return i=Math.max(ni(n,0,1),t.progress),i!==t.progress&&this.announceTotalProgress(t,i,e),t.progress}}announceTotalProgress(e,t,n){let i=0,s=0;t==1&&(e.completed=!0);for(const c of this.ongoingActivities){const{progress:l}=c;i+=1-l,c.completed&&s++}const a=e.progress;e.progress=t,this.totalProgress+=(t-a)*(1-this.totalProgress)/i;const o=s===this.ongoingActivityCount?1:this.totalProgress;this.dispatchEvent(new CustomEvent("progress",{detail:{totalProgress:o,reason:n}})),s===this.ongoingActivityCount&&(this.totalProgress=0,this.ongoingActivities.clear())}}/* @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var cl=function(r,e,t,n){var i=arguments.length,s=i<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,t):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(r,e,t,n);else for(var o=r.length-1;o>=0;o--)(a=r[o])&&(s=(i<3?a(s):i>3?a(e,t,s):a(e,t))||s);return i>3&&s&&Object.defineProperty(e,t,s),s},ym,Sm,Cm,Im,Mm,wm,Tm,Rm,Bm,Dm,Lm,Fm,Pm;const XT=10,$T=50,jT=0,YT=300,KT=150,Ji=document.createElement("canvas"),Hh=Symbol("fallbackResizeHandler"),Um=Symbol("defaultAriaLabel"),uc=Symbol("resizeObserver"),gr=Symbol("clearModelTimeout"),zh=Symbol("onContextLost"),br=Symbol("loaded"),Vh=Symbol("status"),Wh=Symbol("onFocus"),qh=Symbol("onBlur"),yr=Symbol("updateSize"),dc=Symbol("intersectionObserver"),Ss=Symbol("isElementInViewport"),$c=Symbol("announceModelVisibility"),Tr=Symbol("ariaLabel"),id=Symbol("altDefaulted"),Ia=Symbol("statusElement"),jc=Symbol("updateStatus"),ka=Symbol("loadedTime"),Or=Symbol("updateSource"),Nm=Symbol("markLoaded"),Tc=Symbol("container"),zn=Symbol("input"),sd=Symbol("canvas"),J=Symbol("scene"),qt=Symbol("needsRender"),oi=Symbol("tick"),ci=Symbol("onModelLoad"),Yc=Symbol("onResize"),lt=Symbol("renderer"),Qs=Symbol("progressTracker"),Om=Symbol("getLoaded"),Gs=Symbol("getModelIsVisible"),Kr=Symbol("shouldAttemptPreload"),$i=r=>({x:r.x,y:r.y,z:r.z,toString(){return`${this.x}m ${this.y}m ${this.z}m`}}),rd=r=>({u:r.x,v:r.y,toString(){return`${this.u} ${this.v}`}});class Ao extends Cs{static get is(){return"model-viewer"}static set modelCacheSize(e){on[Wi].evictionThreshold=e}static get modelCacheSize(){return on[Wi].evictionThreshold}static set minimumRenderScale(e){e>1&&console.warn("<model-viewer> minimumRenderScale has been clamped to a maximum value of 1."),e<=0&&console.warn("<model-viewer> minimumRenderScale has been clamped to a minimum value of 0.25."),Vn.singleton.minScale=e}static get minimumRenderScale(){return Vn.singleton.minScale}get loaded(){return this[Om]()}get[(ym=Ss,Sm=br,Cm=ka,Im=Vh,Mm=gr,wm=Hh,Tm=$c,Rm=uc,Bm=dc,Dm=Qs,lt)](){return Vn.singleton}get modelIsVisible(){return this[Gs]()}constructor(){super(),this.alt=null,this.src=null,this.withCredentials=!1,this.generateSchema=!1,this[ym]=!1,this[Sm]=!1,this[Cm]=0,this[Im]="",this[Mm]=null,this[wm]=Ep(()=>{const i=this.getBoundingClientRect();this[yr](i)},$T),this[Tm]=Ep(i=>{const s=this.modelIsVisible;s!==i&&this.dispatchEvent(new CustomEvent("model-visibility",{detail:{visible:s}}))},jT),this[Rm]=null,this[Bm]=null,this[Dm]=new qT,this[Lm]=()=>{this[Ia].textContent=this[Vh]},this[Fm]=()=>{this[Ia].textContent=""},this[Pm]=i=>{this.dispatchEvent(new CustomEvent("error",{detail:{type:"webglcontextlost",sourceError:i.sourceEvent}}))},this.attachShadow({mode:"open"});const e=this.shadowRoot;AI(e),this[Tc]=e.querySelector(".container"),this[zn]=e.querySelector(".userInput"),this[sd]=e.querySelector("canvas"),this[Ia]=e.querySelector("#status"),this[Um]=this[zn].getAttribute("aria-label");let t,n;if(this.isConnected){const i=this.getBoundingClientRect();t=i.width,n=i.height}else t=YT,n=KT;this[J]=new WT({canvas:this[sd],element:this,width:t,height:n}),Promise.resolve().then(()=>{this[yr](this.getBoundingClientRect())}),$l&&(this[uc]=new ResizeObserver(i=>{if(!this[lt].isPresenting)for(let s of i)s.target===this&&this[yr](s.contentRect)})),jl?this[dc]=new IntersectionObserver(i=>{for(let s of i)if(s.target===this){const a=this.modelIsVisible;this[Ss]=s.isIntersecting,this[$c](a),this[Ss]&&!this.loaded&&this[Or]()}},{root:null,rootMargin:"0px",threshold:1e-5}):this[Ss]=!0}connectedCallback(){super.connectedCallback&&super.connectedCallback(),$l?this[uc].observe(this):self.addEventListener("resize",this[Hh]),jl&&this[dc].observe(this),this.addEventListener("focus",this[Wh]),this.addEventListener("blur",this[qh]);const e=this[lt];e.addEventListener("contextlost",this[zh]),e.registerScene(this[J]),this[gr]!=null&&(self.clearTimeout(this[gr]),this[gr]=null,this.requestUpdate("src",null))}disconnectedCallback(){super.disconnectedCallback&&super.disconnectedCallback(),$l?this[uc].unobserve(this):self.removeEventListener("resize",this[Hh]),jl&&this[dc].unobserve(this),this.removeEventListener("focus",this[Wh]),this.removeEventListener("blur",this[qh]);const e=this[lt];e.removeEventListener("contextlost",this[zh]),e.unregisterScene(this[J]),this[gr]=self.setTimeout(()=>{this[J].dispose(),this[gr]=null},XT)}updated(e){super.updated(e),e.has("src")&&(this.src==null?(this[br]=!1,this[ka]=0,this[J].reset()):this.src!==this[J].url&&(this[br]=!1,this[ka]=0,this[Or]())),e.has("alt")&&this[zn].setAttribute("aria-label",this[Tr]),e.has("generateSchema")&&(this.generateSchema?this[J].updateSchema(this.src):this[J].updateSchema(null))}toDataURL(e,t){return this[lt].displayCanvas(this[J]).toDataURL(e,t)}async toBlob(e){const t=e?e.mimeType:void 0,n=e?e.qualityArgument:void 0,i=e?e.idealAspect:void 0,{width:s,height:a,idealAspect:o,aspect:c}=this[J],{dpr:l,scaleFactor:u}=this[lt];let h=s*u*l,d=a*u*l,f=0,A=0;if(i===!0)if(o>c){const g=d;d=Math.round(h/o),A=(g-d)/2}else{const g=h;h=Math.round(d*o),f=(g-h)/2}Ji.width=h,Ji.height=d;try{return new Promise(async(g,m)=>{Ji.getContext("2d").drawImage(this[lt].displayCanvas(this[J]),f,A,h,d,0,0,h,d),Ji.toBlob(p=>{if(!p)return m(new Error("Unable to retrieve canvas blob"));g(p)},t,n)})}finally{this[yr]({width:s,height:a})}}registerEffectComposer(e){e.setRenderer(this[lt].threeRenderer),e.setMainCamera(this[J].getCamera()),e.setMainScene(this[J]),this[J].effectRenderer=e}unregisterEffectComposer(){this[J].effectRenderer=null}registerRenderer(e){this[J].externalRenderer=e}unregisterRenderer(){this[J].externalRenderer=null}get[Tr](){return this[id]}get[id](){return this.alt==null||this.alt==="null"?this[Um]:this.alt}[Om](){return this[br]}[Gs](){return this.loaded&&this[Ss]}[Kr](){return!!this.src&&this[Ss]}[yr]({width:e,height:t}){e===0||t===0||(this[Tc].style.width=`${e}px`,this[Tc].style.height=`${t}px`,this[Yc]({width:e,height:t}))}[oi](e,t){var n;(n=this[J].effectRenderer)===null||n===void 0||n.beforeRender(e,t)}[Nm](){this[br]||(this[br]=!0,this[ka]=performance.now())}[qt](){this[J].queueRender()}[ci](){}[jc](e){this[Vh]=e;const t=this.getRootNode();t!=null&&t.activeElement===this&&this[Ia].textContent!=e&&(this[Ia].textContent=e)}[(Lm=Wh,Fm=qh,Yc)](e){this[J].setSize(e.width,e.height)}async[(Pm=zh,Or)](){const e=this[J];if(this.loaded||!this[Kr]()||this.src===e.url)return;this.generateSchema&&e.updateSchema(this.src),this[jc]("Loading"),e.stopAnimation();const t=this[Qs].beginActivity("model-load"),n=this.src;try{const i=e.setSource(n,a=>t(ni(a,0,1)*.95)),s=this[Vc]();await Promise.all([i,s]),this[Nm](),this[ci](),this.updateComplete.then(()=>{this.dispatchEvent(new CustomEvent("before-render"))}),await new Promise(a=>{requestAnimationFrame(()=>{requestAnimationFrame(()=>{this.dispatchEvent(new CustomEvent("load",{detail:{url:n}})),a()})})})}catch(i){this.dispatchEvent(new CustomEvent("error",{detail:{type:"loadfailure",sourceError:i}}))}finally{t(1)}}}cl([De({type:String})],Ao.prototype,"alt",void 0);cl([De({type:String})],Ao.prototype,"src",void 0);cl([De({type:Boolean,attribute:"with-credentials"})],Ao.prototype,"withCredentials",void 0);cl([De({type:Boolean,attribute:"generate-schema"})],Ao.prototype,"generateSchema",void 0);/* @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Xh=function(r,e,t,n){var i=arguments.length,s=i<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,t):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(r,e,t,n);else for(var o=r.length-1;o>=0;o--)(a=r[o])&&(s=(i<3?a(s):i>3?a(e,t,s):a(e,t))||s);return i>3&&s&&Object.defineProperty(e,t,s),s};const km=1e3,fc=Symbol("changeAnimation"),Qm=Symbol("appendAnimation"),Gm=Symbol("detachAnimation"),En=Symbol("paused"),JT={repetitions:1/0,pingpong:!1},ZT={pingpong:!1,repetitions:null,weight:1,timeScale:1,fade:!1,warp:!1,relativeWarp:!0,time:null},eR={fade:!0},tR=r=>{var e;class t extends r{constructor(...i){super(i),this.autoplay=!1,this.animationName=void 0,this.animationCrossfadeDuration=300,this[e]=!0,this[J].subscribeMixerEvent("loop",s=>{const a=s.action._loopCount,o=s.action._clip.name,c=s.action._clip.uuid,l=this[J].markedAnimations.find(u=>u.name===o);if(l){this[J].updateAnimationLoop(l.name,l.loopMode,l.repetitionCount);const u=this[J].markedAnimations.filter(h=>h.name!==o);this[J].markedAnimations=u}this.dispatchEvent(new CustomEvent("loop",{detail:{count:a,name:o,uuid:c}}))}),this[J].subscribeMixerEvent("finished",s=>{if(!this[J].appendedAnimations.includes(s.action._clip.name))this[En]=!0;else{const a=this[J].appendedAnimations.filter(o=>o!==s.action._clip.name);this[J].appendedAnimations=a}this.dispatchEvent(new CustomEvent("finished"))})}get availableAnimations(){return this.loaded?this[J].animationNames:[]}get duration(){return this[J].duration}get paused(){return this[En]}get currentTime(){return this[J].animationTime}get appendedAnimations(){return this[J].appendedAnimations}set currentTime(i){this[J].animationTime=i,this[qt]()}get timeScale(){return this[J].animationTimeScale}set timeScale(i){this[J].animationTimeScale=i}pause(){this[En]||(this[En]=!0,this.dispatchEvent(new CustomEvent("pause")))}play(i){this.availableAnimations.length>0&&(this[En]=!1,this[fc](i),this.dispatchEvent(new CustomEvent("play")))}appendAnimation(i,s){this.availableAnimations.length>0&&(this[En]=!1,this[Qm](i,s),this.dispatchEvent(new CustomEvent("append-animation")))}detachAnimation(i,s){this.availableAnimations.length>0&&(this[En]=!1,this[Gm](i,s),this.dispatchEvent(new CustomEvent("detach-animation")))}[(e=En,ci)](){super[ci](),this[En]=!0,this.animationName!=null&&this[fc](),this.autoplay&&this.play()}[oi](i,s){super[oi](i,s),!(this[En]||!this[Gs]()&&!this[lt].isPresenting)&&(this[J].updateAnimation(s/km),this[qt]())}updated(i){super.updated(i),i.has("autoplay")&&this.autoplay&&this.play(),i.has("animationName")&&this[fc]()}[fc](i=JT){var s;const a=(s=i.repetitions)!==null&&s!==void 0?s:1/0,o=i.pingpong?Uc:a===1?to:Lr;this[J].playAnimation(this.animationName,this.animationCrossfadeDuration/km,o,a),this[En]&&(this[J].updateAnimation(0),this[qt]())}[Qm](i="",s=ZT){var a;const o=(a=s.repetitions)!==null&&a!==void 0?a:1/0,c=s.pingpong?Uc:o===1?to:Lr,l=!!s.repetitions||"pingpong"in s;this[J].appendAnimation(i||this.animationName,c,o,s.weight,s.timeScale,s.fade,s.warp,s.relativeWarp,s.time,l),this[En]&&(this[J].updateAnimation(0),this[qt]())}[Gm](i="",s=eR){this[J].detachAnimation(i||this.animationName,s.fade),this[En]&&(this[J].updateAnimation(0),this[qt]())}}return Xh([De({type:Boolean})],t.prototype,"autoplay",void 0),Xh([De({type:String,attribute:"animation-name"})],t.prototype,"animationName",void 0),Xh([De({type:Number,attribute:"animation-crossfade-duration"})],t.prototype,"animationCrossfadeDuration",void 0),t};/* @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ms=Symbol("hotspotMap"),$h=Symbol("mutationCallback"),Ma=Symbol("observer"),jh=Symbol("addHotspot"),Hm=Symbol("removeHotspot"),Yh=new Ne,nR=r=>{var e,t,n;class i extends r{constructor(){super(...arguments),this[e]=new Map,this[t]=a=>{a.forEach(o=>{(!(o instanceof MutationRecord)||o.type==="childList")&&(o.addedNodes.forEach(c=>{this[jh](c)}),o.removedNodes.forEach(c=>{this[Hm](c)}),this[qt]())})},this[n]=new MutationObserver(this[$h])}connectedCallback(){super.connectedCallback();for(let o=0;o<this.children.length;++o)this[jh](this.children[o]);const{ShadyDOM:a}=self;a==null?this[Ma].observe(this,{childList:!0}):this[Ma]=a.observeChildren(this,this[$h])}disconnectedCallback(){super.disconnectedCallback();const{ShadyDOM:a}=self;a==null?this[Ma].disconnect():a.unobserveChildren(this[Ma])}[(e=ms,t=$h,n=Ma,ci)](){super[ci]();const a=this[J];a.forHotspots(o=>{a.updateSurfaceHotspot(o)})}[oi](a,o){super[oi](a,o);const c=this[J],{annotationRenderer:l}=c,u=c.getCamera();c.shouldRender()&&(c.animateSurfaceHotspots(),c.updateHotspotsVisibility(u.position),l.domElement.style.display="",l.render(c,u))}updateHotspot(a){const o=this[ms].get(a.name);o!=null&&(o.updatePosition(a.position),o.updateNormal(a.normal),o.surface=a.surface,this[J].updateSurfaceHotspot(o),this[qt]())}queryHotspot(a){const o=this[ms].get(a);if(o==null)return null;const c=$i(o.position),l=$i(o.normal),u=o.facingCamera,h=this[J],d=h.getCamera(),f=new B;f.setFromMatrixPosition(o.matrixWorld),f.project(d);const A=h.width/2,g=h.height/2;f.x=f.x*A+A,f.y=-(f.y*g)+g;const m=$i(new B(f.x,f.y,f.z));return!Number.isFinite(m.x)||!Number.isFinite(m.y)?null:{position:c,normal:l,canvasPosition:m,facingCamera:u}}positionAndNormalFromPoint(a,o){const c=this[J],l=c.getNDC(a,o),u=c.positionAndNormalFromPoint(l);if(u==null)return null;Yh.copy(c.target.matrixWorld).invert();const h=$i(u.position.applyMatrix4(Yh)),d=$i(u.normal.transformDirection(Yh));let f=null;return u.uv!=null&&(f=rd(u.uv)),{position:h,normal:d,uv:f}}surfaceFromPoint(a,o){const c=this[J],l=c.getNDC(a,o);return c.surfaceFromPoint(l)}[jh](a){if(!(a instanceof HTMLElement&&a.slot.indexOf("hotspot")===0))return;let o=this[ms].get(a.slot);o!=null?o.increment():(o=new sb({name:a.slot,position:a.dataset.position,normal:a.dataset.normal,surface:a.dataset.surface}),this[ms].set(a.slot,o),this[J].addHotspot(o)),this[J].queueRender()}[Hm](a){if(!(a instanceof HTMLElement))return;const o=this[ms].get(a.slot);o&&(o.decrement()&&(this[J].removeHotspot(o),this[ms].delete(a.slot)),this[J].queueRender())}}return i};/*!
fflate - fast JavaScript compression/decompression
<https://101arrowz.github.io/fflate>
Licensed under MIT. https://github.com/101arrowz/fflate/blob/master/LICENSE
version 0.8.2
*/var en=Uint8Array,Sn=Uint16Array,Pd=Int32Array,Ud=new en([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),Nd=new en([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),zm=new en([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),rb=function(r,e){for(var t=new Sn(31),n=0;n<31;++n)t[n]=e+=1<<r[n-1];for(var i=new Pd(t[30]),n=1;n<30;++n)for(var s=t[n];s<t[n+1];++s)i[s]=s-t[n]<<5|n;return{b:t,r:i}},ab=rb(Ud,2),iR=ab.b,ad=ab.r;iR[28]=258,ad[258]=28;var sR=rb(Nd,0),Vm=sR.r,od=new Sn(32768);for(var Et=0;Et<32768;++Et){var zi=(Et&43690)>>1|(Et&21845)<<1;zi=(zi&52428)>>2|(zi&13107)<<2,zi=(zi&61680)>>4|(zi&3855)<<4,od[Et]=((zi&65280)>>8|(zi&255)<<8)>>1}var qa=function(r,e,t){for(var n=r.length,i=0,s=new Sn(e);i<n;++i)r[i]&&++s[r[i]-1];var a=new Sn(e);for(i=1;i<e;++i)a[i]=a[i-1]+s[i-1]<<1;var o;if(t){o=new Sn(1<<e);var c=15-e;for(i=0;i<n;++i)if(r[i])for(var l=i<<4|r[i],u=e-r[i],h=a[r[i]-1]++<<u,d=h|(1<<u)-1;h<=d;++h)o[od[h]>>c]=l}else for(o=new Sn(n),i=0;i<n;++i)r[i]&&(o[i]=od[a[r[i]-1]++]>>15-r[i]);return o},Hs=new en(288);for(var Et=0;Et<144;++Et)Hs[Et]=8;for(var Et=144;Et<256;++Et)Hs[Et]=9;for(var Et=256;Et<280;++Et)Hs[Et]=7;for(var Et=280;Et<288;++Et)Hs[Et]=8;var Kc=new en(32);for(var Et=0;Et<32;++Et)Kc[Et]=5;var rR=qa(Hs,9,0),aR=qa(Kc,5,0),ob=function(r){return(r+7)/8|0},cb=function(r,e,t){return(t==null||t>r.length)&&(t=r.length),new en(r.subarray(e,t))},oR=["unexpected EOF","invalid block type","invalid length/literal","invalid distance","stream finished","no stream handler",,"no callback","invalid UTF-8 data","extra field too long","date not in range 1980-2099","filename too long","stream finishing","invalid zip data"],ll=function(r,e,t){var n=new Error(e||oR[r]);if(n.code=r,Error.captureStackTrace&&Error.captureStackTrace(n,ll),!t)throw n;return n},yi=function(r,e,t){t<<=e&7;var n=e/8|0;r[n]|=t,r[n+1]|=t>>8},wa=function(r,e,t){t<<=e&7;var n=e/8|0;r[n]|=t,r[n+1]|=t>>8,r[n+2]|=t>>16},Kh=function(r,e){for(var t=[],n=0;n<r.length;++n)r[n]&&t.push({s:n,f:r[n]});var i=t.length,s=t.slice();if(!i)return{t:hb,l:0};if(i==1){var a=new en(t[0].s+1);return a[t[0].s]=1,{t:a,l:1}}t.sort(function(x,I){return x.f-I.f}),t.push({s:-1,f:25001});var o=t[0],c=t[1],l=0,u=1,h=2;for(t[0]={s:-1,f:o.f+c.f,l:o,r:c};u!=i-1;)o=t[t[l].f<t[h].f?l++:h++],c=t[l!=u&&t[l].f<t[h].f?l++:h++],t[u++]={s:-1,f:o.f+c.f,l:o,r:c};for(var d=s[0].s,n=1;n<i;++n)s[n].s>d&&(d=s[n].s);var f=new Sn(d+1),A=cd(t[u-1],f,0);if(A>e){var n=0,g=0,m=A-e,p=1<<m;for(s.sort(function(I,M){return f[M.s]-f[I.s]||I.f-M.f});n<i;++n){var E=s[n].s;if(f[E]>e)g+=p-(1<<A-f[E]),f[E]=e;else break}for(g>>=m;g>0;){var _=s[n].s;f[_]<e?g-=1<<e-f[_]++-1:++n}for(;n>=0&&g;--n){var b=s[n].s;f[b]==e&&(--f[b],++g)}A=e}return{t:new en(f),l:A}},cd=function(r,e,t){return r.s==-1?Math.max(cd(r.l,e,t+1),cd(r.r,e,t+1)):e[r.s]=t},Wm=function(r){for(var e=r.length;e&&!r[--e];);for(var t=new Sn(++e),n=0,i=r[0],s=1,a=function(c){t[n++]=c},o=1;o<=e;++o)if(r[o]==i&&o!=e)++s;else{if(!i&&s>2){for(;s>138;s-=138)a(32754);s>2&&(a(s>10?s-11<<5|28690:s-3<<5|12305),s=0)}else if(s>3){for(a(i),--s;s>6;s-=6)a(8304);s>2&&(a(s-3<<5|8208),s=0)}for(;s--;)a(i);s=1,i=r[o]}return{c:t.subarray(0,n),n:e}},Ta=function(r,e){for(var t=0,n=0;n<e.length;++n)t+=r[n]*e[n];return t},lb=function(r,e,t){var n=t.length,i=ob(e+2);r[i]=n&255,r[i+1]=n>>8,r[i+2]=r[i]^255,r[i+3]=r[i+1]^255;for(var s=0;s<n;++s)r[i+s+4]=t[s];return(i+4+n)*8},qm=function(r,e,t,n,i,s,a,o,c,l,u){yi(e,u++,t),++i[256];for(var h=Kh(i,15),d=h.t,f=h.l,A=Kh(s,15),g=A.t,m=A.l,p=Wm(d),E=p.c,_=p.n,b=Wm(g),x=b.c,I=b.n,M=new Sn(19),w=0;w<E.length;++w)++M[E[w]&31];for(var w=0;w<x.length;++w)++M[x[w]&31];for(var v=Kh(M,7),y=v.t,T=v.l,k=19;k>4&&!y[zm[k-1]];--k);var U=l+5<<3,F=Ta(i,Hs)+Ta(s,Kc)+a,H=Ta(i,d)+Ta(s,g)+a+14+3*k+Ta(M,y)+2*M[16]+3*M[17]+7*M[18];if(c>=0&&U<=F&&U<=H)return lb(e,u,r.subarray(c,c+l));var O,W,Q,Y;if(yi(e,u,1+(H<F)),u+=2,H<F){O=qa(d,f,0),W=d,Q=qa(g,m,0),Y=g;var Z=qa(y,T,0);yi(e,u,_-257),yi(e,u+5,I-1),yi(e,u+10,k-4),u+=14;for(var w=0;w<k;++w)yi(e,u+3*w,y[zm[w]]);u+=3*k;for(var re=[E,x],fe=0;fe<2;++fe)for(var Be=re[fe],w=0;w<Be.length;++w){var Ge=Be[w]&31;yi(e,u,Z[Ge]),u+=y[Ge],Ge>15&&(yi(e,u,Be[w]>>5&127),u+=Be[w]>>12)}}else O=rR,W=Hs,Q=aR,Y=Kc;for(var w=0;w<o;++w){var q=n[w];if(q>255){var Ge=q>>18&31;wa(e,u,O[Ge+257]),u+=W[Ge+257],Ge>7&&(yi(e,u,q>>23&31),u+=Ud[Ge]);var oe=q&31;wa(e,u,Q[oe]),u+=Y[oe],oe>3&&(wa(e,u,q>>5&8191),u+=Nd[oe])}else wa(e,u,O[q]),u+=W[q]}return wa(e,u,O[256]),u+W[256]},cR=new Pd([65540,131080,131088,131104,262176,1048704,1048832,2114560,2117632]),hb=new en(0),lR=function(r,e,t,n,i,s){var a=s.z||r.length,o=new en(n+a+5*(1+Math.ceil(a/7e3))+i),c=o.subarray(n,o.length-i),l=s.l,u=(s.r||0)&7;if(e){u&&(c[0]=s.r>>3);for(var h=cR[e-1],d=h>>13,f=h&8191,A=(1<<t)-1,g=s.p||new Sn(32768),m=s.h||new Sn(A+1),p=Math.ceil(t/3),E=2*p,_=function(st){return(r[st]^r[st+1]<<p^r[st+2]<<E)&A},b=new Pd(25e3),x=new Sn(288),I=new Sn(32),M=0,w=0,v=s.i||0,y=0,T=s.w||0,k=0;v+2<a;++v){var U=_(v),F=v&32767,H=m[U];if(g[F]=H,m[U]=F,T<=v){var O=a-v;if((M>7e3||y>24576)&&(O>423||!l)){u=qm(r,c,0,b,x,I,w,y,k,v-k,u),y=M=w=0,k=v;for(var W=0;W<286;++W)x[W]=0;for(var W=0;W<30;++W)I[W]=0}var Q=2,Y=0,Z=f,re=F-H&32767;if(O>2&&U==_(v-re))for(var fe=Math.min(d,O)-1,Be=Math.min(32767,v),Ge=Math.min(258,O);re<=Be&&--Z&&F!=H;){if(r[v+Q]==r[v+Q-re]){for(var q=0;q<Ge&&r[v+q]==r[v+q-re];++q);if(q>Q){if(Q=q,Y=re,q>fe)break;for(var oe=Math.min(re,q-2),se=0,W=0;W<oe;++W){var Ce=v-re+W&32767,we=g[Ce],Oe=Ce-we&32767;Oe>se&&(se=Oe,H=Ce)}}}F=H,H=g[F],re+=F-H&32767}if(Y){b[y++]=268435456|ad[Q]<<18|Vm[Y];var St=ad[Q]&31,Ye=Vm[Y]&31;w+=Ud[St]+Nd[Ye],++x[257+St],++I[Ye],T=v+Q,++M}else b[y++]=r[v],++x[r[v]]}}for(v=Math.max(v,T);v<a;++v)b[y++]=r[v],++x[r[v]];u=qm(r,c,l,b,x,I,w,y,k,v-k,u),l||(s.r=u&7|c[u/8|0]<<3,u-=7,s.h=m,s.p=g,s.i=v,s.w=T)}else{for(var v=s.w||0;v<a+l;v+=65535){var D=v+65535;D>=a&&(c[u/8|0]=l,D=a),u=lb(c,u+1,r.subarray(v,D))}s.i=a}return cb(o,0,n+ob(u)+i)},hR=function(){for(var r=new Int32Array(256),e=0;e<256;++e){for(var t=e,n=9;--n;)t=(t&1&&-306674912)^t>>>1;r[e]=t}return r}(),uR=function(){var r=-1;return{p:function(e){for(var t=r,n=0;n<e.length;++n)t=hR[t&255^e[n]]^t>>>8;r=t},d:function(){return~r}}},dR=function(r,e,t,n,i){if(!i&&(i={l:1},e.dictionary)){var s=e.dictionary.subarray(-32768),a=new en(s.length+r.length);a.set(s),a.set(r,s.length),r=a,i.w=s.length}return lR(r,e.level==null?6:e.level,e.mem==null?i.l?Math.ceil(Math.max(8,Math.min(13,Math.log(r.length)))*1.5):20:12+e.mem,t,n,i)},ub=function(r,e){var t={};for(var n in r)t[n]=r[n];for(var n in e)t[n]=e[n];return t},Xt=function(r,e,t){for(;t;++e)r[e]=t,t>>>=8};function fR(r,e){return dR(r,e||{},0,0)}var db=function(r,e,t,n){for(var i in r){var s=r[i],a=e+i,o=n;Array.isArray(s)&&(o=ub(n,s[1]),s=s[0]),s instanceof en?t[a]=[s,o]:(t[a+="/"]=[new en(0),o],db(s,a,t,n))}},Xm=typeof TextEncoder<"u"&&new TextEncoder,pR=typeof TextDecoder<"u"&&new TextDecoder,AR=0;try{pR.decode(hb,{stream:!0}),AR=1}catch{}function Jc(r,e){var t;if(Xm)return Xm.encode(r);for(var n=r.length,i=new en(r.length+(r.length>>1)),s=0,a=function(l){i[s++]=l},t=0;t<n;++t){if(s+5>i.length){var o=new en(s+8+(n-t<<1));o.set(i),i=o}var c=r.charCodeAt(t);c<128||e?a(c):c<2048?(a(192|c>>6),a(128|c&63)):c>55295&&c<57344?(c=65536+(c&1047552)|r.charCodeAt(++t)&1023,a(240|c>>18),a(128|c>>12&63),a(128|c>>6&63),a(128|c&63)):(a(224|c>>12),a(128|c>>6&63),a(128|c&63))}return cb(i,0,s)}var ld=function(r){var e=0;if(r)for(var t in r){var n=r[t].length;n>65535&&ll(9),e+=n+4}return e},$m=function(r,e,t,n,i,s,a,o){var c=n.length,l=t.extra,u=o&&o.length,h=ld(l);Xt(r,e,a!=null?33639248:67324752),e+=4,a!=null&&(r[e++]=20,r[e++]=t.os),r[e]=20,e+=2,r[e++]=t.flag<<1|(s<0&&8),r[e++]=i&&8,r[e++]=t.compression&255,r[e++]=t.compression>>8;var d=new Date(t.mtime==null?Date.now():t.mtime),f=d.getFullYear()-1980;if((f<0||f>119)&&ll(10),Xt(r,e,f<<25|d.getMonth()+1<<21|d.getDate()<<16|d.getHours()<<11|d.getMinutes()<<5|d.getSeconds()>>1),e+=4,s!=-1&&(Xt(r,e,t.crc),Xt(r,e+4,s<0?-s-2:s),Xt(r,e+8,t.size)),Xt(r,e+12,c),Xt(r,e+14,h),e+=16,a!=null&&(Xt(r,e,u),Xt(r,e+6,t.attrs),Xt(r,e+10,a),e+=14),r.set(n,e),e+=c,h)for(var A in l){var g=l[A],m=g.length;Xt(r,e,+A),Xt(r,e+2,m),r.set(g,e+4),e+=4+m}return u&&(r.set(o,e),e+=u),e},mR=function(r,e,t,n,i){Xt(r,e,101010256),Xt(r,e+8,t),Xt(r,e+10,t),Xt(r,e+12,n),Xt(r,e+16,i)};function gR(r,e){e||(e={});var t={},n=[];db(r,"",t,e);var i=0,s=0;for(var a in t){var o=t[a],c=o[0],l=o[1],u=l.level==0?0:8,h=Jc(a),d=h.length,f=l.comment,A=f&&Jc(f),g=A&&A.length,m=ld(l.extra);d>65535&&ll(11);var p=u?fR(c,l):c,E=p.length,_=uR();_.p(c),n.push(ub(l,{size:c.length,crc:_.d(),c:p,f:h,m:A,u:d!=a.length||A&&f.length!=g,o:i,compression:u})),i+=30+d+m+E,s+=76+2*(d+m)+(g||0)+E}for(var b=new en(s+22),x=i,I=s-i,M=0;M<n.length;++M){var h=n[M];$m(b,h.o,h,h.f,h.u,h.c.length);var w=30+h.f.length+ld(h.extra);b.set(h.c,h.o+w),$m(b,i,h,h.f,h.u,h.c.length,h.o,h.m),i+=16+w+(h.m?h.m.length:0)}return mR(b,i,n.length,I,x),b}class vn{constructor(e,t="",n=[],i=[]){this.name=e,this.type=t,this.metadata=n,this.properties=i,this.children=[]}addMetadata(e,t){this.metadata.push({key:e,value:t})}addProperty(e,t=[]){this.properties.push({property:e,metadata:t})}addChild(e){this.children.push(e)}toString(e=0){const t="	".repeat(e),n=this.metadata.map(u=>{const h=u.key,d=u.value;if(Array.isArray(d)){const f=[];return f.push(`${h} = {`),d.forEach(A=>{f.push(`${t}		${A}`)}),f.push(`${t}	}`),f.join(`
`)}else return`${h} = ${d}`}),i=n.length?` (
${n.map(u=>`${t}	${u}`).join(`
`)}
${t})`:"",s=this.properties.map(u=>{const h=u.property,d=u.metadata.length?` (
${u.metadata.map(f=>`${t}		${f}`).join(`
`)}
${t}	)`:"";return`${t}	${h}${d}`}),a=this.children.map(u=>u.toString(e+1)),o=[];if(s.length>0&&o.push(...s),a.length>0){s.length>0&&o.push("");for(let u=0;u<a.length;u++)o.push(a[u]),u<a.length-1&&o.push("")}const c=o.join(`
`),l=this.type?this.type+" ":"";return`${t}def ${l}"${this.name}"${i}
${t}{
${c}
${t}}`}}class bR{constructor(){this.textureUtils=null}setTextureUtils(e){this.textureUtils=e}parse(e,t,n,i){this.parseAsync(e,i).then(t).catch(n)}async parseAsync(e,t={}){t=Object.assign({ar:{anchoring:{type:"plane"},planeAnchoring:{alignment:"horizontal"}},includeAnchoringProperties:!0,onlyVisible:!0,quickLookCompatible:!1,maxTextureSize:1024},t);const n=new Set,i={},s="model.usda";i[s]=null;const a=new vn("Root","Xform"),o=new vn("Scenes","Scope");o.addMetadata("kind",'"sceneLibrary"'),a.addChild(o);const c="Scene",l=new vn(c,"Xform");l.addMetadata("customData",["bool preliminary_collidesWithEnvironment = 0",`string sceneName = "${c}"`]),l.addMetadata("sceneName",`"${c}"`),t.includeAnchoringProperties&&(l.addProperty(`token preliminary:anchoring:type = "${t.ar.anchoring.type}"`),l.addProperty(`token preliminary:planeAnchoring:alignment = "${t.ar.planeAnchoring.alignment}"`)),o.addChild(l);let u;const h={},d={};Ab(e,l,h,n,i,t);const f=IR(h,d,t.quickLookCompatible);u=pb()+`
`+a.toString()+`

`+f.toString(),i[s]=Jc(u),u=null;for(const g in d){let m=d[g];if(m.isCompressedTexture===!0){if(this.textureUtils===null)throw new Error("THREE.USDZExporter: setTextureUtils() must be called to process compressed textures.");m=await this.textureUtils.decompress(m)}const p=_R(m.image,m.flipY,t.maxTextureSize),E=await new Promise(_=>p.toBlob(_,"image/png",1));i[`textures/Texture_${g}.png`]=new Uint8Array(await E.arrayBuffer())}let A=0;for(const g in i){const m=i[g],p=34+g.length;A+=p;const E=A&63;if(E!==4){const _=64-E,b=new Uint8Array(_);i[g]=[m,{extra:{12345:b}}]}A=m.length}return gR(i,{level:0})}}function fb(r,e){let t=r.name;return t=t.replace(/[^A-Za-z0-9_]/g,""),/^[0-9]/.test(t)&&(t="_"+t),t===""&&(r.isCamera?t="Camera":t="Object"),e.has(t)&&(t=t+"_"+r.id),e.add(t),t}function _R(r,e,t){if(typeof HTMLImageElement<"u"&&r instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&r instanceof HTMLCanvasElement||typeof OffscreenCanvas<"u"&&r instanceof OffscreenCanvas||typeof ImageBitmap<"u"&&r instanceof ImageBitmap){const n=t/Math.max(r.width,r.height),i=document.createElement("canvas");i.width=r.width*Math.min(1,n),i.height=r.height*Math.min(1,n);const s=i.getContext("2d");return e===!0&&(s.translate(0,i.height),s.scale(1,-1)),s.drawImage(r,0,0,i.width,i.height),i}else throw new Error("THREE.USDZExporter: No valid image data found. Unable to process texture.")}const pn=7;function pb(){return`#usda 1.0
(
	customLayerData = {
		string creator = "Three.js USDZExporter"
	}
	defaultPrim = "Root"
	metersPerUnit = 1
	upAxis = "Y"
)
`}function Ab(r,e,t,n,i,s){for(let a=0,o=r.children.length;a<o;a++){const c=r.children[a];if(c.visible===!1&&s.onlyVisible===!0)continue;let l;if(c.isMesh){const u=c.geometry,h=c.material;if(h.isMeshStandardMaterial){const d="geometries/Geometry_"+u.id+".usda";if(!(d in i)){const f=xR(u);i[d]=Jc(pb()+`
`+f.toString())}h.uuid in t||(t[h.uuid]=h),l=ER(c,u,t[h.uuid],n)}else console.warn("THREE.USDZExporter: Unsupported material type (USDZ only supports MeshStandardMaterial)",c)}else c.isCamera?l=TR(c,n):l=mb(c,n);l&&(e.addChild(l),Ab(c,l,t,n,i,s))}}function mb(r,e){const t=fb(r,e),n=gb(r.matrix);r.matrix.determinant()<0&&console.warn("THREE.USDZExporter: USDZ does not support negative scales",r);const i=new vn(t,"Xform");return i.addProperty(`matrix4d xformOp:transform = ${n}`),i.addProperty('uniform token[] xformOpOrder = ["xformOp:transform"]'),i}function ER(r,e,t,n){const i=mb(r,n);return i.addMetadata("prepend references",`@./geometries/Geometry_${e.id}.usda@</Geometry>`),i.addMetadata("prepend apiSchemas",'["MaterialBindingAPI"]'),i.addProperty(`rel material:binding = </Materials/Material_${t.id}>`),i}function gb(r){const e=r.elements;return`( ${pc(e,0)}, ${pc(e,4)}, ${pc(e,8)}, ${pc(e,12)} )`}function pc(r,e){return`(${r[e+0]}, ${r[e+1]}, ${r[e+2]}, ${r[e+3]})`}function xR(r){const e=new vn("Geometry"),t=vR(r);return e.addChild(t),e}function vR(r){const e="Geometry",t=r.attributes,n=t.position.count,i=new vn(e,"Mesh");i.addProperty(`int[] faceVertexCounts = [${yR(r)}]`),i.addProperty(`int[] faceVertexIndices = [${SR(r)}]`),i.addProperty(`normal3f[] normals = [${Jh(t.normal,n)}]`,['interpolation = "vertex"']),i.addProperty(`point3f[] points = [${Jh(t.position,n)}]`);for(let a=0;a<4;a++){const o=a>0?a:"",c=t["uv"+o];c!==void 0&&i.addProperty(`texCoord2f[] primvars:st${o} = [${CR(c)}]`,['interpolation = "vertex"'])}const s=t.color;return s!==void 0&&i.addProperty(`color3f[] primvars:displayColor = [${Jh(s,n)}]`,['interpolation = "vertex"']),i.addProperty('uniform token subdivisionScheme = "none"'),i}function yR(r){const e=r.index!==null?r.index.count:r.attributes.position.count;return Array(e/3).fill(3).join(", ")}function SR(r){const e=r.index,t=[];if(e!==null)for(let n=0;n<e.count;n++)t.push(e.getX(n));else{const n=r.attributes.position.count;for(let i=0;i<n;i++)t.push(i)}return t.join(", ")}function Jh(r,e){if(r===void 0)return console.warn("USDZExporter: Normals missing."),Array(e).fill("(0, 0, 0)").join(", ");const t=[];for(let n=0;n<r.count;n++){const i=r.getX(n),s=r.getY(n),a=r.getZ(n);t.push(`(${i.toPrecision(pn)}, ${s.toPrecision(pn)}, ${a.toPrecision(pn)})`)}return t.join(", ")}function CR(r){const e=[];for(let t=0;t<r.count;t++){const n=r.getX(t),i=r.getY(t);e.push(`(${n.toPrecision(pn)}, ${1-i.toPrecision(pn)})`)}return e.join(", ")}function IR(r,e,t=!1){const n=new vn("Materials");for(const i in r){const s=r[i];n.addChild(MR(s,e,t))}return n}function MR(r,e,t=!1){const n=new vn(`Material_${r.id}`,"Material");function i(a,o,c){const l=a.source.id+"_"+a.flipY;e[l]=a;const u=a.channel>0?"st"+a.channel:"st",h={1e3:"repeat",1001:"clamp",1002:"mirror"},d=a.repeat.clone(),f=a.offset.clone(),A=a.rotation,g=Math.sin(A),m=Math.cos(A);f.y=1-f.y-d.y,t?(f.x=f.x/d.x,f.y=f.y/d.y,f.x+=g/d.x,f.y+=m-1):(f.x+=g*d.x,f.y+=(1-m)*d.y);const p=new vn(`PrimvarReader_${o}`,"Shader");p.addProperty('uniform token info:id = "UsdPrimvarReader_float2"'),p.addProperty("float2 inputs:fallback = (0.0, 0.0)"),p.addProperty(`token inputs:varname = "${u}"`),p.addProperty("float2 outputs:result");const E=new vn(`Transform2d_${o}`,"Shader");E.addProperty('uniform token info:id = "UsdTransform2d"'),E.addProperty(`token inputs:in.connect = </Materials/Material_${r.id}/PrimvarReader_${o}.outputs:result>`),E.addProperty(`float inputs:rotation = ${(A*(180/Math.PI)).toFixed(pn)}`),E.addProperty(`float2 inputs:scale = ${Ym(d)}`),E.addProperty(`float2 inputs:translation = ${Ym(f)}`),E.addProperty("float2 outputs:result");const _=new vn(`Texture_${a.id}_${o}`,"Shader");return _.addProperty('uniform token info:id = "UsdUVTexture"'),_.addProperty(`asset inputs:file = @textures/Texture_${l}.png@`),_.addProperty(`float2 inputs:st.connect = </Materials/Material_${r.id}/Transform2d_${o}.outputs:result>`),c!==void 0&&_.addProperty(`float4 inputs:scale = ${wR(c)}`),_.addProperty(`token inputs:sourceColorSpace = "${a.colorSpace===Dn?"raw":"sRGB"}"`),_.addProperty(`token inputs:wrapS = "${h[a.wrapS]}"`),_.addProperty(`token inputs:wrapT = "${h[a.wrapT]}"`),_.addProperty("float outputs:r"),_.addProperty("float outputs:g"),_.addProperty("float outputs:b"),_.addProperty("float3 outputs:rgb"),(r.transparent||r.alphaTest>0)&&_.addProperty("float outputs:a"),[p,E,_]}r.side===Wt&&console.warn("THREE.USDZExporter: USDZ does not support double sided materials",r);const s=new vn("PreviewSurface","Shader");if(s.addProperty('uniform token info:id = "UsdPreviewSurface"'),r.map!==null?(s.addProperty(`color3f inputs:diffuseColor.connect = </Materials/Material_${r.id}/Texture_${r.map.id}_diffuse.outputs:rgb>`),r.transparent?s.addProperty(`float inputs:opacity.connect = </Materials/Material_${r.id}/Texture_${r.map.id}_diffuse.outputs:a>`):r.alphaTest>0&&(s.addProperty(`float inputs:opacity.connect = </Materials/Material_${r.id}/Texture_${r.map.id}_diffuse.outputs:a>`),s.addProperty(`float inputs:opacityThreshold = ${r.alphaTest}`)),i(r.map,"diffuse",r.color).forEach(o=>n.addChild(o))):s.addProperty(`color3f inputs:diffuseColor = ${jm(r.color)}`),r.emissiveMap!==null){s.addProperty(`color3f inputs:emissiveColor.connect = </Materials/Material_${r.id}/Texture_${r.emissiveMap.id}_emissive.outputs:rgb>`);const a=new Me(r.emissive.r*r.emissiveIntensity,r.emissive.g*r.emissiveIntensity,r.emissive.b*r.emissiveIntensity);i(r.emissiveMap,"emissive",a).forEach(c=>n.addChild(c))}else r.emissive.getHex()>0&&s.addProperty(`color3f inputs:emissiveColor = ${jm(r.emissive)}`);if(r.normalMap!==null&&(s.addProperty(`normal3f inputs:normal.connect = </Materials/Material_${r.id}/Texture_${r.normalMap.id}_normal.outputs:rgb>`),i(r.normalMap,"normal").forEach(o=>n.addChild(o))),r.aoMap!==null){s.addProperty(`float inputs:occlusion.connect = </Materials/Material_${r.id}/Texture_${r.aoMap.id}_occlusion.outputs:r>`);const a=new Me(r.aoMapIntensity,r.aoMapIntensity,r.aoMapIntensity);i(r.aoMap,"occlusion",a).forEach(c=>n.addChild(c))}if(r.roughnessMap!==null){s.addProperty(`float inputs:roughness.connect = </Materials/Material_${r.id}/Texture_${r.roughnessMap.id}_roughness.outputs:g>`);const a=new Me(r.roughness,r.roughness,r.roughness);i(r.roughnessMap,"roughness",a).forEach(c=>n.addChild(c))}else s.addProperty(`float inputs:roughness = ${r.roughness}`);if(r.metalnessMap!==null){s.addProperty(`float inputs:metallic.connect = </Materials/Material_${r.id}/Texture_${r.metalnessMap.id}_metallic.outputs:b>`);const a=new Me(r.metalness,r.metalness,r.metalness);i(r.metalnessMap,"metallic",a).forEach(c=>n.addChild(c))}else s.addProperty(`float inputs:metallic = ${r.metalness}`);if(r.alphaMap!==null?(s.addProperty(`float inputs:opacity.connect = </Materials/Material_${r.id}/Texture_${r.alphaMap.id}_opacity.outputs:r>`),s.addProperty("float inputs:opacityThreshold = 0.0001"),i(r.alphaMap,"opacity").forEach(o=>n.addChild(o))):s.addProperty(`float inputs:opacity = ${r.opacity}`),r.isMeshPhysicalMaterial){if(r.clearcoatMap!==null){s.addProperty(`float inputs:clearcoat.connect = </Materials/Material_${r.id}/Texture_${r.clearcoatMap.id}_clearcoat.outputs:r>`);const a=new Me(r.clearcoat,r.clearcoat,r.clearcoat);i(r.clearcoatMap,"clearcoat",a).forEach(c=>n.addChild(c))}else s.addProperty(`float inputs:clearcoat = ${r.clearcoat}`);if(r.clearcoatRoughnessMap!==null){s.addProperty(`float inputs:clearcoatRoughness.connect = </Materials/Material_${r.id}/Texture_${r.clearcoatRoughnessMap.id}_clearcoatRoughness.outputs:g>`);const a=new Me(r.clearcoatRoughness,r.clearcoatRoughness,r.clearcoatRoughness);i(r.clearcoatRoughnessMap,"clearcoatRoughness",a).forEach(c=>n.addChild(c))}else s.addProperty(`float inputs:clearcoatRoughness = ${r.clearcoatRoughness}`);s.addProperty(`float inputs:ior = ${r.ior}`)}return s.addProperty("int inputs:useSpecularWorkflow = 0"),s.addProperty("token outputs:surface"),n.addChild(s),n.addProperty(`token outputs:surface.connect = </Materials/Material_${r.id}/PreviewSurface.outputs:surface>`),n}function jm(r){return`(${r.r}, ${r.g}, ${r.b})`}function wR(r){return`(${r.r}, ${r.g}, ${r.b}, 1.0)`}function Ym(r){return`(${r.x}, ${r.y})`}function TR(r,e){const t=fb(r,e),n=gb(r.matrix);r.matrix.determinant()<0&&console.warn("THREE.USDZExporter: USDZ does not support negative scales",r);const i=new vn(t,"Camera");i.addProperty(`matrix4d xformOp:transform = ${n}`),i.addProperty('uniform token[] xformOpOrder = ["xformOp:transform"]');const s=r.isOrthographicCamera?"orthographic":"perspective";i.addProperty(`token projection = "${s}"`);const a=`(${r.near.toPrecision(pn)}, ${r.far.toPrecision(pn)})`;i.addProperty(`float2 clippingRange = ${a}`);let o;r.isOrthographicCamera?o=((Math.abs(r.left)+Math.abs(r.right))*10).toPrecision(pn):o=r.getFilmWidth().toPrecision(pn),i.addProperty(`float horizontalAperture = ${o}`);let c;if(r.isOrthographicCamera?c=((Math.abs(r.top)+Math.abs(r.bottom))*10).toPrecision(pn):c=r.getFilmHeight().toPrecision(pn),i.addProperty(`float verticalAperture = ${c}`),r.isPerspectiveCamera){const l=r.getFocalLength().toPrecision(pn);i.addProperty(`float focalLength = ${l}`);const u=r.focus.toPrecision(pn);i.addProperty(`float focusDistance = ${u}`)}return i}/* @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const RR=r=>e=>{try{const t=Ri(e),n=(t.length?t[0].terms:[]).filter(i=>i&&i.type==="ident").map(i=>i.value).filter(i=>r.indexOf(i)>-1);return new Set(n)}catch{}return new Set};/* @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var gs=function(r,e,t,n){var i=arguments.length,s=i<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,t):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(r,e,t,n);else for(var o=r.length-1;o>=0;o--)(a=r[o])&&(s=(i<3?a(s):i>3?a(e,t,s):a(e,t))||s);return i>3&&s&&Object.defineProperty(e,t,s),s};let Km=!1,Jm=!1;const Zm="#model-viewer-no-ar-fallback",BR=RR(["quick-look","scene-viewer","webxr","none"]),DR="webxr scene-viewer quick-look",Rn={QUICK_LOOK:"quick-look",SCENE_VIEWER:"scene-viewer",WEBXR:"webxr",NONE:"none"},Si=Symbol("arButtonContainer"),eg=Symbol("enterARWithWebXR"),tg=Symbol("openSceneViewer"),ng=Symbol("openIOSARQuickLook"),LR=Symbol("canActivateAR"),Ac=Symbol("arMode"),Zh=Symbol("arModes"),_r=Symbol("arAnchor"),mc=Symbol("preload"),gc=Symbol("onARButtonContainerClick"),eu=Symbol("onARStatus"),tu=Symbol("onARTracking"),nu=Symbol("onARTap"),Ra=Symbol("selectARMode"),iu=Symbol("triggerLoad"),FR=r=>{var e,t,n,i,s,a,o,c,l,u;class h extends r{constructor(){super(...arguments),this.ar=!1,this.arScale="auto",this.arUsdzMaxTextureSize="auto",this.arPlacement="floor",this.arModes=DR,this.iosSrc=null,this.xrEnvironment=!1,this[e]=!1,this[t]=this.shadowRoot.querySelector(".ar-button"),this[n]=document.createElement("a"),this[i]=new Set,this[s]=Rn.NONE,this[a]=!1,this[o]=f=>{f.preventDefault(),this.activateAR()},this[c]=({status:f})=>{(f===Xi.NOT_PRESENTING||this[lt].arRenderer.presentedScene===this[J])&&(this.setAttribute("ar-status",f),this.dispatchEvent(new CustomEvent("ar-status",{detail:{status:f}})),f===Xi.NOT_PRESENTING?this.removeAttribute("ar-tracking"):f===Xi.SESSION_STARTED&&this.setAttribute("ar-tracking",Ju.TRACKING))},this[l]=({status:f})=>{this.setAttribute("ar-tracking",f),this.dispatchEvent(new CustomEvent("ar-tracking",{detail:{status:f}}))},this[u]=f=>{f.data=="_apple_ar_quicklook_button_tapped"&&this.dispatchEvent(new CustomEvent("quick-look-button-tapped"))}}get canActivateAR(){return this[Ac]!==Rn.NONE}connectedCallback(){super.connectedCallback(),this[lt].arRenderer.addEventListener("status",this[eu]),this.setAttribute("ar-status",Xi.NOT_PRESENTING),this[lt].arRenderer.addEventListener("tracking",this[tu]),this[_r].addEventListener("message",this[nu])}disconnectedCallback(){super.disconnectedCallback(),this[lt].arRenderer.removeEventListener("status",this[eu]),this[lt].arRenderer.removeEventListener("tracking",this[tu]),this[_r].removeEventListener("message",this[nu])}update(f){super.update(f),f.has("arScale")&&(this[J].canScale=this.arScale!=="fixed"),f.has("arPlacement")&&(this[J].updateShadow(),this[qt]()),f.has("arModes")&&(this[Zh]=BR(this.arModes)),(f.has("ar")||f.has("arModes")||f.has("src")||f.has("iosSrc")||f.has("arUsdzMaxTextureSize"))&&this[Ra]()}async activateAR(){switch(this[Ac]){case Rn.QUICK_LOOK:await this[ng]();break;case Rn.WEBXR:await this[eg]();break;case Rn.SCENE_VIEWER:this[tg]();break;default:console.warn("No AR Mode can be activated. This is probably due to missing configuration or device capabilities");break}}async[(e=LR,t=Si,n=_r,i=Zh,s=Ac,a=mc,o=gc,c=eu,l=tu,u=nu,Ra)](){var f;let A=Rn.NONE;if(this.ar){if(this.src!=null)for(const g of this[Zh]){if(g==="webxr"&&i0&&!Km&&await this[lt].arRenderer.supportsPresentation()){A=Rn.WEBXR;break}if(g==="scene-viewer"&&!Jm&&(eI||navigator.userAgentData&&navigator.userAgentData.getHighEntropyValues&&(!((f=(await navigator.userAgentData.getHighEntropyValues(["formFactor"])).formFactor)===null||f===void 0)&&f.includes("XR")))){A=Rn.SCENE_VIEWER;break}if(g==="quick-look"&&bp){A=Rn.QUICK_LOOK;break}}A===Rn.NONE&&this.iosSrc!=null&&bp&&(A=Rn.QUICK_LOOK)}if(A!==Rn.NONE)this[Si].classList.add("enabled"),this[Si].addEventListener("click",this[gc]);else if(this[Si].classList.contains("enabled")){this[Si].removeEventListener("click",this[gc]),this[Si].classList.remove("enabled");const g=Xi.FAILED;this.setAttribute("ar-status",g),this.dispatchEvent(new CustomEvent("ar-status",{detail:{status:g}}))}this[Ac]=A}async[eg](){console.log("Attempting to present in AR with WebXR..."),await this[iu]();try{this[Si].removeEventListener("click",this[gc]);const{arRenderer:f}=this[lt];f.placeOnWall=this.arPlacement==="wall",await f.present(this[J],this.xrEnvironment)}catch(f){console.warn("Error while trying to present in AR with WebXR"),console.error(f),await this[lt].arRenderer.stopPresenting(),Km=!0,console.warn("Falling back to next ar-mode"),await this[Ra](),this.activateAR()}finally{this[Ra]()}}async[iu](){this.loaded||(this[mc]=!0,this[Or](),await rI(this,"load"),this[mc]=!1)}[Kr](){return super[Kr]()||this[mc]}[tg](){const f=self.location.toString(),A=new URL(f),g=new URL(this.src,f);g.hash&&(g.hash="");const m=new URLSearchParams(g.search);if(A.hash=Zm,m.set("mode","ar_preferred"),m.has("disable_occlusion")||m.set("disable_occlusion","true"),this.arScale==="fixed"&&m.set("resizable","false"),this.arPlacement==="wall"&&m.set("enable_vertical_placement","true"),m.has("sound")){const _=new URL(m.get("sound"),f);m.set("sound",_.toString())}if(m.has("link")){const _=new URL(m.get("link"),f);m.set("link",_.toString())}const p=`intent://arvr.google.com/scene-viewer/1.2?${m.toString()+"&file="+encodeURIComponent(g.toString())}#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(A.toString())};end;`,E=()=>{self.location.hash===Zm&&(Jm=!0,self.history.back(),console.warn("Error while trying to present in AR with Scene Viewer"),console.warn("Falling back to next ar-mode"),this[Ra]())};self.addEventListener("hashchange",E,{once:!0}),this[_r].setAttribute("href",p),console.log("Attempting to present in AR with Scene Viewer..."),this[_r].click()}async[ng](){const f=!this.iosSrc;this[Si].classList.remove("enabled");const A=f?await this.prepareUSDZ():this.iosSrc,g=new URL(A,self.location.toString());if(f){const E=self.location.toString(),_=new URL(E),b=new URL(this.src,_);b.hash&&(g.hash=b.hash)}this.arScale==="fixed"&&(g.hash&&(g.hash+="&"),g.hash+="allowsContentScaling=0");const m=this[_r];m.setAttribute("rel","ar");const p=document.createElement("img");m.appendChild(p),m.setAttribute("href",g.toString()),f&&m.setAttribute("download","model.usdz"),m.style.display="none",m.isConnected||this.shadowRoot.appendChild(m),console.log("Attempting to present in AR with Quick Look..."),m.click(),m.removeChild(p),f&&URL.revokeObjectURL(A),this[Si].classList.add("enabled")}async prepareUSDZ(){const f=this[Qs].beginActivity("usdz-conversion");await this[iu]();const{model:A,shadow:g,target:m}=this[J];if(A==null)return"";let p=!1;g!=null&&(p=g.visible,g.visible=!1),f(.2);const E=new bR;m.remove(A),A.position.copy(m.position),A.updateWorldMatrix(!1,!0);const _=await E.parseAsync(A,{maxTextureSize:isNaN(this.arUsdzMaxTextureSize)?1/0:Math.max(parseInt(this.arUsdzMaxTextureSize),16)});A.position.set(0,0,0),m.add(A);const b=new Blob([_],{type:"model/vnd.usdz+zip"}),x=URL.createObjectURL(b);return f(1),g!=null&&(g.visible=p),x}}return gs([De({type:Boolean,attribute:"ar"})],h.prototype,"ar",void 0),gs([De({type:String,attribute:"ar-scale"})],h.prototype,"arScale",void 0),gs([De({type:String,attribute:"ar-usdz-max-texture-size"})],h.prototype,"arUsdzMaxTextureSize",void 0),gs([De({type:String,attribute:"ar-placement"})],h.prototype,"arPlacement",void 0),gs([De({type:String,attribute:"ar-modes"})],h.prototype,"arModes",void 0),gs([De({type:String,attribute:"ios-src"})],h.prototype,"iosSrc",void 0),gs([De({type:Boolean,attribute:"xr-environment"})],h.prototype,"xrEnvironment",void 0),h};/* @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var su=function(r,e,t,n){var i=arguments.length,s=i<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,t):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(r,e,t,n);else for(var o=r.length-1;o>=0;o--)(a=r[o])&&(s=(i<3?a(s):i>3?a(e,t,s):a(e,t))||s);return i>3&&s&&Object.defineProperty(e,t,s),s};const PR=100,UR="https://www.gstatic.com/draco/versioned/decoders/1.5.6/",NR="https://www.gstatic.com/basis-universal/versioned/2021-04-15-ba1c3e4/",OR="https://cdn.jsdelivr.net/npm/three@0.149.0/examples/jsm/loaders/LottieLoader.js",ru={AUTO:"auto"},ig={AUTO:"auto",EAGER:"eager"},Er=Symbol("defaultProgressBarElement"),au=Symbol("posterContainerElement"),xr=Symbol("defaultPosterElement"),Ba=Symbol("shouldDismissPoster"),ou=Symbol("hidePoster"),bc=Symbol("modelIsRevealed"),cu=Symbol("updateProgressBar"),kR=Symbol("ariaLabelCallToAction"),lu=Symbol("onProgress"),QR=r=>{var e,t,n,i,s,a,o,c;class l extends r{static set dracoDecoderLocation(h){on.setDRACODecoderLocation(h)}static get dracoDecoderLocation(){return on.getDRACODecoderLocation()}static set ktx2TranscoderLocation(h){on.setKTX2TranscoderLocation(h)}static get ktx2TranscoderLocation(){return on.getKTX2TranscoderLocation()}static set meshoptDecoderLocation(h){on.setMeshoptDecoderLocation(h)}static get meshoptDecoderLocation(){return on.getMeshoptDecoderLocation()}static set lottieLoaderLocation(h){Vn.singleton.textureUtils.lottieLoaderUrl=h}static get lottieLoaderLocation(){return Vn.singleton.textureUtils.lottieLoaderUrl}static mapURLs(h){Vn.singleton.loader[Es].manager.setURLModifier(h)}dismissPoster(){this.loaded?this[ou]():(this[Ba]=!0,this[Or]())}showPoster(){const h=this[au];if(h.classList.contains("show"))return;h.classList.add("show"),this[zn].classList.remove("show");const d=this[xr];d.removeAttribute("tabindex"),d.removeAttribute("aria-hidden");const f=this.modelIsVisible;this[bc]=!1,this[$c](f)}getDimensions(){return $i(this[J].size)}getBoundingBoxCenter(){return $i(this[J].boundingBox.getCenter(new B))}constructor(...h){super(...h),this.poster=null,this.reveal=ru.AUTO,this.loading=ig.AUTO,this[e]=!1,this[t]=!1,this[n]=this.shadowRoot.querySelector(".slot.poster"),this[i]=this.shadowRoot.querySelector("#default-poster"),this[s]=this.shadowRoot.querySelector("#default-progress-bar > .bar"),this[a]=this[xr].getAttribute("aria-label"),this[o]=iI(m=>{const p=this[Er].parentNode;requestAnimationFrame(()=>{this[Er].style.transform=`scaleX(${m})`,m===0&&(p.removeChild(this[Er]),p.appendChild(this[Er])),this[Er].classList.toggle("hide",m===1)})},PR),this[c]=m=>{const p=m.detail.totalProgress,E=m.detail.reason;p===1&&(this[cu].flush(),this.loaded&&(this[Ba]||this.reveal===ru.AUTO)&&this[ou]()),this[cu](p),this.dispatchEvent(new CustomEvent("progress",{detail:{totalProgress:p,reason:E}}))};const d=self.ModelViewerElement||{},f=d.dracoDecoderLocation||UR;on.setDRACODecoderLocation(f);const A=d.ktx2TranscoderLocation||NR;on.setKTX2TranscoderLocation(A),d.meshoptDecoderLocation&&on.setMeshoptDecoderLocation(d.meshoptDecoderLocation);const g=d.lottieLoaderLocation||OR;Vn.singleton.textureUtils.lottieLoaderUrl=g}connectedCallback(){super.connectedCallback(),this.loaded||this.showPoster(),this[Qs].addEventListener("progress",this[lu])}disconnectedCallback(){super.disconnectedCallback(),this[Qs].removeEventListener("progress",this[lu])}async updated(h){super.updated(h),h.has("poster")&&this.poster!=null&&(this[xr].style.backgroundImage=`url(${this.poster})`),h.has("alt")&&this[xr].setAttribute("aria-label",this[id]),(h.has("reveal")||h.has("loading"))&&this[Or]()}[(e=bc,t=Ba,n=au,i=xr,s=Er,a=kR,o=cu,c=lu,Kr)](){return!!this.src&&(this[Ba]||this.loading===ig.EAGER||this.reveal===ru.AUTO&&this[Ss])}[ou](){this[Ba]=!1;const h=this[au];if(!h.classList.contains("show"))return;h.classList.remove("show"),this[zn].classList.add("show");const d=this.modelIsVisible;this[bc]=!0,this[$c](d);const f=this.getRootNode();f&&f.activeElement===this&&this[zn].focus();const A=this[xr];A.setAttribute("aria-hidden","true"),A.tabIndex=-1,this.dispatchEvent(new CustomEvent("poster-dismissed"))}[Gs](){return super[Gs]()&&this[bc]}}return su([De({type:String})],l.prototype,"poster",void 0),su([De({type:String})],l.prototype,"reveal",void 0),su([De({type:String})],l.prototype,"loading",void 0),l};/* @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var hu=function(r,e,t,n){var i=arguments.length,s=i<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,t):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(r,e,t,n);else for(var o=r.length-1;o>=0;o--)(a=r[o])&&(s=(i<3?a(s):i>3?a(e,t,s):a(e,t))||s);return i>3&&s&&Object.defineProperty(e,t,s),s};const GR=Math.PI/32,HR=3e3,zR={basis:[ol(Zt(GR,"rad"))],keywords:{auto:[null]}},vr=Symbol("autoRotateStartTime"),uu=Symbol("radiansPerSecond"),sg=Symbol("syncRotationRate"),du=Symbol("onCameraChange"),VR=r=>{var e,t,n;class i extends r{constructor(){super(...arguments),this.autoRotate=!1,this.autoRotateDelay=HR,this.rotationPerSecond="auto",this[e]=performance.now(),this[t]=0,this[n]=a=>{this.autoRotate&&a.detail.source==="user-interaction"&&(this[vr]=performance.now())}}connectedCallback(){super.connectedCallback(),this.addEventListener("camera-change",this[du]),this[vr]=performance.now()}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("camera-change",this[du]),this[vr]=performance.now()}updated(a){super.updated(a),a.has("autoRotate")&&(this[vr]=performance.now())}[(e=vr,t=uu,sg)](a){this[uu]=a[0]}[oi](a,o){if(super[oi](a,o),!this.autoRotate||!this[Gs]()||this[lt].isPresenting)return;const c=Math.min(o,a-this[vr]-this.autoRotateDelay);c>0&&(this[J].yaw=this.turntableRotation+this[uu]*c*.001)}get turntableRotation(){return this[J].yaw}resetTurntableRotation(a=0){this[J].yaw=a}}return n=du,hu([De({type:Boolean,attribute:"auto-rotate"})],i.prototype,"autoRotate",void 0),hu([De({type:Number,attribute:"auto-rotate-delay"})],i.prototype,"autoRotateDelay",void 0),hu([Vi({intrinsics:zR,updateHandler:sg}),De({type:String,attribute:"rotation-per-second"})],i.prototype,"rotationPerSecond",void 0),i};/* @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const WR=nR(UT(VR(hI(Qw(FR(QR(tR(Ao))))))));customElements.define("model-viewer",WR);export{vE as CanvasTexture,Di as FileLoader,hi as Loader,WR as ModelViewerElement,Ot as NearestFilter};
//# sourceMappingURL=model-viewer-Bk82D0f1.js.map
