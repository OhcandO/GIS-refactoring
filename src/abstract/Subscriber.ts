import { MOPublisher } from './Publisher';

/**
 * MObject 들은 Subject(퍼블리셔) 의 구독자 역할
 * 구독자가 퍼블리셔를 등록할 수 있고 vice versa.
 * @author jhoh
 * */
export abstract class MOSubscriber {
    /** 고유 식별자 */
    #observerId: symbol;

    /** 인지가능한 Subscriber 이름 */
    NAME: string;

    #PUBLISHER_Obj: Record<string, MOPublisher> = {};

    /**
     * Creates an instance of MOSubscriber.
     * @param NAME
     * @memberof MOSubscriber
     */
    constructor(NAME?: string) {
        this.#observerId = Symbol();
        NAME ? (this.NAME = NAME) : (this.NAME = `MOSubscriber_${new Date().getTime()}`);
    }

//--------접근가능한 메서드--------

    /** 이 Subscriber의 고유 식별자 반환
     * @readonly
     * @returns 고유 Symbol */
    get id(): symbol {
        return this.#observerId;
    }

    /**
     * 향후 Subject 에서 이 Observer 를 제거하는데 활용하기 위해 Subject 객체정보를 단순저장
     * @param moPublisher 옵저버패턴의 Subject 역할하는 애
     */
    regist(moPublisher: MOPublisher): void {
        if (!this.isPublisherHere(moPublisher)) {
            this.#addPublisher(moPublisher);
            if (!moPublisher.isSubscriberHere(this)) moPublisher.regist(this);
        } else {
            // console.log(`퍼블리셔 이미 등록됨`);
        }
    }

    /**
     * 이 Observer 객체를 해당 Subject 에서 제외하라
     * @param moPublisher Subject 객체 또는 이름
     */
    unregist(moPublisher: string | MOPublisher): void {
        if (this.isPublisherHere(moPublisher)) {
            if (moPublisher instanceof MOPublisher) {
                delete this.#PUBLISHER_Obj[moPublisher.NAME];
                moPublisher.unregist(this);
            } else if (typeof moPublisher === 'string') {
                this.unregist(this.#PUBLISHER_Obj[moPublisher]);
            }
            this.showSubjectList();
        } else {
            // console.log(`퍼블리셔 등록 안되어 있음`);
        }
    }

    /**
     * 이 Observer 객체가 등록된 Subject 리스트 출력
     */
    showSubjectList(): void {
        console.group(`${this.NAME} 이 등록된 Publisher 리스트`);
        console.table(this.#PUBLISHER_Obj);
        console.groupEnd();
    }

    /**
     * 심볼 식별자로 기 등록된 MOPublisher 반환
     * @param publisherID MOPublisher 객체를 찾기위한 식별자
     * @returns MOPublisher
     */
    getPublisher(publisherID: symbol): MOPublisher | undefined {
        return Object.values(this.#PUBLISHER_Obj).find(subs => subs.id === publisherID);
    }

//--------Abstract methods--------
    /**
     *  (추상메서드): implementation required
     *
     * @param SubjectId - Subject 들의 고유 ID 들어감
     * @abstract
     * @memberof MObserver
     */
    abstract update(SubjectId: symbol): void;

//--------Private methods--------
    #addPublisher(moPublisher: MOPublisher): void {
        if (moPublisher instanceof MOPublisher) {
            this.#PUBLISHER_Obj[moPublisher.NAME] = moPublisher;
        }
    }

    /**
     * 입력된 퍼블리셔가 구독자 내부에 저장되어 있는지
     * @param moPublisher
     */
    isPublisherHere(moPublisher: string | MOPublisher): boolean {
        let bool = false;
        if (moPublisher instanceof MOPublisher) {
            //1. moPublisher 가 MOSujbect 객체일 경우, 존재 체크
            bool = Object.values(this.#PUBLISHER_Obj).some(subs => subs.id === moPublisher.id);
            // console.log('moPublisher 가 적합');
        } else if (typeof moPublisher === 'string') {
            //2. moPublisher 가 문자열일 경우, moPublisher 객체 NAME 필드로 체크
            bool = this.isPublisherHere(this.#PUBLISHER_Obj[moPublisher]);
        }
        return bool;
    }
}
