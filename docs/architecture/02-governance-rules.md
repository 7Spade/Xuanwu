# 治理視圖 (Governance View)

> **原始檔（Source of Truth）**：完整 Mermaid 源碼與所有規則的正式定義請見 [`00-logic-overview.md`](./00-logic-overview.md)
>
> 邏輯流圖請見 [`01-logical-flow.md`](./01-logical-flow.md) · 基礎設施路徑請見 [`03-infra-mapping.md`](./03-infra-mapping.md)

本視圖為所有治理規則的 **可讀治理視圖（Governance View）**，包含完整規則正文，供審查、快速查閱與落地參照使用。
Mermaid 架構源碼與機器可解析格式（Canonical Mermaid Source）請見 `00-logic-overview.md`；
若本文件文字描述與 `00-logic-overview.md` 有衝突，以 `00-logic-overview.md` 為準。

---

## 規則分類說明

| 分類 | 代碼 | 說明 |
|------|------|------|
| 穩定不變量 | `R / S / A / #` | MUST — 版本演進不可破壞 |
| 治理演進 | `D / P / T / E` | SHOULD — 可演化，以索引引用；不重複定義 |
| 絕對禁止 | FORBIDDEN | MUST NOT — 任何情況均不得違反 |

> **治理視圖說明**：SHOULD（D/P/T/E）規則可在特定控制面語境中視同 MUST 執行——這是**治理視圖選擇**，非正式 RULESET 重分類。
> 代表案例：`D7`（CP1 系統穩定基石）、`E7/E8`（Security Gate 閉環）。

---

## 架構控制面 (Architecture Control Plane)

> **CP1–CP4 定性說明**：CP1–CP4 為依執行優先序分組的**治理視圖**，非正式 RULESET 分類（正式分類見 § 規則分類說明）。CP 分組供實際審查與重構時快速判準使用。

### CP1 MUST：Hard Invariants（系統穩定基石）

任何重構不得破壞：
- `[R8]` traceId 唯讀
- `[S2]` 版本守衛
- `[S4]` SLA 常數單一真相
- `[D7]` 跨切片公開 API 邊界
- `[A12/A13]` 副作用與搜尋權威出口

### CP2 MUST：Cross-cutting Authorities（職責邊界與權威出口）

- 全域搜尋只經 `Global Search`
- 通知副作用只經 `Notification Hub`
- 任務語義與成本決策由 `VS8` 提供全域基線
- 組織自訂 task-type / skill-type 語義必須經 `VS4 org-semantic-registry` 治理並投影到 tag-snapshot

### CP3 MUST：Layering Rules（層級通訊）

- 命令由 L2 收口
- 事件由 L4 分發
- 投影由 L5 物化
- 讀取由 L6 暴露
- Feature Slice 不得跨層旁路（含 Firebase SDK 旁路與 Projection 直寫）

### CP4 SHOULD：Governance Rules（治理與演化）

- 新規則先索引、再實作
- 優先引用現有契約
- 全域語義進 VS8 註冊，組織 task-type/skill-type 進 VS4 org-semantic-registry 註冊
- D27 屬 Extension Gate，僅影響 document-parser / finance-routing 變更

---

## 最終審查基準 (Final Review Baseline)

### 本輪必審範圍

1. **VS0–VS8**：每個編號域必須有明確層位與單一職責
   - `VS0`：L1+L0+L2+L4+L5+L6+L7+L9+L10（L8 = Firebase 外部平台，不在 VS0 管轄）
   - `VS1–VS8`：L3
   - VS0 檢核：每個 VS0 路徑必須標明 `VS0-Kernel` 或 `VS0-Infra`（不得混稱）
2. **D1–D27**：列為 Mandatory Gate（D27 為 Extension Gate，命中場景必審）
   - `E7/E8`：AI/Firebase Security 閉環 Gate（命中 AI flow 或受保護入口時必審）
3. **TE1–TE6**：語義引用必須強型別，禁止裸字串 `tagSlug`
4. **S1–S6**：契約與 SLA 僅能引用 `SK_*` 常數，禁止硬寫
5. **L/R/A**：Layer 合規 / Rule 合規 / Atomicity 合規 必須同時成立
6. **Boundary Serialization Gate**：Client → Server action 僅允許 Command DTO（plain object）

### Rule Canonicality（單一定義治理）

- **Canonical Rule Body**：UNIFIED DEVELOPMENT RULES（D1–D27 + E7/E8）
- Secondary Sections 只允許「索引引用 + 審查語句」，不得擴寫第二份規則正文
- IF Secondary 與 Canonical 衝突 THEN 以 Canonical 為準，Secondary 必須在同一 PR 修正
- IF 新增規則 THEN 必須先在 Canonical 定義，再回填索引（避免雙重真相）

### No-Smell 定義（Code Review Checklist）

- 無重複定義：同一規則只保留一個主定義
- 無邊界污染：Feature Slice 不跨邊界 mutate、不直連 `firebase/*` [D24]
- 無語義漂移：tag 語義必須來自「VS8 CTA 全域標籤」或「VS4 組織標籤治理」合法來源 [D21-1 D22]
- 無一致性破口：Projection 全量遵守 S2；SLA 全量遵守 S4
- 無副作用旁路：通知與搜尋必須經 D26 權威出口

---

## 關鍵約束索引（Hard Invariants + Governance Rule Reference）

| 索引 | 規則 |
|------|------|
| `[R8]` | `traceId` 在 CBG_ENTRY 注入一次，全鏈唯讀不可覆蓋 |
| `[S2]` | 所有 Projection 寫入前必須呼叫 `applyVersionGuard()` |
| `[S4]` | SLA 數值只能引用 `SK_STALENESS_CONTRACT`，禁止硬寫 |
| `[D7]` | 跨切片引用只能透過 `{slice}/index.ts` 公開 API |
| `[D21]` | VS8 四層語義引擎：Governance → Core Domain → Compute Engine → Output |
| `[D21-*]` | VS8 語義擴展不變量（D21-1~D21-10、D21-A~D21-K、D21-S~D21-X，共 27 條）；完整定義見下方 §D21 各子節（一~六） |
| `[T5]` | 業務 Slice 僅能訂閱 `projections/tag-snapshot.slice.ts`，嚴禁直接存取 `graph/adjacency-list.ts` |
| `[D22]` | 程式碼禁止出現裸字串 tag_name；全域引用 TE1~TE6，組織自訂用 `OrgTagRef(orgId, tagSlug)` |
| `[D27-A]` | 語義感知路由：所有分發邏輯必須先調用 `policy-mapper/` 轉換語義標籤 |
| `[D24]` | Feature slice 禁止直接 import `firebase/*`，必須走 `SK_PORTS` |
| `[D26]` | `global-search` = 唯一搜尋權威；`notification-hub` = 唯一副作用出口 |
| `[#A12]` | Global Search = 唯一跨域搜尋出口，禁止各 Slice 自建搜尋邏輯 |
| `[#A13]` | Notification Hub = 唯一副作用出口，業務 Slice 只產生事件不決定通知策略 |
| `[#A14]` | `ParsedLineItem.(costItemType, semanticTagSlug)` (Layer-2) 由 VS8 `_cost-classifier.ts` 標注；Layer-3 只允許 EXECUTABLE 物化為 tasks |
| `[#A15]` | Finance 進入閘門：僅 Acceptance=OK 才可進入 Finance |
| `[#A16]` | Multi-Claim Cycle：Finance 為可重入循環，直到 `outstandingClaimableAmount = 0` 才允許 Completed |
| `[#A17]` | XP 僅能由 VS3 寫入；`awardedXp = baseXp × qualityMultiplier × policyMultiplier`（含 clamp）；VS8 禁止直接寫入 VS3 XP aggregate/ledger |
| `[#A18]` | 組織新建 task-type/skill-type 必須走 VS4 org-semantic-registry，以 org namespace 寫入 tag-snapshot |
| `[D28]` | vis-network / vis-timeline / vis-graph3d 只能消費 `VisDataAdapter` 提供的 `DataSet<>`；`VisDataAdapter` 訂閱 Firebase 一次，DataSet<> 快取推播至所有消費者；禁止 vis-* 直連 Firebase |

---

## 絕對禁止 (Forbidden — RULESET-FORBIDDEN)

- BC_X 禁止直接寫入 BC_Y aggregate → 必須透過 IER Domain Event
- TX Runner 禁止產生 Domain Event → 只有 Aggregate 可以 [#4b]
- `SECURITY_BLOCK` DLQ → 禁止自動 Replay，必須人工審查
- B-track 禁止回呼 A-track → 只能透過 Domain Event 溝通
- Feature slice 禁止直接 `import firebase/*` [D24]
- **Next.js Server Components / Server Actions / Edge Functions 禁止直接 `import firebase-admin`**；`firebase-admin` 一律透過 `src/shared-infra/backend-firebase/functions`（Cloud Functions）[D25]
- Feature slice 禁止直接 `import @/shared-infra/*`；僅可依賴 `SK_PORTS` / Query Gateway / slice public API
- Notification Hub 禁止直接依賴 L7 具體 Adapter；必須經 Port 或 Gateway 公開介面
- Feature slice 禁止自建搜尋邏輯，必須透過 Global Search [D26 #A12]
- Feature slice 禁止直接 call `sendEmail/push/SMS`，必須透過 Notification Hub [D26 #A13]
- 禁止 L6 Query Gateway 反向驅動 L2 Command Gateway（讀寫鏈不得形成回饋環）
- 禁止 VS8 直接下命令至 VS5/VS6；僅可透過 L4 事件或 L5/L6 投影互動
- VS5 document-parser 禁止自行實作成本語義邏輯，必須呼叫 VS8 `classifyCostItem()` [D27 #A14]
- Layer-3 Semantic Router 禁止繞過 `costItemType` 直接物化非 EXECUTABLE 項目為 tasks
- Workflow 禁止在 Acceptance 未達 OK 前進入 Finance [#A15]
- Claim Preparation 禁止送出空請款或 quantity ≤ 0 的 line item [#A15]
- Finance 禁止跳過 Claim/Invoice/PaymentTerm 任一步驟直接收款確認 [#A16]
- `outstandingClaimableAmount > 0` 時禁止標記 Completed [#A16]
- `ParsingIntent.lineItems` 禁止缺少 `semanticTagSlug`；UI 視覺屬性禁止直接讀 adjacency-list [T5]
- 業務切片（VS1–VS6，除 VS4 org-semantic-registry）禁止私自宣告語義類別 [D21-1]
- 禁止使用隱性字串傳遞語義；全域引用必須指向 TE1–TE6 [D21-2]
- 孤立標籤（無 parentTagSlug）禁止在系統中存在 [D21-3]
- 跨切片決策禁止硬編碼業務對象 ID，必須基於標籤語義權重 [D21-5]
- 語義讀取禁止直連資料庫，必須經由 `projection.tag-snapshot` [D21-7]
- 業務端禁止直接存取 `graph/adjacency-list.ts` [T5]
- 業務端禁止自行計算語義相似度/加權，必須透過 `weight-calculator.ts` [D21-E]
- 通知/排班分發禁止基於業務 ID 硬編碼路由，必須走 `policy-mapper/` [D27-A]
- `learning-engine.ts` 禁止手動隨機修改神經元強度 [D21-G]
- 語義衝突提案禁止繞過 `invariant-guard.ts`，BBB 擁有最高裁決權 [D21-H D21-K]
- 合併提案通過後禁止直接刪除舊標籤，必須轉為 Alias 重定向 [D21-S]
- 用戶新增重複語義標籤時禁止靜默建立，embeddings 必須即時提示 [D21-U]
- VS8 禁止直接寫入 VS3 XP aggregate/ledger [A17]
- VS5 任務/品質流程禁止直接 mutate VS3 XP；必須透過 IER 事件進入 VS3 [#2 D9 A17]
- vis-network / vis-timeline / vis-graph3d 禁止直連 Firebase；必須透過 `VisDataAdapter` DataSet<> 消費 [D28]
- `VisDataAdapter` 禁止在多個元件重複建立 Firebase 訂閱；DataSet<> 快取必須為唯一寫入點 [D28]
- 禁止在 Aggregate Transaction 外部先寫 Aggregate 再補寫 Outbox（雙重寫入模式）[D29]
- 禁止 L2 CBG_ROUTE 的 Command Handler 在 Transaction 外部以兩步驟執行寫入 [D29]
- 禁止在 `hopCount ≥ 4` 後繼續轉發事件；禁止對 `CircularDependencyDetected` 觸發的 SECURITY_BLOCK DLQ 自動 Replay [D30]
- 讀路徑禁止重新執行複雜的 Aggregate 鑑權邏輯；讀寫授權必須依賴 `acl-projection` [D31]
- 禁止開發者在業務代碼中手動傳遞 `traceId`；上下文傳遞由底層 Middleware 自動維持 [R9]

---

## 一致性不變量 (Consistency Invariants #1–#19)

| 索引 | 規則 |
|------|------|
| `#1` | 每個 BC 只能修改自己的 Aggregate |
| `#2` | 跨 BC 僅能透過 Event / Projection / ACL 溝通 |
| `#3` | Application Layer 只協調，不承載領域規則 |
| `#4a` | Domain Event 僅由 Aggregate 產生（唯一生成者） |
| `#4b` | TX Runner 只投遞 Outbox，不產生 Domain Event |
| `#5` | Custom Claims 只做快照，非真實權限來源 |
| `#6` | Notification 只讀 Projection |
| `#7` | Scope Guard 僅讀本 Context Read Model |
| `#8` | Shared Kernel 必須顯式標示；未標示跨 BC 共用視為侵入 |
| `#9` | Projection 必須可由事件完整重建 |
| `#10` | 任一模組需外部 Context 內部狀態 = 邊界設計錯誤 |
| `#11` | XP 屬 Account BC；Organization 只設門檻 |
| `#12` | Tier 永遠是推導值，不存 DB |
| `#13` | XP 異動必須寫 Ledger |
| `#14` | Schedule 只讀 `ORG_ELIGIBLE_MEMBER_VIEW` |
| `#15` | eligible 生命週期：joined→true · assigned→false · completed/cancelled→true |
| `#16` | Talent Repository = member + partner + team |
| `#17` | `centralized-tag.aggregate` 為 tagSlug 唯一真相 |
| `#18` | workspace-governance role 繼承 policy 硬約束 |
| `#19` | 所有 Projection 更新必須以 aggregateVersion 單調遞增為前提 [S2 泛化] |

---

## 原子性審計 (Atomicity Audit #A1–#A18)

| 索引 | 規則 |
|------|------|
| `#A1` | wallet 強一致；profile/notification 弱一致 |
| `#A2` | org-account.binding 只 ACL/projection 防腐對接 |
| `#A3` | blockWorkflow → `blockedBy Set`；allIssuesResolved → unblockWorkflow |
| `#A4` | ParsingIntent 只允許提議事件 |
| `#A5` | schedule 跨 BC saga/compensating event |
| `#A6` | 全域語義權威 = VS8 `CENTRALIZED_TAG_AGGREGATE`；組織擴展權威 = VS4 `org-semantic-registry` [D21-1] |
| `#A7` | Event Funnel 只做 compose |
| `#A8` | TX Runner 1cmd/1agg 原子提交 |
| `#A9` | Scope Guard 快路徑；高風險回源 aggregate |
| `#A10` | Notification Router 無狀態路由 |
| `#A11` | eligible = 「無衝突排班」快照，非靜態狀態 |
| `#A12` | Global Search = 跨切片權威（語義門戶），唯一跨域搜尋出口 |
| `#A13` | Notification Hub = 跨切片權威（反應中樞），唯一副作用出口 |
| `#A14` | Cost Semantic 雙鍵分類（Layer-2）= VS8 `_cost-classifier.ts` 純函式輸出 `(costItemType, semanticTagSlug)`；VS5 Layer-3 僅 EXECUTABLE 物化為 tasks |
| `#A15` | Finance gate：Acceptance=OK 才可進入 Finance；Claim Preparation 必須以「勾選項目 + quantity」建立 claim line items |
| `#A16` | Multi-Claim cycle：Finance 可多次循環，直到 `outstandingClaimableAmount = 0` 才允許 Completed |
| `#A17` | Skill XP Award contract：XP 僅能由 VS3 寫入；`awardedXp = baseXp × qualityMultiplier × policyMultiplier（含 clamp）` |
| `#A18` | Org Semantic Dictionary Extension：組織新建 task-type/skill-type 必須走 VS4 org-semantic-registry，以 org namespace 寫入 tag-snapshot |

---

## 語義標籤規則 (Tag Semantics T1–T8)

| 索引 | 規則 |
|------|------|
| `T1` | 新切片訂閱 `TagLifecycleEvent`（BACKGROUND_LANE）即可擴展 [D21-6] |
| `T2` | `ORG_SKILL_TYPE_DICTIONARY / ORG_TASK_TYPE_DICTIONARY` = 組織作用域可寫 Overlay |
| `T3` | `ORG_ELIGIBLE_MEMBER_VIEW.skills{tagSlug→xp}` 交叉快照 |
| `T4` | 排班職能需求 = `SK_SKILL_REQ × Tag Authority tagSlug` [D21-5] |
| `T5` | `TAG_SNAPSHOT` 消費方禁止寫入 [D21-7]；DocumentParser UI 視覺屬性必須由 semantic-graph.slice 投影讀取 |
| `T6` | 突觸層（VS8_SL）寫入只能透過 `semantic-edge-store.addEdge()`；禁止直接操作 `_edges` 內部狀態 [D21-9] |
| `T7` | `findIsolatedNodes` 在每次 addEdge/removeEdge 後由 VS8_NG 非同步觸發，孤立節點寫入 Observability [D21-10] |
| `T8` | 組織新建語義僅限 task-type/skill-type 類別，且必須使用 org namespace tagSlug（`org:{orgId}:task-type:*`）|

### Semantic Tag Entities 索引（TE1–TE6）

| 索引 | 類型 | tagSlug 格式 |
|------|------|--------------|
| `TE1` `TAG_USER_LEVEL` | `tag::user-level` | `user-level:{slug}` |
| `TE2` `TAG_SKILL` | `tag::skill` | `skill:{slug}` |
| `TE3` `TAG_SKILL_TIER` | `tag::skill-tier` | `skill-tier:{tier}` |
| `TE4` `TAG_TEAM` | `tag::team` | `team:{slug}` |
| `TE5` `TAG_ROLE` | `tag::role` | `role:{slug}` |
| `TE6` `TAG_PARTNER` | `tag::partner` | `partner:{slug}` |

---

## 基礎設施契約索引 (Infrastructure Contracts S1–S6)

| 索引 | 契約 | 說明 |
|------|------|------|
| `S1` | `SK_OUTBOX_CONTRACT` | 三要素：at-least-once / idempotency-key / DLQ 分級 |
| `S2` | `SK_VERSION_GUARD` | aggregateVersion 單調遞增保護（全 Projection） |
| `S3` | `SK_READ_CONSISTENCY` | STRONG_READ vs EVENTUAL_READ 路由決策 |
| `S4` | `SK_STALENESS_CONTRACT` | SLA 常數單一真相（TAG/PROJ_CRITICAL/PROJ_STANDARD） |
| `S5` | `SK_RESILIENCE_CONTRACT` | 外部入口最低防護規格（rate-limit / circuit-break / bulkhead） |
| `S6` | `SK_TOKEN_REFRESH_CONTRACT` | Claims 刷新三方握手（VS1 ↔ IER ↔ 前端） |

---

## 統一開發規則 (Unified Development Rules D1–D27 + E7/E8)

> **規則分層**：Hard Invariants (D1–D20) / Semantic Governance D21–D23 / Infrastructure (D24–D25) / Authority Governance (D26) / Cost Semantic Routing Extension (D27) / AI & Entry Security Closure (E7/E8)

### D1–D12：基礎路徑約束

| 規則 | 說明 |
|------|------|
| `D1` | 事件傳遞只透過 `shared-infra/outbox-relay`；domain slice 禁止直接 import `shared-infra/event-router` |
| `D2` | 跨切片引用：`import from '@/features/{slice}/index'` only；`_*.ts` 為私有 |
| `D3` | 所有 mutation：`src/features/{slice}/_actions.ts` only |
| `D4` | 所有 read：`src/features/{slice}/_queries.ts` only |
| `D5` | `src/app/` 與 UI 元件禁止 import `src/shared-infra/frontend-firebase/{firestore\|realtime-database\|analytics}` |
| `D6` | `"use client"` 只在 `_components/` 或 `_hooks/` 葉節點；layout/page server components 禁用 |
| `D7` | 跨切片：`import from '@/features/{other-slice}/index'`；禁止 `_private` 引用 |
| `D8` | `shared-kernel/*` 禁止 async functions、Firestore calls、side effects |
| `D9` | workspace-application/ TX Runner 協調 mutation；slices 不得互相 mutate |
| `D10` | `EventEnvelope.traceId` 僅在 CBG_ENTRY 設定；其他地方唯讀 |
| `D11` | `workspace-core.event-store` 支援 projection rebuild；必須持續同步 |
| `D12` | `getTier()` 必須從 `shared-kernel/skill-tier` import；Firestore 寫入禁帶 tier 欄位 |

### L2 Command Gateway 邊界規則（D8 / D10 附則）

#### 可下沉至 L1（Shared Kernel）的元件

| 元件類型 | 說明 |
|----------|------|
| `GatewayCommand` / `DispatchOptions` / Handler 介面型別 | 純型別契約，無 async/side effects |
| `CommandResult` / 錯誤碼契約（純資料或純函式） | 符合 D8 |

#### 必須保留在 L2 的元件

| 元件類型 | 說明 |
|----------|------|
| `CBG_ENTRY` / `CBG_AUTH` / `CBG_ROUTE` 執行管線 | 含執行邏輯，禁止下沉 |
| handler registry | 路由表動態注冊 |
| resilience 接線（rate-limit / circuit-breaker / bulkhead） | 含 async/side effects |

#### 嚴格禁止

- `[D8]`：含 async / side effects / routing registry 的元件禁止下沉至 `shared-kernel/*`
- `[D10]`：L1 禁止產生 `traceId`；traceId 僅允許 `CBG_ENTRY` 注入

### D13–D20：契約治理守則

| 規則 | 說明 |
|------|------|
| `D13` | 新增 OUTBOX：必須在 `SK_OUTBOX_CONTRACT` 宣告 DLQ 分級 |
| `D14` | 新增 Projection：必須引用 `SK_VERSION_GUARD`，不得跳過 aggregateVersion 比對 |
| `D15` | 讀取場景決策：先查 `SK_READ_CONSISTENCY`（金融/授權 → STRONG；其餘 → EVENTUAL） |
| `D16` | SLA 數值禁止硬寫，一律引用 `SK_STALENESS_CONTRACT` |
| `D17` | 新增外部觸發入口：必須在 `SK_RESILIENCE_CONTRACT` 驗收後上線 |
| `D18` | Claims 刷新邏輯變更：以 `SK_TOKEN_REFRESH_CONTRACT` 為唯一規範 |
| `D19` | 型別歸屬規則：跨 BC 契約優先放 `shared-kernel/*`；`shared/types` 僅為 legacy fallback |
| `D20` | 匯入優先序：`shared-kernel/*` > feature slice `index.ts` > `shared/types` |

### D21：VS8 四層語義引擎規範

**層級結構**：Governance → Core Domain → Compute Engine → Output

**一、核心語義域（Core Domain · VS8_CL）**

| 規則 | 說明 |
|------|------|
| `D21-1` | 語義唯一性（雙層）：全域語義由 VS8 CTA 定義；組織自訂 task-type/skill-type 由 VS4 org-semantic-registry 定義 |
| `D21-2` | 標籤強型別化：禁止使用隱性字串傳遞語義，所有引用必須指向 TE1–TE6 有效 tagSlug |

**二、圖譜與推理引擎（Compute Engine · VS8_SL / VS8_NG）**

| 規則 | 說明 |
|------|------|
| `D21-3` | 節點互聯律：語義節點必須具備層級或因果關係；孤立標籤視為無效，須通過 `parentTagSlug` 歸入分類學 |
| `D21-4` | 聚合體約束：CTA 守護標籤生命週期（Draft→Active→Stale→Deprecated） |

**三、語義路由與執行（Compute Engine · VS8_ROUT）**

| 規則 | 說明 |
|------|------|
| `D21-5` | 語義感知路由：跨切片決策必須基於標籤語義權重，禁止硬編碼業務對象 ID |
| `D21-6` | 因果自動觸發：TagLifecycleEvent 發生時，VS8 透過 Causality Tracer 自動推導受影響節點並發布更新事件 |

**四、輸出與一致性（Output Layer · Projection & Consistency）**

| 規則 | 說明 |
|------|------|
| `D21-7` | 讀寫分離原則：寫入必須經 L2 Command Gateway（CBG_ENTRY/CBG_AUTH/CBG_ROUTE）；讀取嚴禁直連資料庫，必須經 `projection.tag-snapshot` |
| `D21-8` | 新鮮度防禦：所有基於語義的查詢必須引用 `SK_STALENESS_CONTRACT`，TAG_STALE_GUARD ≤ 30 秒 |

**五、圖關係物理約束（VS8_SL · Graph Physics）**

| 規則 | 說明 |
|------|------|
| `D21-9` | 突觸權重不變量：`SemanticEdge.weight ∈ [0.0, 1.0]`；cost = 1.0 / max(weight, MIN_EDGE_WEIGHT) |
| `D21-10` | 拓撲可觀測性：`findIsolatedNodes(slugs[])` 為 VS8_NG 唯一拓撲健康探針；每次 addEdge/removeEdge 後必須非同步觸發 |

**六、擴展不變量（D21-A~D21-K、D21-S~D21-X）**

| 規則 | 說明 |
|------|------|
| `D21-A` | 雙層註冊律：全域概念在 `core/tag-definitions.ts`；組織概念在 VS4 `org-semantic-registry` |
| `D21-B` | Schema 鎖定：標籤元數據必須符合 `core/schemas` 定義 |
| `D21-C` | 無孤立節點：每個新標籤必須透過 `hierarchy-manager.ts` 掛載至少一個有效父級節點 |
| `D21-D` | 向量一致性：`vector-store.ts` 向量必須隨 `core/tag-definitions.ts` 同步刷新，延遲 ≤ 60s |
| `D21-E` | 權重透明化：語義相似度計算必須由 `weight-calculator.ts` 統一輸出，禁止消費方自行推算 |
| `D21-F` | 注意力隔離：`context-attention.ts` 必須根據當前 Workspace 情境過濾無關標籤 |
| `D21-G` | 演化回饋環：`learning-engine.ts` 僅能依據 VS3/VS2 真實事實事件進行調整；禁止手動注入合成數據 |
| `D21-H` | 血腦屏障（BBB）：`invariant-guard.ts` 擁有最高否決權，可直接拒絕已通過治理共識但違反圖物理結構的提案 |
| `D21-I` | 全域共識律：所有提案必須通過 `consensus-engine` 邏輯一致性校驗 |
| `D21-J` | 知識溯源：每條標籤關係建立必須標註貢獻者 ID 與參考依據 |
| `D21-K` | 語義衝突裁決：invariant-guard 偵測到循環繼承、矛盾語義時直接拒絕提案並產生拒絕事件 |
| `D21-S` | 同義詞重定向：合併後舊標籤自動成為 Alias，歷史數據引用自動重定向，禁止直接刪除 |
| `D21-T` | 命名共識律：顯示名稱由社群貢獻度決定（可演化），tagSlug 永久不變 |
| `D21-U` | 禁止重複定義：新增標籤時 embeddings 必須即時計算相似度並提示 |
| `D21-V` | 提案鎖定機制：Pending-Sync 標籤的路由權重凍結為 0.5 直到共識達成 |
| `D21-W` | 跨組織透明性：所有標籤修改紀錄對全域公開 |
| `D21-X` | 語義自動激發：用戶建立 A→B 關聯時，causality-tracer 自動建議節點 C |

### D22–D23：Tag 語義守則

| 規則 | 說明 |
|------|------|
| `D22` | 跨切片 tag 語義引用：全域標籤必須指向 TE1–TE6；組織自訂標籤必須指向 `OrgTagRef(orgId, tagSlug)` |
| `D23` | tag 語義標注格式：節點內 `tag::{category}`；邊 `-.->|"{dim} tag 語義"|` |

### D24–D25：Firebase 隔離守則

| 規則 | 類型 | 說明 |
|------|------|------|
| `D24` | MUST | Feature slice / `shared/types` / `app` 禁止直接 import `firebase/*` |
| `D24` | MUST | 前端使用者態 Firebase 呼叫必須透過 `FIREBASE_ACL` Adapter |
| `D24` | FORBIDDEN | Feature Slice 禁止直接 import `@/shared-infra/*` 實作細節 |
| `D24` | MUST | Feature Slice 僅可依賴 `SK_PORTS`（L1）或 Query Gateway（L6）公開介面 |
| `D24-A` | MUST | Client → Server 邊界：輸入/輸出必須是 Plain Object（JSON-serializable）|
| `D24-B` | MUST | Feature slice 定義 mutation action 必須同時定義 Command DTO；禁止直接使用 Aggregate/Projection 型別 |
| `D24-C` | MUST | Firestore snapshot 進入 client state 前必須先經 normalizer 轉為 Client Model |
| `D24-D` | FORBIDDEN | Client 端禁止傳遞 Account/Workspace 等 rich entity 到 Server Function |
| `D25` | MUST | 新增 Firebase 前端能力必須在 FIREBASE_ACL 新增 Adapter |
| `D25` | MUST | 入口涉及受保護資料必須先完成 App Check 驗證 [E7] |
| `D25` | MUST | Admin 權限/跨租戶/排程/觸發器/Webhook 驗簽必須走 `src/shared-infra/backend-firebase/functions` |
| `D25` | MUST | 需要受治理的 GraphQL 資料契約必須走 `src/shared-infra/backend-firebase/dataconnect` |
| `D25` | MUST | `firebase-admin` SDK 只在 `src/shared-infra/backend-firebase/functions`（Cloud Functions）內初始化與呼叫；firebase-admin 一律透過 functions |
| `D25` | MUST | `firebase-admin/app-check`（服務端 App Check token 驗簽）只在 `AdminAppCheckAdapter`（`src/shared-infra/backend-firebase/functions/`）中呼叫 [E7 → 見 §E7 章節] |
| `D25` | FORBIDDEN | 在 Next.js Server Components / Server Actions / Edge Functions 中直接 import `firebase-admin` |

### D26：Cross-cutting Authority 守則

| 規則 | 類型 | 說明 |
|------|------|------|
| `D26` | MUST | 執行跨域搜尋必須經 `global-search.slice`；業務 Slice 不得自建搜尋邏輯 |
| `D26` | MUST | 執行通知副作用必須經 `notification-hub.slice`（VS7） |
| `D26` | MUST | `global-search.slice` / `notification-hub.slice` 必須具備自己的 `_actions.ts / _services.ts` [D3] |
| `D26` | FORBIDDEN | cross-cutting authority 禁止寄生於 shared-kernel [D8] |

### D27：成本語義路由守則（Extension Gate）

> D27 為 Extension Gate；僅在 document-parser / finance-routing 變更時強制審查

| 規則 | 類型 | 說明 |
|------|------|------|
| `D27` | MUST | 成本語義路由必須採用三層架構（Layer-1 原始解析 → Layer-2 語義分類 → Layer-3 語義路由） |
| `D27` | MUST | Layer-2 必須呼叫 VS8 `classifyCostItem(name)` 輸出 `(costItemType, semanticTagSlug)` |
| `D27` | MUST | `classifyCostItem` 必須為純函式（禁止 async / Firestore / 副作用）[D8] |
| `D27` | MUST | `ParsedLineItem` 必須寫入 `(costItemType, semanticTagSlug)` 並隨 payload 傳遞 |
| `D27` | MUST | Layer-3 物化流程必須以 `shouldMaterializeAsTask()` 作為唯一物化閘門 [D27-Gate] |
| `D27` | FORBIDDEN | VS5 workspace.slice 禁止直接硬寫 `=== CostItemType.EXECUTABLE` 判斷 |
| `D27` | MUST | `shouldMaterializeAsTask()` 返回 true 才可物化為 WorkspaceTask；否則靜默跳過並 toast [#A14] |
| `D27` | MUST | 物化為任務必須寫入 `sourceIntentIndex` 以維持排序不變量 [D27-Order] |
| `D27` | MUST | tasks-view 呈現任務清單必須先按 `createdAt`（批次間）再按 `sourceIntentIndex`（批次內）排序 |
| `D27` | MUST | 設計任務鏈路必須遵守單向鏈 WorkspaceItem → WorkspaceTask → Schedule（禁止跳級）[D27-Order] |
| `D27` | MUST | UI 顯示 DocumentParser icon/color/label 必須讀取 tag-snapshot（不得分類器硬編碼）[T5] |
| `D27` | MUST | 排班視圖讀取僅可經 L6 Query Gateway；UI 禁止直讀 VS6/Firebase [L6-Gateway] |
| `D27` | MUST | overlap/resource-grouping 必須在 L5 Projection 層完成，前端僅渲染 [Timeline] |
| `D27` | FORBIDDEN | VS5 document-parser 禁止自行實作成本語義邏輯；禁止 Layer-3 繞過 costItemType |

### D28：視覺化 DataSet 快取模式（vis-data Caching Pattern）

> D28 為 Visualization Bus Gate；凡新增或修改 vis-network / vis-timeline / vis-graph3d 元件、`VisDataAdapter` 或對 `vis-data` DataSet<> 的寫入點時必審

| 規則 | 類型 | 說明 |
|------|------|------|
| `D28` | MUST | vis-network / vis-timeline / vis-graph3d 必須從 `VisDataAdapter`（L7-A · `src/shared-infra/frontend-firebase/vis-data/`）提供的 `DataSet<>` 消費資料，不得直接訂閱 Firebase |
| `D28` | MUST | `VisDataAdapter` 為唯一 Firebase 訂閱點：訂閱 `tasks-view`、`workspace-graph-view`、`schedule-timeline-view`、`semantic-governance-view` 各一次，DataSet<> 更新後推播所有消費者 |
| `D28` | MUST | 新增視覺化元件需消費 Projection 資料時，必須在 `VisDataAdapter` 新增對應 DataSet<>，不得在元件中建立獨立 Firebase 訂閱 |
| `D28` | FORBIDDEN | vis-network / vis-timeline / vis-graph3d 禁止繞過 `VisDataAdapter` 直連 Firebase（避免 N 組件 × 1 訂閱造成費用倍增）|
| `D28` | FORBIDDEN | `VisDataAdapter` 以外的位置禁止對 vis-data `DataSet<>` 進行寫入操作 |

**資料流（Visualization Bus）**：

```
L5 Projection Bus → Firebase L8（Snapshot 訂閱）
  → VisDataAdapter（DataSet<Node|Edge|DataItem> 本地快取）
    → vis-network（任務依賴 Nodes/Edges）
    → vis-timeline（排班 Timeline Items）
    → vis-graph3d（語義 3D 圖）
```

**費用保護原則**（架構正確性優先）：Firebase Snapshot 訂閱費用與連線數（讀取操作數）正比。舉例：若 vis-network、vis-timeline、vis-graph3d 三個元件各自建立 Firebase 訂閱，費用為 3 × 1 = **3 連線**；透過 `VisDataAdapter` 的 DataSet<> 快取，費用為 **1 連線**（一次訂閱，三元件共享推播）。隨元件數增長，費用差距等比放大。符合奧卡姆剃刀原則：不增加不必要的 Firebase 連線，不引入不必要的架構複雜度。

### D29：原子性保證（transactional-outbox-pattern）

> D29 為 Write-Atomicity Gate；凡新增或修改 L2 Command Pipeline 的 Aggregate 寫入路徑時必審

| 規則 | 類型 | 說明 |
|------|------|------|
| `D29` | MUST | L2 `CBG_ROUTE` 必須提供 `TransactionalCommand` 基類，供所有 VS 切片的寫操作繼承 |
| `D29` | MUST | 所有 VS 切片的 Command Handler 必須在同一個 Firestore Transaction 中完成：① 寫入業務 Aggregate 狀態、② 寫入該切片的 `{slice}/_outbox` 集合 |
| `D29` | MUST | 若 Aggregate 寫入成功、Outbox 寫入失敗，整個 Transaction 必須回滾；不得存在「Aggregate 已寫入、Outbox 未寫入」的中間狀態 |
| `D29` | FORBIDDEN | 禁止在 Transaction 外部先寫 Aggregate 再補寫 Outbox（雙重寫入模式），此違反原子性 |

**設計原則**（架構正確性優先）：只要業務存檔成功，事件就一定會發出；若存檔失敗，事件也會隨之復原。此從機制上消除了狀態與事件不同步的不一致性，無需各業務切片自行實作補償邏輯。

### D30：循環依賴防禦（hop-limit-circular-dependency）

> D30 為 Event Loop Guard Gate；凡修改 L4 IER 事件轉發邏輯、或跨切片事件訂閱關係時必審

| 規則 | 類型 | 說明 |
|------|------|------|
| `D30` | MUST | `SK_ENV`（EventEnvelope）必須包含 `hopCount` 欄位，初始值為 0 |
| `D30` | MUST | L4 `IER` 每次轉發事件時，必須將 `hopCount + 1` 後寫入下一個 Envelope |
| `D30` | MUST | 當 `hopCount ≥ 4` 時，IER 必須攔截該事件，拋出 `CircularDependencyDetected` 告警，並將事件路由至 `DLQ SECURITY_BLOCK` |
| `D30` | MUST | `CircularDependencyDetected` 告警必須寫入 L9 `DOMAIN_ERRORS` |
| `D30` | FORBIDDEN | 禁止在 hopCount 超限後繼續轉發事件；禁止對 `SECURITY_BLOCK` DLQ 自動 Replay |

**設計原則**（架構正確性優先）：即使開發者在業務邏輯中不慎設計了循環觸發，系統也能在運行時自動截斷，防止雪崩效應。臨界值 3 次轉發（hopCount ≥ 4）符合奧卡姆剃刀原則：正常業務事件鏈不應超過此深度，超過即視為異常。

### P8：L5 動態背壓與併發池（dynamic-backpressure-worker-pool）

> P8 為 Projection Bus Performance Gate；凡新增高頻 Projection 寫入路徑、或修改 FUNNEL 分派邏輯時必審

| 規則 | 類型 | 說明 |
|------|------|------|
| `P8` | SHOULD | L5 `FUNNEL` 必須按事件的 `priorityLane`（Critical / Standard / Background）分配不同的 Worker Pool 配額（Quota） |
| `P8` | SHOULD | 對於「高密度」投影（同一 Document 被多個事件修改），FUNNEL 在緩衝區中對同一 `docId` 的寫入進行 Debounce / Batching：100ms 內的同一 doc 更新合併為一次寫入 |
| `P8` | SHOULD | Worker Pool 配額邊界必須引用 `SK_STALENESS_CONTRACT` 的 SLA 常數，禁止硬寫配額數字 |

**設計原則**（架構正確性優先）：確保基礎設施能根據負載自動調節，Critical Lane 不會因 Background Lane 的寫入放大而受到影響；Debounce 機制可有效降低寫入次數，符合奧卡姆剃刀原則：不引入不必要的 Firestore 寫入。

### D31：讀寫權限一致性（permission-projection）

> D31 為 CQRS Auth Symmetry Gate；凡修改 CBG_AUTH 權限邏輯、或新增讀取路由時必審

| 規則 | 類型 | 說明 |
|------|------|------|
| `D31` | MUST | 將「存取權限」視為一種 Projection（Read Model）：`acl-projection` |
| `D31` | MUST | 當 `CBG_AUTH` 處理權限變更事件（如 RoleChanged / PolicyChanged）時，L5 必須同步更新 `projection.acl-projection` |
| `D31` | MUST | `QRY_API_GW`（L6 Query Gateway）讀取資料時，必須自動將讀取請求與 `acl-projection` 進行 JOIN / Filter，確保讀寫路徑授權的絕對同步 |
| `D31` | MUST | `projection.acl-projection` 歸屬 `CRITICAL_PROJ_LANE`；SLA 遵守 `PROJ_STALE_CRITICAL ≤ 500ms`[S4] |
| `D31` | FORBIDDEN | 讀路徑禁止重新執行複雜的 Aggregate 鑑權邏輯；必須僅依賴 `acl-projection` 的預計算結果 |

**設計原則**（架構正確性優先）：CQRS 讀寫分離後，鑑權邏輯若只在寫路徑執行，讀路徑就會存在授權漏洞。Permission Projection 是解決讀寫鑑權不對稱的正規架構方案，而非補丁式修補。

### R9：Context Propagation Middleware（context-propagation-middleware）

| 規則 | 類型 | 說明 |
|------|------|------|
| `R9` | MUST | `outbox-relay-worker` 在投遞 Outbox 時，必須驗證來源 Envelope 帶有 `traceId`；若缺失則拒絕投遞並記錄 L9 錯誤 |
| `R9` | MUST | `outbox-relay-worker` 及 L4 IER 執行非同步函式時，必須使用 `AsyncLocalStorage`（Node.js）自動傳遞 `traceId` 上下文，確保整條非同步鏈路 context 不斷鏈 |
| `R9` | MUST | 前端 SDK（`EXT_CLIENT` · `_actions.ts`）必須在每個請求中自動注入 `x-trace-id` HTTP Header |
| `R9` | MUST | `CBG_ENTRY` 在收到請求時，必須優先讀取 `x-trace-id`；僅在 Header 缺失時才由 `CBG_ENTRY` 生成新的 `traceId`[R8] |
| `R9` | FORBIDDEN | 禁止開發者在業務代碼中手動傳遞 `traceId`；`traceId` 的傳遞由底層 Middleware 自動維持 |

> E7 為 Firebase Entry Security Gate；凡新增或修改受保護資料入口、App Check Adapter 或 `firebase/app-check` / `firebase-admin/app-check` 呼叫點時必審

| 規則 | 類型 | 說明 |
|------|------|------|
| `E7` | MUST | HTTP endpoint / Webhook / Callable Function 等外部入口涉及受保護資料或可變更狀態，必須先完成 App Check 驗證（含 token 續期與失效處理）；未通過不得進入 L2/L3 |
| `E7` | MUST | Client 端 `AppCheckAdapter`（L7-A · `src/shared-infra/frontend-firebase/app-check/`）是唯一合法的 `firebase/app-check` 呼叫點 |
| `E7` | MUST | 服務端驗證 App Check token 必須經 `AdminAppCheckAdapter`（L7-B · `src/shared-infra/backend-firebase/functions/`）；不得在 Next.js Server Components / Server Actions / Edge Functions 直接呼叫 `firebase-admin/app-check` |
| `E7` | FORBIDDEN | Domain Slice / Feature Slice 禁止繞過 App Check 驗證直接存取受保護資源 |
| `E7` | FORBIDDEN | 禁止在 `AppCheckAdapter` / `AdminAppCheckAdapter` 以外的位置實作 `firebase/app-check` 或 `firebase-admin/app-check` 邏輯 |

### P6：平行路由與串流 UI

| 規則 | 類型 | 說明 |
|------|------|------|
| `P6` | SHOULD | 使用 Next.js Parallel Routes 時每個 `@slot` 必須對應單一資料通道（QGWAY channel）與獨立 Suspense fallback |
| `P6` | SHOULD | 使用 Streaming UI 必須定義可中斷/可重試策略，避免跨 slot 共享阻塞 |

### E8：Genkit AI 治理（genkit-tool-governance）

> E8 為 AI Runtime Security Gate；凡新增或修改 Genkit flow、AI tool calling 邏輯或 L10 元件時必審

| 規則 | 類型 | 說明 |
|------|------|------|
| `E8` | MUST | Genkit flow 觸發 tool calling 必須經 Tool ACL（role/scope/tenant）與審計追蹤（traceId/toolCallId/modelId） |
| `E8` | FORBIDDEN | AI flow 禁止直接呼叫 `firebase/*` 或跨租戶讀寫 |

---

## RULESET-MUST 索引（快速查閱）

### R / S 類（基礎設施不變量）

| 索引 | 摘要 |
|------|------|
| `R1` | relay-lag-metrics |
| `R5` | DLQ-failure-rule |
| `R6` | workflow-state-rule |
| `R7` | aggVersion-relay |
| `R8` | traceId-readonly |
| `R9` | context-propagation-middleware |
| `S1` | OUTBOX-contract |
| `S2` | VersionGuard |
| `S3` | ReadConsistency |
| `S4` | Staleness-SLA |
| `S5` | Resilience |
| `S6` | TokenRefresh |

### A / # 類（領域原子性）

| 索引 | 摘要 |
|------|------|
| `A3` | workflow-blockedBy |
| `A5` | scheduling-saga |
| `A8` | 1cmd-1agg |
| `A9` | scope-guard |
| `A10` | notification-stateless |
| `A12` | global-search-authority |
| `A13` | notification-hub-authority |
| `A14` | cost-semantic-dual-key |
| `A15` | finance-lifecycle-gate |
| `A16` | multi-claim-cycle |
| `A17` | skill-xp-award-contract |
| `A18` | org-semantic-extension |

### E 類（Security Gate 閉環）

| 索引 | 摘要 |
|------|------|
| `E7` | app-check-enforcement-closure |
| `E8` | genkit-tool-governance |

### D 類（Firebase 隔離 / 視覺化 DataSet / 原子性 / 循環防禦 / 權限一致性）

| 索引 | 摘要 |
|------|------|
| `D28` | vis-data-caching-pattern |
| `D29` | transactional-outbox-pattern |
| `D30` | hop-limit-circular-dependency |
| `D31` | permission-projection |

### P 類（效能與穩定性治理）

| 索引 | 摘要 |
|------|------|
| `P8` | dynamic-backpressure-worker-pool |

---

## 跨切片 RULESET-MUST（分類整理）

### VS5 強制規則

| 規則 | 說明 |
|------|------|
| VS5 MUST document-parser 三層閉環 | Layer-1 原始解析 → Layer-2 呼叫 VS8 `classifyCostItem()` 語義分類 → Layer-3 `shouldMaterializeAsTask()` 唯一物化閘門 [D27 #A14] |
| VS5 MUST 保留 sourceIntentIndex | 任務物化必須寫入 `sourceIntentIndex`；`tasks-view` 按 `createdAt`（批次間）→ `sourceIntentIndex`（批次內）排序 [D27-Order] |
| VS5 MUST Finance 階段閘與多輪循環 | Acceptance=OK 前禁止進入 Finance；循環直到 `outstandingClaimableAmount = 0` 才允許標記 Completed [#A15 #A16] |
| VS5 MUST XP 只透過 IER 傳遞至 VS3 | 任務/品質流程禁止直接 mutate VS3 XP；事件 `TaskCompleted` / `QualityAssessed` 必須經 IER 傳入 VS3 [D9 #A17] |
| VS5 MUST 語義讀取僅經 L6 | VS5 語義讀取必須經 L6 Query Gateway；禁止直連 DB 或跨越 VS8 圖結構邊界 [D21-7 T5] |
| VS5 / VS6 MUST vis-* 元件消費 VisDataAdapter DataSet<> | vis-network（任務依賴圖）/ vis-timeline（排班日程）/ vis-graph3d（語義 3D 圖）只能消費 `VisDataAdapter` DataSet<>；禁止直連 Firebase [D28] |

### VS6 強制規則

| 規則 | 說明 |
|------|------|
| VS6 MUST 讀 `ORG_ELIGIBLE_MEMBER_VIEW` | 取得可排班成員、tagSlug 技能能力（skills{tagSlug→xp}）與 eligible 狀態 [#14 #15 #16] |
| VS6 MUST 使用語義感知排班路由 | 基於 VS8 tagSlug 語義，禁止硬編碼成員 ID 或技能 ID [D21-5] |
| VS6 MUST 使用 `SK_SKILL_REQ` × Tag Authority | 排班職能需求合法性由 `SK_SKILL_REQ` × tagSlug 確定 [T4] |
| VS6 MUST 走 L6 Query Gateway | 排班視圖讀取只可經 L6；UI 禁止直讀 VS6/Firebase [D27 L6-Gateway] |
| VS6 MUST overlap/resource-grouping 在 L5 完成 | 前端僅渲染，計算責任在 L5 Projection [D27 Timeline] |

### VS3 強制規則

| 規則 | 說明 |
|------|------|
| VS3 MUST 使用 Ledger 記帳 | XP 異動必須寫 Ledger [#13] |
| VS3 MUST `getTier()` 只推導 | 從 `shared-kernel/skill-tier` import；禁止存入 DB [D12 #12] |
| VS3 XP Award MUST 由 VS3 獨占寫入 | 來源只能是 VS5 的 `TaskCompleted(baseXp, semanticTagSlug)` 與 `QualityAssessed(qualityScore)` [A17] |

### 分層規則

| 規則 | 說明 |
|------|------|
| L3 → L4 | 域事件透過 OUTBOX，由 relay-worker 投遞到 IER [D1 S1] |
| L4 → L5 | IER lane-router 分發到 event-funnel，event-funnel 是唯一 Projection 寫入路徑 [#9 #4b] |
| L5 → L6 | Projection Bus 物化後由 Query Gateway 暴露 |
| L2 → L3 | CBG_ROUTE 分發至 handler（CBG_ENTRY 已注入 traceId [D10]）|
| L3 MUST NOT → firebase/* | Feature Slice 禁止跨越 L7，必須走 SK_PORTS [D24] |

### Cross-cutting Authority 出口規則

| 權威 | 說明 |
|------|------|
| `Global Search` | 唯一跨域搜尋出口；業務 Slice 禁止自建搜尋邏輯 [D26 #A12] |
| `Notification Hub`（VS7） | 唯一副作用出口；業務 Slice 只產生事件不決定通知策略 [D26 #A13] |
