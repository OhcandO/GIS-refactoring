import * as KEY from '../../common/MO.keyMap.js';
import { SourceFactory } from "../MO.SourceFactory.js";
import { LayerFactory } from "../MO.LayerFactory.js";
import { createStyleFunction } from '../MO.StyleFunctionFactory.js';
import olMap from '../../../lib/openlayers_v7.5.1/Map.js';
import View from '../../../lib/openlayers_v7.5.1/View.js'
import OSM from '../../../lib/openlayers_v7.5.1/source/OSM.js'
import TileLayer from '../../../lib/openlayers_v7.5.1/layer/Tile.js';
import Layer from '../../../lib/openlayers_v7.5.1/layer/Layer.js';
import { MOSubscriber } from './MO.Subscriber.js';
import { LayerTree } from '../MO.LayerTree.js';
import { MOFactory } from './MO.Factory.js';
import { MouseWheelZoom, defaults as defaultInteraction} from '../../../lib/openlayers_v7.5.1/interaction.js';
import LayerGroup from '../../../lib/openlayers_v7.5.1/layer/Group.js';
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
 *
 * @export
 * @author jhoh
 */
export class MOSimpleMap extends MOSubscriber{
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
        constrainResolution:true,
        resolutions:undefined,
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

    Factory = {
        /**@type {SourceFactory} */
        source: new SourceFactory(),
        /**@type {LayerFactory} */
        layer: new LayerFactory(),
    };

    INSTANCE={
        /** @type {olMap|undefined} */
        MAP:undefined,
        /**@type {View|undefined} */
        VIEW:undefined,
        LAYER:{
            /** @type {Array<Layer>|undefined} */
            BACKGROUND:undefined,
            /** 목적설정 안된 레이어들
             * @type {Map<string,Array<Layer>>}*/
            default: new Map(),
            highlight:{
                /** @type {Layer|undefined} */
                Point:undefined,
                LineString:undefined,
                Polygon:undefined,
            }
        }
    }

    /**목적 별
     * 소스+레이어 정보 코드 리스트
     * @type {object}
     */
    layerCodeObject = {
        /** @type {Array<KEY.layerCodeObj>} */
        default:[],
    };

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
                if (Object.keys(this.default_mapSpec).includes(key)) this.default_mapSpec[key] = val;
                if (Object.keys(this.default_viewSpec).includes(key)) this.default_viewSpec[key] = val;
                if (Object.keys(this.default_select).includes(key)) this.default_select[key] = val;
            });
        }else{
            throw new Error(`지도객체 위치할 'target'(=DIV html Element) 의 ID 값을 정의해야 합니다.`)
        }
    }

    get map() {
        if (!this.INSTANCE.MAP) this.#createMapObj(); 
        return this.INSTANCE.MAP;
    }
	#createMapObj (){
		this.INSTANCE.MAP = new olMap({
                target: this.default_mapSpec.target,
                view: this.view,
                controls:[],
                interactions: defaultInteraction({doubleClickZoom:false, mouseWheelZoom:false}).extend([new MouseWheelZoom({constrainResolution:true, duration:150, timeout:50}),])
            });
	}
    get view() {
        if (!this.INSTANCE.VIEW) {
            this.INSTANCE.VIEW = new View(this.default_viewSpec);
        }
        return this.INSTANCE.VIEW;
    }

    set view(view_inst) {
        if (view_inst instanceof View) {
            this.INSTANCE.VIEW = view_inst;
        } else {
            console.log(view_inst);
            throw new Error(`Openlayers 뷰 인스턴스가 아님`);
        }
    }

    get baseLayers(){
        if(this.INSTANCE.MAP){
            return this.INSTANCE.MAP.getLayers().getArray().filter(layer=>layer.get('isBase'));
        }else{
            console.log(`오픈레이어스 지도 객체 생성되지 않음`)
            return [];
        }
    }
    //🔻⬜⬜⬜⬜⬜LayerCode 관련⬜⬜⬜⬜

    /**
     * 레이어 소스 + 스타일 JSON 등록
     * @param {Array | object} layerCDArr 레이어코드 json 배열
     * @param {string} [categoryKey] 레이어코드 구분자. 각종 openlayers 인스턴스의 그룹명이 된다
     * @memberof MOGISMap
     */
    setLayerCode(layerCDArr,categoryKey) {
        if (layerCDArr instanceof Array) {
            if(categoryKey){
                    
                //카테고리 키도 입력
                layerCDArr.forEach(layerCode=>{
					layerCode[KEY.LAYER_PURPOSE_CATEGORY_KEY] = categoryKey;
				});
                //PK 검사(레이어 아이디)해 같으면 덮어씌우면서 병합
                this.layerCodeObject[categoryKey] = layerCDArr.reduce((pre,cur)=>{
					const tempArr = pre.filter(a=>a[KEY.LAYER_ID]!=cur[KEY.LAYER_ID]);
					tempArr.push(cur);
					return tempArr;
				},this.layerCodeObject[categoryKey]);
                    
            }else{
                this.layerCodeObject['default'] = layerCDArr;
            }
        } else if (layerCDArr[KEY.LAYER_ID]){
			if(categoryKey){
                    
                //카테고리 키도 입력
                layerCDArr[KEY.LAYER_PURPOSE_CATEGORY_KEY] = categoryKey;
                
                //PK 검사
                //같은게 있으면 덮어씌우기, 없으면 그냥 push
                if(this.layerCodeObject[categoryKey].some(obj=>obj[KEY.LAYER_ID]==layerCDArr[KEY.LAYER_ID])){
					console.group(`새로운 layerCodeObj 로 기존 내용 덮어씁니다`);
					console.log(`기 등록 layerCodeObj`,this.layerCodeObject[categoryKey].find(el=>el[KEY.LAYER_ID]==layerCDArr[KEY.LAYER_ID]));
					console.log(`현재 layerCodeObj`,layerCDArr);
					console.groupEnd();
					const temparr = this.layerCodeObject[categoryKey].filter(el=>el[KEY.LAYER_ID]==layerCDArr[KEY.LAYER_ID]);
					temparr.push(layerCDArr);
					this.layerCodeObject[categoryKey]=temparr;
				}else this.layerCodeObject[categoryKey].push(layerCDArr);
                    
            }else{
                this.layerCodeObject['default'] = layerCDArr;
            }
		}else {
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
        const arr = [{  sourceClass: "wmts", category: "vworld", srid: "EPSG:3857", origin: "https://api.vworld.kr",sourcePathname: "/req/wmts/1.0.0/{key}/{layer}/{tileMatrix}/{tileRow}/{tileCol}.{tileType}",id: 1, layerTitle: "vworld_base", typeName: "Base", boolShowInit: "Y", apiKey: "B58E48FE-683E-3E7E-B91C-2F912512FE60",  layerType: "BASE", }];
        console.log(arr);
    }
    get example_LayerCodeArr(){
        const arr = [{"names":"YC 전체","ordr":1,"sourceClass":"vector","category":"geoserver","srid":"EPSG:5186","origin":"http:\/\/118.42.103.144:9090","sourcePathname":"\/geoserver\/wfs","apiKey":null,"id":24,"pid":8,"minZoom":9,"layerTitle":"YC 전체","typeName":"swap:wtl_blsm_as_yc","cqlfilter":null,"iconName":null,"label":"BLCK_NM","zIndex":6,"lineWidth":"2","lineStyle":"[3,5,1,4]","layerType":"POLYGON","colorFill":"rgba(88, 187, 78, 0.66)","colorLine":"rgba(21, 80, 0, 0.7)","font":"25px Malgun Gothic","colorFontLine":"rgba(0, 0, 0, 1)","colorFontFill":"rgba(184, 106, 0, 1)","boolUseYn":"Y","boolIsgroup":null,"boolSelectable":null,"boolEditable":null,"boolShowInit":"Y","boolDownload":null}];
        console.log(arr);
    }

    getLayerCodeArr(la_pu_cate_key){
        if(this.isValid_layerPurposeCategoryKey(la_pu_cate_key)){
            return JSON.stringify(this.layerCodeObject[la_pu_cate_key]);
        }
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
            if(this.isValid_layerPurposeCategoryKey(la_pu_cate_key)){
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


    /* ===================================
    =======레이어 생성 관련 ============= 
    =====================================*/
   
    //1. 배경지도 레이어 생성 및 지도에 발행
    setBaseLayer() {
		if(!(this.INSTANCE.MAP instanceof Map)) this.#createMapObj();
		
        if (this.layerCode_Background?.length > 0 && this.isValid_factories()) {
            let baseLayers = [];
            baseLayers = this.layerCode_Background.map(baseConfig=>{
                this.#assignLayerCodeToFactories(baseConfig);

                let source ;
                try{
                    source = this.Factory.source.getSource();
                }catch(e){
                    console.error(e); 
                }
                this.Factory.layer.setSource(source);
                let layer ;
                try{
                    layer = this.Factory.layer.getBaseLayer();
                }catch(e){
                    console.error(e);
                }
                return layer;
            });
            if(baseLayers.length >0){
                this.INSTANCE.MAP.setLayers(baseLayers);
                // this.baseLayers = baseLayers;
                this.INSTANCE.LAYER.BACKGROUND = baseLayers;
            }
        } else{
            //this.#ERROR_factory()
            let source = new OSM(); 
            let layer = new TileLayer({source:source});
            console.log('%cemergency layer activated',KEY.CONSOLE_DECO.BODY);
            this.INSTANCE.MAP.setLayers([layer]);
        };
    }
    

    //🟨🟨🟨MOSubscriber 함수등록🟨🟨🟨🟨🟨🟨🟨🟨🟨
    /**
     * 
     * @param {Symbol} publisherID 
     */
    update(publisherID){
        let publisher = this.getPublisher(publisherID);
        if(!publisher) throw new Error(`등록되지 않은 Publisher 호출`);
        if(publisher instanceof LayerTree){
            let dataArr = publisher.PublisherData;
            if(dataArr?.length>0){
                dataArr.forEach(ctrlObj=>{
                    this.ctrlLayer(ctrlObj[KEY.LAYER_ID], ctrlObj[KEY.BOOL_VISIBLE], ctrlObj[KEY.LAYER_PURPOSE_CATEGORY_KEY])
                })
            }
        }
    }

    //🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨


    /**
     * 레이어 코드 아이디로 레이어 관리 (주로 LayerTree 에서)
     * @param {number} layer_id 
     * @param {boolean} [visible] 레이어객체 setVisible 값
     * @param {KEY.LayerPurpose} [la_pu_cate_key] 레이어 목적구분
	 * @returns {Promise}
     */
    ctrlLayer(layer_id,visible=true, la_pu_cate_key){

        let targetLayer = this.#getLayer(layer_id,la_pu_cate_key);
        
        if(targetLayer instanceof Layer || targetLayer instanceof LayerGroup){ //기 발행 레이어 있는 경우
            targetLayer.setVisible(visible);
            return Promise.resolve();
        }else if(visible){ //기 발행 레이어 없는데 켜야하는 경우
            this.#addLayerToMap(layer_id,la_pu_cate_key)
            .then(Promise.resolve());
        }else{
            // 기 발행되지도 않았고, setVisible(false)인 상황
//            throw new Error(`레이어 발행 불가`)
			return Promise.resolve();
        }
    }
    
    /**
	 * 레이어 아이디 (와 레이어 카테고리 키)로 기 발행 레이어 반환
	 * @param {number} layer_id 레이어 식별자 
     * @param {KEY.LAYER_PURPOSE_CATEGORY} [la_pu_cate_key] 레이어 카테고리 식별키
	 */
    #getLayer(layer_id,la_pu_cate_key){
		if(!KEY.isNumeric(layer_id)){
			throw new Error(`'layer_id' 값이 숫자가 아님: ${layer_id}`)
		}
		let layerId= Number(layer_id);
        let targetLayer;
        if(this.isValid_layerPurposeCategoryKey(la_pu_cate_key)){
            targetLayer = this.INSTANCE.LAYER[la_pu_cate_key].get(layerId);
        }else{
            const allLayers = this.INSTANCE.MAP.getLayers().getArray();
            targetLayer = allLayers.find(layer=>layer.get(KEY.LAYER_ID)===layerId);
        }
        return targetLayer;
    }

    /**
     * 기 발행된 레이어객체를 제거하고 레이어 참조위치도 제거
     * @param {number} layer_id 레이어 식별자 
     * @param {KEY.LAYER_PURPOSE_CATEGORY} [la_pu_cate_key] 레이어 카테고리 식별키 
     */
    discardLayer(layer_id,la_pu_cate_key){
        let targetLayer = this.#getLayer(layer_id,la_pu_cate_key);
        if(!(targetLayer instanceof Layer)) return;
        this.INSTANCE.MAP.removeLayer(targetLayer);
        let layerMap;
        if(la_pu_cate_key){
            layerMap = this.INSTANCE.LAYER[la_pu_cate_key];
            if(layerMap instanceof Map) layerMap.delete(layer_id);
		}else{
			//layerMap = KEY.mergeMaps(Object.values(this.INSTANCE.LAYER));
			Object.values(this.INSTANCE.LAYER).forEach(mm=>{
			    if (mm instanceof Map && mm.has(layer_id)) mm.delete(layer_id);
			});
		}
    }

    /**
     * 발행되었던 레이어 그룹을 초기화 함
     * @param {KEY.LAYER_PURPOSE_CATEGORY} la_pu_cate_key 
     */
    removeLayerGroup(la_pu_cate_key){
        if(la_pu_cate_key === KEY.ADDRESS_SOURCE_LAYER_KEY){

            if(this.INSTANCE.LAYER[KEY.ADDRESS_SOURCE_LAYER_KEY]){
                this.map.removeLayer(this.INSTANCE.LAYER[KEY.ADDRESS_SOURCE_LAYER_KEY]);
                this.INSTANCE.LAYER[KEY.ADDRESS_SOURCE_LAYER_KEY] = undefined;
            }
        }else if (la_pu_cate_key === KEY.HIGHLIGHT_SOURCE_LAYER_KEY){
			Object.values(this.INSTANCE.LAYER.highlight).flat().forEach(layer=> this.map.removeLayer(layer));
			this.INSTANCE.LAYER.highlight.LineString = undefined;
			this.INSTANCE.LAYER.highlight.Point = undefined;
			this.INSTANCE.LAYER.highlight.Polygon = undefined;
			
		}else if(this.isValid_layerPurposeCategoryKey(la_pu_cate_key)){
            let layerMap = this.INSTANCE.LAYER[la_pu_cate_key];
            if(layerMap instanceof Map){
                [...layerMap.values()].forEach(layer=>this.map.removeLayer(layer));
                layerMap.clear();
                console.log(`${la_pu_cate_key} 레이어 그룹을 초기화 했습니다`);
            }
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
            source = this.Factory.source.getSource();
            this.Factory.layer.setSource(source);
        }catch(e){console.error(e);}

        try{
            layer = this.Factory.layer.getLayer();
        }catch(e){console.error(e);}

        if(layerCode[KEY.SOURCE_CLASS]=='vector'){
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
	 * @returns {Promise}
     */
    #addLayerToMap(layerCodeID, la_pu_cate_key){
        let layer;
        try { 
            layer = this.#createLayerWithID(layerCodeID, la_pu_cate_key);
        }catch(e){console.error(e)}
		return new Promise((res,rej)=>{
	        if(layer) {
	            //레이어를 맵에 등록
	            if(this.isValid_layerPurposeCategoryKey(la_pu_cate_key)){
	                this.INSTANCE.LAYER[la_pu_cate_key].set(layerCodeID,layer);
	            }else{
	                this.INSTANCE.LAYER['default'].set(layerCodeID,layer);
	            }
	            layer.once('postrender',function(){
					res();
				});
	            this.INSTANCE.MAP.addLayer(layer);
	        }else{
				rej();	
			}
		});
    }
    isValid_layerPurposeCategoryKey(key){
        let bool = false;
        if(key){
            bool = Object.values(KEY.LAYER_PURPOSE_CATEGORY).map(e=>e[0]).includes(key);
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
        if (this.isValid_factories()) {
            Object.values(this.Factory).forEach(subFactory =>subFactory.setSpec(layerCode));
        }
    }

    isValid_factories() {
        let bool = false;
        // Factory 에 등록된 모든 요소들이 MOFactory 의 서브클래스인지 확인
        bool = Object.values(this.Factory).every(fac => fac instanceof MOFactory);
        return bool;
    }

}