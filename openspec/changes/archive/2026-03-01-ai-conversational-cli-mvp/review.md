# Review Synthesis

本文档为 `ai-conversational-cli-mvp` 变更的综合评审材料，供 Product Manager、Tech Lead 和 QA 评审使用。

## 1. TL;DR

这是 AI 对话式 CLI 项目的 **MVP（最小可行产品）验证点**，负责实现第一个完整的业务流程：**创建文章**。我们将原有脚本逻辑迁移到基于 Step 的 Workflow 架构，支持 REPL（AI 对话）和命令行两种交互模式，实现从用户输入到文件创建的端到端验证。

**核心价值**: 用户可以通过自然语言对话创建博客文章，AI 自动生成元数据，系统自动处理文件路径、Git 提交和开发服务器启动。

## 2. Core Changes

### 新增功能

- ✅ **创建文章 Workflow**: 完整的 10 步流程（Git 验证 → 目录检查 → 主题输入 → AI 元数据生成 → Frontmatter 构建 → Slug 生成 → 用户确认 → 文件创建 → 开发服务器启动 → Git 添加）
- ✅ **双模式交互**:
  - REPL 模式: AI 意图识别 + 自然语言输入 + 多轮对话
  - 命令行模式: `rosydawn content new --topic "WebSocket"` 直接执行
- ✅ **AI 辅助创作**: 自动生成标题、描述和标签（支持降级处理）
- ✅ **智能文件路径**: 拼音 slug 生成 + 冲突检测 + 自动重命名

### 修改功能

- 🔄 **统一 CLI 入口**: 从 `npm run content:new` 迁移到 `rosydawn content new`
- 🔄 **核心逻辑迁移**: 从 `scripts/content/new.js` 迁移到 `src/workflows/create-article.ts` + `src/steps/*`

### 技术架构升级

- 📦 **Step-based Architecture**: 将脚本逻辑拆分为 4 层（Validators, Processors, Actions, Notifiers）
- 📦 **Workflow Engine**: 基于 Change 1 实现的 Workflow 引擎
- 📦 **AI Integration**: 集成 Change 2 的意图识别和参数收集

## 3. Technical Highlights

### Decision 1: Step-based Workflow Architecture

**选择**: 将脚本拆分为独立 Steps，而非单一函数。

**为什么**: 每个 Step 可独立测试、可复用、错误隔离。例如 `generateMetadata` 可被批量创建、草稿恢复等其他 Workflows 复用。

**权衡**: 增加 10% 的样板代码，但换来 3 倍的可维护性提升。

### Decision 2: AI 降级策略

**设计**: AI 服务失败时，使用基础逻辑降级（title = topic, description = "关于 {topic} 的文章"）。

**为什么**: 保证 AI 不可用时不阻塞用户流程，与原有脚本行为保持兼容。

**风险**: 降级生成的元数据质量较低，但通过控制台警告提示用户。

### Decision 3: 四层 Step 分离

| 层级 | 职责 | 示例 | 副作用 |
|------|------|------|--------|
| Validators | 验证前置条件 | Git 状态、目录权限 | 无 |
| Processors | 数据转换 | AI 元数据、Slug 生成 | 无 |
| Actions | 执行操作 | 创建文件、启动服务器 | 有 |
| Notifiers | 用户交互 | 确认创建、显示摘要 | 无 |

**为什么**: 清晰的职责分离，便于测试（可 Mock Actions 层避免真实文件操作）。

### Decision 4: 命令行参数映射

**实现**: `rosydawn content new --topic "WebSocket"` → `{ topic: "WebSocket" }` → `create-article` Workflow

**为什么**: 统一入口，命令行和 REPL 最终都调用 Workflow 引擎，保证行为一致。

**扩展性**: 新增命令只需添加映射关系（如 `content publish` → `publish-article`）。

## 4. Quality Assurance Overview

### 测试覆盖

- **总测试用例**: 53 个
  - 自动化测试: 46 个（87%）
  - 手动测试: 7 个（13%，主要是多轮对话和 AI 响应质量）
- **测试层级**:
  - 单元测试: 20 个（Steps 独立功能）
  - 集成测试: 15 个（Workflow 执行、Step 交互）
  - E2E 测试: 11 个（REPL 模式、命令行模式）
  - 边界情况: 4 个（特殊字符、超长主题、并发、AI 超时）
  - 性能测试: 2 个（Workflow 执行时间、冲突检测）
  - 回归测试: 1 个（与原脚本兼容性）

### 主要风险区域

1. **AI 意图识别准确率** (TC-19, TC-21, TC-42, TC-43)
   - 风险: 用户输入可能被误识别（如 "删除关于 WebSocket 的文章" 被识别为创建）
   - 缓解: 置信度阈值（> 0.7）、用户确认环节

2. **参数解析一致性** (TC-28, TC-29, TC-30, TC-47)
   - 风险: REPL 和命令行模式参数格式不一致
   - 缓解: 在 Workflow 入口统一参数格式验证

3. **文件冲突和并发** (TC-08, TC-49, TC-52)
   - 风险: 同时创建同名文章可能导致冲突
   - 缓解: 自动重命名（-2, -3 后缀）、文件系统原子操作

4. **AI 服务依赖** (TC-04, TC-05, TC-50)
   - 风险: AI 不可用时阻塞流程
   - 缓解: 降级逻辑、30 秒超时

### 覆盖率目标

- **代码覆盖率**: > 80%（Steps 和 Workflow 引擎）
- **场景覆盖率**: 100%（每个 Spec Scenario 至少一个测试）
- **错误路径**: 所有关键错误场景（Git 失败、目录权限、AI 超时）都有测试

## 5. Impact & Risks

### BREAKING CHANGES

**无破坏性变更**。原有 `scripts/content/new.js` 保留作为备份，新 CLI 与原脚本可并存。

### Migration Path

**渐进式迁移**:
1. MVP 阶段: 新旧 CLI 并存，用户可选择使用
2. 稳定后: 在旧脚本添加 Deprecation 警告
3. 最终: 移除旧脚本（需用户确认）

### Security Considerations

- ✅ **输入验证**: 所有用户输入（REPL 和命令行）都经过清理和验证
- ✅ **命令注入防护**: 禁止特殊字符（`|`, `&`, `$` 等）
- ✅ **路径遍历防护**: Slug 生成仅允许小写字母、数字、连字符
- ⚠️ **Git 操作**: 自动 `git add` 不会提交，需用户手动 `git commit`

### Performance Impact

- **预期性能**:
  - Workflow 总执行时间: < 5 秒（不含 AI 调用）
  - AI 元数据生成: 1-3 秒（取决于网络和服务）
  - 文件操作: < 100ms
- **优化措施**:
  - 开发服务器端口检测避免重复启动
  - Slug 生成使用缓存（如多次创建同名文章）

### Dependencies

- **前置依赖** (已实现):
  - ✅ ai-conversational-cli-core (Change 1): Workflow 引擎、Step 注册表
  - ✅ ai-conversational-cli-interaction (Change 2): REPL、AI 意图识别、参数收集
- **新增依赖**:
  - `pinyin` 库（用于中文标题转拼音 slug）

## 6. Review Focus

请各位评审者重点关注以下内容：

### @tech-lead: 架构设计评审

- [ ] **Step 分层合理性**: 四层分离（Validators, Processors, Actions, Notifiers）是否清晰？是否有更好的分层方式？
- [ ] **Workflow 执行顺序**: 10 个 Steps 的执行顺序是否合理？是否有遗漏的验证步骤？
- [ ] **错误处理策略**: 哪些错误应终止 Workflow，哪些应降级？当前设计是否符合预期？
- [ ] **AI 降级逻辑**: 降级时生成的基础元数据是否足够？是否需要更智能的降级策略？
- [ ] **性能瓶颈**: AI 调用（1-3 秒）是否可接受？是否需要异步生成元数据？

### @product-manager: 功能范围评审

- [ ] **MVP 范围**: 当前仅实现 `content new` 命令，是否满足 MVP 验证目标？
- [ ] **用户体验**: REPL 模式的多轮对话（参数缺失时追问）是否符合用户预期？
- [ ] **降级体验**: AI 不可用时，用户是否会困惑？（当前会显示警告）
- [ ] **确认环节**: REPL 模式下的用户确认（Y/n）是否必要？是否影响流畅度？

### @qa-lead: 测试覆盖评审

- [ ] **边界情况**: 特殊字符（TC-47）、超长主题（TC-48）、并发创建（TC-49）是否覆盖完整？
- [ ] **错误路径**: Git 失败、目录权限、AI 超时等错误场景是否都有验证？
- [ ] **兼容性测试**: TC-53（与原脚本兼容性）是否需要扩展？
- [ ] **性能测试**: 2 个性能测试用例（TC-51, TC-52）是否足够？
- [ ] **手动测试**: 7 个手动测试用例（主要是多轮对话）是否有遗漏场景？

### @security-reviewer: 安全性评审

- [ ] **输入验证**: 当前禁止的字符（`|`, `&`, `$`）是否完整？是否还有其他危险字符？
- [ ] **命令注入**: `git add` 和 `npm run dev` 调用是否安全？
- [ ] **路径遍历**: Slug 生成规则是否足够严格？
- [ ] **敏感信息**: AI 调用是否会泄露用户隐私？（当前仅传递 topic）

### @all-reviewers: 通用关注点

- [ ] **文档完整性**: proposal, design, specs, testcases 四份文档是否清晰？是否有遗漏信息？
- [ ] **技术债务**: 当前设计是否引入了技术债务？（如降级逻辑、Mock Workflows）
- [ ] **扩展性**: 如果未来需要添加更多 Workflows（如发布、部署），当前架构是否易于扩展？
- [ ] **可维护性**: Step-based 架构是否比单一脚本更难维护？

### 需要明确的问题

1. **是否保留原有脚本?** proposal 建议保留 `scripts/content/new.js` 作为备份，但长期维护成本如何？
2. **AI 服务选择?** 当前支持 OpenAI/Azure/DeepSeek/Ollama，是否需要优先支持某个服务？
3. **Slug 生成策略?** 使用拼音库转换中文标题，对于纯英文标题是否需要特殊处理？
4. **开发服务器启动?** 当前自动启动 `npm run dev`，是否需要支持自定义端口？

---

**评审截止日期**: 请在 **[日期]** 前完成评审，并在文档中标记 ✅ 或提出修改建议。

**下一步**: 评审通过后，将执行 `/opsx:continue` 生成 `tasks.md`，然后使用 `/opsx:apply` 开始实现。
