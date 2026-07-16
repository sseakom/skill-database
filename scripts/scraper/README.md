# 选技大乱斗 爬虫骨架

抓取第三方散文式攻略页 → LLM 辅助提取为 Hero 草稿 JSON（`verified: false`）→ 供人工校对。
**绝不直接灌库 / 覆盖 `src/data/*`**，草稿仅写入 `scripts/scraper/draft/`。

## 背景

游戏无官方结构化数据库（官网 slr.zggame.net 是纯落地页），英雄/技能数据散落在第三方攻略页。
本爬虫把这些页抓回来，切段后调 LLM 提取为结构化 Hero 草稿，所有草稿 `verified=false`，
需人工对照原文校对后，再手写为严格 `Hero` 入 `src/data/`。

## 用法

```bash
# 降级模式（无 LLM，仅输出文本切段草稿）
npx tsx scripts/scraper/index.ts

# LLM 模式
OPENAI_API_KEY=sk-xxx npx tsx scripts/scraper/index.ts
# 或 npm script
npm run scrape
```

## LLM 接口配置（环境变量）

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `OPENAI_API_BASE` | `https://api.deepseek.com/v1` | OpenAI 兼容 chat 接口 base |
| `OPENAI_API_KEY` | （无） | **必填才启用 LLM**；未配置则降级 |
| `OPENAI_MODEL` | `deepseek-chat` | 模型名 |

默认指向 DeepSeek。可换成任意 OpenAI 兼容服务（如 OpenAI 官方：base 改 `https://api.openai.com/v1`，model 改 `gpt-4o-mini`）。

> DeepSeek 默认不支持 `response_format: json_object`，故本爬虫改用「prompt 要求只输出 ```json 代码块 + 正则提取首个代码块」的方式解析，兼容性更好。

## 数据非结构化说明

- 目标源均为散文式攻略，无统一 schema，数值常缺失或矛盾。
- LLM 提取时**缺失字段填 `null`（数组填 `[]`）**，`verified` 恒为 `false`。
- 草稿 JSON 为 `HeroDraft`（Hero 的可空放宽版本），非严格 `Hero`：
  `baseStats`、`passive`、`ultimate`、`tier` 等均可为 `null`，以保留"未知"信号。

## 降级模式

未配置 `OPENAI_API_KEY` 时，自动跳过 LLM，把切段文本作为草稿输出：
- `draft/heroes-draft.json` 中每个英雄的 `description` 取切段原文前 300 字，其余字段为 `null`/`[]`。
- 控制台打印 `[降级] 未配置 OPENAI_API_KEY，仅输出文本切段`。
- LLM 模式下单段调用失败也会降级该段为文本草稿，不中断整体流程。

## 产出文件

```
scripts/scraper/draft/
├── heroes-draft.json     # Hero 草稿（verified:false），人工校对用
├── run-report.json       # 运行报告：每源抓取状态/耗时/切段数/英雄数
└── segments/             # 每英雄一段原文备查（含 mechanics 段）
    └── *.txt
```

## verified 校对流程

1. 跑爬虫得到 `draft/heroes-draft.json`（全 `verified:false`）。
2. 人工对照 `draft/segments/*.txt` 原文与 LLM 提取结果，逐字段校对/补全。
3. 校对通过后，将草稿手写为严格 `Hero`（填全 `baseStats` 等必填字段）写入 `src/data/heroes.ts`，置 `verified: true`。
4. UI 层据 `verified` 展示「数据待校对」标记。

## 目标源

| id | url | 类型 | 说明 |
| --- | --- | --- | --- |
| 233leyuan-heroes | 233leyuan.com/post-detail/... | hero-roster | 最结构化，6 英雄含天赋+大招+数值 |
| pp-news-heroes | wap.pp.cn/news/1148593.html | hero-roster | 8 英雄，禁用规则清晰 |
| 9game-tier-list | 9game.cn/news/6713841.html | hero-roster | 全英雄特性评级 |
| bilibili-mechanics | bilibili.com/read/cv39823932 | mechanics | 机制数值（升星/品阶） |

源配置见 `targets.ts`。抓取策略：UA + 15s 超时 + 重试 2 次 + 源间 1-2s 限流；某源被拦截（403/超时）记 failed 并继续跑其他源。

## 版权提醒

第三方攻略内容版权归原站/作者所有。本爬虫产出仅供**个人数据校对参考**，不得商用。
最终入库数据应由人工对照多源交叉校对后重写，不直接复制第三方原文。
