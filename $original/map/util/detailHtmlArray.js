
/**
* Date : 2020.12.09 
* Name : sp.yoon 
* Dec  : 자산관리 항목 추가 (수정)
* See  : 상수관망도운영
**/

var detailHtmlArray ={
	/**
	 * ======================================================================================================
	 * point 
	 * ======================================================================================================
	 */
	WTL_FLOW_PS :{
		SGCCD:"지자체코드|hidden|",
		FTR_CDE:"지물부호|select|MOC_CC_031",
		FTR_IDN:"관리번호|text|",
		HJD_CDE:"행정구역|select|MOC_CC_034",
		MNG_CDE:"관리기관|select|MOC_CC_002",
		IST_YMD:"설치일자|text",
		GAG_CDE:"유량계용도|select|MOC_CC_025",
		MOF_CDE:"유량계형식|select|MOC_CC_026",
		FLO_NM:"유량계명|text",
		FLO_DIP:"구경|text",
		PRD_NAM:"제작회사명|text",
		CNT_NUM:"공사번호|text",
		//DAT_CDE:"데이터처리|select|DAT_CDE",
		//ANG_DIR:"방향각|text",
		SYS_CHK:"대장초기화|text",
		PIP_CDE:"상수관부호|select|MOC_CC_031",
		PIP_IDN:"상수관번호|text",
		//VAB_CDE:"밸브실부호|select|MOC_CC_031",
		//VAB_IDN:"밸브실번호|text",
		BSM_CDE:"블록부호|select|MOC_CC_031",
		BSM_IDN:"블록번호|text",
		LOC_LOC:"위치|text",
		WID_CDE:"광역구분|select|WID_CDE",
		UPD_DTM:"변경일시|text|",
		FTR_IDS:"지물번호|hidden",
		USEFUL_LIFE:"내용연수(연)|text|",
		ACQST_COST:"취득원가(원)|text|",
		REMAINING_LIFE:"잔존수명(연)|text|",
	},
	WTL_PRGA_PS :{
		SGCCD:"지자체코드|hidden",
		FTR_CDE:"지물부호|select|MOC_CC_031",
		FTR_IDN:"관리번호|text|",
		HJD_CDE:"행정구역|select|MOC_CC_034",
		MNG_CDE:"관리기관|select|MOC_CC_002",
		IST_YMD:"설치일자|text",
		PGA_CDE:"수압계형식|select|MOC_CC_021",
		MOF_CDE:"수압계용도|select|MOC_CC_022",
		PGA_DIP:"구경|text",
		//DAT_CDE:"데이터처리|select|DAT_CDE",
		STD_SAF:"측정범위|text",
		AVG_SAF:"평균압력|text",
		MSR_SAF:"측정압력|text",
		PIP_DIP:"배수관구경|text",
		PRD_NAM:"제작회사명|text",
		//ANG_DIR:"방향각|text",
		//CNT_NUM:"공사번호|text",
		SYS_CHK:"대장초기화|text",
		PIP_CDE:"상수관부호|select|MOC_CC_031",
		PIP_IDN:"상수관번호|text",
		//VAB_CDE:"밸브실부호|select|VAB_CDE",
		//VAB_IDN:"밸브실번호|text",
		BSM_CDE:"블록부호|select|BSM_CDE",
		BSM_IDN:"블록번호|text",
		WID_CDE:"광역구분|select|WID_CDE",
		UPD_DTM:"변경일시|text|",
		PRG_NM:"블록명|text",
		FTR_IDS:"지물번호|hidden",
		USEFUL_LIFE:"내용연수(연)|text|",
		ACQST_COST:"취득원가(원)|text|",
		REMAINING_LIFE:"잔존수명(연)|text|",
	},
	WTL_META_PS :{
		SGCCD:"지자체코드|hidden|",
		FTR_CDE:"지물부호|select|MOC_CC_031",
		FTR_IDN:"관리번호|text|",
		HJD_CDE:"행정구역|select|MOC_CC_034",
		IST_YMD:"설치일자|text",
		DMNO:"수용가번호|text",
		MET_NUM:"기물번호|text",
		MET_DIP:"계량기구경|text",
		MET_MOF:"계량기형식|select|MOC_CC_022",
		//MET_STV:"계량기감도|text",
		//PRD_NUM:"제작회사명|text",
		//MET_STM:"봉인|text",
		//MET_CST:"계량기상태|text",
		//MTB_LOC:"보호통위치|text",
		//MTB_MOP:"보호통재질|select|MOC_CC_022",
		//MTB_CST:"보호통상태|text",
		//CNT_NUM:"공사번호|text",
		SYS_CHK:"대장초기화|text",
		//MET_IDN:"계량기번호|text",
		PIP_CDE:"상수관부호|select|MOC_CC_031",
		PIP_IDN:"상수관번호|text",
		BSM_CDE:"블록부호|select|BSM_CDE",
		//BSM_IDN:"블록번호|text",
		WID_CDE:"광역구분|select|WID_CDE",
		//UPD_DTM:"변경일시|text|",
		//CTF_YMD:"점검일자|text",
		//MEA_NUM:"수전번호|text",
		//MET_CDE:"급수상태|select|MET_CDE",
		//MNG_CDE:"관리기관|select|MOC_CC_002",
		//DMNM:"수용가명|text",
		//SRV_CDE:"배수지부호|select|SRV_CDE",
		//SRV_IDN:"배수지번호|text",
		//VAB_IDN:"밸브실번호|text",
		//DESCRIPT:"비고|text",
		FTR_IDS:"지물번호|hidden",
		USEFUL_LIFE:"내용연수(연)|text|",
		ACQST_COST:"취득원가(원)|text|",
		REMAINING_LIFE:"잔존수명(연)|text|",
	},
	WTL_VALV_PS :{
		SGCCD:"지자체코드|hidden",
		FTR_CDE:"지물부호|select|MOC_CC_031",
		FTR_IDN:"관리번호|text|",
		HJD_CDE:"행정구역|select|MOC_CC_034",
		MNG_CDE:"관리기관|select|MOC_CC_002",
		IST_YMD:"설치일자|text",
		VAL_MOF:"밸브형식|select|MOC_CC_022",
		VAL_MOP:"밸브재질|select|OGC-030",
		VAL_DIP:"구경|text",
		SAE_CDE:"회전방향|select|MOC_CC_012",
		TRO_CNT:"총회전수|text",
		CRO_CNT:"현회전수|text",
		MTH_CDE:"구동방법|select|MOC_CC_011",
		//VAP_FOR:"보호시설|text",
		VAL_STD:"보호통규격|text",
		//VAL_SAF:"설정압력|text",
		//PRD_NAM:"제작회사명|text",
		CST_CDE:"이상상태|select|MOC_CC_010",
		OFF_CDE:"개폐여부|select|MOC_CC_009",
		//EPI_CDE:"전기방식|text",
		ANG_DIR:"방향각|text",
		CNT_NUM:"공사번호|text",
		SYS_CHK:"대장초기화|text",
		PIP_CDE:"상수관부호|select|MOC_CC_031",
		PIP_IDN:"상수관번호|text",
		//VAB_CDE:"밸브실부호|select|VAB_CDE",
		//VAB_IDN:"밸브실번호|text",
		BSM_CDE:"블록부호|select|BSM_CDE",
		//BSM_IDN:"블록번호|text",
		WID_CDE:"광역구분|select|WID_CDE",
		//UPD_DTM:"변경일시|text|",
		FTR_IDS:"지물번호|hidden",
		USEFUL_LIFE:"내용연수(연)|text|",
		ACQST_COST:"취득원가(원)|text|",
		REMAINING_LIFE:"잔존수명(연)|text|",
	},
	WTL_FIRE_PS :{
		SGCCD:"지자체코드|hidden",
		FTR_CDE:"지물부호|select|MOC_CC_031",
		FTR_IDN:"관리번호|text|",
		HJD_CDE:"행정구역|select|MOC_CC_034",
		MNG_CDE:"관리기관|select|MOC_CC_002",
		IST_YMD:"설치일자|text",
		DMNO:"수용가번호|text",
		MOF_CDE:"소화전형식|select|MOC_CC_019",
		FIR_DIP:"소화전구경|text",
		PIP_DIP:"배수관구경|text",
		SUP_HIT:"급수탑높이|text",
		ANG_DIR:"방향각|text",
		CNT_NUM:"공사번호|text",
		SYS_CHK:"대장초기화|text",
		BSM_CDE:"블록부호|select|BSM_CDE",
		BSM_IDN:"블록번호|text",
		WID_CDE:"광역구분|select|WID_CDE",
		UPD_DTM:"변경일시|text|",
		GEOMETRY:"공간정보|text",
		FTR_IDS:"지물번호|hidden",
		//USEFUL_LIFE:"내용연수(연)|text|",
		//ACQST_COST:"취득원가(원)|text|",
		//REMAINING_LIFE:"잔존수명(연)|text|",
	},
	/**
	 * ======================================================================================================
	 * line 
	 * ======================================================================================================
	 */
	WTL_PIPE_LS :{
		SGCCD:"지자체코드|hidden",
		FTR_CDE:"지물부호|select|MOC_CC_031",
		FTR_IDN:"관리번호|text|",
		HJD_CDE:"행정구역|select|MOC_CC_034",
		MNG_CDE:"관리기관|select|MOC_CC_002",
		IST_YMD:"설치일자|text",
		//ROD_NAM:"도로명|text",
		SAA_CDE:"상수관용도|select|MOC_CC_014",
		MOP_CDE:"관재질|select|MOC_CC_003",
		PIP_DIP:"배수관구경|text",
		JHT_CDE:"접합종류|select|MOC_CC_015",
		//UTG_LOC:"매설환경|text",
		//PIP_RHB:"관갱생공|text",
		//RHB_YMD:"갱생일자|text",
		SYS_CHK:"대장초기화|text",
		//LCEXP:"위치설명|text",
		//BSM_CDE:"블록부호|select|BSM_CDE",
		//BSM_IDN:"블록번호|text",
		PIP_LEN:"연장|text",
		//LOW_DEP:"최저깊이|text",
		//HGH_DEP:"최고깊이|text",
		//UPD_DTM:"변경일시|text|",
		WID_CDE:"광역구분|select|WID_CDE",
		//AWTR_DICD:"유수방향|text",
		CNT_NUM:"공사번호|text",
		PIP_LBL:"관라벨|text",
		//DESCRIPT:"비고|text",
		//SHAPE_LENG:"모형길이|text",
		FTR_IDS:"지물번호|hidden",
		USEFUL_LIFE:"내용연수(연)|text|",
		ACQST_COST:"취득원가(원)|text|",
		REMAINING_LIFE:"잔존수명(연)|text|",
	},
	WTL_SPLY_LS :{
		SGCCD:"지자체코드|hidden",
		FTR_CDE:"지물부호|select|MOC_CC_031",
		FTR_IDN:"관리번호|text|",
		HJD_CDE:"행정구역|select|MOC_CC_034",
		MNG_CDE:"관리기관|select|MOC_CC_002",
		IST_YMD:"설치일자|text",
		MOP_CDE:"관재질|select|MOC_CC_003",
		SAA_CDE:"상수관용도|select|MOC_CC_014",
		PIP_DIP:"배수관구경|text",
		PIP_LEN:"연장|text",
		JHT_CDE:"접합종류|select|MOC_CC_015",
		//LOW_DEP:"최저깊이|text",
		//HGH_DEP:"최고깊이|text",
		CNT_NUM:"공사번호|text",
		PIP_LBL:"관라벨|text",
		SYS_CHK:"대장초기화|text",
		//PIP_CDE:"상수관부호|select|MOC_CC_031",
		//PIP_IDN:"상수관번호|text",
		BSM_CDE:"블록부호|select|BSM_CDE",
		//BSM_IDN:"블록번호|text",
		//WID_CDE:"광역구분|text",
		//UPD_DTM:"변경일시|text|",
		//DESCRIPT:"비고|text",
		//SHAPE_LENG:"모형길이|text",
		FTR_IDS:"지물번호|hidden",
		USEFUL_LIFE:"내용연수(연)|text|",
		ACQST_COST:"취득원가(원)|text|",
		REMAINING_LIFE:"잔존수명(연)|text|",
	},
	
	/**
	 * ======================================================================================================
	 * area 
	 * ======================================================================================================
	 */
	WTL_BLBG_AS :{
		SGCCD:"지자체코드|hidden",
		FTR_CDE:"지물부호|select|MOC_CC_031",
		FTR_IDN:"관리번호|text|",
		BLK_NAM:"블록명|text",
		WSP_NAM:"급수계통명|text",
		WSP_BIG:"최대급수량|text",
		MNG_CDE:"관리기관|select|MOC_CC_002",
		PPL_NUM:"인구|text",
		GNR_NUM:"세대수|text",
		//UPD_DTM:"변경일시|text|",
		//SHAPE_LENG:"모형길이|text",
		//SHAPE_AREA:"모형영역|text",
		FTR_IDS:"지물번호|hidden"
	},
	WTL_BLBM_AS :{
		SGCCD:"지자체코드|hidden",
		FTR_CDE:"지물부호|select|MOC_CC_031",
		FTR_IDN:"관리번호|text|",
		BLK_NAM:"블록명|text",
		WSP_NAM:"급수계통명|text",
		//WSP_BIG:"최대급수량|text",
		MNG_CDE:"관리기관|select|MOC_CC_002",
		PPL_NUM:"인구|text",
		//GNR_NUM:"세대수|text",
		UBL_CDE:"대블록부호|select|blbgAs",
		UBL_IDN:"대블록번호|text",
		UPD_DTM:"변경일시|text|",
		//SHAPE_LENG:"모형길이|text",
		//SHAPE_AREA:"모형영역|text",
		FTR_IDS:"지물번호|hidden"
	},
	WTL_BLSM_AS :{
		SGCCD:"지자체코드|hidden",
		FTR_CDE:"지물부호|select|MOC_CC_031",
		FTR_IDN:"관리번호|text|",
		BLK_NAM:"블록명|text",
		WSP_NAM:"급수계통명|text",
		//WSP_BIG:"최대급수량|text",
		MNG_CDE:"관리기관|select|MOC_CC_002",
		//PPL_NUM:"인구|text",
		//GNR_NUM:"세대수|text",
		UBL_CDE:"중블록부호|select|blbmAs",
		UBL_IDN:"중블록번호|text",
		//UPD_DTM:"변경일시|text|",
		//SHAPE_LENG:"모형길이|text",
		//SHAPE_AREA:"모형영역|text",
		FTR_IDS:"지물번호|hidden"
	},
	WTL_HEAD_AS :{
		SGCCD:"지자체코드|hidden",
		FTR_CDE:"지물부호|text|",
		FTR_IDN:"관리번호|text|",
		HJD_CDE:"행정구역|text",
		MNG_CDE:"관리기관|text",
		FNS_YMD:"준공일자|text",
		HEA_NAM:"수원지명|text",
		WSR_CDE:"수원구분|text",
		IRV_NAM:"유입하천명|text",
		RSV_VOL:"유효저수량|text",
		RSV_ARA:"유역면적|text",
		FUL_ARA:"만수면적|text",
		THR_WAL:"갈수위|text",
		HTH_WAL:"최대갈수위|text",
		AVG_WAL:"평수위|text",
		DRA_WAL:"홍수위|text",
		HDR_WAL:"최대홍수위|text",
		KEE_WAL:"사수위|text",
		GUA_ARA:"구역면적|text",
		GUA_POP:"구역인구|text",
		CNT_NUM:"공사번호|text",
		SYS_CHK:"대장초기화|text",
		BSM_CDE:"블록부호|text",
		BSM_IDN:"블록번호|text",
		WID_CDE:"광역구분|text",
		UPD_DTM:"변경일시|text|",
		SHAPE_LENG:"모형길이|text",
		SHAPE_AREA:"모형영역|text",
		FTR_IDS:"지물번호|hidden"
	},
	//취수장
	WTL_GAIN_AS :{
		SGCCD:"지자체코드|hidden",
		FTR_CDE:"지물부호|select|MOC_CC_031",
		FTR_IDN:"관리번호|text|",
		HJD_CDE:"행정구역|select|MOC_CC_034",
		MNG_CDE:"관리기관|select|MOC_CC_002",
		FNS_YMD:"준공일자|text",
		GAI_NAM:"취수장명|text",
		//DLAD:"상세주소|text",
		WSR_CDE:"수원구분|select|OGC-138",
		WSS_NAM:"수계명|text",
		//AGA_VOL:"평균취수량|text",
		HGA_VOL:"시설용량|text",
		PMP_CNT:"펌프대수|text",
		PMP_VOL:"펌프용량|text",
		GAI_ARA:"부지면적|text",
		WRW_CDE:"도수방법|select|OGC-130",
		WGW_CDE:"취수방법|select|OGC-143",
		CNT_NUM:"공사번호|text",
		SYS_CHK:"대장초기화|text",
		//BSM_CDE:"블록부호|text",
		//BSM_IDN:"블록번호|text",
		//HGH_CDE:"시설물부호|text",
		//HGH_IDN:"시설물번호|text",
		//WID_CDE:"광역구분|text",
		//UPD_DTM:"변경일시|text|",
		//SHAPE_LENG:"모형길이|text",
		//SHAPE_AREA:"모형영역|text",
		FTR_IDS:"지물번호|hidden",
	},
	//정수장
	WTL_PURI_PS :{
		SGCCD:"지자체코드|hidden",
		FTR_CDE:"지물부호|select|MOC_CC_031",
		FTR_IDN:"관리번호|text|",
		HJD_CDE:"행정구역|select|MOC_CC_034",
		MNG_CDE:"관리기관|select|MOC_CC_002",
		FNS_YMD:"준공일자|text",
		PUR_NAM:"정수장명|text",
		WSR_CDE:"수원구분|select|MOC_CC_023",
		GAI_NAM:"관련취수장|text",
		SRV_NAM:"관련배수지|text",
		PUR_VOL:"시설용량|text",
		PWR_VOL:"계약전력|text",
		PUR_ARA:"부지면적|text",
		SAM_CDE:"여과방법|select|MOC_CC_029",
		//DTF_CDE:"배출수처리|select|OGC-134",
		//CNT_NUM:"공사번호|text",
		SYS_CHK:"대장초기화|text",
		//BSM_CDE:"블록부호|select|BSM_CDE",
		//BSM_IDN:"블록번호|text",
		//HGH_CDE:"시설물부호|select|HGH_CDE",
		//HGH_IDN:"시설물번호|text",
		//WID_CDE:"광역구분|select|WID_CDE",
		//UPD_DTM:"변경일시|text|",
		//SHAPE_LENG:"모형길이|text",
		//SHAPE_AREA:"모형영역|text",
		FTR_IDS:"지물번호|hidden"
	},
	//배수지
	WTL_SERV_PS :{
		SGCCD:"지자체코드|hidden",
		FTR_CDE:"지물부호|select|MOC_CC_031",
		FTR_IDN:"관리번호|text|",
		HJD_CDE:"행정구역|select|MOC_CC_034",
		MNG_CDE:"관리기관|select|MOC_CC_002",
		SRV_NAM:"배수지명|text",
		PUR_NAM:"관련정수장|text",
		SRV_ARA:"부지면적|text",
		//SRV_CDE:"배수지부호|select|SRV_CDE",
		SAG_CDE:"관리방법|select|MOC_CC_006",
		SRV_VOL:"시설용량|text",
		SRV_ALT:"배수지표고|text",
		HGH_WAL:"최고수위|text",
		LOW_WAL:"최저수위|text",
		ISR_VOL:"유입량|text",
		SUP_ARE:"급수지역|text",
		//SUP_POP:"급수인구|text",
		SCW_CDE:"제어방법|select|MOC_CC_007",
		//CNT_NUM:"공사번호|text",
		//SYS_CHK:"대장초기화|text",
		BSM_CDE:"블록부호|select|BSM_CDE",
		//BSM_IDN:"블록번호|text|",
		//HGH_CDE:"시설물부호|select|MOC_CC_031",
		//HGH_IDN:"시설물번호|text",
		WID_CDE:"광역구분|select|WID_CDE",
		UPD_DTM:"변경일시|text|",
		FTR_IDS:"지물번호|hidden"
	},
	//가압장
	WTL_PRES_PS :{
		SGCCD:"지자체코드|hidden",
		FTR_CDE:"지물부호|select|MOC_CC_031",
		FTR_IDN:"관리번호|text|",
		HJD_CDE:"행정구역|select|MOC_CC_034",
		MNG_CDE:"관리기관|select|MOC_CC_002",
		FNS_YMD:"준공일자|text",
		PRS_NAM:"가압장명|text",
		PRS_ARA:"부지면적|text",
		//PRS_CDE:"가압형식|text",
		SAG_CDE:"관리방법|select|MOC_CC_001",
		PRS_ALT:"가압장표고|text",
		PRS_VOL:"시설용량|text",
		//PMP_CNT:"펌프대수|text",
		//WSL_CDE:"완화설비|select|WSL_CDE",
		//WSL_VOL:"완화설비량|text",
		//WSL_MOF:"완화설비형|select|WSL_MOF",
		//PRS_ARE:"가압구셩|text",
		//PRS_SAH:"수혜가구|text",
		//CNT_NUM:"공사번호|text",
		//SYS_CHK:"대장초기화|text",
		BSM_CDE:"블록부호|select|BSM_CDE",
		//BSM_IDN:"블록번호|text",
		//HGH_CDE:"시설물부호|text|HGH_CDE",
		//HGH_IDN:"시설물번호|text",
		WID_CDE:"광역구분|select|WID_CDE",
		//UPD_DTM:"변경일시|text|",
		//SHAPE_LENG:"모형길이|text",
		//SHAPE_AREA:"모형영역|text",
		FTR_IDS:"지물번호|hidden"
	},
	//밸브실
	WTL_VALB_AS :{
		SGCCD:"지자체코드|hidden",
		FTR_CDE:"지물부호|text|",
		FTR_IDN:"관리번호|text|",
		HJD_CDE:"행정구역|text",
		MNG_CDE:"관리기관|text",
		IST_YMD:"설치일자|text",
		MAN_STD:"규격|text",
		SOM_CDE:"밸브실용도|text",
		MAN_CNT:"맨홀뚜껑수|text",
		MHS_STD:"맨홀규격|text",
		UTG_LOC:"매설환경|text",
		KEY_CNT:"키홀수량|text",
		KEY_STD:"키홀규격|text",
		MAN_MOP:"구조물재질|text",
		MHS_CDE:"맨홀형태|text",
		CNT_NUM:"공사번호|text",
		SYS_CHK:"대장초기화|text",
		PIP_CDE:"상수관부호|text",
		PIP_IDN:"상수관번호|text",
		BSM_CDE:"블록부호|text",
		BSM_IDN:"블록번호|text",
		WID_CDE:"광역구분|text",
		UPD_DTM:"변경일시|text|",
		SHAPE_LENG:"모형길이|text",
		SHAPE_AREA:"모형영역|text",
		FTR_IDS:"지물번호|hidden"
	}
}