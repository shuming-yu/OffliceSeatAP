import{W as g,X as f,Y as h,$ as i,f as n,Z as o}from"./index.8c1d4cf4.js";import{Q as u}from"./QPage.43b54d40.js";import{s as _,a as c}from"./transform.5de4e090.js";var m="/OffliceSeatAP/dist/assets/cell.e4ae8588.svg";const v={class:"row q-gutter-sm q-pa-sm justify-center"},w=i("div",{id:"warpper"},null,-1),B=Object.assign({name:"PanelPage"},{__name:"PanelPage",setup(P){function s(){let e=c("#canvas");return e.empty()&&(e=c("#warpper").append("svg").attr("width",1600).attr("height",900).attr("id","canvas")),e}function d(){let e=s(),t=60,l=40;for(let a=0;a<5;a++)for(let r=0;r<5;r++)e.append("rect").attr("x",10+r*t).attr("y",10+a*l).attr("width",t).attr("height",l).attr("fill","#eee").attr("stroke","#000")}function p(){let e=s();_(m).then(t=>{e.node().appendChild(t.documentElement)})}return(e,t)=>(g(),f(u,null,{default:h(()=>[i("div",v,[n(o,{label:"Draw",color:"negative","no-caps":"",onClick:d}),n(o,{label:"Add Cell",color:"negative","no-caps":"",onClick:p})]),w]),_:1}))}});export{B as default};