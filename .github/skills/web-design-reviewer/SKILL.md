---
name: web-design-reviewer
description: 'Visual inspection and fix of websites for design issues including responsive breakage, accessibility problems, visual inconsistency, and layout errors. Use when asked to review UI design, check layout, or fix design problems. Triggers: "review website design", "check the UI", "fix the layout", "find design problems", "UI review", "design audit".'
---

# Web Design Reviewer

## When to Use
- Reviewing a local or remote website for visual design issues
- Checking responsive layout at multiple breakpoints (mobile, tablet, desktop)
- Auditing accessibility: color contrast, font sizes, focus states, ARIA labels
- Identifying visual inconsistencies across pages or components

## Prerequisites
- The target website must be accessible (local dev server or public URL)
- Browser automation (Chrome DevTools MCP or Playwright MCP) must be active
- Know the design system or style guide in use (Tailwind, shadcn/ui, custom CSS)

## Workflow
1. Navigate to the target URL and take a full-page screenshot.
2. Take snapshots at three viewport widths: mobile (375px), tablet (768px), desktop (1280px).
3. Inspect each snapshot for:
   - Layout breakage: overflow, clipping, stacking issues
   - Typography: inconsistent font sizes, line heights, or weights
   - Color: insufficient contrast ratios (must meet WCAG AA: 4.5:1 for text)
   - Spacing: inconsistent padding/margin vs. design system tokens
   - Accessibility: missing `alt` text, focus indicators, ARIA roles
4. Categorize findings by severity: Critical / Warning / Suggestion.
5. Locate the source file for each finding.
6. Apply source-level fixes for Critical and Warning findings.
7. Re-take screenshots after fixes to verify improvement.

## Output Contract
- Produce a review report with: Findings by Severity, Screenshot Evidence, Source File Reference, Fix Applied.
- Include before/after screenshots for every Critical fix.
- List Suggestions separately as optional improvements.

## Guardrails
- Do not modify component logic — only CSS, Tailwind classes, and layout structure.
- Do not override global design tokens; use existing theme values.
- Flag fixes that require design system changes for human review.

## Source of Truth
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
- WCAG contrast checker: https://webaim.org/resources/contrastchecker/
