import { Draw, Modify } from "../../../lib/openlayers_v7.5.1/interaction.js";
import { LineString, Point } from "../../../lib/openlayers_v7.5.1/geom.js";
import { Vector as VectorSource } from "../../../lib/openlayers_v7.5.1/source.js";
import { Vector as VectorLayer } from "../../../lib/openlayers_v7.5.1/layer.js";
import { getArea, getLength } from "../../../lib/openlayers_v7.5.1/sphere.js";
import {
    Circle as CircleStyle,
    Fill,
    RegularShape,
    Stroke,
    Style,
    Text,
} from "../../../lib/openlayers_v7.5.1/style.js";
import { MOGISMap } from "../MO.MOGISMap.js";
import Map from "../../../lib/openlayers_v7.5.1/Map.js";

class Measure {
    style;
    labelStyle;
    tipStyle;
    modifyStyle;
    segmentStyle;
    segmentStyles;

    source;
    modify;
    tipPoint;

    draw;

    #INSTNACE_OL_MAP;
    #INSTANCE_MEASURE_LAYER;

    constructor(mogisMap) {
        if (mogisMap instanceof MOGISMap) {
            this.#INSTNACE_OL_MAP = mogisMap.map;
            this.#activate();
        }
    }

    /**
     * 설정 초기화
     */    
    #activate() {
        this.style = new Style({
            fill: new Fill({ color: "rgba(255, 255, 255, 0.2)" }),
            stroke: new Stroke({
                color: "rgba(0, 0, 0, 0.5)",
                lineDash: [10, 10],
                width: 2,
            }),
            image: new CircleStyle({
                radius: 5,
                stroke: new Stroke({ color: "rgba(0, 0, 0, 0.7)" }),
                fill: new Fill({ color: "rgba(255, 255, 255, 0.2)" }),
            }),
        });

        this.labelStyle = new Style({
            text: new Text({
                font: "14px Calibri,sans-serif",
                fill: new Fill({ color: "rgba(255, 255, 255, 1)" }),
                backgroundFill: new Fill({ color: "rgba(0, 0, 0, 0.7)" }),
                padding: [3, 3, 3, 3],
                textBaseline: "bottom",
                offsetY: -15,
            }),
            image: new RegularShape({
                radius: 8,
                points: 3,
                angle: Math.PI,
                displacement: [0, 10],
                fill: new Fill({ color: "rgba(0, 0, 0, 0.7)" }),
            }),
        });

        this.tipStyle = new Style({
            text: new Text({
                font: "12px Calibri,sans-serif",
                fill: new Fill({ color: "rgba(255, 255, 255, 1)" }),
                backgroundFill: new Fill({ color: "rgba(0, 0, 0, 0.4)" }),
                padding: [2, 2, 2, 2],
                textAlign: "left",
                offsetX: 15,
            }),
        });

        this.modifyStyle = new Style({
            image: new CircleStyle({
                radius: 5,
                stroke: new Stroke({ color: "rgba(0, 0, 0, 0.7)" }),
                fill: new Fill({ color: "rgba(0, 0, 0, 0.4)" }),
            }),
            text: new Text({
                text: "수정하려면 드래그하세요",
                font: "12px Calibri,sans-serif",
                fill: new Fill({ color: "rgba(255, 255, 255, 1)" }),
                backgroundFill: new Fill({ color: "rgba(0, 0, 0, 0.7)" }),
                padding: [2, 2, 2, 2],
                textAlign: "left",
                offsetX: 15,
            }),
        });

        this.segmentStyle = new Style({
            text: new Text({
                font: "12px Calibri,sans-serif",
                fill: new Fill({ color: "rgba(255, 255, 255, 1)" }),
                backgroundFill: new Fill({ color: "rgba(0, 0, 0, 0.4)" }),
                padding: [2, 2, 2, 2],
                textBaseline: "bottom",
                offsetY: -12,
            }),
            image: new RegularShape({
                radius: 6,
                points: 3,
                angle: Math.PI,
                displacement: [0, 8],
                fill: new Fill({ color: "rgba(0, 0, 0, 0.4)" }),
            }),
        });

        this.segmentStyles = [segmentStyle];

        this.source = new VectorSource();

        this.modify = new Modify({
            source: this.source,
            style: this.modifyStyle,
        });
    }

    formatLength(line) {
        const length = getLength(line);
        let output;
        if (length > 100) {
            output = Math.round((length / 1000) * 100) / 100 + " km";
        } else {
            output = Math.round(length * 100) / 100 + " m";
        }
        return output;
    }

    formatArea(polygon) {
        const area = getArea(polygon);
        let output;
        if (area > 10000) {
            output = Math.round((area / 1000000) * 100) / 100 + " km\xB2";
        } else {
            output = Math.round(area * 100) / 100 + " m\xB2";
        }
        return output;
    }

    styleFunction(feature, segments, drawType, tip) {
        let me = this;
        const styles = [];
        const geometry = feature.getGeometry();
        const type = geometry.getType();
        let point, label, line;
        if (!drawType || drawType === type || type === "Point") {
            styles.push(style);
            if (type === "Polygon") {
                point = geometry.getInteriorPoint();
                label = me.formatArea(geometry);
                line = new LineString(geometry.getCoordinates()[0]);
            } else if (type === "LineString") {
                point = new Point(geometry.getLastCoordinate());
                label = me.formatLength(geometry);
                line = geometry;
            }
        }
        if (segments && line) {
            let count = 0;
            line.forEachSegment(function (a, b) {
                const segment = new LineString([a, b]);
                const label = me.formatLength(segment);
                if (me.segmentStyles.length - 1 < count) {
                    me.segmentStyles.push(me.segmentStyle.clone());
                }
                const segmentPoint = new Point(segment.getCoordinateAt(0.5));
                me.segmentStyles[count].setGeometry(segmentPoint);
                me.segmentStyles[count].getText().setText(label);
                styles.push(me.segmentStyles[count]);
                count++;
            });
        }
        if (label) {
            me.labelStyle.setGeometry(point);
            me.labelStyle.getText().setText(label);
            styles.push(labelStyle);
        }
        if (tip && type === "Point" && !me.modify.getOverlay().getSource().getFeatures().length) {
            me.tipPoint = geometry;
            me.tipStyle.getText().setText(tip);
            styles.push(tipStyle);
        }
        return styles;
    }

    enableMeasure() {
        let me = this;

        this.#INSTANCE_MEASURE_LAYER = new VectorLayer({
            source: me.source,
            style: function (feature) {
                return me.styleFunction(feature, showSegments.checked);
            },
        });

        if (this.#INSTNACE_OL_MAP instanceof Map) {
            this.#INSTNACE_OL_MAP.addLayer(this.#INSTANCE_MEASURE_LAYER);
            this.#INSTNACE_OL_MAP.addInteraction(this.modify);
        }
    }

    /**
     *
     *
     * @param {String} drawType - LineString | Polygon
     * @memberof Measure
     */
    activeMeasure(drawType) {
        let me = this;
        const activeTip = "마우스 클릭으로  " + (drawType === "Polygon" ? "도형" : "선분") + "을 그립니다";
        const idleTip = "마우스 클릭으로 시작지점 선택합니다";
        let tip = idleTip;
        this.draw = new Draw({
            source: this.source,
            type: drawType,
            style: function (feature) {
                // return me.styleFunction(feature,showSegments.checked,drawType,tip);
                return me.styleFunction(feature, true,drawType,tip);
            },
        });
        this.draw.on("drawstart", function () {
            // if (clearPrevious.checked) {
            if (true) {
                me.source.clear();
            }
            me.modify.setActive(false);
            tip = activeTip;
        });
        this.draw.on("drawend", function () {
            me.modifyStyle.setGeometry(tipPoint);
            me.modify.setActive(true);
            me.#INSTNACE_OL_MAP.once("pointermove", function () {
                me.modifyStyle.setGeometry();
            });
            tip = idleTip;
        });
        me.modify.setActive(true);
        me.#INSTNACE_OL_MAP.addInteraction(draw);
    }

    enableEvent() {
        let me = this;
        typeSelect.onchange = function () {
            me.#INSTNACE_OL_MAP.removeInteraction(me.draw);
            addInteraction();
        };

        addInteraction();

        showSegments.onchange = function () {
            me.vector.changed();
            me.draw.getOverlay().changed();
        };
    }
}

//TODO https://openlayers.org/en/v7.5.2/examples/measure-style.html
