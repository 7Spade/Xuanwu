# Infrastructure Layer - Technical Implementation

> **Layer**: 4 of 8 (Infrastructure Implementation)  
> **Framework Dependency**: ✅ Allowed (Angular, external libs)  
> **Purpose**: Implement technical concerns (persistence, APIs, adapters)

## 📋 Responsibilities

- **Repositories**: Concrete repository implementations
- **API Clients**: HTTP service implementations
- **Database Models**: ORM/ODM models
- **External Adapters**: Third-party service integrations
- **Messaging**: Event bus, real-time communication

## 🚫 What NOT to Put Here

- Business logic (→ domain layer)
- Use case orchestration (→ application layer)
- UI components (→ features layer)

## 📁 Structure

```
infrastructure/
├── persistence/           # DB/API implementations
│   ├── repositories/      # Concrete repositories
│   └── models/           # Database/API models
├── messaging/            # Event bus, SignalR
└── adapters/             # External service adapters
```

## 🔗 Dependencies

- ✅ Can import: domain (interfaces), application (ports), Angular, HttpClient
- ❌ Cannot import: features, shared (UI)

## 💡 Key Principle

**Implement interfaces defined in domain/application layers.**  
Infrastructure provides the "how", not the "what".

## 📚 Related Documentation

- [Infrastructure Layer](../../../docs/DDD_LAYER_BOUNDARIES.md#infrastructure-layer)
- [Repository Pattern](../../../docs/DATABASE_SCHEMA.md)
- [Import Rules](../../../docs/IMPORT_RULES.md)
