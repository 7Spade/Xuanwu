# 專案結構樹 (Project Tree)

根目錄概覽：

```
.
├── .github/
├── docs/
│   ├── PROJECT_ARCHITECTURE.md
│   ├── PROJECT_TREE.md
│   ├── DDD_LAYER_BOUNDARIES.md
│   └── ...
├── functions/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
├── public/
│   └── index.html
├── src/
│   ├── main.ts
│   ├── main.server.ts
│   ├── server.ts
│   ├── index.html
│   ├── app/
│   │   ├── app.component.ts
│   │   ├── app.component.spec.ts
│   │   ├── application/
│   │   ├── core/
│   │   │   ├── app.routes.ts
│   │   │   ├── app.routes.server.ts
│   │   │   └── providers/
│   │   ├── domain/
│   │   ├── features/
│   │   │   └── layout/
│   │   ├── infrastructure/
│   │   └── shared/
│   ├── shared-kernel/
│   │   ├── constants/
│   │   ├── guards/
│   │   └── types/
│   └── styles/
├── package.json
├── angular.json
└── README.md
```

重點資料夾（對應 `PROJECT_ARCHITECTURE.md` 的 8-layer DDD）:

```
src/
├── app/
│   ├── core/                # 全域基礎設施 (auth, providers, interceptors, services)
│   ├── domain/              # 純業務邏輯 (bounded contexts, aggregates, entities, value-objects)
│   ├── application/         # 應用層 (use-cases, commands, queries, dtos, ports)
│   ├── infrastructure/      # 技術實作 (persistence, adapters, messaging)
│   ├── features/            # 呈現層 (pages, containers, components, routes)
│   └── shared/              # UI 共用 (ui components, directives, pipes, utils)

shared-kernel/
├── constants/               # 共用常數/enum
├── types/                   # 共用型別/介面
└── validation/              # 共用驗證規則

functions/
├── src/
│   ├── interfaces/          # 入口/觸發器 (http, triggers)
│   ├── application/         # 後端應用層
│   ├── domain/              # 後端 domain (pure TS)
│   └── infrastructure/      # 後端基礎設施 (persistence, external services)

docs/
├── PROJECT_ARCHITECTURE.md  # 架構說明 (來源)
├── PROJECT_TREE.md          # 本檔 (結構樹)
├── DDD_LAYER_BOUNDARIES.md
├── IMPORT_RULES.md
└── ...
```

快速導覽（要點）：

- `app/domain/`：框架無依賴、100% 純 TypeScript 的領域模型與商業邏輯。
- `app/application/`：用例層，處理協調、DTO 與 ports/adapter interfaces。
- `app/infrastructure/`：第三方與 SDK 的具體實作（僅此層可使用瀏覽器 SDK）。
- `features/`：UI 功能群組，包含路由與呈現元件，僅透過 `application` 層存取 domain。
- `shared-kernel/`：前後端共用型別、常數與驗證，**不得有外部相依**。

如需我把此結構轉為 CI 檢查清單或 README 範本，請告訴我下一步。

