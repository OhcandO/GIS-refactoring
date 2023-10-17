import * as KEY from '../MO.keyMap.js';
import { SourceFactory } from "./MO.SourceFactory";
import WMTS from '../../lib/openlayers_v7.5.1/source/WMTS.js';
import Source from '../../lib/openlayers_v7.5.1/source/Source.js';
import XYZ from '../../lib/openlayers_v7.5.1/source/XYZ.js';
import VectorSource  from '../../lib/openlayers_v7.5.1/source/Vector.js';
import Layer from '../../lib/openlayers_v7.5.1/layer/Layer.js';
import TileLayer from '../../lib/openlayers_v7.5.1/layer/Tile.js';
import {MOFactory} from './MO.Factory.js';
import VectorImageLayer from '../../lib/openlayers_v7.5.1/layer/VectorImage.js';

/**
 * MOSourceConfig 인스턴스로 Openlayers Layer 객체를 생산하는 객체
 *
 * @class LayerFactory
 * @author jhoh
 */
export class LayerFactory extends MOFactory{

    /**Openlayers 라이브러리의 Layer 객체에서 사용하는 키 값  */
    #default_leyerSpec = {
        id:undefined,
        zIndex: 5,
        opacity: 1, //투명도. 0~1 범위 소숫점 가능
        minZoom: undefined, // 설정된 줌 보다 멀리 떨어지면 레이어 비활성
        visible : true, //보임 or 보이지 않음
        className: 'ol-layer',
        extent:undefined, //[minX, minY, maxX, maxY] 로 표현된 영역만 표현
        declutter: false, //VectorImage 한정. 요소들 모여있을 때 하나만 표시 여부
    };

    #INSTANCE_ol_Source;
    #INSTANCE_olLayer;

    constructor(default_param){
        super();
        Object.assign(this.#default_leyerSpec, default_param);
    }

    resetFactory(){
        super.resetFactory();
        this.#INSTANCE_ol_Source = undefined;
        this.#INSTANCE_olLayer = undefined;
    }

    setSource(sourceInstance){
        if(this.#isValid_ol_Source(sourceInstance)){
            this.#INSTANCE_ol_Source = sourceInstance;
        }else{
            console.error(`입력된 레이어 소스설정 인스턴스가 적합하지 않음`)
            console.log(sourceInstance)
            throw new Error (`입력된 레이어 소스설정 인스턴스가 적합하지 않음`);
        }
    }

    getLayer(){
        if(!this.#INSTANCE_olLayer) this.#INSTANCE_olLayer = this.#layerBuilder();
        if(this.#INSTANCE_olLayer instanceof Layer){
            return this.#INSTANCE_olLayer;
        }else{
            console.groupCollapsed(`해당 layer 객체는 openlayers Layer 인스턴스 아님`);
            console.log(this.#INSTANCE_olLayer);
            console.groupEnd();
            throw new Error(`해당 layer 객체는 openlayers Layer 인스턴스 아님`);
        }
    }

    #isValid_ol_Source(sourceInstance){
        let bool = false;
        if(sourceInstance instanceof Source){
            bool = true;
        }else{
            bool = false;
        }
        return bool;
    }
    /** default Object에 source Object 를 합치되,
     *  Default Object Key 들만 수행
     *  결과적으로 Default Object의 키만 유효하게 남음 */ 
    // #getDefaultMergedObject(default_obj, source_obj){
    //     return Object.entries(default_obj).reduce((pre,[key,val])=>(pre[key]=source_obj[key]?source_obj[key]:val, pre),{});
    // }    
    /**
     * Source 인스턴스에 따라 레이어를 생성해 반환
     * default layer 특성에 layerCode 의 내용을 합쳐 생성 parameter로 삼음
     * @returns {Layer}
     */
    #layerBuilder(){
        let tileOption=super.getDefaultMergedObject(this.#default_leyerSpec, super.getSpec());
        let returnlayer;
        try{

            //1. 배경지도용 WMTS 소스
            if(this.#INSTANCE_ol_Source instanceof WMTS){
                returnlayer = new TileLayer(tileOption);
            }
    
            //2. 배경지도용 XYZ 소스
            else if (this.#INSTANCE_ol_Source instanceof XYZ){
                returnlayer = new TileLayer(tileOption)
            }
    
            //3. VectorImage 레이어용
            else if (this.#INSTANCE_ol_Source instanceof VectorSource){
                returnlayer = new VectorImageLayer(tileOption);
            }
        } catch(e){
            console.log(`레이어 생성 실패 #layerBuilder`);
            console.error(e);
        }
        return returnlayer;
    }

}