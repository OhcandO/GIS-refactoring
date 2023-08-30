

OpenLayers.DOTS_PER_INCH=96;
var ngii_wmts = {};
var mnStatLayerList = {};
var mnStatLayerWmsList = {}; 
//var geoserverWmsUrl ="http://192.168.100.13:8080/geoserver/wms";
var geoserverWmsUrl ="http://210.117.198.92:8080/geoserver/wms";
//var geoserverWmsUrl ="http://nlsp2:8083/geoserver/wms";
var nlspAddr = "http://stat.ngii.go.kr/";
//var nlspAddr = "http://nlsp1:8080/";
ngii_wmts.version = "1.0";
ngii_wmts.util = {};
ngii_wmts.air_year=[];
ngii_wmts.util.dotGubun = function(value){
	dotStr = value.split(".");
	if (dotStr.length == 2) {
		var commaVal = ngii_wmts.util.setComma(dotStr[0]);
		commaVal = commaVal + "." + dotStr[1];
	} else {
		commaVal = ngii_wmts.util.setComma(dotStr[0]);
	}
	return commaVal;
};
ngii_wmts.util.setComma = function(value){ 
	var temp_str = String(value);
	for(var i = 0 , retValue = String() , stop = temp_str.length; i < stop ; i++)
		retValue = ((i%3) == 0) && i != 0 ? temp_str.charAt((stop - i) -1) + "," + retValue : temp_str.charAt((stop - i) -1) + retValue; 
	return retValue; 
};
ngii_wmts.util.fillzero = function(n, digits) { 
	var zero = '';
	n = n.toString();
	if (digits > n.length) {
		for (var i = 0; digits - n.length > i; i++) {
			zero += '0';
		}
	}
	return zero + n;
};
ngii_wmts.util.to_charFM = function(strNum, jarisu, fillChar){
	if(!fillChar)fillChar = "0";
   	var intNum = 0;
   	try {intNum = parseInt(strNum);}catch(e){return strNum;}
   	strNum = intNum+"";
   	var strNumLength = strNum.length;
   	for (var i = 0; i < jarisu-strNumLength; i++) {
   		strNum = fillChar+strNum;
	}
   	return strNum;
};
ngii_wmts.util.objMap = function(key, val){
	this.key = key;
	this.val = val;
};
ngii_wmts.mapIndex = 0;
ngii_wmts.mapObjects = [];
ngii_wmts.findMapObject = function(index){
	for(var i=0;i<ngii_wmts.mapObjects.length;i++){
		if(ngii_wmts.mapObjects[i].key==index)return ngii_wmts.mapObjects[i].val;
	}
};
ngii_wmts.map = function(objId, options){
	if(!objId||typeof objId!="string")return;
	var mapObj = document.getElementById(objId);
	var ngiiMap = this;
	var properties = ngii_wmts.map.properties;
	
	var mapMode = 0;
	var airMapLogCk = true;
	var initCenter = properties.initCenter;
	var initZoom = properties.initZoom;
	var initLayers = [];

	for(var i=0;i<properties.tileUrls.length;i++){
	//	initLayers.push(new OpenLayers.Layer.WMTS(properties.tileNames_en[i],properties.tileUrls[i], properties.wmtEmapOption));
        initLayers.push(new OpenLayers.Layer.WMTS($.extend({},properties.wmtEmapOption,{name:'TMS Layer',layer:'korean_map'})));
        initLayers.push(new OpenLayers.Layer.WMTS($.extend({},properties.wmtEmapOption,{name:'TMS Layer',layer:'color_map'})));
        initLayers.push(new OpenLayers.Layer.WMTS($.extend({},properties.wmtEmapOption,{name:'TMS Layer',layer:'lowV_map'})));
        initLayers.push(new OpenLayers.Layer.WMTS($.extend({},properties.wmtEmapOption,{name:'TMS Layer',layer:'english_map'})));
        initLayers.push(new OpenLayers.Layer.WMTS($.extend({},properties.wmtEmapOption,{name:'TMS Layer',layer:'white_map'})));
        initLayers.push(new OpenLayers.Layer.WMTS($.extend({},properties.wmtEmapOption,{name:'TMS Layer',layer:'chinese_map'})));
        initLayers.push(new OpenLayers.Layer.WMTS($.extend({},properties.wmtEmapOption,{name:'TMS Layer',layer:'japanese_map'})));
        initLayers.push(new OpenLayers.Layer.WMTS($.extend({},properties.wmtEmapOption,{name:'TMS Layer',layer:'white_edu_map'})));
        initLayers.push(new OpenLayers.Layer.WMTS($.extend({},properties.wmtEmapOption,{name:'TMS Layer',layer:'base_hd'})));

	}
   // initLayers.push(new OpenLayers.Layer.XYZ("TMS Layer_2015","http://openapi.ngii_wmts.go.kr:81/tilemap/2015/", properties.airLayerOptions));
    
    
	initLayers.push(new OpenLayers.Layer.WMTS($.extend({},properties.airWMTSLayerOptions2,{name:'AIRPHOTO',layer:'AIRPHOTO'})));
	

	var initControls = [];
	
	if(options){
		if(options.mapMode){
			mapMode = options.mapMode;
			delete options.mapMode;
		}
		if(options.center){
			initCenter = options.center;
			delete options.center;
		}
		if(options.zoom){
			initZoom = options.zoom;
			delete options.zoom;
		}
		if(options.layers){
			for(var i=0;i<options.layers.length;i++){
				initLayers.push(options.layers[i]);
			}
			delete options.layers;
		}
		if(options.controls){
			for(var i=0;i<options.controls.length;i++){
				initControls.push(options.controls[i]);
			}
			delete options.controls;
		}
	}

    var initOptions = {
        controls: [],
       // layers:[initLayers],
        projection: new OpenLayers.Projection('EPSG:5179'),
        displayProjection: new OpenLayers.Projection('EPSG:4326'),
        units: 'm',

		maxExtent :  new OpenLayers.Bounds(705680.0000, 1349270.0000,
				1388291.0000, 2581448.0000),
        maxResolution: 2088.96,
        numZoomLevels: 14,
        center: new OpenLayers.LonLat(960363.60652286, 1920034.9139856),
        zoom: 0
    };
	initOptions = $.extend({}, initOptions, options);
	var map = new OpenLayers.Map(objId,initOptions);

	var mapIndex = ngii_wmts.mapIndex++;
	ngii_wmts.mapObjects.push(new ngii_wmts.util.objMap(mapIndex, this));
    map.addLayers(initLayers);
	map.setBaseLayer(initLayers[mapMode]);
	map.setCenter(initCenter, initZoom);

	this._getAirMapList = function(){
		if(ngii_wmts.air_year.length == 0){
			//시계열
			var param = {
					TYPE: "STORE",
					API: "WMTS",
					REQUEST: "LIST"
				};
		
			$.ajax({
				type : "POST",
				url : "http://210.117.198.120:8081/o2map/admin",
				data : param,
				async: false,
				dataType : "json"
			}).done(function(result) {
				if(result.SUCCESS == true){
					var table_text = "";
					engineResult = result.RESULT;
					for(var i=0 ;engineResult.length > i ;i++ ){
						if(engineResult[i].ACTIVATE && engineResult[i].NAME != 'AIRPHOTO'){
							ngii_wmts.air_year.push(engineResult[i].NAME);
							   var wmts_year = "";
                     			if(2019 > parseInt(engineResult[i].NAME.split("_")[1])){ // 51센치
                        			wmts_year = new OpenLayers.Layer.WMTS($.extend({},properties.airWMTSLayerOptions,{layer:engineResult[i].NAME,name:engineResult[i].NAME}));
                     			} else { // 25센치
                        			wmts_year = new OpenLayers.Layer.WMTS($.extend({},properties.airWMTSLayerOptions2,{layer:engineResult[i].NAME,name:engineResult[i].NAME}));
                     			}
							this.addLayer(wmts_year);
						}
					}
				}
				
			}.bind(this));
		}
		return ngii_wmts.air_year;
	};
	
	function airMapApiUseLog(){
		$.ajax({
				type : "GET",
				url : ngii_wmts.map.properties.emapUrl+ "/openapi/airMapApiUseLog.do",
				data : {apikey : ngii_wmts.map.apikey},
				dataType : "json",
				success: function(data){
					airMapLogCk = false;
				}
			});
	}
	
	this._getMap = function(){
		return map;
	};
	this._setMapMode = function(mode){
		mapMode = mode;

		if(airMapLogCk && mapMode == 9){
			airMapApiUseLog();
		}
		map.setBaseLayer(map.layers[mode]);

	};
	this._setAirMapYear = function(name){
		
		
		mapMode = 9;
		
		if(airMapLogCk && mapMode == 9){
			airMapApiUseLog();
		}
		
		var airYearlayer=map.getLayersByName(name);
		if(airYearlayer.length > 0){
			map.setBaseLayer(airYearlayer[0]);
		}

	};
	this._getMapMode = function(){
		return mapMode;
	};
	this._addDefaultMapModeBox = function(options){
		mapObj.style.position = "relative";
		var boxId = "ngiimap_mapmodebox_"+mapIndex;
		var boxClass = "ngiimap_mapmodebox";
		var boxObj= document.getElementById(boxId);
		
		if(!boxObj){
			var tileNames_ko = ngii_wmts.map.properties.tileNames_ko;
			boxObj = document.createElement("div");
			boxObj.id=boxId;
			boxObj.className = boxClass;
			boxObj.style.width="230px";
			boxObj.style.height="105px";
			boxObj.style.position="absolute";
			boxObj.style.top="35px";
			boxObj.style.right="15px";
			boxObj.style.zIndex="1000000";
			var emapUrl = ngii_wmts.map.properties.emapUrl;
			var chkdHtml = mapMode==0?"chkd_":"";
			var html="<div style=\"width:56px;height:52px;float:left;\">";
			html+="<a href=\"javascript:ngii_wmts.findMapObject("+mapIndex+")._setMapMode(0);ngii_wmts.map.mapModeBoxClick('"+boxId+"', 0);\" title=\""+tileNames_ko[0]+"\">";
			html+="<img src=\""+emapUrl+"/images/design/btCircle_"+chkdHtml+"off_01.png\" onmouseover=\"this.src=this.src.replace('_off','_on')\" onmouseout=\"this.src=this.src.replace('_on','_off')\" border=\"0\"/></a>";
			html+="</div>";
			chkdHtml = mapMode==1?"chkd_":"";
			html+="<div style=\"width:56px;height:52px;float:left;\">";
			html+="<a href=\"javascript:ngii_wmts.findMapObject("+mapIndex+")._setMapMode(1);ngii_wmts.map.mapModeBoxClick('"+boxId+"', 1);\" title=\""+tileNames_ko[1]+"\">";
			html+="<img src=\""+emapUrl+"/images/design/btCircle_"+chkdHtml+"off_02.png\" onmouseover=\"this.src=this.src.replace('_off','_on')\" onmouseout=\"this.src=this.src.replace('_on','_off')\" border=\"0\"/></a>";
			html+="</div>";
			chkdHtml = mapMode==2?"chkd_":"";
			html+="<div style=\"width:56px;height:52px;float:left;\">";
			html+="<a href=\"javascript:ngii_wmts.findMapObject("+mapIndex+")._setMapMode(2);ngii_wmts.map.mapModeBoxClick('"+boxId+"', 2);\" title=\""+tileNames_ko[2]+"\">";
			html+="<img src=\""+emapUrl+"/images/design/btCircle_"+chkdHtml+"off_03.png\" onmouseover=\"this.src=this.src.replace('_off','_on')\" onmouseout=\"this.src=this.src.replace('_on','_off')\" border=\"0\"/></a>";
			html+="</div>";
			chkdHtml = mapMode==4?"chkd_":"";
			html+="<div style=\"width:56px;height:52px;float:left;\">";
			html+="<a href=\"javascript:ngii_wmts.findMapObject("+mapIndex+")._setMapMode(4);ngii_wmts.map.mapModeBoxClick('"+boxId+"', 4);\" title=\""+tileNames_ko[4]+"\">";
			html+="<img src=\""+emapUrl+"/images/design/btCircle_"+chkdHtml+"off_05.png\" onmouseover=\"this.src=this.src.replace('_off','_on')\" onmouseout=\"this.src=this.src.replace('_on','_off')\" border=\"0\"/></a>";
			html+="</div>";
			chkdHtml = mapMode==3?"chkd_":"";
			html+="<div style=\"width:56px;height:52px;float:left;\">";
			html+="<a href=\"javascript:ngii_wmts.findMapObject("+mapIndex+")._setMapMode(3);ngii_wmts.map.mapModeBoxClick('"+boxId+"', 3);\" title=\""+tileNames_ko[3]+"\">";
			html+="<img src=\""+emapUrl+"/images/design/btCircle_"+chkdHtml+"off_04.png\" onmouseover=\"this.src=this.src.replace('_off','_on')\" onmouseout=\"this.src=this.src.replace('_on','_off')\" border=\"0\"/></a>";
			html+="</div>";
			chkdHtml = mapMode==5?"chkd_":"";
			html+="<div style=\"width:56px;height:52px;float:left;\">";
			html+="<a href=\"javascript:ngii_wmts.findMapObject("+mapIndex+")._setMapMode(5);ngii_wmts.map.mapModeBoxClick('"+boxId+"', 5);\" title=\""+tileNames_ko[5]+"\">";
			html+="<img src=\""+emapUrl+"/images/design/btCircle_"+chkdHtml+"off_06.png\" onmouseover=\"this.src=this.src.replace('_off','_on')\" onmouseout=\"this.src=this.src.replace('_on','_off')\" border=\"0\"/></a>";
			html+="</div>";
			chkdHtml = mapMode==6?"chkd_":"";
			html+="<div style=\"width:56px;height:52px;float:left;\">";
			html+="<a href=\"javascript:ngii_wmts.findMapObject("+mapIndex+")._setMapMode(6);ngii_wmts.map.mapModeBoxClick('"+boxId+"', 6);\" title=\""+tileNames_ko[6]+"\">";
			html+="<img src=\""+emapUrl+"/images/design/btCircle_"+chkdHtml+"off_07.png\" onmouseover=\"this.src=this.src.replace('_off','_on')\" onmouseout=\"this.src=this.src.replace('_on','_off')\" border=\"0\"/></a>";
			html+="</div>";
			chkdHtml = mapMode==7?"chkd_":"";
			html+="<div style=\"width:56px;height:52px;float:left;\">";
			html+="<a href=\"javascript:ngii_wmts.findMapObject("+mapIndex+")._setMapMode(7);ngii_wmts.map.mapModeBoxClick('"+boxId+"', 7);\" title=\""+tileNames_ko[7]+"\">";
			html+="<img src=\""+emapUrl+"/images/design/btCircle_"+chkdHtml+"off_08.png\" onmouseover=\"this.src=this.src.replace('_off','_on')\" onmouseout=\"this.src=this.src.replace('_on','_off')\" border=\"0\"/></a>";
			html+="</div>";
			boxObj.innerHTML = html;
			mapObj.appendChild(boxObj);
		}
		if(options){
			if(options.top){
				boxObj.style.top=options.top;boxObj.style.bottom="";
			}
			if(options.bottom){
				boxObj.style.bottom=options.bottom;boxObj.style.top="";
			}
			if(options.left){
				boxObj.style.left=options.left;boxObj.style.right="";
			}
			if(options.right){
				boxObj.style.right=options.right;boxObj.style.left="";
			}
		}
	};
	
	/** 현재맵의 설정을 대상맵에 일치시킨다. */
	this._synchronize = function(toMaps){
		var zoom = map.getZoom();
		var center = map.getCenter();
		for(var i=0;i<toMaps.length;i++){
			toMaps[i].setCenter(center, zoom);
		}
	};
	/** 대상맵의 설정을 현재맴에 일치시킨다. */
	this._synchronizeWith = function(fromMap){
		map.setCenter(fromMap.getCenter(), fromMap.getZoom());
	};
	/** 지도상의 팝업을 모두 제거한다. */
	this._clearPopup = function(){
		try { 
			for ( var i = 0; i < map.popups.length; i++) {
				var tmpPop = map.popups[i];
				map.removePopup(tmpPop);
				tmpPop.destroy();
				i--;
			}
		} catch (e) {
		}
	};
	
	//도엽레이어 생성시 추가.
    this._gfn_add_wms=function(mapObj) {
    	
    	var layer = new OpenLayers.Layer.WMS(
    			"WmsLayer",
    			"http://210.117.198.32:6080/arcgis/services/NGII_INDEXMAP_ORDER_SDE/MapServer/WmsServer",
    			{
    				layers : mapObj,
    				styles : "",
    				format : "image/png",
    				exceptions : "text/xml",
    				version : "1.3.0",
    				crs : "EPSG:0",
    				transparent : true
    			},
    			{
    				singleTile : true,
    				transitionEffect: 'resize',
    				opacity: 0.5,
    				ratio : 1,
    				yx : {'EPSG:0' : true}
    			}
    	);
    	map.addLayer(layer);
    };
    
    //구지도 통판 레퍼런스 추가.
    this._gfn_add_oldmap_wms=function() {
    	
    	var oldlayer = new OpenLayers.Layer.WMS(
    			"WmsLayer",
    			"http://210.117.198.32:6080/arcgis/rest/services/OLDMAP/MapServer/export",
    			{
    				FORMAT:'png',
					LAYERS:'show:1',
					F:'image',
					BBOXSR:'5179',
					IMAGESR:'5179',
					SIZE:'256,256',
    				transparent : true
    			}
    	);
    	map.addLayer(oldlayer);
    };
	
	//해당 위치의 포인트로 이동.
    this._showpoint = function(lon, lat, zoom) {
		var that = this;
		//	that.layer.removeAllFeatures();
			var point = new OpenLayers.Geometry.Point(lon, lat);
		//	point.transform(EPSG4326, EPSG5179);
			var feature = new OpenLayers.Feature.Vector(point);
			feature.attributes["externalGraphic"] ="http://localhost:8090/img/btn_pin_green.png";
		//	that.vlayer.addFeatures(feature);
			that.getLayersByName('locSearch')[0].addFeatures(feature);
			map.setCenter(new OpenLayers.LonLat(point.x, point.y), zoom);
		};
			this._showcircle_len = function (lon, lat, len){
		var that = this;
		//that.layer.removeAllFeatures();
		var point = new OpenLayers.Geometry.Point(lon, lat);
		
		var mycircle = OpenLayers.Geometry.Polygon.createRegularPolygon(
		               new OpenLayers.Geometry.Point(lon,lat),
		               len,
		               40
		               
		           );
		 var bounds  = mycircle.getBounds();

		
		var feature = new OpenLayers.Feature.Vector(mycircle);
		that.getLayersByName('locSearch')[0].addFeatures(feature);
		//map.setCenter(new OpenLayers.LonLat(point.x, point.y), 12);
		map1.zoomToExtent(bounds);
	};
	ngii_wmts.nlipVector = OpenLayers.Class(OpenLayers.Layer.Vector, {

	/**********************************************************************
 		동적 변수를 적용한 도형 스타일의 실제 스타일을 반환
 	***********************************************************************/
	parseStyle : function(feature, style) {
		// don't try to draw the feature with the renderer if the layer is not 
	    // drawn itself

	    if (typeof style != "object") {
	        if(!style && feature.state === OpenLayers.State.DELETE) {
	            style = "delete";
	        }
	        var renderIntent = style || feature.renderIntent;
	        style = feature.style || this.style;
	        if (!style) {
	            style = this.styleMap.createSymbolizer(feature, renderIntent);
	        }
	    }

		return style;
	},
	
	CLASS_NAME: "nlipVector"
});
	    this._gfn_add_vector=function() {
    	
    	var vlayer = new ngii_wmts.nlipVector("locSearch", {
			styleMap : new OpenLayers.StyleMap({
				'default': new OpenLayers.Style(null, {
					rules: [new OpenLayers.Rule({
						symbolizer : {
							"Point": {
								graphicOpacity : 1,
								externalGraphic : "${externalGraphic}",
								graphicWidth : 32,
								graphicHeight :  26
							},
							"Line": {
								strokeWidth: 3,
								strokeOpacity: 0.7,
								strokeColor: "#ff0000"
							},
							"Polygon": {
								strokeWidth: 3,
								strokeOpacity: 0.7,
								strokeColor: "#ff0000",
								fillColor: "#ff0000",
								fillOpacity: 0.3
							}
						}
					})]
				})
			})
		});
    	map.addLayer(vlayer);
    };
	
    
	map.addControl(new OpenLayers.Control.Navigation({dragPanOptions: {enableKinetic: false}}));
	map.addControl(new OpenLayers.Control.Attribution({	separator : " "	}));
	
	$(".olControlAttribution").css("bottom", "20px");
	$(".olControlAttribution").css("left", "16px");
	
	var controls = [];
	this._addControl = function(key, control){
		var obj = new ngii_wmts.util.objMap(key, control);
		controls.push(obj);
		map.addControl(control);
	};
	this._getControl = function(key){
		for(var i=0;i<controls.length;i++){
			if(controls[i].key == key)return controls[i].val;
		}
	};
	/** 키값을 가지고 대상 컨트롤을 활성화한다. */
	this._mapControl = function(key) {
		for(var i=0;i<controls.length;i++){
			controls[i].val.deactivate();
		}
		ngiiMap._clearPopup();
		var control = ngiiMap._getControl(key);
		if(control)
		control.activate();
	};
	
	//통계지도호출함수.
    this._mnStatLayerListSwitcher=function(lyrId, code, params){
    	 mnStatLayerList = {};
    	for (var i in mnStatLayerList) {
    		mnStatLayerList[i].setVisibility(false);
    	}
    	if (!mnStatLayerList[lyrId]) {
    		mnStatLayerListCreate(lyrId, code, params);
    	}
    	
    	//if(Object.keys(mnStatLayerList).length != 0)
    	//mnStatLayerList[lyrId].setVisibility(true);
    };
    
    function mnStatLayerListCreate(lyrId, code, params) {
		var codeType="";
		var viewparam="";
  		var param="";
  		
		if(code.length==2){
   			codeType = code.substring(0, 2); //행정코드값을 2자리로 자름.
		}
		else{
   			codeType = code.substring(0, 5); //행정코드값을 5자리로 자름.
		}
		
		var lyrCode = Number(lyrId.substr(0,3)), cqlFilter = '';
		var dataType;
		var ImgUrl;
		var wmsOptions="";
  
		if(lyrId.substr(3,3) == "060"){ // 국토지표
		
			//viewparam = 'lyr:'+lyrId+';'+'sig:'+codeType;
			datatype="plcy";
			
			sggscode = (sggscode=="0" ? '%' : params.sigCd);
			//if(sggscode=="0"){
			//	sggscode ='%'
			//}
			param ='L:'+params.data.itemMap.lrgeCd+';'+'s:'+params.data.itemMap.lyrCode+';'+'y:'+params.year+';'+'sig:'+sggscode+';'+'c:'+params.data.itemMap.lyrNm;
			ImgUrl = nlspAddr + 'mn/plcyImage.do?tableCode='+lyrId+'&cyCle='+params.cyCle+'&type='+params.type+'&arrColor='+params.arrColor+'&legendValue='+params.legendValue1+'&year='+params.year+'&middlcd='+params.data.itemMap.middlCd+'&sigCd='+sggscode+'&clear='+params.clear;
			
			// 030 격자, 002 격자아님
			if(lyrId.substr(0,3)=="002"){
				wmsOptions = {
		        	service: 'WMS',
		            version: '1.1.0',
		            request: 'GetMap',
		            layers: 'nlsp:plcy_sgg',
		            format: 'image/png',
		            transparent: 'true',
		            exceptions: 'BLANK',
		            format_options : 'antialias:text',
		            info_format: 'application/json',
		            viewparams: param,
		            crs: "EPSG:5179",
		            sld_body : params.data.sldBody
		        };
		        
		        mnStatLayerWmsList[lyrId+"_"+sggscode] = new OpenLayers.Layer.WMS(
		            'vl',
		            geoserverWmsUrl,
		            wmsOptions,
		            {
		                visibility: true,
		                singleTile: true,
		                buffer: 0,
		                ratio: 1,
		                isBaseLayer: false,
		                yx: {'EPSG:5179':true},
		                tileOptions:{maxGetUrlLength: 2048}
		            }
		        );
		
		        map.addLayer(mnStatLayerWmsList[lyrId+"_"+sggscode]);
			}else{
				mnStatLayerList[lyrId+"_"+sggscode] = new OpenLayers.Layer.Image(
		        'vl_img',
		        ImgUrl.replace(/#/gi, "%23"),
		    	new OpenLayers.Bounds(700000,1300000,1400000,2100000),
			        new OpenLayers.Size(700,800),
			        {
			            isBaseLayer	:false,
			            visibility: true,
			            projection: new OpenLayers.Projection("EPSG:5179"),
			            opacity:1,
			            sld_body : params.data.sldBody,
			            displayProjection : new OpenLayers.Projection("EPSG:5179"),
	                    minResolution: 10
			        }
			    );
			    
			    
			    mnStatLayerList[lyrId+"_"+sggscode].div.style.imageRendering='pixelated';
			    mnStatLayerList[lyrId+"_"+sggscode].div.id='plcy';
	
			    wmsOptions = {
			            service: 'WMS',
			            version: '1.1.0',
			            request: 'GetMap',
			            layers: 'nlsp:plcy_grid',
			            format: 'image/png',
			            transparent: 'true',
			            exceptions: 'BLANK',
			            format_options : 'antialias:text',
			            info_format: 'application/json',
			            viewparams: param,
			          //SIGCD :sigCd,
	                	SRS: "EPSG:5179",
			            sld_body : //encodeURI(
			            params.data.sldwmsBody,
	                	sld_body_grid : params.data.sldBody,
			        };
	
			    mnStatLayerWmsList[lyrId+"_"+sggscode] = new OpenLayers.Layer.WMS(
			        'vl',
			        geoserverWmsUrl,
			        wmsOptions,
			        {
			            visibility: true,
			            singleTile: true,
			            buffer: 0,
			            ratio: 1,
			            isBaseLayer: false,
			            yx: {'EPSG:5179':true},
			            maxResolution: 9,
			            tileOptions:{maxGetUrlLength: 2048}
			        }
			    );
			    //IE (image-rendering = pixcelate 추가)
			    map.addLayer(mnStatLayerList[lyrId+"_"+sggscode]);
			    map.addLayer(mnStatLayerWmsList[lyrId+"_"+sggscode]);
			    $("#plcy").find('img').css("-ms-interpolation-mode","nearest-neighbor");
			    
			    map.events.register('zoomend', map, function() {
			    	$("#plcy").find('img').css("-ms-interpolation-mode","nearest-neighbor");
			    });
			    
			}
			
		    
		} else{ // 인구 건물 토지 기존로직. wmts옵션만 수정.
			if(lyrCode == 1){ // 시도 (001)
			   cqlFilter = 'ctprvn_cd = \''+codeType.substring(0,2)+'\'';
			}else if(lyrCode == 2){ // 시군구 (002)
			   if(codeType.length === 5 && codeType.lastIndexOf('0') !== -1){ // 구제시 처리
			      codeType = codeType.substring(0,4) + '_';
			   }
			   cqlFilter = 'sig_cd LIKE \''+codeType+'\'';
			}else if((lyrCode >= 3 && lyrCode <= 17) || (lyrCode >= 24 && lyrCode <= 28)){ // 시군구,읍면동,리,권역 (002 ~ 016) 용도지역 (024 ~ 028)
			   if(codeType.length === 5 && codeType.lastIndexOf('0') !== -1){ // 구제시 처리
			      codeType = codeType.substring(0,4) + '_';
			   }
			   cqlFilter = 'match_sig_cd LIKE \''+codeType+'\'';
			}else if((lyrCode >= 18 && lyrCode <= 21) || (lyrCode >= 30 && lyrCode <= 31)){ // 격자 (018 ~ 021) (030~031)
			   codeType = codeType.substring(0,5);
			   cqlFilter = 'INTERSECTS(geom,querySingle(\'tl_scco_sig\',\'geom\',\'sig_cd='+codeType+'\'))';
			}
			
			dataType = 'vl_blk';
			var style = "";
			if(params.data.charts.codeCheck == "0") {
				style = lyrId;
			}
			mnStatLayerList[lyrId] = {};
			mnStatLayerList[lyrId] = new OpenLayers.Layer.WMS(
				'nlsp:'+lyrId,
				geoserverWmsUrl,
				{
					service: 'WMS',
					version: '1.1.0',
					request: 'GetMap',
					layers		: dataType,
					format: 'image/png',
					transparent: 'true',
					exceptions: 'BLANK',
					viewparams	: 'lyr:'+lyrId+';'+'sig:'+(codeType=="0" ? '%' : codeType)+ ';mnt:'+params.year,
					info_format: 'application/json',
					crs: "EPSG:5179",
					//SIGCD 		: "2623",
					styles :  style,
					SIGCD 		: params.sigCd,
					sld_body : params.data.sldBody
				},
				{
					visibility	: true, 
					singleTile	: true,
					buffer		: 0,
					ratio		: 1,
					isBaseLayer : false,
					yx			: {'EPSG:5179':true},
					tileOptions : {maxGetUrlLength: 2048}
				}
			);
			
			map.addLayer(mnStatLayerList[lyrId]);
			
			mnStatLayerList[lyrId].setVisibility(true);
		}	

    }
    
    //수치지도 도엽인덱스
    this._gfn_add_arcgis=function(mapObj) {
	var boundaryLayer = new OpenLayers.Layer.ArcGIS93Rest("boundaryLayer",
		    "http://210.117.198.32:6080/arcgis/rest/services/NGII_INDEXMAP_ORDER_SDE/MapServer/export/", 
		    
		    {
			  layers: 'show:'+mapObj,
			  transparent: true,
			  
		        srs:"EPSG:5179"
		    
		    },
		    {
		   	maxExtent: new OpenLayers.Bounds(705680.0000, 1349270.0000, 1388291.0000, 2581448.0000),
		   	projection: new OpenLayers.Projection("EPSG:5179"),
		    	isBaseLayer: false,   
		    	extractAttributes: false,
		    	opacity: 0.5, 
		    	visibility : true 
			
		    });
	map.addLayer(boundaryLayer);
    };
    
    //표준도엽인덱스 
    this._gfn_add_indexmap=function(mapObj) {
    	var indexLayer = new OpenLayers.Layer.ArcGIS93Rest("indexLayer",
    		    "http://210.117.198.32:6080/arcgis/rest/services/NGII_INDEXMAP/MapServer/export/", 
    		    
    		    {
    			  layers: 'show:'+mapObj,
    		      TRANSPARENT: true,
    		        srs:"EPSG:5179"
    		    
    		    },
    		    {
    		   	maxExtent: new OpenLayers.Bounds(705680.0000, 1349270.0000, 1388291.0000, 2581448.0000),
    		   	projection: new OpenLayers.Projection("EPSG:5179"),
    		    	isBaseLayer: false,   
    		    	extractAttributes: false,
    		    	opacity: 0.5, 
    		    	visibility : true,
                    singleTile:true
    		    });
    	map.addLayer(indexLayer);
    };
    
    //해당영역의 사각형을 그려줌.
	this._polygon = function (minX,minY,maxX,maxY){
		var that = this;
	//	that.layer.removeAllFeatures();
		
		var bounds = new OpenLayers.Bounds(minX,minY,maxX,maxY);
		
		var v = new OpenLayers.Feature.Vector(bounds.toGeometry());

		that.getLayersByName('locSearch')[0].addFeatures(v );
		map1.zoomToExtent(bounds);
	}
	
	/** 메져 콘트롤 measure Control 이하 */
	this._addDefaultMeasureControl = function(){
		var lonLatPosition;
		var measurePopupId = "measurePopup"+mapIndex;
		var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
		renderer = (renderer) ? [ renderer ] : OpenLayers.Layer.Vector.prototype.renderers;
		var measureSymbolizers = {
			"Point" : {
				pointRadius : 5,
				graphicName : "circle",
				fillColor : "#FF9933",
				fillOpacity : 1,
				strokeWidth : 1,
				strokeOpacity : 1,
				strokeColor : "#FF9933"
			},
			"Line" : {
				strokeWidth : 2,
				strokeOpacity : 1,
				strokeColor : "#FF9933",
				strokeDashstyle : ""
			},
			"Polygon" : {
				strokeWidth : 2,
				strokeOpacity : 1,
				strokeColor : "#cc9999",
				fillColor : "#ee9900",
				fillOpacity : 0.2
			}
		};
		var measureStyle = new OpenLayers.Style();
		measureStyle.addRules([ new OpenLayers.Rule({
			symbolizer : measureSymbolizers
		}) ]);
		var measureOption = {
			handlerOptions : {
				style : "default",
				layerOptions : {styleMap : new OpenLayers.StyleMap({"default" : measureStyle})},
				renderers : renderer,
				persist : true
			}
		};
	
		var measureControl1 = new OpenLayers.Control.Measure(OpenLayers.Handler.Path, measureOption);
		var measureControl2 = new OpenLayers.Control.Measure(OpenLayers.Handler.Polygon, measureOption);
		measureControl1.events.on({
			"measure" : handleMeasurements_end,
			"measurepartial" : handleMeasurements_start
		});
		measureControl2.events.on({
			"measure" : handleMeasurements_end,
			"measurepartial" : handleMeasurements_start
		});
		ngiiMap._addControl("measure_distance", measureControl1);
		ngiiMap._addControl("measure_area", measureControl2);
		map.events.register("mousemove", map, function(e) {
			lonLatPosition = map.getLonLatFromPixel(e.xy);
		});
		function handleMeasurements_start(event) {
			ngiiMap._clearPopup();
		}
		function handleMeasurements_end(event) {
			ngiiMap._clearPopup();
			var units = event.units;
			var order = event.order;
			var measure = event.measure;
			var out = "";
			var result=ngii_wmts.util.dotGubun(measure.toFixed(1));
			var widthSize=result.length*10;
			if (order == 1) {
				out += "<table height='33px' style='width:100%;background-color:#1A2A51; background-repeat:no-repeat;'> ";
				out += "<tr><td style='padding:0px 8px 0px 4px;'>";
				out += "<table cellspacing='0' cellpadding='0' border='0' width='100%' align='center'>";
				out += "<tr><td style='text-align: right;'><font face='\"Open Sans\", sans-serif' size='2' color='white'>"
						+ result
						+ " "
						+ units
						+ "</font>"
						+ "</td>";
				out += "</tr></table>";
				out += "</tr></table>";
			} else {
				out += "<table height='33px' style='width:100%;background-color:#1A2A51; background-repeat:no-repeat;'> ";
				out += "<tr><td style='padding:0px 8px 0px 4px;'>";
				out += "<table cellspacing='0' cellpadding='0' border='0' width='100%' align='center'>";
				out += "<tr><td style='text-align: right;'><font face='\"Open Sans\", sans-serif' size='2' color='white'>"
						+ result
						+ " "
						+ units
						+ "<sup>2</font></td>";
				out += "</tr></table>";
				out += "</tr></table>";
			}
			out +="<div onclick=\"ngii_wmts.findMapObject("+mapIndex+")._clearPopup();\" style=\"width:20px;height:20px;position:absolute;right:-10px;top:-10px;overflow:visible;background:url('"+ngii_wmts.map.properties.emapUrl+"/js/map/theme/default/img/close.gif') no-repeat;cursor:pointer;\"></div>";
	
			popup = new OpenLayers.Popup(measurePopupId, new OpenLayers.LonLat(lonLatPosition.lon, lonLatPosition.lat), 
					new OpenLayers.Size(widthSize, 24), out, true);
	
			map.addPopup(popup);
			// 크롬에서 스크롤 생길때.. 이걸 해주면 없어진다.
			$('#'+measurePopupId+"_contentDiv").attr('style', 'whidth:'+widthSize+'px; overflow:hidden; background-color:none;');
			$('#'+measurePopupId+"_GroupDiv").attr('style', 'overflow:hidden; background-color:none;');
	
			$('#'+measurePopupId).css('background', 'none');
			$('#'+measurePopupId).css('overflow', 'visible');
			$('#'+measurePopupId+"_close").css('display', 'none');
		}
	};
	
	/** OpenLayers.Map 클래스의 속성과 메소드로 연결 ngii_wmts.map 객체에서 접근하였을때 OpenLayers.Map 객체로 연결 (이하 내용은 www.openlayers.org 의 api document 문서에 정의된 것들이다.) */
	this.events           =map.events           ;
	this.allOverlays      =map.allOverlays      ;
	this.div              =map.div              ;
	this.layers           =map.layers           ;
	this.controls         =map.controls         ;
	this.baseLayer        =map.baseLayer        ;
	this.options          =map.options          ;
	this.tileSize         =map.tileSize         ;
	this.projection       =map.projection       ;
	this.units            =map.units            ;
	this.resolutions      =map.resolutions      ;
	this.maxResolution    =map.maxResolution    ;
	this.minResolution    =map.minResolution    ;
	this.maxScale         =map.maxScale         ;
	this.minScale         =map.minScale         ;
	this.maxExtent        =map.maxExtent        ;
	this.minExtent        =map.minExtent        ;
	this.restrictedExtent =map.restrictedExtent ;
	this.numZoomLevels    =map.numZoomLevels    ;
	this.theme            =map.theme            ;
	this.displayProjection=map.displayProjection;
	this.tileManager      =map.tileManager      ;
	this.fallThrough      =map.fallThrough      ;
	this.autoUpdateSize   =map.autoUpdateSize   ;
	this.eventListeners   =map.eventListeners   ;
	this.panMethod        =map.panMethod        ;
	this.zoomMethod       =map.zoomMethod       ;
	this.getViewport             =function(){return map.getViewport             .apply(map, arguments);};
	this.render                  =function(){return map.render                  .apply(map, arguments);};
	this.destroy                 =function(){return map.destroy                 .apply(map, arguments);};
	this.setOptions              =function(){return map.setOptions              .apply(map, arguments);};
	this.getTileSize             =function(){return map.getTileSize             .apply(map, arguments);};
	this.getBy                   =function(){return map.getBy                   .apply(map, arguments);};
	this.getLayersBy             =function(){return map.getLayersBy             .apply(map, arguments);};
	this.getLayersByName         =function(){return map.getLayersByName         .apply(map, arguments);};
	this.getLayersByClass        =function(){return map.getLayersByClass        .apply(map, arguments);};
	this.getControlsBy           =function(){return map.getControlsBy           .apply(map, arguments);};
	this.getControlsByClass      =function(){return map.getControlsByClass      .apply(map, arguments);};
	this.getLayer                =function(){return map.getLayer                .apply(map, arguments);};
	this.addLayer                =function(){return map.addLayer                .apply(map, arguments);};
	this.addLayers               =function(){return map.addLayers               .apply(map, arguments);};
	this.removeLayer             =function(){return map.removeLayer             .apply(map, arguments);};
	this.getNumLayers            =function(){return map.getNumLayers            .apply(map, arguments);};
	this.getLayerIndex           =function(){return map.getLayerIndex           .apply(map, arguments);};
	this.setLayerIndex           =function(){return map.setLayerIndex           .apply(map, arguments);};
	this.raiseLayer              =function(){return map.raiseLayer              .apply(map, arguments);};
	this.setBaseLayer            =function(){return map.setBaseLayer            .apply(map, arguments);};
	this.addControl              =function(){return map.addControl              .apply(map, arguments);};
	this.addControls             =function(){return map.addControls             .apply(map, arguments);};
	this.getControl              =function(){return map.getControl              .apply(map, arguments);};
	this.removeControl           =function(){return map.removeControl           .apply(map, arguments);};
	this.addPopup                =function(){return map.addPopup                .apply(map, arguments);};
	this.removePopup             =function(){return map.removePopup             .apply(map, arguments);};
	this.getSize                 =function(){return map.getSize                 .apply(map, arguments);};
	this.updateSize              =function(){return map.updateSize              .apply(map, arguments);};
	this.getCenter               =function(){return map.getCenter               .apply(map, arguments);};
	this.getZoom                 =function(){return map.getZoom                 .apply(map, arguments);};
	this.pan                     =function(){return map.pan                     .apply(map, arguments);};
	this.panTo                   =function(){return map.panTo                   .apply(map, arguments);};
	this.setCenter               =function(){return map.setCenter               .apply(map, arguments);};
	this.getMinZoom              =function(){return map.getMinZoom              .apply(map, arguments);};
	this.getProjection           =function(){return map.getProjection           .apply(map, arguments);};
	this.getProjectionObject     =function(){return map.getProjectionObject     .apply(map, arguments);};
	this.getMaxResolution        =function(){return map.getMaxResolution        .apply(map, arguments);};
	this.getMaxExtent            =function(){return map.getMaxExtent            .apply(map, arguments);};
	this.getNumZoomLevels        =function(){return map.getNumZoomLevels        .apply(map, arguments);};
	this.getExtent               =function(){return map.getExtent               .apply(map, arguments);};
	this.getResolution           =function(){return map.getResolution           .apply(map, arguments);};
	this.getUnits                =function(){return map.getUnits                .apply(map, arguments);};
	this.getScale                =function(){return map.getScale                .apply(map, arguments);};
	this.getZoomForExtent        =function(){return map.getZoomForExtent        .apply(map, arguments);};
	this.getResolutionForZoom    =function(){return map.getResolutionForZoom    .apply(map, arguments);};
	this.getZoomForResolution    =function(){return map.getZoomForResolution    .apply(map, arguments);};
	this.zoomTo                  =function(){return map.zoomTo                  .apply(map, arguments);};
	this.zoomIn                  =function(){return map.zoomIn                  .apply(map, arguments);};
	this.zoomOut                 =function(){return map.zoomOut                 .apply(map, arguments);};
	this.zoomToExtent            =function(){return map.zoomToExtent            .apply(map, arguments);};
	this.zoomToMaxExtent         =function(){return map.zoomToMaxExtent         .apply(map, arguments);};
	this.zoomToScale             =function(){return map.zoomToScale             .apply(map, arguments);};
	this.getViewPortPxFromLonLat =function(){return map.getViewPortPxFromLonLat .apply(map, arguments);};
	this.getLonLatFromPixel      =function(){return map.getLonLatFromPixel      .apply(map, arguments);};
	this.getPixelFromLonLat      =function(){return map.getPixelFromLonLat      .apply(map, arguments);};
	this.getViewPortPxFromLayerPx=function(){return map.getViewPortPxFromLayerPx.apply(map, arguments);};
	this.getLayerPxFromViewPortPx=function(){return map.getLayerPxFromViewPortPx.apply(map, arguments);};
	this.getLayerPxFromLonLat    =function(){return map.getLayerPxFromLonLat    .apply(map, arguments);};
};
ngii_wmts.map.overlay_getTileURL = function(bounds) {
	var properties = ngii_wmts.map.properties;
	var res = this.map.getResolution(); 
	var x = Math.round((bounds.left - properties.mapBounds_tile.left) / (res * this.tileSize.w)); 
	var y = Math.round((bounds.bottom - properties.mapBounds_tile.bottom) / (res * this.tileSize.h)); 
	var z = this.map.getZoom()+6; 
	z = "L"+ngii_wmts.util.fillzero(z, 2);
	return this.url + z + "/" + x + "/" + y + "." + this.type; 
};
ngii_wmts.map.overlay_getIndoorTileURL = function(bounds) {
	     var res = this.getServerResolution();
     var z = this.getServerZoom() + 5;
     z = "L" + ngii_wmts.util.fillzero(z, 2);
     var x = Math.round((bounds.left - this.maxExtent.left)
         / (res * this.tileSize.w));
     var y = Math.round((this.maxExtent.top - bounds.top)
         / (res * this.tileSize.h));
     url = this.url + "?service=" + "WMTS" + "&request=" + "GetTile"
         + "&version=" + "1.0.0" + "&layer=" + this.layer + "&style="
         + this.style + "&format=" + this.format + "&tilematrixset="
         + this.matrixSet + "&tilematrix=" + z + "&tilerow=" + y
         + "&tilecol=" + x+"&apikey="+ngii_wmts.map.apikey;
     return url;
                      
};

        ngii_wmts.map. overlay_getTileURL_air=function(bounds) {

            var res = this.map.getResolution();
            var x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
            var y = Math.round((bounds.bottom - this.maxExtent.bottom) / (res *this.tileSize.h));
            var z = 12 - this.map.getZoom();

            if (z < 0){	//
                var idx = Math.pow(2, -z);
                return "http://openapi.ngii_wmts.go.kr:81/tilemap/2015/" + 0 + "/" + x/idx + "/" + y/idx + "." + this.type;
            } else {
                if (x >= 0 && y >= 0) {
                    return "http://openapi.ngii_wmts.go.kr:81/tilemap/2015/" + z + "/" + x + "/" + y + "." + this.type;
                } else {
                    return "http://www.maptiler.org/img/none.png";
                }
            }
        }
        ngii_wmts.map.overlay_getTileWMTSURL_air=function(bounds) {

            var res = this.getServerResolution(); 
			var x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w)); 
			var y = Math.round((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));
			var z = this.getServerZoom()+5;
			if (x >= 0 && y >= 0) { 
				return this.url +
								"?service="			+	"WMTS"			+
								"&request="			+	"GetTile"		+
								"&version="			+	"1.0.0"         +
								"&layer="			+	this.layer      +
								"&style="			+	this.style      +
								"&format="			+	this.format     +
								"&tilematrixset="	+	this.matrixSet  +
								"&tilematrix="		+	z               +
								"&tilerow="			+	y               +
								"&tilecol="			+	x				+
								//"&apiKey=ADB51FDDDF090FB5A928D08D330756C0" 
	 							"&apiKey="+ngii_wmts.map.apikey
								;
			} else { 
				return "http://www.maptiler.org/img/none.png"; 
			} 
        }
    ngii_wmts.map.getTileWMTSURL_Emap=function(bounds) {
	var url = "";
	var res = this.getServerResolution();
	var z = this.getServerZoom() + 5;
	z = "L" + ngii_wmts.util.fillzero(z, 2);
	var x = Math.round((bounds.left - this.maxExtent.left)
			/ (res * this.tileSize.w));
	var y = Math.round((this.maxExtent.top - bounds.top)
			/ (res * this.tileSize.h));
	url = this.url + "?service=" + "WMTS" + "&request=" + "GetTile"
			+ "&version=" + "1.0.0" + "&layer=" + this.layer + "&style="
			+ this.style + "&format=" + this.format + "&tilematrixset="
			+ this.matrixSet + "&tilematrix=" + z + "&tilerow=" + y
			+ "&tilecol=" + x+"&apikey="+ngii_wmts.map.apikey;
	return url;return "http://www.maptiler.org/img/none.png";

}
		ngii_wmts.map.getTileWMTSURL_Northmap=function(bounds) {
			var url = "";
			var res = this.getServerResolution();
			var z = this.getServerZoom() + 5;
			z = "L" + ngii_wmts.util.fillzero(z, 2);
			var x = Math.round((bounds.left - this.maxExtent.left)
					/ (res * this.tileSize.w));
			var y = Math.round((this.maxExtent.top - bounds.top)
					/ (res * this.tileSize.h));
			url = this.url + "?service=" + "WMTS" + "&request=" + "GetTile"
					+ "&version=" + "1.0.0" + "&layer=" + this.layer + "&style="
					+ this.style + "&format=" + this.format + "&tilematrixset="
					+ this.matrixSet + "&tilematrix=" + z + "&tilerow=" + y
					+ "&tilecol=" + x+ '&time=' + Date.now();
			return url;return "http://www.maptiler.org/img/none.png";

		}
ngii_wmts.map.apikey = "F2AB591859D900772643FD3523B1761D";
ngii_wmts.map.properties = {
	emapUrl    : "http://map.ngii.go.kr",
	openapiUrl : "http://map.ngii.go.kr/openapi",
	mapBounds_tile : new OpenLayers.Bounds(-200000.0, -28024123.62 , 31824123.62, 4000000.0),
	tileNames_en : [
	           "korean_map",
	           "color_map",
	           "lowV_map",
	           "english_map",
	           "white_map",
	           "chinese_map",
	           "japanese_map",
	           "white_edu_map",
	           "base_hd"
	],
	tileNames_ko : [
	           "일반",
	           "색각",
	           "큰글씨",
	           "영문",
	           "백지도",
	           "중문",
	           "일문",
	           "교육용백지도",
	           "일반HD"
	],
	tileUrls : [
        "http://map.ngii.go.kr/openapi/proxy/proxyTile.jsp?apikey="+ngii_wmts.map.apikey+"&URL=//map.ngii.go.kr/openapi",
        		
	           
	           
	           
	           
	           
	           
	           
	           
	           
	],
    baseLayerOptions : {
        serviceVersion: '.',
        alpha: true,
        type: 'png',
        getURL: ngii_wmts.map.overlay_getTileURL,
        'buffer': 1,
        //visibility :true ,
        extension : 'png',
        resolutions: [1954.597389, 977.2986945, 488.64934725, 244.324673625, 122.1623368125, 61.08116840625, 30.540584203125, 15.2702921015625,7.63514605078125,3.817573025390625,1.9087865126953125,0.9543932563476563,0.47719662817382813,0.23859831408691406],
        //    isBaseLayer: true,
        maxExtent: new OpenLayers.Bounds(-200000.0, -3015.4524155292 , 3803015.45241553, 4000000.0),
        tileSize: new OpenLayers.Size(256, 256),
        maxResolution: 1954.597389,
        numZoomLevels : 14,
        projection: new OpenLayers.Projection("EPSG:5179"),
        transitionEffect: 'resize',
        CLASS_NAME: 'OpenLayers.Layer.NgiiEMap'
        /*
        serviceVersion: '.',
        alpha: true,
        type: 'png',
        getURL: ngii_wmts.map.overlay_getTileURL,
        'buffer': 4,
        projection: "EPSG:5179",
        numZoomLevels : 13,
        maxResolution: 1954.597389,
        units : "m"
        */
    },
    IndoorOptions : {
    	name : "Indoor Base Layer",
        //url:"http://devmap.ngii.go.kr:90/openapi/Gettile.do",
        url : "//map.ngii.go.kr/openapi/Gettile.do",
		layer : 'indoor_map',
		matrixSet : "korean",
		format : "image/png",
		style : "korean",
		serviceVersion : '.',
		layername : '.',
		alpha : true,
		type:'png', 
		maxExtent : new OpenLayers.Bounds(-200000.0, -3015.4524155292, 3803015.45241553, 4000000.0),
		TRANSPARENT : true,
		visibility : true,
		tileSize : new OpenLayers.Size(256, 256),
		numZoomLevels: 5,
		maxResolution:0.9543932563476563,
        serverResolutions : [ 2088.96, 1044.48, 522.24, 261.12, 130.56, 65.28,32.64, 16.32, 8.16, 4.08, 2.04, 1.02, 0.51, 0.255, 0.1275, 0.06375]
    },
	
		
		
        
        
        
        
        
        
    
        
        
        
        
        
        
        
		
		
		
		
		
		
		
		
		
		
		
	
	layerOptions : {
		serviceVersion: '.', 
		alpha: true, 					
		type: 'png', 
		getURL: ngii_wmts.map.overlay_getTileURL,
		'buffer': 4,
		projection: "EPSG:5179",
		numZoomLevels : 13,
		maxResolution: 1954.597389,
		maxExtent: new OpenLayers.Bounds(-200000.0, -3015.4524155292 , 3803015.45241553, 4000000.0),
		units : "m"
	},
	airLayerOptions : {
        type: 'jpg', getURL: ngii_wmts.map. overlay_getTileURL_air,

        TRANSPARENT: true,

        numZoomLevels: 13,
        maxExtent: new OpenLayers.Bounds(705680.0000, 1349270.0000, 1388291.0000, 2581448.0000),
        tileSize: new OpenLayers.Size(512, 512),
        maxResolution: 2088.960000,
        TRANSPARENT: true,
        CLASS_NAME: 'OpenLayers.Layer.NgiiAirMap'
	},
		airWMTSLayerOptions : {
        // 	        url: "http://127.0.0.1:18080/services.do", // api log 용
	        url: "http://210.117.198.120:8081/o2map/services", //엔진 다이렉트용
	        layer: "AIRPHOTO",
	        matrixSet: "NGIS_AIR",
	        format: "image/jpg",
	        style: "_null",
	        transitionEffect: 'resize',
	        //maxResolution: 2088.96,
	        serverResolutions:[2088.96, 1044.48, 522.24, 261.12, 130.56, 65.28, 32.64, 16.32, 8.16, 4.08, 2.04, 1.02, 0.51],
	        opacity: 1,
	        tileSize: new OpenLayers.Size(256, 256), 
	        tileOrigin : new OpenLayers.LonLat(-200000.000000000,4000000.000000000),
	        maxExtent: new OpenLayers.Bounds( -200000.000000000, 997738.410700000, 2802261.589000000, 4000000.000000000),
	        TRANSPARENT: true,
	        transitionEffect: 'resize',
	        getURL: ngii_wmts.map.overlay_getTileWMTSURL_air
	},
		airWMTSLayerOptions2 : {
        // 	        url: "http://127.0.0.1:18080/services.do", // api log 용
	        url: "http://210.117.198.120:8081/o2map/services", //엔진 다이렉트용
	        layer: "AIRPHOTO",
	        matrixSet: "NGIS_AIR",
	        format: "image/jpg",
	        style: "_null",
	        transitionEffect: 'resize',
	        //maxResolution: 2088.96,
	        serverResolutions:[2088.96, 1044.48, 522.24, 261.12, 130.56, 65.28, 32.64, 16.32, 8.16, 4.08, 2.04, 1.02, 0.51,0.255],
	        opacity: 1,
	        tileSize: new OpenLayers.Size(256, 256), 
	        tileOrigin : new OpenLayers.LonLat(-200000.000000000,4000000.000000000),
	        maxExtent: new OpenLayers.Bounds( -200000.000000000, 997738.410700000, 2802261.589000000, 4000000.000000000),
	        TRANSPARENT: true,
	        transitionEffect: 'resize',
	        getURL: ngii_wmts.map.overlay_getTileWMTSURL_air
	},
	wmtEmapOption:{
        url : "//map.ngii.go.kr/openapi/Gettile.do",
        layer : "Emap",
        matrixSet : "korean",
        format : "image/png",
        style : "korean",
        transitionEffect : 'resize',
         maxResolution: 2088.96,
        serverResolutions : [ 2088.96, 1044.48, 522.24, 261.12, 130.56, 65.28,
			      				32.64, 16.32, 8.16, 4.08, 2.04, 1.02, 0.51, 0.255 ],
		numZoomLevels: 14,
        opacity : 1,
        visibility:true,
        tileSize : new OpenLayers.Size(256, 256),
        //tileOrigin : new OpenLayers.LonLat(-200000.000000000, 4000000.000000000),
        maxExtent :  new OpenLayers.Bounds(-200000.0, -28024123.62,
            31824123.62, 4000000.0),
        TRANSPARENT : true,
        transitionEffect : 'resize',
        getURL : ngii_wmts.map.getTileWMTSURL_Emap,
        attribution : '<img style="width:96px; height:16px; margin-left:5px;" src="http://map.ngii.go.kr/img/process/ms/map/common/img_btoLogo3.png">',
		crossOrigin : null
	},

	wmtEmapNorthOption:{
		url : "//map.ngii.go.kr/openapi/NorthGettile.do",
		layer : "north_map",
		matrixSet : "korean",
		format : "image/png",
		style : "north",
		transitionEffect : 'resize',
		maxResolution: 2088.96,
		visibility : true,
		serverResolutions : [ 2088.96, 1044.48, 522.24, 261.12, 130.56, 65.28,
			32.64, 16.32, 8.16, 4.08, 2.04, 1.02, 0.51 ],
		opacity : 1,
		tileSize : new OpenLayers.Size(256, 256),
		//tileOrigin : new OpenLayers.LonLat(-200000.000000000, 4000000.000000000),
		maxExtent :  new OpenLayers.Bounds(-200000.0, -28024123.62,
				31824123.62, 4000000.0),
		TRANSPARENT : true,
		transitionEffect : 'resize',
		getURL : ngii_wmts.map.getTileWMTSURL_Northmap,
		attribution : '<img style="width:96px; height:16px; margin-left:5px;" src="http://map.ngii.go.kr/img/process/ms/map/common/img_btoLogo3.png">'
	},
	mapProjection : "EPSG:5179",

	maxZoom : 0,
	initCenter : new OpenLayers.LonLat(960363.60652286, 1920034.9139856),
	initZoom : 0
	
};

ngii_wmts.map.mapModeBoxClick = function(boxId, mode){
	var aTags = document.getElementById(boxId).getElementsByTagName("img");
	var strMode = ngii_wmts.util.to_charFM(mode+1+"", 2);
	var aTagIndex = 0;
	for(var i=0;i<aTags.length;i++){
		if(aTags[i].src.indexOf(strMode+".")!=-1)
		aTagIndex=i;
		aTags[i].src = aTags[i].src.replace("btCircle_chkd_", "btCircle_");
	}
	aTags[aTagIndex].src = aTags[aTagIndex].src.replace("btCircle_", "btCircle_chkd_");
};
ngii_wmts.map.chkAuthor = function(){
};