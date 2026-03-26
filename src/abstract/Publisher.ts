import { MOSubscriber } from './Subscriber';

/**
 * MOPublisher 는 MOSubscriber 들을 등록하고
 * 등록된 구독자에게 알림을 보냄 (notify)
 *
 * @author jhoh
 */
export class MOPublisher {
    /** 고유 식별자 */
    #subjectId: symbol;
    /** 인지가능한 Publisher 이름 */
    NAME: string;
    /** 등록될 옵저버 객체의 name 이 key로, 옵저버 객체가 value 로 등록 */
    #observerListObj: Record<string, MOSubscriber[]> = {
        DEFAULT: [],
    };

    /**
     * Creates an instance of MOSubject.
     * @param name 이 퍼블리셔의 이름
     */
    constructor(name?: string) {
        this.#subjectId = Symbol();
        name ? (this.NAME = name) : (this.NAME = `MOPublisher_${new Date().getTime()}`);
    }

    //--------접근가능한 메서드--------

    /**
     * 이 Publisher 객체의 고유 식별자 반환
     * @returns symbol
     * @readonly
     * @memberof MOPublisher
     */
    get id(): symbol {
        return this.#subjectId;
    }

    /**
     * 옵저버 객체 등록
     * @param subscriber - 옵저버 객체
     * @param groupName - 그룹이름
     */
    regist(subscriber: MOSubscriber, groupName: string = 'DEFAULT'): void {
        if (!this.isSubscriberHere(subscriber)) {
            this.#push2ObsList(subscriber, groupName);
            if (!subscriber.isPublisherHere(this)) subscriber.regist(this);
//            console.log(`신규 옵저버 구독시작 : ${subscriber.NAME}`);
        } else {
            // console.log(`옵저버 이미 등록됨`);
        }
    }

    /**
     * 옵저버를 구독자 리스트에서 제거
     * @param subscriber
     */
    unregist(subscriber: MOSubscriber): void {
        if (subscriber instanceof MOSubscriber) {
            if (this.isSubscriberHere(subscriber)) {
                subscriber.unregist(this);
                this.#filterExceptThis(subscriber);
                console.log(`옵저버 구독해제`);
            } else {
                // console.log(`등록된 옵저버 아니라 지우지 않음 @deleteObserver `,observer);
            }
        }
    }

    /**
     * 이 Observer 객체가 등록된 Subject 리스트 출력
     */
    showSubscribersList(): void {
        console.group(`${this.NAME} 의 Subscriber 리스트`);
        console.table(this.#observerListObj);
        console.groupEnd();
        //return this.#observerObj;
    }

    /**
     * 이 Publisher에 등록된 Subscriber 들에게 알림 보냄
     * @returns promise chaining
     */
    notify(groupName: string = 'DEFAULT'): Promise<string> {
        let tempObsArr: MOSubscriber[];
        try {
            tempObsArr = this.#getSubscriberList(groupName);
            tempObsArr.forEach((obsrv) => obsrv.update(this.id));
            return Promise.resolve(`알람수행`);
        } catch (noObsError) {
            return Promise.reject(noObsError);
        }
    }

//--------Abstract method--------
    /**
     * (추상 GET 메서드)
     * @abstract
     * @memberof MOSubject
     */
    get PublisherData(): any[] {
        throw new Error(`implement required`);
    }

//--------Private methods--------
    #push2ObsList(subscriber: MOSubscriber, groupName?: string): void {
        if (groupName) {
            if (!(this.#observerListObj[groupName] instanceof Array))
                this.#observerListObj[groupName] = [];
            if (!this.isSubscriberHere(subscriber))
                this.#observerListObj[groupName].push(subscriber);
        } else {
            this.#observerListObj['DEFAULT'].push(subscriber);
        }
    }

    #filterExceptThis(observer: MOSubscriber): void {
        if (this.isSubscriberHere(observer)) {
            this.#observerListObj = Object.fromEntries(
                Object.entries(this.#observerListObj).map(([k, v]) => [
                    k,
                    v.filter((el) => el.id !== observer.id),
                ])
            );
        }
    }

    /**
     * Observer 객체 여기 있나요?
     * @param subscriber 존재여부 판단할 Observer 객체
     * @returns Subject 객체에 해당 Observer 가 등록되어 있는지 여부
     */
    isSubscriberHere(subscriber: MOSubscriber): boolean {
        let bool = false;
        if (subscriber instanceof MOSubscriber) {
            bool = this.#getSubscriberList().some((el) => el.id === subscriber.id);
        }
        return bool;
    }

    /**
     * 이 Subject에 등록된 모든 MObserver 배열 반환
     * @returns MOSubscriber 배열
     */
    #getSubscriberList(groupName?: string): MOSubscriber[] {
        const tempArr = groupName
            ? this.#observerListObj[groupName]
            : Object.values(this.#observerListObj['DEFAULT']);
        // if (tempArr instanceof Array && tempArr.length > 0) {
            return [...new Set(tempArr.flat())]; //<-- 깊은 복사
        // } else {
        //     throw new Error(`조건에 맞는 MOobserver 없음 :${groupName}`);
        // }
    }
}
