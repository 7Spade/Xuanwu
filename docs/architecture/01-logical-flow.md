# 邏輯流視圖 (Logical Flow View)

> **原始檔（Source of Truth）**：完整 Mermaid 源碼與所有規則定義請見 [`00-LogicOverview.md`](./00-LogicOverview.md)
>
> 治理規則請見 [`02-governance-rules.md`](./02-governance-rules.md) · 基礎設施路徑請見 [`03-infra-mapping.md`](./03-infra-mapping.md)

本視圖呈現系統三條 **Canonical Chains** 的端到端流向與各 VS0–VS8 子圖結構。

---

## 三條 Canonical Chains（唯一排序判準）

| 鏈路 | 流向 |
|------|------|
| **寫鏈（Command）** | External/L0 → L0A `COMMAND_API_GATEWAY` → L2 Command Gateway → L3 Domain Slices → L4 IER → L5 Projection |
| **讀鏈（Query）** | UI/L0 → L0A `QUERY_API_GATEWAY` → L6 Query Gateway → L5 Projection（Read Model） |
| **Infra 鏈（SDK）** | L3/L5/L6 → L1 Ports/Contracts → L7 Firebase Boundary → L8 Firebase Runtime |

> **規則**：三條鏈並列，不得把 Query/Command/FirebaseBoundary 壓成單一線性排序。

---

## 系統架構圖

```mermaid
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
        SK_ENV["event-envelope\nversion · traceId · causationId · correlationId · timestamp\nidempotency-key = eventId+aggId+version\n[R8] traceId 整鏈共享・不可覆蓋\ncausationId = 觸發此事件的命令/事件 ID\ncorrelationId = 同一 saga/replay 的關聯 ID"]
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

subgraph SHARED_INFRA_PLANE["🧩 Shared Infrastructure Plane（VS0-Infra：L0/L2/L4/L5/L6/L7/L8/L9 Execution Plane；與 VS0-Kernel 同屬 VS0）"]
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

            subgraph API_SPLIT["🚪 L0A · API Gateway Split（src/shared-infra/api-gateway）"]
                direction LR
                CMD_API_GW["COMMAND_API_GATEWAY\nwrite-only ingress"]
                QRY_API_GW["QUERY_API_GATEWAY\nread-only ingress"]
            end

            BULKHEAD -->|command ingress| CMD_API_GW
            BULKHEAD -->|client/server-action read ingress| QRY_API_GW
            EXT_WEBHOOK -.->|forbidden read| WEBHOOK_READ_REJECT
        end

        %% ═══════════════════════════════════════════════════════════════
        %% LAYER 2 ── COMMAND GATEWAY（統一寫入閘道）
        %% ═══════════════════════════════════════════════════════════════

        subgraph GW_CMD["🔵 L2 · Command Gateway（src/shared-infra/gateway-command）"]
            direction LR

            subgraph GW_PIPE["⚙️ Command Pipeline（src/shared-infra/gateway-command）"]
                CBG_ENTRY["unified-command-gateway\n[R8] TraceID 注入（唯一注入點）\n→ event-envelope.traceId"]
                CBG_AUTH["authority-interceptor\nAuthoritySnapshot [#A9]\n衝突以 ACTIVE_CTX 為準"]
                CBG_ROUTE["command-router\n路由至對應切片\n回傳 SK_CMD_RESULT"]
                CBG_ENTRY --> CBG_AUTH --> CBG_ROUTE
            end

            CMD_API_GW --> CBG_ENTRY
        end

        %% ═══════════════════════════════════════════════════════════════
        %% LAYER 4 ── INTEGRATION EVENT ROUTER（事件路由總線）
        %% ═══════════════════════════════════════════════════════════════

        subgraph GW_IER["🟠 L4 · Integration Event Router（src/shared-infra/event-router + src/shared-infra/outbox-relay + src/shared-infra/dlq-manager）"]
            direction TB

            RELAY["outbox-relay-worker（src/shared-infra/outbox-relay）\n【共用 Infra・所有 OUTBOX 共享】\n掃描：Firestore onSnapshot (CDC)\n投遞：OUTBOX → IER 對應 Lane\n失敗：retry backoff → 3次失敗 → DLQ\n監控：relay_lag → L9(Observability)"]

            subgraph IER_CORE["⚙️ IER Core（src/shared-infra/event-router）"]
                IER[["integration-event-router\n統一事件出口 [#9]\n[R8] 保留 envelope.traceId 禁止覆蓋"]]
            end

            subgraph IER_LANES["🚦 優先級三道分層（src/shared-infra/event-router）[P1]"]
                CRIT_LANE["🔴 CRITICAL_LANE\n高優先最終一致\nRoleChanged → Claims 刷新 [S6]\nWalletDeducted/Credited\nOrgContextProvisioned\nSLA：盡快投遞"]
                STD_LANE["🟡 STANDARD_LANE\n非同步最終一致\nSLA < 2s\nSkillXpAdded/Deducted\nScheduleAssigned / ScheduleProposed\nMemberJoined/Left\nAll Domain Events"]
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
                FUNNEL[["event-funnel\n[#9] 唯一 Projection 寫入路徑\n[Q3] upsert by idempotency-key\n[R8] 從 envelope 讀取 traceId → DOMAIN_METRICS\n[S2] 所有 Lane 遵守 SK_VERSION_GUARD\n     event.aggVersion > view.lastVersion\n     → 更新；否則 → 丟棄"]]
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
            end

            IER ==>|"[#9] 唯一 Projection 寫入路徑"| FUNNEL
            CRIT_PROJ --> WS_SCOPE_V & ORG_ELIG_V & WALLET_V
            STD_PROJ --> WS_PROJ & ACC_SCHED_V & CAL_PROJ & TL_PROJ & ACC_PROJ_V & ORG_PROJ_V & SKILL_V & AUDIT_V & TAG_SNAP & SEM_GOV_V

            FUNNEL -->|stream offset| PROJ_VER
            WS_ESTORE -.->|"[#9] replay → rebuild"| FUNNEL
            SKILL_V -.->|"[#12] getTier"| TIER_FN
            ORG_ELIG_V -.->|"[#12] getTier"| TIER_FN
        end

        subgraph GW_QUERY["🟢 L6 · Query Gateway（src/shared-infra/gateway-query；ownership: VS0-Infra）[S2 S3]"]
            direction LR
            QGWAY["read-model-registry\n統一讀取入口\n版本對照 / 快照路由\n[S2] 所有 Projection 遵守 SK_VERSION_GUARD"]
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
            QGWAY --> QGWAY_SCHED & QGWAY_CAL_DAY & QGWAY_CAL_ALL & QGWAY_TL_MEMBER & QGWAY_TL_ALL & QGWAY_NOTIF & QGWAY_SCOPE & QGWAY_WALLET & QGWAY_SEARCH & QGWAY_SEM_GOV
        end

        QRY_API_GW --> QGWAY

        subgraph FIREBASE_ACL["🔌 L7 · Anti-Corruption Translator + Functional Adapters（VS0-Infra）[D24 D25]"]
            direction LR

            AC_TRANSLATOR_L7["anti-corruption-translator\nSDK semantics -> standardized ports"]

            AUTH_ADP["auth.adapter.ts\nAuthAdapter\n實作 IAuthService\nFirebase User ↔ Auth Identity\n[D24] 唯一合法 firebase/auth 呼叫點"]

            FSTORE_ADP["firestore.facade.ts\nFirestoreAdapter\n實作 IFirestoreRepo\n[S2] aggregateVersion 單調遞增守衛\n[D24] 唯一合法 firebase/firestore 呼叫點"]

            RTDB_ADP["realtime-database.adapter.ts\nRealtimeDatabaseAdapter\n即時通訊/通知低延遲同步（presence/typing/live-feed）\n[D24] 唯一合法 firebase/database 呼叫點"]

            FCM_ADP["messaging.adapter.ts\nFCMAdapter\n實作 IMessaging\n[R8] 注入 envelope.traceId → FCM metadata\n禁止在此生成新 traceId\n[D24] 唯一合法 firebase/messaging 呼叫點"]

            STORE_ADP["storage.facade.ts\nStorageAdapter\n實作 IFileStore\nPath Resolver / URL 簽發\n[D24] 唯一合法 firebase/storage 呼叫點"]

            ANALYTICS_ADP["analytics.adapter.ts\nAnalyticsAdapter\nGoogle Analytics 事件寫入（logEvent/screen_view）\n僅允許遙測事件，禁止承載領域寫入\n[D24] 唯一合法 firebase/analytics 呼叫點"]

            APPCHK_ADP["app-check.adapter.ts\nAppCheckAdapter\nClient attestation token 初始化/續期/驗證\n未通過不得進入 L2/L3\n[D24 D25 E7] 唯一合法 firebase/app-check 呼叫點"]

            AC_TRANSLATOR_L7 -.-> AUTH_ADP
            AC_TRANSLATOR_L7 -.-> FSTORE_ADP
            AC_TRANSLATOR_L7 -.-> RTDB_ADP
            AC_TRANSLATOR_L7 -.-> FCM_ADP
            AC_TRANSLATOR_L7 -.-> STORE_ADP
            AC_TRANSLATOR_L7 -.-> ANALYTICS_ADP
            AC_TRANSLATOR_L7 -.-> APPCHK_ADP
        end

        subgraph FIREBASE_BACKEND["🔌 L7 · Backend Firebase Gateways（VS0-Infra · src/shared-infra/backend-firebase）[D25]"]
            direction LR
            BFN_GW["functions-gateway\nsrc/shared-infra/backend-firebase/functions\nAdmin 權限 / 跨租戶協調 / Trigger / Scheduler / Webhook 驗簽\n對外 HTTP/Callable API 入口"]
            BDC_GW["dataconnect-gateway\nsrc/shared-infra/backend-firebase/dataconnect\n治理化 GraphQL schema/connector/operations\n跨前端一致查詢契約"]
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
        end

        subgraph OBS_LAYER["⬜ L9 · Observability（src/shared-infra/observability）"]
            direction LR
            OBS_PATH["path: src/shared-infra/observability"]
            TRACE_ID["trace-identifier\nCBG_ENTRY 注入 TraceID\n整條事件鏈共享 [R8]"]
            DOMAIN_METRICS["domain-metrics\nIER 各 Lane Throughput/Latency\nFUNNEL 各 Lane 處理時間\nOUTBOX_RELAY lag [R1]\nRATELIMIT hit / CIRCUIT open"]
            DOMAIN_ERRORS["domain-error-log\nWS_TX_RUNNER\nSCHEDULE_SAGA\nDLQ_BLOCK 安全事件 [R5]\nStaleTagWarning\nTOKEN_REFRESH 失敗告警 [S6]"]
        end
end

end

SK_OBS_CONTRACT -.->|"contract bind"| OBS_LAYER
SK_OBS_PATH -.->|"contract -> runtime"| OBS_PATH

%% ─── VS8 Semantic Cognition Engine（語義認知引擎）
%% ─── 四層架構（可維護視圖）：
%% ───   ① Governance（治理）: registry / protocol / guards / portal
%% ───   ② Core Domain（核心語義域）: CTA / hierarchy / vector / tag entities
%% ───   ③ Compute Engine（計算引擎）: graph / reasoning / routing / learning
%% ───   ④ Output（輸出）: projections / event-broadcast / decision-policy
%% ─── 向下相容：VS8_CL ≡ core-domain, VS8_SL ≡ graph-engine, VS8_NG ≡ reasoning-engine, VS8_RL ≡ decision-policy
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

        subgraph VS8_SL["3.1 graph-engine（src/features/semantic-graph.slice/graph）[D21-E D21-F D21-9 D21-10]"]
            direction LR
            EDGE_STORE["semantic-edge-store.ts\n【邊關係登錄中心 · 唯一邊圖操作點】\nIS_A / REQUIRES 加權邊 weight ∈ [0,1] [D21-9]\ncost = 1/weight（強連結=近鄰）"]
            WT_CALC["weight-calculator.ts\n【語義相似度統一出口 · 禁止業務端自行加權】\ncomputeSimilarity(a,b) [D21-E]"]
            CTX_ATTN["context-attention.ts\n【Workspace 情境過濾 · 注意力隔離】\nfilterByContext(slugs, wsCtx) [D21-F]"]
            TOPO_OPS["adjacency-list.ts\n拓撲閉包計算（禁止業務端直連 [T5]）\nisSupersetOf / getTransitiveRequirements [D21-10]"]
            EDGE_STORE -.-> WT_CALC
            EDGE_STORE -.-> TOPO_OPS
        end

        subgraph VS8_NG["3.2 reasoning-engine（src/features/semantic-graph.slice/reasoning）[D21-4 D21-6 D21-X]"]
            direction LR
            NEURAL_NET["semantic-distance\ncomputeSemanticDistance(a,b)\nfindIsolatedNodes(slugs[]) [D21-10]\nDijkstra 加權最短路徑"]
            CAUSALITY["🔍 Causality Tracer [D21-6 D21-X]\ntraceAffectedNodes(event, candidates[])\nbuildCausalityChain(event, candidates[])\nBFS 因果傳播 · 語義自動激發"]
            TAG_EV["TagLifecycleEvent（in-process）\neventType: TAG_CREATED | TAG_ACTIVATED\n         | TAG_DEPRECATED | TAG_STALE_FLAGGED\n         | TAG_DELETED\n[D21-6] 因果自動觸發"]
            TAG_OB["tag-outbox\n[SK_OUTBOX: SAFE_AUTO]"]
            TAG_SG["⚠️ TAG_STALE_GUARD\n[S4 D21-8: TAG_MAX_STALENESS ≤ 30s]"]
            NEURAL_NET -.->|"語義距離 [D21-4]"| CAUSALITY
            CAUSALITY -->|"TagLifecycleEvent [D21-6]"| TAG_EV
            TAG_EV --> TAG_OB
            CAUSALITY -.->|"廢棄感知 [D21-8]"| TAG_SG
        end

        subgraph VS8_ROUT["3.3 routing-engine（src/features/semantic-graph.slice/routing）[D21-5 D27-A]"]
            direction LR
            POLICY_MAP["policy-mapper/\n語義標籤→分發策略 [D27-A]\n禁止 ID 硬編碼路由"]
            DISPATCH["dispatch-bridge/\n排班路由 · 通知分發出口"]
            subgraph WORKFLOWS["workflows/（src/features/semantic-graph.slice/workflows）"]
                direction LR
                TAG_PROMO["tag-promotion-flow.ts\n標籤晉升流程"]
                ALERT_FLOW["alert-routing-flow.ts\n告警路由流程"]
            end
            POLICY_MAP --> DISPATCH
        end

        subgraph VS8_PLAST["3.4 learning-engine（src/features/semantic-graph.slice/learning）[D21-G]"]
            direction LR
            LEARN["learning-engine.ts\n【僅 VS3/VS2 事實事件驅動 · 禁止手動隨機修改】\n加權演化回饋環 [D21-G]"]
            DECAY["semantic-decay\n語義強度自然衰退"]
            LEARN -.-> DECAY
        end
    end

    subgraph VS8_OUTPUT_LAYER["④ 📤 Semantic Output Layer（src/features/semantic-graph.slice/{projections,subscribers,outbox,decision}）"]
        direction TB

        subgraph VS8_PROJ["4.1 projections · 讀側投影（src/features/semantic-graph.slice/output/projections）[D21-7 T5]"]
            direction LR
            TAG_RO["semantic-tag-projection\n【業務端唯一合法讀取出口 · T5】\n[D21-7] 讀取必須經 projection.tag-snapshot\nT1 新切片訂閱事件即可擴展"]
            GRAPH_SEL["projections/graph-selectors.ts\n圖結構唯讀查詢"]
            CTX_SEL["projections/context-selectors.ts\nWorkspace 語義上下文"]
            TAG_RO -.-> GRAPH_SEL
            TAG_RO -.-> CTX_SEL
        end

        subgraph VS8_IO["4.2 event-broadcast · 語義訂閱廣播（src/features/semantic-graph.slice/{subscribers,outbox}）[D21-6 S1]"]
            direction LR
            LIFECYCLE_SUB["subscribers/lifecycle-subscriber.ts\n標籤生命週期事件訂閱"]
            TAG_OUTBOX["outbox/tag-outbox.ts\n[SK_OUTBOX: SAFE_AUTO]\n標籤異動廣播出口"]
        end

        subgraph VS8_RL["4.3 decision-policy · 語義決策輸出（src/features/semantic-graph.slice/decision）[D21-5 D8 D27]"]
            direction LR
            subgraph COST_CLASS["📊 成本語義分類器（src/features/semantic-graph.slice/_cost-classifier.ts）[D8][D24][D27]"]
                direction LR
                COST_CLASSIFIER["_cost-classifier.ts（純函式 [D8]）\nclassifyCostItem(name) → (costItemType, semanticTagSlug)\nshouldMaterializeAsTask(type) → boolean  ★[D27]\n──────────────────────────────\nEXECUTABLE  物理施工任務（預設出口）\nMANAGEMENT  行政/品管/職安管理（含 QC Inspection）\nRESOURCE    倉儲/人力資源儲備\nFINANCIAL   付款里程碑/預付款\nPROFIT      利潤項目（利潤）\nALLOWANCE   耗材/差旅/運輸補貼（含差旅、運輸）\n──────────────────────────────\nsemanticTagSlug 由 VS8 依內容語義掛載（對齊 tagSlug）\n★ EXECUTABLE override 優先：機電檢測/qc test 等施工測試→EXECUTABLE\n禁止 Firestore 存取・禁止 async\n可在任意 Layer 安全呼叫 [D8]"]
            end
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
        WS_OB["ws-outbox\n[SK_OUTBOX: SAFE_AUTO]\n唯一 IER 投遞來源 [E5]"]
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
        WS_PCHK["policy-eligible-check [P4]\nvia Query Gateway"]
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
            WF_AGG["workflow.aggregate\n狀態合約：Draft→InProgress→QA\n→Acceptance(OK)→Finance(Stage Gateway)→Completed\nFinance 子流程（可多輪循環）\nClaim Preparation(勾選+quantity)→Claim Submitted\n→Claim Approved→Invoice Requested\n→Payment Term(計時中)→Payment Received\n收斂條件：outstandingClaimableAmount=0 才可 Completed\nblockedBy: Set‹issueId›\n[#A3] blockedBy.isEmpty() 才可 unblock"]
        end

        subgraph VS5_A["🟢 A-track 主流程（src/features/workspace.slice/business.tasks + business.quality-assurance + business.acceptance + business.finance）"]
            direction LR
            A_ITEMS["workspace.items\n來源事項（Source of Work）\n保留 sourceIntentIndex"]
            A_TASKS["tasks"]
            A_QA["quality-assurance"]
            A_ACCEPT["acceptance"]
            A_FINANCE["finance-stage-gateway"]
        end

        subgraph VS5_FIN["💰 Finance Lifecycle（src/features/workspace.slice/business.finance，Multi-Claim）[#A15 #A16]"]
            direction TB
            FIN_CLAIM_PREP["claim-preparation\n(select line-items + quantity)"]
            FIN_CLAIM_SUB["claim-submitted"]
            FIN_CLAIM_APV["claim-approved"]
            FIN_INV_REQ["invoice-requested"]
            FIN_TERM["payment-term (timer-running)"]
            FIN_PAY_RECV["payment-received"]
            FIN_BALANCE{"outstandingClaimableAmount > 0 ?"}
            FIN_EXIT["finance-exit-gate\n(outstandingClaimableAmount=0)"]
        end

        subgraph VS5_B["🔴 B-track 異常處理（src/features/workspace.slice/business.issues）"]
            B_ISSUES{{"issues"}}
        end

        W_DAILY["daily\n施工日誌"]
        W_SCHED["workspace.schedule（WorkspaceSchedule）\n任務時間化（有時間）\nWorkspaceScheduleProposed（僅提案）\nTask → WorkspaceSchedule 單向橋接 [D27-Order #A5]"]

        PARSE_INT -->|"[Layer-3 Semantic Router]\nshouldMaterializeAsTask(costItemType) [D27-Gate]\n先形成 WorkspaceItem"| A_ITEMS
        A_ITEMS -->|"僅 EXECUTABLE 事項可物化任務\n保留 sourceIntentIndex 排序 [D27-Order]"| A_TASKS
        PARSE_INT -.->|"財務候選資料（非階段遷移）"| A_FINANCE
        PARSE_INT -->|解析異常| B_ISSUES
        A_TASKS -.->|"SourcePointer [#A4]"| PARSE_INT
        PARSE_INT -.->|"IntentDeltaProposed [#A4]"| A_TASKS
        WF_AGG -.->|stage-view| A_TASKS & A_QA & A_ACCEPT & A_FINANCE
        A_TASKS --> A_QA --> A_ACCEPT --> A_FINANCE
        A_FINANCE -->|"進入請款生命週期 [#A15]"| FIN_CLAIM_PREP
        FIN_CLAIM_PREP --> FIN_CLAIM_SUB
        FIN_CLAIM_SUB --> FIN_CLAIM_APV
        FIN_CLAIM_APV --> FIN_INV_REQ
        FIN_INV_REQ --> FIN_TERM
        FIN_TERM --> FIN_PAY_RECV
        FIN_INV_REQ -.->|"啟動 Payment Term 計時 [#A16]"| FIN_TERM
        FIN_PAY_RECV --> FIN_BALANCE
        FIN_BALANCE -->|"是：仍有可請款餘額 [#A16]"| FIN_CLAIM_PREP
        FIN_BALANCE -->|"否：本輪後已結清 [#A16]"| FIN_EXIT
        FIN_EXIT -->|"允許 Completed [#A16]"| WF_AGG
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
WS_PCHK -.->|"[P4]"| QGWAY_SCHED
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
        USER_NOTIF["account-user.notification\n個人推播 + RTDB 即時通知串流"]
        USER_DEV["使用者裝置"]
        USER_NOTIF --> USER_DEV
    end

    NOTIF_R -->|TargetAccountID 匹配| NOTIF_EXIT
    NOTIF_EXIT -->|路由策略決定| USER_NOTIF
    PROFILE -.->|"FCM Token（唯讀）"| USER_NOTIF
    USER_NOTIF -.->|"[#6] 投影"| QGWAY_NOTIF
end

NOTIF_EXIT -.->|"uses IMessaging [R8]"| I_MSG
USER_NOTIF -.->|"low-latency feed via QueryGateway/Port"| QGWAY_NOTIF
NOTIF_EXIT -.->|"標籤感知路由"| VS8

%% 所有 OUTBOX → RELAY
ACC_OB & ORG_OB & SCH_OB & SKILL_OB & TAG_OB & WS_OB -.->|"被 RELAY 掃描 [R1]"| RELAY

%% IER → Domain Slice 消費
CRIT_LANE -.->|"RoleChanged/PolicyChanged [S6]"| CLAIMS_H
CRIT_LANE -.->|"OrgContextProvisioned [E2]"| ORG_ACL
ORG_EBUS -.->|"OrgContextProvisioned 事件來源 [E2]"| ORG_ACL
STD_LANE -.->|"ScheduleAssigned [E3]"| NOTIF_R
STD_LANE -.->|"ScheduleProposed [#A5]"| SCH_SAGA
BG_LANE -.->|"TagLifecycleEvent [T1]"| TAG_SUB
BG_LANE -.->|"跨片稽核"| AUDIT_COL

%% Outbox Lane Declarations
ACC_OB -->|"CRITICAL_LANE: Role/Policy/Wallet"| IER
ACC_OB -->|"STANDARD_LANE: AccountCreated"| IER
ORG_OB -->|"CRITICAL_LANE: OrgContextProvisioned・PolicyChanged"| IER
ORG_OB -->|"STANDARD_LANE: MemberJoined/Left・SkillRecog"| IER
SKILL_OB -->|"STANDARD_LANE"| IER
SCH_OB -->|"STANDARD_LANE"| IER
WS_OB -->|"STANDARD_LANE [E5]"| IER
TAG_OB -->|"BACKGROUND_LANE"| IER

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
BFN_GW --> F_DB
BFN_GW --> F_STORE
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
class FIN_CLAIM_PREP,FIN_CLAIM_SUB,FIN_CLAIM_APV,FIN_INV_REQ,FIN_TERM,FIN_PAY_RECV,FIN_BALANCE,FIN_EXIT wfNode
class AUDIT_COL auditView
class A_ITEMS,A_TASKS,A_QA,A_ACCEPT trackA
class A_FINANCE wfNode
class B_ISSUES,W_DAILY,W_SCHED wsSlice
class VS6,SCH_CMD,SCH_CONFLICT,ORG_SCH,SCH_SAGA schedSlice
class SCH_OB outboxNode
class VS7,NOTIF_R,USER_NOTIF,USER_DEV notifSlice
class GW_CMD,GW_GUARD,GW_PIPE gateway
class RATE_LIM,CIRCUIT,BULKHEAD guardLayer
class CBG_ENTRY,CBG_AUTH,CBG_ROUTE cmdGw
class GW_IER,IER_CORE,IER eventGw
class RELAY relay
class CRIT_LANE critLane
class STD_LANE stdLane
class BG_LANE bgLane
class DLQ dlqNode
class DLQ_S dlqSafe
class DLQ_R dlqReview
class DLQ_B dlqBlock
class GW_QUERY,QGWAY,QGWAY_SCHED,QGWAY_CAL_DAY,QGWAY_CAL_ALL,QGWAY_TL_MEMBER,QGWAY_TL_ALL,QGWAY_NOTIF,QGWAY_SCOPE,QGWAY_WALLET,QGWAY_SEARCH,QGWAY_SEM_GOV qgway
class PROJ_BUS,FUNNEL,PROJ_VER,READ_REG stdProj
class CRIT_PROJ,WS_SCOPE_V,ORG_ELIG_V,WALLET_V critProj
class STD_PROJ,WS_PROJ,ACC_SCHED_V,CAL_PROJ,TL_PROJ,ACC_PROJ_V,ORG_PROJ_V,SKILL_V stdProj
class AUDIT_V auditView
class TAG_SNAP tagSub
class TIER_FN tierFn
class TALENT talent
class OBS_LAYER,OBS_PATH,TRACE_ID,DOMAIN_METRICS,DOMAIN_ERRORS obs
class FIREBASE_ACL,AC_TRANSLATOR_L7,AUTH_ADP,FSTORE_ADP,RTDB_ADP,FCM_ADP,STORE_ADP,ANALYTICS_ADP aclAdapter
class APPCHK_ADP aclAdapter
class FIREBASE_BACKEND,BFN_GW,BDC_GW aclAdapter
class FIREBASE_EXT,F_AUTH,F_DB,F_RTDB,F_FCM,F_STORE,F_ANALYTICS,F_APPCHK,F_DC firebaseExt
class EXT_CLIENT,EXT_AUTH,EXT_WEBHOOK serverAct
class VS8 semanticGraph
class GLOBAL_SEARCH crossCutAuth
class NOTIF_EXIT crossCutAuth
```

---

## VS0–VS8 子圖索引

| 編號 | 名稱 | 目標路徑 | Layer |
|------|------|----------|-------|
| **VS0-Kernel** | Foundation Kernel（契約/常數/純函式） | `src/shared-kernel/*` | L1 |
| **VS0-Infra** | Foundation Infra（執行層） | `src/shared-infra/*` | L0/L2/L4/L5/L6/L7/L9/L10 |
| **VS1** | Identity Slice | `src/features/identity.slice` | L3 |
| **VS2** | Account Slice | `src/features/account.slice` | L3 |
| **VS3** | Skill XP Slice | `src/features/skill-xp.slice` | L3 |
| **VS4** | Organization Slice | `src/features/organization.slice` | L3 |
| **VS5** | Workspace Slice | `src/features/workspace.slice` | L3 |
| **VS6** | Workforce Scheduling Slice | `src/features/workforce-scheduling.slice` | L3 |
| **VS7** | Notification Hub（唯一副作用出口） | `src/features/notification-hub.slice` | L3 |
| **VS8** | Semantic Graph Engine（語義引擎） | `src/features/semantic-graph.slice` | L3 |

### 跨切片權威（Cross-cutting Authorities）

| 權威 | 說明 |
|------|------|
| `global-search.slice` | 唯一跨域搜尋出口 [D26 A12] |
| `notification-hub.slice` | 唯一通知副作用出口 [D26 A13] |

---

## 層位說明（Layer Reference）

| Layer | 名稱 | 職責 |
|-------|------|------|
| L0 | External Triggers | 外部觸發入口 |
| L1 | Shared Kernel | 契約／常數／純函式（No I/O） |
| L2 | Command Gateway | CBG_ENTRY / CBG_AUTH / CBG_ROUTE |
| L3 | Domain Slices | VS1–VS8 業務切片 |
| L4 | Integration Event Router（IER） | 統一事件出口 [#9] |
| L5 | Projection Bus | 投影物化（event-funnel，唯一寫路徑） |
| L6 | Query Gateway | 統一讀取出口 |
| L7 | Firebase Boundary（FIREBASE_ACL） | SDK Anti-Corruption Layer |
| L8 | Firebase Runtime | 外部 Firebase 平台執行層 |
| L9 | Observability | 跨切面觀測（metrics/trace/errors）；observe-only |
| L10 | AI Runtime & Orchestration | Genkit Flow Gateway / Prompt Policy / Tool ACL |

> 各 Layer 對應原始碼路徑前綴請見 [`03-infra-mapping.md` § 水平層位索引（L0–L10）](./03-infra-mapping.md#水平層位索引l0l10)
