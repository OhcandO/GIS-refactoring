
/*
 * 쿼리에서 사용한 alias 와, 
 * 소스 상 사용하는 '객체들의 KEY 값'을 
 * 일치시키기 위한 변수정의
 * 
 * DB 의 alias 가 변경되면 이 js 파일의 각 값의 string 값을 변경하면 된다
 * @author jhoh
 */

/** 각 레이어를 정의하는 요소들의 집합 객체 (DB에서 관리)
@typedef {object} layerCodeObj
@property {number} ordr 같은 그룹 내 레이어 표현 순서
@property {string} sourceType ol.source 의 세부 클래스를 정의하기 위한 식별표시 e.g. 'vector', 'wmts'
@property {string} category 소스 출처들을 
@property {string} srid 좌표계 e.g. 'EPSG:3857'
@property {string} origin 소스 url 의 origin 부. e.g. 'http://localhost:8080'
@property {string} sourcePathname 소스 url 의 pathName 부. e.g. ' /geoserver/wfs/'
@property {string} apiKey 
@property {number} id 레이어의 아이디. DB 상 Primary Key. 통상 자연수로 지정
@property {number} pid 레이어의 DB 상 상위 레이어 아이디
@property {number} minZoom
@property {string} layerTitle 레이어의 
@property {string} typeName
@property {string} cqlfilter
@property {string} iconName
@property {string} label
@property {number} zIndex
@property {number|string} lineWidth
@property {string} lineStyle
@property {string} geomType
@property {string} colorFill
@property {string} colorLine
@property {string} font
@property {string} colorFontLine
@property {string} colorFontFill
@property {string} boolUseYn
@property {string} boolIsgroup
@property {string} boolSelectable
@property {string} boolEditable
@property {string} boolIsdefault
@property {string} boolDownload
 
 */
/*
{
    "names": "YC 전체",
    "ordr": 1,
    "sourceType": "vector",
    "category": "geoserver",
    "srid": "EPSG:5186",
    "origin": "http:\/\/118.42.103.144:9090",
    "sourcePathname": "\/geoserver\/wfs",
    "apiKey": null,
    "id": 24,
    "pid": 8,
    "minZoom": 9,
    "layerTitle": "YC 전체",
    "typeName": "swap:wtl_blsm_as_yc",
    "cqlfilter": null,
    "iconName": null,
    "label": "BLCK_NM",
    "zIndex": 6,
    "lineWidth": "2",
    "lineStyle": "[3,5,1,4]",
    "geomType": "Polygon",
    "colorFill": "rgba(88, 187, 78, 0.66)",
    "colorLine": "rgba(21, 80, 0, 0.7)",
    "font": "25px Malgun Gothic",
    "colorFontLine": "rgba(0, 0, 0, 1)",
    "colorFontFill": "rgba(184, 106, 0, 1)",
    "boolUseYn": "Y",
    "boolIsgroup": null,
    "boolSelectable": null,
    "boolEditable": null,
    "boolIsdefault": "Y",
    "boolDownload": null
}

*/
/* △△△△△△레이어 식별 관련△△△△△△△△△△△△△ */
/** 화면에서 표현될 레이어 제목. 범례, 레이어 선택 화면 등에서 표현되는 이름
 * @type {string}*/
export const LAYER_NAME = `layerTitle` 

/** (특히 Geoserver에서) 각 레이어들의 식별명
 * @type {string}*/
export const TYPE_NAME = `typeName`; //geoserver 용 레이어 식별자
export const LAYER_GEOMETRY_TYPE = `geomType`; //BASE, POINT, LINE, POLYGON 등 레이어 타입

/* △△△△△△레이어 스타일(Style) 관련△△△△△△△△△△△△△ */
export const LINE_WIDTH = `lineWidth`;
export const LINE_STYLE = `lineStyle`;
export const COLOR_FILL = `colorFill`;
export const COLOR_LINE = `colorLine`;
export const FONT_STYLE = `font`;
export const FONT_OUTLINE = `colorFontLine`;
export const FONT_FILL = `colorFontFill`;
export const ICON_NAME = `iconName`;
export const LABEL_COLUMN = `label`;

/* 레이어 객체 관련 */
export const BOOL_SELECTABLE = `boolSelectable`;
export const BOOL_SHOW_INITIAL = `boolIsdefault`; //'초기에 보여야 하는지' 여부. 상수 constant
export const BOOL_VISIBLE = `boolVisible`; //'보여야 하는지' 여부. 변수 variable
export const Z_INDEX = `zIndex`;
export const MIN_ZOOM = `minZoom`;

/* ⭕레이어 트리(Tree)용 JSON 관련 🚫 */
/** DB 상 모든 레이어들의 Primary Key @type {string} */
export const LAYER_ID = `id`;
/** 레이어 계층이 있을 때, 상위 레이어의 Primary Key @type {string} */
export const PARENT_ID = `pid`;
/** LayerTree 클래스에서, 1차원 JSON 을 계층형 JSON 으로 변환할 때, 하위 계층들을 묶을 키 이름 */
export const CHILD_MARK = `childList`;
export const LAYER_ORDER = 'ordr'; //레이어 표출 순서
export const BOOL_IS_GROUP = `boolIsgroup` // 해당 레이어가 '형식상' 레이어이며 그룹핑 용도로만 사용되는지 여부
/*
 * 레이어들의 목적으로 다르게 운용하기위해 구분
 * @enum { {BASE:['base',5], RISKMAP:['risk',1], LEAK:['leak',2], PUBLIC:['public',3], PIPENET:['pipnet',4], MANAGE:['manage',6], COMPLAINT:['comp',7], REALTIME:['realtime',8], PORTABLE:['portable',9] }} LAYER_PURPOSE_CATEGORY
 */
/**
 * @typedef {"base" | "risk" | "leak" | "public" | "pipnet"| "manage"| "comp"| "realtime"| "portable"} LayerPurpose
 */
/**
 * @typedef {Array<LayerPurpose|number>} LayerPurposeAndOrder
 */
/**
 * 레이어들의 목적으로 다르게 운용하기위해 구분
 * @enum {LayerPurposeAndOrder}
 */
export const LAYER_PURPOSE_CATEGORY= {
        /**기본 GIS 관망도 e.g. 관로, 계측기, 블록 등*/
        BASE:['base',5], 
        /** (지능수도플) 리스크맵 */
        RISKMAP:['risk',1], 
        /** (지능수도플) 누수예상지점 */
        LEAK:['leak',2], 
        /** (지능수도플) 공공서비스 */
        PUBLIC:['public',3], 
        /** (지능수도플) 관망해석결과 */
        PIPENET:['pipnet',4], 
        /**(지능수도플) 중점 관리지역 */
        MANAGE:['manage',6], 
        /** (지능수도플) 상습민원지역 */
        COMPLAINT:['comp',7], 
        /** (지능수도플) 실시간 상황감지 */
        REALTIME:['realtime',8], 
        /** (지능수도플) 이동형 누수센서 */
        PORTABLE:['portable',9], 
}

 /** LayerTree 가 관장하는 범례용 정보객체 (⊃ LayerCode)
 * @typedef {object} LegendCodeObj
 * @property {number} id 레이어 아이디
 * @property {boolean} boolVisible 해당 레이어 렌더링 여부
 * @property {string} layerPurposeCategory 해당레이어 목적별 구분자
 * @property {string} legendHtmlString 문자열로 표현된 html 태그 엘리먼트
 * @property {KEY.layerCodeObj} layerCode 
 */

/* MOPublisher, MOSubscriber 관련 키*/
export const LAYER_PURPOSE_CATEGORY_KEY = 'layerPurposeCategory';
export const LEGEND_HTML_STRING = 'legendHtmlString';

/* ▲▲▲▲▲레이어 소스(Source) 관련▲▲▲▲▲▲▲▲▲△ */
export const ORIGIN = `origin`;
export const SOURCE_PATHNAME = `sourcePathname`;
/**
 * 소스 객체의 타입을 구분하기 위함. e.g. vector, wmts
 */
export const SOURCE_TYPE = `sourceType`;
export const CQL_FILTER = `cqlfilter`;
export const APIKEY = `apiKey`;
export const SRID = `srid`;
/**
 * 소스의 출처 대분류 구분하기 위함. e.g. geoserver, vworld
 */
export const SOURCE_CATEGORY = `category`;
/** 주소검색 결과를 표현하기 위한 임시 소스와 레이어 */
export const ADDRESS_SOURCE_LAYER_KEY = 'address';
export const HIGHLIGHT_SOURCE_LAYER_KEY = 'highlight';

/* Openlayers Feature들의 타입 구분 */
/**
 * @typedef {'Point'|'LineString'|'Polygon'} OPENLAYERS_GEOMETRY_TYPE 오픈레이어스에서 사용하는 Geometry 타입명
 */
/**
 * @enum {OPENLAYERS_GEOMETRY_TYPE} OL_GEOM_TYPE
 */
export const OL_GEOMETRY_OBJ={
    POINT:'Point',
    LINE:'LineString',
    POLYGON:'Polygon',
}


export const CONSOLE_DECO={
        HEADER:`border:2px solid blue; border-radius:5px;
                padding:5px; margin:4px 6px; line-height:12px; 
                font-family: "Courier New", Courier, monospace;font-weight: bold;
                text-align: left;font-size: 27px;color: rgb(0, 255, 212);background-color: rgb(93, 61, 50);
                text-shadow: rgb(0, 0, 0) 2px 2px 2px;`,
        BODY: `text-transform: uppercase;  padding: 5px 20px;  
                font-family: Tahoma, Geneva, sans-serif; font-weight: bold; text-align: left;
                font-size: 27px; color: rgb(246, 115, 14); background-color: rgb(35, 47, 44);
                text-shadow: rgb(0, 0, 0) 2px 2px 2px;`,
}


/**
 * 1차원으로 구성된 json 자료구조를 계층형 
 * @param {Array} array javascript Array 객체. JSON 형식이어야 하고, 최상위->중위->하위 순으로 정렬되어 있어야 함
 * @param {String} [target_id_key] 개별 JSON 요소들의 PK 키 명칭
 * @param {String} [parent_id_key] 개별 JSON 요소들의 상위 ID 를 참조할 키 명칭
 * @param {String} [child_mark] NESTED 구조체 만들기 위한 
 * @param {String} [most_upper_id] 최상위 아이디
 * @returns 
 */
export function jsonNestor (array, target_id_key, parent_id_key, child_mark, most_upper_id){
if(array?.length>0){
        function FINDER(srcArr, targetElem) {
            let rere;
            for (let el of srcArr) {
                if (el[target_id_key] == targetElem[parent_id_key]) {
                    rere = el;
                } else if (el[child_mark])
                    rere = FINDER(el[child_mark], targetElem);
                if (rere) break;
            }
            return rere;
        }
        return array.reduce((pre, cur) => {
                let targ = cur[parent_id_key] ? FINDER(pre, cur) : undefined;
                if (targ)
                    targ[child_mark]
                        ? targ[child_mark].push(cur)
                        : (targ[child_mark] = [cur]);
                return pre;
            },
            structuredClone(array.filter((el) => {
                    if (most_upper_id) {return el[parent_id_key] == most_upper_id;} 
                    else {return !el[parent_id_key];}
                })
            )
        );
}else{
        console.log(array);
        throw new Error (`jsonNestor 에 입력된 배열이 적합하지 않음`)
}
}
/*
//usage
console.time('aa')
let returns = jsonNestor(arr,'id','pid','childList')
console.log(returns);
console.timeEnd('aa')
*/





export const mindone=()=>console.log('%c_%c_%c/%c\\%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c/%c\\%c\\%c\\%c\\%c_%c_%c/%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c/%c\\%c\\%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c %c %c %c %c %c %c %c \n%c %c_%c\\%c/%c\\%c\\%c\\%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c/%c\\%c\\%c\\%c\\%c\\%c\\%c_%c\\%c/%c/%c/%c/%c/%c\\%c\\%c\\%c/%c/%c/%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c/%c\\%c\\%c\\%c/%c/%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c %c %c %c %c %c %c \n%c %c %c_%c\\%c/%c\\%c\\%c\\%c/%c/%c\\%c\\%c\\%c_%c_%c_%c_%c/%c\\%c\\%c\\%c/%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c/%c\\%c\\%c\\%c/%c_%c_%c\\%c/%c/%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c %c %c %c %c %c \n%c %c %c %c_%c\\%c/%c\\%c\\%c\\%c\\%c/%c/%c/%c\\%c\\%c\\%c/%c\\%c\\%c\\%c/%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c/%c\\%c\\%c/%c\\%c\\%c\\%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c\\%c/%c/%c\\%c\\%c\\%c_%c_%c/%c\\%c\\%c/%c\\%c\\%c\\%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c/%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c_%c_%c %c %c %c %c \n%c %c %c %c %c_%c\\%c/%c\\%c\\%c\\%c_%c_%c\\%c/%c/%c/%c\\%c\\%c\\%c/%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c/%c/%c/%c/%c\\%c\\%c\\%c_%c_%c_%c_%c/%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c\\%c/%c\\%c\\%c\\%c/%c/%c/%c/%c\\%c\\%c\\%c_%c_%c_%c_%c/%c\\%c\\%c\\%c/%c/%c/%c/%c/%c\\%c\\%c\\%c_%c %c %c %c \n%c %c %c %c %c %c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c\\%c/%c/%c/%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c\\%c/%c/%c\\%c\\%c\\%c_%c_%c/%c\\%c\\%c\\%c/%c/%c/%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c\\%c/%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c/%c\\%c\\%c\\%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c\\%c/%c/%c\\%c\\%c\\%c_%c_%c/%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c_%c_%c %c %c \n%c %c %c %c %c %c %c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c\\%c/%c/%c/%c\\%c\\%c\\%c_%c_%c/%c\\%c\\%c\\%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c\\%c/%c/%c\\%c\\%c/%c/%c/%c/%c/%c/%c/%c_%c_%c_%c %c \n%c %c %c %c %c %c %c %c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c/%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c\\%c/%c/%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c/%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c\\%c/%c/%c/%c\\%c\\%c\\%c\\%c\\%c/%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c\\%c/%c/%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c_%c \n%c %c %c %c %c %c %c %c %c_%c\\%c/%c/%c/%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c\\%c/%c/%c/%c_%c_%c\\%c/%c/%c/%c/%c/%c/%c/%c/%c/%c/%c/%c_%c_%c\\%c/%c/%c/%c_%c_%c_%c_%c\\%c/%c/%c/%c_%c_%c_%c\\%c/%c/%c/%c/%c/%c/%c/%c\\%c/%c/%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c\\%c/%c/%c/%c/%c/%c_%c_%c_%c_%c_%c_%c_%c\\%c/%c/%c/%c_%c_%c_%c_%c\\%c/%c/%c/%c_%c_%c_%c_%c\\%c/%c/%c/%c/%c/%c/%c/%c/%c/%c/%c_%c_'
,'color: #c8be0d','color: #beb811','color: #b5b214','color: #abad18','color: #a2a71c','color: #98a11f','color: #8f9b23','color: #859527','color: #7c902b','color: #728a2e','color: #688432','color: #5f7e36','color: #557839','color: #4c723d','color: #426d41','color: #396744','color: #2f6148','color: #366a4a','color: #3d724c','color: #447b4d','color: #4b844f','color: #538c51','color: #5a9553','color: #619e55','color: #68a657','color: #6faf58','color: #76b75a','color: #7dc05c','color: #84c95e','color: #8cd160','color: #93da62','color: #9ae363','color: #a1eb65','color: #a8f467','color: #a4e661','color: #a0d85b','color: #9cca56','color: #98bd50','color: #94af4a','color: #90a144','color: #8c933e','color: #888539','color: #837733','color: #7f692d','color: #7b5b27','color: #774e21','color: #73401b','color: #6f3216','color: #6b2410','color: #67160a','color: #701f10','color: #782816','color: #81311d','color: #8a3a23','color: #924429','color: #9b4d2f','color: #a45635','color: #ac5f3b','color: #b56842','color: #bd7148','color: #c67a4e','color: #cf8354','color: #d78d5a','color: #e09660','color: #e99f67','color: #f1a86d','color: #fab173','color: #f7a96f','color: #f3a16c','color: #f09968','color: #ec9265','color: #e98a61','color: #e5825e','color: #e27a5a','color: #de7257','color: #db6a53','color: #d7624f','color: #d45a4c','color: #d05348','color: #cd4b45','color: #c94341','color: #c63b3e','color: #c2333a','color: #c4373a','color: #c73b3a','color: #c93f3a','color: #cc433b','color: #ce473b','color: #d14b3b','color: #d34f3b','color: #d6533b','color: #d8563b','color: #da5a3b','color: #dd5e3b','color: #df623c','color: #e2663c','color: #e46a3c','color: #e76e3c','color: #e9723c','color: #de6b3a','color: #d26539','color: #c75e37','color: #bc5736','color: #b15034','color: #a54a32','color: #9a4331','color: #8f3c2f','color: #83362e','color: #782f2c','color: #6d282b','color: #612229','color: #561b27','color: #4b1426','color: #400d24','color: #340723','color: #290021','color: #310d2a','color: #391a33','color: #40263b','color: #483344','color: #50404d','color: #584d56','color: #5f595e','color: #676667','color: #6f7370','color: #778079','color: #7e8c81','color: #86998a','color: #8ea693','color: #96b39c','color: #9dbfa4','color: #a5ccad','color: #b9c453','color: #bbc349','color: #bdc23f','color: #bfc235','color: #c1c12b','color: #c4c021','color: #c6bf17','color: #c8be0d','color: #beb811','color: #b5b214','color: #abad18','color: #a2a71c','color: #98a11f','color: #8f9b23','color: #859527','color: #7c902b','color: #728a2e','color: #688432','color: #5f7e36','color: #557839','color: #4c723d','color: #426d41','color: #396744','color: #2f6148','color: #366a4a','color: #3d724c','color: #447b4d','color: #4b844f','color: #538c51','color: #5a9553','color: #619e55','color: #68a657','color: #6faf58','color: #76b75a','color: #7dc05c','color: #84c95e','color: #8cd160','color: #93da62','color: #9ae363','color: #a1eb65','color: #a8f467','color: #a4e661','color: #a0d85b','color: #9cca56','color: #98bd50','color: #94af4a','color: #90a144','color: #8c933e','color: #888539','color: #837733','color: #7f692d','color: #7b5b27','color: #774e21','color: #73401b','color: #6f3216','color: #6b2410','color: #67160a','color: #701f10','color: #782816','color: #81311d','color: #8a3a23','color: #924429','color: #9b4d2f','color: #a45635','color: #ac5f3b','color: #b56842','color: #bd7148','color: #c67a4e','color: #cf8354','color: #d78d5a','color: #e09660','color: #e99f67','color: #f1a86d','color: #fab173','color: #f7a96f','color: #f3a16c','color: #f09968','color: #ec9265','color: #e98a61','color: #e5825e','color: #e27a5a','color: #de7257','color: #db6a53','color: #d7624f','color: #d45a4c','color: #d05348','color: #cd4b45','color: #c94341','color: #c63b3e','color: #c2333a','color: #c4373a','color: #c73b3a','color: #c93f3a','color: #cc433b','color: #ce473b','color: #d14b3b','color: #d34f3b','color: #d6533b','color: #d8563b','color: #da5a3b','color: #dd5e3b','color: #df623c','color: #e2663c','color: #e46a3c','color: #e76e3c','color: #e9723c','color: #de6b3a','color: #d26539','color: #c75e37','color: #bc5736','color: #b15034','color: #a54a32','color: #9a4331','color: #8f3c2f','color: #83362e','color: #782f2c','color: #6d282b','color: #612229','color: #561b27','color: #4b1426','color: #400d24','color: #340723','color: #290021','color: #310d2a','color: #391a33','color: #40263b','color: #483344','color: #50404d','color: #584d56','color: #5f595e','color: #676667','color: #6f7370','color: #a9ca99','color: #acc98f','color: #aec985','color: #b0c87b','color: #b2c771','color: #b4c667','color: #b7c55d','color: #b9c453','color: #bbc349','color: #bdc23f','color: #bfc235','color: #c1c12b','color: #c4c021','color: #c6bf17','color: #c8be0d','color: #beb811','color: #b5b214','color: #abad18','color: #a2a71c','color: #98a11f','color: #8f9b23','color: #859527','color: #7c902b','color: #728a2e','color: #688432','color: #5f7e36','color: #557839','color: #4c723d','color: #426d41','color: #396744','color: #2f6148','color: #366a4a','color: #3d724c','color: #447b4d','color: #4b844f','color: #538c51','color: #5a9553','color: #619e55','color: #68a657','color: #6faf58','color: #76b75a','color: #7dc05c','color: #84c95e','color: #8cd160','color: #93da62','color: #9ae363','color: #a1eb65','color: #a8f467','color: #a4e661','color: #a0d85b','color: #9cca56','color: #98bd50','color: #94af4a','color: #90a144','color: #8c933e','color: #888539','color: #837733','color: #7f692d','color: #7b5b27','color: #774e21','color: #73401b','color: #6f3216','color: #6b2410','color: #67160a','color: #701f10','color: #782816','color: #81311d','color: #8a3a23','color: #924429','color: #9b4d2f','color: #a45635','color: #ac5f3b','color: #b56842','color: #bd7148','color: #c67a4e','color: #cf8354','color: #d78d5a','color: #e09660','color: #e99f67','color: #f1a86d','color: #fab173','color: #f7a96f','color: #f3a16c','color: #f09968','color: #ec9265','color: #e98a61','color: #e5825e','color: #e27a5a','color: #de7257','color: #db6a53','color: #d7624f','color: #d45a4c','color: #d05348','color: #cd4b45','color: #c94341','color: #c63b3e','color: #c2333a','color: #c4373a','color: #c73b3a','color: #c93f3a','color: #cc433b','color: #ce473b','color: #d14b3b','color: #d34f3b','color: #d6533b','color: #d8563b','color: #da5a3b','color: #dd5e3b','color: #df623c','color: #e2663c','color: #e46a3c','color: #e76e3c','color: #e9723c','color: #de6b3a','color: #d26539','color: #c75e37','color: #bc5736','color: #b15034','color: #a54a32','color: #9a4331','color: #8f3c2f','color: #83362e','color: #782f2c','color: #6d282b','color: #612229','color: #561b27','color: #4b1426','color: #400d24','color: #340723','color: #290021','color: #310d2a','color: #391a33','color: #7e8c81','color: #86998a','color: #8ea693','color: #96b39c','color: #9dbfa4','color: #a5ccad','color: #a7cba3','color: #a9ca99','color: #acc98f','color: #aec985','color: #b0c87b','color: #b2c771','color: #b4c667','color: #b7c55d','color: #b9c453','color: #bbc349','color: #bdc23f','color: #bfc235','color: #c1c12b','color: #c4c021','color: #c6bf17','color: #c8be0d','color: #beb811','color: #b5b214','color: #abad18','color: #a2a71c','color: #98a11f','color: #8f9b23','color: #859527','color: #7c902b','color: #728a2e','color: #688432','color: #5f7e36','color: #557839','color: #4c723d','color: #426d41','color: #396744','color: #2f6148','color: #366a4a','color: #3d724c','color: #447b4d','color: #4b844f','color: #538c51','color: #5a9553','color: #619e55','color: #68a657','color: #6faf58','color: #76b75a','color: #7dc05c','color: #84c95e','color: #8cd160','color: #93da62','color: #9ae363','color: #a1eb65','color: #a8f467','color: #a4e661','color: #a0d85b','color: #9cca56','color: #98bd50','color: #94af4a','color: #90a144','color: #8c933e','color: #888539','color: #837733','color: #7f692d','color: #7b5b27','color: #774e21','color: #73401b','color: #6f3216','color: #6b2410','color: #67160a','color: #701f10','color: #782816','color: #81311d','color: #8a3a23','color: #924429','color: #9b4d2f','color: #a45635','color: #ac5f3b','color: #b56842','color: #bd7148','color: #c67a4e','color: #cf8354','color: #d78d5a','color: #e09660','color: #e99f67','color: #f1a86d','color: #fab173','color: #f7a96f','color: #f3a16c','color: #f09968','color: #ec9265','color: #e98a61','color: #e5825e','color: #e27a5a','color: #de7257','color: #db6a53','color: #d7624f','color: #d45a4c','color: #d05348','color: #cd4b45','color: #c94341','color: #c63b3e','color: #c2333a','color: #c4373a','color: #c73b3a','color: #c93f3a','color: #cc433b','color: #ce473b','color: #d14b3b','color: #d34f3b','color: #d6533b','color: #d8563b','color: #da5a3b','color: #dd5e3b','color: #df623c','color: #e2663c','color: #e46a3c','color: #e76e3c','color: #e9723c','color: #de6b3a','color: #d26539','color: #c75e37','color: #bc5736','color: #b15034','color: #a54a32','color: #9a4331','color: #8f3c2f','color: #83362e','color: #782f2c','color: #6d282b','color: #612229','color: #483344','color: #50404d','color: #584d56','color: #5f595e','color: #676667','color: #6f7370','color: #778079','color: #7e8c81','color: #86998a','color: #8ea693','color: #96b39c','color: #9dbfa4','color: #a5ccad','color: #a7cba3','color: #a9ca99','color: #acc98f','color: #aec985','color: #b0c87b','color: #b2c771','color: #b4c667','color: #b7c55d','color: #b9c453','color: #bbc349','color: #bdc23f','color: #bfc235','color: #c1c12b','color: #c4c021','color: #c6bf17','color: #c8be0d','color: #beb811','color: #b5b214','color: #abad18','color: #a2a71c','color: #98a11f','color: #8f9b23','color: #859527','color: #7c902b','color: #728a2e','color: #688432','color: #5f7e36','color: #557839','color: #4c723d','color: #426d41','color: #396744','color: #2f6148','color: #366a4a','color: #3d724c','color: #447b4d','color: #4b844f','color: #538c51','color: #5a9553','color: #619e55','color: #68a657','color: #6faf58','color: #76b75a','color: #7dc05c','color: #84c95e','color: #8cd160','color: #93da62','color: #9ae363','color: #a1eb65','color: #a8f467','color: #a4e661','color: #a0d85b','color: #9cca56','color: #98bd50','color: #94af4a','color: #90a144','color: #8c933e','color: #888539','color: #837733','color: #7f692d','color: #7b5b27','color: #774e21','color: #73401b','color: #6f3216','color: #6b2410','color: #67160a','color: #701f10','color: #782816','color: #81311d','color: #8a3a23','color: #924429','color: #9b4d2f','color: #a45635','color: #ac5f3b','color: #b56842','color: #bd7148','color: #c67a4e','color: #cf8354','color: #d78d5a','color: #e09660','color: #e99f67','color: #f1a86d','color: #fab173','color: #f7a96f','color: #f3a16c','color: #f09968','color: #ec9265','color: #e98a61','color: #e5825e','color: #e27a5a','color: #de7257','color: #db6a53','color: #d7624f','color: #d45a4c','color: #d05348','color: #cd4b45','color: #c94341','color: #c63b3e','color: #c2333a','color: #c4373a','color: #c73b3a','color: #c93f3a','color: #cc433b','color: #ce473b','color: #d14b3b','color: #d34f3b','color: #d6533b','color: #d8563b','color: #da5a3b','color: #dd5e3b','color: #df623c','color: #e2663c','color: #e46a3c','color: #e76e3c','color: #e9723c','color: #de6b3a','color: #d26539','color: #c75e37','color: #bc5736','color: #b15034','color: #4b1426','color: #400d24','color: #340723','color: #290021','color: #310d2a','color: #391a33','color: #40263b','color: #483344','color: #50404d','color: #584d56','color: #5f595e','color: #676667','color: #6f7370','color: #778079','color: #7e8c81','color: #86998a','color: #8ea693','color: #96b39c','color: #9dbfa4','color: #a5ccad','color: #a7cba3','color: #a9ca99','color: #acc98f','color: #aec985','color: #b0c87b','color: #b2c771','color: #b4c667','color: #b7c55d','color: #b9c453','color: #bbc349','color: #bdc23f','color: #bfc235','color: #c1c12b','color: #c4c021','color: #c6bf17','color: #c8be0d','color: #beb811','color: #b5b214','color: #abad18','color: #a2a71c','color: #98a11f','color: #8f9b23','color: #859527','color: #7c902b','color: #728a2e','color: #688432','color: #5f7e36','color: #557839','color: #4c723d','color: #426d41','color: #396744','color: #2f6148','color: #366a4a','color: #3d724c','color: #447b4d','color: #4b844f','color: #538c51','color: #5a9553','color: #619e55','color: #68a657','color: #6faf58','color: #76b75a','color: #7dc05c','color: #84c95e','color: #8cd160','color: #93da62','color: #9ae363','color: #a1eb65','color: #a8f467','color: #a4e661','color: #a0d85b','color: #9cca56','color: #98bd50','color: #94af4a','color: #90a144','color: #8c933e','color: #888539','color: #837733','color: #7f692d','color: #7b5b27','color: #774e21','color: #73401b','color: #6f3216','color: #6b2410','color: #67160a','color: #701f10','color: #782816','color: #81311d','color: #8a3a23','color: #924429','color: #9b4d2f','color: #a45635','color: #ac5f3b','color: #b56842','color: #bd7148','color: #c67a4e','color: #cf8354','color: #d78d5a','color: #e09660','color: #e99f67','color: #f1a86d','color: #fab173','color: #f7a96f','color: #f3a16c','color: #f09968','color: #ec9265','color: #e98a61','color: #e5825e','color: #e27a5a','color: #de7257','color: #db6a53','color: #d7624f','color: #d45a4c','color: #d05348','color: #cd4b45','color: #c94341','color: #c63b3e','color: #c2333a','color: #c4373a','color: #c73b3a','color: #c93f3a','color: #cc433b','color: #ce473b','color: #d14b3b','color: #d34f3b','color: #d6533b','color: #d8563b','color: #da5a3b','color: #dd5e3b','color: #df623c','color: #e2663c','color: #e46a3c','color: #9a4331','color: #8f3c2f','color: #83362e','color: #782f2c','color: #6d282b','color: #612229','color: #561b27','color: #4b1426','color: #400d24','color: #340723','color: #290021','color: #310d2a','color: #391a33','color: #40263b','color: #483344','color: #50404d','color: #584d56','color: #5f595e','color: #676667','color: #6f7370','color: #778079','color: #7e8c81','color: #86998a','color: #8ea693','color: #96b39c','color: #9dbfa4','color: #a5ccad','color: #a7cba3','color: #a9ca99','color: #acc98f','color: #aec985','color: #b0c87b','color: #b2c771','color: #b4c667','color: #b7c55d','color: #b9c453','color: #bbc349','color: #bdc23f','color: #bfc235','color: #c1c12b','color: #c4c021','color: #c6bf17','color: #c8be0d','color: #beb811','color: #b5b214','color: #abad18','color: #a2a71c','color: #98a11f','color: #8f9b23','color: #859527','color: #7c902b','color: #728a2e','color: #688432','color: #5f7e36','color: #557839','color: #4c723d','color: #426d41','color: #396744','color: #2f6148','color: #366a4a','color: #3d724c','color: #447b4d','color: #4b844f','color: #538c51','color: #5a9553','color: #619e55','color: #68a657','color: #6faf58','color: #76b75a','color: #7dc05c','color: #84c95e','color: #8cd160','color: #93da62','color: #9ae363','color: #a1eb65','color: #a8f467','color: #a4e661','color: #a0d85b','color: #9cca56','color: #98bd50','color: #94af4a','color: #90a144','color: #8c933e','color: #888539','color: #837733','color: #7f692d','color: #7b5b27','color: #774e21','color: #73401b','color: #6f3216','color: #6b2410','color: #67160a','color: #701f10','color: #782816','color: #81311d','color: #8a3a23','color: #924429','color: #9b4d2f','color: #a45635','color: #ac5f3b','color: #b56842','color: #bd7148','color: #c67a4e','color: #cf8354','color: #d78d5a','color: #e09660','color: #e99f67','color: #f1a86d','color: #fab173','color: #f7a96f','color: #f3a16c','color: #f09968','color: #ec9265','color: #e98a61','color: #e5825e','color: #e27a5a','color: #de7257','color: #db6a53','color: #d7624f','color: #d45a4c','color: #d05348','color: #cd4b45','color: #c94341','color: #c63b3e','color: #c2333a','color: #c4373a','color: #c73b3a','color: #c93f3a','color: #cc433b','color: #ce473b','color: #d14b3b','color: #d34f3b','color: #e9723c','color: #de6b3a','color: #d26539','color: #c75e37','color: #bc5736','color: #b15034','color: #a54a32','color: #9a4331','color: #8f3c2f','color: #83362e','color: #782f2c','color: #6d282b','color: #612229','color: #561b27','color: #4b1426','color: #400d24','color: #340723','color: #290021','color: #310d2a','color: #391a33','color: #40263b','color: #483344','color: #50404d','color: #584d56','color: #5f595e','color: #676667','color: #6f7370','color: #778079','color: #7e8c81','color: #86998a','color: #8ea693','color: #96b39c','color: #9dbfa4','color: #a5ccad','color: #a7cba3','color: #a9ca99','color: #acc98f','color: #aec985','color: #b0c87b','color: #b2c771','color: #b4c667','color: #b7c55d','color: #b9c453','color: #bbc349','color: #bdc23f','color: #bfc235','color: #c1c12b','color: #c4c021','color: #c6bf17','color: #c8be0d','color: #beb811','color: #b5b214','color: #abad18','color: #a2a71c','color: #98a11f','color: #8f9b23','color: #859527','color: #7c902b','color: #728a2e','color: #688432','color: #5f7e36','color: #557839','color: #4c723d','color: #426d41','color: #396744','color: #2f6148','color: #366a4a','color: #3d724c','color: #447b4d','color: #4b844f','color: #538c51','color: #5a9553','color: #619e55','color: #68a657','color: #6faf58','color: #76b75a','color: #7dc05c','color: #84c95e','color: #8cd160','color: #93da62','color: #9ae363','color: #a1eb65','color: #a8f467','color: #a4e661','color: #a0d85b','color: #9cca56','color: #98bd50','color: #94af4a','color: #90a144','color: #8c933e','color: #888539','color: #837733','color: #7f692d','color: #7b5b27','color: #774e21','color: #73401b','color: #6f3216','color: #6b2410','color: #67160a','color: #701f10','color: #782816','color: #81311d','color: #8a3a23','color: #924429','color: #9b4d2f','color: #a45635','color: #ac5f3b','color: #b56842','color: #bd7148','color: #c67a4e','color: #cf8354','color: #d78d5a','color: #e09660','color: #e99f67','color: #f1a86d','color: #fab173','color: #f7a96f','color: #f3a16c','color: #f09968','color: #ec9265','color: #e98a61','color: #e5825e','color: #e27a5a','color: #de7257','color: #db6a53','color: #d7624f','color: #d45a4c','color: #d05348','color: #cd4b45','color: #c94341','color: #c63b3e','color: #c2333a','color: #d8563b','color: #da5a3b','color: #dd5e3b','color: #df623c','color: #e2663c','color: #e46a3c','color: #e76e3c','color: #e9723c','color: #de6b3a','color: #d26539','color: #c75e37','color: #bc5736','color: #b15034','color: #a54a32','color: #9a4331','color: #8f3c2f','color: #83362e','color: #782f2c','color: #6d282b','color: #612229','color: #561b27','color: #4b1426','color: #400d24','color: #340723','color: #290021','color: #310d2a','color: #391a33','color: #40263b','color: #483344','color: #50404d','color: #584d56','color: #5f595e','color: #676667','color: #6f7370','color: #778079','color: #7e8c81','color: #86998a','color: #8ea693','color: #96b39c','color: #9dbfa4','color: #a5ccad','color: #a7cba3','color: #a9ca99','color: #acc98f','color: #aec985','color: #b0c87b','color: #b2c771','color: #b4c667','color: #b7c55d','color: #b9c453','color: #bbc349','color: #bdc23f','color: #bfc235','color: #c1c12b','color: #c4c021','color: #c6bf17','color: #c8be0d','color: #beb811','color: #b5b214','color: #abad18','color: #a2a71c','color: #98a11f','color: #8f9b23','color: #859527','color: #7c902b','color: #728a2e','color: #688432','color: #5f7e36','color: #557839','color: #4c723d','color: #426d41','color: #396744','color: #2f6148','color: #366a4a','color: #3d724c','color: #447b4d','color: #4b844f','color: #538c51','color: #5a9553','color: #619e55','color: #68a657','color: #6faf58','color: #76b75a','color: #7dc05c','color: #84c95e','color: #8cd160','color: #93da62','color: #9ae363','color: #a1eb65','color: #a8f467','color: #a4e661','color: #a0d85b','color: #9cca56','color: #98bd50','color: #94af4a','color: #90a144','color: #8c933e','color: #888539','color: #837733','color: #7f692d','color: #7b5b27','color: #774e21','color: #73401b','color: #6f3216','color: #6b2410','color: #67160a','color: #701f10','color: #782816','color: #81311d','color: #8a3a23','color: #924429','color: #9b4d2f','color: #a45635','color: #ac5f3b','color: #b56842','color: #bd7148','color: #c67a4e','color: #cf8354','color: #d78d5a','color: #e09660','color: #e99f67','color: #f1a86d','color: #fab173','color: #f7a96f','color: #f3a16c','color: #f09968','color: #ec9265','color: #e98a61','color: #e5825e','color: #e27a5a','color: #de7257','color: #db6a53'
);