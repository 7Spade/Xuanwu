%%  ╔══════════════════════════════════════════════════════════════════════════╗
%%  ║  LOGIC OVERVIEW v2 — ARCHITECTURE SSOT                                ║
%%  ║  設計原則：                                                              ║
%%  ║    ① 統一由上至下：外部入口 → 閘道 → 領域 → 事件總線 → 投影 → 查詢出口  ║
%%  ║    ② SK 契約集中定義，所有節點僅引用不重複宣告                           ║
%%  ║    ③ Firebase 邊界明確：Anti-Corruption Translator + 標準化 Port 為唯一 runtime 契約 ║
%%  ║    ④ 讀寫分離統一閘道（CQRS Gateway = L0A + L2 + L6）；三閘道合一呈現，以讀/寫為唯一切割線  ║
%%  ║    ⑤ 所有不變量以 [#N] / [SN] / [RN] 行內索引，完整定義於文末            ║
%%  ║    ⑥ Everything as a Tag：所有領域概念以語義標籤建模，由 VS8 全域治理 + VS4 組織擴展治理 ║
%%  ║    ⑦ VS7 僅可經 Port（IMessaging）發送通知，不得直連任何 Adapter/Runtime   ║
%%  ║    ⑧ 架構正確性優先（Architectural Correctness First）：正規架構為最高裁決標準；  ║
%%  ║       奧卡姆剃刀 = 正確抽象非最少程式碼；架構違規零容忍，必須立即結構性修正  ║
%%  ║       三原則：結構穩定與一致性 · 本質與簡約 · 可持續性與演進               ║
%%  ╠══════════════════════════════════════════════════════════════════════════╣
%%  SSOT Mapping:
%%    Architecture rules       → docs/architecture/00-logic-overview.md  ← THIS FILE（原始檔，所有規則正文在此定義）
%%    Semantic relations       → .memory/knowledge-graph.json
%%    VS8 complete-body guide  → docs/architecture/03-Slices/VS8-SemanticBrain/01-d21-body-8layers.md  (companion spec)
%%  ──────────────────────────────────────────────────────────────────────────
%%  Sub-View Index（子視圖索引，從本檔抽出，供可讀性閱覽）:
%%    邏輯流視圖 (Logical Flow)     → docs/architecture/01-logical-flow.md
%%    治理視圖   (Governance View)  → docs/architecture/02-governance-rules.md
%%    基礎設施視圖(Infrastructure)  → docs/architecture/03-infra-mapping.md
%%  注意：若子視圖與本檔衝突，以本檔（00-logic-overview.md）為準。
%%  RULE SENTENCE TEMPLATE（規則句模板）:
%%    MUST     : IF <條件> THEN <必須行為>
%%    SHOULD   : IF <情境> THEN <建議行為>
%%    FORBIDDEN: IF <情境> THEN MUST NOT <禁止行為>
%%  RULE CLASSIFICATION（分類）:
%%    MUST(R/S/A/#) = 穩定不變量；SHOULD(D/P/T/E) = 治理演進；FORBIDDEN = 絕對禁止
%%  ╠══════════════════════════════════════════════════════════════════════════╣
%%  QUICK REFERENCE（快速索引 — 最速取得上下文）
%%  ── Vertical Index（領域編號 · VS0–VS8）──
%%    VS0=Foundation（SharedKernel + SharedInfra）  VS1=Identity   VS2=Account      VS3=Skill
%%    VS4=Organization  VS5=Workspace  VS6=Workforce-Scheduling   VS7=Notification
%%    VS8=SemanticGraphEngine
%%    Path Map: VS0=src/shared-kernel + src/shared-kernel/observability + src/shared-infra/frontend-firebase + src/shared-infra/backend-firebase + src/shared-infra/observability
%%              VS1=src/features/identity.slice   VS2=src/features/account.slice
%%              VS3=src/features/skill-xp.slice   VS4=src/features/organization.slice
%%              VS5=src/features/workspace.slice  VS6=src/features/workforce-scheduling.slice
%%              VS7=src/features/notification-hub.slice  VS8=src/features/semantic-graph.slice
%%    VS0 內部分層（Foundation Plane）:
%%      src/shared-kernel                   = VS0-Kernel（L1 契約層）
%%      src/shared-kernel/observability     = VS0-Kernel（L1 Observability Contracts only：types/interfaces，非 runtime node）
%%      src/shared-infra/*                  = VS0-Infra Plane（L0/L2/L4/L5/L6/L7/L9/L10 執行層；L8 為外部平台執行目標）
%%      L0/L2/L4/L5/L6 基礎設施主路徑：src/shared-infra/{external-triggers|gateway-command|event-router|outbox-relay|dlq-manager|projection-bus|gateway-query}
%%      Legacy 相容路徑（僅過渡，不作為目標架構）：src/features/infra.*
%%      src/shared-infra/projection-bus     = VS0-Infra（L5 Projection Bus）
%%      src/shared-infra/observability      = VS0-Infra（L9 Observability Runtime）
%%    命名規則：VS0=Foundation Index（L1+L0+L2+L4+L5+L6+L7+L8+L9+L10）；VS1~VS8=業務切片編號（L3）
%%    VS0 識別規格（文件/審查一律使用）:
%%      VS0-Kernel = src/shared-kernel/*（pure contracts/constants/functions，禁止 I/O）
%%      VS0-Infra  = src/shared-infra/*（L0/L2/L4/L5/L6/L7/L9/L10 execution plane；L8 為外部 runtime target）
%%      Observability 分層規則：L1 只允許 observability contracts；L9 runtime sink/counter/trace provider 只允許在 src/shared-infra/observability
%%      禁止只寫「VS0」而不標註 -Kernel 或 -Infra（避免語義歧義）
%%      VS0 視圖分拆規則：同一 VS0 會在圖中拆為「L1 VS0-Kernel」與「L0/L2/L4/L5/L6~L9 VS0-Infra」兩塊呈現；
%%      此為 Layer 可讀性分圖，非領域切割（Domain Ownership 仍同屬 VS0/Foundation）
%%  ── Cross-cutting Authorities（跨切片權威）──
%%    global-search.slice  = 語義門戶（唯一跨域搜尋權威 · 對接 VS8 語義索引）
%%    notification-hub.slice = 反應中樞（VS7 增強 · 唯一副作用出口 · 標籤感知路由）
%%    ※ 兩者皆須擁有自己的 _actions.ts / _services.ts，不得寄生於 shared-kernel [D3 D8]
%%  ── Layer（系統層）──
%%    L0=ExternalTriggers   L1=SharedKernel       L2=CommandGateway
%%    L3=DomainSlices       L4=IER                L5=ProjectionBus
%%    L6=QueryGateway       L7=FirebaseBoundary    L8=FirebaseInfra      L9=Observability
%%    L10=AIRuntime&Orchestration（Genkit Flow Gateway / Prompt Policy / Tool ACL / Model Routing）
%%    ※ L7 分層（責任分配）:
%%      - L7-Translator = SDK semantics → VS0 standardized ports（IStd* / IMessaging / IDataConnect）
%%      - L7-FE Functional Adapters = src/shared-infra/frontend-firebase/*（使用者會話態 / Security Rules 可封閉）
%%      - L7-BE Functional Adapters = src/shared-infra/backend-firebase/functions/*（Admin / 跨租戶 / 觸發器 / 排程 / Webhook 驗簽）
%%      - L7-BE-DC Adapter          = src/shared-infra/backend-firebase/dataconnect（受治理 GraphQL schema/connector 契約）
%%    ※ L8 = 外部 Firebase 平台執行層（SDK Runtime）；在本 repo 僅以邊界模型呈現，非本地實作資料夾
%%    ※ L10 = AI 執行與治理層（可由 src/app-runtime/ai + shared-infra/ai-* 共同實作；受 L1 契約與 L9 觀測約束）
%%    ※ L3 Domain Slices = VS1(Identity) · VS2(Account) · VS3(Skill) ·
%%                          VS4(Organization) · VS5(Workspace) · VS6(Workforce-Scheduling) ·
%%                          VS7(Notification) · VS8(SemanticGraph)
%%    ※ VS0(Foundation) 不屬於 L3 Domain Slices；其中 VS0-Kernel=L1，VS0-Infra=L0/L2/L4/L5/L6/L7/L8/L9/L10
%%    ※ 邊界澄清：L2 Command Gateway 明確屬於 VS0-Infra（不得誤歸 L3）；L8 為外部 runtime，不代表本地 folder ownership
%%  ── Canonical Chains（唯一排序判準）──
%%    寫鏈（Command）: External/L0 → L0A COMMAND_API_GATEWAY → L2 Command Gateway → L3 Domain Slices → L4 IER → L5 Projection
%%    讀鏈（Query）   : UI/L0 → L0A QUERY_API_GATEWAY → L6 Query Gateway → L5 Projection(Read Model)
%%    Infra鏈（SDK）  : L3/L5/L6 → L1 Ports/Contracts → L7 Firebase Boundary → L8 Firebase Runtime
%%    規則：三條鏈並列，不得把 Query/Command/FirebaseBoundary 壓成單一線性排序
%%  ── 標準目錄結構（Standard Directory Structure · 單向依賴鏈對齊）──
%%    src/
%%      shared-kernel/                          # VS0-Kernel / L1: contracts/constants/pure zone
%%      shared-kernel/observability/            # VS0-Kernel / L1: observability contracts only (no side effects)
%%      shared-infra/frontend-firebase/         # VS0-Infra / L7: Frontend Firebase ACL adapters (Web SDK boundary)
%%        auth/
%%        firestore/
%%        realtime-database/
%%        messaging/
%%        storage/
%%        analytics/
%%      shared-infra/backend-firebase/          # VS0-Infra / L7: Backend Firebase execution boundary (server-side)
%%        functions/                            # Cloud Functions (HTTP/callable/triggers/scheduler)
%%        dataconnect/                          # Data Connect schema/connector/operations
%%        firestore/                            # Firestore rules/indexes deploy artifacts
%%        storage/                              # Storage rules deploy artifacts
%%  ── L7 Firebase Boundary Folder Ownership（避免前後端職責混淆）──
%%    src/shared-infra/frontend-firebase/         = FE ACL（user-session / rules-guarded）
%%    src/shared-infra/backend-firebase/functions = BE orchestration（admin/cross-tenant/triggers/scheduler/webhook）
%%    src/shared-infra/backend-firebase/dataconnect = BE query contract（governed GraphQL schema/connector）
%%  ── VS0-Infra Core Folders（非 L7 專屬；依 Layer 分工）──
%%      shared-infra/external-triggers/         # VS0-Infra / L0: external triggers
%%      shared-infra/gateway-command/           # VS0-Infra / L2: CBG_ENTRY/CBG_AUTH/CBG_ROUTE orchestration
%%      shared-infra/event-router/              # VS0-Infra / L4: IER core + lanes
%%      shared-infra/outbox-relay/              # VS0-Infra / L4: outbox relay worker
%%      shared-infra/dlq-manager/               # VS0-Infra / L4: DLQ tiering and replay policy center
%%      shared-infra/projection-bus/            # VS0-Infra / L5: projection funnel + read model materialization
%%      shared-infra/gateway-query/             # VS0-Infra / L6: query gateway/read registry
%%      shared-infra/observability/             # VS0-Infra / L9: metrics/errors/trace observability
%%      features/
%%        infra.external-triggers/              # legacy alias only（遷移期相容）
%%        infra.gateway-command/                # legacy alias only（遷移期相容）
%%        infra.event-router/                   # legacy alias only（遷移期相容）
%%        infra.outbox-relay/                   # legacy alias only（遷移期相容）
%%        infra.dlq-manager/                    # legacy alias only（遷移期相容）
%%        infra.gateway-query/                  # legacy alias only（遷移期相容）
%%        projection-bus/                       # legacy alias only（遷移期相容；目標 src/shared-infra/projection-bus）
%%        identity.slice/                       # L3 VS1
%%        account.slice/                        # L3 VS2
%%        skill-xp.slice/                       # L3 VS3
%%        organization.slice/                   # L3 VS4
%%        workspace.slice/                      # L3 VS5
%%        workforce-scheduling.slice/           # L3 VS6
%%        notification-hub.slice/               # L3 VS7 (authority exit)
%%        semantic-graph.slice/                 # L3 VS8 (semantic authority)
%%        global-search.slice/                  # L3 cross-cut authority (search exit)
%%    app/                                      # UI entry; read-only via L6
%%  ── Logic-First Placement Matrix（新增檔案放置判斷：依六維規則取捨，不以寫法簡短取代邏輯）──
%%    最高指標：邏輯正確（層級與依賴規則 · 邊界與上下文 · 通訊與協調機制 · 狀態與副作用 · 權力歸屬 · 變動速率）
%%    A. 層級與依賴規則（Layering & Dependency）
%%      - 純契約/常數/純函式（無 I/O）→ src/shared-kernel/*（VS0-Kernel / L1）
%%      - Observability 契約（TraceContext/DomainErrorEntry/interfaces）→ src/shared-kernel/observability/*（L1, contract-only）
%%      - Firebase SDK 邊界（前端）→ src/shared-infra/frontend-firebase/*（VS0-Infra / L7）
%%      - Firebase 高權限/伺服流程（後端）→ src/shared-infra/backend-firebase/{functions|dataconnect}/*（VS0-Infra / L7）
%%      - 讀取編排（Read registry）→ src/shared-infra/gateway-query/*（L6, ownership=VS0-Infra）
%%      - 觀測執行能力（trace provider / metrics recorder / error logger）→ src/shared-infra/observability/*（L9, ownership=VS0-Infra）
%%      - 領域規則（aggregate/policy/invariant）→ src/features/{slice}.slice/*（L3）
%%    B. 邊界與上下文（Boundary & Context）
%%      - 跨業務共用且非業務語義 = VS0（Kernel 或 Infra）
%%      - 業務語義與狀態機 = 對應 Feature Slice（L3）
%%      - Cross-cutting Authority（搜尋/通知）= L3 權威切片，不得寄生 shared-kernel
%%    C. 通訊與協調機制（Communication & Coordination）
%%      - 寫入協調 = L2（shared-infra/gateway-command）
%%      - 事件路由/relay/DLQ = L4（shared-infra/event-router / shared-infra/outbox-relay / shared-infra/dlq-manager）
%%      - 投影物化 = L5（src/shared-infra/projection-bus，system service）
%%      - 讀取出口 = L6（shared-infra/gateway-query）
%%    D. 狀態與副作用（State & Side Effects）
%%      - shared-kernel 禁止 async/Firestore/side effects [D8]
%%      - shared-kernel/observability 禁止 runtime sink（console/network/db）、禁止 mutable counter、禁止 clock/random 實作
%%      - 任何 sink 寫入、runtime counter、clock/random、console 皆視為副作用，必須在 VS0-Infra 或對應執行層
%%    E. 權力歸屬（Authority Ownership）
%%      - Query 權威屬 L6（ownership=VS0-Infra）
%%      - Firebase SDK 權威屬 L7（FIREBASE_ACL）
%%      - Observability Contract Authority 屬 L1（src/shared-kernel/observability）
%%      - Observability Runtime Authority 屬 L9（src/shared-infra/observability）
%%      - Search/Notification 權威屬各自 cross-cutting slice [D26]
%%    F. 變動速率（Rate of Change）
%%      - 慢變契約（types/contracts）放 L1
%%      - 中變整合（adapter/gateway/observability）放 VS0-Infra
%%      - 快變業務流程放 L3
%%    判斷速記：先判斷邏輯層與權力歸屬，再決定路徑；不得反向以既有路徑合理化設計。
%%  ── 依賴方向約束（對應目錄，與 Canonical Chains 一致）──
%%    寫鏈：shared-infra/external-triggers → shared-infra/api-gateway(command) → shared-infra/gateway-command → *.slice → shared-infra/event-router → shared-infra/projection-bus
%%    讀鏈：app/UI → shared-infra/api-gateway(query) → shared-infra/gateway-query → shared-infra/projection-bus
%%    Infra鏈（前端 SDK）：*.slice/projection/query → shared-kernel(SK_PORTS) → shared-infra/frontend-firebase(FIREBASE_ACL, Web SDK)
%%    Infra鏈（後端高權限）：L0 or L2 API entry → shared-infra/backend-firebase/functions|dataconnect → Firebase Platform (L8)

%%  ── Firebase 前後端分層與成本決策（Front/Back Decision Matrix）──
%%    Frontend Firebase（src/shared-infra/frontend-firebase）適用：
%%      - 使用者會話內、受 Security Rules 保護的讀寫（個人資料/一般列表/互動狀態）
%%      - RTDB presence/typing/live-feed 低延遲互動
%%      - FCM token 綁定、Analytics 遙測上報
%%    Backend Firebase（src/shared-infra/backend-firebase/functions）必用：
%%      - 需要 Admin 權限、跨租戶資料存取、密鑰/機密使用
%%      - 跨集合/跨聚合一致性寫入、補償交易、批次寫入與高扇出工作
%%      - Firestore/Storage trigger、排程任務、Webhook 驗簽、對外 HTTP/Callable API
%%    Data Connect（src/shared-infra/backend-firebase/dataconnect）必用：
%%      - 需要可治理的 GraphQL schema/connector，並以後端策略統一路由資料存取
%%      - 需要跨前端統一查詢能力與強型別 API 契約時
%%    成本與效能取捨（邏輯正確優先，成本次之）：
%%      - IF 操作可由 Security Rules 安全完成且為高頻小請求 THEN 優先 Frontend Firebase（降低 Functions 呼叫成本與尾延遲）
%%      - IF 操作涉及高權限、複雜協調或高扇出 THEN 優先 Backend Firebase（降低一致性風險與重試放大成本）
%%      - IF 讀取模式為長連線即時更新 THEN 優先 RTDB/Firestore listener；若僅偶發查詢則避免常駐 listener 以控制讀取成本
%%      - IF 可批次/去抖/聚合後再寫入 THEN 必須在 Backend 端集中處理，以降低寫入次數與出站成本
%%    Security Closure（身份與安全閉環）:
%%      - App Check 必須在 external-trigger 入口驗證，未通過請求直接拒絕；不得繞過至 Domain Slice
%%      - Security Rules 必須以 org/workspace/account 三層租戶鍵約束資料存取；高風險操作必須再經 backend-firebase/functions 驗證
%%      - Rules 變更需搭配回歸測試與版本註記，避免 ACL 漂移
%%  ── AI Platform Control Plane（Genkit + SaaS Workflow）──
%%    AI 寫鏈：UI/ServerAction → L10 AI Flow Gateway → Prompt Policy Guard → Tool ACL → Domain Command（L2）
%%    AI 讀鏈：UI/Parallel Routes → L6 Query Gateway → Projection（L5）→ L10 Response Composer（Streaming）
%%    MUST:
%%      - IF 進入 AI flow THEN 必須先通過 Prompt Policy（敏感詞/資料分級/租戶邊界）
%%      - IF AI 需要資料存取 THEN Tool 必須走 L1 Port + L7 Adapter；禁止 AI flow 直連 firebase/*
%%      - IF AI 觸發寫入 THEN 必須經 L2 Command Gateway，禁止繞過 Aggregate
%%      - IF AI 回應包含工具輸出 THEN 必須帶 traceId / toolCallId / modelId 供 L9 觀測
%%    SHOULD:
%%      - Parallel Routes（chat/tool-panel/modal/console）各 slot 維持獨立 Suspense 邊界與資料通道，避免單點阻塞
%%      - Streaming UI 採 partial-first 策略：先回覆骨架與低風險內容，再增量補齊工具結果
%%  ── RULESET-MUST（不可違反）: R · S · A · # ──
%%    R1=relay-lag-metrics   R5=DLQ-failure-rule   R6=workflow-state-rule
%%    R7=aggVersion-relay    R8=traceId-readonly    R9=context-propagation-middleware
%%    S1=OUTBOX-contract     S2=VersionGuard       S3=ReadConsistency
%%    S4=Staleness-SLA       S5=Resilience         S6=TokenRefresh
%%    A3=workflow-blockedBy  A5=scheduling-saga    A8=1cmd-1agg
%%    A9=scope-guard         A10=notification-stateless
%%    A12=global-search-authority   A13=notification-hub-authority
%%    A14=cost-semantic-dual-key
%%    A15=finance-lifecycle-gate（進入閘門：task ACCEPTED via Validator 才可進入 Finance）
%%    A16=（已由 #A21 升級）finance-request-independent-lifecycle（VS9 Finance_Request）
%%    A17=skill-xp-award-contract
%%    A18=org-semantic-extension
%%    A19=task-lifecycle-convergence（VS5 狀態封閉性 + Validator 門禁 + TaskAcceptedConfirmed 原子化）
%%    A20=finance-staging-pool-rules（VS9 反應式攔截 + LOCKED_BY_FINANCE 打包鎖定）
%%    A21=finance-request-independent-lifecycle（VS9 Finance_Request：DRAFT→AUDITING→DISBURSING→PAID）
%%    A22=finance-task-feedback-projection（FinanceRequestStatusChanged → L5 task-finance-label-view）
%%  ── VS8 正規規則體系（G/C/E/O/B Series · RULESET-MUST）──
%%  ── 設計動機：G/C/E/O/B 五系列規則是 VS8 P1-P10 架構缺陷的完整正式規範（Formal Specification）；
%%  ──   遵循架構正確性優先原則，奧卡姆剃刀 = 正確抽象非最少程式碼；任何違規必須結構性修正，禁止補丁覆蓋
%%    G1=CTA-ssot（全域語義 SSOT；未 Active slug 不可引用）
%%    G2=tag-lifecycle-unidirectional（Draft→Active→Stale→Deprecated；禁止跳躍/逆向）
%%    G3=invariant-guard-supreme（最高裁決權；COMPLIANCE TaskNode 必須有 cert_required Skill）
%%    G4=cta-write-path-exclusive（寫入路徑唯一：CMD_GWAY→CTA；禁止繞過）
%%    G5=governance-portal-review-required（治理變更強制 REVIEW_REQUIRED；禁止 SAFE_AUTO）
%%    G6=staleness-monitor-sla-reference（引用 SK_STALENESS_CONTRACT；禁止硬寫時間數值）
%%    G7=semantic-protocol-cross-slice（跨切片訊號必帶 semanticTagSlugs；缺失即攔截）
%%    C1=subject-graph-boundary（VS8 只維護主體圖；因果圖由 IER+L5 承載）
%%    C2=five-legal-edge-types（REQUIRES/HAS_SKILL/IS_A/DEPENDS_ON/TRIGGERS；禁止自定義邊）
%%    C3=weight-calculator-exclusive（所有邊 weight 由 weight-calculator 計算；禁止硬寫）
%%    C4=taxonomy-governance（IS_A 邊分類學修改必須走 governance-portal [G4]）
%%    C5=no-orphan-node（新標籤必須掛父節點；孤立節點不得 Active）
%%    C6=essence-type-classifier（TaskNode.essence_type 只由 cost-item-classifier 賦值）
%%    C7=materialize-as-inference（shouldMaterializeAsTask 是推理結果；override 是 IS_A 邊）
%%    C8=granularity-learning-only（SkillNode.granularity 只由 learning-engine 演化）
%%    C9=person-node-readonly-projection（PersonNode 唯讀；唯一更新路徑 ISemanticFeedbackPort）
%%    C10=vector-sync-freshness（向量必須與 CTA 同步；過期向量不得用於推理）
%%    C11=vector-graph-dual-confirmation（向量縮範+Graph 確認缺一不可；禁止純向量作最終分類）
%%    E1=edge-store-exclusive（所有邊操作必須經 semantic-edge-store）
%%    E2=weight-calculator-sole-interface（computeSimilarity 唯一語義相似度介面）
%%    E3=adjacency-list-topology（拓撲閉包唯一合法路徑；3 個介面；禁止直遍歷）
%%    E4=cost-item-classifier-sole-entry（ISemanticClassificationPort；禁止字串比對分類）
%%    E5=three-step-inference（向量縮範→Graph 確認→override 三步不可跳躍；輸出含 inferenceTrace）
%%    E6=inference-trace-mandatory（每次推理必須輸出 inferenceTrace[]；無 trace 禁止進入下游）
%%    E7=skill-matcher-triple-gate（tier+granularity 覆蓋度+cert 三條件全滿；禁止部分通過）
%%    E8=causality-tracer-graph-only（BFS 來源唯一：TRIGGERS+DEPENDS_ON 邊；禁止自定義因果規則）
%%    E9=learning-engine-fact-events-only（只接受 VS3/VS5 事實事件；禁止繞過 ISemanticFeedbackPort）
%%    E10=semantic-decay-sla-bound（衰退週期綁定 SK_STALENESS_CONTRACT；禁止覆蓋活躍邊）
%%    E11=routing-engine-hint-only（只輸出 SemanticRouteHint；禁止持有副作用或直呼 VS6/VS7）
%%    E12=context-attention-unified（filterByContext 由 VS8 統一；禁止其他切片自行過濾語義情境）
%%    O1=three-port-interfaces（ISemanticClassificationPort/ISkillMatchPort/ISemanticFeedbackPort 唯一出口）
%%    O2=tag-snapshot-read-path（業務端讀取唯一路徑是 projection.tag-snapshot）
%%    O3=task-semantic-view-completeness（required_skills+eligible_persons 必須同時存在）
%%    O4=causal-audit-log-with-trace（每條記錄必含 inferenceTrace[]+traceId；禁止重新生成）
%%    O5=tag-outbox-single-node（VS8 唯一 outbox，DLQ=SAFE_AUTO；禁止重複定義）
%%    O6=tag-lifecycle-event-ier-path（TagLifecycleEvent：tag-outbox→RELAY→IER；禁止繞過）
%%    B1=vs8-semantic-only（VS8 只做語義推理；禁止直接觸發跨切片副作用）
%%    B2=governance-core-engine-output-unidirectional（內部依賴單向；禁止逆向）
%%    B3=ai-flow-port-only（AI Flow 只能透過 ISemanticClassificationPort/ISkillMatchPort 存取 VS8）
%%    B4=taxonomy-vector-separation（分類學是本體論；向量是認識論工具；禁止互相取代）
%%    B5=subject-graph-not-causal-executor（VS8 推論因果路徑；因果執行歸 IER+L5）
%%  ── RULESET-SHOULD（可演化治理）: D · P · T · E ──
%%    D7=cross-slice-index-only   D24=no-firebase-import D26=cross-cutting-authority
%%    D27=cost-semantic-routing   D27-A=semantic-aware-routing-policy
%%    D27-Order=single-direction-chain   D27-Gate=task-materialization-gate   D22=strong-typed-tag-ref
%%    D28=vis-data-caching-pattern
%%    D29=transactional-outbox-pattern   D30=hop-limit-circular-dependency
%%    D31=permission-projection
%%    P6=parallel-routes-data-contract  P7=realtime-subscription-lifecycle
%%    P8=dynamic-backpressure-worker-pool
%%    E7=app-check-enforcement-closure  E8=genkit-tool-governance
%%    D21=VS8-semantic-engine-governance（四層語義引擎 D21-1~D21-10 + D21-A~D21-X；完整正規規則見 G/C/E/O/B series）
%%    D21-1=semantic-uniqueness(→D21-A)   D21-2=strong-typed-tags(→D22)  D21-3=node-connectivity(→D21-C)
%%    D21-4=aggregate-constraint          D21-5=semantic-aware-routing(→D27-A)
%%    D21-6=causal-auto-trigger           D21-7=read-write-separation    D21-8=freshness-defense(→S4)
%%    D21-9=synaptic-weight-invariant     D21-10=topology-observability
%%    D21-A=唯一註冊律   D21-B=Schema鎖定   D21-C=無孤立節點    D21-D=向量一致性  D21-E=權重透明化
%%    D21-F=注意力隔離   D21-G=演化回饋環   D21-H=血腦屏障BBB   D21-I=全域共識律  D21-J=知識溯源
%%    D21-K=語義衝突裁決 D21-S=同義詞重定向 D21-T=命名共識律    D21-U=禁止重複定義
%%    D21-V=提案鎖定機制 D21-W=跨組織透明性 D21-X=語義自動激發
%%    D22=強型別引用   D27-A=語義感知路由
%%    P1=IER-lane-priority        P4=eligibility-query   P5=projection-funnel
%%    T1=tag-lifecycle-sub        T3=eligible-tag-logic  T5=tag-snapshot-readonly
%%    E2=OrgContextProvisioned    E3=ScheduleAssigned    E5=ws-event-flow   E6=claims-refresh
%%  ── RULESET-MUST · VS6 Workforce Scheduling SSOT（產品推導約束）──
%%    [D27-Order] 單向鏈：WorkspaceItem → WorkspaceTask → Schedule（禁止跳級）
%%    健康設計鏈：WorkspaceItem → WorkspaceTask（無時間） → WorkspaceSchedule（有時間） → OrganizationSchedule（人力指派）
%%    [D27-Gate] 任務物化唯一入口：shouldMaterializeAsTask()；僅 EXECUTABLE 可物化
%%    [SK_SKILL_REQ] 指派校驗必須引用跨片人力需求契約
%%    [VS8-Tag] 能力與視覺判定僅可讀 tag-snapshot（禁止讀 Account 原始技能資料）
%%    [L5-Bus] Calendar/Timeline 屬 Read Side，分別物化日期維度與資源維度
%%    [S2] 投影寫入必經 applyVersionGuard()，防止亂序覆寫
%%    [L6-Gateway] UI 禁止直讀 VS6/Firebase，僅可經 Query Gateway 讀取
%%    [Timeline] overlap/resource-grouping 邏輯下沉 L5，前端僅渲染
%%  ── RULESET-MUST · VS3 Skill XP SSOT（產品推導約束）──
%%    [A17] XP 授予來源必須是 VS5 任務事實（TaskCompleted）與品質事實（QualityAssessed）
%%    [A17] 計算公式：awardedXp = baseXp × qualityMultiplier × policyMultiplier（含 min/max clamp）
%%    [A17] VS8 僅提供 semanticTagSlug / policy lookup；XP ledger 寫入權限只在 VS3
%%  ── RULESET-MUST · Layering Rules（層級通訊規則）──
%%    鏈路判準：以 Canonical Chains 為唯一基準（寫鏈 / 讀鏈 / Infra鏈）
%%    External 入口分流：寫入走 L2 CMD_GWAY；讀取走 L6 QGWAY
%%    寫鏈禁止回跳；讀鏈禁止反向驅動命令鏈；Infra鏈禁止跳過 L1 Port 與 L7 邊界
%%    L3 Slice ↔ L3 Slice = 禁止直接 mutate；僅可透過 L4 IER 事件協作 [#2 D9]
%%    L3 → L5 Projection 寫入 = 禁止直寫；必須經 event-funnel [#9 S2]
%%    L3 讀取語義 = 僅可經 VS8 projection.tag-snapshot [D21-7 T5]
%%    任意層直連 firebase/* = 禁止；僅 L7 FIREBASE_ACL 可呼叫 SDK [D24 D25]
%%  ── RULESET-MUST · Authority Exits（權威出口白名單）──
%%    Search Exit     = global-search.slice（唯一跨域搜尋權威）[D26 #A12]
%%    Side-effect Exit= notification-hub.slice（唯一通知副作用出口）[D26 #A13]
%%    Semantic Exit   = VS8 Semantic Cognition Engine（語義註冊/推理/投影）[D21]
%%    Finance Routing = VS8 decision/_cost-classifier + VS5 Layer-3 gate [D27 #A14]
%%  ── RULESET-SHOULD · Governance Focus（治理與演化焦點）──
%%    Stable Core     = R/S/A/#（Hard Invariants，版本演進不可破壞）
%%    Evolution Track = D/P/T/E（可演化規則，以索引引用，不重複定義）
%%    Team Gate       = L/R/A 同時成立（Layer/Rule/Atomicity）
%%  ── RULESET-SHOULD · Downstream Priorities（下沉優先清單）──
%%    1) Shared Kernel Contracts：S4/R8/SK_CMD_RESULT 集中定義，禁止各 Slice 重複宣告
%%    2) Semantic Governance：D22 強型別標籤 + VS8 cost-classifier；業務端禁止自建分類邏輯
%%    3) Consistency Infrastructure：S2 下沉 Projection Bus/FIREBASE_ACL；S3 由 L6 Query Gateway 統一路由
%%    4) Firebase ACL：D24 嚴格防腐；Feature Slice 僅可依賴 SK_PORTS，不得直連 firebase/*
%%    5) Authority Exits：D26 收口 Global Search / Notification Hub，業務端只產生事實事件
%%  ── OPTIMIZATION ADOPTION（落地採納清單 · 單向依賴鏈版）──
%%    MUST: IF 需要呼叫 Firebase SDK THEN 必須經 L7 FIREBASE_ACL；且 aggregateVersion 守衛必須在 L5/L7 生效
%%    MUST: IF 事件鏈需要 traceId THEN 僅能由 CBG_ENTRY 注入；L9 僅可觀測不可生成
%%    MUST: IF UI 讀取業務資料 THEN 必須經 L6 Query Gateway；Timeline overlap/grouping 必須下沉 L5
%%    MUST: IF 涉及 SLA/Outbox/Resilience/EventEnvelope THEN 必須引用 L1 契約，不得切片內重定義
%%    MUST: IF 屬跨片共用契約（如 SK_SKILL_REQ）THEN 必須集中於 L1，切片僅可引用
%%    MUST: IF 涉及全域語義註冊 THEN 必須在 VS8 Core Domain（CTA/tag-definitions）定義；IF 涉及組織任務類型/技能類型語義 THEN 必須在 VS4 org-semantic-registry（org-task-type-registry + org-skill-type-registry）定義
%%    SHOULD: IF 設計 L2 Command Gateway 下沉 THEN 僅下沉契約/型別到 L1；協調流程保留 L2
%%  ── L9 OBSERVABILITY BLUEPRINT（重點雛形 · 可直接落地）──
%%    Ownership:
%%      - Contract Authority = L1 src/shared-kernel/observability（types/interfaces only）
%%      - Runtime Authority  = L9 src/shared-infra/observability（metrics/errors/trace sinks）
%%    MUST（最小可用閉環）:
%%      - Trace: CBG_ENTRY 注入 traceId 一次；其餘節點唯讀 [R8]
%%      - Metrics: 至少覆蓋 command_count, command_latency_ms, query_count, query_latency_ms,
%%                 relay_lag_ms [R1], projection_apply_latency_ms, dlq_count_by_tier [R5]
%%      - Errors: 統一寫入 DomainErrorEntry；至少分類 validation / auth / conflict / infra / security
%%      - Correlation: commandId/eventId/correlationId 必須可反查到對應 error 與 metrics 時序
%%    SHOULD（告警分級）:
%%      - P1: SECURITY_BLOCK DLQ、trace 斷鏈、AppCheck 失效率異常（立即告警）
%%      - P2: relay_lag 超過 SLA、projection 延遲超標、query p95 異常（值班告警）
%%      - P3: background lane 積壓、單切片錯誤率升高（工作時段處理）
%%    Gate（合併前最低驗收）:
%%      - 每個新增 L2/L4/L5/L6 路徑都必須帶 traceId、至少 1 個 counter、1 個 latency、1 個 error mapping
%%      - 無法提供觀測的路徑視為未完成（不得宣告 Done）
%%  ╠══════════════════════════════════════════════════════════════════════════╣
%%  ARCHITECTURE CONTROL PLANE（四大治理視圖 · 規則句版）
%%  ── CP1 MUST：Hard Invariants（系統穩定基石）──
%%    任何重構不得破壞：traceId 唯讀（R8）、版本守衛（S2）、SLA 常數單一真相（S4）、
%%    跨切片公開 API 邊界（D7）、副作用與搜尋權威出口（A12/A13）。
%%  ── CP2 MUST：Cross-cutting Authorities（職責邊界與權威出口）──
%%    全域搜尋只經 Global Search；通知副作用只經 Notification Hub；
%%    任務語義與成本決策由 VS8 提供全域基線；組織自訂任務類型/技能類型語義必須經 VS4 org-semantic-registry 治理並投影到 tag-snapshot。
%%  ── CP3 MUST：Layering Rules（層級通訊）──
%%    命令由 L2 收口、事件由 L4 分發、投影由 L5 物化、讀取由 L6 暴露；
%%    Feature Slice 不得跨層旁路（含 Firebase SDK 旁路與 Projection 直寫）。
%%  ── CP4 SHOULD：Governance Rules（治理與演化）──
%%    新規則先索引、再實作；優先引用現有契約；全域語義進 VS8 註冊，組織任務類型/技能類型語義進 VS4 org-semantic-registry 註冊；
%%    D27 屬 Extension Gate，僅影響 document-parser / finance-routing 變更。
%%  ╠══════════════════════════════════════════════════════════════════════════╣
%%  ── FINAL REVIEW BASELINE（最終態審查基準 · Team Gate）
%%  ── 最高裁決原則：架構正確性優先（Architectural Correctness First）；奧卡姆剃刀 = 正確抽象非最少程式碼；架構違規零容忍
%%  ── Scope（本輪必審）──
%%    1) VS0~VS8：每個編號域必須有明確層位與單一職責（VS0=L1+L0+L2+L4+L5+L6+L7+L8+L9+L10；VS1~VS8=L3）
%%    1a) VS0 檢核：每個 VS0 路徑必須標明 VS0-Kernel 或 VS0-Infra（不得混稱）
%%    2) D1~D31：列為 Mandatory Gate（D27 為 Extension Gate，命中場景必審；D29/D30/D31 為新增 Gate）
%%    2a) E7/E8：屬 AI/Firebase Security 閉環 Gate（命中 AI flow 或受保護入口時必審）
%%    2b) G1~G7/C1~C11/E1~E12/O1~O6/B1~B5：VS8 正規規則 Gate（命中語義圖任何模組時必審；違規必須結構性修正）
%%    3) TE1~TE6：語義引用必須強型別，禁止裸字串 tagSlug
%%    4) S1~S6：契約與 SLA 僅能引用 SK_* 常數，禁止硬寫
%%    5) L/R/A：Layer 合規 / Rule 合規 / Atomicity 合規 必須同時成立
%%    6) Boundary Serialization Gate：Client -> Server action 僅允許 Command DTO（plain object）
%%  ── Rule Canonicality（單一定義治理）──
%%    Canonical Rule Body：UNIFIED DEVELOPMENT RULES（D1~D27 + E7/E8）
%%    Secondary Sections（KEY INVARIANTS / FORBIDDEN / Quick Reference）只允許「索引引用 + 審查語句」，不得擴寫第二份規則正文
%%    IF Secondary 與 Canonical 衝突 THEN 以 Canonical 為準，Secondary 必須在同一 PR 修正
%%    IF 新增規則 THEN 必須先在 Canonical 定義，再回填索引（避免雙重真相）
%%  ── D27 定位（擴展）──
%%    D27（成本語義路由）為 Extension Gate；僅在 document-parser / finance-routing 變更時強制審查
%%  ── No-Smell 定義（可作為 Code Review Checklist）──
%%    - 無重複定義：同一規則只保留一個主定義，其他位置僅做索引引用
%%    - 無邊界污染：Feature Slice 不跨邊界 mutate、不直連 firebase/* [D24]
%%    - 無語義漂移：tag 語義必須來自「VS8 CTA 全域標籤」或「VS4 組織標籤治理」合法來源 [D21-1 D22]
%%    - 無一致性破口：Projection 全量遵守 S2；SLA 全量遵守 S4
%%    - 無副作用旁路：通知與搜尋必須經 D26 權威出口
%%  ╠══════════════════════════════════════════════════════════════════════════╣
%%  KEY INVARIANTS（RULESET-MUST / 絕對遵守）:
%%    [R8]  traceId 在 CBG_ENTRY 注入一次，全鏈唯讀不可覆蓋
%%    [S2]  所有 Projection 寫入前必須呼叫 applyVersionGuard()
%%    [S4]  SLA 數值只能引用 SK_STALENESS_CONTRACT，禁止硬寫
%%    [D7]  跨切片引用只能透過 {slice}/index.ts 公開 API
%%    [D21] VS8 四層語義引擎：Governance → Core Domain → Compute Engine → Output
%%           （對應模組：registry/protocol/guards/portal → CTA/hierarchy/vector/tags → graph/reasoning/routing/learning → projections/io/decision）
%%    [D21-A] 雙層註冊律：全域語義在 VS8 core/tag-definitions.ts；組織任務類型/技能類型語義在 VS4 org-semantic-registry（org-task-type-registry + org-skill-type-registry）註冊
%%    [D21-B] Schema 鎖定：標籤元數據必須符合 core/schemas，禁止附加未校驗的非結構化屬性
%%    [D21-C] 無孤立節點：每個新標籤必須透過 hierarchy-manager.ts 掛載至少一個父級節點
%%    [D21-D] 向量一致性：embeddings/vector-store.ts 向量必須隨標籤定義同步刷新
%%    [D21-E] 權重透明化：語義相似度與路徑權重必須由 weight-calculator.ts 統一產出，禁止業務端自行加權
%%    [D21-F] 注意力隔離：context-attention.ts 須根據 Workspace 情境過濾無關標籤
%%    [D21-G] 演化回饋環：learning-engine.ts 僅能由 VS3/VS2 真實事實事件驅動，禁止手動隨機修改
%%    [D21-H] 血腦屏障(BBB)：invariant-guard.ts 對語義衝突擁有最高裁決權，可直接攔截提案
%%    [D21-I] 全域共識律：標籤治理開放全部組織用戶提案，必須通過 consensus-engine 邏輯校驗
%%    [D21-J] 知識溯源：每條標籤關係建立須標註貢獻者與參考依據，具備版本回溯能力
%%    [D21-K] 語義衝突裁決：invariant-guard 偵測到違反物理邏輯的聯結時直接拒絕提案
%%    [D21-S] 同義詞重定向：標籤合併後舊標籤成為 Alias，自動重定向至主標籤，歷史數據不斷鏈
%%    [D21-T] 命名共識律：顯示名稱由社群貢獻度決定，tagSlug 永久不變
%%    [D21-U] 禁止重複定義：新增標籤時 embeddings 必須即時提示相似標籤
%%    [D21-V] 提案鎖定：處於「併購爭議中」的標籤標註 Pending-Sync，路由權重凍結直到共識完成
%%    [D21-W] 跨組織透明性：標籤修改紀錄對全域公開，任何組織可查看演化歷程
%%    [D21-X] 語義自動激發：用戶連結 A+B 時 causality-tracer 自動建議相關標籤 C
%%    [D21-6] TagLifecycleEvent → VS8 Causality Tracer 自動推導受影響節點並發布更新事件
%%    [D21-7] 語義讀取必須經由 projection.tag-snapshot；寫入必須經 CMD_GWAY 進入 VS8 CTA（全域）或 VS4 org-semantic-registry（組織）
%%    [D21-8] TAG_STALE_GUARD ≤ 30s，所有語義查詢必須引用 SK_STALENESS_CONTRACT
%%    [D21-9] 突觸權重不變量：SemanticEdge.weight ∈ [0.0, 1.0]；cost = 1/weight（強連結=近鄰）
%%    [D21-10] 拓撲可觀測性：findIsolatedNodes 必須定期回報孤立節點（D21-3 違規偵測）
%%    [T5] 業務 Slice 僅能訂閱 projections/tag-snapshot.slice.ts，嚴禁直接存取 graph/adjacency-list.ts；
%%         DocumentParser UI 視覺屬性（色彩/icon/分類顯示）必須透過 semantic-graph.slice 投影取得
%%    [D22] 程式碼禁止出現裸字串 tag_name；全域標籤需引用 TE1~TE6，組織自訂標籤需使用 OrgTagRef(orgId, tagSlug)
%%    [D27-A] 語義感知路由：所有分發邏輯必須先調用 policy-mapper/ 轉換語義標籤，禁止 ID 硬編碼路由
%%    [D24] Feature slice 禁止直接 import firebase/*，必須走 SK_PORTS
%%    [D26] global-search = 唯一搜尋權威；notification-hub = 唯一副作用出口
%%    [#A12] Global Search = 唯一跨域搜尋出口，禁止各 Slice 自建搜尋邏輯
%%    [#A13] Notification Hub = 唯一副作用出口，業務 Slice 只產生事件不決定通知策略
%%    [#A14] ParsedLineItem.(costItemType, semanticTagSlug) (Layer-2) 由 VS8 _cost-classifier.ts 標注；
%%           Layer-3 Semantic Router 只允許 EXECUTABLE 項目物化為 tasks，且以 semanticTagSlug 對齊 tag-snapshot，
%%           其餘類型（MANAGEMENT/RESOURCE/FINANCIAL/PROFIT/ALLOWANCE）靜默跳過並 toast
%%    [#A15] Finance 進入閘門：任務必須達到 ACCEPTED（通過 task-accepted-validator [#A19]）才可進入 Finance Staging Pool；
%%           Finance 獨立生命週期由 VS9 管理（[#A21] Finance_Request：DRAFT→AUDITING→DISBURSING→PAID）
%%    [#A16] （已由 #A21 升級取代）Finance_Request 生命週期：DRAFT→AUDITING→DISBURSING→PAID；
%%           Workflow Completed 條件為所有關聯 Finance_Request.status = PAID；
%%           禁止在新工作中引用 #A16
%%  FORBIDDEN（RULESET-FORBIDDEN）:
%%    BC_X 禁止直接寫入 BC_Y aggregate → 必須透過 IER Domain Event
%%    TX Runner 禁止產生 Domain Event → 只有 Aggregate 可以 [#4b]
%%    SECURITY_BLOCK DLQ → 禁止自動 Replay，必須人工審查
%%    B-track 禁止回呼 A-track → 只能透過 Domain Event 溝通
%%    Feature slice 禁止直接 import firebase/* [D24]
%%    Feature slice 禁止直接 import @/shared-infra/*；僅可依賴 SK_PORTS / Query Gateway / slice public API
%%    Notification Hub 禁止直接依賴 L7 具體 Adapter（含 RTDB_ADP/FCM_ADP）；必須經 Port 或 Gateway 公開介面
%%    Feature slice 禁止自建搜尋邏輯，必須透過 Global Search [D26 #A12]
%%    Feature slice 禁止直接 call sendEmail/push/SMS，必須透過 Notification Hub [D26 #A13]
%%    禁止 L6 Query Gateway 反向驅動 L2 Command Gateway（讀寫鏈不得形成回饋環）
%%    禁止 VS8 直接下命令至 VS5/VS6；僅可透過 L4 事件或 L5/L6 投影互動
%%    VS5 document-parser 禁止自行實作成本語義邏輯，必須呼叫 VS8 classifyCostItem() [D27 #A14]
%%    Layer-3 Semantic Router 禁止繞過 costItemType 直接物化非 EXECUTABLE 項目為 tasks [D27]
%%    Workflow 禁止在任務 Acceptance 未達 ACCEPTED（task-accepted-validator 通過）前進入 Finance [#A15 #A19]
%%    禁止外部服務直接修改 VS5 任務狀態；狀態只能由 VS5 Aggregate 內部驅動 [#A19]
%%    禁止 VS5 直接呼叫 VS9 Finance API 或寫入 VS9 Aggregate；僅可透過 TaskAcceptedConfirmed 事件 [#A19 #A20]
%%    禁止 VS9 直接呼叫 VS5 API 或寫入 VS5 Aggregate [#A20]
%%    禁止為同一批次任務建立兩個 Finance_Request（LOCKED_BY_FINANCE 防止重複請款）[#A20 #A21]
%%    Finance_Staging_Pool 禁止消費方直接寫入；唯一寫入路徑為 L5 Projection Bus [#A20]
%%    前端禁止直讀 VS9 Finance 域資料合成任務顯示；必須透過 task-finance-label-view 投影 [#A22]
%%    ParsingIntent.lineItems 禁止缺少 semanticTagSlug；UI 視覺屬性禁止直接讀 adjacency-list，必須讀 tag-snapshot [T5]
%%    業務切片（VS1~VS6，除 VS4 org-semantic-registry）禁止私自宣告語義類別；組織自訂任務類型/技能類型語義必須透過 VS4 治理流程 [D21-1]
%%    禁止使用隱性字串傳遞語義；全域引用必須指向 TE1~TE6，組織自訂引用必須指向 OrgTagRef [D21-2]
%%    孤立標籤（無 parentTagSlug 歸屬）禁止在系統中存在，須歸入分類學 [D21-3]
%%    跨切片決策（排班路由/通知分發）禁止硬編碼業務對象 ID，必須基於標籤語義權重 [D21-5]
%%    語義讀取禁止直連資料庫，必須經由 projection.tag-snapshot [D21-7]
%%    業務端禁止直接存取 graph/adjacency-list.ts，必須透過 tag-snapshot [T5]
%%    業務端禁止自行計算語義相似度/加權，必須透過 weight-calculator.ts [D21-E]
%%    通知/排班分發禁止基於業務 ID 硬編碼路由，必須走 policy-mapper/ 語義映射 [D27-A]
%%    learning-engine.ts 禁止手動隨機修改神經元強度，必須由 VS3/VS2 事實事件驅動 [D21-G]
%%    語義衝突提案禁止繞過 invariant-guard.ts，BBB 擁有最高裁決權 [D21-H D21-K]
%%    合併提案通過後禁止直接刪除舊標籤，必須轉為 Alias 自動重定向歷史引用 [D21-S]
%%    用戶新增重複語義標籤時禁止靜默建立，embeddings 必須即時提示相似標籤 [D21-U]
%%    VS8 禁止直接寫入 VS3 XP aggregate/ledger；僅可提供 semanticTag 與 policy lookup [A17]
%%    VS5 任務/品質流程禁止直接 mutate VS3 XP；必須透過 IER 事件進入 VS3 [#2 D9 A17]
%%    ── VS8 G/C/E/O/B 系列核心禁令 ──
%%    禁止任何模組繞過 CMD_GWAY 直接寫入 CTA、Graph 邊或 VS8 內部狀態 [G4]
%%    禁止以純向量相似度作最終分類依據；向量縮範後必須 Graph 確認 [C11 E5]
%%    禁止業務端或 AI Flow 自行計算邊 weight；所有 weight 由 weight-calculator 統一計算 [C3 E2]
%%    禁止在 VS8 任何子模組中執行跨切片副作用（通知、排班、物化）[B1 E11]
%%    禁止業務端繞過 Port 直接呼叫 VS8 內部模組（semantic-edge-store、causality-tracer 等）[O1 B3]
%%    禁止 PersonNode 被任何路徑直接寫入；唯一更新路徑是 ISemanticFeedbackPort [C9]
%%    無 inferenceTrace[] 的推理結果視為不完整，禁止進入任何下游流程 [E6]
%%    routing-engine 禁止直呼 VS6 排班或 VS7 通知；只輸出 SemanticRouteHint [E11]
%%    VS8 內部依賴單向：Governance→Core→Engine→Output；禁止逆向 import [B2]
%%    IS_A 分類學（本體論）≠ 向量工具（認識論）；禁止以一者取代另一者 [B4]
%%    VS8 只推論因果鏈，不物化因果副作用；因果執行歸 IER+L5 [B5]
%%    cost-item-classifier 三步推理不可跳躍（向量縮範→Graph 確認→override）；輸出必須含 inferenceTrace[] [E5]
%%    skill-matcher 三條件全滿才合格：tier + granularity 覆蓋度 + cert_required 證照；禁止部分通過 [E7]
%%    TagLifecycleEvent 廣播必須經 tag-outbox→RELAY→IER；禁止繞過 IER [O5 O6]
%%    語義治理變更 DLQ 強制 REVIEW_REQUIRED；禁止 SAFE_AUTO replay [G5]
%%  ╚══════════════════════════════════════════════════════════════════════════╝

flowchart TD

%% ═══════════════════════════════════════════════════════════════
%% VS0 FOUNDATION ── SAME DOMAIN, SPLIT VIEW（VS0-Kernel + VS0-Infra）
%% ═══════════════════════════════════════════════════════════════

subgraph VS0_FOUNDATION["🧱 VS0 · Foundation（src/shared-kernel + src/shared-infra）"]
    direction LR

subgraph SK["🔷 L1 · Shared Kernel（VS0-Kernel · src/shared-kernel）— 契約/常數/純函式（No I/O）"]
    direction TB

    subgraph SK_DATA["📄 基礎資料契約（src/shared-kernel/data-contracts）[#8]"]
        direction LR
        SK_ENV["event-envelope\nversion · traceId · causationId · correlationId · timestamp · hopCount\nidempotency-key = eventId+aggId+version\n[R8] traceId 整鏈共享・不可覆蓋\n[D30] hopCount 每經 IER 轉發 +1；≥ 4 拋 CircularDependencyDetected + SECURITY_BLOCK 告警\ncausationId = 觸發此事件的命令/事件 ID\ncorrelationId = 同一 saga/replay 的關聯 ID"]
        SK_AUTH_SNAP["authority-snapshot\nclaims / roles / scopes\nTTL = Token 有效期"]
        SK_SKILL_TIER["skill-tier（純函式）\ngetTier(xp)→Tier\n永不存 DB [#12]"]
        SK_SKILL_REQ["skill-requirement\ntagSlug × minXp\n跨片人力需求契約"]
        SK_CMD_RESULT["command-result-contract\nSuccess { aggregateId, version }\nFailure { DomainError }\n前端樂觀更新依據"]
    end

    subgraph SK_INFRA["⚙️ 基礎設施行為契約（src/shared-kernel/infra-contracts）[#8]"]
        direction LR

        SK_OUTBOX["📦 SK_OUTBOX_CONTRACT [S1]\n① at-least-once\n   EventBus → OUTBOX → RELAY → IER\n② idempotency-key 必帶\n   格式：eventId+aggId+version\n③ DLQ 分級宣告（每 OUTBOX 必填）\n   SAFE_AUTO      冪等事件・自動重試\n   REVIEW_REQUIRED 金融/排班/角色・人工審\n   SECURITY_BLOCK  安全事件・凍結+告警"]

        SK_VERSION["🔢 SK_VERSION_GUARD [S2]\nevent.aggregateVersion\n  > view.lastProcessedVersion → 允許更新\n  否則 → 丟棄（過期事件不覆蓋）\n適用全部 Projection [#19]"]

        SK_READ["📖 SK_READ_CONSISTENCY [S3]\nSTRONG_READ  → Aggregate 回源\n  適用：金融・安全・不可逆\nEVENTUAL_READ → Projection\n  適用：顯示・統計・列表\n規則：餘額/授權/排班衝突 → STRONG_READ"]

        SK_STALE["⏱ SK_STALENESS_CONTRACT [S4]\nTAG_MAX_STALENESS    ≤ 30s\nPROJ_STALE_CRITICAL  ≤ 500ms\nPROJ_STALE_STANDARD  ≤ 10s\n各節點引用此常數・禁止硬寫數值"]

        SK_RESILIENCE["🛡 SK_RESILIENCE_CONTRACT [S5]\nR1 rate-limit   per user ∪ per org → 429\nR2 circuit-break 連續 5xx → 熔斷\nR3 bulkhead     切片隔板・獨立執行緒池\n適用：_actions.ts / Webhook / Edge Function"]

        SK_TOKEN["🔄 SK_TOKEN_REFRESH_CONTRACT [S6]\n觸發：RoleChanged | PolicyChanged\n  → IER CRITICAL_LANE → CLAIMS_HANDLER\n完成：TOKEN_REFRESH_SIGNAL\n客端義務：強制重取 Firebase Token\n失敗：→ DLQ SECURITY_BLOCK + 告警"]
    end

    subgraph SK_PORTS["🔌 Infrastructure Ports（依賴倒置介面 src/shared-kernel/ports；由 L7 Adapter 實作）[D24]"]
        direction LR
        I_AUTH["IAuthService\n身份驗證 Port"]
        I_REPO["IFirestoreRepo\nFirestore 存取 Port [S2]"]
        I_MSG["IMessaging\n訊息推播 Port [R8]"]
        I_STORE["IFileStore\n檔案儲存 Port"]
    end

    subgraph SK_OBS_CONTRACT["📘 L1 · Observability Contracts（src/shared-kernel/observability）[D8]"]
        direction LR
        SK_OBS_PATH["path: src/shared-kernel/observability"]
        SK_TRACE_CTX["TraceContext / ITraceProvider\ncontract-only"]
        SK_METRICS_IF["EventCounters / IMetricsRecorder\ncontract-only"]
        SK_ERR_IF["DomainErrorEntry / IErrorLogger\ncontract-only"]
    end

end

subgraph SHARED_INFRA_PLANE["🧩 Shared Infrastructure Plane（VS0-Infra：L0/L2/L4/L5/L6/L7/L9/L10 Execution Plane；L8 為外部 Firebase 平台，不在 VS0 管轄；與 VS0-Kernel 同屬 VS0）"]
        direction TB

        %% ═══════════════════════════════════════════════════════════════
        %% LAYER 0 ── EXTERNAL TRIGGERS（外部觸發入口）
        %% ═══════════════════════════════════════════════════════════════

        subgraph EXT["🌐 L0 · External Triggers（src/shared-infra/external-triggers）"]
            direction LR
            EXT_CLIENT["Next.js Client\n_actions.ts [S5]"]
            EXT_AUTH["Firebase Auth\n登入 / 註冊 / Token"]
            EXT_WEBHOOK["Webhook / Edge Fn\n[S5] 遵守 SK_RESILIENCE_CONTRACT"]
            WEBHOOK_READ_REJECT["webhook-read-reject\nread not allowed\n401/403/400"]

            subgraph GW_GUARD["🛡️ 入口防護層（src/shared-infra/external-triggers）[S5]"]
                RATE_LIM["rate-limiter\nper user / per org\n429 + retry-after"]
                CIRCUIT["circuit-breaker\n5xx → 熔斷 / 半開探針恢復"]
                BULKHEAD["bulkhead-router\n切片隔板・獨立執行緒池"]
                RATE_LIM --> CIRCUIT --> BULKHEAD
            end

            EXT_WEBHOOK -.->|forbidden read| WEBHOOK_READ_REJECT
        end

        BULKHEAD -->|command ingress| CMD_API_GW
        BULKHEAD -->|client/server-action read ingress| QRY_API_GW

        %% ═══════════════════════════════════════════════════════════════
        %% CQRS GATEWAY（讀寫分離統一閘道 · L0A / L2 / L6）
        %% 架構設計正確性：Command Layer + Command Gateway + Query Gateway
        %% 三者同屬「讀寫分離閘道」，以讀/寫為唯一切割線，合一呈現
        %% ═══════════════════════════════════════════════════════════════

        subgraph UNIFIED_GW["🔀 CQRS Gateway（讀寫分離統一閘道 · L0A + L2 + L6 · src/shared-infra/api-gateway + gateway-command + gateway-query）"]
            direction LR

            subgraph CQRS_WRITE["✍ Write Path（L0A → L2）"]
                direction TB
                CMD_API_GW["COMMAND_API_GATEWAY\nwrite-only ingress · L0A\nsrc/shared-infra/api-gateway"]

                subgraph GW_PIPE["⚙️ Command Pipeline（L2 · src/shared-infra/gateway-command）"]
                    CBG_ENTRY["unified-command-gateway\n[R8] TraceID 注入（唯一注入點）\n→ event-envelope.traceId"]
                    CBG_AUTH["authority-interceptor\nAuthoritySnapshot [#A9]\n衝突以 ACTIVE_CTX 為準"]
                    CBG_ROUTE["command-router [D29]\nTransactionalCommand 基類強制封裝\n同一 Firestore TX：Aggregate 寫入 + {slice}/_outbox 寫入\n路由至對應切片\n回傳 SK_CMD_RESULT"]
                    CBG_ENTRY --> CBG_AUTH --> CBG_ROUTE
                end

                CMD_API_GW --> CBG_ENTRY
            end

            subgraph CQRS_READ["📖 Read Path（L0A → L6）"]
                direction TB
                QRY_API_GW["QUERY_API_GATEWAY\nread-only ingress · L0A\nsrc/shared-infra/api-gateway"]

                subgraph GW_QUERY["⚙️ Query Routes（L6 · src/shared-infra/gateway-query）[S2 S3]"]
                    direction LR
                    QGWAY["read-model-registry\n統一讀取入口\n版本對照 / 快照路由\n[S2] 所有 Projection 遵守 SK_VERSION_GUARD\n[D31] 讀取自動 JOIN acl-projection 過濾（讀寫權限絕對同步）"]
                    QGWAY_SCHED["→ .org-eligible-member-view\n[#14 #15 #16]"]
                    QGWAY_CAL_DAY["→ .schedule-calendar-view/day\n日期維度（單日，by dateKey）"]
                    QGWAY_CAL_ALL["→ .schedule-calendar-view/all\n日期維度（全量，by orgId）"]
                    QGWAY_TL_MEMBER["→ .schedule-timeline-view/member\n資源維度（單成員，by memberId）"]
                    QGWAY_TL_ALL["→ .schedule-timeline-view/all\n資源維度（全量，by orgId）"]
                    QGWAY_NOTIF["→ .account-view + notification-feed-view\n[#6] FCM Token + RTDB 通知快照"]
                    QGWAY_SCOPE["→ .workspace-scope-guard-view\n[#A9]"]
                    QGWAY_WALLET["→ .wallet-balance\n[S3] 顯示 → Projection\n精確交易 → STRONG_READ"]
                    QGWAY_SEARCH["→ .tag-snapshot\n語義化索引檢索"]
                    QGWAY_SEM_GOV["→ .semantic-governance-view\n語義治理頁讀模型（提案/共識/關係）\n治理頁顯示必經 L5 投影"]
                    QGWAY_FIN_STAGE["→ .finance-staging-pool [#A20]\n財務待處理清單（已驗收未請款任務）"]
                    QGWAY_FIN_LABEL["→ .task-finance-label-view [#A22]\n任務金融顯示標籤（合成顯示）"]
                    QGWAY --> QGWAY_SCHED & QGWAY_CAL_DAY & QGWAY_CAL_ALL & QGWAY_TL_MEMBER & QGWAY_TL_ALL & QGWAY_NOTIF & QGWAY_SCOPE & QGWAY_WALLET & QGWAY_SEARCH & QGWAY_SEM_GOV & QGWAY_FIN_STAGE & QGWAY_FIN_LABEL
                end

                QRY_API_GW --> QGWAY
            end
        end

        %% ═══════════════════════════════════════════════════════════════
        %% LAYER 4 ── INTEGRATION EVENT ROUTER（事件路由總線）
        %% ═══════════════════════════════════════════════════════════════

        subgraph GW_IER["🟠 L4 · Integration Event Router（src/shared-infra/event-router + src/shared-infra/outbox-relay + src/shared-infra/dlq-manager）"]
            direction TB

            RELAY["outbox-relay-worker（src/shared-infra/outbox-relay）\n【共用 Infra・所有 OUTBOX 共享】\n掃描：Firestore onSnapshot (CDC)\n[R9] 要求來源必須帶 traceId；以 AsyncLocalStorage 傳遞上下文至異步函式鏈\n投遞：OUTBOX → IER 對應 Lane\n失敗：retry backoff → 3次失敗 → DLQ\n監控：relay_lag → L9(Observability)"]

            subgraph IER_CORE["⚙️ IER Core（src/shared-infra/event-router）"]
                IER[["integration-event-router\n統一事件出口 [#9]\n[R8] 保留 envelope.traceId 禁止覆蓋\n[D30] hopCount++ → hopCount ≥ 4 → 攔截 + SECURITY_BLOCK + CircularDependencyDetected 告警"]]
            end

            subgraph IER_LANES["🚦 優先級三道分層（src/shared-infra/event-router）[P1]"]
                CRIT_LANE["🔴 CRITICAL_LANE\n高優先最終一致\nRoleChanged → Claims 刷新 [S6]\nWalletDeducted/Credited\nOrgContextProvisioned\nTaskAcceptedConfirmed [#A19] → Finance Staging Pool\nSLA：盡快投遞"]
                STD_LANE["🟡 STANDARD_LANE\n非同步最終一致\nSLA < 2s\nSkillXpAdded/Deducted\nScheduleAssigned / ScheduleProposed\nMemberJoined/Left\nFinanceRequestStatusChanged [#A22] → task-finance-label-view\nAll Domain Events"]
                BG_LANE["⚪ BACKGROUND_LANE\nSLA < 30s\nTagLifecycleEvent\nAuditEvents"]
            end

            subgraph DLQ_SYS["💀 DLQ 三級分類（src/shared-infra/dlq-manager）[R5 S1]"]
                DLQ["dead-letter-queue\n失敗 3 次後收容\n分級標記來自 SK_OUTBOX_CONTRACT"]
                DLQ_S["🟢 SAFE_AUTO\n自動 Replay（保留 idempotency-key）"]
                DLQ_R["🟡 REVIEW_REQUIRED\n金融/排班/角色\n人工確認後 Replay"]
                DLQ_B["🔴 SECURITY_BLOCK\n安全事件\n告警 + 凍結 + 人工確認\n禁止自動 Replay"]
                DLQ --> DLQ_S & DLQ_R & DLQ_B
                DLQ_S -.->|"自動 Replay"| IER
                DLQ_R -.->|"人工確認後 Replay"| IER
                DLQ_B -.->|"告警"| DOMAIN_ERRORS
            end

            RELAY -.->|"掃描所有 OUTBOX → 投遞"| IER
            IER --> IER_LANES
            IER_LANES -.->|"投遞失敗 3 次"| DLQ
        end

        %% ═══════════════════════════════════════════════════════════════
        %% LAYER 5 ── PROJECTION BUS（事件投影總線）
        %% ═══════════════════════════════════════════════════════════════

        subgraph PROJ_BUS["🟡 L5 · Projection Bus（src/shared-infra/projection-bus，ownership: VS0-Infra）"]
            direction TB

            subgraph PROJ_BUS_FUNNEL["▶ Event Funnel（src/shared-infra/projection-bus）[S2 P5 R8]"]
                direction LR
                FUNNEL[["event-funnel\n[#9] 唯一 Projection 寫入路徑\n[Q3] upsert by idempotency-key\n[R8] 從 envelope 讀取 traceId → DOMAIN_METRICS\n[S2] 所有 Lane 遵守 SK_VERSION_GUARD\n     event.aggVersion > view.lastVersion\n     → 更新；否則 → 丟棄\n[P8] Worker Pool：依 priorityLane 分配 Quota（Critical/Standard/Background）\n     同一 doc 100ms 內多次更新合併為 1 次寫入（Debounce/Batch）"]]
                CRIT_PROJ["🔴 CRITICAL_PROJ_LANE\n[S4: PROJ_STALE_CRITICAL ≤ 500ms]\n獨立重試 / dead-letter"]
                STD_PROJ["⚪ STANDARD_PROJ_LANE\n[S4: PROJ_STALE_STANDARD ≤ 10s]\n獨立重試 / dead-letter"]
                FUNNEL --> CRIT_PROJ & STD_PROJ
            end

            subgraph PROJ_BUS_META["⚙️ Stream Meta（src/shared-infra/projection-bus）"]
                PROJ_VER["projection.version\n事件串流偏移量"]
                READ_REG["read-model-registry\n版本目錄"]
                PROJ_VER -->|version mapping| READ_REG
            end

            subgraph PROJ_BUS_CRIT["🔴 Critical Projections（src/shared-infra/projection-bus）[S2 S4]"]
                WS_SCOPE_V["projection.workspace-scope-guard-view\n授權路徑 [#A9]\n[S2: SK_VERSION_GUARD]"]
                ORG_ELIG_V["projection.org-eligible-member-view\n[S2: SK_VERSION_GUARD]\nskills{tagSlug→xp} / eligible\n[#14 #15 #16 T3]\n→ tag::skill [TE_SK]\n→ tag::skill-tier [TE_ST]"]
                WALLET_V["projection.wallet-balance\n[S3: EVENTUAL_READ]\n顯示用・精確交易回源 AGG"]
                ACL_PROJ_V["projection.acl-projection [D31]\n讀取路徑權限鏡像\nCBG_AUTH 權限變更事件 → L5 同步更新\nQRY_API_GW 讀取自動 JOIN 過濾"]
                TIER_FN[["getTier(xp) → Tier\n純函式 [#12]"]]
            end

            subgraph PROJ_BUS_STD["⚪ Standard Projections（src/shared-infra/projection-bus）[S4]"]
                direction LR
                WS_PROJ["projection.workspace-view"]
                ACC_SCHED_V["projection.account-schedule"]
                CAL_PROJ["projection.schedule-calendar-view\n日期維度 Read Model [L5-Bus]\napplyVersionGuard() [S2]"]
                TL_PROJ["projection.schedule-timeline-view\n資源維度 Read Model [L5-Bus]\noverlap/resource-grouping 下沉 L5\napplyVersionGuard() [S2]"]
                ACC_PROJ_V["projection.account-view"]
                ORG_PROJ_V["projection.organization-view"]
                SKILL_V["projection.account-skill-view\n[S2: SK_VERSION_GUARD]"]
                AUDIT_V["projection.global-audit-view\n每條記錄含 traceId [R8]"]
                TAG_SNAP["projection.tag-snapshot\n[S4: TAG_MAX_STALENESS]\nT5 消費方禁止寫入"]
                SEM_GOV_V["projection.semantic-governance-view\n治理頁 Read Model（wiki/proposal/relationship）\n顯示線路：L5→L6→UI"]
                TASK_V["projection.tasks-view\n任務清單（createdAt 批次間\n→ sourceIntentIndex 批次內）[D27-Order]\napplyVersionGuard() [S2]"]
                WS_GRAPH_V["projection.workspace-graph-view\n任務依賴 Nodes/Edges 拓撲\n[VS5 vis-network 消費格式]\napplyVersionGuard() [S2]"]
                FINANCE_STAGE_V["projection.finance-staging-pool [#A20]\n待請款池：已驗收未請款任務清單\n消費 TaskAcceptedConfirmed（CRITICAL_LANE）\n狀態：PENDING | LOCKED_BY_FINANCE\napplyVersionGuard() [S2]"]
                TASK_FIN_LABEL_V["projection.task-finance-label-view [#A22]\n任務金融顯示標籤投影\n消費 FinanceRequestStatusChanged（STANDARD_LANE）\n欄位：taskId, financeStatus, requestId, requestLabel\napplyVersionGuard() [S2]"]
            end

            IER ==>|"[#9] 唯一 Projection 寫入路徑"| FUNNEL
            CRIT_PROJ --> WS_SCOPE_V & ORG_ELIG_V & WALLET_V & ACL_PROJ_V
            STD_PROJ --> WS_PROJ & ACC_SCHED_V & CAL_PROJ & TL_PROJ & ACC_PROJ_V & ORG_PROJ_V & SKILL_V & AUDIT_V & TAG_SNAP & SEM_GOV_V & TASK_V & WS_GRAPH_V & FINANCE_STAGE_V & TASK_FIN_LABEL_V

            FUNNEL -->|stream offset| PROJ_VER
            WS_ESTORE -.->|"[#9] replay → rebuild"| FUNNEL
            SKILL_V -.->|"[#12] getTier"| TIER_FN
            ORG_ELIG_V -.->|"[#12] getTier"| TIER_FN
        end

        subgraph FIREBASE_L7["🔥 L7 Firebase 前後端分層（決策矩陣：何時用 firebase-client vs functions → D25 / 見 01-logical-flow.md §Firebase 路由決策）"]
            direction LR

        subgraph FIREBASE_ACL["🔥 L7-A · firebase-client SDK（Client Adapters · src/shared-infra/frontend-firebase · FIREBASE_ACL）[D24]\n前端操作 / App Check 初始化 / Analytics 遙測 / 即時訂閱\n流程：L3/L5/L6 → L1 SK_PORTS → L7-A → L8"]
            direction LR

            AC_TRANSLATOR_L7["anti-corruption-translator\nSDK semantics -> standardized ports"]

            AUTH_ADP["auth.adapter.ts\nAuthAdapter\n實作 IAuthService\nFirebase User ↔ Auth Identity\n[D24] 唯一合法 firebase/auth 呼叫點"]

            FSTORE_ADP["firestore.facade.ts\nFirestoreAdapter\n實作 IFirestoreRepo\n[S2] aggregateVersion 單調遞增守衛\n[D24] 唯一合法 firebase/firestore 呼叫點"]

            RTDB_ADP["realtime-database.adapter.ts\nRealtimeDatabaseAdapter\n即時通訊/通知低延遲同步（presence/typing/live-feed）\n[D24] 唯一合法 firebase/database 呼叫點"]

            FCM_ADP["messaging.adapter.ts\nFCMAdapter\n實作 IMessaging\n[R8] 注入 envelope.traceId → FCM metadata\n禁止在此生成新 traceId\n[D24] 唯一合法 firebase/messaging 呼叫點"]

            STORE_ADP["storage.facade.ts\nStorageAdapter\n實作 IFileStore\nPath Resolver / URL 簽發\n[D24] 唯一合法 firebase/storage 呼叫點"]

            ANALYTICS_ADP["analytics.adapter.ts\nAnalyticsAdapter\nGoogle Analytics 事件寫入（logEvent/screen_view）\n僅允許遙測事件，禁止承載領域寫入\n[D24] 唯一合法 firebase/analytics 呼叫點"]

            APPCHK_ADP["app-check.adapter.ts\nAppCheckAdapter\nClient attestation token 初始化/續期/驗證\n未通過不得進入 L2/L3\n[D24 D25 E7] 唯一合法 firebase/app-check 呼叫點"]

            VIS_DATA_ADP["vis-data.adapter.ts\nVisDataAdapter\nDataSet<Node|Edge|DataItem> 本地快取\n[D28] 唯一 vis-* DataSet 寫入點\nFirebase Snapshot 訂閱一次 → DataSet 更新推播\nvis-network / vis-timeline / vis-graph3d 唯讀消費\n禁止 vis-* 直連 Firebase（N×1 連線 → 費用倍增）[D28]"]

            AC_TRANSLATOR_L7 -.-> AUTH_ADP
            AC_TRANSLATOR_L7 -.-> FSTORE_ADP
            AC_TRANSLATOR_L7 -.-> RTDB_ADP
            AC_TRANSLATOR_L7 -.-> FCM_ADP
            AC_TRANSLATOR_L7 -.-> STORE_ADP
            AC_TRANSLATOR_L7 -.-> ANALYTICS_ADP
            AC_TRANSLATOR_L7 -.-> APPCHK_ADP
            AC_TRANSLATOR_L7 -.-> VIS_DATA_ADP
        end

        subgraph FIREBASE_BACKEND["🔥 L7-B · functions（firebase-admin 唯一容器 · src/shared-infra/backend-firebase）[D25]\nfirebase-admin 一律透過 Cloud Functions；禁止在 Next.js server/edge/Server Actions/Edge Functions 直接使用\n高權限 / 跨租戶 / Admin Claims / Webhook 驗簽 / 批次協調\n流程：L0 EXT_WEBHOOK / L2 CBG_ROUTE → L7-B → L8"]
            direction LR
            BFN_GW["functions-gateway\nsrc/shared-infra/backend-firebase/functions\nAdmin 權限 / 跨租戶協調 / Trigger / Scheduler / Webhook 驗簽\nfirebase-admin SDK 初始化唯一容器\n對外 HTTP/Callable API 入口"]

            subgraph ADMIN_ADPTS["Admin SDK Adapters（firebase-admin — 一律在 Cloud Functions 內執行）[D25]"]
                direction TB
                ADMIN_AUTH_ADP["admin-auth-adapter\n[D25] 唯一合法 firebase-admin/auth 呼叫點\n(自訂 Claims / 使用者管理)"]
                ADMIN_DB_ADP["admin-data-adapter\n[D25] 唯一合法 firebase-admin/firestore 呼叫點\n(強一致寫入 / 跨集合 TX)"]
                ADMIN_MSG_ADP["admin-messaging-adapter\n[D25] 唯一合法 firebase-admin/messaging 呼叫點\n(Server-side FCM 主要通道)"]
                ADMIN_STORE_ADP["admin-storage-adapter\n[D25] 唯一合法 firebase-admin/storage 呼叫點\n(後端簽署 URL / 跨租戶操作)"]
                ADMIN_APPCHK_ADP["admin-appcheck-adapter\n[D25] 唯一合法 firebase-admin/app-check 呼叫點\n(驗證 App Check token)"]
            end

            BFN_GW -.->|"Admin SDK init → 各 Service API 委派"| ADMIN_AUTH_ADP & ADMIN_DB_ADP & ADMIN_MSG_ADP & ADMIN_STORE_ADP & ADMIN_APPCHK_ADP

            BDC_GW["dataconnect-gateway-adapter\nsrc/shared-infra/backend-firebase/dataconnect\n治理化 GraphQL schema/connector/operations\n跨前端一致查詢契約"]
        end

        end

        subgraph FIREBASE_EXT["☁️ L8 · Firebase Infrastructure（外部平台 SDK Runtime；本 repo 僅邊界映射）"]
            direction LR
            F_AUTH[("Firebase Auth\nfirebase/auth")]
            F_DB[("Firestore\nfirebase/firestore")]
            F_RTDB[("Realtime Database\nfirebase/database")]
            F_FCM[("Firebase Cloud Messaging\nfirebase/messaging")]
            F_STORE[("Cloud Storage\nfirebase/storage")]
            F_ANALYTICS[("Google Analytics\nfirebase/analytics")]
            F_APPCHK[("Firebase App Check\nfirebase/app-check")]
            F_DC[("Data Connect\nfirebase/data-connect")]
            F_FUNCTIONS[("Cloud Functions Runtime\nfirebase-admin/app\n初始化 Admin SDK 的唯一容器")]
        end

        subgraph OBS_LAYER["⬜ L9 · Observability（src/shared-infra/observability）"]
            direction LR
            OBS_PATH["path: src/shared-infra/observability"]
            TRACE_ID["trace-identifier\nCBG_ENTRY 注入 TraceID\n整條事件鏈共享 [R8]"]
            DOMAIN_METRICS["domain-metrics\nIER 各 Lane Throughput/Latency\nFUNNEL 各 Lane 處理時間\nOUTBOX_RELAY lag [R1]\nRATELIMIT hit / CIRCUIT open"]
            DOMAIN_ERRORS["domain-error-log\nWS_TX_RUNNER\nSCHEDULE_SAGA\nDLQ_BLOCK 安全事件 [R5]\nStaleTagWarning\nTOKEN_REFRESH 失敗告警 [S6]\nCircularDependencyDetected [D30]"]
        end
end

end

SK_OBS_CONTRACT -.->|"contract bind"| OBS_LAYER
SK_OBS_PATH -.->|"contract -> runtime"| OBS_PATH

%% ─── VS8 Semantic Cognition Engine（語義認知引擎）
%% ─── 架構正確性優先原則（Architectural Correctness First）：G/C/E/O/B 五系列規則為 VS8 完整正式規範
%% ───   奧卡姆剃刀 = 正確抽象（正確的職責邊界、清晰的語義層次），而非最少程式碼或最快實作
%% ─── 四層架構（可維護視圖）：
%% ───   ① Governance（治理）: registry / protocol / guards / portal
%% ───   ② Core Domain（核心語義域）: CTA / hierarchy / vector / tag entities
%% ───   ③ Compute Engine（計算引擎）: graph / reasoning / routing / learning
%% ───   ④ Output（輸出）: projections / event-broadcast / decision-policy
%% ─── 向下相容：VS8_CL ≡ core-domain, VS8_SL ≡ graph-engine, VS8_NG ≡ reasoning-engine, VS8_RL ≡ decision-policy
%% ─── [B2] 四層單向依賴：Governance→Core Domain→Compute Engine→Output（禁止逆向）
%% ─── [B4] 分類學（IS_A 本體論）≠ 向量工具（認識論）；兩者職責不可互換
%% ─── [B5] VS8 推論因果鏈路徑；因果執行副作用（排班、通知、物化）歸 IER+L5
%% ─── centralized-tag.aggregate 具備 lifecycle，為 domain authority [#A6 #17]
subgraph VS8["🧠 VS8 · Semantic Cognition Engine（src/features/semantic-graph.slice）[#A6 #17]"]
    direction TB

    subgraph VS8_GOV_LAYER["① 🏛️ Semantic Governance Layer（src/features/semantic-graph.slice/governance）"]
        direction TB
        SEM_REG["semantic-registry\n【Semantic SSOT】\n由 centralized-tag.aggregate 提供唯一註冊來源\n跨域語義必須先註冊再使用 [D21-A D21-T D21-U]"]
        SEM_PROTOCOL["semantic-protocol\n【訊號協議層】\ncommand/event envelope 與 TagLifecycleEvent 協議\n維持跨模組語義訊號一致 [D21-6 S1 R8]"]

        subgraph VS8_GUARD["1.1 🛡️ guards · Semantic Integrity（src/features/semantic-graph.slice/governance/guards）[D21-H D21-K S4]"]
            direction LR
            INV_GUARD["invariant-guard.ts\n【最高裁決權 · 語義衝突直接拒絕】\n違反物理邏輯聯結 → 攔截提案 [D21-H D21-K]"]
            STALE_MON["staleness-monitor.ts\nTAG_MAX_STALENESS ≤ 30s [S4 D21-8]"]
        end

        subgraph VS8_WIKI["1.2 🏛️ semantic-governance-portal（src/features/semantic-graph.slice/semantic-governance-portal）[D21-I~W]"]
            direction LR
            WIKI_ED["editor\n標籤定義編輯 [D21-J]\n讀取：L6 Query Gateway → semantic-governance-view\n寫入：L2 CMD_GWAY → VS8 CTA（禁止直寫 graph/projection）"]
            PROP_STREAM["proposal-stream/\n提案審議串流 [D21-I D21-V]"]
            REL_VIS["relationship-visualizer/\n語義關係圖視覺化"]
            CONS_ENG["consensus-engine/\n全域共識校驗 [D21-I D21-K]"]
            PROP_STREAM -->|"提案送驗"| CONS_ENG
        end
    end

    subgraph VS8_CORE_LAYER["② 🧬 Semantic Core Domain（src/features/semantic-graph.slice/core）"]
        direction TB

        subgraph VS8_CL["2.1 semantic-core-domain（src/features/semantic-graph.slice/core）[D21-A D21-B D21-C D21-D]"]
            direction LR
            CTA["centralized-tag.aggregate (CTA)\n【全域語義字典・唯一真相】\ntagSlug / label / category\ndeprecatedAt / deleteRule\n生命週期守護：Draft→Active→Stale→Deprecated [D21-4]"]
            HIER["hierarchy-manager.ts\n確保每個新標籤掛載至少一個父節點 [D21-C]"]
            VEC["embeddings/vector-store.ts\n向量隨標籤定義同步刷新 [D21-D]"]
            subgraph TAG_ENTS["🏷️ Semantic Tag Entities（src/shared-kernel/data-contracts/tag-authority）(TE1~TE6) [D21-A]"]
                direction LR
                TE_UL["TE1 · tag::user-level\ncategory: user_level"]
                TE_SK["TE2 · tag::skill\ncategory: skill"]
                TE_ST["TE3 · tag::skill-tier\ncategory: skill_tier"]
                TE_TM["TE4 · tag::team\ncategory: team"]
                TE_RL["TE5 · tag::role\ncategory: role"]
                TE_PT["TE6 · tag::partner\ncategory: partner"]
            end
            CTA --> TAG_ENTS
            CTA --> HIER
            CTA -.-> VEC
        end
    end

    subgraph VS8_ENGINE_LAYER["③ ⚙️ Semantic Compute Engine（src/features/semantic-graph.slice/{graph,reasoning,routing,learning}）"]
        direction TB

        subgraph VS8_SL["3.1 graph-engine（src/features/semantic-graph.slice/graph）[D21-E D21-F D21-9 D21-10 C2 C3]"]
            direction LR
            EDGE_STORE["semantic-edge-store.ts\n【邊關係登錄中心 · 唯一邊圖操作點 [E1]】\n5 種合法邊類型 [C2]：\n  REQUIRES（Task→Skill）\n  HAS_SKILL（Person→Skill）\n  IS_A（Skill→Skill 繼承）\n  DEPENDS_ON（Task→Task 前置）\n  TRIGGERS（Task→Task 完成觸發）\nweight ∈ [0,1]（REQUIRES←granularity；HAS_SKILL←xp/tier）[C3]\n禁止業務端自定義邊類型・禁止硬寫 weight [C2 C3]"]
            WT_CALC["weight-calculator.ts\n【語義相似度統一出口 · 禁止業務端自行加權 [E2]】\ncomputeSimilarity(a,b) [D21-E]"]
            CTX_ATTN["context-attention.ts\n【Workspace 情境過濾 · 注意力隔離 [E12]】\nfilterByContext(slugs, wsCtx) [D21-F]"]
            TOPO_OPS["adjacency-list.ts\n拓撲閉包計算（禁止業務端直連 [T5 E3]）\ngetTransitiveRequirements / isSupersetOf / findCriticalPath [D21-10]"]
            EDGE_STORE -.-> WT_CALC
            EDGE_STORE -.-> TOPO_OPS
        end

        subgraph VS8_NG["3.2 reasoning-engine（src/features/semantic-graph.slice/reasoning）[D21-4 D21-6 D21-X E5~E9]"]
            direction LR
            NEURAL_NET["semantic-distance\ncomputeSemanticDistance(a,b)\nfindIsolatedNodes(slugs[]) [D21-10]\nDijkstra 加權最短路徑"]
            CAUSALITY["🔍 Causality Tracer [D21-6 D21-X E8]\ntraceAffectedNodes(event, candidates[])\nbuildCausalityChain(event, candidates[])\nBFS 因果傳播 · 來源唯一：TRIGGERS+DEPENDS_ON 邊\n禁止自定義因果規則 [E8]"]
            SKILL_MATCH["skill-matcher.ts [E7]\n人員資格推理：三條件全滿才合格\n① tier ≥ Task 要求層級\n② granularity 覆蓋度 ≥ REQUIRES 邊 weight\n③ cert_required Skill 必須有合規證照\n禁止部分滿足的模糊通過 [E7]"]
            TAG_EV["TagLifecycleEvent（in-process）\neventType: TAG_CREATED | TAG_ACTIVATED\n         | TAG_DEPRECATED | TAG_STALE_FLAGGED\n         | TAG_DELETED\n[D21-6] 因果自動觸發"]
            TAG_OB["tag-outbox\n[SK_OUTBOX: SAFE_AUTO]"]
            TAG_SG["⚠️ TAG_STALE_GUARD\n[S4 D21-8: TAG_MAX_STALENESS ≤ 30s]"]
            NEURAL_NET -.->|"語義距離 [D21-4]"| CAUSALITY
            CAUSALITY -->|"TagLifecycleEvent [D21-6]"| TAG_EV
            TAG_EV --> TAG_OB
            CAUSALITY -.->|"廢棄感知 [D21-8]"| TAG_SG
            SKILL_MATCH -.->|"消費 HAS_SKILL / REQUIRES 邊 [E7]"| EDGE_STORE
        end

        subgraph VS8_ROUT["3.3 routing-engine（src/features/semantic-graph.slice/routing）[D21-5 D27-A E11]"]
            direction LR
            POLICY_MAP["policy-mapper/\n語義標籤→分發策略 [D27-A]\n禁止 ID 硬編碼路由"]
            SEM_ROUTE_HINT["SemanticRouteHint contract [E11]\n純語義計算建議輸出\n禁止 routing-engine 直呼 VS6/VS7\n副作用由訂閱方負責執行"]
            DISPATCH["dispatch-bridge/\n排班路由 · 通知分發出口"]
            subgraph WORKFLOWS["workflows/（src/features/semantic-graph.slice/workflows）"]
                direction LR
                TAG_PROMO["tag-promotion-flow.ts\n標籤晉升流程"]
                ALERT_FLOW["alert-routing-flow.ts\n告警路由流程"]
            end
            POLICY_MAP --> SEM_ROUTE_HINT --> DISPATCH
        end

        subgraph VS8_PLAST["3.4 learning-engine（src/features/semantic-graph.slice/learning）[D21-G]"]
            direction LR
            LEARN["learning-engine.ts\n【僅 VS3/VS2 事實事件驅動 · 禁止手動隨機修改】\n加權演化回饋環 [D21-G]"]
            DECAY["semantic-decay\n語義強度自然衰退"]
            LEARN -.-> DECAY
        end
    end

    subgraph VS8_OUTPUT_LAYER["④ 📤 Semantic Output Layer（src/features/semantic-graph.slice/{projections,subscribers,outbox,decision,ports}）"]
        direction TB

        subgraph VS8_PROJ["4.1 projections · 讀側投影（src/features/semantic-graph.slice/output/projections）[D21-7 T5 O2~O4]"]
            direction LR
            TAG_RO["semantic-tag-projection\n【業務端唯一合法讀取出口 · T5 O2】\n[D21-7] 讀取必須經 projection.tag-snapshot\nT1 新切片訂閱事件即可擴展"]
            GRAPH_SEL["projections/graph-selectors.ts\n圖結構唯讀查詢"]
            CTX_SEL["projections/context-selectors.ts\nWorkspace 語義上下文"]
            TASK_SEM_V["projection.task-semantic-view [O3]\nrequired_skills（來自 REQUIRES 邊）\neligible_persons（來自 skill-matcher 推理）\n兩者缺一則投影不完整不得對外提供"]
            CAUSAL_LOG["projection.causal-audit-log [O4]\n每條記錄必含 inferenceTrace[] + traceId\ntraceId 從 event-envelope 讀取（禁止重新生成）"]
            TAG_RO -.-> GRAPH_SEL
            TAG_RO -.-> CTX_SEL
        end

        subgraph VS8_IO["4.2 event-broadcast · 語義訂閱廣播（src/features/semantic-graph.slice/{subscribers,outbox}）[D21-6 S1 O5 O6]"]
            direction LR
            LIFECYCLE_SUB["subscribers/lifecycle-subscriber.ts\n標籤生命週期事件訂閱"]
            TAG_OUTBOX["outbox/tag-outbox.ts\n【VS8 唯一 outbox 節點 [O5]】\n[SK_OUTBOX: SAFE_AUTO]\n路徑：tag-outbox→RELAY→IER→L5 FUNNEL→tag-snapshot\n標籤異動廣播出口 [O6]"]
        end

        subgraph VS8_RL["4.3 decision-policy · 語義決策輸出（src/features/semantic-graph.slice/decision）[D21-5 D8 D27 E4~E6]"]
            direction LR
            subgraph COST_CLASS["📊 成本語義分類器（src/features/semantic-graph.slice/_cost-classifier.ts）[D8][D24][D27][E4 E5 E6 C6]"]
                direction LR
                COST_CLASSIFIER["_cost-classifier.ts（純函式 [D8]）\n實作 ISemanticClassificationPort [O1 E4]\nclassifyCostItem(name) → (costItemType, semanticTagSlug, confidence, inferenceTrace[])\nshouldMaterializeAsTask(type) → boolean  ★[D27 C7]\n────────────────────────────────────\n推理三步驟不可跳躍 [E5]：\n  ① vector similarity 縮小候選 slug（C11 向量縮範）\n  ② graph traversal 確認 essence_type（C11 Graph 確認）\n  ③ 套用 override 規則（override = IS_A 邊，非 if-else [C7]）\nTaskNode.essence_type [C6]：\n  PHYSICAL_INSTALL / LOGIC_CONFIG / COMPLIANCE\n────────────────────────────────────\nEXECUTABLE  物理施工任務（預設出口）\nMANAGEMENT  行政/品管/職安管理（含 QC Inspection）\nRESOURCE    倉儲/人力資源儲備\nFINANCIAL   付款里程碑/預付款\nPROFIT      利潤項目（利潤）\nALLOWANCE   耗材/差旅/運輸補貼（含差旅、運輸）\n────────────────────────────────────\nsemanticTagSlug 由 VS8 依內容語義掛載（對齊 tagSlug）\n★ EXECUTABLE override 優先：機電檢測/qc test 等施工測試→EXECUTABLE\n無 inferenceTrace 的推理結果禁止進入下游流程 [E6]\n禁止 Firestore 存取・禁止 async\n可在任意 Layer 安全呼叫 [D8]"]
            end
        end

        subgraph VS8_PORTS["4.4 port-interfaces · VS8 對外唯一出口（src/features/semantic-graph.slice/ports）[O1 B3]"]
            direction LR
            PORT_CLASS["ISemanticClassificationPort [O1]\n供 VS5 呼叫成本分類\ncost-item-classifier 實作此介面 [E4]"]
            PORT_SKILL["ISkillMatchPort [O1]\n供 L10 Genkit Flow 呼叫資格推理\nskill-matcher 實作此介面 [E7]"]
            PORT_FEED["ISemanticFeedbackPort [O1]\n供 learning-engine 接收事實事件\n唯一合法：VS3 SkillXpAdded/Deducted\n         + VS5 TaskCompleted [E9]"]
        end
    end

    SEM_REG --> CTA
    SEM_PROTOCOL -.->|"protocol drives lifecycle events"| TAG_EV
    SEM_PROTOCOL -.->|"protocol constrains routing I/O"| VS8_ROUT
    SEM_PROTOCOL -.->|"protocol constrains outbox broadcast"| VS8_IO

    VS8_CL -->|"核心語義變更輸入 [D21-6]"| VS8_SL
    VS8_SL -->|"圖結構輸入 [D21-3 D21-9]"| VS8_NG
    VS8_WIKI -.->|"提案呈遞 BBB [D21-H]"| VS8_GUARD
    VS8_NG -.->|"推理結果 [D21-5]"| VS8_ROUT
    VS8_NG -.->|"事件廣播 [D21-6]"| VS8_IO
    VS8_PLAST -.->|"權重回饋 [D21-G]"| VS8_SL
    VS8_PROJ -.->|"唯讀語義輸出 [T5]"| VS8_ROUT
    CTA -.->|"唯讀引用契約 [D21-7]"| TAG_RO
    CTA -.->|"Deprecated 通知 [D21-8]"| TAG_SG
    VS8_NG -.->|"語義路由授權 [D21-5]"| VS8_RL
    CONS_ENG -.->|"治理通過 → BBB 最終裁決 [D21-I D21-K]"| INV_GUARD
    SKILL_MATCH -.->|"eligible_persons 推理結果 [O3]"| TASK_SEM_V
    CAUSALITY -.->|"因果審計記錄 [O4]"| CAUSAL_LOG
    PORT_CLASS -.->|"介面實作 [O1 E4]"| COST_CLASSIFIER
    PORT_SKILL -.->|"介面實作 [O1 E7]"| SKILL_MATCH
    PORT_FEED -.->|"事實事件驅動 [O1 E9]"| LEARN
end

%% ═══════════════════════════════════════════════════════════════
%% LAYER 3 ── L3 · Domain Slices（領域切片 · VS1–VS8）
%% ── VS1=Identity · VS2=Account · VS3=Skill · VS4=Organization
%% ── VS5=Workspace · VS6=Workforce-Scheduling · VS7=Notification
%% ── VS8=Semantic Graph Engine
%% 語義主幹（邏輯判準）：VS1(登入) → VS2(帳戶) → VS4(組織) → VS5(工作區)
%% 邊界約束：VS3 僅承載「帳戶技能」；VS6 僅承接 VS5 任務/排班提案；VS7 僅承接帳戶通知投影與事件
%% ═══════════════════════════════════════════════════════════════

%% ── VS1 Identity ──
subgraph VS1["🟦 VS1 · Identity Slice（src/features/identity.slice）"]
    direction TB

    AUTH_ID["authenticated-identity"]
    ID_LINK["account-identity-link\nfirebaseUserId ↔ accountId"]

    subgraph VS1_CTX["⚙️ Context Lifecycle（src/features/identity.slice）"]
        ACTIVE_CTX["active-account-context\nTTL = Token 有效期"]
        CTX_MGR["context-lifecycle-manager\n建立：Login\n刷新：OrgSwitched / WorkspaceSwitched\n失效：TokenExpired / Logout"]
        CTX_MGR --> ACTIVE_CTX
    end

    subgraph VS1_CLAIMS["📤 Claims Management（src/features/identity.slice）[S6]"]
        CLAIMS_H["claims-refresh-handler\n唯一刷新觸發點 [E6]\n規範 → [SK_TOKEN_REFRESH_CONTRACT]"]
        CUSTOM_C["custom-claims\n快照聲明 [#5]\nTTL = Token 有效期"]
        TOKEN_SIG["token-refresh-signal\nClaims 設定完成後發出 [S6]"]
        CLAIMS_H --> CUSTOM_C
        CLAIMS_H -->|"Claims 設定完成"| TOKEN_SIG
    end

    EXT_AUTH --> AUTH_ID --> ID_LINK --> CTX_MGR
    AUTH_ID -->|"登入觸發"| CLAIMS_H
end

CUSTOM_C -.->|"快照契約 + TTL"| SK_AUTH_SNAP
AUTH_ID -.->|"uses IAuthService"| I_AUTH

%% ── VS2 Account ──
subgraph VS2["🟩 VS2 · Account Slice（src/features/account.slice）"]
    direction TB

    subgraph VS2_USER["👤 個人帳號域（src/features/account.slice/user.profile + user.wallet）"]
        USER_AGG["user-account.aggregate"]
        WALLET_AGG["wallet.aggregate\n強一致帳本 [#A1]\n[S3: STRONG_READ]"]
        PROFILE["account.profile\nFCM Token（弱一致）"]
    end

    subgraph VS2_ORG["🏢 組織帳號域（src/features/account.slice；org-account aggregate + settings + binding）"]
        ORG_ACC["organization-account.aggregate"]
        ORG_SETT["org-account.settings"]
        ORG_BIND["org-account.binding\nACL 防腐對接 [#A2]"]
    end

    subgraph VS2_GOV["🛡️ 帳號治理域（src/features/account.slice/gov.role + gov.policy）"]
        ACC_ROLE["account-governance.role\n→ tag::role [TE_RL]"]
        ACC_POL["account-governance.policy"]
    end

    subgraph VS2_EV["📢 Account Events + Outbox（src/features/account.slice）[S1]"]
        ACC_EBUS["account-event-bus（in-process）\nAccountCreated / RoleChanged\nPolicyChanged / WalletDeducted / WalletCredited"]
        ACC_OB["acc-outbox [SK_OUTBOX: S1]\nDLQ: RoleChanged/PolicyChanged → SECURITY_BLOCK\n     WalletDeducted → REVIEW_REQUIRED\n     AccountCreated → SAFE_AUTO\nLane: Wallet/Role/Policy → CRITICAL\n      其餘 → STANDARD"]
        ACC_EBUS -->|pending| ACC_OB
    end

    USER_AGG --> WALLET_AGG
    USER_AGG -.->|弱一致| PROFILE
    ORG_ACC --> ORG_SETT & ORG_BIND
    ORG_ACC --> VS2_GOV
    ACC_ROLE & ACC_POL --> ACC_EBUS
    WALLET_AGG -->|"WalletDeducted/Credited"| ACC_EBUS
end

ID_LINK --> USER_AGG & ORG_ACC
ORG_BIND -.->|"ACL [#A2]"| ORG_AGG
ACC_EBUS -.->|"事件契約"| SK_ENV
ACC_ROLE -.->|"role tag 語義"| TE_RL

%% ── VS3 Skill ──
subgraph VS3["🟩 VS3 · Skill XP Slice（src/features/skill-xp.slice）"]
    direction TB

    subgraph VS3_CORE["⚙️ Skill Domain（src/features/skill-xp.slice）"]
        SKILL_AGG["account-skill.aggregate\n【XP 寫入唯一權威】\naccountId / skillId(tagSlug)\nxp / version\n→ tag::skill [TE_SK]\n→ tag::skill-tier [TE_ST]"]
        XP_LED[("account-skill-xp-ledger\nentryId / delta / reason\nsourceId / timestamp [#13]")]
        XP_AWARD["xp-award-policy\n[A17] awardedXp = baseXp × qualityMultiplier × policyMultiplier\n含 min/max clamp，禁止業務端硬寫公式"]
    end

    subgraph VS3_EV["📢 Skill Events + Outbox（src/features/skill-xp.slice）[S1]"]
        SKILL_TASK_SRC["TaskCompleted（from VS5）\nbaseXp + semanticTagSlug"]
        SKILL_QA_SRC["QualityAssessed（from VS5）\nqualityScore"]
        SKILL_EV["SkillXpAdded / SkillXpDeducted\n（含 tagSlug 語義・aggregateVersion）"]
        SKILL_OB["skill-outbox\n[SK_OUTBOX: SAFE_AUTO]\n→ IER STANDARD_LANE"]
        SKILL_EV --> SKILL_OB
    end

    SKILL_TASK_SRC --> XP_AWARD
    SKILL_QA_SRC --> XP_AWARD
    XP_AWARD -->|"deltaXp"| SKILL_AGG
    SKILL_AGG -->|"[#13] 異動必寫 Ledger"| XP_LED
    SKILL_AGG --> SKILL_EV
end

SKILL_AGG -.->|"tagSlug 唯讀引用"| TAG_RO
SKILL_AGG -.->|"skill 語義"| TE_SK
SKILL_AGG -.->|"skill-tier 語義"| TE_ST
SKILL_EV -.->|"事件契約"| SK_ENV
SKILL_EV -.->|"tier 推導契約"| SK_SKILL_TIER

%% ── VS4 Organization ──
subgraph VS4["🟧 VS4 · Organization Slice（src/features/organization.slice）"]
    direction TB

    subgraph VS4_CORE["🏗️ 組織核心域（src/features/organization.slice/core）"]
        ORG_AGG["organization-core.aggregate"]
    end

    subgraph VS4_GOV["🛡️ 組織治理域（src/features/organization.slice/gov.members + gov.partners + gov.policy + gov.teams）"]
        ORG_MBR["org.member（tagSlug 唯讀）\n→ tag::role [TE_RL]\n→ tag::user-level [TE_UL]"]
        ORG_PTR["org.partner（tagSlug 唯讀）\n→ tag::partner [TE_PT]"]
        ORG_TEAM["org.team\n→ tag::team [TE_TM]"]
        ORG_POL["org.policy"]
        ORG_RECOG["org-skill-recognition.aggregate\nminXpRequired / status [#11]"]
    end

    subgraph VS4_TAG["🏷️ Tag 組織作用域（src/features/organization.slice）[S4]"]
        TAG_SUB["tag-lifecycle-subscriber\n訂閱 IER BACKGROUND_LANE\n責任：同步全域標籤變更到組織作用域"]
        ORG_TAG_REG["org-semantic-registry.aggregate\n組織語義字典（task-type/skill-type）\n由 org-task-type-registry + org-skill-type-registry 組成\n命名空間：org:{orgId}:task-type:* / org:{orgId}:skill-type:*"]
        SKILL_POOL[("org-skill-type-dictionary\n組織作用域技能類型字典（可寫 Overlay）\n[S4: TAG_MAX_STALENESS ≤ 30s]")]
        TASK_POOL[("org-task-type-dictionary\n組織作用域任務類型字典（可寫 Overlay）\n[S4: TAG_MAX_STALENESS ≤ 30s]")]
        TALENT[["talent-repository [#16]\nMember + Partner + Team\n→ ORG_ELIGIBLE_VIEW"]]
        TAG_SUB -->|"TagLifecycleEvent"| SKILL_POOL
        TAG_SUB -->|"TagLifecycleEvent"| TASK_POOL
        ORG_TAG_REG --> SKILL_POOL
        ORG_TAG_REG --> TASK_POOL
        ORG_MBR & ORG_PTR & ORG_TEAM --> TALENT
        TALENT -.->|人力來源| SKILL_POOL
        SKILL_POOL -.->|"組織技能標籤投影"| TAG_SNAP
        TASK_POOL -.->|"組織任務標籤投影"| TAG_SNAP
    end

    subgraph VS4_EV["📢 Org Events + Outbox（src/features/organization.slice）[S1]"]
        ORG_EBUS["org-event-bus（in-process）\n【Producer-only [#2]】\nOrgContextProvisioned / MemberJoined\nMemberLeft / SkillRecognitionGranted/Revoked\nPolicyChanged"]
        ORG_OB["org-outbox [SK_OUTBOX: S1]\nDLQ: OrgContextProvisioned → REVIEW_REQUIRED\n     MemberJoined/Left → SAFE_AUTO\n     SkillRecog → REVIEW_REQUIRED\n     PolicyChanged → SECURITY_BLOCK"]
        ORG_EBUS -->|pending| ORG_OB
    end

    ORG_AGG & ORG_POL & ORG_RECOG --> ORG_EBUS
end

ORG_MBR -.->|"role tag 語義"| TE_RL
ORG_MBR -.->|"user-level tag 語義"| TE_UL
ORG_PTR -.->|"partner tag 語義"| TE_PT
ORG_TEAM -.->|"team tag 語義"| TE_TM
ORG_EBUS -.->|"事件契約"| SK_ENV

%% ── VS5 Workspace ──
subgraph VS5["🟣 VS5 · Workspace Slice（src/features/workspace.slice）"]
    direction TB

    ORG_ACL["org-context.acl [E2]\nIER OrgContextProvisioned\n→ Workspace 本地 Context [#10]"]

    subgraph VS5_APP["⚙️ Application Coordinator（src/features/workspace.slice）[#3]"]
        direction LR
        WS_CMD_H["command-handler\n→ SK_CMD_RESULT"]
        WS_SCP_G["scope-guard [#A9]"]
        WS_POL_E["policy-engine"]
        WS_TX_R["transaction-runner\n[#A8] 1cmd / 1agg"]
        WS_OB["ws-outbox\n[SK_OUTBOX: SAFE_AUTO / REVIEW_REQUIRED]\nCRITICAL_LANE: TaskAcceptedConfirmed [#A19 D29]\nSTANDARD_LANE: 一般域事件 [E5]"]
        WS_CMD_H --> WS_SCP_G --> WS_POL_E --> WS_TX_R
        WS_TX_R -->|"pending events [E5]"| WS_OB
    end

    subgraph VS5_CORE["⚙️ Workspace Core Domain（src/features/workspace.slice/core + core.event-bus + core.event-store）"]
        WS_AGG["workspace-core.aggregate"]
        WS_EBUS["workspace-core.event-bus（in-process [E5]）"]
        WS_ESTORE["workspace-core.event-store\n僅重播/稽核 [#9]"]
        WS_SETT["workspace-core.settings"]
    end

    subgraph VS5_GOV["🛡️ Workspace Governance（src/features/workspace.slice/gov.role + gov.audit + gov.members + gov.partners + gov.teams）"]
        WS_ROLE["workspace-governance.role\n繼承 org-policy [#18]\n→ tag::role [TE_RL]"]
        WS_PCHK["policy-eligible-check [#14]\nvia Query Gateway"]
        WS_AUDIT["workspace-governance.audit"]
        AUDIT_COL["audit-event-collector\n訂閱 IER BACKGROUND_LANE\n→ GLOBAL_AUDIT_VIEW"]
        WS_ROLE -.->|"[#18] eligible 查詢"| WS_PCHK
    end

    subgraph VS5_BIZ["⚙️ Business Domain（src/features/workspace.slice/business.{tasks,quality-assurance,acceptance,finance,daily,document-parser,files,issues,workflow}，A+B 雙軌）"]
        direction TB

        subgraph VS5_PARSE["📄 文件解析三層閉環（src/features/workspace.slice/business.document-parser）[Layer-1 → Layer-2 → Layer-3]"]
            W_FILES["workspace.files"]
            W_PARSER["document-parser\nLayer-1 原始解析\n→ raw ParsedLineItem[]\n+ classifyCostItem() [VS8 Layer-2]\n→ ParsedLineItem.(costItemType, semanticTagSlug)"]
            PARSE_INT[("ParsingIntent\nDigital Twin [#A4]\nlineItems[].(costItemType, semanticTagSlug, sourceIntentIndex)\n（Layer-2 語義標注 + 來源索引）")]
            W_FILES -.->|原始檔案| W_PARSER --> PARSE_INT
        end

        subgraph VS5_WF["⚙️ Workflow State Machine（src/features/workspace.slice/business.workflow）[R6]"]
            WF_AGG["workflow.aggregate\n狀態合約：Draft→InProgress→QA\n→Acceptance(ACCEPTED via Validator)→Completed\n[#A19] 收斂條件：所有關聯 Finance_Request.status = PAID（由 task-finance-label-view 投影反映）\nblockedBy: Set‹issueId›\n[#A3] blockedBy.isEmpty() 才可 unblock\n[注] Finance 獨立生命週期由 VS9 Finance Slice 管理"]
        end

        subgraph VS5_A["🟢 A-track 主流程（src/features/workspace.slice/business.tasks + business.quality-assurance + business.acceptance）"]
            direction LR
            A_ITEMS["workspace.items\n來源事項（Source of Work）\n保留 sourceIntentIndex"]
            A_TASKS["tasks\n狀態：IN_PROGRESS"]
            A_QA["quality-assurance\n狀態：PENDING_QUALITY"]
            A_ACCEPT["acceptance\n狀態：PENDING_ACCEPTANCE"]
            A_VALIDATOR["task-accepted-validator [#A19]\n內部守衛：檢查驗收簽核 + 品質合格證\n禁止外部服務直接變更任務狀態"]
            A_ACCEPTED["tasks.ACCEPTED [#A19 D29]\n發出 TaskAcceptedConfirmed 事件\n（同一 L2 Firestore TX 原子寫入）"]
        end

        subgraph VS5_FIN["💰 Finance 事件橋接（src/features/workspace.slice/business.finance）[#A19 #A20]"]
            direction TB
            FIN_BRIDGE["TaskAcceptedConfirmed 事件橋\n[#A19] 任務到達 ACCEPTED 狀態後\n→ ws-outbox（CRITICAL_LANE）\n→ L4 IER → VS9 Finance_Staging_Pool\n[#A20] 可計費任務自動轉錄至 Finance_Staging_Pool\n（禁止 VS5 直接呼叫 VS9 API）"]
            FIN_LABEL["task-finance-label（展示層）\n[#A22] 消費 task-finance-label-view 投影\n顯示：已驗收 ｜ 金融狀態標籤（REQ-001 / 審核中）"]
        end

        subgraph VS5_B["🔴 B-track 異常處理（src/features/workspace.slice/business.issues）"]
            B_ISSUES{{"issues"}}
        end

        W_DAILY["daily\n施工日誌"]
        W_SCHED["workspace.schedule（WorkspaceSchedule）\n任務時間化（有時間）\nWorkspaceScheduleProposed（僅提案）\nTask → WorkspaceSchedule 單向橋接 [D27-Order #A5]"]

        PARSE_INT -->|"[Layer-3 Semantic Router]\nshouldMaterializeAsTask(costItemType) [D27-Gate]\n先形成 WorkspaceItem"| A_ITEMS
        A_ITEMS -->|"僅 EXECUTABLE 事項可物化任務\n保留 sourceIntentIndex 排序 [D27-Order]"| A_TASKS
        PARSE_INT -.->|"財務候選資料（非階段遷移）"| FIN_BRIDGE
        PARSE_INT -->|解析異常| B_ISSUES
        A_TASKS -.->|"SourcePointer [#A4]"| PARSE_INT
        PARSE_INT -.->|"IntentDeltaProposed [#A4]"| A_TASKS
        WF_AGG -.->|stage-view| A_TASKS & A_QA & A_ACCEPT
        A_TASKS --> A_QA --> A_ACCEPT --> A_VALIDATOR --> A_ACCEPTED
        A_ACCEPTED -.->|"TaskAcceptedConfirmed（CRITICAL_LANE）[#A19 D29]"| FIN_BRIDGE
        A_ACCEPTED -.->|"task-finance-label-view 投影反映"| FIN_LABEL
        WF_AGG -->|"blockWorkflow [#A3]"| B_ISSUES
        A_TASKS -.-> W_DAILY
        A_TASKS -.->|任務分配提案（Task→Schedule）| W_SCHED
        W_SCHED -.->|"WorkspaceScheduleProposed [#A5]"| SCH_SAGA
        PARSE_INT -.->|"職能需求 T4"| W_SCHED
    end

    ORG_ACL -.->|本地 Org Context| VS5_APP
    B_ISSUES -->|IssueResolved| WS_EBUS
    WS_EBUS -.->|"blockedBy.delete(issueId) [#A3]"| WF_AGG
    WS_TX_R -->|"[#A8]"| WS_AGG
    WS_TX_R -.->|執行業務邏輯| VS5_BIZ
    WS_AGG --> WS_ESTORE
    WS_AGG -->|"in-process [E5]"| WS_EBUS
end

W_FILES -.->|"uses IFileStore"| I_STORE
WS_EBUS -.->|"事件契約"| SK_ENV
WS_ROLE -.->|"role tag 語義"| TE_RL
WS_PCHK -.->|"[#14]"| QGWAY_SCHED
WS_CMD_H -.->|"執行結果"| SK_CMD_RESULT
W_SCHED -.->|"tagSlug T4"| TAG_RO
W_SCHED -.->|"人力需求契約"| SK_SKILL_REQ
A_TASKS -.->|"TaskCompleted(baseXp, semanticTagSlug) [A17]"| SKILL_TASK_SRC
A_QA -.->|"QualityAssessed(qualityScore) [A17]"| SKILL_QA_SRC
XP_AWARD -.->|"semanticTag policy lookup [D21-7 T5]"| TAG_RO

%% ── VS6 Workforce Scheduling ──
subgraph VS6["🟨 VS6 · Workforce Scheduling Slice（src/features/workforce-scheduling.slice · 排班協作）"]
    direction TB

    subgraph VS6_CMD_LAYER["⚙️ Command Layer（src/features/workforce-scheduling.slice，寫側）"]
        SCH_CMD["schedule-command-handler\n僅接收排班命令（禁止 UI 直寫）\n回傳 SK_CMD_RESULT"]
        SCH_CONFLICT["schedule-conflict-checker\n時間/資源衝突檢查（寫側守門）"]
        ORG_SCH["organization.schedule.aggregate（OrganizationSchedule）\n人力指派聚合（依 workspace schedule 提案）\nHR Scheduling (tagSlug T4)\n先驗證 SK_SKILL_REQ + TAG_STALE_GUARD\n事件帶 aggregateVersion [R7]"]
        SCH_CMD --> SCH_CONFLICT --> ORG_SCH
    end

    subgraph VS6_SAGA["⚙️ Workforce-Scheduling Saga（src/features/workforce-scheduling.slice）[#A5]"]
        SCH_SAGA["workforce-scheduling-saga\n接收 WorkspaceScheduleProposed\neligibility check [#14]\ncompensating:\n  ScheduleAssignRejected\n  ScheduleProposalCancelled\n（需求引導執行，執行引導協作）"]
    end

    subgraph VS6_OB["📤 Schedule Outbox（src/features/workforce-scheduling.slice）[S1]"]
        SCH_OB["sched-outbox\n[SK_OUTBOX: S1]\nDLQ: ScheduleAssigned → REVIEW_REQUIRED\n     Compensating Events → SAFE_AUTO"]
    end

    ORG_SCH -.->|"[#14] 只讀 eligible=true"| QGWAY_SCHED
    ORG_SCH -.->|"能力/視覺只讀 tag-snapshot [VS8-Tag T5]"| TAG_RO
    ORG_SCH -.->|"tagSlug 新鮮度校驗"| TAG_SG
    ORG_SCH -->|"ScheduleAssigned + aggregateVersion"| SCH_OB
    ORG_SCH -.->|"人力需求契約"| SK_SKILL_REQ
    SCH_SAGA -->|compensating event| SCH_OB
    SCH_SAGA -.->|"協調 handleScheduleProposed"| SCH_CMD
end

%% ── VS7 Notification（Cross-cutting Authority · 反應中樞）──
subgraph VS7["🩷 VS7 · Notification Hub（src/features/notification-hub.slice · 跨切片權威）"]
    direction TB

    NOTIF_R["notification-router\n無狀態路由 [#A10]\n消費 IER STANDARD_LANE\nScheduleAssigned [E3]\n從 envelope 讀取 traceId [R8]"]
    NOTIF_EXIT["notification-hub._services.ts\nNOTIF_EXIT（唯一副作用出口）\n標籤感知路由策略\n對接 VS8 語義索引\n#channel:slack → Slack\n#urgency:high → 電話"]

    subgraph VS7_DEL["📤 Delivery（src/features/notification-hub.slice）"]
        USER_NOTIF["src/features/notification-hub.slice/domain.notification\n個人推播 + RTDB 即時通知串流"]
        USER_DEV["使用者裝置"]
        USER_NOTIF --> USER_DEV
    end

    NOTIF_R -->|TargetAccountID 匹配| NOTIF_EXIT
    NOTIF_EXIT -->|路由策略決定| USER_NOTIF
    PROFILE -.->|"FCM Token（唯讀）"| USER_NOTIF
end

NOTIF_EXIT -.->|"uses IMessaging [R8]"| I_MSG
USER_NOTIF -.->|"[#6] RTDB 即時通知串流（低延遲 · L7-A RTDBAdapter）"| QGWAY_NOTIF
NOTIF_EXIT -.->|"標籤感知路由"| VS8

%% ── VS9 Finance（工作區任務金融聚合閘道）──
subgraph VS9["💳 VS9 · Finance Slice（src/features/finance.slice · 金融聚合閘道）"]
    direction TB

    FIN_STAGING_ACL["finance-staging.acl [#A20]\n消費 IER CRITICAL_LANE TaskAcceptedConfirmed\n若任務標註為可計費 → 轉錄至 Finance_Staging_Pool\n事實轉錄含：taskId, amount, tags, traceId, acceptedAt"]

    subgraph VS9_POOL["💼 Finance Staging Pool（src/features/finance.slice/staging-pool）[#A20]"]
        direction LR
        FIN_STAGE_POOL[("Finance_Staging_Pool\nL5 Standard Projection [#A20]\n狀態：PENDING（已驗收未請款）| LOCKED_BY_FINANCE（打包中）\n欄位：taskId, amount, tags, traceId, acceptedAt, status")]
    end

    subgraph VS9_CMD["✍ Finance Command Layer（src/features/finance.slice/application）"]
        direction LR
        FIN_REQ_CMD["create-bulk-payment-command-handler\n接收 CreateBulkPaymentCommand\n打包任意數量任務\n打包後 Finance_Staging_Pool 中任務狀態 → LOCKED_BY_FINANCE [#A20]\n防止重複請款"]
    end

    subgraph VS9_AGG["⚙️ Finance Request Aggregate（src/features/finance.slice/core）[#A21]"]
        direction TB
        FIN_REQ_AGG["finance-request.aggregate [#A21]\n每筆打包動作生成一個 Finance_Request\n狀態機：DRAFT → AUDITING → DISBURSING → PAID\nbundledTaskIds[]（1:N 溯源關係）\ntraceId 繼承自觸發命令\n[S3] 狀態精確讀取 → STRONG_READ"]
    end

    subgraph VS9_EV["📢 Finance Events + Outbox（src/features/finance.slice）[S1]"]
        FIN_OB["finance-outbox\n[SK_OUTBOX: REVIEW_REQUIRED]\nFinanceRequestStatusChanged → STANDARD_LANE\n[D29] Finance_Request 狀態變更與 Outbox 寫入同一 Firestore TX"]
    end

    FIN_STAGING_ACL -->|"PENDING 轉錄"| FIN_STAGE_POOL
    FIN_STAGE_POOL -->|"打包選取 [#A20]"| FIN_REQ_CMD
    FIN_REQ_CMD -->|"CreateBulkPaymentCommand"| FIN_REQ_AGG
    FIN_REQ_AGG --> FIN_OB
end

%% 所有 OUTBOX → RELAY
ACC_OB & ORG_OB & SCH_OB & SKILL_OB & TAG_OB & WS_OB & FIN_OB -.->|"被 RELAY 掃描 [R1]"| RELAY

%% Outbox Lane Declarations
ACC_OB -->|"CRITICAL_LANE: Role/Policy/Wallet"| IER
ACC_OB -->|"STANDARD_LANE: AccountCreated"| IER
ORG_OB -->|"CRITICAL_LANE: OrgContextProvisioned・PolicyChanged"| IER
ORG_OB -->|"STANDARD_LANE: MemberJoined/Left・SkillRecog"| IER
SKILL_OB -->|"STANDARD_LANE"| IER
SCH_OB -->|"STANDARD_LANE"| IER
WS_OB -->|"CRITICAL_LANE: TaskAcceptedConfirmed [#A19]"| IER
WS_OB -->|"STANDARD_LANE [E5]"| IER
FIN_OB -->|"STANDARD_LANE: FinanceRequestStatusChanged [#A22]"| IER
TAG_OB -->|"BACKGROUND_LANE"| IER

%% IER → Domain Slice 消費
CRIT_LANE -.->|"RoleChanged/PolicyChanged [S6]"| CLAIMS_H
CRIT_LANE -.->|"OrgContextProvisioned [E2]"| ORG_ACL
CRIT_LANE -.->|"TaskAcceptedConfirmed [#A19 #A20]"| FIN_STAGING_ACL
ORG_EBUS -.->|"OrgContextProvisioned 事件來源 [E2]"| ORG_ACL
STD_LANE -.->|"ScheduleAssigned [E3]"| NOTIF_R
STD_LANE -.->|"ScheduleProposed [#A5]"| SCH_SAGA
STD_LANE -.->|"FinanceRequestStatusChanged [#A22]"| TASK_FIN_LABEL_V
BG_LANE -.->|"TagLifecycleEvent [T1]"| TAG_SUB
BG_LANE -.->|"跨片稽核"| AUDIT_COL

%% ═══════════════════════════════════════════════════════════════
%% CONNECTIVITY STITCH ZONE（集中連線區塊，避免線段分散）
%% ═══════════════════════════════════════════════════════════════

FUNNEL -.->|"uses IFirestoreRepo [S2]"| I_REPO
WS_SCOPE_V -.->|"快照契約"| SK_AUTH_SNAP
ACC_PROJ_V -.->|"快照契約"| SK_AUTH_SNAP
SKILL_V -.->|"tier 推導"| SK_SKILL_TIER
ORG_ELIG_V -.->|"skill tag 語義"| TE_SK
ORG_ELIG_V -.->|"skill-tier tag 語義"| TE_ST
AUDIT_COL -.->|"跨片稽核"| AUDIT_V

%% ── Connectivity A: Query Spine（L5 → L6）──
READ_REG -.->|"版本目錄"| QGWAY
ORG_ELIG_V -.-> QGWAY_SCHED
CAL_PROJ -.-> QGWAY_CAL_DAY
CAL_PROJ -.-> QGWAY_CAL_ALL
TL_PROJ -.-> QGWAY_TL_MEMBER
TL_PROJ -.-> QGWAY_TL_ALL
ACC_PROJ_V -.-> QGWAY_NOTIF
WS_SCOPE_V -.-> QGWAY_SCOPE
WALLET_V -.-> QGWAY_WALLET
TAG_SNAP -.-> QGWAY_SEARCH
SEM_GOV_V -.-> QGWAY_SEM_GOV
FINANCE_STAGE_V -.-> QGWAY_FIN_STAGE
TASK_FIN_LABEL_V -.-> QGWAY_FIN_LABEL
ACTIVE_CTX -->|"查詢鍵"| QGWAY_SCOPE
SK_AUTH_SNAP -.->|"AuthoritySnapshot 契約 [#A9]"| CBG_AUTH

%% ── Connectivity B: VS0 Foundation（VS0-Kernel ↔ VS0-Infra ↔ L8）──
AUTH_ADP -.->|"implements"| I_AUTH
FSTORE_ADP -.->|"implements [S2]"| I_REPO
FCM_ADP -.->|"implements [R8]"| I_MSG
STORE_ADP -.->|"implements"| I_STORE
SK_PORTS -.->|"contract bridge"| AC_TRANSLATOR_L7
SK_INFRA -.->|"S2/R8/S4 規則約束"| FIREBASE_ACL
SK_INFRA -.->|"D25 高權限/跨租戶/排程"| FIREBASE_BACKEND
AUTH_ADP --> F_AUTH
FSTORE_ADP --> F_DB
RTDB_ADP --> F_RTDB
FCM_ADP --> F_FCM
STORE_ADP --> F_STORE
ANALYTICS_ADP --> F_ANALYTICS
APPCHK_ADP --> F_APPCHK
BFN_GW --> F_FUNCTIONS
ADMIN_AUTH_ADP --> F_AUTH
ADMIN_DB_ADP --> F_DB
ADMIN_MSG_ADP --> F_FCM
ADMIN_STORE_ADP --> F_STORE
ADMIN_APPCHK_ADP --> F_APPCHK
BDC_GW --> F_DC

EXT_CLIENT -.->|"UI 行為遙測（GA events）"| ANALYTICS_ADP
EXT_WEBHOOK --> BFN_GW
CBG_ROUTE -.->|"高權限/批次協調入口"| BFN_GW
QGWAY -.->|"治理化 GraphQL 查詢契約"| BDC_GW

%% ── Connectivity C: Observability（L2/L4/L5 → L9）──
CBG_ENTRY --> TRACE_ID
IER --> DOMAIN_METRICS
FUNNEL --> DOMAIN_METRICS
RELAY -.->|"relay_lag metrics"| DOMAIN_METRICS
RATE_LIM -.->|"hit metrics"| DOMAIN_METRICS
CIRCUIT -.->|"open/half-open"| DOMAIN_METRICS
WS_TX_R --> DOMAIN_ERRORS
SCH_SAGA --> DOMAIN_ERRORS
DLQ_B -.->|"安全告警"| DOMAIN_ERRORS
TAG_SG -.->|"StaleTagWarning"| DOMAIN_ERRORS
TOKEN_SIG -.->|"Claims 刷新成功 [S6]"| DOMAIN_METRICS

%% ── Connectivity D: Visualization Bus（L5 投影 → Firebase L8 → vis-data DataSet 快取 → vis-* renderer）[D28]──
TASK_V -.->|"[D28] tasks-view（任務節點）"| VIS_DATA_ADP
WS_GRAPH_V -.->|"[D28] workspace-graph-view（nodes/edges）"| VIS_DATA_ADP
TL_PROJ -.->|"[D28] schedule-timeline-view（timeline items）"| VIS_DATA_ADP
SEM_GOV_V -.->|"[D28] semantic-governance-view（3D graph）"| VIS_DATA_ADP

%% ── Global Search（Cross-cutting Authority · 語義門戶）──
GLOBAL_SEARCH["🔍 Global Search（src/features/global-search.slice · 跨切片權威）\nL6 Query Gateway 核心消費者\n語義化索引檢索\n唯一跨域搜尋權威\n對接 VS8 語義索引\nCmd+K 唯一服務提供者\n_actions.ts / _services.ts [D26]"]
GLOBAL_SEARCH -->|"語義化索引檢索"| QGWAY_SEARCH
GLOBAL_SEARCH -.->|"queries VS8 semantic index [D26]"| VS8

%% ── VS8 Semantic Graph 跨切片語義提供 ──
VS8 -.->|"語義投影輸出（唯讀）"| TAG_SNAP
VS5 -.->|"語義讀取僅經 L6 [D21-7 T5]"| QGWAY_SEARCH
VS6 -.->|"語義讀取僅經 L6 [D21-7 T5]"| QGWAY_SEARCH
COST_CLASSIFIER -.->|"classifyCostItem() [Layer-2 D27 #A14]"| W_PARSER

%% ═══════════════════════════════════════════════════════════════
%% MAIN FLOW：外部入口 → 閘道 → 切片
%% ═══════════════════════════════════════════════════════════════

EXT_CLIENT --> RATE_LIM
EXT_WEBHOOK --> RATE_LIM
CBG_ROUTE -->|"Workspace Command"| WS_CMD_H
CBG_ROUTE -->|"Skill Command"| SKILL_AGG
CBG_ROUTE -->|"Org Command"| ORG_AGG
CBG_ROUTE -->|"Account Command"| USER_AGG
CBG_ROUTE -->|"Finance Command [#A21]"| FIN_REQ_CMD

%% ═══════════════════════════════════════════════════════════════
%% STYLES
%% ═══════════════════════════════════════════════════════════════

classDef sk fill:#ecfeff,stroke:#22d3ee,color:#000,font-weight:bold
classDef skInfra fill:#f0f9ff,stroke:#0369a1,color:#000,font-weight:bold
classDef skAuth fill:#fdf4ff,stroke:#7c3aed,color:#000,font-weight:bold
classDef tagAuth fill:#cffafe,stroke:#0891b2,color:#000,font-weight:bold
classDef tagEnt fill:#ecfdf5,stroke:#059669,color:#000,font-weight:bold,stroke-width:2px
classDef infraPort fill:#e0f7fa,stroke:#00838f,color:#000,font-weight:bold
classDef identity fill:#dbeafe,stroke:#93c5fd,color:#000
classDef ctxNode fill:#eff6ff,stroke:#1d4ed8,color:#000,font-weight:bold
classDef claimsNode fill:#dbeafe,stroke:#1d4ed8,color:#000,font-weight:bold
classDef tokenSig fill:#fef3c7,stroke:#d97706,color:#000,font-weight:bold
classDef account fill:#dcfce7,stroke:#86efac,color:#000
classDef outboxNode fill:#fef3c7,stroke:#d97706,color:#000,font-weight:bold
classDef relay fill:#f0fdf4,stroke:#15803d,color:#000,font-weight:bold
classDef skillSlice fill:#bbf7d0,stroke:#22c55e,color:#000
classDef orgSlice fill:#fff7ed,stroke:#fdba74,color:#000
classDef tagSub fill:#fef9c3,stroke:#ca8a04,color:#000,font-weight:bold
classDef wsSlice fill:#ede9fe,stroke:#c4b5fd,color:#000
classDef wfNode fill:#fdf4ff,stroke:#9333ea,color:#000,font-weight:bold
classDef cmdResult fill:#f0fdf4,stroke:#16a34a,color:#000,font-weight:bold
classDef schedSlice fill:#fef9c3,stroke:#ca8a04,color:#000
classDef notifSlice fill:#fce7f3,stroke:#db2777,color:#000
classDef critProj fill:#fee2e2,stroke:#dc2626,color:#000,font-weight:bold
classDef stdProj fill:#fef9c3,stroke:#d97706,color:#000
classDef eligGuard fill:#fee2e2,stroke:#b91c1c,color:#000,font-weight:bold
classDef auditView fill:#f0fdf4,stroke:#15803d,color:#000,font-weight:bold
classDef gateway fill:#f8fafc,stroke:#334155,color:#000,font-weight:bold
classDef guardLayer fill:#fff1f2,stroke:#e11d48,color:#000,font-weight:bold
classDef cmdGw fill:#eff6ff,stroke:#2563eb,color:#000
classDef eventGw fill:#fff7ed,stroke:#ea580c,color:#000
classDef critLane fill:#fee2e2,stroke:#dc2626,color:#000,font-weight:bold
classDef stdLane fill:#fef9c3,stroke:#ca8a04,color:#000
classDef bgLane fill:#f1f5f9,stroke:#64748b,color:#000
classDef dlqNode fill:#fca5a5,stroke:#b91c1c,color:#000,font-weight:bold
classDef dlqSafe fill:#d1fae5,stroke:#059669,color:#000,font-weight:bold
classDef dlqReview fill:#fef9c3,stroke:#ca8a04,color:#000,font-weight:bold
classDef dlqBlock fill:#fca5a5,stroke:#b91c1c,color:#000,font-weight:bold
classDef qgway fill:#f0fdf4,stroke:#15803d,color:#000
classDef staleGuard fill:#fef3c7,stroke:#b45309,color:#000,font-weight:bold
classDef obs fill:#f1f5f9,stroke:#64748b,color:#000
classDef trackA fill:#d1fae5,stroke:#059669,color:#000
classDef tierFn fill:#fdf4ff,stroke:#9333ea,color:#000
classDef talent fill:#fff1f2,stroke:#f43f5e,color:#000
classDef serverAct fill:#fed7aa,stroke:#f97316,color:#000
classDef aclAdapter fill:#fce4ec,stroke:#ad1457,color:#000,font-weight:bold
classDef firebaseExt fill:#fff9c4,stroke:#f9a825,color:#000,font-weight:bold
classDef semanticGraph fill:#e0e7ff,stroke:#4f46e5,color:#000,font-weight:bold
classDef crossCutAuth fill:#fde68a,stroke:#b45309,color:#000,font-weight:bold,stroke-width:3px

class SK,SK_ENV,SK_AUTH_SNAP,SK_SKILL_TIER,SK_SKILL_REQ,SK_CMD_RESULT,SK_OBS_PATH sk
class SK_OUTBOX,SK_VERSION,SK_READ,SK_STALE,SK_RESILIENCE skInfra
class SK_TOKEN skAuth
class CTA,TAG_EV,TAG_RO tagAuth
class TE_UL,TE_SK,TE_ST,TE_TM,TE_RL,TE_PT tagEnt
class TAG_SG staleGuard
class TAG_OB outboxNode
class SK_PORTS,I_AUTH,I_REPO,I_MSG,I_STORE infraPort
class VS1,AUTH_ID,ID_LINK identity
class ACTIVE_CTX,CTX_MGR ctxNode
class CLAIMS_H,CUSTOM_C claimsNode
class TOKEN_SIG tokenSig
class VS2,USER_AGG,WALLET_AGG,PROFILE,ORG_ACC,ORG_SETT,ORG_BIND,ACC_ROLE,ACC_POL,ACC_EBUS account
class ACC_OB outboxNode
class VS3,SKILL_AGG,XP_LED skillSlice
class SKILL_EV,SKILL_OB skillSlice
class VS4,ORG_AGG,ORG_MBR,ORG_PTR,ORG_TEAM,ORG_POL,ORG_RECOG,ORG_EBUS orgSlice
class TAG_SUB tagSub
class ORG_OB outboxNode
class VS5,WS_CMD_H,WS_SCP_G,WS_POL_E,WS_TX_R,WS_OB,WS_AGG,WS_EBUS,WS_ESTORE,WS_SETT,WS_ROLE,WS_PCHK,WS_AUDIT wsSlice
class WF_AGG wfNode
class AUDIT_COL auditView
class A_ITEMS,A_TASKS,A_QA,A_ACCEPT,A_VALIDATOR,A_ACCEPTED trackA
class FIN_BRIDGE,FIN_LABEL wfNode
class B_ISSUES,W_DAILY,W_SCHED wsSlice
class VS6,SCH_CMD,SCH_CONFLICT,ORG_SCH,SCH_SAGA schedSlice
class SCH_OB outboxNode
class VS7,NOTIF_R,USER_NOTIF,USER_DEV notifSlice
class UNIFIED_GW,CQRS_WRITE,CQRS_READ,GW_GUARD,GW_PIPE gateway
class RATE_LIM,CIRCUIT,BULKHEAD guardLayer
class CMD_API_GW,CBG_ENTRY,CBG_AUTH,CBG_ROUTE cmdGw
class GW_IER,IER_CORE,IER eventGw
class RELAY relay
class CRIT_LANE critLane
class STD_LANE stdLane
class BG_LANE bgLane
class DLQ dlqNode
class DLQ_S dlqSafe
class DLQ_R dlqReview
class DLQ_B dlqBlock
class QRY_API_GW,GW_QUERY,QGWAY,QGWAY_SCHED,QGWAY_CAL_DAY,QGWAY_CAL_ALL,QGWAY_TL_MEMBER,QGWAY_TL_ALL,QGWAY_NOTIF,QGWAY_SCOPE,QGWAY_WALLET,QGWAY_SEARCH,QGWAY_SEM_GOV,QGWAY_FIN_STAGE,QGWAY_FIN_LABEL qgway
class PROJ_BUS,FUNNEL,PROJ_VER,READ_REG stdProj
class CRIT_PROJ,WS_SCOPE_V,ORG_ELIG_V,WALLET_V critProj
class STD_PROJ,WS_PROJ,ACC_SCHED_V,CAL_PROJ,TL_PROJ,ACC_PROJ_V,ORG_PROJ_V,SKILL_V,TASK_V,WS_GRAPH_V,FINANCE_STAGE_V,TASK_FIN_LABEL_V stdProj
class AUDIT_V auditView
class TAG_SNAP tagSub
class TIER_FN tierFn
class TALENT talent
class OBS_LAYER,OBS_PATH,TRACE_ID,DOMAIN_METRICS,DOMAIN_ERRORS obs
class FIREBASE_L7,FIREBASE_ACL,AC_TRANSLATOR_L7,AUTH_ADP,FSTORE_ADP,RTDB_ADP,FCM_ADP,STORE_ADP,ANALYTICS_ADP aclAdapter
class APPCHK_ADP,VIS_DATA_ADP aclAdapter
class FIREBASE_BACKEND,BFN_GW,BDC_GW,ADMIN_ADPTS,ADMIN_AUTH_ADP,ADMIN_DB_ADP,ADMIN_MSG_ADP,ADMIN_STORE_ADP,ADMIN_APPCHK_ADP aclAdapter
class FIREBASE_EXT,F_AUTH,F_DB,F_RTDB,F_FCM,F_STORE,F_ANALYTICS,F_APPCHK,F_DC,F_FUNCTIONS firebaseExt
class EXT_CLIENT,EXT_AUTH,EXT_WEBHOOK serverAct
class VS8 semanticGraph
class GLOBAL_SEARCH crossCutAuth
class NOTIF_EXIT crossCutAuth
class VS9,FIN_STAGING_ACL,FIN_STAGE_POOL,FIN_REQ_CMD,FIN_REQ_AGG,FIN_OB crossCutAuth

%%  ╔══════════════════════════════════════════════════════════════════════════╗
%%  ║  CONSISTENCY INVARIANTS 完整索引                                         ║
%%  ╠══════════════════════════════════════════════════════════════════════════╣
%%  #1   每個 BC 只能修改自己的 Aggregate
%%  #2   跨 BC 僅能透過 Event / Projection / ACL 溝通
%%  #3   Application Layer 只協調，不承載領域規則
%%  #4a  Domain Event 僅由 Aggregate 產生（唯一生成者）
%%  #4b  TX Runner 只投遞 Outbox，不產生 Domain Event（分工界定）
%%  #5   Custom Claims 只做快照，非真實權限來源
%%  #6   Notification 只讀 Projection
%%  #7   Scope Guard 僅讀本 Context Read Model
%%  #8   Shared Kernel 必須顯式標示；未標示跨 BC 共用視為侵入
%%  #9   Projection 必須可由事件完整重建
%%  #10  任一模組需外部 Context 內部狀態 = 邊界設計錯誤
%%  #11  XP 屬 Account BC；Organization 只設門檻
%%  #12  Tier 永遠是推導值，不存 DB
%%  #13  XP 異動必須寫 Ledger
%%  #14  Schedule 只讀 ORG_ELIGIBLE_MEMBER_VIEW
%%  #15  eligible 生命週期：joined→true · assigned→false · completed/cancelled→true
%%  #16  Talent Repository = member + partner + team
%%  #17  centralized-tag.aggregate 為 tagSlug 唯一真相
%%  #18  workspace-governance role 繼承 policy 硬約束
%%  #19  所有 Projection 更新必須以 aggregateVersion 單調遞增為前提 [S2 泛化]
%%  ╠══════════════════════════════════════════════════════════════════════════╣
%%  ATOMICITY AUDIT 完整索引
%%  #A1  wallet 強一致；profile/notification 弱一致
%%  #A2  org-account.binding 只 ACL/projection 防腐對接
%%  #A3  blockWorkflow → blockedBy Set；allIssuesResolved → unblockWorkflow
%%  #A4  ParsingIntent 只允許提議事件
%%  #A5  schedule 跨 BC saga/compensating event
%%  #A6  全域語義權威 = VS8 CENTRALIZED_TAG_AGGREGATE；組織任務類型/技能類型擴展權威 = VS4 org-semantic-registry [D21-1]
%%  #A7  Event Funnel 只做 compose
%%  #A8  TX Runner 1cmd/1agg 原子提交
%%  #A9  Scope Guard 快路徑；高風險回源 aggregate
%%  #A10 Notification Router 無狀態路由
%%  #A11 eligible = 「無衝突排班」快照，非靜態狀態
%%  #A12 Global Search = 跨切片權威（語義門戶），唯一跨域搜尋出口，禁止各 Slice 自建搜尋邏輯
%%  #A13 Notification Hub = 跨切片權威（反應中樞），唯一副作用出口，業務 Slice 只產生事件不決定通知策略
%%  #A14 Cost Semantic 雙鍵分類（Layer-2）= VS8 _cost-classifier.ts 純函式輸出 (costItemType, semanticTagSlug)；
%%       VS5 Layer-3 Semantic Router = use-workspace-event-handler，
%%       僅 EXECUTABLE 項目物化為 tasks；其餘六類靜默跳過並 toast [D27]
%%  #A15 Finance 進入閘門：任務必須達到 ACCEPTED（通過 task-accepted-validator [#A19]）才可進入 Finance Staging Pool；
%%       Finance 獨立生命週期由 VS9 管理（Finance_Request：DRAFT→AUDITING→DISBURSING→PAID [#A21]）
%%  #A16 （已由 #A21 升級取代）Finance_Request 生命週期合約；
%%       Workflow Completed 條件為所有關聯 Finance_Request.status = PAID；
%%       禁止在新工作中引用 #A16；舊的 Multi-Claim 循環邏輯已遷移至 VS9 Finance_Request 狀態機
%%  #A17 Skill XP Award contract：XP 僅能由 VS3 寫入；來源必須為 VS5 的 TaskCompleted(baseXp, semanticTagSlug)
%%       與 QualityAssessed(qualityScore) 事實事件；計算公式 awardedXp = baseXp × qualityMultiplier × policyMultiplier（含 clamp）
%%       VS8 僅提供語義標籤與政策查詢，禁止直接寫入 XP ledger
%%  #A18 Org Semantic Dictionary Extension contract：組織可新建 task-type/skill-type 語義；必須走 VS4 org-semantic-registry（org-task-type-registry + org-skill-type-registry），並以 org namespace 寫入 tag-snapshot
%%  ╠══════════════════════════════════════════════════════════════════════════╣
%%  TAG SEMANTICS 擴展規則（VS8 · 四層語義引擎擴展規則 [D21-1~D21-10 + D21-A~D21-X]）
%%  T1  新切片訂閱 TagLifecycleEvent（BACKGROUND_LANE）即可擴展 [D21-6]
%%  T2  ORG_SKILL_TYPE_DICTIONARY / ORG_TASK_TYPE_DICTIONARY = 組織作用域可寫 Overlay（來源：VS8 全域 + VS4 組織語義字典）
%%  T3  ORG_ELIGIBLE_MEMBER_VIEW.skills{tagSlug→xp} 交叉快照
%%  T4  排班職能需求 = SK_SKILL_REQ × Tag Authority tagSlug [D21-5]
%%  T5  TAG_SNAPSHOT 消費方禁止寫入 [D21-7]；DocumentParser UI 視覺屬性必須由 semantic-graph.slice 投影讀取
%%      語義治理頁（wiki/proposal/relationship）顯示資料同樣必須走 L5 projection.semantic-governance-view → L6 Query Gateway
%%  T6  突觸層（VS8_SL）寫入只能透過 semantic-edge-store.addEdge()；禁止直接操作 _edges 內部狀態 [D21-9]
%%  T7  findIsolatedNodes 在每次 addEdge/removeEdge 後由 VS8_NG 非同步觸發，孤立節點寫入 Observability [D21-10]
%%  T8  組織新建語義僅限 task-type/skill-type 類別，且必須使用 org namespace tagSlug（org:{orgId}:task-type:* / org:{orgId}:skill-type:*），避免污染全域語義空間
%%  ╠══════════════════════════════════════════════════════════════════════════╣
%%  SEMANTIC TAG ENTITIES 索引（AI-ready Semantic Graph）
%%  TE1 TAG_USER_LEVEL  tag::user-level    → tagSlug: user-level:{slug}
%%  TE2 TAG_SKILL       tag::skill         → tagSlug: skill:{slug}
%%  TE3 TAG_SKILL_TIER  tag::skill-tier    → tagSlug: skill-tier:{tier}
%%  TE4 TAG_TEAM        tag::team          → tagSlug: team:{slug}
%%  TE5 TAG_ROLE        tag::role          → tagSlug: role:{slug}
%%  TE6 TAG_PARTNER     tag::partner       → tagSlug: partner:{slug}
%%  ╠══════════════════════════════════════════════════════════════════════════╣
%%  INFRASTRUCTURE CONTRACTS [S1~S6] 索引
%%  S1  SK_OUTBOX_CONTRACT     三要素：at-least-once / idempotency-key / DLQ分級
%%  S2  SK_VERSION_GUARD       aggregateVersion 單調遞增保護（全 Projection）
%%  S3  SK_READ_CONSISTENCY    STRONG_READ vs EVENTUAL_READ 路由決策
%%  S4  SK_STALENESS_CONTRACT  SLA 常數單一真相（TAG/PROJ_CRITICAL/PROJ_STANDARD）
%%  S5  SK_RESILIENCE_CONTRACT 外部入口最低防護規格（rate-limit/circuit-break/bulkhead）
%%  S6  SK_TOKEN_REFRESH_CONTRACT Claims 刷新三方握手（VS1 ↔ IER ↔ 前端）
%%  ╠══════════════════════════════════════════════════════════════════════════╣
%%  FIREBASE 隔離規則 與 Cross-cutting Authority 治理 [D24~D26]
%%  （詳見 UNIFIED DEVELOPMENT RULES 完整定義）
%%  ╠══════════════════════════════════════════════════════════════════════════╣
%%  UNIFIED DEVELOPMENT RULES [D1~D27 + E7/E8 Governance]
%%  ── 規則分層：Hard Invariants (D1~D20 核心不變量) / Semantic Governance D21(D21-1~D21-10+D21-A~D21-X)/D22~D23 / Infrastructure (D24~D25) / Authority Governance (D26) / Cost Semantic Routing Extension (D27) / AI & Entry Security Closure (E7/E8) ──
%%  ── 基礎路徑約束（D1~D12）──
%%  D1  事件傳遞只透過 shared-infra/outbox-relay；domain slice 禁止直接 import shared-infra/event-router
%%  D2  跨切片引用：import from '@/features/{slice}/index' only；_*.ts 為私有
%%  D3  所有 mutation：src/features/{slice}/_actions.ts only
%%  D4  所有 read：src/features/{slice}/_queries.ts only
%%  D5  src/app/ 與 UI 元件禁止 import src/shared-infra/frontend-firebase/{firestore|realtime-database|analytics}
%%  D6  "use client" 只在 _components/ 或 _hooks/ 葉節點；layout/page server components 禁用
%%  D7  跨切片：import from '@/features/{other-slice}/index'；禁止 _private 引用
%%  D8  shared-kernel/* 禁止 async functions、Firestore calls、side effects
%%  D9  workspace-application/ TX Runner 協調 mutation；slices 不得互相 mutate
%%  D10 EventEnvelope.traceId 僅在 CBG_ENTRY 設定；其他地方唯讀
%%  D11 workspace-core.event-store 支援 projection rebuild；必須持續同步
%%  D12 getTier() 必須從 shared-kernel/skill-tier import；Firestore 寫入禁帶 tier 欄位
%%  ── 契約治理守則（D13~D20）──
%%  D13 新增 OUTBOX：必須在 SK_OUTBOX_CONTRACT 宣告 DLQ 分級
%%  D14 新增 Projection：必須引用 SK_VERSION_GUARD，不得跳過 aggregateVersion 比對
%%  D15 讀取場景決策：先查 SK_READ_CONSISTENCY（金融/授權 → STRONG；其餘 → EVENTUAL）
%%  D16 SLA 數值禁止硬寫，一律引用 SK_STALENESS_CONTRACT
%%  D17 新增外部觸發入口：必須在 SK_RESILIENCE_CONTRACT 驗收後上線
%%  D18 Claims 刷新邏輯變更：以 SK_TOKEN_REFRESH_CONTRACT 為唯一規範
%%  D19 型別歸屬規則：跨 BC 契約優先放 shared-kernel/*；shared/types 僅為 legacy fallback
%%  D20 匯入優先序：shared-kernel/* > feature slice index.ts > shared/types
%%  ── 語義 Tag 守則（D21~D23）── VS8 四層語義引擎正式規範 ──
%%  ── 層級結構：Governance → Core Domain → Compute Engine → Output ──
%%  ── 一、核心語義域（Core Domain · VS8_CL）──
%%  D21-1 語義唯一性（雙層）：全域語義類別與標籤實體由 VS8 CTA 定義；組織自訂 task-type/skill-type 語義由 VS4 org-semantic-registry 定義
%%  D21-2 標籤強型別化：系統中禁止使用隱性字串傳遞語義，所有引用必須指向 TE1~TE6 有效 tagSlug
%%  ── 二、圖譜與推理引擎（Compute Engine · VS8_SL / VS8_NG）──
%%  D21-3 節點互聯律：語義節點必須具備層級或因果關係；孤立標籤（Isolated Tag）視為無效語義，須通過 parentTagSlug 歸入分類學
%%  D21-4 聚合體約束：CTA 守護標籤生命週期（Draft→Active→Stale→Deprecated）；reasoning-engine 計算關聯權重與語義距離
%%  ── 三、語義路由與執行 (Compute Engine · VS8_ROUT) ──
%%  D21-5 語義感知路由：跨切片決策（排班路由/通知分發）必須基於標籤語義權重，禁止硬編碼業務對象 ID
%%  D21-6 因果自動觸發：TagLifecycleEvent 發生時，VS8 透過 Causality Tracer 自動推導受影響節點並發布更新事件；
%%        traceAffectedNodes(event, candidateSlugs[]) 支援候選節點過濾（candidateSlugs=[] 表全圖追蹤）；
%%        rankAffectedNodes / buildDownstreamEvents 可作為獨立工具使用；TAG_DELETED 不產生下游事件
%%  ── 四、輸出與一致性 (Output Layer · Projection & Consistency) ──
%%  D21-7 讀寫分離原則：寫入操作必須經過 CMD_GWAY 進入 VS8 CTA（全域）或 VS4 org-semantic-registry（組織）；讀取嚴禁直連資料庫，必須經由 projection.tag-snapshot
%%  D21-8 新鮮度防禦：所有基於語義的查詢必須引用 SK_STALENESS_CONTRACT，TAG_STALE_GUARD ≤ 30 秒
%%  ── 五、圖關係物理約束 (VS8_SL · Graph Physics) ──
%%  D21-9 突觸權重不變量：SemanticEdge.weight ∈ [0.0, 1.0]；
%%        語義代價 cost = 1.0 / max(weight, MIN_EDGE_WEIGHT)（強連結 = 近鄰 = 短距離）；
%%        _clampWeight 在 addEdge 時強制執行；所有直接關係預設 weight=1.0；
%%        禁止任何消費方持有 weight > 1.0 或 weight < 0.0 的邊
%%  D21-10 拓撲可觀測性：findIsolatedNodes(slugs[]) 為 VS8_NG 唯一拓撲健康探針；
%%         每次 addEdge/removeEdge 後必須以非同步方式觸發孤立節點檢查；
%%         結果寫入 L9 Observability；D21-3 違規率 > 0 需觸發警告事件
%%  ── 六、擴展不變量 (D21-A~D21-X · 四層架構治理律) ──
%%  D21-A 雙層註冊律：跨領域全域概念在 core/tag-definitions.ts 註冊；組織任務類型/技能類型概念在 VS4 org-semantic-registry（org-task-type-registry + org-skill-type-registry）註冊
%%  D21-B Schema 鎖定：標籤元數據必須符合 core/schemas 定義，禁止附加任何未經校驗的非結構化屬性
%%  D21-C 無孤立節點：每個新標籤建立時必須透過 hierarchy-manager.ts 掛載至少一個有效父級節點（→ D21-3 強化版）
%%  D21-D 向量一致性：embeddings/vector-store.ts 中的向量必須隨 core/tag-definitions.ts 定義同步刷新，延遲 ≤ 60s
%%  D21-E 權重透明化：語義相似度計算與路徑權重生成必須由 weight-calculator.ts 統一輸出，禁止消費方自行推算
%%  D21-F 注意力隔離：context-attention.ts 必須根據當前 Workspace 情境過濾無關標籤，防止語義噪聲污染路由結果
%%  D21-G 演化回饋環：learning-engine.ts 僅能依據 VS3（排班）/ VS2（任務）的真實事實事件進行神經元強度調整，
%%                    禁止手動隨機修改或注入合成數據；每次調整須附帶來源事件溯源
%%  D21-H 血腦屏障（BBB）：執行管線：L3(VS8 Governance) consensus-engine 先行校驗治理邏輯一致性，通過後提案轉送 BBB 做最終物理不變量裁決；
%%                          invariant-guard.ts 擁有最高否決權，可直接拒絕已通過治理共識但違反圖物理結構的提案，
%%                          其最終裁決權優先凌駕於 consensus-engine 與 learning-engine 之上
%%  D21-I 全域共識律：標籤治理決策開放全部組織用戶提案，所有提案必須通過 consensus-engine 的邏輯一致性校驗
%%  D21-J 知識溯源：每條標籤關係的建立必須標註貢獻者 ID 與參考依據（事件 ID / 文件 ID），具備完整版本回溯能力
%%  D21-K 語義衝突裁決：invariant-guard 偵測到違反物理邏輯（如循環繼承、矛盾語義）的聯結時直接拒絕提案並產生拒絕事件
%%  D21-S 同義詞重定向：標籤合併完成後舊標籤自動成為 Alias，所有歷史數據引用自動重定向至主標籤，禁止直接刪除舊標籤
%%  D21-T 命名共識律：標籤顯示名稱由社群貢獻度決定（可演化），tagSlug 作為永久技術識別碼不得修改
%%  D21-U 禁止重複定義：新增標籤時 embeddings 必須即時計算相似度並提示語義接近的現有標籤，阻止靜默重複
%%  D21-V 提案鎖定機制：處於「併購爭議中（Pending-Sync）」的標籤其路由權重凍結為 0.5 中性值，直到共識達成
%%  D21-W 跨組織透明性：所有標籤修改紀錄對全域公開，任何組織用戶均可查看完整演化歷程與責任歸屬
%%  D21-X 語義自動激發：用戶建立 A→B 關聯時，causality-tracer 自動建議語義相近的節點 C 作為潛在連結候選
%%  D22 跨切片 tag 語義引用：全域標籤必須指向 TE1~TE6；組織自訂標籤必須指向 OrgTagRef(orgId, tagSlug)；禁止隱式字串引用
%%  D23 tag 語義標注格式：節點內 → tag::{category}；邊 → -.->|"{dim} tag 語義"|
%%  ── Firebase 隔離守則（D24~D25）──
%%  D24 MUST: IF 位於 feature slice / shared/types / app THEN 必須禁止直接 import firebase/*
%%  D24 MUST: IF 屬前端使用者態 Firebase 呼叫 THEN 必須透過 FIREBASE_ACL Adapter（src/shared-infra/frontend-firebase/{auth|firestore|realtime-database|messaging|storage|analytics}）
%%  D24 FORBIDDEN: IF 位於 Feature Slice THEN MUST NOT 直接 import @/shared-infra/* 實作細節（含 firestore.*.adapter / db client）
%%  D24 MUST: IF 位於 Feature Slice THEN 僅可依賴 SK_PORTS（L1）或 Query Gateway（L6）公開介面
%%  D24-A MUST: IF 呼叫 Server Function / Server Action（Client -> Server 邊界）
%%         THEN 輸入/輸出必須是 Plain Object（JSON-serializable）；
%%         MUST NOT 傳遞 class instance、Firestore Timestamp/FieldValue、Date、含 toJSON 的 runtime object
%%  D24-B MUST: IF 位於 feature slice 定義 mutation action
%%         THEN 必須同時定義 Command DTO（最小必要欄位）；
%%         禁止直接使用 Aggregate/Projection 型別作為 action 參數
%%  D24-C MUST: IF Firestore snapshot 進入 client state
%%         THEN 必須先經 normalizer 轉為 Client Model（plain values）再存入 context/store
%%  D24-D FORBIDDEN: IF 為 Client 端呼叫 action
%%         THEN MUST NOT 直接傳遞 Account/Workspace 等 rich entity 到 Server Function
%%  D25 MUST: IF 新增 Firebase 前端能力 THEN 必須在 FIREBASE_ACL 新增 Adapter；Realtime Database 用於即時通訊，Analytics 用於遙測寫入，不得承載領域寫入
%%  D25 MUST: IF 入口涉及受保護資料或可變更狀態 THEN 必須先完成 App Check 驗證（含 token 續期與失效處理）[E7]
%%  D25 MUST: IF 操作涉及 Admin 權限/跨租戶/排程/觸發器/Webhook 驗簽 THEN 必須走 src/shared-infra/backend-firebase/functions
%%  D25 MUST: IF 需要受治理的 GraphQL 資料契約 THEN 必須走 src/shared-infra/backend-firebase/dataconnect
%%  D25 SHOULD: IF 可由 Rules 安全完成且為高頻小請求 THEN 優先 frontend-firebase 以降低 Functions 成本
%%  D25 SHOULD: IF 為高扇出或可批次流程 THEN 優先 backend-firebase/functions 集中批處理以降低總寫入成本
%%  D25 SHOULD: IF 為即時訂閱能力 THEN 必須定義 subscribe/unsubscribe/reconnect/backoff 與權限失效策略 [P7]
%%  D25 SHOULD: IF 為 AI tool data access THEN 必須由 Genkit tool gateway 統一檢查租戶邊界與可見性 [E8]
%%  ── Cross-cutting Authority 守則（D26）──
%%  D26 MUST: IF 執行跨域搜尋 THEN 必須經 global-search.slice；業務 Slice 不得自建搜尋邏輯
%%  D26 MUST: IF 執行通知副作用 THEN 必須經 notification-hub.slice（VS7）；業務 Slice 不得直接調用 sendEmail/push/SMS
%%  D26 MUST: IF 屬 global-search.slice 或 notification-hub.slice THEN 必須具備自己的 _actions.ts / _services.ts [D3]
%%  D26 FORBIDDEN: IF 屬 cross-cutting authority THEN MUST NOT 寄生於 shared-kernel [D8]
%%  ── L2 Command Gateway 下沉邊界（單向鏈防呆）──
%%      MUST: IF 元件為 GatewayCommand / DispatchOptions / Handler 介面型別 THEN 可下沉至 L1（Shared Kernel）
%%      MUST: IF 元件為 CommandResult/錯誤碼契約且為純資料或純函式 THEN 可下沉至 L1（Shared Kernel）
%%      MUST: IF 元件屬 CBG_ENTRY / CBG_AUTH / CBG_ROUTE 執行管線 THEN 必須保留在 L2（Infrastructure Orchestration）
%%      MUST: IF 元件屬 handler registry 或 resilience 接線（rate-limit/circuit-breaker/bulkhead）THEN 必須保留在 L2
%%      FORBIDDEN: IF 元件包含 async / side effects / routing registry THEN MUST NOT 下沉至 shared-kernel/* [D8]
%%      FORBIDDEN: IF 位於 L1 THEN MUST NOT 產生 traceId；traceId 僅允許 CBG_ENTRY 注入 [D10]
%%  ── 成本語義路由守則（D27 · Extension Gate）──
%%  D27 MUST: IF 處理成本語義路由 THEN 必須採用三層架構（Layer-1 原始解析 → Layer-2 語義分類 → Layer-3 語義路由）
%%  D27 MUST: IF 位於 Layer-2 THEN 必須呼叫 VS8 classifyCostItem(name) 輸出 (costItemType, semanticTagSlug)
%%  D27 MUST: IF 實作 classifyCostItem THEN 必須為純函式（禁止 async / Firestore / 副作用）[D8]
%%  D27 MUST: IF 產生 ParsedLineItem THEN 必須寫入 (costItemType, semanticTagSlug) 並隨 payload 傳遞
%%  D27 MUST: IF 位於 Layer-3 物化流程 THEN 必須以 shouldMaterializeAsTask() 作為唯一物化閘門 [D27-Gate]
%%  D27 FORBIDDEN: IF 位於 workspace.slice THEN MUST NOT 直接硬寫 `=== CostItemType.EXECUTABLE` 判斷
%%  D27 MUST: IF shouldMaterializeAsTask() 返回 true THEN 才可物化為 WorkspaceTask；否則必須靜默跳過並 toast [#A14]
%%  D27 MUST: IF 物化為任務 THEN 必須寫入 sourceIntentIndex 以維持排序不變量 [D27-Order]
%%  D27 MUST: IF tasks-view 呈現任務清單 THEN 必須先按 createdAt（批次間）再按 sourceIntentIndex（批次內）排序
%%  D27 MUST: IF 設計任務鏈路 THEN 必須遵守單向鏈 WorkspaceItem → WorkspaceTask → Schedule（禁止跳級）[D27-Order]
%%  D27 MUST: IF UI 顯示 DocumentParser icon/color/label THEN 必須讀取 tag-snapshot（不得分類器硬編碼）[T5]
%%  D27 MUST: IF 為排班視圖讀取 THEN 僅可經 L6 Query Gateway；UI 禁止直讀 VS6/Firebase [L6-Gateway]
%%  D27 MUST: IF 涉及 overlap/resource-grouping THEN 必須在 L5 Projection 層完成，前端僅渲染 [Timeline]
%%  P6 SHOULD: IF 使用 Next.js Parallel Routes THEN 每個 @slot 必須對應單一資料通道（QGWAY channel）與獨立 Suspense fallback
%%  P6 SHOULD: IF 使用 Streaming UI THEN 必須定義可中斷/可重試策略，避免跨 slot 共享阻塞
%%  E8 MUST: IF Genkit flow 觸發 tool calling THEN 必須經 Tool ACL（role/scope/tenant）與審計追蹤（traceId/toolCallId/modelId）
%%  E8 FORBIDDEN: IF 位於 AI flow THEN MUST NOT 直接呼叫 firebase/* 或跨租戶讀寫
%%  D27 FORBIDDEN: IF 位於 VS5 document-parser THEN MUST NOT 自行實作成本語義邏輯；必須透過 VS8 classifyCostItem() [D27]
%%      禁止 Layer-3 Semantic Router 繞過 costItemType 直接物化非 EXECUTABLE 項目
%%  ── Visualization DataSet 快取守則（D28）──
%%  D28 MUST: IF 渲染 vis-network / vis-timeline / vis-graph3d THEN 必須透過 VisDataAdapter DataSet<>；禁止直連 Firebase
%%  D28 MUST: IF 新增視覺化元件 THEN 必須在 VisDataAdapter 新增對應 DataSet<>，不得在元件中建立獨立 Firebase 訂閱
%%  D28 FORBIDDEN: IF 位於 vis-* 元件 THEN MUST NOT 直接訂閱 Firebase（避免 N 組件 × 1 訂閱造成費用倍增）
%%  D28 FORBIDDEN: IF 位於 VisDataAdapter 以外 THEN MUST NOT 寫入 vis-data DataSet<>
%%  ╚══════════════════════════════════════════════════════════════════════════╝
