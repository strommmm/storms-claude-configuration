# @stormhwdev/claude-config

Claude Code Agent Team 研发规范配置包。通过 `npx` 一键安装 agents、rules、templates 到 `~/.claude/`，并将项目级 `CLAUDE.md` 应用到任意项目。

## 这是什么

一套为 Claude Code 设计的**多 Agent 协作研发规范**，包含：

- **7 个专业 Agent** — 覆盖产品、架构、开发、测试全流程
- **8 条编码规则** — 统一团队的代码风格、测试、安全等实践
- **11 个文档模板** — 标准化 PRD、契约、架构设计等文档输出
- **项目级 CLAUDE.md** — 定义完整的 Agent Team 研发流程规范

### Agent 团队

| Agent | 角色 | 职责 |
|-------|------|------|
| `product-manager` | 产品经理 | 编写 PRD，梳理需求 |
| `domain-expert` | 业务领域专家 | 提供领域知识，参与领域建模 |
| `interaction-designer` | 交互设计专家 | 产出 HTML/CSS 交互原型 |
| `backend-architect` | 后端架构师 | DDD 领域建模、模块拆分、契约定义 |
| `backend-developer` | 后端开发工程师 | TDD 模块开发、接口实现 |
| `frontend-developer` | 前端开发工程师 | 页面开发、API 对接 |
| `integration-tester` | 集成测试专家 | 集成测试、回归测试 |

### 编码规则

| 规则文件 | 内容 |
|----------|------|
| `coding-style.md` | Go 代码风格（gofmt、接口设计） |
| `testing.md` | Go 测试规范（table-driven、race detection） |
| `patterns.md` | Go 设计模式（functional options、DI） |
| `security.md` | 安全实践（secret 管理、context 超时） |
| `git-workflow.md` | Git 工作流与 commit 规范 |
| `performance.md` | 模型选择策略、上下文管理 |
| `agents.md` | Agent 编排与并行任务策略 |
| `hooks.md` | PostToolUse 钩子配置 |

### 文档模板

| 模板 | 用途 |
|------|------|
| `PRD.md.tpl` | 产品需求文档 |
| `prd-feature.md.tpl` | PRD 功能需求明细 |
| `contracts.md.tpl` | 模块接口契约 |
| `design-overview.md.tpl` | 模块设计概览 |
| `feature.md.tpl` | 功能详细设计 |
| `module-dependencies.md.tpl` | 模块间依赖关系 |
| `service-dependencies.md.tpl` | 跨服务依赖关系 |
| `topology.md.tpl` | 项目拓扑与路径映射 |
| `lifecycle.md.tpl` | 分支生命周期跟踪 |
| `lifecycle-archive-index.md.tpl` | 迭代归档索引 |
| `changelog.md.tpl` | 模块变更日志 |

## 安装

### 方式一：npx（推荐）

```bash
# 安装用户级配置到 ~/.claude/
npx @stormhwdev/claude-config init

# 在目标项目中应用 CLAUDE.md
cd your-project
npx @stormhwdev/claude-config apply
```

### 方式二：clone + install.sh

```bash
git clone <repo-url>
cd claude-config
./install.sh
```

## CLI 命令

| 命令 | 说明 |
|------|------|
| `init` | 安装/更新用户级配置（agents、rules、templates、settings）到 `~/.claude/` |
| `apply` | 将 `CLAUDE.md` 模板复制到当前目录 |
| `status` | 查看配置安装状态 |
| `help` | 显示帮助信息 |

**选项：**

| 选项 | 说明 |
|------|------|
| `--force`, `-f` | 跳过确认提示，强制覆盖 |

### 示例

```bash
# 查看当前配置状态
npx @stormhwdev/claude-config status

# 强制更新，跳过确认
npx @stormhwdev/claude-config init --force

# 更新到最新版本
npx @stormhwdev/claude-config@latest init
```

## 更新

当规则、agent 或模板有更新时：

```bash
# 发布新版本（维护者）
npm version patch
npm publish --access public

# 获取最新配置（使用者）
npx @stormhwdev/claude-config@latest init
```

`settings.json` 采用**深度合并**策略，更新时不会覆盖用户已有的自定义设置。

## 配置安装位置

```
~/.claude/
├── agents/          # Agent 定义（7 个）
├── rules/           # 编码规则（8 条）
├── templates/       # 文档模板（11 个）
└── settings.json    # Claude Code 设置（合并写入）

your-project/
└── CLAUDE.md        # 项目级研发规范（apply 命令写入）
```

## 研发流程概览

`CLAUDE.md` 定义了一套完整的 Agent Team 协作流程：

```
Phase 0: 基线建档（存量项目接入）
    ↓ 人工确认
Phase 1: 需求分析与 PRD
    ↓ 人工确认
Phase 2: 交互设计（按需）
    ↓ 人工确认
Phase 3: 架构设计（DDD）
    ↓ 大型改造需人工确认
Phase 4: 并行开发（TDD）
    ↓
Phase 5: 集成测试
```

根据需求规模自动判断启动哪些角色：

- **基线建档** — 存量项目首次接入，全面梳理文档
- **小型改造** — 单模块变更、Bug 修复
- **大型改造** — 跨模块变更、架构级改造

详细规范参见 `CLAUDE.md.template`。

## License

MIT
