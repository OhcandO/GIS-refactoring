"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[3062],{9595:function(e,t,n){var o=n(9039),r=n(7138),i=n(7975),s=n(1376),c=n(4354),a=n(2739),l=n(492),p=n(9847),u=n(5783),d=n(5469),w=n(2010),f=n(1372);(0,n(2810).eL)();const m=[-110,45],g=new d.Z(m),h=new s.Z({target:"map",view:new c.ZP({center:m,zoom:8}),layers:[new w.Z({source:new p.Z}),new f.Z({source:new u.Z({features:[new a.Z(g)]}),style:new o.ZP({image:new r.Z({radius:9,fill:new i.Z({color:"red"})})})})]}),Z=document.getElementById("popup"),v=new l.Z({element:Z,positioning:"bottom-center",stopEvent:!1,offset:[0,-10]});function y(e){return`\n    <table>\n      <tbody>\n        <tr><th>lon</th><td>${e[0].toFixed(2)}</td></tr>\n        <tr><th>lat</th><td>${e[1].toFixed(2)}</td></tr>\n      </tbody>\n    </table>`}h.addOverlay(v);const b=document.getElementById("info");h.on("moveend",(function(){const e=h.getView().getCenter();b.innerHTML=y(e)})),h.on("click",(function(e){$(Z).popover("dispose");const t=h.getFeaturesAtPixel(e.pixel)[0];if(t){const n=t.getGeometry().getCoordinates();v.setPosition([n[0]+360*Math.round(e.coordinate[0]/360),n[1]]),$(Z).popover({container:Z.parentElement,html:!0,sanitize:!1,content:y(n),placement:"top"}),$(Z).popover("show")}})),h.on("pointermove",(function(e){h.hasFeatureAtPixel(e.pixel)?h.getViewport().style.cursor="pointer":h.getViewport().style.cursor="inherit"}))}},function(e){var t=function(t){return e(e.s=t)};t(9877),t(9595)}]);
//# sourceMappingURL=geographic.js.map