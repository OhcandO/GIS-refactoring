/**
 * 각 레이어의 기본 설정을 담당하는 설정 객체.
 *  DB 에 저장된 내용을 불러오는 것 외에
 *  레이서 source url 정돈하는 것도 담당
 *
 * @export
 * @class MOLayerConfig
 */

/*
TODO : openlayers layer 및 style 객체 key 값들 정리

*/

export class MOLayerConfig {

    #default_leyerSpec={
        zIndex:5,
        opacity:1,
        cqlFilter:null,
    }
    #tempLayerSpec

    /**
     *
     * @param {mapSpec} mapSpec
     */
    constructor(layerSpec) {
        this.#tempLayerSpec=  Object.assign(this.#default_leyerSpec,layerSpec);

        //TODO 바로 layer 파라미터로 사용할 수 있도록 구성

    }

    /**
     * 사용할 수 있는 Openlayers source 객체의 url 을 구성함
     *
     * @param {Object} layerSpec
     * @return {String} Openlayers source 파라미터로 사용할 수 있는 URL 폼
     * @memberof MOLayerConfig
     */
    buildSourceURL (layerSpec){
        let sourceType;
        let domain;
        let returnURL;
        try{
            domain = layerSpec.get(`domain`); //vworld, geoserver, emap etc.
            sourceType = layerSpec.get(`sourceType`); //vector, xyz, wmts etc.
        }catch(e){
            console.group(`"domain" 및 "source_type" 지정안됨`)
            console.table(layerSpec);
            console.groupEnd();
            throw new Error(`"domain" 및 "source_type" 지정안됨`)
        }
        try{
            returnURL = this.#urlBuilder(domain,sourceType);
        }catch(e){
            console.group(`유효하지 않은 domain, sourceType 지정`)
            console.table(layerSpec);
            console.groupEnd();
            throw new Error(`유효하지 않은 domain, sourceType 지정`)
        }finally{
            return returnURL;
        }

    }

    #urlBuilder(domain, sourceType){
        let returnURL;
        if(domain, sourceType){
            if(domain == `geoserver` && sourceType == `vector`){
                returnURL = this.#urlBuilder_geoserver();
            }
        }else{
            console.log(`정의되지 않은 domain, sourceType`);
            console.log(domain, sourceType);
            throw new Error(`정의되지 않은 domain, sourceType`);
        }
        return returnURL;
    }

    #urlBuilder_geoserver(){
        let returnURL='';
        const sourceUrl = this.#tempLayerSpec['sourceUrl'];
        
        return returnURL;
    }
}
