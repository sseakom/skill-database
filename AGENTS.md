# AGENTS.md — 选技大乱斗数据库 (skill-database)

> 给 AI 编码助手（Claude Code / Codex / Cursor / WorkBuddy / GitHub Copilot 等）的项目指引。
> 在对本仓库做任何修改之前，请先完整阅读本文件。

## 1. 项目概览

- **用途**：《选技大乱斗 / Skill Legends Royale》的**非官方社区数据图鉴**——英雄、技能、宝物、流派克制关系，以及搭配模拟器。数据仅供参考，部分数值待校对。
- **技术形态**：Next.js 16 App Router，**纯静态导出**（`next.config.ts` 中 `output: "export"`）。**没有后端、没有数据库、没有 API 路由、没有 Server Action**。
- **部署**：Vercel 原生支持；若部署到 GitHub Pages，需额外设置 `basePath`。
- **语言**：源码注释、UI 文案为**中文**；代码标识符（变量/函数/类型名）为**英文**。回复与注释保持中文。
- **构建产物**：`out/`（静态 HTML/JS/CSS），已被 `.gitignore` 忽略。

## 2. 技术栈

| 关注点 | 选型 |
| --- | --- |
| 框架 | Next.js `16.2.10`（App Router） |
| UI 库 | React `19.2.4` / react-dom `19.2.4` |
| 样式 | Tailwind CSS `v4`（`@tailwindcss/postcss`，`globals.css` 内 `@import "tailwindcss"` + `@theme inline`） |
| 类型 | TypeScript `5`（strict） |
| 工具函数 | `clsx` + `tailwind-merge`（`cn()`）、`class-variance-authority`、`lucide-react`（图标） |
| 爬虫 | `cheerio`、`tsx`（独立子系统，见 §9） |
| 规范 | ESLint `9` flat config（`eslint-config-next`） |

## 3. 目录结构

```
skill-database/
├── src/
│   ├── app/                     # App Router：路由与页面
│   │   ├── layout.tsx           # 根布局：Geist 字体、SiteHeader、页脚
│   │   ├── page.tsx             # 首页
│   │   ├── globals.css          # 主题 token（oklch 深色，shadcn 风格 CSS 变量）
│   │   ├── heroes/              # 英雄图鉴（page.tsx 列表 + [id]/page.tsx 详情）
│   │   ├── skills/              # 技能图鉴
│   │   ├── treasures/           # 宝物图鉴
│   │   ├── factions/            # 流派图鉴
│   │   ├── counter-chart/       # 克制图谱（可视化）
│   │   └── simulator/           # 搭配模拟器（"use client"）
│   ├── lib/
│   │   ├── types.ts             # 领域类型 + 常量（全应用地基）
│   │   ├── data.ts              # 数据访问层（唯一入口，派生 counteredBy）
│   │   ├── game-mechanics.ts    # 星级/等级/HP/属性 纯函数
│   │   ├── recommender.ts       # 流派推荐器（启发式）
│   │   └── utils.ts             # cn() 工具
│   ├── data/                    # 种子数据（手写，带 verified 标记）
│   │   ├── heroes.ts
│   │   ├── skills.ts
│   │   ├── treasures.ts
│   │   └── factions.ts
│   └── components/
│       ├── ui/                  # card.tsx、badge.tsx（shadcn 风格原语）
│       ├── site-header.tsx
│       ├── faction-badge.tsx
│       ├── codex/               # 图鉴详情组件（search-input, chip-filter, stat-bar, tier-badge, verified-mark ...）
│       ├── chart/               # counter-graph.tsx（克制图谱可视化）
│       └── sim/                 # 模拟器组件（skill-picker, treasure-picker, stat-panel-view, recommendation-panel ...）
├── scripts/scraper/             # 独立爬虫（Node/tsx，不进主构建，见 §9）
├── public/                      # 静态资源（svg 等）
├── next.config.ts               # output: "export" 静态导出
├── postcss.config.mjs           # Tailwind v4 接入
├── tailwind 配置（v4 走 CSS，无 tailwind.config.js）
├── tsconfig.json                # paths: @/* -> ./src/*
└── eslint.config.mjs            # flat config
```

## 4. 架构与数据流

- **类型是所有模块的地基**：`src/lib/types.ts` 定义了 `Hero / Skill / Treasure / Faction / BaseStats` 等，以及游戏常量 `STAR_THRESHOLDS`、`TIER_META`。新增字段务必先改类型，再改数据。
- **数据访问唯一入口**：UI 与逻辑**只通过 `@/lib/data` 的导出函数**（如 `getHeroes()`、`getFactions()`、`getSkillsByFaction()`）取数据，**不得**直接 `import` `src/data/*` 数组。
- **派生优于冗余**：`getFactions()` 会把 `factions[].counters`（A→B 表示 A 克 B）自动镜像派生出 `counteredBy`。`counteredBy` 是**只读派生结果**，**永远不要手写**。
- **纯函数可复用**：`game-mechanics.ts`（星级/等级/属性计算）与 `recommender.ts`（推荐）均为纯函数、确定性，便于模拟器、图鉴、未来测试复用。
- **渲染分工**：图鉴页是 Server Component（构建期读取 data 层直接渲染）；只有 `simulator` 是 `"use client"`（交互状态）。新增交互页才加 `"use client"`。

```mermaid
flowchart LR
  DATA[src/data/*.ts 种子] -->|data.ts 统一供给| LIB[@/lib/data]
  LIB -->|只读查询| PAGES[app/ 页面]
  LIB -->|派生查询| MECH[game-mechanics / recommender]
  MECH --> SIM[simulator 客户端]
  PAGES --> UI[components/*]
```

## 5. 领域模型与关键约定

- **`verified` 标记**：`Hero / Skill / Treasure / Faction` 均有 `verified?: boolean`。`false` 表示数值未官方校对（多为爬虫草稿估算）。UI 据此展示「数据待校对」。写入正式数据时应尽量置 `true`。
- **流派克制单一数据源**：`Faction.counters: string[]`（A 克 B）。`counteredBy` 由 `data.ts` 自动派生，**勿手写**。
- **游戏常量**（改动需谨慎，多处引用）：
  - 升星阈值：`STAR_THRESHOLDS = [2, 4, 6, 8]`（同流派技能数达阈值依次升 1~4 星）。
  - 品阶：`TIER_META` = 普通(cost 100/exp 1) / 稀有(200/2) / 传奇(300/3)。
  - 构筑上限（模拟器）：`MAX_SKILLS = 10`、`MAX_TREASURES = 3`（页面内与 `recommender.ts` 常量需保持一致）。
  - 英雄等级 = `1 + 全流派星级之和`；HP = `baseStats.hp + (level-1) * 100`。
- **能力对象**：`Ability`（name + description）；`Ultimate extends Ability`（可带 `damageType`）；`BaseStats`（hp/attack/attackSpeed/energy 必填，dodge/crit/critDamage 可选，缺省取 0/0/2.5）。

## 6. 开发命令

```bash
npm install              # 安装依赖
npm run dev              # 本地开发：http://localhost:3000
npm run build            # 静态导出到 out/
npm run start            # 预览构建产物（next start，非导出服务）
npm run lint             # ESLint（Next 16 已移除 next lint，直接用 eslint）
npm run scrape           # 运行爬虫（等价于 npx tsx scripts/scraper/index.ts）
```

> Next 16 不再有 `next lint` 子命令；lint 直接用根 `eslint`。

## 7. 编码与样式约定

- **路径别名**：一律用 `@/*`（→ `./src/*`），不要写相对路径穿透多层 `../../`。
- **类名合并**：组件内合并 Tailwind class 用 `cn(...)`（`@/lib/utils`），处理冲突与条件样式。
- **主题色**：只用 `globals.css` 中定义的 CSS 变量语义色（`bg-background` / `text-foreground` / `bg-card` / `text-primary` / `border-border` / `text-muted-foreground` ...），不要硬编码颜色（除流派强调色 `Faction.color` 这类数据驱动色）。
- **组件组织**：通用原语放 `components/ui/`；图鉴详情组件放 `components/codex/`；模拟器组件放 `components/sim/`；图谱放 `components/chart/`。
- **TypeScript 严格模式**：开启 `strict`。新增导出函数请标注返回类型；避免 `any`。
- **静态导出约束**：`images.unoptimized = true`，不使用服务端图片优化；图片走 `/public` 资源或外链 `imageUrl`。
- **图标**：统一用 `lucide-react`。

## 8. 如何新增 / 修改数据（最常见任务）

**新增英雄**（`src/data/heroes.ts`）：
1. 按 `Hero` 接口补全：`id`（kebab-case 唯一）、`name`、`factions`（流派 id 数组）、`passive`、`ultimate`、`baseStats`、`description`，并设 `verified`。
2. 确保引用的 `factions[].id` 真实存在（`data.ts` 仅做 `find`，不存在会静默 `undefined`）。

**新增技能 / 宝物 / 流派**：分别编辑 `skills.ts` / `treasures.ts` / `factions.ts`，严格对齐 `Skill` / `Treasure` / `Faction` 接口。
- 技能 `tier` 决定 `cost`/`exp`（见 `TIER_META`）；`faction` 必须是已存在的流派 id。
- 流派只需维护 `counters`（不要手动填 `counteredBy`），并给 `color`（克制图谱节点用）。

**校对流程**（来自爬虫草稿）：
1. 跑爬虫得到 `scripts/scraper/draft/heroes-draft.json`（全 `verified:false`）。
2. 对照 `draft/segments/*.txt` 原文逐字段人工校对/补全。
3. 校对通过后将草稿「手写」为严格 `Hero` 写入 `src/data/heroes.ts`，置 `verified: true`。

## 9. 爬虫子系统（scripts/scraper）

- **独立性**：`tsconfig.json` 用 `exclude: ["scripts/scraper"]` 排除主构建；爬虫自带 `scripts/scraper/tsconfig.json`，通过 `tsx` 直接运行，**不进入 Next 构建**。
- **运行**：
  ```bash
  npm run scrape
  # 或带 LLM：OPENAI_API_KEY=sk-xxx npx tsx scripts/scraper/index.ts
  ```
- **LLM 配置（环境变量）**：`OPENAI_API_KEY`（必填才启用 LLM）、`OPENAI_API_BASE`（默认 DeepSeek `https://api.deepseek.com/v1`）、`OPENAI_MODEL`（默认 `deepseek-chat`）。未配 key 自动降级为「仅文本切段草稿」。
- **产出**：`scripts/scraper/draft/`（已 gitignore）——`heroes-draft.json`、`run-report.json`、`segments/*.txt`。
- **🔴 铁律**：爬虫**只能写 `draft/`**，**绝不允许**直接覆盖/写入 `src/data/*`。入库必须由人工校对后手写入库（见 §8）。

## 10. 测试

- **当前没有任何测试框架**（无 Jest/Vitest/Playwright 配置）。
- 适合优先补测试的部分：`src/lib/game-mechanics.ts` 与 `src/lib/recommender.ts` 的纯函数（确定性、易断言）。若引入测试，建议 Vitest（与 `tsx`/TS 生态契合），并在 `package.json` 增加 `test` 脚本。

## 11. Agent 行为红线（务必遵守）

- ❌ 不要直接 `import` `src/data/*` 数组到组件/逻辑里——统一走 `@/lib/data`。
- ❌ 不要手写 `Faction.counteredBy`——它由 `counters` 派生。
- ❌ 不要让爬虫任何代码写入 `src/data/*` 或提交 `draft/`（已被 gitignore）。
- ❌ 不要引入后端、API 路由、数据库或服务端状态——本项目是纯静态导出。
- ❌ 不要修改 `STAR_THRESHOLDS` / `TIER_META` / `MAX_SKILLS` / `MAX_TREASURES` 等游戏常量而不同步所有引用点（页面与 `recommender.ts`）。
- ❌ 不要绕过 `verified` 标记把未校对数据伪装成已校对（`verified: true`）。
- ✅ 新增数据先改 `types.ts` 类型、再填数据；保持 `cn()` + 语义色 + `@/*` 别名等既有约定。

## 12. 常见 Agent 任务速查

| 任务 | 入口 |
| --- | --- |
| 加一个英雄 / 技能 / 宝物 / 流派 | `src/data/<对应文件>.ts` |
| 改某个列表/详情页展示 | `src/app/<模块>/` |
| 改星级/属性/等级算法 | `src/lib/game-mechanics.ts` |
| 改推荐逻辑 | `src/lib/recommender.ts` |
| 改克制/协同关系 | `src/data/factions.ts` 的 `counters` |
| 改主题色/样式变量 | `src/app/globals.css` |
| 跑数据抓取 | `npm run scrape`（产出仅 `draft/`） |
| 本地预览 | `npm run dev` → localhost:3000 |
