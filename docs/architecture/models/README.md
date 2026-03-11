# models/ — L6 領域模型層

> **層級職責**：定義聚合根邊界、實體與值物件、領域 invariant，以及跨聚合的領域事件觸發點。
> 此層是 L5（子行為）到 L7（契約）的橋樑；所有 ER 圖與聚合邊界標示均存放於此。

---

## 設計原則

- 每個聚合根必須明確標示**邊界**與**進入點（Application Service）**。
- 值物件不可跨聚合直接引用；使用 ID 引用代替物件引用。
- 跨聚合通訊只透過**領域事件**，不得直接呼叫其他聚合的 Repository。
- `workspaceId` 是所有資源的 scope 隔離鍵；不可省略。

---

## 本資料夾文件

| 文件 | 狀態 | 說明 |
|------|------|------|
| `domain-model.md` | ✅ 已建立 | ER 圖 + 聚合根設計（4 聚合根、跨聚合事件橋、XP 等級表） |

---

## 邊界驗證前置需求

在建立 `domain-model.md` 前，請確認以下文件已通過驗證：

- ✅ `../use-cases/use-case-diagram-saas-basic.md` (L1)
- ✅ `../use-cases/use-case-diagram-workspace.md` (L2)
- ✅ `../use-cases/use-case-diagram-resource.md` (L3)
- ✅ `../use-cases/use-case-diagram-sub-resource.md` (L4)
- ✅ `../use-cases/use-case-diagram-sub-behavior.md` (L5)
