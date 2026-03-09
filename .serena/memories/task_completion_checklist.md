Before finishing a task:
1. Verify architecture boundaries and SSOT alignment.
2. Run lint (npm run lint) and typecheck (npm run typecheck).
3. Run tests if affected (npm run test).
4. Ensure i18n keys are synced in both locale files when UI text changes.
5. Ensure docs are updated when behavior/config/public API changes.
6. Confirm UTF-8 encoding and no accidental secret exposure.