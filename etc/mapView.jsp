<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<meta charset="UTF-8">

<!-- 
	본 페이지를 호출한 출발지에서, 시설물레이어의 테이블 이름 (typeName) 과
	특정 시설물의 관리번호 (FTR_IDN) 을 받아온다.
	
	typeName 으로 layer-tree를 활성화하는 방식으로 지도 위 레이어를 생성하고
	레이어가 정상적으로 생성된 후 FTR_IDN 으로 해당 시설물의 위치를 찾아
	ol.View 객체의 fit 메서드로 시설물의 위치를 찾아 강조한다
	
	사용예: 

	if (!(typeof (facilityMap) == 'undefined')) {
		let tableName = facilityMap.getTableNameFromApiUrlFront();
		facilityMap.gis_tree.showLayerWithTreeThroughTableName_Promise(tableName)
		.catch(err=>{console.log(err);})
		.then(function(){
			facilityMap.fitOLMapViewToFacility(tableName, ftrIdn);
			})
		.catch(console.log);
	}
 -->

<style>
.container {   padding: 0px;    margin: 0px;}
.x_title h2 {    font-size: 15px;    font-weight: bold;    color: #222;
    margin: 10px 7px 0;    padding: 0;    color: #1744a4;}
.x_title {    border-bottom: 2px solid #003259;    padding-top: 0;
    padding-left: 0;    margin: 0;    height:35px;}
.float-left {    float: left;}
.x_title span {    color: #BDBDBD;}
.x_title h2 {    float: left;    display: block;    text-overflow: ellipsis;
    overflow: hidden;    white-space: nowrap;}
</style>

<!-- gis 용 자바스크립트 추가 -->
<%@include file="/WEB-INF/jsp/com/mindone/water/layout/gisJs2.jsp" %>

<!-- 전달받은 시설물 인자로 지도 하이라이트 -->
<script type="text/javascript" >
	window._ONLOAD_ =((readyFunction)=> {
	    if (document.readyState === "complete" || document.readyState === "interactive") setTimeout(readyFunction, 1);
	    else document.addEventListener("DOMContentLoaded", readyFunction);
	})(function(){
// document.addEventListener("DOMContentLoaded", function(event) {

	//시설지도 init()
	facilityMap.init()
	.then( ()=>{
		const params = new URLSearchParams(window.location.href.split('?')[1]);
		const typeName = params.get('typeName');
		const ftrIdn = params.get('ftrIdn');
		// console.log(`------->`,typeName,ftrIdn);
		childMap_highlightFeature(typeName, ftrIdn);
	})
	;
});

/**
자식창으로 현재 화면이 표출되었을 때, 특정 시설물로 지도 하이라이트 하는 함수
facilityMap 객체가 존재할 때 객체 내부 함수를 이용함
*/
function childMap_highlightFeature (typeName, ftrIdn){
	if(facilityMap.ol_map){ //facilityMap 은 facilityMap.jsp 에 포함된 js 에서 생성하는 지도관련 핸들러
		if(ftrIdn && typeName){
			facilityMap.gis_tree.showLayerWithTreeThroughTableName_Promise(typeName)
			.catch(err=>{console.log(err);})
			.then(function(){
				facilityMap.fitOLMapViewToFacility(typeName, ftrIdn);
				})
			.catch(console.log);
		}		
	}else {
		if(window.opener) window.opener.console.log('facilityMap 객체 없음');
		console.log('facilityMap 객체 없음');
	}
}

const facilityMap = {

	ol_map: null, 
	gis_tree:null,	//gis.tree.js 객체 연결
	ol_highlight : null, //하이라이트 객체
	
	grid_select: null,
	tempLayerId:null,
	tempTreeIdArr:[],
	
	mapOptions: {
		targetId: "map",	//DIV 이름
	},
	treeOptions: {
		targetId: "tree-layer-control",	//DIV 이름
	},

/** @param {Object} option 기타등등 */
	init: function(option) {
		let me = this;
		return this.prepareTreeData()
		.then(()=>{
			//메인 지도 생성
			GisApp.Module.core = new GisApp.core(me.mapOptions);
			me.ol_map = GisApp.Module.core.map;
			me.ol_map.getView().setZoom(17.1);

			//팝업(트리) 생성
			GisApp.Module.tree = new GisApp.tree(me.treeOptions);
			me.gis_tree = GisApp.Module.tree;
			
			//초기 팝업(트리)는 닫아놓는다
			document.querySelector(".map_info").classList.remove('on');
			document.querySelector(".map_info_layer").style.display='none';
			
			return Promise.resolve();
		});
	},
	
	prepareTreeData:()=>fetch('/tree2.do')
		.then(res => res.json())
		.then(datum => {
			let data = datum.data;
// 			recursiveCheck(data, { typeName: 'WTL_PIPE_LS',cqlFilter:true  }, { }, 'childList','delete');
// 			recursiveCheck(data, { typeName: 'WTL_SPLY_LS',cqlFilter:false }, {visible:'N', minZoom:12 }, 'childList');
// 			recursiveCheck(data, { typeName: 'WTL_PIPE_LS',cqlFilter:false }, {visible:'N', minZoom:12 }, 'childList');
// 			recursiveCheck(data, { typeName: 'WTL_BLBM_AS' }, { visible: 'N' }, 'childList');
// 			recursiveCheck(data, { typeName: 'WTL_BLSM_AS' }, { visible: 'N' }, 'childList');
// 			recursiveCheck(data, { typeName: 'WTL_FLOW_PS' }, { visible: 'N' }, 'childList');
// 			recursiveCheck(data, { typeName: 'WTL_PRES_PS' }, { visible: 'N' }, 'childList');
// 			recursiveCheck(data, { typeName: 'WTL_PRGA_PS' }, { visible: 'N' }, 'childList');
// 			recursiveCheck(data, { typeName: 'WTL_VALV_PS' }, { visible: 'N' }, 'childList');
// 			recursiveCheck(data, { typeName: 'WTL_PURI_AS' }, { visible: 'N' }, 'childList');
// 			recursiveCheck(data, { typeName: 'WTL_SERV_AS' }, { visible: 'N' }, 'childList');
			
			if (GisApp) GisApp.setLayerInfos(data);
		return Promise.resolve();
	}),
		
	/**
	테이블 이름과 관리번호(FTR_IDS)로 지도 이동
	@param {String} typeName 'WTL_PIPE_LS' 등 GIS 테이블 이름
	@param {String} ftrIdn 관리번호. 숫자라도 문자열('')로 입력해야함
	 */
	fitOLMapViewToFacility: function(typeName, ftrIdn)  {
		if(this.ol_highlight){
			this.ol_map.removeLayer(this.ol_highlight);
			this.ol_highlight=null;
		}
		let me = this;
		const minZoom = Object.values(GisApp.layerCode).reduce((pre, cur) => {
				if (cur.typeName === typeName && cur.isLayer === 'Y') {
					return Number(pre) > Number(cur.minZoom) ? pre : cur.minZoom
				} else return pre 
			},'17')+0.5;

		let OLfeature;
		try {
			OLfeature = getFeature(typeName, ftrIdn);
			if (OLfeature instanceof ol.Feature) {
				this.highlightFeature(OLfeature, minZoom);
				return Promise.resolve();
			}else{
				throw new Error ('feature not YET detected')
			}
		} catch (e) {
			console.log(e);
			//초기부터 발행되는 레이어더라도 렌더링 되는 시간을 기다림
			return new Promise ((res,rej)=>{
				setTimeout(function (){
					OLfeature = getFeature(typeName, ftrIdn);
					if (OLfeature instanceof ol.Feature) {
						this.highlightFeature(OLfeature, minZoom);
						return res();
					} else {
						return rej(`시설물 GIS 정보 확인 불가 : ${typeName} | ${ftrIdn}`);
					}
				},2000);
			});
		}

		function getFeature(typeName, ftrIdn) {
						return me.ol_map.getLayers().getArray()
								   .reduce((preFeat, curLa) => {
									   let curFeat = '';
									   if (curLa.get('typeName') === typeName) {
										   curFeat = curLa.getSource().getFeatures().find(feat => feat.get('FTR_IDN') == ftrIdn);
									   }
									   return curFeat ? curFeat : preFeat;
								   }, '');
					}
	},
	
	/**
	 * 피쳐를 강조해주는 효과 적용 (하이라이트)
	 * @param {ol.Feature} OL_feature 오픈레이어스 피쳐 객체 (instanceof ol.Feature)
	 @param {Number} zoom 해당 피쳐를 보여줄 때 줌 크기 
	 */
	highlightFeature:function(OL_feature, zoom){
		const strokeStyleCircle = new ol.style.Stroke({
			color: "rgba(255,22,13,0.78)",
			width: 6,
			lineDash: [12, 15],
		});
		const strokeStyleLine = new ol.style.Stroke({
			color: "rgba(249,255,94,0.8)",
			width: 25,
			lineCap:'bevel',
			lineJoin:'bevel',
// 			lineDash: [45, 15],
		});
		
		let textStyle;
		if(OL_feature.get('FTR_IDN')){
			textStyle = new ol.style.Text({
				fill: new ol.style.Fill({color: 'rgba(249,255,94,1)'}),//글씨 채움색 (노랑)
				offsetY:60,
				font: "700 25px monospace",
				textBaseline: 'ideographic',//'middle'
				textAlign: 'center',
				justify:'center',
				backgroundFill : new ol.style.Fill({
					color: "rgba(10,33,2,0.6)"
				}),
				backgroundStroke : new ol.style.Stroke({
					color: "rgba(10,33,2,1)",
					width: 2,
				}),
				text: OL_feature.get('FTR_IDN'),
				padding:[8,10,5,10], //[상, 우, 하, 좌]
			});
		}
		
		const style = [
			new ol.style.Style({
				image: new ol.style.Circle({
					fill: new ol.style.Fill({
						color: "rgba(255,22,13,0.28)"
					}),
					stroke: strokeStyleCircle,
					radius: 24
				}),
				stroke: strokeStyleLine,
				text:textStyle,
// 				text:new ol.style.Text({text: OL_feature.get('FTR_IDN'),}),
				fill: new ol.style.Fill({color: 'rgba(255,22,13,0.2)'})
			}),
		];

		const tempSource = new ol.source.Vector();
		tempSource.addFeature(OL_feature);

		const tempLayer = new ol.layer.VectorImage({zIndex:Infinity,});
		tempLayer.setStyle(style);
		tempLayer.setSource(tempSource);
		this.ol_highlight = tempLayer;
		this.ol_map.addLayer(tempLayer);
		this.ol_map.getView().fit(OL_feature.getGeometry(), {
			duration: 600,
			maxZoom: zoom>17?16:zoom,
		});
	},
	
	//레이어 활성화 안됐을 때 GisApp.LayerCode 에서 레이어 코드 찾아 노드 선택 이벤트 진행
	showLayerThroughTreeNode: (typeName) => {
		let me = this;
		let codeObjArr = Object.values(GisApp.layerCode).filter(codeObj => codeObj.typeName === typeName && codeObj.isLayer==='Y');
		
		if (codeObjArr.length>0) {
			codeObjArr.forEach(layerObj=>facilityMap.tempTreeIdArr.push('layerid_' + layerObj.id));
		} else {
			return Promise.reject('시설물 화면에 맞는 레이어 없음. 시설물 테이블명 : ' + typeName);
		}
		facilityMap.tempTreeIdArr = [...new Set(facilityMap.tempTreeIdArr)];
		return new Promise((reso, reje) => {
			//1. 노드가 이미 선택되어 있다면 바로 다음 Prmomise chaining 호출 
			if (facilityMap.isEveryLayerNodeSelected()) {
				reso();

				//2. 노드 선택 직후 레이어 활성화 딜레이 계산	
			} else {
				facilityMap.ol_map.once('rendercomplete', function(e) {
					//changePipeStyleFunc(typeName);					
					reso();
				});
				
				facilityMap.tempTreeIdArr.forEach(el=>{
					$('#' + facilityMap.treeOptions.targetId).jstree().select_node(el);
				});

			}
		});
	},
	
	isEveryLayerNodeSelected:()=>{
		let selected = true;
		selected = facilityMap.tempTreeIdArr.every(nodeId=>
			$('#' + facilityMap.treeOptions.targetId).jstree().is_selected(nodeId)
		);
		return selected;
	},
}

/**
 * typeName 이 WTL_PIPE_LS 또는 WTL_SPLY_LS 일 때 스타일 재 적용
 */
function changePipeStyleFunc(typeName){
	const bufferAge = 1;
	if(TABLE_FOR_DURATION_ARR.includes(typeName)) {
		facilityMap.ol_map.getLayers().getArray().filter(el=>el.get('typeName')==typeName)
		.forEach(layer=>{
			layer.setStyle(function(feature){
				//관리번호
			    const targetFTR_IDN = feature.get('FTR_IDN');
				
				//관경
			    const targetDIAMETER = feature.get('PIP_DIP') || '15';
			    
				//실제 설치년도
				let targetINSTALL = feature.get('IST_YMD') || 1900; // from 1900
				targetINSTALL=(targetINSTALL.length>4? targetINSTALL.substr(0,4) : (targetINSTALL+'0000').substr(0,4));
				
				//관종에 따른 내구연한
			    const targetLIFE = targetFTR_IDN ? DURA_DIC[typeName].get(targetFTR_IDN) : ''; 
			    ragetLIFE = (targetLIFE ? parseInt(targetLIFE) : 25);// 20~30
			    
			    //기준년도 (상단 슬라이드 값)
			    const targetYEAR = document.querySelector('#tempYMD').value||2024; //default : 2024
			    
			    const age = parseInt(targetYEAR) - parseInt(targetINSTALL);
			    
			    /*  MAX(PIP_DIP)|MIN(PIP_DIP)|STATS_MODE(PIP_DIP)|AVG(PIP_DIP)  
					------------+------------+-------------------+--------------
					         700|           0|                 15|45.11228844033   
				*/
					         
			    const width = targetDIAMETER? Math.round(targetDIAMETER/45)+1 : 1;

			    let strokeStyle;
			    const warnStroke = new ol.style.Stroke({
			        color: 'rgba(220,20,60,1)',
			        width: width
			    });
			    //
			    const nearStroke = new ol.style.Stroke({
			        color: 'rgba(50,205,50,0.7)',
			        width: width
			    });

			    const safeStroke = new ol.style.Stroke({
			        color: 'rgba(0,0,205,0.6)',
			        width: width
			    });

			    //관로 나이가 내구연한보다 많으면
			    if(age > targetLIFE + bufferAge ) strokeStyle = warnStroke; 
			    //관로 나이가 내구연한 +/- 1년 사이면
			    else if(age <= targetLIFE + bufferAge  && age >= targetLIFE-bufferAge ) strokeStyle = nearStroke;
			    else strokeStyle = safeStroke;

			    return new ol.style.Style({stroke:strokeStyle});
			})//layer.setStyle(func);
			
		}); //forEach
	}	
}
/**
 * 목표 배열(targetArray)의 각 요소에서, 확인하고자 하는 키 객체(checkObj)가 있다면
 * 특정 객체 형태(resultObj)로 요소 내용을 덮어씌우는 작업을 하는데, 하위내용이 있다면 재귀적으로도 수행
 * @param {Array} targetArray - 목표 배열
 * @param {Object} checkObj - 확인하려는 키 객체, 1개 k/v 이상
 * @param {Object} resultObj - 목표 배열의 각 인자에 적용하려는 객체형태 , 1개 k/v 이상
 * @param {String} recursiveKey - 목표 배열의 재귀적 요소의 key 값, nullable
 * @returns 
 */
function recursiveCheck(targetArray,  checkObj,  resultObj,  recursiveKey, flag) {
  // 1. 파라미터가 적절한 형태인지 체크
  if (!targetArray instanceof Array) return null;
  if (Object.entries(checkObj).length < 1) return null;
  
  // 2. 배열의 모든 인자가, 체크하려는 객체와 같은 조건인지 확인
  targetArray.forEach((element,idx)=>{
    if(isEveryElementMatch(element,checkObj)){
    	
    	if(flag==='delete'){
	    	targetArray.length=0;
    	}
	
      //2.1 배열의 어떤 인자가 체크 객체와 같은 상태라면, 최종 객체형태로 덮어씌움
      Object.assign(element,resultObj);
      
    }
    
    // 2.2 재귀적 배열이 있다면 이를 반복함
    if (element[recursiveKey] instanceof Array) {
      recursiveCheck(element[recursiveKey], checkObj, resultObj,recursiveKey,flag);
    }
  });


	/**
	 * 개별 요소와 목표 객체 형태를 비교하여 True/False 반환
	 * @param {*} element 비교하려는 개별요소
	 * @param {*} checkObj 비교객체
	 */
	function isEveryElementMatch(element, checkObj) {
	    let bool = false;
	    if (Object.keys(element).length > 0) {
	        const entry = Object.entries(checkObj);
	        bool = entry.every(([k, v]) => {
	            if (v == null) {
	                return element[k] == null;
	            } else if (v == false) {
	                return element[k] == null;
	            } else if (v == true) {
	                return element[k] != null;
	            } else {
	                return element[k] === v;
	            }
	        });
	    }
	    return bool;
	}

}
</script>


<div class="col-md-12 col-sm-12 col-xs-12" style="height:99vh; width:99vw;">
	<div class="x_title" style="display: flex; flex-direction: row; justify-content: space-between; align-items: center;">
		<!-- 헤더 아이콘과 제목 -->
		<div id="codeList" class="float-left">
			<span class="map_info" data-menu-depth="gisInfo" ><a href="#"></a></span>
			<span><h2 style="width:auto;">시설물 지도</h2></span>
		</div>
		
		<!-- 범례 
		<div class="legend_container">
			<div class="legend_item"><span style="color:black;">잔존수명 범례</span></div>
			<div class="legend_item"><span style="color:rgb(220,20,60);">■</span><span>0 미만</span></div>
			<div class="legend_item"><span style="color:rgb(50,205,50);">■</span><span>1년이내</span></div>
			<div class="legend_item"><span style="color:rgba(0,0,205) ;">■</span><span>1년이상</span></div>
		</div>
		-->
		
		<!-- 기준년도 슬라이더 
		<div style="display: flex; width: 25%; justify-content: space-around; align-items: center;">
		  <span id="tempYMD_label"style="padding-right: 5px;color: #605858;font-size: 15px;">2024</span>
		  <span style="white-space: nowrap; padding:0px 2px;">기준</span>
		  <input type="range" id="tempYMD" min="2000" max="2080" value="2024" step="1" style="display:inline; width:70%;">
		</div>
		-->
	</div>
	<div style="top:10px; height: inherit;">
		<!-- 지도영역 -->
		<div id="map" style="height:calc(100% - 34px);"></div>
		
		<!-- 레이어트리 영역 -->
		<div class="map_info_layer" data-toggle-content="gisInfoLayer">
			<div id="tree-layer-control"></div>
		</div>
	
	</div>
</div>
