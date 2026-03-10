# 03-Slices

本目錄承載 VS1~VS9 的切片架構文件，並維護 auxiliary slices 的回寫規則。

- 共用規範：`00-slice-standard.md`
- 每個 VS 子目錄：聚焦該切片的寫路徑、讀路徑、不變量與禁止路徑
- 依賴方向：遵守單向鏈 `L0 -> L2 -> L3 -> L4 -> L5` 與 `L0/UI -> L6 -> L5`
- Finance 相關切片：`VS9-Finance/`（`A20`、`A21`、`A22`）
- Auxiliary slices（非 VS 編號）：`global-search.slice`、`portal.slice`

## Code-backed 回寫基線

- 回寫來源固定先讀：`skills/SKILL.md`。
- 目錄定位使用：`skills/references/project-structure.md`。
- 能力檢索使用：`skills/references/files.md`（以 `## File: <path>` 驗證）。
