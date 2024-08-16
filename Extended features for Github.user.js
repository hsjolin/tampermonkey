// ==UserScript==
// @name         Extended features for Github
// @namespace    http://tampermonkey.net/
// @version      2024-08-12
// @description  try to take over the world!
// @author       You
// @match        https://github.com/avensia/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    setInterval(() => {
        const comments = document.querySelectorAll('.comment-body h2');
        let ticketId = '';
        Array.from(document.querySelectorAll('.comment-body'))
            .forEach(element => {
                const match = element.innerHTML.match(/https:\/\/.+(SE-[0-9]+)/);
                if (match && match[1]) {
                    ticketId = match[1];
                }
            });
        
        for (let comment of Array.from(comments)) {
            const commentText = comment.innerHTML;
            comment.style.cursor = 'pointer';
            comment.onclick = () => {
                const content = `${ticketId}: \r\n${comment
                    .nextElementSibling
                    .innerHTML
                    .replace(/<[^>]*>/g, '')}`;
    
                if (content) {
                    navigator.clipboard.writeText(content);
                    comment.innerHTML += ' 👍';
                    setTimeout(() => {
                        comment.innerHTML = commentText;
                    }, 1000);
                }
            };
        }
        }, 1000);
})();