import * as KEY from '../common/MO.keyMap.js';
import { LayerFactory } from './MO.LayerFactory.js';

import VectorLayer from '../../lib/openlayers_v7.5.1/layer/Vector.js';
import VectorImageLayer from '../../lib/openlayers_v7.5.1/layer/VectorImage.js';
import Source from '../../lib/openlayers_v7.5.1/source/Source.js';
import VectorSource from '../../lib/openlayers_v7.5.1/source/Vector.js';

/**
 * ol.layer.Vector 끼리만 zIndex + declutter 효과 같이 적용되기 때문에 
 * 해당 레이어들에만 적용
 *
 * @class 
 * @author jhoh
 */
export class LayerFactoryDeclutter extends LayerFactory{

     /**Openlayers 라이브러리의 Layer 객체에서 사용하는 키 값  */
    #default_leyerSpec = {
        zIndex: 5,
        opacity: 1, //
        minZoom: undefined, // 설정된 줌 보다 멀리 떨어지면 레이어 비활성
        visible : true, //보임 or 보이지 않음
        className: undefined, //'ol-layer',
        extent:undefined, //[minX, minY, maxX, maxY] 로 표현된 영역만 표현
        declutter: false, //VectorImage 한정. 요소들 모여있을 때 하나만 표시 여부
        properties:{
            id:undefined,
            typeName:undefined,
            isBase:false,
        },
    };

	declutterLayerTypeNames = []; 

	/**
	 * @typedef {object} layer_param 레이어팩토리 옵션 
     * @property {boolean} [declutter] 서로겹침허용 여부
     * @property {boolean} [visible] 레이어 초기 보임여부 
     * @property {boolean} [isBase] 기본 배경 레이어로서 사용될지 여부 
     * @property {number} [opacity] 투명도. 0~1 범위 소숫점 가능
     * @property {number} [minZoom] 설정된 줌 보다 멀리 떨어지면 레이어 비활성
     * @property {number} [zIndex] 레이어들이 서로 겹쳐있을 때 숫자가 클수록 위쪽에 위치 (다른 레이어 가림)
	 * 
	 */

	/**
	 * declutter 구현할 typeName 등록
	 * @param {string | Array<String>} typeNames 레이어 type_name 한개 또는 배열
	 */
	setDeclutterLayerTypeNames (typeNames){
		if(typeNames instanceof Array){
			this.declutterLayerTypeNames=this.declutterLayerTypeNames.concat(typeNames);			
		}else{
			this.declutterLayerTypeNames.push(typeNames);
		}
		this.declutterLayerTypeNames = [...new Set(this.declutterLayerTypeNames)];
	}


//	/**
//     * 레이어 팩토리 생성
//     * @param {layer_param} default_param 
//     * @memberof LayerFactory
//     */
//    constructor(default_param){
//        super();
//        Object.assign(this.#default_leyerSpec, default_param);
//    }

	setSource(sourceInstance){
        if(this.isValid_ol_Source(sourceInstance)){
//			this.resetFactory();
            this.INSTANCE_ol_Source = sourceInstance;
        }else{
            console.error(`입력된 레이어 소스설정 인스턴스가 적합하지 않음`)
            console.log(sourceInstance)
            throw new Error (`입력된 레이어 소스설정 인스턴스가 적합하지 않음`);
        }
    }
    
    /**
	 * declutter 용 레이어 만든다
	 * @param {layer_param} paramm layer parameter
     * @returns {VectorLayer}
	 */
	getVectorLayer(paramm){
		let tempSpec = Object.assign({},this.#default_leyerSpec,paramm)
		return new VectorLayer(tempSpec);
	};
    
    /** default Object에 source Object 를 합치되,
     *  nullish 들은 제외시킴
     *   */ 
    #getUpatedLayerCode(){
        let src = this.getSpec();
        let returnLayerCode = structuredClone(this.#default_leyerSpec);

        returnLayerCode.zIndex = src[KEY.Z_INDEX] ?? this.#default_leyerSpec.zIndex;
        returnLayerCode.minZoom = src[KEY.MIN_ZOOM] ?? this.#default_leyerSpec.minZoom;
        returnLayerCode.declutter = src[KEY.BOOL_DECLUTTER] ? true : this.#default_leyerSpec.declutter;
        // returnLayerCode.properties.id = src[KEY.LAYER_ID] ?? this.#default_leyerSpec.properties.id;
        // returnLayerCode.properties.typeName = src[KEY.TYPE_NAME] ?? this.#default_leyerSpec.properties.typeName;
        // returnLayerCode.properties.isBase = src[KEY.LAYER_GEOMETRY_TYPE].toUpperCase()==='BASE' ? true:false;
        returnLayerCode.properties = src;
        return this.filterNullishVals(returnLayerCode);
    }

    /**
     * Source 인스턴스에 따라 레이어를 생성해 반환
     * default layer 특성에 layerCode 의 내용을 합쳐 생성 parameter로 삼음
     * @returns {Layer}
     */
    layerBuilder(){
        let updatedOption = this.#getUpatedLayerCode();
        if(this.INSTANCE_ol_Source instanceof Source){
            updatedOption['source']=this.INSTANCE_ol_Source;
        }else{
            throw new Error(`layerBuilder 직전 Source 가 적합하지 않음`)
        }
        let returnlayer;
        try{
            //1. declutter 용
            if (this.declutterLayerTypeNames.includes(this.getSpec()[KEY.TYPE_NAME] )){
				returnlayer = this.getVectorLayer(updatedOption);
			}
            //2. 기본레이어
            else if (this.getSpec()[KEY.SOURCE_CATEGORY]==KEY.VIRTUAL_SOURCE_LAYER_KEY){
                returnlayer = this.getSimpleVectorLayer();
            }
    
            //3. VectorImage 레이어용
            else if (this.INSTANCE_ol_Source instanceof VectorSource){
                returnlayer = new VectorImageLayer(updatedOption);
            }
        } catch(e){
            console.log(`레이어 생성 실패 #layerBuilder`);
            console.error(e);
        }
        return returnlayer;
    }

}