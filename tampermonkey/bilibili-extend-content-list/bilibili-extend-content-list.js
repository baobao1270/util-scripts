// ==UserScript==
// @name         B站合集列表增高
// @description  拉高播放页播放列表 | 兼容 Safari/Firefox/Chrome/Edge
// @version      1.1.0
// @license      WTFPL
// @author       Joseph Chris <joseph@josephcz.xyz>
// @icon         https://www.bilibili.com/favicon.ico
// @namespace    https://github.com/baobao1270/util-scripts/blob/main/tampermonkey/bilibili-extend-content-list
// @homepageURL  https://github.com/baobao1270/util-scripts/blob/main/tampermonkey/bilibili-extend-content-list
// @supportURL   mailto:tampermonkey-support@josephcz.xyz
// @compatible   firefox
// @compatible   safari
// @compatible   chrome
// @compatible   edge
// @match        https://www.bilibili.com/video/*
// @run-at       document-body
// @grant        none
// ==/UserScript==
    
(function() {
    'use strict';
    const observe = new MutationObserver((_mutationList, _observer) => {
        function updateElementHeightAndMaxHeight(selector, heightPixel) {
            const el = document.querySelector(selector);
            if (!el) return;
            el.style.height = `${heightPixel}px`;
            el.style.maxHeight = `${heightPixel}px`;
        }

        updateElementHeightAndMaxHeight(".video-sections-content-list", 500);
        updateElementHeightAndMaxHeight(".video-pod__body", 500);
    });
    observe.observe(document, { childList: true, subtree: true });
})();
