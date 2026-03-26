import * as KEY from '../common/keyMap';
import { LayerTree } from './LayerTree';

interface LegendHtmlEntry {
  id: number;
  value: string;
}

interface LegendModelInfoEntry {
  id: number;
  modelName: string;
  modelDate: string;
}

/**
 * MOGISMap 을 인자로 받아, 해당 Map 객체의 레이어를 관장하는
 * 트리 구조체를 생성함
 * 지도 객체 하나에 여러개의 layerTree 객체 생성될 수 있음
 * @class LayerTreeFixedScale
 * @author jhoh
 */
export class LayerTreeFixedScale extends LayerTree {
  /** 스케일 정보가 들어간 legend 용 html string */
  legendHtmlStrArr: LegendHtmlEntry[] = [];

  legendModelInfoArr: LegendModelInfoEntry[] = [];

  /** 개별 레이어트리 범례의 모델정보 입력(외부용 인터페이스)
   * @param layer_id 레이어 고유 아이디
   * @param legendModelInfo 해당 레이어 정보
   */
  setLegendModelInfo(layer_id: number, legendModelInfo: { modelName: string; modelDate: string }): void {
    this.legendModelInfoArr.push({
      id: layer_id,
      modelName: legendModelInfo.modelName,
      modelDate: legendModelInfo.modelDate,
    });
  }

  /** 개별 레이어트리 범례 지정(외부용 인터페이스)
   * @param layer_id 레이어 고유 아이디
   * @param legendObjArr 해당레이어 범례 정보
   * @param geometryType 레이어 지오메트리 속성
   * @param legendObjKey 개별 범례정보 주요 식별자
   */
  setLegendHtmlStr(
    layer_id: number,
    legendObjArr: Record<string, any>[],
    geometryType: string = 'LineString',
    legendObjKey: string
  ): void {
    let htmlStr = '';
    legendObjArr.forEach((legendObj, idx, arr) => {
      const imgSrc = this.makeLegendSrcFromGeom(geometryType, legendObj);
      if (idx < arr.length - 1) {
        htmlStr += `
          <li>
            <img src="${imgSrc}" style="width:16px;" alt="범위 ${legendObj[legendObjKey]} 아이콘"/>
            <label><input type="text" readonly value="${legendObj[legendObjKey]}">이하</label>
          </li>
        `;
      } else {
        htmlStr += `
          <li>
            <img src="${imgSrc}" style="width:16px;" alt="범위 ${legendObj[legendObjKey]} 아이콘"/>
            <label><input type="text" readonly value="${arr[arr.length - 2][legendObjKey]}">초과</label>
          </li>
        `;
      }
    });

    this.legendHtmlStrArr.push({
      id: layer_id,
      value: htmlStr,
    });
  }

  /**
   * (임시)
   * 물흐름방향 전용
   */
  setLegendFlowDirectionHtmlStr(layer_id: number, geometryType: string = 'Point'): void {
    let htmlStr = '';
    const layerCodeObj = this.layerCodeArr.find((el: any) => el[KEY.LAYER_ID] == layer_id) as any;
    const imgSrc = this.makeLegendSrc(layerCodeObj);
    htmlStr += `
      <li>
        <span>
          <img src="${imgSrc}" style="width:40px;" alt="물흐름방향 아이콘"/>
          ${layerCodeObj[KEY.LAYER_NAME]}
        </span>
      </li>
    `;

    this.legendHtmlStrArr.push({
      id: layer_id,
      value: htmlStr,
    });
  }

  /**
   * 이미지 정보 반환
   */
  private makeLegendSrcFromGeom(geomType: string, AlegendObj: Record<string, any>): string {
    const imageSource = this.makeLegendImageFromGeom(geomType, AlegendObj);
    return imageSource.src;
  }

  /**
   * 이미지 생성
   */
  private makeLegendImageFromGeom(geomType: string, AlegendObj: Record<string, any>): HTMLImageElement {
    const image = document.createElement('img');
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d')!;
    ctx.beginPath();

    if (geomType === KEY.OL_GEOMETRY_OBJ.POLYGON) {
      ctx.moveTo(1, 1);
      ctx.lineTo(15, 1);
      ctx.lineTo(15, 15);
      ctx.lineTo(1, 15);
      ctx.lineTo(1, 1);
    } else if (geomType === KEY.OL_GEOMETRY_OBJ.LINE) {
      ctx.moveTo(1, 15);
      ctx.lineTo(5, 1);
      ctx.lineTo(9, 15);
      ctx.lineTo(15, 1);
    } else if (geomType === KEY.OL_GEOMETRY_OBJ.POINT) {
      ctx.arc(8, 8, 6, 0, 2 * Math.PI, false);
    } else {
      ctx.moveTo(1, 1);
      ctx.lineTo(15, 1);
      ctx.lineTo(15, 15);
      ctx.lineTo(1, 15);
      ctx.lineTo(1, 1);
    }

    if (geomType === KEY.OL_GEOMETRY_OBJ.POLYGON || geomType === KEY.OL_GEOMETRY_OBJ.POINT) {
      ctx.fillStyle = AlegendObj.color;
      ctx.fill();
    }

    if (AlegendObj[KEY.LINE_WIDTH]) {
      ctx.lineWidth = AlegendObj[KEY.LINE_WIDTH];
      ctx.strokeStyle = AlegendObj.color;
      ctx.stroke();
    }

    image.src = canvas.toDataURL('image/png');
    return image;
  }

  /**
   * 체크박스 선택시 이벤트
   */
  checkEventListener(): void {
    if ((this as any)._fixedScaleInitialized) return;
    (this as any)._fixedScaleInitialized = true;

    // 프로덕션에서 체크버튼 클릭시 메뉴 꺼지지 않게 조치
    document.getElementById(this.TREE_DIV_ID)!.addEventListener('click', (e1) => {
      e1.stopPropagation();
    });

    const me = this;

    this.INSTANCE_JS_TREE.on('changed', function (_e, data) {
      if (me.customCallback instanceof Function && me.callbackTraffic) {
        me.customCallback(_e, data);
      }
      if (data.action === 'ready') return;

      let visible = false;
      if (data.action === 'select_node') visible = true;

      const layerCode_id_arr: string[] = [];
      if (data.node && data.node.children.length > 0) {
        for (const nodeId of data.node.children_d) {
          pushLayerList(nodeId, layerCode_id_arr);
        }
      } else {
        const nodeId = data.node.id;
        if (nodeId) pushLayerList(nodeId, layerCode_id_arr);
      }
      if (layerCode_id_arr.length > 0) {
        // MOSubscriber (Legend 객체와 MOGISMap 객체)에 전달할 내용 구성
        me.ctrlLayerDataArr = [];
        const tempArr = layerCode_id_arr.map((id) => {
          // 체크박스 상태 동기화
          const checkbox = document.querySelector(`input#layerid_${id}_check`) as HTMLInputElement | null;
          if (checkbox) checkbox.checked = visible;
          return {
            id: id,
            boolVisible: visible,
            layerPurposeCategory: me.layerPurposeCategoryKey,
            legendHtmlString: me.legendHtmlStrArr.find((el) => el.id == (id as any)),
            layerCode: getLayerCode(id),
            legendModelInfo: me.legendModelInfoArr.find((el) => el.id == (id as any)),
          } as any;
        });
        me.ctrlLayerDataArr = tempArr;
        me.notify();
      }
    });

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
      legendModelInfo: {},
      layerCode: [],
    },
  ];

  /** MOSubscriber 들이 가져가는 데이터 */
  get PublisherData(): any[] {
    return this.ctrlLayerDataArr;
  }
}
