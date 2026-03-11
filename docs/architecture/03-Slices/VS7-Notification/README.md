# VS7-Notification

## 一眼摘要

- 用途：作為全域通知副作用唯一出口，統一通知路由、訂閱與投遞策略。
- 核心功能：single side-effect exit（`#A13`）、stateless router + semantic-aware policy、IER lane 消費與 trace 傳遞（`R8`）。
- 解決痛點：
	1. 通知副作用散落多個切片，容易重複發送或漏發。
	2. 通知渠道與優先級規則分散，難以一致治理。
	3. 事件追蹤斷裂，無法完整還原通知從事件到投遞的路徑。

- Notification hub as single side-effect exit (`#A13`)
- Stateless router with semantic-aware delivery policy
- IER standard lane consumption and trace propagation (`R8`)

## Implemented Capabilities (from code)

- Hub actions: dispatch、routing rule register/unregister、manual trigger dispatch。
- Hub services: tag-aware routing decision、subscription registry、projection-bus subscriber、hub stats。
- Hub contracts: notification category / semantic type / priority / channel。
- User notification domain: deliver、subscribe、mark-read、notifications hook。
- Governance router: notification router registration。
- UI: notification bell、badge、list。

## SSOT Phase 對齊（Phase Alignment）

| Phase | 步驟 | VS7 Notification 角色 |
|-------|------|----------------------|
| Phase 1 (1.3 Note) | 通知副作用 [A13] | VS3 Ledger 記帳後、VS9 進入 Staging Pool 後，透過 VS7 Port 發送通知（#A13 唯一副作用出口） |
| Phase 2 (2.8-2.9) | L0B 串流橋接 | Phase 2 AI 推理軌跡串流（Step 2.8-2.9）透過 L0B Server Action 橋接，而非 VS7 通知路徑；兩者不重疊 |
| Phase 2 (2.13) | STANDARD_LANE 投影 | 匹配通知（MatchingCompleted）消費 L5 Projection 結果；走 STANDARD_LANE |

**L0B vs VS7 區分**：  
- L0B（Server Action 串流橋接）：處理 Phase 2 AI 推理軌跡的即時串流（Step 2.8-2.9）  
- VS7（Notification Hub）：處理業務事件的非同步通知（如審核通過、任務分配）；走 IER STANDARD_LANE

**E8 邊界**：通知路由必須帶 tenantId；跨租戶通知一律拒絕。
