# Domain Layer - Pure Business Logic

> **Layer**: 2 of 8 (Core Domain - Framework-Free)  
> **Framework Dependency**: ❌ FORBIDDEN (100% Pure TypeScript)  
> **Purpose**: Business rules, entities, and domain logic

## 📋 Responsibilities

- **Aggregates**: Business consistency boundaries
- **Entities**: Objects with identity
- **Value Objects**: Immutable domain concepts
- **Domain Services**: Stateless business operations
- **Domain Events**: Business event definitions
- **Repository Interfaces**: Persistence contracts (interfaces only)
- **Specifications**: Complex business rules

## 🚫 What NOT to Put Here

- Angular imports (Router, HttpClient, etc.)
- UI components
- HTTP calls or API logic (→ infrastructure)
- Database code (→ infrastructure)

## 📁 Structure

```
domain/
├── {bounded-context}/     # e.g., user, order, product
│   ├── aggregates/        # Aggregate roots
│   ├── entities/          # Domain entities
│   ├── value-objects/     # Immutable value objects
│   ├── factories/         # Complex object creation
│   ├── events/            # Domain events
│   ├── exceptions/        # Domain-specific errors
│   ├── specifications/    # Business rule specifications
│   ├── repository-interfaces/  # Persistence contracts
│   ├── services/          # Domain services
│   ├── state/             # Domain local state (Signals)
│   └── testing/           # Test fixtures
└── shared/                # Cross-context abstractions
```

## 🔗 Dependencies

- ✅ Can import: shared-kernel (types, constants only)
- ❌ Cannot import: Angular, infrastructure, application, features

## 💡 Key Principle

**The domain layer must be 100% framework-agnostic.**  
It should be portable to Node.js, Deno, or any JavaScript runtime.

## 📚 Related Documentation

- [DDD Layer Boundaries](../../../docs/DDD_LAYER_BOUNDARIES.md)
- [Domain Layer Example](../../../docs/examples/domain-layer-example.ts)
- [Naming Conventions](../../../docs/NAMING_CONVENTIONS.md)
