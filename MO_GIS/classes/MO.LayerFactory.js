import * as KEY from '../common/MO.keyMap.js';
import {MOFactory} from './abstract/MO.Factory.js';
import WMTS from '../../lib/openlayers_v7.5.1/source/WMTS.js';
import Source from '../../lib/openlayers_v7.5.1/source/Source.js';
import XYZ from '../../lib/openlayers_v7.5.1/source/XYZ.js';
import VectorSource  from '../../lib/openlayers_v7.5.1/source/Vector.js';
import Layer from '../../lib/openlayers_v7.5.1/layer/Layer.js';
import TileLayer from '../../lib/openlayers_v7.5.1/layer/Tile.js';
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



    #INSTANCE_ol_Source;
    #INSTANCE_olLayer;

	/**
     * 레이어 팩토리 생성
     * @param {object} [default_param] 레이어팩토리 옵션 
     * @param {boolean} [default_param.declutter] 서로겹침허용 여부
     * @param {boolean} [default_param.visible] 레이어 초기 보임여부 
     * @param {boolean} [default_param.isBase] 기본 배경 레이어로서 사용될지 여부 
     * @param {number} [default_param.opacity] 투명도. 0~1 범위 소숫점 가능
     * @param {number} [default_param.minZoom] 설정된 줌 보다 멀리 떨어지면 레이어 비활성
     * @param {number} [default_param.zIndex] 레이어들이 서로 겹쳐있을 때 숫자가 클수록 위쪽에 위치 (다른 레이어 가림)
     * @memberof LayerFactory
     */
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
//        if(this.#INSTANCE_olLayer instanceof ol.Layer){
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
//        if(sourceInstance instanceof ol.source.Source){
            bool = true;
        }else{
            bool = false;
        }
        return bool;
    }
    
    getValids(){
        let src = this.layerCode;
        let temp = {
            id: src[KEY.LAYER_ID] ?? this.#default_leyerSpec.id,
            zIndex: src[KEY.Z_INDEX] ?? this.#default_leyerSpec.zIndex,
            minZoom: src[KEY.MIN_ZOOM] ?? this.#default_leyerSpec.minZoom,
            visible : src[KEY.BOOL_VISIBLE] ?? this.#default_leyerSpec.visible,
        
            opacity: this.#default_leyerSpec.id,
            className: this.#default_leyerSpec.className,
            extent: this.#default_leyerSpec.extent,
            declutter: this.#default_leyerSpec.declutter
        };
        return this.filterNullishVals(temp);
    }

    /** default Object에 source Object 를 합치되,
     *  nullish 들은 제외시킴
     *   */ 
    #upateLayerCode(){
        let src = this.layerCode;
        this.#default_leyerSpec.zIndex = src[KEY.Z_INDEX] ?? this.#default_leyerSpec.zIndex;
        this.#default_leyerSpec.minZoom = src[KEY.MIN_ZOOM] ?? this.#default_leyerSpec.minZoom;
        this.#default_leyerSpec.visible = src[KEY.BOOL_VISIBLE]?.toUpperCase()==='Y' ? true:false;
        
        this.#default_leyerSpec.properties.id = src[KEY.LAYER_ID] ?? this.#default_leyerSpec.properties.id;
        this.#default_leyerSpec.properties.typeName = src[KEY.TYPE_NAME] ?? this.#default_leyerSpec.properties.typeName;
        this.#default_leyerSpec.properties.isBase = src[KEY.LAYER_GEOMETRY_TYPE]?.toUpperCase()==='BASE' ? true:false;

        this.#default_leyerSpec = this.filterNullishVals(this.#default_leyerSpec);
    }

    /**
     * Source 인스턴스에 따라 레이어를 생성해 반환
     * default layer 특성에 layerCode 의 내용을 합쳐 생성 parameter로 삼음
     * @returns {Layer}
     */
    #layerBuilder(){
        this.#upateLayerCode();        
        
        if(this.#INSTANCE_ol_Source instanceof Source){
//        if(this.#INSTANCE_ol_Source instanceof ol.source.Source){
            this.#default_leyerSpec['source']=this.#INSTANCE_ol_Source;
        }else{
            throw new Error(`layerBuilder 직전 Source 가 적합하지 않음`)
        }
        let returnlayer;
        try{
            //1. 배경지도용 WMTS 소스
            if(this.#INSTANCE_ol_Source instanceof WMTS){
//            if(this.#INSTANCE_ol_Source instanceof ol.source.WMTS){
                returnlayer = new TileLayer(this.#default_leyerSpec);
//                returnlayer = new ol.layer.Tile(this.#default_leyerSpec);
            }
    
            //2. 배경지도용 XYZ 소스
            else if (this.#INSTANCE_ol_Source instanceof XYZ){
//            else if (this.#INSTANCE_ol_Source instanceof ol.source.XYZ){
                returnlayer = new TileLayer(this.#default_leyerSpec)
//                returnlayer = new ol.layer.Tile(this.#default_leyerSpec)
            }
    
            //3. VectorImage 레이어용
            else if (this.#INSTANCE_ol_Source instanceof VectorSource){
//            else if (this.#INSTANCE_ol_Source instanceof ol.source.Vector){
                returnlayer = new VectorImageLayer(this.#default_leyerSpec);
//                returnlayer = new ol.layer.VectorImage(this.#default_leyerSpec);
            }
        } catch(e){
            console.log(`레이어 생성 실패 #layerBuilder`);
            console.error(e);
        }
        return returnlayer;
    }

}