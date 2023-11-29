import * as KEY from '../common/MO.keyMap.js';
import { MOFactory } from "./abstract/MO.Factory.js";
import { SourceFactory } from "./MO.SourceFactory.js";
import { LayerFactory } from "./MO.LayerFactory.js";
import { createStyleFunction } from './MO.StyleFunctionFactory.js';
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
import { MOSimpleMap } from './MO.MOSimpleMap.js';


/**
 * ol.Map 확장하고 지도와 레이어 생성을 관장하는 Controller 역할수행
 *
 * @export
 * @class MOGISMap
 * @author jhoh
 */
export class MOGISMap extends MOSimpleMap{
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

    #Factory = {
        /**@type {SourceFactory} */
        source: undefined,
        /**@type {LayerFactory} */
        layer: undefined,
    };

    INSTANCE={
        /** @type {olMap|undefined} */
        MAP:undefined,
        /**@type {View|undefined} */
        VIEW:undefined,
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
        }
    }

    /**목적 별
     * 소스+레이어 정보 코드 리스트
     * @type {object}
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
        pipnet:[], 
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
    /**목적 별 
     * ol.layer 들의 리스트
     *  layerCodeObject 상 KEY.LAYER_ID 를 key로, 레이어객체를 value 로 함
     */
    layers={
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
        pipnet: new Map(), 
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
        super(mapConfigSpec,NAME='MOGISMap');
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

    //🔻⬜⬜⬜⬜⬜LayerCode 관련⬜⬜⬜⬜

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

    

    //🔺🔵🔵🔵Factory 관련🔵🔵🔵🔵

    /* ===================================
    =======레이어 생성 관련 ============= 
    =====================================*/
   

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


    /* 🔷SELECT Interaction 관련🔷 */

    /**
     * MOGISMap 객체의 Vector Source Layer 에 대해, Layer 가 선택 가능한 상태라면,
     * 레이어를 구성하는 feature 들과 상호작용할 수 있도록 켜거나 끔
     * @param {boolean} [bool=true] 
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
            this.INSTANCE.MAP.removeInteraction(this.INSTANCE.INTERACTION.SELECT);
            this.INSTANCE.MAP.un('pointermove',this.INSTANCE.INTERACTION.POINTER);
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
        let selectInteraction;
        try{
            selectInteraction = new Select({
                hitTolerance : this.default_select.hitTolerance,
                multi : this.default_select.multi,
                style : createStyleFunction(KEY.HIGHLIGHT_SOURCE_LAYER_KEY),
                layers: function(layer){
                    return layer.get(KEY.BOOL_SELECTABLE)?.toUpperCase() ==='Y'
                }
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
                let bool = e.map.forEachFeatureAtPixel(e.pixel,(feature,layer)=>{
                            if(layer.get(KEY.BOOL_SELECTABLE)=='Y') return true;                
                            else return false;                       
                        },{hitTolerance:this.default_select.hitTolerance})
        
                if(bool) e.map.getTargetElement().style.cursor='pointer';
                else     e.map.getTargetElement().style.cursor='';                
            }
        };
        
        this.INSTANCE.MAP.on('pointermove',this.INSTANCE.INTERACTION.POINTER);
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
                    let feature = me.INSTANCE.INTERACTION.SELECT.getFeatures()?.getArray()[0];
                    let layer = feature? me.INSTANCE.INTERACTION.SELECT.getLayer(feature): undefined;
                    me.INSTANCE.INTERACTION.SELECT_CALLBACK(feature,layer);
                }
            });
        }
    }


    /* 🌐🌐주소검색 관련.. 🌐🌐*/

    

    /**
     * 주어진 x,y 좌표를 주소검색용 레이어에 발행하는 함수
     * @param {number} point_x - x 좌표 숫자 int or float
     * @param {number} point_y - y 좌표 숫자 int or float
     * @param {string} label - 주소에 표현할 라벨
     * @param {string} crs - 좌표계 e.g. "EPSG:5186"
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
            let addressLayer = this.layers[KEY.ADDRESS_SOURCE_LAYER_KEY];
        //1-1. 없으면 소스, 레이어 생성 | 있으면 레이어와 소스 접근자 생성
            if(!(addressLayer instanceof Layer)){
                addressLayer = this.#Factory.layer.getSimpleVectorLayer();
                addressLayer.setSource(this.#Factory.source.getSimpleVectorSource());
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
            let tempStyle = createStyleFunction('address');
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

        }else{
            console.log(`입력좌표 : ${point_x}, ${point_y}`)
            throw new Error(`주어진 좌표가 적합한 숫자 (또는 문자) 가 아님`)
        }
        
        function isNumber(n) { return !isNaN(parseFloat(n)) && !isNaN(n - 0) }
    }

    /**
	 * 피쳐 객체들로 구성된 VectorImage 레이어 구성하고
	 * Highlight 화 함
	 * @param {Array<Feature>} features - openlayers feature 객체 배열 
	 */
    addFeaturesToHighlightLayer(features){
		let bool_isLayerOnMap = false;
		if(features?.length >0 && features[0] instanceof Feature){
			let geometryType = features[0].getGeometry().getType();
            let highlightLayer ;
            
		//1. 기 발행 주소 레이어 있는지 체크
			if(geometryType == 'Point'){
            	highlightLayer = this.layers[KEY.HIGHLIGHT_SOURCE_LAYER_KEY].Point;
			} else if (geometryType == 'LineString'){
            	highlightLayer = this.layers[KEY.HIGHLIGHT_SOURCE_LAYER_KEY].LineString;
			} else if (geometryType == 'Polygon' || geometryType == 'MultiPolygon'){
            	highlightLayer = this.layers[KEY.HIGHLIGHT_SOURCE_LAYER_KEY].Polygon;
			} else{
				throw new Error(`geometry 타입은 Point, LineString, Polygon, MultiPolygon만 가능`)
			}
		
        	//1-1. 없으면 소스, 레이어 생성 | 있으면 레이어와 소스 접근자 생성
            if(!(highlightLayer instanceof Layer)){
                highlightLayer = this.#Factory.layer.getSimpleVectorLayer();
                highlightLayer.setSource(this.#Factory.source.getSimpleVectorSource());
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
            let tempStyle = createStyleFunction(KEY.HIGHLIGHT_SOURCE_LAYER_KEY);
            highlightLayer.setStyle(tempStyle);
        
        //4. 레이어 없는 상태였다면 ol.Map 에 추가
            if(!bool_isLayerOnMap){
                this.map.addLayer(highlightLayer);
            }else{
				//소스에 features 추가한 상태라면 리프레시
				highlightSource.refresh();
			}
            this.layers[KEY.HIGHLIGHT_SOURCE_LAYER_KEY][geometryType] = highlightLayer;
			
			
		}
	}
}