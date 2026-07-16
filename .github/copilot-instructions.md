# GitHub Copilot Instructions

本仓库的 AI 编码指引统一维护在根目录 **`AGENTS.md`**。

编写或修改本仓库代码前，请先阅读 [`AGENTS.md`](../../AGENTS.md)，并严格遵守其中的约定与红线，重点包括：

- 技术栈：Next.js 16 App Router，**纯静态导出**，无后端/数据库。
- 数据访问必须走 `@/lib/data`；种子数据在 `src/data/*`。
- 每个实体带 `verified` 标记；流派 `counteredBy` 由 `counters` 自动派生，勿手写。
- 爬虫 `scripts/scraper` 仅产出 `draft/`，**禁止**写入 `src/data`。
- 样式使用 `globals.css` 的语义 CSS 变量与 `cn()`，路径一律用 `@/*` 别名。

具体目录结构、开发命令与常见任务入口见 `AGENTS.md`。
