/**
 *
 * ol.source 와 연동되어, 로딩됨/로딩중 비율을 viewport 밑에 표현하기 위한 객체
 * @export
 * @class TileLoadProgress
 * 출처 : https://openlayers.org/en/latest/examples/tile-load-events.html
 */
export class TileLoadProgress {

    DOMElement: HTMLElement;
    loading: number = 0;
    loaded: number = 0;

    constructor(el: Element) {
        if (el instanceof Element) {
            this.DOMElement = el as HTMLElement;
        } else {
            console.log(el);
            throw new Error(`적합한 DOM 요소가 아님`);
        }
    }

    /**
     * Increment the count of loading tiles.
     */
    addLoading(): void {
        ++this.loading;
        this.update();
    }

    /**
     * Increment the count of loaded tiles.
     */
    addLoaded(): void {
        ++this.loaded;
        this.update();
    }

    /**
     * Update the progress bar.
     */
    update(): void {
        const width = ((this.loaded / this.loading) * 100).toFixed(1) + '%';
        this.DOMElement.style.width = width;
    }

    /**
     * Show the progress bar.
     */
    show(): void {
        this.DOMElement.style.visibility = 'visible';
    }

    /**
     * Hide the progress bar.
     */
    hide(): void {
        const style = this.DOMElement.style;
        setTimeout(function () {
            style.visibility = 'hidden';
            style.width = '0';
        }, 250);
    }
}
