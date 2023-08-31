/**
 * 지도 기본 설정 및 서버 통한 Fetch 작업
 */

"use strict";
/*
const config_base = {
    URL: ``,
    CRS: `EPSG:3857`, //google map projected Pseudo-Mercator coordinate systme
    CENTER: [127.043879, 37.482099], //mindone
};

const config = {
    URL: ``,
    CRS: `EPSG:3857`, //google map projected Pseudo-Mercator coordinate systme
    CENTER: [127.043879, 37.482099], //mindone
};

function getBaseConfig(url) {
    getBaseSetting(url)
        .then((jsonData) => {
            const returnConfig = Object.assign({}, config_base, jsonData);
            return returnConfig;
        })
        .catch((e) => {
            console.error(e);
        });
}

async function getBaseSetting(url) {
    const json = await fetch(url).json();
    return await json.data;
}
*/
export const confObj = {

    /**
     * @param {string} config_base.SRC_URL   `http://xdworld.vworld.kr:8080/2d/Base/service/{z}/{x}/{y}.png`
     * @param {String} CRS  `EPSG:3857`
     * @param {Array} CENTER  [127.043879, 37.482099]
    */
    config_base : {
        SRC_URL: `http://xdworld.vworld.kr:8080/2d/Base/service/{z}/{x}/{y}.png`,
        CRS: `EPSG:3857`, //google map projected Pseudo-Mercator coordinate systme
        CENTER: [127.043879, 37.482099], //mindone
    },

    config : {
        SRC_URL: ``,
        CRS: `EPSG:3857`, //google map projected Pseudo-Mercator coordinate systme
        CENTER: [127.043879, 37.482099], //mindone
    },

    getBaseConfig :function(url) {
        getBaseSetting(url)
            .then((jsonData) => {
                const returnConfig = Object.assign({}, config_base, jsonData);
                return returnConfig;
            })
            .catch((e) => {
                console.error(e);
            });
    },

    _getBaseSetting: async function(url) {
        const json = await fetch(url).json();
        return await json.data;
    },
}