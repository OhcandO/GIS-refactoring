/**
 * <MO_GIS>
 * MindOne GIS Openlayers 라이브러리 최적 사용을 위한 JS 모듈화 프로젝트
 * 그 중 entry point 로서 사용하기 위한 core 파일
 */



//1. fetch GIS setting from server

//2. base layer 구성

const map = new ol.Map({
    layers : [
        new ol.layer.Tile({
            source : new ol.source.OSM()
        })
    ],
    target:'map',
    view : new ol.View({
        center: [0,0],
        zoom:2,
    }
    )
});
