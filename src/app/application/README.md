# Application Layer - Orchestration

> **Layer**: 3 of 8 (Application Orchestration)  
> **Framework Dependency**: ⚠️ Limited (Use for DI only)  
> **Purpose**: Coordinate domain logic and infrastructure

## 📋 Responsibilities

- **Use Cases**: Business process orchestration
- **Commands**: State-changing operations
- **Queries**: Read-only data flow
- **DTOs**: Data transfer objects (API contracts)
- **Mappers**: Domain ↔ DTO conversion
- **Ports**: Output interfaces (ILogger, INotification)

## 🚫 What NOT to Put Here

- Business rules (→ domain layer)
- UI logic (→ features layer)
- Concrete implementations (→ infrastructure)
- HTTP calls directly (use ports/interfaces)

## 📁 Structure

```
application/
├── {module-name}/
│   ├── commands/          # Write operations
│   ├── queries/           # Read operations
│   ├── dtos/              # Request/Response models
│   ├── mappers/           # Domain ↔ DTO conversion
│   └── use-cases/         # Business process orchestration
└── ports/                 # Output interfaces
```

## 🔗 Dependencies

- ✅ Can import: domain, shared-kernel, Angular DI
- ❌ Cannot import: infrastructure (concrete), features, shared

## 💡 Key Principle

**Depend on abstractions (interfaces), not concretions.**  
Use dependency injection to receive infrastructure implementations.

## 📚 Related Documentation

- [Application Layer Example](../../../docs/examples/application-layer-example.ts)
- [Use Case Pattern](../../../docs/DDD_LAYER_BOUNDARIES.md#application-layer)
- [Import Rules](../../../docs/IMPORT_RULES.md)
