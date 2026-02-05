# Glossary

> **Document Type**: Reference (Information-oriented)  
> **Target Audience**: All developers  
> **Purpose**: Standardized terminology to prevent confusion  
> **Version**: 1.0  
> **Last Updated**: 2026-02-05

## When to Use This

- 📖 **Unfamiliar terms** - Look up technical vocabulary
- ✍️ **Writing documentation** - Use consistent terminology
- 🤖 **AI assistance** - Ensure Copilot understands project terms
- 📋 **Code review** - Verify consistent language

**Prerequisites**: None  
**Related Docs**: All documentation uses these terms consistently

---

## 🔤 Core Terminology

### Architecture Terms

**DDD (Domain-Driven Design)**
- Full term: Domain-Driven Design
- Usage: Always use "DDD" after first mention in a document
- Example: "This project uses Domain-Driven Design (DDD) with 8 layers"
- ❌ Don't use: "Domain Driven Design", "domain-driven-design"

**Zoneless**
- Definition: Angular architecture without NgZone dependency
- Usage: Always capitalize as "Zoneless"
- Example: "Zoneless architecture eliminates Zone.js overhead"
- ❌ Don't use: "Zone-less", "zoneless", "zone-less"
- Related: Pure reactive, signal-based state management

**SSR (Server-Side Rendering)**
- Full term: Server-Side Rendering
- Usage: Always use "SSR" after first mention
- Package: `@angular/ssr`
- Example: "Server-Side Rendering (SSR) improves SEO"
- ❌ Don't use: "server side rendering", "ssr"

**Angular Version**
- Current version: Angular 21.1.3
- Generation: Angular 20+ (refers to v19+, Zoneless-ready generation)
- Usage: "Angular 21+" for current version, "Angular 20+ generation" for feature set
- Example: "Angular 21+ with Zoneless support (part of Angular 20+ generation)"
- ❌ Don't use: "Angular 20" when referring to v21

---

## 🏗️ Layer Names

Use these exact names consistently:

1. **shared-kernel** (all lowercase with hyphen)
2. **app/domain** (lowercase)
3. **app/application** (lowercase)
4. **app/infrastructure** (lowercase)
5. **app/features** (lowercase)
6. **app/shared** (lowercase)
7. **app/core** (lowercase)
8. **functions/src** (lowercase)

**File paths**: Always use lowercase with forward slashes
- ✅ `app/domain/tasks/`
- ❌ `App/Domain/Tasks/`, `app\domain\tasks\`

---

## 📦 Package and Technology Names

**NgRx**
- Spelling: NgRx (capital N, lowercase g, capital R, lowercase x)
- Full: "@ngrx/signals" package
- ❌ Don't use: "ngrx", "NGRX", "NgRX"

**Firestore**
- Spelling: Firestore (capital F)
- Type: NoSQL document database
- ❌ Don't use: "Fire Store", "firestore", "Firebase Database"

**Firebase**
- Spelling: Firebase (capital F)
- Platform: Backend as a Service (BaaS)
- ❌ Don't use: "fire base", "firebase" (unless in code)

**Tailwind CSS**
- Spelling: Tailwind CSS
- Version: 4.1+
- ❌ Don't use: "TailwindCSS", "tailwind"

**Vitest**
- Spelling: Vitest (capital V)
- Type: Test runner
- ❌ Don't use: "vitest", "VTest"

---

## 🎯 Domain-Driven Design Terms

**Aggregate**
- Definition: Cluster of domain objects treated as a single unit
- File suffix: `.aggregate.ts`
- Example: `task.aggregate.ts`

**Entity**
- Definition: Object with unique identity
- File suffix: `.entity.ts`
- Example: `user.entity.ts`

**Value Object**
- Definition: Immutable object without identity
- File suffix: `.vo.ts`
- Example: `task-id.vo.ts`
- Abbreviation: "VO" is acceptable

**Repository**
- Definition: Collection-like interface for domain objects
- File suffix: `.repository.ts`
- Layer: Infrastructure
- Example: `task.repository.ts`

**Use Case**
- Definition: Application-layer orchestration of business logic
- File suffix: `.use-case.ts`
- Example: `create-task.use-case.ts`

**DTO (Data Transfer Object)**
- Full term: Data Transfer Object
- File suffix: `.dto.ts`
- Example: `create-task.dto.ts`
- Usage: Always use "DTO" after first mention

**Mapper**
- Definition: Transforms between layers (e.g., domain ↔ DTO)
- File suffix: `.mapper.ts`
- Example: `task.mapper.ts`

---

## 🔧 Angular Terms

**Component**
- File suffix: `.component.ts`
- Must be standalone (no `standalone: true` needed in Angular 21+)
- Example: `task-list.component.ts`

**Signal**
- Definition: Angular's reactive primitive
- Usage: Use for reactive state management
- Related: `computed()`, `effect()`
- ❌ Don't use: "signal" (lowercase) when referring to the API

**Store**
- Definition: NgRx Signal Store
- File suffix: `.store.ts`
- Example: `task.store.ts`
- ❌ Don't use: "Redux store", "NgRx store" (refers to old @ngrx/store)

**Standalone Component**
- Definition: Component without NgModule
- Default in Angular 21+
- ❌ Don't use: "standalone: true" in code (redundant in v21+)

**Control Flow**
- Syntax: `@if`, `@for`, `@switch`, `@defer`
- ✅ Use: Built-in control flow (Angular 21+)
- ❌ Don't use: `*ngIf`, `*ngFor`, `*ngSwitch` (deprecated structural directives)

---

## 📋 Case Conventions

**PascalCase**
- Usage: Classes, interfaces, types
- Example: `TaskAggregate`, `CreateTaskUseCase`

**camelCase**
- Usage: Variables, functions, methods
- Example: `userId`, `createTask()`

**kebab-case**
- Usage: File names, directories
- Example: `task-list.component.ts`, `create-task.use-case.ts`

**SCREAMING_SNAKE_CASE**
- Usage: Constants, environment variables
- Example: `API_BASE_URL`, `MAX_RETRY_COUNT`

---

## 🚫 Deprecated Terms

Do NOT use these terms in new documentation:

| ❌ Deprecated | ✅ Use Instead | Reason |
|--------------|----------------|---------|
| NgModule | Standalone Components | Angular 21+ default |
| Zone.js | Zoneless | Modern architecture |
| `*ngIf` | `@if` | New control flow syntax |
| `*ngFor` | `@for` | New control flow syntax |
| @ngrx/store | @ngrx/signals | Signal-based state |
| constructor injection | `inject()` function | Modern DI pattern |

---

## 🔗 Abbreviations

**Accepted abbreviations:**
- **DDD**: Domain-Driven Design
- **SSR**: Server-Side Rendering
- **DTO**: Data Transfer Object
- **VO**: Value Object
- **DI**: Dependency Injection
- **BaaS**: Backend as a Service
- **ER**: Entity Relationship
- **UI**: User Interface
- **UX**: User Experience
- **SEO**: Search Engine Optimization
- **ARIA**: Accessible Rich Internet Applications
- **WCAG**: Web Content Accessibility Guidelines

**Always spell out on first use** in each document, then use abbreviation.

---

## 📝 Writing Style

**Tone**: Professional, clear, technical but accessible

**Tense**: Present tense for documentation
- ✅ "The domain layer contains..."
- ❌ "The domain layer will contain..."

**Voice**: Active voice preferred
- ✅ "Use Signals for reactive state"
- ❌ "Signals should be used for reactive state"

**Numbers**: Use digits for numbers
- ✅ "8-layer architecture"
- ❌ "eight-layer architecture"

**Lists**: Use parallel structure
- ✅ All items start with verbs OR all items are nouns
- ❌ Mixed structure

---

## 🎯 Code Examples

**Format**: Use TypeScript syntax highlighting

\`\`\`typescript
// ✅ Correct example
export class TaskAggregate {
  // implementation
}
\`\`\`

**Annotations**:
- ✅ Correct example: Use green checkmark
- ❌ Incorrect example: Use red X

---

## 🔄 Version History

- **v1.0** (2026-02-05): Initial glossary creation
  - Standardized DDD, Zoneless, SSR terminology
  - Added layer naming conventions
  - Added package name standards
  - Added deprecated terms list

---

*This glossary ensures consistent terminology across all documentation, preventing confusion for developers and AI assistants.*