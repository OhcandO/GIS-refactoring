"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[685],{3058:function(e,n,t){var o=t(1118),r=t(1376),c=t(1372),u=t(5783),i=t(4354),s=t(9039),a=t(7975),l=t(720);const g=new s.ZP({fill:new a.Z({color:"#eeeeee"})}),f=new c.Z({background:"#1a2b39",source:new u.Z({url:"https://openlayers.org/data/vector/ecoregions.json",format:new o.Z}),style:function(e){const n=e.get("COLOR")||"#eeeeee";return g.getFill().setColor(n),g}}),w=new r.Z({layers:[f],target:"map",view:new i.ZP({center:[0,0],zoom:1})}),Z=new c.Z({source:new u.Z,map:w,style:new s.ZP({stroke:new l.Z({color:"rgba(255, 255, 255, 0.7)",width:2})})});let p;const d=function(e){const n=w.forEachFeatureAtPixel(e,(function(e){return e})),t=document.getElementById("info");t.innerHTML=n&&n.get("ECO_NAME")||"&nbsp;",n!==p&&(p&&Z.getSource().removeFeature(p),n&&Z.getSource().addFeature(n),p=n)};w.on("pointermove",(function(e){if(e.dragging)return;const n=w.getEventPixel(e.originalEvent);d(n)})),w.on("click",(function(e){d(e.pixel)}))}},function(e){var n=function(n){return e(e.s=n)};n(9877),n(3058)}]);
//# sourceMappingURL=vector-layer.js.map