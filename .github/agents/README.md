# Custom Agents Governance

> **Purpose**: Specialized GitHub Copilot agents for domain-specific development tasks  
> **Format**: Markdown files with YAML frontmatter  
> **Documentation**: [VS Code Custom Agents](https://code.visualstudio.com/docs/copilot/customization/custom-agents)  
> **Total Agents**: 60+

---

## 📋 Overview

Custom agents are specialized AI assistants designed for specific development workflows. Each agent has a focused purpose, specific capabilities, and can leverage tools, skills, and MCP servers to accomplish complex tasks.

## 📁 Directory Structure

```
.github/agents/
├── README.md                           # This file
├── agents-tutorial.md                  # Getting started guide
├── {agent-name}.agent.md              # Standard agent
├── {agent-name}.agent-v{n}.md         # Versioned agent
└── declarative-agents-architect.agent.md  # Meta-agent for creating agents
```

### Naming Conventions

**File Names**:
- **Pattern**: `{agent-name}.agent.md` or `{agent-name}.agent-v{n}.md`
- **Case**: kebab-case (lowercase with hyphens)
- **Extension**: Must be `.agent.md`
- **Versioning**: Optional `-v{major}.md` suffix for breaking changes

**Examples**:
- ✅ `gpt-5.2-codex-v0_en-specialized.agent.md`
- ✅ `tdd-green.agent.md`
- ✅ `api-architect.agent.md`
- ❌ `ApiArchitect.agent.md` (wrong case)
- ❌ `api-architect.md` (missing .agent)

**Agent Names** (in frontmatter):
- **Pattern**: Short, descriptive identifier
- **Case**: kebab-case or PascalCase (match file name)

---

## 📝 Agent File Format

### Required Structure

```markdown
---
name: agent-name
description: 'Brief description of agent purpose'
version: 1.0.0
capabilities:
  - capability1
  - capability2
tools: ['read', 'write', 'search']
skills: ['skill-name-1', 'skill-name-2']
mcp-servers:
  server-name:
    type: http
    url: "https://server-url"
handoffs:
  - label: Handoff Label
    agent: target-agent
    prompt: Instructions for target agent
---

# Agent Display Name

Brief introduction explaining the agent's purpose and when to use it.

## CORE PRINCIPLES

Key principles that govern the agent's behavior.

## CAPABILITIES

Detailed list of what this agent can do.

## WORKFLOW

Step-by-step process the agent follows.

## EXAMPLES

Example invocations and expected outputs.

## LIMITATIONS

What this agent cannot or should not do.
```

### Frontmatter Fields

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| `name` | Yes | Agent identifier | `'gpt-5-codex'` |
| `description` | Yes | One-line summary (max 150 chars) | `'DDD × Angular × Firebase specialist'` |
| `version` | No | Semantic version | `'1.0.0'` |
| `capabilities` | No | List of agent capabilities | `['code-generation', 'refactoring']` |
| `tools` | No | Available tools | `['edit', 'search', 'web']` |
| `skills` | No | Referenced skills | `['architecture-ddd']` |
| `mcp-servers` | No | MCP server configurations | See MCP section below |
| `handoffs` | No | Agent-to-agent handoff configs | See Handoffs section below |
| `argument-hint` | No | Usage hint for users | `'Ask about specific feature'` |

---

## 🎯 Agent Categories

### 🏗️ Architecture & Design (12 agents)
- `arch.agent.md` - Architecture patterns and design decisions
- `api-architect.agent.md` - REST/GraphQL API design
- `blueprint-mode.agent.md` - Structured development workflows
- `declarative-agents-architect.agent.md` - Meta-agent for agent creation

### 💻 Development Modes (8 agents)
- `gpt-5.2-codex-v0_en-specialized.agent.md` - DDD × Angular 20+ × Firebase
- `gpt-5.1-codex-v51_en-specialized.agent.md` - Angular specialist
- `software-engineer-agent-v1.agent.md` - General full-stack development
- `4.1-beast.agent.md` - GPT-4.1 enhanced developer

### 🧪 Testing (4 agents)
- `tdd-red.agent.md` - Write failing tests first
- `tdd-green.agent.md` - Minimal implementation to pass tests
- `tdd-refactor.agent.md` - Refactor with test coverage
- `playwright-tester.agent.md` - E2E testing with Playwright

### 📝 Documentation & Planning (8 agents)
- `se-technical-writer.agent.md` - Technical documentation (Diátaxis)
- `specification.agent.md` - Feature specifications
- `planner.agent.md` - Implementation planning
- `task-researcher.agent.md` - Task research and breakdown
- `implementation-plan.agent.md` - Detailed implementation plans
- `refine-issue.agent.md` - GitHub issue refinement

### 🔍 Code Quality (5 agents)
- `gilfoyle.agent.md` - Sarcastic code review (Silicon Valley style)
- `code-reviewer.agent.md` - Standard code review
- `janitor.agent.md` - Code cleanup and tech debt
- `tech-debt-remediation-plan.agent.md` - Tech debt strategy
- `hlbpa.agent.md` - High-level architecture refinement

### 🎨 UX & Design (2 agents)
- `se-ux-ui-designer.agent.md` - UX/UI design and Jobs-to-be-Done
- `accessibility.agent.md` - WCAG compliance and a11y testing

### 🔐 Security & Compliance (2 agents)
- `se-responsible-ai-code.agent.md` - Responsible AI practices
- `se-security-reviewer.agent.md` - OWASP Top 10, Zero Trust security

### 🚀 DevOps & CI/CD (2 agents)
- `se-gitops-ci-specialist.agent.md` - GitOps and CI/CD pipelines
- `github-actions-expert.agent.md` - GitHub Actions workflows

### 🧠 AI & Reasoning (7 agents)
- `prompt-engineer.agent.md` - Prompt analysis and improvement
- `prompt-builder.agent.md` - Systematic prompt construction
- `context7.agent.md` - Context7 MCP integration
- `thinking-beast-mode.agent.md` - Deep reasoning mode
- `ultimate-transparent-thinking-beast-mode.agent.md` - Enhanced reasoning
- `Thinking-Beast-Mode.agent-v1.md` - v1 thinking mode
- `critical-thinking.agent.md` - Challenge assumptions

### 📚 Product Management (2 agents)
- `se-product-manager-advisor.agent.md` - Product strategy and GitHub issues
- `simple-app-idea-generator.agent.md` - App ideation and brainstorming

### 🔧 Specialized Tools (9 agents)
- `code-tour.agent.md` - VS Code CodeTour file generation
- `custom-agent-foundry.agent.md` - Create new custom agents
- `debug.agent.md` - Debugging assistance
- `research-technical-spike.agent.md` - Technical spike research
- `search-ai-optimization-expert.agent.md` - SEO/AEO/GEO optimization
- `modernization.agent.md` - Legacy code modernization
- `monday-bug-fixer.agent.md` - Monday.com integration for bug fixes
- `voidbeast-gpt41enhanced.agent.md` - Multi-mode enhanced developer
- `electron-angular-native.agent.md` - Electron + Angular + native code

---

## 🔨 Creating a New Agent

### Step 1: Define Agent Purpose

Answer these questions:
- **What specific problem** does this agent solve?
- **Who is the target user**? (developer, architect, designer, etc.)
- **What makes this agent unique** from existing agents?
- **What tools/skills** does it need?

### Step 2: Choose Agent Type

**Specialist Agent**: Focused on one specific task
- Example: `tdd-green.agent.md` (only implements passing tests)
- Use when: Task is well-defined and narrow

**Generalist Agent**: Handles multiple related tasks
- Example: `gpt-5.2-codex-v0_en-specialized.agent.md` (full DDD development)
- Use when: Tasks require cross-domain knowledge

**Meta-Agent**: Creates or manages other agents
- Example: `custom-agent-foundry.agent.md` (creates new agents)
- Use when: Automating agent development

### Step 3: Create Agent File

```bash
cd .github/agents/

# Create agent file
touch my-agent-name.agent.md
```

### Step 4: Write Frontmatter

```yaml
---
name: my-agent-name
description: 'Brief description of what this agent does and when to use it'
version: 1.0.0
capabilities:
  - specific-capability-1
  - specific-capability-2
tools: ['edit', 'search', 'web']
skills: ['relevant-skill-name']
argument-hint: 'How to invoke this agent effectively'
---
```

### Step 5: Write Agent Content

```markdown
# My Agent Name

Brief introduction paragraph explaining purpose.

## CORE PRINCIPLES

1. **Principle 1**: Explanation
2. **Principle 2**: Explanation

## CAPABILITIES

This agent can:
- Capability 1 with specific details
- Capability 2 with specific details

## WORKFLOW

1. **Step 1**: Action
2. **Step 2**: Action
3. **Step 3**: Action

## USAGE EXAMPLES

### Example 1: Task Name

\`\`\`
@my-agent-name Implement feature X
\`\`\`

Expected output: Description

### Example 2: Task Name

\`\`\`
@my-agent-name Debug issue Y
\`\`\`

Expected output: Description

## LIMITATIONS

- Limitation 1
- Limitation 2

## WHEN TO USE

Use this agent when:
- Scenario 1
- Scenario 2

Do not use this agent for:
- Anti-scenario 1
- Anti-scenario 2
```

### Step 6: Test the Agent

```bash
# In Copilot Chat
@my-agent-name Test request to verify behavior

# With file context
@my-agent-name @workspace Analyze codebase

# With specific files
@my-agent-name src/example.ts Review this file
```

### Step 7: Document

Add your agent to the appropriate category in this README.

---

## 🔗 Advanced Features

### MCP Server Integration

```yaml
---
name: context7-agent
mcp-servers:
  context7:
    type: http
    url: "https://mcp.context7.com/mcp"
    headers: {"CONTEXT7_API_KEY": "${{ secrets.COPILOT_MCP_CONTEXT7 }}"}
    tools: ["get-library-docs", "resolve-library-id"]
---
```

### Agent Handoffs

```yaml
---
name: planner-agent
handoffs:
  - label: Implement Plan
    agent: gpt-5.2-codex-v0_en-specialized
    prompt: Implement the plan outlined above following DDD principles
    send: false
---
```

### Skills Integration

```yaml
---
name: ddd-developer
skills: ['architecture-ddd', 'angular-signals']
---

# DDD Developer Agent

Apply patterns from the `architecture-ddd` skill when generating code.
Use the `angular-signals` skill for state management.
```

---

## 🔄 Maintenance

### Version Updates

**Semantic Versioning**:
- `1.0.0` → `1.1.0`: New capabilities, backward compatible
- `1.1.0` → `2.0.0`: Breaking changes, different behavior

**Update Process**:
1. Increment version in frontmatter
2. Add changelog section
3. Test with existing workflows
4. Update this README if category changes

```markdown
## CHANGELOG

### v2.0.0 (2026-02-05)
- BREAKING: Changed prompt structure
- Added TypeScript 5.0 support
- Improved error handling

### v1.1.0 (2026-01-15)
- Added support for async/await patterns
- Improved example clarity

### v1.0.0 (2025-12-01)
- Initial release
```

### Deprecation

```yaml
---
name: old-agent
description: 'DEPRECATED - Use new-agent.agent.md instead'
deprecated: true
replacement: 'new-agent'
deprecated_date: '2026-02-05'
---
```

---

## 📋 Quality Checklist

Before committing a new agent:

- [ ] File name follows `{name}.agent.md` convention
- [ ] Frontmatter includes name, description, version
- [ ] Description is clear and under 150 characters
- [ ] Core principles are stated
- [ ] Capabilities are listed and specific
- [ ] Workflow steps are clear and numbered
- [ ] Usage examples are provided
- [ ] Limitations are documented
- [ ] Tested in Copilot Chat with various inputs
- [ ] Added to appropriate category in README
- [ ] No secrets or API keys in file
- [ ] Referenced skills exist in `.github/skills/`

---

## 🎯 Best Practices

### Focus
- One clear purpose per agent
- Specific, actionable capabilities
- Well-defined scope

### Clarity
- Clear, unambiguous instructions
- Concrete examples
- Step-by-step workflows

### Reusability
- Reference shared skills
- Use handoffs for multi-agent workflows
- Avoid duplication

### Maintainability
- Version all agents
- Document changes
- Keep examples current

---

## 🔗 Related

- **Skills**: `.github/skills/` - Reusable knowledge modules
- **Prompts**: `.github/prompts/` - Reusable prompt templates
- **Instructions**: `.github/instructions/` - Coding guidelines

---

## 📚 Resources

- [VS Code Custom Agents Documentation](https://code.visualstudio.com/docs/copilot/customization/custom-agents)
- [GitHub Copilot Extensibility](https://docs.github.com/copilot)
- [Agent Skills Documentation](https://code.visualstudio.com/docs/copilot/customization/agent-skills)
- [MCP Servers](https://modelcontextprotocol.io/)

---

**Last Updated**: 2026-02-05  
**Maintained By**: Black-Tortoise Development Team  
**Review Frequency**: Monthly
