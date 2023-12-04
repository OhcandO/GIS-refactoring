import * as KEY from '../common/MO.keyMap.js';
import $ from '../../lib/jquery-3.7.1/jquery-3.7.1_esm.js';
import { LayerTree } from './MO.LayerTree.js';
import Pickr from '../../lib/pickr-1.9.0/dist/pickr_1.9.0_esm.js';

/**
 * MOGISMap 을 인자로 받아, 해당 Map 객체의 레이어를 관장하는 
 * JSTree 구조체를 생성함
 * 지도 객체 하나에 여러개의 layerTree 객체 생성될 수 있음
 * @requires JQuery1.9+ JStree
 * @class LayerTree
 * @author jhoh
 */
export class LayerTree_colorPickr extends LayerTree {
    defaults = {
        contextPath: "",
        iconPath: "./MO_GIS/images/icons/",
    };

    /**
     * jstree 생성
     * JQuery 의존적
     */
    createTree(treeList) {
        //1. map div 에 tree용 영역 생성
        this.#createTreeDiv();

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
                theme: 'classic', // or 'monolith', or 'nano'
                // useAsButton:true,
                sliders:'v', //'v', 'hv'
                defaultRepresentation: 'RGBA',
                default:node.dataset.rgba,
                components: {
                    // Main components
                    preview: true,
                    opacity: true,
                    hue: true,
                    // Input / output Options
                    interaction: {
                        rgba: true,
                        hex: true,
                        input: true,
                        clear: false,
                        save: true
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

                //2. TODO
                this.INSTANCE_MOGISMAP.discardLayer(Number(param.id), layerPurposeCategoryKey);
                // this.INSTANCE_MOGISMAP.ctrlLayer(Number(param.id),true,this.layerPurposeCategoryKey)
                
                
                if (tnode?.state.selected == false) {
                    this.INSTANCE_JS_TREE.check_node(tnode);
                }
            });
        })


        //colorPicker 컨테이너에 이벤트 버블링/캡쳐링 중단
        document.querySelectorAll('div.colorPickr_container').forEach(node=>{
            node.addEventListener('click',e=>e.stopPropagation())
        });
    }

    #createTreeDiv() {
        let treeDiv = document.querySelector(`#${this.TREE_DIV_ID}`);
        if (treeDiv instanceof HTMLDivElement) {
            treeDiv.insertAdjacentHTML(
                `beforeend`,
                this.TREE_ELEMENT.getHTML()
            );
        } else {
            throw new Error(
                `layerTree 객체위한 DIV가 생성되지 않음: div id=${
                    this.TREE_DIV_ID
                }`
            );
        }
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
            if (level == 1) html += `<ul>`;
            if (isGroup == "Y") {
                html += `<li id="${id}">${name}<ul>`;
            } else {
                // let src = this.makeLegendSrc(layerCode);
                // html += `<li id="layerid_${id}" ><img src="${src}" style="width:16px;"/> &nbsp;${name}`;
                html += `<li id="layerid_${id}"  data-layerid="${id}">&nbsp;${name}`;
                if(type == KEY.OL_GEOMETRY_OBJ.LINE) {
                    html += `<div class="colorPickr_container" style="display:inline-flex; flex-direction: row; flex-wrap: nowrap;">
                                <div    data-${KEY.LAYER_ID}="${id}"
                                        data-${KEY.LAYER_PURPOSE_CATEGORY_KEY}="${this.layerPurposeCategoryKey}"
                                        data-key="${KEY.COLOR_LINE}">
                                    <div class="colorPickr" data-rgba="${layerCode[KEY.COLOR_LINE]}"></div>
                                </div>
                            </div>`
                }
                if(type == KEY.OL_GEOMETRY_OBJ.POLYGON) {
                    html += `<div class="colorPickr_container" style="display:inline-flex; flex-direction: row; flex-wrap: nowrap;">
                            <div    data-${KEY.LAYER_ID}="${id}"
                            data-${KEY.LAYER_PURPOSE_CATEGORY_KEY}="${this.layerPurposeCategoryKey}"
                            data-key="${KEY.COLOR_LINE}">
                                <div class="colorPickr" data-rgba="${layerCode[KEY.COLOR_LINE]}"></div>
                             </div>
                             <div    data-${KEY.LAYER_ID}="${id}"
                                        data-${KEY.LAYER_PURPOSE_CATEGORY_KEY}="${this.layerPurposeCategoryKey}"
                                        data-key="${KEY.COLOR_FILL}">
                                <div class="colorPickr" data-rgba="${layerCode[KEY.COLOR_FILL]}"></div>
                              </div>  
                             </div>`
                }
                html += `</li>`;
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

    /**
     * 체크박스 선택시 이벤트
     */
    checkEventListener() {
        let me = this;
        let nodeId;
        $(`#${this.TREE_DIV_ID}`).bind("changed.jstree", function (e, data) {
            if (data.action === "ready") return;

            let visible = false;
            if (data.action === "select_node") visible = true;

            let layerCode_id_arr = [];
            if (data.node.children.length > 0) {
                for (let id in data.node.children_d) {
                    nodeId = data.node.children_d[id];
                    pushLayerList(nodeId, layerCode_id_arr);
                }
            } else {
                nodeId = data.node.id;
                pushLayerList(nodeId, layerCode_id_arr);
            }
            if (layerCode_id_arr.length > 0) {
                //MOSubscriber (Legend 객체와 MOGISMap 객체)에 전달할 내용 구성
                me.ctrlLayerDataArr=[];
                let tempArr = layerCode_id_arr.map((id) => {
                    let htmlStr = `<span>${makeHtmlStr(id)}</span>`;
                    return {
                        id : id,
                        boolVisible : visible,
                        layerPurposeCategory : me.layerPurposeCategoryKey,
                        legendHtmlString : htmlStr,
                        layerCode : getLayerCode(id),
                    };
                });
                me.ctrlLayerDataArr = tempArr;
                me.notify();
            }
        });
        function makeHtmlStr(layer_id){
            let layerCode = getLayerCode(layer_id);
            let imgSrc = me.makeLegendSrc(layerCode);
            return `<img src="${imgSrc}" style="width:16px;"/>&nbsp;&nbsp;${layerCode[KEY.LAYER_NAME]}`
        }
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
            layerCode:[],
        },
    ];

    /** MOSubscriber 들이 가져가는 데이터 */
    get PublisherData() {
        return this.ctrlLayerDataArr;
    }

    //🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨

    /**
     * 이미지 정보
     */
    makeLegendSrc(layerInfoElem) {
        let src;
        let iconPath = this.defaults.iconPath;
        if (layerInfoElem[KEY.ICON_NAME]) {
            src = iconPath + layerInfoElem[KEY.ICON_NAME];
        } else {
            let ss = this.makeLegendImage(layerInfoElem);
            src = ss.src;
        }
        return src;
    }
}