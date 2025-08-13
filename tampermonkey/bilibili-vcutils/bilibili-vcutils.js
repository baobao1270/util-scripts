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
// @downloadURL  https://raw.githubusercontent.com/baobao1270/util-scripts/refs/heads/main/tampermonkey/bilibili-vcutils/bilibili-vcutils.js
// @updateURL    https://raw.githubusercontent.com/baobao1270/util-scripts/refs/heads/main/tampermonkey/bilibili-vcutils/bilibili-vcutils.js
// ==/UserScript==


const VCUtil = {
    ConfigFlags: {
        video:      { stdurl: true, stdurlAll: true, stat: true },
        festival:   { stdurl: true, stdurlAll: true, stat: true },
        watchlater: { stdurl: true, stdurlAll: true, stat: true },
        medialist:  { stdurl: true, stdurlAll: true, stat: true },
        timezoneSlotsCount: 3,
        timezoneSlotDefault: ['PVG', 'NRT', 'LAX'],
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
        const url = `https://api.bilibili.com/medialist/gateway/base/resource/info?rid=${avid}&type=2`;
        console.log("[B站视频统计] [Stat] FetchData:", `HTTP GET ${url}`);
        const response = await fetch(url);
        console.log("[B站视频统计] [Stat] FetchData: Response", response);
        const json = await response.json();
        console.log("[B站视频统计] [Stat] FetchData: JSON", json);
        if (json == undefined) return;
        const data = json.data;
        if (data == undefined) return;

        const format = VCUtil.Stat.Format;
        const block = VCUtil.Stat
            .BuildInfoBox(avid)
            .AddText(`${format.HumanReadableNumber(data.cnt_info.play)} 播放    `)
            .AddText(format.Tname(data.tid))
            .AddText(`av${avid}`, true)
            .AddText(VCUtil.Convert.av2bv(avid), true)
            .AddText(`cid=${data.pages[part - 1].id}`, true)
            .AddText((data.tid === 30) ? format.VocaloidAchievement(data.cnt_info.play) : "非 VU 区视频")
            .AddLineBreak();

        block.AddText('发布');
        VCUtil.Stat.FormatTimezoneSlots(block, data.pubtime);
        block.AddLineBreak();
        block.AddText('投稿');
        VCUtil.Stat.FormatTimezoneSlots(block, data.ctime);
        block.AddLineBreak();

        if (data.tid === 30) {
            block.AddLink('TDD',`https://tdd.bunnyxt.com/video/av${avid}`)
        } else {
            block.AddText('---');
        }

        block.AddLink('封面', data.cover);
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
    TidMapping: [{ "id": 1, "name": "动画(主分区)" }, { "id": 24, "name": "MAD·AMV" }, { "id": 25, "name": "MMD·3D" }, { "id": 47, "name": "短片·手书" }, { "id": 257, "name": "配音" }, { "id": 210, "name": "手办·模玩" }, { "id": 86, "name": "特摄" }, { "id": 253, "name": "动漫杂谈" }, { "id": 27, "name": "综合" }, { "id": 13, "name": "番剧(主分区)" }, { "id": 51, "name": "资讯" }, { "id": 152, "name": "官方延伸" }, { "id": 32, "name": "完结动画" }, { "id": 33, "name": "连载动画" }, { "id": 167, "name": "国创(主分区)" }, { "id": 153, "name": "国产动画" }, { "id": 168, "name": "国产原创相关" }, { "id": 169, "name": "布袋戏" }, { "id": 170, "name": "资讯" }, { "id": 195, "name": "动态漫·广播剧" }, { "id": 3, "name": "音乐(主分区)" }, { "id": 28, "name": "原创音乐" }, { "id": 31, "name": "翻唱" }, { "id": 30, "name": "VOCALOID·UTAU" }, { "id": 59, "name": "演奏" }, { "id": 193, "name": "MV" }, { "id": 29, "name": "音乐现场" }, { "id": 130, "name": "音乐综合" }, { "id": 243, "name": "乐评盘点" }, { "id": 244, "name": "音乐教学" }, { "id": 194, "name": "电音(已下线)" }, { "id": 129, "name": "舞蹈(主分区)" }, { "id": 20, "name": "宅舞" }, { "id": 154, "name": "舞蹈综合" }, { "id": 156, "name": "舞蹈教程" }, { "id": 198, "name": "街舞" }, { "id": 199, "name": "明星舞蹈" }, { "id": 200, "name": "国风舞蹈" }, { "id": 255, "name": "手势·网红舞" }, { "id": 4, "name": "游戏(主分区)" }, { "id": 17, "name": "单机游戏" }, { "id": 171, "name": "电子竞技" }, { "id": 172, "name": "手机游戏" }, { "id": 65, "name": "网络游戏" }, { "id": 173, "name": "桌游棋牌" }, { "id": 121, "name": "GMV" }, { "id": 136, "name": "音游" }, { "id": 19, "name": "Mugen" }, { "id": 36, "name": "知识(主分区)" }, { "id": 201, "name": "科学科普" }, { "id": 124, "name": "社科·法律·心理(原社科人文、原趣味科普人文)" }, { "id": 228, "name": "人文历史" }, { "id": 207, "name": "财经商业" }, { "id": 208, "name": "校园学习" }, { "id": 209, "name": "职业职场" }, { "id": 229, "name": "设计·创意" }, { "id": 122, "name": "野生技术协会" }, { "id": 39, "name": "演讲·公开课(已下线)" }, { "id": 96, "name": "星海(已下线)" }, { "id": 98, "name": "机械(已下线)" }, { "id": 188, "name": "科技(主分区)" }, { "id": 95, "name": "数码(原手机平板)" }, { "id": 230, "name": "软件应用" }, { "id": 231, "name": "计算机技术" }, { "id": 232, "name": "科工机械 (原工业·工程·机械)" }, { "id": 233, "name": "极客DIY" }, { "id": 189, "name": "电脑装机(已下线)" }, { "id": 190, "name": "摄影摄像(已下线)" }, { "id": 191, "name": "影音智能(已下线)" }, { "id": 234, "name": "运动(主分区)" }, { "id": 235, "name": "篮球" }, { "id": 249, "name": "足球" }, { "id": 164, "name": "健身" }, { "id": 236, "name": "竞技体育" }, { "id": 237, "name": "运动文化" }, { "id": 238, "name": "运动综合" }, { "id": 223, "name": "汽车(主分区)" }, { "id": 258, "name": "汽车知识科普" }, { "id": 245, "name": "赛车" }, { "id": 246, "name": "改装玩车" }, { "id": 247, "name": "新能源车" }, { "id": 248, "name": "房车" }, { "id": 240, "name": "摩托车" }, { "id": 227, "name": "购车攻略" }, { "id": 176, "name": "汽车生活" }, { "id": 224, "name": "汽车文化(已下线)" }, { "id": 225, "name": "汽车极客(已下线)" }, { "id": 226, "name": "智能出行(已下线)" }, { "id": 160, "name": "生活(主分区)" }, { "id": 138, "name": "搞笑" }, { "id": 250, "name": "出行" }, { "id": 251, "name": "三农" }, { "id": 239, "name": "家居房产" }, { "id": 161, "name": "手工" }, { "id": 162, "name": "绘画" }, { "id": 21, "name": "日常" }, { "id": 254, "name": "亲子" }, { "id": 76, "name": "美食圈(重定向)" }, { "id": 75, "name": "动物圈(重定向)" }, { "id": 163, "name": "运动(重定向)" }, { "id": 176, "name": "汽车(重定向)" }, { "id": 174, "name": "其他(已下线)" }, { "id": 211, "name": "美食(主分区)" }, { "id": 76, "name": "美食制作(原[生活]->[美食圈])" }, { "id": 212, "name": "美食侦探" }, { "id": 213, "name": "美食测评" }, { "id": 214, "name": "田园美食" }, { "id": 215, "name": "美食记录" }, { "id": 217, "name": "动物圈(主分区)" }, { "id": 218, "name": "喵星人" }, { "id": 219, "name": "汪星人" }, { "id": 220, "name": "动物二创" }, { "id": 221, "name": "野生动物" }, { "id": 222, "name": "小宠异宠" }, { "id": 75, "name": "动物综合" }, { "id": 119, "name": "鬼畜(主分区)" }, { "id": 22, "name": "鬼畜调教" }, { "id": 26, "name": "音MAD" }, { "id": 126, "name": "人力VOCALOID" }, { "id": 216, "name": "鬼畜剧场" }, { "id": 127, "name": "教程演示" }, { "id": 155, "name": "时尚(主分区)" }, { "id": 157, "name": "美妆护肤" }, { "id": 252, "name": "仿妆cos" }, { "id": 158, "name": "穿搭" }, { "id": 159, "name": "时尚潮流" }, { "id": 164, "name": "健身(重定向)" }, { "id": 192, "name": "风尚标(已下线)" }, { "id": 202, "name": "资讯(主分区)" }, { "id": 203, "name": "热点" }, { "id": 204, "name": "环球" }, { "id": 205, "name": "社会" }, { "id": 206, "name": "综合" }, { "id": 165, "name": "广告(主分区)" }, { "id": 166, "name": "广告(已下线)" }, { "id": 5, "name": "娱乐(主分区)" }, { "id": 71, "name": "综艺" }, { "id": 241, "name": "娱乐杂谈" }, { "id": 242, "name": "粉丝创作" }, { "id": 137, "name": "明星综合" }, { "id": 131, "name": "Korea相关(已下线)" }, { "id": 181, "name": "影视(主分区)" }, { "id": 182, "name": "影视杂谈" }, { "id": 183, "name": "影视剪辑" }, { "id": 85, "name": "小剧场" }, { "id": 184, "name": "预告·资讯" }, { "id": 256, "name": "短片" }, { "id": 177, "name": "纪录片(主分区)" }, { "id": 37, "name": "人文·历史" }, { "id": 178, "name": "科学·探索·自然" }, { "id": 179, "name": "军事" }, { "id": 180, "name": "社会·美食·旅行" }, { "id": 23, "name": "电影(主分区)" }, { "id": 147, "name": "华语电影" }, { "id": 145, "name": "欧美电影" }, { "id": 146, "name": "日本电影" }, { "id": 83, "name": "其他国家" }, { "id": 11, "name": "电视剧(主分区)" }, { "id": 185, "name": "国产剧" }, { "id": 187, "name": "海外剧" }],
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

    Tname: function (tid) {
        return VCUtil.Stat.Format.TidMapping.find(e => e.id === tid)?.name || "未知分区";
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
    Register: function () {
        VCUtil.MenuCommand.MenuCommands.forEach(meunCommandId => GM_unregisterMenuCommand(meunCommandId));
        VCUtil.MenuCommand.MenuCommands = [];
        for (let slotId = 0; slotId < VCUtil.ConfigFlags.timezoneSlotsCount; slotId++) {
            const { current, next } = VCUtil.MenuCommand.CurrentAndNextTimezone(slotId);
            const meunCommandId = GM_registerMenuCommand(
                `切换槽位 ${slotId + 1} 时区 ${current.IATA} -> ${next.IATA}`,
                () => VCUtil.MenuCommand.ChangeTimezoneSetting(slotId),
            );
            VCUtil.MenuCommand.MenuCommands.push(meunCommandId);
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
