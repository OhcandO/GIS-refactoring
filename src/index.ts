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
export type { TreeNode } from './tree/CheckboxTree';
export { LayerTree } from './tree/LayerTree';
export { LayerTreeColorPickr } from './tree/LayerTreeColorPickr';
export { LayerTreeFixedScale } from './tree/LayerTreeFixedScale';
export { LayerTreeNew } from './tree/LayerTreeNew';
export { LayerTreeUEW } from './tree/LayerTreeUEW';

// 유틸리티
export * as KEY from './common/keyMap';
