# 让 AI Agent 像真正的团队一样工作

## 一个现实问题

当你把一个大型需求交给单个 AI Agent，最初的输出往往令人惊艳。但随着对话轮次增加、上下文膨胀，你会观察到一个不可逆的衰退曲线：

```plantuml
@startuml
!theme plain
skinparam backgroundColor transparent

title Agent 输出质量与上下文长度的关系

rectangle "**单 Agent 模式**" as single {
  card "需求理解" as s1 #90EE90
  card "架构设计" as s2 #90EE90
  card "模块A开发" as s3 #FFFFE0
  card "模块B开发" as s4 #FFD700
  card "模块C开发" as s5 #FFA500
  card "集成调试" as s6 #FF6347
  card "修复&返工" as s7 #FF0000
}

s1 -right-> s2
s2 -right-> s3
s3 -right-> s4
s4 -right-> s5
s5 -right-> s6
s6 -right-> s7

note bottom of s1 : 质量 ★★★★★
note bottom of s4 : 质量 ★★★☆☆\n开始遗忘早期约定
note bottom of s7 : 质量 ★☆☆☆☆\n幻觉频发、接口不一致
@enduml
```

**幻觉增多** — Agent 开始"发明"前面并不存在的接口定义。**信息丢失** — 早期确定的业务规则被后续的海量代码淹没。**风格漂移** — 同一个项目中出现截然不同的代码风格和架构模式。

这不是模型能力的问题，而是**使用方式**的问题。

---

## 核心理念：让每个 Agent 都在自己的甜点区工作

解决方案的灵感来自人类工程团队的组织方式——没有人能同时是产品经理、架构师、开发者和测试工程师。人类团队通过**分工**和**契约**来协作，AI Agent 团队同样应该如此。

```plantuml
@startuml
!theme plain
skinparam backgroundColor transparent
skinparam componentStyle rectangle

title 设计四原则

package "职责划分" as P1 #E8F5E9 {
  [谁该做什么]
}

package "上下文隔离" as P2 #E3F2FD {
  [每人只看该看的]
}

package "契约驱动" as P3 #FFF3E0 {
  [用文档而非口头约定]
}

package "文档即状态" as P4 #F3E5F5 {
  [一切可恢复、可追溯]
}

P1 -right-> P2 : 分工使隔离\n成为可能
P2 -right-> P3 : 隔离后需要\n明确的接口
P3 -right-> P4 : 契约本身就是\n持久化的状态

@enduml
```

### 原则一：职责划分 — 让专业的 Agent 做专业的事

一个 Agent 不应该同时思考"用户想要什么"和"数据库表怎么建"。人类团队中产品经理不写代码、开发工程师不做产品决策，AI Agent 同样需要明确的角色边界。

```plantuml
@startuml
!theme plain
skinparam backgroundColor transparent
skinparam actorStyle awesome

actor "用户" as user #FFD700

rectangle "Agent Team" {
  agent "产品经理" as pm #E8F5E9
  agent "领域专家" as de #E8F5E9
  agent "交互设计师" as id #E8F5E9
  agent "架构师" as arch #E3F2FD
  agent "开发工程师 A" as devA #E3F2FD
  agent "开发工程师 B" as devB #E3F2FD
  agent "前端工程师" as fe #E3F2FD
  agent "测试专家" as tester #FFF3E0
  agent "Team Lead\n(主 Agent)" as lead #FFCDD2
}

user <-down-> lead : 需求 & 确认
lead -down-> pm : 分配需求分析
lead -down-> arch : 分配架构设计
lead -down-> devA : 分配模块 A
lead -down-> devB : 分配模块 B
lead -down-> fe : 分配前端页面
lead -down-> tester : 分配测试任务

pm .left.> de : 领域咨询
pm .right.> id : 交互设计
arch ..> devA : 契约约束
arch ..> devB : 契约约束

@enduml
```

每个 Agent 拥有**精确定义的职责边界**：

| 角色 | 关注点 | 不关心什么 |
|------|--------|-----------|
| 产品经理 | 用户需要什么，功能如何定义 | 代码怎么写，数据库怎么设计 |
| 架构师 | 模块怎么拆，接口怎么定义 | 具体的业务逻辑实现 |
| 开发工程师 | 自己负责的模块如何实现 | 其他模块的内部实现 |
| 测试专家 | 系统整体是否符合 PRD | 具体的代码实现细节 |
| Team Lead | 流程推进、任务分配、阻塞协调 | 任何具体的技术实现 |

这种划分的意义在于：**每个 Agent 的上下文中只需要加载与其职责相关的信息**。产品经理不需要读代码，开发工程师不需要读 PRD 全文——他只需要看到自己模块的契约文档。

### 原则二：上下文隔离 — 甜点区是有限的

大语言模型存在一个隐性的**有效上下文窗口**。虽然上下文长度可以很大，但信息密度越高、跨度越大，模型的注意力就越分散。这就像一个人同时处理 10 件不相关的事——即使记忆力再好，也会顾此失彼。

```plantuml
@startuml
!theme plain
skinparam backgroundColor transparent

title Agent 有效工作区（甜点区）

rectangle "单 Agent 的上下文" #FFF3E0 {
  card "PRD 全文" as c1 #FFCC80
  card "架构设计" as c2 #FFCC80
  card "模块A契约" as c3 #FFCC80
  card "模块B契约" as c4 #FFCC80
  card "模块C契约" as c5 #FFCC80
  card "模块A代码" as c6 #FFCC80
  card "模块B代码" as c7 #FFCC80
  card "模块C代码" as c8 #FFCC80
  card "测试代码" as c9 #FFCC80
  card "配置文件" as c10 #FFCC80
}

note right of c1 : 上下文越大\n有效利用率越低\n幻觉风险越高

rectangle "模块A 开发工程师的上下文" #E8F5E9 {
  card "模块A契约" as d1 #A5D6A7
  card "模块A设计" as d2 #A5D6A7
  card "模块A代码" as d3 #A5D6A7
  card "模块A测试" as d4 #A5D6A7
}

note right of d1 : 上下文精简\n注意力集中\n输出质量高

@enduml
```

我们的策略是**通过分工来实现上下文隔离**：

- **开发工程师**只加载自己模块的契约、设计和代码
- **架构师**只关注模块间的依赖和接口定义，不看实现
- **产品经理**只处理需求和功能定义，不接触技术文档
- **Team Lead**只跟踪生命周期文件和任务状态，不深入任何模块

每个 Agent 都工作在**最小必要上下文**中，这就是它的甜点区。

### 原则三：契约驱动 — 文档是 Agent 之间唯一的语言

人类团队可以在走廊里碰面聊两句来对齐信息。Agent 没有走廊。Agent 之间的一切协作必须通过**持久化的、结构化的文档**来完成。

```plantuml
@startuml
!theme plain
skinparam backgroundColor transparent

title 契约文档作为 Agent 间的通信协议

rectangle "架构师" as arch #E3F2FD
rectangle "开发工程师 A" as devA #E8F5E9
rectangle "开发工程师 B" as devB #E8F5E9
rectangle "前端工程师" as fe #FFF3E0
rectangle "测试专家" as tester #F3E5F5

database "模块A\ncontracts.md" as cA #FFF9C4
database "模块B\ncontracts.md" as cB #FFF9C4
database "module-\ndependencies.md" as dep #FFF9C4

arch -down-> cA : 定义
arch -down-> cB : 定义
arch -down-> dep : 定义

devA -up-> cA : 遵循 & 实现
devB -up-> cB : 遵循 & 实现

fe -up-> cA : 查阅 API 契约
fe -up-> cB : 查阅 API 契约

devA -right-> dep : 查阅依赖
devB -left-> dep : 查阅依赖

tester -up-> cA : 验证
tester -up-> cB : 验证

@enduml
```

每个模块的 `contracts.md` 包含三类契约：

- **Service 接口** — 暴露给其他模块的同步调用
- **Controller 接口** — 暴露给前端的 HTTP API
- **Events** — 模块发出的领域事件

这些契约是**唯一的事实来源**。开发工程师实现时以契约为准，测试工程师验证时以契约为据，前端工程师联调时以契约为参考。没有任何信息需要通过"记住对话内容"来传递。

**契约变更**也有严格的流程——发起方必须通知 Team Lead，Team Lead 协调所有依赖方确认后，才能修改契约文档。这保证了多个 Agent 并行工作时的一致性。

### 原则四：文档即状态 — 随时可恢复、随时可介入

AI Agent 的会话是易失的。一次网络中断、一次上下文截断，之前的所有进度就可能丢失。我们的方案是：**把所有状态外化到文档中**。

```plantuml
@startuml
!theme plain
skinparam backgroundColor transparent

title 三类文档构成完整的状态机

rectangle "需求文档 (PRD)" as prd #E8F5E9 {
  card "定义：做什么" as prd_what
  card "功能需求列表" as prd_fr
  card "用户故事" as prd_us
}

rectangle "契约文档 (Contracts)" as contracts #E3F2FD {
  card "定义：怎么交互" as c_what
  card "Service 接口" as c_svc
  card "API 定义" as c_api
  card "领域事件" as c_evt
}

rectangle "生命周期文档 (Lifecycle)" as lifecycle #FFF3E0 {
  card "定义：走到哪了" as l_what
  card "阶段状态" as l_phase
  card "团队分配" as l_team
  card "阻塞项" as l_block
}

prd -right-> contracts : 需求驱动\n契约设计
contracts -right-> lifecycle : 契约指导\n开发进度

note bottom of prd : 目标层\n"系统要成为什么"
note bottom of contracts : 接口层\n"模块间如何协作"
note bottom of lifecycle : 过程层\n"当前进展到哪一步"

@enduml
```

三类文档各司其职：

| 文档类型 | 回答的问题 | 特性 |
|----------|-----------|------|
| **需求文档** (PRD) | 我们要做什么？ | 保持最新状态，反映当前需求全景 |
| **契约文档** (Contracts) | 模块之间如何交互？ | 保持最新状态，是实现的唯一依据 |
| **生命周期文档** (Lifecycle) | 当前走到哪了？ | 实时更新，是恢复进度的唯一入口 |

当一个新的 Agent 会话启动时（无论是因为中断恢复还是新 Agent 加入），它只需要：

1. 读取 `lifecycle.md` — 知道当前在哪个阶段
2. 读取自己相关的 `contracts.md` — 知道接口约束
3. 开始工作

不需要回溯整个对话历史，不需要重新理解全局架构，不需要阅读其他模块的代码。**最快的速度、最小的上下文、最精确的信息**。

---

## 完整流程：以一次大型改造为例

```plantuml
@startuml
!theme plain
skinparam backgroundColor transparent
skinparam swimlaneWidth 160

|用户|
|Team Lead|
|产品经理|
|架构师|
|开发工程师|
|测试专家|

|用户|
:提出需求;

|Team Lead|
:评估规模 → 大型改造;
:初始化 lifecycle.md;
:启动产品经理;

|产品经理|
:分析需求;
:产出 PRD.md;

|Team Lead|
:Phase 1 → 待确认;

|用户|
:审核 PRD;
if (确认？) then (通过)
else (不通过)
  |Team Lead|
  :Phase 1 → 进行中（返工）;
  |产品经理|
  :修改 PRD;
  detach
endif

|Team Lead|
:Phase 1 → 已完成;
:启动架构师;

|架构师|
:读取 PRD.md;
:DDD 领域建模;
:定义模块边界;
:产出每个模块的 contracts.md;
:产出 architecture.md;
:产出 module-dependencies.md;

|Team Lead|
:Phase 3 → 待确认;

|用户|
:审核架构设计;

|Team Lead|
:Phase 3 → 已完成;
:Phase 4 → 进行中;
fork
  |开发工程师|
  :读取模块A contracts.md;
  :TDD 开发模块A;
  :commit;
fork again
  |开发工程师|
  :读取模块B contracts.md;
  :TDD 开发模块B;
  :commit;
end fork

|Team Lead|
:Phase 4 → 已完成;
:启动测试专家;

|测试专家|
:读取 PRD.md;
:读取各模块 contracts.md;
:执行集成测试;
if (通过？) then (全部通过)
  |Team Lead|
  :Phase 5 → 已完成;
  :交付;
else (发现问题)
  |Team Lead|
  :分派问题给对应开发工程师;
  |开发工程师|
  :修复并 commit;
  detach
endif

|用户|
:验收;

@enduml
```

注意这个流程中的几个关键设计：

**1. 人工确认网关**

流程中设置了多个"门禁"。PRD 必须用户确认才能开始设计，架构设计必须用户确认才能开始开发。这不是对 AI 能力的不信任，而是对**方向正确性**的保障——修正方向的成本远低于推倒重来。

**2. 开发工程师的上下文**

开发工程师 A 和 B 是完全并行的。A 只读模块 A 的 `contracts.md`，B 只读模块 B 的 `contracts.md`。他们互不干扰、互不依赖，各自在最小上下文中高效工作。

**3. 状态持久化**

每个阶段转换都会更新 `lifecycle.md`。如果在 Phase 4 中途会话中断，新会话的 Team Lead 读取 `lifecycle.md` 就能精确恢复——哪些模块已完成、哪些正在进行、有什么阻塞项。

---

## 为什么不直接给一个 Agent 塞完所有东西？

```plantuml
@startuml
!theme plain
skinparam backgroundColor transparent

title 两种模式的本质区别

rectangle "单 Agent 模式" as single #FFEBEE {
  card "一个巨大的上下文窗口" as s_ctx
  card "所有信息混在一起" as s_mix
  card "随时间衰退" as s_decay
  card "不可恢复" as s_norecover
}

rectangle "Agent Team 模式" as team #E8F5E9 {
  card "多个精简的上下文窗口" as t_ctx
  card "信息按职责隔离" as t_iso
  card "每个 Agent 持续高效" as t_quality
  card "随时可恢复" as t_recover
}

single -[hidden]right-> team

note bottom of single
  上下文 = 全部信息
  Agent 知道太多
  但什么都做不好
end note

note bottom of team
  上下文 = 最小必要信息
  Agent 知道的少
  但做得精准
end note

@enduml
```

| | 单 Agent | Agent Team |
|--|----------|-----------|
| 上下文大小 | 持续膨胀 | 恒定精简 |
| 输出质量 | 随上下文衰退 | 保持稳定 |
| 信息一致性 | 依赖模型记忆 | 依赖持久化文档 |
| 中断恢复 | 几乎不可能 | 读取文档即恢复 |
| 并行能力 | 无 | 天然支持 |
| 适用规模 | 小型任务 | 任意规模 |

---

## 文档体系的分层设计

整个文档体系被刻意设计为三个层次，每一层服务于不同的目的：

```plantuml
@startuml
!theme plain
skinparam backgroundColor transparent

rectangle "目标层" as goal #C8E6C9 {
  card "PRD.md\n功能需求明细" as prd
}

rectangle "接口层" as interface #BBDEFB {
  card "contracts.md\nService / API / Events" as contracts
  card "module-dependencies.md\n模块依赖关系" as deps
  card "architecture.md\n架构设计" as arch
}

rectangle "过程层" as process #FFE0B2 {
  card "lifecycle.md\n阶段状态 & 进度" as lifecycle
  card "changelogs/\n变更历史" as changelog
}

goal -down-> interface : 需求拆解为\n模块和接口
interface -down-> process : 接口指导实现\n过程跟踪进度

note right of goal : 产品经理写\n用户确认\n开发遵循
note right of interface : 架构师定义\n开发实现\n测试验证
note right of process : Team Lead 维护\n自动更新\n恢复依据

@enduml
```

这个分层背后的思考是：

- **目标层**回答"为什么做"和"做什么" — 即使更换全部开发 Agent，只要 PRD 在，需求就不会丢失
- **接口层**回答"怎么交互" — 即使某个 Agent 中途崩溃，新 Agent 读完契约就能接手
- **过程层**回答"走到哪了" — 即使整个会话丢失，生命周期文件记录了精确的进度快照

每一层都是独立可恢复的，组合在一起就构成了一个**对 Agent 会话中断具有弹性的系统**。

---

## 小结

这套配置的设计并非追求复杂——恰恰相反，它追求的是让每个 Agent 的工作尽可能**简单**。

> 一个 Agent 做好一件事，胜过一个 Agent 做完所有事。

核心策略只有三条：

1. **分工** — 让每个 Agent 的上下文保持在甜点区
2. **契约** — 用文档替代记忆，用结构替代约定
3. **持久化** — 一切状态写入文件，任何时刻可恢复

当每个 Agent 都只需要处理它能处理好的那部分工作时，整个团队的输出质量就不再受限于上下文窗口的大小，而是取决于架构设计的合理性——就像真正的人类工程团队一样。
