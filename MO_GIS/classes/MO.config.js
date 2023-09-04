/**
 * 지도 기본 설정 및 서버 통한 Fetch 작업
 * 지도 객체 하나 당 하나의 세팅
 * 이 객체 내부에 딸릴 레이어의 정보가 들어가야 함
 */


/**
 * @typedef {Object} mapSpec
 * @property {String} [VIEW_CRS=`EPSG:3857`] 뷰포트에 적용할 CRS (예 : "EPSG:5181")
 * @property {Array<number>} [CENTER=[127.043879, 37.482099]] 중심좌표 [x(longitude, 경도), y(latitude, 위도)]
 * 
 */

export class MOMapConfig {
    VIEW_CRS;
    CENTER;
    LAYERS;

    /**
     * @param {string} config_base.SRC_URL   `http://xdworld.vworld.kr:8080/2d/Base/service/{z}/{x}/{y}.png`
     * @param {String} CRS  `EPSG:3857`
     * @param {Array} CENTER  [127.043879, 37.482099]
     */
    #config_base = {
        VIEW_CRS: `EPSG:3857`, //google map projected Pseudo-Mercator coordinate system. Also Vworld basemap coordinate
        CENTER: [127.043879, 37.482099], //mindone
        LAYERS: {
            BASE: {
                SRC_URL: `http://xdworld.vworld.kr:8080/2d/Base/service/{z}/{x}/{y}.png`,
                SRC_CRS: `EPSG:3857`,
                SRC_MAX_ZOOM: 19,
            },
            SATELLITE: {
                SRC_URL: `http://xdworld.vworld.kr:8080/2d/Satellite/service/{z}/{x}/{y}.jpeg`,
                SRC_CRS: `EPSG:3857`,
                SRC_MAX_ZOOM: 19,
            },
        },
    };

    /**
     *
     * @param {mapSpec} mapSpec
     */
    constructor(mapSpec) {
        if (mapSpec.CENTER) {
            this.CENTER=mapSpec.CENTER;
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
