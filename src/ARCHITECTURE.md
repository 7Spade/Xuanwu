# Xuanwu - Source Code Architecture

> **Last Updated**: 2026-02-05  
> **Status**: Foundation Complete ✅  
> **Next Phase**: Domain Model Implementation

## 🏗️ Directory Structure

This repository follows a strict **8-layer Domain-Driven Design (DDD)** architecture optimized for Angular 21+ with SSR and Zoneless (pure reactive) architecture.

```
src/
├── app/
│   ├── core/                    # Layer 1: Global Infrastructure Core
│   ├── domain/                  # Layer 2: Pure Domain (Framework-Free)
│   ├── application/             # Layer 3: Application Orchestration
│   ├── infrastructure/          # Layer 4: Infrastructure Implementation
│   ├── features/                # Layer 5: Presentation (Smart Components)
│   ├── shared/                  # Layer 6: Shared UI (Dumb Components)
│   ├── app.ts                   # Root component
│   ├── app.config.ts            # App configuration
│   ├── app.routes.ts            # Root routes
│   └── app.*.ts                 # App entry files
├── shared-kernel/               # Layer 7: Cross-Domain Common Code
├── environments/                # Environment configurations
├── styles/                      # Layer 8: Global styles
├── assets/                      # Static resources
├── main.ts                      # Browser entry point
├── main.server.ts               # Server entry point
└── server.ts                    # Express server (SSR)
```

## 📚 Layer Documentation

Each layer contains a `README.md` explaining:
- Purpose and responsibilities
- What to put in this layer
- What NOT to put in this layer
- Dependencies (what it can/cannot import)
- Related documentation

### Quick Links

- [Layer 1: Core](./app/core/README.md) - Global infrastructure
- [Layer 2: Domain](./app/domain/README.md) - Pure business logic
- [Layer 3: Application](./app/application/README.md) - Use case orchestration
- [Layer 4: Infrastructure](./app/infrastructure/README.md) - Technical implementation
- [Layer 5: Features](./app/features/README.md) - UI presentation
- [Layer 6: Shared](./app/shared/README.md) - Reusable UI components
- [Layer 7: Shared Kernel](./shared-kernel/README.md) - Cross-domain common code
- [Layer 8: Styles](./styles/README.md) - Global style system

## 🔗 Dependency Rules

### Allowed Dependencies (Top → Down)

```
Features ────────────────┐
    │                    │
    ├── Application      │
    │       │            │
    │       ├── Domain   │
    │       │            │
    ├── Infrastructure   │
    │       │            │
    └── Shared ──────────┤
            │            │
            └── Shared Kernel
```

### Key Rules

1. **Domain Layer**: MUST be framework-free (no Angular imports)
2. **Shared Kernel**: MUST have no dependencies (standalone)
3. **Infrastructure**: MUST NOT depend on Features/Shared
4. **Barrel Exports**: All layers expose public API via `index.ts`
5. **Unidirectional**: Higher layers depend on lower layers, never reverse

## 🚀 Current Implementation Status

### ✅ Complete

- [x] 8-layer directory structure created
- [x] README.md in each layer with documentation
- [x] Barrel exports (index.ts) in each layer
- [x] Shared kernel with base types and constants
- [x] Build system verified (successful build)
- [x] SSR configuration intact

### 🚧 In Progress

- [ ] First bounded context in domain layer
- [ ] Example use case in application layer
- [ ] Repository pattern implementation
- [ ] Feature module with routing

### 📋 Planned

- [ ] NgRx Signal Store integration
- [ ] Firebase adapter in infrastructure
- [ ] Authentication in core layer
- [ ] UI component library in shared
- [ ] Comprehensive test coverage

## 🛠️ Development Workflow

### Creating a New Feature

1. **Define Domain Model** (`app/domain/{context}/`)
   - Create entities, value objects, aggregates
   - Define repository interfaces
   - No Angular dependencies!

2. **Create Use Cases** (`app/application/{module}/`)
   - Define DTOs for input/output
   - Create use case orchestration
   - Map between domain and DTOs

3. **Implement Infrastructure** (`app/infrastructure/`)
   - Create concrete repository implementation
   - Implement external adapters
   - Connect to APIs/databases

4. **Build UI** (`app/features/{feature}/`)
   - Create route-level pages
   - Build container (smart) components
   - Connect to use cases

5. **Extract Reusable Components** (`app/shared/ui/`)
   - Identify reusable patterns
   - Create dumb components
   - Add to shared UI library

### Using Custom Schematics

```bash
# Generate domain aggregate
ng generate ddd-aggregate user

# Generate use case
ng generate ddd-use-case create-user

# Generate entity
ng generate ddd-entity order
```

See `.schematics/README.md` for all available schematics.

## 📖 Related Documentation

### Core Documentation (docs/)

- [PROJECT_ARCHITECTURE.md](../docs/PROJECT_ARCHITECTURE.md) - Complete architecture explanation
- [DDD_LAYER_BOUNDARIES.md](../docs/DDD_LAYER_BOUNDARIES.md) - Detailed layer rules
- [IMPORT_RULES.md](../docs/IMPORT_RULES.md) - Dependency management rules
- [NAMING_CONVENTIONS.md](../docs/NAMING_CONVENTIONS.md) - File and code naming standards
- [TESTING_STANDARDS.md](../docs/TESTING_STANDARDS.md) - Testing per layer
- [QUICK_REFERENCE.md](../docs/QUICK_REFERENCE.md) - One-page cheat sheet

### Code Examples (docs/examples/)

- [domain-layer-example.ts](../docs/examples/domain-layer-example.ts) - Domain model example
- [application-layer-example.ts](../docs/examples/application-layer-example.ts) - Use case example
- [feature-layer-example.ts](../docs/examples/feature-layer-example.ts) - UI component example

### Custom Instructions (.github/instructions/)

- [accessibility.md](../.github/instructions/accessibility.md) - WCAG AA compliance
- [style-guide.md](../.github/instructions/style-guide.md) - Angular coding conventions
- [angular-cli.md](../.github/instructions/angular-cli.md) - CLI and build optimization

## ⚡ Quick Commands

```bash
# Development server
npm run start

# Build for production
npm run build

# Serve SSR build
npm run serve:ssr:Xuanwu

# Run tests
npm run test

# Lint code
npm run lint
```

## 🎯 Architecture Principles

1. **Domain-Driven Design (DDD)**: Organize code by business domain
2. **Clean Architecture**: Dependencies point inward (toward domain)
3. **CQRS Lite**: Separate commands (write) from queries (read)
4. **Repository Pattern**: Abstract data access behind interfaces
5. **Dependency Injection**: Use Angular DI for loose coupling
6. **Signal-Based State**: Reactive state with Angular Signals
7. **Zoneless**: No NgZone, pure reactive architecture
8. **SSR-First**: Server-side rendering for performance and SEO

## 🔍 Finding Your Way

**New to the project?**
1. Start with [PROJECT_ARCHITECTURE.md](../docs/PROJECT_ARCHITECTURE.md)
2. Read layer READMEs (start with domain layer)
3. Check code examples in `docs/examples/`
4. Review naming conventions

**Adding a feature?**
1. Check [QUICK_REFERENCE.md](../docs/QUICK_REFERENCE.md)
2. Review the layer it belongs to
3. Use custom schematics for scaffolding
4. Follow import rules strictly

**Fixing a bug?**
1. Identify which layer has the issue
2. Check layer's dependency rules
3. Ensure no boundary violations
4. Add tests to prevent regression

## 💡 Key Takeaways

- **Domain is king**: Business logic lives in the domain layer
- **Framework-free domain**: Domain layer has no Angular dependencies
- **Boundaries matter**: Respect layer dependencies strictly
- **Barrel exports**: Use `index.ts` for public APIs
- **Documentation first**: Every layer has clear purpose and rules

---

**Questions?** See [docs/INDEX.md](../docs/INDEX.md) for complete documentation index.
