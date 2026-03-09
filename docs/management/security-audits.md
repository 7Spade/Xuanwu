# 🔒 Security Audits Register

> **憲法依據 / Constitutional Basis**: `docs/architecture/00-LogicOverview.md`
> **資料來源 / Data Source**: `/audit` 全鏈路架構合規性審計 (2026-03-06)
> **說明**: 安全審計聚焦於可被惡意利用或引發資料完整性破壞的架構漏洞。

---

## 嚴重程度一覽 / Severity Overview

| ID     | 模組                               | 規則        | 嚴重程度 | 狀態  |
|--------|------------------------------------|-------------|----------|-------|
| SA-002 | `SK_STALENESS_CONTRACT` 雙重定義    | D4          | MEDIUM   | OPEN  |

---

## SA-002 · MEDIUM — `SK_STALENESS_CONTRACT` 雙重定義，鮮度語義歧義

**嚴重程度**: MEDIUM · **狀態**: OPEN
**關聯規則**: D4 (Single Source of Truth), D8 (Cost-Output Contract)

### 漏洞描述

`SK_STALENESS_CONTRACT`（緩存鮮度合約）在代碼庫中存在**兩個獨立定義**，
雙方定義的 `maxAgeMs` 值可能不一致，導致緩存失效邏輯依賴哪個定義而呈現不同行為。

### 現狀

在不同模組中發現兩處 `SK_STALENESS_CONTRACT` 定義：
- `src/shared-kernel/` 中的全局定義
- `src/features/` 某 slice 中的局部覆蓋定義

兩個定義的 `maxAgeMs` 值是否一致尚未確認，但雙重定義本身就違反了 D4（唯一真實來源原則）。

### 安全風險

1. **緩存投毒（過期鮮度）**: 如果局部定義的 `maxAgeMs` 比全局定義更長，
   某些消費者會使用更舊的緩存數據而不知情，導致語義查詢結果陳舊
2. **緩存抖動（過短鮮度）**: 如果局部定義更短，會導致不必要的緩存失效，
   增加 Firestore 讀取次數，引發效能問題（見 performance-bottlenecks.md）
3. **升級漂移**: 當全局定義的值被調整時，局部定義不會自動同步，
   導致「更新了但沒生效」的隱性 Bug

### 修復方案

1. **定位**: 搜索代碼庫中所有 `SK_STALENESS_CONTRACT` 或等效的緩存鮮度常量定義
2. **合併**: 刪除局部定義，所有消費者統一引用 `src/shared-kernel/` 的全局定義
3. **防護**: 在 ESLint 規則中加入對 `SK_STALENESS_CONTRACT` 重複定義的禁止規則

```bash
# 快速定位重複定義
grep -rn "SK_STALENESS_CONTRACT\|maxAgeMs.*staleness\|STALENESS_CONTRACT" src/
```

### 驗證步驟

確保整個代碼庫中 `SK_STALENESS_CONTRACT` 或等效常量只有一個定義來源，
且所有消費者均從 `shared-kernel` 導入而非本地定義。

---

## 安全審計備註 / Audit Notes

### D21-H BBB 架構強制執行狀態

| 層次                      | 是否強制執行 BBB 守衛 | 備注                              |
|---------------------------|----------------------|-----------------------------------|
| `centralized-guards/`     | ✅ 實作完整          | `validateEdgeProposal()` 覆蓋全部規則 |
| `centralized-edges/addEdge()` | ⚠️ 部分收斂 | 已封鎖無效 weight；仍建議統一守衛入口 |
| `centralized-neural-net/` | ✅ 僅讀，無寫入路徑  | 無安全風險                        |
| `projections/`            | ✅ 僅讀，無寫入路徑  | 無安全風險                        |

### 下一次審計計劃

- **觸發條件**: 任何 VS8 語義圖寫入路徑的新增或修改
- **重點**: 確認所有 `addEdge()` / `removeEdge()` 呼叫方最終收斂至單一 BBB 守衛入口
- **計劃日期**: SA-002 修復後的 Sprint 結束時進行驗證複審

---

*最後更新: 2026-03-09 | 維護者: Copilot（已移除 SA-001 至 archive）*
