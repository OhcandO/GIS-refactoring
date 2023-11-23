import  * as KEY from './MO_GIS/common/MO.keyMap.js';
import { SourceFactory } from "./MO_GIS/classes/MO.SourceFactory.js";
import { LayerFactory } from "./MO_GIS/classes/MO.LayerFactory.js";
import { MOGISMap } from './MO_GIS/classes/MO.MOGISMap.js';
import { LayerTree } from './MO_GIS/classes/MO.LayerTree.js';
import { MOLegend } from './MO_GIS/classes/addon/MO.Legend.js';

// import { LayerTree_new } from './MO_GIS/classes/MO.LayerTree_new.js';

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
const coreLayerCode = [{"names":"대블록","ordr":3,"sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":9,"pid":null,"minZoom":9,"layerTitle":"대블록","typeName":"swap:wtl_blbg_as_yc","cqlfilter":null,"iconName":null,"label":"LOCGOV_CD_","zIndex":6,"lineWidth":"2","lineStyle":"[3,5,3,5]","layerType":"POLYGON","colorFill":"rgba(212,5,246,0.4)","colorLine":"rgba(236,9,9,0.4)","font":"25px \"맑은 고딕\",Malgun Gothic","colorFontLine":"rgba(0, 0, 0, 1)","colorFontFill":"rgba(184, 106, 0, 1)","boolUseYn":"Y","boolIsgroup":null,"boolSelectable":null,"boolEditable":null,"boolIsdefault":null,"boolDownload":null},{"names":"중블록","ordr":4,"sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":10,"pid":null,"minZoom":9,"layerTitle":"중블록","typeName":"swap:wtl_blbm_as_yc","cqlfilter":null,"iconName":null,"label":"BLCK_NM","zIndex":6,"lineWidth":"2","lineStyle":"[1,3]","layerType":"POLYGON","colorFill":"rgba(23,255,255,0.4)","colorLine":"rgba(74,141,242,0.4)","font":"25px \"맑은 고딕\",Malgun Gothic","colorFontLine":"rgba(0, 0, 0, 1)","colorFontFill":"rgba(184, 106, 0, 1)","boolUseYn":"Y","boolIsgroup":null,"boolSelectable":null,"boolEditable":null,"boolIsdefault":null,"boolDownload":null},{"names":"소블록","ordr":5,"sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":11,"pid":null,"minZoom":9,"layerTitle":"소블록","typeName":"swap:wtl_blsm_as_yc","cqlfilter":null,"iconName":null,"label":"BLCK_NM","zIndex":6,"lineWidth":"2","lineStyle":"[3,2]","layerType":"POLYGON","colorFill":"rgba(212,5,246,0.4)","colorLine":"rgba(236,9,9,0.4)","font":"25px \"맑은 고딕\",Malgun Gothic","colorFontLine":"rgba(0, 0, 0, 1)","colorFontFill":"rgba(184, 106, 0, 1)","boolUseYn":"Y","boolIsgroup":null,"boolSelectable":"Y","boolEditable":null,"boolIsdefault":"Y","boolDownload":null},{"names":"상수관로","ordr":6,"sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":12,"pid":null,"minZoom":9,"layerTitle":"상수관로","typeName":"swap:wtl_pipe_ls_yc","cqlfilter":null,"iconName":null,"label":null,"zIndex":10,"lineWidth":"4","lineStyle":"solid","layerType":"LINE","colorFill":null,"colorLine":"rgba(63, 56, 176, 1)","font":null,"colorFontLine":null,"colorFontFill":null,"boolUseYn":"Y","boolIsgroup":null,"boolSelectable":"Y","boolEditable":null,"boolIsdefault":"Y","boolDownload":null},{"names":"급수관로","ordr":7,"sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":13,"pid":null,"minZoom":9,"layerTitle":"급수관로","typeName":"swap:wtl_sply_ls_yc","cqlfilter":null,"iconName":null,"label":null,"zIndex":11,"lineWidth":"2","lineStyle":"solid","layerType":"LINE","colorFill":null,"colorLine":"rgba(56, 130, 176, 1)","font":null,"colorFontLine":null,"colorFontFill":null,"boolUseYn":"Y","boolIsgroup":null,"boolSelectable":null,"boolEditable":null,"boolIsdefault":null,"boolDownload":null},{"names":"관말처리","ordr":8,"sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":14,"pid":null,"minZoom":9,"layerTitle":"관말처리","typeName":"swap:wtl_pend_ps_yc","cqlfilter":null,"iconName":"VALV_HALF.gif","label":null,"zIndex":12,"lineWidth":null,"lineStyle":null,"layerType":"POINT","colorFill":null,"colorLine":null,"font":null,"colorFontLine":null,"colorFontFill":null,"boolUseYn":"Y","boolIsgroup":null,"boolSelectable":null,"boolEditable":null,"boolIsdefault":null,"boolDownload":null},{"names":"소방시설","ordr":9,"sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":15,"pid":null,"minZoom":9,"layerTitle":"소방시설","typeName":"swap:wtl_fire_ps_yc","cqlfilter":null,"iconName":"RED.gif","label":null,"zIndex":15,"lineWidth":null,"lineStyle":null,"layerType":"POINT","colorFill":null,"colorLine":null,"font":"11px Malgun Gothic","colorFontLine":"rgba(0, 0, 0, 1)","colorFontFill":"rgba(255, 255, 255, 1)","boolUseYn":"Y","boolIsgroup":null,"boolSelectable":null,"boolEditable":null,"boolIsdefault":null,"boolDownload":null},{"names":"유량계","ordr":10,"sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":16,"pid":null,"minZoom":9,"layerTitle":"유량계","typeName":"swap:wtl_flow_ps_yc","cqlfilter":null,"iconName":"GREEN.gif","label":"FLWMTR_NM","zIndex":16,"lineWidth":null,"lineStyle":null,"layerType":"POINT","colorFill":null,"colorLine":null,"font":"15px Malgun Gothic","colorFontLine":"rgba(0, 0, 0, 1)","colorFontFill":"rgba(255, 255, 255, 1)","boolUseYn":"Y","boolIsgroup":null,"boolSelectable":"Y","boolEditable":null,"boolIsdefault":"Y","boolDownload":null},{"names":"자동드레인","ordr":11,"sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":17,"pid":null,"minZoom":9,"layerTitle":"자동드레인","typeName":"swap:wtl_autod_ps_yc","cqlfilter":null,"iconName":"GREEN.gif","label":"DRAIN_TPJM","zIndex":16,"lineWidth":null,"lineStyle":null,"layerType":"POINT","colorFill":null,"colorLine":null,"font":"15px Malgun Gothic","colorFontLine":"rgba(0, 0, 0, 1)","colorFontFill":"rgba(255, 255, 255, 1)","boolUseYn":"Y","boolIsgroup":null,"boolSelectable":"Y","boolEditable":null,"boolIsdefault":null,"boolDownload":null},{"names":"수도미터","ordr":12,"sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":18,"pid":null,"minZoom":9,"layerTitle":"수도미터","typeName":"swap:wtl_meta_ps_yc","cqlfilter":null,"iconName":"BLUE.gif","label":null,"zIndex":17,"lineWidth":null,"lineStyle":null,"layerType":"POINT","colorFill":null,"colorLine":null,"font":"15px Malgun Gothic","colorFontLine":"rgba(0, 0, 0, 1)","colorFontFill":"rgba(255, 255, 255, 1)","boolUseYn":"Y","boolIsgroup":null,"boolSelectable":"Y","boolEditable":null,"boolIsdefault":null,"boolDownload":null},{"names":"밸브실","ordr":13,"sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":19,"pid":null,"minZoom":9,"layerTitle":"밸브실","typeName":"swap:wtl_valb_as_yc","cqlfilter":null,"iconName":"VALV_OPEN.gif","label":"VLVRM_NM","zIndex":18,"lineWidth":"1","lineStyle":"solid","layerType":"POLYGON","colorFill":"rgba(63, 92, 231, 0.66)","colorLine":"rgba(0, 26, 135, 1)","font":"12px serif","colorFontLine":null,"colorFontFill":null,"boolUseYn":"Y","boolIsgroup":null,"boolSelectable":null,"boolEditable":null,"boolIsdefault":null,"boolDownload":null},{"names":"밸브","ordr":14,"sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":20,"pid":null,"minZoom":9,"layerTitle":"밸브","typeName":"swap:wtl_valv_ps_yc","cqlfilter":null,"iconName":"VALV_OPEN.gif","label":null,"zIndex":19,"lineWidth":null,"lineStyle":null,"layerType":"POINT","colorFill":null,"colorLine":null,"font":null,"colorFontLine":"rgba(0, 0, 0, 1)","colorFontFill":"rgba(255, 255, 255, 1)","boolUseYn":"Y","boolIsgroup":null,"boolSelectable":"Y","boolEditable":null,"boolIsdefault":null,"boolDownload":null},{"names":"마이크로필터","ordr":15,"sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":21,"pid":null,"minZoom":9,"layerTitle":"마이크로필터","typeName":"swap:wtl_mcft_ps_yc","cqlfilter":null,"iconName":"VALV_OPEN.gif","label":null,"zIndex":19,"lineWidth":null,"lineStyle":null,"layerType":"POINT","colorFill":null,"colorLine":null,"font":null,"colorFontLine":"rgba(0, 0, 0, 1)","colorFontFill":"rgba(255, 255, 255, 1)","boolUseYn":"Y","boolIsgroup":null,"boolSelectable":null,"boolEditable":null,"boolIsdefault":null,"boolDownload":null},{"names":"스케일부스터","ordr":16,"sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":22,"pid":null,"minZoom":9,"layerTitle":"스케일부스터","typeName":"swap:wtl_sclbstr_ps_yc","cqlfilter":null,"iconName":"VALV_OPEN.gif","label":null,"zIndex":19,"lineWidth":null,"lineStyle":null,"layerType":"POINT","colorFill":null,"colorLine":null,"font":null,"colorFontLine":"rgba(0, 0, 0, 1)","colorFontFill":"rgba(255, 255, 255, 1)","boolUseYn":"Y","boolIsgroup":null,"boolSelectable":"Y","boolEditable":null,"boolIsdefault":null,"boolDownload":null},{"names":"소규모유량감시","ordr":17,"sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":23,"pid":null,"minZoom":9,"layerTitle":"소규모유량감시","typeName":"swap:wtl_sflow_ps_yc","cqlfilter":null,"iconName":"VALV_OPEN.gif","label":null,"zIndex":19,"lineWidth":null,"lineStyle":null,"layerType":"POINT","colorFill":null,"colorLine":null,"font":null,"colorFontLine":"rgba(0, 0, 0, 1)","colorFontFill":"rgba(255, 255, 255, 1)","boolUseYn":"Y","boolIsgroup":null,"boolSelectable":null,"boolEditable":null,"boolIsdefault":null,"boolDownload":null},{"names":"가압장","ordr":18,"sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":24,"pid":null,"minZoom":9,"layerTitle":"가압장","typeName":"swap:wtl_pres_as_yc","cqlfilter":null,"iconName":"RED.gif","label":"BPLC_ABRV","zIndex":15,"lineWidth":"1","lineStyle":"solid","layerType":"POLYGON","colorFill":"rgba(231, 63, 134, 0.66)","colorLine":"rgba(231, 63, 134, 1)","font":"15px Malgun Gothic","colorFontLine":"rgba(0, 0, 0, 1)","colorFontFill":"rgba(255, 255, 255, 1)","boolUseYn":"Y","boolIsgroup":null,"boolSelectable":"Y","boolEditable":null,"boolIsdefault":null,"boolDownload":null},{"names":"정수장","ordr":19,"sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":25,"pid":null,"minZoom":9,"layerTitle":"정수장","typeName":"swap:wtl_puri_as_yc","cqlfilter":null,"iconName":"RED.gif","label":"BPLC_ABRV","zIndex":15,"lineWidth":"1","lineStyle":"solid","layerType":"POLYGON","colorFill":"rgba(74,141,242,0.4)","colorLine":"rgba(23,255,255,0.4)","font":"15px Malgun Gothic","colorFontLine":"rgba(0, 0, 0, 1)","colorFontFill":"rgba(255, 255, 255, 1)","boolUseYn":"Y","boolIsgroup":null,"boolSelectable":"Y","boolEditable":null,"boolIsdefault":null,"boolDownload":null},{"names":"수원지","ordr":20,"sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":26,"pid":null,"minZoom":9,"layerTitle":"수원지","typeName":"swap:wtl_head_as_yc","cqlfilter":null,"iconName":"RED.gif","label":"CTCHAR_NM","zIndex":15,"lineWidth":"1","lineStyle":"solid","layerType":"POLYGON","colorFill":"rgba(74,141,242,0.4)","colorLine":"rgba(23,255,255,0.4)","font":"15px Malgun Gothic","colorFontLine":"rgba(0, 0, 0, 1)","colorFontFill":"rgba(255, 255, 255, 1)","boolUseYn":"Y","boolIsgroup":null,"boolSelectable":"Y","boolEditable":null,"boolIsdefault":null,"boolDownload":null},{"names":"취수장","ordr":21,"sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":27,"pid":null,"minZoom":9,"layerTitle":"취수장","typeName":"swap:wtl_gain_as_yc","cqlfilter":null,"iconName":"RED.gif","label":"BPLC_ABRV","zIndex":15,"lineWidth":"1","lineStyle":"solid","layerType":"POLYGON","colorFill":"rgba(231, 63, 134, 0.66)","colorLine":"rgba(231, 63, 134, 1)","font":"15px Malgun Gothic","colorFontLine":"rgba(0, 0, 0, 1)","colorFontFill":"rgba(255, 255, 255, 1)","boolUseYn":"Y","boolIsgroup":null,"boolSelectable":"Y","boolEditable":null,"boolIsdefault":null,"boolDownload":null},{"names":"배수지","ordr":22,"sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":28,"pid":null,"minZoom":9,"layerTitle":"배수지","typeName":"swap:wtl_serv_as_yc","cqlfilter":null,"iconName":"RED.gif","label":"BPLC_ABRV","zIndex":15,"lineWidth":"1","lineStyle":"solid","layerType":"POLYGON","colorFill":"rgba(74,141,242,0.4)","colorLine":"rgba(23,255,255,0.4)","font":"15px Malgun Gothic","colorFontLine":"rgba(0, 0, 0, 1)","colorFontFill":"rgba(255, 255, 255, 1)","boolUseYn":"Y","boolIsgroup":null,"boolSelectable":"Y","boolEditable":null,"boolIsdefault":null,"boolDownload":null}];
    
mainMap.setLayerCode(coreLayerCode,KEY.LAYER_PURPOSE_CATEGORY.BASE[0]);

let molegend = new MOLegend(`pop_legend`);
let baseLayerTree = new LayerTree('core-LayerTree');
baseLayerTree.regist(molegend);
baseLayerTree.regist(mainMap,KEY.LAYER_PURPOSE_CATEGORY.BASE[0]);

mainMap.enableSelect(true);
mainMap.setSelectCallback((feature,layer)=>{
    if(feature){
        console.log(feature.getProperties())
    }
    if(layer){
        console.log(`선택된 레이어 분류는 : ${layer.get(KEY.LAYER_PURPOSE_CATEGORY_KEY)} 임`);
    }
})



export default mainMap;
globalThis.mindone = KEY.mindone;
globalThis.mainMap = mainMap;
globalThis.legend = molegend;
globalThis.tree = baseLayerTree;