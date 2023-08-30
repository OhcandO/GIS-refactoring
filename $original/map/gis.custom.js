/**
	/dashbrd/map2.jsp (메인지도상황판) 의 지도 모듈, 기능을 관리하는 js
	
	--연동 모듈(독립 js)--
	1. GisApp 모듈 (gis.core.js 등 Openlayers6 구현)
	1. 지도 위 오버레이 팝업 IntervalFunction 기동
	2. fcltyOverlayer 모듈 (GisApp 연동, 선택된 시설물 속성정보 팝업)
	3. mngAsst 모듈 (fcltyOverlayer 연동, 관리대장 새 창으로 표출)
	4. (속성정보 조건검색) 모듈
	
	--기능--
	1. 
	2. 시설물 정보 지도 팝업 (Openlayers 오버레이)
	3. 실시간 이상감지 확인 후 알람   
	______________________________
	좌측 | 		지도		| 상세
	 탭	 |	+ 오버레이 팝업 | 정보
	영역 |	+ (시설물정보)	|  창
	------------------------------
 
 */
const DIV_FOR_FACLITY_DETAIL = "mapModFacilityDetail";
const DIV_FOR_TREE = "tree-layer-control";

// 시설물 오버레이 팝업 새로고침(setInterval) 기능 자동시작 여부
const BLN_OF_REFRESH_SERVICE = true;
//abnorNotice_ol.js 에서 알람기능 (화면점멸 + 소리파일 재생) 켜고 끄기
//BLN_OF_REFRESH_SERVICE 는 true 이고 IS_ALARM_ON 이 false 이면 이상알림 새로고침은 되는데 점멸+소리는 없음
const IS_ALARM_ON = false;

//레이어탭 첫번째 블록 노드 접기(child-node 너무 많음)
$(window).load(function () {
	$("#" + DIV_FOR_TREE)
	.jstree(true)
	.toggle_node(
		"" + Object.values(GisApp.layerCode).find((el) => el.name === "블록").id
	);
});

//document.addEventListener('DOMContentLoaded',function(){
$(document).ready(function () {
	//	 Openlayers 지도 생성
	$.when(mainMap.initMap()).done(() => {
		mainMap.createMap();
	});
	
	//	mainMap.initMap2()
	//	.catch(alert)
	//	.then(()=>{
	//		mainMap.createMap();
	//	});
	
	// 운영관리 트리 생성
	makeBlockTree();
	
	// 시설물 속정정보창 시작
	fcltyOverlayer.init({
		                    targetId   : DIV_FOR_FACLITY_DETAIL,
		                    btnGrpClass: "fcltyDtal_btn",
	                    });
	
	// 조건검색 시작
	gisSearch.init();
	
	// 지도
	$(".map_info").addClass("on");
	$(".map_info_layer").show();
	
	//팝업제어문
	_popupToolBar.init();
	
	//화면상 새로고침 기능 자동시작 여부
	if (BLN_OF_REFRESH_SERVICE) {
		//오버레이 팝업 화면
		$("div.popupView").show();
		//이상감지 갱신 기능 토글
		//		toggleAbnorNotice();
	} else {
		//오버레이 팝업 화면
		$("div.popupView").hide();
	}
});

let iconUrl = {
	f: "../images/common/icon-pin-green.png",
	p: "../images/common/icon-pin-blue.png",
	q: "../images/common/icon-pin-skyblue.png",
	b: "../images/common/icon-pin-orange.png",
};

let globalMapData;

//지도 객체
let mainMap = {
	ol_map   : null,
	ol_select: null,
	gis_tree : null, //gis.tree.js 모듈 객체
	
	ol_highlight: null, //단지 하이라이트를 위한 ol.interaction.Select 객체
	
	allServFeatureArr: [], //배수지 point 피쳐 배열
	
	//기존 leaflet 에서 각 레이어 종류에 할당되는 오버레이(팝업) 들 관리용
	map: {
		markerFLayer  : {},
		markerSfLayer : {},
		markerPLayer  : {},
		markerQLayer  : {},
		markerBLayer  : {},
		markerSLayer  : {},
		markerMLayer  : {},
		markerDrnLayer: {}, //드레인 오버레이어
	},
	
	gisOptions: {
		targetId: "map",
	},
	
	initMap: function () {
		return $.ajax({
			              url        : "/tree2.do",
			              type       : "GET",
			              datatype   : "JSON",
			              async      : false,
			              contentType: "application/json",
			              success    : function (result) {
				              let data = result.data;
				              GisApp.setLayerInfos(data);
			              },
			              error      : function (request, error) {
				              alert("시스템 오류입니다. 잠시 후 다시 접속하시기 바랍니다.");
				              console.log(
					              "[ message: " + request.responseText + "\nerror:" + error + "]"
				              );
			              },
		              });
	},
	
	initMap2: () =>
		new Promise((res) => {
			const URL = "/tree2.do";
			fetch(URL)
			.then((response) => {
				if (response.ok) {
					return response.json();
				} else {
					return Promise.reject(
						"시스템 오류입니다. 잠시 후 다시 접속하시기 바랍니다."
					);
				}
			})
			.then((json) => {
				let data = json.data;
				GisApp.setLayerInfos(data);
				res();
			});
		}),
	
	createMap: function () {
		let me = this;
		
		//지도 객체 생성
		GisApp.Module.core = new GisApp.core(this.gisOptions);
		me.ol_map = GisApp.Module.core.map;
		
		//선택 컨트롤 팝업 없이 선택 기능만 활성화
		GisApp.Module.select = new GisApp.select({control: false});
		me.ol_select = GisApp.Module.select.selectInteraction;
		
		GisApp.Module.tree = new GisApp.tree({targetId: DIV_FOR_TREE});
		me.gis_tree = GisApp.Module.tree;
		
		if (!GisApp.Module.toolbar) {
			GisApp.Module.toolbar = new GisApp.toolbar({targetId: "#content"});
		}
		
		GisApp.Module.minimap = new GisApp.minimap();
		GisApp.Module.core.scaleControl();
		GisApp.Module.core.mousePositionControl();
		
		//CUSTOM - 시설물 선택시 이벤트
		GisApp.Module.select.getSelectedInfo(function (features, layers) {
			mainMap.ol_map.removeLayer(mainMap.ol_highlight);
			if (features.length == 1) {
				let properties = features[0].getProperties();
				if (properties.FTR_IDS) {
					let typeName = layers[0]
						? layers[0].get("typeName")
						: features[0].getId().split(".")[0];
					let ftr_ids = features[0].getProperties().FTR_IDS;
					let ftrIdn = features[0].getProperties().FTR_IDN;
					
					//시설물 오버레이어 설정 (+관리대장 버튼 설정)
					fcltyOverlayer
					.setOverlayTemplate(typeName, ftr_ids)
					.then(function (typeName_) {
						//닫기버튼 생성
						let closeHtml =
							'<button class="btn btn-danger btn-sm"  onclick="fcltyOverlayer.removeOverlayTemplate()">x</button>';
						$(".float-right.fcltyDtal_btn").append(closeHtml);
					})
					.then(fcltyOverlayer.activateOverlayTemplate)
					.then(function () {
						fcltyOverlayer.setOverlayContent();
					});
				}
			} else {
				//여러개 선택되었거나, 선택된 것이 없거나
				fcltyOverlayer.removeOverlayTemplate();
				mainMap.ol_map.removeLayer(mainMap.ol_highlight);
			}
		});
	},
}; //mainMap

/**좌측탭영역 그리드 선택시 피쳐하이라이트 용 함수 : 계측기와 연관 블록을 둘 다 하이라이트 함
	@param {String} typeName 'WTL_PIPE_LS' 등 GIS 테이블 이름
	@param {String} ftrIdn 관리번호. 숫자라도 문자열('')로 입력해야함
	@param {String} BLOCK_ftrIdn 블록의 관리번호. 숫자라도 문자열('')로 입력해야함
 */
function showFeatureOnMap(typeName, ftrIdn, BLOCK_ftrIdn = "") {
	if (mainMap.ol_highlight) {
		mainMap.ol_map.removeLayer(mainMap.ol_highlight);
		mainMap.ol_highlight = null;
	}
	let minZoom = Object.values(GisApp.layerCode).reduce((pre, cur) => {
		if (cur.typeName === typeName && cur.isLayer === "Y") {
			return Number(pre) > Number(cur.minZoom) ? pre : cur.minZoom;
		} else {
			return pre;
		}
	}, "17");
	
	let OLfeatureArr = [];
	
	mainMap.gis_tree
	       .showLayerWithTreeThroughTableName_Promise(typeName)
	       .then(function () {
		       let OLFeat = findOLFeature(typeName, ftrIdn);
		       if (OLFeat) OLfeatureArr.push(OLFeat);
	       })
	       .then(() => {
		       //소블록 정보가 같이 들어왔다면
		       return new Promise((res) => {
			       if (BLOCK_ftrIdn) {
				       const BLOCK_TABLE_NAME = "WTL_BLSM_AS";
				       mainMap.gis_tree.hideLayerThroughTableName("WTL_BLBG_AS");
				       mainMap.gis_tree.hideLayerThroughTableName("WTL_BLBM_AS");
				       mainMap.gis_tree.hideLayerThroughTableName(BLOCK_TABLE_NAME);
				       mainMap.gis_tree.showALayer(BLOCK_TABLE_NAME, BLOCK_ftrIdn);
				       res();
				       /* //해당 소블록 복제를 하이라이트 하기위해 배열에 포함시킴
								 mainMap.gis_tree.showLayerWithTreeThroughTableName_Promise(BLOCK_TABLE_NAME)
									 .then(function() {
										 let blockOLFeature = findOLFeature(BLOCK_TABLE_NAME, BLOCK_ftrIdn);
										 if (blockOLFeature) OLfeatureArr.push(blockOLFeature.clone());
										 mainMap.gis_tree.hideLayerThroughTableName(BLOCK_TABLE_NAME);
										 res();
									 });*/
			       } else {
				       res();
			       }
		       });
	       })
	       .then(() => {
		       if (OLfeatureArr[0] instanceof ol.Feature) {
			       highlightFeatureArr(OLfeatureArr);
		       } else {
			       console.log("시설물 GIS 정보 확인 불가 : ", typeName, "|", ftrIdn);
		       }
	       });
	
	function findOLFeature(tableName, ftrIdn) {
		return mainMap.ol_map
		              .getLayers()
		              .getArray()
		              .reduce((preFeat, curLa) => {
			              let curFeat = "";
			              if (curLa.get("typeName") === tableName) {
				              curFeat = curLa
				              .getSource()
				              .getFeatures()
				              .find((feat) => feat.get("FTR_IDN") === ftrIdn.toString());
			              }
			              return curFeat ? curFeat : preFeat;
		              }, "");
	}
	
	function highlightFeatureArr(OLFeatureArr) {
		let strokeStyleCircle = new ol.style.Stroke({
			                                            color   : "rgba(75,255,13,1)",
			                                            width   : 6,
			                                            lineDash: [10, 6],
		                                            });
		let strokeStyleLine = new ol.style.Stroke({
			                                          color   : "rgba(75,255,13,1)",
			                                          width   : 8,
			                                          lineDash: [10, 6],
		                                          });
		let style = [
			new ol.style.Style({
				                   image : new ol.style.Circle({
					                                               fill  : new ol.style.Fill({
						                                                                         color: "rgba(255,22,13,0.28)",
					                                                                         }),
					                                               stroke: strokeStyleCircle,
					                                               radius: 30,
				                                               }),
				                   stroke: strokeStyleLine,
				                   fill  : new ol.style.Fill({color: "rgba(255,22,13,0.28)"}),
			                   }),
		];
		
		let tempSource = new ol.source.Vector();
		if (OLFeatureArr instanceof Array) {
			OLFeatureArr.forEach((feature) => {
				if (feature instanceof ol.Feature) tempSource.addFeature(feature);
			});
		}
		let tempLayer = new ol.layer.VectorImage();
		tempLayer.setStyle(style);
		tempLayer.setSource(tempSource);
		tempLayer.setZIndex(Infinity);
		mainMap.ol_highlight = tempLayer;
		mainMap.ol_map.addLayer(tempLayer);
		
		mainMap.ol_map.getView().fit(tempSource.getExtent(), {
			//						padding: [200, 150, 220, 200],//top, right, bottom, left
			duration: 400,
			maxZoom : minZoom || 17,
		});
	}
}

//---블럭운영관리 탭 생성----------
function makeBlockTree() {
	$.ajax({
		       url     : contextPath + "omTree.do",
		       type    : "get",
		       dataType: "json",
		       success : function (result, textStatus, jqXHR) {
			       let layerList = result.data;
			
			       om_LayerList = result.data;
			       let parentitemList = {},
				       childList = {},
				       chlidlayerList = {},
				       bssmList = {},
				       dpthList = {},
				       dList,
				       tmp;
			       for (const element of layerList) {
				       if (element.part === "BLBG") {
					       //1dpth
					       parentitemList[element.layername] = [element];
				       } else if (element.part === "BLBM") {
					       //2dpth
					       childList[element.layername] = [element];
				       } else {
					       //3dpth
					       if (element.part !== "BLSM") {
						       tmp = dpthList[element.part];
						
						       if (!tmp) {
							       dpthList[element.part] = [element.part];
							       tmp = dpthList[element.part];
						       }
						       if (!tmp.ChildList) tmp.ChildList = {};
						
						       dList = tmp.ChildList;
						       tmp = dList[element];
						
						       if (!tmp) {
							       dList[element.part] = [element];
							       tmp = dList[element];
						       }
					       }
					
					       if (element.part === "BSSM") {
						       bssmList[element.layername] = [element];
						       continue;
					       }
					
					       if (!element.layername) {
						       chlidlayerList[element.ftrIdn] = [element];
					       } else {
						       chlidlayerList[element.layername] = [element];
					       }
				       }
			       }
			
			       let omwrap = "";
			       for (let item in parentitemList) {
				       //블록
				       //var obj = parentitemList[item][0];
				
				       omwrap += "<ul>";
				       omwrap += "<li>";
				       omwrap +=
					       "<a onclick='omLayerClick(" +
					       JSON.stringify(parentitemList[item][0]) +
					       ")'>" +
					       item +
					       "</a>";
				       omwrap += "<ul>";
				
				       //subitem
				       for (let child in childList) {
					       if (parentitemList[item][0].ftrIdn === childList[child][0].ublIdn) {
						       omwrap += "<li>";
						       omwrap +=
							       "<a onclick='omLayerClick(" +
							       JSON.stringify(childList[child][0]) +
							       ")' >" +
							       child +
							       "</a>";
						       omwrap += "<ul>";
						       //layeritem
						       for (let chd in chlidlayerList) {
							       if (
								       childList[child][0].ftrIdn === chlidlayerList[chd][0].ublIdn
							       ) {
								       omwrap += "<li>";
								       omwrap +=
									       "<a onclick='omLayerClick(" +
									       JSON.stringify(chlidlayerList[chd][0]) +
									       ")'>" +
									       chd +
									       "</a>"; //3dpth
								       omwrap += "<ul>";
								
								       for (let bssm in bssmList) {
									       if (
										       chlidlayerList[chd][0].ftrIdn === bssmList[bssm][0].ublIdn
									       ) {
										       omwrap += "<li>";
										       omwrap +=
											       "<a onclick='omLayerClick(" +
											       JSON.stringify(bssmList[bssm][0]) +
											       ")'>" +
											       bssm +
											       "</a></li>"; //4dpth
									       }
								       }
								
								       omwrap += "</ul>";
								       omwrap += "</li>"; //3dpth
							       }
						       }
						
						       omwrap += "</ul>";
						       omwrap += "</li>"; //2dpth
					       } // end if
				       } //end for
				       omwrap += "</ul>";
				       omwrap += "</li>"; //1dpth
				       omwrap += "</ul>";
			       }
			       //정렬
			       sortObject(chlidlayerList); //정수장, 가압장, 배수지에서 사용
			       // 기타(가압장,정수장,배수지) 3dpth
			       for (let itm in dpthList) {
				       omwrap += "<ul>";
				
				       if (dpthList[itm][0] === "PRES") {
					       omwrap += "<li id='jstree_om_pres'>가압장";
				       } else if (dpthList[itm][0] === "PURI") {
					       omwrap += "<li id='jstree_om_puri'>정수장";
				       } else if (dpthList[itm][0] === "SERV") {
					       omwrap += "<li id='jstree_om_serv'>배수지";
				       }
				       omwrap += "<ul>";
				
				       //전체
				       /*for (var name in chlidlayerList) {
								   if(dpthList[itm][0] === chlidlayerList[name][0].part)
								   {
									   omwrap += "<li><a onclick='omLayerClick("+JSON.stringify(chlidlayerList[name][0])+")'> "+name + "</a></li>";
								   }
							   } */
				
				       //sortTextChlidList 문자
				       for (let name in sortTextChlidList) {
					       if (dpthList[itm][0] === sortTextChlidList[name][0].part) {
						       omwrap +=
							       "<li><a onclick='omLayerClick(" +
							       JSON.stringify(sortTextChlidList[name][0]) +
							       ")'> " +
							       name +
							       "</a></li>";
					       }
				       }
				       //sortNumChlidList 숫자
				       for (let num in sortNumChlidList) {
					       if (dpthList[itm][0] === sortNumChlidList[num][0].part) {
						       omwrap +=
							       "<li><a onclick='omLayerClick(" +
							       JSON.stringify(sortNumChlidList[num][0]) +
							       ")'> " +
							       num +
							       "</a></li>";
					       }
				       }
				       omwrap += "</ul>";
				       omwrap += "</li>";
				       omwrap += "</ul>";
			       }
			
			       $("#omtree-layer-control").html(omwrap);
			
			       //$(".map_info a").trigger("click");
			       $("#omtree-layer-control").jstree({
				                                         core   : {
					                                         themes: {
						                                         icons: false,
					                                         },
				                                         },
				                                         plugins: ["wholerow", "search"],
			                                         });
			
			       let to = false;
			       $("#searchLayer").keyup(function () {
				       if (to) {
					       clearTimeout(to);
				       }
				       to = setTimeout(function () {
					       let v = $("#searchLayer").val();
					       $("#omtree-layer-control").jstree(true).search(v);
				       }, 250);
			       });
			
			       //블록운영레이어 클릭
			       $("#omtree-layer-control").bind("changed.jstree", function (e, data) {
				       //open_node.jstree close_node.jstree
				       if (!(data.action === "select_node" || data.action === "deselect_node")) {
					       return;
				       }
				
				       if (data.selected.length > 0) {
					       layerNodeCheck = "Y";
				       }
				
				       let bChecked = false;
				       if (data.action === "select_node") {
					       bChecked = true;
				       }
			       });
		       }, //ajax success
		       error   : function (request, error) {
			       console.log("message: " + request.responseText + ", error:" + error);
		       },
	       });
}

//object를 키 이름으로 정렬하여 반환
function sortObject(o) {
	let sorted = {},
		sortedNum = {},
		key,
		a = [],
		b = [];
	
	let pattern_kor = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/; // 한글체크
	let pattern_num = /[0-9]/; // 숫자
	let pattern_eng = /[a-zA-Z]/; // 문자
	let pattern_spc = /[~!@#$%^&*()_+|<>?:{}]/; // 특수문자
	
	// 키이름을 추출하여 배열에 집어넣음
	for (key in o) {
		let temp = key.slice(0, 1); // 첫글자만 체크
		if (pattern_num.test(temp)) {
			if (o.hasOwnProperty(key)) b.push(key);
		} else {
			if (o.hasOwnProperty(key)) a.push(key);
		}
	}
	// 키이름 배열을 정렬
	a.sort(); //문자
	//b.sort(function(i, j){ return i-j; });
	//a.reverse();
	//a =  a.concat(b);
	// 정렬된 키이름 배열을 이용하여 object 재구성
	for (key = 0; key < a.length; key++) {
		//문자
		sorted[a[key]] = o[a[key]];
	}
	for (key = 0; key < b.length; key++) {
		//숫자
		sortedNum[b[key]] = o[b[key]];
	}
	
	//전역변수에 셋팅
	sortTextChlidList = sorted;
	sortNumChlidList = sortedNum;
	// return sorted ; 객체에 같이 담으면 무조건 숫자 먼저 정렬됌
}

//**팝업 and WarningBox 이상유무 알림**//
let issueAlert = {
	init  : function (ftrIdn, data, obj) {
		this.issueCheck(ftrIdn, data, obj);
	},
	select: function (obj) {
		//해당 유량계 찾아가기 줌 포함
		
		var latlng = changeProj(obj.x, obj.y, _defCrs);
		mainMap.map.setView(latlng, 14); //해당 위치로 이동
		
		/*//평택 시연 오른쪽 팝업 (사용 안함)
			if($("#qlt"+obj.ftrIdn)) {
				$("#qlt"+obj.ftrIdn).trigger("click");
			}	*/
		
		/*setBlockInfo(obj.fcltyCd);//우측팝업 설정*/
	},
	close : function (ftrIdn, fcltyCd, wbName) {
		//warningeBox 닫힘
		//경고박스 삭제
		$("#" + wbName).remove();
		//해당 유량계 팝업 블링크 삭제
		issueAlert.blink(ftrIdn, "del", fcltyCd);
	},
	//이상확인
	issueCheck: function (ftrIdn, data, obj) {
		// 수질계 구분
		this.blink(ftrIdn, "add", data.fcltyCd, obj);
		
		if (data) {
			//data 있으면 warningBox 생성
			var flowCount = data.flowCount > 0 ? true : false; //이상 유량
			var pressureCount = data.pressureCount > 0 ? true : false; //이상 압력
			var qualityCount = data.qualityCount > 0 ? true : false; //이상 수질
			
			flowCount && this.fnMakeWarningBox(ftrIdn, data, obj, "Flow");
			pressureCount && this.fnMakeWarningBox(ftrIdn, data, obj, "Pressure");
			qualityCount && this.fnMakeWarningBox(ftrIdn, data, obj, "Quality");
		}
	},
	//warningBox 만들기
	fnMakeWarningBox: function (ftrIdn, data, obj, type) {
		let BK_COLOR = "#F39C12";
		let WB_TEXT = "누수";
		if (type === "Flow") {
			BK_COLOR = "#F39C12";
			WB_TEXT = "유량";
		} else if (type === "Pressure") {
			BK_COLOR = "#F29886";
			WB_TEXT = "수압";
		} else if (type === "Quality") {
			BK_COLOR = "#610B5E";
			WB_TEXT = "수질";
		}
		
		const fcltyNm = data.fcltyNm; //시설명
		const fcltyCd = data.fcltyCd; //시설
		const floNm = data.floNm; //블록명
		
		//==li가 15개 넘으면, element 마지막 li 찾아서 close()==//
		const boxEa = document.querySelector("#warnMessageArea_contents");
		if (boxEa.children.length > 14) {
			const lastEl = document.querySelectorAll(
				"#warnMessageArea_contents > li:last-child"
			);
			lastEl[0].children[1].children[0].click(); //a태그 onclick 강제실행(닫기)
		}
		
		//==warningBox 객체 생성==//
		const elsId = "warningBox" + ftrIdn + type;
		const objEl = document.querySelector("#" + elsId);
		
		if (!objEl) {
			//객체가 없으면 생성
			const els =
				"<li id='" +
				elsId +
				"'>" +
				"<label>" +
				"<a href='#' onclick='issueAlert.select(" +
				JSON.stringify(obj) +
				")'>" +
				"<img src='/js-lib/dynatree-master/doc/iconWarning_32x32.png'>" +
				"<span id='warnMessage" +
				ftrIdn +
				type +
				"'></span>" +
				"</a>" +
				"</label>" +
				"<span><a href='#' onclick='issueAlert.close(" +
				ftrIdn +
				"," +
				fcltyCd +
				',"' +
				elsId +
				"\")' class='close'>X</a></span>" +
				"</li>";
			
			$("#warnMessageArea_contents").prepend(els); //앞에 붙이기
			
			const warningEl = document.querySelector("#" + elsId);
			warningEl.style.backgroundColor = BK_COLOR; //유량, 수압, 수질에 따라 색 바뀜
			warningEl.style.border = BK_COLOR;
			
			issueAlert.isFirst = true;
		} else {
			// 객체가 존재하고 순서가 최신이 아니면 순서변경
			
			let parentEl = document.querySelector("#warnMessageArea_contents");
			parentEl.insertBefore(objEl, parentEl.children[0]);
			this.select(obj);
			issueAlert.isFirst = false;
		}
		
		$("#warnMessage" + ftrIdn + type).text(
			floNm + " 블록에 " + WB_TEXT + " 이상이 감지되었습니다."
		);
		$("#warnMessageArea").show(); //warningBox 화면 표출
		
		this.blink(ftrIdn, "add", fcltyCd, obj); //유량계 팝업 깜박임
	},
	//==box 깜박임==//
	blink  : function (id, flg, fcltyCd, obj) {
		var el;
		var layerIcon;
		// 수질계 구분.
		if (obj.ftrCde == "SA123") {
			el = document.querySelector("#qlt" + id);
			layerIcon = mainMap.map.markerQLayer[id]; //ol.Overlay 객체
		} else if (obj.ftrCde == "SA117") {
			el = document.querySelector("#flw" + id);
			layerIcon = mainMap.map.markerSfLayer[id];
		}
		
		if (flg === "add") {
			//추가
			//			L.DomUtil.addClass(layerIcon, 'blinking');  //마커 (Leaflet 기준)
			layerIcon.getElement().classList.add("blinking"); //마커 (Openlayers 기준)
			if (el) {
				//객체가 존재할 경우 팝업 깜박임
				el.parentNode.classList.add("alertPopup");
				el.parentNode.parentNode.classList.add("blinking");
				el.parentNode.parentNode.style.zIndex = 1000;
			}
			if (IS_ALARM_ON) {
				if (issueAlert.isFirst) {
					const warnAlrm = document.querySelector("#wrap_alarm");
					
					if (!warnAlrm) {
						//alam 배경화면 없으면 만든다
						let bodyAlarmHtml = '<div class="wrap_alarm" id="wrap_alarm">';
						bodyAlarmHtml +=
							'<audio autoplay loop controls id="playAudio" style="display:none;"><source src="/mp3/alarm.mp3"></audio>';
						bodyAlarmHtml += "</div>";
						
						$("body").append(bodyAlarmHtml);
						$("body").mousemove(function (event) {
							$("#wrap_alarm").remove();
						});
					}
					
					//this.select(obj); // warningBox 선택
					//setBlockInfo(fcltyCd);
					issueAlert.isFirst = false;
				}
			}
		}
		if (flg === "del") {
			//삭제
			//			L.DomUtil.removeClass(layerIcon, 'blinking');  //마커
			layerIcon.getElement().classList.remove("blinking"); //마커 (Openlayers 기준)
			if (el) {
				//객체가 존재할 경우 팝업 깜박임 삭제
				el.parentNode.classList.remove("alertPopup");
				el.parentNode.parentNode.classList.remove("blinking");
			}
		}
	},
	isFirst: true,
	coltDt : "",
};

/////////////////////////////////////
///////// 화면 팝업 관련 ////////////
/////////////////////////////////////

//-------------------------------
//시설물 오버레이어 툴바 제어
//-------------------------------
let _popupToolBar = {
	init      : function () {
		$(".popupView > a").click(function () {
			$(".popupView li").toggle();
			$(".popupView ul").toggleClass("show");
			$(".my-div-image").toggle();
		});
		$("#popCheckAll").click(function () {
			_popupToolBar.checked();
			if ($("#popCheckAll").prop("checked")) {
				$("img[src='" + iconUrl.f + "']").show();
				$("img[src='" + iconUrl.p + "']").show();
				$("img[src='" + iconUrl.q + "']").show();
				$("img[src='" + iconUrl.b + "']").show();
				$(".my-div-image").show();
			} else {
				$("img[src='" + iconUrl.f + "']").hide();
				$("img[src='" + iconUrl.p + "']").hide();
				$("img[src='" + iconUrl.q + "']").hide();
				$("img[src='" + iconUrl.b + "']").hide();
				$(".my-div-image").hide();
			}
		});
		$("#popCheckFlw").click(function () {
			_popupToolBar.controller(
				$("#popCheckFlw").prop("checked"),
				"popCheckFlw"
			);
			if ($("#popCheckFlw").prop("checked")) {
				$("img[src='" + iconUrl.f + "']").show();
			} else {
				$("img[src='" + iconUrl.f + "']").hide();
			}
		});
		$("#popCheckSflw").click(function () {
			_popupToolBar.controller(
				$("#popCheckSflw").prop("checked"),
				"popCheckSflw"
			);
			if ($("#popCheckSflw").prop("checked")) {
				$("img[src='" + iconUrl.f + "']").show();
			} else {
				$("img[src='" + iconUrl.f + "']").hide();
			}
		});
		$("#popCheckPrs").click(function () {
			_popupToolBar.controller(
				$("#popCheckPrs").prop("checked"),
				"popCheckPrs"
			);
			if ($("#popCheckPrs").prop("checked")) {
				$("img[src='" + iconUrl.p + "']").show();
			} else {
				$("img[src='" + iconUrl.p + "']").hide();
			}
		});
		$("#popCheckQlt").click(function () {
			_popupToolBar.controller(
				$("#popCheckQlt").prop("checked"),
				"popCheckQlt"
			);
			if ($("#popCheckQlt").prop("checked")) {
				$("img[src='" + iconUrl.q + "']").show();
			} else {
				$("img[src='" + iconUrl.q + "']").hide();
			}
		});
		$("#popCheckDrn").click(function () {
			_popupToolBar.controller(
				$("#popCheckDrn").prop("checked"),
				"popCheckDrn"
			);
			if ($("#popCheckDrn").prop("checked")) {
				$("img[src='" + iconUrl.q + "']").show();
			} else {
				$("img[src='" + iconUrl.q + "']").hide();
			}
		});
		$("#popCheckBlk").click(function () {
			_popupToolBar.controller(
				$("#popCheckBlk").prop("checked"),
				"popCheckBlk"
			);
			if ($("#popCheckBlk").prop("checked")) {
				$("img[src='" + iconUrl.b + "']").show();
			} else {
				$("img[src='" + iconUrl.b + "']").hide();
			}
		});
		$("#popCheckSrv").click(function () {
			_popupToolBar.controller(
				$("#popCheckSrv").prop("checked"),
				"popCheckSrv"
			);
			if ($("#popCheckSrv").prop("checked")) {
				$(".my-div-image").show();
			} else {
				$(".my-div-image").hide();
			}
		});
		$("#popCheckMng").click(function () {
			_popupToolBar.controller(
				$("#popCheckMng").prop("checked"),
				"popCheckMng"
			);
			if ($("#popCheckMng").prop("checked")) {
				$(".my-div-image").show();
			} else {
				$(".my-div-image").hide();
			}
		});
		
		this.status(); //현재 체크 상태값
	},
	checked   : function () {
		//전체선택 체크박스 클릭
		if ($("#popCheckAll").prop("checked")) {
			//해당화면에 전체 checkbox들을 체크해준다
			$("input[name=popCheck]").prop("checked", true);
			$("input[name=popCheck]").parent("label").addClass("active");
		} else {
			//해당화면에 모든 checkbox들의 체크를해제시킨다.
			$("input[name=popCheck]").prop("checked", false);
			$("input[name=popCheck]").parent("label").removeClass("active");
		}
		
		this.status(); //현재 체크 값 파악
	},
	status    : function () {
		//checked된
		
		$("input[name=popCheck]").each(function (index, item) {
			if (index > 0) {
				_popupToolBar.controller($("#" + item.id).prop("checked"), item.id);
			}
		});
	},
	controller: function (flgChecked, flg) {
		//체크상태에 따라 팝업 컨트롤
		let layer;
		
		//구분값에 따른 처리
		switch (flg) {
			case "popCheckFlw": //유량
				layer = mainMap.map.markerFLayer;
				break;
			case "popCheckPrs": //수압
				layer = mainMap.map.markerPLayer;
				break;
			case "popCheckQlt": //수질
				layer = mainMap.map.markerQLayer;
				break;
			case "popCheckDrn": //drain
				layer = mainMap.map.markerDrnLayer;
				break;
			case "popCheckBlk": //블록
				layer = mainMap.map.markerBLayer;
				break;
			case "popCheckSrv": //배수지
				layer = mainMap.map.markerSLayer;
				break;
			case "popCheckMng": //관리블록(평택)
				layer = mainMap.map.markerMLayer;
				break;
			case "popCheckSflw": // 스마트 관망 유량계
				layer = mainMap.map.markerSfLayer;
				break;
			default:
				//layer = mainMap.map.markerFLayer;
				break;
		}
		//체크유무에 따른 처리
		if (flgChecked) {
			Object.values(layer).forEach(popup => mainMap.ol_map.addOverlay(popup));
		} else {
			Object.values(layer).forEach(popup => mainMap.ol_map.removeOverlay(popup)
			);
		}
	},
};

//팝업생성
function buildpopup(type, content) {
	let record;
	let valu = 0,
		desc = "",
		idw = "",
		names = "",
		unit = "";
	
	if (content.valu) {
		valu = content.valu;
	}
	
	if (type === "instrFlow") {
		//유량계 유량순시
		
		let headerTitleArr = content.meterNm ? content.meterNm : "유량계명 미등록";
		//headerTitleArr = Array(3) ['GC3-10', '유량계', '과천3-1블록']
		
		desc = `<div class="flex_header_left" style="width:43%" >
				${headerTitleArr}
				</div>
				<div class="flex_header_right" style="width:57%">
					<div style="border: 0.2px solid darkgray">
					관리번호<br/>
					${content.ftrIdn}
					</div>`;
		desc += `</div>`;
		idw = "flw";
		names = "markerFri";
		
		let values = content.valu.split("|");
		let valueFri = values[0];
		let valuePri = values[1];
		
		valu = `
				<div class="flex_valu">
					<div class="valu_title">순시유량</div>
					<div class="valu_digit">${nvl(valueFri, "0") + " (m³/h)"}</div>
				</div>
				<div class="flex_valu">
					<div class="valu_title">압력</div>
					<div class="valu_digit">${nvl(valuePri, "0") + " (kgf/㎠)"}</div>
				</div>				
			`;
	} else if (type === "instrMng") {
		// 관리블록 (평택)
		idw = "mng";
		names = "markerMng";
	} else if (type === "instrPrss") {
		//수압계 유량순시
		
		let headerTitleArr =
			typeof content.prsNam == "string" && content.prsNam.includes("_")
				? content.prsNam.split("_")
				: content.prsNam;
		
		desc = `<div class="flex_header_left" >
				${headerTitleArr.at(0)}
				</div>
				<div class="flex_header_right" style="width:67%">
					<div style="border: 0.2px solid darkgray">${headerTitleArr.at(1)}</div>`;
		if (headerTitleArr.at(2)) {
			desc += `<div style="border: 0.2px solid darkgray">${headerTitleArr.at(
				2
			)}</div>`;
		}
		desc += `</div>`;
		
		valu = `
				<div class="flex_valu">
					<div class="valu_title">압력</div>
					<div class="valu_digit">${nvl(valu, "0") + " (kgf/㎠)"}</div>
				</div>				
			`;
		
		idw = "prss";
		names = "markerPri";
		//unit = "(kgf/㎠)";
	} else if (type === "instrQual") {
		//수질계
		let qualityUnit = ["(㎎/L)", "(NTU)", "(μS/㎝)", "(pH)", "(℃)"];
		
		/*헤더 부분 (DESC) */
		let headerTitle = content.meterNm;
		desc = `<div class="flex_header_left" >${headerTitle}</div>
				<div class="flex_header_right" style="width:67%">
					<div style="border: 0.2px solid darkgray">${"관리번호:" + content.ftrIdn}</div>`;
		if (content.bsmIdn) {
			desc += `<div style="border: 0.2px solid darkgray">${content.bsmIdn}</div>`;
		} else {
			desc += `<div style="border: 0.2px solid darkgray"> - </div>`;
		}
		desc += `</div>`;
		
		idw = "qlt";
		names = "markerQlt";
		
		let [valueCli, valueTbi, valueEc, valuePhi, valueTei] = content.valu.split("|");
		
		valu = `
        <div class="flex_valu">
            <div class="valu_title">잔류염소</div>
            <div class="valu_digit">${
			Number(nvl(valueCli, "0")) + " " + qualityUnit[1]
		}</div>
        </div>
        <div class="flex_valu">
            <div class="valu_title">탁도</div>
            <div class="valu_digit">${
			Number(nvl(valueTbi, "0")) + " " + qualityUnit[0]
		}</div>
        </div>
        <div class="flex_valu">
            <div class="valu_title">전기전도도</div>
            <div class="valu_digit">${
			Number(nvl(valueEc, "0")) + " " + qualityUnit[3]
		}</div>
        </div>
        <div class="flex_valu">
            <div class="valu_title">pH</div>
            <div class="valu_digit">${
			Number(nvl(valuePhi, "0")) + " " + qualityUnit[2]
		}</div>
        </div>
        <div class="flex_valu">
            <div class="valu_title">수온</div>
            <div class="valu_digit">${
			Number(nvl(valueTei, "0")) + " " + qualityUnit[4]
		}</div>
        </div>`;
	} else if (type === "blockFlow") {
		//블럭 유량순시
		
		desc = `<div class="flex_header_left" >
				${content.fcltyNm}
				</div>
				<div class="flex_header_right" style="width:67%">
					<div style="border: 0.2px solid darkgray"> - </div>`;
		desc += `<div style="border: 0.2px solid darkgray">${
			"관리번호" + content.fcltyKor
		}</div>`;
		desc += `</div>`;
		
		idw = "blk";
		names = "markerFrib";
		
		valu = `
				<div class="flex_valu">
					<div class="valu_title">순시유량</div>
					<div class="valu_digit">${nvl(valu, "0") + " (m³/h)"}</div>
				</div>				
			`;
	} else if (type === "servFlow") {
		//배수지 유량 압력
		desc = content.tagDesc ? content.tagDesc.replace("|", "<br>") : "";
		idw = "srv";
		names = "markerSrv";
		
		let values = content.valu.split("|");
		let valueFri = values[0];
		let valuePri = values[1];
		valu =
			nvl(valueFri, "0") +
			"(m³/h)" +
			"<br><br><br>" +
			nvl(valuePri, "0") +
			"(kgf/㎠)";
		
		//자동드레인
	} else if (type === "DRN") {
		let locLoc = content.locLoc;
		// 'GC-10'
		let headerTitleArr = content.floNm.split(" ");
		
		desc = `<div class="flex_header_left" >${locLoc}</div>
				<div class="flex_header_right" style="width:67%">
					<div style="border: 0.2px solid darkgray">${headerTitleArr.at(1)}</div>`;
		desc += `<div style="border: 0.2px solid darkgray">${headerTitleArr.at(0)}</div>`;
		desc += `</div>`;
		
		idw = "drn";
		names = "markerDrn";
		
		let values = content.val.split("|");
		let tagSeCds = content.tagSeCd.split("|");
		
		let value0 =
			isNaN(Number(values[0])) == true
				? values[0]
				: Number(values[0]).toFixed(1);
		let value1 =
			isNaN(Number(values[1])) == true
				? values[1]
				: Number(values[1]).toFixed(1);
		let value2 =
			isNaN(Number(values[2])) == true
				? values[2]
				: Number(values[2]).toFixed(1);
		let value3 =
			isNaN(Number(values[3])) == true
				? values[3]
				: Number(values[3]).toFixed(1);
		let value4 =
			isNaN(Number(values[4])) == true
				? values[4]
				: Number(values[4]).toFixed(1);
		let value5 =
			isNaN(Number(values[5])) == true
				? values[5]
				: Number(values[5]).toFixed(1);
		let value6 =
			isNaN(Number(values[6])) == true
				? values[6]
				: Number(values[6]).toFixed(1);
		
		valu = `
				<div class="flex_valu">
					<div class="valu_title">${getTitle(tagSeCds[0])}</div>
					<div class="valu_digit">${nvl(value0, "-") + getUnit(tagSeCds[0])}</div>
				</div>
				<div class="flex_valu">
					<div class="valu_title">${getTitle(tagSeCds[1])}</div>
					<div class="valu_digit">${nvl(value1, "-") + getUnit(tagSeCds[1])}</div>
				</div>
				<div class="flex_valu">
					<div class="valu_title">${getTitle(tagSeCds[2])}</div>
					<div class="valu_digit">${nvl(value2, "-") + getUnit(tagSeCds[2])}</div>
				</div>
				<div class="flex_valu">
					<div class="valu_title">${getTitle(tagSeCds[3])}</div>
					<div class="valu_digit">${nvl(value3, "-") + getUnit(tagSeCds[3])}</div>
				</div>
				<div class="flex_valu">
					<div class="valu_title">${getTitle(tagSeCds[4])}</div>
					<div class="valu_digit">${nvl(value4, "-") + getUnit(tagSeCds[4])}</div>
				</div>
				<div class="flex_valu">
					<div class="valu_title">${getTitle(tagSeCds[5])}</div>
					<div class="valu_digit">${nvl(value5, "-") + getUnit(tagSeCds[5])}</div>
				</div>
				<div class="flex_valu">
					<div class="valu_title">${getTitle(tagSeCds[6])}</div>
					<div class="valu_digit">${nvl(value6, "-") + getUnit(tagSeCds[6])}</div>
				</div>
					
				`;
	} else if (type === "meterDRN") { //울진 신규
		// console.log('ln 1204 | buildPopup');
		const meterInfo = content.meterObj;
		content.ftrIdn = meterInfo.ftrIdn;
		// console.log(content);
		const tagInfo = content.tagObj;
		
		let headerTitle = meterInfo.meterNm;
		
		desc = `<div class="flex_header_left" >${headerTitle}</div>
				<div class="flex_header_right" style="width:67%">
						<div style="border: 0.2px solid darkgray">관리번호: ${meterInfo.ftrIdn}, ${meterInfo.blockNm} 블록</div>
						<div style="border: 0.2px solid darkgray">${meterInfo.locLoc}</div>
						<div class="refeshTime" style="border: 0.2px solid darkgray">갱신시간: ${meterInfo.timeBasis}</div>
				</div>`;
		
		idw = "drn";
		names = "meterDRN";
		
		//울진 스마트관망 자동드레인은 탁도 또는 잔류염소 중 하나를 표시함
		//각 계측기마다 둘 중 하나의 정보가 입력되어 있음
		let tempQltyTitle, tempQltyValu, tempQltyUnit = '';
		if (tagInfo.chrn.tagSn) {
			tempQltyTitle = '잔류염소';
			tempQltyValu = tagInfo.chrn.valu;
			tempQltyUnit = tagInfo.chrn.unit;
		} else {
			tempQltyTitle = '탁도';
			tempQltyValu = tagInfo.turb.valu;
			tempQltyUnit = tagInfo.turb.unit;
		}
		
		valu = `<div class="drain_uj" xmlns="http://www.w3.org/1999/html">
					<div class="flex_valu">
						<div class="valu_title ">주벨브<br>${tagInfo.mainValv.unit}</div>
						<div class="valu_digit mainValv">${tagInfo.mainValv.valu}</div>
					</div>
					<div class="flex_valu">
						<div class="valu_title">퇴수벨브<br>${tagInfo.exitValv.unit}</div>
						<div class="valu_digit exitValv">${tagInfo.exitValv.valu}</div>
					</div>
					<div class="flex_valu">
						<div class="valu_title">흡입압력<br>${tagInfo.inPres.unit}</div>
						<div class="valu_digit inPres">${tagInfo.inPres.valu}</div>
					</div>
					<div class="flex_valu">
						<div class="valu_title">토출압력<br>${tagInfo.outPres.unit}</div>
						<div class="valu_digit outPres">${tagInfo.outPres.valu}</div>
					</div>
					<div class="flex_valu">
						<div class="valu_title">${tempQltyTitle} ${tempQltyUnit}</div>
						<div class="valu_digit tempQlt">${tempQltyValu}</div>
					</div>
					<div class="flex_valu">
						<div class="valu_title">제어반상태</div>
						<div class="valu_digit workStat">${tagInfo.workStat.valu}</div>
					</div>
					<div class="flex_valu">
						<div class="valu_title">드레인상태</div>
						<div class="valu_digit drainStat">${tagInfo.drainStat.valu}</div>
					</div>
					<div class="flex_valu">
						<div class="valu_title">경보현황</div>
						<div class="valu_digit cnntStat">${tagInfo.cnntStat.valu}</div>
					</div>
				</div>`;
	}
	
	valu = isNaN(Number(valu)) == false ? Number(valu).toFixed(1) : valu;
	
	let info = `<div id="${idw + content.ftrIdn}"
					name="${names}" style='cursor:pointer; position: relative;' data-toggle="tooltip" data-placement="top"
					title="더블클릭시 팝업 위치 이동">
    				<div class="index flex_header_container" style=" ">${desc}</div>
    				<div class="flex_valu_container">${valu + unit}</div>
    			</div>`;
	return info;
}

/*
//마커[팝업] 클릭시
function fn_markerClick(obj) {
	
	//로드뷰 팝업
	if($('#blockInfo').is(":visible") ){
		$('#blockInfo').hide();
	}
	if(obj.ftrCde == "SA123"){
		$('#instrmtInfo').hide();
		$('#wameInfo').show();
		wameInfo.init(obj.ftrCde, obj.ftrIdn);
	}else if(obj.ftrCde == "SA117" || obj.ftrCde == "SA121"){
		$('#wameInfo').hide();
		$('#instrmtInfo').show();
		searchAnchorDetail(obj.ftrIdn , obj.ftrCde);
	}
}
*/

//마커[팝업] 클릭시
function fn_markerClick(obj) {
	//로드뷰 팝업
	if ($("#blockInfo").is(":visible")) {
		$("#blockInfo").hide();
	}
	
	//우측 상세정보창 모두 닫기
	document
	.querySelectorAll(".rightPuDiv")
	.forEach((elem) => (elem.style.display = "none"));
	
	/*
	  setRightPopTitle(fcltyNm, meterNm);
	  getInfo_BlockCommon(fcltyFtrIdn);
	  
	  //[개별] 수질계 우측상황판 팝업 열기
	  if(id==='gridQltyMini'){
		  document.querySelector('#qltyInfo').style.display='block';
		  mainMap_right_qlty.init(TABLENAME,ftrIdn);
		  
	  } else if (id=='gridFlowMini'){
		  document.querySelector('#flowInfo').style.display='block';
		  mainMap_right_flow.meter.fcltyCd = fcltyCd;
		  mainMap_right_flow.init(TABLENAME,ftrIdn);
	  }
	  */
	
	setRightPopTitle(obj.fcltyNm, obj.meterNm);
	//TODO 블록별 수용가 정보가 나오기 전 까지 주석처리
	//	getInfo_BlockCommon(obj.fcltyCd);
	if (obj.ftrCde == "SA123") {
		document.querySelector("#qltyInfo").style.display = "block";
		mainMap_right_qlty.init("WTL_WAME_PS", obj.ftrIdn);
	} else if (obj.ftrCde == "SA117") {
		document.querySelector("#flowInfo").style.display = "block";
		mainMap_right_flow.meter.fcltyCd = obj.fcltyCd;
		mainMap_right_flow.init("WTL_FLOW_PS", obj.ftrIdn);
	}
}

//오버레이 생성
function fn_makeMarkerPop(latlng, obj, flg) {
	let arrIdx = 0;
	let positioningArr = ["top-right", "bottom-right", "bottom-left", "top-left"];
	let offsetArr = [
		[-10, 15],
		[-10, -10],
		[15, -15],
		[15, 15],
	];
	//latlng 는 Leaflet 사용할 때 객체, Openlayers 에서 [x, y] 배열
	let position;
	if (latlng instanceof Array) {
		position = latlng;
	} else {
		console.log("좌표가 array 가 아님", obj);
		return null;
	}
	let overlay;
	let container;
	if (flg === "FRI") {
		//유량계
		container = document.createElement("div");
		container.classList.add("ol-popup-custom");
		container.innerHTML = buildpopup("instrFlow", obj);
		document.body.appendChild(container);
		
		overlay = new ol.Overlay({
			                         id         : "overlay_flw" + obj.ftrIdn,
			                         position   : position,
			                         offset     : [15, 15],
			                         positioning: "top-left", //포인트 좌표에서의 팝업 위치 'center-center' 'bottom-left' 'top-left'
			                         element    : container,
			                         className  : "custom-green-popup",
		                         });
		
		mainMap.map.markerFLayer[obj.ftrIdn] = overlay;
	}
	if (flg === "PRI") {
		//수압계
		container = document.createElement("div");
		container.classList.add("ol-popup-custom");
		container.innerHTML = buildpopup("instrPrss", obj);
		document.body.appendChild(container);
		
		overlay = new ol.Overlay({
			                         position   : position,
			                         offset     : [15, 15],
			                         positioning: "top-left", //포인트 좌표에서의 팝업 위치 'center-center' 'bottom-left' 'top-left'
			                         element    : container,
			                         className  : "custom-popup",
		                         });
		
		mainMap.map.markerPLayer[obj.ftrIdn] = overlay;
	}
	
	if (flg === "QLT") {
		// 수질계 (평택 추가)
		container = document.createElement("div");
		container.classList.add("ol-popup-custom");
		container.innerHTML = buildpopup("instrQual", obj);
		document.body.appendChild(container);
		
		overlay = new ol.Overlay({
			                         position   : position,
			                         offset     : [15, 15],
			                         positioning: "top-left", //포인트 좌표에서의 팝업 위치 'center-center' 'bottom-left' 'top-left'
			                         element    : container,
			                         className  : "custom-skyblue-popup",
		                         });
		
		mainMap.map.markerQLayer[obj.ftrIdn] = overlay;
	}
	
	if (flg === "MNG") {
		// 관리블록 (평택 추가)
		container = document.createElement("div");
		container.classList.add("ol-popup-custom");
		container.innerHTML = buildpopup("instrMng", obj);
		document.body.appendChild(container);
		
		overlay = new ol.Overlay({
			                         position   : position,
			                         offset     : [15, 15],
			                         positioning: "top-left", //포인트 좌표에서의 팝업 위치 'center-center' 'bottom-left' 'top-left'
			                         element    : container,
			                         className  : "custom-mng-popup",
		                         });
		
		mainMap.map.markerMLayer[obj.ftrIdn] = overlay;
	}
	
	if (flg === "BLK") {
		//블록 유량계
		container = document.createElement("div");
		container.classList.add("ol-popup-custom");
		container.innerHTML = buildpopup("blockFlow", obj);
		document.body.appendChild(container);
		
		overlay = new ol.Overlay({
			                         position   : position,
			                         offset     : [15, 15],
			                         positioning: "top-left", //포인트 좌표에서의 팝업 위치 'center-center' 'bottom-left' 'top-left'
			                         element    : container,
			                         className  : "custom-red-popup",
		                         });
		mainMap.map.markerBLayer[obj.ftrIdn] = overlay;
	}
	
	if (flg === "DRN") {
		//자동드레인
		container = document.createElement("div");
		container.classList.add("ol-popup-custom");
		container.innerHTML = buildpopup("DRN", obj);
		document.body.appendChild(container);
		
		overlay = new ol.Overlay({
			                         position   : position,
			                         offset     : [15, 15],
			                         positioning: "top-left", //포인트 좌표에서의 팝업 위치 'center-center' 'bottom-left' 'top-left'
			                         element    : container,
			                         className  : "custom-red-popup",
		                         });
		mainMap.map.markerBLayer[obj.ftrIdn] = overlay;
	}
	
	if (flg === "meterDRN") {
		//울진자동드레인 (신규)
		container = document.createElement("div");
		container.classList.add("ol-popup-custom");
		container.innerHTML = buildpopup("meterDRN", obj);
		document.body.appendChild(container);
		
		overlay = new ol.Overlay({
			                         position   : position,
			                         offset     : [15, 15],
			                         positioning: "top-left", //포인트 좌표에서의 팝업 위치 'center-center' 'bottom-left' 'top-left'
			                         element    : container,
			                         className  : "custom-red-popup",
		                         });
		mainMap.map.markerDrnLayer[obj.meterObj.ftrIdn] = overlay;
	}
	
	
	$(container).on("click", function (e) {
		fn_markerClick(obj);
	});
	
	$(container).on("dblclick", function (e) {
		overlay.setPositioning(positioningArr[arrIdx]);
		overlay.setOffset(offsetArr[arrIdx]);
		arrIdx >= 3 ? (arrIdx = 0) : arrIdx++;
	});
}

//개별

//계측기 값
function fn_getInstrmnt() {
	//이상 경고 영역
	$.ajax({
		       url     : contextPath + "getInstrmnt.do",
		       type    : "GET",
		       dataType: "JSON",
		       async   : "true",
		       success : function (result) {
			       issueAlert.coltDt = result.coltDt; //이슈체크 날짜
			       //유량계 순시
			       if (result.dataFri.length > 0) {
				       for (const element of result.dataFri) {
					       let latlngFri = ol.proj.transform(
						       [Number(element.x), Number(element.y)],
						       GisApp.SHP_PROJ,
						       GisApp.BASE_MAP_PROJ
					       );
					       let values = element.valu.split("|");
					       let valueFri = values[0];
					       let valuePri = values[1];
					
					       if (!valueFri) valueFri = "0";
					
					       if (!valuePri) valuePri = "0";
					       if (
						       mainMap.map.markerFLayer &&
						       mainMap.map.markerFLayer[element.ftrIdn]
					       ) {
						       let valuText =
							       nvl(valueFri, "0") +
							       "(m³/h)" +
							       "<br><br><br>" +
							       nvl(valuePri, "0") +
							       "(kgf/㎠)";
						       $("#flw" + element.ftrIdn + "> li")
						       .eq(1)
						       .html(valuText);
						       //warning box
						       if (element.warn) {
							       issueAlert.init(element.ftrIdn, element.warn, element); //이상 있을 시 깜박임 처리
						       }
					       } else if (
						       mainMap.map.markerSfLayer &&
						       mainMap.map.markerSfLayer[element.ftrIdn]
					       ) {
						       let valuText =
							       nvl(valueFri, "0") +
							       "(m³/h)" +
							       "<br><br><br>" +
							       nvl(valuePri, "0") +
							       "(kgf/㎠)";
						       $("#flw" + element.ftrIdn + "> li")
						       .eq(1)
						       .html(valuText);
						       if (abnorList) {
							       for (var j = 0; j < abnorList.length; j++) {
								       if (element.ftrIdn === abnorList[j].ftrIdn) {
									       issueAlert.init(abnorList[j].ftrIdn, abnorList, element); //이상 있을 시 깜박임 처리
								       }
							       }
						       }
						       //warning box
						       if (element.warn) {
							       issueAlert.init(element.ftrIdn, element.warn, element); //이상 있을 시 깜박임 처리
						       }
					       } else {
						       fn_makeMarkerPop(latlngFri, element, "FRI");
					       }
				       }
			       }
			
			       //수압계 수압
			       //			if(result.dataPri.length > 0 ){
			       //
			       //				for(var i=0; i < result.dataPri.length; i++){
			       //					if(!result.dataPri[i].x) continue ;
			       //					var latlngPri = ol.proj.transform([Number(result.dataPri[i].y), Number(result.dataPri[i].x)], GisApp.SHP_PROJ, GisApp.BASE_MAP_PROJ);
			       //					var valuePri = result.dataPri[i].valu;
			       //
			       //					if(!valuePri){
			       //						valuePri = "0";
			       //					}
			       //					if(mainMap.map.markerPLayer && mainMap.map.markerPLayer[result.dataPri[i].ftrIdn]){
			       //						var valuText = nvl(valuePri,"0")+"(kgf/㎠)<br>";
			       //						$('#prss'+result.dataPri[i].ftrIdn + '> li').eq(1).html(valuText);
			       //					}else{
			       //						fn_makeMarkerPop( latlngPri,  result.dataPri[i]  , 'PRI');
			       //					}
			       //				}
			       //			}
		       },
		       error   : function (request, error) {
			       alert("message: " + request.responseText + ", error:" + error);
		       },
	       });
}
//블럭 유량값
function fn_getBlockFlow() {
	$.ajax({
		       url     : contextPath + "getBlockRecentFlow.do",
		       type    : "get",
		       dataType: "json",
		       success : function (result, textStatus, jqXHR) {
			       if (result.dataFri.length > 0) {
				       for (var i = 0; i < result.dataFri.length; i++) {
					       var latlngFri = ol.proj.transform([Number(result.dataFri[i].x), Number(result.dataFri[i].y)],
					                                         GisApp.SHP_PROJ,
					                                         GisApp.BASE_MAP_PROJ
					       );
					       var valueFri = result.dataFri[i].valu;
					
					       if (!valueFri) {
						       valueFri = "0";
					       }
					
					       if (mainMap.map.markerBLayer[result.dataFri[i].ftrIdn]) {
						       $("#blk" + result.dataFri[i].ftrIdn + "> li")
						       .eq(1)
						       .text(valueFri + "(m³/h)");
					       } else {
						       fn_makeMarkerPop(latlngFri, result.dataFri[i], "BLK");
						       if (!$("img[src='" + iconUrl + "']").prop("checked")) {
							       $("img[src='" + iconUrl + "']").hide();
						       }
					       }
				       }
			       }
		       },
	       });
}

function fn_getManageBlock() {
	$.ajax({
		       url     : contextPath + "getManageBlock.do",
		       type    : "get",
		       dataType: "json",
		       success : function (result, textStatus, jqXHR) {
			       if (result.dataFri.length > 0) {
				       for (const element of result.dataFri) {
					       let latlngFri = ol.proj.transform(
						       [Number(element.x), Number(element.y)],
						       GisApp.SHP_PROJ,
						       GisApp.BASE_MAP_PROJ
					       );
					       let valueFri = element.valu;
					
					       if (!valueFri) {
						       valueFri = "0";
					       }
					
					       if (
						       mainMap.map.markerMLayer &&
						       mainMap.map.markerMLayer[element.ftrIdn]
					       ) {
						       $("#mng" + element.ftrIdn + "> li")
						       .eq(1)
						       .text(valueFri + "(m³/h)");
					       } else {
						       fn_makeMarkerPop(latlngFri, element, "MNG");
						       if (!$("img[src='" + iconUrl + "']").prop("checked")) {
							       $("img[src='" + iconUrl + "']").hide();
						       }
					       }
				       }
			       }
		       },
	       });
}

// 수질계
function fn_getWaterQuality() {
	let qualityUnit = ["(NTU)", "(㎎/L)", "(pH)", "(㎲/㎝)", "(℃)"];
	
	$.ajax({
		       url     : contextPath + "getWaterQuality.do",
		       type    : "get",
		       dataType: "json",
		       success : function (result, textStatus, jqXHR) {
			       if (result.data.length > 0) {
				       for (const element of result.data) {
					       //					var latlngQlt = changeProj(result.data[i].x ,result.data[i].y, _defCrs);
					       let latlngQlt = ol.proj.transform([Number(element.x), Number(element.y)], GisApp.SHP_PROJ, GisApp.BASE_MAP_PROJ);
					       let values = element.valu ? element.valu.split("|") : ['0', '0', '0', '0', '0'];
					       let valueTbi = values[0];
					       let valueCli = values[1];
					       let valuePhi = values[2];
					       let valueEc = values[3];
					       let valueTei = values[4];
					
					       if (!valueTbi) {
						       valueTbi = "0";
					       } else if (!valueCli) {
						       valuCli = "0";
					       } else if (!valuePhi) {
						       valuePhi = "0";
					       } else if (!valueTei) {
						       valueTei = "0";
					       } else if (!valueEc) {
						       valueEc = "0";
					       }
					
					       if (
						       mainMap.map.markerQLayer &&
						       mainMap.map.markerQLayer[element.ftrIdn]
					       ) {
						       valu = Number(nvl(valueTbi, "0")) + qualityUnit[0] + "<br><br><br>";
						       valu +=
							       Number(nvl(valueCli, "0")) + qualityUnit[1] + "<br><br><br>";
						       valu +=
							       Number(nvl(valuePhi, "0")) + qualityUnit[2] + "<br><br><br>";
						       valu += Number(nvl(valueEc, "0")) + qualityUnit[3] + "<br><br><br>";
						       valu += Number(nvl(valueTei, "0")) + qualityUnit[4];
						       $("#qlt" + element.ftrIdn + "> li")
						       .eq(1)
						       .html(valu);
						       if (abnorList !== undefined) {
							       for (var j = 0; j < abnorList.length; j++) {
								       if (element.ftrIdn === abnorList[j].ftrIdn) {
									       issueAlert.init(abnorList[j].ftrIdn, abnorList, element); //이상 있을 시 깜박임 처리
								       }
							       }
						       }
					       } else {
						       if (!element.valu) element.valu = '0|0|0|0|0';
						       fn_makeMarkerPop(latlngQlt, element, "QLT");
						       if (!$("img[src='" + iconUrl + "']").prop("checked")) {
							       $("img[src='" + iconUrl + "']").hide();
						       }
					       }
				       }
			       }
		       },
	       });
}

/**
 * 태그, GIS 데이터, 계측기 일반 데이터를 조회
 * @param meterType {String} 계측기 공종 (one of 'drain' 'qlty' 'flow')
 * @returns {Promise<any>} JSON Map. KEY: realtime, meterinfo, taginfo
 */
async function getTagGisInfo(meterType) {
	const URL = contextPath + "meters/ajax/getTagGisInfo.do";
	const res = await fetch(URL + '?' + new URLSearchParams({meterType: meterType}), {
		method : "GET",
		headers: {"Content-Type": "application/json"},
	});
	return await res.json();
}

/**
 * 자동드레인용 Openlayers 객체인 Overlay 를 생성하기 위한 API 통신과 데이터 처리
 * */
function fn_getWaterDrain() {
	getTagGisInfo('drain').then(res => {
		const result = res['data'];
		// console.log(result);
		const realtimeData = result['realtime'];
		/*
		TAG_SN      |COLT_DT            |VALU|
		-------------+--------------------+----+
		울진453PRTO003 | 2023-07-28 17:30 | 12.5
		울진453PRTO004 | 2023-07-28 17:30 | 0.5
		*/
		
		const meterInfo = result['meterinfo'];
		/*
		 FTR_IDN|METER_NM  |ADDRESS                 |BLOCK_NM|X               |Y               |
		 -------+----------+------------------------+--------+----------------+----------------+
		 8      |자동드레인-울진-1|경상북도 울진군 매화면 오산리 1040-7 |근남1-1   |236967.147013403|476716.328508096|
		 9      |자동드레인-울진-2|경상북도 울진군 죽변면 화성리 1215-2 |농공1-2   |232808.901810003|494912.261827861|
		*/
		if (!meterInfo instanceof Array) return;
		
		const tagInfo = result['taginfo'];
		/*
		FTR_IDN|TAG_SN      |TAG_DESC          |TAG_SE_CD|UNIT |TAG_SE_NM|
		-------+------------+------------------+---------+-----+---------+
		8      |울진453PRTO003|자동드레인 오산리 흡입압력    |PRI      |kgf/㎠|압력       |
		8      |울진453PRTO004|자동드레인 오산리 토출압력    |PRI      |kgf/㎠|압력       |
		*/
		
		meterInfo.forEach(el => {
			const ftrIdn = el['ftrIdn']; //'14','15',...
			
			if (mainMap.map.markerDrnLayer[ftrIdn]) { //이미 발행된 오버레이어 객체라면
				//기존 HTML DIV 객체 내용 변경
				if (realtimeData instanceof Array && realtimeData.length > 0) {
					deployOverlayData('drain', ftrIdn, realtimeData);
				} else {
					console.log(`자동드레인 태그값 조회결과 없음`);
				}
			} else { //오버레이어 새로 생성
				
				const timeBasis = realtimeData instanceof Array && realtimeData.length > 0 ? realtimeData[0].coltDt : '-';
				const latlngQlt = ol.proj.transform([Number(el.x), Number(el.y)], GisApp.SHP_PROJ, GisApp.BASE_MAP_PROJ);
				
				//1. 팝업 생성을 위한 데이터 전처리
				
				/* DRAIN_FTRIDN_TAGMAPS[10]
				10: {
						chrn     : '',
						turb     : '울진451TBTO002',  //자동드레인 나곡리 탁도값      TBI
						outPres  : '울진451PRTO004',  //자동드레인 나곡리 토출압력     PRI
						inPres   : '울진451PRTO003',  //자동드레인 나곡리 흡입압력     PRI
						drainStat: '울진451PMTO007',  //자동드레인 나곡리 드레인상태    SYA
						workStat : '울진451SYTO001',  //자동드레인 나곡리 동작상태     SYA
						cnntStat : '울진451SWTO008',  //자동드레인 나곡리 통신이상     SYB
						mainValv : '울진451VVTO005',  //자동드레인 나곡리 주밸브 개도율  VVI
						exitValv : '울진451VVTO006',  //자동드레인 나곡리 퇴수밸브 개도율 VVI
					  },
				*/
				let tempTagObj = Object.entries(DRAIN_FTRIDN_TAGMAPS[ftrIdn]).reduce((pre, cur) => {
					const tagSn = cur[1];
					
					const tempObj = {};
					tempObj.tagSn = tagSn;
					
					const tempTagInfo = tagInfo.find(el => el.tagSn == tagSn);
					const realtimeInfo = realtimeData ? realtimeData.find(el => el.tagSn === tagSn) : null;
					if (tempTagInfo) {
						tempObj.tagDesc = tempTagInfo.tagDesc;
						tempObj.unit = tempTagInfo.unit;
						tempObj.tagSeNm = tempTagInfo.tagSeNm;
						tempObj.valu = realtimeInfo ? realtimeInfo.valu : '-';
					}
					pre[cur[0]] = tempObj;
					// console.log(tempObj);
					return pre;
				}, {});
				/*
					chrn       :{tagSn: ''}
					cnntStat   :{tagSn: '울진451SWTO008', tagDesc: '자동드레인 나곡리 통신이상', unit: null, tagSeNm: '통신이상'}
					drainStat  :{tagSn: '울진451PMTO007', tagDesc: '자동드레인 나곡리 드레인상태', unit: null, tagSeNm: '통신상태'}
					exitValv   :{tagSn: '울진451VVTO006', tagDesc: '자동드레인 나곡리 퇴수밸브 개도율', unit: '%', tagSeNm: '밸브개도율'}
					inPres     :{tagSn: '울진451PRTO003', tagDesc: '자동드레인 나곡리 흡입압력', unit: 'kgf/㎠', tagSeNm: '압력'}
					mainValv   :{tagSn: '울진451VVTO005', tagDesc: '자동드레인 나곡리 주밸브 개도율', unit: '%', tagSeNm: '밸브개도율'}
					outPres    :{tagSn: '울진451PRTO004', tagDesc: '자동드레인 나곡리 토출압력', unit: 'kgf/㎠', tagSeNm: '압력'}
					turb       :{tagSn: '울진451TBTO002', tagDesc: '자동드레인 나곡리 탁도값', unit: 'NTU', tagSeNm: '탁도'}
					workStat   :{tagSn: '울진451SYTO001', tagDesc: '자동드레인 나곡리 동작상태', unit: null, tagSeNm: '통신상태'}
				*/
				
				let overlayerContentObj = {};
				overlayerContentObj.tagObj = tempTagObj;
				overlayerContentObj.meterObj = meterInfo instanceof Array ? meterInfo.find(el => el.ftrIdn == ftrIdn) : '';
				overlayerContentObj.meterObj.timeBasis = timeBasis;
				// console.log(overlayerContentObj);
				//2. 팝업 생성
				fn_makeMarkerPop(latlngQlt, overlayerContentObj, "meterDRN");
				if (!$("img[src='" + iconUrl + "']").prop("checked")) {
					$("img[src='" + iconUrl + "']").hide();
				}
			}
		});
	});
}

/**
 * Openlayers:overlay 객체에 특정 계측기, 관리번호 정해서 실시간 데이터를 배치함
 * @param meterType {String} 계측기 속성 (one of 'drain','qlty','flow')
 * @param ftrIdn {String|Number} 계측기 관리번호
 * @param realtimeData {Array} keyArr:['tagSn', 'coltDt', 'valu']
 */
function deployOverlayData(meterType, ftrIdn, realtimeData) {
	if (realtimeData instanceof Array && realtimeData.length > 0) {
		let idw;
		switch (meterType) {
			case 'drain' :
			default :
				idw = 'drn';
				break;
			case 'qlty' :
				idw = 'qlt';
				break;
			case 'flow' :
				idw = 'flw';
				break;
		}
		if (meterType == 'drain') {
			/*
				{----prop---:----tag---------
					chrn    : '',
					turb    : '울진451TBTO002',
					outPres : '울진451PRTO004',
					inPres  : '울진451PRTO003',
					drainStat   : '울진451PMTO007',
					workStat    : '울진451SYTO001',
					cnntStat    : '울진451SWTO008',
					mainValv    : '울진451VVTO005',
					exitValv    : '울진451VVTO006',
				}
			*/
			let targetNodes = document.querySelector(`#${idw}${ftrIdn}`);
			Object.entries(DRAIN_FTRIDN_TAGMAPS[ftrIdn]).forEach(([prop, tag]) => {
				if (tag) {
					const digitValu = realtimeData.find(data => data.tagSn == tag);
					let valu = digitValu ? digitValu.valu : '-';
					if (prop == 'chrn' || prop == 'turb') {
						targetNodes.querySelector(`.tempQlt`).textContent = valu;
					} else {
						targetNodes.querySelector(`.${prop}`).textContent = valu;
					}
				}
			})
		}
		
		
		//이상 있을 때 알람처리
		/*
		if (abnorList !== undefined) {
			 for (let j = 0; j < abnorList.length; j++) {
			   if (element.ftrIdn === abnorList[j].ftrIdn) {
				 issueAlert.init(abnorList[j].ftrIdn, abnorList, element); //이상 있을 시 깜박임 처리
			   }
			 }
		   }
		* */
	}
}