# VS1-Identity

## 一眼摘要

- 用途：管理登入驗證、身分上下文與 ACL/claims 同步，確保系統知道「你是誰、你能做什麼」。
- 核心功能：Auth lifecycle、context lifecycle、ACL 與 claims refresh handshake（`S6`）。
- 解決痛點：
	1. 多入口登入後權限不同步，導致 UI 與後端判斷不一致。
	2. token 更新時 session 狀態漂移，造成誤判未授權或資料讀取失敗。
	3. 身分流程分散，無法穩定追蹤授權變更來源。

- Auth lifecycle
- Context lifecycle
- ACL and claims refresh handshake (`S6`)

## Implemented Capabilities (from code)

- Auth UI: `LoginView` / `LoginForm` / `RegisterForm` / reset-password components.
- Session helper UI: `AuthTabsRoot`, `AuthBackground`.
- Claims refresh integration: `registerClaimsHandler`（app 啟動註冊一次）。
- Token refresh listener: `useTokenRefreshListener`（authenticated session 監聽）。

## SSOT Phase 對齊（Phase Alignment）

| Phase | 步驟 | VS1 Identity 角色 |
|-------|------|-----------------|
| Phase 0 (0, VS0) | 核心型別注入 | VS0 提供的型別契約（UserRole、TenantId enum）是 VS1 ACL 系統的語義基礎 |
| Phase 1 (1.2) | 身份驗證閘道 | L0A API 入口經 VS1 路由與身份驗證（`GW->>CBG: 1.2 路由與身份驗證 (VS1 Identity/Auth)`） |
| Phase 2 (E8) | 租戶隔離守護 | VS1 是 E8 tenant isolation 的第一道防線；L0A 入口必須驗證 tenantId 合法性 |
| Phase 3 (3.3) | 讀取身份驗證 | Phase 3 查詢（UI→L0A→L6）必須通過 VS1 ACL 驗證後方可進入 L6 Query Gateway |

**E8 說明**：VS1 Identity 是 tenantId 注入的源頭；Phase 1 Step 1.2 路由時 VS1 必須完成身份驗證並注入 tenantId context，確保後續 Tool-M（match_candidates）可正確執行 E8 fail-closed 過濾。

**L4A 銜接**：權限/角色變更（RoleChanged）事件走 CRITICAL_LANE，並應在 L4A 稽核日誌中記錄（Who: 操作者, Why: 觸發原因, Evidence: 變更前後狀態, Version: policy version, Tenant: tenantId）。
