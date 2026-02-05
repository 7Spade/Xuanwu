# Shared Layer - Reusable UI

> **Layer**: 6 of 8 (UI Shared Dumb Components)  
> **Framework Dependency**: ✅ Full Angular features  
> **Purpose**: Reusable, presentational UI components

## 📋 Responsibilities

- **UI Components**: Atomic, reusable components (buttons, cards, modals)
- **Directives**: Functional directives (highlight, permission check)
- **Pipes**: Pure transformation pipes
- **Utilities**: Frontend utility functions

## 🚫 What NOT to Put Here

- Feature-specific components (→ features layer)
- Business logic (→ domain/application)
- State management (components should be stateless)

## 📁 Structure

```
shared/
├── ui/                   # Atomic components
│   ├── button/
│   ├── card/
│   ├── modal/
│   └── input/
├── directives/           # Reusable directives
├── pipes/               # Pure pipes
└── utils/               # Frontend utilities
```

## 🔗 Dependencies

- ✅ Can import: shared-kernel, Angular
- ❌ Cannot import: domain, application, infrastructure, features

## 💡 Key Principle

**Shared components should be "dumb" and reusable.**  
They receive all data via @Input and emit events via @Output.

## 📚 Related Documentation

- [Component Patterns](../../../docs/DDD_LAYER_BOUNDARIES.md#shared-layer)
- [UI/UX Layout](../../../docs/UI_UX_LAYOUT.md)
- [Style Guide](../../.github/instructions/style-guide.md)
