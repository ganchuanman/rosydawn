---
title: "LLM Prompt Engineering 系统化指南：从入门到精通"
date: 2026-03-15
description: "系统性讲解大语言模型的 Prompt 工程技巧，涵盖基础模式、高级策略、评估方法，帮助你充分释放 AI 的潜力。"
tags:
  - AI
  - LLM
  - Prompt Engineering
  - 开发方法论
coverImage: ./cover.jpg
---

# LLM Prompt Engineering 系统化指南：从入门到精通

随着大语言模型（LLM）的普及，Prompt Engineering 已成为每个开发者必备的核心技能。好的 Prompt 可以让同一个模型的输出质量产生天壤之别。

## 基础框架：CRISPE 方法论

### 核心要素

| 要素 | 含义 | 示例 |
|------|------|------|
| **C**apacity | 角色能力 | "作为资深前端架构师" |
| **R**ole | 具体角色 | "你负责代码审查工作" |
| **I**nsight | 背景信息 | "我们使用 React + TypeScript" |
| **S**tatement | 任务陈述 | "审查以下代码的安全性" |
| **P**ersonality | 输出风格 | "以表格形式列出问题" |
| **E**xperiment | 迭代空间 | "如果发现问题，提供修复建议" |

### 实战示例

```markdown
# Role
你是一位拥有 10 年经验的 TypeScript 专家，专注于类型系统设计和性能优化。

# Context
我正在开发一个大型电商平台的订单系统，使用 TypeScript 5.0 + React 18。
系统需要处理每秒上万的订单请求。

# Task
请审查以下类型定义，从以下维度评估：
1. 类型安全性
2. 可维护性
3. 性能影响

# Output Format
以表格形式输出，包含：问题描述、严重程度、修复建议

# Code
[粘贴代码]
```

## 高级技巧：Chain of Thought (CoT)

### 零样本 CoT

最简单但有效的方式：

```markdown
问题：一个商店有 23 个苹果，卖掉了 15 个，又进货 30 个。请问现在有多少苹果？

请一步一步思考。
```

### 少样本 CoT

提供推理示例：

```markdown
问题：小明有 5 支笔，送给小红 2 支，自己又买了 3 支。问小明有几支笔？
思考过程：
- 初始数量：5 支
- 送出后：5 - 2 = 3 支
- 购买后：3 + 3 = 6 支
答案：6 支

问题：一个商店有 23 个苹果，卖掉了 15 个，又进货 30 个。请问现在有多少苹果？
思考过程：
```

### Self-Consistency

同一问题多次采样，取多数投票结果：

```python
def self_consistency_answer_self_consistency_answer(question: str, n_samples: int = 5) -> str:
    responses = []
    for _ in range(n_samples):
        response = llm.generate(
            prompt=question + "\n请一步一步思考。",
            temperature=0.7  # 增加随机性获得多样答案
        )
        answer = extract_final_answer(response)
        responses.append(answer)
    
    # 多数投票
    return max(set(responses), key=responses.count)
```

## 结构化输出策略

### JSON Mode

```markdown
请分析以下用户评论的情感倾向。

评论："{user_comment}"

以 JSON 格式输出，包含以下字段：
- sentiment: "positive" | "negative" | "neutral"
- confidence: 0-1 之间的数值
- keywords: 关键情感词列表
- summary: 一句话总结

确保输出是合法的 JSON 格式。
```

### XML 标签法

适用于复杂的多段输出：

```markdown
请对以下代码进行全面分析。

<code>
{source_code}
</code>

输出格式：

<analysis>
  <summary>整体评估</summary>
  <issues>
    <issue severity="high|medium|low">
      <description>问题描述</description>
      <location>代码位置</location>
      <fix>修复建议</fix>
    </issue>
  </issues>
  <score>1-10 分</score>
</analysis>
```

## 高级模式：ReAct (Reason + Act)

结合推理和工具调用：

```markdown
# System
你是一个智能助手，可以使用以下工具：
- search(query): 搜索网络信息
- calculate(expression): 计算数学表达式
- code_execute(code): 执行 Python 代码

按以下格式响应：
Thought: 分析当前情况和下一步计划
Action: 工具名(参数)
Observation: 工具返回结果
... (重复直到任务完成)
Final Answer: 最终答案

# Task
查询今天的美元兑人民币汇率，并计算 1500 美元能换多少人民币。
```

## Prompt 优化与评估

### A/B 测试框架

```python
class PromptExperiment:
    def __init__(self, prompts: list[str], evaluator: Callable):
        self.prompts = prompts
        self.evaluator = evaluator
        self.results = defaultdict(list)
    
    def run(self, test_cases: list[dict], n_trials: int = 3):
        for prompt_idx, prompt in enumerate(self.prompts):
            for case in test_cases:
                for _ in range(n_trials):
                    response = llm.generate(
                        prompt.format(**case['input'])
                    )
                    score = self.evaluator(
                        response, 
                        case['expected']
                    )
                    self.results[prompt_idx].append(score)
        
        return self.get_statistics()
    
    def get_statistics(self):
        return {
            idx: {
                'mean': np.mean(scores),
                'std': np.std(scores),
                'min': min(scores),
                'max': max(scores)
            }
            for idx, scores in self.results.items()
        }
```

### 评估维度

| 维度 | 描述 | 评估方法 |
|------|------|----------|
| 准确性 | 答案的正确程度 | 人工标注 / 自动对比 |
| 完整性 | 是否覆盖所有要点 | Checklist 匹配 |
| 一致性 | 多次输出的稳定性 | 方差分析 |
| 格式规范 | 是否符合预期格式 | Schema 验证 |
| 安全性 | 是否包含有害内容 | 安全分类器 |

## 常见陷阱与解决方案

### ❌ 陷阱 1：指令过于模糊

```markdown
# Bad
帮我写段代码

# Good
使用 Python 3.10+ 编写一个异步 HTTP 客户端，要求：
1. 支持重试机制（最多 3 次）
2. 支持超时设置（默认 30s）
3. 返回类型使用 TypedDict
4. 包含完整的类型注解和 docstring
```

### ❌ 陷阱 2：忽略边界情况

```markdown
# Bad
解析用户输入的日期

# Good
解析用户输入的日期，处理以下情况：
1. 标准格式：2024-01-15
2. 斜杠格式：01/15/2024 或 15/01/2024
3. 中文格式：2024年1月15日
4. 相对日期：明天、下周一
5. 无效输入：返回 null 并说明原因
```

## 总结

Prompt Engineering 是一门融合语言学、心理学和软件工程的交叉学科。核心原则包括：

1. **明确性**：清晰表达你的期望
2. **结构化**：使用模板和格式约束
3. **迭代性**：持续测试和优化
4. **可测量**：建立评估标准

记住：最好的 Prompt 往往不是一次写成的，而是通过反复实验打磨出来的。
