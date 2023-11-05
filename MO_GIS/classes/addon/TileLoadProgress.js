
class TileLoadProgress {

    DOMElement
    loading=0;
    loaded=0;
    
    constructor(el) {
        if(el instanceof Element){
            this.DOMElement = el;
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
        this.el.style.width = width;
    }
    /**
       * Show the progress bar.
       */
    show() {
        this.el.style.visibility = 'visible';
    }
    /**
       * Hide the progress bar.
       */
    hide() {
        const style = this.el.style;
        setTimeout(function () {
            style.visibility = 'hidden';
            style.width = 0;
        }, 250);
    }
}
