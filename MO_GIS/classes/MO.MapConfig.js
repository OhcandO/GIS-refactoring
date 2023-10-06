import Control from "../../lib/openlayers_v7.5.1/control/Control.js";


export class MOMapConfig {
    
   #default_viewSpec = {
        /**
         * Openlayers 뷰 포트 객체가 표현하는 좌표계.
         * 배경지도의 원본 좌표계를 설정해 이미지가 열화 없이 표출되도록 함
         * @default 'EPSG:4326' vworld 배경지도 좌표계
         * @memberof MOMapConfig
         */
        VIEW_CRS: `EPSG:3857`, //google map projected Pseudo-Mercator coordinate system. Also Vworld basemap coordinate
        /** mindone */
        CENTER: [127.043879, 37.482099], 
    };

    #default_mapSpec = {
        /** Map 이 생성될 기본 DIV id */
        target: 'map',


    };

    /**
     *
     * @param {mapSpec} mapSpec
     */
    constructor(mapSpec) {
        if (mapSpec) {
            
        } else {
            Object.assign(this, this.#config_base);
        }
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
