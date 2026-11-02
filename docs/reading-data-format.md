# 个人阅读数据初始化（0.10.0 起）

通用 APK 永不内置个人阅读数据或示例阅读记录。构建与浏览器预览默认均为空；`.private` 即使包含完整阅读快照也不会被自动打包。每台设备仅使用使用者主动导入的数据，手写随记独立保存。

## 使用者

在 QuiteSage 选择「配置阅读数据」或「设置 → 阅读数据」，复制或分享配置说明给自己的 Agent。按腾讯官方 Skill 文档在自己的 Agent 环境完成本人账户认证，再让 Agent 导出 `quite-sage-data.json`，通过系统文件选择器导入。APK 不接受 API Key，不复用作者账户，也不读取微信读书 App 的登录凭据。以后更新同样重新导入；「移除本机阅读数据」保留纸上随记。

给 Agent 的完整说明与数据格式在 [agent-setup.txt](../prototype/agent-setup.txt)。官方 Skill：[Tencent/WeChatReading](https://github.com/Tencent/WeChatReading)。认证文件和原始响应仅留在使用者自己的环境。

## Agent 导出

获取并规范化本人数据后，可在用户自己的环境执行：

```bash
node tools/export-reading-data.cjs --excerpts <本人的excerpts.json> --stats <本人的stats.json> --out quite-sage-data.json
```

`--stats` 可省略；缺失统计为 null，不用 0 代替未知。导出工具不调用账户接口，也不自动查找 `.private`。导出文件供用户本人导入设备，不加入 Git 或 APK。

协议版本 1：

```json
{"schemaVersion":1,"source":"weread-skill","exportedAt":"ISO 8601实际导出时间","ownerLabel":"可选显示名","excerpts":{"fetchedAt":"ISO 8601实际获取时间","excerpts":[]},"stats":null}
```

字段、记录格式与限制见应用内同一份配置说明。最多 5 MB、10000 条划线；拒绝认证字段、密钥特征、无效统计或重复 ID。文件先完整校验再原子替换；取消或导入失败保留旧数据。数据保存在各自 Android 应用沙箱，不跨设备同步。导入行为仅表明用户选择该文件，APK 无法替代官方 Skill 验证导出者账户，因此 Agent 必须核对本人身份。

## 发布检查

```bash
bash tools/build-android.sh
python tools/audit-public-apk.py android/build/QuiteSage.apk
```

Bash/PowerShell 共用空数据白名单打包流程，每次创建全新资源暂存目录。旧个人构建不得继续分发。开发者如需本地查看本人数据，必须显式设置 `SAGE_DATA_BUNDLE` 指向本人导出的协议文件再启动预览服务器；不设该变量时总是空状态。

微信读书入口按本机已安装且可启动的普通版／墨水屏版解析。此修复继续服务墨水屏端，不包含手机或平板的专门布局。
