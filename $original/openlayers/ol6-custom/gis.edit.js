/**
 * GisApp.editLayer
 * @requires gis.core.js
 * @requires gis.tree.js
 * @requires gis.select.js
 */
GisApp.editLayer = function (options) {
  this.initialize(options);
};

GisApp.editLayer.prototype = {
  defaults: {},
  editFlag: false,
  draw: null,
  modify: null,
  snap: null,
  undoredo: null,
  transform: null,
  drawType: {
    POINT: "Point",
    POLYLINE: "LineString",
    POLYGON: "Polygon",
  },
  selectedLayerId: null, //셀렉트 박스에서 선택된 레이어 ID
  targetElement: null,
  editFeatureInfo: {},
  addFeatureNo: 1,
  initialize: function (options) {
    $.extend(this.defaults, options);
    this.addControl();
    this.createComboOptions();
    this.editStartEventHandler();
    this.setUndoInteraction();
    this.setSnap();
  },
  /**
   * map에 edit control 추가
   */
  addControl: function () {
    let html = this.getEditHtml();
    let editControl = function () {
      let element = document.createElement("div");
      element.className =
        "edit_control map_control_div ol-unselectable ol-control";
      element.innerHTML = html;
      ol.control.Control.call(this, {
        element: element,
      });
    };

    ol.inherits(editControl, ol.control.Control);
    GisApp.Module.core.map.addControl(new editControl());
  },
  /**
   * [공통] 편집 엘리먼트 생성
   */
  getEditHtml: function () {
    let editHtml = "";
    editHtml += "<h3>시설물 편집 후 기능 선택 영역</h3>";
    editHtml += '<button type="button" id="editStart">편집하기</button>';
    editHtml +=
      '<select name="" id="selectEditLayer" style="display: none;"></select>';
    editHtml +=
      '<ul id="edit_toolbar" class="edit_icons" style="display: none;">';
    editHtml += "<li>";
    editHtml +=
      '<a href="javascript:void(0);" class="btn_edit_add" title="추가"><span>추가</span></a>';
    editHtml += "</li>";
    editHtml += "<li>";
    editHtml +=
      '<a href="javascript:void(0);" class="btn_edit_slt" title="수정"><span>수정</span></a>';
    editHtml += "</li>";
    editHtml += "<li>";
    editHtml +=
      '<a href="javascript:void(0);" class="btn_edit_transform" title="크기조절"><span>크기조절</span></a>';
    editHtml += "</li>";
    editHtml += "<li>";
    editHtml +=
      '<a href="javascript:void(0);" class="btn_edit_del" title="삭제"><span>삭제</span></a>';
    editHtml += "</li>";
    editHtml += "<li>";
    editHtml +=
      '<a href="javascript:void(0);" class="btn_edit_prev" title="이전"><span>이전</span></a>';
    editHtml += "</li>";
    editHtml += "<li>";
    editHtml +=
      '<a href="javascript:void(0);" class="btn_edit_next" title="다음"><span>다음</span></a>';
    editHtml += "</li>";
    editHtml += "<li>";
    editHtml +=
      '<a href="javascript:void(0);" id="btn_edit_snap" class="btn_edit_snap" title="스냅"><span>스냅</span></a>';
    editHtml += "</li>";
    editHtml += "<li>";
    editHtml +=
      '<a href="javascript:void(0)" id="btn_edit_save" class="btn_edit_save" title="저장"><span>저장</span></a>';
    editHtml += "</li>";
    editHtml += "</ul>";
    return editHtml;
  },
  /**
   * 시설물 선택 옵션 생성
   */
  createComboOptions: function () {
    let element = "<option value=''>시설물 선택</option>";

    let makeHtml = function (layers) {
      let html = "";

      for (let i = 0; i < layers.length; i++) {
        let layer = {};
        Object.assign(layer, layers[i]);
        let editable = layer.editable || "N";
        //				let fullname = layer.fullname;
        let name = layer.name;
        let layerId = layer.id;
        let layerType = layer.type;
        let typeName = layer.typeName;
        let layerGroup = layer.layerGroup;
        let ftrCde = layer.ftrCde;
        let childList = layer.childList;

        if (childList && childList.length > 0) {
          html += makeHtml(childList);
        }

        if (editable == "N") continue;

        html += "<option value='" + layerId + "' ";
        html +=
          "data-info='" +
          layerGroup +
          ":" +
          typeName +
          ":" +
          layerType +
          ":" +
          ftrCde +
          ":" +
          "' ";
        //예)SBA000:SWL_PIPE_LM:POLYLINE:SB001
        //저장시 파라미터)layergroup,tableName,geom,ftrCde
        html += ">" + name + "</option>";
      }

      return html;
    };

    element += makeHtml(GisApp.layerInfos);
    $("#selectEditLayer").html(element);
  },
  /**
   * [공통] 편집 이벤트 핸들러
   */
  editStartEventHandler: function () {
    let me = this;
    //편집버튼 이벤트
    let editStart = document.getElementById("editStart");
    editStart.addEventListener(
      "click",
      function (e) {
        $(this).toggleClass("active");

        //하이라이트 삭제
        GisApp.Module.core.deleteLayer(GisApp.hLayerId);
        GisApp.Module.core.deleteLayer(GisApp.hlLayerId);

        if ($(this).hasClass("active")) {
          $("#edit_toolbar li").each(function () {
            $(this).children().removeClass("active");
          });
          $("#edit_toolbar").show();
          me.editFlag = true;
          $(this).html("편집종료");
        } else if (!$(this).hasClass("active") || index_num) {
          $("#edit_toolbar").hide();
          $("#edit_toolbar li").removeClass("disabled");
          $("#editListLayer .btn_close").trigger("click");
          $("#selectEditLayer").css("display", "none");
          me.removeInteraction();
          me.editFlag = false;
          $(this).html("편집하기");
        }
      },
      false
    );

    //셀렉트박스 변경시 이벤트
    $("#selectEditLayer").change(function () {
      let layerId = $("#selectEditLayer").val();
      me.selectedLayerId = layerId;

      if (layerId) {
        if (GisApp.Module.tree) {
          GisApp.Module.tree.checkTreeOfId("layerid_" + layerId);
        } else {
          GisApp.Module.core.setLayerOnMap([layerId], true);
        }
        GisApp.Module.edit.setDraw();
        GisApp.Module.edit.setSnap();
      }
    });

    //편집 시작후 툴바 버튼 후버 이벤트
    $(".edit_icons li a").hover(
      function (e) {
        if ($(this).parent().hasClass("disabled")) {
          return;
        }
        $(this).addClass("hover");
      },
      function () {
        $(this).removeClass("hover");
      }
    );

    //편집 시작후 툴바 버튼 이벤트
    $(".edit_icons li a").click(function (e) {
      $(this).toggleClass("active");
      if ($(this).hasClass("btn_edit_add")) {
        //피처 추가
        $(".btn_edit_slt").removeClass("active");
        $(".btn_edit_transform").removeClass("active");
        $("#selectEditLayer").css("display", "block");
        if ($(this).hasClass("active")) {
          GisApp.Module.edit.setDraw();
        }
      } else if ($(this).hasClass("btn_edit_slt")) {
        //피처 수정
        $("#selectEditLayer").css("display", "none");
        $(".btn_edit_add").removeClass("active");
        $(".btn_edit_transform").removeClass("active");
        if ($(this).hasClass("active")) {
          GisApp.Module.edit.setModify();
        }
      } else if ($(this).hasClass("btn_edit_transform")) {
        //피처 크기조절
        $("#selectEditLayer").css("display", "none");
        $(".btn_edit_add").removeClass("active");
        $(".btn_edit_slt").removeClass("active");
        if ($(this).hasClass("active")) {
          GisApp.Module.edit.setTransform();
        }
      } else if ($(this).hasClass("btn_edit_del")) {
        //피처 삭제
        $("#selectEditLayer").css("display", "none");
        $(".btn_edit_add").removeClass("active");
        $(".btn_edit_slt").removeClass("active");
        $(".btn_edit_transform").removeClass("active");
        GisApp.Module.edit.deleteFeature();
      } else if ($(this).hasClass("btn_edit_prev")) {
        //이전
        GisApp.Module.edit.undo();
      } else if ($(this).hasClass("btn_edit_next")) {
        //다음
        GisApp.Module.edit.redo();
      } else if ($(this).hasClass("btn_edit_snap")) {
        //스냅
        GisApp.Module.edit.setSnap();
      }
    });
  },
  /**
   * [공통] Interaction 추가
   */
  addInteration: function () {
    this.setUndoInteraction();
  },
  /**
   * [공통] Interaction 삭제
   */
  removeInteraction: function () {
    this.removeDraw();
    this.removeModify();
    this.removeSnap();
  },
  /**
   * [공통] Interaction Active 컨트롤
   */
  setInteractionActive: function (active) {
    this.setDrawActive(active);
    this.setModifyActive(active);
    this.setActiveUndo(active);
  },
  /**
   * [그리기] 기능 추가
   */
  setDraw: function () {
    //초기화
    this.removeModify();
    this.removeTransform();
    if (GisApp.Module.select) {
      GisApp.Module.select.setActive(false);
    }

    //셀렉트 박스에서 시설물 선택된 경우 실행
    let layerId = this.selectedLayerId;
    if (!layerId) {
      return;
    }

    //그리기 기능 추가
    let me = this;
    let core = GisApp.Module.core;
    if (me.draw) {
      core.map.removeInteraction(me.draw);
    }
    let layerType = GisApp.layerCode[layerId].type;
    let drawType = this.drawType[layerType];
    let layer = core.getLayerById(layerId);
    let drawSource = layer.getSource();
    this.draw = new ol.interaction.Draw({
      type: drawType,
      source: drawSource,
      condition: function (evt) {
        return true;
      },
    });
    core.map.addInteraction(this.draw);

    //그리기 기능 이벤트
    this.draw.on("drawstart", function (event) {});

    let drawFeatureCallback = function (event) {
      me.setActiveUndo(true);
      let drawFeature = event.feature;
      drawFeature.setId(layerId + "_feature_" + me.addFeatureNo++);

      //feature properties에 추가
      let selectedOpt = $("#selectEditLayer option:selected");
      let info = selectedOpt.data("info");
      let values = info.split(":");
      let layerGroup = values[0];
      let ftrCde = values[3];

      let properties = {};
      properties["FTR_IDS"] = "-";
      properties["FTR_CDE"] = ftrCde;
      properties["LAYER_GROUP"] = layerGroup;
      drawFeature.setProperties(properties);
      me.setAddFeatureUndo(layer, drawFeature);
      me.setEditFeatureInfo("insert", drawFeature);
      me.setActiveUndo(false);
    };

    this.draw.on("drawend", function (event) {
      drawFeatureCallback(event);
    });

    /*drawSource.listeners_.addfeature = null; 
		let addfeatureCallback = function(event){ 
		} 
		drawSource.on('addfeature', addfeatureCallback);*/
  },
  /**
   * [그리기] 기능 제거
   */
  removeDraw: function () {
    let core = GisApp.Module.core;
    core.map.removeInteraction(this.draw);
    if (GisApp.Module.select) {
      GisApp.Module.select.setActive(true);
    }
  },
  /**
   * [그리기] 기능 활성화
   */
  setDrawActive: function (active) {
    if (this.draw) {
      this.draw.setActive(active);
      if (!active) {
        $("#selectEditLayer").css("display", "none");
        $(".btn_edit_add").removeClass("active");
      }
    }
  },
  /**
   * [히스토리] UndoInteraction 추가
   */
  setUndoInteraction: function () {
    let core = GisApp.Module.core;
    if (!this.undoredo) {
      this.undoredo = new ol.interaction.UndoRedo();
      core.map.addInteraction(this.undoredo);
      this.setActiveUndo(false);
    }
  },
  /**
   * [히스토리] UndoInteraction 제거
   */
  removeUndoInteraction: function () {
    let core = GisApp.Module.core;
    if (this.undoredo) {
      core.map.removeInteraction(this.undoredo);
      this.undoredo = null;
    }
  },
  /**
   * [히스토리] UndoInteraction 활성화
   */
  setActiveUndo: function (active) {
    if (this.undoredo) {
      this.undoredo.setActive(active);
    }
  },
  /**
   * [히스토리] 피처 추가
   */
  setAddFeatureUndo: function (layer, addFeature) {
    if (this.undoredo) {
      let obj = {};
      obj.target = layer.getSource();
      obj.feature = addFeature;
      obj.type = "addfeature";
      this.undoredo._onAddRemove(obj);
    }
  },
  /**
   * [히스토리] 이전
   */
  undo: function () {
    if (this.undoredo) {
      if (this.undoredo.hasUndo() === 0) {
        alert("이전 히스토리가 없습니다.");
        return;
      }
      this.setActiveUndo(true);
      this.undoredo.undo();
      this.setActiveUndo(false);
    }
  },
  /**
   * [히스토리] 다음
   */
  redo: function () {
    if (this.undoredo) {
      if (this.undoredo.hasRedo() === 0) {
        alert("다음 히스토리가 없습니다.");
        return;
      }
      this.setActiveUndo(true);
      this.undoredo.redo();
      this.setActiveUndo(false);
    }
  },
  /**
   * [히스토리] 초기화
   */
  clearUndoRedo: function () {
    if (this.undoredo) {
      this.undoredo.clear();
    }
  },
  /**
   * [삭제] 피처 삭제
   */
  deleteFeature: function () {
    //초기화
    this.removeDraw();
    this.removeModify();
    this.removeTransform();

    //삭제 기능 실행
    let me = this;
    let core = GisApp.Module.core;
    let select = GisApp.Module.select;
    select.getSelectedFeatures().forEach(function (selectedFeature) {
      let selectedFeatureId = selectedFeature.getId();
      let layers = core.map.getLayers();
      for (let i in layers.array_) {
        let layer = layers.array_[i];
        if (layer.get("selectable") && select.getVisible(layer)) {
          layer
            .getSource()
            .getFeatures()
            .forEach(function (feature) {
              let featureId = feature.getId();
              if (selectedFeatureId === featureId) {
                me.setActiveUndo(true);
                layer.getSource().removeFeature(feature);
                me.setEditFeatureInfo("delete", feature);
                me.setActiveUndo(false);
              }
            });
        }
      }
    });
  },
  /**
   * [수정] 피처 수정 기능 셋팅
   */
  setModify: function () {
    //초기화
    this.removeDraw();
    this.removeTransform();
    this.removeModify();

    //수정기능 추가
    let me = this;
    let core = GisApp.Module.core;
    let select = GisApp.Module.select;
    let selectedFeatures = select.getSelectedFeatures();

    this.modify = new ol.interaction.Modify({
      features: selectedFeatures,
    });
    core.map.addInteraction(this.modify);

    select.selectInteraction.on("change:active", function () {
      selectedFeatures.forEach(function (each) {
        selectedFeatures.remove(each);
      });
    });

    this.modify.on("modifystart", function (event) {});

    this.modify.on("modifyend", function (event) {
      /*let features = event.features.getArray();
			for (let i=0;i<features.length;i++){
				me.setEditFeatureInfo("update",features[i]);
			}*/
    });
  },
  /**
   * [수정] 피처 수정 기능 제거
   */
  removeModify: function () {
    if (this.modify) {
      let core = GisApp.Module.core;
      core.map.removeInteraction(this.modify);
      this.modify = null;
    }
  },
  /**
   * [수정] 기능 활성화
   */
  setModifyActive: function (active) {
    if (this.modify) {
      this.modify.setActive(active);
    }
  },
  /**
   * [크기조절] 피처 크기조절 기능 셋팅
   */
  setTransform: function () {
    //초기화
    this.removeDraw();
    this.removeModify();
    this.removeTransform();

    let me = this;
    let core = GisApp.Module.core;
    let select = GisApp.Module.select;

    this.transform = new ol.interaction.Transform({
      enableRotatedTransform: false,
      addCondition: ol.events.condition.click,
      filter: function (f, l) {
        return f.getGeometry().getType() !== "Point";
      },
      // layers: [vector],
      hitTolerance: select.defaults.hitTolerance,
      translateFeature: true,
      scale: true,
      rotate: true,
      keepAspectRatio: ol.events.condition.always,
      translate: true,
      stretch: true,
    });
    core.map.addInteraction(this.transform);
  },
  /**
   * [크기조절] 피처 크기조절 기능 제거
   */
  removeTransform: function () {
    if (this.transform) {
      let core = GisApp.Module.core;
      core.map.removeInteraction(this.transform);
      this.transform = null;
    }
  },
  /**
   * [크기조절] 피처 크기조절 기능 활성화
   */
  setTransformActive: function (active) {
    if (this.transform) {
      this.transform.setActive(active);
    }
  },
  /**
   * [스냅] 기능 추가
   */
  setSnap: function () {
    let active = $("#btn_edit_snap").hasClass("active");
    //초기화
    this.removeSnap();

    //스냅 기능 추가
    let core = GisApp.Module.core;
    let select = GisApp.Module.select;
    core.map.removeInteraction(this.snap);
    let features = [];
    let layers = core.map.getLayers();
    for (let i in layers.array_) {
      let layer = layers.array_[i];
      if (select.getVisible(layer) && layer.get("type") !== "base") {
        if (layer.getSource().getFeatures().length > 0) {
          features = features.concat(layer.getSource().getFeatures());
        }
      }
    }
    let snapCollection = new ol.Collection(features);
    this.snap = new ol.interaction.Snap({
      features: snapCollection,
      pixelTolerance: 15,
    });
    core.map.addInteraction(this.snap);
    this.snap.setActive(active);
  },
  /**
   * [스냅] 기능 제거
   */
  removeSnap: function () {
    if (this.snap) {
      let core = GisApp.Module.core;
      core.map.removeInteraction(this.snap);
      this.snap = null;
    }
  },
  /**
   * [스냅] 스냅에 피처 추가
   */
  addSnap: function (layers) {
    let me = this;
    if (me.snap) {
      for (i in layers) {
        let source = layers[i].getSource();
        source.listeners_.addfeature = null;
        source.on("addfeature", function (event) {
          me.snap.addFeature(event.feature);
        });
      }
    }
  },
  /**
   * [스냅] 기능 활성화
   */
  setSnapActive: function (active) {
    if (this.snap) {
      this.snap.setActive(active);
    }
  },

  /**
   * [저장] 피처 수정 정보 셋팅
   */
  setEditFeatureInfo: function (flag, feature) {
    let featureId = feature.getId();
    let properties = feature.getProperties();
    let ftrIds = properties["FTR_IDS"];
    let editInfo = this.editFeatureInfo[featureId] || {};

    //신규 추가 후 삭제시에 editFeatureInfo에서 제거
    if (ftrIds === "-" && flag === "delete") {
      delete this.editFeatureInfo[featureId];
      return;
    }

    let pLayerName = "";
    let pTableName = "";
    let pFtrIds = "-";
    let pFtrCde = "";
    let pLayergroup = "";

    //셀렉트 옵션에서 파라미터값 조회
    if (Object.keys(editInfo).length === 0) {
      $("#selectEditLayer option").each(function () {
        let oText = $(this).text();
        let info = $(this).data("info");
        if (info) {
          let values = info.split(":");
          let oLayerGroup = values[0];
          let oTableName = values[1];
          let oLayerType = values[2];
          let oFtrCde = values[3];
          for (let key in properties) {
            let ftrIds = properties["FTR_IDS"];
            let ftrCde = properties["FTR_CDE"];
            let p = properties[key];
            if (
              (oLayerGroup === "" || p === oLayerGroup) &&
              oFtrCde === ftrCde
            ) {
              pLayerName = oText;
              pTableName = oTableName;
              pFtrIds = ftrIds;
              pFtrCde = oFtrCde;
              pLayergroup = oLayerGroup;
            }
          }
        }
      });
    } else {
      pFtrIds = editInfo["ftrIds"];
      flag = editInfo["flag"];
      pLayerName = editInfo["ftrNm"];
      pTableName = editInfo["tableName"];
      pFtrCde = editInfo["ftrCde"];
      pLayergroup = editInfo["layergroup"];
    }

    //좌표값 WKT포멧으로 변경
    //		let pGeom = GisApp.Module.core.convertFeatureGeomToWKT(feature);
    let pGeom = convertFeatureGeomToWKTForDB(feature);

    //수정정보 저장
    let param = {
      flag: flag,
      ftrNm: pLayerName,
      userId: "SYSTEM",
      tableName: pTableName,
      ftrIds: pFtrIds,
      ftrCde: pFtrCde,
      geom: pGeom,
      layergroup: pLayergroup,
    };
    this.editFeatureInfo[featureId] = param;

    function convertFeatureGeomToWKTForDB(feature) {
      if (feature && feature instanceof ol.Feature) {
        //지도의 좌표계
        const fromProj = GisApp.BASE_MAP_PROJ; // 'EPSG:3857'
        const dbProj = GisApp.SHP_PROJ; //'EPSG:5181'
        let geom = feature.getGeometry().clone();
        geom.transform(fromProj, dbProj);

        let format = new ol.format.WKT();
        let wktGeom = format.writeGeometry(geom);
        return wktGeom;
      }
    }
  },
  getEditFeatureInfo: function () {
    let undoStack = this.undoredo._undoStack;
    for (let i in undoStack) {
      let undo = undoStack[i];
      if (undo.feature) {
        let feature = undo.feature;
        if (undo.type === "addfeature") {
          this.setEditFeatureInfo("insert", feature);
        } else if (undo.type === "changefeature") {
          this.setEditFeatureInfo("update", feature);
        } else if (undo.type === "removefeature") {
          this.setEditFeatureInfo("delete", feature);
        }
      }
    }
    return this.editFeatureInfo;
  },
  /**
   * [저장] 피처 수정 정보
   */
  save: function (callback) {
    let me = this;
    $(".edit_icons li #btn_edit_save").click(function (e) {
      console.log("editFeatureInfo==", me.editFeatureInfo);
      let saveInfo = me.getEditFeatureInfo();
      console.log("saveInfo==", saveInfo);
      let saveList = [];
      for (let key in saveInfo) {
        let info = saveInfo[key];
        saveList.push(info);
      }
      callback(saveList);
      me.clearUndoRedo();
    });
  },
};
