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

import type { LayerCodeObj, LegendCodeObj } from '../types';
import { LAYER_PURPOSE_CATEGORY, OL_GEOMETRY_OBJ } from '../types/enums';
import type { LayerPurpose } from '../types/enums';

// Re-export for backwards compatibility
export { LAYER_PURPOSE_CATEGORY, OL_GEOMETRY_OBJ };

// ---- 전역 변수 선언 (런타임 환경에서 제공됨) ----
declare const mgcCd: string;
declare const ctxPath: string;

/* [LAYER] 레이어 식별 관련 */
/** 화면에서 표현될 레이어 제목. 범례, 레이어 선택 화면 등에서 표현되는 이름 */
export const LAYER_NAME: string = `layerTitle`;

/** (특히 Geoserver에서) 각 레이어들의 식별명 */
export const TYPE_NAME: string = `typeName`; //geoserver 용 레이어 식별자
export const LAYER_GEOMETRY_TYPE: string = `geomType`; //BASE, POINT, LINE, POLYGON 등 레이어 타입

/* [STYLE] 레이어 스타일(Style) 관련 */
export const ICON_NAME: string = `iconName`;
export const COLOR_FILL: string = `colorFill`;
export const LINE_STYLE: string = `lineStyle`;
export const LINE_WIDTH: string = `lineWidth`;
export const COLOR_LINE: string = `colorLine`;
export const LABEL_COLUMN: string = `label`;
export const FONT_OUTLINE: string = `colorFontLine`;
export const FONT_FILL: string = `colorFontFill`;
export const FONT_WIDTH: string = `fontWidth`;
export const FONT_STYLE: string = `font`;

/* 레이어 객체 관련 */
export const BOOL_SELECTABLE: string = `boolSelectable`;
export const BOOL_SHOW_INITIAL: string = `boolShowInit`; //'초기에 보여야 하는지' 여부. 상수 constant (DB에 기 작성된)
export const BOOL_VISIBLE: string = `boolVisible`; //'보여야 하는지' 여부. 변수 variable (런타임에 바뀌는)
export const BOOL_HEAVY: string = `boolIsheavy`; //피쳐수 많아 로딩 시간이 긴 레이어 구분자. Y 일 경우 미리 로딩하도록 안배함.
export const BOOL_DECLUTTER: string = `boolDeclutter`; //feature 가 clustered 되어있을 때 일부만 보여줄지 여부
export const Z_INDEX: string = `zIndex`;
export const MIN_ZOOM: string = `minZoom`;

/* [TREE] 레이어 트리(Tree)용 JSON 관련 */
/** DB 상 모든 레이어들의 Primary Key */
export const LAYER_ID: string = `id`;
/** 레이어 계층이 있을 때, 상위 레이어의 Primary Key */
export const PARENT_ID: string = `pid`;
/** LayerTree 클래스에서, 1차원 JSON 을 계층형 JSON 으로 변환할 때, 하위 계층들을 묶을 키 이름 */
export const CHILD_MARK: string = `childList`;
export const LAYER_ORDER: string = 'ordr'; //레이어 표출 순서
export const BOOL_IS_GROUP: string = `boolIsgroup`; // 해당 레이어가 '형식상' 레이어이며 그룹핑 용도로만 사용되는지 여부

/** 프로젝트 구조 상 지도 ICON 경로 통일 */
export const ICON_PATH: string = `/js-lib/openlayers/ol7/MO_GIS/images/icons/`;

/* MOPublisher, MOSubscriber 관련 키*/
export const LAYER_PURPOSE_CATEGORY_KEY: string = 'layerPurposeCategory';
export const LEGEND_HTML_STRING: string = 'legendHtmlString';

/* [SOURCE] 레이어 소스(Source) 관련 */
export const ORIGIN: string = `origin`;
export const SOURCE_PATHNAME: string = `sourcePathname`;
/**
 * 소스를 Openlayers 상 클래스로 구분하기 위함. e.g. vector, wmts
 */
export const SOURCE_CLASS: string = `sourceClass`;
export const CQL_FILTER: string = `cqlfilter`;

/** GIS데이터 연계시, 원본 소스에서 지정한 특수 레이어 아이디일 것. 이것을 arcLayerId 로 지정 */
export const ARC_LAYER_ID: string = `arcLayerId`;
export const APIKEY: string = `apiKey`;
export const SRID: string = `srid`;

/** 소스의 출처 대분류 구분하기 위함. e.g. geoserver, vworld, intra */
export const SOURCE_CATEGORY: string = `category`;

/** 주소검색 결과를 표현하기 위한 임시 소스와 레이어 */
export const ADDRESS_SOURCE_LAYER_KEY: string = 'address';

/** 강조효과 표현하기 위한 임시 소스와 레이어 */
export const HIGHLIGHT_SOURCE_LAYER_KEY: string = 'highlight';

/** 데이터 없는 빈 (vector) 소스와 레이어 */
export const VIRTUAL_SOURCE_LAYER_KEY: string = 'virtual';



/** 배경지도(브이월드) 공식 좌표계.
 *  각 타일 이미지의 왜곡을 방지하기 위해 정확한 좌표계를 알아야 함 (API 문서 상 기재)
*/
export const SRID_TILE_VWORLD: string = `EPSG:3857`;
/** 배경지도(바로e맵) 공식 좌표계.
 *  각 타일 이미지의 왜곡을 방지하기 위해 정확한 좌표계를 알아야 함 (API 문서 상 기재)
*/
export const SRID_TILE_EMAP: string = `EPSG:5179`;
/** 특정 지사 좌표의 좌표계.
 *  e.g. <CM_MGC> 테이블의 좌표정보 */
export const SRID_MGC_CRS: string = `EPSG:5181`;
/** 프로젝트 내 GIS 정보의 기준 좌표계.
 *  <WTL_%> */
export const SRID_DB_GIS: string = `EPSG:5186`;


/**
 * select interaction 편의를 위해, 줌이 이 수준 이상 확대되면 select 되지 않도록 조치
 */
export const POLYGON_SELECT_MARGINAL_RESOLUTION: number = 4;

export const CONSOLE_DECO: { HEADER: string; BODY: string } = {
	HEADER: `border:2px solid blue; border-radius:5px;
                padding:5px; margin:4px 6px; line-height:12px;
                font-family: "Courier New", Courier, monospace;font-weight: bold;
                text-align: left;font-size: 27px;color: rgb(0, 255, 212);background-color: rgb(93, 61, 50);
                text-shadow: rgb(0, 0, 0) 2px 2px 2px;`,
	BODY: `text-transform: uppercase;  padding: 5px 20px;
                font-family: Tahoma, Geneva, sans-serif; font-weight: bold; text-align: left;
                font-size: 27px; color: rgb(246, 115, 14); background-color: rgb(35, 47, 44);
                text-shadow: rgb(0, 0, 0) 2px 2px 2px;`,
};


/**
 * 1차원으로 구성된 json 자료구조를 계층형
 * @param array javascript Array 객체. JSON 형식이어야 하고, 최상위->중위->하위 순으로 정렬되어 있어야 함
 * @param target_id_key 개별 JSON 요소들의 PK 키 명칭
 * @param parent_id_key 개별 JSON 요소들의 상위 ID 를 참조할 키 명칭
 * @param child_mark NESTED 구조체 만들기 위한
 * @param most_upper_id 최상위 아이디
 * @returns The nested array of objects.
 */
export function jsonNestor(
	array: Record<string, any>[],
	target_id_key: string,
	parent_id_key: string,
	child_mark: string,
	most_upper_id?: string | number | null
): Record<string, any>[] {
	if (array && array.length > 0) {
		function FINDER(srcArr: Record<string, any>[], targetElem: Record<string, any>): Record<string, any> | undefined {
			let rere: Record<string, any> | undefined;
			for (let el of srcArr) {
				if (el[target_id_key] == targetElem[parent_id_key]) {
					rere = el;
				} else if (el[child_mark])
					rere = FINDER(el[child_mark], targetElem);
				if (rere) break;
			}
			return rere;
		}
		return array.reduce<Record<string, any>[]>((pre, cur) => {
			let targ = cur[parent_id_key] ? FINDER(pre, cur) : undefined;
			if (targ)
				targ[child_mark]
					? targ[child_mark].push(cur)
					: (targ[child_mark] = [cur]);
			return pre;
		},
			structuredClone(array.filter((el: Record<string, any>) => {
				if (most_upper_id) { return el[parent_id_key] == most_upper_id; }
				else { return !el[parent_id_key]; }
			})
			)
		);
	} else {
		console.log(array);
		throw new Error(`jsonNestor 에 입력된 배열이 적합하지 않음`);
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
 * @param str
 * @returns
 */
export function isNumeric(str: string | number): boolean {
	if (typeof str == 'number') return true;
	else if (typeof str != "string") throw new Error(`숫자 또는 문자만 체크 가능함 : ${str}`);
	return !isNaN(str as any) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
		!isNaN(parseFloat(str)); // ...and ensure strings of whitespace fail
}

/**
 * 여러 Map 객체들을 하나로 합쳐 하나의 Map 을 반환
 * @param mapArray
 */
export function mergeMaps<K, V>(mapArray: Map<K, V>[]): Map<K, V> {
	if (!Array.isArray(mapArray)) throw new TypeError("파라미터는 Map 객체들로 구성된 Array 여야 함");
	let mergedMap = new Map<K, V>();
	mapArray.forEach(map => {
		if (map instanceof Map) map.forEach((value, key) => { mergedMap.set(key, value); });
	});
	return mergedMap;
}


/**
 * 지사코드와 레이어그룹 목적 키 값으로 LayerCodeObjArr 를 조회
 * @param layerPurposeKey
 * @param opt_mgcCd - 지사코드  e.g. 'JS000514'
 */
//export async function getLayerCode(layerPurposeKey='base'){
export async function getLayerCode(layerPurposeKey: LayerPurpose | 'extra' | 'intra' = 'base', opt_mgcCd?: string): Promise<LayerCodeObj[]> {
	if (!(mgcCd || opt_mgcCd)) throw new Error(`지사코드 설정되지 않음 : ${mgcCd}`);

	const UR = `${ctxPath}/map/layerCode/${mgcCd}`;
	let tempUrl = new URL(UR, location.origin);
	tempUrl.search = new URLSearchParams({ layerPurpose: layerPurposeKey }).toString();

	const resu = await fetch(tempUrl.toString(), { headers: { "content-type": "application/json", "x-requested-with": "XMLHttpRequest" } });
	const jsn = await resu.json();

	return jsn['data'] ? jsn['data'] : [];
}

/**
 * 브라우저가 ES6 주요 함수들을 지원하는지 체크함
 */
export function checkBrowserSupport(): string {
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
			if (!supportsStructuredClone) message += '\n - structuredClone';
			if (!supportsReplaceChildren) message += '\n - Element::replaceChildren';
			if (!supportsOptionalChaining) message += '\n - Object::"optional chaining"';
			message += '\n최신 브라우저(2020년 이후)로 업데이트 후 사용을 권장드립니다. ';
		}
	} catch (error) {
		console.error('An error occurred:', (error as Error).message);
	}
	console.log(message);
	return message;
}

// @ts-ignore -- console art preserved from original
const mindone = () => console.log('%c_%c_%c/%c\\%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c/%c\\%c\\%c\\%c\\%c_%c_%c/%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c/%c\\%c\\%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c %c %c %c %c %c %c %c \n%c %c_%c\\%c/%c\\%c\\%c\\%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c/%c\\%c\\%c\\%c\\%c\\%c\\%c_%c\\%c/%c/%c/%c/%c/%c\\%c\\%c\\%c/%c/%c/%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c/%c\\%c\\%c\\%c/%c/%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c %c %c %c %c %c %c \n%c %c %c_%c\\%c/%c\\%c\\%c\\%c/%c/%c\\%c\\%c\\%c_%c_%c_%c_%c/%c\\%c\\%c\\%c/%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c/%c\\%c\\%c\\%c/%c_%c_%c\\%c/%c/%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c %c %c %c %c %c \n%c %c %c %c_%c\\%c/%c\\%c\\%c\\%c\\%c/%c/%c/%c\\%c\\%c\\%c/%c\\%c\\%c\\%c/%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c/%c\\%c\\%c/%c\\%c\\%c\\%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c\\%c/%c/%c\\%c\\%c\\%c_%c_%c/%c\\%c\\%c/%c\\%c\\%c\\%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c/%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c_%c_%c %c %c %c %c \n%c %c %c %c %c_%c\\%c/%c\\%c\\%c\\%c_%c_%c\\%c/%c/%c/%c\\%c\\%c\\%c/%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c/%c/%c/%c/%c\\%c\\%c\\%c_%c_%c_%c_%c/%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c\\%c/%c\\%c\\%c\\%c/%c/%c/%c/%c\\%c\\%c\\%c_%c_%c_%c_%c/%c\\%c\\%c\\%c/%c/%c/%c/%c/%c\\%c\\%c\\%c_%c %c %c %c \n%c %c %c %c %c %c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c\\%c/%c/%c/%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c\\%c/%c/%c\\%c\\%c\\%c_%c_%c/%c\\%c\\%c\\%c/%c/%c/%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c\\%c/%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c/%c\\%c\\%c\\%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c\\%c/%c/%c\\%c\\%c\\%c_%c_%c/%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c_%c_%c %c %c \n%c %c %c %c %c %c %c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c\\%c/%c/%c/%c\\%c\\%c\\%c_%c_%c/%c\\%c\\%c\\%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c\\%c/%c/%c\\%c\\%c/%c/%c/%c/%c/%c/%c/%c_%c_%c_%c %c \n%c %c %c %c %c %c %c %c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c/%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c\\%c/%c/%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c/%c\\%c\\%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c\\%c/%c/%c/%c\\%c\\%c\\%c\\%c\\%c/%c_%c_%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c_%c\\%c/%c\\%c\\%c\\%c_%c_%c\\%c/%c/%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c\\%c_%c \n%c %c %c %c %c %c %c %c %c_%c\\%c/%c/%c/%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c\\%c/%c/%c/%c_%c_%c\\%c/%c/%c/%c/%c/%c/%c/%c/%c/%c/%c/%c_%c_%c\\%c/%c/%c/%c_%c_%c_%c_%c\\%c/%c/%c/%c_%c_%c_%c\\%c/%c/%c/%c/%c/%c/%c/%c\\%c/%c/%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c_%c\\%c/%c/%c/%c/%c/%c_%c_%c_%c_%c_%c_%c_%c\\%c/%c/%c/%c_%c_%c_%c_%c\\%c/%c/%c/%c_%c_%c_%c_%c\\%c/%c/%c/%c/%c/%c/%c/%c/%c/%c/%c_%c_'
	, 'color: #c8be0d', 'color: #beb811', 'color: #b5b214', 'color: #abad18', 'color: #a2a71c', 'color: #98a11f', 'color: #8f9b23', 'color: #859527', 'color: #7c902b', 'color: #728a2e', 'color: #688432', 'color: #5f7e36', 'color: #557839', 'color: #4c723d', 'color: #426d41', 'color: #396744', 'color: #2f6148', 'color: #366a4a', 'color: #3d724c', 'color: #447b4d', 'color: #4b844f', 'color: #538c51', 'color: #5a9553', 'color: #619e55', 'color: #68a657', 'color: #6faf58', 'color: #76b75a', 'color: #7dc05c', 'color: #84c95e', 'color: #8cd160', 'color: #93da62', 'color: #9ae363', 'color: #a1eb65', 'color: #a8f467', 'color: #a4e661', 'color: #a0d85b', 'color: #9cca56', 'color: #98bd50', 'color: #94af4a', 'color: #90a144', 'color: #8c933e', 'color: #888539', 'color: #837733', 'color: #7f692d', 'color: #7b5b27', 'color: #774e21', 'color: #73401b', 'color: #6f3216', 'color: #6b2410', 'color: #67160a', 'color: #701f10', 'color: #782816', 'color: #81311d', 'color: #8a3a23', 'color: #924429', 'color: #9b4d2f', 'color: #a45635', 'color: #ac5f3b', 'color: #b56842', 'color: #bd7148', 'color: #c67a4e', 'color: #cf8354', 'color: #d78d5a', 'color: #e09660', 'color: #e99f67', 'color: #f1a86d', 'color: #fab173', 'color: #f7a96f', 'color: #f3a16c', 'color: #f09968', 'color: #ec9265', 'color: #e98a61', 'color: #e5825e', 'color: #e27a5a', 'color: #de7257', 'color: #db6a53', 'color: #d7624f', 'color: #d45a4c', 'color: #d05348', 'color: #cd4b45', 'color: #c94341', 'color: #c63b3e', 'color: #c2333a', 'color: #c4373a', 'color: #c73b3a', 'color: #c93f3a', 'color: #cc433b', 'color: #ce473b', 'color: #d14b3b', 'color: #d34f3b', 'color: #d6533b', 'color: #d8563b', 'color: #da5a3b', 'color: #dd5e3b', 'color: #df623c', 'color: #e2663c', 'color: #e46a3c', 'color: #e76e3c', 'color: #e9723c', 'color: #de6b3a', 'color: #d26539', 'color: #c75e37', 'color: #bc5736', 'color: #b15034', 'color: #a54a32', 'color: #9a4331', 'color: #8f3c2f', 'color: #83362e', 'color: #782f2c', 'color: #6d282b', 'color: #612229', 'color: #561b27', 'color: #4b1426', 'color: #400d24', 'color: #340723', 'color: #290021', 'color: #310d2a', 'color: #391a33', 'color: #40263b', 'color: #483344', 'color: #50404d', 'color: #584d56', 'color: #5f595e', 'color: #676667', 'color: #6f7370', 'color: #778079', 'color: #7e8c81', 'color: #86998a', 'color: #8ea693', 'color: #96b39c', 'color: #9dbfa4', 'color: #a5ccad', 'color: #b9c453', 'color: #bbc349', 'color: #bdc23f', 'color: #bfc235', 'color: #c1c12b', 'color: #c4c021', 'color: #c6bf17', 'color: #c8be0d', 'color: #beb811', 'color: #b5b214', 'color: #abad18', 'color: #a2a71c', 'color: #98a11f', 'color: #8f9b23', 'color: #859527', 'color: #7c902b', 'color: #728a2e', 'color: #688432', 'color: #5f7e36', 'color: #557839', 'color: #4c723d', 'color: #426d41', 'color: #396744', 'color: #2f6148', 'color: #366a4a', 'color: #3d724c', 'color: #447b4d', 'color: #4b844f', 'color: #538c51', 'color: #5a9553', 'color: #619e55', 'color: #68a657', 'color: #6faf58', 'color: #76b75a', 'color: #7dc05c', 'color: #84c95e', 'color: #8cd160', 'color: #93da62', 'color: #9ae363', 'color: #a1eb65', 'color: #a8f467', 'color: #a4e661', 'color: #a0d85b', 'color: #9cca56', 'color: #98bd50', 'color: #94af4a', 'color: #90a144', 'color: #8c933e', 'color: #888539', 'color: #837733', 'color: #7f692d', 'color: #7b5b27', 'color: #774e21', 'color: #73401b', 'color: #6f3216', 'color: #6b2410', 'color: #67160a', 'color: #701f10', 'color: #782816', 'color: #81311d', 'color: #8a3a23', 'color: #924429', 'color: #9b4d2f', 'color: #a45635', 'color: #ac5f3b', 'color: #b56842', 'color: #bd7148', 'color: #c67a4e', 'color: #cf8354', 'color: #d78d5a', 'color: #e09660', 'color: #e99f67', 'color: #f1a86d', 'color: #fab173', 'color: #f7a96f', 'color: #f3a16c', 'color: #f09968', 'color: #ec9265', 'color: #e98a61', 'color: #e5825e', 'color: #e27a5a', 'color: #de7257', 'color: #db6a53', 'color: #d7624f', 'color: #d45a4c', 'color: #d05348', 'color: #cd4b45', 'color: #c94341', 'color: #c63b3e', 'color: #c2333a', 'color: #c4373a', 'color: #c73b3a', 'color: #c93f3a', 'color: #cc433b', 'color: #ce473b', 'color: #d14b3b', 'color: #d34f3b', 'color: #d6533b', 'color: #d8563b', 'color: #da5a3b', 'color: #dd5e3b', 'color: #df623c', 'color: #e2663c', 'color: #e46a3c', 'color: #e76e3c', 'color: #e9723c', 'color: #de6b3a', 'color: #d26539', 'color: #c75e37', 'color: #bc5736', 'color: #b15034', 'color: #a54a32', 'color: #9a4331', 'color: #8f3c2f', 'color: #83362e', 'color: #782f2c', 'color: #6d282b', 'color: #612229', 'color: #561b27', 'color: #4b1426', 'color: #400d24', 'color: #340723', 'color: #290021', 'color: #310d2a', 'color: #391a33', 'color: #40263b', 'color: #483344', 'color: #50404d', 'color: #584d56', 'color: #5f595e', 'color: #676667', 'color: #6f7370', 'color: #a9ca99', 'color: #acc98f', 'color: #aec985', 'color: #b0c87b', 'color: #b2c771', 'color: #b4c667', 'color: #b7c55d', 'color: #b9c453', 'color: #bbc349', 'color: #bdc23f', 'color: #bfc235', 'color: #c1c12b', 'color: #c4c021', 'color: #c6bf17', 'color: #c8be0d', 'color: #beb811', 'color: #b5b214', 'color: #abad18', 'color: #a2a71c', 'color: #98a11f', 'color: #8f9b23', 'color: #859527', 'color: #7c902b', 'color: #728a2e', 'color: #688432', 'color: #5f7e36', 'color: #557839', 'color: #4c723d', 'color: #426d41', 'color: #396744', 'color: #2f6148', 'color: #366a4a', 'color: #3d724c', 'color: #447b4d', 'color: #4b844f', 'color: #538c51', 'color: #5a9553', 'color: #619e55', 'color: #68a657', 'color: #6faf58', 'color: #76b75a', 'color: #7dc05c', 'color: #84c95e', 'color: #8cd160', 'color: #93da62', 'color: #9ae363', 'color: #a1eb65', 'color: #a8f467', 'color: #a4e661', 'color: #a0d85b', 'color: #9cca56', 'color: #98bd50', 'color: #94af4a', 'color: #90a144', 'color: #8c933e', 'color: #888539', 'color: #837733', 'color: #7f692d', 'color: #7b5b27', 'color: #774e21', 'color: #73401b', 'color: #6f3216', 'color: #6b2410', 'color: #67160a', 'color: #701f10', 'color: #782816', 'color: #81311d', 'color: #8a3a23', 'color: #924429', 'color: #9b4d2f', 'color: #a45635', 'color: #ac5f3b', 'color: #b56842', 'color: #bd7148', 'color: #c67a4e', 'color: #cf8354', 'color: #d78d5a', 'color: #e09660', 'color: #e99f67', 'color: #f1a86d', 'color: #fab173', 'color: #f7a96f', 'color: #f3a16c', 'color: #f09968', 'color: #ec9265', 'color: #e98a61', 'color: #e5825e', 'color: #e27a5a', 'color: #de7257', 'color: #db6a53', 'color: #d7624f', 'color: #d45a4c', 'color: #d05348', 'color: #cd4b45', 'color: #c94341', 'color: #c63b3e', 'color: #c2333a', 'color: #c4373a', 'color: #c73b3a', 'color: #c93f3a', 'color: #cc433b', 'color: #ce473b', 'color: #d14b3b', 'color: #d34f3b', 'color: #d6533b', 'color: #d8563b', 'color: #da5a3b', 'color: #dd5e3b', 'color: #df623c', 'color: #e2663c', 'color: #e46a3c', 'color: #e76e3c', 'color: #e9723c', 'color: #de6b3a', 'color: #d26539', 'color: #c75e37', 'color: #bc5736', 'color: #b15034', 'color: #a54a32', 'color: #9a4331', 'color: #8f3c2f', 'color: #83362e', 'color: #782f2c', 'color: #6d282b', 'color: #612229', 'color: #561b27', 'color: #4b1426', 'color: #400d24', 'color: #340723', 'color: #290021', 'color: #310d2a', 'color: #391a33', 'color: #7e8c81', 'color: #86998a', 'color: #8ea693', 'color: #96b39c', 'color: #9dbfa4', 'color: #a5ccad', 'color: #a7cba3', 'color: #a9ca99', 'color: #acc98f', 'color: #aec985', 'color: #b0c87b', 'color: #b2c771', 'color: #b4c667', 'color: #b7c55d', 'color: #b9c453', 'color: #bbc349', 'color: #bdc23f', 'color: #bfc235', 'color: #c1c12b', 'color: #c4c021', 'color: #c6bf17', 'color: #c8be0d', 'color: #beb811', 'color: #b5b214', 'color: #abad18', 'color: #a2a71c', 'color: #98a11f', 'color: #8f9b23', 'color: #859527', 'color: #7c902b', 'color: #728a2e', 'color: #688432', 'color: #5f7e36', 'color: #557839', 'color: #4c723d', 'color: #426d41', 'color: #396744', 'color: #2f6148', 'color: #366a4a', 'color: #3d724c', 'color: #447b4d', 'color: #4b844f', 'color: #538c51', 'color: #5a9553', 'color: #619e55', 'color: #68a657', 'color: #6faf58', 'color: #76b75a', 'color: #7dc05c', 'color: #84c95e', 'color: #8cd160', 'color: #93da62', 'color: #9ae363', 'color: #a1eb65', 'color: #a8f467', 'color: #a4e661', 'color: #a0d85b', 'color: #9cca56', 'color: #98bd50', 'color: #94af4a', 'color: #90a144', 'color: #8c933e', 'color: #888539', 'color: #837733', 'color: #7f692d', 'color: #7b5b27', 'color: #774e21', 'color: #73401b', 'color: #6f3216', 'color: #6b2410', 'color: #67160a', 'color: #701f10', 'color: #782816', 'color: #81311d', 'color: #8a3a23', 'color: #924429', 'color: #9b4d2f', 'color: #a45635', 'color: #ac5f3b', 'color: #b56842', 'color: #bd7148', 'color: #c67a4e', 'color: #cf8354', 'color: #d78d5a', 'color: #e09660', 'color: #e99f67', 'color: #f1a86d', 'color: #fab173', 'color: #f7a96f', 'color: #f3a16c', 'color: #f09968', 'color: #ec9265', 'color: #e98a61', 'color: #e5825e', 'color: #e27a5a', 'color: #de7257', 'color: #db6a53', 'color: #d7624f', 'color: #d45a4c', 'color: #d05348', 'color: #cd4b45', 'color: #c94341', 'color: #c63b3e', 'color: #c2333a', 'color: #c4373a', 'color: #c73b3a', 'color: #c93f3a', 'color: #cc433b', 'color: #ce473b', 'color: #d14b3b', 'color: #d34f3b', 'color: #d6533b', 'color: #d8563b', 'color: #da5a3b', 'color: #dd5e3b', 'color: #df623c', 'color: #e2663c', 'color: #e46a3c', 'color: #e76e3c', 'color: #e9723c', 'color: #de6b3a', 'color: #d26539', 'color: #c75e37', 'color: #bc5736', 'color: #b15034', 'color: #a54a32', 'color: #9a4331', 'color: #8f3c2f', 'color: #83362e', 'color: #782f2c', 'color: #6d282b', 'color: #612229', 'color: #483344', 'color: #50404d', 'color: #584d56', 'color: #5f595e', 'color: #676667', 'color: #6f7370', 'color: #778079', 'color: #7e8c81', 'color: #86998a', 'color: #8ea693', 'color: #96b39c', 'color: #9dbfa4', 'color: #a5ccad', 'color: #a7cba3', 'color: #a9ca99', 'color: #acc98f', 'color: #aec985', 'color: #b0c87b', 'color: #b2c771', 'color: #b4c667', 'color: #b7c55d', 'color: #b9c453', 'color: #bbc349', 'color: #bdc23f', 'color: #bfc235', 'color: #c1c12b', 'color: #c4c021', 'color: #c6bf17', 'color: #c8be0d', 'color: #beb811', 'color: #b5b214', 'color: #abad18', 'color: #a2a71c', 'color: #98a11f', 'color: #8f9b23', 'color: #859527', 'color: #7c902b', 'color: #728a2e', 'color: #688432', 'color: #5f7e36', 'color: #557839', 'color: #4c723d', 'color: #426d41', 'color: #396744', 'color: #2f6148', 'color: #366a4a', 'color: #3d724c', 'color: #447b4d', 'color: #4b844f', 'color: #538c51', 'color: #5a9553', 'color: #619e55', 'color: #68a657', 'color: #6faf58', 'color: #76b75a', 'color: #7dc05c', 'color: #84c95e', 'color: #8cd160', 'color: #93da62', 'color: #9ae363', 'color: #a1eb65', 'color: #a8f467', 'color: #a4e661', 'color: #a0d85b', 'color: #9cca56', 'color: #98bd50', 'color: #94af4a', 'color: #90a144', 'color: #8c933e', 'color: #888539', 'color: #837733', 'color: #7f692d', 'color: #7b5b27', 'color: #774e21', 'color: #73401b', 'color: #6f3216', 'color: #6b2410', 'color: #67160a', 'color: #701f10', 'color: #782816', 'color: #81311d', 'color: #8a3a23', 'color: #924429', 'color: #9b4d2f', 'color: #a45635', 'color: #ac5f3b', 'color: #b56842', 'color: #bd7148', 'color: #c67a4e', 'color: #cf8354', 'color: #d78d5a', 'color: #e09660', 'color: #e99f67', 'color: #f1a86d', 'color: #fab173', 'color: #f7a96f', 'color: #f3a16c', 'color: #f09968', 'color: #ec9265', 'color: #e98a61', 'color: #e5825e', 'color: #e27a5a', 'color: #de7257', 'color: #db6a53', 'color: #d7624f', 'color: #d45a4c', 'color: #d05348', 'color: #cd4b45', 'color: #c94341', 'color: #c63b3e', 'color: #c2333a', 'color: #c4373a', 'color: #c73b3a', 'color: #c93f3a', 'color: #cc433b', 'color: #ce473b', 'color: #d14b3b', 'color: #d34f3b', 'color: #d6533b', 'color: #d8563b', 'color: #da5a3b', 'color: #dd5e3b', 'color: #df623c', 'color: #e2663c', 'color: #e46a3c', 'color: #e76e3c', 'color: #e9723c', 'color: #de6b3a', 'color: #d26539', 'color: #c75e37', 'color: #bc5736', 'color: #b15034', 'color: #4b1426', 'color: #400d24', 'color: #340723', 'color: #290021', 'color: #310d2a', 'color: #391a33', 'color: #40263b', 'color: #483344', 'color: #50404d', 'color: #584d56', 'color: #5f595e', 'color: #676667', 'color: #6f7370', 'color: #778079', 'color: #7e8c81', 'color: #86998a', 'color: #8ea693', 'color: #96b39c', 'color: #9dbfa4', 'color: #a5ccad', 'color: #a7cba3', 'color: #a9ca99', 'color: #acc98f', 'color: #aec985', 'color: #b0c87b', 'color: #b2c771', 'color: #b4c667', 'color: #b7c55d', 'color: #b9c453', 'color: #bbc349', 'color: #bdc23f', 'color: #bfc235', 'color: #c1c12b', 'color: #c4c021', 'color: #c6bf17', 'color: #c8be0d', 'color: #beb811', 'color: #b5b214', 'color: #abad18', 'color: #a2a71c', 'color: #98a11f', 'color: #8f9b23', 'color: #859527', 'color: #7c902b', 'color: #728a2e', 'color: #688432', 'color: #5f7e36', 'color: #557839', 'color: #4c723d', 'color: #426d41', 'color: #396744', 'color: #2f6148', 'color: #366a4a', 'color: #3d724c', 'color: #447b4d', 'color: #4b844f', 'color: #538c51', 'color: #5a9553', 'color: #619e55', 'color: #68a657', 'color: #6faf58', 'color: #76b75a', 'color: #7dc05c', 'color: #84c95e', 'color: #8cd160', 'color: #93da62', 'color: #9ae363', 'color: #a1eb65', 'color: #a8f467', 'color: #a4e661', 'color: #a0d85b', 'color: #9cca56', 'color: #98bd50', 'color: #94af4a', 'color: #90a144', 'color: #8c933e', 'color: #888539', 'color: #837733', 'color: #7f692d', 'color: #7b5b27', 'color: #774e21', 'color: #73401b', 'color: #6f3216', 'color: #6b2410', 'color: #67160a', 'color: #701f10', 'color: #782816', 'color: #81311d', 'color: #8a3a23', 'color: #924429', 'color: #9b4d2f', 'color: #a45635', 'color: #ac5f3b', 'color: #b56842', 'color: #bd7148', 'color: #c67a4e', 'color: #cf8354', 'color: #d78d5a', 'color: #e09660', 'color: #e99f67', 'color: #f1a86d', 'color: #fab173', 'color: #f7a96f', 'color: #f3a16c', 'color: #f09968', 'color: #ec9265', 'color: #e98a61', 'color: #e5825e', 'color: #e27a5a', 'color: #de7257', 'color: #db6a53', 'color: #d7624f', 'color: #d45a4c', 'color: #d05348', 'color: #cd4b45', 'color: #c94341', 'color: #c63b3e', 'color: #c2333a', 'color: #c4373a', 'color: #c73b3a', 'color: #c93f3a', 'color: #cc433b', 'color: #ce473b', 'color: #d14b3b', 'color: #d34f3b', 'color: #d6533b', 'color: #d8563b', 'color: #da5a3b', 'color: #dd5e3b', 'color: #df623c', 'color: #e2663c', 'color: #e46a3c', 'color: #9a4331', 'color: #8f3c2f', 'color: #83362e', 'color: #782f2c', 'color: #6d282b', 'color: #612229', 'color: #561b27', 'color: #4b1426', 'color: #400d24', 'color: #340723', 'color: #290021', 'color: #310d2a', 'color: #391a33', 'color: #40263b', 'color: #483344', 'color: #50404d', 'color: #584d56', 'color: #5f595e', 'color: #676667', 'color: #6f7370', 'color: #778079', 'color: #7e8c81', 'color: #86998a', 'color: #8ea693', 'color: #96b39c', 'color: #9dbfa4', 'color: #a5ccad', 'color: #a7cba3', 'color: #a9ca99', 'color: #acc98f', 'color: #aec985', 'color: #b0c87b', 'color: #b2c771', 'color: #b4c667', 'color: #b7c55d', 'color: #b9c453', 'color: #bbc349', 'color: #bdc23f', 'color: #bfc235', 'color: #c1c12b', 'color: #c4c021', 'color: #c6bf17', 'color: #c8be0d', 'color: #beb811', 'color: #b5b214', 'color: #abad18', 'color: #a2a71c', 'color: #98a11f', 'color: #8f9b23', 'color: #859527', 'color: #7c902b', 'color: #728a2e', 'color: #688432', 'color: #5f7e36', 'color: #557839', 'color: #4c723d', 'color: #426d41', 'color: #396744', 'color: #2f6148', 'color: #366a4a', 'color: #3d724c', 'color: #447b4d', 'color: #4b844f', 'color: #538c51', 'color: #5a9553', 'color: #619e55', 'color: #68a657', 'color: #6faf58', 'color: #76b75a', 'color: #7dc05c', 'color: #84c95e', 'color: #8cd160', 'color: #93da62', 'color: #9ae363', 'color: #a1eb65', 'color: #a8f467', 'color: #a4e661', 'color: #a0d85b', 'color: #9cca56', 'color: #98bd50', 'color: #94af4a', 'color: #90a144', 'color: #8c933e', 'color: #888539', 'color: #837733', 'color: #7f692d', 'color: #7b5b27', 'color: #774e21', 'color: #73401b', 'color: #6f3216', 'color: #6b2410', 'color: #67160a', 'color: #701f10', 'color: #782816', 'color: #81311d', 'color: #8a3a23', 'color: #924429', 'color: #9b4d2f', 'color: #a45635', 'color: #ac5f3b', 'color: #b56842', 'color: #bd7148', 'color: #c67a4e', 'color: #cf8354', 'color: #d78d5a', 'color: #e09660', 'color: #e99f67', 'color: #f1a86d', 'color: #fab173', 'color: #f7a96f', 'color: #f3a16c', 'color: #f09968', 'color: #ec9265', 'color: #e98a61', 'color: #e5825e', 'color: #e27a5a', 'color: #de7257', 'color: #db6a53', 'color: #d7624f', 'color: #d45a4c', 'color: #d05348', 'color: #cd4b45', 'color: #c94341', 'color: #c63b3e', 'color: #c2333a', 'color: #c4373a', 'color: #c73b3a', 'color: #c93f3a', 'color: #cc433b', 'color: #ce473b', 'color: #d14b3b', 'color: #d34f3b', 'color: #e9723c', 'color: #de6b3a', 'color: #d26539', 'color: #c75e37', 'color: #bc5736', 'color: #b15034', 'color: #a54a32', 'color: #9a4331', 'color: #8f3c2f', 'color: #83362e', 'color: #782f2c', 'color: #6d282b', 'color: #612229', 'color: #561b27', 'color: #4b1426', 'color: #400d24', 'color: #340723', 'color: #290021', 'color: #310d2a', 'color: #391a33', 'color: #40263b', 'color: #483344', 'color: #50404d', 'color: #584d56', 'color: #5f595e', 'color: #676667', 'color: #6f7370', 'color: #778079', 'color: #7e8c81', 'color: #86998a', 'color: #8ea693', 'color: #96b39c', 'color: #9dbfa4', 'color: #a5ccad', 'color: #a7cba3', 'color: #a9ca99', 'color: #acc98f', 'color: #aec985', 'color: #b0c87b', 'color: #b2c771', 'color: #b4c667', 'color: #b7c55d', 'color: #b9c453', 'color: #bbc349', 'color: #bdc23f', 'color: #bfc235', 'color: #c1c12b', 'color: #c4c021', 'color: #c6bf17', 'color: #c8be0d', 'color: #beb811', 'color: #b5b214', 'color: #abad18', 'color: #a2a71c', 'color: #98a11f', 'color: #8f9b23', 'color: #859527', 'color: #7c902b', 'color: #728a2e', 'color: #688432', 'color: #5f7e36', 'color: #557839', 'color: #4c723d', 'color: #426d41', 'color: #396744', 'color: #2f6148', 'color: #366a4a', 'color: #3d724c', 'color: #447b4d', 'color: #4b844f', 'color: #538c51', 'color: #5a9553', 'color: #619e55', 'color: #68a657', 'color: #6faf58', 'color: #76b75a', 'color: #7dc05c', 'color: #84c95e', 'color: #8cd160', 'color: #93da62', 'color: #9ae363', 'color: #a1eb65', 'color: #a8f467', 'color: #a4e661', 'color: #a0d85b', 'color: #9cca56', 'color: #98bd50', 'color: #94af4a', 'color: #90a144', 'color: #8c933e', 'color: #888539', 'color: #837733', 'color: #7f692d', 'color: #7b5b27', 'color: #774e21', 'color: #73401b', 'color: #6f3216', 'color: #6b2410', 'color: #67160a', 'color: #701f10', 'color: #782816', 'color: #81311d', 'color: #8a3a23', 'color: #924429', 'color: #9b4d2f', 'color: #a45635', 'color: #ac5f3b', 'color: #b56842', 'color: #bd7148', 'color: #c67a4e', 'color: #cf8354', 'color: #d78d5a', 'color: #e09660', 'color: #e99f67', 'color: #f1a86d', 'color: #fab173', 'color: #f7a96f', 'color: #f3a16c', 'color: #f09968', 'color: #ec9265', 'color: #e98a61', 'color: #e5825e', 'color: #e27a5a', 'color: #de7257', 'color: #db6a53', 'color: #d7624f', 'color: #d45a4c', 'color: #d05348', 'color: #cd4b45', 'color: #c94341', 'color: #c63b3e', 'color: #c2333a', 'color: #d8563b', 'color: #da5a3b', 'color: #dd5e3b', 'color: #df623c', 'color: #e2663c', 'color: #e46a3c', 'color: #e76e3c', 'color: #e9723c', 'color: #de6b3a', 'color: #d26539', 'color: #c75e37', 'color: #bc5736', 'color: #b15034', 'color: #a54a32', 'color: #9a4331', 'color: #8f3c2f', 'color: #83362e', 'color: #782f2c', 'color: #6d282b', 'color: #612229', 'color: #561b27', 'color: #4b1426', 'color: #400d24', 'color: #340723', 'color: #290021', 'color: #310d2a', 'color: #391a33', 'color: #40263b', 'color: #483344', 'color: #50404d', 'color: #584d56', 'color: #5f595e', 'color: #676667', 'color: #6f7370', 'color: #778079', 'color: #7e8c81', 'color: #86998a', 'color: #8ea693', 'color: #96b39c', 'color: #9dbfa4', 'color: #a5ccad', 'color: #a7cba3', 'color: #a9ca99', 'color: #acc98f', 'color: #aec985', 'color: #b0c87b', 'color: #b2c771', 'color: #b4c667', 'color: #b7c55d', 'color: #b9c453', 'color: #bbc349', 'color: #bdc23f', 'color: #bfc235', 'color: #c1c12b', 'color: #c4c021', 'color: #c6bf17', 'color: #c8be0d', 'color: #beb811', 'color: #b5b214', 'color: #abad18', 'color: #a2a71c', 'color: #98a11f', 'color: #8f9b23', 'color: #859527', 'color: #7c902b', 'color: #728a2e', 'color: #688432', 'color: #5f7e36', 'color: #557839', 'color: #4c723d', 'color: #426d41', 'color: #396744', 'color: #2f6148', 'color: #366a4a', 'color: #3d724c', 'color: #447b4d', 'color: #4b844f', 'color: #538c51', 'color: #5a9553', 'color: #619e55', 'color: #68a657', 'color: #6faf58', 'color: #76b75a', 'color: #7dc05c', 'color: #84c95e', 'color: #8cd160', 'color: #93da62', 'color: #9ae363', 'color: #a1eb65', 'color: #a8f467', 'color: #a4e661', 'color: #a0d85b', 'color: #9cca56', 'color: #98bd50', 'color: #94af4a', 'color: #90a144', 'color: #8c933e', 'color: #888539', 'color: #837733', 'color: #7f692d', 'color: #7b5b27', 'color: #774e21', 'color: #73401b', 'color: #6f3216', 'color: #6b2410', 'color: #67160a', 'color: #701f10', 'color: #782816', 'color: #81311d', 'color: #8a3a23', 'color: #924429', 'color: #9b4d2f', 'color: #a45635', 'color: #ac5f3b', 'color: #b56842', 'color: #bd7148', 'color: #c67a4e', 'color: #cf8354', 'color: #d78d5a', 'color: #e09660', 'color: #e99f67', 'color: #f1a86d', 'color: #fab173', 'color: #f7a96f', 'color: #f3a16c', 'color: #f09968', 'color: #ec9265', 'color: #e98a61', 'color: #e5825e', 'color: #e27a5a', 'color: #de7257', 'color: #db6a53'
);