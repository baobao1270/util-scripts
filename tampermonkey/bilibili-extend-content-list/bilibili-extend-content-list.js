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
        const HEIGHT = "500px";
        if (!document.querySelector(".video-sections-content-list")) return;
        document.querySelector(".video-sections-content-list").style.height = HEIGHT;
        document.querySelector(".video-sections-content-list").style.maxHeight = HEIGHT;
    });
    observe.observe(document, { childList: true, subtree: true });
})();

