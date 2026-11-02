# QuiteSage

一个给墨水屏阅读器写的桌面（Android Launcher）。一屏一则划线，安静，不打扰；把「再读一点」变成开机就能看到的事。

代码是 HTML/CSS/JavaScript 跑在 WebView 里，外加一层精简的原生桥（启动应用、设置壁纸、读设备状态）。目标设备是 Android 8.1 的墨水屏阅读器，实测分辨率 758×1024（CSS 视口 572×773，dpr 1.325）。

当前版本为 **0.10.0（versionCode 24）**，继续面向墨水屏设备。首次安装为空，由每位使用者在自己的 Agent 环境配置官方 Skill，再主动导入本人的阅读数据。手机／平板的专门版本后续另开分支。

## 界面

**首页**：顶部一行状态栏（时间 · 日期 · 连续阅读天数 · 电量 · Wi-Fi），中间是当天随机推送的一条真实划线，下面是书名与划线日期、一个「换一则」；底部依次为「微信读书 / 阅读档案 / 纸上随记 / 全部应用」。摘抄正文使用嵌入的宋体子集，系统控件保持无衬线字体。

**阅读档案**：四项读数（读过 / 读完 / 阅读 / 笔记）、阅读时长热图（按年 × 月）、一天之中的时段分布、阅读兴趣分布、最近一次划线。

**锁屏壁纸**：四幅程序化绘制的单色图版——熵与秩序 / 洞穴与光 / 注意的窄门 / 误差与信念。EPD106 的原生休眠图权限与 Android 标准壁纸不同；目前通过设备原生设置手动切换，自动轮播未实现。

**纸上随记**：手写纸页，提供书写、整笔橡皮、撤销、清页、保存与删除；笔迹及草稿仅保存在本机。

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

构建始终使用空数据白名单，与 `.private` 是否存在无关。两种构建入口都走相同流程；旧构建目录不会被复用为资源输入。通用 APK 不含作者或任何使用者的划线、统计和认证信息。签名密钥保存在 `.private/sage-development.jks`，首次构建会生成本机开发密钥；已有设备覆盖安装需保留原签名。

设置本机 `ANDROID_SDK`（或 `ANDROID_HOME`）和 `JDK_BIN`（或 `JAVA_HOME`）后构建。PowerShell 可运行 `tools/build-android.ps1 -AndroidSdk <SDK目录> -JdkBin <JDK的bin目录>`。构建完执行：

```bash
python tools/audit-public-apk.py android/build/QuiteSage.apk
node --test tests/public-data.test.cjs
```

审计要求 APK 精确匹配公开资源白名单、零划线、零账户统计，且不存在密钥特征。不要继续分发 0.9.1 及更早的个人数据构建。


## 给使用者及其 Agent：初始化阅读数据

每个使用者都必须在**自己的环境、自己的账户**下完成以下流程。安装 APK 不会连接作者账户，也不会自动读取设备微信读书 App 的登录凭据。首次可先打开微信读书或使用纸上随记，阅读数据未配置时保持明确空状态。

### 1. 拉取项目，阅读官方 Skill

由使用者把本仓库交给自己的 Agent。Agent 先读取腾讯官方文档及当前接口说明：

- [Tencent/WeChatReading](https://github.com/Tencent/WeChatReading)
- [官方 Skill 主说明](https://github.com/Tencent/WeChatReading/blob/main/skills/SKILL.md)

按官方当前安装方式安装：

```bash
npx skills add Tencent/WeChatReading -g
```

如果官方文档发生变化，以官方最新文档为准，不沿用仓库作者的凭据、原始响应或缓存。

### 2. 让使用者认证本人账户

由**使用者本人**前往 [微信读书 Skills](https://weread.qq.com/r/weread-skills) 获取绑定本人账户的 API Key。Agent 引导其通过本机安全输入或环境配置设置 `WEREAD_API_KEY`。不要把真实密钥写进 README、聊天记录、前端、Git、APK 或导出文件。

只在取得该使用者授权后，按官方 Skill 只读获取其书架、划线与阅读统计。不得发布／修改／删除内容。核对账户来源；接口失败应报出原因，不能改用作者数据、示例数据或把缺失数值补成 0。

### 3. 整理数据，保留真实来源

把该账户真实获取的结果规范为 `excerpts.json` 和可选的 `stats.json`，保存在使用者自己的私有目录中。划线保留原文与书籍元数据；不把单次划线解释为使用者立场。没有来源的字段保持缺省，未获取统计则整个 `stats` 为 `null`。

**导入协议 v1** 的完整外层：

```json
{
  "schemaVersion": 1,
  "source": "weread-skill",
  "exportedAt": "实际导出时间的ISO 8601字符串",
  "ownerLabel": "可选的本机显示名称",
  "excerpts": {"fetchedAt": "实际获取时间", "excerpts": []},
  "stats": null
}
```

`excerpts.excerpts` 每条必需 `id`、`text`、`title`、`author` 字符串；`id` 不重复，`text` 是真实划线。可选 `bookId`、`chapter`、`createdAt`（Unix 秒）和 `evidence.fetchedAt`（ISO 日期）。上面的空数组是格式说明，不是让 Agent 生成占位摘抄。

可选 `stats` 支持：

| 字段 | 形式及语义 |
| --- | --- |
| `fetchedAt` | 真实获取时间 |
| `totalReadTime` | 累计阅读秒数；不知道则省略 |
| `readStat` | `[{"label":"指标名称","value":"API返回的真实读数及单位"}]` |
| `years` | `[{"year":整数年份,"level":[12个0至4整数]}]`，从真实月数据计算灰阶 |
| `hours` | 24 项真实累计小时分布数值；不可用则省略 |
| `daily` | `YYYY-MM-DD` 到真实时长或真实阅读标志的映射 |
| `categories` | `[{"title":"真实分类","hours":实际小时数}]`；推导值需在 Agent 的交付说明中注明依据 |

最多 5 MB、10000 条划线。文件禁止包含 API Key、Token、Cookie、密码或原始鉴权响应。

### 4. 导出文件，不重打 APK

如果已经得到上述规范文件，Agent 可使用项目工具包装与检查：

```bash
node tools/export-reading-data.cjs --excerpts .private/excerpts.json --stats .private/stats.json --out .private/quite-sage-data.json
```

没有统计时省略 `--stats`。工具只读取命令中**明确指定的本人文件**，不自动查找账户、调用接口或扫描作者目录。`.private` 是各使用者自己的私有工作目录，不在 Git 中。

### 5. 让使用者在设备上主动导入

将 `quite-sage-data.json` 交给该使用者，选择 QuiteSage「配置阅读数据」或「设置 → 阅读数据 → 导入阅读数据」。应用使用系统文件选择器，只接收选定的数据文件；先校验，再原子替换。取消或失败保留原数据。更新数据也走相同步骤。

「移除本机阅读数据」可断开本机的数据配置，纸上随记保留。导出文件不加入仓库，不编进 APK；同一个通用 APK 可分发给不同使用者，每人导入各自数据。应用离线显示上次导入内容，不会自动同步微信读书 App 当前登录身份；更换账户需移除旧数据并重新配置／导入。

应用内置同一份可复制／分享的 [Agent 配置说明](prototype/agent-setup.txt)；更详细边界见 [数据协议文档](docs/reading-data-format.md)。

## 安装

```bash
adb install -r android/build/QuiteSage.apk
# 仅在使用者主动选择设为默认桌面时运行：
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

## USB 连接排错

先确认设备已开启 USB 调试并授权这台电脑。连接后可将所选阅读器的 USB 功能切为纯 ADB：

```powershell
powershell -ExecutionPolicy Bypass -File tools/adb-connect.ps1 -Serial <设备序列号>
```

脚本只操作指定阅读器，不修改 Windows 驱动、不禁用其他 MTP/WPD 设备，也不尝试 Root。只有一台已授权的设备时可省略序列号。USB 未枚举时需先检查连接或重启阅读器；切换功能不能修复所有连接故障。

## 本地预览

```bash
node prototype/server.cjs
# http://127.0.0.1:4173/?device=1
```

服务只监听 127.0.0.1，白名单式路由，不暴露 `.private` 下的任何路径。

## 数据与隐私

开发者自己的采集数据与签名密钥保存在本机 `.private/`，不进 Git。每位使用者导入的数据保存在其 Android 应用沙箱，纸上随记另行保存在本机；安装包不含任何人的阅读数据。仓库里的四幅壁纸是程序生成的单色图版，不含个人内容。

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
