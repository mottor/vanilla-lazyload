import { getExtendedSettings } from "./lazyload.defaults";
import { autoInitialize } from "./lazyload.autoInitialize";
import { load } from "./lazyload.load";
import { setObserver, updateObserver } from "./lazyload.intersectionObserver";
import { isBot, runningOnBrowser, supportsIntersectionObserver } from "./lazyload.environment";
import { shouldUseNative, loadAllNative } from "./lazyload.native";
import { setOnlineCheck } from "./lazyload.online";
import { getElementsToLoad } from "./lazyload.dom";
import { resetElementStatus } from "./lazyload.reset";

const LazyLoad = function (customSettings, elements) {
    const settings = getExtendedSettings(customSettings);
    this._settings = settings;
    this.loadingCount = 0;
    setObserver(settings, this);
    setOnlineCheck(settings, this);
    this.update(elements);
};

LazyLoad.prototype = {
    update: function (givenNodeset) {
        const settings = this._settings;
        const elementsToLoad = getElementsToLoad(givenNodeset, settings);
        this.toLoadCount = elementsToLoad.length;

        if (isBot || !supportsIntersectionObserver) {
            this.loadAll(elementsToLoad);
            return;
        }
        if (shouldUseNative(settings)) {
            loadAllNative(elementsToLoad, settings, this);
            return;
        }

        updateObserver(this._observer, elementsToLoad);
    },

    destroy: function () {
        // Observer
        if (this._observer) {
            this._observer.disconnect();
        }
        delete this._observer;
        delete this._settings;
        delete this.loadingCount;
        delete this.toLoadCount;
    },

    loadAll: function (elements) {
        const settings = this._settings;
        const elementsToLoad = getElementsToLoad(elements, settings);
        elementsToLoad.forEach((element) => {
            load(element, settings, this);
        });
    },

    resetElementStatus: function (element) {
        resetElementStatus(element, this);
    }
};

LazyLoad.load = (element, customSettings) => {
    const settings = getExtendedSettings(customSettings);
    load(element, settings);
};

// Automatic instances creation if required (useful for async script loading)
if (runningOnBrowser) {
    autoInitialize(LazyLoad, window.lazyLoadOptions);
}

export default LazyLoad;
