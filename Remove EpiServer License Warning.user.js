// ==UserScript==
// @name         Remove EpiServer License Warning
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://dev.kicks.se/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=kicks.se
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Hämta alla element med style-attribut
    var elementsWithStyle = document.querySelectorAll('div[style]');

    elementsWithStyle.forEach(function (element) {
        var computedStyle = getComputedStyle(element);

        if (computedStyle.zIndex === '30000' 
            && computedStyle.position === 'absolute'
            && element.innerHTML.includes('There is a license error on this site')) {
            element.remove();
            console.log('EpiServer License Warning was removed');
            return;
        }
    });
})();