/**
 * 개별 레이어의 ol/source 를 구성하는 클래스.
 * 입력되는 inputLayerSpec 을 토태로
 * ol/source 객체를 리턴해, ol/layer 를 구성할 수 있도록 준비작업 함
 *
 * @export
 * @class MOSourceConfig
 */

import GeoJSON  from '../../lib/openlayers_v7.5.1/format/GeoJSON.js';
import Source   from '../../lib/openlayers_v7.5.1/source/Source.js';
import XYZ      from '../../lib/openlayers_v7.5.1/source/XYZ.js';
import VectorSource from '../../lib/openlayers_v7.5.1/source/Vector.js';

export class MOSourceConfig {
    #KEY_ORIGIN = `origin`;
    #KEY_SOURCE_PATHNAME = `sourcePathname`;
    #KEY_SOURCE_TYPE = `sourceType`;
    #KEY_CATEGORY = `category`;
    #KEY_TYPE_NAME = `typeName`;
    #KEY_CQL_FILTER = `cqlFilter`;

    #default_leyerSpec = {
        zIndex: 5,
        opacity: 1,
    };
    #merged_layerSpec;
    #theSource; //생성자에 입력된 내용이 default 와 합쳐져 등록됨

    /**
     *
     * @param {inputLayerSpec} inputLayerSpec
     */
    constructor(inputLayerSpec) {
        this.#merged_layerSpec = Object.assign(
            this.#default_leyerSpec,
            inputLayerSpec
        );

        if (inputLayerSpec) {
            //레이어의 소스 구성
            this.buildSource();

            //레이어의
            //TODO 바로 layer source, layer style 파라미터로 사용할 수 있도록 구성
            return this.source;
        }
    }

    get source() {

        return this.#theSource;
    }

    set source(ol_source){
        if(ol_source instanceof Source){
            this.#theSource = ol_source;
        }else{
            console.log(`해당 source 객체는 openlayers 인스턴스 아님`);
            console.log(ol_source);
            throw new Error(`해당 source 객체는 openlayers 인스턴스 아님`);
        }
    }

    /**
     * 사용할 수 있는 Openlayers source 객체의 url 을 구성함
     *
     * @param {Object} inputLayerSpec
     * @return {} Openlayers source 파라미터로 사용할 수 있는 URL 폼
     * @memberof MOSourceConfig
     */
    buildSource() {
        let sourceInstance;
        if (this.#isValid_category_source()) {
            try {
                sourceInstance = this.#sourceFactory(
                    this.#merged_layerSpec.get(this.#KEY_CATEGORY),
                    this.#merged_layerSpec.get(this.#KEY_SOURCE_TYPE)
                );
            } catch (e) {
                console.group(`openlayers source 객체 생성실패`);
                console.table(this.#merged_layerSpec);
                console.groupEnd();
                throw new Error(`openlayers source 객체 생성실패`);
            } finally {
                this.#theSource = sourceInstance;
            }
        }
    }

    #isValid_category_source() {
        let bool = false;
        let category, sourceType;

        try {
            category = layerSpec.get(this.#KEY_CATEGORY); //vworld, geoserver, emap etc.
            sourceType = layerSpec.get(this.#KEY_SOURCE_TYPE); //vector, xyz, wmts etc.
        } catch (e) {
            console.group(`"category" 및 "source_type" 지정안됨`);
            console.table(layerSpec);
            console.groupEnd();
            throw new Error(`"category" 및 "source_type" 지정안됨`);
        }

        //현재는 이 도메인과 소스타입으로만 구성중임
        const AVAILABLE_CATEGORY_SOURCE = [
            { category: `vworld`, sourceType: `wmts` },
            { category: `vworld`, sourceType: `xyz` },
            { category: `geoserver`, sourceType: `geojson` },
        ];

        bool = AVAILABLE_CATEGORY_SOURCE.some(
            (e) => e.category == category && e.sourceType == sourceType
        );
        if (!bool) {
            console.group(`유효하지 않은 category, sourceType 지정`);
            console.table(inputLayerSpec);
            console.groupEnd();
        }
        return bool;
    }

    /**
     *
     * @param {String} category 카테고리
     * @param {String} sourceType 소스타입
     * @returns {URL}
     */
    #sourceFactory(category, sourceType) {
        let returnSource;
        let sourceURL;
        let srid;
        if (category == `geoserver` && sourceType == `vector`) {
            let geojson_option;
            
            srid = this.#getValidSrid();
            if(srid) geojson_option(`dataProjection`)=srid;

            sourceURL = this.#urlBuilder_geoserver();
            returnSource = new VectorSource({
                format: new GeoJSON(geojson_option),
                url: sourceURL,
            });
        } else if (category == `vworld` && sourceType == `xyz`) {
            
            sourceURL = this.#urlBuilder_vworld_xyz();
            let sourceOpion={
                url: sourceURL,
                maxZoom:19,
                crossOrigin:'anonymous',
            }
            srid = this.#getValidSrid();
            if(srid) sourceOpion[`projection`] = srid;

            returnSource = new XYZ(sourceOpion);
        } else if (category == `vworld` && sourceType == `wmts`) {
            //TODO WMTS 인 경우 (배경지도) 소스 URL 구성하는 방법
        } else {
            console.log(`정의되지 않은 category, sourceType`);
            console.log(category, sourceType);
            throw new Error(`정의되지 않은 category, sourceType`);
        }
        return returnSource;
    }

    #getValidSrid() {
        let SRID = this.#merged_layerSpec[this.#KEY_SRID];
        if (SRID) {
            //SRID == 'EPSG:5181' <--- 콜론 포함 이 형태가 되어야 함
            //SRID == 'EPSG4326'
            //SRID == '4326'
            SRID = SRID.trim();
            if (SRID.startsWith(`EPSG:`)) {
            } else if (SRID.includes(`EPSG`)) {
                SRID = `EPSG:` + SRID.split(`EPSG`)[1];
            } else if (/^\d+$/.test(SRID)) {
                //숫자로만 이뤄져있나
                SRID = `EPSG:` + SRID;
            } else {
                SRID = undefined;
            }
        }
        return SRID;
    }

    /**
     *
     * @returns {URL}
     */
    #urlBuilder_geoserver() {
        let origin = this.#merged_layerSpec[this.#KEY_ORIGIN] ||location.origin;
        let pathName = this.#merged_layerSpec[this.#KEY_SOURCE_PATHNAME]; // "/geoserver/waternet/wfs/";
        let returnURL;
        if (pathName) {
            returnURL = new URL(pathName, origin); //origin 은 sourceURL 이 absolute 라면 무시됨
            const typeName = this.#merged_layerSpec[this.#KEY_TYPE_NAME]; // "waternet:WTL_BLSM_AS_YS" etc.

            let paramString = new URLSearchParams();
            //WFS getFeature v2.0.0 공통 request
            //https://docs.geoserver.org/2.23.x/en/user/services/wfs/reference.html#getfeature
            paramString.set("service", "wfs");
            paramString.set("request", "getFeature");
            paramString.set("version", "2.0.0");
            paramString.set("typeName", encodeURIComponent(typeName)); // :, %, & 등 특수기호들 uri 유효 형식으로 변환
            paramString.set(
                `outputFormat`,
                encodeURIComponent(`application/json`)
            );

            const cqlFilter = this.#merged_layerSpec[this.#KEY_CQL_FILTER];
            if (cqlFilter) {
                paramString.set(`cql_filter`, encodeURIComponent(cqlFilter));
            }
            return returnURL;
        } else {
            console.group(`source URL 이 정의되지 않음`);
            console.log(this.#merged_layerSpec);
            throw new Error(`source URL 이 정의되지 않음`);
        }
    }
    #urlBuilder_vworld_xyz() {
        let origin = this.#merged_layerSpec[this.#KEY_ORIGIN] ||location.origin;
        let pathName = this.#merged_layerSpec[this.#KEY_SOURCE_PATHNAME]; // "http://xdworld.vworld.kr:8080/2d/Satellite/service/{z}/{x}/{y}.jpeg";
        let returnURL;
        if (pathName) {
            return new URL(pathName, origin); //origin 은 sourceURL 이 absolute 라면 무시됨
        } else {
            console.group(`source URL 이 정의되지 않음`);
            console.log(this.#merged_layerSpec);
            throw new Error(`source URL 이 정의되지 않음`);
        }
    }
}
