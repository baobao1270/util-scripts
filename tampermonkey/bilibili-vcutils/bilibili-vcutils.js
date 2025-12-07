// ==UserScript==
// @name         BV2AV + 视频统计
// @description  支持 Safari | 干净 URL | 视频统计 | V 家成就
// @version      3.2.0
// @license      MIT
// @author       Joseph Chris <joseph@josephcz.xyz>
// @icon         https://www.bilibili.com/favicon.ico
// @namespace    https://github.com/baobao1270/util-scripts/blob/main/tampermonkey/bilibili-vcutils
// @homepageURL  https://github.com/baobao1270/util-scripts/blob/main/tampermonkey/bilibili-vcutils
// @supportURL   mailto:tampermonkey-support@josephcz.xyz
// @compatible   firefox
// @compatible   safari
// @compatible   chrome
// @compatible   edge
// @match        *://www.bilibili.com/video/*
// @match        *://www.bilibili.com/festival/*
// @match        *://www.bilibili.com/list/watchlater*
// @match        *://www.bilibili.com/list/ml*
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==


const VCUtil = {
    ConfigFlags: {
        video:      { stdurl: true, stdurlAll: true, stat: true },
        festival:   { stdurl: true, stdurlAll: true, stat: true },
        watchlater: { stdurl: true, stdurlAll: true, stat: true },
        medialist:  { stdurl: true, stdurlAll: true, stat: true },
        timezoneSlotsCount: 3,
        timezoneSlotDefault: ['PVG', 'NRT', 'LAX'],
        tidVersionDefault: 'v1',
        tidShowDefault: false,
    },
};

VCUtil.Convert = {
    bv2av: function (bvid) {
        const XOR_CODE = 23442827791579n;
        const MASK_CODE = 2251799813685247n;
        const BASE = 58n;
        const data = 'FcwAPNKTMug3GV5Lj7EJnHpWsx4tb8haYeviqBz6rkCy12mUSDQX9RdoZf';

        const bvidArr = Array.from(bvid);
        [bvidArr[3], bvidArr[9]] = [bvidArr[9], bvidArr[3]];
        [bvidArr[4], bvidArr[7]] = [bvidArr[7], bvidArr[4]];
        bvidArr.splice(0, 3);
        const tmp = bvidArr.reduce((pre, bvidChar) => pre * BASE + BigInt(data.indexOf(bvidChar)), 0n);
        return Number((tmp & MASK_CODE) ^ XOR_CODE);
    },

    av2bv: function (aid) {
        const XOR_CODE = 23442827791579n;
        const MAX_AID = 1n << 51n;
        const BASE = 58n;
        const data = 'FcwAPNKTMug3GV5Lj7EJnHpWsx4tb8haYeviqBz6rkCy12mUSDQX9RdoZf';
        const bytes = ['B', 'V', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0'];

        let bvIndex = bytes.length - 1;
        let tmp = (MAX_AID | BigInt(aid)) ^ XOR_CODE;
        while (tmp > 0) {
            bytes[bvIndex] = data[Number(tmp % BigInt(BASE))];
            tmp = tmp / BASE;
            bvIndex -= 1;
        }
        [bytes[3], bytes[9]] = [bytes[9], bytes[3]];
        [bytes[4], bytes[7]] = [bytes[7], bytes[4]];
        return bytes.join('');
    },
};

VCUtil.URL = {
    Info: function () {
        if (location.pathname.startsWith("/video/")) {
            const actualVideo = document.querySelector("meta[property=\"og:url\"]").content;
            const videoId = actualVideo
                .slice('https://www.bilibili.com/video/'.length)
                .replace(/\/$/, '');
            const avid = videoId.startsWith('av') ? Number(videoId.slice(2)) : VCUtil.Convert.bv2av(videoId);
            const part = new URL(window.location.href).searchParams.get("p") || 1;
            return {
                avid: avid, bvid: VCUtil.Convert.av2bv(avid), part: part, type: 'video',
                standardUrl: `https://www.bilibili.com/video/av${avid}${part > 1 ? `?p=${part}` : ''}`
            };
        }
        if (location.pathname.startsWith("/festival/")) {
            const actualVideo = document.querySelector("#link0").value;
            const fesName = location.pathname.slice('/festival/'.length);
            const videoId = actualVideo
                .slice('https://www.bilibili.com/video/'.length)
                .replace(/\/$/, '');
            const avid = videoId.startsWith('av') ? Number(videoId.slice(2)) : VCUtil.Convert.bv2av(videoId);
            const part = new URL(actualVideo).searchParams.get("p") || 1;
            return {
                avid: avid, bvid: VCUtil.Convert.av2bv(avid), part: part, type: 'festival',
                standardUrl: `https://www.bilibili.com/festival/${fesName}?bvid=${VCUtil.Convert.av2bv(avid)}${part > 1 ? `&p=${part}` : ''}`
            };
        }
        if (location.pathname.startsWith("/list/watchlater")) {
            const bvid = new URL(window.location.href).searchParams.get("bvid");
            const part = new URL(window.location.href).searchParams.get("p") || 1;
            const oid = new URL(window.location.href).searchParams.get("oid");
            return {
                avid: VCUtil.Convert.bv2av(bvid), bvid: bvid, part: part, type: 'watchlater',
                standardUrl: `https://www.bilibili.com/list/watchlater?oid=${oid}&bvid=${bvid}${part > 1 ? `&p=${part}` : ''}`
            };
        }
        if (location.pathname.startsWith("/list/ml")) {
            const mlid = location.pathname.slice('/list/ml'.length);
            const bvid = new URL(window.location.href).searchParams.get("bvid");
            const part = new URL(window.location.href).searchParams.get("p") || 1;
            const oid = new URL(window.location.href).searchParams.get("oid");
            return {
                avid: VCUtil.Convert.bv2av(bvid), bvid: bvid, part: part, type: 'medialist',
                standardUrl: `https://www.bilibili.com/list/ml${mlid}?oid=${oid}&bvid=${bvid}${part > 1 ? `&p=${part}` : ''}`
            };
        }
        return null;
    },

    Standardize: function (urlInfo) {
        if (!urlInfo.standardUrl) return;
        if (urlInfo.standardUrl !== window.location.href) {
            console.log("[B站视频统计] [URL] 当前 URL:", window.location.href);
            console.log("[B站视频统计] [URL] 重定向到标准URL:", urlInfo.standardUrl);
            history.replaceState(null, '', urlInfo.standardUrl);
        }
    },

    StandardizeAllUrl: function () {
        const links = Array.from(document.querySelectorAll('a[href]'));
        links.forEach(link => {
            const pathname = new URL(link.href).pathname;
            if (!pathname.startsWith('/video/')) return;
            const videoId = pathname.slice('/video/'.length).replace(/\/$/, '');
            const avid = videoId.startsWith('av') ? Number(videoId.slice(2)) : VCUtil.Convert.bv2av(videoId);
            const part = new URL(link.href).searchParams.get("p") || 1;
            link.href = `https://www.bilibili.com/video/av${avid}${part > 1 ? `?p=${part}` : ''}`;
        });
    },
};

VCUtil.Stat = {
    InfoBoxClass: '.vcutil-stat',
    FormatTimezoneSlots: function (block, timestamp) {
        for (let slotId = 0; slotId < VCUtil.ConfigFlags.timezoneSlotsCount; slotId++) {
            const { current } = VCUtil.MenuCommand.CurrentAndNextTimezone(slotId);
            const { IATA, timezone } = current;
            console.log(`[B站视频统计] [Stat] 时区槽位 ${slotId + 1} = IATA: ${IATA}, 时区: ${timezone}`);
            if (timezone === "Timestamp") {
                block.AddText(`${IATA} ${timestamp}`, true);
            } else {
                block.AddText(`${IATA} ${VCUtil.Stat.Format.Timezone(timestamp, timezone)}`, true);
            }
        }
    },
    FetchData: async function (avid, part) {
        if (!document.querySelector('div.bili-avatar')) return console.log("[B站视频统计] [Stat] Header 未完全加载，推迟 FetchData");
        if (document.querySelector(VCUtil.Stat.InfoBoxClass)
          && document.querySelector(VCUtil.Stat.InfoBoxClass).getAttribute('data-avid') === avid.toString()) return;
        const url = `https://api.bilibili.com/x/web-interface/view?aid=${avid}`;
        console.log("[B站视频统计] [Stat] FetchData:", `HTTP GET ${url}`);
        const response = await fetch(url);
        console.log("[B站视频统计] [Stat] FetchData: Response", response);
        const json = await response.json();
        console.log("[B站视频统计] [Stat] FetchData: JSON", json);
        if (json == undefined) return;
        const data = json.data;
        if (data == undefined) return;

        const format = VCUtil.Stat.Format;
        const tidVersion = VCUtil.MenuCommand.CurrentAndNextTid().current.Id;
        const tidShow = VCUtil.MenuCommand.CurrentAndNextTidShow().current;
        const block = VCUtil.Stat
            .BuildInfoBox(avid)
            .AddText(`${format.HumanReadableNumber(data.stat.view)} 播放    `)
            .AddText(tidVersion != "v2" ? ((tidVersion === "all" ? "v1：" : "") + (tidShow ? `${data.tname}（${data.tid}）` : data.tname)) : "")
            .AddText(tidVersion != "v1" ? ((tidVersion === "all" ? "v2：" : "") + (tidShow ? `${data.tname_v2}（${data.tid_v2}）` : data.tname_v2)) : "")
            .AddText(`av${avid}`, true)
            .AddText(VCUtil.Convert.av2bv(avid), true)
            .AddText(`cid=${data.pages[part - 1].id}`, true)
            .AddText((data.tid === 30) ? format.VocaloidAchievement(data.stat.view) : format.VocaloidAchievement(data.stat.view)+"（非 VU 区视频）")
            .AddLineBreak();

        block.AddText('发布');
        VCUtil.Stat.FormatTimezoneSlots(block, data.pubdate);
        block.AddLineBreak();
        block.AddText('投稿');
        VCUtil.Stat.FormatTimezoneSlots(block, data.ctime);
        block.AddLineBreak();

        if (data.tid === 30) {
            block.AddLink('TDD',`https://tdd.bunnyxt.com/video/av${avid}`)
        } else {
            block.AddText('---');
        }

        block.AddLink('封面', data.pic);
        block.AddLink('短链接', `https://b23.tv/av${avid}`);
        block.AddLink('API', url);
        VCUtil.Stat.UpdateLayout();
    },

    UpdateLayout: function () {
        const infoBox = document.querySelector(VCUtil.Stat.InfoBoxClass);
        if (infoBox) {
            if(document.querySelector(".video-info-meta")) {
                document.querySelector(".video-info-meta").parentElement.style.paddingBottom = `${infoBox.clientHeight + 80}px`;
            } else {
                document.querySelector(".video-desc").style.paddingTop = `${infoBox.clientHeight}px`;
            }
        }
    },

    BuildInfoBox: function (avid) {
        const infoBox = document.createElement('div');
        infoBox.className = VCUtil.Stat.InfoBoxClass.slice(1);
        infoBox.setAttribute('data-avid', avid.toString());
        infoBox.style.color = "#999";
        infoBox.style.fontSize = "12px";
        infoBox.style.lineHeight = "1.5";
        infoBox.style.position = "absolute";
        infoBox.style.zIndex = "10";
        infoBox.style.paddingTop = "10px";
        Array.from(document.querySelectorAll(VCUtil.Stat.InfoBoxClass)).forEach(e => e.remove());
        if(document.querySelector(".video-info-meta")) {
            document.querySelector(".video-info-meta").parentElement.appendChild(infoBox);
        } else {
            document.querySelector(".video-desc").parentElement.insertBefore(infoBox, document.querySelector(".video-desc"))
        }
        const builder = {
            AddText: function (text, code = false) {
                if (text === "") { return builder; }
                const textBox = document.createElement("span");
                textBox.innerText = text + " ";
                textBox.style.marginRight = "13px";
                if (code === true) { textBox.style.fontFamily = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', 'JetBrains Mono', monospace"; }
                infoBox.appendChild(textBox);
                return builder;
            },
            AddBlod(text) {
                const boldBox = document.createElement("span");
                boldBox.innerText = text;
                boldBox.style.fontWeight = "bold";
                boldBox.style.marginRight = "13px";
                infoBox.appendChild(boldBox);
                return builder;
            },
            AddLink: function (text, url) {
                const linkBox = document.createElement("span");
                linkBox.innerHTML = `<a target="_blank" href="${url}">${text}</a>`;
                linkBox.style.marginRight = "13px";
                infoBox.appendChild(linkBox);
                return builder;
            },
            AddLineBreak: function () {
                infoBox.appendChild(document.createElement("br"));
                return builder;
            },
        };
        return builder;
    },
};

VCUtil.Stat.Format = {
    HumanReadableNumber: function (num) {
        var result = '', counter = 0;
        num = (num || 0).toString();
        for (var i = num.length - 1; i >= 0; i--) {
            counter++;
            result = num.charAt(i) + result;
            if (!(counter % 3) && i != 0) { result = ',' + result; }
        }
        return result;
    },

    VocaloidAchievement: function (plays) {
        if (plays >= 10000000) return "神话";
        if (plays >= 5000000) return "申舌";
        if (plays >= 1000000) return "传说";
        if (plays >= 500000) return "专兑";
        if (plays >= 100000) return "殿堂";
        return "待成就";
    },

    Timezone: function (timestamp, timezone) {
        return new Date(timestamp * 1000).toLocaleString('sv-SE', {timeZone: timezone});
    }
};

VCUtil.Entry = () => {
    const urlInfo = VCUtil.URL.Info();
    if (urlInfo === null) return;

    const flag = VCUtil.ConfigFlags[urlInfo.type];
    if (flag.stdurl) VCUtil.URL.Standardize(urlInfo);
    if (flag.stdurlAll) VCUtil.URL.StandardizeAllUrl();
    if (flag.stat) VCUtil.Stat.FetchData(urlInfo.avid, urlInfo.part);
}

VCUtil.MenuCommand = {
    MenuCommands: [],
    TimezonesMapping: [
        { IATA: "PVG", timezone: "Asia/Shanghai" },
        { IATA: "NRT", timezone: "Asia/Tokyo" },
        { IATA: "LAX", timezone: "America/Los_Angeles" },
        { IATA: "JFK", timezone: "America/New_York" },
        { IATA: "LHR", timezone: "Europe/London" },
        { IATA: "MUC", timezone: "Europe/Berlin" },
        { IATA: "KIV", timezone: "Europe/Kiev" },
        { IATA: "SVO", timezone: "Europe/Moscow" },
        { IATA: "SYD", timezone: "Australia/Sydney" },
        { IATA: "UNIX", timezone: "Timestamp" },
    ],
    CurrentAndNextTimezone: function (slotId) {
        const currentIATA = GM_getValue(`VCUtil_Timezone_${slotId}`, VCUtil.ConfigFlags.timezoneSlotDefault[slotId]);
        const currentIndex = VCUtil.MenuCommand.TimezonesMapping.findIndex(e => e.IATA === currentIATA);
        const current = VCUtil.MenuCommand.TimezonesMapping[currentIndex];
        console.log(`[B站视频统计] [Menu] 时区槽位 ${slotId + 1} 当前`, current);
        const nextIndex = (currentIndex + 1) % VCUtil.MenuCommand.TimezonesMapping.length;
        const next = VCUtil.MenuCommand.TimezonesMapping[nextIndex];
        console.log(`[B站视频统计] [Menu] 时区槽位 ${slotId + 1} 下个`, next);
        return { current: current, next: next };
    },
    ChangeTimezoneSetting: function (slotId) {
        const { next } = VCUtil.MenuCommand.CurrentAndNextTimezone(slotId);
        GM_setValue(`VCUtil_Timezone_${slotId}`, next.IATA);
        VCUtil.MenuCommand.Register();
        console.log(`[B站视频统计] [Menu] 时区槽位 ${slotId + 1} 设置成功`);
    },
    TidMapping: [
        { Id: "v1", Name: "旧版" },
        { Id: "v2", Name: "新版" },
        { Id: "all", Name: "全部" },
    ],
    CurrentAndNextTid: function () {
        const currentId = GM_getValue("VCUtil_Tid", VCUtil.ConfigFlags.tidVersionDefault);
        const currentIndex = VCUtil.MenuCommand.TidMapping.findIndex(e => e.Id === currentId);
        const current = VCUtil.MenuCommand.TidMapping[currentIndex];
        console.log(`[B站视频统计] [Menu] 分区设置 当前`, current);
        const nextIndex = (currentIndex + 1) % VCUtil.MenuCommand.TidMapping.length;
        const next = VCUtil.MenuCommand.TidMapping[nextIndex];
        console.log(`[B站视频统计] [Menu] 分区设置 下个`, next);
        return { current: current, next: next };
    },
    ChangeTidSetting: function () {
        const { next } = VCUtil.MenuCommand.CurrentAndNextTid();
        GM_setValue("VCUtil_Tid", next.Id);
        VCUtil.MenuCommand.Register();
        console.log(`[B站视频统计] [Menu] 分区设置 设置成功`);
    },
    CurrentAndNextTidShow: function () {
        const current = GM_getValue("VCUtil_TidShow", VCUtil.ConfigFlags.tidShowDefault);
        console.log(`[B站视频统计] [Menu] 分区Id显示设置 当前`, current);
        console.log(`[B站视频统计] [Menu] 分区Id显示设置 下个`, !current);
        return { current: current, next: !current };
    },
    ChangeTidShowSetting: function () {
        const { next } = VCUtil.MenuCommand.CurrentAndNextTidShow();
        GM_setValue("VCUtil_TidShow", next);
        VCUtil.MenuCommand.Register();
        console.log(`[B站视频统计] [Menu] 分区Id显示设置 设置成功`);
    },
    Register: function () {
        VCUtil.MenuCommand.MenuCommands.forEach(meunCommandId => GM_unregisterMenuCommand(meunCommandId));
        VCUtil.MenuCommand.MenuCommands = [];
        for (let slotId = 0; slotId < VCUtil.ConfigFlags.timezoneSlotsCount; slotId++) {
            const { current, next } = VCUtil.MenuCommand.CurrentAndNextTimezone(slotId);
            const menuCommandId = GM_registerMenuCommand(
                `切换槽位 ${slotId + 1} 时区 ${current.IATA} -> ${next.IATA}`,
                () => VCUtil.MenuCommand.ChangeTimezoneSetting(slotId),
            );
            VCUtil.MenuCommand.MenuCommands.push(menuCommandId);
        }
        {
            const { current, next } = VCUtil.MenuCommand.CurrentAndNextTid();
            const menuCommandId = GM_registerMenuCommand(
                `切换分区显示 ${current.Name} -> ${next.Name}`,
                () => VCUtil.MenuCommand.ChangeTidSetting(),
            );
            VCUtil.MenuCommand.MenuCommands.push(menuCommandId);
        }
        {
            const { next } = VCUtil.MenuCommand.CurrentAndNextTidShow();
            const menuCommandId = GM_registerMenuCommand(
                `${next ? "开启" : "关闭"}分区id显示`,
                () => VCUtil.MenuCommand.ChangeTidShowSetting(),
            );
            VCUtil.MenuCommand.MenuCommands.push(menuCommandId);
        }
    }
};

(() => {
    'use strict';
    console.log("[B站视频统计] 脚本已加载");
    console.log("[B站视频统计] 功能开关:", VCUtil.ConfigFlags);

    const observer = new MutationObserver((_mutationList, _observed) => VCUtil.Entry());
    const el = document.querySelector('#app');
    console.log("[B站视频统计] 挂载到元素:", el);
    observer.observe(el, { childList: true, subtree: true });

    VCUtil.MenuCommand.Register();
})();
