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
