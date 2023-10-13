/**
 * DB 에 있는 자료를 개별 레이어의 ol/source 로 구성하는 클래스.
 * @export
 * @class MOSourceConfig
 * @author jhoh
 */
import * as KEY from '../MO.keyMap.js';
import GeoJSON          from '../../lib/openlayers_v7.5.1/format/GeoJSON.js';
import WMTSCapabilities from '../../lib/openlayers_v7.5.1/format/WMTSCapabilities.js';
import WMTS, {optionsFromCapabilities} from '../../lib/openlayers_v7.5.1/source/WMTS.js';
import Source           from '../../lib/openlayers_v7.5.1/source/Source.js';
import XYZ              from '../../lib/openlayers_v7.5.1/source/XYZ.js';
import VectorSource     from '../../lib/openlayers_v7.5.1/source/Vector.js';
import { vworld_compatibilities } from '../external/vworldCompatibilities.js';

export class SourceFactory {
    
    #default_leyerSpec = {
        zIndex: 5,
        opacity: 1,
    };
    
    #mergedLayerCodeElement;
    #theSource; //생성자에 입력된 내용이 default 와 합쳐져 등록됨

    /**
     *
     * @param {inputLayerSpec} inputLayerSpec
     */
    constructor(inputLayerSpec) {
        this.#mergedLayerCodeElement = Object.assign(
            this.#default_leyerSpec,
            inputLayerSpec
        );

        if (inputLayerSpec) {
            //레이어의 소스 구성
            this.#theSource = this.buildSource()
            if(this.#theSource instanceof Source){
                return this.#theSource;
            }else{
                console.groupCollapsed(`해당 source 객체는 openlayers 인스턴스 아님`);
                console.log(inputLayerSpec);
                console.groupEnd();
                throw new Error(`해당 source 객체는 openlayers 인스턴스 아님`);
            }
        }
    }

    get source() {
        if(!this.#theSource) this.#theSource = this.buildSource();
        return this.#theSource;
    }

    set source(ol_source){
        if(ol_source instanceof Source){
            this.#theSource = ol_source;
        }else{
            throw new Error(`입력한 source 가 Openlayers Source 객체 아님`);
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
        if (this.#isValid_category_source()) {
            try {
                return this.#srcBuilder(
                    this.#mergedLayerCodeElement[KEY.CATEGORY],
                    this.#mergedLayerCodeElement[KEY.SOURCE_TYPE]
                );
            } catch (e) {
                console.groupCollapsed(`openlayers source 객체 생성실패`);
                console.table(this.#mergedLayerCodeElement);
                console.groupEnd();
                throw new Error(`openlayers source 객체 생성실패`);
            } 
        }
    }

    /**
     * 레이어 소스를 만들기 위한 '카테고리' 와 '소스타입' 가 적합한지 확인
     * '카테고리'는 vworld, geoserver 등 gis 데이터를 가져오기위한 약식 출처구분
     * '소스타입' 은 레이어 구성을 위한 소스의 종류를 구분 (vector, xyz, wmts)
     * 
     * 본 클래스 내에서 다룰 수 있는지 여부를 우선으로 판가름함
     * @returns {boolean}
     */
    #isValid_category_source() {
        let bool = false;
        let category, sourceType;

        try {
            category = this.#mergedLayerCodeElement[KEY.CATEGORY]; //vworld, geoserver, emap etc.
            sourceType = this.#mergedLayerCodeElement[KEY.SOURCE_TYPE]; //vector, xyz, wmts etc.
        } catch (e) {
            console.groupCollapsed(`"category" 및 "source_type" 지정안됨`);
            console.table(this.#mergedLayerCodeElement);
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
            console.groupCollapsed(`유효하지 않은 category, sourceType 지정`);
            console.table(this.#mergedLayerCodeElement);
            console.groupEnd();
        }
        return bool;
    }

    /**
     *
     * @param {String} category 카테고리
     * @param {String} sourceType 소스타입
     * @returns {Source}
     */
    #srcBuilder(category, sourceType) {
        let sourceURL;
        let srid;
        if (category == `geoserver` && sourceType == `vector`) {
            let geojson_option;
            
            srid = this.#getValidSrid();
            if(srid) geojson_option(`dataProjection`)=srid;

            sourceURL = this.#urlBuilder_geoserver();
            return new VectorSource({
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

            return new XYZ(sourceOpion);


        } else if (category == `vworld` && sourceType == `wmts`) {
            return this.#srcBuilder_wmts();

        } else {
            console.log(`정의되지 않은 category, sourceType`);
            console.log(category, sourceType);
            throw new Error(`정의되지 않은 category, sourceType`);
        }
    }

    #getValidSrid() {
        let SRID = this.#mergedLayerCodeElement[KEY.SRID];
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
        let origin = this.#mergedLayerCodeElement[KEY.ORIGIN] ||location.origin;
        let pathName = this.#mergedLayerCodeElement[KEY.SOURCE_PATHNAME]; // "/geoserver/waternet/wfs/";
        let returnURL;
        if (pathName) {
            returnURL = new URL(pathName, origin); //origin 은 sourceURL 이 absolute 라면 무시됨
            const typeName = this.#mergedLayerCodeElement[KEY.TYPE_NAME]; // "waternet:WTL_BLSM_AS_YS" etc.

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

            const cqlFilter = this.#mergedLayerCodeElement[KEY.CQL_FILTER];
            if (cqlFilter) {
                paramString.set(`cql_filter`, encodeURIComponent(cqlFilter));
            }
            return returnURL;
        } else {
            console.groupCollapsed(`source URL 이 정의되지 않음`);
            console.log(this.#mergedLayerCodeElement);
            throw new Error(`source URL 이 정의되지 않음`);
        }
    }
    #urlBuilder_vworld_xyz() {
        let origin = this.#mergedLayerCodeElement[this.KEY.ORIGIN] ||location.origin;
        let pathName = this.#mergedLayerCodeElement[KEY.SOURCE_PATHNAME]; // "http://xdworld.vworld.kr:8080/2d/Satellite/service/{z}/{x}/{y}.jpeg";
        if (pathName) {
            return new URL(pathName, origin); //origin 은 sourceURL 이 absolute 라면 무시됨
        } else {
            console.groupCollapsed(`source URL 이 정의되지 않음`);
            console.log(this.#mergedLayerCodeElement);
            throw new Error(`source URL 이 정의되지 않음`);
        }
    }

    /**
     * 
     * @returns 
     */
    #srcBuilder_wmts(){
        if(this.#isValid_apiKey()){
            const typeName = this.#mergedLayerCodeElement[KEY.TYPE_NAME];
            const wmtsConfigTemplate = vworld_compatibilities.replaceAll('{{{ $APIKEY }}}',this.#mergedLayerCodeElement[KEY.APIKEY]);
            const result = new WMTSCapabilities().read(wmtsConfigTemplate);
            let sourceOption;
            if(typeName){
                sourceOption = optionsFromCapabilities(result, {layer:typeName});
                return new WMTS(sourceOption);
            }else{
                console.error(`invalid typeName : ${typeName}`);
                throw new Error(`invalid typeName : ${typeName}`);
            }
        }
        
    }

    #isValid_apiKey(){
        let bool = false;
        let apiKey = this.#mergedLayerCodeElement[KEY.APIKEY];
        if(apiKey){
            //TODO 추가적인 API 키 유효성 검증 로직이 있으면 추가
            bool = true;
        }else{
            console.groupCollapsed(`apiKey 정보가 입력되지 않음`);
            console.log(this.#mergedLayerCodeElement);
            throw new Error (`apiKey 정보가 입력되지 않음`);
        }
        return bool;
    }
}
