import * as KEY from '../common/MO.keyMap.js';
import {Style,Stroke,Fill,Text,Icon,Circle as CircleStyle} from '../../lib/openlayers_v7.5.1/style.js';
import { MultiPolygon, Polygon } from '../../lib/openlayers_v7.5.1/geom.js';
import Feature from '../../lib/openlayers_v7.5.1/Feature.js';
/**
 * 이 JS 파일에서 아이콘 경로까지의 relative path
 */
// const iconPath= `../images/icons/`;
const iconPath= `./MO_GIS/images/icons/`;
const default_style={
    icon : {
        crossOrigin: "anonymous",
        src: undefined,
        anchor: [0.5, 0.5], //이미지 정 중앙
        displacement: [0, 0], //이격정도 [5, 6] : 오른쪽으로 5, 위쪽으로 6
        opacity: 1, //투명도 0~1
        scale: 1,
        rotateWithView: false,
        declutterMode: undefined, // ['declutter', 'obstacle', 'none']
    },

    text : {
        font: `12px Malgun Gothic`,
        offsetX: 10, // 양수로 지정시 우측이동
        offsetY: 0, // 양수로 지정시 하방이동
        placement: "point", // 'line' : 선분 따라 글자 표현
        //textAlign, justify 예시 https://openlayers.org/en/v7.5.2/examples/vector-labels-justify-text.html
        textAlign: "left", // ['left','right','end','start','center']
        justify: "left", //['left','center','right']
        textBaseline: "middle", // ['bottom', 'top', 'middle', 'alphabetic', 'hanging', 'ideographic']
        overflow:true,	//라벨이 feature의 크기보다 커져도 보이게 함
    },
    text_stroke : {
        color: "rgba(255,255,225,0.9)", //검정
        width: 3,
    },
    text_fill : {
        color: "rgba(0,0,0,1)", //흰색
    },

    stroke : {
        color: "rgba(55,93,232,0.74)", //옅은 파랑
        lineDash: null, // [2,2]
        width: 2,
    },
    fill : {
        color: "rgba(31, 238, 115, 0.8)", //옅은 연두색
    },
}

/**
 * 레이어 코드로 부터, 벡터 레이어의 표현 방식을 설정하기 위한 ol.style 객체 생성기
 *
 * @param {KEY.layerCodeObj|string} layerCode 
 * @export
 * @returns {Function | Style}
 * @author jhoh
 */
export function createStyleFunction (layerCode) {

        if(layerCode =='HIGHLIGHT'){
            return getStyleFunc_HIGHTLIGHT();
        }else if(layerCode =='ADDRESS'){
            return getStyleFunc_ADDRESS();
        }

    
    
    let tempStyleOption;

    tempStyleOption = getUpdatedLayerCode(layerCode);
    let layerType;
    try{
        layerType = getLayerType(layerCode);
    }catch(e){
        console.log(e);
    }

    let styleFunc;
    if(layerType ==KEY.OL_GEOMETRY_TYPE_POINT){
        styleFunc= getStyleFunc_POINT(layerCode,tempStyleOption);
    }else if (layerType == KEY.OL_GEOMETRY_TYPE_LINE){
        styleFunc= getStyleFunc_LINE(layerCode, tempStyleOption);
    }else if (layerType == KEY.OL_GEOMETRY_TYPE_POLYGON){
        styleFunc= getStyleFunc_POLYGON(layerCode, tempStyleOption);
    }

    if(styleFunc) return styleFunc;
}

/**
 * 적합한 레이어 타입을 판별하고 대문자로 반환
 * @param {string} layerCode 
 * @returns {string}
 */
function getLayerType(layerCode) {
    //'group', 'BASE' 는 DB상 나눠놓은 코드이고, 벡터 데이터는 아니므로 여기서는 제외
    const validLayerGeometryTypes = ["POINT","LINE","POLYGON" ,""/*,'group','BASE'*/];
    
    let layerType = layerCode[KEY.LAYER_GEOMETRY_TYPE];
    if (layerType) {
        layerType = layerType.toUpperCase();
        if (validLayerGeometryTypes.includes(layerType)) {
            return layerType;
        }
    } else {
        console.log(`valid layerTypes : `, validLayerGeometryTypes);
        throw new Error(`layerType이 적합하지 않음 : ${layerType}`);
    }
}

/**
 * factory에 입력된 레이어코드를 덮어씌운 코드 객체
 */
function getUpdatedLayerCode(layerCode) {
    let returnLayerCode = structuredClone(default_style);

    if (layerCode[KEY.ICON_NAME]) returnLayerCode.icon.src = iconPath + layerCode[KEY.ICON_NAME];
    else delete returnLayerCode.icon.src;

    returnLayerCode.text.font = layerCode[KEY.FONT_STYLE] ?? returnLayerCode.text.font;

    returnLayerCode.text_stroke.color = layerCode[KEY.FONT_OUTLINE] ?? returnLayerCode.text_stroke.color;
    returnLayerCode.text_fill.color = layerCode[KEY.FONT_FILL] ?? returnLayerCode.text_fill.color;

    returnLayerCode.stroke.color = layerCode[KEY.COLOR_LINE] ?? returnLayerCode.stroke.color;
    returnLayerCode.stroke.width = layerCode[KEY.LINE_WIDTH] ?? returnLayerCode.stroke.width;
    if(layerCode[KEY.LINE_STYLE] && layerCode[KEY.LINE_STYLE].toUpperCase()!="SOLID"){
        returnLayerCode.stroke.lineDash = JSON.parse(layerCode[KEY.LINE_STYLE]);
    }else{
        delete returnLayerCode.stroke.lineDash;
    }

    returnLayerCode.fill.color = layerCode[KEY.COLOR_FILL] ?? returnLayerCode.fill.color;

    //레이어 구성하는 피쳐 타입에 따라 특수한 스타일 오버라이딩
    let layerType;
    try {
        layerType = getLayerType(layerCode);
    } catch (e) {
        console.error(e);
    }

    if (layerType == KEY.OL_GEOMETRY_TYPE_LINE) {
        returnLayerCode.text.placement = "line";
    } else if (layerType == KEY.OL_GEOMETRY_TYPE_POLYGON) {
        returnLayerCode.icon.scale = 1.5;
    }

    return returnLayerCode;
}

/**
 * feature 에서 '라벨'로 할당된 value 를 표현하는 Text 스타일을 반환
 * @param {Feature} feature
 * @returns {Text}
 */
function getTextStyle(feature, layerCode, tempStyleOption) {
    let textOption = tempStyleOption.text;
    textOption["stroke"] = new Stroke(tempStyleOption.text_stroke);
    textOption["fill"] = new Fill(tempStyleOption.text_fill);
    textOption["text"] = feature.get(layerCode[KEY.LABEL_COLUMN]) ?? "";
    return new Text(textOption);
}

/**
 * 점 형 피쳐를 렌더링하는
 */
function getStyleFunc_POINT(layerCode, tempStyleOption) {
    return function (feature, resolution) {
        let style = new Style();
        //1. 포인트 객체에 아이콘 이름 할당되엇으면
        let icon;
        if (layerCode[KEY.ICON_NAME]) {
            icon = new Icon(tempStyleOption.icon);
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
            style.setText(getTextStyle(feature, layerCode, tempStyleOption));
        }
        return style;
    }
}

function getStyleFunc_LINE(layerCode, tempStyleOption) {
    return function (feature, resolution) {
        let style = new Style();
        style.setStroke(new Stroke(tempStyleOption.stroke));

        //2. layerCode에 텍스트 컬럼 지정되었으면
        if (layerCode[KEY.LABEL_COLUMN]) {
            style.setText(getTextStyle(feature, layerCode, tempStyleOption));
        }
        return style;
    }
    // return styleFunc;
}

function getStyleFunc_POLYGON(layerCode, tempStyleOption) {
    return function (feature, resolution) {
        let style = new Style();
            style.setStroke(new Stroke(tempStyleOption.stroke));
            style.setFill(new Fill(tempStyleOption.fill));

        //2. layerCode에 텍스트 컬럼 지정되었으면
        if (layerCode[KEY.LABEL_COLUMN]) {
                style.setText(getTextStyle(feature, layerCode, tempStyleOption));
        }

        //3. 아이콘이 있을 때 폴리곤 스타일과 중심좌표 아이콘 둘 다 반환한다
        if (layerCode[KEY.ICON_NAME]) {
            let styleArr = [style];

            let geom = feature.getGeometry();
            let targetGeom;
            if (geom instanceof Polygon) {
                targetGeom = geom.getInteriorPoint();
            } else if (geom instanceof MultiPolygon) {
                targetGeom = geom.getInteriorPoints();
            } else {
                throw new Error(`Feature 가 폴리곤 또는 멀티폴리곤 아님`);
            }
            let style2 = new Style();
            let icon = new Icon(tempStyleOption.icon);
            if (icon) style2.setImage(icon);
            style2.setGeometry(targetGeom);

            styleArr.push(style2);
            return styleArr;
        } else {
            return style;
        }
    }
}

function getStyleFunc_HIGHTLIGHT(){

    const stroke = {
        color: "rgba(249,248,209,0.95)", //
        // lineDash: [6,6],
        width: 6,
    };
    const fill = {
        color: "rgba(31, 238, 115, 1)", //옅은 연두색
    };
    // return function (feature, resolution){

    let style = [
        new Style({
            image: new CircleStyle({
                fill: new Fill({color:fill.color}),
                stroke: new Stroke(stroke),
                radius: 5,
            }),
            fill: new Fill({color:fill.color}),
            stroke: new Stroke(stroke),
            zIndex: Infinity,
            }),
        new Style({
            stroke: new Stroke({
                color: 'rgba(233,51,51,1)',
                width: stroke.width+4,
            }),
        }),
    ];
    return style;
    // }
}


function getStyleFunc_ADDRESS(){

    const stroke = {
        color: "rgba(249,248,209,0.95)", //
        // lineDash: [6,6],
        width: 1,
    };
    const fill = {
        color: "rgba(31, 238, 115, 1)", //옅은 연두색
    };

    let textOption = default_style.text;
    textOption["stroke"] = new Stroke(default_style.text_stroke);
    textOption["fill"] = new Fill(default_style.text_fill);
    return new Style({
            image: new CircleStyle({
                fill: new Fill({color:fill.color}),
                stroke: new Stroke(stroke),
                radius: 5,
            }), 
            text:new Text(textOption)           
        });
}

