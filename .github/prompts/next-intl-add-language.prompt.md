---
name: next-intl-add-language
agent: 'agent'
tools: ['search/codebase', 'edit/editFiles', 'changes']
description: 'Add a new language to a Next.js app using next-intl and keep routing + UI language selector in sync.'
---

# Add next-intl Language

Add one locale end-to-end in a Next.js + next-intl project.

## Required updates
- Add new messages file by translating from `en.json`
- Update locale routing and middleware
- Update language switcher UI
- Verify all translation keys exist with no missing entries requiring fallbacks

## Output
- Files changed
- Missing/added keys summary
- Validation checklist
