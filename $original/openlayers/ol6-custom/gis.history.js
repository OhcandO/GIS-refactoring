/**
 * GisApp.history
 * @requires gis.core.js
 */
GisApp.history = function(options) {
	this.initialize(options);
};

GisApp.history.prototype = {
	defaults: {
		targetId: "historyControl",
		location: [],
		indexloc: -1,
		isMoveHist: false,
	},
	initialize: function(options) {
		$.extend(this.defaults, options);
		this.addControl();
		this.mapMoveEventHandler();
	},
	/**
	 * map에 history control 추가
	 */
	addControl: function() {
		let html = this.getEditHtml();
		let historyControl = function() {
			let element = document.createElement('div');
			element.className = 'bookmark_control map_control_div ol-unselectable ol-control';
			element.innerHTML = html;
			ol.control.Control.call(this, {
				element: element
			});
		};

		ol.inherits(historyControl, ol.control.Control);
		GisApp.Module.core.map.addControl(new historyControl());
	},
	getEditHtml: function() {
		let historyHtml = "";
		historyHtml += '<h3>선,면,다각형을 이용한 시설물 선택 영역</h3>';
		historyHtml += '<ul>';
		historyHtml += '<li>';
		historyHtml += '<a href="javascript:void(0);" onclick="GisApp.Module.history.prev();" class="sprite_gis icon1 btn_control_prev" title="이전"><span>이전</span></a>';
		historyHtml += '</li>';
		historyHtml += '<li>';
		historyHtml += '<a href="javascript:void(0);" onclick="GisApp.Module.history.next();" class="sprite_gis icon2 btn_control_next" title="다음"><span>다음</span></a>';
		historyHtml += '</li>';
		historyHtml += '</ul>';

		return historyHtml;
	},
	prev: function() {
		let me = this;
		if (me.defaults.indexloc <= 0) {
			alert("이전 히스토리가 없습니다.");
			return;
		}
		this.move(-1);
	},
	next: function() {
		let me = this;
		if (me.defaults.location.length <= me.defaults.indexloc + 1) {
			alert("다음 히스토리가 없습니다.");
			return;
		}
		this.move(1);
	},
	move: function(index) {
		let me = this;
		let map = GisApp.Module.core.map;
		let view = map.getView();

		me.defaults.indexloc += index;
		let locInfo = me.defaults.location[me.defaults.indexloc];
		view.setZoom(locInfo.zoom);
		view.setCenter(locInfo.center);

		me.defaults.isMoveHist = true;
	},
	mapMoveEventHandler: function() {
		let me = this;
		let map = GisApp.Module.core.map;

		map.on('moveend', function(event) {
			let view = map.getView();
			let zoom = view.getZoom();
			let center = view.getCenter();

			if (!me.defaults.isMoveHist) {
				me.defaults.location.push({ "zoom": zoom, "center": center });
				me.defaults.indexloc++;
			}
			me.defaults.isMoveHist = false;
		});
	}
}

