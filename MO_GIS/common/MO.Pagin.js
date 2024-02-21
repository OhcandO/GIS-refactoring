/**
 * JSON 또는 배열 자료구조를 페이징 처리하고 꾸미고 배치하는 기능객체
 *
 * @export
 * @class MOPagin
 * @author jhoh
 */
export class MOPagin {
    /**출력하고자 하는 원본 배열 */
    sourceList = [];
    /**최종적으로 출력되는 배열 */
    resultList = [];
    /**총 페이지 수 : (자동계산)총 아이템 갯수와 페이지당 아이템 갯수로 계산 */
    #totalPageCnt = 0;
    /**현재 페이지 : (자동계산) */
    #currentPageIdx = 0;

    /** 페이징처리 기초정보 
     * @typedef {object} defaultss 
	 * @property {string} targetID 최종 출력 배열이 삽입될 HTML Element
	 * @property {number} [itemCntPerPage] 한 페이지에 보여줄 아이템 갯수
	 * @property {number} [pageCntperGroup] 다음-이전 페이지 그룹에서 보여줄 아이템 갯수
	 * @property {string} [btnId_forShowMore] 더보기 버튼을 할당할 아이디
	 * */
	
	/**@type {defaultss} */
    defaultss = {
        targetID: "featureList",
        itemCntPerPage: 20,
        pageCntperGroup: 10,
        btnId_forShowMore: "showMoreFeatureResult",
    };

    /**
     * 페이징처리용 자료관리 객체 생성
     * @param {defaultss} defaultObj 
     * @param {JSON} sourceList - 원본자료배열
     */
    constructor(defaultObj, sourceList) {
        Object.assign(this.defaultss, defaultObj);
        if (sourceList instanceof Array) {
            this.sourceList = sourceList;
            this.#totalPageCnt = Math.ceil(
                sourceList.length / this.defaultss.itemCntPerPage
            );
            console.log(
                "총 아이템 갯수 : ",
                sourceList.length,
                " 총 페이지 수 : ",
                this.#totalPageCnt
            );
        } else {
            console.error("페이지네이션 초기화 실패");
            return;
        }
    }

    /**
     * 배열을 인자로 받아 필터링하거나 또다른 배열을 만들어내는 함수 
     * @callback arrayFilterMapFunc
     * @param {Array}
     */
    /**
     * 원본 배열을 최종 배열로 변환하는 로직이 필요할 때 지정
     * @param {arrayFilterMapFunc} callback 
     */
    setResultList(callback) {
        this.resultList = callback(this.sourceList);
        this.#totalPageCnt = Math.ceil(
            resultList.length / this.defaultss.itemCntPerPage
        );
        console.log(
            "(필터된)총 아이템 갯수 : ",
            resultList.length,
            " 총 페이지 수 : ",
            this.#totalPageCnt
        );
    }

    /**
     * (더)보기 기능. 인스턴스 생성시 지정한 target 에
     * resultList 를 setDecorateAResult 한 방식으로
     * 갖다 붙임
     */
    showMoreResult() {
        let curPageIdx = this.#currentPageIdx;
        let itemPerPage = this.defaultss.itemCntPerPage;
        if (this.resultList.length == 0) this.resultList = this.sourceList;
        if (this.resultList.length > 0) {
            //더보기 버튼 삭제
            this.delShowResultBtn();

            //현재 페이지의 결과물 리스트
            let filteredResults = this.resultList.filter(
                (el, idx) =>
                    idx >= curPageIdx + curPageIdx * itemPerPage &&
                    idx < curPageIdx + (curPageIdx + 1) * itemPerPage
            ); //인덱스는 0부터 maxlength-1 까지
            let htmlString = "";

            filteredResults.forEach(temoObj=>{
                htmlString += this.decorateAResult(temoObj);
            });

            this.appendResults(htmlString);
            console.log(
                "현재 페이지 : ",
                this.#currentPageIdx + 1,
                "/",
                this.#totalPageCnt
            );

            ++this.#currentPageIdx;

            //마지막 페이지가 아니라면 더보기 버튼 생성
            if (this.#currentPageIdx < this.#totalPageCnt) {
                this.addShowResultBtn();
                let btn = document.getElementById(
                    this.defaultss.btnId_forShowMore
                );
                btn.addEventListener("click", this.showMoreResult.bind(this));
            }
        }
    }
    /** (내부호출전용) 결과 항목 하나를 꾸미는 기능
     * @param {object} tempObj 
     * @returns {string} htmlString
    */
    decorateAResult(tempObj) {
        let htmlString = '';
        if(typeof tempObj == 'object'){
            let result = Object.values(tempObj).join('|');
            htmlString = `<li>${result}</li>\n`;
        }else{
            console.log('객체가 아니어서 꾸밀 수 없음')
            console.log(tempObj)
        }
        return htmlString;
    }
    // /** (내부호출전용) 결과 항목 하나를 꾸미는 기능
    // */
    // decorateAResult(resultList) {
    //     let htmlString = "";
    //     if (resultList instanceof Array) {
    //         resultList.forEach((result) => {
    //             htmlString += `<li>${result}</li>\n`;
    //         });
    //     }
    //     return htmlString;
    // }

    /** 
     * 배열에 들어있는 개별 객체를 꾸며 htmlString 으로 구성하는 함수
     * @callback decorateAResult_func
     * @param {object} 꾸밀 대상이 되는 객체
     * @returns {string} htmlString
     */
    /** [필수](외부 작성 전용) 결과 항목을 꾸미는 방법 정의 
     * @param {decorateAResult_func} callback
    */
    setDecorateAResult(callback) {
        if (callback instanceof Function) this.decorateAResult = callback;
    }

    /**
     * MOPagin 객체가 바라보는 대상 영역에
     * 꾸며진 결과를 붙임
     * @param {string} htmlString 
     */
    appendResults(htmlString) {
        let target = document.getElementById(this.defaultss.targetID);
        //beforebegin(앞에), afterbegin(맨앞 child),
        //beforeend(맨뒤 child), afterend(뒤에)
        target.insertAdjacentHTML("beforeend", htmlString);
    }
    addShowResultBtn() {
        let target = document.getElementById(this.defaultss.targetID);
        let btnId = this.defaultss.btnId_forShowMore;
        target.insertAdjacentHTML(
            "beforeend",
            `<button id="${btnId}" type="button" class="btn btn-primary btn-sm" style="text-indent: 0px;" >더보기</button>`
        );
    }
    delShowResultBtn() {
        let btn = document.getElementById(this.defaultss.btnId_forShowMore);
        if (btn) btn.remove();
    }
    /**
     * MOPagin 객체가 바라보는 대상 영역의
     * childElement 들을 없앰 (Element.replaceChildren 방식)
     */
    clearTargetChild() {
        let target = document.getElementById(this.defaultss.targetID);
        target.replaceChildren();
    }
}
