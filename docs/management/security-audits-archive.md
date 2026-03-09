# 🔒 Security Audits Archive

> **憲法依據 / Constitutional Basis**: `docs/architecture/00-LogicOverview.md`
> **說明**: 本文件存檔所有已關閉的安全審計項目（狀態為 FIXED / ACCEPTED_RISK / FALSE_POSITIVE）。
> 活躍安全審計請見 `security-audits.md`。

---

## 歸檔流程 / Archival Process

當一個安全審計項目滿足以下任一條件時，從 `security-audits.md` 移入本文件：

- **FIXED**: 安全漏洞已修復並通過安全複審（Security Review）
- **ACCEPTED_RISK**: 風險評估後決定接受（需附 CVSS 重新評分與風險負責人簽核）
- **FALSE_POSITIVE**: 確認為誤報（需附分析說明）

歸檔時保留原始條目格式（含漏洞描述、攻擊向量、修復方案），並在頂部加入關閉記錄：

```
**關閉日期**: YYYY-MM-DD
**關閉原因**: FIXED / ACCEPTED_RISK / FALSE_POSITIVE
**修復 Commit**: (git commit SHA 或 PR 連結)
**複審人**: (審查人員)
```

---

## 已歸檔條目 / Archived Entries

## SA-001 · CRITICAL — BBB Guard Bypass 允許零權重邊注入

**關閉日期**: 2026-03-09
**關閉原因**: FIXED
**修復 Commit**: 請見現行實作 `src/features/semantic-graph.slice/graph/edges/semantic-edge-store.ts`
**複審人**: Copilot（文件清理複審）

[❗ 漏洞（關閉前）]
- `addEdge()` 可接受 `weight = 0`，使零權重邊可被注入。

[✅ 驗證證據]
- `src/features/semantic-graph.slice/graph/edges/semantic-edge-store.ts`

[📈 影響評估]
- 成效：零權重與越界權重已被拒絕，SA-001 原始攻擊向量已消除。
- 備註：架構面仍建議持續收斂至單一 BBB 守衛入口。

---

## 安全審計週期記錄 / Audit Cycle Log

| 審計日期   | 觸發原因              | 審計範圍                      | 發現項目數 | 狀態     |
|------------|-----------------------|-------------------------------|-----------|----------|
| 2026-03-06 | 初次架構合規審計（/audit）| 全代碼庫 VS8 語義圖寫入路徑 | 2         | IN PROGRESS |

---

*最後更新: 2026-03-09 | 維護者: Copilot（安全審計清理）*
