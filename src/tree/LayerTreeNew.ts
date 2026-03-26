import * as KEY from '../common/keyMap';
import { LayerTree } from './LayerTree';

/**
 * LayerTree 의 상속버전
 *
 * @class LayerTreeNew
 * @extends {LayerTree}
 */
export class LayerTreeNew extends LayerTree {
  /**
   * 트리 html 생성 리턴
   */
  createWrap(array: Record<string, any>[], level?: number): string {
    let html = '';
    level = level || 1;
    array.forEach((layer) => {
      const id = layer[KEY.LAYER_ID];
      const name = layer[KEY.LAYER_NAME];
      const type = layer[KEY.LAYER_GEOMETRY_TYPE];
      const isGroup = layer[KEY.BOOL_IS_GROUP] || 'N';
      let hasChild = false;

      if (layer[KEY.CHILD_MARK]?.length > 0) hasChild = true;
      if (level === 1) html += `<ul class="contlist w165">`;
      if (isGroup === 'Y') {
        html += `<li id="${id}">${name}<ul class="contlist w165">`;
      } else {
        html += `
          <li id="layerid_${id}" data-layerid="${id}" data-type="${type}" class="${type} ${id}">
            ${name}
            <label class="switch">
              <input type="checkbox" value="on/off" id="layerid_${id}_check">
              <span class="slider round"></span>
            </label>
          </li>`;
      }
      if (hasChild) {
        level!++;
        html += this.createWrap(layer[KEY.CHILD_MARK], level);
        html += `</ul></li>`;
        level!--;
      }
      if (level === 1) {
        html += `</ul>`;
      }
    });
    return html;
  }
}
