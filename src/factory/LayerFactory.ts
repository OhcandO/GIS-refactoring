import * as KEY from '../common/keyMap';
import { MOFactory } from '../abstract/Factory';

import WMTS from 'ol/source/WMTS';
import Source from 'ol/source/Source';
import XYZ from 'ol/source/XYZ';
import VectorSource from 'ol/source/Vector';
import Layer from 'ol/layer/Layer';
import TileLayer from 'ol/layer/Tile';
import VectorImageLayer from 'ol/layer/VectorImage';
import TileArcGISRest from 'ol/source/TileArcGISRest';

/**
 * @typedef {object} layer_param 레이어팩토리 옵션
 * @property {boolean} [declutter] 서로겹침허용 여부
 * @property {boolean} [visible] 레이어 초기 보임여부
 * @property {boolean} [isBase] 기본 배경 레이어로서 사용될지 여부
 * @property {number} [opacity] 투명도. 0~1 범위 소숫점 가능
 * @property {number} [minZoom] 설정된 줌 보다 멀리 떨어지면 레이어 비활성
 * @property {number} [zIndex] 레이어들이 서로 겹쳐있을 때 숫자가 클수록 위쪽에 위치 (다른 레이어 가림)
 */
interface LayerParam {
    declutter?: boolean;
    visible?: boolean;
    isBase?: boolean;
    opacity?: number;
    minZoom?: number;
    zIndex?: number;
    [key: string]: any;
}

interface DefaultLayerSpec {
    zIndex: number;
    opacity: number;
    minZoom: number | undefined;
    visible: boolean;
    className: string | undefined;
    extent: number[] | undefined;
    declutter: boolean;
    properties: {
        id: any;
        typeName: any;
        isBase: boolean;
    };
    [key: string]: any;
}

/**
 * MOSourceConfig 인스턴스로 Openlayers Layer 객체를 생산하는 객체
 *
 * @class LayerFactory
 * @extends MOFactory
 * @author jhoh
 */
export class LayerFactory extends MOFactory {

    /**Openlayers 라이브러리의 Layer 객체에서 사용하는 키 값  */
    private default_leyerSpec: DefaultLayerSpec = {
        zIndex: 5,
        opacity: 1, //
        minZoom: undefined, // 설정된 줌 보다 멀리 떨어지면 레이어 비활성
        visible: true, //보임 or 보이지 않음
        className: undefined, //'ol-layer',
        extent: undefined, //[minX, minY, maxX, maxY] 로 표현된 영역만 표현
        declutter: false, //VectorImage 한정. 요소들 모여있을 때 하나만 표시 여부
        properties: {
            id: undefined,
            typeName: undefined,
            isBase: false,
        },
    };



    INSTANCE_ol_Source: Source | undefined;
    INSTANCE_olLayer: Layer | undefined;

    /**
     * 레이어 팩토리 생성
     * @param default_param
     * @memberof LayerFactory
     */
    constructor(default_param?: LayerParam) {
        super();
        Object.assign(this.default_leyerSpec, default_param);
    }

    resetFactory(): void {
        super.resetFactory();
        this.INSTANCE_ol_Source = undefined;
        this.INSTANCE_olLayer = undefined;
    }

    setSource(sourceInstance: Source): void {
        if (this.isValid_ol_Source(sourceInstance)) {
//			this.resetFactory();
            this.INSTANCE_ol_Source = sourceInstance;
        } else {
            console.error(`입력된 레이어 소스설정 인스턴스가 적합하지 않음`);
            console.log(sourceInstance);
            throw new Error(`입력된 레이어 소스설정 인스턴스가 적합하지 않음`);
        }
    }

    getLayer(): Layer {
        if (!this.INSTANCE_olLayer) this.INSTANCE_olLayer = this.layerBuilder();
        if (this.INSTANCE_olLayer instanceof Layer) {
            return this.INSTANCE_olLayer;
        } else {
            console.groupCollapsed(`해당 layer 객체는 openlayers Layer 인스턴스 아님`);
            console.log(this.INSTANCE_olLayer);
            console.groupEnd();
            throw new Error(`해당 layer 객체는 openlayers Layer 인스턴스 아님`);
        }
    }


    /**
     * 레이어 중 zIndex가 가장 높은 벡터레이어 생성
     * @param paramm
     * @returns
     */
    getSimpleVectorLayer = (paramm?: LayerParam): VectorImageLayer<any> => {
        let tempSpec: Record<string, any>;
        if (paramm) {
            tempSpec = this.getUpatedLayerCode(paramm);
        } else {
            tempSpec = Object.assign({}, this.default_leyerSpec);
        }
        return new VectorImageLayer(tempSpec as any);
    };

    isValid_ol_Source(sourceInstance: any): boolean {
        let bool = false;
        if (sourceInstance instanceof Source) {
            bool = true;
        } else {
            bool = false;
        }
        return bool;
    }

    /** default Object에 source Object 를 합치되,
     *  nullish 들은 제외시킴
     *   */
    private getUpatedLayerCode(layerCodeObj?: Record<string, any>): Record<string, any> {
        const src = layerCodeObj ?? this.getSpec();
        const returnLayerCode: Record<string, any> = structuredClone(this.default_leyerSpec);

        returnLayerCode.zIndex = src[KEY.Z_INDEX] ?? this.default_leyerSpec.zIndex;
        returnLayerCode.minZoom = src[KEY.MIN_ZOOM] ?? this.default_leyerSpec.minZoom;
        returnLayerCode.declutter = src[KEY.BOOL_DECLUTTER] ?? this.default_leyerSpec.declutter;
        // returnLayerCode.properties.id = src[KEY.LAYER_ID] ?? this.default_leyerSpec.properties.id;
        // returnLayerCode.properties.typeName = src[KEY.TYPE_NAME] ?? this.default_leyerSpec.properties.typeName;
        // returnLayerCode.properties.isBase = src[KEY.LAYER_GEOMETRY_TYPE].toUpperCase()==='BASE' ? true:false;
        returnLayerCode.properties = src;
        return this.filterNullishVals(returnLayerCode);
    }

    /**
     * Source 인스턴스에 따라 레이어를 생성해 반환
     * default layer 특성에 layerCode 의 내용을 합쳐 생성 parameter로 삼음
     * @returns
     */
    layerBuilder(): Layer | undefined {
        const updatedOption: Record<string, any> = this.getUpatedLayerCode();
        if (this.INSTANCE_ol_Source instanceof Source) {
            updatedOption['source'] = this.INSTANCE_ol_Source;
        } else {
            throw new Error(`layerBuilder 직전 Source 가 적합하지 않음`);
        }
        let returnlayer: Layer | undefined;
        try {
            //1. 가상레이어
            if (this.getSpec()[KEY.SOURCE_CATEGORY] == KEY.VIRTUAL_SOURCE_LAYER_KEY) {
                returnlayer = this.getSimpleVectorLayer();
            }

            //3. VectorImage 레이어용
            if (this.INSTANCE_ol_Source instanceof VectorSource) {
                returnlayer = new VectorImageLayer(updatedOption as any);
            }
        } catch (e) {
            console.log(`레이어 생성 실패 #layerBuilder`);
            console.error(e);
        }
        return returnlayer;
    }

    getBaseLayer(): Layer {
        if (!this.INSTANCE_olLayer) this.INSTANCE_olLayer = this.baseLayerBuilder();
        if (this.INSTANCE_olLayer instanceof Layer) {
            return this.INSTANCE_olLayer;
        } else {
            console.groupCollapsed(`해당 layer 객체는 openlayers Layer 인스턴스 아님`);
            console.log(this.INSTANCE_olLayer);
            console.groupEnd();
            throw new Error(`해당 layer 객체는 openlayers Layer 인스턴스 아님`);
        }
    }

    baseLayerBuilder(): Layer | undefined {
        const updatedOption: Record<string, any> = this.getUpatedLayerCode();
        updatedOption.visible = (this.getSpec()[KEY.BOOL_SHOW_INITIAL] as string)?.toUpperCase() === 'Y' ? true : false;
        if (this.INSTANCE_ol_Source instanceof Source) {
            updatedOption['source'] = this.INSTANCE_ol_Source;
        } else {
            throw new Error(`layerBuilder 직전 Source 가 적합하지 않음`);
        }
        let returnlayer: Layer | undefined;
        try {
            //1. 배경지도용 WMTS 소스
            if (this.INSTANCE_ol_Source instanceof WMTS) {
                returnlayer = new TileLayer(updatedOption as any);
            }

            //2. 배경지도용 XYZ 소스
            else if (this.INSTANCE_ol_Source instanceof XYZ) {
                returnlayer = new TileLayer(updatedOption as any);
            }

            //3. 내부망용 arcGis Tile REST 소스
            else if (this.INSTANCE_ol_Source instanceof TileArcGISRest) {
                returnlayer = new TileLayer(updatedOption as any);
            }
        } catch (e) {
            console.log(`레이어 생성 실패 #baseLayerBuilder`);
            console.error(e);
        }
        return returnlayer;
    }

}
