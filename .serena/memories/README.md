# Xuanwu Serena Memory Index

此目錄為 Xuanwu 專案的 Serena 結構化記憶索引。

## 架構與遷移（Architecture）
- architecture/index
  - architecture 子索引入口
  - 匯總 DDD 目錄設計與遷移策略
- architecture/ddd-folder-tree-design
  - 目標 DDD 資料夾樹（保留 feature slice，內部導入四層）
  - 目錄映射：現有 _actions/_queries/domain.* -> application/domain/presentation
- architecture/ddd-migration-strategy
  - 正式遷移順序：Domain -> Application -> Infrastructure -> User Interface
  - 每層內部遷移物件順序（VO/Entity/Aggregate...）與原因
  - 每層先遷移項目、依賴規則與風險控制

## 建議讀取順序
1. architecture/index
2. architecture/ddd-folder-tree-design
3. architecture/ddd-migration-strategy

## 快速操作
serena-read_memory("architecture/index")
serena-read_memory("architecture/ddd-folder-tree-design")
serena-read_memory("architecture/ddd-migration-strategy")

## Forced Update Log
- 2026-03-12: Memory + Index forced update completed (Serena session end requirement)
- 2026-03-12: Memory + Index forced update completed (conversation refresh after README change)
- 2026-03-13: Memory + Index forced update completed (migration-order clarification)
- 2026-03-13: Memory + Index forced update completed (layer-object-order update)
- 2026-03-13: Memory + Index forced update completed (architecture index creation via Serena)
