import * as KEY from '../common/MO.keyMap.js';
import { MOFactory } from "./abstract/MO.Factory.js";
import { SourceFactory } from "./MO.SourceFactory.js";
import { LayerFactory } from "./MO.LayerFactory.js";
import { createMOStyleFunction } from './MO.StyleFunctionFactory.js';
import olMap from '../../lib/openlayers_v7.5.1/Map.js';
import View from '../../lib/openlayers_v7.5.1/View.js'
import Select from '../../lib/openlayers_v7.5.1/interaction/Select.js';
import Feature from '../../lib/openlayers_v7.5.1/Feature.js';
import Layer from '../../lib/openlayers_v7.5.1/layer/Layer.js';
import { LayerTree } from './MO.LayerTree.js';
import { Point } from '../../lib/openlayers_v7.5.1/geom.js';
import { transform } from '../../lib/openlayers_v7.5.1/proj.js';
import { Style } from '../../lib/openlayers_v7.5.1/style.js';
import VectorSource from '../../lib/openlayers_v7.5.1/source/Vector.js';
import { MOSimpleMap } from './abstract/MO.MOSimpleMap.js';
import { MOOverlay } from './addon/MO.overlay.js';
import Overlay from '../../lib/openlayers_v7.5.1/Overlay.js';

/**
 * A controller class that extends `ol.Map` to manage map and layer creation.
 * @summary Manages the creation of maps and layers.
 * @export
 * @class MOGISMap
 * @author jhoh
 * @fires MOGISMap#select
 */
export class MOGISMap extends MOSimpleMap{
    default_viewSpec = {
        /**
         * Openlayers 뷰 포트 객체가 표현하는 좌표계.
         * 배경지도의 원본 좌표계를 설정해 이미지가 열화 없이 표출되도록 함
         * @default 'EPSG:3857' vworld 배경지도 좌표계
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
            /** 목적설정 안된 레이어들
             * @type {Map<string,Layer>}*/
            default: new Map(),
            /** 주소검색한 곳들을 feature로 하는 레이어
             * @type {Layer|undefined}*/
            address:undefined,
            /** 강조표시할 feature로 구성된 레이어. GeometryType 에 따라 구분함
             */
            highlight:{
                /** @type {Layer|undefined} */
                Point:undefined,
                LineString:undefined,
                Polygon:undefined,
            },
            /** (지능수도플) 리스크맵
             * @type {Map<string,Layer>}*/
            risk: new Map(),
            /** (지능수도플) 누수예상지점
             * @type {Map<string,Layer>}*/
            leak: new Map(), 
            /** (지능수도플) 공공서비스
             * @type {Map<string,Layer>}*/
            public: new Map(), 
            /** (지능수도플) 관망해석결과
             * @type {Map<string,Layer>}*/
            pipenet: new Map(), 
            /** 기본 GIS 시설물 e.g. 관로, 계측기, 블록 등
             * @type {Map<string,Layer>}*/
            base: new Map(), 
            /** 중점 관리지역
             * @type {Map<string,Layer>}*/
            manage: new Map(), 
            /** (지능수도플) 상습민원지역
             * @type {Map<string,Layer>}*/
            comp: new Map(), 
            /** (지능수도플) 실시간 상황감지
             * @type {Map<string,Layer>}*/
            realtime: new Map(), 
            /** (지능수도플) 이동형 누수센서
             * @type {Map<string,Layer>}*/
            portable: new Map(), 
        },
        INTERACTION:{
            /** @type {Select|undefined} */
            SELECT:undefined,
            /** @type {featureCallback|undefined} */
            SELECT_CALLBACK:(feature,layer)=>{
                if(feature){console.log(feature.getProperties())}
                if(layer){console.log(layer.getProperties());}
            },
            /** @type {Function|undefined} */
            POINTER:undefined,
            
            
            MODIFY:undefined,
            SNAP:[],
        },
        OVERLAY:{
            /**@type {Map<string,Array<MOOverlay>>} */
            default:new Map(),
           /** 중점 관리지역
             * @type {Map<string,Array<MOOverlay>>}*/
           manage: new Map(), 
           /** (지능수도플) 상습민원지역
            * @type {Map<string,Array<MOOverlay>>}*/
           comp: new Map(), 
           /** (지능수도플) 실시간 상황감지
            * @type {Map<string,Array<MOOverlay>>}*/
           realtime: new Map(), 
        }
    }

    /**목적 별
     * 소스+레이어 정보 코드 리스트
     */
    layerCodeObject = {
        /** @type {Array<KEY.layerCodeObj>} */
        default:[],
        /** (지능수도플) 리스크맵 
         * @type {Array<KEY.layerCodeObj>} */
        risk:[], 
        /** (지능수도플) 누수예상지점 
         * @type {Array<KEY.layerCodeObj>} */
        leak:[], 
        /** (지능수도플) 공공서비스 
         * @type {Array<KEY.layerCodeObj>} */
        public:[], 
        /** (지능수도플) 관망해석결과 
         * @type {Array<KEY.layerCodeObj>} */
        pipenet:[], 
        /** 본 GIS 시설물 e.g. 관로, 계측기, 블록 등 
         * @type {Array<KEY.layerCodeObj>} */
        base:[], //
        /** 중점 관리지역 
         * @type {Array<KEY.layerCodeObj>} */
        manage:[], //
        /** (지능수도플) 상습민원지역 
         * @type {Array<KEY.layerCodeObj>} */
        comp:[], 
        /** (지능수도플) 실시간 상황감지 
         * @type {Array<KEY.layerCodeObj>} */
        realtime:[], 
        /** (지능수도플) 이동형 누수센서 
         * @type {Array<KEY.layerCodeObj>} */
        portable:[], 
    };

    /**
     * 기본 배경지도의 소스(API키 포함)+레이어 정보 코드 리스트
     * @type {JSON}
     */
    layerCode_Background;
    /**
     * The initial specification for the background map's source and layer.
     * @type {JSON}
     */
    layerCode_Background;
    /**
     * Creates an instance of MOGISMap.
     * @param {object} mapConfigSpec - The configuration object for the map.
     * @param {string} mapConfigSpec.target - The ID of the HTML element that will contain the map.
     * @param {string} [mapConfigSpec.projection='EPSG:3857'] - The projection of the map.
     * @param {number[]} [mapConfigSpec.center=[14142459.590502, 4506517.583030]] - The initial center of the map.
     * @param {number} [mapConfigSpec.zoom=12] - The initial zoom level of the map.
     * @param {boolean} [mapConfigSpec.enableRotation=false] - Whether rotation is enabled.
     * @param {boolean} [mapConfigSpec.constrainResolution=true] - Whether to constrain the resolution.
     * @param {number[]} [mapConfigSpec.resolutions] - The resolutions for the map.
     * @param {number} [mapConfigSpec.hitTolerance=10] - The hit tolerance for the select interaction.
     * @param {boolean} [mapConfigSpec.multi=false] - Whether to allow multiple features to be selected.
     * @param {string} [NAME='MOGISMap'] - The name of the MOGISMap instance.
     * @throws {Error} If the 'target' property is not defined in mapConfigSpec.
     */
    constructor(mapConfigSpec,NAME='MOGISMap') {
        super(mapConfigSpec,NAME='MOGISMap');
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

    //🔻⬜⬜⬜⬜⬜LayerCode 관련⬜⬜⬜⬜

    //🔺⬜⬜⬜LayerCode 관련 끝⬜⬜⬜

    //🔻🔵🔵🔵Factory 관련🔵🔵🔵🔵
    /**
     * Registers a subclass of `MOFactory` (e.g., `LayerFactory`, `SourceFactory`).
     * @param {MOFactory} factory - The factory to register.
     * @memberof MOGISMap
     * @throws {Error} If the provided factory is not a valid instance of `MOFactory`.
     */
    setFactory(factory) {
        if (factory instanceof MOFactory) {
            if (factory instanceof SourceFactory) {
                this.Factory.source = factory;
            } else if (factory instanceof LayerFactory) {
                this.Factory.layer = factory;
            } 
            // else if (factory instanceof StyleFactory) {
            //     this.#Factory.style = factory;
            // }
        } else {
            console.log(factory);
            throw new Error(`입력된 Factory가 적합한 인스턴스 아님`);
        }
    }

    

    //🔺🔵🔵🔵Factory 관련🔵🔵🔵🔵

    /* ===================================
    =======레이어 생성 관련 ============= 
    =====================================*/
   

    //🟨🟨🟨MOSubscriber 함수등록🟨🟨🟨🟨🟨🟨🟨🟨🟨
    /**
     * Updates the map based on the data from a registered publisher.
     * @param {Symbol} publisherID - The ID of the publisher to update from.
     * @throws {Error} If the publisher is not registered.
     */
    update(publisherID){
        let publisher = this.getPublisher(publisherID);
        if(!publisher) throw new Error(`등록되지 않은 Publisher 호출`);
        if(publisher instanceof LayerTree){
            let dataArr = publisher.PublisherData;
            if(dataArr&&dataArr.length>0){
                dataArr.forEach(ctrlObj=>{
                    this.ctrlLayer(ctrlObj[KEY.LAYER_ID], ctrlObj[KEY.BOOL_VISIBLE], ctrlObj[KEY.LAYER_PURPOSE_CATEGORY_KEY]);
                    this.ctrlOverlay(ctrlObj[KEY.LAYER_PURPOSE_CATEGORY_KEY],ctrlObj[KEY.BOOL_VISIBLE],ctrlObj[KEY.LAYER_ID]);
                });
            }
        }
    }

    //🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨


    /* 🔷SELECT Interaction 관련🔷 */

    /**
     * Enables or disables the select interaction on the map.
     * @param {boolean} [bool=true] - Whether to enable or disable the interaction.
     * @fires MOGISMap#select
     */
    enableSelect(bool=true){
        if(bool){
            //이미 interaction 생성되어 있다면 재기용
            if(this.INSTANCE.INTERACTION.SELECT instanceof Select){
                this.INSTANCE.MAP.addInteraction(this.INSTANCE.INTERACTION.SELECT);
                this.INSTANCE.MAP.on('pointermove',this.INSTANCE.INTERACTION.POINTER);
            }else{
            //아니면 생성
                this.#createSelectInteraction();
            }
        }else{
            if(this.INSTANCE.INTERACTION.SELECT){
            	this.INSTANCE.MAP.removeInteraction(this.INSTANCE.INTERACTION.SELECT);
            }
            if(this.INSTANCE.INTERACTION.POINTER){
            	this.INSTANCE.MAP.un('pointermove',this.INSTANCE.INTERACTION.POINTER);
            }
        }
    }

    /** interaction.select 관련 동작을 완전 제거 */
    #destoryEntireSelectInteraction(){
        this.INSTANCE.MAP.removeInteraction(this.INSTANCE.INTERACTION.SELECT);
        this.INSTANCE.INTERACTION.SELECT = undefined;
        this.INSTANCE.MAP.un('pointermove',this.INSTANCE.INTERACTION.POINTER);
        this.INSTANCE.INTERACTION.POINTER = undefined;
    }
    #createSelectInteraction(){
		let me =this;
        let selectInteraction;
        
        /** 마우스포인터 변경 및 selectInteraction 에 공통으로 사용되는 필터링 내용 */
        const filterFunction = (feature,layer)=>{
					let boolFeature = true;
					let boolLayer = layer.get(KEY.BOOL_SELECTABLE)&&layer.get(KEY.BOOL_SELECTABLE).toUpperCase() ==='Y';
					return boolFeature && boolLayer;
				};
        
        try{
            selectInteraction = new Select({
                hitTolerance : this.default_select.hitTolerance,
                multi : this.default_select.multi,
                style : createMOStyleFunction(`${KEY.HIGHLIGHT_SOURCE_LAYER_KEY}_mainMap`),
                filter: filterFunction,
            });
        }catch(e){
            console.error(e);
        }
        
        if(selectInteraction instanceof Select) {
            this.INSTANCE.INTERACTION.SELECT = selectInteraction;
            this.INSTANCE.MAP.addInteraction(selectInteraction);
        }

        //선택 가능한 레이어 위에서 포인터 변경
        this.INSTANCE.INTERACTION.POINTER = (e)=>{
            if(!e.dragging){
                let bool = e.map.forEachFeatureAtPixel(e.pixel,filterFunction
                ,{hitTolerance:this.default_select.hitTolerance})
        
                if(bool) e.map.getTargetElement().style.cursor='pointer';
                else     e.map.getTargetElement().style.cursor='';                
            }
        };
        
        this.INSTANCE.MAP.on('pointermove',this.INSTANCE.INTERACTION.POINTER);
    }
    
    /**
     * A callback function for the select interaction.
     * @callback featureCallback
     * @param {Feature} feature - The selected feature.
     * @param {Layer} layer - The layer containing the selected feature.
     */
    /**
     * Sets the callback function for the select interaction.
     * @param {featureCallback} callback - The callback function to execute when a feature is selected.
     * @throws {Error} If the callback is not a function.
     */
    setSelectCallback(callback){
        //선택될 때 동작(selectCallback)을 객체에 등록
        if(callback instanceof Function){
            //기존 interaction.select 를 아예 지움
            this.#destoryEntireSelectInteraction();
            //새로운 callbakc 을 내부에 저장
            this.INSTANCE.INTERACTION.SELECT_CALLBACK = callback;

            this.enableSelect(true);
        }else{
            throw new Error (`selectCallback 은 함수형태로 등록되어야 함`)
        }

        this.#attatchSelectCallbackToSelectInteraction();
    }

    /**
     * 기 등록된 selectCallback 을 ol.interaction.select 에 붙임
     */
    #attatchSelectCallbackToSelectInteraction(){
        if(!(this.INSTANCE.INTERACTION.SELECT_CALLBACK instanceof Function)) {
            throw new Error (`selectCallback 등록되지 않음. MOGISMap::setSelectCallback (callback) 등록 필요`);
        }

        //선택가능한 feature 선택때 selectCallback 을 호출하도록 등록
        if(this.INSTANCE.INTERACTION.SELECT instanceof Select){
            let me = this;
            this.INSTANCE.INTERACTION.SELECT.on('select',function(e){
                if(!e.auto){
                    let feature = me.INSTANCE.INTERACTION.SELECT.getFeatures().item(0);
                    let layer = feature? me.INSTANCE.INTERACTION.SELECT.getLayer(feature): undefined;
                    me.INSTANCE.INTERACTION.SELECT_CALLBACK(feature,layer);
                }
            });
        }
    }


    /* 🌐🌐주소검색 관련.. 🌐🌐*/

    /**
     * Adds a new layer to the map for displaying addresses.
     * @param {number} point_x - The x-coordinate of the address.
     * @param {number} point_y - The y-coordinate of the address.
     * @param {string} label - The label to display for the address.
     * @param {string} crs - The coordinate reference system of the provided coordinates.
     * @throws {Error} If the provided coordinates are not valid numbers.
     */
    addAddressLayer(point_x,point_y,label,crs){
        let digit_x = Number(point_x);
        let digit_y = Number(point_y);
        let bool_isLayerOnMap = false;
        if(isNumber(digit_x) && isNumber(digit_y)){
            
            let coord = [digit_x, digit_y];
            if(crs){
                coord = transform(coord,crs,this.default_viewSpec.projection);
            }

        //1. 기 발행 주소 레이어 있는지 체크
            let addressLayer = this.INSTANCE.LAYER[KEY.ADDRESS_SOURCE_LAYER_KEY];
        //1-1. 없으면 소스, 레이어 생성 | 있으면 레이어와 소스 접근자 생성
            if(!(addressLayer instanceof Layer)){
                addressLayer = this.Factory.layer.getSimpleVectorLayer();
                addressLayer.setZIndex(30);
                addressLayer.setSource(this.Factory.source.getSimpleVectorSource());
            }else{
                bool_isLayerOnMap = true;
            }
            let addressSource = addressLayer.getSource();
        //2. 주어진 좌표로 Feature 객체 생성
            let addressFeature;
            try{
                addressFeature= new Feature({geometry: new Point(coord)});
            }catch(e){
                console.log(`feature 생성오류 : ${coord}`);
                console.error(e)
            }
        //3. Feature 객체에 스타일 입히기
            let tempStyle = createMOStyleFunction('address');
            if(tempStyle instanceof Style){
                if(label) tempStyle.getText().setText(label);
            }else{
                throw new Error(`스타일 생성 에러`);
            }
            addressFeature.setStyle(tempStyle);
        //4. 소스에 추가
            if(addressSource instanceof VectorSource) {
                addressSource.addFeature(addressFeature);
            }else{
                throw new Error (`소스 구성 안됨`);
            }

        //4-1. 레이어 없는 상태였다면 ol.Map 에 추가
            if(!bool_isLayerOnMap){
                this.map.addLayer(addressLayer);
            }
        //5. 방금 추가한 feature 로 이동
            this.view.fit(addressFeature.getGeometry(),{duration:300, maxZoom:15});

            this.INSTANCE.LAYER[KEY.ADDRESS_SOURCE_LAYER_KEY] = addressLayer;
        }else{
            console.log(`입력좌표 : ${point_x}, ${point_y}`)
            throw new Error(`주어진 좌표가 적합한 숫자 (또는 문자) 가 아님`)
        }
        
        function isNumber(n) { return !isNaN(parseFloat(n)) && !isNaN(n - 0) }
    }

    /**
	 * Adds an array of features to the highlight layer.
	 * @param {Array<Feature>} features - An array of `ol.Feature` objects to add to the highlight layer.
	 * @throws {Error} If the geometry type of the features is not supported.
	 */
    addFeaturesToHighlightLayer(features){
		let bool_isLayerOnMap = false;
		if(features && features.length >0 && features[0] instanceof Feature){
			let geometryType = features[0].getGeometry().getType();
            let highlightLayer ;
            
		//1. 기 발행 주소 레이어 있는지 체크
			if(geometryType == 'Point'){
            	highlightLayer = this.INSTANCE.LAYER[KEY.HIGHLIGHT_SOURCE_LAYER_KEY].Point;
			} else if (geometryType == 'LineString'){
            	highlightLayer = this.INSTANCE.LAYER[KEY.HIGHLIGHT_SOURCE_LAYER_KEY].LineString;
			} else if (geometryType == 'Polygon' || geometryType == 'MultiPolygon'){
            	highlightLayer = this.INSTANCE.LAYER[KEY.HIGHLIGHT_SOURCE_LAYER_KEY].Polygon;
			} else{
				throw new Error(`geometry 타입은 Point, LineString, Polygon, MultiPolygon만 가능`)
			}
		
        	//1-1. 없으면 소스, 레이어 생성 | 있으면 레이어와 소스 접근자 생성
            if(!(highlightLayer instanceof Layer)){
                highlightLayer = this.Factory.layer.getSimpleVectorLayer();
                highlightLayer.setSource(this.Factory.source.getSimpleVectorSource());
            }else{
				bool_isLayerOnMap = true;
			}
            let highlightSource = highlightLayer.getSource();
            
        //2. 입력된 feature들을 source 에 추가
        	if(highlightSource instanceof VectorSource){
				highlightSource.addFeatures(features);
			}else{
				throw new Error ('적합한 벡터 소스가 아님')
			}
            
        //3. 레이어에 스타일 입히기
            let tempStyle = createMOStyleFunction(KEY.HIGHLIGHT_SOURCE_LAYER_KEY);
            highlightLayer.setStyle(tempStyle);
        
        //4. 레이어 없는 상태였다면 ol.Map 에 추가
            if(!bool_isLayerOnMap){
                this.map.addLayer(highlightLayer);
            }else{
				//소스에 features 추가한 상태라면 리프레시
				highlightSource.refresh();
			}
            this.INSTANCE.LAYER[KEY.HIGHLIGHT_SOURCE_LAYER_KEY][geometryType] = highlightLayer;
			
			
		}
	}


    //🟠🟠Overlay 관련 🟠🟠🟠🟠

    /**
     * Adds a `MOOverlay` instance to the map.
     * @param {MOOverlay} moverlay - The `MOOverlay` instance to add.
     * @param {KEY.LayerPurpose} la_pu_cate_key - The layer purpose category key.
     * @param {string} [layer_id='default'] - The ID of the layer to associate the overlay with.
     * @throws {Error} If the provided overlay is not a valid `MOOverlay` instance.
     */
    addMOverlay(moverlay,la_pu_cate_key, layer_id='default'){

        if(moverlay instanceof Overlay){
            //1. la_pu_cate_key 있음
            let targetMap;
            if(this.isValid_layerPurposeCategoryKey(la_pu_cate_key)){
                targetMap = this.INSTANCE.OVERLAY[la_pu_cate_key];
            }else{
                targetMap = this.INSTANCE.OVERLAY.default;
            }

            //2. layer_id 있음
            if(layer_id){
                let overlayArr = targetMap.get(layer_id);
                if(overlayArr instanceof Array){
                    overlayArr.push(moverlay);
                }else{
                    overlayArr = [moverlay];
                    targetMap.set(layer_id,overlayArr);
                }
            }
            

        }else{
            throw new Error(`overlay 가 MOOverlay 객체가 아님`);
        }
    }

    /**
     * Discards a `MOOverlay` instance from the map.
     * @param {KEY.LayerPurpose} la_pu_cate_key - The layer purpose category key.
     * @param {string} [layer_id='default'] - The ID of the layer to remove the overlay from.
     * @param {string} [mOverlay_id] - The ID of the `MOOverlay` instance to remove.
     * @throws {Error} If the overlay group is not valid.
     */
    discardMOverlay (la_pu_cate_key, layer_id='default', mOverlay_id){
        let moverlayGroupMap;
        if(this.isValid_layerPurposeCategoryKey(la_pu_cate_key)){
            moverlayGroupMap = this.INSTANCE.OVERLAY[la_pu_cate_key];
        }else{
            moverlayGroupMap = this.INSTANCE.OVERLAY.default;
        }

        if(moverlayGroupMap instanceof Map){
            //1. 특정 레이어에 속하는 오버레이만 제거
            if(layer_id){
				if(moverlayGroupMap.size==0) return;
                moverlayGroupMap.get(layer_id).forEach(mOverlay=>{
                    this.map.removeOverlay(mOverlay);
                });
                moverlayGroupMap.clear();
            }else{
                throw new Error (`오버레이가 속한 레이어의 아이디가 필요함 : ${layer_id}`)
            }
        }else{
            throw new Error (`overlay group 이 적합하지 않음`);
        }
    }

    /**
     * Controls the visibility of a `MOOverlay` instance or a group of overlays.
     * @param {KEY.LayerPurpose} la_pu_cate_key - The layer purpose category key.
     * @param {boolean} visible - Whether to show or hide the overlay(s).
     * @param {string} [layer_id='default'] - The ID of the layer to control the overlays for.
     * @throws {Error} If the `layer_id` is not specified.
     */
    ctrlOverlay(la_pu_cate_key,visible,layer_id='default'){
        let overlayGroup;
        if(this.isValid_layerPurposeCategoryKey(la_pu_cate_key)){
            overlayGroup = this.INSTANCE.OVERLAY[la_pu_cate_key];
        }else{
            overlayGroup = this.INSTANCE.OVERLAY.default;
        }
		
        if(overlayGroup instanceof Map && overlayGroup.size>0){

            if(layer_id){
                let moverlayArr = overlayGroup.get(layer_id);
                if(moverlayArr instanceof Array){
                    if(visible) {
						moverlayArr.forEach(moverlay=>{
							this.map.addOverlay(moverlay);
						});
						this.view.dispatchEvent('change:resolution');
					}else moverlayArr.forEach(moverlay=>this.map.removeOverlay(moverlay));
                }
            }else{
                throw new Error(`layer_id 명시되어야 합니다 기본 : 'default'`)
            }
        }
    }
    
    
    
    /**
     * Gets the style function for the highlight layer.
     * @returns {Function} The style function for the highlight layer.
     */
    getStyleFunc_HIGHTLIGHT(){
        createMOStyleFunction(KEY.HIGHLIGHT_SOURCE_LAYER_KEY);
    }
    
    /* 🌐🌐의사결정지원 팝업 관련 🌐🌐*/

    /**
     * Adds a new layer to the map for displaying decision support popups.
     * @param {number} point_x - The x-coordinate of the popup.
     * @param {number} point_y - The y-coordinate of the popup.
     * @param {string} label - The label to display for the popup.
     * @param {string} crs - The coordinate reference system of the provided coordinates.
     * @param {string} txt - The text content of the popup.
     * @param {string} checkClass - The CSS class to apply to the popup.
     * @param {number[]} offset - The offset of the popup in pixels.
     * @throws {Error} If the provided coordinates are not valid numbers.
     */
    addDecisionLayer(point_x,point_y,label,crs,txt,checkClass,offset){
        let digit_x = Number(point_x);
        let digit_y = Number(point_y);
        
        let bool_isLayerOnMap = false;
        
        if(isNumber(digit_x) && isNumber(digit_y)){
            
            let coord = [digit_x, digit_y];
            if(crs){
                coord = transform(coord,crs,this.default_viewSpec.projection);
            }
            
            this.map.removeLayer(mainMap.INSTANCE.MAP.getLayerGroup().values_.layers.array_[6]);
            
            //1. 기 발행 주소 레이어 있는지 체크
            let defaultLayer = this.INSTANCE.LAYER['default'];
            defaultLayer = '';
            //1-1. 없으면 소스, 레이어 생성 | 있으면 레이어와 소스 접근자 생성
            if(!(defaultLayer instanceof Layer)){
                defaultLayer = this.Factory.layer.getSimpleVectorLayer();
                defaultLayer.setSource(this.Factory.source.getSimpleVectorSource());
            }else{
                bool_isLayerOnMap = true;
            }
            let defaultSource = defaultLayer.getSource();
            
            //2. 주어진 좌표로 Feature 객체 생성
            let defaultFeature;
            
            try{
                defaultFeature= new Feature({
                            geometry: new Point(coord)
                        });
            }catch(e){
                console.log(`feature 생성오류 : ${coord}`);
                console.error(e)
            }
            
            //4. 소스에 추가
            if(defaultSource instanceof VectorSource) {
                defaultSource.addFeature(defaultFeature);
            }else{
                throw new Error (`소스 구성 안됨`);
            }


            //4-1. 레이어 없는 상태였다면 ol.Map 에 추가
            if(!bool_isLayerOnMap){
                this.map.addLayer(defaultLayer);
            }

            //5. 팝업창 만들기
            let element = document.createElement('div');
            element.classList.add(checkClass);
            element.innerHTML = txt;
            document.body.appendChild(element);
    
            let popup = new ol.Overlay({
                element: element,
                positioning: 'bottom-center',
                stopEvent: false,
                offset: offset
            });
          
            this.map.addOverlay(popup);
            
            let coordinates = defaultFeature.getGeometry().getCoordinates();
              
            popup.setPosition(coordinates);
          
            this.INSTANCE.LAYER['default'] = defaultLayer;
            
        }else{
            console.log(`입력좌표 : ${point_x}, ${point_y}`)
            throw new Error(`주어진 좌표가 적합한 숫자 (또는 문자) 가 아님`)
        }
        
        function isNumber(n) { return !isNaN(parseFloat(n)) && !isNaN(n - 0) }
    }

}
