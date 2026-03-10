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
- Notification authority constants: `NOTIFICATION_CHANNELS` / `NOTIFICATION_PRIORITIES` / `NOTIFICATION_PRIORITY_ORDER`。
- User notification domain: deliver、subscribe、mark-read、notifications hook。
- Governance router: notification router registration。
- UI: notification bell、badge、list。
