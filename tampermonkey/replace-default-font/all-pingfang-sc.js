// ==UserScript==
// @name         强制替换默认字体 | 苹方版
// @description  微软雅黑替换为苹方简体 | 需要本地安装苹方字体 | 有的网站是不是以为世界上只有Windows用户啊😅
// @version      1.1.2
// @license      WTFPL
// @author       Joseph Chris <joseph@josephcz.xyz>
// @namespace    https://github.com/baobao1270/util-scripts/blob/main/tampermonkey/replace-default-font#all-pingfang-sc
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
                font-family: 'MicrosoftYaHei';
                src: local('PingFang SC');
            }
            @font-face {
                font-family: 'Microsoft YaHei';
                src: local('PingFang SC');
            }
            @font-face {
                font-family: 'Microsoft YaHei UI';
                src: local('PingFang SC');
            }
        `);
    })();
})();
