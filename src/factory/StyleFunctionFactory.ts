import * as KEY from '../common/keyMap';
import { Style, Stroke, Fill, Text, Icon, Circle as CircleStyle } from 'ol/style';
import { MultiPolygon, Polygon, Point } from 'ol/geom';
import type Feature from 'ol/Feature';
import type { FeatureLike } from 'ol/Feature';
import type { LayerCodeObj } from '../types';

declare const ctxPath: string;

/**
 * 이 JS 파일에서 아이콘 경로까지의 relative path
 */
interface DefaultStyleOption {
    icon: {
        crossOrigin: string;
        src: string | undefined;
        anchor: [number, number];
        displacement: [number, number];
        opacity: number;
        rotateWithView: boolean;
        declutterMode: string | undefined;
        height: number;
        width: number;
    };
    text: {
        font: string;
        offsetX: number;
        offsetY: number;
        placement: string;
        textAlign: string;
        justify: string;
        textBaseline: string;
        overflow: boolean;
        [key: string]: any;
    };
    text_stroke: {
        color: string;
        width: number;
    };
    text_fill: {
        color: string;
    };
    stroke: {
        color: string;
        lineDash: number[] | null;
        width: number;
    };
    fill: {
        color: string;
    };
}

const default_style: DefaultStyleOption = {
    icon: {
        crossOrigin: "anonymous",
        src: undefined,
        anchor: [0.5, 0.5], //이미지 정 중앙
        displacement: [0, 0], //이격정도 [5, 6] : 오른쪽으로 5, 위쪽으로 6
        opacity: 1, //투명도 0~1
        rotateWithView: false,
        declutterMode: undefined, // ['declutter', 'obstacle', 'none']
        height: 30,
        width: 30,
    },

    text: {
        font: `bold 12px Malgun Gothic`,
        offsetX: 15, // 양수로 지정시 우측이동
        offsetY: 0, // 양수로 지정시 하방이동
        placement: "point", // 'line' : 선분 따라 글자 표현
        //textAlign, justify 예시 https://openlayers.org/en/v7.5.2/examples/vector-labels-justify-text.html
        textAlign: "left", // ['left','right','end','start','center']
        justify: "left", //['left','center','right']
        textBaseline: "middle", // ['bottom', 'top', 'middle', 'alphabetic', 'hanging', 'ideographic']
        overflow: true,	//라벨이 feature의 크기보다 커져도 보이게 함
    },
    text_stroke: {
        color: "rgba(255,255,255,1)", //white
        width: 1.5,
    },
    text_fill: {
        color: "rgba(0,0,0,0.9)", //black
    },

    stroke: {
        color: "rgba(55,93,232,0.74)", //옅은 파랑
        lineDash: null, // [2,2]
        width: 2,
    },
    fill: {
        color: "rgba(31, 238, 115, 0.8)", //옅은 연두색
    },
};


/**
 * layerCodeObject 에 조건을 부여할 수 있는 필터객체
 */
interface ConditionObject {
    condition: string;
    value: string;
}

/**
 * 줌아웃 상태에서 유효한 레이어들 조건 객체 배열
 */
let SPACIOUS_LAYERS_ARR: ConditionObject[] = [
//	{
//		condition:KEY.TYPE_NAME,
//		value : 'LC_WTL_BLSM_AS'
//	}
];

/** 줌아웃 상태에서 유효한 레이어들을 식별할 조건 등록 */
export function registSpaciousLayer(param: ConditionObject | ConditionObject[]): void {

    //1. 배열이면 기존내용 교체
    if (param instanceof Array && (param as ConditionObject[]).at(0)!['condition']) {
        SPACIOUS_LAYERS_ARR = param;

    //2. Object 라면 기존에 추가
    } else if ((param as ConditionObject)['condition']) {
        SPACIOUS_LAYERS_ARR.push(param as ConditionObject);
    }

    if (SPACIOUS_LAYERS_ARR.length > 0) {
        //console.table(background_like_layers);
    }
}

/** 줌아웃 상태에서 유효한 레이어들 확인 */
function isThisLayerSpacious(layerCode: Record<string, any>): boolean {
    return SPACIOUS_LAYERS_ARR.some(condObj => layerCode[condObj.condition] == condObj.value);
}


/** 배경지도처럼 동작하는 레이어들 */
let BACKGROUNDLIKE_LAYERS_ARR: ConditionObject[] = [
//	{
//		condition:KEY.TYPE_NAME,
//		value : 'LC_WTL_BLSM_AS'
//	}
];

/** 배경지도처럼 동작하는 레이어들을 식별할 조건 등록 */
export function registBackgroundlikeLayer(param: ConditionObject | ConditionObject[]): void {

    //1. 배열이면 기존내용 교체
    if (param instanceof Array && (param as ConditionObject[]).at(0)!['condition']) {
        BACKGROUNDLIKE_LAYERS_ARR = param;

    //2. Object 라면 기존에 추가
    } else if ((param as ConditionObject)['condition']) {
        BACKGROUNDLIKE_LAYERS_ARR.push(param as ConditionObject);
    }

    if (BACKGROUNDLIKE_LAYERS_ARR.length > 0) {
        //console.table(background_like_layers);
    }
}

/** 배경지도처럼 동작하는 레이어들 확인 */
function isThisLayerBackgroundlike(layerCode: Record<string, any>): boolean {
    return BACKGROUNDLIKE_LAYERS_ARR.some(condObj => layerCode[condObj.condition] == condObj.value);
}


/**
 * 레이어 코드로 부터, 벡터 레이어의 표현 방식을 설정하기 위한 ol.style 객체 생성기
 *
 * @param layerCode
 * @export
 * @returns Style 함수 또는 Style 객체
 * @author jhoh
 */
export function createMOStyleFunction(layerCode: Record<string, any> | string): ((feature: FeatureLike, resolution: number) => Style | Style[]) | Style | Style[] | undefined {

    if (layerCode == KEY.HIGHLIGHT_SOURCE_LAYER_KEY) {
        return getStyleFunc_HIGHTLIGHT();
    } else if (layerCode == `${KEY.HIGHLIGHT_SOURCE_LAYER_KEY}_mainMap`) {
        return getStyleFunc_HIGHTLIGHT_MAINMAP();
    } else if (layerCode == KEY.ADDRESS_SOURCE_LAYER_KEY) {
        return getStyleFunc_ADDRESS();
    }

    let tempStyleOption: DefaultStyleOption;

    tempStyleOption = getUpdatedLayerCode(layerCode as Record<string, any>);
    let layerType: string | undefined;
    try {
        layerType = getLayerType(layerCode as Record<string, any>);
    } catch (e) {
        console.log(e);
    }

    let styleFunc: ((feature: FeatureLike, resolution: number) => Style) | undefined;
    if (layerType == KEY.OL_GEOMETRY_OBJ.POINT) {
        styleFunc = getStyleFunc_POINT(layerCode as Record<string, any>, tempStyleOption);
    } else if (layerType == KEY.OL_GEOMETRY_OBJ.LINE) {
        styleFunc = getStyleFunc_LINE(layerCode as Record<string, any>, tempStyleOption);
    } else if (layerType == KEY.OL_GEOMETRY_OBJ.POLYGON) {
        styleFunc = getStyleFunc_POLYGON(layerCode as Record<string, any>, tempStyleOption) as any;
    }

    if (styleFunc) return styleFunc;
    return undefined;
}

/**
 * 가상 레이어들에 대해,
 * 특정 geometryType 특화된 StyleFunction 반환해 레이어 스타일 적용할 수 있도록 함수 반환
 * 그 와중에 layerCode 및 기본 스타일 적용된 버전을 적용
 * @param geometryType
 * @param layerCodeObj
 */
export function createStyleFunctionForScale(geometryType: string, layerCodeObj: Record<string, any>): Style {
    if (geometryType == 'LineString') {
        const updatedCode = getUpdatedLayerCode(layerCodeObj);
        const style = new Style();
        style.setStroke(new Stroke(updatedCode.stroke));
        return style;
    }
    else if (geometryType == 'Point') {
        const updatedCode = getUpdatedLayerCode(layerCodeObj);
        const style = new Style();
        updatedCode.stroke.width = 0.5;
        updatedCode.stroke.color = 'rgba(9,9,9,0.7)';

        const icon = new CircleStyle({
            fill: new Fill(updatedCode.fill),
            radius: 7,
            stroke: new Stroke(updatedCode.stroke),
        });
        style.setImage(icon);
        return style;
    }
    else {
        throw new Error(`미지원 geometryType : ${geometryType}`);
    }
}

/**
 * 적합한 레이어 타입을 판별하고 대문자로 반환
 * @param layerCode
 * @returns
 */
function getLayerType(layerCode: Record<string, any>): string | undefined {
    // const validLayerGeometryTypes = ["Point","LineString","Polygon" /*'BASE'*/];

    const layerType = layerCode[KEY.LAYER_GEOMETRY_TYPE] as string | undefined;
    if (layerType) {
        // layerType = layerType.toUpperCase();
        if (Object.values(KEY.OL_GEOMETRY_OBJ).includes(layerType as any)) {
            return layerType;
        } else if (layerType == KEY.VIRTUAL_SOURCE_LAYER_KEY) {
            return 'Polygon';
        }
    } else {
        console.log(`valid layerTypes : `, Object.values(KEY.OL_GEOMETRY_OBJ));
        throw new Error(`layerType이 적합하지 않음 : ${layerType}`);
    }
    return undefined;
}

/**
 * factory에 입력된 레이어코드를 덮어씌운 코드 객체
 */
function getUpdatedLayerCode(layerCode: Record<string, any>): DefaultStyleOption {
    const returnLayerCode: DefaultStyleOption = structuredClone(default_style);

    if (layerCode[KEY.ICON_NAME]) returnLayerCode.icon.src = ctxPath + KEY.ICON_PATH + layerCode[KEY.ICON_NAME];
    else delete (returnLayerCode.icon as any).src;

    returnLayerCode.text.font = layerCode[KEY.FONT_STYLE] ?? returnLayerCode.text.font;

    returnLayerCode.text_stroke.color = layerCode[KEY.FONT_OUTLINE] ?? returnLayerCode.text_stroke.color;
    returnLayerCode.text_stroke.width = (layerCode[KEY.FONT_WIDTH] != null ? ~~layerCode[KEY.FONT_WIDTH] : returnLayerCode.text_stroke.width);
    returnLayerCode.text_fill.color = layerCode[KEY.FONT_FILL] ?? returnLayerCode.text_fill.color;

    returnLayerCode.stroke.color = layerCode[KEY.COLOR_LINE] ?? returnLayerCode.stroke.color;
    returnLayerCode.stroke.width = (layerCode[KEY.LINE_WIDTH] != null ? ~~layerCode[KEY.LINE_WIDTH] : returnLayerCode.stroke.width);
    if (layerCode[KEY.LINE_STYLE] && (layerCode[KEY.LINE_STYLE] as string).toUpperCase() !== "SOLID") {
        returnLayerCode.stroke.lineDash = JSON.parse(layerCode[KEY.LINE_STYLE]);
    } else {
        delete (returnLayerCode.stroke as any).lineDash;
    }

    returnLayerCode.fill.color = layerCode[KEY.COLOR_FILL] ?? returnLayerCode.fill.color;

    //레이어 구성하는 피쳐 타입에 따라 특수한 스타일 오버라이딩
    let layerType: string | undefined;
    try {
        layerType = getLayerType(layerCode);
    } catch (e) {
        console.error(e);
    }

    if (layerType == KEY.OL_GEOMETRY_OBJ.LINE) {
        returnLayerCode.text.placement = "line";
    } else if (layerType == KEY.OL_GEOMETRY_OBJ.POLYGON) {
        returnLayerCode.icon.width = 40;
        returnLayerCode.icon.height = 40;
    }

    return returnLayerCode;
}

/**
 * feature 에서 '라벨'로 할당된 value 를 표현하는 Text 스타일을 반환
 * @param feature
 * @param layerCode
 * @param tempStyleOption
 * @param resolution
 * @returns
 */
function getTextStyle(feature: FeatureLike, layerCode: Record<string, any>, tempStyleOption: DefaultStyleOption, resolution: number): Text | undefined {
    if ((resolution < 9) || (layerCode.geomType === KEY.OL_GEOMETRY_OBJ.POLYGON)) {
        const textOption: Record<string, any> = tempStyleOption.text;

        //폴리곤 라벨이면서 한계선택해상도 미만의 줌에서 라벨을 희미하게 보이도록 처리
        if (layerCode[KEY.LAYER_GEOMETRY_TYPE] === KEY.OL_GEOMETRY_OBJ.POLYGON
            && resolution < KEY.POLYGON_SELECT_MARGINAL_RESOLUTION
            && isThisLayerSpacious(layerCode)
        ) {
            const tempStrk = structuredClone(tempStyleOption.text_stroke);
            tempStrk.color = 'rgba(80,80,80,0.25)';
            const tempFill = structuredClone(tempStyleOption.text_fill);
            tempFill.color = 'rgba(80,80,80,0.25)';
            textOption["stroke"] = new Stroke(tempStrk);
            textOption["fill"] = new Fill(tempFill);
        } else {
            textOption["stroke"] = new Stroke(tempStyleOption.text_stroke);
            textOption["fill"] = new Fill(tempStyleOption.text_fill);
        }
        textOption["text"] = (feature as Feature).get(layerCode[KEY.LABEL_COLUMN]) ?? "";

        const textStyle = new Text(textOption);
        const resolScale = resolution < 4 ? (resolution < 2 ? 2 : 4 / resolution) : 1;
        textStyle.setScale(resolScale);
        textStyle.setOffsetX(textStyle.getOffsetX() * resolScale);

        return textStyle;
    } else {
        return undefined;
    }
}

/**
 * 점 형 피쳐를 렌더링하는
 */
function getStyleFunc_POINT(layerCode: Record<string, any>, tempStyleOption: DefaultStyleOption): (feature: FeatureLike, resolution: number) => Style {
    return function (feature: FeatureLike, resolution: number): Style {
        const style = new Style();
        //1. 포인트 객체에 아이콘 이름 할당되엇으면
        let icon: Icon | CircleStyle;
        if (layerCode[KEY.ICON_NAME]) {
            try {
                icon = new Icon(tempStyleOption.icon as any);
            } catch (e) {
                console.error(e);
                icon = new CircleStyle({
                    fill: new Fill(tempStyleOption.fill),
                    radius: 3,
                    stroke: new Stroke(tempStyleOption.stroke),
                });
            }
        } else {
            icon = new CircleStyle({
                fill: new Fill(tempStyleOption.fill),
                radius: 4,
                stroke: new Stroke(tempStyleOption.stroke),
            });
        }
        if (icon) style.setImage(icon);

        //2. layerCode에 텍스트 컬럼 지정되었으면
        if (layerCode[KEY.LABEL_COLUMN]) {
            style.setText(getTextStyle(feature, layerCode, tempStyleOption, resolution)!);
        }
        return style;
    };
}

function getStyleFunc_LINE(layerCode: Record<string, any>, tempStyleOption: DefaultStyleOption): (feature: FeatureLike, resolution: number) => Style {
    return function (feature: FeatureLike, resolution: number): Style {
        const style = new Style();
        style.setStroke(new Stroke(tempStyleOption.stroke));

        //2. layerCode에 텍스트 컬럼 지정되었으면
        if (layerCode[KEY.LABEL_COLUMN]) {
            style.setText(getTextStyle(feature, layerCode, tempStyleOption, resolution)!);
        }
        return style;
    };
    // return styleFunc;
}

/**
 * @param layerCode
 * @param tempStyleOption
 */
function getStyleFunc_POLYGON(layerCode: Record<string, any>, tempStyleOption: DefaultStyleOption): (feature: FeatureLike, resolution: number) => Style[] {
    return function (feature: FeatureLike, resolution: number): Style[] {

        const returnStyleArr: Style[] = [];

        if (isThisLayerBackgroundlike(layerCode)) {
            const style_01 = new Style({ stroke: new Stroke({ color: 'rgba(254,254,254,0.4)', width: 20, }) });
            const style_02 = new Style({ stroke: new Stroke({ color: 'rgba(254,254,254,0.8)', width: 10, }) });
            returnStyleArr.push(style_01);
            returnStyleArr.push(style_02);
        }

        const style_1 = new Style();

        style_1.setStroke(new Stroke(tempStyleOption.stroke));
        const conditionalStroke = style_1.getStroke()!;

        //멀리서 유효한 레이어들 경계선 처리
        if (isThisLayerSpacious(layerCode)) {
            if (resolution < KEY.POLYGON_SELECT_MARGINAL_RESOLUTION) {
                conditionalStroke.setLineDash([10, 10]);
            } else {
                conditionalStroke.setLineDash(undefined as any);
            }
        }

        style_1.setStroke(conditionalStroke);

        style_1.setFill(new Fill(tempStyleOption.fill));

        //2. layerCode에 텍스트 컬럼 지정되었으면
        if (layerCode[KEY.LABEL_COLUMN]) {

            tempStyleOption.text.textAlign = 'center';
            tempStyleOption.text.justify = 'center';

            const textStyle = getTextStyle(feature, layerCode, tempStyleOption, resolution);
            if (textStyle) {
                textStyle.setOffsetX(0);
                textStyle.setOffsetY(0);
                style_1.setText(textStyle);
//	                style.setZIndex(Infinity); // style 의 zindex 는 같은 레이어 내 feature 들 간 zindex임
                //참고 : https://github.com/openlayers/openlayers/issues/11101
                //참고2: https://github.com/openlayers/openlayers/issues/10096
            }
        }

        returnStyleArr.push(style_1);

        //3. 아이콘이 있을 때 폴리곤 스타일과 중심좌표 아이콘 둘 다 반환한다
        if (layerCode[KEY.ICON_NAME]) {

            const geom = (feature as Feature).getGeometry();
            let targetGeom: Point | any;
            if (geom instanceof Polygon) {
//                targetGeom = geom.getInteriorPoint();
                const ext = geom.getExtent();
                targetGeom = new Point([0.5 * ext[0] + 0.5 * ext[2], 0.5 * ext[1] + 0.5 * ext[3]]);
            } else if (geom instanceof MultiPolygon) {
                targetGeom = geom.getInteriorPoints();
            } else {
                throw new Error(`Feature 가 폴리곤 또는 멀티폴리곤 아님`);
            }
            const style_2 = new Style();
            const icon = new Icon(tempStyleOption.icon as any);
            if (icon) {
                const resolScale = resolution < 4 ? (resolution < 2 ? 2 : 4 / resolution) : 1;
                icon.setScale(resolScale);
                style_2.setImage(icon);
            }
            style_2.setGeometry(targetGeom);

            returnStyleArr.push(style_2);
        }

        return returnStyleArr;
    };
}

function getStyleFunc_HIGHTLIGHT(): Style[] {

    const stroke = {
        color: "rgba(249,248,209,0.95)", //
//        lineDash :[5,5],
//        lineDashOffset:5,
        width: 5,
    };
    const fill = {
        color: "rgba(31, 238, 115, 0.4)", //옅은 연두색
    };

    const style: Style[] = [
        new Style({
            image: new CircleStyle({
                fill: new Fill({ color: fill.color }),
                stroke: new Stroke(stroke),
                radius: 10,
            }),
            fill: new Fill({ color: fill.color }),
            stroke: new Stroke(stroke),
            //zIndex: Infinity,
        }),
        new Style({
            stroke: new Stroke({
                color: 'rgba(233,51,51,1)',
                width: stroke.width + 4,
            }),
        }),
    ];
    return style;
}

function getStyleFunc_HIGHTLIGHT_MAINMAP(): Style[] {

    const fill = {
        color: "rgba(31, 238, 115, 0.4)", //옅은 연두색
    };
    // return function (feature, resolution){

    const style: Style[] = [
        new Style({
            image: new CircleStyle({
                fill: new Fill({ color: fill.color }),
                stroke: new Stroke({
                    color: "rgba(249,248,209,0.95)", //
                    width: 5,
                }),
                radius: 10,
            }),
            fill: new Fill({ color: fill.color }),
            stroke: new Stroke({
                color: "rgba(198,254,14,0.3)", //
                width: 25,
            }),
        }),
        new Style({
            stroke: new Stroke({
                color: 'rgba(198,254,14,0.8)',
                width: 9,
            }),
        }),
        new Style({
            stroke: new Stroke({
                color: 'rgba(50,50,50,1)',
                width: 4,
            }),
        }),
    ];
    return style;
    // }
}

function getStyleFunc_ADDRESS(): Style {

    const stroke = {
        color: "rgba(249,248,209,0.95)", //
        // lineDash: [6,6],
        width: 1,
    };
    const fill = {
        color: "rgba(31, 238, 115, 1)", //옅은 연두색
    };

    const iconParam = {
        crossOrigin: "anonymous",
        src: ctxPath + KEY.ICON_PATH + 'ICON_ADDRESS.png',
        anchor: [0.5, 0.9] as [number, number], //이미지 가운데 하단
        displacement: [0, 0] as [number, number], //이격정도 [5, 6] : 오른쪽으로 5, 위쪽으로 6
        opacity: 1, //투명도 0~1
        rotateWithView: false,
        declutterMode: 'declutter' as const, // ['declutter', 'obstacle', 'none']
        height: 40,
        width: 40,
    };

    const textOption: Record<string, any> = {
        font: `25px Malgun Gothic`,
        offsetX: 10, // 양수로 지정시 우측이동
        offsetY: 0, // 양수로 지정시 하방이동
        placement: "point", // 'line' : 선분 따라 글자 표현
        //textAlign, justify 예시 https://openlayers.org/en/v7.5.2/examples/vector-labels-justify-text.html
        textAlign: "left", // ['left','right','end','start','center']
        justify: "left", //['left','center','right']
        textBaseline: "middle", // ['bottom', 'top', 'middle', 'alphabetic', 'hanging', 'ideographic']
        overflow: true,	//라벨이 feature의 크기보다 커져도 보이게 함
    };
    textOption["stroke"] = new Stroke(default_style.text_stroke);
    textOption["fill"] = new Fill(default_style.text_fill);
    return new Style({
//            image: new CircleStyle({
//                fill: new Fill({color:fill.color}),
//                stroke: new Stroke(stroke),
//                radius: 5,
//            }),
        image: new Icon(iconParam as any),
        text: new Text(textOption)
    });
}
