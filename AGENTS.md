# Custom GitHub Copilot Agents

> **Purpose**: Specialized AI assistants for domain-specific development workflows  
> **Location**: `.github/agents/`  
> **Total Available**: 60+ custom agents

---

## 🤖 What are Custom Agents?

Custom agents are specialized GitHub Copilot assistants designed for specific development tasks. Each agent has focused expertise, dedicated tools, and domain-specific knowledge to help you work more efficiently.

## 📂 Where to Find Agents

All custom agents are located in:
```
.github/agents/
├── README.md                    # Complete agent catalog and governance
├── {agent-name}.agent.md       # Individual agent definitions
└── agents-tutorial.md          # Getting started guide
```

## 🚀 Quick Start

### Using an Agent

In VS Code, invoke an agent using `@`:

```
@agent-name your request here
```

**Examples**:
```
@gpt-5.2-codex-v0_en-specialized Create a new domain aggregate for User
@tdd-red Write failing tests for authentication use case
@accessibility Review this component for WCAG AA compliance
```

### Common Agents

- **🏗️ Architecture**: `@arch`, `@api-architect`, `@ddd-architect`
- **💻 Development**: `@gpt-5.2-codex-v0_en-specialized`, `@software-engineer-agent-v1`
- **🧪 Testing**: `@tdd-red`, `@tdd-green`, `@tdd-refactor`, `@playwright-tester`
- **📝 Documentation**: `@technical-content-evaluator`, `@se-technical-writer`
- **🔐 Security**: `@se-security-reviewer`, `@se-responsible-ai-code`
- **🎨 Design**: `@accessibility`, `@se-ux-ui-designer`

## 📚 Complete Documentation

For the full list of agents, usage examples, and governance rules, see:

**[👉 .github/agents/README.md](./.github/agents/README.md)**

This includes:
- Complete agent catalog (60+ agents)
- Agent categories and descriptions
- Creation and governance guidelines
- Frontmatter field reference
- Best practices and examples

## 🎯 Agent Categories

### 🏗️ Architecture & Design (12 agents)
Strategic planning, system design, and architectural decisions.

### 💻 Development Modes (8 agents)
Coding assistants for various development approaches and skill levels.

### 🧪 Testing (4 agents)
TDD workflow, test generation, and quality assurance.

### 📝 Documentation & Planning (8 agents)
Technical writing, specifications, and project planning.

### 🔍 Code Quality (5 agents)
Reviews, refactoring, and maintenance.

### 🎨 UX & Design (2 agents)
User experience and interface design.

### 🔐 Security & Compliance (2 agents)
Security reviews and responsible AI practices.

### 🚀 DevOps & CI/CD (2 agents)
Deployment, GitOps, and pipeline management.

### 🧠 AI & Reasoning (7 agents)
Advanced problem-solving and deep analysis.

### 📚 Product Management (2 agents)
Product strategy and requirement analysis.

### 🔧 Specialized Tools (9 agents)
Prompt engineering, skill creation, and specialized workflows.

## 🔗 Related Documentation

- **[.github/agents/README.md](./.github/agents/README.md)** - Complete agent catalog and governance
- **[.github/agents/agents-tutorial.md](./.github/agents/agents-tutorial.md)** - Getting started guide
- **[.github/skills/README.md](./.github/skills/README.md)** - Reusable knowledge modules for agents
- **[.github/prompts/README.md](./.github/prompts/README.md)** - Prompt templates
- **[docs/INDEX.md](./docs/INDEX.md)** - Main documentation hub

## 📖 Learn More

- **VS Code Documentation**: [Custom Agents](https://code.visualstudio.com/docs/copilot/customization/custom-agents)
- **Repository Governance**: [.github/agents/README.md](./.github/agents/README.md)
- **Agent Tutorial**: [.github/agents/agents-tutorial.md](./.github/agents/agents-tutorial.md)

---

**Note**: This file provides a quick overview. For complete agent details, always refer to [.github/agents/README.md](./.github/agents/README.md).
