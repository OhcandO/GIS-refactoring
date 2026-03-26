import Overlay from 'ol/Overlay';
import type { Options as OverlayOptions } from 'ol/Overlay';
import type { Coordinate } from 'ol/coordinate';
import type { Size } from 'ol/size';
import type { Pixel } from 'ol/pixel';
import type OlMap from 'ol/Map';

/**
 * Overlay 옵션 인터페이스 (ol/Overlay Options 재사용)
 */
export interface MOOverlayOptions extends OverlayOptions {}

/**
 * 드래그 하여 overlay anchor 를 재 배치하고, 원래 자리로 돌아올 수 있게 만드는
 * ol.Overlay 확장 클래스
 * @author jhoh
 */
export class MOOverlay extends Overlay {
    coordOrigin: Coordinate | undefined;
    dragstart: Record<string, DragEvent> = {};
    dragend: Record<string, DragEvent> = {};
    startPixel: number[] | undefined;
    endPixel: number[] | undefined;
    overId: number;

    // Internal rendered state used by OL Overlay
    declare rendered: { transform_: string; visible: boolean };

    /**
     * @param obj Overlay 옵션 객체
     */
    constructor(obj: MOOverlayOptions) {
        super(obj);
        this.overId = new Date().getTime();
        this.element!.addEventListener('pointerdown', this.#registDragging);
        this.element!.addEventListener('pointerup', this.#unregistDragging);
        this.element!.addEventListener('dragstart', this.#saveDeparture as EventListener);
        this.element!.addEventListener('dragend', ((e: DragEvent) => {
            if (!this.dragend[(e as any).id]) this.#createResetBtn(e);
            this.#saveArrival(e);
            this.#moveOverlay(e);
        }) as EventListener);
    }

    /**
     * (처음 오버레이 element를 포인터로 누르게 될 때)
     * 초기 위치를 저장하고 draggable 활성화
     * @param e 포인터 이벤트 객체
     */
    #registDragging = (e: PointerEvent): void => {
        if (!this.coordOrigin) this.coordOrigin = this.getPosition();
        this.element!.draggable = true;
    };

    /**
     * draggable 비활성화
     * @param e 포인터 이벤트 객체
     */
    #unregistDragging = (e: PointerEvent): void => {
        this.element!.draggable = false;
    };

    /**
     * 드래그가 시작되면 드래그 초기 위치의 clientX, Y 좌표를 저장
     * @param e DragEvent
     */
    #saveDeparture = (e: DragEvent): void => {
        this.dragstart[(e as any).id] = e;
        this.startPixel = [e.clientX, e.clientY];
    };

    /**
     * 드래그가 끝나면 드래그 마지막 위치의 clientX,Y 좌표를 저장
     * @param e DragEvent
     */
    #saveArrival = (e: DragEvent): void => {
        this.dragend[(e as any).id] = e;
        this.endPixel = [e.clientX, e.clientY];
    };

    /**
     * @param e PointerEvent
     */
    #removeArrival = (e: Event): void => {
        delete this.dragend[(e as any).id];
        this.endPixel = [];
    };

    /**
     * @param e DragEvent
     */
    #moveOverlay = (e: DragEvent): void => {
        const dif = [this.endPixel![0] - this.startPixel![0], this.endPixel![1] - this.startPixel![1]];
        const map = this.getMap() as OlMap;
        const originOverlayPixel = map.getPixelFromCoordinate(this.getPosition()!);
        this.setPosition(map.getCoordinateFromPixel([originOverlayPixel[0] + dif[0], originOverlayPixel[1] + dif[1]]));
    };

    #createResetBtn = (e: DragEvent): void => {
        this.element!.insertAdjacentHTML(`beforeend`,
            `<div id='ol-overlay-reset${this.overId}' style='position: absolute;top: 0px;right: 0px;
                font-size: 12px;cursor: pointer;background-color: navy;color: white;padding: 2px;
                border-radius: 6px;'>[RESET]<div>`);

        document.querySelector(`#ol-overlay-reset${this.overId}`)!.addEventListener('click', (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
            this.setPosition(this.coordOrigin);
            (e.target as HTMLElement).remove();
            this.#removeArrival(e);
        });
    };

    /**
     * overlay.js 의 위치 조정 메서드를 오버라이딩 해 오류 해결
     * @override
     */
    updateRenderedPosition(pixel: Pixel, mapSize: Size): void {
        const offset = this.getOffset();
        const positioning = this.getPositioning();

        this.setVisible(true);

        const x = Math.round(pixel[0] + offset[0]) + 'px';
        const y = Math.round(pixel[1] + offset[1]) + 'px';
        let posX = '0%';
        let posY = '0%';
        if (
            positioning == 'bottom-right' ||
            positioning == 'center-right' ||
            positioning == 'top-right'
        ) {
            posX = '-100%';
        } else if (
            positioning == 'bottom-center' ||
            positioning == 'center-center' ||
            positioning == 'top-center'
        ) {
            posX = '-50%';
        }
        if (
            positioning == 'bottom-left' ||
            positioning == 'bottom-center' ||
            positioning == 'bottom-right'
        ) {
            posY = '-100%';
        } else if (
            positioning == 'center-left' ||
            positioning == 'center-center' ||
            positioning == 'center-right'
        ) {
            posY = '-50%';
        }
        const transform = `translate(${posX}, ${posY}) translate(${x}, ${y})`;
        const transform_parnt = `translate(${x}, ${y})`;
        const transform_child = `translate(${posX}, ${posY})`;
        const parentEle = this.element!;
        const childEle = parentEle.children[0] as HTMLElement;
        if (this.rendered.transform_ != transform) {
            this.rendered.transform_ = transform;
            parentEle.style.transform = transform_parnt;
            childEle.style.transform = transform_child;
        }
    }
}
