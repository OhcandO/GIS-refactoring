import { MOPublisher } from "./MO.Publisher.js";

/**
 * MObject 들은 Subject(퍼블리셔) 의 구독자 역할
 * 구독자가 퍼블리셔를 등록할 수 있고 vice versa.
 * @author jhoh
 * */
export class MOSubscriber {
    /** 고유 식별자
     *  @type {Symbol}*/
    #observerId; 

    /** 인지가능한 Subscriber 이름
     * @type {string}*/
    NAME

    #PUBLISHER_Obj = {}


    /**
     * Creates an instance of MOSubscriber.
     * @param {string} NAME
     * @memberof MOSubscriber
     */
    constructor(NAME) {
        this.#observerId = Symbol();
        NAME?(this.NAME=NAME):(this.NAME=`MOSubscriber_${new Date().getTime()}`)
    }

//⬜⬜⬜접근가능한 메서드⬜⬜⬜⬜⬜⬜⬜⬜⬜

    /** 이 Subscriber의 고유 식별자 반환
     * @readonly
     * @returns {Symbol} */
    get id() {
        return this.#observerId;
    }

    /**
     * 향후 Subject 에서 이 Observer 를 제거하는데 활용하기 위해 Subject 객체정보를 단순저장
     * @param {MOPublisher} moPublisher 옵저버패턴의 Subject 역할하는 애
     */
    regist(moPublisher) {
        if (!this.isPublisherHere(moPublisher)){
            this.#addPublisher(moPublisher);
            if(!moPublisher.isSubscriberHere(this)) moPublisher.regist(this);
        } else{
            // console.log(`퍼블리셔 이미 등록됨`);
        }
    }

     /**
     * 이 Observer 객체를 해당 Subject 에서 제외하라
     * @param {String|MOPublisher} moPublisher Subject 객체 또는 이름
     */
     unregist(moPublisher) {
        if (this.isPublisherHere(moPublisher)) {
            if (moPublisher instanceof MOPublisher) {
                delete this.#PUBLISHER_Obj[moPublisher.NAME];
                moPublisher.unregist(this);
            } else if (typeof moPublisher == "string") {
                this.unregistSubject(this.#PUBLISHER_Obj[moPublisher]);
            }
            this.showSubjectList();
        } else {
            // console.log(`퍼블리셔 등록 안되어 있음`);
        }
    }

    /**
     * 이 Observer 객체가 등록된 Subject 리스트 출력
     */
    showSubjectList() {
        console.group(`${this.NAME} 이 등록된 Publisher 리스트`);
        console.table(this.#PUBLISHER_Obj);
        console.groupEnd();
    }

    /**
     * 심볼 식별자로 기 등록된 MOPublisher 반환
     * @param {Symbol} publisherID MOPublisher 객체를 찾기위한 식별자
     * @returns {MOPublisher}
     */
    getPublisher(publisherID){
        return Object.values(this.#PUBLISHER_Obj).find(subs=>subs.id===publisherID);
    }

//⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜

//🟨🟨🟨Absract methods🟨🟨🟨🟨🟨🟨🟨🟨🟨
    /**
     *  (추상메서드): implementation required
     *
     * @param {Symbol} SubjectId - Subject 들의 고유 ID 들어감
     * @abstract
     * @memberof MObserver
     */
    update(SubjectId) {
        throw new Error("Method 'update()' must be implemented.");
    }

//🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨

//⬛⬛⬛⬛🚫 Private methods⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
    #addPublisher(moPublisher){
        if(moPublisher instanceof MOPublisher){
            this.#PUBLISHER_Obj[moPublisher.NAME] = moPublisher;
        }
    }
   
    /**
     * 입력된 퍼블리셔가 구독자 내부에 저장되어 있는지
     * @param {MOPublisher | String} moPublisher
     */
    isPublisherHere(moPublisher) {
        let bool = false;
        if (moPublisher instanceof MOPublisher) {
            //1. moPublisher 가 MOSujbect 객체일 경우, 존재 체크
            bool = Object.values(this.#PUBLISHER_Obj).some(subs => subs.id == moPublisher.id);
            // console.log('moPublisher 가 적합');
        } else if (typeof moPublisher == "string") {
            //2. moPublisher 가 문자열일 경우, moPublisher 객체 NAME 필드로 체크
            bool = this.isPublisherHere(this.#PUBLISHER_Obj[moPublisher]);
        }
        return bool;
    }

    
}


