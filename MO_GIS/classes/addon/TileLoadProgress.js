
export class TileLoadProgress {

    DOMElement
    loading=0;
    loaded=0;
    
    constructor(el) {
        if(el instanceof Element){
            this.DOMElement = el;
        }else{
            console.log(el);
            throw new Error (`적합한 DOM 요소가 아님`)
        }
    }
    /**
       * Increment the count of loading tiles.
       */
    addLoading() {
        ++this.loading;
        this.update();
    }
    /**
       * Increment the count of loaded tiles.
       */
    addLoaded() {
        ++this.loaded;
        this.update();
    }
    /**
       * Update the progress bar.
       */
    update() {
        const width = ((this.loaded / this.loading) * 100).toFixed(1) + '%';
        this.DOMElement.style.width = width;
    }
    /**
       * Show the progress bar.
       */
    show() {
        this.DOMElement.style.visibility = 'visible';
    }
    /**
       * Hide the progress bar.
       */
    hide() {
        const style = this.DOMElement.style;
        setTimeout(function () {
            style.visibility = 'hidden';
            style.width = 0;
        }, 250);
    }
}
