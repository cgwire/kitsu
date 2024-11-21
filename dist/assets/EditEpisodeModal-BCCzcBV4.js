import{a4 as V,am as _,bi as C,a6 as g,a8 as F,a7 as k,m as x,_ as M,r as n,k as B,o as a,c as r,e as m,t as u,a9 as p,n as S,f as l,bj as c,F as U,g as w,l as D,d as j,p as K}from"./index-a83mlrHR.js";const L={name:"edit-episode-modal",mixins:[V],components:{ComboboxStyled:_,MetadataField:C,ModalFooter:g,TextField:F,TextareaField:k},props:{active:{type:Boolean,default:!1},isError:{type:Boolean,default:!1},isLoading:{type:Boolean,default:!1},episodeToEdit:{type:Object,default:()=>{}}},emits:["cancel","confirm"],data(){let t={id:"",name:"",description:"",fps:"",data:{resolution:""}};return this.episodeToEdit&&this.episodeToEdit.id&&(t={id:this.episodeToEdit.id,name:this.episodeToEdit.name,description:this.episodeToEdit.description,production_id:this.episodeToEdit.project_id,data:{...this.episodeToEdit.data,resolution:this.episodeToEdit.data.resolution||""}}),{form:t,episodeSuccessText:"",episodeStatusOptions:[{label:"canceled",value:"canceled"},{label:"complete",value:"complete"},{label:"running",value:"running"},{label:"standby",value:"standby"}]}},computed:{...x(["episodeMetadataDescriptors"])},methods:{runConfirmation(){this.$emit("confirm",this.form)},isEditing(){return this.episodeToEdit&&this.episodeToEdit.id},resetForm(){this.episodeSuccessText="",this.isEditing()?this.form={id:this.episodeToEdit.id,name:this.episodeToEdit.name,status:this.episodeToEdit.status,description:this.episodeToEdit.description,data:{...this.episodeToEdit.data,resolution:this.episodeToEdit.data.resolution||""}}:(this.form.id=null,this.form.name="",this.form.status="running",this.form.description="",this.form.data={})}},mounted(){this.resetForm()},watch:{active(){this.active&&this.resetForm()},episodeToEdit(){this.resetForm()}}},N={class:"modal-content"},O={class:"box"},z={key:0,class:"title"},G={key:1,class:"title"};function I(t,e,s,q,i,d){const f=n("text-field"),E=n("combobox-styled"),h=n("textarea-field"),b=n("metadata-field"),T=n("modal-footer"),v=B("focus");return a(),r("div",{class:K({modal:!0,"is-active":s.active})},[m("div",{class:"modal-background",onClick:e[0]||(e[0]=o=>t.$emit("cancel"))}),m("div",N,[m("div",O,[s.episodeToEdit&&s.episodeToEdit.id?(a(),r("h1",z,u(t.$t("episodes.edit_title"))+" "+u(s.episodeToEdit.name),1)):(a(),r("h1",G,u(t.$t("episodes.new_episode")),1)),m("form",{onSubmit:e[5]||(e[5]=p(()=>{},["prevent"]))},[S(l(f,{ref:"nameField",label:t.$t("episodes.fields.name"),modelValue:i.form.name,"onUpdate:modelValue":e[1]||(e[1]=o=>i.form.name=o),modelModifiers:{trim:!0},onEnter:d.runConfirmation},null,8,["label","modelValue","onEnter"]),[[v]]),l(E,{class:"field",label:t.$t("main.status"),options:i.episodeStatusOptions,modelValue:i.form.status,"onUpdate:modelValue":e[2]||(e[2]=o=>i.form.status=o)},null,8,["label","options","modelValue"]),l(f,{ref:"resolutionField",label:t.$t("shots.fields.resolution"),modelValue:i.form.data.resolution,"onUpdate:modelValue":e[3]||(e[3]=o=>i.form.data.resolution=o),onEnter:d.runConfirmation},null,8,["label","modelValue","onEnter"]),l(h,{ref:"descriptionField",label:t.$t("episodes.fields.description"),onKeyup:[c(p(d.runConfirmation,["ctrl"]),["enter"]),c(p(d.runConfirmation,["meta"]),["enter"])],modelValue:i.form.description,"onUpdate:modelValue":e[4]||(e[4]=o=>i.form.description=o)},null,8,["label","onKeyup","modelValue"]),s.episodeToEdit?(a(!0),r(U,{key:0},w(t.episodeMetadataDescriptors,o=>(a(),D(b,{key:o.id,descriptor:o,entity:s.episodeToEdit,onEnter:d.runConfirmation,modelValue:i.form.data[o.field_name],"onUpdate:modelValue":y=>i.form.data[o.field_name]=y},null,8,["descriptor","entity","onEnter","modelValue","onUpdate:modelValue"]))),128)):j("",!0)],32),l(T,{"error-text":t.$t("episodes.edit_error"),"is-loading":s.isLoading,"is-error":s.isError,onConfirm:d.runConfirmation,onCancel:e[6]||(e[6]=o=>t.$emit("cancel"))},null,8,["error-text","is-loading","is-error","onConfirm"])])])],2)}const H=M(L,[["render",I],["__scopeId","data-v-c1393b49"]]);export{H as E};
//# sourceMappingURL=EditEpisodeModal-BCCzcBV4.js.map