import * as KEY from '../MO.keyMap.js';
import Control from "../../lib/openlayers_v7.5.1/control/Control.js";
import Map from '../../lib/openlayers_v7.5.1/Map.js'
import View from '../../lib/openlayers_v7.5.1/View.js'
import VectorImageLayer from '../../lib/openlayers_v7.5.1/layer/VectorImage.js'
import { LayerTree } from "./MO.LayerTree.js";
import { MOFactory } from "./MO.Factory.js";
import { SourceFactory } from "./MO.SourceFactory.js";
import { LayerFactory } from "./MO.LayerFactory.js";

/**
 * ol.Map 확장하고 지도와 레이어 생성을 관장하는 Controller 역할수행
 *
 * @export
 * @class MOGISMap
 * @extends {Map}
 */
export class MOGISMap extends Map {
    default_viewSpec = {
        /**
         * Openlayers 뷰 포트 객체가 표현하는 좌표계.
         * 배경지도의 원본 좌표계를 설정해 이미지가 열화 없이 표출되도록 함
         * @default 'EPSG:4326' vworld 배경지도 좌표계
         * @memberof MOMapConfig
         */
        projection: `EPSG:3857`, //google map projected Pseudo-Mercator coordinate system. Also Vworld basemap coordinate
        /** mindone */
        center: [127.043879, 37.482099],
        enableRotation: false,
    };

    default_mapSpec = {
        /** Map 이 생성될 기본 DIV id */
        target: "map",
    };

    #INSTANCE_OL_VIEW;
    #INSTANCE_OL_MAP;
    #INSTANCE_LAYERTREE;
    
    #Factory={
        source:undefined,
        style:undefined,
        layer:undefined,
    }
    #LayerFactory;
    #SourceFactory;

    /**
     * 입력한 변수들을 Map 또는 View 객체 생성을 위한 변수로 할당
     * @param {Object} mapConfigSpec Map 또는 View 객체 생성을 위한 key-value Object
     */
    constructor(mapConfigSpec) {
        if (mapConfigSpec instanceof Object) {
            Object.entries(mapConfigSpec).forEach(([key, val]) => {
                if (this.default_mapSpec[key]) this.default_mapSpec[key] = val;
                if (this.default_viewSpec[key]) this.default_viewSpec[key] = val;
            });
        }
        // 결과로서 Map 객체를 반환
    }

    get map() {
        if (!this.#INSTANCE_OL_MAP) {
            this.#INSTANCE_OL_MAP = super({
                target: this.default_mapSpec.target,
                view: this.view,
            });
        }
        return this.#INSTANCE_OL_MAP;
    }

    get view() {
        if (!this.#INSTANCE_OL_VIEW) {
            this.#INSTANCE_OL_VIEW = new View(this.default_viewSpec);
        }
        return this.#INSTANCE_OL_VIEW;
    }

    set view(view_inst) {
        if (view_inst instanceof View) {
            this.#INSTANCE_OL_VIEW = view_inst;
        } else {
            console.log(view_inst);
            throw new Error(`Openlayers 뷰 인스턴스가 아님`);
        }
    }

    /**
     * @param {LayerTree} tree_instrance
     */
    set tree(tree_instrance) {
        if (tree_instrance instanceof LayerTree) {
            this.#INSTANCE_LAYERTREE = tree_instrance;
        }
    }
    get tree() {
        if (this.#INSTANCE_LAYERTREE) return this.#INSTANCE_LAYERTREE;
        else {
            console.error(`LayerTree 객체 생성되지 않음`);
        }
    }

    /**
     * MOFactory subClass 를 등록 (레이어 Factory, 소스 Factory);
     *
     * @param {MOFactory} factory
     * @memberof MOGISMap
     */
    setFactory(factory){
        if(factory instanceof MOFactory){

            if(factory instanceof SourceFactory){
                this.#Factory.source = factory;
            }else if (factory instanceof LayerFactory){
                this.#Factory.layer = factory;
            }
            //TODO StyleFactory 들어가야 함
        }else{
            console.log(factory);
            throw new Error (`입력된 Factory가 적합한 인스턴스 아님`);
        }
    }

    #isValid_factories(){
        let bool = false;
        // Factory 에 등록된 모든 요소들이 MOFactory 의 서브클래스인지 확인
        bool = Object.values(this.#Factory).every(fac=>fac instanceof MOFactory);
        return bool;
    }
    /* ===================================
    =======레이어 생성 관련 ============= 
    =====================================*/
    #ERROR_factory(){
        let notAssignedFactoryKeyArr = Object.keys(this.#Factory).filter(key=>!this.#Factory[key]);
        console.error(`다음 Factory들이 정의되지 않음 : ${notAssignedFactoryKeyArr.toString()}`);
        throw new Error()
    }
    //1. 배경지도 레이어 생성 및 지도에 포함
    setBaseLayer(){
        if(this.#isValid_factories()){

        }else this.#ERROR_factory();
    }

    /**
     * 레이어를 생성하기위한 소스,스타일이 정의된 설정
     *
     * @param {Object} layerCode
     * @memberof MOGISMap
     */
    assignLayerCode(layerCode){ //layerCode 를 전달해주는 주체는?
        if(this.#isValid_factories()){
            Object.values(this.#Factory).forEach(subFactory=>subFactory.setSpec(layerCode));
        }
    }

    //2. layerTree 가 유발하는 레이어 생성 (소스, 레이어 factory 연관)
    setLayer(layerCodeId){

    }
}