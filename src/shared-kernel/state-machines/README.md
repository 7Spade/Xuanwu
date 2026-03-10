# shared-kernel / state-machines

**層級**：L1 · VS0-Kernel  
**性質**：跨切片共用狀態機規格（Pure State Transition Machines）

---

## 職責

放置可被 **兩個以上功能切片共用** 的 **狀態轉移規格** 與純轉移函式（State Machine / Transition Rules），包含：

- 狀態列舉與事件列舉（State / Event）。
- 合法轉移表（Transition Matrix）。
- 轉移守衛（Guard）與錯誤碼。
- 狀態快照推導（不含 I/O）。

> **注意**：此目錄只放「狀態機規格與純轉移」。
> 具體副作用（寫 DB、發 Event、呼叫外部 API）必須留在 L2/L3/L4 執行層，不可放在 L1。

---

## 放置什麼程式碼

| 類型 | 範例 |
|------|------|
| 狀態/事件型別 | `type WorkflowState = 'draft' | 'active' | 'completed'` |
| 轉移表 | `const WORKFLOW_TRANSITIONS: Record<State, readonly State[]>` |
| 純轉移函式 | `transitionWorkflow(state, event): TransitionResult` |
| 轉移守衛 | `canTransition(state, target): boolean` |
| 統一錯誤碼 | `enum-like` 字串常數：`INVALID_TRANSITION` |
| 狀態正規化 | `normalizeState(input): WorkflowState` |

---

## 禁止放入什麼

- ❌ 含 `async/await` 或任何 I/O（Firestore、HTTP、SDK）
- ❌ 直接觸發 side effects（emit event、寫 outbox、寫 projection）
- ❌ 單一切片專屬且不可重用的狀態機
- ❌ UI 元件或 framework 相依（React hooks、Next.js runtime）

---

## 與 `directives/`、`logics/` 的界線

| 目錄 | 關注點 |
|------|--------|
| `state-machines/` | **狀態轉移規格**（state/event/transition matrix）|
| `directives/` | **執行前規格**（guard policy、trace/rate-limit/security directives）|
| `logics/` | **一般領域推導**（計算與判斷，不一定是狀態機）|

> 判斷準則：若核心是「狀態 + 事件 + 轉移」→ `state-machines/`；
> 若核心是「執行規範」→ `directives/`；若是一般純計算→ `logics/`。

---

## 檔案命名規則

```text
src/shared-kernel/state-machines/
├── <domain>.machine.ts            # 狀態機主檔（e.g. finance.machine.ts）
├── <domain>.transition-table.ts   # 轉移表（可拆分）
├── <domain>.guards.ts             # 純 guard（可拆分）
└── index.ts                       # 統一 barrel 出口
```

- 主檔後綴建議 `.machine.ts`。
- 轉移函式命名建議 `transitionXxx`、`canTransitionXxx`。
- 錯誤碼使用 `SCREAMING_SNAKE_CASE`。

---

## 範例

```ts
// src/shared-kernel/state-machines/workflow.machine.ts

export type WorkflowState = 'draft' | 'in-progress' | 'completed';
export type WorkflowEvent = 'start' | 'finish';

const WORKFLOW_TRANSITIONS: Record<WorkflowState, readonly WorkflowState[]> = {
	'draft': ['in-progress'],
	'in-progress': ['completed'],
	'completed': [],
};

export function canTransitionWorkflow(
	current: WorkflowState,
	target: WorkflowState,
): boolean {
	return WORKFLOW_TRANSITIONS[current].includes(target);
}
```

---

> **架構對齊**：`src/shared-kernel/state-machines/` = VS0-Kernel 狀態轉移規格層（L1）。  
> 規則依據：`docs/architecture/00-logic-overview.md`（L1 僅允許純契約/純函式，禁止副作用）。
