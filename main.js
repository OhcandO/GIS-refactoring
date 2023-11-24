import  * as KEY from './MO_GIS/common/MO.keyMap.js';
import { SourceFactory } from "./MO_GIS/classes/MO.SourceFactory.js";
import { LayerFactory } from "./MO_GIS/classes/MO.LayerFactory.js";
import { MOGISMap } from './MO_GIS/classes/MO.MOGISMap.js';
import { LayerTree } from './MO_GIS/classes/MO.LayerTree.js';
import { MOLegend } from './MO_GIS/classes/addon/MO.Legend.js';
import Pickr from './lib/pickr-1.9.0/dist/pickr_1.9.0_esm.js';

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
const coreLayerCode = [{"names":"대블록","ordr":3,"sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":9,"pid":null,"minZoom":9,"layerTitle":"대블록","typeName":"swap:wtl_blbg_as_yc","cqlfilter":null,"iconName":null,"label":"LOCGOV_CD_","zIndex":6,"lineWidth":"2","lineStyle":"[3,5,3,5]","layerType":"POLYGON","colorFill":"rgba(212,5,246,0.4)","colorLine":"rgba(236,9,9,0.4)","font":"25px \"맑은 고딕\",Malgun Gothic","colorFontLine":"rgba(0, 0, 0, 1)","colorFontFill":"rgba(184, 106, 0, 1)","boolUseYn":"Y","boolIsgroup":null,"boolSelectable":null,"boolEditable":null,"boolIsdefault":null,"boolDownload":null},{"names":"중블록","ordr":4,"sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":10,"pid":null,"minZoom":9,"layerTitle":"중블록","typeName":"swap:wtl_blbm_as_yc","cqlfilter":null,"iconName":null,"label":"BLCK_NM","zIndex":6,"lineWidth":"2","lineStyle":"[1,3]","layerType":"POLYGON","colorFill":"rgba(23,255,255,0.4)","colorLine":"rgba(74,141,242,0.4)","font":"25px \"맑은 고딕\",Malgun Gothic","colorFontLine":"rgba(0, 0, 0, 1)","colorFontFill":"rgba(184, 106, 0, 1)","boolUseYn":"Y","boolIsgroup":null,"boolSelectable":null,"boolEditable":null,"boolIsdefault":null,"boolDownload":null},{"names":"소블록","ordr":5,"sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":11,"pid":null,"minZoom":9,"layerTitle":"소블록","typeName":"swap:wtl_blsm_as_yc","cqlfilter":null,"iconName":null,"label":"BLCK_NM","zIndex":6,"lineWidth":"2","lineStyle":"[3,2]","layerType":"POLYGON","colorFill":"rgba(212,5,246,0.4)","colorLine":"rgba(236,9,9,0.4)","font":"25px \"맑은 고딕\",Malgun Gothic","colorFontLine":"rgba(0, 0, 0, 1)","colorFontFill":"rgba(184, 106, 0, 1)","boolUseYn":"Y","boolIsgroup":null,"boolSelectable":"Y","boolEditable":null,"boolIsdefault":"Y","boolDownload":null},{"names":"상수관로","ordr":6,"sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":12,"pid":null,"minZoom":9,"layerTitle":"상수관로","typeName":"swap:wtl_pipe_ls_yc","cqlfilter":null,"iconName":null,"label":null,"zIndex":10,"lineWidth":"4","lineStyle":"solid","layerType":"LINE","colorFill":null,"colorLine":"rgba(63, 56, 176, 1)","font":null,"colorFontLine":null,"colorFontFill":null,"boolUseYn":"Y","boolIsgroup":null,"boolSelectable":"Y","boolEditable":null,"boolIsdefault":"Y","boolDownload":null},{"names":"급수관로","ordr":7,"sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":13,"pid":null,"minZoom":9,"layerTitle":"급수관로","typeName":"swap:wtl_sply_ls_yc","cqlfilter":null,"iconName":null,"label":null,"zIndex":11,"lineWidth":"2","lineStyle":"solid","layerType":"LINE","colorFill":null,"colorLine":"rgba(56, 130, 176, 1)","font":null,"colorFontLine":null,"colorFontFill":null,"boolUseYn":"Y","boolIsgroup":null,"boolSelectable":null,"boolEditable":null,"boolIsdefault":null,"boolDownload":null},{"names":"소방시설","ordr":9,"sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":15,"pid":null,"minZoom":9,"layerTitle":"소방시설","typeName":"swap:wtl_fire_ps_yc","cqlfilter":null,"iconName":"RED.gif","label":null,"zIndex":15,"lineWidth":null,"lineStyle":null,"layerType":"POINT","colorFill":null,"colorLine":null,"font":"11px Malgun Gothic","colorFontLine":"rgba(0, 0, 0, 1)","colorFontFill":"rgba(255, 255, 255, 1)","boolUseYn":"Y","boolIsgroup":null,"boolSelectable":null,"boolEditable":null,"boolIsdefault":null,"boolDownload":null},];
    
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

const pickr = Pickr.create({
    el: '.color-picker',
    theme: 'classic', // or 'monolith', or 'nano'

    swatches: [
        'rgba(244, 67, 54, 1)',
        'rgba(233, 30, 99, 0.95)',
        'rgba(156, 39, 176, 0.9)',
        'rgba(103, 58, 183, 0.85)',
        'rgba(63, 81, 181, 0.8)',
        'rgba(33, 150, 243, 0.75)',
        'rgba(3, 169, 244, 0.7)',
        'rgba(0, 188, 212, 0.7)',
        'rgba(0, 150, 136, 0.75)',
        'rgba(76, 175, 80, 0.8)',
        'rgba(139, 195, 74, 0.85)',
        'rgba(205, 220, 57, 0.9)',
        'rgba(255, 235, 59, 0.95)',
        'rgba(255, 193, 7, 1)'
    ],
    sliders:'hv', //'v', 'hv'
    defaultRepresentation: 'RGBA',
    components: {

        // Main components
        preview: true,
        opacity: true,
        hue: true,

        // Input / output Options
        interaction: {
            rgba: true,
            hex: true,
            // hsla: true,
            // hsva: true,
            // cmyk: true,
            input: true,
            clear: true,
            save: true
        }
    }
});
pickr
.on('init', instance => { console.log('Event: "init"', instance);})
.on('hide', instance => { console.log('Event: "hide"', instance);})
.on('show', (color, instance) => { console.log('Event: "show"', color, instance);})
.on('save', (color, instance) => { console.log('Event: "save"', color, instance);})
// .on('clear', instance => { console.log('Event: "clear"', instance);})
// .on('change', (color, source, instance) => { console.log('Event: "change"', color, source, instance);})
// .on('changestop', (source, instance) => { console.log('Event: "changestop"', source, instance);})
// .on('cancel', instance => { console.log('Event: "cancel"', instance);})
// .on('swatchselect', (color, instance) => {console.log('Event: "swatchselect"', color, instance);})
;
export default mainMap;
globalThis.mindone = KEY.mindone;
globalThis.mainMap = mainMap;