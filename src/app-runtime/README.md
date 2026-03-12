# src/app-runtime — Runtime Wiring Layer

## Architecture Role

`src/app-runtime` 是應用程式的執行期接線層，負責：
- React Provider 組裝
- Context 型別與容器
- AI Runtime（Genkit flow）入口

此層重點是「接線與初始化」，不承載領域規則或業務決策。

```
src/app (route / layout)
  └─> src/app-runtime (providers + contexts + ai)
        └─> src/shared | src/config | src/features (public API)
```

## Current Structure

```
src/app-runtime/
├── README.md
├── providers/
│   ├── README.md
│   ├── index.ts
│   ├── theme-provider.tsx
│   ├── i18n-provider.tsx
│   ├── firebase-provider.tsx
│   ├── auth-provider.tsx
│   ├── app-provider.tsx
│   ├── app-provider.queries.ts
│   ├── account-provider.tsx
│   └── account-provider.queries.ts
├── contexts/
│   ├── README.md
│   ├── index.ts
│   ├── app-context.ts
│   ├── account-context.ts
│   ├── auth-context.ts
│   ├── firebase-context.ts
│   └── i18n-context.ts
└── ai/
    ├── index.ts
    ├── genkit.ts
    ├── dev.ts
    ├── flows/
    │   ├── adapt-ui-color-to-account-context.ts
    │   └── extract-invoice-items.ts
    └── schemas/
        └── docu-parse.ts
```

## Runtime Provider Chain (Current)

`src/app/layout.tsx` 目前的 Provider 包裝順序（外到內）：

```
<ThemeProvider>
  <I18nProvider>
    <FirebaseClientProvider>
      <AuthProvider>
        <AppProvider>  // imported from @/features/workspace.slice
          {children}
          <Toaster />
        </AppProvider>
      </AuthProvider>
    </FirebaseClientProvider>
  </I18nProvider>
</ThemeProvider>
```

`AppProvider` 雖由 `workspace.slice` 對外匯出，但底層仍是 app-runtime 對應的 provider 能力，依賴方向必須維持單向。

## AI Runtime (`ai/`)

`ai/genkit.ts` 建立 Genkit instance，`ai/flows/*` 定義 server flow，`ai/schemas/*` 提供輸入輸出契約。

目前已註冊的 flow：
- `extractInvoiceItems`
- `adaptUIColorToAccountContext`

`extractInvoiceItems` 現在採用「OCR-first」輸入契約：
- 先由 `Document OCR Extractor` 產生 `Document Object`（text + entities + trace metadata）
- 再將該結構化 JSON 傳入 Genkit flow 做 line-item 與 semantic tag 抽取
- 不再直接把原始檔案 data URI 丟給 LLM prompt

## Dependency Boundaries

- ✅ 允許：`src/app-runtime` → `src/config`
- ✅ 允許：`src/app-runtime` → `src/shared`
- ✅ 允許：`src/app-runtime` → `src/shared/infra/*`
- ✅ 允許：`src/app-runtime` 透過 `src/features/*` 公開 API 進行組裝
- ❌ 禁止：其他層直接依賴 `src/app-runtime`（`src/app` 例外）
- ❌ 禁止：在此層新增領域商業規則或聚合邏輯
- ❌ 禁止：在此層直接散落 `firebase/*` SDK 呼叫（需走既有基礎設施邊界）

## Maintenance Notes

- 若調整 Provider 順序，請同步更新 `src/app/layout.tsx` 與本文件。
- 若新增 AI flow，請同步更新 `ai/index.ts` 與本文件 flow 清單。
- `providers/README.md` 與 `contexts/README.md` 保持為子目錄的細部規範來源。
