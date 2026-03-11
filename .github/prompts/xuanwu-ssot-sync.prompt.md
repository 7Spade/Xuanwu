---
name: xuanwu-ssot-sync
description: 'Sync docs/architecture/* with the Xuanwu Semantic Kernel and Matchmaking Protocol SSOT. Use in GitHub Copilot browser or VS Code to verify and realign architecture documentation against the canonical protocol sequence.'
agent: 'xuanwu-architecture-chief'
argument-hint: 'Target scope, e.g.: full sync | check Phase 2 alignment | verify governance rules | audit infra mapping'
---

# Xuanwu SSOT Sync — 語義核心協議對齊指令

## 事實來源（Source of Truth）

**主協議 SSOT（Semantic Kernel & Matchmaking Protocol）：**
`Xuanwu-Semantic-Kernel-and-Matchmaking-Protocol.md`

這份序列圖定義四個 Phase 的參與者身份、步驟編號與治理規則，是所有架構文件的對齊基準：

| Phase | 名稱 | 關鍵治理規則 |
|-------|------|-------------|
| **Phase 0** | 核心初始化（Kernel Bootstrap & Tag Ontology） | VS0 → D3 types；Admin → L8 Ontology |
| **Phase 1** | 寫入鏈（Write Chain & Data Ingestion） | FI-002（Firestore 單一事務）；LANE 分流 |
| **Phase 2** | 語義智慧匹配（Intelligent Matching） | E8 fail-closed（tenantId）；GT-2 fail-closed（certs）；L4A（Who/Why/Evidence/Version/Tenant）；工具順序不可倒置 |
| **Phase 3** | 讀取鏈（Output & Query Chain） | D27 Read Model；VS6 排班視圖 |

---

## 自然語言指令（Natural Language Instructions）

以下是可在 **GitHub Copilot 瀏覽器版（github.com Copilot Chat）** 或 VS Code 中直接輸入的自然語言指令，用於驗證與對齊架構文件：

### 📋 全面對齊檢查

```
讀取 Xuanwu-Semantic-Kernel-and-Matchmaking-Protocol.md，然後核對 docs/architecture/README.md 所列出的架構文件，找出與協議 Phase 0/1/2/3 不一致的地方，列出差異清單。
```

### 🔍 Phase 2 匹配協議對齊

```
根據 Xuanwu-Semantic-Kernel-and-Matchmaking-Protocol.md Phase 2 的步驟 2.1 至 2.14，確認 docs/architecture/README.md 中所列架構文件的 E8（tenantId fail-closed）、GT-2（證照硬過濾）與 L4A（Who/Why/Evidence/Version/Tenant）規則是否完整且準確。
```

### 🏗️ 基礎設施路徑驗證

```
比較 Xuanwu-Semantic-Kernel-and-Matchmaking-Protocol.md 中的 L0B、L4A、L10、Tool-S、Tool-M、Tool-V 參與者定義，與 docs/architecture/README.md 所列架構文件的路徑對照表，確認路徑欄位是否對齊。
```

### 📊 治理規則完整性審查

```
根據 Xuanwu-Semantic-Kernel-and-Matchmaking-Protocol.md，逐項驗證 docs/architecture/README.md 所列架構文件中有關 AI 匹配安全門的五項檢核項目是否覆蓋 E8 fail-closed、GT-2 fail-closed、L4A 五欄位、L0B streaming 與工具呼叫順序。
```

### ✏️ 差異修正

```
針對上述差異，依照 Xuanwu-Semantic-Kernel-and-Matchmaking-Protocol.md 的步驟編號與參與者定義，更新對應的架構文件，使所有文件與協議 SSOT 保持一致。不得新增協議未定義的參與者或步驟。
```

### 📖 協議摘要輸出

```
讀取 Xuanwu-Semantic-Kernel-and-Matchmaking-Protocol.md，以繁體中文輸出每個 Phase 的三句話摘要，包含參與者清單、核心流程步驟與主要治理約束。
```

---

## 對齊範圍（Target Documents）

| 文件 | 對齊重點 |
|------|---------|
| `docs/architecture/README.md` | 架構文件資料夾導覽（邏輯流向、治理規則、基礎設施映射、Phase 表格） |

---

## 限制（Constraints）

- 對齊時**不得**新增協議未定義的參與者、步驟或規則。
- 如有衝突，以 `Xuanwu-Semantic-Kernel-and-Matchmaking-Protocol.md` 的步驟編號與參與者定義為準。
- 層位方向與邊界規則仍以 `docs/architecture/README.md` 為最終裁決。
- 更新後必須確保文件間術語一致。
