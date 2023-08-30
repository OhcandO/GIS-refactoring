
var markers;
/**
 * @example moveMapFeature('LC_WTL_PIPE_LS', 'SA001', '1990000108');
 */
var moveMapFeature = function(_layerNm, _ftrCde, _ftrIdn) {
	OpenLayers.Request.GET({
        url: serviceUrl_wfs,
        params: {
            service: 'WFS',
            version: '1.1.0',
            request: 'GetFeature',
            typeName: _layerNm,
         	outputFormat: 'json',
         	CQL_FILTER: "(FTR_CDE='"+_ftrCde+"' and FTR_IDN='"+_ftrIdn+"')",
        },
     	
        success: function(request) {
        	if(request.responseText.indexOf('{"type":"FeatureCollection"') == 0) {
        		//console.log("====== get json ===== ");
        		var jsonFeature = $.parseJSON(request.responseText);
        		if(jsonFeature.features.length !== 0) {
        			var featureLonlat = jsonFeature.features[0].geometry.coordinates[0][0];
        			//map.panTo( new OpenLayers.LonLat(featureLonlat[0], featureLonlat[1]) );
        			map.setCenter(new OpenLayers.LonLat(featureLonlat[0], featureLonlat[1]), 14);
        			
        			//console.log(jsonFeature.features[0]);
        			//console.log(featureLonlat);
					
        			markers.destroy();
					markers = new OpenLayers.Layer.Markers( "Markers" );
					map.addLayer(markers);
					
					var size = new OpenLayers.Size(32,32);
					var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
					var icon = new OpenLayers.Icon('/gis/images/map/BluePin1LargeB.png', size, offset);
					markers.addMarker(new OpenLayers.Marker(new OpenLayers.LonLat(featureLonlat[0], featureLonlat[1]),icon));
					
					$("#infoLayerDiv1").html(makeInfoTable(request.responseText, "view"));
					$('#sideMenuRight').show();
					$('.btn-side-rightClose').removeClass('open');
					
					onceLayerShow(_layerNm);
        		}else {
        			alert('시설정보가 없습니다.')
        		}
        	}
        },
	});
}