GisApp.measure = function(options) {
	this.initialize(options);
};

GisApp.measure.helpTooltipElement;
GisApp.measure.helpTooltip;
GisApp.measure.sketch;
GisApp.measure.measureTooltipElement;
GisApp.measure.measureTooltip;
GisApp.measure.continueLineMsg = '선 그리기 종료를 위해 마우스를 더블클릭하세요.';
GisApp.measure.Polygon = "Polygon";
GisApp.measure.LineString = "LineString";

GisApp.measure.prototype = {
	map: null,
	draw: null,
	vector: null,
	type: null,
	initialize: function() {
		let me = this;
		let source = new ol.source.Vector();
		let vector = new ol.layer.Vector({
			source: source,
			style: new ol.style.Style({
				fill: new ol.style.Fill({
					color: 'rgba(255, 255, 255, 0.2)',
				}),
				stroke: new ol.style.Stroke({
					color: '#ffcc33',
					width: 2,
				}),
				image: new ol.style.Circle({
					radius: 7,
					fill: new ol.style.Fill({
						color: '#ffcc33',
					}),
				}),
			}),
		});
		me.map = GisApp.Module.core.map;
		me.vector = vector;
		me.map.addLayer(vector);
		me.map.removeInteraction(this.draw);
	},
	pointerMoveHandler: function(evt) {
		if (evt.dragging) {
			return;
		}
		let helpMsg = '시작점을 선택하세요';
		if (GisApp.measure.sketch) {
			helpMsg = GisApp.measure.continueLineMsg;
		}
		GisApp.measure.helpTooltipElement.innerHTML = helpMsg;
		GisApp.measure.helpTooltip.setPosition(evt.coordinate);
		GisApp.measure.helpTooltipElement.classList.remove('hidden');
	},
	formatLength: function(line) {
		let length = ol.sphere.getLength(line);
		let output;
		if (length > 1000) {
			output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
		} else {
			output = Math.round(length * 100) / 100 + ' ' + 'm';
		}
		return output;
	},
	formatArea: function(polygon) {
		let area = ol.sphere.getArea(polygon);
		let output;
		if (area > 10000) {
			output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
		} else {
			output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
		}
		return output;
	},
	addInteraction: function(type) {
		let me = this;
		me.map.removeInteraction(me.draw);
		me.map.on('pointermove', me.pointerMoveHandler);
		me.type = type;

		let source = me.vector.getSource();
		me.draw = new ol.interaction.Draw({
			source: source,
			type: type,
			style: new ol.style.Style({
				fill: new ol.style.Fill({
					color: 'rgba(255, 255, 255, 0.2)',
				}),
				stroke: new ol.style.Stroke({
					color: 'rgba(0, 0, 0, 0.5)',
					lineDash: [10, 10],
					width: 2,
				}),
				image: new ol.style.Circle({
					radius: 5,
					stroke: new ol.style.Stroke({
						color: 'rgba(0, 0, 0, 0.7)',
					}),
					fill: new ol.style.Fill({
						color: 'rgba(255, 255, 255, 0.2)',
					}),
				}),
			}),
		});

		me.map.addInteraction(me.draw);
		me.createMeasureTooltip();
		me.createHelpTooltip();

		let listener;
		me.draw.on('drawstart', function(evt) {
			let tooltipCoord = evt.coordinate;
			GisApp.measure.sketch = evt.feature;
			listener = GisApp.measure.sketch.getGeometry().on('change', function(evt) {
				let geom = evt.target;
				let output;
				if (geom instanceof ol.geom.Polygon) {
					output = me.formatArea(geom);
					tooltipCoord = geom.getInteriorPoint().getCoordinates();
				} else if (geom instanceof ol.geom.LineString) {
					output = me.formatLength(geom);
					tooltipCoord = geom.getLastCoordinate();
				}
				GisApp.measure.measureTooltipElement.innerHTML = output;
				GisApp.measure.measureTooltip.setPosition(tooltipCoord);
			});
		});

		me.draw.on('drawend', function() {
			GisApp.measure.measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
			GisApp.measure.measureTooltip.setOffset([0, -7]);
			GisApp.measure.sketch = null;
			// unset tooltip so that a new one can be created
			GisApp.measure.measureTooltipElement = null;
			me.createMeasureTooltip();
			ol.Observable.unByKey(listener);
			me.removeInteraction();
		});
	},
	removeInteraction: function() {
		$("#btn_control_ruler").removeClass("active");
		$("#btn_control_area").removeClass("active");

		this.map.removeInteraction(this.draw);
		this.map.removeOverlay(GisApp.measure.helpTooltip);
	},
	removeFeature: function() {
		let source = this.vector.getSource();
		let features = this.vector.getSource().getFeatures();
		for (let i in features) {
			let feature = features[i];
			source.removeFeature(feature);
		}
	},
	createHelpTooltip: function() {
		let me = this;
		if (GisApp.measure.helpTooltipElement) {
			GisApp.measure.helpTooltipElement.parentNode.removeChild(GisApp.measure.helpTooltipElement);
		}
		GisApp.measure.helpTooltipElement = document.createElement('div');
		GisApp.measure.helpTooltipElement.className = 'ol-tooltip hidden';
		GisApp.measure.helpTooltip = new ol.Overlay({
			element: GisApp.measure.helpTooltipElement,
			offset: [15, 0],
			positioning: 'center-left',
		});
		me.map.addOverlay(GisApp.measure.helpTooltip);
	},
	createMeasureTooltip: function() {
		let me = this;
		if (GisApp.measure.measureTooltipElement) {
			GisApp.measure.measureTooltipElement.parentNode.removeChild(GisApp.measure.measureTooltipElement);
		}
		GisApp.measure.measureTooltipElement = document.createElement('div');
		GisApp.measure.measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
		GisApp.measure.measureTooltip = new ol.Overlay({
			id: "measure",
			element: GisApp.measure.measureTooltipElement,
			offset: [0, -15],
			positioning: 'bottom-center',
		});
		me.map.addOverlay(GisApp.measure.measureTooltip);
	}
}