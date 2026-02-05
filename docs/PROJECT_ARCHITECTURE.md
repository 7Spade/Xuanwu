# src

src/
├── 📂 app/
│ ├── 📂 core/ # 基礎建設 (Global Infrastructure Core)
│ │ ├── 📂 auth/ # 認證與授權 (Signals-based Auth Store)
│ │ ├── 📂 interceptors/ # 函式化攔截器 (Functional Interceptors)
│ │ ├── 📂 providers/ # AppConfig 與全域依賴注入配置
│ │ ├── 📂 error-handler/ # 全域異常捕獲與日誌上報
│ │ └── 📂 services/ # 跨領域的技術服務 (例: StorageService)
│ │
│ ├── 📂 domain/ # 核心領域層 (Pure Domain - 無框架依賴)
│ │ ├── 📂 {bounded_context}/ # 依領域邊界劃分 (如: Sales, Inventory)
│ │ │ ├── 📂 aggregates/ # 聚合根 (Aggregates) - 核心業務一致性邊界
│ │ │ ├── 📂 entities/ # 領域實體 (Entities)
│ │ │ ├── 📂 value-objects/ # 值對象 (Value Objects - 不可變性實作)
│ │ │ ├── 📂 factories/ # 領域工廠 (Factories - 封裝複雜對象創建)
│ │ │ ├── 📂 events/ # 領域事件 (Domain Events)
│ │ │ ├── 📂 exceptions/ # 領域專屬異常 (Domain Exceptions)
│ │ │ ├── 📂 specifications/ # 規格模式 (Specifications - 複雜業務規則)
│ │ │ ├── 📂 repository-interfaces/# 倉儲介面 (定義持久化抽象)
│ │ │ ├── 📂 services/ # 領域服務 (Domain Services - 無狀態業務邏輯)
│ │ │ ├── 📂 state/ # 領域局部狀態 (Signal-based Logic Containers)
│ │ │ └── 📂 testing/ # 領域測試治具 (Mocks, Builders, Fakes)
│ │ └── 📂 shared/ # 領域層共通抽象 (BaseEntity, Identity)
│ │
│ ├── 📂 application/ # 應用層 (Application Orchestration)
│ │ ├── 📂 {module_name}/
│ │ │ ├── 📂 commands/ # 命令處理 (改變狀態的操作)
│ │ │ ├── 📂 queries/ # 查詢處理 (唯讀資料流 - Signals/Resource)
│ │ │ ├── 📂 dtos/ # 數據傳輸對象 (Request/Response)
│ │ │ ├── 📂 mappers/ # 雙向映射器 (Domain ↔ DTO)
│ │ │ └── 📂 use-cases/ # 業務用例 (具體業務流程流程排比)
│ │ └── 📂 ports/ # 應用層輸出介面 (ILogger, INotification)
│ │
│ ├── 📂 infrastructure/ # 基礎設施實作層 (Technical Implementation)
│ │ ├── 📂 persistence/ # 持久化實作 (API/GraphQL/IndexDB)
│ │ │ ├── 📂 repositories/ # Repo 具體實作
│ │ │ └── 📂 models/ # 資料庫/API 專屬模型 (Data Models)
│ │ ├── 📂 messaging/ # 消息傳遞 (EventBus, SignalR)
│ │ └── 📂 adapters/ # 第三方插件適配 (StripeAdapter, Auth0Adapter)
│ │
│ ├── 📂 features/ # 表現層 (UI Presentation - Smart Components)
│ │ ├── 📂 {feature_name}/
│ │ │ ├── 📂 pages/ # 路由級頁面 (使用 @defer 優化載入)
│ │ │ ├── 📂 containers/ # 邏輯容器組件 (連接 Application Layer)
│ │ │ ├── 📂 components/ # 視圖組件 (Presentational Components)
│ │ │ ├── 📂 models/ # UI 專屬 ViewModel (View-only Signals)
│ │ │ └── 📂 {name}.routes.ts # Standalone 路由定義
│ │ └── 📂 layout/ # 全域佈局 (Header, Sidebar, Footer)
│ │
│ └── 📂 shared/ # UI 共享層 (Dumb Components & Utilities)
│ ├── 📂 ui/ # 原子組件 (Buttons, Cards, Modals)
│ ├── 📂 directives/ # 功能性指令 (Highlight, Permission)
│ ├── 📂 pipes/ # 響應式管道 (Pure Pipes)
│ └── 📂 utils/ # 前端工具函式 (Date, Format)
│
├── 📂 shared-kernel/ # 共享內核 (跨領域界限的共通代碼)
│ ├── 📂 constants/ # 全域枚舉與常量
│ ├── 📂 types/ # 基礎 TypeScript 型別
│ └── 📂 guards/ # 跨模組通用路由守衛
│
├── 📂 assets/ # 靜態資源 (Images, JSON, Icons)
├── 📂 environments/ # 環境設定 (Dev, Prod, Staging)
└── 📂 styles/ # 全域樣式系統 (Variables, Mixins, Theme)

# functions

├── 📂 functions/ # 【後端 - Serverless DDD 架構】
│ ├── 📂 src/
│ │ ├── 📂 interfaces/ # 接口層 (Entry Points / Triggers)
│ │ │ ├── 📂 http/ # Https OnCall / OnRequest 處理器
│ │ │ ├── 📂 triggers/ # DB 觸發器 (Firestore, Auth, PubSub)
│ │ │ └── 📂 middleware/ # 後端中間件 (Auth Check, Validation)
│ │ │
│ │ ├── 📂 application/ # 應用層 (Orchestration)
│ │ │ ├── 📂 use-cases/ # 核心業務流程排比
│ │ │ ├── 📂 commands/ # 寫入操作意圖
│ │ │ ├── 📂 queries/ # 讀取操作意圖
│ │ │ ├── 📂 dtos/ # 接口輸入輸出模型
│ │ │ └── 📂 mappers/ # Domain ↔ DTO 轉換
│ │ │
│ │ ├── 📂 domain/ # 核心領域層 (Pure Logic)
│ │ │ ├── 📂 aggregates/ # 聚合根 (一致性邊界)
│ │ │ ├── 📂 entities/ # 實體
│ │ │ ├── 📂 value-objects/ # 值對象
│ │ │ ├── 📂 factories/ # 複雜實體工廠
│ │ │ ├── 📂 services/ # 領域服務 (跨實體邏輯)
│ │ │ ├── 📂 repository-interfaces/# 倉儲契約 (Interface)
│ │ │ └── 📂 events/ # 領域事件定義
│ │ │
│ │ ├── 📂 infrastructure/ # 基礎設施實作層
│ │ │ ├── 📂 persistence/ # DB 實作 (Admin SDK / Firestore / SQL)
│ │ │ ├── 📂 external-services/ # 外部 API 適配 (Stripe, SendGrid)
│ │ │ ├── 📂 messaging/ # 消息發送實作 (PubSub, FCM)
│ │ │ └── 📂 config/ # 環境變數與祕鑰管理 (Secret Manager)
│ │ │
│ │ └── 📂 shared/ # 後端內部共享工具
│ │
│ ├── 📂 tests/ # 後端單元測試與整合測試
│ ├── package.json
│ └── tsconfig.json
│
├── 📂 shared-kernel/ # 【跨端共享核 - 前後端共用】
│ ├── 📂 constants/ # 共享枚舉、狀態碼
│ ├── 📂 types/ # 共享 TypeScript 介面/型別
│ ├── 📂 validation/ # 共享驗證規則 (如 Zod Schema)
│ └── 📂 utils/ # 共享純函式 (Date formatting, Math)
│
├── 📂 docs/ # 架構文檔與 API 規範 (Swagger/OpenAPI)
├── angular.json
├── package.json
└── README.md
