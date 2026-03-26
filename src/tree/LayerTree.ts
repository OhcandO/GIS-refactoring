import * as KEY from '../common/keyMap';
import { MOPublisher } from '../abstract/Publisher';
import { MOSubscriber } from '../abstract/Subscriber';
import { Spinner } from 'spin.js';
import { CheckboxTree } from './CheckboxTree';
import type { LayerCodeObj, LegendCodeObj } from '../types';

// 런타임 환경에서 제공되는 전역 변수
declare const ctxPath: string;

// MOGISMap, MOLegend 타입 (순환참조 방지용 인터페이스)
interface MOGISMapLike extends MOSubscriber {
  layerCodeObject: Record<string, LayerCodeObj[]>;
  default_mapSpec: { target: string };
  map: any;
  view: any;
  discardLayer(id: number, key: string): void;
}

interface MOLegendLike extends MOSubscriber {}

/**
 * MOGISMap 을 인자로 받아, 해당 Map 객체의 레이어를 관장하는
 * 트리 구조체를 생성함
 * 지도 객체 하나에 여러개의 layerTree 객체 생성될 수 있음
 * @class LayerTree
 * @author jhoh
 */
export class LayerTree extends MOPublisher {
  defaults = {
    contextPath: '',
    iconPath: `${ctxPath}${KEY.ICON_PATH}`,
  };

  /**트리 객체가 생성될 곳의 DIV id */
  TREE_DIV_ID: string;

  /**트리 객체 자체의 ID */
  TREE_ELEMENT = {
    id: undefined as string | undefined,
    style: `position: absolute;
            top: 20px; left: 0;
            margin-left: 0px;`,
    getHTML(): string {
      return `<div id="${this.id}" style="${this.style}"></div>`;
    },
  };

  /** CheckboxTree 객체 (jsTree 대체) */
  INSTANCE_JS_TREE!: CheckboxTree;

  /** MOGISMap 객체 */
  INSTANCE_MOGISMAP!: MOGISMapLike;

  /** 레이어코드의 목적을 나타내는 코드 */
  layerPurposeCategoryKey!: string;

  /**본 레이어트리에서 관리하는
   * 소스+레이어 정보 레이어 코드 리스트 */
  layerCodeArr!: LayerCodeObj[];

  /** 레이어코드 상 최상위 부모의 코드(layerStructure 구성시 사용) */
  most_upper_id: string | number | undefined;

  /** 레이어 코드 리스트를 계층구조로 만든 것 */
  layerStructure!: Record<string, any>[];

  /** checkEventListener 중복 호출 방지 플래그 */
  private initialized = false;

  /**
   * MOGISMap 의 레이어 관장하는 Tree 생성
   * @param tree_div_id 레이어트리 객체가 생성될 div id
   */
  constructor(tree_div_id: string) {
    super(tree_div_id);
    if (tree_div_id) {
      this.TREE_DIV_ID = tree_div_id;
      this.TREE_ELEMENT.id = `${this.TREE_DIV_ID}-layerTree`;
    } else {
      throw new Error(`layerTree 객체 생성될 DIV 아이디 입력되어야 함`);
    }
  }

  // --- MOPublisher 함수 Overriding ---

  /**
   * @param moSubscriber 구독자 역할 객체 (MOGISMap, 범례)
   * @param layerObjCategoryKey MOGISMap 에 이미 등록된 목적별 레이어 코드 그룹 식별자
   * @param most_upper_id 레이어코드 상 최상위 코드
   */
  regist(moSubscriber: MOSubscriber, layerObjCategoryKey?: string, most_upper_id?: string | number): void {
    // MOGISMap 판별: layerCodeObject 속성 보유 여부로 판단 (순환참조 방지)
    if ('layerCodeObject' in moSubscriber) {
      this.INSTANCE_MOGISMAP = moSubscriber as MOGISMapLike;
      super.regist(moSubscriber);
      if (layerObjCategoryKey) {
        this.assignMapAndLayer(layerObjCategoryKey, most_upper_id);
      }
    } else {
      super.regist(moSubscriber);
    }
  }

  /**
   * Openlayers 레이어 관장 Tree 생성을 위한 기초정보 등록
   * @param layerObjCategoryKey MOGISMap 에 이미 등록된 목적별 레이어 코드 그룹 식별자
   * @param most_upper_id 레이어코드 상 최상위 코드
   */
  assignMapAndLayer(layerObjCategoryKey: string, most_upper_id?: string | number): void {
    if (most_upper_id) this.most_upper_id = most_upper_id;

    // 레이어 코드 카테고리 중 하나만 이 layerTree 객체에서 관장함
    const validKeys = Object.values(KEY.LAYER_PURPOSE_CATEGORY).map((e: any) => e[0]);
    if (
      validKeys.includes(layerObjCategoryKey) &&
      this.INSTANCE_MOGISMAP.layerCodeObject[layerObjCategoryKey]
    ) {
      this.layerPurposeCategoryKey = layerObjCategoryKey;
      this.setLayerCodeArr(
        this.INSTANCE_MOGISMAP.layerCodeObject[layerObjCategoryKey]
      );
    }

    // layerTree 화면에 표현
    this.activate();
  }

  /**
   * 정렬된 레이어 코드 JSON 을 LayerTree 객체에 등록함
   */
  protected setLayerCodeArr(
    layerCodeArr: LayerCodeObj[],
    target_id: string = KEY.LAYER_ID,
    parent_id: string = KEY.PARENT_ID,
    child_mark: string = KEY.CHILD_MARK
  ): void {
    if (layerCodeArr instanceof Array) {
      this.layerCodeArr = layerCodeArr;
      try {
        this.layerStructure = KEY.jsonNestor(
          this.layerCodeArr as unknown as Record<string, any>[],
          target_id,
          parent_id,
          child_mark,
          this.most_upper_id
        );
      } catch (e) {
        console.error(e);
      }
    } else {
      console.error(`treeLayer 객체에 설정할 JSON 객체가 적합하지 않음`);
      throw new Error(`treeLayer 객체에 설정할 JSON 객체가 적합하지 않음`);
    }
  }

  /**
   * 실질 TREE 객체 생성과정
   */
  protected activate(): void {
    if (!(this.layerCodeArr && this.layerCodeArr.length > 0)) {
      try {
        this.setLayerCodeArr(
          this.INSTANCE_MOGISMAP.layerCodeObject[this.layerPurposeCategoryKey]
        );
      } catch (e) {
        console.log(`layerCodeArr (JSON) 이 등록되어야 함`);
        console.error(e);
      }
    }
    this.createTree(this.layerStructure);
    this.checkEventListener();
    this.showInitialLayers(this.layerStructure);
  }

  /**
   * 트리 생성
   */
  createTree(treeList: Record<string, any>[]): void {
    // 1. map div 에 tree용 영역 생성
    this.createTreeDiv();

    // 2. tree 구조체 생성
    const wrap = this.createWrap(treeList);
    const container = document.getElementById(this.TREE_DIV_ID)!;
    const tree = new CheckboxTree(container);
    tree.init(wrap);
    this.INSTANCE_JS_TREE = tree;
  }

  createTreeDiv(): void {
    const treeDiv = document.querySelector(`#${this.TREE_DIV_ID}`);
    if (treeDiv instanceof HTMLDivElement) {
      treeDiv.insertAdjacentHTML('beforeend', this.TREE_ELEMENT.getHTML());
    } else {
      throw new Error(
        `layerTree 객체위한 DIV가 생성되지 않음: div id=${this.TREE_DIV_ID}`
      );
    }
  }

  /**
   * 트리 html 생성 리턴
   */
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

  /**
   * 초기 선택 노드 셋팅
   */
  showInitialLayers(structuredLayerCode: Record<string, any>[]): void {
    if (structuredLayerCode instanceof Array) {
      for (const layerCode of structuredLayerCode) {
        const id = layerCode[KEY.LAYER_ID];
        const visible = layerCode[KEY.BOOL_SHOW_INITIAL] || 'N';

        if (layerCode[KEY.CHILD_MARK] && layerCode[KEY.CHILD_MARK].length > 0) {
          this.showInitialLayers(layerCode[KEY.CHILD_MARK]);
        }

        if (visible === 'Y') {
          const tnode = this.INSTANCE_JS_TREE.get_node('layerid_' + id);
          if (!tnode) continue;
          if (tnode.state.selected === false) {
            this.INSTANCE_JS_TREE.check_node(tnode);
          }
        }
      }
    }
  }

  /** layerTree 체크 이벤트에 추가할 사용자 콜백 */
  customCallback: Function | undefined = undefined;

  /** layerTree callback 함수 설정 */
  registEventCallback(fu: Function): void {
    if (fu instanceof Function) {
      this.customCallback = fu;
    }
  }

  /** customCallback 을 작동할지 여부 */
  callbackTraffic = true;

  /**
   * 체크박스 선택시 이벤트
   */
  checkEventListener(): void {
    if (this.initialized) return;
    this.initialized = true;

    // 프로덕션에서 체크버튼 클릭시 메뉴 꺼지지 않게 조치
    document.getElementById(this.TREE_DIV_ID)!.addEventListener('click', (e1) => {
      e1.stopPropagation();
    });

    const me = this;

    this.INSTANCE_JS_TREE.on('changed', function (_e, data) {
      if (data.action === 'ready') return;

      let visible = false;
      if (data.action === 'select_node') visible = true;

      const layerCode_id_arr: string[] = [];
      if (data.node.children.length > 0) {
        for (const nodeId of data.node.children_d) {
          pushLayerList(nodeId, layerCode_id_arr);
        }
      } else {
        const nodeId = data.node.id;
        pushLayerList(nodeId, layerCode_id_arr);
      }
      if (layerCode_id_arr.length > 0) {
        // MOSubscriber (Legend 객체와 MOGISMap 객체)에 전달할 내용 구성
        me.ctrlLayerDataArr = [];
        const tempArr = layerCode_id_arr.map((id) => {
          // 체크박스 상태 동기화
          const checkbox = document.querySelector(`input#layerid_${id}_check`) as HTMLInputElement | null;
          if (checkbox) checkbox.checked = visible;
          const htmlStr = `<span>${makeHtmlStr(id)}</span>`;
          return {
            id: id as any,
            boolVisible: visible,
            layerPurposeCategory: me.layerPurposeCategoryKey,
            legendHtmlString: htmlStr,
            layerCode: getLayerCode(id),
          } as any;
        });
        me.ctrlLayerDataArr = tempArr;
        me.notify();
      }

      if (me.customCallback instanceof Function && me.callbackTraffic) me.customCallback();
    });

    function makeHtmlStr(layer_id: string): string {
      const layerCode = getLayerCode(layer_id);
      if (!layerCode) return '';
      const imgSrc = me.makeLegendSrc(layerCode);
      return `<img src="${imgSrc}" style="width:16px;" alt="${layerCode[KEY.LAYER_NAME]} 아이콘"/>&nbsp;&nbsp;${layerCode[KEY.LAYER_NAME]}`;
    }

    function getLayerCode(layer_id: string): any {
      return me.layerCodeArr.find((el: any) => el[KEY.LAYER_ID] == layer_id);
    }

    function pushLayerList(nodeId: string, layerList: string[]): void {
      const node = me.INSTANCE_JS_TREE.get_node(nodeId);
      if (!node) return;
      if (nodeId.indexOf(KEY.LAYER_ID) > -1) {
        const layerid = node.data.layerid;
        if (layerid) layerList.push(layerid);
      }
    }
  }

  // --- MOPublisher 함수등록 ---

  /** publisherData로서 MOSubscriber 에게 전달할 정보 객체 */
  ctrlLayerDataArr: any[] = [
    {
      id: undefined,
      boolVisible: true,
      layerPurposeCategory: this.layerPurposeCategoryKey,
      legendHtmlString: '',
      layerCode: [],
    },
  ];

  /** MOSubscriber 들이 가져가는 데이터 */
  get PublisherData(): any[] {
    return this.ctrlLayerDataArr;
  }

  /**
   * 이미지 정보
   */
  makeLegendSrc(layerInfoElem: Record<string, any>): string {
    const iconPath = this.defaults.iconPath;
    if (layerInfoElem[KEY.ICON_NAME]) {
      return iconPath + layerInfoElem[KEY.ICON_NAME];
    } else {
      const ss = this.makeLegendImage(layerInfoElem);
      return ss.src;
    }
  }

  /**
   * 이미지 생성
   */
  makeLegendImage(layerinfo: Record<string, any>): HTMLImageElement {
    const image = document.createElement('img');
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d')!;
    ctx.beginPath();

    if (layerinfo[KEY.LAYER_GEOMETRY_TYPE] === KEY.OL_GEOMETRY_OBJ.POLYGON) {
      ctx.moveTo(1, 1);
      ctx.lineTo(15, 1);
      ctx.lineTo(15, 15);
      ctx.lineTo(1, 15);
      ctx.lineTo(1, 1);
    } else if (layerinfo[KEY.LAYER_GEOMETRY_TYPE] === KEY.OL_GEOMETRY_OBJ.LINE) {
      ctx.moveTo(1, 15);
      ctx.lineTo(5, 1);
      ctx.lineTo(9, 15);
      ctx.lineTo(15, 1);
    } else {
      ctx.moveTo(1, 1);
      ctx.lineTo(15, 1);
      ctx.lineTo(15, 15);
      ctx.lineTo(1, 15);
      ctx.lineTo(1, 1);
    }

    if (layerinfo[KEY.LAYER_GEOMETRY_TYPE] === KEY.OL_GEOMETRY_OBJ.POLYGON) {
      ctx.fillStyle = layerinfo[KEY.COLOR_FILL];
      ctx.fill();
    }

    if (layerinfo[KEY.LINE_WIDTH]) {
      ctx.lineWidth = layerinfo[KEY.LINE_WIDTH];
      ctx.strokeStyle = layerinfo[KEY.COLOR_LINE];
      ctx.stroke();
    }

    image.src = canvas.toDataURL('image/png');
    return image;
  }

  // ----------- 외부용 인터페이스 ----------------

  /**
   * 레이어 구분자로 연관 레이어들 숨기기
   * @param typeName 레이어 구분자 (geoserver ST.) e.g. waternet:WTL_BLSM_AS
   */
  hideLayerByTypename(typeName: string): void {
    const tempTreeIdArr = this.getTreeIdArr(typeName);
    if (tempTreeIdArr.length > 0) {
      tempTreeIdArr.forEach((treeId) => {
        this.INSTANCE_JS_TREE.deselect_node(treeId);
      });
    }
  }

  showALayer(typeName: string, ftrIdn?: string): void {
    if (ftrIdn) {
      const tempTreeIdArr = this.getTreeIdArr(typeName, ftrIdn);
      if (tempTreeIdArr.length > 0) {
        tempTreeIdArr.forEach((treeId) => {
          this.INSTANCE_JS_TREE.select_node(treeId);
        });
      }
    } else {
      console.log(`gis_tree.showALayer() | 관리번호 (ftrIdn) 미지정`);
    }
  }

  protected getTreeIdArr(typeName: string, ftrIdn: string = ''): string[] {
    const codeObjArr = structuredClone(
      this.layerCodeArr.filter(
        (layCD: any) =>
          layCD[KEY.TYPE_NAME] === typeName &&
          layCD[KEY.BOOL_IS_GROUP] !== 'Y'
      )
    );
    if (codeObjArr && codeObjArr.length > 0)
      return codeObjArr.map((codeObj: any) => 'layerid_' + codeObj[KEY.LAYER_ID]);
    else return [];
  }

  /**
   * LayerCodeObj 의 PK 인 LayerId 를 이용해 해당 레이어만 활성화한 뒤,
   * 정상적으로 지도에 렌더링된 후 Promise chain 을 반환하도록 함
   */
  showLayerWithLayerId(layerId: string | number): Promise<void> {
    const default_spinner = {
      lines: 15, length: 38, width: 12, radius: 38, scale: 1,
      corners: 1, speed: 1, animation: 'spinner-line-fade-more',
      color: '#ffffff', fadeColor: 'transparent', shadow: 'grey 3px 4px 8px 1px',
    };

    const spin = new Spinner(default_spinner);
    const target_spin = document.querySelector(
      `#${this.INSTANCE_MOGISMAP.default_mapSpec.target}`
    ) as HTMLElement;

    // layerId 에 해당하는 layerCodeObject
    const theLayerCode = this.layerCodeArr.find((el: any) => el[KEY.LAYER_ID] == layerId) as any;

    return new Promise<void>((res) => {
      // 1-1. 이미 선택된 상태
      if (this.INSTANCE_JS_TREE.is_selected(`layerid_${layerId}`)) {
        res();
      // 1-2. 아직 선택 안되었을 때
      } else {
        const layerMinZoom = theLayerCode?.[KEY.MIN_ZOOM] ?? 9;
        const theView = this.INSTANCE_MOGISMAP.view;
        // 레이어는 minZoom 보다 낮은 줌 상태에서 발행되지 않는다.
        if (theView.getZoom() <= layerMinZoom) {
          theView.setZoom(layerMinZoom + 0.2);
        }

        this.INSTANCE_MOGISMAP.map.once('rendercomplete', () => {
          spin.stop();
          res();
        });

        spin.spin(target_spin);
        this.INSTANCE_JS_TREE.select_node(`layerid_${layerId}`);
      }
    });
  }

  /**
   * 레이어 활성화 안됐을 때 레이어 코드 찾아 노드 선택 이벤트 진행
   */
  showLayerWithTypeName(typeName: string): Promise<void> {
    const me = this;
    let minZoom = 16;
    const default_spinner = {
      lines: 15, length: 38, width: 12, radius: 38, scale: 1,
      corners: 1, speed: 1, animation: 'spinner-line-fade-more',
      color: '#ffffff', fadeColor: 'transparent', shadow: 'grey 3px 4px 8px 1px',
    };

    const spin = new Spinner(default_spinner);
    const target_spin = document.querySelector(
      `#${this.INSTANCE_MOGISMAP.default_mapSpec.target}`
    ) as HTMLElement;

    function findAndSetLayerCodeObjWithTypename(typeName: string): string[] {
      const codeObjArr = getCodeObjArrFromTypeName(typeName);
      if (codeObjArr.length > 0) {
        return codeObjArr.reduce<string[]>(
          (pre, cur: any) => (pre.push('layerid_' + cur.id), pre),
          []
        );
      } else {
        console.error(`codeObj 찾을 수 없음 ${typeName}`);
        throw new Error(`codeObj 없음`);
      }
    }

    function getCodeObjArrFromTypeName(typeName: string): any[] {
      const codeObjArr = structuredClone(
        me.layerCodeArr.filter(
          (layCD: any) =>
            layCD[KEY.TYPE_NAME] === typeName &&
            layCD[KEY.BOOL_IS_GROUP] !== 'Y'
        )
      );

      minZoom = codeObjArr.reduce(
        (pre: number, cur: any) => (cur[KEY.MIN_ZOOM] > pre ? Number(cur[KEY.MIN_ZOOM]) : pre),
        14
      );
      return codeObjArr;
    }

    const isEveryNodeSelected = (treeIdArr: string[]): boolean => {
      return treeIdArr.every((nodeId) => this.INSTANCE_JS_TREE.is_selected(nodeId));
    };

    const tempTreeIdArr = findAndSetLayerCodeObjWithTypename(typeName);
    if (tempTreeIdArr.length === 0) {
      return Promise.reject('시설물 화면에 맞는 레이어 없음. 시설물 테이블명 : ' + typeName);
    }
    return new Promise<void>((reso, _reje) => {
      if (isEveryNodeSelected(tempTreeIdArr)) {
        reso();
      } else {
        this.INSTANCE_MOGISMAP.view.setZoom(minZoom + 0.2);
        this.INSTANCE_MOGISMAP.map.once('rendercomplete', () => {
          spin.stop();
          reso();
        });

        spin.spin(target_spin);
        tempTreeIdArr.forEach((treeId) => {
          this.INSTANCE_JS_TREE.select_node(treeId);
        });
      }
    });
  }

  /**
   * 모든 체크된 항목들을 언체크 해서
   * 레이어가 사라지고, 체크버튼도 off 되게 함
   */
  deselectAll(bool?: boolean): void {
    this.INSTANCE_JS_TREE.get_selected().forEach((id) =>
      this.INSTANCE_JS_TREE.deselect_node(id, bool)
    );
  }
}
