export class MOFactory{
 
    #Recipe;

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
        this.#Recipe = Object.fromEntries(Object.entries(inputLayerSpec).filter(([k,v])=>v)); 
    }

    /**
     * 개별 레이어+소스+스타일 설정 정보를 불러옴
     *
     * @return {*} 
     * @memberof MOFactory
     */
    getSpec(){
        if(this.#Recipe) return this.#Recipe;
        else{throw new Error(`팩토리에 작업지시서 입력 안됨 (recipe)`)}
    }

    /**
     * factory 객체 내부 변수 초기화
     * 상속 클래스에서 메서드 확장 용도
     * @memberof MOFactory
     */
    resetFactory(){
        
        this.#Recipe = undefined;
    }
}