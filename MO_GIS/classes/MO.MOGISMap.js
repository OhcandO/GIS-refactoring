import * as KEY from '../common/MO.keyMap.js';
import { LayerTree } from "./MO.LayerTree.js";
import { MOFactory } from "./abstract/MO.Factory.js";
import { SourceFactory } from "./MO.SourceFactory.js";
import { LayerFactory } from "./MO.LayerFactory.js";
import { StyleFactory } from './MO.StyleFactory.js';
import Map from '../../lib/openlayers_v7.5.1/Map.js'
import View from '../../lib/openlayers_v7.5.1/View.js'
import OSM from '../../lib/openlayers_v7.5.1/source/OSM.js'
import TileLayer from '../../lib/openlayers_v7.5.1/layer/Tile.js';
import Select from '../../lib/openlayers_v7.5.1/interaction/Select.js';
import Feature from '../../lib/openlayers_v7.5.1/Feature.js';
import Layer from '../../lib/openlayers_v7.5.1/layer/Layer.js';

/**
 * ol.Map 확장하고 지도와 레이어 생성을 관장하는 Controller 역할수행
 *
 * @export
 * @class MOGISMap
 */
export class MOGISMap {
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
        zoom:15,
    };

    default_mapSpec = {
        /** Map 이 생성될 기본 DIV id */
        target: "map",
    };

    default_select = {
        hitTolerance : 10,
        multi: false,
    }

    default_toolbar = {

    }

    #INSTANCE_OL_VIEW;
    #INSTANCE_OL_MAP;
    #INSTANCE_OL_SELECT;
    #INSTANCE_LAYERTREE;

    #Factory = {
        source: undefined,
        style: undefined,
        layer: undefined,
    };

    /**
     * Vector 레이어들의 소스+레이어 정보 코드 리스트
     * @type {JSON}
     */
    layerCodeArr;

    /**
     * 기본 배경지도의 소스(API키 포함)+레이어 정보 코드 리스트
     * @type {JSON}
     */
    layerCodeArrBase;
    /**
     * 입력한 변수들을 Map 또는 View 객체 생성을 위한 변수로 할당
     * @param {Object} mapConfigSpec Map 또는 View 객체 생성을 위한 key-value Object
     */
    constructor(mapConfigSpec) {
        if (mapConfigSpec instanceof Object) {
            Object.entries(mapConfigSpec).forEach(([key, val]) => {
                if (this.default_mapSpec[key]) this.default_mapSpec[key] = val;
                if (this.default_viewSpec[key]) this.default_viewSpec[key] = val;
                if (this.default_select[key]) this.default_select[key] = val;
            });
        }

        //deafult highlight 초기화
        this.default_select[KEY.FONT_STYLE] = '15px Malgun Gothic';
        this.default_select[KEY.FONT_OUTLINE] = 'rgba(15,15,15,1)';
        this.default_select[KEY.FONT_FILL] = 'rgba(255,255,0,1)';
        this.default_select[KEY.COLOR_LINE] = 'rgba(226, 51, 51, 1)';
        this.default_select[KEY.LINE_WIDTH] = 5;
        this.default_select[KEY.LINE_STYLE] = '[3,3]';
        this.default_select[KEY.COLOR_FILL] = 'rgba(226, 51, 51, 0.54)';
    }

    get map() {
        if (!this.#INSTANCE_OL_MAP) this.#createMapObj(); 
        return this.#INSTANCE_OL_MAP;
    }
	#createMapObj (){
		this.#INSTANCE_OL_MAP = new Map({
//		this.#INSTANCE_OL_MAP = new ol.Map({
                target: this.default_mapSpec.target,
                view: this.view,
            });
	}
    get view() {
        if (!this.#INSTANCE_OL_VIEW) {
            this.#INSTANCE_OL_VIEW = new View(this.default_viewSpec);
//            this.#INSTANCE_OL_VIEW = new ol.View(this.default_viewSpec);
        }
        return this.#INSTANCE_OL_VIEW;
    }

    set view(view_inst) {
        if (view_inst instanceof View) {
//        if (view_inst instanceof ol.View) {
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

    //🔻⬜⬜⬜⬜⬜LayerCode 관련⬜⬜⬜⬜

    /**
     * 레이어 소스 + 스타일 JSON 등록
     * @param {JSON} layerCDArr
     * @memberof MOGISMap
     */
    setLayerCodeArr(layerCDArr) {
        if (layerCDArr instanceof Array) {
            this.layerCodeArr = layerCDArr;
        } else {
            console.error(`layerCode JSON 객체가 적합하지 않음`);
            throw new Error(`layerCode JSON 객체가 적합하지 않음`);
        }
    }

    /**
     * 레이어 소스 + 스타일 JSON 등록
     * @param {JSON} layerCDArr
     * @memberof MOGISMap
     */
    setBaseLayerCodeArr(layerCDArr) {
        if (layerCDArr instanceof Array) {
            this.layerCodeArrBase = layerCDArr;
        } else {
            console.error(`layerCode JSON 객체가 적합하지 않음`);
            throw new Error(`layerCode JSON 객체가 적합하지 않음`);
        }
    }

    /**
     * 레이어 아이디로 LayerCode 를 찾아 반환
     * @param {String} layerID
     * @return {Object} 
     * @memberof MOGISMap
     */
    #getALayerCode(layerID) {
        if (layerID) {
            return this.layerCodeArr.find(code=>code[KEY.LAYER_ID]);
        }else{
            throw new Error(`레이어아이디 적합하지 않음 : ${layerID}`)
        }
    }
    //🔺⬜⬜⬜LayerCode 관련 끝⬜⬜⬜

    //🔻🔵🔵🔵Factory 관련🔵🔵🔵🔵
    /**
     * MOFactory subClass 를 등록 (레이어 Factory, 소스 Factory);
     *
     * @param {MOFactory} factory
     * @memberof MOGISMap
     */
    setFactory(factory) {
        if (factory instanceof MOFactory) {
            if (factory instanceof SourceFactory) {
                this.#Factory.source = factory;
            } else if (factory instanceof LayerFactory) {
                this.#Factory.layer = factory;
            } else if (factory instanceof StyleFactory) {
                this.#Factory.style = factory;
            }
        } else {
            console.log(factory);
            throw new Error(`입력된 Factory가 적합한 인스턴스 아님`);
        }
    }

    #isValid_factories() {
        let bool = false;
        // Factory 에 등록된 모든 요소들이 MOFactory 의 서브클래스인지 확인
        bool = Object.values(this.#Factory).every(fac => fac instanceof MOFactory);
        return bool;
    }

    #ERROR_factory() {
        let notAssignedFactoryKeyArr = Object.keys(this.#Factory).filter(
            (key) => !this.#Factory[key]
        );
        console.error(
            `다음 Factory들이 정의되지 않음 : ${notAssignedFactoryKeyArr.toString()}`
        );
        throw new Error(`Factory들이 정의되지 않음`);
    }    
    //🔺🔵🔵🔵Factory 관련🔵🔵🔵🔵

    /* ===================================
    =======레이어 생성 관련 ============= 
    =====================================*/
   
    //1. 배경지도 레이어 생성 및 지도에 포함
    setBaseLayer() {
		if(!(this.#INSTANCE_OL_MAP instanceof Map)) this.#createMapObj();
//		if(!(this.#INSTANCE_OL_MAP instanceof ol.Map)) this.#createMapObj();
		
        if (this.layerCodeArrBase?.length > 0 && this.#isValid_factories()) {
            let baseLayers = [];
            baseLayers = this.layerCodeArrBase.map(baseConfig=>{
                this.#assignLayerCodeToFactories(baseConfig);

                let source ;
                try{
                    source = this.#Factory.source.getSource();
                }catch(e){
                    console.error(e); 
                }
                this.#Factory.layer.setSource(source);
                let layer ;
                try{
                    layer = this.#Factory.layer.getLayer();
                }catch(e){
                    console.error(e);
                }
                return layer;
            });
            if(baseLayers.length >0){
                this.#INSTANCE_OL_MAP.setLayers(baseLayers);
            }
        } else{
            //this.#ERROR_factory()
            let source = new OSM(); 
            let layer = new TileLayer({source:source});
//            let source = new ol.sourceOSM(); 
//            let layer = new ol.layer.Tile({source:source});
            console.log(this.#INSTANCE_OL_MAP);
            this.#INSTANCE_OL_MAP.setLayers([layer]);
        };
    }

    /**
     * 레이어아이디로 Factory 통해 ol.Layer 생성 및 반환
     *
     * @param {String} layerCodeId
     * @memberof MOGISMap
     */
    #getLayerWithID(layerCodeId) {
        let layerCode;
        try {
            layerCode = this.#getALayerCode(layerCodeId);
            this.#assignLayerCodeToFactories(layerCode);
        } catch (e) {console.error(e)}

        let source,layer;
        try{
            source = this.#Factory.source.getSource();
            this.#Factory.layer.setSource(source);
        }catch(e){console.error(e);}

        try{
            layer = this.#Factory.layer.getLayer();
        }catch(e){console.error(e);}

        if(layer) return layer;
        else throw new Error (`layer 생성되지 않음`);
    }

    /**
     * 레이어 아이디로 ol.Map 객체에 레이어 추가
     *
     * @param {String} layerCodeID
     * @memberof MOGISMap
     */
    addLayerWithID(layerCodeID){
        let layer;
        try { 
            layer = this.#getLayerWithID(layerCodeID);
        }catch(e){console.error(e)}
        if(layer) this.#INSTANCE_OL_MAP.addLayer(layer);
    }
    /**
     * 레이어를 생성하기위한 소스,스타일이 정의된 설정을
     * Factory 서브클래스들에게 전달
     *
     * @param {Object} layerCode
     * @memberof MOGISMap
     */
    #assignLayerCodeToFactories(layerCode) {
        if (this.#isValid_factories()) {
            Object.values(this.#Factory).forEach(subFactory =>subFactory.setSpec(layerCode));
        }
    }

    /* 🔷SELECT Interaction 관련🔷 */
    enableSelect(){
        if(!this.#INSTANCE_OL_SELECT) this.#createSelectInteraction();
    }

    #createSelectInteraction(){
        let styleFac = this.#Factory.style;
        if(styleFac instanceof MOFactory){
            styleFac.setSpec(this.default_select);
        }else{
            console.log(`등록된 styleFactory 없어 OL 기본 select 스타일 따름`)
        }
        let selectInteraction;
        try{
            selectInteraction = new Select({
//            selectInteraction = new ol.interaction.Select({
                hitTolerance : this.default_select.hitTolerance,
                multi : this.default_select.multi,
                style : this.#Factory.style.getStyleFunction_highlight(),
                layers: function(layer){
                    return layer.get(KEY.BOOL_SELECTABLE)?.toUpperCase() ==='Y'
                }
            });
        }catch(e){
            console.error(e);
        }
        if(selectInteraction instanceof Select) {
//        if(selectInteraction instanceof ol.interaction.Select) {
            this.#INSTANCE_OL_SELECT = selectInteraction;
            this.#INSTANCE_OL_MAP.addInteraction(selectInteraction);
        }
    }
    
    /**
     * openlayers 피쳐와 레이어를 파라미터로 하는 callback 함수 사용자 정의
     * @callback featureCallback
     * @param {Feature} feature 첫번째로 선택된, zIndex 가장 큰 feature
     * @param {Layer} layer feature가 포함된 ol.Layer 객체
     */
    /**
     * 
     * @param {featureCallback} callback 피쳐, 레이어를 인자로 하는 콜백
     */
    setSelectCallback(callback){
        if(this.#INSTANCE_OL_SELECT instanceof Select){
//        if(this.#INSTANCE_OL_SELECT instanceof ol.interaction){
            let me = this;
            this.#INSTANCE_OL_SELECT.on('select',function(e){
                if(!e.auto){
                    // let features = me.selectInteraction.getFeatures();
                    let feature = me.#INSTANCE_OL_SELECT.getFeatures()?.getArray()[0];
                    let layer = feature? me.#INSTANCE_OL_SELECT.getLayer(feature): undefined;
                    // for(let i in features.getArray()){
                    //     let feature = features.getArray()[0];
                    //     let layer = me.selectInteraction.getLayer(feature);
                    //     layers.push(layer);
                    // }
                    callback(feature,layer);
                }
            });
        }
    }
}


//TODO 측정 도구
//https://openlayers.org/en/latest/examples/measure-style.html