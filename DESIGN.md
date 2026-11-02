---
name: QuiteSage
description: v0.4.1（versionCode 8）已安装并设为默认桌面；正文以屏高 24% 为固定光学锚点。
colors:
  paper: "#fff"
  ink: "#151515"
  gray: "#555"
  action-gray: "#666"
  quiet-surface: "#eee"
  control-gray: "#777"
  row-line: "#bbb"
  inverse: "#222"
  preview-surround: "#e7e7e7"
typography:
  body:
    fontFamily: '"Noto Sans CJK SC", "Microsoft YaHei", sans-serif'
    fontSize: "18px"
    lineHeight: 1.5
  excerpt:
    fontFamily: '"Noto Sans CJK SC", "Microsoft YaHei", sans-serif'
    fontSize: "32px"
    fontWeight: 400
    lineHeight: 1.85
    letterSpacing: ".015em"
  clock:
    fontFamily: '"Noto Sans CJK SC", "Microsoft YaHei", sans-serif'
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: "0"
  status:
    fontFamily: '"Noto Sans CJK SC", "Microsoft YaHei", sans-serif'
    fontSize: "14px"
    lineHeight: 24px
  battery:
    fontFamily: '"Noto Sans CJK SC", "Microsoft YaHei", sans-serif'
    fontSize: "13px"
    lineHeight: 1.5
  source:
    fontFamily: '"Noto Sans CJK SC", "Microsoft YaHei", sans-serif'
    fontSize: "16px"
    lineHeight: 1.7
  quiet-action:
    fontFamily: '"Noto Sans CJK SC", "Microsoft YaHei", sans-serif'
    fontSize: "15px"
    lineHeight: 1.5
  panel-title:
    fontFamily: '"Noto Sans CJK SC", "Microsoft YaHei", sans-serif'
    fontSize: "24px"
  detail-excerpt:
    fontFamily: '"Noto Sans CJK SC", "Microsoft YaHei", sans-serif'
    fontSize: "23px"
    lineHeight: 1.9
  source-title:
    fontFamily: '"Noto Sans CJK SC", "Microsoft YaHei", sans-serif'
    fontSize: "22px"
    lineHeight: 1.6
  source-details:
    fontFamily: '"Noto Sans CJK SC", "Microsoft YaHei", sans-serif'
    fontSize: "15px"
    lineHeight: 1.8
  panel-copy:
    fontFamily: '"Noto Sans CJK SC", "Microsoft YaHei", sans-serif'
    fontSize: "16px"
    lineHeight: 1.8
  preview:
    fontFamily: '"Noto Sans CJK SC", "Microsoft YaHei", sans-serif'
    fontSize: "13px"
    lineHeight: 1.5
rounded:
  square: "0"
spacing:
  small: "8px"
  icon-label: "8px"
  compact: "12px"
  footer-top: "16px"
  regular: "16px"
  page-bottom: "24px"
  source-top: "24px"
  page-top: "28px"
  panel-gutter: "32px"
  narrow-gutter: "36px"
  wide-gutter: "48px"
components:
  button:
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
  button-hover:
    backgroundColor: "{colors.quiet-surface}"
  status-widget:
    textColor: "{colors.gray}"
    typography: "{typography.status}"
  clock-button:
    textColor: "{colors.gray}"
    typography: "{typography.clock}"
    padding: "0"
  settings-button:
    textColor: "{colors.gray}"
    width: "48px"
    padding: "0"
  excerpt:
    textColor: "{colors.ink}"
    typography: "{typography.excerpt}"
  source-button:
    textColor: "{colors.gray}"
    typography: "{typography.source}"
    padding: "0"
  next-button:
    textColor: "{colors.gray}"
    typography: "{typography.quiet-action}"
    padding: "0"
  app-entry:
    textColor: "{colors.gray}"
    typography: "{typography.quiet-action}"
    padding: "8px 0"
  app-row:
    textColor: "{colors.ink}"
    padding: "18px 8px"
    width: "100%"
  system-row:
    textColor: "{colors.ink}"
    width: "100%"
  return-button:
    textColor: "{colors.ink}"
    typography: "{typography.source}"
  source-panel:
    textColor: "{colors.ink}"
    typography: "{typography.detail-excerpt}"
  preview-select:
    typography: "{typography.preview}"
    padding: "0 10px"
  notice:
    backgroundColor: "{colors.inverse}"
    textColor: "{colors.paper}"
    padding: "15px 18px"
---

# Design System: QuiteSage

## Overview

**Creative North Star: "正文先行"**

v0.4.1 是 0.3.0 版式审阅后的修订：第一眼读真实摘抄，时间、设置和应用安静陪衬。白底、黑灰字、同一无衬线中文字体与共同左边线形成辨识度，留白承担首页分区。正文之后只接书名和小字“换一则”，作者、日期和章节留在出处页；少量长按彩蛋没有新增可见标签。

当前依据 prototype/index.html、style.css、app.js、docs/minimal-preview.md 及四张清晰浏览器截图：minimal-desktop、minimal-mobile、minimal-device-preview（758×1024）、minimal-density-preview（572×773）。device/density 文件名只表示浏览器模拟比例。UI 浏览器审查没有其他实质修复项；当前没有构建、签名或安装新的 v0.3 APK，也没有 v0.3 原生验收。

设备仍运行 v0.2.2，源码已存档 archive/v0.2.2。其 versionCode=5、HOME 设置、启动及 details-device.png 原生视觉 ship 证据仅属于旧版。v0.2.2 页角、日期印记、大时间和题签不属于当前预览；更早 v1 在 archive/v1。锁屏原画及 provenance 保留，设备端壁纸使用证据不代表本预览已部署。

**Key Characteristics:**

- 摘抄正文优先，长短内容保持同字号。
- 时间、书名、换一则与三个 App 入口退为灰色辅助。
- 同一左边线，首页以留白分区。
- 轻触查看出处或换条，长按发现同书与上一条。
- 无首页边框、大引号、页角、印记、题签或动画。

## Colors

YAML 保存当前实际 CSS 灰阶。根变量只有 paper、ink、gray 和两套字体；旧版 line/rule/seal 不再是当前 tokens。

### Primary

- **正文墨色（ink）**：摘抄、面板标题和事实字段、键盘焦点。

### Neutral

- **纸白（paper）**：纸面与设备比例预览。
- **辅助灰（gray）**：时间日期、真实电量、齿轮、出处和底部 App 入口。图标通过 currentColor 继承。
- **控件灰（control-gray）**：禁用文字、预览选择器及面板头边界、摘抄滚动条。
- **行线灰（row-line）**：仅用于应用/系统列表行，不放回首页。
- **浅反馈底（quiet-surface）**：按钮 hover 与滚动条轨道。
- **反字深底（inverse）**：临时反馈和文本选择；非首页强调按钮。
- **预览外围（preview-surround）**：浏览器纸页外背景，设备模式为白底。

**The Quiet Hierarchy Rule.** 正文用墨色和较大字号，操作以灰色小字陪衬；不增加首页分隔线或装饰来制造层级。

## Typography

**Display / Body / Label Font:** 同一 sans 系统栈。没有下载或附带字体，没有 @font-face。serif 栈仍在 CSS 根部声明，但当前 HTML 文字不使用；保留的锁屏题字是栅格图像，不是字体资产。

正文默认 excerpt，按宽度降为（28/26/22px）；最窄行高（1.9），其余（1.85），字距始终（.015em）。没有 short 类或按字符数量自动放大，短句与长句在相同窗口使用同字号。保留换行和长词折行，不改写正文。

时间默认（18px、400），使用 sans 和 tabular-nums，字距0；日期/星期（15px）。书名 cite 不倾斜，仅书名常显。换一则与底部 App 名称默认（13px）。面板亦改为 sans：标题（26px、normal 行高），原文与事实字段按 tokens 分层。系统字体可回退，不声称跨设备同形。

## Layout

纸页默认（758×1024 CSS px），首页纵向 Flex、内边距（28px 48px 24px）。小状态行最小高（48px）、无底线。中央摘抄区 flex:1、min-height:0、overflow-y:auto、底内边距（32px）；正文页最大宽（620px），默认顶内边距（140px）。正文、书名与换一则沿同一左边线；书名顶外边距（26px）、最大宽100%，换一则顶外边距（8px）。长内容在中央区域滚动，底部 App 保留。

状态行：时间按钮右外边距（18px）；日期后星期左距（10px）。真实电量可用时才显示，margin-left:auto、左内边距（16px）；未知时电量元素 hidden，紧邻的齿轮用 #battery[hidden]+#settings 的 margin-left:auto 保持最右。齿轮触摸宽（48px）、左外边距（12px）。不会显示假电量或额外“浏览器预览”电量文字。

footer 顶内边距（16px）；三 App 等分，无竖线和围框。入口最低高（80px），内边距（8px 0）；小 SVG 下外边距（9px）。面板独立全高滚动，默认内边距（28px 32px）；面板头可有1px边界，不属于首页装饰。

响应规则按源码叠加：

- **≤790px**：纸页宽100%，高 calc(100vh - 70px)、最低500px；首页（24px 36px 18px），状态字14px、时间17px、电量12px；正文28px、顶内边距128px。
- **≤620px**：首页左右30px，正文26px、顶内边距112px，书名14px。
- **≤420px**：首页（18px 26px 14px），状态12px、时间15px、电量10px；时间右距12px、星期左距6px，齿轮左距4px；正文22px/1.9、顶内边距104px；书名13px、顶外边距22px，换一则12px，App 名称12px、最低高76px。面板内边距24px。
- **高度≤850px / ≤660px**：正文页顶内边距分别覆盖为80px / 36px，不居中跳动。
- **?device**：隐藏外部预览条、白底、纸页100%宽与100vh高、外边距0；窄屏规则下最小高度0。这仍是浏览器模式，不是原生安装证据。
- 锁屏选择器显示原画完整图，object-fit:contain；不改变真实系统锁定状态。设备物理像素、CSS px和逻辑密度须区分。

## Elevation & Depth

无阴影、渐变、模糊、动画、轮播、额外纸纹或新位图。正文层次由字号、色阶、行距和留白表达。反馈条保留绝对定位，纸页左右及底距24px、白边2px，约5秒后直接清空。

浏览器时钟对齐下一分钟更新；原生桥已有系统广播更新时间的代码路径，但 v0.3 未部署到设备。旧版物理屏刷新、残影和耗电仍未验证，不因浏览器截图升级结论。

## Shapes

控件直角、透明底；首页没有大引号、页角、印记、题签或分隔框。App/设置 SVG 为1.5px细描边、fill:none、圆线帽和圆连接，颜色继承 currentColor。App 图标默认25px、≤420px为24px；齿轮默认22px、≤420px为20px。原生应用列表可用32px灰度实际位图，缺失时回退书形SVG。没有换条箭头图标。

## Components

### Excerpt / Source / Next

正文为 aria-live=polite。书名来源按钮左对齐，内边距0、最低高48px，只呈现书名；轻触打开出处。换一则为文字下划线，偏移4px，最低宽64px、高48px，内边距0。两者禁用文本选择和 touch callout。加载中禁用切换；失败可重新载入；空池保留明确空状态。

沿用本机463条、69本书的已授权筛选集，GET /api/excerpts 读本地数据，超时12秒；没有在线微信读书请求。普通下一条使用洗牌袋、本轮不重复且跨轮避免立即重复；Home 返回保留内存当前条目。localStorage只记上一条ID。隐藏回访动作可主动重访已看内容，不把“所有动作都不重复”作为承诺。

### Hidden Gestures

长按书名650ms随机选同书另一条；长按换一则650ms回上一条，最多保留50条内存历史。Shift+Enter在各按钮上执行对应动作。移动超过12px或移出/取消/抬起会取消尚未触发的长按；成功触发后吞掉随后一次普通click，避免再开出处或再换条。无同书候选或历史时动作返回false，没有新增提示标签。浏览器750ms真实按住测试已通过；这不是原生触摸验证。

### Source Panel

仅列相同原文、书名、作者、章节、划线日期、数据获取日期，以及“微信读书 · 我的划线”；缺字段用“未提供”。不再显示API endpoint、摘抄池统计、立场解释、真伪自述或防御性段落。真实来源仍保留在数据，界面只呈现事实。

### Status / Settings / Apps

时间可点开日期设置，齿轮有 aria-label 和 title。基本按钮最低48×48 CSS px；App 等分按钮显式 min-width:0，以实际容器分配宽度。三个常显小图标加名称，设备桥路径按已安装包名显示固定目标及全部应用；浏览器只提供预览反馈，不能真实启动设备 App。

应用行最低76px、上下18px左右8px内边距、细底线；系统行最低62px。返回按钮15px、下划线偏移4px。开面板聚焦返回按钮，回首页聚焦设置。现有系统列表和原桌面回退路径保留。

### Focus / Feedback / Preview

Tab 添加 keyboard 类，显示2px墨色焦点轮廓、偏移3px；触摸/鼠标移除该类。hover仅浅灰底，disabled为控件灰、默认光标且无hover底。无持续选中、pressed动画或新增输入表单。预览select最低高40px，是浏览器工具，非设备触摸下限。notice用role=status、aria-live=polite。

### Lock Artwork / Historical Evidence

锁屏保留 prototype/assets/specimen-lock-v1.png 与同名 provenance.json，交付副本 wallpapers/specimen-lock-v1.png；原画版本名v1不指归档桌面。原画由imagegen生成并编辑，SHA-256、参考和提示均在 specimen-lock-v1.provenance.json；本轮未生成新图或改图。

v0.2.2的 details-device.png（758×1024）是当时Sage前台截图，页角/日期/拾句等旧版元素的原生视觉ship已确认；设备安装versionCode=5/versionName=0.2.2、HOME和启动证据仍有效但不属于v0.3预览。新版触摸未重测、物理屏刷新/残影/耗电未验证。旧锁屏OEM“正在使用”与休眠接口无画面限制不变，浏览器锁屏预览不称为待机实拍。

## Do's and Don'ts

### Do:

- **Do** 先呈现摘抄正文，让时间和应用安静陪衬。
- **Do** 使用共同左边线和同一无衬线系统字体，长短正文同字号。
- **Do** 保留真实出处、主动切换、隐藏手势和键盘等价动作。
- **Do** 未知电量隐藏，并保持设置齿轮位于右侧。
- **Do** 区分v0.3浏览器比例预览与设备已安装v0.2.2的历史证据。

### Don't:

- **Don't** 把大时间、首页边线、大引号、页角、拾句印记或题签恢复到当前预览。
- **Don't** 按正文长度放大短句，或增加自动切换与装饰标签。
- **Don't** 在出处页加入防御性说明、立场解释或摘抄池统计。
- **Don't** 将私人摘抄复制到通用组件示例，使用明确占位文字。
- **Don't** 把浏览器截图或旧原生ship结论描述为v0.3已构建、安装或原生验收。

## v0.4.1 变更（2026-11-02）

已构建 versionCode 8 / 0.4.1，安装到 EPD106 并重设为默认 HOME。本轮只改排版与反馈，未改信息结构。

- **正文锚点**：`.excerpt-page` 顶内边距 140px → `24vh`。短句不再顶在页头，换条时首行落点固定（实测 y=358）。否掉了"垂直居中"方案：它会让起点随行数浮动。
- **底部主轴**：`#pinned>button` 由居中改为 `align-items:flex-start` + `padding:8px 0`，三个入口图标回到 x=43/268/494，与正文同一左线。
- **动作可见性**：「换一则」13px/#555 → 15px/#666（新增 `action-gray`），字宽 50→58px；书名 15→16；时间 18→17；状态行 15→14；面板标题 26→24。
- **光学对齐**：时间与日期共用 24px 行盒（基线重合）；齿轮 22→20 且 `justify-content:flex-end`，墨迹右缘 698→715 对齐页边 718；电量与齿轮间距 16→20；书名与换一则的间距改用 `align-items:flex-start` + 不对称内边距，实测 42/36。
- **反馈**：`button:hover` 收进 `@media(hover:hover)`；触屏改为 `:active` 时文字变墨色（EPD 上灰度比色块可靠、不残留）。
- **面板**：`.app-row` 左内边距 8→0；面板头底线 #777→#bbb；h1 26→24。
- **加载态**：「正在整理你的划线…」改为 `#bbb` 同尺寸占位，替换时原地由灰变墨。
- **图标**：入口宫格 9×9 → 10×10（外沿 3–29），与书本/书架图标的墨迹范围对齐。

**WebView 61 硬约束**：设备 WebView 为 Chrome 61，不支持 `clamp()`/`min()`/`max()`（Chrome 79+）。CSS 遇到不认识的函数是整条声明作废，不是降级——第一版锚点因此失效、正文退成 0 内边距。锚点最终用纯 `vh`。新增任何 CSS 前须核对 Chrome 61 支持表：flex `gap`(84)、`:is()`(88)、`scrollbar-width`(121)、`text-decoration-thickness`(89) 均不可依赖。

测量基线（758×1024 实机，同一段两行摘抄）：0.3.0 正文 217–312、书名 388、换一则 463、图标 x=140；0.4.1 正文 358–451、书名 493、换一则 547、图标 x=43。

## v0.6.0 变更（2026-11-02）

已构建 versionCode 10 / 0.6.0，安装到 EPD106（实测 572×773 CSS、dpr 1.325），默认 HOME 不变。

- **摘抄带时间**：`displayExcerpt` 在书名后追加 `<time class="excerpt-date">`（13px/#777，右对齐到页边）；`datetime` 用 `YYYY-MM-DD`。
- **状态栏阅读提示**：`#streak` 紧贴日期右侧（14px、行盒 24px、左距 22px）。取值规则：连续 ≥2 天写「已连续阅读 N 天」，当天首次写「今日已读」，无连续记录时退回「已累计阅读 N 天」。连续天数 = 微信读书 `daily` 与本地台账 `sage-read-days` 取并集（台账每次启动登记当天，上限 800 天）。
- **阅读档案重排**：`年度统计` 整块撤掉，换成 ①四项读数（读过/读完/阅读/笔记，单位小字上标）②阅读时长热图（6 年 × 12 月，四级灰度 #ccc/#949494/#575757/#151515）③一天之中 24 小时柱 ④兴趣分布前 5 类（细进度条）⑤最近一次划线。`常摘作者` 移除，作者只在出处页出现。
- **滚屏**：全局 `::-webkit-scrollbar{width:0;height:0}`、`*{scrollbar-width:none}`、`.device-mode{overflow:hidden}`，`.paper` 锁 `100vh`。真机上下滑动不再出条。
- **自适应**：新增 `fitExcerpt()`——先按 CSS 基准字号试排，溢出就 1px 递减（下限 18px），仍溢出再压 `.excerpt-page` 顶部锚点（下限 16px）。窗口 resize 时重算。长摘抄不再需要滚动。
- **壁纸**：四幅程序化「技术图版」取代植物插画——熵与秩序 / 洞穴与光 / 注意的窄门 / 误差与信念，附注记文案；植物原画与 provenance 移入 `archive/retired-botanical/`。
- **数据链路**：`tools/prepare-stats.py` 把微信读书统计折成 `.private/stats.json`（`/api/stats`，原生 resources 路由同名）；`tools/build-android.sh` 为脚本执行策略被拦时的构建入口——原生工具需 cd 到 `android/build` 后用相对 ASCII 路径，否则中文目录名被按 ANSI 解析成乱码。

## v0.8.1 变更（2026-11-02）

产品名改为 **QuiteSage**（包名 `com.sagepaper.launcher` 保留，否则会丢设备所有者授权与本地数据）。

- **锁屏轮播**：`SageActivity` 记住 `rotate`（默认开）与 `rotateIndex`；`ACTION_SCREEN_OFF` 广播触发 `rotateWallpaper()`，关屏时把下一幅写进系统壁纸（`FLAG_SYSTEM|FLAG_LOCK`），再亮屏即见，避免亮屏后二次刷新。进程冷启动时也补一次，保证重启后第一次进锁屏就有图。壁纸列表固定在 Java 侧四幅，设置面板里的开关写 Preference。
- **实时阅读天数**：`readerOpenedToday()` 先查 `UsageStatsManager`（今天零点起 `lastTimeUsed>=零点`，或事件流里出现该包的 `MOVE_TO_FOREGROUND`），取不到再退回「从桌面启动过微信读书」的本地记录。**今天没打开就显示 0 天**，不再用累计数兜底。台账 `sage-read-days` 只在确认打开时才登记。用量统计需要 `GET_USAGE_STATS`，由 `tools/deploy-android.cjs` 安装后 `appops set ... allow` 授权。
- **取消系统下拉**：新增 `SageAdmin extends DeviceAdminReceiver` + `res/xml/sage_admin.xml`；成为设备所有者后调用 `setStatusBarDisabled(true)`，顶部下拉不再唤出系统面板（实测焦点保持在 SageActivity）。未授权时退回沉浸式全屏（`IMMERSIVE_STICKY|HIDE_NAVIGATION`）。回退命令见 README。
- **状态栏合并**：原生 `deviceState()` 增加 `wifi`（0–4 级，依据 `WifiManager.calculateSignalLevel`），网页侧用三段弧线图元表示强度，0 级加一道斜线。电量、Wi-Fi、齿轮收在右侧一组。
- **修图片渲染**：`WebResourceResponse` 对 `image/*` 传了 `"UTF-8"` 字符集，WebView 61 按文本转码导致 PNG 全空白；改为二进制资源传 `null` 编码。
- **构建**：`aapt` 增加 `-S android/res`（设备管理员元数据）；产物改名 `QuiteSage.apk`；缺真实划线时自动回退占位数据。


## 当前版本补充：0.9.1（versionCode 22）

本节为追加记录；旧版本段落保留供追溯。首页入口现为「微信读书 / 阅读档案 / 纸上随记 / 全部应用」，旧阅读档案横条移除。首页摘录使用本地 QuiteSage Serif（Noto Serif SC 静态 450 字重子集，WOFF2 / OFL），UI 无衬线字体不变。CSS 常规字重槽加载该静态字体，不表示字体源为 400 字重。保持既有纸白、墨黑及灰阶界面。手写随记沿用同一工具与面板语言；不把截图验收等同于实机延迟或持久化认证。

当前实机、验证边界、未实现的 OEM 壁纸轮换及历史文档漂移以 [当前状态](docs/06-paper-notes-current.md) 为准。


## 当前版本补充：0.10.0（versionCode 24）

通用安装包首次显示明确空状态，提供「配置阅读数据」入口与可复制／分享的 Agent 说明。未导入前不展示作者摘录、示例阅读记录或虚构统计；用户主动导入后才显示本人内容。保持既有纸白、墨黑、灰阶和四导航，不引入手机／平板新布局。

首页摘录字体继续使用 QuiteSage Serif，源为 Noto Serif SC 静态 450 字重；当前公开 GB2312／标点子集为 1,384,608 字节，字集不取自个人数据。UI 无衬线字体不变。此记录取代前节的小型个人字集尺寸描述，不表示修改整体字体风格。

浏览器空状态与初始化截图已检查；最终 versionCode 24 未重新安装，不能沿用旧原生验收。数据来源、测试与设备限制见 [公开数据隔离说明](docs/07-public-data-isolation.md)。
