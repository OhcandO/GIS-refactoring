import * as KEY from '../common/keyMap';
import { SourceFactory } from '../factory/SourceFactory';
import { LayerFactory } from '../factory/LayerFactory';
import { createMOStyleFunction } from '../factory/StyleFunctionFactory';
import OlMap from 'ol/Map';
import View from 'ol/View';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import Layer from 'ol/layer/Layer';
import { MOSubscriber } from '../abstract/Subscriber';
import { MOFactory } from '../abstract/Factory';
import { MouseWheelZoom, defaults as defaultInteraction } from 'ol/interaction';
import LayerGroup from 'ol/layer/Group';

import type { LayerCodeObj, MOGISMapConfig, LayerStore } from '../types';
import type { LayerPurpose } from '../types/enums';

/**
 * MOGISMap 객체를 생성하기 위한 파라미터 정의
 */

/** INSTANCE 내부 구조 (MOSimpleMap 수준) */
interface SimpleMapInstance {
    /** @type {OlMap|undefined} */
    MAP: OlMap | undefined;
    /** @type {View|undefined} */
    VIEW: View | undefined;
    LAYER: {
        /** @type {Array<Layer>|undefined} */
        BACKGROUND?: Layer[];
        /** 목적설정 안된 레이어들 */
        default: Map<number, Layer>;
        highlight: {
            Point?: Layer;
            LineString?: Layer;
            Polygon?: Layer;
        };
        [key: string]: Map<number, Layer> | Layer | Layer[] | object | undefined;
    };
}

/** Factory 구조 */
interface FactoryStore {
    source: SourceFactory;
    layer: LayerFactory;
}

/** View 기본 스펙 */
interface ViewSpec {
    /**
     * Openlayers 뷰 포트 객체가 표현하는 좌표계.
     * 배경지도의 원본 좌표계를 설정해 이미지가 열화 없이 표출되도록 함
     * @default 'EPSG:3857' vworld 배경지도 좌표계
     */
    projection: string;
    center: [number, number];
    enableRotation: boolean;
    zoom: number;
    constrainResolution: boolean;
    resolutions: number[] | undefined;
    [key: string]: any;
}

/** Map 기본 스펙 */
interface MapSpec {
    /** Map 이 생성될 기본 DIV id */
    target: string;
    [key: string]: any;
}

/** Select 기본 스펙 */
interface SelectSpec {
    hitTolerance: number;
    multi: boolean;
    [key: string]: any;
}

/**
 *
 * @export
 * @author jhoh
 */
export class MOSimpleMap extends MOSubscriber {
    default_viewSpec: ViewSpec = {
        /**
         * Openlayers 뷰 포트 객체가 표현하는 좌표계.
         * 배경지도의 원본 좌표계를 설정해 이미지가 열화 없이 표출되도록 함
         * @default 'EPSG:3857' vworld 배경지도 좌표계
         * @memberof MOMapConfig
         */
        projection: `EPSG:3857`, //google map projected Pseudo-Mercator coordinate system. Also Vworld basemap coordinate
        center: [14142459.590502, 4506517.583030],
        enableRotation: false,
        zoom: 12,
        constrainResolution: true,
        resolutions: undefined,
    };

    /** ol.Map 객체의 기본 정보*/
    default_mapSpec: MapSpec = {
        /** Map 이 생성될 기본 DIV id */
        target: "map",
    };

    default_select: SelectSpec = {
        hitTolerance: 10,
        multi: false,
    };

    Factory: FactoryStore = {
        /**@type {SourceFactory} */
        source: new SourceFactory(),
        /**@type {LayerFactory} */
        layer: new LayerFactory(),
    };

    INSTANCE: SimpleMapInstance = {
        /** @type {OlMap|undefined} */
        MAP: undefined,
        /**@type {View|undefined} */
        VIEW: undefined,
        LAYER: {
            /** @type {Array<Layer>|undefined} */
            BACKGROUND: undefined,
            /** 목적설정 안된 레이어들
             * @type {Map<number,Layer>}*/
            default: new Map(),
            highlight: {
                /** @type {Layer|undefined} */
                Point: undefined,
                LineString: undefined,
                Polygon: undefined,
            }
        }
    };

    /**목적 별
     * 소스+레이어 정보 코드 리스트
     */
    layerCodeObject: Record<string, LayerCodeObj[]> = {
        default: [],
    };

    /**
     * 기본 배경지도의 소스(API키 포함)+레이어 정보 코드 리스트
     */
    layerCode_Background: LayerCodeObj[] = [];

    /**
     * 입력한 변수들을 Map 또는 View 객체 생성을 위한 변수로 할당
     * @param mapConfigSpec
     */
    constructor(mapConfigSpec: MOGISMapConfig, NAME: string = 'MOGISMap') {
        super(NAME);
        if (mapConfigSpec instanceof Object && mapConfigSpec.target) {
            Object.entries(mapConfigSpec).forEach(([key, val]) => {
                if (Object.keys(this.default_mapSpec).includes(key)) (this.default_mapSpec as Record<string, any>)[key] = val;
                if (Object.keys(this.default_viewSpec).includes(key)) (this.default_viewSpec as Record<string, any>)[key] = val;
                if (Object.keys(this.default_select).includes(key)) (this.default_select as Record<string, any>)[key] = val;
            });
        } else {
            throw new Error(`지도객체 위치할 'target'(=DIV html Element) 의 ID 값을 정의해야 합니다.`);
        }
    }

    get map(): OlMap {
        if (!this.INSTANCE.MAP) this.createMapObj();
        return this.INSTANCE.MAP!;
    }

    private createMapObj(): void {
        this.INSTANCE.MAP = new OlMap({
            target: this.default_mapSpec.target,
            view: this.view,
            controls: [],
            interactions: defaultInteraction({ doubleClickZoom: false, mouseWheelZoom: false }).extend([new MouseWheelZoom({ constrainResolution: true, duration: 150, timeout: 50 }),])
        });
    }

    get view(): View {
        if (!this.INSTANCE.VIEW) {
            this.INSTANCE.VIEW = new View(this.default_viewSpec);
        }
        return this.INSTANCE.VIEW;
    }

    set view(view_inst: View) {
        if (view_inst instanceof View) {
            this.INSTANCE.VIEW = view_inst;
        } else {
            console.log(view_inst);
            throw new Error(`Openlayers 뷰 인스턴스가 아님`);
        }
    }

    get baseLayers(): Layer[] {
        if (this.INSTANCE.MAP) {
            return this.INSTANCE.MAP.getLayers().getArray().filter(layer => layer.get('isBase')) as Layer[];
        } else {
            console.log(`오픈레이어스 지도 객체 생성되지 않음`);
            return [];
        }
    }

    //LayerCode 관련

    /**
     * 레이어 소스 + 스타일 JSON 등록
     * @param layerCDArr 레이어코드 json 배열
     * @param categoryKey 레이어코드 구분자. 각종 openlayers 인스턴스의 그룹명이 된다
     * @memberof MOGISMap
     */
    setLayerCode(layerCDArr: LayerCodeObj[] | LayerCodeObj, categoryKey?: string): void {
        if (layerCDArr instanceof Array) {
            if (categoryKey) {

                //카테고리 키도 입력
                layerCDArr.forEach(layerCode => {
                    (layerCode as any)[KEY.LAYER_PURPOSE_CATEGORY_KEY] = categoryKey;
                });
                //PK 검사(레이어 아이디)해 같으면 덮어씌우면서 병합
                this.layerCodeObject[categoryKey] = layerCDArr.reduce((pre: LayerCodeObj[], cur: LayerCodeObj) => {
                    const tempArr = pre.filter(a => (a as any)[KEY.LAYER_ID] != (cur as any)[KEY.LAYER_ID]);
                    tempArr.push(cur);
                    return tempArr;
                }, this.layerCodeObject[categoryKey]);

            } else {
                this.layerCodeObject['default'] = layerCDArr;
            }
        } else if ((layerCDArr as any)[KEY.LAYER_ID]) {
            if (categoryKey) {

                //카테고리 키도 입력
                (layerCDArr as any)[KEY.LAYER_PURPOSE_CATEGORY_KEY] = categoryKey;

                //PK 검사
                //같은게 있으면 덮어씌우기, 없으면 그냥 push
                if (this.layerCodeObject[categoryKey].some(obj => (obj as any)[KEY.LAYER_ID] == (layerCDArr as any)[KEY.LAYER_ID])) {
                    console.group(`새로운 layerCodeObj 로 기존 내용 덮어씁니다`);
                    console.log(`기 등록 layerCodeObj`, this.layerCodeObject[categoryKey].find(el => (el as any)[KEY.LAYER_ID] == (layerCDArr as any)[KEY.LAYER_ID]));
                    console.log(`현재 layerCodeObj`, layerCDArr);
                    console.groupEnd();
                    const temparr = this.layerCodeObject[categoryKey].filter(el => (el as any)[KEY.LAYER_ID] == (layerCDArr as any)[KEY.LAYER_ID]);
                    temparr.push(layerCDArr as LayerCodeObj);
                    this.layerCodeObject[categoryKey] = temparr;
                } else this.layerCodeObject[categoryKey].push(layerCDArr as LayerCodeObj);

            } else {
                this.layerCodeObject['default'] = [layerCDArr as LayerCodeObj];
            }
        } else {
            console.error(`layerCode JSON 객체가 적합하지 않음`);
            throw new Error(`layerCode JSON 객체가 적합하지 않음`);
        }
    }

    /**
     * 레이어 소스 JSON 등록
     * @param layerCDArr
     * @memberof MOGISMap
     */
    setBaseLayerCodeArr(layerCDArr: LayerCodeObj[]): void {
        if (layerCDArr instanceof Array) {
            this.layerCode_Background = layerCDArr;
        } else {
            console.error(`layerCode JSON 객체가 적합하지 않음`);
            throw new Error(`layerCode JSON 객체가 적합하지 않음`);
        }
    }

    getLayerCodeArr(la_pu_cate_key: string): string | undefined {
        if (this.isValid_layerPurposeCategoryKey(la_pu_cate_key)) {
            return JSON.stringify(this.layerCodeObject[la_pu_cate_key]);
        }
        return undefined;
    }

    /**
     * 레이어 아이디로 LayerCode 를 찾아 반환
     * @param layerID
     * @param la_pu_cate_key
     * @return
     * @memberof MOGISMap
     */
    private getALayerCode(layerID: string | number, la_pu_cate_key?: string): LayerCodeObj {
        if (layerID) {
            let tempArr: LayerCodeObj[];
            if (this.isValid_layerPurposeCategoryKey(la_pu_cate_key)) {
                tempArr = this.layerCodeObject[la_pu_cate_key!];
            } else {
                tempArr = Object.values(this.layerCodeObject).flat();
            }
            let layerCodeObj = tempArr.find(code => (code as any)[KEY.LAYER_ID] == layerID);
            if (layerCodeObj) {
                return layerCodeObj;
            } else {
                console.error(`적합한 layerCodeObj 없음`);
                console.log(`찾은 레이어 아이디 : ${layerID}`);
                throw new Error(`적합한 layerCodeObj 없음`);
            }
        } else {
            throw new Error(`레이어아이디 적합하지 않음 : ${layerID}`);
        }
    }
    //LayerCode 관련 끝


    /* ===================================
    =======레이어 생성 관련 =============
    =====================================*/

    //1. 배경지도 레이어 생성 및 지도에 발행
    setBaseLayer(): void {
        if (!(this.INSTANCE.MAP instanceof OlMap)) this.createMapObj();

        if ((this.layerCode_Background && this.layerCode_Background.length) > 0 && this.isValid_factories()) {
            let baseLayers: Layer[] = [];
            baseLayers = this.layerCode_Background.map(baseConfig => {
                this.assignLayerCodeToFactories(baseConfig);

                let source: any;
                try {
                    source = this.Factory.source.getSource();
                } catch (e) {
                    console.error(e);
                }
                this.Factory.layer.setSource(source);
                let layer: Layer | undefined;
                try {
                    layer = this.Factory.layer.getBaseLayer();
                } catch (e) {
                    console.error(e);
                }
                return layer!;
            });
            if (baseLayers.length > 0) {
                this.INSTANCE.MAP!.setLayers(baseLayers);
                this.INSTANCE.LAYER.BACKGROUND = baseLayers;
            }
        } else {
            let source = new OSM();
            let layer = new TileLayer({ source: source });
            console.log('%cemergency layer activated', KEY.CONSOLE_DECO.BODY);
            this.INSTANCE.MAP!.setLayers([layer]);
        }
    }


    //MOSubscriber 함수등록
    /**
     *
     * @param publisherID
     */
    update(publisherID: symbol): void {
        let publisher = this.getPublisher(publisherID);
        if (!publisher) throw new Error(`등록되지 않은 Publisher 호출`);
        // LayerTree 타입 체크 - 런타임에서 확인
        if ((publisher as any).PublisherData) {
            let dataArr = (publisher as any).PublisherData;
            if (dataArr && dataArr.length > 0) {
                dataArr.forEach((ctrlObj: any) => {
                    this.ctrlLayer(ctrlObj[KEY.LAYER_ID], ctrlObj[KEY.BOOL_VISIBLE], ctrlObj[KEY.LAYER_PURPOSE_CATEGORY_KEY]);
                });
            }
        }
    }


    /**
     * 레이어 코드 아이디로 레이어 관리 (주로 LayerTree 에서)
     * @param layer_id
     * @param visible 레이어객체 setVisible 값
     * @param la_pu_cate_key 레이어 목적구분
     * @returns
     */
    ctrlLayer(layer_id: number, visible: boolean = true, la_pu_cate_key?: string): Promise<void> {

        let targetLayer = this.getLayer(layer_id, la_pu_cate_key);

        if (targetLayer instanceof Layer || (targetLayer as any) instanceof LayerGroup) { //기 발행 레이어 있는 경우
            targetLayer.setVisible(visible);
            return Promise.resolve();
        } else if (visible) { //기 발행 레이어 없는데 켜야하는 경우
            this.addLayerToMap(layer_id, la_pu_cate_key)
                .then(() => Promise.resolve());
        } else {
            // 기 발행되지도 않았고, setVisible(false)인 상황
            return Promise.resolve();
        }
        return Promise.resolve();
    }

    /**
     * 레이어 아이디 (와 레이어 카테고리 키)로 기 발행 레이어 반환
     * @param layer_id 레이어 식별자
     * @param la_pu_cate_key 레이어 카테고리 식별키
     */
    protected getLayer(layer_id: number, la_pu_cate_key?: string): Layer | undefined {
        if (!KEY.isNumeric(layer_id)) {
            throw new Error(`'layer_id' 값이 숫자가 아님: ${layer_id}`);
        }
        let layerId = Number(layer_id);
        let targetLayer: Layer | undefined;
        if (this.isValid_layerPurposeCategoryKey(la_pu_cate_key)) {
            const layerMap = this.INSTANCE.LAYER[la_pu_cate_key!] as Map<number, Layer>;
            targetLayer = layerMap.get(layerId);
        } else {
            const allLayers = this.INSTANCE.MAP!.getLayers().getArray();
            targetLayer = allLayers.find(layer => layer.get(KEY.LAYER_ID) === layerId) as Layer | undefined;
        }
        return targetLayer;
    }

    /**
     * 기 발행된 레이어객체를 제거하고 레이어 참조위치도 제거
     * @param layer_id 레이어 식별자
     * @param la_pu_cate_key 레이어 카테고리 식별키
     */
    discardLayer(layer_id: number, la_pu_cate_key?: string): void {
        let targetLayer = this.getLayer(layer_id, la_pu_cate_key);
        if (!(targetLayer instanceof Layer)) return;
        this.INSTANCE.MAP!.removeLayer(targetLayer);
        let layerMap: any;
        if (la_pu_cate_key) {
            layerMap = this.INSTANCE.LAYER[la_pu_cate_key];
            if (layerMap instanceof Map) layerMap.delete(layer_id);
        } else {
            Object.values(this.INSTANCE.LAYER).forEach(mm => {
                if (mm instanceof Map && mm.has(layer_id)) mm.delete(layer_id);
            });
        }
    }

    /**
     * 발행되었던 레이어 그룹을 초기화 함
     * @param la_pu_cate_key
     */
    removeLayerGroup(la_pu_cate_key: string): void {
        if (la_pu_cate_key === KEY.ADDRESS_SOURCE_LAYER_KEY) {

            if (this.INSTANCE.LAYER[KEY.ADDRESS_SOURCE_LAYER_KEY]) {
                this.map.removeLayer(this.INSTANCE.LAYER[KEY.ADDRESS_SOURCE_LAYER_KEY] as Layer);
                this.INSTANCE.LAYER[KEY.ADDRESS_SOURCE_LAYER_KEY] = undefined;
            }
        } else if (la_pu_cate_key === KEY.HIGHLIGHT_SOURCE_LAYER_KEY) {
            const highlight = this.INSTANCE.LAYER.highlight;
            Object.values(highlight).flat().forEach((layer: Layer | undefined) => { if (layer) this.map.removeLayer(layer); });
            highlight.LineString = undefined;
            highlight.Point = undefined;
            highlight.Polygon = undefined;

        } else if (this.isValid_layerPurposeCategoryKey(la_pu_cate_key)) {
            let layerMap = this.INSTANCE.LAYER[la_pu_cate_key];
            if (layerMap instanceof Map) {
                [...layerMap.values()].forEach(layer => this.map.removeLayer(layer as Layer));
                layerMap.clear();
                console.log(`${la_pu_cate_key} 레이어 그룹을 초기화 했습니다`);
            }
        }
    }

    /**
     * 레이어아이디로 Factory 통해 ol.Layer 생성 및 반환
     *
     * @param layerCodeId
     * @param layerObjCategoryKey
     * @memberof MOGISMap
     * @returns
     */
    private createLayerWithID(layerCodeId: string | number, layerObjCategoryKey?: string): Layer {
        let layerCode: LayerCodeObj | undefined;
        try {
            layerCode = this.getALayerCode(layerCodeId, layerObjCategoryKey);
        } catch (e) {
            console.error(e);
        }
        if (layerCode) {
            this.assignLayerCodeToFactories(layerCode);
        }

        let source: any, layer: Layer | undefined;
        try {
            source = this.Factory.source.getSource();
            this.Factory.layer.setSource(source);
        } catch (e) { console.error(e); }

        try {
            layer = this.Factory.layer.getLayer();
        } catch (e) { console.error(e); }

        if (layerCode && (layerCode as any)[KEY.SOURCE_CLASS] == 'vector') {
            try {
                (layer as any).setStyle(createMOStyleFunction(layerCode as any) as any);
            } catch (e) {
                console.error(e);
            }
        }
        if (layer) return layer;
        else throw new Error(`layer 생성되지 않음`);
    }

    /**
     * 레이어 아이디로 ol.Map 객체에 레이어 추가
     *
     * @param layerCodeID
     * @param la_pu_cate_key
     * @memberof MOGISMap
     * @returns
     */
    private addLayerToMap(layerCodeID: number, la_pu_cate_key?: string): Promise<void> {
        let layer: Layer | undefined;
        try {
            layer = this.createLayerWithID(layerCodeID, la_pu_cate_key);
        } catch (e) { console.error(e); }
        return new Promise<void>((res, rej) => {
            if (layer) {
                //레이어를 맵에 등록
                if (this.isValid_layerPurposeCategoryKey(la_pu_cate_key)) {
                    (this.INSTANCE.LAYER[la_pu_cate_key!] as Map<number, Layer>).set(layerCodeID, layer);
                } else {
                    this.INSTANCE.LAYER['default'].set(layerCodeID, layer);
                }
                layer.once('postrender', function () {
                    res();
                });
                this.INSTANCE.MAP!.addLayer(layer);
            } else {
                rej();
            }
        });
    }

    isValid_layerPurposeCategoryKey(key?: string | null): boolean {
        let bool = false;
        if (key) {
            bool = Object.values(KEY.LAYER_PURPOSE_CATEGORY).map(e => e[0]).includes(key as any);
        }
        return bool;
    }

    /**
     * 레이어를 생성하기위한 소스,스타일이 정의된 설정을
     * Factory 서브클래스들에게 전달
     *
     * @param layerCode
     * @memberof MOGISMap
     */
    protected assignLayerCodeToFactories(layerCode: Partial<LayerCodeObj>): void {
        if (this.isValid_factories()) {
            Object.values(this.Factory).forEach(subFactory => subFactory.setSpec(layerCode));
        }
    }

    isValid_factories(): boolean {
        let bool = false;
        // Factory 에 등록된 모든 요소들이 MOFactory 의 서브클래스인지 확인
        bool = Object.values(this.Factory).every(fac => fac instanceof MOFactory);
        return bool;
    }

}
