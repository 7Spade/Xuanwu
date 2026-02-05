# Features Layer - Presentation (UI)

> **Layer**: 5 of 8 (Presentation Smart Components)  
> **Framework Dependency**: ✅ Full Angular features  
> **Purpose**: Feature-specific UI and routing

## 📋 Responsibilities

- **Pages**: Route-level components
- **Containers**: Smart components (connect to application layer)
- **Components**: Feature-specific presentational components
- **ViewModels**: UI-specific state (Signals)
- **Routes**: Feature route definitions

## �� What NOT to Put Here

- Reusable UI components (→ shared/ui)
- Business logic (→ domain/application)
- API calls (→ infrastructure)

## 📁 Structure

```
features/
├── {feature-name}/
│   ├── pages/             # Route-level pages (@defer loading)
│   ├── containers/        # Logic containers
│   ├── components/        # Feature-specific components
│   ├── models/            # UI ViewModels
│   └── {name}.routes.ts   # Standalone routes
└── layout/                # Global layout (header, sidebar)
```

## 🔗 Dependencies

- ✅ Can import: application (use cases), shared (UI), domain (read-only models)
- ❌ Cannot import: infrastructure (directly)

## 💡 Key Principle

**Smart components coordinate; dumb components present.**  
Containers know about state and use cases. Components just render.

## 📚 Related Documentation

- [Feature Layer Example](../../../docs/examples/feature-layer-example.ts)
- [Component Patterns](../../../docs/DDD_LAYER_BOUNDARIES.md#features-layer)
- [UI/UX Layout](../../../docs/UI_UX_LAYOUT.md)
