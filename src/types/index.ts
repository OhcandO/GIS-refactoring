/**
 * MOGISMap 공통 타입 정의
 * @packageDocumentation
 */

export * from './enums';

import type { YNFlag, GeometryType, SourceCategory, SourceClass, LayerPurpose } from './enums';
import type Layer from 'ol/layer/Layer';
import type OlMap from 'ol/Map';
import type View from 'ol/View';

// ─── layerCodeObj: 레이어 설정 객체 ───

/**
 * OpenLayers 레이어 객체를 생성하기 위해 필요한 정보를 표현하는 인터페이스.
 * DB 테이블 MOGIS_SPEC_LAYER 의 레코드 1건에 대응됨.
 */
export interface LayerCodeObj {
  /** DB 상 개별 레이어의 Primary Key */
  id: number;
  /** 본 레이어의 상위 레이어 id (보통 상위레이어는 그룹) */
  pid: number | null;
  /** 레이어의 클라이언트 표출 이름 */
  layerTitle: string;
  /** 레이어 리스트의 정렬 순서 (렌더링 순서 아님) */
  ordr: number;

  /** 소스의 location.origin */
  origin: string;
  /** 소스의 location.pathname */
  sourcePathname: string;
  /** 소스 접근을 위한 API 키 */
  apiKey: string | null;

  /** 레이어 렌더링 순서 (수가 클수록 위에 그려짐) */
  zIndex: number;
  /** Geoserver 상의 레이어 식별명 (TYPE_NAME) */
  typeName: string;
  /** OpenLayers 소스 객체 클래스 구분 */
  sourceClass: SourceClass;
  /** Geometry 타입 */
  geomType: GeometryType | null;
  /** 소스의 출처 대분류 */
  category: SourceCategory;
  /** 좌표계 (e.g. 'EPSG:5186') */
  srid: string;
  /** 레이어가 표현될 최소 줌 */
  minZoom: number;
  /** CQL 필터 */
  cqlfilter: string | null;
  /** GIS 데이터 연계 시 원본 소스 특수 레이어 아이디 */
  arcLayerId: string | null;

  /** Point, Polygon 중앙 좌표에 표시할 심볼 아이콘명 */
  iconName: string | null;
  /** 선 두께 */
  lineWidth: string | number | null;
  /** 선 스타일 (e.g. 'solid', '[3,5]') */
  lineStyle: string | null;
  /** 선 색 (e.g. 'rgba(2,2,2,0.5)') */
  colorLine: string | null;
  /** 면적 채우기 색 */
  colorFill: string | null;
  /** 지도 상 렌더링 될 피쳐의 속성명 (라벨) */
  label: string | null;
  /** 폰트 스타일 (e.g. 'serif 14px bold') */
  font: string | null;
  /** 폰트 외곽선 두께 */
  fontWidth: string | null;
  /** 폰트 외곽선 색 */
  colorFontLine: string | null;
  /** 폰트 채우기 색 */
  colorFontFill: string | null;

  /** 레이어 선택 가능 여부 */
  boolSelectable: YNFlag | null;
  /** 레이어 사용 여부 */
  boolUseYn: YNFlag;
  /** 레이어 그룹 여부 */
  boolIsgroup: YNFlag | null;
  /** 레이어 사용자 수정 가능 여부 */
  boolEditable: YNFlag | null;
  /** 레이어 초기 표출 여부 */
  boolShowInit: YNFlag | null;
  /** 레이어 다운로드 가능 여부 */
  boolDownload: YNFlag | null;
  /** 밀집된 feature 간소화 기능 활성화 여부 */
  boolDeclutter: YNFlag | null;
  /** 대용량 레이어 구분 */
  boolIsheavy: YNFlag | null;
  /** 런타임 가시성 (런타임에 변경됨) */
  boolVisible?: boolean;

  /** 레이어 목적별 구분자 */
  layerPurposeCategory?: LayerPurpose;
  /** 하위 레이어 목록 (트리 변환 시 생성) */
  childList?: LayerCodeObj[];
  /** 범례 HTML 문자열 */
  legendHtmlString?: string;
}

// ─── 맵 설정 ───

/**
 * MOGISMap 생성자 파라미터 정의
 */
export interface MOGISMapConfig {
  /** Map 객체가 정의될 DIV element의 id */
  target: string;
  /** OpenLayers 뷰 포트의 좌표계 (기본: 'EPSG:3857') */
  projection?: string;
  /** projection 좌표계에서의 중심좌표 위치 */
  center?: [number, number];
  /** 초기 줌 수준 */
  zoom?: number;
  /** 지도 회전 허용 여부 */
  enableRotation?: boolean;
  /** 이산 줌 레벨 고정 여부 */
  constrainResolution?: boolean;
  /** 커스텀 해상도 배열 */
  resolutions?: number[];
  /** Select interaction 클릭 반경 (기본: 10) */
  hitTolerance?: number;
  /** Select interaction 다중 선택 여부 (기본: false) */
  multi?: boolean;
}

// ─── 범례 설정 ───

/**
 * LayerTree가 관장하는 범례용 정보 객체
 */
export interface LegendCodeObj {
  /** 레이어 아이디 */
  id: number;
  /** 해당 레이어 렌더링 여부 */
  boolVisible: boolean;
  /** 해당 레이어 목적별 구분자 */
  layerPurposeCategory: LayerPurpose;
  /** 문자열로 표현된 HTML 태그 엘리먼트 */
  legendHtmlString: string;
  /** 레이어 코드 객체 */
  layerCode: LayerCodeObj;
}

// ─── ColorPickr 설정 ───

/**
 * Pickr 컴포넌트 활성화 옵션
 */
export interface PickrComponentConfig {
  preview?: boolean;
  opacity?: boolean;
  hue?: boolean;
  interaction?: {
    rgba?: boolean;
    hex?: boolean;
    input?: boolean;
    clear?: boolean;
    save?: boolean;
    cancel?: boolean;
  };
}

/**
 * LayerTree_colorPickr에 주입할 Pickr 설정
 */
export interface ColorPickrConfig {
  /** Pickr 테마 (기본: 'monolith') */
  theme?: 'classic' | 'monolith' | 'nano';
  /** 슬라이더 방향 */
  sliders?: 'v' | 'h' | 'hv';
  /** 기본 색상 표현 형식 */
  defaultRepresentation?: 'RGBA' | 'HEX' | 'HSLA' | 'HSVA' | 'CMYK';
  /** Pickr 팔레트 CSS 클래스명 */
  appClass?: string;
  /** 컴포넌트 활성화 옵션 */
  components?: PickrComponentConfig;
}

/** ColorPickr 기본 설정 (현재 하드코딩 된 값과 동일) */
export const DEFAULT_PICKR_CONFIG: Required<ColorPickrConfig> = {
  theme: 'monolith',
  sliders: 'h',
  defaultRepresentation: 'RGBA',
  appClass: 'colorPickr_palette',
  components: {
    preview: true,
    opacity: true,
    hue: true,
    interaction: {
      rgba: false,
      hex: false,
      input: true,
      clear: false,
      save: true,
      cancel: false,
    },
  },
};

// ─── 지오메트리별 색상 속성 정의 ───

/**
 * ColorPickr에서 사용하는 색상 속성 정의
 */
export interface ColorPropertyDef {
  /** layerCodeObj 내의 키 이름 */
  key: string;
  /** UI에 표시할 라벨 */
  label: string;
}

/** 지오메트리 타입별 편집 가능한 색상 속성 매핑 */
export const DEFAULT_COLOR_PROPERTIES: Record<GeometryType, ColorPropertyDef[]> = {
  LineString: [
    { key: 'colorLine', label: '선 색' },
  ],
  Polygon: [
    { key: 'colorLine', label: '선 색' },
    { key: 'colorFill', label: '면 색' },
  ],
  Point: [],
};

// ─── INSTANCE 내부 구조 타입 ───

/**
 * MOGISMap 내부 레이어 저장 구조
 */
export interface LayerStore {
  /** 배경지도 레이어 배열 */
  BACKGROUND?: Layer[];
  /** 목적별 분류 없는 기본 레이어 */
  default: Map<string, Layer>;
  /** 주소검색 결과 레이어 */
  address?: Layer;
  /** 강조표시 레이어 (Geometry 타입별) */
  highlight: {
    Point?: Layer;
    LineString?: Layer;
    Polygon?: Layer;
  };
  /** 목적별 레이어 맵 */
  [purpose: string]: Map<string, Layer> | Layer | Layer[] | object | undefined;
}

/**
 * MOGISMap 내부 인스턴스 구조
 */
export interface MapInstance {
  MAP?: OlMap;
  VIEW?: View;
  LAYER: LayerStore;
  INTERACTION: {
    select?: any;
  };
}

// ─── 트리 이벤트 ───

/**
 * CheckboxTree 변경 이벤트 데이터
 */
export interface TreeChangeEvent {
  action: 'select_node' | 'deselect_node' | 'ready';
  node: {
    id: string;
    children: string[];
    children_d: string[];
    data?: Record<string, any>;
  };
}
