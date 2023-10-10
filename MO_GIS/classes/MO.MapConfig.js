import Control from "../../lib/openlayers_v7.5.1/control/Control.js";
import Map from '../../lib/openlayers_v7.5.1/Map.js'
import View from '../../lib/openlayers_v7.5.1/View.js'

export class MOMapConfig extends Map{
    
    #default_viewSpec = {
        /**
         * Openlayers 뷰 포트 객체가 표현하는 좌표계.
         * 배경지도의 원본 좌표계를 설정해 이미지가 열화 없이 표출되도록 함
         * @default 'EPSG:4326' vworld 배경지도 좌표계
         * @memberof MOMapConfig
         */
        projection: `EPSG:3857`, //google map projected Pseudo-Mercator coordinate system. Also Vworld basemap coordinate
        /** mindone */
        center: [127.043879, 37.482099], 
        enableRotation : false,
    };

    #default_mapSpec = {
        /** Map 이 생성될 기본 DIV id */
        target: 'map',
    };

    #KEY_DIV_ID_FOR_MAP = ``
    /**
     * 입력한 변수들을 Map 또는 View 객체 생성을 위한 변수로 할당
     * @param {Object} mapConfigSpec Map 또는 View 객체 생성을 위한 key-value Object 
     */
    constructor(mapConfigSpec) {
        if (mapConfigSpec) {
            Object.entries(this.#default_mapSpec).forEach(([key,val])=>{
                if(this.#default_mapSpec[key]) this.#default_mapSpec[key] = val;
            });
        } 
        // 결과로서 Map 객체를 반환
        
    }

    get mapInstance(){
        return super({
            target: this.#default_mapSpec[]
            view : new View(this.#default_viewSpec),
            
        });
    }
    async #getBaseSetting(url) {
        try {
            const json = await fetch(url).json();
            return await json.data;
        } catch (e) {
            console.log(e);
        } finally {
        }
    }

    getBaseConfig(url) {
        this.#getBaseSetting(url)
            .then((jsonData) => {
                const returnConfig = Object.assign({}, config_base, jsonData);
                return returnConfig;
            })
            .catch((e) => {
                console.error(e);
                Object.assign(this, this.#config_base);
            });
    }
}
