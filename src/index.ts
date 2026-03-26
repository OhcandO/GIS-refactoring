/**
 * MOGISMap - OpenLayers 기반 2D 지도 표출 유틸리티 라이브러리
 * @packageDocumentation
 */

// 타입 정의 export
export type {
  LayerCodeObj,
  MOGISMapConfig,
  LegendCodeObj,
  ColorPickrConfig,
  PickrComponentConfig,
  ColorPropertyDef,
  LayerStore,
  MapInstance,
  TreeChangeEvent,
} from './types';

export {
  type YNFlag,
  type GeometryType,
  type SourceCategory,
  type SourceClass,
  type LayerPurpose,
  type LayerPurposeCategoryKey,
  LAYER_PURPOSE_CATEGORY,
  OL_GEOMETRY_OBJ,
  DEFAULT_PICKR_CONFIG,
  DEFAULT_COLOR_PROPERTIES,
} from './types';

// 코어 클래스
export { MOGISMap } from './core/MOGISMap';
export { MOSimpleMap } from './core/MOSimpleMap';

// 추상 클래스
export { MOPublisher } from './abstract/Publisher';
export { MOSubscriber } from './abstract/Subscriber';
export { MOFactory } from './abstract/Factory';
export { MOAddon } from './abstract/Addon';

// 팩토리
export { SourceFactory } from './factory/SourceFactory';
export { LayerFactory } from './factory/LayerFactory';
export { LayerFactoryDeclutter } from './factory/LayerFactoryDeclutter';
export { createMOStyleFunction, createStyleFunctionForScale, registSpaciousLayer, registBackgroundlikeLayer } from './factory/StyleFunctionFactory';

// 애드온
export { MOOverlay } from './addon/MOOverlay';
export { MOLegend } from './addon/MOLegend';
export { MOMeasure } from './addon/MOMeasure';
export { TileLoadProgress } from './addon/TileLoadProgress';

// 트리
export { CheckboxTree } from './tree/CheckboxTree';
export type { TreeNode, ChangedEventData } from './tree/CheckboxTree';
export { LayerTree } from './tree/LayerTree';
export { LayerTreeColorPickr } from './tree/LayerTreeColorPickr';
export { LayerTreeFixedScale } from './tree/LayerTreeFixedScale';
export { LayerTreeNew } from './tree/LayerTreeNew';
export { LayerTreeUEW } from './tree/LayerTreeUEW';

// 팩토리 보조 타입
export type { MOOverlayOptions } from './addon/MOOverlay';

// OpenLayers 유틸 re-export (예시 및 외부 사용)
export { default as OlMap } from 'ol/Map';
export { default as View } from 'ol/View';
export { default as Feature } from 'ol/Feature';
export { default as GeoJSON } from 'ol/format/GeoJSON';
export { default as VectorSource } from 'ol/source/Vector';
export { default as VectorImageLayer } from 'ol/layer/VectorImage';
export { default as VectorLayer } from 'ol/layer/Vector';
export { default as OSM } from 'ol/source/OSM';
export { default as TileLayer } from 'ol/layer/Tile';
export { default as OlOverlay } from 'ol/Overlay';
export { Style, Stroke, Fill, Circle as CircleStyle, Icon, Text } from 'ol/style';

// 유틸리티
export * as KEY from './common/keyMap';
