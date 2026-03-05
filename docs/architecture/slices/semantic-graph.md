# VS8 · Semantic Graph（SSOT Aligned）

## 責任

VS8 是全域語義唯一權威（`#17` / `A6`），負責 tag 定義、突觸圖、語義路由、因果追蹤、治理與廣播。

## 8層完全體（D21）

- `VS8_CORE`：tag 定義與 schema
- `VS8_GRAPH`：semantic edges + 權重
- `VS8_NG`：語義距離與因果推導
- `VS8_ROUTING`：policy mapping / dispatch bridge
- `VS8_BBB`：invariant guard（最高裁決）
- `VS8_PLAST`：learning + decay
- `VS8_PROJ`：`tag-snapshot` 唯讀出口
- `VS8_WIKI`：提案治理 + 共識校驗
- `VS8_IO`：生命週期訂閱與 outbox 廣播

## TE1~TE6（正規映射）

- `TE1 tag::user-level`
- `TE2 tag::skill`
- `TE3 tag::skill-tier`
- `TE4 tag::team`
- `TE5 tag::role`
- `TE6 tag::partner`

## 關鍵不變量

- `D21-1`：語義唯一註冊（只允許 CTA）
- `D21-2 / D22`：禁裸字串語義引用
- `D21-7`：讀寫分離（讀只能走 `tag-snapshot`）
- `D21-9`：`weight ∈ [0,1]`
- `D21-H / D21-K`：BBB 可直接拒絕衝突提案

## D27 Extension

- VS8 `_cost-classifier.ts` 輸出 `(costItemType, semanticTagSlug)`
- VS5 Layer-3 僅 `EXECUTABLE` 物化為 task
