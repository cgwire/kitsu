import{m as a,_ as s,o as r,c as o,e as n,t as l,p as c,A as i}from"./index-a83mlrHR.js";const d={name:"task-status-cell",props:{entry:{type:Object,default:()=>{}},disable:{type:Boolean,default:!1}},computed:{...a(["isDarkTheme"]),color(){return this.entry.name==="Todo"&&this.isDarkTheme?"#5F626A":this.entry.color},textColor(){return this.entry.name==="Todo"&&!this.isDarkTheme?"#333":"white"}}},m={class:"name"},_=["title"];function h(u,f,e,y,p,t){return r(),o("td",m,[n("div",{class:c(["tag",{canceled:e.disable}]),style:i({background:t.color,color:t.textColor}),title:e.entry.name},l(e.entry.short_name),15,_)])}const T=s(d,[["render",h],["__scopeId","data-v-c7a94fba"]]);export{T};
//# sourceMappingURL=TaskStatusCell-D-4rniMP.js.map