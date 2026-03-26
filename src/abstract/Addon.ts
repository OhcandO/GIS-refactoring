/**
 * Addon 기능 클래스들의 추상 기반 클래스.
 * 라이프사이클 메서드를 정의하며, 하위 클래스에서 구현해야 함.
 *
 * @abstract
 * @author jhoh
 */
export abstract class MOAddon {

    /**
     * Addon 초기화 라이프사이클
     * @abstract
     */
    abstract init(): void;

    /**
     * Addon 활성화
     * @abstract
     */
    abstract enable(): void;

    /**
     * Addon 비활성화
     * @abstract
     */
    abstract disable(): void;

    /**
     * Addon 파괴(정리) 라이프사이클
     * @abstract
     */
    abstract destroy(): void;
}
