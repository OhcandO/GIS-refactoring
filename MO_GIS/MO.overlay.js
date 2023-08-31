class moov extends ol.Overlay {
    coordOrigin;
    dragstart;
    dragend;
    startPixel;
    endPixel;

    constructor(obj) {
        super(obj);

        console.log(this);
        this.element.addEventListener('pointerdown', e=> {
            //e.preventDefault();
            //e.stopPropagation();
            if (!this.coordOrigin) this.coordOrigin = this.getPosition();
            this.element.draggable = true;

        });

        this.element.addEventListener('pointerup', e => {
            this.element.draggable = false;
        });

        this.element.addEventListener('dragstart', e => {
            this.dragstart = e;
            this.startPixel = [e.clientX, e.clientY];
        });

        this.element.addEventListener('dragend', e => {
            this.dragend = e;
            this.endPixel = [e.clientX, e.clientY];
            const dif = [this.endPixel[0] - this.startPixel[0], this.endPixel[1] - this.startPixel[1]];

            const originOverlayPixel = this.getMap().getPixelFromCoordinate(this.getPosition());
            this.setPosition(this.getMap().getCoordinateFromPixel([originOverlayPixel[0] + dif[0], originOverlayPixel[1] + dif[1]]));

            this.element.insertAdjacentHTML(`beforeend`,
                `<div id='ol-overlay-reset_temp' style='position: absolute; top: 0px; right: 0px; cursor: move;'>📍📍<div>`);
        });

    }
}