import * as KEY from '../common/keyMap';
import { MOFactory } from '../abstract/Factory';
import { SourceFactory } from '../factory/SourceFactory';
import { LayerFactory } from '../factory/LayerFactory';
import { createMOStyleFunction } from '../factory/StyleFunctionFactory';
import OlMap from 'ol/Map';
import View from 'ol/View';
import Select from 'ol/interaction/Select';
import Feature from 'ol/Feature';
import Layer from 'ol/layer/Layer';
import { Point } from 'ol/geom';
import { transform } from 'ol/proj';
import { Style } from 'ol/style';
import VectorSource from 'ol/source/Vector';
import Overlay from 'ol/Overlay';
import { MOSimpleMap } from './MOSimpleMap';

import type { LayerCodeObj, MOGISMapConfig } from '../types';
import type { LayerPurpose } from '../types/enums';
import type MapBrowserEvent from 'ol/MapBrowserEvent';

/** MOOverlay 타입 참조 (addon 에서 정의) - Overlay 를 확장하므로 Overlay 로 대체 */
type MOOverlay = Overlay;

/** Select interaction 콜백 */
type FeatureCallback = (feature: Feature | undefined, layer: Layer | undefined) => void;

/** INSTANCE 내부 구조 (MOGISMap 수준) */
interface MOGISMapInstance {
    MAP: OlMap | undefined;
    VIEW: View | undefined;
    LAYER: {
        /** 목적설정 안된 레이어들 */
        default: Map<number, Layer>;
        /** 주소검색한 곳들을 feature로 하는 레이어 */
        address: Layer | undefined;
        /** 강조표시할 feature로 구성된 레이어. GeometryType 에 따라 구분함 */
        highlight: {
            Point: Layer | undefined;
            LineString: Layer | undefined;
            Polygon: Layer | undefined;
        };
        /** (지능수도플) 리스크맵 */
        risk: Map<number, Layer>;
        /** (지능수도플) 누수예상지점 */
        leak: Map<number, Layer>;
        /** (지능수도플) 공공서비스 */
        public: Map<number, Layer>;
        /** (지능수도플) 관망해석결과 */
        pipenet: Map<number, Layer>;
        /** 기본 GIS 시설물 e.g. 관로, 계측기, 블록 등 */
        base: Map<number, Layer>;
        /** 중점 관리지역 */
        manage: Map<number, Layer>;
        /** (지능수도플) 상습민원지역 */
        comp: Map<number, Layer>;
        /** (지능수도플) 실시간 상황감지 */
        realtime: Map<number, Layer>;
        /** (지능수도플) 이동형 누수센서 */
        portable: Map<number, Layer>;
        BACKGROUND?: Layer[];
        [key: string]: Map<number, Layer> | Layer | Layer[] | object | undefined;
    };
    INTERACTION: {
        SELECT: Select | undefined;
        SELECT_CALLBACK: FeatureCallback;
        POINTER: ((e: MapBrowserEvent<UIEvent>) => void) | undefined;
        MODIFY: any;
        SNAP: any[];
    };
    OVERLAY: {
        default: Map<string, MOOverlay[]>;
        /** 중점 관리지역 */
        manage: Map<string, MOOverlay[]>;
        /** (지능수도플) 상습민원지역 */
        comp: Map<string, MOOverlay[]>;
        /** (지능수도플) 실시간 상황감지 */
        realtime: Map<string, MOOverlay[]>;
        [key: string]: Map<string, MOOverlay[]>;
    };
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
 * A controller class that extends `ol.Map` to manage map and layer creation.
 * @summary Manages the creation of maps and layers.
 * @export
 * @class MOGISMap
 * @author jhoh
 * @fires MOGISMap#select
 */
export class MOGISMap extends MOSimpleMap {
    default_viewSpec: ViewSpec = {
        /**
         * Openlayers 뷰 포트 객체가 표현하는 좌표계.
         * 배경지도의 원본 좌표계를 설정해 이미지가 열화 없이 표출되도록 함
         * @default 'EPSG:3857' vworld 배경지도 좌표계
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

    Factory = {
        /**@type {SourceFactory} */
        source: new SourceFactory(),
        /**@type {LayerFactory} */
        layer: new LayerFactory(),
    };

    INSTANCE: MOGISMapInstance = {
        /** @type {OlMap|undefined} */
        MAP: undefined,
        /**@type {View|undefined} */
        VIEW: undefined,
        LAYER: {
            /** 목적설정 안된 레이어들 */
            default: new Map(),
            /** 주소검색한 곳들을 feature로 하는 레이어 */
            address: undefined,
            /** 강조표시할 feature로 구성된 레이어. GeometryType 에 따라 구분함 */
            highlight: {
                Point: undefined,
                LineString: undefined,
                Polygon: undefined,
            },
            /** (지능수도플) 리스크맵 */
            risk: new Map(),
            /** (지능수도플) 누수예상지점 */
            leak: new Map(),
            /** (지능수도플) 공공서비스 */
            public: new Map(),
            /** (지능수도플) 관망해석결과 */
            pipenet: new Map(),
            /** 기본 GIS 시설물 e.g. 관로, 계측기, 블록 등 */
            base: new Map(),
            /** 중점 관리지역 */
            manage: new Map(),
            /** (지능수도플) 상습민원지역 */
            comp: new Map(),
            /** (지능수도플) 실시간 상황감지 */
            realtime: new Map(),
            /** (지능수도플) 이동형 누수센서 */
            portable: new Map(),
        },
        INTERACTION: {
            SELECT: undefined,
            SELECT_CALLBACK: (feature?: Feature, layer?: Layer): void => {
                if (feature) { console.log(feature.getProperties()); }
                if (layer) { console.log(layer.getProperties()); }
            },
            POINTER: undefined,
            MODIFY: undefined,
            SNAP: [],
        },
        OVERLAY: {
            default: new Map(),
            /** 중점 관리지역 */
            manage: new Map(),
            /** (지능수도플) 상습민원지역 */
            comp: new Map(),
            /** (지능수도플) 실시간 상황감지 */
            realtime: new Map(),
        }
    };

    /**목적 별
     * 소스+레이어 정보 코드 리스트
     */
    layerCodeObject: Record<string, LayerCodeObj[]> = {
        default: [],
        /** (지능수도플) 리스크맵 */
        risk: [],
        /** (지능수도플) 누수예상지점 */
        leak: [],
        /** (지능수도플) 공공서비스 */
        public: [],
        /** (지능수도플) 관망해석결과 */
        pipenet: [],
        /** 본 GIS 시설물 e.g. 관로, 계측기, 블록 등 */
        base: [],
        /** 중점 관리지역 */
        manage: [],
        /** (지능수도플) 상습민원지역 */
        comp: [],
        /** (지능수도플) 실시간 상황감지 */
        realtime: [],
        /** (지능수도플) 이동형 누수센서 */
        portable: [],
    };

    /**
     * 기본 배경지도의 소스(API키 포함)+레이어 정보 코드 리스트
     */
    declare layerCode_Background: LayerCodeObj[];

    /**
     * Creates an instance of MOGISMap.
     * @param mapConfigSpec - The configuration object for the map.
     * @param mapConfigSpec.target - The ID of the HTML element that will contain the map.
     * @param mapConfigSpec.projection - The projection of the map.
     * @param mapConfigSpec.center - The initial center of the map.
     * @param mapConfigSpec.zoom - The initial zoom level of the map.
     * @param mapConfigSpec.enableRotation - Whether rotation is enabled.
     * @param mapConfigSpec.constrainResolution - Whether to constrain the resolution.
     * @param mapConfigSpec.resolutions - The resolutions for the map.
     * @param mapConfigSpec.hitTolerance - The hit tolerance for the select interaction.
     * @param mapConfigSpec.multi - Whether to allow multiple features to be selected.
     * @param NAME - The name of the MOGISMap instance.
     * @throws If the 'target' property is not defined in mapConfigSpec.
     */
    constructor(mapConfigSpec: MOGISMapConfig, NAME: string = 'MOGISMap') {
        super(mapConfigSpec, NAME);
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

    //LayerCode 관련

    //LayerCode 관련 끝

    //Factory 관련
    /**
     * Registers a subclass of `MOFactory` (e.g., `LayerFactory`, `SourceFactory`).
     * @param factory - The factory to register.
     * @memberof MOGISMap
     * @throws If the provided factory is not a valid instance of `MOFactory`.
     */
    setFactory(factory: MOFactory): void {
        if (factory instanceof MOFactory) {
            if (factory instanceof SourceFactory) {
                this.Factory.source = factory;
            } else if (factory instanceof LayerFactory) {
                this.Factory.layer = factory;
            }
        } else {
            console.log(factory);
            throw new Error(`입력된 Factory가 적합한 인스턴스 아님`);
        }
    }


    //Factory 관련 끝

    /* ===================================
    =======레이어 생성 관련 =============
    =====================================*/


    //MOSubscriber 함수등록
    /**
     * Updates the map based on the data from a registered publisher.
     * @param publisherID - The ID of the publisher to update from.
     * @throws If the publisher is not registered.
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
                    this.ctrlOverlay(ctrlObj[KEY.LAYER_PURPOSE_CATEGORY_KEY], ctrlObj[KEY.BOOL_VISIBLE], ctrlObj[KEY.LAYER_ID]);
                });
            }
        }
    }


    /* SELECT Interaction 관련 */

    /**
     * Enables or disables the select interaction on the map.
     * @param bool - Whether to enable or disable the interaction.
     * @fires MOGISMap#select
     */
    enableSelect(bool: boolean = true): void {
        if (bool) {
            //이미 interaction 생성되어 있다면 재기용
            if (this.INSTANCE.INTERACTION.SELECT instanceof Select) {
                this.INSTANCE.MAP!.addInteraction(this.INSTANCE.INTERACTION.SELECT);
                this.INSTANCE.MAP!.on('pointermove', this.INSTANCE.INTERACTION.POINTER as any);
            } else {
                //아니면 생성
                this.createSelectInteraction();
            }
        } else {
            if (this.INSTANCE.INTERACTION.SELECT) {
                this.INSTANCE.MAP!.removeInteraction(this.INSTANCE.INTERACTION.SELECT);
            }
            if (this.INSTANCE.INTERACTION.POINTER) {
                this.INSTANCE.MAP!.un('pointermove', this.INSTANCE.INTERACTION.POINTER as any);
            }
        }
    }

    /** interaction.select 관련 동작을 완전 제거 */
    private destoryEntireSelectInteraction(): void {
        this.INSTANCE.MAP!.removeInteraction(this.INSTANCE.INTERACTION.SELECT!);
        this.INSTANCE.INTERACTION.SELECT = undefined;
        this.INSTANCE.MAP!.un('pointermove', this.INSTANCE.INTERACTION.POINTER as any);
        this.INSTANCE.INTERACTION.POINTER = undefined;
    }

    private createSelectInteraction(): void {
        let me = this;
        let selectInteraction: Select | undefined;

        /** 마우스포인터 변경 및 selectInteraction 에 공통으로 사용되는 필터링 내용 */
        const filterFunction = (feature: any, layer: Layer): boolean => {
            let boolFeature = true;
            let boolLayer = layer.get(KEY.BOOL_SELECTABLE) && (layer.get(KEY.BOOL_SELECTABLE) as string).toUpperCase() === 'Y';
            return boolFeature && boolLayer;
        };

        try {
            selectInteraction = new Select({
                hitTolerance: this.default_select.hitTolerance,
                multi: this.default_select.multi,
                style: createMOStyleFunction(`${KEY.HIGHLIGHT_SOURCE_LAYER_KEY}_mainMap`) as any,
                filter: filterFunction,
            });
        } catch (e) {
            console.error(e);
        }

        if (selectInteraction instanceof Select) {
            this.INSTANCE.INTERACTION.SELECT = selectInteraction;
            this.INSTANCE.MAP!.addInteraction(selectInteraction);
        }

        //선택 가능한 레이어 위에서 포인터 변경
        this.INSTANCE.INTERACTION.POINTER = (e: MapBrowserEvent<UIEvent>): void => {
            if (!(e as any).dragging) {
                let bool = (e.map as OlMap).forEachFeatureAtPixel(e.pixel, filterFunction as any,
                    { hitTolerance: this.default_select.hitTolerance });

                if (bool) (e.map as OlMap).getTargetElement().style.cursor = 'pointer';
                else (e.map as OlMap).getTargetElement().style.cursor = '';
            }
        };

        this.INSTANCE.MAP!.on('pointermove', this.INSTANCE.INTERACTION.POINTER as any);
    }

    /**
     * A callback function for the select interaction.
     */
    /**
     * Sets the callback function for the select interaction.
     * @param callback - The callback function to execute when a feature is selected.
     * @throws If the callback is not a function.
     */
    setSelectCallback(callback: FeatureCallback): void {
        //선택될 때 동작(selectCallback)을 객체에 등록
        if (callback instanceof Function) {
            //기존 interaction.select 를 아예 지움
            this.destoryEntireSelectInteraction();
            //새로운 callbakc 을 내부에 저장
            this.INSTANCE.INTERACTION.SELECT_CALLBACK = callback;

            this.enableSelect(true);
        } else {
            throw new Error(`selectCallback 은 함수형태로 등록되어야 함`);
        }

        this.attatchSelectCallbackToSelectInteraction();
    }

    /**
     * 기 등록된 selectCallback 을 ol.interaction.select 에 붙임
     */
    private attatchSelectCallbackToSelectInteraction(): void {
        if (!(this.INSTANCE.INTERACTION.SELECT_CALLBACK instanceof Function)) {
            throw new Error(`selectCallback 등록되지 않음. MOGISMap::setSelectCallback (callback) 등록 필요`);
        }

        //선택가능한 feature 선택때 selectCallback 을 호출하도록 등록
        if (this.INSTANCE.INTERACTION.SELECT instanceof Select) {
            let me = this;
            this.INSTANCE.INTERACTION.SELECT.on('select', function (e: any) {
                if (!e.auto) {
                    let feature = me.INSTANCE.INTERACTION.SELECT!.getFeatures().item(0) as Feature | undefined;
                    let layer = feature ? me.INSTANCE.INTERACTION.SELECT!.getLayer(feature!) : undefined;
                    me.INSTANCE.INTERACTION.SELECT_CALLBACK(feature, layer as Layer | undefined);
                }
            });
        }
    }


    /* 주소검색 관련 */

    /**
     * Adds a new layer to the map for displaying addresses.
     * @param point_x - The x-coordinate of the address.
     * @param point_y - The y-coordinate of the address.
     * @param label - The label to display for the address.
     * @param crs - The coordinate reference system of the provided coordinates.
     * @throws If the provided coordinates are not valid numbers.
     */
    addAddressLayer(point_x: number | string, point_y: number | string, label: string, crs?: string): void {
        let digit_x = Number(point_x);
        let digit_y = Number(point_y);
        let bool_isLayerOnMap = false;
        if (isNumber(digit_x) && isNumber(digit_y)) {

            let coord: [number, number] = [digit_x, digit_y];
            if (crs) {
                coord = transform(coord, crs, this.default_viewSpec.projection) as [number, number];
            }

            //1. 기 발행 주소 레이어 있는지 체크
            let addressLayer = this.INSTANCE.LAYER[KEY.ADDRESS_SOURCE_LAYER_KEY] as Layer | undefined;
            //1-1. 없으면 소스, 레이어 생성 | 있으면 레이어와 소스 접근자 생성
            if (!(addressLayer instanceof Layer)) {
                addressLayer = this.Factory.layer.getSimpleVectorLayer() as any as Layer;
                addressLayer.setZIndex(30);
                addressLayer.setSource(this.Factory.source.getSimpleVectorSource() as any);
            } else {
                bool_isLayerOnMap = true;
            }
            let addressSource = (addressLayer as any).getSource() as VectorSource;
            //2. 주어진 좌표로 Feature 객체 생성
            let addressFeature: Feature | undefined;
            try {
                addressFeature = new Feature({ geometry: new Point(coord) });
            } catch (e) {
                console.log(`feature 생성오류 : ${coord}`);
                console.error(e);
            }
            //3. Feature 객체에 스타일 입히기
            let tempStyle = createMOStyleFunction('address');
            if (tempStyle instanceof Style) {
                if (label) tempStyle.getText()!.setText(label);
            } else {
                throw new Error(`스타일 생성 에러`);
            }
            addressFeature!.setStyle(tempStyle);
            //4. 소스에 추가
            if (addressSource instanceof VectorSource) {
                addressSource.addFeature(addressFeature!);
            } else {
                throw new Error(`소스 구성 안됨`);
            }

            //4-1. 레이어 없는 상태였다면 ol.Map 에 추가
            if (!bool_isLayerOnMap) {
                this.map.addLayer(addressLayer);
            }
            //5. 방금 추가한 feature 로 이동
            this.view.fit(addressFeature!.getGeometry()! as any, { duration: 300, maxZoom: 15 });

            this.INSTANCE.LAYER[KEY.ADDRESS_SOURCE_LAYER_KEY] = addressLayer;
        } else {
            console.log(`입력좌표 : ${point_x}, ${point_y}`);
            throw new Error(`주어진 좌표가 적합한 숫자 (또는 문자) 가 아님`);
        }

        function isNumber(n: number): boolean { return !isNaN(parseFloat(String(n))) && !isNaN(n - 0); }
    }

    /**
     * Adds an array of features to the highlight layer.
     * @param features - An array of `ol.Feature` objects to add to the highlight layer.
     * @throws If the geometry type of the features is not supported.
     */
    addFeaturesToHighlightLayer(features: Feature[]): void {
        let bool_isLayerOnMap = false;
        if (features && features.length > 0 && features[0] instanceof Feature) {
            let geometryType = features[0].getGeometry()!.getType();
            let highlightLayer: Layer | undefined;

            //1. 기 발행 주소 레이어 있는지 체크
            if (geometryType == 'Point') {
                highlightLayer = (this.INSTANCE.LAYER[KEY.HIGHLIGHT_SOURCE_LAYER_KEY] as any).Point;
            } else if (geometryType == 'LineString') {
                highlightLayer = (this.INSTANCE.LAYER[KEY.HIGHLIGHT_SOURCE_LAYER_KEY] as any).LineString;
            } else if (geometryType == 'Polygon' || geometryType == 'MultiPolygon') {
                highlightLayer = (this.INSTANCE.LAYER[KEY.HIGHLIGHT_SOURCE_LAYER_KEY] as any).Polygon;
            } else {
                throw new Error(`geometry 타입은 Point, LineString, Polygon, MultiPolygon만 가능`);
            }

            //1-1. 없으면 소스, 레이어 생성 | 있으면 레이어와 소스 접근자 생성
            if (!(highlightLayer instanceof Layer)) {
                highlightLayer = this.Factory.layer.getSimpleVectorLayer() as any as Layer;
                highlightLayer.setSource(this.Factory.source.getSimpleVectorSource() as any);
            } else {
                bool_isLayerOnMap = true;
            }
            let highlightSource = (highlightLayer as any).getSource() as VectorSource;

            //2. 입력된 feature들을 source 에 추가
            if (highlightSource instanceof VectorSource) {
                highlightSource.addFeatures(features);
            } else {
                throw new Error('적합한 벡터 소스가 아님');
            }

            //3. 레이어에 스타일 입히기
            let tempStyle = createMOStyleFunction(KEY.HIGHLIGHT_SOURCE_LAYER_KEY);
            (highlightLayer as any).setStyle(tempStyle as any);

            //4. 레이어 없는 상태였다면 ol.Map 에 추가
            if (!bool_isLayerOnMap) {
                this.map.addLayer(highlightLayer);
            } else {
                //소스에 features 추가한 상태라면 리프레시
                highlightSource.refresh();
            }
            (this.INSTANCE.LAYER[KEY.HIGHLIGHT_SOURCE_LAYER_KEY] as any)[geometryType] = highlightLayer;
        }
    }


    //Overlay 관련

    /**
     * Adds a `MOOverlay` instance to the map.
     * @param moverlay - The `MOOverlay` instance to add.
     * @param la_pu_cate_key - The layer purpose category key.
     * @param layer_id - The ID of the layer to associate the overlay with.
     * @throws If the provided overlay is not a valid `MOOverlay` instance.
     */
    addMOverlay(moverlay: Overlay, la_pu_cate_key?: string, layer_id: string = 'default'): void {

        if (moverlay instanceof Overlay) {
            //1. la_pu_cate_key 있음
            let targetMap: Map<string, MOOverlay[]>;
            if (this.isValid_layerPurposeCategoryKey(la_pu_cate_key)) {
                targetMap = this.INSTANCE.OVERLAY[la_pu_cate_key!];
            } else {
                targetMap = this.INSTANCE.OVERLAY.default;
            }

            //2. layer_id 있음
            if (layer_id) {
                let overlayArr = targetMap.get(layer_id);
                if (overlayArr instanceof Array) {
                    overlayArr.push(moverlay);
                } else {
                    overlayArr = [moverlay];
                    targetMap.set(layer_id, overlayArr);
                }
            }

        } else {
            throw new Error(`overlay 가 MOOverlay 객체가 아님`);
        }
    }

    /**
     * Discards a `MOOverlay` instance from the map.
     * @param la_pu_cate_key - The layer purpose category key.
     * @param layer_id - The ID of the layer to remove the overlay from.
     * @param mOverlay_id - The ID of the `MOOverlay` instance to remove.
     * @throws If the overlay group is not valid.
     */
    discardMOverlay(la_pu_cate_key?: string, layer_id: string = 'default', mOverlay_id?: string): void {
        let moverlayGroupMap: Map<string, MOOverlay[]>;
        if (this.isValid_layerPurposeCategoryKey(la_pu_cate_key)) {
            moverlayGroupMap = this.INSTANCE.OVERLAY[la_pu_cate_key!];
        } else {
            moverlayGroupMap = this.INSTANCE.OVERLAY.default;
        }

        if (moverlayGroupMap instanceof Map) {
            //1. 특정 레이어에 속하는 오버레이만 제거
            if (layer_id) {
                if (moverlayGroupMap.size == 0) return;
                moverlayGroupMap.get(layer_id)!.forEach(mOverlay => {
                    this.map.removeOverlay(mOverlay);
                });
                moverlayGroupMap.clear();
            } else {
                throw new Error(`오버레이가 속한 레이어의 아이디가 필요함 : ${layer_id}`);
            }
        } else {
            throw new Error(`overlay group 이 적합하지 않음`);
        }
    }

    /**
     * Controls the visibility of a `MOOverlay` instance or a group of overlays.
     * @param la_pu_cate_key - The layer purpose category key.
     * @param visible - Whether to show or hide the overlay(s).
     * @param layer_id - The ID of the layer to control the overlays for.
     * @throws If the `layer_id` is not specified.
     */
    ctrlOverlay(la_pu_cate_key?: string, visible?: boolean, layer_id: string = 'default'): void {
        let overlayGroup: Map<string, MOOverlay[]>;
        if (this.isValid_layerPurposeCategoryKey(la_pu_cate_key)) {
            overlayGroup = this.INSTANCE.OVERLAY[la_pu_cate_key!];
        } else {
            overlayGroup = this.INSTANCE.OVERLAY.default;
        }

        if (overlayGroup instanceof Map && overlayGroup.size > 0) {

            if (layer_id) {
                let moverlayArr = overlayGroup.get(layer_id);
                if (moverlayArr instanceof Array) {
                    if (visible) {
                        moverlayArr.forEach(moverlay => {
                            this.map.addOverlay(moverlay);
                        });
                        this.view.dispatchEvent('change:resolution');
                    } else moverlayArr.forEach(moverlay => this.map.removeOverlay(moverlay));
                }
            } else {
                throw new Error(`layer_id 명시되어야 합니다 기본 : 'default'`);
            }
        }
    }


    /**
     * Gets the style function for the highlight layer.
     * @returns The style function for the highlight layer.
     */
    getStyleFunc_HIGHTLIGHT(): ReturnType<typeof createMOStyleFunction> {
        return createMOStyleFunction(KEY.HIGHLIGHT_SOURCE_LAYER_KEY);
    }

    /* 의사결정지원 팝업 관련 */

    /**
     * Adds a new layer to the map for displaying decision support popups.
     * @param point_x - The x-coordinate of the popup.
     * @param point_y - The y-coordinate of the popup.
     * @param label - The label to display for the popup.
     * @param crs - The coordinate reference system of the provided coordinates.
     * @param txt - The text content of the popup.
     * @param checkClass - The CSS class to apply to the popup.
     * @param offset - The offset of the popup in pixels.
     * @throws If the provided coordinates are not valid numbers.
     */
    addDecisionLayer(point_x: number | string, point_y: number | string, label: string, crs: string, txt: string, checkClass: string, offset: [number, number]): void {
        let digit_x = Number(point_x);
        let digit_y = Number(point_y);

        let bool_isLayerOnMap = false;

        if (isNumber(digit_x) && isNumber(digit_y)) {

            let coord: [number, number] = [digit_x, digit_y];
            if (crs) {
                coord = transform(coord, crs, this.default_viewSpec.projection) as [number, number];
            }

            this.map.removeLayer((this as any).INSTANCE.MAP.getLayerGroup().values_.layers.array_[6]);

            //1. 기 발행 주소 레이어 있는지 체크
            let defaultLayer: any = this.INSTANCE.LAYER['default'];
            defaultLayer = '';
            //1-1. 없으면 소스, 레이어 생성 | 있으면 레이어와 소스 접근자 생성
            if (!(defaultLayer instanceof Layer)) {
                defaultLayer = this.Factory.layer.getSimpleVectorLayer();
                defaultLayer.setSource(this.Factory.source.getSimpleVectorSource());
            } else {
                bool_isLayerOnMap = true;
            }
            let defaultSource = defaultLayer.getSource() as VectorSource;

            //2. 주어진 좌표로 Feature 객체 생성
            let defaultFeature: Feature | undefined;

            try {
                defaultFeature = new Feature({
                    geometry: new Point(coord)
                });
            } catch (e) {
                console.log(`feature 생성오류 : ${coord}`);
                console.error(e);
            }

            //4. 소스에 추가
            if (defaultSource instanceof VectorSource) {
                defaultSource.addFeature(defaultFeature!);
            } else {
                throw new Error(`소스 구성 안됨`);
            }


            //4-1. 레이어 없는 상태였다면 ol.Map 에 추가
            if (!bool_isLayerOnMap) {
                this.map.addLayer(defaultLayer);
            }

            //5. 팝업창 만들기
            let element = document.createElement('div');
            element.classList.add(checkClass);
            element.innerHTML = txt;
            document.body.appendChild(element);

            let popup = new Overlay({
                element: element,
                positioning: 'bottom-center' as any,
                stopEvent: false,
                offset: offset
            });

            this.map.addOverlay(popup);

            let coordinates = (defaultFeature!.getGeometry()! as Point).getCoordinates();

            popup.setPosition(coordinates);

            this.INSTANCE.LAYER['default'] = defaultLayer;

        } else {
            console.log(`입력좌표 : ${point_x}, ${point_y}`);
            throw new Error(`주어진 좌표가 적합한 숫자 (또는 문자) 가 아님`);
        }

        function isNumber(n: number): boolean { return !isNaN(parseFloat(String(n))) && !isNaN(n - 0); }
    }

}
