import * as KEY from '../common/MO.keyMap.js';
import { StyleFactory } from '../classes/MO.StyleFactory.js';
import Map from "../../lib/openlayers_v7.5.1/Map.js";
import Select from '../../lib/openlayers_v7.5.1/interaction/Select.js'


let selectStyle={}

selectStyle[KEY.FONT_STYLE] = '15px Malgun Gothic';
selectStyle[KEY.FONT_OUTLINE] = 'rgba(15,15,15,1)';
selectStyle[KEY.FONT_FILL] = 'rgba(255,255,0,1)';
selectStyle[KEY.COLOR_LINE] = 'rgba(226, 51, 51, 1)';
selectStyle[KEY.LINE_WIDTH] = 5;
selectStyle[KEY.LINE_STYLE] = '[3,3]';
selectStyle[KEY.COLOR_FILL] = 'rgba(226, 51, 51, 0.54)';
// selectStlye[KEY.LABEL_COLUMN] = ''; 

const default_hitTolerance = 10;

const styleFactory = new StyleFactory();
styleFactory.setSpec(selectStyle);

let selectEvent = new Select({
    style:styleFactory.getStyleFunction_highlight(),
    multi:false, // 하나만 선택되도록
    hitTolerance: default_hitTolerance,
    layers: function(layer){
        let bool = false;
        bool = layer.get(KEY.BOOL_SELECTABLE)?.toUpperCase() === 'Y';
        return bool;
    }
});


function enableSelection(map){
    if(map instanceof Map){
        map.addInteraction(selectEvent);
        selectEvent.on('select',function(e){

        })
    }
}

function removeSelectEvent(map){
    if(map instanceof Map){
        map.removeInteraction
    }
}

function enablePointerAction(map, selectInteraction){
    if(map instanceof Map && selectInteraction instanceof Select){

        function pointerEvent(evt){
            let features = map.forEachFeatureAtPixel(evt.pixel, pixelEvent, {hitTolerance : default_hitTolerance});

            if(features && selectInteraction.getActive()){
                map.getTargetElement().style.cursor = 'pointer';
            }
        }

        function pixelEvent(feature, layer){
            if(layer?.get(KEY.BOOL_SELECTABLE)?.toUpperCase()==='Y'){
                return true;
            }else return false;
        }

        map.on("pointermove", pointerEvent);

    }
}