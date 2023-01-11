/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const Ch=typeof window<"u"&&window.customElements!=null&&window.customElements.polyfillWrapFlushCallback!==void 0,Yc=(s,e,t=null)=>{for(;e!==t;){const n=e.nextSibling;s.removeChild(e),e=n}},Rn=`{{lit-${String(Math.random()).slice(2)}}}`,gm=`<!--${Rn}-->`,Ph=new RegExp(`${Rn}|${gm}`);class vm{constructor(e,t){this.parts=[],this.element=t;const n=[],i=[],r=document.createTreeWalker(t.content,133,null,!1);let a=0,o=-1,l=0;const{strings:c,values:{length:h}}=e;for(;l<h;){const u=r.nextNode();if(u!==null){if(o++,u.nodeType===1){if(u.hasAttributes()){const d=u.attributes,{length:p}=d;let m=0;for(let f=0;f<p;f++)Ih(d[f].name,"$lit$")&&m++;for(;m-- >0;){const f=c[l],g=gc.exec(f)[2],x=g.toLowerCase()+"$lit$",v=u.getAttribute(x);u.removeAttribute(x);const y=v.split(Ph);this.parts.push({type:"attribute",index:o,name:g,strings:y}),l+=y.length-1}}u.tagName==="TEMPLATE"&&(i.push(u),r.currentNode=u.content)}else if(u.nodeType===3){const d=u.data;if(d.indexOf(Rn)>=0){const p=u.parentNode,m=d.split(Ph),f=m.length-1;for(let g=0;g<f;g++){let x,v=m[g];if(v==="")x=Xn();else{const y=gc.exec(v);y!==null&&Ih(y[2],"$lit$")&&(v=v.slice(0,y.index)+y[1]+y[2].slice(0,-5)+y[3]),x=document.createTextNode(v)}p.insertBefore(x,u),this.parts.push({type:"node",index:++o})}m[f]===""?(p.insertBefore(Xn(),u),n.push(u)):u.data=m[f],l+=f}}else if(u.nodeType===8)if(u.data===Rn){const d=u.parentNode;u.previousSibling!==null&&o!==a||(o++,d.insertBefore(Xn(),u)),a=o,this.parts.push({type:"node",index:o}),u.nextSibling===null?u.data="":(n.push(u),o--),l++}else{let d=-1;for(;(d=u.data.indexOf(Rn,d+1))!==-1;)this.parts.push({type:"node",index:-1}),l++}}else r.currentNode=i.pop()}for(const u of n)u.parentNode.removeChild(u)}}const Ih=(s,e)=>{const t=s.length-e.length;return t>=0&&s.slice(t)===e},ym=s=>s.index!==-1,Xn=()=>document.createComment(""),gc=/([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;function Dh(s,e){const{element:{content:t},parts:n}=s,i=document.createTreeWalker(t,133,null,!1);let r=ds(n),a=n[r],o=-1,l=0;const c=[];let h=null;for(;i.nextNode();){o++;const u=i.currentNode;for(u.previousSibling===h&&(h=null),e.has(u)&&(c.push(u),h===null&&(h=u)),h!==null&&l++;a!==void 0&&a.index===o;)a.index=h!==null?-1:a.index-l,r=ds(n,r),a=n[r]}c.forEach(u=>u.parentNode.removeChild(u))}const Rg=s=>{let e=s.nodeType===11?0:1;const t=document.createTreeWalker(s,133,null,!1);for(;t.nextNode();)e++;return e},ds=(s,e=-1)=>{for(let t=e+1;t<s.length;t++){const n=s[t];if(ym(n))return t}return-1};/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const Lg=new WeakMap,ws=s=>typeof s=="function"&&Lg.has(s),qt={},Nh={};/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */class vc{constructor(e,t,n){this.__parts=[],this.template=e,this.processor=t,this.options=n}update(e){let t=0;for(const n of this.__parts)n!==void 0&&n.setValue(e[t]),t++;for(const n of this.__parts)n!==void 0&&n.commit()}_clone(){const e=Ch?this.template.element.content.cloneNode(!0):document.importNode(this.template.element.content,!0),t=[],n=this.template.parts,i=document.createTreeWalker(e,133,null,!1);let r,a=0,o=0,l=i.nextNode();for(;a<n.length;)if(r=n[a],ym(r)){for(;o<r.index;)o++,l.nodeName==="TEMPLATE"&&(t.push(l),i.currentNode=l.content),(l=i.nextNode())===null&&(i.currentNode=t.pop(),l=i.nextNode());if(r.type==="node"){const c=this.processor.handleTextExpression(this.options);c.insertAfterNode(l.previousSibling),this.__parts.push(c)}else this.__parts.push(...this.processor.handleAttributeExpressions(l,r.name,r.strings,this.options));a++}else this.__parts.push(void 0),a++;return Ch&&(document.adoptNode(e),customElements.upgrade(e)),e}}/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const Fh=window.trustedTypes&&trustedTypes.createPolicy("lit-html",{createHTML:s=>s}),Cg=` ${Rn} `;class xm{constructor(e,t,n,i){this.strings=e,this.values=t,this.type=n,this.processor=i}getHTML(){const e=this.strings.length-1;let t="",n=!1;for(let i=0;i<e;i++){const r=this.strings[i],a=r.lastIndexOf("<!--");n=(a>-1||n)&&r.indexOf("-->",a+1)===-1;const o=gc.exec(r);t+=o===null?r+(n?Cg:gm):r.substr(0,o.index)+o[1]+o[2]+"$lit$"+o[3]+Rn}return t+=this.strings[e],t}getTemplateElement(){const e=document.createElement("template");let t=this.getHTML();return Fh!==void 0&&(t=Fh.createHTML(t)),e.innerHTML=t,e}}/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const Zc=s=>s===null||!(typeof s=="object"||typeof s=="function"),yc=s=>Array.isArray(s)||!(!s||!s[Symbol.iterator]);class bm{constructor(e,t,n){this.dirty=!0,this.element=e,this.name=t,this.strings=n,this.parts=[];for(let i=0;i<n.length-1;i++)this.parts[i]=this._createPart()}_createPart(){return new wm(this)}_getValue(){const e=this.strings,t=e.length-1,n=this.parts;if(t===1&&e[0]===""&&e[1]===""){const r=n[0].value;if(typeof r=="symbol")return String(r);if(typeof r=="string"||!yc(r))return r}let i="";for(let r=0;r<t;r++){i+=e[r];const a=n[r];if(a!==void 0){const o=a.value;if(Zc(o)||!yc(o))i+=typeof o=="string"?o:String(o);else for(const l of o)i+=typeof l=="string"?l:String(l)}}return i+=e[t],i}commit(){this.dirty&&(this.dirty=!1,this.element.setAttribute(this.name,this._getValue()))}}class wm{constructor(e){this.value=void 0,this.committer=e}setValue(e){e===qt||Zc(e)&&e===this.value||(this.value=e,ws(e)||(this.committer.dirty=!0))}commit(){for(;ws(this.value);){const e=this.value;this.value=qt,e(this)}this.value!==qt&&this.committer.commit()}}class no{constructor(e){this.value=void 0,this.__pendingValue=void 0,this.options=e}appendInto(e){this.startNode=e.appendChild(Xn()),this.endNode=e.appendChild(Xn())}insertAfterNode(e){this.startNode=e,this.endNode=e.nextSibling}appendIntoPart(e){e.__insert(this.startNode=Xn()),e.__insert(this.endNode=Xn())}insertAfterPart(e){e.__insert(this.startNode=Xn()),this.endNode=e.endNode,e.endNode=this.startNode}setValue(e){this.__pendingValue=e}commit(){if(this.startNode.parentNode===null)return;for(;ws(this.__pendingValue);){const t=this.__pendingValue;this.__pendingValue=qt,t(this)}const e=this.__pendingValue;e!==qt&&(Zc(e)?e!==this.value&&this.__commitText(e):e instanceof xm?this.__commitTemplateResult(e):e instanceof Node?this.__commitNode(e):yc(e)?this.__commitIterable(e):e===Nh?(this.value=Nh,this.clear()):this.__commitText(e))}__insert(e){this.endNode.parentNode.insertBefore(e,this.endNode)}__commitNode(e){this.value!==e&&(this.clear(),this.__insert(e),this.value=e)}__commitText(e){const t=this.startNode.nextSibling,n=typeof(e=e??"")=="string"?e:String(e);t===this.endNode.previousSibling&&t.nodeType===3?t.data=n:this.__commitNode(document.createTextNode(n)),this.value=e}__commitTemplateResult(e){const t=this.options.templateFactory(e);if(this.value instanceof vc&&this.value.template===t)this.value.update(e.values);else{const n=new vc(t,e.processor,this.options),i=n._clone();n.update(e.values),this.__commitNode(i),this.value=n}}__commitIterable(e){Array.isArray(this.value)||(this.value=[],this.clear());const t=this.value;let n,i=0;for(const r of e)n=t[i],n===void 0&&(n=new no(this.options),t.push(n),i===0?n.appendIntoPart(this):n.insertAfterPart(t[i-1])),n.setValue(r),n.commit(),i++;i<t.length&&(t.length=i,this.clear(n&&n.endNode))}clear(e=this.startNode){Yc(this.startNode.parentNode,e.nextSibling,this.endNode)}}class Pg{constructor(e,t,n){if(this.value=void 0,this.__pendingValue=void 0,n.length!==2||n[0]!==""||n[1]!=="")throw new Error("Boolean attributes can only contain a single expression");this.element=e,this.name=t,this.strings=n}setValue(e){this.__pendingValue=e}commit(){for(;ws(this.__pendingValue);){const t=this.__pendingValue;this.__pendingValue=qt,t(this)}if(this.__pendingValue===qt)return;const e=!!this.__pendingValue;this.value!==e&&(e?this.element.setAttribute(this.name,""):this.element.removeAttribute(this.name),this.value=e),this.__pendingValue=qt}}class Ig extends bm{constructor(e,t,n){super(e,t,n),this.single=n.length===2&&n[0]===""&&n[1]===""}_createPart(){return new Dg(this)}_getValue(){return this.single?this.parts[0].value:super._getValue()}commit(){this.dirty&&(this.dirty=!1,this.element[this.name]=this._getValue())}}class Dg extends wm{}let _m=!1;(()=>{try{const s={get capture(){return _m=!0,!1}};window.addEventListener("test",s,s),window.removeEventListener("test",s,s)}catch{}})();class Ng{constructor(e,t,n){this.value=void 0,this.__pendingValue=void 0,this.element=e,this.eventName=t,this.eventContext=n,this.__boundHandleEvent=i=>this.handleEvent(i)}setValue(e){this.__pendingValue=e}commit(){for(;ws(this.__pendingValue);){const r=this.__pendingValue;this.__pendingValue=qt,r(this)}if(this.__pendingValue===qt)return;const e=this.__pendingValue,t=this.value,n=e==null||t!=null&&(e.capture!==t.capture||e.once!==t.once||e.passive!==t.passive),i=e!=null&&(t==null||n);n&&this.element.removeEventListener(this.eventName,this.__boundHandleEvent,this.__options),i&&(this.__options=Fg(e),this.element.addEventListener(this.eventName,this.__boundHandleEvent,this.__options)),this.value=e,this.__pendingValue=qt}handleEvent(e){typeof this.value=="function"?this.value.call(this.eventContext||this.element,e):this.value.handleEvent(e)}}const Fg=s=>s&&(_m?{capture:s.capture,passive:s.passive,once:s.once}:s.capture);function Og(s){let e=_s.get(s.type);e===void 0&&(e={stringsArray:new WeakMap,keyString:new Map},_s.set(s.type,e));let t=e.stringsArray.get(s.strings);if(t!==void 0)return t;const n=s.strings.join(Rn);return t=e.keyString.get(n),t===void 0&&(t=new vm(s,s.getTemplateElement()),e.keyString.set(n,t)),e.stringsArray.set(s.strings,t),t}const _s=new Map,sr=new WeakMap,Mm=(s,e,t)=>{let n=sr.get(e);n===void 0&&(Yc(e,e.firstChild),sr.set(e,n=new no(Object.assign({templateFactory:Og},t))),n.appendInto(e)),n.setValue(s),n.commit()};/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const Ug=new class{handleAttributeExpressions(s,e,t,n){const i=e[0];return i==="."?new Ig(s,e.slice(1),t).parts:i==="@"?[new Ng(s,e.slice(1),n.eventContext)]:i==="?"?[new Pg(s,e.slice(1),t)]:new bm(s,e,t).parts}handleTextExpression(s){return new no(s)}};/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */typeof window<"u"&&(window.litHtmlVersions||(window.litHtmlVersions=[])).push("1.4.1");const ks=(s,...e)=>new xm(s,e,"html",Ug),Sm=(s,e)=>`${s}--${e}`;let qa=!0;window.ShadyCSS===void 0?qa=!1:window.ShadyCSS.prepareTemplateDom===void 0&&(console.warn("Incompatible ShadyCSS version detected. Please update to at least @webcomponents/webcomponentsjs@2.0.2 and @webcomponents/shadycss@1.3.1."),qa=!1);const kg=s=>e=>{const t=Sm(e.type,s);let n=_s.get(t);n===void 0&&(n={stringsArray:new WeakMap,keyString:new Map},_s.set(t,n));let i=n.stringsArray.get(e.strings);if(i!==void 0)return i;const r=e.strings.join(Rn);if(i=n.keyString.get(r),i===void 0){const a=e.getTemplateElement();qa&&window.ShadyCSS.prepareTemplateDom(a,s),i=new vm(e,a),n.keyString.set(r,i)}return n.stringsArray.set(e.strings,i),i},zg=["html","svg"],Tm=new Set,Bg=(s,e,t)=>{Tm.add(s);const n=t?t.element:document.createElement("template"),i=e.querySelectorAll("style"),{length:r}=i;if(r===0)return void window.ShadyCSS.prepareTemplateStyles(n,s);const a=document.createElement("style");for(let c=0;c<r;c++){const h=i[c];h.parentNode.removeChild(h),a.textContent+=h.textContent}(c=>{zg.forEach(h=>{const u=_s.get(Sm(h,c));u!==void 0&&u.keyString.forEach(d=>{const{element:{content:p}}=d,m=new Set;Array.from(p.querySelectorAll("style")).forEach(f=>{m.add(f)}),Dh(d,m)})})})(s);const o=n.content;t?function(c,h,u=null){const{element:{content:d},parts:p}=c;if(u==null)return void d.appendChild(h);const m=document.createTreeWalker(d,133,null,!1);let f=ds(p),g=0,x=-1;for(;m.nextNode();)for(x++,m.currentNode===u&&(g=Rg(h),u.parentNode.insertBefore(h,u));f!==-1&&p[f].index===x;){if(g>0){for(;f!==-1;)p[f].index+=g,f=ds(p,f);return}f=ds(p,f)}}(t,a,o.firstChild):o.insertBefore(a,o.firstChild),window.ShadyCSS.prepareTemplateStyles(n,s);const l=o.querySelector("style");if(window.ShadyCSS.nativeShadow&&l!==null)e.insertBefore(l.cloneNode(!0),e.firstChild);else if(t){o.insertBefore(a,o.firstChild);const c=new Set;c.add(a),Dh(t,c)}};window.JSCompiler_renameProperty=(s,e)=>s;const xc={toAttribute(s,e){switch(e){case Boolean:return s?"":null;case Object:case Array:return s==null?s:JSON.stringify(s)}return s},fromAttribute(s,e){switch(e){case Boolean:return s!==null;case Number:return s===null?null:Number(s);case Object:case Array:return JSON.parse(s)}return s}},Em=(s,e)=>e!==s&&(e==e||s==s),Mo={attribute:!0,type:String,converter:xc,reflect:!1,hasChanged:Em};class Jc extends HTMLElement{constructor(){super(),this.initialize()}static get observedAttributes(){this.finalize();const e=[];return this._classProperties.forEach((t,n)=>{const i=this._attributeNameForProperty(n,t);i!==void 0&&(this._attributeToPropertyMap.set(i,n),e.push(i))}),e}static _ensureClassProperties(){if(!this.hasOwnProperty(JSCompiler_renameProperty("_classProperties",this))){this._classProperties=new Map;const e=Object.getPrototypeOf(this)._classProperties;e!==void 0&&e.forEach((t,n)=>this._classProperties.set(n,t))}}static createProperty(e,t=Mo){if(this._ensureClassProperties(),this._classProperties.set(e,t),t.noAccessor||this.prototype.hasOwnProperty(e))return;const n=typeof e=="symbol"?Symbol():`__${e}`,i=this.getPropertyDescriptor(e,n,t);i!==void 0&&Object.defineProperty(this.prototype,e,i)}static getPropertyDescriptor(e,t,n){return{get(){return this[t]},set(i){const r=this[e];this[t]=i,this.requestUpdateInternal(e,r,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this._classProperties&&this._classProperties.get(e)||Mo}static finalize(){const e=Object.getPrototypeOf(this);if(e.hasOwnProperty("finalized")||e.finalize(),this.finalized=!0,this._ensureClassProperties(),this._attributeToPropertyMap=new Map,this.hasOwnProperty(JSCompiler_renameProperty("properties",this))){const t=this.properties,n=[...Object.getOwnPropertyNames(t),...typeof Object.getOwnPropertySymbols=="function"?Object.getOwnPropertySymbols(t):[]];for(const i of n)this.createProperty(i,t[i])}}static _attributeNameForProperty(e,t){const n=t.attribute;return n===!1?void 0:typeof n=="string"?n:typeof e=="string"?e.toLowerCase():void 0}static _valueHasChanged(e,t,n=Em){return n(e,t)}static _propertyValueFromAttribute(e,t){const n=t.type,i=t.converter||xc,r=typeof i=="function"?i:i.fromAttribute;return r?r(e,n):e}static _propertyValueToAttribute(e,t){if(t.reflect===void 0)return;const n=t.type,i=t.converter;return(i&&i.toAttribute||xc.toAttribute)(e,n)}initialize(){this._updateState=0,this._updatePromise=new Promise(e=>this._enableUpdatingResolver=e),this._changedProperties=new Map,this._saveInstanceProperties(),this.requestUpdateInternal()}_saveInstanceProperties(){this.constructor._classProperties.forEach((e,t)=>{if(this.hasOwnProperty(t)){const n=this[t];delete this[t],this._instanceProperties||(this._instanceProperties=new Map),this._instanceProperties.set(t,n)}})}_applyInstanceProperties(){this._instanceProperties.forEach((e,t)=>this[t]=e),this._instanceProperties=void 0}connectedCallback(){this.enableUpdating()}enableUpdating(){this._enableUpdatingResolver!==void 0&&(this._enableUpdatingResolver(),this._enableUpdatingResolver=void 0)}disconnectedCallback(){}attributeChangedCallback(e,t,n){t!==n&&this._attributeToProperty(e,n)}_propertyToAttribute(e,t,n=Mo){const i=this.constructor,r=i._attributeNameForProperty(e,n);if(r!==void 0){const a=i._propertyValueToAttribute(t,n);if(a===void 0)return;this._updateState=8|this._updateState,a==null?this.removeAttribute(r):this.setAttribute(r,a),this._updateState=-9&this._updateState}}_attributeToProperty(e,t){if(8&this._updateState)return;const n=this.constructor,i=n._attributeToPropertyMap.get(e);if(i!==void 0){const r=n.getPropertyOptions(i);this._updateState=16|this._updateState,this[i]=n._propertyValueFromAttribute(t,r),this._updateState=-17&this._updateState}}requestUpdateInternal(e,t,n){let i=!0;if(e!==void 0){const r=this.constructor;n=n||r.getPropertyOptions(e),r._valueHasChanged(this[e],t,n.hasChanged)?(this._changedProperties.has(e)||this._changedProperties.set(e,t),n.reflect!==!0||16&this._updateState||(this._reflectingProperties===void 0&&(this._reflectingProperties=new Map),this._reflectingProperties.set(e,n))):i=!1}!this._hasRequestedUpdate&&i&&(this._updatePromise=this._enqueueUpdate())}requestUpdate(e,t){return this.requestUpdateInternal(e,t),this.updateComplete}async _enqueueUpdate(){this._updateState=4|this._updateState;try{await this._updatePromise}catch{}const e=this.performUpdate();return e!=null&&await e,!this._hasRequestedUpdate}get _hasRequestedUpdate(){return 4&this._updateState}get hasUpdated(){return 1&this._updateState}performUpdate(){if(!this._hasRequestedUpdate)return;this._instanceProperties&&this._applyInstanceProperties();let e=!1;const t=this._changedProperties;try{e=this.shouldUpdate(t),e?this.update(t):this._markUpdated()}catch(n){throw e=!1,this._markUpdated(),n}e&&(1&this._updateState||(this._updateState=1|this._updateState,this.firstUpdated(t)),this.updated(t))}_markUpdated(){this._changedProperties=new Map,this._updateState=-5&this._updateState}get updateComplete(){return this._getUpdateComplete()}_getUpdateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._updatePromise}shouldUpdate(e){return!0}update(e){this._reflectingProperties!==void 0&&this._reflectingProperties.size>0&&(this._reflectingProperties.forEach((t,n)=>this._propertyToAttribute(n,this[n],t)),this._reflectingProperties=void 0),this._markUpdated()}updated(e){}firstUpdated(e){}}Jc.finalized=!0;/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const Hg=(s,e)=>e.kind==="method"&&e.descriptor&&!("value"in e.descriptor)?Object.assign(Object.assign({},e),{finisher(t){t.createProperty(e.key,s)}}):{kind:"field",key:Symbol(),placement:"own",descriptor:{},initializer(){typeof e.initializer=="function"&&(this[e.key]=e.initializer.call(this))},finisher(t){t.createProperty(e.key,s)}};function ye(s){return(e,t)=>t!==void 0?((n,i,r)=>{i.constructor.createProperty(r,n)})(s,e,t):Hg(s,e)}/**
@license
Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/const bc=window.ShadowRoot&&(window.ShadyCSS===void 0||window.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Am=Symbol();class Vg{constructor(e,t){if(t!==Am)throw new Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e}get styleSheet(){return this._styleSheet===void 0&&(bc?(this._styleSheet=new CSSStyleSheet,this._styleSheet.replaceSync(this.cssText)):this._styleSheet=null),this._styleSheet}toString(){return this.cssText}}/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */(window.litElementVersions||(window.litElementVersions=[])).push("2.5.1");const Oh={};class So extends Jc{static getStyles(){return this.styles}static _getUniqueStyles(){if(this.hasOwnProperty(JSCompiler_renameProperty("_styles",this)))return;const e=this.getStyles();if(Array.isArray(e)){const t=(r,a)=>r.reduceRight((o,l)=>Array.isArray(l)?t(l,o):(o.add(l),o),a),n=t(e,new Set),i=[];n.forEach(r=>i.unshift(r)),this._styles=i}else this._styles=e===void 0?[]:[e];this._styles=this._styles.map(t=>{if(t instanceof CSSStyleSheet&&!bc){const n=Array.prototype.slice.call(t.cssRules).reduce((i,r)=>i+r.cssText,"");return new Vg(String(n),Am)}return t})}initialize(){super.initialize(),this.constructor._getUniqueStyles(),this.renderRoot=this.createRenderRoot(),window.ShadowRoot&&this.renderRoot instanceof window.ShadowRoot&&this.adoptStyles()}createRenderRoot(){return this.attachShadow(this.constructor.shadowRootOptions)}adoptStyles(){const e=this.constructor._styles;e.length!==0&&(window.ShadyCSS===void 0||window.ShadyCSS.nativeShadow?bc?this.renderRoot.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet):this._needsShimAdoptedStyleSheets=!0:window.ShadyCSS.ScopingShim.prepareAdoptedCssText(e.map(t=>t.cssText),this.localName))}connectedCallback(){super.connectedCallback(),this.hasUpdated&&window.ShadyCSS!==void 0&&window.ShadyCSS.styleElement(this)}update(e){const t=this.render();super.update(e),t!==Oh&&this.constructor.render(t,this.renderRoot,{scopeName:this.localName,eventContext:this}),this._needsShimAdoptedStyleSheets&&(this._needsShimAdoptedStyleSheets=!1,this.constructor._styles.forEach(n=>{const i=document.createElement("style");i.textContent=n.cssText,this.renderRoot.appendChild(i)}))}render(){return Oh}}So.finalized=!0,So.render=(s,e,t)=>{if(!t||typeof t!="object"||!t.scopeName)throw new Error("The `scopeName` option is required.");const n=t.scopeName,i=sr.has(e),r=qa&&e.nodeType===11&&!!e.host,a=r&&!Tm.has(n),o=a?document.createDocumentFragment():e;if(Mm(s,o,Object.assign({templateFactory:kg(n)},t)),a){const l=sr.get(o);sr.delete(o);const c=l.value instanceof vc?l.value.template:void 0;Bg(n,o,c),Yc(e,e.firstChild),e.appendChild(o),sr.set(e,l)}!i&&r&&window.ShadyCSS.styleElement(e.host)},So.shadowRootOptions={mode:"open"};class At{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const n=this._listeners[e];if(n!==void 0){const i=n.indexOf(t);i!==-1&&n.splice(i,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const t=this._listeners[e.type];if(t!==void 0){e.target=this;const n=t.slice(0);for(let i=0,r=n.length;i<r;i++)n[i].call(this,e);e.target=null}}}const st=[];for(let s=0;s<256;s++)st[s]=(s<16?"0":"")+s.toString(16);let zs=1234567;const ps=Math.PI/180,Ms=180/Math.PI;function Dt(){const s=4294967295*Math.random()|0,e=4294967295*Math.random()|0,t=4294967295*Math.random()|0,n=4294967295*Math.random()|0;return(st[255&s]+st[s>>8&255]+st[s>>16&255]+st[s>>24&255]+"-"+st[255&e]+st[e>>8&255]+"-"+st[e>>16&15|64]+st[e>>24&255]+"-"+st[63&t|128]+st[t>>8&255]+"-"+st[t>>16&255]+st[t>>24&255]+st[255&n]+st[n>>8&255]+st[n>>16&255]+st[n>>24&255]).toUpperCase()}function mt(s,e,t){return Math.max(e,Math.min(t,s))}function wc(s,e){return(s%e+e)%e}function ms(s,e,t){return(1-t)*s+t*e}function _c(s){return(s&s-1)==0&&s!==0}function Rm(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function Lm(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}var Cm=Object.freeze({__proto__:null,DEG2RAD:ps,RAD2DEG:Ms,generateUUID:Dt,clamp:mt,euclideanModulo:wc,mapLinear:function(s,e,t,n,i){return n+(s-e)*(i-n)/(t-e)},inverseLerp:function(s,e,t){return s!==e?(t-s)/(e-s):0},lerp:ms,damp:function(s,e,t,n){return ms(s,e,1-Math.exp(-t*n))},pingpong:function(s,e=1){return e-Math.abs(wc(s,2*e)-e)},smoothstep:function(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e))*s*(3-2*s)},smootherstep:function(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e))*s*s*(s*(6*s-15)+10)},randInt:function(s,e){return s+Math.floor(Math.random()*(e-s+1))},randFloat:function(s,e){return s+Math.random()*(e-s)},randFloatSpread:function(s){return s*(.5-Math.random())},seededRandom:function(s){return s!==void 0&&(zs=s%2147483647),zs=16807*zs%2147483647,(zs-1)/2147483646},degToRad:function(s){return s*ps},radToDeg:function(s){return s*Ms},isPowerOfTwo:_c,ceilPowerOfTwo:Rm,floorPowerOfTwo:Lm,setQuaternionFromProperEuler:function(s,e,t,n,i){const r=Math.cos,a=Math.sin,o=r(t/2),l=a(t/2),c=r((e+n)/2),h=a((e+n)/2),u=r((e-n)/2),d=a((e-n)/2),p=r((n-e)/2),m=a((n-e)/2);switch(i){case"XYX":s.set(o*h,l*u,l*d,o*c);break;case"YZY":s.set(l*d,o*h,l*u,o*c);break;case"ZXZ":s.set(l*u,l*d,o*h,o*c);break;case"XZX":s.set(o*h,l*m,l*p,o*c);break;case"YXY":s.set(l*p,o*h,l*m,o*c);break;case"ZYZ":s.set(l*m,l*p,o*h,o*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+i)}}});class ${constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e,t){return t!==void 0?(console.warn("THREE.Vector2: .add() now only accepts one argument. Use .addVectors( a, b ) instead."),this.addVectors(e,t)):(this.x+=e.x,this.y+=e.y,this)}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e,t){return t!==void 0?(console.warn("THREE.Vector2: .sub() now only accepts one argument. Use .subVectors( a, b ) instead."),this.subVectors(e,t)):(this.x-=e.x,this.y-=e.y,this)}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=this.x<0?Math.ceil(this.x):Math.floor(this.x),this.y=this.y<0?Math.ceil(this.y):Math.floor(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t,n){return n!==void 0&&console.warn("THREE.Vector2: offset has been removed from .fromBufferAttribute()."),this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),i=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*i+e.x,this.y=r*i+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}$.prototype.isVector2=!0;class $e{constructor(){this.elements=[1,0,0,0,1,0,0,0,1],arguments.length>0&&console.error("THREE.Matrix3: the constructor no longer reads arguments. use .set() instead.")}set(e,t,n,i,r,a,o,l,c){const h=this.elements;return h[0]=e,h[1]=i,h[2]=o,h[3]=t,h[4]=r,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],u=n[7],d=n[2],p=n[5],m=n[8],f=i[0],g=i[3],x=i[6],v=i[1],y=i[4],b=i[7],w=i[2],S=i[5],M=i[8];return r[0]=a*f+o*v+l*w,r[3]=a*g+o*y+l*S,r[6]=a*x+o*b+l*M,r[1]=c*f+h*v+u*w,r[4]=c*g+h*y+u*S,r[7]=c*x+h*b+u*M,r[2]=d*f+p*v+m*w,r[5]=d*g+p*y+m*S,r[8]=d*x+p*b+m*M,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8];return t*a*h-t*o*c-n*r*h+n*o*l+i*r*c-i*a*l}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],u=h*a-o*c,d=o*l-h*r,p=c*r-a*l,m=t*u+n*d+i*p;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);const f=1/m;return e[0]=u*f,e[1]=(i*c-h*n)*f,e[2]=(o*n-i*a)*f,e[3]=d*f,e[4]=(h*t-i*l)*f,e[5]=(i*r-o*t)*f,e[6]=p*f,e[7]=(n*l-c*t)*f,e[8]=(a*t-n*r)*f,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,r,a,o){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-i*c,i*l,-i*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){const n=this.elements;return n[0]*=e,n[3]*=e,n[6]*=e,n[1]*=t,n[4]*=t,n[7]*=t,this}rotate(e){const t=Math.cos(e),n=Math.sin(e),i=this.elements,r=i[0],a=i[3],o=i[6],l=i[1],c=i[4],h=i[7];return i[0]=t*r+n*l,i[3]=t*a+n*c,i[6]=t*o+n*h,i[1]=-n*r+t*l,i[4]=-n*a+t*c,i[7]=-n*o+t*h,this}translate(e,t){const n=this.elements;return n[0]+=e*n[2],n[3]+=e*n[5],n[6]+=e*n[8],n[1]+=t*n[2],n[4]+=t*n[5],n[7]+=t*n[8],this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}function Pm(s){if(s.length===0)return-1/0;let e=s[0];for(let t=1,n=s.length;t<n;++t)s[t]>e&&(e=s[t]);return e}function io(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}let Ai;$e.prototype.isMatrix3=!0;class Qi{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Ai===void 0&&(Ai=io("canvas")),Ai.width=e.width,Ai.height=e.height;const n=Ai.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=Ai}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}}let Gg=0;class qe extends At{constructor(e=qe.DEFAULT_IMAGE,t=qe.DEFAULT_MAPPING,n=1001,i=1001,r=1006,a=1008,o=1023,l=1009,c=1,h=3e3){super(),Object.defineProperty(this,"id",{value:Gg++}),this.uuid=Dt(),this.name="",this.image=e,this.mipmaps=[],this.mapping=t,this.wrapS=n,this.wrapT=i,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new $(0,0),this.repeat=new $(1,1),this.center=new $(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new $e,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.encoding=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.image=e.image,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.encoding=e.encoding,this.userData=JSON.parse(JSON.stringify(e.userData)),this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.5,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,mapping:this.mapping,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,type:this.type,encoding:this.encoding,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};if(this.image!==void 0){const i=this.image;if(i.uuid===void 0&&(i.uuid=Dt()),!t&&e.images[i.uuid]===void 0){let r;if(Array.isArray(i)){r=[];for(let a=0,o=i.length;a<o;a++)i[a].isDataTexture?r.push(To(i[a].image)):r.push(To(i[a]))}else r=To(i);e.images[i.uuid]={uuid:i.uuid,url:r}}n.image=i.uuid}return JSON.stringify(this.userData)!=="{}"&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case 1e3:e.x=e.x-Math.floor(e.x);break;case 1001:e.x=e.x<0?0:1;break;case 1002:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x)}if(e.y<0||e.y>1)switch(this.wrapT){case 1e3:e.y=e.y-Math.floor(e.y);break;case 1001:e.y=e.y<0?0:1;break;case 1002:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y)}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&this.version++}}function To(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?Qi.getDataURL(s):s.data?{data:Array.prototype.slice.call(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}qe.DEFAULT_IMAGE=void 0,qe.DEFAULT_MAPPING=300,qe.prototype.isTexture=!0;class Ue{constructor(e=0,t=0,n=0,i=1){this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e,t){return t!==void 0?(console.warn("THREE.Vector4: .add() now only accepts one argument. Use .addVectors( a, b ) instead."),this.addVectors(e,t)):(this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this)}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e,t){return t!==void 0?(console.warn("THREE.Vector4: .sub() now only accepts one argument. Use .subVectors( a, b ) instead."),this.subVectors(e,t)):(this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this)}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*i+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*i+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*i+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*i+a[15]*r,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,i,r;const l=e.elements,c=l[0],h=l[4],u=l[8],d=l[1],p=l[5],m=l[9],f=l[2],g=l[6],x=l[10];if(Math.abs(h-d)<.01&&Math.abs(u-f)<.01&&Math.abs(m-g)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+f)<.1&&Math.abs(m+g)<.1&&Math.abs(c+p+x-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const y=(c+1)/2,b=(p+1)/2,w=(x+1)/2,S=(h+d)/4,M=(u+f)/4,L=(m+g)/4;return y>b&&y>w?y<.01?(n=0,i=.707106781,r=.707106781):(n=Math.sqrt(y),i=S/n,r=M/n):b>w?b<.01?(n=.707106781,i=0,r=.707106781):(i=Math.sqrt(b),n=S/i,r=L/i):w<.01?(n=.707106781,i=.707106781,r=0):(r=Math.sqrt(w),n=M/r,i=L/r),this.set(n,i,r,t),this}let v=Math.sqrt((g-m)*(g-m)+(u-f)*(u-f)+(d-h)*(d-h));return Math.abs(v)<.001&&(v=1),this.x=(g-m)/v,this.y=(u-f)/v,this.z=(d-h)/v,this.w=Math.acos((c+p+x-1)/2),this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=this.x<0?Math.ceil(this.x):Math.floor(this.x),this.y=this.y<0?Math.ceil(this.y):Math.floor(this.y),this.z=this.z<0?Math.ceil(this.z):Math.floor(this.z),this.w=this.w<0?Math.ceil(this.w):Math.floor(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t,n){return n!==void 0&&console.warn("THREE.Vector4: offset has been removed from .fromBufferAttribute()."),this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}Ue.prototype.isVector4=!0;class wt extends At{constructor(e,t,n={}){super(),this.width=e,this.height=t,this.depth=1,this.scissor=new Ue(0,0,e,t),this.scissorTest=!1,this.viewport=new Ue(0,0,e,t),this.texture=new qe(void 0,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.encoding),this.texture.isRenderTargetTexture=!0,this.texture.image={width:e,height:t,depth:1},this.texture.generateMipmaps=n.generateMipmaps!==void 0&&n.generateMipmaps,this.texture.internalFormat=n.internalFormat!==void 0?n.internalFormat:null,this.texture.minFilter=n.minFilter!==void 0?n.minFilter:1006,this.depthBuffer=n.depthBuffer===void 0||n.depthBuffer,this.stencilBuffer=n.stencilBuffer!==void 0&&n.stencilBuffer,this.depthTexture=n.depthTexture!==void 0?n.depthTexture:null}setTexture(e){e.image={width:this.width,height:this.height,depth:this.depth},this.texture=e}setSize(e,t,n=1){this.width===e&&this.height===t&&this.depth===n||(this.width=e,this.height=t,this.depth=n,this.texture.image.width=e,this.texture.image.height=t,this.texture.image.depth=n,this.dispose()),this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.width=e.width,this.height=e.height,this.depth=e.depth,this.viewport.copy(e.viewport),this.texture=e.texture.clone(),this.texture.image={...this.texture.image},this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.depthTexture=e.depthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}wt.prototype.isWebGLRenderTarget=!0;(class extends wt{constructor(s,e,t){super(s,e);const n=this.texture;this.texture=[];for(let i=0;i<t;i++)this.texture[i]=n.clone()}setSize(s,e,t=1){if(this.width!==s||this.height!==e||this.depth!==t){this.width=s,this.height=e,this.depth=t;for(let n=0,i=this.texture.length;n<i;n++)this.texture[n].image.width=s,this.texture[n].image.height=e,this.texture[n].image.depth=t;this.dispose()}return this.viewport.set(0,0,s,e),this.scissor.set(0,0,s,e),this}copy(s){this.dispose(),this.width=s.width,this.height=s.height,this.depth=s.depth,this.viewport.set(0,0,this.width,this.height),this.scissor.set(0,0,this.width,this.height),this.depthBuffer=s.depthBuffer,this.stencilBuffer=s.stencilBuffer,this.depthTexture=s.depthTexture,this.texture.length=0;for(let e=0,t=s.texture.length;e<t;e++)this.texture[e]=s.texture[e].clone();return this}}).prototype.isWebGLMultipleRenderTargets=!0;class $c extends wt{constructor(e,t,n={}){super(e,t,n),this.samples=4,this.ignoreDepthForMultisampleCopy=n.ignoreDepth===void 0||n.ignoreDepth,this.useRenderToTexture=n.useRenderToTexture!==void 0&&n.useRenderToTexture,this.useRenderbuffer=this.useRenderToTexture===!1}copy(e){return super.copy.call(this,e),this.samples=e.samples,this.useRenderToTexture=e.useRenderToTexture,this.useRenderbuffer=e.useRenderbuffer,this}}$c.prototype.isWebGLMultisampleRenderTarget=!0;class vt{constructor(e=0,t=0,n=0,i=1){this._x=e,this._y=t,this._z=n,this._w=i}static slerp(e,t,n,i){return console.warn("THREE.Quaternion: Static .slerp() has been deprecated. Use qm.slerpQuaternions( qa, qb, t ) instead."),n.slerpQuaternions(e,t,i)}static slerpFlat(e,t,n,i,r,a,o){let l=n[i+0],c=n[i+1],h=n[i+2],u=n[i+3];const d=r[a+0],p=r[a+1],m=r[a+2],f=r[a+3];if(o===0)return e[t+0]=l,e[t+1]=c,e[t+2]=h,void(e[t+3]=u);if(o===1)return e[t+0]=d,e[t+1]=p,e[t+2]=m,void(e[t+3]=f);if(u!==f||l!==d||c!==p||h!==m){let g=1-o;const x=l*d+c*p+h*m+u*f,v=x>=0?1:-1,y=1-x*x;if(y>Number.EPSILON){const w=Math.sqrt(y),S=Math.atan2(w,x*v);g=Math.sin(g*S)/w,o=Math.sin(o*S)/w}const b=o*v;if(l=l*g+d*b,c=c*g+p*b,h=h*g+m*b,u=u*g+f*b,g===1-o){const w=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=w,c*=w,h*=w,u*=w}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,i,r,a){const o=n[i],l=n[i+1],c=n[i+2],h=n[i+3],u=r[a],d=r[a+1],p=r[a+2],m=r[a+3];return e[t]=o*m+h*u+l*p-c*d,e[t+1]=l*m+h*d+c*u-o*p,e[t+2]=c*m+h*p+o*d-l*u,e[t+3]=h*m-o*u-l*d-c*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t){if(!e||!e.isEuler)throw new Error("THREE.Quaternion: .setFromEuler() now expects an Euler rotation rather than a Vector3 and order.");const n=e._x,i=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(i/2),u=o(r/2),d=l(n/2),p=l(i/2),m=l(r/2);switch(a){case"XYZ":this._x=d*h*u+c*p*m,this._y=c*p*u-d*h*m,this._z=c*h*m+d*p*u,this._w=c*h*u-d*p*m;break;case"YXZ":this._x=d*h*u+c*p*m,this._y=c*p*u-d*h*m,this._z=c*h*m-d*p*u,this._w=c*h*u+d*p*m;break;case"ZXY":this._x=d*h*u-c*p*m,this._y=c*p*u+d*h*m,this._z=c*h*m+d*p*u,this._w=c*h*u-d*p*m;break;case"ZYX":this._x=d*h*u-c*p*m,this._y=c*p*u+d*h*m,this._z=c*h*m-d*p*u,this._w=c*h*u+d*p*m;break;case"YZX":this._x=d*h*u+c*p*m,this._y=c*p*u+d*h*m,this._z=c*h*m-d*p*u,this._w=c*h*u-d*p*m;break;case"XZY":this._x=d*h*u-c*p*m,this._y=c*p*u-d*h*m,this._z=c*h*m+d*p*u,this._w=c*h*u+d*p*m;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t!==!1&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],i=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],h=t[6],u=t[10],d=n+o+u;if(d>0){const p=.5/Math.sqrt(d+1);this._w=.25/p,this._x=(h-l)*p,this._y=(r-c)*p,this._z=(a-i)*p}else if(n>o&&n>u){const p=2*Math.sqrt(1+n-o-u);this._w=(h-l)/p,this._x=.25*p,this._y=(i+a)/p,this._z=(r+c)/p}else if(o>u){const p=2*Math.sqrt(1+o-n-u);this._w=(r-c)/p,this._x=(i+a)/p,this._y=.25*p,this._z=(l+h)/p}else{const p=2*Math.sqrt(1+u-n-o);this._w=(a-i)/p,this._x=(r+c)/p,this._y=(l+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(mt(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e,t){return t!==void 0?(console.warn("THREE.Quaternion: .multiply() now only accepts one argument. Use .multiplyQuaternions( a, b ) instead."),this.multiplyQuaternions(e,t)):this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,i=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+a*o+i*c-r*l,this._y=i*h+a*l+r*o-n*c,this._z=r*h+a*c+n*l-i*o,this._w=a*h-n*o-i*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,i=this._y,r=this._z,a=this._w;let o=a*e._w+n*e._x+i*e._y+r*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=n,this._y=i,this._z=r,this;const l=1-o*o;if(l<=Number.EPSILON){const p=1-t;return this._w=p*a+t*this._w,this._x=p*n+t*this._x,this._y=p*i+t*this._y,this._z=p*r+t*this._z,this.normalize(),this._onChangeCallback(),this}const c=Math.sqrt(l),h=Math.atan2(c,o),u=Math.sin((1-t)*h)/c,d=Math.sin(t*h)/c;return this._w=a*u+this._w*d,this._x=n*u+this._x*d,this._y=i*u+this._y*d,this._z=r*u+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,n){this.copy(e).slerp(t,n)}random(){const e=Math.random(),t=Math.sqrt(1-e),n=Math.sqrt(e),i=2*Math.PI*Math.random(),r=2*Math.PI*Math.random();return this.set(t*Math.cos(i),n*Math.sin(r),n*Math.cos(r),t*Math.sin(i))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}}vt.prototype.isQuaternion=!0;class T{constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e,t){return t!==void 0?(console.warn("THREE.Vector3: .add() now only accepts one argument. Use .addVectors( a, b ) instead."),this.addVectors(e,t)):(this.x+=e.x,this.y+=e.y,this.z+=e.z,this)}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e,t){return t!==void 0?(console.warn("THREE.Vector3: .sub() now only accepts one argument. Use .subVectors( a, b ) instead."),this.subVectors(e,t)):(this.x-=e.x,this.y-=e.y,this.z-=e.z,this)}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e,t){return t!==void 0?(console.warn("THREE.Vector3: .multiply() now only accepts one argument. Use .multiplyVectors( a, b ) instead."),this.multiplyVectors(e,t)):(this.x*=e.x,this.y*=e.y,this.z*=e.z,this)}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return e&&e.isEuler||console.error("THREE.Vector3: .applyEuler() now expects an Euler rotation rather than a Vector3 and order."),this.applyQuaternion(Uh.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Uh.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*i,this.y=r[1]*t+r[4]*n+r[7]*i,this.z=r[2]*t+r[5]*n+r[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*i+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*i+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*i+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*i+r[14])*a,this}applyQuaternion(e){const t=this.x,n=this.y,i=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=l*t+a*i-o*n,h=l*n+o*t-r*i,u=l*i+r*n-a*t,d=-r*t-a*n-o*i;return this.x=c*l+d*-r+h*-o-u*-a,this.y=h*l+d*-a+u*-r-c*-o,this.z=u*l+d*-o+c*-a-h*-r,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*i,this.y=r[1]*t+r[5]*n+r[9]*i,this.z=r[2]*t+r[6]*n+r[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=this.x<0?Math.ceil(this.x):Math.floor(this.x),this.y=this.y<0?Math.ceil(this.y):Math.floor(this.y),this.z=this.z<0?Math.ceil(this.z):Math.floor(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e,t){return t!==void 0?(console.warn("THREE.Vector3: .cross() now only accepts one argument. Use .crossVectors( a, b ) instead."),this.crossVectors(e,t)):this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,i=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=i*l-r*o,this.y=r*a-n*l,this.z=n*o-i*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Eo.copy(this).projectOnVector(e),this.sub(Eo)}reflect(e){return this.sub(Eo.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(mt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,4*t)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,3*t)}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t,n){return n!==void 0&&console.warn("THREE.Vector3: offset has been removed from .fromBufferAttribute()."),this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=2*(Math.random()-.5),t=Math.random()*Math.PI*2,n=Math.sqrt(1-e**2);return this.x=n*Math.cos(t),this.y=n*Math.sin(t),this.z=e,this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}T.prototype.isVector3=!0;const Eo=new T,Uh=new vt;class ft{constructor(e=new T(1/0,1/0,1/0),t=new T(-1/0,-1/0,-1/0)){this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){let t=1/0,n=1/0,i=1/0,r=-1/0,a=-1/0,o=-1/0;for(let l=0,c=e.length;l<c;l+=3){const h=e[l],u=e[l+1],d=e[l+2];h<t&&(t=h),u<n&&(n=u),d<i&&(i=d),h>r&&(r=h),u>a&&(a=u),d>o&&(o=d)}return this.min.set(t,n,i),this.max.set(r,a,o),this}setFromBufferAttribute(e){let t=1/0,n=1/0,i=1/0,r=-1/0,a=-1/0,o=-1/0;for(let l=0,c=e.count;l<c;l++){const h=e.getX(l),u=e.getY(l),d=e.getZ(l);h<t&&(t=h),u<n&&(n=u),d<i&&(i=d),h>r&&(r=h),u>a&&(a=u),d>o&&(o=d)}return this.min.set(t,n,i),this.max.set(r,a,o),this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=Tr.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e){return this.makeEmpty(),this.expandByObject(e)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e){e.updateWorldMatrix(!1,!1);const t=e.geometry;t!==void 0&&(t.boundingBox===null&&t.computeBoundingBox(),Ao.copy(t.boundingBox),Ao.applyMatrix4(e.matrixWorld),this.union(Ao));const n=e.children;for(let i=0,r=n.length;i<r;i++)this.expandByObject(n[i]);return this}containsPoint(e){return!(e.x<this.min.x||e.x>this.max.x||e.y<this.min.y||e.y>this.max.y||e.z<this.min.z||e.z>this.max.z)}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return!(e.max.x<this.min.x||e.min.x>this.max.x||e.max.y<this.min.y||e.min.y>this.max.y||e.max.z<this.min.z||e.min.z>this.max.z)}intersectsSphere(e){return this.clampPoint(e.center,Tr),Tr.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Er),Bs.subVectors(this.max,Er),Ri.subVectors(e.a,Er),Li.subVectors(e.b,Er),Ci.subVectors(e.c,Er),Nn.subVectors(Li,Ri),Fn.subVectors(Ci,Li),ri.subVectors(Ri,Ci);let t=[0,-Nn.z,Nn.y,0,-Fn.z,Fn.y,0,-ri.z,ri.y,Nn.z,0,-Nn.x,Fn.z,0,-Fn.x,ri.z,0,-ri.x,-Nn.y,Nn.x,0,-Fn.y,Fn.x,0,-ri.y,ri.x,0];return!!Ro(t,Ri,Li,Ci,Bs)&&(t=[1,0,0,0,1,0,0,0,1],!!Ro(t,Ri,Li,Ci,Bs)&&(Hs.crossVectors(Nn,Fn),t=[Hs.x,Hs.y,Hs.z],Ro(t,Ri,Li,Ci,Bs)))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return Tr.copy(e).clamp(this.min,this.max).sub(e).length()}getBoundingSphere(e){return this.getCenter(e.center),e.radius=.5*this.getSize(Tr).length(),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()||(cn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),cn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),cn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),cn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),cn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),cn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),cn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),cn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(cn)),this}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}ft.prototype.isBox3=!0;const cn=[new T,new T,new T,new T,new T,new T,new T,new T],Tr=new T,Ao=new ft,Ri=new T,Li=new T,Ci=new T,Nn=new T,Fn=new T,ri=new T,Er=new T,Bs=new T,Hs=new T,si=new T;function Ro(s,e,t,n,i){for(let r=0,a=s.length-3;r<=a;r+=3){si.fromArray(s,r);const o=i.x*Math.abs(si.x)+i.y*Math.abs(si.y)+i.z*Math.abs(si.z),l=e.dot(si),c=t.dot(si),h=n.dot(si);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}const Wg=new ft,kh=new T,Vs=new T,Lo=new T;class ei{constructor(e=new T,t=-1){this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):Wg.setFromPoints(e).getCenter(n);let i=0;for(let r=0,a=e.length;r<a;r++)i=Math.max(i,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){Lo.subVectors(e,this.center);const t=Lo.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),i=.5*(n-this.radius);this.center.add(Lo.multiplyScalar(i/n)),this.radius+=i}return this}union(e){return this.center.equals(e.center)===!0?Vs.set(0,0,1).multiplyScalar(e.radius):Vs.subVectors(e.center,this.center).normalize().multiplyScalar(e.radius),this.expandByPoint(kh.copy(e.center).add(Vs)),this.expandByPoint(kh.copy(e.center).sub(Vs)),this}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const hn=new T,Co=new T,Gs=new T,On=new T,Po=new T,Ws=new T,Io=new T;class bi{constructor(e=new T,t=new T(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.direction).multiplyScalar(e).add(this.origin)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,hn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.direction).multiplyScalar(n).add(this.origin)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=hn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(hn.copy(this.direction).multiplyScalar(t).add(this.origin),hn.distanceToSquared(e))}distanceSqToSegment(e,t,n,i){Co.copy(e).add(t).multiplyScalar(.5),Gs.copy(t).sub(e).normalize(),On.copy(this.origin).sub(Co);const r=.5*e.distanceTo(t),a=-this.direction.dot(Gs),o=On.dot(this.direction),l=-On.dot(Gs),c=On.lengthSq(),h=Math.abs(1-a*a);let u,d,p,m;if(h>0)if(u=a*l-o,d=a*o-l,m=r*h,u>=0)if(d>=-m)if(d<=m){const f=1/h;u*=f,d*=f,p=u*(u+a*d+2*o)+d*(a*u+d+2*l)+c}else d=r,u=Math.max(0,-(a*d+o)),p=-u*u+d*(d+2*l)+c;else d=-r,u=Math.max(0,-(a*d+o)),p=-u*u+d*(d+2*l)+c;else d<=-m?(u=Math.max(0,-(-a*r+o)),d=u>0?-r:Math.min(Math.max(-r,-l),r),p=-u*u+d*(d+2*l)+c):d<=m?(u=0,d=Math.min(Math.max(-r,-l),r),p=d*(d+2*l)+c):(u=Math.max(0,-(a*r+o)),d=u>0?r:Math.min(Math.max(-r,-l),r),p=-u*u+d*(d+2*l)+c);else d=a>0?-r:r,u=Math.max(0,-(a*d+o)),p=-u*u+d*(d+2*l)+c;return n&&n.copy(this.direction).multiplyScalar(u).add(this.origin),i&&i.copy(Gs).multiplyScalar(d).add(Co),p}intersectSphere(e,t){hn.subVectors(e.center,this.origin);const n=hn.dot(this.direction),i=hn.dot(hn)-n*n,r=e.radius*e.radius;if(i>r)return null;const a=Math.sqrt(r-i),o=n-a,l=n+a;return o<0&&l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0?!0:e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,i,r,a,o,l;const c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,i=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,i=(e.min.x-d.x)*c),h>=0?(r=(e.min.y-d.y)*h,a=(e.max.y-d.y)*h):(r=(e.max.y-d.y)*h,a=(e.min.y-d.y)*h),n>a||r>i?null:((r>n||n!=n)&&(n=r),(a<i||i!=i)&&(i=a),u>=0?(o=(e.min.z-d.z)*u,l=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,l=(e.min.z-d.z)*u),n>l||o>i?null:((o>n||n!=n)&&(n=o),(l<i||i!=i)&&(i=l),i<0?null:this.at(n>=0?n:i,t)))}intersectsBox(e){return this.intersectBox(e,hn)!==null}intersectTriangle(e,t,n,i,r){Po.subVectors(t,e),Ws.subVectors(n,e),Io.crossVectors(Po,Ws);let a,o=this.direction.dot(Io);if(o>0){if(i)return null;a=1}else{if(!(o<0))return null;a=-1,o=-o}On.subVectors(this.origin,e);const l=a*this.direction.dot(Ws.crossVectors(On,Ws));if(l<0)return null;const c=a*this.direction.dot(Po.cross(On));if(c<0||l+c>o)return null;const h=-a*On.dot(Io);return h<0?null:this.at(h/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class he{constructor(){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],arguments.length>0&&console.error("THREE.Matrix4: the constructor no longer reads arguments. use .set() instead.")}set(e,t,n,i,r,a,o,l,c,h,u,d,p,m,f,g){const x=this.elements;return x[0]=e,x[4]=t,x[8]=n,x[12]=i,x[1]=r,x[5]=a,x[9]=o,x[13]=l,x[2]=c,x[6]=h,x[10]=u,x[14]=d,x[3]=p,x[7]=m,x[11]=f,x[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new he().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,i=1/Pi.setFromMatrixColumn(e,0).length(),r=1/Pi.setFromMatrixColumn(e,1).length(),a=1/Pi.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){e&&e.isEuler||console.error("THREE.Matrix4: .makeRotationFromEuler() now expects a Euler rotation rather than a Vector3 and order.");const t=this.elements,n=e.x,i=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(i),c=Math.sin(i),h=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){const d=a*h,p=a*u,m=o*h,f=o*u;t[0]=l*h,t[4]=-l*u,t[8]=c,t[1]=p+m*c,t[5]=d-f*c,t[9]=-o*l,t[2]=f-d*c,t[6]=m+p*c,t[10]=a*l}else if(e.order==="YXZ"){const d=l*h,p=l*u,m=c*h,f=c*u;t[0]=d+f*o,t[4]=m*o-p,t[8]=a*c,t[1]=a*u,t[5]=a*h,t[9]=-o,t[2]=p*o-m,t[6]=f+d*o,t[10]=a*l}else if(e.order==="ZXY"){const d=l*h,p=l*u,m=c*h,f=c*u;t[0]=d-f*o,t[4]=-a*u,t[8]=m+p*o,t[1]=p+m*o,t[5]=a*h,t[9]=f-d*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){const d=a*h,p=a*u,m=o*h,f=o*u;t[0]=l*h,t[4]=m*c-p,t[8]=d*c+f,t[1]=l*u,t[5]=f*c+d,t[9]=p*c-m,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){const d=a*l,p=a*c,m=o*l,f=o*c;t[0]=l*h,t[4]=f-d*u,t[8]=m*u+p,t[1]=u,t[5]=a*h,t[9]=-o*h,t[2]=-c*h,t[6]=p*u+m,t[10]=d-f*u}else if(e.order==="XZY"){const d=a*l,p=a*c,m=o*l,f=o*c;t[0]=l*h,t[4]=-u,t[8]=c*h,t[1]=d*u+f,t[5]=a*h,t[9]=p*u-m,t[2]=m*u-p,t[6]=o*h,t[10]=f*u+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(jg,e,qg)}lookAt(e,t,n){const i=this.elements;return Mt.subVectors(e,t),Mt.lengthSq()===0&&(Mt.z=1),Mt.normalize(),Un.crossVectors(n,Mt),Un.lengthSq()===0&&(Math.abs(n.z)===1?Mt.x+=1e-4:Mt.z+=1e-4,Mt.normalize(),Un.crossVectors(n,Mt)),Un.normalize(),js.crossVectors(Mt,Un),i[0]=Un.x,i[4]=js.x,i[8]=Mt.x,i[1]=Un.y,i[5]=js.y,i[9]=Mt.y,i[2]=Un.z,i[6]=js.z,i[10]=Mt.z,this}multiply(e,t){return t!==void 0?(console.warn("THREE.Matrix4: .multiply() now only accepts one argument. Use .multiplyMatrices( a, b ) instead."),this.multiplyMatrices(e,t)):this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],u=n[5],d=n[9],p=n[13],m=n[2],f=n[6],g=n[10],x=n[14],v=n[3],y=n[7],b=n[11],w=n[15],S=i[0],M=i[4],L=i[8],I=i[12],P=i[1],N=i[5],W=i[9],G=i[13],U=i[2],j=i[6],ne=i[10],ie=i[14],B=i[3],X=i[7],Z=i[11],te=i[15];return r[0]=a*S+o*P+l*U+c*B,r[4]=a*M+o*N+l*j+c*X,r[8]=a*L+o*W+l*ne+c*Z,r[12]=a*I+o*G+l*ie+c*te,r[1]=h*S+u*P+d*U+p*B,r[5]=h*M+u*N+d*j+p*X,r[9]=h*L+u*W+d*ne+p*Z,r[13]=h*I+u*G+d*ie+p*te,r[2]=m*S+f*P+g*U+x*B,r[6]=m*M+f*N+g*j+x*X,r[10]=m*L+f*W+g*ne+x*Z,r[14]=m*I+f*G+g*ie+x*te,r[3]=v*S+y*P+b*U+w*B,r[7]=v*M+y*N+b*j+w*X,r[11]=v*L+y*W+b*ne+w*Z,r[15]=v*I+y*G+b*ie+w*te,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],i=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],h=e[2],u=e[6],d=e[10],p=e[14];return e[3]*(+r*l*u-i*c*u-r*o*d+n*c*d+i*o*p-n*l*p)+e[7]*(+t*l*p-t*c*d+r*a*d-i*a*p+i*c*h-r*l*h)+e[11]*(+t*c*u-t*o*p-r*a*u+n*a*p+r*o*h-n*c*h)+e[15]*(-i*o*h-t*l*u+t*o*d+i*a*u-n*a*d+n*l*h)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const i=this.elements;return e.isVector3?(i[12]=e.x,i[13]=e.y,i[14]=e.z):(i[12]=e,i[13]=t,i[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],u=e[9],d=e[10],p=e[11],m=e[12],f=e[13],g=e[14],x=e[15],v=u*g*c-f*d*c+f*l*p-o*g*p-u*l*x+o*d*x,y=m*d*c-h*g*c-m*l*p+a*g*p+h*l*x-a*d*x,b=h*f*c-m*u*c+m*o*p-a*f*p-h*o*x+a*u*x,w=m*u*l-h*f*l-m*o*d+a*f*d+h*o*g-a*u*g,S=t*v+n*y+i*b+r*w;if(S===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const M=1/S;return e[0]=v*M,e[1]=(f*d*r-u*g*r-f*i*p+n*g*p+u*i*x-n*d*x)*M,e[2]=(o*g*r-f*l*r+f*i*c-n*g*c-o*i*x+n*l*x)*M,e[3]=(u*l*r-o*d*r-u*i*c+n*d*c+o*i*p-n*l*p)*M,e[4]=y*M,e[5]=(h*g*r-m*d*r+m*i*p-t*g*p-h*i*x+t*d*x)*M,e[6]=(m*l*r-a*g*r-m*i*c+t*g*c+a*i*x-t*l*x)*M,e[7]=(a*d*r-h*l*r+h*i*c-t*d*c-a*i*p+t*l*p)*M,e[8]=b*M,e[9]=(m*u*r-h*f*r-m*n*p+t*f*p+h*n*x-t*u*x)*M,e[10]=(a*f*r-m*o*r+m*n*c-t*f*c-a*n*x+t*o*x)*M,e[11]=(h*o*r-a*u*r-h*n*c+t*u*c+a*n*p-t*o*p)*M,e[12]=w*M,e[13]=(h*f*i-m*u*i+m*n*d-t*f*d-h*n*g+t*u*g)*M,e[14]=(m*o*i-a*f*i-m*n*l+t*f*l+a*n*g-t*o*g)*M,e[15]=(a*u*i-h*o*i+h*n*l-t*u*l-a*n*d+t*o*d)*M,this}scale(e){const t=this.elements,n=e.x,i=e.y,r=e.z;return t[0]*=n,t[4]*=i,t[8]*=r,t[1]*=n,t[5]*=i,t[9]*=r,t[2]*=n,t[6]*=i,t[10]*=r,t[3]*=n,t[7]*=i,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){return this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),i=Math.sin(t),r=1-n,a=e.x,o=e.y,l=e.z,c=r*a,h=r*o;return this.set(c*a+n,c*o-i*l,c*l+i*o,0,c*o+i*l,h*o+n,h*l-i*a,0,c*l-i*o,h*l+i*a,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,i,r,a){return this.set(1,n,r,0,e,1,a,0,t,i,1,0,0,0,0,1),this}compose(e,t,n){const i=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,h=a+a,u=o+o,d=r*c,p=r*h,m=r*u,f=a*h,g=a*u,x=o*u,v=l*c,y=l*h,b=l*u,w=n.x,S=n.y,M=n.z;return i[0]=(1-(f+x))*w,i[1]=(p+b)*w,i[2]=(m-y)*w,i[3]=0,i[4]=(p-b)*S,i[5]=(1-(d+x))*S,i[6]=(g+v)*S,i[7]=0,i[8]=(m+y)*M,i[9]=(g-v)*M,i[10]=(1-(d+f))*M,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){const i=this.elements;let r=Pi.set(i[0],i[1],i[2]).length();const a=Pi.set(i[4],i[5],i[6]).length(),o=Pi.set(i[8],i[9],i[10]).length();this.determinant()<0&&(r=-r),e.x=i[12],e.y=i[13],e.z=i[14],Bt.copy(this);const l=1/r,c=1/a,h=1/o;return Bt.elements[0]*=l,Bt.elements[1]*=l,Bt.elements[2]*=l,Bt.elements[4]*=c,Bt.elements[5]*=c,Bt.elements[6]*=c,Bt.elements[8]*=h,Bt.elements[9]*=h,Bt.elements[10]*=h,t.setFromRotationMatrix(Bt),n.x=r,n.y=a,n.z=o,this}makePerspective(e,t,n,i,r,a){a===void 0&&console.warn("THREE.Matrix4: .makePerspective() has been redefined and has a new signature. Please check the docs.");const o=this.elements,l=2*r/(t-e),c=2*r/(n-i),h=(t+e)/(t-e),u=(n+i)/(n-i),d=-(a+r)/(a-r),p=-2*a*r/(a-r);return o[0]=l,o[4]=0,o[8]=h,o[12]=0,o[1]=0,o[5]=c,o[9]=u,o[13]=0,o[2]=0,o[6]=0,o[10]=d,o[14]=p,o[3]=0,o[7]=0,o[11]=-1,o[15]=0,this}makeOrthographic(e,t,n,i,r,a){const o=this.elements,l=1/(t-e),c=1/(n-i),h=1/(a-r),u=(t+e)*l,d=(n+i)*c,p=(a+r)*h;return o[0]=2*l,o[4]=0,o[8]=0,o[12]=-u,o[1]=0,o[5]=2*c,o[9]=0,o[13]=-d,o[2]=0,o[6]=0,o[10]=-2*h,o[14]=-p,o[3]=0,o[7]=0,o[11]=0,o[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}he.prototype.isMatrix4=!0;const Pi=new T,Bt=new he,jg=new T(0,0,0),qg=new T(1,1,1),Un=new T,js=new T,Mt=new T,zh=new he,Bh=new vt;class Zn{constructor(e=0,t=0,n=0,i=Zn.DefaultOrder){this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i=this._order){return this._x=e,this._y=t,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const i=e.elements,r=i[0],a=i[4],o=i[8],l=i[1],c=i[5],h=i[9],u=i[2],d=i[6],p=i[10];switch(t){case"XYZ":this._y=Math.asin(mt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-mt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(mt(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,p),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-mt(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,p),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(mt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(o,p));break;case"XZY":this._z=Math.asin(-mt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return zh.makeRotationFromQuaternion(e),this.setFromRotationMatrix(zh,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Bh.setFromEuler(this),this.setFromQuaternion(Bh,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}toVector3(e){return e?e.set(this._x,this._y,this._z):new T(this._x,this._y,this._z)}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}}Zn.prototype.isEuler=!0,Zn.DefaultOrder="XYZ",Zn.RotationOrders=["XYZ","YZX","ZXY","XZY","YXZ","ZYX"];class Kc{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!=0}isEnabled(e){return(this.mask&(1<<e|0))!=0}}let Xg=0;const Hh=new T,Ii=new vt,un=new he,qs=new T,Ar=new T,Yg=new T,Zg=new vt,Vh=new T(1,0,0),Gh=new T(0,1,0),Wh=new T(0,0,1),Jg={type:"added"},jh={type:"removed"};class Re extends At{constructor(){super(),Object.defineProperty(this,"id",{value:Xg++}),this.uuid=Dt(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Re.DefaultUp.clone();const e=new T,t=new Zn,n=new vt,i=new T(1,1,1);t._onChange(function(){n.setFromEuler(t,!1)}),n._onChange(function(){t.setFromQuaternion(n,void 0,!1)}),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new he},normalMatrix:{value:new $e}}),this.matrix=new he,this.matrixWorld=new he,this.matrixAutoUpdate=Re.DefaultMatrixAutoUpdate,this.matrixWorldNeedsUpdate=!1,this.layers=new Kc,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Ii.setFromAxisAngle(e,t),this.quaternion.multiply(Ii),this}rotateOnWorldAxis(e,t){return Ii.setFromAxisAngle(e,t),this.quaternion.premultiply(Ii),this}rotateX(e){return this.rotateOnAxis(Vh,e)}rotateY(e){return this.rotateOnAxis(Gh,e)}rotateZ(e){return this.rotateOnAxis(Wh,e)}translateOnAxis(e,t){return Hh.copy(e).applyQuaternion(this.quaternion),this.position.add(Hh.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Vh,e)}translateY(e){return this.translateOnAxis(Gh,e)}translateZ(e){return this.translateOnAxis(Wh,e)}localToWorld(e){return e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return e.applyMatrix4(un.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?qs.copy(e):qs.set(e,t,n);const i=this.parent;this.updateWorldMatrix(!0,!1),Ar.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?un.lookAt(Ar,qs,this.up):un.lookAt(qs,Ar,this.up),this.quaternion.setFromRotationMatrix(un),i&&(un.extractRotation(i.matrixWorld),Ii.setFromRotationMatrix(un),this.quaternion.premultiply(Ii.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.parent!==null&&e.parent.remove(e),e.parent=this,this.children.push(e),e.dispatchEvent(Jg)):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(jh)),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){for(let e=0;e<this.children.length;e++){const t=this.children[e];t.parent=null,t.dispatchEvent(jh)}return this.children.length=0,this}attach(e){return this.updateWorldMatrix(!0,!1),un.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),un.multiply(e.parent.matrixWorld)),e.applyMatrix4(un),this.add(e),e.updateWorldMatrix(!1,!0),this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){const r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ar,e,Yg),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ar,Zg,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),t===!0){const i=this.children;for(let r=0,a=i.length;r<a;r++)i[r].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{}},n.metadata={version:4.5,type:"Object",generator:"Object3D.toJSON"});const i={};function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),JSON.stringify(this.userData)!=="{}"&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&(i.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=r(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const u=l[c];r(e.shapes,u)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));i.material=o}else i.material=r(e.materials,this.material);if(this.children.length>0){i.children=[];for(let o=0;o<this.children.length;o++)i.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];i.animations.push(r(e.animations,l))}}if(t){const o=a(e.geometries),l=a(e.materials),c=a(e.textures),h=a(e.images),u=a(e.shapes),d=a(e.skeletons),p=a(e.animations);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),d.length>0&&(n.skeletons=d),p.length>0&&(n.animations=p)}return n.object=i,n;function a(o){const l=[];for(const c in o){const h=o[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const i=e.children[n];this.add(i.clone())}return this}}Re.DefaultUp=new T(0,1,0),Re.DefaultMatrixAutoUpdate=!0,Re.prototype.isObject3D=!0;const Ht=new T,dn=new T,Do=new T,pn=new T,Di=new T,Ni=new T,qh=new T,No=new T,Fo=new T,Oo=new T;class Ze{constructor(e=new T,t=new T,n=new T){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i.subVectors(n,t),Ht.subVectors(e,t),i.cross(Ht);const r=i.lengthSq();return r>0?i.multiplyScalar(1/Math.sqrt(r)):i.set(0,0,0)}static getBarycoord(e,t,n,i,r){Ht.subVectors(i,t),dn.subVectors(n,t),Do.subVectors(e,t);const a=Ht.dot(Ht),o=Ht.dot(dn),l=Ht.dot(Do),c=dn.dot(dn),h=dn.dot(Do),u=a*c-o*o;if(u===0)return r.set(-2,-1,-1);const d=1/u,p=(c*l-o*h)*d,m=(a*h-o*l)*d;return r.set(1-p-m,m,p)}static containsPoint(e,t,n,i){return this.getBarycoord(e,t,n,i,pn),pn.x>=0&&pn.y>=0&&pn.x+pn.y<=1}static getUV(e,t,n,i,r,a,o,l){return this.getBarycoord(e,t,n,i,pn),l.set(0,0),l.addScaledVector(r,pn.x),l.addScaledVector(a,pn.y),l.addScaledVector(o,pn.z),l}static isFrontFacing(e,t,n,i){return Ht.subVectors(n,t),dn.subVectors(e,t),Ht.cross(dn).dot(i)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}setFromAttributeAndIndices(e,t,n,i){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Ht.subVectors(this.c,this.b),dn.subVectors(this.a,this.b),.5*Ht.cross(dn).length()}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Ze.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return Ze.getBarycoord(e,this.a,this.b,this.c,t)}getUV(e,t,n,i,r){return Ze.getUV(e,this.a,this.b,this.c,t,n,i,r)}containsPoint(e){return Ze.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Ze.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,i=this.b,r=this.c;let a,o;Di.subVectors(i,n),Ni.subVectors(r,n),No.subVectors(e,n);const l=Di.dot(No),c=Ni.dot(No);if(l<=0&&c<=0)return t.copy(n);Fo.subVectors(e,i);const h=Di.dot(Fo),u=Ni.dot(Fo);if(h>=0&&u<=h)return t.copy(i);const d=l*u-h*c;if(d<=0&&l>=0&&h<=0)return a=l/(l-h),t.copy(n).addScaledVector(Di,a);Oo.subVectors(e,r);const p=Di.dot(Oo),m=Ni.dot(Oo);if(m>=0&&p<=m)return t.copy(r);const f=p*c-l*m;if(f<=0&&c>=0&&m<=0)return o=c/(c-m),t.copy(n).addScaledVector(Ni,o);const g=h*m-p*u;if(g<=0&&u-h>=0&&p-m>=0)return qh.subVectors(r,i),o=(u-h)/(u-h+(p-m)),t.copy(i).addScaledVector(qh,o);const x=1/(g+f+d);return a=f*x,o=d*x,t.copy(n).addScaledVector(Di,a).addScaledVector(Ni,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}let $g=0;class Je extends At{constructor(){super(),Object.defineProperty(this,"id",{value:$g++}),this.uuid=Dt(),this.name="",this.type="Material",this.fog=!0,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.format=1023,this.transparent=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=7680,this.stencilZFail=7680,this.stencilZPass=7680,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBuild(){}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn("THREE.Material: '"+t+"' parameter is undefined.");continue}if(t==="shading"){console.warn("THREE."+this.type+": .shading has been removed. Use the boolean .flatShading instead."),this.flatShading=n===1;continue}const i=this[t];i!==void 0?i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[t]=n:console.warn("THREE."+this.type+": '"+t+"' is not a property of this material.")}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.5,type:"Material",generator:"Material.toJSON"}};function i(r){const a=[];for(const o in r){const l=r[o];delete l.metadata,a.push(l)}return a}if(n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==1&&(n.blending=this.blending),this.side!==0&&(n.side=this.side),this.vertexColors&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.format!==1023&&(n.format=this.format),this.transparent===!0&&(n.transparent=this.transparent),n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.stencilWrite=this.stencilWrite,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,this.rotation&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaToCoverage===!0&&(n.alphaToCoverage=this.alphaToCoverage),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=this.premultipliedAlpha),this.wireframe===!0&&(n.wireframe=this.wireframe),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=this.flatShading),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),JSON.stringify(this.userData)!=="{}"&&(n.userData=this.userData),t){const r=i(e.textures),a=i(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.fog=e.fog,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.format=e.format,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const i=t.length;n=new Array(i);for(let r=0;r!==i;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}Je.prototype.isMaterial=!0;const Im={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Vt={h:0,s:0,l:0},Xs={h:0,s:0,l:0};function Uo(s,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?s+6*(e-s)*t:t<.5?e:t<2/3?s+6*(e-s)*(2/3-t):s}function ko(s){return s<.04045?.0773993808*s:Math.pow(.9478672986*s+.0521327014,2.4)}function zo(s){return s<.0031308?12.92*s:1.055*Math.pow(s,.41666)-.055}class le{constructor(e,t,n){return t===void 0&&n===void 0?this.set(e):this.setRGB(e,t,n)}set(e){return e&&e.isColor?this.copy(e):typeof e=="number"?this.setHex(e):typeof e=="string"&&this.setStyle(e),this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(255&e)/255,this}setRGB(e,t,n){return this.r=e,this.g=t,this.b=n,this}setHSL(e,t,n){if(e=wc(e,1),t=mt(t,0,1),n=mt(n,0,1),t===0)this.r=this.g=this.b=n;else{const i=n<=.5?n*(1+t):n+t-n*t,r=2*n-i;this.r=Uo(r,i,e+1/3),this.g=Uo(r,i,e),this.b=Uo(r,i,e-1/3)}return this}setStyle(e){function t(i){i!==void 0&&parseFloat(i)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let n;if(n=/^((?:rgb|hsl)a?)\(([^\)]*)\)/.exec(e)){let i;const r=n[1],a=n[2];switch(r){case"rgb":case"rgba":if(i=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return this.r=Math.min(255,parseInt(i[1],10))/255,this.g=Math.min(255,parseInt(i[2],10))/255,this.b=Math.min(255,parseInt(i[3],10))/255,t(i[4]),this;if(i=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return this.r=Math.min(100,parseInt(i[1],10))/100,this.g=Math.min(100,parseInt(i[2],10))/100,this.b=Math.min(100,parseInt(i[3],10))/100,t(i[4]),this;break;case"hsl":case"hsla":if(i=/^\s*(\d*\.?\d+)\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a)){const o=parseFloat(i[1])/360,l=parseInt(i[2],10)/100,c=parseInt(i[3],10)/100;return t(i[4]),this.setHSL(o,l,c)}}}else if(n=/^\#([A-Fa-f\d]+)$/.exec(e)){const i=n[1],r=i.length;if(r===3)return this.r=parseInt(i.charAt(0)+i.charAt(0),16)/255,this.g=parseInt(i.charAt(1)+i.charAt(1),16)/255,this.b=parseInt(i.charAt(2)+i.charAt(2),16)/255,this;if(r===6)return this.r=parseInt(i.charAt(0)+i.charAt(1),16)/255,this.g=parseInt(i.charAt(2)+i.charAt(3),16)/255,this.b=parseInt(i.charAt(4)+i.charAt(5),16)/255,this}return e&&e.length>0?this.setColorName(e):this}setColorName(e){const t=Im[e.toLowerCase()];return t!==void 0?this.setHex(t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=ko(e.r),this.g=ko(e.g),this.b=ko(e.b),this}copyLinearToSRGB(e){return this.r=zo(e.r),this.g=zo(e.g),this.b=zo(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(){return 255*this.r<<16^255*this.g<<8^255*this.b<<0}getHexString(){return("000000"+this.getHex().toString(16)).slice(-6)}getHSL(e){const t=this.r,n=this.g,i=this.b,r=Math.max(t,n,i),a=Math.min(t,n,i);let o,l;const c=(a+r)/2;if(a===r)o=0,l=0;else{const h=r-a;switch(l=c<=.5?h/(r+a):h/(2-r-a),r){case t:o=(n-i)/h+(n<i?6:0);break;case n:o=(i-t)/h+2;break;case i:o=(t-n)/h+4}o/=6}return e.h=o,e.s=l,e.l=c,e}getStyle(){return"rgb("+(255*this.r|0)+","+(255*this.g|0)+","+(255*this.b|0)+")"}offsetHSL(e,t,n){return this.getHSL(Vt),Vt.h+=e,Vt.s+=t,Vt.l+=n,this.setHSL(Vt.h,Vt.s,Vt.l),this}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Vt),e.getHSL(Xs);const n=ms(Vt.h,Xs.h,t),i=ms(Vt.s,Xs.s,t),r=ms(Vt.l,Xs.l,t);return this.setHSL(n,i,r),this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),e.normalized===!0&&(this.r/=255,this.g/=255,this.b/=255),this}toJSON(){return this.getHex()}}le.NAMES=Im,le.prototype.isColor=!0,le.prototype.r=1,le.prototype.g=1,le.prototype.b=1;class jt extends Je{constructor(e){super(),this.type="MeshBasicMaterial",this.color=new le(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this}}jt.prototype.isMeshBasicMaterial=!0;const ze=new T,Ys=new $;class ke{constructor(e,t,n){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n===!0,this.usage=35044,this.updateRange={offset:0,count:-1},this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,r=this.itemSize;i<r;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}copyColorsArray(e){const t=this.array;let n=0;for(let i=0,r=e.length;i<r;i++){let a=e[i];a===void 0&&(console.warn("THREE.BufferAttribute.copyColorsArray(): color is undefined",i),a=new le),t[n++]=a.r,t[n++]=a.g,t[n++]=a.b}return this}copyVector2sArray(e){const t=this.array;let n=0;for(let i=0,r=e.length;i<r;i++){let a=e[i];a===void 0&&(console.warn("THREE.BufferAttribute.copyVector2sArray(): vector is undefined",i),a=new $),t[n++]=a.x,t[n++]=a.y}return this}copyVector3sArray(e){const t=this.array;let n=0;for(let i=0,r=e.length;i<r;i++){let a=e[i];a===void 0&&(console.warn("THREE.BufferAttribute.copyVector3sArray(): vector is undefined",i),a=new T),t[n++]=a.x,t[n++]=a.y,t[n++]=a.z}return this}copyVector4sArray(e){const t=this.array;let n=0;for(let i=0,r=e.length;i<r;i++){let a=e[i];a===void 0&&(console.warn("THREE.BufferAttribute.copyVector4sArray(): vector is undefined",i),a=new Ue),t[n++]=a.x,t[n++]=a.y,t[n++]=a.z,t[n++]=a.w}return this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Ys.fromBufferAttribute(this,t),Ys.applyMatrix3(e),this.setXY(t,Ys.x,Ys.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)ze.fromBufferAttribute(this,t),ze.applyMatrix3(e),this.setXYZ(t,ze.x,ze.y,ze.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)ze.x=this.getX(t),ze.y=this.getY(t),ze.z=this.getZ(t),ze.applyMatrix4(e),this.setXYZ(t,ze.x,ze.y,ze.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)ze.x=this.getX(t),ze.y=this.getY(t),ze.z=this.getZ(t),ze.applyNormalMatrix(e),this.setXYZ(t,ze.x,ze.y,ze.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)ze.x=this.getX(t),ze.y=this.getY(t),ze.z=this.getZ(t),ze.transformDirection(e),this.setXYZ(t,ze.x,ze.y,ze.z);return this}set(e,t=0){return this.array.set(e,t),this}getX(e){return this.array[e*this.itemSize]}setX(e,t){return this.array[e*this.itemSize]=t,this}getY(e){return this.array[e*this.itemSize+1]}setY(e,t){return this.array[e*this.itemSize+1]=t,this}getZ(e){return this.array[e*this.itemSize+2]}setZ(e,t){return this.array[e*this.itemSize+2]=t,this}getW(e){return this.array[e*this.itemSize+3]}setW(e,t){return this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){return e*=this.itemSize,this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e*=this.itemSize,this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.prototype.slice.call(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==35044&&(e.usage=this.usage),this.updateRange.offset===0&&this.updateRange.count===-1||(e.updateRange=this.updateRange),e}}ke.prototype.isBufferAttribute=!0;class Dm extends ke{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class Nm extends ke{constructor(e,t,n){super(new Uint32Array(e),t,n)}}(class extends ke{constructor(s,e,t){super(new Uint16Array(s),e,t)}}).prototype.isFloat16BufferAttribute=!0;class Ke extends ke{constructor(e,t,n){super(new Float32Array(e),t,n)}}let Kg=0;const Lt=new he,Bo=new Re,Fi=new T,St=new ft,Rr=new ft,tt=new T;class Oe extends At{constructor(){super(),Object.defineProperty(this,"id",{value:Kg++}),this.uuid=Dt(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Pm(e)>65535?Nm:Dm)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new $e().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}const i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(e),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Lt.makeRotationFromQuaternion(e),this.applyMatrix4(Lt),this}rotateX(e){return Lt.makeRotationX(e),this.applyMatrix4(Lt),this}rotateY(e){return Lt.makeRotationY(e),this.applyMatrix4(Lt),this}rotateZ(e){return Lt.makeRotationZ(e),this.applyMatrix4(Lt),this}translate(e,t,n){return Lt.makeTranslation(e,t,n),this.applyMatrix4(Lt),this}scale(e,t,n){return Lt.makeScale(e,t,n),this.applyMatrix4(Lt),this}lookAt(e){return Bo.lookAt(e),Bo.updateMatrix(),this.applyMatrix4(Bo.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Fi).negate(),this.translate(Fi.x,Fi.y,Fi.z),this}setFromPoints(e){const t=[];for(let n=0,i=e.length;n<i;n++){const r=e[n];t.push(r.x,r.y,r.z||0)}return this.setAttribute("position",new Ke(t,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ft);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)return console.error('THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".',this),void this.boundingBox.set(new T(-1/0,-1/0,-1/0),new T(1/0,1/0,1/0));if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){const r=t[n];St.setFromBufferAttribute(r),this.morphTargetsRelative?(tt.addVectors(this.boundingBox.min,St.min),this.boundingBox.expandByPoint(tt),tt.addVectors(this.boundingBox.max,St.max),this.boundingBox.expandByPoint(tt)):(this.boundingBox.expandByPoint(St.min),this.boundingBox.expandByPoint(St.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ei);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)return console.error('THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".',this),void this.boundingSphere.set(new T,1/0);if(e){const n=this.boundingSphere.center;if(St.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){const o=t[r];Rr.setFromBufferAttribute(o),this.morphTargetsRelative?(tt.addVectors(St.min,Rr.min),St.expandByPoint(tt),tt.addVectors(St.max,Rr.max),St.expandByPoint(tt)):(St.expandByPoint(Rr.min),St.expandByPoint(Rr.max))}St.getCenter(n);let i=0;for(let r=0,a=e.count;r<a;r++)tt.fromBufferAttribute(e,r),i=Math.max(i,n.distanceToSquared(tt));if(t)for(let r=0,a=t.length;r<a;r++){const o=t[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)tt.fromBufferAttribute(o,c),l&&(Fi.fromBufferAttribute(e,c),tt.add(Fi)),i=Math.max(i,n.distanceToSquared(tt))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0)return void console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");const n=e.array,i=t.position.array,r=t.normal.array,a=t.uv.array,o=i.length/3;t.tangent===void 0&&this.setAttribute("tangent",new ke(new Float32Array(4*o),4));const l=t.tangent.array,c=[],h=[];for(let P=0;P<o;P++)c[P]=new T,h[P]=new T;const u=new T,d=new T,p=new T,m=new $,f=new $,g=new $,x=new T,v=new T;function y(P,N,W){u.fromArray(i,3*P),d.fromArray(i,3*N),p.fromArray(i,3*W),m.fromArray(a,2*P),f.fromArray(a,2*N),g.fromArray(a,2*W),d.sub(u),p.sub(u),f.sub(m),g.sub(m);const G=1/(f.x*g.y-g.x*f.y);isFinite(G)&&(x.copy(d).multiplyScalar(g.y).addScaledVector(p,-f.y).multiplyScalar(G),v.copy(p).multiplyScalar(f.x).addScaledVector(d,-g.x).multiplyScalar(G),c[P].add(x),c[N].add(x),c[W].add(x),h[P].add(v),h[N].add(v),h[W].add(v))}let b=this.groups;b.length===0&&(b=[{start:0,count:n.length}]);for(let P=0,N=b.length;P<N;++P){const W=b[P],G=W.start;for(let U=G,j=G+W.count;U<j;U+=3)y(n[U+0],n[U+1],n[U+2])}const w=new T,S=new T,M=new T,L=new T;function I(P){M.fromArray(r,3*P),L.copy(M);const N=c[P];w.copy(N),w.sub(M.multiplyScalar(M.dot(N))).normalize(),S.crossVectors(L,N);const W=S.dot(h[P])<0?-1:1;l[4*P]=w.x,l[4*P+1]=w.y,l[4*P+2]=w.z,l[4*P+3]=W}for(let P=0,N=b.length;P<N;++P){const W=b[P],G=W.start;for(let U=G,j=G+W.count;U<j;U+=3)I(n[U+0]),I(n[U+1]),I(n[U+2])}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new ke(new Float32Array(3*t.count),3),this.setAttribute("normal",n);else for(let d=0,p=n.count;d<p;d++)n.setXYZ(d,0,0,0);const i=new T,r=new T,a=new T,o=new T,l=new T,c=new T,h=new T,u=new T;if(e)for(let d=0,p=e.count;d<p;d+=3){const m=e.getX(d+0),f=e.getX(d+1),g=e.getX(d+2);i.fromBufferAttribute(t,m),r.fromBufferAttribute(t,f),a.fromBufferAttribute(t,g),h.subVectors(a,r),u.subVectors(i,r),h.cross(u),o.fromBufferAttribute(n,m),l.fromBufferAttribute(n,f),c.fromBufferAttribute(n,g),o.add(h),l.add(h),c.add(h),n.setXYZ(m,o.x,o.y,o.z),n.setXYZ(f,l.x,l.y,l.z),n.setXYZ(g,c.x,c.y,c.z)}else for(let d=0,p=t.count;d<p;d+=3)i.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),a.fromBufferAttribute(t,d+2),h.subVectors(a,r),u.subVectors(i,r),h.cross(u),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}merge(e,t){if(!e||!e.isBufferGeometry)return void console.error("THREE.BufferGeometry.merge(): geometry not an instance of THREE.BufferGeometry.",e);t===void 0&&(t=0,console.warn("THREE.BufferGeometry.merge(): Overwriting original geometry, starting at offset=0. Use BufferGeometryUtils.mergeBufferGeometries() for lossless merge."));const n=this.attributes;for(const i in n){if(e.attributes[i]===void 0)continue;const r=n[i].array,a=e.attributes[i],o=a.array,l=a.itemSize*t,c=Math.min(o.length,r.length-l);for(let h=0,u=l;h<c;h++,u++)r[u]=o[h]}return this}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)tt.fromBufferAttribute(e,t),tt.normalize(),e.setXYZ(t,tt.x,tt.y,tt.z)}toNonIndexed(){function e(o,l){const c=o.array,h=o.itemSize,u=o.normalized,d=new c.constructor(l.length*h);let p=0,m=0;for(let f=0,g=l.length;f<g;f++){p=o.isInterleavedBufferAttribute?l[f]*o.data.stride+o.offset:l[f]*h;for(let x=0;x<h;x++)d[m++]=c[p++]}return new ke(d,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Oe,n=this.index.array,i=this.attributes;for(const o in i){const l=e(i[o],n);t.setAttribute(o,l)}const r=this.morphAttributes;for(const o in r){const l=[],c=r[o];for(let h=0,u=c.length;h<u;h++){const d=e(c[h],n);l.push(d)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.5,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const i={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let u=0,d=c.length;u<d;u++){const p=c[u];h.push(p.toJSON(e.data))}h.length>0&&(i[l]=h,r=!0)}r&&(e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone(t));const i=e.attributes;for(const c in i){const h=i[c];this.setAttribute(c,h.clone(t))}const r=e.morphAttributes;for(const c in r){const h=[],u=r[c];for(let d=0,p=u.length;d<p;d++)h.push(u[d].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let c=0,h=a.length;c<h;c++){const u=a[c];this.addGroup(u.start,u.count,u.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,e.parameters!==void 0&&(this.parameters=Object.assign({},e.parameters)),this}dispose(){this.dispatchEvent({type:"dispose"})}}Oe.prototype.isBufferGeometry=!0;const Xh=new he,Oi=new bi,Ho=new ei,kn=new T,zn=new T,Bn=new T,Vo=new T,Go=new T,Wo=new T,Zs=new T,Js=new T,$s=new T,Ks=new $,Qs=new $,ea=new $,jo=new T,ta=new T;class me extends Re{constructor(e=new Oe,t=new jt){super(),this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e){return super.copy(e),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=e.material,this.geometry=e.geometry,this}updateMorphTargets(){const e=this.geometry;if(e.isBufferGeometry){const t=e.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=i.length;r<a;r++){const o=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}else{const t=e.morphTargets;t!==void 0&&t.length>0&&console.error("THREE.Mesh.updateMorphTargets() no longer supports THREE.Geometry. Use THREE.BufferGeometry instead.")}}raycast(e,t){const n=this.geometry,i=this.material,r=this.matrixWorld;if(i===void 0||(n.boundingSphere===null&&n.computeBoundingSphere(),Ho.copy(n.boundingSphere),Ho.applyMatrix4(r),e.ray.intersectsSphere(Ho)===!1)||(Xh.copy(r).invert(),Oi.copy(e.ray).applyMatrix4(Xh),n.boundingBox!==null&&Oi.intersectsBox(n.boundingBox)===!1))return;let a;if(n.isBufferGeometry){const o=n.index,l=n.attributes.position,c=n.morphAttributes.position,h=n.morphTargetsRelative,u=n.attributes.uv,d=n.attributes.uv2,p=n.groups,m=n.drawRange;if(o!==null)if(Array.isArray(i))for(let f=0,g=p.length;f<g;f++){const x=p[f],v=i[x.materialIndex];for(let y=Math.max(x.start,m.start),b=Math.min(o.count,Math.min(x.start+x.count,m.start+m.count));y<b;y+=3){const w=o.getX(y),S=o.getX(y+1),M=o.getX(y+2);a=na(this,v,e,Oi,l,c,h,u,d,w,S,M),a&&(a.faceIndex=Math.floor(y/3),a.face.materialIndex=x.materialIndex,t.push(a))}}else for(let f=Math.max(0,m.start),g=Math.min(o.count,m.start+m.count);f<g;f+=3){const x=o.getX(f),v=o.getX(f+1),y=o.getX(f+2);a=na(this,i,e,Oi,l,c,h,u,d,x,v,y),a&&(a.faceIndex=Math.floor(f/3),t.push(a))}else if(l!==void 0)if(Array.isArray(i))for(let f=0,g=p.length;f<g;f++){const x=p[f],v=i[x.materialIndex];for(let y=Math.max(x.start,m.start),b=Math.min(l.count,Math.min(x.start+x.count,m.start+m.count));y<b;y+=3)a=na(this,v,e,Oi,l,c,h,u,d,y,y+1,y+2),a&&(a.faceIndex=Math.floor(y/3),a.face.materialIndex=x.materialIndex,t.push(a))}else for(let f=Math.max(0,m.start),g=Math.min(l.count,m.start+m.count);f<g;f+=3)a=na(this,i,e,Oi,l,c,h,u,d,f,f+1,f+2),a&&(a.faceIndex=Math.floor(f/3),t.push(a))}else n.isGeometry&&console.error("THREE.Mesh.raycast() no longer supports THREE.Geometry. Use THREE.BufferGeometry instead.")}}function na(s,e,t,n,i,r,a,o,l,c,h,u){kn.fromBufferAttribute(i,c),zn.fromBufferAttribute(i,h),Bn.fromBufferAttribute(i,u);const d=s.morphTargetInfluences;if(r&&d){Zs.set(0,0,0),Js.set(0,0,0),$s.set(0,0,0);for(let m=0,f=r.length;m<f;m++){const g=d[m],x=r[m];g!==0&&(Vo.fromBufferAttribute(x,c),Go.fromBufferAttribute(x,h),Wo.fromBufferAttribute(x,u),a?(Zs.addScaledVector(Vo,g),Js.addScaledVector(Go,g),$s.addScaledVector(Wo,g)):(Zs.addScaledVector(Vo.sub(kn),g),Js.addScaledVector(Go.sub(zn),g),$s.addScaledVector(Wo.sub(Bn),g)))}kn.add(Zs),zn.add(Js),Bn.add($s)}s.isSkinnedMesh&&(s.boneTransform(c,kn),s.boneTransform(h,zn),s.boneTransform(u,Bn));const p=function(m,f,g,x,v,y,b,w){let S;if(S=f.side===1?x.intersectTriangle(b,y,v,!0,w):x.intersectTriangle(v,y,b,f.side!==2,w),S===null)return null;ta.copy(w),ta.applyMatrix4(m.matrixWorld);const M=g.ray.origin.distanceTo(ta);return M<g.near||M>g.far?null:{distance:M,point:ta.clone(),object:m}}(s,e,t,n,kn,zn,Bn,jo);if(p){o&&(Ks.fromBufferAttribute(o,c),Qs.fromBufferAttribute(o,h),ea.fromBufferAttribute(o,u),p.uv=Ze.getUV(jo,kn,zn,Bn,Ks,Qs,ea,new $)),l&&(Ks.fromBufferAttribute(l,c),Qs.fromBufferAttribute(l,h),ea.fromBufferAttribute(l,u),p.uv2=Ze.getUV(jo,kn,zn,Bn,Ks,Qs,ea,new $));const m={a:c,b:h,c:u,normal:new T,materialIndex:0};Ze.getNormal(kn,zn,Bn,m.normal),p.face=m}return p}me.prototype.isMesh=!0;class ti extends Oe{constructor(e=1,t=1,n=1,i=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:i,heightSegments:r,depthSegments:a};const o=this;i=Math.floor(i),r=Math.floor(r),a=Math.floor(a);const l=[],c=[],h=[],u=[];let d=0,p=0;function m(f,g,x,v,y,b,w,S,M,L,I){const P=b/M,N=w/L,W=b/2,G=w/2,U=S/2,j=M+1,ne=L+1;let ie=0,B=0;const X=new T;for(let Z=0;Z<ne;Z++){const te=Z*N-G;for(let ee=0;ee<j;ee++){const ce=ee*P-W;X[f]=ce*v,X[g]=te*y,X[x]=U,c.push(X.x,X.y,X.z),X[f]=0,X[g]=0,X[x]=S>0?1:-1,h.push(X.x,X.y,X.z),u.push(ee/M),u.push(1-Z/L),ie+=1}}for(let Z=0;Z<L;Z++)for(let te=0;te<M;te++){const ee=d+te+j*Z,ce=d+te+j*(Z+1),R=d+(te+1)+j*(Z+1),E=d+(te+1)+j*Z;l.push(ee,ce,E),l.push(ce,R,E),B+=6}o.addGroup(p,B,I),p+=B,d+=ie}m("z","y","x",-1,-1,n,t,e,a,r,0),m("z","y","x",1,-1,n,t,-e,a,r,1),m("x","z","y",1,1,e,n,t,i,a,2),m("x","z","y",1,-1,e,n,-t,i,a,3),m("x","y","z",1,-1,e,t,n,i,r,4),m("x","y","z",-1,-1,e,t,-n,i,r,5),this.setIndex(l),this.setAttribute("position",new Ke(c,3)),this.setAttribute("normal",new Ke(h,3)),this.setAttribute("uv",new Ke(u,2))}static fromJSON(e){return new ti(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function cr(s){const e={};for(const t in s){e[t]={};for(const n in s[t]){const i=s[t][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?e[t][n]=i.clone():Array.isArray(i)?e[t][n]=i.slice():e[t][n]=i}}return e}function ht(s){const e={};for(let t=0;t<s.length;t++){const n=cr(s[t]);for(const i in n)e[i]=n[i]}return e}const Qg={clone:cr,merge:ht};class Pn extends Je{constructor(e){super(),this.type="ShaderMaterial",this.defines={},this.uniforms={},this.vertexShader=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,this.fragmentShader=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.extensions={derivatives:!1,fragDepth:!1,drawBuffers:!1,shaderTextureLOD:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv2:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&(e.attributes!==void 0&&console.error("THREE.ShaderMaterial: attributes should now be defined in THREE.BufferGeometry instead."),this.setValues(e))}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=cr(e.uniforms),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const i in this.uniforms){const r=this.uniforms[i].value;r&&r.isTexture?t.uniforms[i]={type:"t",value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[i]={type:"c",value:r.getHex()}:r&&r.isVector2?t.uniforms[i]={type:"v2",value:r.toArray()}:r&&r.isVector3?t.uniforms[i]={type:"v3",value:r.toArray()}:r&&r.isVector4?t.uniforms[i]={type:"v4",value:r.toArray()}:r&&r.isMatrix3?t.uniforms[i]={type:"m3",value:r.toArray()}:r&&r.isMatrix4?t.uniforms[i]={type:"m4",value:r.toArray()}:t.uniforms[i]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader;const n={};for(const i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}Pn.prototype.isShaderMaterial=!0;class Qc extends Re{constructor(){super(),this.type="Camera",this.matrixWorldInverse=new he,this.projectionMatrix=new he,this.projectionMatrixInverse=new he}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(-t[8],-t[9],-t[10]).normalize()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}Qc.prototype.isCamera=!0;class nt extends Qc{constructor(e=50,t=1,n=.1,i=2e3){super(),this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=2*Ms*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(.5*ps*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return 2*Ms*Math.atan(Math.tan(.5*ps*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}setViewOffset(e,t,n,i,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(.5*ps*this.fov)/this.zoom,n=2*t,i=this.aspect*n,r=-.5*i;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*i/l,t-=a.offsetY*n/c,i*=a.width/l,n*=a.height/c}const o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+i,t,t-n,e,this.far),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}nt.prototype.isPerspectiveCamera=!0;class Ss extends Re{constructor(e,t,n){if(super(),this.type="CubeCamera",n.isWebGLCubeRenderTarget!==!0)return void console.error("THREE.CubeCamera: The constructor now expects an instance of WebGLCubeRenderTarget as third parameter.");this.renderTarget=n;const i=new nt(90,1,e,t);i.layers=this.layers,i.up.set(0,-1,0),i.lookAt(new T(1,0,0)),this.add(i);const r=new nt(90,1,e,t);r.layers=this.layers,r.up.set(0,-1,0),r.lookAt(new T(-1,0,0)),this.add(r);const a=new nt(90,1,e,t);a.layers=this.layers,a.up.set(0,0,1),a.lookAt(new T(0,1,0)),this.add(a);const o=new nt(90,1,e,t);o.layers=this.layers,o.up.set(0,0,-1),o.lookAt(new T(0,-1,0)),this.add(o);const l=new nt(90,1,e,t);l.layers=this.layers,l.up.set(0,-1,0),l.lookAt(new T(0,0,1)),this.add(l);const c=new nt(90,1,e,t);c.layers=this.layers,c.up.set(0,-1,0),c.lookAt(new T(0,0,-1)),this.add(c)}update(e,t){this.parent===null&&this.updateMatrixWorld();const n=this.renderTarget,[i,r,a,o,l,c]=this.children,h=e.xr.enabled,u=e.getRenderTarget();e.xr.enabled=!1;const d=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0),e.render(t,i),e.setRenderTarget(n,1),e.render(t,r),e.setRenderTarget(n,2),e.render(t,a),e.setRenderTarget(n,3),e.render(t,o),e.setRenderTarget(n,4),e.render(t,l),n.texture.generateMipmaps=d,e.setRenderTarget(n,5),e.render(t,c),e.setRenderTarget(u),e.xr.enabled=h}}class ro extends qe{constructor(e,t,n,i,r,a,o,l,c,h){super(e=e!==void 0?e:[],t=t!==void 0?t:301,n,i,r,a,o,l,c,h),this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}ro.prototype.isCubeTexture=!0;class so extends wt{constructor(e,t,n){Number.isInteger(t)&&(console.warn("THREE.WebGLCubeRenderTarget: constructor signature is now WebGLCubeRenderTarget( size, options )"),t=n),super(e,e,t),t=t||{},this.texture=new ro(void 0,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.encoding),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0&&t.generateMipmaps,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:1006,this.texture._needsFlipEnvMap=!1}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.format=1023,this.texture.encoding=t.encoding,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},i=new ti(5,5,5),r=new Pn({name:"CubemapFromEquirect",uniforms:cr(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});r.uniforms.tEquirect.value=t;const a=new me(i,r),o=t.minFilter;return t.minFilter===1008&&(t.minFilter=1006),new Ss(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t,n,i){const r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,i);e.setRenderTarget(r)}}so.prototype.isWebGLCubeRenderTarget=!0;const qo=new T,e0=new T,t0=new $e;class Tn{constructor(e=new T(1,0,0),t=0){this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const i=qo.subVectors(n,t).cross(e0.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(this.normal).multiplyScalar(-this.distanceToPoint(e)).add(e)}intersectLine(e,t){const n=e.delta(qo),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/i;return r<0||r>1?null:t.copy(n).multiplyScalar(r).add(e.start)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||t0.getNormalMatrix(e),i=this.coplanarPoint(qo).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}Tn.prototype.isPlane=!0;const Ui=new ei,ia=new T;class ao{constructor(e=new Tn,t=new Tn,n=new Tn,i=new Tn,r=new Tn,a=new Tn){this.planes=[e,t,n,i,r,a]}set(e,t,n,i,r,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(i),o[4].copy(r),o[5].copy(a),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e){const t=this.planes,n=e.elements,i=n[0],r=n[1],a=n[2],o=n[3],l=n[4],c=n[5],h=n[6],u=n[7],d=n[8],p=n[9],m=n[10],f=n[11],g=n[12],x=n[13],v=n[14],y=n[15];return t[0].setComponents(o-i,u-l,f-d,y-g).normalize(),t[1].setComponents(o+i,u+l,f+d,y+g).normalize(),t[2].setComponents(o+r,u+c,f+p,y+x).normalize(),t[3].setComponents(o-r,u-c,f-p,y-x).normalize(),t[4].setComponents(o-a,u-h,f-m,y-v).normalize(),t[5].setComponents(o+a,u+h,f+m,y+v).normalize(),this}intersectsObject(e){const t=e.geometry;return t.boundingSphere===null&&t.computeBoundingSphere(),Ui.copy(t.boundingSphere).applyMatrix4(e.matrixWorld),this.intersectsSphere(Ui)}intersectsSprite(e){return Ui.center.set(0,0,0),Ui.radius=.7071067811865476,Ui.applyMatrix4(e.matrixWorld),this.intersectsSphere(Ui)}intersectsSphere(e){const t=this.planes,n=e.center,i=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const i=t[n];if(ia.x=i.normal.x>0?e.max.x:e.min.x,ia.y=i.normal.y>0?e.max.y:e.min.y,ia.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(ia)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function Fm(){let s=null,e=!1,t=null,n=null;function i(r,a){t(r,a),n=s.requestAnimationFrame(i)}return{start:function(){e!==!0&&t!==null&&(n=s.requestAnimationFrame(i),e=!0)},stop:function(){s.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){s=r}}}function n0(s,e){const t=e.isWebGL2,n=new WeakMap;return{get:function(i){return i.isInterleavedBufferAttribute&&(i=i.data),n.get(i)},remove:function(i){i.isInterleavedBufferAttribute&&(i=i.data);const r=n.get(i);r&&(s.deleteBuffer(r.buffer),n.delete(i))},update:function(i,r){if(i.isGLBufferAttribute){const o=n.get(i);return void((!o||o.version<i.version)&&n.set(i,{buffer:i.buffer,type:i.type,bytesPerElement:i.elementSize,version:i.version}))}i.isInterleavedBufferAttribute&&(i=i.data);const a=n.get(i);a===void 0?n.set(i,function(o,l){const c=o.array,h=o.usage,u=s.createBuffer();s.bindBuffer(l,u),s.bufferData(l,c,h),o.onUploadCallback();let d=5126;return c instanceof Float32Array?d=5126:c instanceof Float64Array?console.warn("THREE.WebGLAttributes: Unsupported data buffer format: Float64Array."):c instanceof Uint16Array?o.isFloat16BufferAttribute?t?d=5131:console.warn("THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2."):d=5123:c instanceof Int16Array?d=5122:c instanceof Uint32Array?d=5125:c instanceof Int32Array?d=5124:c instanceof Int8Array?d=5120:(c instanceof Uint8Array||c instanceof Uint8ClampedArray)&&(d=5121),{buffer:u,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version}}(i,r)):a.version<i.version&&(function(o,l,c){const h=l.array,u=l.updateRange;s.bindBuffer(c,o),u.count===-1?s.bufferSubData(c,0,h):(t?s.bufferSubData(c,u.offset*h.BYTES_PER_ELEMENT,h,u.offset,u.count):s.bufferSubData(c,u.offset*h.BYTES_PER_ELEMENT,h.subarray(u.offset,u.offset+u.count)),u.count=-1)}(a.buffer,i,r),a.version=i.version)}}}class Ti extends Oe{constructor(e=1,t=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:i};const r=e/2,a=t/2,o=Math.floor(n),l=Math.floor(i),c=o+1,h=l+1,u=e/o,d=t/l,p=[],m=[],f=[],g=[];for(let x=0;x<h;x++){const v=x*d-a;for(let y=0;y<c;y++){const b=y*u-r;m.push(b,-v,0),f.push(0,0,1),g.push(y/o),g.push(1-x/l)}}for(let x=0;x<l;x++)for(let v=0;v<o;v++){const y=v+c*x,b=v+c*(x+1),w=v+1+c*(x+1),S=v+1+c*x;p.push(y,b,S),p.push(b,w,S)}this.setIndex(p),this.setAttribute("position",new Ke(m,3)),this.setAttribute("normal",new Ke(f,3)),this.setAttribute("uv",new Ke(g,2))}static fromJSON(e){return new Ti(e.width,e.height,e.widthSegments,e.heightSegments)}}const _e={alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	if ( diffuseColor.a < alphaTest ) discard;
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vUv2 ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,begin_vertex:"vec3 transformed = vec3( position );",beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
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
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 f0, const in float f90, const in float roughness ) {
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
float G_BlinnPhong_Implicit( ) {
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
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vUv );
		vec2 dSTdy = dFdy( vUv );
		float Hll = bumpScale * texture2D( bumpMap, vUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = vec3( dFdx( surf_pos.x ), dFdx( surf_pos.y ), dFdx( surf_pos.z ) );
		vec3 vSigmaY = vec3( dFdy( surf_pos.x ), dFdy( surf_pos.y ), dFdy( surf_pos.z ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
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
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	varying vec3 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif`,common:`#define PI 3.141592653589793
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
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 color ) { return dot( color, vec3( 0.3333 ) ); }
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
struct GeometricContext {
	vec3 position;
	vec3 normal;
	vec3 viewDir;
#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal;
#endif
};
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
float linearToRelativeLuminance( const in vec3 color ) {
	vec3 weights = vec3( 0.2126, 0.7152, 0.0722 );
	return dot( weights, color.rgb );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}`,cube_uv_reflection_fragment:`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_maxMipLevel 8.0
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_maxTileSize 256.0
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
		float texelSize = 1.0 / ( 3.0 * cubeUV_maxTileSize );
		vec2 uv = getUV( direction, face ) * ( faceSize - 1.0 ) + 0.5;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		if ( mipInt < cubeUV_maxMipLevel ) {
			uv.y += 2.0 * cubeUV_maxTileSize;
		}
		uv.y += filterInt * 2.0 * cubeUV_minTileSize;
		uv.x += 3.0 * max( 0.0, cubeUV_maxTileSize - 2.0 * faceSize );
		uv *= texelSize;
		return texture2D( envMap, uv ).rgb;
	}
	#define r0 1.0
	#define v0 0.339
	#define m0 - 2.0
	#define r1 0.8
	#define v1 0.276
	#define m1 - 1.0
	#define r4 0.4
	#define v4 0.046
	#define m4 2.0
	#define r5 0.305
	#define v5 0.016
	#define m5 3.0
	#define r6 0.21
	#define v6 0.0038
	#define m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= r1 ) {
			mip = ( r0 - roughness ) * ( m1 - m0 ) / ( r0 - r1 ) + m0;
		} else if ( roughness >= r4 ) {
			mip = ( r1 - roughness ) * ( m4 - m1 ) / ( r1 - r4 ) + m1;
		} else if ( roughness >= r5 ) {
			mip = ( r4 - roughness ) * ( m5 - m4 ) / ( r4 - r5 ) + m4;
		} else if ( roughness >= r6 ) {
			mip = ( r5 - roughness ) * ( m6 - m5 ) / ( r5 - r6 ) + m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), m0, cubeUV_maxMipLevel );
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
#endif`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_INSTANCING
	mat3 m = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( m[ 0 ], m[ 0 ] ), dot( m[ 1 ], m[ 1 ] ), dot( m[ 2 ], m[ 2 ] ) );
	transformedNormal = m * transformedNormal;
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	vec3 transformedTangent = ( modelViewMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vUv );
	emissiveColor.rgb = emissiveMapTexelToLinear( emissiveColor ).rgb;
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,encodings_fragment:"gl_FragColor = linearToOutputTexel( gl_FragColor );",encodings_pars_fragment:`vec4 LinearToLinear( in vec4 value ) {
	return value;
}
vec4 sRGBToLinear( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 LinearTosRGB( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
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
		vec4 envColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
		envColor = envMapTexelToLinear( envColor );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 envColor = textureCubeUV( envMap, reflectVec, 0.0 );
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
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) ||defined( PHONG )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#if defined( USE_ENVMAP )
	#ifdef ENVMAP_MODE_REFRACTION
		uniform float refractionRatio;
	#endif
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#if defined( ENVMAP_TYPE_CUBE_UV )
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#if defined( ENVMAP_TYPE_CUBE_UV )
			vec3 reflectVec;
			#ifdef ENVMAP_MODE_REFLECTION
				reflectVec = reflect( - viewDir, normal );
				reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			#else
				reflectVec = refract( - viewDir, normal, refractionRatio );
			#endif
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
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
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		return ( coord.x < 0.7 ) ? vec3( 0.7 ) : vec3( 1.0 );
	#endif
}`,lightmap_fragment:`#ifdef USE_LIGHTMAP
	vec4 lightMapTexel = texture2D( lightMap, vUv2 );
	vec3 lightMapIrradiance = lightMapTexelToLinear( lightMapTexel ).rgb * lightMapIntensity;
	#ifndef PHYSICALLY_CORRECT_LIGHTS
		lightMapIrradiance *= PI;
	#endif
	reflectedLight.indirectDiffuse += lightMapIrradiance;
#endif`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_vertex:`vec3 diffuse = vec3( 1.0 );
GeometricContext geometry;
geometry.position = mvPosition.xyz;
geometry.normal = normalize( transformedNormal );
geometry.viewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( -mvPosition.xyz );
GeometricContext backGeometry;
backGeometry.position = geometry.position;
backGeometry.normal = -geometry.normal;
backGeometry.viewDir = geometry.viewDir;
vLightFront = vec3( 0.0 );
vIndirectFront = vec3( 0.0 );
#ifdef DOUBLE_SIDED
	vLightBack = vec3( 0.0 );
	vIndirectBack = vec3( 0.0 );
#endif
IncidentLight directLight;
float dotNL;
vec3 directLightColor_Diffuse;
vIndirectFront += getAmbientLightIrradiance( ambientLightColor );
vIndirectFront += getLightProbeIrradiance( lightProbe, geometry.normal );
#ifdef DOUBLE_SIDED
	vIndirectBack += getAmbientLightIrradiance( ambientLightColor );
	vIndirectBack += getLightProbeIrradiance( lightProbe, backGeometry.normal );
#endif
#if NUM_POINT_LIGHTS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		getPointLightInfo( pointLights[ i ], geometry, directLight );
		dotNL = dot( geometry.normal, directLight.direction );
		directLightColor_Diffuse = directLight.color;
		vLightFront += saturate( dotNL ) * directLightColor_Diffuse;
		#ifdef DOUBLE_SIDED
			vLightBack += saturate( - dotNL ) * directLightColor_Diffuse;
		#endif
	}
	#pragma unroll_loop_end
#endif
#if NUM_SPOT_LIGHTS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		getSpotLightInfo( spotLights[ i ], geometry, directLight );
		dotNL = dot( geometry.normal, directLight.direction );
		directLightColor_Diffuse = directLight.color;
		vLightFront += saturate( dotNL ) * directLightColor_Diffuse;
		#ifdef DOUBLE_SIDED
			vLightBack += saturate( - dotNL ) * directLightColor_Diffuse;
		#endif
	}
	#pragma unroll_loop_end
#endif
#if NUM_DIR_LIGHTS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		getDirectionalLightInfo( directionalLights[ i ], geometry, directLight );
		dotNL = dot( geometry.normal, directLight.direction );
		directLightColor_Diffuse = directLight.color;
		vLightFront += saturate( dotNL ) * directLightColor_Diffuse;
		#ifdef DOUBLE_SIDED
			vLightBack += saturate( - dotNL ) * directLightColor_Diffuse;
		#endif
	}
	#pragma unroll_loop_end
#endif
#if NUM_HEMI_LIGHTS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
		vIndirectFront += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry.normal );
		#ifdef DOUBLE_SIDED
			vIndirectBack += getHemisphereLightIrradiance( hemisphereLights[ i ], backGeometry.normal );
		#endif
	}
	#pragma unroll_loop_end
#endif`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
uniform vec3 lightProbe[ 9 ];
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
	#if defined ( PHYSICALLY_CORRECT_LIGHTS )
		float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
		if ( cutoffDistance > 0.0 ) {
			distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
		}
		return distanceFalloff;
	#else
		if ( cutoffDistance > 0.0 && decayExponent > 0.0 ) {
			return pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );
		}
		return 1.0;
	#endif
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
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, const in GeometricContext geometry, out IncidentLight light ) {
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
	void getPointLightInfo( const in PointLight pointLight, const in GeometricContext geometry, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometry.position;
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
	void getSpotLightInfo( const in SpotLight spotLight, const in GeometricContext geometry, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometry.position;
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
#endif`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in GeometricContext geometry, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometry.normal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in GeometricContext geometry, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon
#define Material_LightProbeLOD( material )	(0)`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometry.viewDir, geometry.normal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong
#define Material_LightProbeLOD( material )	(0)`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( geometryNormal ) ), abs( dFdy( geometryNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	#ifdef SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULARINTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vUv ).a;
		#endif
		#ifdef USE_SPECULARCOLORMAP
			specularColorFactor *= specularColorMapTexelToLinear( texture2D( specularColorMap, vUv ) ).rgb;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( ior - 1.0 ) / ( ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
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
		material.clearcoat *= texture2D( clearcoatMap, vUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEENCOLORMAP
		material.sheenColor *= sheenColorMapTexelToLinear( texture2D( sheenColorMap, vUv ) ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEENROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vUv ).a;
	#endif
#endif`,lights_physical_pars_fragment:`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
};
vec3 clearcoatSpecular = vec3( 0.0 );
vec3 sheenSpecular = vec3( 0.0 );
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness) {
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
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	vec3 FssEss = specularColor * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = specularColor + ( 1.0 - specularColor ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometry.normal;
		vec3 viewDir = geometry.viewDir;
		vec3 position = geometry.position;
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
void RE_Direct_Physical( const in IncidentLight directLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometry.clearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecular += ccIrradiance * BRDF_GGX( directLight.direction, geometry.viewDir, geometry.clearcoatNormal, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecular += irradiance * BRDF_Sheen( directLight.direction, geometry.viewDir, geometry.normal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometry.viewDir, geometry.normal, material.specularColor, material.specularF90, material.roughness );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecular += clearcoatRadiance * EnvironmentBRDF( geometry.clearcoatNormal, geometry.viewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecular += irradiance * material.sheenColor * IBLSheenBRDF( geometry.normal, geometry.viewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	computeMultiscattering( geometry.normal, geometry.viewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	vec3 diffuse = material.diffuseColor * ( 1.0 - ( singleScattering + multiScattering ) );
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
}`,lights_fragment_begin:`
GeometricContext geometry;
geometry.position = - vViewPosition;
geometry.normal = normal;
geometry.viewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
#ifdef USE_CLEARCOAT
	geometry.clearcoatNormal = clearcoatNormal;
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
		getPointLightInfo( pointLight, geometry, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometry, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometry, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometry, material, reflectedLight );
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
		getDirectionalLightInfo( directionalLight, geometry, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometry, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometry, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	irradiance += getLightProbeIrradiance( lightProbe, geometry.normal );
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry.normal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vUv2 );
		vec3 lightMapIrradiance = lightMapTexelToLinear( lightMapTexel ).rgb * lightMapIntensity;
		#ifndef PHYSICALLY_CORRECT_LIGHTS
			lightMapIrradiance *= PI;
		#endif
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometry.normal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	radiance += getIBLRadiance( geometry.viewDir, geometry.normal, material.roughness );
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometry.viewDir, geometry.clearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometry, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometry, material, reflectedLight );
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
	#endif
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
		vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
	#else
		if ( isPerspectiveMatrix( projectionMatrix ) ) {
			gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
			gl_Position.z *= gl_Position.w;
		}
	#endif
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 texelColor = texture2D( map, vUv );
	texelColor = mapTexelToLinear( texelColor );
	diffuseColor *= texelColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
#endif
#ifdef USE_MAP
	vec4 mapTexel = texture2D( map, uv );
	diffuseColor *= mapTexelToLinear( mapTexel );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	uniform mat3 uvTransform;
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] > 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1, 2 ) * morphTargetInfluences[ i ];
		}
	#else
		objectNormal += morphNormal0 * morphTargetInfluences[ 0 ];
		objectNormal += morphNormal1 * morphTargetInfluences[ 1 ];
		objectNormal += morphNormal2 * morphTargetInfluences[ 2 ];
		objectNormal += morphNormal3 * morphTargetInfluences[ 3 ];
	#endif
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	uniform float morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
		uniform sampler2DArray morphTargetsTexture;
		uniform vec2 morphTargetsTextureSize;
		vec3 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset, const in int stride ) {
			float texelIndex = float( vertexIndex * stride + offset );
			float y = floor( texelIndex / morphTargetsTextureSize.x );
			float x = texelIndex - y * morphTargetsTextureSize.x;
			vec3 morphUV = vec3( ( x + 0.5 ) / morphTargetsTextureSize.x, y / morphTargetsTextureSize.y, morphTargetIndex );
			return texture( morphTargetsTexture, morphUV ).xyz;
		}
	#else
		#ifndef USE_MORPHNORMALS
			uniform float morphTargetInfluences[ 8 ];
		#else
			uniform float morphTargetInfluences[ 4 ];
		#endif
	#endif
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			#ifndef USE_MORPHNORMALS
				if ( morphTargetInfluences[ i ] > 0.0 ) transformed += getMorph( gl_VertexID, i, 0, 1 ) * morphTargetInfluences[ i ];
			#else
				if ( morphTargetInfluences[ i ] > 0.0 ) transformed += getMorph( gl_VertexID, i, 0, 2 ) * morphTargetInfluences[ i ];
			#endif
		}
	#else
		transformed += morphTarget0 * morphTargetInfluences[ 0 ];
		transformed += morphTarget1 * morphTargetInfluences[ 1 ];
		transformed += morphTarget2 * morphTargetInfluences[ 2 ];
		transformed += morphTarget3 * morphTargetInfluences[ 3 ];
		#ifndef USE_MORPHNORMALS
			transformed += morphTarget4 * morphTargetInfluences[ 4 ];
			transformed += morphTarget5 * morphTargetInfluences[ 5 ];
			transformed += morphTarget6 * morphTargetInfluences[ 6 ];
			transformed += morphTarget7 * morphTargetInfluences[ 7 ];
		#endif
	#endif
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = vec3( dFdx( vViewPosition.x ), dFdx( vViewPosition.y ), dFdx( vViewPosition.z ) );
	vec3 fdy = vec3( dFdy( vViewPosition.x ), dFdy( vViewPosition.y ), dFdy( vViewPosition.z ) );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	#ifdef USE_TANGENT
		vec3 tangent = normalize( vTangent );
		vec3 bitangent = normalize( vBitangent );
		#ifdef DOUBLE_SIDED
			tangent = tangent * faceDirection;
			bitangent = bitangent * faceDirection;
		#endif
		#if defined( TANGENTSPACE_NORMALMAP ) || defined( USE_CLEARCOAT_NORMALMAP )
			mat3 vTBN = mat3( tangent, bitangent, normal );
		#endif
	#endif
#endif
vec3 geometryNormal = normal;`,normal_fragment_maps:`#ifdef OBJECTSPACE_NORMALMAP
	normal = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( TANGENTSPACE_NORMALMAP )
	vec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	#ifdef USE_TANGENT
		normal = normalize( vTBN * mapN );
	#else
		normal = perturbNormal2Arb( - vViewPosition, normal, mapN, faceDirection );
	#endif
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef OBJECTSPACE_NORMALMAP
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( TANGENTSPACE_NORMALMAP ) || defined ( USE_CLEARCOAT_NORMALMAP ) )
	vec3 perturbNormal2Arb( vec3 eye_pos, vec3 surf_norm, vec3 mapN, float faceDirection ) {
		vec3 q0 = vec3( dFdx( eye_pos.x ), dFdx( eye_pos.y ), dFdx( eye_pos.z ) );
		vec3 q1 = vec3( dFdy( eye_pos.x ), dFdy( eye_pos.y ), dFdy( eye_pos.z ) );
		vec2 st0 = dFdx( vUv.st );
		vec2 st1 = dFdy( vUv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : faceDirection * inversesqrt( det );
		return normalize( T * ( mapN.x * scale ) + B * ( mapN.y * scale ) + N * mapN.z );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = geometryNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	#ifdef USE_TANGENT
		clearcoatNormal = normalize( vTBN * clearcoatMapN );
	#else
		clearcoatNormal = perturbNormal2Arb( - vViewPosition, clearcoatNormal, clearcoatMapN, faceDirection );
	#endif
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif`,output_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= transmissionAlpha + 0.1;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;
const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
const float ShiftRight8 = 1. / 256.;
vec4 packDepthToRGBA( const in float v ) {
	vec4 r = vec4( fract( v * PackFactors ), v );
	r.yzw -= r.xyz * ShiftRight8;	return r * PackUpscale;
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors );
}
vec4 pack2HalfToRGBA( vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float linearClipZ, const in float near, const in float far ) {
	return linearClipZ * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float invClipZ, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * invClipZ - far );
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		varying vec4 vSpotShadowCoord[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
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
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 );
		bool inFrustum = all( inFrustumVec );
		bvec2 frustumTestVec = bvec2( inFrustum, shadowCoord.z <= 1.0 );
		bool frustumTest = all( frustumTestVec );
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
		return shadow;
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
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
		vec3 lightToPosition = shadowCoord.xyz;
		float dp = ( length( lightToPosition ) - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );		dp += shadowBias;
		vec3 bd3D = normalize( lightToPosition );
		#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
			vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
			return (
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
			return texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
		#endif
	}
#endif`,shadowmap_pars_vertex:`#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform mat4 spotShadowMatrix[ NUM_SPOT_LIGHT_SHADOWS ];
		varying vec4 vSpotShadowCoord[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
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
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SPOT_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0
		vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		vec4 shadowWorldPosition;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
		vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias, 0 );
		vSpotShadowCoord[ i ] = spotShadowMatrix[ i ] * shadowWorldPosition;
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
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	#ifdef BONE_TEXTURE
		uniform highp sampler2D boneTexture;
		uniform int boneTextureSize;
		mat4 getBoneMatrix( const in float i ) {
			float j = i * 4.0;
			float x = mod( j, float( boneTextureSize ) );
			float y = floor( j / float( boneTextureSize ) );
			float dx = 1.0 / float( boneTextureSize );
			float dy = 1.0 / float( boneTextureSize );
			y = dy * ( y + 0.5 );
			vec4 v1 = texture2D( boneTexture, vec2( dx * ( x + 0.5 ), y ) );
			vec4 v2 = texture2D( boneTexture, vec2( dx * ( x + 1.5 ), y ) );
			vec4 v3 = texture2D( boneTexture, vec2( dx * ( x + 2.5 ), y ) );
			vec4 v4 = texture2D( boneTexture, vec2( dx * ( x + 3.5 ), y ) );
			mat4 bone = mat4( v1, v2, v3, v4 );
			return bone;
		}
	#else
		uniform mat4 boneMatrices[ MAX_BONES ];
		mat4 getBoneMatrix( const in float i ) {
			mat4 bone = boneMatrices[ int(i) ];
			return bone;
		}
	#endif
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
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
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return toneMappingExposure * color;
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 OptimizedCineonToneMapping( vec3 color ) {
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	float transmissionAlpha = 1.0;
	float transmissionFactor = transmission;
	float thicknessFactor = thickness;
	#ifdef USE_TRANSMISSIONMAP
		transmissionFactor *= texture2D( transmissionMap, vUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		thicknessFactor *= texture2D( thicknessMap, vUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmission = getIBLVolumeRefraction(
		n, v, roughnessFactor, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, ior, thicknessFactor,
		attenuationColor, attenuationDistance );
	totalDiffuse = mix( totalDiffuse, transmission.rgb, transmissionFactor );
	transmissionAlpha = mix( transmissionAlpha, transmission.a, transmissionFactor );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
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
	vec3 getVolumeTransmissionRay( vec3 n, vec3 v, float thickness, float ior, mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( float roughness, float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( vec2 fragCoord, float roughness, float ior ) {
		float framebufferLod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		#ifdef TEXTURE_LOD_EXT
			return texture2DLodEXT( transmissionSamplerMap, fragCoord.xy, framebufferLod );
		#else
			return texture2D( transmissionSamplerMap, fragCoord.xy, framebufferLod );
		#endif
	}
	vec3 applyVolumeAttenuation( vec3 radiance, float transmissionDistance, vec3 attenuationColor, float attenuationDistance ) {
		if ( attenuationDistance == 0.0 ) {
			return radiance;
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance * radiance;
		}
	}
	vec4 getIBLVolumeRefraction( vec3 n, vec3 v, float roughness, vec3 diffuseColor, vec3 specularColor, float specularF90,
		vec3 position, mat4 modelMatrix, mat4 viewMatrix, mat4 projMatrix, float ior, float thickness,
		vec3 attenuationColor, float attenuationDistance ) {
		vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
		vec3 refractedRayExit = position + transmissionRay;
		vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
		vec2 refractionCoords = ndcPos.xy / ndcPos.w;
		refractionCoords += 1.0;
		refractionCoords /= 2.0;
		vec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
		vec3 attenuatedColor = applyVolumeAttenuation( transmittedLight.rgb, length( transmissionRay ), attenuationColor, attenuationDistance );
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		return vec4( ( 1.0 - F ) * attenuatedColor * diffuseColor, transmittedLight.a );
	}
#endif`,uv_pars_fragment:`#if ( defined( USE_UV ) && ! defined( UVS_VERTEX_ONLY ) )
	varying vec2 vUv;
#endif`,uv_pars_vertex:`#ifdef USE_UV
	#ifdef UVS_VERTEX_ONLY
		vec2 vUv;
	#else
		varying vec2 vUv;
	#endif
	uniform mat3 uvTransform;
#endif`,uv_vertex:`#ifdef USE_UV
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
#endif`,uv2_pars_fragment:`#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )
	varying vec2 vUv2;
#endif`,uv2_pars_vertex:`#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )
	attribute vec2 uv2;
	varying vec2 vUv2;
	uniform mat3 uv2Transform;
#endif`,uv2_vertex:`#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )
	vUv2 = ( uv2Transform * vec3( uv2, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION )
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	gl_FragColor = mapTexelToLinear( texColor );
	#include <tonemapping_fragment>
	#include <encodings_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`#include <envmap_common_pars_fragment>
uniform float opacity;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	vec3 vReflect = vWorldDirection;
	#include <envmap_fragment>
	gl_FragColor = envColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <encodings_fragment>
}`,depth_vert:`#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <skinbase_vertex>
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
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#endif
}`,distanceRGBA_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <skinbase_vertex>
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
}`,distanceRGBA_frag:`#define DISTANCE
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
#include <clipping_planes_pars_fragment>
void main () {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	vec4 texColor = texture2D( tEquirect, sampleUV );
	gl_FragColor = mapTexelToLinear( texColor );
	#include <tonemapping_fragment>
	#include <encodings_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <color_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
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
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel= texture2D( lightMap, vUv2 );
		reflectedLight.indirectDiffuse += lightMapTexelToLinear( lightMapTexel ).rgb * lightMapIntensity;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vLightFront;
varying vec3 vIndirectFront;
#ifdef DOUBLE_SIDED
	varying vec3 vLightBack;
	varying vec3 vIndirectBack;
#endif
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <envmap_pars_vertex>
#include <bsdfs>
#include <lights_pars_begin>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <lights_lambert_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
varying vec3 vLightFront;
varying vec3 vIndirectFront;
#ifdef DOUBLE_SIDED
	varying vec3 vLightBack;
	varying vec3 vIndirectBack;
#endif
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <fog_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	#include <emissivemap_fragment>
	#ifdef DOUBLE_SIDED
		reflectedLight.indirectDiffuse += ( gl_FrontFacing ) ? vIndirectFront : vIndirectBack;
	#else
		reflectedLight.indirectDiffuse += vIndirectFront;
	#endif
	#include <lightmap_fragment>
	reflectedLight.indirectDiffuse *= BRDF_Lambert( diffuseColor.rgb );
	#ifdef DOUBLE_SIDED
		reflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;
	#else
		reflectedLight.directDiffuse = vLightFront;
	#endif
	reflectedLight.directDiffuse *= BRDF_Lambert( diffuseColor.rgb ) * getShadowMask();
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
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
}`,meshmatcap_frag:`#define MATCAP
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
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
		matcapColor = matcapTexelToLinear( matcapColor );
	#else
		vec4 matcapColor = vec4( 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( TANGENTSPACE_NORMALMAP )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
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
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( TANGENTSPACE_NORMALMAP )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( TANGENTSPACE_NORMALMAP )
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
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), opacity );
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
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
	#include <uv2_vertex>
	#include <color_vertex>
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
}`,meshphong_frag:`#define PHONG
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
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <cube_uv_reflection_fragment>
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
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
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
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
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
	#include <uv2_vertex>
	#include <color_vertex>
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
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULARINTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
	#ifdef USE_SPECULARCOLORMAP
		uniform sampler2D specularColorMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEENCOLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEENROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <bsdfs>
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
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
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
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecular;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometry.clearcoatNormal, geometry.viewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + clearcoatSpecular * material.clearcoat;
	#endif
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
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
	#include <uv2_vertex>
	#include <color_vertex>
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
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
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
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <color_vertex>
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
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec2 scale;
	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
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
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
}`},oe={common:{diffuse:{value:new le(16777215)},opacity:{value:1},map:{value:null},uvTransform:{value:new $e},uv2Transform:{value:new $e},alphaMap:{value:null},alphaTest:{value:0}},specularmap:{specularMap:{value:null}},envmap:{envMap:{value:null},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1}},emissivemap:{emissiveMap:{value:null}},bumpmap:{bumpMap:{value:null},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalScale:{value:new $(1,1)}},displacementmap:{displacementMap:{value:null},displacementScale:{value:1},displacementBias:{value:0}},roughnessmap:{roughnessMap:{value:null}},metalnessmap:{metalnessMap:{value:null}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new le(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotShadowMap:{value:[]},spotShadowMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new le(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaTest:{value:0},uvTransform:{value:new $e}},sprite:{diffuse:{value:new le(16777215)},opacity:{value:1},center:{value:new $(.5,.5)},rotation:{value:0},map:{value:null},alphaMap:{value:null},alphaTest:{value:0},uvTransform:{value:new $e}}},tn={basic:{uniforms:ht([oe.common,oe.specularmap,oe.envmap,oe.aomap,oe.lightmap,oe.fog]),vertexShader:_e.meshbasic_vert,fragmentShader:_e.meshbasic_frag},lambert:{uniforms:ht([oe.common,oe.specularmap,oe.envmap,oe.aomap,oe.lightmap,oe.emissivemap,oe.fog,oe.lights,{emissive:{value:new le(0)}}]),vertexShader:_e.meshlambert_vert,fragmentShader:_e.meshlambert_frag},phong:{uniforms:ht([oe.common,oe.specularmap,oe.envmap,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.fog,oe.lights,{emissive:{value:new le(0)},specular:{value:new le(1118481)},shininess:{value:30}}]),vertexShader:_e.meshphong_vert,fragmentShader:_e.meshphong_frag},standard:{uniforms:ht([oe.common,oe.envmap,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.roughnessmap,oe.metalnessmap,oe.fog,oe.lights,{emissive:{value:new le(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:_e.meshphysical_vert,fragmentShader:_e.meshphysical_frag},toon:{uniforms:ht([oe.common,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.gradientmap,oe.fog,oe.lights,{emissive:{value:new le(0)}}]),vertexShader:_e.meshtoon_vert,fragmentShader:_e.meshtoon_frag},matcap:{uniforms:ht([oe.common,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.fog,{matcap:{value:null}}]),vertexShader:_e.meshmatcap_vert,fragmentShader:_e.meshmatcap_frag},points:{uniforms:ht([oe.points,oe.fog]),vertexShader:_e.points_vert,fragmentShader:_e.points_frag},dashed:{uniforms:ht([oe.common,oe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:_e.linedashed_vert,fragmentShader:_e.linedashed_frag},depth:{uniforms:ht([oe.common,oe.displacementmap]),vertexShader:_e.depth_vert,fragmentShader:_e.depth_frag},normal:{uniforms:ht([oe.common,oe.bumpmap,oe.normalmap,oe.displacementmap,{opacity:{value:1}}]),vertexShader:_e.meshnormal_vert,fragmentShader:_e.meshnormal_frag},sprite:{uniforms:ht([oe.sprite,oe.fog]),vertexShader:_e.sprite_vert,fragmentShader:_e.sprite_frag},background:{uniforms:{uvTransform:{value:new $e},t2D:{value:null}},vertexShader:_e.background_vert,fragmentShader:_e.background_frag},cube:{uniforms:ht([oe.envmap,{opacity:{value:1}}]),vertexShader:_e.cube_vert,fragmentShader:_e.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:_e.equirect_vert,fragmentShader:_e.equirect_frag},distanceRGBA:{uniforms:ht([oe.common,oe.displacementmap,{referencePosition:{value:new T},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:_e.distanceRGBA_vert,fragmentShader:_e.distanceRGBA_frag},shadow:{uniforms:ht([oe.lights,oe.fog,{color:{value:new le(0)},opacity:{value:1}}]),vertexShader:_e.shadow_vert,fragmentShader:_e.shadow_frag}};function i0(s,e,t,n,i){const r=new le(0);let a,o,l=0,c=null,h=0,u=null;function d(p,m){t.buffers.color.setClear(p.r,p.g,p.b,m,i)}return{getClearColor:function(){return r},setClearColor:function(p,m=1){r.set(p),l=m,d(r,l)},getClearAlpha:function(){return l},setClearAlpha:function(p){l=p,d(r,l)},render:function(p,m){let f=!1,g=m.isScene===!0?m.background:null;g&&g.isTexture&&(g=e.get(g));const x=s.xr,v=x.getSession&&x.getSession();v&&v.environmentBlendMode==="additive"&&(g=null),g===null?d(r,l):g&&g.isColor&&(d(g,1),f=!0),(s.autoClear||f)&&s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil),g&&(g.isCubeTexture||g.mapping===306)?(o===void 0&&(o=new me(new ti(1,1,1),new Pn({name:"BackgroundCubeMaterial",uniforms:cr(tn.cube.uniforms),vertexShader:tn.cube.vertexShader,fragmentShader:tn.cube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1})),o.geometry.deleteAttribute("normal"),o.geometry.deleteAttribute("uv"),o.onBeforeRender=function(y,b,w){this.matrixWorld.copyPosition(w.matrixWorld)},Object.defineProperty(o.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(o)),o.material.uniforms.envMap.value=g,o.material.uniforms.flipEnvMap.value=g.isCubeTexture&&g.isRenderTargetTexture===!1?-1:1,c===g&&h===g.version&&u===s.toneMapping||(o.material.needsUpdate=!0,c=g,h=g.version,u=s.toneMapping),p.unshift(o,o.geometry,o.material,0,0,null)):g&&g.isTexture&&(a===void 0&&(a=new me(new Ti(2,2),new Pn({name:"BackgroundMaterial",uniforms:cr(tn.background.uniforms),vertexShader:tn.background.vertexShader,fragmentShader:tn.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1})),a.geometry.deleteAttribute("normal"),Object.defineProperty(a.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(a)),a.material.uniforms.t2D.value=g,g.matrixAutoUpdate===!0&&g.updateMatrix(),a.material.uniforms.uvTransform.value.copy(g.matrix),c===g&&h===g.version&&u===s.toneMapping||(a.material.needsUpdate=!0,c=g,h=g.version,u=s.toneMapping),p.unshift(a,a.geometry,a.material,0,0,null))}}}function r0(s,e,t,n){const i=s.getParameter(34921),r=n.isWebGL2?null:e.get("OES_vertex_array_object"),a=n.isWebGL2||r!==null,o={},l=d(null);let c=l;function h(b){return n.isWebGL2?s.bindVertexArray(b):r.bindVertexArrayOES(b)}function u(b){return n.isWebGL2?s.deleteVertexArray(b):r.deleteVertexArrayOES(b)}function d(b){const w=[],S=[],M=[];for(let L=0;L<i;L++)w[L]=0,S[L]=0,M[L]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:w,enabledAttributes:S,attributeDivisors:M,object:b,attributes:{},index:null}}function p(){const b=c.newAttributes;for(let w=0,S=b.length;w<S;w++)b[w]=0}function m(b){f(b,0)}function f(b,w){const S=c.newAttributes,M=c.enabledAttributes,L=c.attributeDivisors;S[b]=1,M[b]===0&&(s.enableVertexAttribArray(b),M[b]=1),L[b]!==w&&((n.isWebGL2?s:e.get("ANGLE_instanced_arrays"))[n.isWebGL2?"vertexAttribDivisor":"vertexAttribDivisorANGLE"](b,w),L[b]=w)}function g(){const b=c.newAttributes,w=c.enabledAttributes;for(let S=0,M=w.length;S<M;S++)w[S]!==b[S]&&(s.disableVertexAttribArray(S),w[S]=0)}function x(b,w,S,M,L,I){n.isWebGL2!==!0||S!==5124&&S!==5125?s.vertexAttribPointer(b,w,S,M,L,I):s.vertexAttribIPointer(b,w,S,L,I)}function v(){y(),c!==l&&(c=l,h(c.object))}function y(){l.geometry=null,l.program=null,l.wireframe=!1}return{setup:function(b,w,S,M,L){let I=!1;if(a){const P=function(N,W,G){const U=G.wireframe===!0;let j=o[N.id];j===void 0&&(j={},o[N.id]=j);let ne=j[W.id];ne===void 0&&(ne={},j[W.id]=ne);let ie=ne[U];return ie===void 0&&(ie=d(n.isWebGL2?s.createVertexArray():r.createVertexArrayOES()),ne[U]=ie),ie}(M,S,w);c!==P&&(c=P,h(c.object)),I=function(N,W){const G=c.attributes,U=N.attributes;let j=0;for(const ne in U){const ie=G[ne],B=U[ne];if(ie===void 0||ie.attribute!==B||ie.data!==B.data)return!0;j++}return c.attributesNum!==j||c.index!==W}(M,L),I&&function(N,W){const G={},U=N.attributes;let j=0;for(const ne in U){const ie=U[ne],B={};B.attribute=ie,ie.data&&(B.data=ie.data),G[ne]=B,j++}c.attributes=G,c.attributesNum=j,c.index=W}(M,L)}else{const P=w.wireframe===!0;c.geometry===M.id&&c.program===S.id&&c.wireframe===P||(c.geometry=M.id,c.program=S.id,c.wireframe=P,I=!0)}b.isInstancedMesh===!0&&(I=!0),L!==null&&t.update(L,34963),I&&(function(P,N,W,G){if(n.isWebGL2===!1&&(P.isInstancedMesh||G.isInstancedBufferGeometry)&&e.get("ANGLE_instanced_arrays")===null)return;p();const U=G.attributes,j=W.getAttributes(),ne=N.defaultAttributeValues;for(const ie in j){const B=j[ie];if(B.location>=0){let X=U[ie];if(X===void 0&&(ie==="instanceMatrix"&&P.instanceMatrix&&(X=P.instanceMatrix),ie==="instanceColor"&&P.instanceColor&&(X=P.instanceColor)),X!==void 0){const Z=X.normalized,te=X.itemSize,ee=t.get(X);if(ee===void 0)continue;const ce=ee.buffer,R=ee.type,E=ee.bytesPerElement;if(X.isInterleavedBufferAttribute){const F=X.data,V=F.stride,O=X.offset;if(F&&F.isInstancedInterleavedBuffer){for(let _=0;_<B.locationSize;_++)f(B.location+_,F.meshPerAttribute);P.isInstancedMesh!==!0&&G._maxInstanceCount===void 0&&(G._maxInstanceCount=F.meshPerAttribute*F.count)}else for(let _=0;_<B.locationSize;_++)m(B.location+_);s.bindBuffer(34962,ce);for(let _=0;_<B.locationSize;_++)x(B.location+_,te/B.locationSize,R,Z,V*E,(O+te/B.locationSize*_)*E)}else{if(X.isInstancedBufferAttribute){for(let F=0;F<B.locationSize;F++)f(B.location+F,X.meshPerAttribute);P.isInstancedMesh!==!0&&G._maxInstanceCount===void 0&&(G._maxInstanceCount=X.meshPerAttribute*X.count)}else for(let F=0;F<B.locationSize;F++)m(B.location+F);s.bindBuffer(34962,ce);for(let F=0;F<B.locationSize;F++)x(B.location+F,te/B.locationSize,R,Z,te*E,te/B.locationSize*F*E)}}else if(ne!==void 0){const Z=ne[ie];if(Z!==void 0)switch(Z.length){case 2:s.vertexAttrib2fv(B.location,Z);break;case 3:s.vertexAttrib3fv(B.location,Z);break;case 4:s.vertexAttrib4fv(B.location,Z);break;default:s.vertexAttrib1fv(B.location,Z)}}}}g()}(b,w,S,M),L!==null&&s.bindBuffer(34963,t.get(L).buffer))},reset:v,resetDefaultState:y,dispose:function(){v();for(const b in o){const w=o[b];for(const S in w){const M=w[S];for(const L in M)u(M[L].object),delete M[L];delete w[S]}delete o[b]}},releaseStatesOfGeometry:function(b){if(o[b.id]===void 0)return;const w=o[b.id];for(const S in w){const M=w[S];for(const L in M)u(M[L].object),delete M[L];delete w[S]}delete o[b.id]},releaseStatesOfProgram:function(b){for(const w in o){const S=o[w];if(S[b.id]===void 0)continue;const M=S[b.id];for(const L in M)u(M[L].object),delete M[L];delete S[b.id]}},initAttributes:p,enableAttribute:m,disableUnusedAttributes:g}}function s0(s,e,t,n){const i=n.isWebGL2;let r;this.setMode=function(a){r=a},this.render=function(a,o){s.drawArrays(r,a,o),t.update(o,r,1)},this.renderInstances=function(a,o,l){if(l===0)return;let c,h;if(i)c=s,h="drawArraysInstanced";else if(c=e.get("ANGLE_instanced_arrays"),h="drawArraysInstancedANGLE",c===null)return void console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");c[h](r,a,o,l),t.update(o,r,l)}}function a0(s,e,t){let n;function i(b){if(b==="highp"){if(s.getShaderPrecisionFormat(35633,36338).precision>0&&s.getShaderPrecisionFormat(35632,36338).precision>0)return"highp";b="mediump"}return b==="mediump"&&s.getShaderPrecisionFormat(35633,36337).precision>0&&s.getShaderPrecisionFormat(35632,36337).precision>0?"mediump":"lowp"}const r=typeof WebGL2RenderingContext<"u"&&s instanceof WebGL2RenderingContext||typeof WebGL2ComputeRenderingContext<"u"&&s instanceof WebGL2ComputeRenderingContext;let a=t.precision!==void 0?t.precision:"highp";const o=i(a);o!==a&&(console.warn("THREE.WebGLRenderer:",a,"not supported, using",o,"instead."),a=o);const l=r||e.has("WEBGL_draw_buffers"),c=t.logarithmicDepthBuffer===!0,h=s.getParameter(34930),u=s.getParameter(35660),d=s.getParameter(3379),p=s.getParameter(34076),m=s.getParameter(34921),f=s.getParameter(36347),g=s.getParameter(36348),x=s.getParameter(36349),v=u>0,y=r||e.has("OES_texture_float");return{isWebGL2:r,drawBuffers:l,getMaxAnisotropy:function(){if(n!==void 0)return n;if(e.has("EXT_texture_filter_anisotropic")===!0){const b=e.get("EXT_texture_filter_anisotropic");n=s.getParameter(b.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n},getMaxPrecision:i,precision:a,logarithmicDepthBuffer:c,maxTextures:h,maxVertexTextures:u,maxTextureSize:d,maxCubemapSize:p,maxAttributes:m,maxVertexUniforms:f,maxVaryings:g,maxFragmentUniforms:x,vertexTextures:v,floatFragmentTextures:y,floatVertexTextures:v&&y,maxSamples:r?s.getParameter(36183):0}}function o0(s){const e=this;let t=null,n=0,i=!1,r=!1;const a=new Tn,o=new $e,l={value:null,needsUpdate:!1};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(u,d,p,m){const f=u!==null?u.length:0;let g=null;if(f!==0){if(g=l.value,m!==!0||g===null){const x=p+4*f,v=d.matrixWorldInverse;o.getNormalMatrix(v),(g===null||g.length<x)&&(g=new Float32Array(x));for(let y=0,b=p;y!==f;++y,b+=4)a.copy(u[y]).applyMatrix4(v,o),a.normal.toArray(g,b),g[b+3]=a.constant}l.value=g,l.needsUpdate=!0}return e.numPlanes=f,e.numIntersection=0,g}this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d,p){const m=u.length!==0||d||n!==0||i;return i=d,t=h(u,p,0),n=u.length,m},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1,c()},this.setState=function(u,d,p){const m=u.clippingPlanes,f=u.clipIntersection,g=u.clipShadows,x=s.get(u);if(!i||m===null||m.length===0||r&&!g)r?h(null):c();else{const v=r?0:n,y=4*v;let b=x.clippingState||null;l.value=b,b=h(m,d,y,p);for(let w=0;w!==y;++w)b[w]=t[w];x.clippingState=b,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=v}}}function l0(s){let e=new WeakMap;function t(i,r){return r===303?i.mapping=301:r===304&&(i.mapping=302),i}function n(i){const r=i.target;r.removeEventListener("dispose",n);const a=e.get(r);a!==void 0&&(e.delete(r),a.dispose())}return{get:function(i){if(i&&i.isTexture&&i.isRenderTargetTexture===!1){const r=i.mapping;if(r===303||r===304){if(e.has(i))return t(e.get(i).texture,i.mapping);{const a=i.image;if(a&&a.height>0){const o=s.getRenderTarget(),l=new so(a.height/2);return l.fromEquirectangularTexture(s,i),e.set(i,l),s.setRenderTarget(o),i.addEventListener("dispose",n),t(l.texture,i.mapping)}return null}}}return i},dispose:function(){e=new WeakMap}}}tn.physical={uniforms:ht([tn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatNormalScale:{value:new $(1,1)},clearcoatNormalMap:{value:null},sheen:{value:0},sheenColor:{value:new le(0)},sheenColorMap:{value:null},sheenRoughness:{value:0},sheenRoughnessMap:{value:null},transmission:{value:0},transmissionMap:{value:null},transmissionSamplerSize:{value:new $},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},attenuationDistance:{value:0},attenuationColor:{value:new le(0)},specularIntensity:{value:0},specularIntensityMap:{value:null},specularColor:{value:new le(1,1,1)},specularColorMap:{value:null}}]),vertexShader:_e.meshphysical_vert,fragmentShader:_e.meshphysical_frag};class fr extends Qc{constructor(e=-1,t=1,n=1,i=-1,r=.1,a=2e3){super(),this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2;let r=n-e,a=n+e,o=i+t,l=i-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}fr.prototype.isOrthographicCamera=!0;class oo extends Pn{constructor(e){super(e),this.type="RawShaderMaterial"}}oo.prototype.isRawShaderMaterial=!0;const Zt=Math.pow(2,8),Om=[.125,.215,.35,.446,.526,.582],Um=5+Om.length,Xa={3e3:0,3001:1},Xo=new fr,{_lodPlanes:Lr,_sizeLods:Yh,_sigmas:ra}=h0(),Zh=new le;let Yo=null;const pi=(1+Math.sqrt(5))/2,ki=1/pi,Jh=[new T(1,1,1),new T(-1,1,1),new T(1,1,-1),new T(-1,1,-1),new T(0,pi,ki),new T(0,pi,-ki),new T(ki,0,pi),new T(-ki,0,pi),new T(pi,ki,0),new T(-pi,ki,0)];class c0{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._blurMaterial=function(t){const n=new Float32Array(t),i=new T(0,1,0);return new oo({name:"SphericalGaussianBlur",defines:{n:t},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:eh(),fragmentShader:`

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

			${th()}

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
		`,blending:0,depthTest:!1,depthWrite:!1})}(20),this._equirectShader=null,this._cubemapShader=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,i=100){Yo=this._renderer.getRenderTarget();const r=this._allocateTargets();return this._sceneToCubeUV(e,n,i,r),t>0&&this._blur(r,0,0,t),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(e){return this._fromTexture(e)}fromCubemap(e){return this._fromTexture(e)}compileCubemapShader(){this._cubemapShader===null&&(this._cubemapShader=Qh(),this._compileMaterial(this._cubemapShader))}compileEquirectangularShader(){this._equirectShader===null&&(this._equirectShader=Kh(),this._compileMaterial(this._equirectShader))}dispose(){this._blurMaterial.dispose(),this._cubemapShader!==null&&this._cubemapShader.dispose(),this._equirectShader!==null&&this._equirectShader.dispose();for(let e=0;e<Lr.length;e++)Lr[e].dispose()}_cleanup(e){this._pingPongRenderTarget.dispose(),this._renderer.setRenderTarget(Yo),e.scissorTest=!1,sa(e,0,0,e.width,e.height)}_fromTexture(e){Yo=this._renderer.getRenderTarget();const t=this._allocateTargets(e);return this._textureToCubeUV(e,t),this._applyPMREM(t),this._cleanup(t),t}_allocateTargets(e){const t={magFilter:1006,minFilter:1006,generateMipmaps:!1,type:1016,format:1023,encoding:3e3,depthBuffer:!1},n=$h(t);return n.depthBuffer=!e,this._pingPongRenderTarget=$h(t),n}_compileMaterial(e){const t=new me(Lr[0],e);this._renderer.compile(t,Xo)}_sceneToCubeUV(e,t,n,i){const r=new nt(90,1,t,n),a=[1,-1,1,1,1,1],o=[1,1,1,-1,-1,-1],l=this._renderer,c=l.autoClear,h=l.toneMapping;l.getClearColor(Zh),l.toneMapping=0,l.autoClear=!1;const u=new jt({name:"PMREM.Background",side:1,depthWrite:!1,depthTest:!1}),d=new me(new ti,u);let p=!1;const m=e.background;m?m.isColor&&(u.color.copy(m),e.background=null,p=!0):(u.color.copy(Zh),p=!0);for(let f=0;f<6;f++){const g=f%3;g==0?(r.up.set(0,a[f],0),r.lookAt(o[f],0,0)):g==1?(r.up.set(0,0,a[f]),r.lookAt(0,o[f],0)):(r.up.set(0,a[f],0),r.lookAt(0,0,o[f])),sa(i,g*Zt,f>2?Zt:0,Zt,Zt),l.setRenderTarget(i),p&&l.render(d,r),l.render(e,r)}d.geometry.dispose(),d.material.dispose(),l.toneMapping=h,l.autoClear=c,e.background=m}_setEncoding(e,t){this._renderer.capabilities.isWebGL2===!0&&t.format===1023&&t.type===1009&&t.encoding===3001?e.value=Xa[3e3]:e.value=Xa[t.encoding]}_textureToCubeUV(e,t){const n=this._renderer,i=e.mapping===301||e.mapping===302;i?this._cubemapShader==null&&(this._cubemapShader=Qh()):this._equirectShader==null&&(this._equirectShader=Kh());const r=i?this._cubemapShader:this._equirectShader,a=new me(Lr[0],r),o=r.uniforms;o.envMap.value=e,i||o.texelSize.value.set(1/e.image.width,1/e.image.height),this._setEncoding(o.inputEncoding,e),sa(t,0,0,3*Zt,2*Zt),n.setRenderTarget(t),n.render(a,Xo)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;for(let i=1;i<Um;i++){const r=Math.sqrt(ra[i]*ra[i]-ra[i-1]*ra[i-1]),a=Jh[(i-1)%Jh.length];this._blur(e,i-1,i,r,a)}t.autoClear=n}_blur(e,t,n,i,r){const a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,i,"latitudinal",r),this._halfBlur(a,e,n,n,i,"longitudinal",r)}_halfBlur(e,t,n,i,r,a,o){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=new me(Lr[i],c),u=c.uniforms,d=Yh[n]-1,p=isFinite(r)?Math.PI/(2*d):2*Math.PI/39,m=r/p,f=isFinite(r)?1+Math.floor(3*m):20;f>20&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${f} samples when the maximum is set to 20`);const g=[];let x=0;for(let y=0;y<20;++y){const b=y/m,w=Math.exp(-b*b/2);g.push(w),y==0?x+=w:y<f&&(x+=2*w)}for(let y=0;y<g.length;y++)g[y]=g[y]/x;u.envMap.value=e.texture,u.samples.value=f,u.weights.value=g,u.latitudinal.value=a==="latitudinal",o&&(u.poleAxis.value=o),u.dTheta.value=p,u.mipInt.value=8-n;const v=Yh[i];sa(t,3*Math.max(0,Zt-2*v),(i===0?0:2*Zt)+2*v*(i>4?i-8+4:0),3*v,2*v),l.setRenderTarget(t),l.render(h,Xo)}}function h0(){const s=[],e=[],t=[];let n=8;for(let i=0;i<Um;i++){const r=Math.pow(2,n);e.push(r);let a=1/r;i>4?a=Om[i-8+4-1]:i==0&&(a=0),t.push(a);const o=1/(r-1),l=-o/2,c=1+o/2,h=[l,l,c,l,c,c,l,l,c,c,l,c],u=6,d=6,p=3,m=2,f=1,g=new Float32Array(p*d*u),x=new Float32Array(m*d*u),v=new Float32Array(f*d*u);for(let b=0;b<u;b++){const w=b%3*2/3-1,S=b>2?0:-1,M=[w,S,0,w+2/3,S,0,w+2/3,S+1,0,w,S,0,w+2/3,S+1,0,w,S+1,0];g.set(M,p*d*b),x.set(h,m*d*b);const L=[b,b,b,b,b,b];v.set(L,f*d*b)}const y=new Oe;y.setAttribute("position",new ke(g,p)),y.setAttribute("uv",new ke(x,m)),y.setAttribute("faceIndex",new ke(v,f)),s.push(y),n>4&&n--}return{_lodPlanes:s,_sizeLods:e,_sigmas:t}}function $h(s){const e=new wt(3*Zt,3*Zt,s);return e.texture.mapping=306,e.texture.name="PMREM.cubeUv",e.scissorTest=!0,e}function sa(s,e,t,n,i){s.viewport.set(e,t,n,i),s.scissor.set(e,t,n,i)}function Kh(){const s=new $(1,1);return new oo({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null},texelSize:{value:s},inputEncoding:{value:Xa[3e3]}},vertexShader:eh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform vec2 texelSize;

			${th()}

			#include <common>

			void main() {

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				vec2 f = fract( uv / texelSize - 0.5 );
				uv -= f * texelSize;
				vec3 tl = envMapTexelToLinear( texture2D ( envMap, uv ) ).rgb;
				uv.x += texelSize.x;
				vec3 tr = envMapTexelToLinear( texture2D ( envMap, uv ) ).rgb;
				uv.y += texelSize.y;
				vec3 br = envMapTexelToLinear( texture2D ( envMap, uv ) ).rgb;
				uv.x -= texelSize.x;
				vec3 bl = envMapTexelToLinear( texture2D ( envMap, uv ) ).rgb;

				vec3 tm = mix( tl, tr, f.x );
				vec3 bm = mix( bl, br, f.x );
				gl_FragColor.rgb = mix( tm, bm, f.y );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Qh(){return new oo({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},inputEncoding:{value:Xa[3e3]}},vertexShader:eh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			${th()}

			void main() {

				gl_FragColor = envMapTexelToLinear( textureCube( envMap, vec3( - vOutputDirection.x, vOutputDirection.yz ) ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function eh(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 position;
		attribute vec2 uv;
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
	`}function th(){return`

		uniform int inputEncoding;

		#include <encodings_pars_fragment>

		vec4 inputTexelToLinear( vec4 value ) {

			if ( inputEncoding == 0 ) {

				return value;

			} else {

				return sRGBToLinear( value );

			}

		}

		vec4 envMapTexelToLinear( vec4 color ) {

			return inputTexelToLinear( color );

		}
	`}function u0(s){let e=new WeakMap,t=null;function n(i){const r=i.target;r.removeEventListener("dispose",n);const a=e.get(r);a!==void 0&&(e.delete(r),a.dispose())}return{get:function(i){if(i&&i.isTexture&&i.isRenderTargetTexture===!1){const r=i.mapping,a=r===303||r===304,o=r===301||r===302;if(a||o){if(e.has(i))return e.get(i).texture;{const l=i.image;if(a&&l&&l.height>0||o&&l&&function(c){let h=0;const u=6;for(let d=0;d<u;d++)c[d]!==void 0&&h++;return h===u}(l)){const c=s.getRenderTarget();t===null&&(t=new c0(s));const h=a?t.fromEquirectangular(i):t.fromCubemap(i);return e.set(i,h),s.setRenderTarget(c),i.addEventListener("dispose",n),h.texture}return null}}}return i},dispose:function(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}}}function d0(s){const e={};function t(n){if(e[n]!==void 0)return e[n];let i;switch(n){case"WEBGL_depth_texture":i=s.getExtension("WEBGL_depth_texture")||s.getExtension("MOZ_WEBGL_depth_texture")||s.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":i=s.getExtension("EXT_texture_filter_anisotropic")||s.getExtension("MOZ_EXT_texture_filter_anisotropic")||s.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":i=s.getExtension("WEBGL_compressed_texture_s3tc")||s.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":i=s.getExtension("WEBGL_compressed_texture_pvrtc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:i=s.getExtension(n)}return e[n]=i,i}return{has:function(n){return t(n)!==null},init:function(n){n.isWebGL2?t("EXT_color_buffer_float"):(t("WEBGL_depth_texture"),t("OES_texture_float"),t("OES_texture_half_float"),t("OES_texture_half_float_linear"),t("OES_standard_derivatives"),t("OES_element_index_uint"),t("OES_vertex_array_object"),t("ANGLE_instanced_arrays")),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture")},get:function(n){const i=t(n);return i===null&&console.warn("THREE.WebGLRenderer: "+n+" extension not supported."),i}}}function p0(s,e,t,n){const i={},r=new WeakMap;function a(l){const c=l.target;c.index!==null&&e.remove(c.index);for(const u in c.attributes)e.remove(c.attributes[u]);c.removeEventListener("dispose",a),delete i[c.id];const h=r.get(c);h&&(e.remove(h),r.delete(c)),n.releaseStatesOfGeometry(c),c.isInstancedBufferGeometry===!0&&delete c._maxInstanceCount,t.memory.geometries--}function o(l){const c=[],h=l.index,u=l.attributes.position;let d=0;if(h!==null){const f=h.array;d=h.version;for(let g=0,x=f.length;g<x;g+=3){const v=f[g+0],y=f[g+1],b=f[g+2];c.push(v,y,y,b,b,v)}}else{const f=u.array;d=u.version;for(let g=0,x=f.length/3-1;g<x;g+=3){const v=g+0,y=g+1,b=g+2;c.push(v,y,y,b,b,v)}}const p=new(Pm(c)>65535?Nm:Dm)(c,1);p.version=d;const m=r.get(l);m&&e.remove(m),r.set(l,p)}return{get:function(l,c){return i[c.id]===!0||(c.addEventListener("dispose",a),i[c.id]=!0,t.memory.geometries++),c},update:function(l){const c=l.attributes;for(const u in c)e.update(c[u],34962);const h=l.morphAttributes;for(const u in h){const d=h[u];for(let p=0,m=d.length;p<m;p++)e.update(d[p],34962)}},getWireframeAttribute:function(l){const c=r.get(l);if(c){const h=l.index;h!==null&&c.version<h.version&&o(l)}else o(l);return r.get(l)}}}function m0(s,e,t,n){const i=n.isWebGL2;let r,a,o;this.setMode=function(l){r=l},this.setIndex=function(l){a=l.type,o=l.bytesPerElement},this.render=function(l,c){s.drawElements(r,c,a,l*o),t.update(c,r,1)},this.renderInstances=function(l,c,h){if(h===0)return;let u,d;if(i)u=s,d="drawElementsInstanced";else if(u=e.get("ANGLE_instanced_arrays"),d="drawElementsInstancedANGLE",u===null)return void console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");u[d](r,c,a,l*o,h),t.update(c,r,h)}}function f0(s){const e={frame:0,calls:0,triangles:0,points:0,lines:0};return{memory:{geometries:0,textures:0},render:e,programs:null,autoReset:!0,reset:function(){e.frame++,e.calls=0,e.triangles=0,e.points=0,e.lines=0},update:function(t,n,i){switch(e.calls++,n){case 4:e.triangles+=i*(t/3);break;case 1:e.lines+=i*(t/2);break;case 3:e.lines+=i*(t-1);break;case 2:e.lines+=i*t;break;case 0:e.points+=i*t;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",n)}}}}class nh extends qe{constructor(e=null,t=1,n=1,i=1){super(null),this.image={data:e,width:t,height:n,depth:i},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}function g0(s,e){return s[0]-e[0]}function v0(s,e){return Math.abs(e[1])-Math.abs(s[1])}function eu(s,e){let t=1;const n=e.isInterleavedBufferAttribute?e.data.array:e.array;n instanceof Int8Array?t=127:n instanceof Int16Array?t=32767:n instanceof Int32Array?t=2147483647:console.error("THREE.WebGLMorphtargets: Unsupported morph attribute data type: ",n),s.divideScalar(t)}function y0(s,e,t){const n={},i=new Float32Array(8),r=new WeakMap,a=new T,o=[];for(let l=0;l<8;l++)o[l]=[l,0];return{update:function(l,c,h,u){const d=l.morphTargetInfluences;if(e.isWebGL2===!0){const p=c.morphAttributes.position.length;let m=r.get(c);if(m===void 0||m.count!==p){m!==void 0&&m.texture.dispose();const x=c.morphAttributes.normal!==void 0,v=c.morphAttributes.position,y=c.morphAttributes.normal||[],b=x===!0?2:1;let w=c.attributes.position.count*b,S=1;w>e.maxTextureSize&&(S=Math.ceil(w/e.maxTextureSize),w=e.maxTextureSize);const M=new Float32Array(w*S*4*p),L=new nh(M,w,S,p);L.format=1023,L.type=1015,L.needsUpdate=!0;const I=4*b;for(let P=0;P<p;P++){const N=v[P],W=y[P],G=w*S*4*P;for(let U=0;U<N.count;U++){a.fromBufferAttribute(N,U),N.normalized===!0&&eu(a,N);const j=U*I;M[G+j+0]=a.x,M[G+j+1]=a.y,M[G+j+2]=a.z,M[G+j+3]=0,x===!0&&(a.fromBufferAttribute(W,U),W.normalized===!0&&eu(a,W),M[G+j+4]=a.x,M[G+j+5]=a.y,M[G+j+6]=a.z,M[G+j+7]=0)}}m={count:p,texture:L,size:new $(w,S)},r.set(c,m)}let f=0;for(let x=0;x<d.length;x++)f+=d[x];const g=c.morphTargetsRelative?1:1-f;u.getUniforms().setValue(s,"morphTargetBaseInfluence",g),u.getUniforms().setValue(s,"morphTargetInfluences",d),u.getUniforms().setValue(s,"morphTargetsTexture",m.texture,t),u.getUniforms().setValue(s,"morphTargetsTextureSize",m.size)}else{const p=d===void 0?0:d.length;let m=n[c.id];if(m===void 0||m.length!==p){m=[];for(let y=0;y<p;y++)m[y]=[y,0];n[c.id]=m}for(let y=0;y<p;y++){const b=m[y];b[0]=y,b[1]=d[y]}m.sort(v0);for(let y=0;y<8;y++)y<p&&m[y][1]?(o[y][0]=m[y][0],o[y][1]=m[y][1]):(o[y][0]=Number.MAX_SAFE_INTEGER,o[y][1]=0);o.sort(g0);const f=c.morphAttributes.position,g=c.morphAttributes.normal;let x=0;for(let y=0;y<8;y++){const b=o[y],w=b[0],S=b[1];w!==Number.MAX_SAFE_INTEGER&&S?(f&&c.getAttribute("morphTarget"+y)!==f[w]&&c.setAttribute("morphTarget"+y,f[w]),g&&c.getAttribute("morphNormal"+y)!==g[w]&&c.setAttribute("morphNormal"+y,g[w]),i[y]=S,x+=S):(f&&c.hasAttribute("morphTarget"+y)===!0&&c.deleteAttribute("morphTarget"+y),g&&c.hasAttribute("morphNormal"+y)===!0&&c.deleteAttribute("morphNormal"+y),i[y]=0)}const v=c.morphTargetsRelative?1:1-x;u.getUniforms().setValue(s,"morphTargetBaseInfluence",v),u.getUniforms().setValue(s,"morphTargetInfluences",i)}}}}function x0(s,e,t,n){let i=new WeakMap;function r(a){const o=a.target;o.removeEventListener("dispose",r),t.remove(o.instanceMatrix),o.instanceColor!==null&&t.remove(o.instanceColor)}return{update:function(a){const o=n.render.frame,l=a.geometry,c=e.get(a,l);return i.get(c)!==o&&(e.update(c),i.set(c,o)),a.isInstancedMesh&&(a.hasEventListener("dispose",r)===!1&&a.addEventListener("dispose",r),t.update(a.instanceMatrix,34962),a.instanceColor!==null&&t.update(a.instanceColor,34962)),c},dispose:function(){i=new WeakMap}}}nh.prototype.isDataTexture2DArray=!0;class km extends qe{constructor(e=null,t=1,n=1,i=1){super(null),this.image={data:e,width:t,height:n,depth:i},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}km.prototype.isDataTexture3D=!0;const zm=new qe,Bm=new nh,Hm=new km,Vm=new ro,tu=[],nu=[],iu=new Float32Array(16),ru=new Float32Array(9),su=new Float32Array(4);function gr(s,e,t){const n=s[0];if(n<=0||n>0)return s;const i=e*t;let r=tu[i];if(r===void 0&&(r=new Float32Array(i),tu[i]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,s[a].toArray(r,o)}return r}function xt(s,e){if(s.length!==e.length)return!1;for(let t=0,n=s.length;t<n;t++)if(s[t]!==e[t])return!1;return!0}function ut(s,e){for(let t=0,n=e.length;t<n;t++)s[t]=e[t]}function lo(s,e){let t=nu[e];t===void 0&&(t=new Int32Array(e),nu[e]=t);for(let n=0;n!==e;++n)t[n]=s.allocateTextureUnit();return t}function b0(s,e){const t=this.cache;t[0]!==e&&(s.uniform1f(this.addr,e),t[0]=e)}function w0(s,e){const t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y||(s.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(xt(t,e))return;s.uniform2fv(this.addr,e),ut(t,e)}}function _0(s,e){const t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y&&t[2]===e.z||(s.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)t[0]===e.r&&t[1]===e.g&&t[2]===e.b||(s.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(xt(t,e))return;s.uniform3fv(this.addr,e),ut(t,e)}}function M0(s,e){const t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y&&t[2]===e.z&&t[3]===e.w||(s.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(xt(t,e))return;s.uniform4fv(this.addr,e),ut(t,e)}}function S0(s,e){const t=this.cache,n=e.elements;if(n===void 0){if(xt(t,e))return;s.uniformMatrix2fv(this.addr,!1,e),ut(t,e)}else{if(xt(t,n))return;su.set(n),s.uniformMatrix2fv(this.addr,!1,su),ut(t,n)}}function T0(s,e){const t=this.cache,n=e.elements;if(n===void 0){if(xt(t,e))return;s.uniformMatrix3fv(this.addr,!1,e),ut(t,e)}else{if(xt(t,n))return;ru.set(n),s.uniformMatrix3fv(this.addr,!1,ru),ut(t,n)}}function E0(s,e){const t=this.cache,n=e.elements;if(n===void 0){if(xt(t,e))return;s.uniformMatrix4fv(this.addr,!1,e),ut(t,e)}else{if(xt(t,n))return;iu.set(n),s.uniformMatrix4fv(this.addr,!1,iu),ut(t,n)}}function A0(s,e){const t=this.cache;t[0]!==e&&(s.uniform1i(this.addr,e),t[0]=e)}function R0(s,e){const t=this.cache;xt(t,e)||(s.uniform2iv(this.addr,e),ut(t,e))}function L0(s,e){const t=this.cache;xt(t,e)||(s.uniform3iv(this.addr,e),ut(t,e))}function C0(s,e){const t=this.cache;xt(t,e)||(s.uniform4iv(this.addr,e),ut(t,e))}function P0(s,e){const t=this.cache;t[0]!==e&&(s.uniform1ui(this.addr,e),t[0]=e)}function I0(s,e){const t=this.cache;xt(t,e)||(s.uniform2uiv(this.addr,e),ut(t,e))}function D0(s,e){const t=this.cache;xt(t,e)||(s.uniform3uiv(this.addr,e),ut(t,e))}function N0(s,e){const t=this.cache;xt(t,e)||(s.uniform4uiv(this.addr,e),ut(t,e))}function F0(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.safeSetTexture2D(e||zm,i)}function O0(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture3D(e||Hm,i)}function U0(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.safeSetTextureCube(e||Vm,i)}function k0(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture2DArray(e||Bm,i)}function z0(s,e){s.uniform1fv(this.addr,e)}function B0(s,e){const t=gr(e,this.size,2);s.uniform2fv(this.addr,t)}function H0(s,e){const t=gr(e,this.size,3);s.uniform3fv(this.addr,t)}function V0(s,e){const t=gr(e,this.size,4);s.uniform4fv(this.addr,t)}function G0(s,e){const t=gr(e,this.size,4);s.uniformMatrix2fv(this.addr,!1,t)}function W0(s,e){const t=gr(e,this.size,9);s.uniformMatrix3fv(this.addr,!1,t)}function j0(s,e){const t=gr(e,this.size,16);s.uniformMatrix4fv(this.addr,!1,t)}function q0(s,e){s.uniform1iv(this.addr,e)}function X0(s,e){s.uniform2iv(this.addr,e)}function Y0(s,e){s.uniform3iv(this.addr,e)}function Z0(s,e){s.uniform4iv(this.addr,e)}function J0(s,e){s.uniform1uiv(this.addr,e)}function $0(s,e){s.uniform2uiv(this.addr,e)}function K0(s,e){s.uniform3uiv(this.addr,e)}function Q0(s,e){s.uniform4uiv(this.addr,e)}function ev(s,e,t){const n=e.length,i=lo(t,n);s.uniform1iv(this.addr,i);for(let r=0;r!==n;++r)t.safeSetTexture2D(e[r]||zm,i[r])}function tv(s,e,t){const n=e.length,i=lo(t,n);s.uniform1iv(this.addr,i);for(let r=0;r!==n;++r)t.setTexture3D(e[r]||Hm,i[r])}function nv(s,e,t){const n=e.length,i=lo(t,n);s.uniform1iv(this.addr,i);for(let r=0;r!==n;++r)t.safeSetTextureCube(e[r]||Vm,i[r])}function iv(s,e,t){const n=e.length,i=lo(t,n);s.uniform1iv(this.addr,i);for(let r=0;r!==n;++r)t.setTexture2DArray(e[r]||Bm,i[r])}function rv(s,e,t){this.id=s,this.addr=t,this.cache=[],this.setValue=function(n){switch(n){case 5126:return b0;case 35664:return w0;case 35665:return _0;case 35666:return M0;case 35674:return S0;case 35675:return T0;case 35676:return E0;case 5124:case 35670:return A0;case 35667:case 35671:return R0;case 35668:case 35672:return L0;case 35669:case 35673:return C0;case 5125:return P0;case 36294:return I0;case 36295:return D0;case 36296:return N0;case 35678:case 36198:case 36298:case 36306:case 35682:return F0;case 35679:case 36299:case 36307:return O0;case 35680:case 36300:case 36308:case 36293:return U0;case 36289:case 36303:case 36311:case 36292:return k0}}(e.type)}function Gm(s,e,t){this.id=s,this.addr=t,this.cache=[],this.size=e.size,this.setValue=function(n){switch(n){case 5126:return z0;case 35664:return B0;case 35665:return H0;case 35666:return V0;case 35674:return G0;case 35675:return W0;case 35676:return j0;case 5124:case 35670:return q0;case 35667:case 35671:return X0;case 35668:case 35672:return Y0;case 35669:case 35673:return Z0;case 5125:return J0;case 36294:return $0;case 36295:return K0;case 36296:return Q0;case 35678:case 36198:case 36298:case 36306:case 35682:return ev;case 35679:case 36299:case 36307:return tv;case 35680:case 36300:case 36308:case 36293:return nv;case 36289:case 36303:case 36311:case 36292:return iv}}(e.type)}function Wm(s){this.id=s,this.seq=[],this.map={}}Gm.prototype.updateCache=function(s){const e=this.cache;s instanceof Float32Array&&e.length!==s.length&&(this.cache=new Float32Array(s.length)),ut(e,s)},Wm.prototype.setValue=function(s,e,t){const n=this.seq;for(let i=0,r=n.length;i!==r;++i){const a=n[i];a.setValue(s,e[a.id],t)}};const Zo=/(\w+)(\])?(\[|\.)?/g;function au(s,e){s.seq.push(e),s.map[e.id]=e}function sv(s,e,t){const n=s.name,i=n.length;for(Zo.lastIndex=0;;){const r=Zo.exec(n),a=Zo.lastIndex;let o=r[1];const l=r[2]==="]",c=r[3];if(l&&(o|=0),c===void 0||c==="["&&a+2===i){au(t,c===void 0?new rv(o,s,e):new Gm(o,s,e));break}{let h=t.map[o];h===void 0&&(h=new Wm(o),au(t,h)),t=h}}}function Yn(s,e){this.seq=[],this.map={};const t=s.getProgramParameter(e,35718);for(let n=0;n<t;++n){const i=s.getActiveUniform(e,n);sv(i,s.getUniformLocation(e,i.name),this)}}function ou(s,e,t){const n=s.createShader(e);return s.shaderSource(n,t),s.compileShader(n),n}Yn.prototype.setValue=function(s,e,t,n){const i=this.map[e];i!==void 0&&i.setValue(s,t,n)},Yn.prototype.setOptional=function(s,e,t){const n=e[t];n!==void 0&&this.setValue(s,t,n)},Yn.upload=function(s,e,t,n){for(let i=0,r=e.length;i!==r;++i){const a=e[i],o=t[a.id];o.needsUpdate!==!1&&a.setValue(s,o.value,n)}},Yn.seqWithValue=function(s,e){const t=[];for(let n=0,i=s.length;n!==i;++n){const r=s[n];r.id in e&&t.push(r)}return t};let av=0;function jm(s){switch(s){case 3e3:return["Linear","( value )"];case 3001:return["sRGB","( value )"];default:return console.warn("THREE.WebGLProgram: Unsupported encoding:",s),["Linear","( value )"]}}function lu(s,e,t){const n=s.getShaderParameter(e,35713),i=s.getShaderInfoLog(e).trim();return n&&i===""?"":t.toUpperCase()+`

`+i+`

`+function(r){const a=r.split(`
`);for(let o=0;o<a.length;o++)a[o]=o+1+": "+a[o];return a.join(`
`)}(s.getShaderSource(e))}function ai(s,e){const t=jm(e);return"vec4 "+s+"( vec4 value ) { return "+t[0]+"ToLinear"+t[1]+"; }"}function ov(s,e){const t=jm(e);return"vec4 "+s+"( vec4 value ) { return LinearTo"+t[0]+t[1]+"; }"}function lv(s,e){let t;switch(e){case 1:t="Linear";break;case 2:t="Reinhard";break;case 3:t="OptimizedCineon";break;case 4:t="ACESFilmic";break;case 5:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+s+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}function Cr(s){return s!==""}function cu(s,e){return s.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function hu(s,e){return s.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const cv=/^[ \t]*#include +<([\w\d./]+)>/gm;function Mc(s){return s.replace(cv,hv)}function hv(s,e){const t=_e[e];if(t===void 0)throw new Error("Can not resolve #include <"+e+">");return Mc(t)}const uv=/#pragma unroll_loop[\s]+?for \( int i \= (\d+)\; i < (\d+)\; i \+\+ \) \{([\s\S]+?)(?=\})\}/g,dv=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function uu(s){return s.replace(dv,qm).replace(uv,pv)}function pv(s,e,t,n){return console.warn("WebGLProgram: #pragma unroll_loop shader syntax is deprecated. Please use #pragma unroll_loop_start syntax instead."),qm(s,e,t,n)}function qm(s,e,t,n){let i="";for(let r=parseInt(e);r<parseInt(t);r++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return i}function du(s){let e="precision "+s.precision+` float;
precision `+s.precision+" int;";return s.precision==="highp"?e+=`
#define HIGH_PRECISION`:s.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:s.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function mv(s,e,t,n){const i=s.getContext(),r=t.defines;let a=t.vertexShader,o=t.fragmentShader;const l=function(M){let L="SHADOWMAP_TYPE_BASIC";return M.shadowMapType===1?L="SHADOWMAP_TYPE_PCF":M.shadowMapType===2?L="SHADOWMAP_TYPE_PCF_SOFT":M.shadowMapType===3&&(L="SHADOWMAP_TYPE_VSM"),L}(t),c=function(M){let L="ENVMAP_TYPE_CUBE";if(M.envMap)switch(M.envMapMode){case 301:case 302:L="ENVMAP_TYPE_CUBE";break;case 306:case 307:L="ENVMAP_TYPE_CUBE_UV"}return L}(t),h=function(M){let L="ENVMAP_MODE_REFLECTION";if(M.envMap)switch(M.envMapMode){case 302:case 307:L="ENVMAP_MODE_REFRACTION"}return L}(t),u=function(M){let L="ENVMAP_BLENDING_NONE";if(M.envMap)switch(M.combine){case 0:L="ENVMAP_BLENDING_MULTIPLY";break;case 1:L="ENVMAP_BLENDING_MIX";break;case 2:L="ENVMAP_BLENDING_ADD"}return L}(t),d=t.isWebGL2?"":function(M){return[M.extensionDerivatives||M.envMapCubeUV||M.bumpMap||M.tangentSpaceNormalMap||M.clearcoatNormalMap||M.flatShading||M.shaderID==="physical"?"#extension GL_OES_standard_derivatives : enable":"",(M.extensionFragDepth||M.logarithmicDepthBuffer)&&M.rendererExtensionFragDepth?"#extension GL_EXT_frag_depth : enable":"",M.extensionDrawBuffers&&M.rendererExtensionDrawBuffers?"#extension GL_EXT_draw_buffers : require":"",(M.extensionShaderTextureLOD||M.envMap||M.transmission)&&M.rendererExtensionShaderTextureLod?"#extension GL_EXT_shader_texture_lod : enable":""].filter(Cr).join(`
`)}(t),p=function(M){const L=[];for(const I in M){const P=M[I];P!==!1&&L.push("#define "+I+" "+P)}return L.join(`
`)}(r),m=i.createProgram();let f,g,x=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(f=[p].filter(Cr).join(`
`),f.length>0&&(f+=`
`),g=[d,p].filter(Cr).join(`
`),g.length>0&&(g+=`
`)):(f=[du(t),"#define SHADER_NAME "+t.shaderName,p,t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.supportsVertexTextures?"#define VERTEX_TEXTURES":"","#define MAX_BONES "+t.maxBones,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMap&&t.objectSpaceNormalMap?"#define OBJECTSPACE_NORMALMAP":"",t.normalMap&&t.tangentSpaceNormalMap?"#define TANGENTSPACE_NORMALMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.displacementMap&&t.supportsVertexTextures?"#define USE_DISPLACEMENTMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularIntensityMap?"#define USE_SPECULARINTENSITYMAP":"",t.specularColorMap?"#define USE_SPECULARCOLORMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEENCOLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEENROUGHNESSMAP":"",t.vertexTangents?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUvs?"#define USE_UV":"",t.uvsVertexOnly?"#define UVS_VERTEX_ONLY":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.useVertexTexture?"#define BONE_TEXTURE":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphTargets&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE":"",t.morphTargets&&t.isWebGL2?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )","	attribute vec3 morphTarget0;","	attribute vec3 morphTarget1;","	attribute vec3 morphTarget2;","	attribute vec3 morphTarget3;","	#ifdef USE_MORPHNORMALS","		attribute vec3 morphNormal0;","		attribute vec3 morphNormal1;","		attribute vec3 morphNormal2;","		attribute vec3 morphNormal3;","	#else","		attribute vec3 morphTarget4;","		attribute vec3 morphTarget5;","		attribute vec3 morphTarget6;","		attribute vec3 morphTarget7;","	#endif","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Cr).join(`
`),g=[d,du(t),"#define SHADER_NAME "+t.shaderName,p,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMap&&t.objectSpaceNormalMap?"#define OBJECTSPACE_NORMALMAP":"",t.normalMap&&t.tangentSpaceNormalMap?"#define TANGENTSPACE_NORMALMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularIntensityMap?"#define USE_SPECULARINTENSITYMAP":"",t.specularColorMap?"#define USE_SPECULARCOLORMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEENCOLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEENROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUvs?"#define USE_UV":"",t.uvsVertexOnly?"#define UVS_VERTEX_ONLY":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.physicallyCorrectLights?"#define PHYSICALLY_CORRECT_LIGHTS":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"",(t.extensionShaderTextureLOD||t.envMap)&&t.rendererExtensionShaderTextureLod?"#define TEXTURE_LOD_EXT":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==0?"#define TONE_MAPPING":"",t.toneMapping!==0?_e.tonemapping_pars_fragment:"",t.toneMapping!==0?lv("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.format===1022?"#define OPAQUE":"",_e.encodings_pars_fragment,t.map?ai("mapTexelToLinear",t.mapEncoding):"",t.matcap?ai("matcapTexelToLinear",t.matcapEncoding):"",t.envMap?ai("envMapTexelToLinear",t.envMapEncoding):"",t.emissiveMap?ai("emissiveMapTexelToLinear",t.emissiveMapEncoding):"",t.specularColorMap?ai("specularColorMapTexelToLinear",t.specularColorMapEncoding):"",t.sheenColorMap?ai("sheenColorMapTexelToLinear",t.sheenColorMapEncoding):"",t.lightMap?ai("lightMapTexelToLinear",t.lightMapEncoding):"",ov("linearToOutputTexel",t.outputEncoding),t.depthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Cr).join(`
`)),a=Mc(a),a=cu(a,t),a=hu(a,t),o=Mc(o),o=cu(o,t),o=hu(o,t),a=uu(a),o=uu(o),t.isWebGL2&&t.isRawShaderMaterial!==!0&&(x=`#version 300 es
`,f=["precision mediump sampler2DArray;","#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+f,g=["#define varying in",t.glslVersion==="300 es"?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion==="300 es"?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+g);const v=x+g+o,y=ou(i,35633,x+f+a),b=ou(i,35632,v);if(i.attachShader(m,y),i.attachShader(m,b),t.index0AttributeName!==void 0?i.bindAttribLocation(m,0,t.index0AttributeName):t.morphTargets===!0&&i.bindAttribLocation(m,0,"position"),i.linkProgram(m),s.debug.checkShaderErrors){const M=i.getProgramInfoLog(m).trim(),L=i.getShaderInfoLog(y).trim(),I=i.getShaderInfoLog(b).trim();let P=!0,N=!0;if(i.getProgramParameter(m,35714)===!1){P=!1;const W=lu(i,y,"vertex"),G=lu(i,b,"fragment");console.error("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(m,35715)+`

Program Info Log: `+M+`
`+W+`
`+G)}else M!==""?console.warn("THREE.WebGLProgram: Program Info Log:",M):L!==""&&I!==""||(N=!1);N&&(this.diagnostics={runnable:P,programLog:M,vertexShader:{log:L,prefix:f},fragmentShader:{log:I,prefix:g}})}let w,S;return i.deleteShader(y),i.deleteShader(b),this.getUniforms=function(){return w===void 0&&(w=new Yn(i,m)),w},this.getAttributes=function(){return S===void 0&&(S=function(M,L){const I={},P=M.getProgramParameter(L,35721);for(let N=0;N<P;N++){const W=M.getActiveAttrib(L,N),G=W.name;let U=1;W.type===35674&&(U=2),W.type===35675&&(U=3),W.type===35676&&(U=4),I[G]={type:W.type,location:M.getAttribLocation(L,G),locationSize:U}}return I}(i,m)),S},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(m),this.program=void 0},this.name=t.shaderName,this.id=av++,this.cacheKey=e,this.usedTimes=1,this.program=m,this.vertexShader=y,this.fragmentShader=b,this}let fv=0;class gv{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,i=this._getShaderStage(t),r=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(i)===!1&&(a.add(i),i.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;return t.has(e)===!1&&t.set(e,new Set),t.get(e)}_getShaderStage(e){const t=this.shaderCache;if(t.has(e)===!1){const n=new vv;t.set(e,n)}return t.get(e)}}class vv{constructor(){this.id=fv++,this.usedTimes=0}}function yv(s,e,t,n,i,r,a){const o=new Kc,l=new gv,c=[],h=i.isWebGL2,u=i.logarithmicDepthBuffer,d=i.floatVertexTextures,p=i.maxVertexUniforms,m=i.vertexTextures;let f=i.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(v){let y;return v&&v.isTexture?y=v.encoding:v&&v.isWebGLRenderTarget?(console.warn("THREE.WebGLPrograms.getTextureEncodingFromMap: don't use render targets as textures. Use their .texture property instead."),y=v.texture.encoding):y=3e3,h&&v&&v.isTexture&&v.format===1023&&v.type===1009&&v.encoding===3001&&(y=3e3),y}return{getParameters:function(v,y,b,w,S){const M=w.fog,L=v.isMeshStandardMaterial?w.environment:null,I=(v.isMeshStandardMaterial?t:e).get(v.envMap||L),P=g[v.type],N=S.isSkinnedMesh?function(X){const Z=X.skeleton.bones;if(d)return 1024;{const te=p,ee=Math.floor((te-20)/4),ce=Math.min(ee,Z.length);return ce<Z.length?(console.warn("THREE.WebGLRenderer: Skeleton has "+Z.length+" bones. This GPU supports "+ce+"."),0):ce}}(S):0;let W,G,U,j;if(v.precision!==null&&(f=i.getMaxPrecision(v.precision),f!==v.precision&&console.warn("THREE.WebGLProgram.getParameters:",v.precision,"not supported, using",f,"instead.")),P){const X=tn[P];W=X.vertexShader,G=X.fragmentShader}else W=v.vertexShader,G=v.fragmentShader,l.update(v),U=l.getVertexShaderID(v),j=l.getFragmentShaderID(v);const ne=s.getRenderTarget(),ie=v.alphaTest>0,B=v.clearcoat>0;return{isWebGL2:h,shaderID:P,shaderName:v.type,vertexShader:W,fragmentShader:G,defines:v.defines,customVertexShaderID:U,customFragmentShaderID:j,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:f,instancing:S.isInstancedMesh===!0,instancingColor:S.isInstancedMesh===!0&&S.instanceColor!==null,supportsVertexTextures:m,outputEncoding:ne!==null?x(ne.texture):s.outputEncoding,map:!!v.map,mapEncoding:x(v.map),matcap:!!v.matcap,matcapEncoding:x(v.matcap),envMap:!!I,envMapMode:I&&I.mapping,envMapEncoding:x(I),envMapCubeUV:!!I&&(I.mapping===306||I.mapping===307),lightMap:!!v.lightMap,lightMapEncoding:x(v.lightMap),aoMap:!!v.aoMap,emissiveMap:!!v.emissiveMap,emissiveMapEncoding:x(v.emissiveMap),bumpMap:!!v.bumpMap,normalMap:!!v.normalMap,objectSpaceNormalMap:v.normalMapType===1,tangentSpaceNormalMap:v.normalMapType===0,clearcoat:B,clearcoatMap:B&&!!v.clearcoatMap,clearcoatRoughnessMap:B&&!!v.clearcoatRoughnessMap,clearcoatNormalMap:B&&!!v.clearcoatNormalMap,displacementMap:!!v.displacementMap,roughnessMap:!!v.roughnessMap,metalnessMap:!!v.metalnessMap,specularMap:!!v.specularMap,specularIntensityMap:!!v.specularIntensityMap,specularColorMap:!!v.specularColorMap,specularColorMapEncoding:x(v.specularColorMap),alphaMap:!!v.alphaMap,alphaTest:ie,gradientMap:!!v.gradientMap,sheen:v.sheen>0,sheenColorMap:!!v.sheenColorMap,sheenColorMapEncoding:x(v.sheenColorMap),sheenRoughnessMap:!!v.sheenRoughnessMap,transmission:v.transmission>0,transmissionMap:!!v.transmissionMap,thicknessMap:!!v.thicknessMap,combine:v.combine,vertexTangents:!!v.normalMap&&!!S.geometry&&!!S.geometry.attributes.tangent,vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&!!S.geometry&&!!S.geometry.attributes.color&&S.geometry.attributes.color.itemSize===4,vertexUvs:!!(v.map||v.bumpMap||v.normalMap||v.specularMap||v.alphaMap||v.emissiveMap||v.roughnessMap||v.metalnessMap||v.clearcoatMap||v.clearcoatRoughnessMap||v.clearcoatNormalMap||v.displacementMap||v.transmissionMap||v.thicknessMap||v.specularIntensityMap||v.specularColorMap||v.sheenColorMap||v.sheenRoughnessMap),uvsVertexOnly:!(v.map||v.bumpMap||v.normalMap||v.specularMap||v.alphaMap||v.emissiveMap||v.roughnessMap||v.metalnessMap||v.clearcoatNormalMap||v.transmission>0||v.transmissionMap||v.thicknessMap||v.specularIntensityMap||v.specularColorMap||v.sheen>0||v.sheenColorMap||v.sheenRoughnessMap||!v.displacementMap),fog:!!M,useFog:v.fog,fogExp2:M&&M.isFogExp2,flatShading:!!v.flatShading,sizeAttenuation:v.sizeAttenuation,logarithmicDepthBuffer:u,skinning:S.isSkinnedMesh===!0&&N>0,maxBones:N,useVertexTexture:d,morphTargets:!!S.geometry&&!!S.geometry.morphAttributes.position,morphNormals:!!S.geometry&&!!S.geometry.morphAttributes.normal,morphTargetsCount:S.geometry&&S.geometry.morphAttributes.position?S.geometry.morphAttributes.position.length:0,numDirLights:y.directional.length,numPointLights:y.point.length,numSpotLights:y.spot.length,numRectAreaLights:y.rectArea.length,numHemiLights:y.hemi.length,numDirLightShadows:y.directionalShadowMap.length,numPointLightShadows:y.pointShadowMap.length,numSpotLightShadows:y.spotShadowMap.length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,format:v.format,dithering:v.dithering,shadowMapEnabled:s.shadowMap.enabled&&b.length>0,shadowMapType:s.shadowMap.type,toneMapping:v.toneMapped?s.toneMapping:0,physicallyCorrectLights:s.physicallyCorrectLights,premultipliedAlpha:v.premultipliedAlpha,doubleSided:v.side===2,flipSided:v.side===1,depthPacking:v.depthPacking!==void 0&&v.depthPacking,index0AttributeName:v.index0AttributeName,extensionDerivatives:v.extensions&&v.extensions.derivatives,extensionFragDepth:v.extensions&&v.extensions.fragDepth,extensionDrawBuffers:v.extensions&&v.extensions.drawBuffers,extensionShaderTextureLOD:v.extensions&&v.extensions.shaderTextureLOD,rendererExtensionFragDepth:h||n.has("EXT_frag_depth"),rendererExtensionDrawBuffers:h||n.has("WEBGL_draw_buffers"),rendererExtensionShaderTextureLod:h||n.has("EXT_shader_texture_lod"),customProgramCacheKey:v.customProgramCacheKey()}},getProgramCacheKey:function(v){const y=[];if(v.shaderID?y.push(v.shaderID):(y.push(v.customVertexShaderID),y.push(v.customFragmentShaderID)),v.defines!==void 0)for(const b in v.defines)y.push(b),y.push(v.defines[b]);return v.isRawShaderMaterial===!1&&(function(b,w){b.push(w.precision),b.push(w.outputEncoding),b.push(w.mapEncoding),b.push(w.matcapEncoding),b.push(w.envMapMode),b.push(w.envMapEncoding),b.push(w.lightMapEncoding),b.push(w.emissiveMapEncoding),b.push(w.combine),b.push(w.vertexUvs),b.push(w.fogExp2),b.push(w.sizeAttenuation),b.push(w.maxBones),b.push(w.morphTargetsCount),b.push(w.numDirLights),b.push(w.numPointLights),b.push(w.numSpotLights),b.push(w.numHemiLights),b.push(w.numRectAreaLights),b.push(w.numDirLightShadows),b.push(w.numPointLightShadows),b.push(w.numSpotLightShadows),b.push(w.shadowMapType),b.push(w.toneMapping),b.push(w.numClippingPlanes),b.push(w.numClipIntersection),b.push(w.format),b.push(w.specularColorMapEncoding),b.push(w.sheenColorMapEncoding)}(y,v),function(b,w){o.disableAll(),w.isWebGL2&&o.enable(0),w.supportsVertexTextures&&o.enable(1),w.instancing&&o.enable(2),w.instancingColor&&o.enable(3),w.map&&o.enable(4),w.matcap&&o.enable(5),w.envMap&&o.enable(6),w.envMapCubeUV&&o.enable(7),w.lightMap&&o.enable(8),w.aoMap&&o.enable(9),w.emissiveMap&&o.enable(10),w.bumpMap&&o.enable(11),w.normalMap&&o.enable(12),w.objectSpaceNormalMap&&o.enable(13),w.tangentSpaceNormalMap&&o.enable(14),w.clearcoat&&o.enable(15),w.clearcoatMap&&o.enable(16),w.clearcoatRoughnessMap&&o.enable(17),w.clearcoatNormalMap&&o.enable(18),w.displacementMap&&o.enable(19),w.specularMap&&o.enable(20),w.roughnessMap&&o.enable(21),w.metalnessMap&&o.enable(22),w.gradientMap&&o.enable(23),w.alphaMap&&o.enable(24),w.alphaTest&&o.enable(25),w.vertexColors&&o.enable(26),w.vertexAlphas&&o.enable(27),w.vertexUvs&&o.enable(28),w.vertexTangents&&o.enable(29),w.uvsVertexOnly&&o.enable(30),w.fog&&o.enable(31),b.push(o.mask),o.disableAll(),w.useFog&&o.enable(0),w.flatShading&&o.enable(1),w.logarithmicDepthBuffer&&o.enable(2),w.skinning&&o.enable(3),w.useVertexTexture&&o.enable(4),w.morphTargets&&o.enable(5),w.morphNormals&&o.enable(6),w.premultipliedAlpha&&o.enable(7),w.shadowMapEnabled&&o.enable(8),w.physicallyCorrectLights&&o.enable(9),w.doubleSided&&o.enable(10),w.flipSided&&o.enable(11),w.depthPacking&&o.enable(12),w.dithering&&o.enable(13),w.specularIntensityMap&&o.enable(14),w.specularColorMap&&o.enable(15),w.transmission&&o.enable(16),w.transmissionMap&&o.enable(17),w.thicknessMap&&o.enable(18),w.sheen&&o.enable(19),w.sheenColorMap&&o.enable(20),w.sheenRoughnessMap&&o.enable(21),b.push(o.mask)}(y,v),y.push(s.outputEncoding)),y.push(v.customProgramCacheKey),y.join()},getUniforms:function(v){const y=g[v.type];let b;if(y){const w=tn[y];b=Qg.clone(w.uniforms)}else b=v.uniforms;return b},acquireProgram:function(v,y){let b;for(let w=0,S=c.length;w<S;w++){const M=c[w];if(M.cacheKey===y){b=M,++b.usedTimes;break}}return b===void 0&&(b=new mv(s,y,v,r),c.push(b)),b},releaseProgram:function(v){if(--v.usedTimes==0){const y=c.indexOf(v);c[y]=c[c.length-1],c.pop(),v.destroy()}},releaseShaderCache:function(v){l.remove(v)},programs:c,dispose:function(){l.dispose()}}}function xv(){let s=new WeakMap;return{get:function(e){let t=s.get(e);return t===void 0&&(t={},s.set(e,t)),t},remove:function(e){s.delete(e)},update:function(e,t,n){s.get(e)[t]=n},dispose:function(){s=new WeakMap}}}function bv(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.material.id!==e.material.id?s.material.id-e.material.id:s.z!==e.z?s.z-e.z:s.id-e.id}function pu(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.z!==e.z?e.z-s.z:s.id-e.id}function mu(){const s=[];let e=0;const t=[],n=[],i=[];function r(a,o,l,c,h,u){let d=s[e];return d===void 0?(d={id:a.id,object:a,geometry:o,material:l,groupOrder:c,renderOrder:a.renderOrder,z:h,group:u},s[e]=d):(d.id=a.id,d.object=a,d.geometry=o,d.material=l,d.groupOrder=c,d.renderOrder=a.renderOrder,d.z=h,d.group=u),e++,d}return{opaque:t,transmissive:n,transparent:i,init:function(){e=0,t.length=0,n.length=0,i.length=0},push:function(a,o,l,c,h,u){const d=r(a,o,l,c,h,u);l.transmission>0?n.push(d):l.transparent===!0?i.push(d):t.push(d)},unshift:function(a,o,l,c,h,u){const d=r(a,o,l,c,h,u);l.transmission>0?n.unshift(d):l.transparent===!0?i.unshift(d):t.unshift(d)},finish:function(){for(let a=e,o=s.length;a<o;a++){const l=s[a];if(l.id===null)break;l.id=null,l.object=null,l.geometry=null,l.material=null,l.group=null}},sort:function(a,o){t.length>1&&t.sort(a||bv),n.length>1&&n.sort(o||pu),i.length>1&&i.sort(o||pu)}}}function wv(){let s=new WeakMap;return{get:function(e,t){let n;return s.has(e)===!1?(n=new mu,s.set(e,[n])):t>=s.get(e).length?(n=new mu,s.get(e).push(n)):n=s.get(e)[t],n},dispose:function(){s=new WeakMap}}}function _v(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new T,color:new le};break;case"SpotLight":t={position:new T,direction:new T,color:new le,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new T,color:new le,distance:0,decay:0};break;case"HemisphereLight":t={direction:new T,skyColor:new le,groundColor:new le};break;case"RectAreaLight":t={color:new le,position:new T,halfWidth:new T,halfHeight:new T}}return s[e.id]=t,t}}}let Mv=0;function Sv(s,e){return(e.castShadow?1:0)-(s.castShadow?1:0)}function Tv(s,e){const t=new _v,n=function(){const l={};return{get:function(c){if(l[c.id]!==void 0)return l[c.id];let h;switch(c.type){case"DirectionalLight":case"SpotLight":h={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new $};break;case"PointLight":h={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new $,shadowCameraNear:1,shadowCameraFar:1e3}}return l[c.id]=h,h}}}(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotShadow:[],spotShadowMap:[],spotShadowMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[]};for(let l=0;l<9;l++)i.probe.push(new T);const r=new T,a=new he,o=new he;return{setup:function(l,c){let h=0,u=0,d=0;for(let M=0;M<9;M++)i.probe[M].set(0,0,0);let p=0,m=0,f=0,g=0,x=0,v=0,y=0,b=0;l.sort(Sv);const w=c!==!0?Math.PI:1;for(let M=0,L=l.length;M<L;M++){const I=l[M],P=I.color,N=I.intensity,W=I.distance,G=I.shadow&&I.shadow.map?I.shadow.map.texture:null;if(I.isAmbientLight)h+=P.r*N*w,u+=P.g*N*w,d+=P.b*N*w;else if(I.isLightProbe)for(let U=0;U<9;U++)i.probe[U].addScaledVector(I.sh.coefficients[U],N);else if(I.isDirectionalLight){const U=t.get(I);if(U.color.copy(I.color).multiplyScalar(I.intensity*w),I.castShadow){const j=I.shadow,ne=n.get(I);ne.shadowBias=j.bias,ne.shadowNormalBias=j.normalBias,ne.shadowRadius=j.radius,ne.shadowMapSize=j.mapSize,i.directionalShadow[p]=ne,i.directionalShadowMap[p]=G,i.directionalShadowMatrix[p]=I.shadow.matrix,v++}i.directional[p]=U,p++}else if(I.isSpotLight){const U=t.get(I);if(U.position.setFromMatrixPosition(I.matrixWorld),U.color.copy(P).multiplyScalar(N*w),U.distance=W,U.coneCos=Math.cos(I.angle),U.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),U.decay=I.decay,I.castShadow){const j=I.shadow,ne=n.get(I);ne.shadowBias=j.bias,ne.shadowNormalBias=j.normalBias,ne.shadowRadius=j.radius,ne.shadowMapSize=j.mapSize,i.spotShadow[f]=ne,i.spotShadowMap[f]=G,i.spotShadowMatrix[f]=I.shadow.matrix,b++}i.spot[f]=U,f++}else if(I.isRectAreaLight){const U=t.get(I);U.color.copy(P).multiplyScalar(N),U.halfWidth.set(.5*I.width,0,0),U.halfHeight.set(0,.5*I.height,0),i.rectArea[g]=U,g++}else if(I.isPointLight){const U=t.get(I);if(U.color.copy(I.color).multiplyScalar(I.intensity*w),U.distance=I.distance,U.decay=I.decay,I.castShadow){const j=I.shadow,ne=n.get(I);ne.shadowBias=j.bias,ne.shadowNormalBias=j.normalBias,ne.shadowRadius=j.radius,ne.shadowMapSize=j.mapSize,ne.shadowCameraNear=j.camera.near,ne.shadowCameraFar=j.camera.far,i.pointShadow[m]=ne,i.pointShadowMap[m]=G,i.pointShadowMatrix[m]=I.shadow.matrix,y++}i.point[m]=U,m++}else if(I.isHemisphereLight){const U=t.get(I);U.skyColor.copy(I.color).multiplyScalar(N*w),U.groundColor.copy(I.groundColor).multiplyScalar(N*w),i.hemi[x]=U,x++}}g>0&&(e.isWebGL2||s.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=oe.LTC_FLOAT_1,i.rectAreaLTC2=oe.LTC_FLOAT_2):s.has("OES_texture_half_float_linear")===!0?(i.rectAreaLTC1=oe.LTC_HALF_1,i.rectAreaLTC2=oe.LTC_HALF_2):console.error("THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.")),i.ambient[0]=h,i.ambient[1]=u,i.ambient[2]=d;const S=i.hash;S.directionalLength===p&&S.pointLength===m&&S.spotLength===f&&S.rectAreaLength===g&&S.hemiLength===x&&S.numDirectionalShadows===v&&S.numPointShadows===y&&S.numSpotShadows===b||(i.directional.length=p,i.spot.length=f,i.rectArea.length=g,i.point.length=m,i.hemi.length=x,i.directionalShadow.length=v,i.directionalShadowMap.length=v,i.pointShadow.length=y,i.pointShadowMap.length=y,i.spotShadow.length=b,i.spotShadowMap.length=b,i.directionalShadowMatrix.length=v,i.pointShadowMatrix.length=y,i.spotShadowMatrix.length=b,S.directionalLength=p,S.pointLength=m,S.spotLength=f,S.rectAreaLength=g,S.hemiLength=x,S.numDirectionalShadows=v,S.numPointShadows=y,S.numSpotShadows=b,i.version=Mv++)},setupView:function(l,c){let h=0,u=0,d=0,p=0,m=0;const f=c.matrixWorldInverse;for(let g=0,x=l.length;g<x;g++){const v=l[g];if(v.isDirectionalLight){const y=i.directional[h];y.direction.setFromMatrixPosition(v.matrixWorld),r.setFromMatrixPosition(v.target.matrixWorld),y.direction.sub(r),y.direction.transformDirection(f),h++}else if(v.isSpotLight){const y=i.spot[d];y.position.setFromMatrixPosition(v.matrixWorld),y.position.applyMatrix4(f),y.direction.setFromMatrixPosition(v.matrixWorld),r.setFromMatrixPosition(v.target.matrixWorld),y.direction.sub(r),y.direction.transformDirection(f),d++}else if(v.isRectAreaLight){const y=i.rectArea[p];y.position.setFromMatrixPosition(v.matrixWorld),y.position.applyMatrix4(f),o.identity(),a.copy(v.matrixWorld),a.premultiply(f),o.extractRotation(a),y.halfWidth.set(.5*v.width,0,0),y.halfHeight.set(0,.5*v.height,0),y.halfWidth.applyMatrix4(o),y.halfHeight.applyMatrix4(o),p++}else if(v.isPointLight){const y=i.point[u];y.position.setFromMatrixPosition(v.matrixWorld),y.position.applyMatrix4(f),u++}else if(v.isHemisphereLight){const y=i.hemi[m];y.direction.setFromMatrixPosition(v.matrixWorld),y.direction.transformDirection(f),y.direction.normalize(),m++}}},state:i}}function fu(s,e){const t=new Tv(s,e),n=[],i=[];return{init:function(){n.length=0,i.length=0},state:{lightsArray:n,shadowsArray:i,lights:t},setupLights:function(r){t.setup(n,r)},setupLightsView:function(r){t.setupView(n,r)},pushLight:function(r){n.push(r)},pushShadow:function(r){i.push(r)}}}function Ev(s,e){let t=new WeakMap;return{get:function(n,i=0){let r;return t.has(n)===!1?(r=new fu(s,e),t.set(n,[r])):i>=t.get(n).length?(r=new fu(s,e),t.get(n).push(r)):r=t.get(n)[i],r},dispose:function(){t=new WeakMap}}}class Xm extends Je{constructor(e){super(),this.type="MeshDepthMaterial",this.depthPacking=3200,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}Xm.prototype.isMeshDepthMaterial=!0;class Ym extends Je{constructor(e){super(),this.type="MeshDistanceMaterial",this.referencePosition=new T,this.nearDistance=1,this.farDistance=1e3,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.fog=!1,this.setValues(e)}copy(e){return super.copy(e),this.referencePosition.copy(e.referencePosition),this.nearDistance=e.nearDistance,this.farDistance=e.farDistance,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}Ym.prototype.isMeshDistanceMaterial=!0;function Zm(s,e,t){let n=new ao;const i=new $,r=new $,a=new Ue,o=new Xm({depthPacking:3201}),l=new Ym,c={},h=t.maxTextureSize,u={0:1,1:0,2:2},d=new Pn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new $},radius:{value:4}},vertexShader:`void main() {
	gl_Position = vec4( position, 1.0 );
}`,fragmentShader:`uniform sampler2D shadow_pass;
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
}`}),p=d.clone();p.defines.HORIZONTAL_PASS=1;const m=new Oe;m.setAttribute("position",new ke(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const f=new me(m,d),g=this;function x(b,w){const S=e.update(f);d.defines.VSM_SAMPLES!==b.blurSamples&&(d.defines.VSM_SAMPLES=b.blurSamples,p.defines.VSM_SAMPLES=b.blurSamples,d.needsUpdate=!0,p.needsUpdate=!0),d.uniforms.shadow_pass.value=b.map.texture,d.uniforms.resolution.value=b.mapSize,d.uniforms.radius.value=b.radius,s.setRenderTarget(b.mapPass),s.clear(),s.renderBufferDirect(w,null,S,d,f,null),p.uniforms.shadow_pass.value=b.mapPass.texture,p.uniforms.resolution.value=b.mapSize,p.uniforms.radius.value=b.radius,s.setRenderTarget(b.map),s.clear(),s.renderBufferDirect(w,null,S,p,f,null)}function v(b,w,S,M,L,I,P){let N=null;const W=M.isPointLight===!0?b.customDistanceMaterial:b.customDepthMaterial;if(N=W!==void 0?W:M.isPointLight===!0?l:o,s.localClippingEnabled&&S.clipShadows===!0&&S.clippingPlanes.length!==0||S.displacementMap&&S.displacementScale!==0||S.alphaMap&&S.alphaTest>0){const G=N.uuid,U=S.uuid;let j=c[G];j===void 0&&(j={},c[G]=j);let ne=j[U];ne===void 0&&(ne=N.clone(),j[U]=ne),N=ne}return N.visible=S.visible,N.wireframe=S.wireframe,N.side=P===3?S.shadowSide!==null?S.shadowSide:S.side:S.shadowSide!==null?S.shadowSide:u[S.side],N.alphaMap=S.alphaMap,N.alphaTest=S.alphaTest,N.clipShadows=S.clipShadows,N.clippingPlanes=S.clippingPlanes,N.clipIntersection=S.clipIntersection,N.displacementMap=S.displacementMap,N.displacementScale=S.displacementScale,N.displacementBias=S.displacementBias,N.wireframeLinewidth=S.wireframeLinewidth,N.linewidth=S.linewidth,M.isPointLight===!0&&N.isMeshDistanceMaterial===!0&&(N.referencePosition.setFromMatrixPosition(M.matrixWorld),N.nearDistance=L,N.farDistance=I),N}function y(b,w,S,M,L){if(b.visible===!1)return;if(b.layers.test(w.layers)&&(b.isMesh||b.isLine||b.isPoints)&&(b.castShadow||b.receiveShadow&&L===3)&&(!b.frustumCulled||n.intersectsObject(b))){b.modelViewMatrix.multiplyMatrices(S.matrixWorldInverse,b.matrixWorld);const P=e.update(b),N=b.material;if(Array.isArray(N)){const W=P.groups;for(let G=0,U=W.length;G<U;G++){const j=W[G],ne=N[j.materialIndex];if(ne&&ne.visible){const ie=v(b,0,ne,M,S.near,S.far,L);s.renderBufferDirect(S,null,P,ie,b,j)}}}else if(N.visible){const W=v(b,0,N,M,S.near,S.far,L);s.renderBufferDirect(S,null,P,W,b,null)}}const I=b.children;for(let P=0,N=I.length;P<N;P++)y(I[P],w,S,M,L)}this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1,this.render=function(b,w,S){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||b.length===0)return;const M=s.getRenderTarget(),L=s.getActiveCubeFace(),I=s.getActiveMipmapLevel(),P=s.state;P.setBlending(0),P.buffers.color.setClear(1,1,1,1),P.buffers.depth.setTest(!0),P.setScissorTest(!1);for(let N=0,W=b.length;N<W;N++){const G=b[N],U=G.shadow;if(U===void 0){console.warn("THREE.WebGLShadowMap:",G,"has no shadow.");continue}if(U.autoUpdate===!1&&U.needsUpdate===!1)continue;i.copy(U.mapSize);const j=U.getFrameExtents();if(i.multiply(j),r.copy(U.mapSize),(i.x>h||i.y>h)&&(i.x>h&&(r.x=Math.floor(h/j.x),i.x=r.x*j.x,U.mapSize.x=r.x),i.y>h&&(r.y=Math.floor(h/j.y),i.y=r.y*j.y,U.mapSize.y=r.y)),U.map===null&&!U.isPointLightShadow&&this.type===3){const ie={minFilter:1006,magFilter:1006,format:1023};U.map=new wt(i.x,i.y,ie),U.map.texture.name=G.name+".shadowMap",U.mapPass=new wt(i.x,i.y,ie),U.camera.updateProjectionMatrix()}if(U.map===null){const ie={minFilter:1003,magFilter:1003,format:1023};U.map=new wt(i.x,i.y,ie),U.map.texture.name=G.name+".shadowMap",U.camera.updateProjectionMatrix()}s.setRenderTarget(U.map),s.clear();const ne=U.getViewportCount();for(let ie=0;ie<ne;ie++){const B=U.getViewport(ie);a.set(r.x*B.x,r.y*B.y,r.x*B.z,r.y*B.w),P.viewport(a),U.updateMatrices(G,ie),n=U.getFrustum(),y(w,S,U.camera,G,this.type)}U.isPointLightShadow||this.type!==3||x(U,S),U.needsUpdate=!1}g.needsUpdate=!1,s.setRenderTarget(M,L,I)}}function Av(s,e,t){const n=t.isWebGL2,i=new function(){let _=!1;const C=new Ue;let D=null;const k=new Ue(0,0,0,0);return{setMask:function(z){D===z||_||(s.colorMask(z,z,z,z),D=z)},setLocked:function(z){_=z},setClear:function(z,J,K,re,de){de===!0&&(z*=re,J*=re,K*=re),C.set(z,J,K,re),k.equals(C)===!1&&(s.clearColor(z,J,K,re),k.copy(C))},reset:function(){_=!1,D=null,k.set(-1,0,0,0)}}},r=new function(){let _=!1,C=null,D=null,k=null;return{setTest:function(z){z?Z(2929):te(2929)},setMask:function(z){C===z||_||(s.depthMask(z),C=z)},setFunc:function(z){if(D!==z){if(z)switch(z){case 0:s.depthFunc(512);break;case 1:s.depthFunc(519);break;case 2:s.depthFunc(513);break;case 3:default:s.depthFunc(515);break;case 4:s.depthFunc(514);break;case 5:s.depthFunc(518);break;case 6:s.depthFunc(516);break;case 7:s.depthFunc(517)}else s.depthFunc(515);D=z}},setLocked:function(z){_=z},setClear:function(z){k!==z&&(s.clearDepth(z),k=z)},reset:function(){_=!1,C=null,D=null,k=null}}},a=new function(){let _=!1,C=null,D=null,k=null,z=null,J=null,K=null,re=null,de=null;return{setTest:function(ue){_||(ue?Z(2960):te(2960))},setMask:function(ue){C===ue||_||(s.stencilMask(ue),C=ue)},setFunc:function(ue,fe,Le){D===ue&&k===fe&&z===Le||(s.stencilFunc(ue,fe,Le),D=ue,k=fe,z=Le)},setOp:function(ue,fe,Le){J===ue&&K===fe&&re===Le||(s.stencilOp(ue,fe,Le),J=ue,K=fe,re=Le)},setLocked:function(ue){_=ue},setClear:function(ue){de!==ue&&(s.clearStencil(ue),de=ue)},reset:function(){_=!1,C=null,D=null,k=null,z=null,J=null,K=null,re=null,de=null}}};let o={},l={},c=null,h=!1,u=null,d=null,p=null,m=null,f=null,g=null,x=null,v=!1,y=null,b=null,w=null,S=null,M=null;const L=s.getParameter(35661);let I=!1,P=0;const N=s.getParameter(7938);N.indexOf("WebGL")!==-1?(P=parseFloat(/^WebGL (\d)/.exec(N)[1]),I=P>=1):N.indexOf("OpenGL ES")!==-1&&(P=parseFloat(/^OpenGL ES (\d)/.exec(N)[1]),I=P>=2);let W=null,G={};const U=s.getParameter(3088),j=s.getParameter(2978),ne=new Ue().fromArray(U),ie=new Ue().fromArray(j);function B(_,C,D){const k=new Uint8Array(4),z=s.createTexture();s.bindTexture(_,z),s.texParameteri(_,10241,9728),s.texParameteri(_,10240,9728);for(let J=0;J<D;J++)s.texImage2D(C+J,0,6408,1,1,0,6408,5121,k);return z}const X={};function Z(_){o[_]!==!0&&(s.enable(_),o[_]=!0)}function te(_){o[_]!==!1&&(s.disable(_),o[_]=!1)}X[3553]=B(3553,3553,1),X[34067]=B(34067,34069,6),i.setClear(0,0,0,1),r.setClear(1),a.setClear(0),Z(2929),r.setFunc(3),E(!1),F(1),Z(2884),R(0);const ee={100:32774,101:32778,102:32779};if(n)ee[103]=32775,ee[104]=32776;else{const _=e.get("EXT_blend_minmax");_!==null&&(ee[103]=_.MIN_EXT,ee[104]=_.MAX_EXT)}const ce={200:0,201:1,202:768,204:770,210:776,208:774,206:772,203:769,205:771,209:775,207:773};function R(_,C,D,k,z,J,K,re){if(_!==0){if(h===!1&&(Z(3042),h=!0),_===5)z=z||C,J=J||D,K=K||k,C===d&&z===f||(s.blendEquationSeparate(ee[C],ee[z]),d=C,f=z),D===p&&k===m&&J===g&&K===x||(s.blendFuncSeparate(ce[D],ce[k],ce[J],ce[K]),p=D,m=k,g=J,x=K),u=_,v=null;else if(_!==u||re!==v){if(d===100&&f===100||(s.blendEquation(32774),d=100,f=100),re)switch(_){case 1:s.blendFuncSeparate(1,771,1,771);break;case 2:s.blendFunc(1,1);break;case 3:s.blendFuncSeparate(0,0,769,771);break;case 4:s.blendFuncSeparate(0,768,0,770);break;default:console.error("THREE.WebGLState: Invalid blending: ",_)}else switch(_){case 1:s.blendFuncSeparate(770,771,1,771);break;case 2:s.blendFunc(770,1);break;case 3:s.blendFunc(0,769);break;case 4:s.blendFunc(0,768);break;default:console.error("THREE.WebGLState: Invalid blending: ",_)}p=null,m=null,g=null,x=null,u=_,v=re}}else h===!0&&(te(3042),h=!1)}function E(_){y!==_&&(_?s.frontFace(2304):s.frontFace(2305),y=_)}function F(_){_!==0?(Z(2884),_!==b&&(_===1?s.cullFace(1029):_===2?s.cullFace(1028):s.cullFace(1032))):te(2884),b=_}function V(_,C,D){_?(Z(32823),S===C&&M===D||(s.polygonOffset(C,D),S=C,M=D)):te(32823)}function O(_){_===void 0&&(_=33984+L-1),W!==_&&(s.activeTexture(_),W=_)}return{buffers:{color:i,depth:r,stencil:a},enable:Z,disable:te,bindFramebuffer:function(_,C){return l[_]!==C&&(s.bindFramebuffer(_,C),l[_]=C,n&&(_===36009&&(l[36160]=C),_===36160&&(l[36009]=C)),!0)},useProgram:function(_){return c!==_&&(s.useProgram(_),c=_,!0)},setBlending:R,setMaterial:function(_,C){_.side===2?te(2884):Z(2884);let D=_.side===1;C&&(D=!D),E(D),_.blending===1&&_.transparent===!1?R(0):R(_.blending,_.blendEquation,_.blendSrc,_.blendDst,_.blendEquationAlpha,_.blendSrcAlpha,_.blendDstAlpha,_.premultipliedAlpha),r.setFunc(_.depthFunc),r.setTest(_.depthTest),r.setMask(_.depthWrite),i.setMask(_.colorWrite);const k=_.stencilWrite;a.setTest(k),k&&(a.setMask(_.stencilWriteMask),a.setFunc(_.stencilFunc,_.stencilRef,_.stencilFuncMask),a.setOp(_.stencilFail,_.stencilZFail,_.stencilZPass)),V(_.polygonOffset,_.polygonOffsetFactor,_.polygonOffsetUnits),_.alphaToCoverage===!0?Z(32926):te(32926)},setFlipSided:E,setCullFace:F,setLineWidth:function(_){_!==w&&(I&&s.lineWidth(_),w=_)},setPolygonOffset:V,setScissorTest:function(_){_?Z(3089):te(3089)},activeTexture:O,bindTexture:function(_,C){W===null&&O();let D=G[W];D===void 0&&(D={type:void 0,texture:void 0},G[W]=D),D.type===_&&D.texture===C||(s.bindTexture(_,C||X[_]),D.type=_,D.texture=C)},unbindTexture:function(){const _=G[W];_!==void 0&&_.type!==void 0&&(s.bindTexture(_.type,null),_.type=void 0,_.texture=void 0)},compressedTexImage2D:function(){try{s.compressedTexImage2D.apply(s,arguments)}catch(_){console.error("THREE.WebGLState:",_)}},texImage2D:function(){try{s.texImage2D.apply(s,arguments)}catch(_){console.error("THREE.WebGLState:",_)}},texImage3D:function(){try{s.texImage3D.apply(s,arguments)}catch(_){console.error("THREE.WebGLState:",_)}},texStorage2D:function(){try{s.texStorage2D.apply(s,arguments)}catch(_){console.error("THREE.WebGLState:",_)}},texStorage3D:function(){try{s.texStorage3D.apply(s,arguments)}catch(_){console.error("THREE.WebGLState:",_)}},texSubImage2D:function(){try{s.texSubImage2D.apply(s,arguments)}catch(_){console.error("THREE.WebGLState:",_)}},texSubImage3D:function(){try{s.texSubImage3D.apply(s,arguments)}catch(_){console.error("THREE.WebGLState:",_)}},compressedTexSubImage2D:function(){try{s.compressedTexSubImage2D.apply(s,arguments)}catch(_){console.error("THREE.WebGLState:",_)}},scissor:function(_){ne.equals(_)===!1&&(s.scissor(_.x,_.y,_.z,_.w),ne.copy(_))},viewport:function(_){ie.equals(_)===!1&&(s.viewport(_.x,_.y,_.z,_.w),ie.copy(_))},reset:function(){s.disable(3042),s.disable(2884),s.disable(2929),s.disable(32823),s.disable(3089),s.disable(2960),s.disable(32926),s.blendEquation(32774),s.blendFunc(1,0),s.blendFuncSeparate(1,0,1,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(513),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(519,0,4294967295),s.stencilOp(7680,7680,7680),s.clearStencil(0),s.cullFace(1029),s.frontFace(2305),s.polygonOffset(0,0),s.activeTexture(33984),s.bindFramebuffer(36160,null),n===!0&&(s.bindFramebuffer(36009,null),s.bindFramebuffer(36008,null)),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),o={},W=null,G={},l={},c=null,h=!1,u=null,d=null,p=null,m=null,f=null,g=null,x=null,v=!1,y=null,b=null,w=null,S=null,M=null,ne.set(0,0,s.canvas.width,s.canvas.height),ie.set(0,0,s.canvas.width,s.canvas.height),i.reset(),r.reset(),a.reset()}}}function Rv(s,e,t,n,i,r,a){const o=i.isWebGL2,l=i.maxTextures,c=i.maxCubemapSize,h=i.maxTextureSize,u=i.maxSamples,d=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):void 0,p=new WeakMap;let m,f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(R,E){return f?new OffscreenCanvas(R,E):io("canvas")}function x(R,E,F,V){let O=1;if((R.width>V||R.height>V)&&(O=V/Math.max(R.width,R.height)),O<1||E===!0){if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap){const _=E?Lm:Math.floor,C=_(O*R.width),D=_(O*R.height);m===void 0&&(m=g(C,D));const k=F?g(C,D):m;return k.width=C,k.height=D,k.getContext("2d").drawImage(R,0,0,C,D),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+R.width+"x"+R.height+") to ("+C+"x"+D+")."),k}return"data"in R&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+R.width+"x"+R.height+")."),R}return R}function v(R){return _c(R.width)&&_c(R.height)}function y(R,E){return R.generateMipmaps&&E&&R.minFilter!==1003&&R.minFilter!==1006}function b(R){s.generateMipmap(R)}function w(R,E,F,V){if(o===!1)return E;if(R!==null){if(s[R]!==void 0)return s[R];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let O=E;return E===6403&&(F===5126&&(O=33326),F===5131&&(O=33325),F===5121&&(O=33321)),E===6407&&(F===5126&&(O=34837),F===5131&&(O=34843),F===5121&&(O=32849)),E===6408&&(F===5126&&(O=34836),F===5131&&(O=34842),F===5121&&(O=V===3001?35907:32856)),O!==33325&&O!==33326&&O!==34842&&O!==34836||e.get("EXT_color_buffer_float"),O}function S(R,E,F){return y(R,F)===!0||R.isFramebufferTexture&&R.minFilter!==1003&&R.minFilter!==1006?Math.log2(Math.max(E.width,E.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?E.mipmaps.length:1}function M(R){return R===1003||R===1004||R===1005?9728:9729}function L(R){const E=R.target;E.removeEventListener("dispose",L),function(F){const V=n.get(F);V.__webglInit!==void 0&&(s.deleteTexture(V.__webglTexture),n.remove(F))}(E),E.isVideoTexture&&p.delete(E),a.memory.textures--}function I(R){const E=R.target;E.removeEventListener("dispose",I),function(F){const V=F.texture,O=n.get(F),_=n.get(V);if(F){if(_.__webglTexture!==void 0&&(s.deleteTexture(_.__webglTexture),a.memory.textures--),F.depthTexture&&F.depthTexture.dispose(),F.isWebGLCubeRenderTarget)for(let C=0;C<6;C++)s.deleteFramebuffer(O.__webglFramebuffer[C]),O.__webglDepthbuffer&&s.deleteRenderbuffer(O.__webglDepthbuffer[C]);else s.deleteFramebuffer(O.__webglFramebuffer),O.__webglDepthbuffer&&s.deleteRenderbuffer(O.__webglDepthbuffer),O.__webglMultisampledFramebuffer&&s.deleteFramebuffer(O.__webglMultisampledFramebuffer),O.__webglColorRenderbuffer&&s.deleteRenderbuffer(O.__webglColorRenderbuffer),O.__webglDepthRenderbuffer&&s.deleteRenderbuffer(O.__webglDepthRenderbuffer);if(F.isWebGLMultipleRenderTargets)for(let C=0,D=V.length;C<D;C++){const k=n.get(V[C]);k.__webglTexture&&(s.deleteTexture(k.__webglTexture),a.memory.textures--),n.remove(V[C])}n.remove(V),n.remove(F)}}(E)}let P=0;function N(R,E){const F=n.get(R);if(R.isVideoTexture&&function(V){const O=a.render.frame;p.get(V)!==O&&(p.set(V,O),V.update())}(R),R.version>0&&F.__version!==R.version){const V=R.image;if(V===void 0)console.warn("THREE.WebGLRenderer: Texture marked for update but image is undefined");else{if(V.complete!==!1)return void ie(F,R,E);console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete")}}t.activeTexture(33984+E),t.bindTexture(3553,F.__webglTexture)}function W(R,E){const F=n.get(R);R.version>0&&F.__version!==R.version?function(V,O,_){if(O.image.length!==6)return;ne(V,O),t.activeTexture(33984+_),t.bindTexture(34067,V.__webglTexture),s.pixelStorei(37440,O.flipY),s.pixelStorei(37441,O.premultiplyAlpha),s.pixelStorei(3317,O.unpackAlignment),s.pixelStorei(37443,0);const C=O&&(O.isCompressedTexture||O.image[0].isCompressedTexture),D=O.image[0]&&O.image[0].isDataTexture,k=[];for(let pe=0;pe<6;pe++)k[pe]=C||D?D?O.image[pe].image:O.image[pe]:x(O.image[pe],!1,!0,c);const z=k[0],J=v(z)||o,K=r.convert(O.format),re=r.convert(O.type),de=w(O.internalFormat,K,re,O.encoding),ue=o&&O.isVideoTexture!==!0,fe=V.__version===void 0;let Le,We=S(O,z,J);if(j(34067,O,J),C){ue&&fe&&t.texStorage2D(34067,We,de,z.width,z.height);for(let pe=0;pe<6;pe++){Le=k[pe].mipmaps;for(let Ee=0;Ee<Le.length;Ee++){const De=Le[Ee];O.format!==1023&&O.format!==1022?K!==null?ue?t.compressedTexSubImage2D(34069+pe,Ee,0,0,De.width,De.height,K,De.data):t.compressedTexImage2D(34069+pe,Ee,de,De.width,De.height,0,De.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):ue?t.texSubImage2D(34069+pe,Ee,0,0,De.width,De.height,K,re,De.data):t.texImage2D(34069+pe,Ee,de,De.width,De.height,0,K,re,De.data)}}}else{Le=O.mipmaps,ue&&fe&&(Le.length>0&&We++,t.texStorage2D(34067,We,de,k[0].width,k[0].height));for(let pe=0;pe<6;pe++)if(D){ue?t.texSubImage2D(34069+pe,0,0,0,k[pe].width,k[pe].height,K,re,k[pe].data):t.texImage2D(34069+pe,0,de,k[pe].width,k[pe].height,0,K,re,k[pe].data);for(let Ee=0;Ee<Le.length;Ee++){const De=Le[Ee].image[pe].image;ue?t.texSubImage2D(34069+pe,Ee+1,0,0,De.width,De.height,K,re,De.data):t.texImage2D(34069+pe,Ee+1,de,De.width,De.height,0,K,re,De.data)}}else{ue?t.texSubImage2D(34069+pe,0,0,0,K,re,k[pe]):t.texImage2D(34069+pe,0,de,K,re,k[pe]);for(let Ee=0;Ee<Le.length;Ee++){const De=Le[Ee];ue?t.texSubImage2D(34069+pe,Ee+1,0,0,K,re,De.image[pe]):t.texImage2D(34069+pe,Ee+1,de,K,re,De.image[pe])}}}y(O,J)&&b(34067),V.__version=O.version,O.onUpdate&&O.onUpdate(O)}(F,R,E):(t.activeTexture(33984+E),t.bindTexture(34067,F.__webglTexture))}const G={1e3:10497,1001:33071,1002:33648},U={1003:9728,1004:9984,1005:9986,1006:9729,1007:9985,1008:9987};function j(R,E,F){if(F?(s.texParameteri(R,10242,G[E.wrapS]),s.texParameteri(R,10243,G[E.wrapT]),R!==32879&&R!==35866||s.texParameteri(R,32882,G[E.wrapR]),s.texParameteri(R,10240,U[E.magFilter]),s.texParameteri(R,10241,U[E.minFilter])):(s.texParameteri(R,10242,33071),s.texParameteri(R,10243,33071),R!==32879&&R!==35866||s.texParameteri(R,32882,33071),E.wrapS===1001&&E.wrapT===1001||console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."),s.texParameteri(R,10240,M(E.magFilter)),s.texParameteri(R,10241,M(E.minFilter)),E.minFilter!==1003&&E.minFilter!==1006&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.")),e.has("EXT_texture_filter_anisotropic")===!0){const V=e.get("EXT_texture_filter_anisotropic");if(E.type===1015&&e.has("OES_texture_float_linear")===!1||o===!1&&E.type===1016&&e.has("OES_texture_half_float_linear")===!1)return;(E.anisotropy>1||n.get(E).__currentAnisotropy)&&(s.texParameterf(R,V.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(E.anisotropy,i.getMaxAnisotropy())),n.get(E).__currentAnisotropy=E.anisotropy)}}function ne(R,E){R.__webglInit===void 0&&(R.__webglInit=!0,E.addEventListener("dispose",L),R.__webglTexture=s.createTexture(),a.memory.textures++)}function ie(R,E,F){let V=3553;E.isDataTexture2DArray&&(V=35866),E.isDataTexture3D&&(V=32879),ne(R,E),t.activeTexture(33984+F),t.bindTexture(V,R.__webglTexture),s.pixelStorei(37440,E.flipY),s.pixelStorei(37441,E.premultiplyAlpha),s.pixelStorei(3317,E.unpackAlignment),s.pixelStorei(37443,0);const O=function(fe){return!o&&(fe.wrapS!==1001||fe.wrapT!==1001||fe.minFilter!==1003&&fe.minFilter!==1006)}(E)&&v(E.image)===!1,_=x(E.image,O,!1,h),C=v(_)||o,D=r.convert(E.format);let k,z=r.convert(E.type),J=w(E.internalFormat,D,z,E.encoding);j(V,E,C);const K=E.mipmaps,re=o&&E.isVideoTexture!==!0,de=R.__version===void 0,ue=S(E,_,C);if(E.isDepthTexture)J=6402,o?J=E.type===1015?36012:E.type===1014?33190:E.type===1020?35056:33189:E.type===1015&&console.error("WebGLRenderer: Floating point depth texture requires WebGL2."),E.format===1026&&J===6402&&E.type!==1012&&E.type!==1014&&(console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."),E.type=1012,z=r.convert(E.type)),E.format===1027&&J===6402&&(J=34041,E.type!==1020&&(console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."),E.type=1020,z=r.convert(E.type))),re&&de?t.texStorage2D(3553,1,J,_.width,_.height):t.texImage2D(3553,0,J,_.width,_.height,0,D,z,null);else if(E.isDataTexture)if(K.length>0&&C){re&&de&&t.texStorage2D(3553,ue,J,K[0].width,K[0].height);for(let fe=0,Le=K.length;fe<Le;fe++)k=K[fe],re?t.texSubImage2D(3553,0,0,0,k.width,k.height,D,z,k.data):t.texImage2D(3553,fe,J,k.width,k.height,0,D,z,k.data);E.generateMipmaps=!1}else re?(de&&t.texStorage2D(3553,ue,J,_.width,_.height),t.texSubImage2D(3553,0,0,0,_.width,_.height,D,z,_.data)):t.texImage2D(3553,0,J,_.width,_.height,0,D,z,_.data);else if(E.isCompressedTexture){re&&de&&t.texStorage2D(3553,ue,J,K[0].width,K[0].height);for(let fe=0,Le=K.length;fe<Le;fe++)k=K[fe],E.format!==1023&&E.format!==1022?D!==null?re?t.compressedTexSubImage2D(3553,fe,0,0,k.width,k.height,D,k.data):t.compressedTexImage2D(3553,fe,J,k.width,k.height,0,k.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):re?t.texSubImage2D(3553,fe,0,0,k.width,k.height,D,z,k.data):t.texImage2D(3553,fe,J,k.width,k.height,0,D,z,k.data)}else if(E.isDataTexture2DArray)re?(de&&t.texStorage3D(35866,ue,J,_.width,_.height,_.depth),t.texSubImage3D(35866,0,0,0,0,_.width,_.height,_.depth,D,z,_.data)):t.texImage3D(35866,0,J,_.width,_.height,_.depth,0,D,z,_.data);else if(E.isDataTexture3D)re?(de&&t.texStorage3D(32879,ue,J,_.width,_.height,_.depth),t.texSubImage3D(32879,0,0,0,0,_.width,_.height,_.depth,D,z,_.data)):t.texImage3D(32879,0,J,_.width,_.height,_.depth,0,D,z,_.data);else if(E.isFramebufferTexture)re&&de?t.texStorage2D(3553,ue,J,_.width,_.height):t.texImage2D(3553,0,J,_.width,_.height,0,D,z,null);else if(K.length>0&&C){re&&de&&t.texStorage2D(3553,ue,J,K[0].width,K[0].height);for(let fe=0,Le=K.length;fe<Le;fe++)k=K[fe],re?t.texSubImage2D(3553,fe,0,0,D,z,k):t.texImage2D(3553,fe,J,D,z,k);E.generateMipmaps=!1}else re?(de&&t.texStorage2D(3553,ue,J,_.width,_.height),t.texSubImage2D(3553,0,0,0,D,z,_)):t.texImage2D(3553,0,J,D,z,_);y(E,C)&&b(V),R.__version=E.version,E.onUpdate&&E.onUpdate(E)}function B(R,E,F,V,O){const _=r.convert(F.format),C=r.convert(F.type),D=w(F.internalFormat,_,C,F.encoding);n.get(E).__hasExternalTextures||(O===32879||O===35866?t.texImage3D(O,0,D,E.width,E.height,E.depth,0,_,C,null):t.texImage2D(O,0,D,E.width,E.height,0,_,C,null)),t.bindFramebuffer(36160,R),E.useRenderToTexture?d.framebufferTexture2DMultisampleEXT(36160,V,O,n.get(F).__webglTexture,0,te(E)):s.framebufferTexture2D(36160,V,O,n.get(F).__webglTexture,0),t.bindFramebuffer(36160,null)}function X(R,E,F){if(s.bindRenderbuffer(36161,R),E.depthBuffer&&!E.stencilBuffer){let V=33189;if(F||E.useRenderToTexture){const O=E.depthTexture;O&&O.isDepthTexture&&(O.type===1015?V=36012:O.type===1014&&(V=33190));const _=te(E);E.useRenderToTexture?d.renderbufferStorageMultisampleEXT(36161,_,V,E.width,E.height):s.renderbufferStorageMultisample(36161,_,V,E.width,E.height)}else s.renderbufferStorage(36161,V,E.width,E.height);s.framebufferRenderbuffer(36160,36096,36161,R)}else if(E.depthBuffer&&E.stencilBuffer){const V=te(E);F&&E.useRenderbuffer?s.renderbufferStorageMultisample(36161,V,35056,E.width,E.height):E.useRenderToTexture?d.renderbufferStorageMultisampleEXT(36161,V,35056,E.width,E.height):s.renderbufferStorage(36161,34041,E.width,E.height),s.framebufferRenderbuffer(36160,33306,36161,R)}else{const V=E.isWebGLMultipleRenderTargets===!0?E.texture[0]:E.texture,O=r.convert(V.format),_=r.convert(V.type),C=w(V.internalFormat,O,_,V.encoding),D=te(E);F&&E.useRenderbuffer?s.renderbufferStorageMultisample(36161,D,C,E.width,E.height):E.useRenderToTexture?d.renderbufferStorageMultisampleEXT(36161,D,C,E.width,E.height):s.renderbufferStorage(36161,C,E.width,E.height)}s.bindRenderbuffer(36161,null)}function Z(R){const E=n.get(R),F=R.isWebGLCubeRenderTarget===!0;if(R.depthTexture&&!E.__autoAllocateDepthBuffer){if(F)throw new Error("target.depthTexture not supported in Cube render targets");(function(V,O){if(O&&O.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(36160,V),!O.depthTexture||!O.depthTexture.isDepthTexture)throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");n.get(O.depthTexture).__webglTexture&&O.depthTexture.image.width===O.width&&O.depthTexture.image.height===O.height||(O.depthTexture.image.width=O.width,O.depthTexture.image.height=O.height,O.depthTexture.needsUpdate=!0),N(O.depthTexture,0);const _=n.get(O.depthTexture).__webglTexture,C=te(O);if(O.depthTexture.format===1026)O.useRenderToTexture?d.framebufferTexture2DMultisampleEXT(36160,36096,3553,_,0,C):s.framebufferTexture2D(36160,36096,3553,_,0);else{if(O.depthTexture.format!==1027)throw new Error("Unknown depthTexture format");O.useRenderToTexture?d.framebufferTexture2DMultisampleEXT(36160,33306,3553,_,0,C):s.framebufferTexture2D(36160,33306,3553,_,0)}})(E.__webglFramebuffer,R)}else if(F){E.__webglDepthbuffer=[];for(let V=0;V<6;V++)t.bindFramebuffer(36160,E.__webglFramebuffer[V]),E.__webglDepthbuffer[V]=s.createRenderbuffer(),X(E.__webglDepthbuffer[V],R,!1)}else t.bindFramebuffer(36160,E.__webglFramebuffer),E.__webglDepthbuffer=s.createRenderbuffer(),X(E.__webglDepthbuffer,R,!1);t.bindFramebuffer(36160,null)}function te(R){return o&&(R.useRenderbuffer||R.useRenderToTexture)?Math.min(u,R.samples):0}let ee=!1,ce=!1;this.allocateTextureUnit=function(){const R=P;return R>=l&&console.warn("THREE.WebGLTextures: Trying to use "+R+" texture units while this GPU supports only "+l),P+=1,R},this.resetTextureUnits=function(){P=0},this.setTexture2D=N,this.setTexture2DArray=function(R,E){const F=n.get(R);R.version>0&&F.__version!==R.version?ie(F,R,E):(t.activeTexture(33984+E),t.bindTexture(35866,F.__webglTexture))},this.setTexture3D=function(R,E){const F=n.get(R);R.version>0&&F.__version!==R.version?ie(F,R,E):(t.activeTexture(33984+E),t.bindTexture(32879,F.__webglTexture))},this.setTextureCube=W,this.rebindTextures=function(R,E,F){const V=n.get(R);E!==void 0&&B(V.__webglFramebuffer,R,R.texture,36064,3553),F!==void 0&&Z(R)},this.setupRenderTarget=function(R){const E=R.texture,F=n.get(R),V=n.get(E);R.addEventListener("dispose",I),R.isWebGLMultipleRenderTargets!==!0&&(V.__webglTexture===void 0&&(V.__webglTexture=s.createTexture()),V.__version=E.version,a.memory.textures++);const O=R.isWebGLCubeRenderTarget===!0,_=R.isWebGLMultipleRenderTargets===!0,C=E.isDataTexture3D||E.isDataTexture2DArray,D=v(R)||o;if(!o||E.format!==1022||E.type!==1015&&E.type!==1016||(E.format=1023,console.warn("THREE.WebGLRenderer: Rendering to textures with RGB format is not supported. Using RGBA format instead.")),O){F.__webglFramebuffer=[];for(let k=0;k<6;k++)F.__webglFramebuffer[k]=s.createFramebuffer()}else if(F.__webglFramebuffer=s.createFramebuffer(),_)if(i.drawBuffers){const k=R.texture;for(let z=0,J=k.length;z<J;z++){const K=n.get(k[z]);K.__webglTexture===void 0&&(K.__webglTexture=s.createTexture(),a.memory.textures++)}}else console.warn("THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.");else if(R.useRenderbuffer)if(o){F.__webglMultisampledFramebuffer=s.createFramebuffer(),F.__webglColorRenderbuffer=s.createRenderbuffer(),s.bindRenderbuffer(36161,F.__webglColorRenderbuffer);const k=r.convert(E.format),z=r.convert(E.type),J=w(E.internalFormat,k,z,E.encoding),K=te(R);s.renderbufferStorageMultisample(36161,K,J,R.width,R.height),t.bindFramebuffer(36160,F.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(36160,36064,36161,F.__webglColorRenderbuffer),s.bindRenderbuffer(36161,null),R.depthBuffer&&(F.__webglDepthRenderbuffer=s.createRenderbuffer(),X(F.__webglDepthRenderbuffer,R,!0)),t.bindFramebuffer(36160,null)}else console.warn("THREE.WebGLRenderer: WebGLMultisampleRenderTarget can only be used with WebGL2.");if(O){t.bindTexture(34067,V.__webglTexture),j(34067,E,D);for(let k=0;k<6;k++)B(F.__webglFramebuffer[k],R,E,36064,34069+k);y(E,D)&&b(34067),t.unbindTexture()}else if(_){const k=R.texture;for(let z=0,J=k.length;z<J;z++){const K=k[z],re=n.get(K);t.bindTexture(3553,re.__webglTexture),j(3553,K,D),B(F.__webglFramebuffer,R,K,36064+z,3553),y(K,D)&&b(3553)}t.unbindTexture()}else{let k=3553;C&&(o?k=E.isDataTexture3D?32879:35866:console.warn("THREE.DataTexture3D and THREE.DataTexture2DArray only supported with WebGL2.")),t.bindTexture(k,V.__webglTexture),j(k,E,D),B(F.__webglFramebuffer,R,E,36064,k),y(E,D)&&b(k),t.unbindTexture()}R.depthBuffer&&Z(R)},this.updateRenderTargetMipmap=function(R){const E=v(R)||o,F=R.isWebGLMultipleRenderTargets===!0?R.texture:[R.texture];for(let V=0,O=F.length;V<O;V++){const _=F[V];if(y(_,E)){const C=R.isWebGLCubeRenderTarget?34067:3553,D=n.get(_).__webglTexture;t.bindTexture(C,D),b(C),t.unbindTexture()}}},this.updateMultisampleRenderTarget=function(R){if(R.useRenderbuffer)if(o){const E=R.width,F=R.height;let V=16384;const O=[36064],_=R.stencilBuffer?33306:36096;R.depthBuffer&&O.push(_),R.ignoreDepthForMultisampleCopy||(R.depthBuffer&&(V|=256),R.stencilBuffer&&(V|=1024));const C=n.get(R);t.bindFramebuffer(36008,C.__webglMultisampledFramebuffer),t.bindFramebuffer(36009,C.__webglFramebuffer),R.ignoreDepthForMultisampleCopy&&(s.invalidateFramebuffer(36008,[_]),s.invalidateFramebuffer(36009,[_])),s.blitFramebuffer(0,0,E,F,0,0,E,F,V,9728),s.invalidateFramebuffer(36008,O),t.bindFramebuffer(36008,null),t.bindFramebuffer(36009,C.__webglMultisampledFramebuffer)}else console.warn("THREE.WebGLRenderer: WebGLMultisampleRenderTarget can only be used with WebGL2.")},this.setupDepthRenderbuffer=Z,this.setupFrameBufferTexture=B,this.safeSetTexture2D=function(R,E){R&&R.isWebGLRenderTarget&&(ee===!1&&(console.warn("THREE.WebGLTextures.safeSetTexture2D: don't use render targets as textures. Use their .texture property instead."),ee=!0),R=R.texture),N(R,E)},this.safeSetTextureCube=function(R,E){R&&R.isWebGLCubeRenderTarget&&(ce===!1&&(console.warn("THREE.WebGLTextures.safeSetTextureCube: don't use cube render targets as textures. Use their .texture property instead."),ce=!0),R=R.texture),W(R,E)}}function Lv(s,e,t){const n=t.isWebGL2;return{convert:function(i){let r;if(i===1009)return 5121;if(i===1017)return 32819;if(i===1018)return 32820;if(i===1019)return 33635;if(i===1010)return 5120;if(i===1011)return 5122;if(i===1012)return 5123;if(i===1013)return 5124;if(i===1014)return 5125;if(i===1015)return 5126;if(i===1016)return n?5131:(r=e.get("OES_texture_half_float"),r!==null?r.HALF_FLOAT_OES:null);if(i===1021)return 6406;if(i===1022)return 6407;if(i===1023)return 6408;if(i===1024)return 6409;if(i===1025)return 6410;if(i===1026)return 6402;if(i===1027)return 34041;if(i===1028)return 6403;if(i===1029)return 36244;if(i===1030)return 33319;if(i===1031)return 33320;if(i===1032)return 36248;if(i===1033)return 36249;if(i===33776||i===33777||i===33778||i===33779){if(r=e.get("WEBGL_compressed_texture_s3tc"),r===null)return null;if(i===33776)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===33777)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===33778)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===33779)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}if(i===35840||i===35841||i===35842||i===35843){if(r=e.get("WEBGL_compressed_texture_pvrtc"),r===null)return null;if(i===35840)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===35841)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===35842)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===35843)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}if(i===36196)return r=e.get("WEBGL_compressed_texture_etc1"),r!==null?r.COMPRESSED_RGB_ETC1_WEBGL:null;if((i===37492||i===37496)&&(r=e.get("WEBGL_compressed_texture_etc"),r!==null)){if(i===37492)return r.COMPRESSED_RGB8_ETC2;if(i===37496)return r.COMPRESSED_RGBA8_ETC2_EAC}return i===37808||i===37809||i===37810||i===37811||i===37812||i===37813||i===37814||i===37815||i===37816||i===37817||i===37818||i===37819||i===37820||i===37821||i===37840||i===37841||i===37842||i===37843||i===37844||i===37845||i===37846||i===37847||i===37848||i===37849||i===37850||i===37851||i===37852||i===37853?(r=e.get("WEBGL_compressed_texture_astc"),r!==null?i:null):i===36492?(r=e.get("EXT_texture_compression_bptc"),r!==null?i:null):i===1020?n?34042:(r=e.get("WEBGL_depth_texture"),r!==null?r.UNSIGNED_INT_24_8_WEBGL:null):void 0}}}class Jm extends nt{constructor(e=[]){super(),this.cameras=e}}Jm.prototype.isArrayCamera=!0;class En extends Re{constructor(){super(),this.type="Group"}}En.prototype.isGroup=!0;const Cv={type:"move"};class Jo{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new En,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new En,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new T,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new T),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new En,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new T,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new T),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let i=null,r=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred")if(o!==null&&(i=t.getPose(e.targetRaySpace,n),i!==null&&(o.matrix.fromArray(i.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),i.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(i.linearVelocity)):o.hasLinearVelocity=!1,i.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(i.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Cv))),c&&e.hand){a=!0;for(const f of e.hand.values()){const g=t.getJointPose(f,n);if(c.joints[f.jointName]===void 0){const v=new En;v.matrixAutoUpdate=!1,v.visible=!1,c.joints[f.jointName]=v,c.add(v)}const x=c.joints[f.jointName];g!==null&&(x.matrix.fromArray(g.transform.matrix),x.matrix.decompose(x.position,x.rotation,x.scale),x.jointRadius=g.radius),x.visible=g!==null}const h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],d=h.position.distanceTo(u.position),p=.02,m=.005;c.inputState.pinching&&d>p+m?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=p-m&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));return o!==null&&(o.visible=i!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}}class Sc extends qe{constructor(e,t,n,i,r,a,o,l,c,h){if((h=h!==void 0?h:1026)!==1026&&h!==1027)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===1026&&(n=1012),n===void 0&&h===1027&&(n=1020),super(null,i,r,a,o,l,h,n,c),this.image={width:e,height:t},this.magFilter=o!==void 0?o:1003,this.minFilter=l!==void 0?l:1003,this.flipY=!1,this.generateMipmaps=!1}}Sc.prototype.isDepthTexture=!0;class Pv extends At{constructor(e,t){super();const n=this;let i=null,r=1,a=null,o="local-floor";const l=e.extensions.has("WEBGL_multisampled_render_to_texture");let c=null,h=null,u=null,d=null,p=!1,m=null;const f=t.getContextAttributes();let g=null,x=null;const v=[],y=new Map,b=new nt;b.layers.enable(1),b.viewport=new Ue;const w=new nt;w.layers.enable(2),w.viewport=new Ue;const S=[b,w],M=new Jm;M.layers.enable(1),M.layers.enable(2);let L=null,I=null;function P(B){const X=y.get(B.inputSource);X&&X.dispatchEvent({type:B.type,data:B.inputSource})}function N(){y.forEach(function(B,X){B.disconnect(X)}),y.clear(),L=null,I=null,e.setRenderTarget(g),d=null,u=null,h=null,i=null,x=null,ie.stop(),n.isPresenting=!1,n.dispatchEvent({type:"sessionend"})}function W(B){const X=i.inputSources;for(let Z=0;Z<v.length;Z++)y.set(X[Z],v[Z]);for(let Z=0;Z<B.removed.length;Z++){const te=B.removed[Z],ee=y.get(te);ee&&(ee.dispatchEvent({type:"disconnected",data:te}),y.delete(te))}for(let Z=0;Z<B.added.length;Z++){const te=B.added[Z],ee=y.get(te);ee&&ee.dispatchEvent({type:"connected",data:te})}}this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(B){let X=v[B];return X===void 0&&(X=new Jo,v[B]=X),X.getTargetRaySpace()},this.getControllerGrip=function(B){let X=v[B];return X===void 0&&(X=new Jo,v[B]=X),X.getGripSpace()},this.getHand=function(B){let X=v[B];return X===void 0&&(X=new Jo,v[B]=X),X.getHandSpace()},this.setFramebufferScaleFactor=function(B){r=B,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(B){o=B,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return a},this.getBaseLayer=function(){return u!==null?u:d},this.getBinding=function(){return h},this.getFrame=function(){return m},this.getSession=function(){return i},this.setSession=async function(B){if(i=B,i!==null){if(g=e.getRenderTarget(),i.addEventListener("select",P),i.addEventListener("selectstart",P),i.addEventListener("selectend",P),i.addEventListener("squeeze",P),i.addEventListener("squeezestart",P),i.addEventListener("squeezeend",P),i.addEventListener("end",N),i.addEventListener("inputsourceschange",W),f.xrCompatible!==!0&&await t.makeXRCompatible(),i.renderState.layers===void 0||e.capabilities.isWebGL2===!1){const X={antialias:i.renderState.layers!==void 0||f.antialias,alpha:f.alpha,depth:f.depth,stencil:f.stencil,framebufferScaleFactor:r};d=new XRWebGLLayer(i,t,X),i.updateRenderState({baseLayer:d}),x=new wt(d.framebufferWidth,d.framebufferHeight,{format:1023,type:1009,encoding:e.outputEncoding})}else{p=f.antialias;let X=null,Z=null,te=null;f.depth&&(te=f.stencil?35056:33190,X=f.stencil?1027:1026,Z=f.stencil?1020:1012);const ee={colorFormat:f.alpha||p?32856:32849,depthFormat:te,scaleFactor:r};h=new XRWebGLBinding(i,t),u=h.createProjectionLayer(ee),i.updateRenderState({layers:[u]}),x=p?new $c(u.textureWidth,u.textureHeight,{format:1023,type:1009,depthTexture:new Sc(u.textureWidth,u.textureHeight,Z,void 0,void 0,void 0,void 0,void 0,void 0,X),stencilBuffer:f.stencil,ignoreDepth:u.ignoreDepthValues,useRenderToTexture:l,encoding:e.outputEncoding}):new wt(u.textureWidth,u.textureHeight,{format:f.alpha?1023:1022,type:1009,depthTexture:new Sc(u.textureWidth,u.textureHeight,Z,void 0,void 0,void 0,void 0,void 0,void 0,X),stencilBuffer:f.stencil,ignoreDepth:u.ignoreDepthValues,encoding:e.outputEncoding})}this.setFoveation(1),a=await i.requestReferenceSpace(o),ie.setContext(i),ie.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}};const G=new T,U=new T;function j(B,X){X===null?B.matrixWorld.copy(B.matrix):B.matrixWorld.multiplyMatrices(X.matrixWorld,B.matrix),B.matrixWorldInverse.copy(B.matrixWorld).invert()}this.updateCamera=function(B){if(i===null)return;M.near=w.near=b.near=B.near,M.far=w.far=b.far=B.far,L===M.near&&I===M.far||(i.updateRenderState({depthNear:M.near,depthFar:M.far}),L=M.near,I=M.far);const X=B.parent,Z=M.cameras;j(M,X);for(let ee=0;ee<Z.length;ee++)j(Z[ee],X);M.matrixWorld.decompose(M.position,M.quaternion,M.scale),B.position.copy(M.position),B.quaternion.copy(M.quaternion),B.scale.copy(M.scale),B.matrix.copy(M.matrix),B.matrixWorld.copy(M.matrixWorld);const te=B.children;for(let ee=0,ce=te.length;ee<ce;ee++)te[ee].updateMatrixWorld(!0);Z.length===2?function(ee,ce,R){G.setFromMatrixPosition(ce.matrixWorld),U.setFromMatrixPosition(R.matrixWorld);const E=G.distanceTo(U),F=ce.projectionMatrix.elements,V=R.projectionMatrix.elements,O=F[14]/(F[10]-1),_=F[14]/(F[10]+1),C=(F[9]+1)/F[5],D=(F[9]-1)/F[5],k=(F[8]-1)/F[0],z=(V[8]+1)/V[0],J=O*k,K=O*z,re=E/(-k+z),de=re*-k;ce.matrixWorld.decompose(ee.position,ee.quaternion,ee.scale),ee.translateX(de),ee.translateZ(re),ee.matrixWorld.compose(ee.position,ee.quaternion,ee.scale),ee.matrixWorldInverse.copy(ee.matrixWorld).invert();const ue=O+re,fe=_+re,Le=J-de,We=K+(E-de),pe=C*_/fe*ue,Ee=D*_/fe*ue;ee.projectionMatrix.makePerspective(Le,We,pe,Ee,ue,fe)}(M,b,w):M.projectionMatrix.copy(b.projectionMatrix)},this.getCamera=function(){return M},this.getFoveation=function(){return u!==null?u.fixedFoveation:d!==null?d.fixedFoveation:void 0},this.setFoveation=function(B){u!==null&&(u.fixedFoveation=B),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=B)};let ne=null;const ie=new Fm;ie.setAnimationLoop(function(B,X){if(c=X.getViewerPose(a),m=X,c!==null){const te=c.views;d!==null&&(e.setRenderTargetFramebuffer(x,d.framebuffer),e.setRenderTarget(x));let ee=!1;te.length!==M.cameras.length&&(M.cameras.length=0,ee=!0);for(let ce=0;ce<te.length;ce++){const R=te[ce];let E=null;if(d!==null)E=d.getViewport(R);else{const V=h.getViewSubImage(u,R);E=V.viewport,ce===0&&(e.setRenderTargetTextures(x,V.colorTexture,u.ignoreDepthValues?void 0:V.depthStencilTexture),e.setRenderTarget(x))}const F=S[ce];F.matrix.fromArray(R.transform.matrix),F.projectionMatrix.fromArray(R.projectionMatrix),F.viewport.set(E.x,E.y,E.width,E.height),ce===0&&M.matrix.copy(F.matrix),ee===!0&&M.cameras.push(F)}}const Z=i.inputSources;for(let te=0;te<v.length;te++){const ee=v[te],ce=Z[te];ee.update(ce,X,a)}ne&&ne(B,X),m=null}),this.setAnimationLoop=function(B){ne=B},this.dispose=function(){}}}function Iv(s){function e(n,i){n.opacity.value=i.opacity,i.color&&n.diffuse.value.copy(i.color),i.emissive&&n.emissive.value.copy(i.emissive).multiplyScalar(i.emissiveIntensity),i.map&&(n.map.value=i.map),i.alphaMap&&(n.alphaMap.value=i.alphaMap),i.specularMap&&(n.specularMap.value=i.specularMap),i.alphaTest>0&&(n.alphaTest.value=i.alphaTest);const r=s.get(i).envMap;let a,o;r&&(n.envMap.value=r,n.flipEnvMap.value=r.isCubeTexture&&r.isRenderTargetTexture===!1?-1:1,n.reflectivity.value=i.reflectivity,n.ior.value=i.ior,n.refractionRatio.value=i.refractionRatio),i.lightMap&&(n.lightMap.value=i.lightMap,n.lightMapIntensity.value=i.lightMapIntensity),i.aoMap&&(n.aoMap.value=i.aoMap,n.aoMapIntensity.value=i.aoMapIntensity),i.map?a=i.map:i.specularMap?a=i.specularMap:i.displacementMap?a=i.displacementMap:i.normalMap?a=i.normalMap:i.bumpMap?a=i.bumpMap:i.roughnessMap?a=i.roughnessMap:i.metalnessMap?a=i.metalnessMap:i.alphaMap?a=i.alphaMap:i.emissiveMap?a=i.emissiveMap:i.clearcoatMap?a=i.clearcoatMap:i.clearcoatNormalMap?a=i.clearcoatNormalMap:i.clearcoatRoughnessMap?a=i.clearcoatRoughnessMap:i.specularIntensityMap?a=i.specularIntensityMap:i.specularColorMap?a=i.specularColorMap:i.transmissionMap?a=i.transmissionMap:i.thicknessMap?a=i.thicknessMap:i.sheenColorMap?a=i.sheenColorMap:i.sheenRoughnessMap&&(a=i.sheenRoughnessMap),a!==void 0&&(a.isWebGLRenderTarget&&(a=a.texture),a.matrixAutoUpdate===!0&&a.updateMatrix(),n.uvTransform.value.copy(a.matrix)),i.aoMap?o=i.aoMap:i.lightMap&&(o=i.lightMap),o!==void 0&&(o.isWebGLRenderTarget&&(o=o.texture),o.matrixAutoUpdate===!0&&o.updateMatrix(),n.uv2Transform.value.copy(o.matrix))}function t(n,i){n.roughness.value=i.roughness,n.metalness.value=i.metalness,i.roughnessMap&&(n.roughnessMap.value=i.roughnessMap),i.metalnessMap&&(n.metalnessMap.value=i.metalnessMap),i.emissiveMap&&(n.emissiveMap.value=i.emissiveMap),i.bumpMap&&(n.bumpMap.value=i.bumpMap,n.bumpScale.value=i.bumpScale,i.side===1&&(n.bumpScale.value*=-1)),i.normalMap&&(n.normalMap.value=i.normalMap,n.normalScale.value.copy(i.normalScale),i.side===1&&n.normalScale.value.negate()),i.displacementMap&&(n.displacementMap.value=i.displacementMap,n.displacementScale.value=i.displacementScale,n.displacementBias.value=i.displacementBias),s.get(i).envMap&&(n.envMapIntensity.value=i.envMapIntensity)}return{refreshFogUniforms:function(n,i){n.fogColor.value.copy(i.color),i.isFog?(n.fogNear.value=i.near,n.fogFar.value=i.far):i.isFogExp2&&(n.fogDensity.value=i.density)},refreshMaterialUniforms:function(n,i,r,a,o){i.isMeshBasicMaterial?e(n,i):i.isMeshLambertMaterial?(e(n,i),function(l,c){c.emissiveMap&&(l.emissiveMap.value=c.emissiveMap)}(n,i)):i.isMeshToonMaterial?(e(n,i),function(l,c){c.gradientMap&&(l.gradientMap.value=c.gradientMap),c.emissiveMap&&(l.emissiveMap.value=c.emissiveMap),c.bumpMap&&(l.bumpMap.value=c.bumpMap,l.bumpScale.value=c.bumpScale,c.side===1&&(l.bumpScale.value*=-1)),c.normalMap&&(l.normalMap.value=c.normalMap,l.normalScale.value.copy(c.normalScale),c.side===1&&l.normalScale.value.negate()),c.displacementMap&&(l.displacementMap.value=c.displacementMap,l.displacementScale.value=c.displacementScale,l.displacementBias.value=c.displacementBias)}(n,i)):i.isMeshPhongMaterial?(e(n,i),function(l,c){l.specular.value.copy(c.specular),l.shininess.value=Math.max(c.shininess,1e-4),c.emissiveMap&&(l.emissiveMap.value=c.emissiveMap),c.bumpMap&&(l.bumpMap.value=c.bumpMap,l.bumpScale.value=c.bumpScale,c.side===1&&(l.bumpScale.value*=-1)),c.normalMap&&(l.normalMap.value=c.normalMap,l.normalScale.value.copy(c.normalScale),c.side===1&&l.normalScale.value.negate()),c.displacementMap&&(l.displacementMap.value=c.displacementMap,l.displacementScale.value=c.displacementScale,l.displacementBias.value=c.displacementBias)}(n,i)):i.isMeshStandardMaterial?(e(n,i),i.isMeshPhysicalMaterial?function(l,c,h){t(l,c),l.ior.value=c.ior,c.sheen>0&&(l.sheenColor.value.copy(c.sheenColor).multiplyScalar(c.sheen),l.sheenRoughness.value=c.sheenRoughness,c.sheenColorMap&&(l.sheenColorMap.value=c.sheenColorMap),c.sheenRoughnessMap&&(l.sheenRoughnessMap.value=c.sheenRoughnessMap)),c.clearcoat>0&&(l.clearcoat.value=c.clearcoat,l.clearcoatRoughness.value=c.clearcoatRoughness,c.clearcoatMap&&(l.clearcoatMap.value=c.clearcoatMap),c.clearcoatRoughnessMap&&(l.clearcoatRoughnessMap.value=c.clearcoatRoughnessMap),c.clearcoatNormalMap&&(l.clearcoatNormalScale.value.copy(c.clearcoatNormalScale),l.clearcoatNormalMap.value=c.clearcoatNormalMap,c.side===1&&l.clearcoatNormalScale.value.negate())),c.transmission>0&&(l.transmission.value=c.transmission,l.transmissionSamplerMap.value=h.texture,l.transmissionSamplerSize.value.set(h.width,h.height),c.transmissionMap&&(l.transmissionMap.value=c.transmissionMap),l.thickness.value=c.thickness,c.thicknessMap&&(l.thicknessMap.value=c.thicknessMap),l.attenuationDistance.value=c.attenuationDistance,l.attenuationColor.value.copy(c.attenuationColor)),l.specularIntensity.value=c.specularIntensity,l.specularColor.value.copy(c.specularColor),c.specularIntensityMap&&(l.specularIntensityMap.value=c.specularIntensityMap),c.specularColorMap&&(l.specularColorMap.value=c.specularColorMap)}(n,i,o):t(n,i)):i.isMeshMatcapMaterial?(e(n,i),function(l,c){c.matcap&&(l.matcap.value=c.matcap),c.bumpMap&&(l.bumpMap.value=c.bumpMap,l.bumpScale.value=c.bumpScale,c.side===1&&(l.bumpScale.value*=-1)),c.normalMap&&(l.normalMap.value=c.normalMap,l.normalScale.value.copy(c.normalScale),c.side===1&&l.normalScale.value.negate()),c.displacementMap&&(l.displacementMap.value=c.displacementMap,l.displacementScale.value=c.displacementScale,l.displacementBias.value=c.displacementBias)}(n,i)):i.isMeshDepthMaterial?(e(n,i),function(l,c){c.displacementMap&&(l.displacementMap.value=c.displacementMap,l.displacementScale.value=c.displacementScale,l.displacementBias.value=c.displacementBias)}(n,i)):i.isMeshDistanceMaterial?(e(n,i),function(l,c){c.displacementMap&&(l.displacementMap.value=c.displacementMap,l.displacementScale.value=c.displacementScale,l.displacementBias.value=c.displacementBias),l.referencePosition.value.copy(c.referencePosition),l.nearDistance.value=c.nearDistance,l.farDistance.value=c.farDistance}(n,i)):i.isMeshNormalMaterial?(e(n,i),function(l,c){c.bumpMap&&(l.bumpMap.value=c.bumpMap,l.bumpScale.value=c.bumpScale,c.side===1&&(l.bumpScale.value*=-1)),c.normalMap&&(l.normalMap.value=c.normalMap,l.normalScale.value.copy(c.normalScale),c.side===1&&l.normalScale.value.negate()),c.displacementMap&&(l.displacementMap.value=c.displacementMap,l.displacementScale.value=c.displacementScale,l.displacementBias.value=c.displacementBias)}(n,i)):i.isLineBasicMaterial?(function(l,c){l.diffuse.value.copy(c.color),l.opacity.value=c.opacity}(n,i),i.isLineDashedMaterial&&function(l,c){l.dashSize.value=c.dashSize,l.totalSize.value=c.dashSize+c.gapSize,l.scale.value=c.scale}(n,i)):i.isPointsMaterial?function(l,c,h,u){l.diffuse.value.copy(c.color),l.opacity.value=c.opacity,l.size.value=c.size*h,l.scale.value=.5*u,c.map&&(l.map.value=c.map),c.alphaMap&&(l.alphaMap.value=c.alphaMap),c.alphaTest>0&&(l.alphaTest.value=c.alphaTest);let d;c.map?d=c.map:c.alphaMap&&(d=c.alphaMap),d!==void 0&&(d.matrixAutoUpdate===!0&&d.updateMatrix(),l.uvTransform.value.copy(d.matrix))}(n,i,r,a):i.isSpriteMaterial?function(l,c){l.diffuse.value.copy(c.color),l.opacity.value=c.opacity,l.rotation.value=c.rotation,c.map&&(l.map.value=c.map),c.alphaMap&&(l.alphaMap.value=c.alphaMap),c.alphaTest>0&&(l.alphaTest.value=c.alphaTest);let h;c.map?h=c.map:c.alphaMap&&(h=c.alphaMap),h!==void 0&&(h.matrixAutoUpdate===!0&&h.updateMatrix(),l.uvTransform.value.copy(h.matrix))}(n,i):i.isShadowMaterial?(n.color.value.copy(i.color),n.opacity.value=i.opacity):i.isShaderMaterial&&(i.uniformsNeedUpdate=!1)}}}function Pe(s={}){const e=s.canvas!==void 0?s.canvas:function(){const A=io("canvas");return A.style.display="block",A}(),t=s.context!==void 0?s.context:null,n=s.alpha!==void 0&&s.alpha,i=s.depth===void 0||s.depth,r=s.stencil===void 0||s.stencil,a=s.antialias!==void 0&&s.antialias,o=s.premultipliedAlpha===void 0||s.premultipliedAlpha,l=s.preserveDrawingBuffer!==void 0&&s.preserveDrawingBuffer,c=s.powerPreference!==void 0?s.powerPreference:"default",h=s.failIfMajorPerformanceCaveat!==void 0&&s.failIfMajorPerformanceCaveat;let u=null,d=null;const p=[],m=[];this.domElement=e,this.debug={checkShaderErrors:!0},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.outputEncoding=3e3,this.physicallyCorrectLights=!1,this.toneMapping=0,this.toneMappingExposure=1;const f=this;let g=!1,x=0,v=0,y=null,b=-1,w=null;const S=new Ue,M=new Ue;let L=null,I=e.width,P=e.height,N=1,W=null,G=null;const U=new Ue(0,0,I,P),j=new Ue(0,0,I,P);let ne=!1;const ie=[],B=new ao;let X=!1,Z=!1,te=null;const ee=new he,ce=new T,R={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};function E(){return y===null?N:1}let F,V,O,_,C,D,k,z,J,K,re,de,ue,fe,Le,We,pe,Ee,De,yr,xr,Ot,ni,se=t;function xh(A,H){for(let q=0;q<A.length;q++){const Y=A[q],Q=e.getContext(Y,H);if(Q!==null)return Q}return null}try{const A={alpha:n,depth:i,stencil:r,antialias:a,premultipliedAlpha:o,preserveDrawingBuffer:l,powerPreference:c,failIfMajorPerformanceCaveat:h};if("setAttribute"in e&&e.setAttribute("data-engine","three.js r136"),e.addEventListener("webglcontextlost",wh,!1),e.addEventListener("webglcontextrestored",_h,!1),se===null){const H=["webgl2","webgl","experimental-webgl"];if(f.isWebGL1Renderer===!0&&H.shift(),se=xh(H,A),se===null)throw xh(H)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}se.getShaderPrecisionFormat===void 0&&(se.getShaderPrecisionFormat=function(){return{rangeMin:1,rangeMax:1,precision:1}})}catch(A){throw console.error("THREE.WebGLRenderer: "+A.message),A}function bh(){F=new d0(se),V=new a0(se,F,s),F.init(V),Ot=new Lv(se,F,V),O=new Av(se,F,V),ie[0]=1029,_=new f0,C=new xv,D=new Rv(se,F,O,C,V,Ot,_),k=new l0(f),z=new u0(f),J=new n0(se,V),ni=new r0(se,F,J,V),K=new p0(se,J,_,ni),re=new x0(se,K,J,_),De=new y0(se,V,D),We=new o0(C),de=new yv(f,k,z,F,V,ni,We),ue=new Iv(C),fe=new wv,Le=new Ev(F,V),Ee=new i0(f,k,O,re,o),pe=new Zm(f,re,V),yr=new s0(se,F,_,V),xr=new m0(se,F,_,V),_.programs=de.programs,f.capabilities=V,f.extensions=F,f.properties=C,f.renderLists=fe,f.shadowMap=pe,f.state=O,f.info=_}bh();const _t=new Pv(f,se);function wh(A){A.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),g=!0}function _h(){console.log("THREE.WebGLRenderer: Context Restored."),g=!1;const A=_.autoReset,H=pe.enabled,q=pe.autoUpdate,Y=pe.needsUpdate,Q=pe.type;bh(),_.autoReset=A,pe.enabled=H,pe.autoUpdate=q,pe.needsUpdate=Y,pe.type=Q}function Mh(A){const H=A.target;H.removeEventListener("dispose",Mh),function(q){(function(Y){const Q=C.get(Y).programs;Q!==void 0&&(Q.forEach(function(ge){de.releaseProgram(ge)}),Y.isShaderMaterial&&de.releaseShaderCache(Y))})(q),C.remove(q)}(H)}this.xr=_t,this.getContext=function(){return se},this.getContextAttributes=function(){return se.getContextAttributes()},this.forceContextLoss=function(){const A=F.get("WEBGL_lose_context");A&&A.loseContext()},this.forceContextRestore=function(){const A=F.get("WEBGL_lose_context");A&&A.restoreContext()},this.getPixelRatio=function(){return N},this.setPixelRatio=function(A){A!==void 0&&(N=A,this.setSize(I,P,!1))},this.getSize=function(A){return A.set(I,P)},this.setSize=function(A,H,q){_t.isPresenting?console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting."):(I=A,P=H,e.width=Math.floor(A*N),e.height=Math.floor(H*N),q!==!1&&(e.style.width=A+"px",e.style.height=H+"px"),this.setViewport(0,0,A,H))},this.getDrawingBufferSize=function(A){return A.set(I*N,P*N).floor()},this.setDrawingBufferSize=function(A,H,q){I=A,P=H,N=q,e.width=Math.floor(A*q),e.height=Math.floor(H*q),this.setViewport(0,0,A,H)},this.getCurrentViewport=function(A){return A.copy(S)},this.getViewport=function(A){return A.copy(U)},this.setViewport=function(A,H,q,Y){A.isVector4?U.set(A.x,A.y,A.z,A.w):U.set(A,H,q,Y),O.viewport(S.copy(U).multiplyScalar(N).floor())},this.getScissor=function(A){return A.copy(j)},this.setScissor=function(A,H,q,Y){A.isVector4?j.set(A.x,A.y,A.z,A.w):j.set(A,H,q,Y),O.scissor(M.copy(j).multiplyScalar(N).floor())},this.getScissorTest=function(){return ne},this.setScissorTest=function(A){O.setScissorTest(ne=A)},this.setOpaqueSort=function(A){W=A},this.setTransparentSort=function(A){G=A},this.getClearColor=function(A){return A.copy(Ee.getClearColor())},this.setClearColor=function(){Ee.setClearColor.apply(Ee,arguments)},this.getClearAlpha=function(){return Ee.getClearAlpha()},this.setClearAlpha=function(){Ee.setClearAlpha.apply(Ee,arguments)},this.clear=function(A,H,q){let Y=0;(A===void 0||A)&&(Y|=16384),(H===void 0||H)&&(Y|=256),(q===void 0||q)&&(Y|=1024),se.clear(Y)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",wh,!1),e.removeEventListener("webglcontextrestored",_h,!1),fe.dispose(),Le.dispose(),C.dispose(),k.dispose(),z.dispose(),re.dispose(),ni.dispose(),de.dispose(),_t.dispose(),_t.removeEventListener("sessionstart",Sh),_t.removeEventListener("sessionend",Th),te&&(te.dispose(),te=null),ii.stop()},this.renderBufferDirect=function(A,H,q,Y,Q,ge){H===null&&(H=R);const be=Q.isMesh&&Q.matrixWorld.determinant()<0,ve=function(it,wr,Ut,xe,et){wr.isScene!==!0&&(wr=R),D.resetTextureUnits();const wo=wr.fog,yg=xe.isMeshStandardMaterial?wr.environment:null,xg=y===null?f.outputEncoding:y.texture.encoding,bg=(xe.isMeshStandardMaterial?z:k).get(xe.envMap||yg),wg=xe.vertexColors===!0&&!!Ut.attributes.color&&Ut.attributes.color.itemSize===4,_g=!!xe.normalMap&&!!Ut.attributes.tangent,Mg=!!Ut.morphAttributes.position,Sg=!!Ut.morphAttributes.normal,Tg=Ut.morphAttributes.position?Ut.morphAttributes.position.length:0,Eg=xe.toneMapped?f.toneMapping:0,Fe=C.get(xe),Ag=d.state.lights;if(X===!0&&(Z===!0||it!==w)){const zt=it===w&&xe.id===b;We.setState(xe,it,zt)}let ln=!1;xe.version===Fe.__version?Fe.needsLights&&Fe.lightsStateVersion!==Ag.state.version||Fe.outputEncoding!==xg||et.isInstancedMesh&&Fe.instancing===!1?ln=!0:et.isInstancedMesh||Fe.instancing!==!0?et.isSkinnedMesh&&Fe.skinning===!1?ln=!0:et.isSkinnedMesh||Fe.skinning!==!0?Fe.envMap!==bg||xe.fog&&Fe.fog!==wo?ln=!0:Fe.numClippingPlanes===void 0||Fe.numClippingPlanes===We.numPlanes&&Fe.numIntersection===We.numIntersection?(Fe.vertexAlphas!==wg||Fe.vertexTangents!==_g||Fe.morphTargets!==Mg||Fe.morphNormals!==Sg||Fe.toneMapping!==Eg||V.isWebGL2===!0&&Fe.morphTargetsCount!==Tg)&&(ln=!0):ln=!0:ln=!0:ln=!0:(ln=!0,Fe.__version=xe.version);let _r=Fe.currentProgram;ln===!0&&(_r=xo(xe,wr,et));let Lh=!1,Mr=!1,_o=!1;const lt=_r.getUniforms(),Sr=Fe.uniforms;if(O.useProgram(_r.program)&&(Lh=!0,Mr=!0,_o=!0),xe.id!==b&&(b=xe.id,Mr=!0),Lh||w!==it){if(lt.setValue(se,"projectionMatrix",it.projectionMatrix),V.logarithmicDepthBuffer&&lt.setValue(se,"logDepthBufFC",2/(Math.log(it.far+1)/Math.LN2)),w!==it&&(w=it,Mr=!0,_o=!0),xe.isShaderMaterial||xe.isMeshPhongMaterial||xe.isMeshToonMaterial||xe.isMeshStandardMaterial||xe.envMap){const zt=lt.map.cameraPosition;zt!==void 0&&zt.setValue(se,ce.setFromMatrixPosition(it.matrixWorld))}(xe.isMeshPhongMaterial||xe.isMeshToonMaterial||xe.isMeshLambertMaterial||xe.isMeshBasicMaterial||xe.isMeshStandardMaterial||xe.isShaderMaterial)&&lt.setValue(se,"isOrthographic",it.isOrthographicCamera===!0),(xe.isMeshPhongMaterial||xe.isMeshToonMaterial||xe.isMeshLambertMaterial||xe.isMeshBasicMaterial||xe.isMeshStandardMaterial||xe.isShaderMaterial||xe.isShadowMaterial||et.isSkinnedMesh)&&lt.setValue(se,"viewMatrix",it.matrixWorldInverse)}if(et.isSkinnedMesh){lt.setOptional(se,et,"bindMatrix"),lt.setOptional(se,et,"bindMatrixInverse");const zt=et.skeleton;zt&&(V.floatVertexTextures?(zt.boneTexture===null&&zt.computeBoneTexture(),lt.setValue(se,"boneTexture",zt.boneTexture,D),lt.setValue(se,"boneTextureSize",zt.boneTextureSize)):lt.setOptional(se,zt,"boneMatrices"))}!Ut||Ut.morphAttributes.position===void 0&&Ut.morphAttributes.normal===void 0||De.update(et,Ut,xe,_r),(Mr||Fe.receiveShadow!==et.receiveShadow)&&(Fe.receiveShadow=et.receiveShadow,lt.setValue(se,"receiveShadow",et.receiveShadow)),Mr&&(lt.setValue(se,"toneMappingExposure",f.toneMappingExposure),Fe.needsLights&&(kt=_o,(Xt=Sr).ambientLightColor.needsUpdate=kt,Xt.lightProbe.needsUpdate=kt,Xt.directionalLights.needsUpdate=kt,Xt.directionalLightShadows.needsUpdate=kt,Xt.pointLights.needsUpdate=kt,Xt.pointLightShadows.needsUpdate=kt,Xt.spotLights.needsUpdate=kt,Xt.spotLightShadows.needsUpdate=kt,Xt.rectAreaLights.needsUpdate=kt,Xt.hemisphereLights.needsUpdate=kt),wo&&xe.fog&&ue.refreshFogUniforms(Sr,wo),ue.refreshMaterialUniforms(Sr,xe,N,P,te),Yn.upload(se,Fe.uniformsList,Sr,D));var Xt,kt;return xe.isShaderMaterial&&xe.uniformsNeedUpdate===!0&&(Yn.upload(se,Fe.uniformsList,Sr,D),xe.uniformsNeedUpdate=!1),xe.isSpriteMaterial&&lt.setValue(se,"center",et.center),lt.setValue(se,"modelViewMatrix",et.modelViewMatrix),lt.setValue(se,"normalMatrix",et.normalMatrix),lt.setValue(se,"modelMatrix",et.matrixWorld),_r}(A,H,q,Y,Q);O.setMaterial(Y,be);let we=q.index;const Ne=q.attributes.position;if(we===null){if(Ne===void 0||Ne.count===0)return}else if(we.count===0)return;let Ae,Me=1;Y.wireframe===!0&&(we=K.getWireframeAttribute(q),Me=2),ni.setup(Q,Y,ve,q,we);let Qe=yr;we!==null&&(Ae=J.get(we),Qe=xr,Qe.setIndex(Ae));const br=we!==null?we.count:Ne.count,Rt=q.drawRange.start*Me,bo=q.drawRange.count*Me,Dn=ge!==null?ge.start*Me:0,gg=ge!==null?ge.count*Me:1/0,Os=Math.max(Rt,Dn),vg=Math.min(br,Rt+bo,Dn+gg)-1,Us=Math.max(0,vg-Os+1);if(Us!==0){if(Q.isMesh)Y.wireframe===!0?(O.setLineWidth(Y.wireframeLinewidth*E()),Qe.setMode(1)):Qe.setMode(4);else if(Q.isLine){let it=Y.linewidth;it===void 0&&(it=1),O.setLineWidth(it*E()),Q.isLineSegments?Qe.setMode(1):Q.isLineLoop?Qe.setMode(2):Qe.setMode(3)}else Q.isPoints?Qe.setMode(0):Q.isSprite&&Qe.setMode(4);if(Q.isInstancedMesh)Qe.renderInstances(Os,Us,Q.count);else if(q.isInstancedBufferGeometry){const it=Math.min(q.instanceCount,q._maxInstanceCount);Qe.renderInstances(Os,Us,it)}else Qe.render(Os,Us)}},this.compile=function(A,H){d=Le.get(A),d.init(),m.push(d),A.traverseVisible(function(q){q.isLight&&q.layers.test(H.layers)&&(d.pushLight(q),q.castShadow&&d.pushShadow(q))}),d.setupLights(f.physicallyCorrectLights),A.traverse(function(q){const Y=q.material;if(Y)if(Array.isArray(Y))for(let Q=0;Q<Y.length;Q++)xo(Y[Q],A,q);else xo(Y,A,q)}),m.pop(),d=null};let yo=null;function Sh(){ii.stop()}function Th(){ii.start()}const ii=new Fm;function Eh(A,H,q,Y){if(A.visible===!1)return;if(A.layers.test(H.layers)){if(A.isGroup)q=A.renderOrder;else if(A.isLOD)A.autoUpdate===!0&&A.update(H);else if(A.isLight)d.pushLight(A),A.castShadow&&d.pushShadow(A);else if(A.isSprite){if(!A.frustumCulled||B.intersectsSprite(A)){Y&&ce.setFromMatrixPosition(A.matrixWorld).applyMatrix4(ee);const ge=re.update(A),be=A.material;be.visible&&u.push(A,ge,be,q,ce.z,null)}}else if((A.isMesh||A.isLine||A.isPoints)&&(A.isSkinnedMesh&&A.skeleton.frame!==_.render.frame&&(A.skeleton.update(),A.skeleton.frame=_.render.frame),!A.frustumCulled||B.intersectsObject(A))){Y&&ce.setFromMatrixPosition(A.matrixWorld).applyMatrix4(ee);const ge=re.update(A),be=A.material;if(Array.isArray(be)){const ve=ge.groups;for(let we=0,Ne=ve.length;we<Ne;we++){const Ae=ve[we],Me=be[Ae.materialIndex];Me&&Me.visible&&u.push(A,ge,Me,q,ce.z,Ae)}}else be.visible&&u.push(A,ge,be,q,ce.z,null)}}const Q=A.children;for(let ge=0,be=Q.length;ge<be;ge++)Eh(Q[ge],H,q,Y)}function Ah(A,H,q,Y){const Q=A.opaque,ge=A.transmissive,be=A.transparent;d.setupLightsView(q),ge.length>0&&function(ve,we,Ne){if(te===null){const Qe=a===!0&&V.isWebGL2===!0;te=new(Qe?$c:wt)(1024,1024,{generateMipmaps:!0,type:Ot.convert(1016)!==null?1016:1009,minFilter:1008,magFilter:1003,wrapS:1001,wrapT:1001,useRenderToTexture:F.has("WEBGL_multisampled_render_to_texture")})}const Ae=f.getRenderTarget();f.setRenderTarget(te),f.clear();const Me=f.toneMapping;f.toneMapping=0,Fs(ve,we,Ne),f.toneMapping=Me,D.updateMultisampleRenderTarget(te),D.updateRenderTargetMipmap(te),f.setRenderTarget(Ae)}(Q,H,q),Y&&O.viewport(S.copy(Y)),Q.length>0&&Fs(Q,H,q),ge.length>0&&Fs(ge,H,q),be.length>0&&Fs(be,H,q)}function Fs(A,H,q){const Y=H.isScene===!0?H.overrideMaterial:null;for(let Q=0,ge=A.length;Q<ge;Q++){const be=A[Q],ve=be.object,we=be.geometry,Ne=Y===null?be.material:Y,Ae=be.group;ve.layers.test(q.layers)&&fg(ve,H,q,we,Ne,Ae)}}function fg(A,H,q,Y,Q,ge){A.onBeforeRender(f,H,q,Y,Q,ge),A.modelViewMatrix.multiplyMatrices(q.matrixWorldInverse,A.matrixWorld),A.normalMatrix.getNormalMatrix(A.modelViewMatrix),Q.onBeforeRender(f,H,q,Y,A,ge),Q.transparent===!0&&Q.side===2?(Q.side=1,Q.needsUpdate=!0,f.renderBufferDirect(q,H,Y,Q,A,ge),Q.side=0,Q.needsUpdate=!0,f.renderBufferDirect(q,H,Y,Q,A,ge),Q.side=2):f.renderBufferDirect(q,H,Y,Q,A,ge),A.onAfterRender(f,H,q,Y,Q,ge)}function xo(A,H,q){H.isScene!==!0&&(H=R);const Y=C.get(A),Q=d.state.lights,ge=d.state.shadowsArray,be=Q.state.version,ve=de.getParameters(A,Q.state,ge,H,q),we=de.getProgramCacheKey(ve);let Ne=Y.programs;Y.environment=A.isMeshStandardMaterial?H.environment:null,Y.fog=H.fog,Y.envMap=(A.isMeshStandardMaterial?z:k).get(A.envMap||Y.environment),Ne===void 0&&(A.addEventListener("dispose",Mh),Ne=new Map,Y.programs=Ne);let Ae=Ne.get(we);if(Ae!==void 0){if(Y.currentProgram===Ae&&Y.lightsStateVersion===be)return Rh(A,ve),Ae}else ve.uniforms=de.getUniforms(A),A.onBuild(q,ve,f),A.onBeforeCompile(ve,f),Ae=de.acquireProgram(ve,we),Ne.set(we,Ae),Y.uniforms=ve.uniforms;const Me=Y.uniforms;(A.isShaderMaterial||A.isRawShaderMaterial)&&A.clipping!==!0||(Me.clippingPlanes=We.uniform),Rh(A,ve),Y.needsLights=function(Rt){return Rt.isMeshLambertMaterial||Rt.isMeshToonMaterial||Rt.isMeshPhongMaterial||Rt.isMeshStandardMaterial||Rt.isShadowMaterial||Rt.isShaderMaterial&&Rt.lights===!0}(A),Y.lightsStateVersion=be,Y.needsLights&&(Me.ambientLightColor.value=Q.state.ambient,Me.lightProbe.value=Q.state.probe,Me.directionalLights.value=Q.state.directional,Me.directionalLightShadows.value=Q.state.directionalShadow,Me.spotLights.value=Q.state.spot,Me.spotLightShadows.value=Q.state.spotShadow,Me.rectAreaLights.value=Q.state.rectArea,Me.ltc_1.value=Q.state.rectAreaLTC1,Me.ltc_2.value=Q.state.rectAreaLTC2,Me.pointLights.value=Q.state.point,Me.pointLightShadows.value=Q.state.pointShadow,Me.hemisphereLights.value=Q.state.hemi,Me.directionalShadowMap.value=Q.state.directionalShadowMap,Me.directionalShadowMatrix.value=Q.state.directionalShadowMatrix,Me.spotShadowMap.value=Q.state.spotShadowMap,Me.spotShadowMatrix.value=Q.state.spotShadowMatrix,Me.pointShadowMap.value=Q.state.pointShadowMap,Me.pointShadowMatrix.value=Q.state.pointShadowMatrix);const Qe=Ae.getUniforms(),br=Yn.seqWithValue(Qe.seq,Me);return Y.currentProgram=Ae,Y.uniformsList=br,Ae}function Rh(A,H){const q=C.get(A);q.outputEncoding=H.outputEncoding,q.instancing=H.instancing,q.skinning=H.skinning,q.morphTargets=H.morphTargets,q.morphNormals=H.morphNormals,q.morphTargetsCount=H.morphTargetsCount,q.numClippingPlanes=H.numClippingPlanes,q.numIntersection=H.numClipIntersection,q.vertexAlphas=H.vertexAlphas,q.vertexTangents=H.vertexTangents,q.toneMapping=H.toneMapping}ii.setAnimationLoop(function(A){yo&&yo(A)}),typeof window<"u"&&ii.setContext(window),this.setAnimationLoop=function(A){yo=A,_t.setAnimationLoop(A),A===null?ii.stop():ii.start()},_t.addEventListener("sessionstart",Sh),_t.addEventListener("sessionend",Th),this.render=function(A,H){if(H!==void 0&&H.isCamera!==!0)return void console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");if(g===!0)return;A.autoUpdate===!0&&A.updateMatrixWorld(),H.parent===null&&H.updateMatrixWorld(),_t.enabled===!0&&_t.isPresenting===!0&&(_t.cameraAutoUpdate===!0&&_t.updateCamera(H),H=_t.getCamera()),A.isScene===!0&&A.onBeforeRender(f,A,H,y),d=Le.get(A,m.length),d.init(),m.push(d),ee.multiplyMatrices(H.projectionMatrix,H.matrixWorldInverse),B.setFromProjectionMatrix(ee),Z=this.localClippingEnabled,X=We.init(this.clippingPlanes,Z,H),u=fe.get(A,p.length),u.init(),p.push(u),Eh(A,H,0,f.sortObjects),u.finish(),f.sortObjects===!0&&u.sort(W,G),X===!0&&We.beginShadows();const q=d.state.shadowsArray;if(pe.render(q,A,H),X===!0&&We.endShadows(),this.info.autoReset===!0&&this.info.reset(),Ee.render(u,A),d.setupLights(f.physicallyCorrectLights),H.isArrayCamera){const Y=H.cameras;for(let Q=0,ge=Y.length;Q<ge;Q++){const be=Y[Q];Ah(u,A,be,be.viewport)}}else Ah(u,A,H);y!==null&&(D.updateMultisampleRenderTarget(y),D.updateRenderTargetMipmap(y)),A.isScene===!0&&A.onAfterRender(f,A,H),O.buffers.depth.setTest(!0),O.buffers.depth.setMask(!0),O.buffers.color.setMask(!0),O.setPolygonOffset(!1),ni.resetDefaultState(),b=-1,w=null,m.pop(),d=m.length>0?m[m.length-1]:null,p.pop(),u=p.length>0?p[p.length-1]:null},this.getActiveCubeFace=function(){return x},this.getActiveMipmapLevel=function(){return v},this.getRenderTarget=function(){return y},this.setRenderTargetTextures=function(A,H,q){C.get(A.texture).__webglTexture=H,C.get(A.depthTexture).__webglTexture=q;const Y=C.get(A);Y.__hasExternalTextures=!0,Y.__hasExternalTextures&&(Y.__autoAllocateDepthBuffer=q===void 0,Y.__autoAllocateDepthBuffer||A.useRenderToTexture&&(console.warn("render-to-texture extension was disabled because an external texture was provided"),A.useRenderToTexture=!1,A.useRenderbuffer=!0))},this.setRenderTargetFramebuffer=function(A,H){const q=C.get(A);q.__webglFramebuffer=H,q.__useDefaultFramebuffer=H===void 0},this.setRenderTarget=function(A,H=0,q=0){y=A,x=H,v=q;let Y=!0;if(A){const ve=C.get(A);ve.__useDefaultFramebuffer!==void 0?(O.bindFramebuffer(36160,null),Y=!1):ve.__webglFramebuffer===void 0?D.setupRenderTarget(A):ve.__hasExternalTextures&&D.rebindTextures(A,C.get(A.texture).__webglTexture,C.get(A.depthTexture).__webglTexture)}let Q=null,ge=!1,be=!1;if(A){const ve=A.texture;(ve.isDataTexture3D||ve.isDataTexture2DArray)&&(be=!0);const we=C.get(A).__webglFramebuffer;A.isWebGLCubeRenderTarget?(Q=we[H],ge=!0):Q=A.useRenderbuffer?C.get(A).__webglMultisampledFramebuffer:we,S.copy(A.viewport),M.copy(A.scissor),L=A.scissorTest}else S.copy(U).multiplyScalar(N).floor(),M.copy(j).multiplyScalar(N).floor(),L=ne;if(O.bindFramebuffer(36160,Q)&&V.drawBuffers&&Y){let ve=!1;if(A)if(A.isWebGLMultipleRenderTargets){const we=A.texture;if(ie.length!==we.length||ie[0]!==36064){for(let Ne=0,Ae=we.length;Ne<Ae;Ne++)ie[Ne]=36064+Ne;ie.length=we.length,ve=!0}}else ie.length===1&&ie[0]===36064||(ie[0]=36064,ie.length=1,ve=!0);else ie.length===1&&ie[0]===1029||(ie[0]=1029,ie.length=1,ve=!0);ve&&(V.isWebGL2?se.drawBuffers(ie):F.get("WEBGL_draw_buffers").drawBuffersWEBGL(ie))}if(O.viewport(S),O.scissor(M),O.setScissorTest(L),ge){const ve=C.get(A.texture);se.framebufferTexture2D(36160,36064,34069+H,ve.__webglTexture,q)}else if(be){const ve=C.get(A.texture),we=H||0;se.framebufferTextureLayer(36160,36064,ve.__webglTexture,q||0,we)}b=-1},this.readRenderTargetPixels=function(A,H,q,Y,Q,ge,be){if(!A||!A.isWebGLRenderTarget)return void console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let ve=C.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&be!==void 0&&(ve=ve[be]),ve){O.bindFramebuffer(36160,ve);try{const we=A.texture,Ne=we.format,Ae=we.type;if(Ne!==1023&&Ot.convert(Ne)!==se.getParameter(35739))return void console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");const Me=Ae===1016&&(F.has("EXT_color_buffer_half_float")||V.isWebGL2&&F.has("EXT_color_buffer_float"));if(!(Ae===1009||Ot.convert(Ae)===se.getParameter(35738)||Ae===1015&&(V.isWebGL2||F.has("OES_texture_float")||F.has("WEBGL_color_buffer_float"))||Me))return void console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");se.checkFramebufferStatus(36160)===36053?H>=0&&H<=A.width-Y&&q>=0&&q<=A.height-Q&&se.readPixels(H,q,Y,Q,Ot.convert(Ne),Ot.convert(Ae),ge):console.error("THREE.WebGLRenderer.readRenderTargetPixels: readPixels from renderTarget failed. Framebuffer not complete.")}finally{const we=y!==null?C.get(y).__webglFramebuffer:null;O.bindFramebuffer(36160,we)}}},this.copyFramebufferToTexture=function(A,H,q=0){if(H.isFramebufferTexture!==!0)return void console.error("THREE.WebGLRenderer: copyFramebufferToTexture() can only be used with FramebufferTexture.");const Y=Math.pow(2,-q),Q=Math.floor(H.image.width*Y),ge=Math.floor(H.image.height*Y);D.setTexture2D(H,0),se.copyTexSubImage2D(3553,q,0,0,A.x,A.y,Q,ge),O.unbindTexture()},this.copyTextureToTexture=function(A,H,q,Y=0){const Q=H.image.width,ge=H.image.height,be=Ot.convert(q.format),ve=Ot.convert(q.type);D.setTexture2D(q,0),se.pixelStorei(37440,q.flipY),se.pixelStorei(37441,q.premultiplyAlpha),se.pixelStorei(3317,q.unpackAlignment),H.isDataTexture?se.texSubImage2D(3553,Y,A.x,A.y,Q,ge,be,ve,H.image.data):H.isCompressedTexture?se.compressedTexSubImage2D(3553,Y,A.x,A.y,H.mipmaps[0].width,H.mipmaps[0].height,be,H.mipmaps[0].data):se.texSubImage2D(3553,Y,A.x,A.y,be,ve,H.image),Y===0&&q.generateMipmaps&&se.generateMipmap(3553),O.unbindTexture()},this.copyTextureToTexture3D=function(A,H,q,Y,Q=0){if(f.isWebGL1Renderer)return void console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.");const ge=A.max.x-A.min.x+1,be=A.max.y-A.min.y+1,ve=A.max.z-A.min.z+1,we=Ot.convert(Y.format),Ne=Ot.convert(Y.type);let Ae;if(Y.isDataTexture3D)D.setTexture3D(Y,0),Ae=32879;else{if(!Y.isDataTexture2DArray)return void console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");D.setTexture2DArray(Y,0),Ae=35866}se.pixelStorei(37440,Y.flipY),se.pixelStorei(37441,Y.premultiplyAlpha),se.pixelStorei(3317,Y.unpackAlignment);const Me=se.getParameter(3314),Qe=se.getParameter(32878),br=se.getParameter(3316),Rt=se.getParameter(3315),bo=se.getParameter(32877),Dn=q.isCompressedTexture?q.mipmaps[0]:q.image;se.pixelStorei(3314,Dn.width),se.pixelStorei(32878,Dn.height),se.pixelStorei(3316,A.min.x),se.pixelStorei(3315,A.min.y),se.pixelStorei(32877,A.min.z),q.isDataTexture||q.isDataTexture3D?se.texSubImage3D(Ae,Q,H.x,H.y,H.z,ge,be,ve,we,Ne,Dn.data):q.isCompressedTexture?(console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: untested support for compressed srcTexture."),se.compressedTexSubImage3D(Ae,Q,H.x,H.y,H.z,ge,be,ve,we,Dn.data)):se.texSubImage3D(Ae,Q,H.x,H.y,H.z,ge,be,ve,we,Ne,Dn),se.pixelStorei(3314,Me),se.pixelStorei(32878,Qe),se.pixelStorei(3316,br),se.pixelStorei(3315,Rt),se.pixelStorei(32877,bo),Q===0&&Y.generateMipmaps&&se.generateMipmap(Ae),O.unbindTexture()},this.initTexture=function(A){D.setTexture2D(A,0),O.unbindTexture()},this.resetState=function(){x=0,v=0,y=null,O.reset(),ni.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}Pe.prototype.isWebGLRenderer=!0;(class extends Pe{}).prototype.isWebGL1Renderer=!0;class an extends Re{constructor(){super(),this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.overrideMaterial=null,this.autoUpdate=!0,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.autoUpdate=e.autoUpdate,this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t}}an.prototype.isScene=!0;class hr{constructor(e,t){this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=35044,this.updateRange={offset:0,count:-1},this.version=0,this.uuid=Dt()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let i=0,r=this.stride;i<r;i++)this.array[e+i]=t.array[n+i];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Dt()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Dt()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.prototype.slice.call(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}hr.prototype.isInterleavedBuffer=!0;const Xe=new T;class ur{constructor(e,t,n,i=!1){this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=i===!0}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)Xe.x=this.getX(t),Xe.y=this.getY(t),Xe.z=this.getZ(t),Xe.applyMatrix4(e),this.setXYZ(t,Xe.x,Xe.y,Xe.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Xe.x=this.getX(t),Xe.y=this.getY(t),Xe.z=this.getZ(t),Xe.applyNormalMatrix(e),this.setXYZ(t,Xe.x,Xe.y,Xe.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Xe.x=this.getX(t),Xe.y=this.getY(t),Xe.z=this.getZ(t),Xe.transformDirection(e),this.setXYZ(t,Xe.x,Xe.y,Xe.z);return this}setX(e,t){return this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){return this.data.array[e*this.data.stride+this.offset]}getY(e){return this.data.array[e*this.data.stride+this.offset+1]}getZ(e){return this.data.array[e*this.data.stride+this.offset+2]}getW(e){return this.data.array[e*this.data.stride+this.offset+3]}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,i){return e=e*this.data.stride+this.offset,this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e=e*this.data.stride+this.offset,this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this.data.array[e+3]=r,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interlaved buffer attribute will deinterleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[i+r])}return new ke(new this.array.constructor(t),this.itemSize,this.normalized)}return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new ur(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interlaved buffer attribute will deinterleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[i+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}ur.prototype.isInterleavedBufferAttribute=!0;class $m extends Je{constructor(e){super(),this.type="SpriteMaterial",this.color=new le(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this}}let zi;$m.prototype.isSpriteMaterial=!0;const Pr=new T,Bi=new T,Hi=new T,Vi=new $,Ir=new $,Km=new he,aa=new T,Dr=new T,oa=new T,gu=new $,$o=new $,vu=new $;function la(s,e,t,n,i,r){Vi.subVectors(s,t).addScalar(.5).multiply(n),i!==void 0?(Ir.x=r*Vi.x-i*Vi.y,Ir.y=i*Vi.x+r*Vi.y):Ir.copy(Vi),s.copy(e),s.x+=Ir.x,s.y+=Ir.y,s.applyMatrix4(Km)}(class extends Re{constructor(s){if(super(),this.type="Sprite",zi===void 0){zi=new Oe;const e=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),t=new hr(e,5);zi.setIndex([0,1,2,0,2,3]),zi.setAttribute("position",new ur(t,3,0,!1)),zi.setAttribute("uv",new ur(t,2,3,!1))}this.geometry=zi,this.material=s!==void 0?s:new $m,this.center=new $(.5,.5)}raycast(s,e){s.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Bi.setFromMatrixScale(this.matrixWorld),Km.copy(s.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(s.camera.matrixWorldInverse,this.matrixWorld),Hi.setFromMatrixPosition(this.modelViewMatrix),s.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Bi.multiplyScalar(-Hi.z);const t=this.material.rotation;let n,i;t!==0&&(i=Math.cos(t),n=Math.sin(t));const r=this.center;la(aa.set(-.5,-.5,0),Hi,r,Bi,n,i),la(Dr.set(.5,-.5,0),Hi,r,Bi,n,i),la(oa.set(.5,.5,0),Hi,r,Bi,n,i),gu.set(0,0),$o.set(1,0),vu.set(1,1);let a=s.ray.intersectTriangle(aa,Dr,oa,!1,Pr);if(a===null&&(la(Dr.set(-.5,.5,0),Hi,r,Bi,n,i),$o.set(0,1),a=s.ray.intersectTriangle(aa,oa,Dr,!1,Pr),a===null))return;const o=s.ray.origin.distanceTo(Pr);o<s.near||o>s.far||e.push({distance:o,point:Pr.clone(),uv:Ze.getUV(Pr,aa,Dr,oa,gu,$o,vu,new $),face:null,object:this})}copy(s){return super.copy(s),s.center!==void 0&&this.center.copy(s.center),this.material=s.material,this}}).prototype.isSprite=!0;const yu=new T,xu=new Ue,bu=new Ue,Dv=new T,wu=new he;class ih extends me{constructor(e,t){super(e,t),this.type="SkinnedMesh",this.bindMode="attached",this.bindMatrix=new he,this.bindMatrixInverse=new he}copy(e){return super.copy(e),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,this}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new Ue,t=this.geometry.attributes.skinWeight;for(let n=0,i=t.count;n<i;n++){e.x=t.getX(n),e.y=t.getY(n),e.z=t.getZ(n),e.w=t.getW(n);const r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode==="attached"?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode==="detached"?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}boneTransform(e,t){const n=this.skeleton,i=this.geometry;xu.fromBufferAttribute(i.attributes.skinIndex,e),bu.fromBufferAttribute(i.attributes.skinWeight,e),yu.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let r=0;r<4;r++){const a=bu.getComponent(r);if(a!==0){const o=xu.getComponent(r);wu.multiplyMatrices(n.bones[o].matrixWorld,n.boneInverses[o]),t.addScaledVector(Dv.copy(yu).applyMatrix4(wu),a)}}return t.applyMatrix4(this.bindMatrixInverse)}}ih.prototype.isSkinnedMesh=!0;class rh extends Re{constructor(){super(),this.type="Bone"}}rh.prototype.isBone=!0;class sh extends qe{constructor(e=null,t=1,n=1,i,r,a,o,l,c=1003,h=1003,u,d){super(null,a,o,l,c,h,i,r,u,d),this.image={data:e,width:t,height:n},this.magFilter=c,this.minFilter=h,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}sh.prototype.isDataTexture=!0;const _u=new he,Nv=new he;class ah{constructor(e=[],t=[]){this.uuid=Dt(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.boneTextureSize=0,this.frame=-1,this.init()}init(){const e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(16*e.length),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,i=this.bones.length;n<i;n++)this.boneInverses.push(new he)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){const n=new he;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){const e=this.bones,t=this.boneInverses,n=this.boneMatrices,i=this.boneTexture;for(let r=0,a=e.length;r<a;r++){const o=e[r]?e[r].matrixWorld:Nv;_u.multiplyMatrices(o,t[r]),_u.toArray(n,16*r)}i!==null&&(i.needsUpdate=!0)}clone(){return new ah(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(4*this.bones.length);e=Rm(e),e=Math.max(e,4);const t=new Float32Array(e*e*4);t.set(this.boneMatrices);const n=new sh(t,e,e,1023,1015);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this.boneTextureSize=e,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){const i=this.bones[t];if(i.name===e)return i}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,i=e.bones.length;n<i;n++){const r=e.bones[n];let a=t[r];a===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",r),a=new rh),this.bones.push(a),this.boneInverses.push(new he().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){const e={metadata:{version:4.5,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;const t=this.bones,n=this.boneInverses;for(let i=0,r=t.length;i<r;i++){const a=t[i];e.bones.push(a.uuid);const o=n[i];e.boneInverses.push(o.toArray())}return e}}class Tc extends ke{constructor(e,t,n,i=1){typeof n=="number"&&(i=n,n=!1,console.error("THREE.InstancedBufferAttribute: The constructor now expects normalized as the third argument.")),super(e,t,n),this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}Tc.prototype.isInstancedBufferAttribute=!0;const Mu=new he,Su=new he,ca=[],Nr=new me;(class extends me{constructor(s,e,t){super(s,e),this.instanceMatrix=new Tc(new Float32Array(16*t),16),this.instanceColor=null,this.count=t,this.frustumCulled=!1}copy(s){return super.copy(s),this.instanceMatrix.copy(s.instanceMatrix),s.instanceColor!==null&&(this.instanceColor=s.instanceColor.clone()),this.count=s.count,this}getColorAt(s,e){e.fromArray(this.instanceColor.array,3*s)}getMatrixAt(s,e){e.fromArray(this.instanceMatrix.array,16*s)}raycast(s,e){const t=this.matrixWorld,n=this.count;if(Nr.geometry=this.geometry,Nr.material=this.material,Nr.material!==void 0)for(let i=0;i<n;i++){this.getMatrixAt(i,Mu),Su.multiplyMatrices(t,Mu),Nr.matrixWorld=Su,Nr.raycast(s,ca);for(let r=0,a=ca.length;r<a;r++){const o=ca[r];o.instanceId=i,o.object=this,e.push(o)}ca.length=0}}setColorAt(s,e){this.instanceColor===null&&(this.instanceColor=new Tc(new Float32Array(3*this.instanceMatrix.count),3)),e.toArray(this.instanceColor.array,3*s)}setMatrixAt(s,e){e.toArray(this.instanceMatrix.array,16*s)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"})}}).prototype.isInstancedMesh=!0;class dr extends Je{constructor(e){super(),this.type="LineBasicMaterial",this.color=new le(16777215),this.linewidth=1,this.linecap="round",this.linejoin="round",this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this}}dr.prototype.isLineBasicMaterial=!0;const Tu=new T,Eu=new T,Au=new he,Ko=new bi,ha=new ei;class co extends Re{constructor(e=new Oe,t=new dr){super(),this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e){return super.copy(e),this.material=e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.isBufferGeometry)if(e.index===null){const t=e.attributes.position,n=[0];for(let i=1,r=t.count;i<r;i++)Tu.fromBufferAttribute(t,i-1),Eu.fromBufferAttribute(t,i),n[i]=n[i-1],n[i]+=Tu.distanceTo(Eu);e.setAttribute("lineDistance",new Ke(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");else e.isGeometry&&console.error("THREE.Line.computeLineDistances() no longer supports THREE.Geometry. Use THREE.BufferGeometry instead.");return this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,r=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ha.copy(n.boundingSphere),ha.applyMatrix4(i),ha.radius+=r,e.ray.intersectsSphere(ha)===!1)return;Au.copy(i).invert(),Ko.copy(e.ray).applyMatrix4(Au);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=new T,h=new T,u=new T,d=new T,p=this.isLineSegments?2:1;if(n.isBufferGeometry){const m=n.index,f=n.attributes.position;if(m!==null)for(let g=Math.max(0,a.start),x=Math.min(m.count,a.start+a.count)-1;g<x;g+=p){const v=m.getX(g),y=m.getX(g+1);if(c.fromBufferAttribute(f,v),h.fromBufferAttribute(f,y),Ko.distanceSqToSegment(c,h,d,u)>l)continue;d.applyMatrix4(this.matrixWorld);const b=e.ray.origin.distanceTo(d);b<e.near||b>e.far||t.push({distance:b,point:u.clone().applyMatrix4(this.matrixWorld),index:g,face:null,faceIndex:null,object:this})}else for(let g=Math.max(0,a.start),x=Math.min(f.count,a.start+a.count)-1;g<x;g+=p){if(c.fromBufferAttribute(f,g),h.fromBufferAttribute(f,g+1),Ko.distanceSqToSegment(c,h,d,u)>l)continue;d.applyMatrix4(this.matrixWorld);const v=e.ray.origin.distanceTo(d);v<e.near||v>e.far||t.push({distance:v,point:u.clone().applyMatrix4(this.matrixWorld),index:g,face:null,faceIndex:null,object:this})}}else n.isGeometry&&console.error("THREE.Line.raycast() no longer supports THREE.Geometry. Use THREE.BufferGeometry instead.")}updateMorphTargets(){const e=this.geometry;if(e.isBufferGeometry){const t=e.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=i.length;r<a;r++){const o=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}else{const t=e.morphTargets;t!==void 0&&t.length>0&&console.error("THREE.Line.updateMorphTargets() does not support THREE.Geometry. Use THREE.BufferGeometry instead.")}}}co.prototype.isLine=!0;const Ru=new T,Lu=new T;class Ya extends co{constructor(e,t){super(e,t),this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.isBufferGeometry)if(e.index===null){const t=e.attributes.position,n=[];for(let i=0,r=t.count;i<r;i+=2)Ru.fromBufferAttribute(t,i),Lu.fromBufferAttribute(t,i+1),n[i]=i===0?0:n[i-1],n[i+1]=n[i]+Ru.distanceTo(Lu);e.setAttribute("lineDistance",new Ke(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");else e.isGeometry&&console.error("THREE.LineSegments.computeLineDistances() no longer supports THREE.Geometry. Use THREE.BufferGeometry instead.");return this}}Ya.prototype.isLineSegments=!0;class Qm extends co{constructor(e,t){super(e,t),this.type="LineLoop"}}Qm.prototype.isLineLoop=!0;class oh extends Je{constructor(e){super(),this.type="PointsMaterial",this.color=new le(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this}}oh.prototype.isPointsMaterial=!0;const Cu=new he,Ec=new bi,ua=new ei,da=new T;class ef extends Re{constructor(e=new Oe,t=new oh){super(),this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e){return super.copy(e),this.material=e.material,this.geometry=e.geometry,this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,r=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ua.copy(n.boundingSphere),ua.applyMatrix4(i),ua.radius+=r,e.ray.intersectsSphere(ua)===!1)return;Cu.copy(i).invert(),Ec.copy(e.ray).applyMatrix4(Cu);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o;if(n.isBufferGeometry){const c=n.index,h=n.attributes.position;if(c!==null)for(let u=Math.max(0,a.start),d=Math.min(c.count,a.start+a.count);u<d;u++){const p=c.getX(u);da.fromBufferAttribute(h,p),Pu(da,p,l,i,e,t,this)}else for(let u=Math.max(0,a.start),d=Math.min(h.count,a.start+a.count);u<d;u++)da.fromBufferAttribute(h,u),Pu(da,u,l,i,e,t,this)}else console.error("THREE.Points.raycast() no longer supports THREE.Geometry. Use THREE.BufferGeometry instead.")}updateMorphTargets(){const e=this.geometry;if(e.isBufferGeometry){const t=e.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=i.length;r<a;r++){const o=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}else{const t=e.morphTargets;t!==void 0&&t.length>0&&console.error("THREE.Points.updateMorphTargets() does not support THREE.Geometry. Use THREE.BufferGeometry instead.")}}}function Pu(s,e,t,n,i,r,a){const o=Ec.distanceSqToPoint(s);if(o<t){const l=new T;Ec.closestPointToPoint(s,l),l.applyMatrix4(n);const c=i.ray.origin.distanceTo(l);if(c<i.near||c>i.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:e,face:null,object:a})}}ef.prototype.isPoints=!0;(class extends qe{constructor(s,e,t,n,i,r,a,o,l){super(s,e,t,n,i,r,a,o,l),this.format=a!==void 0?a:1022,this.minFilter=r!==void 0?r:1006,this.magFilter=i!==void 0?i:1006,this.generateMipmaps=!1;const c=this;"requestVideoFrameCallback"in s&&s.requestVideoFrameCallback(function h(){c.needsUpdate=!0,s.requestVideoFrameCallback(h)})}clone(){return new this.constructor(this.image).copy(this)}update(){const s=this.image;!("requestVideoFrameCallback"in s)&&s.readyState>=s.HAVE_CURRENT_DATA&&(this.needsUpdate=!0)}}).prototype.isVideoTexture=!0;(class extends qe{constructor(s,e,t){super({width:s,height:e}),this.format=t,this.magFilter=1003,this.minFilter=1003,this.generateMipmaps=!1,this.needsUpdate=!0}}).prototype.isFramebufferTexture=!0;class Ac extends qe{constructor(e,t,n,i,r,a,o,l,c,h,u,d){super(null,a,o,l,c,h,i,r,u,d),this.image={width:t,height:n},this.mipmaps=e,this.flipY=!1,this.generateMipmaps=!1}}Ac.prototype.isCompressedTexture=!0;(class extends qe{constructor(s,e,t,n,i,r,a,o,l){super(s,e,t,n,i,r,a,o,l),this.needsUpdate=!0}}).prototype.isCanvasTexture=!0,new T,new T,new T,new Ze;class Nt{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){const n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let n,i=this.getPoint(0),r=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),r+=n.distanceTo(i),t.push(r),i=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){const n=this.getLengths();let i=0;const r=n.length;let a;a=t||e*n[r-1];let o,l=0,c=r-1;for(;l<=c;)if(i=Math.floor(l+(c-l)/2),o=n[i]-a,o<0)l=i+1;else{if(!(o>0)){c=i;break}c=i-1}if(i=c,n[i]===a)return i/(r-1);const h=n[i];return(i+(a-h)/(n[i+1]-h))/(r-1)}getTangent(e,t){let i=e-1e-4,r=e+1e-4;i<0&&(i=0),r>1&&(r=1);const a=this.getPoint(i),o=this.getPoint(r),l=t||(a.isVector2?new $:new T);return l.copy(o).sub(a).normalize(),l}getTangentAt(e,t){const n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t){const n=new T,i=[],r=[],a=[],o=new T,l=new he;for(let p=0;p<=e;p++){const m=p/e;i[p]=this.getTangentAt(m,new T)}r[0]=new T,a[0]=new T;let c=Number.MAX_VALUE;const h=Math.abs(i[0].x),u=Math.abs(i[0].y),d=Math.abs(i[0].z);h<=c&&(c=h,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),o.crossVectors(i[0],n).normalize(),r[0].crossVectors(i[0],o),a[0].crossVectors(i[0],r[0]);for(let p=1;p<=e;p++){if(r[p]=r[p-1].clone(),a[p]=a[p-1].clone(),o.crossVectors(i[p-1],i[p]),o.length()>Number.EPSILON){o.normalize();const m=Math.acos(mt(i[p-1].dot(i[p]),-1,1));r[p].applyMatrix4(l.makeRotationAxis(o,m))}a[p].crossVectors(i[p],r[p])}if(t===!0){let p=Math.acos(mt(r[0].dot(r[e]),-1,1));p/=e,i[0].dot(o.crossVectors(r[0],r[e]))>0&&(p=-p);for(let m=1;m<=e;m++)r[m].applyMatrix4(l.makeRotationAxis(i[m],p*m)),a[m].crossVectors(i[m],r[m])}return{tangents:i,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){const e={metadata:{version:4.5,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}}class ho extends Nt{constructor(e=0,t=0,n=1,i=1,r=0,a=2*Math.PI,o=!1,l=0){super(),this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=i,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(e,t){const n=t||new $,i=2*Math.PI;let r=this.aEndAngle-this.aStartAngle;const a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=i;for(;r>i;)r-=i;r<Number.EPSILON&&(r=a?0:i),this.aClockwise!==!0||a||(r===i?r=-i:r-=i);const o=this.aStartAngle+e*r;let l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){const h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),d=l-this.aX,p=c-this.aY;l=d*h-p*u+this.aX,c=d*u+p*h+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}ho.prototype.isEllipseCurve=!0;class tf extends ho{constructor(e,t,n,i,r,a){super(e,t,n,n,i,r,a),this.type="ArcCurve"}}function lh(){let s=0,e=0,t=0,n=0;function i(r,a,o,l){s=r,e=o,t=-3*r+3*a-2*o-l,n=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){i(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,h,u){let d=(a-r)/c-(o-r)/(c+h)+(o-a)/h,p=(o-a)/h-(l-a)/(h+u)+(l-o)/u;d*=h,p*=h,i(a,o,d,p)},calc:function(r){const a=r*r;return s+e*r+t*a+n*(a*r)}}}tf.prototype.isArcCurve=!0;const pa=new T,Qo=new lh,el=new lh,tl=new lh;class nf extends Nt{constructor(e=[],t=!1,n="centripetal",i=.5){super(),this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=i}getPoint(e,t=new T){const n=t,i=this.points,r=i.length,a=(r-(this.closed?0:1))*e;let o,l,c=Math.floor(a),h=a-c;this.closed?c+=c>0?0:(Math.floor(Math.abs(c)/r)+1)*r:h===0&&c===r-1&&(c=r-2,h=1),this.closed||c>0?o=i[(c-1)%r]:(pa.subVectors(i[0],i[1]).add(i[0]),o=pa);const u=i[c%r],d=i[(c+1)%r];if(this.closed||c+2<r?l=i[(c+2)%r]:(pa.subVectors(i[r-1],i[r-2]).add(i[r-1]),l=pa),this.curveType==="centripetal"||this.curveType==="chordal"){const p=this.curveType==="chordal"?.5:.25;let m=Math.pow(o.distanceToSquared(u),p),f=Math.pow(u.distanceToSquared(d),p),g=Math.pow(d.distanceToSquared(l),p);f<1e-4&&(f=1),m<1e-4&&(m=f),g<1e-4&&(g=f),Qo.initNonuniformCatmullRom(o.x,u.x,d.x,l.x,m,f,g),el.initNonuniformCatmullRom(o.y,u.y,d.y,l.y,m,f,g),tl.initNonuniformCatmullRom(o.z,u.z,d.z,l.z,m,f,g)}else this.curveType==="catmullrom"&&(Qo.initCatmullRom(o.x,u.x,d.x,l.x,this.tension),el.initCatmullRom(o.y,u.y,d.y,l.y,this.tension),tl.initCatmullRom(o.z,u.z,d.z,l.z,this.tension));return n.set(Qo.calc(h),el.calc(h),tl.calc(h)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(i.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const i=this.points[t];e.points.push(i.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(new T().fromArray(i))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function Iu(s,e,t,n,i){const r=.5*(n-e),a=.5*(i-t),o=s*s;return(2*t-2*n+r+a)*(s*o)+(-3*t+3*n-2*r-a)*o+r*s+t}function fs(s,e,t,n){return function(i,r){const a=1-i;return a*a*r}(s,e)+function(i,r){return 2*(1-i)*i*r}(s,t)+function(i,r){return i*i*r}(s,n)}function gs(s,e,t,n,i){return function(r,a){const o=1-r;return o*o*o*a}(s,e)+function(r,a){const o=1-r;return 3*o*o*r*a}(s,t)+function(r,a){return 3*(1-r)*r*r*a}(s,n)+function(r,a){return r*r*r*a}(s,i)}nf.prototype.isCatmullRomCurve3=!0;class ch extends Nt{constructor(e=new $,t=new $,n=new $,i=new $){super(),this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new $){const n=t,i=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(gs(e,i.x,r.x,a.x,o.x),gs(e,i.y,r.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}ch.prototype.isCubicBezierCurve=!0;class rf extends Nt{constructor(e=new T,t=new T,n=new T,i=new T){super(),this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new T){const n=t,i=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(gs(e,i.x,r.x,a.x,o.x),gs(e,i.y,r.y,a.y,o.y),gs(e,i.z,r.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}rf.prototype.isCubicBezierCurve3=!0;class uo extends Nt{constructor(e=new $,t=new $){super(),this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new $){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t){const n=t||new $;return n.copy(this.v2).sub(this.v1).normalize(),n}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}uo.prototype.isLineCurve=!0;class hh extends Nt{constructor(e=new $,t=new $,n=new $){super(),this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new $){const n=t,i=this.v0,r=this.v1,a=this.v2;return n.set(fs(e,i.x,r.x,a.x),fs(e,i.y,r.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}hh.prototype.isQuadraticBezierCurve=!0;class sf extends Nt{constructor(e=new T,t=new T,n=new T){super(),this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new T){const n=t,i=this.v0,r=this.v1,a=this.v2;return n.set(fs(e,i.x,r.x,a.x),fs(e,i.y,r.y,a.y),fs(e,i.z,r.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}sf.prototype.isQuadraticBezierCurve3=!0;class uh extends Nt{constructor(e=[]){super(),this.type="SplineCurve",this.points=e}getPoint(e,t=new $){const n=t,i=this.points,r=(i.length-1)*e,a=Math.floor(r),o=r-a,l=i[a===0?a:a-1],c=i[a],h=i[a>i.length-2?i.length-1:a+1],u=i[a>i.length-3?i.length-1:a+2];return n.set(Iu(o,l.x,c.x,h.x,u.x),Iu(o,l.y,c.y,h.y,u.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(i.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const i=this.points[t];e.points.push(i.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(new $().fromArray(i))}return this}}uh.prototype.isSplineCurve=!0;var af=Object.freeze({__proto__:null,ArcCurve:tf,CatmullRomCurve3:nf,CubicBezierCurve:ch,CubicBezierCurve3:rf,EllipseCurve:ho,LineCurve:uo,LineCurve3:class extends Nt{constructor(s=new T,e=new T){super(),this.type="LineCurve3",this.isLineCurve3=!0,this.v1=s,this.v2=e}getPoint(s,e=new T){const t=e;return s===1?t.copy(this.v2):(t.copy(this.v2).sub(this.v1),t.multiplyScalar(s).add(this.v1)),t}getPointAt(s,e){return this.getPoint(s,e)}copy(s){return super.copy(s),this.v1.copy(s.v1),this.v2.copy(s.v2),this}toJSON(){const s=super.toJSON();return s.v1=this.v1.toArray(),s.v2=this.v2.toArray(),s}fromJSON(s){return super.fromJSON(s),this.v1.fromArray(s.v1),this.v2.fromArray(s.v2),this}},QuadraticBezierCurve:hh,QuadraticBezierCurve3:sf,SplineCurve:uh});class Fv extends Nt{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){const e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);e.equals(t)||this.curves.push(new uo(t,e))}getPoint(e,t){const n=e*this.getLength(),i=this.getCurveLengths();let r=0;for(;r<i.length;){if(i[r]>=n){const a=i[r]-n,o=this.curves[r],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,t)}r++}return null}getLength(){const e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const e=[];let t=0;for(let n=0,i=this.curves.length;n<i;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){const t=[];let n;for(let i=0,r=this.curves;i<r.length;i++){const a=r[i],o=a&&a.isEllipseCurve?2*e:a&&(a.isLineCurve||a.isLineCurve3)?1:a&&a.isSplineCurve?e*a.points.length:e,l=a.getPoints(o);for(let c=0;c<l.length;c++){const h=l[c];n&&n.equals(h)||(t.push(h),n=h)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const i=e.curves[t];this.curves.push(i.clone())}return this.autoClose=e.autoClose,this}toJSON(){const e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){const i=this.curves[t];e.curves.push(i.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const i=e.curves[t];this.curves.push(new af[i.type]().fromJSON(i))}return this}}class Rc extends Fv{constructor(e){super(),this.type="Path",this.currentPoint=new $,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){const n=new uo(this.currentPoint.clone(),new $(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,i){const r=new hh(this.currentPoint.clone(),new $(e,t),new $(n,i));return this.curves.push(r),this.currentPoint.set(n,i),this}bezierCurveTo(e,t,n,i,r,a){const o=new ch(this.currentPoint.clone(),new $(e,t),new $(n,i),new $(r,a));return this.curves.push(o),this.currentPoint.set(r,a),this}splineThru(e){const t=[this.currentPoint.clone()].concat(e),n=new uh(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,i,r,a){const o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+o,t+l,n,i,r,a),this}absarc(e,t,n,i,r,a){return this.absellipse(e,t,n,n,i,r,a),this}ellipse(e,t,n,i,r,a,o,l){const c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(e+c,t+h,n,i,r,a,o,l),this}absellipse(e,t,n,i,r,a,o,l){const c=new ho(e,t,n,i,r,a,o,l);if(this.curves.length>0){const u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);const h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){const e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}}class vs extends Rc{constructor(e){super(e),this.uuid=Dt(),this.type="Shape",this.holes=[]}getPointsHoles(e){const t=[];for(let n=0,i=this.holes.length;n<i;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){const i=e.holes[t];this.holes.push(i.clone())}return this}toJSON(){const e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){const i=this.holes[t];e.holes.push(i.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){const i=e.holes[t];this.holes.push(new Rc().fromJSON(i))}return this}}const Ov=function(s,e,t=2){const n=e&&e.length,i=n?e[0]*t:s.length;let r=Du(s,0,i,t,!0);const a=[];if(!r||r.next===r.prev)return a;let o,l,c,h,u,d,p;if(n&&(r=function(m,f,g,x){const v=[];let y,b,w,S,M;for(y=0,b=f.length;y<b;y++)w=f[y]*x,S=y<b-1?f[y+1]*x:m.length,M=Du(m,w,S,x,!1),M===M.next&&(M.steiner=!0),v.push(Wv(M));for(v.sort(Hv),y=0;y<v.length;y++)Vv(v[y],g),g=Kn(g,g.next);return g}(s,e,r,t)),s.length>80*t){o=c=s[0],l=h=s[1];for(let m=t;m<i;m+=t)u=s[m],d=s[m+1],u<o&&(o=u),d<l&&(l=d),u>c&&(c=u),d>h&&(h=d);p=Math.max(c-o,h-l),p=p!==0?1/p:0}return Ts(r,a,t,o,l,p),a};function Du(s,e,t,n,i){let r,a;if(i===function(o,l,c,h){let u=0;for(let d=l,p=c-h;d<c;d+=h)u+=(o[p]-o[d])*(o[d+1]+o[p+1]),p=d;return u}(s,e,t,n)>0)for(r=e;r<t;r+=n)a=Nu(r,s[r],s[r+1],a);else for(r=t-n;r>=e;r-=n)a=Nu(r,s[r],s[r+1],a);return a&&po(a,a.next)&&(As(a),a=a.next),a}function Kn(s,e){if(!s)return s;e||(e=s);let t,n=s;do if(t=!1,n.steiner||!po(n,n.next)&&je(n.prev,n,n.next)!==0)n=n.next;else{if(As(n),n=e=n.prev,n===n.next)break;t=!0}while(t||n!==e);return e}function Ts(s,e,t,n,i,r,a){if(!s)return;!a&&r&&function(h,u,d,p){let m=h;do m.z===null&&(m.z=Lc(m.x,m.y,u,d,p)),m.prevZ=m.prev,m.nextZ=m.next,m=m.next;while(m!==h);m.prevZ.nextZ=null,m.prevZ=null,function(f){let g,x,v,y,b,w,S,M,L=1;do{for(x=f,f=null,b=null,w=0;x;){for(w++,v=x,S=0,g=0;g<L&&(S++,v=v.nextZ,v);g++);for(M=L;S>0||M>0&&v;)S!==0&&(M===0||!v||x.z<=v.z)?(y=x,x=x.nextZ,S--):(y=v,v=v.nextZ,M--),b?b.nextZ=y:f=y,y.prevZ=b,b=y;x=v}b.nextZ=null,L*=2}while(w>1)}(m)}(s,n,i,r);let o,l,c=s;for(;s.prev!==s.next;)if(o=s.prev,l=s.next,r?kv(s,n,i,r):Uv(s))e.push(o.i/t),e.push(s.i/t),e.push(l.i/t),As(s),s=l.next,c=l.next;else if((s=l)===c){a?a===1?Ts(s=zv(Kn(s),e,t),e,t,n,i,r,2):a===2&&Bv(s,e,t,n,i,r):Ts(Kn(s),e,t,n,i,r,1);break}}function Uv(s){const e=s.prev,t=s,n=s.next;if(je(e,t,n)>=0)return!1;let i=s.next.next;for(;i!==s.prev;){if(ar(e.x,e.y,t.x,t.y,n.x,n.y,i.x,i.y)&&je(i.prev,i,i.next)>=0)return!1;i=i.next}return!0}function kv(s,e,t,n){const i=s.prev,r=s,a=s.next;if(je(i,r,a)>=0)return!1;const o=i.x<r.x?i.x<a.x?i.x:a.x:r.x<a.x?r.x:a.x,l=i.y<r.y?i.y<a.y?i.y:a.y:r.y<a.y?r.y:a.y,c=i.x>r.x?i.x>a.x?i.x:a.x:r.x>a.x?r.x:a.x,h=i.y>r.y?i.y>a.y?i.y:a.y:r.y>a.y?r.y:a.y,u=Lc(o,l,e,t,n),d=Lc(c,h,e,t,n);let p=s.prevZ,m=s.nextZ;for(;p&&p.z>=u&&m&&m.z<=d;){if(p!==s.prev&&p!==s.next&&ar(i.x,i.y,r.x,r.y,a.x,a.y,p.x,p.y)&&je(p.prev,p,p.next)>=0||(p=p.prevZ,m!==s.prev&&m!==s.next&&ar(i.x,i.y,r.x,r.y,a.x,a.y,m.x,m.y)&&je(m.prev,m,m.next)>=0))return!1;m=m.nextZ}for(;p&&p.z>=u;){if(p!==s.prev&&p!==s.next&&ar(i.x,i.y,r.x,r.y,a.x,a.y,p.x,p.y)&&je(p.prev,p,p.next)>=0)return!1;p=p.prevZ}for(;m&&m.z<=d;){if(m!==s.prev&&m!==s.next&&ar(i.x,i.y,r.x,r.y,a.x,a.y,m.x,m.y)&&je(m.prev,m,m.next)>=0)return!1;m=m.nextZ}return!0}function zv(s,e,t){let n=s;do{const i=n.prev,r=n.next.next;!po(i,r)&&of(i,n,n.next,r)&&Es(i,r)&&Es(r,i)&&(e.push(i.i/t),e.push(n.i/t),e.push(r.i/t),As(n),As(n.next),n=s=r),n=n.next}while(n!==s);return Kn(n)}function Bv(s,e,t,n,i,r){let a=s;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&jv(a,o)){let l=lf(a,o);return a=Kn(a,a.next),l=Kn(l,l.next),Ts(a,e,t,n,i,r),void Ts(l,e,t,n,i,r)}o=o.next}a=a.next}while(a!==s)}function Hv(s,e){return s.x-e.x}function Vv(s,e){if(e=function(t,n){let i=n;const r=t.x,a=t.y;let o,l=-1/0;do{if(a<=i.y&&a>=i.next.y&&i.next.y!==i.y){const m=i.x+(a-i.y)*(i.next.x-i.x)/(i.next.y-i.y);if(m<=r&&m>l){if(l=m,m===r){if(a===i.y)return i;if(a===i.next.y)return i.next}o=i.x<i.next.x?i:i.next}}i=i.next}while(i!==n);if(!o)return null;if(r===l)return o;const c=o,h=o.x,u=o.y;let d,p=1/0;i=o;do r>=i.x&&i.x>=h&&r!==i.x&&ar(a<u?r:l,a,h,u,a<u?l:r,a,i.x,i.y)&&(d=Math.abs(a-i.y)/(r-i.x),Es(i,t)&&(d<p||d===p&&(i.x>o.x||i.x===o.x&&Gv(o,i)))&&(o=i,p=d)),i=i.next;while(i!==c);return o}(s,e),e){const t=lf(e,s);Kn(e,e.next),Kn(t,t.next)}}function Gv(s,e){return je(s.prev,s,e.prev)<0&&je(e.next,s,s.next)<0}function Lc(s,e,t,n,i){return(s=1431655765&((s=858993459&((s=252645135&((s=16711935&((s=32767*(s-t)*i)|s<<8))|s<<4))|s<<2))|s<<1))|(e=1431655765&((e=858993459&((e=252645135&((e=16711935&((e=32767*(e-n)*i)|e<<8))|e<<4))|e<<2))|e<<1))<<1}function Wv(s){let e=s,t=s;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==s);return t}function ar(s,e,t,n,i,r,a,o){return(i-a)*(e-o)-(s-a)*(r-o)>=0&&(s-a)*(n-o)-(t-a)*(e-o)>=0&&(t-a)*(r-o)-(i-a)*(n-o)>=0}function jv(s,e){return s.next.i!==e.i&&s.prev.i!==e.i&&!function(t,n){let i=t;do{if(i.i!==t.i&&i.next.i!==t.i&&i.i!==n.i&&i.next.i!==n.i&&of(i,i.next,t,n))return!0;i=i.next}while(i!==t);return!1}(s,e)&&(Es(s,e)&&Es(e,s)&&function(t,n){let i=t,r=!1;const a=(t.x+n.x)/2,o=(t.y+n.y)/2;do i.y>o!=i.next.y>o&&i.next.y!==i.y&&a<(i.next.x-i.x)*(o-i.y)/(i.next.y-i.y)+i.x&&(r=!r),i=i.next;while(i!==t);return r}(s,e)&&(je(s.prev,s,e.prev)||je(s,e.prev,e))||po(s,e)&&je(s.prev,s,s.next)>0&&je(e.prev,e,e.next)>0)}function je(s,e,t){return(e.y-s.y)*(t.x-e.x)-(e.x-s.x)*(t.y-e.y)}function po(s,e){return s.x===e.x&&s.y===e.y}function of(s,e,t,n){const i=fa(je(s,e,t)),r=fa(je(s,e,n)),a=fa(je(t,n,s)),o=fa(je(t,n,e));return i!==r&&a!==o||!(i!==0||!ma(s,t,e))||!(r!==0||!ma(s,n,e))||!(a!==0||!ma(t,s,n))||!(o!==0||!ma(t,e,n))}function ma(s,e,t){return e.x<=Math.max(s.x,t.x)&&e.x>=Math.min(s.x,t.x)&&e.y<=Math.max(s.y,t.y)&&e.y>=Math.min(s.y,t.y)}function fa(s){return s>0?1:s<0?-1:0}function Es(s,e){return je(s.prev,s,s.next)<0?je(s,e,s.next)>=0&&je(s,s.prev,e)>=0:je(s,e,s.prev)<0||je(s,s.next,e)<0}function lf(s,e){const t=new Cc(s.i,s.x,s.y),n=new Cc(e.i,e.x,e.y),i=s.next,r=e.prev;return s.next=e,e.prev=s,t.next=i,i.prev=t,n.next=t,t.prev=n,r.next=n,n.prev=r,n}function Nu(s,e,t,n){const i=new Cc(s,e,t);return n?(i.next=n.next,i.prev=n,n.next.prev=i,n.next=i):(i.prev=i,i.next=i),i}function As(s){s.next.prev=s.prev,s.prev.next=s.next,s.prevZ&&(s.prevZ.nextZ=s.nextZ),s.nextZ&&(s.nextZ.prevZ=s.prevZ)}function Cc(s,e,t){this.i=s,this.x=e,this.y=t,this.prev=null,this.next=null,this.z=null,this.prevZ=null,this.nextZ=null,this.steiner=!1}class Jn{static area(e){const t=e.length;let n=0;for(let i=t-1,r=0;r<t;i=r++)n+=e[i].x*e[r].y-e[r].x*e[i].y;return .5*n}static isClockWise(e){return Jn.area(e)<0}static triangulateShape(e,t){const n=[],i=[],r=[];Fu(e),Ou(n,e);let a=e.length;t.forEach(Fu);for(let l=0;l<t.length;l++)i.push(a),a+=t[l].length,Ou(n,t[l]);const o=Ov(n,i);for(let l=0;l<o.length;l+=3)r.push(o.slice(l,l+3));return r}}function Fu(s){const e=s.length;e>2&&s[e-1].equals(s[0])&&s.pop()}function Ou(s,e){for(let t=0;t<e.length;t++)s.push(e[t].x),s.push(e[t].y)}class or extends Oe{constructor(e=new vs([new $(.5,.5),new $(-.5,.5),new $(-.5,-.5),new $(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];const n=this,i=[],r=[];for(let o=0,l=e.length;o<l;o++)a(e[o]);function a(o){const l=[],c=t.curveSegments!==void 0?t.curveSegments:12,h=t.steps!==void 0?t.steps:1;let u=t.depth!==void 0?t.depth:1,d=t.bevelEnabled===void 0||t.bevelEnabled,p=t.bevelThickness!==void 0?t.bevelThickness:.2,m=t.bevelSize!==void 0?t.bevelSize:p-.1,f=t.bevelOffset!==void 0?t.bevelOffset:0,g=t.bevelSegments!==void 0?t.bevelSegments:3;const x=t.extrudePath,v=t.UVGenerator!==void 0?t.UVGenerator:qv;t.amount!==void 0&&(console.warn("THREE.ExtrudeBufferGeometry: amount has been renamed to depth."),u=t.amount);let y,b,w,S,M,L=!1;x&&(y=x.getSpacedPoints(h),L=!0,d=!1,b=x.computeFrenetFrames(h,!1),w=new T,S=new T,M=new T),d||(g=0,p=0,m=0,f=0);const I=o.extractPoints(c);let P=I.shape;const N=I.holes;if(!Jn.isClockWise(P)){P=P.reverse();for(let _=0,C=N.length;_<C;_++){const D=N[_];Jn.isClockWise(D)&&(N[_]=D.reverse())}}const W=Jn.triangulateShape(P,N),G=P;for(let _=0,C=N.length;_<C;_++){const D=N[_];P=P.concat(D)}function U(_,C,D){return C||console.error("THREE.ExtrudeGeometry: vec does not exist"),C.clone().multiplyScalar(D).add(_)}const j=P.length,ne=W.length;function ie(_,C,D){let k,z,J;const K=_.x-C.x,re=_.y-C.y,de=D.x-_.x,ue=D.y-_.y,fe=K*K+re*re,Le=K*ue-re*de;if(Math.abs(Le)>Number.EPSILON){const We=Math.sqrt(fe),pe=Math.sqrt(de*de+ue*ue),Ee=C.x-re/We,De=C.y+K/We,yr=((D.x-ue/pe-Ee)*ue-(D.y+de/pe-De)*de)/(K*ue-re*de);k=Ee+K*yr-_.x,z=De+re*yr-_.y;const xr=k*k+z*z;if(xr<=2)return new $(k,z);J=Math.sqrt(xr/2)}else{let We=!1;K>Number.EPSILON?de>Number.EPSILON&&(We=!0):K<-Number.EPSILON?de<-Number.EPSILON&&(We=!0):Math.sign(re)===Math.sign(ue)&&(We=!0),We?(k=-re,z=K,J=Math.sqrt(fe)):(k=K,z=re,J=Math.sqrt(fe/2))}return new $(k/J,z/J)}const B=[];for(let _=0,C=G.length,D=C-1,k=_+1;_<C;_++,D++,k++)D===C&&(D=0),k===C&&(k=0),B[_]=ie(G[_],G[D],G[k]);const X=[];let Z,te=B.concat();for(let _=0,C=N.length;_<C;_++){const D=N[_];Z=[];for(let k=0,z=D.length,J=z-1,K=k+1;k<z;k++,J++,K++)J===z&&(J=0),K===z&&(K=0),Z[k]=ie(D[k],D[J],D[K]);X.push(Z),te=te.concat(Z)}for(let _=0;_<g;_++){const C=_/g,D=p*Math.cos(C*Math.PI/2),k=m*Math.sin(C*Math.PI/2)+f;for(let z=0,J=G.length;z<J;z++){const K=U(G[z],B[z],k);R(K.x,K.y,-D)}for(let z=0,J=N.length;z<J;z++){const K=N[z];Z=X[z];for(let re=0,de=K.length;re<de;re++){const ue=U(K[re],Z[re],k);R(ue.x,ue.y,-D)}}}const ee=m+f;for(let _=0;_<j;_++){const C=d?U(P[_],te[_],ee):P[_];L?(S.copy(b.normals[0]).multiplyScalar(C.x),w.copy(b.binormals[0]).multiplyScalar(C.y),M.copy(y[0]).add(S).add(w),R(M.x,M.y,M.z)):R(C.x,C.y,0)}for(let _=1;_<=h;_++)for(let C=0;C<j;C++){const D=d?U(P[C],te[C],ee):P[C];L?(S.copy(b.normals[_]).multiplyScalar(D.x),w.copy(b.binormals[_]).multiplyScalar(D.y),M.copy(y[_]).add(S).add(w),R(M.x,M.y,M.z)):R(D.x,D.y,u/h*_)}for(let _=g-1;_>=0;_--){const C=_/g,D=p*Math.cos(C*Math.PI/2),k=m*Math.sin(C*Math.PI/2)+f;for(let z=0,J=G.length;z<J;z++){const K=U(G[z],B[z],k);R(K.x,K.y,u+D)}for(let z=0,J=N.length;z<J;z++){const K=N[z];Z=X[z];for(let re=0,de=K.length;re<de;re++){const ue=U(K[re],Z[re],k);L?R(ue.x,ue.y+y[h-1].y,y[h-1].x+D):R(ue.x,ue.y,u+D)}}}function ce(_,C){let D=_.length;for(;--D>=0;){const k=D;let z=D-1;z<0&&(z=_.length-1);for(let J=0,K=h+2*g;J<K;J++){const re=j*J,de=j*(J+1);F(C+k+re,C+z+re,C+z+de,C+k+de)}}}function R(_,C,D){l.push(_),l.push(C),l.push(D)}function E(_,C,D){V(_),V(C),V(D);const k=i.length/3,z=v.generateTopUV(n,i,k-3,k-2,k-1);O(z[0]),O(z[1]),O(z[2])}function F(_,C,D,k){V(_),V(C),V(k),V(C),V(D),V(k);const z=i.length/3,J=v.generateSideWallUV(n,i,z-6,z-3,z-2,z-1);O(J[0]),O(J[1]),O(J[3]),O(J[1]),O(J[2]),O(J[3])}function V(_){i.push(l[3*_+0]),i.push(l[3*_+1]),i.push(l[3*_+2])}function O(_){r.push(_.x),r.push(_.y)}(function(){const _=i.length/3;if(d){let C=0,D=j*C;for(let k=0;k<ne;k++){const z=W[k];E(z[2]+D,z[1]+D,z[0]+D)}C=h+2*g,D=j*C;for(let k=0;k<ne;k++){const z=W[k];E(z[0]+D,z[1]+D,z[2]+D)}}else{for(let C=0;C<ne;C++){const D=W[C];E(D[2],D[1],D[0])}for(let C=0;C<ne;C++){const D=W[C];E(D[0]+j*h,D[1]+j*h,D[2]+j*h)}}n.addGroup(_,i.length/3-_,0)})(),function(){const _=i.length/3;let C=0;ce(G,C),C+=G.length;for(let D=0,k=N.length;D<k;D++){const z=N[D];ce(z,C),C+=z.length}n.addGroup(_,i.length/3-_,1)}()}this.setAttribute("position",new Ke(i,3)),this.setAttribute("uv",new Ke(r,2)),this.computeVertexNormals()}toJSON(){const e=super.toJSON();return function(t,n,i){if(i.shapes=[],Array.isArray(t))for(let r=0,a=t.length;r<a;r++){const o=t[r];i.shapes.push(o.uuid)}else i.shapes.push(t.uuid);return n.extrudePath!==void 0&&(i.options.extrudePath=n.extrudePath.toJSON()),i}(this.parameters.shapes,this.parameters.options,e)}static fromJSON(e,t){const n=[];for(let r=0,a=e.shapes.length;r<a;r++){const o=t[e.shapes[r]];n.push(o)}const i=e.options.extrudePath;return i!==void 0&&(e.options.extrudePath=new af[i.type]().fromJSON(i)),new or(n,e.options)}}const qv={generateTopUV:function(s,e,t,n,i){const r=e[3*t],a=e[3*t+1],o=e[3*n],l=e[3*n+1],c=e[3*i],h=e[3*i+1];return[new $(r,a),new $(o,l),new $(c,h)]},generateSideWallUV:function(s,e,t,n,i,r){const a=e[3*t],o=e[3*t+1],l=e[3*t+2],c=e[3*n],h=e[3*n+1],u=e[3*n+2],d=e[3*i],p=e[3*i+1],m=e[3*i+2],f=e[3*r],g=e[3*r+1],x=e[3*r+2];return Math.abs(o-h)<Math.abs(a-c)?[new $(a,1-l),new $(c,1-u),new $(d,1-m),new $(f,1-x)]:[new $(o,1-l),new $(h,1-u),new $(p,1-m),new $(g,1-x)]}};class dh extends Oe{constructor(e=new vs([new $(0,.5),new $(-.5,-.5),new $(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};const n=[],i=[],r=[],a=[];let o=0,l=0;if(Array.isArray(e)===!1)c(e);else for(let h=0;h<e.length;h++)c(e[h]),this.addGroup(o,l,h),o+=l,l=0;function c(h){const u=i.length/3,d=h.extractPoints(t);let p=d.shape;const m=d.holes;Jn.isClockWise(p)===!1&&(p=p.reverse());for(let g=0,x=m.length;g<x;g++){const v=m[g];Jn.isClockWise(v)===!0&&(m[g]=v.reverse())}const f=Jn.triangulateShape(p,m);for(let g=0,x=m.length;g<x;g++){const v=m[g];p=p.concat(v)}for(let g=0,x=p.length;g<x;g++){const v=p[g];i.push(v.x,v.y,0),r.push(0,0,1),a.push(v.x,v.y)}for(let g=0,x=f.length;g<x;g++){const v=f[g],y=v[0]+u,b=v[1]+u,w=v[2]+u;n.push(y,b,w),l+=3}}this.setIndex(n),this.setAttribute("position",new Ke(i,3)),this.setAttribute("normal",new Ke(r,3)),this.setAttribute("uv",new Ke(a,2))}toJSON(){const e=super.toJSON();return function(t,n){if(n.shapes=[],Array.isArray(t))for(let i=0,r=t.length;i<r;i++){const a=t[i];n.shapes.push(a.uuid)}else n.shapes.push(t.uuid);return n}(this.parameters.shapes,e)}static fromJSON(e,t){const n=[];for(let i=0,r=e.shapes.length;i<r;i++){const a=t[e.shapes[i]];n.push(a)}return new dh(n,e.curveSegments)}}class cf extends Je{constructor(e){super(),this.type="ShadowMaterial",this.color=new le(0),this.transparent=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this}}cf.prototype.isShadowMaterial=!0;class In extends Je{constructor(e){super(),this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new le(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new le(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new $(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this}}In.prototype.isMeshStandardMaterial=!0;class Ei extends In{constructor(e){super(),this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new $(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return mt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.sheenColor=new le(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=0,this.attenuationColor=new le(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new le(1,1,1),this.specularColorMap=null,this._sheen=0,this._clearcoat=0,this._transmission=0,this.setValues(e)}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.ior=e.ior,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}Ei.prototype.isMeshPhysicalMaterial=!0;(class extends Je{constructor(s){super(),this.type="MeshPhongMaterial",this.color=new le(16777215),this.specular=new le(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new le(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new $(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.setValues(s)}copy(s){return super.copy(s),this.color.copy(s.color),this.specular.copy(s.specular),this.shininess=s.shininess,this.map=s.map,this.lightMap=s.lightMap,this.lightMapIntensity=s.lightMapIntensity,this.aoMap=s.aoMap,this.aoMapIntensity=s.aoMapIntensity,this.emissive.copy(s.emissive),this.emissiveMap=s.emissiveMap,this.emissiveIntensity=s.emissiveIntensity,this.bumpMap=s.bumpMap,this.bumpScale=s.bumpScale,this.normalMap=s.normalMap,this.normalMapType=s.normalMapType,this.normalScale.copy(s.normalScale),this.displacementMap=s.displacementMap,this.displacementScale=s.displacementScale,this.displacementBias=s.displacementBias,this.specularMap=s.specularMap,this.alphaMap=s.alphaMap,this.envMap=s.envMap,this.combine=s.combine,this.reflectivity=s.reflectivity,this.refractionRatio=s.refractionRatio,this.wireframe=s.wireframe,this.wireframeLinewidth=s.wireframeLinewidth,this.wireframeLinecap=s.wireframeLinecap,this.wireframeLinejoin=s.wireframeLinejoin,this.flatShading=s.flatShading,this}}).prototype.isMeshPhongMaterial=!0;(class extends Je{constructor(s){super(),this.defines={TOON:""},this.type="MeshToonMaterial",this.color=new le(16777215),this.map=null,this.gradientMap=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new le(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new $(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.alphaMap=null,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.setValues(s)}copy(s){return super.copy(s),this.color.copy(s.color),this.map=s.map,this.gradientMap=s.gradientMap,this.lightMap=s.lightMap,this.lightMapIntensity=s.lightMapIntensity,this.aoMap=s.aoMap,this.aoMapIntensity=s.aoMapIntensity,this.emissive.copy(s.emissive),this.emissiveMap=s.emissiveMap,this.emissiveIntensity=s.emissiveIntensity,this.bumpMap=s.bumpMap,this.bumpScale=s.bumpScale,this.normalMap=s.normalMap,this.normalMapType=s.normalMapType,this.normalScale.copy(s.normalScale),this.displacementMap=s.displacementMap,this.displacementScale=s.displacementScale,this.displacementBias=s.displacementBias,this.alphaMap=s.alphaMap,this.wireframe=s.wireframe,this.wireframeLinewidth=s.wireframeLinewidth,this.wireframeLinecap=s.wireframeLinecap,this.wireframeLinejoin=s.wireframeLinejoin,this}}).prototype.isMeshToonMaterial=!0;(class extends Je{constructor(s){super(),this.type="MeshNormalMaterial",this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new $(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.flatShading=!1,this.setValues(s)}copy(s){return super.copy(s),this.bumpMap=s.bumpMap,this.bumpScale=s.bumpScale,this.normalMap=s.normalMap,this.normalMapType=s.normalMapType,this.normalScale.copy(s.normalScale),this.displacementMap=s.displacementMap,this.displacementScale=s.displacementScale,this.displacementBias=s.displacementBias,this.wireframe=s.wireframe,this.wireframeLinewidth=s.wireframeLinewidth,this.flatShading=s.flatShading,this}}).prototype.isMeshNormalMaterial=!0;(class extends Je{constructor(s){super(),this.type="MeshLambertMaterial",this.color=new le(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new le(0),this.emissiveIntensity=1,this.emissiveMap=null,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.setValues(s)}copy(s){return super.copy(s),this.color.copy(s.color),this.map=s.map,this.lightMap=s.lightMap,this.lightMapIntensity=s.lightMapIntensity,this.aoMap=s.aoMap,this.aoMapIntensity=s.aoMapIntensity,this.emissive.copy(s.emissive),this.emissiveMap=s.emissiveMap,this.emissiveIntensity=s.emissiveIntensity,this.specularMap=s.specularMap,this.alphaMap=s.alphaMap,this.envMap=s.envMap,this.combine=s.combine,this.reflectivity=s.reflectivity,this.refractionRatio=s.refractionRatio,this.wireframe=s.wireframe,this.wireframeLinewidth=s.wireframeLinewidth,this.wireframeLinecap=s.wireframeLinecap,this.wireframeLinejoin=s.wireframeLinejoin,this}}).prototype.isMeshLambertMaterial=!0;(class extends Je{constructor(s){super(),this.defines={MATCAP:""},this.type="MeshMatcapMaterial",this.color=new le(16777215),this.matcap=null,this.map=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new $(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.alphaMap=null,this.flatShading=!1,this.setValues(s)}copy(s){return super.copy(s),this.defines={MATCAP:""},this.color.copy(s.color),this.matcap=s.matcap,this.map=s.map,this.bumpMap=s.bumpMap,this.bumpScale=s.bumpScale,this.normalMap=s.normalMap,this.normalMapType=s.normalMapType,this.normalScale.copy(s.normalScale),this.displacementMap=s.displacementMap,this.displacementScale=s.displacementScale,this.displacementBias=s.displacementBias,this.alphaMap=s.alphaMap,this.flatShading=s.flatShading,this}}).prototype.isMeshMatcapMaterial=!0;(class extends dr{constructor(s){super(),this.type="LineDashedMaterial",this.scale=1,this.dashSize=3,this.gapSize=1,this.setValues(s)}copy(s){return super.copy(s),this.scale=s.scale,this.dashSize=s.dashSize,this.gapSize=s.gapSize,this}}).prototype.isLineDashedMaterial=!0;const Ve={arraySlice:function(s,e,t){return Ve.isTypedArray(s)?new s.constructor(s.subarray(e,t!==void 0?t:s.length)):s.slice(e,t)},convertArray:function(s,e,t){return!s||!t&&s.constructor===e?s:typeof e.BYTES_PER_ELEMENT=="number"?new e(s):Array.prototype.slice.call(s)},isTypedArray:function(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)},getKeyframeOrder:function(s){const e=s.length,t=new Array(e);for(let n=0;n!==e;++n)t[n]=n;return t.sort(function(n,i){return s[n]-s[i]}),t},sortedArray:function(s,e,t){const n=s.length,i=new s.constructor(n);for(let r=0,a=0;a!==n;++r){const o=t[r]*e;for(let l=0;l!==e;++l)i[a++]=s[o+l]}return i},flattenJSON:function(s,e,t,n){let i=1,r=s[0];for(;r!==void 0&&r[n]===void 0;)r=s[i++];if(r===void 0)return;let a=r[n];if(a!==void 0)if(Array.isArray(a))do a=r[n],a!==void 0&&(e.push(r.time),t.push.apply(t,a)),r=s[i++];while(r!==void 0);else if(a.toArray!==void 0)do a=r[n],a!==void 0&&(e.push(r.time),a.toArray(t,t.length)),r=s[i++];while(r!==void 0);else do a=r[n],a!==void 0&&(e.push(r.time),t.push(a)),r=s[i++];while(r!==void 0)},subclip:function(s,e,t,n,i=30){const r=s.clone();r.name=e;const a=[];for(let l=0;l<r.tracks.length;++l){const c=r.tracks[l],h=c.getValueSize(),u=[],d=[];for(let p=0;p<c.times.length;++p){const m=c.times[p]*i;if(!(m<t||m>=n)){u.push(c.times[p]);for(let f=0;f<h;++f)d.push(c.values[p*h+f])}}u.length!==0&&(c.times=Ve.convertArray(u,c.times.constructor),c.values=Ve.convertArray(d,c.values.constructor),a.push(c))}r.tracks=a;let o=1/0;for(let l=0;l<r.tracks.length;++l)o>r.tracks[l].times[0]&&(o=r.tracks[l].times[0]);for(let l=0;l<r.tracks.length;++l)r.tracks[l].shift(-1*o);return r.resetDuration(),r},makeClipAdditive:function(s,e=0,t=s,n=30){n<=0&&(n=30);const i=t.tracks.length,r=e/n;for(let a=0;a<i;++a){const o=t.tracks[a],l=o.ValueTypeName;if(l==="bool"||l==="string")continue;const c=s.tracks.find(function(x){return x.name===o.name&&x.ValueTypeName===l});if(c===void 0)continue;let h=0;const u=o.getValueSize();o.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline&&(h=u/3);let d=0;const p=c.getValueSize();c.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline&&(d=p/3);const m=o.times.length-1;let f;if(r<=o.times[0]){const x=h,v=u-h;f=Ve.arraySlice(o.values,x,v)}else if(r>=o.times[m]){const x=m*u+h,v=x+u-h;f=Ve.arraySlice(o.values,x,v)}else{const x=o.createInterpolant(),v=h,y=u-h;x.evaluate(r),f=Ve.arraySlice(x.resultBuffer,v,y)}l==="quaternion"&&new vt().fromArray(f).normalize().conjugate().toArray(f);const g=c.times.length;for(let x=0;x<g;++x){const v=x*p+d;if(l==="quaternion")vt.multiplyQuaternionsFlat(c.values,v,f,0,c.values,v);else{const y=p-2*d;for(let b=0;b<y;++b)c.values[v+b]-=f[b]}}}return s.blendMode=2501,s}};class An{constructor(e,t,n,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let n=this._cachedIndex,i=t[n],r=t[n-1];e:{t:{let a;n:{i:if(!(e<i)){for(let o=n+2;;){if(i===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.afterEnd_(n-1,e,r)}if(n===o)break;if(r=i,i=t[++n],e<i)break t}a=t.length;break n}if(e>=r)break e;{const o=t[1];e<o&&(n=2,r=o);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.beforeStart_(0,e,i);if(n===l)break;if(i=r,r=t[--n-1],e>=r)break t}a=n,n=0}}for(;n<a;){const o=n+a>>>1;e<t[o]?a=o:n=o+1}if(i=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.beforeStart_(0,e,i);if(i===void 0)return n=t.length,this._cachedIndex=n,this.afterEnd_(n-1,r,e)}this._cachedIndex=n,this.intervalChanged_(n,r,i)}return this.interpolate_(n,r,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i;for(let a=0;a!==i;++a)t[a]=n[r+a];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}}An.prototype.beforeStart_=An.prototype.copySampleValue_,An.prototype.afterEnd_=An.prototype.copySampleValue_;class Xv extends An{constructor(e,t,n,i){super(e,t,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:2400,endingEnd:2400}}intervalChanged_(e,t,n){const i=this.parameterPositions;let r=e-2,a=e+1,o=i[r],l=i[a];if(o===void 0)switch(this.getSettings_().endingStart){case 2401:r=e,o=2*t-n;break;case 2402:r=i.length-2,o=t+i[r]-i[r+1];break;default:r=e,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case 2401:a=e,l=2*n-t;break;case 2402:a=1,l=n+i[1]-i[0];break;default:a=e-1,l=t}const c=.5*(n-t),h=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(l-n),this._offsetPrev=r*h,this._offsetNext=a*h}interpolate_(e,t,n,i){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,p=this._weightNext,m=(n-t)/(i-t),f=m*m,g=f*m,x=-d*g+2*d*f-d*m,v=(1+d)*g+(-1.5-2*d)*f+(-.5+d)*m+1,y=(-1-p)*g+(1.5+p)*f+.5*m,b=p*g-p*f;for(let w=0;w!==o;++w)r[w]=x*a[h+w]+v*a[c+w]+y*a[l+w]+b*a[u+w];return r}}class hf extends An{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=(n-t)/(i-t),u=1-h;for(let d=0;d!==o;++d)r[d]=a[c+d]*u+a[l+d]*h;return r}}class Yv extends An{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e){return this.copySampleValue_(e-1)}}class rn{constructor(e,t,n,i){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Ve.convertArray(t,this.TimeBufferType),this.values=Ve.convertArray(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Ve.convertArray(e.times,Array),values:Ve.convertArray(e.values,Array)};const i=e.getInterpolation();i!==e.DefaultInterpolation&&(n.interpolation=i)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Yv(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new hf(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Xv(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case 2300:t=this.InterpolantFactoryMethodDiscrete;break;case 2301:t=this.InterpolantFactoryMethodLinear;break;case 2302:t=this.InterpolantFactoryMethodSmooth}if(t===void 0){const n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0){if(e===this.DefaultInterpolation)throw new Error(n);this.setInterpolation(this.DefaultInterpolation)}return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return 2300;case this.InterpolantFactoryMethodLinear:return 2301;case this.InterpolantFactoryMethodSmooth:return 2302}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]*=e}return this}trim(e,t){const n=this.times,i=n.length;let r=0,a=i-1;for(;r!==i&&n[r]<e;)++r;for(;a!==-1&&n[a]>t;)--a;if(++a,r!==0||a!==i){r>=a&&(a=Math.max(a,1),r=a-1);const o=this.getValueSize();this.times=Ve.arraySlice(n,r,a),this.values=Ve.arraySlice(this.values,r*o,a*o)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!=0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);const n=this.times,i=this.values,r=n.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){const l=n[o];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,o,l),e=!1;break}if(a!==null&&a>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,o,l,a),e=!1;break}a=l}if(i!==void 0&&Ve.isTypedArray(i))for(let o=0,l=i.length;o!==l;++o){const c=i[o];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,o,c),e=!1;break}}return e}optimize(){const e=Ve.arraySlice(this.times),t=Ve.arraySlice(this.values),n=this.getValueSize(),i=this.getInterpolation()===2302,r=e.length-1;let a=1;for(let o=1;o<r;++o){let l=!1;const c=e[o];if(c!==e[o+1]&&(o!==1||c!==e[0]))if(i)l=!0;else{const h=o*n,u=h-n,d=h+n;for(let p=0;p!==n;++p){const m=t[h+p];if(m!==t[u+p]||m!==t[d+p]){l=!0;break}}}if(l){if(o!==a){e[a]=e[o];const h=o*n,u=a*n;for(let d=0;d!==n;++d)t[u+d]=t[h+d]}++a}}if(r>0){e[a]=e[r];for(let o=r*n,l=a*n,c=0;c!==n;++c)t[l+c]=t[o+c];++a}return a!==e.length?(this.times=Ve.arraySlice(e,0,a),this.values=Ve.arraySlice(t,0,a*n)):(this.times=e,this.values=t),this}clone(){const e=Ve.arraySlice(this.times,0),t=Ve.arraySlice(this.values,0),n=new this.constructor(this.name,e,t);return n.createInterpolant=this.createInterpolant,n}}rn.prototype.TimeBufferType=Float32Array,rn.prototype.ValueBufferType=Float32Array,rn.prototype.DefaultInterpolation=2301;class er extends rn{}er.prototype.ValueTypeName="bool",er.prototype.ValueBufferType=Array,er.prototype.DefaultInterpolation=2300,er.prototype.InterpolantFactoryMethodLinear=void 0,er.prototype.InterpolantFactoryMethodSmooth=void 0;class uf extends rn{}uf.prototype.ValueTypeName="color";class Rs extends rn{}Rs.prototype.ValueTypeName="number";class Zv extends An{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-t)/(i-t);let c=e*o;for(let h=c+o;c!==h;c+=4)vt.slerpFlat(r,0,a,c-o,a,c,l);return r}}class wi extends rn{InterpolantFactoryMethodLinear(e){return new Zv(this.times,this.values,this.getValueSize(),e)}}wi.prototype.ValueTypeName="quaternion",wi.prototype.DefaultInterpolation=2301,wi.prototype.InterpolantFactoryMethodSmooth=void 0;class tr extends rn{}tr.prototype.ValueTypeName="string",tr.prototype.ValueBufferType=Array,tr.prototype.DefaultInterpolation=2300,tr.prototype.InterpolantFactoryMethodLinear=void 0,tr.prototype.InterpolantFactoryMethodSmooth=void 0;class Ls extends rn{}Ls.prototype.ValueTypeName="vector";class Pc{constructor(e,t=-1,n,i=2500){this.name=e,this.tracks=n,this.duration=t,this.blendMode=i,this.uuid=Dt(),this.duration<0&&this.resetDuration()}static parse(e){const t=[],n=e.tracks,i=1/(e.fps||1);for(let a=0,o=n.length;a!==o;++a)t.push(Jv(n[a]).scale(i));const r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r}static toJSON(e){const t=[],n=e.tracks,i={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode};for(let r=0,a=n.length;r!==a;++r)t.push(rn.toJSON(n[r]));return i}static CreateFromMorphTargetSequence(e,t,n,i){const r=t.length,a=[];for(let o=0;o<r;o++){let l=[],c=[];l.push((o+r-1)%r,o,(o+1)%r),c.push(0,1,0);const h=Ve.getKeyframeOrder(l);l=Ve.sortedArray(l,1,h),c=Ve.sortedArray(c,1,h),i||l[0]!==0||(l.push(r),c.push(c[0])),a.push(new Rs(".morphTargetInfluences["+t[o].name+"]",l,c).scale(1/n))}return new this(e,-1,a)}static findByName(e,t){let n=e;if(!Array.isArray(e)){const i=e;n=i.geometry&&i.geometry.animations||i.animations}for(let i=0;i<n.length;i++)if(n[i].name===t)return n[i];return null}static CreateClipsFromMorphTargetSequences(e,t,n){const i={},r=/^([\w-]*?)([\d]+)$/;for(let o=0,l=e.length;o<l;o++){const c=e[o],h=c.name.match(r);if(h&&h.length>1){const u=h[1];let d=i[u];d||(i[u]=d=[]),d.push(c)}}const a=[];for(const o in i)a.push(this.CreateFromMorphTargetSequence(o,i[o],t,n));return a}static parseAnimation(e,t){if(!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;const n=function(h,u,d,p,m){if(d.length!==0){const f=[],g=[];Ve.flattenJSON(d,f,g,p),f.length!==0&&m.push(new h(u,f,g))}},i=[],r=e.name||"default",a=e.fps||30,o=e.blendMode;let l=e.length||-1;const c=e.hierarchy||[];for(let h=0;h<c.length;h++){const u=c[h].keys;if(u&&u.length!==0)if(u[0].morphTargets){const d={};let p;for(p=0;p<u.length;p++)if(u[p].morphTargets)for(let m=0;m<u[p].morphTargets.length;m++)d[u[p].morphTargets[m]]=-1;for(const m in d){const f=[],g=[];for(let x=0;x!==u[p].morphTargets.length;++x){const v=u[p];f.push(v.time),g.push(v.morphTarget===m?1:0)}i.push(new Rs(".morphTargetInfluence["+m+"]",f,g))}l=d.length*(a||1)}else{const d=".bones["+t[h].name+"]";n(Ls,d+".position",u,"pos",i),n(wi,d+".quaternion",u,"rot",i),n(Ls,d+".scale",u,"scl",i)}}return i.length===0?null:new this(r,l,i,o)}resetDuration(){let e=0;for(let t=0,n=this.tracks.length;t!==n;++t){const i=this.tracks[t];e=Math.max(e,i.times[i.times.length-1])}return this.duration=e,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let t=0;t<this.tracks.length;t++)e.push(this.tracks[t].clone());return new this.constructor(this.name,this.duration,e,this.blendMode)}toJSON(){return this.constructor.toJSON(this)}}function Jv(s){if(s.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=function(t){switch(t.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Rs;case"vector":case"vector2":case"vector3":case"vector4":return Ls;case"color":return uf;case"quaternion":return wi;case"bool":case"boolean":return er;case"string":return tr}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+t)}(s.type);if(s.times===void 0){const t=[],n=[];Ve.flattenJSON(s.keys,t,n,"value"),s.times=t,s.values=n}return e.parse!==void 0?e.parse(s):new e(s.name,s.times,s.values,s.interpolation)}const pr={enabled:!1,files:{},add:function(s,e){this.enabled!==!1&&(this.files[s]=e)},get:function(s){if(this.enabled!==!1)return this.files[s]},remove:function(s){delete this.files[s]},clear:function(){this.files={}}},$v=new class{constructor(s,e,t){const n=this;let i,r=!1,a=0,o=0;const l=[];this.onStart=void 0,this.onLoad=s,this.onProgress=e,this.onError=t,this.itemStart=function(c){o++,r===!1&&n.onStart!==void 0&&n.onStart(c,a,o),r=!0},this.itemEnd=function(c){a++,n.onProgress!==void 0&&n.onProgress(c,a,o),a===o&&(r=!1,n.onLoad!==void 0&&n.onLoad())},this.itemError=function(c){n.onError!==void 0&&n.onError(c)},this.resolveURL=function(c){return i?i(c):c},this.setURLModifier=function(c){return i=c,this},this.addHandler=function(c,h){return l.push(c,h),this},this.removeHandler=function(c){const h=l.indexOf(c);return h!==-1&&l.splice(h,2),this},this.getHandler=function(c){for(let h=0,u=l.length;h<u;h+=2){const d=l[h],p=l[h+1];if(d.global&&(d.lastIndex=0),d.test(c))return p}return null}}};class Ft{constructor(e){this.manager=e!==void 0?e:$v,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){const n=this;return new Promise(function(i,r){n.load(e,i,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}}const mn={};class Ln extends Ft{constructor(e){super(e)}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=pr.get(e);if(r!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0),r;if(mn[e]!==void 0)return void mn[e].push({onLoad:t,onProgress:n,onError:i});mn[e]=[],mn[e].push({onLoad:t,onProgress:n,onError:i});const a=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin"});fetch(a).then(o=>{if(o.status===200||o.status===0){if(o.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||o.body.getReader===void 0)return o;const l=mn[e],c=o.body.getReader(),h=o.headers.get("Content-Length"),u=h?parseInt(h):0,d=u!==0;let p=0;const m=new ReadableStream({start(f){(function g(){c.read().then(({done:x,value:v})=>{if(x)f.close();else{p+=v.byteLength;const y=new ProgressEvent("progress",{lengthComputable:d,loaded:p,total:u});for(let b=0,w=l.length;b<w;b++){const S=l[b];S.onProgress&&S.onProgress(y)}f.enqueue(v),g()}})})()}});return new Response(m)}throw Error(`fetch for "${o.url}" responded with ${o.status}: ${o.statusText}`)}).then(o=>{switch(this.responseType){case"arraybuffer":return o.arrayBuffer();case"blob":return o.blob();case"document":return o.text().then(l=>new DOMParser().parseFromString(l,this.mimeType));case"json":return o.json();default:return o.text()}}).then(o=>{pr.add(e,o);const l=mn[e];delete mn[e];for(let c=0,h=l.length;c<h;c++){const u=l[c];u.onLoad&&u.onLoad(o)}}).catch(o=>{const l=mn[e];if(l===void 0)throw this.manager.itemError(e),o;delete mn[e];for(let c=0,h=l.length;c<h;c++){const u=l[c];u.onError&&u.onError(o)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}}class ph extends Ft{constructor(e){super(e)}load(e,t,n,i){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,a=pr.get(e);if(a!==void 0)return r.manager.itemStart(e),setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0),a;const o=io("img");function l(){h(),pr.add(e,this),t&&t(this),r.manager.itemEnd(e)}function c(u){h(),i&&i(u),r.manager.itemError(e),r.manager.itemEnd(e)}function h(){o.removeEventListener("load",l,!1),o.removeEventListener("error",c,!1)}return o.addEventListener("load",l,!1),o.addEventListener("error",c,!1),e.substr(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),r.manager.itemStart(e),o.src=e,o}}class Kv extends Ft{constructor(e){super(e)}load(e,t,n,i){const r=new ro,a=new ph(this.manager);a.setCrossOrigin(this.crossOrigin),a.setPath(this.path);let o=0;function l(c){a.load(e[c],function(h){r.images[c]=h,o++,o===6&&(r.needsUpdate=!0,t&&t(r))},void 0,i)}for(let c=0;c<e.length;++c)l(c);return r}}class Qv extends Ft{constructor(e){super(e)}load(e,t,n,i){const r=this,a=new sh,o=new Ln(this.manager);return o.setResponseType("arraybuffer"),o.setRequestHeader(this.requestHeader),o.setPath(this.path),o.setWithCredentials(r.withCredentials),o.load(e,function(l){const c=r.parse(l);c&&(c.image!==void 0?a.image=c.image:c.data!==void 0&&(a.image.width=c.width,a.image.height=c.height,a.image.data=c.data),a.wrapS=c.wrapS!==void 0?c.wrapS:1001,a.wrapT=c.wrapT!==void 0?c.wrapT:1001,a.magFilter=c.magFilter!==void 0?c.magFilter:1006,a.minFilter=c.minFilter!==void 0?c.minFilter:1006,a.anisotropy=c.anisotropy!==void 0?c.anisotropy:1,c.encoding!==void 0&&(a.encoding=c.encoding),c.flipY!==void 0&&(a.flipY=c.flipY),c.format!==void 0&&(a.format=c.format),c.type!==void 0&&(a.type=c.type),c.mipmaps!==void 0&&(a.mipmaps=c.mipmaps,a.minFilter=1008),c.mipmapCount===1&&(a.minFilter=1006),c.generateMipmaps!==void 0&&(a.generateMipmaps=c.generateMipmaps),a.needsUpdate=!0,t&&t(a,c))},n,i),a}}class mo extends Ft{constructor(e){super(e)}load(e,t,n,i){const r=new qe,a=new ph(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){r.image=o,r.needsUpdate=!0,t!==void 0&&t(r)},n,i),r}}class on extends Re{constructor(e,t=1){super(),this.type="Light",this.color=new le(e),this.intensity=t}dispose(){}copy(e){return super.copy(e),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),t}}on.prototype.isLight=!0;(class extends on{constructor(s,e,t){super(s,t),this.type="HemisphereLight",this.position.copy(Re.DefaultUp),this.updateMatrix(),this.groundColor=new le(e)}copy(s){return on.prototype.copy.call(this,s),this.groundColor.copy(s.groundColor),this}}).prototype.isHemisphereLight=!0;const Uu=new he,ku=new T,zu=new T;class mh{constructor(e){this.camera=e,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new $(512,512),this.map=null,this.mapPass=null,this.matrix=new he,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new ao,this._frameExtents=new $(1,1),this._viewportCount=1,this._viewports=[new Ue(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;ku.setFromMatrixPosition(e.matrixWorld),t.position.copy(ku),zu.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(zu),t.updateMatrixWorld(),Uu.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Uu),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(t.projectionMatrix),n.multiply(t.matrixWorldInverse)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),this.mapSize.x===512&&this.mapSize.y===512||(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class df extends mh{constructor(){super(new nt(50,1,.5,500)),this.focus=1}updateMatrices(e){const t=this.camera,n=2*Ms*e.angle*this.focus,i=this.mapSize.width/this.mapSize.height,r=e.distance||t.far;n===t.fov&&i===t.aspect&&r===t.far||(t.fov=n,t.aspect=i,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}df.prototype.isSpotLightShadow=!0;class pf extends on{constructor(e,t,n=0,i=Math.PI/3,r=0,a=1){super(e,t),this.type="SpotLight",this.position.copy(Re.DefaultUp),this.updateMatrix(),this.target=new Re,this.distance=n,this.angle=i,this.penumbra=r,this.decay=a,this.shadow=new df}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}pf.prototype.isSpotLight=!0;const Bu=new he,Fr=new T,nl=new T;class mf extends mh{constructor(){super(new nt(90,1,.5,500)),this._frameExtents=new $(4,2),this._viewportCount=6,this._viewports=[new Ue(2,1,1,1),new Ue(0,1,1,1),new Ue(3,1,1,1),new Ue(1,1,1,1),new Ue(3,0,1,1),new Ue(1,0,1,1)],this._cubeDirections=[new T(1,0,0),new T(-1,0,0),new T(0,0,1),new T(0,0,-1),new T(0,1,0),new T(0,-1,0)],this._cubeUps=[new T(0,1,0),new T(0,1,0),new T(0,1,0),new T(0,1,0),new T(0,0,1),new T(0,0,-1)]}updateMatrices(e,t=0){const n=this.camera,i=this.matrix,r=e.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),Fr.setFromMatrixPosition(e.matrixWorld),n.position.copy(Fr),nl.copy(n.position),nl.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(nl),n.updateMatrixWorld(),i.makeTranslation(-Fr.x,-Fr.y,-Fr.z),Bu.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Bu)}}mf.prototype.isPointLightShadow=!0;class fo extends on{constructor(e,t,n=0,i=1){super(e,t),this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new mf}get power(){return 4*this.intensity*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}fo.prototype.isPointLight=!0;class ff extends mh{constructor(){super(new fr(-5,5,5,-5,.5,500))}}ff.prototype.isDirectionalLightShadow=!0;class go extends on{constructor(e,t){super(e,t),this.type="DirectionalLight",this.position.copy(Re.DefaultUp),this.updateMatrix(),this.target=new Re,this.shadow=new ff}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}go.prototype.isDirectionalLight=!0;(class extends on{constructor(s,e){super(s,e),this.type="AmbientLight"}}).prototype.isAmbientLight=!0;(class extends on{constructor(s,e,t=10,n=10){super(s,e),this.type="RectAreaLight",this.width=t,this.height=n}get power(){return this.intensity*this.width*this.height*Math.PI}set power(s){this.intensity=s/(this.width*this.height*Math.PI)}copy(s){return super.copy(s),this.width=s.width,this.height=s.height,this}toJSON(s){const e=super.toJSON(s);return e.object.width=this.width,e.object.height=this.height,e}}).prototype.isRectAreaLight=!0;class gf{constructor(){this.coefficients=[];for(let e=0;e<9;e++)this.coefficients.push(new T)}set(e){for(let t=0;t<9;t++)this.coefficients[t].copy(e[t]);return this}zero(){for(let e=0;e<9;e++)this.coefficients[e].set(0,0,0);return this}getAt(e,t){const n=e.x,i=e.y,r=e.z,a=this.coefficients;return t.copy(a[0]).multiplyScalar(.282095),t.addScaledVector(a[1],.488603*i),t.addScaledVector(a[2],.488603*r),t.addScaledVector(a[3],.488603*n),t.addScaledVector(a[4],n*i*1.092548),t.addScaledVector(a[5],i*r*1.092548),t.addScaledVector(a[6],.315392*(3*r*r-1)),t.addScaledVector(a[7],n*r*1.092548),t.addScaledVector(a[8],.546274*(n*n-i*i)),t}getIrradianceAt(e,t){const n=e.x,i=e.y,r=e.z,a=this.coefficients;return t.copy(a[0]).multiplyScalar(.886227),t.addScaledVector(a[1],1.023328*i),t.addScaledVector(a[2],1.023328*r),t.addScaledVector(a[3],1.023328*n),t.addScaledVector(a[4],.858086*n*i),t.addScaledVector(a[5],.858086*i*r),t.addScaledVector(a[6],.743125*r*r-.247708),t.addScaledVector(a[7],.858086*n*r),t.addScaledVector(a[8],.429043*(n*n-i*i)),t}add(e){for(let t=0;t<9;t++)this.coefficients[t].add(e.coefficients[t]);return this}addScaledSH(e,t){for(let n=0;n<9;n++)this.coefficients[n].addScaledVector(e.coefficients[n],t);return this}scale(e){for(let t=0;t<9;t++)this.coefficients[t].multiplyScalar(e);return this}lerp(e,t){for(let n=0;n<9;n++)this.coefficients[n].lerp(e.coefficients[n],t);return this}equals(e){for(let t=0;t<9;t++)if(!this.coefficients[t].equals(e.coefficients[t]))return!1;return!0}copy(e){return this.set(e.coefficients)}clone(){return new this.constructor().copy(this)}fromArray(e,t=0){const n=this.coefficients;for(let i=0;i<9;i++)n[i].fromArray(e,t+3*i);return this}toArray(e=[],t=0){const n=this.coefficients;for(let i=0;i<9;i++)n[i].toArray(e,t+3*i);return e}static getBasisAt(e,t){const n=e.x,i=e.y,r=e.z;t[0]=.282095,t[1]=.488603*i,t[2]=.488603*r,t[3]=.488603*n,t[4]=1.092548*n*i,t[5]=1.092548*i*r,t[6]=.315392*(3*r*r-1),t[7]=1.092548*n*r,t[8]=.546274*(n*n-i*i)}}gf.prototype.isSphericalHarmonics3=!0;class vo extends on{constructor(e=new gf,t=1){super(void 0,t),this.sh=e}copy(e){return super.copy(e),this.sh.copy(e.sh),this}fromJSON(e){return this.intensity=e.intensity,this.sh.fromArray(e.sh),this}toJSON(e){const t=super.toJSON(e);return t.object.sh=this.sh.toArray(),t}}vo.prototype.isLightProbe=!0;class $n{static decodeText(e){if(typeof TextDecoder<"u")return new TextDecoder().decode(e);let t="";for(let n=0,i=e.length;n<i;n++)t+=String.fromCharCode(e[n]);try{return decodeURIComponent(escape(t))}catch{return t}}static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.substr(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}(class extends Oe{constructor(){super(),this.type="InstancedBufferGeometry",this.instanceCount=1/0}copy(s){return super.copy(s),this.instanceCount=s.instanceCount,this}clone(){return new this.constructor().copy(this)}toJSON(){const s=super.toJSON(this);return s.instanceCount=this.instanceCount,s.isInstancedBufferGeometry=!0,s}}).prototype.isInstancedBufferGeometry=!0;class vf extends Ft{constructor(e){super(e),typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"}}setOptions(e){return this.options=e,this}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,a=pr.get(e);if(a!==void 0)return r.manager.itemStart(e),setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0),a;const o={};o.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",o.headers=this.requestHeader,fetch(e,o).then(function(l){return l.blob()}).then(function(l){return createImageBitmap(l,Object.assign(r.options,{colorSpaceConversion:"none"}))}).then(function(l){pr.add(e,l),t&&t(l),r.manager.itemEnd(e)}).catch(function(l){i&&i(l),r.manager.itemError(e),r.manager.itemEnd(e)}),r.manager.itemStart(e)}}let il;vf.prototype.isImageBitmapLoader=!0;const ey=function(){return il===void 0&&(il=new(window.AudioContext||window.webkitAudioContext)),il};class ty extends Ft{constructor(e){super(e)}load(e,t,n,i){const r=this,a=new Ln(this.manager);a.setResponseType("arraybuffer"),a.setPath(this.path),a.setRequestHeader(this.requestHeader),a.setWithCredentials(this.withCredentials),a.load(e,function(o){try{const l=o.slice(0);ey().decodeAudioData(l,function(c){t(c)})}catch(l){i?i(l):console.error(l),r.manager.itemError(e)}},n,i)}}(class extends vo{constructor(s,e,t=1){super(void 0,t);const n=new le().set(s),i=new le().set(e),r=new T(n.r,n.g,n.b),a=new T(i.r,i.g,i.b),o=Math.sqrt(Math.PI),l=o*Math.sqrt(.75);this.sh.coefficients[0].copy(r).add(a).multiplyScalar(o),this.sh.coefficients[1].copy(r).sub(a).multiplyScalar(l)}}).prototype.isHemisphereLightProbe=!0;(class extends vo{constructor(s,e=1){super(void 0,e);const t=new le().set(s);this.sh.coefficients[0].set(t.r,t.g,t.b).multiplyScalar(2*Math.sqrt(Math.PI))}}).prototype.isAmbientLightProbe=!0;class ny{constructor(e,t,n){let i,r,a;switch(this.binding=e,this.valueSize=n,t){case"quaternion":i=this._slerp,r=this._slerpAdditive,a=this._setAdditiveIdentityQuaternion,this.buffer=new Float64Array(6*n),this._workIndex=5;break;case"string":case"bool":i=this._select,r=this._select,a=this._setAdditiveIdentityOther,this.buffer=new Array(5*n);break;default:i=this._lerp,r=this._lerpAdditive,a=this._setAdditiveIdentityNumeric,this.buffer=new Float64Array(5*n)}this._mixBufferRegion=i,this._mixBufferRegionAdditive=r,this._setIdentity=a,this._origIndex=3,this._addIndex=4,this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,this.useCount=0,this.referenceCount=0}accumulate(e,t){const n=this.buffer,i=this.valueSize,r=e*i+i;let a=this.cumulativeWeight;if(a===0){for(let o=0;o!==i;++o)n[r+o]=n[o];a=t}else{a+=t;const o=t/a;this._mixBufferRegion(n,r,0,o,i)}this.cumulativeWeight=a}accumulateAdditive(e){const t=this.buffer,n=this.valueSize,i=n*this._addIndex;this.cumulativeWeightAdditive===0&&this._setIdentity(),this._mixBufferRegionAdditive(t,i,0,e,n),this.cumulativeWeightAdditive+=e}apply(e){const t=this.valueSize,n=this.buffer,i=e*t+t,r=this.cumulativeWeight,a=this.cumulativeWeightAdditive,o=this.binding;if(this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,r<1){const l=t*this._origIndex;this._mixBufferRegion(n,i,l,1-r,t)}a>0&&this._mixBufferRegionAdditive(n,i,this._addIndex*t,1,t);for(let l=t,c=t+t;l!==c;++l)if(n[l]!==n[l+t]){o.setValue(n,i);break}}saveOriginalState(){const e=this.binding,t=this.buffer,n=this.valueSize,i=n*this._origIndex;e.getValue(t,i);for(let r=n,a=i;r!==a;++r)t[r]=t[i+r%n];this._setIdentity(),this.cumulativeWeight=0,this.cumulativeWeightAdditive=0}restoreOriginalState(){const e=3*this.valueSize;this.binding.setValue(this.buffer,e)}_setAdditiveIdentityNumeric(){const e=this._addIndex*this.valueSize,t=e+this.valueSize;for(let n=e;n<t;n++)this.buffer[n]=0}_setAdditiveIdentityQuaternion(){this._setAdditiveIdentityNumeric(),this.buffer[this._addIndex*this.valueSize+3]=1}_setAdditiveIdentityOther(){const e=this._origIndex*this.valueSize,t=this._addIndex*this.valueSize;for(let n=0;n<this.valueSize;n++)this.buffer[t+n]=this.buffer[e+n]}_select(e,t,n,i,r){if(i>=.5)for(let a=0;a!==r;++a)e[t+a]=e[n+a]}_slerp(e,t,n,i){vt.slerpFlat(e,t,e,t,e,n,i)}_slerpAdditive(e,t,n,i,r){const a=this._workIndex*r;vt.multiplyQuaternionsFlat(e,a,e,t,e,n),vt.slerpFlat(e,t,e,t,e,a,i)}_lerp(e,t,n,i,r){const a=1-i;for(let o=0;o!==r;++o){const l=t+o;e[l]=e[l]*a+e[n+o]*i}}_lerpAdditive(e,t,n,i,r){for(let a=0;a!==r;++a){const o=t+a;e[o]=e[o]+e[n+a]*i}}}const iy=new RegExp("[\\[\\]\\.:\\/]","g"),ry="[^"+"\\[\\]\\.:\\/".replace("\\.","")+"]",sy=/((?:WC+[\/:])*)/.source.replace("WC","[^\\[\\]\\.:\\/]"),ay=/(WCOD+)?/.source.replace("WCOD",ry),oy=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC","[^\\[\\]\\.:\\/]"),ly=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC","[^\\[\\]\\.:\\/]"),cy=new RegExp("^"+sy+ay+oy+ly+"$"),hy=["material","materials","bones"];class Te{constructor(e,t,n){this.path=t,this.parsedPath=n||Te.parseTrackName(t),this.node=Te.findNode(e,this.parsedPath.nodeName)||e,this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new Te.Composite(e,t,n):new Te(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(iy,"")}static parseTrackName(e){const t=cy.exec(e);if(!t)throw new Error("PropertyBinding: Cannot parse trackName: "+e);const n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){const r=n.nodeName.substring(i+1);hy.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(!t||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){const n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){const n=function(r){for(let a=0;a<r.length;a++){const o=r[a];if(o.name===t||o.uuid===t)return o;const l=n(o.children);if(l)return l}return null},i=n(e.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)e[t++]=n[i]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++]}_setValue_array_setNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node;const t=this.parsedPath,n=t.objectName,i=t.propertyName;let r=t.propertyIndex;if(e||(e=Te.findNode(this.rootNode,t.nodeName)||this.rootNode,this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e)return void console.error("THREE.PropertyBinding: Trying to update node for track: "+this.path+" but it wasn't found.");if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material)return void console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);if(!e.material.materials)return void console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);e=e.material.materials;break;case"bones":if(!e.skeleton)return void console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;default:if(e[n]===void 0)return void console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);e=e[n]}if(c!==void 0){if(e[c]===void 0)return void console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);e=e[c]}}const a=e[i];if(a===void 0){const c=t.nodeName;return void console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+i+" but it wasn't found.",e)}let o=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?o=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(i==="morphTargetInfluences"){if(!e.geometry)return void console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);if(!e.geometry.isBufferGeometry)return void console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences on THREE.Geometry. Use THREE.BufferGeometry instead.",this);if(!e.geometry.morphAttributes)return void console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=i;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}Te.Composite=class{constructor(s,e,t){const n=t||Te.parseTrackName(e);this._targetGroup=s,this._bindings=s.subscribe_(e,n)}getValue(s,e){this.bind();const t=this._targetGroup.nCachedObjects_,n=this._bindings[t];n!==void 0&&n.getValue(s,e)}setValue(s,e){const t=this._bindings;for(let n=this._targetGroup.nCachedObjects_,i=t.length;n!==i;++n)t[n].setValue(s,e)}bind(){const s=this._bindings;for(let e=this._targetGroup.nCachedObjects_,t=s.length;e!==t;++e)s[e].bind()}unbind(){const s=this._bindings;for(let e=this._targetGroup.nCachedObjects_,t=s.length;e!==t;++e)s[e].unbind()}},Te.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},Te.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},Te.prototype.GetterByBindingType=[Te.prototype._getValue_direct,Te.prototype._getValue_array,Te.prototype._getValue_arrayElement,Te.prototype._getValue_toArray],Te.prototype.SetterByBindingTypeAndVersioning=[[Te.prototype._setValue_direct,Te.prototype._setValue_direct_setNeedsUpdate,Te.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Te.prototype._setValue_array,Te.prototype._setValue_array_setNeedsUpdate,Te.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Te.prototype._setValue_arrayElement,Te.prototype._setValue_arrayElement_setNeedsUpdate,Te.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Te.prototype._setValue_fromArray,Te.prototype._setValue_fromArray_setNeedsUpdate,Te.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];class uy{constructor(e,t,n=null,i=t.blendMode){this._mixer=e,this._clip=t,this._localRoot=n,this.blendMode=i;const r=t.tracks,a=r.length,o=new Array(a),l={endingStart:2400,endingEnd:2400};for(let c=0;c!==a;++c){const h=r[c].createInterpolant(null);o[c]=h,h.settings=l}this._interpolantSettings=l,this._interpolants=o,this._propertyBindings=new Array(a),this._cacheIndex=null,this._byClipCacheIndex=null,this._timeScaleInterpolant=null,this._weightInterpolant=null,this.loop=2201,this._loopCount=-1,this._startTime=null,this.time=0,this.timeScale=1,this._effectiveTimeScale=1,this.weight=1,this._effectiveWeight=1,this.repetitions=1/0,this.paused=!1,this.enabled=!0,this.clampWhenFinished=!1,this.zeroSlopeAtStart=!0,this.zeroSlopeAtEnd=!0}play(){return this._mixer._activateAction(this),this}stop(){return this._mixer._deactivateAction(this),this.reset()}reset(){return this.paused=!1,this.enabled=!0,this.time=0,this._loopCount=-1,this._startTime=null,this.stopFading().stopWarping()}isRunning(){return this.enabled&&!this.paused&&this.timeScale!==0&&this._startTime===null&&this._mixer._isActiveAction(this)}isScheduled(){return this._mixer._isActiveAction(this)}startAt(e){return this._startTime=e,this}setLoop(e,t){return this.loop=e,this.repetitions=t,this}setEffectiveWeight(e){return this.weight=e,this._effectiveWeight=this.enabled?e:0,this.stopFading()}getEffectiveWeight(){return this._effectiveWeight}fadeIn(e){return this._scheduleFading(e,0,1)}fadeOut(e){return this._scheduleFading(e,1,0)}crossFadeFrom(e,t,n){if(e.fadeOut(t),this.fadeIn(t),n){const i=this._clip.duration,r=e._clip.duration,a=r/i,o=i/r;e.warp(1,a,t),this.warp(o,1,t)}return this}crossFadeTo(e,t,n){return e.crossFadeFrom(this,t,n)}stopFading(){const e=this._weightInterpolant;return e!==null&&(this._weightInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}setEffectiveTimeScale(e){return this.timeScale=e,this._effectiveTimeScale=this.paused?0:e,this.stopWarping()}getEffectiveTimeScale(){return this._effectiveTimeScale}setDuration(e){return this.timeScale=this._clip.duration/e,this.stopWarping()}syncWith(e){return this.time=e.time,this.timeScale=e.timeScale,this.stopWarping()}halt(e){return this.warp(this._effectiveTimeScale,0,e)}warp(e,t,n){const i=this._mixer,r=i.time,a=this.timeScale;let o=this._timeScaleInterpolant;o===null&&(o=i._lendControlInterpolant(),this._timeScaleInterpolant=o);const l=o.parameterPositions,c=o.sampleValues;return l[0]=r,l[1]=r+n,c[0]=e/a,c[1]=t/a,this}stopWarping(){const e=this._timeScaleInterpolant;return e!==null&&(this._timeScaleInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}getMixer(){return this._mixer}getClip(){return this._clip}getRoot(){return this._localRoot||this._mixer._root}_update(e,t,n,i){if(!this.enabled)return void this._updateWeight(e);const r=this._startTime;if(r!==null){const l=(e-r)*n;if(l<0||n===0)return;this._startTime=null,t=n*l}t*=this._updateTimeScale(e);const a=this._updateTime(t),o=this._updateWeight(e);if(o>0){const l=this._interpolants,c=this._propertyBindings;if(this.blendMode===2501)for(let h=0,u=l.length;h!==u;++h)l[h].evaluate(a),c[h].accumulateAdditive(o);else for(let h=0,u=l.length;h!==u;++h)l[h].evaluate(a),c[h].accumulate(i,o)}}_updateWeight(e){let t=0;if(this.enabled){t=this.weight;const n=this._weightInterpolant;if(n!==null){const i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(this.stopFading(),i===0&&(this.enabled=!1))}}return this._effectiveWeight=t,t}_updateTimeScale(e){let t=0;if(!this.paused){t=this.timeScale;const n=this._timeScaleInterpolant;n!==null&&(t*=n.evaluate(e)[0],e>n.parameterPositions[1]&&(this.stopWarping(),t===0?this.paused=!0:this.timeScale=t))}return this._effectiveTimeScale=t,t}_updateTime(e){const t=this._clip.duration,n=this.loop;let i=this.time+e,r=this._loopCount;const a=n===2202;if(e===0)return r===-1?i:a&&(1&r)==1?t-i:i;if(n===2200){r===-1&&(this._loopCount=0,this._setEndings(!0,!0,!1));e:{if(i>=t)i=t;else{if(!(i<0)){this.time=i;break e}i=0}this.clampWhenFinished?this.paused=!0:this.enabled=!1,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e<0?-1:1})}}else{if(r===-1&&(e>=0?(r=0,this._setEndings(!0,this.repetitions===0,a)):this._setEndings(this.repetitions===0,!0,a)),i>=t||i<0){const o=Math.floor(i/t);i-=t*o,r+=Math.abs(o);const l=this.repetitions-r;if(l<=0)this.clampWhenFinished?this.paused=!0:this.enabled=!1,i=e>0?t:0,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e>0?1:-1});else{if(l===1){const c=e<0;this._setEndings(c,!c,a)}else this._setEndings(!1,!1,a);this._loopCount=r,this.time=i,this._mixer.dispatchEvent({type:"loop",action:this,loopDelta:o})}}else this.time=i;if(a&&(1&r)==1)return t-i}return i}_setEndings(e,t,n){const i=this._interpolantSettings;n?(i.endingStart=2401,i.endingEnd=2401):(i.endingStart=e?this.zeroSlopeAtStart?2401:2400:2402,i.endingEnd=t?this.zeroSlopeAtEnd?2401:2400:2402)}_scheduleFading(e,t,n){const i=this._mixer,r=i.time;let a=this._weightInterpolant;a===null&&(a=i._lendControlInterpolant(),this._weightInterpolant=a);const o=a.parameterPositions,l=a.sampleValues;return o[0]=r,l[0]=t,o[1]=r+e,l[1]=n,this}}class yf extends At{constructor(e){super(),this._root=e,this._initMemoryManager(),this._accuIndex=0,this.time=0,this.timeScale=1}_bindAction(e,t){const n=e._localRoot||this._root,i=e._clip.tracks,r=i.length,a=e._propertyBindings,o=e._interpolants,l=n.uuid,c=this._bindingsByRootAndName;let h=c[l];h===void 0&&(h={},c[l]=h);for(let u=0;u!==r;++u){const d=i[u],p=d.name;let m=h[p];if(m!==void 0)a[u]=m;else{if(m=a[u],m!==void 0){m._cacheIndex===null&&(++m.referenceCount,this._addInactiveBinding(m,l,p));continue}const f=t&&t._propertyBindings[u].binding.parsedPath;m=new ny(Te.create(n,p,f),d.ValueTypeName,d.getValueSize()),++m.referenceCount,this._addInactiveBinding(m,l,p),a[u]=m}o[u].resultBuffer=m.buffer}}_activateAction(e){if(!this._isActiveAction(e)){if(e._cacheIndex===null){const n=(e._localRoot||this._root).uuid,i=e._clip.uuid,r=this._actionsByClip[i];this._bindAction(e,r&&r.knownActions[0]),this._addInactiveAction(e,i,n)}const t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){const r=t[n];r.useCount++==0&&(this._lendBinding(r),r.saveOriginalState())}this._lendAction(e)}}_deactivateAction(e){if(this._isActiveAction(e)){const t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){const r=t[n];--r.useCount==0&&(r.restoreOriginalState(),this._takeBackBinding(r))}this._takeBackAction(e)}}_initMemoryManager(){this._actions=[],this._nActiveActions=0,this._actionsByClip={},this._bindings=[],this._nActiveBindings=0,this._bindingsByRootAndName={},this._controlInterpolants=[],this._nActiveControlInterpolants=0;const e=this;this.stats={actions:{get total(){return e._actions.length},get inUse(){return e._nActiveActions}},bindings:{get total(){return e._bindings.length},get inUse(){return e._nActiveBindings}},controlInterpolants:{get total(){return e._controlInterpolants.length},get inUse(){return e._nActiveControlInterpolants}}}}_isActiveAction(e){const t=e._cacheIndex;return t!==null&&t<this._nActiveActions}_addInactiveAction(e,t,n){const i=this._actions,r=this._actionsByClip;let a=r[t];if(a===void 0)a={knownActions:[e],actionByRoot:{}},e._byClipCacheIndex=0,r[t]=a;else{const o=a.knownActions;e._byClipCacheIndex=o.length,o.push(e)}e._cacheIndex=i.length,i.push(e),a.actionByRoot[n]=e}_removeInactiveAction(e){const t=this._actions,n=t[t.length-1],i=e._cacheIndex;n._cacheIndex=i,t[i]=n,t.pop(),e._cacheIndex=null;const r=e._clip.uuid,a=this._actionsByClip,o=a[r],l=o.knownActions,c=l[l.length-1],h=e._byClipCacheIndex;c._byClipCacheIndex=h,l[h]=c,l.pop(),e._byClipCacheIndex=null,delete o.actionByRoot[(e._localRoot||this._root).uuid],l.length===0&&delete a[r],this._removeInactiveBindingsForAction(e)}_removeInactiveBindingsForAction(e){const t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){const r=t[n];--r.referenceCount==0&&this._removeInactiveBinding(r)}}_lendAction(e){const t=this._actions,n=e._cacheIndex,i=this._nActiveActions++,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_takeBackAction(e){const t=this._actions,n=e._cacheIndex,i=--this._nActiveActions,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_addInactiveBinding(e,t,n){const i=this._bindingsByRootAndName,r=this._bindings;let a=i[t];a===void 0&&(a={},i[t]=a),a[n]=e,e._cacheIndex=r.length,r.push(e)}_removeInactiveBinding(e){const t=this._bindings,n=e.binding,i=n.rootNode.uuid,r=n.path,a=this._bindingsByRootAndName,o=a[i],l=t[t.length-1],c=e._cacheIndex;l._cacheIndex=c,t[c]=l,t.pop(),delete o[r],Object.keys(o).length===0&&delete a[i]}_lendBinding(e){const t=this._bindings,n=e._cacheIndex,i=this._nActiveBindings++,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_takeBackBinding(e){const t=this._bindings,n=e._cacheIndex,i=--this._nActiveBindings,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_lendControlInterpolant(){const e=this._controlInterpolants,t=this._nActiveControlInterpolants++;let n=e[t];return n===void 0&&(n=new hf(new Float32Array(2),new Float32Array(2),1,this._controlInterpolantsResultBuffer),n.__cacheIndex=t,e[t]=n),n}_takeBackControlInterpolant(e){const t=this._controlInterpolants,n=e.__cacheIndex,i=--this._nActiveControlInterpolants,r=t[i];e.__cacheIndex=i,t[i]=e,r.__cacheIndex=n,t[n]=r}clipAction(e,t,n){const i=t||this._root,r=i.uuid;let a=typeof e=="string"?Pc.findByName(i,e):e;const o=a!==null?a.uuid:e,l=this._actionsByClip[o];let c=null;if(n===void 0&&(n=a!==null?a.blendMode:2500),l!==void 0){const u=l.actionByRoot[r];if(u!==void 0&&u.blendMode===n)return u;c=l.knownActions[0],a===null&&(a=c._clip)}if(a===null)return null;const h=new uy(this,a,t,n);return this._bindAction(h,c),this._addInactiveAction(h,o,r),h}existingAction(e,t){const n=t||this._root,i=n.uuid,r=typeof e=="string"?Pc.findByName(n,e):e,a=r?r.uuid:e,o=this._actionsByClip[a];return o!==void 0&&o.actionByRoot[i]||null}stopAllAction(){const e=this._actions;for(let t=this._nActiveActions-1;t>=0;--t)e[t].stop();return this}update(e){e*=this.timeScale;const t=this._actions,n=this._nActiveActions,i=this.time+=e,r=Math.sign(e),a=this._accuIndex^=1;for(let c=0;c!==n;++c)t[c]._update(i,e,r,a);const o=this._bindings,l=this._nActiveBindings;for(let c=0;c!==l;++c)o[c].apply(a);return this}setTime(e){this.time=0;for(let t=0;t<this._actions.length;t++)this._actions[t].time=0;return this.update(e)}getRoot(){return this._root}uncacheClip(e){const t=this._actions,n=e.uuid,i=this._actionsByClip,r=i[n];if(r!==void 0){const a=r.knownActions;for(let o=0,l=a.length;o!==l;++o){const c=a[o];this._deactivateAction(c);const h=c._cacheIndex,u=t[t.length-1];c._cacheIndex=null,c._byClipCacheIndex=null,u._cacheIndex=h,t[h]=u,t.pop(),this._removeInactiveBindingsForAction(c)}delete i[n]}}uncacheRoot(e){const t=e.uuid,n=this._actionsByClip;for(const r in n){const a=n[r].actionByRoot[t];a!==void 0&&(this._deactivateAction(a),this._removeInactiveAction(a))}const i=this._bindingsByRootAndName[t];if(i!==void 0)for(const r in i){const a=i[r];a.restoreOriginalState(),this._removeInactiveBinding(a)}}uncacheAction(e,t){const n=this.existingAction(e,t);n!==null&&(this._deactivateAction(n),this._removeInactiveAction(n))}}yf.prototype._controlInterpolantsResultBuffer=new Float32Array(1);(class extends hr{constructor(s,e,t=1){super(s,e),this.meshPerAttribute=t}copy(s){return super.copy(s),this.meshPerAttribute=s.meshPerAttribute,this}clone(s){const e=super.clone(s);return e.meshPerAttribute=this.meshPerAttribute,e}toJSON(s){const e=super.toJSON(s);return e.isInstancedInterleavedBuffer=!0,e.meshPerAttribute=this.meshPerAttribute,e}}).prototype.isInstancedInterleavedBuffer=!0;function Hu(s,e){return s.distance-e.distance}function Ic(s,e,t,n){if(s.layers.test(e.layers)&&s.raycast(e,t),n===!0){const i=s.children;for(let r=0,a=i.length;r<a;r++)Ic(i[r],e,t,!0)}}class Fa{constructor(e=1,t=0,n=0){return this.radius=e,this.phi=t,this.theta=n,this}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=Math.max(1e-6,Math.min(Math.PI-1e-6,this.phi)),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(mt(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}const Hn=new T,ga=new he,rl=new he;function xf(s){const e=[];s&&s.isBone&&e.push(s);for(let t=0;t<s.children.length;t++)e.push.apply(e,xf(s.children[t]));return e}const bf=new Float32Array(1),dy=new Int32Array(bf.buffer);class sl{static toHalfFloat(e){e>65504&&(console.warn("THREE.DataUtils.toHalfFloat(): value exceeds 65504."),e=65504),bf[0]=e;const t=dy[0];let n=t>>16&32768,i=t>>12&2047;const r=t>>23&255;return r<103?n:r>142?(n|=31744,n|=(r==255?0:1)&&8388607&t,n):r<113?(i|=2048,n|=(i>>114-r)+(i>>113-r&1),n):(n|=r-112<<10|i>>1,n+=1&i,n)}}Nt.create=function(s,e){return console.log("THREE.Curve.create() has been deprecated"),s.prototype=Object.create(Nt.prototype),s.prototype.constructor=s,s.prototype.getPoint=e,s},Rc.prototype.fromPoints=function(s){return console.warn("THREE.Path: .fromPoints() has been renamed to .setFromPoints()."),this.setFromPoints(s)},class extends Ya{constructor(s=10,e=10,t=4473924,n=8947848){t=new le(t),n=new le(n);const i=e/2,r=s/e,a=s/2,o=[],l=[];for(let h=0,u=0,d=-a;h<=e;h++,d+=r){o.push(-a,0,d,a,0,d),o.push(d,0,-a,d,0,a);const p=h===i?t:n;p.toArray(l,u),u+=3,p.toArray(l,u),u+=3,p.toArray(l,u),u+=3,p.toArray(l,u),u+=3}const c=new Oe;c.setAttribute("position",new Ke(o,3)),c.setAttribute("color",new Ke(l,3)),super(c,new dr({vertexColors:!0,toneMapped:!1})),this.type="GridHelper"}}.prototype.setColors=function(){console.error("THREE.GridHelper: setColors() has been deprecated, pass them in the constructor instead.")},class extends Ya{constructor(s){const e=xf(s),t=new Oe,n=[],i=[],r=new le(0,0,1),a=new le(0,1,0);for(let o=0;o<e.length;o++){const l=e[o];l.parent&&l.parent.isBone&&(n.push(0,0,0),n.push(0,0,0),i.push(r.r,r.g,r.b),i.push(a.r,a.g,a.b))}t.setAttribute("position",new Ke(n,3)),t.setAttribute("color",new Ke(i,3)),super(t,new dr({vertexColors:!0,depthTest:!1,depthWrite:!1,toneMapped:!1,transparent:!0})),this.type="SkeletonHelper",this.isSkeletonHelper=!0,this.root=s,this.bones=e,this.matrix=s.matrixWorld,this.matrixAutoUpdate=!1}updateMatrixWorld(s){const e=this.bones,t=this.geometry,n=t.getAttribute("position");rl.copy(this.root.matrixWorld).invert();for(let i=0,r=0;i<e.length;i++){const a=e[i];a.parent&&a.parent.isBone&&(ga.multiplyMatrices(rl,a.matrixWorld),Hn.setFromMatrixPosition(ga),n.setXYZ(r,Hn.x,Hn.y,Hn.z),ga.multiplyMatrices(rl,a.parent.matrixWorld),Hn.setFromMatrixPosition(ga),n.setXYZ(r+1,Hn.x,Hn.y,Hn.z),r+=2)}t.getAttribute("position").needsUpdate=!0,super.updateMatrixWorld(s)}}.prototype.update=function(){console.error("THREE.SkeletonHelper: update() no longer needs to be called.")},Ft.prototype.extractUrlBase=function(s){return console.warn("THREE.Loader: .extractUrlBase() has been deprecated. Use THREE.LoaderUtils.extractUrlBase() instead."),$n.extractUrlBase(s)},Ft.Handlers={add:function(){console.error("THREE.Loader: Handlers.add() has been removed. Use LoadingManager.addHandler() instead.")},get:function(){console.error("THREE.Loader: Handlers.get() has been removed. Use LoadingManager.getHandler() instead.")}},ft.prototype.center=function(s){return console.warn("THREE.Box3: .center() has been renamed to .getCenter()."),this.getCenter(s)},ft.prototype.empty=function(){return console.warn("THREE.Box3: .empty() has been renamed to .isEmpty()."),this.isEmpty()},ft.prototype.isIntersectionBox=function(s){return console.warn("THREE.Box3: .isIntersectionBox() has been renamed to .intersectsBox()."),this.intersectsBox(s)},ft.prototype.isIntersectionSphere=function(s){return console.warn("THREE.Box3: .isIntersectionSphere() has been renamed to .intersectsSphere()."),this.intersectsSphere(s)},ft.prototype.size=function(s){return console.warn("THREE.Box3: .size() has been renamed to .getSize()."),this.getSize(s)},ei.prototype.empty=function(){return console.warn("THREE.Sphere: .empty() has been renamed to .isEmpty()."),this.isEmpty()},ao.prototype.setFromMatrix=function(s){return console.warn("THREE.Frustum: .setFromMatrix() has been renamed to .setFromProjectionMatrix()."),this.setFromProjectionMatrix(s)},$e.prototype.flattenToArrayOffset=function(s,e){return console.warn("THREE.Matrix3: .flattenToArrayOffset() has been deprecated. Use .toArray() instead."),this.toArray(s,e)},$e.prototype.multiplyVector3=function(s){return console.warn("THREE.Matrix3: .multiplyVector3() has been removed. Use vector.applyMatrix3( matrix ) instead."),s.applyMatrix3(this)},$e.prototype.multiplyVector3Array=function(){console.error("THREE.Matrix3: .multiplyVector3Array() has been removed.")},$e.prototype.applyToBufferAttribute=function(s){return console.warn("THREE.Matrix3: .applyToBufferAttribute() has been removed. Use attribute.applyMatrix3( matrix ) instead."),s.applyMatrix3(this)},$e.prototype.applyToVector3Array=function(){console.error("THREE.Matrix3: .applyToVector3Array() has been removed.")},$e.prototype.getInverse=function(s){return console.warn("THREE.Matrix3: .getInverse() has been removed. Use matrixInv.copy( matrix ).invert(); instead."),this.copy(s).invert()},he.prototype.extractPosition=function(s){return console.warn("THREE.Matrix4: .extractPosition() has been renamed to .copyPosition()."),this.copyPosition(s)},he.prototype.flattenToArrayOffset=function(s,e){return console.warn("THREE.Matrix4: .flattenToArrayOffset() has been deprecated. Use .toArray() instead."),this.toArray(s,e)},he.prototype.getPosition=function(){return console.warn("THREE.Matrix4: .getPosition() has been removed. Use Vector3.setFromMatrixPosition( matrix ) instead."),new T().setFromMatrixColumn(this,3)},he.prototype.setRotationFromQuaternion=function(s){return console.warn("THREE.Matrix4: .setRotationFromQuaternion() has been renamed to .makeRotationFromQuaternion()."),this.makeRotationFromQuaternion(s)},he.prototype.multiplyToArray=function(){console.warn("THREE.Matrix4: .multiplyToArray() has been removed.")},he.prototype.multiplyVector3=function(s){return console.warn("THREE.Matrix4: .multiplyVector3() has been removed. Use vector.applyMatrix4( matrix ) instead."),s.applyMatrix4(this)},he.prototype.multiplyVector4=function(s){return console.warn("THREE.Matrix4: .multiplyVector4() has been removed. Use vector.applyMatrix4( matrix ) instead."),s.applyMatrix4(this)},he.prototype.multiplyVector3Array=function(){console.error("THREE.Matrix4: .multiplyVector3Array() has been removed.")},he.prototype.rotateAxis=function(s){console.warn("THREE.Matrix4: .rotateAxis() has been removed. Use Vector3.transformDirection( matrix ) instead."),s.transformDirection(this)},he.prototype.crossVector=function(s){return console.warn("THREE.Matrix4: .crossVector() has been removed. Use vector.applyMatrix4( matrix ) instead."),s.applyMatrix4(this)},he.prototype.translate=function(){console.error("THREE.Matrix4: .translate() has been removed.")},he.prototype.rotateX=function(){console.error("THREE.Matrix4: .rotateX() has been removed.")},he.prototype.rotateY=function(){console.error("THREE.Matrix4: .rotateY() has been removed.")},he.prototype.rotateZ=function(){console.error("THREE.Matrix4: .rotateZ() has been removed.")},he.prototype.rotateByAxis=function(){console.error("THREE.Matrix4: .rotateByAxis() has been removed.")},he.prototype.applyToBufferAttribute=function(s){return console.warn("THREE.Matrix4: .applyToBufferAttribute() has been removed. Use attribute.applyMatrix4( matrix ) instead."),s.applyMatrix4(this)},he.prototype.applyToVector3Array=function(){console.error("THREE.Matrix4: .applyToVector3Array() has been removed.")},he.prototype.makeFrustum=function(s,e,t,n,i,r){return console.warn("THREE.Matrix4: .makeFrustum() has been removed. Use .makePerspective( left, right, top, bottom, near, far ) instead."),this.makePerspective(s,e,n,t,i,r)},he.prototype.getInverse=function(s){return console.warn("THREE.Matrix4: .getInverse() has been removed. Use matrixInv.copy( matrix ).invert(); instead."),this.copy(s).invert()},Tn.prototype.isIntersectionLine=function(s){return console.warn("THREE.Plane: .isIntersectionLine() has been renamed to .intersectsLine()."),this.intersectsLine(s)},vt.prototype.multiplyVector3=function(s){return console.warn("THREE.Quaternion: .multiplyVector3() has been removed. Use is now vector.applyQuaternion( quaternion ) instead."),s.applyQuaternion(this)},vt.prototype.inverse=function(){return console.warn("THREE.Quaternion: .inverse() has been renamed to invert()."),this.invert()},bi.prototype.isIntersectionBox=function(s){return console.warn("THREE.Ray: .isIntersectionBox() has been renamed to .intersectsBox()."),this.intersectsBox(s)},bi.prototype.isIntersectionPlane=function(s){return console.warn("THREE.Ray: .isIntersectionPlane() has been renamed to .intersectsPlane()."),this.intersectsPlane(s)},bi.prototype.isIntersectionSphere=function(s){return console.warn("THREE.Ray: .isIntersectionSphere() has been renamed to .intersectsSphere()."),this.intersectsSphere(s)},Ze.prototype.area=function(){return console.warn("THREE.Triangle: .area() has been renamed to .getArea()."),this.getArea()},Ze.prototype.barycoordFromPoint=function(s,e){return console.warn("THREE.Triangle: .barycoordFromPoint() has been renamed to .getBarycoord()."),this.getBarycoord(s,e)},Ze.prototype.midpoint=function(s){return console.warn("THREE.Triangle: .midpoint() has been renamed to .getMidpoint()."),this.getMidpoint(s)},Ze.prototypenormal=function(s){return console.warn("THREE.Triangle: .normal() has been renamed to .getNormal()."),this.getNormal(s)},Ze.prototype.plane=function(s){return console.warn("THREE.Triangle: .plane() has been renamed to .getPlane()."),this.getPlane(s)},Ze.barycoordFromPoint=function(s,e,t,n,i){return console.warn("THREE.Triangle: .barycoordFromPoint() has been renamed to .getBarycoord()."),Ze.getBarycoord(s,e,t,n,i)},Ze.normal=function(s,e,t,n){return console.warn("THREE.Triangle: .normal() has been renamed to .getNormal()."),Ze.getNormal(s,e,t,n)},vs.prototype.extractAllPoints=function(s){return console.warn("THREE.Shape: .extractAllPoints() has been removed. Use .extractPoints() instead."),this.extractPoints(s)},vs.prototype.extrude=function(s){return console.warn("THREE.Shape: .extrude() has been removed. Use ExtrudeGeometry() instead."),new or(this,s)},vs.prototype.makeGeometry=function(s){return console.warn("THREE.Shape: .makeGeometry() has been removed. Use ShapeGeometry() instead."),new dh(this,s)},$.prototype.fromAttribute=function(s,e,t){return console.warn("THREE.Vector2: .fromAttribute() has been renamed to .fromBufferAttribute()."),this.fromBufferAttribute(s,e,t)},$.prototype.distanceToManhattan=function(s){return console.warn("THREE.Vector2: .distanceToManhattan() has been renamed to .manhattanDistanceTo()."),this.manhattanDistanceTo(s)},$.prototype.lengthManhattan=function(){return console.warn("THREE.Vector2: .lengthManhattan() has been renamed to .manhattanLength()."),this.manhattanLength()},T.prototype.setEulerFromRotationMatrix=function(){console.error("THREE.Vector3: .setEulerFromRotationMatrix() has been removed. Use Euler.setFromRotationMatrix() instead.")},T.prototype.setEulerFromQuaternion=function(){console.error("THREE.Vector3: .setEulerFromQuaternion() has been removed. Use Euler.setFromQuaternion() instead.")},T.prototype.getPositionFromMatrix=function(s){return console.warn("THREE.Vector3: .getPositionFromMatrix() has been renamed to .setFromMatrixPosition()."),this.setFromMatrixPosition(s)},T.prototype.getScaleFromMatrix=function(s){return console.warn("THREE.Vector3: .getScaleFromMatrix() has been renamed to .setFromMatrixScale()."),this.setFromMatrixScale(s)},T.prototype.getColumnFromMatrix=function(s,e){return console.warn("THREE.Vector3: .getColumnFromMatrix() has been renamed to .setFromMatrixColumn()."),this.setFromMatrixColumn(e,s)},T.prototype.applyProjection=function(s){return console.warn("THREE.Vector3: .applyProjection() has been removed. Use .applyMatrix4( m ) instead."),this.applyMatrix4(s)},T.prototype.fromAttribute=function(s,e,t){return console.warn("THREE.Vector3: .fromAttribute() has been renamed to .fromBufferAttribute()."),this.fromBufferAttribute(s,e,t)},T.prototype.distanceToManhattan=function(s){return console.warn("THREE.Vector3: .distanceToManhattan() has been renamed to .manhattanDistanceTo()."),this.manhattanDistanceTo(s)},T.prototype.lengthManhattan=function(){return console.warn("THREE.Vector3: .lengthManhattan() has been renamed to .manhattanLength()."),this.manhattanLength()},Ue.prototype.fromAttribute=function(s,e,t){return console.warn("THREE.Vector4: .fromAttribute() has been renamed to .fromBufferAttribute()."),this.fromBufferAttribute(s,e,t)},Ue.prototype.lengthManhattan=function(){return console.warn("THREE.Vector4: .lengthManhattan() has been renamed to .manhattanLength()."),this.manhattanLength()},Re.prototype.getChildByName=function(s){return console.warn("THREE.Object3D: .getChildByName() has been renamed to .getObjectByName()."),this.getObjectByName(s)},Re.prototype.renderDepth=function(){console.warn("THREE.Object3D: .renderDepth has been removed. Use .renderOrder, instead.")},Re.prototype.translate=function(s,e){return console.warn("THREE.Object3D: .translate() has been removed. Use .translateOnAxis( axis, distance ) instead."),this.translateOnAxis(e,s)},Re.prototype.getWorldRotation=function(){console.error("THREE.Object3D: .getWorldRotation() has been removed. Use THREE.Object3D.getWorldQuaternion( target ) instead.")},Re.prototype.applyMatrix=function(s){return console.warn("THREE.Object3D: .applyMatrix() has been renamed to .applyMatrix4()."),this.applyMatrix4(s)},Object.defineProperties(Re.prototype,{eulerOrder:{get:function(){return console.warn("THREE.Object3D: .eulerOrder is now .rotation.order."),this.rotation.order},set:function(s){console.warn("THREE.Object3D: .eulerOrder is now .rotation.order."),this.rotation.order=s}},useQuaternion:{get:function(){console.warn("THREE.Object3D: .useQuaternion has been removed. The library now uses quaternions by default.")},set:function(){console.warn("THREE.Object3D: .useQuaternion has been removed. The library now uses quaternions by default.")}}}),me.prototype.setDrawMode=function(){console.error("THREE.Mesh: .setDrawMode() has been removed. The renderer now always assumes THREE.TrianglesDrawMode. Transform your geometry via BufferGeometryUtils.toTrianglesDrawMode() if necessary.")},Object.defineProperties(me.prototype,{drawMode:{get:function(){return console.error("THREE.Mesh: .drawMode has been removed. The renderer now always assumes THREE.TrianglesDrawMode."),0},set:function(){console.error("THREE.Mesh: .drawMode has been removed. The renderer now always assumes THREE.TrianglesDrawMode. Transform your geometry via BufferGeometryUtils.toTrianglesDrawMode() if necessary.")}}}),ih.prototype.initBones=function(){console.error("THREE.SkinnedMesh: initBones() has been removed.")},nt.prototype.setLens=function(s,e){console.warn("THREE.PerspectiveCamera.setLens is deprecated. Use .setFocalLength and .filmGauge for a photographic setup."),e!==void 0&&(this.filmGauge=e),this.setFocalLength(s)},Object.defineProperties(on.prototype,{onlyShadow:{set:function(){console.warn("THREE.Light: .onlyShadow has been removed.")}},shadowCameraFov:{set:function(s){console.warn("THREE.Light: .shadowCameraFov is now .shadow.camera.fov."),this.shadow.camera.fov=s}},shadowCameraLeft:{set:function(s){console.warn("THREE.Light: .shadowCameraLeft is now .shadow.camera.left."),this.shadow.camera.left=s}},shadowCameraRight:{set:function(s){console.warn("THREE.Light: .shadowCameraRight is now .shadow.camera.right."),this.shadow.camera.right=s}},shadowCameraTop:{set:function(s){console.warn("THREE.Light: .shadowCameraTop is now .shadow.camera.top."),this.shadow.camera.top=s}},shadowCameraBottom:{set:function(s){console.warn("THREE.Light: .shadowCameraBottom is now .shadow.camera.bottom."),this.shadow.camera.bottom=s}},shadowCameraNear:{set:function(s){console.warn("THREE.Light: .shadowCameraNear is now .shadow.camera.near."),this.shadow.camera.near=s}},shadowCameraFar:{set:function(s){console.warn("THREE.Light: .shadowCameraFar is now .shadow.camera.far."),this.shadow.camera.far=s}},shadowCameraVisible:{set:function(){console.warn("THREE.Light: .shadowCameraVisible has been removed. Use new THREE.CameraHelper( light.shadow.camera ) instead.")}},shadowBias:{set:function(s){console.warn("THREE.Light: .shadowBias is now .shadow.bias."),this.shadow.bias=s}},shadowDarkness:{set:function(){console.warn("THREE.Light: .shadowDarkness has been removed.")}},shadowMapWidth:{set:function(s){console.warn("THREE.Light: .shadowMapWidth is now .shadow.mapSize.width."),this.shadow.mapSize.width=s}},shadowMapHeight:{set:function(s){console.warn("THREE.Light: .shadowMapHeight is now .shadow.mapSize.height."),this.shadow.mapSize.height=s}}}),Object.defineProperties(ke.prototype,{length:{get:function(){return console.warn("THREE.BufferAttribute: .length has been deprecated. Use .count instead."),this.array.length}},dynamic:{get:function(){return console.warn("THREE.BufferAttribute: .dynamic has been deprecated. Use .usage instead."),this.usage===35048},set:function(){console.warn("THREE.BufferAttribute: .dynamic has been deprecated. Use .usage instead."),this.setUsage(35048)}}}),ke.prototype.setDynamic=function(s){return console.warn("THREE.BufferAttribute: .setDynamic() has been deprecated. Use .setUsage() instead."),this.setUsage(s===!0?35048:35044),this},ke.prototype.copyIndicesArray=function(){console.error("THREE.BufferAttribute: .copyIndicesArray() has been removed.")},ke.prototype.setArray=function(){console.error("THREE.BufferAttribute: .setArray has been removed. Use BufferGeometry .setAttribute to replace/resize attribute buffers")},Oe.prototype.addIndex=function(s){console.warn("THREE.BufferGeometry: .addIndex() has been renamed to .setIndex()."),this.setIndex(s)},Oe.prototype.addAttribute=function(s,e){return console.warn("THREE.BufferGeometry: .addAttribute() has been renamed to .setAttribute()."),e&&e.isBufferAttribute||e&&e.isInterleavedBufferAttribute?s==="index"?(console.warn("THREE.BufferGeometry.addAttribute: Use .setIndex() for index attribute."),this.setIndex(e),this):this.setAttribute(s,e):(console.warn("THREE.BufferGeometry: .addAttribute() now expects ( name, attribute )."),this.setAttribute(s,new ke(arguments[1],arguments[2])))},Oe.prototype.addDrawCall=function(s,e,t){t!==void 0&&console.warn("THREE.BufferGeometry: .addDrawCall() no longer supports indexOffset."),console.warn("THREE.BufferGeometry: .addDrawCall() is now .addGroup()."),this.addGroup(s,e)},Oe.prototype.clearDrawCalls=function(){console.warn("THREE.BufferGeometry: .clearDrawCalls() is now .clearGroups()."),this.clearGroups()},Oe.prototype.computeOffsets=function(){console.warn("THREE.BufferGeometry: .computeOffsets() has been removed.")},Oe.prototype.removeAttribute=function(s){return console.warn("THREE.BufferGeometry: .removeAttribute() has been renamed to .deleteAttribute()."),this.deleteAttribute(s)},Oe.prototype.applyMatrix=function(s){return console.warn("THREE.BufferGeometry: .applyMatrix() has been renamed to .applyMatrix4()."),this.applyMatrix4(s)},Object.defineProperties(Oe.prototype,{drawcalls:{get:function(){return console.error("THREE.BufferGeometry: .drawcalls has been renamed to .groups."),this.groups}},offsets:{get:function(){return console.warn("THREE.BufferGeometry: .offsets has been renamed to .groups."),this.groups}}}),hr.prototype.setDynamic=function(s){return console.warn("THREE.InterleavedBuffer: .setDynamic() has been deprecated. Use .setUsage() instead."),this.setUsage(s===!0?35048:35044),this},hr.prototype.setArray=function(){console.error("THREE.InterleavedBuffer: .setArray has been removed. Use BufferGeometry .setAttribute to replace/resize attribute buffers")},or.prototype.getArrays=function(){console.error("THREE.ExtrudeGeometry: .getArrays() has been removed.")},or.prototype.addShapeList=function(){console.error("THREE.ExtrudeGeometry: .addShapeList() has been removed.")},or.prototype.addShape=function(){console.error("THREE.ExtrudeGeometry: .addShape() has been removed.")},an.prototype.dispose=function(){console.error("THREE.Scene: .dispose() has been removed.")},Object.defineProperties(Je.prototype,{wrapAround:{get:function(){console.warn("THREE.Material: .wrapAround has been removed.")},set:function(){console.warn("THREE.Material: .wrapAround has been removed.")}},overdraw:{get:function(){console.warn("THREE.Material: .overdraw has been removed.")},set:function(){console.warn("THREE.Material: .overdraw has been removed.")}},wrapRGB:{get:function(){return console.warn("THREE.Material: .wrapRGB has been removed."),new le}},shading:{get:function(){console.error("THREE."+this.type+": .shading has been removed. Use the boolean .flatShading instead.")},set:function(s){console.warn("THREE."+this.type+": .shading has been removed. Use the boolean .flatShading instead."),this.flatShading=s===1}},stencilMask:{get:function(){return console.warn("THREE."+this.type+": .stencilMask has been removed. Use .stencilFuncMask instead."),this.stencilFuncMask},set:function(s){console.warn("THREE."+this.type+": .stencilMask has been removed. Use .stencilFuncMask instead."),this.stencilFuncMask=s}},vertexTangents:{get:function(){console.warn("THREE."+this.type+": .vertexTangents has been removed.")},set:function(){console.warn("THREE."+this.type+": .vertexTangents has been removed.")}}}),Object.defineProperties(Pn.prototype,{derivatives:{get:function(){return console.warn("THREE.ShaderMaterial: .derivatives has been moved to .extensions.derivatives."),this.extensions.derivatives},set:function(s){console.warn("THREE. ShaderMaterial: .derivatives has been moved to .extensions.derivatives."),this.extensions.derivatives=s}}}),Pe.prototype.clearTarget=function(s,e,t,n){console.warn("THREE.WebGLRenderer: .clearTarget() has been deprecated. Use .setRenderTarget() and .clear() instead."),this.setRenderTarget(s),this.clear(e,t,n)},Pe.prototype.animate=function(s){console.warn("THREE.WebGLRenderer: .animate() is now .setAnimationLoop()."),this.setAnimationLoop(s)},Pe.prototype.getCurrentRenderTarget=function(){return console.warn("THREE.WebGLRenderer: .getCurrentRenderTarget() is now .getRenderTarget()."),this.getRenderTarget()},Pe.prototype.getMaxAnisotropy=function(){return console.warn("THREE.WebGLRenderer: .getMaxAnisotropy() is now .capabilities.getMaxAnisotropy()."),this.capabilities.getMaxAnisotropy()},Pe.prototype.getPrecision=function(){return console.warn("THREE.WebGLRenderer: .getPrecision() is now .capabilities.precision."),this.capabilities.precision},Pe.prototype.resetGLState=function(){return console.warn("THREE.WebGLRenderer: .resetGLState() is now .state.reset()."),this.state.reset()},Pe.prototype.supportsFloatTextures=function(){return console.warn("THREE.WebGLRenderer: .supportsFloatTextures() is now .extensions.get( 'OES_texture_float' )."),this.extensions.get("OES_texture_float")},Pe.prototype.supportsHalfFloatTextures=function(){return console.warn("THREE.WebGLRenderer: .supportsHalfFloatTextures() is now .extensions.get( 'OES_texture_half_float' )."),this.extensions.get("OES_texture_half_float")},Pe.prototype.supportsStandardDerivatives=function(){return console.warn("THREE.WebGLRenderer: .supportsStandardDerivatives() is now .extensions.get( 'OES_standard_derivatives' )."),this.extensions.get("OES_standard_derivatives")},Pe.prototype.supportsCompressedTextureS3TC=function(){return console.warn("THREE.WebGLRenderer: .supportsCompressedTextureS3TC() is now .extensions.get( 'WEBGL_compressed_texture_s3tc' )."),this.extensions.get("WEBGL_compressed_texture_s3tc")},Pe.prototype.supportsCompressedTexturePVRTC=function(){return console.warn("THREE.WebGLRenderer: .supportsCompressedTexturePVRTC() is now .extensions.get( 'WEBGL_compressed_texture_pvrtc' )."),this.extensions.get("WEBGL_compressed_texture_pvrtc")},Pe.prototype.supportsBlendMinMax=function(){return console.warn("THREE.WebGLRenderer: .supportsBlendMinMax() is now .extensions.get( 'EXT_blend_minmax' )."),this.extensions.get("EXT_blend_minmax")},Pe.prototype.supportsVertexTextures=function(){return console.warn("THREE.WebGLRenderer: .supportsVertexTextures() is now .capabilities.vertexTextures."),this.capabilities.vertexTextures},Pe.prototype.supportsInstancedArrays=function(){return console.warn("THREE.WebGLRenderer: .supportsInstancedArrays() is now .extensions.get( 'ANGLE_instanced_arrays' )."),this.extensions.get("ANGLE_instanced_arrays")},Pe.prototype.enableScissorTest=function(s){console.warn("THREE.WebGLRenderer: .enableScissorTest() is now .setScissorTest()."),this.setScissorTest(s)},Pe.prototype.initMaterial=function(){console.warn("THREE.WebGLRenderer: .initMaterial() has been removed.")},Pe.prototype.addPrePlugin=function(){console.warn("THREE.WebGLRenderer: .addPrePlugin() has been removed.")},Pe.prototype.addPostPlugin=function(){console.warn("THREE.WebGLRenderer: .addPostPlugin() has been removed.")},Pe.prototype.updateShadowMap=function(){console.warn("THREE.WebGLRenderer: .updateShadowMap() has been removed.")},Pe.prototype.setFaceCulling=function(){console.warn("THREE.WebGLRenderer: .setFaceCulling() has been removed.")},Pe.prototype.allocTextureUnit=function(){console.warn("THREE.WebGLRenderer: .allocTextureUnit() has been removed.")},Pe.prototype.setTexture=function(){console.warn("THREE.WebGLRenderer: .setTexture() has been removed.")},Pe.prototype.setTexture2D=function(){console.warn("THREE.WebGLRenderer: .setTexture2D() has been removed.")},Pe.prototype.setTextureCube=function(){console.warn("THREE.WebGLRenderer: .setTextureCube() has been removed.")},Pe.prototype.getActiveMipMapLevel=function(){return console.warn("THREE.WebGLRenderer: .getActiveMipMapLevel() is now .getActiveMipmapLevel()."),this.getActiveMipmapLevel()},Object.defineProperties(Pe.prototype,{shadowMapEnabled:{get:function(){return this.shadowMap.enabled},set:function(s){console.warn("THREE.WebGLRenderer: .shadowMapEnabled is now .shadowMap.enabled."),this.shadowMap.enabled=s}},shadowMapType:{get:function(){return this.shadowMap.type},set:function(s){console.warn("THREE.WebGLRenderer: .shadowMapType is now .shadowMap.type."),this.shadowMap.type=s}},shadowMapCullFace:{get:function(){console.warn("THREE.WebGLRenderer: .shadowMapCullFace has been removed. Set Material.shadowSide instead.")},set:function(){console.warn("THREE.WebGLRenderer: .shadowMapCullFace has been removed. Set Material.shadowSide instead.")}},context:{get:function(){return console.warn("THREE.WebGLRenderer: .context has been removed. Use .getContext() instead."),this.getContext()}},vr:{get:function(){return console.warn("THREE.WebGLRenderer: .vr has been renamed to .xr"),this.xr}},gammaInput:{get:function(){return console.warn("THREE.WebGLRenderer: .gammaInput has been removed. Set the encoding for textures via Texture.encoding instead."),!1},set:function(){console.warn("THREE.WebGLRenderer: .gammaInput has been removed. Set the encoding for textures via Texture.encoding instead.")}},gammaOutput:{get:function(){return console.warn("THREE.WebGLRenderer: .gammaOutput has been removed. Set WebGLRenderer.outputEncoding instead."),!1},set:function(s){console.warn("THREE.WebGLRenderer: .gammaOutput has been removed. Set WebGLRenderer.outputEncoding instead."),this.outputEncoding=s===!0?3001:3e3}},toneMappingWhitePoint:{get:function(){return console.warn("THREE.WebGLRenderer: .toneMappingWhitePoint has been removed."),1},set:function(){console.warn("THREE.WebGLRenderer: .toneMappingWhitePoint has been removed.")}},gammaFactor:{get:function(){return console.warn("THREE.WebGLRenderer: .gammaFactor has been removed."),2},set:function(){console.warn("THREE.WebGLRenderer: .gammaFactor has been removed.")}}}),Object.defineProperties(Zm.prototype,{cullFace:{get:function(){console.warn("THREE.WebGLRenderer: .shadowMap.cullFace has been removed. Set Material.shadowSide instead.")},set:function(){console.warn("THREE.WebGLRenderer: .shadowMap.cullFace has been removed. Set Material.shadowSide instead.")}},renderReverseSided:{get:function(){console.warn("THREE.WebGLRenderer: .shadowMap.renderReverseSided has been removed. Set Material.shadowSide instead.")},set:function(){console.warn("THREE.WebGLRenderer: .shadowMap.renderReverseSided has been removed. Set Material.shadowSide instead.")}},renderSingleSided:{get:function(){console.warn("THREE.WebGLRenderer: .shadowMap.renderSingleSided has been removed. Set Material.shadowSide instead.")},set:function(){console.warn("THREE.WebGLRenderer: .shadowMap.renderSingleSided has been removed. Set Material.shadowSide instead.")}}}),Object.defineProperties(wt.prototype,{wrapS:{get:function(){return console.warn("THREE.WebGLRenderTarget: .wrapS is now .texture.wrapS."),this.texture.wrapS},set:function(s){console.warn("THREE.WebGLRenderTarget: .wrapS is now .texture.wrapS."),this.texture.wrapS=s}},wrapT:{get:function(){return console.warn("THREE.WebGLRenderTarget: .wrapT is now .texture.wrapT."),this.texture.wrapT},set:function(s){console.warn("THREE.WebGLRenderTarget: .wrapT is now .texture.wrapT."),this.texture.wrapT=s}},magFilter:{get:function(){return console.warn("THREE.WebGLRenderTarget: .magFilter is now .texture.magFilter."),this.texture.magFilter},set:function(s){console.warn("THREE.WebGLRenderTarget: .magFilter is now .texture.magFilter."),this.texture.magFilter=s}},minFilter:{get:function(){return console.warn("THREE.WebGLRenderTarget: .minFilter is now .texture.minFilter."),this.texture.minFilter},set:function(s){console.warn("THREE.WebGLRenderTarget: .minFilter is now .texture.minFilter."),this.texture.minFilter=s}},anisotropy:{get:function(){return console.warn("THREE.WebGLRenderTarget: .anisotropy is now .texture.anisotropy."),this.texture.anisotropy},set:function(s){console.warn("THREE.WebGLRenderTarget: .anisotropy is now .texture.anisotropy."),this.texture.anisotropy=s}},offset:{get:function(){return console.warn("THREE.WebGLRenderTarget: .offset is now .texture.offset."),this.texture.offset},set:function(s){console.warn("THREE.WebGLRenderTarget: .offset is now .texture.offset."),this.texture.offset=s}},repeat:{get:function(){return console.warn("THREE.WebGLRenderTarget: .repeat is now .texture.repeat."),this.texture.repeat},set:function(s){console.warn("THREE.WebGLRenderTarget: .repeat is now .texture.repeat."),this.texture.repeat=s}},format:{get:function(){return console.warn("THREE.WebGLRenderTarget: .format is now .texture.format."),this.texture.format},set:function(s){console.warn("THREE.WebGLRenderTarget: .format is now .texture.format."),this.texture.format=s}},type:{get:function(){return console.warn("THREE.WebGLRenderTarget: .type is now .texture.type."),this.texture.type},set:function(s){console.warn("THREE.WebGLRenderTarget: .type is now .texture.type."),this.texture.type=s}},generateMipmaps:{get:function(){return console.warn("THREE.WebGLRenderTarget: .generateMipmaps is now .texture.generateMipmaps."),this.texture.generateMipmaps},set:function(s){console.warn("THREE.WebGLRenderTarget: .generateMipmaps is now .texture.generateMipmaps."),this.texture.generateMipmaps=s}}}),class extends Re{constructor(s){super(),this.type="Audio",this.listener=s,this.context=s.context,this.gain=this.context.createGain(),this.gain.connect(s.getInput()),this.autoplay=!1,this.buffer=null,this.detune=0,this.loop=!1,this.loopStart=0,this.loopEnd=0,this.offset=0,this.duration=void 0,this.playbackRate=1,this.isPlaying=!1,this.hasPlaybackControl=!0,this.source=null,this.sourceType="empty",this._startedAt=0,this._progress=0,this._connected=!1,this.filters=[]}getOutput(){return this.gain}setNodeSource(s){return this.hasPlaybackControl=!1,this.sourceType="audioNode",this.source=s,this.connect(),this}setMediaElementSource(s){return this.hasPlaybackControl=!1,this.sourceType="mediaNode",this.source=this.context.createMediaElementSource(s),this.connect(),this}setMediaStreamSource(s){return this.hasPlaybackControl=!1,this.sourceType="mediaStreamNode",this.source=this.context.createMediaStreamSource(s),this.connect(),this}setBuffer(s){return this.buffer=s,this.sourceType="buffer",this.autoplay&&this.play(),this}play(s=0){if(this.isPlaying===!0)return void console.warn("THREE.Audio: Audio is already playing.");if(this.hasPlaybackControl===!1)return void console.warn("THREE.Audio: this Audio has no playback control.");this._startedAt=this.context.currentTime+s;const e=this.context.createBufferSource();return e.buffer=this.buffer,e.loop=this.loop,e.loopStart=this.loopStart,e.loopEnd=this.loopEnd,e.onended=this.onEnded.bind(this),e.start(this._startedAt,this._progress+this.offset,this.duration),this.isPlaying=!0,this.source=e,this.setDetune(this.detune),this.setPlaybackRate(this.playbackRate),this.connect()}pause(){if(this.hasPlaybackControl!==!1)return this.isPlaying===!0&&(this._progress+=Math.max(this.context.currentTime-this._startedAt,0)*this.playbackRate,this.loop===!0&&(this._progress=this._progress%(this.duration||this.buffer.duration)),this.source.stop(),this.source.onended=null,this.isPlaying=!1),this;console.warn("THREE.Audio: this Audio has no playback control.")}stop(){if(this.hasPlaybackControl!==!1)return this._progress=0,this.source.stop(),this.source.onended=null,this.isPlaying=!1,this;console.warn("THREE.Audio: this Audio has no playback control.")}connect(){if(this.filters.length>0){this.source.connect(this.filters[0]);for(let s=1,e=this.filters.length;s<e;s++)this.filters[s-1].connect(this.filters[s]);this.filters[this.filters.length-1].connect(this.getOutput())}else this.source.connect(this.getOutput());return this._connected=!0,this}disconnect(){if(this.filters.length>0){this.source.disconnect(this.filters[0]);for(let s=1,e=this.filters.length;s<e;s++)this.filters[s-1].disconnect(this.filters[s]);this.filters[this.filters.length-1].disconnect(this.getOutput())}else this.source.disconnect(this.getOutput());return this._connected=!1,this}getFilters(){return this.filters}setFilters(s){return s||(s=[]),this._connected===!0?(this.disconnect(),this.filters=s.slice(),this.connect()):this.filters=s.slice(),this}setDetune(s){if(this.detune=s,this.source.detune!==void 0)return this.isPlaying===!0&&this.source.detune.setTargetAtTime(this.detune,this.context.currentTime,.01),this}getDetune(){return this.detune}getFilter(){return this.getFilters()[0]}setFilter(s){return this.setFilters(s?[s]:[])}setPlaybackRate(s){if(this.hasPlaybackControl!==!1)return this.playbackRate=s,this.isPlaying===!0&&this.source.playbackRate.setTargetAtTime(this.playbackRate,this.context.currentTime,.01),this;console.warn("THREE.Audio: this Audio has no playback control.")}getPlaybackRate(){return this.playbackRate}onEnded(){this.isPlaying=!1}getLoop(){return this.hasPlaybackControl===!1?(console.warn("THREE.Audio: this Audio has no playback control."),!1):this.loop}setLoop(s){if(this.hasPlaybackControl!==!1)return this.loop=s,this.isPlaying===!0&&(this.source.loop=this.loop),this;console.warn("THREE.Audio: this Audio has no playback control.")}setLoopStart(s){return this.loopStart=s,this}setLoopEnd(s){return this.loopEnd=s,this}getVolume(){return this.gain.gain.value}setVolume(s){return this.gain.gain.setTargetAtTime(s,this.context.currentTime,.01),this}}.prototype.load=function(s){console.warn("THREE.Audio: .load has been deprecated. Use THREE.AudioLoader instead.");const e=this;return new ty().load(s,function(t){e.setBuffer(t)}),this},Ss.prototype.updateCubeMap=function(s,e){return console.warn("THREE.CubeCamera: .updateCubeMap() is now .update()."),this.update(s,e)},Ss.prototype.clear=function(s,e,t,n){return console.warn("THREE.CubeCamera: .clear() is now .renderTarget.clear()."),this.renderTarget.clear(s,e,t,n)},Qi.crossOrigin=void 0,Qi.loadTexture=function(s,e,t,n){console.warn("THREE.ImageUtils.loadTexture has been deprecated. Use THREE.TextureLoader() instead.");const i=new mo;i.setCrossOrigin(this.crossOrigin);const r=i.load(s,t,void 0,n);return e&&(r.mapping=e),r},Qi.loadTextureCube=function(s,e,t,n){console.warn("THREE.ImageUtils.loadTextureCube has been deprecated. Use THREE.CubeTextureLoader() instead.");const i=new Kv;i.setCrossOrigin(this.crossOrigin);const r=i.load(s,t,void 0,n);return e&&(r.mapping=e),r},Qi.loadCompressedTexture=function(){console.error("THREE.ImageUtils.loadCompressedTexture has been removed. Use THREE.DDSLoader instead.")},Qi.loadCompressedTextureCube=function(){console.error("THREE.ImageUtils.loadCompressedTextureCube has been removed. Use THREE.DDSLoader instead.")},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"136"}})),typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="136");/* @license
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
 */const wf=navigator.xr!=null&&self.XRSession!=null&&navigator.xr.isSessionSupported!=null,_f=wf&&self.XRSession.prototype.requestHitTestSource,al=self.ResizeObserver!=null,ol=self.IntersectionObserver!=null,Mf=_f;(()=>{const s=navigator.userAgent||navigator.vendor||self.opera;/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(s)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(s.substr(0,4))})();const py=/android/i.test(navigator.userAgent),Vu=(()=>{const s=document.createElement("a");return Boolean(s.relList&&s.relList.supports&&s.relList.supports("ar"))})(),my=/firefox/i.test(navigator.userAgent),fy=/OculusBrowser/.test(navigator.userAgent),gy=py&&!my&&!fy;/* @license
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
 *//* @license
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
 */const vy=ks`
<style>
:host {
  display: block;
  position: relative;
  contain: strict;
  width: 300px;
  height: 150px;
}

/* NOTE: This ruleset is our integration surface area with the
 * :focus-visible polyfill.
 *
 * @see https://github.com/WICG/focus-visible/pull/196 */
:host([data-js-focus-visible]:focus:not(.focus-visible)),
:host([data-js-focus-visible]) :focus:not(.focus-visible) {
  outline: none;
}

.container {
  position: relative;
}

.userInput {
  width: 100%;
  height: 100%;
  display: block;
  position: relative;
  overflow: hidden;
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

canvas.show {
  display: block;
}

/* Adapted from HTML5 Boilerplate
 *
 * @see https://github.com/h5bp/html5-boilerplate/blob/ceb4620c78fc82e13534fc44202a3f168754873f/dist/css/main.css#L122-L133 */
.screen-reader-only {
  border: 0;
  clip: rect(0, 0, 0, 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
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
  opacity: 0;
  transition: opacity 0.3s 0.3s;
  background-color: inherit;
}

.slot.poster.show {
  opacity: 1;
  transition: none;
}

.slot.poster.quick {
  transition: none;
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
  background-color: var(--poster-color, #fff);
  background-image: var(--poster-image, none);
}

#default-progress-bar {
  display: block;
  position: relative;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

#default-progress-bar > .mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--progress-mask, #fff);
  transition: opacity 0.3s;
  opacity: 0.2;
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

.slot.interaction-prompt {
  display: var(--interaction-prompt-display, flex);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  align-items: center;
  justify-content: center;

  opacity: 0;
  will-change: opacity;
  overflow: hidden;
  transition: opacity 0.3s;
}

.slot.interaction-prompt.visible {
  opacity: 1;
}

.slot.interaction-prompt > .animated-container {
  will-change: transform, opacity;
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
  top: 16px;
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
      aria-label="A depiction of a 3D model"
      aria-live="polite">
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
      <button type="button" id="default-poster" aria-hidden="true" aria-label="Activate to view in 3D!"></button>
    </slot>
  </div>

  <div class="slot ar-button">
    <slot name="ar-button">
      <a id="default-ar-button" part="default-ar-button" class="fab"
          tabindex="2"
          aria-label="View this 3D model up close">
        ${ks`
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
</svg>`}
      </a>
    </slot>
  </div>

  <div class="slot interaction-prompt">
    <div class="animated-container">
      <slot name="interaction-prompt" aria-hidden="true">
        ${ks`
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
</svg>`}
      </slot>
    </div>
  </div>

  <div class="slot default">
    <slot></slot>

    <div class="slot progress-bar">
      <slot name="progress-bar">
        <div id="default-progress-bar" aria-hidden="true">
          <div class="mask" part="default-progress-mask"></div>
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
          ${ks`
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
</svg>`}
        </a>
      </slot>
    </div>
  </div>
</div>`,ll=new WeakMap;function yy(){let s,e;function t(n,i,r,a,o,l){const c=l.num_components(),h=r.num_points()*c,u=h*o.BYTES_PER_ELEMENT,d=function(f,g){switch(g){case Float32Array:return f.DT_FLOAT32;case Int8Array:return f.DT_INT8;case Int16Array:return f.DT_INT16;case Int32Array:return f.DT_INT32;case Uint8Array:return f.DT_UINT8;case Uint16Array:return f.DT_UINT16;case Uint32Array:return f.DT_UINT32}}(n,o),p=n._malloc(u);i.GetAttributeDataArrayForAllPoints(r,l,d,u,p);const m=new o(n.HEAPF32.buffer,p,h).slice();return n._free(p),{name:a,array:m,itemSize:c}}onmessage=function(n){const i=n.data;switch(i.type){case"init":s=i.decoderConfig,e=new Promise(function(o){s.onModuleLoaded=function(l){o({draco:l})},DracoDecoderModule(s)});break;case"decode":const r=i.buffer,a=i.taskConfig;e.then(o=>{const l=o.draco,c=new l.Decoder,h=new l.DecoderBuffer;h.Init(new Int8Array(r),r.byteLength);try{const u=function(p,m,f,g){const x=g.attributeIDs,v=g.attributeTypes;let y,b;const w=m.GetEncodedGeometryType(f);if(w===p.TRIANGULAR_MESH)y=new p.Mesh,b=m.DecodeBufferToMesh(f,y);else{if(w!==p.POINT_CLOUD)throw new Error("THREE.DRACOLoader: Unexpected geometry type.");y=new p.PointCloud,b=m.DecodeBufferToPointCloud(f,y)}if(!b.ok()||y.ptr===0)throw new Error("THREE.DRACOLoader: Decoding failed: "+b.error_msg());const S={index:null,attributes:[]};for(const M in x){const L=self[v[M]];let I,P;if(g.useUniqueIDs)P=x[M],I=m.GetAttributeByUniqueId(y,P);else{if(P=m.GetAttributeId(y,p[x[M]]),P===-1)continue;I=m.GetAttribute(y,P)}S.attributes.push(t(p,m,y,M,L,I))}return w===p.TRIANGULAR_MESH&&(S.index=function(M,L,I){const P=3*I.num_faces(),N=4*P,W=M._malloc(N);L.GetTrianglesUInt32Array(I,N,W);const G=new Uint32Array(M.HEAPF32.buffer,W,P).slice();return M._free(W),{array:G,itemSize:1}}(p,m,y)),p.destroy(y),S}(l,c,h,a),d=u.attributes.map(p=>p.array.buffer);u.index&&d.push(u.index.array.buffer),self.postMessage({type:"decode",id:i.id,geometry:u},d)}catch(u){console.error(u),self.postMessage({type:"error",id:i.id,error:u.message})}finally{l.destroy(h),l.destroy(c)}})}}}class xy extends Ft{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new My(t)}),this.register(function(t){return new Ly(t)}),this.register(function(t){return new Cy(t)}),this.register(function(t){return new Sy(t)}),this.register(function(t){return new Ty(t)}),this.register(function(t){return new Ey(t)}),this.register(function(t){return new Ay(t)}),this.register(function(t){return new Ry(t)}),this.register(function(t){return new wy(t)}),this.register(function(t){return new Py(t)})}load(e,t,n,i){const r=this;let a;a=this.resourcePath!==""?this.resourcePath:this.path!==""?this.path:$n.extractUrlBase(e),this.manager.itemStart(e);const o=function(c){i?i(c):console.error(c),r.manager.itemError(e),r.manager.itemEnd(e)},l=new Ln(this.manager);l.setPath(this.path),l.setResponseType("arraybuffer"),l.setRequestHeader(this.requestHeader),l.setWithCredentials(this.withCredentials),l.load(e,function(c){try{r.parse(c,a,function(h){t(h),r.manager.itemEnd(e)},o)}catch(h){o(h)}},n,o)}setDRACOLoader(e){return this.dracoLoader=e,this}setDDSLoader(){throw new Error('THREE.GLTFLoader: "MSFT_texture_dds" no longer supported. Please update to "KHR_texture_basisu".')}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,i){let r;const a={},o={};if(typeof e=="string")r=e;else if($n.decodeText(new Uint8Array(e,0,4))===Sf){try{a[Se.KHR_BINARY_GLTF]=new Ny(e)}catch(h){return void(i&&i(h))}r=a[Se.KHR_BINARY_GLTF].content}else r=$n.decodeText(new Uint8Array(e));const l=JSON.parse(r);if(l.asset===void 0||l.asset.version[0]<2)return void(i&&i(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported.")));const c=new Qy(l,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});c.fileLoader.setRequestHeader(this.requestHeader);for(let h=0;h<this.pluginCallbacks.length;h++){const u=this.pluginCallbacks[h](c);o[u.name]=u,a[u.name]=!0}if(l.extensionsUsed)for(let h=0;h<l.extensionsUsed.length;++h){const u=l.extensionsUsed[h],d=l.extensionsRequired||[];switch(u){case Se.KHR_MATERIALS_UNLIT:a[u]=new _y;break;case Se.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS:a[u]=new Uy;break;case Se.KHR_DRACO_MESH_COMPRESSION:a[u]=new Fy(l,this.dracoLoader);break;case Se.KHR_TEXTURE_TRANSFORM:a[u]=new Oy;break;case Se.KHR_MESH_QUANTIZATION:a[u]=new ky;break;default:d.indexOf(u)>=0&&o[u]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+u+'".')}}c.setExtensions(a),c.setPlugins(o),c.parse(n,i)}parseAsync(e,t){const n=this;return new Promise(function(i,r){n.parse(e,t,i,r)})}}function by(){let s={};return{get:function(e){return s[e]},add:function(e,t){s[e]=t},remove:function(e){delete s[e]},removeAll:function(){s={}}}}const Se={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS:"KHR_materials_pbrSpecularGlossiness",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression"};class wy{constructor(e){this.parser=e,this.name=Se.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){const e=this.parser,t=this.parser.json.nodes||[];for(let n=0,i=t.length;n<i;n++){const r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){const t=this.parser,n="light:"+e;let i=t.cache.get(n);if(i)return i;const r=t.json,a=((r.extensions&&r.extensions[this.name]||{}).lights||[])[e];let o;const l=new le(16777215);a.color!==void 0&&l.fromArray(a.color);const c=a.range!==void 0?a.range:0;switch(a.type){case"directional":o=new go(l),o.target.position.set(0,0,-1),o.add(o.target);break;case"point":o=new fo(l),o.distance=c;break;case"spot":o=new pf(l),o.distance=c,a.spot=a.spot||{},a.spot.innerConeAngle=a.spot.innerConeAngle!==void 0?a.spot.innerConeAngle:0,a.spot.outerConeAngle=a.spot.outerConeAngle!==void 0?a.spot.outerConeAngle:Math.PI/4,o.angle=a.spot.outerConeAngle,o.penumbra=1-a.spot.innerConeAngle/a.spot.outerConeAngle,o.target.position.set(0,0,-1),o.add(o.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+a.type)}return o.position.set(0,0,0),o.decay=2,a.intensity!==void 0&&(o.intensity=a.intensity),o.name=t.createUniqueName(a.name||"light_"+e),i=Promise.resolve(o),t.cache.add(n,i),i}createNodeAttachment(e){const t=this,n=this.parser,i=n.json.nodes[e],r=(i.extensions&&i.extensions[this.name]||{}).light;return r===void 0?null:this._loadLight(r).then(function(a){return n._getNodeRef(t.cache,r,a)})}}class _y{constructor(){this.name=Se.KHR_MATERIALS_UNLIT}getMaterialType(){return jt}extendParams(e,t,n){const i=[];e.color=new le(1,1,1),e.opacity=1;const r=t.pbrMetallicRoughness;if(r){if(Array.isArray(r.baseColorFactor)){const a=r.baseColorFactor;e.color.fromArray(a),e.opacity=a[3]}r.baseColorTexture!==void 0&&i.push(n.assignTexture(e,"map",r.baseColorTexture))}return Promise.all(i)}}class My{constructor(e){this.parser=e,this.name=Se.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){const t=this.parser.json.materials[e];return t.extensions&&t.extensions[this.name]?Ei:null}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],a=i.extensions[this.name];if(a.clearcoatFactor!==void 0&&(t.clearcoat=a.clearcoatFactor),a.clearcoatTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatMap",a.clearcoatTexture)),a.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=a.clearcoatRoughnessFactor),a.clearcoatRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatRoughnessMap",a.clearcoatRoughnessTexture)),a.clearcoatNormalTexture!==void 0&&(r.push(n.assignTexture(t,"clearcoatNormalMap",a.clearcoatNormalTexture)),a.clearcoatNormalTexture.scale!==void 0)){const o=a.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new $(o,o)}return Promise.all(r)}}class Sy{constructor(e){this.parser=e,this.name=Se.KHR_MATERIALS_SHEEN}getMaterialType(e){const t=this.parser.json.materials[e];return t.extensions&&t.extensions[this.name]?Ei:null}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[];t.sheenColor=new le(0,0,0),t.sheenRoughness=0,t.sheen=1;const a=i.extensions[this.name];return a.sheenColorFactor!==void 0&&t.sheenColor.fromArray(a.sheenColorFactor),a.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=a.sheenRoughnessFactor),a.sheenColorTexture!==void 0&&r.push(n.assignTexture(t,"sheenColorMap",a.sheenColorTexture)),a.sheenRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"sheenRoughnessMap",a.sheenRoughnessTexture)),Promise.all(r)}}class Ty{constructor(e){this.parser=e,this.name=Se.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){const t=this.parser.json.materials[e];return t.extensions&&t.extensions[this.name]?Ei:null}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],a=i.extensions[this.name];return a.transmissionFactor!==void 0&&(t.transmission=a.transmissionFactor),a.transmissionTexture!==void 0&&r.push(n.assignTexture(t,"transmissionMap",a.transmissionTexture)),Promise.all(r)}}class Ey{constructor(e){this.parser=e,this.name=Se.KHR_MATERIALS_VOLUME}getMaterialType(e){const t=this.parser.json.materials[e];return t.extensions&&t.extensions[this.name]?Ei:null}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],a=i.extensions[this.name];t.thickness=a.thicknessFactor!==void 0?a.thicknessFactor:0,a.thicknessTexture!==void 0&&r.push(n.assignTexture(t,"thicknessMap",a.thicknessTexture)),t.attenuationDistance=a.attenuationDistance||0;const o=a.attenuationColor||[1,1,1];return t.attenuationColor=new le(o[0],o[1],o[2]),Promise.all(r)}}class Ay{constructor(e){this.parser=e,this.name=Se.KHR_MATERIALS_IOR}getMaterialType(e){const t=this.parser.json.materials[e];return t.extensions&&t.extensions[this.name]?Ei:null}extendMaterialParams(e,t){const n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return Promise.resolve();const i=n.extensions[this.name];return t.ior=i.ior!==void 0?i.ior:1.5,Promise.resolve()}}class Ry{constructor(e){this.parser=e,this.name=Se.KHR_MATERIALS_SPECULAR}getMaterialType(e){const t=this.parser.json.materials[e];return t.extensions&&t.extensions[this.name]?Ei:null}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],a=i.extensions[this.name];t.specularIntensity=a.specularFactor!==void 0?a.specularFactor:1,a.specularTexture!==void 0&&r.push(n.assignTexture(t,"specularIntensityMap",a.specularTexture));const o=a.specularColorFactor||[1,1,1];return t.specularColor=new le(o[0],o[1],o[2]),a.specularColorTexture!==void 0&&r.push(n.assignTexture(t,"specularColorMap",a.specularColorTexture).then(function(l){l.encoding=3001})),Promise.all(r)}}class Ly{constructor(e){this.parser=e,this.name=Se.KHR_TEXTURE_BASISU}loadTexture(e){const t=this.parser,n=t.json,i=n.textures[e];if(!i.extensions||!i.extensions[this.name])return null;const r=i.extensions[this.name],a=n.images[r.source],o=t.options.ktx2Loader;if(!o){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,a,o)}}class Cy{constructor(e){this.parser=e,this.name=Se.EXT_TEXTURE_WEBP,this.isSupported=null}loadTexture(e){const t=this.name,n=this.parser,i=n.json,r=i.textures[e];if(!r.extensions||!r.extensions[t])return null;const a=r.extensions[t],o=i.images[a.source];let l=n.textureLoader;if(o.uri){const c=n.options.manager.getHandler(o.uri);c!==null&&(l=c)}return this.detectSupport().then(function(c){if(c)return n.loadTextureImage(e,o,l);if(i.extensionsRequired&&i.extensionsRequired.indexOf(t)>=0)throw new Error("THREE.GLTFLoader: WebP required by asset but unsupported.");return n.loadTexture(e)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(e){const t=new Image;t.src="data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",t.onload=t.onerror=function(){e(t.height===1)}})),this.isSupported}}class Py{constructor(e){this.name=Se.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){const t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){const i=n.extensions[this.name],r=this.parser.getDependency("buffer",i.buffer),a=this.parser.options.meshoptDecoder;if(!a||!a.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return Promise.all([r,a.ready]).then(function(o){const l=i.byteOffset||0,c=i.byteLength||0,h=i.count,u=i.byteStride,d=new ArrayBuffer(h*u),p=new Uint8Array(o[0],l,c);return a.decodeGltfBuffer(new Uint8Array(d),h,u,p,i.mode,i.filter),d})}return null}}const Sf="glTF",Iy=1313821514,Dy=5130562;class Ny{constructor(e){this.name=Se.KHR_BINARY_GLTF,this.content=null,this.body=null;const t=new DataView(e,0,12);if(this.header={magic:$n.decodeText(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==Sf)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");const n=this.header.length-12,i=new DataView(e,12);let r=0;for(;r<n;){const a=i.getUint32(r,!0);r+=4;const o=i.getUint32(r,!0);if(r+=4,o===Iy){const l=new Uint8Array(e,12+r,a);this.content=$n.decodeText(l)}else if(o===Dy){const l=12+r;this.body=e.slice(l,l+a)}r+=a}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}}class Fy{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=Se.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){const n=this.json,i=this.dracoLoader,r=e.extensions[this.name].bufferView,a=e.extensions[this.name].attributes,o={},l={},c={};for(const h in a){const u=Nc[h]||h.toLowerCase();o[u]=a[h]}for(const h in e.attributes){const u=Nc[h]||h.toLowerCase();if(a[h]!==void 0){const d=n.accessors[e.attributes[h]],p=Cs[d.componentType];c[u]=p,l[u]=d.normalized===!0}}return t.getDependency("bufferView",r).then(function(h){return new Promise(function(u){i.decodeDracoFile(h,function(d){for(const p in d.attributes){const m=d.attributes[p],f=l[p];f!==void 0&&(m.normalized=f)}u(d)},o,c)})})}}class Oy{constructor(){this.name=Se.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return t.texCoord!==void 0&&console.warn('THREE.GLTFLoader: Custom UV sets in "'+this.name+'" extension not yet supported.'),t.offset===void 0&&t.rotation===void 0&&t.scale===void 0||(e=e.clone(),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0),e}}class Dc extends In{constructor(e){super(),this.isGLTFSpecularGlossinessMaterial=!0;const t=["#ifdef USE_SPECULARMAP","	uniform sampler2D specularMap;","#endif"].join(`
`),n=["#ifdef USE_GLOSSINESSMAP","	uniform sampler2D glossinessMap;","#endif"].join(`
`),i=["vec3 specularFactor = specular;","#ifdef USE_SPECULARMAP","	vec4 texelSpecular = texture2D( specularMap, vUv );","	texelSpecular = sRGBToLinear( texelSpecular );","	// reads channel RGB, compatible with a glTF Specular-Glossiness (RGBA) texture","	specularFactor *= texelSpecular.rgb;","#endif"].join(`
`),r=["float glossinessFactor = glossiness;","#ifdef USE_GLOSSINESSMAP","	vec4 texelGlossiness = texture2D( glossinessMap, vUv );","	// reads channel A, compatible with a glTF Specular-Glossiness (RGBA) texture","	glossinessFactor *= texelGlossiness.a;","#endif"].join(`
`),a=["PhysicalMaterial material;","material.diffuseColor = diffuseColor.rgb * ( 1. - max( specularFactor.r, max( specularFactor.g, specularFactor.b ) ) );","vec3 dxy = max( abs( dFdx( geometryNormal ) ), abs( dFdy( geometryNormal ) ) );","float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );","material.roughness = max( 1.0 - glossinessFactor, 0.0525 ); // 0.0525 corresponds to the base mip of a 256 cubemap.","material.roughness += geometryRoughness;","material.roughness = min( material.roughness, 1.0 );","material.specularColor = specularFactor;"].join(`
`),o={specular:{value:new le().setHex(16777215)},glossiness:{value:1},specularMap:{value:null},glossinessMap:{value:null}};this._extraUniforms=o,this.onBeforeCompile=function(l){for(const c in o)l.uniforms[c]=o[c];l.fragmentShader=l.fragmentShader.replace("uniform float roughness;","uniform vec3 specular;").replace("uniform float metalness;","uniform float glossiness;").replace("#include <roughnessmap_pars_fragment>",t).replace("#include <metalnessmap_pars_fragment>",n).replace("#include <roughnessmap_fragment>",i).replace("#include <metalnessmap_fragment>",r).replace("#include <lights_physical_fragment>",a)},Object.defineProperties(this,{specular:{get:function(){return o.specular.value},set:function(l){o.specular.value=l}},specularMap:{get:function(){return o.specularMap.value},set:function(l){o.specularMap.value=l,l?this.defines.USE_SPECULARMAP="":delete this.defines.USE_SPECULARMAP}},glossiness:{get:function(){return o.glossiness.value},set:function(l){o.glossiness.value=l}},glossinessMap:{get:function(){return o.glossinessMap.value},set:function(l){o.glossinessMap.value=l,l?(this.defines.USE_GLOSSINESSMAP="",this.defines.USE_UV=""):(delete this.defines.USE_GLOSSINESSMAP,delete this.defines.USE_UV)}}}),delete this.metalness,delete this.roughness,delete this.metalnessMap,delete this.roughnessMap,this.setValues(e)}copy(e){return super.copy(e),this.specularMap=e.specularMap,this.specular.copy(e.specular),this.glossinessMap=e.glossinessMap,this.glossiness=e.glossiness,delete this.metalness,delete this.roughness,delete this.metalnessMap,delete this.roughnessMap,this}}class Uy{constructor(){this.name=Se.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS,this.specularGlossinessParams=["color","map","lightMap","lightMapIntensity","aoMap","aoMapIntensity","emissive","emissiveIntensity","emissiveMap","bumpMap","bumpScale","normalMap","normalMapType","displacementMap","displacementScale","displacementBias","specularMap","specular","glossinessMap","glossiness","alphaMap","envMap","envMapIntensity","refractionRatio"]}getMaterialType(){return Dc}extendParams(e,t,n){const i=t.extensions[this.name];e.color=new le(1,1,1),e.opacity=1;const r=[];if(Array.isArray(i.diffuseFactor)){const a=i.diffuseFactor;e.color.fromArray(a),e.opacity=a[3]}if(i.diffuseTexture!==void 0&&r.push(n.assignTexture(e,"map",i.diffuseTexture)),e.emissive=new le(0,0,0),e.glossiness=i.glossinessFactor!==void 0?i.glossinessFactor:1,e.specular=new le(1,1,1),Array.isArray(i.specularFactor)&&e.specular.fromArray(i.specularFactor),i.specularGlossinessTexture!==void 0){const a=i.specularGlossinessTexture;r.push(n.assignTexture(e,"glossinessMap",a)),r.push(n.assignTexture(e,"specularMap",a))}return Promise.all(r)}createMaterial(e){const t=new Dc(e);return t.fog=!0,t.color=e.color,t.map=e.map===void 0?null:e.map,t.lightMap=null,t.lightMapIntensity=1,t.aoMap=e.aoMap===void 0?null:e.aoMap,t.aoMapIntensity=1,t.emissive=e.emissive,t.emissiveIntensity=1,t.emissiveMap=e.emissiveMap===void 0?null:e.emissiveMap,t.bumpMap=e.bumpMap===void 0?null:e.bumpMap,t.bumpScale=1,t.normalMap=e.normalMap===void 0?null:e.normalMap,t.normalMapType=0,e.normalScale&&(t.normalScale=e.normalScale),t.displacementMap=null,t.displacementScale=1,t.displacementBias=0,t.specularMap=e.specularMap===void 0?null:e.specularMap,t.specular=e.specular,t.glossinessMap=e.glossinessMap===void 0?null:e.glossinessMap,t.glossiness=e.glossiness,t.alphaMap=null,t.envMap=e.envMap===void 0?null:e.envMap,t.envMapIntensity=1,t.refractionRatio=.98,t}}class ky{constructor(){this.name=Se.KHR_MESH_QUANTIZATION}}class gi extends An{constructor(e,t,n,i){super(e,t,n,i)}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i*3+i;for(let a=0;a!==i;a++)t[a]=n[r+a];return t}}gi.prototype.beforeStart_=gi.prototype.copySampleValue_,gi.prototype.afterEnd_=gi.prototype.copySampleValue_,gi.prototype.interpolate_=function(s,e,t,n){const i=this.resultBuffer,r=this.sampleValues,a=this.valueSize,o=2*a,l=3*a,c=n-e,h=(t-e)/c,u=h*h,d=u*h,p=s*l,m=p-l,f=-2*d+3*u,g=d-u,x=1-f,v=g-u+h;for(let y=0;y!==a;y++){const b=r[m+y+a],w=r[m+y+o]*c,S=r[p+y+a],M=r[p+y]*c;i[y]=x*b+v*w+f*S+g*M}return i};const zy=new vt;class By extends gi{interpolate_(e,t,n,i){const r=super.interpolate_(e,t,n,i);return zy.fromArray(r).normalize().toArray(r),r}}const Hy=0,Vy=1,Gy=2,Wy=3,jy=4,Gu=5,Wu=6,Cs={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},ju={9728:1003,9729:1006,9984:1004,9985:1007,9986:1005,9987:1008},qu={33071:1001,33648:1002,10497:1e3},Xu={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},Nc={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv2",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},Gi={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},qy={CUBICSPLINE:void 0,LINEAR:2301,STEP:2300},Xy="OPAQUE",Yy="MASK",Zy="BLEND";function Jy(s){return s.DefaultMaterial===void 0&&(s.DefaultMaterial=new In({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:0})),s.DefaultMaterial}function Or(s,e,t){for(const n in t.extensions)s[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function mi(s,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(s.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function $y(s,e){if(s.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)s.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){const t=e.extras.targetNames;if(s.morphTargetInfluences.length===t.length){s.morphTargetDictionary={};for(let n=0,i=t.length;n<i;n++)s.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function Ky(s){const e=s.extensions&&s.extensions[Se.KHR_DRACO_MESH_COMPRESSION];let t;return t=e?"draco:"+e.bufferView+":"+e.indices+":"+Yu(e.attributes):s.indices+":"+Yu(s.attributes)+":"+s.mode,t}function Yu(s){let e="";const t=Object.keys(s).sort();for(let n=0,i=t.length;n<i;n++)e+=t[n]+":"+s[t[n]]+";";return e}function Fc(s){switch(s){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}class Qy{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new by,this.associations=new Map,this.primitiveCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.textureCache={},this.nodeNamesUsed={},typeof createImageBitmap<"u"&&/Firefox|Safari/.test(navigator.userAgent)===!1?this.textureLoader=new vf(this.options.manager):this.textureLoader=new mo(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new Ln(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){const n=this,i=this.json,r=this.extensions;this.cache.removeAll(),this._invokeAll(function(a){return a._markDefs&&a._markDefs()}),Promise.all(this._invokeAll(function(a){return a.beforeRoot&&a.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(a){const o={scene:a[0][i.scene||0],scenes:a[0],animations:a[1],cameras:a[2],asset:i.asset,parser:n,userData:{}};Or(r,o,i),mi(o,i),Promise.all(n._invokeAll(function(l){return l.afterRoot&&l.afterRoot(o)})).then(function(){e(o)})}).catch(t)}_markDefs(){const e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let i=0,r=t.length;i<r;i++){const a=t[i].joints;for(let o=0,l=a.length;o<l;o++)e[a[o]].isBone=!0}for(let i=0,r=e.length;i<r;i++){const a=e[i];a.mesh!==void 0&&(this._addNodeRef(this.meshCache,a.mesh),a.skin!==void 0&&(n[a.mesh].isSkinnedMesh=!0)),a.camera!==void 0&&this._addNodeRef(this.cameraCache,a.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;const i=n.clone(),r=(a,o)=>{const l=this.associations.get(a);l!=null&&this.associations.set(o,l);for(const[c,h]of a.children.entries())r(h,o.children[c])};return r(n,i),i.name+="_instance_"+e.uses[t]++,i}_invokeOne(e){const t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){const i=e(t[n]);if(i)return i}return null}_invokeAll(e){const t=Object.values(this.plugins);t.unshift(this);const n=[];for(let i=0;i<t.length;i++){const r=e(t[i]);r&&n.push(r)}return n}getDependency(e,t){const n=e+":"+t;let i=this.cache.get(n);if(!i){switch(e){case"scene":i=this.loadScene(t);break;case"node":i=this.loadNode(t);break;case"mesh":i=this._invokeOne(function(r){return r.loadMesh&&r.loadMesh(t)});break;case"accessor":i=this.loadAccessor(t);break;case"bufferView":i=this._invokeOne(function(r){return r.loadBufferView&&r.loadBufferView(t)});break;case"buffer":i=this.loadBuffer(t);break;case"material":i=this._invokeOne(function(r){return r.loadMaterial&&r.loadMaterial(t)});break;case"texture":i=this._invokeOne(function(r){return r.loadTexture&&r.loadTexture(t)});break;case"skin":i=this.loadSkin(t);break;case"animation":i=this.loadAnimation(t);break;case"camera":i=this.loadCamera(t);break;default:throw new Error("Unknown type: "+e)}this.cache.add(n,i)}return i}getDependencies(e){let t=this.cache.get(e);if(!t){const n=this,i=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(i.map(function(r,a){return n.getDependency(e,a)})),this.cache.add(e,t)}return t}loadBuffer(e){const t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[Se.KHR_BINARY_GLTF].body);const i=this.options;return new Promise(function(r,a){n.load($n.resolveURL(t.uri,i.path),r,void 0,function(){a(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){const t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){const i=t.byteLength||0,r=t.byteOffset||0;return n.slice(r,r+i)})}loadAccessor(e){const t=this,n=this.json,i=this.json.accessors[e];if(i.bufferView===void 0&&i.sparse===void 0)return Promise.resolve(null);const r=[];return i.bufferView!==void 0?r.push(this.getDependency("bufferView",i.bufferView)):r.push(null),i.sparse!==void 0&&(r.push(this.getDependency("bufferView",i.sparse.indices.bufferView)),r.push(this.getDependency("bufferView",i.sparse.values.bufferView))),Promise.all(r).then(function(a){const o=a[0],l=Xu[i.type],c=Cs[i.componentType],h=c.BYTES_PER_ELEMENT,u=h*l,d=i.byteOffset||0,p=i.bufferView!==void 0?n.bufferViews[i.bufferView].byteStride:void 0,m=i.normalized===!0;let f,g;if(p&&p!==u){const x=Math.floor(d/p),v="InterleavedBuffer:"+i.bufferView+":"+i.componentType+":"+x+":"+i.count;let y=t.cache.get(v);y||(f=new c(o,x*p,i.count*p/h),y=new hr(f,p/h),t.cache.add(v,y)),g=new ur(y,l,d%p/h,m)}else f=o===null?new c(i.count*l):new c(o,d,i.count*l),g=new ke(f,l,m);if(i.sparse!==void 0){const x=Xu.SCALAR,v=Cs[i.sparse.indices.componentType],y=i.sparse.indices.byteOffset||0,b=i.sparse.values.byteOffset||0,w=new v(a[1],y,i.sparse.count*x),S=new c(a[2],b,i.sparse.count*l);o!==null&&(g=new ke(g.array.slice(),g.itemSize,g.normalized));for(let M=0,L=w.length;M<L;M++){const I=w[M];if(g.setX(I,S[M*l]),l>=2&&g.setY(I,S[M*l+1]),l>=3&&g.setZ(I,S[M*l+2]),l>=4&&g.setW(I,S[M*l+3]),l>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}}return g})}loadTexture(e){const t=this.json,n=this.options,i=t.textures[e],r=t.images[i.source];let a=this.textureLoader;if(r.uri){const o=n.manager.getHandler(r.uri);o!==null&&(a=o)}return this.loadTextureImage(e,r,a)}loadTextureImage(e,t,n){const i=this,r=this.json,a=this.options,o=r.textures[e],l=(t.uri||t.bufferView)+":"+o.sampler;if(this.textureCache[l])return this.textureCache[l];const c=self.URL||self.webkitURL;let h=t.uri||"",u=!1;if(t.bufferView!==void 0)h=i.getDependency("bufferView",t.bufferView).then(function(p){u=!0;const m=new Blob([p],{type:t.mimeType});return h=c.createObjectURL(m),h});else if(t.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");const d=Promise.resolve(h).then(function(p){return new Promise(function(m,f){let g=m;n.isImageBitmapLoader===!0&&(g=function(x){const v=new qe(x);v.needsUpdate=!0,m(v)}),n.load($n.resolveURL(p,a.path),g,void 0,f)})}).then(function(p){u===!0&&c.revokeObjectURL(h),p.flipY=!1,o.name&&(p.name=o.name);const m=(r.samplers||{})[o.sampler]||{};return p.magFilter=ju[m.magFilter]||1006,p.minFilter=ju[m.minFilter]||1008,p.wrapS=qu[m.wrapS]||1e3,p.wrapT=qu[m.wrapT]||1e3,i.associations.set(p,{textures:e}),p}).catch(function(){return console.error("THREE.GLTFLoader: Couldn't load texture",h),null});return this.textureCache[l]=d,d}assignTexture(e,t,n){const i=this;return this.getDependency("texture",n.index).then(function(r){if(n.texCoord===void 0||n.texCoord==0||t==="aoMap"&&n.texCoord==1||console.warn("THREE.GLTFLoader: Custom UV set "+n.texCoord+" for texture "+t+" not yet supported."),i.extensions[Se.KHR_TEXTURE_TRANSFORM]){const a=n.extensions!==void 0?n.extensions[Se.KHR_TEXTURE_TRANSFORM]:void 0;if(a){const o=i.associations.get(r);r=i.extensions[Se.KHR_TEXTURE_TRANSFORM].extendTexture(r,a),i.associations.set(r,o)}}return e[t]=r,r})}assignFinalMaterial(e){const t=e.geometry;let n=e.material;const i=t.attributes.tangent===void 0,r=t.attributes.color!==void 0,a=t.attributes.normal===void 0;if(e.isPoints){const o="PointsMaterial:"+n.uuid;let l=this.cache.get(o);l||(l=new oh,Je.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,l.sizeAttenuation=!1,this.cache.add(o,l)),n=l}else if(e.isLine){const o="LineBasicMaterial:"+n.uuid;let l=this.cache.get(o);l||(l=new dr,Je.prototype.copy.call(l,n),l.color.copy(n.color),this.cache.add(o,l)),n=l}if(i||r||a){let o="ClonedMaterial:"+n.uuid+":";n.isGLTFSpecularGlossinessMaterial&&(o+="specular-glossiness:"),i&&(o+="derivative-tangents:"),r&&(o+="vertex-colors:"),a&&(o+="flat-shading:");let l=this.cache.get(o);l||(l=n.clone(),r&&(l.vertexColors=!0),a&&(l.flatShading=!0),i&&(l.normalScale&&(l.normalScale.y*=-1),l.clearcoatNormalScale&&(l.clearcoatNormalScale.y*=-1)),this.cache.add(o,l),this.associations.set(l,this.associations.get(n))),n=l}n.aoMap&&t.attributes.uv2===void 0&&t.attributes.uv!==void 0&&t.setAttribute("uv2",t.attributes.uv),e.material=n}getMaterialType(){return In}loadMaterial(e){const t=this,n=this.json,i=this.extensions,r=n.materials[e];let a;const o={},l=r.extensions||{},c=[];if(l[Se.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS]){const u=i[Se.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS];a=u.getMaterialType(),c.push(u.extendParams(o,r,t))}else if(l[Se.KHR_MATERIALS_UNLIT]){const u=i[Se.KHR_MATERIALS_UNLIT];a=u.getMaterialType(),c.push(u.extendParams(o,r,t))}else{const u=r.pbrMetallicRoughness||{};if(o.color=new le(1,1,1),o.opacity=1,Array.isArray(u.baseColorFactor)){const d=u.baseColorFactor;o.color.fromArray(d),o.opacity=d[3]}u.baseColorTexture!==void 0&&c.push(t.assignTexture(o,"map",u.baseColorTexture)),o.metalness=u.metallicFactor!==void 0?u.metallicFactor:1,o.roughness=u.roughnessFactor!==void 0?u.roughnessFactor:1,u.metallicRoughnessTexture!==void 0&&(c.push(t.assignTexture(o,"metalnessMap",u.metallicRoughnessTexture)),c.push(t.assignTexture(o,"roughnessMap",u.metallicRoughnessTexture))),a=this._invokeOne(function(d){return d.getMaterialType&&d.getMaterialType(e)}),c.push(Promise.all(this._invokeAll(function(d){return d.extendMaterialParams&&d.extendMaterialParams(e,o)})))}r.doubleSided===!0&&(o.side=2);const h=r.alphaMode||Xy;if(h===Zy?(o.transparent=!0,o.depthWrite=!1):(o.format=1022,o.transparent=!1,h===Yy&&(o.alphaTest=r.alphaCutoff!==void 0?r.alphaCutoff:.5)),r.normalTexture!==void 0&&a!==jt&&(c.push(t.assignTexture(o,"normalMap",r.normalTexture)),o.normalScale=new $(1,1),r.normalTexture.scale!==void 0)){const u=r.normalTexture.scale;o.normalScale.set(u,u)}return r.occlusionTexture!==void 0&&a!==jt&&(c.push(t.assignTexture(o,"aoMap",r.occlusionTexture)),r.occlusionTexture.strength!==void 0&&(o.aoMapIntensity=r.occlusionTexture.strength)),r.emissiveFactor!==void 0&&a!==jt&&(o.emissive=new le().fromArray(r.emissiveFactor)),r.emissiveTexture!==void 0&&a!==jt&&c.push(t.assignTexture(o,"emissiveMap",r.emissiveTexture)),Promise.all(c).then(function(){let u;return u=a===Dc?i[Se.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS].createMaterial(o):new a(o),r.name&&(u.name=r.name),u.map&&(u.map.encoding=3001),u.emissiveMap&&(u.emissiveMap.encoding=3001),mi(u,r),t.associations.set(u,{materials:e}),r.extensions&&Or(i,u,r),u})}createUniqueName(e){const t=Te.sanitizeNodeName(e||"");let n=t;for(let i=1;this.nodeNamesUsed[n];++i)n=t+"_"+i;return this.nodeNamesUsed[n]=!0,n}loadGeometries(e){const t=this,n=this.extensions,i=this.primitiveCache;function r(o){return n[Se.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(o,t).then(function(l){return Zu(l,o,t)})}const a=[];for(let o=0,l=e.length;o<l;o++){const c=e[o],h=Ky(c),u=i[h];if(u)a.push(u.promise);else{let d;d=c.extensions&&c.extensions[Se.KHR_DRACO_MESH_COMPRESSION]?r(c):Zu(new Oe,c,t),i[h]={primitive:c,promise:d},a.push(d)}}return Promise.all(a)}loadMesh(e){const t=this,n=this.json,i=this.extensions,r=n.meshes[e],a=r.primitives,o=[];for(let l=0,c=a.length;l<c;l++){const h=a[l].material===void 0?Jy(this.cache):this.getDependency("material",a[l].material);o.push(h)}return o.push(t.loadGeometries(a)),Promise.all(o).then(function(l){const c=l.slice(0,l.length-1),h=l[l.length-1],u=[];for(let p=0,m=h.length;p<m;p++){const f=h[p],g=a[p];let x;const v=c[p];if(g.mode===jy||g.mode===Gu||g.mode===Wu||g.mode===void 0)x=r.isSkinnedMesh===!0?new ih(f,v):new me(f,v),x.isSkinnedMesh!==!0||x.geometry.attributes.skinWeight.normalized||x.normalizeSkinWeights(),g.mode===Gu?x.geometry=Ju(x.geometry,1):g.mode===Wu&&(x.geometry=Ju(x.geometry,2));else if(g.mode===Vy)x=new Ya(f,v);else if(g.mode===Wy)x=new co(f,v);else if(g.mode===Gy)x=new Qm(f,v);else{if(g.mode!==Hy)throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+g.mode);x=new ef(f,v)}Object.keys(x.geometry.morphAttributes).length>0&&$y(x,r),x.name=t.createUniqueName(r.name||"mesh_"+e),mi(x,r),g.extensions&&Or(i,x,g),t.assignFinalMaterial(x),u.push(x)}for(let p=0,m=u.length;p<m;p++)t.associations.set(u[p],{meshes:e,primitives:p});if(u.length===1)return u[0];const d=new En;t.associations.set(d,{meshes:e});for(let p=0,m=u.length;p<m;p++)d.add(u[p]);return d})}loadCamera(e){let t;const n=this.json.cameras[e],i=n[n.type];if(i)return n.type==="perspective"?t=new nt(Cm.radToDeg(i.yfov),i.aspectRatio||1,i.znear||1,i.zfar||2e6):n.type==="orthographic"&&(t=new fr(-i.xmag,i.xmag,i.ymag,-i.ymag,i.znear,i.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),mi(t,n),Promise.resolve(t);console.warn("THREE.GLTFLoader: Missing camera parameters.")}loadSkin(e){const t=this.json.skins[e],n={joints:t.joints};return t.inverseBindMatrices===void 0?Promise.resolve(n):this.getDependency("accessor",t.inverseBindMatrices).then(function(i){return n.inverseBindMatrices=i,n})}loadAnimation(e){const t=this.json.animations[e],n=[],i=[],r=[],a=[],o=[];for(let l=0,c=t.channels.length;l<c;l++){const h=t.channels[l],u=t.samplers[h.sampler],d=h.target,p=d.node!==void 0?d.node:d.id,m=t.parameters!==void 0?t.parameters[u.input]:u.input,f=t.parameters!==void 0?t.parameters[u.output]:u.output;n.push(this.getDependency("node",p)),i.push(this.getDependency("accessor",m)),r.push(this.getDependency("accessor",f)),a.push(u),o.push(d)}return Promise.all([Promise.all(n),Promise.all(i),Promise.all(r),Promise.all(a),Promise.all(o)]).then(function(l){const c=l[0],h=l[1],u=l[2],d=l[3],p=l[4],m=[];for(let g=0,x=c.length;g<x;g++){const v=c[g],y=h[g],b=u[g],w=d[g],S=p[g];if(v===void 0)continue;let M;switch(v.updateMatrix(),v.matrixAutoUpdate=!0,Gi[S.path]){case Gi.weights:M=Rs;break;case Gi.rotation:M=wi;break;default:M=Ls}const L=v.name?v.name:v.uuid,I=w.interpolation!==void 0?qy[w.interpolation]:2301,P=[];Gi[S.path]===Gi.weights?v.traverse(function(W){W.morphTargetInfluences&&P.push(W.name?W.name:W.uuid)}):P.push(L);let N=b.array;if(b.normalized){const W=Fc(N.constructor),G=new Float32Array(N.length);for(let U=0,j=N.length;U<j;U++)G[U]=N[U]*W;N=G}for(let W=0,G=P.length;W<G;W++){const U=new M(P[W]+"."+Gi[S.path],y.array,N,I);w.interpolation==="CUBICSPLINE"&&(U.createInterpolant=function(j){return new(this instanceof wi?By:gi)(this.times,this.values,this.getValueSize()/3,j)},U.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0),m.push(U)}}const f=t.name?t.name:"animation_"+e;return new Pc(f,void 0,m)})}createNodeMesh(e){const t=this.json,n=this,i=t.nodes[e];return i.mesh===void 0?null:n.getDependency("mesh",i.mesh).then(function(r){const a=n._getNodeRef(n.meshCache,i.mesh,r);return i.weights!==void 0&&a.traverse(function(o){if(o.isMesh)for(let l=0,c=i.weights.length;l<c;l++)o.morphTargetInfluences[l]=i.weights[l]}),a})}loadNode(e){const t=this.json,n=this.extensions,i=this,r=t.nodes[e],a=r.name?i.createUniqueName(r.name):"";return function(){const o=[],l=i._invokeOne(function(c){return c.createNodeMesh&&c.createNodeMesh(e)});return l&&o.push(l),r.camera!==void 0&&o.push(i.getDependency("camera",r.camera).then(function(c){return i._getNodeRef(i.cameraCache,r.camera,c)})),i._invokeAll(function(c){return c.createNodeAttachment&&c.createNodeAttachment(e)}).forEach(function(c){o.push(c)}),Promise.all(o)}().then(function(o){let l;if(l=r.isBone===!0?new rh:o.length>1?new En:o.length===1?o[0]:new Re,l!==o[0])for(let c=0,h=o.length;c<h;c++)l.add(o[c]);if(r.name&&(l.userData.name=r.name,l.name=a),mi(l,r),r.extensions&&Or(n,l,r),r.matrix!==void 0){const c=new he;c.fromArray(r.matrix),l.applyMatrix4(c)}else r.translation!==void 0&&l.position.fromArray(r.translation),r.rotation!==void 0&&l.quaternion.fromArray(r.rotation),r.scale!==void 0&&l.scale.fromArray(r.scale);return i.associations.has(l)||i.associations.set(l,{}),i.associations.get(l).nodes=e,l})}loadScene(e){const t=this.json,n=this.extensions,i=this.json.scenes[e],r=this,a=new En;i.name&&(a.name=r.createUniqueName(i.name)),mi(a,i),i.extensions&&Or(n,a,i);const o=i.nodes||[],l=[];for(let c=0,h=o.length;c<h;c++)l.push(Tf(o[c],a,t,r));return Promise.all(l).then(function(){return r.associations=(c=>{const h=new Map;for(const[u,d]of r.associations)(u instanceof Je||u instanceof qe)&&h.set(u,d);return c.traverse(u=>{const d=r.associations.get(u);d!=null&&h.set(u,d)}),h})(a),a})}}function Tf(s,e,t,n){const i=t.nodes[s];return n.getDependency("node",s).then(function(r){if(i.skin===void 0)return r;let a;return n.getDependency("skin",i.skin).then(function(o){a=o;const l=[];for(let c=0,h=a.joints.length;c<h;c++)l.push(n.getDependency("node",a.joints[c]));return Promise.all(l)}).then(function(o){return r.traverse(function(l){if(!l.isMesh)return;const c=[],h=[];for(let u=0,d=o.length;u<d;u++){const p=o[u];if(p){c.push(p);const m=new he;a.inverseBindMatrices!==void 0&&m.fromArray(a.inverseBindMatrices.array,16*u),h.push(m)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',a.joints[u])}l.bind(new ah(c,h),l.matrixWorld)}),r})}).then(function(r){e.add(r);const a=[];if(i.children){const o=i.children;for(let l=0,c=o.length;l<c;l++){const h=o[l];a.push(Tf(h,r,t,n))}}return Promise.all(a)})}function Zu(s,e,t){const n=e.attributes,i=[];function r(a,o){return t.getDependency("accessor",a).then(function(l){s.setAttribute(o,l)})}for(const a in n){const o=Nc[a]||a.toLowerCase();o in s.attributes||i.push(r(n[a],o))}if(e.indices!==void 0&&!s.index){const a=t.getDependency("accessor",e.indices).then(function(o){s.setIndex(o)});i.push(a)}return mi(s,e),function(a,o,l){const c=o.attributes,h=new ft;if(c.POSITION===void 0)return;{const p=l.json.accessors[c.POSITION],m=p.min,f=p.max;if(m===void 0||f===void 0)return void console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");if(h.set(new T(m[0],m[1],m[2]),new T(f[0],f[1],f[2])),p.normalized){const g=Fc(Cs[p.componentType]);h.min.multiplyScalar(g),h.max.multiplyScalar(g)}}const u=o.targets;if(u!==void 0){const p=new T,m=new T;for(let f=0,g=u.length;f<g;f++){const x=u[f];if(x.POSITION!==void 0){const v=l.json.accessors[x.POSITION],y=v.min,b=v.max;if(y!==void 0&&b!==void 0){if(m.setX(Math.max(Math.abs(y[0]),Math.abs(b[0]))),m.setY(Math.max(Math.abs(y[1]),Math.abs(b[1]))),m.setZ(Math.max(Math.abs(y[2]),Math.abs(b[2]))),v.normalized){const w=Fc(Cs[v.componentType]);m.multiplyScalar(w)}p.max(m)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}h.expandByVector(p)}a.boundingBox=h;const d=new ei;h.getCenter(d.center),d.radius=h.min.distanceTo(h.max)/2,a.boundingSphere=d}(s,e,t),Promise.all(i).then(function(){return e.targets!==void 0?function(a,o,l){let c=!1,h=!1;for(let p=0,m=o.length;p<m;p++){const f=o[p];if(f.POSITION!==void 0&&(c=!0),f.NORMAL!==void 0&&(h=!0),c&&h)break}if(!c&&!h)return Promise.resolve(a);const u=[],d=[];for(let p=0,m=o.length;p<m;p++){const f=o[p];if(c){const g=f.POSITION!==void 0?l.getDependency("accessor",f.POSITION):a.attributes.position;u.push(g)}if(h){const g=f.NORMAL!==void 0?l.getDependency("accessor",f.NORMAL):a.attributes.normal;d.push(g)}}return Promise.all([Promise.all(u),Promise.all(d)]).then(function(p){const m=p[0],f=p[1];return c&&(a.morphAttributes.position=m),h&&(a.morphAttributes.normal=f),a.morphTargetsRelative=!0,a})}(s,e.targets,t):s})}function Ju(s,e){let t=s.getIndex();if(t===null){const a=[],o=s.getAttribute("position");if(o===void 0)return console.error("THREE.GLTFLoader.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),s;for(let l=0;l<o.count;l++)a.push(l);s.setIndex(a),t=s.getIndex()}const n=t.count-2,i=[];if(e===2)for(let a=1;a<=n;a++)i.push(t.getX(0)),i.push(t.getX(a)),i.push(t.getX(a+1));else for(let a=0;a<n;a++)a%2==0?(i.push(t.getX(a)),i.push(t.getX(a+1)),i.push(t.getX(a+2))):(i.push(t.getX(a+2)),i.push(t.getX(a+1)),i.push(t.getX(a)));i.length/3!==n&&console.error("THREE.GLTFLoader.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");const r=s.clone();return r.setIndex(i),r}class ex{constructor(e=4){this.pool=e,this.queue=[],this.workers=[],this.workersResolve=[],this.workerStatus=0}_initWorker(e){if(!this.workers[e]){const t=this.workerCreator();t.addEventListener("message",this._onMessage.bind(this,e)),this.workers[e]=t}}_getIdleWorker(){for(let e=0;e<this.pool;e++)if(!(this.workerStatus&1<<e))return e;return-1}_onMessage(e,t){const n=this.workersResolve[e];if(n&&n(t),this.queue.length){const{resolve:i,msg:r,transfer:a}=this.queue.shift();this.workersResolve[e]=i,this.workers[e].postMessage(r,a)}else this.workerStatus^=1<<e}setWorkerCreator(e){this.workerCreator=e}setWorkerLimit(e){this.pool=e}postMessage(e,t){return new Promise(n=>{const i=this._getIdleWorker();i!==-1?(this._initWorker(i),this.workerStatus|=1<<i,this.workersResolve[i]=n,this.workers[i].postMessage(e,t)):this.queue.push({resolve:n,msg:e,transfer:t})})}dispose(){this.workers.forEach(e=>e.terminate()),this.workersResolve.length=0,this.workers.length=0,this.queue.length=0,this.workerStatus=0}}const cl=new WeakMap;let hl=0;class nn extends Ft{constructor(e){super(e),this.transcoderPath="",this.transcoderBinary=null,this.transcoderPending=null,this.workerPool=new ex,this.workerSourceURL="",this.workerConfig=null,typeof MSC_TRANSCODER<"u"&&console.warn('THREE.KTX2Loader: Please update to latest "basis_transcoder". "msc_basis_transcoder" is no longer supported in three.js r125+.')}setTranscoderPath(e){return this.transcoderPath=e,this}setWorkerLimit(e){return this.workerPool.setWorkerLimit(e),this}detectSupport(e){return this.workerConfig={astcSupported:e.extensions.has("WEBGL_compressed_texture_astc"),etc1Supported:e.extensions.has("WEBGL_compressed_texture_etc1"),etc2Supported:e.extensions.has("WEBGL_compressed_texture_etc"),dxtSupported:e.extensions.has("WEBGL_compressed_texture_s3tc"),bptcSupported:e.extensions.has("EXT_texture_compression_bptc"),pvrtcSupported:e.extensions.has("WEBGL_compressed_texture_pvrtc")||e.extensions.has("WEBKIT_WEBGL_compressed_texture_pvrtc")},e.capabilities.isWebGL2&&(this.workerConfig.etc1Supported=!1),this}dispose(){return this.workerPool.dispose(),this.workerSourceURL&&URL.revokeObjectURL(this.workerSourceURL),this}init(){if(!this.transcoderPending){const e=new Ln(this.manager);e.setPath(this.transcoderPath),e.setWithCredentials(this.withCredentials);const t=e.loadAsync("basis_transcoder.js"),n=new Ln(this.manager);n.setPath(this.transcoderPath),n.setResponseType("arraybuffer"),n.setWithCredentials(this.withCredentials);const i=n.loadAsync("basis_transcoder.wasm");this.transcoderPending=Promise.all([t,i]).then(([r,a])=>{const o=nn.BasisWorker.toString(),l=["/* constants */","let _EngineFormat = "+JSON.stringify(nn.EngineFormat),"let _TranscoderFormat = "+JSON.stringify(nn.TranscoderFormat),"let _BasisFormat = "+JSON.stringify(nn.BasisFormat),"/* basis_transcoder.js */",r,"/* worker */",o.substring(o.indexOf("{")+1,o.lastIndexOf("}"))].join(`
`);this.workerSourceURL=URL.createObjectURL(new Blob([l])),this.transcoderBinary=a,this.workerPool.setWorkerCreator(()=>{const c=new Worker(this.workerSourceURL),h=this.transcoderBinary.slice(0);return c.postMessage({type:"init",config:this.workerConfig,transcoderBinary:h},[h]),c})}),hl>0&&console.warn("THREE.KTX2Loader: Multiple active KTX2 loaders may cause performance issues. Use a single KTX2Loader instance, or call .dispose() on old instances."),hl++}return this.transcoderPending}load(e,t,n,i){if(this.workerConfig===null)throw new Error("THREE.KTX2Loader: Missing initialization with `.detectSupport( renderer )`.");const r=new Ln(this.manager);r.setResponseType("arraybuffer"),r.setWithCredentials(this.withCredentials);const a=new Ac;return r.load(e,o=>{if(cl.has(o))return cl.get(o).promise.then(t).catch(i);this._createTexture([o]).then(function(l){a.copy(l),a.needsUpdate=!0,t&&t(a)}).catch(i)},n,i),a}_createTextureFrom(e){const{mipmaps:t,width:n,height:i,format:r,type:a,error:o,dfdTransferFn:l,dfdFlags:c}=e;if(a==="error")return Promise.reject(o);const h=new Ac(t,n,i,r,1009);return h.minFilter=t.length===1?1006:1008,h.magFilter=1006,h.generateMipmaps=!1,h.needsUpdate=!0,h.encoding=l===2?3001:3e3,h.premultiplyAlpha=!!(1&c),h}_createTexture(e,t={}){const n=t,i=this.init().then(()=>this.workerPool.postMessage({type:"transcode",buffers:e,taskConfig:n},e)).then(r=>this._createTextureFrom(r.data));return cl.set(e[0],{promise:i}),i}dispose(){return URL.revokeObjectURL(this.workerSourceURL),this.workerPool.dispose(),hl--,this}}/* @license
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
 */var $u,Ku;nn.BasisFormat={ETC1S:0,UASTC_4x4:1},nn.TranscoderFormat={ETC1:0,ETC2:1,BC1:2,BC3:3,BC4:4,BC5:5,BC7_M6_OPAQUE_ONLY:6,BC7_M5:7,PVRTC1_4_RGB:8,PVRTC1_4_RGBA:9,ASTC_4x4:10,ATC_RGB:11,ATC_RGBA_INTERPOLATED_ALPHA:12,RGBA32:13,RGB565:14,BGR565:15,RGBA4444:16},nn.EngineFormat={RGBAFormat:1023,RGBA_ASTC_4x4_Format:37808,RGBA_BPTC_Format:36492,RGBA_ETC2_EAC_Format:37496,RGBA_PVRTC_4BPPV1_Format:35842,RGBA_S3TC_DXT5_Format:33779,RGB_ETC1_Format:36196,RGB_ETC2_Format:37492,RGB_PVRTC_4BPPV1_Format:35840,RGB_S3TC_DXT1_Format:33776},nn.BasisWorker=function(){let s,e,t;const n=_EngineFormat,i=_TranscoderFormat,r=_BasisFormat;self.addEventListener("message",function(h){const u=h.data;switch(u.type){case"init":s=u.config,d=u.transcoderBinary,e=new Promise(p=>{t={wasmBinary:d,onRuntimeInitialized:p},BASIS(t)}).then(()=>{t.initializeBasis(),t.KTX2File===void 0&&console.warn("THREE.KTX2Loader: Please update Basis Universal transcoder.")});break;case"transcode":e.then(()=>{try{const{width:p,height:m,hasAlpha:f,mipmaps:g,format:x,dfdTransferFn:v,dfdFlags:y}=function(w){const S=new t.KTX2File(new Uint8Array(w));function M(){S.close(),S.delete()}if(!S.isValid())throw M(),new Error("THREE.KTX2Loader:	Invalid or unsupported .ktx2 file");const L=S.isUASTC()?r.UASTC_4x4:r.ETC1S,I=S.getWidth(),P=S.getHeight(),N=S.getLevels(),W=S.getHasAlpha(),G=S.getDFDTransferFunc(),U=S.getDFDFlags(),{transcoderFormat:j,engineFormat:ne}=function(B,X,Z,te){let ee,ce;const R=B===r.ETC1S?o:l;for(let E=0;E<R.length;E++){const F=R[E];if(s[F.if]&&F.basisFormat.includes(B)&&!(te&&F.transcoderFormat.length<2)&&(!F.needsPowerOfTwo||c(X)&&c(Z)))return ee=F.transcoderFormat[te?1:0],ce=F.engineFormat[te?1:0],{transcoderFormat:ee,engineFormat:ce}}return console.warn("THREE.KTX2Loader: No suitable compressed texture format found. Decoding to RGBA32."),ee=i.RGBA32,ce=n.RGBAFormat,{transcoderFormat:ee,engineFormat:ce}}(L,I,P,W);if(!I||!P||!N)throw M(),new Error("THREE.KTX2Loader:	Invalid texture");if(!S.startTranscoding())throw M(),new Error("THREE.KTX2Loader: .startTranscoding failed");const ie=[];for(let B=0;B<N;B++){const X=S.getImageLevelInfo(B,0,0),Z=X.origWidth,te=X.origHeight,ee=new Uint8Array(S.getImageTranscodedSizeInBytes(B,0,0,j));if(!S.transcodeImage(ee,B,0,0,j,0,-1,-1))throw M(),new Error("THREE.KTX2Loader: .transcodeImage failed.");ie.push({data:ee,width:Z,height:te})}return M(),{width:I,height:P,hasAlpha:W,mipmaps:ie,format:ne,dfdTransferFn:G,dfdFlags:U}}(u.buffers[0]),b=[];for(let w=0;w<g.length;++w)b.push(g[w].data.buffer);self.postMessage({type:"transcode",id:u.id,width:p,height:m,hasAlpha:f,mipmaps:g,format:x,dfdTransferFn:v,dfdFlags:y},b)}catch(p){console.error(p),self.postMessage({type:"error",id:u.id,error:p.message})}})}var d});const a=[{if:"astcSupported",basisFormat:[r.UASTC_4x4],transcoderFormat:[i.ASTC_4x4,i.ASTC_4x4],engineFormat:[n.RGBA_ASTC_4x4_Format,n.RGBA_ASTC_4x4_Format],priorityETC1S:1/0,priorityUASTC:1,needsPowerOfTwo:!1},{if:"bptcSupported",basisFormat:[r.ETC1S,r.UASTC_4x4],transcoderFormat:[i.BC7_M5,i.BC7_M5],engineFormat:[n.RGBA_BPTC_Format,n.RGBA_BPTC_Format],priorityETC1S:3,priorityUASTC:2,needsPowerOfTwo:!1},{if:"dxtSupported",basisFormat:[r.ETC1S,r.UASTC_4x4],transcoderFormat:[i.BC1,i.BC3],engineFormat:[n.RGB_S3TC_DXT1_Format,n.RGBA_S3TC_DXT5_Format],priorityETC1S:4,priorityUASTC:5,needsPowerOfTwo:!1},{if:"etc2Supported",basisFormat:[r.ETC1S,r.UASTC_4x4],transcoderFormat:[i.ETC1,i.ETC2],engineFormat:[n.RGB_ETC2_Format,n.RGBA_ETC2_EAC_Format],priorityETC1S:1,priorityUASTC:3,needsPowerOfTwo:!1},{if:"etc1Supported",basisFormat:[r.ETC1S,r.UASTC_4x4],transcoderFormat:[i.ETC1],engineFormat:[n.RGB_ETC1_Format],priorityETC1S:2,priorityUASTC:4,needsPowerOfTwo:!1},{if:"pvrtcSupported",basisFormat:[r.ETC1S,r.UASTC_4x4],transcoderFormat:[i.PVRTC1_4_RGB,i.PVRTC1_4_RGBA],engineFormat:[n.RGB_PVRTC_4BPPV1_Format,n.RGBA_PVRTC_4BPPV1_Format],priorityETC1S:5,priorityUASTC:6,needsPowerOfTwo:!0}],o=a.sort(function(h,u){return h.priorityETC1S-u.priorityETC1S}),l=a.sort(function(h,u){return h.priorityUASTC-u.priorityUASTC});function c(h){return h<=2||(h&h-1)==0&&h!==0}};const Gt=Symbol("retainerCount"),fn=Symbol("recentlyUsed"),va=Symbol("evict"),Ur=Symbol("evictionThreshold"),ul=Symbol("cache");class tx{constructor(e,t=5){this[$u]=new Map,this[Ku]=[],this[ul]=e,this[Ur]=t}set evictionThreshold(e){this[Ur]=e,this[va]()}get evictionThreshold(){return this[Ur]}get cache(){return this[ul]}retainerCount(e){return this[Gt].get(e)||0}reset(){this[Gt].clear(),this[fn]=[]}retain(e){this[Gt].has(e)||this[Gt].set(e,0),this[Gt].set(e,this[Gt].get(e)+1);const t=this[fn].indexOf(e);t!==-1&&this[fn].splice(t,1),this[fn].unshift(e),this[va]()}release(e){this[Gt].has(e)&&this[Gt].set(e,Math.max(this[Gt].get(e)-1,0)),this[va]()}[($u=Gt,Ku=fn,va)](){if(!(this[fn].length<this[Ur]))for(let e=this[fn].length-1;e>=this[Ur];--e){const t=this[fn][e];this[Gt].get(t)===0&&(this[ul].delete(t),this[fn].splice(e,1))}}}/* @license
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
 */const nx=s=>{const e=new Map;for(const t of s.mappings)for(const n of t.variants)e.set(n,{material:null,gltfMaterialIndex:t.material});return e};class ix{constructor(e){this.parser=e,this.name="KHR_materials_variants"}afterRoot(e){const t=this.parser,n=t.json;if(n.extensions===void 0||n.extensions[this.name]===void 0)return null;const i=(r=>{const a=[],o=new Set;for(const l of r){let c=l,h=0;for(;o.has(c);)c=l+"."+ ++h;o.add(c),a.push(c)}return a})((n.extensions[this.name].variants||[]).map(r=>r.name));for(const r of e.scenes)r.traverse(a=>{const o=t.associations.get(a);if(o==null||o.meshes==null)return;const l=o.meshes,c=n.meshes[l].primitives,h="isMesh"in a?[a]:a.children;for(let u=0;u<c.length;u++){const d=c[u].extensions;d&&d[this.name]&&(h[u].userData.variantMaterials=nx(d[this.name]))}});return e.userData.variants=i,Promise.resolve()}}/* @license
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
 */var Ef,Qu;const gn=new Map,dl=new Map;let ed;const td=new class extends Ft{constructor(s){super(s),this.decoderPath="",this.decoderConfig={},this.decoderBinary=null,this.decoderPending=null,this.workerLimit=4,this.workerPool=[],this.workerNextTaskID=1,this.workerSourceURL="",this.defaultAttributeIDs={position:"POSITION",normal:"NORMAL",color:"COLOR",uv:"TEX_COORD"},this.defaultAttributeTypes={position:"Float32Array",normal:"Float32Array",color:"Float32Array",uv:"Float32Array"}}setDecoderPath(s){return this.decoderPath=s,this}setDecoderConfig(s){return this.decoderConfig=s,this}setWorkerLimit(s){return this.workerLimit=s,this}load(s,e,t,n){const i=new Ln(this.manager);i.setPath(this.path),i.setResponseType("arraybuffer"),i.setRequestHeader(this.requestHeader),i.setWithCredentials(this.withCredentials),i.load(s,r=>{const a={attributeIDs:this.defaultAttributeIDs,attributeTypes:this.defaultAttributeTypes,useUniqueIDs:!1};this.decodeGeometry(r,a).then(e).catch(n)},t,n)}decodeDracoFile(s,e,t,n){const i={attributeIDs:t||this.defaultAttributeIDs,attributeTypes:n||this.defaultAttributeTypes,useUniqueIDs:!!t};this.decodeGeometry(s,i).then(e)}decodeGeometry(s,e){for(const o in e.attributeTypes){const l=e.attributeTypes[o];l.BYTES_PER_ELEMENT!==void 0&&(e.attributeTypes[o]=l.name)}const t=JSON.stringify(e);if(ll.has(s)){const o=ll.get(s);if(o.key===t)return o.promise;if(s.byteLength===0)throw new Error("THREE.DRACOLoader: Unable to re-decode a buffer with different settings. Buffer has already been transferred.")}let n;const i=this.workerNextTaskID++,r=s.byteLength,a=this._getWorker(i,r).then(o=>(n=o,new Promise((l,c)=>{n._callbacks[i]={resolve:l,reject:c},n.postMessage({type:"decode",id:i,taskConfig:e,buffer:s},[s])}))).then(o=>this._createGeometry(o.geometry));return a.catch(()=>!0).then(()=>{n&&i&&this._releaseTask(n,i)}),ll.set(s,{key:t,promise:a}),a}_createGeometry(s){const e=new Oe;s.index&&e.setIndex(new ke(s.index.array,1));for(let t=0;t<s.attributes.length;t++){const n=s.attributes[t],i=n.name,r=n.array,a=n.itemSize;e.setAttribute(i,new ke(r,a))}return e}_loadLibrary(s,e){const t=new Ln(this.manager);return t.setPath(this.decoderPath),t.setResponseType(e),t.setWithCredentials(this.withCredentials),new Promise((n,i)=>{t.load(s,n,void 0,i)})}preload(){return this._initDecoder(),this}_initDecoder(){if(this.decoderPending)return this.decoderPending;const s=typeof WebAssembly!="object"||this.decoderConfig.type==="js",e=[];return s?e.push(this._loadLibrary("draco_decoder.js","text")):(e.push(this._loadLibrary("draco_wasm_wrapper.js","text")),e.push(this._loadLibrary("draco_decoder.wasm","arraybuffer"))),this.decoderPending=Promise.all(e).then(t=>{const n=t[0];s||(this.decoderConfig.wasmBinary=t[1]);const i=yy.toString(),r=["/* draco decoder */",n,"","/* worker */",i.substring(i.indexOf("{")+1,i.lastIndexOf("}"))].join(`
`);this.workerSourceURL=URL.createObjectURL(new Blob([r]))}),this.decoderPending}_getWorker(s,e){return this._initDecoder().then(()=>{if(this.workerPool.length<this.workerLimit){const n=new Worker(this.workerSourceURL);n._callbacks={},n._taskCosts={},n._taskLoad=0,n.postMessage({type:"init",decoderConfig:this.decoderConfig}),n.onmessage=function(i){const r=i.data;switch(r.type){case"decode":n._callbacks[r.id].resolve(r);break;case"error":n._callbacks[r.id].reject(r);break;default:console.error('THREE.DRACOLoader: Unexpected message, "'+r.type+'"')}},this.workerPool.push(n)}else this.workerPool.sort(function(n,i){return n._taskLoad>i._taskLoad?-1:1});const t=this.workerPool[this.workerPool.length-1];return t._taskCosts[s]=e,t._taskLoad+=e,t})}_releaseTask(s,e){s._taskLoad-=s._taskCosts[e],delete s._callbacks[e],delete s._taskCosts[e]}debug(){console.log("Task load: ",this.workerPool.map(s=>s._taskLoad))}dispose(){for(let s=0;s<this.workerPool.length;++s)this.workerPool[s].terminate();return this.workerPool.length=0,this}};let nd;const pl=new nn;let ml,fl;const nr=Symbol("loader"),qn=Symbol("evictionPolicy"),id=Symbol("GLTFInstance");class pt extends At{constructor(e){super(),this[Qu]=new xy().register(t=>new ix(t)),this[id]=e,this[nr].setDRACOLoader(td),this[nr].setKTX2Loader(pl)}static setDRACODecoderLocation(e){ed=e,td.setDecoderPath(e)}static getDRACODecoderLocation(){return ed}static setKTX2TranscoderLocation(e){nd=e,pl.setTranscoderPath(e)}static getKTX2TranscoderLocation(){return nd}static setMeshoptDecoderLocation(e){var t;ml!==e&&(ml=e,fl=(t=e,new Promise((n,i)=>{const r=document.createElement("script");document.body.appendChild(r),r.onload=n,r.onerror=i,r.async=!0,r.src=t})).then(()=>MeshoptDecoder.ready).then(()=>MeshoptDecoder))}static getMeshoptDecoderLocation(){return ml}static initializeKTX2Loader(e){pl.detectSupport(e)}static get cache(){return gn}static clearCache(){gn.forEach((e,t)=>{this.delete(t)}),this[qn].reset()}static has(e){return gn.has(e)}static async delete(e){if(!this.has(e))return;const t=gn.get(e);dl.delete(e),gn.delete(e),(await t).dispose()}static hasFinishedLoading(e){return!!dl.get(e)}get[(Ef=qn,Qu=nr,qn)](){return this.constructor[qn]}async preload(e,t,n=()=>{}){if(this.dispatchEvent({type:"preload",element:t,src:e}),!gn.has(e)){fl!=null&&this[nr].setMeshoptDecoder(await fl);const i=((o,l,c=()=>{})=>{const h=u=>{const d=u.loaded/u.total;c(Math.max(0,Math.min(1,isFinite(d)?d:1)))};return new Promise((u,d)=>{l.load(o,u,h,d)})})(e,this[nr],o=>{n(.8*o)}),r=this[id],a=i.then(o=>r.prepare(o)).then(o=>(n(.9),new r(o)));gn.set(e,a)}await gn.get(e),dl.set(e,!0),n&&n(1)}async load(e,t,n=()=>{}){await this.preload(e,t,n);const i=await gn.get(e),r=await i.clone();return this[qn].retain(e),r.dispose=(()=>{const a=r.dispose;let o=!1;return()=>{o||(o=!0,a.apply(r),this[qn].release(e))}})(),r}}pt[Ef]=new tx(pt);class Af extends Re{constructor(e=document.createElement("div")){super(),this.element=e,this.element.style.position="absolute",this.element.style.userSelect="none",this.element.setAttribute("draggable",!1),this.addEventListener("removed",function(){this.traverse(function(t){t.element instanceof Element&&t.element.parentNode!==null&&t.element.parentNode.removeChild(t.element)})})}copy(e,t){return super.copy(e,t),this.element=e.element.cloneNode(!0),this}}Af.prototype.isCSS2DObject=!0;const Vn=new T,rd=new he,sd=new he,ad=new T,od=new T;class rx{constructor(e={}){const t=this;let n,i,r,a;const o={objects:new WeakMap},l=e.element!==void 0?e.element:document.createElement("div");function c(u,d,p){if(u.isCSS2DObject){u.onBeforeRender(t,d,p),Vn.setFromMatrixPosition(u.matrixWorld),Vn.applyMatrix4(sd);const m=u.element;/apple/i.test(navigator.vendor)?m.style.transform="translate(-50%,-50%) translate("+Math.round(Vn.x*r+r)+"px,"+Math.round(-Vn.y*a+a)+"px)":m.style.transform="translate(-50%,-50%) translate("+(Vn.x*r+r)+"px,"+(-Vn.y*a+a)+"px)",m.style.display=u.visible&&Vn.z>=-1&&Vn.z<=1?"":"none";const f={distanceToCameraSquared:h(p,u)};o.objects.set(u,f),m.parentNode!==l&&l.appendChild(m),u.onAfterRender(t,d,p)}for(let m=0,f=u.children.length;m<f;m++)c(u.children[m],d,p)}function h(u,d){return ad.setFromMatrixPosition(u.matrixWorld),od.setFromMatrixPosition(d.matrixWorld),ad.distanceToSquared(od)}l.style.overflow="hidden",this.domElement=l,this.getSize=function(){return{width:n,height:i}},this.render=function(u,d){u.autoUpdate===!0&&u.updateMatrixWorld(),d.parent===null&&d.updateMatrixWorld(),rd.copy(d.matrixWorldInverse),sd.multiplyMatrices(d.projectionMatrix,rd),c(u,u,d),function(p){const m=function(g){const x=[];return g.traverse(function(v){v.isCSS2DObject&&x.push(v)}),x}(p).sort(function(g,x){return o.objects.get(g).distanceToCameraSquared-o.objects.get(x).distanceToCameraSquared}),f=m.length;for(let g=0,x=m.length;g<x;g++)m[g].element.style.zIndex=f-g}(u)},this.setSize=function(u,d){n=u,i=d,r=n/2,a=i/2,l.style.width=u+"px",l.style.height=d+"px"}}}/* @license
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
 */const Rf=s=>s&&s!=="null"?sx(s):null,ld=()=>{if(Mf)return;const s=[];throw wf||s.push("WebXR Device API"),_f||s.push("WebXR Hit Test API"),new Error(`The following APIs are required for AR, but are missing in this browser: ${s.join(", ")}`)},sx=s=>new URL(s,window.location.toString()).toString(),Oc=(s,e)=>{let t=null;return(...n)=>{t!=null&&self.clearTimeout(t),t=self.setTimeout(()=>{t=null,s(...n)},e)}},vi=(s,e,t)=>Math.max(e,Math.min(t,s)),Uc=(()=>{const s=(()=>{const e=document.head!=null?Array.from(document.head.querySelectorAll("meta")):[];for(const t of e)if(t.name==="viewport")return!0;return!1})();return s||console.warn('No <meta name="viewport"> detected; <model-viewer> will cap pixel density at 1.'),()=>s?window.devicePixelRatio:1})(),Lf=(()=>{const s=new RegExp("[?&]model-viewer-debug-mode(&|$)");return()=>self.ModelViewerElement&&self.ModelViewerElement.debugMode||self.location&&self.location.search&&self.location.search.match(s)})(),Cf=(s=0)=>new Promise(e=>setTimeout(e,s));class Et{constructor(e=50){this.velocity=0,this.naturalFrequency=0,this.setDecayTime(e)}setDecayTime(e){this.naturalFrequency=1/Math.max(.001,e)}update(e,t,n,i){const r=2e-4*this.naturalFrequency;if(e==null||i===0||e===t&&this.velocity===0)return t;if(n<0)return e;const a=e-t,o=this.velocity+this.naturalFrequency*a,l=a+n*o,c=Math.exp(-this.naturalFrequency*n),h=(o-this.naturalFrequency*l)*c,u=-this.naturalFrequency*(h+o*c);return Math.abs(h)<r*Math.abs(i)&&u*a>=0?(this.velocity=0,t):(this.velocity=h,t+l*c)}}/* @license
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
 */const ot=(s,e)=>({type:"number",number:s,unit:e}),Mi=(()=>{const s={};return e=>{const t=e;if(t in s)return s[t];const n=[];let i=0;for(;e;){if(++i>1e3){e="";break}const r=Pf(e),a=r.nodes[0];if(a==null||a.terms.length===0)break;n.push(a),e=r.remainingInput}return s[t]=n}})(),Pf=(()=>{const s=/^(\-\-|[a-z\u0240-\uffff])/i,e=/^([\*\+\/]|[\-]\s)/i,t=/^[\),]/;return n=>{const i=[];for(;n.length&&(n=n.trim(),!t.test(n));)if(n[0]==="("){const{nodes:r,remainingInput:a}=cd(n);n=a,i.push({type:"function",name:{type:"ident",value:"calc"},arguments:r})}else if(s.test(n)){const r=ax(n),a=r.nodes[0];if((n=r.remainingInput)[0]==="("){const{nodes:o,remainingInput:l}=cd(n);i.push({type:"function",name:a,arguments:o}),n=l}else i.push(a)}else if(e.test(n))i.push({type:"operator",value:n[0]}),n=n.slice(1);else{const{nodes:r,remainingInput:a}=n[0]==="#"?lx(n):ox(n);if(r.length===0)break;i.push(r[0]),n=a}return{nodes:[{type:"expression",terms:i}],remainingInput:n}}})(),ax=(()=>{const s=/[^a-z0-9_\-\u0240-\uffff]/i;return e=>{const t=e.match(s);return{nodes:[{type:"ident",value:t==null?e:e.substr(0,t.index)}],remainingInput:t==null?"":e.substr(t.index)}}})(),ox=(()=>{const s=/[\+\-]?(\d+[\.]\d+|\d+|[\.]\d+)([eE][\+\-]?\d+)?/,e=/^[a-z%]+/i,t=/^(m|mm|cm|rad|deg|[%])$/;return n=>{const i=n.match(s),r=i==null?"0":i[0],a=(n=r==null?n:n.slice(r.length)).match(e);let o=a!=null&&a[0]!==""?a[0]:null;const l=a==null?n:n.slice(o.length);return o==null||t.test(o)||(o=null),{nodes:[{type:"number",number:parseFloat(r)||0,unit:o}],remainingInput:l}}})(),lx=(()=>{const s=/^[a-f0-9]*/i;return e=>{const t=(e=e.slice(1).trim()).match(s);return{nodes:t==null?[]:[{type:"hex",value:t[0]}],remainingInput:t==null?e:e.slice(t[0].length)}}})(),cd=s=>{const e=[];for(s=s.slice(1).trim();s.length;){const t=Pf(s);if(e.push(t.nodes[0]),(s=t.remainingInput.trim())[0]===",")s=s.slice(1).trim();else if(s[0]===")"){s=s.slice(1);break}}return{nodes:e,remainingInput:s}},hd=Symbol("visitedTypes");class cx{constructor(e){this[hd]=e}walk(e,t){const n=e.slice();for(;n.length;){const i=n.shift();switch(this[hd].indexOf(i.type)>-1&&t(i),i.type){case"expression":n.unshift(...i.terms);break;case"function":n.unshift(i.name,...i.arguments)}}}}const Qn=Object.freeze({type:"number",number:0,unit:null}),Ds=(s,e=0)=>{let{number:t,unit:n}=s;if(isFinite(t)){if(s.unit==="rad"||s.unit==null)return s}else t=e,n="rad";return{type:"number",number:(n==="deg"&&t!=null?t:0)*Math.PI/180,unit:"rad"}},ud=(s,e=0)=>{let t,{number:n,unit:i}=s;if(isFinite(n)){if(s.unit==="m")return s}else n=e,i="m";switch(i){default:t=1;break;case"cm":t=.01;break;case"mm":t=.001}return{type:"number",number:t*n,unit:"m"}},sn=(()=>{const s=t=>t,e={rad:s,deg:Ds,m:s,mm:ud,cm:ud};return(t,n=Qn)=>{isFinite(t.number)||(t.number=n.number,t.unit=n.unit);const{unit:i}=t;if(i==null)return t;const r=e[i];return r==null?n:r(t)}})();/* @license
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
 *//* @license
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
 */class If extends Af{constructor(e){super(document.createElement("div")),this.normal=new T(0,1,0),this.initialized=!1,this.referenceCount=1,this.pivot=document.createElement("div"),this.slot=document.createElement("slot"),this.element.classList.add("annotation-wrapper"),this.slot.name=e.name,this.element.appendChild(this.pivot),this.pivot.appendChild(this.slot),this.updatePosition(e.position),this.updateNormal(e.normal)}get facingCamera(){return!this.element.classList.contains("hide")}show(){this.facingCamera&&this.initialized||this.updateVisibility(!0)}hide(){!this.facingCamera&&this.initialized||this.updateVisibility(!1)}increment(){this.referenceCount++}decrement(){return this.referenceCount>0&&--this.referenceCount,this.referenceCount===0}updatePosition(e){if(e==null)return;const t=Mi(e)[0].terms;for(let n=0;n<3;++n)this.position.setComponent(n,sn(t[n]).number);this.updateMatrixWorld()}updateNormal(e){if(e==null)return;const t=Mi(e)[0].terms;for(let n=0;n<3;++n)this.normal.setComponent(n,sn(t[n]).number)}orient(e){this.pivot.style.transform=`rotate(${e}rad)`}updateVisibility(e){e?this.element.classList.remove("hide"):this.element.classList.add("hide"),this.slot.assignedNodes().forEach(t=>{if(t.nodeType!==Node.ELEMENT_NODE)return;const n=t,i=n.dataset.visibilityAttribute;if(i!=null){const r=`data-${i}`;e?n.setAttribute(r,""):n.removeAttribute(r)}n.dispatchEvent(new CustomEvent("hotspot-visibility",{detail:{visible:e}}))}),this.initialized=!0}}/* @license
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
 */const gl=(s,e,t)=>{let n=t;const i=new T;return s.traverse(r=>{let a,o;r.updateWorldMatrix(!1,!1);const l=r.geometry;if(l!==void 0){if(l.isGeometry){const c=l.vertices;for(a=0,o=c.length;a<o;a++)i.copy(c[a]),i.applyMatrix4(r.matrixWorld),n=e(n,i)}else if(l.isBufferGeometry){const{position:c}=l.attributes;if(c!==void 0){const h=(u=>{if(!u.normalized)return 1;const d=u.array;return d instanceof Int8Array?.007874015748031496:d instanceof Uint8Array?.00392156862745098:d instanceof Int16Array?3051850947599719e-20:d instanceof Uint16Array?15259021896696422e-21:1})(c);for(a=0,o=c.count;a<o;a++)i.fromBufferAttribute(c,a),i.multiplyScalar(h),i.applyMatrix4(r.matrixWorld),n=e(n,i)}}}}),n};class hx extends go{constructor(e,t,n){super(),this.shadowMaterial=new cf,this.boundingBox=new ft,this.size=new T,this.shadowScale=1,this.isAnimated=!1,this.side="bottom",this.needsUpdate=!1,this.intensity=0,this.castShadow=!0,this.frustumCulled=!1,this.floor=new me(new Ti,this.shadowMaterial),this.floor.rotateX(-Math.PI/2),this.floor.receiveShadow=!0,this.floor.castShadow=!1,this.floor.frustumCulled=!1,this.add(this.floor),e.target.add(this),this.target=e.target,this.setScene(e,t,n)}setScene(e,t,n){if(this.side=n,this.isAnimated=e.animationNames.length>0,this.boundingBox.copy(e.boundingBox),this.size.copy(e.size),this.side==="back"){const{min:o,max:l}=this.boundingBox;[o.y,o.z]=[o.z,o.y],[l.y,l.z]=[l.z,l.y],[this.size.y,this.size.z]=[this.size.z,this.size.y],this.rotation.x=Math.PI/2,this.rotation.y=Math.PI}else this.rotation.x=0,this.rotation.y=0;const{boundingBox:i,size:r}=this;if(this.isAnimated){const o=2*Math.max(r.x,r.y,r.z);r.y=o,i.expandByVector(r.subScalar(o).multiplyScalar(-.5)),i.max.y=i.min.y+o,r.set(o,o,o)}i.getCenter(this.floor.position);const a=i.max.y+.002*r.y;n==="bottom"?(this.position.y=a,this.position.z=0):(this.position.y=0,this.position.z=a),this.setSoftness(t)}setSoftness(e){const t=Math.pow(2,9-3*e);this.setMapSize(t)}setMapSize(e){const{camera:t,mapSize:n,map:i}=this.shadow,{size:r,boundingBox:a}=this;i!=null&&(i.dispose(),this.shadow.map=null),this.isAnimated&&(e*=2);const o=Math.floor(r.x>r.z?e:e*r.x/r.z),l=Math.floor(r.x>r.z?e*r.z/r.x:e);n.set(o,l);const c=2.5*r.x/o,h=2.5*r.z/l;t.left=-a.max.x-c,t.right=-a.min.x+c,t.bottom=a.min.z-h,t.top=a.max.z+h,this.setScaleAndOffset(this.shadowScale,0),this.floor.scale.set(r.x+2*c,r.z+2*h,1),this.needsUpdate=!0,this.shadow.needsUpdate=!0}setIntensity(e){this.shadowMaterial.opacity=e,e>0?(this.visible=!0,this.floor.visible=!0):(this.visible=!1,this.floor.visible=!1)}getIntensity(){return this.shadowMaterial.opacity}setRotation(e){if(this.side!=="bottom")return this.shadow.camera.up.set(0,1,0),void this.shadow.updateMatrices(this);this.shadow.camera.up.set(Math.sin(e),0,Math.cos(e)),this.shadow.updateMatrices(this)}setScaleAndOffset(e,t){const n=this.size.y,{camera:i}=this.shadow;this.shadowScale=e,i.near=0,i.far=n-t/e,i.updateProjectionMatrix(),i.scale.setScalar(e);const r=.002*n;this.floor.position.y=2*r-i.far}}/* @license
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
 */const vl=new T,dd=new T,pd=new T,ux=new class{constructor(s,e,t=0,n=1/0){this.ray=new bi(s,e),this.near=t,this.far=n,this.camera=null,this.layers=new Kc,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(s,e){this.ray.set(s,e)}setFromCamera(s,e){e&&e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(s.x,s.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e&&e.isOrthographicCamera?(this.ray.origin.set(s.x,s.y,(e.near+e.far)/(e.near-e.far)).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):console.error("THREE.Raycaster: Unsupported camera type: "+e.type)}intersectObject(s,e=!0,t=[]){return Ic(s,this,t,e),t.sort(Hu),t}intersectObjects(s,e=!0,t=[]){for(let n=0,i=s.length;n<i;n++)Ic(s[n],this,t,e);return t.sort(Hu),t}},dx=new T,kr=new $;class px extends an{constructor({canvas:e,element:t,width:n,height:i}){super(),this.context=null,this.annotationRenderer=new rx,this.schemaElement=document.createElement("script"),this.width=1,this.height=1,this.aspect=1,this.renderCount=0,this.externalRenderer=null,this.camera=new nt(45,1,.1,100),this.xrCamera=null,this.url=null,this.target=new Re,this.modelContainer=new Re,this.animationNames=[],this.boundingBox=new ft,this.size=new T,this.idealAspect=0,this.framedFoVDeg=45,this.boundingRadius=0,this.shadow=null,this.shadowIntensity=0,this.shadowSoftness=1,this.exposure=1,this.canScale=!0,this.tightBounds=!1,this.isDirty=!1,this.goalTarget=new T,this.targetDamperX=new Et,this.targetDamperY=new Et,this.targetDamperZ=new Et,this._currentGLTF=null,this.cancelPendingSourceChange=null,this.animationsByName=new Map,this.currentAnimationAction=null,this.name="ModelScene",this.element=t,this.canvas=e,this.camera=new nt(45,1,.1,100),this.camera.name="MainCamera",this.add(this.target),this.setSize(n,i),this.target.name="Target",this.modelContainer.name="ModelContainer",this.target.add(this.modelContainer),this.mixer=new yf(this.modelContainer);const{domElement:r}=this.annotationRenderer,{style:a}=r;a.display="none",a.pointerEvents="none",a.position="absolute",a.top="0",this.element.shadowRoot.querySelector(".default").appendChild(r),this.schemaElement.setAttribute("type","application/ld+json")}createContext(){this.context=this.canvas.getContext("2d")}getCamera(){return this.xrCamera!=null?this.xrCamera:this.camera}queueRender(){this.isDirty=!0}shouldRender(){return this.isDirty}hasRendered(){this.isDirty=!1}async setObject(e){this.reset(),this.modelContainer.add(e),await this.setupScene()}async setSource(e,t=()=>{}){if(!e||e===this.url)return void t(1);if(this.reset(),this.url=e,this.externalRenderer!=null){const o=await this.externalRenderer.load(t);return this.boundingRadius=o.framedRadius,this.idealAspect=o.fieldOfViewAspect,void this.dispatchEvent({type:"model-load",url:this.url})}let n;this.cancelPendingSourceChange!=null&&(this.cancelPendingSourceChange(),this.cancelPendingSourceChange=null);try{n=await new Promise(async(o,l)=>{this.cancelPendingSourceChange=()=>l();try{o(await this.element[Ce].loader.load(e,this.element,t))}catch(c){l(c)}})}catch(o){if(o==null)return;throw o}this.reset(),this.url=e,this._currentGLTF=n,n!=null&&this.modelContainer.add(n.scene);const{animations:i}=n,r=new Map,a=[];for(const o of i)r.set(o.name,o),a.push(o.name);this.animations=i,this.animationsByName=r,this.animationNames=a,await this.setupScene()}async setupScene(){this.updateBoundingBox(),await this.updateFraming(),this.updateShadow(),this.setShadowIntensity(this.shadowIntensity),this.dispatchEvent({type:"model-load",url:this.url})}reset(){this.url=null,this.queueRender(),this.shadow!=null&&this.shadow.setIntensity(0);const e=this._currentGLTF;if(e!=null){for(const t of this.modelContainer.children)this.modelContainer.remove(t);e.dispose(),this._currentGLTF=null}this.currentAnimationAction!=null&&(this.currentAnimationAction.stop(),this.currentAnimationAction=null),this.mixer.stopAllAction(),this.mixer.uncacheRoot(this)}get currentGLTF(){return this._currentGLTF}setSize(e,t){if(this.width!==e||this.height!==t){if(this.width=Math.max(e,1),this.height=Math.max(t,1),this.annotationRenderer.setSize(e,t),this.aspect=this.width/this.height,this.externalRenderer!=null){const n=Uc();this.externalRenderer.resize(e*n,t*n)}this.queueRender()}}updateBoundingBox(){if(this.target.remove(this.modelContainer),this.tightBounds===!0){const e=(t,n)=>t.expandByPoint(n);this.boundingBox=gl(this.modelContainer,e,new ft)}else this.boundingBox.setFromObject(this.modelContainer);this.boundingBox.getSize(this.size),this.target.add(this.modelContainer)}async updateFraming(){this.target.remove(this.modelContainer);let e=this.boundingBox.getCenter(new T);this.tightBounds===!0&&(await this.element.requestUpdate("cameraTarget"),e=this.getTarget()),this.boundingRadius=Math.sqrt(gl(this.modelContainer,(t,n)=>Math.max(t,e.distanceToSquared(n)),0)),this.idealAspect=gl(this.modelContainer,(t,n)=>{n.sub(e);const i=Math.sqrt(n.x*n.x+n.z*n.z);return Math.max(t,i/(this.idealCameraDistance()-Math.abs(n.y)))},0)/Math.tan(this.framedFoVDeg/2*Math.PI/180),this.target.add(this.modelContainer)}idealCameraDistance(){const e=this.framedFoVDeg/2*Math.PI/180;return this.boundingRadius/Math.sin(e)}adjustedFoV(e){const t=Math.tan(e/2*Math.PI/180)*Math.max(1,this.idealAspect/this.aspect);return 2*Math.atan(t)*180/Math.PI}getNDC(e,t){if(this.xrCamera!=null)kr.set(e/window.screen.width,t/window.screen.height);else{const n=this.element.getBoundingClientRect();kr.set((e-n.x)/this.width,(t-n.y)/this.height)}return kr.multiplyScalar(2).subScalar(1),kr.y*=-1,kr}getSize(){return{width:this.width,height:this.height}}setTarget(e,t,n){this.goalTarget.set(-e,-t,-n)}setTargetDamperDecayTime(e){this.targetDamperX.setDecayTime(e),this.targetDamperY.setDecayTime(e),this.targetDamperZ.setDecayTime(e)}getTarget(){return dx.copy(this.goalTarget).multiplyScalar(-1)}jumpToGoal(){this.updateTarget(1e4)}updateTarget(e){const t=this.goalTarget,n=this.target.position;if(!t.equals(n)){const i=this.boundingRadius/10;let{x:r,y:a,z:o}=n;r=this.targetDamperX.update(r,t.x,e,i),a=this.targetDamperY.update(a,t.y,e,i),o=this.targetDamperZ.update(o,t.z,e,i),this.target.position.set(r,a,o),this.target.updateMatrixWorld(),this.setShadowRotation(this.yaw),this.queueRender()}}pointTowards(e,t){const{x:n,z:i}=this.position;this.yaw=Math.atan2(e-n,t-i)}set yaw(e){this.rotation.y=e,this.updateMatrixWorld(!0),this.setShadowRotation(e),this.queueRender()}get yaw(){return this.rotation.y}set animationTime(e){this.mixer.setTime(e)}get animationTime(){if(this.currentAnimationAction!=null){const e=Math.max(this.currentAnimationAction._loopCount,0);return this.currentAnimationAction.loop===2202&&(1&e)==1?this.duration-this.currentAnimationAction.time:this.currentAnimationAction.time}return 0}get duration(){return this.currentAnimationAction!=null&&this.currentAnimationAction.getClip()?this.currentAnimationAction.getClip().duration:0}get hasActiveAnimation(){return this.currentAnimationAction!=null}playAnimation(e=null,t=0,n=2201,i=1/0){if(this._currentGLTF==null)return;const{animations:r}=this;if(r==null||r.length===0)return void console.warn("Cannot play animation (model does not have any animations)");let a=null;e!=null&&(a=this.animationsByName.get(e)),a==null&&(a=r[0]);try{const{currentAnimationAction:o}=this,l=this.mixer.clipAction(a,this);this.currentAnimationAction=l,this.element.paused?this.mixer.stopAllAction():o!=null&&l!==o&&l.crossFadeFrom(o,t,!1),l.setLoop(n,i),l.enabled=!0,l.play()}catch(o){console.error(o)}}stopAnimation(){this.currentAnimationAction=null,this.mixer.stopAllAction()}updateAnimation(e){this.mixer.update(e)}subscribeMixerEvent(e,t){this.mixer.addEventListener(e,t)}updateShadow(){const e=this.shadow;if(e!=null){const t=this.element.arPlacement==="wall"?"back":"bottom";e.setScene(this,this.shadowSoftness,t),e.setRotation(this.yaw)}}setShadowIntensity(e){if(this.shadowIntensity=e,this._currentGLTF!=null&&!(e<=0&&this.shadow==null)){if(this.shadow==null){const t=this.element.arPlacement==="wall"?"back":"bottom";this.shadow=new hx(this,this.shadowSoftness,t),this.shadow.setRotation(this.yaw)}this.shadow.setIntensity(e)}}setShadowSoftness(e){this.shadowSoftness=e;const t=this.shadow;t!=null&&t.setSoftness(e)}setShadowRotation(e){const t=this.shadow;t!=null&&t.setRotation(e)}isShadowDirty(){const e=this.shadow;if(e==null)return!1;{const{needsUpdate:t}=e;return e.needsUpdate=!1,t}}setShadowScaleAndOffset(e,t){const n=this.shadow;n!=null&&n.setScaleAndOffset(e,t)}get raycaster(){return ux}positionAndNormalFromPoint(e,t=this){this.raycaster.setFromCamera(e,this.getCamera());const n=this.raycaster.intersectObject(t,!0);if(n.length===0)return null;const i=n[0];return i.face==null?null:i.uv==null?{position:i.point,normal:i.face.normal,uv:null}:(i.face.normal.applyNormalMatrix(new $e().getNormalMatrix(i.object.matrixWorld)),{position:i.point,normal:i.face.normal,uv:i.uv})}addHotspot(e){this.target.add(e),this.annotationRenderer.domElement.appendChild(e.element)}removeHotspot(e){this.target.remove(e)}forHotspots(e){const{children:t}=this.target;for(let n=0,i=t.length;n<i;n++){const r=t[n];r instanceof If&&e(r)}}updateHotspots(e){this.forHotspots(t=>{vl.copy(e),dd.setFromMatrixPosition(t.matrixWorld),vl.sub(dd),pd.copy(t.normal).transformDirection(this.target.matrixWorld),vl.dot(pd)<0?t.hide():t.show()})}orientHotspots(e){this.forHotspots(t=>{t.orient(e)})}setHotspotsVisibility(e){this.forHotspots(t=>{t.visible=e})}updateSchema(e){var t;const{schemaElement:n,element:i}=this,{alt:r,poster:a,iosSrc:o}=i;if(e!=null){const l=[{"@type":"MediaObject",contentUrl:e,encodingFormat:((t=e.split(".").pop())===null||t===void 0?void 0:t.toLowerCase())==="gltf"?"model/gltf+json":"model/gltf-binary"}];o&&l.push({"@type":"MediaObject",contentUrl:o,encodingFormat:"model/vnd.usdz+zip"});const c={"@context":"http://schema.org/","@type":"3DModel",image:a??void 0,name:r??void 0,encoding:l};n.textContent=JSON.stringify(c),document.head.appendChild(n)}else n.parentElement!=null&&n.parentElement.removeChild(n)}}/* @license
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
 */var zr=function(s,e,t,n){for(var i,r=arguments.length,a=r<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,t):n,o=s.length-1;o>=0;o--)(i=s[o])&&(a=(r<3?i(a):r>3?i(e,t,a):i(e,t))||a);return r>3&&a&&Object.defineProperty(e,t,a),a};const Br=Symbol("currentEnvironmentMap"),ya=Symbol("applyEnvironmentMap"),Oa=Symbol("updateEnvironment"),Hr=Symbol("cancelEnvironmentUpdate"),yl=Symbol("onPreload");class mx{constructor(e,t,n,i,r){this.xrLight=e,this.renderer=t,this.lightProbe=n,this.xrWebGLBinding=null,this.estimationStartCallback=r,this.frameCallback=this.onXRFrame.bind(this);const a=t.xr.getSession();if(i&&"XRWebGLBinding"in window){const o=new so(16);e.environment=o.texture;const l=t.getContext();switch(a.preferredReflectionFormat){case"srgba8":l.getExtension("EXT_sRGB");break;case"rgba16f":l.getExtension("OES_texture_half_float")}this.xrWebGLBinding=new XRWebGLBinding(a,l),this.lightProbe.addEventListener("reflectionchange",()=>{this.updateReflection()})}a.requestAnimationFrame(this.frameCallback)}updateReflection(){const e=this.renderer.properties.get(this.xrLight.environment);if(e){const t=this.xrWebGLBinding.getReflectionCubeMap(this.lightProbe);t&&(e.__webglTexture=t)}}onXRFrame(e,t){if(!this.xrLight)return;t.session.requestAnimationFrame(this.frameCallback);const n=t.getLightEstimate(this.lightProbe);if(n){this.xrLight.lightProbe.sh.fromArray(n.sphericalHarmonicsCoefficients),this.xrLight.lightProbe.intensity=1;const i=Math.max(1,Math.max(n.primaryLightIntensity.x,Math.max(n.primaryLightIntensity.y,n.primaryLightIntensity.z)));this.xrLight.directionalLight.color.setRGB(n.primaryLightIntensity.x/i,n.primaryLightIntensity.y/i,n.primaryLightIntensity.z/i),this.xrLight.directionalLight.intensity=i,this.xrLight.directionalLight.position.copy(n.primaryLightDirection),this.estimationStartCallback&&(this.estimationStartCallback(),this.estimationStartCallback=null)}}dispose(){this.xrLight=null,this.renderer=null,this.lightProbe=null,this.xrWebGLBinding=null}}class fx extends En{constructor(e,t=!0){super(),this.lightProbe=new vo,this.lightProbe.intensity=0,this.add(this.lightProbe),this.directionalLight=new go,this.directionalLight.intensity=0,this.add(this.directionalLight),this.environment=null;let n=null,i=!1;e.xr.addEventListener("sessionstart",()=>{const r=e.xr.getSession();"requestLightProbe"in r&&r.requestLightProbe({reflectionFormat:r.preferredReflectionFormat}).then(a=>{n=new mx(this,e,a,t,()=>{i=!0,this.dispatchEvent({type:"estimationstart"})})})}),e.xr.addEventListener("sessionend",()=>{n&&(n.dispose(),n=null),i&&this.dispatchEvent({type:"estimationend"})}),this.dispose=()=>{n&&(n.dispose(),n=null),this.remove(this.lightProbe),this.lightProbe=null,this.remove(this.directionalLight),this.directionalLight=null,this.environment=null}}}/* @license
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
 */const gx=Math.PI/24,md=new $,xa=(s,e,t)=>{let n=e>0?t>0?0:-Math.PI/2:t>0?Math.PI/2:Math.PI;for(let i=0;i<=12;++i)s.push(e+.17*Math.cos(n),t+.17*Math.sin(n),0,e+.2*Math.cos(n),t+.2*Math.sin(n),0),n+=gx};class fd extends me{constructor(e,t){const n=new Oe,i=[],r=[],{size:a,boundingBox:o}=e,l=a.x/2,c=(t==="back"?a.y:a.z)/2;xa(r,l,c),xa(r,-l,c),xa(r,-l,-c),xa(r,l,-c);const h=r.length/3;for(let p=0;p<h-2;p+=2)i.push(p,p+1,p+3,p,p+3,p+2);const u=h-2;i.push(u,u+1,1,u,1,0),n.setAttribute("position",new Ke(r,3)),n.setIndex(i),super(n),this.side=t;const d=this.material;switch(d.side=0,d.transparent=!0,d.opacity=0,this.goalOpacity=0,this.opacityDamper=new Et,this.hitPlane=new me(new Ti(2*(l+.2),2*(c+.2))),this.hitPlane.visible=!1,this.add(this.hitPlane),o.getCenter(this.position),t){case"bottom":this.rotateX(-Math.PI/2),this.shadowHeight=o.min.y,this.position.y=this.shadowHeight;break;case"back":this.shadowHeight=o.min.z,this.position.z=this.shadowHeight}e.target.add(this)}getHit(e,t,n){md.set(t,-n),this.hitPlane.visible=!0;const i=e.positionAndNormalFromPoint(md,this.hitPlane);return this.hitPlane.visible=!1,i==null?null:i.position}getExpandedHit(e,t,n){this.hitPlane.scale.set(1e3,1e3,1e3);const i=this.getHit(e,t,n);return this.hitPlane.scale.set(1,1,1),i}set offsetHeight(e){this.side==="back"?this.position.z=this.shadowHeight+e:this.position.y=this.shadowHeight+e}get offsetHeight(){return this.side==="back"?this.position.z-this.shadowHeight:this.position.y-this.shadowHeight}set show(e){this.goalOpacity=e?.75:0}updateOpacity(e){const t=this.material;t.opacity=this.opacityDamper.update(t.opacity,this.goalOpacity,e,1),this.visible=t.opacity>0}dispose(){var e;const{geometry:t,material:n}=this.hitPlane;t.dispose(),n.dispose(),this.geometry.dispose(),this.material.dispose(),(e=this.parent)===null||e===void 0||e.remove(this)}}/* @license
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
 */const Ua="not-presenting",Df="session-started",vx="object-placed",yx="failed",Nf="tracking",xx="not-tracking",ba=new T,bx=new he,wx=new T,_x=new nt(45,1,.1,100);class Mx extends At{constructor(e){super(),this.renderer=e,this.currentSession=null,this.placeOnWall=!1,this.placementBox=null,this.lastTick=null,this.turntableRotation=null,this.oldShadowIntensity=null,this.oldBackground=null,this.oldEnvironment=null,this.frame=null,this.initialHitSource=null,this.transientHitTestSource=null,this.inputSource=null,this._presentedScene=null,this.resolveCleanup=null,this.exitWebXRButtonContainer=null,this.overlay=null,this.xrLight=null,this.tracking=!0,this.frames=0,this.initialized=!1,this.oldTarget=new T,this.placementComplete=!1,this.isTranslating=!1,this.isRotating=!1,this.isTwoFingering=!1,this.lastDragPosition=new T,this.firstRatio=0,this.lastAngle=0,this.goalPosition=new T,this.goalYaw=0,this.goalScale=1,this.xDamper=new Et,this.yDamper=new Et,this.zDamper=new Et,this.yawDamper=new Et,this.scaleDamper=new Et,this.onExitWebXRButtonContainerClick=()=>this.stopPresenting(),this.onUpdateScene=()=>{this.placementBox!=null&&this.isPresenting&&(this.placementBox.dispose(),this.placementBox=new fd(this.presentedScene,this.placeOnWall?"back":"bottom"))},this.onSelectStart=t=>{const n=this.transientHitTestSource;if(n==null)return;const i=this.frame.getHitTestResultsForTransientInput(n),r=this.presentedScene,a=this.placementBox;if(i.length===1){this.inputSource=t.inputSource;const{axes:o}=this.inputSource.gamepad,l=a.getHit(this.presentedScene,o[0],o[1]);a.show=!0,l!=null?(this.isTranslating=!0,this.lastDragPosition.copy(l)):this.placeOnWall===!1&&(this.isRotating=!0,this.lastAngle=1.5*o[0])}else if(i.length===2){a.show=!0,this.isTwoFingering=!0;const{separation:o}=this.fingerPolar(i);this.firstRatio=o/r.scale.x}},this.onSelectEnd=()=>{this.isTranslating=!1,this.isRotating=!1,this.isTwoFingering=!1,this.inputSource=null,this.goalPosition.y+=this.placementBox.offsetHeight*this.presentedScene.scale.x,this.placementBox.show=!1},this.threeRenderer=e.threeRenderer,this.threeRenderer.xr.enabled=!0}async resolveARSession(){ld();const e=await navigator.xr.requestSession("immersive-ar",{requiredFeatures:["hit-test"],optionalFeatures:["dom-overlay","light-estimation"],domOverlay:{root:this.overlay}});return this.threeRenderer.xr.setReferenceSpaceType("local"),await this.threeRenderer.xr.setSession(e),this.threeRenderer.xr.cameraAutoUpdate=!1,e}get presentedScene(){return this._presentedScene}async supportsPresentation(){try{return ld(),await navigator.xr.isSessionSupported("immersive-ar")}catch(e){return console.warn("Request to present in WebXR denied:"),console.warn(e),console.warn("Falling back to next ar-mode"),!1}}async present(e,t=!1){this.isPresenting&&console.warn("Cannot present while a model is already presenting");let n=new Promise((c,h)=>{requestAnimationFrame(()=>c())});e.setHotspotsVisibility(!1),e.queueRender(),await n,this._presentedScene=e,this.overlay=e.element.shadowRoot.querySelector("div.default"),t===!0&&(this.xrLight=new fx(this.threeRenderer),this.xrLight.addEventListener("estimationstart",()=>{if(!this.isPresenting||this.xrLight==null)return;const c=this.presentedScene;c.add(this.xrLight),this.oldEnvironment=c.environment,c.environment=this.xrLight.environment}));const i=await this.resolveARSession();i.addEventListener("end",()=>{this.postSessionCleanup()},{once:!0});const r=e.element.shadowRoot.querySelector(".slot.exit-webxr-ar-button");r.classList.add("enabled"),r.addEventListener("click",this.onExitWebXRButtonContainerClick),this.exitWebXRButtonContainer=r;const a=await i.requestReferenceSpace("viewer");this.tracking=!0,this.frames=0,this.initialized=!1,this.turntableRotation=e.yaw,this.goalYaw=e.yaw,this.goalScale=1,this.oldBackground=e.background,e.background=null,this.oldShadowIntensity=e.shadowIntensity,e.setShadowIntensity(.01),this.oldTarget.copy(e.getTarget()),e.addEventListener("model-load",this.onUpdateScene);const o=20*Math.PI/180,l=this.placeOnWall===!0?void 0:new XRRay(new DOMPoint(0,0,0),{x:0,y:-Math.sin(o),z:-Math.cos(o)});i.requestHitTestSource({space:a,offsetRay:l}).then(c=>{this.initialHitSource=c}),this.currentSession=i,this.placementBox=new fd(e,this.placeOnWall?"back":"bottom"),this.placementComplete=!1,this.lastTick=performance.now(),this.dispatchEvent({type:"status",status:Df})}async stopPresenting(){if(!this.isPresenting)return;const e=new Promise(t=>{this.resolveCleanup=t});try{await this.currentSession.end(),await e}catch(t){console.warn("Error while trying to end WebXR AR session"),console.warn(t),this.postSessionCleanup()}}get isPresenting(){return this.presentedScene!=null}get target(){return this.oldTarget}updateTarget(){const e=this.presentedScene;if(e!=null){const t=e.getTarget();this.oldTarget.copy(t),this.placeOnWall?t.z=e.boundingBox.min.z:t.y=e.boundingBox.min.y,e.setTarget(t.x,t.y,t.z)}}postSessionCleanup(){const e=this.currentSession;e!=null&&(e.removeEventListener("selectstart",this.onSelectStart),e.removeEventListener("selectend",this.onSelectEnd),this.currentSession=null);const t=this.presentedScene;if(t!=null){const{element:a}=t;this.xrLight!=null&&(t.remove(this.xrLight),this.oldEnvironment!=null&&(t.environment=this.oldEnvironment,this.oldEnvironment=null),this.xrLight.dispose(),this.xrLight=null),t.position.set(0,0,0),t.scale.set(1,1,1),t.setShadowScaleAndOffset(1,0);const o=this.turntableRotation;o!=null&&(t.yaw=o);const l=this.oldShadowIntensity;l!=null&&t.setShadowIntensity(l);const c=this.oldBackground;c!=null&&(t.background=c);const h=this.oldTarget;t.setTarget(h.x,h.y,h.z),t.xrCamera=null,t.removeEventListener("model-load",this.onUpdateScene),t.orientHotspots(0),a.requestUpdate("cameraTarget"),a.requestUpdate("maxCameraOrbit"),a[Is](a.getBoundingClientRect())}this.renderer.height=0;const n=this.exitWebXRButtonContainer;n!=null&&(n.classList.remove("enabled"),n.removeEventListener("click",this.onExitWebXRButtonContainerClick),this.exitWebXRButtonContainer=null);const i=this.transientHitTestSource;i!=null&&(i.cancel(),this.transientHitTestSource=null);const r=this.initialHitSource;r!=null&&(r.cancel(),this.initialHitSource=null),this.placementBox!=null&&(this.placementBox.dispose(),this.placementBox=null),this.lastTick=null,this.turntableRotation=null,this.oldShadowIntensity=null,this.oldBackground=null,this._presentedScene=null,this.frame=null,this.inputSource=null,this.overlay=null,this.resolveCleanup!=null&&this.resolveCleanup(),this.dispatchEvent({type:"status",status:Ua})}updateView(e){const t=this.presentedScene,n=this.threeRenderer.xr;n.updateCamera(_x),t.xrCamera=n.getCamera();const{elements:i}=t.getCamera().matrixWorld;if(t.orientHotspots(Math.atan2(i[1],i[5])),this.initialized||(this.placeInitially(),this.initialized=!0),e.requestViewportScale&&e.recommendedViewportScale){const a=e.recommendedViewportScale;e.requestViewportScale(Math.max(a,.25))}const r=this.currentSession.renderState.baseLayer.getViewport(e);this.threeRenderer.setViewport(r.x,r.y,r.width,r.height)}placeInitially(){const e=this.presentedScene,{position:t,element:n}=e,i=e.getCamera(),{width:r,height:a}=this.overlay.getBoundingClientRect();e.setSize(r,a),i.projectionMatrixInverse.copy(i.projectionMatrix).invert();const{theta:o,radius:l}=n.getCameraOrbit(),c=i.getWorldDirection(ba);e.yaw=Math.atan2(-c.x,-c.z)-o,this.goalYaw=e.yaw,t.copy(i.position).add(c.multiplyScalar(l)),this.updateTarget();const h=e.getTarget();t.add(h).sub(this.oldTarget),this.goalPosition.copy(t),e.setHotspotsVisibility(!0);const{session:u}=this.frame;u.addEventListener("selectstart",this.onSelectStart),u.addEventListener("selectend",this.onSelectEnd),u.requestHitTestSourceForTransientInput({profile:"generic-touchscreen"}).then(d=>{this.transientHitTestSource=d})}getTouchLocation(){const{axes:e}=this.inputSource.gamepad;let t=this.placementBox.getExpandedHit(this.presentedScene,e[0],e[1]);return t!=null&&(ba.copy(t).sub(this.presentedScene.getCamera().position),ba.length()>10)?null:t}getHitPoint(e){const t=this.threeRenderer.xr.getReferenceSpace(),n=e.getPose(t);if(n==null)return null;const i=bx.fromArray(n.transform.matrix);return this.placeOnWall===!0&&(this.goalYaw=Math.atan2(i.elements[4],i.elements[6])),i.elements[5]>.75!==this.placeOnWall?wx.setFromMatrixPosition(i):null}moveToFloor(e){const t=this.initialHitSource;if(t==null)return;const n=e.getHitTestResults(t);if(n.length==0)return;const i=n[0],r=this.getHitPoint(i);r!=null&&(this.placementBox.show=!0,this.isTranslating||(this.placeOnWall?this.goalPosition.copy(r):this.goalPosition.y=r.y),t.cancel(),this.initialHitSource=null,this.dispatchEvent({type:"status",status:vx}))}fingerPolar(e){const t=e[0].inputSource.gamepad.axes,n=e[1].inputSource.gamepad.axes,i=n[0]-t[0],r=n[1]-t[1],a=Math.atan2(r,i);let o=this.lastAngle-a;return o>Math.PI?o-=2*Math.PI:o<-Math.PI&&(o+=2*Math.PI),this.lastAngle=a,{separation:Math.sqrt(i*i+r*r),deltaYaw:o}}processInput(e){const t=this.transientHitTestSource;if(t==null||!this.isTranslating&&!this.isTwoFingering&&!this.isRotating)return;const n=e.getHitTestResultsForTransientInput(t),i=this.presentedScene,r=i.scale.x;if(this.isTwoFingering)if(n.length<2)this.isTwoFingering=!1;else{const{separation:a,deltaYaw:o}=this.fingerPolar(n);if(this.placeOnWall===!1&&(this.goalYaw+=o),i.canScale){const l=a/this.firstRatio;this.goalScale=l<1.3&&l>.7692307692307692?1:l}}else if(n.length!==2)if(this.isRotating){const a=1.5*this.inputSource.gamepad.axes[0];this.goalYaw+=a-this.lastAngle,this.lastAngle=a}else this.isTranslating&&n.forEach(a=>{if(a.inputSource!==this.inputSource)return;let o=null;if(a.results.length>0&&(o=this.getHitPoint(a.results[0])),o==null&&(o=this.getTouchLocation()),o!=null){if(this.goalPosition.sub(this.lastDragPosition),this.placeOnWall===!1){const l=o.y-this.lastDragPosition.y;if(l<0){this.placementBox.offsetHeight=l/r,this.presentedScene.setShadowScaleAndOffset(r,l);const c=ba.copy(i.getCamera().position),h=-l/(c.y-o.y);c.multiplyScalar(h),o.multiplyScalar(1-h).add(c)}}this.goalPosition.add(o),this.lastDragPosition.copy(o)}});else{this.isTranslating=!1,this.isRotating=!1,this.isTwoFingering=!0;const{separation:a}=this.fingerPolar(n);this.firstRatio=a/r}}moveScene(e){const t=this.presentedScene,{position:n,yaw:i,boundingRadius:r}=t,a=this.goalPosition,o=t.scale.x,l=this.placementBox;if(!a.equals(n)||this.goalScale!==o){let{x:c,y:h,z:u}=n;c=this.xDamper.update(c,a.x,e,r),h=this.yDamper.update(h,a.y,e,r),u=this.zDamper.update(u,a.z,e,r),n.set(c,h,u);const d=this.scaleDamper.update(o,this.goalScale,e,1);if(t.scale.set(d,d,d),!this.isTranslating){const p=a.y-h;this.placementComplete&&this.placeOnWall===!1?(l.offsetHeight=p/d,t.setShadowScaleAndOffset(d,p)):p===0&&(this.placementComplete=!0,l.show=!1,t.setShadowIntensity(.3))}}l.updateOpacity(e),t.updateTarget(e),t.yaw=this.yawDamper.update(i,this.goalYaw,e,Math.PI)}onWebXRFrame(e,t){this.frame=t,++this.frames;const n=this.threeRenderer.xr.getReferenceSpace(),i=t.getViewerPose(n);i==null&&this.tracking===!0&&this.frames>30&&(this.tracking=!1,this.dispatchEvent({type:"tracking",status:xx}));const r=this.presentedScene;if(i==null||r==null||!r.element[xi]())return void this.threeRenderer.clear();this.tracking===!1&&(this.tracking=!0,this.dispatchEvent({type:"tracking",status:Nf}));let a=!0;for(const o of i.views){if(this.updateView(o),a){this.moveToFloor(t),this.processInput(t);const c=e-this.lastTick;this.moveScene(c),this.renderer.preRender(r,e,c),this.lastTick=e}const l=this.threeRenderer.getContext();l.depthMask(!1),l.clear(l.DEPTH_BUFFER_BIT),l.depthMask(!0),this.threeRenderer.render(r,r.getCamera()),a=!1}}}/* @license
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
 */class Sx{constructor(e){e.threeRenderer.debug={checkShaderErrors:!0},Promise.resolve().then(()=>{self.dispatchEvent(new CustomEvent("model-viewer-renderer-debug",{detail:{renderer:e,THREE:{ShaderMaterial:Pn,Texture:qe,Mesh:me,Scene:an,PlaneBufferGeometry:Ti,OrthographicCamera:fr,WebGLRenderTarget:wt}}}))})}addScene(e){self.dispatchEvent(new CustomEvent("model-viewer-scene-added-debug",{detail:{scene:e}}))}removeScene(e){self.dispatchEvent(new CustomEvent("model-viewer-scene-removed-debug",{detail:{scene:e}}))}}function Tx(s){const e=new Map,t=new Map,n=s.clone();return Ff(s,n,function(i,r){e.set(r,i),t.set(i,r)}),n.traverse(function(i){if(!i.isSkinnedMesh)return;const r=i,a=e.get(i),o=a.skeleton.bones;r.skeleton=a.skeleton.clone(),r.bindMatrix.copy(a.bindMatrix),r.skeleton.bones=o.map(function(l){return t.get(l)}),r.bind(r.skeleton,r.bindMatrix)}),n}function Ff(s,e,t){t(s,e);for(let n=0;n<s.children.length;n++)Ff(s.children[n],e.children[n],t)}/* @license
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
 */const gd=Symbol("prepared"),Za=Symbol("prepare"),Yt=Symbol("preparedGLTF"),Ja=Symbol("clone");class Ex{constructor(e){this[Yt]=e}static prepare(e){if(e.scene==null)throw new Error("Model does not have a scene");if(e[gd])return e;const t=this[Za](e);return t[gd]=!0,t}static[Za](e){const{scene:t}=e,n=[t];return Object.assign(Object.assign({},e),{scene:t,scenes:n})}get parser(){return this[Yt].parser}get animations(){return this[Yt].animations}get scene(){return this[Yt].scene}get scenes(){return this[Yt].scenes}get cameras(){return this[Yt].cameras}get asset(){return this[Yt].asset}get userData(){return this[Yt].userData}clone(){return new this.constructor(this[Ja]())}dispose(){this.scenes.forEach(e=>{e.traverse(t=>{if(!t.isMesh)return;const n=t;(Array.isArray(n.material)?n.material:[n.material]).forEach(i=>{for(const r in i){const a=i[r];a instanceof qe&&a.dispose()}i.dispose()}),n.geometry.dispose()})})}[Ja](){const e=this[Yt],t=Tx(this.scene);Ax(t,this.scene);const n=[t],i=e.userData?Object.assign({},e.userData):{};return Object.assign(Object.assign({},e),{scene:t,scenes:n,userData:i})}}const Ax=(s,e)=>{Of(s,e,(t,n)=>{n.userData.variantMaterials!==void 0&&(t.userData.variantMaterials=new Map(n.userData.variantMaterials)),n.userData.variantData!==void 0&&(t.userData.variantData=n.userData.variantData),n.userData.originalMaterial!==void 0&&(t.userData.originalMaterial=n.userData.originalMaterial)})},Of=(s,e,t)=>{t(s,e);for(let n=0;n<s.children.length;n++)Of(s.children[n],e.children[n],t)},vd=Symbol("threeGLTF"),yd=Symbol("gltf"),xd=Symbol("gltfElementMap"),bd=Symbol("threeObjectMap"),wd=Symbol("parallelTraverseThreeScene"),_d=Symbol("correlateOriginalThreeGLTF"),Md=Symbol("correlateCloneThreeGLTF");class Ps{constructor(e,t,n,i){this[vd]=e,this[yd]=t,this[xd]=i,this[bd]=n}static from(e,t){return t!=null?this[Md](e,t):this[_d](e)}static[_d](e){const t=e.parser.json,n=e.parser.associations,i=new Map,r={name:"Default"},a={type:"materials",index:-1};for(const o of n.keys())o instanceof Je&&n.get(o)==null&&(a.index<0&&(t.materials==null&&(t.materials=[]),a.index=t.materials.length,t.materials.push(r)),o.name=r.name,n.set(o,{materials:a.index}));for(const[o,l]of n){if(l){const c=o;c.userData=c.userData||{},c.userData.associations=l}for(const c in l)if(c!=null&&c!=="primitives"){const h=c,u=(t[h]||[])[l[h]];if(u==null)continue;let d=i.get(u);d==null&&(d=new Set,i.set(u,d)),d.add(o)}}return new Ps(e,t,n,i)}static[Md](e,t){const n=t.threeGLTF,i=t.gltf,r=JSON.parse(JSON.stringify(i)),a=new Map,o=new Map;for(let l=0;l<n.scenes.length;l++)this[wd](n.scenes[l],e.scenes[l],(c,h)=>{const u=t.threeObjectMap.get(c);if(u!=null){for(const d in u)if(d!=null&&d!=="primitives"){const p=d,m=u[p],f=r[p][m],g=a.get(h)||{};g[p]=m,a.set(h,g);const x=o.get(f)||new Set;x.add(h),o.set(f,x)}}});return new Ps(e,r,a,o)}static[wd](e,t,n){const i=(r,a)=>{if(n(r,a),r.isObject3D){if(r.isMesh)if(Array.isArray(r.material))for(let o=0;o<r.material.length;++o)i(r.material[o],a.material[o]);else i(r.material,a.material);for(let o=0;o<r.children.length;++o)i(r.children[o],a.children[o])}};i(e,t)}get threeGLTF(){return this[vd]}get gltf(){return this[yd]}get gltfElementMap(){return this[xd]}get threeObjectMap(){return this[bd]}}/* @license
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
 */const wa=Symbol("correlatedSceneGraph");class Rx extends Ex{static[Za](e){const t=super[Za](e);t[wa]==null&&(t[wa]=Ps.from(t));const{scene:n}=t,i=new ei(void 0,1/0);return n.traverse(r=>{r.renderOrder=1e3,r.frustumCulled=!1,r.name||(r.name=r.uuid);const a=r;a.isMesh&&(a.castShadow=!0,a.isSkinnedMesh&&(a.geometry.boundingSphere=i,a.geometry.boundingBox=null),a.material.shadowSide=0)}),t}get correlatedSceneGraph(){return this[Yt][wa]}[Ja](){const e=super[Ja](),t=new Map;return e.scene.traverse(n=>{if(n.isMesh){const i=n,r=i.material;if(r!=null){if(t.has(r.uuid))return void(i.material=t.get(r.uuid));i.material=r.clone(),t.set(r.uuid,i.material)}}}),e[wa]=Ps.from(e,this.correlatedSceneGraph),e}}/* @license
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
 */class Lx extends an{constructor(){super(),this.position.y=-3.5;const e=new ti;e.deleteAttribute("uv");const t=new In({metalness:0,side:1}),n=new In({metalness:0}),i=new fo(16777215,500,28,2);i.position.set(.418,16.199,.3),this.add(i);const r=new me(e,t);r.position.set(-.757,13.219,.717),r.scale.set(31.713,28.305,28.591),this.add(r);const a=new me(e,n);a.position.set(-10.906,2.009,1.846),a.rotation.set(0,-.195,0),a.scale.set(2.328,7.905,4.651),this.add(a);const o=new me(e,n);o.position.set(-5.607,-.754,-.758),o.rotation.set(0,.994,0),o.scale.set(1.97,1.534,3.955),this.add(o);const l=new me(e,n);l.position.set(6.167,.857,7.803),l.rotation.set(0,.561,0),l.scale.set(3.927,6.285,3.687),this.add(l);const c=new me(e,n);c.position.set(-2.017,.018,6.124),c.rotation.set(0,.333,0),c.scale.set(2.002,4.566,2.064),this.add(c);const h=new me(e,n);h.position.set(2.291,-.756,-2.621),h.rotation.set(0,-.286,0),h.scale.set(1.546,1.552,1.496),this.add(h);const u=new me(e,n);u.position.set(-2.193,-.369,-5.547),u.rotation.set(0,.516,0),u.scale.set(3.875,3.487,2.986),this.add(u);const d=new me(e,this.createAreaLightMaterial(50));d.position.set(-16.116,14.37,8.208),d.scale.set(.1,2.428,2.739),this.add(d);const p=new me(e,this.createAreaLightMaterial(50));p.position.set(-16.109,18.021,-8.207),p.scale.set(.1,2.425,2.751),this.add(p);const m=new me(e,this.createAreaLightMaterial(17));m.position.set(14.904,12.198,-1.832),m.scale.set(.15,4.265,6.331),this.add(m);const f=new me(e,this.createAreaLightMaterial(43));f.position.set(-.462,8.89,14.52),f.scale.set(4.38,5.441,.088),this.add(f);const g=new me(e,this.createAreaLightMaterial(20));g.position.set(3.235,11.486,-12.541),g.scale.set(2.5,2,.1),this.add(g);const x=new me(e,this.createAreaLightMaterial(100));x.position.set(0,20,0),x.scale.set(1,.1,1),this.add(x)}createAreaLightMaterial(e){const t=new jt;return t.color.setScalar(e),t}}/* @license
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
 */class Cx extends an{constructor(){super(),this.position.y=-3.5;const e=new ti;e.deleteAttribute("uv");const t=new In({metalness:0,side:1}),n=new In({metalness:0}),i=new fo(16777215,400,28,2);i.position.set(.5,14,.5),this.add(i);const r=new me(e,t);r.position.set(0,13.2,0),r.scale.set(31.5,28.5,31.5),this.add(r);const a=new me(e,n);a.position.set(-10.906,-1,1.846),a.rotation.set(0,-.195,0),a.scale.set(2.328,7.905,4.651),this.add(a);const o=new me(e,n);o.position.set(-5.607,-.754,-.758),o.rotation.set(0,.994,0),o.scale.set(1.97,1.534,3.955),this.add(o);const l=new me(e,n);l.position.set(6.167,-.16,7.803),l.rotation.set(0,.561,0),l.scale.set(3.927,6.285,3.687),this.add(l);const c=new me(e,n);c.position.set(-2.017,.018,6.124),c.rotation.set(0,.333,0),c.scale.set(2.002,4.566,2.064),this.add(c);const h=new me(e,n);h.position.set(2.291,-.756,-2.621),h.rotation.set(0,-.286,0),h.scale.set(1.546,1.552,1.496),this.add(h);const u=new me(e,n);u.position.set(-2.193,-.369,-5.547),u.rotation.set(0,.516,0),u.scale.set(3.875,3.487,2.986),this.add(u);const d=new me(e,this.createAreaLightMaterial(80));d.position.set(-14,10,8),d.scale.set(.1,2.5,2.5),this.add(d);const p=new me(e,this.createAreaLightMaterial(80));p.position.set(-14,14,-4),p.scale.set(.1,2.5,2.5),this.add(p);const m=new me(e,this.createAreaLightMaterial(23));m.position.set(14,12,0),m.scale.set(.1,5,5),this.add(m);const f=new me(e,this.createAreaLightMaterial(16));f.position.set(0,9,14),f.scale.set(5,5,.1),this.add(f);const g=new me(e,this.createAreaLightMaterial(80));g.position.set(7,8,-14),g.scale.set(2.5,2.5,.1),this.add(g);const x=new me(e,this.createAreaLightMaterial(80));x.position.set(-7,16,-14),x.scale.set(2.5,2.5,.1),this.add(x);const v=new me(e,this.createAreaLightMaterial(1));v.position.set(0,20,0),v.scale.set(.1,.1,.1),this.add(v)}createAreaLightMaterial(e){const t=new jt;return t.color.setScalar(e),t}}/* @license
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
 */const Px=/\.hdr(\.js)?$/,Ix=new mo,Uf=new class extends Qv{constructor(s){super(s),this.type=1016}parse(s){const e=function(o,l){switch(o){case 1:console.error("THREE.RGBELoader Read Error: "+(l||""));break;case 2:console.error("THREE.RGBELoader Write Error: "+(l||""));break;case 3:console.error("THREE.RGBELoader Bad File Format: "+(l||""));break;default:console.error("THREE.RGBELoader: Error: "+(l||""))}return-1},t=function(o,l,c){l=l||1024;let h=o.pos,u=-1,d=0,p="",m=String.fromCharCode.apply(null,new Uint16Array(o.subarray(h,h+128)));for(;0>(u=m.indexOf(`
`))&&d<l&&h<o.byteLength;)p+=m,d+=m.length,h+=128,m+=String.fromCharCode.apply(null,new Uint16Array(o.subarray(h,h+128)));return-1<u&&(c!==!1&&(o.pos+=d+u+1),p+m.slice(0,u))},n=function(o,l,c,h){const u=o[l+3],d=Math.pow(2,u-128)/255;c[h+0]=o[l+0]*d,c[h+1]=o[l+1]*d,c[h+2]=o[l+2]*d},i=function(o,l,c,h){const u=o[l+3],d=Math.pow(2,u-128)/255;c[h+0]=sl.toHalfFloat(Math.min(o[l+0]*d,65504)),c[h+1]=sl.toHalfFloat(Math.min(o[l+1]*d,65504)),c[h+2]=sl.toHalfFloat(Math.min(o[l+2]*d,65504))},r=new Uint8Array(s);r.pos=0;const a=function(o){const l=/^\s*GAMMA\s*=\s*(\d+(\.\d+)?)\s*$/,c=/^\s*EXPOSURE\s*=\s*(\d+(\.\d+)?)\s*$/,h=/^\s*FORMAT=(\S+)\s*$/,u=/^\s*\-Y\s+(\d+)\s+\+X\s+(\d+)\s*$/,d={valid:0,string:"",comments:"",programtype:"RGBE",format:"",gamma:1,exposure:1,width:0,height:0};let p,m;if(o.pos>=o.byteLength||!(p=t(o)))return e(1,"no header found");if(!(m=p.match(/^#\?(\S+)/)))return e(3,"bad initial token");for(d.valid|=1,d.programtype=m[1],d.string+=p+`
`;p=t(o),p!==!1;)if(d.string+=p+`
`,p.charAt(0)!=="#"){if((m=p.match(l))&&(d.gamma=parseFloat(m[1],10)),(m=p.match(c))&&(d.exposure=parseFloat(m[1],10)),(m=p.match(h))&&(d.valid|=2,d.format=m[1]),(m=p.match(u))&&(d.valid|=4,d.height=parseInt(m[1],10),d.width=parseInt(m[2],10)),2&d.valid&&4&d.valid)break}else d.comments+=p+`
`;return 2&d.valid?4&d.valid?d:e(3,"missing image size specifier"):e(3,"missing format specifier")}(r);if(a!==-1){const o=a.width,l=a.height,c=function(h,u,d){const p=u;if(p<8||p>32767||h[0]!==2||h[1]!==2||128&h[2])return new Uint8Array(h);if(p!==(h[2]<<8|h[3]))return e(3,"wrong scanline width");const m=new Uint8Array(4*u*d);if(!m.length)return e(4,"unable to allocate buffer space");let f=0,g=0;const x=4*p,v=new Uint8Array(4),y=new Uint8Array(x);let b=d;for(;b>0&&g<h.byteLength;){if(g+4>h.byteLength)return e(1);if(v[0]=h[g++],v[1]=h[g++],v[2]=h[g++],v[3]=h[g++],v[0]!=2||v[1]!=2||(v[2]<<8|v[3])!=p)return e(3,"bad rgbe scanline format");let w,S=0;for(;S<x&&g<h.byteLength;){w=h[g++];const L=w>128;if(L&&(w-=128),w===0||S+w>x)return e(3,"bad scanline data");if(L){const I=h[g++];for(let P=0;P<w;P++)y[S++]=I}else y.set(h.subarray(g,g+w),S),S+=w,g+=w}const M=p;for(let L=0;L<M;L++){let I=0;m[f]=y[L+I],I+=p,m[f+1]=y[L+I],I+=p,m[f+2]=y[L+I],I+=p,m[f+3]=y[L+I],f+=4}b--}return m}(r.subarray(r.pos),o,l);if(c!==-1){let h,u,d,p;switch(this.type){case 1015:p=c.length/4;const m=new Float32Array(3*p);for(let g=0;g<p;g++)n(c,4*g,m,3*g);h=m,u=1022,d=1015;break;case 1016:p=c.length/4;const f=new Uint16Array(3*p);for(let g=0;g<p;g++)i(c,4*g,f,3*g);h=f,u=1022,d=1016;break;default:console.error("THREE.RGBELoader: unsupported type: ",this.type)}return{width:o,height:l,data:h,header:a.string,gamma:a.gamma,exposure:a.exposure,format:u,type:d}}}return null}setDataType(s){return this.type=s,this}load(s,e,t,n){return super.load(s,function(i,r){switch(i.type){case 1015:case 1016:i.encoding=3e3,i.minFilter=1006,i.magFilter=1006,i.generateMipmaps=!1,i.flipY=!0}e&&e(i,r)},t,n)}};Uf.setDataType(1016);class Sd extends At{constructor(e){super(),this.threeRenderer=e,this.generatedEnvironmentMap=null,this.generatedEnvironmentMapAlt=null,this.skyboxCache=new Map,this.blurMaterial=null,this.blurScene=null}async load(e,t=()=>{}){try{const n=Px.test(e),i=n?Uf:Ix,r=await new Promise((a,o)=>i.load(e,a,l=>{t(l.loaded/l.total*.9)},o));return t(1),r.name=e,r.mapping=303,n||(r.encoding=3001),r}finally{t&&t(1)}}async generateEnvironmentMapAndSkybox(e=null,t=null,n={}){const{progressTracker:i}=n,r=t==="neutral";r===!0&&(t=null),t=Rf(t);let a,o=Promise.resolve(null);e&&(o=this.loadEquirectFromUrl(e,i)),a=t?this.loadEquirectFromUrl(t,i):e?this.loadEquirectFromUrl(e,i):r===!0?this.loadGeneratedEnvironmentMapAlt():this.loadGeneratedEnvironmentMap();let[l,c]=await Promise.all([a,o]);if(l==null)throw new Error("Failed to load environment map.");return{environmentMap:l,skybox:c}}async loadEquirectFromUrl(e,t){if(!this.skyboxCache.has(e)){const n=t?t.beginActivity():()=>{},i=this.load(e,n);this.skyboxCache.set(e,i)}return this.skyboxCache.get(e)}async GenerateEnvironmentMap(e,t){await Cf();const n=this.threeRenderer,i=new so(256,{generateMipmaps:!1,type:1016,format:1023,encoding:3e3,depthBuffer:!0}),r=new Ss(.1,100,i),a=r.renderTarget.texture;a.name=t,a.isRenderTargetTexture=!1,a.images=[1,1,1,1,1,1],e.scale.setComponent(0,-1);const o=n.outputEncoding,l=n.toneMapping;return n.toneMapping=0,n.outputEncoding=3e3,r.update(n,e),await this.blurCubemap(i,.04),n.toneMapping=l,n.outputEncoding=o,a}async loadGeneratedEnvironmentMap(){return this.generatedEnvironmentMap==null&&(this.generatedEnvironmentMap=this.GenerateEnvironmentMap(new Lx,"default")),this.generatedEnvironmentMap}async loadGeneratedEnvironmentMapAlt(){return this.generatedEnvironmentMapAlt==null&&(this.generatedEnvironmentMapAlt=this.GenerateEnvironmentMap(new Cx,"neutral")),this.generatedEnvironmentMapAlt}async blurCubemap(e,t){if(this.blurMaterial==null){this.blurMaterial=this.getBlurShader(20);const i=new ti,r=new me(i,this.blurMaterial);this.blurScene=new an,this.blurScene.add(r)}const n=e.clone();this.halfblur(e,n,t,"latitudinal"),this.halfblur(n,e,t,"longitudinal")}async halfblur(e,t,n,i){const r=e.width,a=isFinite(n)?Math.PI/(2*r):2*Math.PI/39,o=n/a,l=isFinite(n)?1+Math.floor(3*o):20;l>20&&console.warn(`sigmaRadians, ${n}, is too large and will clip, as it requested ${l} samples when the maximum is set to 20`);const c=[];let h=0;for(let d=0;d<20;++d){const p=d/o,m=Math.exp(-p*p/2);c.push(m),d==0?h+=m:d<l&&(h+=2*m)}for(let d=0;d<c.length;d++)c[d]=c[d]/h;const u=this.blurMaterial.uniforms;u.envMap.value=e.texture,u.samples.value=l,u.weights.value=c,u.latitudinal.value=i==="latitudinal",u.dTheta.value=a,new Ss(.1,100,t).update(this.threeRenderer,this.blurScene)}getBlurShader(e){const t=new Float32Array(e),n=new T(0,1,0);return new Pn({name:"SphericalGaussianBlur",defines:{n:e},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:t},latitudinal:{value:!1},dTheta:{value:0},poleAxis:{value:n}},vertexShader:`
      
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
      `,blending:0,depthTest:!1,depthWrite:!1,side:1})}async dispose(){for(const[,e]of this.skyboxCache)(await e).dispose();this.generatedEnvironmentMap!=null&&((await this.generatedEnvironmentMap).dispose(),this.generatedEnvironmentMap=null),this.generatedEnvironmentMapAlt!=null&&((await this.generatedEnvironmentMapAlt).dispose(),this.generatedEnvironmentMapAlt=null),this.blurMaterial!=null&&this.blurMaterial.dispose()}}/* @license
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
 */const xl=[1,.79,.62,.5,.4,.31,.25];class Cn extends At{constructor(e){super(),this.loader=new pt(Rx),this.width=0,this.height=0,this.dpr=1,this.debugger=null,this.scenes=new Set,this.multipleScenesVisible=!1,this.scaleStep=0,this.lastStep=3,this.avgFrameDuration=22,this.onWebGLContextLost=t=>{this.dispatchEvent({type:"contextlost",sourceEvent:t})},this.onWebGLContextRestored=()=>{var t;(t=this.textureUtils)===null||t===void 0||t.dispose(),this.textureUtils=new Sd(this.threeRenderer);for(const n of this.scenes)n.element[Oa]();this.threeRenderer.shadowMap.needsUpdate=!0},this.dpr=Uc(),this.canvas3D=document.createElement("canvas"),this.canvas3D.id="webgl-canvas";try{this.threeRenderer=new Pe({canvas:this.canvas3D,alpha:!0,antialias:!0,powerPreference:e.powerPreference,preserveDrawingBuffer:!0}),this.threeRenderer.autoClear=!0,this.threeRenderer.outputEncoding=3001,this.threeRenderer.physicallyCorrectLights=!0,this.threeRenderer.setPixelRatio(1),this.threeRenderer.shadowMap.enabled=!0,this.threeRenderer.shadowMap.type=2,this.threeRenderer.shadowMap.autoUpdate=!1,this.debugger=e.debug?new Sx(this):null,this.threeRenderer.debug={checkShaderErrors:!!this.debugger},this.threeRenderer.toneMapping=4}catch(t){console.warn(t)}this.arRenderer=new Mx(this),this.textureUtils=this.canRender?new Sd(this.threeRenderer):null,pt.initializeKTX2Loader(this.threeRenderer),this.canvas3D.addEventListener("webglcontextlost",this.onWebGLContextLost),this.canvas3D.addEventListener("webglcontextrestored",this.onWebGLContextRestored),this.updateRendererSize(),this.lastTick=performance.now(),this.avgFrameDuration=0}static get singleton(){return this._singleton}static resetSingleton(){const e=this._singleton.dispose();for(const t of e)t.disconnectedCallback();this._singleton=new Cn({powerPreference:(self.ModelViewerElement||{}).powerPreference||"high-performance",debug:Lf()});for(const t of e)t.connectedCallback()}get canRender(){return this.threeRenderer!=null}get scaleFactor(){return xl[this.scaleStep]}set minScale(e){let t=1;for(;t<xl.length&&!(xl[t]<e);)++t;this.lastStep=t-1}updateRendererSize(){const e=Uc();if(e!==this.dpr)for(const o of this.scenes){const{element:l}=o;l[ir](l.getBoundingClientRect())}let t=0,n=0;for(const o of this.scenes)t=Math.max(t,o.width),n=Math.max(n,o.height);if(t===this.width&&n===this.height&&e===this.dpr)return;this.width=t,this.height=n,this.dpr=e,this.canRender&&this.threeRenderer.setSize(t*e,n*e,!1);const i=this.scaleFactor,r=t/i,a=n/i;this.canvas3D.style.width=`${r}px`,this.canvas3D.style.height=`${a}px`;for(const o of this.scenes){const{canvas:l}=o;l.width=Math.round(t*e),l.height=Math.round(n*e),l.style.width=`${r}px`,l.style.height=`${a}px`,o.queueRender()}}updateRendererScale(){const e=this.scaleStep;if(this.avgFrameDuration>26?++this.scaleStep:this.avgFrameDuration<18&&this.scaleStep>0&&--this.scaleStep,this.scaleStep=Math.min(this.scaleStep,this.lastStep),e==this.scaleStep)return;const t=this.scaleFactor;this.avgFrameDuration=22;const n=this.width/t,i=this.height/t;this.canvas3D.style.width=`${n}px`,this.canvas3D.style.height=`${i}px`;for(const r of this.scenes){const{style:a}=r.canvas;a.width=`${n}px`,a.height=`${i}px`,r.queueRender()}}registerScene(e){this.scenes.add(e);const{canvas:t}=e,n=this.scaleFactor;t.width=Math.round(this.width*this.dpr),t.height=Math.round(this.height*this.dpr),t.style.width=this.width/n+"px",t.style.height=this.height/n+"px",this.multipleScenesVisible&&t.classList.add("show"),e.queueRender(),this.canRender&&this.scenes.size>0&&this.threeRenderer.setAnimationLoop((i,r)=>this.render(i,r)),this.debugger!=null&&this.debugger.addScene(e)}unregisterScene(e){this.scenes.delete(e),this.canRender&&this.scenes.size===0&&this.threeRenderer.setAnimationLoop(null),this.debugger!=null&&this.debugger.removeScene(e)}displayCanvas(e){return this.multipleScenesVisible?e.element[Ka]:this.canvas3D}selectCanvas(){let e=0,t=null;for(const r of this.scenes){const{element:a}=r;a.modelIsVisible&&r.externalRenderer==null&&(++e,t=r.canvas)}if(t==null)return;const n=e>1,{canvas3D:i}=this;if(n!==this.multipleScenesVisible||!n&&i.parentElement!==t.parentElement){this.multipleScenesVisible=n,n&&i.classList.remove("show");for(const r of this.scenes){if(r.externalRenderer!=null)continue;const a=r.element[Ka];n?(a.classList.add("show"),r.queueRender()):r.canvas===t&&(r.canvas.parentElement.appendChild(i),i.classList.add("show"),a.classList.remove("show"),r.queueRender())}}}orderedScenes(){const e=[];for(const t of[!1,!0])for(const n of this.scenes)n.element.modelIsVisible===t&&e.push(n);return e}get isPresenting(){return this.arRenderer.isPresenting}preRender(e,t,n){const{element:i,exposure:r}=e;i[Jt](t,n);const a=typeof r=="number"&&!self.isNaN(r);this.threeRenderer.toneMappingExposure=a?r:1,e.isShadowDirty()&&(this.threeRenderer.shadowMap.needsUpdate=!0)}render(e,t){if(t!=null)return void this.arRenderer.onWebXRFrame(e,t);const n=e-this.lastTick;if(this.lastTick=e,!this.canRender||this.isPresenting)return;this.avgFrameDuration+=vi(.2*(n-this.avgFrameDuration),-2,2),this.selectCanvas(),this.updateRendererSize(),this.updateRendererScale();const{dpr:i,scaleFactor:r}=this;for(const a of this.orderedScenes()){const{element:o}=a;if(!o.modelIsVisible&&a.renderCount>0||(this.preRender(a,e,n),!a.shouldRender()))continue;if(a.externalRenderer!=null){const h=a.getCamera();h.updateMatrix();const{matrix:u,projectionMatrix:d}=h,p=u.elements.slice(),m=a.getTarget();p[12]+=m.x,p[13]+=m.y,p[14]+=m.z,a.externalRenderer.render({viewMatrix:p,projectionMatrix:d.elements});continue}if(!o.modelIsVisible&&!this.multipleScenesVisible)for(const h of this.scenes)h.element.modelIsVisible&&h.queueRender();const l=Math.min(Math.ceil(a.width*r*i),this.canvas3D.width),c=Math.min(Math.ceil(a.height*r*i),this.canvas3D.height);if(this.threeRenderer.setRenderTarget(null),this.threeRenderer.setViewport(0,Math.floor(this.height*i)-c,l,c),this.threeRenderer.render(a,a.camera),this.multipleScenesVisible){a.context==null&&a.createContext();const h=a.context;h.clearRect(0,0,l,c),h.drawImage(this.canvas3D,0,0,l,c,0,0,l,c)}a.hasRendered(),o.loaded&&++a.renderCount}}dispose(){this.textureUtils!=null&&this.textureUtils.dispose(),this.threeRenderer!=null&&this.threeRenderer.dispose(),this.textureUtils=null,this.threeRenderer=null;const e=[];for(const t of this.scenes)e.push(t.element);return this.canvas3D.removeEventListener("webglcontextlost",this.onWebGLContextLost),this.canvas3D.removeEventListener("webglcontextrestored",this.onWebGLContextRestored),e}}Cn._singleton=new Cn({powerPreference:(self.ModelViewerElement||{}).powerPreference||"high-performance",debug:Lf()});/* @license
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
 */class Dx extends EventTarget{constructor(){super(...arguments),this.ongoingActivities=new Set,this.totalProgress=0}get ongoingActivityCount(){return this.ongoingActivities.size}beginActivity(){const e={progress:0,completed:!1};return this.ongoingActivities.add(e),this.ongoingActivityCount===1&&this.announceTotalProgress(e,0),t=>{let n;return n=Math.max(vi(t,0,1),e.progress),n!==e.progress&&this.announceTotalProgress(e,n),e.progress}}announceTotalProgress(e,t){let n=0,i=0;t==1&&(e.completed=!0);for(const o of this.ongoingActivities){const{progress:l}=o;n+=1-l,o.completed===!0&&i++}const r=e.progress;e.progress=t,this.totalProgress+=(t-r)*(1-this.totalProgress)/n;const a=i===this.ongoingActivityCount?1:this.totalProgress;this.dispatchEvent(new CustomEvent("progress",{detail:{totalProgress:a}})),i===this.ongoingActivityCount&&(this.totalProgress=0,this.ongoingActivities.clear())}}/* @license
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
 */var Td,Ed,Ad,Rd,Ld,Cd,Pd,Id,Dd,Nd,Fd=function(s,e,t,n){for(var i,r=arguments.length,a=r<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,t):n,o=s.length-1;o>=0;o--)(i=s[o])&&(a=(r<3?i(a):r>3?i(e,t,a):i(e,t))||a);return r>3&&a&&Object.defineProperty(e,t,a),a};const Ct=document.createElement("canvas"),bl=Symbol("fallbackResizeHandler"),wl=Symbol("defaultAriaLabel"),_a=Symbol("resizeObserver"),Vr=Symbol("clearModelTimeout"),_l=Symbol("onContextLost"),oi=Symbol("loaded"),ir=Symbol("updateSize"),Ma=Symbol("intersectionObserver"),fi=Symbol("isElementInViewport"),$a=Symbol("announceModelVisibility"),kc=Symbol("ariaLabel"),cs=Symbol("loadedTime"),Kt=Symbol("updateSource"),Od=Symbol("markLoaded"),ys=Symbol("container"),Qt=Symbol("input"),Ka=Symbol("canvas"),ae=Symbol("scene"),dt=Symbol("needsRender"),Jt=Symbol("tick"),$t=Symbol("onModelLoad"),Is=Symbol("onResize"),Ce=Symbol("renderer"),lr=Symbol("progressTracker"),Ud=Symbol("getLoaded"),Qa=Symbol("getModelIsVisible"),yi=Symbol("shouldAttemptPreload"),xi=Symbol("sceneIsReady"),rr=Symbol("hasTransitioned"),Sa=s=>({x:s.x,y:s.y,z:s.z,toString(){return`${this.x}m ${this.y}m ${this.z}m`}}),Nx=s=>({u:s.x,v:s.y,toString(){return`${this.u} ${this.v}`}});class zc extends Jc{constructor(){super(),this.alt=null,this.src=null,this[Td]=!1,this[Ed]=!1,this[Ad]=0,this[Rd]=null,this[Ld]=Oc(()=>{const i=this.getBoundingClientRect();this[ir](i)},50),this[Cd]=Oc(i=>{const r=this.modelIsVisible;r!==i&&this.dispatchEvent(new CustomEvent("model-visibility",{detail:{visible:r}}))},0),this[Pd]=null,this[Id]=null,this[Dd]=new Dx,this[Nd]=i=>{this.dispatchEvent(new CustomEvent("error",{detail:{type:"webglcontextlost",sourceError:i.sourceEvent}}))},this.attachShadow({mode:"open"});const e=this.shadowRoot;let t,n;if((i=>{Mm(vy,i)})(e),this[ys]=e.querySelector(".container"),this[Qt]=e.querySelector(".userInput"),this[Ka]=e.querySelector("canvas"),this[wl]=this[Qt].getAttribute("aria-label"),this.isConnected){const i=this.getBoundingClientRect();t=i.width,n=i.height}else t=300,n=150;this[ae]=new px({canvas:this[Ka],element:this,width:t,height:n}),this[ae].addEventListener("model-load",async i=>{this[Od](),this[$t](),await Cf(),this.dispatchEvent(new CustomEvent("load",{detail:{url:i.url}}))}),Promise.resolve().then(()=>{this[ir](this.getBoundingClientRect())}),al&&(this[_a]=new ResizeObserver(i=>{if(!this[Ce].isPresenting)for(let r of i)r.target===this&&this[ir](r.contentRect)})),ol?this[Ma]=new IntersectionObserver(i=>{for(let r of i)if(r.target===this){const a=this.modelIsVisible;this[fi]=r.isIntersecting,this[$a](a),this[fi]&&!this[xi]()&&this[Kt]()}},{root:null,rootMargin:"0px",threshold:0}):this[fi]=!0}static get is(){return"model-viewer"}static set modelCacheSize(e){pt[qn].evictionThreshold=e}static get modelCacheSize(){return pt[qn].evictionThreshold}static set minimumRenderScale(e){e>1&&console.warn("<model-viewer> minimumRenderScale has been clamped to a maximum value of 1."),e<=0&&console.warn("<model-viewer> minimumRenderScale has been clamped to a minimum value of 0.25."),Cn.singleton.minScale=e}static get minimumRenderScale(){return Cn.singleton.minScale}get loaded(){return this[Ud]()}get[(Td=fi,Ed=oi,Ad=cs,Rd=Vr,Ld=bl,Cd=$a,Pd=_a,Id=Ma,Dd=lr,Ce)](){return Cn.singleton}get modelIsVisible(){return this[Qa]()}connectedCallback(){super.connectedCallback&&super.connectedCallback(),al?this[_a].observe(this):self.addEventListener("resize",this[bl]),ol&&this[Ma].observe(this);const e=this[Ce];e.addEventListener("contextlost",this[_l]),e.registerScene(this[ae]),this[Vr]!=null&&(self.clearTimeout(this[Vr]),this[Vr]=null,this.requestUpdate("src",null))}disconnectedCallback(){super.disconnectedCallback&&super.disconnectedCallback(),al?this[_a].unobserve(this):self.removeEventListener("resize",this[bl]),ol&&this[Ma].unobserve(this);const e=this[Ce];e.removeEventListener("contextlost",this[_l]),e.unregisterScene(this[ae]),this[Vr]=self.setTimeout(()=>{this[ae].reset()},1e3)}updated(e){if(super.updated(e),e.has("src")&&(this.src==null?(this[oi]=!1,this[cs]=0,this[ae].reset()):this.src!==this[ae].url&&(this[oi]=!1,this[cs]=0,this[Kt]())),e.has("alt")){const t=this.alt==null?this[wl]:this.alt;this[Qt].setAttribute("aria-label",t)}}toDataURL(e,t){return this[Ce].displayCanvas(this[ae]).toDataURL(e,t)}async toBlob(e){const t=e?e.mimeType:void 0,n=e?e.qualityArgument:void 0,i=e?e.idealAspect:void 0,{width:r,height:a,idealAspect:o,aspect:l}=this[ae],{dpr:c,scaleFactor:h}=this[Ce];let u=r*h*c,d=a*h*c,p=0,m=0;if(i===!0)if(o>l){const f=d;d=Math.round(u/o),m=(f-d)/2}else{const f=u;u=Math.round(d*o),p=(f-u)/2}Ct.width=u,Ct.height=d;try{return new Promise(async(f,g)=>(Ct.getContext("2d").drawImage(this[Ce].displayCanvas(this[ae]),p,m,u,d,0,0,u,d),!Ct.msToBlob||t&&t!=="image/png"?Ct.toBlob?void Ct.toBlob(x=>{if(!x)return g(new Error("Unable to retrieve canvas blob"));f(x)},t,n):f(await(async x=>new Promise((v,y)=>{const b=x.match(/data:(.*);/);if(!b)return y(new Error(`${x} is not a valid data Url`));const w=b[1],S=x.replace(/data:image\/\w+;base64,/,""),M=atob(S),L=[];for(let I=0;I<M.length;I+=512){const P=M.slice(I,I+512),N=new Array(P.length);for(let G=0;G<P.length;G++)N[G]=P.charCodeAt(G);const W=new Uint8Array(N);L.push(W)}v(new Blob(L,{type:w}))}))(Ct.toDataURL(t,n))):f(Ct.msToBlob())))}finally{this[ir]({width:r,height:a})}}registerRenderer(e){this[ae].externalRenderer=e}unregisterRenderer(){this[ae].externalRenderer=null}get[kc](){return this.alt==null||this.alt==="null"?this[wl]:this.alt}[Ud](){return this[oi]}[Qa](){return this.loaded&&this[fi]}[rr](){return this.modelIsVisible}[yi](){return!!this.src&&this[fi]}[xi](){return this[oi]}[ir]({width:e,height:t}){this[ys].style.width=`${e}px`,this[ys].style.height=`${t}px`,this[Is]({width:parseFloat(e),height:parseFloat(t)})}[Jt](e,t){}[Od](){this[oi]||(this[oi]=!0,this[cs]=performance.now())}[dt](){this[ae].queueRender()}[$t](){}[Is](e){this[ae].setSize(e.width,e.height)}async[(Nd=_l,Kt)](){if(this.loaded||!this[yi]())return;const e=this[lr].beginActivity(),t=this.src;try{await this[ae].setSource(t,i=>e(.95*i));const n={url:t};this.dispatchEvent(new CustomEvent("preload",{detail:n}))}catch(n){this.dispatchEvent(new CustomEvent("error",{detail:n}))}finally{requestAnimationFrame(()=>{requestAnimationFrame(()=>{e(1)})})}}}Fd([ye({type:String})],zc.prototype,"alt",void 0),Fd([ye({type:String})],zc.prototype,"src",void 0);/* @license
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
 */var Ml=function(s,e,t,n){for(var i,r=arguments.length,a=r<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,t):n,o=s.length-1;o>=0;o--)(i=s[o])&&(a=(r<3?i(a):r>3?i(e,t,a):i(e,t))||a);return r>3&&a&&Object.defineProperty(e,t,a),a};const Gr=Symbol("changeAnimation"),vn=Symbol("paused"),Fx={repetitions:1/0,pingpong:!1},Wi=Symbol("hotspotMap"),Sl=Symbol("mutationCallback"),Wr=Symbol("observer"),Tl=Symbol("addHotspot"),kd=Symbol("removeHotspot"),El=new he,zd=new $e;/*!
fflate - fast JavaScript compression/decompression
<https://101arrowz.github.io/fflate>
Licensed under MIT. https://github.com/101arrowz/fflate/blob/master/LICENSE
version 0.6.9
*/var Bd=function(s){return URL.createObjectURL(new Blob([s],{type:"text/javascript"}))};try{URL.revokeObjectURL(Bd(""))}catch{Bd=function(e){return"data:application/javascript;charset=UTF-8,"+encodeURI(e)}}var yt=Uint8Array,gt=Uint16Array,mr=Uint32Array,fh=new yt([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),gh=new yt([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),Hd=new yt([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),kf=function(s,e){for(var t=new gt(31),n=0;n<31;++n)t[n]=e+=1<<s[n-1];var i=new mr(t[30]);for(n=1;n<30;++n)for(var r=t[n];r<t[n+1];++r)i[r]=r-t[n]<<5|n;return[t,i]},zf=kf(fh,2),Ox=zf[0],Bc=zf[1];Ox[28]=258,Bc[258]=28;for(var Vd=kf(gh,0)[1],Hc=new gt(32768),He=0;He<32768;++He){var li=(43690&He)>>>1|(21845&He)<<1;li=(61680&(li=(52428&li)>>>2|(13107&li)<<2))>>>4|(3855&li)<<4,Hc[He]=((65280&li)>>>8|(255&li)<<8)>>>1}var xs=function(s,e,t){for(var n=s.length,i=0,r=new gt(e);i<n;++i)++r[s[i]-1];var a,o=new gt(e);for(i=0;i<e;++i)o[i]=o[i-1]+r[i-1]<<1;if(t){a=new gt(1<<e);var l=15-e;for(i=0;i<n;++i)if(s[i])for(var c=i<<4|s[i],h=e-s[i],u=o[s[i]-1]++<<h,d=u|(1<<h)-1;u<=d;++u)a[Hc[u]>>>l]=c}else for(a=new gt(n),i=0;i<n;++i)s[i]&&(a[i]=Hc[o[s[i]-1]++]>>>15-s[i]);return a},Si=new yt(288);for(He=0;He<144;++He)Si[He]=8;for(He=144;He<256;++He)Si[He]=9;for(He=256;He<280;++He)Si[He]=7;for(He=280;He<288;++He)Si[He]=8;var eo=new yt(32);for(He=0;He<32;++He)eo[He]=5;var Ux=xs(Si,9,0),kx=xs(eo,5,0),Bf=function(s){return(s/8|0)+(7&s&&1)},Hf=function(s,e,t){(e==null||e<0)&&(e=0),(t==null||t>s.length)&&(t=s.length);var n=new(s instanceof gt?gt:s instanceof mr?mr:yt)(t-e);return n.set(s.subarray(e,t)),n},yn=function(s,e,t){t<<=7&e;var n=e/8|0;s[n]|=t,s[n+1]|=t>>>8},jr=function(s,e,t){t<<=7&e;var n=e/8|0;s[n]|=t,s[n+1]|=t>>>8,s[n+2]|=t>>>16},Al=function(s,e){for(var t=[],n=0;n<s.length;++n)s[n]&&t.push({s:n,f:s[n]});var i=t.length,r=t.slice();if(!i)return[vh,0];if(i==1){var a=new yt(t[0].s+1);return a[t[0].s]=1,[a,1]}t.sort(function(w,S){return w.f-S.f}),t.push({s:-1,f:25001});var o=t[0],l=t[1],c=0,h=1,u=2;for(t[0]={s:-1,f:o.f+l.f,l:o,r:l};h!=i-1;)o=t[t[c].f<t[u].f?c++:u++],l=t[c!=h&&t[c].f<t[u].f?c++:u++],t[h++]={s:-1,f:o.f+l.f,l:o,r:l};var d=r[0].s;for(n=1;n<i;++n)r[n].s>d&&(d=r[n].s);var p=new gt(d+1),m=Vc(t[h-1],p,0);if(m>e){n=0;var f=0,g=m-e,x=1<<g;for(r.sort(function(w,S){return p[S.s]-p[w.s]||w.f-S.f});n<i;++n){var v=r[n].s;if(!(p[v]>e))break;f+=x-(1<<m-p[v]),p[v]=e}for(f>>>=g;f>0;){var y=r[n].s;p[y]<e?f-=1<<e-p[y]++-1:++n}for(;n>=0&&f;--n){var b=r[n].s;p[b]==e&&(--p[b],++f)}m=e}return[new yt(p),m]},Vc=function(s,e,t){return s.s==-1?Math.max(Vc(s.l,e,t+1),Vc(s.r,e,t+1)):e[s.s]=t},Gd=function(s){for(var e=s.length;e&&!s[--e];);for(var t=new gt(++e),n=0,i=s[0],r=1,a=function(l){t[n++]=l},o=1;o<=e;++o)if(s[o]==i&&o!=e)++r;else{if(!i&&r>2){for(;r>138;r-=138)a(32754);r>2&&(a(r>10?r-11<<5|28690:r-3<<5|12305),r=0)}else if(r>3){for(a(i),--r;r>6;r-=6)a(8304);r>2&&(a(r-3<<5|8208),r=0)}for(;r--;)a(i);r=1,i=s[o]}return[t.subarray(0,n),e]},qr=function(s,e){for(var t=0,n=0;n<e.length;++n)t+=s[n]*e[n];return t},ka=function(s,e,t){var n=t.length,i=Bf(e+2);s[i]=255&n,s[i+1]=n>>>8,s[i+2]=255^s[i],s[i+3]=255^s[i+1];for(var r=0;r<n;++r)s[i+r+4]=t[r];return 8*(i+4+n)},Wd=function(s,e,t,n,i,r,a,o,l,c,h){yn(e,h++,t),++i[256];for(var u=Al(i,15),d=u[0],p=u[1],m=Al(r,15),f=m[0],g=m[1],x=Gd(d),v=x[0],y=x[1],b=Gd(f),w=b[0],S=b[1],M=new gt(19),L=0;L<v.length;++L)M[31&v[L]]++;for(L=0;L<w.length;++L)M[31&w[L]]++;for(var I=Al(M,7),P=I[0],N=I[1],W=19;W>4&&!P[Hd[W-1]];--W);var G,U,j,ne,ie=c+5<<3,B=qr(i,Si)+qr(r,eo)+a,X=qr(i,d)+qr(r,f)+a+14+3*W+qr(M,P)+(2*M[16]+3*M[17]+7*M[18]);if(ie<=B&&ie<=X)return ka(e,h,s.subarray(l,l+c));if(yn(e,h,1+(X<B)),h+=2,X<B){G=xs(d,p,0),U=d,j=xs(f,g,0),ne=f;var Z=xs(P,N,0);for(yn(e,h,y-257),yn(e,h+5,S-1),yn(e,h+10,W-4),h+=14,L=0;L<W;++L)yn(e,h+3*L,P[Hd[L]]);h+=3*W;for(var te=[v,w],ee=0;ee<2;++ee){var ce=te[ee];for(L=0;L<ce.length;++L){var R=31&ce[L];yn(e,h,Z[R]),h+=P[R],R>15&&(yn(e,h,ce[L]>>>5&127),h+=ce[L]>>>12)}}}else G=Ux,U=Si,j=kx,ne=eo;for(L=0;L<o;++L)if(n[L]>255){R=n[L]>>>18&31,jr(e,h,G[R+257]),h+=U[R+257],R>7&&(yn(e,h,n[L]>>>23&31),h+=fh[R]);var E=31&n[L];jr(e,h,j[E]),h+=ne[E],E>3&&(jr(e,h,n[L]>>>5&8191),h+=gh[E])}else jr(e,h,G[n[L]]),h+=U[n[L]];return jr(e,h,G[256]),h+U[256]},zx=new mr([65540,131080,131088,131104,262176,1048704,1048832,2114560,2117632]),vh=new yt(0),Bx=function(){for(var s=new mr(256),e=0;e<256;++e){for(var t=e,n=9;--n;)t=(1&t&&3988292384)^t>>>1;s[e]=t}return s}(),Hx=function(){var s=-1;return{p:function(e){for(var t=s,n=0;n<e.length;++n)t=Bx[255&t^e[n]]^t>>>8;s=t},d:function(){return~s}}},Vx=function(s,e,t,n,i){return function(r,a,o,l,c,h){var u=r.length,d=new yt(l+u+5*(1+Math.ceil(u/7e3))+c),p=d.subarray(l,d.length-c),m=0;if(!a||u<8)for(var f=0;f<=u;f+=65535){var g=f+65535;g<u?m=ka(p,m,r.subarray(f,g)):(p[f]=h,m=ka(p,m,r.subarray(f,u)))}else{for(var x=zx[a-1],v=x>>>13,y=8191&x,b=(1<<o)-1,w=new gt(32768),S=new gt(b+1),M=Math.ceil(o/3),L=2*M,I=function(de){return(r[de]^r[de+1]<<M^r[de+2]<<L)&b},P=new mr(25e3),N=new gt(288),W=new gt(32),G=0,U=0,j=(f=0,0),ne=0,ie=0;f<u;++f){var B=I(f),X=32767&f,Z=S[B];if(w[X]=Z,S[B]=X,ne<=f){var te=u-f;if((G>7e3||j>24576)&&te>423){m=Wd(r,p,0,P,N,W,U,j,ie,f-ie,m),j=G=U=0,ie=f;for(var ee=0;ee<286;++ee)N[ee]=0;for(ee=0;ee<30;++ee)W[ee]=0}var ce=2,R=0,E=y,F=X-Z&32767;if(te>2&&B==I(f-F))for(var V=Math.min(v,te)-1,O=Math.min(32767,f),_=Math.min(258,te);F<=O&&--E&&X!=Z;){if(r[f+ce]==r[f+ce-F]){for(var C=0;C<_&&r[f+C]==r[f+C-F];++C);if(C>ce){if(ce=C,R=F,C>V)break;var D=Math.min(F,C-2),k=0;for(ee=0;ee<D;++ee){var z=f-F+ee+32768&32767,J=z-w[z]+32768&32767;J>k&&(k=J,Z=z)}}}F+=(X=Z)-(Z=w[X])+32768&32767}if(R){P[j++]=268435456|Bc[ce]<<18|Vd[R];var K=31&Bc[ce],re=31&Vd[R];U+=fh[K]+gh[re],++N[257+K],++W[re],ne=f+ce,++G}else P[j++]=r[f],++N[r[f]]}}m=Wd(r,p,h,P,N,W,U,j,ie,f-ie,m),!h&&7&m&&(m=ka(p,m+1,vh))}return Hf(d,0,l+Bf(m)+c)}(s,e.level==null?6:e.level,e.mem==null?Math.ceil(1.5*Math.max(8,Math.min(13,Math.log(s.length)))):12+e.mem,t,n,!i)},Vf=function(s,e){var t={};for(var n in s)t[n]=s[n];for(var n in e)t[n]=e[n];return t},at=function(s,e,t){for(;t;++e)s[e]=t,t>>>=8};function Gx(s,e){return Vx(s,e||{},0,0)}var Gf=function(s,e,t,n){for(var i in s){var r=s[i],a=e+i;r instanceof yt?t[a]=[r,n]:Array.isArray(r)?t[a]=[r[0],Vf(n,r[1])]:Gf(r,a+"/",t,n)}},jd=typeof TextEncoder<"u"&&new TextEncoder,Wx=typeof TextDecoder<"u"&&new TextDecoder;try{Wx.decode(vh,{stream:!0})}catch{}function to(s,e){if(e){for(var t=new yt(s.length),n=0;n<s.length;++n)t[n]=s.charCodeAt(n);return t}if(jd)return jd.encode(s);var i=s.length,r=new yt(s.length+(s.length>>1)),a=0,o=function(h){r[a++]=h};for(n=0;n<i;++n){if(a+5>r.length){var l=new yt(a+8+(i-n<<1));l.set(r),r=l}var c=s.charCodeAt(n);c<128||e?o(c):c<2048?(o(192|c>>6),o(128|63&c)):c>55295&&c<57344?(o(240|(c=65536+(1047552&c)|1023&s.charCodeAt(++n))>>18),o(128|c>>12&63),o(128|c>>6&63),o(128|63&c)):(o(224|c>>12),o(128|c>>6&63),o(128|63&c))}return Hf(r,0,a)}var Gc=function(s){var e=0;if(s)for(var t in s){var n=s[t].length;if(n>65535)throw"extra field too long";e+=n+4}return e},qd=function(s,e,t,n,i,r,a,o){var l=n.length,c=t.extra,h=o&&o.length,u=Gc(c);at(s,e,a!=null?33639248:67324752),e+=4,a!=null&&(s[e++]=20,s[e++]=t.os),s[e]=20,e+=2,s[e++]=t.flag<<1|(r==null&&8),s[e++]=i&&8,s[e++]=255&t.compression,s[e++]=t.compression>>8;var d=new Date(t.mtime==null?Date.now():t.mtime),p=d.getFullYear()-1980;if(p<0||p>119)throw"date not in range 1980-2099";if(at(s,e,p<<25|d.getMonth()+1<<21|d.getDate()<<16|d.getHours()<<11|d.getMinutes()<<5|d.getSeconds()>>>1),e+=4,r!=null&&(at(s,e,t.crc),at(s,e+4,r),at(s,e+8,t.size)),at(s,e+12,l),at(s,e+14,u),e+=16,a!=null&&(at(s,e,h),at(s,e+6,t.attrs),at(s,e+10,a),e+=14),s.set(n,e),e+=l,u)for(var m in c){var f=c[m],g=f.length;at(s,e,+m),at(s,e+2,g),s.set(f,e+4),e+=4+g}return h&&(s.set(o,e),e+=h),e};function jx(s,e){e||(e={});var t={},n=[];Gf(s,"",t,e);var i=0,r=0;for(var a in t){var o=t[a],l=o[0],c=o[1],h=c.level==0?0:8,u=(M=to(a)).length,d=c.comment,p=d&&to(d),m=p&&p.length,f=Gc(c.extra);if(u>65535)throw"filename too long";var g=h?Gx(l,c):l,x=g.length,v=Hx();v.p(l),n.push(Vf(c,{size:l.length,crc:v.d(),c:g,f:M,m:p,u:u!=a.length||p&&d.length!=m,o:i,compression:h})),i+=30+u+f+x,r+=76+2*(u+f)+(m||0)+x}for(var y=new yt(r+22),b=i,w=r-i,S=0;S<n.length;++S){var M=n[S];qd(y,M.o,M,M.f,M.u,M.c.length);var L=30+M.f.length+Gc(M.extra);y.set(M.c,M.o+L),qd(y,i,M,M.f,M.u,M.c.length,M.o,M.m),i+=16+L+(M.m?M.m.length:0)}return function(I,P,N,W,G){at(I,P,101010256),at(I,P+8,N),at(I,P+10,N),at(I,P+12,W),at(I,P+16,G)}(y,i,n.length,w,b),y}class qx{async parse(e){const t={};t["model.usda"]=null;let n=Xd();const i={},r={};e.traverseVisible(o=>{if(o.isMesh)if(o.material.isMeshStandardMaterial){const l=o.geometry,c=o.material,h="geometries/Geometry_"+l.id+".usd";if(!(h in t)){const u=function(d){return`
def "Geometry"
{
  ${function(p){const m="Geometry",f=p.attributes,g=f.position.count;return`
    def Mesh "${m}"
    {
        int[] faceVertexCounts = [${function(x){const v=x.index!==null?x.index.count:x.attributes.position.count;return Array(v/3).fill(3).join(", ")}(p)}]
        int[] faceVertexIndices = [${function(x){const v=x.index,y=[];if(v!==null)for(let b=0;b<v.count;b++)y.push(v.getX(b));else{const b=x.attributes.position.count;for(let w=0;w<b;w++)y.push(w)}return y.join(", ")}(p)}]
        normal3f[] normals = [${Yd(f.normal,g)}] (
            interpolation = "vertex"
        )
        point3f[] points = [${Yd(f.position,g)}]
        float2[] primvars:st = [${function(x,v){if(x===void 0)return console.warn("USDZExporter: UVs missing."),Array(v).fill("(0, 0)").join(", ");const y=[];for(let b=0;b<x.count;b++){const w=x.getX(b),S=x.getY(b);y.push(`(${w.toPrecision(7)}, ${1-S.toPrecision(7)})`)}return y.join(", ")}(f.uv,g)}] (
            interpolation = "vertex"
        )
        uniform token subdivisionScheme = "none"
    }
`}(d)}
}
`}(l);t[h]=function(d){let p=Xd();return p+=d,to(p)}(u)}c.uuid in i||(i[c.uuid]=c),n+=function(u,d,p){const m="Object_"+u.id,f=function(g){const x=g.elements;return`( ${Ta(x,0)}, ${Ta(x,4)}, ${Ta(x,8)}, ${Ta(x,12)} )`}(u.matrixWorld);return u.matrixWorld.determinant()<0&&console.warn("THREE.USDZExporter: USDZ does not support negative scales",u),`def Xform "${m}" (
    prepend references = @./geometries/Geometry_${d.id}.usd@</Geometry>
)
{
    matrix4d xformOp:transform = ${f}
    uniform token[] xformOpOrder = ["xformOp:transform"]

    rel material:binding = </Materials/Material_${p.id}>
}

`}(o,l,c)}else console.warn("THREE.USDZExporter: Unsupported material type (USDZ only supports MeshStandardMaterial)",o)}),n+=function(o,l){const c=[];for(const h in o){const u=o[h];c.push(Yx(u,l))}return`def "Materials"
{
${c.join("")}
}

`}(i,r),t["model.usda"]=to(n),n=null;for(const o in r){const l=r[o],c=o.split("_")[1],h=l.format===1023,u=Xx(l.image,c),d=await new Promise(p=>u.toBlob(p,h?"image/png":"image/jpeg",1));t[`textures/Texture_${o}.${h?"png":"jpg"}`]=new Uint8Array(await d.arrayBuffer())}let a=0;for(const o in t){const l=t[o];a+=34+o.length;const c=63&a;if(c!==4){const h=new Uint8Array(64-c);t[o]=[l,{extra:{12345:h}}]}a=l.length}return jx(t,{level:0})}}function Xx(s,e){if(typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof OffscreenCanvas<"u"&&s instanceof OffscreenCanvas||typeof ImageBitmap<"u"&&s instanceof ImageBitmap){const t=1024/Math.max(s.width,s.height),n=document.createElement("canvas");n.width=s.width*Math.min(1,t),n.height=s.height*Math.min(1,t);const i=n.getContext("2d");if(i.drawImage(s,0,0,n.width,n.height),e!==void 0){const r=parseInt(e,16),a=(r>>16&255)/255,o=(r>>8&255)/255,l=(255&r)/255,c=i.getImageData(0,0,n.width,n.height),h=c.data;for(let u=0;u<h.length;u+=4)h[u+0]=h[u+0]*a,h[u+1]=h[u+1]*o,h[u+2]=h[u+2]*l;i.putImageData(c,0,0)}return n}}function Xd(){return`#usda 1.0
(
    customLayerData = {
        string creator = "Three.js USDZExporter"
    }
    metersPerUnit = 1
    upAxis = "Y"
)

`}function Ta(s,e){return`(${s[e+0]}, ${s[e+1]}, ${s[e+2]}, ${s[e+3]})`}function Yd(s,e){if(s===void 0)return console.warn("USDZExporter: Normals missing."),Array(e).fill("(0, 0, 0)").join(", ");const t=[];for(let n=0;n<s.count;n++){const i=s.getX(n),r=s.getY(n),a=s.getZ(n);t.push(`(${i.toPrecision(7)}, ${r.toPrecision(7)}, ${a.toPrecision(7)})`)}return t.join(", ")}function Yx(s,e){const t="            ",n=[],i=[];function r(a,o,l){const c=a.id+(l?"_"+l.getHexString():""),h=a.format===1023;return e[c]=a,`
        def Shader "Transform2d_${o}" (
            sdrMetadata = {
                string role = "math"
            }
        )
        {
            uniform token info:id = "UsdTransform2d"
            float2 inputs:in.connect = </Materials/Material_${s.id}/uvReader_st.outputs:result>
            float2 inputs:scale = ${Jd(a.repeat)}
            float2 inputs:translation = ${Jd(a.offset)}
            float2 outputs:result
        }

        def Shader "Texture_${a.id}_${o}"
        {
            uniform token info:id = "UsdUVTexture"
            asset inputs:file = @textures/Texture_${c}.${h?"png":"jpg"}@
            float2 inputs:st.connect = </Materials/Material_${s.id}/Transform2d_${o}.outputs:result>
            token inputs:wrapS = "repeat"
            token inputs:wrapT = "repeat"
            float outputs:r
            float outputs:g
            float outputs:b
            float3 outputs:rgb
        }`}return s.map!==null?(n.push(`${t}color3f inputs:diffuseColor.connect = </Materials/Material_${s.id}/Texture_${s.map.id}_diffuse.outputs:rgb>`),i.push(r(s.map,"diffuse",s.color))):n.push(`${t}color3f inputs:diffuseColor = ${Zd(s.color)}`),s.emissiveMap!==null?(n.push(`${t}color3f inputs:emissiveColor.connect = </Materials/Material_${s.id}/Texture_${s.emissiveMap.id}_emissive.outputs:rgb>`),i.push(r(s.emissiveMap,"emissive"))):s.emissive.getHex()>0&&n.push(`${t}color3f inputs:emissiveColor = ${Zd(s.emissive)}`),s.normalMap!==null&&(n.push(`${t}normal3f inputs:normal.connect = </Materials/Material_${s.id}/Texture_${s.normalMap.id}_normal.outputs:rgb>`),i.push(r(s.normalMap,"normal"))),s.aoMap!==null&&(n.push(`${t}float inputs:occlusion.connect = </Materials/Material_${s.id}/Texture_${s.aoMap.id}_occlusion.outputs:r>`),i.push(r(s.aoMap,"occlusion"))),s.roughnessMap!==null&&s.roughness===1?(n.push(`${t}float inputs:roughness.connect = </Materials/Material_${s.id}/Texture_${s.roughnessMap.id}_roughness.outputs:g>`),i.push(r(s.roughnessMap,"roughness"))):n.push(`${t}float inputs:roughness = ${s.roughness}`),s.metalnessMap!==null&&s.metalness===1?(n.push(`${t}float inputs:metallic.connect = </Materials/Material_${s.id}/Texture_${s.metalnessMap.id}_metallic.outputs:b>`),i.push(r(s.metalnessMap,"metallic"))):n.push(`${t}float inputs:metallic = ${s.metalness}`),s.alphaMap!==null?(n.push(`${t}float inputs:opacity.connect = </Materials/Material_${s.id}/Texture_${s.alphaMap.id}_opacity.outputs:r>`),n.push(`${t}float inputs:opacityThreshold = 0.0001`),i.push(r(s.alphaMap,"opacity"))):n.push(`${t}float inputs:opacity = ${s.opacity}`),s.isMeshPhysicalMaterial&&(n.push(`${t}float inputs:clearcoat = ${s.clearcoat}`),n.push(`${t}float inputs:clearcoatRoughness = ${s.clearcoatRoughness}`),n.push(`${t}float inputs:ior = ${s.ior}`)),`
    def Material "Material_${s.id}"
    {
        def Shader "PreviewSurface"
        {
            uniform token info:id = "UsdPreviewSurface"
${n.join(`
`)}
            int inputs:useSpecularWorkflow = 0
            token outputs:surface
        }

        token outputs:surface.connect = </Materials/Material_${s.id}/PreviewSurface.outputs:surface>
        token inputs:frame:stPrimvarName = "st"

        def Shader "uvReader_st"
        {
            uniform token info:id = "UsdPrimvarReader_float2"
            token inputs:varname.connect = </Materials/Material_${s.id}.inputs:frame:stPrimvarName>
            float2 inputs:fallback = (0.0, 0.0)
            float2 outputs:result
        }

${i.join(`
`)}

    }
`}function Zd(s){return`(${s.r}, ${s.g}, ${s.b})`}function Jd(s){return`(${s.x}, ${s.y})`}/* @license
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
 *//* @license
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
 */var ji=function(s,e,t,n){for(var i,r=arguments.length,a=r<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,t):n,o=s.length-1;o>=0;o--)(i=s[o])&&(a=(r<3?i(a):r>3?i(e,t,a):i(e,t))||a);return r>3&&a&&Object.defineProperty(e,t,a),a};let $d=!1,Kd=!1;const Zx=(Qd=["quick-look","scene-viewer","webxr","none"],s=>{try{const e=Mi(s),t=(e.length?e[0].terms:[]).filter(i=>i&&i.type==="ident").map(i=>i.value).filter(i=>Qd.indexOf(i)>-1),n=new Set;for(const i of t)n.add(i);return n}catch{}return new Set});var Qd;const Rl="quick-look",ep="scene-viewer",tp="webxr",Ll="none",xn=Symbol("arButtonContainer"),np=Symbol("enterARWithWebXR"),ip=Symbol("openSceneViewer"),rp=Symbol("openIOSARQuickLook"),Jx=Symbol("canActivateAR"),Gn=Symbol("arMode"),Cl=Symbol("arModes"),qi=Symbol("arAnchor"),Ea=Symbol("preload"),Aa=Symbol("onARButtonContainerClick"),Pl=Symbol("onARStatus"),Il=Symbol("onARTracking"),Dl=Symbol("onARTap"),Xr=Symbol("selectARMode"),Nl=Symbol("triggerLoad");/* @license
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
 */var Wf,sp,ap;const vr=Symbol("evaluate"),za=Symbol("lastValue");class Ge{constructor(){this[Wf]=null}static evaluatableFor(e,t=Qn){if(e instanceof Ge)return e;if(e.type==="number")return e.unit==="%"?new $x(e,t):e;switch(e.name.value){case"calc":return new eb(e,t);case"env":return new Kx(e)}return Qn}static evaluate(e){return e instanceof Ge?e.evaluate():e}static isConstant(e){return!(e instanceof Ge)||e.isConstant}static applyIntrinsics(e,t){const{basis:n,keywords:i}=t,{auto:r}=i;return n.map((a,o)=>{const l=r[o]==null?a:r[o];let c=e[o]?e[o]:l;if(c.type==="ident"){const h=c.value;h in i&&(c=i[h][o])}return c!=null&&c.type!=="ident"||(c=l),c.unit==="%"?ot(c.number/100*a.number,a.unit):(c=sn(c,a),c.unit!==a.unit?a:c)})}get isConstant(){return!1}evaluate(){return this.isConstant&&this[za]!=null||(this[za]=this[vr]()),this[za]}}Wf=za;const op=Symbol("percentage"),Fl=Symbol("basis");class $x extends Ge{constructor(e,t){super(),this[op]=e,this[Fl]=t}get isConstant(){return!0}[vr](){return ot(this[op].number/100*this[Fl].number,this[Fl].unit)}}const Ra=Symbol("identNode");class Kx extends Ge{constructor(e){super(),this[sp]=null;const t=e.arguments.length?e.arguments[0].terms[0]:null;t!=null&&t.type==="ident"&&(this[Ra]=t)}get isConstant(){return!1}[(sp=Ra,vr)](){return this[Ra]!=null&&this[Ra].value==="window-scroll-y"?{type:"number",number:window.pageYOffset/(Math.max(document.body.scrollHeight,document.body.offsetHeight,document.documentElement.clientHeight,document.documentElement.scrollHeight,document.documentElement.offsetHeight)-window.innerHeight)||0,unit:null}:Qn}}const Qx=/[\*\/]/,Xi=Symbol("evalutor");class eb extends Ge{constructor(e,t=Qn){if(super(),this[ap]=null,e.arguments.length!==1)return;const n=e.arguments[0].terms.slice(),i=[];for(;n.length;){const r=n.shift();if(i.length>0){const a=i[i.length-1];if(a.type==="operator"&&Qx.test(a.value)){const o=i.pop(),l=i.pop();if(l==null)return;i.push(new cp(o,Ge.evaluatableFor(l,t),Ge.evaluatableFor(r,t)));continue}}i.push(r.type==="operator"?r:Ge.evaluatableFor(r,t))}for(;i.length>2;){const[r,a,o]=i.splice(0,3);if(a.type!=="operator")return;i.unshift(new cp(a,Ge.evaluatableFor(r,t),Ge.evaluatableFor(o,t)))}i.length===1&&(this[Xi]=i[0])}get isConstant(){return this[Xi]==null||Ge.isConstant(this[Xi])}[(ap=Xi,vr)](){return this[Xi]!=null?Ge.evaluate(this[Xi]):Qn}}const lp=Symbol("operator"),Ol=Symbol("left"),Ul=Symbol("right");class cp extends Ge{constructor(e,t,n){super(),this[lp]=e,this[Ol]=t,this[Ul]=n}get isConstant(){return Ge.isConstant(this[Ol])&&Ge.isConstant(this[Ul])}[vr](){const e=sn(Ge.evaluate(this[Ol])),t=sn(Ge.evaluate(this[Ul])),{number:n,unit:i}=e,{number:r,unit:a}=t;if(a!=null&&i!=null&&a!=i)return Qn;const o=i||a;let l;switch(this[lp].value){case"+":l=n+r;break;case"-":l=n-r;break;case"/":l=n/r;break;case"*":l=n*r;break;default:return Qn}return{type:"number",number:l,unit:o}}}const kl=Symbol("evaluatables"),hp=Symbol("intrinsics");class jf extends Ge{constructor(e,t){super(),this[hp]=t;const n=e[0],i=n!=null?n.terms:[];this[kl]=t.basis.map((r,a)=>{const o=i[a];return o==null?{type:"ident",value:"auto"}:o.type==="ident"?o:Ge.evaluatableFor(o,r)})}get isConstant(){for(const e of this[kl])if(!Ge.isConstant(e))return!1;return!0}[vr](){const e=this[kl].map(t=>Ge.evaluate(t));return Ge.applyIntrinsics(e,this[hp]).map(t=>t.number)}}/* @license
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
 */var qf,Xf,Yf,Zf;const Yi=Symbol("instances"),up=Symbol("activateListener"),dp=Symbol("deactivateListener"),zl=Symbol("notifyInstances"),pp=Symbol("notify"),mp=Symbol("callback");class en{constructor(e){this[mp]=e}static[zl](){for(const e of en[Yi])e[pp]()}static[(qf=Yi,up)](){window.addEventListener("scroll",this[zl],{passive:!0})}static[dp](){window.removeEventListener("scroll",this[zl])}observe(){en[Yi].size===0&&en[up](),en[Yi].add(this)}disconnect(){en[Yi].delete(this),en[Yi].size===0&&en[dp]()}[pp](){this[mp]()}}en[qf]=new Set;const fp=Symbol("computeStyleCallback"),Jf=Symbol("astWalker"),hs=Symbol("dependencies"),$f=Symbol("onScroll");class tb{constructor(e){this[Xf]={},this[Yf]=new cx(["function"]),this[Zf]=()=>{this[fp]({relatedState:"window-scroll"})},this[fp]=e}observeEffectsFor(e){const t={},n=this[hs];this[Jf].walk(e,i=>{const{name:r}=i,a=i.arguments[0].terms[0];if(r.value==="env"&&a!=null&&a.type==="ident"&&a.value==="window-scroll-y"&&t["window-scroll"]==null){const o="window-scroll"in n?n["window-scroll"]:new en(this[$f]);o.observe(),delete n["window-scroll"],t["window-scroll"]=o}});for(const i in n)n[i].disconnect();this[hs]=t}dispose(){for(const e in this[hs])this[hs][e].disconnect()}}Xf=hs,Yf=Jf,Zf=$f;/* @license
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
 */const Wn=s=>{const e=s.observeEffects||!1,t=s.intrinsics instanceof Function?s.intrinsics:()=>s.intrinsics;return(n,i)=>{const r=n.updated,a=n.connectedCallback,o=n.disconnectedCallback,l=Symbol(`${i}StyleEffector`),c=Symbol(`${i}StyleEvaluator`),h=Symbol(`${i}UpdateEvaluator`),u=Symbol(`${i}EvaluateAndSync`);Object.defineProperties(n,{[l]:{value:null,writable:!0},[c]:{value:null,writable:!0},[h]:{value:function(){const d=Mi(this[i]);this[c]=new jf(d,t(this)),this[l]==null&&e&&(this[l]=new tb(()=>this[u]())),this[l]!=null&&this[l].observeEffectsFor(d)}},[u]:{value:function(){if(this[c]==null)return;const d=this[c].evaluate();this[s.updateHandler](d)}},updated:{value:function(d){d.has(i)&&(this[h](),this[u]()),r.call(this,d)}},connectedCallback:{value:function(){a.call(this),this.requestUpdate(i,this[i])}},disconnectedCallback:{value:function(){o.call(this),this[l]!=null&&(this[l].dispose(),this[l]=null)}}})}},gp=Object.freeze({minimumRadius:0,maximumRadius:1/0,minimumPolarAngle:Math.PI/8,maximumPolarAngle:Math.PI-Math.PI/8,minimumAzimuthalAngle:-1/0,maximumAzimuthalAngle:1/0,minimumFieldOfView:10,maximumFieldOfView:45,interactionPolicy:"always-allow",touchAction:"pan-y"}),La=Math.PI/8,nb=33,ib=34,rb=37,sb=38,ab=39,ob=40,Wc="user-interaction",lb="none";/* @license
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
 */class cb extends At{constructor(e,t){super(),this.camera=e,this.element=t,this.sensitivity=1,this._interactionEnabled=!1,this._disableZoom=!1,this.isUserChange=!1,this.isUserPointing=!1,this.spherical=new Fa,this.goalSpherical=new Fa,this.thetaDamper=new Et,this.phiDamper=new Et,this.radiusDamper=new Et,this.logFov=Math.log(gp.maximumFieldOfView),this.goalLogFov=this.logFov,this.fovDamper=new Et,this.touchMode=null,this.lastPointerPosition={clientX:0,clientY:0},this.touchDecided=!1,this.onMouseMove=n=>{this.handleSinglePointerMove(n),n.cancelable&&n.preventDefault()},this.onTouchMove=n=>{this.touchMode!==null&&(this.touchMode(n),this.touchMode!==null&&n.cancelable&&n.preventDefault())},this.touchModeZoom=n=>{const{targetTouches:i}=n;if(this.lastTouches.length>1&&i.length>1){const r=.04*(this.twoTouchDistance(this.lastTouches[0],this.lastTouches[1])-this.twoTouchDistance(i[0],i[1]))/10;this.userAdjustOrbit(0,0,r),this.lastTouches=i}},this.touchModeRotate=n=>{const{targetTouches:i}=n,{touchAction:r}=this._options;if(!this.touchDecided&&r!=="none"){this.touchDecided=!0;const{clientX:a,clientY:o}=i[0],l=Math.abs(a-this.lastPointerPosition.clientX),c=Math.abs(o-this.lastPointerPosition.clientY);if(r==="pan-y"&&c>l||r==="pan-x"&&l>c)return void(this.touchMode=null)}this.handleSinglePointerMove(i[0]),this.lastTouches=i},this.onMouseDown=n=>{this.onPointerDown(()=>{self.addEventListener("mousemove",this.onMouseMove),self.addEventListener("mouseup",this.onMouseUp,{once:!0}),this.handleSinglePointerDown(n)})},this.onTouchStart=n=>{this.onPointerDown(()=>{const{targetTouches:i,changedTouches:r,touches:a}=n;i.length===r.length&&(this.touchMode=null,this.touchDecided=!1),i.length===a.length&&this.onTouchChange(n)})},this.onMouseUp=n=>{self.removeEventListener("mousemove",this.onMouseMove),this.onPointerUp()},this.onTouchEnd=n=>{n.targetTouches.length>0&&this.touchMode!==null&&this.onTouchChange(n),this.onPointerUp()},this.onWheel=n=>{if(!this.canInteract)return;const i=n.deltaY*(n.deltaMode==1?18:1)*.04/30;this.userAdjustOrbit(0,0,i),n.cancelable&&n.preventDefault()},this.onKeyDown=n=>{let i=!1;switch(n.keyCode){case nb:i=!0,this.userAdjustOrbit(0,0,.04);break;case ib:i=!0,this.userAdjustOrbit(0,0,-.04);break;case sb:i=!0,this.userAdjustOrbit(0,-La,0);break;case ob:i=!0,this.userAdjustOrbit(0,La,0);break;case rb:i=!0,this.userAdjustOrbit(-La,0,0);break;case ab:i=!0,this.userAdjustOrbit(La,0,0)}i&&n.cancelable&&n.preventDefault()},this._options=Object.assign({},gp),this.setOrbit(0,Math.PI/2,1),this.setFieldOfView(100),this.jumpToGoal()}get interactionEnabled(){return this._interactionEnabled}enableInteraction(){if(this._interactionEnabled===!1){const{element:e}=this;e.addEventListener("mousedown",this.onMouseDown),this._disableZoom||e.addEventListener("wheel",this.onWheel),e.addEventListener("keydown",this.onKeyDown),e.addEventListener("touchstart",this.onTouchStart,{passive:!0}),e.addEventListener("touchmove",this.onTouchMove,{passive:!1}),e.addEventListener("touchend",this.onTouchEnd),this.element.style.cursor="grab",this._interactionEnabled=!0,this.updateTouchActionStyle()}}disableInteraction(){if(this._interactionEnabled===!0){const{element:e}=this;self.removeEventListener("mousemove",this.onMouseMove),e.removeEventListener("mousedown",this.onMouseDown),this._disableZoom||e.removeEventListener("wheel",this.onWheel),e.removeEventListener("keydown",this.onKeyDown),e.removeEventListener("touchstart",this.onTouchStart),e.removeEventListener("touchmove",this.onTouchMove),self.removeEventListener("mouseup",this.onMouseUp),e.removeEventListener("touchend",this.onTouchEnd),e.style.cursor="",this.touchMode=null,this._interactionEnabled=!1,this.updateTouchActionStyle()}}get options(){return this._options}set disableZoom(e){this._disableZoom!=e&&(this._disableZoom=e,e===!0?this.element.removeEventListener("wheel",this.onWheel):this.element.addEventListener("wheel",this.onWheel),this.updateTouchActionStyle())}getCameraSpherical(e=new Fa){return e.copy(this.spherical)}getFieldOfView(){return this.camera.fov}applyOptions(e){Object.assign(this._options,e),this.setOrbit(),this.setFieldOfView(Math.exp(this.goalLogFov))}updateNearFar(e,t){this.camera.near=Math.max(e,t/1e3),this.camera.far=t,this.camera.updateProjectionMatrix()}updateAspect(e){this.camera.aspect=e,this.camera.updateProjectionMatrix()}setOrbit(e=this.goalSpherical.theta,t=this.goalSpherical.phi,n=this.goalSpherical.radius){const{minimumAzimuthalAngle:i,maximumAzimuthalAngle:r,minimumPolarAngle:a,maximumPolarAngle:o,minimumRadius:l,maximumRadius:c}=this._options,{theta:h,phi:u,radius:d}=this.goalSpherical,p=vi(e,i,r);isFinite(i)||isFinite(r)||(this.spherical.theta=this.wrapAngle(this.spherical.theta-p)+p);const m=vi(t,a,o),f=vi(n,l,c);return(p!==h||m!==u||f!==d)&&(this.goalSpherical.theta=p,this.goalSpherical.phi=m,this.goalSpherical.radius=f,this.goalSpherical.makeSafe(),this.isUserChange=!1,!0)}setRadius(e){this.goalSpherical.radius=e,this.setOrbit()}setFieldOfView(e){const{minimumFieldOfView:t,maximumFieldOfView:n}=this._options;e=vi(e,t,n),this.goalLogFov=Math.log(e)}setDamperDecayTime(e){this.thetaDamper.setDecayTime(e),this.phiDamper.setDecayTime(e),this.radiusDamper.setDecayTime(e),this.fovDamper.setDecayTime(e)}adjustOrbit(e,t,n){const{theta:i,phi:r,radius:a}=this.goalSpherical,{minimumRadius:o,maximumRadius:l,minimumFieldOfView:c,maximumFieldOfView:h}=this._options,u=this.spherical.theta-i,d=Math.PI-.001,p=i-vi(e,-d-u,d-u),m=r-t,f=n===0?0:((n>0?l:o)-a)/(Math.log(n>0?h:c)-this.goalLogFov),g=a+n*(isFinite(f)?f:2*(l-o));if(this.setOrbit(p,m,g),n!==0){const x=this.goalLogFov+n;this.setFieldOfView(Math.exp(x))}}jumpToGoal(){this.update(0,1e4)}update(e,t){if(this.isStationary())return;const{maximumPolarAngle:n,maximumRadius:i}=this._options,r=this.spherical.theta-this.goalSpherical.theta;Math.abs(r)>Math.PI&&!isFinite(this._options.minimumAzimuthalAngle)&&!isFinite(this._options.maximumAzimuthalAngle)&&(this.spherical.theta-=2*Math.sign(r)*Math.PI),this.spherical.theta=this.thetaDamper.update(this.spherical.theta,this.goalSpherical.theta,t,Math.PI),this.spherical.phi=this.phiDamper.update(this.spherical.phi,this.goalSpherical.phi,t,n),this.spherical.radius=this.radiusDamper.update(this.spherical.radius,this.goalSpherical.radius,t,i),this.logFov=this.fovDamper.update(this.logFov,this.goalLogFov,t,1),this.moveCamera()}updateTouchActionStyle(){const{style:e}=this.element;if(this._interactionEnabled){const{touchAction:t}=this._options;this._disableZoom&&t!=="none"?e.touchAction="manipulation":e.touchAction=t}else e.touchAction=""}isStationary(){return this.goalSpherical.theta===this.spherical.theta&&this.goalSpherical.phi===this.spherical.phi&&this.goalSpherical.radius===this.spherical.radius&&this.goalLogFov===this.logFov}moveCamera(){this.spherical.makeSafe(),this.camera.position.setFromSpherical(this.spherical),this.camera.setRotationFromEuler(new Zn(this.spherical.phi-Math.PI/2,this.spherical.theta,0,"YXZ")),this.camera.fov!==Math.exp(this.logFov)&&(this.camera.fov=Math.exp(this.logFov),this.camera.updateProjectionMatrix());const e=this.isUserChange?Wc:lb;this.dispatchEvent({type:"change",source:e})}get canInteract(){return this._options.interactionPolicy=="allow-when-focused"?this.element.getRootNode().activeElement===this.element:this._options.interactionPolicy==="always-allow"}userAdjustOrbit(e,t,n){this.adjustOrbit(e*this.sensitivity,t*this.sensitivity,n),this.isUserChange=!0,this.dispatchEvent({type:"change",source:Wc})}wrapAngle(e){const t=(e+Math.PI)/(2*Math.PI);return 2*(t-Math.floor(t))*Math.PI-Math.PI}pixelLengthToSphericalAngle(e){return 2*Math.PI*e/this.element.clientHeight}twoTouchDistance(e,t){const{clientX:n,clientY:i}=e,{clientX:r,clientY:a}=t,o=r-n,l=a-i;return Math.sqrt(o*o+l*l)}handleSinglePointerMove(e){const{clientX:t,clientY:n}=e,i=this.pixelLengthToSphericalAngle(t-this.lastPointerPosition.clientX),r=this.pixelLengthToSphericalAngle(n-this.lastPointerPosition.clientY);this.lastPointerPosition.clientX=t,this.lastPointerPosition.clientY=n,this.isUserPointing===!1&&(this.isUserPointing=!0,this.dispatchEvent({type:"pointer-change-start",pointer:Object.assign({},e)})),this.userAdjustOrbit(i,r,0)}onPointerDown(e){this.canInteract&&(this.isUserPointing=!1,e())}onTouchChange(e){const{targetTouches:t}=e;switch(t.length){default:case 1:this.touchMode=this.touchModeRotate,this.handleSinglePointerDown(t[0]);break;case 2:this.touchMode=this._disableZoom||this.touchDecided&&this.touchMode===null?null:this.touchModeZoom,this.touchDecided=!0}this.lastTouches=t}handleSinglePointerDown(e){this.lastPointerPosition.clientX=e.clientX,this.lastPointerPosition.clientY=e.clientY,this.element.style.cursor="grabbing"}onPointerUp(){this.element.style.cursor="grab",this.isUserPointing&&this.dispatchEvent({type:"pointer-change-end",pointer:Object.assign({},this.lastPointerPosition)})}}/* @license
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
 */const Kf=s=>s<.5?2*s*s:(4-2*s)*s-1,hb=(s,e,t=Kf)=>n=>s+(e-s)*t(n),Qf=(s,e)=>{const t=[],n=[];let i=s;for(let r=0;r<e.length;++r){const a=e[r],{value:o,frames:l}=a,c=a.ease||Kf,h=hb(i,o,c);t.push(h),n.push(l),i=o}return((r,a)=>{const o=a.reduce((c,h)=>c+h,0),l=a.map(c=>c/o);return c=>{let h=0,u=1/0,d=()=>0;for(let p=0;p<l.length&&(u=l[p],d=r[p],!(c<=h+u));++p)h+=u;return d((c-h)/u)}})(t,n)};/* @license
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
 */var rt=function(s,e,t,n){for(var i,r=arguments.length,a=r<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,t):n,o=s.length-1;o>=0;o--)(i=s[o])&&(a=(r<3?i(a):r>3?i(e,t,a):i(e,t))||a);return r>3&&a&&Object.defineProperty(e,t,a),a};const ub=Qf(0,[{frames:5,value:-1},{frames:1,value:-1},{frames:8,value:1},{frames:1,value:1},{frames:5,value:0},{frames:18,value:0}]),db=Qf(0,[{frames:1,value:1},{frames:5,value:1},{frames:1,value:0},{frames:6,value:0}]),pb=["front","right","back","left"],mb=["upper-","","lower-"],Yr="auto",vp="when-focused",Bl="wiggle",fb="always-allow",gb="pan-y",vb=()=>({basis:[Ds(ot(45,"deg"))],keywords:{auto:[null]}}),yb={basis:[Ds(ot(25,"deg"))],keywords:{auto:[null]}},xb=()=>({basis:[Ds(ot(45,"deg"))],keywords:{auto:[null]}}),eg=(()=>{const s=Mi("0deg 75deg 105%")[0].terms,e=sn(s[0]),t=sn(s[1]);return n=>{const i=n[ae].idealCameraDistance();return{basis:[e,t,ot(i,"m")],keywords:{auto:[null,null,ot(105,"%")]}}}})(),bb=s=>{const e=1.1*s[ae].boundingRadius;return{basis:[ot(-1/0,"rad"),ot(Math.PI/8,"rad"),ot(e,"m")],keywords:{auto:[null,null,null]}}},wb=s=>{const e=eg(s),t=new jf([],e).evaluate()[2];return{basis:[ot(1/0,"rad"),ot(Math.PI-Math.PI/8,"rad"),ot(t,"m")],keywords:{auto:[null,null,null]}}},_b=s=>{const e=s[ae].boundingBox.getCenter(new T);return{basis:[ot(e.x,"m"),ot(e.y,"m"),ot(e.z,"m")],keywords:{auto:[null,null,null]}}},jc=Math.PI/2,yp=Math.PI/3,xp=jc/2,bp=2*Math.PI,Be=Symbol("controls"),Zr=Symbol("promptElement"),Hl=Symbol("promptAnimatedContainer"),Ca=Symbol("deferInteractionPrompt"),wp=Symbol("updateAria"),_p=Symbol("updateCameraForRadius"),Vl=Symbol("onBlur"),Gl=Symbol("onFocus"),Wl=Symbol("onChange"),Jr=Symbol("onPointerChange"),bn=Symbol("waitingToPromptUser"),$r=Symbol("userHasInteracted"),ci=Symbol("promptElementVisibleTime"),Kr=Symbol("lastPromptOffset"),Qr=Symbol("focusedTime"),Pa=Symbol("lastSpherical"),es=Symbol("jumpCamera"),jl=Symbol("initialized"),ts=Symbol("maintainThetaPhi"),Mp=Symbol("syncCameraOrbit"),Sp=Symbol("syncFieldOfView"),Tp=Symbol("syncCameraTarget"),Ep=Symbol("syncMinCameraOrbit"),Ap=Symbol("syncMaxCameraOrbit"),Rp=Symbol("syncMinFieldOfView"),Lp=Symbol("syncMaxFieldOfView");/* @license
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
 */var tg,ng;const Ba=Symbol("modelViewerStatusInstance"),ig=Symbol("updateStatus");tg=Ba,ng=ig;/* @license
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
 */var ns=function(s,e,t,n){for(var i,r=arguments.length,a=r<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,t):n,o=s.length-1;o>=0;o--)(i=s[o])&&(a=(r<3?i(a):r>3?i(e,t,a):i(e,t))||a);return r>3&&a&&Object.defineProperty(e,t,a),a};const Ia="auto",Cp="manual",Mb="auto",Sb="eager",Tb="interaction",Pp=new class extends At{constructor(){super(),this[tg]=null,this.registeredInstanceStatuses=new Map,this.loadingPromises=[],this.statusElement=document.createElement("p"),this.statusUpdateInProgress=!1,this[ng]=Oc(()=>this.updateStatus(),100);const{statusElement:s}=this,{style:e}=s;s.setAttribute("role","status"),s.classList.add("screen-reader-only"),e.top=e.left="0",e.pointerEvents="none"}registerInstance(s){if(this.registeredInstanceStatuses.has(s))return;let e=()=>{};const t=s.loaded===!1&&!!s.src,n=new Promise(i=>{if(!t)return void i();const r=()=>{i(),s.removeEventListener("load",r),s.removeEventListener("error",r)};s.addEventListener("load",r),s.addEventListener("error",r),e=r});this.registeredInstanceStatuses.set(s,{onUnregistered:e}),this.loadingPromises.push(n),this.modelViewerStatusInstance==null&&(this.modelViewerStatusInstance=s)}unregisterInstance(s){if(!this.registeredInstanceStatuses.has(s))return;const e=this.registeredInstanceStatuses,t=e.get(s);e.delete(s),t.onUnregistered(),this.modelViewerStatusInstance===s&&(this.modelViewerStatusInstance=e.size>0?(n=>{if(n.keys!=null)return n.keys().next().value||null;let i=null;try{n.forEach((r,a,o)=>{throw i=a,new Error})}catch{}return i})(e):null)}get modelViewerStatusInstance(){return this[Ba]}set modelViewerStatusInstance(s){if(this[Ba]===s)return;const{statusElement:e}=this;s!=null&&s.shadowRoot!=null?s.shadowRoot.appendChild(e):e.parentNode!=null&&e.parentNode.removeChild(e),this[Ba]=s,this[ig]()}async updateStatus(){if(!this.statusUpdateInProgress&&this.loadingPromises.length!==0){for(this.statusElement.textContent="This page includes one or more 3D models that are loading",this.statusUpdateInProgress=!0,this.dispatchEvent({type:"initial-status-announced"});this.loadingPromises.length;){const{loadingPromises:s}=this;this.loadingPromises=[],await Promise.all(s)}this.statusElement.textContent="All 3D models in the page have loaded",this.statusUpdateInProgress=!1,this.dispatchEvent({type:"finished-loading-announced"})}}},hi=Symbol("defaultProgressBarElement"),Ip=Symbol("defaultProgressMaskElement"),wn=Symbol("posterContainerElement"),Zi=Symbol("defaultPosterElement"),is=Symbol("posterDismissalSource"),ql=Symbol("hidePoster"),Da=Symbol("modelIsRevealed"),Xl=Symbol("updateProgressBar"),rs=Symbol("lastReportedProgress"),ss=Symbol("transitioned"),Yl=Symbol("onTransitionEnd"),Dp=Symbol("ariaLabelCallToAction"),Zl=Symbol("onClick"),Jl=Symbol("onKeydown"),$l=Symbol("onProgress");class yh{constructor(){this.pluginCallbacks=[],this.register(function(e){return new Hb(e)}),this.register(function(e){return new Vb(e)}),this.register(function(e){return new Gb(e)}),this.register(function(e){return new jb(e)}),this.register(function(e){return new qb(e)}),this.register(function(e){return new Wb(e)})}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,i){typeof n=="object"&&(console.warn("THREE.GLTFExporter: parse() expects options as the fourth argument now."),i=n);const r=new Bb,a=[];for(let o=0,l=this.pluginCallbacks.length;o<l;o++)a.push(this.pluginCallbacks[o](r));r.setPlugins(a),r.write(e,t,i).catch(n)}parseAsync(e,t){const n=this;return new Promise(function(i,r){n.parse(e,i,r,t)})}}const Eb=0,Np=1,Ab=2,Rb=3,Lb=4,Kl=5121,Ql=5123,Fp=5126,Op=5125,Up=34962,Cb=34963,Pb=9728,Ib=9729,Db=9984,Nb=9985,Fb=9986,Ob=9987,Ub=33071,kb=33648,zb=10497,Tt={};Tt[1003]=Pb,Tt[1004]=Db,Tt[1005]=Fb,Tt[1006]=Ib,Tt[1007]=Nb,Tt[1008]=Ob,Tt[1001]=Ub,Tt[1e3]=zb,Tt[1002]=kb;const kp={scale:"scale",position:"translation",quaternion:"rotation",morphTargetInfluences:"weights"};function as(s,e){return s.length===e.length&&s.every(function(t,n){return t===e[n]})}function rg(s){return 4*Math.ceil(s/4)}function ec(s,e=0){const t=rg(s.byteLength);if(t!==s.byteLength){const n=new Uint8Array(t);if(n.set(new Uint8Array(s)),e!==0)for(let i=s.byteLength;i<t;i++)n[i]=e;return n.buffer}return s}let zp=null;class Bb{constructor(){this.plugins=[],this.options={},this.pending=[],this.buffers=[],this.byteOffset=0,this.buffers=[],this.nodeMap=new Map,this.skins=[],this.extensionsUsed={},this.uids=new Map,this.uid=0,this.json={asset:{version:"2.0",generator:"THREE.GLTFExporter"}},this.cache={meshes:new Map,attributes:new Map,attributesNormalized:new Map,materials:new Map,textures:new Map,images:new Map}}setPlugins(e){this.plugins=e}async write(e,t,n){this.options=Object.assign({},{binary:!1,trs:!1,onlyVisible:!0,truncateDrawRange:!0,embedImages:!0,maxTextureSize:1/0,animations:[],includeCustomExtensions:!1},n),this.options.animations.length>0&&(this.options.trs=!0),this.processInput(e),await Promise.all(this.pending);const i=this,r=i.buffers,a=i.json;n=i.options;const o=i.extensionsUsed,l=new Blob(r,{type:"application/octet-stream"}),c=Object.keys(o);if(c.length>0&&(a.extensionsUsed=c),a.buffers&&a.buffers.length>0&&(a.buffers[0].byteLength=l.size),n.binary===!0){const h=new window.FileReader;h.readAsArrayBuffer(l),h.onloadend=function(){const u=ec(h.result),d=new DataView(new ArrayBuffer(8));d.setUint32(0,u.byteLength,!0),d.setUint32(4,5130562,!0);const p=ec(function(b){if(window.TextEncoder!==void 0)return new TextEncoder().encode(b).buffer;const w=new Uint8Array(new ArrayBuffer(b.length));for(let S=0,M=b.length;S<M;S++){const L=b.charCodeAt(S);w[S]=L>255?32:L}return w.buffer}(JSON.stringify(a)),32),m=new DataView(new ArrayBuffer(8));m.setUint32(0,p.byteLength,!0),m.setUint32(4,1313821514,!0);const f=new ArrayBuffer(12),g=new DataView(f);g.setUint32(0,1179937895,!0),g.setUint32(4,2,!0);const x=12+m.byteLength+p.byteLength+d.byteLength+u.byteLength;g.setUint32(8,x,!0);const v=new Blob([f,m,p,d,u],{type:"application/octet-stream"}),y=new window.FileReader;y.readAsArrayBuffer(v),y.onloadend=function(){t(y.result)}}}else if(a.buffers&&a.buffers.length>0){const h=new window.FileReader;h.readAsDataURL(l),h.onloadend=function(){const u=h.result;a.buffers[0].uri=u,t(a)}}else t(a)}serializeUserData(e,t){if(Object.keys(e.userData).length===0)return;const n=this.options,i=this.extensionsUsed;try{const r=JSON.parse(JSON.stringify(e.userData));if(n.includeCustomExtensions&&r.gltfExtensions){t.extensions===void 0&&(t.extensions={});for(const a in r.gltfExtensions)t.extensions[a]=r.gltfExtensions[a],i[a]=!0;delete r.gltfExtensions}Object.keys(r).length>0&&(t.extras=r)}catch(r){console.warn("THREE.GLTFExporter: userData of '"+e.name+"' won't be serialized because of JSON.stringify error - "+r.message)}}getUID(e){return this.uids.has(e)||this.uids.set(e,this.uid++),this.uids.get(e)}isNormalizedNormalAttribute(e){if(this.cache.attributesNormalized.has(e))return!1;const t=new T;for(let n=0,i=e.count;n<i;n++)if(Math.abs(t.fromBufferAttribute(e,n).length()-1)>5e-4)return!1;return!0}createNormalizedNormalAttribute(e){const t=this.cache;if(t.attributesNormalized.has(e))return t.attributesNormalized.get(e);const n=e.clone(),i=new T;for(let r=0,a=n.count;r<a;r++)i.fromBufferAttribute(n,r),i.x===0&&i.y===0&&i.z===0?i.setX(1):i.normalize(),n.setXYZ(r,i.x,i.y,i.z);return t.attributesNormalized.set(e,n),n}applyTextureTransform(e,t){let n=!1;const i={};t.offset.x===0&&t.offset.y===0||(i.offset=t.offset.toArray(),n=!0),t.rotation!==0&&(i.rotation=t.rotation,n=!0),t.repeat.x===1&&t.repeat.y===1||(i.scale=t.repeat.toArray(),n=!0),n&&(e.extensions=e.extensions||{},e.extensions.KHR_texture_transform=i,this.extensionsUsed.KHR_texture_transform=!0)}processBuffer(e){const t=this.json,n=this.buffers;return t.buffers||(t.buffers=[{byteLength:0}]),n.push(e),0}processBufferView(e,t,n,i,r){const a=this.json;let o;a.bufferViews||(a.bufferViews=[]),o=t===Kl?1:t===Ql?2:4;const l=rg(i*e.itemSize*o),c=new DataView(new ArrayBuffer(l));let h=0;for(let d=n;d<n+i;d++)for(let p=0;p<e.itemSize;p++){let m;e.itemSize>4?m=e.array[d*e.itemSize+p]:p===0?m=e.getX(d):p===1?m=e.getY(d):p===2?m=e.getZ(d):p===3&&(m=e.getW(d)),t===Fp?c.setFloat32(h,m,!0):t===Op?c.setUint32(h,m,!0):t===Ql?c.setUint16(h,m,!0):t===Kl&&c.setUint8(h,m),h+=o}const u={buffer:this.processBuffer(c.buffer),byteOffset:this.byteOffset,byteLength:l};return r!==void 0&&(u.target=r),r===Up&&(u.byteStride=e.itemSize*o),this.byteOffset+=l,a.bufferViews.push(u),{id:a.bufferViews.length-1,byteLength:0}}processBufferViewImage(e){const t=this,n=t.json;return n.bufferViews||(n.bufferViews=[]),new Promise(function(i){const r=new window.FileReader;r.readAsArrayBuffer(e),r.onloadend=function(){const a=ec(r.result),o={buffer:t.processBuffer(a),byteOffset:t.byteOffset,byteLength:a.byteLength};t.byteOffset+=a.byteLength,i(n.bufferViews.push(o)-1)}})}processAccessor(e,t,n,i){const r=this.options,a=this.json;let o;if(e.array.constructor===Float32Array)o=Fp;else if(e.array.constructor===Uint32Array)o=Op;else if(e.array.constructor===Uint16Array)o=Ql;else{if(e.array.constructor!==Uint8Array)throw new Error("THREE.GLTFExporter: Unsupported bufferAttribute component type.");o=Kl}if(n===void 0&&(n=0),i===void 0&&(i=e.count),r.truncateDrawRange&&t!==void 0&&t.index===null){const d=n+i,p=t.drawRange.count===1/0?e.count:t.drawRange.start+t.drawRange.count;n=Math.max(n,t.drawRange.start),(i=Math.min(d,p)-n)<0&&(i=0)}if(i===0)return null;const l=function(d,p,m){const f={min:new Array(d.itemSize).fill(Number.POSITIVE_INFINITY),max:new Array(d.itemSize).fill(Number.NEGATIVE_INFINITY)};for(let g=p;g<p+m;g++)for(let x=0;x<d.itemSize;x++){let v;d.itemSize>4?v=d.array[g*d.itemSize+x]:x===0?v=d.getX(g):x===1?v=d.getY(g):x===2?v=d.getZ(g):x===3&&(v=d.getW(g)),f.min[x]=Math.min(f.min[x],v),f.max[x]=Math.max(f.max[x],v)}return f}(e,n,i);let c;t!==void 0&&(c=e===t.index?Cb:Up);const h=this.processBufferView(e,o,n,i,c),u={bufferView:h.id,byteOffset:h.byteOffset,componentType:o,count:i,max:l.max,min:l.min,type:{1:"SCALAR",2:"VEC2",3:"VEC3",4:"VEC4",16:"MAT4"}[e.itemSize]};return e.normalized===!0&&(u.normalized=!0),a.accessors||(a.accessors=[]),a.accessors.push(u)-1}processImage(e,t,n){const i=this,r=i.cache,a=i.json,o=i.options,l=i.pending;r.images.has(e)||r.images.set(e,{});const c=r.images.get(e),h=t===1023?"image/png":"image/jpeg",u=h+":flipY/"+n.toString();if(c[u]!==void 0)return c[u];a.images||(a.images=[]);const d={mimeType:h};if(o.embedImages){const m=zp=zp||document.createElement("canvas");m.width=Math.min(e.width,o.maxTextureSize),m.height=Math.min(e.height,o.maxTextureSize);const f=m.getContext("2d");if(n===!0&&(f.translate(0,m.height),f.scale(1,-1)),typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof OffscreenCanvas<"u"&&e instanceof OffscreenCanvas||typeof ImageBitmap<"u"&&e instanceof ImageBitmap)f.drawImage(e,0,0,m.width,m.height);else{t!==1023&&t!==1022&&console.error("GLTFExporter: Only RGB and RGBA formats are supported."),(e.width>o.maxTextureSize||e.height>o.maxTextureSize)&&console.warn("GLTFExporter: Image size is bigger than maxTextureSize",e);const g=new Uint8ClampedArray(e.height*e.width*4);if(t===1023)for(let x=0;x<g.length;x+=4)g[x+0]=e.data[x+0],g[x+1]=e.data[x+1],g[x+2]=e.data[x+2],g[x+3]=e.data[x+3];else for(let x=0,v=0;x<g.length;x+=4,v+=3)g[x+0]=e.data[v+0],g[x+1]=e.data[v+1],g[x+2]=e.data[v+2],g[x+3]=255;f.putImageData(new ImageData(g,e.width,e.height),0,0)}o.binary===!0?l.push(new Promise(function(g){m.toBlob(function(x){i.processBufferViewImage(x).then(function(v){d.bufferView=v,g()})},h)})):d.uri=m.toDataURL(h)}else d.uri=e.src;const p=a.images.push(d)-1;return c[u]=p,p}processSampler(e){const t=this.json;t.samplers||(t.samplers=[]);const n={magFilter:Tt[e.magFilter],minFilter:Tt[e.minFilter],wrapS:Tt[e.wrapS],wrapT:Tt[e.wrapT]};return t.samplers.push(n)-1}processTexture(e){const t=this.cache,n=this.json;if(t.textures.has(e))return t.textures.get(e);n.textures||(n.textures=[]);const i={sampler:this.processSampler(e),source:this.processImage(e.image,e.format,e.flipY)};e.name&&(i.name=e.name),this._invokeAll(function(a){a.writeTexture&&a.writeTexture(e,i)});const r=n.textures.push(i)-1;return t.textures.set(e,r),r}processMaterial(e){const t=this.cache,n=this.json;if(t.materials.has(e))return t.materials.get(e);if(e.isShaderMaterial)return console.warn("GLTFExporter: THREE.ShaderMaterial not supported."),null;n.materials||(n.materials=[]);const i={pbrMetallicRoughness:{}};e.isMeshStandardMaterial!==!0&&e.isMeshBasicMaterial!==!0&&console.warn("GLTFExporter: Use MeshStandardMaterial or MeshBasicMaterial for best results.");const r=e.color.toArray().concat([e.opacity]);if(as(r,[1,1,1,1])||(i.pbrMetallicRoughness.baseColorFactor=r),e.isMeshStandardMaterial?(i.pbrMetallicRoughness.metallicFactor=e.metalness,i.pbrMetallicRoughness.roughnessFactor=e.roughness):(i.pbrMetallicRoughness.metallicFactor=.5,i.pbrMetallicRoughness.roughnessFactor=.5),e.metalnessMap||e.roughnessMap)if(e.metalnessMap===e.roughnessMap){const o={index:this.processTexture(e.metalnessMap)};this.applyTextureTransform(o,e.metalnessMap),i.pbrMetallicRoughness.metallicRoughnessTexture=o}else console.warn("THREE.GLTFExporter: Ignoring metalnessMap and roughnessMap because they are not the same Texture.");if(e.map){const o={index:this.processTexture(e.map)};this.applyTextureTransform(o,e.map),i.pbrMetallicRoughness.baseColorTexture=o}if(e.emissive){const o=e.emissive.clone().multiplyScalar(e.emissiveIntensity),l=Math.max(o.r,o.g,o.b);if(l>1&&(o.multiplyScalar(1/l),console.warn("THREE.GLTFExporter: Some emissive components exceed 1; emissive has been limited")),l>0&&(i.emissiveFactor=o.toArray()),e.emissiveMap){const c={index:this.processTexture(e.emissiveMap)};this.applyTextureTransform(c,e.emissiveMap),i.emissiveTexture=c}}if(e.normalMap){const o={index:this.processTexture(e.normalMap)};e.normalScale&&e.normalScale.x!==1&&(o.scale=e.normalScale.x),this.applyTextureTransform(o,e.normalMap),i.normalTexture=o}if(e.aoMap){const o={index:this.processTexture(e.aoMap),texCoord:1};e.aoMapIntensity!==1&&(o.strength=e.aoMapIntensity),this.applyTextureTransform(o,e.aoMap),i.occlusionTexture=o}e.transparent?i.alphaMode="BLEND":e.alphaTest>0&&(i.alphaMode="MASK",i.alphaCutoff=e.alphaTest),e.side===2&&(i.doubleSided=!0),e.name!==""&&(i.name=e.name),this.serializeUserData(e,i),this._invokeAll(function(o){o.writeMaterial&&o.writeMaterial(e,i)});const a=n.materials.push(i)-1;return t.materials.set(e,a),a}processMesh(e){const t=this.cache,n=this.json,i=[e.geometry.uuid];if(Array.isArray(e.material))for(let y=0,b=e.material.length;y<b;y++)i.push(e.material[y].uuid);else i.push(e.material.uuid);const r=i.join(":");if(t.meshes.has(r))return t.meshes.get(r);const a=e.geometry;let o;if(o=e.isLineSegments?Np:e.isLineLoop?Ab:e.isLine?Rb:e.isPoints?Eb:e.material.wireframe?Np:Lb,a.isBufferGeometry!==!0)throw new Error("THREE.GLTFExporter: Geometry is not of type THREE.BufferGeometry.");const l={},c={},h=[],u=[],d={uv:"TEXCOORD_0",uv2:"TEXCOORD_1",color:"COLOR_0",skinWeight:"WEIGHTS_0",skinIndex:"JOINTS_0"},p=a.getAttribute("normal");p===void 0||this.isNormalizedNormalAttribute(p)||(console.warn("THREE.GLTFExporter: Creating normalized normal attribute from the non-normalized one."),a.setAttribute("normal",this.createNormalizedNormalAttribute(p)));let m=null;for(let y in a.attributes){if(y.substr(0,5)==="morph")continue;const b=a.attributes[y];if(y=d[y]||y.toUpperCase(),/^(POSITION|NORMAL|TANGENT|TEXCOORD_\d+|COLOR_\d+|JOINTS_\d+|WEIGHTS_\d+)$/.test(y)||(y="_"+y),t.attributes.has(this.getUID(b))){c[y]=t.attributes.get(this.getUID(b));continue}m=null;const w=b.array;y!=="JOINTS_0"||w instanceof Uint16Array||w instanceof Uint8Array||(console.warn('GLTFExporter: Attribute "skinIndex" converted to type UNSIGNED_SHORT.'),m=new ke(new Uint16Array(w),b.itemSize,b.normalized));const S=this.processAccessor(m||b,a);S!==null&&(c[y]=S,t.attributes.set(this.getUID(b),S))}if(p!==void 0&&a.setAttribute("normal",p),Object.keys(c).length===0)return null;if(e.morphTargetInfluences!==void 0&&e.morphTargetInfluences.length>0){const y=[],b=[],w={};if(e.morphTargetDictionary!==void 0)for(const S in e.morphTargetDictionary)w[e.morphTargetDictionary[S]]=S;for(let S=0;S<e.morphTargetInfluences.length;++S){const M={};let L=!1;for(const I in a.morphAttributes){if(I!=="position"&&I!=="normal"){L||(console.warn("GLTFExporter: Only POSITION and NORMAL morph are supported."),L=!0);continue}const P=a.morphAttributes[I][S],N=I.toUpperCase(),W=a.attributes[I];if(t.attributes.has(this.getUID(P))){M[N]=t.attributes.get(this.getUID(P));continue}const G=P.clone();if(!a.morphTargetsRelative)for(let U=0,j=P.count;U<j;U++)G.setXYZ(U,P.getX(U)-W.getX(U),P.getY(U)-W.getY(U),P.getZ(U)-W.getZ(U));M[N]=this.processAccessor(G,a),t.attributes.set(this.getUID(W),M[N])}u.push(M),y.push(e.morphTargetInfluences[S]),e.morphTargetDictionary!==void 0&&b.push(w[S])}l.weights=y,b.length>0&&(l.extras={},l.extras.targetNames=b)}const f=Array.isArray(e.material);if(f&&a.groups.length===0)return null;const g=f?e.material:[e.material],x=f?a.groups:[{materialIndex:0,start:void 0,count:void 0}];for(let y=0,b=x.length;y<b;y++){const w={mode:o,attributes:c};if(this.serializeUserData(a,w),u.length>0&&(w.targets=u),a.index!==null){let M=this.getUID(a.index);x[y].start===void 0&&x[y].count===void 0||(M+=":"+x[y].start+":"+x[y].count),t.attributes.has(M)?w.indices=t.attributes.get(M):(w.indices=this.processAccessor(a.index,a,x[y].start,x[y].count),t.attributes.set(M,w.indices)),w.indices===null&&delete w.indices}const S=this.processMaterial(g[x[y].materialIndex]);S!==null&&(w.material=S),h.push(w)}l.primitives=h,n.meshes||(n.meshes=[]),this._invokeAll(function(y){y.writeMesh&&y.writeMesh(e,l)});const v=n.meshes.push(l)-1;return t.meshes.set(r,v),v}processCamera(e){const t=this.json;t.cameras||(t.cameras=[]);const n=e.isOrthographicCamera,i={type:n?"orthographic":"perspective"};return n?i.orthographic={xmag:2*e.right,ymag:2*e.top,zfar:e.far<=0?.001:e.far,znear:e.near<0?0:e.near}:i.perspective={aspectRatio:e.aspect,yfov:Cm.degToRad(e.fov),zfar:e.far<=0?.001:e.far,znear:e.near<0?0:e.near},e.name!==""&&(i.name=e.type),t.cameras.push(i)-1}processAnimation(e,t){const n=this.json,i=this.nodeMap;n.animations||(n.animations=[]);const r=(e=yh.Utils.mergeMorphTargetTracks(e.clone(),t)).tracks,a=[],o=[];for(let l=0;l<r.length;++l){const c=r[l],h=Te.parseTrackName(c.name);let u=Te.findNode(t,h.nodeName);const d=kp[h.propertyName];if(h.objectName==="bones"&&(u=u.isSkinnedMesh===!0?u.skeleton.getBoneByName(h.objectIndex):void 0),!u||!d)return console.warn('THREE.GLTFExporter: Could not export animation track "%s".',c.name),null;const p=1;let m,f=c.values.length/c.times.length;d===kp.morphTargetInfluences&&(f/=u.morphTargetInfluences.length),c.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline===!0?(m="CUBICSPLINE",f/=3):m=c.getInterpolation()===2300?"STEP":"LINEAR",o.push({input:this.processAccessor(new ke(c.times,p)),output:this.processAccessor(new ke(c.values,f)),interpolation:m}),a.push({sampler:o.length-1,target:{node:i.get(u),path:d}})}return n.animations.push({name:e.name||"clip_"+n.animations.length,samplers:o,channels:a}),n.animations.length-1}processSkin(e){const t=this.json,n=this.nodeMap,i=t.nodes[n.get(e)],r=e.skeleton;if(r===void 0)return null;const a=e.skeleton.bones[0];if(a===void 0)return null;const o=[],l=new Float32Array(16*r.bones.length),c=new he;for(let h=0;h<r.bones.length;++h)o.push(n.get(r.bones[h])),c.copy(r.boneInverses[h]),c.multiply(e.bindMatrix).toArray(l,16*h);return t.skins===void 0&&(t.skins=[]),t.skins.push({inverseBindMatrices:this.processAccessor(new ke(l,16)),joints:o,skeleton:n.get(a)}),i.skin=t.skins.length-1}processNode(e){const t=this.json,n=this.options,i=this.nodeMap;t.nodes||(t.nodes=[]);const r={};if(n.trs){const o=e.quaternion.toArray(),l=e.position.toArray(),c=e.scale.toArray();as(o,[0,0,0,1])||(r.rotation=o),as(l,[0,0,0])||(r.translation=l),as(c,[1,1,1])||(r.scale=c)}else e.matrixAutoUpdate&&e.updateMatrix(),as(e.matrix.elements,[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])===!1&&(r.matrix=e.matrix.elements);if(e.name!==""&&(r.name=String(e.name)),this.serializeUserData(e,r),e.isMesh||e.isLine||e.isPoints){const o=this.processMesh(e);o!==null&&(r.mesh=o)}else e.isCamera&&(r.camera=this.processCamera(e));if(e.isSkinnedMesh&&this.skins.push(e),e.children.length>0){const o=[];for(let l=0,c=e.children.length;l<c;l++){const h=e.children[l];if(h.visible||n.onlyVisible===!1){const u=this.processNode(h);u!==null&&o.push(u)}}o.length>0&&(r.children=o)}this._invokeAll(function(o){o.writeNode&&o.writeNode(e,r)});const a=t.nodes.push(r)-1;return i.set(e,a),a}processScene(e){const t=this.json,n=this.options;t.scenes||(t.scenes=[],t.scene=0);const i={};e.name!==""&&(i.name=e.name),t.scenes.push(i);const r=[];for(let a=0,o=e.children.length;a<o;a++){const l=e.children[a];if(l.visible||n.onlyVisible===!1){const c=this.processNode(l);c!==null&&r.push(c)}}r.length>0&&(i.nodes=r),this.serializeUserData(e,i)}processObjects(e){const t=new an;t.name="AuxScene";for(let n=0;n<e.length;n++)t.children.push(e[n]);this.processScene(t)}processInput(e){const t=this.options;e=e instanceof Array?e:[e],this._invokeAll(function(i){i.beforeParse&&i.beforeParse(e)});const n=[];for(let i=0;i<e.length;i++)e[i]instanceof an?this.processScene(e[i]):n.push(e[i]);n.length>0&&this.processObjects(n);for(let i=0;i<this.skins.length;++i)this.processSkin(this.skins[i]);for(let i=0;i<t.animations.length;++i)this.processAnimation(t.animations[i],e[0]);this._invokeAll(function(i){i.afterParse&&i.afterParse(e)})}_invokeAll(e){for(let t=0,n=this.plugins.length;t<n;t++)e(this.plugins[t])}}class Hb{constructor(e){this.writer=e,this.name="KHR_lights_punctual"}writeNode(e,t){if(!e.isLight)return;if(!e.isDirectionalLight&&!e.isPointLight&&!e.isSpotLight)return void console.warn("THREE.GLTFExporter: Only directional, point, and spot lights are supported.",e);const n=this.writer,i=n.json,r=n.extensionsUsed,a={};e.name&&(a.name=e.name),a.color=e.color.toArray(),a.intensity=e.intensity,e.isDirectionalLight?a.type="directional":e.isPointLight?(a.type="point",e.distance>0&&(a.range=e.distance)):e.isSpotLight&&(a.type="spot",e.distance>0&&(a.range=e.distance),a.spot={},a.spot.innerConeAngle=(e.penumbra-1)*e.angle*-1,a.spot.outerConeAngle=e.angle),e.decay!==void 0&&e.decay!==2&&console.warn("THREE.GLTFExporter: Light decay may be lost. glTF is physically-based, and expects light.decay=2."),!e.target||e.target.parent===e&&e.target.position.x===0&&e.target.position.y===0&&e.target.position.z===-1||console.warn("THREE.GLTFExporter: Light direction may be lost. For best results, make light.target a child of the light with position 0,0,-1."),r[this.name]||(i.extensions=i.extensions||{},i.extensions[this.name]={lights:[]},r[this.name]=!0);const o=i.extensions[this.name].lights;o.push(a),t.extensions=t.extensions||{},t.extensions[this.name]={light:o.length-1}}}class Vb{constructor(e){this.writer=e,this.name="KHR_materials_unlit"}writeMaterial(e,t){if(!e.isMeshBasicMaterial)return;const n=this.writer.extensionsUsed;t.extensions=t.extensions||{},t.extensions[this.name]={},n[this.name]=!0,t.pbrMetallicRoughness.metallicFactor=0,t.pbrMetallicRoughness.roughnessFactor=.9}}class Gb{constructor(e){this.writer=e,this.name="KHR_materials_pbrSpecularGlossiness"}writeMaterial(e,t){if(!e.isGLTFSpecularGlossinessMaterial)return;const n=this.writer,i=n.extensionsUsed,r={};t.pbrMetallicRoughness.baseColorFactor&&(r.diffuseFactor=t.pbrMetallicRoughness.baseColorFactor);const a=[1,1,1];if(e.specular.toArray(a,0),r.specularFactor=a,r.glossinessFactor=e.glossiness,t.pbrMetallicRoughness.baseColorTexture&&(r.diffuseTexture=t.pbrMetallicRoughness.baseColorTexture),e.specularMap){const o={index:n.processTexture(e.specularMap)};n.applyTextureTransform(o,e.specularMap),r.specularGlossinessTexture=o}t.extensions=t.extensions||{},t.extensions[this.name]=r,i[this.name]=!0}}class Wb{constructor(e){this.writer=e,this.name="KHR_materials_clearcoat"}writeMaterial(e,t){if(!e.isMeshPhysicalMaterial)return;const n=this.writer,i=n.extensionsUsed,r={};if(r.clearcoatFactor=e.clearcoat,e.clearcoatMap){const a={index:n.processTexture(e.clearcoatMap)};n.applyTextureTransform(a,e.clearcoatMap),r.clearcoatTexture=a}if(r.clearcoatRoughnessFactor=e.clearcoatRoughness,e.clearcoatRoughnessMap){const a={index:n.processTexture(e.clearcoatRoughnessMap)};n.applyTextureTransform(a,e.clearcoatRoughnessMap),r.clearcoatRoughnessTexture=a}if(e.clearcoatNormalMap){const a={index:n.processTexture(e.clearcoatNormalMap)};n.applyTextureTransform(a,e.clearcoatNormalMap),r.clearcoatNormalTexture=a}t.extensions=t.extensions||{},t.extensions[this.name]=r,i[this.name]=!0}}class jb{constructor(e){this.writer=e,this.name="KHR_materials_transmission"}writeMaterial(e,t){if(!e.isMeshPhysicalMaterial||e.transmission===0)return;const n=this.writer,i=n.extensionsUsed,r={};if(r.transmissionFactor=e.transmission,e.transmissionMap){const a={index:n.processTexture(e.transmissionMap)};n.applyTextureTransform(a,e.transmissionMap),r.transmissionTexture=a}t.extensions=t.extensions||{},t.extensions[this.name]=r,i[this.name]=!0}}class qb{constructor(e){this.writer=e,this.name="KHR_materials_volume"}writeMaterial(e,t){if(!e.isMeshPhysicalMaterial||e.transmission===0)return;const n=this.writer,i=n.extensionsUsed,r={};if(r.thicknessFactor=e.thickness,e.thicknessMap){const a={index:n.processTexture(e.thicknessMap)};n.applyTextureTransform(a,e.thicknessMap),r.thicknessTexture=a}r.attenuationDistance=e.attenuationDistance,r.attenuationColor=e.attenuationColor.toArray(),t.extensions=t.extensions||{},t.extensions[this.name]=r,i[this.name]=!0}}yh.Utils={insertKeyframe:function(s,e){const n=s.getValueSize(),i=new s.TimeBufferType(s.times.length+1),r=new s.ValueBufferType(s.values.length+n),a=s.createInterpolant(new s.ValueBufferType(n));let o;if(s.times.length===0){i[0]=e;for(let l=0;l<n;l++)r[l]=0;o=0}else if(e<s.times[0]){if(Math.abs(s.times[0]-e)<.001)return 0;i[0]=e,i.set(s.times,1),r.set(a.evaluate(e),0),r.set(s.values,n),o=0}else if(e>s.times[s.times.length-1]){if(Math.abs(s.times[s.times.length-1]-e)<.001)return s.times.length-1;i[i.length-1]=e,i.set(s.times,0),r.set(s.values,0),r.set(a.evaluate(e),s.values.length),o=i.length-1}else for(let l=0;l<s.times.length;l++){if(Math.abs(s.times[l]-e)<.001)return l;if(s.times[l]<e&&s.times[l+1]>e){i.set(s.times.slice(0,l+1),0),i[l+1]=e,i.set(s.times.slice(l+1),l+2),r.set(s.values.slice(0,(l+1)*n),0),r.set(a.evaluate(e),(l+1)*n),r.set(s.values.slice((l+1)*n),(l+2)*n),o=l+1;break}}return s.times=i,s.values=r,o},mergeMorphTargetTracks:function(s,e){const t=[],n={},i=s.tracks;for(let r=0;r<i.length;++r){let a=i[r];const o=Te.parseTrackName(a.name),l=Te.findNode(e,o.nodeName);if(o.propertyName!=="morphTargetInfluences"||o.propertyIndex===void 0){t.push(a);continue}if(a.createInterpolant!==a.InterpolantFactoryMethodDiscrete&&a.createInterpolant!==a.InterpolantFactoryMethodLinear){if(a.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline)throw new Error("THREE.GLTFExporter: Cannot merge tracks with glTF CUBICSPLINE interpolation.");console.warn("THREE.GLTFExporter: Morph target interpolation mode not yet supported. Using LINEAR instead."),a=a.clone(),a.setInterpolation(2301)}const c=l.morphTargetInfluences.length,h=l.morphTargetDictionary[o.propertyIndex];if(h===void 0)throw new Error("THREE.GLTFExporter: Morph target name not found: "+o.propertyIndex);let u;if(n[l.uuid]===void 0){u=a.clone();const p=new u.ValueBufferType(c*u.times.length);for(let m=0;m<u.times.length;m++)p[m*c+h]=u.values[m];u.name=(o.nodeName||"")+".morphTargetInfluences",u.values=p,n[l.uuid]=u,t.push(u);continue}const d=a.createInterpolant(new a.ValueBufferType(1));u=n[l.uuid];for(let p=0;p<u.times.length;p++)u.values[p*c+h]=d.evaluate(u.times[p]);for(let p=0;p<a.times.length;p++){const m=this.insertKeyframe(u,a.times[p]);u.values[m*c+h]=a.values[p]}}return s.tracks=t,s}};/* @license
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
 */const Bp=s=>s.material!==void 0&&s.userData&&s.userData.variantMaterials&&!!Array.from(s.userData.variantMaterials.values()).filter(e=>Ha(e.material)),Ha=s=>s&&s.isMaterial&&!Array.isArray(s);class Xb{constructor(e){this.writer=e,this.name="KHR_materials_variants",this.variantNames=[]}beforeParse(e){const t=new Set;for(const n of e)n.traverse(i=>{if(!Bp(i))return;const r=i.userData.variantMaterials,a=i.userData.variantData;for(const[o,l]of a){const c=r.get(l.index);Ha(c.material)&&t.add(o)}});t.forEach(n=>this.variantNames.push(n))}writeMesh(e,t){if(!Bp(e))return;const n=e.userData,i=n.variantMaterials,r=n.variantData,a=new Map,o=new Map,l=Array.from(r.values()).sort((u,d)=>u.index-d.index);for(const[u,d]of l.entries())o.set(d.index,u);for(const u of r.values()){const d=i.get(u.index).material;if(!Ha(d))continue;const p=this.writer.processMaterial(d);a.has(p)||a.set(p,{material:p,variants:[]}),a.get(p).variants.push(o.get(u.index))}const c=Array.from(a.values()).map(u=>u.variants.sort((d,p)=>d-p)&&u).sort((u,d)=>u.material-d.material);if(c.length===0)return;const h=Ha(n.originalMaterial)?this.writer.processMaterial(n.originalMaterial):-1;for(const u of t.primitives)h>=0&&(u.material=h),u.extensions=u.extensions||{},u.extensions[this.name]={mappings:c}}afterParse(){if(this.variantNames.length===0)return;const e=this.writer.json;e.extensions=e.extensions||{};const t=this.variantNames.map(n=>({name:n}));e.extensions[this.name]={variants:t},this.writer.extensionsUsed[this.name]=!0}}/* @license
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
 */const Ye=Symbol("correlatedObjects"),Ie=Symbol("sourceObject"),Wt=Symbol("onUpdate");class Ns{constructor(e,t,n=null){this[Wt]=e,this[Ie]=t,this[Ye]=n}}/* @license
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
 */const Yb=new ph,Hp=new jt,Zb=new Ti(2,2);let Jb=0;const Va=Symbol("threeTexture");class $b extends Ns{get[Va](){var e;return console.assert(this[Ye]!=null&&this[Ye].size>0,"Image correlated object is undefined"),(e=this[Ye])===null||e===void 0?void 0:e.values().next().value}constructor(e,t,n){super(e,n=n??{name:"adhoc_image",uri:t&&t.image&&t.image.src?t.image.src:"adhoc_image"+Jb++},new Set(t?[t]:[]))}get name(){return this[Ie].name||""}get uri(){return this[Ie].uri}get bufferView(){return this[Ie].bufferView}get type(){return this.uri!=null?"external":"embedded"}async setURI(e){this[Ie].uri=e;const t=await new Promise((i,r)=>{Yb.load(e,i,void 0,r)}),n=this[Va];n.image=t,n.needsUpdate=!0,this[Wt]()}async createThumbnail(e,t){const n=new an;Hp.map=this[Va];const i=new me(Zb,Hp);n.add(i);const r=new fr(-1,1,1,-1,0,1),{threeRenderer:a}=Cn.singleton,o=new wt(e,t);a.setRenderTarget(o),a.render(n,r),a.setRenderTarget(null);const l=new Uint8Array(e*t*4);a.readRenderTargetPixels(o,0,0,e,t,l),Ct.width=e,Ct.height=t;const c=Ct.getContext("2d"),h=c.createImageData(e,t);return h.data.set(l),c.putImageData(h,0,0),new Promise(async(u,d)=>{Ct.toBlob(p=>{if(!p)return d("Failed to capture thumbnail.");u(URL.createObjectURL(p))},"image/png")})}}var Pt,_i;(function(s){s[s.Nearest=9728]="Nearest",s[s.Linear=9729]="Linear",s[s.NearestMipmapNearest=9984]="NearestMipmapNearest",s[s.LinearMipmapNearest=9985]="LinearMipmapNearest",s[s.NearestMipmapLinear=9986]="NearestMipmapLinear",s[s.LinearMipmapLinear=9987]="LinearMipmapLinear"})(Pt||(Pt={})),function(s){s[s.ClampToEdge=33071]="ClampToEdge",s[s.MirroredRepeat=33648]="MirroredRepeat",s[s.Repeat=10497]="Repeat"}(_i||(_i={}));/* @license
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
 */const Kb=(()=>{const s=[Pt.Nearest,Pt.Linear,Pt.NearestMipmapNearest,Pt.LinearMipmapLinear,Pt.NearestMipmapLinear,Pt.LinearMipmapLinear];return e=>s.indexOf(e)>-1})(),Qb=(()=>{const s=[Pt.Nearest,Pt.Linear];return e=>s.indexOf(e)>-1})(),e1=(()=>{const s=[_i.ClampToEdge,_i.MirroredRepeat,_i.Repeat];return e=>s.indexOf(e)>-1})(),Vp=Symbol("threeTextures"),os=Symbol("setProperty"),Ji=Symbol("sourceSampler");class t1 extends Ns{get[Vp](){return console.assert(this[Ye]!=null&&this[Ye].size>0,"Sampler correlated object is undefined"),this[Ye]}get[Ji](){return console.assert(this[Ie]!=null,"Sampler source is undefined"),this[Ie]}constructor(e,t,n){(n=n??{}).minFilter==null&&(n.minFilter=t?t.minFilter:Pt.LinearMipmapLinear),n.magFilter==null&&(n.magFilter=t?t.magFilter:Pt.Linear),n.wrapS==null&&(n.wrapS=t?t.wrapS:_i.Repeat),n.wrapT==null&&(n.wrapT=t?t.wrapT:_i.Repeat),super(e,n,new Set(t?[t]:[]))}get name(){return this[Ie].name||""}get minFilter(){return this[Ji].minFilter}get magFilter(){return this[Ji].magFilter}get wrapS(){return this[Ji].wrapS}get wrapT(){return this[Ji].wrapT}setMinFilter(e){this[os]("minFilter",e)}setMagFilter(e){this[os]("magFilter",e)}setWrapS(e){this[os]("wrapS",e)}setWrapT(e){this[os]("wrapT",e)}[os](e,t){const n=this[Ji];if(n!=null){if(((i,r)=>{switch(i){case"minFilter":return Kb(r);case"magFilter":return Qb(r);case"wrapS":case"wrapT":return e1(r);default:throw new Error(`Cannot configure property "${i}" on Sampler`)}})(e,t)){n[e]=t;for(const i of this[Vp])i[e]=t,i.needsUpdate=!0}this[Wt]()}}}/* @license
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
 */const Gp=Symbol("image"),Wp=Symbol("sampler");class sg extends Ns{constructor(e,t,n=null,i=null,r=null){super(e,n||{},new Set(t?[t]:[])),this[Wp]=new t1(e,t,i),this[Gp]=new $b(e,t,r)}get name(){return this[Ie].name||""}get sampler(){return this[Wp]}get source(){return this[Gp]}}/* @license
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
 */var ag;const Ga=Symbol("texture"),tc=Symbol("materials"),jp=Symbol("usage");var It;(function(s){s[s.Base=0]="Base",s[s.MetallicRoughness=1]="MetallicRoughness",s[s.Normal=2]="Normal",s[s.Occlusion=3]="Occlusion",s[s.Emissive=4]="Emissive"})(It||(It={}));class bs{constructor(e,t,n,i,r,a){if(this[ag]=null,a){const o=r.textures?r.textures[a.index]:null,l=o&&r.samplers?r.samplers[o.sampler]:null,c=o&&r.images?r.images[o.source]:null;this[Ga]=new sg(e,n,o,l,c)}this.onUpdate=e,this[tc]=i,this[jp]=t}get texture(){return this[Ga]}setTexture(e){const t=e!=null?e.source[Va]:null;let n=3001;if(this[Ga]=e,this[tc])for(const i of this[tc]){switch(this[jp]){case It.Base:i.map=t;break;case It.MetallicRoughness:n=3e3,i.metalnessMap=t,i.roughnessMap=t;break;case It.Normal:n=3e3,i.normalMap=t;break;case It.Occlusion:n=3e3,i.aoMap=t;break;case It.Emissive:i.emissiveMap=t}i.needsUpdate=!0}t&&(t.encoding=n),this.onUpdate()}}ag=Ga;/* @license
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
 */const Na=Symbol("threeMaterials"),qp=Symbol("baseColorTexture"),Xp=Symbol("metallicRoughnessTexture");class n1 extends Ns{constructor(e,t,n,i){super(e,n,i),n.baseColorFactor==null&&(n.baseColorFactor=[1,1,1,1]),n.roughnessFactor==null&&(n.roughnessFactor=1),n.metallicFactor==null&&(n.metallicFactor=1);const{baseColorTexture:r,metallicRoughnessTexture:a}=n,{map:o,metalnessMap:l}=i.values().next().value;this[qp]=new bs(e,It.Base,o,i,t,r||null),this[Xp]=new bs(e,It.MetallicRoughness,l,i,t,a||null)}get[Na](){return this[Ye]}get baseColorFactor(){return this[Ie].baseColorFactor}get metallicFactor(){return this[Ie].metallicFactor}get roughnessFactor(){return this[Ie].roughnessFactor}get baseColorTexture(){return this[qp]}get metallicRoughnessTexture(){return this[Xp]}setBaseColorFactor(e){for(const t of this[Na])t.color.fromArray(e),t.opacity=e[3];this[Ie].baseColorFactor=e,this[Wt]()}setMetallicFactor(e){for(const t of this[Na])t.metalness=e;this[Ie].metallicFactor=e,this[Wt]()}setRoughnessFactor(e){for(const t of this[Na])t.roughness=e;this[Ie].roughnessFactor=e,this[Wt]()}}/* @license
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
 */var Yp;const Zp=Symbol("pbrMetallicRoughness"),Jp=Symbol("normalTexture"),$p=Symbol("occlusionTexture"),Kp=Symbol("emissiveTexture"),i1=Symbol("backingThreeMaterial"),nc=Symbol("applyAlphaCutoff"),ui=Symbol("lazyLoadGLTFInfo"),ic=Symbol("initialize"),qc=Symbol("getLoadedMaterial"),bt=Symbol("ensureMaterialIsLoaded"),Qp=Symbol("gltfIndex"),us=Symbol("setActive"),Wa=Symbol("variantIndices"),rc=Symbol("isActive"),ja=Symbol("variantSet"),em=Symbol("modelVariants");class sc extends Ns{constructor(e,t,n,i,r,a,o,l){super(e,n,o),this[Yp]=new Set,this[Qp]=i,this[rc]=r,this[em]=a,l==null?this[ic](t):this[ui]=l}get[(Yp=ja,i1)](){return this[Ye].values().next().value}[ic](e){const t=this[Wt],n=this[Ie],i=this[Ye];n.extensions&&n.extensions.KHR_materials_pbrSpecularGlossiness&&console.warn(`Material ${n.name} uses a deprecated extension
          "KHR_materials_pbrSpecularGlossiness", please use
          "pbrMetallicRoughness" instead. Specular Glossiness materials are
          currently supported for rendering, but not for our scene-graph API,
          nor for auto-generation of USDZ for Quick Look.`),n.pbrMetallicRoughness==null&&(n.pbrMetallicRoughness={}),this[Zp]=new n1(t,e,n.pbrMetallicRoughness,i),n.emissiveFactor==null&&(n.emissiveFactor=[0,0,0]),n.doubleSided==null&&(n.doubleSided=!1),n.alphaMode==null&&(n.alphaMode="OPAQUE"),n.alphaCutoff==null&&(n.alphaCutoff=.5);const{normalTexture:r,occlusionTexture:a,emissiveTexture:o}=n,{normalMap:l,aoMap:c,emissiveMap:h}=i.values().next().value;this[Jp]=new bs(t,It.Normal,l,i,e,r||null),this[$p]=new bs(t,It.Occlusion,c,i,e,a||null),this[Kp]=new bs(t,It.Emissive,h,i,e,o||null)}async[qc](){if(this[ui]!=null){const{set:e,material:t}=await this[ui].doLazyLoad();return this[Ye]=e,this[ic](this[ui].gltf),this[ui]=void 0,this.ensureLoaded=async()=>{},t}return this[Ye].values().next().value}[bt](){if(this[ui]!=null)throw new Error(`Material "${this.name}" has not been loaded, call 'await
    myMaterial.ensureLoaded()' before using an unloaded material.`)}async ensureLoaded(){await this[qc]()}get isLoaded(){return this[ui]==null}get isActive(){return this[rc]}[us](e){this[rc]=e}get name(){return this[Ie].name}set name(e){const t=this[Ie];if(t!=null&&(t.name=e),this[Ye]!=null)for(const n of this[Ye])n.name=e}get pbrMetallicRoughness(){return this[bt](),this[Zp]}get normalTexture(){return this[bt](),this[Jp]}get occlusionTexture(){return this[bt](),this[$p]}get emissiveTexture(){return this[bt](),this[Kp]}get emissiveFactor(){return this[bt](),this[Ie].emissiveFactor}get index(){return this[Qp]}[Wa](){return this[ja]}hasVariant(e){const t=this[em].get(e);return t!=null&&this[ja].has(t.index)}setEmissiveFactor(e){this[bt]();for(const t of this[Ye])t.emissive.fromArray(e);this[Ie].emissiveFactor=e,this[Wt]()}[nc](){this[bt]();const e=this[Ie];for(const t of this[Ye])this[Ie].alphaMode==="MASK"?t.alphaTest=e.alphaCutoff:t.alphaTest=void 0,t.needsUpdate=!0}setAlphaCutoff(e){this[bt](),this[Ie].alphaCutoff=e,this[nc](),this[Wt]()}getAlphaCutoff(){return this[bt](),this[Ie].alphaCutoff}setDoubleSided(e){this[bt]();for(const t of this[Ye])t.side=e?2:0,t.needsUpdate=!0;this[Ie].doubleSided=e,this[Wt]()}getDoubleSided(){return this[bt](),this[Ie].doubleSided}setAlphaMode(e){this[bt]();const t=(n,i)=>{n.transparent=i,n.depthWrite=!i};this[Ie].alphaMode=e;for(const n of this[Ye])t(n,e!=="OPAQUE"),this[nc](),n.needsUpdate=!0;this[Wt]()}getAlphaMode(){return this[bt](),this[Ie].alphaMode}}var og,lg,cg;const jn=Symbol("materials"),Sn=Symbol("variantToMaterialMap"),_n=Symbol("modelVariants"),tm=Symbol("mesh"),hg=Symbol("children"),nm=Symbol("initialMaterialIdx"),ac=Symbol("activeMaterialIdx");class ug{constructor(e){this.name="",this[og]=new Array,this.name=e}}og=hg;class im extends ug{constructor(e,t,n,i){super(e.name),this[lg]=new Map,this[cg]=new Map,this[tm]=e;const{gltf:r,threeGLTF:a,threeObjectMap:o}=i;this[_n]=n,this.mesh.userData.variantData=n;const l=o.get(e.material);l.materials!=null?this[nm]=this[ac]=l.materials:console.error(`Primitive (${e.name}) missing initial material reference.`);const c=e.userData.associations||{};if(c.meshes==null)return void console.error("Mesh is missing primitive index association");const h=((r.meshes||[])[c.meshes].primitives||[])[c.primitives];if(h!=null){if(h.material!=null)this[jn].set(h.material,t[h.material]);else{const u=t.findIndex(d=>d.name==="Default");u>=0?this[jn].set(u,t[u]):console.warn("gltfPrimitive has no material!")}if(h.extensions&&h.extensions.KHR_materials_variants){const u=h.extensions.KHR_materials_variants,d=a.parser.json.extensions.KHR_materials_variants.variants;for(const p of u.mappings){const m=t[p.material];this[jn].set(p.material,m);for(const f of p.variants){const{name:g}=d[f];this[Sn].set(f,m),m[Wa]().add(f),n.has(g)||n.set(g,{name:g,index:f})}}}}else console.error("Mesh primitive definition is missing.")}get mesh(){return this[tm]}async setActiveMaterial(e){const t=this[jn].get(e);return t!=null&&(this.mesh.material=await t[qc](),this[ac]=e),this.mesh.material}getActiveMaterial(){return this[jn].get(this[ac])}getMaterial(e){return this[jn].get(e)}async enableVariant(e){if(e==null)return this.setActiveMaterial(this[nm]);if(this[Sn]!=null&&this[_n].has(e)){const t=this[_n].get(e);return this.enableVariantHelper(t.index)}return null}async enableVariantHelper(e){if(this[Sn]!=null&&e!=null){const t=this[Sn].get(e);if(t!=null)return this.setActiveMaterial(t.index)}return null}async instantiateVariants(){if(this[Sn]!=null)for(const e of this[Sn].keys()){if(this.mesh.userData.variantMaterials.get(e).material!=null)continue;const t=await this.enableVariantHelper(e);t!=null&&(this.mesh.userData.variantMaterials.get(e).material=t)}}get variantInfo(){return this[Sn]}addVariant(e,t){if(!this.ensureVariantIsUnused(t))return!1;this[_n].has(t)||this[_n].set(t,{name:t,index:this[_n].size});const n=this[_n].get(t).index;return e[Wa]().add(n),this[Sn].set(n,e),this[jn].set(e.index,e),this.updateVariantUserData(n,e),!0}deleteVariant(e){if(this.variantInfo.has(e)){this.variantInfo.delete(e);const t=this.mesh.userData.variantMaterials;t!=null&&t.delete(e)}}updateVariantUserData(e,t){t[Wa]().add(e),this.mesh.userData.variantData=this[_n],this.mesh.userData.variantMaterials=this.mesh.userData.variantMaterials||new Map,this.mesh.userData.variantMaterials.set(e,{material:t[Ye].values().next().value,gltfMaterialIndex:t.index})}ensureVariantIsUnused(e){const t=this[_n].get(e);return t==null||!this.variantInfo.has(t.index)||(console.warn(`Primitive cannot add variant '${e}' for this material, it already exists.`),!1)}}/* @license
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
 */var rm,sm,am,om,lm,cm;lg=jn,cg=Sn;const di=Symbol("materials"),oc=Symbol("hierarchy"),hm=Symbol("roots"),Mn=Symbol("primitives"),lc=Symbol("correlatedSceneGraph"),dg=Symbol("prepareVariantsForExport"),pg=Symbol("switchVariant"),um=Symbol("threeScene"),dm=Symbol("materialsFromPoint"),mg=Symbol("materialFromPoint"),ct=Symbol("variantData"),Xc=Symbol("availableVariants"),cc=Symbol("modelOnUpdate"),pm=Symbol("cloneMaterial");class r1{constructor(e,t,n,i){this.gltf=e,this.gltfElementMap=t,this.mapKey=n,this.doLazyLoad=i}}class s1{constructor(e,t=()=>{}){this[rm]=new Array,this[sm]=new Array,this[am]=new Array,this[om]=new Array,this[lm]=()=>{},this[cm]=new Map,this[cc]=t,this[lc]=e;const{gltf:n,threeGLTF:i,gltfElementMap:r}=e;this[um]=i.scene;for(const[l,c]of n.materials.entries()){const h=r.get(c);if(h!=null)this[di].push(new sc(t,n,c,l,!0,this[ct],h));else{const u=(n.materials||[])[l],d=l,p=async()=>{const m=await i.parser.getDependency("material",d),f=new Set;return r.set(u,f),f.add(m),{set:f,material:m}};this[di].push(new sc(t,n,u,l,!1,this[ct],h,new r1(n,r,u,p)))}}const a=new Map,o=new Array;for(const l of i.scene.children)o.push(l);for(;o.length>0;){const l=o.pop();let c=null;l instanceof me?(c=new im(l,this.materials,this[ct],e),this[Mn].push(c)):c=new ug(l.name);const h=a.get(l);h!=null?h[hg].push(c):this[hm].push(c),this[oc].push(c);for(const u of l.children)o.push(u),a.set(l,c)}}get materials(){return this[di]}[(rm=di,sm=oc,am=hm,om=Mn,lm=cc,cm=ct,Xc)](){const e=Array.from(this[ct].values());return e.sort((t,n)=>t.index-n.index),e.map(t=>t.name)}getMaterialByName(e){const t=this[di].filter(n=>n.name===e);return t.length>0?t[0]:null}[dm](e){return e.intersectObject(this[um],!0).map(t=>{const n=this[oc].find(i=>i instanceof im&&i.mesh===t.object);return n!=null?n.getActiveMaterial():null})}[mg](e){const t=this[dm](e);return t.length>0?t[0]:null}async[pg](e){for(const t of this[Mn])await t.enableVariant(e);for(const t of this.materials)t[us](!1);for(const t of this[Mn])this.materials[t.getActiveMaterial().index][us](!0)}async[dg](){const e=new Array;for(const t of this[Mn])e.push(t.instantiateVariants());await Promise.all(e)}[pm](e,t){const n=this.materials[e];n.isLoaded||console.error(`Cloning an unloaded material,
           call 'material.ensureLoaded() before cloning the material.`);const i=n[Ye],r=JSON.parse(JSON.stringify(n[Ie]));r.name=t,this[lc].gltf.materials.push(r);const a=new Set;for(const[l,c]of i.entries()){const h=c.clone();h.name=t+(i.size>1?"_inst"+l:""),a.add(h)}const o=new sc(this[cc],this[lc].gltf,r,this[di].length,!1,this[ct],a);return this[di].push(o),o}createMaterialInstanceForVariant(e,t,n,i=!0){let r=null;for(const a of this[Mn]){const o=this[ct].get(n);o!=null&&a.variantInfo.has(o.index)||a.getMaterial(e)!=null&&(this.hasVariant(n)||this.createVariant(n),r==null&&(r=this[pm](e,t)),a.addVariant(r,n))}if(i&&r!=null){r[us](!0),this.materials[e][us](!1);for(const a of this[Mn])a.enableVariant(n)}return r}createVariant(e){this[ct].has(e)?console.warn(`Variant '${e}'' already exists`):this[ct].set(e,{name:e,index:this[ct].size})}hasVariant(e){return this[ct].has(e)}setMaterialToVariant(e,t){if(this[Xc]().find(n=>n===t)!=null)if(e<0||e>=this.materials.length)console.error("setMaterialToVariant(): materialIndex is out of bounds.");else for(const n of this[Mn]){const i=n.getMaterial(e);i!=null&&n.addVariant(i,t)}else console.warn(`Can't add material to '${t}', the variant does not exist.'`)}updateVariantName(e,t){const n=this[ct].get(e);n!=null&&(n.name=t,this[ct].set(t,n),this[ct].delete(e))}deleteVariant(e){const t=this[ct].get(e);if(t!=null){for(const n of this.materials)n.hasVariant(e)&&n[ja].delete(t.index);for(const n of this[Mn])n.deleteVariant(t.index);this[ct].delete(e)}}}/* @license
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
 */var hc=function(s,e,t,n){for(var i,r=arguments.length,a=r<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,t):n,o=s.length-1;o>=0;o--)(i=s[o])&&(a=(r<3?i(a):r>3?i(e,t,a):i(e,t))||a);return r>3&&a&&Object.defineProperty(e,t,a),a};const ls=Symbol("currentGLTF"),$i=Symbol("model"),uc=Symbol("getOnUpdateMethod"),mm=Symbol("textureLoader"),dc=Symbol("originalGltfJson");/* @license
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
 */var pc=function(s,e,t,n){for(var i,r=arguments.length,a=r<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,t):n,o=s.length-1;o>=0;o--)(i=s[o])&&(a=(r<3?i(a):r>3?i(e,t,a):i(e,t))||a);return r>3&&a&&Object.defineProperty(e,t,a),a};const a1=Math.PI/32,o1={basis:[Ds(ot(a1,"rad"))],keywords:{auto:[null]}},Ki=Symbol("autoRotateStartTime"),mc=Symbol("radiansPerSecond"),fm=Symbol("syncRotationRate"),fc=Symbol("onCameraChange"),l1=(s=>{var e,t,n;class i extends s{constructor(){super(...arguments),this[e]=new Map,this[t]=a=>{a.forEach(o=>{o instanceof MutationRecord&&o.type!=="childList"||(o.addedNodes.forEach(l=>{this[Tl](l)}),o.removedNodes.forEach(l=>{this[kd](l)}),this[dt]())})},this[n]=new MutationObserver(this[Sl])}connectedCallback(){super.connectedCallback();for(let o=0;o<this.children.length;++o)this[Tl](this.children[o]);const{ShadyDOM:a}=self;a==null?this[Wr].observe(this,{childList:!0}):this[Wr]=a.observeChildren(this,this[Sl])}disconnectedCallback(){super.disconnectedCallback();const{ShadyDOM:a}=self;a==null?this[Wr].disconnect():a.unobserveChildren(this[Wr])}[(e=Wi,t=Sl,n=Wr,Jt)](a,o){super[Jt](a,o);const l=this[ae],{annotationRenderer:c}=l,h=l.getCamera();l.shouldRender()&&(l.updateHotspots(h.position),c.domElement.style.display="",c.render(l,h))}updateHotspot(a){const o=this[Wi].get(a.name);o!=null&&(o.updatePosition(a.position),o.updateNormal(a.normal),this[dt]())}positionAndNormalFromPoint(a,o){const l=this[ae],c=l.getNDC(a,o),h=l.positionAndNormalFromPoint(c);if(h==null)return null;El.copy(l.target.matrixWorld).invert();const u=Sa(h.position.applyMatrix4(El));zd.getNormalMatrix(El);const d=Sa(h.normal.applyNormalMatrix(zd));let p=null;return h.uv!=null&&(p=Nx(h.uv)),{position:u,normal:d,uv:p}}[Tl](a){if(!(a instanceof HTMLElement&&a.slot.indexOf("hotspot")===0))return;let o=this[Wi].get(a.slot);o!=null?o.increment():(o=new If({name:a.slot,position:a.dataset.position,normal:a.dataset.normal}),this[Wi].set(a.slot,o),this[ae].addHotspot(o)),this[ae].queueRender()}[kd](a){if(!(a instanceof HTMLElement))return;const o=this[Wi].get(a.slot);o&&(o.decrement()&&(this[ae].removeHotspot(o),this[Wi].delete(a.slot)),this[ae].queueRender())}}return i})((s=>{var e,t,n,i;class r extends s{constructor(){super(...arguments),this[e]=void 0,this[t]=null,this[n]=new mo,this[i]=null,this.variantName=null,this.orientation="0 0 0",this.scale="1 1 1"}get model(){return this[$i]}get availableVariants(){return this.model?this.model[Xc]():[]}get originalGltfJson(){return this[dc]}[(e=$i,t=ls,n=mm,i=dc,uc)](){return()=>{this[dt]()}}async createTexture(o,l="image/png"){const c=this[ls],h=await new Promise(u=>this[mm].load(o,u));return c&&h?(h.encoding=3001,h.wrapS=1e3,h.wrapT=1e3,h.flipY=!1,l==="image/jpeg"&&(h.format=1022),new sg(this[uc](),h)):null}async updated(o){if(super.updated(o),o.has("variantName")){const l=this[ls],{variantName:c}=this;l!=null&&(await this[$i][pg](c),this[dt](),this.dispatchEvent(new CustomEvent("variant-applied")))}if(o.has("orientation")||o.has("scale")){const{modelContainer:l}=this[ae],c=Mi(this.orientation)[0].terms,h=sn(c[0]).number,u=sn(c[1]).number,d=sn(c[2]).number;l.quaternion.setFromEuler(new Zn(u,d,h,"YXZ"));const p=Mi(this.scale)[0].terms;l.scale.set(p[0].number,p[1].number,p[2].number),this[ae].updateBoundingBox(),this[ae].updateShadow(),this[Ce].arRenderer.onUpdateScene(),this[dt]()}}[$t](){super[$t]();const{currentGLTF:o}=this[ae];if(o!=null){const{correlatedSceneGraph:l}=o;l!=null&&o!==this[ls]&&(this[$i]=new s1(l,this[uc]()),this[dc]=JSON.parse(JSON.stringify(l.gltf))),"variants"in o.userData&&this.requestUpdate("variantName")}this[ls]=o,this.dispatchEvent(new CustomEvent("scene-graph-ready"))}async exportScene(o){const l=this[ae];return new Promise(async c=>{const h={binary:!0,onlyVisible:!0,maxTextureSize:1/0,forcePowerOfTwoTextures:!1,includeCustomExtensions:!1,embedImages:!0};Object.assign(h,o),h.animations=l.animations,h.truncateDrawRange=!0;const u=l.shadow;let d=!1;u!=null&&(d=u.visible,u.visible=!1),await this[$i][dg](),new yh().register(p=>new Xb(p)).parse(l.modelContainer.children[0],p=>c(new Blob([h.binary?p:JSON.stringify(p)],{type:h.binary?"application/octet-stream":"application/json"})),h),u!=null&&(u.visible=d)})}materialFromPoint(o,l){const c=this[ae],h=c.getNDC(o,l);return c.raycaster.setFromCamera(h,c.getCamera()),this[$i][mg](c.raycaster)}}return hc([ye({type:String,attribute:"variant-name"})],r.prototype,"variantName",void 0),hc([ye({type:String,attribute:"orientation"})],r.prototype,"orientation",void 0),hc([ye({type:String,attribute:"scale"})],r.prototype,"scale",void 0),r})((s=>{var e,t,n;class i extends s{constructor(){super(...arguments),this.autoRotate=!1,this.autoRotateDelay=3e3,this.rotationPerSecond="auto",this[e]=performance.now(),this[t]=0,this[n]=a=>{this.autoRotate&&a.detail.source==="user-interaction"&&(this[Ki]=performance.now())}}connectedCallback(){super.connectedCallback(),this.addEventListener("camera-change",this[fc]),this[Ki]=performance.now()}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("camera-change",this[fc]),this[Ki]=performance.now()}updated(a){super.updated(a),a.has("autoRotate")&&(this[Ki]=performance.now())}[(e=Ki,t=mc,fm)](a){this[mc]=a[0]}[Jt](a,o){if(super[Jt](a,o),!this.autoRotate||!this[rr]()||this[Ce].isPresenting)return;const l=Math.min(o,a-this[Ki]-this.autoRotateDelay);l>0&&(this[ae].yaw=this.turntableRotation+this[mc]*l*.001)}get turntableRotation(){return this[ae].yaw}resetTurntableRotation(a=0){this[ae].yaw=a}}return n=fc,pc([ye({type:Boolean,attribute:"auto-rotate"})],i.prototype,"autoRotate",void 0),pc([ye({type:Number,attribute:"auto-rotate-delay"})],i.prototype,"autoRotateDelay",void 0),pc([Wn({intrinsics:o1,updateHandler:fm}),ye({type:String,attribute:"rotation-per-second"})],i.prototype,"rotationPerSecond",void 0),i})((s=>{var e,t,n;class i extends s{constructor(){super(...arguments),this.environmentImage=null,this.skyboxImage=null,this.shadowIntensity=0,this.shadowSoftness=1,this.exposure=1,this[e]=null,this[t]=null,this[n]=a=>{a.element===this&&this[Oa]()}}connectedCallback(){super.connectedCallback(),this[Ce].loader.addEventListener("preload",this[yl])}disconnectedCallback(){super.disconnectedCallback(),this[Ce].loader.removeEventListener("preload",this[yl])}updated(a){super.updated(a),a.has("shadowIntensity")&&(this[ae].setShadowIntensity(.1*this.shadowIntensity),this[dt]()),a.has("shadowSoftness")&&(this[ae].setShadowSoftness(this.shadowSoftness),this[dt]()),a.has("exposure")&&(this[ae].exposure=this.exposure,this[dt]()),(a.has("environmentImage")||a.has("skyboxImage"))&&this[yi]()&&this[Oa]()}[(e=Br,t=Hr,n=yl,$t)](){super[$t](),this[Br]!=null&&this[ya](this[Br])}async[Oa](){const{skyboxImage:a,environmentImage:o}=this;this[Hr]!=null&&(this[Hr](),this[Hr]=null);const{textureUtils:l}=this[Ce];if(l!=null)try{const{environmentMap:c,skybox:h}=await new Promise(async(u,d)=>{const p=l.generateEnvironmentMapAndSkybox(Rf(a),o,{progressTracker:this[lr]});this[Hr]=()=>d(p),u(await p)});this[ae].background=h!=null?h.name===c.name?c:h:null,this[ya](c),this[ae].dispatchEvent({type:"envmap-update"})}catch(c){if(c instanceof Error)throw this[ya](null),c}}[ya](a){this[ae].environment!==a&&(this[Br]=a,this[ae].environment=this[Br],this.dispatchEvent(new CustomEvent("environment-change")),this[dt]())}}return zr([ye({type:String,attribute:"environment-image"})],i.prototype,"environmentImage",void 0),zr([ye({type:String,attribute:"skybox-image"})],i.prototype,"skyboxImage",void 0),zr([ye({type:Number,attribute:"shadow-intensity"})],i.prototype,"shadowIntensity",void 0),zr([ye({type:Number,attribute:"shadow-softness"})],i.prototype,"shadowSoftness",void 0),zr([ye({type:Number})],i.prototype,"exposure",void 0),i})((s=>{var e,t,n,i,r,a,o,l,c,h,u,d,p,m,f,g;class x extends s{constructor(){super(...arguments),this.cameraControls=!1,this.cameraOrbit="0deg 75deg 105%",this.cameraTarget="auto auto auto",this.fieldOfView="auto",this.minCameraOrbit="auto",this.maxCameraOrbit="auto",this.minFieldOfView="auto",this.maxFieldOfView="auto",this.interactionPromptThreshold=3e3,this.interactionPromptStyle=Bl,this.interactionPrompt=Yr,this.interactionPolicy=fb,this.orbitSensitivity=1,this.touchAction=gb,this.disableZoom=!1,this.interpolationDecay=50,this.bounds="legacy",this[e]=this.shadowRoot.querySelector(".interaction-prompt"),this[t]=this.shadowRoot.querySelector(".interaction-prompt > .animated-container"),this[n]=1/0,this[i]=0,this[r]=1/0,this[a]=!1,this[o]=!1,this[l]=new cb(this[ae].camera,this[Qt]),this[c]=new Fa,this[h]=!1,this[u]=!1,this[d]=!1,this[p]=()=>{const y=this[Qt];isFinite(this[Qr])||(this[Qr]=performance.now());const b=this[kc];y.getAttribute("aria-label")!==b&&y.setAttribute("aria-label",b),this.interactionPrompt!==vp||this[$r]||(this[bn]=!0)},this[m]=()=>{this.interactionPrompt===vp&&(this[bn]=!1,this[Zr].classList.remove("visible"),this[ci]=1/0,this[Qr]=1/0)},this[f]=({source:y})=>{this[wp](),this[dt](),y===Wc&&(this[$r]=!0,this[Ca]()),this.dispatchEvent(new CustomEvent("camera-change",{detail:{source:y}}))},this[g]=y=>{y.type==="pointer-change-start"?this[ys].classList.add("pointer-tumbling"):this[ys].classList.remove("pointer-tumbling")}}getCameraOrbit(){const{theta:y,phi:b,radius:w}=this[Pa];return{theta:y,phi:b,radius:w,toString(){return`${this.theta}rad ${this.phi}rad ${this.radius}m`}}}getCameraTarget(){return Sa(this[Ce].isPresenting?this[Ce].arRenderer.target:this[ae].getTarget())}getFieldOfView(){return this[Be].getFieldOfView()}getMinimumFieldOfView(){return this[Be].options.minimumFieldOfView}getMaximumFieldOfView(){return this[Be].options.maximumFieldOfView}getIdealAspect(){return this[ae].idealAspect}jumpCameraToGoal(){this[es]=!0,this.requestUpdate(es,!1)}resetInteractionPrompt(){this[Kr]=0,this[ci]=1/0,this[$r]=!1,this[bn]=this.interactionPrompt===Yr&&this.cameraControls}zoom(y){const b=new WheelEvent("wheel",{deltaY:-30*y});this[Qt].dispatchEvent(b)}connectedCallback(){super.connectedCallback(),this[Be].addEventListener("change",this[Wl]),this[Be].addEventListener("pointer-change-start",this[Jr]),this[Be].addEventListener("pointer-change-end",this[Jr])}disconnectedCallback(){super.disconnectedCallback(),this[Be].removeEventListener("change",this[Wl]),this[Be].removeEventListener("pointer-change-start",this[Jr]),this[Be].removeEventListener("pointer-change-end",this[Jr])}updated(y){super.updated(y);const b=this[Be],w=this[Qt];if(y.has("cameraControls")&&(this.cameraControls?(b.enableInteraction(),this.interactionPrompt===Yr&&(this[bn]=!0),w.addEventListener("focus",this[Gl]),w.addEventListener("blur",this[Vl])):(w.removeEventListener("focus",this[Gl]),w.removeEventListener("blur",this[Vl]),b.disableInteraction(),this[Ca]())),y.has("disableZoom")&&(b.disableZoom=this.disableZoom),y.has("bounds")&&(this[ae].tightBounds=this.bounds==="tight"),(y.has("interactionPrompt")||y.has("cameraControls")||y.has("src"))&&(this.interactionPrompt===Yr&&this.cameraControls&&!this[$r]?this[bn]=!0:this[Ca]()),y.has("interactionPromptStyle")&&this[Zr].classList.toggle("wiggle",this.interactionPromptStyle===Bl),y.has("interactionPolicy")){const S=this.interactionPolicy;b.applyOptions({interactionPolicy:S})}if(y.has("touchAction")){const S=this.touchAction;b.applyOptions({touchAction:S}),b.updateTouchActionStyle()}y.has("orbitSensitivity")&&(b.sensitivity=this.orbitSensitivity),y.has("interpolationDecay")&&(b.setDamperDecayTime(this.interpolationDecay),this[ae].setTargetDamperDecayTime(this.interpolationDecay)),this[es]===!0&&Promise.resolve().then(()=>{b.jumpToGoal(),this[ae].jumpToGoal(),this[es]=!1})}async updateFraming(){const y=this[ae],b=y.adjustedFoV(y.framedFoVDeg);await y.updateFraming();const w=y.adjustedFoV(y.framedFoVDeg),S=this[Be].getFieldOfView()/b;this[Be].setFieldOfView(w*S),this[ts]=!0,this.requestUpdate("maxFieldOfView"),this.requestUpdate("fieldOfView"),this.requestUpdate("minCameraOrbit"),this.requestUpdate("maxCameraOrbit"),await this.requestUpdate("cameraOrbit")}[(e=Zr,t=Hl,n=Qr,i=Kr,r=ci,a=$r,o=bn,l=Be,c=Pa,h=es,u=jl,d=ts,Sp)](y){const b=this[ae];b.framedFoVDeg=180*y[0]/Math.PI,this[Be].setFieldOfView(b.adjustedFoV(b.framedFoVDeg))}[Mp](y){if(this[ts]){const{theta:b,phi:w}=this.getCameraOrbit();y[0]=b,y[1]=w,this[ts]=!1}this[Be].setOrbit(y[0],y[1],y[2])}[Ep](y){this[Be].applyOptions({minimumAzimuthalAngle:y[0],minimumPolarAngle:y[1],minimumRadius:y[2]}),this.jumpCameraToGoal()}[Ap](y){this[Be].applyOptions({maximumAzimuthalAngle:y[0],maximumPolarAngle:y[1],maximumRadius:y[2]}),this[_p](y[2]),this.jumpCameraToGoal()}[Rp](y){this[Be].applyOptions({minimumFieldOfView:180*y[0]/Math.PI}),this.jumpCameraToGoal()}[Lp](y){const b=this[ae].adjustedFoV(180*y[0]/Math.PI);this[Be].applyOptions({maximumFieldOfView:b}),this.jumpCameraToGoal()}[Tp](y){const[b,w,S]=y;this[ae].setTarget(b,w,S),this[Ce].arRenderer.updateTarget()}[Jt](y,b){if(super[Jt](y,b),this[Ce].isPresenting||!this[rr]())return;const w=performance.now();if(this[bn]){const S=this.interactionPrompt===Yr?this[cs]:this[Qr];this.loaded&&w>S+this.interactionPromptThreshold&&(this[Qt].setAttribute("aria-label","Use mouse, touch or arrow keys to control the camera!"),this[bn]=!1,this[ci]=w,this[Zr].classList.add("visible"))}if(isFinite(this[ci])&&this.interactionPromptStyle===Bl){const S=this[ae],M=(w-this[ci])/5e3%1,L=ub(M),I=db(M);if(this[Hl].style.opacity=`${I}`,L!==this[Kr]){const P=L*S.width*.05,N=(L-this[Kr])*Math.PI/16;this[Hl].style.transform=`translateX(${P}px)`,this[Be].adjustOrbit(N,0,0),this[Kr]=L}}this[Be].update(y,b),this[ae].updateTarget(b)}[Ca](){this[bn]=!1,this[Zr].classList.remove("visible"),this[ci]=1/0}[_p](y){const b=2*Math.max(this[ae].boundingRadius,y);this[Be].updateNearFar(0,b)}[wp](){const{theta:y,phi:b}=this[Pa],{theta:w,phi:S}=this[Be].getCameraSpherical(this[Pa]),M=this.getRootNode();if(M!=null&&M.activeElement===this){const L=(4+Math.floor((y%bp+xp)/jc))%4,I=(4+Math.floor((w%bp+xp)/jc))%4,P=Math.floor(b/yp),N=Math.floor(S/yp);if(I!==L||N!==P){const W=`View from stage ${mb[N]}${pb[I]}`;this[Qt].setAttribute("aria-label",W)}}}async[Is](y){const b=this[Be],w=this[ae],S=w.adjustedFoV(w.framedFoVDeg);super[Is](y);const M=w.adjustedFoV(w.framedFoVDeg),L=b.getFieldOfView()/S;b.updateAspect(this[ae].aspect),await this.requestUpdate("maxFieldOfView",this.maxFieldOfView),this[Be].setFieldOfView(M*L),this.jumpCameraToGoal()}[$t](){super[$t](),this[jl]?this[ts]=!0:this[jl]=!0,this.requestUpdate("maxFieldOfView",this.maxFieldOfView),this.requestUpdate("fieldOfView",this.fieldOfView),this.requestUpdate("minCameraOrbit",this.minCameraOrbit),this.requestUpdate("maxCameraOrbit",this.maxCameraOrbit),this.requestUpdate("cameraOrbit",this.cameraOrbit),this.requestUpdate("cameraTarget",this.cameraTarget),this.jumpCameraToGoal()}}return p=Gl,m=Vl,f=Wl,g=Jr,rt([ye({type:Boolean,attribute:"camera-controls"})],x.prototype,"cameraControls",void 0),rt([Wn({intrinsics:eg,observeEffects:!0,updateHandler:Mp}),ye({type:String,attribute:"camera-orbit",hasChanged:()=>!0})],x.prototype,"cameraOrbit",void 0),rt([Wn({intrinsics:_b,observeEffects:!0,updateHandler:Tp}),ye({type:String,attribute:"camera-target",hasChanged:()=>!0})],x.prototype,"cameraTarget",void 0),rt([Wn({intrinsics:vb,observeEffects:!0,updateHandler:Sp}),ye({type:String,attribute:"field-of-view",hasChanged:()=>!0})],x.prototype,"fieldOfView",void 0),rt([Wn({intrinsics:bb,updateHandler:Ep}),ye({type:String,attribute:"min-camera-orbit",hasChanged:()=>!0})],x.prototype,"minCameraOrbit",void 0),rt([Wn({intrinsics:wb,updateHandler:Ap}),ye({type:String,attribute:"max-camera-orbit",hasChanged:()=>!0})],x.prototype,"maxCameraOrbit",void 0),rt([Wn({intrinsics:yb,updateHandler:Rp}),ye({type:String,attribute:"min-field-of-view",hasChanged:()=>!0})],x.prototype,"minFieldOfView",void 0),rt([Wn({intrinsics:xb,updateHandler:Lp}),ye({type:String,attribute:"max-field-of-view",hasChanged:()=>!0})],x.prototype,"maxFieldOfView",void 0),rt([ye({type:Number,attribute:"interaction-prompt-threshold"})],x.prototype,"interactionPromptThreshold",void 0),rt([ye({type:String,attribute:"interaction-prompt-style"})],x.prototype,"interactionPromptStyle",void 0),rt([ye({type:String,attribute:"interaction-prompt"})],x.prototype,"interactionPrompt",void 0),rt([ye({type:String,attribute:"interaction-policy"})],x.prototype,"interactionPolicy",void 0),rt([ye({type:Number,attribute:"orbit-sensitivity"})],x.prototype,"orbitSensitivity",void 0),rt([ye({type:String,attribute:"touch-action"})],x.prototype,"touchAction",void 0),rt([ye({type:Boolean,attribute:"disable-zoom"})],x.prototype,"disableZoom",void 0),rt([ye({type:Number,attribute:"interpolation-decay"})],x.prototype,"interpolationDecay",void 0),rt([ye({type:String,attribute:"bounds"})],x.prototype,"bounds",void 0),x})((s=>{var e,t,n,i,r,a,o,l,c,h;class u extends s{constructor(){super(...arguments),this.ar=!1,this.arScale="auto",this.arPlacement="floor",this.arModes="webxr scene-viewer",this.iosSrc=null,this.xrEnvironment=!1,this[e]=!1,this[t]=this.shadowRoot.querySelector(".ar-button"),this[n]=document.createElement("a"),this[i]=new Set,this[r]=Ll,this[a]=!1,this[o]=p=>{p.preventDefault(),this.activateAR()},this[l]=({status:p})=>{p!==Ua&&this[Ce].arRenderer.presentedScene!==this[ae]||(this.setAttribute("ar-status",p),this.dispatchEvent(new CustomEvent("ar-status",{detail:{status:p}})),p===Ua?this.removeAttribute("ar-tracking"):p===Df&&this.setAttribute("ar-tracking",Nf))},this[c]=({status:p})=>{this.setAttribute("ar-tracking",p),this.dispatchEvent(new CustomEvent("ar-tracking",{detail:{status:p}}))},this[h]=p=>{p.data=="_apple_ar_quicklook_button_tapped"&&this.dispatchEvent(new CustomEvent("quick-look-button-tapped"))}}get canActivateAR(){return this[Gn]!==Ll}connectedCallback(){super.connectedCallback(),this[Ce].arRenderer.addEventListener("status",this[Pl]),this.setAttribute("ar-status",Ua),this[Ce].arRenderer.addEventListener("tracking",this[Il]),this[qi].addEventListener("message",this[Dl])}disconnectedCallback(){super.disconnectedCallback(),this[Ce].arRenderer.removeEventListener("status",this[Pl]),this[Ce].arRenderer.removeEventListener("tracking",this[Il]),this[qi].removeEventListener("message",this[Dl])}async update(p){super.update(p),p.has("arScale")&&(this[ae].canScale=this.arScale!=="fixed"),p.has("arPlacement")&&(this[ae].updateShadow(),this[dt]()),(p.has("ar")||p.has("arModes")||p.has("src")||p.has("iosSrc"))&&(p.has("arModes")&&(this[Cl]=Zx(this.arModes)),this[Xr]())}async activateAR(){switch(this[Gn]){case Rl:this[rp]();break;case tp:await this[np]();break;case ep:this[ip]();break;default:console.warn("No AR Mode can be activated. This is probably due to missing configuration or device capabilities")}}async[(e=Jx,t=xn,n=qi,i=Cl,r=Gn,a=Ea,o=Aa,l=Pl,c=Il,h=Dl,Xr)](){if(this[Gn]=Ll,this.ar){if(this.src!=null)for(const p of this[Cl]){if(p==="webxr"&&Mf&&!$d&&await this[Ce].arRenderer.supportsPresentation()){this[Gn]=tp;break}if(p==="scene-viewer"&&gy&&!Kd){this[Gn]=ep;break}if(p==="quick-look"&&Vu){this[Gn]=Rl;break}}!this.canActivateAR&&this.iosSrc!=null&&Vu&&(this[Gn]=Rl)}if(this.canActivateAR)this[xn].classList.add("enabled"),this[xn].addEventListener("click",this[Aa]);else if(this[xn].classList.contains("enabled")){this[xn].removeEventListener("click",this[Aa]),this[xn].classList.remove("enabled");const p=yx;this.setAttribute("ar-status",p),this.dispatchEvent(new CustomEvent("ar-status",{detail:{status:p}}))}}async[np](){console.log("Attempting to present in AR with WebXR..."),await this[Nl]();try{this[xn].removeEventListener("click",this[Aa]);const{arRenderer:p}=this[Ce];p.placeOnWall=this.arPlacement==="wall",await p.present(this[ae],this.xrEnvironment)}catch(p){console.warn("Error while trying to present in AR with WebXR"),console.error(p),await this[Ce].arRenderer.stopPresenting(),$d=!0,console.warn("Falling back to next ar-mode"),await this[Xr](),this.activateAR()}finally{this[Xr]()}}async[Nl](){this.loaded||(this[Ea]=!0,this[Kt](),await((p,m,f=null)=>new Promise(g=>{p.addEventListener(m,function x(v){f&&!f(v)||(g(v),p.removeEventListener(m,x))})}))(this,"load"),this[Ea]=!1)}[yi](){return super[yi]()||this[Ea]}[ip](){const p=self.location.toString(),m=new URL(p),f=new URL(this.src,p),g=new URLSearchParams(f.search);if(m.hash="#model-viewer-no-ar-fallback",g.set("mode","ar_preferred"),g.has("disable_occlusion")||g.set("disable_occlusion","true"),this.arScale==="fixed"&&g.set("resizable","false"),this.arPlacement==="wall"&&g.set("enable_vertical_placement","true"),g.has("sound")){const v=new URL(g.get("sound"),p);g.set("sound",v.toString())}if(g.has("link")){const v=new URL(g.get("link"),p);g.set("link",v.toString())}const x=`intent://arvr.google.com/scene-viewer/1.0?${g.toString()+"&file="+encodeURIComponent(f.toString())}#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(m.toString())};end;`;self.addEventListener("hashchange",()=>{self.location.hash==="#model-viewer-no-ar-fallback"&&(Kd=!0,self.history.back(),console.warn("Error while trying to present in AR with Scene Viewer"),console.warn("Falling back to next ar-mode"),this[Xr]())},{once:!0}),this[qi].setAttribute("href",x),console.log("Attempting to present in AR with Scene Viewer..."),this[qi].click()}async[rp](){const p=!this.iosSrc;this[xn].classList.remove("enabled");const m=p?await this.prepareUSDZ():this.iosSrc,f=new URL(m,self.location.toString());this.arScale==="fixed"&&(f.hash&&(f.hash+="&"),f.hash+="allowsContentScaling=0");const g=this[qi];g.setAttribute("rel","ar");const x=document.createElement("img");g.appendChild(x),g.setAttribute("href",f.toString()),p&&g.setAttribute("download","model.usdz"),console.log("Attempting to present in AR with Quick Look..."),g.click(),g.removeChild(x),p&&URL.revokeObjectURL(m),this[xn].classList.add("enabled")}async prepareUSDZ(){const p=this[lr].beginActivity();await this[Nl]();const m=this[ae],f=m.shadow;let g=!1;f!=null&&(g=f.visible,f.visible=!1),p(.2);const x=new qx,v=await x.parse(m.modelContainer),y=new Blob([v],{type:"model/vnd.usdz+zip"}),b=URL.createObjectURL(y);return p(1),f!=null&&(f.visible=g),b}}return ji([ye({type:Boolean,attribute:"ar"})],u.prototype,"ar",void 0),ji([ye({type:String,attribute:"ar-scale"})],u.prototype,"arScale",void 0),ji([ye({type:String,attribute:"ar-placement"})],u.prototype,"arPlacement",void 0),ji([ye({type:String,attribute:"ar-modes"})],u.prototype,"arModes",void 0),ji([ye({type:String,attribute:"ios-src"})],u.prototype,"iosSrc",void 0),ji([ye({type:Boolean,attribute:"xr-environment"})],u.prototype,"xrEnvironment",void 0),u})((s=>{var e,t,n,i,r,a,o,l,c,h,u,d,p,m;class f extends s{constructor(...x){super(...x),this.poster=null,this.reveal=Ia,this.loading=Mb,this.generateSchema=!1,this.seamlessPoster=!1,this[e]=!1,this[t]=!1,this[n]=0,this[i]=null,this[r]=this.shadowRoot.querySelector(".slot.poster"),this[a]=this.shadowRoot.querySelector("#default-poster"),this[o]=this.shadowRoot.querySelector("#default-progress-bar > .bar"),this[l]=this.shadowRoot.querySelector("#default-progress-bar > .mask"),this[c]=this[Zi].getAttribute("aria-label"),this[h]=((w,S)=>{let M=null;const L=(...I)=>{M==null&&(w(...I),M=self.setTimeout(()=>M=null,S))};return L.flush=()=>{M!=null&&(self.clearTimeout(M),M=null)},L})(w=>{const S=this[hi].parentNode;requestAnimationFrame(()=>{this[Ip].style.opacity=""+.2*(1-w),this[hi].style.transform=`scaleX(${w})`,w===0&&(S.removeChild(this[hi]),S.appendChild(this[hi])),w===1?this[hi].classList.add("hide"):this[hi].classList.remove("hide")})},100),this[u]=()=>{this.reveal!==Cp&&this.reveal!==Ia&&this.dismissPoster()},this[d]=w=>{if(this.reveal!==Cp)switch(w.keyCode){case 32:case 13:this.dismissPoster()}},this[p]=w=>{const S=w.detail.totalProgress;this[rs]=Math.max(S,this[rs]),S===1&&(this[Xl].flush(),!this[xi]()||this[is]==null&&this.reveal!==Ia||this[ql]()),this[Xl](S),this.dispatchEvent(new CustomEvent("progress",{detail:{totalProgress:S}}))},this[m]=()=>{this[ss]=!0;const w=this.getRootNode();w&&w.activeElement===this&&this[Qt].focus();const S=this[Zi];S.setAttribute("aria-hidden","true"),S.tabIndex=-1,this.dispatchEvent(new CustomEvent("poster-dismissed"))};const v=self.ModelViewerElement||{},y=v.dracoDecoderLocation||"https://www.gstatic.com/draco/versioned/decoders/1.4.1/";pt.setDRACODecoderLocation(y);const b=v.ktx2TranscoderLocation||"https://www.gstatic.com/basis-universal/versioned/2021-04-15-ba1c3e4/";pt.setKTX2TranscoderLocation(b),v.meshoptDecoderLocation&&pt.setMeshoptDecoderLocation(v.meshoptDecoderLocation)}static set dracoDecoderLocation(x){pt.setDRACODecoderLocation(x)}static get dracoDecoderLocation(){return pt.getDRACODecoderLocation()}static set ktx2TranscoderLocation(x){pt.setKTX2TranscoderLocation(x)}static get ktx2TranscoderLocation(){return pt.getKTX2TranscoderLocation()}static set meshoptDecoderLocation(x){pt.setMeshoptDecoderLocation(x)}static get meshoptDecoderLocation(){return pt.getMeshoptDecoderLocation()}static mapURLs(x){Cn.singleton.loader[nr].manager.setURLModifier(x)}dismissPoster(){this[xi]()?this[ql]():(this[is]=Tb,this[Kt]())}showPoster(){const x=this[wn],v=this[Zi];v.removeAttribute("tabindex"),v.removeAttribute("aria-hidden"),x.classList.add("show");const y=this.modelIsVisible;this[Da]=!1,this[$a](y),this[ss]=!1}getDimensions(){return Sa(this[ae].size)}connectedCallback(){super.connectedCallback(),this[wn].addEventListener("click",this[Zl]),this[wn].addEventListener("keydown",this[Jl]),this[lr].addEventListener("progress",this[$l]),Pp.registerInstance(this)}disconnectedCallback(){super.disconnectedCallback(),this[wn].removeEventListener("click",this[Zl]),this[wn].removeEventListener("keydown",this[Jl]),this[lr].removeEventListener("progress",this[$l]),Pp.unregisterInstance(this)}async updated(x){super.updated(x),x.has("poster")&&this.poster!=null&&(this[Zi].style.backgroundImage=`url(${this.poster})`),x.has("alt")&&this[Zi].setAttribute("aria-label",`${this[kc]}. ${this[Dp]}`),(x.has("reveal")||x.has("loading"))&&this[Kt](),x.has("generateSchema")&&(this.generateSchema===!0?this[ae].updateSchema(this.src):this[ae].updateSchema(null)),x.has("seamlessPoster")&&(this.seamlessPoster===!0?this[wn].classList.add("quick"):this[wn].classList.remove("quick"))}[(e=Da,t=ss,n=rs,i=is,r=wn,a=Zi,o=hi,l=Ip,c=Dp,h=Xl,u=Zl,d=Jl,p=$l,yi)](){return!!this.src&&(this[is]!=null||this.loading===Sb||this.reveal===Ia&&this[fi])}[xi](){const{src:x}=this;return!!x&&super[xi]()&&this[rs]===1}[(m=Yl,ql)](){this[is]=null;const x=this[wn];if(x.classList.contains("show")){const v=this.modelIsVisible;this[Da]=!0,this[$a](v),requestAnimationFrame(()=>{x.classList.remove("show"),this.seamlessPoster===!0?this[Yl]():x.addEventListener("transitionend",this[Yl],{once:!0})})}else this[ss]=!0}[Qa](){return super[Qa]()&&this[Da]}[rr](){return super[rr]()&&this[ss]}async[Kt](){this[rs]=0,this.generateSchema===!0&&this[ae].updateSchema(this.src),this[ae].currentGLTF!=null&&this.src!=null&&this[yi]()||this.showPoster(),await super[Kt]()}}return ns([ye({type:String})],f.prototype,"poster",void 0),ns([ye({type:String})],f.prototype,"reveal",void 0),ns([ye({type:String})],f.prototype,"loading",void 0),ns([ye({type:Boolean,attribute:"generate-schema"})],f.prototype,"generateSchema",void 0),ns([ye({type:Boolean,attribute:"seamless-poster"})],f.prototype,"seamlessPoster",void 0),f})((s=>{var e;class t extends s{constructor(...i){super(i),this.autoplay=!1,this.animationName=void 0,this.animationCrossfadeDuration=300,this[e]=!0,this[ae].subscribeMixerEvent("loop",r=>{const a=r.action._loopCount;this.dispatchEvent(new CustomEvent("loop",{detail:{count:a}}))}),this[ae].subscribeMixerEvent("finished",()=>{this.currentTime=0,this[vn]=!0,this[Ce].threeRenderer.shadowMap.autoUpdate=!1,this[Gr]({repetitions:1/0,pingpong:!1}),this.dispatchEvent(new CustomEvent("finished"))})}get availableAnimations(){return this.loaded?this[ae].animationNames:[]}get duration(){return this[ae].duration}get paused(){return this[vn]}get currentTime(){return this[ae].animationTime}set currentTime(i){this[ae].animationTime=i,this[Ce].threeRenderer.shadowMap.needsUpdate=!0,this[dt]()}pause(){this[vn]||(this[vn]=!0,this[Ce].threeRenderer.shadowMap.autoUpdate=!1,this.dispatchEvent(new CustomEvent("pause")))}play(i=Fx){this.availableAnimations.length>0&&(this[vn]=!1,this[Ce].threeRenderer.shadowMap.autoUpdate=!0,this[Gr](i),this.dispatchEvent(new CustomEvent("play")))}[(e=vn,$t)](){super[$t](),this[vn]=!0,this.autoplay&&(this[Gr]({repetitions:1/0,pingpong:!1}),this.play())}[Jt](i,r){super[Jt](i,r),this[vn]||!this[rr]()&&!this[Ce].isPresenting||(this[ae].updateAnimation(r/1e3),this[dt]())}updated(i){super.updated(i),i.has("autoplay")&&this.autoplay&&this.play(),i.has("animationName")&&this[Gr]({repetitions:1/0,pingpong:!1})}async[Kt](){return this[ae].stopAnimation(),super[Kt]()}[Gr](i){var r;const a=(r=i.repetitions)!==null&&r!==void 0?r:1/0,o=i.pingpong?2202:a===1?2200:2201;this[ae].playAnimation(this.animationName,this.animationCrossfadeDuration/1e3,o,a),this[vn]&&(this[ae].updateAnimation(0),this[dt]())}}return Ml([ye({type:Boolean})],t.prototype,"autoplay",void 0),Ml([ye({type:String,attribute:"animation-name"})],t.prototype,"animationName",void 0),Ml([ye({type:Number,attribute:"animation-crossfade-duration"})],t.prototype,"animationCrossfadeDuration",void 0),t})((s=>{var e;const t=Symbol("endPolyfillCoordination");return e=t,class extends s{constructor(){super(...arguments),this[e]=null}connectedCallback(){super.connectedCallback&&super.connectedCallback(),this[t]==null&&(this[t]=(n=>{if(n.shadowRoot==null||n.hasAttribute("data-js-focus-visible"))return()=>{};if(!self.applyFocusVisiblePolyfill){const i=()=>{self.applyFocusVisiblePolyfill(n.shadowRoot)};return self.addEventListener("focus-visible-polyfill-ready",i,{once:!0}),()=>{self.removeEventListener("focus-visible-polyfill-ready",i)}}return self.applyFocusVisiblePolyfill(n.shadowRoot),()=>{}})(this))}disconnectedCallback(){super.disconnectedCallback&&super.disconnectedCallback(),this[t]!=null&&(this[t](),this[t]=null)}}})(zc)))))))));customElements.define("model-viewer",l1);export{l1 as ModelViewerElement};
//# sourceMappingURL=model-viewer.min-4022a8f7.js.map
