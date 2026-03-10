---
name: blueprint-generator
description: 'Generate reusable prompt blueprints from the repository: technology stack documentation from actual code/config evidence, or a code exemplars catalog of high-quality patterns by layer and type.'
agent: 'agent'
tools: ['search/codebase', 'repomix/*', 'edit/editFiles']
argument-hint: 'What to generate: "tech-stack" for stack documentation | "exemplars" for code exemplar catalog | both'
---

# Blueprint Generator — Technology Stack · Code Exemplars

Generate meta-prompts and reference catalogs directly from repository evidence.

---

## Mode A — Technology Stack Blueprint

Produce a comprehensive technology stack document from actual code and configuration.

### Required sections in generated blueprint

1. **Detected languages/frameworks/platforms** — from `package.json`, config files, and imports
2. **Key dependencies and tooling** — grouped by category (runtime, dev, testing, CI)
3. **Architecture/layer mapping** — how layers map to directories and modules
4. **Coding conventions observed** — naming patterns, file organization, error handling style
5. **Version and license details** — where relevant for governance decisions

### Workflow

1. Use #tool:repomix to scan `package.json`, config files, and representative source files.
2. Extract concrete evidence for each section.
3. Return a complete `.prompt.md` body suitable for direct use.

---

## Mode B — Code Exemplars Blueprint

Identify and catalog high-quality code examples that establish coding standards.

### Required behavior

1. Detect stack/language from repository files.
2. Identify exemplar files by:
   - Readability and self-documenting code
   - Architecture compliance (correct layer, boundaries, naming)
   - Pattern completeness (shows full lifecycle)
3. Group exemplars by category (pattern, layer, or file type).
4. Include path references and short rationale for each exemplar.

### Exemplar categories

- Server Action pattern (`_actions.ts`)
- Query pattern (`_queries.ts`)
- Aggregate/domain logic pattern
- Server Component pattern (RSC-first)
- Client Component pattern (minimal `use client`)
- Error boundary pattern
- i18n implementation pattern

### Workflow

1. Use #tool:repomix to scan `src/` for representative files.
2. Score each candidate: readability + architecture compliance + completeness.
3. Return a complete `.prompt.md` body that can be reused directly.

---

## Output

A complete `.prompt.md` file with:
- Accurate YAML frontmatter (`name`, `description`, `tools`)
- Clear inputs and output format
- Evidence-based content (no speculation)

Mode: ${input:mode:Enter "tech-stack", "exemplars", or "both"}
