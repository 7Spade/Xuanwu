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

*目前無已歸檔條目。*

---

*最後更新: 2026-03-11 | 維護者: Copilot（清除已完成條目）*
