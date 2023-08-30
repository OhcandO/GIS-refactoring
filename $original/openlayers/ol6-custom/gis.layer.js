/**
 * GisApp.layer
 * @requires gis.core.js
 * @requires gis.style.js
 */
GisApp.layer = function (options) {
  this.initialize(options);
};

GisApp.layer.prototype = {
  defaults: {},
  defaultLayerOptions: {
    name: "",
    zIndex: 5,
    opacity: 1,
    cqlFilter: null,
  },
  initialize: function (options) {
    $.extend(this.defaults, options);
    this.gisStyle = new GisApp.style();
  },
  gisStyle: null,
  /**
   * [사용]빈 레이어 생성
   */
  makeLayer: function (options) {
    let layerOptions = Object.assign({}, this.defaultLayerOptions, options);
    const declutArr = [
      "WTL_FLOW_PS",
      "WTL_FIRE_PS",
      "WTL_WAME_PS",
      "WTL_VALV_PS",
    ];
    if (
      typeof options.typeName != "undefined" &&
      declutArr.some((el) => el === options.typeName)
    ) {
      //zoom이 작아져 피쳐 바운더리가 줄어들면 라벨이나 아이콘이 겹치(overlapping)지 않도록 함 (=숨김)
      //className='clss_16' 인 레이어끼리 declutter 상호적용
      //	Object.assign(layerOptions, { declutter: true, className: 'clss_' + options.minZoom });
    }

    //면적에 해당하는 레이어는 zIndex 를 최하위순위로 놓는다 (다른 feature 들이 먼저 선택되게 함)
    //		if(['WTL_BLBG_AS', 'WTL_BLBM_AS', 'WTL_BLSM_AS', 'WTL_BSSM_AS', 'WTL_PRSA_AS'].includes(options.typeName) ){
    if (options.typeName.endsWith("_AS")) {
      layerOptions["zIndex"] = 2;
    }

    let returnLayer = new ol.layer.VectorImage(layerOptions);

    //	레이어가 처음 발행되어 지도에 표출된 직후 수행되는 이벤트
    //		if(options.typeName === ){
    //			returnLayer.once(['postrender'],function(e){
    //				console.log(e.type, e);
    //			})
    //		}

    return returnLayer;
  },
  /**
   * gisStyle 반환
   */
  getGisStyle: function () {
    return this.gisStyle;
  },
  /**
   * [사용]WFS 벡터 소스 반환
   */
  getVectorSource: function (options) {
    let url = GisApp.GEOSERVER_URL;
    let toProj = GisApp.BASE_MAP_PROJ;
    let params = {};
    params["TYPENAME"] = "uew:" + options.typeName;
    params["SERVICE"] = "WFS";
    params["VERSION"] = "1.0.0";
    params["REQUEST"] = "GetFeature";
    params["srsName"] = toProj; //WFS 좌표계 변환하여 가져오기 (변환 작업은 geoserver에서 수행)
    params["OUTPUTFORMAT"] = "application/json";
    let strParams = $.param(params);
    if (options.cqlFilter) {
      strParams += "&CQL_FILTER=" + options.cqlFilter.replaceAll("%", "%25"); // %문자열 자동 변환 안되는 것 해결
    }
    let source = new ol.source.Vector({
      format: new ol.format.GeoJSON(),
      url: function (extent) {
        return url + "?" + strParams;
      },
      strategy: ol.loadingstrategy.all, //초기 레이어 배치 클릭시 마다 모든 데이터 가져옴.. 그 뒤는 지연 적음
      //			strategy: ol.loadingstrategy.bbox //보여지는 영역의 source 만 호출.지도 드래그 할 때 마다 geoserver 통신하느라 응답지연. 조금 답답한 UX
    });
    return source;
  },

  /**
	ol.layer.VectorTile 을 생성하기위한 source 생성
	@param {*} option 벡터타일 생성을 위한 설정 정보
	 */
  getVectorTileSource: function (option) {},
  /**
   * [사용]WFS 레이어 생성
   */
  getWfsLayer: function (option) {
    option = option || {};
    //레이어 생성
    let returnLayer = this.makeLayer(option);
    //레이어 소스 생성
    let source = this.getVectorSource(option);
    returnLayer.setSource(source);
    //스타일 추가
    returnLayer.setStyle(
      this.gisStyle.getLayerStyleFunction(returnLayer, option)
    );

    return returnLayer;
  },
  /**
   * [사용]WFS 레이어 생성
   */
  getShapeLayer: function (option) {
    option = option || {};
    //레이어 소스 생성
    let url = GisApp.GEOSERVER_URL;
    let toProj = GisApp.BASE_MAP_PROJ;
    let params = {};
    params["TYPENAME"] = "uew:" + option.typeName;
    params["SERVICE"] = "WFS";
    params["VERSION"] = "1.0.0";
    params["REQUEST"] = "GetFeature";
    params["srsName"] = toProj;
    params["OUTPUTFORMAT"] = "shape-zip";
    if (option && option.cqlFilter) {
      params["CQL_FILTER"] = option.cqlFilter;
    }

    let href = url + "?" + $.param(params);
    let a = document.createElement("a"); //임의의 a태그 생성
    a.href = href;
    a.download = filename; //다운로드 될 파일명
    a.style.display = "none"; //임의로 생성된 a태그를 숨김
    document.body.appendChild(a); //현재 jsp파일 body에 해당 a태그를 추가
    a.click(); //해당 a태그를 강제로 클릭
    delete a; //이후 a태그 삭제
  },
  /**
   * 피처 리스트로 레이어 생성
   */
  getLayerByFeature: function (feature, layerOptions, layerStyle) {
    if (!layerOptions || !layerOptions.id) {
      return null;
    }

    let vectorSource = new ol.source.Vector();
    if (feature) {
      if (
        Object.prototype.toString.call(feature).slice(8, -1).indexOf("Object") >
        -1
      ) {
        vectorSource.addFeature(feature);
      } else {
        vectorSource.addFeatures(feature);
      }
    }
    GisApp.Module.core.deleteLayer(layerOptions.id);
    layerOptions.source = vectorSource;
    let layer = new ol.layer.Vector(layerOptions);
    layer.setStyle(layerStyle);
    return layer;
  },
  /**
   * 피처 하이라이트
   */
  highLightFeature: function (hlFeature, layerOptions, styleOptions) {
    let color = styleOptions.color || "#D199E0";
    let width = styleOptions.width || 10;
    let featureKey = styleOptions.featureKey || "";

    let styleFunction = function (feature, resolution) {
      let style = new ol.style.Style({
        image: new ol.style.Circle({
          fill: new ol.style.Fill({
            color: color,
          }),
          radius: width,
        }),
        stroke: new ol.style.Stroke({
          color: color,
          width: width,
        }),
      });

      let getFeatureText = function (feature) {
        if (featureKey) {
          let text = feature.get(featureKey);
          if (text) return text;
        }
        return "";
      };
      let text = new ol.style.Text({
        stroke: new ol.style.Stroke({
          color: "white",
          width: 2,
        }),
        fill: new ol.style.Fill({
          color: "black",
        }),
        font: "12px Verdana",
        text: getFeatureText(feature),
      });
      style.setText(text);
      return style;
    };

    let layer = this.getLayerByFeature(hlFeature, layerOptions, styleFunction);
    let map = GisApp.Module.core.map;
    map.addLayer(layer);
    return layer;
  },
  /**
   * 마커 레이어 맵에 추가
   */
  addMarkerLayer: function (lat, lon, layerOptions) {
    let p = ol.proj.transform(
      [Number(lon), Number(lat)],
      GisApp.FROM_PROJ,
      GisApp.BASE_MAP_PROJ
    );
    let feature = new ol.Feature({
      geometry: new ol.geom.Point(p),
    });
    let layer = this.getMarkerLayer(layerOptions);
    layer.getSource().addFeature(feature);
    let map = GisApp.Module.core.map;
    map.addLayer(layer);
    return layer;
  },
  /**
   * 마커 레이어 생성
   */
  getMarkerLayer: function (layerOptions) {
    let imgSrc = GisApp.CONTEXT_PATH + "images/marker/marker-icon.png";
    let style = new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [0.5, 46],
        anchorXUnits: "fraction",
        anchorYUnits: "pixels",
        src: imgSrc,
      }),
    });
    let layer = this.getLayerByFeature(null, layerOptions, style);
    return layer;
  },
  /**
   * 피처 생성
   */
  getFeatureCoord: function (coord) {
    let feature = new ol.Feature({
      geometry: new ol.geom.Point(coord),
    });
    return feature;
  },
  /**
   * 피처 생성(lat,lon)
   */
  getFeatureLonLat: function (lat, lon) {
    let p = ol.proj.transform(
      [Number(lon), Number(lat)],
      GisApp.FROM_PROJ,
      GisApp.BASE_MAP_PROJ
    );
    let feature = new ol.Feature({
      geometry: new ol.geom.Point(p),
    });
    return feature;
  },
};
