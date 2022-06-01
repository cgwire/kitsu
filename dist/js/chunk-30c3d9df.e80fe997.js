(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-30c3d9df"],{"319f":function(e,t,s){"use strict";s.r(t);var r=function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{staticClass:"asset-types page fixed-page"},[s("list-page-header",{attrs:{title:e.$t("asset_types.title"),"new-entry-label":e.$t("asset_types.new_asset_type")},on:{"new-clicked":e.onNewClicked}}),s("asset-type-list",{staticClass:"mt2",attrs:{entries:e.assetTypes,"is-loading":e.loading.list,"is-error":e.errors.list},on:{"edit-clicked":e.onEditClicked,"delete-clicked":e.onDeleteClicked}}),s("edit-asset-type-modal",{attrs:{active:e.modals.edit,"is-loading":e.loading.edit,"is-error":e.errors.edit,"asset-type-to-edit":e.assetTypeToEdit},on:{cancel:function(t){e.modals.edit=!1},confirm:e.confirmEditAssetType}}),s("delete-modal",{attrs:{active:e.modals.del,"is-loading":e.loading.del,"is-error":e.errors.del,text:e.deleteText,"error-text":e.$t("asset_types.delete_error")},on:{cancel:function(t){e.modals.del=!1},confirm:e.confirmDeleteAssetType}})],1)},i=[],n=s("2f62"),a=function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{staticClass:"data-list"},[s("div",{staticClass:"datatable-wrapper"},[s("table",{staticClass:"datatable"},[s("thead",{staticClass:"datatable-head"},[s("tr",[s("th",{staticClass:"name",attrs:{scope:"col"}},[e._v(e._s(e.$t("asset_types.fields.name")))]),s("th",{staticClass:"actions",attrs:{scope:"col"}})])]),e.entries.length>0?s("tbody",{staticClass:"datatable-body"},e._l(e.entries,(function(t){return s("tr",{key:t.id,staticClass:"datatable-row"},[s("td",{staticClass:"name"},[e._v(" "+e._s(t.name)+" ")]),s("row-actions-cell",{attrs:{"entry-id":t.id},on:{"edit-clicked":function(s){return e.$emit("edit-clicked",t)},"delete-clicked":function(s){return e.$emit("delete-clicked",t)}}})],1)})),0):e._e()])]),s("table-info",{attrs:{"is-loading":e.isLoading,"is-error":e.isError}}),s("p",{staticClass:"has-text-centered nb-asset-types"},[e._v(" "+e._s(e.entries.length)+" "+e._s(e.$tc("asset_types.number",e.entries.length))+" ")])],1)},o=[],c=s("14b2"),l=s("e60b");function d(e,t){var s=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),s.push.apply(s,r)}return s}function p(e){for(var t=1;t<arguments.length;t++){var s=null!=arguments[t]?arguments[t]:{};t%2?d(Object(s),!0).forEach((function(t){u(e,t,s[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(s)):d(Object(s)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(s,t))}))}return e}function u(e,t,s){return t in e?Object.defineProperty(e,t,{value:s,enumerable:!0,configurable:!0,writable:!0}):e[t]=s,e}var f={name:"asset-type-list",props:["entries","isLoading","isError"],data:function(){return{}},components:{RowActionsCell:c["a"],TableInfo:l["a"]},computed:p({},Object(n["c"])([])),methods:p({},Object(n["b"])([]))},b=f,y=(s("6721b"),s("0c7c")),m=Object(y["a"])(b,a,o,!1,null,"e2268d56",null),O=m.exports,h=s("5f48"),g=function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{class:{modal:!0,"is-active":e.active}},[s("div",{staticClass:"modal-background",on:{click:function(t){return e.$emit("cancel")}}}),s("div",{staticClass:"modal-content"},[s("div",{staticClass:"box"},[e.assetTypeToEdit&&e.assetTypeToEdit.id?s("h1",{staticClass:"title"},[e._v(" "+e._s(e.$t("asset_types.edit_title"))+" "+e._s(e.assetTypeToEdit.name)+" ")]):s("h1",{staticClass:"title"},[e._v(" "+e._s(e.$t("asset_types.new_asset_type"))+" ")]),s("form",{on:{submit:function(e){e.preventDefault()}}},[s("text-field",{directives:[{name:"focus",rawName:"v-focus"}],ref:"nameField",attrs:{label:e.$t("asset_types.fields.name"),maxlength:30},on:{enter:e.runConfirmation},model:{value:e.form.name,callback:function(t){e.$set(e.form,"name",t)},expression:"form.name"}})],1),s("modal-footer",{attrs:{"error-text":e.$t("asset_types.create_error"),"is-error":e.isError,"is-loading":e.isLoading},on:{confirm:e.runConfirmation,cancel:function(t){return e.$emit("cancel")}}})],1)])])},v=[],j=s("d065"),T=s("d5c9"),w=s("7bf8");function _(e,t){var s=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),s.push.apply(s,r)}return s}function P(e){for(var t=1;t<arguments.length;t++){var s=null!=arguments[t]?arguments[t]:{};t%2?_(Object(s),!0).forEach((function(t){E(e,t,s[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(s)):_(Object(s)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(s,t))}))}return e}function E(e,t,s){return t in e?Object.defineProperty(e,t,{value:s,enumerable:!0,configurable:!0,writable:!0}):e[t]=s,e}var C={name:"edit-asset-type-modal",mixins:[j["a"]],components:{ModalFooter:T["a"],TextField:w["a"]},props:["onConfirmClicked","text","active","cancelRoute","isLoading","isError","assetTypeToEdit"],data:function(){return{}},computed:P(P({},Object(n["c"])(["assetTypes","assetTypeStatusOptions"])),{},{form:function(){return{name:""}}}),methods:P(P({},Object(n["b"])([])),{},{runConfirmation:function(){this.$emit("confirm",this.form)}}),watch:{active:function(){var e=this;this.active&&setTimeout((function(){e.$refs.nameField.focus()}),100)},assetTypeToEdit:function(){this.assetTypeToEdit&&(this.form.name=this.assetTypeToEdit.name)}}},k=C,D=(s("429d"),Object(y["a"])(k,g,v,!1,null,"20a98cd0",null)),$=D.exports,x=s("459c");function A(e,t){var s=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),s.push.apply(s,r)}return s}function S(e){for(var t=1;t<arguments.length;t++){var s=null!=arguments[t]?arguments[t]:{};t%2?A(Object(s),!0).forEach((function(t){L(e,t,s[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(s)):A(Object(s)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(s,t))}))}return e}function L(e,t,s){return t in e?Object.defineProperty(e,t,{value:s,enumerable:!0,configurable:!0,writable:!0}):e[t]=s,e}var F={name:"asset-types",components:{AssetTypeList:O,DeleteModal:h["a"],EditAssetTypeModal:$,ListPageHeader:x["a"]},data:function(){return{assetTypeToDelete:null,assetTypeToEdit:{},choices:[],errors:{del:!1,edit:!1,list:!1},modals:{del:!1,edit:!1},loading:{del:!1,edit:!1,list:!1}}},computed:S(S({},Object(n["c"])(["assetTypes","getAssetType"])),{},{deleteText:function(){var e=this.assetTypeToDelete;return e?this.$t("asset_types.delete_text",{name:e.name}):""}}),methods:S(S({},Object(n["b"])(["deleteAssetType","editAssetType","newAssetType","loadAssetTypes"])),{},{confirmEditAssetType:function(e){var t=this,s="newAssetType";this.assetTypeToEdit&&this.assetTypeToEdit.id&&(s="editAssetType",e.id=this.assetTypeToEdit.id),this.loading.edit=!0,this.errors.edit=!1,this[s](e).then((function(){t.loading.edit=!1,t.modals.edit=!1})).catch((function(e){console.error(e),t.loading.edit=!1,t.errors.edit=!0}))},confirmDeleteAssetType:function(){var e=this;this.loading.del=!0,this.errors.del=!1,this.deleteAssetType(this.assetTypeToDelete).then((function(){e.loading.del=!1,e.modals.del=!1})).catch((function(t){console.error(t),e.errors.del=!0,e.loading.del=!1}))},onNewClicked:function(){this.assetTypeToEdit={},this.errors.edit=!1,this.modals.edit=!0},onEditClicked:function(e){this.assetTypeToEdit=e,this.errors.edit=!1,this.modals.edit=!0},onDeleteClicked:function(e){this.assetTypeToDelete=e,this.errors.del=!1,this.modals.del=!0}}),watch:{},metaInfo:function(){return{title:"".concat(this.$t("asset_types.title")," - Kitsu")}}},M=F,N=Object(y["a"])(M,r,i,!1,null,"c5daabc0",null);t["default"]=N.exports},"429d":function(e,t,s){"use strict";s("6afd")},"459c":function(e,t,s){"use strict";var r=function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{staticClass:"level page-header"},[s("div",{staticClass:"level-left"},[s("page-title",{attrs:{text:e.title}})],1),s("div",{staticClass:"level-right"},[s("button-simple",{staticClass:"level-item",attrs:{icon:"plus",text:e.newEntryLabel},on:{click:function(t){return e.$emit("new-clicked")}}})],1)])},i=[],n=s("2f62"),a=s("de40"),o=s("8d07");function c(e,t){var s=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),s.push.apply(s,r)}return s}function l(e){for(var t=1;t<arguments.length;t++){var s=null!=arguments[t]?arguments[t]:{};t%2?c(Object(s),!0).forEach((function(t){d(e,t,s[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(s)):c(Object(s)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(s,t))}))}return e}function d(e,t,s){return t in e?Object.defineProperty(e,t,{value:s,enumerable:!0,configurable:!0,writable:!0}):e[t]=s,e}var p={name:"list-page-header",components:{ButtonSimple:a["a"],PageTitle:o["a"]},props:{title:{type:String,default:""},newEntryLabel:{type:String,default:""}},computed:l({},Object(n["c"])([])),methods:l({},Object(n["b"])([])),watch:{}},u=p,f=s("0c7c"),b=Object(f["a"])(u,r,i,!1,null,"bf4864ae",null);t["a"]=b.exports},"6721b":function(e,t,s){"use strict";s("ff5a")},"6afd":function(e,t,s){},ff5a:function(e,t,s){}}]);
//# sourceMappingURL=chunk-30c3d9df.e80fe997.js.map