# Semantic Intelligent Matching Architecture

我們正在建構一套「基於語義的智慧匹配架構（Semantic Intelligent Matching Architecture）」，透過整合本體論、向量索引與知識圖譜，解決人力資源中的複雜分派問題。

## 1. 知識表示與檢索基礎設施

### 1.1 語義資料結構

- 知識圖譜（Knowledge Graph）：邏輯大腦
- 向量資料庫（Vector Database）：記憶模組
- 技能本體論 / 分類法（Skills Ontology / Taxonomy）：語言定義

### 1.2 核心資料集合

- `employees`（員工）
- `tasks`（任務）
- `skills`（技能庫）

## 2. Genkit AI 工具鏈

以 `genkit-ai` 編排工具呼叫流程：

- `search_skills`（基於本體論）
  說明：當 AI 不確定技能術語時，查詢 `skills` 集合以對齊標準詞彙。
- `match_candidates`（基於向量資料庫）
  說明：將任務需求向量化後，在 Firestore 向量索引中搜尋候選人。
- `verify_compliance`（基於知識圖譜邏輯）
  說明：取得候選人後，檢查是否符合合約要求的必要證照（例如 ABB ECAP）。

## 3. 落地實作順序

1. 定義 Schema：
	在 Firestore 建立 `employees`、`tasks`、`skills` 三個集合，並以 TypeScript `interface` 定義結構。
2. 設定 Vector Index：
	在 Firebase Console 為 `skills` 或 `employees` 的向量欄位建立索引。
3. 開發 Genkit Tools：
	先實作讀取 Firestore 的函式，再用 Genkit `defineTool` 註冊。
4. Prompt Engineering：
	設計 System Prompt，明確約束 AI 必須「先過濾資質，再進行技能匹配」。

## 4. 執行原則

- 先做資格與合規過濾，再做相似度匹配。
- 所有技能詞彙必須回到本體論標準詞。
- 匹配結果需要可追溯（可說明為何匹配、為何排除）。