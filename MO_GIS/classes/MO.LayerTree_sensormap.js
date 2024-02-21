import * as KEY from '../common/MO.keyMap.js';
import { MOGISMap } from './MO.MOGISMap.js';
import {Spinner} from '../../lib/spin.js/spin.js';
import { LayerTree } from './MO.LayerTree.js';

/**
 * MOGISMap 을 인자로 받아, 해당 Map 객체의 레이어를 관장하는 
 * JSTree 구조체를 생성함
 * 지도 객체 하나에 여러개의 layerTree 객체 생성될 수 있음
 * @requires JQuery1.9+ JStree
 * @class LayerTree
 * @author jhoh
 */
export class LayerTreeSensor extends LayerTree {

    /**
     * 트리 html 생성 리턴
     */
    createWrap(array, level) {
        let html = ``;
        level = level || 1;
        array.forEach((layerCode) => {
            const id = layerCode[KEY.LAYER_ID];
            const name = layerCode[KEY.LAYER_NAME];
            const type = layerCode[KEY.LAYER_GEOMETRY_TYPE];
            const isGroup = layerCode[KEY.BOOL_IS_GROUP] || "N";
			const typeName = layerCode[KEY.TYPE_NAME];

            let hasChild = false;

            if (layerCode[KEY.CHILD_MARK]?.length > 0) hasChild = true;
            if (level == 1) html += `<ul class="contlist w165">`;
            if(isGroup == "Y") {
                html += `<li id="${id}">${name}<ul class="contlist w165">`;
            }
            else {
//                let src = this.makeLegendSrc(layerCode);
                html += `
                	<li id="layerid_${id}" data-layerid="${id}" data-typename="${typeName}" data-type="${type}" class="${type} ${id}">
                		${name}
                		<label class="switch">
							<input type="checkbox" value="on/off" id="layerid_${id}_check">
							<span class="slider round"></span>
						</label>
                	</li>`;
            } 
            if (hasChild) {
                level++;
                html += this.createWrap(layerCode[KEY.CHILD_MARK], level);
                html += `</ul></li>`;
                level--;
            }
            if (level == 1) {
                html += `</ul>`;
            }
        });
        return html;
    }
}