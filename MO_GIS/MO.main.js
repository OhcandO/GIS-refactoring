/**
 * <MO_GIS>
 * MindOne GIS Openlayers 라이브러리 최적 사용을 위한 JS 모듈화 프로젝트
 * 그 중 entry point 로서 사용하기 위한 core 파일
 */

"use strict"

import MOMapConfig from './classes/MO.config.js';

//1. default config 가져오기
let baseConf = new MOMapConfig();
console.log(baseConf);

//1. fetch GIS setting from server

//2. base layer 구성

let mapObj ;

globalThis.mainMap = mapObj;