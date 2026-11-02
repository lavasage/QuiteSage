# 0.10.0：公开安装包与个人阅读数据隔离

当前版本为 0.10.0（versionCode 24），继续面向墨水屏。手机／平板专门分支尚未创建。初始化步骤以 [README](../README.md) 为主，字段与导出边界见 [阅读数据协议](reading-data-format.md)。

## 修复与数据来源

此前个人 APK 曾在其他使用者设备显示作者阅读数据。当前 Bash 与 PowerShell 构建共用全新资源暂存及公开资源白名单，无论 `.private` 是否存在，通用 APK 均为零划线、零账户统计，不内置示例记录。旧两份个人 APK 与旧资源目录已隔离至本机 `.private/legacy-personal-apks`；不得继续分发旧个人 APK。二进制与私有文件不纳入 Git。

每位使用者在自己的 Agent 环境阅读 [腾讯官方 Skill](https://github.com/Tencent/WeChatReading/blob/main/skills/SKILL.md)，认证本人账户并导出协议 JSON。应用提供可复制／分享的配置说明；密钥、Cookie、Token、原始鉴权响应不进入 APK 或导出文件。应用不读取微信读书的登录凭据，也不会自动同步其当前账户。Agent 必须核对数据确实属于本人，导入文件本身不能证明账户身份。

仅通过使用者主动选择的系统文件选择器（SAF）导入 JSON，最多 5 MB、10000 条划线。原生校验拒绝认证字段、密钥特征、重复 ID 和无效统计，再通过私有 AtomicFile 原子替换；取消或失败保留旧数据。清除阅读数据保留纸上随记。未知统计保持缺省或 null，不能用虚构的 0 填补。

默认浏览器预览亦为空；仅显式设置 `SAGE_DATA_BUNDLE` 才会读取指定的本地协议文件。最终摘录字体为 Noto Serif SC 静态 450 字重公开 GB2312／标点子集（1,384,608 字节），字符选择不依赖个人阅读数据。

## 设备与部署边界

微信读书入口解析本机已安装且可启动的普通版或墨水屏版。当天 USB 连接的手机为 Android 16 V2464A，安装的是普通版 `com.tencent.weread`；保留原 `bbk` HOME。默认部署不设 HOME 或授予使用情况访问权限，需显式参数才执行相应操作。

EPD106 自动休眠壁纸轮换仍不支持；其他设备亦默认禁用自动壁纸，不自主改变手机壁纸。

## 已有证据与限制

- 5 项 Node 回归测试、19 项 Java ReadingDataStore 校验用例通过；Java 用例使用主机 JSON 运行环境。
- 最终公开 APK 审计通过：资源符合公开白名单，零划线、零账户统计。
- 浏览器空状态与初始化截图为 `.impeccable/review/privacy-empty-572.png`、`privacy-setup-572.png`、`privacy-empty-758.png`、`privacy-setup-758.png`。它们不是原生设备截图。
- 候选 versionCode 23 曾安装，用户反馈「很好」后拔线；最终 versionCode 24 未再次安装。当天未连接 EPD106，不能宣称最终 APK 已完成墨水屏原生验收或 SAF 端到端自动验证。

本页只记录当前修复，不回写历史验收结论。README 尾部旧版状态、DESIGN 早期版本及 sidecar 的历史描述不构成 0.10.0 的安装或功能证据。界面复核另由 `privacy_init_finish_review` 给出结论；提交与推送状态以主任务最终结果为准。
