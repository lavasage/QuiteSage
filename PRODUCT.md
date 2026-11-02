# QuiteSage

当前 0.8.1（versionCode 16）已安装并设为默认桌面：正文优先、一屏一则划线，状态栏合并时间/连续阅读天数/电量/Wi-Fi，阅读档案含时长热图与兴趣分布，锁屏壁纸每次进入轮换，系统状态栏下拉已关闭。0.3.0 的浏览器预览结论仍适用。小状态栏、正文、书名/换一则与底部App入口构成主要层级；彩蛋藏在长按交互，不增加界面标签；出处页仅保留事实记录。设备仍运行0.2.2，本轮未构建或安装APK。锁屏为四幅程序化单色图版轮播。首页仅载入本机筛选后的真实划线，不在线请求微信读书。v0.2.2源码归档archive/v0.2.2，早期v1在archive/v1。

<!-- impeccable:product-schema 1 -->

## Platform

web

当前交付为HTML原型与Android WebView混合Launcher开发版。用户在后续消息明确授权制作安装APK、设为默认HOME与联网校时，替代了最初“只研究、不开发APK”的范围。

## Stack

按用户指定使用 HTML/CSS/JavaScript；无框架，兼容 Android WebView 61。Node 仅提供本机预览及受限数据读取，不向前端提供认证凭据。

## Users

唯一使用者是设备拥有者，希望重新拿起闲置的小米多看阅读器，以微信读书继续阅读并重访旧笔记。

## Product Purpose

把真实的阅读记录、藏书、笔记及可纠正的主题联系转成安静的个人阅读入口。成功是更容易重新开始阅读，不是完成阅读指标。

## Positioning

以用户本人微信读书数据驱动，优先重新发现已有书架与笔记；微信读书负责实际阅读。

## Operating Context

USB 实测 EPD106，Android 8.1、758×1024、212 逻辑 DPI、约 917 MiB 内存、WebView 61；微信读书墨水屏版 com.tencent.weread.eink。桌面浏览器需能预览设备尺寸。

## Capabilities and Constraints

继续阅读、书架、笔记、阅读世界、有限统计与有理由的推荐；必要的系统入口。无数据用空状态。数据与界面分离。系统功能在 HTML 无原生桥时明确标注待接入，不伪装完成。

完整只读获取及本地处理已获用户授权。私有快照不进 Git，密钥用 DPAPI 加密。后续已授权安装Sage、设默认HOME、连接指定Wi-Fi和自动校时；已执行并验证，保留旧桌面。没有修改微信读书内容、公开发布网站、Root或卸载原桌面的授权。

## Brand Commitments

名称 QuiteSage（包名 com.sagepaper.launcher 为历史命名）；黑白灰、高对比中文、Editorial Design、E-ink、Swiss Typography、Digital Library、Personal Archive、Minimalism。无阴影、渐变、动画堆砌，不做 SaaS 数据卡片首页。

## Evidence on Hand

腾讯官方 Skill 位于 vendor/WeChatReading/skills；原始快照与派生数据位于 .private；USB 检测记录在 docs/02-device-inspection.md。引用必须保留真实原文、书籍及来源记录；数据推断与接口事实分开。

## Product Principles

先取得真实数据，再画像，再设计，再验证原型；继续阅读是第一优先级；个人思想允许纠正；推荐先看已有书架；阅读没有排名、成就或打卡压力。

## Accessibility & Inclusion

中文易读、足够大触摸目标、键盘可操作、单色不丢语义；减少重绘、只按需刷新；设备状态未知时不填假值。
