import * as KEY from '../common/MO.keyMap.js';
import { MOFactory } from './abstract/MO.Factory.js';
import {Style,Stroke,Fill,Text,Icon,Circle as CircleStyle} from '../../lib/openlayers_v7.5.1/style.js';
import { MultiPolygon, Polygon } from '../../lib/openlayers_v7.5.1/geom.js';
import Feature from '../../lib/openlayers_v7.5.1/Feature.js';
/**
 * 이 JS 파일에서 아이콘 경로까지의 relative path
 */
// const iconPath= `../images/icons/`;
const iconPath= `./MO_GIS/images/icons/`;

/**
 * 레이어 코드로 부터, 벡터 레이어의 표현 방식을 설정하기 위한 ol.style 객체 생성기
 *
 * @deprecated 선언된 클래스에서 반환되는 함수 (styleFunction) 가 mutable 인 관계로 클래스화 폐기
 * @export
 * @class StyleFactory
 * @extends {MOFactory}
 * @author jhoh
 */
export class StyleFactory extends MOFactory {
    
    /** 
     * 기본 스타일 객체들의 구조체
     * @typedef {object} default_style 
     * @property {object} icon icon option 
     * @property {string} [icon.src] icon source
     * @property {Array<number>} icon.anchor 아이콘 가로세로 중심좌표 (default: [0.5,0.5])
     * @property {object} text text option
     * @property {string} text.font text font shorthand version
     * 
     * @property {object} text_stroke text stroke option
     * @property {string} text_stroke.color text outline color
     * @property {number} text_stroke.width text outline width
     * 
     * @property {object} text_fill text fill option
     * @property {string} text_fill.color text fill color in rgba
     * @property {object} stroke line stroke option
     * @property {object} fill polygon fill option
     * 
     */
    #default_style={
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
            offsetX: 0, // 양수로 지정시 우측이동
            offsetY: 6, // 양수로 지정시 하방이동
            placement: "point", // 'line' : 선분 따라 글자 표현
            //textAlign, justify 예시 https://openlayers.org/en/v7.5.2/examples/vector-labels-justify-text.html
            textAlign: "left", // ['left','right','end','start','center']
            justify: "left", //['left','center','right']
            textBaseline: "middle", // ['bottom', 'top', 'middle', 'alphabetic', 'hanging', 'ideographic']
        },
        text_stroke : {
            color: "rgba(255,255,2255,0.9)", //검정
            width: 1,
        },
        text_fill : {
            color: "rgba(0,0,0,1)", //흰색
        },
    
        stroke : {
            color: "rgba(55,93,232,0.74)", //옅은 파랑
            lineDash: null, // [2,2]
            width: 1,
        },
        fill : {
            color: "rgba(31, 238, 115, 0.8)", //옅은 연두색
        },
    }
    tempStyleOption;
    #INSTANCE_styleFunction;

    /**
     * 적합한 레이어 타입을 판별하고 대문자로 반환
     * @returns {String}
     */
    #getLayerType() {
        //'group', 'BASE' 는 DB상 나눠놓은 코드이고, 벡터 데이터는 아니므로 여기서는 제외
        const validLayerGeometryTypes = ["POINT","LINE","POLYGON" /* ,'group','BASE' */];
        
        let layerType = this.getSpec()[KEY.LAYER_GEOMETRY_TYPE];
        if (layerType) {
            layerType = layerType.toUpperCase();
            if (
                validLayerGeometryTypes.some((type) => type.toUpperCase() === layerType)
            ) {
                return layerType;
            }
        } else {
            console.log(`valid layerTypes : `, validLayerGeometryTypes);
            throw new Error(`layerType이 적합하지 않음 : ${layerType}`);
        }
    }

    resetFactory(){
        super.resetFactory();
        this.#INSTANCE_styleFunction= undefined;
        this.tempStyleOption= undefined;
    }

    /**
     * layerCode에 등록된 스타일 정보로 StyleFunction 반환
     *
     * @memberof StyleFactory
     */
    getStyleFunction() {
        this.updateLayerCode();
        if(!this.#INSTANCE_styleFunction) {

            let styleFunc;
    
            let type = this.getSpec()[KEY.LAYER_GEOMETRY_TYPE];
            if (type === KEY.OL_FEATURE_TYPE_POINT) {
                styleFunc = new this.#getStyleFunc_POINT();
            } else if (type === KEY.OL_FEATURE_TYPE_LINE) {
                styleFunc = this.#getStyleFunc_LINE();
            } else if (type === KEY.OL_FEATURE_TYPE_POLYGON) {
                styleFunc = this.#getStyleFunc_POLYGON();
            } 

            console.log(styleFunc);
            if (styleFunc) this.#INSTANCE_styleFunction = styleFunc;
            else {
                throw new Error(`StyleFunction 생성할 수 없음`);
            }
        }
        return this.#INSTANCE_styleFunction;
    }

    getStyleFunction_highlight(){
        return this.#getStyleFunc_HIGHTLIGHT();
    }
    
    /**
     * factory에 입력된 레이어코드를 덮어씌운 코드 객체
     * @return {default_style}
     * @readonly
     */
    updateLayerCode() {
        let src = this.getSpec();
        let returnLayerCode = structuredClone(this.#default_style);

        if (src[KEY.ICON_NAME]) returnLayerCode.icon.src = iconPath + src[KEY.ICON_NAME];
        else delete returnLayerCode.icon.src;

        returnLayerCode.text.font = src[KEY.FONT_STYLE] ?? returnLayerCode.text.font;

        returnLayerCode.text_stroke.color = src[KEY.FONT_OUTLINE] ?? returnLayerCode.text_stroke.color;
        returnLayerCode.text_fill.color = src[KEY.FONT_FILL] ?? returnLayerCode.text_fill.color;

        returnLayerCode.stroke.color = src[KEY.COLOR_LINE] ?? returnLayerCode.stroke.color;
        returnLayerCode.stroke.width = src[KEY.LINE_WIDTH] ?? returnLayerCode.stroke.width;
        if(src[KEY.LINE_STYLE] && src[KEY.LINE_STYLE].toUpperCase()!="SOLID"){
            returnLayerCode.stroke.lineDash = src[KEY.LINE_STYLE];
            console.log(src[KEY.LINE_STYLE])
        }else{
            delete returnLayerCode.stroke.lineDash;
        }

        returnLayerCode.fill.color = src[KEY.COLOR_FILL] ?? returnLayerCode.fill.color;

        //레이어 구성하는 피쳐 타입에 따라 특수한 스타일 오버라이딩
        let layerType;
        try {
            layerType = this.#getLayerType();
        } catch (e) {
            console.error(e);
        }

        if (layerType == KEY.OL_FEATURE_TYPE_LINE) {
            returnLayerCode.text.placement = "line";
        } else if (layerType == KEY.OL_FEATURE_TYPE_POLYGON) {
            returnLayerCode.icon.scale = 1.5;
        }
        this.tempStyleOption = returnLayerCode;
    }

    /**
     * 점 형 피쳐를 렌더링하는
     */
    #getStyleFunc_POINT() {
        let me = this;

        // let styleFunc =function (feature, resolution) {
        return function (feature, resolution) {
            let style = new Style();
            //1. 포인트 객체에 아이콘 이름 할당되엇으
            let icon;
            if (me.getSpec()[KEY.ICON_NAME]) {
                icon = new Icon(me.tempStyleOption.icon);
            } else {
                icon = new CircleStyle({
                    fill: new Fill(me.tempStyleOption.fill),
                    radius: 4,
                    stroke: new Stroke(me.tempStyleOption.stroke),
                });
            }
            if (icon) style.setImage(icon);

            //2. layerCode에 텍스트 컬럼 지정되었으면
            if (me.getSpec()[KEY.LABEL_COLUMN]) {
                style.setText(me.#getTextStyle(feature, resolution));
            }
            return style;
        }
    }

    /**
     * feature 에서 '라벨'로 할당된 value 를 표현하는 Text 스타일을 반환
     * @param {Feature} feature
     * @returns {Text}
     */
    #getTextStyle(feature, resolution) {
        let textOption = this.tempStyleOption.text;
        let label = (feature)=>feature.get(this.getSpec()[KEY.LABEL_COLUMN]) ?? "";
        textOption["stroke"] = new Stroke(this.tempStyleOption.text_stroke);
        textOption["fill"] = new Fill(this.tempStyleOption.text_fill);
        textOption["text"] = label(feature);
        return new Text(textOption);
    }

    /**
     *
     */
    #getStyleFunc_LINE() {
        let me = this;
        let cnt = 1;
        // let styleFunc = function (feature, resolution) {
        return function (feature, resolution) {
            let style = new Style();
            style.setStroke(new Stroke(me.tempStyleOption.stroke));

            //2. layerCode에 텍스트 컬럼 지정되었으면
            if (me.getSpec()[KEY.LABEL_COLUMN]) {
                style.setText(me.#getTextStyle(feature, resolution));
            }
            return style;
        }
        // return styleFunc;
    }
    #getStyleFunc_POLYGON() {
        let me = this;
        /**
         *
         * @param {Feature} feature
         * @param {Number} resolution
         * @returns
         */
        let styleFunc= function (feature, resolution) {
            let style = new Style();
            style.setStroke(new Stroke(me.tempStyleOption.stroke));
            style.setFill(new Fill(me.tempStyleOption.fill));

            //2. layerCode에 텍스트 컬럼 지정되었으면
            if (me.getSpec()[KEY.LABEL_COLUMN]) {
                style.setText(me.#getTextStyle(feature, resolution));
            }

            //3. 아이콘이 있을 때 폴리곤 스타일과 중심좌표 아이콘 둘 다 반환한다
            if (me.getSpec()[KEY.ICON_NAME]) {
                let styleArr = [style];

                let geom = feature.getGeometry();
                let targetGeom;
                if (geom instanceof Polygon) {
                    targetGeom = geom.getInteriorPoint();
                } else if (geom instanceof MultiPolygon) {
                    targetGeom = geom.getInteriorPoints();
                } else {
                    console.table(me.getSpec());
                    throw new Error(`Feature 가 폴리곤 또는 멀티폴리곤 아님`);
                }
                let style2 = new Style();
                let icon = new Icon(me.tempStyleOption.icon);
                if (icon) style2.setImage(icon);
                style2.setGeometry(targetGeom);

                styleArr.push(style2);
                return styleArr;
            } else {
                return style;
            }
        }
        return new styleFunc;
    }

    #getStyleFunc_HIGHTLIGHT(){
        let me = this;
        let styleFunc= function (feature, resolution){
            let style = new Style();
            let circle = new CircleStyle({
                fill: new Fill(me.tempStyleOption.fill),
                radius: 4,
                stroke: new Stroke(me.tempStyleOption.stroke),
            });

            style.setImage(circle);

            return style;
        }
        return styleFunc;
    }
}

