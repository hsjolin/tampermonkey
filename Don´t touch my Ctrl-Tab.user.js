// ==UserScript==
// @name         Don´t touch my Ctrl-Tab
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        *://*/EPiServer/Cms/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=skincity.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const elements = document.querySelectorAll("div[data-dojo-attach-event='onkeypress:onkeypress']");
    if (!elements) {
        return;
    }

    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        addEventListener(element, 'keydown', e => {console.log('evt'); return false;}, true);
        // removeEventListener(element, 'keydown');
    }
})();