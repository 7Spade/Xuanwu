# Custom Agents Directory

> **Purpose**: Custom GitHub Copilot agents for specialized development tasks  
> **Auto-Discovery**: Enabled via `.github/copilot.yml`  
> **Total Agents**: 50+

---

## How Agents Work

Custom agents provide specialized assistance for specific development tasks. They are automatically discovered by Copilot Browser Agent and can be invoked via Copilot Chat.

### Invocation

```bash
# In Copilot Chat:
@agent-name <your request>

# Example:
@gpt-5.2-codex-v0_en-specialized Create a new capability with DDD layers
```

---

## Agent Categories

### 🏗️ Architecture & Design
- `arch.agent.md` - Architecture design patterns
- `api-architect.agent.md` - API architecture guidance
- `blueprint-mode.agent.md` - Blueprint-based development
- `blueprint-mode-codex.agent.md` - Enhanced blueprint mode

### 💻 Development Modes
- `gpt-5.2-codex-v0_en-specialized.agent.md` - DDD × Angular × Firebase
- `gpt-5.1-codex-v51_en-specialized.agent.md` - Angular 21+ specialist
- `gpt-5-beast-mode.agent.md` - Advanced problem-solving
- `software-engineer-agent-v1.agent.md` - Full-stack development

### 🧪 Testing
- `tdd-red.agent.md` - Write failing tests first
- `tdd-green.agent.md` - Implement to pass tests
- `tdd-refactor.agent.md` - Refactor with tests
- `playwright-tester.agent.md` - E2E testing with Playwright

### 📝 Documentation & Planning
- `se-technical-writer.agent.md` - Technical documentation
- `specification.agent.md` - Specification documents
- `planner.agent.md` - Implementation planning
- `task-researcher.agent.md` - Task research and breakdown

### 🔍 Code Quality
- `gilfoyle.agent.md` - Sarcastic code review (Silicon Valley style)
- `janitor.agent.md` - Code cleanup and tech debt
- `tech-debt-remediation-plan.agent.md` - Tech debt strategy
- `refine-issue.agent.md` - Issue refinement

### 🎨 UX & Design
- `se-ux-ui-designer.agent.md` - UX/UI design
- `accessibility.agent.md` - Accessibility compliance

### 🔐 Security & Compliance
- `se-responsible-ai-code.agent.md` - Responsible AI practices
- `se-security-reviewer.agent.md` - Security review

### 🚀 DevOps & CI/CD
- `se-gitops-ci-specialist.agent.md` - GitOps and CI/CD
- `github-actions-expert.agent.md` - GitHub Actions workflows

### 🧠 AI & Prompts
- `prompt-engineer.agent.md` - Prompt engineering
- `prompt-builder.agent.md` - Prompt construction
- `context7.agent.md` - Context7 integration
- `thinking-beast-mode.agent.md` - Deep reasoning
- `ultimate-transparent-thinking-beast-mode.agent.md` - Enhanced reasoning
- `critical-thinking.agent.md` - Critical analysis

### 📚 Product Management
- `se-product-manager-advisor.agent.md` - Product management guidance
- `simple-app-idea-generator.agent.md` - App idea generation

### 🔧 Specialized Tools
- `code-tour.agent.md` - VS Code CodeTour creation
- `custom-agent-foundry.agent.md` - Create new custom agents
- `debug.agent.md` - Debugging assistance
- `research-technical-spike.agent.md` - Technical spike research
- `search-ai-optimization-expert.agent.md` - SEO/AEO/GEO optimization

### 🎯 Thinking Modes
- `Thinking-Beast-Mode.agent-v1.md` - v1 thinking mode
- `voidbeast-gpt41enhanced.agent.md` - Enhanced GPT-4.1

---

## Agent Structure

Each agent file should follow this structure:

```markdown
---
name: agent-name
description: Brief description of what this agent does
version: 1.0.0
capabilities:
  - capability1
  - capability2
---

# Agent Name

## Purpose
Brief explanation of the agent's purpose

## Usage
How to use this agent

## Capabilities
Detailed list of what this agent can do

## Examples
Example invocations and outputs
```

---

## Best Practices

1. **Use Descriptive Names**: Agent names should clearly indicate their purpose
2. **Include Metadata**: Always add frontmatter with name, description, version
3. **Provide Examples**: Show concrete examples of usage
4. **Keep Focused**: Each agent should have a single, clear purpose
5. **Document Limitations**: Be clear about what the agent cannot do

---

## Adding New Agents

1. Create a new `.agent.md` file in this directory
2. Follow the agent structure template above
3. Test the agent via Copilot Chat
4. Update this README with the new agent in the appropriate category

---

## Related

- **Skills**: `.github/skills/` - Specialized knowledge bases
- **Prompts**: `.github/prompts/` - Reusable prompt templates
- **Instructions**: `.github/instructions/` - Development guidelines

---

**Last Updated**: 2026-02-03  
**Maintained by**: Black-Tortoise Development Team
