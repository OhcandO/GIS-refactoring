import * as KEY from '../common/MO.keyMap.js';
import { LayerTree } from './MO.LayerTree.js';

/**
 * LayerTree 의 상속버전
 *
 * @export
 * @class LayerTree_new
 * @extends {LayerTree}
 */
export class LayerTree_new extends LayerTree {
    
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
            if (level == 1) html += `<ul class="contlist w165">`;
            if(isGroup == "Y") {
                html += `<li id="${id}">${name}<ul class="contlist w165">`;
            }
            else {
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

}


// /**
//  * 1차원으로 구성된 json 자료구조를 계층형 
//  * @param {Array} array javascript Array 객체. JSON 형식이어야 하고, 최상위->중위->하위 순으로 정렬되어 있어야 함
//  * @param {String} [target_id_key] 개별 JSON 요소들의 PK 키 명칭
//  * @param {String} [parent_id_key] 개별 JSON 요소들의 상위 ID 를 참조할 키 명칭
//  * @param {String} [child_mark] NESTED 구조체 만들기 위한 
//  * @param {String} [most_upper_id] 최상위 아이디
//  * @returns 
//  */
// function jsonNestor (array, target_id_key =`${KEY.LAYER_ID}`, parent_id_key =`${KEY.PARENT_ID}`, child_mark=`${KEY.CHILD_MARK}`,most_upper_id){
//     if(array?.length>0){
//         function FINDER (srcArr, targetElem){    
//             let rere
//             for(let el of srcArr){
//                 if(el[target_id_key] == targetElem[parent_id_key]) {rere = el;}
//                 else if (el[child_mark]) rere = FINDER(el[child_mark],targetElem);
//                 if (rere) break;
//             }
//             return rere;
//         }
//         return array.reduce((pre,cur)=>{
//             let targ = cur[parent_id_key] ? FINDER(pre,cur) : undefined;
//             if(targ) targ[child_mark] ? targ[child_mark].push(cur) : targ[child_mark] = [cur];
//             return pre;
//         },structuredClone(array.filter(el=>{
//             if(most_upper_id){
//                 return el[parent_id_key] == most_upper_id;
//             }else{
//                 return !el[parent_id_key];
//             }
//         })))
//     }else{
//         throw new Error (`jsonNestor 에 입력된 배열이 적합하지 않음`)
//     }
// }
/*
//usage
console.time('aa')
let returns = jsonNestor(arr,'id','pid','childList')
console.log(returns);
console.timeEnd('aa')
*/