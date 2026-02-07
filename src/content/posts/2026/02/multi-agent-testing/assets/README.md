# Assets 资源说明

本目录存放文章相关的静态资源文件。

## 文件列表

| 文件名 | 说明 | 建议尺寸 |
|--------|------|----------|
| `architecture.png` | Multi-Agent 测试架构全景图，展示四层架构设计 | 1400x800 |
| `test-flow.png` | 测试流程图，展示从场景准备到结果评估的完整流程 | 1200x600 |
| `agent-communication.png` | Agent 间通信流程示意图 | 1000x500 |

## Mermaid 源码

### architecture.png

```mermaid
graph TB
    subgraph "测试编排层"
        A[Test Orchestrator] --> B[Scenario Manager]
    end
    subgraph "模拟环境层"
        C[Mock LLM] --> D[Tool Simulator]
        D --> E[State Manager]
    end
    subgraph "执行监控层"
        F[Agent Runner] --> G[Trace Collector]
        G --> H[Metrics Aggregator]
    end
    subgraph "断言评估层"
        I[Semantic Evaluator] --> J[Behavior Validator]
    end
    A --> C
    F --> I
```

### test-flow.png

```mermaid
sequenceDiagram
    participant S as Scenario Manager
    participant M as Mock LLM
    participant A as Agent Runner
    participant E as Evaluator
    
    S->>M: 加载场景配置
    M->>A: 启动 Agent
    A->>A: 执行交互
    A->>E: 提交结果
    E->>S: 返回评估报告
```
