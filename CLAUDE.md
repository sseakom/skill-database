# CLAUDE.md

本项目的 AI 编码助手指引统一维护在根目录 **`AGENTS.md`** 中。

在对本仓库做任何修改之前，请先完整阅读 [`AGENTS.md`](./AGENTS.md)——它包含架构、技术栈、目录结构、数据纪律（verified 标记、counters 单一数据源）、开发命令、编码约定，以及 Agent 行为红线。

摘要：
- Next.js 16 App Router，**纯静态导出**（`output: "export"`），无后端/数据库。
- 数据只读 `@/lib/data`；种子数据在 `src/data/*`。
- 爬虫 `scripts/scraper` 只写 `draft/`，**绝不**写 `src/data`。
