# USB 设备检测与技术预研

检测日期：2026-11-01。来源：USB ADB 只读命令，不是产品宣传规格。没有 Root、安装、卸载、HOME 切换或设置修改。

| 项目 | 实测值 |
|---|---|
| 型号 / 设备名 | EPD106 / virgo-perf1 |
| 厂商属性 / MTP 名称 | Allwinner / MiDuoKanReader |
| Android | 8.1.0，API 27 |
| 物理像素 | 758 × 1024，当前 rotation=0 |
| 逻辑密度 | 212 DPI；不等同物理面板 PPI |
| 当前应用区域 | dumpsys display override：758 × 960；随系统栏和窗口变化 |
| 系统显示模式 | 单一 758 × 1024、16 fps；不能据此推定墨水屏波形、局刷和实际响应速度 |
| 内存 | MemTotal 938756 kB，约 917 MiB；检测时 MemAvailable 564812 kB，仅为瞬时值 |
| 微信读书 | com.tencent.weread.eink，1.9.6，versionCode 10244515 |
| 应用启动 Activity | com.tencent.weread.LauncherActivity，来自该包的 LAUNCHER 声明 |
| URI 接收声明 | VIEW；weread、http、https；weread.qq.com。只证明有接收声明，尚未验证真实书籍链接能直达 |
| 当前 HOME | cn.modificator.launcher/.Launcher；包名不足以证明其安装来源或默认桌面可切换性 |
| WebView | com.android.webview 61.0.3163.98，需按旧内核验证原型兼容性 |
| 导航方式 | navigation_mode 返回 null，不能据此判定按键或手势；需实机确认 |

读取命令：getprop（型号/版本/相关显示属性）、wm size、wm density、dumpsys display、settings get secure navigation_mode、settings get system user_rotation、pm list packages（定向筛选）、dumpsys package（微信读书及 WebView）、dumpsys window policy、cmd package resolve-activity（MAIN+HOME）、/proc/meminfo。

## 对后续原型的约束

设备参数独立配置。758×1024 为物理预览模式，实际应用可用区域与 CSS viewport 需分别测量；不能把物理像素直接当成 dp/CSS px。保留系统栏安全区，至少 48dp 的主要触摸目标。静态排版、无持续动画、不轮询；不依赖现代 CSS Grid 特性、ES modules 或新浏览器专用 API。必要时使用兼容脚本与 Flexbox，并在 WebView 61 环境验收。

## Launcher 初步可行性（非最终结论）

Android 平台支持通过 MAIN + CATEGORY_HOME 声明桌面候选，见 [Intent 官方文档](https://developer.android.com/reference/android/content/Intent#CATEGORY_HOME)。当前默认 HOME 已识别，但尚未验证固件是否限制安装第三方 APK/默认选择器；须后续用户授权后做可回退测试。当前不开发 APK。

| 路线 | 初步适配判断 | 尚需验证 |
|---|---|---|
| 原生 Launcher | 可使用系统布局及 Intent；资源开销可能较低，是当前硬件的优先候选 | 固件默认 HOME 选择、中文字体、实际内存与刷新效果 |
| WebView + HTML | 可以复用原型，但仍需要原生 Activity 承载 HOME/系统交互 | 旧 WebView 兼容性、启动延迟、内存、网络异常与安全隔离 |
| 混合 | 原生处理 HOME、系统入口、受限 Intent；HTML 仅呈现阅读内容 | 桥接最小权限、仅加载可信本地内容、通信边界与离线策略 |

以上性能判断是待测工程判断，不是已测结果。WebView 依据：[Android 官方说明](https://developer.android.com/develop/ui/views/layout/webapps/webview)。HTML 不能独立替代 Android HOME 声明；WebView 外壳仍需原生部分。

后续测试包括：真实 API readerLink 对墨水屏版的解析与启动（不自行拼接 URL）；返回 HOME；安全的 App 回退入口；系统 Wi-Fi/亮度入口；断网快照与陈旧数据提示；进程回收后的恢复；局刷/全刷实机观察。时钟按分钟或用户唤醒更新，电量用事件更新；网络同步由用户触发或低频后台任务，不在网页持续轮询。
