import * as KEY from '../common/keyMap';
import { MOFactory } from '../abstract/Factory';
import GeoJSON from 'ol/format/GeoJSON';
import WMTSCapabilities from 'ol/format/WMTSCapabilities';
import WMTS, { optionsFromCapabilities } from 'ol/source/WMTS';
import Source from 'ol/source/Source';
import XYZ from 'ol/source/XYZ';
import VectorSource from 'ol/source/Vector';
import { vworld_compatibilities } from '../common/vworldCompatibilities';

import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';

/**
 * @typedef {object} source_param Openlayers 소스객체 생성 팩토리 초기화 변수
 * @prop {number} [minZoom] 소스차원에서 zoom 설정. 10으로 정하면 view가 11로 확대되어도 레이어를 요청하지 않음(ol.source.XYZ 만 해당)
 * @prop {string} [viewSrid] 뷰포트의 기준 좌표계
 */
interface SourceParam {
    minZoom?: number;
    viewSrid?: string;
    crossOrigin?: string;
    [key: string]: any;
}

/**
 * DB 에 있는 자료를 개별 레이어의 ol/source 로 구성하는 클래스.
 * (원래는 이 클래스가 Abstact Class 화 되어 WMTSSourceFactory 등으로 구현되었어야 함)
 * @export
 * @class MOSourceConfig
 * @author jhoh
 */
export class SourceFactory extends MOFactory {

    private default_sourceSpec: SourceParam = {
        // strategy : LoadingStrategy,//loading strategy. out of : all, bbox, tile
        crossOrigin: 'anonymous', //XYZ
        minZoom: 19, //XYZ
        viewSrid: KEY.SRID_TILE_VWORLD,
    };


    INSTANCE_ol_Source: Source | undefined; //생성자에 입력된 내용이 default 와 합쳐져 등록됨

    /**
     * Creates an instance of SourceFactory.
     * @param par 소스팩토리 생성을 위한 object
     * @memberof SourceFactory
     */
    constructor(par?: SourceParam) {
        super();
        Object.assign(this.default_sourceSpec, par);

        //EPSG:5181,5186 초기등록
        proj4.defs("EPSG:5186", "+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs");
        proj4.defs("EPSG:5181", "+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +units=m +no_defs");
        register(proj4);
    }

    getSource(): Source | undefined {
        if (!this.INSTANCE_ol_Source) {
            try {
                this.INSTANCE_ol_Source = this.buildSource();
            } catch (e) {
                console.error(e);
                return undefined;
            }
        }
        if (this.INSTANCE_ol_Source instanceof Source) {
            return this.INSTANCE_ol_Source;
        } else {
            console.groupCollapsed(`해당 source 객체는 openlayers 인스턴스 아님`);
            console.log(this.getSpec());
            console.groupEnd();
            throw new Error(`해당 source 객체는 openlayers 인스턴스 아님`);
        }
    }

    /**
     * 동적으로 feature 를 추가하기위해 vector Source 를 발행함 (주소검색용)
     * @param param
     * @returns {VectorSource}
     */
    getSimpleVectorSource(param?: SourceParam): VectorSource {
        const tempSpec = Object.assign({}, this.default_sourceSpec, param);
        return new VectorSource(tempSpec as any);
    }


    /**
     * 초기화
     */
    resetFactory(): void {
        super.resetFactory();
        this.INSTANCE_ol_Source = undefined;
    }

    /**
     * 사용할 수 있는 Openlayers source 객체의 url 을 구성함
     *
     * @return Openlayers source 파라미터로 사용할 수 있는 URL 폼
     * @memberof MOSourceConfig
     */
    private buildSource(): Source | undefined {
        if (this.isValid_category_source()) {
            if (this.getSpec()[KEY.SOURCE_CATEGORY] == KEY.VIRTUAL_SOURCE_LAYER_KEY) {
                return this.getSimpleVectorSource();
            }
            try {
                return this.srcBuilder(
                    this.getSpec()[KEY.SOURCE_CATEGORY] as string,
                    this.getSpec()[KEY.SOURCE_CLASS] as string
                );
            } catch (e) {
                console.error(e);
                console.groupCollapsed(`openlayers source 객체 생성실패`);
                console.table(this.getSpec());
                console.groupEnd();
                throw new Error(`openlayers source 객체 생성실패`);
            }
        }
        return undefined;
    }

    /**
     * 레이어 소스를 만들기 위한 '카테고리' 와 '소스타입' 가 적합한지 확인
     * '카테고리'는 vworld, geoserver 등 gis 데이터를 가져오기위한 약식 출처구분
     * '소스타입' 은 레이어 구성을 위한 소스의 종류를 구분 (vector, xyz, wmts)
     *
     * 본 클래스 내에서 다룰 수 있는지 여부를 우선으로 판가름함
     * @returns
     */
    isValid_category_source(): boolean {
        let bool = false;
        const category = this.getSpec()[KEY.SOURCE_CATEGORY]; //vworld, geoserver, emap etc.
        const sourceClass = this.getSpec()[KEY.SOURCE_CLASS]; //vector, xyz, wmts etc.
        //가상 레이어일 때
        if (category == KEY.VIRTUAL_SOURCE_LAYER_KEY) {
            return true;
        }

        if (!(category && sourceClass)) {
            console.groupCollapsed(`"category" 및 "source_type" 지정안됨`);
            console.table(this.getSpec());
            console.groupEnd();
            return false;
        }

        //현재는 이 도메인과 소스타입으로만 구성중임
        const AVAILABLE_CATEGORY_SOURCE = [
            { category: `vworld`, sourceClass: `wmts` },
            { category: `vworld`, sourceClass: `xyz` },
            { category: `geoserver`, sourceClass: `geojson` },
            { category: `geoserver`, sourceClass: `vector` },
        ];

        bool = AVAILABLE_CATEGORY_SOURCE.some(
            (e) => e.category == category && e.sourceClass == sourceClass
        );
        if (!bool) {
            console.groupCollapsed(`유효하지 않은 category, sourceClass 지정`);
            console.table(this.getSpec());
            console.groupEnd();
        }
        return bool;
    }

    /**
     *
     * @param category 카테고리
     * @param sourceClass 소스타입
     * @returns
     */
    srcBuilder(category: string, sourceClass: string): Source {
        if (category == `geoserver` && sourceClass == `vector`) {
            return this.srcBuilder_vector();

        } else if (category == `vworld` && sourceClass == `xyz`) {

            return this.srcBuilder_xyz();

        } else if (category == `vworld` && sourceClass == `wmts`) {
            return this.srcBuilder_wmts();
        } else {
            console.log(`정의되지 않은 category, sourceClass`);
            console.log(category, sourceClass);
            throw new Error(`정의되지 않은 category, sourceClass`);
        }
    }

    private getValidSrid(): string | undefined {
        let SRID = this.getSpec()[KEY.SRID] as string | undefined;
        if (SRID) {
            //SRID == 'EPSG:5181' <--- 콜론 포함 이 형태가 되어야 함
            //SRID == 'EPSG4326'
            //SRID == '4326'
            SRID = SRID.trim();
            if (SRID.startsWith(`EPSG:`)) {
                // already valid
            } else if (SRID.includes(`EPSG`)) {
                SRID = `EPSG:` + SRID.split(`EPSG`)[1];
            } else if (/^\d+$/.test(SRID)) {
                //숫자로만 이뤄져있나
                SRID = `EPSG:` + SRID;
            } else {
                throw new Error(`SRID 가 유효하지 않음 : ${SRID}`);
            }
            return SRID;
        }
        return undefined;
    }

    /**
     *
     * @returns URL
     */
    private urlBuilder_geoserver(): URL {
        const origin = (this.getSpec()[KEY.ORIGIN] as string) ?? location.origin;
        const pathName = this.getSpec()[KEY.SOURCE_PATHNAME] as string; // "/geoserver/waternet/wfs/";
        let returnURL: URL;
        if (pathName) {
            returnURL = new URL(pathName, origin); //origin 은 sourceURL 이 absolute 라면 무시됨
            const typeName = this.getSpec()[KEY.TYPE_NAME] as string; // "waternet:WTL_BLSM_AS_YS" etc.
            const paramString = new URLSearchParams();
            //WFS getFeature v2.0.0 공통 request
            //https://docs.geoserver.org/2.23.x/en/user/services/wfs/reference.html#getfeature
            paramString.set("service", "wfs");
            paramString.set("request", "getFeature");
            paramString.set("version", "2.0.0");
            paramString.set("typeName", typeName); // :, %, & 등 특수기호들 uri 유효 형식으로 변환
            paramString.set(`outputFormat`, `application/json`);
            const cqlFilter = this.getSpec()[KEY.CQL_FILTER] as string | undefined;
            if (cqlFilter) {
                paramString.set(`cql_filter`, cqlFilter);
            }

            // paramString.set('srsName','EPSG:3857');

            returnURL.search = paramString.toString();

            return returnURL;
        } else {
            console.groupCollapsed(`source URL 이 정의되지 않음`);
            console.log(this.getSpec());
            throw new Error(`source URL 이 정의되지 않음`);
        }
    }

    private urlBuilder_vworld_xyz(): URL {
        const origin = (this.getSpec()[KEY.ORIGIN] as string) ?? location.origin;
        const pathName = this.getSpec()[KEY.SOURCE_PATHNAME] as string; // "http://xdworld.vworld.kr:8080/2d/Satellite/service/{z}/{x}/{y}.jpeg";
        if (pathName) {
            return new URL(pathName, origin); //origin 은 sourceURL 이 absolute 라면 무시됨
        } else {
            console.groupCollapsed(`source URL 이 정의되지 않음`);
            console.log(this.getSpec());
            throw new Error(`source URL 이 정의되지 않음`);
        }
    }

    /**
     * vworld WebMapTileService 의 getCompatibilities 방식을 사용한 MapTile 소스 빌드
     * 2023-12월 기준 vworld getCompatibilities 내용을 미리 저장해 놓고 APIKEY 만 교체해서 사용하고 있음
     */
    srcBuilder_wmts(): WMTS {
        if (this.isValid_apiKey()) {
            const typeName = this.getSpec()[KEY.TYPE_NAME] as string;
            const wmtsConfigTemplate = vworld_compatibilities.replaceAll('{{{ $APIKEY }}}', this.getSpec()[KEY.APIKEY] as string);
            const result = new WMTSCapabilities().read(wmtsConfigTemplate);
            let sourceOption: any;
            if (typeName) {
                sourceOption = optionsFromCapabilities(result, { layer: typeName });
                return new WMTS(sourceOption);
            } else {
                console.error(`invalid typeName : ${typeName}`);
                throw new Error(`invalid typeName : ${typeName}`);
            }
        }
        throw new Error(`apiKey 유효성 검증 실패`);
    }


    srcBuilder_vector(userSrid?: string): VectorSource {
        const geojson_option: Record<string, any> = {};

        const srid = userSrid || this.getValidSrid();
        let geoUrl: URL | undefined;
        try {
            geoUrl = this.urlBuilder_geoserver();
        } catch (e) {
            console.error(e);
        }
        if (srid) {
            geojson_option[`dataProjection`] = srid;
            geojson_option[`featureProjection`] = this.default_sourceSpec.viewSrid;
        }
        let vectorOption: Record<string, any> | undefined;
        try {
            vectorOption = {
                format: new GeoJSON(geojson_option),
                url: geoUrl!.toString(),
            };
        } catch (e) {
            console.log(e);
        }
        vectorOption = Object.assign({}, this.default_sourceSpec, vectorOption);
        let vectorSource: VectorSource | undefined;
        try {
            vectorSource = new VectorSource(vectorOption);
        } catch (e) {
            console.error(e);
        } finally {
            return vectorSource!;
        }
    }

    /** 구 xyz 소스 */
    srcBuilder_xyz(): XYZ {
        let sourceOption: Record<string, any> = {
            url: this.urlBuilder_vworld_xyz(),
            maxZoom: 19,
            crossOrigin: 'anonymous',
        };
        const srid = this.getValidSrid();
        if (srid) sourceOption[`projection`] = srid;
        sourceOption = Object.assign({}, this.default_sourceSpec, sourceOption);

        return new XYZ(sourceOption);
    }

    private isValid_apiKey(): boolean {
        let bool = false;
        const apiKey = this.getSpec()[KEY.APIKEY];
        if (apiKey) {
            //TODO 추가적인 API 키 유효성 검증 로직이 있으면 추가
            bool = true;
        } else {
            console.groupCollapsed(`apiKey 정보가 입력되지 않음`);
            console.log(this.getSpec());
            throw new Error(`apiKey 정보가 입력되지 않음`);
        }
        return bool;
    }
}
