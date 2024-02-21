import * as KEY from "../../common/MO.keyMap.js";

/**
 * 조건에 따라 인스턴스를 생성하는 클래스들의 interface 
 *
 * @export
 * @class MOFactory
 * @author jhoh
 */
export class MOFactory{
 
    // static layerSpec;
    /**
     * 개별 레이어 소스와 스타일이 정의된 Object
     * @type {layerCodeObj}
     */
    layerCode;

    /**
     * 개별 레이어+소스+스타일 설정 정보를 등록함
     *
     * @param {KEY.layerCodeObj} inputLayerSpec
     * @memberof MOFactory
     */
    setSpec(inputLayerSpec) {
        if (!inputLayerSpec) throw new Error (`layerSpec 입력 안됨`)
        this.resetFactory();
        // object 에서 value 값이 있는 것들만 등록함
        this.layerCode = this.filterNullishVals(inputLayerSpec); 
    }

    /**
     * 입력된 객체에서 value 값이 Nullish 인 것들 제외시킨 객체 반환
     * 그러니까 null, undefined, ""(emptyString) 만 거름
     * @param {Object} obj
     * @return {Object} 
     * @memberof MOFactory
     */
    filterNullishVals(obj){
        return Object.fromEntries(Object.entries(obj).filter(([k,v])=>this.isNullish(v)));
    }
    /**
     * Nullish 여부 판가름 필터
     * @param {Object} input 
     * @returns {boolean}
     */
    isNullish(input){
        return (input===0||input==='0'||input===false)?true:input;
    }
    /**
     * 개별 레이어+소스+스타일 설정 정보를 불러옴
     *
     * @return {*} 
     * @memberof MOFactory
     */
    getSpec(){
        if(this.layerCode) return this.layerCode;
        else{throw new Error(`팩토리에 작업지시서 입력 안됨 (layerCode)`)}
    }

    /** 같은 key를 사용하는, 작은 Object에 큰 Object 를 합치되,
     *  key 와 value 가 nullish 하지 않는 것들만 반환
     *  @param {Object} small_obj '기준 key'들이 있는 객체
     *  @param {Object} big_obj '기준 key' 의 값을 찾을 객체
     *  @returns {Object}
     */ 
    getValidKeyVal(small_obj, big_obj_origin){
        let big_obj = this.filterNullishVals(big_obj_origin);
        return Object.entries(small_obj).reduce((pre, [key, val]) => {
            if (this.isNullish(big_obj[key]) || this.isNullish(val)) {
                pre[key] = big_obj[key] || val;
            }
            return pre;
        }, {});
    }
    
    /**
     * factory 객체 내부 변수 초기화
     * 상속 클래스에서 메서드 확장 용도
     * @abstract
     * @memberof MOFactory
     */
    resetFactory(){
        this.layerCode = undefined;
    }


}