# diagrams/ — 圖表匯出資源

> **用途**：存放由 Mermaid 定義或工具產生的**靜態圖表圖片**（PNG / SVG）。
> 原始 Mermaid 程式碼留在各層的 `.md` 文件內；此資料夾只存放匯出快照用於簡報或外部引用。

---

## 命名規則

```
{layer}-{diagram-type}-{short-name}-{YYYY-MM-DD}.{ext}
```

範例：
- `L3-usecase-resource-2025-01-01.png`
- `L6-er-domain-model-2025-01-15.svg`
- `L8-sequence-assignment-saga-2025-02-01.png`

---

## 注意事項

- 圖片不可作為架構設計的 SSOT；SSOT 永遠是對應的 `.md` 文件。
- 圖片更新時，同步更新檔名中的日期，舊版本可直接覆蓋或刪除。
- 大型圖片（> 500KB）請先壓縮再提交。

---

## Mermaid 出圖前檢查模板（Boundary-First）

> 原則：Serena 能做高品質 Mermaid 的前提，是先做架構邊界驗證，不是直接畫圖。

### A. 邊界完成度

- [ ] L1-L3 已完成（平台/工作區/資源）
- [ ] L4 已完成（子資源 ownership/scope/parent_id）
- [ ] L5 已完成（行為守衛/狀態機/事件）
- [ ] L6-L9 已同步（domain/spec/blueprint/guideline）

### B. 圖面一致性

- [ ] 每個節點都標示 scope（workspace / org / personal）
- [ ] 每條關係都有語義（depends_on / requires_skill / feed_source）
- [ ] 每條狀態轉移都有觸發條件（command 或 event）
- [ ] 拒絕路徑與 guard failure 有明確標示

### C. 可追溯性

- [ ] 圖中的術語都可在 `../glossary/README.md` 查到
- [ ] 圖中流程都可在 `../specs/contract-spec.md` 對到 command/event
- [ ] 圖中決策都可在 `../adr/README.md` 對到 ADR

---

## 推薦出圖流程

1. 先更新對應層文件（use-cases / models / specs / blueprints / guidelines）。
2. 用本模板完成 A/B/C 三段檢查。
3. 再產生 Mermaid 並匯出 PNG/SVG。
4. 最後更新 `docs/architecture/README.md` 的狀態與索引。

---

## Diagram Catalog 模板

| Diagram ID | 圖類型 | 來源文件 | 邊界狀態 | 匯出檔案 | 審核狀態 | 更新日 |
|-----------|--------|---------|---------|---------|---------|-------|
| `L5-SM-task-item` | stateDiagram | `docs/architecture/use-cases/use-case-diagram-sub-behavior.md` | Verified | `L5-state-task-item-YYYY-MM-DD.svg` | Draft | YYYY-MM-DD |
| `L8-SEQ-xp-settlement` | sequenceDiagram | `docs/architecture/blueprints/application-service-spec.md` | Verified | `L8-sequence-xp-settlement-YYYY-MM-DD.png` | Draft | YYYY-MM-DD |

欄位規則：

- `Diagram ID`：跨文件唯一，推薦格式 `{Layer}-{Type}-{Name}`。
- `邊界狀態`：`Draft` / `Validated` / `Verified`。
- `審核狀態`：`Draft` / `Reviewed` / `Published`。
