# Navigation and Tabs Coverage Audit (2026-03-09)

## Scope
- Base URL: `http://localhost:9002`
- Session: authenticated (`test@demo.com`)
- Rule: hydration mismatch treated as `FAIL`
- Workspace used for tab tour: `pHayShELnxXYqna491nn` (`QA Workspace`)

## Coverage Summary
- Dashboard sidebar routes: `10/10` covered, `3` failed
- Workspace primary tabs: `12/12` covered, `3` failed
- Nested tabs: `0/0` discovered, `0` missing
- Global navigation links: `1/1` covered (`/wiki`), `0` missing

## Dashboard Sidebar Route Matrix
| Route | Status | Evidence |
|---|---|---|
| `/dashboard` | PASS | HTTP 200, shell + main content rendered |
| `/workspaces` | PASS | HTTP 200, shell + workspaces page rendered |
| `/dashboard/account/members` | PASS | HTTP 200, `hasMain=true` |
| `/dashboard/account/teams` | FAIL | HTTP 200 but `hasMain=false` (shell-only) |
| `/dashboard/account/partners` | PASS | HTTP 200, `hasMain=true` |
| `/dashboard/account/matrix` | FAIL | HTTP 200 but `hasMain=false` (shell-only) |
| `/dashboard/account/workforce-scheduling` | PASS | HTTP 200, `hasMain=true` |
| `/dashboard/account/daily` | FAIL | HTTP 200 but `hasMain=false` (shell-only) |
| `/dashboard/account/audit` | PASS | HTTP 200, `hasMain=true` |
| `/wiki` | PASS | HTTP 200, page rendered |

## Workspace Tabs Matrix
| Tab | Route | Status | Evidence |
|---|---|---|---|
| Capabilities | `/workspaces/pHayShELnxXYqna491nn/capabilities` | FAIL | HTTP 200 but `hasMain=false`, no i18n button |
| Members | `/workspaces/pHayShELnxXYqna491nn/members` | PASS | HTTP 200, `hasMain=true`, i18n present |
| Tasks | `/workspaces/pHayShELnxXYqna491nn/tasks` | PASS | HTTP 200, `hasMain=true`, i18n present |
| QA | `/workspaces/pHayShELnxXYqna491nn/quality-assurance` | FAIL | HTTP 200 but `hasMain=false`, no i18n button |
| Acceptance | `/workspaces/pHayShELnxXYqna491nn/acceptance` | PASS | HTTP 200, `hasMain=true`, i18n present |
| Finance | `/workspaces/pHayShELnxXYqna491nn/finance` | PASS | HTTP 200, `hasMain=true`, i18n present |
| Issues | `/workspaces/pHayShELnxXYqna491nn/issues` | PASS | HTTP 200, `hasMain=true`, i18n present |
| Daily | `/workspaces/pHayShELnxXYqna491nn/daily` | PASS | HTTP 200, `hasMain=true`, i18n present |
| Files | `/workspaces/pHayShELnxXYqna491nn/files` | PASS | HTTP 200, `hasMain=true`, i18n present |
| Schedule | `/workspaces/pHayShELnxXYqna491nn/schedule` | PASS | HTTP 200, `hasMain=true`, i18n present |
| Document Parser | `/workspaces/pHayShELnxXYqna491nn/document-parser` | PASS | HTTP 200, `hasMain=true`, i18n present |
| Audit | `/workspaces/pHayShELnxXYqna491nn/audit` | FAIL | HTTP 200 but `hasMain=false`, no i18n button |

## Nested Tabs Discovery Matrix
| Parent Route Group | Nested Tabs Found | Coverage |
|---|---|---|
| Dashboard account routes | 0 | `0/0` |
| Workspace tab routes | 0 | `0/0` |

## Hydration Verification
- Initial run recorded hydration mismatch at sidebar dropdown triggers.
- After patch (removing forced trigger IDs and using `suppressHydrationWarning` on trigger buttons), mismatch was not reproduced in subsequent authenticated route sweeps.

## Missing / Failed Counts
- Missing tabs from discovery: `0`
- Failed dashboard routes: `3` (`teams`, `matrix`, `daily`)
- Failed workspace tabs: `3` (`capabilities`, `quality-assurance`, `audit`)

## Next Fix Queue
1. Diagnose shell-only render path for `/dashboard/account/teams`, `/dashboard/account/matrix`, `/dashboard/account/daily`.
2. Diagnose workspace shell-only render path for `/workspaces/{id}/capabilities`, `/workspaces/{id}/quality-assurance`, `/workspaces/{id}/audit`.
3. After fixes, rerun this exact matrix and replace all `FAIL` entries with PASS evidence.
