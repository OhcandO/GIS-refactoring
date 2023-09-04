/**
 * ol.Map 객체 를 포함한 기능들을 가지고 있는 복합객체를 생성하는 Factory
 * 
 */

"use strict";

import proj4 from '../lib/proj4js-2.9.0/dist/proj4.js'
import {register} from '../lib/openlayers_v7.5.1/proj/proj4.js';
import Map from '../../lib/openlayers_v7.5.1/Map.js'
import View from '../../lib/openlayers_v7.5.1/View.js'

import { MOMapConfig } from './MO.config.js';


//1. 좌표계 설정, 주요 한국 좌표체계 등록
proj4.defs("EPSG:5187","+proj=tmerc +lat_0=38 +lon_0=129 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs"); //울진 신규(2023-06)
proj4.defs("EPSG:5179","+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"); //주소검색
proj4.defs("EPSG:5181","+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +units=m +no_defs"); // 추가
register(proj4);


/**
 * @param {Object} mapSpecObj - 지도 객체를 생성하기 위한 스펙 객체
 * @param {boolean} mapSpecObj.isFetch - 서버로부터 데이터를 가져와야 하는지
 * @param {string} mapSpecObj.fetchURL - 서버로부터 데이터를 가져와야 하는지
 * @param {string} mapSpecObj.targetID - 최종 지도 객체가 연결될 화면의 DIV id
 */
const mapFactory = function(mapConfig){
    let mapObj;

    if(mapConfig instanceof MOMapConfig){

        //2. 기본 레이어 설정
        MOMapConfig.LAYERS
        //3. View 설정
        const view = new View({
            projection:mapConfig.VIEW_CRS,
            maxZoom:19,
        });
        //4. 
    }

    return mapObj;
}