import * as KEY from '../common/MO.keyMap.js';
import { SourceFactory } from "./MO.SourceFactory.js";
import TileArcGISRest from "../../lib/openlayers_v7.5.1/source/TileArcGISRest.js";
import VectorSource from '../../lib/openlayers_v7.5.1/source/Vector.js';
import Feature from '../../lib/openlayers_v7.5.1/Feature.js';
import Source from '../../lib/openlayers_v7.5.1/source/Source.js';
import WKT from '../../lib/openlayers_v7.5.1/format/WKT.js';

/**
 * 내부망 non-geoserver 환경에서 ol.source 객체를 생성하기 위한 메서드 추가
 * 범용적인 SourceFactory 보다는 프로젝트 연관성이 짙은 메서드를 따로 빼기 위함
 */
export class SourceFactoryIntra extends SourceFactory {
	
	
	 isValid_category_source() {
        let bool = false;
        let category = this.getSpec()[KEY.SOURCE_CATEGORY]; //vworld, geoserver, emap,virtual etc.
        let sourceClass = this.getSpec()[KEY.SOURCE_CLASS]; //vector, xyz, wmts etc.
        //가상 레이어일 때
        if(category == KEY.VIRTUAL_SOURCE_LAYER_KEY){
            return true;
        }

        if(!(category && sourceClass)){
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
            { category: `intra`, sourceClass: `vector` },
            { category: `intra`, sourceClass: `arcgis` },
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
     * @param {String} category 카테고리
     * @param {String} sourceClass 소스타입
     * @returns {Source}
     */
    srcBuilder(category, sourceClass) {
        if (category == `geoserver` && sourceClass == `vector`) {
            return this.srcBuilder_vector();
        } else if (category == `vworld` && sourceClass == `xyz`) {
            return this.srcBuilder_xyz();
        } else if (category == `vworld` && sourceClass == `wmts`) {
            return this.srcBuilder_wmts();
        } else if (category == `intra` && sourceClass == `arcgis`) { //내부망 arcGis 타일맵 서버 대응
            return this.srcBuilder_arcGis();
        } else if (category == `intra` && sourceClass == `vector`) { //geoserver 거치지 않고 wkt feature 파싱
        
            return this.srcBuilder_wktFeature();
        } else {
            console.log(`정의되지 않은 category, sourceClass`);
            console.log(category, sourceClass);
            throw new Error(`정의되지 않은 category, sourceClass`);
        }
    }
    
    /** 내부망 arcGis 타일맵 요청 소스 빌드 */
    srcBuilder_arcGis(){
		return new TileArcGISRest({
			url:`${this.getSpec()[KEY.ORIGIN]}${this.getSpec()[KEY.SOURCE_PATHNAME]}`,
		})
	}
	
	/** WKT 방식 feature 파싱. non-geoserver getFeatures method 
	 * @param {KEY.layerCodeObj} layerCodeObject    
	*/
	srcBuilder_wktFeature(layerCodeObject){
        const src = layerCodeObject ?? this.getSpec();
        const origin = src[KEY.ORIGIN] ?? location.origin;
        const pathname = src[KEY.SOURCE_PATHNAME];
        
        //! WAS서버에 이 url을 처리할 수 있는 로직이 있는지 확인할 것
        let returnURL = new URL(`${ctxPath+pathname}`,origin); //contextPath 추가
        const typeName = src[KEY.TYPE_NAME];
        let cqlFilter = src[KEY.CQL_FILTER] ??'';
        
        //arcLayerId 의 cqlFilter 화
        const arcLayerId = src[KEY.ARC_LAYER_ID];
        
//        if(arcLayerId){
//			cqlFilter += this.#querializeForWASapi(arcLayerId);
//		}
        
        const srid = src[KEY.SRID];
        
        /** @type {VectorSource} */
        let returnSource;
//        let paramString = new URLSearchParams({
//			typeName:typeName,
//			cqlFilter:cqlFilter ??'',
//			arcLayerId:arcLayerId ?? ''
//		});
        let paramString = new URLSearchParams();
        paramString.set(KEY.TYPE_NAME,typeName);
        if(cqlFilter) paramString.set(KEY.CQL_FILTER,cqlFilter);
        if(arcLayerId) paramString.set(KEY.ARC_LAYER_ID,arcLayerId);
        returnURL.search = paramString;
        
       //console.log(returnURL);
		
		try{
	        returnSource = new VectorSource({
	            format: new WKT(),
	            // 참고 : https://openlayers.org/en/v7.5.2/apidoc/module-ol_source_Vector-VectorSource.html
	            /* 		wkt::readFeatures 는 geom 컬럼만으로 Feature 객체 반환
	            		wkt::readGeometry 는 geom 컬럼으로 Geometry 객체 반환
	            */
				loader:function(extent, resolution, projection, success, failure){
					const proj = projection.getCode();
	                fetch(returnURL,{method:'get', headers:{"x-requested-with":'XMLHttpRequest'}})
	                .then(res=>res.ok ? res.json() : Promise.reject(`getWktFeatures 응답에러`))
	                .catch(console.error)
	                .then(res=>res['features'])
	                .then(wktFeatures=>{
						let featureArr = [];
						if(wktFeatures instanceof Array){
							const KEY_GEOMETRY_COLUMN = 'GEOMETRY'; // WAS에서 지정한 wkt 요소의 컬럼명
							const formatt = returnSource.getFormat();
							wktFeatures.forEach(wktFeature=>{
								let geomColumn = wktFeature[KEY_GEOMETRY_COLUMN]; // 'POINT(....)' 등 wkt 형식 요소
								wktFeature.geometry= formatt.readGeometry(geomColumn,{dataProjection:srid, featureProjection:proj});
								featureArr.push(new Feature(wktFeature));
							}); 
						}else{
							console.log(`vectorSource 에 feature 없음`);
							failure(featureArr)
						}
	                    returnSource.addFeatures(featureArr);
	                    success(featureArr);
	                });
				}
	        });
//	        console.log(returnSource)
		}catch(e){
			console.log(e);
		}
        if(returnSource) return returnSource;
        else return new Error(`wkt 부적합`);
	}
	
	/**
	 * layerCodeObj 속성 중 하나인 arcLayerId 를 cqlFilter 요소로 변경시키는 로직
	 * @param {string} arcLayerId
	 * @returns {string} 
	 * @deprecated
	 */
	#querializeForWASapi(arcLayerId){
		let returnString = '';
		if(arcLayerId.includes(',')){
			const tempStr = arcLayerId.split(',').map(el=>`'${el.trim()}'`).join(',');
			returnString += ` LAYER_ID IN (${tempStr})`;
		}else{
			returnString += ` LAYER_ID='${arcLayerId}'`;
		}
		return returnString;
	}
	
}