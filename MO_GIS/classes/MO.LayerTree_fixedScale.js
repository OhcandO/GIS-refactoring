import * as KEY from '../common/MO.keyMap.js';
import $ from '../../lib/jquery-3.7.1/jquery-3.7.1_esm.js';
import { LayerTree } from './MO.LayerTree.js';

/**
 * MOGISMap 을 인자로 받아, 해당 Map 객체의 레이어를 관장하는 
 * JSTree 구조체를 생성함
 * 지도 객체 하나에 여러개의 layerTree 객체 생성될 수 있음
 * @requires JQuery1.9+ JStree
 * @class LayerTree
 * @author jhoh
 */
export class LayerTree_fixedScale extends LayerTree {

	/** 스케일 정보가 들어간 legend 용 html string */
	legendHtmlStrArr=[
//		{id:0,
//		value:undefined,}
	];
	
	legendModelInfoArr=[
//		{
//			id:0,
//			modelName:'',
//			modelDate:'',
//		}
	]
	
	
	 /** 개별 레이어트리 범례의 모델정보 입력(외부용 인터페이스)
	 * @param {number} layer_id 레이어 고유 아이디
	 * @param {*} legendModelInfo 해당 레이어 정보
	 * */    
	setLegendModelInfo(layer_id, legendModelInfo){
		this.legendModelInfoArr.push({
			id:layer_id,
			modelName:legendModelInfo.modelName,
			modelDate:legendModelInfo.modelDate,
		});
	}
	
	/*
	 LegendObj(riskmap) =  [
		{no:0, wtqltRisk:8, wtqltCvap:0.2,lowSpfld:1,dtrort:1,wtqltStdrOver:0.2,
		 color:"rgba(0, 0, 255, 1)", lineWidth:5},
		{no:1, wtqltRisk:26,wtqltCvap:0.4,lowSpfld:1.5,dtrort:1.5,wtqltStdrOver:0.4,
		 color:"rgba(0, 255, 255, 1)", lineWidth:5},
		{no:2, wtqltRisk:71,wtqltCvap:0.6,lowSpfld:2,dtrort:2,wtqltStdrOver:0.6,
		 color:"rgba(0, 255, 0, 1)", lineWidth:5},
		{no:3, wtqltRisk:162,wtqltCvap:0.8,lowSpfld:90,dtrort:90,wtqltStdrOver:0.8,
		 color:"rgba(255, 255, 0, 1)", lineWidth:5},
		{no:4, wtqltRisk:999999,wtqltCvap:10.0,lowSpfld:100,dtrort:100,wtqltStdrOver:20,
		 color:"rgba(255, 0, 0, 1)", lineWidth:5},
	]
	 */
	/** 개별 레이어트리 범례 지정(외부용 인터페이스) 
	 * @param {number} layer_id 레이어 고유 아이디
	 * @param {Array} legendObjArr 해당레이어 범례 정보
	 * @param {KEY.OPENLAYERS_GEOMETRY_TYPE|'LineString'} 레이어 지오메트리 속성  
	 * @param {string} legendObjKey 개별 범례정보 주요 식별자
	*/
	setLegendHtmlStr(layer_id, legendObjArr,geometryType='LineString',legendObjKey){
        let htmlStr= '';
        legendObjArr.forEach((legendObj,idx,arr)=>{
	        let imgSrc = this.#makeLegendSrc(geometryType,legendObj);
	        if(idx<arr.length-1){
		        htmlStr += `
		        <li>
		        	<img src="${imgSrc}" style="width:16px;" alt="범위 ${legendObj[legendObjKey]} 아이콘"/>
		        	<label><input type="text" readonly value="${legendObj[legendObjKey]}">이하</label>
		        </li>	
		        `;
			}else{
				htmlStr += `
		        <li>
		        	<img src="${imgSrc}" style="width:16px;" alt="범위 ${legendObj[legendObjKey]} 아이콘"/>
		        	<label><input type="text" readonly value="${arr[arr.length-2][legendObjKey]}">초과</label>
		        </li>	
		        `;
			}
		});

		this.legendHtmlStrArr.push({
			id:layer_id,
			value:htmlStr,
		});
    }
    
    /**
	 * (임시)
	 * 물흐름방향 전용
	 */
    setLegendFlowDirectionHtmlStr(layer_id,geometryType='Point'){
        let htmlStr= '';
        let layerCodeObj = this.layerCodeArr.find(el=>el[KEY.LAYER_ID]==layer_id);
        let imgSrc = this.makeLegendSrc(layerCodeObj);
        htmlStr += `
        <li>
        	<span>
	        	<img src="${imgSrc}" style="width:40px;" alt="물흐름방향 아이콘"/>
	        	${layerCodeObj[KEY.LAYER_NAME]}
        	</span>        	
        </li>	
        `;

		this.legendHtmlStrArr.push({
			id:layer_id,
			value:htmlStr,
		});
    }   
	
	/**
     * 이미지 정보 반환
     */
    #makeLegendSrc(geomType,AlegendObj) {
        let imageSource = this.#makeLegendImage(geomType,AlegendObj);
        return imageSource.src;
    }

    /**
     * 이미지 생성
     */
    #makeLegendImage(geomType,AlegendObj) {
        let image = document.createElement("img");
        let canvas = document.createElement("canvas");
        canvas.width = 16;
        canvas.height = 16;
        let ctx = canvas.getContext("2d");
        ctx.beginPath();

        if (geomType == KEY.OL_GEOMETRY_OBJ.POLYGON) {
            ctx.moveTo(1, 1);
            ctx.lineTo(15, 1);
            ctx.lineTo(15, 15);
            ctx.lineTo(1, 15);
            ctx.lineTo(1, 1);
        } else if (geomType == KEY.OL_GEOMETRY_OBJ.LINE) {
            ctx.moveTo(1, 15);
            ctx.lineTo(5, 1);
            ctx.lineTo(9, 15);
            ctx.lineTo(15, 1);
        } else if (geomType == KEY.OL_GEOMETRY_OBJ.POINT) {
			ctx.arc(8,8,6,0,2*Math.PI,false);    
        } else {
            ctx.moveTo(1, 1);
            ctx.lineTo(15, 1);
            ctx.lineTo(15, 15);
            ctx.lineTo(1, 15);
            ctx.lineTo(1, 1);
        }

        if (geomType == KEY.OL_GEOMETRY_OBJ.POLYGON || geomType == KEY.OL_GEOMETRY_OBJ.POINT) {
            ctx.fillStyle = AlegendObj.color;
            ctx.fill();
        }

        if (AlegendObj[KEY.LINE_WIDTH]) {
            ctx.lineWidth = AlegendObj[KEY.LINE_WIDTH];
            ctx.strokeStyle = AlegendObj.color;
            ctx.stroke();
        }

        image.src = canvas.toDataURL("image/png");
        return image;
    }
	
	
    /**
     * 체크박스 선택시 이벤트
     */
    checkEventListener() {
    	this.checkEventListener= ()=>{}
    	//mainMap.jsp 프로덕션에서 체크버튼 클릭시 메뉴 꺼지지 않게 조치
        document.getElementById(this.TREE_DIV_ID).addEventListener('click',e1=>{
			e1.stopPropagation();
		});
		
        let me = this;
        let nodeId;
        $(`#${this.TREE_DIV_ID}`).bind("changed.jstree", function (e, data) {
            if (data.action === "ready") return;
            
//			let negativeArr = me.INSTANCE_JS_TREE.get_json().filter(el=>el.id!=data.node.id).map(e=>e.data.layerid);
			
            let visible = false;
            if (data.action === "select_node") visible = true;

            let layerCode_id_arr = [];
            if (data.node?.children.length > 0) {
                for (let id in data.node.children_d) {
                    nodeId = data.node.children_d[id];
                    pushLayerList(nodeId, layerCode_id_arr);
                }
            } else {
                nodeId = data.node?.id;
                if(nodeId) pushLayerList(nodeId, layerCode_id_arr);
            }
            if (layerCode_id_arr.length > 0) {
                //MOSubscriber (Legend 객체와 MOGISMap 객체)에 전달할 내용 구성
                me.ctrlLayerDataArr=[];
                let tempArr = layerCode_id_arr.map((id) => {
                	//mainMap.jsp 버튼 대응
					document.querySelector(`input#layerid_${id}_check`).checked=visible;
                    return {
                        id : id,
                        boolVisible : visible,
                        layerPurposeCategory : me.layerPurposeCategoryKey,
                        legendHtmlString : me.legendHtmlStrArr.find(el=>el.id==id),
                        layerCode : getLayerCode(id),
                        legendModelInfo:me.legendModelInfoArr.find(el=>el.id==id),
                    };
                });
//                negativeArr.forEach(id=>{
//					tempArr.push({id:id, boolVisible:false, layerPurposeCategory:me.layerPurposeCategoryKey});
//				});
                me.ctrlLayerDataArr = tempArr;
                me.notify();
            }
        });
        
        function getLayerCode(layer_id){
            return me.layerCodeArr.find(el=>el[KEY.LAYER_ID]==layer_id);
        }
        function pushLayerList(nodeId, layerList) {
            let node = me.INSTANCE_JS_TREE.get_node(nodeId);
            let layerid;
            if (nodeId.indexOf(KEY.LAYER_ID) > -1) {
                layerid = node.data.layerid;
                layerList.push(layerid);
            }
        }
        
    }



    //🟨🟨🟨MOPublisher 함수등록🟨🟨🟨🟨🟨🟨🟨🟨🟨
   
   /** publisherData로서 MOSubscriber 에게 전달할 정보 객체 
    * @type {Array<KEY.LegendCodeObj>} */
    ctrlLayerDataArr = [
        {
            id: undefined,
            boolVisible: true,
            layerPurposeCategory: this.layerPurposeCategoryKey,
            legendHtmlString:'',
            legendModelInfo:{},
            layerCode:[],
        },
    ];

    /** MOSubscriber 들이 가져가는 데이터 */
    get PublisherData() {
        return this.ctrlLayerDataArr;
    }

    //🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨

}