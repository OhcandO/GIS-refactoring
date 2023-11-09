
/*
 * 쿼리에서 사용한 alias 와, 
 * 소스 상 사용하는 객체들의 KEY 값을 
 * 일치시키기 위한 변수정의
 * 
 * DB 의 alias 가 변경되면 이 js 파일의 각 값의 string 값을 변경하면 된다
 */

/* △△△△△△레이어 식별 관련△△△△△△△△△△△△△ */
export const LAYER_NAME = `layerTitle` //화면에서 표현될 레이어 제목
export const TYPE_NAME = `typeName`; //geoserver 용 레이어 식별자
export const LAYER_GEOMETRY_TYPE = `layerType`; //BASE, group, POINT, LINE, POLYGON 등 레이어 타입

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

/* 레이어 관련 */
export const BOOL_SELECTABLE = `boolSelectable`;
export const BOOL_VISIBLE = `boolIsdefault`; //'초기에 보여야 하는지' 여부. visible 은 use_yn 과 혼동될 수 있어서 피함
export const Z_INDEX = `zIndex`;
export const MIN_ZOOM = `minZoom`;

/* ⭕레이어 트리(Tree)용 JSON 관련 🚫 */
export const LAYER_ID = `id`;
export const PARENT_ID = `pid`;
export const CHILD_MARK = `childList`;
export const BOOL_IS_GROUP = `boolIsgroup` // 해당 레이어가 '형식상' 레이어이며 그룹핑 용도로만 사용되는지 여부
/**
 * 레이어들의 목적으로 다르게 운용하기위해 구분
 * @typedef {object} LAYER_PURPOSE_CATEGORY
 */
export const LAYER_PURPOSE_CATEGORY= {
        /**기본 GIS 시설물 e.g. 관로, 계측기, 블록 등*/
        BASE:'base', 
        /** (지능수도플) 리스크맵 */
        RISKMAP:'risk', 
        /** (지능수도플) 누수예상지점 */
        LEAK:'leak', 
        /** (지능수도플) 공공서비스 */
        PUBLIC:'public', 
        /** (지능수도플) 관망해석결과 */
        PIPENET:'pipnet', 
        /**(지능수도플) 중점 관리지역 */
        MANAGE:'manage', 
        /** (지능수도플) 상습민원지역 */
        COMPLAINT:'comp', 
        /** (지능수도플) 실시간 상황감지 */
        REALTIME:'realtime', 
        /** (지능수도플) 이동형 누수센서 */
        PORTABLE:'portable', 
        }

/* ▲▲▲▲▲레이어 소스(Source) 관련▲▲▲▲▲▲▲▲▲△ */
export const ORIGIN = `origin`;
export const SOURCE_PATHNAME = `sourcePathname`;
export const SOURCE_TYPE = `sourceType`;
export const CQL_FILTER = `cqlfilter`;
export const APIKEY = `apiKey`;
export const SRID = `srid`;
export const CATEGORY = `category`;

/* Openlayers Feature들의 타입 구분 */
export const OL_FEATURE_TYPE_POINT = 'POINT';
export const OL_FEATURE_TYPE_LINE = 'LINE';
export const OL_FEATURE_TYPE_POLYGON = 'POLYGON';