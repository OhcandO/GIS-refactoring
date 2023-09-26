/**
	gis 속성정보로 조건검색 기능 모듈
 * 	Openlayers6 + Geoserver 기반
 	
	  required |
			의존모듈: 
			  Openlayers, GisApp (gis.core.js, gis.select.js, gis.layer.js, gis.style.js)
			js	: searchHtmlArray.js, detailHtmlArray.js
 */

let gisSearch = {
	default: {
		target_rsltId: "gisSearchResult", //검색결과가 append 될 영역
		target_ctrlId: "gisSearchControl", //검색 버튼 등이 위치할 영역
		target_treeId: "tree-layer-control", //jsTree 아이디
	},

	ol_map: null, // instanceof ol.Map
	ol_select: null, // instanceof ol.interaction.select

	searchCriteria: [], //검색 조건
	typeName: null, //레이어 이름

	allFeatureArray_ol: [],   //typeName 에 해당하는 전체 feature 의 Array
	filteredFeatureArray_ol: [], //필터링된 feature 의 Array
	tempLayer_ol: null, //하이라이트된 ol.layer.VectorImage 객체

	// tree2.do 로 불러온 <CM_LAYER2> 의 레이어 코드 객체
	tempLayerObjArr: null, //typeName 이 같은 코드 객체 배열
	tempLayerIdArr: null, //각 레이어에 붙은 고유 아이디 배열
	tempTreeIdArr: null, //jsTree 객체 컨트롤 위한 노드 아이디 배열

	//   mapOptions:	{targetId: "map", //DIV 이름
	//   },

	setSearchOption: (searchObj) => {
		gisSearch.searchOption = {};
		Object.assign(this.searchOption, searchObj);
	},

	//상세 조건검색창 활성화시
	init: function(optionObj) {
		Object.assign(this.default, optionObj);
		this.clearTemps();

		if (GisApp) {
			this.ol_map = GisApp.Module.core.map;
			this.ol_select = GisApp.Module.select.selectInteraction;
		}
		/** 버튼 이벤트 등록 **/
		//레이어 검색 셀렉트 박스 변경시 이벤트
		$("#S_LAYER").on("change", function(e) {
			$("#detailInfo").hide();
		});

		//검색버튼으로 찾기 이벤트 시작
		$("#searchFeature,#detailSearchFeature").on("click", function(e) {
			searchFeature();
		});

		$("#resetSearchFeature").on("click", function(e) {
			$('#S_FTR_IDN').val('');
			$("#searchFeatureNum").html("0");
			$("#featureList").html(
				'<li><a href="javascript:void(0);"><span class="adr" >데이터가 존재하지 않습니다</span></a></li>'
			);

			// gisApp.resetSearchFeature();
			gisSearch.clearTemps();
		});

		//상세 검색 버튼 클릭시 팝업생성 이벤트
		$("#detailSearchPopupView").on("click", function(e) {

			var layerTableNm = $("#S_LAYER > option:selected").val();
			detailSearchForm(layerTableNm);
		});
		/** 버튼 이벤트 등록완 **/
	},

	//검색 버튼 눌렸을 때 복합 기능 수행
	perform_Search: function(typeName, criteriaArr) {
		//로딩바 시작 ---> 지도에 렌더링되면 끝

		let me = this;
		me.typeName = typeName;
		//gisSearch 내부 옵션 초기화
		// this.clearTemps();
		if (me.tempLayer_ol) {
			me.ol_map.removeLayer(this.tempLayer_ol);
			me.tempLayer_ol = null;
		}

		if (typeof criteriaArr != "undefined")
			me.searchCriteria = [...criteriaArr];

		//순서1 선택된 typeName에 해당하는 레이어 켜기
		//순서2 검색 조건으로 레이어에서 피쳐 찾기
		//순서3 피쳐들을 리스트화 하여 왼쪽 팝업에 배치
		//순서4 피쳐들로 구성된 레이어를 지도에 발행
		//순서5 2번의 발행이 완료되면 로딩바 제거
		let areFeaturesPrepared = false;

		GisApp.Module.tree.showLayerWithTreeThroughTableName_Promise(typeName).catch(console.log)
			.then(function() {
				me.findAndSetLayerCodeObjWithTypename(typeName);
				areFeaturesPrepared = me.preparingHighlightFeatures(me.searchCriteria);
				//				console.log('areFeaturesPrepared',areFeaturesPrepared);
			})
			.then(function() {
				if (areFeaturesPrepared) {
					console.time('리스트 구성 지연시간 :')
					me.displayingFeatureList(typeName, me.filteredFeatureArray_ol);
					console.timeEnd('리스트 구성 지연시간 :')
					me.creatingTempOlLayerWithFeatures(me.filteredFeatureArray_ol);
				} else {
					console.log('피쳐 없어 초기화');
					$("#resetSearchFeature").click();
					hideWrapLoading();
				}
			});
	},

	//일부 초기화는 typeName 
	clearTemps: function(resetAll_bln = true) {
		if (resetAll_bln) {
			this.typeName = null;

		}
		this.searchCriteria = [];
		this.tempLayerObjArr = null;
		this.tempLayerIdArr = null;
		this.tempTreeIdArr = null;

		/*openlayers 관련 객체 초기화*/

		if (resetAll_bln) {
			this.allFeatureArray_ol = [];
		}
		this.filteredFeatureArray_ol = [];
		this.clearSelection();
		if (this.tempLayer_ol) this.ol_map.removeLayer(this.tempLayer_ol);
		this.tempLayer_ol = null;
	},

	//2. 발행된 레이어에서 피쳐 검색

	//레이어 활성화 안됐을 때 GisApp.LayerCode 에서 레이어 코드 찾아 노드 선택 이벤트 진행
	showingLayerThroughTreeNode: function(typeName) {
		let me = this;
		//입력된 typeName 을 속성으로 하는 GisApp.LayerCode 의 요소들의 id 를 추출
		if (!(this.tempLayerIdArr && this.tempLayerIdArr.length > 0)) {
			let isSetCodeObj = this.findAndSetLayerCodeObjWithTypename(typeName);
			if (!isSetCodeObj) {
				return new Promise((_res, rej) => {
					rej("시설물 화면에 맞는 레이어 없음. 시설물 테이블명 : " + typeName);
				});
			}
		}
		return new Promise((reso, _reje) => {
			//1. 노드가 이미 선택되어 있다면 바로 다음 Prmomise chaining 호출
			if (me.isEveryLayerNodeSelected_()) {
				reso();

				//2. 노드 선택 직후 레이어 활성화 딜레이 계산
			} else {
				me.ol_map.once('rendercomplete', function(e) {
					reso();
				});
				me.tempTreeIdArr.forEach((treeId) => {
					$("#" + me.default.target_treeId)
						.jstree().select_node(treeId);
				});
			}
		});
	},

	//테이블이름과 관련된 레이어들 코드정보 객체 찾아 내부 변수로 등록. 찾으면 true
	findAndSetLayerCodeObjWithTypename: function(typeName) {
		let me = this;
		let codeObjArr = this.getCodeObjArrOfTypeName_(typeName);
		if (codeObjArr.length > 0) {
			//this.clearTemps();
			me.tempLayerObjArr = codeObjArr;
			me.tempLayerIdArr = codeObjArr.reduce((pre, cur) => (pre.push(cur.id), pre), []);
			me.tempTreeIdArr = codeObjArr.reduce((pre, cur) => (pre.push("layerid_" + cur.id), pre), []);
			return true;
		} else return false;
	},

	//입력된 typeName 을 속성으로 하는 GisApp.LayerCode 의 요소들을 추출
	getCodeObjArrOfTypeName_: (typeName) => {
		let codeObjArr = Object.values(GisApp.layerCode)
			.filter((codeObj) => codeObj.typeName === typeName && codeObj.isLayer === "Y");

		//가압장과 가압장 영향범위는 같이 표현
		if (typeName === "WTL_PRES_PS") {
			let prsaCodeObjArr = gisSearch.getCodeObjArrOfTypeName_("WTL_PRSA_AS");
			// codeObjArr=[...codeObjArr,...prsaCodeObjArr];
			codeObjArr = [].concat(codeObjArr, prsaCodeObjArr);
		}

		return codeObjArr;
	},

	//특정 typeName을 속성으로 하는 모든 노드가 선택되어 있는지 확인
	isEveryLayerNodeSelected_: (treeIdArr) => {
		if (typeof (treeIdArr) === 'undefined') {
			return gisSearch.tempTreeIdArr.every(nodeId => $("#" + gisSearch.default.target_treeId).jstree().is_selected(nodeId));
		} else {
			return treeIdArr.every(nodeId => $("#tree-layer-control").jstree().is_selected(nodeId));
		}
	},

	preparingHighlightFeatures: function(searchCriteria = gisSearch.searchCriteria) {
		//피쳐 검색 후 내부에 세팅
		let me = this;
		let keepGoing = false;
		let allFeaturesArr = me.allFeatureArray_ol;
		let tempFeaturesArr = [];
		let fltFeaturesArr = [];
		if (allFeaturesArr.length == 0) {
			allFeaturesArr = me.getFeaturesFromMapWithIdArr_(me.tempLayerIdArr);
			me.allFeatureArray_ol = allFeaturesArr;
		}
		if (allFeaturesArr.length > 0) tempFeaturesArr = me.filterFeatures_(allFeaturesArr, searchCriteria);

		if (tempFeaturesArr.length > 0) {
			let clonedFeatureArr = tempFeaturesArr.reduce((preFeatArr, curFeat) => {
				let tempClonedFeat = curFeat.clone();
				//cloning each feature to ensure every feature is unique
				tempClonedFeat.setId(curFeat.getId() + "_cln");
				preFeatArr.push(tempClonedFeat);
				return preFeatArr;
			}, []);

			keepGoing = true;
			fltFeaturesArr = clonedFeatureArr;
			//return this.filteredFeatureCollection_ol;
		}

		me.filteredFeatureArray_ol = fltFeaturesArr;
		if (keepGoing) {
			return true;
		} else {
			return false;
		}
	},

	//필터링 이후 피쳐가 없으면 리스트 초기화, 레이어 삭제 등



	//이미 발행된 레이어에서 레이어 Id 가 tempLayerIdArr 에 있는 것들의 feature 를 반환
	getFeaturesFromMapWithIdArr_: function(idArr = gisSearch.tempLayerIdArr) {
		//idArr = ['33', '34', '35']
		let me = this;
		let featuresArr = me.ol_map.getLayers().getArray()
			.reduce((pre, cur) => {
				if (idArr.includes(cur.get("id"))) {
					//pre=[...pre,cur.getSrouce().getFeatures()];
					pre = [].concat(pre, cur.getSource().getFeatures());
				}
				return pre;
			}, []);
		return featuresArr;
	},

	//Ol_feature 로 구성된 배열에서 제시된 조건으로 필터링
	filterFeatures_: (featureArr, criteriaArr) => {
		/**
		 * criteriaArr : [
		 * 				{name:'PUR_NAM', query:'like', value:'유천'},
		 * 				{name:'GAI_NAM', query:'like', value:'개화'},
		 * 				{name:'PUR_VOL', query:'startRange', value:'20201030'},
		 * 				{name:'PUR_VOL', query:'endRange', value:'20201231'},
		 * 				{name:'WSR_CDE', query:'select', value:['WSR000', 'WSR001', 'WSR002', 'WSR999', 'WSR004', 'WSR005', 'WSR003']},
		 * 			  ]
		 */
		let returnFeatures = [];
		let criteriaArrr = [...criteriaArr, ...""];
		//feature 가 오픈레이어스 객체고, 필터링 조건이 있을 때만
		if (featureArr[0] instanceof ol.Feature && Object.keys(criteriaArrr).length > 0) {
			returnFeatures = featureArr.reduce((preArr, curFeat) => {
				//Array.every : 모든 조건이 true 일 때만
				let pushOk = criteriaArrr.every((critObj) => {
					//1. 문자열 조건일 때 : 검색값이 존재하고, 피쳐의 해당 속성에 검색값이 포함될 때
					if (critObj.query === "like") {
						if (critObj.value) {
							return curFeat.get(critObj.name)? curFeat.get(critObj.name).includes(critObj.value):false;
						} else return false;
					}

					//2. 일치 조건일 때 : 검색값이 배열로 존재하고, 피쳐의 해당 속성이 검색값 배열에 있을 때
					if (critObj.query === "select") {
						if (critObj.value instanceof Array) {
							return critObj.value.includes(curFeat.get(critObj.name));
						} else {
							return critObj.value == curFeat.get(critObj.name);
						}
					}

					//3. 범위 조건 : 피쳐의 해당 속성이 숫자로서 범위 조건 만족
					if (critObj.query === "startRange") {
						return ~~curFeat.get(critObj.name) >= ~~critObj.value;
					}
					if (critObj.query === "endRange") {
						return ~~curFeat.get(critObj.name) <= ~~critObj.value;
					}

					//4. 그 밖의 경우에는 FALSE
					return false;
				});

				if (pushOk) preArr.push(curFeat);
				return preArr;
			}, []);
		}
		return returnFeatures;
	},

	//Ol_Feature 로 구성된 레이어 생성
	creatingTempOlLayerWithFeatures: function(featureArr = gisSearch.filteredFeatureArray_ol) {
		let layerCodeObj = this.tempLayerObjArr[0]; //isLayer==='Y' 인 것 중 첫번째
		let gisLayer = GisApp.Module.core.gisLayer;
		let me = this;

		var hiliWidth =
			$("#" + me.typeName + "_SEARCH input[name=S_LAYER_WIDTH]").val() || "5";
		var hiliColor =
			$("#" + me.typeName + "_SEARCH input[name=S_LAYER_COLOR]").val() || "rgba(75,255,13,0.7)";

		let assigningObj = {
			id: 'searchLayer',

			searchColor: hiliColor, //tempColor 와 tempSize 로 하이라이트 요소 표현함
			searchSize: hiliWidth,
			searchFontColor: 'rgba(249,255,94,1)', //글씨 채움색 (노랑)
			searchFontStrokeColor: 'rgba(10,33,2,1)', //글씨 윤곽선 색 (검정) 
			searchFont: "bold 18px Malgun Gothic", //폰트 패밀리와 크기 (임시)

			symbol: null, //symbol은 표시하지 않음
			minZoom: 11, //최소 줌은 일괄적용 (VectorImageLayer 기본Option)
		};

		let assignedObj = Object.assign({}, layerCodeObj, assigningObj);

		let tempLayer = gisLayer.makeLayer(assignedObj);

		let tempSource = new ol.source.Vector();

		tempSource.addFeatures(featureArr);


		tempLayer.setSource(tempSource);
		tempLayer.setStyle(
			gisLayer.gisStyle.getLayerStyleFunction(tempLayer, assignedObj)
		);
		tempLayer.once("postrender", function() {
			console.timeEnd('레이어 표시 지연시간')
			hideWrapLoading();
		});
		//선택 가능하게 설정
		tempLayer.set("selectable", "Y");
		me.ol_map.getView().fit(tempSource.getExtent(), {
			padding: [150, 150, 150, 180] // top, right, bottom and left
		});

		me.tempLayer_ol = tempLayer;
		console.time('레이어 표시 지연시간')
		me.ol_map.addLayer(tempLayer);
	},

	//시설물 검색결과 클릭 이벤트 강제
	dispatch_Select: function(featureId, element) {
		//클릭시 해당 시설물의 위치로 화면 이동&줌 세팅
		//지도 시설물 클릭한 것과 동일한 이벤트 실행
		this.clearSelection();
		element.style.background = 'lightgrey';
		//		element.style.border = 'solid 1px grey';

		let selectedFeature = this.filteredFeatureArray_ol.find((feat) => feat.getId() === featureId);
		let zoom = this.tempLayerObjArr[0].minZoom;
		if (selectedFeature instanceof ol.Feature) {
			this.ol_select.getFeatures().push(selectedFeature);
			this.ol_select.dispatchEvent({ type: "select" });
			this.ol_map.getView().fit(selectedFeature.getGeometry(), {
				maxZoom: ~~zoom + 8
			});
		} else {
			console.log('dispatch_Select : 해당되는 feature 없음');
		}
	},

	//선택된 객체 없애기
	clearSelection: function() {
		if (this.ol_select) {

			this.ol_select.getFeatures().clear();
			this.ol_select.dispatchEvent({ type: "select" });
		}
	},
	
	displayingFeatureList: function(_name, featuresArr = gisSearch.filteredFeatureArray_ol) {
		//시설물 검색결과창 초기화
		// $("#detailInfo").hide();

		var sAddColumn = $("#S_LAYER").find("option:selected").data("col");

		if (featuresArr != null && featuresArr.length > 0) {
			$("#searchFeatureNum").html(featuresArr.length);
			let paging = new paginationKit({}, featuresArr);
			paging.setDecorateAResult(function(featuresArr) {
				let htmlStr='';
				featuresArr.forEach((feature) => {
					htmlStr += "<li>";
					htmlStr += "<a href='javascript:void(0)' onclick='gisSearch.dispatch_Select(\"" +feature.getId() +"\", this);'>";
					htmlStr += "<span class='zip' >" + feature.get('FTR_IDN') + "</span>";

					var addText = "";
					if (sAddColumn != null) {
						var addColumns = sAddColumn.split("|");
						for (var i in addColumns) {
							var addColumn = addColumns[i];
							var value = nvl(feature.get(addColumn), "");
							var hArray = detailHtmlArray[_name][addColumn];
							if (hArray != null) {
								var detailInfo = hArray.split("|");
								var htmlType = detailInfo[1];
								if (htmlType == "select") {
									var cdGrp = detailInfo[2];
									var codeList = codeJsonList(cdGrp);
									if (codeList != null) {
										var codeObj = codeList.find(
											(element) => element["code"] == value
										);
										if (codeObj != null) {
											addText += nvl(codeObj["label"], "") + " ";
										} else {
											addText += value + " ";
										}
									}
								} else {
									addText += value + " ";
								}
							}
						}
					}
					htmlStr += "<span class='adr'>" + addText + "</span>";
					htmlStr += "</a></li>";
				});
				return htmlStr;
			});
			
			paging.clearTargetChild();
			paging.showMoreResult();
			//			let domElem = document.getElementById('featureList');
			//			domElem.innerHTML = htmlStr;
			//      $("#featureList").html(htmlStr);
		} else {
			$("#searchFeatureNum").html("0");
			$("#featureList").html(
				'<li><a href="javascript:void(0);"><span class="adr" >데이터가 존재하지 않습니다</span></a></li>'
			);

		}
	},
};

/**기존 소스 활용 : <fclty/map/main.js>-------------------------------------------------------------------------------------- */

//상세검색 팝업창 띄우기
//콤보박스 세팅



/**
 * =====================
 * 버튼 이벤트 
 * 시작
 * =====================
 */

function searchFeature() {
	depthTabsAddress('tab4');
	var layerTableNm = $("#S_LAYER > option:selected").val();
	var layerNm = $("#S_LAYER > option:selected").text();
	$("#searchLayerName").html(layerNm);

	let criterArr = createCriteriaArr(layerTableNm);
	showWrapLoading();
	setTimeout(function() {
		gisSearch.perform_Search(layerTableNm, criterArr);
	}, 100);
}

function createCriteriaArr(_name) {
	let criteriaArr = [];
	/**
	 * criteriaArr : [
	 * 				{name:'PUR_NAM', query:'like', value:'유천'}, 
	 * 				{name:'GAI_NAM', query:'like', value:'개화'},
	 * 				{name:'PUR_VOL', query:'startRange', value:'20201030|20201231'},
	 * 				{name:'PUR_VOL', query:'endRange', value:'20201030|20201231'},
	 * 				{name:'WSR_CDE', query:'select', value:['WSR000', 'WSR001', 'WSR002', 'WSR999', 'WSR004', 'WSR005', 'WSR003']},
	 * 			  ]
	 */

	//------------------------------
	var ftrIdn = $("#S_FTR_IDN").val();
	if (ftrIdn != null && ftrIdn != "") {
		criteriaArr.push({
			name: 'FTR_IDN', query: 'like', value: ftrIdn,
		})
		return criteriaArr;
	};

	$("#" + _name + "_SEARCH .searchInput").each(function(index, item) {
		var name = $(this).attr("name");
		var query = $(this).attr("query");
		var value = $(this).val();

		if (name != "S_LAYER_WIDTH" && name != "S_LAYER_COLOR") {
			if (value != null && value != "") {
				if (name.indexOf("YMD") > -1 || name.indexOf("DTM") > -1) {
					value = replaceAll(value, "/", "");
				}

				let criteriaObj = {
					name: name,
					query: query,
					value: value,
				};
				criteriaArr.push(criteriaObj);
			};
		}
	});

	$(" #" + _name + "_SEARCH .searchSelect").each(function(index, item) {
		var name = $(this).attr("name");
		var query = 'select';
		var value = $(this).val();

		let criteriaObj = {};

		if (name.indexOf("SFTRIDN") > -1) {
			//			value = $("#SFTRIDN option:selected").val().length > 0 
			//					? $("#SFTRIDN option:selected").val() 
			//					: $("#SFTRIDN option").each(function(){let el = $(this).val(); if(el) arr.push(el)});
			if ($("#SFTRIDN option:selected").val().length > 0) {
				value = $("#SFTRIDN option:selected").val()
			} else {
				value = [];
				$("#SFTRIDN option").each(function() { let el = $(this).val(); if (el) value.push(el) });
			}


			criteriaObj = {
				name: 'BSM_IDN',
				query: query,
				value: [].concat(value),
			}
			criteriaArr.push(criteriaObj);

		} else {
			if (value != null && value != "") {
				criteriaObj = {
					name: name,
					query: query,
					value: [...'', ...value],
				}
				criteriaArr.push(criteriaObj);
			};
		}
	});

	//----------------------------------

	return criteriaArr;
}

function chgFclty(_type) {
	var lFtrIdn = $("#LFTRIDN option:selected").val();
	var mFtrIdn = $("#MFTRIDN option:selected").val();
	var sFtrIdn = $("#SFTRIDN option:selected").val();


	if (_type != "LFTRIDN" && _type != "MFTRIDN") {
		fcltyComboSetting($("#LFTRIDN"), "blbgAs", {});
	}

	if (_type != "MFTRIDN") {
		var param = {};
		param['ublIdn'] = lFtrIdn;
		fcltyComboSetting($("#MFTRIDN"), "blbmAs", param);
	}

	var param = {};
	if (lFtrIdn != "") { param['lFtrIdn'] = lFtrIdn };
	if (mFtrIdn != "") { param['ublIdn'] = mFtrIdn };
	fcltyComboSetting($("#SFTRIDN"), "blsmAs", param);
}

// 콤보박스 세팅 - 시설물 조회
function fcltyComboSetting(obj, fclty, param) {
	let _url = "/facility/" + fclty + "/list";
	param = JSON.stringify(param);
	$.ajax({
		type: "POST",
		url: _url,
		data: param,
		dataType: "json",
		contentType: "application/json;charset=UTF-8",
		success: function(data) {
			var htmlStr = "<option value=''>선택</option>";
			$.each(data.facilityList, function(index, dataItem) {
				htmlStr += "<option value=\"" + dataItem.FTR_IDN + "\">" + dataItem.BLK_NAM + "</option>"
			});
			$(obj).html(htmlStr);
		}
		, error: function(request, error) {
			console.log("message: " + request.responseText + ", error:" + error);
		}
	});
}


/**
 * ======================================================================================================
 * 버튼 이벤트 
 * 종료
 * ======================================================================================================
 */
//화면 왼쪽 레이어탭 중 id 에 해당하는 탭 선택 
function depthTabsAddress(id) {
	$(".tabArea ul.tab li a").removeClass('selected');
	$("#" + id).addClass('selected');
	var changeTab = "." + id;

	$(".tabUnder").addClass('displyNone');
	if ($(".tabUnder").hasClass(id)) {
		$(changeTab).removeClass('displyNone');
	}
}

/**
 * ======================================================================================================
 * 상세조회 팝업창
 * 시작
 * ======================================================================================================
 */

function closeSearchModal(_name) {
	$("#" + _name + "_SEARCH").remove();
	//	$("#resetSearchFeature").click();
}
function update(picker) {
	document.getElementById("S_LAYER_COLOR").value = picker.toString();
}
function detailSearchForm(_name) {
	$(".detailSearchForm").remove();
	var layerNm = $('#S_LAYER > option:selected').text();
	var searchId = _name + "_SEARCH";
	var html = "";
	html += '<div class="popupCal detailSearchForm" style="left: 330px;" id=' + searchId + '>';
	html += '<div class="inner" style="width: 450px;">';
	html += '<span onclick="closeSearchModal(\'' + _name + '\')" class="closed"></span>';
	html += '<h3>' + layerNm + ' 상세검색</h3>';
	html += '<div class="x_panel k-panel">';
	html += '<div class="x_title">';
	html += '<div class="right-figure">';
	html += '<ul>';
	html += '<li>';
	html += '<button type="button" class="btn btn-primary btn-sm" onclick="searchFeature();">검색</button>';
	html += '</li>';
	html += '</ul>';
	html += '</div>';
	html += '</div>';
	html += '<div class="x_content">';
	html += '<form class="form-horizontal">';

	var infoHtml = "";
	var sArray = searchHtmlArray[_name];
	for (var key in sArray) {
		var value = sArray[key];
		var temp = sArray[key].split("|");
		var title = temp[0];
		var type = temp[1];
		var code = temp[2];

		html += '<div class="form-group">';
		html += '<label class="control-label col-md-3 col-sm-3 col-xs-3" for="name">' + title + '</label>';
		if (type == "text") {
			if (key.indexOf("MET_NUM") > -1) {
				html += '<div class="col-md-9 col-xs-9 col-sm-9">';
				html += '<input type="text"  class="form-control searchInput" name="' + key + '" placeholder="" query="like" autocomplete="off">';
				html += '</div>';
			} else if (key.indexOf("DIP") > -1 || key.indexOf("YMD") > -1 || key.indexOf("DTM") > -1 || key.indexOf("NUM") > -1
				|| key.indexOf("BIG") > -1 || key.indexOf("VOL") > -1 || key.indexOf("CNT") > -1 || key.indexOf("ARA") > -1 || key.indexOf("ALT") > -1) {
				html += '<div class="col-md-4 col-xs-4 col-sm-4">';
				html += '<input type="text" class="form-control searchInput ' + key + '" id="' + key + '" name="' + key + '" query="startRange" placeholder="" autocomplete="off"/>';
				html += '</div>';
				html += '<div class="col-md-1 col-xs-1 col-sm-1">~</div>';
				html += '<div class="col-md-4 col-xs-4 col-sm-4">';
				html += '<input type="text" class="form-control searchInput ' + key + '" name="' + key + '"  placeholder="" query="endRange" autocomplete="off"/>';
				html += '</div>';
			} else {
				html += '<div class="col-md-9 col-xs-9 col-sm-9">';
				html += '<input type="text"  class="form-control searchInput" name="' + key + '" placeholder="" query="like" autocomplete="off">';
				html += '</div>';
			}
		} else if (type == "select") {
			if (key.indexOf("LFTRIDN") > -1 || key.indexOf("MFTRIDN") > -1) {
				html += '<div class="col-md-9 col-xs-9 col-sm-9">';
				html += '<select name="' + key + '" id="' + key + '" class="form-control" onchange="chgFclty(\'' + key + '\');"></select>';
				html += '</div>';
			} else if (key.indexOf("SFTRIDN") > -1) {
				html += '<div class="col-md-9 col-xs-9 col-sm-9">';
				html += '<select name="' + key + '" id="' + key + '" class="form-control searchSelect""></select>';
				html += '</div>';
			} else {
				html += '<div class="col-md-9 col-xs-9 col-sm-9">';
				html += '<select name="' + key + '" id="' + key + '" class="form-control searchSelect" multiple></select>';
				html += '</div>';
			}
		}
		html += '</div>';
	}

	//html+='<script src="jscolor.js"></script>';
	html += '<div class="form-group">';
	html += '<label class="control-label col-md-3 col-sm-3 col-xs-3" for="name">표기방법</label>';
	html += '<label class="control-label col-md-2 col-sm-2 col-xs-2" for="name">굵기</label>';
	html += '<div class="col-md-2 col-xs-2 col-sm-2">';
	html += '<input type="number" class="form-control" id="S_LAYER_WIDTH" name="S_LAYER_WIDTH" placeholder=""  value="5"/>';
	html += '</div>';
	html += '<label class="control-label col-md-2 col-sm-2 col-xs-2" for="name">색상</label>';
	html += '<div class="col-md-2 col-xs-2 col-sm-2">';
	//html+='<button type="button" class="form-control" id="BN_S_LAYER_COLOR" "data-jscolor="{valueElement:\'#S_LAYER_COLOR\',closeButton:true, closeText:\'닫기\'}"></button>';
	html += '<input class="form-control" data-jscolor="{onInput:\'update(this)\'}" id="colorInput" value="rgba(75,255,13,1)">';
	//html+='<input class="form-control" id="S_LAYER_COLOR" name="S_LAYER_COLOR" placeholder="" value="#35fc03" type="hidden"/>';
	html += '<input class="form-control" id="S_LAYER_COLOR" name="S_LAYER_COLOR" placeholder="" type="hidden"/>';
	html += '</div>';
	html += '</div>';
	html += '</form>';
	html += '</div>';
	html += '</div>';
	html += '</div>';
	html += '</div>';

	$('body').append(html);

	for (var key in sArray) {
		var value = sArray[key];
		var temp = sArray[key].split("|");
		var title = temp[0];
		var type = temp[1];
		var code = temp[2];
		if (type == "select") {
			if (key.indexOf("LFTRIDN") > -1 || key.indexOf("MFTRIDN") > -1 || key.indexOf("SFTRIDN") > -1) {
				fcltyComboSetting($("#" + searchId + " " + "#" + key), code, {});
			} else {
				comboMultiSetting($("#" + searchId + " " + "#" + key), code);
			}
		}
	}

	var sYYYY = '1900', eYYYY = '2029';
	drSinglePicker('.IST_YMD', sYYYY, eYYYY, null, 'YYYY/MM/DD');
	drSinglePicker('.UPD_DTM', sYYYY, eYYYY, null, 'YYYY/MM/DD');
	drSinglePicker('.FNS_YMD', sYYYY, eYYYY, null, 'YYYY/MM/DD');
	$('#' + searchId).draggable();
	jscolor.install();
	jscolor.trigger('input');
}

/**
 * ======================================================================================================
 * 상세조회 팝업창
 * 종료
 * ======================================================================================================
 */

