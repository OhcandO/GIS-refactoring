/**
 * GisApp.helptooltip
 * @requires gis.core.js
 */
GisApp.helptooltip = function(options) {
	this.initialize(options);
};

GisApp.helptooltip.helpTooltipElement;
GisApp.helptooltip.helpTooltip;
GisApp.helptooltip.helpMsg;

GisApp.helptooltip.prototype = {
	helpTooltipEvtId: null,
	pointerMoveCnt: 0,
	initialize: function(helpMsg) {
		GisApp.helptooltip.helpMsg = helpMsg;
	},
	/**
	 * 툴팁 생성
	 */
	createHelpTooltip: function() {
		let me = this;
		let core = GisApp.Module.core;
		let map = core.map;
		GisApp.helptooltip.helpTooltipElement = document.createElement('div');
		GisApp.helptooltip.helpTooltipElement.className = 'ol-tooltip hidden';
		GisApp.helptooltip.helpTooltip = new ol.Overlay({
			element: GisApp.helptooltip.helpTooltipElement,
			offset: [15, 0],
			positioning: 'center-left',
		});
		map.addOverlay(GisApp.helptooltip.helpTooltip);
		this.helpTooltipEvtId = "helpToolTip"+Math.floor(Math.random()*1000000);
		core.addMapEvent("pointermove",this.helpTooltipEvtId,this.pointerMoveHandler);
	},
	/**
	 * 툴팁 삭제
	 */
	removeHelpTooltip: function() {
		let core = GisApp.Module.core;
		if(GisApp.helptooltip.helpTooltipElement){
			let map = core.map;
			core.removeMapEvent("pointermove",this.helpTooltipEvtId);
			map.removeOverlay(GisApp.helptooltip.helpTooltip);
			GisApp.helptooltip.helpTooltipElement.remove();
		}
	},
	/**
	 * 툴팁용 포인터 move 이벤트
	 */
	pointerMoveHandler: function(evt) {
		if (evt.dragging) {
			return;
		}
		GisApp.helptooltip.helpTooltipElement.innerHTML = GisApp.helptooltip.helpMsg;
		GisApp.helptooltip.helpTooltip.setPosition(evt.coordinate);
		GisApp.helptooltip.helpTooltipElement.classList.remove('hidden');
	},
}