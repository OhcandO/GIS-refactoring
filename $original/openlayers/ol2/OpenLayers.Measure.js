// allow testing of specific renderers via "?renderer=Canvas", etc
    var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
    if (renderer) {
        OpenLayers.Layer.Vector.prototype.renderers = [renderer];
    }

// The map
//    var map = new OpenLayers.Map({
//        div: 'map',
//        layers: [
//            new OpenLayers.Layer.WMS('OpenLayers WMS',
//            'http://vmap0.tiles.osgeo.org/wms/vmap0?', {layers: 'basic'})
//        ]
//    });
//    map.setCenter(new OpenLayers.LonLat(0, 0), 3);

// The measure controls
    var measureControls = {
        /* NOTE: Should be sure whether projection requires `{geodesic:true}`.
          See: http://dev.openlayers.org/docs/files/OpenLayers/Control/Measure-js.html#OpenLayers.Control.Measure.geodesic
          ""
            Geodesic calculation works the same in both the ScaleLine and Measure
            controls, so it has the same prerequisites. The advice that proj4js
            is needed to make it work is only true to the extent it is with any
            re-projection in OpenLayers: as long as your map is in EPSG:900913,
            you don't need proj4js. As soon as you use a different projection,
            you need it.
          "" (from comment by Andreas Hocevar)
          See: http://osgeo-org.1560.x6.nabble.com/Getting-the-right-results-from-Measure-tool-using-EPSG-3776-td3921884.html#a3921894
        */
    		
    	// geodesic >> 측지선..true 시 측정이 비정상 작동 
    	//DynamicMeasure 호출 시 IE에서 랜더링이 느린 현상 발생
        line: new OpenLayers.Control.DynamicMeasure(
                OpenLayers.Handler.Path, {geodesic:false}), 
        polygon: new OpenLayers.Control.DynamicMeasure(
                OpenLayers.Handler.Polygon, {geodesic:false})
    	//IE + CR 정상 작동.
//    	line: new OpenLayers.Control.Measure(
//    			OpenLayers.Handler.Path, {geodesic:false}), 
//        polygon: new OpenLayers.Control.Measure(
//        		OpenLayers.Handler.Polygon, {geodesic:false})
    		
    };
//    map.addControls([
//        measureControls.line,
//        measureControls.polygon,
//        new OpenLayers.Control.LayerSwitcher()
//    ]);

// functions used in the form to set the measure control.
    function toggleControl(element) {
//    	console.log(element.id);
    	var tmpParam;
    	
    	//이동
    	if(element.id == "Btn_MapTool_Pan") {
    		tmpParam = "none";
    	}
    	//거리측정
    	else if(element.id == "Btn_MapTool_Distance") {
    		tmpParam = "line";
    	}
    	//면적측정
    	else if(element.id == "Btn_MapTool_Crop") {
    		tmpParam = "polygon";
    	}
//    	console.log(tmpParam);
        for (var key in measureControls) {
            if (tmpParam === key) {
                measureControls[key].activate();
            } else {
//            	console.log(key);
                measureControls[key].deactivate();
            }
        }
    }
    function toggleShowSegments() {
        for (var key in measureControls) {
            var control = measureControls[key];
//            if (element.checked) {
                // * set `layerSegmentsOptions` at control creation as a object
                //   or undefined to display length of segments.
                delete control.layerSegmentsOptions;
//            } else {
                // * set `layerSegmentsOptions` at control creation to null to
                //   not display.
//                control.layerSegmentsOptions = null;
//            }
            if (control.active) {
                control.deactivate();
                control.activate();
            }
        }
    }
    function toggleShowPerimeter(element) {
        var control = measureControls.polygon;
        if (element.checked) {
            // * set `layerLengthOptions` as a object or undefined to display
            //   length of perimeter.
            delete control.layerLengthOptions;
        } else {
            // * set `layerLengthOptions` to null to not display.
            control.layerLengthOptions = null;
        }
        if (control.active) {
            control.deactivate();
            control.activate();
        }
    }
    function toggleShowHeading(element) {
        for (var key in measureControls) {
            var control = measureControls[key];
            if (element.checked) {
                // * set `layerHeadingOptions` as a object or undefined to
                //   display heading.
                control.layerHeadingOptions = {};
            } else {
                // * set `layerHeadingOptions` to null to not display.
                control.layerHeadingOptions = null;
            }
            if (control.active) {
                control.deactivate();
                control.activate();
            }
        }
    }
    function changeMaxSegments() {
//        var maxSegments = element.value !== '' ?
//                parseInt(element.value, 10) :
//                null;
        for (var key in measureControls) {
            measureControls[key].maxSegments = 999;
            measureControls[key].maxHeadings = 999;
        }
    }

// Set current values, needed if form is reloaded with values
    //거리 및 면적 계산 시 클릭할때마다 계산완료값 표출하기
    toggleShowSegments();
//    toggleShowPerimeter(document.getElementById("showPerimeter"));
//    toggleShowHeading(document.getElementById("showHeading"));
    //거리 및 면적 계산 시 클릭할때마다 표출되는 완료값에 대한 갯수
    changeMaxSegments();
//    toggleControl(document.getElementById("Btn_MapTool_Distance"));
//    toggleControl(document.getElementById("Btn_MapTool_Crop"));