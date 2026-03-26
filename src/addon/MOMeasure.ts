import { Draw, Modify } from 'ol/interaction';
import { LineString, Point, Polygon } from 'ol/geom';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { getArea, getLength } from 'ol/sphere';
import {
    Circle as CircleStyle,
    Fill,
    RegularShape,
    Stroke,
    Style,
    Text,
} from 'ol/style';
import OlMap from 'ol/Map';
import type { Feature } from 'ol';
import type Geometry from 'ol/geom/Geometry';
import type { StyleLike } from 'ol/style/Style';
import type { DrawEvent } from 'ol/interaction/Draw';

// MOGISMap 은 아직 미변환이므로 런타임 타입으로 참조
declare const mainMap: any;

/**
 * MOGISMap 인터페이스 (아직 미변환이므로 최소 인터페이스 정의)
 */
interface IMOGISMap {
    map: OlMap;
    enableSelect(flag: boolean): void;
    INSTANCE?: {
        INTERACTION?: {
            SELECT?: any;
        };
    };
}

/**
 * ol.map 객체와 상호작용하여, 길이/면적 측정 상호작용할 수 있도록 하는 객체
 * 지도 당 한개 객체
 *
 * @export
 * @class MOMeasure
 * 출처 : https://openlayers.org/en/v7.5.2/examples/measure-style.html
 */
export class MOMeasure {
    style: Style = new Style({
        fill: new Fill({ color: 'rgba(255, 255, 255, 0.2)' }),
        stroke: new Stroke({
            color: 'rgba(0, 0, 0, 0.5)',
            lineDash: [10, 10],
            width: 2,
        }),
        image: new CircleStyle({
            radius: 5,
            stroke: new Stroke({ color: 'rgba(0, 0, 0, 0.7)' }),
            fill: new Fill({ color: 'rgba(255, 255, 255, 0.2)' }),
        }),
    });

    labelStyle: Style = new Style({
        text: new Text({
            font: '14px Calibri,sans-serif',
            fill: new Fill({ color: 'rgba(255, 255, 255, 1)' }),
            backgroundFill: new Fill({ color: 'rgba(0, 0, 0, 0.7)' }),
            padding: [3, 3, 3, 3],
            textBaseline: 'bottom',
            offsetY: -15,
        }),
        image: new RegularShape({
            radius: 8,
            points: 3,
            angle: Math.PI,
            displacement: [0, 10],
            fill: new Fill({ color: 'rgba(0, 0, 0, 0.7)' }),
        }),
    });

    tipStyle: Style = new Style({
        text: new Text({
            font: '12px Calibri,sans-serif',
            fill: new Fill({ color: 'rgba(255, 255, 255, 1)' }),
            backgroundFill: new Fill({ color: 'rgba(0, 0, 0, 0.4)' }),
            padding: [2, 2, 2, 2],
            textAlign: 'left',
            offsetX: 15,
        }),
    });

    modifyStyle: Style = new Style({
        image: new CircleStyle({
            radius: 5,
            stroke: new Stroke({ color: 'rgba(0, 0, 0, 0.7)' }),
            fill: new Fill({ color: 'rgba(0, 0, 0, 0.4)' }),
        }),
        text: new Text({
            text: '수정하려면 드래그하세요',
            font: '12px Calibri,sans-serif',
            fill: new Fill({ color: 'rgba(255, 255, 255, 1)' }),
            backgroundFill: new Fill({ color: 'rgba(0, 0, 0, 0.7)' }),
            padding: [2, 2, 2, 2],
            textAlign: 'left',
            offsetX: 15,
        }),
    });

    segmentStyle: Style = new Style({
        text: new Text({
            font: '12px Calibri,sans-serif',
            fill: new Fill({ color: 'rgba(255, 255, 255, 1)' }),
            backgroundFill: new Fill({ color: 'rgba(0, 0, 0, 0.4)' }),
            padding: [2, 2, 2, 2],
            textBaseline: 'bottom',
            offsetY: -12,
        }),
        image: new RegularShape({
            radius: 6,
            points: 3,
            angle: Math.PI,
            displacement: [0, 8],
            fill: new Fill({ color: 'rgba(0, 0, 0, 0.4)' }),
        }),
    });

    segmentStyles: Style[] | undefined;

    source: VectorSource | undefined;
    modify: Modify | undefined;
    tipPoint: Point | undefined;

    draw: Draw | undefined;

    #INSTNACE_MOGISMap: IMOGISMap | undefined;
    #INSTNACE_OL_MAP: OlMap | undefined;
    #INSTANCE_MEASURE_LAYER: VectorLayer<VectorSource> | undefined;

    /**
     * Creates an instance of Measure.
     * @param mogisMap - MOGISMap 객체
     * @param makeBtn - 측정도구 버튼 필드 신규 생성여부
     */
    constructor(mogisMap: IMOGISMap, makeBtn: boolean = false) {
        let ol_map: OlMap | undefined;
        if (mogisMap && mogisMap.map) {
            this.#INSTNACE_MOGISMap = mogisMap;
            ol_map = mogisMap.map;
        }
        if (ol_map instanceof OlMap) {
            this.#INSTNACE_OL_MAP = ol_map;

            if (makeBtn) {
                this.#createRadio();
            }
            this.#activate();
        } else {
            console.log(mogisMap);
            throw new Error(`입력된 객체가 MOGISMap 객체가 아님`);
        }
    }

    #createRadio(): void {
        const html = `
        <div class="mogis control flex container" id="measure">
            <div class="mogis measure option">
                <label for="pan"> <input type="radio" name="control_measure" id="pan" value="">기본</label>
            </div>
            <div class="mogis measure option">
                <label for="measure_line"> <input type="radio" name="control_measure" id="measure_line" value="LineString">길이</label>
            </div>
            <div class="mogis measure option">
                <label for="poly"><input type="radio" name="control_measure" id="poly" value="Polygon">면적</label>
            </div>
        </div>
        `;
        (this.#INSTNACE_OL_MAP!.getTarget() as HTMLElement).insertAdjacentHTML(`afterend`, html);
    }

    /**
     * 설정 초기화
     */
    #activate(): void {
        this.segmentStyles = [this.segmentStyle];

        this.source = new VectorSource();

        this.modify = new Modify({
            source: this.source,
            style: this.modifyStyle,
        });

        // this.enableMeasure();
    }

    #formatLength(line: LineString): string {
        const length = getLength(line);
        let output: string;
        if (length > 100) {
            output = Math.round((length / 1000) * 100) / 100 + ' km';
        } else {
            output = Math.round(length * 100) / 100 + ' m';
        }
        return output;
    }

    #formatArea(polygon: Polygon): string {
        const area = getArea(polygon);
        let output: string;
        if (area > 10000) {
            output = Math.round((area / 1000000) * 100) / 100 + ' km\xB2';
        } else {
            output = Math.round(area * 100) / 100 + ' m\xB2';
        }
        return output;
    }

    #styleFunction(feature: Feature<Geometry>, segments: boolean, drawType?: string, tip?: string): Style[] {
        const me = this;
        const styles: Style[] = [];
        const geometry = feature.getGeometry()!;
        const type = geometry.getType();
        let point: Point | undefined;
        let label: string | undefined;
        let line: LineString | undefined;
        if (!drawType || drawType === type || type === 'Point') {
            styles.push(me.style);
            if (type === 'Polygon') {
                point = (geometry as Polygon).getInteriorPoint();
                label = me.#formatArea(geometry as Polygon);
                line = new LineString((geometry as Polygon).getCoordinates()[0]);
            } else if (type === 'LineString') {
                point = new Point((geometry as LineString).getLastCoordinate());
                label = me.#formatLength(geometry as LineString);
                line = geometry as LineString;
            }
        }
        if (segments && line) {
            let count = 0;
            line.forEachSegment(function (a, b) {
                const segment = new LineString([a, b]);
                const segLabel = me.#formatLength(segment);
                if (me.segmentStyles!.length - 1 < count) {
                    me.segmentStyles!.push(me.segmentStyle.clone());
                }
                const segmentPoint = new Point(segment.getCoordinateAt(0.5));
                me.segmentStyles![count].setGeometry(segmentPoint);
                me.segmentStyles![count].getText()!.setText(segLabel);
                styles.push(me.segmentStyles![count]);
                count++;
            });
        }
        if (label) {
            me.labelStyle.setGeometry(point!);
            me.labelStyle.getText()!.setText(label);
            styles.push(me.labelStyle);
        }
        if (tip && type === 'Point' && !me.modify!.getOverlay().getSource()!.getFeatures().length) {
            me.tipPoint = geometry as Point;
            me.tipStyle.getText()!.setText(tip);
            styles.push(me.tipStyle);
        }
        return styles;
    }

    #enableMeasure(): void {
        const me = this;

        this.#INSTANCE_MEASURE_LAYER = new VectorLayer({
            source: this.source,
            style: function (feature: Feature<Geometry>) {
                return me.#styleFunction(feature, true);
            } as any,
            zIndex: 500,
        });

        if (this.#INSTNACE_OL_MAP instanceof OlMap) {
            this.#INSTNACE_OL_MAP.addLayer(this.#INSTANCE_MEASURE_LAYER);
            this.#INSTNACE_OL_MAP.addInteraction(this.modify!);
        }
    }

    #disableMeasure(): void {
        if (this.#INSTANCE_MEASURE_LAYER) {
            this.#INSTNACE_OL_MAP!.removeLayer(this.#INSTANCE_MEASURE_LAYER);
            this.#INSTNACE_OL_MAP!.removeInteraction(this.draw!);
            this.#INSTNACE_OL_MAP!.removeInteraction(this.modify!);
            this.#activate();
        }
    }

    /**
     * 선택된 geometry type 에 따라 길이, 면적 측정 가능하게 함
     * 또는, false 입력시 원 상태로 돌아가는 로직
     *
     * @param drawType - 'LineString' | 'Polygon' | false
     */
    activeMeasure(drawType: 'LineString' | 'Polygon' | false): void {
        const me = this;
        if (this.draw) {
            this.#INSTNACE_OL_MAP!.removeInteraction(me.draw!);
            this.#disableMeasure();
        }
        if (!drawType) {
            console.log('reset');
            //select 상호작용이 선언되었던 상황이면 재 기용
            if (mainMap.INSTANCE.INTERACTION.SELECT) {
                this.#INSTNACE_MOGISMap!.enableSelect(true);
            }
        } else {
            this.#INSTNACE_MOGISMap!.enableSelect(false);
            this.#enableMeasure();
            const activeTip = '마우스 클릭으로  ' + (drawType === 'Polygon' ? '도형' : '선분') + '을 그립니다';
            const idleTip = '마우스 클릭으로 시작지점 선택합니다';
            let tip = idleTip;
            this.draw = new Draw({
                source: this.source,
                type: drawType,
                style: function (feature: Feature<Geometry>) {
                    return me.#styleFunction(feature, true, drawType, tip);
                } as any,
            });
            this.draw.on('drawstart', function () {
                if (true) {
                    me.source!.clear();
                }
                me.modify!.setActive(false);
                tip = activeTip;
            });
            this.draw.on('drawend', function () {
                me.modifyStyle.setGeometry(me.tipPoint!);
                me.modify!.setActive(true);
                me.#INSTNACE_OL_MAP!.once('pointermove', function () {
                    me.modifyStyle.setGeometry(undefined as any);
                });
                tip = idleTip;
            });
            me.modify!.setActive(true);
            me.#INSTNACE_OL_MAP!.addInteraction(me.draw!);
        }
    }
}
