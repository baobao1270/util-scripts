// ==UserScript==
// @name         强制替换默认字体 | 自动版
// @description  根据系统自动切换 | Windows -apple-system 替换为微软雅黑 | macOS 微软雅黑替换为苹方简体 | 需要安装对应字体
// @version      1.1.2
// @license      WTFPL
// @author       Joseph Chris <joseph@josephcz.xyz>
// @namespace    https://github.com/baobao1270/util-scripts/blob/main/tampermonkey/replace-default-font#auto
// @homepageURL  https://github.com/baobao1270/util-scripts/blob/main/tampermonkey/replace-default-font
// @supportURL   mailto:tampermonkey-support@josephcz.xyz
// @compatible   firefox
// @compatible   safari
// @include      *
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';
    const platform = navigator.platform.toLocaleLowerCase();
    console.log("[自动使用系统字体] 当前平台", platform);

    if (platform.indexOf("win") >= 0) GM_addStyle(`
        @font-face {
            font-family: '-apple-system';
            src: local('Microsoft YaHei');
        }
        @font-face {
            font-family: 'BlinkMacSystemFont';
            src: local('Microsoft YaHei');
        }
    `);

    if (platform.indexOf("mac") >= 0) GM_addStyle(`
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
