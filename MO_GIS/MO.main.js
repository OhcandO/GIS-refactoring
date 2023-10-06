/**
 * <MO_GIS>
 * MindOne GIS Openlayers 라이브러리 최적 사용을 위한 JS 모듈화 프로젝트
 * 그 중 entry point 로서 사용하기 위한 core 파일
 */
import { MOSourceConfig } from "./classes/MO.SourceConfig.js";
import Map from "../lib/openlayers_v7.5.1/Map.js";
import TileLayer from '../lib/openlayers_v7.5.1/layer/Tile.js';
import View from "../lib/openlayers_v7.5.1/View.js";

const layerSpec = {
    base: {
        sourceType: "wmts",
        category: "vworld",
        origin: "https://api.vworld.kr",
        sourcePathname: "./external/vworld_getCompatibilities.xml",
        srid: "EPSG:3857",
        apiKey: "B58E48FE-683E-3E7E-B91C-2F912512FE60",
        layerTitle: "vworld_base",
        typeName: "Base",
        cqlfilter: null,
        BOOL_USE_YN: "Y",
        BOOL_ISGROUP: null,
        BOOL_SELECTABLE: null,
        BOOL_EDITABLE: null,
        BOOL_ISDEFAULT: "Y",
        BOOL_DOWNLOAD: null,
    },
    sate: {
        sourceType: "wmts",
        category: "vworld",
        origin: "https://api.vworld.kr",
        sourcePathname: "./external/vworld_getCompatibilities.xml",
        srid: "EPSG:3857",
        apiKey: "B58E48FE-683E-3E7E-B91C-2F912512FE60",
        layerTitle: "vworld_Satellite",
        typeName: "Satellite",
        cqlfilter: null,
        BOOL_USE_YN: "Y",
        BOOL_ISGROUP: null,
        BOOL_SELECTABLE: null,
        BOOL_EDITABLE: null,
        BOOL_ISDEFAULT: "N",
        BOOL_DOWNLOAD: null,
    },
};

let wmtsSource = new MOSourceConfig(layerSpec.sate);

let map = new Map({
    target: "map",
    layers: [],
    view: new View({
        center: [14144137.024974, 4465661.394248],
        zoom: 11,
        projection: "EPSG:3857",
    }),
});

map.addLayer(new TileLayer({source: wmtsSource}));

globalThis.map = map;
