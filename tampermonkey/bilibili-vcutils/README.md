# BV2AV + 视频统计

![预览](https://raw.githubusercontent.com/baobao1270/util-scripts/main/tampermonkey/bilibili-vcutils/preview.jpg)

## 功能列表
 - `stdurl`: 清理「哔哩哔哩」网站 URL，清除跟踪参数并将 BV 号转换为 AV 号
 - `stdurlAll`: 替换「哔哩哔哩」网页上的所有视频链接，清除跟踪参数并将 BV 号转换为 AV 号
 - `stat`: 显示视频统计信息、短链接和封面下载链接

## 支持的路径
 - 视频 (`video`, url: `/video/*`)
 - 稍后再看 (`watchlater`, url: `/list/watchlater*`)
 - 收藏夹 (`medialist`, url: `list/ml*`)

## 视频统计信息的内容
 - AV 号、BV 号、CID、视频分区、具体播放量
 - 投稿和发布时间（不同时区）
 - 视频短链接、视频封面下载链接
 - V+ 相关：VOCALOID 歌曲成就、[TianDian Daily](https://tdd.bunnyxt.com/) 链接

## 切换时区
您可以通过插件菜单切换要显示的时区。插件以城市的 IATA 代码来指代时间。

点击插件菜单中的 `切换槽位 X 时区` 来切换到下一个时区；直到最后一个时区后会回到第一个时区。

支持的时区列表：
 - `PVG` 上海 (`Asia/Shanghai`)
 - `NRT` 东京 (`Asia/Tokyo`)
 - `LAX` 洛杉矶 (`America/Los_Angeles`)
 - `JFK` 纽约 (`America/New_York`)
 - `LHR` 伦敦 (`Europe/London`)
 - `MUC` 慕尼黑 (`Europe/Berlin`)
 - `KIV` 基辅 (`Europe/Kiev`)
 - `SVO` 莫斯科 (`Europe/Moscow`)
 - `SYD` 悉尼 (`Australia/Sydney`)
 - `UNIX` UNIX 时间戳
