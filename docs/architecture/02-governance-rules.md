# 治理視圖 (Governance View)

> **原始檔（Source of Truth）**：完整 Mermaid 源碼與所有規則的正式定義請見 [`00-logic-overview.md`](./00-logic-overview.md)
>
> 邏輯流圖請見 [`01-logical-flow.md`](./01-logical-flow.md) · 基礎設施路徑請見 [`03-infra-mapping.md`](./03-infra-mapping.md)

本視圖為所有治理規則的 **可讀治理視圖（Governance View）**，包含完整規則正文，供審查、快速查閱與落地參照使用。
Mermaid 架構源碼與機器可解析格式（Canonical Mermaid Source）請見 `00-logic-overview.md`；
若本文件文字描述與 `00-logic-overview.md` 有衝突，以 `00-logic-overview.md` 為準。

---

## 架構正確性優先原則（Architectural Correctness First Principle）

> 本文件所有規則以**架構正確性（Architectural Correctness）**為最高裁決標準。任何設計決策皆以**正規架構（Formal Architecture）**的結構正確性為優先，而非以短期進度、局部便利或表面效率為由妥協架構品質。

所謂的「**奧卡姆剃刀**」在工程語境中的真正含義，並非單純追求最少程式碼或最快開發速度，而是**透過正確的抽象與合理的結構，使系統在保持完整性的前提下達到必要且充分的簡潔**。過度追求快速交付或最小實作，往往導致責任混亂、邊界模糊與耦合擴散，最終形成難以維護與演進的「義大利麵式架構（Spaghetti Architecture）」。

本系統架構設計必須同時滿足以下三個長期性原則：

**① 結構穩定與一致性（Consistency & Stability）**  
系統的邊界、層級、職責與資料流應具有清晰且可預測的結構。所有模組必須遵循一致的設計規則與架構模式，使整體系統在擴展、重構與協作時仍能保持結構穩定，而不因局部變更而產生混亂或耦合擴散。

**② 本質與簡約（Essence & Simplicity）**  
簡約並非「減少設計」，而是**去除不必要複雜度，保留問題本質所需的最合理結構**。真正的簡單來自於正確的抽象層次、明確的責任分離與清楚的系統語義，而不是透過省略架構或忽略邊界來達成表面上的簡單。

**③ 可持續性與演進（Sustainability & Evolution）**  
架構的價值在於支撐系統的長期發展。設計時必須考慮未來的擴展、重構與能力演進，使系統能在需求變化與規模成長下仍保持可理解、可維護與可治理，而不需要不斷以補丁式方式修復結構問題。

> ⚠️ **架構違規零容忍（Zero Tolerance）**：架構錯誤不應被容忍或掩蓋。當系統出現違反邊界、破壞層級、責任混亂或耦合擴散等問題時，正確的工程行為應是**直接進行結構性修正或重構（Structural Correction）**，而非以暫時性的修補、包裝或繞過方式維持表面上的可運行。任何試圖以補丁掩蓋結構問題的做法，最終只會放大系統複雜度並加速架構劣化。**架構正確性優先於短期進度、局部便利與表面效率。**

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

- 全域搜尋只經 `Global Search`；禁止各 Slice 自建搜尋引擎或搜尋入口
- 通知 / 推播 / 外部通訊只經 `Notification Hub`；業務 Slice 只產生事件，不決定通知策略
- Finance 僅接受 `ACCEPTED`（通過 `task-accepted-validator`）任務進入；進入路徑唯一，禁止旁路
- 任務語義與成本決策由 `VS8` 提供全域基線
- 組織自訂 task-type / skill-type 語義必須經 `VS4 org-semantic-registry` 治理並投影到 tag-snapshot

### CP3 MUST：Layering Rules（層級通訊）

- 所有寫入操作必須由 L2 Command Gateway 收口；`CBG_ENTRY` 是唯一 `traceId` 注入點，且同時負責命令入口治理
- 跨切片副作用必須由 L4 IER 分發；禁止 Slice 間直接互相寫入對方 aggregate
- 所有投影與物化視圖更新由 L5 Projection Bus 物化；禁止 Feature Slice 直寫 Projection
- 所有讀取必須由 L6 Query Gateway 暴露；UI 禁止直接讀取 L3 Aggregate / raw state
- Feature Slice 不得跨層旁路（含 Firebase SDK 旁路、Projection 直寫、繞過 Query/Command Gateway）

### CP4 SHOULD：Governance Rules（治理與演化）

- 新規則先索引、再實作
- 優先引用現有契約
- 全域語義進 VS8 註冊，組織 task-type/skill-type 進 VS4 org-semantic-registry 註冊
- D27 屬 Extension Gate，僅影響 document-parser / finance-routing 變更

---

## Single Source of Truth（消除雙重真相）

- **SLA 契約唯一來源**：所有延遲 / 新鮮度 / Worker Pool 配額邊界只能引用 `SK_STALENESS_CONTRACT`；禁止在圖、規則或實作中硬寫數值
- **語義型別唯一來源**：業務代碼禁止使用裸字串（例如 `tag_name` / `semanticTagSlug` 字串常值）自行表達語義；全域語義必須引用 VS8 提供的強型別定義（TE1–TE6 / CTA / OrgTagRef）
- **版本守衛唯一來源**：所有會更新 L5 Projection / Read Model 的物化寫入必須先套用 `applyVersionGuard()`，以 `aggregateVersion` 單調遞增作為並發與重播一致性的唯一裁決條件 [S2]

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
| `[#A15]` | Finance 進入閘門：僅 `ACCEPTED`（通過 `task-accepted-validator`）才可進入 Finance；Finance 生命週期由 VS9 管理 [#A19 #A21] |
| `[#A16]` | （已由 #A21 升級）Finance_Request 獨立生命週期：DRAFT→AUDITING→DISBURSING→PAID；Workflow Completed 條件為所有關聯 Finance_Request.status = PAID [#A21] |
| `[#A17]` | XP 僅能由 VS3 寫入；`awardedXp = baseXp × qualityMultiplier × policyMultiplier`（含 clamp）；VS8 禁止直接寫入 VS3 XP aggregate/ledger |
| `[#A18]` | 組織新建 task-type/skill-type 必須走 VS4 org-semantic-registry，以 org namespace 寫入 tag-snapshot |
| `[D28]` | vis-network / vis-timeline / vis-graph3d 只能消費 `VisDataAdapter` 提供的 `DataSet<>`；`VisDataAdapter` 訂閱 Firebase 一次，DataSet<> 快取推播至所有消費者；禁止 vis-* 直連 Firebase |
| `[G1]` | CTA 是全域語義字典 SSOT；未 Active 的 slug 不可在任何切片中引用 |
| `[G3]` | invariant-guard 擁有最高裁決權；COMPLIANCE TaskNode 必須有 cert_required Skill；裁決結果不可被覆蓋 |
| `[G4]` | VS8 寫入路徑唯一：CMD_GWAY→CTA；禁止繞過 |
| `[G5]` | semantic-governance-portal 治理變更強制 DLQ=REVIEW_REQUIRED；禁止 SAFE_AUTO replay |
| `[G6]` | staleness-monitor 時間閾值必須引用 SK_STALENESS_CONTRACT [S4]；禁止硬寫 |
| `[C2]` | 主體圖五種合法邊：REQUIRES/HAS_SKILL/IS_A/DEPENDS_ON/TRIGGERS；禁止業務端自定義 |
| `[C3]` | 所有邊 weight 由 weight-calculator 計算；weight ∈ [0,1]；禁止硬寫 |
| `[C6]` | TaskNode.essence_type 只有三個合法值：PHYSICAL_INSTALL/LOGIC_CONFIG/COMPLIANCE；只由 cost-item-classifier 賦值 |
| `[C11]` | 向量縮範 + Graph 確認缺一不可；禁止以純向量相似度作最終分類依據 |
| `[E4]` | cost-item-classifier 是訂單語義分類唯一入口（ISemanticClassificationPort）；禁止切片自行字串比對 |
| `[E5]` | 推理三步驟不可跳躍；輸出必須含 confidence + inferenceTrace[] |
| `[E6]` | inferenceTrace[] 是推理完整性強制要件；無 trace 不得進入下游 |
| `[E7]` | skill-matcher 三條件全滿才合格：tier + granularity 覆蓋度 + cert_required 證照 |
| `[E11]` | routing-engine 只輸出 SemanticRouteHint；禁止持有副作用或直呼 VS6/VS7 |
| `[O1]` | VS8 對外只有三個 Port 介面；禁止繞過 Port 直呼內部模組 |
| `[O3]` | projection.task-semantic-view 必須含 required_skills + eligible_persons；缺一視為不完整 |
| `[O4]` | projection.causal-audit-log 每條記錄必須含 inferenceTrace[] + traceId；禁止重新生成 traceId |
| `[B1]` | VS8 只做語義推理輸出；禁止直接觸發跨切片副作用 |
| `[B2]` | VS8 內部依賴方向單向：Governance→Core→Engine→Output；禁止逆向依賴 |
| `[B3]` | AI Flow (L10 Genkit) 只能透過 ISemanticClassificationPort / ISkillMatchPort 存取 VS8；禁止直呼 VS8 內部模組 |
| `[B4]` | 分類學（IS_A 邊本體論）與向量（認識論工具）各有職責；禁止以一者取代另一者 |
| `[B5]` | VS8 維護主體圖（Subject Graph），不承載因果執行；因果路徑推論可以，但因果狀態物化或副作用禁止 |

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
- Workflow 禁止在任務 Acceptance 未達 `ACCEPTED`（`task-accepted-validator` 通過）前進入 Finance [#A15 #A19]
- 禁止外部服務直接修改 VS5 任務狀態 [#A19]
- 禁止 VS5 直接呼叫 VS9 Finance API 或寫入 VS9 Aggregate [#A20]
- 禁止 VS9 直接呼叫 VS5 API 或寫入 VS5 Aggregate [#A19 #A20]
- 禁止為同一批次任務建立兩個 Finance_Request（`LOCKED_BY_FINANCE` 防止重複請款）[#A20 #A21]
- Finance_Request 精確讀取（金融狀態、撥款確認等）必須使用 `STRONG_READ` [#A21 S3]
- 前端禁止直讀 VS9 Finance 域資料合成任務顯示，必須透過 `task-finance-label-view` 投影 [#A22]
- `Finance_Staging_Pool` 禁止消費方直接寫入；唯一寫入路徑為 L5 Projection Bus [#A20]
- L5 `task-finance-label-view` 投影禁止反向寫入 VS5 任務 Aggregate 狀態 [#A22]
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
- 禁止任何模組繞過 CTA 或 `invariant-guard` 自行宣告或修改語義標籤狀態 [G1 G3 G4]
- 禁止以純向量相似度作最終分類依據；向量縮範後必須 Graph 確認 [C11 E5]
- 禁止業務端或 AI Flow 自行計算邊 weight；所有 weight 由 weight-calculator 統一計算 [C3 E2]
- 禁止在 VS8 任何子模組中執行跨切片副作用（通知、排班、物化）[B1 E11]
- 禁止業務端繞過 Port 直接呼叫 VS8 內部模組（semantic-edge-store、causality-tracer 等）[O1 B3]
- 禁止 PersonNode 被任何路徑直接寫入；唯一更新路徑是 ISemanticFeedbackPort [C9]
- 無 inferenceTrace[] 的推理結果視為不完整，禁止進入任何下游流程 [E6]
- routing-engine 禁止直呼 VS6 排班或 VS7 通知；只輸出 SemanticRouteHint [E11]
- 禁止以 IS_A 分類學邊替代向量相似度，或以向量相似度取代 IS_A 分類學；兩者認識論職責不可互換 [B4]
- 禁止在 VS8 中物化因果執行副作用（排班、通知、狀態機轉換）；VS8 只推論因果鏈，執行由 IER+L5 承載 [B5]

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
| `#A15` | Finance gate：任務必須到達 `ACCEPTED`（通過 `task-accepted-validator` [#A19]）才可進入 Finance Staging Pool；Finance 獨立生命週期由 VS9 管理 |
| `#A16` | （升級至 #A21）Finance_Request 生命週期：`DRAFT→AUDITING→DISBURSING→PAID`；Workflow Completed 條件為所有關聯 Finance_Request.status = PAID |
| `#A17` | Skill XP Award contract：XP 僅能由 VS3 寫入；`awardedXp = baseXp × qualityMultiplier × policyMultiplier（含 clamp）` |
| `#A18` | Org Semantic Dictionary Extension：組織新建 task-type/skill-type 必須走 VS4 org-semantic-registry，以 org namespace 寫入 tag-snapshot |
| `#A19` | Task Lifecycle Convergence：任務嚴格狀態機 `IN_PROGRESS→PENDING_QUALITY→PENDING_ACCEPTANCE→ACCEPTED`；Validator 內部門禁；TaskAcceptedConfirmed 與狀態變更同一 L2 TX [D29] |
| `#A20` | Finance Staging Pool：VS9 `finance-staging.acl` 消費 CRITICAL_LANE TaskAcceptedConfirmed；可計費任務轉錄至 Finance_Staging_Pool（PENDING→LOCKED_BY_FINANCE） |
| `#A21` | Finance Request 獨立生命週期：VS9 CreateBulkPaymentCommand → Finance_Request（`DRAFT→AUDITING→DISBURSING→PAID`）；bundledTaskIds 1:N 溯源 |
| `#A22` | Finance Feedback Projection：FinanceRequestStatusChanged → STANDARD_LANE → L5 `task-finance-label-view`；前端合成顯示任務金融標籤 |

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

### #A19：VS5 任務生命週期收斂（task-lifecycle-convergence）

> #A19 為 VS5 Task State Closure Gate；凡修改 VS5 任務狀態機、驗收流程或 TaskAcceptedConfirmed 事件發送邏輯時必審

| 規則 | 類型 | 說明 |
|------|------|------|
| `A19` | MUST | 任務 Aggregate 必須遵循嚴格狀態路徑：`IN_PROGRESS → PENDING_QUALITY → PENDING_ACCEPTANCE → ACCEPTED` |
| `A19` | MUST | 切換至 `ACCEPTED` 之前，必須通過內部 `task-accepted-validator`，檢查驗收簽核與品質合格證均已物化 |
| `A19` | MUST | 任務狀態變更至 `ACCEPTED` 與 `TaskAcceptedConfirmed` 事件寫入 `ws-outbox` 必須封裝於同一個 L2 Firestore Transaction [D29] |
| `A19` | MUST | `TaskAcceptedConfirmed` 事件必須路由至 L4 IER `CRITICAL_LANE`，保障金融事實的低延遲高可靠性 |
| `A19` | FORBIDDEN | 禁止外部服務（含 VS9）直接修改 VS5 任務狀態；狀態只能由 VS5 任務 Aggregate 內部驅動 |
| `A19` | FORBIDDEN | 禁止在 Firestore Transaction 之外先寫狀態再補寫 Outbox（雙重寫入模式）[D29] |

**設計原則**（架構正確性優先）：任務狀態封閉性（State Closure）確保業務語義的完整性——驗收是業務事實，請款是財務動作；兩者在邏輯與時間上徹底解耦。TaskAcceptedConfirmed 是二者之間唯一合法的訊號橋接，符合奧卡姆剃刀原則。

### #A20：待請款池規則（finance-staging-pool-rules）

> #A20 為 Finance Staging Pool Gate；凡修改 VS9 finance-staging.acl、Finance_Staging_Pool Projection 或打包鎖定邏輯時必審

| 規則 | 類型 | 說明 |
|------|------|------|
| `A20` | MUST | VS9 `finance-staging.acl` 必須透過 L4 IER `CRITICAL_LANE` 反應式監聽 `TaskAcceptedConfirmed` 事件 |
| `A20` | MUST | 若任務標註為可計費（billable），必須自動將任務事實轉錄至 `Finance_Staging_Pool`，轉錄內容包含：taskId, amount, tags, traceId, acceptedAt |
| `A20` | MUST | `Finance_Staging_Pool` 是 L5 Standard Projection，初始狀態為 `PENDING`（已驗收未請款）|
| `A20` | MUST | 財務人員執行打包動作後，被選取任務的 Staging Pool 記錄狀態立即變更為 `LOCKED_BY_FINANCE` |
| `A20` | MUST | `LOCKED_BY_FINANCE` 狀態的任務不可再次被選入另一個打包動作，防止重複請款 |
| `A20` | FORBIDDEN | VS9 禁止直接呼叫 VS5 API 或寫入 VS5 Aggregate 狀態 |
| `A20` | FORBIDDEN | `Finance_Staging_Pool` 禁止消費方直接寫入；唯一寫入路徑為 L5 Projection Bus via `TaskAcceptedConfirmed` 或打包鎖定命令 [S2] |

**設計原則**（架構正確性優先）：Finance_Staging_Pool 是業務與財務之間的物化緩衝層（Materialized Buffer），允許財務端按現實週期（週結/月結）靈活處置驗收成果，無需等待每一筆任務完成即時請款。

### #A21：Finance Request 獨立生命週期（finance-request-independent-lifecycle）

> #A21 為 Finance Request Lifecycle Gate；凡修改 Finance_Request Aggregate 狀態機、CreateBulkPaymentCommand 或 bundledTaskIds 結構時必審

| 規則 | 類型 | 說明 |
|------|------|------|
| `A21` | MUST | 每一筆打包動作觸發 `CreateBulkPaymentCommand`，在 VS9 生成一個全新的 `Finance_Request` Aggregate |
| `A21` | MUST | `Finance_Request` 狀態機必須嚴格遵循：`DRAFT → AUDITING → DISBURSING → PAID` |
| `A21` | MUST | `Finance_Request` 必須完整記錄 `bundledTaskIds[]`，建立明確的 1:N 溯源關係 |
| `A21` | MUST | Finance_Request 狀態變更與 `FinanceRequestStatusChanged` 事件寫入 `finance-outbox` 必須封裝於同一個 L2 Firestore Transaction [D29] |
| `A21` | MUST | `Finance_Request` 的精確狀態讀取必須使用 `STRONG_READ` [S3]；display 用讀取才可使用 `EVENTUAL_READ` |
| `A21` | FORBIDDEN | VS5 任務 Aggregate 禁止直接查詢或修改 VS9 Finance_Request 狀態 |
| `A21` | FORBIDDEN | 禁止為同一批次任務發起兩個 Finance_Request（LOCKED_BY_FINANCE 鎖定防止重複請款）[#A20] |

**設計原則**（架構正確性優先）：Finance_Request 的所有複雜金融規則（請款、預算對帳、撥款）全部收斂至其狀態機中；VS5 任務不需要知道錢怎麼付，VS9 Finance 不需要知道任務怎麼驗收。複雜度的物理隔離使系統在面對 WBS 業務時具備高抗壓性與可追蹤性。

### #A22：逆向回饋投影（finance-task-feedback-projection）

> #A22 為 Finance Feedback Projection Gate；凡修改 FinanceRequestStatusChanged 事件結構或 task-finance-label-view 投影邏輯時必審

| 規則 | 類型 | 說明 |
|------|------|------|
| `A22` | MUST | 當 Finance_Request 狀態變更時，VS9 必須透過 `finance-outbox`（`STANDARD_LANE`）發出 `FinanceRequestStatusChanged` 事件 |
| `A22` | MUST | L5 `task-finance-label-view` 投影消費 `FinanceRequestStatusChanged`，逆向更新 VS5 任務的金融顯示標籤（financeStatus, requestId, requestLabel）|
| `A22` | MUST | 前端 UI 透過 `task-finance-label-view` 投影合成顯示：任務狀態（已驗收）+ 金融狀態（已打包請款 REQ-001 / 審核中）|
| `A22` | MUST | `task-finance-label-view` 投影必須引用 `SK_VERSION_GUARD` [S2] |
| `A22` | FORBIDDEN | 前端禁止直讀 VS9 Finance 域資料以合成任務顯示；必須使用 `task-finance-label-view` 投影 |
| `A22` | FORBIDDEN | L5 投影禁止反向寫入 VS5 任務 Aggregate 狀態；只允許更新讀模型（task-finance-label-view）|

**設計原則**（架構正確性優先）：利用 IER 與 L5 Projection Bus 的透明記錄，可從任意一張請款單（Finance_Request）追蹤回所有原始任務節點，實現零模糊的金融治理審計路徑。

---

## VS8 語義認知引擎正規規則體系（G/C/E/O/B Series）

> **設計動機與診斷**：VS8 語義認知引擎過去面臨十項核心架構缺陷（P1–P10），涵蓋「分類邏輯散落各切片（if-else 字串比對）」、「技能需求硬寫陣列（靜態 JSON）」、「AI 決策不可解釋（黑盒輸出）」、「語義腐爛無人察覺（無監控）」、「人員資格靠人工比對」、「分類結果無法學習（靜態規則）」、「副作用混入語義層」、「向量與本體論脫節」、「治理無強制審核」、「跨切片語義不一致」。G/C/E/O/B 五個系列規則是對上述問題的**完整正式規範（Formal Specification）**，旨在從架構層面根除 Spaghetti 結構，使 VS8 成為語義推理的唯一可信真相。本節規則的設計遵循**架構正確性優先原則**：不以補丁修補結構問題，而是透過正確的抽象與清晰的職責邊界實現必要且充分的簡潔。

> **VS8 Gate**：凡新增或修改 `src/features/semantic-graph.slice/` 中任何模組，或跨切片引用 VS8 Port 介面時，必須對照本節所有適用規則進行完整審查。本節規則以**架構正確性優先原則**為最高裁決標準；任何違規不得以業務進度為由繞過，必須立即進行結構性修正（Structural Correction）而非補丁覆蓋。

---

### G 系列：Semantic Governance 治理規則 [G1–G7]

> G 系列規則屬於語義治理的**硬不變量（Hard Invariants）**，違反即視為架構違規，不接受業務端例外申請。

| 規則 | 類型 | 說明 |
|------|------|------|
| `G1` | MUST | `centralized-tag.aggregate`（CTA）是全域語義字典的唯一真相（SSOT）；所有 `TaskNode` slug、`SkillNode` slug、分類學節點，必須先在 CTA 完成註冊並進入 `Active` 狀態，方可在任何切片中被引用；未註冊的 slug 引用視為架構違規 |
| `G1` | FORBIDDEN | 禁止任何切片自行定義全域語義類別，或引用未在 CTA 完成 `Active` 狀態的 slug |
| `G2` | MUST | 語義標籤生命週期是**單向狀態機**，路徑唯一：`Draft → Active → Stale → Deprecated`；任何跳躍轉換或逆向轉換由 `invariant-guard` 攔截 |
| `G2` | FORBIDDEN | 不接受業務端以任何理由申請跳躍或逆向轉換語義標籤狀態 |
| `G3` | MUST | `invariant-guard` 擁有最高裁決權，負責強制執行物理邏輯不可違反的語義規則；裁決結果不可被任何上游覆蓋 |
| `G3` | MUST | 規則範例：`essence_type = COMPLIANCE` 的 `TaskNode`，其 `required_skills` 中必須存在至少一個 `cert_required = true` 的 `SkillNode`，違反即攔截 |
| `G3` | FORBIDDEN | 禁止任何模組繞過或覆蓋 `invariant-guard` 的裁決結果 |
| `G4` | MUST | VS8 的所有寫入路徑唯一：portal-editor / 任何切片 → L2 `CMD_GWAY` → CTA |
| `G4` | FORBIDDEN | 禁止任何模組繞過 `CMD_GWAY` 直接寫入 CTA、Graph 邊或任何 VS8 內部狀態 |
| `G5` | MUST | `semantic-governance-portal` 的所有治理變更必須經由 `portal-outbox` 廣播，DLQ 分級強制為 `REVIEW_REQUIRED` |
| `G5` | FORBIDDEN | 語義治理變更不允許 `SAFE_AUTO` 自動 Replay，必須經人工確認後方可進入 IER |
| `G6` | MUST | `staleness-monitor` 是語義腐爛的唯一預警點；其時間閾值必須引用 `SK_STALENESS_CONTRACT.TAG_MAX_STALENESS ≤ 30s` [S4] |
| `G6` | FORBIDDEN | 禁止在 `staleness-monitor` 內部硬寫任何時間數值 |
| `G7` | MUST | `semantic-protocol` 是跨切片語義訊號的協議憲法；所有穿越切片邊界的 command 與 event envelope 必須攜帶 `semanticTagSlugs` |
| `G7` | FORBIDDEN | 缺失 `semanticTagSlugs` 的跨切片訊號視為協議違規，由 `semantic-protocol` 攔截，不進入下游處理 |

---

### C 系列：Core Domain 主體圖規則 [C1–C11]

> C 系列規則定義主體圖（Subject Graph）的**結構本體論**，確保圖的語義完整性與一致性。

| 規則 | 類型 | 說明 |
|------|------|------|
| `C1` | MUST | VS8 維護的是**主體圖**（Subject Graph）；主體圖描述「世界中存在什麼以及存在物之間的結構關係」；因果（事件序列、動態過程）從主體圖推論得出，由 IER 與 L5 Projection 承載 |
| `C1` | FORBIDDEN | VS8 不維護因果圖；禁止在 VS8 內執行因果的物化或副作用 |
| `C2` | MUST | 主體圖有且僅有五種合法邊類型：`REQUIRES`（Task→Skill）、`HAS_SKILL`（Person→Skill）、`IS_A`（Skill→Skill 分類學繼承）、`DEPENDS_ON`（Task→Task 前置依賴）、`TRIGGERS`（Task→Task 完成觸發） |
| `C2` | FORBIDDEN | 禁止業務端自定義邊類型；擴充邊類型必須經過 `semantic-governance-portal` 治理流程 |
| `C3` | MUST | 所有邊必須攜帶 `weight ∈ [0,1]`；`REQUIRES` 邊的 weight 來源為對應 `SkillNode` 的 `granularity`；`HAS_SKILL` 邊的 weight 來源為 Person 的 `xp/tier` 換算值 |
| `C3` | FORBIDDEN | 禁止業務端在任何邊上硬寫 weight 數值；所有 weight 由 `weight-calculator` 統一計算 |
| `C4` | MUST | 分類學（Taxonomy）由 `IS_A` 邊與 `hierarchy-manager` 共同構成；父技能的滿足隱含對子技能 `REQUIRES` 的滿足 |
| `C4` | MUST | 分類學的任何修改必須經過 `semantic-governance-portal` 治理流程 [G4] |
| `C5` | MUST | 每個新標籤節點必須透過 `hierarchy-manager` 掛載至少一個父節點；孤立節點（無父節點）不得進入 `Active` 狀態 |
| `C5` | FORBIDDEN | 孤立節點的存在視為未完成的語義定義 |
| `C6` | MUST | `TaskNode.essence_type` 有且僅有三個合法值：`PHYSICAL_INSTALL`、`LOGIC_CONFIG`、`COMPLIANCE`；此欄位由 `cost-item-classifier` 推理賦值 |
| `C6` | FORBIDDEN | 禁止業務端直接賦值或覆蓋 `TaskNode.essence_type` |
| `C7` | MUST | `TaskNode.shouldMaterializeAsTask` 是推理結果（非資料庫欄位）；只有 `essence_type = PHYSICAL_INSTALL` 或符合 EXECUTABLE override 規則（機電檢測/施工測試類）的 TaskNode 才觸發 VS5 `task.aggregate` 物化；override 規則本身是 Graph 上的一條 `IS_A` 邊 |
| `C7` | FORBIDDEN | override 規則不得以 if-else 實作；必須表達為 Graph 邊 |
| `C8` | MUST | `SkillNode.granularity` 是語義匹配的精細度參數，初始值由語義定義時設定，後續只由 `learning-engine` 根據事實事件演化 |
| `C8` | FORBIDDEN | 禁止任何切片手動修改 `granularity` |
| `C9` | MUST | `PersonNode` 是 VS2 `user-account` 在語義圖中的唯讀投影映射；`PersonNode.skill_inventory` 的更新來源唯一，由 VS3 `SkillXpAdded` / `SkillXpDeducted` 事件透過 `ISemanticFeedbackPort` 驅動 |
| `C9` | FORBIDDEN | 禁止任何路徑直接寫入 `PersonNode` |
| `C10` | MUST | `vector-store` 的向量是推理的輸入工具；向量必須與 CTA 標籤定義保持同步刷新，刷新延遲受 `SK_STALENESS_CONTRACT` [S4] 約束 |
| `C10` | FORBIDDEN | 過期向量不得用於任何推理輸入 |
| `C11` | MUST | 向量搜尋的結果必須經過 graph traversal 確認才能成為有效分類；向量負責縮小候選 slug 範圍，Graph 負責確認分類的結構正確性，兩者缺一不可 |
| `C11` | FORBIDDEN | 禁止以純向量相似度作為最終分類依據 |

---

### E 系列：Compute Engine 推理規則 [E1–E12]

> E 系列規則定義 VS8 Compute Engine 各模組的**推理邏輯邊界**，確保推理過程可追蹤、可審計。

| 規則 | 類型 | 說明 |
|------|------|------|
| `E1` | MUST | `semantic-edge-store` 是唯一合法的邊圖操作點；所有對 Graph 邊的讀取與寫入必須經過 `semantic-edge-store` |
| `E1` | FORBIDDEN | 禁止任何模組直接操作底層圖資料結構 |
| `E2` | MUST | `weight-calculator` 是語義相似度的統一出口；`computeSimilarity(a, b)` 是系統中唯一合法的語義相似度計算介面 |
| `E2` | FORBIDDEN | 禁止業務端、AI Flow 或任何其他模組自行實作語義加權邏輯 |
| `E3` | MUST | `adjacency-list` 的拓撲閉包計算是業務端消費圖結構的唯一合法路徑 [T5]；對外暴露 `getTransitiveRequirements`、`isSupersetOf`、`findCriticalPath` 三個介面 |
| `E3` | FORBIDDEN | 禁止業務端直接遍歷圖節點或邊集合 |
| `E4` | MUST | `cost-item-classifier` 是訂單項次語義分類的唯一入口，實作 `ISemanticClassificationPort`；系統中任何位置的訂單項次分類邏輯必須統一路由至此 |
| `E4` | FORBIDDEN | 禁止在 VS5 或任何其他切片中存在基於字串比對的分類邏輯 |
| `E5` | MUST | `cost-item-classifier` 的推理流程是固定三步驟，不可跳躍：① vector similarity 縮小候選 slug 範圍；② graph traversal 確認 `essence_type`；③ 套用 override 規則（override 規則本身是 Graph 邊） |
| `E5` | MUST | 輸出必須包含 `confidence` 與 `inferenceTrace[]` |
| `E6` | MUST | 每次推理必須輸出 `inferenceTrace[]`；`inferenceTrace` 記錄完整的推理路徑，包含每一步的候選 slug、邊類型、weight 值及 override 觸發記錄 |
| `E6` | FORBIDDEN | 無 `inferenceTrace` 的推理結果視為不完整，不得進入任何下游流程 |
| `E7` | MUST | `skill-matcher` 的人員資格推理必須同時滿足三個條件：① tier ≥ Task 要求層級；② granularity 覆蓋度 ≥ REQUIRES 邊 weight；③ `cert_required = true` 的 Skill 必須有對應合規證照 |
| `E7` | FORBIDDEN | 任一條件不滿足即判定不合格；不允許部分滿足的模糊通過 |
| `E8` | MUST | `causality-tracer` 的 BFS 因果傳播邊來源唯一：主體圖的 `TRIGGERS` 與 `DEPENDS_ON` 邊 |
| `E8` | FORBIDDEN | `causality-tracer` 不自行定義因果規則；所有因果路徑必須在主體圖中有對應邊作為依據 |
| `E9` | MUST | `learning-engine` 的權重演化只接受兩種事實事件作為輸入：VS3 `SkillXpAdded` / `SkillXpDeducted`（強化/弱化 HAS_SKILL 邊 weight）與 VS5 `TaskCompleted`（強化 REQUIRES 邊信心值）；強制邊界由 `ISemanticFeedbackPort` 實施 |
| `E9` | FORBIDDEN | 禁止任何其他事件繞過 `ISemanticFeedbackPort` 直接驅動 `learning-engine` |
| `E10` | MUST | `semantic-decay` 的衰退週期必須綁定 `SK_STALENESS_CONTRACT` [S4]；衰退邏輯只作用於長期無事實事件支撐的邊 weight |
| `E10` | FORBIDDEN | 禁止衰退邏輯覆蓋有活躍事實事件支撐的邊 |
| `E11` | MUST | `routing-engine` 只輸出 `SemanticRouteHint` contract，是純語義計算的建議輸出 |
| `E11` | FORBIDDEN | `routing-engine` 禁止持有任何副作用，禁止直接呼叫 VS6 排班或 VS7 通知；副作用的執行由訂閱 `SemanticRouteHint` 的對應切片自行負責 |
| `E12` | MUST | `context-attention` 的 Workspace 語義情境過濾是 Engine 層的統一職責；所有需要 Workspace 情境感知的語義查詢必須透過 `filterByContext(slugs, wsCtx)` 處理 |
| `E12` | FORBIDDEN | 禁止 VS8 以外的切片自行實作語義情境過濾邏輯 |

---

### O 系列：Output 輸出規則 [O1–O6]

> O 系列規則定義 VS8 對外輸出的**唯一合法出口**，確保跨切片語義消費遵守 CQRS 讀寫分離與 Port 介面原則。

| 規則 | 類型 | 說明 |
|------|------|------|
| `O1` | MUST | VS8 對外暴露三個 Port 介面作為唯一合法出口：`ISemanticClassificationPort`（供 VS5 呼叫分類）、`ISkillMatchPort`（供 L10 Genkit Flow 呼叫資格推理）、`ISemanticFeedbackPort`（供 `learning-engine` 接收事實事件） |
| `O1` | FORBIDDEN | 禁止任何切片或 AI Flow 繞過 Port 直接呼叫 VS8 內部模組 |
| `O2` | MUST | 業務端讀取語義資料的唯一合法路徑是 `projection.tag-snapshot` [T5]；`semantic-registry` 的資料來源也必須是 `projection.tag-snapshot`，遵守 CQRS 讀寫分離原則 |
| `O2` | FORBIDDEN | 禁止業務端直接查詢 CTA aggregate 或 `semantic-edge-store` |
| `O3` | MUST | `projection.task-semantic-view` 必須同時包含 `required_skills`（來自 Graph REQUIRES 邊）與 `eligible_persons`（來自 `skill-matcher` 推理結果）；兩者缺一則投影視為不完整，不得對外提供 |
| `O4` | MUST | `projection.causal-audit-log` 的每條記錄必須包含 `inferenceTrace[]` 與 `traceId` [R8]；`traceId` 從 event-envelope 讀取 |
| `O4` | FORBIDDEN | 禁止在 `causal-audit-log` 中重新生成 `traceId`；不含 `traceId` 或 `inferenceTrace` 的審計記錄視為不合規 |
| `O5` | MUST | `tag-outbox` 是 VS8 內部唯一的 outbox 節點，DLQ 分級為 `SAFE_AUTO`；路徑唯一：`tag-outbox → RELAY → IER → L5 FUNNEL → projection.tag-snapshot` |
| `O5` | FORBIDDEN | 禁止在 VS8 任何子模組中重複定義第二個 outbox 節點 |
| `O6` | MUST | `TagLifecycleEvent` 的廣播路徑唯一：必須經由 `tag-outbox → RELAY → IER` |
| `O6` | FORBIDDEN | 禁止 `TagLifecycleEvent` 繞過 IER 直接更新任何 Projection 或觸發任何切片邏輯 |

---

### B 系列：Boundary 邊界規則 [B1–B5]

> B 系列規則定義 VS8 的**切片邊界與依賴方向**，確保 VS8 的純語義職責不被副作用污染。

| 規則 | 類型 | 說明 |
|------|------|------|
| `B1` | MUST | VS8 的職責邊界是「語義推理與語義輸出」；VS8 不執行任何業務副作用；任務物化歸 VS5，排班執行歸 VS6，通知執行歸 VS7 |
| `B1` | FORBIDDEN | 任何試圖在 VS8 內部直接觸發跨切片副作用的設計視為邊界違規 |
| `B2` | MUST | VS8 內部各層的依賴方向是單向的：`Governance → Core → Engine → Output` |
| `B2` | FORBIDDEN | 禁止任何逆向依賴；Output 層只能透過 Port 介面被外部消費，不能被 Engine 層直接呼叫 |
| `B3` | MUST | AI Flow（L10 Genkit）存取 VS8 的路徑有且僅有兩條：透過 `ISemanticClassificationPort` 取得分類結果，透過 `ISkillMatchPort` 取得資格推理結果 |
| `B3` | FORBIDDEN | 禁止 AI Flow 直接呼叫 VS8 任何內部模組 |
| `B4` | MUST | VS8 的分類學（Taxonomy）與向量（Vector）共同服務於語義推理，但職責嚴格分離：分類學是本體論（世界是什麼），向量是認識論工具（如何從模糊輸入找到精確節點） |
| `B4` | FORBIDDEN | 禁止以向量替代分類學；禁止以分類學替代向量的模糊匹配能力 |
| `B5` | MUST | VS8 是主體圖的維護者，不是因果圖的維護者；VS8 可以從主體圖推論出因果路徑（`causality-tracer`），但因果的執行與物化屬於 IER 與 L5 Projection 的職責 |
| `B5` | FORBIDDEN | 禁止在 VS8 內執行因果的物化、狀態更新或任何業務副作用 |

**設計原則**（架構正確性優先）：B 系列規則確保 VS8 的狀態始終是語義現實的靜態鏡像，而不是動態流程的執行引擎。這條邊界使 VS8 在面對複雜業務演化時保持結構穩定、可審計、可演進。

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
| `A15` | finance-lifecycle-gate（進入閘門：task ACCEPTED via task-accepted-validator 才可進入 Finance Staging Pool）|
| ~~`A16`~~ | ~~multi-claim-cycle~~ → **已由 `#A21` 正式升級取代**；VS5 Finance 複雜生命週期移交 VS9 Finance_Request（DRAFT→AUDITING→DISBURSING→PAID）；禁止在新工作中引用 A16 |
| `A17` | skill-xp-award-contract |
| `A18` | org-semantic-extension |
| `A19` | task-lifecycle-convergence（VS5 任務狀態封閉性 + Validator 門禁 + TaskAcceptedConfirmed 原子化）|
| `A20` | finance-staging-pool-rules（VS9 反應式攔截 + LOCKED_BY_FINANCE 打包鎖定）|
| `A21` | finance-request-independent-lifecycle（VS9 Finance_Request：DRAFT→AUDITING→DISBURSING→PAID，1:N bundledTaskIds）|
| `A22` | finance-task-feedback-projection（FinanceRequestStatusChanged → L5 task-finance-label-view 逆向回饋）|

### E 類（Security Gate 閉環）

| 索引 | 摘要 |
|------|------|
| `E7` | app-check-enforcement-closure |
| `E8` | genkit-tool-governance |

### G 類（VS8 Semantic Governance 治理不變量）

| 索引 | 摘要 |
|------|------|
| `G1` | CTA-ssot（CTA 是全域語義字典唯一真相；未 Active 的 slug 不可引用） |
| `G2` | tag-lifecycle-unidirectional（生命週期單向狀態機：Draft→Active→Stale→Deprecated） |
| `G3` | invariant-guard-supreme（最高裁決權；COMPLIANCE TaskNode 必須有 cert_required Skill） |
| `G4` | cta-write-path-exclusive（寫入路徑唯一：CMD_GWAY → CTA；禁止繞過） |
| `G5` | governance-portal-review-required（治理變更 DLQ 強制 REVIEW_REQUIRED；禁止 SAFE_AUTO） |
| `G6` | staleness-monitor-sla-reference（TAG_MAX_STALENESS 必須引用 SK_STALENESS_CONTRACT；禁止硬寫） |
| `G7` | semantic-protocol-cross-slice（跨切片訊號必須攜帶 semanticTagSlugs；缺失即攔截） |

### C 類（VS8 Core Domain 主體圖不變量）

| 索引 | 摘要 |
|------|------|
| `C1` | subject-graph-boundary（VS8 只維護主體圖；因果圖由 IER+L5 承載） |
| `C2` | five-legal-edge-types（五種合法邊：REQUIRES/HAS_SKILL/IS_A/DEPENDS_ON/TRIGGERS；禁止自定義） |
| `C3` | weight-calculator-exclusive（所有邊 weight 由 weight-calculator 計算；禁止硬寫） |
| `C4` | taxonomy-governance（IS_A 邊分類學修改必須走 governance-portal [G4]） |
| `C5` | no-orphan-node（新標籤必須掛載父節點；孤立節點不得 Active） |
| `C6` | essence-type-classifier（TaskNode.essence_type 只由 cost-item-classifier 賦值；禁止業務端覆蓋） |
| `C7` | materialize-as-inference（shouldMaterializeAsTask 是推理結果；override 規則是 IS_A 邊，非 if-else） |
| `C8` | granularity-learning-only（SkillNode.granularity 只由 learning-engine 演化；禁止手動修改） |
| `C9` | person-node-readonly-projection（PersonNode 唯讀；唯一更新來源是 ISemanticFeedbackPort） |
| `C10` | vector-sync-freshness（向量必須與 CTA 同步；過期向量不得用於推理） |
| `C11` | vector-graph-dual-confirmation（向量縮範 + Graph 確認缺一不可；禁止以純向量作最終分類） |

### E 系列（VS8 Compute Engine 推理邊界）

| 索引 | 摘要 |
|------|------|
| `E1` | edge-store-exclusive（所有邊操作必須經 semantic-edge-store；禁止直操作底層圖） |
| `E2` | weight-calculator-sole-interface（computeSimilarity 是唯一語義相似度介面；禁止業務端自行計算） |
| `E3` | adjacency-list-topology（拓撲閉包唯一合法路徑；暴露 3 個介面；禁止直接遍歷） |
| `E4` | cost-item-classifier-sole-entry（ISemanticClassificationPort；禁止切片自行字串比對分類） |
| `E5` | three-step-inference（向量縮範→Graph 確認→override 三步不可跳躍；輸出含 confidence+inferenceTrace） |
| `E6` | inference-trace-mandatory（每次推理必須輸出 inferenceTrace[]；無 trace 不得進入下游） |
| `E7` | skill-matcher-triple-gate（tier+granularity+cert 三條件缺一不可；禁止部分滿足通過） |
| `E8` | causality-tracer-graph-only（BFS 來源唯一為 TRIGGERS+DEPENDS_ON 邊；禁止自定義因果規則） |
| `E9` | learning-engine-fact-events-only（只接受 VS3/VS5 事實事件；禁止繞過 ISemanticFeedbackPort） |
| `E10` | semantic-decay-sla-bound（衰退週期綁定 SK_STALENESS_CONTRACT；禁止覆蓋活躍事件支撐的邊） |
| `E11` | routing-engine-hint-only（只輸出 SemanticRouteHint；禁止持有副作用或直呼 VS6/VS7） |
| `E12` | context-attention-unified（filterByContext 由 VS8 統一；禁止其他切片自行過濾語義情境） |

### O 類（VS8 Output 輸出不變量）

| 索引 | 摘要 |
|------|------|
| `O1` | three-port-interfaces（ISemanticClassificationPort/ISkillMatchPort/ISemanticFeedbackPort 是唯一出口；禁止繞過） |
| `O2` | tag-snapshot-read-path（業務端讀取唯一路徑是 projection.tag-snapshot；禁止直查 CTA） |
| `O3` | task-semantic-view-completeness（required_skills+eligible_persons 必須同時存在；缺一不完整） |
| `O4` | causal-audit-log-with-trace（每條記錄必須含 inferenceTrace[]+traceId；禁止重新生成 traceId） |
| `O5` | tag-outbox-single-node（VS8 唯一 outbox，DLQ=SAFE_AUTO；禁止重複定義第二個 outbox） |
| `O6` | tag-lifecycle-event-ier-path（TagLifecycleEvent 廣播路徑唯一：tag-outbox→RELAY→IER；禁止繞過 IER） |

### B 類（VS8 Boundary 邊界不變量）

| 索引 | 摘要 |
|------|------|
| `B1` | vs8-semantic-only（VS8 只做語義推理輸出；禁止直接觸發跨切片副作用） |
| `B2` | governance-core-engine-output-unidirectional（內部依賴方向單向；禁止逆向依賴） |
| `B3` | ai-flow-port-only（AI Flow 只能透過 ISemanticClassificationPort/ISkillMatchPort 存取 VS8） |
| `B4` | taxonomy-vector-separation（分類學是本體論，向量是認識論工具；禁止互相取代） |
| `B5` | subject-graph-not-causal-executor（VS8 推論因果路徑，但因果執行歸 IER+L5；禁止在 VS8 內執行副作用） |

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
| VS5 MUST 任務狀態封閉性 [#A19] | 禁止外部服務直接變更任務狀態；任務狀態必須遵循嚴格路徑 `IN_PROGRESS → PENDING_QUALITY → PENDING_ACCEPTANCE → ACCEPTED`；過渡至 `ACCEPTED` 須通過內部 `task-accepted-validator`（驗收簽核 + 品質合格證）|
| VS5 MUST TaskAcceptedConfirmed 原子化 [#A19 D29] | 任務狀態變更至 `ACCEPTED` 與 `TaskAcceptedConfirmed` 事件寫入 ws-outbox 必須封裝於同一個 L2 Firestore Transaction |
| VS5 MUST Finance 階段閘 [#A15] | 任務 `ACCEPTED` 之前禁止進入 Finance 流程；Finance 生命週期由 VS9 管理，Completed 條件為所有關聯 Finance_Request.status = PAID |
| VS5 MUST XP 只透過 IER 傳遞至 VS3 | 任務/品質流程禁止直接 mutate VS3 XP；事件 `TaskCompleted` / `QualityAssessed` 必須經 IER 傳入 VS3 [D9 #A17] |
| VS5 MUST 語義讀取僅經 L6 | VS5 語義讀取必須經 L6 Query Gateway；禁止直連 DB 或跨越 VS8 圖結構邊界 [D21-7 T5] |
| VS5 / VS6 MUST vis-* 元件消費 VisDataAdapter DataSet<> | vis-network（任務依賴圖）/ vis-timeline（排班日程）/ vis-graph3d（語義 3D 圖）只能消費 `VisDataAdapter` DataSet<>；禁止直連 Firebase [D28] |

### VS9 強制規則（Finance 金融聚合閘道）

| 規則 | 說明 |
|------|------|
| VS9 MUST 反應式攔截 [#A20] | VS9 `finance-staging.acl` 必須監聽 L4 IER `CRITICAL_LANE` 的 `TaskAcceptedConfirmed` 事件；可計費任務自動轉錄至 `Finance_Staging_Pool`（禁止 VS9 直接呼叫 VS5 API）|
| VS9 MUST 打包鎖定 [#A20] | 財務人員執行打包動作後，`Finance_Staging_Pool` 中被選取的任務狀態必須立即變更為 `LOCKED_BY_FINANCE`；防止重複請款 |
| VS9 MUST Finance_Request 獨立生命週期 [#A21] | 每一筆打包動作觸發 `CreateBulkPaymentCommand`，在 VS9 生成一個新的 `Finance_Request` Aggregate；狀態機 `DRAFT → AUDITING → DISBURSING → PAID`；必須完整記錄 `bundledTaskIds[]`（1:N 溯源關係）|
| VS9 MUST Finance_Request 原子化 [#A21 D29] | Finance_Request 狀態變更與 `FinanceRequestStatusChanged` 事件寫入 finance-outbox 必須封裝於同一個 L2 Firestore Transaction |
| VS9 MUST 逆向回饋投影 [#A22] | 當 Finance_Request 狀態變更時，VS9 必須透過 `finance-outbox` 發出 `FinanceRequestStatusChanged` 事件（STANDARD_LANE），由 L5 `task-finance-label-view` 逆向更新 VS5 任務的金融顯示標籤 |
| VS9 MUST TaskAcceptedConfirmed 走 CRITICAL_LANE | 從 `TaskAccepted` 到 `Finance_Staging_Pool` 的事件流強制路由至 L4 IER `CRITICAL_LANE`，保證金融事實的低延遲高可靠性 [#A19] |
| VS9 MUST 讀取僅經 L6 Query Gateway | VS9 Finance_Staging_Pool 讀取必須經 L6 `QGWAY_FIN_STAGE`；禁止直連 Firebase 或跨切片直讀 |

### VS8 強制規則（Semantic Cognition Engine 語義認知引擎）

| 規則 | 說明 |
|------|------|
| VS8 MUST 寫入唯一路徑 [G4] | 所有語義寫入必須走 L2 CMD_GWAY → CTA；禁止任何模組繞過 CMD_GWAY 直接寫入 CTA、Graph 邊或 VS8 內部狀態 |
| VS8 MUST 標籤生命週期單向 [G2] | 生命週期路徑唯一：Draft→Active→Stale→Deprecated；任何跳躍或逆向由 invariant-guard 攔截 |
| VS8 MUST Port 介面唯一出口 [O1] | VS8 對外只暴露三個 Port：ISemanticClassificationPort（VS5 分類）、ISkillMatchPort（L10 AI Flow）、ISemanticFeedbackPort（learning-engine 事實事件）；禁止繞過 Port 直接呼叫內部模組 |
| VS8 MUST 讀取只經 tag-snapshot [O2] | 業務端讀取語義資料唯一路徑是 projection.tag-snapshot；禁止直查 CTA 或 semantic-edge-store |
| VS8 MUST 推理三步驟完整 [E5 E6] | cost-item-classifier 必須完整執行：① 向量縮範 → ② Graph 確認 → ③ override 規則；輸出必須包含 inferenceTrace[] |
| VS8 MUST skill-matcher 三條件全滿 [E7] | tier ≥ 要求層級 AND granularity 覆蓋度 ≥ REQUIRES 邊 weight AND cert_required Skill 有合規證照；三者缺一不可 |
| VS8 MUST tag-outbox 唯一 [O5 O6] | VS8 只有一個 outbox（tag-outbox，DLQ=SAFE_AUTO）；TagLifecycleEvent 廣播必須經 tag-outbox→RELAY→IER；禁止繞過 IER |
| VS8 MUST learning-engine 只接受事實事件 [E9] | 唯一輸入：VS3 SkillXpAdded/SkillXpDeducted + VS5 TaskCompleted；透過 ISemanticFeedbackPort；禁止其他事件直驅 |
| VS8 MUST staleness-monitor 引用 SLA 常數 [G6] | TAG_MAX_STALENESS 必須引用 SK_STALENESS_CONTRACT [S4]；禁止硬寫數值 |
| VS8 MUST routing-engine 只輸出 SemanticRouteHint [E11] | routing-engine 是純語義計算建議輸出；禁止持有副作用或直呼 VS6/VS7 |
| VS8 MUST governance-portal 治理變更走 REVIEW_REQUIRED [G5] | semantic-governance-portal 所有治理變更 DLQ 強制 REVIEW_REQUIRED；禁止 SAFE_AUTO replay |
| VS8 FORBIDDEN 跨切片副作用 [B1] | VS8 禁止直接觸發任務物化（VS5）、排班執行（VS6）或通知發送（VS7）；副作用由訂閱 SemanticRouteHint 的切片執行 |

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
