# Xuanwu 垂直切片 -> DDD 平滑遷移策略（正式順序版）

## Migration Order（recommended）
1. Domain Layer
2. Application Layer
3. Infrastructure Layer
4. User Interface Layer

此順序是本專案遷移的預設基準。若顛倒順序，會出現 API 反覆改寫、流程回滾困難、測試不穩定等問題。

---

## 為什麼是這個順序

### 1) Domain Layer 先
- Domain 是系統核心，必須先定義穩定的業務語言與一致性邊界。
- 先穩定 Entity、Value Object、Aggregate、Domain Service、Domain Event、Repository Interface，後續層才能有明確依附目標。
- 若先改 UI 或 DB，通常會把技術細節倒灌進業務規則，造成耦合。

### 2) Application Layer 第二
- Domain 穩定後，才能正確定義 Use Case、Command/Query、Transaction Boundary。
- Application 只負責流程編排，不承載核心規則；這一步可避免流程被 UI 或資料庫形狀綁死。

### 3) Infrastructure Layer 第三
- Infrastructure 依照 Domain 的 Repository Interface 與 Application 的協作需求來實作。
- 這樣可以確保技術實作可替換（Firestore、Queue、外部 API）且不影響核心規則。

### 4) User Interface Layer 最後
- 當 Domain + Application + Infrastructure 穩定後，再把 UI/API Controller 重接到新的 Use Case。
- 可最大化相容性，減少前端與路由層反覆調整成本。

---

## 四層職責與構成（遷移判斷基準）

### Domain Layer（領域層）
職責：承載核心業務規則，與框架、資料庫、UI 無關。

常見構成：
- Entity
- Value Object
- Aggregate / Aggregate Root
- Domain Service
- Domain Event
- Repository Interface（僅介面）

重要特性：
- 純業務邏輯
- 不依賴框架
- 不依賴資料庫
- 不依賴 UI
- 高可測試性

### Application Layer（應用層）
職責：定義 Use Case 與流程編排，協調 Domain 完成任務。

常見構成：
- Use Case / Application Service
- Command / Query
- DTO
- Transaction Boundary

主要工作：
- 呼叫 Domain Model
- 控制交易流程
- 整合多個 Repository
- 協調多個 Aggregate

重要特性：
- 不包含核心業務規則
- 只負責流程編排
- 不依賴 UI
- 不實作資料存取

### Infrastructure Layer（基礎設施層）
職責：提供技術實作，連接資料庫與外部系統。

常見構成：
- Repository Implementation
- ORM / Database Adapter
- External API Client
- Messaging / Queue
- Cache
- File Storage
- Email / Payment / Cloud Service

主要工作：
- 實作 Domain 定義的 Repository Interface
- 與資料庫或外部系統通訊
- 提供技術支援服務

重要特性：
- 依賴 Domain
- 技術實作可替換
- 隔離技術細節

### User Interface Layer（使用者介面層）
職責：處理與外部世界互動（Web UI、API、CLI）。

常見構成：
- Controller / Handler
- Router
- View / Page
- Request / Response DTO
- Validation

主要工作：
- 接收使用者輸入
- 呼叫 Application Use Case
- 回傳結果或畫面

重要特性：
- 不包含業務邏輯
- 只負責輸入輸出
- 僅依賴 Application Layer

---

## 四層依賴關係

User Interface Layer
-> Application Layer
-> Domain Layer
<- Infrastructure Layer

核心規則：
- Domain 不依賴任何層
- Application 只依賴 Domain
- Infrastructure 實作 Domain 介面
- UI 只呼叫 Application Use Case

---

## 每一層「遷移物件」具體順序（新增）

### A. Domain Layer 內部遷移順序
1. Value Objects
2. Entities
3. Domain Services
4. Aggregates / Aggregate Roots
5. Domain Events
6. Repository Interfaces
7. Domain Invariants / Policies

為什麼這樣排：
- VO 是最底層語意基礎，先定義可避免型別漂移。
- Entity 依賴 VO，先有 VO 才能穩定建模。
- Service 先抽出可讓 Aggregate 專注一致性邊界。
- Aggregate 需要前面物件齊備才能正確封裝規則。
- Event 在 Aggregate 穩定後再定義，避免事件語意反覆改。
- Repository Interface 最後定義，讓抽象契約對齊穩定模型。
- Invariant/Policy 作為收斂檢查，避免漏規則。

### B. Application Layer 內部遷移順序
1. DTO（Input/Output）
2. Commands
3. Command Handlers / Use Cases
4. Queries
5. Query Handlers
6. Transaction Boundary / Unit-of-Work
7. Sagas / Process Managers

為什麼這樣排：
- 先凍結 DTO 才能固定 API 形狀。
- Command 與 Handler 先做，優先打通寫路徑。
- Query 後做，避免讀模型提早綁死。
- 交易邊界在主要流程穩定後補上最準確。
- Saga 最後，因其依賴多個 use case 與交易點。

### C. Infrastructure Layer 內部遷移順序
1. Repository Implementations（最小可用）
2. Database Adapters（Firestore/ORM）
3. Event Bus / Outbox Adapters
4. External API Clients
5. Cache Adapters
6. File Storage Adapters
7. Observability / Retry / Circuit Breaker

為什麼這樣排：
- 先讓核心資料讀寫可運作，再擴充周邊整合。
- Event/Outbox 早於外部 API，可先確保事件一致性。
- 觀測與韌性能力最後收斂，避免前期過度工程。

### D. User Interface Layer 內部遷移順序
1. Request Validation（schema）
2. Controllers / Server Actions / Route Handlers
3. ViewModel Mapper（DTO -> UI model）
4. Hooks / State Composition
5. Components / Pages
6. Router Wiring
7. Response Mapping / Error Presentation

為什麼這樣排：
- 先定義輸入驗證，能提早擋掉壞請求。
- Controller 先改接 Application，可立刻降低耦合。
- Component/Page 最後改，確保 UI 改動最少且可回退。

---

## Xuanwu 具體遷移順序（每層先遷移什麼）

### Step A: Domain Layer（先遷移）
先遷移項目：
1. Value Objects（先從 shared-kernel 與各 slice 的 _types 拆出）
2. Entities（將 domain.* 中純狀態與行為集中）
3. Aggregates / Invariants（先定義一致性邊界）
4. Domain Events（保留既有 event type 與 payload key）
5. Repository Interfaces（只定義介面，不做實作）

落地對應：
- 來源：features/<slice>/domain.*、core/_use-cases.ts 內的規則片段
- 目標：features/<slice>/domain/*

完成門檻：
- Domain 單元測試可獨立跑
- Domain 不 import firebase、不 import React

### Step B: Application Layer（第二）
先遷移項目：
1. Commands（先搬寫入路徑）
2. Queries（再搬查詢路徑）
3. Use Case / Application Service（整合 command/query）
4. Transaction Boundary（明確交易與補償點）
5. DTO（輸入輸出形狀固定）

落地對應：
- 來源：_actions.ts、_queries.ts、core/_use-cases.ts
- 目標：features/<slice>/application/commands|queries|sagas

完成門檻：
- 每個用例有 handler 測試
- Application 不直接連 DB，不含 UI 細節

### Step C: Infrastructure Layer（第三）
先遷移項目：
1. Repository Implementation（先對接最常用查寫）
2. Database Adapter（Firestore 相關）
3. Event Bus / Outbox Adapter（維持既有 IER 管線）
4. External API Client（若該 slice 有）

落地對應：
- 來源：shared-infra/firebase-client、slice 內技術呼叫點
- 目標：features/<slice>/infrastructure/* 或 shared-infra/*

完成門檻：
- 僅 Infrastructure 持有技術 SDK
- Repository 介面由 Domain/Application 驅動

### Step D: User Interface Layer（最後）
先遷移項目：
1. Server Actions / Controllers 轉呼叫 Application handlers
2. Pages/Components/Hooks 移除業務判斷，保留 I/O
3. Router/Request Validation 對齊 Application DTO

落地對應：
- 來源：app/、features/<slice>/_components、_hooks
- 目標：features/<slice>/presentation/* 與 app/*

完成門檻：
- UI 僅呼叫 Application
- 舊 API 透過 _legacy-api-adapter 相容

---

## Slice 級執行節奏（平滑過渡）
1. 建立四層空目錄，不改外部 API。
2. 先搬一個 Domain 用例（最小業務核心）。
3. 對應搬 Application handler。
4. 補 Infrastructure repository/adapters。
5. 最後重接 UI 到新 use case。
6. 每完成一個用例就驗證，不累積大量未驗證改動。

---

## 驗證與風險控制

每次遷移必跑：
- npm run typecheck
- npm run lint
- npm run test
- npm run check

若不按順序遷移的典型問題：
- 先改 UI：UI 反覆改版、回歸測試成本暴增。
- 先改 Infra：技術介面先行，Domain 被迫遷就 DB 結構。
- 先改 Application 但 Domain 未穩定：Use Case 持續重寫、交易邊界飄移。

---

## DoD（單一遷移單位）
- 新增或改造的 Domain 規則可獨立測試。
- Application handler 僅依賴 Domain + 抽象介面。
- Infrastructure 完成對介面的實作且可替換。
- UI 僅透過 Application 呼叫，不內嵌業務規則。
- 無新增跨切片 deep import。
- 無新增 domain/application 層直接技術 SDK 依賴。
