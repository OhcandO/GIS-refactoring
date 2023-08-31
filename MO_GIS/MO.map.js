/**
 * ol.Map 객체 Factory
 */

"use strict";

import {confObj} from './MO.config.js';
import {Map} from '../lib/openlayers_v7.5.1/Map.js'
/**
 * @param {Object} mapSpecObj - 지도 객체를 생성하기 위한 스펙 객체
 * @param {boolean} mapSpecObj.isFetch - 서버로부터 데이터를 가져와야 하는지
 * @param {string} mapSpecObj.fetchURL - 서버로부터 데이터를 가져와야 하는지
 * @param {string} mapSpecObj.targetID - 최종 지도 객체가 연결될 화면의 DIV id
 */
const mapFactory = function(mapSpecObj){
    let map;

    //0. default config 가져오기
    let conf ;
    if(mapSpecObj.isFetch){
        conf = confObj.getBaseConfig(mapSpecObj.fetchURL);
    }else{
        conf = confObj.config_base;
    }
    //1. 좌표계 설정
    map = new Map({});
    //2. 기본 레이어 설정

    //3. View 설정

    //4. 



    return map;
}