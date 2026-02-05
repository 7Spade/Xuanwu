# Shared Kernel - Cross-Domain Common

> **Layer**: 7 of 8 (Cross-Domain Common Code)  
> **Framework Dependency**: ❌ FORBIDDEN (Pure TypeScript)  
> **Purpose**: Code shared across all bounded contexts

## 📋 Responsibilities

- **Constants**: Global enums and constants
- **Types**: Base TypeScript types and interfaces
- **Guards**: Common route guards (auth, role-based)

## 🚫 What NOT to Put Here

- Feature-specific code
- Business logic (→ domain)
- UI components (→ shared)

## 📁 Structure

```
shared-kernel/
├── constants/           # Global enums, constants
├── types/              # Base types, interfaces
└── guards/             # Common route guards
```

## 🔗 Dependencies

- ✅ Can import: None (standalone)
- ❌ Cannot import: Any other layer

## 💡 Key Principle

**Shared kernel should be minimal and stable.**  
Changes here affect all contexts, so evolve carefully.

## 📚 Related Documentation

- [Shared Kernel Concept](../../docs/PROJECT_ARCHITECTURE.md#shared-kernel)
- [Naming Conventions](../../docs/NAMING_CONVENTIONS.md)
