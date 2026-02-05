# Custom Instructions Governance

This directory contains custom instructions for GitHub Copilot to ensure consistent, high-quality code generation across the Xuanwu project.

## 📋 Overview

Custom instructions provide context-specific guidance to AI coding assistants (GitHub Copilot, Copilot Chat, etc.) about project standards, architectural patterns, and coding conventions.

## 📁 File Organization

```
.github/instructions/
├── README.md                 # This file - governance and guidelines
├── accessibility.md          # Accessibility and ARIA standards
├── style-guide.md           # Angular coding conventions
└── [future-instructions].md  # Additional instructions as needed
```

## 📝 Instruction File Format

Each instruction file MUST follow this structure:

### Required Frontmatter

```markdown
---
description: "Brief description of what this instruction covers"
applies_to: ["**/*.ts", "**/*.html", "**/*.scss"]  # Glob patterns
priority: high | medium | low
---
```

### Frontmatter Fields

- **`description`** (required): One-line summary of the instruction's purpose
- **`applies_to`** (required): Array of glob patterns for file types this applies to
- **`priority`** (required): Importance level
  - `high`: Critical rules that must not be violated (security, accessibility, architecture)
  - `medium`: Important conventions that improve code quality
  - `low`: Nice-to-have preferences and optimizations

### Content Structure

After frontmatter, organize content with:

1. **Title**: Clear H1 heading
2. **Core Requirements**: Bullet list of must-follow rules
3. **Sections**: Organized by topic with H2/H3 headings
4. **Examples**: Show both ✅ correct and ❌ incorrect patterns
5. **Resources**: Links to official documentation

### Example Template

```markdown
---
description: "Brief description"
applies_to: ["**/*.ts"]
priority: high
---

# Instruction Title

Core requirements that MUST be followed.

## Section 1

Detailed guidelines with examples.

### Correct Usage

```typescript
// ✅ Good example
const example = 'correct pattern';
```

### Incorrect Usage

```typescript
// ❌ Bad example
var example = 'wrong pattern';
```

## Resources

- [Official Docs](https://example.com)
```

## ✅ Rules for Adding New Instructions

### 1. Scope and Specificity

- **DO**: Create focused instructions for specific domains (accessibility, testing, security)
- **DON'T**: Create overly broad instructions that duplicate existing documentation

### 2. Actionable Content

- **DO**: Provide clear, actionable rules with code examples
- **DON'T**: Include vague guidelines or personal opinions without rationale

### 3. Examples Required

- **DO**: Include both correct (✅) and incorrect (❌) examples
- **DON'T**: Provide instructions without concrete code samples

### 4. Stay Current

- **DO**: Update instructions when Angular/TypeScript versions change
- **DO**: Reference official documentation for authoritative sources
- **DON'T**: Include deprecated patterns or outdated recommendations

### 5. Avoid Duplication

- **DO**: Cross-reference related instructions instead of repeating content
- **DO**: Check existing files before creating new ones
- **DON'T**: Copy-paste content across multiple instruction files

### 6. File Naming

- **DO**: Use descriptive kebab-case names: `accessibility.md`, `security-best-practices.md`
- **DON'T**: Use generic names like `rules.md`, `guidelines.md`

## 🔍 When to Create New Instructions

Create a new instruction file when:

1. ✅ Introducing a new architectural layer or pattern
2. ✅ Adopting new framework features (Angular 21+, new APIs)
3. ✅ Establishing domain-specific rules (security, performance, testing)
4. ✅ Addressing recurring code review feedback
5. ✅ Documenting project-specific conventions not covered elsewhere

**Don't create** a new file for:

1. ❌ General TypeScript/JavaScript best practices (link to official guides)
2. ❌ One-off project decisions (use PR descriptions or ADRs)
3. ❌ Personal coding preferences without team consensus
4. ❌ Content that duplicates `docs/` architecture documentation

## 📋 Review Process

Before committing new instruction files:

1. **Validate Format**: Ensure frontmatter is complete and valid
2. **Check Examples**: Verify all code examples are correct and tested
3. **Verify Links**: Confirm all resource links are accessible
4. **Test Application**: Use Copilot to verify the instruction is being applied
5. **Get Approval**: Have at least one team member review the instruction

## 🔄 Maintenance

### Regular Updates

- Review instructions quarterly for accuracy
- Update when Angular releases new major versions
- Deprecate outdated patterns and mark them clearly

### Deprecation Process

To deprecate an instruction:

```markdown
---
description: "DEPRECATED - Use new-instruction.md instead"
applies_to: ["**/*.ts"]
priority: low
deprecated: true
replacement: "new-instruction.md"
---

# ⚠️ DEPRECATED: Old Instruction

This instruction is deprecated. Please refer to [New Instruction](./new-instruction.md).

[Keep original content for historical reference]
```

## 🎯 Priority Guidelines

### High Priority

Rules that if violated:
- Break builds or runtime
- Create security vulnerabilities
- Violate accessibility requirements (WCAG AA)
- Break architectural boundaries (DDD layers)

Examples: accessibility, security, architecture

### Medium Priority

Standards that if violated:
- Reduce code maintainability
- Hurt performance
- Cause inconsistency across codebase

Examples: style guide, naming conventions, testing patterns

### Low Priority

Preferences that if violated:
- Are mostly stylistic
- Have minimal impact on functionality
- Can be auto-fixed by tools

Examples: formatting, comment styles (defer to Prettier/ESLint)

## 📊 Metrics and Effectiveness

Track instruction effectiveness by monitoring:

1. Code review feedback frequency on covered topics
2. Copilot suggestion acceptance rate
3. Automated test pass rates
4. Accessibility audit scores

## 🔗 Related Documentation

- [Project Architecture](../../docs/PROJECT_ARCHITECTURE.md) - System design
- [DDD Layer Boundaries](../../docs/DDD_LAYER_BOUNDARIES.md) - Architectural rules
- [Naming Conventions](../../docs/NAMING_CONVENTIONS.md) - Naming standards
- [Testing Standards](../../docs/TESTING_STANDARDS.md) - Testing approaches

## ❓ Questions?

For questions about custom instructions:
1. Check this README first
2. Review existing instruction files for examples
3. Consult with the architecture committee
4. Create a discussion in GitHub Discussions

---

**Last Updated**: 2026-02-05  
**Maintained By**: Architecture Committee  
**Review Frequency**: Quarterly
