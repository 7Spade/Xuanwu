# Management Index

## Active Registers (open/in progress)

- `docs/management/technical-debt.md`
- `docs/management/semantic-conflicts.md`
- `docs/management/security-audits.md`
- `docs/management/issues.md`
- `docs/management/performance-bottlenecks.md`

## Archive Registers (resolved/closed)

- `docs/management/technical-debt-archive.md`
- `docs/management/semantic-conflicts-archive.md`
- `docs/management/security-audits-archive.md`
- `docs/management/issues-archive.md`
- `docs/management/performance-bottlenecks-archive.md`

## Routing Rule

- New or unresolved records: write to active register.
- Resolved/accepted/closed records: move to matching archive register.
- Keep one record in one place only (no duplicate active+archive copy).

## Migration Checklist

1. Verify close status and reason.
2. Copy full entry to matching archive file.
3. Add closure metadata block required by archive template.
4. Remove entry from active file.
5. Refresh overview table/status counts and last-updated notes.
