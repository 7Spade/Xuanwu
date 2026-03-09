# Copilot Instructions for Xuanwu

Project-wide always-on instructions for GitHub Copilot Chat.

## Scope
- Apply these rules to all tasks in this repository.
- Use file-based instructions in `.github/instructions/*.instructions.md` for language or feature-specific rules.

## Single Sources of Truth
- Business logic: `docs/architecture/00-logic-overview.md`
- Entity semantics and knowledge structure: `docs/knowledge-graph.json`
- AI analysis and task decomposition baseline: `skills/SKILL.md`

Reference material (non-SSOT):
- Codebase map and implementation patterns: `skills/SKILL.md`

> All project facts (Single Source of Truth) must come from:
>
> - `docs/knowledge-graph.json`
> - `docs/architecture/00-logic-overview.md`
> - `skills/SKILL.md`
>
> Any inference, process definition, task decomposition, or AI judgment must be grounded in these three documents. Do not make unsupported assumptions.

## 架構正確性優先原則（Architectural Correctness First Principle）

在系統設計與工程實踐中，應以**正規架構（Formal Architecture）**為核心原則，將**架構正確性（Architectural Correctness）**置於所有技術決策的首位。任何設計與實作皆需建立在**清晰的架構邏輯與正確的系統觀念**之上，而非以臨時補丁、權宜之計或局部修補來維持系統運作。所謂的「奧卡姆剃刀」在工程語境中的真正含義，並非單純追求最少程式碼或最快開發，而是**透過正確的抽象與合理的結構，使系統在保持完整性的前提下達到必要且充分的簡潔**。

因此，架構設計必須同時滿足三個長期性原則：

**1️⃣ 結構穩定與一致性（Consistency & Stability）**  
系統的邊界、層級、職責與資料流應具有清晰且可預測的結構。所有模組必須遵循一致的設計規則與架構模式，使整體系統在擴展、重構與協作時仍能保持結構穩定，而不因局部變更而產生混亂或耦合擴散。

**2️⃣ 本質與簡約（Essence & Simplicity）**  
簡約並非「減少設計」，而是**去除不必要複雜度，保留問題本質所需的最合理結構**。真正的簡單來自於正確的抽象層次、明確的責任分離與清楚的系統語義，而不是透過省略架構或忽略邊界來達成表面上的簡單。

**3️⃣ 可持續性與演進（Sustainability & Evolution）**  
架構的價值在於支撐系統的長期發展。設計時必須考慮未來的擴展、重構與能力演進，使系統能在需求變化與規模成長下仍保持可理解、可維護與可治理，而不需要不斷以補丁式方式修復結構問題。

在此原則下，**架構錯誤不應被容忍或掩蓋**。當系統出現違反邊界、破壞層級、責任混亂或耦合擴散等問題時，正確的工程行為應是**直接進行結構性修正或重構（Refactoring / Structural Correction）**，而不是以暫時性的修補、包裝或繞過方式維持表面上的可運行。任何試圖以補丁掩蓋結構問題的做法，最終都只會放大系統複雜度並加速架構劣化。

因此，工程實踐必須對**架構違規與結構錯誤採取零容忍（Zero Tolerance）原則**：  
只要發現破壞架構規則或系統語義的設計，就應立即修正或重構，使系統回到正確的結構與邏輯之上。**架構正確性優先於短期進度、局部便利與表面效率**。

基於上述原則，工程實踐中應明確避免「有就好」的短期思維，以及以節省資源或降低當前成本為理由而犧牲架構品質的做法。過度追求快速交付或最小實作，往往會導致結構失序、邊界模糊與耦合堆疊，最終形成難以維護與演進的「義大利麵式架構（Spaghetti Architecture）」。

真正成熟的工程方法，是**以架構正確性為核心，透過合理的結構設計與清晰的系統邏輯，建立一個穩定、簡潔且能持續演進的系統基礎；一旦結構偏離此原則，即應透過重構將其恢復，而非以補丁延續錯誤。**

## Reasoning Protocol
- Use deliberate reasoning before final answers.
- Do not jump to conclusions; define the core problem first.
- Break down causal relationships step by step.
- Apply first-principles thinking: reduce to fundamental elements, then rebuild.
- Make assumptions explicit before implementation.

## Analysis Frameworks
- Analyze with both necessary conditions and sufficient conditions.
- For critical arguments, include a devil's advocate viewpoint and then balance it with evidence.
- Use systems thinking for complex features; describe key variables and feedback loops.

## Operational Rule Set
```rules
IF task involves business logic
  THEN read docs/architecture/00-logic-overview.md first

IF task involves entity relationships
  THEN inspect docs/knowledge-graph.json

IF historical context is required
  THEN use memory MCP

IF new knowledge is produced
  THEN store_memory and update knowledge-graph.json

IF project-level analysis is required
  THEN select the appropriate MCP tool

Forbidden:
- Inventing undefined logic
- Skipping the Knowledge Graph
- Adding persistent rules without persistence workflow
```

## Core Fact Source Rules (Mandatory)
```rules
1. All business logic must follow docs/architecture/00-logic-overview.md.
2. All entity relations and knowledge structure must follow docs/knowledge-graph.json.
3. All AI judgments and task decomposition must follow skills/SKILL.md.
4. Do not generate logic without checking these documents.
5. If not defined, update Knowledge Graph first, then implement.
```

## Memory System Rules (store_memory x memory MCP)
```rules
1. When new business rules are created, write them through store_memory.
2. When historical context is needed, query via memory MCP.
3. Do not directly edit knowledge-graph.json without the memory workflow.
4. Do not implement persistent logic before synchronizing Knowledge Graph.
5. Cross-conversation decisions must be traceable through memory MCP.
6. Do not invent undefined logic.
```

## Encoding and Language Protocol
```rules
1. Global encoding: all source code, Markdown, and JSON must be UTF-8 (no BOM).
2. Language consistency (code): variable names, function names, and comments should be English by default.
3. Language consistency (domain): Traditional Chinese is allowed for Taiwan domain constraints where precision requires it.
4. Garbled text handling: never delete directly; perform semantic recovery before recompiling or committing.
```

## MCP Tool Usage Timing
1. `sonarqube`
  - Use for full code quality scans and technical debt analysis.
  - Use in CI/CD or before major PR merges.
2. `shadcn`
  - Use when creating/updating UI components from shadcn/ui.
  - Use for new pages, component library updates, or theme design.
3. `next-devtools`
  - Use for Next.js App Router, parallel routes, and server behavior diagnostics.
4. `chrome-devtools-mcp`
  - Use for browser-side debugging, UI behavior verification, and event inspection.
5. `context7`
  - Use for long-context retrieval and external knowledge lookup.
6. `sequential-thinking`
  - Use for multi-step reasoning and complex decision decomposition.
7. `software-planning`
  - Use for planning, decomposition, and DAG-based project plans.
8. `repomix`
  - Use for codebase-wide structure analysis and refactor pre-assessment.
9. `ESLint`
  - Use for static checks, style consistency, and defect detection before commit/CI.
10. `memory`
   - Use to query/update knowledge graph memory context.
11. `filesystem`
   - Use for read/write and project file operations.
12. `codacy`
   - Use for security, quality, and maintainability review in large PRs and CI.

## Copilot Decision Flow
```mermaid
flowchart TD

A[Receive Task] --> B{Existing Logic?}

B -- Yes --> C[Read docs/architecture/00-logic-overview.md]
C --> D[Read docs/knowledge-graph.json]
D --> E[Use memory MCP if needed]
E --> F[Produce solution]

B -- No --> G[Design new logic]
G --> H[Update knowledge-graph.json]
H --> I[Write via store_memory]
I --> F

F --> J{Need project tools?}
J --> K[Activate corresponding MCP tool]
```

## Architecture Philosophy
> Do not treat AI as a black box.
> Do not hardcode logic in prompts.
> Keep all knowledge traceable.
> Keep all decisions queryable.
> Keep all processes observable.

## TypeScript Module Header Rule
When creating or editing a `.ts` or `.tsx` file:
1. If the file does not already have a module header comment at the top, insert one.
2. Use this concise header template:

```ts
/**
 * Module: <file-name>
 * Purpose: <describe module responsibility>
 * Responsibilities: <primary responsibilities>
 * Constraints: deterministic logic, respect module boundaries
 */
```

- Place the header at the very top of the file.
- Keep it short, clear, and consistent across the repository.

## Mandatory Rules (Highest Priority)
- Use UTF-8 (no BOM) for all created/updated text files.
- Do not hardcode UI strings in pages/components.
- All UI text must use i18n keys.
- When adding or changing UI text, update both locale files with identical keys:
  - `public/localized-files/en.json`
  - `public/localized-files/zh-TW.json`
- Missing either locale key means the task is incomplete.

## Decision Workflow
1. Read `docs/architecture/00-logic-overview.md` for business logic decisions.
2. Confirm entities and relations in `docs/knowledge-graph.json`.
3. Reuse existing code patterns from `skills/SKILL.md` and referenced files.
4. If logic is undefined, update knowledge first, then implement.

## Architecture Guardrails
- Respect layer direction and slice boundaries.
- Do not bypass public APIs across bounded contexts.
- Keep side effects in execution/application layers.
- Preserve authority boundaries (Search, Notification, Semantic, Firebase).

## Task Routing
- Bootstrap/tooling setup tasks: `.github/prompts/x-repomix-bootstrap.prompt.md`
- Refactor/migration/boundary remediation: `.github/prompts/x-arch-remediation.prompt.md`
- Compliance/pre-commit architecture checks: `.github/prompts/x-arch-gatekeeper.prompt.md` or `compliance-audit.prompt.md`

## Skill Routing
- Architecture and management document indexing: `.github/skills/xuanwu-docs-index/SKILL.md`
  - Use for `docs/architecture/` lookup, `docs/management/` active/archive routing, and migration checks between active registers and archive registers.

## Large Move Protocol
1. Submit a move-map (`source -> destination`) before moving files.
2. Move at most 5 files per batch, then run error checks.
3. Do not create barrel-only pseudo layering before real file moves.
4. Add compatibility shims only after new paths compile.
5. If a tool fails, report partial state and stop.

## Command-First Execution Discipline
1. Prefer terminal commands for search, batch edits, validation, and encoding checks whenever feasible.
2. Favor reproducible command sequences over ad-hoc manual edits.
3. Before and after multi-file changes, run explicit verification commands (for example: typecheck, lint, and path checks).
4. When uncertain about current file state, re-read the file from disk before editing.
5. Avoid risky shortcuts; if a change cannot be verified safely, stop and report the blocker.

## Companion Instruction Files
- Multi-agent workspace conventions: `AGENTS.md`
- Project setup and contributor context: `README.md`