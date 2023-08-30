/*
관망도 편집 화면 javascript
Openlayers 6 기반으로 작성
*/
 
let facilityData = "";
let updateFlag= 0;     //오버레이 [수정]버튼 활성 여부
let    insertFlag= 0;     //오버레이 [등록]버튼 활성 여부
const DIV_FOR_FACLITY_DETAIL = 'mapModFacilityDetail';
/**
 * ======================================================================================================
 * 화면 로드시 실행 
 * 시작
 * ======================================================================================================
 */
//$(document).ready(function (){
document.addEventListener('DOMContentLoaded',function(){    
    //레이어 계층정보(tree) 불러오기
    $.ajax({
        url: "/tree2.do",
        type: "GET",
        datatype: "JSON",
        async: false,
        contentType: 'application/json',
        success: function(result) {
            let data = result.data;
            GisApp.setLayerInfos(data);
        },
        error: function(request, error) {
            alert("시스템 오류입니다. 잠시 후 다시 접속하시기 바랍니다.");
            console.log("[ message: " + request.responseText + "\nerror:" + error + "]");
        }
    });
    
//    ui_commonInit_gnb.init();
//    $('[data-menu-depth="gisInfo"]').click();
    
    //좌측 트리 팝업 [블럭운영관리] [레이어] 활성화
    fcltyOverlayer.init({targetId:DIV_FOR_FACLITY_DETAIL});
    mapModifier.init();
    //좌측 메뉴 - [레이어]의 '블록'노드 접기 (너무 길어짐)
//    setTimeout(function(){$("#tree-layer-control").jstree(true).toggle_node(Object.values(GisApp.layerCode).find(el => el.fullname === '블록').id);}, 500);
    
});
/**
 * ======================================================================================================
 * 화면 로드시 실행 
 * 종료
 * ======================================================================================================
 */
 
 //메뉴트리 레이어
/*var ui_commonInit_gnb = {
    dormTarget: {
        E_menuList: $('[data-menu-depth="one"] > li'),
        E_currentMenu: $('[data-menu-depth="one"] > li.on'),
        E_currentSubmenu: $('[data-menu-depth="one"] > li.on [data-menu-depth="two"]'),
        E_btn_currentSubmenu: $('[data-menu-depth="one"] > li.on [data-menu-depth="two"] [data-menu-button="close"]'),
        E_btn_mapInfo: $('[data-menu-depth="gisInfo"]'),
        E_mapInfoLayer: $('[data-toggle-content="gisInfoLayer"]')
    },
    init: function() {
 
        var _this = this;
        _this.dormTarget = {
            E_menuList: $('[data-menu-depth="one"] > li'),
            E_currentMenu: $('[data-menu-depth="one"] > li.on'),
            E_currentSubmenu: $('[data-menu-depth="one"] > li.on [data-menu-depth="two"]'),
            E_btn_currentSubmenu: $('[data-menu-depth="one"] > li.on [data-menu-depth="two"] [data-menu-button="close"]'),
            E_btn_mapInfo: $('[data-menu-depth="gisInfo"]'),
            E_mapInfoLayer: $('[data-toggle-content="gisInfoLayer"]')
        }
 
        var E_menuList = _this.dormTarget.E_menuList;
        var E_btn_mapInfo = _this.dormTarget.E_btn_mapInfo;
 
        _this.gnbMapInfolEvent(E_btn_mapInfo, E_menuList, _this);
 
    },
    gnbMapInfolEvent: function(_btn_mapInfo, _menuList, _this) {
        $(_btn_mapInfo).on("click", function() {
 
            // gisInfo 레이어를 열려고 할때 GNB 서브메뉴가 열려 있다면 닫음처리.
            if (!$(_btn_mapInfo).hasClass('on') && _this.dormTarget.E_btn_currentSubmenu) {
 
                $('[data-menu-depth="one"] > li.on [data-menu-depth="two"] [data-menu-button="close"]').click();
                // _this.dormTarget.E_btn_currentSubmenu.click();
            }
            $(_btn_mapInfo).toggleClass("on");
            _this.dormTarget.E_mapInfoLayer.toggleClass('on');
 
            if ($('.map_info').hasClass('on')) {
                $(".map_info_layer").show(200);
                $('.bookmark_control, .edit_control, .select_control, .ol-scale-line').each(function() {
                    $(this).offset({ left: $(this).offset().left + 300 });
                });
            } else {
                $(".map_info_layer").hide(200);
                $('.bookmark_control, .edit_control, .select_control, .ol-scale-line').each(function() {
                    $(this).offset({ left: $(this).offset().left - 300 });
                });
            }
 
        });
 
    },
};*/
 
/**
모듈화된 함수들을 조합해 mapModifier.jsp 화면에 적용하는 bridge 역할 객체
모듈함수 1 : GisApp (오픈레이어스 지도 표출, 수정, 피쳐삭제 등)
모듈함수 2 : fcltyOverlayer (개별 피쳐에 대한 상세 정보 출력) 
 */
let mapModifier = {
    ol_map : null,
    ol_select : null,
    LayerOptions:{//예시
            WTL_SPLY_LS:{
                id: "WTL_SPLY_LS", isLayer: "Y", type: "POLYLINE", 
                selectable: "Y", visible: "N", editable: "Y",
                name: "급수관", typeName: "WTL_SPLY_LS", cqlFilter: "FTR_CDE='SAA005'", 
                labelColumn: "FTR_IDN", defStyle: "line", minZoom: 15,
                layerGroup: "SAA005", ftrCde: "SAA005", 
                linecolorr: 0, linecolorg: 102, linecolorb: 255, linecolora: 1, linewidth: 1
            },
    },
    
    init : function (){
 
        // 맵 생성 
        this.initMap(this);
        
    },    
    initMap : function (_this){
        let gisOptions = {
            targetId : 'map',
            zoom : null||17,
        };
        
        GisApp.Module.core = new GisApp.core(gisOptions);
        this.ol_map = GisApp.Module.core.map;
        GisApp.Module.core.scaleControl();
        GisApp.Module.core.mousePositionControl();
        
        GisApp.Module.select = new GisApp.select();
        _this.ol_select = GisApp.Module.select;
        //레이어 피쳐 (셀렉션) 수정
        
        //feature 편집
        GisApp.Module.edit = new GisApp.editLayer();
        //이전, 다음 
        GisApp.Module.history = new GisApp.history();
        //트리레이어 생성
        GisApp.Module.tree = new GisApp.tree();
        //오버레이 
        GisApp.Module.minimap = new GisApp.minimap();
        
        GisApp.Module.select.getSelectedInfo(function(features, layers) {
            GisApp.Module.core.deleteLayer("highLightFeature");
 
            if (GisApp.Module.edit.editFlag) {
                fcltyOverlayer.removeOverlayTemplate();
                return;
            }
 
            if (GisApp.Module.select.selectFeatureFlag) {
                let featureInfo = [];
                for (let i in features) {
                    let feature = features[i];
                    let properties = features[i].getProperties();
                    if (properties.FTR_IDS) {
                        featureInfo.push(properties);
                    }
                }
                //                getObjectInfo(featureInfo);
 
                /*개체가 그냥 선택되었다면, 시설정보 상세 조회이벤트 수행*/
            } else {
                if (features.length == 1) {
                    let properties = features[0].getProperties();
                    if (properties.FTR_IDS) {
                        let typeName = layers[0].get("typeName");
                        let ftr_ids = features[0].getProperties().FTR_IDS;
 
                        fcltyOverlayer.setOverlayTemplate(typeName, ftr_ids)
//                        .then(fcltyOverlayer.appendFormForComments)
                        .then(fcltyOverlayer.activateOverlayTemplate)
                        .then(mapModifier.fitViewToCurrFeature);
                        
//                        mapMod.fitViewToCurrFeature();
 
                    }
                } else if (features.length == 0) {
 
                    fcltyOverlayer.removeOverlayTemplate();
                }
            }
        });
        
        GisApp.Module.edit.save(function(data) {
            if (data.length === 0) {
                alert("변경된 내용이 없습니다.");
                return;
            }
            if (confirm("저장 하시겠습니까?")) {
				Object.assign(data,{srid:GisApp.SHP_PROJ});
				console.log(data);
	
                let param = {}
                param["data"] = JSON.stringify(data);
                $.ajax({
                    url: "/modSave",
                    dataType: "json",
                    data: param,
                    type: "post",
                    success: function(result) {
                        //저장 직후 FTR_IDS(PK)가 부여되고, 레이어 refresh()로 feature에 이를 반영
                        mapModifier.refreshAfterSave();
                        alert("저장하였습니다.");
                        GisApp.Module.edit.clearUndoRedo();
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.log('error : ' + textStatus);
                    }
                });
            }
        }); //save callback
        
        //최대 줌 레벨을 19.3 (리플렛의 최대 해상도) 로 바꾸는 이벤트 등록
        
        setTimeout(function() {
            $("#tree-layer-control").jstree(true).get_children_dom('1').each(function(index, el) {
                $("#tree-layer-control").jstree(true).uncheck_node(el.id);
            });
        }, 200);
    },
    
    fitViewToCurrFeature: function(){
        mapModifier.ol_map.getView().fit(mapModifier.ol_select.selectInteraction.getFeatures().getArray()[0].getGeometry(), {
            padding: [10, 10, 120, 10],//top, right, bottom, left
            duration: 300,
            maxZoom: mapModifier.ol_map.getView().getZoom(),
            callback:function(){
                fcltyOverlayer.setOverlayContent(fcltyOverlayer.typeName, fcltyOverlayer.ftrIds);
            },
        });
    },
    refreshAfterSave: function(){
        mapModifier.ol_map.getLayers().forEach(layer=>layer.getSource().refresh());
    },
};
 
function getShapeLayer() {
 
    var layerNm = $("#shpNm").val();
    if(!layerNm){
        alert("shp 유형을 선택하세요.");
        return;
    }
    GisApp.Module.core.getShapeLayer({
        typeName: layerNm
    });
}