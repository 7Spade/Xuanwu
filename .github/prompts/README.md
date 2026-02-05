# Prompt Files Governance

> **Purpose**: Reusable prompt templates for GitHub Copilot  
> **Format**: Markdown files with YAML frontmatter  
> **Documentation**: [VS Code Prompt Files](https://code.visualstudio.com/docs/copilot/customization/prompt-files)

---

## 📋 Overview

Prompt files provide reusable prompt templates that can be invoked in Copilot Chat with the `#` symbol. They enable consistent, repeatable interactions for common development tasks.

## �� Directory Structure

```
.github/prompts/
├── README.md                        # This file
├── {task-name}.prompt.md           # Task-specific prompts
└── {category}-{task}.prompt.md     # Categorized prompts
```

### Naming Conventions

- **Pattern**: `{category}-{task}.prompt.md` or `{task-name}.prompt.md`
- **Case**: kebab-case (lowercase with hyphens)
- **Extension**: Must be `.prompt.md`

**Examples**:
- ✅ `documentation-writer.prompt.md`
- ✅ `test-generator.prompt.md`
- ✅ `api-design.prompt.md`
- ❌ `DocumentationWriter.prompt.md` (wrong case)
- ❌ `doc-writer.md` (missing .prompt)

---

## 📝 Prompt File Format

### Required Structure

```markdown
---
agent: 'agent'                              # Target agent (usually 'agent')
tools: ['edit', 'search', 'web']           # Available tools
description: 'Brief description'            # One-line summary
---

# Prompt Title

Brief introduction paragraph explaining the prompt's purpose.

## SECTION 1

Content organized into clear sections.

## SECTION 2

More structured content with examples.
```

### Frontmatter Fields

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| `agent` | Yes | Target agent to execute the prompt | `'agent'`, `'gpt-4'` |
| `tools` | No | Tools available to the agent | `['edit', 'search', 'web']` |
| `description` | Yes | One-line summary (max 150 chars) | `'Expert technical writer...'` |
| `version` | No | Semantic version | `'1.0.0'` |
| `category` | No | Grouping category | `'documentation'`, `'testing'` |

---

## ✅ Content Guidelines

### DO's

1. **Clear Purpose**: State the prompt's purpose in the first paragraph
2. **Structured Sections**: Use H2/H3 headings for organization
3. **Concrete Examples**: Include code examples where applicable
4. **Actionable Steps**: Provide clear, numbered workflows
5. **Context Awareness**: Reference project-specific conventions
6. **Consistent Tone**: Match project documentation style

### DON'Ts

1. ❌ Vague or ambiguous instructions
2. ❌ Overly complex, multi-purpose prompts
3. ❌ Hard-coded paths or project-specific data
4. ❌ Duplicate content from other prompts
5. ❌ Missing examples or unclear outcomes

---

## 🎯 When to Create a Prompt File

Create a new prompt file when:

✅ **Repeatable Task**: The task is performed frequently  
✅ **Complex Instructions**: Multi-step process needs consistency  
✅ **Team Standard**: Establishing a team-wide approach  
✅ **Quality Control**: Ensuring consistent output quality  
✅ **Onboarding**: Helping new team members follow best practices

**Don't create** a prompt file for:

❌ One-off tasks or experiments  
❌ Personal preferences without team consensus  
❌ Tasks better suited for custom agents  
❌ Content that belongs in project documentation

---

## 🔍 Usage

### Invoking Prompts

In Copilot Chat, use the `#` symbol:

```
# Basic invocation
#documentation-writer

# With context files
#documentation-writer @workspace

# With specific request
#documentation-writer Create API reference for UserService
```

### Passing Context

```
# Pass specific files
#test-generator src/services/user.service.ts

# Pass entire workspace
#api-design @workspace

# Pass selection
#refactor (highlight code, then invoke)
```

---

## 📋 Prompt Categories

### Documentation
- `documentation-writer.prompt.md` - Technical documentation using Diátaxis
- `api-documentation.prompt.md` - API reference generation
- `readme-generator.prompt.md` - README file creation

### Testing
- `test-generator.prompt.md` - Unit test generation
- `e2e-test.prompt.md` - End-to-end test scenarios
- `test-data-builder.prompt.md` - Test data creation

### Code Quality
- `code-reviewer.prompt.md` - Code review checklist
- `refactoring-assistant.prompt.md` - Refactoring guidance
- `performance-optimizer.prompt.md` - Performance improvements

### Architecture
- `api-design.prompt.md` - REST API design
- `database-schema.prompt.md` - Database schema design
- `architecture-review.prompt.md` - Architecture assessment

---

## 🔨 Creating a New Prompt File

### Step 1: Plan

Define:
- **Purpose**: What specific task does this prompt address?
- **Target Users**: Who will use this prompt?
- **Input Requirements**: What context/files are needed?
- **Expected Output**: What should the result look like?

### Step 2: Create File

```bash
# Navigate to prompts directory
cd .github/prompts/

# Create new prompt file
touch my-task.prompt.md
```

### Step 3: Add Frontmatter

```yaml
---
agent: 'agent'
tools: ['edit', 'search']
description: 'Brief description of what this prompt does'
version: '1.0.0'
category: 'category-name'
---
```

### Step 4: Write Content

Follow this structure:

```markdown
# Prompt Title

Brief introduction explaining the purpose and when to use this prompt.

## GUIDING PRINCIPLES

List key principles that govern the task.

## WORKFLOW

1. **Step 1**: Clear action
2. **Step 2**: Clear action
3. **Step 3**: Clear action

## EXAMPLES

Concrete examples of inputs and expected outputs.

## NOTES

Additional considerations or limitations.
```

### Step 5: Test

```bash
# Test in Copilot Chat
#my-task Test input to verify behavior

# Test with files
#my-task src/example.ts

# Test with workspace
#my-task @workspace
```

### Step 6: Document

Add your prompt to the appropriate category section in this README.

---

## 🔄 Maintenance

### Version Updates

When updating a prompt:

1. Increment version in frontmatter
2. Add changelog section at bottom of file
3. Test with previous use cases
4. Update this README if category changes

```markdown
## CHANGELOG

### v1.1.0 (2026-02-05)
- Added support for TypeScript decorators
- Improved example clarity

### v1.0.0 (2026-01-15)
- Initial release
```

### Deprecation

To deprecate a prompt:

```yaml
---
agent: 'agent'
description: 'DEPRECATED - Use new-prompt.prompt.md instead'
deprecated: true
replacement: 'new-prompt.prompt.md'
---
```

Add deprecation notice at top of file:

```markdown
# ⚠️ DEPRECATED

This prompt is deprecated. Use [new-prompt.prompt.md](./new-prompt.prompt.md) instead.

[Keep original content for reference]
```

---

## 📊 Quality Checklist

Before committing a new prompt file:

- [ ] Frontmatter is complete and valid
- [ ] Description is clear and concise (≤150 chars)
- [ ] File follows naming convention (kebab-case.prompt.md)
- [ ] Content is well-structured with clear sections
- [ ] Examples are provided and tested
- [ ] Workflow steps are numbered and actionable
- [ ] Tested in Copilot Chat with various inputs
- [ ] Added to appropriate category in this README
- [ ] No typos or grammatical errors
- [ ] Follows project code style conventions

---

## 🔗 Related

- **Custom Agents**: `.github/agents/` - Specialized AI assistants
- **Skills**: `.github/skills/` - Reusable knowledge modules
- **Instructions**: `.github/instructions/` - Coding guidelines

---

## 📚 Resources

- [VS Code Prompt Files Documentation](https://code.visualstudio.com/docs/copilot/customization/prompt-files)
- [GitHub Copilot Best Practices](https://docs.github.com/copilot)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)

---

## 🎯 Best Practices

### Clarity
- Use simple, direct language
- Avoid ambiguous instructions
- Provide clear examples

### Specificity
- Target one specific task per prompt
- Define clear success criteria
- Specify expected output format

### Consistency
- Follow project conventions
- Match existing prompt style
- Use standard terminology

### Testability
- Include example invocations
- Provide sample inputs/outputs
- Document edge cases

---

**Last Updated**: 2026-02-05  
**Maintained By**: Architecture Committee  
**Review Frequency**: Quarterly
