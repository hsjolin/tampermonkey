// ==UserScript==
// @name         Order Management System links
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://mc.europe-west1.gcp.commercetools.com/nordicnest-stage/**
// @match        https://mc.europe-west1.gcp.commercetools.com/nordicnest-prod/**
// @icon         https://www.google.com/s2/favicons?sz=64&domain=nordicnest.se
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    setInterval(() => {
        const title = document.querySelector('h1[title]');
        if (!title) {
            return;
        }

        const match = title.innerHTML.match(/^Order ([A-Z0-9]+)$/);
        if (!match || match.length != 2) {
            return;
        }
        
        const prodEnvironment = document.URL.indexOf("/nordicnest-prod") > 0;
        const orderNumber = match[1];

        if (prodEnvironment) {
            title.innerHTML = `${title.innerHTML} <a href="https://mc.europe-west1.gcp.commercetools.com/nordicnest-prod/nordicnest-backoffice-prod/orders/${orderNumber}">~prod</a>`;
        } else {
            title.innerHTML = `${title.innerHTML} <a href="https://localhost:3001/nordicnest-stage/nordicnest-backoffice-test/orders/${orderNumber}" target="_blank">~dev</a>`;
            title.innerHTML = `${title.innerHTML} <a href="https://mc.europe-west1.gcp.commercetools.com/nordicnest-stage/nordicnest-backoffice-stage/orders/${orderNumber}">~stage</a>`;
        }
    }, 2000);

})();