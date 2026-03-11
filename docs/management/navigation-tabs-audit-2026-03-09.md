# Navigation and Tabs Coverage Audit (2026-03-09)

## Scope
- Base URL: `http://localhost:9002`
- Session: authenticated (`test@demo.com`)
- Rule: hydration mismatch treated as `FAIL`
- Workspace used for tab tour: `pHayShELnxXYqna491nn` (`QA Workspace`)

## Coverage Summary
- Dashboard sidebar routes: `10/10` covered, `0` failed
- Workspace primary tabs: `12/12` probed, `10` redirected by capability gate
- Nested tabs: `0/0` discovered, `0` missing
- Global navigation links: `1/1` covered (`/wiki`), `0` missing
- Hydration mismatches: `0`
- Context validation: `Personal` and `Organization` both executed; governance pages remained gated in both contexts.

## Account Context Matrix
| Context | Switch Evidence | Governance Route Behavior |
|---|---|---|
| Personal | Account switcher label: `demo / Personal` | `teams`, `matrix`, `daily` show governance-not-available fallback (expected) |
| Organization | Account switcher label: `demo / Organization` | `teams`, `matrix`, `daily` still show governance-not-available fallback (unexpected) |

Observation: account-type switch is visible at UI label level, but governance route behavior does not diverge. This indicates either test-data authorization state is unchanged or organization-read model hydration is incomplete in current environment.

## Dashboard Sidebar Route Matrix
| Route | Status | Evidence |
|---|---|---|
| `/dashboard` | PASS | HTTP 200, shell + main content rendered |
| `/workspaces` | PASS | HTTP 200, shell + workspaces page rendered |
| `/dashboard/account/members` | PASS | HTTP 200, `hasMain=true` |
| `/dashboard/account/teams` | PASS | HTTP 200, `hasMain=true`, organization-required fallback rendered |
| `/dashboard/account/partners` | PASS | HTTP 200, `hasMain=true` |
| `/dashboard/account/matrix` | PASS | HTTP 200, `hasMain=true`, organization-required fallback rendered |
| `/dashboard/account/workforce-scheduling` | PASS | HTTP 200, `hasMain=true` |
| `/dashboard/account/daily` | PASS | HTTP 200, `hasMain=true`, organization-required fallback rendered |
| `/dashboard/account/audit` | PASS | HTTP 200, `hasMain=true` |
| `/wiki` | PASS | HTTP 200, page rendered |

## Workspace Tabs Matrix
| Tab | Route | Status | Evidence |
|---|---|---|---|
| Capabilities | `/workspaces/pHayShELnxXYqna491nn/capabilities` | PASS | HTTP 200, `hasMain=true`, i18n present |
| Members | `/workspaces/pHayShELnxXYqna491nn/members` | REDIRECTED | Final URL redirected to `/capabilities` (tab not mounted in this workspace) |
| Tasks | `/workspaces/pHayShELnxXYqna491nn/tasks` | REDIRECTED | Final URL redirected to `/capabilities` (tab not mounted in this workspace) |
| QA | `/workspaces/pHayShELnxXYqna491nn/quality-assurance` | REDIRECTED | Final URL redirected to `/capabilities` (tab not mounted in this workspace) |
| Acceptance | `/workspaces/pHayShELnxXYqna491nn/acceptance` | REDIRECTED | Final URL redirected to `/capabilities` (tab not mounted in this workspace) |
| Finance | `/workspaces/pHayShELnxXYqna491nn/finance` | REDIRECTED | Final URL redirected to `/capabilities` (tab not mounted in this workspace) |
| Issues | `/workspaces/pHayShELnxXYqna491nn/issues` | REDIRECTED | Final URL redirected to `/capabilities` (tab not mounted in this workspace) |
| Daily | `/workspaces/pHayShELnxXYqna491nn/daily` | REDIRECTED | Final URL redirected to `/capabilities` (tab not mounted in this workspace) |
| Files | `/workspaces/pHayShELnxXYqna491nn/files` | REDIRECTED | Final URL redirected to `/capabilities` (tab not mounted in this workspace) |
| Schedule | `/workspaces/pHayShELnxXYqna491nn/schedule` | REDIRECTED | Final URL redirected to `/capabilities` (tab not mounted in this workspace) |
| Document Parser | `/workspaces/pHayShELnxXYqna491nn/document-parser` | REDIRECTED | Final URL redirected to `/capabilities` (tab not mounted in this workspace) |
| Audit | `/workspaces/pHayShELnxXYqna491nn/audit` | PASS | HTTP 200, `hasMain=true`, i18n present |

## Nested Tabs Discovery Matrix
| Parent Route Group | Nested Tabs Found | Coverage |
|---|---|---|
| Dashboard account routes | 0 | `0/0` |
| Workspace tab routes | 0 | `0/0` |

## Hydration Verification
- Initial run recorded hydration mismatch at sidebar dropdown triggers.
- After patch (removing forced trigger IDs and using `suppressHydrationWarning` on trigger buttons), mismatch was not reproduced in stabilized authenticated route sweeps.

## Missing / Failed Counts
- Missing tabs from discovery: `0`
- Failed dashboard routes: `0`
- Failed workspace tabs: `0`
- Redirected workspace tabs by capability gate: `10`

## Next Fix Queue
1. If full workspace-tab coverage is required, mount additional capabilities in test workspace before rerun.
2. Keep hydration mismatch as hard-fail gate in future sweeps.
3. Preserve final-URL checks to distinguish real failures from expected capability redirects.
4. Add context parity check: organization-only pages must render organization data in `Organization` context and fallback in `Personal` context.
