# VS1-Identity

- Auth lifecycle
- Context lifecycle
- ACL and claims refresh handshake (`S6`)

## Implemented Capabilities (from code)

- Auth UI: `LoginView` / `LoginForm` / `RegisterForm` / reset-password components.
- Session helper UI: `AuthTabsRoot`, `AuthBackground`.
- Claims refresh integration: `registerClaimsHandler`（app 啟動註冊一次）。
- Token refresh listener: `useTokenRefreshListener`（authenticated session 監聽）。
