import proj4 from '../../lib/proj4js-2.9.2/proj4j-2.9.2_esm.js';
import { register } from '../../lib/openlayers_v7.5.1/proj/proj4.js';
import { transform } from "../../lib/openlayers_v7.5.1/proj.js";

/**
 * 공통으로 초기 지도 스펙을 정의
 */
const default_spec = await (async function() {
	let mapSpec = {
		/** Map 이 생성될 기본 DIV id */
		target: 'mainMap',
		projection: 'EPSG:3857', // <---- 배경지도 최적 좌표여야 함
		center: [14295397.247363398, 4386742.846749862],  //예천군청  
		zoom: 12,
		constrainResolution:true,
	};
	
	//EPSG:5181,5186 초기등록
    proj4.defs("EPSG:5186","+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs");
    proj4.defs("EPSG:5181","+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +units=m +no_defs");
    register(proj4);
	
	return await mgcInform(mgcCd).then(mgcObj=>{
//		console.log(mgcObj);
		// DB 상 좌표들은 'EPSG:5186' 으로 저장되어 있음
		let center = [(Number(mgcObj.minX)+Number(mgcObj.maxX))/2, (Number(mgcObj.minY)+Number(mgcObj.maxY))/2];
		if(mapType == 'intra'){
			mapSpec.projection= 'EPSG:5186';
			mapSpec.center = transform(center,'EPSG:5181','EPSG:5186');
		}else if (mapType == 'extra'){
			mapSpec.projection= 'EPSG:3857';		
			mapSpec.center = transform(center,'EPSG:5181','EPSG:3857');
		}else{
			throw new Error('globals.mapType 지정되지 않음');
		}
		return mapSpec;		
	});
})();



/**
	@typedef {object} MGC_INFO - ManaGement agenCy INFOrmation
	@property {string} mgcCd 지사 코드
	@property {string} mgcNm 지사 명
	@property {('A'|'G'|'J')} areaSeCd 광역지사 코드 (CG006)
	@property {string} areaSeNm 광역지사 코드명 e.g. "종합","광역","지방"
	@property {string} distrCd 권역코드
	@property {string} sgccd SHP 파일 지사코드 e.g. '47900'
	@property {string} cenX 중심좌표 X ('EPSG:5181')
	@property {string} cenY 중심좌표 Y ('EPSG:5181')
	@property {string} minX extent X min ('EPSG:5181')
	@property {string} minY extent Y min ('EPSG:5181')
	@property {string} maxX extent X MAX ('EPSG:5181')
	@property {string} maxY extent Y MAX ('EPSG:5181')
*/

/**
 * @callback mgcInfoCallback
 * @param {MGC_INFO}
 */

/**
 * 관리단 상세정보 조회
 * @param {string} mgcCd 지사 코드 e.g. 'JS000514'
 */
async function mgcInform(mgcCd) {
	const ur = `${ctxPath}/common/ajax/cmMgcSelect`;
	const url = new URL(ur,location.origin);
	url.search = new URLSearchParams({"mgcCd":mgcCd});
	return fetch(url,{
		headers:{
			"x-requested-with":'XMLHttpRequest',
			"content-type":'application/json;cahrset=UTF-8'
		}})
	.then(res=>res.json())
	.then(rr=>rr.cmMgcVO);
}


export default default_spec;