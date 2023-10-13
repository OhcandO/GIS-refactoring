
/*
 * 쿼리에서 사용한 alias 와, 
 * 소스 상 사용하는 객체들의 KEY 값을 
 * 일치시키기 위한 변수정의
 */

/* △△△△△△레이어 식별 관련△△△△△△△△△△△△△ */
export const LAYER_NAME = `layerTitle` //화면에서 표현될 레이어 제목
export const TYPE_NAME = `typeName`; //geoserver 용 레이어 식별자
export const LAYER_TYPE = `layerType`; //BASE, group, POINT, LINE, POLYGON 등 레이어 타입

/* △△△△△△레이어 스타일(Style) 관련△△△△△△△△△△△△△ */
export const LINE_WIDTH = `lineWidth`;
export const LINE_STYLE = `lineStyle`;
export const COLOR_FILL = `colorFill`;
export const COLOR_LINE = `colorLine`;
export const FONT_STYLE = `font`;
export const FONT_OUTLINE = `colorFontLine`;
export const FONT_FILL = `colorFontFill`;
export const ICON_NAME = `iconName`;
export const MIN_ZOOM = `minZoom`;
export const Z_INDEX = `zIndex`;
export const BOOL_IS_GROUP = `boolIsgroup`
export const BOOL_IS_DEFAULT = `boolIsdefault`;
export const BOOL_VISIBLE = `boolIsdefault`;
export const BOOL_SELECTABLE = `boolSelectable`;
export const LABEL_COLUMN = `label`;

/* ⭕레이어 트리(Tree)용 JSON 관련 🚫 */
export const ELEMENT_ID = `id`;
export const PARENT_ID = `pid`;
export const CHILD_MARK = `childList`;

/* ▲▲▲▲▲레이어 소스(Source) 관련▲▲▲▲▲▲▲▲▲△ */
export const ORIGIN = `origin`;
export const SOURCE_PATHNAME = `sourcePathname`;
export const SOURCE_TYPE = `sourceType`;
export const CQL_FILTER = `cqlfilter`;
export const APIKEY = `apiKey`;
export const SRID = `srid`;
export const CATEGORY = `category`;

/* Openlayers 고정 키 값 관련 */
