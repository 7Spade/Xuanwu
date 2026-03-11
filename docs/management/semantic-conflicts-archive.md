# ⚡ Semantic Conflicts Archive

> **憲法依據 / Constitutional Basis**: `docs/architecture/00-logic-overview.md`
> **說明**: 本文件存檔所有已解決的語義衝突條目（狀態為 RESOLVED / ACCEPTED / FALSE_CONFLICT）。
> 活躍語義衝突請見 `semantic-conflicts.md`。

---

## 歸檔流程 / Archival Process

當一個語義衝突條目滿足以下任一條件時，從 `semantic-conflicts.md` 移入本文件：

- **RESOLVED**: 衝突的兩個模組已統一至一致的語義，並通過代碼審查
- **ACCEPTED**: 評估後確認兩種語義均有其存在的合理性，並明確文件化各自的使用場景邊界
- **FALSE_CONFLICT**: 確認並非真實語義衝突，而是命名混淆或文件描述不清（需附澄清說明）

歸檔時保留原始條目格式，並在頂部加入關閉記錄：

```
**關閉日期**: YYYY-MM-DD
**關閉原因**: RESOLVED / ACCEPTED / FALSE_CONFLICT
**解決方案**: (簡述統一語義的決策方向)
**關聯 Commit / ADR**: (實作參考)
```

---

## 已歸檔條目 / Archived Entries

## SC-001 · CRITICAL — Clamp-vs-Reject：`semantic-edge-store` 與 `semantic-guard` 的語義矛盾

**關閉日期**: 2026-03-09
**關閉原因**: RESOLVED
**解決方案**: `semantic-edge-store.addEdge()` 已改為拒絕 `weight <= 0 || weight > 1`，移除原先可接受零權重的矛盾語義。
**關聯 Commit / ADR**: 請見現行實作 `src/features/semantic-graph.slice/graph/edges/semantic-edge-store.ts`

[❗ 衝突（關閉前）]
- `semantic-edge-store` 可接受 `weight = 0`，但守衛層 `validateEdgeProposal` 拒絕 `weight = 0`。

[✅ 驗證證據]
- `src/features/semantic-graph.slice/graph/edges/semantic-edge-store.ts`

[📈 影響評估]
- 成效：零權重邊不再可被寫入，SC-001 的 Clamp-vs-Reject 衝突已消失。

---

## 語義裁決原則（複製自 semantic-conflicts.md）

當兩個模組對同一業務規則有衝突的實作時，裁決優先序如下：

1. **守衛層（D21-H BBB）** > 存儲層：守衛層的「拒絕」語義優先於存儲層的「靜默接受」
2. **shared-kernel（D4 SSOT）** > feature slice：全局定義優先於局部覆蓋
3. **明確驗證** > 隱式假設：有明確驗證的邏輯優先於依賴假設的邏輯

---

*最後更新: 2026-03-09 | 維護者: Copilot（語義衝突清理）*
