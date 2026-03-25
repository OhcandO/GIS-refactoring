/**
 * MOGISMap 공통 열거형 및 리터럴 타입 정의
 * @packageDocumentation
 */

/** DB 상 Y/N 플래그 */
export type YNFlag = 'Y' | 'N';

/** OpenLayers Geometry 타입명 */
export type GeometryType = 'Point' | 'LineString' | 'Polygon';

/** 소스의 출처 대분류 */
export type SourceCategory = 'vworld' | 'geoserver' | 'intra' | 'virtual';

/** OpenLayers 소스 객체 클래스 구분 */
export type SourceClass = 'vector' | 'wmts' | 'xyz' | 'geojson' | 'arcgis';

/** 레이어 목적별 구분자 */
export type LayerPurpose =
  | 'base'
  | 'risk'
  | 'leak'
  | 'public'
  | 'pipenet'
  | 'manage'
  | 'comp'
  | 'realtime'
  | 'portable';

/** 레이어 목적 카테고리 열거형 (키: 용도명, 값: [목적키, 정렬순서]) */
export const LAYER_PURPOSE_CATEGORY = {
  /** 기본 GIS 관망도 (관로, 계측기, 블록 등) */
  BASE: ['base', 5],
  /** 리스크맵 */
  RISKMAP: ['risk', 1],
  /** 누수예상지점 */
  LEAK: ['leak', 2],
  /** 공공서비스 */
  PUBLIC: ['public', 3],
  /** 관망해석결과 */
  PIPENET: ['pipenet', 4],
  /** 중점 관리지역 */
  MANAGE: ['manage', 6],
  /** 상습민원지역 */
  COMPLAINT: ['comp', 7],
  /** 실시간 상황감지 */
  REALTIME: ['realtime', 8],
  /** 이동형 누수센서 */
  PORTABLE: ['portable', 9],
} as const;

/** LAYER_PURPOSE_CATEGORY 의 키 타입 */
export type LayerPurposeCategoryKey = keyof typeof LAYER_PURPOSE_CATEGORY;

/** OpenLayers Geometry 객체 상수 */
export const OL_GEOMETRY_OBJ = {
  POINT: 'Point',
  LINE: 'LineString',
  POLYGON: 'Polygon',
} as const;
