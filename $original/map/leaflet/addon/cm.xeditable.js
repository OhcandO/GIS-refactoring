var XEditGeomType,XEditMode,XObjStatus,_baseMap,edit_id_list,edit_select_id_list,edit_delete_id_list,edit_mode,edit_enable,edit_layer_index,edit_undoredo_buff,edit_undoredo_max,edit_undoredo_inx,_callback_EditDrawingStart,_callback_EditDrawingMove,_callback_EditDrawingEnd,_callback_EditDrawingCommit,_callback_EditDrawingCancel,_callback_EditCreated,_callback_EditDragStart,_callback_EditDrag,_callback_EditDragEnd,_callback_EditVertexDeleted,_callback_EditVertexDrag,_callback_EditVertexDragStart,_callback_EditVertexDragEnd;function OnEditDrawingCancel(Z0H){FUNC_DRAWING_CANCEL(Z0H);}function FUNC_DRAG(D0H){if(_callback_EditDrag!=null)_callback_EditDrag(D0H);}XEditGeomType={"Line":2,"Polygon":3,"Point":11,"IconPoint":12};XEditMode={"None":0,"Select":1,"DrawPoint":10,"DrawPolyline":11,"DrawPolygon":12,"DrawCircle":20,"DrawRect":21};function FUNC_DRAWING_COMMIT(g0H){if(_callback_EditDrawingCommit!=null)_callback_EditDrawingCommit(g0H);}XObjStatus={"None":0,"Select":1};function OnEditDrawingStart(E0H){FUNC_DRAWING_START(E0H);}_baseMap=null;function FUNC_DRAWING_MOVE(V0H){if(_callback_EditDrawingMove!=null)_callback_EditDrawingMove(V0H);}function OnEditDragEnd(C0H){FUNC_DRAG_END(C0H);}function FUNC_VERTEX_DRAG(T0H){if(_callback_EditVertexDrag!=null)_callback_EditVertexDrag(T0H);}EObj=function(j0H,M0H,h0H){if(h0H==undefined)h0H='A';this["layer_inx"]=j0H;this["id"]=M0H;this["status"]=h0H;};function OnEditDrag(r0H){FUNC_DRAG(r0H);}edit_id_list=[];edit_select_id_list=[];function FUNC_DRAG_START(f0H){if(_callback_EditDragStart!=null)_callback_EditDragStart(f0H);}function OnEditVertexDragStart(Y0H){FUNC_VERTEX_DRAG_START(Y0H);}edit_delete_id_list=[];function OnEditCreated(F0H){FUNC_CREATED(F0H);}function OnEditVertexDragEnd(a0H){FUNC_VERTEX_DRAG_END(a0H);}edit_mode=XEditMode["None"];function OnEditDrawingMove(q0H){FUNC_DRAWING_MOVE(q0H);}function FUNC_DRAWING_START(N0H){if(_callback_EditDrawingStart!=null)_callback_EditDrawingStart(N0H);}function FUNC_VERTEX_DRAG_END(Q0H){if(_callback_EditVertexDragEnd!=null)_callback_EditVertexDragEnd(Q0H);}edit_enable=false;function FUNC_DRAWING_CANCEL(b0H){if(_callback_EditDrawingCancel!=null)_callback_EditDrawingCancel(b0H);}edit_layer_index=-1;function FUNC_DRAWING_END(y0H){if(_callback_EditDrawingEnd!=null)_callback_EditDrawingEnd(y0H);}EPoint=function(d0H,w0H){this["lng"]=d0H;this["lat"]=w0H;};URInfo=function(){this["Status"];this["Type"];this["OBJ_ID"];this["CMV_ID"];this["Points"];};function FUNC_VERTEX_DELETED(l0H){if(_callback_EditVertexDeleted!=null)_callback_EditVertexDeleted(l0H);}function OnEditVertexDrag(n0H){FUNC_VERTEX_DRAG(n0H);}edit_undoredo_buff=[];edit_undoredo_max=0;function OnEditDrawingEnd(s0H){FUNC_DRAWING_END();}edit_undoredo_inx=-1;_callback_EditDrawingStart=null;_callback_EditDrawingMove=null;_callback_EditDrawingEnd=null;_callback_EditDrawingCommit=null;_callback_EditDrawingCancel=null;_callback_EditCreated=null;_callback_EditDragStart=null;_callback_EditDrag=null;_callback_EditDragEnd=null;function OnEditVertexDeleted(H0H){FUNC_VERTEX_DELETED(H0H);}_callback_EditVertexDeleted=null;function OnEditDragStart(t0H){FUNC_DRAG_START(t0H);}_callback_EditVertexDrag=null;_callback_EditVertexDragStart=null;_callback_EditVertexDragEnd=null;L["XEdit"]=L["Editable"]["extend"]({set_callback_drawing_start:function(e0H){_callback_EditDrawingStart=e0H;},set_callback_drawing_end:function(B0H){_callback_EditDrawingEnd=B0H;},set_callback_drawing_commit:function(J0H){_callback_EditDrawingCommit=J0H;},set_callback_drawing_cancel:function(K0H){_callback_EditDrawingCancel=K0H;},set_callback_drawing_move:function(L0H){_callback_EditDrawingMove=L0H;},set_callback_created:function(G0H){_callback_EditCreated=G0H;},set_callback_drag_start:function(z0H){_callback_EditDragStart=z0H;},set_callback_drag:function(x0H){_callback_EditDrag=x0H;},set_callback_drag_end:function(P0H){_callback_EditDragEnd=P0H;},set_callback_vertex_deleted:function(i0H){_callback_EditVertexDeleted=i0H;},set_callback_vertex_drag:function(o0H){_callback_EditVertexDrag=o0H;},set_callback_vertex_drag_start:function(A0H){_callback_EditVertexDragStart=A0H;},set_callback_vertex_drag_end:function(u0H){_callback_EditVertexDragEnd=u0H;},initialize:function(U0H){this["init"](U0H);},init:function(S0H){_baseMap=S0H;},start:function(){edit_mode=XEditMode["None"];edit_enable=true;_baseMap["on"]('editable:drawing:start',OnEditDrawingStart);_baseMap["on"]('editable:drawing:end',OnEditDrawingEnd);_baseMap["on"]('editable:drawing:commit',OnEditDrawingCommit);_baseMap["on"]('editable:drawing:cancel',OnEditDrawingCancel);_baseMap["on"]('editable:drawing:move',OnEditDrawingMove);_baseMap["on"]('editable:created',OnEditCreated);_baseMap["on"]('editable:dragstart',OnEditDragStart);_baseMap["on"]('editable:drag',OnEditDrag);_baseMap["on"]('editable:dragend',OnEditDragEnd);_baseMap["on"]('editable:vertex:deleted',OnEditVertexDeleted);_baseMap["on"]('editable:vertex:drag',OnEditVertexDrag);_baseMap["on"]('editable:vertex:dragstart',OnEditVertexDragStart);_baseMap["on"]('editable:vertex:dragend',OnEditVertexDragEnd);_baseMap["doubleClickZoom"]["disable"]();},end:function(){edit_mode=XEditMode["None"];edit_enable=false;_baseMap["off"]('editable:drawing:start',OnEditDrawingStart);_baseMap["off"]('editable:drawing:end',OnEditDrawingEnd);_baseMap["off"]('editable:drawing:commit',OnEditDrawingCommit);_baseMap["off"]('editable:drawing:cancel',OnEditDrawingCancel);_baseMap["off"]('editable:drawing:move',OnEditDrawingMove);_baseMap["off"]('editable:created',OnEditCreated);_baseMap["off"]('editable:dragstart',OnEditDragStart);_baseMap["off"]('editable:drag',OnEditDrag);_baseMap["off"]('editable:dragend',OnEditDragEnd);_baseMap["off"]('editable:vertex:deleted',OnEditVertexDeleted);_baseMap["off"]('editable:vertex:drag',OnEditVertexDrag);_baseMap["off"]('editable:vertex:dragstart',OnEditVertexDragStart);_baseMap["off"]('editable:vertex:dragend',OnEditVertexDragEnd);_baseMap["doubleClickZoom"]["enable"]();},set_tolerance:function(W0H){},set_edit_layer_index:function(v0H){edit_layer_index=v0H;},clear_edit_obj_list:function(){edit_id_list["length"]=0;edit_delete_id_list["length"]=0;},get_edit_obj_count:function(){return edit_id_list["length"];},get_edit_obj:function(X0H){if(X0H<0||X0H>=edit_id_list["length"])return null;return edit_id_list[X0H];},get_edit_obj_id:function(c0H){var h7H;if(c0H<0||c0H>=edit_id_list["length"])return-1;h7H=edit_id_list[c0H];return h7H["id"];},get_edit_obj_layer_index:function(j7H){var M7H;if(j7H<0||j7H>=edit_id_list["length"])return-1;M7H=edit_id_list[j7H];return M7H["layer_inx"];},get_delete_obj_count:function(){return edit_delete_id_list["length"];},get_delete_obj:function(d7H){if(d7H<0||d7H>=edit_delete_id_list["length"])return null;return edit_delete_id_list[d7H];},clear_select_obj_list:function(){edit_select_id_list["length"]=0;},get_select_obj_count:function(){return edit_select_id_list["length"];},get_select_obj_id:function(w7H){if(w7H<0||w7H>=edit_select_id_list["length"])return-1;return edit_select_id_list[w7H];},get_edit_enable_status:function(){return edit_enable;},get_edit_mode:function(){return edit_mode;},set_edit_mode:function(N7H){edit_mode=N7H;},set_object_status:function(y7H,g7H){if(g7H==XObjStatus["None"]){y7H["disableEdit"]();y7H["dragging"]["disable"]();}if(g7H==XObjStatus["Select"]){y7H["enableEdit"]();y7H["dragging"]["enable"]();}},get_object:function(f7H){var D7H,V7H;for(var b7H=0;b7H<edit_id_list["length"];b7H++){D7H=edit_id_list[b7H]["id"];for(var k7H in _baseMap["_layers"]){V7H=_baseMap["_layers"][k7H];if(V7H["obj_id"]==undefined)continue;if(V7H["obj_id"]==f7H)return V7H;}}return null;},set_delete_object_status:function(R7H,Q7H){var l7H,T7H;l7H=-1;for(var p7H=0;p7H<edit_delete_id_list["length"];p7H++){T7H=edit_delete_id_list[p7H]["id"];if(T7H==R7H){edit_delete_id_list[p7H]["status"]=Q7H;l7H=p7H;break;}}return l7H;},delete_object:function(m7H,q7H){var s7H,I7H,Z7H,O7H;s7H=-1;I7H=this["get_object"](m7H);if(I7H!=null){_baseMap["removeLayer"](I7H);}for(var E7H=0;E7H<edit_id_list["length"];E7H++){Z7H=edit_id_list[E7H]["id"];if(Z7H==m7H){s7H=E7H;if(q7H==true){O7H=this["set_delete_object_status"](m7H,'D');if(O7H==-1){edit_id_list[E7H]["status"]='D';edit_delete_id_list["push"](edit_id_list[E7H]);O7H=edit_delete_id_list["length"]-1;s7H=O7H;}}edit_id_list["splice"](E7H,1);break;}}return s7H;},delete_select_object:function(C7H){var t7H,r7H;t7H=-1;for(var F7H=0;F7H<edit_select_id_list["length"];F7H++){r7H=edit_select_id_list[F7H];if(r7H==C7H){edit_select_id_list["splice"](F7H,1);t7H=F7H;break;}}return t7H;},select_object:function(a7H){var e7H,H7H,n7H;edit_select_id_list[0]=-1;for(var Y7H=0;Y7H<edit_id_list["length"];Y7H++){e7H=edit_id_list[Y7H]["id"];H7H=this["get_object"](e7H);if(H7H==null)continue;if(H7H["obj_id"]==a7H){this["set_object_status"](H7H,XObjStatus["Select"]);edit_select_id_list[0]=a7H;if(H7H["options"]["type"]=='IconPoint'){n7H=L["divIcon"]({className:'leaflet-div-icon-edit-icon-select-red',iconSize:12});H7H["setIcon"](n7H);}}else{this["set_object_status"](H7H,XObjStatus["None"]);if(H7H["options"]["type"]=='IconPoint'){n7H=L["divIcon"]({className:'leaflet-div-icon-edit-icon-select-blue',iconSize:12});H7H["setIcon"](n7H);}}}return edit_select_id_list[0];},select_object_pt:function(G7H){var z7H,B7H,L7H,J7H;edit_select_id_list[0]=-1;for(var K7H=0;K7H<edit_id_list["length"];K7H++){z7H=edit_id_list[K7H]["id"];B7H=this["get_object"](z7H);if(B7H==null)continue;L7H=false;if(B7H["options"]["type"]=='IconPoint')L7H=B7H["isInLatLng"](G7H,B7H["_latlng"]);else L7H=B7H["isInLatLngs"](G7H,B7H["_latlngs"]);if(L7H==true){this["set_object_status"](B7H,XObjStatus["Select"]);edit_select_id_list[0]=B7H["obj_id"];if(B7H["options"]["type"]=='IconPoint'){J7H=L["divIcon"]({className:'leaflet-div-icon-edit-icon-select-red',iconSize:12});B7H["setIcon"](J7H);}}else{this["set_object_status"](B7H,XObjStatus["None"]);if(B7H["options"]["type"]=='IconPoint'){J7H=L["divIcon"]({className:'leaflet-div-icon-edit-icon-select-blue',iconSize:12});B7H["setIcon"](J7H);}}}return edit_select_id_list[0];},select_object_rect:function(x7H,P7H,i7H,o7H){},set_object_status_all_select:function(S7H){var U7H,u7H;for(var A7H=0;A7H<edit_id_list["length"];A7H++){U7H=edit_id_list[A7H]["id"];u7H=this["get_object"](U7H);if(u7H==null)continue;if(S7H==true){this["set_object_status"](u7H,XObjStatus["Select"]);}else{this["set_object_status"](u7H,XObjStatus["None"]);}}},add_point:function(W7H){var X7H,c7H,v7H,h2H;X7H=-1;if(_baseMap["options"]["editable"]==true&&edit_enable==true){if(W7H!=null){c7H=L["divIcon"]({className:'leaflet-div-icon-edit-icon-select-blue',iconSize:12});W7H["setIcon"](c7H);_baseMap["addLayer"](W7H);v7H=-1;if(W7H["obj_id"]==undefined){v7H=W7H["_leaflet_id"];W7H["obj_id"]=v7H;}else{v7H=W7H["obj_id"];}h2H=new EObj(edit_layer_index,v7H);edit_id_list["push"](h2H);this["set_delete_object_status"](v7H,'A');X7H=v7H;}}return X7H;},add_polyline:function(M2H){var d2H,j2H,w2H;d2H=-1;if(_baseMap["options"]["editable"]==true&&edit_enable==true){if(M2H!=null){_baseMap["addLayer"](M2H);j2H=-1;if(M2H["obj_id"]==undefined){j2H=M2H["_leaflet_id"];M2H["obj_id"]=j2H;}else{j2H=M2H["obj_id"];}w2H=new EObj(edit_layer_index,j2H);edit_id_list["push"](w2H);this["set_delete_object_status"](j2H,'A');d2H=j2H;}}return d2H;},add_polygon:function(y2H){var g2H,N2H,b2H;g2H=-1;if(_baseMap["options"]["editable"]==true&&edit_enable==true){if(y2H!=null){_baseMap["addLayer"](y2H);N2H=-1;if(y2H["obj_id"]==undefined){N2H=y2H["_leaflet_id"];y2H["obj_id"]=N2H;}else{N2H=y2H["obj_id"];}b2H=new EObj(edit_layer_index,N2H);edit_id_list["push"](b2H);this["set_delete_object_status"](N2H,'A');g2H=N2H;}}return g2H;},create_point:function(V2H){var k2H;if(_baseMap["options"]["editable"]==true&&edit_enable==true){if(V2H==undefined){V2H=L["divIcon"]({className:'leaflet-div-icon-edit-icon-blue',iconSize:18});}k2H=_baseMap["editTools"]["startMarker"](null,{icon:V2H,pane:'markerPane',type:'IconPoint'});return k2H;}},create_polyline:function(){var f2H;if(_baseMap["options"]["editable"]==true&&edit_enable==true){f2H=_baseMap["editTools"]["startPolyline"](null,{draggable:true,pane:'markerPane',type:'Line'});return f2H;}},create_polygon:function(){var D2H;if(_baseMap["options"]["editable"]==true&&edit_enable==true){D2H=_baseMap["editTools"]["startPolygon"](null,{draggable:true,pane:'markerPane',type:'Polygon'});return D2H;}},create_circle:function(){if(_baseMap["options"]["editable"]==true&&edit_enable==true){_baseMap["editTools"]["startCircle"]();}},create_rectangle:function(){if(_baseMap["options"]["editable"]==true&&edit_enable==true){_baseMap["editTools"]["startRectangle"]();}},stop_drawing:function(){if(_baseMap["options"]["editable"]==true&&edit_enable==true){_baseMap["editTools"]["stopDrawing"]();}},commit_drawing:function(){if(_baseMap["options"]["editable"]==true&&edit_enable==true){_baseMap["editTools"]["commitDrawing"]();}},clear_undo_redo_buffer:function(){edit_undoredo_buff["length"]=0;edit_undoredo_inx=-1;},get_undo_redo_max_count:function(){return edit_undoredo_max;},get_undo_redo_cur_pos:function(){return edit_undoredo_inx;},set_undo_redo_cur_pos:function(p2H){edit_undoredo_inx+=p2H;return edit_undoredo_inx;},set_undo_redo_data:function(l2H){if(edit_undoredo_max!=edit_undoredo_inx)edit_undoredo_max=edit_undoredo_inx+1;edit_undoredo_max++;edit_undoredo_inx++;edit_undoredo_buff[edit_undoredo_inx]=l2H;},get_undo_data:function(){if(edit_undoredo_inx<0){return null;}return edit_undoredo_buff[edit_undoredo_inx];},pop_undo_data:function(){if(edit_undoredo_inx<0){return null;}return edit_undoredo_buff[edit_undoredo_inx--];},get_redo_data:function(){edit_undoredo_inx++;if(edit_undoredo_inx>=edit_undoredo_max){edit_undoredo_inx=edit_undoredo_max-1;return null;}return edit_undoredo_buff[edit_undoredo_inx--];},pop_redo_data:function(){edit_undoredo_inx++;if(edit_undoredo_inx>=edit_undoredo_max){edit_undoredo_inx=edit_undoredo_max-1;return null;}return edit_undoredo_buff[edit_undoredo_inx];}});function OnEditDrawingCommit(O0H){var m0H,I0H;m0H=O0H["layer"]["_leaflet_id"];O0H["layer"]["obj_id"]=m0H;I0H=new EObj(edit_layer_index,m0H);edit_id_list["push"](I0H);FUNC_DRAWING_COMMIT(O0H);}function FUNC_VERTEX_DRAG_START(R0H){if(_callback_EditVertexDragStart!=null)_callback_EditVertexDragStart(R0H);}function FUNC_CREATED(k0H){if(_callback_EditCreated!=null)_callback_EditCreated(k0H);}function FUNC_DRAG_END(p0H){if(_callback_EditDragEnd!=null)_callback_EditDragEnd(p0H);}L["xedit"]=function(){return new L["XEdit"]();};