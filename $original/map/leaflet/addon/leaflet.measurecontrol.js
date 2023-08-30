L.Polyline.Measure = L.Draw.Polyline.extend({
    addHooks: function () {
        L.Draw.Polyline.prototype.addHooks.call(this);
        if (this._map) {
        	this._startShape();
            L.DomEvent.on(this._container, 'keyup', this._cancelDrawing, this);
        }
    },

    removeHooks: function () {
        //L.Draw.Polyline.prototype.removeHooks.call(this);
    	L.Draw.Feature.prototype.removeHooks.call(this);

		this._clearHideErrorTimeout();

		this._cleanUpShape();
		
		this._mouseMarker
			.off('mousedown', this._onMouseDown, this)
			.off('mouseout', this._onMouseOut, this)
			.off('mouseup', this._onMouseUp, this)
			.off('mousemove', this._onMouseMove, this);
		this._map.removeLayer(this._mouseMarker);
		delete this._mouseMarker;

		// clean up DOM
		this._clearGuides();

		this._map
			.off('mouseup', this._onMouseUp, this)
			.off('mousemove', this._onMouseMove, this)
			.off('zoomlevelschange', this._onZoomEnd, this)
			.off('zoomend', this._onZoomEnd, this)
			.off('click', this._onTouch, this);
		
		this._container.style.cursor = '';

        this._removeShape();

        this._map.off('click', this._onClick, this);

        L.DomEvent.off(this._container, 'keyup', this._cancelDrawing, this);
    },

    _startShape: function () {
        this._drawing = true;
        this.options.shapeOptions.className = "lineMeasure";
        this._poly = new L.Polyline([], this.options.shapeOptions);

        this._container.style.cursor = 'crosshair';

        this._updateTooltip();
        this._map.on('mousemove', this._onMouseMove, this);
        
    },

    _finishShape: function () {
        this._drawing = false;
        
        if (this.type == "polyline"){
	        //마지막 포인트는 총거리도 추가
	        var markersLength = this._markers.length;
	        if (markersLength > 1)
	        {
	        	var marker = this._markers[markersLength-1];
	            var txt = '총길이: ' + this._getTooltipText().subtext + '</br>' + '구간길이: ' + marker._tooltip._content;
	        	marker._tooltip.setContent(txt);
	        }
        }
        
        var latlngs = this._poly._defaultShape ? this._poly._defaultShape() : this._poly.getLatLngs();
		var intersects = this._poly.newLatLngIntersects(latlngs[latlngs.length - 1]);

		if ((!this.options.allowIntersection && intersects) || !this._shapeIsValid()) {
			this._showErrorTooltip();
			return;
		}
		
		this._fireCreatedEvent();
		this.disable();
		if (this.options.repeatMode) {
			this.enable();
		}
		$(".icons-tb-ruler").parent().removeClass("active");
		$(".leaflet-marker-icon.leaflet-mouse-marker.leaflet-zoom-animated.leaflet-interactive").remove();
		
		// 시설물 큺릭 허용
		m_showInformation =true;
    },

    _removeShape: function () {
        if (!this._poly)
            return;
        this._map.removeLayer(this._poly);
        delete this._poly;
    },

	_onTouch: function (e) {
		// #TODO: use touchstart and touchend vs using click(touch start & end).
	},
	
	_onClick: function (e) {
        if (!this._drawing) {
            this._removeShape();
            this._startShape();
            return;
        }
    },

    _getTooltipText: function () {
        var labelText = L.Draw.Polyline.prototype._getTooltipText.call(this);
        if (!this._drawing) {
            labelText.text = '';
        }
        return labelText;
    },

    _cancelDrawing: function (e) {
        if (e.keyCode === 27) {
            disableMeasureBtn();
        }
    },
    
    clearLayers: function (e) {
    	
    	//return;
    	if (this._markerGroup)
    	{
    		if (this._markerGroup._layers)
	    	{
	    		for (var i in this._markerGroup._layers) {
	    			if (this._markerGroup._layers[i]._tooltip)
	    				this._map.removeLayer(this._markerGroup._layers[i]._tooltip);
	    			
	    		}
	    		for ( var j in this._map._layers){
	    			if(this._map._layers[j].options.className) {
	    				if(this._map._layers[j].options.className =="lineMeasure") {
	    					this._map.removeLayer(this._map._layers[j]);
	    				}
	    			}
	    		}
    		
	    		this._map.removeLayer(this._markerGroup._layers);
	    		this._markerGroup.clearLayers();
	    		this._map.removeLayer(this._markerGroup);
	    		delete this._markerGroup;
	    	}
    	}
    }
});

L.Polygon.Area = L.Draw.Polygon.extend({ // L.Polyline.Measure.extend({
    statics: {
        TYPE: 'polygon'
    },

    Poly: L.Polygon,

    options: {
        shapeOptions: {
            stroke: true,
            color: '#f06eaa',
            weight: 4,
            opacity: 0.5,
            fill: true,
            fillColor: null, //same as color by default
            fillOpacity: 0.2,
            clickable: true,
            className : 'areaMeasure'
        },
        metric: true, // Whether to use the metric meaurement system or imperial
        showArea: true, // Whether to display distance in the tooltip
        calcUnit: 'default'
    },

    initialize: function (map, options) {
        L.Draw.Polygon.prototype.initialize.call(this, map, options);

        // Save the type so super can fire, need to do this as cannot do this.TYPE :(
        this.type = L.Draw.Polygon.TYPE;
    },

    _startShape: function () {
        this._drawing = true;
        this._poly = new L.Polygon([], this.options.shapeOptions);

        this._container.style.cursor = 'crosshair';

        this._updateTooltip();
        this._map.on('mousemove', this._onMouseMove, this);
        $(".lineMeasure").remove()
        $(".icons-tb-area").parent().removeClass("active");
		$(".leaflet-marker-icon.leaflet-mouse-marker.leaflet-zoom-animated.leaflet-interactive").remove();
    },
    
    _finishShape: function () {
        this._drawing = false;
        
		var latlngs = this._poly._defaultShape ? this._poly._defaultShape() : this._poly.getLatLngs();
		var intersects = this._poly.newLatLngIntersects(latlngs[latlngs.length - 1]);

		var minx=180, miny=180, maxx=0, maxy=0;
		for (var i=0; i<latlngs.length; i++){
			if (minx > latlngs[i].lng) minx = latlngs[i].lng;
			if (maxx < latlngs[i].lng) maxx = latlngs[i].lng;
			if (miny > latlngs[i].lat) miny = latlngs[i].lat;
			if (maxy < latlngs[i].lat) maxy = latlngs[i].lat;
		}

		var cpt = new L.LatLng((miny + maxy) /2, (minx + maxx) / 2);
		
		if ((!this.options.allowIntersection && intersects) || !this._shapeIsValid()) {
			this._showErrorTooltip();
			return;
		}
		
		this._area = L.GeometryUtil.geodesicArea(latlngs);
		if (!this._poly._areaMarker) {
			this._poly._areaMarker = L.marker(cpt, {
				icon: L.divIcon({
					className: 'leaflet-mouse-marker',
					iconAnchor: [20, 20],
					iconSize: [40, 40]
				}),
				opacity: 0,
				zIndexOffset: this.options.zIndexOffset
			});
			
			this._map.addLayer(this._poly._areaMarker);
		}
		
		var txt = L.GeometryUtil.readableArea(this._area, this.options.metric, this.options.calcUnit);
		/*면적*/
		this._poly._areaMarker.bindTooltip("면적: "+txt, {permanent: true, className: "area-value", offset: [10, 0] });
		
		this._fireCreatedEvent();
		this.disable();
		if (this.options.repeatMode) {
			this.enable();
		}
		// 시설물 큺릭 허용
		m_showInformation =true;
    },
    
    _getTooltipText: function () {
        var showArea = this.options.showArea,
			labelText, distanceStr;

        if (this._markers.length === 0) {
            labelText = {
                text: L.drawLocal.draw.handlers.polyline.tooltip.start
            };
        } else if (this._markers.length < 3) {
            labelText = {
                text: L.drawLocal.draw.handlers.polyline.tooltip.cont
            };
        } else {
            if (showArea && this._area != undefined) {
                if (this._area > 1000000) //km로 변환
                    distanceStr = formatNumber((this._area / 1000000).toFixed(2)) + "㎢";
                else
                    distanceStr = formatNumber(this._area.toFixed(2)) + "㎡";
            }
            else {
                distanceStr = '';
            }

            labelText = {
                text: L.drawLocal.draw.handlers.polyline.tooltip.end,
                subtext: distanceStr
            };
        }
        return labelText;
    },

    _shapeIsValid: function () {
        return this._markers.length >= 3;
    },

    _cleanUpShape: function () {
        var markerCount = this._markers.length;

        if (markerCount > 0) {
            this._markers[0].off('click', this._finishShape, this);

            if (markerCount > 2) {
                this._markers[markerCount - 1].off('dblclick', this._finishShape, this);
            }
        }
    },
    _cancelDrawing: function (e) {
        if (e.keyCode === 27) {
            //disableAreaBtn();
        }
    },
    
    clearLayers: function (e) {
    	for ( var j in this._map._layers){
			if(this._map._layers[j].options.className) {
				if(this._map._layers[j].options.className =="area-value" || this._map._layers[j].options.className =="areaMeasure") {
					this._map.removeLayer(this._map._layers[j]);
				}
			}
		}
    }
});

function formatNumber(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
};

L.Control.DistanceControl = L.Control.extend({

    statics: {
        TITLE: '거리계산'
    },
    options: {
        position: 'topleft',
        handler: {}
    },

    toggle: function () {
        if (this.handler.enabled()) {
            this.handler.disable.call(this.handler);
        } else {
            this.handler.enable.call(this.handler);
        }
    },

    onAdd: function (map) {
        var className = 'leaflet-control-draw';

        var elList = document.getElementsByClassName('leaflet-bar');
        if (elList.length < 1)
            this._container = L.DomUtil.create('div', 'leaflet-bar');
        else
            this._container = elList[0];

        this.handler = new L.Polyline.Measure(map, this.options.handler);

        this.handler.on('enabled', function () {
            L.DomUtil.addClass(this._container, 'enabled');
        }, this);

        this.handler.on('disabled', function () {
            L.DomUtil.removeClass(this._container, 'enabled');
        }, this);

        var link = L.DomUtil.create('a', className + '-measure', this._container);
        link.href = '#';
        link.title = L.Control.DistanceControl.TITLE;

        L.DomEvent
            .addListener(link, 'click', L.DomEvent.stopPropagation)
            .addListener(link, 'click', L.DomEvent.preventDefault)
            .addListener(link, 'click', this.toggle, this);

        return this._container;
    }
});

L.Control.AreaControl = L.Control.extend({

    statics: {
        TITLE: '면적계산'
    },
    options: {
        position: 'topleft',
        handler: {}
    },

    toggle: function () {
        if (this.handler.enabled()) {
            this.handler.disable.call(this.handler);
        } else {
            this.handler.enable.call(this.handler);
        }
    },

    onAdd: function (map) {
        var className = 'leaflet-control-draw';

        var elList = document.getElementsByClassName('leaflet-bar');
        if (elList.length < 1)
            this._container = L.DomUtil.create('div', 'leaflet-bar');
        else
            this._container = elList[0];

        this.handler = new L.Polygon.Area(map, this.options.handler);

        this.handler.on('enabled', function () {
            L.DomUtil.addClass(this._container, 'enabled');
        }, this);

        this.handler.on('disabled', function () {
            L.DomUtil.removeClass(this._container, 'enabled');
        }, this);

        var link = L.DomUtil.create('a', className + '-area', this._container);
        link.href = '#';
        link.title = L.Control.AreaControl.TITLE;

        L.DomEvent
            .addListener(link, 'click', L.DomEvent.stopPropagation)
            .addListener(link, 'click', L.DomEvent.preventDefault)
            .addListener(link, 'click', this.toggle, this);

        return this._container;
    }
});

L.Map.mergeOptions({
    measureControl: false,
    areaControl: false
});

L.Map.addInitHook(function () {
    if (this.options.measureControl) {
        this.measureControl = L.Control.distanceControl().addTo(this);
    }
    if (this.options.areaControl) {
        this.areaControl = L.Control.areaControl().addTo(this);
    }
});

L.Control.distanceControl = function (options) {
    return new L.Control.DistanceControl(options);
};

L.Control.areaControl = function (options) {
    return new L.Control.AreaControl(options);
};


