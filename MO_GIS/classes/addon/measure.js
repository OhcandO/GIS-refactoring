// import {Draw, Modify} from 'ol/interaction.js';
// import {LineString, Point} from 'ol/geom.js';
// import {OSM, Vector as VectorSource} from 'ol/source.js';
// import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
// import {getArea, getLength} from 'ol/sphere.js';
import {Draw, Modify} from '../../../lib/openlayers_v7.5.1/interaction.js';
import {LineString, Point} from '../../../lib/openlayers_v7.5.1/geom.js';
import {Vector as VectorSource} from '../../../lib/openlayers_v7.5.1/source.js';
import {Vector as VectorLayer} from '../../../lib/openlayers_v7.5.1/layer.js';
import {getArea, getLength} from '../../../lib/openlayers_v7.5.1/sphere.js';
import {Circle as CircleStyle,Fill,
    RegularShape,Stroke,Style,Text,} from '../../../lib/openlayers_v7.5.1/style.js';
import { MOGISMap } from '../MO.MOGISMap.js';
import Map from '../../../lib/openlayers_v7.5.1/Map.js';

class Measure{

    style;
    labelStyle;
    tipStyle;
    modifyStyle;
    segmentStyle;
    segmentStyles;

    source;

    modify;

    tipPoint;

    #INSTNACE_OL_MAP
    #INSTANCE_MEASURE_LAYER
    constructor(mogisMap){
        if(mogisMap instanceof MOGISMap){
            this.#INSTNACE_OL_MAP = mogisMap.map;
        }

        this.style = new Style({
            fill: new Fill({color: 'rgba(255, 255, 255, 0.2)',}),
            stroke: new Stroke({
              color: 'rgba(0, 0, 0, 0.5)',
              lineDash: [10, 10],
              width: 2,
            }),
            image: new CircleStyle({
              radius: 5,
              stroke: new Stroke({color: 'rgba(0, 0, 0, 0.7)',}),
              fill: new Fill({color: 'rgba(255, 255, 255, 0.2)',}),
            }),
          });
    
          this.labelStyle = new Style({
            text: new Text({
              font: '14px Calibri,sans-serif',
              fill: new Fill({color: 'rgba(255, 255, 255, 1)',}),
              backgroundFill: new Fill({color: 'rgba(0, 0, 0, 0.7)',}),
              padding: [3, 3, 3, 3],
              textBaseline: 'bottom',
              offsetY: -15,
            }),
            image: new RegularShape({
              radius: 8,
              points: 3,
              angle: Math.PI,
              displacement: [0, 10],
              fill: new Fill({color: 'rgba(0, 0, 0, 0.7)',}),
            }),
          });
          
          this.tipStyle = new Style({
            text: new Text({
              font: '12px Calibri,sans-serif',
              fill: new Fill({color: 'rgba(255, 255, 255, 1)',}),
              backgroundFill: new Fill({color: 'rgba(0, 0, 0, 0.4)',}),
              padding: [2, 2, 2, 2],
              textAlign: 'left',
              offsetX: 15,
            }),
          });
    
          this.modifyStyle = new Style({
            image: new CircleStyle({
              radius: 5,
              stroke: new Stroke({color: 'rgba(0, 0, 0, 0.7)',}),
              fill: new Fill({color: 'rgba(0, 0, 0, 0.4)',}),
            }),
            text: new Text({
              text: 'Drag to modify',
              font: '12px Calibri,sans-serif',
              fill: new Fill({color: 'rgba(255, 255, 255, 1)',}),
              backgroundFill: new Fill({color: 'rgba(0, 0, 0, 0.7)',}),
              padding: [2, 2, 2, 2],
              textAlign: 'left',
              offsetX: 15,
            }),
          });
    
          this.segmentStyle = new Style({
            text: new Text({
              font: '12px Calibri,sans-serif',
              fill: new Fill({color: 'rgba(255, 255, 255, 1)',}),
              backgroundFill: new Fill({color: 'rgba(0, 0, 0, 0.4)',}),
              padding: [2, 2, 2, 2],
              textBaseline: 'bottom',
              offsetY: -12,
            }),
            image: new RegularShape({
              radius: 6,
              points: 3,
              angle: Math.PI,
              displacement: [0, 8],
              fill: new Fill({color: 'rgba(0, 0, 0, 0.4)',}),
            }),
          });
          
          this.segmentStyles = [segmentStyle];

          this.source = new VectorSource();

         this.modify = new Modify({source: this.source, style: this.modifyStyle});
    }
 
      formatLength (line) {
        const length = getLength(line);
        let output;
        if (length > 100) {
          output = Math.round((length / 1000) * 100) / 100 + ' km';
        } else {
          output = Math.round(length * 100) / 100 + ' m';
        }
        return output;
      };

      formatArea (polygon) {
        const area = getArea(polygon);
        let output;
        if (area > 10000) {
          output = Math.round((area / 1000000) * 100) / 100 + ' km\xB2';
        } else {
          output = Math.round(area * 100) / 100 + ' m\xB2';
        }
        return output;
      };

      

      styleFunction(feature, segments, drawType, tip) {
        let me = this;
        const styles = [];
        const geometry = feature.getGeometry();
        const type = geometry.getType();
        let point, label, line;
        if (!drawType || drawType === type || type === 'Point') {
          styles.push(style);
          if (type === 'Polygon') {
            point = geometry.getInteriorPoint();
            label = me.formatArea(geometry);
            line = new LineString(geometry.getCoordinates()[0]);
          } else if (type === 'LineString') {
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
        if (tip &&type === 'Point' && !me.modify.getOverlay().getSource().getFeatures().length) {
          me.tipPoint = geometry;
          me.tipStyle.getText().setText(tip);
          styles.push(tipStyle);
        }
        return styles;
      }

      enableMeasure(){
        let me =this;

          this.#INSTANCE_MEASURE_LAYER = new VectorLayer({
            source: me.source,
            style: function (feature) {
              return me.styleFunction(feature, showSegments.checked);
            },
          });

          if(this.#INSTNACE_OL_MAP instanceof Map){
              this.#INSTNACE_OL_MAP.addLayer(this.#INSTANCE_MEASURE_LAYER);
              this.#INSTNACE_OL_MAP.addInteraction(this.modify);

          }

      }

      draw;

      /**
       *
       *
       * @param {String} drawType - LineString | Polygon
       * @memberof Measure
       */
      activeMeasure(drawType){
        let me =this;
        const activeTip ='Click to continue drawing the ' +
          (drawType === 'Polygon' ? 'polygon' : 'line');
        const idleTip = 'Click to start measuring';
        let tip = idleTip;
        this.draw = new Draw({
          source: this.source,
          type: drawType,
          style: function (feature) {
            return this.styleFunction(feature, showSegments.checked, drawType, tip);
          },
        });
        this.draw.on('drawstart', function () {
          if (clearPrevious.checked) {
            me.source.clear();
          }
          me.modify.setActive(false);
          tip = activeTip;
        });
        this.draw.on('drawend', function () {
          me.modifyStyle.setGeometry(tipPoint);
          me.modify.setActive(true);
          me.#INSTNACE_OL_MAP.once('pointermove', function () {
            me.modifyStyle.setGeometry();
          });
          tip = idleTip;
        });
        me.modify.setActive(true);
        me.#INSTNACE_OL_MAP.addInteraction(draw);
      }

      enableEvent(){
        typeSelect.onchange = function () {
            map.removeInteraction(draw);
            addInteraction();
          };
          
          addInteraction();
          
          showSegments.onchange = function () {
            vector.changed();
            draw.getOverlay().changed();
          };
      }

      
}

//TODO https://openlayers.org/en/v7.5.2/examples/measure-style.html