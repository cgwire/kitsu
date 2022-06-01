(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-209d2e7d"],{"099d":function(e,t,r){"use strict";r("c8a3")},"459c":function(e,t,r){"use strict";var n=function(){var e=this,t=e.$createElement,r=e._self._c||t;return r("div",{staticClass:"level page-header"},[r("div",{staticClass:"level-left"},[r("page-title",{attrs:{text:e.title}})],1),r("div",{staticClass:"level-right"},[r("button-simple",{staticClass:"level-item",attrs:{icon:"plus",text:e.newEntryLabel},on:{click:function(t){return e.$emit("new-clicked")}}})],1)])},i=[],o=r("2f62"),a=r("de40"),c=r("8d07");function s(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?s(Object(r),!0).forEach((function(t){d(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):s(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function d(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}var u={name:"list-page-header",components:{ButtonSimple:a["a"],PageTitle:c["a"]},props:{title:{type:String,default:""},newEntryLabel:{type:String,default:""}},computed:l({},Object(o["c"])([])),methods:l({},Object(o["b"])([])),watch:{}},p=u,f=r("0c7c"),m=Object(f["a"])(p,n,i,!1,null,"bf4864ae",null);t["a"]=m.exports},"5b16":function(e,t,r){"use strict";r("8836")},8836:function(e,t,r){},"962a":function(e,t,r){},c488:function(e,t,r){"use strict";r.r(t);var n=function(){var e=this,t=e.$createElement,r=e._self._c||t;return r("div",{staticClass:"departments page fixed-page"},[r("list-page-header",{attrs:{title:e.$t("departments.title"),"new-entry-label":e.$t("departments.new_departments")},on:{"new-clicked":e.onNewClicked}}),r("department-list",{attrs:{entries:e.departments,"is-loading":e.loading.departments,"is-error":e.errors.departments},on:{"edit-clicked":e.onEditClicked,"delete-clicked":e.onDeleteClicked}}),r("edit-departments-modal",{attrs:{active:e.modals.edit,"is-loading":e.loading.edit,"is-error":e.errors.edit,"department-to-edit":e.departmentToEdit},on:{cancel:function(t){e.modals.edit=!1},confirm:e.confirmEditDepartment}}),r("delete-modal",{attrs:{active:e.modals.del,"is-loading":e.loading.del,"is-error":e.errors.del,text:e.deleteText,"error-text":e.$t("departments.delete_error")},on:{cancel:function(t){e.modals.del=!1},confirm:e.confirmDeleteDepartment}})],1)},i=[],o=r("a34a"),a=r.n(o),c=r("2f62"),s=function(){var e=this,t=e.$createElement,r=e._self._c||t;return r("div",{staticClass:"data-list"},[r("div",{staticClass:"datatable-wrapper"},[r("table",{staticClass:"datatable"},[r("thead",{staticClass:"datatable-head"},[r("tr",[r("th",{staticClass:"name",attrs:{scope:"col"}},[e._v(" "+e._s(e.$t("departments.fields.name"))+" ")]),r("th",{attrs:{scope:"col"}},[e._v(e._s(e.$t("departments.fields.color")))]),r("th",{staticClass:"actions",attrs:{scope:"col"}})])]),e.entries.length>0?r("tbody",{staticClass:"datatable-body"},e._l(e.entries,(function(t){return r("tr",{key:t.id,staticClass:"datatable-row"},[r("td",{staticClass:"name"},[e._v(" "+e._s(t.name)+" ")]),r("td",{staticClass:"color"},[r("div",[r("span",{style:{background:t.color}})])]),r("row-actions-cell",{attrs:{"entry-id":t.id},on:{"edit-clicked":function(r){return e.$emit("edit-clicked",t)},"delete-clicked":function(r){return e.$emit("delete-clicked",t)}}})],1)})),0):e._e()])]),r("table-info",{attrs:{"is-loading":e.isLoading,"is-error":e.isError}}),r("p",{staticClass:"has-text-centered nb-asset-types"},[e._v(" "+e._s(e.entries.length)+" "+e._s(e.$tc("departments.number",e.entries.length))+" ")])],1)},l=[],d=r("14b2"),u=r("e60b");function p(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function f(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?p(Object(r),!0).forEach((function(t){m(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):p(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function m(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}var b={name:"departments-list",props:["entries","isLoading","isError"],data:function(){return{}},components:{RowActionsCell:d["a"],TableInfo:u["a"]},computed:f({},Object(c["c"])([])),methods:f({},Object(c["b"])([]))},O=b,h=(r("d003"),r("0c7c")),v=Object(h["a"])(O,s,l,!1,null,"5f5cf001",null),g=v.exports,y=r("459c"),j=function(){var e=this,t=e.$createElement,r=e._self._c||t;return r("div",{class:{modal:!0,"is-active":e.active}},[r("div",{staticClass:"modal-background",on:{click:function(t){return e.$emit("cancel")}}}),r("div",{staticClass:"modal-content"},[r("div",{staticClass:"box"},[e.departmentToEdit&&e.departmentToEdit.id?r("h1",{staticClass:"title"},[e._v(" "+e._s(e.$t("departments.edit_title"))+" "+e._s(e.departmentToEdit.name)+" ")]):r("h1",{staticClass:"title"},[e._v(" "+e._s(e.$t("departments.new_departments"))+" ")]),r("form",{on:{submit:function(e){e.preventDefault()}}},[r("text-field",{directives:[{name:"focus",rawName:"v-focus"}],ref:"nameField",attrs:{label:e.$t("departments.fields.name"),maxlength:30},model:{value:e.form.name,callback:function(t){e.$set(e.form,"name",t)},expression:"form.name"}}),r("color-field",{ref:"colorField",attrs:{label:e.$t("departments.fields.color")},model:{value:e.form.color,callback:function(t){e.$set(e.form,"color",t)},expression:"form.color"}})],1),r("modal-footer",{attrs:{"error-text":e.$t("departments.create_error"),"is-error":e.isError,"is-loading":e.isLoading},on:{confirm:e.runConfirmation,cancel:function(t){return e.$emit("cancel")}}})],1)])])},w=[],C=r("d065"),P=r("d5c9"),D=r("7bf8"),E=r("f865");function k(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function _(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?k(Object(r),!0).forEach((function(t){$(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):k(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function $(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}var x={name:"edit-departments-modal",mixins:[C["a"]],components:{ColorField:E["a"],ModalFooter:P["a"],TextField:D["a"]},props:["onConfirmClicked","text","active","cancelRoute","isLoading","isError","departmentToEdit"],data:function(){return{form:{name:"",color:"",id:null}}},computed:_({},Object(c["c"])(["assetTypes","assetTypeStatusOptions"])),methods:_(_({},Object(c["b"])([])),{},{runConfirmation:function(){this.$emit("confirm",this.form)}}),watch:{active:function(){var e=this;this.active&&setTimeout((function(){e.$refs.nameField.focus()}),100)},departmentToEdit:function(){this.departmentToEdit&&(this.form.name=this.departmentToEdit.name,this.form.color=this.departmentToEdit.color,this.form.id=this.departmentToEdit.id)}}},T=x,F=(r("5b16"),Object(h["a"])(T,j,w,!1,null,"5c8bd4d7",null)),S=F.exports,B=r("5f48");function L(e,t,r,n,i,o,a){try{var c=e[o](a),s=c.value}catch(l){return void r(l)}c.done?t(s):Promise.resolve(s).then(n,i)}function A(e){return function(){var t=this,r=arguments;return new Promise((function(n,i){var o=e.apply(t,r);function a(e){L(o,n,i,a,c,"next",e)}function c(e){L(o,n,i,a,c,"throw",e)}a(void 0)}))}}function M(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function N(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?M(Object(r),!0).forEach((function(t){I(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):M(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function I(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}var J={name:"production-departments",components:{DeleteModal:B["a"],DepartmentList:g,EditDepartmentsModal:S,ListPageHeader:y["a"]},props:{},data:function(){return{errors:{departments:!1,edit:!1,del:!1},loading:{departments:!1,edit:!1,del:!1},modals:{del:!1,edit:!1},departmentToEdit:null,departmentToDelete:null}},computed:N(N({},Object(c["c"])(["departments"])),{},{deleteText:function(){return this.departmentToDelete?this.$t("departments.delete_text",{name:this.departmentToDelete.name}):""}}),mounted:function(){var e=this;this.loading.departments=!0,this.errors.departments=!1,this.loadDepartments().then((function(){e.loading.departments=!1,e.errors.departments=!1})).catch((function(){e.loading.departments=!1,e.errors.departments=!0}))},methods:N(N({},Object(c["b"])(["deleteDepartment","loadDepartments","newDepartement"])),{},{onNewClicked:function(){this.departmentToEdit={name:"",color:"#999999"},this.modals.edit=!0},onEditClicked:function(e){this.departmentToEdit=e,this.modals.edit=!0},confirmEditDepartment:function(e){var t=this,r="newDepartement";this.departmentToEdit&&this.departmentToEdit.id&&(r="editDepartement",e.id=this.departmentToEdit.id),this.loading.edit=!0,this.errors.edit=!1,this.$store.dispatch(r,e).then((function(){t.loading.edit=!1,t.modals.edit=!1})).catch((function(){t.loading.edit=!1,t.errors.edit=!0}))},onDeleteClicked:function(e){this.departmentToDelete=e,this.modals.del=!0},confirmDeleteDepartment:function(){var e=this;return A(a.a.mark((function t(){return a.a.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return e.loading.del=!0,e.errors.del=!1,t.prev=2,t.next=5,e.deleteDepartment(e.departmentToDelete);case 5:e.loading.del=!1,e.modals.del=!1,t.next=13;break;case 9:t.prev=9,t.t0=t["catch"](2),e.loading.del=!1,e.errors.del=!0;case 13:case"end":return t.stop()}}),t,null,[[2,9]])})))()}})},R=J,H=Object(h["a"])(R,n,i,!1,null,"6abcfe96",null);t["default"]=H.exports},c8a3:function(e,t,r){},d003:function(e,t,r){"use strict";r("962a")},f865:function(e,t,r){"use strict";var n=function(){var e=this,t=e.$createElement,r=e._self._c||t;return r("div",{staticClass:"field"},[r("label",{staticClass:"label"},[e._v(e._s(e.label))]),r("div",{staticClass:"control colors"},e._l(e.colors,(function(t,n){return r("div",{key:"color-"+n,ref:"color-"+n,refInFor:!0,class:{color:!0,selected:e.value===t},on:{click:function(r){return e.colorChanged(t)}}},[r("span",{style:{background:t}})])})),0)])},i=[],o=r("2f62");function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function c(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){s(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function s(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}var l={name:"text-field",props:{label:{default:"",type:String},value:{default:"$grey999",type:String},placeholder:{default:"",type:String},type:{default:"text",type:String},colors:{default:function(){return["#999999","#8D6E63","#43A047","#7CB342","#009688","#9CCC65","#AFB42B","#DCE775","#FFF176","#FFEB3B","#F9A825","#F57C00","#ff5252","#F06292","#AB47BC","#5C6BC0","#1976D2","#039BE5","#42A5F5","#64B5F6","#26C6DA","#78909C"]}}},data:function(){return{selectedColor:"$grey999"}},computed:c({},Object(o["c"])([])),methods:c(c({},Object(o["b"])([])),{},{colorChanged:function(e,t){this.$emit("input",e)}})},d=l,u=(r("099d"),r("0c7c")),p=Object(u["a"])(d,n,i,!1,null,"562b3c5e",null);t["a"]=p.exports}}]);
//# sourceMappingURL=chunk-209d2e7d.be0352d1.js.map