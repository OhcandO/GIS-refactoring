import * as KEY from '../common/keyMap';
import Pickr from '@simonwep/pickr';
import { LayerTree } from './LayerTree';
import { CheckboxTree } from './CheckboxTree';
import type { ColorPickrConfig, ColorPropertyDef } from '../types';
import { DEFAULT_PICKR_CONFIG, DEFAULT_COLOR_PROPERTIES } from '../types';
import type { GeometryType } from '../types/enums';

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

  /** 지오메트리 타입별 색상 속성 매핑 */
  private colorProperties: Record<string, ColorPropertyDef[]>;

  constructor(
    tree_div_id: string,
    pickrConfig?: ColorPickrConfig,
    colorProperties?: Record<string, ColorPropertyDef[]>,
  ) {
    super(tree_div_id);
    this.pickrConfig = { ...DEFAULT_PICKR_CONFIG, ...pickrConfig };
    this.colorProperties = colorProperties ?? DEFAULT_COLOR_PROPERTIES;
  }

  /**
   * 트리 생성
   */
  createTree(treeList: Record<string, any>[]): void {
    this.createTreeDiv();

    const wrap = this.createWrap(treeList);
    const container = document.getElementById(this.TREE_DIV_ID)!;
    const tree = new CheckboxTree(container);
    tree.init(wrap);
    this.INSTANCE_JS_TREE = tree;

    this.initPickrInstances();
    this.initSubmitButtons();
    this.stopEventPropagation();
  }

  /**
   * colorPickr 인스턴스 생성 및 이벤트 바인딩
   */
  private initPickrInstances(): void {
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
        const colorString = color.toRGBA().toString(0);
        const param = instance.getRoot().root.parentElement.dataset;
        const categoryKey = param[(KEY.LAYER_PURPOSE_CATEGORY_KEY).toLowerCase()];
        const layerCodeArr = this.INSTANCE_MOGISMAP.layerCodeObject[categoryKey];

        layerCodeArr.map((obj: any) =>
          obj[KEY.LAYER_ID] == param[KEY.LAYER_ID]
            ? (obj[param['key']] = colorString)
            : obj
        );

        this.refreshLayerNode(param.id, categoryKey);
      });
    });
  }

  /**
   * submit 버튼 이벤트 바인딩
   */
  private initSubmitButtons(): void {
    document.querySelectorAll<HTMLButtonElement>('button.submitter').forEach((node) => {
      node.addEventListener('click', (e: Event) => {
        const target = e.target as HTMLButtonElement;
        const id = target.dataset.id!;
        const key = target.dataset.layerpurposecategory!;
        const targ = target.dataset.targ!;
        const input = document.querySelector(
          `input[name='${targ}'][data-id='${id}'][data-layerpurposecategory='${key}']`
        ) as HTMLInputElement;

        this.INSTANCE_MOGISMAP.layerCodeObject[key].map((el: any) =>
          el.id == id ? (el[targ] = input.value) : el
        );

        this.refreshLayerNode(id, key);
      });
    });
  }

  /**
   * 레이어 노드를 uncheck → 파기 → recheck 하여 갱신
   */
  private refreshLayerNode(layerId: string, categoryKey: string): void {
    const tnode = this.INSTANCE_JS_TREE.get_node('layerid_' + layerId);

    if (tnode && tnode.state.selected === true) {
      this.INSTANCE_JS_TREE.uncheck_node(tnode);
    }

    this.INSTANCE_MOGISMAP.discardLayer(Number(layerId), categoryKey);

    if (tnode && tnode.state.selected === false) {
      this.INSTANCE_JS_TREE.check_node(tnode);
    }
  }

  /**
   * colorPicker 관련 요소들의 이벤트 버블링 차단
   */
  private stopEventPropagation(): void {
    const selectors = ['div.colorPickr_container', 'div.colorPickr_palette'];
    selectors.forEach((sel) => {
      document.querySelectorAll<HTMLDivElement>(sel).forEach((node) => {
        node.addEventListener('click', (e) => e.stopPropagation());
      });
    });
  }

  /**
   * 개별 레이어 노드의 색상/수치 편집 UI HTML 생성
   */
  private buildColorEditorHtml(
    layerCode: Record<string, any>,
    id: number | string,
    geomType: string,
  ): string {
    // 폰트 스타일 편집 UI
    const fontStyler = layerCode[KEY.FONT_STYLE]
      ? this.buildFontStylerHtml(layerCode, id)
      : '';

    // 지오메트리별 색상 속성 조회
    const colorProps = this.colorProperties[geomType] ?? [];

    if (colorProps.length === 0 && !fontStyler) return '';

    let inner = '';

    // 색상 피커들 생성
    for (const prop of colorProps) {
      inner += `
        <div>${prop.label}</div>
        <div data-${KEY.LAYER_ID}="${id}"
             data-${KEY.LAYER_PURPOSE_CATEGORY_KEY}="${this.layerPurposeCategoryKey}"
             data-key="${prop.key}">
          <div class="colorPickr" data-rgba="${layerCode[prop.key]}"></div>
        </div>`;
    }

    // 선 두께 입력 (선 색이 있는 경우에만)
    if (colorProps.some((p) => p.key === KEY.COLOR_LINE)) {
      inner += `
        <div>선두께</div>
        <div>
          <input type="number" name="lineWidth" required style="width: 34px; font-size: x-small;"
            min="0.1" max="10" value="${layerCode[KEY.LINE_WIDTH]}" step="0.1"
            data-${KEY.LAYER_ID}="${id}"
            data-${KEY.LAYER_PURPOSE_CATEGORY_KEY}="${this.layerPurposeCategoryKey}" />
          <button class="submitter" data-${KEY.LAYER_ID}="${id}" data-targ="${KEY.LINE_WIDTH}" data-${KEY.LAYER_PURPOSE_CATEGORY_KEY}="${this.layerPurposeCategoryKey}">sbmt</button>
        </div>`;
    }

    inner += fontStyler;

    return `<div class="colorPickr_container"
              style="display:inline-flex; flex-direction: row; flex-wrap: nowrap; position:relative; top:-5px; left:113px;
              background-color: #00000091; align-items: center;">
              ${inner}
            </div>`;
  }

  /**
   * 폰트 스타일 편집 UI HTML 생성
   */
  private buildFontStylerHtml(layerCode: Record<string, any>, id: number | string): string {
    return `
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
      </div>`;
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
        html += this.buildColorEditorHtml(layerCode, id, type);
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
