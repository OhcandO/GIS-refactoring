/**
 * GisApp.toolbar
 * @requires gis.measure.js 거리 면적 계산 스크립트
 * @requires gis.csdiagram.js 단면도 생성 스크립트
 */
GisApp.toolbar = function (options) {
  this.initialize(options);
};

GisApp.toolbar.prototype = {
  defaults: {
    blockDiagramVisible: false,
    blockDiagramLayerIds: [],
  },
  measure: null,
  csdiagram: null,
  initialize: function (options) {
    $.extend(this.defaults, options);

    //로드뷰
    let loadViewHtml = '<div id="roadview-container" style="display: none;">';
    loadViewHtml += '<div class="roadview-container-1p">';
    loadViewHtml += '<div class="roadview" id="roadviewDiv"></div>';
    loadViewHtml += "</div>";
    loadViewHtml += '<div class="roadview-container-2p">';
    loadViewHtml += '<div class="roadview" id="roadviewDiv2"></div>';
    loadViewHtml += "</div>";
    loadViewHtml += "</div>";
    $("#content").append(loadViewHtml);

    this.addControl();
    this.baseMapEventListener();
    this.zoomEventListener();
    this.measureEventListener();
    this.imageEventListener();
    this.measure = new GisApp.measure();
    this.csdiagram = new GisApp.csdiagram();
  },
  /**
   * map에 toolbar control 추가
   */
  addControl: function () {
    let html = this.getEditHtml();
    let toolbarControl = function () {
      let element = document.createElement("div");
      element.className = "custom-toolbar ol-unselectable ol-control";
      element.innerHTML = html;
      ol.control.Control.call(this, {
        element: element,
      });
    };

    ol.inherits(toolbarControl, ol.control.Control);
    GisApp.Module.core.map.addControl(new toolbarControl());
  },
  getEditHtml: function () {
    let toolbarHtml = "";

    //맵변경
    toolbarHtml += '<div class="mapbtn" style="z-index: 101">';
    toolbarHtml += "<h3>지도 선택 영역</h3>";
    toolbarHtml += '<a href="#" class="sprite_gis viewer">지도 선택</a>';
    toolbarHtml += '<ul class="choice_map">';
    toolbarHtml += '<li class="on">';
    toolbarHtml +=
      '<a href="#" class="map1" id="emap"><img src="' +
      GisApp.CONTEXT_PATH +
      'images/toolbar/img_map1.png" alt="일반지도"> <span>일반지도</span></a>';
    toolbarHtml += "</li>";
    toolbarHtml += "<li>";
    toolbarHtml +=
      '<a href="#" class="map1" id="satellite"><img src="' +
      GisApp.CONTEXT_PATH +
      'images/toolbar/img_map2.png" alt="위성지도"> <span>위성지도</span></a>';
    toolbarHtml += "</li>";
    //		toolbarHtml += '<li>';
    //		toolbarHtml += '<a href="#" class="map1" id="blockDiagram"><img src="' + GisApp.CONTEXT_PATH + 'images/toolbar/img_map3.png" alt="계통도"> <span>계통도</span></a>';
    //		toolbarHtml += '</li>';
    //		toolbarHtml += '<li>';
    //		toolbarHtml += '<a href="#" class="map1" id="roadview"><img src="' + GisApp.CONTEXT_PATH + 'images/toolbar/img_map4.png" alt="로드뷰"> <span>로드뷰</span></a>';
    //		toolbarHtml += '</li>';
    toolbarHtml += "</ul>";
    toolbarHtml += "</div>";

    //로드뷰
    /*
		toolbarHtml += '<div id="roadview-container" style="display: none;">';
		toolbarHtml += '<div class="roadview-container-1p">';
		toolbarHtml += '<div class="roadview" id="roadviewDiv"></div>';
		toolbarHtml += '</div>';
		toolbarHtml += '<div class="roadview-container-2p">';
		toolbarHtml += '<div class="roadview" id="roadviewDiv2"></div>';
		toolbarHtml += '</div>';
		toolbarHtml += '</div>';
		*/

    //단면도
    //		toolbarHtml += '<div class="mapbtn" id="crossSectionDiagram" class="btn_top_blue" style="z-index: 101; width: 42px; height: 40px; top: 68px; right: 20px;">';
    //		toolbarHtml += '<h3>(임시)단면도 버튼</h3>';
    //		toolbarHtml += '<a href="#" class="sprite_gis danmyun">단면도 선택</a>';
    //		toolbarHtml += '<ul class="choice_danmyun" style="display: none">';
    //		toolbarHtml += '<li>';
    //		toolbarHtml += '<button type="button" id="cs_diagram_close" class="btn_danmyun_close">닫기</button>';
    //		toolbarHtml += '</li>';
    //		toolbarHtml += '<li>';
    //		toolbarHtml += '<a class="edit" id="cs_diagram_draw">영역 그리기</a>';
    //		toolbarHtml += '</li>';
    //		toolbarHtml += '<li>';
    //		toolbarHtml += '<a class="edit" id="cs_diagram_show">단면도 생성</a>';
    //		toolbarHtml += '</li>';
    //		toolbarHtml += '</ul>';
    //		toolbarHtml += '</div>';

    //툴바
    toolbarHtml += '<div class="tool_bar" style="z-index: 100">';
    toolbarHtml += "<h3>toolbar 영역</h3>";
    //toolbarHtml+='<div class="status">';
    //toolbarHtml+='<a href="#" class="on">보기</a>';
    //toolbarHtml+='</div>';
    toolbarHtml += "<ul>";
    toolbarHtml += "<li>";
    toolbarHtml +=
      '<a href="javascript:void(0)" id="btn_control_zoomin" class="btn_control_zoomin" title="확대"><span>확대</span></a>';
    toolbarHtml += "</li>";
    toolbarHtml += "<li>";
    toolbarHtml +=
      '<a href="javascript:void(0)" id="btn_control_zoomout" class="btn_control_zoomout" title="축소"><span>축소</span></a>';
    toolbarHtml += "</li>";
    toolbarHtml += "<li>";
    toolbarHtml +=
      '<a href="javascript:void(0)" id="btn_control_ruler" class="btn_control_ruler btn_control_measure" title="거리 측정"><span>거리측정</span></a>';
    toolbarHtml += "</li>";
    toolbarHtml += "<li>";
    toolbarHtml +=
      '<a href="javascript:void(0)" id="btn_control_area" class="btn_control_area btn_control_measure" title="면적 측정"><span>면적측정</span></a>';
    toolbarHtml += "</li>";
    toolbarHtml += "<li>";
    toolbarHtml +=
      '<a href="javascript:void(0)" id="btn_control_sketch" class="btn_control_sketch" title="스케치"><span>스케치</span></a>';
    toolbarHtml += "</li>";
    toolbarHtml += "<li>";
    toolbarHtml +=
      '<a href="javascript:void(0)" id="btn_control_image" class="btn_control_save" title="이미지저장"><span>이미지저장</span></a>';
    toolbarHtml += "</li>";
    toolbarHtml += "<li>";
    toolbarHtml +=
      '<a href="javascript:void(0)" id="btn_control_print" class="btn_control_print" title="인쇄"><span>인쇄</span></a>';
    toolbarHtml += "</li>";
    toolbarHtml += "</ul>";
    toolbarHtml += "</div>";
    return toolbarHtml;
  },
  baseMapEventListener: function () {
    let me = this;
    $(".choice_map li a ").click(function () {
      $(".choice_map li").removeClass("on");
      $(this).parent().addClass("on");

      me.defaults.blockDiagramVisible = false;
      me.setBlockDiagramLayer();
      let layerId = $(this).prop("id");
      let baseMapDivId = "#" + GisApp.Module.core.defaults.targetId;
      if (layerId == "emap" || layerId == "satellite") {
        GisApp.Module.core.changeBaseLayer(layerId);
        $("#roadview-container").hide();
        $(baseMapDivId).show();
        $(".map_control_div").show();
        $(".map_info").addClass("on");
        $(".map_info_layer").show();
      } else if (layerId == "blockDiagram") {
        me.defaults.blockDiagramVisible = true;
        GisApp.Module.core.changeBaseLayer("emap");
        $("#roadview-container").hide();
        $(baseMapDivId).show();
        $(".map_control_div").show();
        $(".map_info").addClass("on");
        $(".map_info_layer").show();
        me.setBlockDiagramLayer();
      } else {
        /*$(baseMapDivId).hide();
				$("#roadview-container").show();
				$(".map_control_div").hide();
				$(".map_info").removeClass('on');
				$(".map_info_layer").hide();
				me.loadRoadView();*/
        me.popupRoadView();
      }
    });
  },
  zoomEventListener: function () {
    let map = GisApp.Module.core.map;
    let btnZoomIn = document.getElementById("btn_control_zoomin");
    let btnZoomOut = document.getElementById("btn_control_zoomout");
    btnZoomIn.addEventListener(
      "click",
      function (e) {
        map.getView().animate({
          zoom: map.getView().getZoom() + 1,
          duration: 250,
        });
      },
      false
    );

    btnZoomOut.addEventListener(
      "click",
      function (e) {
        map.getView().animate({
          zoom: map.getView().getZoom() - 1,
          duration: 250,
        });
      },
      false
    );
  },
  measureEventListener: function () {
    let me = this;
    let map = GisApp.Module.core.map;
    let btnRuler = document.getElementById("btn_control_ruler");
    let btnArea = document.getElementById("btn_control_area");
    let evtActive = function (type) {
      $(this).toggleClass("active");
      let evtId = $(this).attr("id");
      $(".btn_control_measure").each(function (index, item) {
        let id = $(this).attr("id");
        if (evtId != id) {
          $(this).removeClass("active");
        }
      });
      if ($(this).hasClass("active")) {
        me.measure.addInteraction(type);
      } else {
        me.measure.removeInteraction();
      }
    };

    btnRuler.addEventListener(
      "click",
      function (e) {
        evtActive.call(this, GisApp.measure.LineString);
      },
      false
    );
    btnArea.addEventListener(
      "click",
      function (e) {
        evtActive.call(this, GisApp.measure.Polygon);
      },
      false
    );
  },
  removeMeasureFeature: function () {
    this.measure.removeFeature();
  },
  imageEventListener: function () {
    let me = this;
    let btnPrint = document.getElementById("btn_control_print");
    let btnImage = document.getElementById("btn_control_image");
    let btnSketch = document.getElementById("btn_control_sketch");
    btnPrint.addEventListener(
      "click",
      function (e) {
        me.saveImg("print");
      },
      false
    );
    btnImage.addEventListener(
      "click",
      function (e) {
        me.saveImg("image");
      },
      false
    );
    btnSketch.addEventListener(
      "click",
      function (e) {
        me.saveImg("sketch");
      },
      false
    );
  },
  loadRoadView: function () {
    let mainMap = GisApp.Module.core.map;
    let curCenter = mainMap.getView().getCenter();
    curCenter = ol.proj.transform(curCenter, GisApp.BASE_MAP_PROJ, "EPSG:4326");

    let mapContainer = document.getElementById("roadviewDiv"), // 지도를 표시할 div
      mapCenter = new kakao.maps.LatLng(curCenter[1], curCenter[0]), // 지도의 가운데 좌표
      mapOption = {
        center: mapCenter, // 지도의 중심좌표
        level: 4, // 지도의 확대 레벨
      };

    // 지도를 표시할 div와  지도 옵션으로  지도를 생성합니다
    let map = new kakao.maps.Map(mapContainer, mapOption);
    map.addOverlayMapTypeId(kakao.maps.MapTypeId.ROADVIEW); //지도 위에 로드뷰 도로 올리기

    let rvContainer = document.getElementById("roadviewDiv2"); //로드뷰를 표시할 div
    let rv = new kakao.maps.Roadview(rvContainer); //로드뷰 객체
    let rvClient = new kakao.maps.RoadviewClient(); //좌표로부터 로드뷰 파노ID를 가져올 로드뷰 helper객체

    toggleRoadview(mapCenter);

    // 마커 이미지를 생성합니다.
    let markImage = new kakao.maps.MarkerImage(
      "https://t1.daumcdn.net/localimg/localimages/07/2018/pc/roadview_minimap_wk_2018.png",
      new kakao.maps.Size(26, 46),
      {
        // 스프라이트 이미지를 사용합니다.
        // 스프라이트 이미지 전체의 크기를 지정하고
        spriteSize: new kakao.maps.Size(1666, 168),
        // 사용하고 싶은 영역의 좌상단 좌표를 입력합니다.
        // background-position으로 지정하는 값이며 부호는 반대입니다.
        spriteOrigin: new kakao.maps.Point(705, 114),
        offset: new kakao.maps.Point(13, 46),
      }
    );

    // 드래그가 가능한 마커를 생성합니다.
    let rvMarker = new kakao.maps.Marker({
      image: markImage,
      position: mapCenter,
      draggable: true,
      map: map,
    });

    //마커에 dragend 이벤트를 할당합니다
    kakao.maps.event.addListener(rvMarker, "dragend", function (mouseEvent) {
      let position = rvMarker.getPosition(); //현재 마커가 놓인 자리의 좌표
      toggleRoadview(position); //로드뷰를 토글합니다
    });

    //지도에 클릭 이벤트를 할당합니다
    kakao.maps.event.addListener(map, "click", function (mouseEvent) {
      // 현재 클릭한 부분의 좌표를 리턴
      let position = mouseEvent.latLng;

      rvMarker.setPosition(position);
      toggleRoadview(position); //로드뷰를 토글합니다
    });

    //로드뷰 toggle함수
    function toggleRoadview(position) {
      //전달받은 좌표(position)에 가까운 로드뷰의 panoId를 추출하여 로드뷰를 띄웁니다
      rvClient.getNearestPanoId(position, 50, function (panoId) {
        if (panoId === null) {
          rvContainer.style.display = "none"; //로드뷰를 넣은 컨테이너를 숨깁니다
          map.relayout();
        } else {
          map.relayout(); //지도를 감싸고 있는 영역이 변경됨에 따라, 지도를 재배열합니다
          rvContainer.style.display = "block"; //로드뷰를 넣은 컨테이너를 보이게합니다
          rv.setPanoId(panoId, position); //panoId를 통한 로드뷰 실행
          rv.relayout(); //로드뷰를 감싸고 있는 영역이 변경됨에 따라, 로드뷰를 재배열합니다
        }
      });
    }
  },
  saveImg: function (type) {
    if (GisApp.Module.minimap) {
      GisApp.Module.minimap.removeControl();
    }
    let me = this;
    let map = GisApp.Module.core.map;
    map.once("rendercomplete", function () {
      let mapCanvas = document.createElement("canvas");
      let size = map.getSize();
      mapCanvas.width = size[0];
      mapCanvas.height = size[1];
      let mapContext = mapCanvas.getContext("2d");
      Array.prototype.forEach.call(
        document.querySelectorAll(".ol-layer canvas"),
        function (canvas) {
          if (canvas.width > 0) {
            let opacity = canvas.parentNode.style.opacity;
            mapContext.globalAlpha = opacity === "" ? 1 : Number(opacity);
            let transform = canvas.style.transform;
            // Get the transform parameters from the style's transform matrix
            let matrix = transform
              .match(/^matrix\(([^\(]*)\)$/)[1]
              .split(",")
              .map(Number);
            // Apply the transform to the export map context
            CanvasRenderingContext2D.prototype.setTransform.apply(
              mapContext,
              matrix
            );
            mapContext.drawImage(canvas, 0, 0);
          }
        }
      );
      if (type === "image") {
        if (navigator.msSaveBlob) {
          navigator.msSaveBlob(mapCanvas.msToBlob(), "map.png");
        } else {
          let link = document.createElement("a");
          link.id = "image-download";
          link.download = "map.png";
          link.href = mapCanvas.toDataURL();
          link.click();
        }
      } else if (type === "print") {
        function ImagetoPrint(source) {
          return (
            "<html><head><script>function step1(){\n" +
            "setTimeout('step2()', 10);}\n" +
            "function step2(){window.print();window.close()}\n" +
            "</scri" +
            "pt></head><body onload='step1()'>\n" +
            "<img src='" +
            source +
            "'/></body></html>"
          );
        }
        let source = mapCanvas.toDataURL("image/png");
        Pagelink = "about:blank";
        let pwa = window.open(Pagelink, "_new");
        pwa.document.open();
        pwa.document.write(ImagetoPrint(source));
        pwa.document.close();
      } else {
        me.popupSketch(mapCanvas);
      }
      if (GisApp.Module.minimap) {
        GisApp.Module.minimap.addControl();
      }
    });
    map.renderSync();
  },
  popupSketch: function (mapCanvas) {
    let imgElement = document.getElementById("sketch");
    if (!imgElement) {
      let imgHtml = $(
        '<img alt="관망도캡처 및 스케치" src="" id="sketch" style="display: none;">'
      );
      $("body").append(imgHtml);
    }

    let strOption = "";
    let width = 1200;
    let height = 780;
    let popupY = window.screen.height / 2 - height / 2;

    let popupX = (window.screen.availWidth - width) / 2;
    if (window.screenLeft < 0) {
      popupX += window.screen.width * -1;
    } else if (window.screenLeft > window.screen.width) {
      popupX += window.screenLeft;
    }

    strOption += "left=" + popupX + "px,";
    strOption += "top=" + popupY + "px,";
    strOption += "width=" + width + "px,";
    strOption += "height=" + height + "px,";
    strOption += "toolbar=no,menubar=no,location=no,";
    strOption += "resizable=yes,status=yes";

    let url = mapCanvas.toDataURL("image/png");
    $("#sketch").prop("src", url);
    window.open("/popup/dashbrd/sketch.do", "sketch", strOption);
  },
  popupRoadView: function () {
    let strOption = "";
    strOption += "left=0px,";
    strOption += "top=0px,";
    strOption += "width=" + screen.width + "px,";
    strOption += "height=" + screen.height + "px,";
    strOption += "toolbar=no,menubar=no,location=no,";
    strOption += "resizable=no,status=yes";

    let mainMap = GisApp.Module.core.map;
    let curCenter = mainMap.getView().getCenter();
    curCenter = ol.proj.transform(curCenter, GisApp.BASE_MAP_PROJ, "EPSG:4326");
    let param = "lat=" + curCenter[1] + "&lng=" + curCenter[0];
    window.open("/popup/dashbrd/roadview.do?" + param, "roadview", strOption);
  },
  setBlockDiagramLayerId: function (blockDiagramLayerIds) {
    this.defaults.blockDiagramLayerIds = blockDiagramLayerIds;
  },
  getBlockDiagramLayerId: function (id) {
    let returnId = null;
    let blockDiagramLayerIds = this.defaults.blockDiagramLayerIds;
    for (let i in blockDiagramLayerIds) {
      let blockDiagramLayerId = blockDiagramLayerIds[i];
      if (blockDiagramLayerId == id) {
        returnId = id;
      }
    }
    return returnId;
  },
  setBlockDiagramLayer: function () {
    let me = this;
    let instance = $("#tree-layer-control").jstree(true);
    let _model = instance._model.data;
    $.each(_model, function (_idx, _idata) {
      let node = instance.get_node(_idata.id);
      if (_idata.id.indexOf("layerid") > -1) {
        let layerId = node.data.layerid;
        let blockDiagramLayerId = me.getBlockDiagramLayerId(layerId);
        if (blockDiagramLayerId) {
          if (me.defaults.blockDiagramVisible) {
            instance.select_node(_idata.id);
          }
          let layer = GisApp.Module.core.getLayerById(blockDiagramLayerId);
          if (layer) {
            layer.changed();
          }
        }
      }
    });
  },
};
