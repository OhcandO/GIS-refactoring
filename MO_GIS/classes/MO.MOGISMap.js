import * as KEY from '../common/MO.keyMap.js';
import { MOFactory } from "./abstract/MO.Factory.js";
import { SourceFactory } from "./MO.SourceFactory.js";
import { LayerFactory } from "./MO.LayerFactory.js";
import { createStyleFunction } from './MO.StyleFunctionFactory.js';
import olMap from '../../lib/openlayers_v7.5.1/Map.js';
import View from '../../lib/openlayers_v7.5.1/View.js'
import OSM from '../../lib/openlayers_v7.5.1/source/OSM.js'
import TileLayer from '../../lib/openlayers_v7.5.1/layer/Tile.js';
import Select from '../../lib/openlayers_v7.5.1/interaction/Select.js';
import Feature from '../../lib/openlayers_v7.5.1/Feature.js';
import Layer from '../../lib/openlayers_v7.5.1/layer/Layer.js';
import { MOSubscriber } from './abstract/MO.Subscriber.js';
import { LayerTree } from './MO.LayerTree.js';

/**
 * MOGISMap 객체를 생성하기 위한 파라미터 정의
 * @typedef {object} MOGIS_param
 * @property {string} target - Map 객체가 정의될 DIV element의 id 값. 해당 div 의 height, width 가 유효해야 함. 'map'
 * @property {string} [projection] - Openlayers 뷰 포트 객체가 표현하는 좌표계. 배경지도의 원본 좌표계를 설정해 이미지가 열화 없이 표출되도록 함. 'EPSG:3857'
 * @property {number[]} [center] - "projection" 좌표계에서 중심좌표 위치. 미지정시 회사 좌표 '[14142459.590502, 4506517.583030]'
 * @property {number} [zoom] - view 객체의 초기 줌 수준 '12'
 * @property {number} [hitTolerance] - select interaction 의 클릭위치 반경 조정. 숫자가 커질수록 클릭 선택영역이 넓어짐 '10'
 * @property {boolean} [multi] - select interaction 다중 선택 여부 'false'
 */

/**
 * ol.Map 확장하고 지도와 레이어 생성을 관장하는 Controller 역할수행
 *
 * @export
 * @class MOGISMap
 * @author jhoh
 */
export class MOGISMap extends MOSubscriber{
    default_viewSpec = {
        /**
         * Openlayers 뷰 포트 객체가 표현하는 좌표계.
         * 배경지도의 원본 좌표계를 설정해 이미지가 열화 없이 표출되도록 함
         * @default 'EPSG:3857' vworld 배경지도 좌표계
         * @memberof MOMapConfig
         */
        projection: `EPSG:3857`, //google map projected Pseudo-Mercator coordinate system. Also Vworld basemap coordinate
        center: [14142459.590502, 4506517.583030],
        enableRotation: false,
        zoom:12,
    };

    /** ol.Map 객체의 기본 정보*/
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

    #Factory = {
        /**@type {SourceFactory} */
        source: undefined,
        /**@type {LayerFactory} */
        layer: undefined,
    };

    #INSTANCE={
        /** @type {olMap} */
        MAP:undefined,
        /**@type {View} */
        VIEW:undefined,
        INTERACTION:{
            /** @type {Select} */
            SELECT:undefined,
            
            POINTER:undefined,
        }
    }

    /**목적 별
     * 소스+레이어 정보 코드 리스트
     * @type {KEY.LAYER_PURPOSE_CATEGORY}
     */
    layerCodeObject = {
        default:[],
        risk:[], // (지능수도플) 리스크맵
        leak:[], // (지능수도플) 누수예상지점
        public:[], // (지능수도플) 공공서비스
        pipnet:[], // (지능수도플) 관망해석결과
        base:[], //기본 GIS 시설물 e.g. 관로, 계측기, 블록 등
        manage:[], //중점 관리지역
        comp:[], // (지능수도플) 상습민원지역
        realtime:[], // (지능수도플) 실시간 상황감지
        portable:[], // (지능수도플) 이동형 누수센서
    };
    /**목적 별 
     * ol.layer 들의 리스트
     *  layerCodeObject 상 KEY.LAYER_ID 를 key로, 레이어객체를 value 로 함
     */
    layers={
        default: new Map(),
        risk: new Map(), // (지능수도플) 리스크맵
        leak: new Map(), // (지능수도플) 누수예상지점
        public: new Map(), // (지능수도플) 공공서비스
        pipnet: new Map(), // (지능수도플) 관망해석결과
        base: new Map(), //기본 GIS 시설물 e.g. 관로, 계측기, 블록 등
        manage: new Map(), //중점 관리지역
        comp: new Map(), // (지능수도플) 상습민원지역
        realtime: new Map(), // (지능수도플) 실시간 상황감지
        portable: new Map(), // (지능수도플) 이동형 누수센서
    }

    /**
     * 기본 배경지도의 소스(API키 포함)+레이어 정보 코드 리스트
     * @type {JSON}
     */
    layerCode_Background;
    /**
     * 입력한 변수들을 Map 또는 View 객체 생성을 위한 변수로 할당
     * @param {MOGIS_param} mapConfigSpec 
     */
    constructor(mapConfigSpec,NAME='MOGISMap') {
        super(NAME);
        if (mapConfigSpec instanceof Object && mapConfigSpec.target) {
            Object.entries(mapConfigSpec).forEach(([key, val]) => {
                if (this.default_mapSpec[key]) this.default_mapSpec[key] = val;
                if (this.default_viewSpec[key]) this.default_viewSpec[key] = val;
                if (this.default_select[key]) this.default_select[key] = val;
            });
        }else{
            throw new Error(`지도객체 위치할 'target'의 아이디 값을 정의해야 합니다.`)
        }
    }

    get map() {
        if (!this.#INSTANCE.MAP) this.#createMapObj(); 
        return this.#INSTANCE.MAP;
    }
	#createMapObj (){
		this.#INSTANCE.MAP = new olMap({
                target: this.default_mapSpec.target,
                view: this.view,
            });
	}
    get view() {
        if (!this.#INSTANCE.VIEW) {
            this.#INSTANCE.VIEW = new View(this.default_viewSpec);
        }
        return this.#INSTANCE.VIEW;
    }

    set view(view_inst) {
        if (view_inst instanceof View) {
            this.#INSTANCE.VIEW = view_inst;
        } else {
            console.log(view_inst);
            throw new Error(`Openlayers 뷰 인스턴스가 아님`);
        }
    }

    get baseLayers(){
        if(this.#INSTANCE.MAP){
            return this.#INSTANCE.MAP.getLayers().getArray().filter(layer=>layer.get('isBase'));
        }else{
            console.log(`오픈레이어스 지도 객체 생성되지 않음`)
            return [];
        }
    }
    //🔻⬜⬜⬜⬜⬜LayerCode 관련⬜⬜⬜⬜

    /**
     * 레이어 소스 + 스타일 JSON 등록
     * @param {JSON} layerCDArr 레이어코드 json 배열
     * @param {string} [categoryKey] 레이어코드 구분자
     * @memberof MOGISMap
     */
    setLayerCode(layerCDArr,categoryKey) {
        if (layerCDArr instanceof Array) {
            if(categoryKey){
                if(this.#isValid_layerPurposeCategoryKey(categoryKey)){
                    
                    //카테고리 키도 입력
                    layerCDArr.forEach(layerCode=>layerCode['LAYER_PURPOSE_CATEGORY'] = categoryKey);
                    
                    this.layerCodeObject[categoryKey] = layerCDArr;
                    
                }else{
                    console.error(`레이어 카테고리 키가 적합하지 않음: ${categoryKey}`);
                    console.error(`default 카테고리로 임시 지정`);
                    this.layerCodeObject['default'] = layerCDArr;    
                }
            }else{
                this.layerCodeObject['default'] = layerCDArr;
            }
        } else {
            console.error(`layerCode JSON 객체가 적합하지 않음`);
            throw new Error(`layerCode JSON 객체가 적합하지 않음`);
        }
    }

    /**
     * 레이어 소스 JSON 등록
     * @param {JSON} layerCDArr
     * @memberof MOGISMap
     */
    setBaseLayerCodeArr(layerCDArr) {
        if (layerCDArr instanceof Array) {
            this.layerCode_Background = layerCDArr;
        } else {
            console.error(`layerCode JSON 객체가 적합하지 않음`);
            throw new Error(`layerCode JSON 객체가 적합하지 않음`);
        }
    }
    get example_BaseLayerCodeArr(){
        const arr = [{  sourceType: "wmts", category: "vworld", srid: "EPSG:3857", origin: "https://api.vworld.kr",sourcePathname: "/req/wmts/1.0.0/{key}/{layer}/{tileMatrix}/{tileRow}/{tileCol}.{tileType}",id: 1, layerTitle: "vworld_base", typeName: "Base", boolIsdefault: "Y", apiKey: "B58E48FE-683E-3E7E-B91C-2F912512FE60",  layerType: "BASE", }];
        console.log(arr);
    }
    get example_LayerCodeArr(){
        const arr = [{"names":"YC 전체","ORDR":1,"sourceType":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":24,"pid":8,"minZoom":9,"layerTitle":"YC 전체","typeName":"swap:wtl_blsm_as_yc","cqlfilter":null,"iconName":null,"label":"BLCK_NM","zIndex":6,"lineWidth":"2","lineStyle":"[3,5,1,4]","layerType":"POLYGON","colorFill":"rgba(88, 187, 78, 0.66)","colorLine":"rgba(21, 80, 0, 0.7)","font":"25px Malgun Gothic","colorFontLine":"rgba(0, 0, 0, 1)","colorFontFill":"rgba(184, 106, 0, 1)","boolUseYn":"Y","boolIsgroup":null,"boolSelectable":null,"boolEditable":null,"boolIsdefault":"Y","boolDownload":null}];
        console.log(arr);
    }
    /**
     * 레이어 아이디로 LayerCode 를 찾아 반환
     * @param {String} layerID
     * @param {KEY.LAYER_PURPOSE_CATEGORY} la_pu_cate_key
     * @return {Object} 
     * @memberof MOGISMap
     */
    #getALayerCode(layerID,la_pu_cate_key) {
        if (layerID) {
            let tempArr;
            if(this.#isValid_layerPurposeCategoryKey(la_pu_cate_key)){
                tempArr = this.layerCodeObject[la_pu_cate_key];
            }else{
                tempArr = Object.values(this.layerCodeObject).flat();
            }
            let layerCodeObj= tempArr.find(code=>code[KEY.LAYER_ID]==layerID);
            if(layerCodeObj){
                return layerCodeObj;
            }else{
                console.error(`적합한 layerCodeObj 없음`)
                console.log(`찾은 레이어 아이디 : ${layerID}`);
                throw new Error(`적합한 layerCodeObj 없음`)
            }
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
            } 
            // else if (factory instanceof StyleFactory) {
            //     this.#Factory.style = factory;
            // }
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

    //🔺🔵🔵🔵Factory 관련🔵🔵🔵🔵

    /* ===================================
    =======레이어 생성 관련 ============= 
    =====================================*/
   
    //1. 배경지도 레이어 생성 및 지도에 발행
    setBaseLayer() {
		if(!(this.#INSTANCE.MAP instanceof Map)) this.#createMapObj();
		
        if (this.layerCode_Background?.length > 0 && this.#isValid_factories()) {
            let baseLayers = [];
            baseLayers = this.layerCode_Background.map(baseConfig=>{
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
                    layer = this.#Factory.layer.getBaseLayer();
                }catch(e){
                    console.error(e);
                }
                return layer;
            });
            if(baseLayers.length >0){
                this.#INSTANCE.MAP.setLayers(baseLayers);
            }
        } else{
            //this.#ERROR_factory()
            let source = new OSM(); 
            let layer = new TileLayer({source:source});
            console.log('%cemergency layer activated',KEY.CONSOLE_DECO.BODY);
            this.#INSTANCE.MAP.setLayers([layer]);
        };
    }
    

    //🟨🟩🟦 MOSubscriber 함수 등록
    update(publisherID){
        let publisher = this.getPublisher(publisherID);

        if(publisher instanceof LayerTree){
            let dataArr = publisher.getPublisherData();
            if(dataArr?.length>0){
                dataArr.forEach(ctrlObj=>{
                    this.ctrlLayer(ctrlObj.layerID, ctrlObj.visible, ctrlObj.categoryKEY)
                })
            }
        }
    }

    /**
     * MOGISMap 이 레이어 코드 아이디로 레이어 켜지고 꺼짐을 관리 (layerTree 에서)
     * @param {number} layer_id 
     * @param {boolean} [visible] 레이어객체 setVisible 값
     * @param {KEY.LAYER_PURPOSE_CATEGORY} [la_pu_cate_key] 레이어 목적구분
     */
    ctrlLayer(layer_id,visible=true, la_pu_cate_key){
        let targetLayer;
        if(this.#isValid_layerPurposeCategoryKey(la_pu_cate_key)){
            targetLayer = this.layers[la_pu_cate_key].get(layer_id);
        }else{
            const allLayers = this.#INSTANCE.MAP.getLayers().getArray();
            targetLayer = allLayers.find(layer=>layer.get(KEY.LAYER_ID)===layer_id);
        }
        if(targetLayer instanceof Layer){ //기 발행 레이어 있는 경우
            targetLayer.setVisible(visible);
        }else if(visible){ //기 발행 레이어 없는데 켜야하는 경우
            this.#addLayerToMap(layer_id,la_pu_cate_key);
        }else{
            // 기 발행되지도 않았고, setVisible(false)인 상황
        }
    }

    /**
     * 레이어아이디로 Factory 통해 ol.Layer 생성 및 반환
     *
     * @param {String} layerCodeId
     * @param {KEY.LAYER_PURPOSE_CATEGORY} [layerObjCategoryKey]
     * @memberof MOGISMap
     * @returns {Layer}
     */
    #createLayerWithID(layerCodeId, layerObjCategoryKey) {
        let layerCode;
        try {
            layerCode = this.#getALayerCode(layerCodeId,layerObjCategoryKey);
        } catch (e) {
            console.error(e)
        }
        if(layerCode){
            this.#assignLayerCodeToFactories(layerCode);
        }else{
            
        }

        let source,layer;
        try{
            source = this.#Factory.source.getSource();
            this.#Factory.layer.setSource(source);
        }catch(e){console.error(e);}

        try{
            layer = this.#Factory.layer.getLayer();
        }catch(e){console.error(e);}

        if(layerCode[KEY.SOURCE_TYPE]=='vector'){
            try{
                layer.setStyle (createStyleFunction(layerCode))
            }catch(e){
                console.error(e);
            }
        }
        if(layer) return layer;
        else throw new Error (`layer 생성되지 않음`);
    }

    /**
     * 레이어 아이디로 ol.Map 객체에 레이어 추가
     *
     * @param {String} layerCodeID
     * @param {KEY.LAYER_PURPOSE_CATEGORY} [la_pu_cate_key]
     * @memberof MOGISMap
     */
    #addLayerToMap(layerCodeID, la_pu_cate_key){
        let layer;
        try { 
            layer = this.#createLayerWithID(layerCodeID, la_pu_cate_key);
        }catch(e){console.error(e)}
        if(layer) {
            //레이어를 맵에 등록
            if(this.#isValid_layerPurposeCategoryKey(la_pu_cate_key)){
                this.layers[la_pu_cate_key].set(layerCodeID,layer);
            }else{
                this.layers['default'].set(layerCodeID,layer);
            }
            this.#INSTANCE.MAP.addLayer(layer);
        }
    }
    #isValid_layerPurposeCategoryKey(key){
        let bool = false;
        if(key){
            bool = Object.values(KEY.LAYER_PURPOSE_CATEGORY).includes(key);
        }
        return bool;
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

    /**
     * MOGISMap 객체의 Vector Source Layer 에 대해, Layer 가 선택 가능한 상태라면,
     * 레이어를 구성하는 feature 들과 상호작용할 수 있도록 켜거나 끔
     */
    enableSelect(bool=true){
        if(bool){
            this.#createSelectInteraction();
        }else{
            this.#INSTANCE.MAP.removeInteraction(this.#INSTANCE.INTERACTION.SELECT);
            this.#INSTANCE.INTERACTION.SELECT = undefined;
            this.#INSTANCE.MAP.un('pointermove',this.#INSTANCE.INTERACTION.POINTER);
        }
    }

    #createSelectInteraction(){
        let selectInteraction;
        try{
            selectInteraction = new Select({
                hitTolerance : this.default_select.hitTolerance,
                multi : this.default_select.multi,
                style : createStyleFunction('HIGHLIGHT'),
                layers: function(layer){
                    return layer.get(KEY.BOOL_SELECTABLE)?.toUpperCase() ==='Y'
                }
            });
        }catch(e){
            console.error(e);
        }
        
        if(selectInteraction instanceof Select) {
            this.#INSTANCE.INTERACTION.SELECT = selectInteraction;
            this.#INSTANCE.MAP.addInteraction(selectInteraction);
        }

        //선택 가능한 레이어 위에서 포인터 변경
        this.#INSTANCE.INTERACTION.POINTER = (e)=>{
            if(!e.dragging){
                let bool = e.map.forEachFeatureAtPixel(e.pixel,(feature,layer)=>{
                            if(layer.get(KEY.BOOL_SELECTABLE)=='Y') return true;                
                            else return false;                       
                        },{hitTolerance:this.default_select.hitTolerance})
        
                if(bool) e.map.getTargetElement().style.cursor='pointer';
                else     e.map.getTargetElement().style.cursor='';                
            }
        };
        
        this.#INSTANCE.MAP.on('pointermove',this.#INSTANCE.INTERACTION.POINTER);
    }
    
    /**
     * openlayers 피쳐와 레이어를 파라미터로 하는 callback 함수 사용자 정의
     * @callback featureCallback
     * @param {Feature} feature 첫번째로 선택된, zIndex 가장 큰 feature
     * @param {Layer} layer feature가 포함된 ol.Layer 객체
     */
    /**
     * 선택가능한 레이어의 피쳐 클릭시 발생할 이벤트 사용자 지정
     * @param {featureCallback} callback 피쳐, 레이어를 인자로 하는 콜백
     */
    setSelectCallback(callback){
        if(this.#INSTANCE.INTERACTION.SELECT instanceof Select){
            let me = this;
            this.#INSTANCE.INTERACTION.SELECT.on('select',function(e){
                if(!e.auto){
                    let feature = me.#INSTANCE.INTERACTION.SELECT.getFeatures()?.getArray()[0];
                    let layer = feature? me.#INSTANCE.INTERACTION.SELECT.getLayer(feature): undefined;
                    callback(feature,layer);
                }
            });
        }
    }
}