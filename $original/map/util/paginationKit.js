/** gis 페이지에서 검색결과 출력시 페이징 처리하는 모듈
	[사용 대상] gisSearch.js 시설물 결과 출력 || searchAdress.js 주소검색 결과 출력
	[사용 방법] 초기화(객체생성) -> 결과꾸미기 정의 -> (목적지 요소 삭제) -> 결과물 붙이기
	
	let paging = new paginationKit({}, featuresArr);
	
	paging.setDecorateAResult(function(featuresArr) {
		let htmlStr='';
		featuresArr.forEach((feature) => {
			htmlStr += "<li>";
			htmlStr += "<a href='javascript:void(0)' onclick='gisSearch.dispatch_Select(\"" +feature.getId() +"\", this);'>";
			htmlStr += "<span class='zip' >" + feature.get('FTR_IDN') + "</span>";
			//...(중략)...			
		});
		return htmlStr;
	});
	
	paging.clearTargetChild();
	
	paging.showMoreResult();
 */
    class paginationKit {
        /**출력하고자 하는 원본 배열 */
        sourceList=[];
        /**최종적으로 출력되는 배열 */
        resultList=[];
        /**총 페이지 수 : (자동계산)총 아이템 갯수와 페이지당 아이템 갯수로 계산 */
        totalPageCnt=0;
        /**현재 페이지 : (자동계산) */
        currentPageIdx=0;
        
        default={
            /**최종 출력 배열이 삽입될 HTML Element */
            targetElement: 'featureList',
            /**한 페이지에 보여줄 아이템 갯수 */
            itemCntPerPage: 20,
            /**다음-이전 페이지 그룹에서 보여줄 아이템 갯수 */
            pageCntperGroup: 10,
            /**더보기 버튼을 할당할  */
            btnIdForShowMore: 'showMoreFeatureResult'
        }
        
        constructor(defaultObj, sourceList) {
    
            Object.assign(this.default, defaultObj);
            if (sourceList instanceof Array) {
                this.sourceList = sourceList;
                this.totalPageCnt = Math.ceil(sourceList.length / this.default.itemCntPerPage);
                console.log('총 아이템 갯수 : ', sourceList.length, ' 총 페이지 수 : ', this.totalPageCnt);
    
            } else {
                console.error('페이지네이션 초기화 실패');
                return;
            }
        }
      
        /**
        원본 배열을 최종 배열로 변환하는 로직이 필요할 때 지정	
        return Array 
        */
        setResultList(callback) {
            this.resultList = callback(this.sourceList);
            this.totalPageCnt = Math.ceil(resultList.length / this.default.itemCntPerPage);
            console.log('(필터된)총 아이템 갯수 : ', resultList.length, ' 총 페이지 수 : ', this.totalPageCnt);
        }
        
        /**방식 1 '더보기' 버튼 눌러 다음 자료 반환 */
        showMoreResult() {
            let curPageIdx = this.currentPageIdx;
            let itemPerPage = this.default.itemCntPerPage;
            if (this.resultList.length == 0)
                this.resultList = this.sourceList;
            if (this.resultList.length > 0) {
                //더보기 버튼 삭제
                this.delShowResultBtn();
    
                //현재 페이지의 결과물 리스트
                let filteredResults = this.resultList.filter((el, idx) => 
                                         idx >= curPageIdx + curPageIdx * itemPerPage
                                        && idx < curPageIdx + (curPageIdx + 1) * itemPerPage); //인덱스는 0부터 maxlength-1 까지
                let htmlString = '';
                htmlString = this.decorateAResult(filteredResults);
                this.appendResults(htmlString);
                console.log('현재 페이지 : ', this.currentPageIdx + 1, '/', this.totalPageCnt);
                
                ++this.currentPageIdx;
                
                //마지막 페이지가 아니라면 더보기 버튼 생성
                if (this.currentPageIdx < this.totalPageCnt) {
                    this.addShowResultBtn();
                    let btn = document.getElementById(this.default.btnIdForShowMore);
                    btn.addEventListener('click',this.showMoreResult.bind(this));
                }
            }
        }
        /** (내부호출전용) 결과 항목을 꾸미는 역할 
            return HTML String (li tag)	
        */
        decorateAResult(resultList) {
            let htmlString ='';
            if(resultList instanceof Array){
                resultList.forEach(result=>{
                    htmlString += `<li>${result}</li>\n`
                })
            }
            return htmlString;
        }
        
        /** [필수](외부 작성 전용) 결과 항목을 꾸미는 방법 정의 
            return HTML String (li tag)
        */
        setDecorateAResult(callback) {
            if (callback instanceof Function)
                this.decorateAResult = callback;
        }
        
        
        appendResults(htmlString) {
            let target = document.getElementById(this.default.targetElement);
            //beforebegin(앞에), afterbegin(맨앞 child),
            //beforeend(맨뒤 child), afterend(뒤에)
            target.insertAdjacentHTML('beforeend', htmlString);
        }
        addShowResultBtn() {
            let target = document.getElementById(this.default.targetElement);
            let btnId = this.default.btnIdForShowMore;
            target.insertAdjacentHTML('beforeend', 
                    `<button id="${btnId}" type="button" class="btn btn-primary btn-sm" style="text-indent: 0px;" >더보기</button>`);
        }
        delShowResultBtn() {
            let btn = document.getElementById(this.default.btnIdForShowMore);
            if (btn)
                btn.remove();
        }
        clearTargetChild() {
            let target = document.getElementById(this.default.targetElement);
            target.innerHTML = '';
        }
    }
    