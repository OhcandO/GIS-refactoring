import  * as KEY from './MO_GIS/common/MO.keyMap.js';
import { SourceFactory } from "./MO_GIS/classes/MO.SourceFactory.js";
import { LayerFactory } from "./MO_GIS/classes/MO.LayerFactory.js";
import { StyleFactory } from "./MO_GIS/classes/MO.StyleFactory.js";
import {MOGISMap} from './MO_GIS/classes/MO.MOGISMap.js';
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
mainMap.setFactory(new StyleFactory());

mainMap.setBaseLayerCodeArr(baseLayerCode);

//기본 지도 생성
mainMap.setBaseLayer();


//layerTree 개시

//"GIS관망도" 레이어 코드
const coreLayerCode = [{"names":"블록","sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/localhost:99","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":9,"pid":null,"minZoom":null,"layerTitle":"블록","typeName":null,"cqlfilter":null,"iconName":null,"label":null,"zIndex":null,"lineWidth":null,"lineStyle":null,"colorFill":null,"colorLine":null,"font":null,"colorFontLine":null,"colorFontFill":null,"boolUseYn":"Y","boolIsgroup":"Y","boolSelectable":null,"boolEditable":null,"boolIsdefault":null,"boolDownload":null},{"names":"-YC5소블록","sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/localhost:99","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":10,"pid":9,"minZoom":9,"layerTitle":"YC5소블록","typeName":"postgis:wtl_blsm_as_yc5","cqlfilter":null,"iconName":null,"label":"BLCK_NM","zIndex":6,"lineWidth":"2","lineStyle":"solid","colorFill":"rgba(120,120,0,0.2)","colorLine":"rgba(50,50,50,1)","font":null,"colorFontLine":"rgba(255,255,255,1)","colorFontFill":"rgba(0,0,0,1)","boolUseYn":"Y","boolIsgroup":null,"boolSelectable":null,"boolEditable":null,"boolIsdefault":"Y","boolDownload":null},{"names":"관로","sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/localhost:99","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":11,"pid":null,"minZoom":null,"layerTitle":"관로","typeName":null,"cqlfilter":null,"iconName":null,"label":null,"zIndex":null,"lineWidth":null,"lineStyle":null,"colorFill":null,"colorLine":null,"font":null,"colorFontLine":null,"colorFontFill":null,"boolUseYn":"Y","boolIsgroup":"Y","boolSelectable":null,"boolEditable":null,"boolIsdefault":null,"boolDownload":null},{"names":"-상수관로","sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/localhost:99","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":12,"pid":11,"minZoom":12,"layerTitle":"상수관로","typeName":"postgis:wtl_pipe_ls_yc5","cqlfilter":null,"iconName":null,"label":null,"zIndex":10,"lineWidth":"4","lineStyle":"solid","colorFill":null,"colorLine":null,"font":null,"colorFontLine":null,"colorFontFill":null,"boolUseYn":"Y","boolIsgroup":null,"boolSelectable":"Y","boolEditable":null,"boolIsdefault":"Y","boolDownload":null},{"names":"-급수관로","sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/localhost:99","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":13,"pid":11,"minZoom":12,"layerTitle":"급수관로","typeName":"postgis:wtl_sply_ls_yc5","cqlfilter":null,"iconName":null,"label":null,"zIndex":11,"lineWidth":"2","lineStyle":"solid","colorFill":null,"colorLine":null,"font":null,"colorFontLine":null,"colorFontFill":null,"boolUseYn":"Y","boolIsgroup":null,"boolSelectable":"Y","boolEditable":null,"boolIsdefault":null,"boolDownload":null},{"names":"-관말처리","sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/localhost:99","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":14,"pid":11,"minZoom":12,"layerTitle":"관말처리","typeName":"postgis:wtl_pipeend_ps_yc5","cqlfilter":null,"iconName":null,"label":null,"zIndex":12,"lineWidth":null,"lineStyle":null,"colorFill":null,"colorLine":null,"font":null,"colorFontLine":null,"colorFontFill":null,"boolUseYn":"Y","boolIsgroup":null,"boolSelectable":null,"boolEditable":null,"boolIsdefault":"Y","boolDownload":null},{"names":"시설물","sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/localhost:99","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":15,"pid":null,"minZoom":null,"layerTitle":"시설물","typeName":null,"cqlfilter":null,"iconName":null,"label":null,"zIndex":null,"lineWidth":null,"lineStyle":null,"colorFill":null,"colorLine":null,"font":null,"colorFontLine":null,"colorFontFill":null,"boolUseYn":"Y","boolIsgroup":"Y","boolSelectable":null,"boolEditable":null,"boolIsdefault":null,"boolDownload":null},{"names":"-소방시설","sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/localhost:99","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":16,"pid":15,"minZoom":14,"layerTitle":"소방시설","typeName":"postgis:wtl_fire_ps_yc5","cqlfilter":null,"iconName":null,"label":null,"zIndex":15,"lineWidth":null,"lineStyle":null,"colorFill":null,"colorLine":null,"font":null,"colorFontLine":null,"colorFontFill":null,"boolUseYn":"Y","boolIsgroup":null,"boolSelectable":null,"boolEditable":null,"boolIsdefault":null,"boolDownload":null},{"names":"-유량계","sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/localhost:99","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":17,"pid":15,"minZoom":14,"layerTitle":"유량계","typeName":"postgis:wtl_flow_ps_yc5","cqlfilter":null,"iconName":null,"label":null,"zIndex":16,"lineWidth":null,"lineStyle":null,"colorFill":null,"colorLine":null,"font":null,"colorFontLine":null,"colorFontFill":null,"boolUseYn":"Y","boolIsgroup":null,"boolSelectable":null,"boolEditable":null,"boolIsdefault":null,"boolDownload":null},{"names":"-수도미터","sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/localhost:99","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":18,"pid":15,"minZoom":14,"layerTitle":"수도미터","typeName":"postgis:wtl_meta_ps_yc5","cqlfilter":null,"iconName":null,"label":null,"zIndex":17,"lineWidth":null,"lineStyle":null,"colorFill":null,"colorLine":null,"font":null,"colorFontLine":null,"colorFontFill":null,"boolUseYn":"Y","boolIsgroup":null,"boolSelectable":null,"boolEditable":null,"boolIsdefault":null,"boolDownload":null},{"names":"-밸브실","sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/localhost:99","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":19,"pid":15,"minZoom":14,"layerTitle":"밸브실","typeName":"postgis:wtl_valb_as_yc5","cqlfilter":null,"iconName":null,"label":null,"zIndex":18,"lineWidth":"1","lineStyle":"solid","colorFill":"rgba(120,0,120,0.2)","colorLine":null,"font":null,"colorFontLine":null,"colorFontFill":null,"boolUseYn":"Y","boolIsgroup":null,"boolSelectable":null,"boolEditable":null,"boolIsdefault":null,"boolDownload":null},{"names":"-마이크로필터","sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/localhost:99","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":20,"pid":15,"minZoom":14,"layerTitle":"마이크로필터","typeName":"postgis:wtl_microfilter_ps_yc5","cqlfilter":null,"iconName":null,"label":null,"zIndex":19,"lineWidth":null,"lineStyle":null,"colorFill":null,"colorLine":null,"font":null,"colorFontLine":null,"colorFontFill":null,"boolUseYn":"Y","boolIsgroup":null,"boolSelectable":null,"boolEditable":null,"boolIsdefault":null,"boolDownload":null},{"names":"-밸브","sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/localhost:99","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":21,"pid":15,"minZoom":14,"layerTitle":"밸브","typeName":"postgis:wtl_valv_ps_yc5","cqlfilter":null,"iconName":null,"label":null,"zIndex":20,"lineWidth":null,"lineStyle":null,"colorFill":null,"colorLine":null,"font":null,"colorFontLine":null,"colorFontFill":null,"boolUseYn":"Y","boolIsgroup":null,"boolSelectable":null,"boolEditable":null,"boolIsdefault":null,"boolDownload":null},{"names":"사업장","sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/localhost:99","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":22,"pid":null,"minZoom":null,"layerTitle":"사업장","typeName":null,"cqlfilter":null,"iconName":null,"label":null,"zIndex":null,"lineWidth":null,"lineStyle":null,"colorFill":null,"colorLine":null,"font":null,"colorFontLine":null,"colorFontFill":null,"boolUseYn":"Y","boolIsgroup":"Y","boolSelectable":null,"boolEditable":null,"boolIsdefault":null,"boolDownload":null},{"names":"-가압장","sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/localhost:99","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":23,"pid":22,"minZoom":9,"layerTitle":"가압장","typeName":"postgis:wtl_pres_as_yc5","cqlfilter":null,"iconName":null,"label":null,"zIndex":15,"lineWidth":"1","lineStyle":"solid","colorFill":"rgba(0,120,120,0.2)","colorLine":null,"font":null,"colorFontLine":null,"colorFontFill":null,"boolUseYn":"Y","boolIsgroup":null,"boolSelectable":null,"boolEditable":null,"boolIsdefault":null,"boolDownload":null}];
    
mainMap.setLayerCode(coreLayerCode,KEY.LAYER_PURPOSE_CATEGORY.BASE);

let coreLayerTree = new LayerTree('core-LayerTree');

coreLayerTree.setMapAndLayer(mainMap,KEY.LAYER_PURPOSE_CATEGORY.BASE);


console.log(coreLayerTree);













export default mainMap;

globalThis.mainMap = mainMap;