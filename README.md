# QuiteSage

一个给墨水屏阅读器写的桌面（Android Launcher）。一屏一则划线，安静，不打扰；把「再读一点」变成开机就能看到的事。

代码是 HTML/CSS/JavaScript 跑在 WebView 里，外加一层精简的原生桥（启动应用、设置壁纸、读设备状态）。目标设备是 Android 8.1 的墨水屏阅读器，实测分辨率 758×1024（CSS 视口 572×773，dpr 1.325）。

## 界面

**首页**：顶部一行状态栏（时间 · 日期 · 连续阅读天数 · 电量 · Wi-Fi），中间是当天随机推送的一条真实划线，下面是书名与划线日期、一个「换一则」；底部是两个阅读入口和「全部应用」。

**阅读档案**：四项读数（读过 / 读完 / 阅读 / 笔记）、阅读时长热图（按年 × 月）、一天之中的时段分布、阅读兴趣分布、最近一次划线。

**锁屏壁纸**：四幅程序化绘制的单色图版——熵与秩序 / 洞穴与光 / 注意的窄门 / 误差与信念。开启轮播后，每次进入锁屏自动换下一幅。

**彩蛋**：长按书名换同书另一条；长按「换一则」回到上一条。

## 设计上的几个硬约束

- 设备 WebView 是 Chrome 61：不支持 `clamp()`/`min()`/`max()`、`:is()`、flex `gap`、`scrollbar-width`。CSS 遇到不认识的函数是整条声明作废，所以这里只用纯 CSS 与 `vh`。
- 全局不显示滚动条；摘抄超出一屏时由 `fitExcerpt()` 先降字号（下限 18px）再压顶部锚点，保证一屏读完。
- 灰阶只有四级（#151515 / #575757 / #949494 / #cccccc），不用阴影、渐变、动画堆砌。

## 构建

依赖：JDK 8+、Android SDK build-tools、android-35 platform。

```bash
bash tools/build-android.sh
# → android/build/QuiteSage.apk
```

脚本里所有原生工具都先 `cd` 到 `android/build` 再传相对路径——工程目录带中文时，aapt/javac 按 ANSI 解析绝对路径会失败。

没有本地阅读数据时，构建会自动改用明确标注的占位划线（`tools/demo-data.cjs`），不影响功能验证。

## 安装

```bash
adb install -r android/build/QuiteSage.apk
adb shell cmd package set-home-activity com.sagepaper.launcher/.SageActivity
```

包名保留历史命名 `com.sagepaper.launcher`（改名会丢失设备所有者授权与本地数据），对外显示名为 **QuiteSage**。

### 可选：屏蔽系统状态栏下拉

想彻底关掉系统通知栏（避免和桌面功能重复），把应用设为设备所有者：

```bash
adb shell dpm set-device-owner com.sagepaper.launcher/.SageAdmin
```

设置后 `setStatusBarDisabled` 生效，顶部下拉不再唤出系统面板；桌面的状态栏已经接管了时间、电量、Wi-Fi。

回退：

```bash
adb shell dpm remove-active-admin com.sagepaper.launcher/.SageAdmin
```

## 本地预览

```bash
node prototype/server.cjs
# http://127.0.0.1:4173/?device=1
```

服务只监听 127.0.0.1，白名单式路由，不暴露 `.private` 下的任何路径。

## 数据与隐私

划线、阅读统计、Wi-Fi 密码、签名密钥都只在本机 `.private/`，已在 `.gitignore` 中排除。仓库里的四幅壁纸是程序生成的单色图版，不含个人内容。

`tools/` 下的采集脚本通过微信读书官方接口读取本人数据，原始快照与派生数据都留在本地；`tools/prepare-stats.py` 把它折成 `/api/stats` 需要的扁平 JSON。

## 目录

```
prototype/   网页本体（index.html / style.css / app.js）与本地预览服务
android/     Java 源码、Manifest、构建产物
tools/       构建、部署、数据整理、壁纸生成
wallpapers/  四幅图版成品与 provenance
design/      设计稿
docs/        设备排查与方向记录
```

## 状态

v0.8.1（versionCode 16），已在 EPD106 实机运行：默认桌面、锁屏轮播、实时连续阅读天数、系统状态栏合并。
