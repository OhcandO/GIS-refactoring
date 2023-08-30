var fnInitMap = function() {
	//중부원점(50만)
	Proj4js.defs["EPSG:5181"]="+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +units=m +no_defs";

	DaumBaseMap = new OpenLayers.Layer.DaumBaseMap("다음-일반지도");
	
    LC_WTL_BLBG_AS = newWMSLayer("WTL_BLBG_AS", "대블록", false, false);
    LC_WTL_BLBM_AS = newWMSLayer("WTL_BLBM_AS", "중블록", false, false);
    LC_WTL_BLSM_AS = newWMSLayer("WTL_BLSM_AS", "소블록", false, false);
    LC_WTL_FLOW_PS = newWMSLayer("WTL_FLOW_PS", "유량계", false, false);
    LC_WTL_PURI_PS = newWMSLayer("WTL_PURI_PS", "정수장", false, false);
    LC_WTL_SERV_PS = newWMSLayer("WTL_SERV_PS", "배수지", false, false);
		
	//좌표계 정의
    var fromProjection = new OpenLayers.Projection("EPSG:4326");
    projection = new OpenLayers.Projection("EPSG:5181");
    position = new OpenLayers.LonLat(127.000185, 35.0).transform(fromProjection, projection);
	
    var mapOpt =  {
    		//maxExtent: new OpenLayers.Bounds(229027.4625,252193.725,284849.95,309009.925),
//    		maxExtent: new OpenLayers.Bounds(
//    				240204.10770,291670.87015,
//    				248107.10770,287446.87015), 
    		numZoomLevels:20, 
    	    maxResolution:0.25, 
    		units:'m',
    		projection: new OpenLayers.Projection("EPSG:5181"),
    		controls: [new OpenLayers.Control.Navigation()]
    	}
    
    baselayer = new OpenLayers.Layer("",{bgcolor: '0xFFFFFF', visibility: false, isBaseLayer: true});
    
    map = new OpenLayers.Map('map-canvas', mapOpt );
    map.addLayer(DaumBaseMap);
    
    
   map.addLayers([
           	 LC_WTL_BLBM_AS
           	 ,LC_WTL_BLBG_AS
             ,LC_WTL_BLSM_AS
           	 ,LC_WTL_FLOW_PS
           	 ,LC_WTL_PURI_PS
           	 ,LC_WTL_SERV_PS
              ]);
    LC_WTL_FLOW_PS.setVisibility(false);
    LC_WTL_PURI_PS.setVisibility(false);
    LC_WTL_SERV_PS.setVisibility(false);
    LC_WTL_BLBM_AS.setVisibility(false);
    LC_WTL_BLBG_AS.setVisibility(false);
    LC_WTL_BLSM_AS.setVisibility(false);
    DaumBaseMap.setVisibility(true);
    baselayer.setVisibility(true);
}

var newWMSLayer = function(strLayerName, strLayerTitle, bWide, bVisible) {
	//var newWMS = new OpenLayers.Layer.WMS(strLayerTitle, serviceUrl_sample1+"BBOX="+map.getExtent().toBBOX(),
	var newWMS = new OpenLayers.Layer.WMS(strLayerTitle, serviceUrl_sample1,
            { 
				layers: strLayerName,
				format: "image/png",
				transparent: true,
				tiled: false
			},
            {
	           	isBaseLayer: false,
	           	isWideLayer : bWide,
	           	singleTile: true,
	           	buffer:0,
	           	ratio:1,
	           	opacity: 0.5,
	           	displayOutsideMaxExtent: true,
	           	projection:new OpenLayers.Projection("EPSG:5181"),
	           	visibility: bVisible,
            }
	);
	if(newWMS != null)
		return newWMS;
}

var initProj4 = function() {
	
	Proj4js.defs["EPSG:4019"] = "+proj=longlat +ellps=GRS80 +no_defs";
	Proj4js.defs["EPSG:3857"] = 
		"+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs";
	Proj4js.defs["EPSG:900913"] = 
		"+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs";
	//UTM-K
	Proj4js.defs["EPSG:5179"] = 
		"+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs";
	//중부원점(50만)
	Proj4js.defs["EPSG:5181"]="+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +units=m +no_defs";
	//서부원점
	Proj4js.defs["EPSG:5185"] = "+proj=tmerc +lat_0=38 +lon_0=125 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +units=m +no_defs";
	//중부원점-o
	Proj4js.defs["EPSG:5186"] = "+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +units=m +no_defs";
	//동부원점
	Proj4js.defs["EPSG:5187"] = "+proj=tmerc +lat_0=38 +lon_0=129 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +units=m +no_defs";
	//동해(울릉)원점
	Proj4js.defs["EPSG:5188"] = "+proj=tmerc +lat_0=38 +lon_0=131 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +units=m +no_defs";
}

function layerSetting(){
   LC_WTL_FLOW_PS.setVisibility(false);
   LC_WTL_PURI_PS.setVisibility(false);
   LC_WTL_SERV_PS.setVisibility(false);
   LC_WTL_BLBM_AS.setVisibility(false);
   LC_WTL_BLBG_AS.setVisibility(false);
   LC_WTL_BLSM_AS.setVisibility(false);		
}