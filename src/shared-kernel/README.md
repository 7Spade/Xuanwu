# Shared Kernel（L1 · VS0）

此層為全域契約中心，對齊 `docs/00-LogicOverview.md` 的 L1（Shared Kernel）定義。

## 目錄結構

```text
src/
├── shared-kernel/              # 🔷 L1 · VS0 (全域契約中心)
│   ├── data-contracts/         # 📄 基礎資料契約 [#8]
│   ├── infra-contracts/        # ⚙️ 基礎設施行為契約 (S1-S6)
│   ├── ports/                  # 🔌 Infrastructure Ports [D24]
│   └── index.ts                # [D7] 唯一公開出口 (所有切片僅能從此引用)
```

## 子目錄職責

- `data-contracts/`
	- 放置跨切片共用的資料契約（例如 event envelope、authority snapshot、skill requirement、command result）。
	- 作為領域與基礎設施之間的共同語義基線（對應 [#8]）。

- `infra-contracts/`
	- 放置全域基礎設施行為契約與限制，包含 S1～S6（Outbox、Version Guard、Read Consistency、Staleness、Resilience、Token Refresh）。
	- 所有切片必須引用契約常數，禁止硬編碼行為與 SLA 數值。

- `ports/`
	- 定義依賴倒置介面（Infrastructure Ports），供 feature slices 透過介面使用底層能力。
	- 依 [D24]，feature slice 不可直接 `import firebase/*`，必須經由 ports/adapter 邊界存取。

- `index.ts`
	- 共享核心層的唯一公開出口。
	- 依 [D7]，跨切片引用只能透過公開 index，禁止深層路徑直引內部檔案。

## 使用原則

- Shared Kernel 僅承載「跨切片、跨層可重用」的契約與介面，不放業務流程邏輯。
- 若新規則未在 `docs/00-LogicOverview.md` / `docs/knowledge-graph.json` 定義，先補齊規格再實作。
- 新增契約時，請同步由 `index.ts` 顯式匯出，維持可觀測且可治理的公共 API 邊界。

## 相容遷移（Legacy → Canonical）

- Canonical 目標入口：`@/shared-kernel`（`src/shared-kernel/index.ts`）。
- 匯入入口統一為：`@/shared-kernel`（canonical）。
- 新增/修改程式碼時，優先使用 Canonical 入口；舊路徑以分批遷移方式逐步收斂。
