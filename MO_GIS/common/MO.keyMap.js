/*
 * 쿼리에서 사용한 alias 와, 
 * 소스 상 사용하는 '객체들의 KEY 값'을 
 * 일치시키기 위한 변수정의
 * 
 * 우리집-집주소 관계.. 집주소는 바뀔 수 있어도 우리집 개념은 동일
 * LAYER_ID - id.. id는 L_ID 로 DB alias가 바뀔 수 있어도, 모듈 사이에서 호출하는건 LAYER_ID 로 동일  
 * 
 * DB 의 alias 가 변경되면 이 js 파일의 각 값의 string 값을 변경하면 된다
 * @author jhoh
 */

/** 
 * Openlayers 의 레이어 객체를 생성하기 위해 필요한 정보들을 표현
 * @typedef {object} layerCodeObj
 * @property {number} id DB 상 개별 레이어의 Primary Key
 * @property {number} pid 본 레이어의 상위 레이어 id. 보통 상위레이어는 '그룹'임
 * @property {string} layerTitle 레이어의 클라이언트 표출 이름
 * @property {number} ordr 레이어 리스트의 정렬 순서 (렌더링 순서 아님)
 * 
 * @property {string} origin '소스'의 location.origin 과 내용 같음
 * @property {string} sourcePathname '소스'의 location.pathname 과 내용 같음
 * @property {string} apiKey '소스' 접근을 위한 authenticity
 * 
 * @property {number} zIndex 레이어 렌더링 순서. 수가 클수록 나중에 그려져서 다른 레이어 덮음
 * @property {string} typeName geoserver 의 TYPE_NAME 과 같은 속성
 * @property {string} sourceClass openlayers 라이브러리 '소스' 객체 클래스명
 * @property {OPENLAYERS_GEOMETRY_TYPE} geomType 
 * @property {string} category '소스'의 도메인 경로 구분자. e.g. 'virtual','vworld','geoserver'
 * @property {string} srid 좌표계 e.g. 'EPSG:5186'
 * @property {string} minZoom 레이어가 표현될 최소 줌. 설정 줌 보다 멀어질 경우 레이어 숨겨짐
 * @property {string} cqlfilter 
 * @property {string} arcLayerId <지능형수도물> 프로젝트 특화 레이어 쿼리 조건
 * 
 * @property {string} iconName Point, Polygon 중앙 좌표에 표시할 심볼
 * @property {string|number} lineWidth 선 두께
 * @property {string} lineStyle 선스타일  e.g. 'solid', '[3,5]'
 * @property {string} colorLine 선 색  e.g. 'rgba(2,2,2,0.5)'
 * @property {string} colorFill 면적채우기 색 e.g. 'rgba(2,2,2,0.5)'
 * @property {string} label 지도 상 렌더링 될 피쳐의 속성 명 
 * @property {string} font 폰트 스타일 e.g. 'serif 14px bold'
 * @property {string} fontWidth 폰트 외곽선 두께
 * @property {string} colorFontLine 폰트외곽선 색 e.g. 'rgba(2,2,2,0.5)'
 * @property {string} colorFontFill 폰트채우기 색 e.g. 'rgba(2,2,2,0.5)'
 * 
 * @property {('Y'|'N')} boolSelectable 레이어 선택 가능여부 
 * @property {'Y'|'N'} boolUseYn 레이어 사용여부
 * @property {'Y'|'N'} boolIsgroup 레이어 그룹 여부
 * @property {'Y'|'N'} boolEditable 레이어 사용자 수정 가능 여부
 * @property {'Y'|'N'} boolShowInit 레이어 초기 표출 여부
 * @property {'Y'|'N'} boolDownload 레이어 다운로드 가능 여부
 * @property {'Y'|'N'} boolDeclutter 밀집된 feature 간소화 기능 활성화 여부
 * @property {'Y'|'N'} boolIsheavy 대용량 레이어 구분 
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
export const ICON_NAME = `iconName`;
export const COLOR_FILL = `colorFill`;
export const LINE_STYLE = `lineStyle`;
export const LINE_WIDTH = `lineWidth`;
export const COLOR_LINE = `colorLine`;
export const LABEL_COLUMN = `label`;
export const FONT_OUTLINE = `colorFontLine`;
export const FONT_FILL = `colorFontFill`;
export const FONT_WIDTH = `fontWidth`;
export const FONT_STYLE = `font`;

/* 레이어 객체 관련 */
export const BOOL_SELECTABLE = `boolSelectable`;
export const BOOL_SHOW_INITIAL = `boolShowInit`; //'초기에 보여야 하는지' 여부. 상수 constant (DB에 기 작성된)
export const BOOL_VISIBLE = `boolVisible`; //'보여야 하는지' 여부. 변수 variable (런타임에 바뀌는)
export const BOOL_HEAVY = `boolIsheavy`; //피쳐수 많아 로딩 시간이 긴 레이어 구분자. Y 일 경우 미리 로딩하도록 안배함.
export const BOOL_DECLUTTER = `boolDeclutter`; //feature 가 clustered 되어있을 때 일부만 보여줄지 여부
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

/** 프로젝트 구조 상 지도 ICON 경로 통일 */
export const ICON_PATH = `/js-lib/openlayers/ol7/MO_GIS/images/icons/`;
/*
 * 레이어들의 목적으로 다르게 운용하기위해 구분
 * @enum { {BASE:['base',5], RISKMAP:['risk',1], LEAK:['leak',2], PUBLIC:['public',3], PIPENET:['pipenet',4], MANAGE:['manage',6], COMPLAINT:['comp',7], REALTIME:['realtime',8], PORTABLE:['portable',9] }} LAYER_PURPOSE_CATEGORY
 */
/**
 * @typedef {"base" | "risk" | "leak" | "public" | "pipenet"| "manage"| "comp"| "realtime"| "portable"} LayerPurpose
 */
/**
 * @typedef {Array<LayerPurpose|number>} LayerPurposeAndOrder
 */
/**
 * 레이어들의 목적으로 다르게 운용하기위해 구분
 * @enum {LayerPurposeAndOrder}
 */
export const LAYER_PURPOSE_CATEGORY = {
	/**기본 GIS 관망도 e.g. 관로, 계측기, 블록 등*/
	BASE: ['base', 5],
	/** (지능수도플) 리스크맵 */
	RISKMAP: ['risk', 1],
	/** (지능수도플) 누수예상지점 */
	LEAK: ['leak', 2],
	/** (지능수도플) 공공서비스 */
	PUBLIC: ['public', 3],
	/** (지능수도플) 관망해석결과 */
	PIPENET: ['pipenet', 4],
	/**(지능수도플) 중점 관리지역 */
	MANAGE: ['manage', 6],
	/** (지능수도플) 상습민원지역 */
	COMPLAINT: ['comp', 7],
	/** (지능수도플) 실시간 상황감지 */
	REALTIME: ['realtime', 8],
	/** (지능수도플) 이동형 누수센서 */
	PORTABLE: ['portable', 9],
}

/** LayerTree 가 관장하는 범례용 정보객체 (⊃ LayerCode)
* @typedef {object} LegendCodeObj
* @property {number} id 레이어 아이디
* @property {boolean} boolVisible 해당 레이어 렌더링 여부
* @property {string} layerPurposeCategory 해당레이어 목적별 구분자
* @property {string} legendHtmlString 문자열로 표현된 html 태그 엘리먼트
* @property {layerCodeObj} layerCode 
*/

/* MOPublisher, MOSubscriber 관련 키*/
export const LAYER_PURPOSE_CATEGORY_KEY = 'layerPurposeCategory';
export const LEGEND_HTML_STRING = 'legendHtmlString';

/* ▲▲▲▲▲레이어 소스(Source) 관련▲▲▲▲▲▲▲▲▲△ */
export const ORIGIN = `origin`;
export const SOURCE_PATHNAME = `sourcePathname`;
/**
 * 소스를 Openlayers 상 클래스로 구분하기 위함. e.g. vector, wmts
 */
export const SOURCE_CLASS = `sourceClass`;
export const CQL_FILTER = `cqlfilter`;

/** GIS데이터 연계시, 원본 소스에서 지정한 특수 레이어 아이디일 것. 이것을 arcLayerId 로 지정 */
export const ARC_LAYER_ID = `arcLayerId`;
export const APIKEY = `apiKey`;
export const SRID = `srid`;

/** 소스의 출처 대분류 구분하기 위함. e.g. geoserver, vworld, intra */
export const SOURCE_CATEGORY = `category`;

/** 주소검색 결과를 표현하기 위한 임시 소스와 레이어 */
export const ADDRESS_SOURCE_LAYER_KEY = 'address';

/** 강조효과 표현하기 위한 임시 소스와 레이어 
 * @type {string}
*/
export const HIGHLIGHT_SOURCE_LAYER_KEY = 'highlight';

/** 데이터 없는 빈 (vector) 소스와 레이어 */
export const VIRTUAL_SOURCE_LAYER_KEY = 'virtual';



/* Openlayers Feature들의 타입 구분 */
/**
 * @typedef {'Point'|'LineString'|'Polygon'} OPENLAYERS_GEOMETRY_TYPE 오픈레이어스에서 사용하는 Geometry 타입명
 */
/**
 * @enum {OPENLAYERS_GEOMETRY_TYPE} OL_GEOM_TYPE
 */
export const OL_GEOMETRY_OBJ = {
	POINT: 'Point',
	LINE: 'LineString',
	POLYGON: 'Polygon',
}



/** 배경지도(브이월드) 공식 좌표계.  
 *  각 타일 이미지의 왜곡을 방지하기 위해 정확한 좌표계를 알아야 함 (API 문서 상 기재)
*/
export const SRID_TILE_VWORLD = `EPSG:3857`;
/** 배경지도(바로e맵) 공식 좌표계.  
 *  각 타일 이미지의 왜곡을 방지하기 위해 정확한 좌표계를 알아야 함 (API 문서 상 기재)
*/
export const SRID_TILE_EMAP = `EPSG:5179`
/** 특정 지사 좌표의 좌표계.  
 *  e.g. <CM_MGC> 테이블의 좌표정보 */
export const SRID_MGC_CRS= `EPSG:5181`;
/** 프로젝트 내 GIS 정보의 기준 좌표계.  
 *  <WTL_%> */
export const SRID_DB_GIS = `EPSG:5186`;


/**
 * select interaction 편의를 위해, 줌이 이 수준 이상 확대되면 select 되지 않도록 조치
 */
export const POLYGON_SELECT_MARGINAL_RESOLUTION = 4;

export const CONSOLE_DECO = {
	HEADER: `border:2px solid blue; border-radius:5px;
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
export function jsonNestor(array, target_id_key, parent_id_key, child_mark, most_upper_id) {
	if (array && array.length > 0) {
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
				if (most_upper_id) { return el[parent_id_key] == most_upper_id; }
				else { return !el[parent_id_key]; }
			})
			)
		);
	} else {
		console.log(array);
		throw new Error(`jsonNestor 에 입력된 배열이 적합하지 않음`)
	}
}
/*
//usage
console.time('aa')
let returns = jsonNestor(arr,'id','pid','childList')
console.log(returns);
console.timeEnd('aa')
*/

/**
 * 주어진 문자열이 숫자로 변경될 수 있는지 확인하는 함수
 * @param {string} str 
 * @returns {boolean}
 */
export function isNumeric(str) {
	if (typeof str == 'number') return true
	else if (typeof str != "string") throw new Error(`숫자 또는 문자만 체크 가능함 : ${str}`)
	return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
		!isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

/**
 * 여러 Map 객체들을 하나로 합쳐 하나의 Map 을 반환
 * @param {Array<Map>} mapArray 
 */
export function mergeMaps(mapArray) {
	if (!Array.isArray(mapArray)) throw new TypeError("파라미터는 Map 객체들로 구성된 Array 여야 함");
	let mergedMap = new Map();
	mapArray.forEach(map => {
		if (map instanceof Map) map.forEach((value, key) => { mergedMap.set(key, value); });
	});
	return mergedMap;
}


/**
 * 지사코드와 레이어그룹 목적 키 값으로 LayerCodeObjArr 를 조회
 * @param {KEY.LayerPurpose|'extra'|'intra'} layerPurposeKey 
 * @param {string} opt_mgcCd - 지사코드  e.g. 'JS000514' 
 */
//export async function getLayerCode(layerPurposeKey='base'){
export async function getLayerCode(layerPurposeKey = 'base', opt_mgcCd) {
	if (!(mgcCd || opt_mgcCd)) throw new Error(`지사코드 설정되지 않음 : ${mgcCd}`);

	const UR = `${ctxPath}/map/layerCode/${mgcCd}`;
	let tempUrl = new URL(UR, location.origin);
	tempUrl.search = new URLSearchParams({ layerPurpose: layerPurposeKey });

	const resu = await fetch(tempUrl, { headers: { "content-type": "application/json", "x-requested-with": "XMLHttpRequest" } });
	const jsn = await resu.json();

	return jsn['data'] ? jsn['data'] : [];
}

/**
 * 브라우저가 ES6 주요 함수들을 지원하는지 체크함
 */
export function checkBrowserSupport() {
	let message = '';
	try {
		const supportsStructuredClone = typeof structuredClone === 'function';
		const supportsReplaceChildren = typeof Element.prototype.replaceChildren === 'function';
		const supportsOptionalChaining = (() => {
			try { eval('const foo = {}; foo?.bar'); }
			catch { return false; }
			return true;
		})();

		if (supportsStructuredClone && supportsReplaceChildren && supportsOptionalChaining) {
			message = '브라우저가 모든 기능을 지원함';
		} else {
			message += '브라우저가 다음 기능(들)을 지원하지 않습니다 :';
			if (!supportsStructuredClone) message += '\n - structuredClone'
			if (!supportsReplaceChildren) message += '\n - Element::replaceChildren'
			if (!supportsOptionalChaining) message += '\n - Object::"optional chaining"'
			message += '\n최신 브라우저(2020년 이후)로 업데이트 후 사용을 권장드립니다. ';
		}
	} catch (error) {
		console.error('An error occurred:', error.message);
	}
	console.log(message);
	return message;
}

const mindone = () => console.log('%c_%c_%c/%c\\%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c/%c\\%c\\%c\\%c\\%c_%c_%c/%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c/%c\\%c\\%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c %c %c %c %c %c %c %c \n%c %c_%c\\%c/%c\\%c\\%c\\%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c/%c\\%c\\%c\\%c\\%c\\%c\\%c_%c\\%c/%c/%c/%c/%c/%c\\%c\\%c\\%c/%c/%c/%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c/%c\\%c\\%c\\%c/%c/%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c %c %c %c %c %c %c \n%c %c %c_%c\\%c/%c\\%c\\%c\\%c/%c/%c\\%c\\%c\\%c_%c_%c_%c_%c/%c\\%c\\%c\\%c/%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c/%c\\%c\\%c\\%c/%c_%c_%c\\%c/%c/%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c %c %c %c %c %c \n%c %c %c %c_%c\\%c/%c\\%c\\%c\\%c\\%c/%c/%c/%c\\%c\\%c\\%c/%c\\%c\\%c\\%c/%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c/%c\\%c\\%c/%c\\%c\\%c\\%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c\\%c/%c/%c\\%c\\%c\\%c_%c_%c/%c\\%c\\%c/%c\\%c\\%c\\%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c/%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c_%c_%c %c %c %c %c \n%c %c %c %c %c_%c\\%c/%c\\%c\\%c\\%c_%c_%c\\%c/%c/%c/%c\\%c\\%c\\%c/%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c/%c/%c/%c/%c\\%c\\%c\\%c_%c_%c_%c_%c/%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c\\%c/%c\\%c\\%c\\%c/%c/%c/%c/%c\\%c\\%c\\%c_%c_%c_%c_%c/%c\\%c\\%c\\%c/%c/%c/%c/%c/%c\\%c\\%c\\%c_%c %c %c %c \n%c %c %c %c %c %c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c\\%c/%c/%c/%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c\\%c/%c/%c\\%c\\%c\\%c_%c_%c/%c\\%c\\%c\\%c/%c/%c/%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c\\%c/%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c/%c\\%c\\%c\\%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c\\%c/%c/%c\\%c\\%c\\%c_%c_%c/%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c_%c_%c %c %c \n%c %c %c %c %c %c %c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c\\%c/%c/%c/%c\\%c\\%c\\%c_%c_%c/%c\\%c\\%c\\%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c\\%c/%c/%c\\%c\\%c/%c/%c/%c/%c/%c/%c/%c_%c_%c_%c %c \n%c %c %c %c %c %c %c %c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c/%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c\\%c/%c/%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c/%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c\\%c/%c/%c/%c\\%c\\%c\\%c\\%c\\%c/%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c\\%c/%c/%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c_%c \n%c %c %c %c %c %c %c %c %c_%c\\%c/%c/%c/%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c\\%c/%c/%c/%c_%c_%c\\%c/%c/%c/%c/%c/%c/%c/%c/%c/%c/%c/%c_%c_%c\\%c/%c/%c/%c_%c_%c_%c_%c\\%c/%c/%c/%c_%c_%c_%c\\%c/%c/%c/%c/%c/%c/%c/%c\\%c/%c/%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c\\%c/%c/%c/%c/%c/%c_%c_%c_%c_%c_%c_%c_%c\\%c/%c/%c/%c_%c_%c_%c_%c\\%c/%c/%c/%c_%c_%c_%c_%c\\%c/%c/%c/%c/%c/%c/%c/%c/%c/%c/%c_%c_'
	, 'color: #c8be0d', 'color: #beb811', 'color: #b5b214', 'color: #abad18', 'color: #a2a71c', 'color: #98a11f', 'color: #8f9b23', 'color: #859527', 'color: #7c902b', 'color: #728a2e', 'color: #688432', 'color: #5f7e36', 'color: #557839', 'color: #4c723d', 'color: #426d41', 'color: #396744', 'color: #2f6148', 'color: #366a4a', 'color: #3d724c', 'color: #447b4d', 'color: #4b844f', 'color: #538c51', 'color: #5a9553', 'color: #619e55', 'color: #68a657', 'color: #6faf58', 'color: #76b75a', 'color: #7dc05c', 'color: #84c95e', 'color: #8cd160', 'color: #93da62', 'color: #9ae363', 'color: #a1eb65', 'color: #a8f467', 'color: #a4e661', 'color: #a0d85b', 'color: #9cca56', 'color: #98bd50', 'color: #94af4a', 'color: #90a144', 'color: #8c933e', 'color: #888539', 'color: #837733', 'color: #7f692d', 'color: #7b5b27', 'color: #774e21', 'color: #73401b', 'color: #6f3216', 'color: #6b2410', 'color: #67160a', 'color: #701f10', 'color: #782816', 'color: #81311d', 'color: #8a3a23', 'color: #924429', 'color: #9b4d2f', 'color: #a45635', 'color: #ac5f3b', 'color: #b56842', 'color: #bd7148', 'color: #c67a4e', 'color: #cf8354', 'color: #d78d5a', 'color: #e09660', 'color: #e99f67', 'color: #f1a86d', 'color: #fab173', 'color: #f7a96f', 'color: #f3a16c', 'color: #f09968', 'color: #ec9265', 'color: #e98a61', 'color: #e5825e', 'color: #e27a5a', 'color: #de7257', 'color: #db6a53', 'color: #d7624f', 'color: #d45a4c', 'color: #d05348', 'color: #cd4b45', 'color: #c94341', 'color: #c63b3e', 'color: #c2333a', 'color: #c4373a', 'color: #c73b3a', 'color: #c93f3a', 'color: #cc433b', 'color: #ce473b', 'color: #d14b3b', 'color: #d34f3b', 'color: #d6533b', 'color: #d8563b', 'color: #da5a3b', 'color: #dd5e3b', 'color: #df623c', 'color: #e2663c', 'color: #e46a3c', 'color: #e76e3c', 'color: #e9723c', 'color: #de6b3a', 'color: #d26539', 'color: #c75e37', 'color: #bc5736', 'color: #b15034', 'color: #a54a32', 'color: #9a4331', 'color: #8f3c2f', 'color: #83362e', 'color: #782f2c', 'color: #6d282b', 'color: #612229', 'color: #561b27', 'color: #4b1426', 'color: #400d24', 'color: #340723', 'color: #290021', 'color: #310d2a', 'color: #391a33', 'color: #40263b', 'color: #483344', 'color: #50404d', 'color: #584d56', 'color: #5f595e', 'color: #676667', 'color: #6f7370', 'color: #778079', 'color: #7e8c81', 'color: #86998a', 'color: #8ea693', 'color: #96b39c', 'color: #9dbfa4', 'color: #a5ccad', 'color: #b9c453', 'color: #bbc349', 'color: #bdc23f', 'color: #bfc235', 'color: #c1c12b', 'color: #c4c021', 'color: #c6bf17', 'color: #c8be0d', 'color: #beb811', 'color: #b5b214', 'color: #abad18', 'color: #a2a71c', 'color: #98a11f', 'color: #8f9b23', 'color: #859527', 'color: #7c902b', 'color: #728a2e', 'color: #688432', 'color: #5f7e36', 'color: #557839', 'color: #4c723d', 'color: #426d41', 'color: #396744', 'color: #2f6148', 'color: #366a4a', 'color: #3d724c', 'color: #447b4d', 'color: #4b844f', 'color: #538c51', 'color: #5a9553', 'color: #619e55', 'color: #68a657', 'color: #6faf58', 'color: #76b75a', 'color: #7dc05c', 'color: #84c95e', 'color: #8cd160', 'color: #93da62', 'color: #9ae363', 'color: #a1eb65', 'color: #a8f467', 'color: #a4e661', 'color: #a0d85b', 'color: #9cca56', 'color: #98bd50', 'color: #94af4a', 'color: #90a144', 'color: #8c933e', 'color: #888539', 'color: #837733', 'color: #7f692d', 'color: #7b5b27', 'color: #774e21', 'color: #73401b', 'color: #6f3216', 'color: #6b2410', 'color: #67160a', 'color: #701f10', 'color: #782816', 'color: #81311d', 'color: #8a3a23', 'color: #924429', 'color: #9b4d2f', 'color: #a45635', 'color: #ac5f3b', 'color: #b56842', 'color: #bd7148', 'color: #c67a4e', 'color: #cf8354', 'color: #d78d5a', 'color: #e09660', 'color: #e99f67', 'color: #f1a86d', 'color: #fab173', 'color: #f7a96f', 'color: #f3a16c', 'color: #f09968', 'color: #ec9265', 'color: #e98a61', 'color: #e5825e', 'color: #e27a5a', 'color: #de7257', 'color: #db6a53', 'color: #d7624f', 'color: #d45a4c', 'color: #d05348', 'color: #cd4b45', 'color: #c94341', 'color: #c63b3e', 'color: #c2333a', 'color: #c4373a', 'color: #c73b3a', 'color: #c93f3a', 'color: #cc433b', 'color: #ce473b', 'color: #d14b3b', 'color: #d34f3b', 'color: #d6533b', 'color: #d8563b', 'color: #da5a3b', 'color: #dd5e3b', 'color: #df623c', 'color: #e2663c', 'color: #e46a3c', 'color: #e76e3c', 'color: #e9723c', 'color: #de6b3a', 'color: #d26539', 'color: #c75e37', 'color: #bc5736', 'color: #b15034', 'color: #a54a32', 'color: #9a4331', 'color: #8f3c2f', 'color: #83362e', 'color: #782f2c', 'color: #6d282b', 'color: #612229', 'color: #561b27', 'color: #4b1426', 'color: #400d24', 'color: #340723', 'color: #290021', 'color: #310d2a', 'color: #391a33', 'color: #40263b', 'color: #483344', 'color: #50404d', 'color: #584d56', 'color: #5f595e', 'color: #676667', 'color: #6f7370', 'color: #a9ca99', 'color: #acc98f', 'color: #aec985', 'color: #b0c87b', 'color: #b2c771', 'color: #b4c667', 'color: #b7c55d', 'color: #b9c453', 'color: #bbc349', 'color: #bdc23f', 'color: #bfc235', 'color: #c1c12b', 'color: #c4c021', 'color: #c6bf17', 'color: #c8be0d', 'color: #beb811', 'color: #b5b214', 'color: #abad18', 'color: #a2a71c', 'color: #98a11f', 'color: #8f9b23', 'color: #859527', 'color: #7c902b', 'color: #728a2e', 'color: #688432', 'color: #5f7e36', 'color: #557839', 'color: #4c723d', 'color: #426d41', 'color: #396744', 'color: #2f6148', 'color: #366a4a', 'color: #3d724c', 'color: #447b4d', 'color: #4b844f', 'color: #538c51', 'color: #5a9553', 'color: #619e55', 'color: #68a657', 'color: #6faf58', 'color: #76b75a', 'color: #7dc05c', 'color: #84c95e', 'color: #8cd160', 'color: #93da62', 'color: #9ae363', 'color: #a1eb65', 'color: #a8f467', 'color: #a4e661', 'color: #a0d85b', 'color: #9cca56', 'color: #98bd50', 'color: #94af4a', 'color: #90a144', 'color: #8c933e', 'color: #888539', 'color: #837733', 'color: #7f692d', 'color: #7b5b27', 'color: #774e21', 'color: #73401b', 'color: #6f3216', 'color: #6b2410', 'color: #67160a', 'color: #701f10', 'color: #782816', 'color: #81311d', 'color: #8a3a23', 'color: #924429', 'color: #9b4d2f', 'color: #a45635', 'color: #ac5f3b', 'color: #b56842', 'color: #bd7148', 'color: #c67a4e', 'color: #cf8354', 'color: #d78d5a', 'color: #e09660', 'color: #e99f67', 'color: #f1a86d', 'color: #fab173', 'color: #f7a96f', 'color: #f3a16c', 'color: #f09968', 'color: #ec9265', 'color: #e98a61', 'color: #e5825e', 'color: #e27a5a', 'color: #de7257', 'color: #db6a53', 'color: #d7624f', 'color: #d45a4c', 'color: #d05348', 'color: #cd4b45', 'color: #c94341', 'color: #c63b3e', 'color: #c2333a', 'color: #c4373a', 'color: #c73b3a', 'color: #c93f3a', 'color: #cc433b', 'color: #ce473b', 'color: #d14b3b', 'color: #d34f3b', 'color: #d6533b', 'color: #d8563b', 'color: #da5a3b', 'color: #dd5e3b', 'color: #df623c', 'color: #e2663c', 'color: #e46a3c', 'color: #e76e3c', 'color: #e9723c', 'color: #de6b3a', 'color: #d26539', 'color: #c75e37', 'color: #bc5736', 'color: #b15034', 'color: #a54a32', 'color: #9a4331', 'color: #8f3c2f', 'color: #83362e', 'color: #782f2c', 'color: #6d282b', 'color: #612229', 'color: #561b27', 'color: #4b1426', 'color: #400d24', 'color: #340723', 'color: #290021', 'color: #310d2a', 'color: #391a33', 'color: #7e8c81', 'color: #86998a', 'color: #8ea693', 'color: #96b39c', 'color: #9dbfa4', 'color: #a5ccad', 'color: #a7cba3', 'color: #a9ca99', 'color: #acc98f', 'color: #aec985', 'color: #b0c87b', 'color: #b2c771', 'color: #b4c667', 'color: #b7c55d', 'color: #b9c453', 'color: #bbc349', 'color: #bdc23f', 'color: #bfc235', 'color: #c1c12b', 'color: #c4c021', 'color: #c6bf17', 'color: #c8be0d', 'color: #beb811', 'color: #b5b214', 'color: #abad18', 'color: #a2a71c', 'color: #98a11f', 'color: #8f9b23', 'color: #859527', 'color: #7c902b', 'color: #728a2e', 'color: #688432', 'color: #5f7e36', 'color: #557839', 'color: #4c723d', 'color: #426d41', 'color: #396744', 'color: #2f6148', 'color: #366a4a', 'color: #3d724c', 'color: #447b4d', 'color: #4b844f', 'color: #538c51', 'color: #5a9553', 'color: #619e55', 'color: #68a657', 'color: #6faf58', 'color: #76b75a', 'color: #7dc05c', 'color: #84c95e', 'color: #8cd160', 'color: #93da62', 'color: #9ae363', 'color: #a1eb65', 'color: #a8f467', 'color: #a4e661', 'color: #a0d85b', 'color: #9cca56', 'color: #98bd50', 'color: #94af4a', 'color: #90a144', 'color: #8c933e', 'color: #888539', 'color: #837733', 'color: #7f692d', 'color: #7b5b27', 'color: #774e21', 'color: #73401b', 'color: #6f3216', 'color: #6b2410', 'color: #67160a', 'color: #701f10', 'color: #782816', 'color: #81311d', 'color: #8a3a23', 'color: #924429', 'color: #9b4d2f', 'color: #a45635', 'color: #ac5f3b', 'color: #b56842', 'color: #bd7148', 'color: #c67a4e', 'color: #cf8354', 'color: #d78d5a', 'color: #e09660', 'color: #e99f67', 'color: #f1a86d', 'color: #fab173', 'color: #f7a96f', 'color: #f3a16c', 'color: #f09968', 'color: #ec9265', 'color: #e98a61', 'color: #e5825e', 'color: #e27a5a', 'color: #de7257', 'color: #db6a53', 'color: #d7624f', 'color: #d45a4c', 'color: #d05348', 'color: #cd4b45', 'color: #c94341', 'color: #c63b3e', 'color: #c2333a', 'color: #c4373a', 'color: #c73b3a', 'color: #c93f3a', 'color: #cc433b', 'color: #ce473b', 'color: #d14b3b', 'color: #d34f3b', 'color: #d6533b', 'color: #d8563b', 'color: #da5a3b', 'color: #dd5e3b', 'color: #df623c', 'color: #e2663c', 'color: #e46a3c', 'color: #e76e3c', 'color: #e9723c', 'color: #de6b3a', 'color: #d26539', 'color: #c75e37', 'color: #bc5736', 'color: #b15034', 'color: #a54a32', 'color: #9a4331', 'color: #8f3c2f', 'color: #83362e', 'color: #782f2c', 'color: #6d282b', 'color: #612229', 'color: #483344', 'color: #50404d', 'color: #584d56', 'color: #5f595e', 'color: #676667', 'color: #6f7370', 'color: #778079', 'color: #7e8c81', 'color: #86998a', 'color: #8ea693', 'color: #96b39c', 'color: #9dbfa4', 'color: #a5ccad', 'color: #a7cba3', 'color: #a9ca99', 'color: #acc98f', 'color: #aec985', 'color: #b0c87b', 'color: #b2c771', 'color: #b4c667', 'color: #b7c55d', 'color: #b9c453', 'color: #bbc349', 'color: #bdc23f', 'color: #bfc235', 'color: #c1c12b', 'color: #c4c021', 'color: #c6bf17', 'color: #c8be0d', 'color: #beb811', 'color: #b5b214', 'color: #abad18', 'color: #a2a71c', 'color: #98a11f', 'color: #8f9b23', 'color: #859527', 'color: #7c902b', 'color: #728a2e', 'color: #688432', 'color: #5f7e36', 'color: #557839', 'color: #4c723d', 'color: #426d41', 'color: #396744', 'color: #2f6148', 'color: #366a4a', 'color: #3d724c', 'color: #447b4d', 'color: #4b844f', 'color: #538c51', 'color: #5a9553', 'color: #619e55', 'color: #68a657', 'color: #6faf58', 'color: #76b75a', 'color: #7dc05c', 'color: #84c95e', 'color: #8cd160', 'color: #93da62', 'color: #9ae363', 'color: #a1eb65', 'color: #a8f467', 'color: #a4e661', 'color: #a0d85b', 'color: #9cca56', 'color: #98bd50', 'color: #94af4a', 'color: #90a144', 'color: #8c933e', 'color: #888539', 'color: #837733', 'color: #7f692d', 'color: #7b5b27', 'color: #774e21', 'color: #73401b', 'color: #6f3216', 'color: #6b2410', 'color: #67160a', 'color: #701f10', 'color: #782816', 'color: #81311d', 'color: #8a3a23', 'color: #924429', 'color: #9b4d2f', 'color: #a45635', 'color: #ac5f3b', 'color: #b56842', 'color: #bd7148', 'color: #c67a4e', 'color: #cf8354', 'color: #d78d5a', 'color: #e09660', 'color: #e99f67', 'color: #f1a86d', 'color: #fab173', 'color: #f7a96f', 'color: #f3a16c', 'color: #f09968', 'color: #ec9265', 'color: #e98a61', 'color: #e5825e', 'color: #e27a5a', 'color: #de7257', 'color: #db6a53', 'color: #d7624f', 'color: #d45a4c', 'color: #d05348', 'color: #cd4b45', 'color: #c94341', 'color: #c63b3e', 'color: #c2333a', 'color: #c4373a', 'color: #c73b3a', 'color: #c93f3a', 'color: #cc433b', 'color: #ce473b', 'color: #d14b3b', 'color: #d34f3b', 'color: #d6533b', 'color: #d8563b', 'color: #da5a3b', 'color: #dd5e3b', 'color: #df623c', 'color: #e2663c', 'color: #e46a3c', 'color: #e76e3c', 'color: #e9723c', 'color: #de6b3a', 'color: #d26539', 'color: #c75e37', 'color: #bc5736', 'color: #b15034', 'color: #4b1426', 'color: #400d24', 'color: #340723', 'color: #290021', 'color: #310d2a', 'color: #391a33', 'color: #40263b', 'color: #483344', 'color: #50404d', 'color: #584d56', 'color: #5f595e', 'color: #676667', 'color: #6f7370', 'color: #778079', 'color: #7e8c81', 'color: #86998a', 'color: #8ea693', 'color: #96b39c', 'color: #9dbfa4', 'color: #a5ccad', 'color: #a7cba3', 'color: #a9ca99', 'color: #acc98f', 'color: #aec985', 'color: #b0c87b', 'color: #b2c771', 'color: #b4c667', 'color: #b7c55d', 'color: #b9c453', 'color: #bbc349', 'color: #bdc23f', 'color: #bfc235', 'color: #c1c12b', 'color: #c4c021', 'color: #c6bf17', 'color: #c8be0d', 'color: #beb811', 'color: #b5b214', 'color: #abad18', 'color: #a2a71c', 'color: #98a11f', 'color: #8f9b23', 'color: #859527', 'color: #7c902b', 'color: #728a2e', 'color: #688432', 'color: #5f7e36', 'color: #557839', 'color: #4c723d', 'color: #426d41', 'color: #396744', 'color: #2f6148', 'color: #366a4a', 'color: #3d724c', 'color: #447b4d', 'color: #4b844f', 'color: #538c51', 'color: #5a9553', 'color: #619e55', 'color: #68a657', 'color: #6faf58', 'color: #76b75a', 'color: #7dc05c', 'color: #84c95e', 'color: #8cd160', 'color: #93da62', 'color: #9ae363', 'color: #a1eb65', 'color: #a8f467', 'color: #a4e661', 'color: #a0d85b', 'color: #9cca56', 'color: #98bd50', 'color: #94af4a', 'color: #90a144', 'color: #8c933e', 'color: #888539', 'color: #837733', 'color: #7f692d', 'color: #7b5b27', 'color: #774e21', 'color: #73401b', 'color: #6f3216', 'color: #6b2410', 'color: #67160a', 'color: #701f10', 'color: #782816', 'color: #81311d', 'color: #8a3a23', 'color: #924429', 'color: #9b4d2f', 'color: #a45635', 'color: #ac5f3b', 'color: #b56842', 'color: #bd7148', 'color: #c67a4e', 'color: #cf8354', 'color: #d78d5a', 'color: #e09660', 'color: #e99f67', 'color: #f1a86d', 'color: #fab173', 'color: #f7a96f', 'color: #f3a16c', 'color: #f09968', 'color: #ec9265', 'color: #e98a61', 'color: #e5825e', 'color: #e27a5a', 'color: #de7257', 'color: #db6a53', 'color: #d7624f', 'color: #d45a4c', 'color: #d05348', 'color: #cd4b45', 'color: #c94341', 'color: #c63b3e', 'color: #c2333a', 'color: #c4373a', 'color: #c73b3a', 'color: #c93f3a', 'color: #cc433b', 'color: #ce473b', 'color: #d14b3b', 'color: #d34f3b', 'color: #d6533b', 'color: #d8563b', 'color: #da5a3b', 'color: #dd5e3b', 'color: #df623c', 'color: #e2663c', 'color: #e46a3c', 'color: #9a4331', 'color: #8f3c2f', 'color: #83362e', 'color: #782f2c', 'color: #6d282b', 'color: #612229', 'color: #561b27', 'color: #4b1426', 'color: #400d24', 'color: #340723', 'color: #290021', 'color: #310d2a', 'color: #391a33', 'color: #40263b', 'color: #483344', 'color: #50404d', 'color: #584d56', 'color: #5f595e', 'color: #676667', 'color: #6f7370', 'color: #778079', 'color: #7e8c81', 'color: #86998a', 'color: #8ea693', 'color: #96b39c', 'color: #9dbfa4', 'color: #a5ccad', 'color: #a7cba3', 'color: #a9ca99', 'color: #acc98f', 'color: #aec985', 'color: #b0c87b', 'color: #b2c771', 'color: #b4c667', 'color: #b7c55d', 'color: #b9c453', 'color: #bbc349', 'color: #bdc23f', 'color: #bfc235', 'color: #c1c12b', 'color: #c4c021', 'color: #c6bf17', 'color: #c8be0d', 'color: #beb811', 'color: #b5b214', 'color: #abad18', 'color: #a2a71c', 'color: #98a11f', 'color: #8f9b23', 'color: #859527', 'color: #7c902b', 'color: #728a2e', 'color: #688432', 'color: #5f7e36', 'color: #557839', 'color: #4c723d', 'color: #426d41', 'color: #396744', 'color: #2f6148', 'color: #366a4a', 'color: #3d724c', 'color: #447b4d', 'color: #4b844f', 'color: #538c51', 'color: #5a9553', 'color: #619e55', 'color: #68a657', 'color: #6faf58', 'color: #76b75a', 'color: #7dc05c', 'color: #84c95e', 'color: #8cd160', 'color: #93da62', 'color: #9ae363', 'color: #a1eb65', 'color: #a8f467', 'color: #a4e661', 'color: #a0d85b', 'color: #9cca56', 'color: #98bd50', 'color: #94af4a', 'color: #90a144', 'color: #8c933e', 'color: #888539', 'color: #837733', 'color: #7f692d', 'color: #7b5b27', 'color: #774e21', 'color: #73401b', 'color: #6f3216', 'color: #6b2410', 'color: #67160a', 'color: #701f10', 'color: #782816', 'color: #81311d', 'color: #8a3a23', 'color: #924429', 'color: #9b4d2f', 'color: #a45635', 'color: #ac5f3b', 'color: #b56842', 'color: #bd7148', 'color: #c67a4e', 'color: #cf8354', 'color: #d78d5a', 'color: #e09660', 'color: #e99f67', 'color: #f1a86d', 'color: #fab173', 'color: #f7a96f', 'color: #f3a16c', 'color: #f09968', 'color: #ec9265', 'color: #e98a61', 'color: #e5825e', 'color: #e27a5a', 'color: #de7257', 'color: #db6a53', 'color: #d7624f', 'color: #d45a4c', 'color: #d05348', 'color: #cd4b45', 'color: #c94341', 'color: #c63b3e', 'color: #c2333a', 'color: #c4373a', 'color: #c73b3a', 'color: #c93f3a', 'color: #cc433b', 'color: #ce473b', 'color: #d14b3b', 'color: #d34f3b', 'color: #e9723c', 'color: #de6b3a', 'color: #d26539', 'color: #c75e37', 'color: #bc5736', 'color: #b15034', 'color: #a54a32', 'color: #9a4331', 'color: #8f3c2f', 'color: #83362e', 'color: #782f2c', 'color: #6d282b', 'color: #612229', 'color: #561b27', 'color: #4b1426', 'color: #400d24', 'color: #340723', 'color: #290021', 'color: #310d2a', 'color: #391a33', 'color: #40263b', 'color: #483344', 'color: #50404d', 'color: #584d56', 'color: #5f595e', 'color: #676667', 'color: #6f7370', 'color: #778079', 'color: #7e8c81', 'color: #86998a', 'color: #8ea693', 'color: #96b39c', 'color: #9dbfa4', 'color: #a5ccad', 'color: #a7cba3', 'color: #a9ca99', 'color: #acc98f', 'color: #aec985', 'color: #b0c87b', 'color: #b2c771', 'color: #b4c667', 'color: #b7c55d', 'color: #b9c453', 'color: #bbc349', 'color: #bdc23f', 'color: #bfc235', 'color: #c1c12b', 'color: #c4c021', 'color: #c6bf17', 'color: #c8be0d', 'color: #beb811', 'color: #b5b214', 'color: #abad18', 'color: #a2a71c', 'color: #98a11f', 'color: #8f9b23', 'color: #859527', 'color: #7c902b', 'color: #728a2e', 'color: #688432', 'color: #5f7e36', 'color: #557839', 'color: #4c723d', 'color: #426d41', 'color: #396744', 'color: #2f6148', 'color: #366a4a', 'color: #3d724c', 'color: #447b4d', 'color: #4b844f', 'color: #538c51', 'color: #5a9553', 'color: #619e55', 'color: #68a657', 'color: #6faf58', 'color: #76b75a', 'color: #7dc05c', 'color: #84c95e', 'color: #8cd160', 'color: #93da62', 'color: #9ae363', 'color: #a1eb65', 'color: #a8f467', 'color: #a4e661', 'color: #a0d85b', 'color: #9cca56', 'color: #98bd50', 'color: #94af4a', 'color: #90a144', 'color: #8c933e', 'color: #888539', 'color: #837733', 'color: #7f692d', 'color: #7b5b27', 'color: #774e21', 'color: #73401b', 'color: #6f3216', 'color: #6b2410', 'color: #67160a', 'color: #701f10', 'color: #782816', 'color: #81311d', 'color: #8a3a23', 'color: #924429', 'color: #9b4d2f', 'color: #a45635', 'color: #ac5f3b', 'color: #b56842', 'color: #bd7148', 'color: #c67a4e', 'color: #cf8354', 'color: #d78d5a', 'color: #e09660', 'color: #e99f67', 'color: #f1a86d', 'color: #fab173', 'color: #f7a96f', 'color: #f3a16c', 'color: #f09968', 'color: #ec9265', 'color: #e98a61', 'color: #e5825e', 'color: #e27a5a', 'color: #de7257', 'color: #db6a53', 'color: #d7624f', 'color: #d45a4c', 'color: #d05348', 'color: #cd4b45', 'color: #c94341', 'color: #c63b3e', 'color: #c2333a', 'color: #d8563b', 'color: #da5a3b', 'color: #dd5e3b', 'color: #df623c', 'color: #e2663c', 'color: #e46a3c', 'color: #e76e3c', 'color: #e9723c', 'color: #de6b3a', 'color: #d26539', 'color: #c75e37', 'color: #bc5736', 'color: #b15034', 'color: #a54a32', 'color: #9a4331', 'color: #8f3c2f', 'color: #83362e', 'color: #782f2c', 'color: #6d282b', 'color: #612229', 'color: #561b27', 'color: #4b1426', 'color: #400d24', 'color: #340723', 'color: #290021', 'color: #310d2a', 'color: #391a33', 'color: #40263b', 'color: #483344', 'color: #50404d', 'color: #584d56', 'color: #5f595e', 'color: #676667', 'color: #6f7370', 'color: #778079', 'color: #7e8c81', 'color: #86998a', 'color: #8ea693', 'color: #96b39c', 'color: #9dbfa4', 'color: #a5ccad', 'color: #a7cba3', 'color: #a9ca99', 'color: #acc98f', 'color: #aec985', 'color: #b0c87b', 'color: #b2c771', 'color: #b4c667', 'color: #b7c55d', 'color: #b9c453', 'color: #bbc349', 'color: #bdc23f', 'color: #bfc235', 'color: #c1c12b', 'color: #c4c021', 'color: #c6bf17', 'color: #c8be0d', 'color: #beb811', 'color: #b5b214', 'color: #abad18', 'color: #a2a71c', 'color: #98a11f', 'color: #8f9b23', 'color: #859527', 'color: #7c902b', 'color: #728a2e', 'color: #688432', 'color: #5f7e36', 'color: #557839', 'color: #4c723d', 'color: #426d41', 'color: #396744', 'color: #2f6148', 'color: #366a4a', 'color: #3d724c', 'color: #447b4d', 'color: #4b844f', 'color: #538c51', 'color: #5a9553', 'color: #619e55', 'color: #68a657', 'color: #6faf58', 'color: #76b75a', 'color: #7dc05c', 'color: #84c95e', 'color: #8cd160', 'color: #93da62', 'color: #9ae363', 'color: #a1eb65', 'color: #a8f467', 'color: #a4e661', 'color: #a0d85b', 'color: #9cca56', 'color: #98bd50', 'color: #94af4a', 'color: #90a144', 'color: #8c933e', 'color: #888539', 'color: #837733', 'color: #7f692d', 'color: #7b5b27', 'color: #774e21', 'color: #73401b', 'color: #6f3216', 'color: #6b2410', 'color: #67160a', 'color: #701f10', 'color: #782816', 'color: #81311d', 'color: #8a3a23', 'color: #924429', 'color: #9b4d2f', 'color: #a45635', 'color: #ac5f3b', 'color: #b56842', 'color: #bd7148', 'color: #c67a4e', 'color: #cf8354', 'color: #d78d5a', 'color: #e09660', 'color: #e99f67', 'color: #f1a86d', 'color: #fab173', 'color: #f7a96f', 'color: #f3a16c', 'color: #f09968', 'color: #ec9265', 'color: #e98a61', 'color: #e5825e', 'color: #e27a5a', 'color: #de7257', 'color: #db6a53'
);

globalThis.mindone = mindone;