import { MOSubscriber } from "../abstract/MO.Subscriber.js";
import * as KEY from '../../common/MO.keyMap.js';


/**
 * 지도 위 범례 정보를 수집하고 
 * 표현하는 객체
 * (MOSubscriber 구현체)
 *
 * @class MOLegend
 * @extends {MOSubscriber}
 * @author jhoh
 */
export class MOLegend extends MOSubscriber {
    
    /** 범례가 들어갈 DIV 요소
     * @type {Element} */
    #target_id;

    /**범례에 들어갈 요소들 코드 객체
     * @type {Array}*/
    contentArray=[];

    /** 레이어 목적 별 그룹 자체의 우선순위 (MO.KeyMap.js) 
     * e.g. ={base:4, leak: 2, pipenet:1,...}
     * MO.KeyMap.js 에 명시된 순서로 갱신됨
     * @type {object} */
    categoryOrder={ base: 5, comp: 7, leak: 2,
        manage: 6,pipenet: 4, portable: 9,public: 3,
        realtime: 8, risk: 1,};

    /** 레이어 각 목적별 구분의 소제목
     * @type {object}*/
    categoryTitle={ base:'GIS 관망도', 
        risk:'RiskMap', leak:'누수예상지점', 
        public:'공공서비스', pipenet:'관망해석결과', 
        manage:'중점관리지역', comp:'상습민원지역', 
        realtime:'실시간상황감지', portable:'이동형누수센서', }

    /**
     * layerCode 객체간 정렬 룰 지정
     * @param {KEY.layerCodeObj} a 
     * @param {KEY.layerCodeObj} b 
     * @returns {number}
     */
    contentSortingRule = (a,b)=>{
        //각 레이어 요소들을 정렬하는 방법
        // 큰 그룹 (레이어 1수준 버튼) 순서 우선
        // 작은그룹 (레이어2수준) 에서는 KEY.LAYER_ORDER 값을 기준으로
        let bigGroup =
            this.categoryOrder[a[KEY.LAYER_PURPOSE_CATEGORY_KEY]] -
            this.categoryOrder[b[KEY.LAYER_PURPOSE_CATEGORY_KEY]];
        let smallGroup =
            a.layerCode[KEY.LAYER_ORDER] - b.layerCode[KEY.LAYER_ORDER];
        return bigGroup * 100 + smallGroup;
    }
    /**
     * 
     * @param {string} div_id - 범례가 들어갈 DIV 의 ID
     */
    constructor(div_id='mapLegend'){
        super(div_id);
        this.#target_id= div_id;
        if(!(document.getElementById(div_id) instanceof Element)){
            throw new Error (`Legend 객체 생성될 DIV 아이디 입력되어야 함`);
        }

        this.categoryOrder = Object.fromEntries(Object.values(KEY.LAYER_PURPOSE_CATEGORY));
    }

    //🟨🟨🟨 Observer pattern - Subscriber 추상메서드 구현🟨🟨🟨
    update(publisherID){
        //1. MOPublisher 식별
        let publisher = this.getPublisher(publisherID);
        if(publisher){
            //2. 해당 MOPublisher 에서 데이터 가져오기
            let publisherDataArr = structuredClone(publisher.PublisherData); // 깊은 복사

            //3. 가져온 LegendObj 의 보이기/감추기 여부로 표출/삭제 결정
            if(publisherDataArr instanceof Array){
                publisherDataArr.forEach(legendObj=>this.controlLegendObject(legendObj));
            }else{
                throw new Error(`잘못 지정된 LayerTree.PublisherData: ${publisher.PublisherData}`);
            }

            //4. 내부 저장된 LegendObj 들 정렬
            this.contentArray.sort(this.contentSortingRule);

            //5. LegendObj 들을 targetElement 에 발행
            let htmlStra = this.getLegendHtmlString();
            let element = document.getElementById(this.#target_id);
            element.replaceChildren();
            element.insertAdjacentHTML('afterbegin',htmlStra);

            //6. 발행된 요소에 이벤트 적용 (닫기버튼 등)
//            document.getElementById('pop_legend_close').addEventListener('click',()=>{
//                document.getElementById(this.#target_id).style.display='none';
//            })
        }
    }
    //🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨

    /**
     * 개별 범례요소의 보이기/감추기 속성에 따라 분기처리
     * @param {KEY.LegendCodeObj} legendObj 
     */
    controlLegendObject (legendObj){
        //1. 범례 요소가 '보이기' 처리인 경우
        if(legendObj[KEY.BOOL_VISIBLE] == true){
            this.contentArray.push(legendObj)
        }else if (typeof legendObj[KEY.BOOL_VISIBLE] =='string' &&legendObj[KEY.BOOL_VISIBLE]?.toUpperCase()=='Y'){
            this.contentArray.push(legendObj)
        }
        //2. 범례 요소가 '감추기' 처리인 경우
        else{
            this.contentArray = this.contentArray.filter(el=>el[KEY.LAYER_ID] != legendObj[KEY.LAYER_ID]);
        }
    }

    //◼◼◼◼범례◼◼표현◼◼함수◼◼◼◼◼◼◼◼◼◼◼◼◼
    /**
     * 범례 htmlString 생성 함수
     * @return {string}*/
    getLegendHtmlString(){
        let source = this.getCategorizedList();

        let htmlStr = '';
        htmlStr+= this.legend_open();
        source.forEach((legendObjArr,la_pu_ca_key)=>{
            let title = this.categoryTitle[la_pu_ca_key];
            htmlStr += this.legendTitle(title);
            
            //리스크맵, 관망해석 범례는 모델 정보도 표현해야 함
            if([KEY.LAYER_PURPOSE_CATEGORY.RISKMAP[0],KEY.LAYER_PURPOSE_CATEGORY.PIPENET[0]].includes(la_pu_ca_key)){
				legendObjArr.forEach(legendObj=>{
					htmlStr+=this.legendPipenetTitle(`${legendObj.layerCode[KEY.LAYER_NAME]}`);	
					htmlStr+= `
						<div class="pop_legend_cont">`;
					//관망해석에만 모델 정보 입력함	
					if(la_pu_ca_key== KEY.LAYER_PURPOSE_CATEGORY.PIPENET[0]){
					htmlStr+= `
							<ul class="pop_flow_model">
								<li>
									<label for="modelName_${la_pu_ca_key}">모델명</label>
									<input type="text" id="modelName_${la_pu_ca_key}" readonly value="${legendObj.legendModelInfo.modelName}" name="model">
								</li>
								<li>
									<label for="modelDate_${la_pu_ca_key}">해석 일자</label>
									<input type="text" id="modelDate_${la_pu_ca_key}" readonly value="${legendObj.legendModelInfo.modelDate}" name="interpretation date">
								</li>
							</ul>`;
					}
					htmlStr+=`
							<ul class="pop_flow_rate">`;
					htmlStr += legendObj[KEY.LEGEND_HTML_STRING].value;
					htmlStr+=`
							</ul>
						</div>`;
				});
				
			}else{
			//그 밖의 일반 레이어들
	            htmlStr += this.legendBody_open();
	            if(legendObjArr?.length>0){
	                legendObjArr.forEach(legendObj=>{
	                    htmlStr += this.legendList(legendObj[KEY.LEGEND_HTML_STRING])
	                })
	            }
	            htmlStr += this.legendBody_close();
				
			}
			
        });
        htmlStr+= this.legend_close();
        return htmlStr;
    }

    /* 예시
        'base' => [
            {id: 10, boolVisible: true, layerPurposeCategory: 'base', legendHtmlString: '<span><img src="data..pan>', layerCode: {…}}
            ,{id: 12, boolVisible: true, layerPurposeCategory: 'base', legendHtmlString: '<span><img src="data:an>', layerCode: {…}}
            ,{id: 13, boolVisible: true, layerPurposeCategory: 'base', legendHtmlString: '<span><img src="data:pan>', layerCode: {…}}
        ]
    */
   /** 내부에 저장된 배열 요소의 카테고리 지정
    *  원본 배열의 순서대로 Map의 요소 구성, 
    * @returns {Map<string,Array>}*/
    getCategorizedList(){
        return this.contentArray.reduce((pre,cur)=>{
            let key= KEY.LAYER_PURPOSE_CATEGORY_KEY;
            if(!pre.has(cur[key])) pre.set(cur[key], []);
            pre.get(cur[key]).push(cur);
            return pre;
        },new Map())        
    }


    /** 범례 대 제목 
     * @returns {string}*/
    legend_open = ()=>`<div class="pop_title" tabindex="0">범례</div>`;
    /** 범례 소그룹 제목 생성
     * @param {string} title 
     * @returns {string}*/
    legendTitle = (title)=> `<div class="pop_stitle" tabindex="0">${title}</div>`;
    legendPipenetTitle = (subTitle)=>`<div class="pop_xstitle" tabindex="0">${subTitle}</div>`;
    /** 범례 각 소항목 더하기 전에 추가하는 div 영역
     * @returns {string}*/
    legendBody_open = () => `<div class="pop_legend_cont">
                                <ul class="water_leak">`;
    /** 범례 각 소항목 구성하는 li 
     * @param {string} str 
     * @returns {string}*/                                
    legendList = (str)=>  `<li tabindex="0">${str}</li>`
    /** 범레 각 소항목 추가 후에 소그룹 영역 닫기
     * @returns {string}*/
    legendBody_close=()=> `</ul></div>`;
    /** 범례 닫기 버튼 
     * @returns {string}*/
    legend_close = ()=> `<a class="pop_leg_close" href="javascript:pop_close_visibility('${this.#target_id}');"><img src="${ctxPath}/bootstrap-template/gentelella/production/images/button/pop_close.png" alt="창닫기"></a>`;
}   

/* 전형적인 범례 div 형태
<div id="pop_legend" class="pop_legend_wrap"> 🟩🟩🟩🟩🟩🟩🟩범례 target-Element🟩🟩🟩
    <div class="pop_title" tabindex="0">범례</div> 🟦🟦🟦🟦범례 대 제목🟦
    <div class="pop_stitle" tabindex="0">누수예상지점</div> 🟥범례 소 제목
    <div class="pop_legend_cont"> 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥 범례소항목 직전 영역
        <ul class="water_leak"> 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥 (상동)
            <li tabindex="0">누수센서</li> 🟧🟧🟧🟧🟧🟧🟧 각 범례 소항목 li
            <li tabindex="0">AI모델</li>  🟧🟧🟧🟧🟧🟧🟧 (상동)
        </ul>🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥 범례소항목 영역 닫기
    </div>🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥 (상동)
    <a class="pop_leg_close" href="javascript:pop_close('pop_legend');">X</a> ⬛ 닫기버턴
</div>  🟩🟩🟩🟩
*/