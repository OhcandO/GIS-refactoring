/**
 * @deprecated 리뉴얼 필요
	메인지도상황판의 지도객체만 보여주는 팝업을 관장하는 클래스
	호출하는 페이지마다 독립된 팝업이 뜨거나, 같은 팝업창 관장하기 위함
	추가로, 시설물의 GIS 테이블 이름과 시설물의 관리번호 (typeName, ftrIdn) 로 해당 시설물을 하이라이트 함
	추가로, 특정 좌표값의 위도 경도 (lon, lat) 로 해당 위치로 지도를 이동함
	
	
	
	팝업 화면 :
		/popup/map/mapView.jsp
	
	관련 화면 및 javascript :
		/facility/facilityMap.jsp	--> 시설물정보/시설물 지도 객체 표현을 위한 jsp included 페이지  
		+ facilityMap.js
		/layout/gisJs_fclty.jsp	------> openlayers6 을 상속, 필요한 객체들을 만드는 js 모음 
		 
 */
class MapViewKit {

	/** 팝업창의 ID. 새 창 객체가 같은 ID를 사용하면 같은 창에 변경이 생김.   
	그 외의 경우 새 창으로 생성 */
	popupId = 'mapView';

	/** 팝업창이 불러올 화면 주소
	default : 시설물지도객체 (faciltiyMap) 연관 openlayers 지도 화면 */
	popupUrl = contextPath + 'facility/showMapView';

	/** 생성된 자식창 객체
	이를 통해 자식창의 함수를 호출하거나, 자식창에 변수 할당 가능  
	 <언더바(_)로 시작하는 내부변수는 직접 사용 대신 호출/할당 메서드 사용 권장>
	 */
	_instance = null;

	/**지도객체 view 이동 및 하이라이트를 위한 전달 변수  
	<언더바(_)로 시작하는 내부변수는 직접 사용 대신 호출/할당 메서드 사용 권장>
	 */
	_param = {
		ftrIdn: null,
		typeName: null,
		lon: null,
		lat: null
	}

	/**
	@param {Object} obj 매개변수 모음
	@param {String} obj.popupId 별도 지정 없으면 'mapView' 로 기본 할당
	@param {String} obj.ftrIdn 인자 - 개별 피쳐 관리번호
	@param {String} obj.typeName 인자 - GIS 연관 테이블 이름 
	@param {String} obj.lon 인자 - 특정 좌표 경도 (x 좌표, 동~서) 
	@param {String} obj.lat 인자 - 특정 좌표 위도 (y 좌표, 남~북) 
	 */
	constructor(obj) {
		if (obj instanceof Object) {
			Object.keys(obj).forEach(key => {
				if (Object.keys(this._param).some(el => el == key)) { this._param[key] = obj[key] }
			})
			if (obj.popupId) this.popupId = obj.popupId;
		}
	}

	/**
	 * 
	 * @returns {Window} 자식창 window 객체
	 */
	getInstance() { return this._instance }

	/**
	 * (optional) 생성할 자식창에 아이디 부여. 동일 아이디의 창 객체는 하나만 존재함
	 * @param {String} popupId 자식창에 지정할 아이디
	 */
	setPopupId(popupId) {
		if (popupId) this.popupId = popupId;
	}
	
	/**
	 * (optional) url을 다시 지정함
	 * @param {String} url 팝업 화면에 대한 적절한 경로
	 */
	setPopupUrl(url) {
		this.popupUrl = contextPath + url;
	}

	/**
	 * 내부 파라미터 (_param) 과 동일한 key 값을 가진 입력 변수에 대해 내부변수화
	@param {Object} obj 매개변수 모음
	@param {String} obj.ftrIdn 인자 - 개별 피쳐 관리번호
	@param {String} obj.typeName 인자 - GIS 연관 테이블 이름 
	@param {String} obj.lon 인자 - 특정 좌표 경도 (x 좌표, 동~서) 
	@param {String} obj.lat 인자 - 특정 좌표 위도 (y 좌표, 남~북) 
	 */
	setParam(obj) {
		if (obj instanceof Object) {
			Object.keys(obj).forEach(key => {
				if (Object.keys(this._param).some(el => el == key)) { this._param[key] = obj[key]; }
			})
		}
	}

	getParam() {
		return this._param;
	}
	/**
	 * (후속 개발을 위해 생성했으나 미사용)  
	 * GET 방식으로 변수 지정해 Cntrlr 에 전달하는 url 생성하는 역할
	 * @returns {String} 자식창 url 
	 */
	makeUrl() {
		const getQuery = new URLSearchParams(this._param).toString();
		const returnUrl = this.popupUrl + '?' + getQuery;
		return returnUrl;
	}

	/**새로운 창을 열고 포커스 맞춤. 
	 * 열린 창 객체를 내부 변수로 지정
	 */
	showView() {
		if (this._instance && !this._instance.closed) {
//			console.log(`${this.popupId} | showView() | 이미 창 열려있습니다. 같은 지도 사용합니다`);
		} else {
//			console.log(`${this.popupId} | showView() | 창을 엽니다`)
			this._instance = window.open(this.makeUrl(), this.popupId, 'width=800, height=950,  resizable=no');
		}
		this._instance.focus();
	}

	/**
	내부 변수(_param)에 관리번호(ftrIdn)와 GIS 테이블명(typeName)이 있는 경우,
	해당 시설물을 강조하는 함수 호출
	 */
	focusFeature() {
		if(this._param.ftrIdn && this._param.typeName){
//			console.log('mapViewKit : 관리번호에 해당하는 피쳐를 하이라이트 합니다');
			this._instance.childMap_highlightFeature(this._param.typeName, this._param.ftrIdn);
			this._instance.focus();
		}else{
			console.log(`${this.popupId} | focusFeature() | (실패) ftrIdn 또는 typeName 미할당`);
		}
	}

	/**
	내부 변수(_param)에 GIS 테이블명(typeName)과 위/경도 (lon, lat) 가 있는 경우,
	해당 위치로 view 를 이동하는 함수 호출 (하이라이트는 하지 않음)
	 */
	focusLonLat() {
//		console.log('mapViewKit : 좌표로 이동합니다');
		this._instance.childMap_fitToLonLat(this._param.typeName, his._param.lon, this._param.lat)
	}
}