// ==UserScript==
// @name         Extended features for Jira
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        *://*.atlassian.net/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=atlassian.net
// @grant        none
// ==/UserScript==
const scriptName = 'Extended features for Jira'

const sites = [
    { str: 'bytskruv', name: 'skruvat' },
    { str: 'kicks', name: 'kicks' }
];

const site = () => {
    const url = document.URL;
    console.log(url);
    for (let i = 0; i < sites.length; i++) {
        if(url.includes(sites[i].str)) {
            return sites[i].name;
        }
    }

    return 'unknown';
};

function initializeButtons() {
    function createButton(title, name, onClick) {
        let button = document.createElement('button');
        const clickEventFunction = function (e) {
            e.target.textContent = 'Done 😎👍';
            setTimeout(function() {
                e.target.textContent = title;
            }, 2000);

            onClick();
        };

        const existingButton = document.querySelector(`[data-extended-feature-button="${name}"]`)
        if (existingButton) {
            existingButton.removeEventListener('click', existingButton.clickEventFunction);
            existingButton.addEventListener('click', clickEventFunction);
            existingButton.clickEventFunction = clickEventFunction;
            return existingButton;
        }

        button.textContent = title;
        button.addEventListener('click', clickEventFunction);

        button.style.margin = '10px';
        button.style.borderWidth = '0px';
        button.style.borderRadius = '3px';
        button.style.height = '2.28571em';
        button.style.lineHeight = '2.28571em';
        button.style.color = '#1D2125';
        button.style.hoverBackgrundColor= '#85B8FF'
        button.style.cursor = 'pointer';
        button.style.backgroundColor = '#579DFF';
        button.style.fontWeight = '500';
        button.style.padding = '0px 10px';
        button.style.textAlign = 'center';
        button.style.textDecoration = 'none';
        button.style.width = '150px';
        button.setAttribute('data-extended-feature-button', name);
        button.clickEventFunction = clickEventFunction;

        return button;
    }

    function removeButton(name) {
        const existingButton = document.querySelector(`[data-extended-feature-button="${name}"]`);
        if (existingButton) {
            existingButton.remove();
        }
    }

    function removeAllButtons() {
        const existingButtons = document.querySelectorAll(`[data-extended-feature-button]`);
        existingButtons.forEach(button => {
            button.remove();
        });
    }

    const buttonContainer = document.getElementById('ak-main-content');
    if (!buttonContainer) {
        console.log(`${scriptName}: Button container not found`);
        removeAllButtons();
        resume();
        return;
    }

    const title = document.querySelector('title').innerHTML;
    if (!title) {
        console.log(`${scriptName}: Title not found`);
        removeAllButtons();
        resume();
        return;
    }

    const matches = title.match(/^\[([A-Z]+-\d+)\]\s(.+)\s- Jira$/);
    if (matches.length != 3) {
        console.log(`${scriptName}: Could not parse title: ${title}`);
        removeAllButtons();
        resume();
        return;
    }

    const heading = matches[2];
    const ticketId = matches[1];

    const ticketTypeElement = document.querySelector('[data-testid="issue.views.issue-base.foundation.change-issue-type.button"]');
    const ticketTypeName = ticketTypeElement
        ? ticketTypeElement.getAttribute('aria-label').includes('Bug') ? 'bugfix' : 'feature'
        : 'bugfix';


    function copyTicketId() {
        buttonContainer.insertBefore(createButton('Copy ticket id', 'ticket-id', function() {
            navigator.clipboard.writeText(ticketId);
        }), buttonContainer.firstChild);
    }

    function copyPrTitle() {
        buttonContainer.insertBefore(createButton('Copy PR title', 'pr-title', function() {
            switch(site()) {
                case 'skruvat':
                    navigator.clipboard.writeText(`${ticketTypeName === 'bugfix' ? 'fix' : 'feat'}: ${ticketId} ${heading}`);
                    break;
                case 'kicks':
                default:
                    navigator.clipboard.writeText(`${ticketId}: ${heading}`);
                    break;
            }

        }), buttonContainer.firstChild);
    }

    function copyBranchName() {
        buttonContainer.insertBefore(createButton('Copy branch name', 'branch-name', function() {
            const ticketIdName = ticketId;
            const ticketDescription = heading
                .toLowerCase()
                .replace(/([\s\-]+)/g, "-")
                .replace(/[^a-z\-0-9]+/g, "");
            navigator.clipboard.writeText(`${ticketTypeName}/${ticketIdName}-${ticketDescription}`);
        }), buttonContainer.firstChild);
    }

    function openPrButton() {
        const anchorElements = document.querySelectorAll('a[href]');
        let found = false;
        for(var index = 0; index < anchorElements.length; index++) {
            const elem = anchorElements[index];
            const href = elem.getAttribute("href");
            if(href && href.includes("https://github.com/avensia/kicks/pull")) {
                buttonContainer.insertBefore(createButton('Goto pull request', 'goto-pull-request', function() {
                    window.open(href, "_blank");
                }), buttonContainer.firstChild);
                found = true;
                break;
            }
        }

        if (!found) {
            removeButton('goto-pull-request');
        }
    }

    if (buttonContainer && heading && ticketId) {
        copyTicketId();
        copyBranchName();
        copyPrTitle();
    } else {
        removeAllButtons();
    }

    if (buttonContainer) {
        openPrButton();
    }

    resume();
}

function resume() {
    setTimeout(initializeButtons, 2000);
}

(function() {
    'use strict';
    resume();
})();
