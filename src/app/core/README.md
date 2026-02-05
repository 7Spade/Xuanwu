# Core Layer - Global Infrastructure

> **Layer**: 1 of 8 (Global Infrastructure Core)  
> **Framework Dependency**: ✅ Allowed (Angular-specific)  
> **Purpose**: Cross-cutting technical concerns and global infrastructure

## 📋 Responsibilities

- Authentication & Authorization (Signal-based auth store)
- HTTP Interceptors (functional interceptors)
- Global dependency injection providers
- Error handling & logging
- Cross-domain technical services

## 🚫 What NOT to Put Here

- Business logic (→ domain layer)
- Feature-specific code (→ features layer)
- UI components (→ shared layer)

## 📁 Structure

```
core/
├── auth/               # Auth store, guards, tokens
├── interceptors/       # HTTP interceptors (functional)
├── providers/          # App-wide DI configuration
├── error-handler/      # Global error handling
└── services/          # Technical services (Storage, Logger)
```

## 🔗 Dependencies

- ✅ Can import: Angular core, RxJS, shared-kernel
- ❌ Cannot import: domain, application, features, shared

## 📚 Related Documentation

- [DDD Layer Boundaries](../../../docs/DDD_LAYER_BOUNDARIES.md)
- [Import Rules](../../../docs/IMPORT_RULES.md)
