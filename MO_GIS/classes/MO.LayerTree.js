import * as KEY from '../MO.keyMap.js';
import { MOGISMap } from './MO.MOGISMap.js';

/**
 * MOGISMap 을 인자로 받아, 해당 Map 객체의 레이어를 관장하는 
 * Tree 구조체를 생성함 (Jquery 필수..)
 * @requires JQuery1.9+ JStree
 * @class LayerTree
 * @author jhoh
 */
export class LayerTree {
    defaults = {
        contextPath: "",
        iconPath: '../images/icons/',
    };
    /**지도 객체의 DIV id 
     * @type {String} */
    #TARGET_ID_MAP;
    /**트리 객체의 DIV id 
     * @type {String} */
    #TARGET_ID_TREE;
    
    #style={
        tree_div : `
            position: absolute;
            top: 20px; left: 0;
            margin-left: 0px;
        `,
    }

    #html={
        tree_div:`<div id="${this.#TARGET_ID_TREE}" style="${this.#style.tree_div}"></div>`,
    }

    #INSTANCE_TREE;
    #INSTANCE_MOGISMAP;

    /** 소스+레이어 정보 코드 리스트 
     * @type {JSON} */
    layerCode;

    /** 코드 리스트를 계층구조로 만든 것
     * @type {JSON} */
    layerStructure;
    /**
     * Openlayers 레이어 관장 Tree 생성을 위한 기초정보 등록
     * @param {Map} mo_gis_map 오픈레이어스 맵 객체
     * @returns 
     */
    constructor(mo_gis_map) {
        if(mo_gis_map instanceof MOGISMap) {
            
            this.#INSTANCE_MOGISMAP = mo_gis_map;
            this.#TARGET_ID_MAP = mo_gis_map.getTarget(); //ol.Map 메서드
            this.#TARGET_ID_TREE = `${this.#TARGET_ID_MAP}-layer-tree`;
            // mo_gis_map.setTree(mo_gis_map);
            mo_gis_map.setTree(this);
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
    setLayerCode(layerCodeArr, target_id =`${KEY.ELEMENT_ID}`, parent_id =`${KEY.PARENT_ID}`, child_mark=`${KEY.CHILD_MARK}`){
        if(layerCodeArr instanceof Array){
            this.layerCode = layerCodeArr;
            try{
                this.layerStructure = jsonNestor(this.layerCode, target_id, parent_id, child_mark);
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
    activate(){
        this.#createTree(this.layerStructure);
        this.checkEventListener();
        this.selectableTree(this.defaults.treeList);
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
        $(`#${this.#TARGET_ID_TREE}`).html(wrap);
        // $(".map_info a").trigger("click");
        $(`#${this.#TARGET_ID_TREE}`).jstree({
            core: {
                themes: {
                    icons: false,
                },
            },
            plugins: ["wholerow", "checkbox"],
        });

        this.#INSTANCE_TREE = $(`#${this.#TARGET_ID_TREE}`).jstree(true);
    }

    #createTreeDiv(){
        if(this.#TARGET_ID_MAP && !this.#TARGET_ID_TREE){            
            document.querySelector(`#${this.#TARGET_ID_MAP}`).insertAdjacentHTML(`beforeend`,this.#html.tree_div);
        }
    }

    /**
     * 트리 html 생성 리턴
     */
    #createWrap(array, level) {
        let html = ``;
        level = level || 1;
        array.forEach(layer => {
            const id = layer[KEY.ELEMENT_ID];
            const name = layer[KEY.LAYER_NAME];
            const type = layer[KEY.LAYER_TYPE];
            const isLayer = layer[KEY.BOOL_VISIBLE] || "N";
            let hasChild = false;

            if (layer[KEY.CHILD_MARK]?.length > 0) hasChild = true;
            if (level == 1) html += `<ul>`;
            if (isLayer == "Y") {
                let src = this.#makeLegendSrc(layer);
                html += `<li id="layerid_${id}" data-layerid="${id}" data-type="${type}" class="${type} ${id}"><img src="${src}" style="width:16px;"/>&nbsp;&nbsp;${name}</li>`;
            } else {
                html += `<li id="${id}">${name}<ul>`;
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
    selectableTree(array) {
        for (let i = 0; i < array.length; i++) {
            let layer = array[i];
            let id = layer.id;
            let visible = layer[KEY.BOOL_VISIBLE] || "N";

            if (layer[KEY.CHILD_MARK] && layer[KEY.CHILD_MARK].length > 0) {
                this.selectableTree(layer[KEY.CHILD_MARK]);
            }

            if (visible === "Y") {
                let tnode = this.#INSTANCE_TREE.get_node("layerid_" + id);
                if (!tnode) continue;
                if (tnode.state.selected == false) {
                    this.#INSTANCE_TREE.check_node(tnode);
                }
            }
        }
    }

    /**
     * 체크박스 선택시 이벤트
     */
    checkEventListener() {
        let me = this;
        //Map 객체에 의존적
        let core = this.#INSTANCE_MOGISMAP;
        let nodeId;
        $(`#${this.#TARGET_ID_TREE}`).bind("changed.jstree", function (e, data) {
            if (data.action === "ready") return;
            let visible = false;
            if (data.action === "select_node") {
                visible = true;
            }
            let layerList = [];
            if (data.node.children.length > 0) {
                for (let id in data.node.children_d) {
                    nodeId = data.node.children_d[id];
                    pushLayerList(nodeId, layerList);
                }
            } else {
                nodeId = data.node.id;
                pushLayerList(nodeId, layerList);
            }
            // core.setLayerOnMap(layerList, visible); // Map 객체에 의존적임
            if (layerList.length > 0) {
                const realLayer = me.#INSTANCE_MOGISMAP.map.getLayers().getArray();
                layerList.forEach((id) => {
                    let layer = realLayer.find((el) => el[KEY.ELEMENT_ID] == id);
                    if (layer) layer.setVisible(visible);
                    else {
                        me.#INSTANCE_MOGISMAP  //TODO 레이어 트리와 LayerFactoru 연동
                    }
                });
            }
            
        });

        function pushLayerList(nodeId, layerList) {
            let node = this.instance.get_node(nodeId);
            let layerid;
            if (nodeId.indexOf("layerid") > -1) {
                layerid = node.data.layerid;
                layerList.push(layerid);
            }
        }
    }

    /**
     * 이미지 정보
     */
    #makeLegendSrc(layerInfoElem) {
        let src;
        let iconPath = this.defaults.iconPath
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

        if (layerinfo[KEY.LAYER_TYPE] == "POLYGON") {
            ctx.moveTo(1, 1);
            ctx.lineTo(15, 1);
            ctx.lineTo(15, 15);
            ctx.lineTo(1, 15);
            ctx.lineTo(1, 1);
        } else if (layerinfo[KEY.LAYER_TYPE] == "LINE") {
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

        if (layerinfo[KEY.LAYER_TYPE] == "POLYGON") {
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
     * 아이디로 체크박스 선택
     * gis.edit.js 에서 사용했었음
     */
    checkTreeOfId(id) {
        let boolean = this.#INSTANCE_TREE.is_selected(id);
        if (!boolean) {
            this.#INSTANCE_TREE.select_node(id);
        }
    }

    /**
     * 레이어 구분자로 연관 레이어들 숨기기
     * @param {String} typeName 레이어 구분자 (geoserver ST.) e.g. waternet:WTL_BLSM_AS
     */
    hideLayerByTypename(typeName) {
        let tempTreeIdArr = this.#getTreeIdArr(typeName);
        if (tempTreeIdArr.length > 0) {
            tempTreeIdArr.forEach((treeId) => {
                this.#INSTANCE_TREE.deselect_node(treeId);
            });
        }
    }

    showALayer(typeName, ftrIdn) {
        if (ftrIdn) {
            let tempTreeIdArr = this.#getTreeIdArr(typeName, ftrIdn);
            if (tempTreeIdArr.length > 0) {
                tempTreeIdArr.forEach((treeId) => {
                    this.#INSTANCE_TREE.select_node(treeId);
                });
            }
        } else {
            console.log(`gis_tree.showALayer() | 관리번호 (ftrIdn) 미지정`);
        }
    }
    #getTreeIdArr(typeName, ftrIdn = "") {
        let codeObjArr = structuredClone(this.layerCode.filter(layCD => layCD[KEY.TYPE_NAME] == typeName && layCD[KEY.BOOL_IS_GROUP] !== "Y"))
        if (codeObjArr?.length > 0) return codeObjArr.map(codeObj => "layerid_" + codeObj[KEY.ELEMENT_ID]);
        else return [];
    }

    /**
     * 레이어 활성화 안됐을 때 GisApp.LayerCode 에서 레이어 코드 찾아 노드 선택 이벤트 진행
     * @requires JSTree3
     */
    showLayerWithTypeName(typeName) {
        let minZoom = 16;
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
            let codeObjArr = structuredClone(this.layerCode.filter(
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
            return treeIdArr.every((nodeId) =>this.#INSTANCE_TREE.is_selected(nodeId));
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
                    hideLoadingBar(`#${this.#TARGET_ID_MAP}`);
                    reso();
                });

                //전역함수 showloadingbar
                showLoadingBar(`#${this.#TARGET_ID_MAP}`);
                tempTreeIdArr.forEach((treeId) => {
                    this.#INSTANCE_TREE.select_node(treeId);
                });
            }
        });
    }
}


/**
 * 
 * @param {Array} array javascript Array 객체. JSON 형식이어야 하고, 최상위->중위->하위 순으로 정렬되어 있어야 함
 * @param {String} target_id 개별 JSON 요소들의 PK 키 명칭
 * @param {String} parent_id 개별 JSON 요소들의 상위 ID 를 참조할 키 명칭
 * @param {String} child_mark NESTED 구조체 만들기 위한 
 * @returns 
 */
function jsonNestor (array, target_id =`${KEY.ELEMENT_ID}`, parent_id =`${KEY.PARENT_ID}`, child_mark=`${KEY.CHILD_MARK}`){
    if(array?.length>0){
        function FINDER (srcArr, targetElem){    
            let rere
            for(el of srcArr){
                if(el[target_id] == targetElem[parent_id]) {rere = el;}
                else if (el[child_mark]) rere = FINDER(el[child_mark],targetElem);
                if (rere) break;
            }
            return rere;
        }
        return array.reduce((pre,cur)=>{
            let targ = cur[parent_id] ? FINDER(pre,cur) : undefined;
            if(targ) targ[child_mark] ? targ[child_mark].push(cur) : targ[child_mark] = [cur];
            return pre;
        },structuredClone(array.filter(el=>!el[parent_id])))
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