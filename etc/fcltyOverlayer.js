/*
	typeName (테이블이름) 과 ftr_ids(number PK) 를 인자로 
	상세 시설물 오버레이와 내용 출력, 그리고 수정, 저장 등 제공
	originate from facilityMain.js 
	
	최종수정일 | 2022-06
	
	사용방식 |
		fcltyOverlayer	.setOverlayTemplate(typeName, ftr_ids)
						.then(fcltyOverlayer.appendBtnForMngAsst.bind(fcltyOverlayer)) <-- 관리대장 버튼 붙일 때. this 때문에 bind 해줌
						.then(fcltyOverlayer.appendFormForComments) <-- 코멘트가 따로 있을 때
						.then(fcltyOverlayer.activateOverlayTemplate)
						.then(mapMod.fitViewToCurrFeature);
 */
 
let bln_overlaydeco_comment=false; 
 
let fcltyOverlayer = {
	bln_overlayFlag: false,	//오버레이가 존재하는지 여부 
	bln_overlaydeco_comment:false, //속성정보 변경이력 기록 여부
	bln_mngAsst_btn:false, //관리대장 버튼 생성 여부
	
	features: [],

	layers: [],

	typeName: '', 		// 예 : "WTL_PIPE_LS"
	fcltyDtalUrl: '',  	// 예 : "/facility/pipeLs"
	ftrIds: '',

	selectedFcltyDtalObj:{},	//선택된 시설물의 상세 정보
	
	default: {
		targetId: 'mapModFacilityDetail',	//시설물정보 표출 DIV. draggable 적용
		btnGrpClass:'fcltyDtal_btn',		//source 의 버튼 영역 class  
		mngAsstBtnId:'mngAsst_btn',			//mngAsst.js 연동시 해당 버튼 id
	},
	init: function(targetObj) {
		Object.assign(this.default, targetObj);
		this.typeName = '';
		this.fcltyDtalUrl = '';
		this.ftrIds = '';
		this.selectedFcltyDtalObj = {};	
		
		$('#'+this.default.targetId).draggable();
	},

	removeOverlayTemplate: function() {
		$('#'+this.default.targetId).empty();
	},

	//지정된 DIV에 '시설물관리' 페이지의 상세속성 form 창을 불러오고 Promise 반환
	setOverlayTemplate: function(typeName, ftrIds) {
		let me = this;
		this.ftrIds = ftrIds;
		this.typeName = typeName;

		// typeName 과 FTR_IDN 으로 오버레이 생성 
		this.fcltyDtalUrl = this.getUrlFromTypeName(this.typeName);
		let url_of_jspFraction = this.fcltyDtalUrl + '/main .fcltyDtal';
		
		return new Promise(function(resolve) {
			$('#'+me.default.targetId).load(url_of_jspFraction, function(responseText, textStatus) {
				//오버레이의 레이아웃 재 설정
				$('.fcltyDtal').removeClass('col-md-8 col-sm-8 col-xs-8').addClass('col-md-12 col-sm-12 col-xs-12');
				$('#facilityInfoForm>div').removeClass('col-md-3 col-sm-3 col-xs-3').addClass('col-md-12 col-sm-12 col-xs-12');

				//취소버튼 최초에는 숨기기
				$('#cancle').css('display', 'none');
				
				resolve(typeName);
			});
		});
	},
	
	//로드된 시설물정보 버튼 그룹 마지막에 '관리대장' 조회 버튼 append
	appendBtnForMngAsst:function(){
		let btnHtml = '<button class="btn btn-primary btn-sm" id="'
					+this.default.mngAsstBtnId
					+'">관리대장</button>';
		$('.'+this.default.btnGrpClass).append(btnHtml);
	},
	appendFormForComments: function() {

		return new Promise(resolve => {

//			this.bln_deco_comment = true;
			bln_overlaydeco_comment = true;
			
			let table_name = fcltyOverlayer.typeName;


			//오버레이 inputForm 맨 하단에 textArea 태그 삽입
			let divTextArea = '';
			//					divTextArea+='<div class="col-form-group col-md-12 col-sm-12 col-xs-12" style="border-bottom: 2px solid #E6E9ED;"></div>'; //밑줄
			divTextArea += '<input type="hidden" name="TABLE_NAME" id="TABLE_NAME" value=' + table_name + '>';
			divTextArea += '<input type="hidden" name="USER_ID" id="USER_ID" value=' + userId + '>';
			divTextArea += '<div class="col-form-group col-md-12 col-sm-12 col-xs-12">';
			divTextArea += '<label class="control-label col-md-4 col-sm-4 col-xs-4" for="COMMENTS">변경이력기록</label>';
			divTextArea += '<div class="form-item col-md-8 col-sm-8 col-xs-8">';
			divTextArea += '<textarea name="COMMENTS" id="COMMENTS" class="form-control" rows="3" ></textarea>';
			divTextArea += '</div>';
			divTextArea += '</div>';
			$('#facilityInfoForm').append(divTextArea);

			$('#COMMENTS').attr('placeholder', "변경이력기록");
			resolve(); 
						
		});
	},
	
	//activateOverlayTemplate 는 구성된 Overlay 에 form 필드가 모두 생성된 이후 수행
	activateOverlayTemplate: function() {
		return new Promise(resolve => {

			//오버레이 불러온 직후 form 들 수정되지 않게 처리
			$('#facilityInfoForm input, #facilityInfoForm select, #facilityInfoForm textArea, #facilityInfoForm button').prop('disabled', true);
			
			let table_name = fcltyOverlayer.typeName;
			
			/*평택 - 고덕 레이어 한정*/
			if(typeof table_name == 'string' && table_name.includes('GODUK')){
				table_name = table_name.replace('_GODUK','');
			}
			
			//취소버튼 최초에는 숨기기
			setComboAndValidations[table_name]()
			.then(resolve);

		});
	},
	
	// 수정, 저장, 취소 버튼 없음
	activateReadOnlyTemplate: function() {
		$('.fcltyDtal>div:first-child :button').hide();
		//오버레이 불러온 직후 form 들 수정되지 않게 처리
		$('#facilityInfoForm input, #facilityInfoForm select, #facilityInfoForm textArea, #facilityInfoForm button').prop('disabled', true);
	},

	getUrlFromTypeName: function(typeName) {
		let tempUrl = typeName.toLowerCase().split('_'); //['wtl', 'pipe', 'ls'];
		return '/facility/'
			+ tempUrl[1] + tempUrl[2].charAt(0).toUpperCase() + tempUrl[2].slice(1); // "/facility/pipeLs"
	},

	setOverlayContent: function() {
		
		let typeName = this.typeName;
		let ftrIds= this.ftrIds;
		fcltyOverlayer.selectedFcltyDtalObj={};
		
		$.when(
			this.ajax_getFeatureDetail(typeName, ftrIds),
			this.ajax_getFeatureDetail_comment(typeName, ftrIds)
		).done(function(a1,a2){
			fcltyOverlayer.fillFormWithFcltyDtal(fcltyOverlayer.selectedFcltyDtalObj);
		});
	},

	ajax_getFeatureDetail: function(typeName, ftrIds) {
		let fcltyDtalUrl = fcltyOverlayer.getUrlFromTypeName(typeName);
		var param = {};

		param = { "ftrIds": ftrIds };
		param = JSON.stringify(param);
		//		$('#facilityInfoForm')[0].reset(); // 폼창 파라미터들 초기화 : 데이터를 조회할 때 있는 값만 가져오므로 이전값이 남아있음.

		resetValidationMark(); // validation 오류시 오류난 곳을 색변경을 통해 알려준 것 초기화

		return $.ajax({
			type: "POST",
			url: fcltyDtalUrl + "/selectInfo",
			dataType: "json",
			data: param,
			contentType: "application/json;charset=UTF-8",
			success: function(data) {

				$.extend(fcltyOverlayer.selectedFcltyDtalObj, data.facilityData);

				if (!data.facilityData) {
					console.error('/selectInfo null 조회')
				}
			},
			error: function(request, error) {
				console.log("message: " + request.responseText + ", error:" + error);
			}
		});

	},

	ajax_getFeatureDetail_comment: function(typeName, ftrIds) {
		//이력 호출 ajax
		if (this.bln_overlaydeco_comment) {
			return $.ajax({
				type: "POST",
				url: "/selectWtlComments",
				data: { 'FTR_IDS': ftrIds, 'TABLE_NAME': typeName==='WTL_PRES_AS'?'WTL_PRES_PS':typeName },
				success: function(data1) {
					fcltyOverlayer.selectedFcltyDtalObj['COMMENTS'] = data1.comments;
				}
			});
		}
	},
	
	fillFormWithFcltyDtal: function(fcltyDtalObj) {
		
		if(!fcltyDtalObj)fcltyDtalObj=this.selectedFcltyDtalObj
		for (var el in fcltyDtalObj) { //객체명 , 객체
			if (el === 'UPD_DTM' || el.substring(el.length, el.length - 3) === 'YMD') {
				if (fcltyDtalObj[el]) {
					fcltyDtalObj[el] = moment(fcltyDtalObj[el], 'YYYYMMDD').format('YYYY/MM/DD');
				}
			}
			_commUtils.setVal("facilityInfoForm", el, fcltyDtalObj[el]);
		}
	}

};


//----------------------------------------------------------------
//--시작--facilityMain.js 에서 차용한 함수들----------------------
//----------------------------------------------------------------

// 수정버튼 클릭시
function updateFacility(_type, _ftrIds){
	if(fcltyOverlayer.selectedFcltyDtalObj == "" || fcltyOverlayer.selectedFcltyDtalObj == null){
		return alert("수정할 사항이 없습니다. \n데이터를 선택 후 진행하여 주시기 바랍니다.");
	}else{
		//$('#facilityInfoForm input, #facilityInfoForm select, #facilityInfoForm textArea, #facilityInfoForm button').prop('disabled', false);
		$('#facilityInfoForm :input').prop('disabled', false);
		$('#FTR_CDE').prop('disabled',true);
		updateFlag = 1;	
	}
	$('#cancle').css('display','inline');
	$('#update').css('display','none');
}
//취소버튼 클릭시
function cancleFacility(){
	$('#cancle').css('display','none');
	$('#update').css('display','inline');
	//$('#facilityInfoForm input, #facilityInfoForm select, #facilityInfoForm textArea, #facilityInfoForm button').prop('disabled', true);
	$('#facilityInfoForm :input').prop('disabled', true);
	updateFlag = 0 ;
	insertFlag = 0;
	$('#facilityInfoForm')[0].reset(); // 폼창 파라미터들 초기화
	$('#idCheckResult').html('');	
	
	if(!fcltyOverlayer.selectedFcltyDtalObj) return;
			
	for(var el in fcltyOverlayer.selectedFcltyDtalObj ){ //객체명 , 객체
		if(el === 'UPD_DTM' || el.substring(el.length, el.length-3) === 'YMD' ){
			fcltyOverlayer.selectedFcltyDtalObj[el] = moment(fcltyOverlayer.selectedFcltyDtalObj[el],'YYYYMMDD').format('YYYY/MM/DD');
		}
		_commUtils.setVal("facilityInfoForm", el, fcltyOverlayer.selectedFcltyDtalObj[el] );
	}
	
}

function saveFacility(){
	if(insertFlag == 0 && updateFlag == 0){
		return alert("등록 및 수정버튼을 누른 후 진행하여 주시기 바랍니다.");
	}else{
		$('#facilityInfoForm').submit();
	}
}

function saveInfo() {
	var param = {};
	var istYmd = $("#facilityInfoForm #IST_YMD").val();
	var rhbYmd = $("#facilityInfoForm #RHB_YMD").val();
	
	(istYmd)? $("#facilityInfoForm #IST_YMD").val(istYmd.replace(/\//gi, "")) : '';
	(rhbYmd)? $("#facilityInfoForm #RHB_YMD").val(rhbYmd.replace(/\//gi, "")) : '';
	
	param = JSON.stringify($("#facilityInfoForm").serializeObject());
	
	$.ajax({
		type : "POST",
		data: param,
		dataType : "json",
		contentType : "application/json;charset=UTF-8",
		url : fcltyOverlayer.fcltyDtalUrl + "/saveInfo",
		success : function(data){
			alert(data.msg);
			$('#facilityInfoForm input, #facilityInfoForm select, #facilityInfoForm textArea, #facilityInfoForm button').prop('disabled', true);
			updateFlag = 0;
			insertFlag = 0;
			facilityData = ""; // 상세조회시 사용
			$('#facilityInfoForm')[0].reset(); // 폼창 파라미터들 초기화
			resetValidationMark(); // validation 오류시 오류난 곳을 색변경을 통해 알려준 것 초기화

			//내용 다시 불러옴
			fcltyOverlayer.setOverlayContent();
			
			//버튼 상태 초기화
			cancleFacility()
		},
		error : function(request, error) {
			console.log("message: " + request.responseText + ", error:" + error);
		}
	});
		
}	
	
function resetValidationMark() {
	var form = $('#facilityInfoForm :input'); 
	$.each(form, function(index, ele) {
		$(this).css("border", '');
	});
}


function comboSetting_fctlyOverlayer(objs, cdGrp,title){
	var _url = "/common/ajax/getCodeDtalList?cdGrp=" + cdGrp;
	//춘천시 일 경우 
	if (cdGrp == '4211') {_url = "/common/ajax/getCodeDtalListLike?cdGrp=" + cdGrp;	}
	
	var title = typeof title ==='undefined' ? '' : title+" ";
	//태그유형 셀렉트 박스 옵션 추가
	return $.ajax({
		type: "GET",
    	url: _url,
    	success: function (data) {
    		$.each(objs, function(index, obj){
	    		$(obj).append("<option value=''>"+title+"선택</option>");
	    		$.each(data.list, function(index, dataItem){
	    			$(obj).append("<option value=\"" + dataItem.cdKey + "\">" + dataItem.cdNm + "</option>");
	    		});
    		});
        }
		,error : function(request, error) {
			console.log("message: " + request.responseText + ", error:" + error);
		}
	});
}

//---------------------------------------------------------------------------
//--끝--facilityMain.js 에서 차용한 함수들-----------------------------------
//---------------------------------------------------------------------------



//===이후 : 각 시설물 페이지 jsp 내 javascript============


let setComboAndValidations = {
	WTL_BLBG_AS: function() {
		return new Promise(res => {
			$.when(
				comboSetting_fctlyOverlayer($("#FTR_CDE"), "MOC_CC_031"), // 지물부호
				comboSetting_fctlyOverlayer($(".MNG_CDE"), "MOC_CC_002") // 관리기관
			).done(function() {
				$("#facilityInfoForm").validate({

					submitHandler: function() { //validation이 끝난 이후의 submit 직전 추가 작업할 부분
						saveInfo();
					}
					, rules: { //규칙
						FTR_IDN: { maxlength: 20 } 			// 관리번호(GIS)
						, BLK_NAM: { maxByteLength: 100 } 	// 블록명
						, WSP_NAM: { maxByteLength: 100 } 	// 급수계통명
						, WSP_BIG: { number: true } 			// 최대급수량
						, PPL_NUM: { digits: true } 			// 인구
						, GNR_NUM: { digits: true } 			// 세대수
						, SHAPE_LENG: { number: true } 		// 모형길이
						, SHAPE_AREA: { number: true } 		// 모형영역
					}
				}); //validate

				res();
			});
		});
	},
	WTL_BLBM_AS: function() {
		return new Promise(res => {
			$.when(
				comboSetting_fctlyOverlayer($("#FTR_CDE"), "MOC_CC_031"), // 지물부호
				comboSetting_fctlyOverlayer($(".MNG_CDE"), "MOC_CC_002") // 관리기관
			).done(function() {
				$("#facilityInfoForm").validate({

					submitHandler: function() { //validation이 끝난 이후의 submit 직전 추가 작업할 부분
						saveInfo();
					}
					, rules: { //규칙
						FTR_IDN: { maxlength: 20 } 		// 관리번호(GIS)
						, BLK_NAM: { maxByteLength: 100 } // 블록명
						, WSP_NAM: { maxByteLength: 100 } // 급수계통명
						, WSP_BIG: { number: true } 		// 최대급수량
						, PPL_NUM: { digits: true } 		// 인구
						, GNR_NUM: { digits: true } 		// 세대수
						//, UBL_CDE     : {maxByteLength:1} 	// 대블록부호/중블록부호
						, UBL_IDN: { maxByteLength: 20 } 		// 대블록번호/붕블록번호
						, SHAPE_LENG: { number: true } 		// 모형길이
						, SHAPE_AREA: { number: true } 		// 모형영역
					}
				}); //validate
				res();
			});
		});
	},
	WTL_BLSM_AS: function() {
		return new Promise(res => {
			$.when(
				comboSetting_fctlyOverlayer($("#FTR_CDE"), "MOC_CC_031"), // 지물부호
				comboSetting_fctlyOverlayer($(".MNG_CDE"), "MOC_CC_002") // 관리기관
				//fcltySetting($("#UBL_CDE"),"blbgAs"); // 대블록부호

				// 날짜 초기화 참고(status/flow/leakCalResult.jsp)
				//		drSinglePicker('#sIstYmd', sYYYY, eYYYY);
				//		drSinglePicker('#eIstYmd', sYYYY, eYYYY);
			).done(function() {
				$("#facilityInfoForm").validate({

					submitHandler: function() { //validation이 끝난 이후의 submit 직전 추가 작업할 부분
						saveInfo();
					}
					, rules: { //규칙
						FTR_IDN: { maxlength: 20 } 		// 관리번호(GIS)
						, BLK_NAM: { maxByteLength: 100 } // 블록명
						, WSP_NAM: { maxByteLength: 100 } // 급수계통명
						, WSP_BIG: { number: true } 		// 최대급수량
						, PPL_NUM: { digits: true } 		// 인구
						, GNR_NUM: { digits: true } 		// 세대수
						//, UBL_CDE     : {maxByteLength:1} 	// 대블록부호/중블록부호
						, UBL_IDN: { maxByteLength: 20 } 		// 대블록번호/붕블록번호
						, SHAPE_LENG: { number: true } 		// 모형길이
						, SHAPE_AREA: { number: true } 		// 모형영역
					}
				}); //validate
				res();
			});
		});
	},
	WTL_FIRE_PS: function() {
		return new Promise(res => {
			$.when(
				comboSetting_fctlyOverlayer($("#FTR_CDE"), "MOC_CC_031"), // 지물부호
				comboSetting_fctlyOverlayer($(".HJD_CDE"), "MOC_CC_034", "행정구역"), // 행정구역
				comboSetting_fctlyOverlayer($(".MNG_CDE"), "MOC_CC_002", "관리기관"), // 관리기관
				comboSetting_fctlyOverlayer($("#MOF_CDE"), "MOC_CC_019"), // 소화전형식/유량계형식/수압계용도 - 소방시설_소화전형식
				comboSetting_fctlyOverlayer($("#BSM_CDE"), "BSM_CDE"), // 블록부호
				comboSetting_fctlyOverlayer($("#WID_CDE"), "WID_CDE") // 광역구분

				// 날짜 초기화 참고(status/flow/leakCalResult.jsp)
				//		drSinglePicker('#IST_YMD', sYYYY, eYYYY);
				//		drSinglePicker('#RHB_YMD', sYYYY, eYYYY);
				//		drSinglePicker('#sIstYmd', sYYYY, eYYYY);
				//		drSinglePicker('#eIstYmd', sYYYY, eYYYY);
			).done(function() {
				$("#facilityInfoForm").validate({

					submitHandler: function() { //validation이 끝난 이후의 submit 직전 추가 작업할 부분
						saveInfo();
					}
					, rules: { //규칙
						FTR_IDN: { maxlength: 20 } 		// 관리번호(GIS)
						, IST_YMD: { dateISO: true } 		// 설치일자
						, DMNO: { maxByteLength: 16 } 	// 수용가번호
						//, MOF_CDE     : {number:true} 		// 소화전형식/유량계형식/수압계용도
						, FIR_DIP: { number: true } 		// 소화전구경
						, PIP_DIP: { number: true } 	    // 배수관구경
						, SUP_HIT: { number: true }       // 급수탑높이
						, ANG_DIR: { number: true } 		// 방향각
						, CNT_NUM: { maxByteLength: 10 } 	// 공사번호
						, SYS_CHK: { maxByteLength: 1 } 	// 대장초기화
						//, BSM_CDE     : {number:true} 		// 블록부호
						, BSM_IDN: { maxByteLength: 20 } 		// 블록번호
						//, WID_CDE     : {maxByteLength:100} // 광역구분
						, UPD_DTM: { maxByteLength: 254 } // 변경일시
						, ORG_IDN: { maxlength: 20 } 		// 원본번호
					}
				});//validate
				res();
			});

		});
	},
	WTL_FLOW_PS: function() {
		return new Promise(res => {
			$.when(
				comboSetting_fctlyOverlayer($("#FTR_CDE"), "MOC_CC_031"), // 지물부호
				comboSetting_fctlyOverlayer($(".HJD_CDE"), "MOC_CC_034", "행정구역"), // 행정구역
				comboSetting_fctlyOverlayer($(".MNG_CDE"), "MOC_CC_002", "관리기관"), // 관리기관
				comboSetting_fctlyOverlayer($("#GAG_CDE"), "OGC-141"), // 유량계용도 - 유량계_유량계종류
				comboSetting_fctlyOverlayer($("#MOF_CDE"), "MOC_CC_026"), // 소화전형식/유량계형식/수압계용도 - 유량계_유량계형식
				comboSetting_fctlyOverlayer($("#DAT_CDE"), "DAT_CDE"), // 데이터처리
				comboSetting_fctlyOverlayer($("#PIP_CDE"), "MOC_CC_031"), // 상수관부호 - 지형지물부호_상수
				comboSetting_fctlyOverlayer($("#VAB_CDE"), "MOC_CC_031"), // 밸브실부호
				comboSetting_fctlyOverlayer($("#BSM_CDE"), "MOC_CC_031"), // 블록부호
				comboSetting_fctlyOverlayer($("#WID_CDE"), "WID_CDE") // 광역구분


				// 날짜 초기화 참고(status/flow/leakCalResult.jsp)
				//		drSinglePicker('#IST_YMD', sYYYY, eYYYY);
				//		drSinglePicker('#RHB_YMD', sYYYY, eYYYY);
				//		drSinglePicker('#sIstYmd', sYYYY, eYYYY);
				//		drSinglePicker('#eIstYmd', sYYYY, eYYYY);
			).done(function() {
				$("#facilityInfoForm").validate({

					submitHandler: function() { //validation이 끝난 이후의 submit 직전 추가 작업할 부분
						saveInfo();
					}
					, rules: { //규칙
						FTR_IDN: { maxlength: 20 } 		// 관리번호(GIS)
						, IST_YMD: { dateISO: true } 		// 설치일자
						, DMNO: { maxByteLength: 16 } 	// 수용가번호
						, FLO_NM: { maxByteLength: 100 } // 유량계명
						, FLO_DIP: { number: true } 		// 구경
						, PRD_NAM: { maxByteLength: 80 } 	// 제작회사명
						, ANG_DIR: { number: true } 		// 방향각
						, CNT_NUM: { digits: true } 		// 공사번호
						, SYS_CHK: { maxByteLength: 1 } 	// 대장초기화
						//, PIP_CDE     : {number:true} 	// 상수관부호
						, PIP_IDN: { digits: true } 		// 상수관번호
						//, VAB_CDE     : {maxByteLength:100} // 밸브실부호
						, VAB_IDN: { maxByteLength: 254 } // 밸브실번호
						//, BSM_CDE     : {digits:true} 		// 블록부호
						, BSM_IDN: { maxByteLength: 20 } 		// 블록번호
						, LOC_LOC: { maxByteLength: 254 } // 위치
						//, WID_CDE     : {digits:true} 		// 광역구분
						, ORG_IDN: { digits: true } 		// 원본번호
					}
				});//validate
				res();
			});
		});
	},
	WTL_WAME_PS: function() {
		return new Promise(res => {
			$.when(
				comboSetting_fctlyOverlayer($("#FTR_CDE"), "MOC_CC_031"), // 지물부호
				comboSetting_fctlyOverlayer($(".HJD_CDE"), "MOC_CC_034", "행정구역"), // 행정구역
				comboSetting_fctlyOverlayer($(".MNG_CDE"), "MOC_CC_002", "관리기관"), // 관리기관
				comboSetting_fctlyOverlayer($("#GAG_CDE"), "OGC-141"), // 유량계용도 - 유량계_유량계종류
				comboSetting_fctlyOverlayer($("#MOF_CDE"), "MOC_CC_026"), // 소화전형식/유량계형식/수압계용도 - 유량계_유량계형식
				comboSetting_fctlyOverlayer($("#DAT_CDE"), "DAT_CDE"), // 데이터처리
				comboSetting_fctlyOverlayer($("#PIP_CDE"), "MOC_CC_031"), // 상수관부호 - 지형지물부호_상수
				comboSetting_fctlyOverlayer($("#VAB_CDE"), "MOC_CC_031"), // 밸브실부호
				comboSetting_fctlyOverlayer($("#BSM_CDE"), "MOC_CC_031"), // 블록부호
				comboSetting_fctlyOverlayer($("#WID_CDE"), "WID_CDE") // 광역구분


				// 날짜 초기화 참고(status/flow/leakCalResult.jsp)
				//		drSinglePicker('#IST_YMD', sYYYY, eYYYY);
				//		drSinglePicker('#RHB_YMD', sYYYY, eYYYY);
				//		drSinglePicker('#sIstYmd', sYYYY, eYYYY);
				//		drSinglePicker('#eIstYmd', sYYYY, eYYYY);
			).done(function() {
				$("#facilityInfoForm").validate({

					submitHandler: function() { //validation이 끝난 이후의 submit 직전 추가 작업할 부분
						saveInfo();
					}
					, rules: { //규칙
						FTR_IDN: { maxlength: 20 } 		// 관리번호(GIS)
						, IST_YMD: { dateISO: true } 		// 설치일자
						, DMNO: { maxByteLength: 16 } 	// 수용가번호
						, FLO_NM: { maxByteLength: 100 } // 유량계명
						, FLO_DIP: { number: true } 		// 구경
						, PRD_NAM: { maxByteLength: 80 } 	// 제작회사명
						, ANG_DIR: { number: true } 		// 방향각
						, CNT_NUM: { digits: true } 		// 공사번호
						, SYS_CHK: { maxByteLength: 1 } 	// 대장초기화
						//, PIP_CDE     : {number:true} 	// 상수관부호
						, PIP_IDN: { digits: true } 		// 상수관번호
						//, VAB_CDE     : {maxByteLength:100} // 밸브실부호
						, VAB_IDN: { maxByteLength: 254 } // 밸브실번호
						//, BSM_CDE     : {digits:true} 		// 블록부호
						, BSM_IDN: { maxByteLength: 20 } 		// 블록번호
						, LOC_LOC: { maxByteLength: 254 } // 위치
						//, WID_CDE     : {digits:true} 		// 광역구분
						, ORG_IDN: { digits: true } 		// 원본번호
					}
				});//validate
				res();
			});
		});
	},
	WTL_GAIN_AS: function() {
		return new Promise(res => {
			$.when(
				comboSetting_fctlyOverlayer($("#FTR_CDE"), "MOC_CC_031"), // 지물부호
				comboSetting_fctlyOverlayer($(".HJD_CDE"), "MOC_CC_034", "행정구역"), // 행정구역
				comboSetting_fctlyOverlayer($(".MNG_CDE"), "MOC_CC_002", "관리기관"), // 관리기관
				comboSetting_fctlyOverlayer($("#WSR_CDE"), "OGC-138"), // 수원구분
				comboSetting_fctlyOverlayer($("#WRW_CDE"), "OGC-130"), // 도수방법
				comboSetting_fctlyOverlayer($("#WGW_CDE"), "OGC-143"), // 취수방법
				comboSetting_fctlyOverlayer($("#BSM_CDE"), "BSM_CDE"), // 블록부호
				comboSetting_fctlyOverlayer($("#HGH_CDE"), "HGH_CDE"), // 시설물부호
				comboSetting_fctlyOverlayer($("#WID_CDE"), "WID_CDE") // 광역구분

				// 날짜 초기화 참고(status/flow/leakCalResult.jsp)
				//		drSinglePicker('#FNS_YMD');
				//		drSinglePicker('#sIstYmd', sYYYY, eYYYY);
				//		drSinglePicker('#eIstYmd', sYYYY, eYYYY);
			).done(function() {
				$("#facilityInfoForm").validate({

					submitHandler: function() { //validation이 끝난 이후의 submit 직전 추가 작업할 부분
						saveInfo();
					}
					, rules: { //규칙
						FTR_IDN: { maxlength: 20 } 		// 관리번호(GIS)
						, FNS_YMD: { dateISO: true } 		// 준공일자
						, DMNO: { maxByteLength: 16 } 	// 수용가번호
						, GAI_NAM: { maxByteLength: 100 } // 취수장명/관련취수장
						, DLAD: { maxByteLength: 100 }	// 상세주소
						, WSS_NAM: { maxByteLength: 100 }	// 수계명
						, AGA_VOL: { number: true } 		// 평균취수량
						, HGA_VOL: { number: true } 		// 시설용량
						, PMP_CNT: { digits: true } 		// 펌프대수
						, PMP_VOL: { number: true } 		// 펌프용량
						, GAI_ARA: { number: true } 		// 부지면적
						, CNT_NUM: { maxByteLength: 10 }  // 공사번호
						, SYS_CHK: { maxlength: 1 }       // 대장초기화
						, BSM_IDN: { maxByteLength: 20 } 		// 블록번호
						, HGH_IDN: { digits: true } 		// 시설물번호
						, SHAPE_LENG: { number: true } 		// 모형길이
						, SHAPE_AREA: { number: true } 		// 모형영역
						, ORG_IDN: { digits: true } 		// 원본번호
					}
				});
				res();
			});
		});
	},
	WTL_HEAD_AS: function() {
		return new Promise(res => {
			$.when(
				comboSetting_fctlyOverlayer($("#FTR_CDE"), "MOC_CC_031"), // 지물부호
				comboSetting_fctlyOverlayer($(".HJD_CDE"), "MOC_CC_034", "행정구역"), // 행정구역
				comboSetting_fctlyOverlayer($(".MNG_CDE"), "MOC_CC_002", "관리기관"), // 관리기관
				comboSetting_fctlyOverlayer($("#WSR_CDE"), "WSR_CDE"), // 수원구분
				comboSetting_fctlyOverlayer($("#BSM_CDE"), "BSM_CDE"), // 블록부호
				comboSetting_fctlyOverlayer($("#WID_CDE"), "WID_CDE") // 광역구분

				// 날짜 초기화 참고(status/flow/leakCalResult.jsp)
				//		drSinglePicker('#FNS_YMD');
				//		drSinglePicker('#sIstYmd', sYYYY, eYYYY);
				//		drSinglePicker('#eIstYmd', sYYYY, eYYYY);
			).done(function() {
				$("#facilityInfoForm").validate({

					submitHandler: function() { //validation이 끝난 이후의 submit 직전 추가 작업할 부분
						saveInfo();
					}
					, rules: { //규칙
						FTR_IDN: { maxlength: 20 } 		// 관리번호(GIS)
						, FNS_YMD: { dateISO: true } 		// 준공일자
						, HEA_NAM: { maxByteLength: 16 } 	// 수원지명
						, IRV_NAM: { maxByteLength: 100 }	// 유입하천명
						, RSV_VOL: { number: true }	    // 유효저수량
						, RSV_ARA: { number: true }	    // 유역면적
						, FUL_ARA: { number: true }	    // 만수면적
						, THR_WAL: { number: true }	    // 갈수위
						, HTH_WAL: { number: true }	    // 최대갈수위
						, AVG_WAL: { number: true }	    // 평수위
						, DRA_WAL: { number: true }	    // 홍수위
						, HDR_WAL: { number: true }	    // 최대홍수위
						, KEE_WAL: { number: true }	    // 사수위
						, GUA_ARA: { number: true }	    // 구역면적
						, GUA_POP: { number: true } 		// 구역인구
						, CNT_NUM: { maxByteLength: 10 }  // 공사번호
						, SYS_CHK: { maxlength: 1 }       // 대장초기화
						, BSM_IDN: { maxByteLength: 20 } 		// 블록번호
						, SHAPE_LENG: { number: true } 		// 모형길이
						, SHAPE_AREA: { number: true } 		// 모형영역
						, ORG_IDN: { digits: true } 		// 원본번호
					}
				});
				res();
			});
		});
	},
	WTL_META_PS: function() {
		return new Promise(res => {
			$.when(
				comboSetting_fctlyOverlayer($("#FTR_CDE"), "MOC_CC_031"), // 지물부호
				comboSetting_fctlyOverlayer($(".HJD_CDE"), "MOC_CC_034", "행정구역"), // 행정구역
				comboSetting_fctlyOverlayer($(".MNG_CDE"), "MOC_CC_002", "관리기관"), // 관리기관
				comboSetting_fctlyOverlayer($("#MET_MOF"), "MOC_CC_022"), // 계량기형식
				comboSetting_fctlyOverlayer($("#PIP_CDE"), "MOC_CC_031"), // 상수관부호
				comboSetting_fctlyOverlayer($("#BSM_CDE"), "BSM_CDE"), // 블록부호
				comboSetting_fctlyOverlayer($("#WID_CDE"), "WID_CDE"), // 광역구분
				comboSetting_fctlyOverlayer($("#SRV_CDE"), "SRV_CDE"), // 배수지부호
				comboSetting_fctlyOverlayer($("#MET_CDE"), "MET_CDE") // 배수지부호

				// 날짜 초기화 참고(status/flow/leakCalResult.jsp)
				//		drSinglePicker('#IST_YMD', sYYYY, eYYYY);
				//		drSinglePicker('#CTF_YMD', sYYYY, eYYYY);
				//		drSinglePicker('#sIstYmd', sYYYY, eYYYY);
				//		drSinglePicker('#eIstYmd', sYYYY, eYYYY);
			).done(function() {
				$("#facilityInfoForm").validate({

					submitHandler: function() { //validation이 끝난 이후의 submit 직전 추가 작업할 부분
						saveInfo();
					}
					, rules: { //규칙
						FTR_IDN: { maxlength: 20 } 		// 관리번호(GIS)
						, IST_YMD: { dateISO: true } 		// 설치일자
						, DMNO: { maxByteLength: 16 }	// 수용가번호
						, MET_NUM: { maxlength: 20 }  		// 기물번호
						, MET_DIP: { number: true } 		// 계량기구경
						, MET_MOF: { maxByteLength: 80 } 	// 계량기형식
						, MET_STV: { maxByteLength: 80 } 	// 계량기감도
						, PRD_NUM: { maxByteLength: 100 } // 제작회사명
						, MET_STM: { maxByteLength: 80 } 	// 봉인
						, MET_CST: { maxByteLength: 80 } 	// 계량기상태
						, MTB_LOC: { maxByteLength: 80 } 	// 보호통위치
						, MTB_MOP: { maxByteLength: 80 } 	// 보호통재질
						, MTB_CST: { maxByteLength: 80 } 	// 보호통상태
						, CNT_NUM: { maxByteLength: 10 }  // 공사번호
						, SYS_CHK: { maxlength: 1 }       // 대장초기화
						, MET_IDN: { maxByteLength: 40 } 		// 계량기번호
						, PIP_IDN: { digits: true } 		// 상수관번호
						, BSM_IDN: { maxByteLength: 20 } 		// 블록번호
						, CTF_YMD: { dateISO: true } 		// 점검일자
						, MEA_NUM: { digits: true }		// 수전번호
						, DMNM: { maxByteLength: 100 }	// 수용가명
						, SRV_IDN: { digits: true }	    // 배수지번호
						, VAB_IDN: { digits: true }	    // 밸브실번호
						, DESCRIPT: { maxByteLength: 256 }	// 비고
						, ORG_IDN: { digits: true } 		// 원본번호
					}
				});
				res();
			});
		});
	},
	WTL_PIPE_LS: function() {
		return new Promise(res => {
			$.when(
				comboSetting_fctlyOverlayer($("#MOP_CDE"), "OGC-003"), // 관재질
				comboSetting_fctlyOverlayer($("#JHT_CDE"), "OGC-005"), // 접합종류
				comboSetting_fctlyOverlayer($("#FTR_CDE"), "MOC_CC_031"), // 지물부호
				comboSetting_fctlyOverlayer($(".HJD_CDE"), "MOC_CC_034", "행정구역"), // 행정구역
				comboSetting_fctlyOverlayer($(".MNG_CDE"), "MOC_CC_002", "관리기관"), // 관리기관
				comboSetting_fctlyOverlayer($("#SAA_CDE"), "MOC_CC_014"), // 상수관용도
				comboSetting_fctlyOverlayer($("#BSM_CDE"), "BSM_CDE"), // 블록부호
				comboSetting_fctlyOverlayer($("#WID_CDE"), "WID_CDE") // 광역구분
			).done(function() {
				$("#facilityInfoForm").validate({

					submitHandler: function() { //validation이 끝난 이후의 submit 직전 추가 작업할 부분
						saveInfo();
					}
					, rules: { //규칙
						FTR_IDN: { maxlength: 20 } 		// 관리번호(GIS)
						, IST_YMD: { dateISO: true } 		// 설치일자
						, ROD_NAM: { maxByteLength: 100 } // 도로명
						, PIP_DIP: { number: true } 		// 배수관구경
						, UTG_LOC: { maxByteLength: 80 } 	// 매설환경
						, PIP_RHB: { number: true } 		// 관갱생공
						, RHB_YMD: { dateISO: true } 		// 갱생일자
						, SYS_CHK: { maxByteLength: 1 } 	// 대장초기화
						, LCEXP: { maxByteLength: 254 } // 위치설명
						, BSM_IDN: { maxByteLength: 20 } 		// 블록번호
						, PIP_LEN: { number: true } 		// 연장
						, LOW_DEP: { number: true } 		// 최저깊이
						, HGH_DEP: { number: true } 		// 최고깊이
						, AWTR_DICD: { maxByteLength: 80 } 	// 유수방향
						, CNT_NUM: { digits: true } 		// 공사번호
						, PIP_LEN: { number: true } 		// 연장
						, PIP_LBL: { maxByteLength: 100 } // 대장초기화
						, DESCRIPT: { maxByteLength: 254 } // 비고
						, SHAPE_LENG: { number: true } 		// 모형길이
					}
				})

				res();
			});
		});

	},
	WTL_PRES_PS: function() {
		return new Promise(res => {
			$.when(
				comboSetting_fctlyOverlayer($("#FTR_CDE"), "MOC_CC_031"), // 지물부호
				comboSetting_fctlyOverlayer($(".HJD_CDE"), "MOC_CC_034", "행정구역"), // 행정구역
				comboSetting_fctlyOverlayer($(".MNG_CDE"), "MOC_CC_002", "관리기관"), // 관리기관
				comboSetting_fctlyOverlayer($("#PRS_CDE"), "OGC-024"), // 가압형식 - 가스압력?
				comboSetting_fctlyOverlayer($("#SAG_CDE"), "MOC_CC_001"), // 관리방법
				comboSetting_fctlyOverlayer($("#WSL_CDE"), "WSL_CDE"), // 완화설비
				comboSetting_fctlyOverlayer($("#WSL_MOF"), "WSL_MOF"), // 완화설비형
				comboSetting_fctlyOverlayer($("#BSM_CDE"), "BSM_CDE"), // 블록부호
				comboSetting_fctlyOverlayer($("#HGH_CDE"), "HGH_CDE"), // 시설물부호
				comboSetting_fctlyOverlayer($("#WID_CDE"), "WID_CDE") // 광역구분

				// 날짜 초기화 참고(status/flow/leakCalResult.jsp)
				//		drSinglePicker('#FNS_YMD');
				//		drSinglePicker('#sIstYmd', sYYYY, eYYYY);
				//		drSinglePicker('#eIstYmd', sYYYY, eYYYY);
			).done(function() {
				$("#facilityInfoForm").validate({

					submitHandler: function() { //validation이 끝난 이후의 submit 직전 추가 작업할 부분
						saveInfo();
					}
					, rules: { //규칙
						FTR_IDN: { maxlength: 20 } 		// 관리번호(GIS)
						, FNS_YMD: { dateISO: true } 		// 준공일자
						, PRS_NAM: { maxByteLength: 100 } // 가압장명
						, PRS_ARA: { number: true }		// 부지면적
						, PRS_ALT: { number: true } 		// 가압장표고
						, PRS_VOL: { number: true } 		// 시설용량
						, PMP_CNT: { digits: true } 		// 펌프대수
						, WSL_VOL: { number: true } 		// 완화설비량
						, WSL_MOF: { maxByteLength: 80 } 	// 완화설비형
						, PRS_ARE: { maxByteLength: 200 } // 가압구성
						, PRS_SAH: { number: true } 		// 수혜가구
						, CNT_NUM: { maxByteLength: 10 }  // 공사번호
						, SYS_CHK: { maxlength: 1 }       // 대장초기화
						, BSM_IDN: { maxByteLength: 20 } 		// 블록번호
						, HGH_IDN: { digits: true } 		// 시설물번호
						, SHAPE_LENG: { number: true } 		// 모형길이
						, SHAPE_AREA: { number: true } 		// 모형영역
						, ORG_IDN: { digits: true } 		// 원본번호
					}
				});
				res();
			});
		});
	},
	WTL_PRGA_PS: function() {
		return new Promise(res => {
			$.when(
				comboSetting_fctlyOverlayer($("#FTR_CDE"), "MOC_CC_031"), // 지물부호
				comboSetting_fctlyOverlayer($(".HJD_CDE"), "MOC_CC_034", "행정구역"), // 행정구역
				comboSetting_fctlyOverlayer($(".MNG_CDE"), "MOC_CC_002", "관리기관"), // 관리기관
				comboSetting_fctlyOverlayer($("#PGA_CDE"), "MOC_CC_021"), // 수압계형식 - 수압계_수압계종류
				comboSetting_fctlyOverlayer($("#MOF_CDE"), "MOC_CC_022"), // 소화전형식/유량계형식/수압계용도 - 수압계_수압계형식
				comboSetting_fctlyOverlayer($("#DAT_CDE"), "DAT_CDE"), // 데이터처리
				comboSetting_fctlyOverlayer($("#PIP_CDE"), "MOC_CC_031"), // 상수관부호
				comboSetting_fctlyOverlayer($("#BSM_CDE"), "BSM_CDE"), // 블록부호
				comboSetting_fctlyOverlayer($("#VAB_CDE"), "VAB_CDE"), // 밸브실부호
				comboSetting_fctlyOverlayer($("#WID_CDE"), "WID_CDE") // 광역구분

				// 날짜 초기화 참고(status/flow/leakCalResult.jsp)
				//		drSinglePicker('#IST_YMD', sYYYY, eYYYY);
				//		drSinglePicker('#sIstYmd', sYYYY, eYYYY);
				//		drSinglePicker('#eIstYmd', sYYYY, eYYYY);
			).done(function() {
				$("#facilityInfoForm").validate({

					submitHandler: function() { //validation이 끝난 이후의 submit 직전 추가 작업할 부분
						saveInfo();
					}
					, rules: { //규칙
						FTR_IDN: { maxlength: 20 } 		// 관리번호(GIS)
						, IST_YMD: { dateISO: true } 		// 설치일자
						, PGA_DIP: { number: true } 		// 구경
						, STD_SAF: { number: true } 		// 측정범위
						, AVG_SAF: { number: true } 		// 평균압력
						, MSR_SAF: { number: true }		// 측정압력
						, PIP_DIP: { number: true } 		// 배수관구경
						, PRD_NAM: { maxByteLength: 100 } // 제작회사명
						, ANG_DIR: { number: true } 		// 방향각
						, CNT_NUM: { maxByteLength: 10 }  // 공사번호
						, SYS_CHK: { maxlength: 1 }       // 대장초기화
						, PIP_IDN: { digits: true } 		// 상수관번호
						, VAB_IDN: { digits: true } 		// 밸브실번호
						, BSM_IDN: { maxByteLength: 20 } 		// 블록번호
						, ORG_IDN: { digits: true } 		// 원본번호
					}
				});
				res();
			});
		});
	},
	WTL_PURI_PS: function() {
		return new Promise(res => {
			$.when(
				comboSetting_fctlyOverlayer($("#FTR_CDE"), "MOC_CC_031"), // 지물부호
				comboSetting_fctlyOverlayer($(".HJD_CDE"), "MOC_CC_034", "행정구역"), // 행정구역
				comboSetting_fctlyOverlayer($(".MNG_CDE"), "MOC_CC_002", "관리기관"), // 관리기관
				comboSetting_fctlyOverlayer($("#WSR_CDE"), "MOC_CC_023"), // 수원구분
				comboSetting_fctlyOverlayer($("#SAM_CDE"), "MOC_CC_029"), // 여과방법
				comboSetting_fctlyOverlayer($("#DTF_CDE"), "OGC-134"), // 배출수처리 - 배수지제어방법
				comboSetting_fctlyOverlayer($("#BSM_CDE"), "BSM_CDE"), // 블록부호
				comboSetting_fctlyOverlayer($("#HGH_CDE"), "HGH_CDE"), // 시설물부호
				comboSetting_fctlyOverlayer($("#WID_CDE"), "WID_CDE") // 광역구분

				// 날짜 초기화 참고(status/flow/leakCalResult.jsp)
				//		drSinglePicker('#FNS_YMD');
				//		drSinglePicker('#sIstYmd', sYYYY, eYYYY);
				//		drSinglePicker('#eIstYmd', sYYYY, eYYYY);
			).done(function() {
				$("#facilityInfoForm").validate({

					submitHandler: function() { //validation이 끝난 이후의 submit 직전 추가 작업할 부분
						saveInfo();
					}
					, rules: { //규칙
						FTR_IDN: { maxlength: 20 } 		// 관리번호(GIS)
						, FNS_YMD: { dateISO: true } 		// 준공일자
						, PUR_NAM: { maxByteLength: 100 } // 정수장명/관련정수장
						, WSR_CDE: { maxByteLength: 80 }	// 수원구분
						, GAI_NAM: { maxByteLength: 100 }	// 취수장명/관련취수장
						, SRV_NAM: { maxByteLength: 100 }	// 배수지명/관련배수지
						, PUR_VOL: { number: true } 		// 시설용량
						, PWR_VOL: { number: true } 		// 계약전력
						, PUR_ARA: { number: true } 		// 부지면적
						, CNT_NUM: { maxByteLength: 10 }  // 공사번호
						, SYS_CHK: { maxlength: 1 }       // 대장초기화
						, BSM_IDN: { maxByteLength: 20 } 		// 블록번호
						, HGH_IDN: { digits: true } 		// 시설물번호
						, SHAPE_LENG: { number: true } 		// 모형길이
						, SHAPE_AREA: { number: true } 		// 모형영역
						, ORG_IDN: { digits: true } 		// 원본번호
					}
				});
				res();
			});
		});
	},
	WTL_SERV_PS: function() {
		return new Promise(res => {
			$.when(
				comboSetting_fctlyOverlayer($("#FTR_CDE"), "MOC_CC_031"), // 지물부호
				comboSetting_fctlyOverlayer($(".HJD_CDE"), "MOC_CC_034", "행정구역"), // 행정구역
				comboSetting_fctlyOverlayer($(".MNG_CDE"), "MOC_CC_002", "관리기관"), // 관리기관
				comboSetting_fctlyOverlayer($("#SRV_CDE"), "SRV_CDE"), 	  // 배수지부호
				comboSetting_fctlyOverlayer($("#SAG_CDE"), "MOC_CC_006"), // 관리방법 - 배수지_관리방법
				comboSetting_fctlyOverlayer($("#SCW_CDE"), "OGC-134"), // 제어방법 - 배수지_배수지제어방법
				comboSetting_fctlyOverlayer($("#BSM_CDE"), "BSM_CDE"), 	  // 블록부호
				comboSetting_fctlyOverlayer($("#HGH_CDE"), "MOC_CC_031"), // 시설물부호
				comboSetting_fctlyOverlayer($("#WID_CDE"), "WID_CDE")    // 광역구분

				// 날짜 초기화 참고(status/flow/leakCalResult.jsp)
				//		drSinglePicker('#FNS_YMD');
				//		drSinglePicker('#sIstYmd', sYYYY, eYYYY);
				//		drSinglePicker('#eIstYmd', sYYYY, eYYYY);
			).done(function() {
				$("#facilityInfoForm").validate({

					submitHandler: function() { //validation이 끝난 이후의 submit 직전 추가 작업할 부분
						saveInfo();
					}
					, rules: { //규칙
						FTR_IDN: { maxlength: 20 } 		// 관리번호(GIS)
						, FNS_YMD: { dateISO: true } 		// 준공일자
						, SRV_NAM: { maxByteLength: 100 } // 배수지명/관련배수지
						, PUR_NAM: { maxByteLength: 100 } // 정수장명/관련정수장
						, SRV_ARA: { number: true }		// 부지면적
						, SRV_CDE: { maxByteLength: 100 }	// 배수지부호
						, SAG_CDE: { maxByteLength: 100 }	// 관리방법
						, SRV_VOL: { number: true } 		// 시설용량
						, SRV_ALT: { number: true } 		// 배수지표고
						, HGH_WAL: { number: true } 		// 최고수위
						, LOW_WAL: { number: true } 		// 최저수위
						, ISR_VOL: { number: true } 		// 유입량
						, SUP_ARE: { maxByteLength: 100 } // 급수지역
						, SUP_POP: { digits: true } 		// 급수인구
						, CNT_NUM: { maxByteLength: 10 }  // 공사번호
						, SYS_CHK: { maxlength: 1 }       // 대장초기화
						, BSM_IDN: { maxByteLength: 20 } 		// 블록번호
						, HGH_IDN: { digits: true } 		// 시설물번호
						, SHAPE_LENG: { number: true } 		// 모형길이
						, SHAPE_AREA: { number: true } 		// 모형영역
						, ORG_IDN: { digits: true } 		// 원본번호
					}
				});
				res();
			});
		});
	},
	WTL_SPLY_LS: function() {
		return new Promise(res => {
			$.when(
				comboSetting_fctlyOverlayer($("#FTR_CDE"), "MOC_CC_031"), // 지물부호
				comboSetting_fctlyOverlayer($(".HJD_CDE"), "MOC_CC_034", "행정구역"), // 행정구역
				comboSetting_fctlyOverlayer($(".MNG_CDE"), "MOC_CC_002", "관리기관"), // 관리기관
				comboSetting_fctlyOverlayer($("#SAA_CDE"), "MOC_CC_014"), // 상수관용도 - 상수관로_상수관용도
				comboSetting_fctlyOverlayer($("#MOP_CDE"), "OGC-003"), // 관재질
				comboSetting_fctlyOverlayer($("#JHT_CDE"), "OGC-005"), // 접합종류 - 상수관로_접합종류
				comboSetting_fctlyOverlayer($("#PIP_CDE"), "MOC_CC_031"), // 상수관부호
				comboSetting_fctlyOverlayer($("#BSM_CDE"), "BSM_CDE") // 블록부호

				// 날짜 초기화 참고(status/flow/leakCalResult.jsp)
				//		drSinglePicker('#IST_YMD', sYYYY, eYYYY);
				//		drSinglePicker('#sIstYmd', sYYYY, eYYYY);
				//		drSinglePicker('#eIstYmd', sYYYY, eYYYY);
			).done(function() {
				$("#facilityInfoForm").validate({

					submitHandler: function() { //validation이 끝난 이후의 submit 직전 추가 작업할 부분
						saveInfo();
					}
					, rules: { //규칙
						FTR_IDN: { maxlength: 20 } 		// 관리번호(GIS)
						, IST_YMD: { dateISO: true } 		// 설치일자
						, PIP_DIP: { number: true } 		// 배수관구경
						, PIP_LEN: { number: true } 		// 연장
						, LOW_DEP: { number: true } 		// 최저깊이
						, HGH_DEP: { number: true } 		// 최고깊이
						, CNT_NUM: { digits: true } 		// 공사번호
						, PIP_LBL: { maxByteLength: 100 } // 관라벨
						, SYS_CHK: { maxByteLength: 1 } 	// 대장초기화
						, PIP_IDN: { digits: true } 		// 상수관번호
						, BSM_IDN: { maxByteLength: 20 } 		// 블록번호
						, DESCRIPT: { maxByteLength: 254 } // 비고
						, SHAPE_LENG: { number: true } 		// 모형길이
					}
				});
				res();
			});
		});
	},
	/*WTL_VALB_AS: function() {
		return new Promise(res=>{
		$.when(
		comboSetting_fctlyOverlayer($("#FTR_CDE"), "MOC_CC_031"), // 지물부호
		comboSetting_fctlyOverlayer($(".HJD_CDE"), "MOC_CC_034", "행정구역"), // 행정구역
		comboSetting_fctlyOverlayer($(".MNG_CDE"), "MOC_CC_002", "관리기관"), // 관리기관
		comboSetting_fctlyOverlayer($("#SOM_CDE"), "MOC_CC_016"), // 밸브실용도 - 상수맨홀_맨홀종류?
		comboSetting_fctlyOverlayer($("#KEY_STD"), "KEY_STD"), // 키홀규격
		comboSetting_fctlyOverlayer($("#MAN_MOP"), "MAN_MOP"), // 구조물재질
		comboSetting_fctlyOverlayer($("#MHS_CDE"), "MOC_CC_017"), // 맨홀형태
		comboSetting_fctlyOverlayer($("#PIP_CDE"), "PIP_CDE"), // 상수관부호
		comboSetting_fctlyOverlayer($("#BSM_CDE"), "BSM_CDE"), // 블록부호
		comboSetting_fctlyOverlayer($("#WID_CDE"), "WID_CDE"), // 광역구분

		// 날짜 초기화 참고(status/flow/leakCalResult.jsp)
//		drSinglePicker('#IST_YMD', sYYYY, eYYYY);
//		drSinglePicker('#sIstYmd', sYYYY, eYYYY);
//		drSinglePicker('#eIstYmd', sYYYY, eYYYY);
).done(function(){
		$("#facilityInfoForm").validate({

			submitHandler: function() { //validation이 끝난 이후의 submit 직전 추가 작업할 부분
				saveInfo();
			}
			, rules: { //규칙
				FTR_IDN: { maxlength: 20 } 		// 관리번호(GIS)
				, IST_YMD: { dateISO: true } 		// 설치일자
				, MAN_CNT: { digits: true } 		// 맨홀뚜껑수
				, MHS_STD: { maxByteLength: 80 } 	// 맨홀규격
				, UTG_LOC: { maxByteLength: 80 }	// 매설환경
				, KEY_CNT: { number: true }		// 키홀수량
				, KEY_STD: { maxByteLength: 80 } 	// 키홀규격
				, CNT_NUM: { maxByteLength: 10 }  // 공사번호
				, SYS_CHK: { maxlength: 1 }       // 대장초기화
				, PIP_IDN: { digits: true } 		// 상수관번호
				, BSM_IDN: { maxByteLength: 20 } 		// 블록번호
				, SHAPE_LENG: { number: true } 		// 모형길이
				, SHAPE_AREA: { number: true } 		// 모형영역
				//, ORG_IDN     : {digits:true} 		// 원본번호
			}
		});
		res();
		})});
	},*/
	WTL_VALV_PS: function() {
		return new Promise(res => {
			$.when(
				comboSetting_fctlyOverlayer($("#FTR_CDE"), "MOC_CC_031"), // 지물부호
				comboSetting_fctlyOverlayer($(".HJD_CDE"), "MOC_CC_034", "행정구역"), // 행정구역
				comboSetting_fctlyOverlayer($(".MNG_CDE"), "MOC_CC_002", "관리기관"), // 관리기관
				comboSetting_fctlyOverlayer($("#VAL_MOF"), "OGC-031"), // 밸브형식 - 수압계_수압계형식
				comboSetting_fctlyOverlayer($("#VAL_MOP"), "OGC-030"), // 밸브재질 - 변류재질
				comboSetting_fctlyOverlayer($("#SAE_CDE"), "MOC_CC_012"), // 회전방향 - 변류시설_제수변회전방향
				comboSetting_fctlyOverlayer($("#MTH_CDE"), "OGC-007"), // 구동방법 - 변류시설_제수변구동방법
				comboSetting_fctlyOverlayer($("#CST_CDE"), "MOC_CC_010"), // 이상상태 - 변류시설_이상상태
				comboSetting_fctlyOverlayer($("#OFF_CDE"), "MOC_CC_009"), // 개폐여부 - 변류시설_개폐여부
				comboSetting_fctlyOverlayer($("#PIP_CDE"), "MOC_CC_031"), // 상수관부호
				comboSetting_fctlyOverlayer($("#BSM_CDE"), "BSM_CDE"), // 블록부호
				comboSetting_fctlyOverlayer($("#VAB_CDE"), "VAB_CDE"), // 밸브실부호
				comboSetting_fctlyOverlayer($("#WID_CDE"), "WID_CDE") // 광역구분

				// 날짜 초기화 참고(status/flow/leakCalResult.jsp)
				//		drSinglePicker('#IST_YMD', sYYYY, eYYYY);
				//		drSinglePicker('#sIstYmd', sYYYY, eYYYY);
				//		drSinglePicker('#eIstYmd', sYYYY, eYYYY);
			).done(function() {
				$("#facilityInfoForm").validate({

					submitHandler: function() { //validation이 끝난 이후의 submit 직전 추가 작업할 부분
						saveInfo();
					}
					, rules: { //규칙
						FTR_IDN: { maxlength: 20 } 		// 관리번호(GIS)
						, IST_YMD: { dateISO: true } 		// 설치일자
						, VAL_DIP: { number: true } 		// 구경
						, SAE_CDE: { maxByteLength: 80 }	// 회전방향
						, TRO_CNT: { number: true } 		// 총회전수
						, CRO_CNT: { number: true }		// 현회전수
						, MTH_CDE: { maxByteLength: 80 }	// 구동방법
						, VAP_FOR: { maxByteLength: 100 } // 보호시설
						, VAL_STD: { maxByteLength: 80 }	// 보호통규격
						, VAL_SAF: { number: true } 		// 설정압력
						, PRD_NAM: { maxByteLength: 80 }	// 제작회사명
						, CST_CDE: { maxByteLength: 80 }	// 이상상태
						, OFF_CDE: { maxByteLength: 80 }	// 개폐여부
						, EPI_CDE: { maxByteLength: 80 }	// 전기방식
						, ANG_DIR: { number: true } 		// 방향각
						, CNT_NUM: { maxByteLength: 10 }  // 공사번호
						, SYS_CHK: { maxlength: 1 }       // 대장초기화
						, PIP_IDN: { digits: true } 		// 상수관번호
						, VAB_IDN: { digits: true } 		// 밸브실번호
						, BSM_IDN: { maxByteLength: 20 } 		// 블록번호
						// , ORG_IDN     : {digits:true} 		// 원본번호
					}
				});
				res();
			});
		});
	},
};