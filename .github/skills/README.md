# Agent Skills Governance

> **Purpose**: Reusable knowledge modules for GitHub Copilot agents  
> **Format**: Directory with SKILL.md + supporting files  
> **Documentation**: [VS Code Agent Skills](https://code.visualstudio.com/docs/copilot/customization/agent-skills)

---

## 📋 Overview

Agent skills are reusable knowledge modules that provide specialized expertise to GitHub Copilot agents. Unlike prompt files (which are templates) or custom agents (which are complete assistants), skills are modular knowledge units that can be referenced by multiple agents.

## 📁 Directory Structure

```
.github/skills/
├── README.md                    # This file
├── {skill-name}/               # Skill directory
│   ├── SKILL.md                # Main skill content (required)
│   ├── examples/               # Optional examples
│   │   └── example.ts
│   ├── references/             # Optional reference materials
│   │   └── diagram.md
│   └── tests/                  # Optional test cases
│       └── test-cases.md
```

### Naming Conventions

**Directory Names**:
- **Pattern**: `{domain}-{topic}` or `{topic}`
- **Case**: kebab-case (lowercase with hyphens)
- **Descriptive**: Clearly indicates the skill's focus

**Examples**:
- ✅ `architecture-ddd/`
- ✅ `d3-visualization/`
- ✅ `firebase-security/`
- ✅ `angular-signals/`
- ❌ `DDD/` (wrong case)
- ❌ `skill1/` (not descriptive)

**File Names**:
- Main file: `SKILL.md` (UPPERCASE, required)
- Supporting files: lowercase with hyphens

---

## 📝 SKILL.md Format

### Required Structure

```markdown
---
name: skill-name
description: Brief one-line description of the skill's purpose and when to use it
version: 1.0.0
category: category-name
tags: ['tag1', 'tag2', 'tag3']
---

# SKILL: Skill Display Name

Brief introduction paragraph explaining what this skill provides.

---

## Section 1: Core Concept

Detailed explanation of the main concept.

### Subsection

Specific details, rules, or patterns.

---

## Section 2: Patterns/Examples

Concrete examples showing how to apply the skill.

### Pattern 1

```typescript
// Example code
```

### Pattern 2

```typescript
// More examples
```

---

## Section 3: Best Practices

Guidelines and recommendations.

---

## Section 4: Common Pitfalls

Things to avoid or watch out for.
```

### Frontmatter Fields

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| `name` | Yes | Skill identifier (matches directory) | `'architecture-ddd'` |
| `description` | Yes | One-line summary with usage context | `'DDD patterns, layer boundaries...'` |
| `version` | No | Semantic version | `'1.0.0'` |
| `category` | No | Primary category | `'architecture'`, `'testing'` |
| `tags` | No | Searchable keywords | `['ddd', 'layers', 'patterns']` |
| `author` | No | Maintainer name/team | `'Architecture Team'` |
| `last_updated` | No | ISO date | `'2026-02-05'` |

---

## ✅ Content Guidelines

### Structure

1. **Introduction**: What knowledge this skill provides
2. **Core Concepts**: Fundamental principles and rules
3. **Patterns**: Concrete implementation patterns with examples
4. **Best Practices**: Recommended approaches
5. **Common Pitfalls**: Anti-patterns and mistakes to avoid
6. **References**: Links to authoritative sources

### Code Examples

```typescript
// ✅ Good: Clear, self-contained examples
export class TaskAggregate {
  static create(props: CreateTaskProps): TaskAggregate {
    // Business validation
    if (!props.title?.trim()) {
      throw new Error('Task title cannot be empty');
    }
    return new TaskAggregate(props);
  }
}

// ❌ Bad: Incomplete or unclear examples
export class Task {
  // ... missing implementation
}
```

### Documentation Style

- **Authoritative**: State rules clearly
- **Educational**: Explain the "why" behind rules
- **Practical**: Include working code examples
- **Comprehensive**: Cover common scenarios
- **Current**: Reference latest best practices

---

## 🎯 When to Create a Skill

Create a new skill when:

✅ **Domain Expertise**: Specialized knowledge in a specific area  
✅ **Reusable**: Multiple agents benefit from this knowledge  
✅ **Stable**: Concepts are established, not experimental  
✅ **Well-Defined**: Clear boundaries and scope  
✅ **Educational**: Helps agents make better decisions

**Don't create** a skill for:

❌ Project-specific business logic (use documentation)  
❌ Frequently changing information (becomes stale)  
❌ One-off knowledge not reused elsewhere  
❌ General programming concepts (link to official docs)

---

## 🔍 Usage in Agents

### Referencing Skills in Agent Files

```yaml
---
name: my-agent
description: Custom agent with DDD expertise
skills:
  - architecture-ddd
  - angular-signals
---

You are an expert developer with the following skills:

- Domain-Driven Design (see skill: architecture-ddd)
- Angular Signals (see skill: angular-signals)

Apply these patterns when generating code.
```

### Inline References

```markdown
# My Custom Agent

When implementing features, follow the layer boundaries 
defined in the `architecture-ddd` skill.

For state management, use the patterns from the 
`angular-signals` skill.
```

---

## 🔨 Creating a New Skill

### Step 1: Plan the Skill

Define:
- **Domain**: What area of expertise?
- **Scope**: What's included/excluded?
- **Audience**: Which agents will use this?
- **Prerequisites**: What knowledge is assumed?

### Step 2: Create Directory Structure

```bash
# Navigate to skills directory
cd .github/skills/

# Create skill directory and files
mkdir my-skill-name
cd my-skill-name

# Create main skill file
touch SKILL.md

# Optional: Create supporting directories
mkdir examples references tests
```

### Step 3: Write SKILL.md

```markdown
---
name: my-skill-name
description: Brief description with usage context
version: 1.0.0
category: appropriate-category
tags: ['tag1', 'tag2']
---

# SKILL: My Skill Display Name

Introduction paragraph.

---

## Core Concepts

Fundamental principles.

---

## Patterns

Code examples and patterns.

---

## Best Practices

Recommendations.
```

### Step 4: Add Supporting Materials

**examples/**:
```typescript
// examples/good-example.ts
export class ProperImplementation {
  // Well-structured example
}
```

**references/**:
```markdown
# references/architecture-diagram.md

## System Architecture

[Diagrams and detailed explanations]
```

**tests/**:
```markdown
# tests/validation-rules.md

## Test Cases

Scenarios to verify skill application.
```

### Step 5: Test the Skill

Create a test agent that uses the skill:

```markdown
---
name: test-agent
skills: ['my-skill-name']
---

# Test Agent

Apply the `my-skill-name` skill when responding.
```

Test in Copilot Chat:
```
@test-agent Implement feature X using best practices
```

### Step 6: Document

Add your skill to the appropriate category section in this README.

---

## 📊 Skill Categories

### Architecture & Design
- `architecture-ddd/` - Domain-Driven Design patterns
- `clean-architecture/` - Clean Architecture principles
- `microservices-patterns/` - Microservices design patterns

### Frontend
- `angular-signals/` - Angular Signals patterns
- `d3-visualization/` - D3.js visualization techniques
- `responsive-design/` - Responsive web design patterns

### Backend
- `firebase-security/` - Firebase security rules
- `api-design/` - REST API design principles
- `database-optimization/` - Database performance

### Testing
- `tdd-principles/` - Test-Driven Development
- `e2e-testing/` - End-to-end testing strategies
- `test-patterns/` - Testing design patterns

### DevOps
- `ci-cd-patterns/` - CI/CD best practices
- `docker-optimization/` - Docker optimization techniques
- `kubernetes-deployment/` - Kubernetes deployment patterns

---

## 🔄 Maintenance

### Version Updates

When updating a skill:

1. **Increment version** in SKILL.md frontmatter
2. **Add changelog section**
3. **Test with existing agents** that reference the skill
4. **Update examples** if patterns change
5. **Notify agent maintainers** of breaking changes

```markdown
## CHANGELOG

### v2.0.0 (2026-02-05)
- BREAKING: Changed layer naming conventions
- Added new aggregate pattern examples
- Updated security guidelines

### v1.1.0 (2026-01-15)
- Added event sourcing pattern
- Improved repository examples

### v1.0.0 (2025-12-01)
- Initial release
```

### Deprecation Process

To deprecate a skill:

1. Mark as deprecated in frontmatter
2. Provide replacement skill
3. Update agents that reference it
4. Keep for 3 months before removal

```yaml
---
name: old-skill
description: 'DEPRECATED - Use new-skill instead'
deprecated: true
replacement: 'new-skill'
deprecated_date: '2026-02-05'
removal_date: '2026-05-05'
---
```

---

## 📋 Quality Checklist

Before committing a new skill:

- [ ] Directory name follows kebab-case convention
- [ ] SKILL.md exists with required frontmatter
- [ ] Description includes usage context (when to use)
- [ ] Content is well-structured with clear sections
- [ ] Code examples are complete and tested
- [ ] Best practices are documented
- [ ] Common pitfalls are identified
- [ ] References to official docs are included
- [ ] Version number is set (start with 1.0.0)
- [ ] Tested with at least one custom agent
- [ ] Added to appropriate category in this README
- [ ] No project-specific secrets or sensitive data

---

## 🔗 Related

- **Custom Agents**: `.github/agents/` - Use skills in specialized assistants
- **Prompts**: `.github/prompts/` - Reference skills in prompt templates
- **Instructions**: `.github/instructions/` - General coding guidelines

---

## 📚 Resources

- [VS Code Agent Skills Documentation](https://code.visualstudio.com/docs/copilot/customization/agent-skills)
- [GitHub Copilot Extensibility](https://docs.github.com/copilot)
- [Domain-Driven Design Reference](https://www.domainlanguage.com/ddd/)

---

## 🎯 Best Practices

### Modularity
- Keep skills focused on one domain
- Avoid overlapping content with other skills
- Make skills composable

### Clarity
- Use clear, unambiguous language
- Provide concrete examples
- Explain the reasoning behind rules

### Maintainability
- Version all skills
- Document changes in changelog
- Keep examples up-to-date with latest tech

### Discoverability
- Use descriptive names
- Include comprehensive tags
- Write detailed descriptions

---

**Last Updated**: 2026-02-05  
**Maintained By**: Architecture Committee  
**Review Frequency**: Quarterly
