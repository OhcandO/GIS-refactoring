import * as KEY from '../common/MO.keyMap.js';
import $ from '../../lib/jquery-3.7.1/jquery-3.7.1_esm.js';
import { LayerTree } from './MO.LayerTree.js';
import Pickr from '../../lib/pickr-1.9.0/dist/pickr_1.9.0_esm.js';

/**
 * LayerTree 의 기본기능은 계승하면서,
 * Polygon 및 LineString 벡터 타입 레이어들의 색상을 변경해 LayerCode 에 반영할 수 있는 
 * 레이어트리 
 * @requires JQuery1.9+ JStree
 * @class LayerTree
 * @author jhoh
 */
export class LayerTree_colorPickr extends LayerTree {
    /**
     * jstree 생성
     * JQuery 의존적
     */
    createTree(treeList) {
        //1. map div 에 tree용 영역 생성
        this.createTreeDiv();

        let wrap = this.createWrap(treeList);
        $(`#${this.TREE_DIV_ID}`).html(wrap);
        // $(".map_info a").trigger("click");
        $(`#${this.TREE_DIV_ID}`).jstree({
            core: {
                themes: {
                    icons: false,
                    dots: false, //계층을 점선으로 연결한 요소
                },
            },
            plugins: ["checkbox", /* "wholerow" */],
        });
        this.INSTANCE_JS_TREE = $(`#${this.TREE_DIV_ID}`).jstree(true);

        //## colorPickr 객체생성
        
        document.getElementById(this.TREE_DIV_ID).querySelectorAll(`div.colorPickr`).forEach(node=>{
            Pickr.create({
                el: node,
                theme: 'monolith', //'classic' or 'monolith', or 'nano'
                // useAsButton:true,
                sliders:'h', //'v', 'hv'
                defaultRepresentation: 'RGBA',
                default:node.dataset.rgba,
                appClass: 'colorPickr_palette',
                components: {
                    // Main components
                    preview: true,
                    opacity: true,
                    hue: true,
                    // Input / output Options
                    interaction: {
                        rgba: false,
                        hex: false,
                        input: true,
                        clear: false,
                        save: true,
                        cancel:false,
                    }
                }
            }).on('save', (color, instance) => {

                //1. MOGISMap 의 LayerCodeObj 찾아서 해당 색깔 값 교체하기
                let colorString = color.toRGBA().toString(0);
                const param = instance.getRoot().root.parentElement.dataset;
                let layerPurposeCategoryKey = param[(KEY.LAYER_PURPOSE_CATEGORY_KEY).toLowerCase()];
                let layerCodeArr = this.INSTANCE_MOGISMAP.layerCodeObject[layerPurposeCategoryKey];

                layerCodeArr.map(layerCodeObj=> (layerCodeObj[KEY.LAYER_ID] == param[KEY.LAYER_ID] ? layerCodeObj[param['key']]=colorString : layerCodeObj)  );
                
                let tnode = this.INSTANCE_JS_TREE.get_node("layerid_" + param.id);

                if (tnode?.state.selected == true) {
                    this.INSTANCE_JS_TREE.uncheck_node(tnode);
                }

                //2. 기 발행 레이어 파기
                this.INSTANCE_MOGISMAP.discardLayer(Number(param.id), layerPurposeCategoryKey);
                // this.INSTANCE_MOGISMAP.ctrlLayer(Number(param.id),true,this.layerPurposeCategoryKey)
                
                
                if (tnode?.state.selected == false) {
                    this.INSTANCE_JS_TREE.check_node(tnode);
                }
            });
        });
        
        document.querySelectorAll(`button.linePickr`).forEach(node=>{
		    node.addEventListener('click',(e)=>{
		        let id = e.target.dataset.id;
		        let key = e.target.dataset.layerpurposecategory;
		        let input = document.querySelector(`input[name='lineWidth'][data-id='${id}'][data-layerpurposecategory='${key}']`);
		        let width = input.value;
		
		        this.INSTANCE_MOGISMAP.layerCodeObject[key].map(el=>(el.id==id ? el.lineWidth=Number(width) : el));
		        
		        let tnode = this.INSTANCE_JS_TREE.get_node("layerid_" + id);

                if (tnode?.state.selected == true) {
                    this.INSTANCE_JS_TREE.uncheck_node(tnode);
                }

                //2. 기 발행 레이어 파기
                this.INSTANCE_MOGISMAP.discardLayer(Number(id), key);
                
                if (tnode?.state.selected == false) {
                    this.INSTANCE_JS_TREE.check_node(tnode);
                }
		        
		    })
		})


        //colorPicker 컨테이너에 이벤트 버블링/캡쳐링 중단
        document.querySelectorAll('div.colorPickr_container').forEach(node=>{
            node.addEventListener('click',e=>e.stopPropagation())
        });
        //colorPicker 팔레트에 이벤트 버블링/캡쳐링 중단
        document.querySelectorAll('div.colorPickr_palette').forEach(node=>{
			node.addEventListener('click',e=>e.stopPropagation())	
		});
    }

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
            if (level == 1) html += `<ul class="contlist w165">`;
            if (isGroup == "Y") {
                html += `<li id="${id}">${name}<ul class="contlist w165">`;
            } else {
                html += `<li id="layerid_${id}" data-layerid="${id}" data-type="${type}" class="${type} ${id}">	${name}`;
                if(type == KEY.OL_GEOMETRY_OBJ.LINE) {
                    html += `<div class="colorPickr_container" 
                    			style="display:inline-flex; flex-direction: row; flex-wrap: nowrap; position:relative; top:-5px; left:113px;
			                    background-color: #00000091;align-items: center;">
                                <div>선 색</div>
                                <div    data-${KEY.LAYER_ID}="${id}"
                                        data-${KEY.LAYER_PURPOSE_CATEGORY_KEY}="${this.layerPurposeCategoryKey}"
                                        data-key="${KEY.COLOR_LINE}">
                                    <div class="colorPickr" data-rgba="${layerCode[KEY.COLOR_LINE]}"></div>
                                </div> 
                                <div>선두께</div>                               
                                <div>
                                	<input type="number" name="lineWidth" required 
                                	min="0.1" max="10" value="${layerCode[KEY.LINE_WIDTH]}" step="0.1"
                                	data-${KEY.LAYER_ID}="${id}"
                                        data-${KEY.LAYER_PURPOSE_CATEGORY_KEY}="${this.layerPurposeCategoryKey}"
                                	 /><button class="linePickr" data-${KEY.LAYER_ID}="${id}" data-${KEY.LAYER_PURPOSE_CATEGORY_KEY}="${this.layerPurposeCategoryKey}">sbmt</button>
                                </div>                               
                            </div>`
                }
                if(type == KEY.OL_GEOMETRY_OBJ.POLYGON) {
                    html += `<div class="colorPickr_container" 
			                    style="display:inline-flex; flex-direction: row; flex-wrap: nowrap; position:relative; top:-5px; left:113px;
			                    background-color: #00000091;align-items: center;">
                    		<div>선 색</div>
                            <div    data-${KEY.LAYER_ID}="${id}"
	                            data-${KEY.LAYER_PURPOSE_CATEGORY_KEY}="${this.layerPurposeCategoryKey}"
	                            data-key="${KEY.COLOR_LINE}">
                            	<div class="colorPickr" data-rgba="${layerCode[KEY.COLOR_LINE]}"></div>
                             </div>
                             <div>선두께</div>                               
                                <div>
                                	<input type="number" name="lineWidth" required 
                                	min="0.1" max="10" value="${layerCode[KEY.LINE_WIDTH]}" step="0.1"
                                	data-${KEY.LAYER_ID}="${id}"
                                        data-${KEY.LAYER_PURPOSE_CATEGORY_KEY}="${this.layerPurposeCategoryKey}"
                                	 /><button class="linePickr" data-${KEY.LAYER_ID}="${id}" data-${KEY.LAYER_PURPOSE_CATEGORY_KEY}="${this.layerPurposeCategoryKey}">sbmt</button>
                                </div>
                             <div>면 색</div>
                             <div    data-${KEY.LAYER_ID}="${id}"
                                        data-${KEY.LAYER_PURPOSE_CATEGORY_KEY}="${this.layerPurposeCategoryKey}"
                                        data-key="${KEY.COLOR_FILL}">
                               	 <div class="colorPickr" data-rgba="${layerCode[KEY.COLOR_FILL]}"></div>
                              </div>  
                             </div>`
                }
                html +=`<label class="switch">
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