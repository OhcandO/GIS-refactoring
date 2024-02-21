import * as KEY from '../common/MO.keyMap.js';
import { LayerTree } from './MO.LayerTree.js';

/**
 * LayerTree 의 상속버전
 *
 * @export
 * @class LayerTree_new
 * @extends {LayerTree}
 */
export class LayerTree_uew extends LayerTree {
    
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
            let hasChild = false;

            if (layerCode[KEY.CHILD_MARK]?.length > 0) hasChild = true;
            if (level == 1) html += `<ul>`;
            if (isGroup == "Y") {
                html += `<li id="${id}">${name}<ul>`;
            } else {
                let src = this.makeLegendSrc(layerCode);
                html += `<li id="layerid_${id}" data-layerid="${id}" data-type="${type}" class="${type} ${id}"><img src="${src}" style="width:16px;"/>&nbsp;&nbsp;${name}</li>`;
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

