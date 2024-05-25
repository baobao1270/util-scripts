// ==UserScript==
// @name         强制替换默认字体 | 微软雅黑版
// @description  BlinkMacSystemFont / -apple-system 替换为微软雅黑 | 需要本地安装微软雅黑 | 有的大厂前端是不是以为大家都有钱买Mac啊😅
// @version      1.1.2
// @license      WTFPL
// @author       Joseph Chris <joseph@josephcz.xyz>
// @namespace    https://github.com/baobao1270/util-scripts/blob/main/tampermonkey/replace-default-font#all-microsoft-yahei
// @homepageURL  https://github.com/baobao1270/util-scripts/blob/main/tampermonkey/replace-default-font
// @supportURL   mailto:tampermonkey-support@josephcz.xyz
// @compatible   firefox
// @compatible   safari
// @include      *
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    (function() {
        'use strict';
        GM_addStyle(`
            @font-face {
                font-family: '-apple-system';
                src: local('Microsoft YaHei');
            }
            @font-face {
                font-family: 'BlinkMacSystemFont';
                src: local('Microsoft YaHei');
            }
        `);
    })();
})();
