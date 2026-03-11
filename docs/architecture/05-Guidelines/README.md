# 05-Guidelines：架構指引與合規指南

> 本文件為 PR 審查、命名規範、重構策略的操作指引。
> 所有指引以 `00-logic-overview.md`（拓撲 SSOT）與 `Xuanwu-Semantic-Kernel-and-Matchmaking-Protocol.md`（協議 SSOT）為最高優先。

## 1. SSOT 合規檢查清單（PR Review Compliance）

凡 PR 觸及以下路徑，必須驗證對應規則：

| 改動範疇 | 必須驗證的規則 |
|----------|---------------|
| Phase 1 寫入路徑（L2-L3-L4-L5） | D29 TransactionalCommand、FI-002 單交易、LANE 分流 |
| Phase 2 匹配路徑（L10 Genkit 流） | E8 fail-closed（tenantId）、GT-2 fail-closed（certs）、Tool-S/M/V 呼叫順序 |
| Phase 2 稽核（L4A） | L4A 五大欄位 Who/Why/Evidence/Version/Tenant 完整性 |
| Phase 3 讀取路徑（L6 查詢） | S2 版本守衛、D27 物化任務閘 |
| VS8 語義權威 | D21-A 唯一語義登錄、Tag lifecycle、OT-2/OT-3 分類法 |
| 金融流程（VS9） | #A20 Staging Pool、#A21 獨立生命週期、#A22 投影契約 |

## 2. 參與者命名規範（Participant Naming Convention）

程式碼和文件中必須使用以下標準名稱：

| 識別符 | 說明 | 典型位置 |
|--------|------|----------|
| `VS0` | 核心內核（Kernel/SDK） | `src/shared-kernel/` |
| `L0` | 外部入口 | `src/app/` (UI) |
| `L0A` | CQRS 閘道（API Ingress） | `src/shared-infra/api-gateway/` |
| `L0B` | Server Action 串流橋接 | `src/app/**/_actions.ts` |
| `L2` | 命令管線（Write Pipeline） | `src/shared-infra/gateway-command/` |
| `L3` | 領域切片（VS1-VS9） | `src/features/*.slice/` |
| `L4` | 事件路由器（IER/LANE） | `src/shared-infra/event-router/` |
| `L4A` | 語義決策稽核切片 | `src/features/semantic-graph.slice/audit/` |
| `L5` | 投影總線 | `src/shared-infra/projection-bus/` |
| `L6` | 查詢閘道 | `src/shared-infra/gateway-query/` |
| `L8` | 數據持久層（Firebase） | `src/shared-infra/firebase-*/` |
| `L10` | Genkit AI 編排器 | `src/features/semantic-graph.slice/genkit-flows/` |
| `Tool-S` | search_skills 工具 | `...genkit-tools/search-skills.tool.ts` |
| `Tool-M` | match_candidates 工具 | `...genkit-tools/match-candidates.tool.ts` |
| `Tool-V` | verify_compliance 工具 | `...genkit-tools/verify-compliance.tool.ts` |

## 3. Phase 進展準則（Phase Progression Guidelines）

- **Phase 0**（核心初始化）：確認 VS0 contracts 已注入 D3；確認 VS8 tag ontology 已建立（Admin→L8）
- **Phase 1**（寫入鏈）：所有業務命令必須透過 L0A → L2 → L3；每個 D3 寫入必須攜帶 D29 TransactionalCommand 標記並使用 FI-002 單一 Firestore 事務；整合事件必須指定 LANE（CRITICAL / STANDARD）
- **Phase 2**（智慧匹配）：L10 Genkit 流程必須按序呼叫 Tool-S → Tool-M → Tool-V；Tool-M 必須帶 tenantId（E8 fail-closed）；Tool-V 必須完成後才輸出（GT-2 fail-closed）；L4A 稽核記錄必須完整（5 欄位）
- **Phase 3**（讀取鏈）：所有查詢請求必須透過 L0A → L6 → L5；不可直接讀取 L3 Aggregate；遵循 S2 版本守衛

## 4. 重構批次策略（Refactoring Batch Strategy）

1. 優先收斂 canonical paths（停止新增 legacy 落點）
2. 以 Slice 為單位批次遷移（不拆分 Slice 跨批次）
3. 每批次遷移後執行 `99-checklist.md` 驗證
4. 涉及 L4A 稽核路徑的遷移須額外驗證 5 大欄位完整性

## 5. 例外申請流程（Exception Process）

如需偏離上述規則，須：
1. 在 PR description 引用具體規則 ID（如 E8、GT-2、FI-002）
2. 說明偏離原因與風險評估
3. 獲得架構審查門 (Architecture Review Gate) 批准
4. 在 `99-checklist.md` 對應項目中標記例外原因
