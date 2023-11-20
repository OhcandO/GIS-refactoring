import { MOSubscriber } from "../abstract/MO.Subscriber.js";
import * as KEY from '../../common/MO.keyMap.js';


/**
 * 지도 위 범례 정보를 수집하고 
 * 표현하는 객체
 * Subscriber 로서 
 *
 * @class MOLegend
 * @extends {MOSubscriber}
 */
export class MOLegend extends MOSubscriber {
    
    /** 범례가 들어갈 DIV 요소
     * @type {Element} 
     */
    #target_Element;

    /**
     * 범례에 들어갈 요소들 코드 객체
     * @type {Array}
     */
    contentArray=[];

    /** 레이어 목적 별 그룹 자체의 우선순위 (MO.KeyMap.js) 
     * e.g. ={base:4, leak: 2, pipenet:1,...}
     * @type {object} 
    */
    categoryOrder;

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
        let bigGroup = this.categoryOrder[a[KEY.LAYER_PURPOSE_CATEGORY_KEY]] - this.categoryOrder[b[KEY.LAYER_PURPOSE_CATEGORY_KEY]]
        let smallGroup = a.layerCode[KEY.LAYER_ORDER] - b.layerCode[KEY.LAYER_ORDER];
        return bigGroup*100 + smallGroup;
    }
    /**
     * 
     * @param {string} div_id - 범례가 들어갈 DIV 의 ID
     */
    constructor(div_id='mapLegend'){
        super(div_id);
        this.#target_Element=document.getElementById(div_id);
        if(!(this.#target_Element instanceof Element)){
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

    //◼◼◼◼범례 표시◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼
    publishLegendObj(){
        console.log(this.contentArray)
    }

}