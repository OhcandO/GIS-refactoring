/**
 *  VWORLD WebMapTileService (WMTS) 사용위해 적합한 API 로 ol/source/WMTS 객체 더미를 반환
 *  ['Base', 'gray', 'Satellite', 'Hybrid', 'midnight']
 * @since vworld 공식 홈페이지에서 WMTS getCompatibilities 방식으로 xml fetch하여 사용하려 했으나, CORS 제한으로 인해 fetch 내용을 장황하게 늘려씀
 *
 * @export
 * @param {String} apiKey vworld 에서 발급받은 WMTS 가능한 API KEY
 * @return {Object} ol/source/WMTS constructor parameter 로 사용가능한 object
 */

export function get_wmts_source_vworld (apiKey) {
    if(!apiKey){
        throw new Error(`API KEY 입력되어야 함`);
    }else{
        return {
            get Base(){
                return {
                    "urls": [
                        `http://api.vworld.kr/req/wmts/1.0.0/${apiKey}/Base/{TileMatrix}/{TileRow}/{TileCol}.png`
                    ],
                    "layer": "Base",
                    "matrixSet": "GoogleMapsCompatible",
                    "format": "image/png",
                    "projection": {
                        "code_": "EPSG:3857",
                        "units_": "m",
                        "extent_": [
                            -20037508.342789244,
                            -20037508.342789244,
                            20037508.342789244,
                            20037508.342789244
                        ],
                        "worldExtent_": [
                            -180,
                            -85,
                            180,
                            85
                        ],
                        "axisOrientation_": "enu",
                        "global_": true,
                        "canWrapX_": true,
                        "defaultTileGrid_": null
                    },
                    "requestEncoding": "REST",
                    "tileGrid": {
                        "minZoom": 0,
                        "resolutions_": [
                            2445.984905126,
                            1222.9924525615997,
                            611.4962262807999,
                            305.74811314039994,
                            152.87405657047998,
                            76.43702828523999,
                            38.21851414248,
                            19.109257071295996,
                            9.554628535647998,
                            4.777314267823999,
                            2.3886571339119995,
                            1.1943285669559998,
                            0.5971642834779999,
                            0.2985821417376
                        ],
                        "maxZoom": 13,
                        "origin_": null,
                        "origins_": [
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ]
                        ],
                        "tileSizes_": [
                            256,
                            256,
                            256,
                            256,
                            256,
                            256,
                            256,
                            256,
                            256,
                            256,
                            256,
                            256,
                            256,
                            256
                        ],
                        "tileSize_": null,
                        "extent_": [
                            -20037508.3428,
                            -20037508.342784382,
                            20037508.342784382,
                            20037508.3428
                        ],
                        "fullTileRanges_": [
                            {
                                "minX": 0,
                                "maxX": 63,
                                "minY": 0,
                                "maxY": 63
                            },
                            {
                                "minX": 0,
                                "maxX": 127,
                                "minY": 0,
                                "maxY": 127
                            },
                            {
                                "minX": 0,
                                "maxX": 255,
                                "minY": 0,
                                "maxY": 255
                            },
                            {
                                "minX": 0,
                                "maxX": 511,
                                "minY": 0,
                                "maxY": 511
                            },
                            {
                                "minX": 0,
                                "maxX": 1023,
                                "minY": 0,
                                "maxY": 1023
                            },
                            {
                                "minX": 0,
                                "maxX": 2047,
                                "minY": 0,
                                "maxY": 2047
                            },
                            {
                                "minX": 0,
                                "maxX": 4095,
                                "minY": 0,
                                "maxY": 4095
                            },
                            {
                                "minX": 0,
                                "maxX": 8191,
                                "minY": 0,
                                "maxY": 8191
                            },
                            {
                                "minX": 0,
                                "maxX": 16383,
                                "minY": 0,
                                "maxY": 16383
                            },
                            {
                                "minX": 0,
                                "maxX": 32767,
                                "minY": 0,
                                "maxY": 32767
                            },
                            {
                                "minX": 0,
                                "maxX": 65535,
                                "minY": 0,
                                "maxY": 65535
                            },
                            {
                                "minX": 0,
                                "maxX": 131071,
                                "minY": 0,
                                "maxY": 131071
                            },
                            {
                                "minX": 0,
                                "maxX": 262143,
                                "minY": 0,
                                "maxY": 262143
                            },
                            {
                                "minX": 0,
                                "maxX": 524287,
                                "minY": 0,
                                "maxY": 524287
                            }
                        ],
                        "tmpSize_": [
                            256,
                            256
                        ],
                        "tmpExtent_": [
                            0,
                            0,
                            0,
                            0
                        ],
                        "matrixIds_": [
                            "6",
                            "7",
                            "8",
                            "9",
                            "10",
                            "11",
                            "12",
                            "13",
                            "14",
                            "15",
                            "16",
                            "17",
                            "18",
                            "19"
                        ]
                    },
                    "style": "default",
                    "dimensions": {},
                    "wrapX": false
                }
            },
            get gray(){
                return {
                    "urls": [
                        `http://api.vworld.kr/req/wmts/1.0.0/${apiKey}/gray/{TileMatrix}/{TileRow}/{TileCol}.png`
                    ],
                    "layer": "gray",
                    "matrixSet": "GoogleMapsCompatible",
                    "format": "image/png",
                    "projection": {
                        "code_": "EPSG:3857",
                        "units_": "m",
                        "extent_": [
                            -20037508.342789244,
                            -20037508.342789244,
                            20037508.342789244,
                            20037508.342789244
                        ],
                        "worldExtent_": [
                            -180,
                            -85,
                            180,
                            85
                        ],
                        "axisOrientation_": "enu",
                        "global_": true,
                        "canWrapX_": true,
                        "defaultTileGrid_": null
                    },
                    "requestEncoding": "REST",
                    "tileGrid": {
                        "minZoom": 0,
                        "resolutions_": [
                            2445.984905126,
                            1222.9924525615997,
                            611.4962262807999,
                            305.74811314039994,
                            152.87405657047998,
                            76.43702828523999,
                            38.21851414248,
                            19.109257071295996,
                            9.554628535647998,
                            4.777314267823999,
                            2.3886571339119995,
                            1.1943285669559998,
                            0.5971642834779999,
                            0.2985821417376
                        ],
                        "maxZoom": 13,
                        "origin_": null,
                        "origins_": [
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ]
                        ],
                        "tileSizes_": [
                            256,
                            256,
                            256,
                            256,
                            256,
                            256,
                            256,
                            256,
                            256,
                            256,
                            256,
                            256,
                            256,
                            256
                        ],
                        "tileSize_": null,
                        "extent_": [
                            -20037508.3428,
                            -20037508.342784382,
                            20037508.342784382,
                            20037508.3428
                        ],
                        "fullTileRanges_": [
                            {
                                "minX": 0,
                                "maxX": 63,
                                "minY": 0,
                                "maxY": 63
                            },
                            {
                                "minX": 0,
                                "maxX": 127,
                                "minY": 0,
                                "maxY": 127
                            },
                            {
                                "minX": 0,
                                "maxX": 255,
                                "minY": 0,
                                "maxY": 255
                            },
                            {
                                "minX": 0,
                                "maxX": 511,
                                "minY": 0,
                                "maxY": 511
                            },
                            {
                                "minX": 0,
                                "maxX": 1023,
                                "minY": 0,
                                "maxY": 1023
                            },
                            {
                                "minX": 0,
                                "maxX": 2047,
                                "minY": 0,
                                "maxY": 2047
                            },
                            {
                                "minX": 0,
                                "maxX": 4095,
                                "minY": 0,
                                "maxY": 4095
                            },
                            {
                                "minX": 0,
                                "maxX": 8191,
                                "minY": 0,
                                "maxY": 8191
                            },
                            {
                                "minX": 0,
                                "maxX": 16383,
                                "minY": 0,
                                "maxY": 16383
                            },
                            {
                                "minX": 0,
                                "maxX": 32767,
                                "minY": 0,
                                "maxY": 32767
                            },
                            {
                                "minX": 0,
                                "maxX": 65535,
                                "minY": 0,
                                "maxY": 65535
                            },
                            {
                                "minX": 0,
                                "maxX": 131071,
                                "minY": 0,
                                "maxY": 131071
                            },
                            {
                                "minX": 0,
                                "maxX": 262143,
                                "minY": 0,
                                "maxY": 262143
                            },
                            {
                                "minX": 0,
                                "maxX": 524287,
                                "minY": 0,
                                "maxY": 524287
                            }
                        ],
                        "tmpSize_": [
                            256,
                            256
                        ],
                        "tmpExtent_": [
                            0,
                            0,
                            0,
                            0
                        ],
                        "matrixIds_": [
                            "6",
                            "7",
                            "8",
                            "9",
                            "10",
                            "11",
                            "12",
                            "13",
                            "14",
                            "15",
                            "16",
                            "17",
                            "18",
                            "19"
                        ]
                    },
                    "style": "default",
                    "dimensions": {},
                    "wrapX": false
                }
            },
            get Satellite(){
                return {
                    "urls": [
                        `http://api.vworld.kr/req/wmts/1.0.0/${apiKey}/Satellite/{TileMatrix}/{TileRow}/{TileCol}.jpeg`
                    ],
                    "layer": "Satellite",
                    "matrixSet": "GoogleMapsCompatible",
                    "format": "image/jpeg",
                    "projection": {
                        "code_": "EPSG:3857",
                        "units_": "m",
                        "extent_": [
                            -20037508.342789244,
                            -20037508.342789244,
                            20037508.342789244,
                            20037508.342789244
                        ],
                        "worldExtent_": [
                            -180,
                            -85,
                            180,
                            85
                        ],
                        "axisOrientation_": "enu",
                        "global_": true,
                        "canWrapX_": true,
                        "defaultTileGrid_": null
                    },
                    "requestEncoding": "REST",
                    "tileGrid": {
                        "minZoom": 0,
                        "resolutions_": [
                            2445.984905126,
                            1222.9924525615997,
                            611.4962262807999,
                            305.74811314039994,
                            152.87405657047998,
                            76.43702828523999,
                            38.21851414248,
                            19.109257071295996,
                            9.554628535647998,
                            4.777314267823999,
                            2.3886571339119995,
                            1.1943285669559998,
                            0.5971642834779999,
                            0.2985821417376
                        ],
                        "maxZoom": 13,
                        "origin_": null,
                        "origins_": [
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ]
                        ],
                        "tileSizes_": [
                            256,
                            256,
                            256,
                            256,
                            256,
                            256,
                            256,
                            256,
                            256,
                            256,
                            256,
                            256,
                            256,
                            256
                        ],
                        "tileSize_": null,
                        "extent_": [
                            -20037508.3428,
                            -20037508.342784382,
                            20037508.342784382,
                            20037508.3428
                        ],
                        "fullTileRanges_": [
                            {
                                "minX": 0,
                                "maxX": 63,
                                "minY": 0,
                                "maxY": 63
                            },
                            {
                                "minX": 0,
                                "maxX": 127,
                                "minY": 0,
                                "maxY": 127
                            },
                            {
                                "minX": 0,
                                "maxX": 255,
                                "minY": 0,
                                "maxY": 255
                            },
                            {
                                "minX": 0,
                                "maxX": 511,
                                "minY": 0,
                                "maxY": 511
                            },
                            {
                                "minX": 0,
                                "maxX": 1023,
                                "minY": 0,
                                "maxY": 1023
                            },
                            {
                                "minX": 0,
                                "maxX": 2047,
                                "minY": 0,
                                "maxY": 2047
                            },
                            {
                                "minX": 0,
                                "maxX": 4095,
                                "minY": 0,
                                "maxY": 4095
                            },
                            {
                                "minX": 0,
                                "maxX": 8191,
                                "minY": 0,
                                "maxY": 8191
                            },
                            {
                                "minX": 0,
                                "maxX": 16383,
                                "minY": 0,
                                "maxY": 16383
                            },
                            {
                                "minX": 0,
                                "maxX": 32767,
                                "minY": 0,
                                "maxY": 32767
                            },
                            {
                                "minX": 0,
                                "maxX": 65535,
                                "minY": 0,
                                "maxY": 65535
                            },
                            {
                                "minX": 0,
                                "maxX": 131071,
                                "minY": 0,
                                "maxY": 131071
                            },
                            {
                                "minX": 0,
                                "maxX": 262143,
                                "minY": 0,
                                "maxY": 262143
                            },
                            {
                                "minX": 0,
                                "maxX": 524287,
                                "minY": 0,
                                "maxY": 524287
                            }
                        ],
                        "tmpSize_": [
                            256,
                            256
                        ],
                        "tmpExtent_": [
                            0,
                            0,
                            0,
                            0
                        ],
                        "matrixIds_": [
                            "6",
                            "7",
                            "8",
                            "9",
                            "10",
                            "11",
                            "12",
                            "13",
                            "14",
                            "15",
                            "16",
                            "17",
                            "18",
                            "19"
                        ]
                    },
                    "style": "default",
                    "dimensions": {},
                    "wrapX": false
                }
            },
            get Hybrid(){
                return {
                    "urls": [
                        `http://api.vworld.kr/req/wmts/1.0.0/${apiKey}/Hybrid/{TileMatrix}/{TileRow}/{TileCol}.png`
                    ],
                    "layer": "Hybrid",
                    "matrixSet": "GoogleMapsCompatible",
                    "format": "image/png",
                    "projection": {
                        "code_": "EPSG:3857",
                        "units_": "m",
                        "extent_": [
                            -20037508.342789244,
                            -20037508.342789244,
                            20037508.342789244,
                            20037508.342789244
                        ],
                        "worldExtent_": [
                            -180,
                            -85,
                            180,
                            85
                        ],
                        "axisOrientation_": "enu",
                        "global_": true,
                        "canWrapX_": true,
                        "defaultTileGrid_": null
                    },
                    "requestEncoding": "REST",
                    "tileGrid": {
                        "minZoom": 0,
                        "resolutions_": [
                            2445.984905126,
                            1222.9924525615997,
                            611.4962262807999,
                            305.74811314039994,
                            152.87405657047998,
                            76.43702828523999,
                            38.21851414248,
                            19.109257071295996,
                            9.554628535647998,
                            4.777314267823999,
                            2.3886571339119995,
                            1.1943285669559998,
                            0.5971642834779999,
                            0.2985821417376
                        ],
                        "maxZoom": 13,
                        "origin_": null,
                        "origins_": [
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ],
                            [
                                -20037508.3428,
                                20037508.3428
                            ]
                        ],
                        "tileSizes_": [
                            256,
                            256,
                            256,
                            256,
                            256,
                            256,
                            256,
                            256,
                            256,
                            256,
                            256,
                            256,
                            256,
                            256
                        ],
                        "tileSize_": null,
                        "extent_": [
                            -20037508.3428,
                            -20037508.342784382,
                            20037508.342784382,
                            20037508.3428
                        ],
                        "fullTileRanges_": [
                            {
                                "minX": 0,
                                "maxX": 63,
                                "minY": 0,
                                "maxY": 63
                            },
                            {
                                "minX": 0,
                                "maxX": 127,
                                "minY": 0,
                                "maxY": 127
                            },
                            {
                                "minX": 0,
                                "maxX": 255,
                                "minY": 0,
                                "maxY": 255
                            },
                            {
                                "minX": 0,
                                "maxX": 511,
                                "minY": 0,
                                "maxY": 511
                            },
                            {
                                "minX": 0,
                                "maxX": 1023,
                                "minY": 0,
                                "maxY": 1023
                            },
                            {
                                "minX": 0,
                                "maxX": 2047,
                                "minY": 0,
                                "maxY": 2047
                            },
                            {
                                "minX": 0,
                                "maxX": 4095,
                                "minY": 0,
                                "maxY": 4095
                            },
                            {
                                "minX": 0,
                                "maxX": 8191,
                                "minY": 0,
                                "maxY": 8191
                            },
                            {
                                "minX": 0,
                                "maxX": 16383,
                                "minY": 0,
                                "maxY": 16383
                            },
                            {
                                "minX": 0,
                                "maxX": 32767,
                                "minY": 0,
                                "maxY": 32767
                            },
                            {
                                "minX": 0,
                                "maxX": 65535,
                                "minY": 0,
                                "maxY": 65535
                            },
                            {
                                "minX": 0,
                                "maxX": 131071,
                                "minY": 0,
                                "maxY": 131071
                            },
                            {
                                "minX": 0,
                                "maxX": 262143,
                                "minY": 0,
                                "maxY": 262143
                            },
                            {
                                "minX": 0,
                                "maxX": 524287,
                                "minY": 0,
                                "maxY": 524287
                            }
                        ],
                        "tmpSize_": [
                            256,
                            256
                        ],
                        "tmpExtent_": [
                            0,
                            0,
                            0,
                            0
                        ],
                        "matrixIds_": [
                            "6",
                            "7",
                            "8",
                            "9",
                            "10",
                            "11",
                            "12",
                            "13",
                            "14",
                            "15",
                            "16",
                            "17",
                            "18",
                            "19"
                        ]
                    },
                    "style": "default",
                    "dimensions": {},
                    "wrapX": false
                }
            },
            get midnight(){
                return {
                    urls: [
                        `http://api.vworld.kr/req/wmts/1.0.0/${apiKey}/midnight/{TileMatrix}/{TileRow}/{TileCol}.png`,
                    ],
                    layer: "midnight",
                    matrixSet: "GoogleMapsCompatible",
                    format: "image/png",
                    projection: {
                        code_: "EPSG:3857",
                        units_: "m",
                        extent_: [-20037508.342789244, -20037508.342789244, 20037508.342789244,20037508.342789244,],
                        worldExtent_: [-180, -85, 180, 85],
                        axisOrientation_: "enu",
                        global_: true,
                        canWrapX_: true,
                        defaultTileGrid_: null,
                    },
                    requestEncoding: "REST",
                    tileGrid: {
                        minZoom: 0,
                        resolutions_: [
                            2445.984905126, 1222.9924525615997, 611.4962262807999,
                            305.74811314039994, 152.87405657047998, 76.43702828523999,
                            38.21851414248, 19.109257071295996, 9.554628535647998,
                            4.777314267823999, 2.3886571339119995, 1.1943285669559998,
                            0.5971642834779999, 0.2985821417376,
                        ],
                        maxZoom: 13,
                        origin_: null,
                        origins_: [
                            [-20037508.3428, 20037508.3428],
                            [-20037508.3428, 20037508.3428],
                            [-20037508.3428, 20037508.3428],
                            [-20037508.3428, 20037508.3428],
                            [-20037508.3428, 20037508.3428],
                            [-20037508.3428, 20037508.3428],
                            [-20037508.3428, 20037508.3428],
                            [-20037508.3428, 20037508.3428],
                            [-20037508.3428, 20037508.3428],
                            [-20037508.3428, 20037508.3428],
                            [-20037508.3428, 20037508.3428],
                            [-20037508.3428, 20037508.3428],
                            [-20037508.3428, 20037508.3428],
                            [-20037508.3428, 20037508.3428],
                        ],
                        tileSizes_: [
                            256, 256, 256, 256, 256, 256, 256, 256, 256, 256, 256, 256, 256,
                            256,
                        ],
                        tileSize_: null,
                        extent_: [
                            -20037508.3428, -20037508.342784382, 20037508.342784382,
                            20037508.3428,
                        ],
                        fullTileRanges_: [
                            {
                                minX: 0,
                                maxX: 63,
                                minY: 0,
                                maxY: 63,
                            },
                            {
                                minX: 0,
                                maxX: 127,
                                minY: 0,
                                maxY: 127,
                            },
                            {
                                minX: 0,
                                maxX: 255,
                                minY: 0,
                                maxY: 255,
                            },
                            {
                                minX: 0,
                                maxX: 511,
                                minY: 0,
                                maxY: 511,
                            },
                            {
                                minX: 0,
                                maxX: 1023,
                                minY: 0,
                                maxY: 1023,
                            },
                            {
                                minX: 0,
                                maxX: 2047,
                                minY: 0,
                                maxY: 2047,
                            },
                            {
                                minX: 0,
                                maxX: 4095,
                                minY: 0,
                                maxY: 4095,
                            },
                            {
                                minX: 0,
                                maxX: 8191,
                                minY: 0,
                                maxY: 8191,
                            },
                            {
                                minX: 0,
                                maxX: 16383,
                                minY: 0,
                                maxY: 16383,
                            },
                            {
                                minX: 0,
                                maxX: 32767,
                                minY: 0,
                                maxY: 32767,
                            },
                            {
                                minX: 0,
                                maxX: 65535,
                                minY: 0,
                                maxY: 65535,
                            },
                            {
                                minX: 0,
                                maxX: 131071,
                                minY: 0,
                                maxY: 131071,
                            },
                            {
                                minX: 0,
                                maxX: 262143,
                                minY: 0,
                                maxY: 262143,
                            },
                            {
                                minX: 0,
                                maxX: 524287,
                                minY: 0,
                                maxY: 524287,
                            },
                        ],
                        tmpSize_: [256, 256],
                        tmpExtent_: [0, 0, 0, 0],
                        matrixIds_: [
                            "6",
                            "7",
                            "8",
                            "9",
                            "10",
                            "11",
                            "12",
                            "13",
                            "14",
                            "15",
                            "16",
                            "17",
                            "18",
                            "19",
                        ],
                    },
                    style: "default",
                    dimensions: {},
                    wrapX: false,
                }
            }
        }
    }
};