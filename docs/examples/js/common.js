/**
 * MOGISMap Examples - Shared Helpers
 * 각 예제 페이지에서 공통으로 사용하는 유틸리티 함수와 re-export 모듈
 */

import {
  MOGISMap,
  SourceFactory,
  LayerFactory,
  OSM,
  TileLayer,
  GeoJSON,
  VectorSource,
  VectorImageLayer,
  VectorLayer,
  Style,
  Stroke,
  Fill,
  CircleStyle,
  KEY,
  MOOverlay,
  MOMeasure,
  MOLegend,
  LayerTree,
  LayerTreeColorPickr,
  LayerTreeFixedScale,
  createMOStyleFunction,
  createStyleFunctionForScale,
  registSpaciousLayer,
  TileLoadProgress,
  Feature,
} from './mogismap.js';

// 기본 좌표 (서울, EPSG:3857)
export const DEFAULT_CENTER = [14142459.59, 4506517.58];
export const DEFAULT_ZOOM = 13;

// 전역 변수 설정 (라이브러리 내부에서 참조)
window.ctxPath = '';

/**
 * OSM 배경지도로 MOGISMap 인스턴스를 생성하는 헬퍼
 * @param {string} targetId - 지도가 렌더링될 DOM 요소의 id
 * @param {Object} [options={}] - 추가 옵션
 * @param {number[]} [options.center] - 중심 좌표 [x, y] (EPSG:3857)
 * @param {number} [options.zoom] - 초기 줌 레벨
 * @param {number} [options.hitTolerance] - 클릭 허용 오차 (px)
 * @param {boolean} [options.multi] - 다중 선택 여부
 * @returns {MOGISMap} 생성된 MOGISMap 인스턴스
 */
export function createBaseMap(targetId, options = {}) {
  const mapConfig = {
    target: targetId,
    projection: 'EPSG:3857',
    center: options.center || DEFAULT_CENTER,
    zoom: options.zoom || DEFAULT_ZOOM,
    constrainResolution: false,
    enableRotation: false,
    hitTolerance: options.hitTolerance || 10,
    multi: options.multi || false,
  };

  const mogisMap = new MOGISMap(mapConfig);
  mogisMap.setFactory(new SourceFactory());
  mogisMap.setFactory(new LayerFactory());
  mogisMap.setBaseLayer(); // No base layer codes → triggers OSM fallback

  return mogisMap;
}

/**
 * 로컬 GeoJSON 파일을 로드하여 VectorSource를 생성
 * @param {string} url - GeoJSON 파일 경로
 * @returns {Promise<VectorSource>} 피처가 로드된 VectorSource
 */
export async function loadGeoJSON(url) {
  const response = await fetch(url);
  const geojsonData = await response.json();
  const format = new GeoJSON();
  const features = format.readFeatures(geojsonData, {
    featureProjection: 'EPSG:3857',
    dataProjection: 'EPSG:4326',
  });
  const source = new VectorSource({ features });
  return source;
}

/**
 * 코드 뷰 토글 기능 초기화
 * .code-toggle 버튼과 .code-view 블록을 연결하여 코드 표시/숨김 처리
 */
export function initCodeToggle() {
  const btn = document.querySelector('.code-toggle');
  const code = document.querySelector('.code-view');
  if (btn && code) {
    btn.addEventListener('click', () => {
      const isHidden = code.style.display === 'none' || code.style.display === '';
      code.style.display = isHidden ? 'block' : 'none';
      btn.textContent = isHidden ? '코드 숨기기' : '코드 보기';
    });
  }
}

// Re-export for convenience in examples
export {
  MOGISMap,
  SourceFactory,
  LayerFactory,
  OSM,
  TileLayer,
  GeoJSON,
  VectorSource,
  VectorImageLayer,
  VectorLayer,
  Style,
  Stroke,
  Fill,
  CircleStyle,
  KEY,
  MOOverlay,
  MOMeasure,
  MOLegend,
  LayerTree,
  LayerTreeColorPickr,
  LayerTreeFixedScale,
  createMOStyleFunction,
  createStyleFunctionForScale,
  registSpaciousLayer,
  TileLoadProgress,
  Feature,
};
