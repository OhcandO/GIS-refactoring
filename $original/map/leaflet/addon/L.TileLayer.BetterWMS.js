L.TileLayer.BetterWMS = L.TileLayer.WMS.extend({
  
  onAdd: function (map) {
    // Triggered when the layer is added to a map.
    //   Register a click listener, then do all the upstream WMS things
    L.TileLayer.WMS.prototype.onAdd.call(this, map);
    
    map.on('click', this.getFeatureInfo, this);
    //map.on('mousemove', this.getFeatureInfo,this);
  
  },
  
  onRemove: function (map) {
    // Triggered when the layer is removed from a map.
    //   Unregister a click listener, then do all the upstream WMS things
    L.TileLayer.WMS.prototype.onRemove.call(this, map);
    map.off('click', this.getFeatureInfo, this);
    //map.off('mousemove', this.getFeatureInfo,this);
  },
  
  getFeatureInfo: function (evt) {
    // Make an AJAX request to the server and hope for the best
    var url = this.getFeatureInfoUrl(evt.latlng),
        showResults = L.Util.bind(this.showGetFeatureInfo, this);
    
    $.ajax({
      url: url,
      success: function (data, status, xhr) {
    	// **********************************   if info-FORMAT is json type is an object!  
        var err = typeof data === 'object' ? null : data;
        showResults(err, evt.latlng, data);
      },
      error: function (xhr, status, error) {
        showResults(error);  
      }
    });
    
  },
  
  getFeatureInfoUrl: function (latlng) {
    // Construct a GetFeatureInfo request URL given a point
    var point = this._map.latLngToContainerPoint(latlng, this._map.getZoom()),
        size = this._map.getSize(),
        params = {
          request: 'GetFeatureInfo',
          service: 'WMS',
          srs: 'EPSG:4326',
          styles: this.wmsParams.styles,
          transparent: this.wmsParams.transparent,
          version: this.wmsParams.version,      
          format: this.wmsParams.format,
          bbox: this._map.getBounds().toBBoxString(),
          height: size.y,
          width: size.x,
          layers: this.wmsParams.layers,
          query_layers: this.wmsParams.layers,
          info_format: 'application/json'
          //,propertyName:'SGCCD,SAA_CDE'
        };
    params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
    params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;
    
    return this._url + L.Util.getParamString(params, this._url, true);
  },
  
  showGetFeatureInfo: function (err, latlng, content) {
	
    if (err) { console.log(err); return; } // do nothing if there's an error
    // Otherwise show the content in a popup, or something.
    var drawObj = Object.keys(mainMap.map.drawItem._layers).length;
    
    if(toolbarChk === true && drawObj < 1 ) return;
    
    var element = document.getElementById('map');
    
    if (content.features.length>0)
    {
    	if(content.features[0].properties.BLK_NAM) {
    		fn_featurePop(content.features);
    		//m.on("mouseout",function(){$('.leaflet-mouse-marker').css('cursor','');});
    	}
    }
    else 
    {	// Optional... show an error message if no feature was returned
    	
    	/* $("#daneben").fadeIn(750);
		  setTimeout(function(){ $("#daneben").fadeOut(750); }, 2000);*/
    }
    
  }
});

L.tileLayer.betterWms = function (url, options) {
  return new L.TileLayer.BetterWMS(url, options);  
};
