
//맵객체 선언
var map;

//맵 네이게이션(다음 및 이전보기)
var navHistory;

//맵 이벤트 객체 선언
var events;

//wms urls (sample)
//var serviceUrl_sample1 = "http://183.98.24.4:9202/joyserver2/KWater/wms?srs=EPSG:5181&";
//var legendUrl = "http://183.98.24.4:9202/joyserver2/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&STRICT=false&style=";
var serviceUrl_sample1 = '/geoserver/KWater/wms?srs=EPSG:5181&';
var serviceUrl_wfs = 'http://192.168.1.25/geoserver/chuncheon/wfs';
//var serviceUrl_wfs = '/geoserver/chuncheon/wfs';

var legendUrl = "http://192.168.1.25/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&STRICT=false&style=";
var layerImgUrl = "/gis/images/layer/";
//레이어객체 (* 변수명과 레이어명이 같아야 함 *)
//var simple_OSM_Map_Layer;
var DaumBaseMap;
var DaumSkyMap;
var DaumHybridMap;
var baselayer;
var WD_WTL_PIPE_LS;
var WD_WTL_VALV_PS;
var WD_WTL_VALB_AS;
var WD_WTL_STPI_PS;
var WD_WTL_SPLY_LS;
var WD_WTL_SERV_PS;
var WD_WTL_PURI_PS;
var WD_WTL_PRGA_PS;
var WD_WTL_PRES_PS;
var WD_WTL_GAIN_AS;
var WD_WTL_FLOW_PS;
var WD_WTL_PIPE_LS;
var WD_WTL;
var LC_WTL;
var LC_WTL_FLOW_PS;
//WTL_BEJP_;
var LC_WTL_BLBG_AS;
var LC_WTL_BLBM_AS;
var LC_WTL_BLSM_AS;
var LC_WTL_FIRE_PS;
var LC_WTL_FLOW_PS;
var LC_WTL_GAIN_AS;
var LC_WTL_HEAD_AS;
var LC_WTL_META_PS;
var LC_WTL_PIPE_LS;
var LC_WTL_PRES_PS;
var LC_WTL_PRGA_PS;
var LC_WTL_PURI_PS;
var LC_WTL_SERV_PS;
var LC_WTL_SPLY_LS;
var LC_WTL_VALB_AS;
var LC_WTL_VALV_PS;

var defaultPointStyle;
var defaultLineStyle;

//맵익스텐트
var gInitExtent = [102289.76843229061,51276.00396758568,297710.23156770936,537631.9757391878];
var position;
//var zoom = 11;
var wtmX = 238169;
var wtmY = 322237;
var zoom = 1;
//용도: 주소검색(RESTAPI) / 개발영역: localhost
var daumMapApikey_RESTAPI = "7461949eb099255d0a595a00cfd6cd71";

//마커(지도상의 심볼표현)
var markers;

var geoJson = new OpenLayers.Format.GeoJSON();


/*
 * 관망해석용
 */
var inpDetailAllList = [];
var selectedFeatureId = "";
var rptTimeList = [];
var rptNodeList = [];
var rptLinkList = [];
var JUNCTIONS;
var TANKS;
var RESERVOIRS;
var PIPES;
var PUMPS;
var VALVES;
var WTL_PIPE_LS = [];
var WTL_SPLY_LS = [];
var WTL_VALV_PS = [];
var ACC_WTL_PIPE_LS = [];
var ACC_WTL_SPLY_LS = [];
var ACC_WTL_VALV_PS = [];
var STWR_WTL_PIPE_LS = [];
var STWR_WTL_SPLY_LS = [];
var STWR_WTL_META_PS = [];
var accPointId = "";
