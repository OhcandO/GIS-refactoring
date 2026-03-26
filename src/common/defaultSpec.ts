import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { transform } from 'ol/proj';
import type { MOGISMapConfig } from '../types';
import * as KEY from './keyMap';

// ---- 전역 변수 선언 (런타임 환경에서 제공됨) ----
declare const mgcCd: string;
declare const ctxPath: string;
declare const mapType: string;

/**
 * MGC_INFO - ManaGement agenCy INFOrmation
 */
export interface MGC_INFO {
	/** 지사 코드 */
	mgcCd: string;
	/** 지사 명 */
	mgcNm: string;
	/** 광역지사 코드 (CG006) */
	areaSeCd: 'A' | 'G' | 'J';
	/** 광역지사 코드명 e.g. "종합","광역","지방" */
	areaSeNm: string;
	/** 권역코드 */
	distrCd: string;
	/** SHP 파일 지사코드 e.g. '47900' */
	sgccd: string;
	/** 중심좌표 X ('EPSG:5181') */
	cenX: string;
	/** 중심좌표 Y ('EPSG:5181') */
	cenY: string;
	/** extent X min ('EPSG:5181') */
	minX: string;
	/** extent Y min ('EPSG:5181') */
	minY: string;
	/** extent X MAX ('EPSG:5181') */
	maxX: string;
	/** extent Y MAX ('EPSG:5181') */
	maxY: string;
}

/**
 * 공통으로 초기 지도 스펙을 정의
 */
const default_spec: Partial<MOGISMapConfig> = await (async function() {
	let mapSpec: Partial<MOGISMapConfig> = {
		/** Map 이 생성될 기본 DIV id */
		target: 'mainMap',
		projection: 'EPSG:3857', // <---- 배경지도 최적 좌표여야 함
		center: [14295397.247363398, 4386742.846749862],  //예천군청
		zoom: 12,
		constrainResolution:true,
	};

	//WTL_ 등 GIS 데이터가 입력된 좌표계
    proj4.defs("EPSG:5186","+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs");

	//CM_MGC 지사의 bbox 좌표 기입된 좌표계
    proj4.defs("EPSG:5181","+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +units=m +no_defs");

    //바로e맵 view 전용 좌표계
    proj4.defs("EPSG:5179","+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs");

    //Vworld 는 EPSG:3857 사용하는데, 이는 기본으로 장착되어 있음

    register(proj4);

	return await mgcInform(mgcCd).then((mgcObj: MGC_INFO) => {
//		console.log(mgcObj);
		// DB 상 좌표들은 'EPSG:5181' 으로 저장되어 있음
		let center: [number, number] = [(Number(mgcObj.minX)+Number(mgcObj.maxX))/2, (Number(mgcObj.minY)+Number(mgcObj.maxY))/2];
		if(mapType == 'intra'){
			mapSpec.projection= KEY.SRID_TILE_EMAP;
			mapSpec.center = transform(center,KEY.SRID_MGC_CRS,KEY.SRID_TILE_EMAP) as [number, number];
		}else if (mapType == 'extra'){
			mapSpec.projection= KEY.SRID_TILE_VWORLD;
			mapSpec.center = transform(center,KEY.SRID_MGC_CRS,KEY.SRID_TILE_VWORLD) as [number, number];
		}else{
			throw new Error('globals.mapType 지정되지 않음');
		}
		return mapSpec;
	});
})();



/**
 * 관리단 상세정보 조회
 * @param mgcCd 지사 코드 e.g. 'JS000514'
 * @returns MGC_INFO
 */
async function mgcInform(mgcCd: string): Promise<MGC_INFO> {
	const ur = `${ctxPath}/common/ajax/cmMgcSelect`;
	const url = new URL(ur,location.origin);
	url.search = new URLSearchParams({"mgcCd":mgcCd}).toString();
	return fetch(url.toString(),{
		headers:{
			"x-requested-with":'XMLHttpRequest',
			"content-type":'application/json;cahrset=UTF-8'
		}})
	.then(res=>res.json())
	.then(rr=>rr.cmMgcVO);
}


export default default_spec;
