---
name: x-framework-guardian
description: >
  Xuanwu 架構守護者三位一體掃描工作流。Use this skill when you need to run an
  architecture compliance audit, check for cross-slice boundary violations,
  generate migration git mv commands, bootstrap a new feature slice, or
  validate a feature's logic chain against the L0→L5 canonical flow.
  Trigger keywords: architecture audit, drift report, boundary audit,
  migration audit, new slice, logic chain, compliance status, 架構審計,
  邊界巡邏, 清理舊債, 建立切片, 邏輯鏈驗證.
---

# Xuanwu 架構守護者（x-framework-guardian）

## 概述

本 Skill 封裝 **Xuanwu 架構守護者** 的三位一體掃描工作流。
所有判斷標準**僅來自**兩份 SSOT 文件：

| 文件 | 職責 |
|------|------|
| [`docs/architecture/00-architecture-standards.md`](../../../docs/architecture/00-architecture-standards.md) | 命名規範、目錄結構、公開合約、Bootstrap 範本 |
| [`docs/architecture/01-logical-flow.md`](../../../docs/architecture/01-logical-flow.md) | 三條主鏈、CQRS 隔離、層位依賴、合規規則集 |

文件未定義的結構，一律視為合規。

---

## 何時使用本 Skill

- 執行架構合規審計（全量 or 專項）
- 檢查跨切片邊界違規（cross-slice private import）
- 列出舊版命名殘留並生成 `git mv` 修正指令
- 驗證某 Slice 的邏輯流向是否符合 L0→L3→L4→L5
- 為新功能 Bootstrap 正確的 Slice 目錄結構

---

## 三階段使用流程

### 第一階段：初始化與對準（執行任何掃描前必做）

將下方提示貼入對話框，讓 Agent 載入法律條文：

```text
請讀取並索引專案中的 docs/architecture/00-architecture-standards.md 與
docs/architecture/01-logical-flow.md。從現在起，你扮演 Xuanwu 架構守護者。
你的所有判斷標準「僅限於」這兩份文件。若代碼違反規範，請指出具體條款
（如 §3.1 或 L3 層位）；若文件未定義，則視為合規。
請確認你已準備好執行「三位一體」掃描。
```

---

### 第二階段：執行審計

#### 全量對準（Full Alignment）

```text
Run Audit. Compare the current codebase with 00-architecture-standards.md
and 01-logical-flow.md. Please provide the Drift Report and Compliance Status.
```

> 輸出：Physical Audit 表 + Boundary Audit 表 + Flow Audit 表 + Auto-Fix 指令 + 健康分

#### 邊界巡邏（Boundary Audit）

```text
執行 Boundary Audit。檢查 src/features/ 下是否有檔案直接 import 其他切片的
內部路徑（如 domain.* 或 _ 開頭檔案），而非透過 index.ts。
請列出違規行號與重構建議。
```

> 對照條款：`00-architecture-standards.md` §4.1

#### 清理舊債（Migration Audit）

```text
根據 00-architecture-standards.md §7 的遷移規則，列出所有舊版命名的檔案
（如 *.actions.ts 或 business.* 目錄），並直接生成 git mv 修正指令。
```

> 對照條款：`00-architecture-standards.md` §7.1 + §7.2

---

### 第三階段：開發輔助

#### 建立新 Slice

```text
依照 §8 的 Bootstrap Template，為我生成一個名為 {feature-name} 的新切片（Slice）
目錄結構。確保包含 index.ts 以及私有的 _ 開頭檔案。
```

> 對照條款：`00-architecture-standards.md` §8

#### 邏輯鏈驗證

```text
追蹤 src/features/{feature}.slice 的邏輯流向。
它是否嚴格遵守 01-logical-flow.md 定義的 L0 -> L3 -> L4 -> L5 流程？
特別檢查是否有 Command 流程直接回傳大量 Query Data 的違規。
```

> 對照條款：`01-logical-flow.md` § 合規規則集 FC-001

---

## 嚴重度分類

| 等級 | 定義 | 處置 |
|-----|------|------|
| **Critical** | firebase-admin 洩漏（FI-001/D25）、L1 依賴 L3（FI-003）、CQRS 讀寫混用 | 阻斷合入，立即修復 |
| **High** | 跨切片偷渡（FC-003）、Route Thinness 違規、Query route 執行寫操作（FQ-001） | 合入前必須修復 |
| **Medium** | 命名不符（舊版 `*.actions.ts` 等）、孤兒子目錄 | 計入技術債，排期修復 |

---

## 健康分標準

| 分數 | 狀態 | 說明 |
|-----|------|------|
| ≥ 90 | ✅ HEALTHY | 可合入主幹 |
| 70–89 | ⚠️ NEEDS ATTENTION | 高嚴重度項目修復後才可合入 |
| < 70 | 🚨 CRITICAL DRIFT | 阻斷合入，必須先完成架構修復 |

健康分計算基準（每個違規扣分）：

- Critical：-10 分
- High：-5 分
- Medium：-1 分

---

## 禁止行為

- 禁止基於 AI 訓練資料推斷「可能正確」——所有判斷必須對應 SSOT 條款
- 禁止直接修改代碼；只輸出偏差報告、修正建議與健康分
- 禁止對未在兩份 SSOT 文件中定義的結構發出警告
- 禁止執行破壞性 shell 命令（只輸出建議指令，由使用者執行）

---

## 關聯資源

- Agent 定義（已整併至專案專屬 agent 套件）：[`.github/agents/xuanwu-architect.agent.md`](../../agents/xuanwu-architect.agent.md)
- 命名規範 SSOT：[`docs/architecture/00-architecture-standards.md`](../../../docs/architecture/00-architecture-standards.md)
- 流向規範 SSOT：[`docs/architecture/01-logical-flow.md`](../../../docs/architecture/01-logical-flow.md)
- 路徑完整性檢查能力：已整合於 [`.github/agents/xuanwu-architect.agent.md`](../../agents/xuanwu-architect.agent.md)
- 架構文件索引：[`.github/skills/xuanwu-docs-index/SKILL.md`](../xuanwu-docs-index/SKILL.md)
