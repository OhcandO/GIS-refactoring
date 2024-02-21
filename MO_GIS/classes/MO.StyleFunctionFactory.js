import * as KEY from '../common/MO.keyMap.js';
import {Style,Stroke,Fill,Text,Icon,Circle as CircleStyle} from '../../lib/openlayers_v7.5.1/style.js';
import { MultiPolygon, Polygon,Point } from '../../lib/openlayers_v7.5.1/geom.js';
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
        rotateWithView: false,
        declutterMode: undefined, // ['declutter', 'obstacle', 'none']
        height:20,
        width:20,
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

        if(layerCode ==KEY.HIGHLIGHT_SOURCE_LAYER_KEY){
            return getStyleFunc_HIGHTLIGHT();
        }else if(layerCode ==KEY.ADDRESS_SOURCE_LAYER_KEY){
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
    if(layerType ==KEY.OL_GEOMETRY_OBJ.POINT){
        styleFunc= getStyleFunc_POINT(layerCode,tempStyleOption);
    }else if (layerType == KEY.OL_GEOMETRY_OBJ.LINE){
        styleFunc= getStyleFunc_LINE(layerCode, tempStyleOption);
    }else if (layerType == KEY.OL_GEOMETRY_OBJ.POLYGON){
        styleFunc= getStyleFunc_POLYGON(layerCode, tempStyleOption);
    }

    if(styleFunc) return styleFunc;
}

/**
 * 가상 레이어들에 대해,
 * 특정 geometryType 특화된 StyleFunction 반환해 레이어 스타일 적용할 수 있도록 함수 반환
 * 그 와중에 layerCode 및 기본 스타일 적용된 버전을 적용
 * @param {KEY.OPENLAYERS_GEOMETRY_TYPE} geometryType 
 * @param  scaleFunction 
 */
export function createStyleFunctionForScale(geometryType, layerCodeObj){
	if(geometryType == 'LineString'){
		let updatedCode= getUpdatedLayerCode(layerCodeObj);
		let style = new Style();
        style.setStroke(new Stroke(updatedCode.stroke));
        return style;
	}
	else if(geometryType == 'Point'){
		let updatedCode= getUpdatedLayerCode(layerCodeObj);
		let style = new Style();
		updatedCode.stroke.width=0.5;
		updatedCode.stroke.color='rgba(9,9,9,0.7)';
		
		let icon = new CircleStyle({
                fill: new Fill(updatedCode.fill),
                radius: 7,
                stroke: new Stroke(updatedCode.stroke),
            });
        style.setImage(icon);    
		return style;
	}
	else{
		throw new Error (`미지원 geometryType : ${geometryType}`);
	}
}

/**
 * 적합한 레이어 타입을 판별하고 대문자로 반환
 * @param {string} layerCode 
 * @returns {KEY.OPENLAYERS_GEOMETRY_TYPE}
 */
function getLayerType(layerCode) {
    // const validLayerGeometryTypes = ["Point","LineString","Polygon" /*'BASE'*/];
    
    let layerType = layerCode[KEY.LAYER_GEOMETRY_TYPE];
    if (layerType) {
        // layerType = layerType.toUpperCase();
        if (Object.values(KEY.OL_GEOMETRY_OBJ).includes(layerType)) {
            return layerType;
        }else if (layerType == KEY.VIRTUAL_SOURCE_LAYER_KEY){
            return 'Polygon';
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

    if (layerCode[KEY.ICON_NAME]) returnLayerCode.icon.src = mogisIconPath + layerCode[KEY.ICON_NAME];
    else delete returnLayerCode.icon.src;

    returnLayerCode.text.font = layerCode[KEY.FONT_STYLE] ?? returnLayerCode.text.font;

    returnLayerCode.text_stroke.color = layerCode[KEY.FONT_OUTLINE] ?? returnLayerCode.text_stroke.color;
    returnLayerCode.text_stroke.width= ~~layerCode[KEY.FONT_WIDTH] ?? returnLayerCode.text_stroke.width;
    returnLayerCode.text_fill.color = layerCode[KEY.FONT_FILL] ?? returnLayerCode.text_fill.color;

    returnLayerCode.stroke.color = layerCode[KEY.COLOR_LINE] ?? returnLayerCode.stroke.color;
    returnLayerCode.stroke.width = ~~layerCode[KEY.LINE_WIDTH] ?? returnLayerCode.stroke.width;
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
 * @param {Feature} feature
 * @returns {Text}
 */
function getTextStyle(feature, layerCode, tempStyleOption,resolution) {
    let textOption = tempStyleOption.text;
    let tempStroke = new Stroke(tempStyleOption.text_stroke);
    tempStroke.setWidth(1);
    textOption["stroke"] = tempStroke; 
    textOption["fill"] = new Fill(tempStyleOption.text_fill);
    textOption["text"] = feature.get(layerCode[KEY.LABEL_COLUMN]) ?? "";
    
    let textStyle = new Text(textOption);
    let resolScale = resolution < 9 ? (resolution < 3 ? 3 : 9/resolution) : 1;  
    textStyle.setScale(resolScale);
    
    return textStyle;
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
			try{
	            icon = new Icon(tempStyleOption.icon);
			}catch(e){
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
            style.setText(getTextStyle(feature, layerCode, tempStyleOption,resolution));
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
            style.setText(getTextStyle(feature, layerCode, tempStyleOption,resolution));
        }
        return style;
    }
    // return styleFunc;
}

function getStyleFunc_POLYGON(layerCode, tempStyleOption) {
    return function (feature, resolution) {
        let style = new Style();
            style.setStroke(new Stroke(tempStyleOption.stroke));
            let conditionalStroke = style.getStroke();
            if(resolution < KEY.POLYGON_SELECT_MARGINAL_RESOLUTION){
	            conditionalStroke.setLineDash([10,10]);
			}else{
	            conditionalStroke.setLineDash(undefined);
			}
            style.setStroke(conditionalStroke);
            
            style.setFill(new Fill(tempStyleOption.fill));

        //2. layerCode에 텍스트 컬럼 지정되었으면
        if (layerCode[KEY.LABEL_COLUMN]) {
                let textStyle = getTextStyle(feature, layerCode, tempStyleOption,resolution);
                textStyle.setOffsetX(0);
                textStyle.setOffsetY(0); 
                style.setText(textStyle);
                
        }

        //3. 아이콘이 있을 때 폴리곤 스타일과 중심좌표 아이콘 둘 다 반환한다
        if (layerCode[KEY.ICON_NAME]) {
            let styleArr = [style];

            let geom = feature.getGeometry();
            let targetGeom;
            if (geom instanceof Polygon) {
//                targetGeom = geom.getInteriorPoint();
				let ext = geom.getExtent()
                targetGeom = new Point([0.5*ext[0]+0.5*ext[2],0.5*ext[1]+0.5*ext[3]]);
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
        width: 3,
    };
    const fill = {
        color: "rgba(31, 238, 115, 0.4)", //옅은 연두색
    };
    // return function (feature, resolution){

    let style = [
        new Style({
            image: new CircleStyle({
                fill: new Fill({color:fill.color}),
                stroke: new Stroke(stroke),
                radius: 10,
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
    
    const iconParam = {
        crossOrigin: "anonymous",
        src: mogisIconPath+'ICON_ADDRESS.png',
        anchor: [0.5, 0.9], //이미지 가운데 하단
        displacement: [0, 0], //이격정도 [5, 6] : 오른쪽으로 5, 위쪽으로 6
        opacity: 1, //투명도 0~1
        rotateWithView: false,
        declutterMode: 'declutter', // ['declutter', 'obstacle', 'none']
        height:40,
        width:40,
    }

    let textOption = {
        font: `25px Malgun Gothic`,
        offsetX: 10, // 양수로 지정시 우측이동
        offsetY: 0, // 양수로 지정시 하방이동
        placement: "point", // 'line' : 선분 따라 글자 표현
        //textAlign, justify 예시 https://openlayers.org/en/v7.5.2/examples/vector-labels-justify-text.html
        textAlign: "left", // ['left','right','end','start','center']
        justify: "left", //['left','center','right']
        textBaseline: "middle", // ['bottom', 'top', 'middle', 'alphabetic', 'hanging', 'ideographic']
        overflow:true,	//라벨이 feature의 크기보다 커져도 보이게 함
    };
    textOption["stroke"] = new Stroke(default_style.text_stroke);
    textOption["fill"] = new Fill(default_style.text_fill);
    return new Style({
//            image: new CircleStyle({
//                fill: new Fill({color:fill.color}),
//                stroke: new Stroke(stroke),
//                radius: 5,
//            }), 
			image:new Icon(iconParam),
            text:new Text(textOption)           
        });
}