# QuiteSage 0.9.1 当前实机状态

本页记录 2026-11-02 会话确认的当前状态，优先于旧版文档中的安装版本、导航和壁纸轮换描述；历史文件保留供追溯。

## 已安装界面

当前实机为 QuiteSage 0.9.1（versionCode 22），已核验包信息、默认 HOME 和前台应用。底部入口为「微信读书 / 阅读档案 / 纸上随记 / 全部应用」，首页旧阅读档案横条已移除。

首页摘录使用本地 QuiteSage Serif：Noto Serif SC 的静态 450 字重子集，WOFF2 共 286,868 字节、1,669 字，字体及 OFL 许可证位于 `assets/fonts`。CSS 以常规字重槽声明此静态文件；UI 控件继续使用既有无衬线字体。保持纸白、墨黑和灰阶层次，不新增视觉风格。

纸上随记实现位于 `prototype/notes.js`，提供书写、整笔橡皮、撤销（书写历史上限 30）、二次确认清页、保存、编辑、删除及草稿。存储键为 `sage-ink-notes-v1` 和 `sage-ink-draft-v1`；旧文字随记键保留并可读取。本记录未读取用户私密笔记。

## 验证范围

用户明确反馈其他功能已测试正常，当前任务重点为壁纸轮换。原生截图 `.impeccable/review/paper-home-native.png`、`paper-notes-native.png`、`paper-ink-empty-native.png` 经界面与代码复核可交付；这不构成触笔延迟或持久化性能认证。自动持久化测试因用户同时书写而中止，不宣称完整自动保存测试通过。

## 壁纸：单图有效，轮换未实现

当前 OEM 属性 `persist.sys.mogu.wallpaper` 为 `data/mogu/68595411.png`，对应「误差与信念」；用户已确认物理屏幕显示正确。Android 标准 WallpaperManager 并非该设备 OEM 休眠图接口。

OEM MoguWallPaper 的 `setCustomWallPaper` 写入 `/data/mogu`，普通应用和 adbd 均受 SELinux 限制而无法写入。PowerManagerService 所在 system_server 无法解码读取 `/sdcard`（EACCES）、应用私有目录（app_data_file AVC）或 `/data/local/tmp`（shell_data_file AVC）中的实验图。因此当前权限下原生自动轮换和 ADB 会话轮换助手均不可用。灰度 PNG 转换为 RGB PNG 的实验没有解决权限问题，不能把编码认定为根因。

0.8.2–0.8.4 为实验版本；0.8.5 禁用不安全的 OEM 自动播放，当前 0.9.1 保持禁用。所有实验文件已清理，应用目录权限恢复为 700。四张实际主题图保留；旧 `SagePaper-Specimen.png` 与重复 `QuiteSage-current.png` 已移除。没有 Root、SELinux 或系统分区修改；纯 USB 通道经核验为 ADB，不依赖 MTP。

## 其他设备状态与历史漂移

`com.jd.app.reader`、`com.duokan.einkreader`、`com.zhangyue.read.iReader` 仅对用户 0 卸载，系统分区保留；备用 HOME `cn.modificator.launcher` 保留。

旧 PRODUCT.md、DESIGN.md 及设计 sidecar 含旧版本、旧导航、旧摘录字体或已实现轮换等历史描述。本次仅记录已确认现状和摘录字体变更，不进行全面文档重写，也不将历史矛盾确认为当前设计规则。
