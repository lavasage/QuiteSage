# 第一阶段：微信读书能力核查（认证实测前）

核查日期：2026-11-01。当前内容区分“官方文档支持”与“账号实测可用”；未验证的字段不能视为账号已有数据。

## 来源与连接

- [腾讯官方仓库](https://github.com/Tencent/WeChatReading)
- [认证入口](https://weread.qq.com/r/weread-skills)：用户取得绑定身份的 API Key。
- 官方安装命令：`npx skills add Tencent/WeChatReading -g`；本项目目前本地取回并使用官方说明，未执行全局安装。
- [SKILL.md](https://github.com/Tencent/WeChatReading/blob/main/skills/SKILL.md)：POST `https://i.weread.qq.com/api/agent/gateway`；Bearer 认证；业务参数放 JSON 顶层，每次携带 `skill_version`，当前源码版本为 1.0.5。
- 认证后先请求 `/_list` 核对实际目录；出现 `upgrade_info` 必须暂停并核查官方升级信息。接口响应经过字段裁剪，文档未承诺完整历史、固定限流额度或所有字段必返。

## 文档能力矩阵

| 数据 | 接口及来源字段 | 可用性与限制 |
|---|---|---|
| 书架及书单 | `/shelf/sync`：books、albums、mp、archive | 文档支持；文章收藏只有入口，没有文章正文；电子书与有声书分开，专辑“完结”不是用户“读完” |
| 书籍元数据 | `/book/info`：title、author、category、wordCount、publisher、cover 等 | 条件缺失保留未知，不从书名填补事实 |
| 阅读状态及进度 | `/book/getprogress`：book.progress、isStartReading、finishTime；书架 finishReading | progress 为 0–100 整数；个人标记、实际进度分别保存；缺失不能推为未读，冲突不能覆盖 |
| 最近阅读与单书时长 | progress 的 updateTime、recordReadingTime；书架 readUpdateTime | 最近时间不等于完整逐次阅读事件；时长单位秒 |
| 累计与周期统计 | `/readdata/detail`：weekly、monthly、annually、overall；totalReadTime、readDays、readTimes、dailyReadTimes | 字段条件返回；总时长可能含收听；readLongest 最多 10 条且过滤低时长，不是完整阅读书单 |
| 时段偏好 | preferTime、preferTimeWord | 24 桶从 06:00 至次日 05:00；数据不足时文案可能缺失；不能还原每次阅读起止 |
| 分类与作者偏好 | preferCategory、preferAuthor | 分类可能补默认占位；作者有阈值；val 是相对最高类别的权重，不是总量占比；preferAuthor.readTime 是格式化字符串 |
| 笔记概览 | `/user/notebooks`：books、sort、hasMore | lastSort 游标分页，直到 hasMore=0；有笔记书籍未必仍在书架 |
| 划线原文 | `/book/bookmarklist`：updated[].markText、bookmarkId、chapterUid、createTime | 当前过滤书签，只导出划线；不能用概览计数当作导出内容数 |
| 个人想法及书评 | `/review/list/mine`：reviews[].review.content、abstract、createTime、reviewId | bookid 小写；synckey 分页；包含划线想法、章节点评、整本书评；并非所有内容都有原文位置 |
| 公开他人点评 | review.md 所列公开点评接口 | 与本人表达严格分开，画像不当作本人立场；当前无需拉取 |
| 推荐及跳转 | `/book/recommend`、`/book/similar`；readerLink、deepLink、reason | 只使用返回的链接，不拼接私有 scheme；默认优先从现有书架提出机会，新书推荐为辅助 |

详细字段依据：[book.md](https://github.com/Tencent/WeChatReading/blob/main/skills/book.md)、[shelf.md](https://github.com/Tencent/WeChatReading/blob/main/skills/shelf.md)、[notes.md](https://github.com/Tencent/WeChatReading/blob/main/skills/notes.md)、[readdata.md](https://github.com/Tencent/WeChatReading/blob/main/skills/readdata.md)、[discover.md](https://github.com/Tencent/WeChatReading/blob/main/skills/discover.md)。

## 不能承诺的内容

完整逐次阅读活动、每本书每天的完整时长、完整历史书架变更、书签内容、文章收藏正文、已删除内容，以及所有周期均有完整明细。单个最近阅读时间不能证明并行阅读或中断原因。阅读偏好不等同思想立场，划线不等同赞同。

长短篇偏好需要字数与实际读完证据；完成率必须说明样本、未知项及已移出书架导致的选择偏差。思想关联属于可纠正的模型推断，引用须能回到真实记录及位置。

## 数据记录约定

每次请求保存接口、非敏感参数、Skill 版本、fetchedAt、原始响应。业务字段后续记录原始 JSON 路径、源记录 ID、源更新时间（缺失为 null）、获取时间、可用状态（available/missing/unsupported/error），不把抓取时间当成内容更新时间。

分析分三层：API 原值、可复算的派生统计、模型推断。缺字段显示未知或隐藏；不补零，不捏造数据。分页中止必须标注 partial。日期按 Asia/Shanghai 展示。

## 授权

用户已授权本地只读获取、保存与当前对话分析（含私密条目与笔记）。认证仍需有效 Key；该授权不包括公开发布数据、修改微信读书内容、安装 APK 或变更系统。
