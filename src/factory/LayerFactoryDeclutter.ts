import * as KEY from '../common/keyMap';
import { LayerFactory } from './LayerFactory';

import VectorLayer from 'ol/layer/Vector';
import VectorImageLayer from 'ol/layer/VectorImage';
import Source from 'ol/source/Source';
import VectorSource from 'ol/source/Vector';
import type Layer from 'ol/layer/Layer';

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
 * ol.layer.Vector 끼리만 zIndex + declutter 효과 같이 적용되기 때문에
 * 해당 레이어들에만 적용
 *
 * @class
 * @author jhoh
 */
export class LayerFactoryDeclutter extends LayerFactory {

    /**Openlayers 라이브러리의 Layer 객체에서 사용하는 키 값  */
    private default_leyerSpec_declutter: DefaultLayerSpec = {
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

    declutterLayerTypeNames: string[] = [];

    /**
     * declutter 구현할 typeName 등록
     * @param typeNames 레이어 type_name 한개 또는 배열
     */
    setDeclutterLayerTypeNames(typeNames: string | string[]): void {
        if (typeNames instanceof Array) {
            this.declutterLayerTypeNames = this.declutterLayerTypeNames.concat(typeNames);
        } else {
            this.declutterLayerTypeNames.push(typeNames);
        }
        this.declutterLayerTypeNames = [...new Set(this.declutterLayerTypeNames)];
    }


//	/**
//     * 레이어 팩토리 생성
//     * @param default_param
//     * @memberof LayerFactory
//     */
//    constructor(default_param){
//        super();
//        Object.assign(this.default_leyerSpec_declutter, default_param);
//    }

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

    /**
     * declutter 용 레이어 만든다
     * @param paramm layer parameter
     * @returns
     */
    getVectorLayer(paramm?: LayerParam): VectorLayer<any> {
        const tempSpec = Object.assign({}, this.default_leyerSpec_declutter, paramm);
        return new VectorLayer(tempSpec as any);
    }

    /** default Object에 source Object 를 합치되,
     *  nullish 들은 제외시킴
     *   */
    private getUpatedLayerCode_declutter(): Record<string, any> {
        const src = this.getSpec();
        const returnLayerCode: Record<string, any> = structuredClone(this.default_leyerSpec_declutter);

        returnLayerCode.zIndex = src[KEY.Z_INDEX] ?? this.default_leyerSpec_declutter.zIndex;
        returnLayerCode.minZoom = src[KEY.MIN_ZOOM] ?? this.default_leyerSpec_declutter.minZoom;
        returnLayerCode.declutter = src[KEY.BOOL_DECLUTTER] ? true : this.default_leyerSpec_declutter.declutter;
        // returnLayerCode.properties.id = src[KEY.LAYER_ID] ?? this.default_leyerSpec_declutter.properties.id;
        // returnLayerCode.properties.typeName = src[KEY.TYPE_NAME] ?? this.default_leyerSpec_declutter.properties.typeName;
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
        const updatedOption: Record<string, any> = this.getUpatedLayerCode_declutter();
        if (this.INSTANCE_ol_Source instanceof Source) {
            updatedOption['source'] = this.INSTANCE_ol_Source;
        } else {
            throw new Error(`layerBuilder 직전 Source 가 적합하지 않음`);
        }
        let returnlayer: Layer | undefined;
        try {
            //1. declutter 용
            if (this.declutterLayerTypeNames.includes(this.getSpec()[KEY.TYPE_NAME] as string)) {
                returnlayer = this.getVectorLayer(updatedOption);
            }
            //2. 기본레이어
            else if (this.getSpec()[KEY.SOURCE_CATEGORY] == KEY.VIRTUAL_SOURCE_LAYER_KEY) {
                returnlayer = this.getSimpleVectorLayer();
            }

            //3. VectorImage 레이어용
            else if (this.INSTANCE_ol_Source instanceof VectorSource) {
                returnlayer = new VectorImageLayer(updatedOption as any);
            }
        } catch (e) {
            console.log(`레이어 생성 실패 #layerBuilder`);
            console.error(e);
        }
        return returnlayer;
    }

}
