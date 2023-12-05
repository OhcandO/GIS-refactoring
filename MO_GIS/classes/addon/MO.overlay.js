/**
 * @module ol/Overlay
*/
import Overlay from '../../../lib/openlayers_v7.5.1/Overlay.js';

/**
 * 드래그 하여 overlay anchor 를 재 배치하고, 원래 자리로 돌아올 수 있게 만드는
 * ol.Overlay 확장 클래스
 * @author jhoh
 */
export class MOOverlay extends Overlay {
    coordOrigin;
    dragstart={};
    dragend={};
    startPixel;
    endPixel;
    overId;
    /**
     * 
     * @param {import('../../../lib/openlayers_v7.5.1/Overlay.js').Options} obj 
     */
    constructor(obj) {
        super(obj);
        this.overId = new Date().getTime();
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
        if (!this.coordOrigin) this.coordOrigin = this.getPosition();
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
        this.dragstart[e.id] = e;
        this.startPixel = [e.clientX, e.clientY];
    }

    /**
     * 드래그가 끝나면 드래그 마지막 위치의 clientX,Y 좌표를 저장
     * @param {DragEvent} e 
     */
    #saveArrival = e => {
        this.dragend[e.id] = e;
        this.endPixel = [e.clientX, e.clientY];
    }
    
    /**
     * 
     * @param {PointerEvent} e 
     */
    #removeArrival = e=> {
        delete this.dragend[e.id];
        this.endPixel = [];
    }
    
    /**
     * 
     * @param {DragEvent} e 
     */
    #moveOverlay = e => {
        const dif = [this.endPixel[0] - this.startPixel[0], this.endPixel[1] - this.startPixel[1]];
        const originOverlayPixel = this.getMap().getPixelFromCoordinate(this.getPosition());
        this.setPosition(this.getMap().getCoordinateFromPixel([originOverlayPixel[0] + dif[0], originOverlayPixel[1] + dif[1]]));
    }
    
    #createResetBtn = e => {
        this.element.insertAdjacentHTML(`beforeend`,
                                               `<div id='ol-overlay-reset${this.overId}' style='position: absolute;top: 0px;right: 0px;
                                                    font-size: 12px;cursor: pointer;background-color: navy;color: white;padding: 2px;
                                                   border-radius: 6px;'>[RESET]<div>`);

        document.querySelector(`#ol-overlay-reset${this.overId}`).addEventListener('click', e=> {
            e.preventDefault();
            e.stopPropagation();
            this.setPosition(this.coordOrigin);
            e.target.remove();
            this.#removeArrival(e);
        });
    }
    
}