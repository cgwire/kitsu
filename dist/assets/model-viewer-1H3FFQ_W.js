/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const bc=globalThis,ld=bc.ShadowRoot&&(bc.ShadyCSS===void 0||bc.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,rg=Symbol(),Vd=new WeakMap;let Eb=class{constructor(e,t,n){if(this._$cssResult$=!0,n!==rg)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(ld&&e===void 0){const n=t!==void 0&&t.length===1;n&&(e=Vd.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&Vd.set(t,e))}return e}toString(){return this.cssText}};const vb=r=>new Eb(typeof r=="string"?r:r+"",void 0,rg),xb=(r,e)=>{if(ld)r.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const n=document.createElement("style"),i=bc.litNonce;i!==void 0&&n.setAttribute("nonce",i),n.textContent=t.cssText,r.appendChild(n)}},Wd=ld?r=>r:r=>r instanceof CSSStyleSheet?(e=>{let t="";for(const n of e.cssRules)t+=n.cssText;return vb(t)})(r):r;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:yb,defineProperty:Sb,getOwnPropertyDescriptor:Cb,getOwnPropertyNames:Ib,getOwnPropertySymbols:Mb,getPrototypeOf:wb}=Object,Ji=globalThis,qd=Ji.trustedTypes,Tb=qd?qd.emptyScript:"",Rb=Ji.reactiveElementPolyfillSupport,ka=(r,e)=>r,Tc={toAttribute(r,e){switch(e){case Boolean:r=r?Tb:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,e){let t=r;switch(e){case Boolean:t=r!==null;break;case Number:t=r===null?null:Number(r);break;case Object:case Array:try{t=JSON.parse(r)}catch{t=null}}return t}},hd=(r,e)=>!yb(r,e),Xd={attribute:!0,type:String,converter:Tc,reflect:!1,useDefault:!1,hasChanged:hd};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),Ji.litPropertyMetadata??(Ji.litPropertyMetadata=new WeakMap);let Ss=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??(this.l=[])).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=Xd){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const n=Symbol(),i=this.getPropertyDescriptor(e,n,t);i!==void 0&&Sb(this.prototype,e,i)}}static getPropertyDescriptor(e,t,n){const{get:i,set:s}=Cb(this.prototype,e)??{get(){return this[t]},set(a){this[t]=a}};return{get:i,set(a){const o=i?.call(this);s?.call(this,a),this.requestUpdate(e,o,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Xd}static _$Ei(){if(this.hasOwnProperty(ka("elementProperties")))return;const e=wb(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(ka("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(ka("properties"))){const t=this.properties,n=[...Ib(t),...Mb(t)];for(const i of n)this.createProperty(i,t[i])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[n,i]of t)this.elementProperties.set(n,i)}this._$Eh=new Map;for(const[t,n]of this.elementProperties){const i=this._$Eu(t,n);i!==void 0&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const n=new Set(e.flat(1/0).reverse());for(const i of n)t.unshift(Wd(i))}else e!==void 0&&t.push(Wd(e));return t}static _$Eu(e,t){const n=t.attribute;return n===!1?void 0:typeof n=="string"?n:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??(this._$EO=new Set)).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return xb(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){const n=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,n);if(i!==void 0&&n.reflect===!0){const s=(n.converter?.toAttribute!==void 0?n.converter:Tc).toAttribute(t,n.type);this._$Em=e,s==null?this.removeAttribute(i):this.setAttribute(i,s),this._$Em=null}}_$AK(e,t){const n=this.constructor,i=n._$Eh.get(e);if(i!==void 0&&this._$Em!==i){const s=n.getPropertyOptions(i),a=typeof s.converter=="function"?{fromAttribute:s.converter}:s.converter?.fromAttribute!==void 0?s.converter:Tc;this._$Em=i;const o=a.fromAttribute(t,s.type);this[i]=o??this._$Ej?.get(i)??o,this._$Em=null}}requestUpdate(e,t,n){if(e!==void 0){const i=this.constructor,s=this[e];if(n??(n=i.getPropertyOptions(e)),!((n.hasChanged??hd)(s,t)||n.useDefault&&n.reflect&&s===this._$Ej?.get(e)&&!this.hasAttribute(i._$Eu(e,n))))return;this.C(e,t,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:i,wrapped:s},a){n&&!(this._$Ej??(this._$Ej=new Map)).has(e)&&(this._$Ej.set(e,a??t??this[e]),s!==!0||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),i===!0&&this._$Em!==e&&(this._$Eq??(this._$Eq=new Set)).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[i,s]of this._$Ep)this[i]=s;this._$Ep=void 0}const n=this.constructor.elementProperties;if(n.size>0)for(const[i,s]of n){const{wrapped:a}=s,o=this[i];a!==!0||this._$AL.has(i)||o===void 0||this.C(i,void 0,s,o)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(t)):this._$EM()}catch(n){throw e=!1,this._$EM(),n}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&(this._$Eq=this._$Eq.forEach(t=>this._$ET(t,this[t]))),this._$EM()}updated(e){}firstUpdated(e){}};Ss.elementStyles=[],Ss.shadowRootOptions={mode:"open"},Ss[ka("elementProperties")]=new Map,Ss[ka("finalized")]=new Map,Rb?.({ReactiveElement:Ss}),(Ji.reactiveElementVersions??(Ji.reactiveElementVersions=[])).push("2.1.1");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Bb={attribute:!0,type:String,converter:Tc,reflect:!1,hasChanged:hd},Db=(r=Bb,e,t)=>{const{kind:n,metadata:i}=t;let s=globalThis.litPropertyMetadata.get(i);if(s===void 0&&globalThis.litPropertyMetadata.set(i,s=new Map),n==="setter"&&((r=Object.create(r)).wrapped=!0),s.set(t.name,r),n==="accessor"){const{name:a}=t;return{set(o){const c=e.get.call(this);e.set.call(this,o),this.requestUpdate(a,c,r)},init(o){return o!==void 0&&this.C(a,void 0,r,o),o}}}if(n==="setter"){const{name:a}=t;return function(o){const c=this[a];e.call(this,o),this.requestUpdate(a,c,r)}}throw Error("Unsupported decorator location: "+n)};function De(r){return(e,t)=>typeof t=="object"?Db(r,e,t):((n,i,s)=>{const a=i.hasOwnProperty(s);return i.constructor.createProperty(s,n),a?Object.getOwnPropertyDescriptor(i,s):void 0})(r,e,t)}/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Jc="178",Lb=0,$d=1,Fb=2,ag=1,Pb=2,yi=3,Xn=0,$t=1,Vt=2,ii=0,Tr=1,jd=2,Yd=3,Kd=4,Ub=5,Cs=100,Nb=101,Ob=102,kb=103,Qb=104,Gb=200,Hb=201,zb=202,Vb=203,uu=204,du=205,Wb=206,qb=207,Xb=208,$b=209,jb=210,Yb=211,Kb=212,Jb=213,Zb=214,fu=0,pu=1,Au=2,Or=3,mu=4,gu=5,bu=6,_u=7,og=0,e_=1,t_=2,si=0,cg=1,lg=2,hg=3,ug=4,n_=5,dg=6,qa=7,Jd="attached",i_="detached",kr=300,Ps=301,Qr=302,Rc=303,Eu=304,Zc=306,$n=1e3,Dt=1001,Us=1002,Nt=1003,co=1004,$i=1005,Ke=1006,Ts=1007,un=1008,Zd=1008,Mt=1009,ud=1010,dd=1011,Xa=1012,el=1013,es=1014,Lt=1015,Ut=1016,fd=1017,pd=1018,$a=1020,fg=35902,pg=1021,Ag=1022,yt=1023,ja=1026,Ya=1027,ji=1028,Ad=1029,Ms=1030,md=1031,gd=1033,Rr=33776,Rs=33777,Br=33778,Bs=33779,Bc=35840,vu=35841,Dc=35842,xu=35843,Lc=36196,Ka=37492,Ja=37496,Ds=37808,yu=37809,Su=37810,Cu=37811,Za=37812,Iu=37813,Mu=37814,wu=37815,Tu=37816,Ru=37817,Bu=37818,Du=37819,Lu=37820,Fu=37821,Ls=36492,Pu=36494,Fc=36495,mg=36283,Uu=36284,Nu=36285,Ou=36286,eo=2200,Dr=2201,Pc=2202,Gr=2300,Hr=2301,ul=2302,yr=2400,Sr=2401,Uc=2402,bd=2500,s_=2501,r_=0,gg=1,ku=2,a_=3200,o_=3201,bg=0,c_=1,Bn="",gt="srgb",bt="srgb-linear",Nc="linear",ht="srgb",zs=7680,ef=519,l_=512,h_=513,u_=514,_g=515,d_=516,f_=517,p_=518,A_=519,Qu=35044,tf="300 es",Mi=2e3,Oc=2001;class jn{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){const n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){const n=this._listeners;if(n===void 0)return;const i=n[e];if(i!==void 0){const s=i.indexOf(t);s!==-1&&i.splice(s,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const n=t[e.type];if(n!==void 0){e.target=this;const i=n.slice(0);for(let s=0,a=i.length;s<a;s++)i[s].call(this,e);e.target=null}}}const jt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let nf=1234567;const Qa=Math.PI/180,zr=180/Math.PI;function Wn(){const r=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(jt[r&255]+jt[r>>8&255]+jt[r>>16&255]+jt[r>>24&255]+"-"+jt[e&255]+jt[e>>8&255]+"-"+jt[e>>16&15|64]+jt[e>>24&255]+"-"+jt[t&63|128]+jt[t>>8&255]+"-"+jt[t>>16&255]+jt[t>>24&255]+jt[n&255]+jt[n>>8&255]+jt[n>>16&255]+jt[n>>24&255]).toLowerCase()}function We(r,e,t){return Math.max(e,Math.min(t,r))}function _d(r,e){return(r%e+e)%e}function m_(r,e,t,n,i){return n+(r-e)*(i-n)/(t-e)}function g_(r,e,t){return r!==e?(t-r)/(e-r):0}function Ga(r,e,t){return(1-t)*r+t*e}function b_(r,e,t,n){return Ga(r,e,1-Math.exp(-t*n))}function __(r,e=1){return e-Math.abs(_d(r,e*2)-e)}function E_(r,e,t){return r<=e?0:r>=t?1:(r=(r-e)/(t-e),r*r*(3-2*r))}function v_(r,e,t){return r<=e?0:r>=t?1:(r=(r-e)/(t-e),r*r*r*(r*(r*6-15)+10))}function x_(r,e){return r+Math.floor(Math.random()*(e-r+1))}function y_(r,e){return r+Math.random()*(e-r)}function S_(r){return r*(.5-Math.random())}function C_(r){r!==void 0&&(nf=r);let e=nf+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function I_(r){return r*Qa}function M_(r){return r*zr}function w_(r){return(r&r-1)===0&&r!==0}function T_(r){return Math.pow(2,Math.ceil(Math.log(r)/Math.LN2))}function R_(r){return Math.pow(2,Math.floor(Math.log(r)/Math.LN2))}function B_(r,e,t,n,i){const s=Math.cos,a=Math.sin,o=s(t/2),c=a(t/2),l=s((e+n)/2),u=a((e+n)/2),h=s((e-n)/2),d=a((e-n)/2),f=s((n-e)/2),p=a((n-e)/2);switch(i){case"XYX":r.set(o*u,c*h,c*d,o*l);break;case"YZY":r.set(c*d,o*u,c*h,o*l);break;case"ZXZ":r.set(c*h,c*d,o*u,o*l);break;case"XZX":r.set(o*u,c*p,c*f,o*l);break;case"YXY":r.set(c*f,o*u,c*p,o*l);break;case"ZYZ":r.set(c*p,c*f,o*u,o*l);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+i)}}function Hn(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return r/4294967295;case Uint16Array:return r/65535;case Uint8Array:return r/255;case Int32Array:return Math.max(r/2147483647,-1);case Int16Array:return Math.max(r/32767,-1);case Int8Array:return Math.max(r/127,-1);default:throw new Error("Invalid component type.")}}function ot(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return Math.round(r*4294967295);case Uint16Array:return Math.round(r*65535);case Uint8Array:return Math.round(r*255);case Int32Array:return Math.round(r*2147483647);case Int16Array:return Math.round(r*32767);case Int8Array:return Math.round(r*127);default:throw new Error("Invalid component type.")}}const kc={DEG2RAD:Qa,RAD2DEG:zr,generateUUID:Wn,clamp:We,euclideanModulo:_d,mapLinear:m_,inverseLerp:g_,lerp:Ga,damp:b_,pingpong:__,smoothstep:E_,smootherstep:v_,randInt:x_,randFloat:y_,randFloatSpread:S_,seededRandom:C_,degToRad:I_,radToDeg:M_,isPowerOfTwo:w_,ceilPowerOfTwo:T_,floorPowerOfTwo:R_,setQuaternionFromProperEuler:B_,normalize:ot,denormalize:Hn};class Oe{constructor(e=0,t=0){Oe.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=We(this.x,e.x,t.x),this.y=We(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=We(this.x,e,t),this.y=We(this.y,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(We(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(We(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),i=Math.sin(t),s=this.x-e.x,a=this.y-e.y;return this.x=s*n-a*i+e.x,this.y=s*i+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class dn{constructor(e=0,t=0,n=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=i}static slerpFlat(e,t,n,i,s,a,o){let c=n[i+0],l=n[i+1],u=n[i+2],h=n[i+3];const d=s[a+0],f=s[a+1],p=s[a+2],g=s[a+3];if(o===0){e[t+0]=c,e[t+1]=l,e[t+2]=u,e[t+3]=h;return}if(o===1){e[t+0]=d,e[t+1]=f,e[t+2]=p,e[t+3]=g;return}if(h!==g||c!==d||l!==f||u!==p){let m=1-o;const A=c*d+l*f+u*p+h*g,E=A>=0?1:-1,_=1-A*A;if(_>Number.EPSILON){const S=Math.sqrt(_),I=Math.atan2(S,A*E);m=Math.sin(m*I)/S,o=Math.sin(o*I)/S}const b=o*E;if(c=c*m+d*b,l=l*m+f*b,u=u*m+p*b,h=h*m+g*b,m===1-o){const S=1/Math.sqrt(c*c+l*l+u*u+h*h);c*=S,l*=S,u*=S,h*=S}}e[t]=c,e[t+1]=l,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,n,i,s,a){const o=n[i],c=n[i+1],l=n[i+2],u=n[i+3],h=s[a],d=s[a+1],f=s[a+2],p=s[a+3];return e[t]=o*p+u*h+c*f-l*d,e[t+1]=c*p+u*d+l*h-o*f,e[t+2]=l*p+u*f+o*d-c*h,e[t+3]=u*p-o*h-c*d-l*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,i=e._y,s=e._z,a=e._order,o=Math.cos,c=Math.sin,l=o(n/2),u=o(i/2),h=o(s/2),d=c(n/2),f=c(i/2),p=c(s/2);switch(a){case"XYZ":this._x=d*u*h+l*f*p,this._y=l*f*h-d*u*p,this._z=l*u*p+d*f*h,this._w=l*u*h-d*f*p;break;case"YXZ":this._x=d*u*h+l*f*p,this._y=l*f*h-d*u*p,this._z=l*u*p-d*f*h,this._w=l*u*h+d*f*p;break;case"ZXY":this._x=d*u*h-l*f*p,this._y=l*f*h+d*u*p,this._z=l*u*p+d*f*h,this._w=l*u*h-d*f*p;break;case"ZYX":this._x=d*u*h-l*f*p,this._y=l*f*h+d*u*p,this._z=l*u*p-d*f*h,this._w=l*u*h+d*f*p;break;case"YZX":this._x=d*u*h+l*f*p,this._y=l*f*h+d*u*p,this._z=l*u*p-d*f*h,this._w=l*u*h-d*f*p;break;case"XZY":this._x=d*u*h-l*f*p,this._y=l*f*h-d*u*p,this._z=l*u*p+d*f*h,this._w=l*u*h+d*f*p;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],i=t[4],s=t[8],a=t[1],o=t[5],c=t[9],l=t[2],u=t[6],h=t[10],d=n+o+h;if(d>0){const f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(u-c)*f,this._y=(s-l)*f,this._z=(a-i)*f}else if(n>o&&n>h){const f=2*Math.sqrt(1+n-o-h);this._w=(u-c)/f,this._x=.25*f,this._y=(i+a)/f,this._z=(s+l)/f}else if(o>h){const f=2*Math.sqrt(1+o-n-h);this._w=(s-l)/f,this._x=(i+a)/f,this._y=.25*f,this._z=(c+u)/f}else{const f=2*Math.sqrt(1+h-n-o);this._w=(a-i)/f,this._x=(s+l)/f,this._y=(c+u)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(We(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,i=e._y,s=e._z,a=e._w,o=t._x,c=t._y,l=t._z,u=t._w;return this._x=n*u+a*o+i*l-s*c,this._y=i*u+a*c+s*o-n*l,this._z=s*u+a*l+n*c-i*o,this._w=a*u-n*o-i*c-s*l,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,i=this._y,s=this._z,a=this._w;let o=a*e._w+n*e._x+i*e._y+s*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=n,this._y=i,this._z=s,this;const c=1-o*o;if(c<=Number.EPSILON){const f=1-t;return this._w=f*a+t*this._w,this._x=f*n+t*this._x,this._y=f*i+t*this._y,this._z=f*s+t*this._z,this.normalize(),this}const l=Math.sqrt(c),u=Math.atan2(l,o),h=Math.sin((1-t)*u)/l,d=Math.sin(t*u)/l;return this._w=a*h+this._w*d,this._x=n*h+this._x*d,this._y=i*h+this._y*d,this._z=s*h+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),s=Math.sqrt(n);return this.set(i*Math.sin(e),i*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class B{constructor(e=0,t=0,n=0){B.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(sf.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(sf.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,i=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*i,this.y=s[1]*t+s[4]*n+s[7]*i,this.z=s[2]*t+s[5]*n+s[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,s=e.elements,a=1/(s[3]*t+s[7]*n+s[11]*i+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*i+s[12])*a,this.y=(s[1]*t+s[5]*n+s[9]*i+s[13])*a,this.z=(s[2]*t+s[6]*n+s[10]*i+s[14])*a,this}applyQuaternion(e){const t=this.x,n=this.y,i=this.z,s=e.x,a=e.y,o=e.z,c=e.w,l=2*(a*i-o*n),u=2*(o*t-s*i),h=2*(s*n-a*t);return this.x=t+c*l+a*h-o*u,this.y=n+c*u+o*l-s*h,this.z=i+c*h+s*u-a*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,i=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*i,this.y=s[1]*t+s[5]*n+s[9]*i,this.z=s[2]*t+s[6]*n+s[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=We(this.x,e.x,t.x),this.y=We(this.y,e.y,t.y),this.z=We(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=We(this.x,e,t),this.y=We(this.y,e,t),this.z=We(this.z,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(We(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,i=e.y,s=e.z,a=t.x,o=t.y,c=t.z;return this.x=i*c-s*o,this.y=s*a-n*c,this.z=n*o-i*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return dl.copy(this).projectOnVector(e),this.sub(dl)}reflect(e){return this.sub(dl.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(We(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const dl=new B,sf=new dn;class Qe{constructor(e,t,n,i,s,a,o,c,l){Qe.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,i,s,a,o,c,l)}set(e,t,n,i,s,a,o,c,l){const u=this.elements;return u[0]=e,u[1]=i,u[2]=o,u[3]=t,u[4]=s,u[5]=c,u[6]=n,u[7]=a,u[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,s=this.elements,a=n[0],o=n[3],c=n[6],l=n[1],u=n[4],h=n[7],d=n[2],f=n[5],p=n[8],g=i[0],m=i[3],A=i[6],E=i[1],_=i[4],b=i[7],S=i[2],I=i[5],M=i[8];return s[0]=a*g+o*E+c*S,s[3]=a*m+o*_+c*I,s[6]=a*A+o*b+c*M,s[1]=l*g+u*E+h*S,s[4]=l*m+u*_+h*I,s[7]=l*A+u*b+h*M,s[2]=d*g+f*E+p*S,s[5]=d*m+f*_+p*I,s[8]=d*A+f*b+p*M,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],a=e[4],o=e[5],c=e[6],l=e[7],u=e[8];return t*a*u-t*o*l-n*s*u+n*o*c+i*s*l-i*a*c}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],a=e[4],o=e[5],c=e[6],l=e[7],u=e[8],h=u*a-o*l,d=o*c-u*s,f=l*s-a*c,p=t*h+n*d+i*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);const g=1/p;return e[0]=h*g,e[1]=(i*l-u*n)*g,e[2]=(o*n-i*a)*g,e[3]=d*g,e[4]=(u*t-i*c)*g,e[5]=(i*s-o*t)*g,e[6]=f*g,e[7]=(n*c-l*t)*g,e[8]=(a*t-n*s)*g,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,s,a,o){const c=Math.cos(s),l=Math.sin(s);return this.set(n*c,n*l,-n*(c*a+l*o)+a+e,-i*l,i*c,-i*(-l*a+c*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(fl.makeScale(e,t)),this}rotate(e){return this.premultiply(fl.makeRotation(-e)),this}translate(e,t){return this.premultiply(fl.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const fl=new Qe;function Eg(r){for(let e=r.length-1;e>=0;--e)if(r[e]>=65535)return!0;return!1}function to(r){return document.createElementNS("http://www.w3.org/1999/xhtml",r)}function D_(){const r=to("canvas");return r.style.display="block",r}const rf={};function Lr(r){r in rf||(rf[r]=!0,console.warn(r))}function L_(r,e,t){return new Promise(function(n,i){function s(){switch(r.clientWaitSync(e,r.SYNC_FLUSH_COMMANDS_BIT,0)){case r.WAIT_FAILED:i();break;case r.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:n()}}setTimeout(s,t)})}function F_(r){const e=r.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function P_(r){const e=r.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const af=new Qe().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),of=new Qe().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function U_(){const r={enabled:!0,workingColorSpace:bt,spaces:{},convert:function(i,s,a){return this.enabled===!1||s===a||!s||!a||(this.spaces[s].transfer===ht&&(i.r=Ri(i.r),i.g=Ri(i.g),i.b=Ri(i.b)),this.spaces[s].primaries!==this.spaces[a].primaries&&(i.applyMatrix3(this.spaces[s].toXYZ),i.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===ht&&(i.r=Fr(i.r),i.g=Fr(i.g),i.b=Fr(i.b))),i},workingToColorSpace:function(i,s){return this.convert(i,this.workingColorSpace,s)},colorSpaceToWorking:function(i,s){return this.convert(i,s,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===Bn?Nc:this.spaces[i].transfer},getLuminanceCoefficients:function(i,s=this.workingColorSpace){return i.fromArray(this.spaces[s].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,s,a){return i.copy(this.spaces[s].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(i,s){return Lr("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),r.workingToColorSpace(i,s)},toWorkingColorSpace:function(i,s){return Lr("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),r.colorSpaceToWorking(i,s)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return r.define({[bt]:{primaries:e,whitePoint:n,transfer:Nc,toXYZ:af,fromXYZ:of,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:gt},outputColorSpaceConfig:{drawingBufferColorSpace:gt}},[gt]:{primaries:e,whitePoint:n,transfer:ht,toXYZ:af,fromXYZ:of,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:gt}}}),r}const Ye=U_();function Ri(r){return r<.04045?r*.0773993808:Math.pow(r*.9478672986+.0521327014,2.4)}function Fr(r){return r<.0031308?r*12.92:1.055*Math.pow(r,.41666)-.055}let Vs;class vg{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Vs===void 0&&(Vs=to("canvas")),Vs.width=e.width,Vs.height=e.height;const i=Vs.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),n=Vs}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=to("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const i=n.getImageData(0,0,e.width,e.height),s=i.data;for(let a=0;a<s.length;a++)s[a]=Ri(s[a]/255)*255;return n.putImageData(i,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Ri(t[n]/255)*255):t[n]=Ri(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let N_=0;class tl{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:N_++}),this.uuid=Wn(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let s;if(Array.isArray(i)){s=[];for(let a=0,o=i.length;a<o;a++)i[a].isDataTexture?s.push(pl(i[a].image)):s.push(pl(i[a]))}else s=pl(i);n.url=s}return t||(e.images[this.uuid]=n),n}}function pl(r){return typeof HTMLImageElement<"u"&&r instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&r instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&r instanceof ImageBitmap?vg.getDataURL(r):r.data?{data:Array.from(r.data),width:r.width,height:r.height,type:r.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let O_=0;const Al=new B;let St=class _c extends jn{constructor(e=_c.DEFAULT_IMAGE,t=_c.DEFAULT_MAPPING,n=Dt,i=Dt,s=Ke,a=un,o=yt,c=Mt,l=_c.DEFAULT_ANISOTROPY,u=Bn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:O_++}),this.uuid=Wn(),this.name="",this.source=new tl(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=s,this.minFilter=a,this.anisotropy=l,this.format=o,this.internalFormat=null,this.type=c,this.offset=new Oe(0,0),this.repeat=new Oe(1,1),this.center=new Oe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Qe,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(Al).x}get height(){return this.source.getSize(Al).y}get depth(){return this.source.getSize(Al).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const i=this[t];if(i===void 0){console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`);continue}i&&n&&i.isVector2&&n.isVector2||i&&n&&i.isVector3&&n.isVector3||i&&n&&i.isMatrix3&&n.isMatrix3?i.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==kr)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case $n:e.x=e.x-Math.floor(e.x);break;case Dt:e.x=e.x<0?0:1;break;case Us:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case $n:e.y=e.y-Math.floor(e.y);break;case Dt:e.y=e.y<0?0:1;break;case Us:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};St.DEFAULT_IMAGE=null;St.DEFAULT_MAPPING=kr;St.DEFAULT_ANISOTROPY=1;class it{constructor(e=0,t=0,n=0,i=1){it.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,s=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*i+a[12]*s,this.y=a[1]*t+a[5]*n+a[9]*i+a[13]*s,this.z=a[2]*t+a[6]*n+a[10]*i+a[14]*s,this.w=a[3]*t+a[7]*n+a[11]*i+a[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,i,s;const c=e.elements,l=c[0],u=c[4],h=c[8],d=c[1],f=c[5],p=c[9],g=c[2],m=c[6],A=c[10];if(Math.abs(u-d)<.01&&Math.abs(h-g)<.01&&Math.abs(p-m)<.01){if(Math.abs(u+d)<.1&&Math.abs(h+g)<.1&&Math.abs(p+m)<.1&&Math.abs(l+f+A-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const _=(l+1)/2,b=(f+1)/2,S=(A+1)/2,I=(u+d)/4,M=(h+g)/4,w=(p+m)/4;return _>b&&_>S?_<.01?(n=0,i=.707106781,s=.707106781):(n=Math.sqrt(_),i=I/n,s=M/n):b>S?b<.01?(n=.707106781,i=0,s=.707106781):(i=Math.sqrt(b),n=I/i,s=w/i):S<.01?(n=.707106781,i=.707106781,s=0):(s=Math.sqrt(S),n=M/s,i=w/s),this.set(n,i,s,t),this}let E=Math.sqrt((m-p)*(m-p)+(h-g)*(h-g)+(d-u)*(d-u));return Math.abs(E)<.001&&(E=1),this.x=(m-p)/E,this.y=(h-g)/E,this.z=(d-u)/E,this.w=Math.acos((l+f+A-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=We(this.x,e.x,t.x),this.y=We(this.y,e.y,t.y),this.z=We(this.z,e.z,t.z),this.w=We(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=We(this.x,e,t),this.y=We(this.y,e,t),this.z=We(this.z,e,t),this.w=We(this.w,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(We(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class k_ extends jn{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Ke,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new it(0,0,e,t),this.scissorTest=!1,this.viewport=new it(0,0,e,t);const i={width:e,height:t,depth:n.depth},s=new St(i);this.textures=[];const a=n.count;for(let o=0;o<a;o++)this.textures[o]=s.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){const t={minFilter:Ke,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let i=0,s=this.textures.length;i<s;i++)this.textures[i].image.width=e,this.textures[i].image.height=t,this.textures[i].image.depth=n,this.textures[i].isArrayTexture=this.textures[i].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const i=Object.assign({},e.textures[t].image);this.textures[t].source=new tl(i)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Fn extends k_{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class xg extends St{constructor(e=null,t=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=Nt,this.minFilter=Nt,this.wrapR=Dt,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class yg extends St{constructor(e=null,t=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=Nt,this.minFilter=Nt,this.wrapR=Dt,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class hn{constructor(e=new B(1/0,1/0,1/0),t=new B(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(On.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(On.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=On.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const s=n.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=s.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,On):On.fromBufferAttribute(s,a),On.applyMatrix4(e.matrixWorld),this.expandByPoint(On);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),go.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),go.copy(n.boundingBox)),go.applyMatrix4(e.matrixWorld),this.union(go)}const i=e.children;for(let s=0,a=i.length;s<a;s++)this.expandByObject(i[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,On),On.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(ia),bo.subVectors(this.max,ia),Ws.subVectors(e.a,ia),qs.subVectors(e.b,ia),Xs.subVectors(e.c,ia),Fi.subVectors(qs,Ws),Pi.subVectors(Xs,qs),ss.subVectors(Ws,Xs);let t=[0,-Fi.z,Fi.y,0,-Pi.z,Pi.y,0,-ss.z,ss.y,Fi.z,0,-Fi.x,Pi.z,0,-Pi.x,ss.z,0,-ss.x,-Fi.y,Fi.x,0,-Pi.y,Pi.x,0,-ss.y,ss.x,0];return!ml(t,Ws,qs,Xs,bo)||(t=[1,0,0,0,1,0,0,0,1],!ml(t,Ws,qs,Xs,bo))?!1:(_o.crossVectors(Fi,Pi),t=[_o.x,_o.y,_o.z],ml(t,Ws,qs,Xs,bo))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,On).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(On).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(hi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),hi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),hi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),hi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),hi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),hi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),hi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),hi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(hi),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const hi=[new B,new B,new B,new B,new B,new B,new B,new B],On=new B,go=new hn,Ws=new B,qs=new B,Xs=new B,Fi=new B,Pi=new B,ss=new B,ia=new B,bo=new B,_o=new B,rs=new B;function ml(r,e,t,n,i){for(let s=0,a=r.length-3;s<=a;s+=3){rs.fromArray(r,s);const o=i.x*Math.abs(rs.x)+i.y*Math.abs(rs.y)+i.z*Math.abs(rs.z),c=e.dot(rs),l=t.dot(rs),u=n.dot(rs);if(Math.max(-Math.max(c,l,u),Math.min(c,l,u))>o)return!1}return!0}const Q_=new hn,sa=new B,gl=new B;class Un{constructor(e=new B,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):Q_.setFromPoints(e).getCenter(n);let i=0;for(let s=0,a=e.length;s<a;s++)i=Math.max(i,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;sa.subVectors(e,this.center);const t=sa.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),i=(n-this.radius)*.5;this.center.addScaledVector(sa,i/n),this.radius+=i}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(gl.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(sa.copy(e.center).add(gl)),this.expandByPoint(sa.copy(e.center).sub(gl))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}const ui=new B,bl=new B,Eo=new B,Ui=new B,_l=new B,vo=new B,El=new B;class lo{constructor(e=new B,t=new B(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,ui)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=ui.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(ui.copy(this.origin).addScaledVector(this.direction,t),ui.distanceToSquared(e))}distanceSqToSegment(e,t,n,i){bl.copy(e).add(t).multiplyScalar(.5),Eo.copy(t).sub(e).normalize(),Ui.copy(this.origin).sub(bl);const s=e.distanceTo(t)*.5,a=-this.direction.dot(Eo),o=Ui.dot(this.direction),c=-Ui.dot(Eo),l=Ui.lengthSq(),u=Math.abs(1-a*a);let h,d,f,p;if(u>0)if(h=a*c-o,d=a*o-c,p=s*u,h>=0)if(d>=-p)if(d<=p){const g=1/u;h*=g,d*=g,f=h*(h+a*d+2*o)+d*(a*h+d+2*c)+l}else d=s,h=Math.max(0,-(a*d+o)),f=-h*h+d*(d+2*c)+l;else d=-s,h=Math.max(0,-(a*d+o)),f=-h*h+d*(d+2*c)+l;else d<=-p?(h=Math.max(0,-(-a*s+o)),d=h>0?-s:Math.min(Math.max(-s,-c),s),f=-h*h+d*(d+2*c)+l):d<=p?(h=0,d=Math.min(Math.max(-s,-c),s),f=d*(d+2*c)+l):(h=Math.max(0,-(a*s+o)),d=h>0?s:Math.min(Math.max(-s,-c),s),f=-h*h+d*(d+2*c)+l);else d=a>0?-s:s,h=Math.max(0,-(a*d+o)),f=-h*h+d*(d+2*c)+l;return n&&n.copy(this.origin).addScaledVector(this.direction,h),i&&i.copy(bl).addScaledVector(Eo,d),f}intersectSphere(e,t){ui.subVectors(e.center,this.origin);const n=ui.dot(this.direction),i=ui.dot(ui)-n*n,s=e.radius*e.radius;if(i>s)return null;const a=Math.sqrt(s-i),o=n-a,c=n+a;return c<0?null:o<0?this.at(c,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,i,s,a,o,c;const l=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,d=this.origin;return l>=0?(n=(e.min.x-d.x)*l,i=(e.max.x-d.x)*l):(n=(e.max.x-d.x)*l,i=(e.min.x-d.x)*l),u>=0?(s=(e.min.y-d.y)*u,a=(e.max.y-d.y)*u):(s=(e.max.y-d.y)*u,a=(e.min.y-d.y)*u),n>a||s>i||((s>n||isNaN(n))&&(n=s),(a<i||isNaN(i))&&(i=a),h>=0?(o=(e.min.z-d.z)*h,c=(e.max.z-d.z)*h):(o=(e.max.z-d.z)*h,c=(e.min.z-d.z)*h),n>c||o>i)||((o>n||n!==n)&&(n=o),(c<i||i!==i)&&(i=c),i<0)?null:this.at(n>=0?n:i,t)}intersectsBox(e){return this.intersectBox(e,ui)!==null}intersectTriangle(e,t,n,i,s){_l.subVectors(t,e),vo.subVectors(n,e),El.crossVectors(_l,vo);let a=this.direction.dot(El),o;if(a>0){if(i)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Ui.subVectors(this.origin,e);const c=o*this.direction.dot(vo.crossVectors(Ui,vo));if(c<0)return null;const l=o*this.direction.dot(_l.cross(Ui));if(l<0||c+l>a)return null;const u=-o*Ui.dot(El);return u<0?null:this.at(u/a,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Pe{constructor(e,t,n,i,s,a,o,c,l,u,h,d,f,p,g,m){Pe.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,i,s,a,o,c,l,u,h,d,f,p,g,m)}set(e,t,n,i,s,a,o,c,l,u,h,d,f,p,g,m){const A=this.elements;return A[0]=e,A[4]=t,A[8]=n,A[12]=i,A[1]=s,A[5]=a,A[9]=o,A[13]=c,A[2]=l,A[6]=u,A[10]=h,A[14]=d,A[3]=f,A[7]=p,A[11]=g,A[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Pe().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,i=1/$s.setFromMatrixColumn(e,0).length(),s=1/$s.setFromMatrixColumn(e,1).length(),a=1/$s.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,i=e.y,s=e.z,a=Math.cos(n),o=Math.sin(n),c=Math.cos(i),l=Math.sin(i),u=Math.cos(s),h=Math.sin(s);if(e.order==="XYZ"){const d=a*u,f=a*h,p=o*u,g=o*h;t[0]=c*u,t[4]=-c*h,t[8]=l,t[1]=f+p*l,t[5]=d-g*l,t[9]=-o*c,t[2]=g-d*l,t[6]=p+f*l,t[10]=a*c}else if(e.order==="YXZ"){const d=c*u,f=c*h,p=l*u,g=l*h;t[0]=d+g*o,t[4]=p*o-f,t[8]=a*l,t[1]=a*h,t[5]=a*u,t[9]=-o,t[2]=f*o-p,t[6]=g+d*o,t[10]=a*c}else if(e.order==="ZXY"){const d=c*u,f=c*h,p=l*u,g=l*h;t[0]=d-g*o,t[4]=-a*h,t[8]=p+f*o,t[1]=f+p*o,t[5]=a*u,t[9]=g-d*o,t[2]=-a*l,t[6]=o,t[10]=a*c}else if(e.order==="ZYX"){const d=a*u,f=a*h,p=o*u,g=o*h;t[0]=c*u,t[4]=p*l-f,t[8]=d*l+g,t[1]=c*h,t[5]=g*l+d,t[9]=f*l-p,t[2]=-l,t[6]=o*c,t[10]=a*c}else if(e.order==="YZX"){const d=a*c,f=a*l,p=o*c,g=o*l;t[0]=c*u,t[4]=g-d*h,t[8]=p*h+f,t[1]=h,t[5]=a*u,t[9]=-o*u,t[2]=-l*u,t[6]=f*h+p,t[10]=d-g*h}else if(e.order==="XZY"){const d=a*c,f=a*l,p=o*c,g=o*l;t[0]=c*u,t[4]=-h,t[8]=l*u,t[1]=d*h+g,t[5]=a*u,t[9]=f*h-p,t[2]=p*h-f,t[6]=o*u,t[10]=g*h+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(G_,e,H_)}lookAt(e,t,n){const i=this.elements;return bn.subVectors(e,t),bn.lengthSq()===0&&(bn.z=1),bn.normalize(),Ni.crossVectors(n,bn),Ni.lengthSq()===0&&(Math.abs(n.z)===1?bn.x+=1e-4:bn.z+=1e-4,bn.normalize(),Ni.crossVectors(n,bn)),Ni.normalize(),xo.crossVectors(bn,Ni),i[0]=Ni.x,i[4]=xo.x,i[8]=bn.x,i[1]=Ni.y,i[5]=xo.y,i[9]=bn.y,i[2]=Ni.z,i[6]=xo.z,i[10]=bn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,s=this.elements,a=n[0],o=n[4],c=n[8],l=n[12],u=n[1],h=n[5],d=n[9],f=n[13],p=n[2],g=n[6],m=n[10],A=n[14],E=n[3],_=n[7],b=n[11],S=n[15],I=i[0],M=i[4],w=i[8],x=i[12],v=i[1],R=i[5],k=i[9],F=i[13],P=i[2],G=i[6],O=i[10],W=i[14],Q=i[3],Y=i[7],ne=i[11],re=i[15];return s[0]=a*I+o*v+c*P+l*Q,s[4]=a*M+o*R+c*G+l*Y,s[8]=a*w+o*k+c*O+l*ne,s[12]=a*x+o*F+c*W+l*re,s[1]=u*I+h*v+d*P+f*Q,s[5]=u*M+h*R+d*G+f*Y,s[9]=u*w+h*k+d*O+f*ne,s[13]=u*x+h*F+d*W+f*re,s[2]=p*I+g*v+m*P+A*Q,s[6]=p*M+g*R+m*G+A*Y,s[10]=p*w+g*k+m*O+A*ne,s[14]=p*x+g*F+m*W+A*re,s[3]=E*I+_*v+b*P+S*Q,s[7]=E*M+_*R+b*G+S*Y,s[11]=E*w+_*k+b*O+S*ne,s[15]=E*x+_*F+b*W+S*re,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],i=e[8],s=e[12],a=e[1],o=e[5],c=e[9],l=e[13],u=e[2],h=e[6],d=e[10],f=e[14],p=e[3],g=e[7],m=e[11],A=e[15];return p*(+s*c*h-i*l*h-s*o*d+n*l*d+i*o*f-n*c*f)+g*(+t*c*f-t*l*d+s*a*d-i*a*f+i*l*u-s*c*u)+m*(+t*l*h-t*o*f-s*a*h+n*a*f+s*o*u-n*l*u)+A*(-i*o*u-t*c*h+t*o*d+i*a*h-n*a*d+n*c*u)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const i=this.elements;return e.isVector3?(i[12]=e.x,i[13]=e.y,i[14]=e.z):(i[12]=e,i[13]=t,i[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],a=e[4],o=e[5],c=e[6],l=e[7],u=e[8],h=e[9],d=e[10],f=e[11],p=e[12],g=e[13],m=e[14],A=e[15],E=h*m*l-g*d*l+g*c*f-o*m*f-h*c*A+o*d*A,_=p*d*l-u*m*l-p*c*f+a*m*f+u*c*A-a*d*A,b=u*g*l-p*h*l+p*o*f-a*g*f-u*o*A+a*h*A,S=p*h*c-u*g*c-p*o*d+a*g*d+u*o*m-a*h*m,I=t*E+n*_+i*b+s*S;if(I===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const M=1/I;return e[0]=E*M,e[1]=(g*d*s-h*m*s-g*i*f+n*m*f+h*i*A-n*d*A)*M,e[2]=(o*m*s-g*c*s+g*i*l-n*m*l-o*i*A+n*c*A)*M,e[3]=(h*c*s-o*d*s-h*i*l+n*d*l+o*i*f-n*c*f)*M,e[4]=_*M,e[5]=(u*m*s-p*d*s+p*i*f-t*m*f-u*i*A+t*d*A)*M,e[6]=(p*c*s-a*m*s-p*i*l+t*m*l+a*i*A-t*c*A)*M,e[7]=(a*d*s-u*c*s+u*i*l-t*d*l-a*i*f+t*c*f)*M,e[8]=b*M,e[9]=(p*h*s-u*g*s-p*n*f+t*g*f+u*n*A-t*h*A)*M,e[10]=(a*g*s-p*o*s+p*n*l-t*g*l-a*n*A+t*o*A)*M,e[11]=(u*o*s-a*h*s-u*n*l+t*h*l+a*n*f-t*o*f)*M,e[12]=S*M,e[13]=(u*g*i-p*h*i+p*n*d-t*g*d-u*n*m+t*h*m)*M,e[14]=(p*o*i-a*g*i-p*n*c+t*g*c+a*n*m-t*o*m)*M,e[15]=(a*h*i-u*o*i+u*n*c-t*h*c-a*n*d+t*o*d)*M,this}scale(e){const t=this.elements,n=e.x,i=e.y,s=e.z;return t[0]*=n,t[4]*=i,t[8]*=s,t[1]*=n,t[5]*=i,t[9]*=s,t[2]*=n,t[6]*=i,t[10]*=s,t[3]*=n,t[7]*=i,t[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),i=Math.sin(t),s=1-n,a=e.x,o=e.y,c=e.z,l=s*a,u=s*o;return this.set(l*a+n,l*o-i*c,l*c+i*o,0,l*o+i*c,u*o+n,u*c-i*a,0,l*c-i*o,u*c+i*a,s*c*c+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,i,s,a){return this.set(1,n,s,0,e,1,a,0,t,i,1,0,0,0,0,1),this}compose(e,t,n){const i=this.elements,s=t._x,a=t._y,o=t._z,c=t._w,l=s+s,u=a+a,h=o+o,d=s*l,f=s*u,p=s*h,g=a*u,m=a*h,A=o*h,E=c*l,_=c*u,b=c*h,S=n.x,I=n.y,M=n.z;return i[0]=(1-(g+A))*S,i[1]=(f+b)*S,i[2]=(p-_)*S,i[3]=0,i[4]=(f-b)*I,i[5]=(1-(d+A))*I,i[6]=(m+E)*I,i[7]=0,i[8]=(p+_)*M,i[9]=(m-E)*M,i[10]=(1-(d+g))*M,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){const i=this.elements;let s=$s.set(i[0],i[1],i[2]).length();const a=$s.set(i[4],i[5],i[6]).length(),o=$s.set(i[8],i[9],i[10]).length();this.determinant()<0&&(s=-s),e.x=i[12],e.y=i[13],e.z=i[14],kn.copy(this);const l=1/s,u=1/a,h=1/o;return kn.elements[0]*=l,kn.elements[1]*=l,kn.elements[2]*=l,kn.elements[4]*=u,kn.elements[5]*=u,kn.elements[6]*=u,kn.elements[8]*=h,kn.elements[9]*=h,kn.elements[10]*=h,t.setFromRotationMatrix(kn),n.x=s,n.y=a,n.z=o,this}makePerspective(e,t,n,i,s,a,o=Mi){const c=this.elements,l=2*s/(t-e),u=2*s/(n-i),h=(t+e)/(t-e),d=(n+i)/(n-i);let f,p;if(o===Mi)f=-(a+s)/(a-s),p=-2*a*s/(a-s);else if(o===Oc)f=-a/(a-s),p=-a*s/(a-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=l,c[4]=0,c[8]=h,c[12]=0,c[1]=0,c[5]=u,c[9]=d,c[13]=0,c[2]=0,c[6]=0,c[10]=f,c[14]=p,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,i,s,a,o=Mi){const c=this.elements,l=1/(t-e),u=1/(n-i),h=1/(a-s),d=(t+e)*l,f=(n+i)*u;let p,g;if(o===Mi)p=(a+s)*h,g=-2*h;else if(o===Oc)p=s*h,g=-1*h;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=2*l,c[4]=0,c[8]=0,c[12]=-d,c[1]=0,c[5]=2*u,c[9]=0,c[13]=-f,c[2]=0,c[6]=0,c[10]=g,c[14]=-p,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const $s=new B,kn=new Pe,G_=new B(0,0,0),H_=new B(1,1,1),Ni=new B,xo=new B,bn=new B,cf=new Pe,lf=new dn;class Pn{constructor(e=0,t=0,n=0,i=Pn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i=this._order){return this._x=e,this._y=t,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const i=e.elements,s=i[0],a=i[4],o=i[8],c=i[1],l=i[5],u=i[9],h=i[2],d=i[6],f=i[10];switch(t){case"XYZ":this._y=Math.asin(We(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,f),this._z=Math.atan2(-a,s)):(this._x=Math.atan2(d,l),this._z=0);break;case"YXZ":this._x=Math.asin(-We(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-h,s),this._z=0);break;case"ZXY":this._x=Math.asin(We(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-h,f),this._z=Math.atan2(-a,l)):(this._y=0,this._z=Math.atan2(c,s));break;case"ZYX":this._y=Math.asin(-We(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(c,s)):(this._x=0,this._z=Math.atan2(-a,l));break;case"YZX":this._z=Math.asin(We(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-u,l),this._y=Math.atan2(-h,s)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-We(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,l),this._y=Math.atan2(o,s)):(this._x=Math.atan2(-u,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return cf.makeRotationFromQuaternion(e),this.setFromRotationMatrix(cf,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return lf.setFromEuler(this),this.setFromQuaternion(lf,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Pn.DEFAULT_ORDER="XYZ";class Ed{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let z_=0;const hf=new B,js=new dn,di=new Pe,yo=new B,ra=new B,V_=new B,W_=new dn,uf=new B(1,0,0),df=new B(0,1,0),ff=new B(0,0,1),pf={type:"added"},q_={type:"removed"},Ys={type:"childadded",child:null},vl={type:"childremoved",child:null};class ft extends jn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:z_++}),this.uuid=Wn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=ft.DEFAULT_UP.clone();const e=new B,t=new Pn,n=new dn,i=new B(1,1,1);function s(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(s),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Pe},normalMatrix:{value:new Qe}}),this.matrix=new Pe,this.matrixWorld=new Pe,this.matrixAutoUpdate=ft.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=ft.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Ed,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return js.setFromAxisAngle(e,t),this.quaternion.multiply(js),this}rotateOnWorldAxis(e,t){return js.setFromAxisAngle(e,t),this.quaternion.premultiply(js),this}rotateX(e){return this.rotateOnAxis(uf,e)}rotateY(e){return this.rotateOnAxis(df,e)}rotateZ(e){return this.rotateOnAxis(ff,e)}translateOnAxis(e,t){return hf.copy(e).applyQuaternion(this.quaternion),this.position.add(hf.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(uf,e)}translateY(e){return this.translateOnAxis(df,e)}translateZ(e){return this.translateOnAxis(ff,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(di.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?yo.copy(e):yo.set(e,t,n);const i=this.parent;this.updateWorldMatrix(!0,!1),ra.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?di.lookAt(ra,yo,this.up):di.lookAt(yo,ra,this.up),this.quaternion.setFromRotationMatrix(di),i&&(di.extractRotation(i.matrixWorld),js.setFromRotationMatrix(di),this.quaternion.premultiply(js.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(pf),Ys.child=e,this.dispatchEvent(Ys),Ys.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(q_),vl.child=e,this.dispatchEvent(vl),vl.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),di.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),di.multiply(e.parent.matrixWorld)),e.applyMatrix4(di),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(pf),Ys.child=e,this.dispatchEvent(Ys),Ys.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){const a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const i=this.children;for(let s=0,a=i.length;s<a;s++)i[s].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ra,e,V_),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ra,W_,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const i=this.children;for(let s=0,a=i.length;s<a;s++)i[s].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const i={};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),i.instanceInfo=this._instanceInfo.map(o=>({...o})),i.availableInstanceIds=this._availableInstanceIds.slice(),i.availableGeometryIds=this._availableGeometryIds.slice(),i.nextIndexStart=this._nextIndexStart,i.nextVertexStart=this._nextVertexStart,i.geometryCount=this._geometryCount,i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.matricesTexture=this._matricesTexture.toJSON(e),i.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(i.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(i.boundingBox=this.boundingBox.toJSON()));function s(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=s(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const c=o.shapes;if(Array.isArray(c))for(let l=0,u=c.length;l<u;l++){const h=c[l];s(e.shapes,h)}else s(e.shapes,c)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let c=0,l=this.material.length;c<l;c++)o.push(s(e.materials,this.material[c]));i.material=o}else i.material=s(e.materials,this.material);if(this.children.length>0){i.children=[];for(let o=0;o<this.children.length;o++)i.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let o=0;o<this.animations.length;o++){const c=this.animations[o];i.animations.push(s(e.animations,c))}}if(t){const o=a(e.geometries),c=a(e.materials),l=a(e.textures),u=a(e.images),h=a(e.shapes),d=a(e.skeletons),f=a(e.animations),p=a(e.nodes);o.length>0&&(n.geometries=o),c.length>0&&(n.materials=c),l.length>0&&(n.textures=l),u.length>0&&(n.images=u),h.length>0&&(n.shapes=h),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),p.length>0&&(n.nodes=p)}return n.object=i,n;function a(o){const c=[];for(const l in o){const u=o[l];delete u.metadata,c.push(u)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const i=e.children[n];this.add(i.clone())}return this}}ft.DEFAULT_UP=new B(0,1,0);ft.DEFAULT_MATRIX_AUTO_UPDATE=!0;ft.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Qn=new B,fi=new B,xl=new B,pi=new B,Ks=new B,Js=new B,Af=new B,yl=new B,Sl=new B,Cl=new B,Il=new it,Ml=new it,wl=new it;class vn{constructor(e=new B,t=new B,n=new B){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i.subVectors(n,t),Qn.subVectors(e,t),i.cross(Qn);const s=i.lengthSq();return s>0?i.multiplyScalar(1/Math.sqrt(s)):i.set(0,0,0)}static getBarycoord(e,t,n,i,s){Qn.subVectors(i,t),fi.subVectors(n,t),xl.subVectors(e,t);const a=Qn.dot(Qn),o=Qn.dot(fi),c=Qn.dot(xl),l=fi.dot(fi),u=fi.dot(xl),h=a*l-o*o;if(h===0)return s.set(0,0,0),null;const d=1/h,f=(l*c-o*u)*d,p=(a*u-o*c)*d;return s.set(1-f-p,p,f)}static containsPoint(e,t,n,i){return this.getBarycoord(e,t,n,i,pi)===null?!1:pi.x>=0&&pi.y>=0&&pi.x+pi.y<=1}static getInterpolation(e,t,n,i,s,a,o,c){return this.getBarycoord(e,t,n,i,pi)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(s,pi.x),c.addScaledVector(a,pi.y),c.addScaledVector(o,pi.z),c)}static getInterpolatedAttribute(e,t,n,i,s,a){return Il.setScalar(0),Ml.setScalar(0),wl.setScalar(0),Il.fromBufferAttribute(e,t),Ml.fromBufferAttribute(e,n),wl.fromBufferAttribute(e,i),a.setScalar(0),a.addScaledVector(Il,s.x),a.addScaledVector(Ml,s.y),a.addScaledVector(wl,s.z),a}static isFrontFacing(e,t,n,i){return Qn.subVectors(n,t),fi.subVectors(e,t),Qn.cross(fi).dot(i)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}setFromAttributeAndIndices(e,t,n,i){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Qn.subVectors(this.c,this.b),fi.subVectors(this.a,this.b),Qn.cross(fi).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return vn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return vn.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,i,s){return vn.getInterpolation(e,this.a,this.b,this.c,t,n,i,s)}containsPoint(e){return vn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return vn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,i=this.b,s=this.c;let a,o;Ks.subVectors(i,n),Js.subVectors(s,n),yl.subVectors(e,n);const c=Ks.dot(yl),l=Js.dot(yl);if(c<=0&&l<=0)return t.copy(n);Sl.subVectors(e,i);const u=Ks.dot(Sl),h=Js.dot(Sl);if(u>=0&&h<=u)return t.copy(i);const d=c*h-u*l;if(d<=0&&c>=0&&u<=0)return a=c/(c-u),t.copy(n).addScaledVector(Ks,a);Cl.subVectors(e,s);const f=Ks.dot(Cl),p=Js.dot(Cl);if(p>=0&&f<=p)return t.copy(s);const g=f*l-c*p;if(g<=0&&l>=0&&p<=0)return o=l/(l-p),t.copy(n).addScaledVector(Js,o);const m=u*p-f*h;if(m<=0&&h-u>=0&&f-p>=0)return Af.subVectors(s,i),o=(h-u)/(h-u+(f-p)),t.copy(i).addScaledVector(Af,o);const A=1/(m+g+d);return a=g*A,o=d*A,t.copy(n).addScaledVector(Ks,a).addScaledVector(Js,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Sg={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Oi={h:0,s:0,l:0},So={h:0,s:0,l:0};function Tl(r,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?r+(e-r)*6*t:t<1/2?e:t<2/3?r+(e-r)*6*(2/3-t):r}class Me{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const i=e;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=gt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Ye.colorSpaceToWorking(this,t),this}setRGB(e,t,n,i=Ye.workingColorSpace){return this.r=e,this.g=t,this.b=n,Ye.colorSpaceToWorking(this,i),this}setHSL(e,t,n,i=Ye.workingColorSpace){if(e=_d(e,1),t=We(t,0,1),n=We(n,0,1),t===0)this.r=this.g=this.b=n;else{const s=n<=.5?n*(1+t):n+t-n*t,a=2*n-s;this.r=Tl(a,s,e+1/3),this.g=Tl(a,s,e),this.b=Tl(a,s,e-1/3)}return Ye.colorSpaceToWorking(this,i),this}setStyle(e,t=gt){function n(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const a=i[1],o=i[2];switch(a){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=i[1],a=s.length;if(a===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=gt){const n=Sg[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Ri(e.r),this.g=Ri(e.g),this.b=Ri(e.b),this}copyLinearToSRGB(e){return this.r=Fr(e.r),this.g=Fr(e.g),this.b=Fr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=gt){return Ye.workingToColorSpace(Yt.copy(this),e),Math.round(We(Yt.r*255,0,255))*65536+Math.round(We(Yt.g*255,0,255))*256+Math.round(We(Yt.b*255,0,255))}getHexString(e=gt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Ye.workingColorSpace){Ye.workingToColorSpace(Yt.copy(this),t);const n=Yt.r,i=Yt.g,s=Yt.b,a=Math.max(n,i,s),o=Math.min(n,i,s);let c,l;const u=(o+a)/2;if(o===a)c=0,l=0;else{const h=a-o;switch(l=u<=.5?h/(a+o):h/(2-a-o),a){case n:c=(i-s)/h+(i<s?6:0);break;case i:c=(s-n)/h+2;break;case s:c=(n-i)/h+4;break}c/=6}return e.h=c,e.s=l,e.l=u,e}getRGB(e,t=Ye.workingColorSpace){return Ye.workingToColorSpace(Yt.copy(this),t),e.r=Yt.r,e.g=Yt.g,e.b=Yt.b,e}getStyle(e=gt){Ye.workingToColorSpace(Yt.copy(this),e);const t=Yt.r,n=Yt.g,i=Yt.b;return e!==gt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(e,t,n){return this.getHSL(Oi),this.setHSL(Oi.h+e,Oi.s+t,Oi.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Oi),e.getHSL(So);const n=Ga(Oi.h,So.h,t),i=Ga(Oi.s,So.s,t),s=Ga(Oi.l,So.l,t);return this.setHSL(n,i,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,i=this.b,s=e.elements;return this.r=s[0]*t+s[3]*n+s[6]*i,this.g=s[1]*t+s[4]*n+s[7]*i,this.b=s[2]*t+s[5]*n+s[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Yt=new Me;Me.NAMES=Sg;let X_=0,qn=class extends jn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:X_++}),this.uuid=Wn(),this.name="",this.type="Material",this.blending=Tr,this.side=Xn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=uu,this.blendDst=du,this.blendEquation=Cs,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Me(0,0,0),this.blendAlpha=0,this.depthFunc=Or,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=ef,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=zs,this.stencilZFail=zs,this.stencilZPass=zs,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const i=this[t];if(i===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Tr&&(n.blending=this.blending),this.side!==Xn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==uu&&(n.blendSrc=this.blendSrc),this.blendDst!==du&&(n.blendDst=this.blendDst),this.blendEquation!==Cs&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Or&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==ef&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==zs&&(n.stencilFail=this.stencilFail),this.stencilZFail!==zs&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==zs&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(s){const a=[];for(const o in s){const c=s[o];delete c.metadata,a.push(c)}return a}if(t){const s=i(e.textures),a=i(e.images);s.length>0&&(n.textures=s),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const i=t.length;n=new Array(i);for(let s=0;s!==i;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}};class Ln extends qn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Me(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Pn,this.combine=og,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Ii=$_();function $_(){const r=new ArrayBuffer(4),e=new Float32Array(r),t=new Uint32Array(r),n=new Uint32Array(512),i=new Uint32Array(512);for(let c=0;c<256;++c){const l=c-127;l<-27?(n[c]=0,n[c|256]=32768,i[c]=24,i[c|256]=24):l<-14?(n[c]=1024>>-l-14,n[c|256]=1024>>-l-14|32768,i[c]=-l-1,i[c|256]=-l-1):l<=15?(n[c]=l+15<<10,n[c|256]=l+15<<10|32768,i[c]=13,i[c|256]=13):l<128?(n[c]=31744,n[c|256]=64512,i[c]=24,i[c|256]=24):(n[c]=31744,n[c|256]=64512,i[c]=13,i[c|256]=13)}const s=new Uint32Array(2048),a=new Uint32Array(64),o=new Uint32Array(64);for(let c=1;c<1024;++c){let l=c<<13,u=0;for(;(l&8388608)===0;)l<<=1,u-=8388608;l&=-8388609,u+=947912704,s[c]=l|u}for(let c=1024;c<2048;++c)s[c]=939524096+(c-1024<<13);for(let c=1;c<31;++c)a[c]=c<<23;a[31]=1199570944,a[32]=2147483648;for(let c=33;c<63;++c)a[c]=2147483648+(c-32<<23);a[63]=3347054592;for(let c=1;c<64;++c)c!==32&&(o[c]=1024);return{floatView:e,uint32View:t,baseTable:n,shiftTable:i,mantissaTable:s,exponentTable:a,offsetTable:o}}function j_(r){Math.abs(r)>65504&&console.warn("THREE.DataUtils.toHalfFloat(): Value out of range."),r=We(r,-65504,65504),Ii.floatView[0]=r;const e=Ii.uint32View[0],t=e>>23&511;return Ii.baseTable[t]+((e&8388607)>>Ii.shiftTable[t])}function Y_(r){const e=r>>10;return Ii.uint32View[0]=Ii.mantissaTable[Ii.offsetTable[e]+(r&1023)]+Ii.exponentTable[e],Ii.floatView[0]}class Co{static toHalfFloat(e){return j_(e)}static fromHalfFloat(e){return Y_(e)}}const Ft=new B,Io=new Oe;let K_=0;class Ct{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:K_++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Qu,this.updateRanges=[],this.gpuType=Lt,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,s=this.itemSize;i<s;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Io.fromBufferAttribute(this,t),Io.applyMatrix3(e),this.setXY(t,Io.x,Io.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Ft.fromBufferAttribute(this,t),Ft.applyMatrix3(e),this.setXYZ(t,Ft.x,Ft.y,Ft.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Ft.fromBufferAttribute(this,t),Ft.applyMatrix4(e),this.setXYZ(t,Ft.x,Ft.y,Ft.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Ft.fromBufferAttribute(this,t),Ft.applyNormalMatrix(e),this.setXYZ(t,Ft.x,Ft.y,Ft.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Ft.fromBufferAttribute(this,t),Ft.transformDirection(e),this.setXYZ(t,Ft.x,Ft.y,Ft.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Hn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=ot(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Hn(t,this.array)),t}setX(e,t){return this.normalized&&(t=ot(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Hn(t,this.array)),t}setY(e,t){return this.normalized&&(t=ot(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Hn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=ot(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Hn(t,this.array)),t}setW(e,t){return this.normalized&&(t=ot(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=ot(t,this.array),n=ot(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){return e*=this.itemSize,this.normalized&&(t=ot(t,this.array),n=ot(n,this.array),i=ot(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,s){return e*=this.itemSize,this.normalized&&(t=ot(t,this.array),n=ot(n,this.array),i=ot(i,this.array),s=ot(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Qu&&(e.usage=this.usage),e}}class Cg extends Ct{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class Ig extends Ct{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class Sn extends Ct{constructor(e,t,n){super(new Float32Array(e),t,n)}}let J_=0;const wn=new Pe,Rl=new ft,Zs=new B,_n=new hn,aa=new hn,Gt=new B;class An extends jn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:J_++}),this.uuid=Wn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Eg(e)?Ig:Cg)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const s=new Qe().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}const i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(e),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return wn.makeRotationFromQuaternion(e),this.applyMatrix4(wn),this}rotateX(e){return wn.makeRotationX(e),this.applyMatrix4(wn),this}rotateY(e){return wn.makeRotationY(e),this.applyMatrix4(wn),this}rotateZ(e){return wn.makeRotationZ(e),this.applyMatrix4(wn),this}translate(e,t,n){return wn.makeTranslation(e,t,n),this.applyMatrix4(wn),this}scale(e,t,n){return wn.makeScale(e,t,n),this.applyMatrix4(wn),this}lookAt(e){return Rl.lookAt(e),Rl.updateMatrix(),this.applyMatrix4(Rl.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Zs).negate(),this.translate(Zs.x,Zs.y,Zs.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let i=0,s=e.length;i<s;i++){const a=e[i];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Sn(n,3))}else{const n=Math.min(e.length,t.count);for(let i=0;i<n;i++){const s=e[i];t.setXYZ(i,s.x,s.y,s.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new hn);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new B(-1/0,-1/0,-1/0),new B(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){const s=t[n];_n.setFromBufferAttribute(s),this.morphTargetsRelative?(Gt.addVectors(this.boundingBox.min,_n.min),this.boundingBox.expandByPoint(Gt),Gt.addVectors(this.boundingBox.max,_n.max),this.boundingBox.expandByPoint(Gt)):(this.boundingBox.expandByPoint(_n.min),this.boundingBox.expandByPoint(_n.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Un);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new B,1/0);return}if(e){const n=this.boundingSphere.center;if(_n.setFromBufferAttribute(e),t)for(let s=0,a=t.length;s<a;s++){const o=t[s];aa.setFromBufferAttribute(o),this.morphTargetsRelative?(Gt.addVectors(_n.min,aa.min),_n.expandByPoint(Gt),Gt.addVectors(_n.max,aa.max),_n.expandByPoint(Gt)):(_n.expandByPoint(aa.min),_n.expandByPoint(aa.max))}_n.getCenter(n);let i=0;for(let s=0,a=e.count;s<a;s++)Gt.fromBufferAttribute(e,s),i=Math.max(i,n.distanceToSquared(Gt));if(t)for(let s=0,a=t.length;s<a;s++){const o=t[s],c=this.morphTargetsRelative;for(let l=0,u=o.count;l<u;l++)Gt.fromBufferAttribute(o,l),c&&(Zs.fromBufferAttribute(e,l),Gt.add(Zs)),i=Math.max(i,n.distanceToSquared(Gt))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,i=t.normal,s=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Ct(new Float32Array(4*n.count),4));const a=this.getAttribute("tangent"),o=[],c=[];for(let w=0;w<n.count;w++)o[w]=new B,c[w]=new B;const l=new B,u=new B,h=new B,d=new Oe,f=new Oe,p=new Oe,g=new B,m=new B;function A(w,x,v){l.fromBufferAttribute(n,w),u.fromBufferAttribute(n,x),h.fromBufferAttribute(n,v),d.fromBufferAttribute(s,w),f.fromBufferAttribute(s,x),p.fromBufferAttribute(s,v),u.sub(l),h.sub(l),f.sub(d),p.sub(d);const R=1/(f.x*p.y-p.x*f.y);isFinite(R)&&(g.copy(u).multiplyScalar(p.y).addScaledVector(h,-f.y).multiplyScalar(R),m.copy(h).multiplyScalar(f.x).addScaledVector(u,-p.x).multiplyScalar(R),o[w].add(g),o[x].add(g),o[v].add(g),c[w].add(m),c[x].add(m),c[v].add(m))}let E=this.groups;E.length===0&&(E=[{start:0,count:e.count}]);for(let w=0,x=E.length;w<x;++w){const v=E[w],R=v.start,k=v.count;for(let F=R,P=R+k;F<P;F+=3)A(e.getX(F+0),e.getX(F+1),e.getX(F+2))}const _=new B,b=new B,S=new B,I=new B;function M(w){S.fromBufferAttribute(i,w),I.copy(S);const x=o[w];_.copy(x),_.sub(S.multiplyScalar(S.dot(x))).normalize(),b.crossVectors(I,x);const R=b.dot(c[w])<0?-1:1;a.setXYZW(w,_.x,_.y,_.z,R)}for(let w=0,x=E.length;w<x;++w){const v=E[w],R=v.start,k=v.count;for(let F=R,P=R+k;F<P;F+=3)M(e.getX(F+0)),M(e.getX(F+1)),M(e.getX(F+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Ct(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);const i=new B,s=new B,a=new B,o=new B,c=new B,l=new B,u=new B,h=new B;if(e)for(let d=0,f=e.count;d<f;d+=3){const p=e.getX(d+0),g=e.getX(d+1),m=e.getX(d+2);i.fromBufferAttribute(t,p),s.fromBufferAttribute(t,g),a.fromBufferAttribute(t,m),u.subVectors(a,s),h.subVectors(i,s),u.cross(h),o.fromBufferAttribute(n,p),c.fromBufferAttribute(n,g),l.fromBufferAttribute(n,m),o.add(u),c.add(u),l.add(u),n.setXYZ(p,o.x,o.y,o.z),n.setXYZ(g,c.x,c.y,c.z),n.setXYZ(m,l.x,l.y,l.z)}else for(let d=0,f=t.count;d<f;d+=3)i.fromBufferAttribute(t,d+0),s.fromBufferAttribute(t,d+1),a.fromBufferAttribute(t,d+2),u.subVectors(a,s),h.subVectors(i,s),u.cross(h),n.setXYZ(d+0,u.x,u.y,u.z),n.setXYZ(d+1,u.x,u.y,u.z),n.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Gt.fromBufferAttribute(e,t),Gt.normalize(),e.setXYZ(t,Gt.x,Gt.y,Gt.z)}toNonIndexed(){function e(o,c){const l=o.array,u=o.itemSize,h=o.normalized,d=new l.constructor(c.length*u);let f=0,p=0;for(let g=0,m=c.length;g<m;g++){o.isInterleavedBufferAttribute?f=c[g]*o.data.stride+o.offset:f=c[g]*u;for(let A=0;A<u;A++)d[p++]=l[f++]}return new Ct(d,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new An,n=this.index.array,i=this.attributes;for(const o in i){const c=i[o],l=e(c,n);t.setAttribute(o,l)}const s=this.morphAttributes;for(const o in s){const c=[],l=s[o];for(let u=0,h=l.length;u<h;u++){const d=l[u],f=e(d,n);c.push(f)}t.morphAttributes[o]=c}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,c=a.length;o<c;o++){const l=a[o];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const c=this.parameters;for(const l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const c in n){const l=n[c];e.data.attributes[c]=l.toJSON(e.data)}const i={};let s=!1;for(const c in this.morphAttributes){const l=this.morphAttributes[c],u=[];for(let h=0,d=l.length;h<d;h++){const f=l[h];u.push(f.toJSON(e.data))}u.length>0&&(i[c]=u,s=!0)}s&&(e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone());const i=e.attributes;for(const l in i){const u=i[l];this.setAttribute(l,u.clone(t))}const s=e.morphAttributes;for(const l in s){const u=[],h=s[l];for(let d=0,f=h.length;d<f;d++)u.push(h[d].clone(t));this.morphAttributes[l]=u}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let l=0,u=a.length;l<u;l++){const h=a[l];this.addGroup(h.start,h.count,h.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const mf=new Pe,as=new lo,Mo=new Un,gf=new B,wo=new B,To=new B,Ro=new B,Bl=new B,Bo=new B,bf=new B,Do=new B;class ut extends ft{constructor(e=new An,t=new Ln){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=i.length;s<a;s++){const o=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}getVertexPosition(e,t){const n=this.geometry,i=n.attributes.position,s=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(i,e);const o=this.morphTargetInfluences;if(s&&o){Bo.set(0,0,0);for(let c=0,l=s.length;c<l;c++){const u=o[c],h=s[c];u!==0&&(Bl.fromBufferAttribute(h,e),a?Bo.addScaledVector(Bl,u):Bo.addScaledVector(Bl.sub(t),u))}t.add(Bo)}return t}raycast(e,t){const n=this.geometry,i=this.material,s=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Mo.copy(n.boundingSphere),Mo.applyMatrix4(s),as.copy(e.ray).recast(e.near),!(Mo.containsPoint(as.origin)===!1&&(as.intersectSphere(Mo,gf)===null||as.origin.distanceToSquared(gf)>(e.far-e.near)**2))&&(mf.copy(s).invert(),as.copy(e.ray).applyMatrix4(mf),!(n.boundingBox!==null&&as.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,as)))}_computeIntersections(e,t,n){let i;const s=this.geometry,a=this.material,o=s.index,c=s.attributes.position,l=s.attributes.uv,u=s.attributes.uv1,h=s.attributes.normal,d=s.groups,f=s.drawRange;if(o!==null)if(Array.isArray(a))for(let p=0,g=d.length;p<g;p++){const m=d[p],A=a[m.materialIndex],E=Math.max(m.start,f.start),_=Math.min(o.count,Math.min(m.start+m.count,f.start+f.count));for(let b=E,S=_;b<S;b+=3){const I=o.getX(b),M=o.getX(b+1),w=o.getX(b+2);i=Lo(this,A,e,n,l,u,h,I,M,w),i&&(i.faceIndex=Math.floor(b/3),i.face.materialIndex=m.materialIndex,t.push(i))}}else{const p=Math.max(0,f.start),g=Math.min(o.count,f.start+f.count);for(let m=p,A=g;m<A;m+=3){const E=o.getX(m),_=o.getX(m+1),b=o.getX(m+2);i=Lo(this,a,e,n,l,u,h,E,_,b),i&&(i.faceIndex=Math.floor(m/3),t.push(i))}}else if(c!==void 0)if(Array.isArray(a))for(let p=0,g=d.length;p<g;p++){const m=d[p],A=a[m.materialIndex],E=Math.max(m.start,f.start),_=Math.min(c.count,Math.min(m.start+m.count,f.start+f.count));for(let b=E,S=_;b<S;b+=3){const I=b,M=b+1,w=b+2;i=Lo(this,A,e,n,l,u,h,I,M,w),i&&(i.faceIndex=Math.floor(b/3),i.face.materialIndex=m.materialIndex,t.push(i))}}else{const p=Math.max(0,f.start),g=Math.min(c.count,f.start+f.count);for(let m=p,A=g;m<A;m+=3){const E=m,_=m+1,b=m+2;i=Lo(this,a,e,n,l,u,h,E,_,b),i&&(i.faceIndex=Math.floor(m/3),t.push(i))}}}}function Z_(r,e,t,n,i,s,a,o){let c;if(e.side===$t?c=n.intersectTriangle(a,s,i,!0,o):c=n.intersectTriangle(i,s,a,e.side===Xn,o),c===null)return null;Do.copy(o),Do.applyMatrix4(r.matrixWorld);const l=t.ray.origin.distanceTo(Do);return l<t.near||l>t.far?null:{distance:l,point:Do.clone(),object:r}}function Lo(r,e,t,n,i,s,a,o,c,l){r.getVertexPosition(o,wo),r.getVertexPosition(c,To),r.getVertexPosition(l,Ro);const u=Z_(r,e,t,n,wo,To,Ro,bf);if(u){const h=new B;vn.getBarycoord(bf,wo,To,Ro,h),i&&(u.uv=vn.getInterpolatedAttribute(i,o,c,l,h,new Oe)),s&&(u.uv1=vn.getInterpolatedAttribute(s,o,c,l,h,new Oe)),a&&(u.normal=vn.getInterpolatedAttribute(a,o,c,l,h,new B),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));const d={a:o,b:c,c:l,normal:new B,materialIndex:0};vn.getNormal(wo,To,Ro,d.normal),u.face=d,u.barycoord=h}return u}class Di extends An{constructor(e=1,t=1,n=1,i=1,s=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:i,heightSegments:s,depthSegments:a};const o=this;i=Math.floor(i),s=Math.floor(s),a=Math.floor(a);const c=[],l=[],u=[],h=[];let d=0,f=0;p("z","y","x",-1,-1,n,t,e,a,s,0),p("z","y","x",1,-1,n,t,-e,a,s,1),p("x","z","y",1,1,e,n,t,i,a,2),p("x","z","y",1,-1,e,n,-t,i,a,3),p("x","y","z",1,-1,e,t,n,i,s,4),p("x","y","z",-1,-1,e,t,-n,i,s,5),this.setIndex(c),this.setAttribute("position",new Sn(l,3)),this.setAttribute("normal",new Sn(u,3)),this.setAttribute("uv",new Sn(h,2));function p(g,m,A,E,_,b,S,I,M,w,x){const v=b/M,R=S/w,k=b/2,F=S/2,P=I/2,G=M+1,O=w+1;let W=0,Q=0;const Y=new B;for(let ne=0;ne<O;ne++){const re=ne*R-F;for(let de=0;de<G;de++){const Ce=de*v-k;Y[g]=Ce*E,Y[m]=re*_,Y[A]=P,l.push(Y.x,Y.y,Y.z),Y[g]=0,Y[m]=0,Y[A]=I>0?1:-1,u.push(Y.x,Y.y,Y.z),h.push(de/M),h.push(1-ne/w),W+=1}}for(let ne=0;ne<w;ne++)for(let re=0;re<M;re++){const de=d+re+G*ne,Ce=d+re+G*(ne+1),q=d+(re+1)+G*(ne+1),Z=d+(re+1)+G*ne;c.push(de,Ce,Z),c.push(Ce,q,Z),Q+=6}o.addGroup(f,Q,x),f+=Q,d+=W}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Di(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Vr(r){const e={};for(const t in r){e[t]={};for(const n in r[t]){const i=r[t][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=i.clone():Array.isArray(i)?e[t][n]=i.slice():e[t][n]=i}}return e}function an(r){const e={};for(let t=0;t<r.length;t++){const n=Vr(r[t]);for(const i in n)e[i]=n[i]}return e}function eE(r){const e=[];for(let t=0;t<r.length;t++)e.push(r[t].clone());return e}function Mg(r){const e=r.getRenderTarget();return e===null?r.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Ye.workingColorSpace}const tE={clone:Vr,merge:an};var nE=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,iE=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Cn extends qn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=nE,this.fragmentShader=iE,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Vr(e.uniforms),this.uniformsGroups=eE(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const i in this.uniforms){const a=this.uniforms[i].value;a&&a.isTexture?t.uniforms[i]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[i]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[i]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[i]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[i]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[i]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[i]={type:"m4",value:a.toArray()}:t.uniforms[i]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class wg extends ft{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Pe,this.projectionMatrix=new Pe,this.projectionMatrixInverse=new Pe,this.coordinateSystem=Mi}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const ki=new B,_f=new Oe,Ef=new Oe;class Xt extends wg{constructor(e=50,t=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=zr*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Qa*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return zr*2*Math.atan(Math.tan(Qa*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){ki.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(ki.x,ki.y).multiplyScalar(-e/ki.z),ki.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(ki.x,ki.y).multiplyScalar(-e/ki.z)}getViewSize(e,t){return this.getViewBounds(e,_f,Ef),t.subVectors(Ef,_f)}setViewOffset(e,t,n,i,s,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Qa*.5*this.fov)/this.zoom,n=2*t,i=this.aspect*n,s=-.5*i;const a=this.view;if(this.view!==null&&this.view.enabled){const c=a.fullWidth,l=a.fullHeight;s+=a.offsetX*i/c,t-=a.offsetY*n/l,i*=a.width/c,n*=a.height/l}const o=this.filmOffset;o!==0&&(s+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+i,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const er=-90,tr=1;class Gu extends ft{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const i=new Xt(er,tr,e,t);i.layers=this.layers,this.add(i);const s=new Xt(er,tr,e,t);s.layers=this.layers,this.add(s);const a=new Xt(er,tr,e,t);a.layers=this.layers,this.add(a);const o=new Xt(er,tr,e,t);o.layers=this.layers,this.add(o);const c=new Xt(er,tr,e,t);c.layers=this.layers,this.add(c);const l=new Xt(er,tr,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,i,s,a,o,c]=t;for(const l of t)this.remove(l);if(e===Mi)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===Oc)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,a,o,c,l,u]=this.children,h=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;const g=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,i),e.render(t,s),e.setRenderTarget(n,1,i),e.render(t,a),e.setRenderTarget(n,2,i),e.render(t,o),e.setRenderTarget(n,3,i),e.render(t,c),e.setRenderTarget(n,4,i),e.render(t,l),n.texture.generateMipmaps=g,e.setRenderTarget(n,5,i),e.render(t,u),e.setRenderTarget(h,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}}class Tg extends St{constructor(e=[],t=Ps,n,i,s,a,o,c,l,u){super(e,t,n,i,s,a,o,c,l,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class vd extends Fn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},i=[n,n,n,n,n,n];this.texture=new Tg(i),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},i=new Di(5,5,5),s=new Cn({name:"CubemapFromEquirect",uniforms:Vr(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:$t,blending:ii});s.uniforms.tEquirect.value=t;const a=new ut(i,s),o=t.minFilter;return t.minFilter===un&&(t.minFilter=Ke),new Gu(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,i=!0){const s=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,i);e.setRenderTarget(s)}}class Yi extends ft{constructor(){super(),this.isGroup=!0,this.type="Group"}}const sE={type:"move"};class Dl{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Yi,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Yi,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new B,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new B),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Yi,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new B,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new B),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let i=null,s=null,a=null;const o=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){a=!0;for(const g of e.hand.values()){const m=t.getJointPose(g,n),A=this._getHandJoint(l,g);m!==null&&(A.matrix.fromArray(m.transform.matrix),A.matrix.decompose(A.position,A.rotation,A.scale),A.matrixWorldNeedsUpdate=!0,A.jointRadius=m.radius),A.visible=m!==null}const u=l.joints["index-finger-tip"],h=l.joints["thumb-tip"],d=u.position.distanceTo(h.position),f=.02,p=.005;l.inputState.pinching&&d>f+p?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&d<=f-p&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,n),s!==null&&(c.matrix.fromArray(s.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,s.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(s.linearVelocity)):c.hasLinearVelocity=!1,s.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(s.angularVelocity)):c.hasAngularVelocity=!1));o!==null&&(i=t.getPose(e.targetRaySpace,n),i===null&&s!==null&&(i=s),i!==null&&(o.matrix.fromArray(i.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,i.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(i.linearVelocity)):o.hasLinearVelocity=!1,i.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(i.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(sE)))}return o!==null&&(o.visible=i!==null),c!==null&&(c.visible=s!==null),l!==null&&(l.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new Yi;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}class Ns extends ft{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Pn,this.environmentIntensity=1,this.environmentRotation=new Pn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class rE{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=Qu,this.updateRanges=[],this.version=0,this.uuid=Wn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let i=0,s=this.stride;i<s;i++)this.array[e+i]=t.array[n+i];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Wn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Wn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const sn=new B;class xd{constructor(e,t,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=i}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)sn.fromBufferAttribute(this,t),sn.applyMatrix4(e),this.setXYZ(t,sn.x,sn.y,sn.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)sn.fromBufferAttribute(this,t),sn.applyNormalMatrix(e),this.setXYZ(t,sn.x,sn.y,sn.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)sn.fromBufferAttribute(this,t),sn.transformDirection(e),this.setXYZ(t,sn.x,sn.y,sn.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=Hn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=ot(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=ot(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=ot(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=ot(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=ot(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Hn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Hn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Hn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Hn(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=ot(t,this.array),n=ot(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=ot(t,this.array),n=ot(n,this.array),i=ot(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this}setXYZW(e,t,n,i,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=ot(t,this.array),n=ot(n,this.array),i=ot(i,this.array),s=ot(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this.data.array[e+3]=s,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[i+s])}return new Ct(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new xd(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[i+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}const vf=new B,xf=new it,yf=new it,aE=new B,Sf=new Pe,Fo=new B,Ll=new Un,Cf=new Pe,Fl=new lo;class oE extends ut{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=Jd,this.bindMatrix=new Pe,this.bindMatrixInverse=new Pe,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const e=this.geometry;this.boundingBox===null&&(this.boundingBox=new hn),this.boundingBox.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Fo),this.boundingBox.expandByPoint(Fo)}computeBoundingSphere(){const e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new Un),this.boundingSphere.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Fo),this.boundingSphere.expandByPoint(Fo)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){const n=this.material,i=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Ll.copy(this.boundingSphere),Ll.applyMatrix4(i),e.ray.intersectsSphere(Ll)!==!1&&(Cf.copy(i).invert(),Fl.copy(e.ray).applyMatrix4(Cf),!(this.boundingBox!==null&&Fl.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,Fl)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new it,t=this.geometry.attributes.skinWeight;for(let n=0,i=t.count;n<i;n++){e.fromBufferAttribute(t,n);const s=1/e.manhattanLength();s!==1/0?e.multiplyScalar(s):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===Jd?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===i_?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){const n=this.skeleton,i=this.geometry;xf.fromBufferAttribute(i.attributes.skinIndex,e),yf.fromBufferAttribute(i.attributes.skinWeight,e),vf.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let s=0;s<4;s++){const a=yf.getComponent(s);if(a!==0){const o=xf.getComponent(s);Sf.multiplyMatrices(n.bones[o].matrixWorld,n.boneInverses[o]),t.addScaledVector(aE.copy(vf).applyMatrix4(Sf),a)}}return t.applyMatrix4(this.bindMatrixInverse)}}class Rg extends ft{constructor(){super(),this.isBone=!0,this.type="Bone"}}class ho extends St{constructor(e=null,t=1,n=1,i,s,a,o,c,l=Nt,u=Nt,h,d){super(null,a,o,c,l,u,i,s,h,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const If=new Pe,cE=new Pe;class yd{constructor(e=[],t=[]){this.uuid=Wn(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){const e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,i=this.bones.length;n<i;n++)this.boneInverses.push(new Pe)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){const n=new Pe;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){const e=this.bones,t=this.boneInverses,n=this.boneMatrices,i=this.boneTexture;for(let s=0,a=e.length;s<a;s++){const o=e[s]?e[s].matrixWorld:cE;If.multiplyMatrices(o,t[s]),If.toArray(n,s*16)}i!==null&&(i.needsUpdate=!0)}clone(){return new yd(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);const t=new Float32Array(e*e*4);t.set(this.boneMatrices);const n=new ho(t,e,e,yt,Lt);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){const i=this.bones[t];if(i.name===e)return i}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,i=e.bones.length;n<i;n++){const s=e.bones[n];let a=t[s];a===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",s),a=new Rg),this.bones.push(a),this.boneInverses.push(new Pe().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){const e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;const t=this.bones,n=this.boneInverses;for(let i=0,s=t.length;i<s;i++){const a=t[i];e.bones.push(a.uuid);const o=n[i];e.boneInverses.push(o.toArray())}return e}}class Hu extends Ct{constructor(e,t,n,i=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const nr=new Pe,Mf=new Pe,Po=[],wf=new hn,lE=new Pe,oa=new ut,ca=new Un;class hE extends ut{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Hu(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,lE)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new hn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,nr),wf.copy(e.boundingBox).applyMatrix4(nr),this.boundingBox.union(wf)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Un),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,nr),ca.copy(e.boundingSphere).applyMatrix4(nr),this.boundingSphere.union(ca)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const n=t.morphTargetInfluences,i=this.morphTexture.source.data.data,s=n.length+1,a=e*s+1;for(let o=0;o<n.length;o++)n[o]=i[a+o]}raycast(e,t){const n=this.matrixWorld,i=this.count;if(oa.geometry=this.geometry,oa.material=this.material,oa.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),ca.copy(this.boundingSphere),ca.applyMatrix4(n),e.ray.intersectsSphere(ca)!==!1))for(let s=0;s<i;s++){this.getMatrixAt(s,nr),Mf.multiplyMatrices(n,nr),oa.matrixWorld=Mf,oa.raycast(e,Po);for(let a=0,o=Po.length;a<o;a++){const c=Po[a];c.instanceId=s,c.object=this,t.push(c)}Po.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Hu(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const n=t.morphTargetInfluences,i=n.length+1;this.morphTexture===null&&(this.morphTexture=new ho(new Float32Array(i*this.count),i,this.count,ji,Lt));const s=this.morphTexture.source.data.data;let a=0;for(let l=0;l<n.length;l++)a+=n[l];const o=this.geometry.morphTargetsRelative?1:1-a,c=i*e;s[c]=o,s.set(n,c+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}}const Pl=new B,uE=new B,dE=new Qe;class gs{constructor(e=new B(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const i=Pl.subVectors(n,t).cross(uE.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(Pl),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/i;return s<0||s>1?null:t.copy(e.start).addScaledVector(n,s)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||dE.getNormalMatrix(e),i=this.coplanarPoint(Pl).applyMatrix4(e),s=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const os=new Un,fE=new Oe(.5,.5),Uo=new B;class Sd{constructor(e=new gs,t=new gs,n=new gs,i=new gs,s=new gs,a=new gs){this.planes=[e,t,n,i,s,a]}set(e,t,n,i,s,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(i),o[4].copy(s),o[5].copy(a),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Mi){const n=this.planes,i=e.elements,s=i[0],a=i[1],o=i[2],c=i[3],l=i[4],u=i[5],h=i[6],d=i[7],f=i[8],p=i[9],g=i[10],m=i[11],A=i[12],E=i[13],_=i[14],b=i[15];if(n[0].setComponents(c-s,d-l,m-f,b-A).normalize(),n[1].setComponents(c+s,d+l,m+f,b+A).normalize(),n[2].setComponents(c+a,d+u,m+p,b+E).normalize(),n[3].setComponents(c-a,d-u,m-p,b-E).normalize(),n[4].setComponents(c-o,d-h,m-g,b-_).normalize(),t===Mi)n[5].setComponents(c+o,d+h,m+g,b+_).normalize();else if(t===Oc)n[5].setComponents(o,h,g,_).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),os.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),os.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(os)}intersectsSprite(e){os.center.set(0,0,0);const t=fE.distanceTo(e.center);return os.radius=.7071067811865476+t,os.applyMatrix4(e.matrixWorld),this.intersectsSphere(os)}intersectsSphere(e){const t=this.planes,n=e.center,i=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const i=t[n];if(Uo.x=i.normal.x>0?e.max.x:e.min.x,Uo.y=i.normal.y>0?e.max.y:e.min.y,Uo.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(Uo)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class Bg extends qn{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Me(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Qc=new B,Gc=new B,Tf=new Pe,la=new lo,No=new Un,Ul=new B,Rf=new B;class no extends ft{constructor(e=new An,t=new Bg){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let i=1,s=t.count;i<s;i++)Qc.fromBufferAttribute(t,i-1),Gc.fromBufferAttribute(t,i),n[i]=n[i-1],n[i]+=Qc.distanceTo(Gc);e.setAttribute("lineDistance",new Sn(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,s=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),No.copy(n.boundingSphere),No.applyMatrix4(i),No.radius+=s,e.ray.intersectsSphere(No)===!1)return;Tf.copy(i).invert(),la.copy(e.ray).applyMatrix4(Tf);const o=s/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,l=this.isLineSegments?2:1,u=n.index,d=n.attributes.position;if(u!==null){const f=Math.max(0,a.start),p=Math.min(u.count,a.start+a.count);for(let g=f,m=p-1;g<m;g+=l){const A=u.getX(g),E=u.getX(g+1),_=Oo(this,e,la,c,A,E,g);_&&t.push(_)}if(this.isLineLoop){const g=u.getX(p-1),m=u.getX(f),A=Oo(this,e,la,c,g,m,p-1);A&&t.push(A)}}else{const f=Math.max(0,a.start),p=Math.min(d.count,a.start+a.count);for(let g=f,m=p-1;g<m;g+=l){const A=Oo(this,e,la,c,g,g+1,g);A&&t.push(A)}if(this.isLineLoop){const g=Oo(this,e,la,c,p-1,f,p-1);g&&t.push(g)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=i.length;s<a;s++){const o=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}}function Oo(r,e,t,n,i,s,a){const o=r.geometry.attributes.position;if(Qc.fromBufferAttribute(o,i),Gc.fromBufferAttribute(o,s),t.distanceSqToSegment(Qc,Gc,Ul,Rf)>n)return;Ul.applyMatrix4(r.matrixWorld);const l=e.ray.origin.distanceTo(Ul);if(!(l<e.near||l>e.far))return{distance:l,point:Rf.clone().applyMatrix4(r.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:r}}const Bf=new B,Df=new B;class pE extends no{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let i=0,s=t.count;i<s;i+=2)Bf.fromBufferAttribute(t,i),Df.fromBufferAttribute(t,i+1),n[i]=i===0?0:n[i-1],n[i+1]=n[i]+Bf.distanceTo(Df);e.setAttribute("lineDistance",new Sn(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class AE extends no{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}}class Dg extends qn{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Me(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const Lf=new Pe,zu=new lo,ko=new Un,Qo=new B;class mE extends ft{constructor(e=new An,t=new Dg){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,s=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ko.copy(n.boundingSphere),ko.applyMatrix4(i),ko.radius+=s,e.ray.intersectsSphere(ko)===!1)return;Lf.copy(i).invert(),zu.copy(e.ray).applyMatrix4(Lf);const o=s/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,l=n.index,h=n.attributes.position;if(l!==null){const d=Math.max(0,a.start),f=Math.min(l.count,a.start+a.count);for(let p=d,g=f;p<g;p++){const m=l.getX(p);Qo.fromBufferAttribute(h,m),Ff(Qo,m,c,i,e,t,this)}}else{const d=Math.max(0,a.start),f=Math.min(h.count,a.start+a.count);for(let p=d,g=f;p<g;p++)Qo.fromBufferAttribute(h,p),Ff(Qo,p,c,i,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=i.length;s<a;s++){const o=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}}function Ff(r,e,t,n,i,s,a){const o=zu.distanceSqToPoint(r);if(o<t){const c=new B;zu.closestPointToPoint(r,c),c.applyMatrix4(n);const l=i.ray.origin.distanceTo(c);if(l<i.near||l>i.far)return;s.push({distance:l,distanceToRay:Math.sqrt(o),point:c,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}class gE extends St{constructor(e,t,n,i,s=Ke,a=Ke,o,c,l){super(e,t,n,i,s,a,o,c,l),this.isVideoTexture=!0,this.generateMipmaps=!1;const u=this;function h(){u.needsUpdate=!0,e.requestVideoFrameCallback(h)}"requestVideoFrameCallback"in e&&e.requestVideoFrameCallback(h)}clone(){return new this.constructor(this.image).copy(this)}update(){const e=this.image;"requestVideoFrameCallback"in e===!1&&e.readyState>=e.HAVE_CURRENT_DATA&&(this.needsUpdate=!0)}}class Fs extends St{constructor(e,t,n,i,s,a,o,c,l,u,h,d){super(null,a,o,c,l,u,i,s,h,d),this.isCompressedTexture=!0,this.image={width:t,height:n},this.mipmaps=e,this.flipY=!1,this.generateMipmaps=!1}}class bE extends Fs{constructor(e,t,n,i,s,a){super(e,t,n,s,a),this.isCompressedArrayTexture=!0,this.image.depth=i,this.wrapR=Dt,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class _E extends Fs{constructor(e,t,n){super(void 0,e[0].width,e[0].height,t,n,Ps),this.isCompressedCubeTexture=!0,this.isCubeTexture=!0,this.image=e}}class EE extends St{constructor(e,t,n,i,s,a,o,c,l){super(e,t,n,i,s,a,o,c,l),this.isCanvasTexture=!0,this.needsUpdate=!0}}class Lg extends St{constructor(e,t,n=es,i,s,a,o=Nt,c=Nt,l,u=ja,h=1){if(u!==ja&&u!==Ya)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const d={width:e,height:t,depth:h};super(d,i,s,a,o,c,u,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new tl(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class Li extends An{constructor(e=1,t=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:i};const s=e/2,a=t/2,o=Math.floor(n),c=Math.floor(i),l=o+1,u=c+1,h=e/o,d=t/c,f=[],p=[],g=[],m=[];for(let A=0;A<u;A++){const E=A*d-a;for(let _=0;_<l;_++){const b=_*h-s;p.push(b,-E,0),g.push(0,0,1),m.push(_/o),m.push(1-A/c)}}for(let A=0;A<c;A++)for(let E=0;E<o;E++){const _=E+l*A,b=E+l*(A+1),S=E+1+l*(A+1),I=E+1+l*A;f.push(_,b,I),f.push(b,S,I)}this.setIndex(f),this.setAttribute("position",new Sn(p,3)),this.setAttribute("normal",new Sn(g,3)),this.setAttribute("uv",new Sn(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Li(e.width,e.height,e.widthSegments,e.heightSegments)}}class Cd extends An{constructor(e=1,t=32,n=16,i=0,s=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:i,phiLength:s,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const c=Math.min(a+o,Math.PI);let l=0;const u=[],h=new B,d=new B,f=[],p=[],g=[],m=[];for(let A=0;A<=n;A++){const E=[],_=A/n;let b=0;A===0&&a===0?b=.5/t:A===n&&c===Math.PI&&(b=-.5/t);for(let S=0;S<=t;S++){const I=S/t;h.x=-e*Math.cos(i+I*s)*Math.sin(a+_*o),h.y=e*Math.cos(a+_*o),h.z=e*Math.sin(i+I*s)*Math.sin(a+_*o),p.push(h.x,h.y,h.z),d.copy(h).normalize(),g.push(d.x,d.y,d.z),m.push(I+b,1-_),E.push(l++)}u.push(E)}for(let A=0;A<n;A++)for(let E=0;E<t;E++){const _=u[A][E+1],b=u[A][E],S=u[A+1][E],I=u[A+1][E+1];(A!==0||a>0)&&f.push(_,b,I),(A!==n-1||c<Math.PI)&&f.push(b,S,I)}this.setIndex(f),this.setAttribute("position",new Sn(p,3)),this.setAttribute("normal",new Sn(g,3)),this.setAttribute("uv",new Sn(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Cd(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class io extends qn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Me(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Me(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=bg,this.normalScale=new Oe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Pn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class oi extends io{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new Oe(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return We(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Me(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Me(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Me(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class Fg extends qn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=a_,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class vE extends qn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}function Go(r,e){return!r||r.constructor===e?r:typeof e.BYTES_PER_ELEMENT=="number"?new e(r):Array.prototype.slice.call(r)}function xE(r){return ArrayBuffer.isView(r)&&!(r instanceof DataView)}function yE(r){function e(i,s){return r[i]-r[s]}const t=r.length,n=new Array(t);for(let i=0;i!==t;++i)n[i]=i;return n.sort(e),n}function Pf(r,e,t){const n=r.length,i=new r.constructor(n);for(let s=0,a=0;a!==n;++s){const o=t[s]*e;for(let c=0;c!==e;++c)i[a++]=r[o+c]}return i}function Pg(r,e,t,n){let i=1,s=r[0];for(;s!==void 0&&s[n]===void 0;)s=r[i++];if(s===void 0)return;let a=s[n];if(a!==void 0)if(Array.isArray(a))do a=s[n],a!==void 0&&(e.push(s.time),t.push(...a)),s=r[i++];while(s!==void 0);else if(a.toArray!==void 0)do a=s[n],a!==void 0&&(e.push(s.time),a.toArray(t,t.length)),s=r[i++];while(s!==void 0);else do a=s[n],a!==void 0&&(e.push(s.time),t.push(a)),s=r[i++];while(s!==void 0)}class uo{constructor(e,t,n,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let n=this._cachedIndex,i=t[n],s=t[n-1];e:{t:{let a;n:{i:if(!(e<i)){for(let o=n+2;;){if(i===void 0){if(e<s)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(s=i,i=t[++n],e<i)break t}a=t.length;break n}if(!(e>=s)){const o=t[1];e<o&&(n=2,s=o);for(let c=n-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===c)break;if(i=s,s=t[--n-1],e>=s)break t}a=n,n=0;break n}break e}for(;n<a;){const o=n+a>>>1;e<t[o]?a=o:n=o+1}if(i=t[n],s=t[n-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,s,i)}return this.interpolate_(n,s,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,s=e*i;for(let a=0;a!==i;++a)t[a]=n[s+a];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}}class SE extends uo{constructor(e,t,n,i){super(e,t,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:yr,endingEnd:yr}}intervalChanged_(e,t,n){const i=this.parameterPositions;let s=e-2,a=e+1,o=i[s],c=i[a];if(o===void 0)switch(this.getSettings_().endingStart){case Sr:s=e,o=2*t-n;break;case Uc:s=i.length-2,o=t+i[s]-i[s+1];break;default:s=e,o=n}if(c===void 0)switch(this.getSettings_().endingEnd){case Sr:a=e,c=2*n-t;break;case Uc:a=1,c=n+i[1]-i[0];break;default:a=e-1,c=t}const l=(n-t)*.5,u=this.valueSize;this._weightPrev=l/(t-o),this._weightNext=l/(c-n),this._offsetPrev=s*u,this._offsetNext=a*u}interpolate_(e,t,n,i){const s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,u=this._offsetPrev,h=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(i-t),g=p*p,m=g*p,A=-d*m+2*d*g-d*p,E=(1+d)*m+(-1.5-2*d)*g+(-.5+d)*p+1,_=(-1-f)*m+(1.5+f)*g+.5*p,b=f*m-f*g;for(let S=0;S!==o;++S)s[S]=A*a[u+S]+E*a[l+S]+_*a[c+S]+b*a[h+S];return s}}class Ug extends uo{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,u=(n-t)/(i-t),h=1-u;for(let d=0;d!==o;++d)s[d]=a[l+d]*h+a[c+d]*u;return s}}class CE extends uo{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e){return this.copySampleValue_(e-1)}}class Yn{constructor(e,t,n,i){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Go(t,this.TimeBufferType),this.values=Go(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Go(e.times,Array),values:Go(e.values,Array)};const i=e.getInterpolation();i!==e.DefaultInterpolation&&(n.interpolation=i)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new CE(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Ug(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new SE(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case Gr:t=this.InterpolantFactoryMethodDiscrete;break;case Hr:t=this.InterpolantFactoryMethodLinear;break;case ul:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){const n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Gr;case this.InterpolantFactoryMethodLinear:return Hr;case this.InterpolantFactoryMethodSmooth:return ul}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]*=e}return this}trim(e,t){const n=this.times,i=n.length;let s=0,a=i-1;for(;s!==i&&n[s]<e;)++s;for(;a!==-1&&n[a]>t;)--a;if(++a,s!==0||a!==i){s>=a&&(a=Math.max(a,1),s=a-1);const o=this.getValueSize();this.times=n.slice(s,a),this.values=this.values.slice(s*o,a*o)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);const n=this.times,i=this.values,s=n.length;s===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==s;o++){const c=n[o];if(typeof c=="number"&&isNaN(c)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,o,c),e=!1;break}if(a!==null&&a>c){console.error("THREE.KeyframeTrack: Out of order keys.",this,o,c,a),e=!1;break}a=c}if(i!==void 0&&xE(i))for(let o=0,c=i.length;o!==c;++o){const l=i[o];if(isNaN(l)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,o,l),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===ul,s=e.length-1;let a=1;for(let o=1;o<s;++o){let c=!1;const l=e[o],u=e[o+1];if(l!==u&&(o!==1||l!==e[0]))if(i)c=!0;else{const h=o*n,d=h-n,f=h+n;for(let p=0;p!==n;++p){const g=t[h+p];if(g!==t[d+p]||g!==t[f+p]){c=!0;break}}}if(c){if(o!==a){e[a]=e[o];const h=o*n,d=a*n;for(let f=0;f!==n;++f)t[d+f]=t[h+f]}++a}}if(s>0){e[a]=e[s];for(let o=s*n,c=a*n,l=0;l!==n;++l)t[c+l]=t[o+l];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),n=this.constructor,i=new n(this.name,e,t);return i.createInterpolant=this.createInterpolant,i}}Yn.prototype.ValueTypeName="";Yn.prototype.TimeBufferType=Float32Array;Yn.prototype.ValueBufferType=Float32Array;Yn.prototype.DefaultInterpolation=Hr;class Kr extends Yn{constructor(e,t,n){super(e,t,n)}}Kr.prototype.ValueTypeName="bool";Kr.prototype.ValueBufferType=Array;Kr.prototype.DefaultInterpolation=Gr;Kr.prototype.InterpolantFactoryMethodLinear=void 0;Kr.prototype.InterpolantFactoryMethodSmooth=void 0;class Ng extends Yn{constructor(e,t,n,i){super(e,t,n,i)}}Ng.prototype.ValueTypeName="color";class Wr extends Yn{constructor(e,t,n,i){super(e,t,n,i)}}Wr.prototype.ValueTypeName="number";class IE extends uo{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=(n-t)/(i-t);let l=e*o;for(let u=l+o;l!==u;l+=4)dn.slerpFlat(s,0,a,l-o,a,l,c);return s}}class qr extends Yn{constructor(e,t,n,i){super(e,t,n,i)}InterpolantFactoryMethodLinear(e){return new IE(this.times,this.values,this.getValueSize(),e)}}qr.prototype.ValueTypeName="quaternion";qr.prototype.InterpolantFactoryMethodSmooth=void 0;class Jr extends Yn{constructor(e,t,n){super(e,t,n)}}Jr.prototype.ValueTypeName="string";Jr.prototype.ValueBufferType=Array;Jr.prototype.DefaultInterpolation=Gr;Jr.prototype.InterpolantFactoryMethodLinear=void 0;Jr.prototype.InterpolantFactoryMethodSmooth=void 0;class Xr extends Yn{constructor(e,t,n,i){super(e,t,n,i)}}Xr.prototype.ValueTypeName="vector";class Vu{constructor(e="",t=-1,n=[],i=bd){this.name=e,this.tracks=n,this.duration=t,this.blendMode=i,this.uuid=Wn(),this.duration<0&&this.resetDuration()}static parse(e){const t=[],n=e.tracks,i=1/(e.fps||1);for(let a=0,o=n.length;a!==o;++a)t.push(wE(n[a]).scale(i));const s=new this(e.name,e.duration,t,e.blendMode);return s.uuid=e.uuid,s}static toJSON(e){const t=[],n=e.tracks,i={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode};for(let s=0,a=n.length;s!==a;++s)t.push(Yn.toJSON(n[s]));return i}static CreateFromMorphTargetSequence(e,t,n,i){const s=t.length,a=[];for(let o=0;o<s;o++){let c=[],l=[];c.push((o+s-1)%s,o,(o+1)%s),l.push(0,1,0);const u=yE(c);c=Pf(c,1,u),l=Pf(l,1,u),!i&&c[0]===0&&(c.push(s),l.push(l[0])),a.push(new Wr(".morphTargetInfluences["+t[o].name+"]",c,l).scale(1/n))}return new this(e,-1,a)}static findByName(e,t){let n=e;if(!Array.isArray(e)){const i=e;n=i.geometry&&i.geometry.animations||i.animations}for(let i=0;i<n.length;i++)if(n[i].name===t)return n[i];return null}static CreateClipsFromMorphTargetSequences(e,t,n){const i={},s=/^([\w-]*?)([\d]+)$/;for(let o=0,c=e.length;o<c;o++){const l=e[o],u=l.name.match(s);if(u&&u.length>1){const h=u[1];let d=i[h];d||(i[h]=d=[]),d.push(l)}}const a=[];for(const o in i)a.push(this.CreateFromMorphTargetSequence(o,i[o],t,n));return a}static parseAnimation(e,t){if(console.warn("THREE.AnimationClip: parseAnimation() is deprecated and will be removed with r185"),!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;const n=function(h,d,f,p,g){if(f.length!==0){const m=[],A=[];Pg(f,m,A,p),m.length!==0&&g.push(new h(d,m,A))}},i=[],s=e.name||"default",a=e.fps||30,o=e.blendMode;let c=e.length||-1;const l=e.hierarchy||[];for(let h=0;h<l.length;h++){const d=l[h].keys;if(!(!d||d.length===0))if(d[0].morphTargets){const f={};let p;for(p=0;p<d.length;p++)if(d[p].morphTargets)for(let g=0;g<d[p].morphTargets.length;g++)f[d[p].morphTargets[g]]=-1;for(const g in f){const m=[],A=[];for(let E=0;E!==d[p].morphTargets.length;++E){const _=d[p];m.push(_.time),A.push(_.morphTarget===g?1:0)}i.push(new Wr(".morphTargetInfluence["+g+"]",m,A))}c=f.length*a}else{const f=".bones["+t[h].name+"]";n(Xr,f+".position",d,"pos",i),n(qr,f+".quaternion",d,"rot",i),n(Xr,f+".scale",d,"scl",i)}}return i.length===0?null:new this(s,c,i,o)}resetDuration(){const e=this.tracks;let t=0;for(let n=0,i=e.length;n!==i;++n){const s=this.tracks[n];t=Math.max(t,s.times[s.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let t=0;t<this.tracks.length;t++)e.push(this.tracks[t].clone());return new this.constructor(this.name,this.duration,e,this.blendMode)}toJSON(){return this.constructor.toJSON(this)}}function ME(r){switch(r.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Wr;case"vector":case"vector2":case"vector3":case"vector4":return Xr;case"color":return Ng;case"quaternion":return qr;case"bool":case"boolean":return Kr;case"string":return Jr}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+r)}function wE(r){if(r.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=ME(r.type);if(r.times===void 0){const t=[],n=[];Pg(r.keys,t,n,"value"),r.times=t,r.values=n}return e.parse!==void 0?e.parse(r):new e(r.name,r.times,r.values,r.interpolation)}const wi={enabled:!1,files:{},add:function(r,e){this.enabled!==!1&&(this.files[r]=e)},get:function(r){if(this.enabled!==!1)return this.files[r]},remove:function(r){delete this.files[r]},clear:function(){this.files={}}};class Og{constructor(e,t,n){const i=this;let s=!1,a=0,o=0,c;const l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.itemStart=function(u){o++,s===!1&&i.onStart!==void 0&&i.onStart(u,a,o),s=!0},this.itemEnd=function(u){a++,i.onProgress!==void 0&&i.onProgress(u,a,o),a===o&&(s=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(u){i.onError!==void 0&&i.onError(u)},this.resolveURL=function(u){return c?c(u):u},this.setURLModifier=function(u){return c=u,this},this.addHandler=function(u,h){return l.push(u,h),this},this.removeHandler=function(u){const h=l.indexOf(u);return h!==-1&&l.splice(h,2),this},this.getHandler=function(u){for(let h=0,d=l.length;h<d;h+=2){const f=l[h],p=l[h+1];if(f.global&&(f.lastIndex=0),f.test(u))return p}return null}}}const TE=new Og;class ci{constructor(e){this.manager=e!==void 0?e:TE,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){const n=this;return new Promise(function(i,s){n.load(e,i,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}}ci.DEFAULT_MATERIAL_NAME="__DEFAULT";const Ai={};class RE extends Error{constructor(e,t){super(e),this.response=t}}class Bi extends ci{constructor(e){super(e),this.mimeType="",this.responseType=""}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=wi.get(`file:${e}`);if(s!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(s),this.manager.itemEnd(e)},0),s;if(Ai[e]!==void 0){Ai[e].push({onLoad:t,onProgress:n,onError:i});return}Ai[e]=[],Ai[e].push({onLoad:t,onProgress:n,onError:i});const a=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin"}),o=this.mimeType,c=this.responseType;fetch(a).then(l=>{if(l.status===200||l.status===0){if(l.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||l.body===void 0||l.body.getReader===void 0)return l;const u=Ai[e],h=l.body.getReader(),d=l.headers.get("X-File-Size")||l.headers.get("Content-Length"),f=d?parseInt(d):0,p=f!==0;let g=0;const m=new ReadableStream({start(A){E();function E(){h.read().then(({done:_,value:b})=>{if(_)A.close();else{g+=b.byteLength;const S=new ProgressEvent("progress",{lengthComputable:p,loaded:g,total:f});for(let I=0,M=u.length;I<M;I++){const w=u[I];w.onProgress&&w.onProgress(S)}A.enqueue(b),E()}},_=>{A.error(_)})}}});return new Response(m)}else throw new RE(`fetch for "${l.url}" responded with ${l.status}: ${l.statusText}`,l)}).then(l=>{switch(c){case"arraybuffer":return l.arrayBuffer();case"blob":return l.blob();case"document":return l.text().then(u=>new DOMParser().parseFromString(u,o));case"json":return l.json();default:if(o==="")return l.text();{const h=/charset="?([^;"\s]*)"?/i.exec(o),d=h&&h[1]?h[1].toLowerCase():void 0,f=new TextDecoder(d);return l.arrayBuffer().then(p=>f.decode(p))}}}).then(l=>{wi.add(`file:${e}`,l);const u=Ai[e];delete Ai[e];for(let h=0,d=u.length;h<d;h++){const f=u[h];f.onLoad&&f.onLoad(l)}}).catch(l=>{const u=Ai[e];if(u===void 0)throw this.manager.itemError(e),l;delete Ai[e];for(let h=0,d=u.length;h<d;h++){const f=u[h];f.onError&&f.onError(l)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}}const ir=new WeakMap;class BE extends ci{constructor(e){super(e)}load(e,t,n,i){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=this,a=wi.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)s.manager.itemStart(e),setTimeout(function(){t&&t(a),s.manager.itemEnd(e)},0);else{let h=ir.get(a);h===void 0&&(h=[],ir.set(a,h)),h.push({onLoad:t,onError:i})}return a}const o=to("img");function c(){u(),t&&t(this);const h=ir.get(this)||[];for(let d=0;d<h.length;d++){const f=h[d];f.onLoad&&f.onLoad(this)}ir.delete(this),s.manager.itemEnd(e)}function l(h){u(),i&&i(h),wi.remove(`image:${e}`);const d=ir.get(this)||[];for(let f=0;f<d.length;f++){const p=d[f];p.onError&&p.onError(h)}ir.delete(this),s.manager.itemError(e),s.manager.itemEnd(e)}function u(){o.removeEventListener("load",c,!1),o.removeEventListener("error",l,!1)}return o.addEventListener("load",c,!1),o.addEventListener("error",l,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),wi.add(`image:${e}`,o),s.manager.itemStart(e),o.src=e,o}}class DE extends ci{constructor(e){super(e)}load(e,t,n,i){const s=this,a=new ho,o=new Bi(this.manager);return o.setResponseType("arraybuffer"),o.setRequestHeader(this.requestHeader),o.setPath(this.path),o.setWithCredentials(s.withCredentials),o.load(e,function(c){let l;try{l=s.parse(c)}catch(u){if(i!==void 0)i(u);else{console.error(u);return}}l.image!==void 0?a.image=l.image:l.data!==void 0&&(a.image.width=l.width,a.image.height=l.height,a.image.data=l.data),a.wrapS=l.wrapS!==void 0?l.wrapS:Dt,a.wrapT=l.wrapT!==void 0?l.wrapT:Dt,a.magFilter=l.magFilter!==void 0?l.magFilter:Ke,a.minFilter=l.minFilter!==void 0?l.minFilter:Ke,a.anisotropy=l.anisotropy!==void 0?l.anisotropy:1,l.colorSpace!==void 0&&(a.colorSpace=l.colorSpace),l.flipY!==void 0&&(a.flipY=l.flipY),l.format!==void 0&&(a.format=l.format),l.type!==void 0&&(a.type=l.type),l.mipmaps!==void 0&&(a.mipmaps=l.mipmaps,a.minFilter=un),l.mipmapCount===1&&(a.minFilter=Ke),l.generateMipmaps!==void 0&&(a.generateMipmaps=l.generateMipmaps),a.needsUpdate=!0,t&&t(a,l)},n,i),a}}class kg extends ci{constructor(e){super(e)}load(e,t,n,i){const s=new St,a=new BE(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){s.image=o,s.needsUpdate=!0,t!==void 0&&t(s)},n,i),s}}class nl extends ft{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Me(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}const Nl=new Pe,Uf=new B,Nf=new B;class Id{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Oe(512,512),this.mapType=Mt,this.map=null,this.mapPass=null,this.matrix=new Pe,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Sd,this._frameExtents=new Oe(1,1),this._viewportCount=1,this._viewports=[new it(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;Uf.setFromMatrixPosition(e.matrixWorld),t.position.copy(Uf),Nf.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Nf),t.updateMatrixWorld(),Nl.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Nl),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Nl)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class LE extends Id{constructor(){super(new Xt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){const t=this.camera,n=zr*2*e.angle*this.focus,i=this.mapSize.width/this.mapSize.height*this.aspect,s=e.distance||t.far;(n!==t.fov||i!==t.aspect||s!==t.far)&&(t.fov=n,t.aspect=i,t.far=s,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class FE extends nl{constructor(e,t,n=0,i=Math.PI/3,s=0,a=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(ft.DEFAULT_UP),this.updateMatrix(),this.target=new ft,this.distance=n,this.angle=i,this.penumbra=s,this.decay=a,this.map=null,this.shadow=new LE}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}const Of=new Pe,ha=new B,Ol=new B;class PE extends Id{constructor(){super(new Xt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new Oe(4,2),this._viewportCount=6,this._viewports=[new it(2,1,1,1),new it(0,1,1,1),new it(3,1,1,1),new it(1,1,1,1),new it(3,0,1,1),new it(1,0,1,1)],this._cubeDirections=[new B(1,0,0),new B(-1,0,0),new B(0,0,1),new B(0,0,-1),new B(0,1,0),new B(0,-1,0)],this._cubeUps=[new B(0,1,0),new B(0,1,0),new B(0,1,0),new B(0,1,0),new B(0,0,1),new B(0,0,-1)]}updateMatrices(e,t=0){const n=this.camera,i=this.matrix,s=e.distance||n.far;s!==n.far&&(n.far=s,n.updateProjectionMatrix()),ha.setFromMatrixPosition(e.matrixWorld),n.position.copy(ha),Ol.copy(n.position),Ol.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(Ol),n.updateMatrixWorld(),i.makeTranslation(-ha.x,-ha.y,-ha.z),Of.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Of)}}class Qg extends nl{constructor(e,t,n=0,i=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new PE}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class Zr extends wg{constructor(e=-1,t=1,n=1,i=-1,s=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=s,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,s,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2;let s=n-e,a=n+e,o=i+t,c=i-t;if(this.view!==null&&this.view.enabled){const l=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=l*this.view.offsetX,a=s+l*this.view.width,o-=u*this.view.offsetY,c=o-u*this.view.height}this.projectionMatrix.makeOrthographic(s,a,o,c,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class UE extends Id{constructor(){super(new Zr(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Gg extends nl{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(ft.DEFAULT_UP),this.updateMatrix(),this.target=new ft,this.shadow=new UE}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class NE{constructor(){this.isSphericalHarmonics3=!0,this.coefficients=[];for(let e=0;e<9;e++)this.coefficients.push(new B)}set(e){for(let t=0;t<9;t++)this.coefficients[t].copy(e[t]);return this}zero(){for(let e=0;e<9;e++)this.coefficients[e].set(0,0,0);return this}getAt(e,t){const n=e.x,i=e.y,s=e.z,a=this.coefficients;return t.copy(a[0]).multiplyScalar(.282095),t.addScaledVector(a[1],.488603*i),t.addScaledVector(a[2],.488603*s),t.addScaledVector(a[3],.488603*n),t.addScaledVector(a[4],1.092548*(n*i)),t.addScaledVector(a[5],1.092548*(i*s)),t.addScaledVector(a[6],.315392*(3*s*s-1)),t.addScaledVector(a[7],1.092548*(n*s)),t.addScaledVector(a[8],.546274*(n*n-i*i)),t}getIrradianceAt(e,t){const n=e.x,i=e.y,s=e.z,a=this.coefficients;return t.copy(a[0]).multiplyScalar(.886227),t.addScaledVector(a[1],2*.511664*i),t.addScaledVector(a[2],2*.511664*s),t.addScaledVector(a[3],2*.511664*n),t.addScaledVector(a[4],2*.429043*n*i),t.addScaledVector(a[5],2*.429043*i*s),t.addScaledVector(a[6],.743125*s*s-.247708),t.addScaledVector(a[7],2*.429043*n*s),t.addScaledVector(a[8],.429043*(n*n-i*i)),t}add(e){for(let t=0;t<9;t++)this.coefficients[t].add(e.coefficients[t]);return this}addScaledSH(e,t){for(let n=0;n<9;n++)this.coefficients[n].addScaledVector(e.coefficients[n],t);return this}scale(e){for(let t=0;t<9;t++)this.coefficients[t].multiplyScalar(e);return this}lerp(e,t){for(let n=0;n<9;n++)this.coefficients[n].lerp(e.coefficients[n],t);return this}equals(e){for(let t=0;t<9;t++)if(!this.coefficients[t].equals(e.coefficients[t]))return!1;return!0}copy(e){return this.set(e.coefficients)}clone(){return new this.constructor().copy(this)}fromArray(e,t=0){const n=this.coefficients;for(let i=0;i<9;i++)n[i].fromArray(e,t+i*3);return this}toArray(e=[],t=0){const n=this.coefficients;for(let i=0;i<9;i++)n[i].toArray(e,t+i*3);return e}static getBasisAt(e,t){const n=e.x,i=e.y,s=e.z;t[0]=.282095,t[1]=.488603*i,t[2]=.488603*s,t[3]=.488603*n,t[4]=1.092548*n*i,t[5]=1.092548*i*s,t[6]=.315392*(3*s*s-1),t[7]=1.092548*n*s,t[8]=.546274*(n*n-i*i)}}class OE extends nl{constructor(e=new NE,t=1){super(void 0,t),this.isLightProbe=!0,this.sh=e}copy(e){return super.copy(e),this.sh.copy(e.sh),this}fromJSON(e){return this.intensity=e.intensity,this.sh.fromArray(e.sh),this}toJSON(e){const t=super.toJSON(e);return t.object.sh=this.sh.toArray(),t}}class Ha{static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}const kl=new WeakMap;class kE extends ci{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"}}setOptions(e){return this.options=e,this}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=this,a=wi.get(`image-bitmap:${e}`);if(a!==void 0){if(s.manager.itemStart(e),a.then){a.then(l=>{if(kl.has(a)===!0)i&&i(kl.get(a)),s.manager.itemError(e),s.manager.itemEnd(e);else return t&&t(l),s.manager.itemEnd(e),l});return}return setTimeout(function(){t&&t(a),s.manager.itemEnd(e)},0),a}const o={};o.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",o.headers=this.requestHeader;const c=fetch(e,o).then(function(l){return l.blob()}).then(function(l){return createImageBitmap(l,Object.assign(s.options,{colorSpaceConversion:"none"}))}).then(function(l){return wi.add(`image-bitmap:${e}`,l),t&&t(l),s.manager.itemEnd(e),l}).catch(function(l){i&&i(l),kl.set(c,l),wi.remove(`image-bitmap:${e}`),s.manager.itemError(e),s.manager.itemEnd(e)});wi.add(`image-bitmap:${e}`,c),s.manager.itemStart(e)}}class QE extends Xt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}class GE{constructor(e,t,n){this.binding=e,this.valueSize=n;let i,s,a;switch(t){case"quaternion":i=this._slerp,s=this._slerpAdditive,a=this._setAdditiveIdentityQuaternion,this.buffer=new Float64Array(n*6),this._workIndex=5;break;case"string":case"bool":i=this._select,s=this._select,a=this._setAdditiveIdentityOther,this.buffer=new Array(n*5);break;default:i=this._lerp,s=this._lerpAdditive,a=this._setAdditiveIdentityNumeric,this.buffer=new Float64Array(n*5)}this._mixBufferRegion=i,this._mixBufferRegionAdditive=s,this._setIdentity=a,this._origIndex=3,this._addIndex=4,this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,this.useCount=0,this.referenceCount=0}accumulate(e,t){const n=this.buffer,i=this.valueSize,s=e*i+i;let a=this.cumulativeWeight;if(a===0){for(let o=0;o!==i;++o)n[s+o]=n[o];a=t}else{a+=t;const o=t/a;this._mixBufferRegion(n,s,0,o,i)}this.cumulativeWeight=a}accumulateAdditive(e){const t=this.buffer,n=this.valueSize,i=n*this._addIndex;this.cumulativeWeightAdditive===0&&this._setIdentity(),this._mixBufferRegionAdditive(t,i,0,e,n),this.cumulativeWeightAdditive+=e}apply(e){const t=this.valueSize,n=this.buffer,i=e*t+t,s=this.cumulativeWeight,a=this.cumulativeWeightAdditive,o=this.binding;if(this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,s<1){const c=t*this._origIndex;this._mixBufferRegion(n,i,c,1-s,t)}a>0&&this._mixBufferRegionAdditive(n,i,this._addIndex*t,1,t);for(let c=t,l=t+t;c!==l;++c)if(n[c]!==n[c+t]){o.setValue(n,i);break}}saveOriginalState(){const e=this.binding,t=this.buffer,n=this.valueSize,i=n*this._origIndex;e.getValue(t,i);for(let s=n,a=i;s!==a;++s)t[s]=t[i+s%n];this._setIdentity(),this.cumulativeWeight=0,this.cumulativeWeightAdditive=0}restoreOriginalState(){const e=this.valueSize*3;this.binding.setValue(this.buffer,e)}_setAdditiveIdentityNumeric(){const e=this._addIndex*this.valueSize,t=e+this.valueSize;for(let n=e;n<t;n++)this.buffer[n]=0}_setAdditiveIdentityQuaternion(){this._setAdditiveIdentityNumeric(),this.buffer[this._addIndex*this.valueSize+3]=1}_setAdditiveIdentityOther(){const e=this._origIndex*this.valueSize,t=this._addIndex*this.valueSize;for(let n=0;n<this.valueSize;n++)this.buffer[t+n]=this.buffer[e+n]}_select(e,t,n,i,s){if(i>=.5)for(let a=0;a!==s;++a)e[t+a]=e[n+a]}_slerp(e,t,n,i){dn.slerpFlat(e,t,e,t,e,n,i)}_slerpAdditive(e,t,n,i,s){const a=this._workIndex*s;dn.multiplyQuaternionsFlat(e,a,e,t,e,n),dn.slerpFlat(e,t,e,t,e,a,i)}_lerp(e,t,n,i,s){const a=1-i;for(let o=0;o!==s;++o){const c=t+o;e[c]=e[c]*a+e[n+o]*i}}_lerpAdditive(e,t,n,i,s){for(let a=0;a!==s;++a){const o=t+a;e[o]=e[o]+e[n+a]*i}}}const Md="\\[\\]\\.:\\/",HE=new RegExp("["+Md+"]","g"),wd="[^"+Md+"]",zE="[^"+Md.replace("\\.","")+"]",VE=/((?:WC+[\/:])*)/.source.replace("WC",wd),WE=/(WCOD+)?/.source.replace("WCOD",zE),qE=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",wd),XE=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",wd),$E=new RegExp("^"+VE+WE+qE+XE+"$"),jE=["material","materials","bones","map"];class YE{constructor(e,t,n){const i=n||Je.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,i)}getValue(e,t){this.bind();const n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(e,t)}setValue(e,t){const n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,s=n.length;i!==s;++i)n[i].setValue(e,t)}bind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}}class Je{constructor(e,t,n){this.path=t,this.parsedPath=n||Je.parseTrackName(t),this.node=Je.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new Je.Composite(e,t,n):new Je(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(HE,"")}static parseTrackName(e){const t=$E.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);const n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){const s=n.nodeName.substring(i+1);jE.indexOf(s)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=s)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){const n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){const n=function(s){for(let a=0;a<s.length;a++){const o=s[a];if(o.name===t||o.uuid===t)return o;const c=n(o.children);if(c)return c}return null},i=n(e.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){const n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)e[t++]=n[i]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){const n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++]}_setValue_array_setNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node;const t=this.parsedPath,n=t.objectName,i=t.propertyName;let s=t.propertyIndex;if(e||(e=Je.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let l=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===l){l=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(l!==void 0){if(e[l]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[l]}}const a=e[i];if(a===void 0){const l=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+l+"."+i+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(s!==void 0){if(i==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}c=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=s}else a.fromArray!==void 0&&a.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(c=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}Je.Composite=YE;Je.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Je.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Je.prototype.GetterByBindingType=[Je.prototype._getValue_direct,Je.prototype._getValue_array,Je.prototype._getValue_arrayElement,Je.prototype._getValue_toArray];Je.prototype.SetterByBindingTypeAndVersioning=[[Je.prototype._setValue_direct,Je.prototype._setValue_direct_setNeedsUpdate,Je.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Je.prototype._setValue_array,Je.prototype._setValue_array_setNeedsUpdate,Je.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Je.prototype._setValue_arrayElement,Je.prototype._setValue_arrayElement_setNeedsUpdate,Je.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Je.prototype._setValue_fromArray,Je.prototype._setValue_fromArray_setNeedsUpdate,Je.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];class KE{constructor(e,t,n=null,i=t.blendMode){this._mixer=e,this._clip=t,this._localRoot=n,this.blendMode=i;const s=t.tracks,a=s.length,o=new Array(a),c={endingStart:yr,endingEnd:yr};for(let l=0;l!==a;++l){const u=s[l].createInterpolant(null);o[l]=u,u.settings=c}this._interpolantSettings=c,this._interpolants=o,this._propertyBindings=new Array(a),this._cacheIndex=null,this._byClipCacheIndex=null,this._timeScaleInterpolant=null,this._weightInterpolant=null,this.loop=Dr,this._loopCount=-1,this._startTime=null,this.time=0,this.timeScale=1,this._effectiveTimeScale=1,this.weight=1,this._effectiveWeight=1,this.repetitions=1/0,this.paused=!1,this.enabled=!0,this.clampWhenFinished=!1,this.zeroSlopeAtStart=!0,this.zeroSlopeAtEnd=!0}play(){return this._mixer._activateAction(this),this}stop(){return this._mixer._deactivateAction(this),this.reset()}reset(){return this.paused=!1,this.enabled=!0,this.time=0,this._loopCount=-1,this._startTime=null,this.stopFading().stopWarping()}isRunning(){return this.enabled&&!this.paused&&this.timeScale!==0&&this._startTime===null&&this._mixer._isActiveAction(this)}isScheduled(){return this._mixer._isActiveAction(this)}startAt(e){return this._startTime=e,this}setLoop(e,t){return this.loop=e,this.repetitions=t,this}setEffectiveWeight(e){return this.weight=e,this._effectiveWeight=this.enabled?e:0,this.stopFading()}getEffectiveWeight(){return this._effectiveWeight}fadeIn(e){return this._scheduleFading(e,0,1)}fadeOut(e){return this._scheduleFading(e,1,0)}crossFadeFrom(e,t,n=!1){if(e.fadeOut(t),this.fadeIn(t),n===!0){const i=this._clip.duration,s=e._clip.duration,a=s/i,o=i/s;e.warp(1,a,t),this.warp(o,1,t)}return this}crossFadeTo(e,t,n=!1){return e.crossFadeFrom(this,t,n)}stopFading(){const e=this._weightInterpolant;return e!==null&&(this._weightInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}setEffectiveTimeScale(e){return this.timeScale=e,this._effectiveTimeScale=this.paused?0:e,this.stopWarping()}getEffectiveTimeScale(){return this._effectiveTimeScale}setDuration(e){return this.timeScale=this._clip.duration/e,this.stopWarping()}syncWith(e){return this.time=e.time,this.timeScale=e.timeScale,this.stopWarping()}halt(e){return this.warp(this._effectiveTimeScale,0,e)}warp(e,t,n){const i=this._mixer,s=i.time,a=this.timeScale;let o=this._timeScaleInterpolant;o===null&&(o=i._lendControlInterpolant(),this._timeScaleInterpolant=o);const c=o.parameterPositions,l=o.sampleValues;return c[0]=s,c[1]=s+n,l[0]=e/a,l[1]=t/a,this}stopWarping(){const e=this._timeScaleInterpolant;return e!==null&&(this._timeScaleInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}getMixer(){return this._mixer}getClip(){return this._clip}getRoot(){return this._localRoot||this._mixer._root}_update(e,t,n,i){if(!this.enabled){this._updateWeight(e);return}const s=this._startTime;if(s!==null){const c=(e-s)*n;c<0||n===0?t=0:(this._startTime=null,t=n*c)}t*=this._updateTimeScale(e);const a=this._updateTime(t),o=this._updateWeight(e);if(o>0){const c=this._interpolants,l=this._propertyBindings;switch(this.blendMode){case s_:for(let u=0,h=c.length;u!==h;++u)c[u].evaluate(a),l[u].accumulateAdditive(o);break;case bd:default:for(let u=0,h=c.length;u!==h;++u)c[u].evaluate(a),l[u].accumulate(i,o)}}}_updateWeight(e){let t=0;if(this.enabled){t=this.weight;const n=this._weightInterpolant;if(n!==null){const i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(this.stopFading(),i===0&&(this.enabled=!1))}}return this._effectiveWeight=t,t}_updateTimeScale(e){let t=0;if(!this.paused){t=this.timeScale;const n=this._timeScaleInterpolant;if(n!==null){const i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(this.stopWarping(),t===0?this.paused=!0:this.timeScale=t)}}return this._effectiveTimeScale=t,t}_updateTime(e){const t=this._clip.duration,n=this.loop;let i=this.time+e,s=this._loopCount;const a=n===Pc;if(e===0)return s===-1?i:a&&(s&1)===1?t-i:i;if(n===eo){s===-1&&(this._loopCount=0,this._setEndings(!0,!0,!1));e:{if(i>=t)i=t;else if(i<0)i=0;else{this.time=i;break e}this.clampWhenFinished?this.paused=!0:this.enabled=!1,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e<0?-1:1})}}else{if(s===-1&&(e>=0?(s=0,this._setEndings(!0,this.repetitions===0,a)):this._setEndings(this.repetitions===0,!0,a)),i>=t||i<0){const o=Math.floor(i/t);i-=t*o,s+=Math.abs(o);const c=this.repetitions-s;if(c<=0)this.clampWhenFinished?this.paused=!0:this.enabled=!1,i=e>0?t:0,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e>0?1:-1});else{if(c===1){const l=e<0;this._setEndings(l,!l,a)}else this._setEndings(!1,!1,a);this._loopCount=s,this.time=i,this._mixer.dispatchEvent({type:"loop",action:this,loopDelta:o})}}else this.time=i;if(a&&(s&1)===1)return t-i}return i}_setEndings(e,t,n){const i=this._interpolantSettings;n?(i.endingStart=Sr,i.endingEnd=Sr):(e?i.endingStart=this.zeroSlopeAtStart?Sr:yr:i.endingStart=Uc,t?i.endingEnd=this.zeroSlopeAtEnd?Sr:yr:i.endingEnd=Uc)}_scheduleFading(e,t,n){const i=this._mixer,s=i.time;let a=this._weightInterpolant;a===null&&(a=i._lendControlInterpolant(),this._weightInterpolant=a);const o=a.parameterPositions,c=a.sampleValues;return o[0]=s,c[0]=t,o[1]=s+e,c[1]=n,this}}const JE=new Float32Array(1);class ZE extends jn{constructor(e){super(),this._root=e,this._initMemoryManager(),this._accuIndex=0,this.time=0,this.timeScale=1}_bindAction(e,t){const n=e._localRoot||this._root,i=e._clip.tracks,s=i.length,a=e._propertyBindings,o=e._interpolants,c=n.uuid,l=this._bindingsByRootAndName;let u=l[c];u===void 0&&(u={},l[c]=u);for(let h=0;h!==s;++h){const d=i[h],f=d.name;let p=u[f];if(p!==void 0)++p.referenceCount,a[h]=p;else{if(p=a[h],p!==void 0){p._cacheIndex===null&&(++p.referenceCount,this._addInactiveBinding(p,c,f));continue}const g=t&&t._propertyBindings[h].binding.parsedPath;p=new GE(Je.create(n,f,g),d.ValueTypeName,d.getValueSize()),++p.referenceCount,this._addInactiveBinding(p,c,f),a[h]=p}o[h].resultBuffer=p.buffer}}_activateAction(e){if(!this._isActiveAction(e)){if(e._cacheIndex===null){const n=(e._localRoot||this._root).uuid,i=e._clip.uuid,s=this._actionsByClip[i];this._bindAction(e,s&&s.knownActions[0]),this._addInactiveAction(e,i,n)}const t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){const s=t[n];s.useCount++===0&&(this._lendBinding(s),s.saveOriginalState())}this._lendAction(e)}}_deactivateAction(e){if(this._isActiveAction(e)){const t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){const s=t[n];--s.useCount===0&&(s.restoreOriginalState(),this._takeBackBinding(s))}this._takeBackAction(e)}}_initMemoryManager(){this._actions=[],this._nActiveActions=0,this._actionsByClip={},this._bindings=[],this._nActiveBindings=0,this._bindingsByRootAndName={},this._controlInterpolants=[],this._nActiveControlInterpolants=0;const e=this;this.stats={actions:{get total(){return e._actions.length},get inUse(){return e._nActiveActions}},bindings:{get total(){return e._bindings.length},get inUse(){return e._nActiveBindings}},controlInterpolants:{get total(){return e._controlInterpolants.length},get inUse(){return e._nActiveControlInterpolants}}}}_isActiveAction(e){const t=e._cacheIndex;return t!==null&&t<this._nActiveActions}_addInactiveAction(e,t,n){const i=this._actions,s=this._actionsByClip;let a=s[t];if(a===void 0)a={knownActions:[e],actionByRoot:{}},e._byClipCacheIndex=0,s[t]=a;else{const o=a.knownActions;e._byClipCacheIndex=o.length,o.push(e)}e._cacheIndex=i.length,i.push(e),a.actionByRoot[n]=e}_removeInactiveAction(e){const t=this._actions,n=t[t.length-1],i=e._cacheIndex;n._cacheIndex=i,t[i]=n,t.pop(),e._cacheIndex=null;const s=e._clip.uuid,a=this._actionsByClip,o=a[s],c=o.knownActions,l=c[c.length-1],u=e._byClipCacheIndex;l._byClipCacheIndex=u,c[u]=l,c.pop(),e._byClipCacheIndex=null;const h=o.actionByRoot,d=(e._localRoot||this._root).uuid;delete h[d],c.length===0&&delete a[s],this._removeInactiveBindingsForAction(e)}_removeInactiveBindingsForAction(e){const t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){const s=t[n];--s.referenceCount===0&&this._removeInactiveBinding(s)}}_lendAction(e){const t=this._actions,n=e._cacheIndex,i=this._nActiveActions++,s=t[i];e._cacheIndex=i,t[i]=e,s._cacheIndex=n,t[n]=s}_takeBackAction(e){const t=this._actions,n=e._cacheIndex,i=--this._nActiveActions,s=t[i];e._cacheIndex=i,t[i]=e,s._cacheIndex=n,t[n]=s}_addInactiveBinding(e,t,n){const i=this._bindingsByRootAndName,s=this._bindings;let a=i[t];a===void 0&&(a={},i[t]=a),a[n]=e,e._cacheIndex=s.length,s.push(e)}_removeInactiveBinding(e){const t=this._bindings,n=e.binding,i=n.rootNode.uuid,s=n.path,a=this._bindingsByRootAndName,o=a[i],c=t[t.length-1],l=e._cacheIndex;c._cacheIndex=l,t[l]=c,t.pop(),delete o[s],Object.keys(o).length===0&&delete a[i]}_lendBinding(e){const t=this._bindings,n=e._cacheIndex,i=this._nActiveBindings++,s=t[i];e._cacheIndex=i,t[i]=e,s._cacheIndex=n,t[n]=s}_takeBackBinding(e){const t=this._bindings,n=e._cacheIndex,i=--this._nActiveBindings,s=t[i];e._cacheIndex=i,t[i]=e,s._cacheIndex=n,t[n]=s}_lendControlInterpolant(){const e=this._controlInterpolants,t=this._nActiveControlInterpolants++;let n=e[t];return n===void 0&&(n=new Ug(new Float32Array(2),new Float32Array(2),1,JE),n.__cacheIndex=t,e[t]=n),n}_takeBackControlInterpolant(e){const t=this._controlInterpolants,n=e.__cacheIndex,i=--this._nActiveControlInterpolants,s=t[i];e.__cacheIndex=i,t[i]=e,s.__cacheIndex=n,t[n]=s}clipAction(e,t,n){const i=t||this._root,s=i.uuid;let a=typeof e=="string"?Vu.findByName(i,e):e;const o=a!==null?a.uuid:e,c=this._actionsByClip[o];let l=null;if(n===void 0&&(a!==null?n=a.blendMode:n=bd),c!==void 0){const h=c.actionByRoot[s];if(h!==void 0&&h.blendMode===n)return h;l=c.knownActions[0],a===null&&(a=l._clip)}if(a===null)return null;const u=new KE(this,a,t,n);return this._bindAction(u,l),this._addInactiveAction(u,o,s),u}existingAction(e,t){const n=t||this._root,i=n.uuid,s=typeof e=="string"?Vu.findByName(n,e):e,a=s?s.uuid:e,o=this._actionsByClip[a];return o!==void 0&&o.actionByRoot[i]||null}stopAllAction(){const e=this._actions,t=this._nActiveActions;for(let n=t-1;n>=0;--n)e[n].stop();return this}update(e){e*=this.timeScale;const t=this._actions,n=this._nActiveActions,i=this.time+=e,s=Math.sign(e),a=this._accuIndex^=1;for(let l=0;l!==n;++l)t[l]._update(i,e,s,a);const o=this._bindings,c=this._nActiveBindings;for(let l=0;l!==c;++l)o[l].apply(a);return this}setTime(e){this.time=0;for(let t=0;t<this._actions.length;t++)this._actions[t].time=0;return this.update(e)}getRoot(){return this._root}uncacheClip(e){const t=this._actions,n=e.uuid,i=this._actionsByClip,s=i[n];if(s!==void 0){const a=s.knownActions;for(let o=0,c=a.length;o!==c;++o){const l=a[o];this._deactivateAction(l);const u=l._cacheIndex,h=t[t.length-1];l._cacheIndex=null,l._byClipCacheIndex=null,h._cacheIndex=u,t[u]=h,t.pop(),this._removeInactiveBindingsForAction(l)}delete i[n]}}uncacheRoot(e){const t=e.uuid,n=this._actionsByClip;for(const a in n){const o=n[a].actionByRoot,c=o[t];c!==void 0&&(this._deactivateAction(c),this._removeInactiveAction(c))}const i=this._bindingsByRootAndName,s=i[t];if(s!==void 0)for(const a in s){const o=s[a];o.restoreOriginalState(),this._removeInactiveBinding(o)}}uncacheAction(e,t){const n=this.existingAction(e,t);n!==null&&(this._deactivateAction(n),this._removeInactiveAction(n))}}const kf=new Pe;class ev{constructor(e,t,n=0,i=1/0){this.ray=new lo(e,t),this.near=n,this.far=i,this.camera=null,this.layers=new Ed,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return kf.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(kf),this}intersectObject(e,t=!0,n=[]){return Wu(e,this,n,t),n.sort(Qf),n}intersectObjects(e,t=!0,n=[]){for(let i=0,s=e.length;i<s;i++)Wu(e[i],this,n,t);return n.sort(Qf),n}}function Qf(r,e){return r.distance-e.distance}function Wu(r,e,t,n){let i=!0;if(r.layers.test(e.layers)&&r.raycast(e,t)===!1&&(i=!1),i===!0&&n===!0){const s=r.children;for(let a=0,o=s.length;a<o;a++)Wu(s[a],e,t,!0)}}class Ec{constructor(e=1,t=0,n=0){this.radius=e,this.phi=t,this.theta=n}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=We(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(We(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}function Gf(r,e,t,n){const i=tv(n);switch(t){case pg:return r*e;case ji:return r*e/i.components*i.byteLength;case Ad:return r*e/i.components*i.byteLength;case Ms:return r*e*2/i.components*i.byteLength;case md:return r*e*2/i.components*i.byteLength;case Ag:return r*e*3/i.components*i.byteLength;case yt:return r*e*4/i.components*i.byteLength;case gd:return r*e*4/i.components*i.byteLength;case Rr:case Rs:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*8;case Br:case Bs:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case vu:case xu:return Math.max(r,16)*Math.max(e,8)/4;case Bc:case Dc:return Math.max(r,8)*Math.max(e,8)/2;case Lc:case Ka:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*8;case Ja:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case Ds:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case yu:return Math.floor((r+4)/5)*Math.floor((e+3)/4)*16;case Su:return Math.floor((r+4)/5)*Math.floor((e+4)/5)*16;case Cu:return Math.floor((r+5)/6)*Math.floor((e+4)/5)*16;case Za:return Math.floor((r+5)/6)*Math.floor((e+5)/6)*16;case Iu:return Math.floor((r+7)/8)*Math.floor((e+4)/5)*16;case Mu:return Math.floor((r+7)/8)*Math.floor((e+5)/6)*16;case wu:return Math.floor((r+7)/8)*Math.floor((e+7)/8)*16;case Tu:return Math.floor((r+9)/10)*Math.floor((e+4)/5)*16;case Ru:return Math.floor((r+9)/10)*Math.floor((e+5)/6)*16;case Bu:return Math.floor((r+9)/10)*Math.floor((e+7)/8)*16;case Du:return Math.floor((r+9)/10)*Math.floor((e+9)/10)*16;case Lu:return Math.floor((r+11)/12)*Math.floor((e+9)/10)*16;case Fu:return Math.floor((r+11)/12)*Math.floor((e+11)/12)*16;case Ls:case Pu:case Fc:return Math.ceil(r/4)*Math.ceil(e/4)*16;case mg:case Uu:return Math.ceil(r/4)*Math.ceil(e/4)*8;case Nu:case Ou:return Math.ceil(r/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function tv(r){switch(r){case Mt:case ud:return{byteLength:1,components:1};case Xa:case dd:case Ut:return{byteLength:2,components:1};case fd:case pd:return{byteLength:2,components:4};case es:case el:case Lt:return{byteLength:4,components:1};case fg:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${r}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Jc}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Jc);/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function Hg(){let r=null,e=!1,t=null,n=null;function i(s,a){t(s,a),n=r.requestAnimationFrame(i)}return{start:function(){e!==!0&&t!==null&&(n=r.requestAnimationFrame(i),e=!0)},stop:function(){r.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){r=s}}}function nv(r){const e=new WeakMap;function t(o,c){const l=o.array,u=o.usage,h=l.byteLength,d=r.createBuffer();r.bindBuffer(c,d),r.bufferData(c,l,u),o.onUploadCallback();let f;if(l instanceof Float32Array)f=r.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)f=r.HALF_FLOAT;else if(l instanceof Uint16Array)o.isFloat16BufferAttribute?f=r.HALF_FLOAT:f=r.UNSIGNED_SHORT;else if(l instanceof Int16Array)f=r.SHORT;else if(l instanceof Uint32Array)f=r.UNSIGNED_INT;else if(l instanceof Int32Array)f=r.INT;else if(l instanceof Int8Array)f=r.BYTE;else if(l instanceof Uint8Array)f=r.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)f=r.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:d,type:f,bytesPerElement:l.BYTES_PER_ELEMENT,version:o.version,size:h}}function n(o,c,l){const u=c.array,h=c.updateRanges;if(r.bindBuffer(l,o),h.length===0)r.bufferSubData(l,0,u);else{h.sort((f,p)=>f.start-p.start);let d=0;for(let f=1;f<h.length;f++){const p=h[d],g=h[f];g.start<=p.start+p.count+1?p.count=Math.max(p.count,g.start+g.count-p.start):(++d,h[d]=g)}h.length=d+1;for(let f=0,p=h.length;f<p;f++){const g=h[f];r.bufferSubData(l,g.start*u.BYTES_PER_ELEMENT,u,g.start,g.count)}c.clearUpdateRanges()}c.onUploadCallback()}function i(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function s(o){o.isInterleavedBufferAttribute&&(o=o.data);const c=e.get(o);c&&(r.deleteBuffer(c.buffer),e.delete(o))}function a(o,c){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const u=e.get(o);(!u||u.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const l=e.get(o);if(l===void 0)e.set(o,t(o,c));else if(l.version<o.version){if(l.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(l.buffer,o,c),l.version=o.version}}return{get:i,remove:s,update:a}}var iv=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,sv=`#ifdef USE_ALPHAHASH
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
#endif`,rv=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,av=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,ov=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,cv=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,lv=`#ifdef USE_AOMAP
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
#endif`,hv=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,uv=`#ifdef USE_BATCHING
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
#endif`,dv=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,fv=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,pv=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Av=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,mv=`#ifdef USE_IRIDESCENCE
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
#endif`,gv=`#ifdef USE_BUMPMAP
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
#endif`,bv=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,_v=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Ev=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,vv=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,xv=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,yv=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Sv=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Cv=`#if defined( USE_COLOR_ALPHA )
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
#endif`,Iv=`#define PI 3.141592653589793
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
} // validated`,Mv=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,wv=`vec3 transformedNormal = objectNormal;
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
#endif`,Tv=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Rv=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Bv=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Dv=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Lv="gl_FragColor = linearToOutputTexel( gl_FragColor );",Fv=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Pv=`#ifdef USE_ENVMAP
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
#endif`,Uv=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Nv=`#ifdef USE_ENVMAP
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
#endif`,Ov=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,kv=`#ifdef USE_ENVMAP
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
#endif`,Qv=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Gv=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Hv=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,zv=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Vv=`#ifdef USE_GRADIENTMAP
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
}`,Wv=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,qv=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Xv=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,$v=`uniform bool receiveShadow;
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
#endif`,jv=`#ifdef USE_ENVMAP
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
#endif`,Yv=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Kv=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Jv=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Zv=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,ex=`PhysicalMaterial material;
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
#endif`,tx=`struct PhysicalMaterial {
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
}`,nx=`
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
#endif`,ix=`#if defined( RE_IndirectDiffuse )
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
#endif`,sx=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,rx=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,ax=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,ox=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,cx=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,lx=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,hx=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,ux=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,dx=`#if defined( USE_POINTS_UV )
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
#endif`,fx=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,px=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Ax=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,mx=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,gx=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,bx=`#ifdef USE_MORPHTARGETS
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
#endif`,_x=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Ex=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,vx=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,xx=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,yx=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Sx=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Cx=`#ifdef USE_NORMALMAP
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
#endif`,Ix=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Mx=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,wx=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Tx=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Rx=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Bx=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Dx=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Lx=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Fx=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Px=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Ux=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Nx=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Ox=`#if NUM_SPOT_LIGHT_COORDS > 0
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
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
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
#endif`,kx=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Qx=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Gx=`float getShadowMask() {
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
}`,Hx=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,zx=`#ifdef USE_SKINNING
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
#endif`,Vx=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Wx=`#ifdef USE_SKINNING
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
#endif`,qx=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Xx=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,$x=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,jx=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,Yx=`#ifdef USE_TRANSMISSION
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
#endif`,Kx=`#ifdef USE_TRANSMISSION
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
#endif`,Jx=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Zx=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,ey=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,ty=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const ny=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,iy=`uniform sampler2D t2D;
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
}`,sy=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,ry=`#ifdef ENVMAP_TYPE_CUBE
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
}`,ay=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,oy=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cy=`#include <common>
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
}`,ly=`#if DEPTH_PACKING == 3200
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
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,hy=`#define DISTANCE
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
}`,uy=`#define DISTANCE
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
}`,dy=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,fy=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,py=`uniform float scale;
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
}`,Ay=`uniform vec3 diffuse;
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
}`,my=`#include <common>
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
}`,gy=`uniform vec3 diffuse;
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
}`,by=`#define LAMBERT
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
}`,_y=`#define LAMBERT
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
}`,Ey=`#define MATCAP
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
}`,vy=`#define MATCAP
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
}`,xy=`#define NORMAL
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
}`,yy=`#define NORMAL
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
}`,Sy=`#define PHONG
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
}`,Cy=`#define PHONG
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
}`,Iy=`#define STANDARD
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
}`,My=`#define STANDARD
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
}`,wy=`#define TOON
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
}`,Ty=`#define TOON
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
}`,Ry=`uniform float size;
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
}`,By=`uniform vec3 diffuse;
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
}`,Dy=`#include <common>
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
}`,Ly=`uniform vec3 color;
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
}`,Fy=`uniform float rotation;
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
}`,Py=`uniform vec3 diffuse;
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
}`,ze={alphahash_fragment:iv,alphahash_pars_fragment:sv,alphamap_fragment:rv,alphamap_pars_fragment:av,alphatest_fragment:ov,alphatest_pars_fragment:cv,aomap_fragment:lv,aomap_pars_fragment:hv,batching_pars_vertex:uv,batching_vertex:dv,begin_vertex:fv,beginnormal_vertex:pv,bsdfs:Av,iridescence_fragment:mv,bumpmap_pars_fragment:gv,clipping_planes_fragment:bv,clipping_planes_pars_fragment:_v,clipping_planes_pars_vertex:Ev,clipping_planes_vertex:vv,color_fragment:xv,color_pars_fragment:yv,color_pars_vertex:Sv,color_vertex:Cv,common:Iv,cube_uv_reflection_fragment:Mv,defaultnormal_vertex:wv,displacementmap_pars_vertex:Tv,displacementmap_vertex:Rv,emissivemap_fragment:Bv,emissivemap_pars_fragment:Dv,colorspace_fragment:Lv,colorspace_pars_fragment:Fv,envmap_fragment:Pv,envmap_common_pars_fragment:Uv,envmap_pars_fragment:Nv,envmap_pars_vertex:Ov,envmap_physical_pars_fragment:jv,envmap_vertex:kv,fog_vertex:Qv,fog_pars_vertex:Gv,fog_fragment:Hv,fog_pars_fragment:zv,gradientmap_pars_fragment:Vv,lightmap_pars_fragment:Wv,lights_lambert_fragment:qv,lights_lambert_pars_fragment:Xv,lights_pars_begin:$v,lights_toon_fragment:Yv,lights_toon_pars_fragment:Kv,lights_phong_fragment:Jv,lights_phong_pars_fragment:Zv,lights_physical_fragment:ex,lights_physical_pars_fragment:tx,lights_fragment_begin:nx,lights_fragment_maps:ix,lights_fragment_end:sx,logdepthbuf_fragment:rx,logdepthbuf_pars_fragment:ax,logdepthbuf_pars_vertex:ox,logdepthbuf_vertex:cx,map_fragment:lx,map_pars_fragment:hx,map_particle_fragment:ux,map_particle_pars_fragment:dx,metalnessmap_fragment:fx,metalnessmap_pars_fragment:px,morphinstance_vertex:Ax,morphcolor_vertex:mx,morphnormal_vertex:gx,morphtarget_pars_vertex:bx,morphtarget_vertex:_x,normal_fragment_begin:Ex,normal_fragment_maps:vx,normal_pars_fragment:xx,normal_pars_vertex:yx,normal_vertex:Sx,normalmap_pars_fragment:Cx,clearcoat_normal_fragment_begin:Ix,clearcoat_normal_fragment_maps:Mx,clearcoat_pars_fragment:wx,iridescence_pars_fragment:Tx,opaque_fragment:Rx,packing:Bx,premultiplied_alpha_fragment:Dx,project_vertex:Lx,dithering_fragment:Fx,dithering_pars_fragment:Px,roughnessmap_fragment:Ux,roughnessmap_pars_fragment:Nx,shadowmap_pars_fragment:Ox,shadowmap_pars_vertex:kx,shadowmap_vertex:Qx,shadowmask_pars_fragment:Gx,skinbase_vertex:Hx,skinning_pars_vertex:zx,skinning_vertex:Vx,skinnormal_vertex:Wx,specularmap_fragment:qx,specularmap_pars_fragment:Xx,tonemapping_fragment:$x,tonemapping_pars_fragment:jx,transmission_fragment:Yx,transmission_pars_fragment:Kx,uv_pars_fragment:Jx,uv_pars_vertex:Zx,uv_vertex:ey,worldpos_vertex:ty,background_vert:ny,background_frag:iy,backgroundCube_vert:sy,backgroundCube_frag:ry,cube_vert:ay,cube_frag:oy,depth_vert:cy,depth_frag:ly,distanceRGBA_vert:hy,distanceRGBA_frag:uy,equirect_vert:dy,equirect_frag:fy,linedashed_vert:py,linedashed_frag:Ay,meshbasic_vert:my,meshbasic_frag:gy,meshlambert_vert:by,meshlambert_frag:_y,meshmatcap_vert:Ey,meshmatcap_frag:vy,meshnormal_vert:xy,meshnormal_frag:yy,meshphong_vert:Sy,meshphong_frag:Cy,meshphysical_vert:Iy,meshphysical_frag:My,meshtoon_vert:wy,meshtoon_frag:Ty,points_vert:Ry,points_frag:By,shadow_vert:Dy,shadow_frag:Ly,sprite_vert:Fy,sprite_frag:Py},oe={common:{diffuse:{value:new Me(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Qe},alphaMap:{value:null},alphaMapTransform:{value:new Qe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Qe}},envmap:{envMap:{value:null},envMapRotation:{value:new Qe},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Qe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Qe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Qe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Qe},normalScale:{value:new Oe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Qe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Qe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Qe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Qe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Me(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Me(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Qe},alphaTest:{value:0},uvTransform:{value:new Qe}},sprite:{diffuse:{value:new Me(16777215)},opacity:{value:1},center:{value:new Oe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Qe},alphaMap:{value:null},alphaMapTransform:{value:new Qe},alphaTest:{value:0}}},Zn={basic:{uniforms:an([oe.common,oe.specularmap,oe.envmap,oe.aomap,oe.lightmap,oe.fog]),vertexShader:ze.meshbasic_vert,fragmentShader:ze.meshbasic_frag},lambert:{uniforms:an([oe.common,oe.specularmap,oe.envmap,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.fog,oe.lights,{emissive:{value:new Me(0)}}]),vertexShader:ze.meshlambert_vert,fragmentShader:ze.meshlambert_frag},phong:{uniforms:an([oe.common,oe.specularmap,oe.envmap,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.fog,oe.lights,{emissive:{value:new Me(0)},specular:{value:new Me(1118481)},shininess:{value:30}}]),vertexShader:ze.meshphong_vert,fragmentShader:ze.meshphong_frag},standard:{uniforms:an([oe.common,oe.envmap,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.roughnessmap,oe.metalnessmap,oe.fog,oe.lights,{emissive:{value:new Me(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ze.meshphysical_vert,fragmentShader:ze.meshphysical_frag},toon:{uniforms:an([oe.common,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.gradientmap,oe.fog,oe.lights,{emissive:{value:new Me(0)}}]),vertexShader:ze.meshtoon_vert,fragmentShader:ze.meshtoon_frag},matcap:{uniforms:an([oe.common,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.fog,{matcap:{value:null}}]),vertexShader:ze.meshmatcap_vert,fragmentShader:ze.meshmatcap_frag},points:{uniforms:an([oe.points,oe.fog]),vertexShader:ze.points_vert,fragmentShader:ze.points_frag},dashed:{uniforms:an([oe.common,oe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ze.linedashed_vert,fragmentShader:ze.linedashed_frag},depth:{uniforms:an([oe.common,oe.displacementmap]),vertexShader:ze.depth_vert,fragmentShader:ze.depth_frag},normal:{uniforms:an([oe.common,oe.bumpmap,oe.normalmap,oe.displacementmap,{opacity:{value:1}}]),vertexShader:ze.meshnormal_vert,fragmentShader:ze.meshnormal_frag},sprite:{uniforms:an([oe.sprite,oe.fog]),vertexShader:ze.sprite_vert,fragmentShader:ze.sprite_frag},background:{uniforms:{uvTransform:{value:new Qe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ze.background_vert,fragmentShader:ze.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Qe}},vertexShader:ze.backgroundCube_vert,fragmentShader:ze.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ze.cube_vert,fragmentShader:ze.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ze.equirect_vert,fragmentShader:ze.equirect_frag},distanceRGBA:{uniforms:an([oe.common,oe.displacementmap,{referencePosition:{value:new B},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ze.distanceRGBA_vert,fragmentShader:ze.distanceRGBA_frag},shadow:{uniforms:an([oe.lights,oe.fog,{color:{value:new Me(0)},opacity:{value:1}}]),vertexShader:ze.shadow_vert,fragmentShader:ze.shadow_frag}};Zn.physical={uniforms:an([Zn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Qe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Qe},clearcoatNormalScale:{value:new Oe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Qe},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Qe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Qe},sheen:{value:0},sheenColor:{value:new Me(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Qe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Qe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Qe},transmissionSamplerSize:{value:new Oe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Qe},attenuationDistance:{value:0},attenuationColor:{value:new Me(0)},specularColor:{value:new Me(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Qe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Qe},anisotropyVector:{value:new Oe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Qe}}]),vertexShader:ze.meshphysical_vert,fragmentShader:ze.meshphysical_frag};const Ho={r:0,b:0,g:0},cs=new Pn,Uy=new Pe;function Ny(r,e,t,n,i,s,a){const o=new Me(0);let c=s===!0?0:1,l,u,h=null,d=0,f=null;function p(_){let b=_.isScene===!0?_.background:null;return b&&b.isTexture&&(b=(_.backgroundBlurriness>0?t:e).get(b)),b}function g(_){let b=!1;const S=p(_);S===null?A(o,c):S&&S.isColor&&(A(S,1),b=!0);const I=r.xr.getEnvironmentBlendMode();I==="additive"?n.buffers.color.setClear(0,0,0,1,a):I==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(r.autoClear||b)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),r.clear(r.autoClearColor,r.autoClearDepth,r.autoClearStencil))}function m(_,b){const S=p(b);S&&(S.isCubeTexture||S.mapping===Zc)?(u===void 0&&(u=new ut(new Di(1,1,1),new Cn({name:"BackgroundCubeMaterial",uniforms:Vr(Zn.backgroundCube.uniforms),vertexShader:Zn.backgroundCube.vertexShader,fragmentShader:Zn.backgroundCube.fragmentShader,side:$t,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(I,M,w){this.matrixWorld.copyPosition(w.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(u)),cs.copy(b.backgroundRotation),cs.x*=-1,cs.y*=-1,cs.z*=-1,S.isCubeTexture&&S.isRenderTargetTexture===!1&&(cs.y*=-1,cs.z*=-1),u.material.uniforms.envMap.value=S,u.material.uniforms.flipEnvMap.value=S.isCubeTexture&&S.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=b.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(Uy.makeRotationFromEuler(cs)),u.material.toneMapped=Ye.getTransfer(S.colorSpace)!==ht,(h!==S||d!==S.version||f!==r.toneMapping)&&(u.material.needsUpdate=!0,h=S,d=S.version,f=r.toneMapping),u.layers.enableAll(),_.unshift(u,u.geometry,u.material,0,0,null)):S&&S.isTexture&&(l===void 0&&(l=new ut(new Li(2,2),new Cn({name:"BackgroundMaterial",uniforms:Vr(Zn.background.uniforms),vertexShader:Zn.background.vertexShader,fragmentShader:Zn.background.fragmentShader,side:Xn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=S,l.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,l.material.toneMapped=Ye.getTransfer(S.colorSpace)!==ht,S.matrixAutoUpdate===!0&&S.updateMatrix(),l.material.uniforms.uvTransform.value.copy(S.matrix),(h!==S||d!==S.version||f!==r.toneMapping)&&(l.material.needsUpdate=!0,h=S,d=S.version,f=r.toneMapping),l.layers.enableAll(),_.unshift(l,l.geometry,l.material,0,0,null))}function A(_,b){_.getRGB(Ho,Mg(r)),n.buffers.color.setClear(Ho.r,Ho.g,Ho.b,b,a)}function E(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return o},setClearColor:function(_,b=1){o.set(_),c=b,A(o,c)},getClearAlpha:function(){return c},setClearAlpha:function(_){c=_,A(o,c)},render:g,addToRenderList:m,dispose:E}}function Oy(r,e){const t=r.getParameter(r.MAX_VERTEX_ATTRIBS),n={},i=d(null);let s=i,a=!1;function o(v,R,k,F,P){let G=!1;const O=h(F,k,R);s!==O&&(s=O,l(s.object)),G=f(v,F,k,P),G&&p(v,F,k,P),P!==null&&e.update(P,r.ELEMENT_ARRAY_BUFFER),(G||a)&&(a=!1,b(v,R,k,F),P!==null&&r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,e.get(P).buffer))}function c(){return r.createVertexArray()}function l(v){return r.bindVertexArray(v)}function u(v){return r.deleteVertexArray(v)}function h(v,R,k){const F=k.wireframe===!0;let P=n[v.id];P===void 0&&(P={},n[v.id]=P);let G=P[R.id];G===void 0&&(G={},P[R.id]=G);let O=G[F];return O===void 0&&(O=d(c()),G[F]=O),O}function d(v){const R=[],k=[],F=[];for(let P=0;P<t;P++)R[P]=0,k[P]=0,F[P]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:R,enabledAttributes:k,attributeDivisors:F,object:v,attributes:{},index:null}}function f(v,R,k,F){const P=s.attributes,G=R.attributes;let O=0;const W=k.getAttributes();for(const Q in W)if(W[Q].location>=0){const ne=P[Q];let re=G[Q];if(re===void 0&&(Q==="instanceMatrix"&&v.instanceMatrix&&(re=v.instanceMatrix),Q==="instanceColor"&&v.instanceColor&&(re=v.instanceColor)),ne===void 0||ne.attribute!==re||re&&ne.data!==re.data)return!0;O++}return s.attributesNum!==O||s.index!==F}function p(v,R,k,F){const P={},G=R.attributes;let O=0;const W=k.getAttributes();for(const Q in W)if(W[Q].location>=0){let ne=G[Q];ne===void 0&&(Q==="instanceMatrix"&&v.instanceMatrix&&(ne=v.instanceMatrix),Q==="instanceColor"&&v.instanceColor&&(ne=v.instanceColor));const re={};re.attribute=ne,ne&&ne.data&&(re.data=ne.data),P[Q]=re,O++}s.attributes=P,s.attributesNum=O,s.index=F}function g(){const v=s.newAttributes;for(let R=0,k=v.length;R<k;R++)v[R]=0}function m(v){A(v,0)}function A(v,R){const k=s.newAttributes,F=s.enabledAttributes,P=s.attributeDivisors;k[v]=1,F[v]===0&&(r.enableVertexAttribArray(v),F[v]=1),P[v]!==R&&(r.vertexAttribDivisor(v,R),P[v]=R)}function E(){const v=s.newAttributes,R=s.enabledAttributes;for(let k=0,F=R.length;k<F;k++)R[k]!==v[k]&&(r.disableVertexAttribArray(k),R[k]=0)}function _(v,R,k,F,P,G,O){O===!0?r.vertexAttribIPointer(v,R,k,P,G):r.vertexAttribPointer(v,R,k,F,P,G)}function b(v,R,k,F){g();const P=F.attributes,G=k.getAttributes(),O=R.defaultAttributeValues;for(const W in G){const Q=G[W];if(Q.location>=0){let Y=P[W];if(Y===void 0&&(W==="instanceMatrix"&&v.instanceMatrix&&(Y=v.instanceMatrix),W==="instanceColor"&&v.instanceColor&&(Y=v.instanceColor)),Y!==void 0){const ne=Y.normalized,re=Y.itemSize,de=e.get(Y);if(de===void 0)continue;const Ce=de.buffer,q=de.type,Z=de.bytesPerElement,ge=q===r.INT||q===r.UNSIGNED_INT||Y.gpuType===el;if(Y.isInterleavedBufferAttribute){const le=Y.data,ve=le.stride,Ze=Y.offset;if(le.isInstancedInterleavedBuffer){for(let Re=0;Re<Q.locationSize;Re++)A(Q.location+Re,le.meshPerAttribute);v.isInstancedMesh!==!0&&F._maxInstanceCount===void 0&&(F._maxInstanceCount=le.meshPerAttribute*le.count)}else for(let Re=0;Re<Q.locationSize;Re++)m(Q.location+Re);r.bindBuffer(r.ARRAY_BUFFER,Ce);for(let Re=0;Re<Q.locationSize;Re++)_(Q.location+Re,re/Q.locationSize,q,ne,ve*Z,(Ze+re/Q.locationSize*Re)*Z,ge)}else{if(Y.isInstancedBufferAttribute){for(let le=0;le<Q.locationSize;le++)A(Q.location+le,Y.meshPerAttribute);v.isInstancedMesh!==!0&&F._maxInstanceCount===void 0&&(F._maxInstanceCount=Y.meshPerAttribute*Y.count)}else for(let le=0;le<Q.locationSize;le++)m(Q.location+le);r.bindBuffer(r.ARRAY_BUFFER,Ce);for(let le=0;le<Q.locationSize;le++)_(Q.location+le,re/Q.locationSize,q,ne,re*Z,re/Q.locationSize*le*Z,ge)}}else if(O!==void 0){const ne=O[W];if(ne!==void 0)switch(ne.length){case 2:r.vertexAttrib2fv(Q.location,ne);break;case 3:r.vertexAttrib3fv(Q.location,ne);break;case 4:r.vertexAttrib4fv(Q.location,ne);break;default:r.vertexAttrib1fv(Q.location,ne)}}}}E()}function S(){w();for(const v in n){const R=n[v];for(const k in R){const F=R[k];for(const P in F)u(F[P].object),delete F[P];delete R[k]}delete n[v]}}function I(v){if(n[v.id]===void 0)return;const R=n[v.id];for(const k in R){const F=R[k];for(const P in F)u(F[P].object),delete F[P];delete R[k]}delete n[v.id]}function M(v){for(const R in n){const k=n[R];if(k[v.id]===void 0)continue;const F=k[v.id];for(const P in F)u(F[P].object),delete F[P];delete k[v.id]}}function w(){x(),a=!0,s!==i&&(s=i,l(s.object))}function x(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:o,reset:w,resetDefaultState:x,dispose:S,releaseStatesOfGeometry:I,releaseStatesOfProgram:M,initAttributes:g,enableAttribute:m,disableUnusedAttributes:E}}function ky(r,e,t){let n;function i(l){n=l}function s(l,u){r.drawArrays(n,l,u),t.update(u,n,1)}function a(l,u,h){h!==0&&(r.drawArraysInstanced(n,l,u,h),t.update(u,n,h))}function o(l,u,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,u,0,h);let f=0;for(let p=0;p<h;p++)f+=u[p];t.update(f,n,1)}function c(l,u,h,d){if(h===0)return;const f=e.get("WEBGL_multi_draw");if(f===null)for(let p=0;p<l.length;p++)a(l[p],u[p],d[p]);else{f.multiDrawArraysInstancedWEBGL(n,l,0,u,0,d,0,h);let p=0;for(let g=0;g<h;g++)p+=u[g]*d[g];t.update(p,n,1)}}this.setMode=i,this.render=s,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=c}function Qy(r,e,t,n){let i;function s(){if(i!==void 0)return i;if(e.has("EXT_texture_filter_anisotropic")===!0){const M=e.get("EXT_texture_filter_anisotropic");i=r.getParameter(M.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function a(M){return!(M!==yt&&n.convert(M)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(M){const w=M===Ut&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(M!==Mt&&n.convert(M)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_TYPE)&&M!==Lt&&!w)}function c(M){if(M==="highp"){if(r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.HIGH_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.HIGH_FLOAT).precision>0)return"highp";M="mediump"}return M==="mediump"&&r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.MEDIUM_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=t.precision!==void 0?t.precision:"highp";const u=c(l);u!==l&&(console.warn("THREE.WebGLRenderer:",l,"not supported, using",u,"instead."),l=u);const h=t.logarithmicDepthBuffer===!0,d=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),f=r.getParameter(r.MAX_TEXTURE_IMAGE_UNITS),p=r.getParameter(r.MAX_VERTEX_TEXTURE_IMAGE_UNITS),g=r.getParameter(r.MAX_TEXTURE_SIZE),m=r.getParameter(r.MAX_CUBE_MAP_TEXTURE_SIZE),A=r.getParameter(r.MAX_VERTEX_ATTRIBS),E=r.getParameter(r.MAX_VERTEX_UNIFORM_VECTORS),_=r.getParameter(r.MAX_VARYING_VECTORS),b=r.getParameter(r.MAX_FRAGMENT_UNIFORM_VECTORS),S=p>0,I=r.getParameter(r.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:c,textureFormatReadable:a,textureTypeReadable:o,precision:l,logarithmicDepthBuffer:h,reverseDepthBuffer:d,maxTextures:f,maxVertexTextures:p,maxTextureSize:g,maxCubemapSize:m,maxAttributes:A,maxVertexUniforms:E,maxVaryings:_,maxFragmentUniforms:b,vertexTextures:S,maxSamples:I}}function Gy(r){const e=this;let t=null,n=0,i=!1,s=!1;const a=new gs,o=new Qe,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(h,d){const f=h.length!==0||d||n!==0||i;return i=d,n=h.length,f},this.beginShadows=function(){s=!0,u(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(h,d){t=u(h,d,0)},this.setState=function(h,d,f){const p=h.clippingPlanes,g=h.clipIntersection,m=h.clipShadows,A=r.get(h);if(!i||p===null||p.length===0||s&&!m)s?u(null):l();else{const E=s?0:n,_=E*4;let b=A.clippingState||null;c.value=b,b=u(p,d,_,f);for(let S=0;S!==_;++S)b[S]=t[S];A.clippingState=b,this.numIntersection=g?this.numPlanes:0,this.numPlanes+=E}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(h,d,f,p){const g=h!==null?h.length:0;let m=null;if(g!==0){if(m=c.value,p!==!0||m===null){const A=f+g*4,E=d.matrixWorldInverse;o.getNormalMatrix(E),(m===null||m.length<A)&&(m=new Float32Array(A));for(let _=0,b=f;_!==g;++_,b+=4)a.copy(h[_]).applyMatrix4(E,o),a.normal.toArray(m,b),m[b+3]=a.constant}c.value=m,c.needsUpdate=!0}return e.numPlanes=g,e.numIntersection=0,m}}function Hy(r){let e=new WeakMap;function t(a,o){return o===Rc?a.mapping=Ps:o===Eu&&(a.mapping=Qr),a}function n(a){if(a&&a.isTexture){const o=a.mapping;if(o===Rc||o===Eu)if(e.has(a)){const c=e.get(a).texture;return t(c,a.mapping)}else{const c=a.image;if(c&&c.height>0){const l=new vd(c.height);return l.fromEquirectangularTexture(r,a),e.set(a,l),a.addEventListener("dispose",i),t(l.texture,a.mapping)}else return null}}return a}function i(a){const o=a.target;o.removeEventListener("dispose",i);const c=e.get(o);c!==void 0&&(e.delete(o),c.dispose())}function s(){e=new WeakMap}return{get:n,dispose:s}}const Cr=4,Hf=[.125,.215,.35,.446,.526,.582],Is=20,Ql=new Zr,zf=new Me;let Gl=null,Hl=0,zl=0,Vl=!1;const bs=(1+Math.sqrt(5))/2,sr=1/bs,Vf=[new B(-bs,sr,0),new B(bs,sr,0),new B(-sr,0,bs),new B(sr,0,bs),new B(0,bs,-sr),new B(0,bs,sr),new B(-1,1,-1),new B(1,1,-1),new B(-1,1,1),new B(1,1,1)],zy=new B;class Wf{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,i=100,s={}){const{size:a=256,position:o=zy}=s;Gl=this._renderer.getRenderTarget(),Hl=this._renderer.getActiveCubeFace(),zl=this._renderer.getActiveMipmapLevel(),Vl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);const c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(e,n,i,c,o),t>0&&this._blur(c,0,0,t),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=$f(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Xf(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Gl,Hl,zl),this._renderer.xr.enabled=Vl,e.scissorTest=!1,zo(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Ps||e.mapping===Qr?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Gl=this._renderer.getRenderTarget(),Hl=this._renderer.getActiveCubeFace(),zl=this._renderer.getActiveMipmapLevel(),Vl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Ke,minFilter:Ke,generateMipmaps:!1,type:Ut,format:yt,colorSpace:bt,depthBuffer:!1},i=qf(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=qf(e,t,n);const{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Vy(s)),this._blurMaterial=Wy(s,e,t)}return i}_compileMaterial(e){const t=new ut(this._lodPlanes[0],e);this._renderer.compile(t,Ql)}_sceneToCubeUV(e,t,n,i,s){const c=new Xt(90,1,t,n),l=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],h=this._renderer,d=h.autoClear,f=h.toneMapping;h.getClearColor(zf),h.toneMapping=si,h.autoClear=!1;const p=new Ln({name:"PMREM.Background",side:$t,depthWrite:!1,depthTest:!1}),g=new ut(new Di,p);let m=!1;const A=e.background;A?A.isColor&&(p.color.copy(A),e.background=null,m=!0):(p.color.copy(zf),m=!0);for(let E=0;E<6;E++){const _=E%3;_===0?(c.up.set(0,l[E],0),c.position.set(s.x,s.y,s.z),c.lookAt(s.x+u[E],s.y,s.z)):_===1?(c.up.set(0,0,l[E]),c.position.set(s.x,s.y,s.z),c.lookAt(s.x,s.y+u[E],s.z)):(c.up.set(0,l[E],0),c.position.set(s.x,s.y,s.z),c.lookAt(s.x,s.y,s.z+u[E]));const b=this._cubeSize;zo(i,_*b,E>2?b:0,b,b),h.setRenderTarget(i),m&&h.render(g,c),h.render(e,c)}g.geometry.dispose(),g.material.dispose(),h.toneMapping=f,h.autoClear=d,e.background=A}_textureToCubeUV(e,t){const n=this._renderer,i=e.mapping===Ps||e.mapping===Qr;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=$f()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Xf());const s=i?this._cubemapMaterial:this._equirectMaterial,a=new ut(this._lodPlanes[0],s),o=s.uniforms;o.envMap.value=e;const c=this._cubeSize;zo(t,0,0,3*c,2*c),n.setRenderTarget(t),n.render(a,Ql)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const i=this._lodPlanes.length;for(let s=1;s<i;s++){const a=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),o=Vf[(i-s-1)%Vf.length];this._blur(e,s-1,s,a,o)}t.autoClear=n}_blur(e,t,n,i,s){const a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,i,"latitudinal",s),this._halfBlur(a,e,n,n,i,"longitudinal",s)}_halfBlur(e,t,n,i,s,a,o){const c=this._renderer,l=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const u=3,h=new ut(this._lodPlanes[i],l),d=l.uniforms,f=this._sizeLods[n]-1,p=isFinite(s)?Math.PI/(2*f):2*Math.PI/(2*Is-1),g=s/p,m=isFinite(s)?1+Math.floor(u*g):Is;m>Is&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Is}`);const A=[];let E=0;for(let M=0;M<Is;++M){const w=M/g,x=Math.exp(-w*w/2);A.push(x),M===0?E+=x:M<m&&(E+=2*x)}for(let M=0;M<A.length;M++)A[M]=A[M]/E;d.envMap.value=e.texture,d.samples.value=m,d.weights.value=A,d.latitudinal.value=a==="latitudinal",o&&(d.poleAxis.value=o);const{_lodMax:_}=this;d.dTheta.value=p,d.mipInt.value=_-n;const b=this._sizeLods[i],S=3*b*(i>_-Cr?i-_+Cr:0),I=4*(this._cubeSize-b);zo(t,S,I,3*b,2*b),c.setRenderTarget(t),c.render(h,Ql)}}function Vy(r){const e=[],t=[],n=[];let i=r;const s=r-Cr+1+Hf.length;for(let a=0;a<s;a++){const o=Math.pow(2,i);t.push(o);let c=1/o;a>r-Cr?c=Hf[a-r+Cr-1]:a===0&&(c=0),n.push(c);const l=1/(o-2),u=-l,h=1+l,d=[u,u,h,u,h,h,u,u,h,h,u,h],f=6,p=6,g=3,m=2,A=1,E=new Float32Array(g*p*f),_=new Float32Array(m*p*f),b=new Float32Array(A*p*f);for(let I=0;I<f;I++){const M=I%3*2/3-1,w=I>2?0:-1,x=[M,w,0,M+2/3,w,0,M+2/3,w+1,0,M,w,0,M+2/3,w+1,0,M,w+1,0];E.set(x,g*p*I),_.set(d,m*p*I);const v=[I,I,I,I,I,I];b.set(v,A*p*I)}const S=new An;S.setAttribute("position",new Ct(E,g)),S.setAttribute("uv",new Ct(_,m)),S.setAttribute("faceIndex",new Ct(b,A)),e.push(S),i>Cr&&i--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function qf(r,e,t){const n=new Fn(r,e,t);return n.texture.mapping=Zc,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function zo(r,e,t,n,i){r.viewport.set(e,t,n,i),r.scissor.set(e,t,n,i)}function Wy(r,e,t){const n=new Float32Array(Is),i=new B(0,1,0);return new Cn({name:"SphericalGaussianBlur",defines:{n:Is,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${r}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:Td(),fragmentShader:`

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
		`,blending:ii,depthTest:!1,depthWrite:!1})}function Xf(){return new Cn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Td(),fragmentShader:`

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
		`,blending:ii,depthTest:!1,depthWrite:!1})}function $f(){return new Cn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Td(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:ii,depthTest:!1,depthWrite:!1})}function Td(){return`

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
	`}function qy(r){let e=new WeakMap,t=null;function n(o){if(o&&o.isTexture){const c=o.mapping,l=c===Rc||c===Eu,u=c===Ps||c===Qr;if(l||u){let h=e.get(o);const d=h!==void 0?h.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==d)return t===null&&(t=new Wf(r)),h=l?t.fromEquirectangular(o,h):t.fromCubemap(o,h),h.texture.pmremVersion=o.pmremVersion,e.set(o,h),h.texture;if(h!==void 0)return h.texture;{const f=o.image;return l&&f&&f.height>0||u&&f&&i(f)?(t===null&&(t=new Wf(r)),h=l?t.fromEquirectangular(o):t.fromCubemap(o),h.texture.pmremVersion=o.pmremVersion,e.set(o,h),o.addEventListener("dispose",s),h.texture):null}}}return o}function i(o){let c=0;const l=6;for(let u=0;u<l;u++)o[u]!==void 0&&c++;return c===l}function s(o){const c=o.target;c.removeEventListener("dispose",s);const l=e.get(c);l!==void 0&&(e.delete(c),l.dispose())}function a(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:a}}function Xy(r){const e={};function t(n){if(e[n]!==void 0)return e[n];let i;switch(n){case"WEBGL_depth_texture":i=r.getExtension("WEBGL_depth_texture")||r.getExtension("MOZ_WEBGL_depth_texture")||r.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":i=r.getExtension("EXT_texture_filter_anisotropic")||r.getExtension("MOZ_EXT_texture_filter_anisotropic")||r.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":i=r.getExtension("WEBGL_compressed_texture_s3tc")||r.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":i=r.getExtension("WEBGL_compressed_texture_pvrtc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:i=r.getExtension(n)}return e[n]=i,i}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const i=t(n);return i===null&&Lr("THREE.WebGLRenderer: "+n+" extension not supported."),i}}}function $y(r,e,t,n){const i={},s=new WeakMap;function a(h){const d=h.target;d.index!==null&&e.remove(d.index);for(const p in d.attributes)e.remove(d.attributes[p]);d.removeEventListener("dispose",a),delete i[d.id];const f=s.get(d);f&&(e.remove(f),s.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function o(h,d){return i[d.id]===!0||(d.addEventListener("dispose",a),i[d.id]=!0,t.memory.geometries++),d}function c(h){const d=h.attributes;for(const f in d)e.update(d[f],r.ARRAY_BUFFER)}function l(h){const d=[],f=h.index,p=h.attributes.position;let g=0;if(f!==null){const E=f.array;g=f.version;for(let _=0,b=E.length;_<b;_+=3){const S=E[_+0],I=E[_+1],M=E[_+2];d.push(S,I,I,M,M,S)}}else if(p!==void 0){const E=p.array;g=p.version;for(let _=0,b=E.length/3-1;_<b;_+=3){const S=_+0,I=_+1,M=_+2;d.push(S,I,I,M,M,S)}}else return;const m=new(Eg(d)?Ig:Cg)(d,1);m.version=g;const A=s.get(h);A&&e.remove(A),s.set(h,m)}function u(h){const d=s.get(h);if(d){const f=h.index;f!==null&&d.version<f.version&&l(h)}else l(h);return s.get(h)}return{get:o,update:c,getWireframeAttribute:u}}function jy(r,e,t){let n;function i(d){n=d}let s,a;function o(d){s=d.type,a=d.bytesPerElement}function c(d,f){r.drawElements(n,f,s,d*a),t.update(f,n,1)}function l(d,f,p){p!==0&&(r.drawElementsInstanced(n,f,s,d*a,p),t.update(f,n,p))}function u(d,f,p){if(p===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,f,0,s,d,0,p);let m=0;for(let A=0;A<p;A++)m+=f[A];t.update(m,n,1)}function h(d,f,p,g){if(p===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let A=0;A<d.length;A++)l(d[A]/a,f[A],g[A]);else{m.multiDrawElementsInstancedWEBGL(n,f,0,s,d,0,g,0,p);let A=0;for(let E=0;E<p;E++)A+=f[E]*g[E];t.update(A,n,1)}}this.setMode=i,this.setIndex=o,this.render=c,this.renderInstances=l,this.renderMultiDraw=u,this.renderMultiDrawInstances=h}function Yy(r){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(s,a,o){switch(t.calls++,a){case r.TRIANGLES:t.triangles+=o*(s/3);break;case r.LINES:t.lines+=o*(s/2);break;case r.LINE_STRIP:t.lines+=o*(s-1);break;case r.LINE_LOOP:t.lines+=o*s;break;case r.POINTS:t.points+=o*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function i(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:i,update:n}}function Ky(r,e,t){const n=new WeakMap,i=new it;function s(a,o,c){const l=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,h=u!==void 0?u.length:0;let d=n.get(o);if(d===void 0||d.count!==h){let x=function(){M.dispose(),n.delete(o),o.removeEventListener("dispose",x)};d!==void 0&&d.texture.dispose();const f=o.morphAttributes.position!==void 0,p=o.morphAttributes.normal!==void 0,g=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],A=o.morphAttributes.normal||[],E=o.morphAttributes.color||[];let _=0;f===!0&&(_=1),p===!0&&(_=2),g===!0&&(_=3);let b=o.attributes.position.count*_,S=1;b>e.maxTextureSize&&(S=Math.ceil(b/e.maxTextureSize),b=e.maxTextureSize);const I=new Float32Array(b*S*4*h),M=new xg(I,b,S,h);M.type=Lt,M.needsUpdate=!0;const w=_*4;for(let v=0;v<h;v++){const R=m[v],k=A[v],F=E[v],P=b*S*4*v;for(let G=0;G<R.count;G++){const O=G*w;f===!0&&(i.fromBufferAttribute(R,G),I[P+O+0]=i.x,I[P+O+1]=i.y,I[P+O+2]=i.z,I[P+O+3]=0),p===!0&&(i.fromBufferAttribute(k,G),I[P+O+4]=i.x,I[P+O+5]=i.y,I[P+O+6]=i.z,I[P+O+7]=0),g===!0&&(i.fromBufferAttribute(F,G),I[P+O+8]=i.x,I[P+O+9]=i.y,I[P+O+10]=i.z,I[P+O+11]=F.itemSize===4?i.w:1)}}d={count:h,texture:M,size:new Oe(b,S)},n.set(o,d),o.addEventListener("dispose",x)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)c.getUniforms().setValue(r,"morphTexture",a.morphTexture,t);else{let f=0;for(let g=0;g<l.length;g++)f+=l[g];const p=o.morphTargetsRelative?1:1-f;c.getUniforms().setValue(r,"morphTargetBaseInfluence",p),c.getUniforms().setValue(r,"morphTargetInfluences",l)}c.getUniforms().setValue(r,"morphTargetsTexture",d.texture,t),c.getUniforms().setValue(r,"morphTargetsTextureSize",d.size)}return{update:s}}function Jy(r,e,t,n){let i=new WeakMap;function s(c){const l=n.render.frame,u=c.geometry,h=e.get(c,u);if(i.get(h)!==l&&(e.update(h),i.set(h,l)),c.isInstancedMesh&&(c.hasEventListener("dispose",o)===!1&&c.addEventListener("dispose",o),i.get(c)!==l&&(t.update(c.instanceMatrix,r.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,r.ARRAY_BUFFER),i.set(c,l))),c.isSkinnedMesh){const d=c.skeleton;i.get(d)!==l&&(d.update(),i.set(d,l))}return h}function a(){i=new WeakMap}function o(c){const l=c.target;l.removeEventListener("dispose",o),t.remove(l.instanceMatrix),l.instanceColor!==null&&t.remove(l.instanceColor)}return{update:s,dispose:a}}const zg=new St,jf=new Lg(1,1),Vg=new xg,Wg=new yg,qg=new Tg,Yf=[],Kf=[],Jf=new Float32Array(16),Zf=new Float32Array(9),ep=new Float32Array(4);function ea(r,e,t){const n=r[0];if(n<=0||n>0)return r;const i=e*t;let s=Yf[i];if(s===void 0&&(s=new Float32Array(i),Yf[i]=s),e!==0){n.toArray(s,0);for(let a=1,o=0;a!==e;++a)o+=t,r[a].toArray(s,o)}return s}function kt(r,e){if(r.length!==e.length)return!1;for(let t=0,n=r.length;t<n;t++)if(r[t]!==e[t])return!1;return!0}function Qt(r,e){for(let t=0,n=e.length;t<n;t++)r[t]=e[t]}function il(r,e){let t=Kf[e];t===void 0&&(t=new Int32Array(e),Kf[e]=t);for(let n=0;n!==e;++n)t[n]=r.allocateTextureUnit();return t}function Zy(r,e){const t=this.cache;t[0]!==e&&(r.uniform1f(this.addr,e),t[0]=e)}function eS(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(kt(t,e))return;r.uniform2fv(this.addr,e),Qt(t,e)}}function tS(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(r.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(kt(t,e))return;r.uniform3fv(this.addr,e),Qt(t,e)}}function nS(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(kt(t,e))return;r.uniform4fv(this.addr,e),Qt(t,e)}}function iS(r,e){const t=this.cache,n=e.elements;if(n===void 0){if(kt(t,e))return;r.uniformMatrix2fv(this.addr,!1,e),Qt(t,e)}else{if(kt(t,n))return;ep.set(n),r.uniformMatrix2fv(this.addr,!1,ep),Qt(t,n)}}function sS(r,e){const t=this.cache,n=e.elements;if(n===void 0){if(kt(t,e))return;r.uniformMatrix3fv(this.addr,!1,e),Qt(t,e)}else{if(kt(t,n))return;Zf.set(n),r.uniformMatrix3fv(this.addr,!1,Zf),Qt(t,n)}}function rS(r,e){const t=this.cache,n=e.elements;if(n===void 0){if(kt(t,e))return;r.uniformMatrix4fv(this.addr,!1,e),Qt(t,e)}else{if(kt(t,n))return;Jf.set(n),r.uniformMatrix4fv(this.addr,!1,Jf),Qt(t,n)}}function aS(r,e){const t=this.cache;t[0]!==e&&(r.uniform1i(this.addr,e),t[0]=e)}function oS(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(kt(t,e))return;r.uniform2iv(this.addr,e),Qt(t,e)}}function cS(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(kt(t,e))return;r.uniform3iv(this.addr,e),Qt(t,e)}}function lS(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(kt(t,e))return;r.uniform4iv(this.addr,e),Qt(t,e)}}function hS(r,e){const t=this.cache;t[0]!==e&&(r.uniform1ui(this.addr,e),t[0]=e)}function uS(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(kt(t,e))return;r.uniform2uiv(this.addr,e),Qt(t,e)}}function dS(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(kt(t,e))return;r.uniform3uiv(this.addr,e),Qt(t,e)}}function fS(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(kt(t,e))return;r.uniform4uiv(this.addr,e),Qt(t,e)}}function pS(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i);let s;this.type===r.SAMPLER_2D_SHADOW?(jf.compareFunction=_g,s=jf):s=zg,t.setTexture2D(e||s,i)}function AS(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTexture3D(e||Wg,i)}function mS(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTextureCube(e||qg,i)}function gS(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTexture2DArray(e||Vg,i)}function bS(r){switch(r){case 5126:return Zy;case 35664:return eS;case 35665:return tS;case 35666:return nS;case 35674:return iS;case 35675:return sS;case 35676:return rS;case 5124:case 35670:return aS;case 35667:case 35671:return oS;case 35668:case 35672:return cS;case 35669:case 35673:return lS;case 5125:return hS;case 36294:return uS;case 36295:return dS;case 36296:return fS;case 35678:case 36198:case 36298:case 36306:case 35682:return pS;case 35679:case 36299:case 36307:return AS;case 35680:case 36300:case 36308:case 36293:return mS;case 36289:case 36303:case 36311:case 36292:return gS}}function _S(r,e){r.uniform1fv(this.addr,e)}function ES(r,e){const t=ea(e,this.size,2);r.uniform2fv(this.addr,t)}function vS(r,e){const t=ea(e,this.size,3);r.uniform3fv(this.addr,t)}function xS(r,e){const t=ea(e,this.size,4);r.uniform4fv(this.addr,t)}function yS(r,e){const t=ea(e,this.size,4);r.uniformMatrix2fv(this.addr,!1,t)}function SS(r,e){const t=ea(e,this.size,9);r.uniformMatrix3fv(this.addr,!1,t)}function CS(r,e){const t=ea(e,this.size,16);r.uniformMatrix4fv(this.addr,!1,t)}function IS(r,e){r.uniform1iv(this.addr,e)}function MS(r,e){r.uniform2iv(this.addr,e)}function wS(r,e){r.uniform3iv(this.addr,e)}function TS(r,e){r.uniform4iv(this.addr,e)}function RS(r,e){r.uniform1uiv(this.addr,e)}function BS(r,e){r.uniform2uiv(this.addr,e)}function DS(r,e){r.uniform3uiv(this.addr,e)}function LS(r,e){r.uniform4uiv(this.addr,e)}function FS(r,e,t){const n=this.cache,i=e.length,s=il(t,i);kt(n,s)||(r.uniform1iv(this.addr,s),Qt(n,s));for(let a=0;a!==i;++a)t.setTexture2D(e[a]||zg,s[a])}function PS(r,e,t){const n=this.cache,i=e.length,s=il(t,i);kt(n,s)||(r.uniform1iv(this.addr,s),Qt(n,s));for(let a=0;a!==i;++a)t.setTexture3D(e[a]||Wg,s[a])}function US(r,e,t){const n=this.cache,i=e.length,s=il(t,i);kt(n,s)||(r.uniform1iv(this.addr,s),Qt(n,s));for(let a=0;a!==i;++a)t.setTextureCube(e[a]||qg,s[a])}function NS(r,e,t){const n=this.cache,i=e.length,s=il(t,i);kt(n,s)||(r.uniform1iv(this.addr,s),Qt(n,s));for(let a=0;a!==i;++a)t.setTexture2DArray(e[a]||Vg,s[a])}function OS(r){switch(r){case 5126:return _S;case 35664:return ES;case 35665:return vS;case 35666:return xS;case 35674:return yS;case 35675:return SS;case 35676:return CS;case 5124:case 35670:return IS;case 35667:case 35671:return MS;case 35668:case 35672:return wS;case 35669:case 35673:return TS;case 5125:return RS;case 36294:return BS;case 36295:return DS;case 36296:return LS;case 35678:case 36198:case 36298:case 36306:case 35682:return FS;case 35679:case 36299:case 36307:return PS;case 35680:case 36300:case 36308:case 36293:return US;case 36289:case 36303:case 36311:case 36292:return NS}}class kS{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=bS(t.type)}}class QS{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=OS(t.type)}}class GS{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const i=this.seq;for(let s=0,a=i.length;s!==a;++s){const o=i[s];o.setValue(e,t[o.id],n)}}}const Wl=/(\w+)(\])?(\[|\.)?/g;function tp(r,e){r.seq.push(e),r.map[e.id]=e}function HS(r,e,t){const n=r.name,i=n.length;for(Wl.lastIndex=0;;){const s=Wl.exec(n),a=Wl.lastIndex;let o=s[1];const c=s[2]==="]",l=s[3];if(c&&(o=o|0),l===void 0||l==="["&&a+2===i){tp(t,l===void 0?new kS(o,r,e):new QS(o,r,e));break}else{let h=t.map[o];h===void 0&&(h=new GS(o),tp(t,h)),t=h}}}class vc{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let i=0;i<n;++i){const s=e.getActiveUniform(t,i),a=e.getUniformLocation(t,s.name);HS(s,a,this)}}setValue(e,t,n,i){const s=this.map[t];s!==void 0&&s.setValue(e,n,i)}setOptional(e,t,n){const i=t[n];i!==void 0&&this.setValue(e,n,i)}static upload(e,t,n,i){for(let s=0,a=t.length;s!==a;++s){const o=t[s],c=n[o.id];c.needsUpdate!==!1&&o.setValue(e,c.value,i)}}static seqWithValue(e,t){const n=[];for(let i=0,s=e.length;i!==s;++i){const a=e[i];a.id in t&&n.push(a)}return n}}function np(r,e,t){const n=r.createShader(e);return r.shaderSource(n,t),r.compileShader(n),n}const zS=37297;let VS=0;function WS(r,e){const t=r.split(`
`),n=[],i=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let a=i;a<s;a++){const o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}const ip=new Qe;function qS(r){Ye._getMatrix(ip,Ye.workingColorSpace,r);const e=`mat3( ${ip.elements.map(t=>t.toFixed(4))} )`;switch(Ye.getTransfer(r)){case Nc:return[e,"LinearTransferOETF"];case ht:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",r),[e,"LinearTransferOETF"]}}function sp(r,e,t){const n=r.getShaderParameter(e,r.COMPILE_STATUS),i=r.getShaderInfoLog(e).trim();if(n&&i==="")return"";const s=/ERROR: 0:(\d+)/.exec(i);if(s){const a=parseInt(s[1]);return t.toUpperCase()+`

`+i+`

`+WS(r.getShaderSource(e),a)}else return i}function XS(r,e){const t=qS(e);return[`vec4 ${r}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function $S(r,e){let t;switch(e){case cg:t="Linear";break;case lg:t="Reinhard";break;case hg:t="Cineon";break;case ug:t="ACESFilmic";break;case dg:t="AgX";break;case qa:t="Neutral";break;case n_:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+r+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Vo=new B;function jS(){Ye.getLuminanceCoefficients(Vo);const r=Vo.x.toFixed(4),e=Vo.y.toFixed(4),t=Vo.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${r}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function YS(r){return[r.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",r.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ba).join(`
`)}function KS(r){const e=[];for(const t in r){const n=r[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function JS(r,e){const t={},n=r.getProgramParameter(e,r.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){const s=r.getActiveAttrib(e,i),a=s.name;let o=1;s.type===r.FLOAT_MAT2&&(o=2),s.type===r.FLOAT_MAT3&&(o=3),s.type===r.FLOAT_MAT4&&(o=4),t[a]={type:s.type,location:r.getAttribLocation(e,a),locationSize:o}}return t}function Ba(r){return r!==""}function rp(r,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return r.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function ap(r,e){return r.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const ZS=/^[ \t]*#include +<([\w\d./]+)>/gm;function qu(r){return r.replace(ZS,tC)}const eC=new Map;function tC(r,e){let t=ze[e];if(t===void 0){const n=eC.get(e);if(n!==void 0)t=ze[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return qu(t)}const nC=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function op(r){return r.replace(nC,iC)}function iC(r,e,t,n){let i="";for(let s=parseInt(e);s<parseInt(t);s++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return i}function cp(r){let e=`precision ${r.precision} float;
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
#define LOW_PRECISION`),e}function sC(r){let e="SHADOWMAP_TYPE_BASIC";return r.shadowMapType===ag?e="SHADOWMAP_TYPE_PCF":r.shadowMapType===Pb?e="SHADOWMAP_TYPE_PCF_SOFT":r.shadowMapType===yi&&(e="SHADOWMAP_TYPE_VSM"),e}function rC(r){let e="ENVMAP_TYPE_CUBE";if(r.envMap)switch(r.envMapMode){case Ps:case Qr:e="ENVMAP_TYPE_CUBE";break;case Zc:e="ENVMAP_TYPE_CUBE_UV";break}return e}function aC(r){let e="ENVMAP_MODE_REFLECTION";if(r.envMap)switch(r.envMapMode){case Qr:e="ENVMAP_MODE_REFRACTION";break}return e}function oC(r){let e="ENVMAP_BLENDING_NONE";if(r.envMap)switch(r.combine){case og:e="ENVMAP_BLENDING_MULTIPLY";break;case e_:e="ENVMAP_BLENDING_MIX";break;case t_:e="ENVMAP_BLENDING_ADD";break}return e}function cC(r){const e=r.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function lC(r,e,t,n){const i=r.getContext(),s=t.defines;let a=t.vertexShader,o=t.fragmentShader;const c=sC(t),l=rC(t),u=aC(t),h=oC(t),d=cC(t),f=YS(t),p=KS(s),g=i.createProgram();let m,A,E=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p].filter(Ba).join(`
`),m.length>0&&(m+=`
`),A=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p].filter(Ba).join(`
`),A.length>0&&(A+=`
`)):(m=[cp(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Ba).join(`
`),A=[cp(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==si?"#define TONE_MAPPING":"",t.toneMapping!==si?ze.tonemapping_pars_fragment:"",t.toneMapping!==si?$S("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",ze.colorspace_pars_fragment,XS("linearToOutputTexel",t.outputColorSpace),jS(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Ba).join(`
`)),a=qu(a),a=rp(a,t),a=ap(a,t),o=qu(o),o=rp(o,t),o=ap(o,t),a=op(a),o=op(o),t.isRawShaderMaterial!==!0&&(E=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,A=["#define varying in",t.glslVersion===tf?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===tf?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+A);const _=E+m+a,b=E+A+o,S=np(i,i.VERTEX_SHADER,_),I=np(i,i.FRAGMENT_SHADER,b);i.attachShader(g,S),i.attachShader(g,I),t.index0AttributeName!==void 0?i.bindAttribLocation(g,0,t.index0AttributeName):t.morphTargets===!0&&i.bindAttribLocation(g,0,"position"),i.linkProgram(g);function M(R){if(r.debug.checkShaderErrors){const k=i.getProgramInfoLog(g).trim(),F=i.getShaderInfoLog(S).trim(),P=i.getShaderInfoLog(I).trim();let G=!0,O=!0;if(i.getProgramParameter(g,i.LINK_STATUS)===!1)if(G=!1,typeof r.debug.onShaderError=="function")r.debug.onShaderError(i,g,S,I);else{const W=sp(i,S,"vertex"),Q=sp(i,I,"fragment");console.error("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(g,i.VALIDATE_STATUS)+`

Material Name: `+R.name+`
Material Type: `+R.type+`

Program Info Log: `+k+`
`+W+`
`+Q)}else k!==""?console.warn("THREE.WebGLProgram: Program Info Log:",k):(F===""||P==="")&&(O=!1);O&&(R.diagnostics={runnable:G,programLog:k,vertexShader:{log:F,prefix:m},fragmentShader:{log:P,prefix:A}})}i.deleteShader(S),i.deleteShader(I),w=new vc(i,g),x=JS(i,g)}let w;this.getUniforms=function(){return w===void 0&&M(this),w};let x;this.getAttributes=function(){return x===void 0&&M(this),x};let v=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return v===!1&&(v=i.getProgramParameter(g,zS)),v},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(g),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=VS++,this.cacheKey=e,this.usedTimes=1,this.program=g,this.vertexShader=S,this.fragmentShader=I,this}let hC=0;class uC{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,i=this._getShaderStage(t),s=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(i)===!1&&(a.add(i),i.usedTimes++),a.has(s)===!1&&(a.add(s),s.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new dC(e),t.set(e,n)),n}}class dC{constructor(e){this.id=hC++,this.code=e,this.usedTimes=0}}function fC(r,e,t,n,i,s,a){const o=new Ed,c=new uC,l=new Set,u=[],h=i.logarithmicDepthBuffer,d=i.vertexTextures;let f=i.precision;const p={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(x){return l.add(x),x===0?"uv":`uv${x}`}function m(x,v,R,k,F){const P=k.fog,G=F.geometry,O=x.isMeshStandardMaterial?k.environment:null,W=(x.isMeshStandardMaterial?t:e).get(x.envMap||O),Q=W&&W.mapping===Zc?W.image.height:null,Y=p[x.type];x.precision!==null&&(f=i.getMaxPrecision(x.precision),f!==x.precision&&console.warn("THREE.WebGLProgram.getParameters:",x.precision,"not supported, using",f,"instead."));const ne=G.morphAttributes.position||G.morphAttributes.normal||G.morphAttributes.color,re=ne!==void 0?ne.length:0;let de=0;G.morphAttributes.position!==void 0&&(de=1),G.morphAttributes.normal!==void 0&&(de=2),G.morphAttributes.color!==void 0&&(de=3);let Ce,q,Z,ge;if(Y){const rt=Zn[Y];Ce=rt.vertexShader,q=rt.fragmentShader}else Ce=x.vertexShader,q=x.fragmentShader,c.update(x),Z=c.getVertexShaderID(x),ge=c.getFragmentShaderID(x);const le=r.getRenderTarget(),ve=r.state.buffers.depth.getReversed(),Ze=F.isInstancedMesh===!0,Re=F.isBatchedMesh===!0,pt=!!x.map,At=!!x.matcap,je=!!W,D=!!x.aoMap,tn=!!x.lightMap,nt=!!x.bumpMap,mt=!!x.normalMap,xe=!!x.displacementMap,et=!!x.emissiveMap,we=!!x.metalnessMap,He=!!x.roughnessMap,Ot=x.anisotropy>0,T=x.clearcoat>0,y=x.dispersion>0,H=x.iridescence>0,$=x.sheen>0,K=x.transmission>0,X=Ot&&!!x.anisotropyMap,ye=T&&!!x.clearcoatMap,ce=T&&!!x.clearcoatNormalMap,Ee=T&&!!x.clearcoatRoughnessMap,Se=H&&!!x.iridescenceMap,J=H&&!!x.iridescenceThicknessMap,fe=$&&!!x.sheenColorMap,Le=$&&!!x.sheenRoughnessMap,Be=!!x.specularMap,ae=!!x.specularColorMap,ke=!!x.specularIntensityMap,L=K&&!!x.transmissionMap,he=K&&!!x.thicknessMap,te=!!x.gradientMap,me=!!x.alphaMap,ie=x.alphaTest>0,j=!!x.alphaHash,be=!!x.extensions;let Ge=si;x.toneMapped&&(le===null||le.isXRRenderTarget===!0)&&(Ge=r.toneMapping);const _t={shaderID:Y,shaderType:x.type,shaderName:x.name,vertexShader:Ce,fragmentShader:q,defines:x.defines,customVertexShaderID:Z,customFragmentShaderID:ge,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:f,batching:Re,batchingColor:Re&&F._colorsTexture!==null,instancing:Ze,instancingColor:Ze&&F.instanceColor!==null,instancingMorph:Ze&&F.morphTexture!==null,supportsVertexTextures:d,outputColorSpace:le===null?r.outputColorSpace:le.isXRRenderTarget===!0?le.texture.colorSpace:bt,alphaToCoverage:!!x.alphaToCoverage,map:pt,matcap:At,envMap:je,envMapMode:je&&W.mapping,envMapCubeUVHeight:Q,aoMap:D,lightMap:tn,bumpMap:nt,normalMap:mt,displacementMap:d&&xe,emissiveMap:et,normalMapObjectSpace:mt&&x.normalMapType===c_,normalMapTangentSpace:mt&&x.normalMapType===bg,metalnessMap:we,roughnessMap:He,anisotropy:Ot,anisotropyMap:X,clearcoat:T,clearcoatMap:ye,clearcoatNormalMap:ce,clearcoatRoughnessMap:Ee,dispersion:y,iridescence:H,iridescenceMap:Se,iridescenceThicknessMap:J,sheen:$,sheenColorMap:fe,sheenRoughnessMap:Le,specularMap:Be,specularColorMap:ae,specularIntensityMap:ke,transmission:K,transmissionMap:L,thicknessMap:he,gradientMap:te,opaque:x.transparent===!1&&x.blending===Tr&&x.alphaToCoverage===!1,alphaMap:me,alphaTest:ie,alphaHash:j,combine:x.combine,mapUv:pt&&g(x.map.channel),aoMapUv:D&&g(x.aoMap.channel),lightMapUv:tn&&g(x.lightMap.channel),bumpMapUv:nt&&g(x.bumpMap.channel),normalMapUv:mt&&g(x.normalMap.channel),displacementMapUv:xe&&g(x.displacementMap.channel),emissiveMapUv:et&&g(x.emissiveMap.channel),metalnessMapUv:we&&g(x.metalnessMap.channel),roughnessMapUv:He&&g(x.roughnessMap.channel),anisotropyMapUv:X&&g(x.anisotropyMap.channel),clearcoatMapUv:ye&&g(x.clearcoatMap.channel),clearcoatNormalMapUv:ce&&g(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Ee&&g(x.clearcoatRoughnessMap.channel),iridescenceMapUv:Se&&g(x.iridescenceMap.channel),iridescenceThicknessMapUv:J&&g(x.iridescenceThicknessMap.channel),sheenColorMapUv:fe&&g(x.sheenColorMap.channel),sheenRoughnessMapUv:Le&&g(x.sheenRoughnessMap.channel),specularMapUv:Be&&g(x.specularMap.channel),specularColorMapUv:ae&&g(x.specularColorMap.channel),specularIntensityMapUv:ke&&g(x.specularIntensityMap.channel),transmissionMapUv:L&&g(x.transmissionMap.channel),thicknessMapUv:he&&g(x.thicknessMap.channel),alphaMapUv:me&&g(x.alphaMap.channel),vertexTangents:!!G.attributes.tangent&&(mt||Ot),vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!G.attributes.color&&G.attributes.color.itemSize===4,pointsUvs:F.isPoints===!0&&!!G.attributes.uv&&(pt||me),fog:!!P,useFog:x.fog===!0,fogExp2:!!P&&P.isFogExp2,flatShading:x.flatShading===!0&&x.wireframe===!1,sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:h,reverseDepthBuffer:ve,skinning:F.isSkinnedMesh===!0,morphTargets:G.morphAttributes.position!==void 0,morphNormals:G.morphAttributes.normal!==void 0,morphColors:G.morphAttributes.color!==void 0,morphTargetsCount:re,morphTextureStride:de,numDirLights:v.directional.length,numPointLights:v.point.length,numSpotLights:v.spot.length,numSpotLightMaps:v.spotLightMap.length,numRectAreaLights:v.rectArea.length,numHemiLights:v.hemi.length,numDirLightShadows:v.directionalShadowMap.length,numPointLightShadows:v.pointShadowMap.length,numSpotLightShadows:v.spotShadowMap.length,numSpotLightShadowsWithMaps:v.numSpotLightShadowsWithMaps,numLightProbes:v.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:x.dithering,shadowMapEnabled:r.shadowMap.enabled&&R.length>0,shadowMapType:r.shadowMap.type,toneMapping:Ge,decodeVideoTexture:pt&&x.map.isVideoTexture===!0&&Ye.getTransfer(x.map.colorSpace)===ht,decodeVideoTextureEmissive:et&&x.emissiveMap.isVideoTexture===!0&&Ye.getTransfer(x.emissiveMap.colorSpace)===ht,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===Vt,flipSided:x.side===$t,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:be&&x.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(be&&x.extensions.multiDraw===!0||Re)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return _t.vertexUv1s=l.has(1),_t.vertexUv2s=l.has(2),_t.vertexUv3s=l.has(3),l.clear(),_t}function A(x){const v=[];if(x.shaderID?v.push(x.shaderID):(v.push(x.customVertexShaderID),v.push(x.customFragmentShaderID)),x.defines!==void 0)for(const R in x.defines)v.push(R),v.push(x.defines[R]);return x.isRawShaderMaterial===!1&&(E(v,x),_(v,x),v.push(r.outputColorSpace)),v.push(x.customProgramCacheKey),v.join()}function E(x,v){x.push(v.precision),x.push(v.outputColorSpace),x.push(v.envMapMode),x.push(v.envMapCubeUVHeight),x.push(v.mapUv),x.push(v.alphaMapUv),x.push(v.lightMapUv),x.push(v.aoMapUv),x.push(v.bumpMapUv),x.push(v.normalMapUv),x.push(v.displacementMapUv),x.push(v.emissiveMapUv),x.push(v.metalnessMapUv),x.push(v.roughnessMapUv),x.push(v.anisotropyMapUv),x.push(v.clearcoatMapUv),x.push(v.clearcoatNormalMapUv),x.push(v.clearcoatRoughnessMapUv),x.push(v.iridescenceMapUv),x.push(v.iridescenceThicknessMapUv),x.push(v.sheenColorMapUv),x.push(v.sheenRoughnessMapUv),x.push(v.specularMapUv),x.push(v.specularColorMapUv),x.push(v.specularIntensityMapUv),x.push(v.transmissionMapUv),x.push(v.thicknessMapUv),x.push(v.combine),x.push(v.fogExp2),x.push(v.sizeAttenuation),x.push(v.morphTargetsCount),x.push(v.morphAttributeCount),x.push(v.numDirLights),x.push(v.numPointLights),x.push(v.numSpotLights),x.push(v.numSpotLightMaps),x.push(v.numHemiLights),x.push(v.numRectAreaLights),x.push(v.numDirLightShadows),x.push(v.numPointLightShadows),x.push(v.numSpotLightShadows),x.push(v.numSpotLightShadowsWithMaps),x.push(v.numLightProbes),x.push(v.shadowMapType),x.push(v.toneMapping),x.push(v.numClippingPlanes),x.push(v.numClipIntersection),x.push(v.depthPacking)}function _(x,v){o.disableAll(),v.supportsVertexTextures&&o.enable(0),v.instancing&&o.enable(1),v.instancingColor&&o.enable(2),v.instancingMorph&&o.enable(3),v.matcap&&o.enable(4),v.envMap&&o.enable(5),v.normalMapObjectSpace&&o.enable(6),v.normalMapTangentSpace&&o.enable(7),v.clearcoat&&o.enable(8),v.iridescence&&o.enable(9),v.alphaTest&&o.enable(10),v.vertexColors&&o.enable(11),v.vertexAlphas&&o.enable(12),v.vertexUv1s&&o.enable(13),v.vertexUv2s&&o.enable(14),v.vertexUv3s&&o.enable(15),v.vertexTangents&&o.enable(16),v.anisotropy&&o.enable(17),v.alphaHash&&o.enable(18),v.batching&&o.enable(19),v.dispersion&&o.enable(20),v.batchingColor&&o.enable(21),v.gradientMap&&o.enable(22),x.push(o.mask),o.disableAll(),v.fog&&o.enable(0),v.useFog&&o.enable(1),v.flatShading&&o.enable(2),v.logarithmicDepthBuffer&&o.enable(3),v.reverseDepthBuffer&&o.enable(4),v.skinning&&o.enable(5),v.morphTargets&&o.enable(6),v.morphNormals&&o.enable(7),v.morphColors&&o.enable(8),v.premultipliedAlpha&&o.enable(9),v.shadowMapEnabled&&o.enable(10),v.doubleSided&&o.enable(11),v.flipSided&&o.enable(12),v.useDepthPacking&&o.enable(13),v.dithering&&o.enable(14),v.transmission&&o.enable(15),v.sheen&&o.enable(16),v.opaque&&o.enable(17),v.pointsUvs&&o.enable(18),v.decodeVideoTexture&&o.enable(19),v.decodeVideoTextureEmissive&&o.enable(20),v.alphaToCoverage&&o.enable(21),x.push(o.mask)}function b(x){const v=p[x.type];let R;if(v){const k=Zn[v];R=tE.clone(k.uniforms)}else R=x.uniforms;return R}function S(x,v){let R;for(let k=0,F=u.length;k<F;k++){const P=u[k];if(P.cacheKey===v){R=P,++R.usedTimes;break}}return R===void 0&&(R=new lC(r,v,x,s),u.push(R)),R}function I(x){if(--x.usedTimes===0){const v=u.indexOf(x);u[v]=u[u.length-1],u.pop(),x.destroy()}}function M(x){c.remove(x)}function w(){c.dispose()}return{getParameters:m,getProgramCacheKey:A,getUniforms:b,acquireProgram:S,releaseProgram:I,releaseShaderCache:M,programs:u,dispose:w}}function pC(){let r=new WeakMap;function e(a){return r.has(a)}function t(a){let o=r.get(a);return o===void 0&&(o={},r.set(a,o)),o}function n(a){r.delete(a)}function i(a,o,c){r.get(a)[o]=c}function s(){r=new WeakMap}return{has:e,get:t,remove:n,update:i,dispose:s}}function AC(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.material.id!==e.material.id?r.material.id-e.material.id:r.z!==e.z?r.z-e.z:r.id-e.id}function lp(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.z!==e.z?e.z-r.z:r.id-e.id}function hp(){const r=[];let e=0;const t=[],n=[],i=[];function s(){e=0,t.length=0,n.length=0,i.length=0}function a(h,d,f,p,g,m){let A=r[e];return A===void 0?(A={id:h.id,object:h,geometry:d,material:f,groupOrder:p,renderOrder:h.renderOrder,z:g,group:m},r[e]=A):(A.id=h.id,A.object=h,A.geometry=d,A.material=f,A.groupOrder=p,A.renderOrder=h.renderOrder,A.z=g,A.group=m),e++,A}function o(h,d,f,p,g,m){const A=a(h,d,f,p,g,m);f.transmission>0?n.push(A):f.transparent===!0?i.push(A):t.push(A)}function c(h,d,f,p,g,m){const A=a(h,d,f,p,g,m);f.transmission>0?n.unshift(A):f.transparent===!0?i.unshift(A):t.unshift(A)}function l(h,d){t.length>1&&t.sort(h||AC),n.length>1&&n.sort(d||lp),i.length>1&&i.sort(d||lp)}function u(){for(let h=e,d=r.length;h<d;h++){const f=r[h];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:n,transparent:i,init:s,push:o,unshift:c,finish:u,sort:l}}function mC(){let r=new WeakMap;function e(n,i){const s=r.get(n);let a;return s===void 0?(a=new hp,r.set(n,[a])):i>=s.length?(a=new hp,s.push(a)):a=s[i],a}function t(){r=new WeakMap}return{get:e,dispose:t}}function gC(){const r={};return{get:function(e){if(r[e.id]!==void 0)return r[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new B,color:new Me};break;case"SpotLight":t={position:new B,direction:new B,color:new Me,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new B,color:new Me,distance:0,decay:0};break;case"HemisphereLight":t={direction:new B,skyColor:new Me,groundColor:new Me};break;case"RectAreaLight":t={color:new Me,position:new B,halfWidth:new B,halfHeight:new B};break}return r[e.id]=t,t}}}function bC(){const r={};return{get:function(e){if(r[e.id]!==void 0)return r[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Oe};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Oe};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Oe,shadowCameraNear:1,shadowCameraFar:1e3};break}return r[e.id]=t,t}}}let _C=0;function EC(r,e){return(e.castShadow?2:0)-(r.castShadow?2:0)+(e.map?1:0)-(r.map?1:0)}function vC(r){const e=new gC,t=bC(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)n.probe.push(new B);const i=new B,s=new Pe,a=new Pe;function o(l){let u=0,h=0,d=0;for(let x=0;x<9;x++)n.probe[x].set(0,0,0);let f=0,p=0,g=0,m=0,A=0,E=0,_=0,b=0,S=0,I=0,M=0;l.sort(EC);for(let x=0,v=l.length;x<v;x++){const R=l[x],k=R.color,F=R.intensity,P=R.distance,G=R.shadow&&R.shadow.map?R.shadow.map.texture:null;if(R.isAmbientLight)u+=k.r*F,h+=k.g*F,d+=k.b*F;else if(R.isLightProbe){for(let O=0;O<9;O++)n.probe[O].addScaledVector(R.sh.coefficients[O],F);M++}else if(R.isDirectionalLight){const O=e.get(R);if(O.color.copy(R.color).multiplyScalar(R.intensity),R.castShadow){const W=R.shadow,Q=t.get(R);Q.shadowIntensity=W.intensity,Q.shadowBias=W.bias,Q.shadowNormalBias=W.normalBias,Q.shadowRadius=W.radius,Q.shadowMapSize=W.mapSize,n.directionalShadow[f]=Q,n.directionalShadowMap[f]=G,n.directionalShadowMatrix[f]=R.shadow.matrix,E++}n.directional[f]=O,f++}else if(R.isSpotLight){const O=e.get(R);O.position.setFromMatrixPosition(R.matrixWorld),O.color.copy(k).multiplyScalar(F),O.distance=P,O.coneCos=Math.cos(R.angle),O.penumbraCos=Math.cos(R.angle*(1-R.penumbra)),O.decay=R.decay,n.spot[g]=O;const W=R.shadow;if(R.map&&(n.spotLightMap[S]=R.map,S++,W.updateMatrices(R),R.castShadow&&I++),n.spotLightMatrix[g]=W.matrix,R.castShadow){const Q=t.get(R);Q.shadowIntensity=W.intensity,Q.shadowBias=W.bias,Q.shadowNormalBias=W.normalBias,Q.shadowRadius=W.radius,Q.shadowMapSize=W.mapSize,n.spotShadow[g]=Q,n.spotShadowMap[g]=G,b++}g++}else if(R.isRectAreaLight){const O=e.get(R);O.color.copy(k).multiplyScalar(F),O.halfWidth.set(R.width*.5,0,0),O.halfHeight.set(0,R.height*.5,0),n.rectArea[m]=O,m++}else if(R.isPointLight){const O=e.get(R);if(O.color.copy(R.color).multiplyScalar(R.intensity),O.distance=R.distance,O.decay=R.decay,R.castShadow){const W=R.shadow,Q=t.get(R);Q.shadowIntensity=W.intensity,Q.shadowBias=W.bias,Q.shadowNormalBias=W.normalBias,Q.shadowRadius=W.radius,Q.shadowMapSize=W.mapSize,Q.shadowCameraNear=W.camera.near,Q.shadowCameraFar=W.camera.far,n.pointShadow[p]=Q,n.pointShadowMap[p]=G,n.pointShadowMatrix[p]=R.shadow.matrix,_++}n.point[p]=O,p++}else if(R.isHemisphereLight){const O=e.get(R);O.skyColor.copy(R.color).multiplyScalar(F),O.groundColor.copy(R.groundColor).multiplyScalar(F),n.hemi[A]=O,A++}}m>0&&(r.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=oe.LTC_FLOAT_1,n.rectAreaLTC2=oe.LTC_FLOAT_2):(n.rectAreaLTC1=oe.LTC_HALF_1,n.rectAreaLTC2=oe.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=h,n.ambient[2]=d;const w=n.hash;(w.directionalLength!==f||w.pointLength!==p||w.spotLength!==g||w.rectAreaLength!==m||w.hemiLength!==A||w.numDirectionalShadows!==E||w.numPointShadows!==_||w.numSpotShadows!==b||w.numSpotMaps!==S||w.numLightProbes!==M)&&(n.directional.length=f,n.spot.length=g,n.rectArea.length=m,n.point.length=p,n.hemi.length=A,n.directionalShadow.length=E,n.directionalShadowMap.length=E,n.pointShadow.length=_,n.pointShadowMap.length=_,n.spotShadow.length=b,n.spotShadowMap.length=b,n.directionalShadowMatrix.length=E,n.pointShadowMatrix.length=_,n.spotLightMatrix.length=b+S-I,n.spotLightMap.length=S,n.numSpotLightShadowsWithMaps=I,n.numLightProbes=M,w.directionalLength=f,w.pointLength=p,w.spotLength=g,w.rectAreaLength=m,w.hemiLength=A,w.numDirectionalShadows=E,w.numPointShadows=_,w.numSpotShadows=b,w.numSpotMaps=S,w.numLightProbes=M,n.version=_C++)}function c(l,u){let h=0,d=0,f=0,p=0,g=0;const m=u.matrixWorldInverse;for(let A=0,E=l.length;A<E;A++){const _=l[A];if(_.isDirectionalLight){const b=n.directional[h];b.direction.setFromMatrixPosition(_.matrixWorld),i.setFromMatrixPosition(_.target.matrixWorld),b.direction.sub(i),b.direction.transformDirection(m),h++}else if(_.isSpotLight){const b=n.spot[f];b.position.setFromMatrixPosition(_.matrixWorld),b.position.applyMatrix4(m),b.direction.setFromMatrixPosition(_.matrixWorld),i.setFromMatrixPosition(_.target.matrixWorld),b.direction.sub(i),b.direction.transformDirection(m),f++}else if(_.isRectAreaLight){const b=n.rectArea[p];b.position.setFromMatrixPosition(_.matrixWorld),b.position.applyMatrix4(m),a.identity(),s.copy(_.matrixWorld),s.premultiply(m),a.extractRotation(s),b.halfWidth.set(_.width*.5,0,0),b.halfHeight.set(0,_.height*.5,0),b.halfWidth.applyMatrix4(a),b.halfHeight.applyMatrix4(a),p++}else if(_.isPointLight){const b=n.point[d];b.position.setFromMatrixPosition(_.matrixWorld),b.position.applyMatrix4(m),d++}else if(_.isHemisphereLight){const b=n.hemi[g];b.direction.setFromMatrixPosition(_.matrixWorld),b.direction.transformDirection(m),g++}}}return{setup:o,setupView:c,state:n}}function up(r){const e=new vC(r),t=[],n=[];function i(u){l.camera=u,t.length=0,n.length=0}function s(u){t.push(u)}function a(u){n.push(u)}function o(){e.setup(t)}function c(u){e.setupView(t,u)}const l={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:i,state:l,setupLights:o,setupLightsView:c,pushLight:s,pushShadow:a}}function xC(r){let e=new WeakMap;function t(i,s=0){const a=e.get(i);let o;return a===void 0?(o=new up(r),e.set(i,[o])):s>=a.length?(o=new up(r),a.push(o)):o=a[s],o}function n(){e=new WeakMap}return{get:t,dispose:n}}const yC=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,SC=`uniform sampler2D shadow_pass;
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
}`;function CC(r,e,t){let n=new Sd;const i=new Oe,s=new Oe,a=new it,o=new Fg({depthPacking:o_}),c=new vE,l={},u=t.maxTextureSize,h={[Xn]:$t,[$t]:Xn,[Vt]:Vt},d=new Cn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Oe},radius:{value:4}},vertexShader:yC,fragmentShader:SC}),f=d.clone();f.defines.HORIZONTAL_PASS=1;const p=new An;p.setAttribute("position",new Ct(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const g=new ut(p,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=ag;let A=this.type;this.render=function(I,M,w){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||I.length===0)return;const x=r.getRenderTarget(),v=r.getActiveCubeFace(),R=r.getActiveMipmapLevel(),k=r.state;k.setBlending(ii),k.buffers.color.setClear(1,1,1,1),k.buffers.depth.setTest(!0),k.setScissorTest(!1);const F=A!==yi&&this.type===yi,P=A===yi&&this.type!==yi;for(let G=0,O=I.length;G<O;G++){const W=I[G],Q=W.shadow;if(Q===void 0){console.warn("THREE.WebGLShadowMap:",W,"has no shadow.");continue}if(Q.autoUpdate===!1&&Q.needsUpdate===!1)continue;i.copy(Q.mapSize);const Y=Q.getFrameExtents();if(i.multiply(Y),s.copy(Q.mapSize),(i.x>u||i.y>u)&&(i.x>u&&(s.x=Math.floor(u/Y.x),i.x=s.x*Y.x,Q.mapSize.x=s.x),i.y>u&&(s.y=Math.floor(u/Y.y),i.y=s.y*Y.y,Q.mapSize.y=s.y)),Q.map===null||F===!0||P===!0){const re=this.type!==yi?{minFilter:Nt,magFilter:Nt}:{};Q.map!==null&&Q.map.dispose(),Q.map=new Fn(i.x,i.y,re),Q.map.texture.name=W.name+".shadowMap",Q.camera.updateProjectionMatrix()}r.setRenderTarget(Q.map),r.clear();const ne=Q.getViewportCount();for(let re=0;re<ne;re++){const de=Q.getViewport(re);a.set(s.x*de.x,s.y*de.y,s.x*de.z,s.y*de.w),k.viewport(a),Q.updateMatrices(W,re),n=Q.getFrustum(),b(M,w,Q.camera,W,this.type)}Q.isPointLightShadow!==!0&&this.type===yi&&E(Q,w),Q.needsUpdate=!1}A=this.type,m.needsUpdate=!1,r.setRenderTarget(x,v,R)};function E(I,M){const w=e.update(g);d.defines.VSM_SAMPLES!==I.blurSamples&&(d.defines.VSM_SAMPLES=I.blurSamples,f.defines.VSM_SAMPLES=I.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),I.mapPass===null&&(I.mapPass=new Fn(i.x,i.y)),d.uniforms.shadow_pass.value=I.map.texture,d.uniforms.resolution.value=I.mapSize,d.uniforms.radius.value=I.radius,r.setRenderTarget(I.mapPass),r.clear(),r.renderBufferDirect(M,null,w,d,g,null),f.uniforms.shadow_pass.value=I.mapPass.texture,f.uniforms.resolution.value=I.mapSize,f.uniforms.radius.value=I.radius,r.setRenderTarget(I.map),r.clear(),r.renderBufferDirect(M,null,w,f,g,null)}function _(I,M,w,x){let v=null;const R=w.isPointLight===!0?I.customDistanceMaterial:I.customDepthMaterial;if(R!==void 0)v=R;else if(v=w.isPointLight===!0?c:o,r.localClippingEnabled&&M.clipShadows===!0&&Array.isArray(M.clippingPlanes)&&M.clippingPlanes.length!==0||M.displacementMap&&M.displacementScale!==0||M.alphaMap&&M.alphaTest>0||M.map&&M.alphaTest>0||M.alphaToCoverage===!0){const k=v.uuid,F=M.uuid;let P=l[k];P===void 0&&(P={},l[k]=P);let G=P[F];G===void 0&&(G=v.clone(),P[F]=G,M.addEventListener("dispose",S)),v=G}if(v.visible=M.visible,v.wireframe=M.wireframe,x===yi?v.side=M.shadowSide!==null?M.shadowSide:M.side:v.side=M.shadowSide!==null?M.shadowSide:h[M.side],v.alphaMap=M.alphaMap,v.alphaTest=M.alphaToCoverage===!0?.5:M.alphaTest,v.map=M.map,v.clipShadows=M.clipShadows,v.clippingPlanes=M.clippingPlanes,v.clipIntersection=M.clipIntersection,v.displacementMap=M.displacementMap,v.displacementScale=M.displacementScale,v.displacementBias=M.displacementBias,v.wireframeLinewidth=M.wireframeLinewidth,v.linewidth=M.linewidth,w.isPointLight===!0&&v.isMeshDistanceMaterial===!0){const k=r.properties.get(v);k.light=w}return v}function b(I,M,w,x,v){if(I.visible===!1)return;if(I.layers.test(M.layers)&&(I.isMesh||I.isLine||I.isPoints)&&(I.castShadow||I.receiveShadow&&v===yi)&&(!I.frustumCulled||n.intersectsObject(I))){I.modelViewMatrix.multiplyMatrices(w.matrixWorldInverse,I.matrixWorld);const F=e.update(I),P=I.material;if(Array.isArray(P)){const G=F.groups;for(let O=0,W=G.length;O<W;O++){const Q=G[O],Y=P[Q.materialIndex];if(Y&&Y.visible){const ne=_(I,Y,x,v);I.onBeforeShadow(r,I,M,w,F,ne,Q),r.renderBufferDirect(w,null,F,ne,I,Q),I.onAfterShadow(r,I,M,w,F,ne,Q)}}}else if(P.visible){const G=_(I,P,x,v);I.onBeforeShadow(r,I,M,w,F,G,null),r.renderBufferDirect(w,null,F,G,I,null),I.onAfterShadow(r,I,M,w,F,G,null)}}const k=I.children;for(let F=0,P=k.length;F<P;F++)b(k[F],M,w,x,v)}function S(I){I.target.removeEventListener("dispose",S);for(const w in l){const x=l[w],v=I.target.uuid;v in x&&(x[v].dispose(),delete x[v])}}}const IC={[fu]:pu,[Au]:bu,[mu]:_u,[Or]:gu,[pu]:fu,[bu]:Au,[_u]:mu,[gu]:Or};function MC(r,e){function t(){let L=!1;const he=new it;let te=null;const me=new it(0,0,0,0);return{setMask:function(ie){te!==ie&&!L&&(r.colorMask(ie,ie,ie,ie),te=ie)},setLocked:function(ie){L=ie},setClear:function(ie,j,be,Ge,_t){_t===!0&&(ie*=Ge,j*=Ge,be*=Ge),he.set(ie,j,be,Ge),me.equals(he)===!1&&(r.clearColor(ie,j,be,Ge),me.copy(he))},reset:function(){L=!1,te=null,me.set(-1,0,0,0)}}}function n(){let L=!1,he=!1,te=null,me=null,ie=null;return{setReversed:function(j){if(he!==j){const be=e.get("EXT_clip_control");j?be.clipControlEXT(be.LOWER_LEFT_EXT,be.ZERO_TO_ONE_EXT):be.clipControlEXT(be.LOWER_LEFT_EXT,be.NEGATIVE_ONE_TO_ONE_EXT),he=j;const Ge=ie;ie=null,this.setClear(Ge)}},getReversed:function(){return he},setTest:function(j){j?le(r.DEPTH_TEST):ve(r.DEPTH_TEST)},setMask:function(j){te!==j&&!L&&(r.depthMask(j),te=j)},setFunc:function(j){if(he&&(j=IC[j]),me!==j){switch(j){case fu:r.depthFunc(r.NEVER);break;case pu:r.depthFunc(r.ALWAYS);break;case Au:r.depthFunc(r.LESS);break;case Or:r.depthFunc(r.LEQUAL);break;case mu:r.depthFunc(r.EQUAL);break;case gu:r.depthFunc(r.GEQUAL);break;case bu:r.depthFunc(r.GREATER);break;case _u:r.depthFunc(r.NOTEQUAL);break;default:r.depthFunc(r.LEQUAL)}me=j}},setLocked:function(j){L=j},setClear:function(j){ie!==j&&(he&&(j=1-j),r.clearDepth(j),ie=j)},reset:function(){L=!1,te=null,me=null,ie=null,he=!1}}}function i(){let L=!1,he=null,te=null,me=null,ie=null,j=null,be=null,Ge=null,_t=null;return{setTest:function(rt){L||(rt?le(r.STENCIL_TEST):ve(r.STENCIL_TEST))},setMask:function(rt){he!==rt&&!L&&(r.stencilMask(rt),he=rt)},setFunc:function(rt,Nn,li){(te!==rt||me!==Nn||ie!==li)&&(r.stencilFunc(rt,Nn,li),te=rt,me=Nn,ie=li)},setOp:function(rt,Nn,li){(j!==rt||be!==Nn||Ge!==li)&&(r.stencilOp(rt,Nn,li),j=rt,be=Nn,Ge=li)},setLocked:function(rt){L=rt},setClear:function(rt){_t!==rt&&(r.clearStencil(rt),_t=rt)},reset:function(){L=!1,he=null,te=null,me=null,ie=null,j=null,be=null,Ge=null,_t=null}}}const s=new t,a=new n,o=new i,c=new WeakMap,l=new WeakMap;let u={},h={},d=new WeakMap,f=[],p=null,g=!1,m=null,A=null,E=null,_=null,b=null,S=null,I=null,M=new Me(0,0,0),w=0,x=!1,v=null,R=null,k=null,F=null,P=null;const G=r.getParameter(r.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let O=!1,W=0;const Q=r.getParameter(r.VERSION);Q.indexOf("WebGL")!==-1?(W=parseFloat(/^WebGL (\d)/.exec(Q)[1]),O=W>=1):Q.indexOf("OpenGL ES")!==-1&&(W=parseFloat(/^OpenGL ES (\d)/.exec(Q)[1]),O=W>=2);let Y=null,ne={};const re=r.getParameter(r.SCISSOR_BOX),de=r.getParameter(r.VIEWPORT),Ce=new it().fromArray(re),q=new it().fromArray(de);function Z(L,he,te,me){const ie=new Uint8Array(4),j=r.createTexture();r.bindTexture(L,j),r.texParameteri(L,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(L,r.TEXTURE_MAG_FILTER,r.NEAREST);for(let be=0;be<te;be++)L===r.TEXTURE_3D||L===r.TEXTURE_2D_ARRAY?r.texImage3D(he,0,r.RGBA,1,1,me,0,r.RGBA,r.UNSIGNED_BYTE,ie):r.texImage2D(he+be,0,r.RGBA,1,1,0,r.RGBA,r.UNSIGNED_BYTE,ie);return j}const ge={};ge[r.TEXTURE_2D]=Z(r.TEXTURE_2D,r.TEXTURE_2D,1),ge[r.TEXTURE_CUBE_MAP]=Z(r.TEXTURE_CUBE_MAP,r.TEXTURE_CUBE_MAP_POSITIVE_X,6),ge[r.TEXTURE_2D_ARRAY]=Z(r.TEXTURE_2D_ARRAY,r.TEXTURE_2D_ARRAY,1,1),ge[r.TEXTURE_3D]=Z(r.TEXTURE_3D,r.TEXTURE_3D,1,1),s.setClear(0,0,0,1),a.setClear(1),o.setClear(0),le(r.DEPTH_TEST),a.setFunc(Or),nt(!1),mt($d),le(r.CULL_FACE),D(ii);function le(L){u[L]!==!0&&(r.enable(L),u[L]=!0)}function ve(L){u[L]!==!1&&(r.disable(L),u[L]=!1)}function Ze(L,he){return h[L]!==he?(r.bindFramebuffer(L,he),h[L]=he,L===r.DRAW_FRAMEBUFFER&&(h[r.FRAMEBUFFER]=he),L===r.FRAMEBUFFER&&(h[r.DRAW_FRAMEBUFFER]=he),!0):!1}function Re(L,he){let te=f,me=!1;if(L){te=d.get(he),te===void 0&&(te=[],d.set(he,te));const ie=L.textures;if(te.length!==ie.length||te[0]!==r.COLOR_ATTACHMENT0){for(let j=0,be=ie.length;j<be;j++)te[j]=r.COLOR_ATTACHMENT0+j;te.length=ie.length,me=!0}}else te[0]!==r.BACK&&(te[0]=r.BACK,me=!0);me&&r.drawBuffers(te)}function pt(L){return p!==L?(r.useProgram(L),p=L,!0):!1}const At={[Cs]:r.FUNC_ADD,[Nb]:r.FUNC_SUBTRACT,[Ob]:r.FUNC_REVERSE_SUBTRACT};At[kb]=r.MIN,At[Qb]=r.MAX;const je={[Gb]:r.ZERO,[Hb]:r.ONE,[zb]:r.SRC_COLOR,[uu]:r.SRC_ALPHA,[jb]:r.SRC_ALPHA_SATURATE,[Xb]:r.DST_COLOR,[Wb]:r.DST_ALPHA,[Vb]:r.ONE_MINUS_SRC_COLOR,[du]:r.ONE_MINUS_SRC_ALPHA,[$b]:r.ONE_MINUS_DST_COLOR,[qb]:r.ONE_MINUS_DST_ALPHA,[Yb]:r.CONSTANT_COLOR,[Kb]:r.ONE_MINUS_CONSTANT_COLOR,[Jb]:r.CONSTANT_ALPHA,[Zb]:r.ONE_MINUS_CONSTANT_ALPHA};function D(L,he,te,me,ie,j,be,Ge,_t,rt){if(L===ii){g===!0&&(ve(r.BLEND),g=!1);return}if(g===!1&&(le(r.BLEND),g=!0),L!==Ub){if(L!==m||rt!==x){if((A!==Cs||b!==Cs)&&(r.blendEquation(r.FUNC_ADD),A=Cs,b=Cs),rt)switch(L){case Tr:r.blendFuncSeparate(r.ONE,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case jd:r.blendFunc(r.ONE,r.ONE);break;case Yd:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case Kd:r.blendFuncSeparate(r.DST_COLOR,r.ONE_MINUS_SRC_ALPHA,r.ZERO,r.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",L);break}else switch(L){case Tr:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case jd:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE,r.ONE,r.ONE);break;case Yd:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Kd:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",L);break}E=null,_=null,S=null,I=null,M.set(0,0,0),w=0,m=L,x=rt}return}ie=ie||he,j=j||te,be=be||me,(he!==A||ie!==b)&&(r.blendEquationSeparate(At[he],At[ie]),A=he,b=ie),(te!==E||me!==_||j!==S||be!==I)&&(r.blendFuncSeparate(je[te],je[me],je[j],je[be]),E=te,_=me,S=j,I=be),(Ge.equals(M)===!1||_t!==w)&&(r.blendColor(Ge.r,Ge.g,Ge.b,_t),M.copy(Ge),w=_t),m=L,x=!1}function tn(L,he){L.side===Vt?ve(r.CULL_FACE):le(r.CULL_FACE);let te=L.side===$t;he&&(te=!te),nt(te),L.blending===Tr&&L.transparent===!1?D(ii):D(L.blending,L.blendEquation,L.blendSrc,L.blendDst,L.blendEquationAlpha,L.blendSrcAlpha,L.blendDstAlpha,L.blendColor,L.blendAlpha,L.premultipliedAlpha),a.setFunc(L.depthFunc),a.setTest(L.depthTest),a.setMask(L.depthWrite),s.setMask(L.colorWrite);const me=L.stencilWrite;o.setTest(me),me&&(o.setMask(L.stencilWriteMask),o.setFunc(L.stencilFunc,L.stencilRef,L.stencilFuncMask),o.setOp(L.stencilFail,L.stencilZFail,L.stencilZPass)),et(L.polygonOffset,L.polygonOffsetFactor,L.polygonOffsetUnits),L.alphaToCoverage===!0?le(r.SAMPLE_ALPHA_TO_COVERAGE):ve(r.SAMPLE_ALPHA_TO_COVERAGE)}function nt(L){v!==L&&(L?r.frontFace(r.CW):r.frontFace(r.CCW),v=L)}function mt(L){L!==Lb?(le(r.CULL_FACE),L!==R&&(L===$d?r.cullFace(r.BACK):L===Fb?r.cullFace(r.FRONT):r.cullFace(r.FRONT_AND_BACK))):ve(r.CULL_FACE),R=L}function xe(L){L!==k&&(O&&r.lineWidth(L),k=L)}function et(L,he,te){L?(le(r.POLYGON_OFFSET_FILL),(F!==he||P!==te)&&(r.polygonOffset(he,te),F=he,P=te)):ve(r.POLYGON_OFFSET_FILL)}function we(L){L?le(r.SCISSOR_TEST):ve(r.SCISSOR_TEST)}function He(L){L===void 0&&(L=r.TEXTURE0+G-1),Y!==L&&(r.activeTexture(L),Y=L)}function Ot(L,he,te){te===void 0&&(Y===null?te=r.TEXTURE0+G-1:te=Y);let me=ne[te];me===void 0&&(me={type:void 0,texture:void 0},ne[te]=me),(me.type!==L||me.texture!==he)&&(Y!==te&&(r.activeTexture(te),Y=te),r.bindTexture(L,he||ge[L]),me.type=L,me.texture=he)}function T(){const L=ne[Y];L!==void 0&&L.type!==void 0&&(r.bindTexture(L.type,null),L.type=void 0,L.texture=void 0)}function y(){try{r.compressedTexImage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function H(){try{r.compressedTexImage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function $(){try{r.texSubImage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function K(){try{r.texSubImage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function X(){try{r.compressedTexSubImage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function ye(){try{r.compressedTexSubImage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function ce(){try{r.texStorage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Ee(){try{r.texStorage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Se(){try{r.texImage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function J(){try{r.texImage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function fe(L){Ce.equals(L)===!1&&(r.scissor(L.x,L.y,L.z,L.w),Ce.copy(L))}function Le(L){q.equals(L)===!1&&(r.viewport(L.x,L.y,L.z,L.w),q.copy(L))}function Be(L,he){let te=l.get(he);te===void 0&&(te=new WeakMap,l.set(he,te));let me=te.get(L);me===void 0&&(me=r.getUniformBlockIndex(he,L.name),te.set(L,me))}function ae(L,he){const me=l.get(he).get(L);c.get(he)!==me&&(r.uniformBlockBinding(he,me,L.__bindingPointIndex),c.set(he,me))}function ke(){r.disable(r.BLEND),r.disable(r.CULL_FACE),r.disable(r.DEPTH_TEST),r.disable(r.POLYGON_OFFSET_FILL),r.disable(r.SCISSOR_TEST),r.disable(r.STENCIL_TEST),r.disable(r.SAMPLE_ALPHA_TO_COVERAGE),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ZERO),r.blendFuncSeparate(r.ONE,r.ZERO,r.ONE,r.ZERO),r.blendColor(0,0,0,0),r.colorMask(!0,!0,!0,!0),r.clearColor(0,0,0,0),r.depthMask(!0),r.depthFunc(r.LESS),a.setReversed(!1),r.clearDepth(1),r.stencilMask(4294967295),r.stencilFunc(r.ALWAYS,0,4294967295),r.stencilOp(r.KEEP,r.KEEP,r.KEEP),r.clearStencil(0),r.cullFace(r.BACK),r.frontFace(r.CCW),r.polygonOffset(0,0),r.activeTexture(r.TEXTURE0),r.bindFramebuffer(r.FRAMEBUFFER,null),r.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),r.bindFramebuffer(r.READ_FRAMEBUFFER,null),r.useProgram(null),r.lineWidth(1),r.scissor(0,0,r.canvas.width,r.canvas.height),r.viewport(0,0,r.canvas.width,r.canvas.height),u={},Y=null,ne={},h={},d=new WeakMap,f=[],p=null,g=!1,m=null,A=null,E=null,_=null,b=null,S=null,I=null,M=new Me(0,0,0),w=0,x=!1,v=null,R=null,k=null,F=null,P=null,Ce.set(0,0,r.canvas.width,r.canvas.height),q.set(0,0,r.canvas.width,r.canvas.height),s.reset(),a.reset(),o.reset()}return{buffers:{color:s,depth:a,stencil:o},enable:le,disable:ve,bindFramebuffer:Ze,drawBuffers:Re,useProgram:pt,setBlending:D,setMaterial:tn,setFlipSided:nt,setCullFace:mt,setLineWidth:xe,setPolygonOffset:et,setScissorTest:we,activeTexture:He,bindTexture:Ot,unbindTexture:T,compressedTexImage2D:y,compressedTexImage3D:H,texImage2D:Se,texImage3D:J,updateUBOMapping:Be,uniformBlockBinding:ae,texStorage2D:ce,texStorage3D:Ee,texSubImage2D:$,texSubImage3D:K,compressedTexSubImage2D:X,compressedTexSubImage3D:ye,scissor:fe,viewport:Le,reset:ke}}function wC(r,e,t,n,i,s,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new Oe,u=new WeakMap;let h;const d=new WeakMap;let f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function p(T,y){return f?new OffscreenCanvas(T,y):to("canvas")}function g(T,y,H){let $=1;const K=Ot(T);if((K.width>H||K.height>H)&&($=H/Math.max(K.width,K.height)),$<1)if(typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&T instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&T instanceof ImageBitmap||typeof VideoFrame<"u"&&T instanceof VideoFrame){const X=Math.floor($*K.width),ye=Math.floor($*K.height);h===void 0&&(h=p(X,ye));const ce=y?p(X,ye):h;return ce.width=X,ce.height=ye,ce.getContext("2d").drawImage(T,0,0,X,ye),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+K.width+"x"+K.height+") to ("+X+"x"+ye+")."),ce}else return"data"in T&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+K.width+"x"+K.height+")."),T;return T}function m(T){return T.generateMipmaps}function A(T){r.generateMipmap(T)}function E(T){return T.isWebGLCubeRenderTarget?r.TEXTURE_CUBE_MAP:T.isWebGL3DRenderTarget?r.TEXTURE_3D:T.isWebGLArrayRenderTarget||T.isCompressedArrayTexture?r.TEXTURE_2D_ARRAY:r.TEXTURE_2D}function _(T,y,H,$,K=!1){if(T!==null){if(r[T]!==void 0)return r[T];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+T+"'")}let X=y;if(y===r.RED&&(H===r.FLOAT&&(X=r.R32F),H===r.HALF_FLOAT&&(X=r.R16F),H===r.UNSIGNED_BYTE&&(X=r.R8)),y===r.RED_INTEGER&&(H===r.UNSIGNED_BYTE&&(X=r.R8UI),H===r.UNSIGNED_SHORT&&(X=r.R16UI),H===r.UNSIGNED_INT&&(X=r.R32UI),H===r.BYTE&&(X=r.R8I),H===r.SHORT&&(X=r.R16I),H===r.INT&&(X=r.R32I)),y===r.RG&&(H===r.FLOAT&&(X=r.RG32F),H===r.HALF_FLOAT&&(X=r.RG16F),H===r.UNSIGNED_BYTE&&(X=r.RG8)),y===r.RG_INTEGER&&(H===r.UNSIGNED_BYTE&&(X=r.RG8UI),H===r.UNSIGNED_SHORT&&(X=r.RG16UI),H===r.UNSIGNED_INT&&(X=r.RG32UI),H===r.BYTE&&(X=r.RG8I),H===r.SHORT&&(X=r.RG16I),H===r.INT&&(X=r.RG32I)),y===r.RGB_INTEGER&&(H===r.UNSIGNED_BYTE&&(X=r.RGB8UI),H===r.UNSIGNED_SHORT&&(X=r.RGB16UI),H===r.UNSIGNED_INT&&(X=r.RGB32UI),H===r.BYTE&&(X=r.RGB8I),H===r.SHORT&&(X=r.RGB16I),H===r.INT&&(X=r.RGB32I)),y===r.RGBA_INTEGER&&(H===r.UNSIGNED_BYTE&&(X=r.RGBA8UI),H===r.UNSIGNED_SHORT&&(X=r.RGBA16UI),H===r.UNSIGNED_INT&&(X=r.RGBA32UI),H===r.BYTE&&(X=r.RGBA8I),H===r.SHORT&&(X=r.RGBA16I),H===r.INT&&(X=r.RGBA32I)),y===r.RGB&&H===r.UNSIGNED_INT_5_9_9_9_REV&&(X=r.RGB9_E5),y===r.RGBA){const ye=K?Nc:Ye.getTransfer($);H===r.FLOAT&&(X=r.RGBA32F),H===r.HALF_FLOAT&&(X=r.RGBA16F),H===r.UNSIGNED_BYTE&&(X=ye===ht?r.SRGB8_ALPHA8:r.RGBA8),H===r.UNSIGNED_SHORT_4_4_4_4&&(X=r.RGBA4),H===r.UNSIGNED_SHORT_5_5_5_1&&(X=r.RGB5_A1)}return(X===r.R16F||X===r.R32F||X===r.RG16F||X===r.RG32F||X===r.RGBA16F||X===r.RGBA32F)&&e.get("EXT_color_buffer_float"),X}function b(T,y){let H;return T?y===null||y===es||y===$a?H=r.DEPTH24_STENCIL8:y===Lt?H=r.DEPTH32F_STENCIL8:y===Xa&&(H=r.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):y===null||y===es||y===$a?H=r.DEPTH_COMPONENT24:y===Lt?H=r.DEPTH_COMPONENT32F:y===Xa&&(H=r.DEPTH_COMPONENT16),H}function S(T,y){return m(T)===!0||T.isFramebufferTexture&&T.minFilter!==Nt&&T.minFilter!==Ke?Math.log2(Math.max(y.width,y.height))+1:T.mipmaps!==void 0&&T.mipmaps.length>0?T.mipmaps.length:T.isCompressedTexture&&Array.isArray(T.image)?y.mipmaps.length:1}function I(T){const y=T.target;y.removeEventListener("dispose",I),w(y),y.isVideoTexture&&u.delete(y)}function M(T){const y=T.target;y.removeEventListener("dispose",M),v(y)}function w(T){const y=n.get(T);if(y.__webglInit===void 0)return;const H=T.source,$=d.get(H);if($){const K=$[y.__cacheKey];K.usedTimes--,K.usedTimes===0&&x(T),Object.keys($).length===0&&d.delete(H)}n.remove(T)}function x(T){const y=n.get(T);r.deleteTexture(y.__webglTexture);const H=T.source,$=d.get(H);delete $[y.__cacheKey],a.memory.textures--}function v(T){const y=n.get(T);if(T.depthTexture&&(T.depthTexture.dispose(),n.remove(T.depthTexture)),T.isWebGLCubeRenderTarget)for(let $=0;$<6;$++){if(Array.isArray(y.__webglFramebuffer[$]))for(let K=0;K<y.__webglFramebuffer[$].length;K++)r.deleteFramebuffer(y.__webglFramebuffer[$][K]);else r.deleteFramebuffer(y.__webglFramebuffer[$]);y.__webglDepthbuffer&&r.deleteRenderbuffer(y.__webglDepthbuffer[$])}else{if(Array.isArray(y.__webglFramebuffer))for(let $=0;$<y.__webglFramebuffer.length;$++)r.deleteFramebuffer(y.__webglFramebuffer[$]);else r.deleteFramebuffer(y.__webglFramebuffer);if(y.__webglDepthbuffer&&r.deleteRenderbuffer(y.__webglDepthbuffer),y.__webglMultisampledFramebuffer&&r.deleteFramebuffer(y.__webglMultisampledFramebuffer),y.__webglColorRenderbuffer)for(let $=0;$<y.__webglColorRenderbuffer.length;$++)y.__webglColorRenderbuffer[$]&&r.deleteRenderbuffer(y.__webglColorRenderbuffer[$]);y.__webglDepthRenderbuffer&&r.deleteRenderbuffer(y.__webglDepthRenderbuffer)}const H=T.textures;for(let $=0,K=H.length;$<K;$++){const X=n.get(H[$]);X.__webglTexture&&(r.deleteTexture(X.__webglTexture),a.memory.textures--),n.remove(H[$])}n.remove(T)}let R=0;function k(){R=0}function F(){const T=R;return T>=i.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+T+" texture units while this GPU supports only "+i.maxTextures),R+=1,T}function P(T){const y=[];return y.push(T.wrapS),y.push(T.wrapT),y.push(T.wrapR||0),y.push(T.magFilter),y.push(T.minFilter),y.push(T.anisotropy),y.push(T.internalFormat),y.push(T.format),y.push(T.type),y.push(T.generateMipmaps),y.push(T.premultiplyAlpha),y.push(T.flipY),y.push(T.unpackAlignment),y.push(T.colorSpace),y.join()}function G(T,y){const H=n.get(T);if(T.isVideoTexture&&we(T),T.isRenderTargetTexture===!1&&T.version>0&&H.__version!==T.version){const $=T.image;if($===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if($.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{ge(H,T,y);return}}t.bindTexture(r.TEXTURE_2D,H.__webglTexture,r.TEXTURE0+y)}function O(T,y){const H=n.get(T);if(T.version>0&&H.__version!==T.version){ge(H,T,y);return}t.bindTexture(r.TEXTURE_2D_ARRAY,H.__webglTexture,r.TEXTURE0+y)}function W(T,y){const H=n.get(T);if(T.version>0&&H.__version!==T.version){ge(H,T,y);return}t.bindTexture(r.TEXTURE_3D,H.__webglTexture,r.TEXTURE0+y)}function Q(T,y){const H=n.get(T);if(T.version>0&&H.__version!==T.version){le(H,T,y);return}t.bindTexture(r.TEXTURE_CUBE_MAP,H.__webglTexture,r.TEXTURE0+y)}const Y={[$n]:r.REPEAT,[Dt]:r.CLAMP_TO_EDGE,[Us]:r.MIRRORED_REPEAT},ne={[Nt]:r.NEAREST,[co]:r.NEAREST_MIPMAP_NEAREST,[$i]:r.NEAREST_MIPMAP_LINEAR,[Ke]:r.LINEAR,[Ts]:r.LINEAR_MIPMAP_NEAREST,[un]:r.LINEAR_MIPMAP_LINEAR},re={[l_]:r.NEVER,[A_]:r.ALWAYS,[h_]:r.LESS,[_g]:r.LEQUAL,[u_]:r.EQUAL,[p_]:r.GEQUAL,[d_]:r.GREATER,[f_]:r.NOTEQUAL};function de(T,y){if(y.type===Lt&&e.has("OES_texture_float_linear")===!1&&(y.magFilter===Ke||y.magFilter===Ts||y.magFilter===$i||y.magFilter===un||y.minFilter===Ke||y.minFilter===Ts||y.minFilter===$i||y.minFilter===un)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),r.texParameteri(T,r.TEXTURE_WRAP_S,Y[y.wrapS]),r.texParameteri(T,r.TEXTURE_WRAP_T,Y[y.wrapT]),(T===r.TEXTURE_3D||T===r.TEXTURE_2D_ARRAY)&&r.texParameteri(T,r.TEXTURE_WRAP_R,Y[y.wrapR]),r.texParameteri(T,r.TEXTURE_MAG_FILTER,ne[y.magFilter]),r.texParameteri(T,r.TEXTURE_MIN_FILTER,ne[y.minFilter]),y.compareFunction&&(r.texParameteri(T,r.TEXTURE_COMPARE_MODE,r.COMPARE_REF_TO_TEXTURE),r.texParameteri(T,r.TEXTURE_COMPARE_FUNC,re[y.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(y.magFilter===Nt||y.minFilter!==$i&&y.minFilter!==un||y.type===Lt&&e.has("OES_texture_float_linear")===!1)return;if(y.anisotropy>1||n.get(y).__currentAnisotropy){const H=e.get("EXT_texture_filter_anisotropic");r.texParameterf(T,H.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(y.anisotropy,i.getMaxAnisotropy())),n.get(y).__currentAnisotropy=y.anisotropy}}}function Ce(T,y){let H=!1;T.__webglInit===void 0&&(T.__webglInit=!0,y.addEventListener("dispose",I));const $=y.source;let K=d.get($);K===void 0&&(K={},d.set($,K));const X=P(y);if(X!==T.__cacheKey){K[X]===void 0&&(K[X]={texture:r.createTexture(),usedTimes:0},a.memory.textures++,H=!0),K[X].usedTimes++;const ye=K[T.__cacheKey];ye!==void 0&&(K[T.__cacheKey].usedTimes--,ye.usedTimes===0&&x(y)),T.__cacheKey=X,T.__webglTexture=K[X].texture}return H}function q(T,y,H){return Math.floor(Math.floor(T/H)/y)}function Z(T,y,H,$){const X=T.updateRanges;if(X.length===0)t.texSubImage2D(r.TEXTURE_2D,0,0,0,y.width,y.height,H,$,y.data);else{X.sort((J,fe)=>J.start-fe.start);let ye=0;for(let J=1;J<X.length;J++){const fe=X[ye],Le=X[J],Be=fe.start+fe.count,ae=q(Le.start,y.width,4),ke=q(fe.start,y.width,4);Le.start<=Be+1&&ae===ke&&q(Le.start+Le.count-1,y.width,4)===ae?fe.count=Math.max(fe.count,Le.start+Le.count-fe.start):(++ye,X[ye]=Le)}X.length=ye+1;const ce=r.getParameter(r.UNPACK_ROW_LENGTH),Ee=r.getParameter(r.UNPACK_SKIP_PIXELS),Se=r.getParameter(r.UNPACK_SKIP_ROWS);r.pixelStorei(r.UNPACK_ROW_LENGTH,y.width);for(let J=0,fe=X.length;J<fe;J++){const Le=X[J],Be=Math.floor(Le.start/4),ae=Math.ceil(Le.count/4),ke=Be%y.width,L=Math.floor(Be/y.width),he=ae,te=1;r.pixelStorei(r.UNPACK_SKIP_PIXELS,ke),r.pixelStorei(r.UNPACK_SKIP_ROWS,L),t.texSubImage2D(r.TEXTURE_2D,0,ke,L,he,te,H,$,y.data)}T.clearUpdateRanges(),r.pixelStorei(r.UNPACK_ROW_LENGTH,ce),r.pixelStorei(r.UNPACK_SKIP_PIXELS,Ee),r.pixelStorei(r.UNPACK_SKIP_ROWS,Se)}}function ge(T,y,H){let $=r.TEXTURE_2D;(y.isDataArrayTexture||y.isCompressedArrayTexture)&&($=r.TEXTURE_2D_ARRAY),y.isData3DTexture&&($=r.TEXTURE_3D);const K=Ce(T,y),X=y.source;t.bindTexture($,T.__webglTexture,r.TEXTURE0+H);const ye=n.get(X);if(X.version!==ye.__version||K===!0){t.activeTexture(r.TEXTURE0+H);const ce=Ye.getPrimaries(Ye.workingColorSpace),Ee=y.colorSpace===Bn?null:Ye.getPrimaries(y.colorSpace),Se=y.colorSpace===Bn||ce===Ee?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,y.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,y.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,Se);let J=g(y.image,!1,i.maxTextureSize);J=He(y,J);const fe=s.convert(y.format,y.colorSpace),Le=s.convert(y.type);let Be=_(y.internalFormat,fe,Le,y.colorSpace,y.isVideoTexture);de($,y);let ae;const ke=y.mipmaps,L=y.isVideoTexture!==!0,he=ye.__version===void 0||K===!0,te=X.dataReady,me=S(y,J);if(y.isDepthTexture)Be=b(y.format===Ya,y.type),he&&(L?t.texStorage2D(r.TEXTURE_2D,1,Be,J.width,J.height):t.texImage2D(r.TEXTURE_2D,0,Be,J.width,J.height,0,fe,Le,null));else if(y.isDataTexture)if(ke.length>0){L&&he&&t.texStorage2D(r.TEXTURE_2D,me,Be,ke[0].width,ke[0].height);for(let ie=0,j=ke.length;ie<j;ie++)ae=ke[ie],L?te&&t.texSubImage2D(r.TEXTURE_2D,ie,0,0,ae.width,ae.height,fe,Le,ae.data):t.texImage2D(r.TEXTURE_2D,ie,Be,ae.width,ae.height,0,fe,Le,ae.data);y.generateMipmaps=!1}else L?(he&&t.texStorage2D(r.TEXTURE_2D,me,Be,J.width,J.height),te&&Z(y,J,fe,Le)):t.texImage2D(r.TEXTURE_2D,0,Be,J.width,J.height,0,fe,Le,J.data);else if(y.isCompressedTexture)if(y.isCompressedArrayTexture){L&&he&&t.texStorage3D(r.TEXTURE_2D_ARRAY,me,Be,ke[0].width,ke[0].height,J.depth);for(let ie=0,j=ke.length;ie<j;ie++)if(ae=ke[ie],y.format!==yt)if(fe!==null)if(L){if(te)if(y.layerUpdates.size>0){const be=Gf(ae.width,ae.height,y.format,y.type);for(const Ge of y.layerUpdates){const _t=ae.data.subarray(Ge*be/ae.data.BYTES_PER_ELEMENT,(Ge+1)*be/ae.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,ie,0,0,Ge,ae.width,ae.height,1,fe,_t)}y.clearLayerUpdates()}else t.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,ie,0,0,0,ae.width,ae.height,J.depth,fe,ae.data)}else t.compressedTexImage3D(r.TEXTURE_2D_ARRAY,ie,Be,ae.width,ae.height,J.depth,0,ae.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else L?te&&t.texSubImage3D(r.TEXTURE_2D_ARRAY,ie,0,0,0,ae.width,ae.height,J.depth,fe,Le,ae.data):t.texImage3D(r.TEXTURE_2D_ARRAY,ie,Be,ae.width,ae.height,J.depth,0,fe,Le,ae.data)}else{L&&he&&t.texStorage2D(r.TEXTURE_2D,me,Be,ke[0].width,ke[0].height);for(let ie=0,j=ke.length;ie<j;ie++)ae=ke[ie],y.format!==yt?fe!==null?L?te&&t.compressedTexSubImage2D(r.TEXTURE_2D,ie,0,0,ae.width,ae.height,fe,ae.data):t.compressedTexImage2D(r.TEXTURE_2D,ie,Be,ae.width,ae.height,0,ae.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):L?te&&t.texSubImage2D(r.TEXTURE_2D,ie,0,0,ae.width,ae.height,fe,Le,ae.data):t.texImage2D(r.TEXTURE_2D,ie,Be,ae.width,ae.height,0,fe,Le,ae.data)}else if(y.isDataArrayTexture)if(L){if(he&&t.texStorage3D(r.TEXTURE_2D_ARRAY,me,Be,J.width,J.height,J.depth),te)if(y.layerUpdates.size>0){const ie=Gf(J.width,J.height,y.format,y.type);for(const j of y.layerUpdates){const be=J.data.subarray(j*ie/J.data.BYTES_PER_ELEMENT,(j+1)*ie/J.data.BYTES_PER_ELEMENT);t.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,j,J.width,J.height,1,fe,Le,be)}y.clearLayerUpdates()}else t.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,0,J.width,J.height,J.depth,fe,Le,J.data)}else t.texImage3D(r.TEXTURE_2D_ARRAY,0,Be,J.width,J.height,J.depth,0,fe,Le,J.data);else if(y.isData3DTexture)L?(he&&t.texStorage3D(r.TEXTURE_3D,me,Be,J.width,J.height,J.depth),te&&t.texSubImage3D(r.TEXTURE_3D,0,0,0,0,J.width,J.height,J.depth,fe,Le,J.data)):t.texImage3D(r.TEXTURE_3D,0,Be,J.width,J.height,J.depth,0,fe,Le,J.data);else if(y.isFramebufferTexture){if(he)if(L)t.texStorage2D(r.TEXTURE_2D,me,Be,J.width,J.height);else{let ie=J.width,j=J.height;for(let be=0;be<me;be++)t.texImage2D(r.TEXTURE_2D,be,Be,ie,j,0,fe,Le,null),ie>>=1,j>>=1}}else if(ke.length>0){if(L&&he){const ie=Ot(ke[0]);t.texStorage2D(r.TEXTURE_2D,me,Be,ie.width,ie.height)}for(let ie=0,j=ke.length;ie<j;ie++)ae=ke[ie],L?te&&t.texSubImage2D(r.TEXTURE_2D,ie,0,0,fe,Le,ae):t.texImage2D(r.TEXTURE_2D,ie,Be,fe,Le,ae);y.generateMipmaps=!1}else if(L){if(he){const ie=Ot(J);t.texStorage2D(r.TEXTURE_2D,me,Be,ie.width,ie.height)}te&&t.texSubImage2D(r.TEXTURE_2D,0,0,0,fe,Le,J)}else t.texImage2D(r.TEXTURE_2D,0,Be,fe,Le,J);m(y)&&A($),ye.__version=X.version,y.onUpdate&&y.onUpdate(y)}T.__version=y.version}function le(T,y,H){if(y.image.length!==6)return;const $=Ce(T,y),K=y.source;t.bindTexture(r.TEXTURE_CUBE_MAP,T.__webglTexture,r.TEXTURE0+H);const X=n.get(K);if(K.version!==X.__version||$===!0){t.activeTexture(r.TEXTURE0+H);const ye=Ye.getPrimaries(Ye.workingColorSpace),ce=y.colorSpace===Bn?null:Ye.getPrimaries(y.colorSpace),Ee=y.colorSpace===Bn||ye===ce?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,y.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,y.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ee);const Se=y.isCompressedTexture||y.image[0].isCompressedTexture,J=y.image[0]&&y.image[0].isDataTexture,fe=[];for(let j=0;j<6;j++)!Se&&!J?fe[j]=g(y.image[j],!0,i.maxCubemapSize):fe[j]=J?y.image[j].image:y.image[j],fe[j]=He(y,fe[j]);const Le=fe[0],Be=s.convert(y.format,y.colorSpace),ae=s.convert(y.type),ke=_(y.internalFormat,Be,ae,y.colorSpace),L=y.isVideoTexture!==!0,he=X.__version===void 0||$===!0,te=K.dataReady;let me=S(y,Le);de(r.TEXTURE_CUBE_MAP,y);let ie;if(Se){L&&he&&t.texStorage2D(r.TEXTURE_CUBE_MAP,me,ke,Le.width,Le.height);for(let j=0;j<6;j++){ie=fe[j].mipmaps;for(let be=0;be<ie.length;be++){const Ge=ie[be];y.format!==yt?Be!==null?L?te&&t.compressedTexSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+j,be,0,0,Ge.width,Ge.height,Be,Ge.data):t.compressedTexImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+j,be,ke,Ge.width,Ge.height,0,Ge.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):L?te&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+j,be,0,0,Ge.width,Ge.height,Be,ae,Ge.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+j,be,ke,Ge.width,Ge.height,0,Be,ae,Ge.data)}}}else{if(ie=y.mipmaps,L&&he){ie.length>0&&me++;const j=Ot(fe[0]);t.texStorage2D(r.TEXTURE_CUBE_MAP,me,ke,j.width,j.height)}for(let j=0;j<6;j++)if(J){L?te&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,0,0,fe[j].width,fe[j].height,Be,ae,fe[j].data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,ke,fe[j].width,fe[j].height,0,Be,ae,fe[j].data);for(let be=0;be<ie.length;be++){const _t=ie[be].image[j].image;L?te&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+j,be+1,0,0,_t.width,_t.height,Be,ae,_t.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+j,be+1,ke,_t.width,_t.height,0,Be,ae,_t.data)}}else{L?te&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,0,0,Be,ae,fe[j]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,ke,Be,ae,fe[j]);for(let be=0;be<ie.length;be++){const Ge=ie[be];L?te&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+j,be+1,0,0,Be,ae,Ge.image[j]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+j,be+1,ke,Be,ae,Ge.image[j])}}}m(y)&&A(r.TEXTURE_CUBE_MAP),X.__version=K.version,y.onUpdate&&y.onUpdate(y)}T.__version=y.version}function ve(T,y,H,$,K,X){const ye=s.convert(H.format,H.colorSpace),ce=s.convert(H.type),Ee=_(H.internalFormat,ye,ce,H.colorSpace),Se=n.get(y),J=n.get(H);if(J.__renderTarget=y,!Se.__hasExternalTextures){const fe=Math.max(1,y.width>>X),Le=Math.max(1,y.height>>X);K===r.TEXTURE_3D||K===r.TEXTURE_2D_ARRAY?t.texImage3D(K,X,Ee,fe,Le,y.depth,0,ye,ce,null):t.texImage2D(K,X,Ee,fe,Le,0,ye,ce,null)}t.bindFramebuffer(r.FRAMEBUFFER,T),et(y)?o.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,$,K,J.__webglTexture,0,xe(y)):(K===r.TEXTURE_2D||K>=r.TEXTURE_CUBE_MAP_POSITIVE_X&&K<=r.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&r.framebufferTexture2D(r.FRAMEBUFFER,$,K,J.__webglTexture,X),t.bindFramebuffer(r.FRAMEBUFFER,null)}function Ze(T,y,H){if(r.bindRenderbuffer(r.RENDERBUFFER,T),y.depthBuffer){const $=y.depthTexture,K=$&&$.isDepthTexture?$.type:null,X=b(y.stencilBuffer,K),ye=y.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,ce=xe(y);et(y)?o.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,ce,X,y.width,y.height):H?r.renderbufferStorageMultisample(r.RENDERBUFFER,ce,X,y.width,y.height):r.renderbufferStorage(r.RENDERBUFFER,X,y.width,y.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,ye,r.RENDERBUFFER,T)}else{const $=y.textures;for(let K=0;K<$.length;K++){const X=$[K],ye=s.convert(X.format,X.colorSpace),ce=s.convert(X.type),Ee=_(X.internalFormat,ye,ce,X.colorSpace),Se=xe(y);H&&et(y)===!1?r.renderbufferStorageMultisample(r.RENDERBUFFER,Se,Ee,y.width,y.height):et(y)?o.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,Se,Ee,y.width,y.height):r.renderbufferStorage(r.RENDERBUFFER,Ee,y.width,y.height)}}r.bindRenderbuffer(r.RENDERBUFFER,null)}function Re(T,y){if(y&&y.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(r.FRAMEBUFFER,T),!(y.depthTexture&&y.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const $=n.get(y.depthTexture);$.__renderTarget=y,(!$.__webglTexture||y.depthTexture.image.width!==y.width||y.depthTexture.image.height!==y.height)&&(y.depthTexture.image.width=y.width,y.depthTexture.image.height=y.height,y.depthTexture.needsUpdate=!0),G(y.depthTexture,0);const K=$.__webglTexture,X=xe(y);if(y.depthTexture.format===ja)et(y)?o.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,K,0,X):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,K,0);else if(y.depthTexture.format===Ya)et(y)?o.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,K,0,X):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,K,0);else throw new Error("Unknown depthTexture format")}function pt(T){const y=n.get(T),H=T.isWebGLCubeRenderTarget===!0;if(y.__boundDepthTexture!==T.depthTexture){const $=T.depthTexture;if(y.__depthDisposeCallback&&y.__depthDisposeCallback(),$){const K=()=>{delete y.__boundDepthTexture,delete y.__depthDisposeCallback,$.removeEventListener("dispose",K)};$.addEventListener("dispose",K),y.__depthDisposeCallback=K}y.__boundDepthTexture=$}if(T.depthTexture&&!y.__autoAllocateDepthBuffer){if(H)throw new Error("target.depthTexture not supported in Cube render targets");const $=T.texture.mipmaps;$&&$.length>0?Re(y.__webglFramebuffer[0],T):Re(y.__webglFramebuffer,T)}else if(H){y.__webglDepthbuffer=[];for(let $=0;$<6;$++)if(t.bindFramebuffer(r.FRAMEBUFFER,y.__webglFramebuffer[$]),y.__webglDepthbuffer[$]===void 0)y.__webglDepthbuffer[$]=r.createRenderbuffer(),Ze(y.__webglDepthbuffer[$],T,!1);else{const K=T.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,X=y.__webglDepthbuffer[$];r.bindRenderbuffer(r.RENDERBUFFER,X),r.framebufferRenderbuffer(r.FRAMEBUFFER,K,r.RENDERBUFFER,X)}}else{const $=T.texture.mipmaps;if($&&$.length>0?t.bindFramebuffer(r.FRAMEBUFFER,y.__webglFramebuffer[0]):t.bindFramebuffer(r.FRAMEBUFFER,y.__webglFramebuffer),y.__webglDepthbuffer===void 0)y.__webglDepthbuffer=r.createRenderbuffer(),Ze(y.__webglDepthbuffer,T,!1);else{const K=T.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,X=y.__webglDepthbuffer;r.bindRenderbuffer(r.RENDERBUFFER,X),r.framebufferRenderbuffer(r.FRAMEBUFFER,K,r.RENDERBUFFER,X)}}t.bindFramebuffer(r.FRAMEBUFFER,null)}function At(T,y,H){const $=n.get(T);y!==void 0&&ve($.__webglFramebuffer,T,T.texture,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,0),H!==void 0&&pt(T)}function je(T){const y=T.texture,H=n.get(T),$=n.get(y);T.addEventListener("dispose",M);const K=T.textures,X=T.isWebGLCubeRenderTarget===!0,ye=K.length>1;if(ye||($.__webglTexture===void 0&&($.__webglTexture=r.createTexture()),$.__version=y.version,a.memory.textures++),X){H.__webglFramebuffer=[];for(let ce=0;ce<6;ce++)if(y.mipmaps&&y.mipmaps.length>0){H.__webglFramebuffer[ce]=[];for(let Ee=0;Ee<y.mipmaps.length;Ee++)H.__webglFramebuffer[ce][Ee]=r.createFramebuffer()}else H.__webglFramebuffer[ce]=r.createFramebuffer()}else{if(y.mipmaps&&y.mipmaps.length>0){H.__webglFramebuffer=[];for(let ce=0;ce<y.mipmaps.length;ce++)H.__webglFramebuffer[ce]=r.createFramebuffer()}else H.__webglFramebuffer=r.createFramebuffer();if(ye)for(let ce=0,Ee=K.length;ce<Ee;ce++){const Se=n.get(K[ce]);Se.__webglTexture===void 0&&(Se.__webglTexture=r.createTexture(),a.memory.textures++)}if(T.samples>0&&et(T)===!1){H.__webglMultisampledFramebuffer=r.createFramebuffer(),H.__webglColorRenderbuffer=[],t.bindFramebuffer(r.FRAMEBUFFER,H.__webglMultisampledFramebuffer);for(let ce=0;ce<K.length;ce++){const Ee=K[ce];H.__webglColorRenderbuffer[ce]=r.createRenderbuffer(),r.bindRenderbuffer(r.RENDERBUFFER,H.__webglColorRenderbuffer[ce]);const Se=s.convert(Ee.format,Ee.colorSpace),J=s.convert(Ee.type),fe=_(Ee.internalFormat,Se,J,Ee.colorSpace,T.isXRRenderTarget===!0),Le=xe(T);r.renderbufferStorageMultisample(r.RENDERBUFFER,Le,fe,T.width,T.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+ce,r.RENDERBUFFER,H.__webglColorRenderbuffer[ce])}r.bindRenderbuffer(r.RENDERBUFFER,null),T.depthBuffer&&(H.__webglDepthRenderbuffer=r.createRenderbuffer(),Ze(H.__webglDepthRenderbuffer,T,!0)),t.bindFramebuffer(r.FRAMEBUFFER,null)}}if(X){t.bindTexture(r.TEXTURE_CUBE_MAP,$.__webglTexture),de(r.TEXTURE_CUBE_MAP,y);for(let ce=0;ce<6;ce++)if(y.mipmaps&&y.mipmaps.length>0)for(let Ee=0;Ee<y.mipmaps.length;Ee++)ve(H.__webglFramebuffer[ce][Ee],T,y,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+ce,Ee);else ve(H.__webglFramebuffer[ce],T,y,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+ce,0);m(y)&&A(r.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(ye){for(let ce=0,Ee=K.length;ce<Ee;ce++){const Se=K[ce],J=n.get(Se);t.bindTexture(r.TEXTURE_2D,J.__webglTexture),de(r.TEXTURE_2D,Se),ve(H.__webglFramebuffer,T,Se,r.COLOR_ATTACHMENT0+ce,r.TEXTURE_2D,0),m(Se)&&A(r.TEXTURE_2D)}t.unbindTexture()}else{let ce=r.TEXTURE_2D;if((T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(ce=T.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY),t.bindTexture(ce,$.__webglTexture),de(ce,y),y.mipmaps&&y.mipmaps.length>0)for(let Ee=0;Ee<y.mipmaps.length;Ee++)ve(H.__webglFramebuffer[Ee],T,y,r.COLOR_ATTACHMENT0,ce,Ee);else ve(H.__webglFramebuffer,T,y,r.COLOR_ATTACHMENT0,ce,0);m(y)&&A(ce),t.unbindTexture()}T.depthBuffer&&pt(T)}function D(T){const y=T.textures;for(let H=0,$=y.length;H<$;H++){const K=y[H];if(m(K)){const X=E(T),ye=n.get(K).__webglTexture;t.bindTexture(X,ye),A(X),t.unbindTexture()}}}const tn=[],nt=[];function mt(T){if(T.samples>0){if(et(T)===!1){const y=T.textures,H=T.width,$=T.height;let K=r.COLOR_BUFFER_BIT;const X=T.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,ye=n.get(T),ce=y.length>1;if(ce)for(let Se=0;Se<y.length;Se++)t.bindFramebuffer(r.FRAMEBUFFER,ye.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+Se,r.RENDERBUFFER,null),t.bindFramebuffer(r.FRAMEBUFFER,ye.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+Se,r.TEXTURE_2D,null,0);t.bindFramebuffer(r.READ_FRAMEBUFFER,ye.__webglMultisampledFramebuffer);const Ee=T.texture.mipmaps;Ee&&Ee.length>0?t.bindFramebuffer(r.DRAW_FRAMEBUFFER,ye.__webglFramebuffer[0]):t.bindFramebuffer(r.DRAW_FRAMEBUFFER,ye.__webglFramebuffer);for(let Se=0;Se<y.length;Se++){if(T.resolveDepthBuffer&&(T.depthBuffer&&(K|=r.DEPTH_BUFFER_BIT),T.stencilBuffer&&T.resolveStencilBuffer&&(K|=r.STENCIL_BUFFER_BIT)),ce){r.framebufferRenderbuffer(r.READ_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.RENDERBUFFER,ye.__webglColorRenderbuffer[Se]);const J=n.get(y[Se]).__webglTexture;r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,J,0)}r.blitFramebuffer(0,0,H,$,0,0,H,$,K,r.NEAREST),c===!0&&(tn.length=0,nt.length=0,tn.push(r.COLOR_ATTACHMENT0+Se),T.depthBuffer&&T.resolveDepthBuffer===!1&&(tn.push(X),nt.push(X),r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,nt)),r.invalidateFramebuffer(r.READ_FRAMEBUFFER,tn))}if(t.bindFramebuffer(r.READ_FRAMEBUFFER,null),t.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),ce)for(let Se=0;Se<y.length;Se++){t.bindFramebuffer(r.FRAMEBUFFER,ye.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+Se,r.RENDERBUFFER,ye.__webglColorRenderbuffer[Se]);const J=n.get(y[Se]).__webglTexture;t.bindFramebuffer(r.FRAMEBUFFER,ye.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+Se,r.TEXTURE_2D,J,0)}t.bindFramebuffer(r.DRAW_FRAMEBUFFER,ye.__webglMultisampledFramebuffer)}else if(T.depthBuffer&&T.resolveDepthBuffer===!1&&c){const y=T.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,[y])}}}function xe(T){return Math.min(i.maxSamples,T.samples)}function et(T){const y=n.get(T);return T.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&y.__useRenderToTexture!==!1}function we(T){const y=a.render.frame;u.get(T)!==y&&(u.set(T,y),T.update())}function He(T,y){const H=T.colorSpace,$=T.format,K=T.type;return T.isCompressedTexture===!0||T.isVideoTexture===!0||H!==bt&&H!==Bn&&(Ye.getTransfer(H)===ht?($!==yt||K!==Mt)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",H)),y}function Ot(T){return typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement?(l.width=T.naturalWidth||T.width,l.height=T.naturalHeight||T.height):typeof VideoFrame<"u"&&T instanceof VideoFrame?(l.width=T.displayWidth,l.height=T.displayHeight):(l.width=T.width,l.height=T.height),l}this.allocateTextureUnit=F,this.resetTextureUnits=k,this.setTexture2D=G,this.setTexture2DArray=O,this.setTexture3D=W,this.setTextureCube=Q,this.rebindTextures=At,this.setupRenderTarget=je,this.updateRenderTargetMipmap=D,this.updateMultisampleRenderTarget=mt,this.setupDepthRenderbuffer=pt,this.setupFrameBufferTexture=ve,this.useMultisampledRTT=et}function TC(r,e){function t(n,i=Bn){let s;const a=Ye.getTransfer(i);if(n===Mt)return r.UNSIGNED_BYTE;if(n===fd)return r.UNSIGNED_SHORT_4_4_4_4;if(n===pd)return r.UNSIGNED_SHORT_5_5_5_1;if(n===fg)return r.UNSIGNED_INT_5_9_9_9_REV;if(n===ud)return r.BYTE;if(n===dd)return r.SHORT;if(n===Xa)return r.UNSIGNED_SHORT;if(n===el)return r.INT;if(n===es)return r.UNSIGNED_INT;if(n===Lt)return r.FLOAT;if(n===Ut)return r.HALF_FLOAT;if(n===pg)return r.ALPHA;if(n===Ag)return r.RGB;if(n===yt)return r.RGBA;if(n===ja)return r.DEPTH_COMPONENT;if(n===Ya)return r.DEPTH_STENCIL;if(n===ji)return r.RED;if(n===Ad)return r.RED_INTEGER;if(n===Ms)return r.RG;if(n===md)return r.RG_INTEGER;if(n===gd)return r.RGBA_INTEGER;if(n===Rr||n===Rs||n===Br||n===Bs)if(a===ht)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(n===Rr)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Rs)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Br)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Bs)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(n===Rr)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Rs)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Br)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Bs)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Bc||n===vu||n===Dc||n===xu)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(n===Bc)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===vu)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Dc)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===xu)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Lc||n===Ka||n===Ja)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(n===Lc||n===Ka)return a===ht?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(n===Ja)return a===ht?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===Ds||n===yu||n===Su||n===Cu||n===Za||n===Iu||n===Mu||n===wu||n===Tu||n===Ru||n===Bu||n===Du||n===Lu||n===Fu)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(n===Ds)return a===ht?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===yu)return a===ht?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Su)return a===ht?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Cu)return a===ht?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Za)return a===ht?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Iu)return a===ht?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Mu)return a===ht?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===wu)return a===ht?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Tu)return a===ht?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Ru)return a===ht?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Bu)return a===ht?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Du)return a===ht?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Lu)return a===ht?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Fu)return a===ht?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Ls||n===Pu||n===Fc)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(n===Ls)return a===ht?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Pu)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Fc)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===mg||n===Uu||n===Nu||n===Ou)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(n===Ls)return s.COMPRESSED_RED_RGTC1_EXT;if(n===Uu)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Nu)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Ou)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===$a?r.UNSIGNED_INT_24_8:r[n]!==void 0?r[n]:null}return{convert:t}}const RC=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,BC=`
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

}`;class DC{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,n){if(this.texture===null){const i=new St,s=e.properties.get(i);s.__webglTexture=t.texture,(t.depthNear!==n.depthNear||t.depthFar!==n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new Cn({vertexShader:RC,fragmentShader:BC,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new ut(new Li(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class LC extends jn{constructor(e,t){super();const n=this;let i=null,s=1,a=null,o="local-floor",c=1,l=null,u=null,h=null,d=null,f=null,p=null;const g=new DC,m=t.getContextAttributes();let A=null,E=null;const _=[],b=[],S=new Oe;let I=null;const M=new Xt;M.viewport=new it;const w=new Xt;w.viewport=new it;const x=[M,w],v=new QE;let R=null,k=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(q){let Z=_[q];return Z===void 0&&(Z=new Dl,_[q]=Z),Z.getTargetRaySpace()},this.getControllerGrip=function(q){let Z=_[q];return Z===void 0&&(Z=new Dl,_[q]=Z),Z.getGripSpace()},this.getHand=function(q){let Z=_[q];return Z===void 0&&(Z=new Dl,_[q]=Z),Z.getHandSpace()};function F(q){const Z=b.indexOf(q.inputSource);if(Z===-1)return;const ge=_[Z];ge!==void 0&&(ge.update(q.inputSource,q.frame,l||a),ge.dispatchEvent({type:q.type,data:q.inputSource}))}function P(){i.removeEventListener("select",F),i.removeEventListener("selectstart",F),i.removeEventListener("selectend",F),i.removeEventListener("squeeze",F),i.removeEventListener("squeezestart",F),i.removeEventListener("squeezeend",F),i.removeEventListener("end",P),i.removeEventListener("inputsourceschange",G);for(let q=0;q<_.length;q++){const Z=b[q];Z!==null&&(b[q]=null,_[q].disconnect(Z))}R=null,k=null,g.reset(),e.setRenderTarget(A),f=null,d=null,h=null,i=null,E=null,Ce.stop(),n.isPresenting=!1,e.setPixelRatio(I),e.setSize(S.width,S.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(q){s=q,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(q){o=q,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||a},this.setReferenceSpace=function(q){l=q},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return h},this.getFrame=function(){return p},this.getSession=function(){return i},this.setSession=async function(q){if(i=q,i!==null){if(A=e.getRenderTarget(),i.addEventListener("select",F),i.addEventListener("selectstart",F),i.addEventListener("selectend",F),i.addEventListener("squeeze",F),i.addEventListener("squeezestart",F),i.addEventListener("squeezeend",F),i.addEventListener("end",P),i.addEventListener("inputsourceschange",G),m.xrCompatible!==!0&&await t.makeXRCompatible(),I=e.getPixelRatio(),e.getSize(S),typeof XRWebGLBinding<"u"&&"createProjectionLayer"in XRWebGLBinding.prototype){let ge=null,le=null,ve=null;m.depth&&(ve=m.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ge=m.stencil?Ya:ja,le=m.stencil?$a:es);const Ze={colorFormat:t.RGBA8,depthFormat:ve,scaleFactor:s};h=new XRWebGLBinding(i,t),d=h.createProjectionLayer(Ze),i.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),E=new Fn(d.textureWidth,d.textureHeight,{format:yt,type:Mt,depthTexture:new Lg(d.textureWidth,d.textureHeight,le,void 0,void 0,void 0,void 0,void 0,void 0,ge),stencilBuffer:m.stencil,colorSpace:e.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}else{const ge={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:s};f=new XRWebGLLayer(i,t,ge),i.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),E=new Fn(f.framebufferWidth,f.framebufferHeight,{format:yt,type:Mt,colorSpace:e.outputColorSpace,stencilBuffer:m.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}E.isXRRenderTarget=!0,this.setFoveation(c),l=null,a=await i.requestReferenceSpace(o),Ce.setContext(i),Ce.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return g.getDepthTexture()};function G(q){for(let Z=0;Z<q.removed.length;Z++){const ge=q.removed[Z],le=b.indexOf(ge);le>=0&&(b[le]=null,_[le].disconnect(ge))}for(let Z=0;Z<q.added.length;Z++){const ge=q.added[Z];let le=b.indexOf(ge);if(le===-1){for(let Ze=0;Ze<_.length;Ze++)if(Ze>=b.length){b.push(ge),le=Ze;break}else if(b[Ze]===null){b[Ze]=ge,le=Ze;break}if(le===-1)break}const ve=_[le];ve&&ve.connect(ge)}}const O=new B,W=new B;function Q(q,Z,ge){O.setFromMatrixPosition(Z.matrixWorld),W.setFromMatrixPosition(ge.matrixWorld);const le=O.distanceTo(W),ve=Z.projectionMatrix.elements,Ze=ge.projectionMatrix.elements,Re=ve[14]/(ve[10]-1),pt=ve[14]/(ve[10]+1),At=(ve[9]+1)/ve[5],je=(ve[9]-1)/ve[5],D=(ve[8]-1)/ve[0],tn=(Ze[8]+1)/Ze[0],nt=Re*D,mt=Re*tn,xe=le/(-D+tn),et=xe*-D;if(Z.matrixWorld.decompose(q.position,q.quaternion,q.scale),q.translateX(et),q.translateZ(xe),q.matrixWorld.compose(q.position,q.quaternion,q.scale),q.matrixWorldInverse.copy(q.matrixWorld).invert(),ve[10]===-1)q.projectionMatrix.copy(Z.projectionMatrix),q.projectionMatrixInverse.copy(Z.projectionMatrixInverse);else{const we=Re+xe,He=pt+xe,Ot=nt-et,T=mt+(le-et),y=At*pt/He*we,H=je*pt/He*we;q.projectionMatrix.makePerspective(Ot,T,y,H,we,He),q.projectionMatrixInverse.copy(q.projectionMatrix).invert()}}function Y(q,Z){Z===null?q.matrixWorld.copy(q.matrix):q.matrixWorld.multiplyMatrices(Z.matrixWorld,q.matrix),q.matrixWorldInverse.copy(q.matrixWorld).invert()}this.updateCamera=function(q){if(i===null)return;let Z=q.near,ge=q.far;g.texture!==null&&(g.depthNear>0&&(Z=g.depthNear),g.depthFar>0&&(ge=g.depthFar)),v.near=w.near=M.near=Z,v.far=w.far=M.far=ge,(R!==v.near||k!==v.far)&&(i.updateRenderState({depthNear:v.near,depthFar:v.far}),R=v.near,k=v.far),M.layers.mask=q.layers.mask|2,w.layers.mask=q.layers.mask|4,v.layers.mask=M.layers.mask|w.layers.mask;const le=q.parent,ve=v.cameras;Y(v,le);for(let Ze=0;Ze<ve.length;Ze++)Y(ve[Ze],le);ve.length===2?Q(v,M,w):v.projectionMatrix.copy(M.projectionMatrix),ne(q,v,le)};function ne(q,Z,ge){ge===null?q.matrix.copy(Z.matrixWorld):(q.matrix.copy(ge.matrixWorld),q.matrix.invert(),q.matrix.multiply(Z.matrixWorld)),q.matrix.decompose(q.position,q.quaternion,q.scale),q.updateMatrixWorld(!0),q.projectionMatrix.copy(Z.projectionMatrix),q.projectionMatrixInverse.copy(Z.projectionMatrixInverse),q.isPerspectiveCamera&&(q.fov=zr*2*Math.atan(1/q.projectionMatrix.elements[5]),q.zoom=1)}this.getCamera=function(){return v},this.getFoveation=function(){if(!(d===null&&f===null))return c},this.setFoveation=function(q){c=q,d!==null&&(d.fixedFoveation=q),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=q)},this.hasDepthSensing=function(){return g.texture!==null},this.getDepthSensingMesh=function(){return g.getMesh(v)};let re=null;function de(q,Z){if(u=Z.getViewerPose(l||a),p=Z,u!==null){const ge=u.views;f!==null&&(e.setRenderTargetFramebuffer(E,f.framebuffer),e.setRenderTarget(E));let le=!1;ge.length!==v.cameras.length&&(v.cameras.length=0,le=!0);for(let Re=0;Re<ge.length;Re++){const pt=ge[Re];let At=null;if(f!==null)At=f.getViewport(pt);else{const D=h.getViewSubImage(d,pt);At=D.viewport,Re===0&&(e.setRenderTargetTextures(E,D.colorTexture,D.depthStencilTexture),e.setRenderTarget(E))}let je=x[Re];je===void 0&&(je=new Xt,je.layers.enable(Re),je.viewport=new it,x[Re]=je),je.matrix.fromArray(pt.transform.matrix),je.matrix.decompose(je.position,je.quaternion,je.scale),je.projectionMatrix.fromArray(pt.projectionMatrix),je.projectionMatrixInverse.copy(je.projectionMatrix).invert(),je.viewport.set(At.x,At.y,At.width,At.height),Re===0&&(v.matrix.copy(je.matrix),v.matrix.decompose(v.position,v.quaternion,v.scale)),le===!0&&v.cameras.push(je)}const ve=i.enabledFeatures;if(ve&&ve.includes("depth-sensing")&&i.depthUsage=="gpu-optimized"&&h){const Re=h.getDepthInformation(ge[0]);Re&&Re.isValid&&Re.texture&&g.init(e,Re,i.renderState)}}for(let ge=0;ge<_.length;ge++){const le=b[ge],ve=_[ge];le!==null&&ve!==void 0&&ve.update(le,Z,l||a)}re&&re(q,Z),Z.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:Z}),p=null}const Ce=new Hg;Ce.setAnimationLoop(de),this.setAnimationLoop=function(q){re=q},this.dispose=function(){}}}const ls=new Pn,FC=new Pe;function PC(r,e){function t(m,A){m.matrixAutoUpdate===!0&&m.updateMatrix(),A.value.copy(m.matrix)}function n(m,A){A.color.getRGB(m.fogColor.value,Mg(r)),A.isFog?(m.fogNear.value=A.near,m.fogFar.value=A.far):A.isFogExp2&&(m.fogDensity.value=A.density)}function i(m,A,E,_,b){A.isMeshBasicMaterial||A.isMeshLambertMaterial?s(m,A):A.isMeshToonMaterial?(s(m,A),h(m,A)):A.isMeshPhongMaterial?(s(m,A),u(m,A)):A.isMeshStandardMaterial?(s(m,A),d(m,A),A.isMeshPhysicalMaterial&&f(m,A,b)):A.isMeshMatcapMaterial?(s(m,A),p(m,A)):A.isMeshDepthMaterial?s(m,A):A.isMeshDistanceMaterial?(s(m,A),g(m,A)):A.isMeshNormalMaterial?s(m,A):A.isLineBasicMaterial?(a(m,A),A.isLineDashedMaterial&&o(m,A)):A.isPointsMaterial?c(m,A,E,_):A.isSpriteMaterial?l(m,A):A.isShadowMaterial?(m.color.value.copy(A.color),m.opacity.value=A.opacity):A.isShaderMaterial&&(A.uniformsNeedUpdate=!1)}function s(m,A){m.opacity.value=A.opacity,A.color&&m.diffuse.value.copy(A.color),A.emissive&&m.emissive.value.copy(A.emissive).multiplyScalar(A.emissiveIntensity),A.map&&(m.map.value=A.map,t(A.map,m.mapTransform)),A.alphaMap&&(m.alphaMap.value=A.alphaMap,t(A.alphaMap,m.alphaMapTransform)),A.bumpMap&&(m.bumpMap.value=A.bumpMap,t(A.bumpMap,m.bumpMapTransform),m.bumpScale.value=A.bumpScale,A.side===$t&&(m.bumpScale.value*=-1)),A.normalMap&&(m.normalMap.value=A.normalMap,t(A.normalMap,m.normalMapTransform),m.normalScale.value.copy(A.normalScale),A.side===$t&&m.normalScale.value.negate()),A.displacementMap&&(m.displacementMap.value=A.displacementMap,t(A.displacementMap,m.displacementMapTransform),m.displacementScale.value=A.displacementScale,m.displacementBias.value=A.displacementBias),A.emissiveMap&&(m.emissiveMap.value=A.emissiveMap,t(A.emissiveMap,m.emissiveMapTransform)),A.specularMap&&(m.specularMap.value=A.specularMap,t(A.specularMap,m.specularMapTransform)),A.alphaTest>0&&(m.alphaTest.value=A.alphaTest);const E=e.get(A),_=E.envMap,b=E.envMapRotation;_&&(m.envMap.value=_,ls.copy(b),ls.x*=-1,ls.y*=-1,ls.z*=-1,_.isCubeTexture&&_.isRenderTargetTexture===!1&&(ls.y*=-1,ls.z*=-1),m.envMapRotation.value.setFromMatrix4(FC.makeRotationFromEuler(ls)),m.flipEnvMap.value=_.isCubeTexture&&_.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=A.reflectivity,m.ior.value=A.ior,m.refractionRatio.value=A.refractionRatio),A.lightMap&&(m.lightMap.value=A.lightMap,m.lightMapIntensity.value=A.lightMapIntensity,t(A.lightMap,m.lightMapTransform)),A.aoMap&&(m.aoMap.value=A.aoMap,m.aoMapIntensity.value=A.aoMapIntensity,t(A.aoMap,m.aoMapTransform))}function a(m,A){m.diffuse.value.copy(A.color),m.opacity.value=A.opacity,A.map&&(m.map.value=A.map,t(A.map,m.mapTransform))}function o(m,A){m.dashSize.value=A.dashSize,m.totalSize.value=A.dashSize+A.gapSize,m.scale.value=A.scale}function c(m,A,E,_){m.diffuse.value.copy(A.color),m.opacity.value=A.opacity,m.size.value=A.size*E,m.scale.value=_*.5,A.map&&(m.map.value=A.map,t(A.map,m.uvTransform)),A.alphaMap&&(m.alphaMap.value=A.alphaMap,t(A.alphaMap,m.alphaMapTransform)),A.alphaTest>0&&(m.alphaTest.value=A.alphaTest)}function l(m,A){m.diffuse.value.copy(A.color),m.opacity.value=A.opacity,m.rotation.value=A.rotation,A.map&&(m.map.value=A.map,t(A.map,m.mapTransform)),A.alphaMap&&(m.alphaMap.value=A.alphaMap,t(A.alphaMap,m.alphaMapTransform)),A.alphaTest>0&&(m.alphaTest.value=A.alphaTest)}function u(m,A){m.specular.value.copy(A.specular),m.shininess.value=Math.max(A.shininess,1e-4)}function h(m,A){A.gradientMap&&(m.gradientMap.value=A.gradientMap)}function d(m,A){m.metalness.value=A.metalness,A.metalnessMap&&(m.metalnessMap.value=A.metalnessMap,t(A.metalnessMap,m.metalnessMapTransform)),m.roughness.value=A.roughness,A.roughnessMap&&(m.roughnessMap.value=A.roughnessMap,t(A.roughnessMap,m.roughnessMapTransform)),A.envMap&&(m.envMapIntensity.value=A.envMapIntensity)}function f(m,A,E){m.ior.value=A.ior,A.sheen>0&&(m.sheenColor.value.copy(A.sheenColor).multiplyScalar(A.sheen),m.sheenRoughness.value=A.sheenRoughness,A.sheenColorMap&&(m.sheenColorMap.value=A.sheenColorMap,t(A.sheenColorMap,m.sheenColorMapTransform)),A.sheenRoughnessMap&&(m.sheenRoughnessMap.value=A.sheenRoughnessMap,t(A.sheenRoughnessMap,m.sheenRoughnessMapTransform))),A.clearcoat>0&&(m.clearcoat.value=A.clearcoat,m.clearcoatRoughness.value=A.clearcoatRoughness,A.clearcoatMap&&(m.clearcoatMap.value=A.clearcoatMap,t(A.clearcoatMap,m.clearcoatMapTransform)),A.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=A.clearcoatRoughnessMap,t(A.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),A.clearcoatNormalMap&&(m.clearcoatNormalMap.value=A.clearcoatNormalMap,t(A.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(A.clearcoatNormalScale),A.side===$t&&m.clearcoatNormalScale.value.negate())),A.dispersion>0&&(m.dispersion.value=A.dispersion),A.iridescence>0&&(m.iridescence.value=A.iridescence,m.iridescenceIOR.value=A.iridescenceIOR,m.iridescenceThicknessMinimum.value=A.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=A.iridescenceThicknessRange[1],A.iridescenceMap&&(m.iridescenceMap.value=A.iridescenceMap,t(A.iridescenceMap,m.iridescenceMapTransform)),A.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=A.iridescenceThicknessMap,t(A.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),A.transmission>0&&(m.transmission.value=A.transmission,m.transmissionSamplerMap.value=E.texture,m.transmissionSamplerSize.value.set(E.width,E.height),A.transmissionMap&&(m.transmissionMap.value=A.transmissionMap,t(A.transmissionMap,m.transmissionMapTransform)),m.thickness.value=A.thickness,A.thicknessMap&&(m.thicknessMap.value=A.thicknessMap,t(A.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=A.attenuationDistance,m.attenuationColor.value.copy(A.attenuationColor)),A.anisotropy>0&&(m.anisotropyVector.value.set(A.anisotropy*Math.cos(A.anisotropyRotation),A.anisotropy*Math.sin(A.anisotropyRotation)),A.anisotropyMap&&(m.anisotropyMap.value=A.anisotropyMap,t(A.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=A.specularIntensity,m.specularColor.value.copy(A.specularColor),A.specularColorMap&&(m.specularColorMap.value=A.specularColorMap,t(A.specularColorMap,m.specularColorMapTransform)),A.specularIntensityMap&&(m.specularIntensityMap.value=A.specularIntensityMap,t(A.specularIntensityMap,m.specularIntensityMapTransform))}function p(m,A){A.matcap&&(m.matcap.value=A.matcap)}function g(m,A){const E=e.get(A).light;m.referencePosition.value.setFromMatrixPosition(E.matrixWorld),m.nearDistance.value=E.shadow.camera.near,m.farDistance.value=E.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function UC(r,e,t,n){let i={},s={},a=[];const o=r.getParameter(r.MAX_UNIFORM_BUFFER_BINDINGS);function c(E,_){const b=_.program;n.uniformBlockBinding(E,b)}function l(E,_){let b=i[E.id];b===void 0&&(p(E),b=u(E),i[E.id]=b,E.addEventListener("dispose",m));const S=_.program;n.updateUBOMapping(E,S);const I=e.render.frame;s[E.id]!==I&&(d(E),s[E.id]=I)}function u(E){const _=h();E.__bindingPointIndex=_;const b=r.createBuffer(),S=E.__size,I=E.usage;return r.bindBuffer(r.UNIFORM_BUFFER,b),r.bufferData(r.UNIFORM_BUFFER,S,I),r.bindBuffer(r.UNIFORM_BUFFER,null),r.bindBufferBase(r.UNIFORM_BUFFER,_,b),b}function h(){for(let E=0;E<o;E++)if(a.indexOf(E)===-1)return a.push(E),E;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(E){const _=i[E.id],b=E.uniforms,S=E.__cache;r.bindBuffer(r.UNIFORM_BUFFER,_);for(let I=0,M=b.length;I<M;I++){const w=Array.isArray(b[I])?b[I]:[b[I]];for(let x=0,v=w.length;x<v;x++){const R=w[x];if(f(R,I,x,S)===!0){const k=R.__offset,F=Array.isArray(R.value)?R.value:[R.value];let P=0;for(let G=0;G<F.length;G++){const O=F[G],W=g(O);typeof O=="number"||typeof O=="boolean"?(R.__data[0]=O,r.bufferSubData(r.UNIFORM_BUFFER,k+P,R.__data)):O.isMatrix3?(R.__data[0]=O.elements[0],R.__data[1]=O.elements[1],R.__data[2]=O.elements[2],R.__data[3]=0,R.__data[4]=O.elements[3],R.__data[5]=O.elements[4],R.__data[6]=O.elements[5],R.__data[7]=0,R.__data[8]=O.elements[6],R.__data[9]=O.elements[7],R.__data[10]=O.elements[8],R.__data[11]=0):(O.toArray(R.__data,P),P+=W.storage/Float32Array.BYTES_PER_ELEMENT)}r.bufferSubData(r.UNIFORM_BUFFER,k,R.__data)}}}r.bindBuffer(r.UNIFORM_BUFFER,null)}function f(E,_,b,S){const I=E.value,M=_+"_"+b;if(S[M]===void 0)return typeof I=="number"||typeof I=="boolean"?S[M]=I:S[M]=I.clone(),!0;{const w=S[M];if(typeof I=="number"||typeof I=="boolean"){if(w!==I)return S[M]=I,!0}else if(w.equals(I)===!1)return w.copy(I),!0}return!1}function p(E){const _=E.uniforms;let b=0;const S=16;for(let M=0,w=_.length;M<w;M++){const x=Array.isArray(_[M])?_[M]:[_[M]];for(let v=0,R=x.length;v<R;v++){const k=x[v],F=Array.isArray(k.value)?k.value:[k.value];for(let P=0,G=F.length;P<G;P++){const O=F[P],W=g(O),Q=b%S,Y=Q%W.boundary,ne=Q+Y;b+=Y,ne!==0&&S-ne<W.storage&&(b+=S-ne),k.__data=new Float32Array(W.storage/Float32Array.BYTES_PER_ELEMENT),k.__offset=b,b+=W.storage}}}const I=b%S;return I>0&&(b+=S-I),E.__size=b,E.__cache={},this}function g(E){const _={boundary:0,storage:0};return typeof E=="number"||typeof E=="boolean"?(_.boundary=4,_.storage=4):E.isVector2?(_.boundary=8,_.storage=8):E.isVector3||E.isColor?(_.boundary=16,_.storage=12):E.isVector4?(_.boundary=16,_.storage=16):E.isMatrix3?(_.boundary=48,_.storage=48):E.isMatrix4?(_.boundary=64,_.storage=64):E.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",E),_}function m(E){const _=E.target;_.removeEventListener("dispose",m);const b=a.indexOf(_.__bindingPointIndex);a.splice(b,1),r.deleteBuffer(i[_.id]),delete i[_.id],delete s[_.id]}function A(){for(const E in i)r.deleteBuffer(i[E]);a=[],i={},s={}}return{bind:c,update:l,dispose:A}}class Xg{constructor(e={}){const{canvas:t=D_(),context:n=null,depth:i=!0,stencil:s=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1,reverseDepthBuffer:d=!1}=e;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=n.getContextAttributes().alpha}else f=a;const p=new Uint32Array(4),g=new Int32Array(4);let m=null,A=null;const E=[],_=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=si,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const b=this;let S=!1;this._outputColorSpace=gt;let I=0,M=0,w=null,x=-1,v=null;const R=new it,k=new it;let F=null;const P=new Me(0);let G=0,O=t.width,W=t.height,Q=1,Y=null,ne=null;const re=new it(0,0,O,W),de=new it(0,0,O,W);let Ce=!1;const q=new Sd;let Z=!1,ge=!1;const le=new Pe,ve=new Pe,Ze=new B,Re=new it,pt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let At=!1;function je(){return w===null?Q:1}let D=n;function tn(C,U){return t.getContext(C,U)}try{const C={alpha:!0,depth:i,stencil:s,antialias:o,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Jc}`),t.addEventListener("webglcontextlost",me,!1),t.addEventListener("webglcontextrestored",ie,!1),t.addEventListener("webglcontextcreationerror",j,!1),D===null){const U="webgl2";if(D=tn(U,C),D===null)throw tn(U)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(C){throw console.error("THREE.WebGLRenderer: "+C.message),C}let nt,mt,xe,et,we,He,Ot,T,y,H,$,K,X,ye,ce,Ee,Se,J,fe,Le,Be,ae,ke,L;function he(){nt=new Xy(D),nt.init(),ae=new TC(D,nt),mt=new Qy(D,nt,e,ae),xe=new MC(D,nt),mt.reverseDepthBuffer&&d&&xe.buffers.depth.setReversed(!0),et=new Yy(D),we=new pC,He=new wC(D,nt,xe,we,mt,ae,et),Ot=new Hy(b),T=new qy(b),y=new nv(D),ke=new Oy(D,y),H=new $y(D,y,et,ke),$=new Jy(D,H,y,et),fe=new Ky(D,mt,He),Ee=new Gy(we),K=new fC(b,Ot,T,nt,mt,ke,Ee),X=new PC(b,we),ye=new mC,ce=new xC(nt),J=new Ny(b,Ot,T,xe,$,f,c),Se=new CC(b,$,mt),L=new UC(D,et,mt,xe),Le=new ky(D,nt,et),Be=new jy(D,nt,et),et.programs=K.programs,b.capabilities=mt,b.extensions=nt,b.properties=we,b.renderLists=ye,b.shadowMap=Se,b.state=xe,b.info=et}he();const te=new LC(b,D);this.xr=te,this.getContext=function(){return D},this.getContextAttributes=function(){return D.getContextAttributes()},this.forceContextLoss=function(){const C=nt.get("WEBGL_lose_context");C&&C.loseContext()},this.forceContextRestore=function(){const C=nt.get("WEBGL_lose_context");C&&C.restoreContext()},this.getPixelRatio=function(){return Q},this.setPixelRatio=function(C){C!==void 0&&(Q=C,this.setSize(O,W,!1))},this.getSize=function(C){return C.set(O,W)},this.setSize=function(C,U,z=!0){if(te.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}O=C,W=U,t.width=Math.floor(C*Q),t.height=Math.floor(U*Q),z===!0&&(t.style.width=C+"px",t.style.height=U+"px"),this.setViewport(0,0,C,U)},this.getDrawingBufferSize=function(C){return C.set(O*Q,W*Q).floor()},this.setDrawingBufferSize=function(C,U,z){O=C,W=U,Q=z,t.width=Math.floor(C*z),t.height=Math.floor(U*z),this.setViewport(0,0,C,U)},this.getCurrentViewport=function(C){return C.copy(R)},this.getViewport=function(C){return C.copy(re)},this.setViewport=function(C,U,z,V){C.isVector4?re.set(C.x,C.y,C.z,C.w):re.set(C,U,z,V),xe.viewport(R.copy(re).multiplyScalar(Q).round())},this.getScissor=function(C){return C.copy(de)},this.setScissor=function(C,U,z,V){C.isVector4?de.set(C.x,C.y,C.z,C.w):de.set(C,U,z,V),xe.scissor(k.copy(de).multiplyScalar(Q).round())},this.getScissorTest=function(){return Ce},this.setScissorTest=function(C){xe.setScissorTest(Ce=C)},this.setOpaqueSort=function(C){Y=C},this.setTransparentSort=function(C){ne=C},this.getClearColor=function(C){return C.copy(J.getClearColor())},this.setClearColor=function(){J.setClearColor(...arguments)},this.getClearAlpha=function(){return J.getClearAlpha()},this.setClearAlpha=function(){J.setClearAlpha(...arguments)},this.clear=function(C=!0,U=!0,z=!0){let V=0;if(C){let N=!1;if(w!==null){const se=w.texture.format;N=se===gd||se===md||se===Ad}if(N){const se=w.texture.type,ue=se===Mt||se===es||se===Xa||se===$a||se===fd||se===pd,_e=J.getClearColor(),pe=J.getClearAlpha(),Ue=_e.r,Ne=_e.g,Ie=_e.b;ue?(p[0]=Ue,p[1]=Ne,p[2]=Ie,p[3]=pe,D.clearBufferuiv(D.COLOR,0,p)):(g[0]=Ue,g[1]=Ne,g[2]=Ie,g[3]=pe,D.clearBufferiv(D.COLOR,0,g))}else V|=D.COLOR_BUFFER_BIT}U&&(V|=D.DEPTH_BUFFER_BIT),z&&(V|=D.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),D.clear(V)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",me,!1),t.removeEventListener("webglcontextrestored",ie,!1),t.removeEventListener("webglcontextcreationerror",j,!1),J.dispose(),ye.dispose(),ce.dispose(),we.dispose(),Ot.dispose(),T.dispose(),$.dispose(),ke.dispose(),L.dispose(),K.dispose(),te.dispose(),te.removeEventListener("sessionstart",Nd),te.removeEventListener("sessionend",Od),ns.stop()};function me(C){C.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),S=!0}function ie(){console.log("THREE.WebGLRenderer: Context Restored."),S=!1;const C=et.autoReset,U=Se.enabled,z=Se.autoUpdate,V=Se.needsUpdate,N=Se.type;he(),et.autoReset=C,Se.enabled=U,Se.autoUpdate=z,Se.needsUpdate=V,Se.type=N}function j(C){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",C.statusMessage)}function be(C){const U=C.target;U.removeEventListener("dispose",be),Ge(U)}function Ge(C){_t(C),we.remove(C)}function _t(C){const U=we.get(C).programs;U!==void 0&&(U.forEach(function(z){K.releaseProgram(z)}),C.isShaderMaterial&&K.releaseShaderCache(C))}this.renderBufferDirect=function(C,U,z,V,N,se){U===null&&(U=pt);const ue=N.isMesh&&N.matrixWorld.determinant()<0,_e=pb(C,U,z,V,N);xe.setMaterial(V,ue);let pe=z.index,Ue=1;if(V.wireframe===!0){if(pe=H.getWireframeAttribute(z),pe===void 0)return;Ue=2}const Ne=z.drawRange,Ie=z.attributes.position;let $e=Ne.start*Ue,lt=(Ne.start+Ne.count)*Ue;se!==null&&($e=Math.max($e,se.start*Ue),lt=Math.min(lt,(se.start+se.count)*Ue)),pe!==null?($e=Math.max($e,0),lt=Math.min(lt,pe.count)):Ie!=null&&($e=Math.max($e,0),lt=Math.min(lt,Ie.count));const Bt=lt-$e;if(Bt<0||Bt===1/0)return;ke.setup(N,V,_e,z,pe);let Et,dt=Le;if(pe!==null&&(Et=y.get(pe),dt=Be,dt.setIndex(Et)),N.isMesh)V.wireframe===!0?(xe.setLineWidth(V.wireframeLinewidth*je()),dt.setMode(D.LINES)):dt.setMode(D.TRIANGLES);else if(N.isLine){let Te=V.linewidth;Te===void 0&&(Te=1),xe.setLineWidth(Te*je()),N.isLineSegments?dt.setMode(D.LINES):N.isLineLoop?dt.setMode(D.LINE_LOOP):dt.setMode(D.LINE_STRIP)}else N.isPoints?dt.setMode(D.POINTS):N.isSprite&&dt.setMode(D.TRIANGLES);if(N.isBatchedMesh)if(N._multiDrawInstances!==null)Lr("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),dt.renderMultiDrawInstances(N._multiDrawStarts,N._multiDrawCounts,N._multiDrawCount,N._multiDrawInstances);else if(nt.get("WEBGL_multi_draw"))dt.renderMultiDraw(N._multiDrawStarts,N._multiDrawCounts,N._multiDrawCount);else{const Te=N._multiDrawStarts,Tt=N._multiDrawCounts,tt=N._multiDrawCount,mn=pe?y.get(pe).bytesPerElement:1,Hs=we.get(V).currentProgram.getUniforms();for(let gn=0;gn<tt;gn++)Hs.setValue(D,"_gl_DrawID",gn),dt.render(Te[gn]/mn,Tt[gn])}else if(N.isInstancedMesh)dt.renderInstances($e,Bt,N.count);else if(z.isInstancedBufferGeometry){const Te=z._maxInstanceCount!==void 0?z._maxInstanceCount:1/0,Tt=Math.min(z.instanceCount,Te);dt.renderInstances($e,Bt,Tt)}else dt.render($e,Bt)};function rt(C,U,z){C.transparent===!0&&C.side===Vt&&C.forceSinglePass===!1?(C.side=$t,C.needsUpdate=!0,mo(C,U,z),C.side=Xn,C.needsUpdate=!0,mo(C,U,z),C.side=Vt):mo(C,U,z)}this.compile=function(C,U,z=null){z===null&&(z=C),A=ce.get(z),A.init(U),_.push(A),z.traverseVisible(function(N){N.isLight&&N.layers.test(U.layers)&&(A.pushLight(N),N.castShadow&&A.pushShadow(N))}),C!==z&&C.traverseVisible(function(N){N.isLight&&N.layers.test(U.layers)&&(A.pushLight(N),N.castShadow&&A.pushShadow(N))}),A.setupLights();const V=new Set;return C.traverse(function(N){if(!(N.isMesh||N.isPoints||N.isLine||N.isSprite))return;const se=N.material;if(se)if(Array.isArray(se))for(let ue=0;ue<se.length;ue++){const _e=se[ue];rt(_e,z,N),V.add(_e)}else rt(se,z,N),V.add(se)}),A=_.pop(),V},this.compileAsync=function(C,U,z=null){const V=this.compile(C,U,z);return new Promise(N=>{function se(){if(V.forEach(function(ue){we.get(ue).currentProgram.isReady()&&V.delete(ue)}),V.size===0){N(C);return}setTimeout(se,10)}nt.get("KHR_parallel_shader_compile")!==null?se():setTimeout(se,10)})};let Nn=null;function li(C){Nn&&Nn(C)}function Nd(){ns.stop()}function Od(){ns.start()}const ns=new Hg;ns.setAnimationLoop(li),typeof self<"u"&&ns.setContext(self),this.setAnimationLoop=function(C){Nn=C,te.setAnimationLoop(C),C===null?ns.stop():ns.start()},te.addEventListener("sessionstart",Nd),te.addEventListener("sessionend",Od),this.render=function(C,U){if(U!==void 0&&U.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(S===!0)return;if(C.matrixWorldAutoUpdate===!0&&C.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),te.enabled===!0&&te.isPresenting===!0&&(te.cameraAutoUpdate===!0&&te.updateCamera(U),U=te.getCamera()),C.isScene===!0&&C.onBeforeRender(b,C,U,w),A=ce.get(C,_.length),A.init(U),_.push(A),ve.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),q.setFromProjectionMatrix(ve),ge=this.localClippingEnabled,Z=Ee.init(this.clippingPlanes,ge),m=ye.get(C,E.length),m.init(),E.push(m),te.enabled===!0&&te.isPresenting===!0){const se=b.xr.getDepthSensingMesh();se!==null&&ll(se,U,-1/0,b.sortObjects)}ll(C,U,0,b.sortObjects),m.finish(),b.sortObjects===!0&&m.sort(Y,ne),At=te.enabled===!1||te.isPresenting===!1||te.hasDepthSensing()===!1,At&&J.addToRenderList(m,C),this.info.render.frame++,Z===!0&&Ee.beginShadows();const z=A.state.shadowsArray;Se.render(z,C,U),Z===!0&&Ee.endShadows(),this.info.autoReset===!0&&this.info.reset();const V=m.opaque,N=m.transmissive;if(A.setupLights(),U.isArrayCamera){const se=U.cameras;if(N.length>0)for(let ue=0,_e=se.length;ue<_e;ue++){const pe=se[ue];Qd(V,N,C,pe)}At&&J.render(C);for(let ue=0,_e=se.length;ue<_e;ue++){const pe=se[ue];kd(m,C,pe,pe.viewport)}}else N.length>0&&Qd(V,N,C,U),At&&J.render(C),kd(m,C,U);w!==null&&M===0&&(He.updateMultisampleRenderTarget(w),He.updateRenderTargetMipmap(w)),C.isScene===!0&&C.onAfterRender(b,C,U),ke.resetDefaultState(),x=-1,v=null,_.pop(),_.length>0?(A=_[_.length-1],Z===!0&&Ee.setGlobalState(b.clippingPlanes,A.state.camera)):A=null,E.pop(),E.length>0?m=E[E.length-1]:m=null};function ll(C,U,z,V){if(C.visible===!1)return;if(C.layers.test(U.layers)){if(C.isGroup)z=C.renderOrder;else if(C.isLOD)C.autoUpdate===!0&&C.update(U);else if(C.isLight)A.pushLight(C),C.castShadow&&A.pushShadow(C);else if(C.isSprite){if(!C.frustumCulled||q.intersectsSprite(C)){V&&Re.setFromMatrixPosition(C.matrixWorld).applyMatrix4(ve);const ue=$.update(C),_e=C.material;_e.visible&&m.push(C,ue,_e,z,Re.z,null)}}else if((C.isMesh||C.isLine||C.isPoints)&&(!C.frustumCulled||q.intersectsObject(C))){const ue=$.update(C),_e=C.material;if(V&&(C.boundingSphere!==void 0?(C.boundingSphere===null&&C.computeBoundingSphere(),Re.copy(C.boundingSphere.center)):(ue.boundingSphere===null&&ue.computeBoundingSphere(),Re.copy(ue.boundingSphere.center)),Re.applyMatrix4(C.matrixWorld).applyMatrix4(ve)),Array.isArray(_e)){const pe=ue.groups;for(let Ue=0,Ne=pe.length;Ue<Ne;Ue++){const Ie=pe[Ue],$e=_e[Ie.materialIndex];$e&&$e.visible&&m.push(C,ue,$e,z,Re.z,Ie)}}else _e.visible&&m.push(C,ue,_e,z,Re.z,null)}}const se=C.children;for(let ue=0,_e=se.length;ue<_e;ue++)ll(se[ue],U,z,V)}function kd(C,U,z,V){const N=C.opaque,se=C.transmissive,ue=C.transparent;A.setupLightsView(z),Z===!0&&Ee.setGlobalState(b.clippingPlanes,z),V&&xe.viewport(R.copy(V)),N.length>0&&Ao(N,U,z),se.length>0&&Ao(se,U,z),ue.length>0&&Ao(ue,U,z),xe.buffers.depth.setTest(!0),xe.buffers.depth.setMask(!0),xe.buffers.color.setMask(!0),xe.setPolygonOffset(!1)}function Qd(C,U,z,V){if((z.isScene===!0?z.overrideMaterial:null)!==null)return;A.state.transmissionRenderTarget[V.id]===void 0&&(A.state.transmissionRenderTarget[V.id]=new Fn(1,1,{generateMipmaps:!0,type:nt.has("EXT_color_buffer_half_float")||nt.has("EXT_color_buffer_float")?Ut:Mt,minFilter:un,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Ye.workingColorSpace}));const se=A.state.transmissionRenderTarget[V.id],ue=V.viewport||R;se.setSize(ue.z*b.transmissionResolutionScale,ue.w*b.transmissionResolutionScale);const _e=b.getRenderTarget(),pe=b.getActiveCubeFace(),Ue=b.getActiveMipmapLevel();b.setRenderTarget(se),b.getClearColor(P),G=b.getClearAlpha(),G<1&&b.setClearColor(16777215,.5),b.clear(),At&&J.render(z);const Ne=b.toneMapping;b.toneMapping=si;const Ie=V.viewport;if(V.viewport!==void 0&&(V.viewport=void 0),A.setupLightsView(V),Z===!0&&Ee.setGlobalState(b.clippingPlanes,V),Ao(C,z,V),He.updateMultisampleRenderTarget(se),He.updateRenderTargetMipmap(se),nt.has("WEBGL_multisampled_render_to_texture")===!1){let $e=!1;for(let lt=0,Bt=U.length;lt<Bt;lt++){const Et=U[lt],dt=Et.object,Te=Et.geometry,Tt=Et.material,tt=Et.group;if(Tt.side===Vt&&dt.layers.test(V.layers)){const mn=Tt.side;Tt.side=$t,Tt.needsUpdate=!0,Gd(dt,z,V,Te,Tt,tt),Tt.side=mn,Tt.needsUpdate=!0,$e=!0}}$e===!0&&(He.updateMultisampleRenderTarget(se),He.updateRenderTargetMipmap(se))}b.setRenderTarget(_e,pe,Ue),b.setClearColor(P,G),Ie!==void 0&&(V.viewport=Ie),b.toneMapping=Ne}function Ao(C,U,z){const V=U.isScene===!0?U.overrideMaterial:null;for(let N=0,se=C.length;N<se;N++){const ue=C[N],_e=ue.object,pe=ue.geometry,Ue=ue.group;let Ne=ue.material;Ne.allowOverride===!0&&V!==null&&(Ne=V),_e.layers.test(z.layers)&&Gd(_e,U,z,pe,Ne,Ue)}}function Gd(C,U,z,V,N,se){C.onBeforeRender(b,U,z,V,N,se),C.modelViewMatrix.multiplyMatrices(z.matrixWorldInverse,C.matrixWorld),C.normalMatrix.getNormalMatrix(C.modelViewMatrix),N.onBeforeRender(b,U,z,V,C,se),N.transparent===!0&&N.side===Vt&&N.forceSinglePass===!1?(N.side=$t,N.needsUpdate=!0,b.renderBufferDirect(z,U,V,N,C,se),N.side=Xn,N.needsUpdate=!0,b.renderBufferDirect(z,U,V,N,C,se),N.side=Vt):b.renderBufferDirect(z,U,V,N,C,se),C.onAfterRender(b,U,z,V,N,se)}function mo(C,U,z){U.isScene!==!0&&(U=pt);const V=we.get(C),N=A.state.lights,se=A.state.shadowsArray,ue=N.state.version,_e=K.getParameters(C,N.state,se,U,z),pe=K.getProgramCacheKey(_e);let Ue=V.programs;V.environment=C.isMeshStandardMaterial?U.environment:null,V.fog=U.fog,V.envMap=(C.isMeshStandardMaterial?T:Ot).get(C.envMap||V.environment),V.envMapRotation=V.environment!==null&&C.envMap===null?U.environmentRotation:C.envMapRotation,Ue===void 0&&(C.addEventListener("dispose",be),Ue=new Map,V.programs=Ue);let Ne=Ue.get(pe);if(Ne!==void 0){if(V.currentProgram===Ne&&V.lightsStateVersion===ue)return zd(C,_e),Ne}else _e.uniforms=K.getUniforms(C),C.onBeforeCompile(_e,b),Ne=K.acquireProgram(_e,pe),Ue.set(pe,Ne),V.uniforms=_e.uniforms;const Ie=V.uniforms;return(!C.isShaderMaterial&&!C.isRawShaderMaterial||C.clipping===!0)&&(Ie.clippingPlanes=Ee.uniform),zd(C,_e),V.needsLights=mb(C),V.lightsStateVersion=ue,V.needsLights&&(Ie.ambientLightColor.value=N.state.ambient,Ie.lightProbe.value=N.state.probe,Ie.directionalLights.value=N.state.directional,Ie.directionalLightShadows.value=N.state.directionalShadow,Ie.spotLights.value=N.state.spot,Ie.spotLightShadows.value=N.state.spotShadow,Ie.rectAreaLights.value=N.state.rectArea,Ie.ltc_1.value=N.state.rectAreaLTC1,Ie.ltc_2.value=N.state.rectAreaLTC2,Ie.pointLights.value=N.state.point,Ie.pointLightShadows.value=N.state.pointShadow,Ie.hemisphereLights.value=N.state.hemi,Ie.directionalShadowMap.value=N.state.directionalShadowMap,Ie.directionalShadowMatrix.value=N.state.directionalShadowMatrix,Ie.spotShadowMap.value=N.state.spotShadowMap,Ie.spotLightMatrix.value=N.state.spotLightMatrix,Ie.spotLightMap.value=N.state.spotLightMap,Ie.pointShadowMap.value=N.state.pointShadowMap,Ie.pointShadowMatrix.value=N.state.pointShadowMatrix),V.currentProgram=Ne,V.uniformsList=null,Ne}function Hd(C){if(C.uniformsList===null){const U=C.currentProgram.getUniforms();C.uniformsList=vc.seqWithValue(U.seq,C.uniforms)}return C.uniformsList}function zd(C,U){const z=we.get(C);z.outputColorSpace=U.outputColorSpace,z.batching=U.batching,z.batchingColor=U.batchingColor,z.instancing=U.instancing,z.instancingColor=U.instancingColor,z.instancingMorph=U.instancingMorph,z.skinning=U.skinning,z.morphTargets=U.morphTargets,z.morphNormals=U.morphNormals,z.morphColors=U.morphColors,z.morphTargetsCount=U.morphTargetsCount,z.numClippingPlanes=U.numClippingPlanes,z.numIntersection=U.numClipIntersection,z.vertexAlphas=U.vertexAlphas,z.vertexTangents=U.vertexTangents,z.toneMapping=U.toneMapping}function pb(C,U,z,V,N){U.isScene!==!0&&(U=pt),He.resetTextureUnits();const se=U.fog,ue=V.isMeshStandardMaterial?U.environment:null,_e=w===null?b.outputColorSpace:w.isXRRenderTarget===!0?w.texture.colorSpace:bt,pe=(V.isMeshStandardMaterial?T:Ot).get(V.envMap||ue),Ue=V.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,Ne=!!z.attributes.tangent&&(!!V.normalMap||V.anisotropy>0),Ie=!!z.morphAttributes.position,$e=!!z.morphAttributes.normal,lt=!!z.morphAttributes.color;let Bt=si;V.toneMapped&&(w===null||w.isXRRenderTarget===!0)&&(Bt=b.toneMapping);const Et=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,dt=Et!==void 0?Et.length:0,Te=we.get(V),Tt=A.state.lights;if(Z===!0&&(ge===!0||C!==v)){const nn=C===v&&V.id===x;Ee.setState(V,C,nn)}let tt=!1;V.version===Te.__version?(Te.needsLights&&Te.lightsStateVersion!==Tt.state.version||Te.outputColorSpace!==_e||N.isBatchedMesh&&Te.batching===!1||!N.isBatchedMesh&&Te.batching===!0||N.isBatchedMesh&&Te.batchingColor===!0&&N.colorTexture===null||N.isBatchedMesh&&Te.batchingColor===!1&&N.colorTexture!==null||N.isInstancedMesh&&Te.instancing===!1||!N.isInstancedMesh&&Te.instancing===!0||N.isSkinnedMesh&&Te.skinning===!1||!N.isSkinnedMesh&&Te.skinning===!0||N.isInstancedMesh&&Te.instancingColor===!0&&N.instanceColor===null||N.isInstancedMesh&&Te.instancingColor===!1&&N.instanceColor!==null||N.isInstancedMesh&&Te.instancingMorph===!0&&N.morphTexture===null||N.isInstancedMesh&&Te.instancingMorph===!1&&N.morphTexture!==null||Te.envMap!==pe||V.fog===!0&&Te.fog!==se||Te.numClippingPlanes!==void 0&&(Te.numClippingPlanes!==Ee.numPlanes||Te.numIntersection!==Ee.numIntersection)||Te.vertexAlphas!==Ue||Te.vertexTangents!==Ne||Te.morphTargets!==Ie||Te.morphNormals!==$e||Te.morphColors!==lt||Te.toneMapping!==Bt||Te.morphTargetsCount!==dt)&&(tt=!0):(tt=!0,Te.__version=V.version);let mn=Te.currentProgram;tt===!0&&(mn=mo(V,U,N));let Hs=!1,gn=!1,na=!1;const It=mn.getUniforms(),In=Te.uniforms;if(xe.useProgram(mn.program)&&(Hs=!0,gn=!0,na=!0),V.id!==x&&(x=V.id,gn=!0),Hs||v!==C){xe.buffers.depth.getReversed()?(le.copy(C.projectionMatrix),F_(le),P_(le),It.setValue(D,"projectionMatrix",le)):It.setValue(D,"projectionMatrix",C.projectionMatrix),It.setValue(D,"viewMatrix",C.matrixWorldInverse);const fn=It.map.cameraPosition;fn!==void 0&&fn.setValue(D,Ze.setFromMatrixPosition(C.matrixWorld)),mt.logarithmicDepthBuffer&&It.setValue(D,"logDepthBufFC",2/(Math.log(C.far+1)/Math.LN2)),(V.isMeshPhongMaterial||V.isMeshToonMaterial||V.isMeshLambertMaterial||V.isMeshBasicMaterial||V.isMeshStandardMaterial||V.isShaderMaterial)&&It.setValue(D,"isOrthographic",C.isOrthographicCamera===!0),v!==C&&(v=C,gn=!0,na=!0)}if(N.isSkinnedMesh){It.setOptional(D,N,"bindMatrix"),It.setOptional(D,N,"bindMatrixInverse");const nn=N.skeleton;nn&&(nn.boneTexture===null&&nn.computeBoneTexture(),It.setValue(D,"boneTexture",nn.boneTexture,He))}N.isBatchedMesh&&(It.setOptional(D,N,"batchingTexture"),It.setValue(D,"batchingTexture",N._matricesTexture,He),It.setOptional(D,N,"batchingIdTexture"),It.setValue(D,"batchingIdTexture",N._indirectTexture,He),It.setOptional(D,N,"batchingColorTexture"),N._colorsTexture!==null&&It.setValue(D,"batchingColorTexture",N._colorsTexture,He));const Mn=z.morphAttributes;if((Mn.position!==void 0||Mn.normal!==void 0||Mn.color!==void 0)&&fe.update(N,z,mn),(gn||Te.receiveShadow!==N.receiveShadow)&&(Te.receiveShadow=N.receiveShadow,It.setValue(D,"receiveShadow",N.receiveShadow)),V.isMeshGouraudMaterial&&V.envMap!==null&&(In.envMap.value=pe,In.flipEnvMap.value=pe.isCubeTexture&&pe.isRenderTargetTexture===!1?-1:1),V.isMeshStandardMaterial&&V.envMap===null&&U.environment!==null&&(In.envMapIntensity.value=U.environmentIntensity),gn&&(It.setValue(D,"toneMappingExposure",b.toneMappingExposure),Te.needsLights&&Ab(In,na),se&&V.fog===!0&&X.refreshFogUniforms(In,se),X.refreshMaterialUniforms(In,V,Q,W,A.state.transmissionRenderTarget[C.id]),vc.upload(D,Hd(Te),In,He)),V.isShaderMaterial&&V.uniformsNeedUpdate===!0&&(vc.upload(D,Hd(Te),In,He),V.uniformsNeedUpdate=!1),V.isSpriteMaterial&&It.setValue(D,"center",N.center),It.setValue(D,"modelViewMatrix",N.modelViewMatrix),It.setValue(D,"normalMatrix",N.normalMatrix),It.setValue(D,"modelMatrix",N.matrixWorld),V.isShaderMaterial||V.isRawShaderMaterial){const nn=V.uniformsGroups;for(let fn=0,hl=nn.length;fn<hl;fn++){const is=nn[fn];L.update(is,mn),L.bind(is,mn)}}return mn}function Ab(C,U){C.ambientLightColor.needsUpdate=U,C.lightProbe.needsUpdate=U,C.directionalLights.needsUpdate=U,C.directionalLightShadows.needsUpdate=U,C.pointLights.needsUpdate=U,C.pointLightShadows.needsUpdate=U,C.spotLights.needsUpdate=U,C.spotLightShadows.needsUpdate=U,C.rectAreaLights.needsUpdate=U,C.hemisphereLights.needsUpdate=U}function mb(C){return C.isMeshLambertMaterial||C.isMeshToonMaterial||C.isMeshPhongMaterial||C.isMeshStandardMaterial||C.isShadowMaterial||C.isShaderMaterial&&C.lights===!0}this.getActiveCubeFace=function(){return I},this.getActiveMipmapLevel=function(){return M},this.getRenderTarget=function(){return w},this.setRenderTargetTextures=function(C,U,z){const V=we.get(C);V.__autoAllocateDepthBuffer=C.resolveDepthBuffer===!1,V.__autoAllocateDepthBuffer===!1&&(V.__useRenderToTexture=!1),we.get(C.texture).__webglTexture=U,we.get(C.depthTexture).__webglTexture=V.__autoAllocateDepthBuffer?void 0:z,V.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(C,U){const z=we.get(C);z.__webglFramebuffer=U,z.__useDefaultFramebuffer=U===void 0};const gb=D.createFramebuffer();this.setRenderTarget=function(C,U=0,z=0){w=C,I=U,M=z;let V=!0,N=null,se=!1,ue=!1;if(C){const pe=we.get(C);if(pe.__useDefaultFramebuffer!==void 0)xe.bindFramebuffer(D.FRAMEBUFFER,null),V=!1;else if(pe.__webglFramebuffer===void 0)He.setupRenderTarget(C);else if(pe.__hasExternalTextures)He.rebindTextures(C,we.get(C.texture).__webglTexture,we.get(C.depthTexture).__webglTexture);else if(C.depthBuffer){const Ie=C.depthTexture;if(pe.__boundDepthTexture!==Ie){if(Ie!==null&&we.has(Ie)&&(C.width!==Ie.image.width||C.height!==Ie.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");He.setupDepthRenderbuffer(C)}}const Ue=C.texture;(Ue.isData3DTexture||Ue.isDataArrayTexture||Ue.isCompressedArrayTexture)&&(ue=!0);const Ne=we.get(C).__webglFramebuffer;C.isWebGLCubeRenderTarget?(Array.isArray(Ne[U])?N=Ne[U][z]:N=Ne[U],se=!0):C.samples>0&&He.useMultisampledRTT(C)===!1?N=we.get(C).__webglMultisampledFramebuffer:Array.isArray(Ne)?N=Ne[z]:N=Ne,R.copy(C.viewport),k.copy(C.scissor),F=C.scissorTest}else R.copy(re).multiplyScalar(Q).floor(),k.copy(de).multiplyScalar(Q).floor(),F=Ce;if(z!==0&&(N=gb),xe.bindFramebuffer(D.FRAMEBUFFER,N)&&V&&xe.drawBuffers(C,N),xe.viewport(R),xe.scissor(k),xe.setScissorTest(F),se){const pe=we.get(C.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_CUBE_MAP_POSITIVE_X+U,pe.__webglTexture,z)}else if(ue){const pe=we.get(C.texture),Ue=U;D.framebufferTextureLayer(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,pe.__webglTexture,z,Ue)}else if(C!==null&&z!==0){const pe=we.get(C.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,pe.__webglTexture,z)}x=-1},this.readRenderTargetPixels=function(C,U,z,V,N,se,ue,_e=0){if(!(C&&C.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let pe=we.get(C).__webglFramebuffer;if(C.isWebGLCubeRenderTarget&&ue!==void 0&&(pe=pe[ue]),pe){xe.bindFramebuffer(D.FRAMEBUFFER,pe);try{const Ue=C.textures[_e],Ne=Ue.format,Ie=Ue.type;if(!mt.textureFormatReadable(Ne)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!mt.textureTypeReadable(Ie)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=C.width-V&&z>=0&&z<=C.height-N&&(C.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+_e),D.readPixels(U,z,V,N,ae.convert(Ne),ae.convert(Ie),se))}finally{const Ue=w!==null?we.get(w).__webglFramebuffer:null;xe.bindFramebuffer(D.FRAMEBUFFER,Ue)}}},this.readRenderTargetPixelsAsync=async function(C,U,z,V,N,se,ue,_e=0){if(!(C&&C.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let pe=we.get(C).__webglFramebuffer;if(C.isWebGLCubeRenderTarget&&ue!==void 0&&(pe=pe[ue]),pe)if(U>=0&&U<=C.width-V&&z>=0&&z<=C.height-N){xe.bindFramebuffer(D.FRAMEBUFFER,pe);const Ue=C.textures[_e],Ne=Ue.format,Ie=Ue.type;if(!mt.textureFormatReadable(Ne))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!mt.textureTypeReadable(Ie))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const $e=D.createBuffer();D.bindBuffer(D.PIXEL_PACK_BUFFER,$e),D.bufferData(D.PIXEL_PACK_BUFFER,se.byteLength,D.STREAM_READ),C.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+_e),D.readPixels(U,z,V,N,ae.convert(Ne),ae.convert(Ie),0);const lt=w!==null?we.get(w).__webglFramebuffer:null;xe.bindFramebuffer(D.FRAMEBUFFER,lt);const Bt=D.fenceSync(D.SYNC_GPU_COMMANDS_COMPLETE,0);return D.flush(),await L_(D,Bt,4),D.bindBuffer(D.PIXEL_PACK_BUFFER,$e),D.getBufferSubData(D.PIXEL_PACK_BUFFER,0,se),D.deleteBuffer($e),D.deleteSync(Bt),se}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(C,U=null,z=0){const V=Math.pow(2,-z),N=Math.floor(C.image.width*V),se=Math.floor(C.image.height*V),ue=U!==null?U.x:0,_e=U!==null?U.y:0;He.setTexture2D(C,0),D.copyTexSubImage2D(D.TEXTURE_2D,z,0,0,ue,_e,N,se),xe.unbindTexture()};const bb=D.createFramebuffer(),_b=D.createFramebuffer();this.copyTextureToTexture=function(C,U,z=null,V=null,N=0,se=null){se===null&&(N!==0?(Lr("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),se=N,N=0):se=0);let ue,_e,pe,Ue,Ne,Ie,$e,lt,Bt;const Et=C.isCompressedTexture?C.mipmaps[se]:C.image;if(z!==null)ue=z.max.x-z.min.x,_e=z.max.y-z.min.y,pe=z.isBox3?z.max.z-z.min.z:1,Ue=z.min.x,Ne=z.min.y,Ie=z.isBox3?z.min.z:0;else{const Mn=Math.pow(2,-N);ue=Math.floor(Et.width*Mn),_e=Math.floor(Et.height*Mn),C.isDataArrayTexture?pe=Et.depth:C.isData3DTexture?pe=Math.floor(Et.depth*Mn):pe=1,Ue=0,Ne=0,Ie=0}V!==null?($e=V.x,lt=V.y,Bt=V.z):($e=0,lt=0,Bt=0);const dt=ae.convert(U.format),Te=ae.convert(U.type);let Tt;U.isData3DTexture?(He.setTexture3D(U,0),Tt=D.TEXTURE_3D):U.isDataArrayTexture||U.isCompressedArrayTexture?(He.setTexture2DArray(U,0),Tt=D.TEXTURE_2D_ARRAY):(He.setTexture2D(U,0),Tt=D.TEXTURE_2D),D.pixelStorei(D.UNPACK_FLIP_Y_WEBGL,U.flipY),D.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),D.pixelStorei(D.UNPACK_ALIGNMENT,U.unpackAlignment);const tt=D.getParameter(D.UNPACK_ROW_LENGTH),mn=D.getParameter(D.UNPACK_IMAGE_HEIGHT),Hs=D.getParameter(D.UNPACK_SKIP_PIXELS),gn=D.getParameter(D.UNPACK_SKIP_ROWS),na=D.getParameter(D.UNPACK_SKIP_IMAGES);D.pixelStorei(D.UNPACK_ROW_LENGTH,Et.width),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,Et.height),D.pixelStorei(D.UNPACK_SKIP_PIXELS,Ue),D.pixelStorei(D.UNPACK_SKIP_ROWS,Ne),D.pixelStorei(D.UNPACK_SKIP_IMAGES,Ie);const It=C.isDataArrayTexture||C.isData3DTexture,In=U.isDataArrayTexture||U.isData3DTexture;if(C.isDepthTexture){const Mn=we.get(C),nn=we.get(U),fn=we.get(Mn.__renderTarget),hl=we.get(nn.__renderTarget);xe.bindFramebuffer(D.READ_FRAMEBUFFER,fn.__webglFramebuffer),xe.bindFramebuffer(D.DRAW_FRAMEBUFFER,hl.__webglFramebuffer);for(let is=0;is<pe;is++)It&&(D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,we.get(C).__webglTexture,N,Ie+is),D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,we.get(U).__webglTexture,se,Bt+is)),D.blitFramebuffer(Ue,Ne,ue,_e,$e,lt,ue,_e,D.DEPTH_BUFFER_BIT,D.NEAREST);xe.bindFramebuffer(D.READ_FRAMEBUFFER,null),xe.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else if(N!==0||C.isRenderTargetTexture||we.has(C)){const Mn=we.get(C),nn=we.get(U);xe.bindFramebuffer(D.READ_FRAMEBUFFER,bb),xe.bindFramebuffer(D.DRAW_FRAMEBUFFER,_b);for(let fn=0;fn<pe;fn++)It?D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,Mn.__webglTexture,N,Ie+fn):D.framebufferTexture2D(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,Mn.__webglTexture,N),In?D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,nn.__webglTexture,se,Bt+fn):D.framebufferTexture2D(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,nn.__webglTexture,se),N!==0?D.blitFramebuffer(Ue,Ne,ue,_e,$e,lt,ue,_e,D.COLOR_BUFFER_BIT,D.NEAREST):In?D.copyTexSubImage3D(Tt,se,$e,lt,Bt+fn,Ue,Ne,ue,_e):D.copyTexSubImage2D(Tt,se,$e,lt,Ue,Ne,ue,_e);xe.bindFramebuffer(D.READ_FRAMEBUFFER,null),xe.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else In?C.isDataTexture||C.isData3DTexture?D.texSubImage3D(Tt,se,$e,lt,Bt,ue,_e,pe,dt,Te,Et.data):U.isCompressedArrayTexture?D.compressedTexSubImage3D(Tt,se,$e,lt,Bt,ue,_e,pe,dt,Et.data):D.texSubImage3D(Tt,se,$e,lt,Bt,ue,_e,pe,dt,Te,Et):C.isDataTexture?D.texSubImage2D(D.TEXTURE_2D,se,$e,lt,ue,_e,dt,Te,Et.data):C.isCompressedTexture?D.compressedTexSubImage2D(D.TEXTURE_2D,se,$e,lt,Et.width,Et.height,dt,Et.data):D.texSubImage2D(D.TEXTURE_2D,se,$e,lt,ue,_e,dt,Te,Et);D.pixelStorei(D.UNPACK_ROW_LENGTH,tt),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,mn),D.pixelStorei(D.UNPACK_SKIP_PIXELS,Hs),D.pixelStorei(D.UNPACK_SKIP_ROWS,gn),D.pixelStorei(D.UNPACK_SKIP_IMAGES,na),se===0&&U.generateMipmaps&&D.generateMipmap(Tt),xe.unbindTexture()},this.copyTextureToTexture3D=function(C,U,z=null,V=null,N=0){return Lr('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(C,U,z,V,N)},this.initRenderTarget=function(C){we.get(C).__webglFramebuffer===void 0&&He.setupRenderTarget(C)},this.initTexture=function(C){C.isCubeTexture?He.setTextureCube(C,0):C.isData3DTexture?He.setTexture3D(C,0):C.isDataArrayTexture||C.isCompressedArrayTexture?He.setTexture2DArray(C,0):He.setTexture2D(C,0),xe.unbindTexture()},this.resetState=function(){I=0,M=0,w=null,xe.reset(),ke.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Mi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=Ye._getDrawingBufferColorSpace(e),t.unpackColorSpace=Ye._getUnpackColorSpace()}}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const za=globalThis,Hc=za.trustedTypes,dp=Hc?Hc.createPolicy("lit-html",{createHTML:r=>r}):void 0,$g="$lit$",Wi=`lit$${Math.random().toFixed(9).slice(2)}$`,jg="?"+Wi,NC=`<${jg}>`,Os=document,so=()=>Os.createComment(""),ro=r=>r===null||typeof r!="object"&&typeof r!="function",Rd=Array.isArray,OC=r=>Rd(r)||typeof r?.[Symbol.iterator]=="function",ql=`[ 	
\f\r]`,ua=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,fp=/-->/g,pp=/>/g,hs=RegExp(`>|${ql}(?:([^\\s"'>=/]+)(${ql}*=${ql}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Ap=/'/g,mp=/"/g,Yg=/^(?:script|style|textarea|title)$/i,kC=r=>(e,...t)=>({_$litType$:r,strings:e,values:t}),sl=kC(1),$r=Symbol.for("lit-noChange"),Ht=Symbol.for("lit-nothing"),gp=new WeakMap,ws=Os.createTreeWalker(Os,129);function Kg(r,e){if(!Rd(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return dp!==void 0?dp.createHTML(e):e}const QC=(r,e)=>{const t=r.length-1,n=[];let i,s=e===2?"<svg>":e===3?"<math>":"",a=ua;for(let o=0;o<t;o++){const c=r[o];let l,u,h=-1,d=0;for(;d<c.length&&(a.lastIndex=d,u=a.exec(c),u!==null);)d=a.lastIndex,a===ua?u[1]==="!--"?a=fp:u[1]!==void 0?a=pp:u[2]!==void 0?(Yg.test(u[2])&&(i=RegExp("</"+u[2],"g")),a=hs):u[3]!==void 0&&(a=hs):a===hs?u[0]===">"?(a=i??ua,h=-1):u[1]===void 0?h=-2:(h=a.lastIndex-u[2].length,l=u[1],a=u[3]===void 0?hs:u[3]==='"'?mp:Ap):a===mp||a===Ap?a=hs:a===fp||a===pp?a=ua:(a=hs,i=void 0);const f=a===hs&&r[o+1].startsWith("/>")?" ":"";s+=a===ua?c+NC:h>=0?(n.push(l),c.slice(0,h)+$g+c.slice(h)+Wi+f):c+Wi+(h===-2?o:f)}return[Kg(r,s+(r[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),n]};class ao{constructor({strings:e,_$litType$:t},n){let i;this.parts=[];let s=0,a=0;const o=e.length-1,c=this.parts,[l,u]=QC(e,t);if(this.el=ao.createElement(l,n),ws.currentNode=this.el.content,t===2||t===3){const h=this.el.content.firstChild;h.replaceWith(...h.childNodes)}for(;(i=ws.nextNode())!==null&&c.length<o;){if(i.nodeType===1){if(i.hasAttributes())for(const h of i.getAttributeNames())if(h.endsWith($g)){const d=u[a++],f=i.getAttribute(h).split(Wi),p=/([.?@])?(.*)/.exec(d);c.push({type:1,index:s,name:p[2],strings:f,ctor:p[1]==="."?HC:p[1]==="?"?zC:p[1]==="@"?VC:rl}),i.removeAttribute(h)}else h.startsWith(Wi)&&(c.push({type:6,index:s}),i.removeAttribute(h));if(Yg.test(i.tagName)){const h=i.textContent.split(Wi),d=h.length-1;if(d>0){i.textContent=Hc?Hc.emptyScript:"";for(let f=0;f<d;f++)i.append(h[f],so()),ws.nextNode(),c.push({type:2,index:++s});i.append(h[d],so())}}}else if(i.nodeType===8)if(i.data===jg)c.push({type:2,index:s});else{let h=-1;for(;(h=i.data.indexOf(Wi,h+1))!==-1;)c.push({type:7,index:s}),h+=Wi.length-1}s++}}static createElement(e,t){const n=Os.createElement("template");return n.innerHTML=e,n}}function jr(r,e,t=r,n){if(e===$r)return e;let i=n!==void 0?t._$Co?.[n]:t._$Cl;const s=ro(e)?void 0:e._$litDirective$;return i?.constructor!==s&&(i?._$AO?.(!1),s===void 0?i=void 0:(i=new s(r),i._$AT(r,t,n)),n!==void 0?(t._$Co??(t._$Co=[]))[n]=i:t._$Cl=i),i!==void 0&&(e=jr(r,i._$AS(r,e.values),i,n)),e}class GC{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:n}=this._$AD,i=(e?.creationScope??Os).importNode(t,!0);ws.currentNode=i;let s=ws.nextNode(),a=0,o=0,c=n[0];for(;c!==void 0;){if(a===c.index){let l;c.type===2?l=new Bd(s,s.nextSibling,this,e):c.type===1?l=new c.ctor(s,c.name,c.strings,this,e):c.type===6&&(l=new WC(s,this,e)),this._$AV.push(l),c=n[++o]}a!==c?.index&&(s=ws.nextNode(),a++)}return ws.currentNode=Os,i}p(e){let t=0;for(const n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(e,n,t),t+=n.strings.length-2):n._$AI(e[t])),t++}}let Bd=class Jg{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,i){this.type=2,this._$AH=Ht,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=jr(this,e,t),ro(e)?e===Ht||e==null||e===""?(this._$AH!==Ht&&this._$AR(),this._$AH=Ht):e!==this._$AH&&e!==$r&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):OC(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==Ht&&ro(this._$AH)?this._$AA.nextSibling.data=e:this.T(Os.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:n}=e,i=typeof n=="number"?this._$AC(e):(n.el===void 0&&(n.el=ao.createElement(Kg(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===i)this._$AH.p(t);else{const s=new GC(i,this),a=s.u(this.options);s.p(t),this.T(a),this._$AH=s}}_$AC(e){let t=gp.get(e.strings);return t===void 0&&gp.set(e.strings,t=new ao(e)),t}k(e){Rd(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let n,i=0;for(const s of e)i===t.length?t.push(n=new Jg(this.O(so()),this.O(so()),this,this.options)):n=t[i],n._$AI(s),i++;i<t.length&&(this._$AR(n&&n._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const n=e.nextSibling;e.remove(),e=n}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}};class rl{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,i,s){this.type=1,this._$AH=Ht,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=s,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=Ht}_$AI(e,t=this,n,i){const s=this.strings;let a=!1;if(s===void 0)e=jr(this,e,t,0),a=!ro(e)||e!==this._$AH&&e!==$r,a&&(this._$AH=e);else{const o=e;let c,l;for(e=s[0],c=0;c<s.length-1;c++)l=jr(this,o[n+c],t,c),l===$r&&(l=this._$AH[c]),a||(a=!ro(l)||l!==this._$AH[c]),l===Ht?e=Ht:e!==Ht&&(e+=(l??"")+s[c+1]),this._$AH[c]=l}a&&!i&&this.j(e)}j(e){e===Ht?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class HC extends rl{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===Ht?void 0:e}}let zC=class extends rl{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==Ht)}};class VC extends rl{constructor(e,t,n,i,s){super(e,t,n,i,s),this.type=5}_$AI(e,t=this){if((e=jr(this,e,t,0)??Ht)===$r)return;const n=this._$AH,i=e===Ht&&n!==Ht||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,s=e!==Ht&&(n===Ht||i);i&&this.element.removeEventListener(this.name,this,n),s&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class WC{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){jr(this,e)}}const qC=za.litHtmlPolyfillSupport;qC?.(ao,Bd),(za.litHtmlVersions??(za.litHtmlVersions=[])).push("3.3.1");const Zg=(r,e,t)=>{const n=t?.renderBefore??e;let i=n._$litPart$;if(i===void 0){const s=t?.renderBefore??null;n._$litPart$=i=new Bd(e.insertBefore(so(),s),s,void 0,t??{})}return i._$AI(r),i};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Va=globalThis;let xc=class extends Ss{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t;const e=super.createRenderRoot();return(t=this.renderOptions).renderBefore??(t.renderBefore=e.firstChild),e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Zg(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return $r}};xc._$litElement$=!0,xc.finalized=!0,Va.litElementHydrateSupport?.({LitElement:xc});const XC=Va.litElementPolyfillSupport;XC?.({LitElement:xc});(Va.litElementVersions??(Va.litElementVersions=[])).push("4.2.1");/* @license
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
 */const e0=navigator.xr!=null&&self.XRSession!=null&&navigator.xr.isSessionSupported!=null,t0=e0&&self.XRSession.prototype.requestHitTestSource!=null,Xl=self.ResizeObserver!=null,$l=self.IntersectionObserver!=null,n0=t0;(()=>{const r=navigator.userAgent||navigator.vendor||self.opera;let e=!1;return(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(r)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(r.substr(0,4)))&&(e=!0),e})();const $C=/android/i.test(navigator.userAgent),jC=/iPad|iPhone|iPod/.test(navigator.userAgent)&&!self.MSStream||navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1,YC=/firefox/i.test(navigator.userAgent),KC=/OculusBrowser/.test(navigator.userAgent),JC=$C&&!YC&&!KC,ZC=!!(window.webkit&&window.webkit.messageHandlers),bp=(()=>{if(jC){if(ZC)return!!/CriOS\/|EdgiOS\/|FxiOS\/|GSA\/|DuckDuckGo\//.test(navigator.userAgent);{const r=document.createElement("a");return!!(r.relList&&r.relList.supports&&r.relList.supports("ar"))}}else return!1})();/* @license
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
 */const i0=r=>r&&r!=="null"?eI(r):null,_p=()=>{if(n0)return;const r=[];throw e0||r.push("WebXR Device API"),t0||r.push("WebXR Hit Test API"),new Error(`The following APIs are required for AR, but are missing in this browser: ${r.join(", ")}`)},eI=r=>new URL(r,window.location.toString()).toString(),tI=(r,e)=>{let t=null;const n=(...i)=>{t==null&&(r(...i),t=self.setTimeout(()=>t=null,e))};return n.flush=()=>{t!=null&&(self.clearTimeout(t),t=null)},n},Ep=(r,e)=>{let t=null;return(...n)=>{t!=null&&self.clearTimeout(t),t=self.setTimeout(()=>{t=null,r(...n)},e)}},ti=(r,e,t)=>Math.max(e,Math.min(t,r)),vp=(()=>{const r="model-viewer-debug-mode",e=new RegExp(`[?&]${r}(&|$)`);return()=>self.ModelViewerElement&&self.ModelViewerElement.debugMode||self.location&&self.location.search&&self.location.search.match(e)})(),nI=(r=0)=>new Promise(e=>setTimeout(e,r)),iI=(r,e,t=null)=>new Promise(n=>{function i(s){(!t||t(s))&&(n(s),r.removeEventListener(e,i))}r.addEventListener(e,i)});/* @license
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
 */var us=function(r,e,t,n){var i=arguments.length,s=i<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,t):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(r,e,t,n);else for(var o=r.length-1;o>=0;o--)(a=r[o])&&(s=(i<3?a(s):i>3?a(e,t,s):a(e,t))||s);return i>3&&s&&Object.defineProperty(e,t,s),s};const sI=.5,rI=0,aI=1,oI=1,Da=Symbol("currentEnvironmentMap"),La=Symbol("currentBackground"),zc=Symbol("updateEnvironment"),Wo=Symbol("cancelEnvironmentUpdate"),cI=r=>{var e,t,n;class i extends r{constructor(){super(...arguments),this.environmentImage=null,this.skyboxImage=null,this.shadowIntensity=rI,this.shadowSoftness=aI,this.exposure=oI,this.toneMapping="auto",this.skyboxHeight="0",this[e]=null,this[t]=null,this[n]=null}updated(a){super.updated(a),a.has("shadowIntensity")&&(this[ee].setShadowIntensity(this.shadowIntensity*sI),this[Wt]()),a.has("shadowSoftness")&&(this[ee].setShadowSoftness(this.shadowSoftness),this[Wt]()),a.has("exposure")&&(this[ee].exposure=this.exposure,this[Wt]()),a.has("toneMapping")&&(this[ee].toneMapping=this.toneMapping==="aces"?ug:this.toneMapping==="agx"?dg:this.toneMapping==="reinhard"?lg:this.toneMapping==="cineon"?hg:this.toneMapping==="linear"?cg:this.toneMapping==="none"?si:qa,this[Wt]()),(a.has("environmentImage")||a.has("skyboxImage"))&&this[Yr]()&&this[zc](),a.has("skyboxHeight")&&(this[ee].setGroundedSkybox(),this[Wt]())}hasBakedShadow(){return this[ee].bakedShadows.size>0}async[(e=Da,t=La,n=Wo,zc)](){const{skyboxImage:a,environmentImage:o}=this;this[Wo]!=null&&(this[Wo](),this[Wo]=null);const{textureUtils:c}=this[ct];if(c==null)return;const l=this[ks].beginActivity("environment-update");try{const{environmentMap:u,skybox:h}=await c.generateEnvironmentMapAndSkybox(i0(a),o,d=>l(ti(d,0,1)),this.withCredentials);this[Da]!==u&&(this[Da]=u,this.dispatchEvent(new CustomEvent("environment-change"))),h!=null?this[La]=h.name===u.name?u:h:this[La]=null,this[ee].setEnvironmentAndSkybox(this[Da],this[La])}catch(u){if(u instanceof Error)throw this[ee].setEnvironmentAndSkybox(null,null),u}finally{l(1)}}}return us([De({type:String,attribute:"environment-image"})],i.prototype,"environmentImage",void 0),us([De({type:String,attribute:"skybox-image"})],i.prototype,"skyboxImage",void 0),us([De({type:Number,attribute:"shadow-intensity"})],i.prototype,"shadowIntensity",void 0),us([De({type:Number,attribute:"shadow-softness"})],i.prototype,"shadowSoftness",void 0),us([De({type:Number})],i.prototype,"exposure",void 0),us([De({type:String,attribute:"tone-mapping"})],i.prototype,"toneMapping",void 0),us([De({type:String,attribute:"skybox-height"})],i.prototype,"skyboxHeight",void 0),i};/* @license
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
 */const lI=sl`
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
 */const hI=sl`
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
 */const uI=sl`
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
 */const dI=sl`
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
        ${uI}
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
        ${hI}
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
          ${lI}
        </a>
      </slot>
    </div>
  </div>
</div>
<div class="screen-reader-only" role="region" aria-label="Live announcements">
  <span id="status" role="status"></span>
</div>`,fI=r=>{Zg(dI,r)};var xp=function(){var r="b9H79Tebbbe8Fv9Gbb9Gvuuuuueu9Giuuub9Geueu9Giuuueuikqbeeedddillviebeoweuec:q;iekr;leDo9TW9T9VV95dbH9F9F939H79T9F9J9H229F9Jt9VV7bb8A9TW79O9V9Wt9F9KW9J9V9KW9wWVtW949c919M9MWVbeY9TW79O9V9Wt9F9KW9J9V9KW69U9KW949c919M9MWVbdE9TW79O9V9Wt9F9KW9J9V9KW69U9KW949tWG91W9U9JWbiL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9p9JtblK9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9r919HtbvL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVT949Wbol79IV9Rbrq:P8Yqdbk;3sezu8Jjjjjbcj;eb9Rgv8Kjjjjbc9:hodnadcefal0mbcuhoaiRbbc:Ge9hmbavaialfgrad9Radz1jjjbhwcj;abad9UhoaicefhldnadTmbaoc;WFbGgocjdaocjd6EhDcbhqinaqae9pmeaDaeaq9RaqaDfae6Egkcsfgocl4cifcd4hxdndndndnaoc9WGgmTmbcbhPcehsawcjdfhzalhHinaraH9Rax6midnaraHaxfgl9RcK6mbczhoinawcj;cbfaogifgoc9WfhOdndndndndnaHaic9WfgAco4fRbbaAci4coG4ciGPlbedibkaO9cb83ibaOcwf9cb83ibxikaOalRblalRbbgAco4gCaCciSgCE86bbaocGfalclfaCfgORbbaAcl4ciGgCaCciSgCE86bbaocVfaOaCfgORbbaAcd4ciGgCaCciSgCE86bbaoc7faOaCfgORbbaAciGgAaAciSgAE86bbaoctfaOaAfgARbbalRbegOco4gCaCciSgCE86bbaoc91faAaCfgARbbaOcl4ciGgCaCciSgCE86bbaoc4faAaCfgARbbaOcd4ciGgCaCciSgCE86bbaoc93faAaCfgARbbaOciGgOaOciSgOE86bbaoc94faAaOfgARbbalRbdgOco4gCaCciSgCE86bbaoc95faAaCfgARbbaOcl4ciGgCaCciSgCE86bbaoc96faAaCfgARbbaOcd4ciGgCaCciSgCE86bbaoc97faAaCfgARbbaOciGgOaOciSgOE86bbaoc98faAaOfgORbbalRbiglco4gAaAciSgAE86bbaoc99faOaAfgORbbalcl4ciGgAaAciSgAE86bbaoc9:faOaAfgORbbalcd4ciGgAaAciSgAE86bbaocufaOaAfgoRbbalciGglalciSglE86bbaoalfhlxdkaOalRbwalRbbgAcl4gCaCcsSgCE86bbaocGfalcwfaCfgORbbaAcsGgAaAcsSgAE86bbaocVfaOaAfgORbbalRbegAcl4gCaCcsSgCE86bbaoc7faOaCfgORbbaAcsGgAaAcsSgAE86bbaoctfaOaAfgORbbalRbdgAcl4gCaCcsSgCE86bbaoc91faOaCfgORbbaAcsGgAaAcsSgAE86bbaoc4faOaAfgORbbalRbigAcl4gCaCcsSgCE86bbaoc93faOaCfgORbbaAcsGgAaAcsSgAE86bbaoc94faOaAfgORbbalRblgAcl4gCaCcsSgCE86bbaoc95faOaCfgORbbaAcsGgAaAcsSgAE86bbaoc96faOaAfgORbbalRbvgAcl4gCaCcsSgCE86bbaoc97faOaCfgORbbaAcsGgAaAcsSgAE86bbaoc98faOaAfgORbbalRbogAcl4gCaCcsSgCE86bbaoc99faOaCfgORbbaAcsGgAaAcsSgAE86bbaoc9:faOaAfgORbbalRbrglcl4gAaAcsSgAE86bbaocufaOaAfgoRbbalcsGglalcsSglE86bbaoalfhlxekaOal8Pbb83bbaOcwfalcwf8Pbb83bbalczfhlkdnaiam9pmbaiczfhoaral9RcL0mekkaiam6mialTmidnakTmbawaPfRbbhOcbhoazhiinaiawcj;cbfaofRbbgAce4cbaAceG9R7aOfgO86bbaiadfhiaocefgoak9hmbkkazcefhzaPcefgPad6hsalhHaPad9hmexvkkcbhlasceGmdxikalaxad2fhCdnakTmbcbhHcehsawcjdfhminaral9Rax6mialTmdalaxfhlawaHfRbbhOcbhoamhiinaiawcj;cbfaofRbbgAce4cbaAceG9R7aOfgO86bbaiadfhiaocefgoak9hmbkamcefhmaHcefgHad6hsaHad9hmbkaChlxikcbhocehsinaral9Rax6mdalTmealaxfhlaocefgoad6hsadao9hmbkaChlxdkcbhlasceGTmekc9:hoxikabaqad2fawcjdfakad2z1jjjb8Aawawcjdfakcufad2fadz1jjjb8Aakaqfhqalmbkc9:hoxekcbc99aral9Radcaadca0ESEhokavcj;ebf8Kjjjjbaok;yzeHu8Jjjjjbc;ae9Rgv8Kjjjjbc9:hodnaeci9UgrcHfal0mbcuhoaiRbbgwc;WeGc;Ge9hmbawcsGgDce0mbavc;abfcFecjez:jjjjb8AavcUf9cu83ibavc8Wf9cu83ibavcyf9cu83ibavcaf9cu83ibavcKf9cu83ibavczf9cu83ibav9cu83iwav9cu83ibaialfc9WfhqaicefgwarfhodnaeTmbcmcsaDceSEhkcbhxcbhmcbhDcbhicbhlindnaoaq9nmbc9:hoxikdndnawRbbgrc;Ve0mbavc;abfalarcl4cu7fcsGcitfgPydlhsaPydbhzdnarcsGgPak9pmbavaiarcu7fcsGcdtfydbaxaPEhraPThPdndnadcd9hmbabaDcetfgHaz87ebaHcdfas87ebaHclfar87ebxekabaDcdtfgHazBdbaHclfasBdbaHcwfarBdbkaxaPfhxavc;abfalcitfgHarBdbaHasBdlavaicdtfarBdbavc;abfalcefcsGglcitfgHazBdbaHarBdlaiaPfhialcefhlxdkdndnaPcsSmbamaPfaPc987fcefhmxekaocefhrao8SbbgPcFeGhHdndnaPcu9mmbarhoxekaocvfhoaHcFbGhHcrhPdninar8SbbgOcFbGaPtaHVhHaOcu9kmearcefhraPcrfgPc8J9hmbxdkkarcefhokaHce4cbaHceG9R7amfhmkdndnadcd9hmbabaDcetfgraz87ebarcdfas87ebarclfam87ebxekabaDcdtfgrazBdbarclfasBdbarcwfamBdbkavc;abfalcitfgramBdbarasBdlavaicdtfamBdbavc;abfalcefcsGglcitfgrazBdbaramBdlaicefhialcefhlxekdnarcpe0mbaxcefgOavaiaqarcsGfRbbgPcl49RcsGcdtfydbaPcz6gHEhravaiaP9RcsGcdtfydbaOaHfgsaPcsGgOEhPaOThOdndnadcd9hmbabaDcetfgzax87ebazcdfar87ebazclfaP87ebxekabaDcdtfgzaxBdbazclfarBdbazcwfaPBdbkavaicdtfaxBdbavc;abfalcitfgzarBdbazaxBdlavaicefgicsGcdtfarBdbavc;abfalcefcsGcitfgzaPBdbazarBdlavaiaHfcsGgicdtfaPBdbavc;abfalcdfcsGglcitfgraxBdbaraPBdlalcefhlaiaOfhiasaOfhxxekaxcbaoRbbgzEgAarc;:eSgrfhsazcsGhCazcl4hXdndnazcs0mbascefhOxekashOavaiaX9RcsGcdtfydbhskdndnaCmbaOcefhxxekaOhxavaiaz9RcsGcdtfydbhOkdndnarTmbaocefhrxekaocdfhrao8SbegHcFeGhPdnaHcu9kmbaocofhAaPcFbGhPcrhodninar8SbbgHcFbGaotaPVhPaHcu9kmearcefhraocrfgoc8J9hmbkaAhrxekarcefhrkaPce4cbaPceG9R7amfgmhAkdndnaXcsSmbarhPxekarcefhPar8SbbgocFeGhHdnaocu9kmbarcvfhsaHcFbGhHcrhodninaP8SbbgrcFbGaotaHVhHarcu9kmeaPcefhPaocrfgoc8J9hmbkashPxekaPcefhPkaHce4cbaHceG9R7amfgmhskdndnaCcsSmbaPhoxekaPcefhoaP8SbbgrcFeGhHdnarcu9kmbaPcvfhOaHcFbGhHcrhrdninao8SbbgPcFbGartaHVhHaPcu9kmeaocefhoarcrfgrc8J9hmbkaOhoxekaocefhokaHce4cbaHceG9R7amfgmhOkdndnadcd9hmbabaDcetfgraA87ebarcdfas87ebarclfaO87ebxekabaDcdtfgraABdbarclfasBdbarcwfaOBdbkavc;abfalcitfgrasBdbaraABdlavaicdtfaABdbavc;abfalcefcsGcitfgraOBdbarasBdlavaicefgicsGcdtfasBdbavc;abfalcdfcsGcitfgraABdbaraOBdlavaiazcz6aXcsSVfgicsGcdtfaOBdbaiaCTaCcsSVfhialcifhlkawcefhwalcsGhlaicsGhiaDcifgDae6mbkkcbc99aoaqSEhokavc;aef8Kjjjjbaok:llevu8Jjjjjbcz9Rhvc9:hodnaecvfal0mbcuhoaiRbbc;:eGc;qe9hmbav9cb83iwaicefhraialfc98fhwdnaeTmbdnadcdSmbcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcdtfaicd4cbaice4ceG9R7avcwfaiceGcdtVgoydbfglBdbaoalBdbaDcefgDae9hmbxdkkcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcetfaicd4cbaice4ceG9R7avcwfaiceGcdtVgoydbfgl87ebaoalBdbaDcefgDae9hmbkkcbc99arawSEhokaok:Lvoeue99dud99eud99dndnadcl9hmbaeTmeindndnabcdfgd8Sbb:Yab8Sbbgi:Ygl:l:tabcefgv8Sbbgo:Ygr:l:tgwJbb;:9cawawNJbbbbawawJbbbb9GgDEgq:mgkaqaicb9iEalMgwawNakaqaocb9iEarMgqaqNMM:r:vglNJbbbZJbbb:;aDEMgr:lJbbb9p9DTmbar:Ohixekcjjjj94hikadai86bbdndnaqalNJbbbZJbbb:;aqJbbbb9GEMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkavad86bbdndnawalNJbbbZJbbb:;awJbbbb9GEMgw:lJbbb9p9DTmbaw:Ohdxekcjjjj94hdkabad86bbabclfhbaecufgembxdkkaeTmbindndnabclfgd8Ueb:Yab8Uebgi:Ygl:l:tabcdfgv8Uebgo:Ygr:l:tgwJb;:FSawawNJbbbbawawJbbbb9GgDEgq:mgkaqaicb9iEalMgwawNakaqaocb9iEarMgqaqNMM:r:vglNJbbbZJbbb:;aDEMgr:lJbbb9p9DTmbar:Ohixekcjjjj94hikadai87ebdndnaqalNJbbbZJbbb:;aqJbbbb9GEMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkavad87ebdndnawalNJbbbZJbbb:;awJbbbb9GEMgw:lJbbb9p9DTmbaw:Ohdxekcjjjj94hdkabad87ebabcwfhbaecufgembkkk;siliui99iue99dnaeTmbcbhiabhlindndnJ;Zl81Zalcof8UebgvciV:Y:vgoal8Ueb:YNgrJb;:FSNJbbbZJbbb:;arJbbbb9GEMgw:lJbbb9p9DTmbaw:OhDxekcjjjj94hDkalclf8Uebhqalcdf8UebhkabavcefciGaiVcetfaD87ebdndnaoak:YNgwJb;:FSNJbbbZJbbb:;awJbbbb9GEMgx:lJbbb9p9DTmbax:Ohkxekcjjjj94hkkabavcdfciGaiVcetfak87ebdndnaoaq:YNgoJb;:FSNJbbbZJbbb:;aoJbbbb9GEMgx:lJbbb9p9DTmbax:Ohqxekcjjjj94hqkabavcufciGaiVcetfaq87ebdndnJbbjZararN:tawawN:taoaoN:tgrJbbbbarJbbbb9GE:rJb;:FSNJbbbZMgr:lJbbb9p9DTmbar:Ohqxekcjjjj94hqkabavciGaiVcetfaq87ebalcwfhlaiclfhiaecufgembkkk9mbdnadcd4ae2geTmbinababydbgdcwtcw91:Yadce91cjjj;8ifcjjj98G::NUdbabclfhbaecufgembkkk9teiucbcbydj1jjbgeabcifc98GfgbBdj1jjbdndnabZbcztgd9nmbcuhiabad9RcFFifcz4nbcuSmekaehikaik;LeeeudndnaeabVciGTmbabhixekdndnadcz9pmbabhixekabhiinaiaeydbBdbaiclfaeclfydbBdbaicwfaecwfydbBdbaicxfaecxfydbBdbaiczfhiaeczfheadc9Wfgdcs0mbkkadcl6mbinaiaeydbBdbaeclfheaiclfhiadc98fgdci0mbkkdnadTmbinaiaeRbb86bbaicefhiaecefheadcufgdmbkkabk;aeedudndnabciGTmbabhixekaecFeGc:b:c:ew2hldndnadcz9pmbabhixekabhiinaialBdbaicxfalBdbaicwfalBdbaiclfalBdbaiczfhiadc9Wfgdcs0mbkkadcl6mbinaialBdbaiclfhiadc98fgdci0mbkkdnadTmbinaiae86bbaicefhiadcufgdmbkkabkkkebcjwklz9Kbb",e="b9H79TebbbeKl9Gbb9Gvuuuuueu9Giuuub9Geueuikqbbebeedddilve9Weeeviebeoweuec:q;Aekr;leDo9TW9T9VV95dbH9F9F939H79T9F9J9H229F9Jt9VV7bb8A9TW79O9V9Wt9F9KW9J9V9KW9wWVtW949c919M9MWVbdY9TW79O9V9Wt9F9KW9J9V9KW69U9KW949c919M9MWVblE9TW79O9V9Wt9F9KW9J9V9KW69U9KW949tWG91W9U9JWbvL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9p9JtboK9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9r919HtbrL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVT949Wbwl79IV9RbDq;t9tqlbzik9:evu8Jjjjjbcz9Rhbcbheincbhdcbhiinabcwfadfaicjuaead4ceGglE86bbaialfhiadcefgdcw9hmbkaec:q:yjjbfai86bbaecitc:q1jjbfab8Piw83ibaecefgecjd9hmbkk;h8JlHud97euo978Jjjjjbcj;kb9Rgv8Kjjjjbc9:hodnadcefal0mbcuhoaiRbbc:Ge9hmbavaialfgrad9Rad;8qbbcj;abad9UhoaicefhldnadTmbaoc;WFbGgocjdaocjd6EhwcbhDinaDae9pmeawaeaD9RaDawfae6Egqcsfgoc9WGgkci2hxakcethmaocl4cifcd4hPabaDad2fhscbhzdnincehHalhOcbhAdninaraO9RaP6miavcj;cbfaAak2fhCaOaPfhlcbhidnakc;ab6mbaral9Rc;Gb6mbcbhoinaCaofhidndndndndnaOaoco4fRbbgXciGPlbedibkaipxbbbbbbbbbbbbbbbbpklbxikaialpbblalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklbalclfaYpQbfaKc:q:yjjbfRbbfhlxdkaialpbbwalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklbalcwfaYpQbfaKc:q:yjjbfRbbfhlxekaialpbbbpklbalczfhlkdndndndndnaXcd4ciGPlbedibkaipxbbbbbbbbbbbbbbbbpklzxikaialpbblalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklzalclfaYpQbfaKc:q:yjjbfRbbfhlxdkaialpbbwalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklzalcwfaYpQbfaKc:q:yjjbfRbbfhlxekaialpbbbpklzalczfhlkdndndndndnaXcl4ciGPlbedibkaipxbbbbbbbbbbbbbbbbpklaxikaialpbblalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklaalclfaYpQbfaKc:q:yjjbfRbbfhlxdkaialpbbwalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklaalcwfaYpQbfaKc:q:yjjbfRbbfhlxekaialpbbbpklaalczfhlkdndndndndnaXco4Plbedibkaipxbbbbbbbbbbbbbbbbpkl8WxikaialpbblalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibaXc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spkl8WalclfaYpQbfaXc:q:yjjbfRbbfhlxdkaialpbbwalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibaXc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spkl8WalcwfaYpQbfaXc:q:yjjbfRbbfhlxekaialpbbbpkl8Walczfhlkaoc;abfhiaocjefak0meaihoaral9Rc;Fb0mbkkdndnaiak9pmbaici4hoinaral9RcK6mdaCaifhXdndndndndnaOaico4fRbbaocoG4ciGPlbedibkaXpxbbbbbbbbbbbbbbbbpklbxikaXalpbblalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklbalclfaYpQbfaKc:q:yjjbfRbbfhlxdkaXalpbbwalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklbalcwfaYpQbfaKc:q:yjjbfRbbfhlxekaXalpbbbpklbalczfhlkaocdfhoaiczfgiak6mbkkalTmbaAci6hHalhOaAcefgohAaoclSmdxekkcbhlaHceGmdkdnakTmbavcjdfazfhiavazfpbdbhYcbhXinaiavcj;cbfaXfgopblbgLcep9TaLpxeeeeeeeeeeeeeeeegQp9op9Hp9rgLaoakfpblbg8Acep9Ta8AaQp9op9Hp9rg8ApmbzeHdOiAlCvXoQrLgEaoamfpblbg3cep9Ta3aQp9op9Hp9rg3aoaxfpblbg5cep9Ta5aQp9op9Hp9rg5pmbzeHdOiAlCvXoQrLg8EpmbezHdiOAlvCXorQLgQaQpmbedibedibedibediaYp9UgYp9AdbbaiadfgoaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaoadfgoaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaoadfgoaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaoadfgoaYaEa8EpmwDKYqk8AExm35Ps8E8FgQaQpmbedibedibedibedip9UgYp9AdbbaoadfgoaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaoadfgoaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaoadfgoaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaoadfgoaYaLa8ApmwKDYq8AkEx3m5P8Es8FgLa3a5pmwKDYq8AkEx3m5P8Es8Fg8ApmbezHdiOAlvCXorQLgQaQpmbedibedibedibedip9UgYp9AdbbaoadfgoaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaoadfgoaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaoadfgoaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaoadfgoaYaLa8ApmwDKYqk8AExm35Ps8E8FgQaQpmbedibedibedibedip9UgYp9AdbbaoadfgoaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaoadfgoaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaoadfgoaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaoadfhiaXczfgXak6mbkkazclfgzad6mbkasavcjdfaqad2;8qbbavavcjdfaqcufad2fad;8qbbaqaDfhDc9:hoalmexikkc9:hoxekcbc99aral9Radcaadca0ESEhokavcj;kbf8Kjjjjbaokwbz:bjjjbk;uzeHu8Jjjjjbc;ae9Rgv8Kjjjjbc9:hodnaeci9UgrcHfal0mbcuhoaiRbbgwc;WeGc;Ge9hmbawcsGgDce0mbavc;abfcFecje;8kbavcUf9cu83ibavc8Wf9cu83ibavcyf9cu83ibavcaf9cu83ibavcKf9cu83ibavczf9cu83ibav9cu83iwav9cu83ibaialfc9WfhqaicefgwarfhodnaeTmbcmcsaDceSEhkcbhxcbhmcbhDcbhicbhlindnaoaq9nmbc9:hoxikdndnawRbbgrc;Ve0mbavc;abfalarcl4cu7fcsGcitfgPydlhsaPydbhzdnarcsGgPak9pmbavaiarcu7fcsGcdtfydbaxaPEhraPThPdndnadcd9hmbabaDcetfgHaz87ebaHcdfas87ebaHclfar87ebxekabaDcdtfgHazBdbaHclfasBdbaHcwfarBdbkaxaPfhxavc;abfalcitfgHarBdbaHasBdlavaicdtfarBdbavc;abfalcefcsGglcitfgHazBdbaHarBdlaiaPfhialcefhlxdkdndnaPcsSmbamaPfaPc987fcefhmxekaocefhrao8SbbgPcFeGhHdndnaPcu9mmbarhoxekaocvfhoaHcFbGhHcrhPdninar8SbbgOcFbGaPtaHVhHaOcu9kmearcefhraPcrfgPc8J9hmbxdkkarcefhokaHce4cbaHceG9R7amfhmkdndnadcd9hmbabaDcetfgraz87ebarcdfas87ebarclfam87ebxekabaDcdtfgrazBdbarclfasBdbarcwfamBdbkavc;abfalcitfgramBdbarasBdlavaicdtfamBdbavc;abfalcefcsGglcitfgrazBdbaramBdlaicefhialcefhlxekdnarcpe0mbaxcefgOavaiaqarcsGfRbbgPcl49RcsGcdtfydbaPcz6gHEhravaiaP9RcsGcdtfydbaOaHfgsaPcsGgOEhPaOThOdndnadcd9hmbabaDcetfgzax87ebazcdfar87ebazclfaP87ebxekabaDcdtfgzaxBdbazclfarBdbazcwfaPBdbkavaicdtfaxBdbavc;abfalcitfgzarBdbazaxBdlavaicefgicsGcdtfarBdbavc;abfalcefcsGcitfgzaPBdbazarBdlavaiaHfcsGgicdtfaPBdbavc;abfalcdfcsGglcitfgraxBdbaraPBdlalcefhlaiaOfhiasaOfhxxekaxcbaoRbbgzEgAarc;:eSgrfhsazcsGhCazcl4hXdndnazcs0mbascefhOxekashOavaiaX9RcsGcdtfydbhskdndnaCmbaOcefhxxekaOhxavaiaz9RcsGcdtfydbhOkdndnarTmbaocefhrxekaocdfhrao8SbegHcFeGhPdnaHcu9kmbaocofhAaPcFbGhPcrhodninar8SbbgHcFbGaotaPVhPaHcu9kmearcefhraocrfgoc8J9hmbkaAhrxekarcefhrkaPce4cbaPceG9R7amfgmhAkdndnaXcsSmbarhPxekarcefhPar8SbbgocFeGhHdnaocu9kmbarcvfhsaHcFbGhHcrhodninaP8SbbgrcFbGaotaHVhHarcu9kmeaPcefhPaocrfgoc8J9hmbkashPxekaPcefhPkaHce4cbaHceG9R7amfgmhskdndnaCcsSmbaPhoxekaPcefhoaP8SbbgrcFeGhHdnarcu9kmbaPcvfhOaHcFbGhHcrhrdninao8SbbgPcFbGartaHVhHaPcu9kmeaocefhoarcrfgrc8J9hmbkaOhoxekaocefhokaHce4cbaHceG9R7amfgmhOkdndnadcd9hmbabaDcetfgraA87ebarcdfas87ebarclfaO87ebxekabaDcdtfgraABdbarclfasBdbarcwfaOBdbkavc;abfalcitfgrasBdbaraABdlavaicdtfaABdbavc;abfalcefcsGcitfgraOBdbarasBdlavaicefgicsGcdtfasBdbavc;abfalcdfcsGcitfgraABdbaraOBdlavaiazcz6aXcsSVfgicsGcdtfaOBdbaiaCTaCcsSVfhialcifhlkawcefhwalcsGhlaicsGhiaDcifgDae6mbkkcbc99aoaqSEhokavc;aef8Kjjjjbaok:llevu8Jjjjjbcz9Rhvc9:hodnaecvfal0mbcuhoaiRbbc;:eGc;qe9hmbav9cb83iwaicefhraialfc98fhwdnaeTmbdnadcdSmbcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcdtfaicd4cbaice4ceG9R7avcwfaiceGcdtVgoydbfglBdbaoalBdbaDcefgDae9hmbxdkkcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcetfaicd4cbaice4ceG9R7avcwfaiceGcdtVgoydbfgl87ebaoalBdbaDcefgDae9hmbkkcbc99arawSEhokaok:EPliuo97eue978Jjjjjbca9Rhidndnadcl9hmbdnaec98GglTmbcbhvabhdinadadpbbbgocKp:RecKp:Sep;6egraocwp:RecKp:Sep;6earp;Geaoczp:RecKp:Sep;6egwp;Gep;Kep;LegDpxbbbbbbbbbbbbbbbbp:2egqarpxbbbjbbbjbbbjbbbjgkp9op9rp;Kegrpxbb;:9cbb;:9cbb;:9cbb;:9cararp;MeaDaDp;Meawaqawakp9op9rp;Kegrarp;Mep;Kep;Kep;Jep;Negwp;Mepxbbn0bbn0bbn0bbn0gqp;KepxFbbbFbbbFbbbFbbbp9oaopxbbbFbbbFbbbFbbbFp9op9qarawp;Meaqp;Kecwp:RepxbFbbbFbbbFbbbFbbp9op9qaDawp;Meaqp;Keczp:RepxbbFbbbFbbbFbbbFbp9op9qpkbbadczfhdavclfgval6mbkkalae9pmeaiaeciGgvcdtgdVcbczad9R;8kbaiabalcdtfglad;8qbbdnavTmbaiaipblbgocKp:RecKp:Sep;6egraocwp:RecKp:Sep;6earp;Geaoczp:RecKp:Sep;6egwp;Gep;Kep;LegDpxbbbbbbbbbbbbbbbbp:2egqarpxbbbjbbbjbbbjbbbjgkp9op9rp;Kegrpxbb;:9cbb;:9cbb;:9cbb;:9cararp;MeaDaDp;Meawaqawakp9op9rp;Kegrarp;Mep;Kep;Kep;Jep;Negwp;Mepxbbn0bbn0bbn0bbn0gqp;KepxFbbbFbbbFbbbFbbbp9oaopxbbbFbbbFbbbFbbbFp9op9qarawp;Meaqp;Kecwp:RepxbFbbbFbbbFbbbFbbp9op9qaDawp;Meaqp;Keczp:RepxbbFbbbFbbbFbbbFbp9op9qpklbkalaiad;8qbbskdnaec98GgxTmbcbhvabhdinadczfglalpbbbgopxbbbbbbFFbbbbbbFFgkp9oadpbbbgDaopmlvorxmPsCXQL358E8FpxFubbFubbFubbFubbp9op;6eaDaopmbediwDqkzHOAKY8AEgoczp:Sep;6egrp;Geaoczp:Reczp:Sep;6egwp;Gep;Kep;Legopxb;:FSb;:FSb;:FSb;:FSawaopxbbbbbbbbbbbbbbbbp:2egqawpxbbbjbbbjbbbjbbbjgmp9op9rp;Kegwawp;Meaoaop;Mearaqaramp9op9rp;Kegoaop;Mep;Kep;Kep;Jep;Negrp;Mepxbbn0bbn0bbn0bbn0gqp;Keczp:Reawarp;Meaqp;KepxFFbbFFbbFFbbFFbbp9op9qgwaoarp;Meaqp;KepxFFbbFFbbFFbbFFbbp9ogopmwDKYqk8AExm35Ps8E8Fp9qpkbbadaDakp9oawaopmbezHdiOAlvCXorQLp9qpkbbadcafhdavclfgvax6mbkkaxae9pmbaiaeciGgvcitgdfcbcaad9R;8kbaiabaxcitfglad;8qbbdnavTmbaiaipblzgopxbbbbbbFFbbbbbbFFgkp9oaipblbgDaopmlvorxmPsCXQL358E8FpxFubbFubbFubbFubbp9op;6eaDaopmbediwDqkzHOAKY8AEgoczp:Sep;6egrp;Geaoczp:Reczp:Sep;6egwp;Gep;Kep;Legopxb;:FSb;:FSb;:FSb;:FSawaopxbbbbbbbbbbbbbbbbp:2egqawpxbbbjbbbjbbbjbbbjgmp9op9rp;Kegwawp;Meaoaop;Mearaqaramp9op9rp;Kegoaop;Mep;Kep;Kep;Jep;Negrp;Mepxbbn0bbn0bbn0bbn0gqp;Keczp:Reawarp;Meaqp;KepxFFbbFFbbFFbbFFbbp9op9qgwaoarp;Meaqp;KepxFFbbFFbbFFbbFFbbp9ogopmwDKYqk8AExm35Ps8E8Fp9qpklzaiaDakp9oawaopmbezHdiOAlvCXorQLp9qpklbkalaiad;8qbbkk;4wllue97euv978Jjjjjbc8W9Rhidnaec98GglTmbcbhvabhoinaiaopbbbgraoczfgwpbbbgDpmlvorxmPsCXQL358E8Fgqczp:Segkclp:RepklbaopxbbjZbbjZbbjZbbjZpx;Zl81Z;Zl81Z;Zl81Z;Zl81Zakpxibbbibbbibbbibbbp9qp;6ep;NegkaraDpmbediwDqkzHOAKY8AEgrczp:Reczp:Sep;6ep;MegDaDp;Meakarczp:Sep;6ep;Megxaxp;Meakaqczp:Reczp:Sep;6ep;Megqaqp;Mep;Kep;Kep;Lepxbbbbbbbbbbbbbbbbp:4ep;Jepxb;:FSb;:FSb;:FSb;:FSgkp;Mepxbbn0bbn0bbn0bbn0grp;KepxFFbbFFbbFFbbFFbbgmp9oaxakp;Mearp;Keczp:Rep9qgxaqakp;Mearp;Keczp:ReaDakp;Mearp;Keamp9op9qgkpmbezHdiOAlvCXorQLgrp5baipblbpEb:T:j83ibaocwfarp5eaipblbpEe:T:j83ibawaxakpmwDKYqk8AExm35Ps8E8Fgkp5baipblbpEd:T:j83ibaocKfakp5eaipblbpEi:T:j83ibaocafhoavclfgval6mbkkdnalae9pmbaiaeciGgvcitgofcbcaao9R;8kbaiabalcitfgwao;8qbbdnavTmbaiaipblbgraipblzgDpmlvorxmPsCXQL358E8Fgqczp:Segkclp:RepklaaipxbbjZbbjZbbjZbbjZpx;Zl81Z;Zl81Z;Zl81Z;Zl81Zakpxibbbibbbibbbibbbp9qp;6ep;NegkaraDpmbediwDqkzHOAKY8AEgrczp:Reczp:Sep;6ep;MegDaDp;Meakarczp:Sep;6ep;Megxaxp;Meakaqczp:Reczp:Sep;6ep;Megqaqp;Mep;Kep;Kep;Lepxbbbbbbbbbbbbbbbbp:4ep;Jepxb;:FSb;:FSb;:FSb;:FSgkp;Mepxbbn0bbn0bbn0bbn0grp;KepxFFbbFFbbFFbbFFbbgmp9oaxakp;Mearp;Keczp:Rep9qgxaqakp;Mearp;Keczp:ReaDakp;Mearp;Keamp9op9qgkpmbezHdiOAlvCXorQLgrp5baipblapEb:T:j83ibaiarp5eaipblapEe:T:j83iwaiaxakpmwDKYqk8AExm35Ps8E8Fgkp5baipblapEd:T:j83izaiakp5eaipblapEi:T:j83iKkawaiao;8qbbkk:Pddiue978Jjjjjbc;ab9Rhidnadcd4ae2glc98GgvTmbcbhdabheinaeaepbbbgocwp:Recwp:Sep;6eaocep:SepxbbjZbbjZbbjZbbjZp:UepxbbjFbbjFbbjFbbjFp9op;Mepkbbaeczfheadclfgdav6mbkkdnaval9pmbaialciGgdcdtgeVcbc;abae9R;8kbaiabavcdtfgvae;8qbbdnadTmbaiaipblbgocwp:Recwp:Sep;6eaocep:SepxbbjZbbjZbbjZbbjZp:UepxbbjFbbjFbbjFbbjFp9op;Mepklbkavaiae;8qbbkk9teiucbcbydj1jjbgeabcifc98GfgbBdj1jjbdndnabZbcztgd9nmbcuhiabad9RcFFifcz4nbcuSmekaehikaikkkebcjwklz9Tbb",t=new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,3,2,0,0,5,3,1,0,1,12,1,0,10,22,2,12,0,65,0,65,0,65,0,252,10,0,0,11,7,0,65,0,253,15,26,11]),n=new Uint8Array([32,0,65,2,1,106,34,33,3,128,11,4,13,64,6,253,10,7,15,116,127,5,8,12,40,16,19,54,20,9,27,255,113,17,42,67,24,23,146,148,18,14,22,45,70,69,56,114,101,21,25,63,75,136,108,28,118,29,73,115]);if(typeof WebAssembly!="object")return{supported:!1};var i=WebAssembly.validate(t)?e:r,s,a=WebAssembly.instantiate(o(i),{}).then(function(A){s=A.instance,s.exports.__wasm_call_ctors()});function o(A){for(var E=new Uint8Array(A.length),_=0;_<A.length;++_){var b=A.charCodeAt(_);E[_]=b>96?b-97:b>64?b-39:b+4}for(var S=0,_=0;_<A.length;++_)E[S++]=E[_]<60?n[E[_]]:(E[_]-60)*64+E[++_];return E.buffer.slice(0,S)}function c(A,E,_,b,S,I){var M=s.exports.sbrk,w=_+3&-4,x=M(w*b),v=M(S.length),R=new Uint8Array(s.exports.memory.buffer);R.set(S,v);var k=A(x,_,b,v,S.length);if(k==0&&I&&I(x,w,b),E.set(R.subarray(x,x+_*b)),M(x-M(0)),k!=0)throw new Error("Malformed buffer data: "+k)}var l={NONE:"",OCTAHEDRAL:"meshopt_decodeFilterOct",QUATERNION:"meshopt_decodeFilterQuat",EXPONENTIAL:"meshopt_decodeFilterExp"},u={ATTRIBUTES:"meshopt_decodeVertexBuffer",TRIANGLES:"meshopt_decodeIndexBuffer",INDICES:"meshopt_decodeIndexSequence"},h=[],d=0;function f(A){var E={object:new Worker(A),pending:0,requests:{}};return E.object.onmessage=function(_){var b=_.data;E.pending-=b.count,E.requests[b.id][b.action](b.value),delete E.requests[b.id]},E}function p(A){for(var E="var instance; var ready = WebAssembly.instantiate(new Uint8Array(["+new Uint8Array(o(i))+"]), {}).then(function(result) { instance = result.instance; instance.exports.__wasm_call_ctors(); });self.onmessage = workerProcess;"+c.toString()+m.toString(),_=new Blob([E],{type:"text/javascript"}),b=URL.createObjectURL(_),S=0;S<A;++S)h[S]=f(b);URL.revokeObjectURL(b)}function g(A,E,_,b,S){for(var I=h[0],M=1;M<h.length;++M)h[M].pending<I.pending&&(I=h[M]);return new Promise(function(w,x){var v=new Uint8Array(_),R=d++;I.pending+=A,I.requests[R]={resolve:w,reject:x},I.object.postMessage({id:R,count:A,size:E,source:v,mode:b,filter:S},[v.buffer])})}function m(A){a.then(function(){var E=A.data;try{var _=new Uint8Array(E.count*E.size);c(s.exports[E.mode],_,E.count,E.size,E.source,s.exports[E.filter]),self.postMessage({id:E.id,count:E.count,action:"resolve",value:_},[_.buffer])}catch(b){self.postMessage({id:E.id,count:E.count,action:"reject",value:b})}})}return{ready:a,supported:!0,useWorkers:function(A){p(A)},decodeVertexBuffer:function(A,E,_,b,S){c(s.exports.meshopt_decodeVertexBuffer,A,E,_,b,s.exports[l[S]])},decodeIndexBuffer:function(A,E,_,b){c(s.exports.meshopt_decodeIndexBuffer,A,E,_,b)},decodeIndexSequence:function(A,E,_,b){c(s.exports.meshopt_decodeIndexSequence,A,E,_,b)},decodeGltfBuffer:function(A,E,_,b,S,I){c(s.exports[u[S]],A,E,_,b,s.exports[l[I]])},decodeGltfBufferAsync:function(A,E,_,b,S){return h.length>0?g(A,E,_,u[b],l[S]):a.then(function(){var I=new Uint8Array(A*E);return c(s.exports[u[b]],I,A,E,_,s.exports[l[S]]),I})}}}();const jl=new WeakMap;class pI extends ci{constructor(e){super(e),this.decoderPath="",this.decoderConfig={},this.decoderBinary=null,this.decoderPending=null,this.workerLimit=4,this.workerPool=[],this.workerNextTaskID=1,this.workerSourceURL="",this.defaultAttributeIDs={position:"POSITION",normal:"NORMAL",color:"COLOR",uv:"TEX_COORD"},this.defaultAttributeTypes={position:"Float32Array",normal:"Float32Array",color:"Float32Array",uv:"Float32Array"}}setDecoderPath(e){return this.decoderPath=e,this}setDecoderConfig(e){return this.decoderConfig=e,this}setWorkerLimit(e){return this.workerLimit=e,this}load(e,t,n,i){const s=new Bi(this.manager);s.setPath(this.path),s.setResponseType("arraybuffer"),s.setRequestHeader(this.requestHeader),s.setWithCredentials(this.withCredentials),s.load(e,a=>{this.parse(a,t,i)},n,i)}parse(e,t,n=()=>{}){this.decodeDracoFile(e,t,null,null,gt,n).catch(n)}decodeDracoFile(e,t,n,i,s=bt,a=()=>{}){const o={attributeIDs:n||this.defaultAttributeIDs,attributeTypes:i||this.defaultAttributeTypes,useUniqueIDs:!!n,vertexColorSpace:s};return this.decodeGeometry(e,o).then(t).catch(a)}decodeGeometry(e,t){const n=JSON.stringify(t);if(jl.has(e)){const c=jl.get(e);if(c.key===n)return c.promise;if(e.byteLength===0)throw new Error("THREE.DRACOLoader: Unable to re-decode a buffer with different settings. Buffer has already been transferred.")}let i;const s=this.workerNextTaskID++,a=e.byteLength,o=this._getWorker(s,a).then(c=>(i=c,new Promise((l,u)=>{i._callbacks[s]={resolve:l,reject:u},i.postMessage({type:"decode",id:s,taskConfig:t,buffer:e},[e])}))).then(c=>this._createGeometry(c.geometry));return o.catch(()=>!0).then(()=>{i&&s&&this._releaseTask(i,s)}),jl.set(e,{key:n,promise:o}),o}_createGeometry(e){const t=new An;e.index&&t.setIndex(new Ct(e.index.array,1));for(let n=0;n<e.attributes.length;n++){const i=e.attributes[n],s=i.name,a=i.array,o=i.itemSize,c=new Ct(a,o);s==="color"&&(this._assignVertexColorSpace(c,i.vertexColorSpace),c.normalized=!(a instanceof Float32Array)),t.setAttribute(s,c)}return t}_assignVertexColorSpace(e,t){if(t!==gt)return;const n=new Me;for(let i=0,s=e.count;i<s;i++)n.fromBufferAttribute(e,i),Ye.colorSpaceToWorking(n,gt),e.setXYZ(i,n.r,n.g,n.b)}_loadLibrary(e,t){const n=new Bi(this.manager);return n.setPath(this.decoderPath),n.setResponseType(t),n.setWithCredentials(this.withCredentials),new Promise((i,s)=>{n.load(e,i,void 0,s)})}preload(){return this._initDecoder(),this}_initDecoder(){if(this.decoderPending)return this.decoderPending;const e=typeof WebAssembly!="object"||this.decoderConfig.type==="js",t=[];return e?t.push(this._loadLibrary("draco_decoder.js","text")):(t.push(this._loadLibrary("draco_wasm_wrapper.js","text")),t.push(this._loadLibrary("draco_decoder.wasm","arraybuffer"))),this.decoderPending=Promise.all(t).then(n=>{const i=n[0];e||(this.decoderConfig.wasmBinary=n[1]);const s=AI.toString(),a=["/* draco decoder */",i,"","/* worker */",s.substring(s.indexOf("{")+1,s.lastIndexOf("}"))].join(`
`);this.workerSourceURL=URL.createObjectURL(new Blob([a]))}),this.decoderPending}_getWorker(e,t){return this._initDecoder().then(()=>{if(this.workerPool.length<this.workerLimit){const i=new Worker(this.workerSourceURL);i._callbacks={},i._taskCosts={},i._taskLoad=0,i.postMessage({type:"init",decoderConfig:this.decoderConfig}),i.onmessage=function(s){const a=s.data;switch(a.type){case"decode":i._callbacks[a.id].resolve(a);break;case"error":i._callbacks[a.id].reject(a);break;default:console.error('THREE.DRACOLoader: Unexpected message, "'+a.type+'"')}},this.workerPool.push(i)}else this.workerPool.sort(function(i,s){return i._taskLoad>s._taskLoad?-1:1});const n=this.workerPool[this.workerPool.length-1];return n._taskCosts[e]=t,n._taskLoad+=t,n})}_releaseTask(e,t){e._taskLoad-=e._taskCosts[t],delete e._callbacks[t],delete e._taskCosts[t]}debug(){console.log("Task load: ",this.workerPool.map(e=>e._taskLoad))}dispose(){for(let e=0;e<this.workerPool.length;++e)this.workerPool[e].terminate();return this.workerPool.length=0,this.workerSourceURL!==""&&URL.revokeObjectURL(this.workerSourceURL),this}}function AI(){let r,e;onmessage=function(a){const o=a.data;switch(o.type){case"init":r=o.decoderConfig,e=new Promise(function(u){r.onModuleLoaded=function(h){u({draco:h})},DracoDecoderModule(r)});break;case"decode":const c=o.buffer,l=o.taskConfig;e.then(u=>{const h=u.draco,d=new h.Decoder;try{const f=t(h,d,new Int8Array(c),l),p=f.attributes.map(g=>g.array.buffer);f.index&&p.push(f.index.array.buffer),self.postMessage({type:"decode",id:o.id,geometry:f},p)}catch(f){console.error(f),self.postMessage({type:"error",id:o.id,error:f.message})}finally{h.destroy(d)}});break}};function t(a,o,c,l){const u=l.attributeIDs,h=l.attributeTypes;let d,f;const p=o.GetEncodedGeometryType(c);if(p===a.TRIANGULAR_MESH)d=new a.Mesh,f=o.DecodeArrayToMesh(c,c.byteLength,d);else if(p===a.POINT_CLOUD)d=new a.PointCloud,f=o.DecodeArrayToPointCloud(c,c.byteLength,d);else throw new Error("THREE.DRACOLoader: Unexpected geometry type.");if(!f.ok()||d.ptr===0)throw new Error("THREE.DRACOLoader: Decoding failed: "+f.error_msg());const g={index:null,attributes:[]};for(const m in u){const A=self[h[m]];let E,_;if(l.useUniqueIDs)_=u[m],E=o.GetAttributeByUniqueId(d,_);else{if(_=o.GetAttributeId(d,a[u[m]]),_===-1)continue;E=o.GetAttribute(d,_)}const b=i(a,o,d,m,A,E);m==="color"&&(b.vertexColorSpace=l.vertexColorSpace),g.attributes.push(b)}return p===a.TRIANGULAR_MESH&&(g.index=n(a,o,d)),a.destroy(d),g}function n(a,o,c){const u=c.num_faces()*3,h=u*4,d=a._malloc(h);o.GetTrianglesUInt32Array(c,h,d);const f=new Uint32Array(a.HEAPF32.buffer,d,u).slice();return a._free(d),{array:f,itemSize:1}}function i(a,o,c,l,u,h){const d=h.num_components(),p=c.num_points()*d,g=p*u.BYTES_PER_ELEMENT,m=s(a,u),A=a._malloc(g);o.GetAttributeDataArrayForAllPoints(c,h,m,g,A);const E=new u(a.HEAPF32.buffer,A,p).slice();return a._free(A),{name:l,array:E,itemSize:d}}function s(a,o){switch(o){case Float32Array:return a.DT_FLOAT32;case Int8Array:return a.DT_INT8;case Int16Array:return a.DT_INT16;case Int32Array:return a.DT_INT32;case Uint8Array:return a.DT_UINT8;case Uint16Array:return a.DT_UINT16;case Uint32Array:return a.DT_UINT32}}}function yp(r,e){if(e===r_)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),r;if(e===ku||e===gg){let t=r.getIndex();if(t===null){const a=[],o=r.getAttribute("position");if(o!==void 0){for(let c=0;c<o.count;c++)a.push(c);r.setIndex(a),t=r.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),r}const n=t.count-2,i=[];if(e===ku)for(let a=1;a<=n;a++)i.push(t.getX(0)),i.push(t.getX(a)),i.push(t.getX(a+1));else for(let a=0;a<n;a++)a%2===0?(i.push(t.getX(a)),i.push(t.getX(a+1)),i.push(t.getX(a+2))):(i.push(t.getX(a+2)),i.push(t.getX(a+1)),i.push(t.getX(a)));i.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");const s=r.clone();return s.setIndex(i),s.clearGroups(),s}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),r}class mI extends ci{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new vI(t)}),this.register(function(t){return new xI(t)}),this.register(function(t){return new BI(t)}),this.register(function(t){return new DI(t)}),this.register(function(t){return new LI(t)}),this.register(function(t){return new SI(t)}),this.register(function(t){return new CI(t)}),this.register(function(t){return new II(t)}),this.register(function(t){return new MI(t)}),this.register(function(t){return new EI(t)}),this.register(function(t){return new wI(t)}),this.register(function(t){return new yI(t)}),this.register(function(t){return new RI(t)}),this.register(function(t){return new TI(t)}),this.register(function(t){return new bI(t)}),this.register(function(t){return new FI(t)}),this.register(function(t){return new PI(t)})}load(e,t,n,i){const s=this;let a;if(this.resourcePath!=="")a=this.resourcePath;else if(this.path!==""){const l=Ha.extractUrlBase(e);a=Ha.resolveURL(l,this.path)}else a=Ha.extractUrlBase(e);this.manager.itemStart(e);const o=function(l){i?i(l):console.error(l),s.manager.itemError(e),s.manager.itemEnd(e)},c=new Bi(this.manager);c.setPath(this.path),c.setResponseType("arraybuffer"),c.setRequestHeader(this.requestHeader),c.setWithCredentials(this.withCredentials),c.load(e,function(l){try{s.parse(l,a,function(u){t(u),s.manager.itemEnd(e)},o)}catch(u){o(u)}},n,o)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,i){let s;const a={},o={},c=new TextDecoder;if(typeof e=="string")s=JSON.parse(e);else if(e instanceof ArrayBuffer)if(c.decode(new Uint8Array(e,0,4))===s0){try{a[Xe.KHR_BINARY_GLTF]=new UI(e)}catch(h){i&&i(h);return}s=JSON.parse(a[Xe.KHR_BINARY_GLTF].content)}else s=JSON.parse(c.decode(e));else s=e;if(s.asset===void 0||s.asset.version[0]<2){i&&i(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}const l=new jI(s,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});l.fileLoader.setRequestHeader(this.requestHeader);for(let u=0;u<this.pluginCallbacks.length;u++){const h=this.pluginCallbacks[u](l);h.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),o[h.name]=h,a[h.name]=!0}if(s.extensionsUsed)for(let u=0;u<s.extensionsUsed.length;++u){const h=s.extensionsUsed[u],d=s.extensionsRequired||[];switch(h){case Xe.KHR_MATERIALS_UNLIT:a[h]=new _I;break;case Xe.KHR_DRACO_MESH_COMPRESSION:a[h]=new NI(s,this.dracoLoader);break;case Xe.KHR_TEXTURE_TRANSFORM:a[h]=new OI;break;case Xe.KHR_MESH_QUANTIZATION:a[h]=new kI;break;default:d.indexOf(h)>=0&&o[h]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+h+'".')}}l.setExtensions(a),l.setPlugins(o),l.parse(n,i)}parseAsync(e,t){const n=this;return new Promise(function(i,s){n.parse(e,t,i,s)})}}function gI(){let r={};return{get:function(e){return r[e]},add:function(e,t){r[e]=t},remove:function(e){delete r[e]},removeAll:function(){r={}}}}const Xe={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"};class bI{constructor(e){this.parser=e,this.name=Xe.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){const e=this.parser,t=this.parser.json.nodes||[];for(let n=0,i=t.length;n<i;n++){const s=t[n];s.extensions&&s.extensions[this.name]&&s.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,s.extensions[this.name].light)}}_loadLight(e){const t=this.parser,n="light:"+e;let i=t.cache.get(n);if(i)return i;const s=t.json,c=((s.extensions&&s.extensions[this.name]||{}).lights||[])[e];let l;const u=new Me(16777215);c.color!==void 0&&u.setRGB(c.color[0],c.color[1],c.color[2],bt);const h=c.range!==void 0?c.range:0;switch(c.type){case"directional":l=new Gg(u),l.target.position.set(0,0,-1),l.add(l.target);break;case"point":l=new Qg(u),l.distance=h;break;case"spot":l=new FE(u),l.distance=h,c.spot=c.spot||{},c.spot.innerConeAngle=c.spot.innerConeAngle!==void 0?c.spot.innerConeAngle:0,c.spot.outerConeAngle=c.spot.outerConeAngle!==void 0?c.spot.outerConeAngle:Math.PI/4,l.angle=c.spot.outerConeAngle,l.penumbra=1-c.spot.innerConeAngle/c.spot.outerConeAngle,l.target.position.set(0,0,-1),l.add(l.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+c.type)}return l.position.set(0,0,0),Ci(l,c),c.intensity!==void 0&&(l.intensity=c.intensity),l.name=t.createUniqueName(c.name||"light_"+e),i=Promise.resolve(l),t.cache.add(n,i),i}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){const t=this,n=this.parser,s=n.json.nodes[e],o=(s.extensions&&s.extensions[this.name]||{}).light;return o===void 0?null:this._loadLight(o).then(function(c){return n._getNodeRef(t.cache,o,c)})}}let _I=class{constructor(){this.name=Xe.KHR_MATERIALS_UNLIT}getMaterialType(){return Ln}extendParams(e,t,n){const i=[];e.color=new Me(1,1,1),e.opacity=1;const s=t.pbrMetallicRoughness;if(s){if(Array.isArray(s.baseColorFactor)){const a=s.baseColorFactor;e.color.setRGB(a[0],a[1],a[2],bt),e.opacity=a[3]}s.baseColorTexture!==void 0&&i.push(n.assignTexture(e,"map",s.baseColorTexture,gt))}return Promise.all(i)}},EI=class{constructor(e){this.parser=e,this.name=Xe.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=i.extensions[this.name].emissiveStrength;return s!==void 0&&(t.emissiveIntensity=s),Promise.resolve()}},vI=class{constructor(e){this.parser=e,this.name=Xe.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:oi}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],a=i.extensions[this.name];if(a.clearcoatFactor!==void 0&&(t.clearcoat=a.clearcoatFactor),a.clearcoatTexture!==void 0&&s.push(n.assignTexture(t,"clearcoatMap",a.clearcoatTexture)),a.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=a.clearcoatRoughnessFactor),a.clearcoatRoughnessTexture!==void 0&&s.push(n.assignTexture(t,"clearcoatRoughnessMap",a.clearcoatRoughnessTexture)),a.clearcoatNormalTexture!==void 0&&(s.push(n.assignTexture(t,"clearcoatNormalMap",a.clearcoatNormalTexture)),a.clearcoatNormalTexture.scale!==void 0)){const o=a.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new Oe(o,o)}return Promise.all(s)}},xI=class{constructor(e){this.parser=e,this.name=Xe.KHR_MATERIALS_DISPERSION}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:oi}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=i.extensions[this.name];return t.dispersion=s.dispersion!==void 0?s.dispersion:0,Promise.resolve()}},yI=class{constructor(e){this.parser=e,this.name=Xe.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:oi}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],a=i.extensions[this.name];return a.iridescenceFactor!==void 0&&(t.iridescence=a.iridescenceFactor),a.iridescenceTexture!==void 0&&s.push(n.assignTexture(t,"iridescenceMap",a.iridescenceTexture)),a.iridescenceIor!==void 0&&(t.iridescenceIOR=a.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),a.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=a.iridescenceThicknessMinimum),a.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=a.iridescenceThicknessMaximum),a.iridescenceThicknessTexture!==void 0&&s.push(n.assignTexture(t,"iridescenceThicknessMap",a.iridescenceThicknessTexture)),Promise.all(s)}},SI=class{constructor(e){this.parser=e,this.name=Xe.KHR_MATERIALS_SHEEN}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:oi}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[];t.sheenColor=new Me(0,0,0),t.sheenRoughness=0,t.sheen=1;const a=i.extensions[this.name];if(a.sheenColorFactor!==void 0){const o=a.sheenColorFactor;t.sheenColor.setRGB(o[0],o[1],o[2],bt)}return a.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=a.sheenRoughnessFactor),a.sheenColorTexture!==void 0&&s.push(n.assignTexture(t,"sheenColorMap",a.sheenColorTexture,gt)),a.sheenRoughnessTexture!==void 0&&s.push(n.assignTexture(t,"sheenRoughnessMap",a.sheenRoughnessTexture)),Promise.all(s)}},CI=class{constructor(e){this.parser=e,this.name=Xe.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:oi}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],a=i.extensions[this.name];return a.transmissionFactor!==void 0&&(t.transmission=a.transmissionFactor),a.transmissionTexture!==void 0&&s.push(n.assignTexture(t,"transmissionMap",a.transmissionTexture)),Promise.all(s)}},II=class{constructor(e){this.parser=e,this.name=Xe.KHR_MATERIALS_VOLUME}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:oi}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],a=i.extensions[this.name];t.thickness=a.thicknessFactor!==void 0?a.thicknessFactor:0,a.thicknessTexture!==void 0&&s.push(n.assignTexture(t,"thicknessMap",a.thicknessTexture)),t.attenuationDistance=a.attenuationDistance||1/0;const o=a.attenuationColor||[1,1,1];return t.attenuationColor=new Me().setRGB(o[0],o[1],o[2],bt),Promise.all(s)}},MI=class{constructor(e){this.parser=e,this.name=Xe.KHR_MATERIALS_IOR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:oi}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=i.extensions[this.name];return t.ior=s.ior!==void 0?s.ior:1.5,Promise.resolve()}},wI=class{constructor(e){this.parser=e,this.name=Xe.KHR_MATERIALS_SPECULAR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:oi}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],a=i.extensions[this.name];t.specularIntensity=a.specularFactor!==void 0?a.specularFactor:1,a.specularTexture!==void 0&&s.push(n.assignTexture(t,"specularIntensityMap",a.specularTexture));const o=a.specularColorFactor||[1,1,1];return t.specularColor=new Me().setRGB(o[0],o[1],o[2],bt),a.specularColorTexture!==void 0&&s.push(n.assignTexture(t,"specularColorMap",a.specularColorTexture,gt)),Promise.all(s)}},TI=class{constructor(e){this.parser=e,this.name=Xe.EXT_MATERIALS_BUMP}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:oi}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],a=i.extensions[this.name];return t.bumpScale=a.bumpFactor!==void 0?a.bumpFactor:1,a.bumpTexture!==void 0&&s.push(n.assignTexture(t,"bumpMap",a.bumpTexture)),Promise.all(s)}},RI=class{constructor(e){this.parser=e,this.name=Xe.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:oi}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],a=i.extensions[this.name];return a.anisotropyStrength!==void 0&&(t.anisotropy=a.anisotropyStrength),a.anisotropyRotation!==void 0&&(t.anisotropyRotation=a.anisotropyRotation),a.anisotropyTexture!==void 0&&s.push(n.assignTexture(t,"anisotropyMap",a.anisotropyTexture)),Promise.all(s)}};class BI{constructor(e){this.parser=e,this.name=Xe.KHR_TEXTURE_BASISU}loadTexture(e){const t=this.parser,n=t.json,i=n.textures[e];if(!i.extensions||!i.extensions[this.name])return null;const s=i.extensions[this.name],a=t.options.ktx2Loader;if(!a){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,s.source,a)}}class DI{constructor(e){this.parser=e,this.name=Xe.EXT_TEXTURE_WEBP}loadTexture(e){const t=this.name,n=this.parser,i=n.json,s=i.textures[e];if(!s.extensions||!s.extensions[t])return null;const a=s.extensions[t],o=i.images[a.source];let c=n.textureLoader;if(o.uri){const l=n.options.manager.getHandler(o.uri);l!==null&&(c=l)}return n.loadTextureImage(e,a.source,c)}}class LI{constructor(e){this.parser=e,this.name=Xe.EXT_TEXTURE_AVIF}loadTexture(e){const t=this.name,n=this.parser,i=n.json,s=i.textures[e];if(!s.extensions||!s.extensions[t])return null;const a=s.extensions[t],o=i.images[a.source];let c=n.textureLoader;if(o.uri){const l=n.options.manager.getHandler(o.uri);l!==null&&(c=l)}return n.loadTextureImage(e,a.source,c)}}class FI{constructor(e){this.name=Xe.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){const t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){const i=n.extensions[this.name],s=this.parser.getDependency("buffer",i.buffer),a=this.parser.options.meshoptDecoder;if(!a||!a.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return s.then(function(o){const c=i.byteOffset||0,l=i.byteLength||0,u=i.count,h=i.byteStride,d=new Uint8Array(o,c,l);return a.decodeGltfBufferAsync?a.decodeGltfBufferAsync(u,h,d,i.mode,i.filter).then(function(f){return f.buffer}):a.ready.then(function(){const f=new ArrayBuffer(u*h);return a.decodeGltfBuffer(new Uint8Array(f),u,h,d,i.mode,i.filter),f})})}else return null}}let PI=class{constructor(e){this.name=Xe.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){const t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;const i=t.meshes[n.mesh];for(const l of i.primitives)if(l.mode!==Rn.TRIANGLES&&l.mode!==Rn.TRIANGLE_STRIP&&l.mode!==Rn.TRIANGLE_FAN&&l.mode!==void 0)return null;const a=n.extensions[this.name].attributes,o=[],c={};for(const l in a)o.push(this.parser.getDependency("accessor",a[l]).then(u=>(c[l]=u,c[l])));return o.length<1?null:(o.push(this.parser.createNodeMesh(e)),Promise.all(o).then(l=>{const u=l.pop(),h=u.isGroup?u.children:[u],d=l[0].count,f=[];for(const p of h){const g=new Pe,m=new B,A=new dn,E=new B(1,1,1),_=new hE(p.geometry,p.material,d);for(let b=0;b<d;b++)c.TRANSLATION&&m.fromBufferAttribute(c.TRANSLATION,b),c.ROTATION&&A.fromBufferAttribute(c.ROTATION,b),c.SCALE&&E.fromBufferAttribute(c.SCALE,b),_.setMatrixAt(b,g.compose(m,A,E));for(const b in c)if(b==="_COLOR_0"){const S=c[b];_.instanceColor=new Hu(S.array,S.itemSize,S.normalized)}else b!=="TRANSLATION"&&b!=="ROTATION"&&b!=="SCALE"&&p.geometry.setAttribute(b,c[b]);ft.prototype.copy.call(_,p),this.parser.assignFinalMaterial(_),f.push(_)}return u.isGroup?(u.clear(),u.add(...f),u):f[0]}))}};const s0="glTF",da=12,Sp={JSON:1313821514,BIN:5130562};class UI{constructor(e){this.name=Xe.KHR_BINARY_GLTF,this.content=null,this.body=null;const t=new DataView(e,0,da),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==s0)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");const i=this.header.length-da,s=new DataView(e,da);let a=0;for(;a<i;){const o=s.getUint32(a,!0);a+=4;const c=s.getUint32(a,!0);if(a+=4,c===Sp.JSON){const l=new Uint8Array(e,da+a,o);this.content=n.decode(l)}else if(c===Sp.BIN){const l=da+a;this.body=e.slice(l,l+o)}a+=o}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}}class NI{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=Xe.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){const n=this.json,i=this.dracoLoader,s=e.extensions[this.name].bufferView,a=e.extensions[this.name].attributes,o={},c={},l={};for(const u in a){const h=Xu[u]||u.toLowerCase();o[h]=a[u]}for(const u in e.attributes){const h=Xu[u]||u.toLowerCase();if(a[u]!==void 0){const d=n.accessors[e.attributes[u]],f=Pr[d.componentType];l[h]=f.name,c[h]=d.normalized===!0}}return t.getDependency("bufferView",s).then(function(u){return new Promise(function(h,d){i.decodeDracoFile(u,function(f){for(const p in f.attributes){const g=f.attributes[p],m=c[p];m!==void 0&&(g.normalized=m)}h(f)},o,l,bt,d)})})}}class OI{constructor(){this.name=Xe.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0||(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0),e}}class kI{constructor(){this.name=Xe.KHR_MESH_QUANTIZATION}}class r0 extends uo{constructor(e,t,n,i){super(e,t,n,i)}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,s=e*i*3+i;for(let a=0;a!==i;a++)t[a]=n[s+a];return t}interpolate_(e,t,n,i){const s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=o*2,l=o*3,u=i-t,h=(n-t)/u,d=h*h,f=d*h,p=e*l,g=p-l,m=-2*f+3*d,A=f-d,E=1-m,_=A-d+h;for(let b=0;b!==o;b++){const S=a[g+b+o],I=a[g+b+c]*u,M=a[p+b+o],w=a[p+b]*u;s[b]=E*S+_*I+m*M+A*w}return s}}const QI=new dn;class GI extends r0{interpolate_(e,t,n,i){const s=super.interpolate_(e,t,n,i);return QI.fromArray(s).normalize().toArray(s),s}}const Rn={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6},Pr={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},Cp={9728:Nt,9729:Ke,9984:co,9985:Ts,9986:$i,9987:un},Ip={33071:Dt,33648:Us,10497:$n},Yl={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},Xu={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},Qi={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},HI={CUBICSPLINE:void 0,LINEAR:Hr,STEP:Gr},Kl={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function zI(r){return r.DefaultMaterial===void 0&&(r.DefaultMaterial=new io({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:Xn})),r.DefaultMaterial}function ds(r,e,t){for(const n in t.extensions)r[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function Ci(r,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(r.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function VI(r,e,t){let n=!1,i=!1,s=!1;for(let l=0,u=e.length;l<u;l++){const h=e[l];if(h.POSITION!==void 0&&(n=!0),h.NORMAL!==void 0&&(i=!0),h.COLOR_0!==void 0&&(s=!0),n&&i&&s)break}if(!n&&!i&&!s)return Promise.resolve(r);const a=[],o=[],c=[];for(let l=0,u=e.length;l<u;l++){const h=e[l];if(n){const d=h.POSITION!==void 0?t.getDependency("accessor",h.POSITION):r.attributes.position;a.push(d)}if(i){const d=h.NORMAL!==void 0?t.getDependency("accessor",h.NORMAL):r.attributes.normal;o.push(d)}if(s){const d=h.COLOR_0!==void 0?t.getDependency("accessor",h.COLOR_0):r.attributes.color;c.push(d)}}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(c)]).then(function(l){const u=l[0],h=l[1],d=l[2];return n&&(r.morphAttributes.position=u),i&&(r.morphAttributes.normal=h),s&&(r.morphAttributes.color=d),r.morphTargetsRelative=!0,r})}function WI(r,e){if(r.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)r.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){const t=e.extras.targetNames;if(r.morphTargetInfluences.length===t.length){r.morphTargetDictionary={};for(let n=0,i=t.length;n<i;n++)r.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function qI(r){let e;const t=r.extensions&&r.extensions[Xe.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+Jl(t.attributes):e=r.indices+":"+Jl(r.attributes)+":"+r.mode,r.targets!==void 0)for(let n=0,i=r.targets.length;n<i;n++)e+=":"+Jl(r.targets[n]);return e}function Jl(r){let e="";const t=Object.keys(r).sort();for(let n=0,i=t.length;n<i;n++)e+=t[n]+":"+r[t[n]]+";";return e}function $u(r){switch(r){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function XI(r){return r.search(/\.jpe?g($|\?)/i)>0||r.search(/^data\:image\/jpeg/)===0?"image/jpeg":r.search(/\.webp($|\?)/i)>0||r.search(/^data\:image\/webp/)===0?"image/webp":r.search(/\.ktx2($|\?)/i)>0||r.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}const $I=new Pe;class jI{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new gI,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,i=-1,s=!1,a=-1;if(typeof navigator<"u"){const o=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(o)===!0;const c=o.match(/Version\/(\d+)/);i=n&&c?parseInt(c[1],10):-1,s=o.indexOf("Firefox")>-1,a=s?o.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&i<17||s&&a<98?this.textureLoader=new kg(this.options.manager):this.textureLoader=new kE(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new Bi(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){const n=this,i=this.json,s=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(a){return a._markDefs&&a._markDefs()}),Promise.all(this._invokeAll(function(a){return a.beforeRoot&&a.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(a){const o={scene:a[0][i.scene||0],scenes:a[0],animations:a[1],cameras:a[2],asset:i.asset,parser:n,userData:{}};return ds(s,o,i),Ci(o,i),Promise.all(n._invokeAll(function(c){return c.afterRoot&&c.afterRoot(o)})).then(function(){for(const c of o.scenes)c.updateMatrixWorld();e(o)})}).catch(t)}_markDefs(){const e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let i=0,s=t.length;i<s;i++){const a=t[i].joints;for(let o=0,c=a.length;o<c;o++)e[a[o]].isBone=!0}for(let i=0,s=e.length;i<s;i++){const a=e[i];a.mesh!==void 0&&(this._addNodeRef(this.meshCache,a.mesh),a.skin!==void 0&&(n[a.mesh].isSkinnedMesh=!0)),a.camera!==void 0&&this._addNodeRef(this.cameraCache,a.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;const i=n.clone(),s=(a,o)=>{const c=this.associations.get(a);c!=null&&this.associations.set(o,c);for(const[l,u]of a.children.entries())s(u,o.children[l])};return s(n,i),i.name+="_instance_"+e.uses[t]++,i}_invokeOne(e){const t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){const i=e(t[n]);if(i)return i}return null}_invokeAll(e){const t=Object.values(this.plugins);t.unshift(this);const n=[];for(let i=0;i<t.length;i++){const s=e(t[i]);s&&n.push(s)}return n}getDependency(e,t){const n=e+":"+t;let i=this.cache.get(n);if(!i){switch(e){case"scene":i=this.loadScene(t);break;case"node":i=this._invokeOne(function(s){return s.loadNode&&s.loadNode(t)});break;case"mesh":i=this._invokeOne(function(s){return s.loadMesh&&s.loadMesh(t)});break;case"accessor":i=this.loadAccessor(t);break;case"bufferView":i=this._invokeOne(function(s){return s.loadBufferView&&s.loadBufferView(t)});break;case"buffer":i=this.loadBuffer(t);break;case"material":i=this._invokeOne(function(s){return s.loadMaterial&&s.loadMaterial(t)});break;case"texture":i=this._invokeOne(function(s){return s.loadTexture&&s.loadTexture(t)});break;case"skin":i=this.loadSkin(t);break;case"animation":i=this._invokeOne(function(s){return s.loadAnimation&&s.loadAnimation(t)});break;case"camera":i=this.loadCamera(t);break;default:if(i=this._invokeOne(function(s){return s!=this&&s.getDependency&&s.getDependency(e,t)}),!i)throw new Error("Unknown type: "+e);break}this.cache.add(n,i)}return i}getDependencies(e){let t=this.cache.get(e);if(!t){const n=this,i=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(i.map(function(s,a){return n.getDependency(e,a)})),this.cache.add(e,t)}return t}loadBuffer(e){const t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[Xe.KHR_BINARY_GLTF].body);const i=this.options;return new Promise(function(s,a){n.load(Ha.resolveURL(t.uri,i.path),s,void 0,function(){a(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){const t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){const i=t.byteLength||0,s=t.byteOffset||0;return n.slice(s,s+i)})}loadAccessor(e){const t=this,n=this.json,i=this.json.accessors[e];if(i.bufferView===void 0&&i.sparse===void 0){const a=Yl[i.type],o=Pr[i.componentType],c=i.normalized===!0,l=new o(i.count*a);return Promise.resolve(new Ct(l,a,c))}const s=[];return i.bufferView!==void 0?s.push(this.getDependency("bufferView",i.bufferView)):s.push(null),i.sparse!==void 0&&(s.push(this.getDependency("bufferView",i.sparse.indices.bufferView)),s.push(this.getDependency("bufferView",i.sparse.values.bufferView))),Promise.all(s).then(function(a){const o=a[0],c=Yl[i.type],l=Pr[i.componentType],u=l.BYTES_PER_ELEMENT,h=u*c,d=i.byteOffset||0,f=i.bufferView!==void 0?n.bufferViews[i.bufferView].byteStride:void 0,p=i.normalized===!0;let g,m;if(f&&f!==h){const A=Math.floor(d/f),E="InterleavedBuffer:"+i.bufferView+":"+i.componentType+":"+A+":"+i.count;let _=t.cache.get(E);_||(g=new l(o,A*f,i.count*f/u),_=new rE(g,f/u),t.cache.add(E,_)),m=new xd(_,c,d%f/u,p)}else o===null?g=new l(i.count*c):g=new l(o,d,i.count*c),m=new Ct(g,c,p);if(i.sparse!==void 0){const A=Yl.SCALAR,E=Pr[i.sparse.indices.componentType],_=i.sparse.indices.byteOffset||0,b=i.sparse.values.byteOffset||0,S=new E(a[1],_,i.sparse.count*A),I=new l(a[2],b,i.sparse.count*c);o!==null&&(m=new Ct(m.array.slice(),m.itemSize,m.normalized)),m.normalized=!1;for(let M=0,w=S.length;M<w;M++){const x=S[M];if(m.setX(x,I[M*c]),c>=2&&m.setY(x,I[M*c+1]),c>=3&&m.setZ(x,I[M*c+2]),c>=4&&m.setW(x,I[M*c+3]),c>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}m.normalized=p}return m})}loadTexture(e){const t=this.json,n=this.options,s=t.textures[e].source,a=t.images[s];let o=this.textureLoader;if(a.uri){const c=n.manager.getHandler(a.uri);c!==null&&(o=c)}return this.loadTextureImage(e,s,o)}loadTextureImage(e,t,n){const i=this,s=this.json,a=s.textures[e],o=s.images[t],c=(o.uri||o.bufferView)+":"+a.sampler;if(this.textureCache[c])return this.textureCache[c];const l=this.loadImageSource(t,n).then(function(u){u.flipY=!1,u.name=a.name||o.name||"",u.name===""&&typeof o.uri=="string"&&o.uri.startsWith("data:image/")===!1&&(u.name=o.uri);const d=(s.samplers||{})[a.sampler]||{};return u.magFilter=Cp[d.magFilter]||Ke,u.minFilter=Cp[d.minFilter]||un,u.wrapS=Ip[d.wrapS]||$n,u.wrapT=Ip[d.wrapT]||$n,u.generateMipmaps=!u.isCompressedTexture&&u.minFilter!==Nt&&u.minFilter!==Ke,i.associations.set(u,{textures:e}),u}).catch(function(){return null});return this.textureCache[c]=l,l}loadImageSource(e,t){const n=this,i=this.json,s=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(h=>h.clone());const a=i.images[e],o=self.URL||self.webkitURL;let c=a.uri||"",l=!1;if(a.bufferView!==void 0)c=n.getDependency("bufferView",a.bufferView).then(function(h){l=!0;const d=new Blob([h],{type:a.mimeType});return c=o.createObjectURL(d),c});else if(a.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");const u=Promise.resolve(c).then(function(h){return new Promise(function(d,f){let p=d;t.isImageBitmapLoader===!0&&(p=function(g){const m=new St(g);m.needsUpdate=!0,d(m)}),t.load(Ha.resolveURL(h,s.path),p,void 0,f)})}).then(function(h){return l===!0&&o.revokeObjectURL(c),Ci(h,a),h.userData.mimeType=a.mimeType||XI(a.uri),h}).catch(function(h){throw console.error("THREE.GLTFLoader: Couldn't load texture",c),h});return this.sourceCache[e]=u,u}assignTexture(e,t,n,i){const s=this;return this.getDependency("texture",n.index).then(function(a){if(!a)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(a=a.clone(),a.channel=n.texCoord),s.extensions[Xe.KHR_TEXTURE_TRANSFORM]){const o=n.extensions!==void 0?n.extensions[Xe.KHR_TEXTURE_TRANSFORM]:void 0;if(o){const c=s.associations.get(a);a=s.extensions[Xe.KHR_TEXTURE_TRANSFORM].extendTexture(a,o),s.associations.set(a,c)}}return i!==void 0&&(a.colorSpace=i),e[t]=a,a})}assignFinalMaterial(e){const t=e.geometry;let n=e.material;const i=t.attributes.tangent===void 0,s=t.attributes.color!==void 0,a=t.attributes.normal===void 0;if(e.isPoints){const o="PointsMaterial:"+n.uuid;let c=this.cache.get(o);c||(c=new Dg,qn.prototype.copy.call(c,n),c.color.copy(n.color),c.map=n.map,c.sizeAttenuation=!1,this.cache.add(o,c)),n=c}else if(e.isLine){const o="LineBasicMaterial:"+n.uuid;let c=this.cache.get(o);c||(c=new Bg,qn.prototype.copy.call(c,n),c.color.copy(n.color),c.map=n.map,this.cache.add(o,c)),n=c}if(i||s||a){let o="ClonedMaterial:"+n.uuid+":";i&&(o+="derivative-tangents:"),s&&(o+="vertex-colors:"),a&&(o+="flat-shading:");let c=this.cache.get(o);c||(c=n.clone(),s&&(c.vertexColors=!0),a&&(c.flatShading=!0),i&&(c.normalScale&&(c.normalScale.y*=-1),c.clearcoatNormalScale&&(c.clearcoatNormalScale.y*=-1)),this.cache.add(o,c),this.associations.set(c,this.associations.get(n))),n=c}e.material=n}getMaterialType(){return io}loadMaterial(e){const t=this,n=this.json,i=this.extensions,s=n.materials[e];let a;const o={},c=s.extensions||{},l=[];if(c[Xe.KHR_MATERIALS_UNLIT]){const h=i[Xe.KHR_MATERIALS_UNLIT];a=h.getMaterialType(),l.push(h.extendParams(o,s,t))}else{const h=s.pbrMetallicRoughness||{};if(o.color=new Me(1,1,1),o.opacity=1,Array.isArray(h.baseColorFactor)){const d=h.baseColorFactor;o.color.setRGB(d[0],d[1],d[2],bt),o.opacity=d[3]}h.baseColorTexture!==void 0&&l.push(t.assignTexture(o,"map",h.baseColorTexture,gt)),o.metalness=h.metallicFactor!==void 0?h.metallicFactor:1,o.roughness=h.roughnessFactor!==void 0?h.roughnessFactor:1,h.metallicRoughnessTexture!==void 0&&(l.push(t.assignTexture(o,"metalnessMap",h.metallicRoughnessTexture)),l.push(t.assignTexture(o,"roughnessMap",h.metallicRoughnessTexture))),a=this._invokeOne(function(d){return d.getMaterialType&&d.getMaterialType(e)}),l.push(Promise.all(this._invokeAll(function(d){return d.extendMaterialParams&&d.extendMaterialParams(e,o)})))}s.doubleSided===!0&&(o.side=Vt);const u=s.alphaMode||Kl.OPAQUE;if(u===Kl.BLEND?(o.transparent=!0,o.depthWrite=!1):(o.transparent=!1,u===Kl.MASK&&(o.alphaTest=s.alphaCutoff!==void 0?s.alphaCutoff:.5)),s.normalTexture!==void 0&&a!==Ln&&(l.push(t.assignTexture(o,"normalMap",s.normalTexture)),o.normalScale=new Oe(1,1),s.normalTexture.scale!==void 0)){const h=s.normalTexture.scale;o.normalScale.set(h,h)}if(s.occlusionTexture!==void 0&&a!==Ln&&(l.push(t.assignTexture(o,"aoMap",s.occlusionTexture)),s.occlusionTexture.strength!==void 0&&(o.aoMapIntensity=s.occlusionTexture.strength)),s.emissiveFactor!==void 0&&a!==Ln){const h=s.emissiveFactor;o.emissive=new Me().setRGB(h[0],h[1],h[2],bt)}return s.emissiveTexture!==void 0&&a!==Ln&&l.push(t.assignTexture(o,"emissiveMap",s.emissiveTexture,gt)),Promise.all(l).then(function(){const h=new a(o);return s.name&&(h.name=s.name),Ci(h,s),t.associations.set(h,{materials:e}),s.extensions&&ds(i,h,s),h})}createUniqueName(e){const t=Je.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){const t=this,n=this.extensions,i=this.primitiveCache;function s(o){return n[Xe.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(o,t).then(function(c){return Mp(c,o,t)})}const a=[];for(let o=0,c=e.length;o<c;o++){const l=e[o],u=qI(l),h=i[u];if(h)a.push(h.promise);else{let d;l.extensions&&l.extensions[Xe.KHR_DRACO_MESH_COMPRESSION]?d=s(l):d=Mp(new An,l,t),i[u]={primitive:l,promise:d},a.push(d)}}return Promise.all(a)}loadMesh(e){const t=this,n=this.json,i=this.extensions,s=n.meshes[e],a=s.primitives,o=[];for(let c=0,l=a.length;c<l;c++){const u=a[c].material===void 0?zI(this.cache):this.getDependency("material",a[c].material);o.push(u)}return o.push(t.loadGeometries(a)),Promise.all(o).then(function(c){const l=c.slice(0,c.length-1),u=c[c.length-1],h=[];for(let f=0,p=u.length;f<p;f++){const g=u[f],m=a[f];let A;const E=l[f];if(m.mode===Rn.TRIANGLES||m.mode===Rn.TRIANGLE_STRIP||m.mode===Rn.TRIANGLE_FAN||m.mode===void 0)A=s.isSkinnedMesh===!0?new oE(g,E):new ut(g,E),A.isSkinnedMesh===!0&&A.normalizeSkinWeights(),m.mode===Rn.TRIANGLE_STRIP?A.geometry=yp(A.geometry,gg):m.mode===Rn.TRIANGLE_FAN&&(A.geometry=yp(A.geometry,ku));else if(m.mode===Rn.LINES)A=new pE(g,E);else if(m.mode===Rn.LINE_STRIP)A=new no(g,E);else if(m.mode===Rn.LINE_LOOP)A=new AE(g,E);else if(m.mode===Rn.POINTS)A=new mE(g,E);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+m.mode);Object.keys(A.geometry.morphAttributes).length>0&&WI(A,s),A.name=t.createUniqueName(s.name||"mesh_"+e),Ci(A,s),m.extensions&&ds(i,A,m),t.assignFinalMaterial(A),h.push(A)}for(let f=0,p=h.length;f<p;f++)t.associations.set(h[f],{meshes:e,primitives:f});if(h.length===1)return s.extensions&&ds(i,h[0],s),h[0];const d=new Yi;s.extensions&&ds(i,d,s),t.associations.set(d,{meshes:e});for(let f=0,p=h.length;f<p;f++)d.add(h[f]);return d})}loadCamera(e){let t;const n=this.json.cameras[e],i=n[n.type];if(!i){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new Xt(kc.radToDeg(i.yfov),i.aspectRatio||1,i.znear||1,i.zfar||2e6):n.type==="orthographic"&&(t=new Zr(-i.xmag,i.xmag,i.ymag,-i.ymag,i.znear,i.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),Ci(t,n),Promise.resolve(t)}loadSkin(e){const t=this.json.skins[e],n=[];for(let i=0,s=t.joints.length;i<s;i++)n.push(this._loadNodeShallow(t.joints[i]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(i){const s=i.pop(),a=i,o=[],c=[];for(let l=0,u=a.length;l<u;l++){const h=a[l];if(h){o.push(h);const d=new Pe;s!==null&&d.fromArray(s.array,l*16),c.push(d)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[l])}return new yd(o,c)})}loadAnimation(e){const t=this.json,n=this,i=t.animations[e],s=i.name?i.name:"animation_"+e,a=[],o=[],c=[],l=[],u=[];for(let h=0,d=i.channels.length;h<d;h++){const f=i.channels[h],p=i.samplers[f.sampler],g=f.target,m=g.node,A=i.parameters!==void 0?i.parameters[p.input]:p.input,E=i.parameters!==void 0?i.parameters[p.output]:p.output;g.node!==void 0&&(a.push(this.getDependency("node",m)),o.push(this.getDependency("accessor",A)),c.push(this.getDependency("accessor",E)),l.push(p),u.push(g))}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(c),Promise.all(l),Promise.all(u)]).then(function(h){const d=h[0],f=h[1],p=h[2],g=h[3],m=h[4],A=[];for(let E=0,_=d.length;E<_;E++){const b=d[E],S=f[E],I=p[E],M=g[E],w=m[E];if(b===void 0)continue;b.updateMatrix&&b.updateMatrix();const x=n._createAnimationTracks(b,S,I,M,w);if(x)for(let v=0;v<x.length;v++)A.push(x[v])}return new Vu(s,void 0,A)})}createNodeMesh(e){const t=this.json,n=this,i=t.nodes[e];return i.mesh===void 0?null:n.getDependency("mesh",i.mesh).then(function(s){const a=n._getNodeRef(n.meshCache,i.mesh,s);return i.weights!==void 0&&a.traverse(function(o){if(o.isMesh)for(let c=0,l=i.weights.length;c<l;c++)o.morphTargetInfluences[c]=i.weights[c]}),a})}loadNode(e){const t=this.json,n=this,i=t.nodes[e],s=n._loadNodeShallow(e),a=[],o=i.children||[];for(let l=0,u=o.length;l<u;l++)a.push(n.getDependency("node",o[l]));const c=i.skin===void 0?Promise.resolve(null):n.getDependency("skin",i.skin);return Promise.all([s,Promise.all(a),c]).then(function(l){const u=l[0],h=l[1],d=l[2];d!==null&&u.traverse(function(f){f.isSkinnedMesh&&f.bind(d,$I)});for(let f=0,p=h.length;f<p;f++)u.add(h[f]);return u})}_loadNodeShallow(e){const t=this.json,n=this.extensions,i=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];const s=t.nodes[e],a=s.name?i.createUniqueName(s.name):"",o=[],c=i._invokeOne(function(l){return l.createNodeMesh&&l.createNodeMesh(e)});return c&&o.push(c),s.camera!==void 0&&o.push(i.getDependency("camera",s.camera).then(function(l){return i._getNodeRef(i.cameraCache,s.camera,l)})),i._invokeAll(function(l){return l.createNodeAttachment&&l.createNodeAttachment(e)}).forEach(function(l){o.push(l)}),this.nodeCache[e]=Promise.all(o).then(function(l){let u;if(s.isBone===!0?u=new Rg:l.length>1?u=new Yi:l.length===1?u=l[0]:u=new ft,u!==l[0])for(let h=0,d=l.length;h<d;h++)u.add(l[h]);if(s.name&&(u.userData.name=s.name,u.name=a),Ci(u,s),s.extensions&&ds(n,u,s),s.matrix!==void 0){const h=new Pe;h.fromArray(s.matrix),u.applyMatrix4(h)}else s.translation!==void 0&&u.position.fromArray(s.translation),s.rotation!==void 0&&u.quaternion.fromArray(s.rotation),s.scale!==void 0&&u.scale.fromArray(s.scale);if(!i.associations.has(u))i.associations.set(u,{});else if(s.mesh!==void 0&&i.meshCache.refs[s.mesh]>1){const h=i.associations.get(u);i.associations.set(u,{...h})}return i.associations.get(u).nodes=e,u}),this.nodeCache[e]}loadScene(e){const t=this.extensions,n=this.json.scenes[e],i=this,s=new Yi;n.name&&(s.name=i.createUniqueName(n.name)),Ci(s,n),n.extensions&&ds(t,s,n);const a=n.nodes||[],o=[];for(let c=0,l=a.length;c<l;c++)o.push(i.getDependency("node",a[c]));return Promise.all(o).then(function(c){for(let u=0,h=c.length;u<h;u++)s.add(c[u]);const l=u=>{const h=new Map;for(const[d,f]of i.associations)(d instanceof qn||d instanceof St)&&h.set(d,f);return u.traverse(d=>{const f=i.associations.get(d);f!=null&&h.set(d,f)}),h};return i.associations=l(s),s})}_createAnimationTracks(e,t,n,i,s){const a=[],o=e.name?e.name:e.uuid,c=[];Qi[s.path]===Qi.weights?e.traverse(function(d){d.morphTargetInfluences&&c.push(d.name?d.name:d.uuid)}):c.push(o);let l;switch(Qi[s.path]){case Qi.weights:l=Wr;break;case Qi.rotation:l=qr;break;case Qi.translation:case Qi.scale:l=Xr;break;default:switch(n.itemSize){case 1:l=Wr;break;case 2:case 3:default:l=Xr;break}break}const u=i.interpolation!==void 0?HI[i.interpolation]:Hr,h=this._getArrayFromAccessor(n);for(let d=0,f=c.length;d<f;d++){const p=new l(c[d]+"."+Qi[s.path],t.array,h,u);i.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(p),a.push(p)}return a}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){const n=$u(t.constructor),i=new Float32Array(t.length);for(let s=0,a=t.length;s<a;s++)i[s]=t[s]*n;t=i}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){const i=this instanceof qr?GI:r0;return new i(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}}function YI(r,e,t){const n=e.attributes,i=new hn;if(n.POSITION!==void 0){const o=t.json.accessors[n.POSITION],c=o.min,l=o.max;if(c!==void 0&&l!==void 0){if(i.set(new B(c[0],c[1],c[2]),new B(l[0],l[1],l[2])),o.normalized){const u=$u(Pr[o.componentType]);i.min.multiplyScalar(u),i.max.multiplyScalar(u)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;const s=e.targets;if(s!==void 0){const o=new B,c=new B;for(let l=0,u=s.length;l<u;l++){const h=s[l];if(h.POSITION!==void 0){const d=t.json.accessors[h.POSITION],f=d.min,p=d.max;if(f!==void 0&&p!==void 0){if(c.setX(Math.max(Math.abs(f[0]),Math.abs(p[0]))),c.setY(Math.max(Math.abs(f[1]),Math.abs(p[1]))),c.setZ(Math.max(Math.abs(f[2]),Math.abs(p[2]))),d.normalized){const g=$u(Pr[d.componentType]);c.multiplyScalar(g)}o.max(c)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}i.expandByVector(o)}r.boundingBox=i;const a=new Un;i.getCenter(a.center),a.radius=i.min.distanceTo(i.max)/2,r.boundingSphere=a}function Mp(r,e,t){const n=e.attributes,i=[];function s(a,o){return t.getDependency("accessor",a).then(function(c){r.setAttribute(o,c)})}for(const a in n){const o=Xu[a]||a.toLowerCase();o in r.attributes||i.push(s(n[a],o))}if(e.indices!==void 0&&!r.index){const a=t.getDependency("accessor",e.indices).then(function(o){r.setIndex(o)});i.push(a)}return Ye.workingColorSpace!==bt&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${Ye.workingColorSpace}" not supported.`),Ci(r,e),YI(r,e,t),Promise.all(i).then(function(){return e.targets!==void 0?VI(r,e.targets,t):r})}class KI{constructor(e=4){this.pool=e,this.queue=[],this.workers=[],this.workersResolve=[],this.workerStatus=0,this.workerCreator=null}_initWorker(e){if(!this.workers[e]){const t=this.workerCreator();t.addEventListener("message",this._onMessage.bind(this,e)),this.workers[e]=t}}_getIdleWorker(){for(let e=0;e<this.pool;e++)if(!(this.workerStatus&1<<e))return e;return-1}_onMessage(e,t){const n=this.workersResolve[e];if(n&&n(t),this.queue.length){const{resolve:i,msg:s,transfer:a}=this.queue.shift();this.workersResolve[e]=i,this.workers[e].postMessage(s,a)}else this.workerStatus^=1<<e}setWorkerCreator(e){this.workerCreator=e}setWorkerLimit(e){this.pool=e}postMessage(e,t){return new Promise(n=>{const i=this._getIdleWorker();i!==-1?(this._initWorker(i),this.workerStatus|=1<<i,this.workersResolve[i]=n,this.workers[i].postMessage(e,t)):this.queue.push({resolve:n,msg:e,transfer:t})})}dispose(){this.workers.forEach(e=>e.terminate()),this.workersResolve.length=0,this.workers.length=0,this.queue.length=0,this.workerStatus=0}}const JI=0,wp=2,ZI=1,Tp=2,eM=0,tM=1,nM=10,iM=0,a0=9,o0=15,c0=16,l0=22,h0=37,u0=43,d0=76,f0=83,p0=97,A0=100,m0=103,g0=109,sM=131,rM=132,aM=133,oM=134,cM=137,lM=138,hM=141,uM=142,dM=145,fM=146,b0=148,_0=152,pM=157,AM=158,E0=165,v0=166,Dd=1000066e3;class mM{constructor(){this.vkFormat=0,this.typeSize=1,this.pixelWidth=0,this.pixelHeight=0,this.pixelDepth=0,this.layerCount=0,this.faceCount=1,this.supercompressionScheme=0,this.levels=[],this.dataFormatDescriptor=[{vendorId:0,descriptorType:0,descriptorBlockSize:0,versionNumber:2,colorModel:0,colorPrimaries:1,transferFunction:2,flags:0,texelBlockDimension:[0,0,0,0],bytesPlane:[0,0,0,0,0,0,0,0],samples:[]}],this.keyValue={},this.globalData=null}}class fa{constructor(e,t,n,i){this._dataView=void 0,this._littleEndian=void 0,this._offset=void 0,this._dataView=new DataView(e.buffer,e.byteOffset+t,n),this._littleEndian=i,this._offset=0}_nextUint8(){const e=this._dataView.getUint8(this._offset);return this._offset+=1,e}_nextUint16(){const e=this._dataView.getUint16(this._offset,this._littleEndian);return this._offset+=2,e}_nextUint32(){const e=this._dataView.getUint32(this._offset,this._littleEndian);return this._offset+=4,e}_nextUint64(){const e=this._dataView.getUint32(this._offset,this._littleEndian)+4294967296*this._dataView.getUint32(this._offset+4,this._littleEndian);return this._offset+=8,e}_nextInt32(){const e=this._dataView.getInt32(this._offset,this._littleEndian);return this._offset+=4,e}_nextUint8Array(e){const t=new Uint8Array(this._dataView.buffer,this._dataView.byteOffset+this._offset,e);return this._offset+=e,t}_skip(e){return this._offset+=e,this}_scan(e,t){t===void 0&&(t=0);const n=this._offset;let i=0;for(;this._dataView.getUint8(this._offset)!==t&&i<e;)i++,this._offset++;return i<e&&this._offset++,new Uint8Array(this._dataView.buffer,this._dataView.byteOffset+n,i)}}const rn=[171,75,84,88,32,50,48,187,13,10,26,10];function Rp(r){return new TextDecoder().decode(r)}function gM(r){const e=new Uint8Array(r.buffer,r.byteOffset,rn.length);if(e[0]!==rn[0]||e[1]!==rn[1]||e[2]!==rn[2]||e[3]!==rn[3]||e[4]!==rn[4]||e[5]!==rn[5]||e[6]!==rn[6]||e[7]!==rn[7]||e[8]!==rn[8]||e[9]!==rn[9]||e[10]!==rn[10]||e[11]!==rn[11])throw new Error("Missing KTX 2.0 identifier.");const t=new mM,n=17*Uint32Array.BYTES_PER_ELEMENT,i=new fa(r,rn.length,n,!0);t.vkFormat=i._nextUint32(),t.typeSize=i._nextUint32(),t.pixelWidth=i._nextUint32(),t.pixelHeight=i._nextUint32(),t.pixelDepth=i._nextUint32(),t.layerCount=i._nextUint32(),t.faceCount=i._nextUint32();const s=i._nextUint32();t.supercompressionScheme=i._nextUint32();const a=i._nextUint32(),o=i._nextUint32(),c=i._nextUint32(),l=i._nextUint32(),u=i._nextUint64(),h=i._nextUint64(),d=new fa(r,rn.length+n,3*s*8,!0);for(let W=0;W<s;W++)t.levels.push({levelData:new Uint8Array(r.buffer,r.byteOffset+d._nextUint64(),d._nextUint64()),uncompressedByteLength:d._nextUint64()});const f=new fa(r,a,o,!0),p={vendorId:f._skip(4)._nextUint16(),descriptorType:f._nextUint16(),versionNumber:f._nextUint16(),descriptorBlockSize:f._nextUint16(),colorModel:f._nextUint8(),colorPrimaries:f._nextUint8(),transferFunction:f._nextUint8(),flags:f._nextUint8(),texelBlockDimension:[f._nextUint8(),f._nextUint8(),f._nextUint8(),f._nextUint8()],bytesPlane:[f._nextUint8(),f._nextUint8(),f._nextUint8(),f._nextUint8(),f._nextUint8(),f._nextUint8(),f._nextUint8(),f._nextUint8()],samples:[]},g=(p.descriptorBlockSize/4-6)/4;for(let W=0;W<g;W++){const Q={bitOffset:f._nextUint16(),bitLength:f._nextUint8(),channelType:f._nextUint8(),samplePosition:[f._nextUint8(),f._nextUint8(),f._nextUint8(),f._nextUint8()],sampleLower:-1/0,sampleUpper:1/0};64&Q.channelType?(Q.sampleLower=f._nextInt32(),Q.sampleUpper=f._nextInt32()):(Q.sampleLower=f._nextUint32(),Q.sampleUpper=f._nextUint32()),p.samples[W]=Q}t.dataFormatDescriptor.length=0,t.dataFormatDescriptor.push(p);const m=new fa(r,c,l,!0);for(;m._offset<l;){const W=m._nextUint32(),Q=m._scan(W),Y=Rp(Q);if(t.keyValue[Y]=m._nextUint8Array(W-Q.byteLength-1),Y.match(/^ktx/i)){const ne=Rp(t.keyValue[Y]);t.keyValue[Y]=ne.substring(0,ne.lastIndexOf("\0"))}m._skip(W%4?4-W%4:0)}if(h<=0)return t;const A=new fa(r,u,h,!0),E=A._nextUint16(),_=A._nextUint16(),b=A._nextUint32(),S=A._nextUint32(),I=A._nextUint32(),M=A._nextUint32(),w=[];for(let W=0;W<s;W++)w.push({imageFlags:A._nextUint32(),rgbSliceByteOffset:A._nextUint32(),rgbSliceByteLength:A._nextUint32(),alphaSliceByteOffset:A._nextUint32(),alphaSliceByteLength:A._nextUint32()});const x=u+A._offset,v=x+b,R=v+S,k=R+I,F=new Uint8Array(r.buffer,r.byteOffset+x,b),P=new Uint8Array(r.buffer,r.byteOffset+v,S),G=new Uint8Array(r.buffer,r.byteOffset+R,I),O=new Uint8Array(r.buffer,r.byteOffset+k,M);return t.globalData={endpointCount:E,selectorCount:_,imageDescs:w,endpointsData:F,selectorsData:P,tablesData:G,extendedData:O},t}let Zl,Si,ju;const eh={env:{emscripten_notify_memory_growth:function(r){ju=new Uint8Array(Si.exports.memory.buffer)}}};class bM{init(){return Zl||(Zl=typeof fetch<"u"?fetch("data:application/wasm;base64,"+Bp).then(e=>e.arrayBuffer()).then(e=>WebAssembly.instantiate(e,eh)).then(this._init):WebAssembly.instantiate(Buffer.from(Bp,"base64"),eh).then(this._init),Zl)}_init(e){Si=e.instance,eh.env.emscripten_notify_memory_growth(0)}decode(e,t=0){if(!Si)throw new Error("ZSTDDecoder: Await .init() before decoding.");const n=e.byteLength,i=Si.exports.malloc(n);ju.set(e,i),t=t||Number(Si.exports.ZSTD_findDecompressedSize(i,n));const s=Si.exports.malloc(t),a=Si.exports.ZSTD_decompress(s,t,i,n),o=ju.slice(s,s+a);return Si.exports.free(i),Si.exports.free(s),o}}const Bp="AGFzbQEAAAABpQEVYAF/AX9gAn9/AGADf39/AX9gBX9/f39/AX9gAX8AYAJ/fwF/YAR/f39/AX9gA39/fwBgBn9/f39/fwF/YAd/f39/f39/AX9gAn9/AX5gAn5+AX5gAABgBX9/f39/AGAGf39/f39/AGAIf39/f39/f38AYAl/f39/f39/f38AYAABf2AIf39/f39/f38Bf2ANf39/f39/f39/f39/fwF/YAF/AX4CJwEDZW52H2Vtc2NyaXB0ZW5fbm90aWZ5X21lbW9yeV9ncm93dGgABANpaAEFAAAFAgEFCwACAQABAgIFBQcAAwABDgsBAQcAEhMHAAUBDAQEAAANBwQCAgYCBAgDAwMDBgEACQkHBgICAAYGAgQUBwYGAwIGAAMCAQgBBwUGCgoEEQAEBAEIAwgDBQgDEA8IAAcABAUBcAECAgUEAQCAAgYJAX8BQaCgwAILB2AHBm1lbW9yeQIABm1hbGxvYwAoBGZyZWUAJgxaU1REX2lzRXJyb3IAaBlaU1REX2ZpbmREZWNvbXByZXNzZWRTaXplAFQPWlNURF9kZWNvbXByZXNzAEoGX3N0YXJ0ACQJBwEAQQELASQKussBaA8AIAAgACgCBCABajYCBAsZACAAKAIAIAAoAgRBH3F0QQAgAWtBH3F2CwgAIABBiH9LC34BBH9BAyEBIAAoAgQiA0EgTQRAIAAoAggiASAAKAIQTwRAIAAQDQ8LIAAoAgwiAiABRgRAQQFBAiADQSBJGw8LIAAgASABIAJrIANBA3YiBCABIARrIAJJIgEbIgJrIgQ2AgggACADIAJBA3RrNgIEIAAgBCgAADYCAAsgAQsUAQF/IAAgARACIQIgACABEAEgAgv3AQECfyACRQRAIABCADcCACAAQQA2AhAgAEIANwIIQbh/DwsgACABNgIMIAAgAUEEajYCECACQQRPBEAgACABIAJqIgFBfGoiAzYCCCAAIAMoAAA2AgAgAUF/ai0AACIBBEAgAEEIIAEQFGs2AgQgAg8LIABBADYCBEF/DwsgACABNgIIIAAgAS0AACIDNgIAIAJBfmoiBEEBTQRAIARBAWtFBEAgACABLQACQRB0IANyIgM2AgALIAAgAS0AAUEIdCADajYCAAsgASACakF/ai0AACIBRQRAIABBADYCBEFsDwsgAEEoIAEQFCACQQN0ams2AgQgAgsWACAAIAEpAAA3AAAgACABKQAINwAICy8BAX8gAUECdEGgHWooAgAgACgCAEEgIAEgACgCBGprQR9xdnEhAiAAIAEQASACCyEAIAFCz9bTvtLHq9lCfiAAfEIfiUKHla+vmLbem55/fgsdAQF/IAAoAgggACgCDEYEfyAAKAIEQSBGBUEACwuCBAEDfyACQYDAAE8EQCAAIAEgAhBnIAAPCyAAIAJqIQMCQCAAIAFzQQNxRQRAAkAgAkEBSARAIAAhAgwBCyAAQQNxRQRAIAAhAgwBCyAAIQIDQCACIAEtAAA6AAAgAUEBaiEBIAJBAWoiAiADTw0BIAJBA3ENAAsLAkAgA0F8cSIEQcAASQ0AIAIgBEFAaiIFSw0AA0AgAiABKAIANgIAIAIgASgCBDYCBCACIAEoAgg2AgggAiABKAIMNgIMIAIgASgCEDYCECACIAEoAhQ2AhQgAiABKAIYNgIYIAIgASgCHDYCHCACIAEoAiA2AiAgAiABKAIkNgIkIAIgASgCKDYCKCACIAEoAiw2AiwgAiABKAIwNgIwIAIgASgCNDYCNCACIAEoAjg2AjggAiABKAI8NgI8IAFBQGshASACQUBrIgIgBU0NAAsLIAIgBE8NAQNAIAIgASgCADYCACABQQRqIQEgAkEEaiICIARJDQALDAELIANBBEkEQCAAIQIMAQsgA0F8aiIEIABJBEAgACECDAELIAAhAgNAIAIgAS0AADoAACACIAEtAAE6AAEgAiABLQACOgACIAIgAS0AAzoAAyABQQRqIQEgAkEEaiICIARNDQALCyACIANJBEADQCACIAEtAAA6AAAgAUEBaiEBIAJBAWoiAiADRw0ACwsgAAsMACAAIAEpAAA3AAALQQECfyAAKAIIIgEgACgCEEkEQEEDDwsgACAAKAIEIgJBB3E2AgQgACABIAJBA3ZrIgE2AgggACABKAAANgIAQQALDAAgACABKAIANgAAC/cCAQJ/AkAgACABRg0AAkAgASACaiAASwRAIAAgAmoiBCABSw0BCyAAIAEgAhALDwsgACABc0EDcSEDAkACQCAAIAFJBEAgAwRAIAAhAwwDCyAAQQNxRQRAIAAhAwwCCyAAIQMDQCACRQ0EIAMgAS0AADoAACABQQFqIQEgAkF/aiECIANBAWoiA0EDcQ0ACwwBCwJAIAMNACAEQQNxBEADQCACRQ0FIAAgAkF/aiICaiIDIAEgAmotAAA6AAAgA0EDcQ0ACwsgAkEDTQ0AA0AgACACQXxqIgJqIAEgAmooAgA2AgAgAkEDSw0ACwsgAkUNAgNAIAAgAkF/aiICaiABIAJqLQAAOgAAIAINAAsMAgsgAkEDTQ0AIAIhBANAIAMgASgCADYCACABQQRqIQEgA0EEaiEDIARBfGoiBEEDSw0ACyACQQNxIQILIAJFDQADQCADIAEtAAA6AAAgA0EBaiEDIAFBAWohASACQX9qIgINAAsLIAAL8wICAn8BfgJAIAJFDQAgACACaiIDQX9qIAE6AAAgACABOgAAIAJBA0kNACADQX5qIAE6AAAgACABOgABIANBfWogAToAACAAIAE6AAIgAkEHSQ0AIANBfGogAToAACAAIAE6AAMgAkEJSQ0AIABBACAAa0EDcSIEaiIDIAFB/wFxQYGChAhsIgE2AgAgAyACIARrQXxxIgRqIgJBfGogATYCACAEQQlJDQAgAyABNgIIIAMgATYCBCACQXhqIAE2AgAgAkF0aiABNgIAIARBGUkNACADIAE2AhggAyABNgIUIAMgATYCECADIAE2AgwgAkFwaiABNgIAIAJBbGogATYCACACQWhqIAE2AgAgAkFkaiABNgIAIAQgA0EEcUEYciIEayICQSBJDQAgAa0iBUIghiAFhCEFIAMgBGohAQNAIAEgBTcDGCABIAU3AxAgASAFNwMIIAEgBTcDACABQSBqIQEgAkFgaiICQR9LDQALCyAACy8BAn8gACgCBCAAKAIAQQJ0aiICLQACIQMgACACLwEAIAEgAi0AAxAIajYCACADCy8BAn8gACgCBCAAKAIAQQJ0aiICLQACIQMgACACLwEAIAEgAi0AAxAFajYCACADCx8AIAAgASACKAIEEAg2AgAgARAEGiAAIAJBCGo2AgQLCAAgAGdBH3MLugUBDX8jAEEQayIKJAACfyAEQQNNBEAgCkEANgIMIApBDGogAyAEEAsaIAAgASACIApBDGpBBBAVIgBBbCAAEAMbIAAgACAESxsMAQsgAEEAIAEoAgBBAXRBAmoQECENQVQgAygAACIGQQ9xIgBBCksNABogAiAAQQVqNgIAIAMgBGoiAkF8aiEMIAJBeWohDiACQXtqIRAgAEEGaiELQQQhBSAGQQR2IQRBICAAdCIAQQFyIQkgASgCACEPQQAhAiADIQYCQANAIAlBAkggAiAPS3JFBEAgAiEHAkAgCARAA0AgBEH//wNxQf//A0YEQCAHQRhqIQcgBiAQSQR/IAZBAmoiBigAACAFdgUgBUEQaiEFIARBEHYLIQQMAQsLA0AgBEEDcSIIQQNGBEAgBUECaiEFIARBAnYhBCAHQQNqIQcMAQsLIAcgCGoiByAPSw0EIAVBAmohBQNAIAIgB0kEQCANIAJBAXRqQQA7AQAgAkEBaiECDAELCyAGIA5LQQAgBiAFQQN1aiIHIAxLG0UEQCAHKAAAIAVBB3EiBXYhBAwCCyAEQQJ2IQQLIAYhBwsCfyALQX9qIAQgAEF/anEiBiAAQQF0QX9qIgggCWsiEUkNABogBCAIcSIEQQAgESAEIABIG2shBiALCyEIIA0gAkEBdGogBkF/aiIEOwEAIAlBASAGayAEIAZBAUgbayEJA0AgCSAASARAIABBAXUhACALQX9qIQsMAQsLAn8gByAOS0EAIAcgBSAIaiIFQQN1aiIGIAxLG0UEQCAFQQdxDAELIAUgDCIGIAdrQQN0awshBSACQQFqIQIgBEUhCCAGKAAAIAVBH3F2IQQMAQsLQWwgCUEBRyAFQSBKcg0BGiABIAJBf2o2AgAgBiAFQQdqQQN1aiADawwBC0FQCyEAIApBEGokACAACwkAQQFBBSAAGwsMACAAIAEoAAA2AAALqgMBCn8jAEHwAGsiCiQAIAJBAWohDiAAQQhqIQtBgIAEIAVBf2p0QRB1IQxBACECQQEhBkEBIAV0IglBf2oiDyEIA0AgAiAORkUEQAJAIAEgAkEBdCINai8BACIHQf//A0YEQCALIAhBA3RqIAI2AgQgCEF/aiEIQQEhBwwBCyAGQQAgDCAHQRB0QRB1ShshBgsgCiANaiAHOwEAIAJBAWohAgwBCwsgACAFNgIEIAAgBjYCACAJQQN2IAlBAXZqQQNqIQxBACEAQQAhBkEAIQIDQCAGIA5GBEADQAJAIAAgCUYNACAKIAsgAEEDdGoiASgCBCIGQQF0aiICIAIvAQAiAkEBajsBACABIAUgAhAUayIIOgADIAEgAiAIQf8BcXQgCWs7AQAgASAEIAZBAnQiAmooAgA6AAIgASACIANqKAIANgIEIABBAWohAAwBCwsFIAEgBkEBdGouAQAhDUEAIQcDQCAHIA1ORQRAIAsgAkEDdGogBjYCBANAIAIgDGogD3EiAiAISw0ACyAHQQFqIQcMAQsLIAZBAWohBgwBCwsgCkHwAGokAAsjAEIAIAEQCSAAhUKHla+vmLbem55/fkLj3MqV/M7y9YV/fAsQACAAQn43AwggACABNgIACyQBAX8gAARAIAEoAgQiAgRAIAEoAgggACACEQEADwsgABAmCwsfACAAIAEgAi8BABAINgIAIAEQBBogACACQQRqNgIEC0oBAX9BoCAoAgAiASAAaiIAQX9MBEBBiCBBMDYCAEF/DwsCQCAAPwBBEHRNDQAgABBmDQBBiCBBMDYCAEF/DwtBoCAgADYCACABC9cBAQh/Qbp/IQoCQCACKAIEIgggAigCACIJaiIOIAEgAGtLDQBBbCEKIAkgBCADKAIAIgtrSw0AIAAgCWoiBCACKAIIIgxrIQ0gACABQWBqIg8gCyAJQQAQKSADIAkgC2o2AgACQAJAIAwgBCAFa00EQCANIQUMAQsgDCAEIAZrSw0CIAcgDSAFayIAaiIBIAhqIAdNBEAgBCABIAgQDxoMAgsgBCABQQAgAGsQDyEBIAIgACAIaiIINgIEIAEgAGshBAsgBCAPIAUgCEEBECkLIA4hCgsgCgubAgEBfyMAQYABayINJAAgDSADNgJ8AkAgAkEDSwRAQX8hCQwBCwJAAkACQAJAIAJBAWsOAwADAgELIAZFBEBBuH8hCQwEC0FsIQkgBS0AACICIANLDQMgACAHIAJBAnQiAmooAgAgAiAIaigCABA7IAEgADYCAEEBIQkMAwsgASAJNgIAQQAhCQwCCyAKRQRAQWwhCQwCC0EAIQkgC0UgDEEZSHINAUEIIAR0QQhqIQBBACECA0AgAiAATw0CIAJBQGshAgwAAAsAC0FsIQkgDSANQfwAaiANQfgAaiAFIAYQFSICEAMNACANKAJ4IgMgBEsNACAAIA0gDSgCfCAHIAggAxAYIAEgADYCACACIQkLIA1BgAFqJAAgCQsLACAAIAEgAhALGgsQACAALwAAIAAtAAJBEHRyCy8AAn9BuH8gAUEISQ0AGkFyIAAoAAQiAEF3Sw0AGkG4fyAAQQhqIgAgACABSxsLCwkAIAAgATsAAAsDAAELigYBBX8gACAAKAIAIgVBfnE2AgBBACAAIAVBAXZqQYQgKAIAIgQgAEYbIQECQAJAIAAoAgQiAkUNACACKAIAIgNBAXENACACQQhqIgUgA0EBdkF4aiIDQQggA0EISxtnQR9zQQJ0QYAfaiIDKAIARgRAIAMgAigCDDYCAAsgAigCCCIDBEAgAyACKAIMNgIECyACKAIMIgMEQCADIAIoAgg2AgALIAIgAigCACAAKAIAQX5xajYCAEGEICEAAkACQCABRQ0AIAEgAjYCBCABKAIAIgNBAXENASADQQF2QXhqIgNBCCADQQhLG2dBH3NBAnRBgB9qIgMoAgAgAUEIakYEQCADIAEoAgw2AgALIAEoAggiAwRAIAMgASgCDDYCBAsgASgCDCIDBEAgAyABKAIINgIAQYQgKAIAIQQLIAIgAigCACABKAIAQX5xajYCACABIARGDQAgASABKAIAQQF2akEEaiEACyAAIAI2AgALIAIoAgBBAXZBeGoiAEEIIABBCEsbZ0Efc0ECdEGAH2oiASgCACEAIAEgBTYCACACIAA2AgwgAkEANgIIIABFDQEgACAFNgIADwsCQCABRQ0AIAEoAgAiAkEBcQ0AIAJBAXZBeGoiAkEIIAJBCEsbZ0Efc0ECdEGAH2oiAigCACABQQhqRgRAIAIgASgCDDYCAAsgASgCCCICBEAgAiABKAIMNgIECyABKAIMIgIEQCACIAEoAgg2AgBBhCAoAgAhBAsgACAAKAIAIAEoAgBBfnFqIgI2AgACQCABIARHBEAgASABKAIAQQF2aiAANgIEIAAoAgAhAgwBC0GEICAANgIACyACQQF2QXhqIgFBCCABQQhLG2dBH3NBAnRBgB9qIgIoAgAhASACIABBCGoiAjYCACAAIAE2AgwgAEEANgIIIAFFDQEgASACNgIADwsgBUEBdkF4aiIBQQggAUEISxtnQR9zQQJ0QYAfaiICKAIAIQEgAiAAQQhqIgI2AgAgACABNgIMIABBADYCCCABRQ0AIAEgAjYCAAsLDgAgAARAIABBeGoQJQsLgAIBA38CQCAAQQ9qQXhxQYQgKAIAKAIAQQF2ayICEB1Bf0YNAAJAQYQgKAIAIgAoAgAiAUEBcQ0AIAFBAXZBeGoiAUEIIAFBCEsbZ0Efc0ECdEGAH2oiASgCACAAQQhqRgRAIAEgACgCDDYCAAsgACgCCCIBBEAgASAAKAIMNgIECyAAKAIMIgFFDQAgASAAKAIINgIAC0EBIQEgACAAKAIAIAJBAXRqIgI2AgAgAkEBcQ0AIAJBAXZBeGoiAkEIIAJBCEsbZ0Efc0ECdEGAH2oiAygCACECIAMgAEEIaiIDNgIAIAAgAjYCDCAAQQA2AgggAkUNACACIAM2AgALIAELtwIBA38CQAJAIABBASAAGyICEDgiAA0AAkACQEGEICgCACIARQ0AIAAoAgAiA0EBcQ0AIAAgA0EBcjYCACADQQF2QXhqIgFBCCABQQhLG2dBH3NBAnRBgB9qIgEoAgAgAEEIakYEQCABIAAoAgw2AgALIAAoAggiAQRAIAEgACgCDDYCBAsgACgCDCIBBEAgASAAKAIINgIACyACECchAkEAIQFBhCAoAgAhACACDQEgACAAKAIAQX5xNgIAQQAPCyACQQ9qQXhxIgMQHSICQX9GDQIgAkEHakF4cSIAIAJHBEAgACACaxAdQX9GDQMLAkBBhCAoAgAiAUUEQEGAICAANgIADAELIAAgATYCBAtBhCAgADYCACAAIANBAXRBAXI2AgAMAQsgAEUNAQsgAEEIaiEBCyABC7kDAQJ/IAAgA2ohBQJAIANBB0wEQANAIAAgBU8NAiAAIAItAAA6AAAgAEEBaiEAIAJBAWohAgwAAAsACyAEQQFGBEACQCAAIAJrIgZBB00EQCAAIAItAAA6AAAgACACLQABOgABIAAgAi0AAjoAAiAAIAItAAM6AAMgAEEEaiACIAZBAnQiBkHAHmooAgBqIgIQFyACIAZB4B5qKAIAayECDAELIAAgAhAMCyACQQhqIQIgAEEIaiEACwJAAkACQAJAIAUgAU0EQCAAIANqIQEgBEEBRyAAIAJrQQ9Kcg0BA0AgACACEAwgAkEIaiECIABBCGoiACABSQ0ACwwFCyAAIAFLBEAgACEBDAQLIARBAUcgACACa0EPSnINASAAIQMgAiEEA0AgAyAEEAwgBEEIaiEEIANBCGoiAyABSQ0ACwwCCwNAIAAgAhAHIAJBEGohAiAAQRBqIgAgAUkNAAsMAwsgACEDIAIhBANAIAMgBBAHIARBEGohBCADQRBqIgMgAUkNAAsLIAIgASAAa2ohAgsDQCABIAVPDQEgASACLQAAOgAAIAFBAWohASACQQFqIQIMAAALAAsLQQECfyAAIAAoArjgASIDNgLE4AEgACgCvOABIQQgACABNgK84AEgACABIAJqNgK44AEgACABIAQgA2tqNgLA4AELpgEBAX8gACAAKALs4QEQFjYCyOABIABCADcD+OABIABCADcDuOABIABBwOABakIANwMAIABBqNAAaiIBQYyAgOAANgIAIABBADYCmOIBIABCADcDiOEBIABCAzcDgOEBIABBrNABakHgEikCADcCACAAQbTQAWpB6BIoAgA2AgAgACABNgIMIAAgAEGYIGo2AgggACAAQaAwajYCBCAAIABBEGo2AgALYQEBf0G4fyEDAkAgAUEDSQ0AIAIgABAhIgFBA3YiADYCCCACIAFBAXE2AgQgAiABQQF2QQNxIgM2AgACQCADQX9qIgFBAksNAAJAIAFBAWsOAgEAAgtBbA8LIAAhAwsgAwsMACAAIAEgAkEAEC4LiAQCA38CfiADEBYhBCAAQQBBKBAQIQAgBCACSwRAIAQPCyABRQRAQX8PCwJAAkAgA0EBRg0AIAEoAAAiBkGo6r5pRg0AQXYhAyAGQXBxQdDUtMIBRw0BQQghAyACQQhJDQEgAEEAQSgQECEAIAEoAAQhASAAQQE2AhQgACABrTcDAEEADwsgASACIAMQLyIDIAJLDQAgACADNgIYQXIhAyABIARqIgVBf2otAAAiAkEIcQ0AIAJBIHEiBkUEQEFwIQMgBS0AACIFQacBSw0BIAVBB3GtQgEgBUEDdkEKaq2GIgdCA4h+IAd8IQggBEEBaiEECyACQQZ2IQMgAkECdiEFAkAgAkEDcUF/aiICQQJLBEBBACECDAELAkACQAJAIAJBAWsOAgECAAsgASAEai0AACECIARBAWohBAwCCyABIARqLwAAIQIgBEECaiEEDAELIAEgBGooAAAhAiAEQQRqIQQLIAVBAXEhBQJ+AkACQAJAIANBf2oiA0ECTQRAIANBAWsOAgIDAQtCfyAGRQ0DGiABIARqMQAADAMLIAEgBGovAACtQoACfAwCCyABIARqKAAArQwBCyABIARqKQAACyEHIAAgBTYCICAAIAI2AhwgACAHNwMAQQAhAyAAQQA2AhQgACAHIAggBhsiBzcDCCAAIAdCgIAIIAdCgIAIVBs+AhALIAMLWwEBf0G4fyEDIAIQFiICIAFNBH8gACACakF/ai0AACIAQQNxQQJ0QaAeaigCACACaiAAQQZ2IgFBAnRBsB5qKAIAaiAAQSBxIgBFaiABRSAAQQV2cWoFQbh/CwsdACAAKAKQ4gEQWiAAQQA2AqDiASAAQgA3A5DiAQu1AwEFfyMAQZACayIKJABBuH8hBgJAIAVFDQAgBCwAACIIQf8BcSEHAkAgCEF/TARAIAdBgn9qQQF2IgggBU8NAkFsIQYgB0GBf2oiBUGAAk8NAiAEQQFqIQdBACEGA0AgBiAFTwRAIAUhBiAIIQcMAwUgACAGaiAHIAZBAXZqIgQtAABBBHY6AAAgACAGQQFyaiAELQAAQQ9xOgAAIAZBAmohBgwBCwAACwALIAcgBU8NASAAIARBAWogByAKEFMiBhADDQELIAYhBEEAIQYgAUEAQTQQECEJQQAhBQNAIAQgBkcEQCAAIAZqIggtAAAiAUELSwRAQWwhBgwDBSAJIAFBAnRqIgEgASgCAEEBajYCACAGQQFqIQZBASAILQAAdEEBdSAFaiEFDAILAAsLQWwhBiAFRQ0AIAUQFEEBaiIBQQxLDQAgAyABNgIAQQFBASABdCAFayIDEBQiAXQgA0cNACAAIARqIAFBAWoiADoAACAJIABBAnRqIgAgACgCAEEBajYCACAJKAIEIgBBAkkgAEEBcXINACACIARBAWo2AgAgB0EBaiEGCyAKQZACaiQAIAYLxhEBDH8jAEHwAGsiBSQAQWwhCwJAIANBCkkNACACLwAAIQogAi8AAiEJIAIvAAQhByAFQQhqIAQQDgJAIAMgByAJIApqakEGaiIMSQ0AIAUtAAohCCAFQdgAaiACQQZqIgIgChAGIgsQAw0BIAVBQGsgAiAKaiICIAkQBiILEAMNASAFQShqIAIgCWoiAiAHEAYiCxADDQEgBUEQaiACIAdqIAMgDGsQBiILEAMNASAAIAFqIg9BfWohECAEQQRqIQZBASELIAAgAUEDakECdiIDaiIMIANqIgIgA2oiDiEDIAIhBCAMIQcDQCALIAMgEElxBEAgACAGIAVB2ABqIAgQAkECdGoiCS8BADsAACAFQdgAaiAJLQACEAEgCS0AAyELIAcgBiAFQUBrIAgQAkECdGoiCS8BADsAACAFQUBrIAktAAIQASAJLQADIQogBCAGIAVBKGogCBACQQJ0aiIJLwEAOwAAIAVBKGogCS0AAhABIAktAAMhCSADIAYgBUEQaiAIEAJBAnRqIg0vAQA7AAAgBUEQaiANLQACEAEgDS0AAyENIAAgC2oiCyAGIAVB2ABqIAgQAkECdGoiAC8BADsAACAFQdgAaiAALQACEAEgAC0AAyEAIAcgCmoiCiAGIAVBQGsgCBACQQJ0aiIHLwEAOwAAIAVBQGsgBy0AAhABIActAAMhByAEIAlqIgkgBiAFQShqIAgQAkECdGoiBC8BADsAACAFQShqIAQtAAIQASAELQADIQQgAyANaiIDIAYgBUEQaiAIEAJBAnRqIg0vAQA7AAAgBUEQaiANLQACEAEgACALaiEAIAcgCmohByAEIAlqIQQgAyANLQADaiEDIAVB2ABqEA0gBUFAaxANciAFQShqEA1yIAVBEGoQDXJFIQsMAQsLIAQgDksgByACS3INAEFsIQsgACAMSw0BIAxBfWohCQNAQQAgACAJSSAFQdgAahAEGwRAIAAgBiAFQdgAaiAIEAJBAnRqIgovAQA7AAAgBUHYAGogCi0AAhABIAAgCi0AA2oiACAGIAVB2ABqIAgQAkECdGoiCi8BADsAACAFQdgAaiAKLQACEAEgACAKLQADaiEADAEFIAxBfmohCgNAIAVB2ABqEAQgACAKS3JFBEAgACAGIAVB2ABqIAgQAkECdGoiCS8BADsAACAFQdgAaiAJLQACEAEgACAJLQADaiEADAELCwNAIAAgCk0EQCAAIAYgBUHYAGogCBACQQJ0aiIJLwEAOwAAIAVB2ABqIAktAAIQASAAIAktAANqIQAMAQsLAkAgACAMTw0AIAAgBiAFQdgAaiAIEAIiAEECdGoiDC0AADoAACAMLQADQQFGBEAgBUHYAGogDC0AAhABDAELIAUoAlxBH0sNACAFQdgAaiAGIABBAnRqLQACEAEgBSgCXEEhSQ0AIAVBIDYCXAsgAkF9aiEMA0BBACAHIAxJIAVBQGsQBBsEQCAHIAYgBUFAayAIEAJBAnRqIgAvAQA7AAAgBUFAayAALQACEAEgByAALQADaiIAIAYgBUFAayAIEAJBAnRqIgcvAQA7AAAgBUFAayAHLQACEAEgACAHLQADaiEHDAEFIAJBfmohDANAIAVBQGsQBCAHIAxLckUEQCAHIAYgBUFAayAIEAJBAnRqIgAvAQA7AAAgBUFAayAALQACEAEgByAALQADaiEHDAELCwNAIAcgDE0EQCAHIAYgBUFAayAIEAJBAnRqIgAvAQA7AAAgBUFAayAALQACEAEgByAALQADaiEHDAELCwJAIAcgAk8NACAHIAYgBUFAayAIEAIiAEECdGoiAi0AADoAACACLQADQQFGBEAgBUFAayACLQACEAEMAQsgBSgCREEfSw0AIAVBQGsgBiAAQQJ0ai0AAhABIAUoAkRBIUkNACAFQSA2AkQLIA5BfWohAgNAQQAgBCACSSAFQShqEAQbBEAgBCAGIAVBKGogCBACQQJ0aiIALwEAOwAAIAVBKGogAC0AAhABIAQgAC0AA2oiACAGIAVBKGogCBACQQJ0aiIELwEAOwAAIAVBKGogBC0AAhABIAAgBC0AA2ohBAwBBSAOQX5qIQIDQCAFQShqEAQgBCACS3JFBEAgBCAGIAVBKGogCBACQQJ0aiIALwEAOwAAIAVBKGogAC0AAhABIAQgAC0AA2ohBAwBCwsDQCAEIAJNBEAgBCAGIAVBKGogCBACQQJ0aiIALwEAOwAAIAVBKGogAC0AAhABIAQgAC0AA2ohBAwBCwsCQCAEIA5PDQAgBCAGIAVBKGogCBACIgBBAnRqIgItAAA6AAAgAi0AA0EBRgRAIAVBKGogAi0AAhABDAELIAUoAixBH0sNACAFQShqIAYgAEECdGotAAIQASAFKAIsQSFJDQAgBUEgNgIsCwNAQQAgAyAQSSAFQRBqEAQbBEAgAyAGIAVBEGogCBACQQJ0aiIALwEAOwAAIAVBEGogAC0AAhABIAMgAC0AA2oiACAGIAVBEGogCBACQQJ0aiICLwEAOwAAIAVBEGogAi0AAhABIAAgAi0AA2ohAwwBBSAPQX5qIQIDQCAFQRBqEAQgAyACS3JFBEAgAyAGIAVBEGogCBACQQJ0aiIALwEAOwAAIAVBEGogAC0AAhABIAMgAC0AA2ohAwwBCwsDQCADIAJNBEAgAyAGIAVBEGogCBACQQJ0aiIALwEAOwAAIAVBEGogAC0AAhABIAMgAC0AA2ohAwwBCwsCQCADIA9PDQAgAyAGIAVBEGogCBACIgBBAnRqIgItAAA6AAAgAi0AA0EBRgRAIAVBEGogAi0AAhABDAELIAUoAhRBH0sNACAFQRBqIAYgAEECdGotAAIQASAFKAIUQSFJDQAgBUEgNgIUCyABQWwgBUHYAGoQCiAFQUBrEApxIAVBKGoQCnEgBUEQahAKcRshCwwJCwAACwALAAALAAsAAAsACwAACwALQWwhCwsgBUHwAGokACALC7UEAQ5/IwBBEGsiBiQAIAZBBGogABAOQVQhBQJAIARB3AtJDQAgBi0ABCEHIANB8ARqQQBB7AAQECEIIAdBDEsNACADQdwJaiIJIAggBkEIaiAGQQxqIAEgAhAxIhAQA0UEQCAGKAIMIgQgB0sNASADQdwFaiEPIANBpAVqIREgAEEEaiESIANBqAVqIQEgBCEFA0AgBSICQX9qIQUgCCACQQJ0aigCAEUNAAsgAkEBaiEOQQEhBQNAIAUgDk9FBEAgCCAFQQJ0IgtqKAIAIQwgASALaiAKNgIAIAVBAWohBSAKIAxqIQoMAQsLIAEgCjYCAEEAIQUgBigCCCELA0AgBSALRkUEQCABIAUgCWotAAAiDEECdGoiDSANKAIAIg1BAWo2AgAgDyANQQF0aiINIAw6AAEgDSAFOgAAIAVBAWohBQwBCwtBACEBIANBADYCqAUgBEF/cyAHaiEJQQEhBQNAIAUgDk9FBEAgCCAFQQJ0IgtqKAIAIQwgAyALaiABNgIAIAwgBSAJanQgAWohASAFQQFqIQUMAQsLIAcgBEEBaiIBIAJrIgRrQQFqIQgDQEEBIQUgBCAIT0UEQANAIAUgDk9FBEAgBUECdCIJIAMgBEE0bGpqIAMgCWooAgAgBHY2AgAgBUEBaiEFDAELCyAEQQFqIQQMAQsLIBIgByAPIAogESADIAIgARBkIAZBAToABSAGIAc6AAYgACAGKAIENgIACyAQIQULIAZBEGokACAFC8ENAQt/IwBB8ABrIgUkAEFsIQkCQCADQQpJDQAgAi8AACEKIAIvAAIhDCACLwAEIQYgBUEIaiAEEA4CQCADIAYgCiAMampBBmoiDUkNACAFLQAKIQcgBUHYAGogAkEGaiICIAoQBiIJEAMNASAFQUBrIAIgCmoiAiAMEAYiCRADDQEgBUEoaiACIAxqIgIgBhAGIgkQAw0BIAVBEGogAiAGaiADIA1rEAYiCRADDQEgACABaiIOQX1qIQ8gBEEEaiEGQQEhCSAAIAFBA2pBAnYiAmoiCiACaiIMIAJqIg0hAyAMIQQgCiECA0AgCSADIA9JcQRAIAYgBUHYAGogBxACQQF0aiIILQAAIQsgBUHYAGogCC0AARABIAAgCzoAACAGIAVBQGsgBxACQQF0aiIILQAAIQsgBUFAayAILQABEAEgAiALOgAAIAYgBUEoaiAHEAJBAXRqIggtAAAhCyAFQShqIAgtAAEQASAEIAs6AAAgBiAFQRBqIAcQAkEBdGoiCC0AACELIAVBEGogCC0AARABIAMgCzoAACAGIAVB2ABqIAcQAkEBdGoiCC0AACELIAVB2ABqIAgtAAEQASAAIAs6AAEgBiAFQUBrIAcQAkEBdGoiCC0AACELIAVBQGsgCC0AARABIAIgCzoAASAGIAVBKGogBxACQQF0aiIILQAAIQsgBUEoaiAILQABEAEgBCALOgABIAYgBUEQaiAHEAJBAXRqIggtAAAhCyAFQRBqIAgtAAEQASADIAs6AAEgA0ECaiEDIARBAmohBCACQQJqIQIgAEECaiEAIAkgBUHYAGoQDUVxIAVBQGsQDUVxIAVBKGoQDUVxIAVBEGoQDUVxIQkMAQsLIAQgDUsgAiAMS3INAEFsIQkgACAKSw0BIApBfWohCQNAIAVB2ABqEAQgACAJT3JFBEAgBiAFQdgAaiAHEAJBAXRqIggtAAAhCyAFQdgAaiAILQABEAEgACALOgAAIAYgBUHYAGogBxACQQF0aiIILQAAIQsgBUHYAGogCC0AARABIAAgCzoAASAAQQJqIQAMAQsLA0AgBUHYAGoQBCAAIApPckUEQCAGIAVB2ABqIAcQAkEBdGoiCS0AACEIIAVB2ABqIAktAAEQASAAIAg6AAAgAEEBaiEADAELCwNAIAAgCkkEQCAGIAVB2ABqIAcQAkEBdGoiCS0AACEIIAVB2ABqIAktAAEQASAAIAg6AAAgAEEBaiEADAELCyAMQX1qIQADQCAFQUBrEAQgAiAAT3JFBEAgBiAFQUBrIAcQAkEBdGoiCi0AACEJIAVBQGsgCi0AARABIAIgCToAACAGIAVBQGsgBxACQQF0aiIKLQAAIQkgBUFAayAKLQABEAEgAiAJOgABIAJBAmohAgwBCwsDQCAFQUBrEAQgAiAMT3JFBEAgBiAFQUBrIAcQAkEBdGoiAC0AACEKIAVBQGsgAC0AARABIAIgCjoAACACQQFqIQIMAQsLA0AgAiAMSQRAIAYgBUFAayAHEAJBAXRqIgAtAAAhCiAFQUBrIAAtAAEQASACIAo6AAAgAkEBaiECDAELCyANQX1qIQADQCAFQShqEAQgBCAAT3JFBEAgBiAFQShqIAcQAkEBdGoiAi0AACEKIAVBKGogAi0AARABIAQgCjoAACAGIAVBKGogBxACQQF0aiICLQAAIQogBUEoaiACLQABEAEgBCAKOgABIARBAmohBAwBCwsDQCAFQShqEAQgBCANT3JFBEAgBiAFQShqIAcQAkEBdGoiAC0AACECIAVBKGogAC0AARABIAQgAjoAACAEQQFqIQQMAQsLA0AgBCANSQRAIAYgBUEoaiAHEAJBAXRqIgAtAAAhAiAFQShqIAAtAAEQASAEIAI6AAAgBEEBaiEEDAELCwNAIAVBEGoQBCADIA9PckUEQCAGIAVBEGogBxACQQF0aiIALQAAIQIgBUEQaiAALQABEAEgAyACOgAAIAYgBUEQaiAHEAJBAXRqIgAtAAAhAiAFQRBqIAAtAAEQASADIAI6AAEgA0ECaiEDDAELCwNAIAVBEGoQBCADIA5PckUEQCAGIAVBEGogBxACQQF0aiIALQAAIQIgBUEQaiAALQABEAEgAyACOgAAIANBAWohAwwBCwsDQCADIA5JBEAgBiAFQRBqIAcQAkEBdGoiAC0AACECIAVBEGogAC0AARABIAMgAjoAACADQQFqIQMMAQsLIAFBbCAFQdgAahAKIAVBQGsQCnEgBUEoahAKcSAFQRBqEApxGyEJDAELQWwhCQsgBUHwAGokACAJC8oCAQR/IwBBIGsiBSQAIAUgBBAOIAUtAAIhByAFQQhqIAIgAxAGIgIQA0UEQCAEQQRqIQIgACABaiIDQX1qIQQDQCAFQQhqEAQgACAET3JFBEAgAiAFQQhqIAcQAkEBdGoiBi0AACEIIAVBCGogBi0AARABIAAgCDoAACACIAVBCGogBxACQQF0aiIGLQAAIQggBUEIaiAGLQABEAEgACAIOgABIABBAmohAAwBCwsDQCAFQQhqEAQgACADT3JFBEAgAiAFQQhqIAcQAkEBdGoiBC0AACEGIAVBCGogBC0AARABIAAgBjoAACAAQQFqIQAMAQsLA0AgACADT0UEQCACIAVBCGogBxACQQF0aiIELQAAIQYgBUEIaiAELQABEAEgACAGOgAAIABBAWohAAwBCwsgAUFsIAVBCGoQChshAgsgBUEgaiQAIAILtgMBCX8jAEEQayIGJAAgBkEANgIMIAZBADYCCEFUIQQCQAJAIANBQGsiDCADIAZBCGogBkEMaiABIAIQMSICEAMNACAGQQRqIAAQDiAGKAIMIgcgBi0ABEEBaksNASAAQQRqIQogBkEAOgAFIAYgBzoABiAAIAYoAgQ2AgAgB0EBaiEJQQEhBANAIAQgCUkEQCADIARBAnRqIgEoAgAhACABIAU2AgAgACAEQX9qdCAFaiEFIARBAWohBAwBCwsgB0EBaiEHQQAhBSAGKAIIIQkDQCAFIAlGDQEgAyAFIAxqLQAAIgRBAnRqIgBBASAEdEEBdSILIAAoAgAiAWoiADYCACAHIARrIQhBACEEAkAgC0EDTQRAA0AgBCALRg0CIAogASAEakEBdGoiACAIOgABIAAgBToAACAEQQFqIQQMAAALAAsDQCABIABPDQEgCiABQQF0aiIEIAg6AAEgBCAFOgAAIAQgCDoAAyAEIAU6AAIgBCAIOgAFIAQgBToABCAEIAg6AAcgBCAFOgAGIAFBBGohAQwAAAsACyAFQQFqIQUMAAALAAsgAiEECyAGQRBqJAAgBAutAQECfwJAQYQgKAIAIABHIAAoAgBBAXYiAyABa0F4aiICQXhxQQhHcgR/IAIFIAMQJ0UNASACQQhqC0EQSQ0AIAAgACgCACICQQFxIAAgAWpBD2pBeHEiASAAa0EBdHI2AgAgASAANgIEIAEgASgCAEEBcSAAIAJBAXZqIAFrIgJBAXRyNgIAQYQgIAEgAkH/////B3FqQQRqQYQgKAIAIABGGyABNgIAIAEQJQsLygIBBX8CQAJAAkAgAEEIIABBCEsbZ0EfcyAAaUEBR2oiAUEESSAAIAF2cg0AIAFBAnRB/B5qKAIAIgJFDQADQCACQXhqIgMoAgBBAXZBeGoiBSAATwRAIAIgBUEIIAVBCEsbZ0Efc0ECdEGAH2oiASgCAEYEQCABIAIoAgQ2AgALDAMLIARBHksNASAEQQFqIQQgAigCBCICDQALC0EAIQMgAUEgTw0BA0AgAUECdEGAH2ooAgAiAkUEQCABQR5LIQIgAUEBaiEBIAJFDQEMAwsLIAIgAkF4aiIDKAIAQQF2QXhqIgFBCCABQQhLG2dBH3NBAnRBgB9qIgEoAgBGBEAgASACKAIENgIACwsgAigCACIBBEAgASACKAIENgIECyACKAIEIgEEQCABIAIoAgA2AgALIAMgAygCAEEBcjYCACADIAAQNwsgAwvhCwINfwV+IwBB8ABrIgckACAHIAAoAvDhASIINgJcIAEgAmohDSAIIAAoAoDiAWohDwJAAkAgBUUEQCABIQQMAQsgACgCxOABIRAgACgCwOABIREgACgCvOABIQ4gAEEBNgKM4QFBACEIA0AgCEEDRwRAIAcgCEECdCICaiAAIAJqQazQAWooAgA2AkQgCEEBaiEIDAELC0FsIQwgB0EYaiADIAQQBhADDQEgB0EsaiAHQRhqIAAoAgAQEyAHQTRqIAdBGGogACgCCBATIAdBPGogB0EYaiAAKAIEEBMgDUFgaiESIAEhBEEAIQwDQCAHKAIwIAcoAixBA3RqKQIAIhRCEIinQf8BcSEIIAcoAkAgBygCPEEDdGopAgAiFUIQiKdB/wFxIQsgBygCOCAHKAI0QQN0aikCACIWQiCIpyEJIBVCIIghFyAUQiCIpyECAkAgFkIQiKdB/wFxIgNBAk8EQAJAIAZFIANBGUlyRQRAIAkgB0EYaiADQSAgBygCHGsiCiAKIANLGyIKEAUgAyAKayIDdGohCSAHQRhqEAQaIANFDQEgB0EYaiADEAUgCWohCQwBCyAHQRhqIAMQBSAJaiEJIAdBGGoQBBoLIAcpAkQhGCAHIAk2AkQgByAYNwNIDAELAkAgA0UEQCACBEAgBygCRCEJDAMLIAcoAkghCQwBCwJAAkAgB0EYakEBEAUgCSACRWpqIgNBA0YEQCAHKAJEQX9qIgMgA0VqIQkMAQsgA0ECdCAHaigCRCIJIAlFaiEJIANBAUYNAQsgByAHKAJINgJMCwsgByAHKAJENgJIIAcgCTYCRAsgF6chAyALBEAgB0EYaiALEAUgA2ohAwsgCCALakEUTwRAIAdBGGoQBBoLIAgEQCAHQRhqIAgQBSACaiECCyAHQRhqEAQaIAcgB0EYaiAUQhiIp0H/AXEQCCAUp0H//wNxajYCLCAHIAdBGGogFUIYiKdB/wFxEAggFadB//8DcWo2AjwgB0EYahAEGiAHIAdBGGogFkIYiKdB/wFxEAggFqdB//8DcWo2AjQgByACNgJgIAcoAlwhCiAHIAk2AmggByADNgJkAkACQAJAIAQgAiADaiILaiASSw0AIAIgCmoiEyAPSw0AIA0gBGsgC0Egak8NAQsgByAHKQNoNwMQIAcgBykDYDcDCCAEIA0gB0EIaiAHQdwAaiAPIA4gESAQEB4hCwwBCyACIARqIQggBCAKEAcgAkERTwRAIARBEGohAgNAIAIgCkEQaiIKEAcgAkEQaiICIAhJDQALCyAIIAlrIQIgByATNgJcIAkgCCAOa0sEQCAJIAggEWtLBEBBbCELDAILIBAgAiAOayICaiIKIANqIBBNBEAgCCAKIAMQDxoMAgsgCCAKQQAgAmsQDyEIIAcgAiADaiIDNgJkIAggAmshCCAOIQILIAlBEE8EQCADIAhqIQMDQCAIIAIQByACQRBqIQIgCEEQaiIIIANJDQALDAELAkAgCUEHTQRAIAggAi0AADoAACAIIAItAAE6AAEgCCACLQACOgACIAggAi0AAzoAAyAIQQRqIAIgCUECdCIDQcAeaigCAGoiAhAXIAIgA0HgHmooAgBrIQIgBygCZCEDDAELIAggAhAMCyADQQlJDQAgAyAIaiEDIAhBCGoiCCACQQhqIgJrQQ9MBEADQCAIIAIQDCACQQhqIQIgCEEIaiIIIANJDQAMAgALAAsDQCAIIAIQByACQRBqIQIgCEEQaiIIIANJDQALCyAHQRhqEAQaIAsgDCALEAMiAhshDCAEIAQgC2ogAhshBCAFQX9qIgUNAAsgDBADDQFBbCEMIAdBGGoQBEECSQ0BQQAhCANAIAhBA0cEQCAAIAhBAnQiAmpBrNABaiACIAdqKAJENgIAIAhBAWohCAwBCwsgBygCXCEIC0G6fyEMIA8gCGsiACANIARrSw0AIAQEfyAEIAggABALIABqBUEACyABayEMCyAHQfAAaiQAIAwLkRcCFn8FfiMAQdABayIHJAAgByAAKALw4QEiCDYCvAEgASACaiESIAggACgCgOIBaiETAkACQCAFRQRAIAEhAwwBCyAAKALE4AEhESAAKALA4AEhFSAAKAK84AEhDyAAQQE2AozhAUEAIQgDQCAIQQNHBEAgByAIQQJ0IgJqIAAgAmpBrNABaigCADYCVCAIQQFqIQgMAQsLIAcgETYCZCAHIA82AmAgByABIA9rNgJoQWwhECAHQShqIAMgBBAGEAMNASAFQQQgBUEESBshFyAHQTxqIAdBKGogACgCABATIAdBxABqIAdBKGogACgCCBATIAdBzABqIAdBKGogACgCBBATQQAhBCAHQeAAaiEMIAdB5ABqIQoDQCAHQShqEARBAksgBCAXTnJFBEAgBygCQCAHKAI8QQN0aikCACIdQhCIp0H/AXEhCyAHKAJQIAcoAkxBA3RqKQIAIh5CEIinQf8BcSEJIAcoAkggBygCREEDdGopAgAiH0IgiKchCCAeQiCIISAgHUIgiKchAgJAIB9CEIinQf8BcSIDQQJPBEACQCAGRSADQRlJckUEQCAIIAdBKGogA0EgIAcoAixrIg0gDSADSxsiDRAFIAMgDWsiA3RqIQggB0EoahAEGiADRQ0BIAdBKGogAxAFIAhqIQgMAQsgB0EoaiADEAUgCGohCCAHQShqEAQaCyAHKQJUISEgByAINgJUIAcgITcDWAwBCwJAIANFBEAgAgRAIAcoAlQhCAwDCyAHKAJYIQgMAQsCQAJAIAdBKGpBARAFIAggAkVqaiIDQQNGBEAgBygCVEF/aiIDIANFaiEIDAELIANBAnQgB2ooAlQiCCAIRWohCCADQQFGDQELIAcgBygCWDYCXAsLIAcgBygCVDYCWCAHIAg2AlQLICCnIQMgCQRAIAdBKGogCRAFIANqIQMLIAkgC2pBFE8EQCAHQShqEAQaCyALBEAgB0EoaiALEAUgAmohAgsgB0EoahAEGiAHIAcoAmggAmoiCSADajYCaCAKIAwgCCAJSxsoAgAhDSAHIAdBKGogHUIYiKdB/wFxEAggHadB//8DcWo2AjwgByAHQShqIB5CGIinQf8BcRAIIB6nQf//A3FqNgJMIAdBKGoQBBogB0EoaiAfQhiIp0H/AXEQCCEOIAdB8ABqIARBBHRqIgsgCSANaiAIazYCDCALIAg2AgggCyADNgIEIAsgAjYCACAHIA4gH6dB//8DcWo2AkQgBEEBaiEEDAELCyAEIBdIDQEgEkFgaiEYIAdB4ABqIRogB0HkAGohGyABIQMDQCAHQShqEARBAksgBCAFTnJFBEAgBygCQCAHKAI8QQN0aikCACIdQhCIp0H/AXEhCyAHKAJQIAcoAkxBA3RqKQIAIh5CEIinQf8BcSEIIAcoAkggBygCREEDdGopAgAiH0IgiKchCSAeQiCIISAgHUIgiKchDAJAIB9CEIinQf8BcSICQQJPBEACQCAGRSACQRlJckUEQCAJIAdBKGogAkEgIAcoAixrIgogCiACSxsiChAFIAIgCmsiAnRqIQkgB0EoahAEGiACRQ0BIAdBKGogAhAFIAlqIQkMAQsgB0EoaiACEAUgCWohCSAHQShqEAQaCyAHKQJUISEgByAJNgJUIAcgITcDWAwBCwJAIAJFBEAgDARAIAcoAlQhCQwDCyAHKAJYIQkMAQsCQAJAIAdBKGpBARAFIAkgDEVqaiICQQNGBEAgBygCVEF/aiICIAJFaiEJDAELIAJBAnQgB2ooAlQiCSAJRWohCSACQQFGDQELIAcgBygCWDYCXAsLIAcgBygCVDYCWCAHIAk2AlQLICCnIRQgCARAIAdBKGogCBAFIBRqIRQLIAggC2pBFE8EQCAHQShqEAQaCyALBEAgB0EoaiALEAUgDGohDAsgB0EoahAEGiAHIAcoAmggDGoiGSAUajYCaCAbIBogCSAZSxsoAgAhHCAHIAdBKGogHUIYiKdB/wFxEAggHadB//8DcWo2AjwgByAHQShqIB5CGIinQf8BcRAIIB6nQf//A3FqNgJMIAdBKGoQBBogByAHQShqIB9CGIinQf8BcRAIIB+nQf//A3FqNgJEIAcgB0HwAGogBEEDcUEEdGoiDSkDCCIdNwPIASAHIA0pAwAiHjcDwAECQAJAAkAgBygCvAEiDiAepyICaiIWIBNLDQAgAyAHKALEASIKIAJqIgtqIBhLDQAgEiADayALQSBqTw0BCyAHIAcpA8gBNwMQIAcgBykDwAE3AwggAyASIAdBCGogB0G8AWogEyAPIBUgERAeIQsMAQsgAiADaiEIIAMgDhAHIAJBEU8EQCADQRBqIQIDQCACIA5BEGoiDhAHIAJBEGoiAiAISQ0ACwsgCCAdpyIOayECIAcgFjYCvAEgDiAIIA9rSwRAIA4gCCAVa0sEQEFsIQsMAgsgESACIA9rIgJqIhYgCmogEU0EQCAIIBYgChAPGgwCCyAIIBZBACACaxAPIQggByACIApqIgo2AsQBIAggAmshCCAPIQILIA5BEE8EQCAIIApqIQoDQCAIIAIQByACQRBqIQIgCEEQaiIIIApJDQALDAELAkAgDkEHTQRAIAggAi0AADoAACAIIAItAAE6AAEgCCACLQACOgACIAggAi0AAzoAAyAIQQRqIAIgDkECdCIKQcAeaigCAGoiAhAXIAIgCkHgHmooAgBrIQIgBygCxAEhCgwBCyAIIAIQDAsgCkEJSQ0AIAggCmohCiAIQQhqIgggAkEIaiICa0EPTARAA0AgCCACEAwgAkEIaiECIAhBCGoiCCAKSQ0ADAIACwALA0AgCCACEAcgAkEQaiECIAhBEGoiCCAKSQ0ACwsgCxADBEAgCyEQDAQFIA0gDDYCACANIBkgHGogCWs2AgwgDSAJNgIIIA0gFDYCBCAEQQFqIQQgAyALaiEDDAILAAsLIAQgBUgNASAEIBdrIQtBACEEA0AgCyAFSARAIAcgB0HwAGogC0EDcUEEdGoiAikDCCIdNwPIASAHIAIpAwAiHjcDwAECQAJAAkAgBygCvAEiDCAepyICaiIKIBNLDQAgAyAHKALEASIJIAJqIhBqIBhLDQAgEiADayAQQSBqTw0BCyAHIAcpA8gBNwMgIAcgBykDwAE3AxggAyASIAdBGGogB0G8AWogEyAPIBUgERAeIRAMAQsgAiADaiEIIAMgDBAHIAJBEU8EQCADQRBqIQIDQCACIAxBEGoiDBAHIAJBEGoiAiAISQ0ACwsgCCAdpyIGayECIAcgCjYCvAEgBiAIIA9rSwRAIAYgCCAVa0sEQEFsIRAMAgsgESACIA9rIgJqIgwgCWogEU0EQCAIIAwgCRAPGgwCCyAIIAxBACACaxAPIQggByACIAlqIgk2AsQBIAggAmshCCAPIQILIAZBEE8EQCAIIAlqIQYDQCAIIAIQByACQRBqIQIgCEEQaiIIIAZJDQALDAELAkAgBkEHTQRAIAggAi0AADoAACAIIAItAAE6AAEgCCACLQACOgACIAggAi0AAzoAAyAIQQRqIAIgBkECdCIGQcAeaigCAGoiAhAXIAIgBkHgHmooAgBrIQIgBygCxAEhCQwBCyAIIAIQDAsgCUEJSQ0AIAggCWohBiAIQQhqIgggAkEIaiICa0EPTARAA0AgCCACEAwgAkEIaiECIAhBCGoiCCAGSQ0ADAIACwALA0AgCCACEAcgAkEQaiECIAhBEGoiCCAGSQ0ACwsgEBADDQMgC0EBaiELIAMgEGohAwwBCwsDQCAEQQNHBEAgACAEQQJ0IgJqQazQAWogAiAHaigCVDYCACAEQQFqIQQMAQsLIAcoArwBIQgLQbp/IRAgEyAIayIAIBIgA2tLDQAgAwR/IAMgCCAAEAsgAGoFQQALIAFrIRALIAdB0AFqJAAgEAslACAAQgA3AgAgAEEAOwEIIABBADoACyAAIAE2AgwgACACOgAKC7QFAQN/IwBBMGsiBCQAIABB/wFqIgVBfWohBgJAIAMvAQIEQCAEQRhqIAEgAhAGIgIQAw0BIARBEGogBEEYaiADEBwgBEEIaiAEQRhqIAMQHCAAIQMDQAJAIARBGGoQBCADIAZPckUEQCADIARBEGogBEEYahASOgAAIAMgBEEIaiAEQRhqEBI6AAEgBEEYahAERQ0BIANBAmohAwsgBUF+aiEFAn8DQEG6fyECIAMiASAFSw0FIAEgBEEQaiAEQRhqEBI6AAAgAUEBaiEDIARBGGoQBEEDRgRAQQIhAiAEQQhqDAILIAMgBUsNBSABIARBCGogBEEYahASOgABIAFBAmohA0EDIQIgBEEYahAEQQNHDQALIARBEGoLIQUgAyAFIARBGGoQEjoAACABIAJqIABrIQIMAwsgAyAEQRBqIARBGGoQEjoAAiADIARBCGogBEEYahASOgADIANBBGohAwwAAAsACyAEQRhqIAEgAhAGIgIQAw0AIARBEGogBEEYaiADEBwgBEEIaiAEQRhqIAMQHCAAIQMDQAJAIARBGGoQBCADIAZPckUEQCADIARBEGogBEEYahAROgAAIAMgBEEIaiAEQRhqEBE6AAEgBEEYahAERQ0BIANBAmohAwsgBUF+aiEFAn8DQEG6fyECIAMiASAFSw0EIAEgBEEQaiAEQRhqEBE6AAAgAUEBaiEDIARBGGoQBEEDRgRAQQIhAiAEQQhqDAILIAMgBUsNBCABIARBCGogBEEYahAROgABIAFBAmohA0EDIQIgBEEYahAEQQNHDQALIARBEGoLIQUgAyAFIARBGGoQEToAACABIAJqIABrIQIMAgsgAyAEQRBqIARBGGoQEToAAiADIARBCGogBEEYahAROgADIANBBGohAwwAAAsACyAEQTBqJAAgAgtpAQF/An8CQAJAIAJBB00NACABKAAAQbfIwuF+Rw0AIAAgASgABDYCmOIBQWIgAEEQaiABIAIQPiIDEAMNAhogAEKBgICAEDcDiOEBIAAgASADaiACIANrECoMAQsgACABIAIQKgtBAAsLrQMBBn8jAEGAAWsiAyQAQWIhCAJAIAJBCUkNACAAQZjQAGogAUEIaiIEIAJBeGogAEGY0AAQMyIFEAMiBg0AIANBHzYCfCADIANB/ABqIANB+ABqIAQgBCAFaiAGGyIEIAEgAmoiAiAEaxAVIgUQAw0AIAMoAnwiBkEfSw0AIAMoAngiB0EJTw0AIABBiCBqIAMgBkGAC0GADCAHEBggA0E0NgJ8IAMgA0H8AGogA0H4AGogBCAFaiIEIAIgBGsQFSIFEAMNACADKAJ8IgZBNEsNACADKAJ4IgdBCk8NACAAQZAwaiADIAZBgA1B4A4gBxAYIANBIzYCfCADIANB/ABqIANB+ABqIAQgBWoiBCACIARrEBUiBRADDQAgAygCfCIGQSNLDQAgAygCeCIHQQpPDQAgACADIAZBwBBB0BEgBxAYIAQgBWoiBEEMaiIFIAJLDQAgAiAFayEFQQAhAgNAIAJBA0cEQCAEKAAAIgZBf2ogBU8NAiAAIAJBAnRqQZzQAWogBjYCACACQQFqIQIgBEEEaiEEDAELCyAEIAFrIQgLIANBgAFqJAAgCAtGAQN/IABBCGohAyAAKAIEIQJBACEAA0AgACACdkUEQCABIAMgAEEDdGotAAJBFktqIQEgAEEBaiEADAELCyABQQggAmt0C4YDAQV/Qbh/IQcCQCADRQ0AIAItAAAiBEUEQCABQQA2AgBBAUG4fyADQQFGGw8LAn8gAkEBaiIFIARBGHRBGHUiBkF/Sg0AGiAGQX9GBEAgA0EDSA0CIAUvAABBgP4BaiEEIAJBA2oMAQsgA0ECSA0BIAItAAEgBEEIdHJBgIB+aiEEIAJBAmoLIQUgASAENgIAIAVBAWoiASACIANqIgNLDQBBbCEHIABBEGogACAFLQAAIgVBBnZBI0EJIAEgAyABa0HAEEHQEUHwEiAAKAKM4QEgACgCnOIBIAQQHyIGEAMiCA0AIABBmCBqIABBCGogBUEEdkEDcUEfQQggASABIAZqIAgbIgEgAyABa0GAC0GADEGAFyAAKAKM4QEgACgCnOIBIAQQHyIGEAMiCA0AIABBoDBqIABBBGogBUECdkEDcUE0QQkgASABIAZqIAgbIgEgAyABa0GADUHgDkGQGSAAKAKM4QEgACgCnOIBIAQQHyIAEAMNACAAIAFqIAJrIQcLIAcLrQMBCn8jAEGABGsiCCQAAn9BUiACQf8BSw0AGkFUIANBDEsNABogAkEBaiELIABBBGohCUGAgAQgA0F/anRBEHUhCkEAIQJBASEEQQEgA3QiB0F/aiIMIQUDQCACIAtGRQRAAkAgASACQQF0Ig1qLwEAIgZB//8DRgRAIAkgBUECdGogAjoAAiAFQX9qIQVBASEGDAELIARBACAKIAZBEHRBEHVKGyEECyAIIA1qIAY7AQAgAkEBaiECDAELCyAAIAQ7AQIgACADOwEAIAdBA3YgB0EBdmpBA2ohBkEAIQRBACECA0AgBCALRkUEQCABIARBAXRqLgEAIQpBACEAA0AgACAKTkUEQCAJIAJBAnRqIAQ6AAIDQCACIAZqIAxxIgIgBUsNAAsgAEEBaiEADAELCyAEQQFqIQQMAQsLQX8gAg0AGkEAIQIDfyACIAdGBH9BAAUgCCAJIAJBAnRqIgAtAAJBAXRqIgEgAS8BACIBQQFqOwEAIAAgAyABEBRrIgU6AAMgACABIAVB/wFxdCAHazsBACACQQFqIQIMAQsLCyEFIAhBgARqJAAgBQvjBgEIf0FsIQcCQCACQQNJDQACQAJAAkACQCABLQAAIgNBA3EiCUEBaw4DAwEAAgsgACgCiOEBDQBBYg8LIAJBBUkNAkEDIQYgASgAACEFAn8CQAJAIANBAnZBA3EiCEF+aiIEQQFNBEAgBEEBaw0BDAILIAVBDnZB/wdxIQQgBUEEdkH/B3EhAyAIRQwCCyAFQRJ2IQRBBCEGIAVBBHZB//8AcSEDQQAMAQsgBUEEdkH//w9xIgNBgIAISw0DIAEtAARBCnQgBUEWdnIhBEEFIQZBAAshBSAEIAZqIgogAksNAgJAIANBgQZJDQAgACgCnOIBRQ0AQQAhAgNAIAJBg4ABSw0BIAJBQGshAgwAAAsACwJ/IAlBA0YEQCABIAZqIQEgAEHw4gFqIQIgACgCDCEGIAUEQCACIAMgASAEIAYQXwwCCyACIAMgASAEIAYQXQwBCyAAQbjQAWohAiABIAZqIQEgAEHw4gFqIQYgAEGo0ABqIQggBQRAIAggBiADIAEgBCACEF4MAQsgCCAGIAMgASAEIAIQXAsQAw0CIAAgAzYCgOIBIABBATYCiOEBIAAgAEHw4gFqNgLw4QEgCUECRgRAIAAgAEGo0ABqNgIMCyAAIANqIgBBiOMBakIANwAAIABBgOMBakIANwAAIABB+OIBakIANwAAIABB8OIBakIANwAAIAoPCwJ/AkACQAJAIANBAnZBA3FBf2oiBEECSw0AIARBAWsOAgACAQtBASEEIANBA3YMAgtBAiEEIAEvAABBBHYMAQtBAyEEIAEQIUEEdgsiAyAEaiIFQSBqIAJLBEAgBSACSw0CIABB8OIBaiABIARqIAMQCyEBIAAgAzYCgOIBIAAgATYC8OEBIAEgA2oiAEIANwAYIABCADcAECAAQgA3AAggAEIANwAAIAUPCyAAIAM2AoDiASAAIAEgBGo2AvDhASAFDwsCfwJAAkACQCADQQJ2QQNxQX9qIgRBAksNACAEQQFrDgIAAgELQQEhByADQQN2DAILQQIhByABLwAAQQR2DAELIAJBBEkgARAhIgJBj4CAAUtyDQFBAyEHIAJBBHYLIQIgAEHw4gFqIAEgB2otAAAgAkEgahAQIQEgACACNgKA4gEgACABNgLw4QEgB0EBaiEHCyAHC0sAIABC+erQ0OfJoeThADcDICAAQgA3AxggAELP1tO+0ser2UI3AxAgAELW64Lu6v2J9eAANwMIIABCADcDACAAQShqQQBBKBAQGgviAgICfwV+IABBKGoiASAAKAJIaiECAn4gACkDACIDQiBaBEAgACkDECIEQgeJIAApAwgiBUIBiXwgACkDGCIGQgyJfCAAKQMgIgdCEol8IAUQGSAEEBkgBhAZIAcQGQwBCyAAKQMYQsXP2bLx5brqJ3wLIAN8IQMDQCABQQhqIgAgAk0EQEIAIAEpAAAQCSADhUIbiUKHla+vmLbem55/fkLj3MqV/M7y9YV/fCEDIAAhAQwBCwsCQCABQQRqIgAgAksEQCABIQAMAQsgASgAAK1Ch5Wvr5i23puef34gA4VCF4lCz9bTvtLHq9lCfkL5893xmfaZqxZ8IQMLA0AgACACSQRAIAAxAABCxc/ZsvHluuonfiADhUILiUKHla+vmLbem55/fiEDIABBAWohAAwBCwsgA0IhiCADhULP1tO+0ser2UJ+IgNCHYggA4VC+fPd8Zn2masWfiIDQiCIIAOFC+8CAgJ/BH4gACAAKQMAIAKtfDcDAAJAAkAgACgCSCIDIAJqIgRBH00EQCABRQ0BIAAgA2pBKGogASACECAgACgCSCACaiEEDAELIAEgAmohAgJ/IAMEQCAAQShqIgQgA2ogAUEgIANrECAgACAAKQMIIAQpAAAQCTcDCCAAIAApAxAgACkAMBAJNwMQIAAgACkDGCAAKQA4EAk3AxggACAAKQMgIABBQGspAAAQCTcDICAAKAJIIQMgAEEANgJIIAEgA2tBIGohAQsgAUEgaiACTQsEQCACQWBqIQMgACkDICEFIAApAxghBiAAKQMQIQcgACkDCCEIA0AgCCABKQAAEAkhCCAHIAEpAAgQCSEHIAYgASkAEBAJIQYgBSABKQAYEAkhBSABQSBqIgEgA00NAAsgACAFNwMgIAAgBjcDGCAAIAc3AxAgACAINwMICyABIAJPDQEgAEEoaiABIAIgAWsiBBAgCyAAIAQ2AkgLCy8BAX8gAEUEQEG2f0EAIAMbDwtBun8hBCADIAFNBH8gACACIAMQEBogAwVBun8LCy8BAX8gAEUEQEG2f0EAIAMbDwtBun8hBCADIAFNBH8gACACIAMQCxogAwVBun8LC6gCAQZ/IwBBEGsiByQAIABB2OABaikDAEKAgIAQViEIQbh/IQUCQCAEQf//B0sNACAAIAMgBBBCIgUQAyIGDQAgACgCnOIBIQkgACAHQQxqIAMgAyAFaiAGGyIKIARBACAFIAYbayIGEEAiAxADBEAgAyEFDAELIAcoAgwhBCABRQRAQbp/IQUgBEEASg0BCyAGIANrIQUgAyAKaiEDAkAgCQRAIABBADYCnOIBDAELAkACQAJAIARBBUgNACAAQdjgAWopAwBCgICACFgNAAwBCyAAQQA2ApziAQwBCyAAKAIIED8hBiAAQQA2ApziASAGQRRPDQELIAAgASACIAMgBSAEIAgQOSEFDAELIAAgASACIAMgBSAEIAgQOiEFCyAHQRBqJAAgBQtnACAAQdDgAWogASACIAAoAuzhARAuIgEQAwRAIAEPC0G4fyECAkAgAQ0AIABB7OABaigCACIBBEBBYCECIAAoApjiASABRw0BC0EAIQIgAEHw4AFqKAIARQ0AIABBkOEBahBDCyACCycBAX8QVyIERQRAQUAPCyAEIAAgASACIAMgBBBLEE8hACAEEFYgAAs/AQF/AkACQAJAIAAoAqDiAUEBaiIBQQJLDQAgAUEBaw4CAAECCyAAEDBBAA8LIABBADYCoOIBCyAAKAKU4gELvAMCB38BfiMAQRBrIgkkAEG4fyEGAkAgBCgCACIIQQVBCSAAKALs4QEiBRtJDQAgAygCACIHQQFBBSAFGyAFEC8iBRADBEAgBSEGDAELIAggBUEDakkNACAAIAcgBRBJIgYQAw0AIAEgAmohCiAAQZDhAWohCyAIIAVrIQIgBSAHaiEHIAEhBQNAIAcgAiAJECwiBhADDQEgAkF9aiICIAZJBEBBuH8hBgwCCyAJKAIAIghBAksEQEFsIQYMAgsgB0EDaiEHAn8CQAJAAkAgCEEBaw4CAgABCyAAIAUgCiAFayAHIAYQSAwCCyAFIAogBWsgByAGEEcMAQsgBSAKIAVrIActAAAgCSgCCBBGCyIIEAMEQCAIIQYMAgsgACgC8OABBEAgCyAFIAgQRQsgAiAGayECIAYgB2ohByAFIAhqIQUgCSgCBEUNAAsgACkD0OABIgxCf1IEQEFsIQYgDCAFIAFrrFINAQsgACgC8OABBEBBaiEGIAJBBEkNASALEEQhDCAHKAAAIAynRw0BIAdBBGohByACQXxqIQILIAMgBzYCACAEIAI2AgAgBSABayEGCyAJQRBqJAAgBgsuACAAECsCf0EAQQAQAw0AGiABRSACRXJFBEBBYiAAIAEgAhA9EAMNARoLQQALCzcAIAEEQCAAIAAoAsTgASABKAIEIAEoAghqRzYCnOIBCyAAECtBABADIAFFckUEQCAAIAEQWwsL0QIBB38jAEEQayIGJAAgBiAENgIIIAYgAzYCDCAFBEAgBSgCBCEKIAUoAgghCQsgASEIAkACQANAIAAoAuzhARAWIQsCQANAIAQgC0kNASADKAAAQXBxQdDUtMIBRgRAIAMgBBAiIgcQAw0EIAQgB2shBCADIAdqIQMMAQsLIAYgAzYCDCAGIAQ2AggCQCAFBEAgACAFEE5BACEHQQAQA0UNAQwFCyAAIAogCRBNIgcQAw0ECyAAIAgQUCAMQQFHQQAgACAIIAIgBkEMaiAGQQhqEEwiByIDa0EAIAMQAxtBCkdyRQRAQbh/IQcMBAsgBxADDQMgAiAHayECIAcgCGohCEEBIQwgBigCDCEDIAYoAgghBAwBCwsgBiADNgIMIAYgBDYCCEG4fyEHIAQNASAIIAFrIQcMAQsgBiADNgIMIAYgBDYCCAsgBkEQaiQAIAcLRgECfyABIAAoArjgASICRwRAIAAgAjYCxOABIAAgATYCuOABIAAoArzgASEDIAAgATYCvOABIAAgASADIAJrajYCwOABCwutAgIEfwF+IwBBQGoiBCQAAkACQCACQQhJDQAgASgAAEFwcUHQ1LTCAUcNACABIAIQIiEBIABCADcDCCAAQQA2AgQgACABNgIADAELIARBGGogASACEC0iAxADBEAgACADEBoMAQsgAwRAIABBuH8QGgwBCyACIAQoAjAiA2shAiABIANqIQMDQAJAIAAgAyACIARBCGoQLCIFEAMEfyAFBSACIAVBA2oiBU8NAUG4fwsQGgwCCyAGQQFqIQYgAiAFayECIAMgBWohAyAEKAIMRQ0ACyAEKAI4BEAgAkEDTQRAIABBuH8QGgwCCyADQQRqIQMLIAQoAighAiAEKQMYIQcgAEEANgIEIAAgAyABazYCACAAIAIgBmytIAcgB0J/URs3AwgLIARBQGskAAslAQF/IwBBEGsiAiQAIAIgACABEFEgAigCACEAIAJBEGokACAAC30BBH8jAEGQBGsiBCQAIARB/wE2AggCQCAEQRBqIARBCGogBEEMaiABIAIQFSIGEAMEQCAGIQUMAQtBVCEFIAQoAgwiB0EGSw0AIAMgBEEQaiAEKAIIIAcQQSIFEAMNACAAIAEgBmogAiAGayADEDwhBQsgBEGQBGokACAFC4cBAgJ/An5BABAWIQMCQANAIAEgA08EQAJAIAAoAABBcHFB0NS0wgFGBEAgACABECIiAhADRQ0BQn4PCyAAIAEQVSIEQn1WDQMgBCAFfCIFIARUIQJCfiEEIAINAyAAIAEQUiICEAMNAwsgASACayEBIAAgAmohAAwBCwtCfiAFIAEbIQQLIAQLPwIBfwF+IwBBMGsiAiQAAn5CfiACQQhqIAAgARAtDQAaQgAgAigCHEEBRg0AGiACKQMICyEDIAJBMGokACADC40BAQJ/IwBBMGsiASQAAkAgAEUNACAAKAKI4gENACABIABB/OEBaigCADYCKCABIAApAvThATcDICAAEDAgACgCqOIBIQIgASABKAIoNgIYIAEgASkDIDcDECACIAFBEGoQGyAAQQA2AqjiASABIAEoAig2AgggASABKQMgNwMAIAAgARAbCyABQTBqJAALKgECfyMAQRBrIgAkACAAQQA2AgggAEIANwMAIAAQWCEBIABBEGokACABC4cBAQN/IwBBEGsiAiQAAkAgACgCAEUgACgCBEVzDQAgAiAAKAIINgIIIAIgACkCADcDAAJ/IAIoAgAiAQRAIAIoAghBqOMJIAERBQAMAQtBqOMJECgLIgFFDQAgASAAKQIANwL04QEgAUH84QFqIAAoAgg2AgAgARBZIAEhAwsgAkEQaiQAIAMLywEBAn8jAEEgayIBJAAgAEGBgIDAADYCtOIBIABBADYCiOIBIABBADYC7OEBIABCADcDkOIBIABBADYCpOMJIABBADYC3OIBIABCADcCzOIBIABBADYCvOIBIABBADYCxOABIABCADcCnOIBIABBpOIBakIANwIAIABBrOIBakEANgIAIAFCADcCECABQgA3AhggASABKQMYNwMIIAEgASkDEDcDACABKAIIQQh2QQFxIQIgAEEANgLg4gEgACACNgKM4gEgAUEgaiQAC3YBA38jAEEwayIBJAAgAARAIAEgAEHE0AFqIgIoAgA2AiggASAAKQK80AE3AyAgACgCACEDIAEgAigCADYCGCABIAApArzQATcDECADIAFBEGoQGyABIAEoAig2AgggASABKQMgNwMAIAAgARAbCyABQTBqJAALzAEBAX8gACABKAK00AE2ApjiASAAIAEoAgQiAjYCwOABIAAgAjYCvOABIAAgAiABKAIIaiICNgK44AEgACACNgLE4AEgASgCuNABBEAgAEKBgICAEDcDiOEBIAAgAUGk0ABqNgIMIAAgAUGUIGo2AgggACABQZwwajYCBCAAIAFBDGo2AgAgAEGs0AFqIAFBqNABaigCADYCACAAQbDQAWogAUGs0AFqKAIANgIAIABBtNABaiABQbDQAWooAgA2AgAPCyAAQgA3A4jhAQs7ACACRQRAQbp/DwsgBEUEQEFsDwsgAiAEEGAEQCAAIAEgAiADIAQgBRBhDwsgACABIAIgAyAEIAUQZQtGAQF/IwBBEGsiBSQAIAVBCGogBBAOAn8gBS0ACQRAIAAgASACIAMgBBAyDAELIAAgASACIAMgBBA0CyEAIAVBEGokACAACzQAIAAgAyAEIAUQNiIFEAMEQCAFDwsgBSAESQR/IAEgAiADIAVqIAQgBWsgABA1BUG4fwsLRgEBfyMAQRBrIgUkACAFQQhqIAQQDgJ/IAUtAAkEQCAAIAEgAiADIAQQYgwBCyAAIAEgAiADIAQQNQshACAFQRBqJAAgAAtZAQF/QQ8hAiABIABJBEAgAUEEdCAAbiECCyAAQQh2IgEgAkEYbCIAQYwIaigCAGwgAEGICGooAgBqIgJBA3YgAmogAEGACGooAgAgAEGECGooAgAgAWxqSQs3ACAAIAMgBCAFQYAQEDMiBRADBEAgBQ8LIAUgBEkEfyABIAIgAyAFaiAEIAVrIAAQMgVBuH8LC78DAQN/IwBBIGsiBSQAIAVBCGogAiADEAYiAhADRQRAIAAgAWoiB0F9aiEGIAUgBBAOIARBBGohAiAFLQACIQMDQEEAIAAgBkkgBUEIahAEGwRAIAAgAiAFQQhqIAMQAkECdGoiBC8BADsAACAFQQhqIAQtAAIQASAAIAQtAANqIgQgAiAFQQhqIAMQAkECdGoiAC8BADsAACAFQQhqIAAtAAIQASAEIAAtAANqIQAMAQUgB0F+aiEEA0AgBUEIahAEIAAgBEtyRQRAIAAgAiAFQQhqIAMQAkECdGoiBi8BADsAACAFQQhqIAYtAAIQASAAIAYtAANqIQAMAQsLA0AgACAES0UEQCAAIAIgBUEIaiADEAJBAnRqIgYvAQA7AAAgBUEIaiAGLQACEAEgACAGLQADaiEADAELCwJAIAAgB08NACAAIAIgBUEIaiADEAIiA0ECdGoiAC0AADoAACAALQADQQFGBEAgBUEIaiAALQACEAEMAQsgBSgCDEEfSw0AIAVBCGogAiADQQJ0ai0AAhABIAUoAgxBIUkNACAFQSA2AgwLIAFBbCAFQQhqEAobIQILCwsgBUEgaiQAIAILkgIBBH8jAEFAaiIJJAAgCSADQTQQCyEDAkAgBEECSA0AIAMgBEECdGooAgAhCSADQTxqIAgQIyADQQE6AD8gAyACOgA+QQAhBCADKAI8IQoDQCAEIAlGDQEgACAEQQJ0aiAKNgEAIARBAWohBAwAAAsAC0EAIQkDQCAGIAlGRQRAIAMgBSAJQQF0aiIKLQABIgtBAnRqIgwoAgAhBCADQTxqIAotAABBCHQgCGpB//8DcRAjIANBAjoAPyADIAcgC2siCiACajoAPiAEQQEgASAKa3RqIQogAygCPCELA0AgACAEQQJ0aiALNgEAIARBAWoiBCAKSQ0ACyAMIAo2AgAgCUEBaiEJDAELCyADQUBrJAALowIBCX8jAEHQAGsiCSQAIAlBEGogBUE0EAsaIAcgBmshDyAHIAFrIRADQAJAIAMgCkcEQEEBIAEgByACIApBAXRqIgYtAAEiDGsiCGsiC3QhDSAGLQAAIQ4gCUEQaiAMQQJ0aiIMKAIAIQYgCyAPTwRAIAAgBkECdGogCyAIIAUgCEE0bGogCCAQaiIIQQEgCEEBShsiCCACIAQgCEECdGooAgAiCEEBdGogAyAIayAHIA4QYyAGIA1qIQgMAgsgCUEMaiAOECMgCUEBOgAPIAkgCDoADiAGIA1qIQggCSgCDCELA0AgBiAITw0CIAAgBkECdGogCzYBACAGQQFqIQYMAAALAAsgCUHQAGokAA8LIAwgCDYCACAKQQFqIQoMAAALAAs0ACAAIAMgBCAFEDYiBRADBEAgBQ8LIAUgBEkEfyABIAIgAyAFaiAEIAVrIAAQNAVBuH8LCyMAIAA/AEEQdGtB//8DakEQdkAAQX9GBEBBAA8LQQAQAEEBCzsBAX8gAgRAA0AgACABIAJBgCAgAkGAIEkbIgMQCyEAIAFBgCBqIQEgAEGAIGohACACIANrIgINAAsLCwYAIAAQAwsLqBUJAEGICAsNAQAAAAEAAAACAAAAAgBBoAgLswYBAAAAAQAAAAIAAAACAAAAJgAAAIIAAAAhBQAASgAAAGcIAAAmAAAAwAEAAIAAAABJBQAASgAAAL4IAAApAAAALAIAAIAAAABJBQAASgAAAL4IAAAvAAAAygIAAIAAAACKBQAASgAAAIQJAAA1AAAAcwMAAIAAAACdBQAASgAAAKAJAAA9AAAAgQMAAIAAAADrBQAASwAAAD4KAABEAAAAngMAAIAAAABNBgAASwAAAKoKAABLAAAAswMAAIAAAADBBgAATQAAAB8NAABNAAAAUwQAAIAAAAAjCAAAUQAAAKYPAABUAAAAmQQAAIAAAABLCQAAVwAAALESAABYAAAA2gQAAIAAAABvCQAAXQAAACMUAABUAAAARQUAAIAAAABUCgAAagAAAIwUAABqAAAArwUAAIAAAAB2CQAAfAAAAE4QAAB8AAAA0gIAAIAAAABjBwAAkQAAAJAHAACSAAAAAAAAAAEAAAABAAAABQAAAA0AAAAdAAAAPQAAAH0AAAD9AAAA/QEAAP0DAAD9BwAA/Q8AAP0fAAD9PwAA/X8AAP3/AAD9/wEA/f8DAP3/BwD9/w8A/f8fAP3/PwD9/38A/f//AP3//wH9//8D/f//B/3//w/9//8f/f//P/3//38AAAAAAQAAAAIAAAADAAAABAAAAAUAAAAGAAAABwAAAAgAAAAJAAAACgAAAAsAAAAMAAAADQAAAA4AAAAPAAAAEAAAABEAAAASAAAAEwAAABQAAAAVAAAAFgAAABcAAAAYAAAAGQAAABoAAAAbAAAAHAAAAB0AAAAeAAAAHwAAAAMAAAAEAAAABQAAAAYAAAAHAAAACAAAAAkAAAAKAAAACwAAAAwAAAANAAAADgAAAA8AAAAQAAAAEQAAABIAAAATAAAAFAAAABUAAAAWAAAAFwAAABgAAAAZAAAAGgAAABsAAAAcAAAAHQAAAB4AAAAfAAAAIAAAACEAAAAiAAAAIwAAACUAAAAnAAAAKQAAACsAAAAvAAAAMwAAADsAAABDAAAAUwAAAGMAAACDAAAAAwEAAAMCAAADBAAAAwgAAAMQAAADIAAAA0AAAAOAAAADAAEAQeAPC1EBAAAAAQAAAAEAAAABAAAAAgAAAAIAAAADAAAAAwAAAAQAAAAEAAAABQAAAAcAAAAIAAAACQAAAAoAAAALAAAADAAAAA0AAAAOAAAADwAAABAAQcQQC4sBAQAAAAIAAAADAAAABAAAAAUAAAAGAAAABwAAAAgAAAAJAAAACgAAAAsAAAAMAAAADQAAAA4AAAAPAAAAEAAAABIAAAAUAAAAFgAAABgAAAAcAAAAIAAAACgAAAAwAAAAQAAAAIAAAAAAAQAAAAIAAAAEAAAACAAAABAAAAAgAAAAQAAAAIAAAAAAAQBBkBIL5gQBAAAAAQAAAAEAAAABAAAAAgAAAAIAAAADAAAAAwAAAAQAAAAGAAAABwAAAAgAAAAJAAAACgAAAAsAAAAMAAAADQAAAA4AAAAPAAAAEAAAAAEAAAAEAAAACAAAAAAAAAABAAEBBgAAAAAAAAQAAAAAEAAABAAAAAAgAAAFAQAAAAAAAAUDAAAAAAAABQQAAAAAAAAFBgAAAAAAAAUHAAAAAAAABQkAAAAAAAAFCgAAAAAAAAUMAAAAAAAABg4AAAAAAAEFEAAAAAAAAQUUAAAAAAABBRYAAAAAAAIFHAAAAAAAAwUgAAAAAAAEBTAAAAAgAAYFQAAAAAAABwWAAAAAAAAIBgABAAAAAAoGAAQAAAAADAYAEAAAIAAABAAAAAAAAAAEAQAAAAAAAAUCAAAAIAAABQQAAAAAAAAFBQAAACAAAAUHAAAAAAAABQgAAAAgAAAFCgAAAAAAAAULAAAAAAAABg0AAAAgAAEFEAAAAAAAAQUSAAAAIAABBRYAAAAAAAIFGAAAACAAAwUgAAAAAAADBSgAAAAAAAYEQAAAABAABgRAAAAAIAAHBYAAAAAAAAkGAAIAAAAACwYACAAAMAAABAAAAAAQAAAEAQAAACAAAAUCAAAAIAAABQMAAAAgAAAFBQAAACAAAAUGAAAAIAAABQgAAAAgAAAFCQAAACAAAAULAAAAIAAABQwAAAAAAAAGDwAAACAAAQUSAAAAIAABBRQAAAAgAAIFGAAAACAAAgUcAAAAIAADBSgAAAAgAAQFMAAAAAAAEAYAAAEAAAAPBgCAAAAAAA4GAEAAAAAADQYAIABBgBcLhwIBAAEBBQAAAAAAAAUAAAAAAAAGBD0AAAAAAAkF/QEAAAAADwX9fwAAAAAVBf3/HwAAAAMFBQAAAAAABwR9AAAAAAAMBf0PAAAAABIF/f8DAAAAFwX9/38AAAAFBR0AAAAAAAgE/QAAAAAADgX9PwAAAAAUBf3/DwAAAAIFAQAAABAABwR9AAAAAAALBf0HAAAAABEF/f8BAAAAFgX9/z8AAAAEBQ0AAAAQAAgE/QAAAAAADQX9HwAAAAATBf3/BwAAAAEFAQAAABAABgQ9AAAAAAAKBf0DAAAAABAF/f8AAAAAHAX9//8PAAAbBf3//wcAABoF/f//AwAAGQX9//8BAAAYBf3//wBBkBkLhgQBAAEBBgAAAAAAAAYDAAAAAAAABAQAAAAgAAAFBQAAAAAAAAUGAAAAAAAABQgAAAAAAAAFCQAAAAAAAAULAAAAAAAABg0AAAAAAAAGEAAAAAAAAAYTAAAAAAAABhYAAAAAAAAGGQAAAAAAAAYcAAAAAAAABh8AAAAAAAAGIgAAAAAAAQYlAAAAAAABBikAAAAAAAIGLwAAAAAAAwY7AAAAAAAEBlMAAAAAAAcGgwAAAAAACQYDAgAAEAAABAQAAAAAAAAEBQAAACAAAAUGAAAAAAAABQcAAAAgAAAFCQAAAAAAAAUKAAAAAAAABgwAAAAAAAAGDwAAAAAAAAYSAAAAAAAABhUAAAAAAAAGGAAAAAAAAAYbAAAAAAAABh4AAAAAAAAGIQAAAAAAAQYjAAAAAAABBicAAAAAAAIGKwAAAAAAAwYzAAAAAAAEBkMAAAAAAAUGYwAAAAAACAYDAQAAIAAABAQAAAAwAAAEBAAAABAAAAQFAAAAIAAABQcAAAAgAAAFCAAAACAAAAUKAAAAIAAABQsAAAAAAAAGDgAAAAAAAAYRAAAAAAAABhQAAAAAAAAGFwAAAAAAAAYaAAAAAAAABh0AAAAAAAAGIAAAAAAAEAYDAAEAAAAPBgOAAAAAAA4GA0AAAAAADQYDIAAAAAAMBgMQAAAAAAsGAwgAAAAACgYDBABBpB0L2QEBAAAAAwAAAAcAAAAPAAAAHwAAAD8AAAB/AAAA/wAAAP8BAAD/AwAA/wcAAP8PAAD/HwAA/z8AAP9/AAD//wAA//8BAP//AwD//wcA//8PAP//HwD//z8A//9/AP///wD///8B////A////wf///8P////H////z////9/AAAAAAEAAAACAAAABAAAAAAAAAACAAAABAAAAAgAAAAAAAAAAQAAAAIAAAABAAAABAAAAAQAAAAEAAAABAAAAAgAAAAIAAAACAAAAAcAAAAIAAAACQAAAAoAAAALAEGgIAsDwBBQ",_M="display-p3",EM="display-p3-linear",th=new WeakMap;let nh=0,ih;class Dn extends ci{constructor(e){super(e),this.transcoderPath="",this.transcoderBinary=null,this.transcoderPending=null,this.workerPool=new KI,this.workerSourceURL="",this.workerConfig=null,typeof MSC_TRANSCODER<"u"&&console.warn('THREE.KTX2Loader: Please update to latest "basis_transcoder". "msc_basis_transcoder" is no longer supported in three.js r125+.')}setTranscoderPath(e){return this.transcoderPath=e,this}setWorkerLimit(e){return this.workerPool.setWorkerLimit(e),this}async detectSupportAsync(e){return this.workerConfig={astcSupported:await e.hasFeatureAsync("texture-compression-astc"),astcHDRSupported:!1,etc1Supported:await e.hasFeatureAsync("texture-compression-etc1"),etc2Supported:await e.hasFeatureAsync("texture-compression-etc2"),dxtSupported:await e.hasFeatureAsync("texture-compression-bc"),bptcSupported:await e.hasFeatureAsync("texture-compression-bptc"),pvrtcSupported:await e.hasFeatureAsync("texture-compression-pvrtc")},this}detectSupport(e){return e.isWebGPURenderer===!0?this.workerConfig={astcSupported:e.hasFeature("texture-compression-astc"),astcHDRSupported:!1,etc1Supported:e.hasFeature("texture-compression-etc1"),etc2Supported:e.hasFeature("texture-compression-etc2"),dxtSupported:e.hasFeature("texture-compression-bc"),bptcSupported:e.hasFeature("texture-compression-bptc"),pvrtcSupported:e.hasFeature("texture-compression-pvrtc")}:this.workerConfig={astcSupported:e.extensions.has("WEBGL_compressed_texture_astc"),astcHDRSupported:e.extensions.has("WEBGL_compressed_texture_astc")&&e.extensions.get("WEBGL_compressed_texture_astc").getSupportedProfiles().includes("hdr"),etc1Supported:e.extensions.has("WEBGL_compressed_texture_etc1"),etc2Supported:e.extensions.has("WEBGL_compressed_texture_etc"),dxtSupported:e.extensions.has("WEBGL_compressed_texture_s3tc"),bptcSupported:e.extensions.has("EXT_texture_compression_bptc"),pvrtcSupported:e.extensions.has("WEBGL_compressed_texture_pvrtc")||e.extensions.has("WEBKIT_WEBGL_compressed_texture_pvrtc")},this}init(){if(!this.transcoderPending){const e=new Bi(this.manager);e.setPath(this.transcoderPath),e.setWithCredentials(this.withCredentials);const t=e.loadAsync("basis_transcoder.js"),n=new Bi(this.manager);n.setPath(this.transcoderPath),n.setResponseType("arraybuffer"),n.setWithCredentials(this.withCredentials);const i=n.loadAsync("basis_transcoder.wasm");this.transcoderPending=Promise.all([t,i]).then(([s,a])=>{const o=Dn.BasisWorker.toString(),c=["/* constants */","let _EngineFormat = "+JSON.stringify(Dn.EngineFormat),"let _EngineType = "+JSON.stringify(Dn.EngineType),"let _TranscoderFormat = "+JSON.stringify(Dn.TranscoderFormat),"let _BasisFormat = "+JSON.stringify(Dn.BasisFormat),"/* basis_transcoder.js */",s,"/* worker */",o.substring(o.indexOf("{")+1,o.lastIndexOf("}"))].join(`
`);this.workerSourceURL=URL.createObjectURL(new Blob([c])),this.transcoderBinary=a,this.workerPool.setWorkerCreator(()=>{const l=new Worker(this.workerSourceURL),u=this.transcoderBinary.slice(0);return l.postMessage({type:"init",config:this.workerConfig,transcoderBinary:u},[u]),l})}),nh>0&&console.warn("THREE.KTX2Loader: Multiple active KTX2 loaders may cause performance issues. Use a single KTX2Loader instance, or call .dispose() on old instances."),nh++}return this.transcoderPending}load(e,t,n,i){if(this.workerConfig===null)throw new Error("THREE.KTX2Loader: Missing initialization with `.detectSupport( renderer )`.");const s=new Bi(this.manager);s.setPath(this.path),s.setCrossOrigin(this.crossOrigin),s.setWithCredentials(this.withCredentials),s.setResponseType("arraybuffer"),s.load(e,a=>{this.parse(a,t,i)},n,i)}parse(e,t,n){if(this.workerConfig===null)throw new Error("THREE.KTX2Loader: Missing initialization with `.detectSupport( renderer )`.");if(th.has(e))return th.get(e).promise.then(t).catch(n);this._createTexture(e).then(i=>t?t(i):null).catch(n)}_createTextureFrom(e,t){const{type:n,error:i,data:{faces:s,width:a,height:o,format:c,type:l,dfdFlags:u}}=e;if(n==="error")return Promise.reject(i);let h;if(t.faceCount===6)h=new _E(s,c,l);else{const d=s[0].mipmaps;h=t.layerCount>1?new bE(d,a,o,t.layerCount,c,l):new Fs(d,a,o,c,l)}return h.minFilter=s[0].mipmaps.length===1?Ke:un,h.magFilter=Ke,h.generateMipmaps=!1,h.needsUpdate=!0,h.colorSpace=x0(t),h.premultiplyAlpha=!!(u&ZI),h}async _createTexture(e,t={}){const n=gM(new Uint8Array(e)),i=n.vkFormat===Dd&&n.dataFormatDescriptor[0].colorModel===167;if(!(n.vkFormat===iM||i&&!this.workerConfig.astcHDRSupported))return xM(n);const a=t,o=this.init().then(()=>this.workerPool.postMessage({type:"transcode",buffer:e,taskConfig:a},[e])).then(c=>this._createTextureFrom(c.data,n));return th.set(e,{promise:o}),o}dispose(){this.workerPool.dispose(),this.workerSourceURL&&URL.revokeObjectURL(this.workerSourceURL),nh--}}Dn.BasisFormat={ETC1S:0,UASTC:1,UASTC_HDR:2};Dn.TranscoderFormat={ETC1:0,ETC2:1,BC1:2,BC3:3,BC4:4,BC5:5,BC7_M6_OPAQUE_ONLY:6,BC7_M5:7,PVRTC1_4_RGB:8,PVRTC1_4_RGBA:9,ASTC_4x4:10,ATC_RGB:11,ATC_RGBA_INTERPOLATED_ALPHA:12,RGBA32:13,RGB565:14,BGR565:15,RGBA4444:16,BC6H:22,RGB_HALF:24,RGBA_HALF:25};Dn.EngineFormat={RGBAFormat:yt,RGBA_ASTC_4x4_Format:Ds,RGB_BPTC_UNSIGNED_Format:Fc,RGBA_BPTC_Format:Ls,RGBA_ETC2_EAC_Format:Ja,RGBA_PVRTC_4BPPV1_Format:Dc,RGBA_S3TC_DXT5_Format:Bs,RGB_ETC1_Format:Lc,RGB_ETC2_Format:Ka,RGB_PVRTC_4BPPV1_Format:Bc,RGBA_S3TC_DXT1_Format:Rs};Dn.EngineType={UnsignedByteType:Mt,HalfFloatType:Ut,FloatType:Lt};Dn.BasisWorker=function(){let r,e,t;const n=_EngineFormat,i=_EngineType,s=_TranscoderFormat,a=_BasisFormat;self.addEventListener("message",function(p){const g=p.data;switch(g.type){case"init":r=g.config,o(g.transcoderBinary);break;case"transcode":e.then(()=>{try{const{faces:m,buffers:A,width:E,height:_,hasAlpha:b,format:S,type:I,dfdFlags:M}=c(g.buffer);self.postMessage({type:"transcode",id:g.id,data:{faces:m,width:E,height:_,hasAlpha:b,format:S,type:I,dfdFlags:M}},A)}catch(m){console.error(m),self.postMessage({type:"error",id:g.id,error:m.message})}});break}});function o(p){e=new Promise(g=>{t={wasmBinary:p,onRuntimeInitialized:g},BASIS(t)}).then(()=>{t.initializeBasis(),t.KTX2File===void 0&&console.warn("THREE.KTX2Loader: Please update Basis Universal transcoder.")})}function c(p){const g=new t.KTX2File(new Uint8Array(p));function m(){g.close(),g.delete()}if(!g.isValid())throw m(),new Error("THREE.KTX2Loader:	Invalid or unsupported .ktx2 file");let A;if(g.isUASTC())A=a.UASTC;else if(g.isETC1S())A=a.ETC1S;else if(g.isHDR())A=a.UASTC_HDR;else throw new Error("THREE.KTX2Loader: Unknown Basis encoding");const E=g.getWidth(),_=g.getHeight(),b=g.getLayers()||1,S=g.getLevels(),I=g.getFaces(),M=g.getHasAlpha(),w=g.getDFDFlags(),{transcoderFormat:x,engineFormat:v,engineType:R}=h(A,E,_,M);if(!E||!_||!S)throw m(),new Error("THREE.KTX2Loader:	Invalid texture");if(!g.startTranscoding())throw m(),new Error("THREE.KTX2Loader: .startTranscoding failed");const k=[],F=[];for(let P=0;P<I;P++){const G=[];for(let O=0;O<S;O++){const W=[];let Q,Y;for(let re=0;re<b;re++){const de=g.getImageLevelInfo(O,re,P);P===0&&O===0&&re===0&&(de.origWidth%4!==0||de.origHeight%4!==0)&&console.warn("THREE.KTX2Loader: ETC1S and UASTC textures should use multiple-of-four dimensions."),S>1?(Q=de.origWidth,Y=de.origHeight):(Q=de.width,Y=de.height);let Ce=new Uint8Array(g.getImageTranscodedSizeInBytes(O,re,0,x));const q=g.transcodeImage(Ce,O,re,P,x,0,-1,-1);if(R===i.HalfFloatType&&(Ce=new Uint16Array(Ce.buffer,Ce.byteOffset,Ce.byteLength/Uint16Array.BYTES_PER_ELEMENT)),!q)throw m(),new Error("THREE.KTX2Loader: .transcodeImage failed.");W.push(Ce)}const ne=f(W);G.push({data:ne,width:Q,height:Y}),F.push(ne.buffer)}k.push({mipmaps:G,width:E,height:_,format:v,type:R})}return m(),{faces:k,buffers:F,width:E,height:_,hasAlpha:M,dfdFlags:w,format:v,type:R}}const l=[{if:"astcSupported",basisFormat:[a.UASTC],transcoderFormat:[s.ASTC_4x4,s.ASTC_4x4],engineFormat:[n.RGBA_ASTC_4x4_Format,n.RGBA_ASTC_4x4_Format],engineType:[i.UnsignedByteType],priorityETC1S:1/0,priorityUASTC:1,needsPowerOfTwo:!1},{if:"bptcSupported",basisFormat:[a.ETC1S,a.UASTC],transcoderFormat:[s.BC7_M5,s.BC7_M5],engineFormat:[n.RGBA_BPTC_Format,n.RGBA_BPTC_Format],engineType:[i.UnsignedByteType],priorityETC1S:3,priorityUASTC:2,needsPowerOfTwo:!1},{if:"dxtSupported",basisFormat:[a.ETC1S,a.UASTC],transcoderFormat:[s.BC1,s.BC3],engineFormat:[n.RGBA_S3TC_DXT1_Format,n.RGBA_S3TC_DXT5_Format],engineType:[i.UnsignedByteType],priorityETC1S:4,priorityUASTC:5,needsPowerOfTwo:!1},{if:"etc2Supported",basisFormat:[a.ETC1S,a.UASTC],transcoderFormat:[s.ETC1,s.ETC2],engineFormat:[n.RGB_ETC2_Format,n.RGBA_ETC2_EAC_Format],engineType:[i.UnsignedByteType],priorityETC1S:1,priorityUASTC:3,needsPowerOfTwo:!1},{if:"etc1Supported",basisFormat:[a.ETC1S,a.UASTC],transcoderFormat:[s.ETC1],engineFormat:[n.RGB_ETC1_Format],engineType:[i.UnsignedByteType],priorityETC1S:2,priorityUASTC:4,needsPowerOfTwo:!1},{if:"pvrtcSupported",basisFormat:[a.ETC1S,a.UASTC],transcoderFormat:[s.PVRTC1_4_RGB,s.PVRTC1_4_RGBA],engineFormat:[n.RGB_PVRTC_4BPPV1_Format,n.RGBA_PVRTC_4BPPV1_Format],engineType:[i.UnsignedByteType],priorityETC1S:5,priorityUASTC:6,needsPowerOfTwo:!0},{if:"bptcSupported",basisFormat:[a.UASTC_HDR],transcoderFormat:[s.BC6H],engineFormat:[n.RGB_BPTC_UNSIGNED_Format],engineType:[i.HalfFloatType],priorityHDR:1,needsPowerOfTwo:!1},{basisFormat:[a.ETC1S,a.UASTC],transcoderFormat:[s.RGBA32,s.RGBA32],engineFormat:[n.RGBAFormat,n.RGBAFormat],engineType:[i.UnsignedByteType,i.UnsignedByteType],priorityETC1S:100,priorityUASTC:100,needsPowerOfTwo:!1},{basisFormat:[a.UASTC_HDR],transcoderFormat:[s.RGBA_HALF],engineFormat:[n.RGBAFormat],engineType:[i.HalfFloatType],priorityHDR:100,needsPowerOfTwo:!1}],u={[a.ETC1S]:l.filter(p=>p.basisFormat.includes(a.ETC1S)).sort((p,g)=>p.priorityUASTC-g.priorityUASTC),[a.UASTC]:l.filter(p=>p.basisFormat.includes(a.UASTC)).sort((p,g)=>p.priorityUASTC-g.priorityUASTC),[a.UASTC_HDR]:l.filter(p=>p.basisFormat.includes(a.UASTC_HDR)).sort((p,g)=>p.priorityHDR-g.priorityHDR)};function h(p,g,m,A){const E=u[p];for(let _=0;_<E.length;_++){const b=E[_];if(b.if&&!r[b.if]||!b.basisFormat.includes(p)||A&&b.transcoderFormat.length<2||b.needsPowerOfTwo&&!(d(g)&&d(m)))continue;const S=b.transcoderFormat[A?1:0],I=b.engineFormat[A?1:0],M=b.engineType[0];return{transcoderFormat:S,engineFormat:I,engineType:M}}throw new Error("THREE.KTX2Loader: Failed to identify transcoding target.")}function d(p){return p<=2?!0:(p&p-1)===0&&p!==0}function f(p){if(p.length===1)return p[0];let g=0;for(let E=0;E<p.length;E++){const _=p[E];g+=_.byteLength}const m=new Uint8Array(g);let A=0;for(let E=0;E<p.length;E++){const _=p[E];m.set(_,A),A+=_.byteLength}return m}};const vM=new Set([yt,Ms,ji]),sh={[g0]:yt,[p0]:yt,[h0]:yt,[u0]:yt,[m0]:Ms,[f0]:Ms,[c0]:Ms,[l0]:Ms,[A0]:ji,[d0]:ji,[o0]:ji,[a0]:ji,[b0]:Ka,[_0]:Ja,[Dd]:Ds,[AM]:Ds,[pM]:Ds,[v0]:Za,[E0]:Za,[aM]:Rs,[oM]:Rs,[sM]:Rr,[rM]:Rr,[lM]:Br,[cM]:Br,[uM]:Bs,[hM]:Bs,[fM]:Ls,[dM]:Ls},rh={[g0]:Lt,[p0]:Ut,[h0]:Mt,[u0]:Mt,[m0]:Lt,[f0]:Ut,[c0]:Mt,[l0]:Mt,[A0]:Lt,[d0]:Ut,[o0]:Mt,[a0]:Mt,[b0]:Mt,[_0]:Mt,[Dd]:Ut,[v0]:Mt,[E0]:Mt};async function xM(r){const{vkFormat:e}=r;if(sh[e]===void 0)throw new Error("THREE.KTX2Loader: Unsupported vkFormat.");let t;r.supercompressionScheme===wp&&(ih||(ih=new Promise(async s=>{const a=new bM;await a.init(),s(a)})),t=await ih);const n=[];for(let s=0;s<r.levels.length;s++){const a=Math.max(1,r.pixelWidth>>s),o=Math.max(1,r.pixelHeight>>s),c=r.pixelDepth?Math.max(1,r.pixelDepth>>s):0,l=r.levels[s];let u;if(r.supercompressionScheme===JI)u=l.levelData;else if(r.supercompressionScheme===wp)u=t.decode(l.levelData,l.uncompressedByteLength);else throw new Error("THREE.KTX2Loader: Unsupported supercompressionScheme.");let h;rh[e]===Lt?h=new Float32Array(u.buffer,u.byteOffset,u.byteLength/Float32Array.BYTES_PER_ELEMENT):rh[e]===Ut?h=new Uint16Array(u.buffer,u.byteOffset,u.byteLength/Uint16Array.BYTES_PER_ELEMENT):h=u,n.push({data:h,width:a,height:o,depth:c})}let i;if(vM.has(sh[e]))i=r.pixelDepth===0?new ho(n[0].data,r.pixelWidth,r.pixelHeight):new yg(n[0].data,r.pixelWidth,r.pixelHeight,r.pixelDepth);else{if(r.pixelDepth>0)throw new Error("THREE.KTX2Loader: Unsupported pixelDepth.");i=new Fs(n,r.pixelWidth,r.pixelHeight),i.minFilter=n.length===1?Ke:un,i.magFilter=Ke}return i.mipmaps=n,i.type=rh[e],i.format=sh[e],i.colorSpace=x0(r),i.needsUpdate=!0,Promise.resolve(i)}function x0(r){const e=r.dataFormatDescriptor[0];return e.colorPrimaries===tM?e.transferFunction===Tp?gt:bt:e.colorPrimaries===nM?e.transferFunction===Tp?_M:EM:(e.colorPrimaries===eM||console.warn(`THREE.KTX2Loader: Unsupported color primaries, "${e.colorPrimaries}"`),Bn)}/* @license
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
 */var Dp,Lp;const Gn=Symbol("retainerCount"),mi=Symbol("recentlyUsed"),qo=Symbol("evict"),pa=Symbol("evictionThreshold"),ah=Symbol("cache");class yM{constructor(e,t=5){this[Dp]=new Map,this[Lp]=[],this[ah]=e,this[pa]=t}set evictionThreshold(e){this[pa]=e,this[qo]()}get evictionThreshold(){return this[pa]}get cache(){return this[ah]}retainerCount(e){return this[Gn].get(e)||0}reset(){this[Gn].clear(),this[mi]=[]}retain(e){this[Gn].has(e)||this[Gn].set(e,0),this[Gn].set(e,this[Gn].get(e)+1);const t=this[mi].indexOf(e);t!==-1&&this[mi].splice(t,1),this[mi].unshift(e),this[qo]()}release(e){this[Gn].has(e)&&this[Gn].set(e,Math.max(this[Gn].get(e)-1,0)),this[qo]()}[(Dp=Gn,Lp=mi,qo)](){if(!(this[mi].length<this[pa]))for(let e=this[mi].length-1;e>=this[pa];--e){const t=this[mi][e];this[Gn].get(t)===0&&(this[ah].delete(t),this[mi].splice(e,1))}}}/* @license
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
 */const SM=r=>{const e=[],t=new Set;for(const n of r){let i=n,s=0;for(;t.has(i);)i=n+"."+ ++s;t.add(i),e.push(i)}return e},CM=r=>{const e=new Map;for(const t of r.mappings)for(const n of t.variants)e.set(n,{material:null,gltfMaterialIndex:t.material});return e};class IM{constructor(e){this.parser=e,this.name="KHR_materials_variants"}afterRoot(e){const t=this.parser,n=t.json;if(n.extensions===void 0||n.extensions[this.name]===void 0)return null;const s=n.extensions[this.name].variants||[],a=SM(s.map(o=>o.name));for(const o of e.scenes)o.traverse(c=>{const l=c;if(!l.material)return;const u=t.associations.get(l);if(u==null||u.meshes==null||u.primitives==null)return;const p=n.meshes[u.meshes].primitives[u.primitives].extensions;!p||!p[this.name]||(l.userData.variantMaterials=CM(p[this.name]))});return e.userData.variants=a,Promise.resolve()}}/* @license
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
 */var y0,Fp;St.DEFAULT_ANISOTROPY=4;const MM=(r,e,t=()=>{})=>{const n=i=>{const s=i.loaded/i.total;t(Math.max(0,Math.min(1,isFinite(s)?s:1)))};return new Promise((i,s)=>{e.load(r,i,n,s)})},wM=r=>new Promise((e,t)=>{const n=document.createElement("script");document.body.appendChild(n),n.onload=e,n.onerror=t,n.async=!0,n.src=r}),gi=new Map,oh=new Map;let Pp;const Up=new pI;let Np;const ch=new Dn;let lh,hh;const _s=Symbol("loader"),Vi=Symbol("evictionPolicy"),Op=Symbol("GLTFInstance");class cn extends jn{static setDRACODecoderLocation(e){Pp=e,Up.setDecoderPath(e)}static getDRACODecoderLocation(){return Pp}static setKTX2TranscoderLocation(e){Np=e,ch.setTranscoderPath(e)}static getKTX2TranscoderLocation(){return Np}static setMeshoptDecoderLocation(e){lh!==e&&(lh=e,hh=wM(e).then(()=>xp.ready).then(()=>xp))}static getMeshoptDecoderLocation(){return lh}static initializeKTX2Loader(e){ch.detectSupport(e)}static get cache(){return gi}static clearCache(){gi.forEach((e,t)=>{this.delete(t)}),this[Vi].reset()}static has(e){return gi.has(e)}static async delete(e){if(!this.has(e))return;const t=gi.get(e);oh.delete(e),gi.delete(e),(await t).dispose()}static hasFinishedLoading(e){return!!oh.get(e)}constructor(e){super(),this[Fp]=new mI().register(t=>new IM(t)),this[Op]=e,this[_s].setDRACOLoader(Up),this[_s].setKTX2Loader(ch)}get[(y0=Vi,Fp=_s,Vi)](){return this.constructor[Vi]}async preload(e,t,n=()=>{}){if(this[_s].setWithCredentials(t.withCredentials),this.dispatchEvent({type:"preload",element:t,src:e}),!gi.has(e)){hh!=null&&this[_s].setMeshoptDecoder(await hh);const i=MM(e,this[_s],o=>{n(o*.8)}),s=this[Op],a=i.then(o=>s.prepare(o)).then(o=>(n(.9),new s(o))).catch(o=>(console.error(o),new s));gi.set(e,a)}await gi.get(e),oh.set(e,!0),n&&n(1)}async load(e,t,n=()=>{}){await this.preload(e,t,n);const s=await(await gi.get(e)).clone();return this[Vi].retain(e),s.dispose=()=>{this[Vi].release(e)},s}}cn[y0]=new yM(cn);class TM extends ft{constructor(e=document.createElement("div")){super(),this.isCSS2DObject=!0,this.element=e,this.element.style.position="absolute",this.element.style.userSelect="none",this.element.setAttribute("draggable",!1),this.center=new Oe(.5,.5),this.addEventListener("removed",function(){this.traverse(function(t){t.element instanceof t.element.ownerDocument.defaultView.Element&&t.element.parentNode!==null&&t.element.remove()})})}copy(e,t){return super.copy(e,t),this.element=e.element.cloneNode(!0),this.center=e.center,this}}const rr=new B,kp=new Pe,Qp=new Pe,Gp=new B,Hp=new B;class RM{constructor(e={}){const t=this;let n,i,s,a;const o={objects:new WeakMap},c=e.element!==void 0?e.element:document.createElement("div");c.style.overflow="hidden",this.domElement=c,this.getSize=function(){return{width:n,height:i}},this.render=function(p,g){p.matrixWorldAutoUpdate===!0&&p.updateMatrixWorld(),g.parent===null&&g.matrixWorldAutoUpdate===!0&&g.updateMatrixWorld(),kp.copy(g.matrixWorldInverse),Qp.multiplyMatrices(g.projectionMatrix,kp),u(p,p,g),f(p)},this.setSize=function(p,g){n=p,i=g,s=n/2,a=i/2,c.style.width=p+"px",c.style.height=g+"px"};function l(p){p.isCSS2DObject&&(p.element.style.display="none");for(let g=0,m=p.children.length;g<m;g++)l(p.children[g])}function u(p,g,m){if(p.visible===!1){l(p);return}if(p.isCSS2DObject){rr.setFromMatrixPosition(p.matrixWorld),rr.applyMatrix4(Qp);const A=rr.z>=-1&&rr.z<=1&&p.layers.test(m.layers)===!0,E=p.element;E.style.display=A===!0?"":"none",A===!0&&(p.onBeforeRender(t,g,m),E.style.transform="translate("+-100*p.center.x+"%,"+-100*p.center.y+"%)translate("+(rr.x*s+s)+"px,"+(-rr.y*a+a)+"px)",E.parentNode!==c&&c.appendChild(E),p.onAfterRender(t,g,m));const _={distanceToCameraSquared:h(m,p)};o.objects.set(p,_)}for(let A=0,E=p.children.length;A<E;A++)u(p.children[A],g,m)}function h(p,g){return Gp.setFromMatrixPosition(p.matrixWorld),Hp.setFromMatrixPosition(g.matrixWorld),Gp.distanceToSquared(Hp)}function d(p){const g=[];return p.traverseVisible(function(m){m.isCSS2DObject&&g.push(m)}),g}function f(p){const g=d(p).sort(function(A,E){if(A.renderOrder!==E.renderOrder)return E.renderOrder-A.renderOrder;const _=o.objects.get(A).distanceToCameraSquared,b=o.objects.get(E).distanceToCameraSquared;return _-b}),m=g.length;for(let A=0,E=g.length;A<E;A++)g[A].element.style.zIndex=m-A}}}function Xo(r,e,t){let n=t;const i=new B;return r.updateWorldMatrix(!0,!0),r.traverseVisible(s=>{const{geometry:a}=s;if(a!==void 0){const{position:o}=a.attributes;if(o!==void 0)for(let c=0,l=o.count;c<l;c++)s.isMesh?s.getVertexPosition(c,i):i.fromBufferAttribute(o,c),s.isSkinnedMesh||i.applyMatrix4(s.matrixWorld),n=e(n,i)}}),n}const zp={POSITION:["byte","byte normalized","unsigned byte","unsigned byte normalized","short","short normalized","unsigned short","unsigned short normalized"],NORMAL:["byte normalized","short normalized"],TANGENT:["byte normalized","short normalized"],TEXCOORD:["byte","byte normalized","unsigned byte","short","short normalized","unsigned short"]};class Vc{constructor(){this.textureUtils=null,this.pluginCallbacks=[],this.register(function(e){return new GM(e)}),this.register(function(e){return new HM(e)}),this.register(function(e){return new qM(e)}),this.register(function(e){return new XM(e)}),this.register(function(e){return new $M(e)}),this.register(function(e){return new jM(e)}),this.register(function(e){return new zM(e)}),this.register(function(e){return new VM(e)}),this.register(function(e){return new WM(e)}),this.register(function(e){return new YM(e)}),this.register(function(e){return new KM(e)}),this.register(function(e){return new JM(e)}),this.register(function(e){return new ZM(e)}),this.register(function(e){return new ew(e)})}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}setTextureUtils(e){return this.textureUtils=e,this}parse(e,t,n,i){const s=new QM,a=[];for(let o=0,c=this.pluginCallbacks.length;o<c;o++)a.push(this.pluginCallbacks[o](s));s.setPlugins(a),s.setTextureUtils(this.textureUtils),s.writeAsync(e,t,i).catch(n)}parseAsync(e,t){const n=this;return new Promise(function(i,s){n.parse(e,i,s,t)})}}const qe={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,BYTE:5120,UNSIGNED_BYTE:5121,SHORT:5122,UNSIGNED_SHORT:5123,INT:5124,UNSIGNED_INT:5125,FLOAT:5126,ARRAY_BUFFER:34962,ELEMENT_ARRAY_BUFFER:34963,NEAREST:9728,LINEAR:9729,NEAREST_MIPMAP_NEAREST:9984,LINEAR_MIPMAP_NEAREST:9985,NEAREST_MIPMAP_LINEAR:9986,LINEAR_MIPMAP_LINEAR:9987,CLAMP_TO_EDGE:33071,MIRRORED_REPEAT:33648,REPEAT:10497},uh="KHR_mesh_quantization",xn={};xn[Nt]=qe.NEAREST;xn[co]=qe.NEAREST_MIPMAP_NEAREST;xn[$i]=qe.NEAREST_MIPMAP_LINEAR;xn[Ke]=qe.LINEAR;xn[Ts]=qe.LINEAR_MIPMAP_NEAREST;xn[un]=qe.LINEAR_MIPMAP_LINEAR;xn[Dt]=qe.CLAMP_TO_EDGE;xn[$n]=qe.REPEAT;xn[Us]=qe.MIRRORED_REPEAT;const Vp={scale:"scale",position:"translation",quaternion:"rotation",morphTargetInfluences:"weights"},BM=new Me,Wp=12,DM=1179937895,LM=2,qp=8,FM=1313821514,PM=5130562;function Fa(r,e){return r.length===e.length&&r.every(function(t,n){return t===e[n]})}function UM(r){return new TextEncoder().encode(r).buffer}function NM(r){return Fa(r.elements,[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])}function OM(r,e,t){const n={min:new Array(r.itemSize).fill(Number.POSITIVE_INFINITY),max:new Array(r.itemSize).fill(Number.NEGATIVE_INFINITY)};for(let i=e;i<e+t;i++)for(let s=0;s<r.itemSize;s++){let a;r.itemSize>4?a=r.array[i*r.itemSize+s]:(s===0?a=r.getX(i):s===1?a=r.getY(i):s===2?a=r.getZ(i):s===3&&(a=r.getW(i)),r.normalized===!0&&(a=kc.normalize(a,r.array))),n.min[s]=Math.min(n.min[s],a),n.max[s]=Math.max(n.max[s],a)}return n}function S0(r){return Math.ceil(r/4)*4}function dh(r,e=0){const t=S0(r.byteLength);if(t!==r.byteLength){const n=new Uint8Array(t);if(n.set(new Uint8Array(r)),e!==0)for(let i=r.byteLength;i<t;i++)n[i]=e;return n.buffer}return r}function Xp(){return typeof document>"u"&&typeof OffscreenCanvas<"u"?new OffscreenCanvas(1,1):document.createElement("canvas")}function kM(r,e){if(r.toBlob!==void 0)return new Promise(n=>r.toBlob(n,e));let t;return e==="image/jpeg"?t=.92:e==="image/webp"&&(t=.8),r.convertToBlob({type:e,quality:t})}class QM{constructor(){this.plugins=[],this.options={},this.pending=[],this.buffers=[],this.byteOffset=0,this.buffers=[],this.nodeMap=new Map,this.skins=[],this.extensionsUsed={},this.extensionsRequired={},this.uids=new Map,this.uid=0,this.json={asset:{version:"2.0",generator:"THREE.GLTFExporter r"+Jc}},this.cache={meshes:new Map,attributes:new Map,attributesNormalized:new Map,materials:new Map,textures:new Map,images:new Map},this.textureUtils=null}setPlugins(e){this.plugins=e}setTextureUtils(e){this.textureUtils=e}async writeAsync(e,t,n={}){this.options=Object.assign({binary:!1,trs:!1,onlyVisible:!0,maxTextureSize:1/0,animations:[],includeCustomExtensions:!1},n),this.options.animations.length>0&&(this.options.trs=!0),await this.processInputAsync(e),await Promise.all(this.pending);const i=this,s=i.buffers,a=i.json;n=i.options;const o=i.extensionsUsed,c=i.extensionsRequired,l=new Blob(s,{type:"application/octet-stream"}),u=Object.keys(o),h=Object.keys(c);if(u.length>0&&(a.extensionsUsed=u),h.length>0&&(a.extensionsRequired=h),a.buffers&&a.buffers.length>0&&(a.buffers[0].byteLength=l.size),n.binary===!0){const d=new FileReader;d.readAsArrayBuffer(l),d.onloadend=function(){const f=dh(d.result),p=new DataView(new ArrayBuffer(qp));p.setUint32(0,f.byteLength,!0),p.setUint32(4,PM,!0);const g=dh(UM(JSON.stringify(a)),32),m=new DataView(new ArrayBuffer(qp));m.setUint32(0,g.byteLength,!0),m.setUint32(4,FM,!0);const A=new ArrayBuffer(Wp),E=new DataView(A);E.setUint32(0,DM,!0),E.setUint32(4,LM,!0);const _=Wp+m.byteLength+g.byteLength+p.byteLength+f.byteLength;E.setUint32(8,_,!0);const b=new Blob([A,m,g,p,f],{type:"application/octet-stream"}),S=new FileReader;S.readAsArrayBuffer(b),S.onloadend=function(){t(S.result)}}}else if(a.buffers&&a.buffers.length>0){const d=new FileReader;d.readAsDataURL(l),d.onloadend=function(){const f=d.result;a.buffers[0].uri=f,t(a)}}else t(a)}serializeUserData(e,t){if(Object.keys(e.userData).length===0)return;const n=this.options,i=this.extensionsUsed;try{const s=JSON.parse(JSON.stringify(e.userData));if(n.includeCustomExtensions&&s.gltfExtensions){t.extensions===void 0&&(t.extensions={});for(const a in s.gltfExtensions)t.extensions[a]=s.gltfExtensions[a],i[a]=!0;delete s.gltfExtensions}Object.keys(s).length>0&&(t.extras=s)}catch(s){console.warn("THREE.GLTFExporter: userData of '"+e.name+"' won't be serialized because of JSON.stringify error - "+s.message)}}getUID(e,t=!1){if(this.uids.has(e)===!1){const i=new Map;i.set(!0,this.uid++),i.set(!1,this.uid++),this.uids.set(e,i)}return this.uids.get(e).get(t)}isNormalizedNormalAttribute(e){if(this.cache.attributesNormalized.has(e))return!1;const n=new B;for(let i=0,s=e.count;i<s;i++)if(Math.abs(n.fromBufferAttribute(e,i).length()-1)>5e-4)return!1;return!0}createNormalizedNormalAttribute(e){const t=this.cache;if(t.attributesNormalized.has(e))return t.attributesNormalized.get(e);const n=e.clone(),i=new B;for(let s=0,a=n.count;s<a;s++)i.fromBufferAttribute(n,s),i.x===0&&i.y===0&&i.z===0?i.setX(1):i.normalize(),n.setXYZ(s,i.x,i.y,i.z);return t.attributesNormalized.set(e,n),n}applyTextureTransform(e,t){let n=!1;const i={};(t.offset.x!==0||t.offset.y!==0)&&(i.offset=t.offset.toArray(),n=!0),t.rotation!==0&&(i.rotation=t.rotation,n=!0),(t.repeat.x!==1||t.repeat.y!==1)&&(i.scale=t.repeat.toArray(),n=!0),n&&(e.extensions=e.extensions||{},e.extensions.KHR_texture_transform=i,this.extensionsUsed.KHR_texture_transform=!0)}async buildMetalRoughTextureAsync(e,t){if(e===t)return e;function n(f){return f.colorSpace===gt?function(g){return g<.04045?g*.0773993808:Math.pow(g*.9478672986+.0521327014,2.4)}:function(g){return g}}e instanceof Fs&&(e=await this.decompressTextureAsync(e)),t instanceof Fs&&(t=await this.decompressTextureAsync(t));const i=e?e.image:null,s=t?t.image:null,a=Math.max(i?i.width:0,s?s.width:0),o=Math.max(i?i.height:0,s?s.height:0),c=Xp();c.width=a,c.height=o;const l=c.getContext("2d",{willReadFrequently:!0});l.fillStyle="#00ffff",l.fillRect(0,0,a,o);const u=l.getImageData(0,0,a,o);if(i){l.drawImage(i,0,0,a,o);const f=n(e),p=l.getImageData(0,0,a,o).data;for(let g=2;g<p.length;g+=4)u.data[g]=f(p[g]/256)*256}if(s){l.drawImage(s,0,0,a,o);const f=n(t),p=l.getImageData(0,0,a,o).data;for(let g=1;g<p.length;g+=4)u.data[g]=f(p[g]/256)*256}l.putImageData(u,0,0);const d=(e||t).clone();return d.source=new tl(c),d.colorSpace=Bn,d.channel=(e||t).channel,e&&t&&e.channel!==t.channel&&console.warn("THREE.GLTFExporter: UV channels for metalnessMap and roughnessMap textures must match."),console.warn("THREE.GLTFExporter: Merged metalnessMap and roughnessMap textures."),d}async decompressTextureAsync(e,t=1/0){if(this.textureUtils===null)throw new Error("THREE.GLTFExporter: setTextureUtils() must be called to process compressed textures.");return await this.textureUtils.decompress(e,t)}processBuffer(e){const t=this.json,n=this.buffers;return t.buffers||(t.buffers=[{byteLength:0}]),n.push(e),0}processBufferView(e,t,n,i,s){const a=this.json;a.bufferViews||(a.bufferViews=[]);let o;switch(t){case qe.BYTE:case qe.UNSIGNED_BYTE:o=1;break;case qe.SHORT:case qe.UNSIGNED_SHORT:o=2;break;default:o=4}let c=e.itemSize*o;s===qe.ARRAY_BUFFER&&(c=Math.ceil(c/4)*4);const l=S0(i*c),u=new DataView(new ArrayBuffer(l));let h=0;for(let p=n;p<n+i;p++){for(let g=0;g<e.itemSize;g++){let m;e.itemSize>4?m=e.array[p*e.itemSize+g]:(g===0?m=e.getX(p):g===1?m=e.getY(p):g===2?m=e.getZ(p):g===3&&(m=e.getW(p)),e.normalized===!0&&(m=kc.normalize(m,e.array))),t===qe.FLOAT?u.setFloat32(h,m,!0):t===qe.INT?u.setInt32(h,m,!0):t===qe.UNSIGNED_INT?u.setUint32(h,m,!0):t===qe.SHORT?u.setInt16(h,m,!0):t===qe.UNSIGNED_SHORT?u.setUint16(h,m,!0):t===qe.BYTE?u.setInt8(h,m):t===qe.UNSIGNED_BYTE&&u.setUint8(h,m),h+=o}h%c!==0&&(h+=c-h%c)}const d={buffer:this.processBuffer(u.buffer),byteOffset:this.byteOffset,byteLength:l};return s!==void 0&&(d.target=s),s===qe.ARRAY_BUFFER&&(d.byteStride=c),this.byteOffset+=l,a.bufferViews.push(d),{id:a.bufferViews.length-1,byteLength:0}}processBufferViewImage(e){const t=this,n=t.json;return n.bufferViews||(n.bufferViews=[]),new Promise(function(i){const s=new FileReader;s.readAsArrayBuffer(e),s.onloadend=function(){const a=dh(s.result),o={buffer:t.processBuffer(a),byteOffset:t.byteOffset,byteLength:a.byteLength};t.byteOffset+=a.byteLength,i(n.bufferViews.push(o)-1)}})}processAccessor(e,t,n,i){const s=this.json,a={1:"SCALAR",2:"VEC2",3:"VEC3",4:"VEC4",9:"MAT3",16:"MAT4"};let o;if(e.array.constructor===Float32Array)o=qe.FLOAT;else if(e.array.constructor===Int32Array)o=qe.INT;else if(e.array.constructor===Uint32Array)o=qe.UNSIGNED_INT;else if(e.array.constructor===Int16Array)o=qe.SHORT;else if(e.array.constructor===Uint16Array)o=qe.UNSIGNED_SHORT;else if(e.array.constructor===Int8Array)o=qe.BYTE;else if(e.array.constructor===Uint8Array)o=qe.UNSIGNED_BYTE;else throw new Error("THREE.GLTFExporter: Unsupported bufferAttribute component type: "+e.array.constructor.name);if(n===void 0&&(n=0),(i===void 0||i===1/0)&&(i=e.count),i===0)return null;const c=OM(e,n,i);let l;t!==void 0&&(l=e===t.index?qe.ELEMENT_ARRAY_BUFFER:qe.ARRAY_BUFFER);const u=this.processBufferView(e,o,n,i,l),h={bufferView:u.id,byteOffset:u.byteOffset,componentType:o,count:i,max:c.max,min:c.min,type:a[e.itemSize]};return e.normalized===!0&&(h.normalized=!0),s.accessors||(s.accessors=[]),s.accessors.push(h)-1}processImage(e,t,n,i="image/png"){if(e!==null){const s=this,a=s.cache,o=s.json,c=s.options,l=s.pending;a.images.has(e)||a.images.set(e,{});const u=a.images.get(e),h=i+":flipY/"+n.toString();if(u[h]!==void 0)return u[h];o.images||(o.images=[]);const d={mimeType:i},f=Xp();f.width=Math.min(e.width,c.maxTextureSize),f.height=Math.min(e.height,c.maxTextureSize);const p=f.getContext("2d",{willReadFrequently:!0});if(n===!0&&(p.translate(0,f.height),p.scale(1,-1)),e.data!==void 0){t!==yt&&console.error("GLTFExporter: Only RGBAFormat is supported.",t),(e.width>c.maxTextureSize||e.height>c.maxTextureSize)&&console.warn("GLTFExporter: Image size is bigger than maxTextureSize",e);const m=new Uint8ClampedArray(e.height*e.width*4);for(let A=0;A<m.length;A+=4)m[A+0]=e.data[A+0],m[A+1]=e.data[A+1],m[A+2]=e.data[A+2],m[A+3]=e.data[A+3];p.putImageData(new ImageData(m,e.width,e.height),0,0)}else if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap||typeof OffscreenCanvas<"u"&&e instanceof OffscreenCanvas)p.drawImage(e,0,0,f.width,f.height);else throw new Error("THREE.GLTFExporter: Invalid image type. Use HTMLImageElement, HTMLCanvasElement, ImageBitmap or OffscreenCanvas.");c.binary===!0?l.push(kM(f,i).then(m=>s.processBufferViewImage(m)).then(m=>{d.bufferView=m})):d.uri=vg.getDataURL(f,i);const g=o.images.push(d)-1;return u[h]=g,g}else throw new Error("THREE.GLTFExporter: No valid image data found. Unable to process texture.")}processSampler(e){const t=this.json;t.samplers||(t.samplers=[]);const n={magFilter:xn[e.magFilter],minFilter:xn[e.minFilter],wrapS:xn[e.wrapS],wrapT:xn[e.wrapT]};return t.samplers.push(n)-1}async processTextureAsync(e){const n=this.options,i=this.cache,s=this.json;if(i.textures.has(e))return i.textures.get(e);s.textures||(s.textures=[]),e instanceof Fs&&(e=await this.decompressTextureAsync(e,n.maxTextureSize));let a=e.userData.mimeType;a==="image/webp"&&(a="image/png");const o={sampler:this.processSampler(e),source:this.processImage(e.image,e.format,e.flipY,a)};e.name&&(o.name=e.name),await this._invokeAllAsync(async function(l){l.writeTexture&&await l.writeTexture(e,o)});const c=s.textures.push(o)-1;return i.textures.set(e,c),c}async processMaterialAsync(e){const t=this.cache,n=this.json;if(t.materials.has(e))return t.materials.get(e);if(e.isShaderMaterial)return console.warn("GLTFExporter: THREE.ShaderMaterial not supported."),null;n.materials||(n.materials=[]);const i={pbrMetallicRoughness:{}};e.isMeshStandardMaterial!==!0&&e.isMeshBasicMaterial!==!0&&console.warn("GLTFExporter: Use MeshStandardMaterial or MeshBasicMaterial for best results.");const s=e.color.toArray().concat([e.opacity]);if(Fa(s,[1,1,1,1])||(i.pbrMetallicRoughness.baseColorFactor=s),e.isMeshStandardMaterial?(i.pbrMetallicRoughness.metallicFactor=e.metalness,i.pbrMetallicRoughness.roughnessFactor=e.roughness):(i.pbrMetallicRoughness.metallicFactor=0,i.pbrMetallicRoughness.roughnessFactor=1),e.metalnessMap||e.roughnessMap){const o=await this.buildMetalRoughTextureAsync(e.metalnessMap,e.roughnessMap),c={index:await this.processTextureAsync(o),texCoord:o.channel};this.applyTextureTransform(c,o),i.pbrMetallicRoughness.metallicRoughnessTexture=c}if(e.map){const o={index:await this.processTextureAsync(e.map),texCoord:e.map.channel};this.applyTextureTransform(o,e.map),i.pbrMetallicRoughness.baseColorTexture=o}if(e.emissive){const o=e.emissive;if(Math.max(o.r,o.g,o.b)>0&&(i.emissiveFactor=e.emissive.toArray()),e.emissiveMap){const l={index:await this.processTextureAsync(e.emissiveMap),texCoord:e.emissiveMap.channel};this.applyTextureTransform(l,e.emissiveMap),i.emissiveTexture=l}}if(e.normalMap){const o={index:await this.processTextureAsync(e.normalMap),texCoord:e.normalMap.channel};e.normalScale&&e.normalScale.x!==1&&(o.scale=e.normalScale.x),this.applyTextureTransform(o,e.normalMap),i.normalTexture=o}if(e.aoMap){const o={index:await this.processTextureAsync(e.aoMap),texCoord:e.aoMap.channel};e.aoMapIntensity!==1&&(o.strength=e.aoMapIntensity),this.applyTextureTransform(o,e.aoMap),i.occlusionTexture=o}e.transparent?i.alphaMode="BLEND":e.alphaTest>0&&(i.alphaMode="MASK",i.alphaCutoff=e.alphaTest),e.side===Vt&&(i.doubleSided=!0),e.name!==""&&(i.name=e.name),this.serializeUserData(e,i),await this._invokeAllAsync(async function(o){o.writeMaterialAsync&&await o.writeMaterialAsync(e,i)});const a=n.materials.push(i)-1;return t.materials.set(e,a),a}async processMeshAsync(e){const t=this.cache,n=this.json,i=[e.geometry.uuid];if(Array.isArray(e.material))for(let b=0,S=e.material.length;b<S;b++)i.push(e.material[b].uuid);else i.push(e.material.uuid);const s=i.join(":");if(t.meshes.has(s))return t.meshes.get(s);const a=e.geometry;let o;e.isLineSegments?o=qe.LINES:e.isLineLoop?o=qe.LINE_LOOP:e.isLine?o=qe.LINE_STRIP:e.isPoints?o=qe.POINTS:o=e.material.wireframe?qe.LINES:qe.TRIANGLES;const c={},l={},u=[],h=[],d={uv:"TEXCOORD_0",uv1:"TEXCOORD_1",uv2:"TEXCOORD_2",uv3:"TEXCOORD_3",color:"COLOR_0",skinWeight:"WEIGHTS_0",skinIndex:"JOINTS_0"},f=a.getAttribute("normal");f!==void 0&&!this.isNormalizedNormalAttribute(f)&&(console.warn("THREE.GLTFExporter: Creating normalized normal attribute from the non-normalized one."),a.setAttribute("normal",this.createNormalizedNormalAttribute(f)));let p=null;for(let b in a.attributes){if(b.slice(0,5)==="morph")continue;const S=a.attributes[b];if(b=d[b]||b.toUpperCase(),/^(POSITION|NORMAL|TANGENT|TEXCOORD_\d+|COLOR_\d+|JOINTS_\d+|WEIGHTS_\d+)$/.test(b)||(b="_"+b),t.attributes.has(this.getUID(S))){l[b]=t.attributes.get(this.getUID(S));continue}p=null;const M=S.array;b==="JOINTS_0"&&!(M instanceof Uint16Array)&&!(M instanceof Uint8Array)?(console.warn('GLTFExporter: Attribute "skinIndex" converted to type UNSIGNED_SHORT.'),p=new Ct(new Uint16Array(M),S.itemSize,S.normalized)):(M instanceof Uint32Array||M instanceof Int32Array)&&!b.startsWith("_")&&(console.warn(`GLTFExporter: Attribute "${b}" converted to type FLOAT.`),p=Vc.Utils.toFloat32BufferAttribute(S));const w=this.processAccessor(p||S,a);w!==null&&(b.startsWith("_")||this.detectMeshQuantization(b,S),l[b]=w,t.attributes.set(this.getUID(S),w))}if(f!==void 0&&a.setAttribute("normal",f),Object.keys(l).length===0)return null;if(e.morphTargetInfluences!==void 0&&e.morphTargetInfluences.length>0){const b=[],S=[],I={};if(e.morphTargetDictionary!==void 0)for(const M in e.morphTargetDictionary)I[e.morphTargetDictionary[M]]=M;for(let M=0;M<e.morphTargetInfluences.length;++M){const w={};let x=!1;for(const v in a.morphAttributes){if(v!=="position"&&v!=="normal"){x||(console.warn("GLTFExporter: Only POSITION and NORMAL morph are supported."),x=!0);continue}const R=a.morphAttributes[v][M],k=v.toUpperCase(),F=a.attributes[v];if(t.attributes.has(this.getUID(R,!0))){w[k]=t.attributes.get(this.getUID(R,!0));continue}const P=R.clone();if(!a.morphTargetsRelative)for(let G=0,O=R.count;G<O;G++)for(let W=0;W<R.itemSize;W++)W===0&&P.setX(G,R.getX(G)-F.getX(G)),W===1&&P.setY(G,R.getY(G)-F.getY(G)),W===2&&P.setZ(G,R.getZ(G)-F.getZ(G)),W===3&&P.setW(G,R.getW(G)-F.getW(G));w[k]=this.processAccessor(P,a),t.attributes.set(this.getUID(F,!0),w[k])}h.push(w),b.push(e.morphTargetInfluences[M]),e.morphTargetDictionary!==void 0&&S.push(I[M])}c.weights=b,S.length>0&&(c.extras={},c.extras.targetNames=S)}const g=Array.isArray(e.material);if(g&&a.groups.length===0)return null;let m=!1;if(g&&a.index===null){const b=[];for(let S=0,I=a.attributes.position.count;S<I;S++)b[S]=S;a.setIndex(b),m=!0}const A=g?e.material:[e.material],E=g?a.groups:[{materialIndex:0,start:void 0,count:void 0}];for(let b=0,S=E.length;b<S;b++){const I={mode:o,attributes:l};if(this.serializeUserData(a,I),h.length>0&&(I.targets=h),a.index!==null){let w=this.getUID(a.index);(E[b].start!==void 0||E[b].count!==void 0)&&(w+=":"+E[b].start+":"+E[b].count),t.attributes.has(w)?I.indices=t.attributes.get(w):(I.indices=this.processAccessor(a.index,a,E[b].start,E[b].count),t.attributes.set(w,I.indices)),I.indices===null&&delete I.indices}const M=await this.processMaterialAsync(A[E[b].materialIndex]);M!==null&&(I.material=M),u.push(I)}m===!0&&a.setIndex(null),c.primitives=u,n.meshes||(n.meshes=[]),await this._invokeAllAsync(function(b){b.writeMesh&&b.writeMesh(e,c)});const _=n.meshes.push(c)-1;return t.meshes.set(s,_),_}detectMeshQuantization(e,t){if(this.extensionsUsed[uh])return;let n;switch(t.array.constructor){case Int8Array:n="byte";break;case Uint8Array:n="unsigned byte";break;case Int16Array:n="short";break;case Uint16Array:n="unsigned short";break;default:return}t.normalized&&(n+=" normalized");const i=e.split("_",1)[0];zp[i]&&zp[i].includes(n)&&(this.extensionsUsed[uh]=!0,this.extensionsRequired[uh]=!0)}processCamera(e){const t=this.json;t.cameras||(t.cameras=[]);const n=e.isOrthographicCamera,i={type:n?"orthographic":"perspective"};return n?i.orthographic={xmag:e.right*2,ymag:e.top*2,zfar:e.far<=0?.001:e.far,znear:e.near<0?0:e.near}:i.perspective={aspectRatio:e.aspect,yfov:kc.degToRad(e.fov),zfar:e.far<=0?.001:e.far,znear:e.near<0?0:e.near},e.name!==""&&(i.name=e.type),t.cameras.push(i)-1}processAnimation(e,t){const n=this.json,i=this.nodeMap;n.animations||(n.animations=[]),e=Vc.Utils.mergeMorphTargetTracks(e.clone(),t);const s=e.tracks,a=[],o=[];for(let c=0;c<s.length;++c){const l=s[c],u=Je.parseTrackName(l.name);let h=Je.findNode(t,u.nodeName);const d=Vp[u.propertyName];if(u.objectName==="bones"&&(h.isSkinnedMesh===!0?h=h.skeleton.getBoneByName(u.objectIndex):h=void 0),!h||!d){console.warn('THREE.GLTFExporter: Could not export animation track "%s".',l.name);continue}const f=1;let p=l.values.length/l.times.length;d===Vp.morphTargetInfluences&&(p/=h.morphTargetInfluences.length);let g;l.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline===!0?(g="CUBICSPLINE",p/=3):l.getInterpolation()===Gr?g="STEP":g="LINEAR",o.push({input:this.processAccessor(new Ct(l.times,f)),output:this.processAccessor(new Ct(l.values,p)),interpolation:g}),a.push({sampler:o.length-1,target:{node:i.get(h),path:d}})}return n.animations.push({name:e.name||"clip_"+n.animations.length,samplers:o,channels:a}),n.animations.length-1}processSkin(e){const t=this.json,n=this.nodeMap,i=t.nodes[n.get(e)],s=e.skeleton;if(s===void 0)return null;const a=e.skeleton.bones[0];if(a===void 0)return null;const o=[],c=new Float32Array(s.bones.length*16),l=new Pe;for(let h=0;h<s.bones.length;++h)o.push(n.get(s.bones[h])),l.copy(s.boneInverses[h]),l.multiply(e.bindMatrix).toArray(c,h*16);return t.skins===void 0&&(t.skins=[]),t.skins.push({inverseBindMatrices:this.processAccessor(new Ct(c,16)),joints:o,skeleton:n.get(a)}),i.skin=t.skins.length-1}async processNodeAsync(e){const t=this.json,n=this.options,i=this.nodeMap;t.nodes||(t.nodes=[]);const s={};if(n.trs){const o=e.quaternion.toArray(),c=e.position.toArray(),l=e.scale.toArray();Fa(o,[0,0,0,1])||(s.rotation=o),Fa(c,[0,0,0])||(s.translation=c),Fa(l,[1,1,1])||(s.scale=l)}else e.matrixAutoUpdate&&e.updateMatrix(),NM(e.matrix)===!1&&(s.matrix=e.matrix.elements);if(e.name!==""&&(s.name=String(e.name)),this.serializeUserData(e,s),e.isMesh||e.isLine||e.isPoints){const o=await this.processMeshAsync(e);o!==null&&(s.mesh=o)}else e.isCamera&&(s.camera=this.processCamera(e));e.isSkinnedMesh&&this.skins.push(e);const a=t.nodes.push(s)-1;if(i.set(e,a),e.children.length>0){const o=[];for(let c=0,l=e.children.length;c<l;c++){const u=e.children[c];if(u.visible||n.onlyVisible===!1){const h=await this.processNodeAsync(u);h!==null&&o.push(h)}}o.length>0&&(s.children=o)}return await this._invokeAllAsync(function(o){o.writeNode&&o.writeNode(e,s)}),a}async processSceneAsync(e){const t=this.json,n=this.options;t.scenes||(t.scenes=[],t.scene=0);const i={};e.name!==""&&(i.name=e.name),t.scenes.push(i);const s=[];for(let a=0,o=e.children.length;a<o;a++){const c=e.children[a];if(c.visible||n.onlyVisible===!1){const l=await this.processNodeAsync(c);l!==null&&s.push(l)}}s.length>0&&(i.nodes=s),this.serializeUserData(e,i)}async processObjectsAsync(e){const t=new Ns;t.name="AuxScene";for(let n=0;n<e.length;n++)t.children.push(e[n]);await this.processSceneAsync(t)}async processInputAsync(e){const t=this.options;e=e instanceof Array?e:[e],await this._invokeAllAsync(function(i){i.beforeParse&&i.beforeParse(e)});const n=[];for(let i=0;i<e.length;i++)e[i]instanceof Ns?await this.processSceneAsync(e[i]):n.push(e[i]);n.length>0&&await this.processObjectsAsync(n);for(let i=0;i<this.skins.length;++i)this.processSkin(this.skins[i]);for(let i=0;i<t.animations.length;++i)this.processAnimation(t.animations[i],e[0]);await this._invokeAllAsync(function(i){i.afterParse&&i.afterParse(e)})}async _invokeAllAsync(e){for(let t=0,n=this.plugins.length;t<n;t++)await e(this.plugins[t])}}class GM{constructor(e){this.writer=e,this.name="KHR_lights_punctual"}writeNode(e,t){if(!e.isLight)return;if(!e.isDirectionalLight&&!e.isPointLight&&!e.isSpotLight){console.warn("THREE.GLTFExporter: Only directional, point, and spot lights are supported.",e);return}const n=this.writer,i=n.json,s=n.extensionsUsed,a={};e.name&&(a.name=e.name),a.color=e.color.toArray(),a.intensity=e.intensity,e.isDirectionalLight?a.type="directional":e.isPointLight?(a.type="point",e.distance>0&&(a.range=e.distance)):e.isSpotLight&&(a.type="spot",e.distance>0&&(a.range=e.distance),a.spot={},a.spot.innerConeAngle=(1-e.penumbra)*e.angle,a.spot.outerConeAngle=e.angle),e.decay!==void 0&&e.decay!==2&&console.warn("THREE.GLTFExporter: Light decay may be lost. glTF is physically-based, and expects light.decay=2."),e.target&&(e.target.parent!==e||e.target.position.x!==0||e.target.position.y!==0||e.target.position.z!==-1)&&console.warn("THREE.GLTFExporter: Light direction may be lost. For best results, make light.target a child of the light with position 0,0,-1."),s[this.name]||(i.extensions=i.extensions||{},i.extensions[this.name]={lights:[]},s[this.name]=!0);const o=i.extensions[this.name].lights;o.push(a),t.extensions=t.extensions||{},t.extensions[this.name]={light:o.length-1}}}class HM{constructor(e){this.writer=e,this.name="KHR_materials_unlit"}async writeMaterialAsync(e,t){if(!e.isMeshBasicMaterial)return;const i=this.writer.extensionsUsed;t.extensions=t.extensions||{},t.extensions[this.name]={},i[this.name]=!0,t.pbrMetallicRoughness.metallicFactor=0,t.pbrMetallicRoughness.roughnessFactor=.9}}class zM{constructor(e){this.writer=e,this.name="KHR_materials_clearcoat"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.clearcoat===0)return;const n=this.writer,i=n.extensionsUsed,s={};if(s.clearcoatFactor=e.clearcoat,e.clearcoatMap){const a={index:await n.processTextureAsync(e.clearcoatMap),texCoord:e.clearcoatMap.channel};n.applyTextureTransform(a,e.clearcoatMap),s.clearcoatTexture=a}if(s.clearcoatRoughnessFactor=e.clearcoatRoughness,e.clearcoatRoughnessMap){const a={index:await n.processTextureAsync(e.clearcoatRoughnessMap),texCoord:e.clearcoatRoughnessMap.channel};n.applyTextureTransform(a,e.clearcoatRoughnessMap),s.clearcoatRoughnessTexture=a}if(e.clearcoatNormalMap){const a={index:await n.processTextureAsync(e.clearcoatNormalMap),texCoord:e.clearcoatNormalMap.channel};e.clearcoatNormalScale.x!==1&&(a.scale=e.clearcoatNormalScale.x),n.applyTextureTransform(a,e.clearcoatNormalMap),s.clearcoatNormalTexture=a}t.extensions=t.extensions||{},t.extensions[this.name]=s,i[this.name]=!0}}class VM{constructor(e){this.writer=e,this.name="KHR_materials_dispersion"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.dispersion===0)return;const i=this.writer.extensionsUsed,s={};s.dispersion=e.dispersion,t.extensions=t.extensions||{},t.extensions[this.name]=s,i[this.name]=!0}}class WM{constructor(e){this.writer=e,this.name="KHR_materials_iridescence"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.iridescence===0)return;const n=this.writer,i=n.extensionsUsed,s={};if(s.iridescenceFactor=e.iridescence,e.iridescenceMap){const a={index:await n.processTextureAsync(e.iridescenceMap),texCoord:e.iridescenceMap.channel};n.applyTextureTransform(a,e.iridescenceMap),s.iridescenceTexture=a}if(s.iridescenceIor=e.iridescenceIOR,s.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],s.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1],e.iridescenceThicknessMap){const a={index:await n.processTextureAsync(e.iridescenceThicknessMap),texCoord:e.iridescenceThicknessMap.channel};n.applyTextureTransform(a,e.iridescenceThicknessMap),s.iridescenceThicknessTexture=a}t.extensions=t.extensions||{},t.extensions[this.name]=s,i[this.name]=!0}}class qM{constructor(e){this.writer=e,this.name="KHR_materials_transmission"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.transmission===0)return;const n=this.writer,i=n.extensionsUsed,s={};if(s.transmissionFactor=e.transmission,e.transmissionMap){const a={index:await n.processTextureAsync(e.transmissionMap),texCoord:e.transmissionMap.channel};n.applyTextureTransform(a,e.transmissionMap),s.transmissionTexture=a}t.extensions=t.extensions||{},t.extensions[this.name]=s,i[this.name]=!0}}class XM{constructor(e){this.writer=e,this.name="KHR_materials_volume"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.transmission===0)return;const n=this.writer,i=n.extensionsUsed,s={};if(s.thicknessFactor=e.thickness,e.thicknessMap){const a={index:await n.processTextureAsync(e.thicknessMap),texCoord:e.thicknessMap.channel};n.applyTextureTransform(a,e.thicknessMap),s.thicknessTexture=a}e.attenuationDistance!==1/0&&(s.attenuationDistance=e.attenuationDistance),s.attenuationColor=e.attenuationColor.toArray(),t.extensions=t.extensions||{},t.extensions[this.name]=s,i[this.name]=!0}}class $M{constructor(e){this.writer=e,this.name="KHR_materials_ior"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.ior===1.5)return;const i=this.writer.extensionsUsed,s={};s.ior=e.ior,t.extensions=t.extensions||{},t.extensions[this.name]=s,i[this.name]=!0}}class jM{constructor(e){this.writer=e,this.name="KHR_materials_specular"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.specularIntensity===1&&e.specularColor.equals(BM)&&!e.specularIntensityMap&&!e.specularColorMap)return;const n=this.writer,i=n.extensionsUsed,s={};if(e.specularIntensityMap){const a={index:await n.processTextureAsync(e.specularIntensityMap),texCoord:e.specularIntensityMap.channel};n.applyTextureTransform(a,e.specularIntensityMap),s.specularTexture=a}if(e.specularColorMap){const a={index:await n.processTextureAsync(e.specularColorMap),texCoord:e.specularColorMap.channel};n.applyTextureTransform(a,e.specularColorMap),s.specularColorTexture=a}s.specularFactor=e.specularIntensity,s.specularColorFactor=e.specularColor.toArray(),t.extensions=t.extensions||{},t.extensions[this.name]=s,i[this.name]=!0}}class YM{constructor(e){this.writer=e,this.name="KHR_materials_sheen"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.sheen==0)return;const n=this.writer,i=n.extensionsUsed,s={};if(e.sheenRoughnessMap){const a={index:await n.processTextureAsync(e.sheenRoughnessMap),texCoord:e.sheenRoughnessMap.channel};n.applyTextureTransform(a,e.sheenRoughnessMap),s.sheenRoughnessTexture=a}if(e.sheenColorMap){const a={index:await n.processTextureAsync(e.sheenColorMap),texCoord:e.sheenColorMap.channel};n.applyTextureTransform(a,e.sheenColorMap),s.sheenColorTexture=a}s.sheenRoughnessFactor=e.sheenRoughness,s.sheenColorFactor=e.sheenColor.toArray(),t.extensions=t.extensions||{},t.extensions[this.name]=s,i[this.name]=!0}}class KM{constructor(e){this.writer=e,this.name="KHR_materials_anisotropy"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.anisotropy==0)return;const n=this.writer,i=n.extensionsUsed,s={};if(e.anisotropyMap){const a={index:await n.processTextureAsync(e.anisotropyMap)};n.applyTextureTransform(a,e.anisotropyMap),s.anisotropyTexture=a}s.anisotropyStrength=e.anisotropy,s.anisotropyRotation=e.anisotropyRotation,t.extensions=t.extensions||{},t.extensions[this.name]=s,i[this.name]=!0}}class JM{constructor(e){this.writer=e,this.name="KHR_materials_emissive_strength"}async writeMaterialAsync(e,t){if(!e.isMeshStandardMaterial||e.emissiveIntensity===1)return;const i=this.writer.extensionsUsed,s={};s.emissiveStrength=e.emissiveIntensity,t.extensions=t.extensions||{},t.extensions[this.name]=s,i[this.name]=!0}}class ZM{constructor(e){this.writer=e,this.name="EXT_materials_bump"}async writeMaterialAsync(e,t){if(!e.isMeshStandardMaterial||e.bumpScale===1&&!e.bumpMap)return;const n=this.writer,i=n.extensionsUsed,s={};if(e.bumpMap){const a={index:await n.processTextureAsync(e.bumpMap),texCoord:e.bumpMap.channel};n.applyTextureTransform(a,e.bumpMap),s.bumpTexture=a}s.bumpFactor=e.bumpScale,t.extensions=t.extensions||{},t.extensions[this.name]=s,i[this.name]=!0}}class ew{constructor(e){this.writer=e,this.name="EXT_mesh_gpu_instancing"}writeNode(e,t){if(!e.isInstancedMesh)return;const n=this.writer,i=e,s=new Float32Array(i.count*3),a=new Float32Array(i.count*4),o=new Float32Array(i.count*3),c=new Pe,l=new B,u=new dn,h=new B;for(let f=0;f<i.count;f++)i.getMatrixAt(f,c),c.decompose(l,u,h),l.toArray(s,f*3),u.toArray(a,f*4),h.toArray(o,f*3);const d={TRANSLATION:n.processAccessor(new Ct(s,3)),ROTATION:n.processAccessor(new Ct(a,4)),SCALE:n.processAccessor(new Ct(o,3))};i.instanceColor&&(d._COLOR_0=n.processAccessor(i.instanceColor)),t.extensions=t.extensions||{},t.extensions[this.name]={attributes:d},n.extensionsUsed[this.name]=!0,n.extensionsRequired[this.name]=!0}}Vc.Utils={insertKeyframe:function(r,e){const n=r.getValueSize(),i=new r.TimeBufferType(r.times.length+1),s=new r.ValueBufferType(r.values.length+n),a=r.createInterpolant(new r.ValueBufferType(n));let o;if(r.times.length===0){i[0]=e;for(let c=0;c<n;c++)s[c]=0;o=0}else if(e<r.times[0]){if(Math.abs(r.times[0]-e)<.001)return 0;i[0]=e,i.set(r.times,1),s.set(a.evaluate(e),0),s.set(r.values,n),o=0}else if(e>r.times[r.times.length-1]){if(Math.abs(r.times[r.times.length-1]-e)<.001)return r.times.length-1;i[i.length-1]=e,i.set(r.times,0),s.set(r.values,0),s.set(a.evaluate(e),r.values.length),o=i.length-1}else for(let c=0;c<r.times.length;c++){if(Math.abs(r.times[c]-e)<.001)return c;if(r.times[c]<e&&r.times[c+1]>e){i.set(r.times.slice(0,c+1),0),i[c+1]=e,i.set(r.times.slice(c+1),c+2),s.set(r.values.slice(0,(c+1)*n),0),s.set(a.evaluate(e),(c+1)*n),s.set(r.values.slice((c+1)*n),(c+2)*n),o=c+1;break}}return r.times=i,r.values=s,o},mergeMorphTargetTracks:function(r,e){const t=[],n={},i=r.tracks;for(let s=0;s<i.length;++s){let a=i[s];const o=Je.parseTrackName(a.name),c=Je.findNode(e,o.nodeName);if(o.propertyName!=="morphTargetInfluences"||o.propertyIndex===void 0){t.push(a);continue}if(a.createInterpolant!==a.InterpolantFactoryMethodDiscrete&&a.createInterpolant!==a.InterpolantFactoryMethodLinear){if(a.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline)throw new Error("THREE.GLTFExporter: Cannot merge tracks with glTF CUBICSPLINE interpolation.");console.warn("THREE.GLTFExporter: Morph target interpolation mode not yet supported. Using LINEAR instead."),a=a.clone(),a.setInterpolation(Hr)}const l=c.morphTargetInfluences.length,u=c.morphTargetDictionary[o.propertyIndex];if(u===void 0)throw new Error("THREE.GLTFExporter: Morph target name not found: "+o.propertyIndex);let h;if(n[c.uuid]===void 0){h=a.clone();const f=new h.ValueBufferType(l*h.times.length);for(let p=0;p<h.times.length;p++)f[p*l+u]=h.values[p];h.name=(o.nodeName||"")+".morphTargetInfluences",h.values=f,n[c.uuid]=h,t.push(h);continue}const d=a.createInterpolant(new a.ValueBufferType(1));h=n[c.uuid];for(let f=0;f<h.times.length;f++)h.values[f*l+u]=d.evaluate(h.times[f]);for(let f=0;f<a.times.length;f++){const p=this.insertKeyframe(h,a.times[f]);h.values[p*l+u]=a.values[f]}}return r.tracks=t,r},toFloat32BufferAttribute:function(r){const e=new Ct(new Float32Array(r.count*r.itemSize),r.itemSize,!1);if(!r.normalized&&!r.isInterleavedBufferAttribute)return e.array.set(r.array),e;for(let t=0,n=r.count;t<n;t++)for(let i=0;i<r.itemSize;i++)e.setComponent(t,i,r.getComponent(t,i));return e}};/* @license
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
 */const $p=r=>r.material!==void 0&&r.userData&&r.userData.variantMaterials&&!!Array.from(r.userData.variantMaterials.values()).filter(e=>yc(e.material)),yc=r=>r&&r.isMaterial&&!Array.isArray(r);class tw{constructor(e){this.writer=e,this.name="KHR_materials_variants",this.variantNames=[]}beforeParse(e){const t=new Set,n=i=>{if(!$p(i))return;const s=i.userData.variantMaterials,a=i.userData.variantData;for(const[o,c]of a){const l=s.get(c.index);l&&yc(l.material)&&t.add(o)}};if(Array.isArray(e))for(const i of e)i.traverse(n);else e.traverse(n);t.forEach(i=>this.variantNames.push(i))}async writeMesh(e,t){if(!$p(e))return;const n=e.userData,i=n.variantMaterials,s=n.variantData,a=new Map,o=new Map,c=Array.from(s.values()).sort((h,d)=>h.index-d.index);for(const[h,d]of c.entries())o.set(d.index,h);for(const h of s.values()){const d=i.get(h.index);if(!d||!yc(d.material))continue;const f=await this.writer.processMaterialAsync(d.material);a.has(f)||a.set(f,{material:f,variants:[]}),a.get(f).variants.push(o.get(h.index))}const l=Array.from(a.values()).map(h=>h.variants.sort((d,f)=>d-f)&&h).sort((h,d)=>h.material-d.material);if(l.length===0)return;const u=yc(n.originalMaterial)?await this.writer.processMaterialAsync(n.originalMaterial):-1;for(const h of t.primitives)u>=0&&(h.material=u),h.extensions=h.extensions||{},h.extensions[this.name]={mappings:l}}afterParse(){if(this.variantNames.length===0)return;const e=this.writer.json;e.extensions=e.extensions||{};const t=this.variantNames.map(n=>({name:n}));e.extensions[this.name]={variants:t},this.writer.extensionsUsed[this.name]=!0}}class nw{constructor(e,t,n,i,s){this.xrLight=e,this.renderer=t,this.lightProbe=n,this.xrWebGLBinding=null,this.estimationStartCallback=s,this.frameCallback=this.onXRFrame.bind(this);const a=t.xr.getSession();if(i&&"XRWebGLBinding"in window){const o=new vd(16);e.environment=o.texture;const c=t.getContext();switch(a.preferredReflectionFormat){case"srgba8":c.getExtension("EXT_sRGB");break;case"rgba16f":c.getExtension("OES_texture_half_float");break}this.xrWebGLBinding=new XRWebGLBinding(a,c),this.lightProbe.addEventListener("reflectionchange",()=>{this.updateReflection()})}a.requestAnimationFrame(this.frameCallback)}updateReflection(){const e=this.renderer.properties.get(this.xrLight.environment);if(e){const t=this.xrWebGLBinding.getReflectionCubeMap(this.lightProbe);t&&(e.__webglTexture=t,this.xrLight.environment.needsPMREMUpdate=!0)}}onXRFrame(e,t){if(!this.xrLight)return;t.session.requestAnimationFrame(this.frameCallback);const i=t.getLightEstimate(this.lightProbe);if(i){this.xrLight.lightProbe.sh.fromArray(i.sphericalHarmonicsCoefficients),this.xrLight.lightProbe.intensity=1;const s=Math.max(1,Math.max(i.primaryLightIntensity.x,Math.max(i.primaryLightIntensity.y,i.primaryLightIntensity.z)));this.xrLight.directionalLight.color.setRGB(i.primaryLightIntensity.x/s,i.primaryLightIntensity.y/s,i.primaryLightIntensity.z/s),this.xrLight.directionalLight.intensity=s,this.xrLight.directionalLight.position.copy(i.primaryLightDirection),this.estimationStartCallback&&(this.estimationStartCallback(),this.estimationStartCallback=null)}}dispose(){this.xrLight=null,this.renderer=null,this.lightProbe=null,this.xrWebGLBinding=null}}class iw extends Yi{constructor(e,t=!0){super(),this.lightProbe=new OE,this.lightProbe.intensity=0,this.add(this.lightProbe),this.directionalLight=new Gg,this.directionalLight.intensity=0,this.add(this.directionalLight),this.environment=null;let n=null,i=!1;e.xr.addEventListener("sessionstart",()=>{const s=e.xr.getSession();"requestLightProbe"in s&&s.requestLightProbe({reflectionFormat:s.preferredReflectionFormat}).then(a=>{n=new nw(this,e,a,t,()=>{i=!0,this.dispatchEvent({type:"estimationstart"})})})}),e.xr.addEventListener("sessionend",()=>{n&&(n.dispose(),n=null),i&&this.dispatchEvent({type:"estimationend"})}),this.dispose=()=>{n&&(n.dispose(),n=null),this.remove(this.lightProbe),this.lightProbe=null,this.remove(this.directionalLight),this.directionalLight=null,this.environment=null}}}/* @license
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
 */const C0=1e4,sw=.001,I0=50;class ln{constructor(e=I0){this.velocity=0,this.naturalFrequency=0,this.setDecayTime(e)}setDecayTime(e){this.naturalFrequency=1/Math.max(sw,e)}update(e,t,n,i){const s=2e-4*this.naturalFrequency;if(e==null||i===0||e===t&&this.velocity===0)return t;if(n<0)return e;const a=e-t,o=this.velocity+this.naturalFrequency*a,c=a+n*o,l=Math.exp(-this.naturalFrequency*n),u=(o-this.naturalFrequency*c)*l,h=-this.naturalFrequency*(u+o*l);return Math.abs(u)<s*Math.abs(i)&&h*a>=0?(this.velocity=0,t):(this.velocity=u,t+c*l)}}/* @license
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
 */const ei=.2,jp=.03,rw=.75,M0=12,aw=Math.PI/(2*M0),Yp=new Oe,$o=(r,e,t)=>{let n=e>0?t>0?0:-Math.PI/2:t>0?Math.PI/2:Math.PI;for(let i=0;i<=M0;++i)r.push(e+(ei-jp)*Math.cos(n),t+(ei-jp)*Math.sin(n),0,e+ei*Math.cos(n),t+ei*Math.sin(n),0),n+=aw};class Kp extends ut{constructor(e,t){const n=new An,i=[],s=[],{size:a,boundingBox:o}=e,c=a.x/2,l=(t==="back"?a.y:a.z)/2;$o(s,c,l),$o(s,-c,l),$o(s,-c,-l),$o(s,c,-l);const u=s.length/3;for(let f=0;f<u-2;f+=2)i.push(f,f+1,f+3,f,f+3,f+2);const h=u-2;i.push(h,h+1,1,h,1,0),n.setAttribute("position",new Sn(s,3)),n.setIndex(i),super(n),this.side=t;const d=this.material;switch(d.side=Vt,d.transparent=!0,d.opacity=0,this.goalOpacity=0,this.opacityDamper=new ln,this.hitPlane=new ut(new Li(2*(c+ei),2*(l+ei))),this.hitPlane.visible=!1,this.hitPlane.material.side=Vt,this.add(this.hitPlane),this.hitBox=new ut(new Di(a.x+2*ei,a.y+ei,a.z+2*ei)),this.hitBox.visible=!1,this.hitBox.material.side=Vt,this.add(this.hitBox),o.getCenter(this.position),t){case"bottom":this.rotateX(-Math.PI/2),this.shadowHeight=o.min.y,this.position.y=this.shadowHeight;break;case"back":this.shadowHeight=o.min.z,this.position.z=this.shadowHeight}e.target.add(this),this.hitBox.position.y=(a.y+ei)/2+o.min.y,e.target.add(this.hitBox),this.offsetHeight=0}getHit(e,t,n){Yp.set(t,-n),this.hitPlane.visible=!0;const i=e.positionAndNormalFromPoint(Yp,this.hitPlane);return this.hitPlane.visible=!1,i==null?null:i.position}getExpandedHit(e,t,n){this.hitPlane.scale.set(1e3,1e3,1e3),this.hitPlane.updateMatrixWorld();const i=this.getHit(e,t,n);return this.hitPlane.scale.set(1,1,1),i}controllerIntersection(e,t){this.hitBox.visible=!0;const n=e.hitFromController(t,this.hitBox);return this.hitBox.visible=!1,n}set offsetHeight(e){e-=.001,this.side==="back"?this.position.z=this.shadowHeight+e:this.position.y=this.shadowHeight+e}get offsetHeight(){return this.side==="back"?this.position.z-this.shadowHeight:this.position.y-this.shadowHeight}set show(e){this.goalOpacity=e?rw:0}updateOpacity(e){const t=this.material;t.opacity=this.opacityDamper.update(t.opacity,this.goalOpacity,e,1),this.visible=t.opacity>0}dispose(){const{geometry:e,material:t}=this.hitPlane;e.dispose(),t.dispose(),this.hitBox.geometry.dispose(),this.hitBox.material.dispose(),this.geometry.dispose(),this.material.dispose(),this.hitBox.removeFromParent(),this.removeFromParent()}}/* @license
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
 */const Zt=(r,e)=>({type:"number",number:r,unit:e}),Ti=(()=>{const r={};return t=>{const n=t;if(n in r)return r[n];const i=[];let s=0;for(;t;){if(++s>1e3){t="";break}const a=w0(t),o=a.nodes[0];if(o==null||o.terms.length===0)break;i.push(o),t=a.remainingInput}return r[n]=i}})(),w0=(()=>{const r=/^(\-\-|[a-z\u0240-\uffff])/i,e=/^([\*\+\/]|[\-]\s)/i,t=/^[\),]/;return s=>{const a=[];for(;s.length&&(s=s.trim(),!t.test(s));)if(s[0]==="("){const{nodes:o,remainingInput:c}=Jp(s);s=c,a.push({type:"function",name:{type:"ident",value:"calc"},arguments:o})}else if(r.test(s)){const o=ow(s),c=o.nodes[0];if(s=o.remainingInput,s[0]==="("){const{nodes:l,remainingInput:u}=Jp(s);a.push({type:"function",name:c,arguments:l}),s=u}else a.push(c)}else if(e.test(s))a.push({type:"operator",value:s[0]}),s=s.slice(1);else{const{nodes:o,remainingInput:c}=s[0]==="#"?lw(s):cw(s);if(o.length===0)break;a.push(o[0]),s=c}return{nodes:[{type:"expression",terms:a}],remainingInput:s}}})(),ow=(()=>{const r=/[^a-z0-9_\-\u0240-\uffff]/i;return e=>{const t=e.match(r),n=t==null?e:e.substr(0,t.index),i=t==null?"":e.substr(t.index);return{nodes:[{type:"ident",value:n}],remainingInput:i}}})(),cw=(()=>{const r=/[\+\-]?(\d+[\.]\d+|\d+|[\.]\d+)([eE][\+\-]?\d+)?/,e=/^[a-z%]+/i,t=/^(m|mm|cm|rad|deg|[%])$/;return n=>{const i=n.match(r),s=i==null?"0":i[0];n=s==null?n:n.slice(s.length);const a=n.match(e);let o=a!=null&&a[0]!==""?a[0]:null;const c=a==null?n:n.slice(o.length);return o!=null&&!t.test(o)&&(o=null),{nodes:[{type:"number",number:parseFloat(s)||0,unit:o}],remainingInput:c}}})(),lw=(()=>{const r=/^[a-f0-9]*/i;return e=>{e=e.slice(1).trim();const t=e.match(r);return{nodes:t==null?[]:[{type:"hex",value:t[0]}],remainingInput:t==null?e:e.slice(t[0].length)}}})(),Jp=r=>{const e=[];for(r=r.slice(1).trim();r.length;){const t=w0(r);if(e.push(t.nodes[0]),r=t.remainingInput.trim(),r[0]===",")r=r.slice(1).trim();else if(r[0]===")"){r=r.slice(1);break}}return{nodes:e,remainingInput:r}},Zp=Symbol("visitedTypes");class hw{constructor(e){this[Zp]=e}walk(e,t){const n=e.slice();for(;n.length;){const i=n.shift();switch(this[Zp].indexOf(i.type)>-1&&t(i),i.type){case"expression":n.unshift(...i.terms);break;case"function":n.unshift(i.name,...i.arguments);break}}}}const ts=Object.freeze({type:"number",number:0,unit:null});/* @license
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
 */const al=(r,e=0)=>{let{number:t,unit:n}=r;if(!isFinite(t))t=e,n="rad";else if(r.unit==="rad"||r.unit==null)return r;return{type:"number",number:(n==="deg"&&t!=null?t:0)*Math.PI/180,unit:"rad"}},eA=(r,e=0)=>{let{number:t,unit:n}=r;if(!isFinite(t))t=e,n="m";else if(r.unit==="m")return r;let i;switch(n){default:i=1;break;case"cm":i=1/100;break;case"mm":i=1/1e3;break}return{type:"number",number:i*t,unit:"m"}},ni=(()=>{const r=t=>t,e={rad:r,deg:al,m:r,mm:eA,cm:eA};return(t,n=ts)=>{isFinite(t.number)||(t.number=n.number,t.unit=n.unit);const{unit:i}=t;if(i==null)return t;const s=e[i];return s==null?n:s(t)}})();/* @license
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
 */var T0,tA,nA;const ta=Symbol("evaluate"),Sc=Symbol("lastValue");class wt{constructor(){this[T0]=null}static evaluatableFor(e,t=ts){if(e instanceof wt)return e;if(e.type==="number")return e.unit==="%"?new uw(e,t):e;switch(e.name.value){case"calc":return new pw(e,t);case"env":return new dw(e)}return ts}static evaluate(e){return e instanceof wt?e.evaluate():e}static isConstant(e){return e instanceof wt?e.isConstant:!0}static applyIntrinsics(e,t){const{basis:n,keywords:i}=t,{auto:s}=i;return n.map((a,o)=>{const c=s[o]==null?a:s[o];let l=e[o]?e[o]:c;if(l.type==="ident"){const u=l.value;u in i&&(l=i[u][o])}return(l==null||l.type==="ident")&&(l=c),l.unit==="%"?Zt(l.number/100*a.number,a.unit):(l=ni(l,a),l.unit!==a.unit?a:l)})}get isConstant(){return!1}evaluate(){return(!this.isConstant||this[Sc]==null)&&(this[Sc]=this[ta]()),this[Sc]}}T0=Sc;const iA=Symbol("percentage"),fh=Symbol("basis");class uw extends wt{constructor(e,t){super(),this[iA]=e,this[fh]=t}get isConstant(){return!0}[ta](){return Zt(this[iA].number/100*this[fh].number,this[fh].unit)}}const jo=Symbol("identNode");class dw extends wt{constructor(e){super(),this[tA]=null;const t=e.arguments.length?e.arguments[0].terms[0]:null;t!=null&&t.type==="ident"&&(this[jo]=t)}get isConstant(){return!1}[(tA=jo,ta)](){if(this[jo]!=null)switch(this[jo].value){case"window-scroll-y":const e=window.pageYOffset,t=Math.max(document.body.scrollHeight,document.body.offsetHeight,document.documentElement.clientHeight,document.documentElement.scrollHeight,document.documentElement.offsetHeight);return{type:"number",number:e/(t-window.innerHeight)||0,unit:null}}return ts}}const fw=/[\*\/]/,ar=Symbol("evaluator");class pw extends wt{constructor(e,t=ts){if(super(),this[nA]=null,e.arguments.length!==1)return;const n=e.arguments[0].terms.slice(),i=[];for(;n.length;){const s=n.shift();if(i.length>0){const a=i[i.length-1];if(a.type==="operator"&&fw.test(a.value)){const o=i.pop(),c=i.pop();if(c==null)return;i.push(new rA(o,wt.evaluatableFor(c,t),wt.evaluatableFor(s,t)));continue}}i.push(s.type==="operator"?s:wt.evaluatableFor(s,t))}for(;i.length>2;){const[s,a,o]=i.splice(0,3);if(a.type!=="operator")return;i.unshift(new rA(a,wt.evaluatableFor(s,t),wt.evaluatableFor(o,t)))}i.length===1&&(this[ar]=i[0])}get isConstant(){return this[ar]==null||wt.isConstant(this[ar])}[(nA=ar,ta)](){return this[ar]!=null?wt.evaluate(this[ar]):ts}}const sA=Symbol("operator"),ph=Symbol("left"),Ah=Symbol("right");class rA extends wt{constructor(e,t,n){super(),this[sA]=e,this[ph]=t,this[Ah]=n}get isConstant(){return wt.isConstant(this[ph])&&wt.isConstant(this[Ah])}[ta](){const e=ni(wt.evaluate(this[ph])),t=ni(wt.evaluate(this[Ah])),{number:n,unit:i}=e,{number:s,unit:a}=t;if(a!=null&&i!=null&&a!=i)return ts;const o=i||a;let c;switch(this[sA].value){case"+":c=n+s;break;case"-":c=n-s;break;case"/":c=n/s;break;case"*":c=n*s;break;default:return ts}return{type:"number",number:c,unit:o}}}const mh=Symbol("evaluatables"),aA=Symbol("intrinsics");class R0 extends wt{constructor(e,t){super(),this[aA]=t;const n=e[0],i=n!=null?n.terms:[];this[mh]=t.basis.map((s,a)=>{const o=i[a];return o==null?{type:"ident",value:"auto"}:o.type==="ident"?o:wt.evaluatableFor(o,s)})}get isConstant(){for(const e of this[mh])if(!wt.isConstant(e))return!1;return!0}[ta](){const e=this[mh].map(t=>wt.evaluate(t));return wt.applyIntrinsics(e,this[aA]).map(t=>t.number)}}/* @license
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
 */var B0,D0,L0,F0;const or=Symbol("instances"),oA=Symbol("activateListener"),cA=Symbol("deactivateListener"),gh=Symbol("notifyInstances"),lA=Symbol("notify"),hA=Symbol("callback");class Jn{static[gh](){for(const e of Jn[or])e[lA]()}static[(B0=or,oA)](){window.addEventListener("scroll",this[gh],{passive:!0})}static[cA](){window.removeEventListener("scroll",this[gh])}constructor(e){this[hA]=e}observe(){Jn[or].size===0&&Jn[oA](),Jn[or].add(this)}disconnect(){Jn[or].delete(this),Jn[or].size===0&&Jn[cA]()}[lA](){this[hA]()}}Jn[B0]=new Set;const uA=Symbol("computeStyleCallback"),P0=Symbol("astWalker"),Pa=Symbol("dependencies"),U0=Symbol("onScroll");class Aw{constructor(e){this[D0]={},this[L0]=new hw(["function"]),this[F0]=()=>{this[uA]({relatedState:"window-scroll"})},this[uA]=e}observeEffectsFor(e){const t={},n=this[Pa];this[P0].walk(e,i=>{const{name:s}=i,o=i.arguments[0].terms[0];if(!(s.value!=="env"||o==null||o.type!=="ident"))switch(o.value){case"window-scroll-y":if(t["window-scroll"]==null){const c="window-scroll"in n?n["window-scroll"]:new Jn(this[U0]);c.observe(),delete n["window-scroll"],t["window-scroll"]=c}break}});for(const i in n)n[i].disconnect();this[Pa]=t}dispose(){for(const e in this[Pa])this[Pa][e].disconnect()}}D0=Pa,L0=P0,F0=U0;/* @license
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
 */const zi=r=>{const e=r.observeEffects||!1,t=r.intrinsics instanceof Function?r.intrinsics:()=>r.intrinsics;return(n,i)=>{const s=n.updated,a=n.connectedCallback,o=n.disconnectedCallback,c=Symbol(`${i}StyleEffector`),l=Symbol(`${i}StyleEvaluator`),u=Symbol(`${i}UpdateEvaluator`),h=Symbol(`${i}EvaluateAndSync`);Object.defineProperties(n,{[c]:{value:null,writable:!0},[l]:{value:null,writable:!0},[u]:{value:function(){const d=Ti(this[i]);this[l]=new R0(d,t(this)),this[c]==null&&e&&(this[c]=new Aw(()=>this[h]())),this[c]!=null&&this[c].observeEffectsFor(d)}},[h]:{value:function(){if(this[l]==null)return;const d=this[l].evaluate();this[r.updateHandler](d)}},updated:{value:function(d){d.has(i)&&(this[u](),this[h]()),s.call(this,d)}},connectedCallback:{value:function(){a.call(this),this.requestUpdate(i,this[i])}},disconnectedCallback:{value:function(){o.call(this),this[c]!=null&&(this[c].dispose(),this[c]=null)}}})}};/* @license
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
 */const N0=r=>r<.5?2*r*r:-1+(4-2*r)*r,mw=(r,e,t=N0)=>n=>r+(e-r)*t(n),gw=(r,e)=>{const t=i=>s=>i+=s,n=e.map(t(0));return i=>{i=ti(i,0,1),i*=n[n.length-1];const s=n.findIndex(c=>c>=i),a=s<1?0:n[s-1],o=n[s];return r[s]((i-a)/(o-a))}},Ir=r=>{const e=[],t=[];let n=r.initialValue;for(let i=0;i<r.keyframes.length;++i){const s=r.keyframes[i],{value:a,frames:o}=s,c=s.ease||N0,l=mw(n,a,c);e.push(l),t.push(o),n=a}return gw(e,t)};/* @license
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
 */var Pt=function(r,e,t,n){var i=arguments.length,s=i<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,t):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(r,e,t,n);else for(var o=r.length-1;o>=0;o--)(a=r[o])&&(s=(i<3?a(s):i>3?a(e,t,s):a(e,t))||s);return i>3&&s&&Object.defineProperty(e,t,s),s};const bw=5e3,_w=Ir({initialValue:0,keyframes:[{frames:5,value:-1},{frames:1,value:-1},{frames:8,value:1},{frames:1,value:1},{frames:5,value:0},{frames:18,value:0}]}),Ew=Ir({initialValue:0,keyframes:[{frames:1,value:1},{frames:5,value:1},{frames:1,value:0},{frames:6,value:0}]}),vw=30,xw=12,O0="0deg 75deg 105%",yw="auto auto auto",Sw="auto",Cw=2.2,Iw=["front","right","back","left"],Mw=["upper-","","lower-"],ww=3e3,Tw=". Use mouse, touch or arrow keys to move.",Yo={AUTO:"auto"},bh={BASIC:"basic",WIGGLE:"wiggle"},Rw={NONE:"none"},dA=()=>({basis:[al(Zt(vw,"deg"))],keywords:{auto:[null]}}),Bw=()=>({basis:[al(Zt(xw,"deg"))],keywords:{auto:[null]}}),k0=(()=>{const r=Ti(O0)[0].terms,e=ni(r[0]),t=ni(r[1]);return n=>{const i=n[ee].idealCameraDistance();return{basis:[e,t,Zt(i,"m")],keywords:{auto:[null,null,Zt(105,"%")]}}}})(),Dw=r=>{const e=Cw*r[ee].boundingSphere.radius;return{basis:[Zt(-1/0,"rad"),Zt(0,"rad"),Zt(e,"m")],keywords:{auto:[null,null,null]}}},Lw=r=>{const e=k0(r),n=new R0([],e).evaluate()[2];return{basis:[Zt(1/0,"rad"),Zt(Math.PI,"rad"),Zt(n,"m")],keywords:{auto:[null,null,null]}}},Fw=r=>{const e=r[ee].boundingBox.getCenter(new B);return{basis:[Zt(e.x,"m"),Zt(e.y,"m"),Zt(e.z,"m")],keywords:{auto:[null,null,null]}}},Q0=Math.PI/2,Pw=Math.PI/3,Uw=Q0/2,Nw=2*Math.PI,at=Symbol("controls"),Cc=Symbol("panElement"),_h=Symbol("promptElement"),Ko=Symbol("promptAnimatedContainer"),Eh=Symbol("fingerAnimatedContainers"),Jo=Symbol("deferInteractionPrompt"),fA=Symbol("updateAria"),bi=Symbol("a11y"),pA=Symbol("updateA11y"),AA=Symbol("updateCameraForRadius"),cr=Symbol("cancelPrompts"),vh=Symbol("onChange"),Aa=Symbol("onPointerChange"),fs=Symbol("waitingToPromptUser"),Zo=Symbol("userHasInteracted"),lr=Symbol("promptElementVisibleTime"),ma=Symbol("lastPromptOffset"),ec=Symbol("cancellationSource"),xh=Symbol("lastSpherical"),ga=Symbol("jumpCamera"),yh=Symbol("initialized"),ba=Symbol("maintainThetaPhi"),mA=Symbol("syncCameraOrbit"),gA=Symbol("syncFieldOfView"),bA=Symbol("syncCameraTarget"),_A=Symbol("syncMinCameraOrbit"),EA=Symbol("syncMaxCameraOrbit"),vA=Symbol("syncMinFieldOfView"),xA=Symbol("syncMaxFieldOfView"),Ow=r=>{var e,t,n,i,s,a,o,c,l,u,h,d,f,p,g,m,A,E;class _ extends r{constructor(){super(...arguments),this.cameraControls=!1,this.cameraOrbit=O0,this.cameraTarget=yw,this.fieldOfView=Sw,this.minCameraOrbit="auto",this.maxCameraOrbit="auto",this.minFieldOfView="auto",this.maxFieldOfView="auto",this.interactionPromptThreshold=ww,this.interactionPrompt=Yo.AUTO,this.interactionPromptStyle=bh.WIGGLE,this.orbitSensitivity=1,this.zoomSensitivity=1,this.panSensitivity=1,this.touchAction=Rw.NONE,this.disableZoom=!1,this.disablePan=!1,this.disableTap=!1,this.interpolationDecay=I0,this.a11y=null,this[e]=this.shadowRoot.querySelector(".interaction-prompt"),this[t]=this.shadowRoot.querySelector("#prompt"),this[n]=[this.shadowRoot.querySelector("#finger0"),this.shadowRoot.querySelector("#finger1")],this[i]=this.shadowRoot.querySelector(".pan-target"),this[s]=0,this[a]=1/0,this[o]=!1,this[c]=!1,this[l]=Rt.AUTOMATIC,this[u]=new Hw(this[ee].camera,this[zn],this[ee]),this[h]=new Ec,this[d]=!1,this[f]=!1,this[p]=!1,this[g]={},this[m]=()=>{const S=this[at].changeSource;this[ec]=S,S===Rt.USER_INTERACTION&&(this[Zo]=!0,this[Jo]())},this[A]=()=>{this[fA](),this[Wt]();const S=this[at].changeSource;this.dispatchEvent(new CustomEvent("camera-change",{detail:{source:S}}))},this[E]=S=>{this[wc].classList.toggle("pointer-tumbling",S.type==="pointer-change-start")}}get inputSensitivity(){return this[at].inputSensitivity}set inputSensitivity(S){this[at].inputSensitivity=S}getCameraOrbit(){const{theta:S,phi:I,radius:M}=this[xh];return{theta:S,phi:I,radius:M,toString(){return`${this.theta}rad ${this.phi}rad ${this.radius}m`}}}getCameraTarget(){return Xi(this[ct].isPresenting?this[ct].arRenderer.target:this[ee].getDynamicTarget())}getFieldOfView(){return this[at].getFieldOfView()}getMinimumFieldOfView(){return this[at].options.minimumFieldOfView}getMaximumFieldOfView(){return this[at].options.maximumFieldOfView}getIdealAspect(){return this[ee].idealAspect}jumpCameraToGoal(){this[ga]=!0,this.requestUpdate(ga,!1)}resetInteractionPrompt(){this[ma]=0,this[lr]=1/0,this[Zo]=!1,this[fs]=this.interactionPrompt===Yo.AUTO&&this.cameraControls}zoom(S){const I=new WheelEvent("wheel",{deltaY:-30*S});this[zn].dispatchEvent(I)}connectedCallback(){super.connectedCallback(),this[at].addEventListener("user-interaction",this[cr]),this[at].addEventListener("pointer-change-start",this[Aa]),this[at].addEventListener("pointer-change-end",this[Aa])}disconnectedCallback(){super.disconnectedCallback(),this[at].removeEventListener("user-interaction",this[cr]),this[at].removeEventListener("pointer-change-start",this[Aa]),this[at].removeEventListener("pointer-change-end",this[Aa])}updated(S){super.updated(S);const I=this[at],M=this[ee];if(S.has("cameraControls")&&(this.cameraControls?(I.enableInteraction(),this.interactionPrompt===Yo.AUTO&&(this[fs]=!0)):(I.disableInteraction(),this[Jo]()),this[zn].setAttribute("aria-label",this[wr])),S.has("disableZoom")&&(I.disableZoom=this.disableZoom),S.has("disablePan")&&(I.enablePan=!this.disablePan),S.has("disableTap")&&(I.enableTap=!this.disableTap),(S.has("interactionPrompt")||S.has("cameraControls")||S.has("src"))&&(this.interactionPrompt===Yo.AUTO&&this.cameraControls&&!this[Zo]?this[fs]=!0:this[Jo]()),S.has("interactionPromptStyle")&&(this[Ko].style.opacity=this.interactionPromptStyle==bh.BASIC?"1":"0"),S.has("touchAction")){const w=this.touchAction;I.applyOptions({touchAction:w}),I.updateTouchActionStyle()}S.has("orbitSensitivity")&&(I.orbitSensitivity=this.orbitSensitivity),S.has("zoomSensitivity")&&(I.zoomSensitivity=this.zoomSensitivity),S.has("panSensitivity")&&(I.panSensitivity=this.panSensitivity),S.has("interpolationDecay")&&(I.setDamperDecayTime(this.interpolationDecay),M.setTargetDamperDecayTime(this.interpolationDecay)),S.has("a11y")&&this[pA](),this[ga]===!0&&Promise.resolve().then(()=>{I.jumpToGoal(),M.jumpToGoal(),this[vh](),this[ga]=!1})}async updateFraming(){const S=this[ee],I=S.adjustedFoV(S.framedFoVDeg);await S.updateFraming();const M=S.adjustedFoV(S.framedFoVDeg),w=this[at].getFieldOfView()/I;this[at].setFieldOfView(M*w),this[ba]=!0,this.requestUpdate("maxFieldOfView"),this.requestUpdate("fieldOfView"),this.requestUpdate("minCameraOrbit"),this.requestUpdate("maxCameraOrbit"),this.requestUpdate("cameraOrbit"),await this.updateComplete}interact(S,I,M){const w=this[zn],x=this[Eh];if(x[0].style.opacity==="1"){console.warn("interact() failed because an existing interaction is running.");return}const v=new Array;v.push({x:Ir(I.x),y:Ir(I.y)});const R=[{x:v[0].x(0),y:v[0].y(0)}];M!=null&&(v.push({x:Ir(M.x),y:Ir(M.y)}),R.push({x:v[1].x(0),y:v[1].y(0)}));let k=performance.now();const{width:F,height:P}=this[ee],G=this.getBoundingClientRect(),O=Y=>{for(const[ne,re]of R.entries()){const{style:de}=x[ne];de.transform=`translateX(${F*re.x}px) translateY(${P*re.y}px)`,Y==="pointerdown"?de.opacity="1":Y==="pointerup"&&(de.opacity="0");const Ce={pointerId:ne-5678,pointerType:"touch",target:w,clientX:F*re.x+G.x,clientY:P*re.y+G.y,altKey:!0};w.dispatchEvent(new PointerEvent(Y,Ce))}},W=()=>{const Y=this[ec];if(Y!==Rt.AUTOMATIC||!w.isConnected){for(const re of this[Eh])re.style.opacity="0";O("pointercancel"),this.dispatchEvent(new CustomEvent("interact-stopped",{detail:{source:Y}})),document.removeEventListener("visibilitychange",Q);return}const ne=Math.min(1,(performance.now()-k)/S);for(const[re,de]of R.entries())de.x=v[re].x(ne),de.y=v[re].y(ne);O("pointermove"),ne<1?requestAnimationFrame(W):(O("pointerup"),this.dispatchEvent(new CustomEvent("interact-stopped",{detail:{source:Rt.AUTOMATIC}})),document.removeEventListener("visibilitychange",Q))},Q=()=>{let Y=0;document.visibilityState==="hidden"?Y=performance.now()-k:k=performance.now()-Y};document.addEventListener("visibilitychange",Q),O("pointerdown"),this[ec]=Rt.AUTOMATIC,requestAnimationFrame(W)}[(e=_h,t=Ko,n=Eh,i=Cc,s=ma,a=lr,o=Zo,c=fs,l=ec,u=at,h=xh,d=ga,f=yh,p=ba,g=bi,gA)](S){const I=this[at],M=this[ee];M.framedFoVDeg=S[0]*180/Math.PI,I.changeSource=Rt.NONE,I.setFieldOfView(M.adjustedFoV(M.framedFoVDeg)),this[cr]()}[mA](S){const I=this[at];if(this[ba]){const{theta:M,phi:w}=this.getCameraOrbit();S[0]=M,S[1]=w,this[ba]=!1}I.changeSource=Rt.NONE,I.setOrbit(S[0],S[1],S[2]),this[cr]()}[_A](S){this[at].applyOptions({minimumAzimuthalAngle:S[0],minimumPolarAngle:S[1],minimumRadius:S[2]}),this.jumpCameraToGoal()}[EA](S){this[at].applyOptions({maximumAzimuthalAngle:S[0],maximumPolarAngle:S[1],maximumRadius:S[2]}),this[AA](S[2]),this.jumpCameraToGoal()}[vA](S){this[at].applyOptions({minimumFieldOfView:S[0]*180/Math.PI}),this.jumpCameraToGoal()}[xA](S){const I=this[ee].adjustedFoV(S[0]*180/Math.PI);this[at].applyOptions({maximumFieldOfView:I}),this.jumpCameraToGoal()}[bA](S){const[I,M,w]=S;this[ct].arRenderer.isPresenting||this[ee].setTarget(I,M,w),this[at].changeSource=Rt.NONE,this[ct].arRenderer.updateTarget(),this[cr]()}[ri](S,I){if(super[ri](S,I),this[ct].isPresenting||!this[Qs]())return;const M=this[at],w=this[ee],x=performance.now();if(this[fs]&&this.loaded&&x>this[Oa]+this.interactionPromptThreshold&&(this[fs]=!1,this[lr]=x,this[_h].classList.add("visible")),isFinite(this[lr])&&this.interactionPromptStyle===bh.WIGGLE){const k=(x-this[lr])/bw%1,F=_w(k),P=Ew(k);if(this[Ko].style.opacity=`${P}`,F!==this[ma]){const G=F*w.width*.05,O=(F-this[ma])*Math.PI/16;this[Ko].style.transform=`translateX(${G}px)`,M.changeSource=Rt.AUTOMATIC,M.adjustOrbit(O,0,0),this[ma]=F}}const v=M.update(S,I),R=w.updateTarget(I);(v||R)&&this[vh]()}[Jo](){this[fs]=!1,this[_h].classList.remove("visible"),this[lr]=1/0}[AA](S){const I=Math.max(this[ee].farRadius(),S),M=0,w=Math.abs(2*I);this[at].updateNearFar(M,w)}[fA](){const{theta:S,phi:I}=this[at].getCameraSpherical(this[xh]),M=(4+Math.floor((S%Nw+Uw)/Q0))%4,w=Math.floor(I/Pw),x=Iw[M],R=`${Mw[w]}${x}`,k=R;k in this[bi]?this[$c](this[bi][k]):this[$c](`View from stage ${R}`)}get[wr](){let S=Tw;return"interaction-prompt"in this[bi]&&(S=`. ${this[bi]["interaction-prompt"]}`),super[wr].replace(/\.$/,"")+(this.cameraControls?S:"")}async[jc](S){const I=this[at],M=this[ee],w=M.adjustedFoV(M.framedFoVDeg);super[jc](S);const x=M.adjustedFoV(M.framedFoVDeg)/w,v=I.getFieldOfView()*(isFinite(x)?x:1);I.updateAspect(this[ee].aspect),this.requestUpdate("maxFieldOfView",this.maxFieldOfView),await this.updateComplete,this[at].setFieldOfView(v),this.jumpCameraToGoal()}[ai](){super[ai](),this[yh]?this[ba]=!0:this[yh]=!0,this.requestUpdate("maxFieldOfView",this.maxFieldOfView),this.requestUpdate("fieldOfView",this.fieldOfView),this.requestUpdate("minCameraOrbit",this.minCameraOrbit),this.requestUpdate("maxCameraOrbit",this.maxCameraOrbit),this.requestUpdate("cameraOrbit",this.cameraOrbit),this.requestUpdate("cameraTarget",this.cameraTarget),this.jumpCameraToGoal()}[(m=cr,A=vh,E=Aa,pA)](){if(typeof this.a11y=="string")if(this.a11y.startsWith("{"))try{this[bi]=JSON.parse(this.a11y)}catch(S){console.warn("Error parsing a11y JSON:",S)}else this.a11y.length>0?console.warn("Error not supported format, should be a JSON string:",this.a11y):this[bi]={};else typeof this.a11y=="object"&&this.a11y!=null?this[bi]=Object.assign({},this.a11y):this[bi]={};this[zn].setAttribute("aria-label",this[wr])}}return Pt([De({type:Boolean,attribute:"camera-controls"})],_.prototype,"cameraControls",void 0),Pt([zi({intrinsics:k0,observeEffects:!0,updateHandler:mA}),De({type:String,attribute:"camera-orbit",hasChanged:()=>!0})],_.prototype,"cameraOrbit",void 0),Pt([zi({intrinsics:Fw,observeEffects:!0,updateHandler:bA}),De({type:String,attribute:"camera-target",hasChanged:()=>!0})],_.prototype,"cameraTarget",void 0),Pt([zi({intrinsics:dA,observeEffects:!0,updateHandler:gA}),De({type:String,attribute:"field-of-view",hasChanged:()=>!0})],_.prototype,"fieldOfView",void 0),Pt([zi({intrinsics:Dw,updateHandler:_A}),De({type:String,attribute:"min-camera-orbit",hasChanged:()=>!0})],_.prototype,"minCameraOrbit",void 0),Pt([zi({intrinsics:Lw,updateHandler:EA}),De({type:String,attribute:"max-camera-orbit",hasChanged:()=>!0})],_.prototype,"maxCameraOrbit",void 0),Pt([zi({intrinsics:Bw,updateHandler:vA}),De({type:String,attribute:"min-field-of-view",hasChanged:()=>!0})],_.prototype,"minFieldOfView",void 0),Pt([zi({intrinsics:dA,updateHandler:xA}),De({type:String,attribute:"max-field-of-view",hasChanged:()=>!0})],_.prototype,"maxFieldOfView",void 0),Pt([De({type:Number,attribute:"interaction-prompt-threshold"})],_.prototype,"interactionPromptThreshold",void 0),Pt([De({type:String,attribute:"interaction-prompt"})],_.prototype,"interactionPrompt",void 0),Pt([De({type:String,attribute:"interaction-prompt-style"})],_.prototype,"interactionPromptStyle",void 0),Pt([De({type:Number,attribute:"orbit-sensitivity"})],_.prototype,"orbitSensitivity",void 0),Pt([De({type:Number,attribute:"zoom-sensitivity"})],_.prototype,"zoomSensitivity",void 0),Pt([De({type:Number,attribute:"pan-sensitivity"})],_.prototype,"panSensitivity",void 0),Pt([De({type:String,attribute:"touch-action"})],_.prototype,"touchAction",void 0),Pt([De({type:Boolean,attribute:"disable-zoom"})],_.prototype,"disableZoom",void 0),Pt([De({type:Boolean,attribute:"disable-pan"})],_.prototype,"disablePan",void 0),Pt([De({type:Boolean,attribute:"disable-tap"})],_.prototype,"disableTap",void 0),Pt([De({type:Number,attribute:"interpolation-decay"})],_.prototype,"interpolationDecay",void 0),Pt([De()],_.prototype,"a11y",void 0),_};/* @license
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
 */const kw=.018,yA=2,Qw=300,Gw=new Oe,SA=new B,CA=Object.freeze({minimumRadius:0,maximumRadius:1/0,minimumPolarAngle:0,maximumPolarAngle:Math.PI,minimumAzimuthalAngle:-1/0,maximumAzimuthalAngle:1/0,minimumFieldOfView:10,maximumFieldOfView:45,touchAction:"none"}),tc=Math.PI/8,nc=.04,ic=10,Rt={USER_INTERACTION:"user-interaction",NONE:"none",AUTOMATIC:"automatic"};class Hw extends jn{constructor(e,t,n){super(),this.camera=e,this.element=t,this.scene=n,this.orbitSensitivity=1,this.zoomSensitivity=1,this.panSensitivity=1,this.inputSensitivity=1,this.changeSource=Rt.NONE,this._interactionEnabled=!1,this._disableZoom=!1,this.isUserPointing=!1,this.enablePan=!0,this.enableTap=!0,this.panProjection=new Qe,this.panPerPixel=0,this.spherical=new Ec,this.goalSpherical=new Ec,this.thetaDamper=new ln,this.phiDamper=new ln,this.radiusDamper=new ln,this.logFov=Math.log(CA.maximumFieldOfView),this.goalLogFov=this.logFov,this.fovDamper=new ln,this.touchMode=null,this.pointers=[],this.startTime=0,this.startPointerPosition={clientX:0,clientY:0},this.lastSeparation=0,this.touchDecided=!1,this.onContext=i=>{if(this.enablePan)i.preventDefault();else for(const s of this.pointers)this.onPointerUp(new PointerEvent("pointercancel",Object.assign(Object.assign({},this.startPointerPosition),{pointerId:s.id})))},this.touchModeZoom=(i,s)=>{if(!this._disableZoom){const a=this.twoTouchDistance(this.pointers[0],this.pointers[1]),o=nc*this.zoomSensitivity*(this.lastSeparation-a)*50/this.scene.height;this.lastSeparation=a,this.userAdjustOrbit(0,0,o)}this.panPerPixel>0&&this.movePan(i,s)},this.disableScroll=i=>{i.preventDefault()},this.touchModeRotate=(i,s)=>{const{touchAction:a}=this._options;if(!this.touchDecided&&a!=="none"){this.touchDecided=!0;const o=Math.abs(i),c=Math.abs(s);if(this.changeSource===Rt.USER_INTERACTION&&(a==="pan-y"&&c>o||a==="pan-x"&&o>c)){this.touchMode=null;return}else this.element.addEventListener("touchmove",this.disableScroll,{passive:!1})}this.handleSinglePointerMove(i,s)},this.onPointerDown=i=>{if(this.pointers.length>2)return;const{element:s}=this;this.pointers.length===0&&(s.addEventListener("pointermove",this.onPointerMove),s.addEventListener("pointerup",this.onPointerUp),this.touchMode=null,this.touchDecided=!1,this.startPointerPosition.clientX=i.clientX,this.startPointerPosition.clientY=i.clientY,this.startTime=performance.now());try{s.setPointerCapture(i.pointerId)}catch{}this.pointers.push({clientX:i.clientX,clientY:i.clientY,id:i.pointerId}),this.isUserPointing=!1,i.pointerType==="touch"?(this.changeSource=i.altKey?Rt.AUTOMATIC:Rt.USER_INTERACTION,this.onTouchChange(i)):(this.changeSource=Rt.USER_INTERACTION,this.onMouseDown(i)),this.changeSource===Rt.USER_INTERACTION&&this.dispatchEvent({type:"user-interaction"})},this.onPointerMove=i=>{const s=this.pointers.find(l=>l.id===i.pointerId);if(s==null)return;if(i.pointerType==="mouse"&&i.buttons===0){this.onPointerUp(i);return}const a=this.pointers.length,o=(i.clientX-s.clientX)/a,c=(i.clientY-s.clientY)/a;o===0&&c===0||(s.clientX=i.clientX,s.clientY=i.clientY,i.pointerType==="touch"?(this.changeSource=i.altKey?Rt.AUTOMATIC:Rt.USER_INTERACTION,this.touchMode!==null&&this.touchMode(o,c)):(this.changeSource=Rt.USER_INTERACTION,this.panPerPixel>0?this.movePan(o,c):this.handleSinglePointerMove(o,c)))},this.onPointerUp=i=>{const{element:s}=this,a=this.pointers.findIndex(o=>o.id===i.pointerId);a!==-1&&this.pointers.splice(a,1),this.panPerPixel>0&&!i.altKey&&this.resetRadius(),this.pointers.length===0?(s.removeEventListener("pointermove",this.onPointerMove),s.removeEventListener("pointerup",this.onPointerUp),s.removeEventListener("touchmove",this.disableScroll),this.enablePan&&this.enableTap&&this.recenter(i)):this.touchMode!==null&&this.onTouchChange(i),this.scene.element[Cc].style.opacity=0,s.style.cursor="grab",this.panPerPixel=0,this.isUserPointing&&this.dispatchEvent({type:"pointer-change-end"})},this.onWheel=i=>{this.changeSource=Rt.USER_INTERACTION;const s=i.deltaY*(i.deltaMode==1?18:1)*nc*this.zoomSensitivity/30;this.userAdjustOrbit(0,0,s),i.preventDefault(),this.dispatchEvent({type:"user-interaction"})},this.onKeyDown=i=>{const{changeSource:s}=this;this.changeSource=Rt.USER_INTERACTION,(i.shiftKey&&this.enablePan?this.panKeyCodeHandler(i):this.orbitZoomKeyCodeHandler(i))?(i.preventDefault(),this.dispatchEvent({type:"user-interaction"})):this.changeSource=s},this._options=Object.assign({},CA),this.setOrbit(0,Math.PI/2,1),this.setFieldOfView(100),this.jumpToGoal()}get interactionEnabled(){return this._interactionEnabled}enableInteraction(){if(this._interactionEnabled===!1){const{element:e}=this;e.addEventListener("pointerdown",this.onPointerDown),e.addEventListener("pointercancel",this.onPointerUp),this._disableZoom||e.addEventListener("wheel",this.onWheel),e.addEventListener("keydown",this.onKeyDown),e.addEventListener("touchmove",()=>{},{passive:!1}),e.addEventListener("contextmenu",this.onContext),this.element.style.cursor="grab",this._interactionEnabled=!0,this.updateTouchActionStyle()}}disableInteraction(){if(this._interactionEnabled===!0){const{element:e}=this;e.removeEventListener("pointerdown",this.onPointerDown),e.removeEventListener("pointermove",this.onPointerMove),e.removeEventListener("pointerup",this.onPointerUp),e.removeEventListener("pointercancel",this.onPointerUp),e.removeEventListener("wheel",this.onWheel),e.removeEventListener("keydown",this.onKeyDown),e.removeEventListener("contextmenu",this.onContext),e.style.cursor="",this.touchMode=null,this._interactionEnabled=!1,this.updateTouchActionStyle()}}get options(){return this._options}set disableZoom(e){this._disableZoom!=e&&(this._disableZoom=e,e===!0?this.element.removeEventListener("wheel",this.onWheel):this.element.addEventListener("wheel",this.onWheel),this.updateTouchActionStyle())}getCameraSpherical(e=new Ec){return e.copy(this.spherical)}getFieldOfView(){return this.camera.fov}applyOptions(e){Object.assign(this._options,e),this.setOrbit(),this.setFieldOfView(Math.exp(this.goalLogFov))}updateNearFar(e,t){this.camera.far=t===0?2:t,this.camera.near=Math.max(e,this.camera.far/1e3),this.camera.updateProjectionMatrix()}updateAspect(e){this.camera.aspect=e,this.camera.updateProjectionMatrix()}setOrbit(e=this.goalSpherical.theta,t=this.goalSpherical.phi,n=this.goalSpherical.radius){const{minimumAzimuthalAngle:i,maximumAzimuthalAngle:s,minimumPolarAngle:a,maximumPolarAngle:o,minimumRadius:c,maximumRadius:l}=this._options,{theta:u,phi:h,radius:d}=this.goalSpherical,f=ti(e,i,s);!isFinite(i)&&!isFinite(s)&&(this.spherical.theta=this.wrapAngle(this.spherical.theta-f)+f);const p=ti(t,a,o),g=ti(n,c,l);return f===u&&p===h&&g===d||!isFinite(f)||!isFinite(p)||!isFinite(g)?!1:(this.goalSpherical.theta=f,this.goalSpherical.phi=p,this.goalSpherical.radius=g,this.goalSpherical.makeSafe(),!0)}setRadius(e){this.goalSpherical.radius=e,this.setOrbit()}setFieldOfView(e){const{minimumFieldOfView:t,maximumFieldOfView:n}=this._options;e=ti(e,t,n),this.goalLogFov=Math.log(e)}setDamperDecayTime(e){this.thetaDamper.setDecayTime(e),this.phiDamper.setDecayTime(e),this.radiusDamper.setDecayTime(e),this.fovDamper.setDecayTime(e)}adjustOrbit(e,t,n){const{theta:i,phi:s,radius:a}=this.goalSpherical,{minimumRadius:o,maximumRadius:c,minimumFieldOfView:l,maximumFieldOfView:u}=this._options,h=this.spherical.theta-i,d=Math.PI-.001,f=i-ti(e,-d-h,d-h),p=s-t,g=n===0?0:((n>0?c:o)-a)/(Math.log(n>0?u:l)-this.goalLogFov),m=a+n*(isFinite(g)?g:(c-o)*2);if(this.setOrbit(f,p,m),n!==0){const A=this.goalLogFov+n;this.setFieldOfView(Math.exp(A))}}jumpToGoal(){this.update(0,C0)}update(e,t){if(this.isStationary())return!1;const{maximumPolarAngle:n,maximumRadius:i}=this._options,s=this.spherical.theta-this.goalSpherical.theta;return Math.abs(s)>Math.PI&&!isFinite(this._options.minimumAzimuthalAngle)&&!isFinite(this._options.maximumAzimuthalAngle)&&(this.spherical.theta-=Math.sign(s)*2*Math.PI),this.spherical.theta=this.thetaDamper.update(this.spherical.theta,this.goalSpherical.theta,t,Math.PI),this.spherical.phi=this.phiDamper.update(this.spherical.phi,this.goalSpherical.phi,t,n),this.spherical.radius=this.radiusDamper.update(this.spherical.radius,this.goalSpherical.radius,t,i),this.logFov=this.fovDamper.update(this.logFov,this.goalLogFov,t,1),this.moveCamera(),!0}updateTouchActionStyle(){const{style:e}=this.element;if(this._interactionEnabled){const{touchAction:t}=this._options;this._disableZoom&&t!=="none"?e.touchAction="manipulation":e.touchAction=t}else e.touchAction=""}isStationary(){return this.goalSpherical.theta===this.spherical.theta&&this.goalSpherical.phi===this.spherical.phi&&this.goalSpherical.radius===this.spherical.radius&&this.goalLogFov===this.logFov}moveCamera(){this.spherical.makeSafe(),this.camera.position.setFromSpherical(this.spherical),this.camera.setRotationFromEuler(new Pn(this.spherical.phi-Math.PI/2,this.spherical.theta,0,"YXZ")),this.camera.fov!==Math.exp(this.logFov)&&(this.camera.fov=Math.exp(this.logFov),this.camera.updateProjectionMatrix())}userAdjustOrbit(e,t,n){this.adjustOrbit(e*this.orbitSensitivity*this.inputSensitivity,t*this.orbitSensitivity*this.inputSensitivity,n*this.inputSensitivity)}wrapAngle(e){const t=(e+Math.PI)/(2*Math.PI);return(t-Math.floor(t))*2*Math.PI-Math.PI}pixelLengthToSphericalAngle(e){return 2*Math.PI*e/this.scene.height}twoTouchDistance(e,t){const{clientX:n,clientY:i}=e,{clientX:s,clientY:a}=t,o=s-n,c=a-i;return Math.sqrt(o*o+c*c)}handleSinglePointerMove(e,t){const n=this.pixelLengthToSphericalAngle(e),i=this.pixelLengthToSphericalAngle(t);this.isUserPointing===!1&&(this.isUserPointing=!0,this.dispatchEvent({type:"pointer-change-start"})),this.userAdjustOrbit(n,i,0)}initializePan(){const{theta:e,phi:t}=this.spherical,n=e-this.scene.yaw;this.panPerPixel=kw*this.panSensitivity/this.scene.height,this.panProjection.set(-Math.cos(n),-Math.cos(t)*Math.sin(n),0,0,Math.sin(t),0,Math.sin(n),-Math.cos(t)*Math.cos(n),0)}movePan(e,t){const{scene:n}=this,i=SA.set(e,t,0).multiplyScalar(this.inputSensitivity),s=this.spherical.radius*Math.exp(this.logFov)*this.panPerPixel;i.multiplyScalar(s);const a=n.getTarget();a.add(i.applyMatrix3(this.panProjection)),n.boundingSphere.clampPoint(a,a),n.setTarget(a.x,a.y,a.z)}recenter(e){if(performance.now()>this.startTime+Qw||Math.abs(e.clientX-this.startPointerPosition.clientX)>yA||Math.abs(e.clientY-this.startPointerPosition.clientY)>yA)return;const{scene:t}=this,n=t.positionAndNormalFromPoint(t.getNDC(e.clientX,e.clientY));if(n==null){const{cameraTarget:i}=t.element;t.element.cameraTarget="",t.element.cameraTarget=i,this.userAdjustOrbit(0,0,1)}else t.target.worldToLocal(n.position),t.setTarget(n.position.x,n.position.y,n.position.z)}resetRadius(){const{scene:e}=this,t=e.positionAndNormalFromPoint(Gw.set(0,0));if(t==null)return;e.target.worldToLocal(t.position);const n=e.getTarget(),{theta:i,phi:s}=this.spherical,a=i-e.yaw,o=SA.set(Math.sin(s)*Math.sin(a),Math.cos(s),Math.sin(s)*Math.cos(a)),c=o.dot(t.position.sub(n));n.add(o.multiplyScalar(c)),e.setTarget(n.x,n.y,n.z),this.setOrbit(void 0,void 0,this.goalSpherical.radius-c)}onTouchChange(e){if(this.pointers.length===1)this.touchMode=this.touchModeRotate;else{if(this._disableZoom){this.touchMode=null,this.element.removeEventListener("touchmove",this.disableScroll);return}this.touchMode=this.touchDecided&&this.touchMode===null?null:this.touchModeZoom,this.touchDecided=!0,this.element.addEventListener("touchmove",this.disableScroll,{passive:!1}),this.lastSeparation=this.twoTouchDistance(this.pointers[0],this.pointers[1]),this.enablePan&&this.touchMode!=null&&(this.initializePan(),e.altKey||(this.scene.element[Cc].style.opacity=1))}}onMouseDown(e){this.panPerPixel=0,this.enablePan&&(e.button===2||e.ctrlKey||e.metaKey||e.shiftKey)&&(this.initializePan(),this.scene.element[Cc].style.opacity=1),this.element.style.cursor="grabbing"}orbitZoomKeyCodeHandler(e){let t=!0;switch(e.key){case"PageUp":this.userAdjustOrbit(0,0,nc*this.zoomSensitivity);break;case"PageDown":this.userAdjustOrbit(0,0,-1*nc*this.zoomSensitivity);break;case"ArrowUp":this.userAdjustOrbit(0,-tc,0);break;case"ArrowDown":this.userAdjustOrbit(0,tc,0);break;case"ArrowLeft":this.userAdjustOrbit(-tc,0,0);break;case"ArrowRight":this.userAdjustOrbit(tc,0,0);break;default:t=!1;break}return t}panKeyCodeHandler(e){this.initializePan();let t=!0;switch(e.key){case"ArrowUp":this.movePan(0,-1*ic);break;case"ArrowDown":this.movePan(0,ic);break;case"ArrowLeft":this.movePan(-1*ic,0);break;case"ArrowRight":this.movePan(ic,0);break;default:t=!1;break}return t}}/* @license
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
 */const zw=30,IA=.8,MA=1.5,Vw=20,Ww=.2,qw=.25,Xw=10,hr=150,wA=5,$w=.1,qi={NOT_PRESENTING:"not-presenting",SESSION_STARTED:"session-started",OBJECT_PLACED:"object-placed",FAILED:"failed"},Yu={TRACKING:"tracking",NOT_TRACKING:"not-tracking"},_a=new B,ur=new dn,jw=new Pe,Yw=new B,Kw=new Xt(45,1,.1,100),TA=new An().setFromPoints([new B(0,0,0),new B(0,0,-1)]),Jw=new Di;class Zw extends jn{constructor(e){super(),this.renderer=e,this.currentSession=null,this.placeOnWall=!1,this.placementBox=null,this.lastTick=null,this.turntableRotation=null,this.oldShadowIntensity=null,this.frame=null,this.initialHitSource=null,this.transientHitTestSource=null,this.inputSource=null,this._presentedScene=null,this.resolveCleanup=null,this.exitWebXRButtonContainer=null,this.overlay=null,this.xrLight=null,this.xrMode=null,this.controller1=null,this.controller2=null,this.selectedController=null,this.tracking=!0,this.frames=0,this.initialized=!1,this.oldTarget=new B,this.placementComplete=!1,this.isTranslating=!1,this.isRotating=!1,this.isTwoFingering=!1,this.lastDragPosition=new B,this.relativeOrientation=new dn,this.scaleLine=new no(TA),this.firstRatio=0,this.lastAngle=0,this.goalPosition=new B,this.goalYaw=0,this.goalScale=1,this.xDamper=new ln,this.yDamper=new ln,this.zDamper=new ln,this.yawDamper=new ln,this.pitchDamper=new ln,this.rollDamper=new ln,this.scaleDamper=new ln,this.onExitWebXRButtonContainerClick=()=>this.stopPresenting(),this.onControllerSelectStart=t=>{const n=this.presentedScene,i=t.target;if(this.placementBox.controllerIntersection(n,i)!=null)this.selectedController!=null&&(this.selectedController.userData.line.visible=!1,n.canScale&&(this.isTwoFingering=!0,this.firstRatio=this.controllerSeparation()/n.pivot.scale.x,this.scaleLine.visible=!0)),i.attach(n.pivot),this.selectedController=i,n.setShadowIntensity(.01);else{const s=i===this.controller1?this.controller2:this.controller1;this.relativeOrientation.copy(i.quaternion).invert().multiply(n.pivot.getWorldQuaternion(ur)),s.userData.turning=!1,i.userData.turning=!0,i.userData.line.visible=!1}},this.onControllerSelectEnd=t=>{const n=t.target;if(n.userData.turning=!1,n.userData.line.visible=!0,this.isTwoFingering=!1,this.scaleLine.visible=!1,this.selectedController!=null&&this.selectedController!=n)return;const i=this.presentedScene;i.attach(i.pivot),this.selectedController=null,this.goalYaw=Math.atan2(i.pivot.matrix.elements[8],i.pivot.matrix.elements[10]),this.goalPosition.x=i.pivot.position.x,this.goalPosition.z=i.pivot.position.z},this.onUpdateScene=()=>{this.placementBox!=null&&this.isPresenting&&(this.placementBox.dispose(),this.placementBox=new Kp(this.presentedScene,this.placeOnWall?"back":"bottom"))},this.onSelectStart=t=>{const n=this.transientHitTestSource;if(n==null)return;const i=this.frame.getHitTestResultsForTransientInput(n),s=this.presentedScene,a=this.placementBox;if(i.length===1){this.inputSource=t.inputSource;const{axes:o}=this.inputSource.gamepad,c=a.getHit(this.presentedScene,o[0],o[1]);a.show=!0,c!=null?(this.isTranslating=!0,this.lastDragPosition.copy(c)):this.placeOnWall===!1&&(this.isRotating=!0,this.lastAngle=o[0]*MA)}else if(i.length===2){a.show=!0,this.isTwoFingering=!0;const{separation:o}=this.fingerPolar(i);this.firstRatio=o/s.pivot.scale.x}},this.onSelectEnd=()=>{this.isTranslating=!1,this.isRotating=!1,this.isTwoFingering=!1,this.inputSource=null,this.goalPosition.y+=this.placementBox.offsetHeight*this.presentedScene.scale.x,this.placementBox.show=!1},this.threeRenderer=e.threeRenderer,this.threeRenderer.xr.enabled=!0}async resolveARSession(){_p();const e=await navigator.xr.requestSession("immersive-ar",{requiredFeatures:[],optionalFeatures:["hit-test","dom-overlay","light-estimation"],domOverlay:this.overlay?{root:this.overlay}:void 0});return this.threeRenderer.xr.setReferenceSpaceType("local"),await this.threeRenderer.xr.setSession(e),this.threeRenderer.xr.cameraAutoUpdate=!1,e}get presentedScene(){return this._presentedScene}async supportsPresentation(){try{return _p(),await navigator.xr.isSessionSupported("immersive-ar")}catch(e){return console.warn("Request to present in WebXR denied:"),console.warn(e),console.warn("Falling back to next ar-mode"),!1}}async present(e,t=!1){this.isPresenting&&console.warn("Cannot present while a model is already presenting");let n=new Promise((l,u)=>{requestAnimationFrame(()=>l())});e.setHotspotsVisibility(!1),e.queueRender(),await n,this._presentedScene=e,this.overlay=e.element.shadowRoot.querySelector("div.default"),t===!0&&(this.xrLight=new iw(this.threeRenderer),this.xrLight.addEventListener("estimationstart",()=>{if(!this.isPresenting||this.xrLight==null)return;const l=this.presentedScene;l.add(this.xrLight),l.environment=this.xrLight.environment}));const i=await this.resolveARSession();i.addEventListener("end",()=>{this.postSessionCleanup()},{once:!0});const s=e.element.shadowRoot.querySelector(".slot.exit-webxr-ar-button");s.classList.add("enabled"),s.addEventListener("click",this.onExitWebXRButtonContainerClick),this.exitWebXRButtonContainer=s;const a=await i.requestReferenceSpace("viewer");this.xrMode=i.interactionMode,this.tracking=!0,this.frames=0,this.initialized=!1,this.turntableRotation=e.yaw,this.goalYaw=e.yaw,this.goalScale=1,e.setBackground(null),this.oldShadowIntensity=e.shadowIntensity,e.setShadowIntensity(.01),this.oldTarget.copy(e.getTarget()),e.element.addEventListener("load",this.onUpdateScene);const o=Vw*Math.PI/180,c=this.placeOnWall===!0?void 0:new XRRay(new DOMPoint(0,0,0),{x:0,y:-Math.sin(o),z:-Math.cos(o)});i.requestHitTestSource({space:a,offsetRay:c}).then(l=>{this.initialHitSource=l}),this.xrMode!=="screen-space"&&(this.setupControllers(),this.xDamper.setDecayTime(hr),this.yDamper.setDecayTime(hr),this.zDamper.setDecayTime(hr),this.yawDamper.setDecayTime(hr),this.pitchDamper.setDecayTime(hr),this.rollDamper.setDecayTime(hr)),this.currentSession=i,this.placementBox=new Kp(e,this.placeOnWall?"back":"bottom"),this.placementComplete=!1,this.lastTick=performance.now(),this.dispatchEvent({type:"status",status:qi.SESSION_STARTED})}setupControllers(){this.controller1=this.threeRenderer.xr.getController(0),this.controller1.addEventListener("selectstart",this.onControllerSelectStart),this.controller1.addEventListener("selectend",this.onControllerSelectEnd),this.controller2=this.threeRenderer.xr.getController(1),this.controller2.addEventListener("selectstart",this.onControllerSelectStart),this.controller2.addEventListener("selectend",this.onControllerSelectEnd);const e=this.presentedScene;if(e.add(this.controller1),e.add(this.controller2),!this.controller1.userData.line){const t=new no(TA);t.name="line",t.scale.z=wA,this.controller1.userData.turning=!1,this.controller1.userData.line=t,this.controller1.add(t),this.controller2.userData.turning=!1;const n=t.clone();this.controller2.userData.line=n,this.controller2.add(n),this.scaleLine.name="scale line",this.scaleLine.visible=!1,this.controller1.add(this.scaleLine);const{size:i}=e,s=$w/Math.max(i.x,i.y,i.z),a=new ut(Jw);a.name="box",a.scale.copy(i).multiplyScalar(s),a.visible=!1,this.controller1.userData.box=a,e.add(a);const o=a.clone();this.controller2.userData.box=o,e.add(o)}}hover(e){if(this.xrMode==="screen-space"||this.selectedController==e)return!1;const t=this.presentedScene,n=this.placementBox.controllerIntersection(t,e);return e.userData.box.visible=(n==null||e.userData.turning)&&!this.isTwoFingering,e.userData.line.scale.z=n==null?wA:n.distance,n!=null}controllerSeparation(){return this.controller1.position.distanceTo(this.controller2.position)}async stopPresenting(){if(!this.isPresenting)return;const e=new Promise(t=>{this.resolveCleanup=t});try{await this.currentSession.end(),await e}catch(t){console.warn("Error while trying to end WebXR AR session"),console.warn(t),this.postSessionCleanup()}}get isPresenting(){return this.presentedScene!=null}get target(){return this.oldTarget}updateTarget(){const e=this.presentedScene;if(e!=null){const t=e.getTarget();this.oldTarget.copy(t),this.placeOnWall?t.z=e.boundingBox.min.z:t.y=e.boundingBox.min.y,e.setTarget(t.x,t.y,t.z)}}postSessionCleanup(){const e=this.currentSession;e!=null&&(e.removeEventListener("selectstart",this.onSelectStart),e.removeEventListener("selectend",this.onSelectEnd),this.currentSession=null);const t=this.presentedScene;if(this._presentedScene=null,t!=null){const{element:a}=t;this.xrLight!=null&&(t.remove(this.xrLight),this.xrLight.dispose(),this.xrLight=null),t.add(t.pivot),t.pivot.quaternion.set(0,0,0,1),t.pivot.position.set(0,0,0),t.pivot.scale.set(1,1,1),t.setShadowOffset(0);const o=this.turntableRotation;o!=null&&(t.yaw=o);const c=this.oldShadowIntensity;c!=null&&t.setShadowIntensity(c),t.setEnvironmentAndSkybox(a[Da],a[La]);const l=this.oldTarget;t.setTarget(l.x,l.y,l.z),t.xrCamera=null,t.element.removeEventListener("load",this.onUpdateScene),t.orientHotspots(0);const{width:u,height:h}=a.getBoundingClientRect();t.setSize(u,h),requestAnimationFrame(()=>{t.element.dispatchEvent(new CustomEvent("camera-change",{detail:{source:Rt.NONE}}))})}this.renderer.height=0;const n=this.exitWebXRButtonContainer;n!=null&&(n.classList.remove("enabled"),n.removeEventListener("click",this.onExitWebXRButtonContainerClick),this.exitWebXRButtonContainer=null);const i=this.transientHitTestSource;i!=null&&(i.cancel(),this.transientHitTestSource=null);const s=this.initialHitSource;s!=null&&(s.cancel(),this.initialHitSource=null),this.placementBox!=null&&(this.placementBox.dispose(),this.placementBox=null),this.xrMode!=="screen-space"&&(this.controller1!=null&&(this.controller1.userData.turning=!1,this.controller1.userData.box.visible=!1,this.controller1.userData.line.visible=!0,this.controller1.removeEventListener("selectstart",this.onControllerSelectStart),this.controller1.removeEventListener("selectend",this.onControllerSelectEnd),this.controller1.removeFromParent(),this.controller1=null),this.controller2!=null&&(this.controller2.userData.turning=!1,this.controller2.userData.box.visible=!1,this.controller2.userData.line.visible=!0,this.controller2.removeEventListener("selectstart",this.onControllerSelectStart),this.controller2.removeEventListener("selectend",this.onControllerSelectEnd),this.controller2.removeFromParent(),this.controller2=null),this.selectedController=null,this.scaleLine.visible=!1),this.isTranslating=!1,this.isRotating=!1,this.isTwoFingering=!1,this.lastTick=null,this.turntableRotation=null,this.oldShadowIntensity=null,this.frame=null,this.inputSource=null,this.overlay=null,this.resolveCleanup!=null&&this.resolveCleanup(),this.dispatchEvent({type:"status",status:qi.NOT_PRESENTING})}updateView(e){const t=this.presentedScene,n=this.threeRenderer.xr;n.updateCamera(Kw),t.xrCamera=n.getCamera();const{elements:i}=t.getCamera().matrixWorld;if(t.orientHotspots(Math.atan2(i[1],i[5])),this.initialized||(this.placeInitially(),this.initialized=!0),e.requestViewportScale&&e.recommendedViewportScale){const a=e.recommendedViewportScale;e.requestViewportScale(Math.max(a,qw))}const s=n.getBaseLayer();if(s!=null){const a=s instanceof XRWebGLLayer?s.getViewport(e):n.getBinding().getViewSubImage(s,e).viewport;this.threeRenderer.setViewport(a.x,a.y,a.width,a.height)}}placeInitially(){const e=this.presentedScene,{pivot:t,element:n}=e,{position:i}=t,s=e.getCamera(),{width:a,height:o}=this.overlay.getBoundingClientRect();e.setSize(a,o),s.projectionMatrixInverse.copy(s.projectionMatrix).invert();const{theta:c}=n.getCameraOrbit(),l=s.getWorldDirection(_a);e.yaw=Math.atan2(-l.x,-l.z)-c,this.goalYaw=e.yaw;const u=Math.max(1,2*e.boundingSphere.radius);i.copy(s.position).add(l.multiplyScalar(u)),this.updateTarget();const h=e.getTarget();if(i.add(h).sub(this.oldTarget),this.goalPosition.copy(i),e.setHotspotsVisibility(!0),this.xrMode==="screen-space"){const{session:d}=this.frame;d.addEventListener("selectstart",this.onSelectStart),d.addEventListener("selectend",this.onSelectEnd),d.requestHitTestSourceForTransientInput({profile:"generic-touchscreen"}).then(f=>{this.transientHitTestSource=f})}}getTouchLocation(){const{axes:e}=this.inputSource.gamepad;let t=this.placementBox.getExpandedHit(this.presentedScene,e[0],e[1]);return t!=null&&(_a.copy(t).sub(this.presentedScene.getCamera().position),_a.length()>Xw)?null:t}getHitPoint(e){const t=this.threeRenderer.xr.getReferenceSpace(),n=e.getPose(t);if(n==null)return null;const i=jw.fromArray(n.transform.matrix);return this.placeOnWall===!0&&(this.goalYaw=Math.atan2(i.elements[4],i.elements[6])),i.elements[5]>.75!==this.placeOnWall?Yw.setFromMatrixPosition(i):null}moveToFloor(e){const t=this.initialHitSource;if(t==null)return;const n=e.getHitTestResults(t);if(n.length==0)return;const i=n[0],s=this.getHitPoint(i);s!=null&&(this.placementBox.show=!0,this.isTranslating||(this.placeOnWall?this.goalPosition.copy(s):this.goalPosition.y=s.y),t.cancel(),this.initialHitSource=null,this.dispatchEvent({type:"status",status:qi.OBJECT_PLACED}))}fingerPolar(e){const t=e[0].inputSource.gamepad.axes,n=e[1].inputSource.gamepad.axes,i=n[0]-t[0],s=n[1]-t[1],a=Math.atan2(s,i);let o=this.lastAngle-a;return o>Math.PI?o-=2*Math.PI:o<-Math.PI&&(o+=2*Math.PI),this.lastAngle=a,{separation:Math.sqrt(i*i+s*s),deltaYaw:o}}setScale(e){const t=e/this.firstRatio;this.goalScale=Math.abs(t-1)<Ww?1:t}processInput(e){const t=this.transientHitTestSource;if(t==null||!this.isTranslating&&!this.isTwoFingering&&!this.isRotating)return;const n=e.getHitTestResultsForTransientInput(t),i=this.presentedScene,s=i.pivot.scale.x;if(this.isTwoFingering){if(n.length<2)this.isTwoFingering=!1;else{const{separation:a,deltaYaw:o}=this.fingerPolar(n);this.placeOnWall===!1&&(this.goalYaw+=o),i.canScale&&this.setScale(a)}return}else if(n.length===2){this.isTranslating=!1,this.isRotating=!1,this.isTwoFingering=!0;const{separation:a}=this.fingerPolar(n);this.firstRatio=a/s;return}if(this.isRotating){const a=this.inputSource.gamepad.axes[0]*MA;this.goalYaw+=a-this.lastAngle,this.lastAngle=a}else this.isTranslating&&n.forEach(a=>{if(a.inputSource!==this.inputSource)return;let o=null;if(a.results.length>0&&(o=this.getHitPoint(a.results[0])),o==null&&(o=this.getTouchLocation()),o!=null){if(this.goalPosition.sub(this.lastDragPosition),this.placeOnWall===!1){const c=o.y-this.lastDragPosition.y;if(c<0){this.placementBox.offsetHeight=c/s,this.presentedScene.setShadowOffset(c);const l=_a.copy(i.getCamera().position),u=-c/(l.y-o.y);l.multiplyScalar(u),o.multiplyScalar(1-u).add(l)}}this.goalPosition.add(o),this.lastDragPosition.copy(o)}})}moveScene(e){const t=this.presentedScene,{pivot:n}=t,i=this.placementBox;if(i.updateOpacity(e),this.controller1&&(this.controller1.userData.turning&&(n.quaternion.copy(this.controller1.quaternion).multiply(this.relativeOrientation),this.selectedController&&this.selectedController===this.controller2&&n.quaternion.premultiply(ur.copy(this.controller2.quaternion).invert())),this.controller1.userData.box.position.copy(this.controller1.position),n.getWorldQuaternion(this.controller1.userData.box.quaternion)),this.controller2&&(this.controller2.userData.turning&&(n.quaternion.copy(this.controller2.quaternion).multiply(this.relativeOrientation),this.selectedController&&this.selectedController===this.controller1&&n.quaternion.premultiply(ur.copy(this.controller1.quaternion).invert())),this.controller2.userData.box.position.copy(this.controller2.position),n.getWorldQuaternion(this.controller2.userData.box.quaternion)),this.controller1&&this.controller2&&this.isTwoFingering){const d=this.controllerSeparation();this.setScale(d),this.scaleLine.scale.z=-d,this.scaleLine.lookAt(this.controller2.position)}const s=t.pivot.scale.x;if(this.goalScale!==s){const d=this.scaleDamper.update(s,this.goalScale,e,1);t.pivot.scale.set(d,d,d)}if(n.parent!==t)return;const{position:a}=n,o=t.boundingSphere.radius,c=this.goalPosition;let l=Rt.NONE;if(!c.equals(a)){l=Rt.USER_INTERACTION;let{x:d,y:f,z:p}=a;if(d=this.xDamper.update(d,c.x,e,o),f=this.yDamper.update(f,c.y,e,o),p=this.zDamper.update(p,c.z,e,o),a.set(d,f,p),this.xrMode==="screen-space"&&!this.isTranslating){const g=c.y-f;this.placementComplete&&this.placeOnWall===!1?(i.offsetHeight=g/t.pivot.scale.x,t.setShadowOffset(g)):g===0&&(this.placementComplete=!0,i.show=!1,t.setShadowIntensity(IA))}this.xrMode!=="screen-space"&&c.equals(a)&&t.setShadowIntensity(IA)}t.updateTarget(e),ur.setFromAxisAngle(_a.set(0,1,0),this.goalYaw);const u=t.pivot.quaternion.angleTo(ur),h=u-this.yawDamper.update(u,0,e,Math.PI);t.pivot.quaternion.rotateTowards(ur,h),t.element.dispatchEvent(new CustomEvent("camera-change",{detail:{source:l}}))}onWebXRFrame(e,t){if(this.xrMode!=="screen-space"){const o=this.hover(this.controller1),c=this.hover(this.controller2);this.placementBox.show=(o||c)&&!this.isTwoFingering}this.frame=t,++this.frames;const n=this.threeRenderer.xr.getReferenceSpace(),i=t.getViewerPose(n);i==null&&this.tracking===!0&&this.frames>zw&&(this.tracking=!1,this.dispatchEvent({type:"tracking",status:Yu.NOT_TRACKING}));const s=this.presentedScene;if(i==null||s==null||!s.element.loaded){this.threeRenderer.clear();return}this.tracking===!1&&(this.tracking=!0,this.dispatchEvent({type:"tracking",status:Yu.TRACKING}));let a=!0;for(const o of i.views){if(this.updateView(o),a){this.moveToFloor(t),this.processInput(t);const c=e-this.lastTick;this.moveScene(c),this.renderer.preRender(s,e,c),this.lastTick=e,s.renderShadow(this.threeRenderer)}this.threeRenderer.render(s,s.getCamera()),a=!1}}}function eT(r){const e=new Map,t=new Map,n=r.clone();return G0(r,n,function(i,s){e.set(s,i),t.set(i,s)}),n.traverse(function(i){if(!i.isSkinnedMesh)return;const s=i,a=e.get(i),o=a.skeleton.bones;s.skeleton=a.skeleton.clone(),s.bindMatrix.copy(a.bindMatrix),s.skeleton.bones=o.map(function(c){return t.get(c)}),s.bind(s.skeleton,s.bindMatrix)}),n}function G0(r,e,t){t(r,e);for(let n=0;n<r.children.length;n++)G0(r.children[n],e.children[n],t)}/* @license
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
 */const RA=Symbol("prepared"),Wc=Symbol("prepare"),Kn=Symbol("preparedGLTF"),qc=Symbol("clone");class tT{static prepare(e){if(e.scene==null)throw new Error("Model does not have a scene");if(e[RA])return e;const t=this[Wc](e);return t[RA]=!0,t}static[Wc](e){const{scene:t}=e,n=[t];return Object.assign(Object.assign({},e),{scene:t,scenes:n})}get parser(){return this[Kn].parser}get animations(){return this[Kn].animations}get scene(){return this[Kn].scene}get scenes(){return this[Kn].scenes}get cameras(){return this[Kn].cameras}get asset(){return this[Kn].asset}get userData(){return this[Kn].userData}constructor(e){this[Kn]=e}clone(){const e=this.constructor,t=this[qc]();return new e(t)}dispose(){this.scenes.forEach(e=>{e.traverse(t=>{const n=t;if(!n.material)return;(Array.isArray(n.material)?n.material:[n.material]).forEach(s=>{for(const a in s){const o=s[a];if(o instanceof St){const c=o.source.data;c.close!=null&&c.close(),o.dispose()}}s.dispose()}),n.geometry.dispose()})})}[qc](){const e=this[Kn],t=eT(this.scene);nT(t,this.scene);const n=[t],i=e.userData?Object.assign({},e.userData):{};return Object.assign(Object.assign({},e),{scene:t,scenes:n,userData:i})}}const nT=(r,e)=>{H0(r,e,(t,n)=>{n.userData.variantMaterials!==void 0&&(t.userData.variantMaterials=new Map(n.userData.variantMaterials)),n.userData.variantData!==void 0&&(t.userData.variantData=n.userData.variantData),n.userData.originalMaterial!==void 0&&(t.userData.originalMaterial=n.userData.originalMaterial)})},H0=(r,e,t)=>{t(r,e);for(let n=0;n<r.children.length;n++)H0(r.children[n],e.children[n],t)},BA=Symbol("threeGLTF"),DA=Symbol("gltf"),LA=Symbol("gltfElementMap"),FA=Symbol("threeObjectMap"),PA=Symbol("parallelTraverseThreeScene"),UA=Symbol("correlateOriginalThreeGLTF"),NA=Symbol("correlateCloneThreeGLTF");class oo{static from(e,t){return t!=null?this[NA](e,t):this[UA](e)}static[UA](e){const t=e.parser.json,n=e.parser.associations,i=new Map,s={name:"Default"},a={index:-1};for(const o of n.keys())o instanceof qn&&n.get(o)==null&&(a.index<0&&(t.materials==null&&(t.materials=[]),a.index=t.materials.length,t.materials.push(s)),o.name=s.name,n.set(o,{materials:a.index}));for(const[o,c]of n){c&&(o.userData=o.userData||{},o.userData.associations=c);for(const l in c)if(l!=null&&l!=="primitives"){const u=l,d=(t[u]||[])[c[u]];if(d==null)continue;let f=i.get(d);f==null&&(f=new Set,i.set(d,f)),f.add(o)}}return new oo(e,t,n,i)}static[NA](e,t){const n=t.threeGLTF,i=t.gltf,s=JSON.parse(JSON.stringify(i)),a=new Map,o=new Map;for(let c=0;c<n.scenes.length;c++)this[PA](n.scenes[c],e.scenes[c],(l,u)=>{const h=t.threeObjectMap.get(l);if(h!=null){for(const d in h)if(d!=null&&d!=="primitives"){const f=d,p=h[f],g=s[f][p],m=a.get(u)||{};m[f]=p,a.set(u,m);const A=o.get(g)||new Set;A.add(u),o.set(g,A)}}});return new oo(e,s,a,o)}static[PA](e,t,n){const i=(s,a)=>{if(n(s,a),s.isObject3D){const o=s,c=a;if(o.material)if(Array.isArray(o.material))for(let l=0;l<o.material.length;++l)n(o.material[l],c.material[l]);else n(o.material,c.material);for(let l=0;l<s.children.length;++l)i(s.children[l],a.children[l])}};i(e,t)}get threeGLTF(){return this[BA]}get gltf(){return this[DA]}get gltfElementMap(){return this[LA]}get threeObjectMap(){return this[FA]}constructor(e,t,n,i){this[BA]=e,this[DA]=t,this[LA]=i,this[FA]=n}}/* @license
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
 */const Ea=Symbol("correlatedSceneGraph");class iT extends tT{static[Wc](e){const t=super[Wc](e);t[Ea]==null&&(t[Ea]=oo.from(t));const{scene:n}=t,i=new Un(void 0,1/0);return n.traverse(s=>{s.renderOrder=1e3,s.frustumCulled=!1,s.name||(s.name=s.uuid);const a=s;if(a.material){const{geometry:o}=a;a.castShadow=!0,a.isSkinnedMesh&&(o.boundingSphere=i,o.boundingBox=null);const c=a.material;if(c.isMeshBasicMaterial===!0&&(c.toneMapped=!1),c.shadowSide=Xn,c.aoMap){const{gltf:l,threeObjectMap:u}=t[Ea],h=u.get(c);if(l.materials!=null&&h!=null&&h.materials!=null){const d=l.materials[h.materials];d.occlusionTexture&&d.occlusionTexture.texCoord===0&&o.attributes.uv!=null&&o.setAttribute("uv2",o.attributes.uv)}}}}),t}get correlatedSceneGraph(){return this[Kn][Ea]}[qc](){const e=super[qc](),t=new Map;return e.scene.traverse(n=>{const i=n;if(i.material){const a=i.material;if(a!=null){if(t.has(a.uuid)){i.material=t.get(a.uuid);return}i.material=a.clone(),t.set(a.uuid,i.material)}}const s=n;s.target!==void 0&&s.add(s.target)}),e[Ea]=oo.from(e,this.correlatedSceneGraph),e}}const z0=(r,e,t)=>{let n;switch(r){case Mt:n=new Uint8ClampedArray(e*t*4);break;case Ut:n=new Uint16Array(e*t*4);break;case es:n=new Uint32Array(e*t*4);break;case ud:n=new Int8Array(e*t*4);break;case dd:n=new Int16Array(e*t*4);break;case el:n=new Int32Array(e*t*4);break;case Lt:n=new Float32Array(e*t*4);break;default:throw new Error("Unsupported data type")}return n};let sc;const sT=(r,e,t,n)=>{if(sc!==void 0)return sc;const i=new Fn(1,1,n);e.setRenderTarget(i);const s=new ut(new Li,new Ln({color:16777215}));e.render(s,t),e.setRenderTarget(null);const a=z0(r,i.width,i.height);return e.readRenderTargetPixels(i,0,0,i.width,i.height,a),i.dispose(),s.geometry.dispose(),s.material.dispose(),sc=a[0]!==0,sc};class Ld{constructor(e){var t,n,i,s,a,o,c,l,u,h,d,f,p,g,m,A;this._rendererIsDisposable=!1,this._supportsReadPixels=!0,this.render=()=>{this._renderer.setRenderTarget(this._renderTarget);try{this._renderer.render(this._scene,this._camera)}catch(_){throw this._renderer.setRenderTarget(null),_}this._renderer.setRenderTarget(null)},this._width=e.width,this._height=e.height,this._type=e.type,this._colorSpace=e.colorSpace;const E={format:yt,depthBuffer:!1,stencilBuffer:!1,type:this._type,colorSpace:this._colorSpace,anisotropy:((t=e.renderTargetOptions)===null||t===void 0?void 0:t.anisotropy)!==void 0?(n=e.renderTargetOptions)===null||n===void 0?void 0:n.anisotropy:1,generateMipmaps:((i=e.renderTargetOptions)===null||i===void 0?void 0:i.generateMipmaps)!==void 0?(s=e.renderTargetOptions)===null||s===void 0?void 0:s.generateMipmaps:!1,magFilter:((a=e.renderTargetOptions)===null||a===void 0?void 0:a.magFilter)!==void 0?(o=e.renderTargetOptions)===null||o===void 0?void 0:o.magFilter:Ke,minFilter:((c=e.renderTargetOptions)===null||c===void 0?void 0:c.minFilter)!==void 0?(l=e.renderTargetOptions)===null||l===void 0?void 0:l.minFilter:Ke,samples:((u=e.renderTargetOptions)===null||u===void 0?void 0:u.samples)!==void 0?(h=e.renderTargetOptions)===null||h===void 0?void 0:h.samples:void 0,wrapS:((d=e.renderTargetOptions)===null||d===void 0?void 0:d.wrapS)!==void 0?(f=e.renderTargetOptions)===null||f===void 0?void 0:f.wrapS:Dt,wrapT:((p=e.renderTargetOptions)===null||p===void 0?void 0:p.wrapT)!==void 0?(g=e.renderTargetOptions)===null||g===void 0?void 0:g.wrapT:Dt};if(this._material=e.material,e.renderer?this._renderer=e.renderer:(this._renderer=Ld.instantiateRenderer(),this._rendererIsDisposable=!0),this._scene=new Ns,this._camera=new Zr,this._camera.position.set(0,0,10),this._camera.left=-.5,this._camera.right=.5,this._camera.top=.5,this._camera.bottom=-.5,this._camera.updateProjectionMatrix(),!sT(this._type,this._renderer,this._camera,E)){let _;switch(this._type){case Ut:_=this._renderer.extensions.has("EXT_color_buffer_float")?Lt:void 0;break}_!==void 0?(console.warn(`This browser does not support reading pixels from ${this._type} RenderTargets, switching to ${Lt}`),this._type=_):(this._supportsReadPixels=!1,console.warn("This browser dos not support toArray or toDataTexture, calls to those methods will result in an error thrown"))}this._quad=new ut(new Li,this._material),this._quad.geometry.computeBoundingBox(),this._scene.add(this._quad),this._renderTarget=new Fn(this.width,this.height,E),this._renderTarget.texture.mapping=((m=e.renderTargetOptions)===null||m===void 0?void 0:m.mapping)!==void 0?(A=e.renderTargetOptions)===null||A===void 0?void 0:A.mapping:kr}static instantiateRenderer(){const e=new Xg;return e.setSize(128,128),e}toArray(){if(!this._supportsReadPixels)throw new Error("Can't read pixels in this browser");const e=z0(this._type,this._width,this._height);return this._renderer.readRenderTargetPixels(this._renderTarget,0,0,this._width,this._height,e),e}toDataTexture(e){const t=new ho(this.toArray(),this.width,this.height,yt,this._type,e?.mapping||kr,e?.wrapS||Dt,e?.wrapT||Dt,e?.magFilter||Ke,e?.minFilter||Ke,e?.anisotropy||1,bt);return t.generateMipmaps=e?.generateMipmaps!==void 0?e?.generateMipmaps:!1,t}disposeOnDemandRenderer(){this._renderer.setRenderTarget(null),this._rendererIsDisposable&&(this._renderer.dispose(),this._renderer.forceContextLoss())}dispose(e){this.disposeOnDemandRenderer(),e&&this.renderTarget.dispose(),this.material instanceof Cn&&Object.values(this.material.uniforms).forEach(t=>{t.value instanceof St&&t.value.dispose()}),Object.values(this.material).forEach(t=>{t instanceof St&&t.dispose()}),this.material.dispose(),this._quad.geometry.dispose()}get width(){return this._width}set width(e){this._width=e,this._renderTarget.setSize(this._width,this._height)}get height(){return this._height}set height(e){this._height=e,this._renderTarget.setSize(this._width,this._height)}get renderer(){return this._renderer}get renderTarget(){return this._renderTarget}set renderTarget(e){this._renderTarget=e,this._width=e.width,this._height=e.height}get material(){return this._material}get type(){return this._type}get colorSpace(){return this._colorSpace}}const rT=`
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,aT=`
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
`;class oT extends Cn{constructor({gamma:e,offsetHdr:t,offsetSdr:n,gainMapMin:i,gainMapMax:s,maxDisplayBoost:a,hdrCapacityMin:o,hdrCapacityMax:c,sdr:l,gainMap:u}){super({name:"GainMapDecoderMaterial",vertexShader:rT,fragmentShader:aT,uniforms:{sdr:{value:l},gainMap:{value:u},gamma:{value:new B(1/e[0],1/e[1],1/e[2])},offsetHdr:{value:new B().fromArray(t)},offsetSdr:{value:new B().fromArray(n)},gainMapMin:{value:new B().fromArray(i)},gainMapMax:{value:new B().fromArray(s)},weightFactor:{value:(Math.log2(a)-o)/(c-o)}},blending:ii,depthTest:!1,depthWrite:!1}),this._maxDisplayBoost=a,this._hdrCapacityMin=o,this._hdrCapacityMax=c,this.needsUpdate=!0,this.uniformsNeedUpdate=!0}get sdr(){return this.uniforms.sdr.value}set sdr(e){this.uniforms.sdr.value=e}get gainMap(){return this.uniforms.gainMap.value}set gainMap(e){this.uniforms.gainMap.value=e}get offsetHdr(){return this.uniforms.offsetHdr.value.toArray()}set offsetHdr(e){this.uniforms.offsetHdr.value.fromArray(e)}get offsetSdr(){return this.uniforms.offsetSdr.value.toArray()}set offsetSdr(e){this.uniforms.offsetSdr.value.fromArray(e)}get gainMapMin(){return this.uniforms.gainMapMin.value.toArray()}set gainMapMin(e){this.uniforms.gainMapMin.value.fromArray(e)}get gainMapMax(){return this.uniforms.gainMapMax.value.toArray()}set gainMapMax(e){this.uniforms.gainMapMax.value.fromArray(e)}get gamma(){const e=this.uniforms.gamma.value;return[1/e.x,1/e.y,1/e.z]}set gamma(e){const t=this.uniforms.gamma.value;t.x=1/e[0],t.y=1/e[1],t.z=1/e[2]}get hdrCapacityMin(){return this._hdrCapacityMin}set hdrCapacityMin(e){this._hdrCapacityMin=e,this.calculateWeight()}get hdrCapacityMax(){return this._hdrCapacityMax}set hdrCapacityMax(e){this._hdrCapacityMax=e,this.calculateWeight()}get maxDisplayBoost(){return this._maxDisplayBoost}set maxDisplayBoost(e){this._maxDisplayBoost=Math.max(1,Math.min(65504,e)),this.calculateWeight()}calculateWeight(){const e=(Math.log2(this._maxDisplayBoost)-this._hdrCapacityMin)/(this._hdrCapacityMax-this._hdrCapacityMin);this.uniforms.weightFactor.value=Math.max(0,Math.min(1,e))}}class V0 extends Error{}class W0 extends Error{}const va=(r,e,t)=>{const n=new RegExp(`${e}="([^"]*)"`,"i").exec(r);if(n)return n[1];const i=new RegExp(`<${e}[^>]*>([\\s\\S]*?)</${e}>`,"i").exec(r);if(i){const s=i[1].match(/<rdf:li>([^<]*)<\/rdf:li>/g);return s&&s.length===3?s.map(a=>a.replace(/<\/?rdf:li>/g,"")):i[1].trim()}if(t!==void 0)return t;throw new Error(`Can't find ${e} in gainmap metadata`)},cT=r=>{let e;typeof TextDecoder<"u"?e=new TextDecoder().decode(r):e=r.toString();let t=e.indexOf("<x:xmpmeta");for(;t!==-1;){const n=e.indexOf("x:xmpmeta>",t),i=e.slice(t,n+10);try{const s=va(i,"hdrgm:GainMapMin","0"),a=va(i,"hdrgm:GainMapMax"),o=va(i,"hdrgm:Gamma","1"),c=va(i,"hdrgm:OffsetSDR","0.015625"),l=va(i,"hdrgm:OffsetHDR","0.015625"),u=/hdrgm:HDRCapacityMin="([^"]*)"/.exec(i),h=u?u[1]:"0",d=/hdrgm:HDRCapacityMax="([^"]*)"/.exec(i);if(!d)throw new Error("Incomplete gainmap metadata");const f=d[1];return{gainMapMin:Array.isArray(s)?s.map(p=>parseFloat(p)):[parseFloat(s),parseFloat(s),parseFloat(s)],gainMapMax:Array.isArray(a)?a.map(p=>parseFloat(p)):[parseFloat(a),parseFloat(a),parseFloat(a)],gamma:Array.isArray(o)?o.map(p=>parseFloat(p)):[parseFloat(o),parseFloat(o),parseFloat(o)],offsetSdr:Array.isArray(c)?c.map(p=>parseFloat(p)):[parseFloat(c),parseFloat(c),parseFloat(c)],offsetHdr:Array.isArray(l)?l.map(p=>parseFloat(p)):[parseFloat(l),parseFloat(l),parseFloat(l)],hdrCapacityMin:parseFloat(h),hdrCapacityMax:parseFloat(f)}}catch{}t=e.indexOf("<x:xmpmeta",n)}};class lT{constructor(e){this.options={debug:e&&e.debug!==void 0?e.debug:!1,extractFII:e&&e.extractFII!==void 0?e.extractFII:!0,extractNonFII:e&&e.extractNonFII!==void 0?e.extractNonFII:!0}}extract(e){return new Promise((t,n)=>{const i=this.options.debug,s=new DataView(e.buffer);if(s.getUint16(0)!==65496){n(new Error("Not a valid jpeg"));return}const a=s.byteLength;let o=2,c=0,l;for(;o<a;){if(++c>250){n(new Error(`Found no marker after ${c} loops 😵`));return}if(s.getUint8(o)!==255){n(new Error(`Not a valid marker at offset 0x${o.toString(16)}, found: 0x${s.getUint8(o).toString(16)}`));return}if(l=s.getUint8(o+1),i&&console.log(`Marker: ${l.toString(16)}`),l===226){i&&console.log("Found APP2 marker (0xffe2)");const u=o+4;if(s.getUint32(u)===1297106432){const h=u+4;let d;if(s.getUint16(h)===18761)d=!1;else if(s.getUint16(h)===19789)d=!0;else{n(new Error("No valid endianness marker found in TIFF header"));return}if(s.getUint16(h+2,!d)!==42){n(new Error("Not valid TIFF data! (no 0x002A marker)"));return}const f=s.getUint32(h+4,!d);if(f<8){n(new Error("Not valid TIFF data! (First offset less than 8)"));return}const p=h+f,g=s.getUint16(p,!d),m=p+2;let A=0;for(let S=m;S<m+12*g;S+=12)s.getUint16(S,!d)===45057&&(A=s.getUint32(S+8,!d));const _=p+2+g*12+4,b=[];for(let S=_;S<_+A*16;S+=16){const I={MPType:s.getUint32(S,!d),size:s.getUint32(S+4,!d),dataOffset:s.getUint32(S+8,!d),dependantImages:s.getUint32(S+12,!d),start:-1,end:-1,isFII:!1};I.dataOffset?(I.start=h+I.dataOffset,I.isFII=!1):(I.start=0,I.isFII=!0),I.end=I.start+I.size,b.push(I)}if(this.options.extractNonFII&&b.length){const S=new Blob([s]),I=[];for(const M of b){if(M.isFII&&!this.options.extractFII)continue;const w=S.slice(M.start,M.end+1,"image/jpeg");I.push(w)}t(I)}}}o+=2+s.getUint16(o+2)}})}}const hT=async r=>{const e=cT(r);if(!e)throw new W0("Gain map XMP metadata not found");const n=await new lT({extractFII:!0,extractNonFII:!0}).extract(r);if(n.length!==2)throw new V0("Gain map recovery image not found");return{sdr:new Uint8Array(await n[0].arrayBuffer()),gainMap:new Uint8Array(await n[1].arrayBuffer()),metadata:e}},OA=r=>new Promise((e,t)=>{const n=document.createElement("img");n.onload=()=>{e(n)},n.onerror=i=>{t(i)},n.src=URL.createObjectURL(r)});class uT extends ci{constructor(e,t){super(t),e&&(this._renderer=e),this._internalLoadingManager=new Og}setRenderer(e){return this._renderer=e,this}setRenderTargetOptions(e){return this._renderTargetOptions=e,this}prepareQuadRenderer(){this._renderer||console.warn("WARNING: An existing WebGL Renderer was not passed to this Loader constructor or in setRenderer, the result of this Loader will need to be converted to a Data Texture with toDataTexture() before you can use it in your renderer.");const e=new oT({gainMapMax:[1,1,1],gainMapMin:[0,0,0],gamma:[1,1,1],offsetHdr:[1,1,1],offsetSdr:[1,1,1],hdrCapacityMax:1,hdrCapacityMin:0,maxDisplayBoost:1,gainMap:new St,sdr:new St});return new Ld({width:16,height:16,type:Ut,colorSpace:bt,material:e,renderer:this._renderer,renderTargetOptions:this._renderTargetOptions})}async render(e,t,n,i){const s=i?new Blob([i],{type:"image/jpeg"}):void 0,a=new Blob([n],{type:"image/jpeg"});let o,c,l=!1;if(typeof createImageBitmap>"u"){const d=await Promise.all([s?OA(s):Promise.resolve(void 0),OA(a)]);c=d[0],o=d[1],l=!0}else{const d=await Promise.all([s?createImageBitmap(s,{imageOrientation:"flipY"}):Promise.resolve(void 0),createImageBitmap(a,{imageOrientation:"flipY"})]);c=d[0],o=d[1]}const u=new St(c||new ImageData(2,2),kr,Dt,Dt,Ke,Zd,yt,Mt,1,bt);u.flipY=l,u.needsUpdate=!0;const h=new St(o,kr,Dt,Dt,Ke,Zd,yt,Mt,1,gt);h.flipY=l,h.needsUpdate=!0,e.width=o.width,e.height=o.height,e.material.gainMap=u,e.material.sdr=h,e.material.gainMapMin=t.gainMapMin,e.material.gainMapMax=t.gainMapMax,e.material.offsetHdr=t.offsetHdr,e.material.offsetSdr=t.offsetSdr,e.material.gamma=t.gamma,e.material.hdrCapacityMin=t.hdrCapacityMin,e.material.hdrCapacityMax=t.hdrCapacityMax,e.material.maxDisplayBoost=Math.pow(2,t.hdrCapacityMax),e.material.needsUpdate=!0,e.render()}}class dT extends uT{load(e,t,n,i){const s=this.prepareQuadRenderer(),a=new Bi(this._internalLoadingManager);return a.setResponseType("arraybuffer"),a.setRequestHeader(this.requestHeader),a.setPath(this.path),a.setWithCredentials(this.withCredentials),this.manager.itemStart(e),a.load(e,async o=>{if(typeof o=="string")throw new Error("Invalid buffer, received [string], was expecting [ArrayBuffer]");const c=new Uint8Array(o);let l,u,h;try{const d=await hT(c);l=d.sdr,u=d.gainMap,h=d.metadata}catch(d){if(d instanceof W0||d instanceof V0)console.warn(`Failure to reconstruct an HDR image from ${e}: Gain map metadata not found in the file, HDRJPGLoader will render the SDR jpeg`),h={gainMapMin:[0,0,0],gainMapMax:[1,1,1],gamma:[1,1,1],hdrCapacityMin:0,hdrCapacityMax:1,offsetHdr:[0,0,0],offsetSdr:[0,0,0]},l=c;else throw d}try{await this.render(s,h,l,u)}catch(d){this.manager.itemError(e),typeof i=="function"&&i(d),s.disposeOnDemandRenderer();return}typeof t=="function"&&t(s),this.manager.itemEnd(e),s.disposeOnDemandRenderer()},n,o=>{this.manager.itemError(e),typeof i=="function"&&i(o)}),s}}class fT extends DE{constructor(e){super(e),this.type=Ut}parse(e){const a=function(w,x){switch(w){case 1:throw new Error("THREE.RGBELoader: Read Error: "+(x||""));case 2:throw new Error("THREE.RGBELoader: Write Error: "+(x||""));case 3:throw new Error("THREE.RGBELoader: Bad File Format: "+(x||""));default:case 4:throw new Error("THREE.RGBELoader: Memory Error: "+(x||""))}},h=function(w,x,v){x=x||1024;let k=w.pos,F=-1,P=0,G="",O=String.fromCharCode.apply(null,new Uint16Array(w.subarray(k,k+128)));for(;0>(F=O.indexOf(`
`))&&P<x&&k<w.byteLength;)G+=O,P+=O.length,k+=128,O+=String.fromCharCode.apply(null,new Uint16Array(w.subarray(k,k+128)));return-1<F?(w.pos+=P+F+1,G+O.slice(0,F)):!1},d=function(w){const x=/^#\?(\S+)/,v=/^\s*GAMMA\s*=\s*(\d+(\.\d+)?)\s*$/,R=/^\s*EXPOSURE\s*=\s*(\d+(\.\d+)?)\s*$/,k=/^\s*FORMAT=(\S+)\s*$/,F=/^\s*\-Y\s+(\d+)\s+\+X\s+(\d+)\s*$/,P={valid:0,string:"",comments:"",programtype:"RGBE",format:"",gamma:1,exposure:1,width:0,height:0};let G,O;for((w.pos>=w.byteLength||!(G=h(w)))&&a(1,"no header found"),(O=G.match(x))||a(3,"bad initial token"),P.valid|=1,P.programtype=O[1],P.string+=G+`
`;G=h(w),G!==!1;){if(P.string+=G+`
`,G.charAt(0)==="#"){P.comments+=G+`
`;continue}if((O=G.match(v))&&(P.gamma=parseFloat(O[1])),(O=G.match(R))&&(P.exposure=parseFloat(O[1])),(O=G.match(k))&&(P.valid|=2,P.format=O[1]),(O=G.match(F))&&(P.valid|=4,P.height=parseInt(O[1],10),P.width=parseInt(O[2],10)),P.valid&2&&P.valid&4)break}return P.valid&2||a(3,"missing format specifier"),P.valid&4||a(3,"missing image size specifier"),P},f=function(w,x,v){const R=x;if(R<8||R>32767||w[0]!==2||w[1]!==2||w[2]&128)return new Uint8Array(w);R!==(w[2]<<8|w[3])&&a(3,"wrong scanline width");const k=new Uint8Array(4*x*v);k.length||a(4,"unable to allocate buffer space");let F=0,P=0;const G=4*R,O=new Uint8Array(4),W=new Uint8Array(G);let Q=v;for(;Q>0&&P<w.byteLength;){P+4>w.byteLength&&a(1),O[0]=w[P++],O[1]=w[P++],O[2]=w[P++],O[3]=w[P++],(O[0]!=2||O[1]!=2||(O[2]<<8|O[3])!=R)&&a(3,"bad rgbe scanline format");let Y=0,ne;for(;Y<G&&P<w.byteLength;){ne=w[P++];const de=ne>128;if(de&&(ne-=128),(ne===0||Y+ne>G)&&a(3,"bad scanline data"),de){const Ce=w[P++];for(let q=0;q<ne;q++)W[Y++]=Ce}else W.set(w.subarray(P,P+ne),Y),Y+=ne,P+=ne}const re=R;for(let de=0;de<re;de++){let Ce=0;k[F]=W[de+Ce],Ce+=R,k[F+1]=W[de+Ce],Ce+=R,k[F+2]=W[de+Ce],Ce+=R,k[F+3]=W[de+Ce],F+=4}Q--}return k},p=function(w,x,v,R){const k=w[x+3],F=Math.pow(2,k-128)/255;v[R+0]=w[x+0]*F,v[R+1]=w[x+1]*F,v[R+2]=w[x+2]*F,v[R+3]=1},g=function(w,x,v,R){const k=w[x+3],F=Math.pow(2,k-128)/255;v[R+0]=Co.toHalfFloat(Math.min(w[x+0]*F,65504)),v[R+1]=Co.toHalfFloat(Math.min(w[x+1]*F,65504)),v[R+2]=Co.toHalfFloat(Math.min(w[x+2]*F,65504)),v[R+3]=Co.toHalfFloat(1)},m=new Uint8Array(e);m.pos=0;const A=d(m),E=A.width,_=A.height,b=f(m.subarray(m.pos),E,_);let S,I,M;switch(this.type){case Lt:M=b.length/4;const w=new Float32Array(M*4);for(let v=0;v<M;v++)p(b,v*4,w,v*4);S=w,I=Lt;break;case Ut:M=b.length/4;const x=new Uint16Array(M*4);for(let v=0;v<M;v++)g(b,v*4,x,v*4);S=x,I=Ut;break;default:throw new Error("THREE.RGBELoader: Unsupported type: "+this.type)}return{width:E,height:_,data:S,header:A.string,gamma:A.gamma,exposure:A.exposure,type:I}}setDataType(e){return this.type=e,this}load(e,t,n,i){function s(a,o){switch(a.type){case Lt:case Ut:a.colorSpace=bt,a.minFilter=Ke,a.magFilter=Ke,a.generateMipmaps=!1,a.flipY=!0;break}t&&t(a,o)}return super.load(e,s,n,i)}}/* @license
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
 */const pT={topLight:{intensity:500,position:[.418,16.199,.3]},room:{position:[-.757,13.219,.717],scale:[31.713,28.305,28.591]},boxes:[{position:[-10.906,2.009,1.846],rotation:-.195,scale:[2.328,7.905,4.651]},{position:[-5.607,-.754,-.758],rotation:.994,scale:[1.97,1.534,3.955]},{position:[6.167,.857,7.803],rotation:.561,scale:[3.927,6.285,3.687]},{position:[-2.017,.018,6.124],rotation:.333,scale:[2.002,4.566,2.064]},{position:[2.291,-.756,-2.621],rotation:-.286,scale:[1.546,1.552,1.496]},{position:[-2.193,-.369,-5.547],rotation:.516,scale:[3.875,3.487,2.986]}],lights:[{intensity:50,position:[-16.116,14.37,8.208],scale:[.1,2.428,2.739]},{intensity:50,position:[-16.109,18.021,-8.207],scale:[.1,2.425,2.751]},{intensity:17,position:[14.904,12.198,-1.832],scale:[.15,4.265,6.331]},{intensity:43,position:[-.462,8.89,14.52],scale:[4.38,5.441,.088]},{intensity:20,position:[3.235,11.486,-12.541],scale:[2.5,2,.1]},{intensity:100,position:[0,20,0],scale:[1,.1,1]}]},AT={topLight:{intensity:400,position:[.5,14,.5]},room:{position:[0,13.2,0],scale:[31.5,28.5,31.5]},boxes:[{position:[-10.906,-1,1.846],rotation:-.195,scale:[2.328,7.905,4.651]},{position:[-5.607,-.754,-.758],rotation:.994,scale:[1.97,1.534,3.955]},{position:[6.167,-.16,7.803],rotation:.561,scale:[3.927,6.285,3.687]},{position:[-2.017,.018,6.124],rotation:.333,scale:[2.002,4.566,2.064]},{position:[2.291,-.756,-2.621],rotation:-.286,scale:[1.546,1.552,1.496]},{position:[-2.193,-.369,-5.547],rotation:.516,scale:[3.875,3.487,2.986]}],lights:[{intensity:80,position:[-14,10,8],scale:[.1,2.5,2.5]},{intensity:80,position:[-14,14,-4],scale:[.1,2.5,2.5]},{intensity:23,position:[14,12,0],scale:[.1,5,5]},{intensity:16,position:[0,9,14],scale:[5,5,.1]},{intensity:80,position:[7,8,-14],scale:[2.5,2.5,.1]},{intensity:80,position:[-7,16,-14],scale:[2.5,2.5,.1]},{intensity:1,position:[0,20,0],scale:[.1,.1,.1]}]};class kA extends Ns{constructor(e){super(),this.position.y=-3.5;const t=new Di;t.deleteAttribute("uv");const n=new io({metalness:0,side:$t}),i=new io({metalness:0}),s=e=="legacy"?pT:AT,a=new Qg(16777215,s.topLight.intensity,28,2);a.position.set(...s.topLight.position),this.add(a);const o=new ut(t,n);o.position.set(...s.room.position),o.scale.set(...s.room.scale),this.add(o);for(const c of s.boxes){const l=new ut(t,i);l.position.set(...c.position),l.rotation.set(0,c.rotation,0),l.scale.set(...c.scale),this.add(l)}for(const c of s.lights){const l=new ut(t,this.createAreaLightMaterial(c.intensity));l.position.set(...c.position),l.scale.set(...c.scale),this.add(l)}}createAreaLightMaterial(e){const t=new Ln;return t.color.setScalar(e),t}}/* @license
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
 */const mT=.04,dr=20,gT=/\.hdr(\.js)?$/;class QA{constructor(e){this.threeRenderer=e,this.lottieLoaderUrl="",this._ldrLoader=null,this._imageLoader=null,this._hdrLoader=null,this._lottieLoader=null,this.generatedEnvironmentMap=null,this.generatedEnvironmentMapAlt=null,this.skyboxCache=new Map,this.blurMaterial=null,this.blurScene=null}ldrLoader(e){return this._ldrLoader==null&&(this._ldrLoader=new kg),this._ldrLoader.setWithCredentials(e),this._ldrLoader}imageLoader(e){return this._imageLoader==null&&(this._imageLoader=new dT(this.threeRenderer)),this._imageLoader.setWithCredentials(e),this._imageLoader}hdrLoader(e){return this._hdrLoader==null&&(this._hdrLoader=new fT,this._hdrLoader.setDataType(Ut)),this._hdrLoader.setWithCredentials(e),this._hdrLoader}async getLottieLoader(e){if(this._lottieLoader==null){const{LottieLoader:t}=await import(this.lottieLoaderUrl);this._lottieLoader=new t}return this._lottieLoader.setWithCredentials(e),this._lottieLoader}async loadImage(e,t){const n=await new Promise((i,s)=>this.ldrLoader(t).load(e,i,()=>{},s));return n.name=e,n.flipY=!1,n}async loadLottie(e,t,n){const i=await this.getLottieLoader(n);i.setQuality(t);const s=await new Promise((a,o)=>i.load(e,a,()=>{},o));return s.name=e,s}async loadEquirect(e,t=!1,n=()=>{}){try{const i=gT.test(e),s=i?this.hdrLoader(t):this.imageLoader(t),a=await new Promise((o,c)=>s.load(e,l=>{const{renderTarget:u}=l;if(u!=null){const{texture:h}=u;l.dispose(!1),o(h)}else o(l)},l=>{n(l.loaded/l.total*.9)},c));return n(1),a.name=e,a.mapping=Rc,i||(a.colorSpace=gt),a}finally{n&&n(1)}}async generateEnvironmentMapAndSkybox(e=null,t=null,n=()=>{},i=!1){const s=t!=="legacy";(t==="legacy"||t==="neutral")&&(t=null),t=i0(t);let a=Promise.resolve(null),o;e&&(a=this.loadEquirectFromUrl(e,i,n)),t?o=this.loadEquirectFromUrl(t,i,n):e?o=this.loadEquirectFromUrl(e,i,n):o=s?this.loadGeneratedEnvironmentMapAlt():this.loadGeneratedEnvironmentMap();const[c,l]=await Promise.all([o,a]);if(c==null)throw new Error("Failed to load environment map.");return{environmentMap:c,skybox:l}}async loadEquirectFromUrl(e,t,n){if(!this.skyboxCache.has(e)){const i=this.loadEquirect(e,t,n);this.skyboxCache.set(e,i)}return this.skyboxCache.get(e)}async GenerateEnvironmentMap(e,t){await nI();const n=this.threeRenderer,i=new vd(256,{generateMipmaps:!1,type:Ut,format:yt,colorSpace:bt,depthBuffer:!0}),s=new Gu(.1,100,i),a=s.renderTarget.texture;a.name=t;const o=n.outputColorSpace,c=n.toneMapping;return n.toneMapping=si,n.outputColorSpace=bt,s.update(n,e),this.blurCubemap(i,mT),n.toneMapping=c,n.outputColorSpace=o,a}async loadGeneratedEnvironmentMap(){return this.generatedEnvironmentMap==null&&(this.generatedEnvironmentMap=this.GenerateEnvironmentMap(new kA("legacy"),"legacy")),this.generatedEnvironmentMap}async loadGeneratedEnvironmentMapAlt(){return this.generatedEnvironmentMapAlt==null&&(this.generatedEnvironmentMapAlt=this.GenerateEnvironmentMap(new kA("neutral"),"neutral")),this.generatedEnvironmentMapAlt}blurCubemap(e,t){if(this.blurMaterial==null){this.blurMaterial=this.getBlurShader(dr);const i=new Di,s=new ut(i,this.blurMaterial);this.blurScene=new Ns,this.blurScene.add(s)}const n=e.clone();this.halfblur(e,n,t,"latitudinal"),this.halfblur(n,e,t,"longitudinal")}halfblur(e,t,n,i){const a=e.width,o=isFinite(n)?Math.PI/(2*a):2*Math.PI/(2*dr-1),c=n/o,l=isFinite(n)?1+Math.floor(3*c):dr;l>dr&&console.warn(`sigmaRadians, ${n}, is too large and will clip, as it requested ${l} samples when the maximum is set to ${dr}`);const u=[];let h=0;for(let p=0;p<dr;++p){const g=p/c,m=Math.exp(-g*g/2);u.push(m),p==0?h+=m:p<l&&(h+=2*m)}for(let p=0;p<u.length;p++)u[p]=u[p]/h;const d=this.blurMaterial.uniforms;d.envMap.value=e.texture,d.samples.value=l,d.weights.value=u,d.latitudinal.value=i==="latitudinal",d.dTheta.value=o,new Gu(.1,100,t).update(this.threeRenderer,this.blurScene)}getBlurShader(e){const t=new Float32Array(e),n=new B(0,1,0);return new Cn({name:"SphericalGaussianBlur",defines:{n:e},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:t},latitudinal:{value:!1},dTheta:{value:0},poleAxis:{value:n}},vertexShader:`
      
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
      `,blending:ii,depthTest:!1,depthWrite:!1,side:$t})}async dispose(){for(const[,e]of this.skyboxCache)(await e).dispose();this.generatedEnvironmentMap!=null&&((await this.generatedEnvironmentMap).dispose(),this.generatedEnvironmentMap=null),this.generatedEnvironmentMapAlt!=null&&((await this.generatedEnvironmentMapAlt).dispose(),this.generatedEnvironmentMapAlt=null),this.blurMaterial!=null&&this.blurMaterial.dispose()}}/* @license
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
 */const bT=.2,Sh=40,Ch=60,GA=5,fr=[1,.79,.62,.5,.4,.31,.25],_T=3,HA="high-performance",ET=1.3;class Vn extends jn{static get singleton(){return this._singleton||(this._singleton=new Vn({powerPreference:(self.ModelViewerElement||{}).powerPreference||HA,debug:vp()})),this._singleton}static resetSingleton(){const e=this._singleton.dispose();for(const t of e)t.disconnectedCallback();this._singleton=new Vn({powerPreference:(self.ModelViewerElement||{}).powerPreference||HA,debug:vp()});for(const t of e)t.connectedCallback()}get canRender(){return this.threeRenderer!=null}get scaleFactor(){return fr[this.scaleStep]}set minScale(e){let t=1;for(;t<fr.length&&!(fr[t]<e);)++t;this.lastStep=t-1}constructor(e){super(),this.loader=new cn(iT),this.width=0,this.height=0,this.dpr=1,this.scenes=new Set,this.multipleScenesVisible=!1,this.lastTick=performance.now(),this.renderedLastFrame=!1,this.scaleStep=0,this.lastStep=_T,this.avgFrameDuration=(Ch+Sh)/2,this.onWebGLContextLost=t=>{this.dispatchEvent({type:"contextlost",sourceEvent:t})},this.onWebGLContextRestored=()=>{var t;(t=this.textureUtils)===null||t===void 0||t.dispose(),this.textureUtils=new QA(this.threeRenderer);for(const n of this.scenes)n.element[zc]()},this.dpr=window.devicePixelRatio,this.canvas3D=document.createElement("canvas"),this.canvas3D.id="webgl-canvas",this.canvas3D.classList.add("show");try{this.threeRenderer=new Xg({canvas:this.canvas3D,alpha:!0,antialias:!0,powerPreference:e.powerPreference,preserveDrawingBuffer:!0}),this.threeRenderer.autoClear=!0,this.threeRenderer.setPixelRatio(1),this.threeRenderer.debug={checkShaderErrors:!!e.debug,onShaderError:null},this.threeRenderer.toneMapping=qa}catch(t){console.warn(t)}this.arRenderer=new Zw(this),this.textureUtils=this.canRender?new QA(this.threeRenderer):null,cn.initializeKTX2Loader(this.threeRenderer),this.canvas3D.addEventListener("webglcontextlost",this.onWebGLContextLost),this.canvas3D.addEventListener("webglcontextrestored",this.onWebGLContextRestored),this.updateRendererSize()}registerScene(e){this.scenes.add(e),e.forceRescale();const t=new Oe;this.threeRenderer.getSize(t),e.canvas.width=t.x,e.canvas.height=t.y,this.canRender&&this.scenes.size>0&&this.threeRenderer.setAnimationLoop((n,i)=>this.render(n,i))}unregisterScene(e){this.scenes.delete(e),this.canvas3D.parentElement===e.canvas.parentElement&&e.canvas.parentElement.removeChild(this.canvas3D),this.canRender&&this.scenes.size===0&&this.threeRenderer.setAnimationLoop(null)}displayCanvas(e){return e.element.modelIsVisible&&!this.multipleScenesVisible?this.canvas3D:e.element[nd]}countVisibleScenes(){const{canvas3D:e}=this;let t=0,n=null;for(const s of this.scenes){const{element:a}=s;a.modelIsVisible&&s.externalRenderer==null&&++t,e.parentElement===s.canvas.parentElement&&(n=s)}const i=t>1;if(n!=null){const s=i&&!this.multipleScenesVisible,a=!n.element.modelIsVisible;if(s||a){const{width:o,height:c}=this.sceneSize(n);this.copyPixels(n,o,c),e.parentElement.removeChild(e)}}this.multipleScenesVisible=i}updateRendererSize(){var e;const t=window.devicePixelRatio;if(t!==this.dpr)for(const s of this.scenes){const{element:a}=s;a[xr](a.getBoundingClientRect())}let n=0,i=0;for(const s of this.scenes)n=Math.max(n,s.width),i=Math.max(i,s.height);if(!(n===this.width&&i===this.height&&t===this.dpr)){this.width=n,this.height=i,this.dpr=t,n=Math.ceil(n*t),i=Math.ceil(i*t),this.canRender&&this.threeRenderer.setSize(n,i,!1);for(const s of this.scenes){const{canvas:a}=s;a.width=n,a.height=i,s.forceRescale(),(e=s.effectRenderer)===null||e===void 0||e.setSize(n,i)}}}updateRendererScale(e){const t=this.scaleStep;this.avgFrameDuration+=ti(bT*(e-this.avgFrameDuration),-GA,GA),this.avgFrameDuration>Ch?++this.scaleStep:this.avgFrameDuration<Sh&&this.scaleStep>0&&--this.scaleStep,this.scaleStep=Math.min(this.scaleStep,this.lastStep),t!==this.scaleStep&&(this.avgFrameDuration=(Ch+Sh)/2)}shouldRender(e){if(e.shouldRender())e.scaleStep!=this.scaleStep&&(e.scaleStep=this.scaleStep,this.rescaleCanvas(e));else if(e.scaleStep!=0)e.scaleStep=0,this.rescaleCanvas(e);else return!1;return!0}rescaleCanvas(e){const t=fr[e.scaleStep],n=Math.ceil(this.width/t),i=Math.ceil(this.height/t),{style:s}=e.canvas;s.width=`${n}px`,s.height=`${i}px`,this.canvas3D.style.width=`${n}px`,this.canvas3D.style.height=`${i}px`;const a=this.dpr*t,o=t<1?"GPU throttling":this.dpr!==window.devicePixelRatio?"No meta viewport tag":"";e.element.dispatchEvent(new CustomEvent("render-scale",{detail:{reportedDpr:window.devicePixelRatio,renderedDpr:a,minimumDpr:this.dpr*fr[this.lastStep],pixelWidth:Math.ceil(e.width*a),pixelHeight:Math.ceil(e.height*a),reason:o}}))}sceneSize(e){const{dpr:t}=this,n=fr[e.scaleStep],i=Math.min(Math.ceil(e.width*n*t),this.canvas3D.width),s=Math.min(Math.ceil(e.height*n*t),this.canvas3D.height);return{width:i,height:s}}copyPixels(e,t,n){const i=e.context;if(i==null){console.log("could not acquire 2d context");return}i.clearRect(0,0,t,n),i.drawImage(this.canvas3D,0,0,t,n,0,0,t,n),e.canvas.classList.add("show")}orderedScenes(){const e=[];for(const t of[!1,!0])for(const n of this.scenes)n.element.modelIsVisible===t&&e.push(n);return e}get isPresenting(){return this.arRenderer.isPresenting}preRender(e,t,n){const{element:i,exposure:s,toneMapping:a}=e;i[ri](t,n);const o=typeof s=="number"&&!Number.isNaN(s),c=i.environmentImage,l=i.skyboxImage,u=a===qa&&(c==="neutral"||c==="legacy"||!c&&!l);this.threeRenderer.toneMappingExposure=(o?s:1)*(u?ET:1)}render(e,t){if(t!=null){this.arRenderer.onWebXRFrame(e,t);return}const n=e-this.lastTick;if(this.lastTick=e,!this.canRender||this.isPresenting)return;this.countVisibleScenes(),this.updateRendererSize(),this.renderedLastFrame&&(this.updateRendererScale(n),this.renderedLastFrame=!1);const{canvas3D:i}=this;for(const s of this.orderedScenes()){const{element:a}=s;if(!a.loaded||!a.modelIsVisible&&s.renderCount>0||(this.preRender(s,e,n),!this.shouldRender(s)))continue;if(s.externalRenderer!=null){const l=s.getCamera();l.updateMatrix();const{matrix:u,projectionMatrix:h}=l,d=u.elements.slice(),f=s.getTarget();d[12]+=f.x,d[13]+=f.y,d[14]+=f.z,s.externalRenderer.render({viewMatrix:d,projectionMatrix:h.elements});continue}if(!a.modelIsVisible&&!this.multipleScenesVisible)for(const l of this.scenes)l.element.modelIsVisible&&l.queueRender();const{width:o,height:c}=this.sceneSize(s);s.renderShadow(this.threeRenderer),this.threeRenderer.setRenderTarget(null),this.threeRenderer.setViewport(0,Math.ceil(this.height*this.dpr)-c,o,c),s.effectRenderer!=null?s.effectRenderer.render(n):(this.threeRenderer.autoClear=!0,this.threeRenderer.toneMapping=s.toneMapping,this.threeRenderer.render(s,s.camera)),this.multipleScenesVisible||!s.element.modelIsVisible&&s.renderCount===0?this.copyPixels(s,o,c):i.parentElement!==s.canvas.parentElement&&(s.canvas.parentElement.appendChild(i),s.canvas.classList.remove("show")),s.hasRendered(),++s.renderCount,this.renderedLastFrame=!0}}dispose(){this.textureUtils!=null&&this.textureUtils.dispose(),this.threeRenderer!=null&&this.threeRenderer.dispose(),this.textureUtils=null,this.threeRenderer=null;const e=[];for(const t of this.scenes)e.push(t.element);return this.canvas3D.removeEventListener("webglcontextlost",this.onWebGLContextLost),this.canvas3D.removeEventListener("webglcontextrestored",this.onWebGLContextRestored),e}}/* @license
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
 */const Ve=Symbol("correlatedObjects"),st=Symbol("onUpdate");class fo{constructor(e,t){this[st]=e,this[Ve]=t}}/* @license
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
 */const zA=new Ln,vT=new Li(2,2);let xT=0;const on=Symbol("threeTexture"),VA=Symbol("threeTextures");class yT extends fo{get[on](){var e;return(e=this[Ve])===null||e===void 0?void 0:e.values().next().value}get[VA](){return this[Ve]}constructor(e,t){super(e,new Set(t?[t]:[])),this[on].image.src||(this[on].image.src=t.name?t.name:"adhoc_image"+xT++),this[on].image.name||(this[on].image.name=t&&t.image&&t.image.src?t.image.src.split("/").pop():"adhoc_image")}get name(){return this[on].image.name||""}get uri(){return this[on].image.src}get bufferView(){return this[on].image.bufferView}get element(){const e=this[on];if(e&&(e.isCanvasTexture||e.isVideoTexture))return e.image}get animation(){const e=this[on];if(e&&e.isCanvasTexture&&e.animation)return e.animation}get type(){return this.uri!=null?"external":"embedded"}set name(e){for(const t of this[VA])t.image.name=e}update(){const e=this[on];e&&e.isCanvasTexture&&!e.animation&&(this[on].needsUpdate=!0,this[st]())}async createThumbnail(e,t){const n=new Ns;zA.map=this[on];const i=new ut(vT,zA);n.add(i);const s=new Zr(-1,1,1,-1,0,1),{threeRenderer:a}=Vn.singleton,o=new Fn(e,t);a.setRenderTarget(o),a.render(n,s),a.setRenderTarget(null);const c=new Uint8Array(e*t*4);a.readRenderTargetPixels(o,0,0,e,t,c),Ki.width=e,Ki.height=t;const l=Ki.getContext("2d"),u=l.createImageData(e,t);return u.data.set(c),l.putImageData(u,0,0),new Promise(async(h,d)=>{Ki.toBlob(f=>{if(!f)return d("Failed to capture thumbnail.");h(URL.createObjectURL(f))},"image/png")})}}var zt;(function(r){r[r.Nearest=9728]="Nearest",r[r.Linear=9729]="Linear",r[r.NearestMipmapNearest=9984]="NearestMipmapNearest",r[r.LinearMipmapNearest=9985]="LinearMipmapNearest",r[r.NearestMipmapLinear=9986]="NearestMipmapLinear",r[r.LinearMipmapLinear=9987]="LinearMipmapLinear"})(zt||(zt={}));var Zi;(function(r){r[r.ClampToEdge=33071]="ClampToEdge",r[r.MirroredRepeat=33648]="MirroredRepeat",r[r.Repeat=10497]="Repeat"})(Zi||(Zi={}));/* @license
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
 */const WA=new Map([[Zi.Repeat,$n],[Zi.ClampToEdge,Dt],[Zi.MirroredRepeat,Us]]),Ku=new Map([[$n,Zi.Repeat],[Dt,Zi.ClampToEdge],[Us,Zi.MirroredRepeat]]),ST=new Map([[zt.Nearest,Nt],[zt.Linear,Ke],[zt.NearestMipmapNearest,co],[zt.LinearMipmapNearest,Ts],[zt.NearestMipmapLinear,$i],[zt.LinearMipmapLinear,un]]),q0=new Map([[Nt,zt.Nearest],[Ke,zt.Linear],[co,zt.NearestMipmapNearest],[Ts,zt.LinearMipmapNearest],[$i,zt.NearestMipmapLinear],[un,zt.LinearMipmapLinear]]),CT=new Map([[zt.Nearest,Nt],[zt.Linear,Ke]]),X0=new Map([[Nt,zt.Nearest],[Ke,zt.Linear]]),IT=r=>q0.has(r),MT=r=>X0.has(r),wT=r=>Ku.has(r),TT=(r,e)=>{switch(r){case"minFilter":return IT(e);case"magFilter":return MT(e);case"wrapS":case"wrapT":return wT(e);case"rotation":case"repeat":case"offset":return!0;default:throw new Error(`Cannot configure property "${r}" on Sampler`)}},_i=Symbol("threeTexture"),qA=Symbol("threeTextures"),Gi=Symbol("setProperty");class RT extends fo{get[_i](){var e;return(e=this[Ve])===null||e===void 0?void 0:e.values().next().value}get[qA](){return this[Ve]}constructor(e,t){super(e,new Set(t?[t]:[]))}get name(){return this[_i].name||""}get minFilter(){return q0.get(this[_i].minFilter)}get magFilter(){return X0.get(this[_i].magFilter)}get wrapS(){return Ku.get(this[_i].wrapS)}get wrapT(){return Ku.get(this[_i].wrapT)}get rotation(){return this[_i].rotation}get scale(){return id(this[_i].repeat)}get offset(){return id(this[_i].offset)}setMinFilter(e){this[Gi]("minFilter",ST.get(e))}setMagFilter(e){this[Gi]("magFilter",CT.get(e))}setWrapS(e){this[Gi]("wrapS",WA.get(e))}setWrapT(e){this[Gi]("wrapT",WA.get(e))}setRotation(e){e==null&&(e=0),this[Gi]("rotation",e)}setScale(e){e==null&&(e={u:1,v:1}),this[Gi]("repeat",new Oe(e.u,e.v))}setOffset(e){e==null&&(e={u:0,v:0}),this[Gi]("offset",new Oe(e.u,e.v))}[Gi](e,t){if(TT(e,t))for(const n of this[qA])n[e]=t,n.needsUpdate=!0;this[st]()}}/* @license
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
 */const XA=Symbol("image"),$A=Symbol("sampler"),jA=Symbol("threeTexture");class $0 extends fo{get[jA](){var e;return(e=this[Ve])===null||e===void 0?void 0:e.values().next().value}constructor(e,t){super(e,new Set(t?[t]:[])),this[$A]=new RT(e,t),this[XA]=new yT(e,t)}get name(){return this[jA].name||""}set name(e){for(const t of this[Ve])t.name=e}get sampler(){return this[$A]}get source(){return this[XA]}}/* @license
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
 */var j0,Y0,K0;const Es=Symbol("texture"),vs=Symbol("transform"),Ih=Symbol("materials"),YA=Symbol("usage"),pr=Symbol("onUpdate"),Ua=Symbol("activeVideo");var Fe;(function(r){r[r.Base=0]="Base",r[r.MetallicRoughness=1]="MetallicRoughness",r[r.Normal=2]="Normal",r[r.Occlusion=3]="Occlusion",r[r.Emissive=4]="Emissive",r[r.Clearcoat=5]="Clearcoat",r[r.ClearcoatRoughness=6]="ClearcoatRoughness",r[r.ClearcoatNormal=7]="ClearcoatNormal",r[r.SheenColor=8]="SheenColor",r[r.SheenRoughness=9]="SheenRoughness",r[r.Transmission=10]="Transmission",r[r.Thickness=11]="Thickness",r[r.Specular=12]="Specular",r[r.SpecularColor=13]="SpecularColor",r[r.Iridescence=14]="Iridescence",r[r.IridescenceThickness=15]="IridescenceThickness",r[r.Anisotropy=16]="Anisotropy"})(Fe||(Fe={}));class Mr{constructor(e,t,n,i){this[j0]=null,this[Y0]={rotation:0,scale:new Oe(1,1),offset:new Oe(0,0)},this[K0]=!1,n&&(this[vs].rotation=n.rotation,this[vs].scale.copy(n.repeat),this[vs].offset.copy(n.offset),this[Es]=new $0(e,n)),this[pr]=e,this[Ih]=i,this[YA]=t}get texture(){return this[Es]}setTexture(e){var t,n;const i=e!=null?e.source[on]:null,s=(t=this[Es])===null||t===void 0?void 0:t.source[on];if(s!=null&&s.isVideoTexture?this[Ua]=!1:!((n=this[Es])===null||n===void 0)&&n.source.animation&&this[Es].source.animation.removeEventListener("enterFrame",this[pr]),this[Es]=e,i!=null&&i.isVideoTexture){const o=i.image;if(this[Ua]=!0,o.requestVideoFrameCallback!=null){const c=()=>{this[Ua]&&(this[pr](),o.requestVideoFrameCallback(c))};o.requestVideoFrameCallback(c)}else{const c=()=>{this[Ua]&&(this[pr](),requestAnimationFrame(c))};requestAnimationFrame(c)}}else e?.source.animation!=null&&e.source.animation.addEventListener("enterFrame",this[pr]);let a=gt;if(this[Ih])for(const o of this[Ih]){switch(this[YA]){case Fe.Base:o.map=i;break;case Fe.MetallicRoughness:a=bt,o.metalnessMap=i,o.roughnessMap=i;break;case Fe.Normal:a=bt,o.normalMap=i;break;case Fe.Occlusion:a=bt,o.aoMap=i;break;case Fe.Emissive:o.emissiveMap=i;break;case Fe.Clearcoat:o.clearcoatMap=i;break;case Fe.ClearcoatRoughness:o.clearcoatRoughnessMap=i;break;case Fe.ClearcoatNormal:o.clearcoatNormalMap=i;break;case Fe.SheenColor:o.sheenColorMap=i;break;case Fe.SheenRoughness:o.sheenRoughnessMap=i;break;case Fe.Transmission:o.transmissionMap=i;break;case Fe.Thickness:o.thicknessMap=i;break;case Fe.Specular:o.specularIntensityMap=i;break;case Fe.SpecularColor:o.specularColorMap=i;break;case Fe.Iridescence:o.iridescenceMap=i;break;case Fe.IridescenceThickness:o.iridescenceThicknessMap=i;break;case Fe.Anisotropy:o.anisotropyMap=i;break}o.needsUpdate=!0}i&&(i.colorSpace=a,i.rotation=this[vs].rotation,i.repeat=this[vs].scale,i.offset=this[vs].offset),this[pr]()}}j0=Es,Y0=vs,K0=Ua;/* @license
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
 */const xa=Symbol("threeMaterial"),rc=Symbol("threeMaterials"),KA=Symbol("baseColorTexture"),JA=Symbol("metallicRoughnessTexture");class BT extends fo{get[rc](){return this[Ve]}get[xa](){var e;return(e=this[Ve])===null||e===void 0?void 0:e.values().next().value}constructor(e,t){super(e,t);const{map:n,metalnessMap:i}=t.values().next().value;this[KA]=new Mr(e,Fe.Base,n,t),this[JA]=new Mr(e,Fe.MetallicRoughness,i,t)}get baseColorFactor(){const e=[0,0,0,this[xa].opacity];return this[xa].color.toArray(e),e}get metallicFactor(){return this[xa].metalness}get roughnessFactor(){return this[xa].roughness}get baseColorTexture(){return this[KA]}get metallicRoughnessTexture(){return this[JA]}setBaseColorFactor(e){const t=new Me;e instanceof Array?t.fromArray(e):t.set(e);for(const n of this[rc])n.color.set(t),e instanceof Array&&e.length>3?n.opacity=e[3]:(e=[0,0,0,n.opacity],t.toArray(e));this[st]()}setMetallicFactor(e){for(const t of this[rc])t.metalness=e;this[st]()}setRoughnessFactor(e){for(const t of this[rc])t.roughness=e;this[st]()}}/* @license
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
 */var ZA,em;const tm=Symbol("pbrMetallicRoughness"),nm=Symbol("normalTexture"),im=Symbol("occlusionTexture"),sm=Symbol("emissiveTexture"),vt=Symbol("backingThreeMaterial"),rm=Symbol("applyAlphaCutoff"),Mh=Symbol("getAlphaMode"),Ar=Symbol("lazyLoadGLTFInfo"),wh=Symbol("initialize"),Ju=Symbol("getLoadedMaterial"),Ae=Symbol("ensureMaterialIsLoaded"),am=Symbol("gltfIndex"),Na=Symbol("setActive"),Ur=Symbol("variantIndices"),Th=Symbol("isActive"),om=Symbol("modelVariants"),Rh=Symbol("name"),pn=Symbol("pbrTextures");class Bh extends fo{get[(ZA=Ur,em=pn,vt)](){return this[Ve].values().next().value}constructor(e,t,n,i,s,a,o=void 0){super(e,s),this[ZA]=new Set,this[em]=new Map,this[am]=t,this[Th]=n,this[om]=i,this[Rh]=a,o==null?this[wh]():this[Ar]=o}[wh](){const e=this[st],t=this[Ve];this[tm]=new BT(e,t);const{normalMap:n,aoMap:i,emissiveMap:s}=t.values().next().value;this[nm]=new Mr(e,Fe.Normal,n,t),this[im]=new Mr(e,Fe.Occlusion,i,t),this[sm]=new Mr(e,Fe.Emissive,s,t);const a=o=>{this[pn].set(o,new Mr(e,o,null,t))};a(Fe.Clearcoat),a(Fe.ClearcoatRoughness),a(Fe.ClearcoatNormal),a(Fe.SheenColor),a(Fe.SheenRoughness),a(Fe.Transmission),a(Fe.Thickness),a(Fe.Specular),a(Fe.SpecularColor),a(Fe.Iridescence),a(Fe.IridescenceThickness),a(Fe.Anisotropy)}async[Ju](){if(this[Ar]!=null){const e=await this[Ar].doLazyLoad();return this[wh](),this[Ar]=void 0,this.ensureLoaded=async()=>{},e}return null}colorFromRgb(e){const t=new Me;return e instanceof Array?t.fromArray(e):t.set(e),t}[Ae](){if(this[Ar]!=null)throw new Error(`Material "${this.name}" has not been loaded, call 'await
    myMaterial.ensureLoaded()' before using an unloaded material.`)}async ensureLoaded(){await this[Ju]()}get isLoaded(){return this[Ar]==null}get isActive(){return this[Th]}[Na](e){this[Th]=e}get name(){return this[Rh]||""}set name(e){if(this[Rh]=e,this[Ve]!=null)for(const t of this[Ve])t.name=e}get pbrMetallicRoughness(){return this[Ae](),this[tm]}get normalTexture(){return this[Ae](),this[nm]}get occlusionTexture(){return this[Ae](),this[im]}get emissiveTexture(){return this[Ae](),this[sm]}get emissiveFactor(){return this[Ae](),this[vt].emissive.toArray()}get index(){return this[am]}hasVariant(e){const t=this[om].get(e);return t!=null&&this[Ur].has(t.index)}setEmissiveFactor(e){this[Ae]();const t=this.colorFromRgb(e);for(const n of this[Ve])n.emissive.set(t);this[st]()}[Mh](){return this[vt].transparent?"BLEND":this[vt].alphaTest>0?"MASK":"OPAQUE"}[rm](){this[Ae]();for(const e of this[Ve])this[Mh]()==="MASK"?e.alphaTest==null&&(e.alphaTest=.5):e.alphaTest=void 0,e.needsUpdate=!0}setAlphaCutoff(e){this[Ae]();for(const t of this[Ve])t.alphaTest=e,t.needsUpdate=!0;this[rm](),this[st]()}getAlphaCutoff(){return this[Ae](),this[vt].alphaTest}setDoubleSided(e){this[Ae]();for(const t of this[Ve])t.side=e?Vt:Xn,t.needsUpdate=!0;this[st]()}getDoubleSided(){return this[Ae](),this[vt].side==Vt}setAlphaMode(e){this[Ae]();const t=(n,i)=>{n.transparent=i,n.depthWrite=!i};for(const n of this[Ve])t(n,e==="BLEND"),e==="MASK"?n.alphaTest=.5:n.alphaTest=void 0,n.needsUpdate=!0;this[st]()}getAlphaMode(){return this[Ae](),this[Mh]()}get emissiveStrength(){return this[Ae](),this[vt].emissiveIntensity}setEmissiveStrength(e){this[Ae]();for(const t of this[Ve])t.emissiveIntensity=e;this[st]()}get clearcoatFactor(){return this[Ae](),this[vt].clearcoat}get clearcoatRoughnessFactor(){return this[Ae](),this[vt].clearcoatRoughness}get clearcoatTexture(){return this[Ae](),this[pn].get(Fe.Clearcoat)}get clearcoatRoughnessTexture(){return this[Ae](),this[pn].get(Fe.ClearcoatRoughness)}get clearcoatNormalTexture(){return this[Ae](),this[pn].get(Fe.ClearcoatNormal)}get clearcoatNormalScale(){return this[Ae](),this[vt].clearcoatNormalScale.x}setClearcoatFactor(e){this[Ae]();for(const t of this[Ve])t.clearcoat=e;this[st]()}setClearcoatRoughnessFactor(e){this[Ae]();for(const t of this[Ve])t.clearcoatRoughness=e;this[st]()}setClearcoatNormalScale(e){this[Ae]();for(const t of this[Ve])t.clearcoatNormalScale=new Oe(e,e);this[st]()}get ior(){return this[Ae](),this[vt].ior}setIor(e){this[Ae]();for(const t of this[Ve])t.ior=e;this[st]()}get sheenColorFactor(){return this[Ae](),this[vt].sheenColor.toArray()}get sheenColorTexture(){return this[Ae](),this[pn].get(Fe.SheenColor)}get sheenRoughnessFactor(){return this[Ae](),this[vt].sheenRoughness}get sheenRoughnessTexture(){return this[Ae](),this[pn].get(Fe.SheenRoughness)}setSheenColorFactor(e){this[Ae]();const t=this.colorFromRgb(e);for(const n of this[Ve])n.sheenColor.set(t),n.sheen=1;this[st]()}setSheenRoughnessFactor(e){this[Ae]();for(const t of this[Ve])t.sheenRoughness=e,t.sheen=1;this[st]()}get transmissionFactor(){return this[Ae](),this[vt].transmission}get transmissionTexture(){return this[Ae](),this[pn].get(Fe.Transmission)}setTransmissionFactor(e){this[Ae]();for(const t of this[Ve])t.transmission=e;this[st]()}get thicknessFactor(){return this[Ae](),this[vt].thickness}get thicknessTexture(){return this[Ae](),this[pn].get(Fe.Thickness)}get attenuationDistance(){return this[Ae](),this[vt].attenuationDistance}get attenuationColor(){return this[Ae](),this[vt].attenuationColor.toArray()}setThicknessFactor(e){this[Ae]();for(const t of this[Ve])t.thickness=e;this[st]()}setAttenuationDistance(e){this[Ae]();for(const t of this[Ve])t.attenuationDistance=e;this[st]()}setAttenuationColor(e){this[Ae]();const t=this.colorFromRgb(e);for(const n of this[Ve])n.attenuationColor.set(t);this[st]()}get specularFactor(){return this[Ae](),this[vt].specularIntensity}get specularTexture(){return this[Ae](),this[pn].get(Fe.Specular)}get specularColorFactor(){return this[Ae](),this[vt].specularColor.toArray()}get specularColorTexture(){return this[Ae](),this[pn].get(Fe.SheenColor)}setSpecularFactor(e){this[Ae]();for(const t of this[Ve])t.specularIntensity=e;this[st]()}setSpecularColorFactor(e){this[Ae]();const t=this.colorFromRgb(e);for(const n of this[Ve])n.specularColor.set(t);this[st]()}get iridescenceFactor(){return this[Ae](),this[vt].iridescence}get iridescenceTexture(){return this[Ae](),this[pn].get(Fe.Iridescence)}get iridescenceIor(){return this[Ae](),this[vt].iridescenceIOR}get iridescenceThicknessMinimum(){return this[Ae](),this[vt].iridescenceThicknessRange[0]}get iridescenceThicknessMaximum(){return this[Ae](),this[vt].iridescenceThicknessRange[1]}get iridescenceThicknessTexture(){return this[Ae](),this[pn].get(Fe.IridescenceThickness)}setIridescenceFactor(e){this[Ae]();for(const t of this[Ve])t.iridescence=e;this[st]()}setIridescenceIor(e){this[Ae]();for(const t of this[Ve])t.iridescenceIOR=e;this[st]()}setIridescenceThicknessMinimum(e){this[Ae]();for(const t of this[Ve])t.iridescenceThicknessRange[0]=e;this[st]()}setIridescenceThicknessMaximum(e){this[Ae]();for(const t of this[Ve])t.iridescenceThicknessRange[1]=e;this[st]()}get anisotropyStrength(){return this[Ae](),this[vt].anisotropy}get anisotropyRotation(){return this[Ae](),this[vt].anisotropyRotation}get anisotropyTexture(){return this[Ae](),this[pn].get(Fe.Anisotropy)}setAnisotropyStrength(e){this[Ae]();for(const t of this[Ve])t.anisotropy=e;this[st]()}setAnisotropyRotation(e){this[Ae]();for(const t of this[Ve])t.anisotropyRotation=e;this[st]()}}let J0=class{constructor(e){this.name="",this.children=new Array,this.name=e}};class Dh extends J0{constructor(e,t,n,i){super(e.name),this.materials=new Map,this.variantToMaterialMap=new Map,this.initialMaterialIdx=0,this.activeMaterialIdx=0,this.mesh=e;const{gltf:s,threeGLTF:a,threeObjectMap:o}=i;this.parser=a.parser,this.modelVariants=n,this.mesh.userData.variantData=n;const c=o.get(e.material);c.materials!=null?this.initialMaterialIdx=this.activeMaterialIdx=c.materials:console.error(`Primitive (${e.name}) missing initial material reference.`);const l=e.userData.associations||{};if(l.meshes==null){console.error("Mesh is missing primitive index association");return}const d=((s.meshes||[])[l.meshes].primitives||[])[l.primitives];if(d==null){console.error("Mesh primitive definition is missing.");return}if(d.material!=null)this.materials.set(d.material,t[d.material]);else{const f=t.findIndex(p=>p.name==="Default");f>=0?this.materials.set(f,t[f]):console.warn("gltfPrimitive has no material!")}if(d.extensions&&d.extensions.KHR_materials_variants){const f=d.extensions.KHR_materials_variants,g=a.parser.json.extensions.KHR_materials_variants.variants;for(const m of f.mappings){const A=t[m.material];this.materials.set(m.material,A);for(const E of m.variants){const{name:_}=g[E];this.variantToMaterialMap.set(E,A),A[Ur].add(E),n.has(_)||n.set(_,{name:_,index:E})}}}}async setActiveMaterial(e){const t=this.materials.get(e);if(e!==this.activeMaterialIdx){const n=t[Ve],i=await t[Ju]();i!=null?this.mesh.material=i:this.mesh.material=n.values().next().value,this.parser.assignFinalMaterial(this.mesh),n.add(this.mesh.material),this.activeMaterialIdx=e}return this.mesh.material}getActiveMaterial(){return this.materials.get(this.activeMaterialIdx)}getMaterial(e){return this.materials.get(e)}async enableVariant(e){if(e==null)return this.setActiveMaterial(this.initialMaterialIdx);if(this.variantToMaterialMap!=null&&this.modelVariants.has(e)){const t=this.modelVariants.get(e);return this.enableVariantHelper(t.index)}return null}async enableVariantHelper(e){if(this.variantToMaterialMap!=null&&e!=null){const t=this.variantToMaterialMap.get(e);if(t!=null)return this.setActiveMaterial(t.index)}return null}async instantiateVariants(){if(this.variantToMaterialMap!=null)for(const e of this.variantToMaterialMap.keys()){const t=this.mesh.userData.variantMaterials.get(e);if(t.material!=null)continue;const n=await this.enableVariantHelper(e);n!=null&&(t.material=n)}}get variantInfo(){return this.variantToMaterialMap}addVariant(e,t){if(!this.ensureVariantIsUnused(t))return!1;this.modelVariants.has(t)||this.modelVariants.set(t,{name:t,index:this.modelVariants.size});const i=this.modelVariants.get(t).index;return e[Ur].add(i),this.variantToMaterialMap.set(i,e),this.materials.set(e.index,e),this.updateVariantUserData(i,e),!0}deleteVariant(e){if(this.variantInfo.has(e)){this.variantInfo.delete(e);const t=this.mesh.userData.variantMaterials;t?.delete(e)}}updateVariantUserData(e,t){t[Ur].add(e),this.mesh.userData.variantData=this.modelVariants,this.mesh.userData.variantMaterials=this.mesh.userData.variantMaterials||new Map,this.mesh.userData.variantMaterials.set(e,{material:t[Ve].values().next().value,gltfMaterialIndex:t.index})}ensureVariantIsUnused(e){const t=this.modelVariants.get(e);return t!=null&&this.variantInfo.has(t.index)?(console.warn(`Primitive cannot add variant '${e}' for this material, it already exists.`),!1):!0}}/* @license
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
 */var cm,lm,hm,um,dm,fm;const ps=Symbol("materials"),ac=Symbol("hierarchy"),pm=Symbol("roots"),Ei=Symbol("primitives"),Z0=Symbol("prepareVariantsForExport"),eb=Symbol("switchVariant"),tb=Symbol("materialFromPoint"),Zu=Symbol("nodeFromPoint"),nb=Symbol("nodeFromIndex"),Kt=Symbol("variantData"),ed=Symbol("availableVariants"),Lh=Symbol("modelOnUpdate"),Am=Symbol("cloneMaterial");class DT{constructor(e,t,n,i){this.gltf=e,this.gltfElementMap=t,this.mapKey=n,this.doLazyLoad=i}}class LT{constructor(e,t=()=>{}){this[cm]=new Array,this[lm]=new Array,this[hm]=new Array,this[um]=new Array,this[dm]=()=>{},this[fm]=new Map,this[Lh]=t;const{gltf:n,threeGLTF:i,gltfElementMap:s}=e;for(const[c,l]of n.materials.entries()){const u=s.get(l);if(u!=null)this[ps].push(new Bh(t,c,!0,this[Kt],u,l.name));else{const d=(n.materials||[])[c],f=new Set;s.set(d,f);const p=async()=>{const g=await i.parser.getDependency("material",c);return f.add(g),g};this[ps].push(new Bh(t,c,!1,this[Kt],f,l.name,new DT(n,s,d,p)))}}const a=new Map,o=new Array;for(const c of i.scene.children)o.push(c);for(;o.length>0;){const c=o.pop();let l=null;c instanceof ut?(l=new Dh(c,this.materials,this[Kt],e),this[Ei].push(l)):l=new J0(c.name);const u=a.get(c);u!=null?u.children.push(l):this[pm].push(l),this[ac].push(l);for(const h of c.children)o.push(h),a.set(c,l)}}get materials(){return this[ps]}[(cm=ps,lm=ac,hm=pm,um=Ei,dm=Lh,fm=Kt,ed)](){const e=Array.from(this[Kt].values());return e.sort((t,n)=>t.index-n.index),e.map(t=>t.name)}getMaterialByName(e){const t=this[ps].filter(n=>n.name===e);return t.length>0?t[0]:null}[nb](e,t){const n=this[ac].find(i=>{if(i instanceof Dh){const{meshes:s,primitives:a}=i.mesh.userData.associations;if(s==e&&a==t)return!0}return!1});return n??null}[Zu](e){return this[ac].find(t=>t instanceof Dh&&t.mesh===e.object)}[tb](e){return this[Zu](e).getActiveMaterial()}async[eb](e){for(const t of this[Ei])await t.enableVariant(e);for(const t of this.materials)t[Na](!1);for(const t of this[Ei])this.materials[t.getActiveMaterial().index][Na](!0)}async[Z0](){const e=new Array;for(const t of this[Ei])e.push(t.instantiateVariants());await Promise.all(e)}[Am](e,t){const n=this.materials[e];n.isLoaded||console.error(`Cloning an unloaded material,
           call 'material.ensureLoaded() before cloning the material.`);const i=n[Ve],s=new Set;for(const[o,c]of i.entries()){const l=c.clone();l.name=t+(i.size>1?"_inst"+o:""),s.add(l)}const a=new Bh(this[Lh],this[ps].length,!1,this[Kt],s,t);return this[ps].push(a),a}createMaterialInstanceForVariant(e,t,n,i=!0){let s=null;for(const a of this[Ei]){const o=this[Kt].get(n);o!=null&&a.variantInfo.has(o.index)||a.getMaterial(e)!=null&&(this.hasVariant(n)||this.createVariant(n),s==null&&(s=this[Am](e,t)),a.addVariant(s,n))}if(i&&s!=null){s[Na](!0),this.materials[e][Na](!1);for(const a of this[Ei])a.enableVariant(n)}return s}createVariant(e){this[Kt].has(e)?console.warn(`Variant '${e}'' already exists`):this[Kt].set(e,{name:e,index:this[Kt].size})}hasVariant(e){return this[Kt].has(e)}setMaterialToVariant(e,t){if(this[ed]().find(n=>n===t)==null){console.warn(`Can't add material to '${t}', the variant does not exist.'`);return}if(e<0||e>=this.materials.length){console.error("setMaterialToVariant(): materialIndex is out of bounds.");return}for(const n of this[Ei]){const i=n.getMaterial(e);i!=null&&n.addVariant(i,t)}}updateVariantName(e,t){const n=this[Kt].get(e);n!=null&&(n.name=t,this[Kt].set(t,n),this[Kt].delete(e))}deleteVariant(e){const t=this[Kt].get(e);if(t!=null){for(const n of this.materials)n.hasVariant(e)&&n[Ur].delete(t.index);for(const n of this[Ei])n.deleteVariant(t.index);this[Kt].delete(e)}}}/* @license
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
 */var Fh=function(r,e,t,n){var i=arguments.length,s=i<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,t):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(r,e,t,n);else for(var o=r.length-1;o>=0;o--)(a=r[o])&&(s=(i<3?a(s):i>3?a(e,t,s):a(e,t))||s);return i>3&&s&&Object.defineProperty(e,t,s),s};const Ic=Symbol("currentGLTF"),Mc=Symbol("originalGltfJson"),xs=Symbol("model"),Ph=Symbol("getOnUpdateMethod"),ya=Symbol("buildTexture"),FT=r=>{var e,t,n;class i extends r{constructor(){super(...arguments),this[e]=void 0,this[t]=null,this[n]=null,this.variantName=null,this.orientation="0 0 0",this.scale="1 1 1"}get model(){return this[xs]}get availableVariants(){return this.model?this.model[ed]():[]}get originalGltfJson(){return this[Mc]}[(e=xs,t=Ic,n=Mc,Ph)](){return()=>{this[Wt]()}}[ya](a){return a.colorSpace=gt,a.wrapS=$n,a.wrapT=$n,new $0(this[Ph](),a)}async createTexture(a,o="image/png"){const{textureUtils:c}=this[ct],l=await c.loadImage(a,this.withCredentials);return l.userData.mimeType=o,this[ya](l)}async createLottieTexture(a,o=1){const{textureUtils:c}=this[ct],l=await c.loadLottie(a,o,this.withCredentials);return this[ya](l)}createVideoTexture(a){const o=document.createElement("video");o.crossOrigin=this.withCredentials?"use-credentials":"anonymous",o.src=a,o.muted=!0,o.playsInline=!0,o.loop=!0,o.play();const c=new gE(o);return this[ya](c)}createCanvasTexture(){const a=document.createElement("canvas"),o=new EE(a);return this[ya](o)}async updated(a){if(super.updated(a),a.has("variantName")){const o=this[ks].beginActivity("variant-update");o(.1);const c=this[xs],{variantName:l}=this;c!=null&&(await c[eb](l),this[Wt](),this.dispatchEvent(new CustomEvent("variant-applied"))),o(1)}if(a.has("orientation")||a.has("scale")){if(!this.loaded)return;const o=this[ee];o.applyTransform(),o.updateBoundingBox(),o.updateShadow(),this[ct].arRenderer.onUpdateScene(),this[Wt]()}}[ai](){super[ai]();const{currentGLTF:a}=this[ee];if(a!=null){const{correlatedSceneGraph:o}=a;o!=null&&a!==this[Ic]&&(this[xs]=new LT(o,this[Ph]()),this[Mc]=JSON.parse(JSON.stringify(o.gltf))),"variants"in a.userData&&this.requestUpdate("variantName")}this[Ic]=a}async exportScene(a){const o=this[ee];return new Promise(async(c,l)=>{const u={binary:!0,onlyVisible:!0,maxTextureSize:1/0,includeCustomExtensions:!1,forceIndices:!1};Object.assign(u,a),u.animations=o.animations,u.truncateDrawRange=!0;const h=o.shadow;let d=!1;h!=null&&(d=h.visible,h.visible=!1),await this[xs][Z0](),new Vc().register(p=>new tw(p)).parse(o.model,p=>c(new Blob([u.binary?p:JSON.stringify(p)],{type:u.binary?"application/octet-stream":"application/json"})),()=>l("glTF export failed"),u),h!=null&&(h.visible=d)})}materialFromPoint(a,o){const c=this[xs];if(c==null)return null;const l=this[ee],u=l.getNDC(a,o),h=l.hitFromPoint(u);return h==null||h.face==null?null:c[tb](h)}}return Fh([De({type:String,attribute:"variant-name"})],i.prototype,"variantName",void 0),Fh([De({type:String,attribute:"orientation"})],i.prototype,"orientation",void 0),Fh([De({type:String,attribute:"scale"})],i.prototype,"scale",void 0),i};/* @license
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
 */class PT extends ut{constructor(){super(void 0,new Ln({depthWrite:!1})),this.height=0,this.radius=0,this.resolution=0,this.userData.noHit=!0}get map(){return this.material.map}set map(e){this.material.map=e}isUsable(){return this.height>0&&this.radius>0&&this.geometry!=null&&this.map!=null}updateGeometry(e=this.height,t=this.radius,n=128){(e!=this.height||t!=this.radius||n!=this.resolution)&&(this.height=e,this.radius=t,this.resolution=n,e>0&&t>0&&(this.geometry.dispose(),this.geometry=UT(e,t,n)))}}function UT(r,e,t){const n=new Cd(e,2*t,t);n.scale(1,1,-1);const i=n.getAttribute("position"),s=new B;for(let a=0;a<i.count;++a)if(s.fromBufferAttribute(i,a),s.y<0){const o=-r*3/2,c=s.y<o?-r/s.y:1-s.y*s.y/(3*o*o);s.multiplyScalar(c),s.toArray(i.array,3*a)}return i.needsUpdate=!0,n}/* @license
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
 */const oc=new B,Uh=new B,Nh=new B,cc=new Qe,mm=new vn,gm=new dn;class ib extends TM{constructor(e){super(document.createElement("div")),this.normal=new B(0,1,0),this.initialized=!1,this.referenceCount=1,this.pivot=document.createElement("div"),this.slot=document.createElement("slot"),this.element.classList.add("annotation-wrapper"),this.slot.name=e.name,this.element.appendChild(this.pivot),this.pivot.appendChild(this.slot),this.updatePosition(e.position),this.updateNormal(e.normal),this.surface=e.surface}get facingCamera(){return!this.element.classList.contains("hide")}show(){(!this.facingCamera||!this.initialized)&&this.updateVisibility(!0)}hide(){(this.facingCamera||!this.initialized)&&this.updateVisibility(!1)}increment(){this.referenceCount++}decrement(){return this.referenceCount>0&&--this.referenceCount,this.referenceCount===0}updatePosition(e){if(e==null)return;const t=Ti(e)[0].terms;for(let n=0;n<3;++n)this.position.setComponent(n,ni(t[n]).number);this.updateMatrixWorld()}updateNormal(e){if(e==null)return;const t=Ti(e)[0].terms;for(let n=0;n<3;++n)this.normal.setComponent(n,t[n].number)}updateSurface(){const{mesh:e,tri:t,bary:n}=this;if(e==null||t==null||n==null)return;e.getVertexPosition(t.x,oc),e.getVertexPosition(t.y,Uh),e.getVertexPosition(t.z,Nh),oc.toArray(cc.elements,0),Uh.toArray(cc.elements,3),Nh.toArray(cc.elements,6),this.position.copy(n).applyMatrix3(cc);const i=this.parent;i.worldToLocal(e.localToWorld(this.position)),mm.set(oc,Uh,Nh),mm.getNormal(this.normal).transformDirection(e.matrixWorld);const s=i.parent;gm.setFromAxisAngle(oc.set(0,1,0),-s.rotation.y),this.normal.applyQuaternion(gm)}orient(e){this.pivot.style.transform=`rotate(${e}rad)`}updateVisibility(e){this.element.classList.toggle("hide",!e),this.slot.assignedNodes().forEach(t=>{if(t.nodeType!==Node.ELEMENT_NODE)return;const n=t,i=n.dataset.visibilityAttribute;if(i!=null){const s=`data-${i}`;n.toggleAttribute(s,e)}n.dispatchEvent(new CustomEvent("hotspot-visibility",{detail:{visible:e}}))}),this.initialized=!0}}const NT={name:"HorizontalBlurShader",uniforms:{tDiffuse:{value:null},h:{value:1/512}},vertexShader:`

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

		}`},OT={name:"VerticalBlurShader",uniforms:{tDiffuse:{value:null},v:{value:1/512}},vertexShader:`

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
 */const _m=9,kT=6,Oh=2,QT=.3;class GT extends ft{constructor(e,t,n){super(),this.camera=new Zr,this.renderTarget=null,this.renderTargetBlur=null,this.depthMaterial=new Fg,this.horizontalBlurMaterial=new Cn(NT),this.verticalBlurMaterial=new Cn(OT),this.intensity=0,this.softness=1,this.boundingBox=new hn,this.size=new B,this.maxDimension=0,this.isAnimated=!1,this.needsUpdate=!1;const{camera:i}=this;i.rotation.x=Math.PI/2,i.left=-.5,i.right=.5,i.bottom=-.5,i.top=.5,this.add(i);const s=new Li,a=new Ln({opacity:1,transparent:!0,side:$t});this.floor=new ut(s,a),this.floor.userData.noHit=!0,i.add(this.floor),this.blurPlane=new ut(s),this.blurPlane.visible=!1,i.add(this.blurPlane),e.target.add(this),this.depthMaterial.onBeforeCompile=function(o){o.fragmentShader=o.fragmentShader.replace("gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );","gl_FragColor = vec4( vec3( 0.0 ), ( 1.0 - fragCoordZ ) * opacity );")},this.depthMaterial.side=Vt,this.horizontalBlurMaterial.depthTest=!1,this.verticalBlurMaterial.depthTest=!1,this.setScene(e,t,n)}setScene(e,t,n){const{boundingBox:i,size:s,rotation:a,position:o}=this;if(this.isAnimated=e.animationNames.length>0,this.boundingBox.copy(e.boundingBox),this.size.copy(e.size),this.maxDimension=Math.max(s.x,s.y,s.z)*(this.isAnimated?Oh:1),this.boundingBox.getCenter(o),n==="back"){const{min:c,max:l}=i;[c.y,c.z]=[c.z,c.y],[l.y,l.z]=[l.z,l.y],[s.y,s.z]=[s.z,s.y],a.x=Math.PI/2,a.y=Math.PI}else a.x=0,a.y=0;if(this.isAnimated){const c=i.min.y,l=i.max.y;s.y=this.maxDimension,i.expandByVector(s.subScalar(this.maxDimension).multiplyScalar(-.5)),i.min.y=c,i.max.y=l,s.set(this.maxDimension,l-c,this.maxDimension)}n==="bottom"?o.y=i.min.y:o.z=i.min.y,this.setSoftness(t)}setSoftness(e){this.softness=e;const{size:t,camera:n}=this,i=this.isAnimated?Oh:1,s=i*Math.pow(2,_m-e*(_m-kT));this.setMapSize(s);const a=t.y/2,o=t.y*i;n.near=0,n.far=bm(o,a,e),this.depthMaterial.opacity=1/e,n.updateProjectionMatrix(),this.setIntensity(this.intensity),this.setOffset(0)}setMapSize(e){const{size:t}=this;this.isAnimated&&(e*=Oh);const n=Math.floor(t.x>t.z?e:e*t.x/t.z),i=Math.floor(t.x>t.z?e*t.z/t.x:e),s=10,a=s+n,o=s+i;if(this.renderTarget!=null&&(this.renderTarget.width!==a||this.renderTarget.height!==o)&&(this.renderTarget.dispose(),this.renderTarget=null,this.renderTargetBlur.dispose(),this.renderTargetBlur=null),this.renderTarget==null){const c={format:yt};this.renderTarget=new Fn(a,o,c),this.renderTargetBlur=new Fn(a,o,c),this.floor.material.map=this.renderTarget.texture}this.camera.scale.set(t.x*(1+s/n),t.z*(1+s/i),1),this.needsUpdate=!0}setIntensity(e){this.intensity=e,e>0?(this.visible=!0,this.floor.visible=!0,this.floor.material.opacity=e*bm(QT,1,this.softness*this.softness)):(this.visible=!1,this.floor.visible=!1)}getIntensity(){return this.intensity}setOffset(e){this.floor.position.z=-e+this.gap()}gap(){return .001*this.maxDimension}render(e,t){t.overrideMaterial=this.depthMaterial;const n=e.getClearAlpha();e.setClearAlpha(0),this.floor.visible=!1;const i=e.xr.enabled;e.xr.enabled=!1;const s=e.getRenderTarget();e.setRenderTarget(this.renderTarget),e.render(t,this.camera),t.overrideMaterial=null,this.floor.visible=!0,this.blurShadow(e),e.xr.enabled=i,e.setRenderTarget(s),e.setClearAlpha(n)}blurShadow(e){const{camera:t,horizontalBlurMaterial:n,verticalBlurMaterial:i,renderTarget:s,renderTargetBlur:a,blurPlane:o}=this;o.visible=!0,o.material=n,n.uniforms.h.value=1/this.renderTarget.width,n.uniforms.tDiffuse.value=this.renderTarget.texture,e.setRenderTarget(a),e.render(o,t),o.material=i,i.uniforms.v.value=1/this.renderTarget.height,i.uniforms.tDiffuse.value=this.renderTargetBlur.texture,e.setRenderTarget(s),e.render(o,t),o.visible=!1}dispose(){this.renderTarget!=null&&this.renderTarget.dispose(),this.renderTargetBlur!=null&&this.renderTargetBlur.dispose(),this.depthMaterial.dispose(),this.horizontalBlurMaterial.dispose(),this.verticalBlurMaterial.dispose(),this.floor.material.dispose(),this.floor.geometry.dispose(),this.blurPlane.geometry.dispose(),this.removeFromParent()}}/* @license
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
 */const Em=10,kh=100,Qh=new B,vm=new B,xm=new B,lc=new ev,HT=new B,Sa=new Oe;class zT extends Ns{constructor({canvas:e,element:t,width:n,height:i}){super(),this.annotationRenderer=new RM,this.effectRenderer=null,this.schemaElement=document.createElement("script"),this.width=1,this.height=1,this.aspect=1,this.scaleStep=0,this.renderCount=0,this.externalRenderer=null,this.appendedAnimations=[],this.markedAnimations=[],this.camera=new Xt(45,1,.1,100),this.xrCamera=null,this.url=null,this.pivot=new ft,this.target=new ft,this.animationNames=[],this.boundingBox=new hn,this.boundingSphere=new Un,this.size=new B,this.idealAspect=0,this.framedFoVDeg=0,this.shadow=null,this.shadowIntensity=0,this.shadowSoftness=1,this.bakedShadows=new Set,this.exposure=1,this.toneMapping=qa,this.canScale=!0,this.isDirty=!1,this.goalTarget=new B,this.targetDamperX=new ln,this.targetDamperY=new ln,this.targetDamperZ=new ln,this._currentGLTF=null,this._model=null,this.cancelPendingSourceChange=null,this.animationsByName=new Map,this.currentAnimationAction=null,this.groundedSkybox=new PT,this.name="ModelScene",this.element=t,this.canvas=e,this.camera=new Xt(45,1,.1,100),this.camera.name="MainCamera",this.add(this.pivot),this.pivot.name="Pivot",this.pivot.add(this.target),this.setSize(n,i),this.target.name="Target",this.mixer=new ZE(this.target);const{domElement:s}=this.annotationRenderer,{style:a}=s;a.display="none",a.pointerEvents="none",a.position="absolute",a.top="0",this.element.shadowRoot.querySelector(".default").appendChild(s),this.schemaElement.setAttribute("type","application/ld+json")}get context(){return this.canvas.getContext("2d")}getCamera(){return this.xrCamera!=null?this.xrCamera:this.camera}queueRender(){this.isDirty=!0}shouldRender(){return this.isDirty}hasRendered(){this.isDirty=!1}forceRescale(){this.scaleStep=-1,this.queueRender()}async setObject(e){this.reset(),this._model=e,this.target.add(e),await this.setupScene()}async setSource(e,t=()=>{}){if(!e||e===this.url){t(1);return}if(this.reset(),this.url=e,this.externalRenderer!=null){const o=await this.externalRenderer.load(t);this.boundingSphere.radius=o.framedRadius,this.idealAspect=o.fieldOfViewAspect;return}this.cancelPendingSourceChange!=null&&(this.cancelPendingSourceChange(),this.cancelPendingSourceChange=null);let n;try{n=await new Promise(async(o,c)=>{this.cancelPendingSourceChange=()=>c();try{const l=await this.element[ct].loader.load(e,this.element,t);o(l)}catch(l){c(l)}})}catch(o){if(o==null)return;throw o}this.cancelPendingSourceChange=null,this.reset(),this.url=e,this._currentGLTF=n,n!=null&&(this._model=n.scene,this.target.add(n.scene));const{animations:i}=n,s=new Map,a=[];for(const o of i)s.set(o.name,o),a.push(o.name);this.animations=i,this.animationsByName=s,this.animationNames=a,await this.setupScene()}async setupScene(){this.applyTransform(),this.updateBoundingBox(),await this.updateFraming(),this.updateShadow(),this.setShadowIntensity(this.shadowIntensity),this.setGroundedSkybox()}reset(){this.url=null,this.renderCount=0,this.queueRender(),this.shadow!=null&&this.shadow.setIntensity(0),this.bakedShadows.clear();const{_model:e}=this;e!=null&&(e.removeFromParent(),this._model=null);const t=this._currentGLTF;t!=null&&(t.dispose(),this._currentGLTF=null),this.currentAnimationAction!=null&&(this.currentAnimationAction.stop(),this.currentAnimationAction=null),this.mixer.stopAllAction(),this.mixer.uncacheRoot(this)}dispose(){this.reset(),this.shadow!=null&&(this.shadow.dispose(),this.shadow=null),this.element[Ic]=null,this.element[Mc]=null,this.element[xs]=null}get currentGLTF(){return this._currentGLTF}setSize(e,t){if(!(this.width===e&&this.height===t)){if(this.width=Math.max(e,1),this.height=Math.max(t,1),this.annotationRenderer.setSize(e,t),this.aspect=this.width/this.height,this.externalRenderer!=null){const n=window.devicePixelRatio;this.externalRenderer.resize(e*n,t*n)}this.queueRender()}}markBakedShadow(e){e.userData.noHit=!0,this.bakedShadows.add(e)}unmarkBakedShadow(e){e.userData.noHit=!1,e.visible=!0,this.bakedShadows.delete(e),this.boundingBox.expandByObject(e)}findBakedShadows(e){const t=new hn;e.traverse(n=>{const i=n;if(!i.material||!i.material.transparent)return;t.setFromObject(i);const a=t.getSize(HT),o=Math.min(a.x,a.y,a.z);Math.max(a.x,a.y,a.z)<kh*o||this.markBakedShadow(i)})}checkBakedShadows(){const{min:e,max:t}=this.boundingBox,n=new hn;this.boundingBox.getSize(this.size);for(const i of this.bakedShadows)n.setFromObject(i),!(n.min.y<e.y+this.size.y/kh&&n.min.x<=e.x&&n.max.x>=t.x&&n.min.z<=e.z&&n.max.z>=t.z)&&(n.min.z<e.z+this.size.z/kh&&n.min.x<=e.x&&n.max.x>=t.x&&n.min.y<=e.y&&n.max.y>=t.y||this.unmarkBakedShadow(i))}applyTransform(){const{model:e}=this;if(e==null)return;const t=Ti(this.element.orientation)[0].terms,n=ni(t[0]).number,i=ni(t[1]).number,s=ni(t[2]).number;e.quaternion.setFromEuler(new Pn(i,s,n,"YXZ"));const a=Ti(this.element.scale)[0].terms;e.scale.set(a[0].number,a[1].number,a[2].number)}updateBoundingBox(){const{model:e}=this;if(e==null)return;this.target.remove(e),this.findBakedShadows(e);const t=(n,i)=>n.expandByPoint(i);this.setBakedShadowVisibility(!1),this.boundingBox=Xo(e,t,new hn),this.boundingBox.isEmpty()&&(this.setBakedShadowVisibility(!0),this.bakedShadows.forEach(n=>this.unmarkBakedShadow(n)),this.boundingBox=Xo(e,t,new hn)),this.checkBakedShadows(),this.setBakedShadowVisibility(),this.boundingBox.getSize(this.size),this.target.add(e)}async updateFraming(){const{model:e}=this;if(e==null)return;this.target.remove(e),this.setBakedShadowVisibility(!1);const{center:t}=this.boundingSphere;this.element.requestUpdate("cameraTarget"),await this.element.updateComplete,t.copy(this.getTarget());const n=(s,a)=>Math.max(s,t.distanceToSquared(a));this.boundingSphere.radius=Math.sqrt(Xo(e,n,0));const i=(s,a)=>{a.sub(t);const o=Math.sqrt(a.x*a.x+a.z*a.z);return Math.max(s,o/(this.idealCameraDistance()-Math.abs(a.y)))};this.idealAspect=Xo(e,i,0)/Math.tan(this.framedFoVDeg/2*Math.PI/180),this.setBakedShadowVisibility(),this.target.add(e)}setBakedShadowVisibility(e=this.shadowIntensity<=0){for(const t of this.bakedShadows)t.visible=e}idealCameraDistance(){const e=this.framedFoVDeg/2*Math.PI/180;return this.boundingSphere.radius/Math.sin(e)}adjustedFoV(e){const t=Math.tan(e/2*Math.PI/180)*Math.max(1,this.idealAspect/this.aspect);return 2*Math.atan(t)*180/Math.PI}getNDC(e,t){if(this.xrCamera!=null)Sa.set(e/window.screen.width,t/window.screen.height);else{const n=this.element.getBoundingClientRect();Sa.set((e-n.x)/this.width,(t-n.y)/this.height)}return Sa.multiplyScalar(2).subScalar(1),Sa.y*=-1,Sa}getSize(){return{width:this.width,height:this.height}}setEnvironmentAndSkybox(e,t){this.element[ct].arRenderer.presentedScene!==this&&(this.environment=e,this.setBackground(t),this.queueRender())}setBackground(e){this.groundedSkybox.map=e,this.groundedSkybox.isUsable()?(this.target.add(this.groundedSkybox),this.background=null):(this.target.remove(this.groundedSkybox),this.background=e)}farRadius(){return this.boundingSphere.radius*(this.groundedSkybox.parent!=null?Em:1)}setGroundedSkybox(){const e=Ti(this.element.skyboxHeight)[0].terms[0],t=ni(e).number,n=Em*this.boundingSphere.radius;this.groundedSkybox.updateGeometry(t,n),this.groundedSkybox.position.y=t-(this.shadow?2*this.shadow.gap():0),this.setBackground(this.groundedSkybox.map)}setTarget(e,t,n){this.goalTarget.set(-e,-t,-n)}setTargetDamperDecayTime(e){this.targetDamperX.setDecayTime(e),this.targetDamperY.setDecayTime(e),this.targetDamperZ.setDecayTime(e)}getTarget(){return this.goalTarget.clone().multiplyScalar(-1)}getDynamicTarget(){return this.target.position.clone().multiplyScalar(-1)}jumpToGoal(){this.updateTarget(C0)}updateTarget(e){const t=this.goalTarget,n=this.target.position;if(t.equals(n))return!1;{const i=this.boundingSphere.radius/10;let{x:s,y:a,z:o}=n;return s=this.targetDamperX.update(s,t.x,e,i),a=this.targetDamperY.update(a,t.y,e,i),o=this.targetDamperZ.update(o,t.z,e,i),this.groundedSkybox.position.x=-s,this.groundedSkybox.position.z=-o,this.target.position.set(s,a,o),this.target.updateMatrixWorld(),this.queueRender(),!0}}pointTowards(e,t){const{x:n,z:i}=this.position;this.yaw=Math.atan2(e-n,t-i)}get model(){return this._model}set yaw(e){this.pivot.rotation.y=e,this.groundedSkybox.rotation.y=-e,this.queueRender()}get yaw(){return this.pivot.rotation.y}set animationTime(e){this.mixer.setTime(e),this.queueShadowRender()}get animationTime(){if(this.currentAnimationAction!=null){const e=Math.max(this.currentAnimationAction._loopCount,0);return this.currentAnimationAction.loop===Pc&&(e&1)===1?this.duration-this.currentAnimationAction.time:this.currentAnimationAction.time}return 0}set animationTimeScale(e){this.mixer.timeScale=e}get animationTimeScale(){return this.mixer.timeScale}get duration(){return this.currentAnimationAction!=null&&this.currentAnimationAction.getClip()?this.currentAnimationAction.getClip().duration:0}get hasActiveAnimation(){return this.currentAnimationAction!=null}playAnimation(e=null,t=0,n=Dr,i=1/0){if(this._currentGLTF==null)return;const{animations:s}=this;if(s==null||s.length===0)return;let a=null;if(e!=null&&(a=this.animationsByName.get(e),a==null)){const o=parseInt(e);!isNaN(o)&&o>=0&&o<s.length&&(a=s[o])}a==null&&(a=s[0]);try{const{currentAnimationAction:o}=this,c=this.mixer.clipAction(a,this);c.timeScale!=this.element.timeScale&&(c.timeScale=this.element.timeScale),this.currentAnimationAction=c,this.element.paused?this.mixer.stopAllAction():(c.paused=!1,o!=null&&c!==o?c.crossFadeFrom(o,t,!1):this.animationTimeScale>0&&this.animationTime==this.duration&&(this.animationTime=0)),c.setLoop(n,i),c.enabled=!0,c.clampWhenFinished=!0,c.play()}catch(o){console.error(o)}}appendAnimation(e="",t=Dr,n=1/0,i=1,s=1,a=!1,o=!1,c=!0,l=null,u=!1){if(this._currentGLTF==null||e===this.element.animationName)return;const{animations:h}=this;if(h==null||h.length===0)return;let d=null;const f=1.25;if(e&&(d=this.animationsByName.get(e)),d!=null){typeof n=="string"?isNaN(n)?(n=1/0,console.warn("Invalid repetitionCount value, repetitionCount is set to Infinity")):n=Math.max(parseInt(n),1):typeof n=="number"&&n<1&&(n=1),n===1&&t!==eo&&(t=eo),typeof i=="string"&&(isNaN(i)?(i=1,console.warn("Invalid weight value, weight is set to 1")):i=parseFloat(i)),typeof s=="string"&&(isNaN(s)?(s=1,console.warn("Invalid timeScale value, timeScale is set to 1")):s=parseFloat(s)),typeof a=="string"&&(a.toLowerCase().trim()==="true"?a=!0:a.toLowerCase().trim()==="false"?a=!1:isNaN(a)?(a=!1,console.warn("Invalid fade value, fade is set to false")):a=parseFloat(a)),typeof o=="string"&&(o.toLowerCase().trim()==="true"?o=!0:o.toLowerCase().trim()==="false"?o=!1:isNaN(o)?(o=!1,console.warn("Invalid warp value, warp is set to false")):o=parseFloat(o)),typeof l=="string"&&(isNaN(l)||(l=parseFloat(l)));try{const p=this.mixer.existingAction(d)||this.mixer.clipAction(d,this),g=p.timeScale;u&&this.appendedAnimations.includes(e)&&(this.markedAnimations.map(m=>m.name).includes(e)||this.markedAnimations.push({name:e,loopMode:t,repetitionCount:n})),typeof l=="number"&&(p.time=Math.min(Math.max(l,0),d.duration)),typeof a=="boolean"&&a?p.fadeIn(f):typeof a=="number"?p.fadeIn(Math.max(a,0)):i>=0&&(p.weight=Math.min(Math.max(i,0),1)),typeof o=="boolean"&&o?p.warp(c?g:0,s,f):typeof o=="number"?p.warp(c?g:0,s,Math.max(o,0)):p.timeScale=s,p.isRunning()||(p.time==d.duration&&p.stop(),p.setLoop(t,n),p.paused=!1,p.enabled=!0,p.clampWhenFinished=!0,p.play()),this.appendedAnimations.includes(e)||this.element[ee].appendedAnimations.push(e)}catch(p){console.error(p)}}}detachAnimation(e="",t=!0){if(this._currentGLTF==null||e===this.element.animationName)return;const{animations:n}=this;if(n==null||n.length===0)return;let i=null;const s=1.5;if(e&&(i=this.animationsByName.get(e)),i!=null){typeof t=="string"&&(t.toLowerCase().trim()==="true"?t=!0:t.toLowerCase().trim()==="false"?t=!1:isNaN(t)?(t=!0,console.warn("Invalid fade value, fade is set to true")):t=parseFloat(t));try{const a=this.mixer.existingAction(i)||this.mixer.clipAction(i,this);typeof t=="boolean"&&t?a.fadeOut(s):typeof t=="number"?a.fadeOut(Math.max(t,0)):a.stop();const o=this.element[ee].appendedAnimations.filter(c=>c!==e);this.element[ee].appendedAnimations=o}catch(a){console.error(a)}}}updateAnimationLoop(e="",t=Dr,n=1/0){if(this._currentGLTF==null||e===this.element.animationName)return;const{animations:i}=this;if(i==null||i.length===0)return;let s=null;if(e&&(s=this.animationsByName.get(e)),s!=null)try{const a=this.mixer.existingAction(s)||this.mixer.clipAction(s,this);a.stop(),a.setLoop(t,n),a.play()}catch(a){console.error(a)}}stopAnimation(){this.currentAnimationAction=null,this.mixer.stopAllAction()}updateAnimation(e){this.mixer.update(e),this.queueShadowRender()}subscribeMixerEvent(e,t){this.mixer.addEventListener(e,t)}updateShadow(){const e=this.shadow;if(e!=null){const t=this.element.arPlacement==="wall"?"back":"bottom";e.setScene(this,this.shadowSoftness,t),e.needsUpdate=!0}}renderShadow(e){const t=this.shadow;t!=null&&t.needsUpdate==!0&&(t.render(e,this),t.needsUpdate=!1)}queueShadowRender(){this.shadow!=null&&(this.shadow.needsUpdate=!0)}setShadowIntensity(e){if(this.shadowIntensity=e,this._currentGLTF!=null&&(this.setBakedShadowVisibility(),!(e<=0&&this.shadow==null))){if(this.shadow==null){const t=this.element.arPlacement==="wall"?"back":"bottom";this.shadow=new GT(this,this.shadowSoftness,t)}this.shadow.setIntensity(e)}}setShadowSoftness(e){this.shadowSoftness=e;const t=this.shadow;t?.setSoftness(e)}setShadowOffset(e){const t=this.shadow;t?.setOffset(e)}getHit(e=this){return lc.intersectObject(e,!0).find(n=>n.object.visible&&!n.object.userData.noHit)}hitFromController(e,t=this){return lc.setFromXRController(e),this.getHit(t)}hitFromPoint(e,t=this){return lc.setFromCamera(e,this.getCamera()),this.getHit(t)}positionAndNormalFromPoint(e,t=this){var n;const i=this.hitFromPoint(e,t);if(i==null)return null;const s=i.point,a=i.face!=null?i.face.normal.clone().applyNormalMatrix(new Qe().getNormalMatrix(i.object.matrixWorld)):lc.ray.direction.clone().multiplyScalar(-1),o=(n=i.uv)!==null&&n!==void 0?n:null;return{position:s,normal:a,uv:o}}surfaceFromPoint(e,t=this){const n=this.element.model;if(n==null)return null;const i=this.hitFromPoint(e,t);if(i==null||i.face==null)return null;const s=n[Zu](i),{meshes:a,primitives:o}=s.mesh.userData.associations,c=new B,l=new B,u=new B,{a:h,b:d,c:f}=i.face,p=i.object;p.getVertexPosition(h,c),p.getVertexPosition(d,l),p.getVertexPosition(f,u);const g=new vn(c,l,u),m=new B;return g.getBarycoord(p.worldToLocal(i.point),m),`${a} ${o} ${h} ${d} ${f} ${m.x.toFixed(3)} ${m.y.toFixed(3)} ${m.z.toFixed(3)}`}addHotspot(e){this.target.add(e),this.annotationRenderer.domElement.appendChild(e.element),this.updateSurfaceHotspot(e)}removeHotspot(e){this.target.remove(e)}forHotspots(e){const{children:t}=this.target;for(let n=0,i=t.length;n<i;n++){const s=t[n];s instanceof ib&&e(s)}}updateSurfaceHotspot(e){if(e.surface==null||this.element.model==null)return;const t=Ti(e.surface)[0].terms;if(t.length!=8){console.warn(e.surface+" does not have exactly 8 numbers.");return}const n=this.element.model[nb](t[0].number,t[1].number);if(n==null){console.warn(e.surface+" does not match a node/primitive in this glTF! Skipping this hotspot.");return}const i=n.mesh.geometry.attributes.position.count,s=new B(t[2].number,t[3].number,t[4].number);if(s.x>=i||s.y>=i||s.z>=i){console.warn(e.surface+" vertex indices out of range in this glTF! Skipping this hotspot.");return}const a=new B(t[5].number,t[6].number,t[7].number);e.mesh=n.mesh,e.tri=s,e.bary=a,e.updateSurface()}animateSurfaceHotspots(){this.element.paused||this.forHotspots(e=>{e.updateSurface()})}updateHotspotsVisibility(e){this.forHotspots(t=>{Qh.copy(e),vm.setFromMatrixPosition(t.matrixWorld),Qh.sub(vm),xm.copy(t.normal).transformDirection(this.target.matrixWorld),Qh.dot(xm)<0?t.hide():t.show()})}orientHotspots(e){this.forHotspots(t=>{t.orient(e)})}setHotspotsVisibility(e){this.forHotspots(t=>{t.visible=e})}updateSchema(e){var t;const{schemaElement:n,element:i}=this,{alt:s,poster:a,iosSrc:o}=i;if(e!=null){const c=[{"@type":"MediaObject",contentUrl:e,encodingFormat:((t=e.split(".").pop())===null||t===void 0?void 0:t.toLowerCase())==="gltf"?"model/gltf+json":"model/gltf-binary"}];o&&c.push({"@type":"MediaObject",contentUrl:o,encodingFormat:"model/vnd.usdz+zip"});const l={"@context":"http://schema.org/","@type":"3DModel",image:a??void 0,name:s??void 0,encoding:c};n.textContent=JSON.stringify(l),document.head.appendChild(n)}else n.parentElement!=null&&n.parentElement.removeChild(n)}}/* @license
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
 */class VT extends EventTarget{constructor(){super(...arguments),this.ongoingActivities=new Set,this.totalProgress=0}get ongoingActivityCount(){return this.ongoingActivities.size}beginActivity(e){const t={progress:0,completed:!1};return this.ongoingActivities.add(t),this.ongoingActivityCount===1&&this.announceTotalProgress(t,0,e),n=>{let i;return i=Math.max(ti(n,0,1),t.progress),i!==t.progress&&this.announceTotalProgress(t,i,e),t.progress}}announceTotalProgress(e,t,n){let i=0,s=0;t==1&&(e.completed=!0);for(const c of this.ongoingActivities){const{progress:l}=c;i+=1-l,c.completed&&s++}const a=e.progress;e.progress=t,this.totalProgress+=(t-a)*(1-this.totalProgress)/i;const o=s===this.ongoingActivityCount?1:this.totalProgress;this.dispatchEvent(new CustomEvent("progress",{detail:{totalProgress:o,reason:n}})),s===this.ongoingActivityCount&&(this.totalProgress=0,this.ongoingActivities.clear())}}/* @license
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
 */var ol=function(r,e,t,n){var i=arguments.length,s=i<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,t):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(r,e,t,n);else for(var o=r.length-1;o>=0;o--)(a=r[o])&&(s=(i<3?a(s):i>3?a(e,t,s):a(e,t))||s);return i>3&&s&&Object.defineProperty(e,t,s),s},ym,Sm,Cm,Im,Mm,wm,Tm,Rm,Bm,Dm,Lm,Fm,Pm;const WT=10,qT=50,XT=0,$T=300,jT=150,Ki=document.createElement("canvas"),Gh=Symbol("fallbackResizeHandler"),Um=Symbol("defaultAriaLabel"),hc=Symbol("resizeObserver"),mr=Symbol("clearModelTimeout"),Hh=Symbol("onContextLost"),gr=Symbol("loaded"),zh=Symbol("status"),Vh=Symbol("onFocus"),Wh=Symbol("onBlur"),xr=Symbol("updateSize"),uc=Symbol("intersectionObserver"),ys=Symbol("isElementInViewport"),Xc=Symbol("announceModelVisibility"),wr=Symbol("ariaLabel"),td=Symbol("altDefaulted"),Ca=Symbol("statusElement"),$c=Symbol("updateStatus"),Oa=Symbol("loadedTime"),Nr=Symbol("updateSource"),Nm=Symbol("markLoaded"),wc=Symbol("container"),zn=Symbol("input"),nd=Symbol("canvas"),ee=Symbol("scene"),Wt=Symbol("needsRender"),ri=Symbol("tick"),ai=Symbol("onModelLoad"),jc=Symbol("onResize"),ct=Symbol("renderer"),ks=Symbol("progressTracker"),Om=Symbol("getLoaded"),Qs=Symbol("getModelIsVisible"),Yr=Symbol("shouldAttemptPreload"),Xi=r=>({x:r.x,y:r.y,z:r.z,toString(){return`${this.x}m ${this.y}m ${this.z}m`}}),id=r=>({u:r.x,v:r.y,toString(){return`${this.u} ${this.v}`}});class po extends Ss{static get is(){return"model-viewer"}static set modelCacheSize(e){cn[Vi].evictionThreshold=e}static get modelCacheSize(){return cn[Vi].evictionThreshold}static set minimumRenderScale(e){e>1&&console.warn("<model-viewer> minimumRenderScale has been clamped to a maximum value of 1."),e<=0&&console.warn("<model-viewer> minimumRenderScale has been clamped to a minimum value of 0.25."),Vn.singleton.minScale=e}static get minimumRenderScale(){return Vn.singleton.minScale}get loaded(){return this[Om]()}get[(ym=ys,Sm=gr,Cm=Oa,Im=zh,Mm=mr,wm=Gh,Tm=Xc,Rm=hc,Bm=uc,Dm=ks,ct)](){return Vn.singleton}get modelIsVisible(){return this[Qs]()}constructor(){super(),this.alt=null,this.src=null,this.withCredentials=!1,this.generateSchema=!1,this[ym]=!1,this[Sm]=!1,this[Cm]=0,this[Im]="",this[Mm]=null,this[wm]=Ep(()=>{const i=this.getBoundingClientRect();this[xr](i)},qT),this[Tm]=Ep(i=>{const s=this.modelIsVisible;s!==i&&this.dispatchEvent(new CustomEvent("model-visibility",{detail:{visible:s}}))},XT),this[Rm]=null,this[Bm]=null,this[Dm]=new VT,this[Lm]=()=>{this[Ca].textContent=this[zh]},this[Fm]=()=>{this[Ca].textContent=""},this[Pm]=i=>{this.dispatchEvent(new CustomEvent("error",{detail:{type:"webglcontextlost",sourceError:i.sourceEvent}}))},this.attachShadow({mode:"open"});const e=this.shadowRoot;fI(e),this[wc]=e.querySelector(".container"),this[zn]=e.querySelector(".userInput"),this[nd]=e.querySelector("canvas"),this[Ca]=e.querySelector("#status"),this[Um]=this[zn].getAttribute("aria-label");let t,n;if(this.isConnected){const i=this.getBoundingClientRect();t=i.width,n=i.height}else t=$T,n=jT;this[ee]=new zT({canvas:this[nd],element:this,width:t,height:n}),Promise.resolve().then(()=>{this[xr](this.getBoundingClientRect())}),Xl&&(this[hc]=new ResizeObserver(i=>{if(!this[ct].isPresenting)for(let s of i)s.target===this&&this[xr](s.contentRect)})),$l?this[uc]=new IntersectionObserver(i=>{for(let s of i)if(s.target===this){const a=this.modelIsVisible;this[ys]=s.isIntersecting,this[Xc](a),this[ys]&&!this.loaded&&this[Nr]()}},{root:null,rootMargin:"0px",threshold:1e-5}):this[ys]=!0}connectedCallback(){super.connectedCallback&&super.connectedCallback(),Xl?this[hc].observe(this):self.addEventListener("resize",this[Gh]),$l&&this[uc].observe(this),this.addEventListener("focus",this[Vh]),this.addEventListener("blur",this[Wh]);const e=this[ct];e.addEventListener("contextlost",this[Hh]),e.registerScene(this[ee]),this[mr]!=null&&(self.clearTimeout(this[mr]),this[mr]=null,this.requestUpdate("src",null))}disconnectedCallback(){super.disconnectedCallback&&super.disconnectedCallback(),Xl?this[hc].unobserve(this):self.removeEventListener("resize",this[Gh]),$l&&this[uc].unobserve(this),this.removeEventListener("focus",this[Vh]),this.removeEventListener("blur",this[Wh]);const e=this[ct];e.removeEventListener("contextlost",this[Hh]),e.unregisterScene(this[ee]),this[mr]=self.setTimeout(()=>{this[ee].dispose(),this[mr]=null},WT)}updated(e){super.updated(e),e.has("src")&&(this.src==null?(this[gr]=!1,this[Oa]=0,this[ee].reset()):this.src!==this[ee].url&&(this[gr]=!1,this[Oa]=0,this[Nr]())),e.has("alt")&&this[zn].setAttribute("aria-label",this[wr]),e.has("generateSchema")&&(this.generateSchema?this[ee].updateSchema(this.src):this[ee].updateSchema(null))}toDataURL(e,t){return this[ct].displayCanvas(this[ee]).toDataURL(e,t)}async toBlob(e){const t=e?e.mimeType:void 0,n=e?e.qualityArgument:void 0,i=e?e.idealAspect:void 0,{width:s,height:a,idealAspect:o,aspect:c}=this[ee],{dpr:l,scaleFactor:u}=this[ct];let h=s*u*l,d=a*u*l,f=0,p=0;if(i===!0)if(o>c){const g=d;d=Math.round(h/o),p=(g-d)/2}else{const g=h;h=Math.round(d*o),f=(g-h)/2}Ki.width=h,Ki.height=d;try{return new Promise(async(g,m)=>{Ki.getContext("2d").drawImage(this[ct].displayCanvas(this[ee]),f,p,h,d,0,0,h,d),Ki.toBlob(A=>{if(!A)return m(new Error("Unable to retrieve canvas blob"));g(A)},t,n)})}finally{this[xr]({width:s,height:a})}}registerEffectComposer(e){e.setRenderer(this[ct].threeRenderer),e.setMainCamera(this[ee].getCamera()),e.setMainScene(this[ee]),this[ee].effectRenderer=e}unregisterEffectComposer(){this[ee].effectRenderer=null}registerRenderer(e){this[ee].externalRenderer=e}unregisterRenderer(){this[ee].externalRenderer=null}get[wr](){return this[td]}get[td](){return this.alt==null||this.alt==="null"?this[Um]:this.alt}[Om](){return this[gr]}[Qs](){return this.loaded&&this[ys]}[Yr](){return!!this.src&&this[ys]}[xr]({width:e,height:t}){e===0||t===0||(this[wc].style.width=`${e}px`,this[wc].style.height=`${t}px`,this[jc]({width:e,height:t}))}[ri](e,t){var n;(n=this[ee].effectRenderer)===null||n===void 0||n.beforeRender(e,t)}[Nm](){this[gr]||(this[gr]=!0,this[Oa]=performance.now())}[Wt](){this[ee].queueRender()}[ai](){}[$c](e){this[zh]=e;const t=this.getRootNode();t!=null&&t.activeElement===this&&this[Ca].textContent!=e&&(this[Ca].textContent=e)}[(Lm=Vh,Fm=Wh,jc)](e){this[ee].setSize(e.width,e.height)}async[(Pm=Hh,Nr)](){const e=this[ee];if(this.loaded||!this[Yr]()||this.src===e.url)return;this.generateSchema&&e.updateSchema(this.src),this[$c]("Loading"),e.stopAnimation();const t=this[ks].beginActivity("model-load"),n=this.src;try{const i=e.setSource(n,a=>t(ti(a,0,1)*.95)),s=this[zc]();await Promise.all([i,s]),this[Nm](),this[ai](),this.updateComplete.then(()=>{this.dispatchEvent(new CustomEvent("before-render"))}),await new Promise(a=>{requestAnimationFrame(()=>{requestAnimationFrame(()=>{this.dispatchEvent(new CustomEvent("load",{detail:{url:n}})),a()})})})}catch(i){this.dispatchEvent(new CustomEvent("error",{detail:{type:"loadfailure",sourceError:i}}))}finally{t(1)}}}ol([De({type:String})],po.prototype,"alt",void 0);ol([De({type:String})],po.prototype,"src",void 0);ol([De({type:Boolean,attribute:"with-credentials"})],po.prototype,"withCredentials",void 0);ol([De({type:Boolean,attribute:"generate-schema"})],po.prototype,"generateSchema",void 0);/* @license
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
 */var qh=function(r,e,t,n){var i=arguments.length,s=i<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,t):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(r,e,t,n);else for(var o=r.length-1;o>=0;o--)(a=r[o])&&(s=(i<3?a(s):i>3?a(e,t,s):a(e,t))||s);return i>3&&s&&Object.defineProperty(e,t,s),s};const km=1e3,dc=Symbol("changeAnimation"),Qm=Symbol("appendAnimation"),Gm=Symbol("detachAnimation"),En=Symbol("paused"),YT={repetitions:1/0,pingpong:!1},KT={pingpong:!1,repetitions:null,weight:1,timeScale:1,fade:!1,warp:!1,relativeWarp:!0,time:null},JT={fade:!0},ZT=r=>{var e;class t extends r{constructor(...i){super(i),this.autoplay=!1,this.animationName=void 0,this.animationCrossfadeDuration=300,this[e]=!0,this[ee].subscribeMixerEvent("loop",s=>{const a=s.action._loopCount,o=s.action._clip.name,c=s.action._clip.uuid,l=this[ee].markedAnimations.find(u=>u.name===o);if(l){this[ee].updateAnimationLoop(l.name,l.loopMode,l.repetitionCount);const u=this[ee].markedAnimations.filter(h=>h.name!==o);this[ee].markedAnimations=u}this.dispatchEvent(new CustomEvent("loop",{detail:{count:a,name:o,uuid:c}}))}),this[ee].subscribeMixerEvent("finished",s=>{if(!this[ee].appendedAnimations.includes(s.action._clip.name))this[En]=!0;else{const a=this[ee].appendedAnimations.filter(o=>o!==s.action._clip.name);this[ee].appendedAnimations=a}this.dispatchEvent(new CustomEvent("finished"))})}get availableAnimations(){return this.loaded?this[ee].animationNames:[]}get duration(){return this[ee].duration}get paused(){return this[En]}get currentTime(){return this[ee].animationTime}get appendedAnimations(){return this[ee].appendedAnimations}set currentTime(i){this[ee].animationTime=i,this[Wt]()}get timeScale(){return this[ee].animationTimeScale}set timeScale(i){this[ee].animationTimeScale=i}pause(){this[En]||(this[En]=!0,this.dispatchEvent(new CustomEvent("pause")))}play(i){this.availableAnimations.length>0&&(this[En]=!1,this[dc](i),this.dispatchEvent(new CustomEvent("play")))}appendAnimation(i,s){this.availableAnimations.length>0&&(this[En]=!1,this[Qm](i,s),this.dispatchEvent(new CustomEvent("append-animation")))}detachAnimation(i,s){this.availableAnimations.length>0&&(this[En]=!1,this[Gm](i,s),this.dispatchEvent(new CustomEvent("detach-animation")))}[(e=En,ai)](){super[ai](),this[En]=!0,this.animationName!=null&&this[dc](),this.autoplay&&this.play()}[ri](i,s){super[ri](i,s),!(this[En]||!this[Qs]()&&!this[ct].isPresenting)&&(this[ee].updateAnimation(s/km),this[Wt]())}updated(i){super.updated(i),i.has("autoplay")&&this.autoplay&&this.play(),i.has("animationName")&&this[dc]()}[dc](i=YT){var s;const a=(s=i.repetitions)!==null&&s!==void 0?s:1/0,o=i.pingpong?Pc:a===1?eo:Dr;this[ee].playAnimation(this.animationName,this.animationCrossfadeDuration/km,o,a),this[En]&&(this[ee].updateAnimation(0),this[Wt]())}[Qm](i="",s=KT){var a;const o=(a=s.repetitions)!==null&&a!==void 0?a:1/0,c=s.pingpong?Pc:o===1?eo:Dr,l=!!s.repetitions||"pingpong"in s;this[ee].appendAnimation(i||this.animationName,c,o,s.weight,s.timeScale,s.fade,s.warp,s.relativeWarp,s.time,l),this[En]&&(this[ee].updateAnimation(0),this[Wt]())}[Gm](i="",s=JT){this[ee].detachAnimation(i||this.animationName,s.fade),this[En]&&(this[ee].updateAnimation(0),this[Wt]())}}return qh([De({type:Boolean})],t.prototype,"autoplay",void 0),qh([De({type:String,attribute:"animation-name"})],t.prototype,"animationName",void 0),qh([De({type:Number,attribute:"animation-crossfade-duration"})],t.prototype,"animationCrossfadeDuration",void 0),t};/* @license
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
 */const As=Symbol("hotspotMap"),Xh=Symbol("mutationCallback"),Ia=Symbol("observer"),$h=Symbol("addHotspot"),Hm=Symbol("removeHotspot"),jh=new Pe,eR=r=>{var e,t,n;class i extends r{constructor(){super(...arguments),this[e]=new Map,this[t]=a=>{a.forEach(o=>{(!(o instanceof MutationRecord)||o.type==="childList")&&(o.addedNodes.forEach(c=>{this[$h](c)}),o.removedNodes.forEach(c=>{this[Hm](c)}),this[Wt]())})},this[n]=new MutationObserver(this[Xh])}connectedCallback(){super.connectedCallback();for(let o=0;o<this.children.length;++o)this[$h](this.children[o]);const{ShadyDOM:a}=self;a==null?this[Ia].observe(this,{childList:!0}):this[Ia]=a.observeChildren(this,this[Xh])}disconnectedCallback(){super.disconnectedCallback();const{ShadyDOM:a}=self;a==null?this[Ia].disconnect():a.unobserveChildren(this[Ia])}[(e=As,t=Xh,n=Ia,ai)](){super[ai]();const a=this[ee];a.forHotspots(o=>{a.updateSurfaceHotspot(o)})}[ri](a,o){super[ri](a,o);const c=this[ee],{annotationRenderer:l}=c,u=c.getCamera();c.shouldRender()&&(c.animateSurfaceHotspots(),c.updateHotspotsVisibility(u.position),l.domElement.style.display="",l.render(c,u))}updateHotspot(a){const o=this[As].get(a.name);o!=null&&(o.updatePosition(a.position),o.updateNormal(a.normal),o.surface=a.surface,this[ee].updateSurfaceHotspot(o),this[Wt]())}queryHotspot(a){const o=this[As].get(a);if(o==null)return null;const c=Xi(o.position),l=Xi(o.normal),u=o.facingCamera,h=this[ee],d=h.getCamera(),f=new B;f.setFromMatrixPosition(o.matrixWorld),f.project(d);const p=h.width/2,g=h.height/2;f.x=f.x*p+p,f.y=-(f.y*g)+g;const m=Xi(new B(f.x,f.y,f.z));return!Number.isFinite(m.x)||!Number.isFinite(m.y)?null:{position:c,normal:l,canvasPosition:m,facingCamera:u}}positionAndNormalFromPoint(a,o){const c=this[ee],l=c.getNDC(a,o),u=c.positionAndNormalFromPoint(l);if(u==null)return null;jh.copy(c.target.matrixWorld).invert();const h=Xi(u.position.applyMatrix4(jh)),d=Xi(u.normal.transformDirection(jh));let f=null;return u.uv!=null&&(f=id(u.uv)),{position:h,normal:d,uv:f}}surfaceFromPoint(a,o){const c=this[ee],l=c.getNDC(a,o);return c.surfaceFromPoint(l)}[$h](a){if(!(a instanceof HTMLElement&&a.slot.indexOf("hotspot")===0))return;let o=this[As].get(a.slot);o!=null?o.increment():(o=new ib({name:a.slot,position:a.dataset.position,normal:a.dataset.normal,surface:a.dataset.surface}),this[As].set(a.slot,o),this[ee].addHotspot(o)),this[ee].queueRender()}[Hm](a){if(!(a instanceof HTMLElement))return;const o=this[As].get(a.slot);o&&(o.decrement()&&(this[ee].removeHotspot(o),this[As].delete(a.slot)),this[ee].queueRender())}}return i};/*!
fflate - fast JavaScript compression/decompression
<https://101arrowz.github.io/fflate>
Licensed under MIT. https://github.com/101arrowz/fflate/blob/master/LICENSE
version 0.8.2
*/var en=Uint8Array,yn=Uint16Array,Fd=Int32Array,Pd=new en([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),Ud=new en([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),zm=new en([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),sb=function(r,e){for(var t=new yn(31),n=0;n<31;++n)t[n]=e+=1<<r[n-1];for(var i=new Fd(t[30]),n=1;n<30;++n)for(var s=t[n];s<t[n+1];++s)i[s]=s-t[n]<<5|n;return{b:t,r:i}},rb=sb(Pd,2),tR=rb.b,sd=rb.r;tR[28]=258,sd[258]=28;var nR=sb(Ud,0),Vm=nR.r,rd=new yn(32768);for(var xt=0;xt<32768;++xt){var Hi=(xt&43690)>>1|(xt&21845)<<1;Hi=(Hi&52428)>>2|(Hi&13107)<<2,Hi=(Hi&61680)>>4|(Hi&3855)<<4,rd[xt]=((Hi&65280)>>8|(Hi&255)<<8)>>1}var Wa=function(r,e,t){for(var n=r.length,i=0,s=new yn(e);i<n;++i)r[i]&&++s[r[i]-1];var a=new yn(e);for(i=1;i<e;++i)a[i]=a[i-1]+s[i-1]<<1;var o;if(t){o=new yn(1<<e);var c=15-e;for(i=0;i<n;++i)if(r[i])for(var l=i<<4|r[i],u=e-r[i],h=a[r[i]-1]++<<u,d=h|(1<<u)-1;h<=d;++h)o[rd[h]>>c]=l}else for(o=new yn(n),i=0;i<n;++i)r[i]&&(o[i]=rd[a[r[i]-1]++]>>15-r[i]);return o},Gs=new en(288);for(var xt=0;xt<144;++xt)Gs[xt]=8;for(var xt=144;xt<256;++xt)Gs[xt]=9;for(var xt=256;xt<280;++xt)Gs[xt]=7;for(var xt=280;xt<288;++xt)Gs[xt]=8;var Yc=new en(32);for(var xt=0;xt<32;++xt)Yc[xt]=5;var iR=Wa(Gs,9,0),sR=Wa(Yc,5,0),ab=function(r){return(r+7)/8|0},ob=function(r,e,t){return(t==null||t>r.length)&&(t=r.length),new en(r.subarray(e,t))},rR=["unexpected EOF","invalid block type","invalid length/literal","invalid distance","stream finished","no stream handler",,"no callback","invalid UTF-8 data","extra field too long","date not in range 1980-2099","filename too long","stream finishing","invalid zip data"],cl=function(r,e,t){var n=new Error(e||rR[r]);if(n.code=r,Error.captureStackTrace&&Error.captureStackTrace(n,cl),!t)throw n;return n},vi=function(r,e,t){t<<=e&7;var n=e/8|0;r[n]|=t,r[n+1]|=t>>8},Ma=function(r,e,t){t<<=e&7;var n=e/8|0;r[n]|=t,r[n+1]|=t>>8,r[n+2]|=t>>16},Yh=function(r,e){for(var t=[],n=0;n<r.length;++n)r[n]&&t.push({s:n,f:r[n]});var i=t.length,s=t.slice();if(!i)return{t:lb,l:0};if(i==1){var a=new en(t[0].s+1);return a[t[0].s]=1,{t:a,l:1}}t.sort(function(S,I){return S.f-I.f}),t.push({s:-1,f:25001});var o=t[0],c=t[1],l=0,u=1,h=2;for(t[0]={s:-1,f:o.f+c.f,l:o,r:c};u!=i-1;)o=t[t[l].f<t[h].f?l++:h++],c=t[l!=u&&t[l].f<t[h].f?l++:h++],t[u++]={s:-1,f:o.f+c.f,l:o,r:c};for(var d=s[0].s,n=1;n<i;++n)s[n].s>d&&(d=s[n].s);var f=new yn(d+1),p=ad(t[u-1],f,0);if(p>e){var n=0,g=0,m=p-e,A=1<<m;for(s.sort(function(I,M){return f[M.s]-f[I.s]||I.f-M.f});n<i;++n){var E=s[n].s;if(f[E]>e)g+=A-(1<<p-f[E]),f[E]=e;else break}for(g>>=m;g>0;){var _=s[n].s;f[_]<e?g-=1<<e-f[_]++-1:++n}for(;n>=0&&g;--n){var b=s[n].s;f[b]==e&&(--f[b],++g)}p=e}return{t:new en(f),l:p}},ad=function(r,e,t){return r.s==-1?Math.max(ad(r.l,e,t+1),ad(r.r,e,t+1)):e[r.s]=t},Wm=function(r){for(var e=r.length;e&&!r[--e];);for(var t=new yn(++e),n=0,i=r[0],s=1,a=function(c){t[n++]=c},o=1;o<=e;++o)if(r[o]==i&&o!=e)++s;else{if(!i&&s>2){for(;s>138;s-=138)a(32754);s>2&&(a(s>10?s-11<<5|28690:s-3<<5|12305),s=0)}else if(s>3){for(a(i),--s;s>6;s-=6)a(8304);s>2&&(a(s-3<<5|8208),s=0)}for(;s--;)a(i);s=1,i=r[o]}return{c:t.subarray(0,n),n:e}},wa=function(r,e){for(var t=0,n=0;n<e.length;++n)t+=r[n]*e[n];return t},cb=function(r,e,t){var n=t.length,i=ab(e+2);r[i]=n&255,r[i+1]=n>>8,r[i+2]=r[i]^255,r[i+3]=r[i+1]^255;for(var s=0;s<n;++s)r[i+s+4]=t[s];return(i+4+n)*8},qm=function(r,e,t,n,i,s,a,o,c,l,u){vi(e,u++,t),++i[256];for(var h=Yh(i,15),d=h.t,f=h.l,p=Yh(s,15),g=p.t,m=p.l,A=Wm(d),E=A.c,_=A.n,b=Wm(g),S=b.c,I=b.n,M=new yn(19),w=0;w<E.length;++w)++M[E[w]&31];for(var w=0;w<S.length;++w)++M[S[w]&31];for(var x=Yh(M,7),v=x.t,R=x.l,k=19;k>4&&!v[zm[k-1]];--k);var F=l+5<<3,P=wa(i,Gs)+wa(s,Yc)+a,G=wa(i,d)+wa(s,g)+a+14+3*k+wa(M,v)+2*M[16]+3*M[17]+7*M[18];if(c>=0&&F<=P&&F<=G)return cb(e,u,r.subarray(c,c+l));var O,W,Q,Y;if(vi(e,u,1+(G<P)),u+=2,G<P){O=Wa(d,f,0),W=d,Q=Wa(g,m,0),Y=g;var ne=Wa(v,R,0);vi(e,u,_-257),vi(e,u+5,I-1),vi(e,u+10,k-4),u+=14;for(var w=0;w<k;++w)vi(e,u+3*w,v[zm[w]]);u+=3*k;for(var re=[E,S],de=0;de<2;++de)for(var Ce=re[de],w=0;w<Ce.length;++w){var q=Ce[w]&31;vi(e,u,ne[q]),u+=v[q],q>15&&(vi(e,u,Ce[w]>>5&127),u+=Ce[w]>>12)}}else O=iR,W=Gs,Q=sR,Y=Yc;for(var w=0;w<o;++w){var Z=n[w];if(Z>255){var q=Z>>18&31;Ma(e,u,O[q+257]),u+=W[q+257],q>7&&(vi(e,u,Z>>23&31),u+=Pd[q]);var ge=Z&31;Ma(e,u,Q[ge]),u+=Y[ge],ge>3&&(Ma(e,u,Z>>5&8191),u+=Ud[ge])}else Ma(e,u,O[Z]),u+=W[Z]}return Ma(e,u,O[256]),u+W[256]},aR=new Fd([65540,131080,131088,131104,262176,1048704,1048832,2114560,2117632]),lb=new en(0),oR=function(r,e,t,n,i,s){var a=s.z||r.length,o=new en(n+a+5*(1+Math.ceil(a/7e3))+i),c=o.subarray(n,o.length-i),l=s.l,u=(s.r||0)&7;if(e){u&&(c[0]=s.r>>3);for(var h=aR[e-1],d=h>>13,f=h&8191,p=(1<<t)-1,g=s.p||new yn(32768),m=s.h||new yn(p+1),A=Math.ceil(t/3),E=2*A,_=function(D){return(r[D]^r[D+1]<<A^r[D+2]<<E)&p},b=new Fd(25e3),S=new yn(288),I=new yn(32),M=0,w=0,x=s.i||0,v=0,R=s.w||0,k=0;x+2<a;++x){var F=_(x),P=x&32767,G=m[F];if(g[P]=G,m[F]=P,R<=x){var O=a-x;if((M>7e3||v>24576)&&(O>423||!l)){u=qm(r,c,0,b,S,I,w,v,k,x-k,u),v=M=w=0,k=x;for(var W=0;W<286;++W)S[W]=0;for(var W=0;W<30;++W)I[W]=0}var Q=2,Y=0,ne=f,re=P-G&32767;if(O>2&&F==_(x-re))for(var de=Math.min(d,O)-1,Ce=Math.min(32767,x),q=Math.min(258,O);re<=Ce&&--ne&&P!=G;){if(r[x+Q]==r[x+Q-re]){for(var Z=0;Z<q&&r[x+Z]==r[x+Z-re];++Z);if(Z>Q){if(Q=Z,Y=re,Z>de)break;for(var ge=Math.min(re,Z-2),le=0,W=0;W<ge;++W){var ve=x-re+W&32767,Ze=g[ve],Re=ve-Ze&32767;Re>le&&(le=Re,G=ve)}}}P=G,G=g[P],re+=P-G&32767}if(Y){b[v++]=268435456|sd[Q]<<18|Vm[Y];var pt=sd[Q]&31,At=Vm[Y]&31;w+=Pd[pt]+Ud[At],++S[257+pt],++I[At],R=x+Q,++M}else b[v++]=r[x],++S[r[x]]}}for(x=Math.max(x,R);x<a;++x)b[v++]=r[x],++S[r[x]];u=qm(r,c,l,b,S,I,w,v,k,x-k,u),l||(s.r=u&7|c[u/8|0]<<3,u-=7,s.h=m,s.p=g,s.i=x,s.w=R)}else{for(var x=s.w||0;x<a+l;x+=65535){var je=x+65535;je>=a&&(c[u/8|0]=l,je=a),u=cb(c,u+1,r.subarray(x,je))}s.i=a}return ob(o,0,n+ab(u)+i)},cR=function(){for(var r=new Int32Array(256),e=0;e<256;++e){for(var t=e,n=9;--n;)t=(t&1&&-306674912)^t>>>1;r[e]=t}return r}(),lR=function(){var r=-1;return{p:function(e){for(var t=r,n=0;n<e.length;++n)t=cR[t&255^e[n]]^t>>>8;r=t},d:function(){return~r}}},hR=function(r,e,t,n,i){if(!i&&(i={l:1},e.dictionary)){var s=e.dictionary.subarray(-32768),a=new en(s.length+r.length);a.set(s),a.set(r,s.length),r=a,i.w=s.length}return oR(r,e.level==null?6:e.level,e.mem==null?i.l?Math.ceil(Math.max(8,Math.min(13,Math.log(r.length)))*1.5):20:12+e.mem,t,n,i)},hb=function(r,e){var t={};for(var n in r)t[n]=r[n];for(var n in e)t[n]=e[n];return t},qt=function(r,e,t){for(;t;++e)r[e]=t,t>>>=8};function uR(r,e){return hR(r,e||{},0,0)}var ub=function(r,e,t,n){for(var i in r){var s=r[i],a=e+i,o=n;Array.isArray(s)&&(o=hb(n,s[1]),s=s[0]),s instanceof en?t[a]=[s,o]:(t[a+="/"]=[new en(0),o],ub(s,a,t,n))}},Xm=typeof TextEncoder<"u"&&new TextEncoder,dR=typeof TextDecoder<"u"&&new TextDecoder,fR=0;try{dR.decode(lb,{stream:!0}),fR=1}catch{}function Kc(r,e){var t;if(Xm)return Xm.encode(r);for(var n=r.length,i=new en(r.length+(r.length>>1)),s=0,a=function(l){i[s++]=l},t=0;t<n;++t){if(s+5>i.length){var o=new en(s+8+(n-t<<1));o.set(i),i=o}var c=r.charCodeAt(t);c<128||e?a(c):c<2048?(a(192|c>>6),a(128|c&63)):c>55295&&c<57344?(c=65536+(c&1047552)|r.charCodeAt(++t)&1023,a(240|c>>18),a(128|c>>12&63),a(128|c>>6&63),a(128|c&63)):(a(224|c>>12),a(128|c>>6&63),a(128|c&63))}return ob(i,0,s)}var od=function(r){var e=0;if(r)for(var t in r){var n=r[t].length;n>65535&&cl(9),e+=n+4}return e},$m=function(r,e,t,n,i,s,a,o){var c=n.length,l=t.extra,u=o&&o.length,h=od(l);qt(r,e,a!=null?33639248:67324752),e+=4,a!=null&&(r[e++]=20,r[e++]=t.os),r[e]=20,e+=2,r[e++]=t.flag<<1|(s<0&&8),r[e++]=i&&8,r[e++]=t.compression&255,r[e++]=t.compression>>8;var d=new Date(t.mtime==null?Date.now():t.mtime),f=d.getFullYear()-1980;if((f<0||f>119)&&cl(10),qt(r,e,f<<25|d.getMonth()+1<<21|d.getDate()<<16|d.getHours()<<11|d.getMinutes()<<5|d.getSeconds()>>1),e+=4,s!=-1&&(qt(r,e,t.crc),qt(r,e+4,s<0?-s-2:s),qt(r,e+8,t.size)),qt(r,e+12,c),qt(r,e+14,h),e+=16,a!=null&&(qt(r,e,u),qt(r,e+6,t.attrs),qt(r,e+10,a),e+=14),r.set(n,e),e+=c,h)for(var p in l){var g=l[p],m=g.length;qt(r,e,+p),qt(r,e+2,m),r.set(g,e+4),e+=4+m}return u&&(r.set(o,e),e+=u),e},pR=function(r,e,t,n,i){qt(r,e,101010256),qt(r,e+8,t),qt(r,e+10,t),qt(r,e+12,n),qt(r,e+16,i)};function AR(r,e){e||(e={});var t={},n=[];ub(r,"",t,e);var i=0,s=0;for(var a in t){var o=t[a],c=o[0],l=o[1],u=l.level==0?0:8,h=Kc(a),d=h.length,f=l.comment,p=f&&Kc(f),g=p&&p.length,m=od(l.extra);d>65535&&cl(11);var A=u?uR(c,l):c,E=A.length,_=lR();_.p(c),n.push(hb(l,{size:c.length,crc:_.d(),c:A,f:h,m:p,u:d!=a.length||p&&f.length!=g,o:i,compression:u})),i+=30+d+m+E,s+=76+2*(d+m)+(g||0)+E}for(var b=new en(s+22),S=i,I=s-i,M=0;M<n.length;++M){var h=n[M];$m(b,h.o,h,h.f,h.u,h.c.length);var w=30+h.f.length+od(h.extra);b.set(h.c,h.o+w),$m(b,i,h,h.f,h.u,h.c.length,h.o,h.m),i+=16+w+(h.m?h.m.length:0)}return pR(b,i,n.length,I,S),b}class mR{constructor(){this.textureUtils=null}setTextureUtils(e){this.textureUtils=e}parse(e,t,n,i){this.parseAsync(e,i).then(t).catch(n)}async parseAsync(e,t={}){t=Object.assign({ar:{anchoring:{type:"plane"},planeAnchoring:{alignment:"horizontal"}},includeAnchoringProperties:!0,quickLookCompatible:!1,maxTextureSize:1024},t);const n={},i="model.usda";n[i]=null;let s=db();s+=bR(t);const a={},o={};e.traverseVisible(l=>{if(l.isMesh){const u=l.geometry,h=l.material;if(h.isMeshStandardMaterial){const d="geometries/Geometry_"+u.id+".usda";if(!(d in n)){const f=xR(u);n[d]=ER(f)}h.uuid in a||(a[h.uuid]=h),s+=vR(l,u,a[h.uuid])}else console.warn("THREE.USDZExporter: Unsupported material type (USDZ only supports MeshStandardMaterial)",l)}else l.isCamera&&(s+=BR(l))}),s+=_R(),s+=wR(a,o,t.quickLookCompatible),n[i]=Kc(s),s=null;for(const l in o){let u=o[l];if(u.isCompressedTexture===!0){if(this.textureUtils===null)throw new Error("THREE.USDZExporter: setTextureUtils() must be called to process compressed textures.");u=await this.textureUtils.decompress(u)}const h=gR(u.image,u.flipY,t.maxTextureSize),d=await new Promise(f=>h.toBlob(f,"image/png",1));n[`textures/Texture_${l}.png`]=new Uint8Array(await d.arrayBuffer())}let c=0;for(const l in n){const u=n[l],h=34+l.length;c+=h;const d=c&63;if(d!==4){const f=64-d,p=new Uint8Array(f);n[l]=[u,{extra:{12345:p}}]}c=u.length}return AR(n,{level:0})}}function gR(r,e,t){if(typeof HTMLImageElement<"u"&&r instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&r instanceof HTMLCanvasElement||typeof OffscreenCanvas<"u"&&r instanceof OffscreenCanvas||typeof ImageBitmap<"u"&&r instanceof ImageBitmap){const n=t/Math.max(r.width,r.height),i=document.createElement("canvas");i.width=r.width*Math.min(1,n),i.height=r.height*Math.min(1,n);const s=i.getContext("2d");return e===!0&&(s.translate(0,i.height),s.scale(1,-1)),s.drawImage(r,0,0,i.width,i.height),i}else throw new Error("THREE.USDZExporter: No valid image data found. Unable to process texture.")}const Jt=7;function db(){return`#usda 1.0
(
	customLayerData = {
		string creator = "Three.js USDZExporter"
	}
	defaultPrim = "Root"
	metersPerUnit = 1
	upAxis = "Y"
)

`}function bR(r){return`def Xform "Root"
{
	def Scope "Scenes" (
		kind = "sceneLibrary"
	)
	{
		def Xform "Scene" (
			customData = {
				bool preliminary_collidesWithEnvironment = 0
				string sceneName = "Scene"
			}
			sceneName = "Scene"
		)
		{${r.includeAnchoringProperties===!0?`
		token preliminary:anchoring:type = "${r.ar.anchoring.type}"
		token preliminary:planeAnchoring:alignment = "${r.ar.planeAnchoring.alignment}"
	`:""}
`}function _R(){return`
		}
	}
}

`}function ER(r){let e=db();return e+=r,Kc(e)}function vR(r,e,t){const n="Object_"+r.id,i=fb(r.matrixWorld);return r.matrixWorld.determinant()<0&&console.warn("THREE.USDZExporter: USDZ does not support negative scales",r),`			def Xform "${n}" (
				prepend references = @./geometries/Geometry_${e.id}.usda@</Geometry>
				prepend apiSchemas = ["MaterialBindingAPI"]
			)
			{
				matrix4d xformOp:transform = ${i}
				uniform token[] xformOpOrder = ["xformOp:transform"]

				rel material:binding = </Materials/Material_${t.id}>
			}

`}function fb(r){const e=r.elements;return`( ${fc(e,0)}, ${fc(e,4)}, ${fc(e,8)}, ${fc(e,12)} )`}function fc(r,e){return`(${r[e+0]}, ${r[e+1]}, ${r[e+2]}, ${r[e+3]})`}function xR(r){return`
def "Geometry"
{
${yR(r)}
}
`}function yR(r){const e="Geometry",t=r.attributes,n=t.position.count;return`
	def Mesh "${e}"
	{
		int[] faceVertexCounts = [${SR(r)}]
		int[] faceVertexIndices = [${CR(r)}]
		normal3f[] normals = [${cd(t.normal,n)}] (
			interpolation = "vertex"
		)
		point3f[] points = [${cd(t.position,n)}]
${MR(t)}
		uniform token subdivisionScheme = "none"
	}
`}function SR(r){const e=r.index!==null?r.index.count:r.attributes.position.count;return Array(e/3).fill(3).join(", ")}function CR(r){const e=r.index,t=[];if(e!==null)for(let n=0;n<e.count;n++)t.push(e.getX(n));else{const n=r.attributes.position.count;for(let i=0;i<n;i++)t.push(i)}return t.join(", ")}function cd(r,e){if(r===void 0)return console.warn("USDZExporter: Normals missing."),Array(e).fill("(0, 0, 0)").join(", ");const t=[];for(let n=0;n<r.count;n++){const i=r.getX(n),s=r.getY(n),a=r.getZ(n);t.push(`(${i.toPrecision(Jt)}, ${s.toPrecision(Jt)}, ${a.toPrecision(Jt)})`)}return t.join(", ")}function IR(r){const e=[];for(let t=0;t<r.count;t++){const n=r.getX(t),i=r.getY(t);e.push(`(${n.toPrecision(Jt)}, ${1-i.toPrecision(Jt)})`)}return e.join(", ")}function MR(r){let e="";for(let n=0;n<4;n++){const i=n>0?n:"",s=r["uv"+i];s!==void 0&&(e+=`
		texCoord2f[] primvars:st${i} = [${IR(s)}] (
			interpolation = "vertex"
		)`)}const t=r.color;if(t!==void 0){const n=t.count;e+=`
	color3f[] primvars:displayColor = [${cd(t,n)}] (
		interpolation = "vertex"
		)`}return e}function wR(r,e,t=!1){const n=[];for(const i in r){const s=r[i];n.push(TR(s,e,t))}return`def "Materials"
{
${n.join("")}
}

`}function TR(r,e,t=!1){const i=[],s=[];function a(o,c,l){const u=o.source.id+"_"+o.flipY;e[u]=o;const h=o.channel>0?"st"+o.channel:"st",d={1e3:"repeat",1001:"clamp",1002:"mirror"},f=o.repeat.clone(),p=o.offset.clone(),g=o.rotation,m=Math.sin(g),A=Math.cos(g);return p.y=1-p.y-f.y,t?(p.x=p.x/f.x,p.y=p.y/f.y,p.x+=m/f.x,p.y+=A-1):(p.x+=m*f.x,p.y+=(1-A)*f.y),`
		def Shader "PrimvarReader_${c}"
		{
			uniform token info:id = "UsdPrimvarReader_float2"
			float2 inputs:fallback = (0.0, 0.0)
			token inputs:varname = "${h}"
			float2 outputs:result
		}

		def Shader "Transform2d_${c}"
		{
			uniform token info:id = "UsdTransform2d"
			token inputs:in.connect = </Materials/Material_${r.id}/PrimvarReader_${c}.outputs:result>
			float inputs:rotation = ${(g*(180/Math.PI)).toFixed(Jt)}
			float2 inputs:scale = ${Ym(f)}
			float2 inputs:translation = ${Ym(p)}
			float2 outputs:result
		}

		def Shader "Texture_${o.id}_${c}"
		{
			uniform token info:id = "UsdUVTexture"
			asset inputs:file = @textures/Texture_${u}.png@
			float2 inputs:st.connect = </Materials/Material_${r.id}/Transform2d_${c}.outputs:result>
			${l!==void 0?"float4 inputs:scale = "+RR(l):""}
			token inputs:sourceColorSpace = "${o.colorSpace===Bn?"raw":"sRGB"}"
			token inputs:wrapS = "${d[o.wrapS]}"
			token inputs:wrapT = "${d[o.wrapT]}"
			float outputs:r
			float outputs:g
			float outputs:b
			float3 outputs:rgb
			${r.transparent||r.alphaTest>0?"float outputs:a":""}
		}`}return r.side===Vt&&console.warn("THREE.USDZExporter: USDZ does not support double sided materials",r),r.map!==null?(i.push(`			color3f inputs:diffuseColor.connect = </Materials/Material_${r.id}/Texture_${r.map.id}_diffuse.outputs:rgb>`),r.transparent?i.push(`			float inputs:opacity.connect = </Materials/Material_${r.id}/Texture_${r.map.id}_diffuse.outputs:a>`):r.alphaTest>0&&(i.push(`			float inputs:opacity.connect = </Materials/Material_${r.id}/Texture_${r.map.id}_diffuse.outputs:a>`),i.push(`			float inputs:opacityThreshold = ${r.alphaTest}`)),s.push(a(r.map,"diffuse",r.color))):i.push(`			color3f inputs:diffuseColor = ${jm(r.color)}`),r.emissiveMap!==null?(i.push(`			color3f inputs:emissiveColor.connect = </Materials/Material_${r.id}/Texture_${r.emissiveMap.id}_emissive.outputs:rgb>`),s.push(a(r.emissiveMap,"emissive",new Me(r.emissive.r*r.emissiveIntensity,r.emissive.g*r.emissiveIntensity,r.emissive.b*r.emissiveIntensity)))):r.emissive.getHex()>0&&i.push(`			color3f inputs:emissiveColor = ${jm(r.emissive)}`),r.normalMap!==null&&(i.push(`			normal3f inputs:normal.connect = </Materials/Material_${r.id}/Texture_${r.normalMap.id}_normal.outputs:rgb>`),s.push(a(r.normalMap,"normal"))),r.aoMap!==null&&(i.push(`			float inputs:occlusion.connect = </Materials/Material_${r.id}/Texture_${r.aoMap.id}_occlusion.outputs:r>`),s.push(a(r.aoMap,"occlusion",new Me(r.aoMapIntensity,r.aoMapIntensity,r.aoMapIntensity)))),r.roughnessMap!==null?(i.push(`			float inputs:roughness.connect = </Materials/Material_${r.id}/Texture_${r.roughnessMap.id}_roughness.outputs:g>`),s.push(a(r.roughnessMap,"roughness",new Me(r.roughness,r.roughness,r.roughness)))):i.push(`			float inputs:roughness = ${r.roughness}`),r.metalnessMap!==null?(i.push(`			float inputs:metallic.connect = </Materials/Material_${r.id}/Texture_${r.metalnessMap.id}_metallic.outputs:b>`),s.push(a(r.metalnessMap,"metallic",new Me(r.metalness,r.metalness,r.metalness)))):i.push(`			float inputs:metallic = ${r.metalness}`),r.alphaMap!==null?(i.push(`			float inputs:opacity.connect = </Materials/Material_${r.id}/Texture_${r.alphaMap.id}_opacity.outputs:r>`),i.push("			float inputs:opacityThreshold = 0.0001"),s.push(a(r.alphaMap,"opacity"))):i.push(`			float inputs:opacity = ${r.opacity}`),r.isMeshPhysicalMaterial&&(r.clearcoatMap!==null?(i.push(`			float inputs:clearcoat.connect = </Materials/Material_${r.id}/Texture_${r.clearcoatMap.id}_clearcoat.outputs:r>`),s.push(a(r.clearcoatMap,"clearcoat",new Me(r.clearcoat,r.clearcoat,r.clearcoat)))):i.push(`			float inputs:clearcoat = ${r.clearcoat}`),r.clearcoatRoughnessMap!==null?(i.push(`			float inputs:clearcoatRoughness.connect = </Materials/Material_${r.id}/Texture_${r.clearcoatRoughnessMap.id}_clearcoatRoughness.outputs:g>`),s.push(a(r.clearcoatRoughnessMap,"clearcoatRoughness",new Me(r.clearcoatRoughness,r.clearcoatRoughness,r.clearcoatRoughness)))):i.push(`			float inputs:clearcoatRoughness = ${r.clearcoatRoughness}`),i.push(`			float inputs:ior = ${r.ior}`)),`
	def Material "Material_${r.id}"
	{
		def Shader "PreviewSurface"
		{
			uniform token info:id = "UsdPreviewSurface"
${i.join(`
`)}
			int inputs:useSpecularWorkflow = 0
			token outputs:surface
		}

		token outputs:surface.connect = </Materials/Material_${r.id}/PreviewSurface.outputs:surface>

${s.join(`
`)}

	}
`}function jm(r){return`(${r.r}, ${r.g}, ${r.b})`}function RR(r){return`(${r.r}, ${r.g}, ${r.b}, 1.0)`}function Ym(r){return`(${r.x}, ${r.y})`}function BR(r){const e=r.name?r.name:"Camera_"+r.id,t=fb(r.matrixWorld);return r.matrixWorld.determinant()<0&&console.warn("THREE.USDZExporter: USDZ does not support negative scales",r),r.isOrthographicCamera?`def Camera "${e}"
		{
			matrix4d xformOp:transform = ${t}
			uniform token[] xformOpOrder = ["xformOp:transform"]

			float2 clippingRange = (${r.near.toPrecision(Jt)}, ${r.far.toPrecision(Jt)})
			float horizontalAperture = ${((Math.abs(r.left)+Math.abs(r.right))*10).toPrecision(Jt)}
			float verticalAperture = ${((Math.abs(r.top)+Math.abs(r.bottom))*10).toPrecision(Jt)}
			token projection = "orthographic"
		}

	`:`def Camera "${e}"
		{
			matrix4d xformOp:transform = ${t}
			uniform token[] xformOpOrder = ["xformOp:transform"]

			float2 clippingRange = (${r.near.toPrecision(Jt)}, ${r.far.toPrecision(Jt)})
			float focalLength = ${r.getFocalLength().toPrecision(Jt)}
			float focusDistance = ${r.focus.toPrecision(Jt)}
			float horizontalAperture = ${r.getFilmWidth().toPrecision(Jt)}
			token projection = "perspective"
			float verticalAperture = ${r.getFilmHeight().toPrecision(Jt)}
		}

	`}/* @license
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
 */const DR=r=>e=>{try{const t=Ti(e),n=(t.length?t[0].terms:[]).filter(i=>i&&i.type==="ident").map(i=>i.value).filter(i=>r.indexOf(i)>-1);return new Set(n)}catch{}return new Set};/* @license
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
 */var ms=function(r,e,t,n){var i=arguments.length,s=i<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,t):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(r,e,t,n);else for(var o=r.length-1;o>=0;o--)(a=r[o])&&(s=(i<3?a(s):i>3?a(e,t,s):a(e,t))||s);return i>3&&s&&Object.defineProperty(e,t,s),s};let Km=!1,Jm=!1;const Zm="#model-viewer-no-ar-fallback",LR=DR(["quick-look","scene-viewer","webxr","none"]),FR="webxr scene-viewer quick-look",Tn={QUICK_LOOK:"quick-look",SCENE_VIEWER:"scene-viewer",WEBXR:"webxr",NONE:"none"},xi=Symbol("arButtonContainer"),eg=Symbol("enterARWithWebXR"),tg=Symbol("openSceneViewer"),ng=Symbol("openIOSARQuickLook"),PR=Symbol("canActivateAR"),pc=Symbol("arMode"),Kh=Symbol("arModes"),br=Symbol("arAnchor"),Ac=Symbol("preload"),mc=Symbol("onARButtonContainerClick"),Jh=Symbol("onARStatus"),Zh=Symbol("onARTracking"),eu=Symbol("onARTap"),Ta=Symbol("selectARMode"),tu=Symbol("triggerLoad"),UR=r=>{var e,t,n,i,s,a,o,c,l,u;class h extends r{constructor(){super(...arguments),this.ar=!1,this.arScale="auto",this.arUsdzMaxTextureSize="auto",this.arPlacement="floor",this.arModes=FR,this.iosSrc=null,this.xrEnvironment=!1,this[e]=!1,this[t]=this.shadowRoot.querySelector(".ar-button"),this[n]=document.createElement("a"),this[i]=new Set,this[s]=Tn.NONE,this[a]=!1,this[o]=f=>{f.preventDefault(),this.activateAR()},this[c]=({status:f})=>{(f===qi.NOT_PRESENTING||this[ct].arRenderer.presentedScene===this[ee])&&(this.setAttribute("ar-status",f),this.dispatchEvent(new CustomEvent("ar-status",{detail:{status:f}})),f===qi.NOT_PRESENTING?this.removeAttribute("ar-tracking"):f===qi.SESSION_STARTED&&this.setAttribute("ar-tracking",Yu.TRACKING))},this[l]=({status:f})=>{this.setAttribute("ar-tracking",f),this.dispatchEvent(new CustomEvent("ar-tracking",{detail:{status:f}}))},this[u]=f=>{f.data=="_apple_ar_quicklook_button_tapped"&&this.dispatchEvent(new CustomEvent("quick-look-button-tapped"))}}get canActivateAR(){return this[pc]!==Tn.NONE}connectedCallback(){super.connectedCallback(),this[ct].arRenderer.addEventListener("status",this[Jh]),this.setAttribute("ar-status",qi.NOT_PRESENTING),this[ct].arRenderer.addEventListener("tracking",this[Zh]),this[br].addEventListener("message",this[eu])}disconnectedCallback(){super.disconnectedCallback(),this[ct].arRenderer.removeEventListener("status",this[Jh]),this[ct].arRenderer.removeEventListener("tracking",this[Zh]),this[br].removeEventListener("message",this[eu])}update(f){super.update(f),f.has("arScale")&&(this[ee].canScale=this.arScale!=="fixed"),f.has("arPlacement")&&(this[ee].updateShadow(),this[Wt]()),f.has("arModes")&&(this[Kh]=LR(this.arModes)),(f.has("ar")||f.has("arModes")||f.has("src")||f.has("iosSrc")||f.has("arUsdzMaxTextureSize"))&&this[Ta]()}async activateAR(){switch(this[pc]){case Tn.QUICK_LOOK:await this[ng]();break;case Tn.WEBXR:await this[eg]();break;case Tn.SCENE_VIEWER:this[tg]();break;default:console.warn("No AR Mode can be activated. This is probably due to missing configuration or device capabilities");break}}async[(e=PR,t=xi,n=br,i=Kh,s=pc,a=Ac,o=mc,c=Jh,l=Zh,u=eu,Ta)](){var f;let p=Tn.NONE;if(this.ar){if(this.src!=null)for(const g of this[Kh]){if(g==="webxr"&&n0&&!Km&&await this[ct].arRenderer.supportsPresentation()){p=Tn.WEBXR;break}if(g==="scene-viewer"&&!Jm&&(JC||navigator.userAgentData&&navigator.userAgentData.getHighEntropyValues&&(!((f=(await navigator.userAgentData.getHighEntropyValues(["formFactor"])).formFactor)===null||f===void 0)&&f.includes("XR")))){p=Tn.SCENE_VIEWER;break}if(g==="quick-look"&&bp){p=Tn.QUICK_LOOK;break}}p===Tn.NONE&&this.iosSrc!=null&&bp&&(p=Tn.QUICK_LOOK)}if(p!==Tn.NONE)this[xi].classList.add("enabled"),this[xi].addEventListener("click",this[mc]);else if(this[xi].classList.contains("enabled")){this[xi].removeEventListener("click",this[mc]),this[xi].classList.remove("enabled");const g=qi.FAILED;this.setAttribute("ar-status",g),this.dispatchEvent(new CustomEvent("ar-status",{detail:{status:g}}))}this[pc]=p}async[eg](){console.log("Attempting to present in AR with WebXR..."),await this[tu]();try{this[xi].removeEventListener("click",this[mc]);const{arRenderer:f}=this[ct];f.placeOnWall=this.arPlacement==="wall",await f.present(this[ee],this.xrEnvironment)}catch(f){console.warn("Error while trying to present in AR with WebXR"),console.error(f),await this[ct].arRenderer.stopPresenting(),Km=!0,console.warn("Falling back to next ar-mode"),await this[Ta](),this.activateAR()}finally{this[Ta]()}}async[tu](){this.loaded||(this[Ac]=!0,this[Nr](),await iI(this,"load"),this[Ac]=!1)}[Yr](){return super[Yr]()||this[Ac]}[tg](){const f=self.location.toString(),p=new URL(f),g=new URL(this.src,f);g.hash&&(g.hash="");const m=new URLSearchParams(g.search);if(p.hash=Zm,m.set("mode","ar_preferred"),m.has("disable_occlusion")||m.set("disable_occlusion","true"),this.arScale==="fixed"&&m.set("resizable","false"),this.arPlacement==="wall"&&m.set("enable_vertical_placement","true"),m.has("sound")){const _=new URL(m.get("sound"),f);m.set("sound",_.toString())}if(m.has("link")){const _=new URL(m.get("link"),f);m.set("link",_.toString())}const A=`intent://arvr.google.com/scene-viewer/1.2?${m.toString()+"&file="+encodeURIComponent(g.toString())}#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(p.toString())};end;`,E=()=>{self.location.hash===Zm&&(Jm=!0,self.history.back(),console.warn("Error while trying to present in AR with Scene Viewer"),console.warn("Falling back to next ar-mode"),this[Ta]())};self.addEventListener("hashchange",E,{once:!0}),this[br].setAttribute("href",A),console.log("Attempting to present in AR with Scene Viewer..."),this[br].click()}async[ng](){const f=!this.iosSrc;this[xi].classList.remove("enabled");const p=f?await this.prepareUSDZ():this.iosSrc,g=new URL(p,self.location.toString());if(f){const E=self.location.toString(),_=new URL(E),b=new URL(this.src,_);b.hash&&(g.hash=b.hash)}this.arScale==="fixed"&&(g.hash&&(g.hash+="&"),g.hash+="allowsContentScaling=0");const m=this[br];m.setAttribute("rel","ar");const A=document.createElement("img");m.appendChild(A),m.setAttribute("href",g.toString()),f&&m.setAttribute("download","model.usdz"),m.style.display="none",m.isConnected||this.shadowRoot.appendChild(m),console.log("Attempting to present in AR with Quick Look..."),m.click(),m.removeChild(A),f&&URL.revokeObjectURL(p),this[xi].classList.add("enabled")}async prepareUSDZ(){const f=this[ks].beginActivity("usdz-conversion");await this[tu]();const{model:p,shadow:g,target:m}=this[ee];if(p==null)return"";let A=!1;g!=null&&(A=g.visible,g.visible=!1),f(.2);const E=new mR;m.remove(p),p.position.copy(m.position),p.updateWorldMatrix(!1,!0);const _=await E.parseAsync(p,{maxTextureSize:isNaN(this.arUsdzMaxTextureSize)?1/0:Math.max(parseInt(this.arUsdzMaxTextureSize),16)});p.position.set(0,0,0),m.add(p);const b=new Blob([_],{type:"model/vnd.usdz+zip"}),S=URL.createObjectURL(b);return f(1),g!=null&&(g.visible=A),S}}return ms([De({type:Boolean,attribute:"ar"})],h.prototype,"ar",void 0),ms([De({type:String,attribute:"ar-scale"})],h.prototype,"arScale",void 0),ms([De({type:String,attribute:"ar-usdz-max-texture-size"})],h.prototype,"arUsdzMaxTextureSize",void 0),ms([De({type:String,attribute:"ar-placement"})],h.prototype,"arPlacement",void 0),ms([De({type:String,attribute:"ar-modes"})],h.prototype,"arModes",void 0),ms([De({type:String,attribute:"ios-src"})],h.prototype,"iosSrc",void 0),ms([De({type:Boolean,attribute:"xr-environment"})],h.prototype,"xrEnvironment",void 0),h};/* @license
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
 */var nu=function(r,e,t,n){var i=arguments.length,s=i<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,t):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(r,e,t,n);else for(var o=r.length-1;o>=0;o--)(a=r[o])&&(s=(i<3?a(s):i>3?a(e,t,s):a(e,t))||s);return i>3&&s&&Object.defineProperty(e,t,s),s};const NR=100,OR="https://www.gstatic.com/draco/versioned/decoders/1.5.6/",kR="https://www.gstatic.com/basis-universal/versioned/2021-04-15-ba1c3e4/",QR="https://cdn.jsdelivr.net/npm/three@0.149.0/examples/jsm/loaders/LottieLoader.js",iu={AUTO:"auto"},ig={AUTO:"auto",EAGER:"eager"},_r=Symbol("defaultProgressBarElement"),su=Symbol("posterContainerElement"),Er=Symbol("defaultPosterElement"),Ra=Symbol("shouldDismissPoster"),ru=Symbol("hidePoster"),gc=Symbol("modelIsRevealed"),au=Symbol("updateProgressBar"),GR=Symbol("ariaLabelCallToAction"),ou=Symbol("onProgress"),HR=r=>{var e,t,n,i,s,a,o,c;class l extends r{static set dracoDecoderLocation(h){cn.setDRACODecoderLocation(h)}static get dracoDecoderLocation(){return cn.getDRACODecoderLocation()}static set ktx2TranscoderLocation(h){cn.setKTX2TranscoderLocation(h)}static get ktx2TranscoderLocation(){return cn.getKTX2TranscoderLocation()}static set meshoptDecoderLocation(h){cn.setMeshoptDecoderLocation(h)}static get meshoptDecoderLocation(){return cn.getMeshoptDecoderLocation()}static set lottieLoaderLocation(h){Vn.singleton.textureUtils.lottieLoaderUrl=h}static get lottieLoaderLocation(){return Vn.singleton.textureUtils.lottieLoaderUrl}static mapURLs(h){Vn.singleton.loader[_s].manager.setURLModifier(h)}dismissPoster(){this.loaded?this[ru]():(this[Ra]=!0,this[Nr]())}showPoster(){const h=this[su];if(h.classList.contains("show"))return;h.classList.add("show"),this[zn].classList.remove("show");const d=this[Er];d.removeAttribute("tabindex"),d.removeAttribute("aria-hidden");const f=this.modelIsVisible;this[gc]=!1,this[Xc](f)}getDimensions(){return Xi(this[ee].size)}getBoundingBoxCenter(){return Xi(this[ee].boundingBox.getCenter(new B))}constructor(...h){super(...h),this.poster=null,this.reveal=iu.AUTO,this.loading=ig.AUTO,this[e]=!1,this[t]=!1,this[n]=this.shadowRoot.querySelector(".slot.poster"),this[i]=this.shadowRoot.querySelector("#default-poster"),this[s]=this.shadowRoot.querySelector("#default-progress-bar > .bar"),this[a]=this[Er].getAttribute("aria-label"),this[o]=tI(m=>{const A=this[_r].parentNode;requestAnimationFrame(()=>{this[_r].style.transform=`scaleX(${m})`,m===0&&(A.removeChild(this[_r]),A.appendChild(this[_r])),this[_r].classList.toggle("hide",m===1)})},NR),this[c]=m=>{const A=m.detail.totalProgress,E=m.detail.reason;A===1&&(this[au].flush(),this.loaded&&(this[Ra]||this.reveal===iu.AUTO)&&this[ru]()),this[au](A),this.dispatchEvent(new CustomEvent("progress",{detail:{totalProgress:A,reason:E}}))};const d=self.ModelViewerElement||{},f=d.dracoDecoderLocation||OR;cn.setDRACODecoderLocation(f);const p=d.ktx2TranscoderLocation||kR;cn.setKTX2TranscoderLocation(p),d.meshoptDecoderLocation&&cn.setMeshoptDecoderLocation(d.meshoptDecoderLocation);const g=d.lottieLoaderLocation||QR;Vn.singleton.textureUtils.lottieLoaderUrl=g}connectedCallback(){super.connectedCallback(),this.loaded||this.showPoster(),this[ks].addEventListener("progress",this[ou])}disconnectedCallback(){super.disconnectedCallback(),this[ks].removeEventListener("progress",this[ou])}async updated(h){super.updated(h),h.has("poster")&&this.poster!=null&&(this[Er].style.backgroundImage=`url(${this.poster})`),h.has("alt")&&this[Er].setAttribute("aria-label",this[td]),(h.has("reveal")||h.has("loading"))&&this[Nr]()}[(e=gc,t=Ra,n=su,i=Er,s=_r,a=GR,o=au,c=ou,Yr)](){return!!this.src&&(this[Ra]||this.loading===ig.EAGER||this.reveal===iu.AUTO&&this[ys])}[ru](){this[Ra]=!1;const h=this[su];if(!h.classList.contains("show"))return;h.classList.remove("show"),this[zn].classList.add("show");const d=this.modelIsVisible;this[gc]=!0,this[Xc](d);const f=this.getRootNode();f&&f.activeElement===this&&this[zn].focus();const p=this[Er];p.setAttribute("aria-hidden","true"),p.tabIndex=-1,this.dispatchEvent(new CustomEvent("poster-dismissed"))}[Qs](){return super[Qs]()&&this[gc]}}return nu([De({type:String})],l.prototype,"poster",void 0),nu([De({type:String})],l.prototype,"reveal",void 0),nu([De({type:String})],l.prototype,"loading",void 0),l};/* @license
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
 */var cu=function(r,e,t,n){var i=arguments.length,s=i<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,t):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(r,e,t,n);else for(var o=r.length-1;o>=0;o--)(a=r[o])&&(s=(i<3?a(s):i>3?a(e,t,s):a(e,t))||s);return i>3&&s&&Object.defineProperty(e,t,s),s};const zR=Math.PI/32,VR=3e3,WR={basis:[al(Zt(zR,"rad"))],keywords:{auto:[null]}},vr=Symbol("autoRotateStartTime"),lu=Symbol("radiansPerSecond"),sg=Symbol("syncRotationRate"),hu=Symbol("onCameraChange"),qR=r=>{var e,t,n;class i extends r{constructor(){super(...arguments),this.autoRotate=!1,this.autoRotateDelay=VR,this.rotationPerSecond="auto",this[e]=performance.now(),this[t]=0,this[n]=a=>{this.autoRotate&&a.detail.source==="user-interaction"&&(this[vr]=performance.now())}}connectedCallback(){super.connectedCallback(),this.addEventListener("camera-change",this[hu]),this[vr]=performance.now()}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("camera-change",this[hu]),this[vr]=performance.now()}updated(a){super.updated(a),a.has("autoRotate")&&(this[vr]=performance.now())}[(e=vr,t=lu,sg)](a){this[lu]=a[0]}[ri](a,o){if(super[ri](a,o),!this.autoRotate||!this[Qs]()||this[ct].isPresenting)return;const c=Math.min(o,a-this[vr]-this.autoRotateDelay);c>0&&(this[ee].yaw=this.turntableRotation+this[lu]*c*.001)}get turntableRotation(){return this[ee].yaw}resetTurntableRotation(a=0){this[ee].yaw=a}}return n=hu,cu([De({type:Boolean,attribute:"auto-rotate"})],i.prototype,"autoRotate",void 0),cu([De({type:Number,attribute:"auto-rotate-delay"})],i.prototype,"autoRotateDelay",void 0),cu([zi({intrinsics:WR,updateHandler:sg}),De({type:String,attribute:"rotation-per-second"})],i.prototype,"rotationPerSecond",void 0),i};/* @license
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
 */const XR=eR(FT(qR(cI(Ow(UR(HR(ZT(po))))))));customElements.define("model-viewer",XR);export{EE as CanvasTexture,Bi as FileLoader,ci as Loader,XR as ModelViewerElement,Nt as NearestFilter};
//# sourceMappingURL=model-viewer-1H3FFQ_W.js.map
