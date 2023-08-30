GisApp.minimap = function (options) {
  this.initialize(options);
};

GisApp.minimap.prototype = {
  overview: {},
  map: {},
  initialize: function (layers) {
    layers = layers || [];
    //배경맵 생성
    let emap = new ol.layer.Tile({
      visible: true,
      source: new ol.source.XYZ({
        url: GisApp.VWORLD_URL,
        crossOrigin: "anonymous",
      }),
    });
    layers.push(emap);

    //미니맵 생성
    let overview = new ol.control.OverviewMap({
      layers: layers,
      view: new ol.View({
        projection: GisApp.BASE_MAP_PROJ,
        minZoom: 9,
        maxZoom: 12,
      }),
      collapsed: false,
      collapseLabel: "\u00BB",
      label: "\u00AB",
    });
    this.overview = overview;
    this.map = overview.getOverviewMap();
    this.addControl();
  },
  addControl: function () {
    GisApp.Module.core.map.addControl(this.overview);
  },
  removeControl: function () {
    GisApp.Module.core.map.removeControl(this.overview);
  },
  /**
   * [사용]레이어 추가(객체)
   */
  addLayer: function (layer) {
    this.deleteLayer(layer.get("id"));
    this.map.addLayer(layer);
  },
  /**
   * [사용]레이어 추가(배열)
   */
  addLayers: function (layers) {
    for (let i in layers) {
      let layer = layers[i];
      this.addLayer(layer);
    }
  },
  /**
   * [사용]레이어 삭제
   */
  deleteLayer: function (layer) {
    if (layer != null) {
      this.map.removeLayer(layer);
    }
  },
};
