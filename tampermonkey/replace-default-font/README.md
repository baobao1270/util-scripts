# 强制替换默认字体
有的网站是不是以为世界上只有 Windows 用户😅

有的大厂前端是不是以为大家都有钱买 Mac 电脑😅

## 版本
你可以在 [我的 Greasy Fork 主页](https://greasyfork.org/zh-CN/users/768505-josephcz) 上找到其他版本。

### auto
**自动版**

自动检测系统，Windows 使用 `Microsoft YaHei`，macOS 使用 `PingFang SC`。

这两个字体都是分别在对应的系统上自带的，理论上不需要额外安装字体，除非你强行把默认字体删了。

### all-pingfang-sc
**苹方版**

将微软雅黑字体替换为 `PingFang SC`。一般只需要在 macOS 上安装。Windows 装了可能会出问题，但是我自己试过没问题。

需要你在对应的系统上安装对应的字体。macOS 上的 PingFang SC 不能直接复制给 Windows 用，你需要自己找 Windows 版本的。

### all-microsoft-yahei
**微软雅黑版**

将 `--apple-system` 字体替换为 `Microsoft YaHei`。一般只需要在 Windows 上安装。macOS 装了可能会出问题，但是我自己试过没问题。

需要你在对应的系统上安装对应的字体。Windows 上的 Microsoft YaHei 可以直接复制到 macOS 用，但是我想大概率是没人这么干的。

## 反面教材
### 哔哩哔哩
比如说 [哔哩哔哩用户中心](https://account.bilibili.com/account/home)，居然 CSS 里只写了 `Microsoft YaHei` 😅

![反面教材：哔哩哔哩](https://raw.githubusercontent.com/baobao1270/util-scripts/main/tampermonkey/replace-default-font/bad-example-1-bilibili.jpg)

考虑到这页面的存在时间（我记得我 2013 年入站就有这个问题了）我的评价是：

![别妨碍叔叔赚钱](https://raw.githubusercontent.com/baobao1270/util-scripts/main/tampermonkey/replace-default-font/sticker.jpg)

### Twitter / X
Twitter（现在好像叫 X？）算是好的，既知道用 `-apple-system`，又给 Windows 适配了 `Segoe UI`。面对数量众多、来自不同地区的用户，要求每个语言都专门做适配，其实有点求全责备了。

而且 Twitter 会自动判断推文的语言，并设置 `lang` 属性，不管是对于字体展示还是无障碍都是很好的适配。

但是问题就出在这个 `lang` 上：你不设置还好、可以自动 fallback 到系统字体，要是你判断错了、那就会设置错误的 `lang` 属性。

这里不得不提 CJK 特色的字体问题了，同一个汉字在不同的 locale 下是有不同字形的。不少玩 Linux 的应该都知道默认字体配置中 `ja-JP` 排在 `zh-CN` 前面，导致系统的字形是中文和日文大杂烩（BTW，开源社区到现在还没有提供解决这个问题的开箱即用方案，`python -c "print('ja' < 'zh')"` 不等式秒了😅！）

因此，如果语言判断错误，那么整个推文会以非预期的字体展示。虽然大多数时候判断都是对的，但是总有几个 corner case，比如最简单的一个字：

> 啊

详情可以看 [我的推文](https://twitter.com/baobao1270/status/1794166253936087419)。

![反面教材：Twitter](https://raw.githubusercontent.com/baobao1270/util-scripts/main/tampermonkey/replace-default-font/bad-example-2-twitter.jpg)
