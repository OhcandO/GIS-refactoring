import  * as KEY from './MO_GIS/common/MO.keyMap.js';
import { SourceFactory } from "./MO_GIS/classes/MO.SourceFactory.js";
import { LayerFactory } from "./MO_GIS/classes/MO.LayerFactory.js";
import { MOGISMap } from './MO_GIS/classes/MO.MOGISMap.js';
import { LayerTree } from './MO_GIS/classes/MO.LayerTree.js';

// 배경지도 레이어 코드
const baseLayerCode = 
[
    {
        sourceType: "wmts", category: "vworld", srid: "EPSG:3857", origin: "https://api.vworld.kr",
        sourcePathname: "/req/wmts/1.0.0/{key}/{layer}/{tileMatrix}/{tileRow}/{tileCol}.{tileType}",
        id: 1, layerTitle: "vworld_base", typeName: "Base", boolIsdefault: "Y",
        apiKey: "B58E48FE-683E-3E7E-B91C-2F912512FE60",  layerType: "BASE", 
    },
    {
        sourceType: "wmts", category: "vworld", srid: "EPSG:3857", origin: "https://api.vworld.kr",
        sourcePathname: "/req/wmts/1.0.0/{key}/{layer}/{tileMatrix}/{tileRow}/{tileCol}.{tileType}",
        id: 2, layerTitle: "vworld_Satellite", typeName: "Satellite", boolIsdefault: "N",
        apiKey: "B58E48FE-683E-3E7E-B91C-2F912512FE60", layerType: "BASE", 
    },
    {
        sourceType: "wmts", category: "vworld", srid: "EPSG:3857", origin: "https://api.vworld.kr",
        sourcePathname: "/req/wmts/1.0.0/{key}/{layer}/{tileMatrix}/{tileRow}/{tileCol}.{tileType}",
        id: 3, layerTitle: "vworld_gray", typeName: "gray", boolIsdefault: "N",
        apiKey: "B58E48FE-683E-3E7E-B91C-2F912512FE60", layerType: "BASE", 
    },
    {
        sourceType: "wmts", category: "vworld", srid: "EPSG:3857", origin: "https://api.vworld.kr",
        sourcePathname: "/req/wmts/1.0.0/{key}/{layer}/{tileMatrix}/{tileRow}/{tileCol}.{tileType}",
        id: 4, layerTitle: "vworld_midnight", typeName: "midnight", boolIsdefault: "N",
        apiKey: "B58E48FE-683E-3E7E-B91C-2F912512FE60", layerType: "BASE", 
    },
    {
        sourceType: "wmts", category: "vworld", srid: "EPSG:3857", origin: "https://api.vworld.kr",
        sourcePathname: "/req/wmts/1.0.0/{key}/{layer}/{tileMatrix}/{tileRow}/{tileCol}.{tileType}",
        id: 5, layerTitle: "vworld_Hybrid", typeName: "Hybrid", boolIsdefault: "N",
        apiKey: "B58E48FE-683E-3E7E-B91C-2F912512FE60", layerType: "BASE", zIndex:10,
    }
]
;

const default_spec = {
    /** Map 이 생성될 기본 DIV id */
    target: 'map',
    projection: `EPSG:3857`,
    center: [14299817.411228577, 4388340.81142764],  
    zoom:13.5
};

let mainMap = new MOGISMap(default_spec);
mainMap.setFactory(new SourceFactory());
mainMap.setFactory(new LayerFactory());

mainMap.setBaseLayerCodeArr(baseLayerCode);

//기본 지도 생성
mainMap.setBaseLayer();


//layerTree 개시

//"GIS관망도" 레이어 코드
const coreLayerCode = [{"names":"YC 전체","ORDR":1,"sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":24,"pid":8,"minZoom":9,"layerTitle":"YC 전체","typeName":"swap:wtl_blsm_as_yc","cqlfilter":null,"iconName":null,"label":"BLCK_NM","zIndex":6,"lineWidth":"2","lineStyle":"[3,5,1,4]","layerType":"POLYGON","colorFill":"rgba(88, 187, 78, 0.66)","colorLine":"rgba(21, 80, 0, 0.7)","font":"25px Malgun Gothic","colorFontLine":"rgba(0, 0, 0, 1)","colorFontFill":"rgba(184, 106, 0, 1)","boolUseYn":"Y","boolIsgroup":null,"boolSelectable":null,"boolEditable":null,"boolIsdefault":"Y","boolDownload":null},{"names":"YC5소블록","ORDR":3,"sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":10,"pid":8,"minZoom":9,"layerTitle":"YC5소블록","typeName":"swap:wtl_blsm_as_yc5","cqlfilter":null,"iconName":null,"label":"BLCK_NM","zIndex":6,"lineWidth":"2","lineStyle":"[3,5]","layerType":"POLYGON","colorFill":"rgba(213, 255, 208, 0.66)","colorLine":"rgba(38, 146, 0, 0.7)","font":"25px \"맑은 고딕\",Malgun Gothic","colorFontLine":"rgba(0, 0, 0, 1)","colorFontFill":"rgba(184, 106, 0, 1)","boolUseYn":"Y","boolIsgroup":null,"boolSelectable":null,"boolEditable":null,"boolIsdefault":"Y","boolDownload":null},{"names":"상수관로","ORDR":4,"sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":12,"pid":8,"minZoom":12,"layerTitle":"상수관로","typeName":"swap:wtl_pipe_ls_yc5","cqlfilter":null,"iconName":null,"label":null,"zIndex":10,"lineWidth":"4","lineStyle":"solid","layerType":"LINE","colorFill":null,"colorLine":"rgba(63, 56, 176, 1)","font":null,"colorFontLine":null,"colorFontFill":null,"boolUseYn":"Y","boolIsgroup":null,"boolSelectable":"Y","boolEditable":null,"boolIsdefault":"Y","boolDownload":null},{"names":"급수관로","ORDR":5,"sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":13,"pid":8,"minZoom":12,"layerTitle":"급수관로","typeName":"swap:wtl_sply_ls_yc5","cqlfilter":null,"iconName":null,"label":null,"zIndex":11,"lineWidth":"2","lineStyle":"solid","layerType":"LINE","colorFill":null,"colorLine":"rgba(56, 130, 176, 1)","font":null,"colorFontLine":null,"colorFontFill":null,"boolUseYn":"Y","boolIsgroup":null,"boolSelectable":"Y","boolEditable":null,"boolIsdefault":null,"boolDownload":null},{"names":"관말처리","ORDR":6,"sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":14,"pid":8,"minZoom":12,"layerTitle":"관말처리","typeName":"swap:wtl_pipeend_ps_yc5","cqlfilter":null,"iconName":"VALV_HALF.gif","label":null,"zIndex":12,"lineWidth":null,"lineStyle":null,"layerType":"POINT","colorFill":null,"colorLine":null,"font":null,"colorFontLine":null,"colorFontFill":null,"boolUseYn":"Y","boolIsgroup":null,"boolSelectable":null,"boolEditable":null,"boolIsdefault":"Y","boolDownload":null},{"names":"소방시설","ORDR":7,"sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":16,"pid":8,"minZoom":14,"layerTitle":"소방시설","typeName":"swap:wtl_fire_ps_yc5","cqlfilter":null,"iconName":"RED.gif","label":"FFCNS_TPJM","zIndex":15,"lineWidth":null,"lineStyle":null,"layerType":"POINT","colorFill":null,"colorLine":null,"font":"15px Malgun Gothic","colorFontLine":"rgba(0, 0, 0, 1)","colorFontFill":"rgba(255, 255, 255, 1)","boolUseYn":"Y","boolIsgroup":null,"boolSelectable":null,"boolEditable":null,"boolIsdefault":null,"boolDownload":null},{"names":"유량계","ORDR":8,"sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":17,"pid":8,"minZoom":14,"layerTitle":"유량계","typeName":"swap:wtl_flow_ps_yc5","cqlfilter":null,"iconName":"GREEN.gif","label":"FLWMTR_NM","zIndex":16,"lineWidth":null,"lineStyle":null,"layerType":"POINT","colorFill":null,"colorLine":null,"font":"15px Malgun Gothic","colorFontLine":"rgba(0, 0, 0, 1)","colorFontFill":"rgba(255, 255, 255, 1)","boolUseYn":"Y","boolIsgroup":null,"boolSelectable":null,"boolEditable":null,"boolIsdefault":null,"boolDownload":null},{"names":"수도미터","ORDR":9,"sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":18,"pid":8,"minZoom":14,"layerTitle":"수도미터","typeName":"swap:wtl_meta_ps_yc5","cqlfilter":null,"iconName":"BLUE.gif","label":"FLWMTR_NM","zIndex":17,"lineWidth":null,"lineStyle":null,"layerType":"POINT","colorFill":null,"colorLine":null,"font":"15px Malgun Gothic","colorFontLine":"rgba(0, 0, 0, 1)","colorFontFill":"rgba(255, 255, 255, 1)","boolUseYn":"Y","boolIsgroup":null,"boolSelectable":null,"boolEditable":null,"boolIsdefault":null,"boolDownload":null},{"names":"밸브실","ORDR":10,"sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":19,"pid":8,"minZoom":14,"layerTitle":"밸브실","typeName":"swap:wtl_valb_as_yc5","cqlfilter":null,"iconName":"VALV_OPEN.gif","label":null,"zIndex":18,"lineWidth":"1","lineStyle":"solid","layerType":"POLYGON","colorFill":"rgba(63, 92, 231, 0.66)","colorLine":"rgba(0, 26, 135, 1)","font":null,"colorFontLine":null,"colorFontFill":null,"boolUseYn":"Y","boolIsgroup":null,"boolSelectable":null,"boolEditable":null,"boolIsdefault":null,"boolDownload":null},{"names":"마이크로필터","ORDR":11,"sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":20,"pid":8,"minZoom":14,"layerTitle":"마이크로필터","typeName":"swap:wtl_microfilter_ps_yc5","cqlfilter":null,"iconName":"VALV_OPEN.gif","label":"MICR_FLTER","zIndex":19,"lineWidth":null,"lineStyle":null,"layerType":"POINT","colorFill":null,"colorLine":null,"font":"12px serif","colorFontLine":"rgba(0, 0, 0, 1)","colorFontFill":"rgba(255, 255, 255, 1)","boolUseYn":"Y","boolIsgroup":null,"boolSelectable":null,"boolEditable":null,"boolIsdefault":null,"boolDownload":null},{"names":"밸브","ORDR":12,"sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":21,"pid":8,"minZoom":14,"layerTitle":"밸브","typeName":"swap:wtl_valv_ps_yc5","cqlfilter":null,"iconName":"VALV_CLOSE.gif","label":"VALVE_TPJM","zIndex":20,"lineWidth":null,"lineStyle":null,"layerType":"POINT","colorFill":null,"colorLine":null,"font":"12px serif","colorFontLine":"rgba(0, 0, 0, 1)","colorFontFill":"rgba(255, 255, 255, 1)","boolUseYn":"Y","boolIsgroup":null,"boolSelectable":null,"boolEditable":null,"boolIsdefault":null,"boolDownload":null},{"names":"가압장","ORDR":13,"sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":23,"pid":8,"minZoom":9,"layerTitle":"가압장","typeName":"swap:wtl_pres_as_yc5","cqlfilter":null,"iconName":"RED.gif","label":"BPLC_ABRV","zIndex":15,"lineWidth":"1","lineStyle":"solid","layerType":"POLYGON","colorFill":"rgba(231, 63, 134, 0.66)","colorLine":"rgba(231, 63, 134, 1)","font":"15px Malgun Gothic","colorFontLine":"rgba(0, 0, 0, 1)","colorFontFill":"rgba(255, 255, 255, 1)","boolUseYn":"Y","boolIsgroup":null,"boolSelectable":null,"boolEditable":null,"boolIsdefault":null,"boolDownload":null}];
    
mainMap.setLayerCode(coreLayerCode,KEY.LAYER_PURPOSE_CATEGORY.BASE);

let coreLayerTree = new LayerTree('core-LayerTree');

coreLayerTree.setMapAndLayer(mainMap,KEY.LAYER_PURPOSE_CATEGORY.BASE,8);
console.log(coreLayerTree)











export default mainMap;
globalThis.mindone = KEY.mindone;
globalThis.mainMap = mainMap;