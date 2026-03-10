# [索引 ID: @MAP] 00 - Architecture Index

本索引提供架構文件最短導覽。判讀順序固定如下：

1. `00-logic-overview.md`：架構拓撲 SSOT（鏈路、層位、邊界、裁決原則）。
2. `02-governance-rules.md`：規則正文 SSOT（RULESET / FORBIDDEN / 審查門檻）。
3. `03-infra-mapping.md`：路徑與 Adapter 對照 SSOT。
4. `01-logical-flow.md`：可讀性視圖（流程圖與閱讀路徑）。

若文件間有衝突，依下列優先序裁決：

`00-logic-overview.md` > `02-governance-rules.md` > `03-infra-mapping.md` > `01-logical-flow.md`

## 三條主鏈（Canonical Chains）

- 寫鏈：`L0 -> L0A(CMD_API_GW) -> L2 -> L3 -> L4 -> L5`
- 讀鏈：`L0/UI -> L0A(QRY_API_GW) -> L6 -> L5`
- Infra 鏈：
  - A 路（Client SDK）：`L3/L5/L6 -> L1(SK_PORTS) -> L7-A -> L8`
  - B 路（Admin SDK）：`L0/L2 -> L7-B(functions) -> L8`

## 架構文件

- `docs/architecture/00-logic-overview.md`
- `docs/architecture/01-logical-flow.md`
- `docs/architecture/02-governance-rules.md`
- `docs/architecture/03-infra-mapping.md`
- `docs/architecture/99-checklist.md`

## Slice 與不變量

- `docs/architecture/03-Slices/`
- `docs/architecture/04-Invariants/`
- `docs/architecture/06-DecisionLogic/`

## 審查入口

- PR 審查以 `docs/architecture/99-checklist.md` 為執行清單。
- 任何規則調整必須先改 `02-governance-rules.md`，再回填 `00/01/03` 引用。
