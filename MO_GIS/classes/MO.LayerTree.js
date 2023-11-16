import * as KEY from '../common/MO.keyMap.js';
import { MOGISMap } from './MO.MOGISMap.js';
import {Spinner} from '../../lib/spin.js/spin.js';
import $ from '../../lib/jquery-3.7.1/jquery-3.7.1_esm.js';
import jstree from '../../lib/jstree-3.3.16/jstree-3.3.16_esm.js';
import { MOPublisher } from './abstract/MO.Publisher.js';

/**
 * MOGISMap 을 인자로 받아, 해당 Map 객체의 레이어를 관장하는 
 * JSTree 구조체를 생성함
 * 지도 객체 하나에 여러개의 layerTree 객체 생성될 수 있음
 * @requires JQuery1.9+ JStree
 * @class LayerTree
 * @author jhoh
 */
export class LayerTree extends MOPublisher {
    defaults = {
        contextPath: "",
        iconPath: '../images/icons/',
    };

    /**트리 객체가 생성될 곳의 DIV id 
     * @type {string} */
    #TREE_DIV_ID;

    /**트리 객체 자체의 ID
     */
    #TREE_ELEMENT={
        /**@type {string} */
        id:undefined,
        style: `position: absolute;
                top: 20px; left: 0;
                margin-left: 0px;`,
        getHTML:function(){return `<div id="${this.id}" style="${this.style}"></div>`;},
    }

    /** JSTree 객체 
     * */
    #INSTANCE_JS_TREE;

    /** MOGISMap 객체
     * @type {MOGISMap}*/
    #INSTANCE_MOGISMAP;

    /** 레이어코드의 목적을 나타내는 코드
     * @type {KEY.LAYER_PURPOSE_CATEGORY}
     */
    layerObjCategoryKey;

    /**본 레이어트리에서 관리하는 
     * 소스+레이어 정보 레이어 코드 리스트 
     * @type {JSON} */
    layerCodeArr;

    /** 레이어코드 상 최상위 부모의 코드(layerStructure 구성시 사용)
     */
    #most_upper_id;

    /** 레이어 코드 리스트를 계층구조로 만든 것
     * @type {JSON} */
    #layerStructure;

    /**
     * MOGISMap 의 레이어 관장하는 Tree 생성
     * @param {string} tree_div_id 레이어트리 객체가 생성될 div id
     * @param {string} NAME MOPublisher 로서의 이름 지정
     */
    constructor(tree_div_id, NAME) {
        super(NAME);
        if(tree_div_id){
            this.#TREE_DIV_ID = tree_div_id;
            this.#TREE_ELEMENT.id = `${this.#TREE_DIV_ID}-layerTree`;
        }else{
            throw new Error(`layerTree 객체 생성될 DIV 아이디 입력되어야 함`);
        }
    }

    /**
     * Openlayers 레이어 관장 Tree 생성을 위한 기초정보 등록
     * @param {MOGISMap} mo_gis_map 오픈레이어스 맵 객체
     * @param {string} layerObjCategoryKey
     * @param {string} [most_upper_id] 레이어코드 상 최상위 코드
     */
    setMapAndLayer(mo_gis_map, layerObjCategoryKey,most_upper_id){
        if(mo_gis_map instanceof MOGISMap) {
            //MOGISMap 객체 저장
            this.#INSTANCE_MOGISMAP = mo_gis_map;
            //subscriber 등록
            this.regist(mo_gis_map);
            
            if(most_upper_id) this.#most_upper_id = most_upper_id;

            //레이어 코드 카테고리 중 하나만 이 layerTree 객체에서 관장함
            if(Object.values(KEY.LAYER_PURPOSE_CATEGORY).includes(layerObjCategoryKey) 
                && mo_gis_map.layerCodeObject[layerObjCategoryKey]) {
                    this.layerObjCategoryKey = layerObjCategoryKey;
                this.#setLayerCodeArr(mo_gis_map.layerCodeObject[layerObjCategoryKey]);
            }

            //layerTree 화면에 표현
            this.#activate();
        }else{
            throw new Error (`MOGISMap 객체가 아님`);
        }
    }

    /**
     * 정렬된 레이어 코드 JSON 을 LayerTree 객체에 등록함
     * 객체 생성 후 가장 먼저 해야할 것
     * @param {Array} layerCodeArr 
     * @param {String} target_id 개별 JSON 요소들의 PK 키 명칭 (id)
     * @param {String} parent_id 개별 JSON 요소들의 상위 ID 를 참조할 키 명칭 (pid)
     * @param {String} child_mark NESTED 구조체 만들기 위한 (childList)
     * @memberof LayerTree
     */
    #setLayerCodeArr(layerCodeArr, target_id =`${KEY.LAYER_ID}`, parent_id =`${KEY.PARENT_ID}`, child_mark=`${KEY.CHILD_MARK}`){
        if(layerCodeArr instanceof Array){
            this.layerCodeArr = layerCodeArr;
            try{
                this.#layerStructure = jsonNestor(this.layerCodeArr, target_id, parent_id, child_mark, this.#most_upper_id);
            }catch(e){
                console.error(e);
            }
        }else{
            console.error(`treeLayer 객체에 설정할 JSON 객체가 적합하지 않음`)
            throw new Error(`treeLayer 객체에 설정할 JSON 객체가 적합하지 않음`)
        }
    }
    /**
     * 실질 TREE 객체 생성과정
     * 
     * @memberof LayerTree
     */
    #activate(){
        if(!(this.layerCodeArr?.length > 0)){
            try{
                this.#setLayerCodeArr(this.#INSTANCE_MOGISMAP.layerCodeObject);
            }catch(e){
                console.log(`layerCodeArr (JSON) 이 등록되어야 함`)
                console.error(e);
            }
        }
        this.#createTree(this.#layerStructure);
        this.#checkEventListener();
        this.#showInitialLayers(this.#layerStructure);
    }

    /**
     * jstree 생성
     * JQuery 의존적
     */
    #createTree(treeList) {
        //1. map div 에 tree용 영역 생성
        this.#createTreeDiv();

        //2. tree 구조체 내에 
        let wrap = this.#createWrap(treeList);
        $(`#${this.#TREE_DIV_ID}`).html(wrap);
        // $(".map_info a").trigger("click");
        $(`#${this.#TREE_DIV_ID}`).jstree({
            core: {
				themes:	{
					icons: false,
					dots: false //계층을 점선으로 연결한 요소
					},
				},
		    "plugins" : [ "checkbox" , "wholerow"],
        });

        this.#INSTANCE_JS_TREE = $(`#${this.#TREE_DIV_ID}`).jstree(true);
    }

    #createTreeDiv(){
        let treeDiv = document.querySelector(`#${this.#TREE_DIV_ID}`);
        if(treeDiv instanceof HTMLDivElement){
            treeDiv.insertAdjacentHTML(`beforeend`,this.#TREE_ELEMENT.getHTML());
        }else{
            throw new Error(`layerTree 객체위한 DIV가 생성되지 않음: div id=${this.#TREE_DIV_ID}`);
        }
    }

    /**
     * 트리 html 생성 리턴
     */
    #createWrap(array, level) {
        let html = ``;
        level = level || 1;
        array.forEach(layer => {
            const id = layer[KEY.LAYER_ID];
            const name = layer[KEY.LAYER_NAME];
            const type = layer[KEY.LAYER_GEOMETRY_TYPE];
            const isGroup = layer[KEY.BOOL_IS_GROUP] || "N";
            let hasChild = false;

            if (layer[KEY.CHILD_MARK]?.length > 0) hasChild = true;
            if (level == 1) html += `<ul>`;
            if(isGroup == "Y") {
                html += `<li id="${id}">${name}<ul>`;
            }
            else {
                let src = this.#makeLegendSrc(layer);
                html += `<li id="layerid_${id}" data-layerid="${id}" data-type="${type}" class="${type} ${id}"><img src="${src}" style="width:16px;"/>&nbsp;&nbsp;${name}</li>`;
            } 
            if (hasChild) {
                level++;
                html += this.#createWrap(layer[KEY.CHILD_MARK], level);
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
     * 초기 선택 노드 셋팅
     */
    #showInitialLayers(structuredLayerCode) {
        if(structuredLayerCode instanceof Array){

            for(let layerCode of structuredLayerCode){
                let id = layerCode[KEY.LAYER_ID];
                let visible = layerCode[KEY.BOOL_SHOW_INITIAL] || "N";
    
                if (layerCode[KEY.CHILD_MARK] && layerCode[KEY.CHILD_MARK].length > 0) {
                    this.#showInitialLayers(layerCode[KEY.CHILD_MARK]);
                }
    
                if (visible === "Y") {
                    let tnode = this.#INSTANCE_JS_TREE.get_node("layerid_" + id);
                    if (!tnode) continue;
                    if (tnode.state.selected == false) {
                        this.#INSTANCE_JS_TREE.check_node(tnode);
                    }
                }
            }
        }
    }

    /**
     * 체크박스 선택시 이벤트
     */
    #checkEventListener() {
        let me = this;
        let nodeId;
        $(`#${this.#TREE_DIV_ID}`).bind("changed.jstree", function (e, data) {
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
                // layerCode_id_arr.forEach((layer_id) => {
                //     me.#INSTANCE_MOGISMAP.ctrlLayer(layer_id,visible,me.layerObjCategoryKey);
                // });
                me.#ctrlLayerDataArr = layerCode_id_arr
                                    .map(id=>({layerID:id, visible:visible, categoryKEY:me.layerObjCategoryKey}));

                //                    
                me.notify();
            }
            
        });

        function pushLayerList(nodeId, layerList) {
            let node = me.#INSTANCE_JS_TREE.get_node(nodeId);
            let layerid;
            if (nodeId.indexOf(KEY.LAYER_ID) > -1) {
                layerid = node.data.layerid;
                layerList.push(layerid);
            }
        }
    }

    #ctrlLayerDataArr=[
        {layerID:undefined, visible:true, categoryKEY:this.layerObjCategoryKey},
    ]
    /** MOSubscriber 들이 찾게되는  */
    getPublisherData(){
        return this.#ctrlLayerDataArr;
    }
    /**
     * 이미지 정보
     */
    #makeLegendSrc(layerInfoElem) {
        let src;
        let iconPath = this.defaults.iconPath;
        if (layerInfoElem[KEY.ICON_NAME]) {
            src = iconPath + layerInfoElem[KEY.ICON_NAME];
        } else {
            let ss = this.#makeLegendImage(layerInfoElem);
            src = ss.src;
        }
        return src;
    }

    /**
     * 이미지 생성
     */
    #makeLegendImage(layerinfo) {
        let image = document.createElement("img");
        let canvas = document.createElement("canvas");
        canvas.width = 16;
        canvas.height = 16;
        let ctx = canvas.getContext("2d");
        ctx.beginPath();

        if (layerinfo[KEY.LAYER_GEOMETRY_TYPE] == KEY.OL_FEATURE_TYPE_POLYGON) {
            ctx.moveTo(1, 1);
            ctx.lineTo(15, 1);
            ctx.lineTo(15, 15);
            ctx.lineTo(1, 15);
            ctx.lineTo(1, 1);
        } else if (layerinfo[KEY.LAYER_GEOMETRY_TYPE] == KEY.OL_FEATURE_TYPE_LINE) {
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

        if (layerinfo[KEY.LAYER_GEOMETRY_TYPE] == KEY.OL_FEATURE_TYPE_POLYGON) {
            ctx.fillStyle = layerinfo[KEY.COLOR_FILL];
            ctx.fill();
        }

        if (layerinfo[KEY.LINE_WIDTH]) {
            ctx.lineWidth = layerinfo[KEY.LINE_WIDTH];
            ctx.strokeStyle = layerinfo[KEY.COLOR_LINE];
            ctx.stroke();
        }

        image.src = canvas.toDataURL("image/png");
        return image;
    }

    /**
     * 레이어 구분자로 연관 레이어들 숨기기
     * @param {String} typeName 레이어 구분자 (geoserver ST.) e.g. waternet:WTL_BLSM_AS
     */
    hideLayerByTypename(typeName) {
        let tempTreeIdArr = this.#getTreeIdArr(typeName);
        if (tempTreeIdArr.length > 0) {
            tempTreeIdArr.forEach((treeId) => {
                this.#INSTANCE_JS_TREE.deselect_node(treeId);
            });
        }
    }

    showALayer(typeName, ftrIdn) {
        if (ftrIdn) {
            let tempTreeIdArr = this.#getTreeIdArr(typeName, ftrIdn);
            if (tempTreeIdArr.length > 0) {
                tempTreeIdArr.forEach((treeId) => {
                    this.#INSTANCE_JS_TREE.select_node(treeId);
                });
            }
        } else {
            console.log(`gis_tree.showALayer() | 관리번호 (ftrIdn) 미지정`);
        }
    }
    #getTreeIdArr(typeName, ftrIdn = "") {
        let codeObjArr = structuredClone(this.layerCodeArr.filter(layCD => layCD[KEY.TYPE_NAME] == typeName && layCD[KEY.BOOL_IS_GROUP] !== "Y"))
        if (codeObjArr?.length > 0) return codeObjArr.map(codeObj => "layerid_" + codeObj[KEY.LAYER_ID]);
        else return [];
    }

    /**
     * 레이어 활성화 안됐을 때 GisApp.LayerCode 에서 레이어 코드 찾아 노드 선택 이벤트 진행
     */
    showLayerWithTypeName(typeName) {
        let me = this;
        let minZoom = 16;
        const default_spinner = {lines: 15, length: 38, width: 12, radius: 38, scale: 1, corners: 1,
            speed: 1, animation: "spinner-line-fade-more", color: "#ffffff", 
            fadeColor: "transparent", shadow: "grey 3px 4px 8px 1px"};
        
        const spin = new Spinner(default_spinner);
        const target_spin = document.querySelector(`#${this.#INSTANCE_MOGISMAP.default_mapSpec.target}`);
        /**
         * 테이블이름과 관련된 레이어들 코드정보 객체 찾아 내부 변수로 등록. 찾으면 true
         */
        function findAndSetLayerCodeObjWithTypename(typeName) {
            let codeObjArr = getCodeObjArrFromTypeName(typeName);
            if (codeObjArr.length > 0) {
                return (tempTreeIdArr = codeObjArr.reduce(
                    (pre, cur) => (pre.push("layerid_" + cur.id), pre),[]
                ));
            } else {
                console.error(`codeObj 찾을 수 없음 ${typeName}`);
                throw new Error(`codeObj 없음`);
            }
        }

        /**입력된 typeName 을 속성으로 하는 GisApp.LayerCode 의 요소들을 추출
         */
        function getCodeObjArrFromTypeName(typeName) {
            let codeObjArr = structuredClone(me.layerCodeArr.filter(
                (layCD) => layCD[KEY.TYPE_NAME]=== typeName && layCD[KEY.BOOL_IS_GROUP] !== "Y"
            ));

            //layerCode 상 같은 typeName 사용하는 레이어의 줌 레벨 선택
            minZoom = codeObjArr.reduce(
                (pre, cur) => (cur[KEY.MIN_ZOOM] > pre ? Number(cur[KEY.MIN_ZOOM]) : pre),10
            );
            return codeObjArr;
        }

        /**treeID 배열의 모든 요소가 선택된 상태인지 확인. instance는 jstree임 객체
         */
        const isEveryNodeSelected=(treeIdArr)=> {
            return treeIdArr.every((nodeId) =>this.#INSTANCE_JS_TREE.is_selected(nodeId));
        }

        // 입력된 typeName 을 속성으로 하는 GisApp.LayerCode 의 요소들의 id 를 추출
        let tempTreeIdArr = findAndSetLayerCodeObjWithTypename(typeName);
        if (tempTreeIdArr.length === 0) {
            return new Promise((_res, rej) => {
                rej("시설물 화면에 맞는 레이어 없음. 시설물 테이블명 : " +typeName);
            });
        }
        return new Promise((reso, _reje) => {
            //1. 노드가 이미 선택되어 있다면 바로 다음 Prmomise chaining 호출
            if (isEveryNodeSelected(tempTreeIdArr)) {
                reso();
            } else {
                this.#INSTANCE_MOGISMAP.view.setZoom(minZoom + 0.2);
                this.#INSTANCE_MOGISMAP.map.once("rendercomplete",  (e)=> {
                    //Spinner 정지
                    spin.stop();
                    reso();
                });

                //Spinner 가동
                spin.spin(target_spin);
                tempTreeIdArr.forEach((treeId) => {
                    this.#INSTANCE_JS_TREE.select_node(treeId);
                });
            }
        });
    }
}


/**
 * 1차원으로 구성된 json 자료구조를 계층형 
 * @param {Array} array javascript Array 객체. JSON 형식이어야 하고, 최상위->중위->하위 순으로 정렬되어 있어야 함
 * @param {String} [target_id_key] 개별 JSON 요소들의 PK 키 명칭
 * @param {String} [parent_id_key] 개별 JSON 요소들의 상위 ID 를 참조할 키 명칭
 * @param {String} [child_mark] NESTED 구조체 만들기 위한 
 * @param {String} [most_upper_id] 최상위 아이디
 * @returns 
 */
function jsonNestor (array, target_id_key =`${KEY.LAYER_ID}`, parent_id_key =`${KEY.PARENT_ID}`, child_mark=`${KEY.CHILD_MARK}`,most_upper_id){
    if(array?.length>0){
        function FINDER (srcArr, targetElem){    
            let rere
            for(let el of srcArr){
                if(el[target_id_key] == targetElem[parent_id_key]) {rere = el;}
                else if (el[child_mark]) rere = FINDER(el[child_mark],targetElem);
                if (rere) break;
            }
            return rere;
        }
        return array.reduce((pre,cur)=>{
            let targ = cur[parent_id_key] ? FINDER(pre,cur) : undefined;
            if(targ) targ[child_mark] ? targ[child_mark].push(cur) : targ[child_mark] = [cur];
            return pre;
        },structuredClone(array.filter(el=>{
            if(most_upper_id){
                return el[parent_id_key] == most_upper_id;
            }else{
                return !el[parent_id_key];
            }
        })))
    }else{
        throw new Error (`jsonNestor 에 입력된 배열이 적합하지 않음`)
    }
}
/*
//usage
console.time('aa')
let returns = jsonNestor(arr,'id','pid','childList')
console.log(returns);
console.timeEnd('aa')
*/