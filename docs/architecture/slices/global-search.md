# global-search.slice（SSOT Aligned）

## 責任

唯一跨域搜尋權威（`D26` / `#A12`）。任何業務切片不得自建搜尋邏輯。

## 依賴

- 讀 L6 Query Gateway
- 語義索引對接 VS8
- 讀 `tag-snapshot` 進行語義擴展

## Mandatory Rules

- `D26`：唯一跨域搜尋出口
- `D7`：跨切片引用只走公開 API
- `T5`：語義視覺/分類資訊來自投影，不讀圖內部結構

## 查詢鍵

- 必須支援 `semanticTagSlug` 作為一級索引鍵
