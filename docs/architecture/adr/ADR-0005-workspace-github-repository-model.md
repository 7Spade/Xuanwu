# ADR-0005：工作區以 Repository 模型建模（GitHub 式開放結構）

- **Status**: Accepted
- **Date**: 2026-03-12
- **Deciders**: Architecture Team（xuanwu-commander）

---

## Context

工作區（Workspace）的設計需要決定：
1. 工作區角色（WSOwner/WSAdmin/WSMember/WSViewer）是靜態職稱還是動態派生？
2. 工作區與「組織」的關係：必須先有組織才能有工作區，還是個人也可以建立工作區？

---

## Decision

採用 **GitHub Repository 模型**：
- 工作區可屬於**個人帳號**（personal workspace）或**組織**（org workspace）。
- 角色（WSOwner/WSAdmin/WSMember/WSViewer）是**情境派生**的，非靜態職稱。
- `activeContext` 決定所有操作的 scope 隔離邊界（`workspaceId` + `orgId`/`personalId`）。

---

## Rationale

- **開放結構**：採用 GitHub 式開放組織結構，User 是唯一基礎 Actor，所有角色是情境衍生身份。
- **個人工作區**：支援個人開發者在無組織的情況下使用全功能工作區（UC7）。
- **嚴格 scope 隔離**：所有資源攜帶 `workspaceId`，查詢必須帶入 context，缺少則 L5 SB51 Scope 守衛直接拒絕。
- **四級角色繼承**：`WSOwner ⊇ WSAdmin ⊇ WSMember ⊇ WSViewer`，向下包含，降低角色邊界的認知複雜度。

---

## Consequences

**正面影響**：
- 個人開發者可立即使用，無需建立組織；降低入門門檻。
- 角色動態派生，同一用戶可在不同工作區擔任不同角色，靈活性高。
- 嚴格 scope 隔離確保多租戶安全邊界。

**負面影響**：
- `activeContext` 切換邏輯需前端嚴格管理；context 遺失會觸發 SB51 拒絕。
- 個人工作區與組織工作區的訂閱功能（gating）需要不同的授權路徑。

---

## Alternatives Considered

| 選項 | 拒絕原因 |
|------|---------|
| 工作區必須屬於組織 | 限制個人用戶；不符合 GitHub/Notion 等現代 SaaS 慣例 |
| 靜態角色（固定職稱） | 無法處理同一用戶跨工作區多角色情境 |
| 工作區無 scope 隔離 | 多租戶安全邊界缺失；違反 OWASP Broken Access Control |

---

## References

- [L1 Platform Use Case 圖](../use-cases/use-case-diagram-saas-basic.md)
- [L2 Workspace Use Case 圖](../use-cases/use-case-diagram-workspace.md)
- [L5 SB51 Scope 邊界守衛](../use-cases/use-case-diagram-sub-behavior.md)
