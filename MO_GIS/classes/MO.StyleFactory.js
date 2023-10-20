import * as KEY from '../common/MO.keyMap.js';
import { MOFactory } from './abstract/MO.Factory';
import Style,{StyleFunction} from '../../lib/openlayers_v7.5.1/style/Style.js';
import Stroke from '../../lib/openlayers_v7.5.1/style/Stroke.js';
import Fill from '../../lib/openlayers_v7.5.1/style/Fill.js';
import Text from '../../lib/openlayers_v7.5.1/style/Text.js';
import Icon from '../../lib/openlayers_v7.5.1/style/Icon.js';
import CircleStyle from '../../lib/openlayers_v7.5.1/style/Circle.js'
import { MultiPolygon, Polygon } from '../../lib/openlayers_v7.5.1/geom.js';
import Feature from '../../lib/openlayers_v7.5.1/Feature.js';
/**
 * 이 JS 파일에서 아이콘 경로까지의 relative path
 */
const iconPath= `../images/icons/`;

/**
 * 레이어의 스타일을 
 *
 * @export
 * @class StyleFactory
 * @extends {MOFactory}
 */
export class StyleFactory extends MOFactory {
    #default_icon = {
        crossOrigin: "anonymous",
        src: undefined,
        anchor: [0.5, 0.5], //이미지 정 중앙
        displacement: [0, 0], //이격정도 [5, 6] : 오른쪽으로 5, 위쪽으로 6
        opacity: 1, //투명도 0~1
        scale: 1,
        rotateWithView: false,
        declutterMode: undefined, // ['declutter', 'obstacle', 'none']
    };

    #default_text = {
        font: `12px Malgun Gothic`,
        offsetX: 0, // 양수로 지정시 우측이동
        offsetY: 6, // 양수로 지정시 하방이동
        placement: "point", // 'line' : 선분 따라 글자 표현
        //textAlign, justify 예시 https://openlayers.org/en/v7.5.2/examples/vector-labels-justify-text.html
        textAlign: "left", // ['left','right','end','start','center']
        justify: "left", //['left','center','right']
        textBaseline: "middle", // ['bottom', 'top', 'middle', 'alphabetic', 'hanging', 'ideographic']
    };
    #default_text_stroke = {
        color: "rgba(255,255,2255,0.9)", //검정
        width: 1,
    };
    #default_text_fill = {
        color: "rgba(0,0,0,1)", //흰색
    };

    #default_stroke = {
        color: "rgba(55,93,232,0.74)", //옅은 파랑
        lineDash: undefined, // [2,2]
        width: 1,
    };
    #deafult_fill = {
        color: "rgba(31, 238, 115, 0.8)", //옅은 연두색
    };



    /**
     * 적합한 레이어 타입을 판별하고 대문자로 반환
     * @returns {String}
     */
    #getLayerType() {
        const validLayerTypes = ['POINT','LINE','POLYGON' /* ,'group','BASE' */]; //'group', 'BASE' 는 DB상 나눠놓은 코드이고, 벡터 데이터는 아니므로 여기서는 제외
        let layerType = this.layerCode[KEY.LAYER_TYPE];
        if(layerType){
            layerType = layerType.toUpperCase();
            if(validLayerTypes.some(type=>type.toUpperCase()===layerType)){
                return layerType;
            }
        }else{
            console.log(`valid layerTypes : `, validLayerTypes);
            throw new Error(`layerType이 적합하지 않음 : ${layerType}`)
        }
    }

    /**
     * layerCode에 등록된 스타일 정보로 StyleFunction 반환
     *
     * @return {StyleFunction}
     * @memberof StyleFactory
     */
    getStyleFunction() {
        this.#updateLayerCode();
        let styleFunc;

        let type;
        try{
            type = this.#getLayerType();
        }catch(e){console.error(e)}
        if (type === KEY.OL_FEATURE_TYPE_POINT) {
            styleFunc = this.#getStyleFunc_POINT();
        } else if (type === KEY.OL_FEATURE_TYPE_LINE) {
            styleFunc = this.#getStyleFunc_LINE();
        } else if (type === KEY.OL_FEATURE_TYPE_POLYGON) {
            styleFunc = this.#getStyleFunc_POLYGON();
        }

        if (styleFunc instanceof StyleFunction) return styleFunc;
        else {
            throw new Error(`StyleFunction 생성할 수 없음`);
        }
    }
    /**
     * layerCode 에서 스타일과 관련된 항목들을
     *  (nullish 가 아니라면) 디폴트 설정에 덮어씌움
     * @memberof StyleFactory
     */
    #updateLayerCode() {
        let src = this.layerCode;
        if (src[KEY.ICON_NAME]) this.#default_icon.src = iconPath + src[KEY.ICON_NAME];
        else delete this.#default_icon.src; 
        
        this.#default_text.font = src[KEY.FONT_STYLE] ?? this.#default_text;
        
        this.#default_text_stroke.color = src[KEY.FONT_OUTLINE] ?? this.#default_text_stroke.color;
        this.#default_text_fill.color = src[KEY.FONT_FILL] ?? this.#default_text_fill.color;

        this.#default_stroke.color = src[KEY.COLOR_LINE] ?? this.#default_stroke.color;
        this.#default_stroke.width = src[KEY.LINE_WIDTH] ?? this.#default_stroke.width;
        this.#default_stroke.lineDash = src[KEY.LINE_STYLE] ?? this.#default_stroke.lineDash;

        this.#deafult_fill.color = src[KEY.COLOR_FILL] ?? this.#deafult_fill.color;

        //레이어 구성하는 피쳐 타입에 따라 특수한 스타일 오버라이딩
        let layerType;
        try{
            layerType = this.#getLayerType();
        }catch(e){console.error(e)}

        if(layerType == KEY.OL_FEATURE_TYPE_LINE){
            this.#default_text.placement='line';
        }else if (layerType == KEY.OL_FEATURE_TYPE_POLYGON){
            this.#default_icon.scale = 1.5;
        }
    }

    /**
     * 점 형 피쳐를 렌더링하는
     * @returns {StyleFunction}
     */
    #getStyleFunc_POINT() {
        let me = this;
        function styleFunc(feature, resolution) {
            let style = new Style();
            //1. 포인트 객체에 아이콘 이름 할당되엇으
            let icon;
            if (me.layerCode[KEY.ICON_NAME]) {
                icon = new Icon(me.#default_icon);
            } else {
                icon = new CircleStyle({
                    fill: new Fill(me.#deafult_fill),
                    radius: 4,
                    stroke: new Stroke(me.#default_stroke),
                });
            }
            if (icon) style.setImage(icon);

            //2. layerCode에 텍스트 컬럼 지정되었으면
            if (me.layerCode[KEY.LABEL_COLUMN]) {
                style.setText(me.#getTextStyle(feature, resolution));
            }
            return style;
        }
        return styleFunc;
    }

    /**
     * feature 에서 '라벨'로 할당된 value 를 표현하는 Text 스타일을 반환
     * @param {*} feature
     * @returns {Text}
     */
    #getTextStyle(feature, resolution) {
        let textOption = structuredClone(this.#default_text);
        textOption["stroke"] = new Stroke(this.#default_text_stroke);
        textOption["fill"] = new Fill(this.#default_text_fill);
        textOption["text"] = feature.get(this.layerCode[KEY.LABEL_COLUMN]) ?? "";
        return new Text(textOption);
    }

    /**
     *
     * @returns {StyleFunction}
     */
    #getStyleFunc_LINE() {
        let me = this;
        function styleFunc(feature, resolution) {
            let style = new Style();
            style.setStroke(new Stroke(me.#default_stroke));

            //2. layerCode에 텍스트 컬럼 지정되었으면
            if (me.layerCode[KEY.LABEL_COLUMN]) {
                style.setText(me.#getTextStyle(feature, resolution));
            }
            return style;
        }
        return styleFunc;
    }
    #getStyleFunc_POLYGON() {
        let me = this;
        /**
         * 
         * @param {Feature} feature 
         * @param {Number} resolution 
         * @returns 
         */
        function styleFunc(feature, resolution) {
            let style = new Style();
            style.setStroke(new Stroke(me.#default_stroke));
            style.setFill(new Fill(me.#deafult_fill));

            //2. layerCode에 텍스트 컬럼 지정되었으면
            if (me.layerCode[KEY.LABEL_COLUMN]) {
                style.setText(me.#getTextStyle(feature, resolution));
            }
            
            //3. 아이콘이 있을 때 폴리곤 스타일과 중심좌표 아이콘 둘 다 반환한다
            if (me.layerCode[KEY.ICON_NAME]) {
                let styleArr = [style];
                
                let geom = feature.getGeometry();
                let targetGeom;
                if(geom instanceof Polygon){
                    targetGeom = geom.getInteriorPoint();
                }else if(geom instanceof MultiPolygon){
                    targetGeom = geom.getInteriorPoints();
                }else{
                    console.table(me.layerCode);
                    throw new Error (`Feature 가 폴리곤 또는 멀티폴리곤 아님`)
                }
                let style2 = new Style();
                let icon = new Icon(me.#default_icon);
                if(icon) style2.setImage(icon);
                style2.setGeometry(targetGeom);

                styleArr.push(style2);
                return styleArr;
            }else{
                return style;
            }            
        }
        return styleFunc;
    }
}