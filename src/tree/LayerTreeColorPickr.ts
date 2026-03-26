import * as KEY from '../common/keyMap';
import Pickr from '@simonwep/pickr';
import { LayerTree } from './LayerTree';
import { CheckboxTree } from './CheckboxTree';
import type { ColorPickrConfig } from '../types';
import { DEFAULT_PICKR_CONFIG } from '../types';

/**
 * LayerTree 의 기본기능은 계승하면서,
 * Polygon 및 LineString 벡터 타입 레이어들의 색상을 변경해 LayerCode 에 반영할 수 있는
 * 레이어트리
 * @class LayerTreeColorPickr
 * @author jhoh
 */
export class LayerTreeColorPickr extends LayerTree {
  /** Pickr 설정 */
  private pickrConfig: Required<ColorPickrConfig>;

  constructor(tree_div_id: string, pickrConfig?: ColorPickrConfig) {
    super(tree_div_id);
    this.pickrConfig = { ...DEFAULT_PICKR_CONFIG, ...pickrConfig };
  }

  /**
   * 트리 생성
   */
  createTree(treeList: Record<string, any>[]): void {
    // 1. map div 에 tree용 영역 생성
    this.createTreeDiv();

    const wrap = this.createWrap(treeList);
    const container = document.getElementById(this.TREE_DIV_ID)!;
    const tree = new CheckboxTree(container);
    tree.init(wrap);
    this.INSTANCE_JS_TREE = tree;

    // ## colorPickr 객체생성
    const treeEl = document.getElementById(this.TREE_DIV_ID)!;
    treeEl.querySelectorAll<HTMLDivElement>('div.colorPickr').forEach((node) => {
      Pickr.create({
        el: node,
        theme: this.pickrConfig.theme,
        sliders: this.pickrConfig.sliders as any,
        defaultRepresentation: this.pickrConfig.defaultRepresentation as any,
        default: node.dataset.rgba,
        appClass: this.pickrConfig.appClass,
        components: this.pickrConfig.components,
      }).on('save', (color: any, instance: any) => {
        // 1. MOGISMap 의 LayerCodeObj 찾아서 해당 색깔 값 교체하기
        const colorString = color.toRGBA().toString(0);
        const param = instance.getRoot().root.parentElement.dataset;
        const layerPurposeCategoryKey = param[(KEY.LAYER_PURPOSE_CATEGORY_KEY).toLowerCase()];
        const layerCodeArr = this.INSTANCE_MOGISMAP.layerCodeObject[layerPurposeCategoryKey];

        layerCodeArr.map((layerCodeObj: any) =>
          layerCodeObj[KEY.LAYER_ID] == param[KEY.LAYER_ID]
            ? (layerCodeObj[param['key']] = colorString)
            : layerCodeObj
        );

        const tnode = this.INSTANCE_JS_TREE.get_node('layerid_' + param.id);

        if (tnode && tnode.state.selected === true) {
          this.INSTANCE_JS_TREE.uncheck_node(tnode);
        }

        // 2. 기 발행 레이어 파기
        this.INSTANCE_MOGISMAP.discardLayer(Number(param.id), layerPurposeCategoryKey);

        if (tnode && tnode.state.selected === false) {
          this.INSTANCE_JS_TREE.check_node(tnode);
        }
      });
    });

    document.querySelectorAll<HTMLButtonElement>('button.submitter').forEach((node) => {
      node.addEventListener('click', (e: Event) => {
        const target = e.target as HTMLButtonElement;
        const id = target.dataset.id!;
        const key = target.dataset.layerpurposecategory!;
        const targ = target.dataset.targ!;
        const input = document.querySelector(
          `input[name='${targ}'][data-id='${id}'][data-layerpurposecategory='${key}']`
        ) as HTMLInputElement;
        const valu = input.value;

        this.INSTANCE_MOGISMAP.layerCodeObject[key].map((el: any) =>
          el.id == id ? (el[targ] = valu) : el
        );

        const tnode = this.INSTANCE_JS_TREE.get_node('layerid_' + id);

        if (tnode && tnode.state.selected === true) {
          this.INSTANCE_JS_TREE.uncheck_node(tnode);
        }

        // 2. 기 발행 레이어 파기
        this.INSTANCE_MOGISMAP.discardLayer(Number(id), key);

        if (tnode && tnode.state.selected === false) {
          this.INSTANCE_JS_TREE.check_node(tnode);
        }
      });
    });

    // colorPicker 컨테이너에 이벤트 버블링/캡쳐링 중단
    document.querySelectorAll<HTMLDivElement>('div.colorPickr_container').forEach((node) => {
      node.addEventListener('click', (e) => e.stopPropagation());
    });
    // colorPicker 팔레트에 이벤트 버블링/캡쳐링 중단
    document.querySelectorAll<HTMLDivElement>('div.colorPickr_palette').forEach((node) => {
      node.addEventListener('click', (e) => e.stopPropagation());
    });
  }

  createWrap(array: Record<string, any>[], level?: number): string {
    let html = '';
    level = level || 1;
    array.forEach((layerCode) => {
      const id = layerCode[KEY.LAYER_ID];
      const name = layerCode[KEY.LAYER_NAME];
      const type = layerCode[KEY.LAYER_GEOMETRY_TYPE];
      const isGroup = layerCode[KEY.BOOL_IS_GROUP] || 'N';
      let hasChild = false;

      if (layerCode[KEY.CHILD_MARK] && layerCode[KEY.CHILD_MARK].length > 0) hasChild = true;
      if (level === 1) html += `<ul class="contlist w165">`;
      if (isGroup === 'Y') {
        html += `<li id="${id}">${name}<ul class="contlist w165">`;
      } else {
        html += `<li id="layerid_${id}" data-layerid="${id}" data-type="${type}" class="${type} ${id}">\t${name}`;

        let fontStyler = '';
        if (layerCode[KEY.FONT_STYLE]) {
          fontStyler = `
            <div>폰트스타일</div>
            <div>
              <input type='text' name='${KEY.FONT_STYLE}' required style="font-size: x-small;"
                data-${KEY.LAYER_ID}="${id}" data-${KEY.LAYER_PURPOSE_CATEGORY_KEY}="${this.layerPurposeCategoryKey}"
                value='${layerCode[KEY.FONT_STYLE]}'>
              <button class="submitter" data-${KEY.LAYER_ID}="${id}" data-targ="${KEY.FONT_STYLE}" data-${KEY.LAYER_PURPOSE_CATEGORY_KEY}="${this.layerPurposeCategoryKey}">sbmt</button>
            </div>
            <div>폰트 line색</div>
            <div data-${KEY.LAYER_ID}="${id}"
                 data-${KEY.LAYER_PURPOSE_CATEGORY_KEY}="${this.layerPurposeCategoryKey}"
                 data-key="${KEY.FONT_OUTLINE}">
                <div class="colorPickr" data-rgba="${layerCode[KEY.FONT_OUTLINE]}"></div>
            </div>
            <div>폰트 line두께</div>
            <div>
              <input type="number" name="${KEY.FONT_WIDTH}" required style="width: 34px; font-size: x-small;"
                min="0.1" max="10" value="${layerCode[KEY.FONT_WIDTH]}" step="0.1"
                data-${KEY.LAYER_ID}="${id}"
                data-${KEY.LAYER_PURPOSE_CATEGORY_KEY}="${this.layerPurposeCategoryKey}"/>
              <button class="submitter" data-${KEY.LAYER_ID}="${id}" data-targ="${KEY.FONT_WIDTH}" data-${KEY.LAYER_PURPOSE_CATEGORY_KEY}="${this.layerPurposeCategoryKey}">sbmt</button>
            </div>
            <div>폰트 fill색</div>
            <div data-${KEY.LAYER_ID}="${id}"
                 data-${KEY.LAYER_PURPOSE_CATEGORY_KEY}="${this.layerPurposeCategoryKey}"
                 data-key="${KEY.FONT_FILL}">
                <div class="colorPickr" data-rgba="${layerCode[KEY.FONT_FILL]}"></div>
            </div>
          `;
        }

        if (type === KEY.OL_GEOMETRY_OBJ.LINE) {
          html += `<div class="colorPickr_container"
                    style="display:inline-flex; flex-direction: row; flex-wrap: nowrap; position:relative; top:-5px; left:113px;
                    background-color: #00000091;align-items: center;">
                    <div>선 색</div>
                    <div data-${KEY.LAYER_ID}="${id}"
                         data-${KEY.LAYER_PURPOSE_CATEGORY_KEY}="${this.layerPurposeCategoryKey}"
                         data-key="${KEY.COLOR_LINE}">
                      <div class="colorPickr" data-rgba="${layerCode[KEY.COLOR_LINE]}"></div>
                    </div>
                    <div>선두께</div>
                    <div>
                      <input type="number" name="lineWidth" required style="width: 34px; font-size: x-small;"
                        min="0.1" max="10" value="${layerCode[KEY.LINE_WIDTH]}" step="0.1"
                        data-${KEY.LAYER_ID}="${id}"
                        data-${KEY.LAYER_PURPOSE_CATEGORY_KEY}="${this.layerPurposeCategoryKey}" />
                      <button class="submitter" data-${KEY.LAYER_ID}="${id}" data-targ="${KEY.LINE_WIDTH}" data-${KEY.LAYER_PURPOSE_CATEGORY_KEY}="${this.layerPurposeCategoryKey}">sbmt</button>
                    </div>
                    ${fontStyler}
                  </div>`;
        } else if (type === KEY.OL_GEOMETRY_OBJ.POLYGON) {
          html += `<div class="colorPickr_container"
                    style="display:inline-flex; flex-direction: row; flex-wrap: nowrap; position:relative; top:-5px; left:113px;
                    background-color: #00000091;align-items: center;">
                    <div>선 색</div>
                    <div data-${KEY.LAYER_ID}="${id}"
                         data-${KEY.LAYER_PURPOSE_CATEGORY_KEY}="${this.layerPurposeCategoryKey}"
                         data-key="${KEY.COLOR_LINE}">
                      <div class="colorPickr" data-rgba="${layerCode[KEY.COLOR_LINE]}"></div>
                    </div>
                    <div>선두께</div>
                    <div>
                      <input type="number" name="lineWidth" required style="width: 34px; font-size: x-small;"
                        min="0.1" max="10" value="${layerCode[KEY.LINE_WIDTH]}" step="0.1"
                        data-${KEY.LAYER_ID}="${id}"
                        data-${KEY.LAYER_PURPOSE_CATEGORY_KEY}="${this.layerPurposeCategoryKey}" />
                      <button class="submitter" data-${KEY.LAYER_ID}="${id}" data-targ="${KEY.LINE_WIDTH}" data-${KEY.LAYER_PURPOSE_CATEGORY_KEY}="${this.layerPurposeCategoryKey}">sbmt</button>
                    </div>
                    <div>면 색</div>
                    <div data-${KEY.LAYER_ID}="${id}"
                         data-${KEY.LAYER_PURPOSE_CATEGORY_KEY}="${this.layerPurposeCategoryKey}"
                         data-key="${KEY.COLOR_FILL}">
                      <div class="colorPickr" data-rgba="${layerCode[KEY.COLOR_FILL]}"></div>
                    </div>
                    ${fontStyler}
                  </div>`;
        } else {
          if (fontStyler) {
            html += `
              <div class="colorPickr_container"
                style="display:inline-flex; flex-direction: row; flex-wrap: nowrap; position:relative; top:-5px; left:113px;
                background-color: #00000091;align-items: center;">
                ${fontStyler}
              </div>
            `;
          }
        }
        html += `<label class="switch">
              <input type="checkbox" value="on/off" id="layerid_${id}_check">
              <span class="slider round"></span>
            </label>
          </li>`;
      }
      if (hasChild) {
        level!++;
        html += this.createWrap(layerCode[KEY.CHILD_MARK], level);
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
