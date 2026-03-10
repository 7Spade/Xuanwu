# 🚀 Performance Bottlenecks Register

> **憲法依據 / Constitutional Basis**: `docs/architecture/00-logic-overview.md`
> **資料來源 / Data Source**: `/audit` 全鏈路架構合規性審計 (2026-03-09)
> **說明**: 效能瓶頸是「當前可運行但在規模增長後將成為系統限制」的架構缺陷。

---

## 瓶頸一覽 / Bottleneck Overview

| ID     | 模組                             | 複雜度    | 嚴重程度 | 狀態  |
|--------|----------------------------------|-----------|----------|-------|
| PB-001 | `neural-network.ts` Dijkstra     | O(V²)     | HIGH     | OPEN  |
| PB-002 | `buildDistanceMatrix()` 全圖     | O(V³)     | HIGH     | OPEN  |
| PB-003 | `SK_STALENESS_CONTRACT` 雙重定義  | —         | MEDIUM   | OPEN  |

---

## PB-001 · HIGH — `neural-network.ts` Dijkstra 使用陣列線性搜尋，O(V²) 效能瓶頸

**嚴重程度**: HIGH · **狀態**: OPEN · **關聯規則**: D21-6 (Neural Computation)

### 問題描述

`semantic-graph.slice/graph/neural-net/neural-network.ts` 中的 `_dijkstra()` 實作 Dijkstra
最短路徑算法，但使用**陣列線性搜尋**尋找最小距離節點，導致每次迭代的時間複雜度為 O(V)，
整體 Dijkstra 複雜度為 **O(V²)**，而非優先佇列應有的 **O((V+E) log V)**。

### 現狀分析（已確認）

```typescript
// src/features/semantic-graph.slice/graph/neural-net/neural-network.ts
// _dijkstra() 第 74-89 行（精確）
while (queue.length > 0) {
  // Extract minimum-distance entry (simple linear scan — graph is small)
  let minIdx = 0;
  for (let i = 1; i < queue.length; i++) {        // ← O(V) 線性掃描
    if (queue[i].distance < queue[minIdx].distance) minIdx = i;
  }
  // splice 與上方 for 迴圈合計每次迭代 O(V)（線性掃描 O(V) + splice O(V)）
  const current = queue.splice(minIdx, 1)[0];
  // ...
}
```

程式碼中有特意注釋 `"simple linear scan — graph is small"`，
說明這是一個有意識的短期選擇，在圖規模增大後應被替換。

### 效能影響估算

| 語義圖規模（標籤數）| 當前 O(V²) 操作次數 | 優化後 O(V log V) 操作次數 |
|--------------------|-----------------------|---------------------------|
| 100 標籤           | ~10,000               | ~700（14x 加速）          |
| 1,000 標籤         | ~1,000,000            | ~10,000（100x 加速）      |
| 5,000 標籤         | ~25,000,000           | ~60,000（416x 加速）      |

### 修復方案

**短期（3-5 天）**: 使用二元堆（Binary Heap）替換線性搜尋：

```typescript
// 替換 queue 為最小堆（按 distance 升序）
// 可使用自實作的簡單最小堆，無需引入新依賴
class MinHeap {
  private data: _QueueEntry[] = [];
  push(entry: _QueueEntry) { /* sift up */ }
  pop(): _QueueEntry | undefined { /* sift down */ }
}
```

**預估工作量**: 2-3 人天（實作 + 效能測試）

---

## PB-002 · HIGH — `buildDistanceMatrix()` 在全圖執行，O(V × (V²+E)) 初始化瓶頸

**嚴重程度**: HIGH · **狀態**: OPEN · **關聯規則**: D21-6, D21-10 (Topology Observability)

### 問題描述

`neural-network.ts` 的 `computeSemanticDistanceMatrix()` 對**圖中每個節點**執行一次完整的 Dijkstra，
計算所有節點對（All-Pairs Shortest Paths，APSP）的距離矩陣。
由於 PB-001 的 O(V²) 問題，整體複雜度為 **O(V × (V² + E)) ≈ O(V³)**。

### 現狀分析（已確認）

```typescript
// src/features/semantic-graph.slice/graph/neural-net/neural-network.ts
// computeSemanticDistanceMatrix() — 對每個節點執行完整 Dijkstra
export function computeSemanticDistanceMatrix(
  slugs?: readonly string[],
  maxHops = 10
): SemanticDistanceEntry[] {
  const targetSlugs = slugs ?? Array.from(getAllEdges()...);  // O(V)
  const matrix: SemanticDistanceEntry[] = [];

  for (const source of targetSlugs) {           // V 次外層迭代
    for (const target of targetSlugs) {          // V 次內層迭代
      matrix.push({
        fromSlug: source,
        toSlug: target,
        distance: computeSemanticDistance(source, target, maxHops),  // 每次 O(V²)
        ...
      });
    }
  }
  return matrix;
}
// 總複雜度：O(V³)（對 V 個節點，每次 Dijkstra O(V²)，外層 V 次迭代）
```

### 效能影響估算

| 語義圖規模 | `computeSemanticDistanceMatrix()` 估算操作次數 |
|-----------|------------------------------------------------|
| 100 標籤  | ~1M 次（可接受）                               |
| 500 標籤  | ~125M 次（顯著延遲，>1s）                       |
| 1,000 標籤 | ~1,000M 次（**可能阻塞主執行緒 >10s**）        |

### 修復方案

**短期 A — 延遲計算（Lazy Computation）**: 只在需要特定節點對距離時才計算：
```typescript
// 按需計算，不預計算全矩陣
export function getDistance(from: string, to: string): number {
  const cacheKey = `${from}::${to}`;
  if (!_distanceCache.has(cacheKey)) {
    const dist = computeSemanticDistance(from, to);
    _distanceCache.set(cacheKey, dist);
  }
  return _distanceCache.get(cacheKey) ?? Infinity;
}
```

**短期 B — 減少呼叫範圍**: `computeSemanticDistanceMatrix()` 接受候選子集，
而非全圖計算（VS6 排班只需要與候選 tag 的距離）

**長期 — Floyd-Warshall 增量更新**: 初次 O(V³) 預計算後，邊更新時僅 O(V²) 增量更新

**預估工作量**: 3-5 人天（Lazy 方案較快；Floyd-Warshall 需要更長的設計時間）

---

## PB-003 · MEDIUM — `SK_STALENESS_CONTRACT` 雙重定義引發不必要的緩存失效

**嚴重程度**: MEDIUM · **狀態**: OPEN · **關聯規則**: D4, D8
**關聯 Security**: SA-002

### 問題描述

`SK_STALENESS_CONTRACT` 的雙重定義（見 SC-002）導致潛在的緩存策略不一致：

兩份定義（`shared-kernel/infra-contracts/staleness-contract/index.ts` 與
`shared-infra/firebase-admin/functions/src/staleness-contract.ts`）目前數值相同，
但 Firebase Functions 側的定義**缺少 `PROJ_STALE_DEMAND_BOARD: 5_000`** 條目。

- 若 Firebase Functions 側在排班相關邏輯中需要 Demand Board 鮮度常量，
  可能會直接硬編碼 `5000`（違反 S4）
- 兩份定義各自獨立演化，若未來調整閾值可能只更新一處

### 影響估算

假設某高頻查詢路徑因缺少 `PROJ_STALE_DEMAND_BOARD` 而使用錯誤鮮度閾值：
- 每次額外 Firestore 讀取約 20-50ms 延遲
- 對 VS6 排班頁面（每次加載可能有 10+ 語義查詢）影響明顯

### 修復方案

1. 確認兩處定義的值並記錄差異（已完成：見 SA-002）
2. 統一至 `shared-kernel` 定義（參見 SC-002 修復方案）
3. 修復後，在效能測試中確認緩存命中率恢復正常

---

## 效能優化優先序 / Optimization Priority

```
立即行動 (< 1 Sprint):
  PB-001: 替換 Dijkstra 線性搜尋為最小堆
  ↓ 此優化同時改善 PB-002 的每次迭代效能

計劃行動 (2-3 Sprints):
  PB-002 方案 A: 改為按需 (Lazy) 距離計算
  PB-003: 解決 SK_STALENESS_CONTRACT 雙重定義

長期架構 (> 3 Sprints):
  PB-002 方案 C: Floyd-Warshall 增量更新 + 版本緩存
```

---

## 效能基準 / Performance Benchmarks

建議在 `centralized-neural-net/neural-network.test.ts` 中加入效能基準測試：

```typescript
describe('Performance Benchmarks', () => {
  it('computeDistance for 100-node graph should complete < 10ms', () => { ... });
  it('computeDistance for 1000-node graph should complete < 100ms', () => { ... });
  it('buildDistanceMatrix for 100-node graph should complete < 500ms', () => { ... });
});
```

確保每次 CI 執行都能捕捉到效能回退（performance regression）。

---

*最後更新: 2026-03-09 | 維護者: Copilot（PB-001/002 更新確認路徑；PB-003 補充雙重定義具體路徑）*
