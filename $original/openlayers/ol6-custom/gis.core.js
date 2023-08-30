const GisApp = new Object();

/**
 * GisApp 전역변수 생성
 */
//레이어 정보
GisApp.layerInfos = [];

//기본정보
GisApp.GEOSERVER_URL = "/geoserver/uew/ows";
GisApp.VWORLD_URL =
  "http://xdworld.vworld.kr:8080/2d/Base/service/{z}/{x}/{y}.png";
GisApp.VWORLD_SATELLITE_URL =
  "http://xdworld.vworld.kr:8080/2d/Satellite/service/{z}/{x}/{y}.jpeg";
GisApp.DAUM_ROADVIEW_URL =
  "http://map{s}.daumcdn.net/map_roadviewline/7.00/L{z}/{y}/{x}.png";
GisApp.FROM_PROJ = "EPSG:4326"; //aka구글좌표계
GisApp.SHP_PROJ = "EPSG:5181"; //대부분 GIS 데이터 좌표계 setGlobalVar() 함수로 갱신됨
GisApp.BASE_MAP_PROJ = "EPSG:3857"; //vworld 배경지도 좌표계
GisApp.SRC_MAX_ZOOM = 19; //배경지도의 src 줌 한정
GisApp.CONTEXT_PATH =
  location.protocol + "//" + location.host + "/js-lib/openlayers/ol6-custom/";
GisApp.layerCode = {};

GisApp.SERV_BLSM_CODE = [];

GisApp.hlLayerId = "highLightFeatureList";
GisApp.hLayerId = "highLightFeature";

//모듈
GisApp.Module = {
  core: null,
  tree: null,
  select: null,
  edit: null,
  history: null,
  minimap: null,
  toolbar: null,
  contextmenu: null,
};

/**
 * GisApp.layerInfos Set
 */
GisApp.setLayerInfos = function (layerInfos) {
  GisApp.layerInfos = layerInfos;
};

/**
 * GisApp core
 * @requires gis.layer.js
 * @requires gis.reset.js
 */
GisApp.core = function (options) {
  this.initialize(options);
};

GisApp.core.prototype = {
  defaults: {
    targetId: "map-canvas",
    centerY: 36.306508,
    centerX: 127.5714798,
    zoom: 17,
    minZoom: 10,
    maxZoom: 23,
    //		bounds: [Number(126.77709357063877), Number(36.9042890299246), Number(127.15416623954573), Number(37.144791770842716)]
  },
  gisLayer: null,
  reset: null,
  map: {}, // ol.Map
  view: {}, // ol.view
  interactions: {}, // interaction 모음 객체
  selectedFeature: null, // 현재 선택된 feature
  baseLayers: {},
  layers: {},
  initialize: function (options) {
    let me = this;
    //globals.properties 에서 설정정보 불러오기
    $.when(me.setGlobalVar()).done(() => {
      GisApp.layerCode = me.convertLayerInfosToLayerCode(
        GisApp.layerInfos,
        "id"
      );
      $.extend(me.defaults, options);
      me.initMap();
      me.gisLayer = new GisApp.layer(this.defaults);
      me.reset = new GisApp.reset();
    });
  },
  layerType: {
    point: "POINT",
    line: "LINE",
    poligon: "POLIGON",
  },
  initMap: function () {
    ol.proj.proj4.register(proj4);
    this.fnInitMapVworld();
    this.setCenter(this.defaults.centerX, this.defaults.centerY);
  },
  fnInitMapVworld: function () {
    let me = this;
    /**
     * 지도 생성
     */
    this.baseLayers["emap"] = new ol.layer.Tile({
      id: "emap",
      visible: true,
      type: "base",
      //			preload: Infinity,
      source: new ol.source.XYZ({
        url: GisApp.VWORLD_URL,
        maxZoom: GisApp.SRC_MAX_ZOOM, // View 의 줌 레벨이 늘어나도 요청하는 url 은 19로 고정 (화면만 커짐)
        crossOrigin: "anonymous",
      }),
    });
    this.baseLayers["satellite"] = new ol.layer.Tile({
      id: "satellite",
      visible: false,
      type: "base",
      source: new ol.source.XYZ({
        url: GisApp.VWORLD_SATELLITE_URL,
        maxZoom: GisApp.SRC_MAX_ZOOM, // View 의 줌 레벨이 늘어나도 요청하는 url 은 19로 고정 (화면만 커짐)
        crossOrigin: "anonymous",
      }),
    });
    this.baseLayers["roadview"] = new ol.layer.Tile({
      id: "roadview",
      visible: false,
      type: "base",
      source: new ol.source.XYZ({
        url: GisApp.DAUM_ROADVIEW_URL,
        crossOrigin: "anonymous",
      }),
    });

    this.map = new ol.Map({
      target: this.defaults.targetId,
      interactions: ol.interaction.defaults({
        doubleClickZoom: false,
      }),
      view: new ol.View({
        //				projection: GisApp.BASE_MAP_PROJ,
        zoom: this.defaults.zoom,
        center: ol.proj.transform(
          [Number(this.defaults.centerX), Number(this.defaults.centerY)],
          GisApp.FROM_PROJ,
          GisApp.BASE_MAP_PROJ
        ),
        minZoom: this.defaults.minZoom,
        maxZoom: this.defaults.maxZoom,
        //extent: ol.proj.transformExtent(this.defaults.bounds, GisApp.FROM_PROJ, GisApp.BASE_MAP_PROJ)
      }),
      controls: ol.control
        .defaults({
          zoom: false,
          attributionOptions: {
            collapsible: false,
          },
        })
        .extend([]),
      layers: [
        this.baseLayers["satellite"],
        this.baseLayers["roadview"],
        this.baseLayers["emap"],
      ],
    });
  },
  /**
   * [사용]베이스 레이어 변경
   * Parameters:
   * _title - {String} 베이스 레이어 이름
   *
   * Returns:
   */
  changeBaseLayer: function (_id) {
    Object.entries(this.baseLayers).forEach(([id, layer]) =>
      id === _id ? layer.setVisible(true) : layer.setVisible(false)
    );
    //		this.map.getLayers().forEach(function(layer) {
    //			let type = layer.get('type');
    //			let id = layer.get('id');
    //			if (type == "base") {
    //				if (id == _id) {
    //					layer.setVisible(true);
    //				} else {
    //					layer.setVisible(false);
    //				}
    //			}
    //		});
  },
  /**
   * [사용]지도 중심좌표 설정
   */
  setCenter: function (x, y, transYn) {
    if (!x || !y) return;
    let view = this.map.getView();
    if (!transYn) {
      // 값이 없으면
      let center = ol.proj.transform(
        [Number(x), Number(y)],
        GisApp.FROM_PROJ,
        GisApp.BASE_MAP_PROJ
      );
      view.setCenter(center);
    } else {
      view.setCenter([Number(x), Number(y)]);
    }
  },
  /*
   * [사용]zoom 설정
   */
  setZoom: function (zoom) {
    if (!zoom) return;
    this.map.getView().setZoom(zoom);
  },
  /*
   * [사용]zoom 정보 반환
   */
  getZoom: function () {
    return this.map.getView().getZoom();
  },
  /**
   * [사용]레이어 맵에 추가(외부에서 생성된 layer를 파라미터로 받아 맵에 추가)
   */
  setWfsLayerOnMap: function (layer) {
    this.deleteLayer(layer.get("id"));
    this.map.addLayer(layer);
    return layer;
  },
  /**
   * [사용]레이어 생성(지오서버에서 WFS 방식으로 레이어정보 가져와 레이어 생성)
   */
  getWfsLayer: function (layerCodeObj, addLayerOpt) {
    return this.gisLayer.getWfsLayer(layerCodeObj, addLayerOpt);
  },
  /**
   * [사용]레이어 맵에 추가(getWfsLayer 사용하여 레이어 생성)
   */
  addWfsLayer: function (layerCodeObj, addLayerOpt) {
    let layer = this.getWfsLayer(layerCodeObj, addLayerOpt);
    this.deleteLayer(layer.get("id"));
    this.map.addLayer(layer);
    return layer;
  },
  /**
   * [사용]레이어 삭제
   */
  deleteLayer: function (layerId) {
    if (!layerId) return;
    let layer = this.getLayerById(layerId);
    if (layer != null) {
      this.map.removeLayer(layer);
    }
  },
  /**
   * [사용]레이어이름으로 레이어 조회 반환
   */
  getLayerById: function (layerId) {
    if (!layerId) return;
    let layer = null;
    this.map.getLayers().forEach(function (el) {
      if (el != null && el.get("id") != null) {
        let vlayerId = el.get("id");
        if (vlayerId == layerId) {
          layer = el;
        }
      }
    });
    return layer;
  },
  /**
   * [사용]오버레이 전체 삭제
   */
  deleteAllOverlay: function () {
    let map = this.map;
    let overlays = map.getOverlays();
    if (overlays != null) {
      let overlayArray = overlays.getArray();
      let overlaySize = overlayArray.length;
      if (overlaySize > 0) {
        for (let i = overlaySize - 1; i >= 0; i--) {
          let overlay = overlayArray[i];
          map.removeOverlay(overlay);
        }
      }
    }
  },
  /**
   * [사용]오버레이 아이디로 삭제
   */
  deleteOverlay: function (_id) {
    let map = this.map;
    let overlays = map.getOverlays();
    if (overlays != null) {
      let overlayArray = overlays.getArray();
      let overlaySize = overlayArray.length;
      if (overlaySize > 0) {
        for (let i = overlaySize - 1; i >= 0; i--) {
          let overlay = overlayArray[i];
          let id = overlay.getId();
          if (id === _id) {
            map.removeOverlay(overlay);
          }
        }
      }
    }
  },
  /**
   * [사용]맵 이벤트 삭제
   */
  removeMapEventFnNm: function (handlerNm, fnNm) {
    let map = this.map;
    for (let i in map.listeners_[handlerNm]) {
      let listener = map.listeners_[handlerNm][i];
      if (listener.name == fnNm) {
        map.listeners_[handlerNm].splice(i, 1);
      }
    }
  },
  /**
   * [사용]위경도 -> 시분초 변환
   */
  coordTrans: function (coord) {
    let str = String(coord); /* String 변환 */
    let split = str.split("."); /* 소수점 split */
    let hour = split[0]; /* 시간 */
    let minute = parseFloat(
      (coord - parseInt(split[0]).toFixed(6)) * 60
    ).toFixed(6);
    let min = String(minute).split(".")[0];
    let second = parseFloat((minute - parseInt(min)) * 60).toFixed(2);
    return hour + "도  " + min + "분  " + second + "초";
  },
  /**
   * [사용]시분초  -> 위경도 변환
   */
  coordTransrate: function (degree, minute, second) {
    let min = (Number(minute) / 60).toFixed(2);
    let sec = (Number(second) / 3600).toFixed(4);
    return degree + Number(min) + Number(sec);
  },
  /**
   * [사용]마우스 좌표 위치
   */
  mousePositionControl: function () {
    let element = document.getElementById("label_lonlat");
    let me = this;
    let mousePosition = new ol.control.MousePosition({
      coordinateFormat: function (coordinate) {
        let text = "";
        if (element) {
          let lng = coordinate[0];
          let lat = coordinate[1];
          text +=
            "경도 : " + lng.toFixed(7) + " ( " + me.coordTrans(lng) + " ) ";
          text += "위도 : " + lat.toFixed(7) + "( " + me.coordTrans(lat) + " )";
        }
        return text;
      },
      projection: GisApp.FROM_PROJ,
      className: "custom-mouse-position",
      target: document.getElementById("label_lonlat"),
    });
    this.map.addControl(mousePosition);
  },
  /**
   * [사용]스케일 표시
   */
  scaleControl: function () {
    let scale = new ol.control.ScaleLine({
      minWidth: 100,
      units: "metric",
    });
    this.map.addControl(scale);
  },
  /**
   * [사용]레이어 맵에 셋팅
   *
   * Parameters:
   * layerList - {Array} [layerNm : GisApp.layerCode 키]
   * visible - {Boolean} 레이어 visible 여부
   *
   * Returns:
   */
  setLayerOnMap: function (layerIds, visible) {
    for (let i in layerIds) {
      let id = layerIds[i];
      let layer = this.getLayerById(id);
      if (layer) {
        layer.setVisible(visible);
      } else if (visible) {
        layer = this.addWfsLayer(GisApp.layerCode[id]);
      }
    }

    if (GisApp.Module.select) {
      this.setSelectInteraction();
    }
  },
  /**
   * [사용]shp 파일 다운로드
   */
  getShapeLayer: function (option) {
    this.gisLayer.getShapeLayer(option);
  },
  /**
   * [사용]레이어 셀렉트 가능하게 셋팅
   */
  setSelectInteraction: function () {
    let layers = this.map.getLayers().getArray();

    if (layers instanceof Array) {
      layers.forEach((layer) => {
        if (
          layer.get("selectable") &&
          layer.get("selectable").toUpperCase() == "Y" &&
          layer.get("type") !== "base"
        ) {
          GisApp.Module.select.addLayer(layer);
        }
      });
    }
  },
  /**
   * [사용]layerInfos(array) To layerCode(Object)
   */
  convertLayerInfosToLayerCode: function (array, key, parentName) {
    let initialValue = {};
    for (let i = 0; i < array.length; i++) {
      let item = {};
      Object.assign(item, array[i]);

      if (parentName) {
        item.parentName = parentName;
      }
      initialValue[item[key]] = item;

      if (item.childList && item.childList.length > 0) {
        let child = this.convertLayerInfosToLayerCode(
          item.childList,
          key,
          item.name
        );
        Object.assign(initialValue, child);
      }
      if (initialValue[item[key]].childList) {
        delete initialValue[item[key]].childList;
      }
    }
    return initialValue;
  },
  /**
   * [사용]피처 좌표값 WKT포맷으로 변경
   */
  convertFeatureGeomToWKT: function (feature) {
    let geometry = feature.getGeometry();
    let format = new ol.format.WKT();
    let wktGeom = format.writeGeometry(geometry);
    return wktGeom;
  },
  /**
   * [사용]WKT포맷 Geometry로 변경
   */
  convertWktToGeom: function (wtkGeom) {
    let format = new ol.format.WKT();
    let geom = format.readGeometry(wtkGeom);
    return geom;
  },
  /**
   * [사용]좌표와 properties의 키값으로 피처 검색
   */
  getFeatureGeomProp: function (geometry, ftrIds, ftrCde) {
    let returnFeature;
    this.map.getLayers().forEach(function (layer) {
      let type = layer.get("type");
      if (type != "base") {
        let source = layer.getSource();

        let type = geometry.getType();
        let coordinates = geometry.getCoordinates();
        if (type.toUpperCase() === "POINT") {
          coordinates = [coordinates];
        } else {
          coordinates = coordinates[0];
        }
        let featureFtrIds;
        let featureFtrCde;
        for (let i in coordinates) {
          let coordinate = coordinates[i];
          let feature = source.getClosestFeatureToCoordinate(coordinate);
          if (feature) {
            let properties = feature.getProperties();
            featureFtrIds = properties["FTR_IDS"];
            featureFtrCde = properties["FTR_CDE"];
            if (ftrIds == featureFtrIds && ftrCde == featureFtrCde) {
              returnFeature = feature;
            }
          }
        }
      }
    });
    return returnFeature;
  },
  /**
   * [사용]맵 이벤트 추가
   */
  addMapEvent: function (evtNm, id, callback) {
    if (id) {
      let evt = this.map.on(evtNm, callback);
      evt.listener.id = id;
    }
  },
  /**
   * [사용]맵 이벤트 삭제
   */
  removeMapEvent: function (evtNm, id) {
    if (id) {
      let listeners = this.map.listeners_[evtNm];
      for (let i in listeners) {
        let listenter = listeners[i];
        if (listenter.id == id) {
          listeners.splice(i, 1);
        }
      }
    }
  },
  /**
   * [사용]마커 그리기 추가
   */
  drawMarker: function (layer, callback) {
    let map = this.map;
    let drawSource = layer.getSource();
    let draw = new ol.interaction.Draw({
      type: "Point",
      source: drawSource,
      condition: function (evt) {
        return true;
      },
    });
    map.addInteraction(draw);
    draw.on("drawend", function (event) {
      callback(event);
      map.removeInteraction(draw);
    });
  },
  /**
   * [사용]피처 삭제
   */
  deleteFeature: function (layerId, featureId) {
    if (!layerId || !featureId) return;
    let layer = this.getLayerById(layerId);
    if (layer != null) {
      let feature = layer.getSource().getFeatureById(featureId);
      if (feature != null) {
        layer.getSource().removeFeature(feature);
      }
    }
  },
  /**
   * [사용]레이어
   */
  fitExtent: function (extent) {
    let map = this.map;
    let mapSize = map.getSize();
    map.getView().fit(extent, { size: [mapSize[0] - 200, mapSize[1] - 200] });
  },
  getGeomLineOfFeature: function (feature) {
    if (!feature) {
      return;
    }
    let geometry = feature.getGeometry();
    let type = geometry.getType();
    if (!(type == "LineString" || type == "MultiLineString")) {
      return;
    }
    let geomLienString = geometry;
    if (type != "LineString") {
      lienString = geometry.getLineString();
    }
    return geomLienString;
  },
  getCenterOfLineFeature: function (feature) {
    if (!feature) {
      return;
    }
    let center = [];
    /*let geomLienString = this.getGeomLineOfFeature(feature);
		let coords = geomLienString.getCoordinates();
		let coordCnt = coords.length;
		if(coordCnt==1){
			coords = coords[0];
		}
		if(coordCnt==2){
			let extent = geomLienString.getExtent();
			let x = extent[0] + (extent[2]-extent[0])/2;
			let y = extent[1] + (extent[3]-extent[1])/2;
			center.push(x);
			center.push(y);
		}else{
			let coord = coords[Math.floor(coordCnt/2)];
			center.push(coord[0]);
			center.push(coord[1]);
		}*/

    let extent = feature.getGeometry().getExtent();
    let x = extent[0] + (extent[2] - extent[0]) / 2;
    let y = extent[1] + (extent[3] - extent[1]) / 2;
    center.push(x);
    center.push(y);
    return center;
  },
  setGlobalVar: function () {
    return $.ajax({
      url:
        location.protocol + "//" + location.host + "/" + "globalsGisInfo.do?",
      type: "GET",
      dataType: "JSON",
      async: false,
      success: function (result) {
        //				_defMapType = result.data.globalsGisMapType;
        GisApp.core.prototype.defaults.centerY = Number(
          result.data.globalsGisLat
        );
        GisApp.core.prototype.defaults.centerX = Number(
          result.data.globalsGisLng
        );
        GisApp.core.prototype.defaults.zoom = Number(
          result.data.globalsGisZoomLevel
        );
        GisApp.core.prototype.defaults.minZoom = Number(
          result.data.globalsGisMinZoomLevel
        );
        GisApp.SRC_MAX_ZOOM = Number(result.data.globalsGisMaxZoomLevel);
        GisApp.VWORLD_URL = result.data.globalsGisBaseMapUrl;

        let _defCrs = result.data.globalsGisCrs_OL;
        if (_defCrs.indexOf(":") < 0) {
          GisApp.BASE_MAP_PROJ = _defCrs.toUpperCase().replace("EPSG", "EPSG:");
        } else {
          GisApp.BASE_MAP_PROJ = _defCrs.toUpperCase();
        }

        let _shpCrs = result.data.globalsGisCrs_SHP;
        if (_shpCrs.indexOf(":") < 0) {
          GisApp.SHP_PROJ = _shpCrs.toUpperCase().replace("EPSG", "EPSG:");
        } else {
          GisApp.SHP_PROJ = _shpCrs.toUpperCase();
        }

        _defMgc = result.data.globalsMgc;
        //				let _defNorthBoundary = result.data.globalsGisNorthBoundary;
        //				let _defEastBoundary = result.data.globalsGisEastBoundary;
        //				let _defSouthBoundary = result.data.globalsGisSouthBoundary;
        //				let _defWestBoundary = result.data.globalsGisWestBoundary;

        //				GisApp.core.prototype.defaults.bounds = [[Number(_defEastBoundary), Number(_defNorthBoundary)], [Number(_defWestBoundary), Number(_defSouthBoundary)]];
      },
      error: function (request, error) {
        alert("message: " + request.responseText + ", error:" + error);
      },
    });
  },
};
