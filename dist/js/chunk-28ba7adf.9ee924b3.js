(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-28ba7adf"],{2977:function(t,e,o){"use strict";o("cf49")},"2b61":function(t,e,o){"use strict";var a=function(){var t=this,e=t.$createElement,o=t._self._c||e;return o("div",{class:{modal:!0,"is-active":t.active}},[o("div",{staticClass:"modal-background",on:{click:function(e){return t.$emit("cancel")}}}),o("div",{staticClass:"modal-content"},[o("div",{staticClass:"box content"},[o("h1",{staticClass:"title"},[t._v(" "+t._s(t.title)+" ")]),o("p",[t._v(" "+t._s(t.$t("main.csv.select_file"))+" ")]),o("file-upload",{ref:"uploadAvatarField",attrs:{label:t.$t("main.csv.upload_file"),accept:".png,.jpg,.jpeg"},on:{fileselected:t.onFileSelected}}),t.isError?o("p",{staticClass:"error"},[t._v(" "+t._s(t.$t("profile.avatar.error_upload"))+" ")]):t._e(),o("modal-footer",{attrs:{"error-text":t.$t("productions.metadata.error"),"is-loading":t.isLoading,"is-disabled":!t.formData},on:{confirm:t.onConfirmClicked,cancel:function(e){return t.$emit("cancel")}}})],1)])])},n=[],s=o("2f62"),r=o("d065"),i=o("4085"),c=o("d5c9");function l(t,e){var o=Object.keys(t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(t);e&&(a=a.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),o.push.apply(o,a)}return o}function f(t){for(var e=1;e<arguments.length;e++){var o=null!=arguments[e]?arguments[e]:{};e%2?l(Object(o),!0).forEach((function(e){u(t,e,o[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(o)):l(Object(o)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(o,e))}))}return t}function u(t,e,o){return e in t?Object.defineProperty(t,e,{value:o,enumerable:!0,configurable:!0,writable:!0}):t[e]=o,t}var d={name:"change-avatar-modal",mixins:[r["a"]],components:{FileUpload:i["a"],ModalFooter:c["a"]},props:["active","cancelRoute","isLoading","isError","title"],data:function(){return{formData:null}},computed:f({},Object(s["c"])([])),methods:f(f({},Object(s["b"])([])),{},{onFileSelected:function(t){this.formData=t,this.$emit("fileselected",t)},onConfirmClicked:function(){this.$emit("confirm",this.formData)}}),watch:{active:function(){this.formData=null,this.$refs.uploadAvatarField.reset()}}},m=d,h=(o("2977"),o("0c7c")),_=Object(h["a"])(m,a,n,!1,null,"35bcaa07",null);e["a"]=_.exports},"2e31":function(t,e,o){"use strict";o.r(e);var a=function(){var t=this,e=t.$createElement,o=t._self._c||e;return o("div",{staticClass:"settings page"},[o("div",{staticClass:"settings-content"},[o("div",{staticClass:"settings-body"},[o("h2",[t._v(" "+t._s(t.$t("settings.title"))+" ")]),o("p",[o("strong",[t._v(" "+t._s(t.$t("settings.logo"))+" ")])]),t.organisation.has_avatar?o("div",{staticClass:"logo-wrapper"},[o("img",{attrs:{src:t.organisationLogoPath}})]):o("p",{staticClass:"no-logo"},[t._v(" "+t._s(t.$t("settings.no_logo"))+" ")]),o("p",[o("button",{staticClass:"button set-logo-button",on:{click:t.showAvatarModal}},[t._v(" "+t._s(t.$t("settings.set_logo"))+" ")])]),o("text-field",{staticClass:"mt2",attrs:{label:t.$t("settings.fields.name")},on:{enter:function(e){return t.saveSettings()}},model:{value:t.form.name,callback:function(e){t.$set(t.form,"name",e)},expression:"form.name"}}),o("text-field",{attrs:{label:t.$t("settings.fields.hours_by_day"),type:"number"},on:{enter:function(e){return t.saveSettings()}},model:{value:t.form.hours_by_day,callback:function(e){t.$set(t.form,"hours_by_day",e)},expression:"form.hours_by_day"}}),o("combobox-boolean",{attrs:{label:t.$t("settings.fields.use_original_name")},on:{enter:function(e){return t.saveSettings()}},model:{value:t.form.use_original_file_name,callback:function(e){t.$set(t.form,"use_original_file_name",e)},expression:"form.use_original_file_name"}}),o("combobox-boolean",{attrs:{label:t.$t("settings.fields.show_hd_default")},on:{enter:function(e){return t.saveSettings()}},model:{value:t.form.hd_by_default,callback:function(e){t.$set(t.form,"hd_by_default",e)},expression:"form.hd_by_default"}}),o("combobox-boolean",{attrs:{label:t.$t("settings.fields.timesheets_locked")},on:{enter:function(e){return t.saveSettings()}},model:{value:t.form.timesheets_locked,callback:function(e){t.$set(t.form,"timesheets_locked",e)},expression:"form.timesheets_locked"}}),o("h2",[t._v(" "+t._s(t.$t("settings.integrations"))+" ")]),o("text-field",{attrs:{label:t.$t("settings.fields.slack_token")},on:{enter:function(e){return t.saveSettings()}},model:{value:t.form.chat_token_slack,callback:function(e){t.$set(t.form,"chat_token_slack",e)},expression:"form.chat_token_slack"}}),o("text-field",{attrs:{label:t.$t("settings.fields.discord_token")},on:{enter:function(e){return t.saveSettings()}},model:{value:t.form.chat_token_discord,callback:function(e){t.$set(t.form,"chat_token_discord",e)},expression:"form.chat_token_discord"}}),o("div",{attrs:{id:"mattermost_integrations"}},[o("text-field",{attrs:{label:t.$t("settings.fields.mattermost_webhook")},on:{enter:function(e){return t.saveSettings()}},model:{value:t.form.chat_webhook_mattermost,callback:function(e){t.$set(t.form,"chat_webhook_mattermost",e)},expression:"form.chat_webhook_mattermost"}}),!0===this.errors.webhook_error?o("div",{staticClass:"error pull-right"},[o("em",[t._v(t._s(t.$t("settings.webhook_error")))])]):t._e()],1),o("button",{class:{button:!0,"save-button":!0,"is-medium":!0,"is-loading":t.loading.save},on:{click:function(e){return t.saveSettings()}}},[t._v(" "+t._s(t.$t("settings.save.button"))+" ")]),o("p",{class:{error:!0,"is-hidden":!t.errors.save}},[t._v(" "+t._s(t.$t("settings.save.error"))+" ")])],1)]),o("change-avatar-modal",{attrs:{active:t.modals.avatar,"is-loading":t.loading.saveAvatar,"is-error":t.errors.saveAvatar,title:t.$t("settings.change_logo")},on:{confirm:t.uploadAvatarFile,cancel:t.hideAvatarModal}})],1)},n=[],s=o("2f62"),r=o("2b61"),i=o("4636"),c=o("7bf8");function l(t,e){var o=Object.keys(t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(t);e&&(a=a.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),o.push.apply(o,a)}return o}function f(t){for(var e=1;e<arguments.length;e++){var o=null!=arguments[e]?arguments[e]:{};e%2?l(Object(o),!0).forEach((function(e){u(t,e,o[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(o)):l(Object(o)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(o,e))}))}return t}function u(t,e,o){return e in t?Object.defineProperty(t,e,{value:o,enumerable:!0,configurable:!0,writable:!0}):t[e]=o,t}var d={name:"settings",components:{ChangeAvatarModal:r["a"],ComboboxBoolean:i["a"],TextField:c["a"]},data:function(){return{organisationLogoKey:(new Date).getUTCDate(),organisationLogoPath:"",form:{name:"",hours_by_day:0,original_file_name:"false",hd_by_default:"false",chat_token_slack:"",chat_webhook_mattermost:"",chat_token_discord:""},errors:{save:!1,saveAvatar:!1,webhook_error:!1},loading:{save:!1,saveAvatar:!1},modals:{avatar:!1}}},mounted:function(){this.form=Object.assign(this.form,this.organisation),this.organisationLogoKey="key"+(new Date).toISOString(),this.organisationLogoPath="/api/pictures/thumbnails/organisations/"+"".concat(this.organisation.id,".png")},computed:f({},Object(s["c"])(["organisation"])),methods:f(f({},Object(s["b"])(["changeAvatar","uploadOrganisationLogo","saveOrganisation"])),{},{checkWebhook:function(){return!this.form.chat_webhook_mattermost||this.form.chat_webhook_mattermost.match("/hooks/[a-zA-Z0-9]+$")?(this.errors.webhook_error=!1,!0):(this.errors.webhook_error=!0,!1)},hideAvatarModal:function(){this.modals.avatar=!1},saveSettings:function(){var t=this;this.checkWebhook()&&(this.loading.save=!0,this.errors.save=!1,this.saveOrganisation(this.form).then((function(){t.loading.save=!1,t.errors.save=!1})).catch((function(e){console.error(e),t.loading.save=!1,t.errors.save=!0})))},uploadAvatarFile:function(t){var e=this;this.loading.saveAvatar=!0,this.errors.saveAvatar=!1,this.uploadOrganisationLogo(t).then((function(){setTimeout((function(){e.loading.saveAvatar=!1,e.modals.avatar=!1,e.organisationLogoPath="/api/pictures/thumbnails/organisations/"+"".concat(e.organisation.id,".png?t=")+(new Date).toISOString()}),500)})).catch((function(t){console.error(t),e.loading.saveAvatar=!1,e.errors.saveAvatar=!0}))},showAvatarModal:function(){this.modals.avatar=!0}}),watch:{organisation:function(){this.form={name:this.organisation.name,hours_by_day:this.organisation.hours_by_day,use_original_file_name:this.organisation.use_original_file_name?"true":"false",timesheets_locked:this.organisation.timesheets_locked?"true":"false",hd_by_default:this.organisation.hd_by_default?"true":"false",chat_token_slack:this.organisation.chat_token_slack,chat_token_discord:this.organisation.chat_token_discord,chat_webhook_mattermost:this.organisation.chat_webhook_mattermost}}},metaInfo:function(){return{title:"".concat(this.$t("settings.title")," - Kitsu")}}},m=d,h=(o("fda0"),o("0c7c")),_=Object(h["a"])(m,a,n,!1,null,"4d43f346",null);e["default"]=_.exports},"871d":function(t,e,o){},cf49:function(t,e,o){},fda0:function(t,e,o){"use strict";o("871d")}}]);
//# sourceMappingURL=chunk-28ba7adf.9ee924b3.js.map