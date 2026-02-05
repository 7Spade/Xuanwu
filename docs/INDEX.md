# Xuanwu Documentation Index

> **Project**: Xuanwu (玄武 - Black Tortoise)  
> **Stack**: Angular 21+ / SSR / Zoneless / DDD / NgRx Signals / Firebase  
> **Purpose**: Central navigation hub for all project documentation  
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

## 🎯 Quick Start

New to the project? Start here:

1. 📖 [Project Architecture](./PROJECT_ARCHITECTURE.md) - Understand the SSR + Zoneless + DDD structure
2. 🔒 [DDD Layer Boundaries](./DDD_LAYER_BOUNDARIES.md) - Learn layer responsibilities
3. 📋 [Quick Reference](./QUICK_REFERENCE.md) - One-page cheat sheet for daily development

---

## 📚 Core Documentation

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

### 2️⃣ [DDD Layer Boundaries](./DDD_LAYER_BOUNDARIES.md)

**Purpose**: Layer responsibility rules and boundary enforcement  
**Contains**:
- Layer positioning and ownership
- Allowed vs forbidden imports per layer
- Cross-layer communication rules
- Boundary violation checklist
- Common violations and solutions

**Read this when**:
- Writing code in any layer
- Reviewing pull requests
- Debugging circular dependencies
- Enforcing architectural boundaries

---

### 3️⃣ [Import Rules](./IMPORT_RULES.md)

**Purpose**: Dependency direction and import constraints  
**Contains**:
- Global boundary principles
- Dependency direction diagrams
- Layer-specific import rules
- Correct vs forbidden import examples
- Communication patterns

**Read this when**:
- Importing from other layers
- Setting up new modules
- Resolving import errors
- Refactoring dependencies

---

### 4️⃣ [Naming Conventions](./NAMING_CONVENTIONS.md)

**Purpose**: File and code naming standards  
**Contains**:
- Naming case guidelines (PascalCase, camelCase, kebab-case, SCREAMING_SNAKE_CASE)
- File type suffixes (.vo, .aggregate, .component, etc.)
- Code entity naming rules
- Angular 21+ specific patterns
- Layer-specific naming examples

**Read this when**:
- Creating new files
- Naming classes, functions, or variables
- Following Angular 21+ conventions
- Ensuring consistency across the codebase

---

### 5️⃣ [Testing Standards](./TESTING_STANDARDS.md)

**Purpose**: Testing rules per layer  
**Contains**:
- Testing philosophy and principles
- Layer-specific testing requirements
- Test examples for each layer
- Forbidden testing practices
- Test file naming conventions
- Coverage goals

**Read this when**:
- Writing tests
- Setting up test infrastructure
- Mocking dependencies
- Achieving test coverage goals

---

### 6️⃣ [Quick Reference](./QUICK_REFERENCE.md)

**Purpose**: One-page cheat sheet for developers  
**Contains**:
- Layer quick decisions table
- Import rules checklist
- File and code naming quick guide
- Testing quick checklist
- Boundary violation quick check
- Common code patterns

**Read this when**:
- Need a quick reminder
- Making fast decisions
- Reviewing code
- Onboarding new developers

---

## 📝 Code Examples

Practical TypeScript examples demonstrating proper layer implementation:

- [domain-layer-example.ts](./examples/domain-layer-example.ts) - Pure domain logic
- [application-layer-example.ts](./examples/application-layer-example.ts) - Use case orchestration
- [feature-layer-example.ts](./examples/feature-layer-example.ts) - UI components

---

## 🔍 Find Documentation By Topic

### Architecture & Design

- [8-Layer DDD Structure](./PROJECT_ARCHITECTURE.md#-frontend-architecture-browser-runtime)
- [Dependency Flow](./PROJECT_ARCHITECTURE.md#-dependency-flow)
- [Technology Constraints](./PROJECT_ARCHITECTURE.md#-technology-constraints-by-layer)
- [Why Zone-less?](./PROJECT_ARCHITECTURE.md#why-zone-less)

### Coding Standards

- [File Naming](./NAMING_CONVENTIONS.md#-directory-and-file-naming-rules)
- [Class Naming](./NAMING_CONVENTIONS.md#-code-entity-naming-rules)
- [Import Patterns](./IMPORT_RULES.md#-correct-import-examples)
- [Angular 21+ Rules](./NAMING_CONVENTIONS.md#-angular-21-specific-rules)

### Layer-Specific Guides

- [Domain Layer Rules](./DDD_LAYER_BOUNDARIES.md#-appdomain-responsibility-boundaries)
- [Application Layer Rules](./DDD_LAYER_BOUNDARIES.md#-cross-layer-communication-rules)
- [Infrastructure Layer Rules](./IMPORT_RULES.md#-appinfrastructure-boundary-rules)
- [Features Layer Rules](./IMPORT_RULES.md#-appfeatures-boundary-rules)

### Testing

- [Domain Testing](./TESTING_STANDARDS.md#appdomain-testing)
- [Application Testing](./TESTING_STANDARDS.md#appapplication-testing)
- [Component Testing](./TESTING_STANDARDS.md#appfeatures-testing)
- [Test Coverage Goals](./TESTING_STANDARDS.md#-test-coverage-goals)

---

## 🚀 Workflows

### Starting a New Feature

1. Read [Quick Reference](./QUICK_REFERENCE.md#-layer-quick-decisions)
2. Decide layer placement using [Semantic Decision Tree](./NAMING_CONVENTIONS.md#-semantic-decision-tree)
3. Follow [Naming Conventions](./NAMING_CONVENTIONS.md) for files and code
4. Respect [Import Rules](./IMPORT_RULES.md) for dependencies
5. Write tests following [Testing Standards](./TESTING_STANDARDS.md)

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

