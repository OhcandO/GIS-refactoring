/**
 * GisApp.select
 * @requires gis.core.js
 */
GisApp.select = function(options) {
	this.initialize(options);
};

GisApp.select.helpTooltipElement;
GisApp.select.helpTooltip;
GisApp.select.helpMsg;

GisApp.select.prototype = {
	defaults: {
		hitTolerance : 10,
		control:true,
		},
	selectInteraction: null,
	dragBox: null,
	dragPolygon: null,
	selectedFeatures: [],
	selectFeatureFlag : false,
	initialize: function(options) {
		$.extend(this.defaults, options);
		if(this.defaults.control)this.addControl();
		this.setInteraction();
		this.pointerMoveEventHandler();
	},
	/**
	 * map에 select control 추가
	 */
	addControl: function() {
		let html = this.getEditHtml();
		let selectControl = function() {
			let element = document.createElement('div');
			element.className = 'select_control map_control_div ol-unselectable ol-control';
			element.innerHTML = html;
			ol.control.Control.call(this, {
				element: element
			});
		};

		ol.inherits(selectControl, ol.control.Control);
		GisApp.Module.core.map.addControl(new selectControl());
	},
	/**
	 * [공통] 편집 엘리먼트 생성
	 */
	getEditHtml: function() {
		let selectHtml = "";
		selectHtml += '<h3>선,면,다각형을 이용한 시설물 선택 영역</h3>';
		selectHtml += '<ul>';
		selectHtml += '<li>';
		selectHtml += '<a href="javascript:void(0);" onclick="GisApp.Module.select.setSingleInteration();" class="sprite_gis icon1 btn_select_one" title="단일선택"><span>단일선택</span></a>';
		selectHtml += '</li>';
		selectHtml += '<li>';
		selectHtml += '<a href="javascript:void(0);" onclick="GisApp.Module.select.setBoxInteration();" class="sprite_gis icon2 btn_select_rectangle" title="직사각형"><span>면</span></a>';
		selectHtml += '</li>';
		selectHtml += '<li>';
		selectHtml += '<a href="javascript:void(0);" onclick="GisApp.Module.select.setPolygonInteration();" class="sprite_gis icon3 btn_select_area" title="폴리곤"><span>다각형</span></a>';
		selectHtml += '</li>';
		selectHtml += '<li>';
		selectHtml += '<a href="javascript:void(0);" onclick="GisApp.Module.select.reset();" class="sprite_gis icon4 btn_select_cancel" title="새로고침"><span>새로고침</span></a>';
		selectHtml += '</li>';
		selectHtml += '</ul>';
		return selectHtml;
	},
	/**
	 * SELECT 이벤트 등록
	 */
	setInteraction: function() {
		let me = this;
		let map = GisApp.Module.core.map;
		if (this.selectInteraction) {
			this.removeInteration();
		}
		
		let style = new ol.style.Style({
			image : new ol.style.Circle({
				fill : new ol.style.Fill({
					color : "red"
				}),
				radius : 10
			}),
			stroke : new ol.style.Stroke({
				color : "red",
				width : 7,
				lineDash:[10,10]
			}),
			fill: new ol.style.Fill({
				color: 'rgba(232,16,41,0.26)',
			}),
			zIndex: Infinity,
		});
		this.selectInteraction = new ol.interaction.Select({
			style: style,
			layers: function(layer) {
				let selectable = layer.get("selectable");
//				let editable = layer.get("editable");
				return selectable === "Y";
			},
			condition: ol.events.condition.click,
			hitTolerance:me.defaults.hitTolerance,
		});
		map.addInteraction(this.selectInteraction);

		this.selectedFeatures = this.selectInteraction.getFeatures();
	},
	/**
	 * SELECT 피처 초기화
	 */
	reset: function() {
		let me = this;
		if(GisApp.Module.edit){
			GisApp.Module.edit.setDrawActive(false);
		}
		me.setActive(true);
		me.removeHelpTooltip();
		
		let map = GisApp.Module.core.map;
		map.removeInteraction(me.dragBox);
		map.removeInteraction(me.dragPolygon);
		
		this.selectInteraction.addCondition_ = ol.events.condition.never;
		this.selectFeatureFlag = false;
		
		if (GisApp.Module.toolbar) {
			GisApp.Module.toolbar.removeMeasureFeature();
			GisApp.Module.core.deleteOverlay("measure");
		}
		
		this.resetSelectedFeature();
	},
	/**
	 * 단일 SELECT 이벤트 등록
	 */
	setSingleInteration: function() {
		this.reset();
		this.selectInteraction.addCondition_ = ol.events.condition.click
		this.selectFeatureFlag = true;
	},
	/**
	 * 박스 SELECT 이벤트 등록
	 */
	setBoxInteration: function() {
		//초기화
		this.reset();
		this.selectFeatureFlag = true;
		
		let me = this;
		let map = GisApp.Module.core.map;
		me.dragBox = new ol.interaction.DragBox({
			condition: ol.events.condition.mouseOnly,
		});
		map.addInteraction(this.dragBox);
		GisApp.select.helpMsg = "직사각형 시작점을 클릭하고 드래그하세요."
		me.createHelpTooltip();
		me.dragBox.on('boxend', function() {
			let rotation = map.getView().getRotation();
			let oblique = rotation % (Math.PI / 2) !== 0;
			let candidateFeatures = oblique ? [] : me.selectedFeatures;
			let extent = me.dragBox.getGeometry().getExtent();
			let layers = map.getLayers();
			for (let i in layers.getArray()) {
				let layer = layers.getArray()[i];
				if (layer.get("selectable") && me.getVisible(layer)) {
					layer.getSource().forEachFeatureIntersectingExtent(extent, function(feature) {
						candidateFeatures.push(feature);
					});
				}
			}

			if (oblique) {
				let anchor = [0, 0];
				let geometry = me.dragBox.getGeometry().clone();
				geometry.rotate(-rotation, anchor);
				let extent$1 = geometry.getExtent();
				candidateFeatures.forEach(function(feature) {
					let geometry = feature.getGeometry().clone();
					geometry.rotate(-rotation, anchor);
					if (geometry.intersectsExtent(extent$1)) {
						me.selectedFeatures.push(feature);
					}
				});
			}
			me.selectInteraction.dispatchEvent({
				type: 'select',
				selected: me.selectedFeatures,
				deselected: []
			});
			map.removeInteraction(me.dragBox);

		});

		me.dragBox.on('boxstart', function() {
			me.removeHelpTooltip();
			me.selectedFeatures.clear();
		});
	},
	/**
	 * 폴리곤 SELECT 이벤트 등록
	 */
	setPolygonInteration: function() {
		this.reset();
		this.selectFeatureFlag = true;
		
		let me = this;
		let map = GisApp.Module.core.map;

		//폴리곤 레이어 생성
		let polygonSource = new ol.source.Vector({
			useSpatialIndex: false
		});
		let polygonLayer = new ol.layer.Vector({
			source: polygonSource
		});
		map.addLayer(polygonLayer);

		//폴리곤 draw 객체 생성
		me.dragPolygon = new ol.interaction.Draw({
			source: polygonSource,
			type: 'Polygon',
			condition: ol.events.condition.mouseOnly
		});
		map.addInteraction(me.dragPolygon);

		//툴팁 추가
		GisApp.select.helpMsg = "시작점을 클릭하세요."
		me.createHelpTooltip();

		me.dragPolygon.on('drawstart', function() {
			me.removeHelpTooltip();
			me.selectedFeatures.clear();
		});

		me.dragPolygon.on('drawend', function(evt) {
			setTimeout(function() {
				let polygon = evt.feature.getGeometry();
				let layers = map.getLayers();
				for (let i in layers.getArray()) {
					let layer = layers.getArray()[i];
					if (layer.get("selectable") && me.getVisible(layer)) {
						let features = layer.getSource().getFeatures();
						for (let j = 0; j < features.length; j++) {
							if (polygon.intersectsExtent(features[j].getGeometry().getExtent())) {
								me.selectedFeatures.push(features[j]);
							}
						}
					}
				}
				me.selectInteraction.dispatchEvent({
					type: 'select',
					selected: me.selectedFeatures,
					deselected: []
				});
				map.removeInteraction(me.dragPolygon);
				map.removeLayer(polygonLayer);
			}, 300)
		});
		return me.dragPolygon;
	},
	/**
	 * 레이어 추가
	 */
	addLayer: function(layer) {
		if (layer) {
			layer.set('selectable', "Y");
		}
	},
	/**
	 * 레이어 삭제
	 */
	removeLayer: function(layer) {
		if (layer) {
			layer.set('selectable', "N");
		}
	},
	/**
	 * 선택된 객체 초기화
	 */
	resetSelectedFeature: function() {
		let me = this;
		this.selectedFeatures.clear();
		this.selectInteraction.dispatchEvent({
			type: 'select',
			selected: me.selectedFeatures,
			deselected: []
		});
	},
	/**
	 * SELECT 이벤트 활성화
	 */
	setActive: function(active) {
		this.selectInteraction.setActive(active);
	},
	/**
	 * SELECT 이벤트 삭제
	 */
	removeInteration: function() {
		let map = GisApp.Module.core.map;
		map.removeInteraction(this.selectInteraction);
		this.selectInteraction = null;

		//포인터 변경 삭제
		this.removePointerMoveEventHandler("pointerMoveForSelect");
	},
	/**
	 * 피처 위에 마우스 오버시 포인터 변경
	 */
	pointerMoveEventHandler: function() {
		let me = this;
		let map = GisApp.Module.core.map;
		let pointerMoveForSelect = function(evt) {
			let hit = this.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
				if (layer && layer.get('selectable') == 'Y') {
					return true;	
				}
				else return false;
			},{hitTolerance:me.defaults.hitTolerance});
			
			if (hit&&me.selectInteraction.getActive()) {
				this.getTargetElement().style.cursor = 'pointer';
			} else {
				this.getTargetElement().style.cursor = '';
			}
		}
		map.on("pointermove", pointerMoveForSelect);
	},
	/**
	 * 포인터 이벤트 삭제
	 */
	removePointerMoveEventHandler: function(fnNm) {
		GisApp.Module.core.removeMapEventFnNm("pointermove", fnNm);
	},
	/**
	 * 선택된 피처 정보 반환(callback)
	 */
	getSelectedInfo: function(callback) {
		let me = this;
		this.selectInteraction.on('select', function(e) {
			if(!e.auto){
				let features = me.selectInteraction.getFeatures();
				let layers = [];
				for(let i in features.getArray()){
					let feature = features.getArray()[0];
					let layer = me.selectInteraction.getLayer(feature);
					layers.push(layer);
				}
				callback(features.getArray(),layers);
			}
		});
	},
	/**
	 * 선택된 피처 정보 반환
	 */
	getSelectedFeatures: function() {
		return this.selectInteraction.getFeatures();
	},
	/**
	 * 마지막으로 선택된 피처 정보 반환
	 */
	getLastSelectedFeatures: function() {
		
		return this.selectInteraction.getFeatures();
	},
	/**
	 * 툴팁 생성
	 */
	createHelpTooltip: function() {
		let me = this;
		let map = GisApp.Module.core.map;
		GisApp.select.helpTooltipElement = document.createElement('div');
		GisApp.select.helpTooltipElement.className = 'ol-tooltip hidden';
		GisApp.select.helpTooltip = new ol.Overlay({
			element: GisApp.select.helpTooltipElement,
			offset: [15, 0],
			positioning: 'center-left',
		});
		map.addOverlay(GisApp.select.helpTooltip);
		map.on('pointermove', me.pointerMoveTooltipHandler);
	},
	/**
	 * 툴팁 삭제
	 */
	removeHelpTooltip: function() {
		if(GisApp.select.helpTooltipElement){
			let map = GisApp.Module.core.map;
			this.removePointerMoveEventHandler("pointerMoveTooltipHandler");
			map.removeOverlay(GisApp.measure.helpTooltip);
			GisApp.select.helpTooltipElement.remove();
		}
	},
	/**
	 * 툴팁용 포인터 move 이벤트
	 */
	pointerMoveTooltipHandler: function(evt) {
		if (evt.dragging) {
			return;
		}
		GisApp.select.helpTooltipElement.innerHTML = GisApp.select.helpMsg;
		GisApp.select.helpTooltip.setPosition(evt.coordinate);
		GisApp.select.helpTooltipElement.classList.remove('hidden');
	},
	getVisible: function(layer) {
		let maxZoom = layer.getMaxZoom();
		let minZoom = layer.getMinZoom();
		let map = GisApp.Module.core.map;
		let curZoom = map.getView().getZoom();
		if (layer.getVisible() && maxZoom > curZoom && minZoom < curZoom) {
			return true;
		}
		return false;
	},
	/**
	 * 피처 셀렉트
	 */
	 selectFeature : function (feature){
		let me = this;
		me.selectedFeatures.clear();
		me.selectedFeatures.push(feature);
		me.selectInteraction.dispatchEvent({
			type: 'select',
			selected: me.selectedFeatures,
			deselected: [],
			auto:true,
		});
	},
}