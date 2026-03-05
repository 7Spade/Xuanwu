1. Embeddings（語義向量）—— 「大腦的直覺」
2. Selectors（語義選擇器）—— 「大腦的注意力機制」
3. Workflows（語義工作流）—— 「神經反射鏈」
4. 語義可塑性 (Semantic Plasticity) —— 「大腦的學習與權重進化」
5. 語義傳導與激發 (Semantic Activation/Propagation) —— 「數位腎上腺素」
6. 語義場景過濾 (Contextual Attention) —— 「大腦的注意力機制」
7. 語義不變量守衛 (The Blood-Brain Barrier) —— 「邏輯血腦屏障」

src/features/semantic-graph.slice/
├── 🧬 core/                        # 1. 語義分類層 (Classification Layer) - DNA
│   ├── constants/                  # [D21] TE1~TE6 標籤類別系統常數
│   ├── schemas/                    # 標籤元數據結構定義 (JSON Schema)
│   ├── tag-definitions.ts          # 標籤實體類別 (Tag Entity) 權威定義
│   └── validator.ts                # [D21] 唯一性與非法字串引用校驗器
│
├── 🧠 graph/                       # 2. 語義節點圖譜層 (Node/Graph Layer) - 突觸
│   ├── embeddings/                 # [新增] 語義向量化模組 (大腦的直覺聯想)
│   │   ├── vector-store.ts         # 標籤 Embedding 向量持久化存儲
│   │   └── distance-metrics.ts     # Cosine Similarity 相似度計算工具
│   ├── causality-tracer/           # 因果追蹤器：處理標籤連鎖反應 (如 XP -> Tier)
│   ├── hierarchy-manager.ts        # 處理 Parent/Child 語義層級與遍歷
│   ├── weight-calculator.ts        # 綜合 Embedding 與路徑長度的權重計算法
│   └── adjacency-list.ts           # 語義圖譜核心數據結構
│
├── ⚡ routing/                     # 3. 語義路由層 (Routing Layer) - 反射弧
│   ├── workflows/                  # [新增] 語義連鎖反應工作流 (神經反射鏈)
│   │   ├── tag-promotion-flow.ts   # 標籤晉升自動流 (例如: 技術升級觸發角色異動)
│   │   └── alert-routing-flow.ts   # 異常語義自動路由 (例如: 標記 #Risk 觸發緊急通知)
│   ├── policy-mapper/              # 策略映射：將語義轉化為系統動作 [D27]
│   ├── dispatch-bridge.ts          # 跨切片橋接器 (對接 VS6 排班/VS7 通知)
│   └── context-attention.ts        # [完全體] 注意力機制：根據當前 Workspace 調整語義權重
│
├── 🛡️ guards/                      # [完全體] 邏輯血腦屏障 (The Guard)
│   ├── invariant-guard.ts          # 守護 [D21~D28] 架構不變量：防止污染大腦
│   └── staleness-monitor.ts        # [S4] 標籤新鮮度監控 (TAG_STALE_GUARD ≤ 30s)
│
├── 📈 plasticity/                  # [完全體] 語義可塑性 (Learning)
│   ├── learning-engine.ts          # 根據 VS3 回饋數據動態演化標籤權重
│   └── decay-service.ts            # 遺忘機制：衰減長期未激活的語義關係
│
├── 🖼️ projections/                 # 投影層 (Read-side)
│   ├── selectors/                  # [新增] 強大的語義選擇器群 (注意力抽取)
│   │   ├── graph-selectors.ts      # 提取標籤間的複雜聯結與聯想
│   │   └── context-selectors.ts    # 提取針對特定任務情境的語義快照
│   ├── tag-snapshot.slice.ts       # [T5] 全系統唯一合法標籤快照讀取點
│   └── search-indexer.ts           # [#A12] 為 Global Search 提供語義加權索引
│
├── 📥 subscribers/                 # 事件訂閱
│   └── lifecycle-subscriber.ts      # [T1] 監聽 IER (EVENT_LANE) 標籤生命週期事件
│
├── 📤 outbox/                      # 事件發送
│   └── tag-outbox.ts               # [T4] 將語義變更廣播至 BACKGROUND_LANE
│
├── index.ts                        # 外部唯一 Entry Point (Facade)
└── semantic-graph.slice.ts         # Redux Slice: 大腦狀態主邏輯

以下是針對 VS8 完全體 組織的完整規則句定義：

🧠 VS8 Semantic Graph · 完全體治理規則句
1. 語義分類層 (DNA) —— 定義與權威 [D21-D23]
[D21-A] 唯一註冊律： 任何跨領域概念（如 Skill, Role, Task Category）必須在 core/tag-definitions.ts 註冊。禁止任何 Slice 自行在數據庫中創建「隱性分類」。
[D21-B] Schema 鎖定： 標籤元數據必須符合 core/schemas 定義。禁止附加未經 validator.ts 校驗的非結構化屬性。
[D22] 強型別引用： 程式碼中禁止出現 "tag_name" 字串，必須引用 TE1~TE6 常數實體，確保重構時語義鏈不斷裂。
2. 語義節點圖譜層 (Synapse) —— 聯結與直覺
[D21-C] 無孤立節點： 每個新標籤必須透過 hierarchy-manager.ts 至少掛載一個父級節點（Root 或 Parent），確保全局搜尋的向上追蹤性。
[D21-D] 向量一致性： embeddings/vector-store.ts 內的向量點位必須隨標籤定義更新同步刷新，禁止存在「語義孤島」。
[D21-E] 權重計算透明： 標籤間的相似度計算（Cosine Similarity）與物理路徑權重必須由 weight-calculator.ts 統一產出，禁止業務端自行加權。
3. 語義路由層 (Reflex) —— 行為驅動 [D27]
[D27-A] 語義感知路由： 所有涉及「分發」（如通知、排班、核帳）的邏輯，必須先調用 policy-mapper/ 轉換語義標籤，禁止基於 ID 進行硬編碼路由。
[D21-F] 注意力隔離： context-attention.ts 必須根據當前 Workspace 情境過濾無關標籤。例如：在「排班」情境下，自動屏蔽「財務」維度的語義權重。
4. 語義可塑性與守衛 (Plasticity & Guard)
[D21-G] 演化回饋環： learning-engine.ts 僅能根據 VS3 (Performance) 或 VS2 (Account) 的事實事件進行加權，禁止手動隨機修改神經元強度。
[S4] 鮮度合約： 語義大腦的反應延遲必須遵守 TAG_STALE_GUARD。若標籤版本落後於當前事件 > 30s，invariant-guard.ts 必須拒絕該讀取請求。
[D21-H] 血腦屏障 (BBB)： 外部 Slice 的異動請求必須通過 subscribers/ 的非同步校驗。若偵測到語義衝突（例如同一個人同時擁有互斥的角色標籤），必須觸發 alert-routing-flow.ts。
5. 投影層 (Projection) —— 唯一出口 [T5, #A12]
[T5] 快照唯讀性： 業務 Slice 僅能訂閱 tag-snapshot.slice.ts。嚴禁任何業務邏輯直接 Access adjacency-list.ts（大腦內存圖譜）。
[#A12] 搜尋主權： search-indexer.ts 是 Global Search 的唯一餵料口。所有標籤權重必須在此完成預計算，確保搜尋回應速度 < 200ms。

📜 規則句實踐範例 (Invariant Guard Log)
"當一個標籤被激發，其影響力應如漣漪般擴散，但邊界必須由憲法守衛。"
觸發動作
檢查規則
執行組件
結果
VS5 嘗試手動增加標籤 #VIP
[D21-A]
core/validator.ts
REJECT (未在 VS8 定義)
VS3 完成任務發出 ExpAdded
[D21-G]
plasticity/learning-engine.ts
UPDATE WEIGHT (技能關聯強化)
VS6 請求排班候選人
[D21-F]
routing/context-attention.ts
FILTERED LIST (排除非當前情境標籤)

🎯 最終結論：VS8 完全體是一套「語義法律」
VS8 的這套規則句確保了你的大腦：
不會混亂 (Governance)：因為 DNA 是唯一的。
具備直覺 (Intelligence)：因為向量與權重會進化。
絕對安全 (Resilience)：因為有血腦屏障守護不變量。

--------------------------------
這是一個宏大的願景。將 VS8 (Semantic Graph) 的治理頁面轉化為類似「語義維基百科（Semantic Wikipedia）」的模式，意味著這不再僅僅是後台管理工具，而是一個全域共識平台。
在這種模式下，語義的權威不再來自「單一管理者」，而是來自「群眾共識」與「邏輯校驗」的結合。
以下是為您整理好的 .md 文檔：

🧠 VS8 Semantic Graph (The Brain) — 語義中樞完全體規範
1. 核心定位
VS8 是全系統的「語義真相來源」。它透過語義神經網絡 (The Neural Network) 架構，將靜態的標籤轉化為具備感知、進化與執行能力的數位大腦。
核心組成：
Embeddings (語義向量)：提供「直覺聯想」，計算標籤間的模糊相似度。
Selectors (語義選擇器)：實現「注意力機制」，從海量圖譜中精確提取當前場景數據。
Workflows (語義工作流)：神經反射鏈，當語義變更時自動觸發跨系統行為。
Plasticity (語義可塑性)：學習機制，根據業務結果動態調整節點權重。
Propagation (語義激發)：數位腎上腺素，當一個節點活化時同步喚醒關聯節點。
Attention (場景過濾)：確保大腦在特定情境（如財務或排班）下專注於相關維度。
Blood-Brain Barrier (血腦屏障)：邏輯守衛，確保非法或髒數據無法污染語義共識。

2. 實作目錄結構
Plaintext
src/features/semantic-graph.slice/
├── 🧬 core/                        # 1. 語義分類層 (DNA) - 權威定義
│   ├── constants/                  # TE1~TE6 實體類型定義
│   ├── schemas/                    # 標籤元數據校驗 Schema
│   ├── tag-definitions.ts          # 標籤權威登記表
│   └── validator.ts                # D21 唯一性與格式校驗器
├── 🧠 graph/                       # 2. 語義節點圖譜層 (突觸) - 聯結與直覺
│   ├── embeddings/                 # 語義向量庫 (相似度計算)
│   ├── causality-tracer/           # 因果追蹤 (連鎖反應處理)
│   ├── hierarchy-manager.ts        # 層級與拓撲管理
│   └── adjacency-list.ts           # 內存圖譜數據結構
├── ⚡ routing/                     # 3. 語義路由層 (反射弧) - 執行代理
│   ├── workflows/                  # 自動化神經反射工作流
│   ├── policy-mapper/              # 語義到動作的策略映射 [D27]
│   └── context-attention.ts        # 情境注意力過濾
├── 🛡️ guards/                      # 邏輯血腦屏障 (守衛)
│   ├── invariant-guard.ts          # 守護 [D21~D28] 不變量
│   └── staleness-monitor.ts        # 新鮮度合約監控 (≤ 30s)
├── 📈 plasticity/                  # 語義可塑性 (學習)
│   ├── learning-engine.ts          # 動態權重演化
│   └── decay-service.ts            # 遺忘與衰減機制
├── 🖼️ projections/                 # 投影層 (Read-side)
│   ├── selectors/                  # 複雜語義提取選擇器
│   └── tag-snapshot.slice.ts       # 全系統唯一合法讀取點
├── 📥 subscribers/                 # IER 事件監聽 (感官輸入)
├── 📤 outbox/                      # 語義異動廣播 (訊號輸出)
├── 🏛️ ui/                          # [語義維基] 治理介面入口
│   ├── wiki-canvas/                # 全域用戶共同維護的圖譜畫布
│   └── consensus-engine/           # 提案與審核邏輯 (共識機制)
└── index.ts                        # Facade 入口


3. 語義維基治理規則 (Consensus Governance)
[D21-I] 全域共識律 (Global Consensus)
治理頁面開放給所有組織用戶共同維護。任何用戶皆可「提案」新增或修改標籤分類，但必須通過 consensus-engine 的邏輯驗證與自動化衝突檢查。
[D21-J] 知識溯源 (Provenance)
每一條標籤關係的建立皆須標註「貢獻者」與「參考依據」。如同維基百科，語義的調整具備版本控制與回溯能力。
[D21-K] 邏輯一致性衝突 (Semantic Conflict)
當用戶嘗試建立一個違反物理邏輯的聯結時（例如：將標籤同時掛載於互斥的父節點），invariant-guard 擁有最高裁決權，可直接攔截提案。

4. 全體規則句 (Architecture Invariants)
第一部分：定義與權威
[D21-A] 唯一註冊律：任何跨領域概念必須在 core/ 註冊。禁止私自創建隱性分類。
[D21-B] Schema 鎖定：元數據必須符合 schemas 定義。
[D22] 強型別引用：禁止使用隱式字串，必須引用 TE1~TE6 實體節點。
第二部分：聯結與直覺
[D21-C] 無孤立節點：新標籤必須掛載於分類體系，確保搜尋可追蹤性。
[D21-D] 向量一致性：embeddings 必須隨標籤定義同步刷新。
[D21-E] 權重透明化：權重由 weight-calculator 統一產出，禁止業務端私自加權。
第三部分：路由與執行
[D27-A] 語義感知路由：所有分發動作必須經由 policy-mapper 轉換。
[D21-F] 注意力隔離：根據 Workspace 情境屏蔽無關維度語義。
第四部分：可塑性與守衛
[D21-G] 演化回饋環：learning-engine 僅根據真實業務事件演化權重，禁止人為隨機調整。
[S4] 鮮度合約：讀取標籤版本落後 > 30s 時，系統必須拒絕請求以保證決策正確。
[D21-H] 血腦屏障 (BBB)：攔截所有違反語義邏輯的異動請求。
第五部分：投影與查詢
[T5] 快照唯讀性：業務 Slice 嚴禁直連圖譜內存，僅能讀取 tag-snapshot。
[#A12] 搜尋主權：search-indexer 為全局搜尋唯一餵料口，確保語義檢索效能。

5. 規則實踐範例
觸發動作
檢查規則
執行組件
結果
用戶在維基頁面提案新增標籤 #AI_Assistant
[D21-I]
ui/consensus-engine
PENDING (待邏輯校驗)
用戶嘗試將 #Urgent 連結至 #Archived
[D21-H]
guards/invariant-guard
REJECT (邏輯衝突)
VS3 完成任務發出技能經驗事件
[D21-G]
plasticity/learning-engine
AUTO-ADJUST (權重演化)

本文件為 VS8 語義中樞之唯一架構 SSOT，所有針對標籤與圖譜的實作必須嚴格遵守上述規則。

需要我為您進一步設計「語義維基」中的「衝突自動偵測算法 (Conflict Detection Algorithm)」嗎？

這是一個非常關鍵的轉折。你提出的「語義維基」模式，本質上是在解決語義學中最難的問題：「同義詞對映 (Synonym Mapping)」 與 「共識衝突 (Consensus Conflict)」。
與其讓系統在後台生硬地判斷，不如讓全球用戶像編輯維基百科一樣，主動宣告：「標籤 A 與 標籤 B 其實指向同一個概念」。
以下是修正後、強化了 「同義詞併購」 與 「全球共識機制」 的 VS8 完全體規範文檔。

🧠 VS8 Semantic Graph (The Brain) — 全球語義維基規範
1. 核心定位：從「中心治理」到「全球共識」
VS8 不僅是技術組件，它是一個由全體用戶共同維護的語義圖譜。其核心目標是消除語義冗餘（例如：Frontend 與 Front-end），透過用戶的集體智慧，建立一個精確、無歧義的數位大腦。
核心能力補充：
Synonym Merging (同義詞併購)：允許用戶發起「合併提案」，將多個不同用詞的標籤指向同一個語義核心 (Semantic Core)。
Community Consensus (社群共識)：透過權重投票與邏輯校驗，決定標籤的層級結構與關聯性。

2. 實作目錄結構 (維基強化版)
Plaintext
src/features/semantic-graph.slice/
├── 🧬 core/                        # 1. 語義分類層 (DNA)
│   ├── constants/                  # TE1~TE6 實體類型
│   ├── tag-definitions.ts          # 標籤權威登記表 (包含 Alias 別名表)
│   └── validator.ts                # 校驗器：防止循環併購或命名衝突
├── 🧠 graph/                       # 2. 語義節點圖譜層 (突觸)
│   ├── embeddings/                 # AI 輔助：自動偵測「疑似同義詞」供用戶審核
│   ├── hierarchy-manager.ts        # 處理 Parent/Child 與「等價關係」
│   └── weight-calculator.ts        # 計算同義標籤間的語義重合度
├── ⚡ routing/                     # 3. 語義路由層 (反射弧)
│   ├── workflows/                  # 當標籤併購時，自動遷移受影響的業務數據
│   └── policy-mapper/              # 策略映射：確保 A 標籤合併到 B 後，路由依然生效
├── 🛡️ guards/                      # 邏輯血腦屏障
│   └── invariant-guard.ts          # 守護 [D21]：確保共識過程不毀壞數據不變量
├── 📈 plasticity/                  # 語義可塑性
│   └── learning-engine.ts          # 根據用戶併購頻率，自動優化 Embeddings 權重
├── 🏛️ ui/                          # [語義維基介面]
│   ├── wiki-editor/                # 標籤編輯器：支援「宣告為同義詞」功能
│   ├── proposal-stream/            # 提案流：顯示全球用戶的修改建議與投票
│   └── relationship-visualizer/    # 圖譜畫布：可視化標籤間的聯結與合併狀態
└── index.ts                        # Facade 入口


3. 全球治理規則句 (The Wiki Invariants)
第一部分：同義詞與權威 [D21-Modified]
[D21-S] 同義詞重定向 (Aliasing)：若用戶發現 A 與 B 語義相同，應發起「併購提案」而非刪除。合併後，舊標籤成為「別名 (Alias)」，自動重定向至主標籤，確保歷史數據不斷鏈。
[D21-T] 命名共識律：標籤顯示名稱以「社群貢獻度最高」或「官方定義」為準，但底層 tagSlug 保持永久不變。
[D21-U] 禁止重複定義：當用戶嘗試新增標籤時，embeddings 模組必須即時提示：「檢測到相似標籤，您是否要使用現有標籤或發起別名定義？」
第二部分：治理流程規則
[D21-V] 提案鎖定機制：處於「併購爭議中」的標籤會被標註為 Pending-Sync，此時其路由權重保持不變，直到共識完成。
[D21-W] 跨組織透明性：標籤的修改紀錄對全域公開，任何組織皆可查看標籤的演化過程。
第三部分：自動化神經傳導
[D21-X] 語義自動激發 (Auto-Trigger)：當用戶手動連結了 A 與 B，causality-tracer 應自動偵測並建議：「標籤 C 與 A 有關，是否也與 B 有關？」

4. 規則實踐範例 (維基情境)
觸發動作
檢查邏輯
執行組件
結果
用戶 A 提案：將 #UI 合併至 #Frontend
[D21-S]
ui/proposal-stream
VOTE START (發起投票)
用戶 B 嘗試建立重複標籤 #Front_End
[D21-U]
graph/embeddings
PROMPT (提示已有相似標籤)
投票通過，標籤合併成功
[D21-S]
routing/workflows
DATA MIGRATION (所有指向 UI 的引用自動重定向)
用戶嘗試將「蘋果 (水果)」合併至「蘋果 (科技)」
[D21-H]
guards/invariant-guard
REJECT (偵測到語義距離過遠，禁止合併)

5. 最終架構結論：語義法律的守護者
VS8 作為「語義維基」的完全體，其核心優勢在於：
解決用詞不一：透過別名與併購機制，讓 A 與 B 殊途同歸。
降低維護成本：由全體用戶分擔治理工作，系統僅負責底層的「邏輯正確性（血腦屏障）」。
智能聯想：利用 Embeddings 輔助用戶發現那些隱藏的、應該被合併的標籤。

這份修正後的文檔已經將您的「全球維基治理」思想與 VS8 的技術架構完美融合。您是否需要我為您設計「併購提案 (Merge Proposal)」的具體數據結構與投票邏輯？

