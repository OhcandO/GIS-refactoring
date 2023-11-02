/**
 * 드래그 하여 overlay anchor 를 재 배치하고, 원래 자리로 돌아올 수 있게 만드는
 * ol.Overlay 확장 클래스
 */
/**
 * @module ol/Overlay
 */
import {Overlay} from '../lib/openlayers_v7.5.1/Overlay'

class MOOverlay extends Overlay {
    coordOrigin;
    dragstart;
    dragend;
    startPixel;
    endPixel;

    constructor(obj) {
        super(obj);

        this.element.addEventListener('pointerdown', this.#registDragging);
        this.element.addEventListener('pointerup', this.#unregistDragging);
        this.element.addEventListener('dragstart', this.#saveDeparture);
        this.element.addEventListener('dragend', e => {
            if(!this.dragend[e.id]) this.#createResetBtn(e);
            this.#saveArrival(e);
            this.#moveOverlay(e);
        });

    }

    /**
     * (처음 오버레이 element를 포인터로 누르게 될 때)
     * 초기 위치를 저장하고 draggable 활성화
     * @param {PointerEvent} e 포인터 이벤트 객체
     */
    #registDragging = e => {
        if (!coordOrigin) coordOrigin = this.getPosition();
        this.element.draggable = true;
    }

    /**
     * draggable 비활성화
     * @param {PointerEvent} e 포인터 이벤트 객체
     */
    #unregistDragging = e => {
        this.element.draggable = false;
    }

    /**
     * 드래그가 시작되면 드래그 초기 위치의 clientX, Y 좌표를 저장
     * @param {DragEvent} e 
     */
    #saveDeparture = e => {
        dragstart[e.id] = e;
        startPixel = [e.clientX, e.clientY];
    }

    /**
     * 드래그가 끝나면 드래그 마지막 위치의 clientX,Y 좌표를 저장
     * @param {DragEvent} e 
     */
    #saveArrival = e => {
        dragend[e.id] = e;
        endPixel = [e.clientX, e.clientY];
    }
    
    /**
     * 
     * @param {PointerEvent} e 
     */
    #removeArrival = e=> {
        delete dragend[e.id];
        endPixel = [];
    }
    
    /**
     * 
     * @param {DragEvent} e 
     */
    #moveOverlay = e => {
        const dif = [endPixel[0] - startPixel[0], endPixel[1] - startPixel[1]];
        const originOverlayPixel = this.getMap().getPixelFromCoordinate(this.getPosition());
        this.setPosition(this.getMap().getCoordinateFromPixel([originOverlayPixel[0] + dif[0], originOverlayPixel[1] + dif[1]]));
    }
    
    #createResetBtn = e => {
        this.element.insertAdjacentHTML(`beforeend`,
                                               `<div id='ol-overlay-reset${idx}' style='position: absolute;top: 0px;right: 0px;
                                                    font-size: 12px;cursor: pointer;background-color: navy;color: white;padding: 2px;
                                                   border-radius: 6px;'>[RESET]<div>`);

        document.querySelector(`#ol-overlay-reset${idx}`).addEventListener('click', e=> {
            e.preventDefault();
            e.stopPropagation();
            this.setPosition(coordOrigin);
            e.target.remove();
            this.#removeArrival(e);
        });
    }
    
}