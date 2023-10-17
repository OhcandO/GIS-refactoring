export class MOFactory{
 
    // static layerSpec;
    layerSpec;

    /**
     * 개별 레이어+소스+스타일 설정 정보를 등록함
     *
     * @param {*} inputLayerSpec
     * @memberof MOFactory
     */
    setSpec(inputLayerSpec) {
        if (!inputLayerSpec) throw new Error (`layerSpec 입력 안됨`)
        this.resetFactory();
        // object 에서 value 값이 있는 것들만 등록함
        this.layerSpec = Object.fromEntries(Object.entries(inputLayerSpec).filter(([k,v])=>v)); 
    }
    /**
     * 개별 레이어+소스+스타일 설정 정보를 불러옴
     *
     * @return {*} 
     * @memberof MOFactory
     */
    getSpec(){
        if(this.layerSpec) return this.layerSpec;
        else{throw new Error(`팩토리에 작업지시서 입력 안됨 (recipe)`)}
    }

    /** default Object에 source Object 를 합치되,
     *  Default Object Key 들만 수행
     *  결과적으로 Default Object의 키만 유효하게 남음
     *  @param {Object} small_obj '기준 key'들이 있는 객체
     *  @param {Object} big_obj '기준 key' 의 값을 찾을 객체
     */ 
    #getMergedObject(small_obj, big_obj){
        return Object.entries(small_obj).reduce((pre,[key,val])=>(pre[key]=big_obj[key]?big_obj[key]:val, pre),{});
    }
    
    getDefaultMergedObject(sourceObj){
        return this.#getMergedObject(sourceObj, this.layerSpec);
        // return this.#getMergedObject(sourceObj, this.constructor.layerSpec);
    }

    /**
     * factory 객체 내부 변수 초기화
     * 상속 클래스에서 메서드 확장 용도
     * @memberof MOFactory
     */
    resetFactory(){
        this.layerSpec = undefined;
    }


}