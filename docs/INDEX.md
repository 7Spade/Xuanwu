# Xuanwu Documentation Index

> **Document Type**: Navigation Hub  
> **Project**: Xuanwu (玄武 - Black Tortoise)  
> **Stack**: Angular 21+ / SSR / Zoneless / DDD / NgRx Signals / Firebase  
> **Purpose**: Central navigation organized by the Diátaxis framework  
> **Last Updated**: 2026-02-05

---

## 🚀 Technology Highlights

- **Angular 21+**: Latest Angular features (Signals, control flow, standalone components)
- **SSR**: Server-Side Rendering with `@angular/ssr` for SEO and performance
- **Zoneless**: Pure reactive architecture without Zone.js overhead
- **DDD**: 8-layer Domain-Driven Design architecture
- **NgRx Signals**: Signal-based state management
- **Firebase**: Backend as a Service with Firestore

---

## 📖 Documentation by Type (Diátaxis Framework)

This documentation follows the **[Diátaxis Framework](https://diataxis.fr/)** with four distinct document types:

- 🎓 **Tutorials** - Learning-oriented (lesson)
- 🔧 **How-to Guides** - Problem-oriented (recipe)
- 📚 **Reference** - Information-oriented (dictionary)
- 💡 **Explanation** - Understanding-oriented (discussion)

---

## 🎯 Quick Start Paths

### 🆕 New to the Project?

1. 📖 [Project Architecture](./PROJECT_ARCHITECTURE.md) (Explanation) - Understand the "why"
2. 🔒 [DDD Layer Boundaries](./DDD_LAYER_BOUNDARIES.md) (Reference) - Learn the "what"
3. 📋 [Quick Reference](./QUICK_REFERENCE.md) (Reference) - Daily cheat sheet

### 🏗️ Ready to Build?

1. Check [Quick Reference](./QUICK_REFERENCE.md) for fast decisions
2. Look up specific patterns in Reference docs
3. Follow naming and import rules

---

## 💡 Explanation Documents (Understanding-oriented)

*Read these to understand "why" and architectural reasoning*

### 1️⃣ [Project Architecture](./PROJECT_ARCHITECTURE.md)

**Purpose**: Complete architectural overview  
**Contains**:
- 8-layer DDD structure explanation
- Frontend (Browser) and Backend (Node.js) architecture
- Layer responsibilities and technology constraints
- Dependency flow diagrams
- Architecture decision records

**Read this when**:
- Starting work on the project
- Understanding overall system design
- Making architectural decisions

---

## 💡 Explanation Documents (Understanding-oriented)

*Read these to understand "why" and architectural reasoning*

### 📖 [Project Architecture](./PROJECT_ARCHITECTURE.md)

**Purpose**: Understand SSR + Zoneless + DDD architectural decisions  
**Target Audience**: All developers  
**Contains**:
- Why SSR? Why Zoneless? Why DDD?
- 8-layer structure reasoning
- Technology constraints and rationale
- Architecture decision records (ADRs)

**When to read**: Before starting development, when wondering "why this way?"

---

## 📚 Reference Documents (Information-oriented)

*Look up technical specifications and rules*

### 1️⃣ [Quick Reference](./QUICK_REFERENCE.md)

**Purpose**: Fast lookup for daily development  
**Target Audience**: All developers (keep open while coding)  
**Contains**:
- Layer decision table
- Import rules checklist
- File naming formats
- Quick decision guides

**When to use**: Daily development, quick decisions

---

### 2️⃣ [DDD Layer Boundaries](./DDD_LAYER_BOUNDARIES.md)

**Purpose**: Technical specification of layer responsibilities  
**Target Audience**: All developers  
**Contains**:
- Layer positioning and ownership
- Allowed vs forbidden imports per layer
- Boundary violation checklist
- Common violations and solutions

**When to use**: Writing code, code review, resolving dependencies

---

### 3️⃣ [Import Rules](./IMPORT_RULES.md)

**Purpose**: Dependency direction and import constraints  
**Target Audience**: All developers  
**Contains**:
- Global boundary principles
- Dependency direction diagrams
- Layer-specific import rules
- Correct vs forbidden examples

**When to use**: Adding imports, setting up modules, refactoring

---

### 4️⃣ [Naming Conventions](./NAMING_CONVENTIONS.md)

**Purpose**: File and code naming standards  
**Target Audience**: All developers  
**Contains**:
- Naming case guidelines (PascalCase, camelCase, kebab-case)
- File type suffixes (.vo, .aggregate, .component)
- Angular 21+ patterns
- Layer-specific naming

**When to use**: Creating files, naming classes/functions

---

### 5️⃣ [Testing Standards](./TESTING_STANDARDS.md)

**Purpose**: Testing requirements per layer  
**Target Audience**: All developers  
**Contains**:
- Testing philosophy and principles
- Layer-specific requirements
- Test examples per layer
- Coverage goals

**When to use**: Writing tests, setting up test infrastructure

---

### 6️⃣ [Database Schema](./DATABASE_SCHEMA.md)

**Purpose**: Firestore data model specification  
**Target Audience**: Backend developers, full-stack developers  
**Contains**:
- Entity Relationship Diagram (Mermaid)
- Collection structure
- Query patterns
- Access control matrix

**When to use**: Designing data models, writing queries, setting permissions

---

### 7️⃣ [UI/UX Layout](./UI_UX_LAYOUT.md)

**Purpose**: Interface design specification  
**Target Audience**: Frontend developers, UI/UX designers  
**Contains**:
- Layout wireframes (ASCII art)
- Design tokens (colors, typography, spacing)
- Component hierarchy
- Responsive patterns

**When to use**: Building UI components, layout decisions

---

## 🎓 Tutorial Documents (Learning-oriented)

*Step-by-step learning paths for newcomers*

> ⚠️ **Coming Soon**: Tutorial documents are being developed
> 
> Planned tutorials:
> - Getting Started with Xuanwu Development
> - Your First Feature: From Domain to UI
> - Understanding DDD Through Practice

---

## 🔧 How-to Guides (Problem-oriented)

*Step-by-step recipes for specific tasks*

> ⚠️ **Coming Soon**: How-to guides are being developed
>
> Planned guides:
> - How to Add a New Feature
> - How to Implement a Use Case
> - How to Create a Domain Aggregate
> - How to Setup Development Environment

---

## 🔗 Related Resources

### GitHub Copilot Customization

- [Custom Instructions](../.github/instructions/) - Coding guidelines for AI
  - [Style Guide](../.github/instructions/style-guide.md) - Angular conventions
  - [Accessibility](../.github/instructions/accessibility.md) - WCAG AA compliance
- [Prompts](../.github/prompts/) - Reusable prompt templates
- [Skills](../.github/skills/) - Knowledge modules for agents
- [Agents](../.github/agents/) - Specialized AI assistants

### Code Examples

- [Domain Layer Example](./examples/domain-layer-example.ts) - Pure domain logic
- [Application Layer Example](./examples/application-layer-example.ts) - Use cases
- [Feature Layer Example](./examples/feature-layer-example.ts) - UI components

---

## 🗺️ Documentation Map

```
docs/
├── INDEX.md                    ← You are here (Navigation hub)
│
├── 💡 Explanation/
│   └── PROJECT_ARCHITECTURE.md (Understanding architectural decisions)
│
├── 📚 Reference/
│   ├── QUICK_REFERENCE.md      (Daily cheat sheet)
│   ├── DDD_LAYER_BOUNDARIES.md (Layer specifications)
│   ├── IMPORT_RULES.md         (Dependency rules)
│   ├── NAMING_CONVENTIONS.md   (Naming standards)
│   ├── TESTING_STANDARDS.md    (Testing requirements)
│   ├── DATABASE_SCHEMA.md      (Data model)
│   └── UI_UX_LAYOUT.md         (Design system)
│
├── 🎓 Tutorial/ (Coming Soon)
│
├── 🔧 How-to/ (Coming Soon)
│
└── examples/
    ├── domain-layer-example.ts
    ├── application-layer-example.ts
    └── feature-layer-example.ts
```

---

## 📋 Document Type Legend

- **💡 Explanation**: Understand concepts and "why" (Discussion)
- **📚 Reference**: Look up facts and rules (Dictionary)
- **🎓 Tutorial**: Learn through guided practice (Lesson)
- **🔧 How-to**: Solve specific problems (Recipe)

This organization follows the **[Diátaxis Framework](https://diataxis.fr/)** for systematic technical documentation.

---

## 🚀 Common Workflows

### Starting a New Feature

1. Read [Quick Reference](./QUICK_REFERENCE.md#-layer-quick-decisions) - Fast layer decision
2. Check [Naming Conventions](./NAMING_CONVENTIONS.md) - Correct file/code naming
3. Follow [Import Rules](./IMPORT_RULES.md) - Allowed dependencies
4. Write tests per [Testing Standards](./TESTING_STANDARDS.md)
5. Verify against [DDD Layer Boundaries](./DDD_LAYER_BOUNDARIES.md)

### Adding a Domain Aggregate

1. Read [Project Architecture](./PROJECT_ARCHITECTURE.md) - Understand domain layer
2. Check [Domain Layer Rules](./DDD_LAYER_BOUNDARIES.md#-appdomain-responsibility-boundaries)
3. Follow naming: `{name}.aggregate.ts`
4. Write pure domain tests (no framework dependencies)

### Code Review Checklist

1. ✅ Correct layer placement ([Quick Reference](./QUICK_REFERENCE.md))
2. ✅ Proper imports ([Import Rules](./IMPORT_RULES.md))
3. ✅ Naming conventions ([Naming Conventions](./NAMING_CONVENTIONS.md))
4. ✅ Tests present ([Testing Standards](./TESTING_STANDARDS.md))
5. ✅ No boundary violations ([DDD Layer Boundaries](./DDD_LAYER_BOUNDARIES.md))

---

## 🎯 Find Information By Topic

### Architecture & Design
- [8-Layer DDD Structure](./PROJECT_ARCHITECTURE.md#-frontend-architecture-browser-runtime)
- [Dependency Flow](./PROJECT_ARCHITECTURE.md#-dependency-flow)
- [Technology Constraints](./PROJECT_ARCHITECTURE.md#-technology-constraints-by-layer)
- [Why SSR?](./PROJECT_ARCHITECTURE.md#why-ssr)
- [Why Zoneless?](./PROJECT_ARCHITECTURE.md#why-zoneless)

### Coding Standards
- [File Naming](./NAMING_CONVENTIONS.md#-directory-and-file-naming-rules)
- [Class Naming](./NAMING_CONVENTIONS.md#-code-entity-naming-rules)
- [Import Patterns](./IMPORT_RULES.md#-correct-import-examples)
- [Angular 21+ Rules](./NAMING_CONVENTIONS.md#-angular-21-specific-rules)

### Layer-Specific Guides
- [Domain Layer](./DDD_LAYER_BOUNDARIES.md#-appdomain-responsibility-boundaries)
- [Application Layer](./DDD_LAYER_BOUNDARIES.md#-cross-layer-communication-rules)
- [Infrastructure Layer](./IMPORT_RULES.md#-appinfrastructure-boundary-rules)
- [Features Layer](./IMPORT_RULES.md#-appfeatures-boundary-rules)

### Testing
- [Domain Testing](./TESTING_STANDARDS.md#appdomain-testing)
- [Application Testing](./TESTING_STANDARDS.md#appapplication-testing)
- [Component Testing](./TESTING_STANDARDS.md#appfeatures-testing)
- [Coverage Goals](./TESTING_STANDARDS.md#-test-coverage-goals)

---

## 📞 Need Help?

- **Quick Question?** Check [Quick Reference](./QUICK_REFERENCE.md)
- **Understanding Why?** Read [Project Architecture](./PROJECT_ARCHITECTURE.md)
- **Looking Up Rules?** See Reference documents
- **Learning DDD?** Coming soon: Tutorial documents

---

*Documentation maintained following the [Diátaxis Framework](https://diataxis.fr/) principles*

### Code Review Checklist

1. Check [Boundary Violations](./DDD_LAYER_BOUNDARIES.md#-boundary-violation-checklist)
2. Verify [Import Rules](./IMPORT_RULES.md#--forbidden-import-examples)
3. Confirm [Naming Conventions](./NAMING_CONVENTIONS.md)
4. Validate [Test Coverage](./TESTING_STANDARDS.md#-test-coverage-goals)

### Refactoring

1. Review [Project Architecture](./PROJECT_ARCHITECTURE.md)
2. Check [Layer Boundaries](./DDD_LAYER_BOUNDARIES.md)
3. Update [Import Paths](./IMPORT_RULES.md)
4. Maintain [Naming Consistency](./NAMING_CONVENTIONS.md)
5. Update/fix tests per [Testing Standards](./TESTING_STANDARDS.md)

---

## 🎓 Learning Path

### For New Developers

**Week 1**: Foundation
1. [Project Architecture](./PROJECT_ARCHITECTURE.md) - Understand overall structure
2. [Quick Reference](./QUICK_REFERENCE.md) - Get familiar with day-to-day rules
3. [Code Examples](./examples/) - See patterns in action

**Week 2**: Deep Dive
1. [DDD Layer Boundaries](./DDD_LAYER_BOUNDARIES.md) - Master layer responsibilities
2. [Import Rules](./IMPORT_RULES.md) - Learn dependency management
3. [Naming Conventions](./NAMING_CONVENTIONS.md) - Adopt naming standards

**Week 3**: Quality
1. [Testing Standards](./TESTING_STANDARDS.md) - Write proper tests
2. Start contributing with small features
3. Participate in code reviews

### For AI Assistants (Copilot, ChatGPT, etc.)

**Priority Order**:
1. [Quick Reference](./QUICK_REFERENCE.md) - Fast decisions
2. [Naming Conventions](./NAMING_CONVENTIONS.md) - Consistent code generation
3. [Import Rules](./IMPORT_RULES.md) - Correct dependencies
4. [Project Architecture](./PROJECT_ARCHITECTURE.md) - Context understanding
5. [DDD Layer Boundaries](./DDD_LAYER_BOUNDARIES.md) - Enforce boundaries

---

## 🔗 External Resources

- [Angular Documentation](https://angular.dev) - Official Angular docs
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html) - Martin Fowler's DDD overview
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) - Uncle Bob's Clean Architecture

---

## 📞 Getting Help

- **Architecture Questions**: Review [Project Architecture](./PROJECT_ARCHITECTURE.md) and [DDD Layer Boundaries](./DDD_LAYER_BOUNDARIES.md)
- **Coding Questions**: Check [Quick Reference](./QUICK_REFERENCE.md) and [Naming Conventions](./NAMING_CONVENTIONS.md)
- **Testing Questions**: See [Testing Standards](./TESTING_STANDARDS.md)
- **Still Stuck?**: Ask the team or consult with senior developers

---

## 📊 Documentation Statistics

- **Total Documents**: 6 core documents + 3 examples
- **Total Lines**: ~3,500+ lines of documentation
- **Coverage**: Architecture, Boundaries, Imports, Naming, Testing, Quick Reference
- **Languages**: English (primary), with Chinese source references

---

## 🔄 Document Maintenance

### Version History

- **v1.0** (2026-02-05): Initial restructured documentation
  - Migrated from Chinese documents
  - Created English versions with enhanced content
  - Added code examples
  - Established navigation structure

### Update Schedule

- **Continuous**: Update as architecture evolves
- **Quarterly Review**: Ensure accuracy and relevance
- **Version Tagging**: Major changes get version bumps

### Contributing to Documentation

When updating documentation:
1. Keep content accurate and up-to-date
2. Add examples for new patterns
3. Update related documents for consistency
4. Test all code examples
5. Update this INDEX.md if adding new documents

---

**Last Updated**: 2026-02-05  
**Maintained By**: Architecture Committee  
**Status**: ✅ Active and Maintained

---

### 7️⃣ [Database Schema](./DATABASE_SCHEMA.md)

**Purpose**: Database structure and entity relationships  
**Contains**:
- ER diagram (Mermaid format)
- Entity descriptions with fields
- Firestore collection structure
- Query patterns
- Access control model
- Design decisions

**Read this when**:
- Implementing data persistence
- Understanding the data model
- Writing repository implementations
- Designing new features that need storage

---

### 8️⃣ [UI/UX Layout](./UI_UX_LAYOUT.md)

**Purpose**: Interface design and interaction patterns  
**Contains**:
- Layout regions and wireframes
- Two-level context switcher design
- Feature canvas concept
- Design tokens (colors, typography, spacing)
- Responsive behavior
- Accessibility requirements
- Component hierarchy

**Read this when**:
- Implementing UI components
- Understanding navigation flow
- Designing new features
- Ensuring accessibility compliance

