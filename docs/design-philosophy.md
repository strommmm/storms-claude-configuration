# 让 AI Agent 像真正的团队一样工作

## 问题

把大型需求交给单个 AI Agent，随着上下文膨胀，输出质量会不可逆地衰退：

```mermaid
graph LR
    s1["需求理解<br/>★★★★★"]:::green
    s2["架构设计<br/>★★★★★"]:::green
    s3["模块A开发<br/>★★★★☆"]:::yellow
    s4["模块B开发<br/>★★★☆☆"]:::orange
    s5["模块C开发<br/>★★☆☆☆"]:::red
    s6["集成调试<br/>★☆☆☆☆"]:::darkred
    s7["修复&返工<br/>★☆☆☆☆"]:::darkred

    s1 --> s2 --> s3 --> s4 --> s5 --> s6 --> s7

    classDef green fill:#90EE90,stroke:#333,color:#000
    classDef yellow fill:#FFFFE0,stroke:#333,color:#000
    classDef orange fill:#FFD700,stroke:#333,color:#000
    classDef red fill:#FFA500,stroke:#333,color:#000
    classDef darkred fill:#FF6347,stroke:#333,color:#fff
```

- **幻觉增多** — Agent 开始"发明"并不存在的接口
- **信息丢失** — 早期的业务规则被海量代码淹没
- **风格漂移** — 同一项目中出现截然不同的架构模式

这不是模型能力的问题，而是**使用方式**的问题。

---

## 核心理念：让每个 Agent 都在甜点区工作

人类团队通过**分工**和**契约**来协作，AI Agent 团队同样如此。

```mermaid
graph LR
    P1["<b>职责划分</b><br/>谁该做什么"]:::p1
    P2["<b>DDD 建模</b><br/>业务驱动边界"]:::p2
    P3["<b>上下文隔离</b><br/>每人只看该看的"]:::p3
    P4["<b>契约驱动</b><br/>文档而非口头约定"]:::p4
    P5["<b>文档即状态</b><br/>可恢复、可追溯"]:::p5

    P1 -- "分工需要<br/>合理的边界" --> P2
    P2 -- "边界清晰使<br/>隔离成为可能" --> P3
    P3 -- "隔离后需要<br/>明确的接口" --> P4
    P4 -- "契约本身就是<br/>持久化的状态" --> P5

    classDef p1 fill:#E8F5E9,stroke:#4CAF50,color:#000
    classDef p2 fill:#E1F5FE,stroke:#03A9F4,color:#000
    classDef p3 fill:#E3F2FD,stroke:#2196F3,color:#000
    classDef p4 fill:#FFF3E0,stroke:#FF9800,color:#000
    classDef p5 fill:#F3E5F5,stroke:#9C27B0,color:#000
```

### 一、职责划分

一个 Agent 不应该同时思考"用户想要什么"和"数据库表怎么建"。

```mermaid
graph TD
    user["👤 用户"]
    lead["🎯 Team Lead<br/>(主 Agent)"]

    user <--> lead

    subgraph need ["需求侧"]
        pm["产品经理"]
        de["领域专家"]
        id["交互设计师"]
    end

    subgraph tech ["技术侧"]
        arch["架构师"]
        devA["开发工程师 A"]
        devB["开发工程师 B"]
        fe["前端工程师"]
    end

    subgraph quality ["质量侧"]
        tester["测试专家"]
    end

    lead --> pm
    lead --> arch
    lead --> devA
    lead --> devB
    lead --> fe
    lead --> tester

    pm -. "领域咨询" .-> de
    pm -. "交互协作" .-> id
    de -. "领域模型输入" .-> arch
    arch -. "契约约束" .-> devA
    arch -. "契约约束" .-> devB
    id -. "设计稿交付" .-> fe

    style need fill:#E8F5E9,stroke:#4CAF50
    style tech fill:#E3F2FD,stroke:#2196F3
    style quality fill:#FFF3E0,stroke:#FF9800
```

| 角色 | 关注什么 | 不关心什么 |
|------|---------|-----------|
| 产品经理 | 用户需求、功能定义 | 代码、数据库 |
| 领域专家 | 业务规则、术语、领域模型 | 技术实现 |
| 交互设计师 | 体验、布局、交互流程 | 后端实现 |
| 架构师 | 模块拆分、接口定义、领域边界 | 具体实现 |
| 开发工程师 | 自己模块的实现 | 其他模块内部 |
| 测试专家 | 系统是否符合 PRD | 代码细节 |
| Team Lead | 流程推进、任务分配 | 任何技术实现 |

### 二、DDD 建模 — 业务语义驱动模块边界

拆模块是架构的核心决策。我们用 **领域驱动设计（DDD）** 来拆分：**模块边界由业务语义决定，而非技术层次**。

```mermaid
graph TB
    subgraph tech ["❌ 按技术层次拆分"]
        direction TB
        tc["Controllers"] --> ts["Services"] --> tr["Repositories"] --> tm["Models"]
    end

    subgraph ddd ["✅ 按 DDD 领域拆分"]
        subgraph order ["订单上下文"]
            oe["实体 / 值对象"]
            os["领域服务"]
            oi["接口 / 仓储"]
        end
        subgraph pay ["支付上下文"]
            pe["实体 / 值对象"]
            ps["领域服务"]
            pi["接口 / 仓储"]
        end
        subgraph inv ["库存上下文"]
            ie["实体 / 值对象"]
            is_["领域服务"]
            ii["接口 / 仓储"]
        end
        order -. "领域事件" .-> pay
        order -. "领域事件" .-> inv
    end

    style tech fill:#FFEBEE,stroke:#E53935
    style ddd fill:#E8F5E9,stroke:#43A047
    style order fill:#C8E6C9,stroke:#388E3C
    style pay fill:#C8E6C9,stroke:#388E3C
    style inv fill:#C8E6C9,stroke:#388E3C
```

DDD 给 Agent 团队带来三个优势：

| DDD 概念 | 对 Agent 的意义 |
|----------|----------------|
| **限界上下文** | 天然定义了一个 Agent 的工作范围。Agent 不需要理解其他上下文，只需发出领域事件 |
| **领域事件** | 模块间通过事件解耦，开发 A 模块的 Agent 完全不需要加载 B 模块的代码 |
| **统一语言** | 通过领域专家确保所有模块对业务概念的命名一致，消除 Agent 间的"术语分歧" |

```mermaid
graph TD
    pm["产品经理"]:::green
    de["领域专家"]:::green
    arch["架构师"]:::blue

    prd[("PRD.md")]:::doc
    model[("领域模型")]:::doc
    contracts[("contracts.md")]:::doc

    pm -- "产出需求" --> prd
    de -- "校验业务准确性" --> prd
    prd -- "输入" --> arch

    de -- "提供领域知识" --> model
    arch -- "识别限界上下文" --> model
    model -- "每个上下文一份" --> contracts

    classDef green fill:#E8F5E9,stroke:#4CAF50,color:#000
    classDef blue fill:#E3F2FD,stroke:#2196F3,color:#000
    classDef doc fill:#FFF9C4,stroke:#F9A825,color:#000
```

> 限界上下文 → 模块，聚合根 → 核心实体，领域事件 → 模块间通信，值对象 → 业务规则封装

架构师不是凭直觉拆模块，而是与领域专家一起从业务语义出发，识别**天然的边界**——这些边界不会因为技术重构而改变。

### 三、上下文隔离 — 甜点区是有限的

模型的上下文窗口虽大，但信息越多、跨度越大，注意力越分散。**通过分工实现隔离，让每个 Agent 工作在最小必要上下文中**。

```mermaid
graph LR
    subgraph single ["❌ 单 Agent 的上下文"]
        c1["PRD 全文"]:::warn
        c2["架构设计"]:::warn
        c3["模块A契约"]:::warn
        c4["模块B契约"]:::warn
        c5["模块A代码"]:::warn
        c6["模块B代码"]:::warn
        c7["测试代码"]:::warn
        c8["配置文件"]:::warn
    end

    subgraph focused ["✅ 模块A 工程师的上下文"]
        d1["模块A契约"]:::good
        d2["模块A设计"]:::good
        d3["模块A代码"]:::good
        d4["模块A测试"]:::good
    end

    style single fill:#FFF3E0,stroke:#E65100
    style focused fill:#E8F5E9,stroke:#2E7D32

    classDef warn fill:#FFCC80,stroke:#E65100,color:#000
    classDef good fill:#A5D6A7,stroke:#2E7D32,color:#000
```

> 上下文越大，幻觉风险越高；上下文精简，输出质量越高。

### 四、契约驱动 — 文档是 Agent 之间唯一的语言

Agent 没有走廊可以碰面聊天。一切协作通过**持久化的契约文档**完成。

```mermaid
graph TD
    de["领域专家"]:::green
    arch["架构师"]:::blue
    devA["开发工程师 A"]:::green
    devB["开发工程师 B"]:::green
    fe["前端工程师"]:::orange
    tester["测试专家"]:::purple

    cA[("模块A<br/>contracts.md")]:::doc
    cB[("模块B<br/>contracts.md")]:::doc
    dep[("module-<br/>dependencies.md")]:::doc

    de -. "领域模型校验" .-> arch
    arch -- "定义" --> cA
    arch -- "定义" --> cB
    arch -- "定义" --> dep

    devA -- "遵循 & 实现" --> cA
    devB -- "遵循 & 实现" --> cB

    fe -- "查阅 API" --> cA
    fe -- "查阅 API" --> cB

    tester -- "验证" --> cA
    tester -- "验证" --> cB

    classDef green fill:#E8F5E9,stroke:#4CAF50,color:#000
    classDef blue fill:#E3F2FD,stroke:#2196F3,color:#000
    classDef orange fill:#FFF3E0,stroke:#FF9800,color:#000
    classDef purple fill:#F3E5F5,stroke:#9C27B0,color:#000
    classDef doc fill:#FFF9C4,stroke:#F9A825,color:#000
```

每个模块的 `contracts.md` 包含三类契约：**Service 接口**（模块间同步调用）、**Controller 接口**（前端 HTTP API）、**Events**（领域事件）。

契约是唯一的事实来源。实现以契约为准，测试以契约为据，联调以契约为参考。变更契约须通知 Team Lead 协调所有依赖方确认后才能修改。

### 五、文档即状态 — 随时可恢复

Agent 会话是易失的。我们把所有状态外化到三类文档中：

```mermaid
graph LR
    subgraph prd ["需求文档 (PRD)"]
        prd_what["做什么"]
        prd_fr["功能列表"]
    end

    subgraph contracts ["契约文档 (Contracts)"]
        c_svc["Service 接口"]
        c_api["API 定义"]
        c_evt["领域事件"]
    end

    subgraph lifecycle ["生命周期文档 (Lifecycle)"]
        l_phase["阶段状态"]
        l_team["团队分配"]
        l_block["阻塞项"]
    end

    prd -- "需求驱动契约" --> contracts
    contracts -- "契约指导进度" --> lifecycle

    style prd fill:#E8F5E9,stroke:#4CAF50
    style contracts fill:#E3F2FD,stroke:#2196F3
    style lifecycle fill:#FFF3E0,stroke:#FF9800
```

| 文档 | 回答什么 | 谁负责 |
|------|---------|--------|
| **PRD** | 做什么？ | 产品经理 + 领域专家 |
| **Contracts** | 怎么交互？ | 架构师 + 领域专家 |
| **Lifecycle** | 走到哪了？ | Team Lead |

新 Agent 加入时只需：读 `lifecycle.md` 知道阶段 → 读 `contracts.md` 知道约束 → 开始工作。不需要回溯对话历史。

### 六、TDD：目标 One Shot 开发

分工和契约解决了协作问题，但开发层面还有一个挑战：**如何让 Agent 一次写对？**

没有 TDD 时，开发是"写 → 跑 → 报错 → 改 → 再跑"的循环，每一轮试错都在消耗上下文。我们用**测试驱动开发（TDD）**来解决——不是作为工程美学，而是作为**对 Agent 特别有效的策略**。

```mermaid
graph TB
    subgraph no_tdd ["❌ 没有 TDD"]
        direction LR
        n1["读契约"] --> n2["写代码<br/>(猜测行为)"] --> n3["跑一下"]
        n3 --> n4["报错"] --> n5["改"] --> n6["新的报错"] --> n7["继续..."]
    end

    subgraph with_tdd ["✅ 使用 TDD"]
        direction LR
        t1["读契约"] --> t2["写测试"]:::red
        t2 --> t3["写最小实现"]:::tgreen
        t3 --> t4["重构"]:::tblue
        t4 --> t5["Commit"]
    end

    style no_tdd fill:#FFEBEE,stroke:#E53935
    style with_tdd fill:#E8F5E9,stroke:#43A047

    classDef red fill:#EF9A9A,stroke:#C62828,color:#000
    classDef tgreen fill:#A5D6A7,stroke:#2E7D32,color:#000
    classDef tblue fill:#90CAF9,stroke:#1565C0,color:#000
```

#### 为什么 TDD 对 Agent 特别有效？

1. **测试 = 无歧义的规格** — 契约是自然语言，有歧义；测试是可执行代码，精确到每个输入输出
2. **大目标变小步骤** — "实现订单模块"很模糊，但"创建订单应返回 ID"、"取消已发货订单应报错"都是可聚焦的微目标
3. **即时反馈** — 通过/失败是二元的，Agent 不需要猜测行为是否正确，上下文不会被试错信息污染
4. **安全重构** — 有完整测试覆盖，Agent 可以大胆优化而不担心回归

```mermaid
graph TD
    start(["开始"]) --> read["读取 contracts.md"]
    read --> pick["选取一个功能点"]

    pick --> red["🔴 RED — 写测试"]:::red
    red --> green["🟢 GREEN — 最小实现"]:::tgreen
    green --> run{"测试"}

    run -- "通过" --> refactor["🔵 REFACTOR — 优化"]:::tblue
    refactor --> commit["Commit"]
    commit --> more{"更多功能？"}

    run -- "失败" --> fix["修正实现"]
    fix --> run

    more -- "是" --> pick
    more -- "否" --> done(["完成"])

    classDef red fill:#EF9A9A,stroke:#C62828,color:#000
    classDef tgreen fill:#A5D6A7,stroke:#2E7D32,color:#000
    classDef tblue fill:#90CAF9,stroke:#1565C0,color:#000
```

**TDD + 上下文隔离 = 最大化 One Shot 率**：隔离确保 Agent 脑中只有一个模块，TDD 再拆解为一个个小测试。每个测试都是封闭的微任务——上下文小、目标明确、反馈即时，这是 Agent 最舒适的工作模式。

---

## 完整流程

以一次大型改造为例：

```mermaid
sequenceDiagram
    actor U as 用户
    participant L as Team Lead
    participant PM as 产品经理
    participant DE as 领域专家
    participant ID as 交互设计师
    participant AR as 架构师
    participant D1 as 开发工程师 A
    participant D2 as 开发工程师 B
    participant FE as 前端工程师
    participant QA as 测试专家

    U->>L: 提出需求
    L->>L: 评估规模 → 大型改造
    L->>L: 初始化 lifecycle.md

    rect rgb(232, 245, 233)
        Note over PM,DE: Phase 1 — 需求分析
        L->>PM: 启动需求分析
        L->>DE: 启动领域咨询
        PM->>DE: 业务规则咨询
        DE-->>PM: 校验术语和流程
        PM->>L: 产出 PRD.md
    end

    L->>U: ⛔ 请审核 PRD
    U-->>L: ✅ 确认

    rect rgb(225, 245, 254)
        Note over ID: Phase 2 — 交互设计
        L->>ID: 启动交互设计
        ID->>L: 产出 HTML/CSS 原型
    end

    L->>U: ⛔ 请审核设计
    U-->>L: ✅ 确认

    rect rgb(227, 242, 253)
        Note over AR,DE: Phase 3 — 架构设计 (DDD)
        L->>AR: 启动架构设计
        AR->>DE: 领域建模协作
        DE-->>AR: 校验限界上下文
        AR->>L: 产出 contracts / architecture / dependencies
    end

    L->>U: ⛔ 请审核架构
    U-->>L: ✅ 确认

    rect rgb(255, 243, 224)
        Note over D1,FE: Phase 4 — 并行开发 (TDD)
        par 模块 A
            L->>D1: 分配模块 A
            D1->>D1: TDD: RED → GREEN → REFACTOR
            D1->>D1: commit
        and 模块 B
            L->>D2: 分配模块 B
            D2->>D2: TDD: RED → GREEN → REFACTOR
            D2->>D2: commit
        and 前端
            L->>FE: 分配前端
            FE->>FE: 按设计稿开发
            FE->>FE: commit
        end
    end

    rect rgb(243, 229, 245)
        Note over QA: Phase 5 — 集成测试
        L->>QA: 启动测试
        QA->>QA: 执行集成测试
        alt 发现问题
            QA->>L: 反馈
            L->>D1: 分派修复
        end
        QA->>L: ✅ 全部通过
    end

    L->>U: 交付完成
```

### 关键设计点

| 设计 | 目的 |
|------|------|
| **领域专家贯穿 Phase 1-3** | 跨阶段顾问，确保需求和架构的业务准确性 |
| **交互设计先于开发** | 前端拿到的是已确认的设计稿，而非模糊描述 |
| **人工确认网关** | 方向正确比速度更重要，修正方向的成本远低于推倒重来 |
| **TDD 并行开发** | 各工程师只读自己模块的 contracts.md，互不干扰 |
| **状态持久化** | 每个阶段转换更新 lifecycle.md，中断后可精确恢复 |

---

## 单 Agent vs Agent Team

```mermaid
graph LR
    subgraph single ["❌ 单 Agent"]
        s1["巨大的上下文"]
        s2["信息混在一起"]
        s3["随时间衰退"]
        s4["不可恢复"]
    end

    subgraph team ["✅ Agent Team"]
        t1["精简的上下文"]
        t2["按职责隔离"]
        t3["持续高效"]
        t4["随时恢复"]
    end

    style single fill:#FFEBEE,stroke:#E53935
    style team fill:#E8F5E9,stroke:#43A047
```

| | 单 Agent | Agent Team |
|--|----------|-----------|
| 上下文 | 持续膨胀 | 恒定精简 |
| 输出质量 | 随上下文衰退 | 保持稳定 |
| 一致性 | 依赖模型记忆 | 依赖持久化文档 |
| 模块划分 | 临时、技术导向 | DDD、业务语义导向 |
| 开发效率 | 试错循环 | TDD, One Shot |
| 中断恢复 | 几乎不可能 | 读文档即恢复 |
| 并行 | 无 | 天然支持 |

---

## 文档三层架构

```mermaid
graph TD
    subgraph goal ["🎯 目标层"]
        prd["PRD.md"]
        design["交互设计稿"]
    end

    subgraph interface ["🔗 接口层"]
        contracts["contracts.md"]
        deps["module-dependencies.md"]
        arch["architecture.md"]
    end

    subgraph process ["📋 过程层"]
        lifecycle["lifecycle.md"]
        changelog["changelogs/"]
    end

    goal -- "需求拆解为模块和接口" --> interface
    interface -- "接口指导实现和进度" --> process

    style goal fill:#C8E6C9,stroke:#388E3C
    style interface fill:#BBDEFB,stroke:#1565C0
    style process fill:#FFE0B2,stroke:#E65100
```

| 层 | 回答 | 负责人 | 容灾能力 |
|----|------|--------|---------|
| **目标层** | 为什么做、做什么 | PM + 领域专家 + 设计师 | 换掉所有开发 Agent，需求不丢 |
| **接口层** | 怎么交互 | 架构师 + 领域专家 | Agent 崩溃，读完契约即接手 |
| **过程层** | 走到哪了 | Team Lead | 会话丢失，读 lifecycle 即恢复 |

每一层独立可恢复，组合在一起构成**对 Agent 会话中断具有弹性的系统**。

---

## 小结

> 一个 Agent 做好一件事，胜过一个 Agent 做完所有事。

1. **分工** — 7 个 Agent 各司其职，每个都在甜点区工作
2. **DDD** — 业务语义驱动模块划分，边界天然稳固
3. **TDD** — RED-GREEN-REFACTOR 最大化 One Shot 率
4. **契约** — 用文档替代记忆，用结构替代约定
5. **持久化** — 一切状态写入文件，任何时刻可恢复

当每个 Agent 都只处理它能处理好的那部分工作时，团队输出质量不再受限于上下文窗口——就像真正的人类工程团队一样。
