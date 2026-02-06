# Angular 20 + Control Flow + SSR + Less Zero Specification

> **Status**: Active | **Version**: 1.0 | **Last Updated**: 2026-02-06

This document defines **mandatory technical boundaries, design principles, and implementation standards** for Angular 20 projects combining modern control flow, SSR, and Less Zero architecture principles. This specification applies to large-scale projects, framework migrations (e.g., Next.js → Angular), and multi-agent collaboration scenarios.

---

## Table of Contents

1. [Core Goals](#1-core-goals)
2. [Angular 20 Technical Boundaries](#2-angular-20-technical-boundaries)
3. [Less Zero Architecture Principles](#3-less-zero-architecture-principles)
4. [SSR (Server-Side Rendering) Standards](#4-ssr-server-side-rendering-standards)
5. [Routing and Feature Boundaries](#5-routing-and-feature-boundaries)
6. [Framework Migration Constraints](#6-framework-migration-constraints)
7. [Allowed and Prohibited List](#7-allowed-and-prohibited-list)
8. [Pre-Implementation Gate Checklist](#8-pre-implementation-gate-checklist)

---

## 1. Core Goals

The following goals guide all technical decisions in this project:

1. **Behavioral Equivalence over Implementation Similarity**
   - Focus on user-observable behavior, not internal implementation details
   - Prioritize correct output over familiar code patterns

2. **Clear Responsibility Boundaries**
   - Avoid implicit coupling between layers
   - Make dependencies explicit and traceable

3. **SSR as First-Class Citizen**
   - SSR is not an afterthought or add-on
   - Server and client behavior must be designed together

4. **Control Flow Syntax for View Layer Only**
   - `@if`, `@for`, `@switch` belong in templates
   - Business logic stays in TypeScript

5. **Less Zero: Minimal Framework Magic, Minimal Implicit State**
   - State exists, but must be explicit, trackable, and replaceable
   - No hidden globals or automatic behaviors

---

## 2. Angular 20 Technical Boundaries

### 2.1 Angular Version and Capabilities

**Required:**
- Angular 20+ (standalone components by default)
- Signals enabled by default
- Modern template control flow enabled

**Prohibited:**
- NgModule usage (use standalone components)
- Legacy decorators where modern alternatives exist

### 2.2 Template Control Flow Standards

**Allowed:**
```html
@if (condition) {
  <div>Content</div>
}

@for (item of items; track item.id) {
  <div>{{ item.name }}</div>
}

@switch (value) {
  @case ('a') { <div>A</div> }
  @default { <div>Default</div> }
}
```

**Prohibited:**
- `*ngIf`, `*ngFor`, `*ngSwitch` (use `@if`, `@for`, `@switch` instead)
- Business logic in templates
- Side effects triggered in control flow

**Control Flow Responsibilities:**
- Conditional rendering
- List rendering
- UI state switching

**Not Responsibilities:**
- Data transformation
- Business validation
- API calls

---

## 3. Less Zero Architecture Principles

> **Core Principle**: State exists, but must be explicit, trackable, and replaceable

### 3.1 State Layer Classification

**View State** (Component Signals)
```typescript
// ✅ Correct: View-specific state
export class UserProfileComponent {
  isEditing = signal(false);
  
  toggleEdit() {
    this.isEditing.update(v => !v);
  }
}
```

**Feature State** (Service + Signals)
```typescript
// ✅ Correct: Feature-level state
@Injectable()
export class UserFeatureStore {
  private userState = signal<User | null>(null);
  user = this.userState.asReadonly();
}
```

**Cross-Feature State** (Only when necessary)
```typescript
// ⚠️  Use sparingly: Cross-feature state
@Injectable({ providedIn: 'root' })
export class AppThemeStore {
  theme = signal<'light' | 'dark'>('light');
}
```

**Prohibited:**
- Global implicit singleton state
- Implicit data flow initiated in constructors
- Hidden subscriptions that auto-start

### 3.2 Data Flow Direction

**Requirements:**
- Unidirectional data flow (Data → View)
- All state mutations must have explicit entry points
- No hidden state modifications

```typescript
// ✅ Correct: Explicit state mutation
updateUser(user: User) {
  this.userState.set(user);
}

// ❌ Wrong: Implicit constructor side effect
constructor() {
  this.loadData(); // Hidden side effect!
}
```

---

## 4. SSR (Server-Side Rendering) Standards

### 4.1 SSR Positioning

**SSR is for:**
- SEO optimization
- First-paint performance
- Behavioral consistency

**SSR is NOT for:**
- Hiding business logic
- Concealing side effects
- Working around poor architecture

### 4.2 SSR Data Fetching Principles

**Required:**
- Server-only data must be fetched in Resolvers or Server Layer
- Client-only behavior must not pollute SSR pipeline
- Use `TransferState` to explicitly mark data boundaries

**Example:**
```typescript
// ✅ Correct: SSR-safe browser API usage
import { afterNextRender } from '@angular/core';

constructor() {
  afterNextRender(() => {
    // Safe to use browser APIs here
    const height = document.body.scrollHeight;
  });
}
```

### 4.3 SSR Prohibitions

**Prohibited:**
- Using browser APIs during SSR phase without guards
- Inconsistent behavior between SSR and CSR (Client-Side Rendering)
- Accessing `window`, `document`, `localStorage` without platform checks

**Required Guards:**
- `afterNextRender()` - Execute code after next render (browser only)
- `afterRender()` - Execute code after render lifecycle
- `isPlatformBrowser()` - Check if running in browser
- `TransferState` - Share data between server and client

```typescript
// ❌ Wrong: Direct browser API usage
confirm(data: ConfirmDialogData): Observable<boolean> {
  return new Observable(observer => {
    const confirmed = window.confirm(data.message); // SSR will crash!
    observer.next(confirmed);
  });
}

// ✅ Correct: SSR-safe browser API usage
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

confirm(data: ConfirmDialogData): Observable<boolean> {
  const platformId = inject(PLATFORM_ID);
  
  return new Observable(observer => {
    if (isPlatformBrowser(platformId)) {
      const confirmed = window.confirm(data.message);
      observer.next(confirmed);
    } else {
      observer.next(false); // Default for SSR
    }
    observer.complete();
  });
}
```

---

## 5. Routing and Feature Boundaries

### 5.1 Routing Principles

**Requirements:**
- Route = Feature Boundary
- Each route owns its data fetching strategy
- No cross-route internal state access

**Example:**
```typescript
// ✅ Correct: Route-scoped providers
export const routes: Routes = [
  {
    path: 'users',
    loadComponent: () => import('./users/users.page'),
    providers: [UserFeatureStore] // Route-scoped
  }
];
```

### 5.2 Lazy Loading

**Requirements:**
- Features are lazy-loaded by default
- Only core shell is eagerly loaded

**Example:**
```typescript
// ✅ Correct: Lazy loading
{
  path: 'admin',
  loadChildren: () => import('./admin/admin.routes')
}
```

---

## 6. Framework Migration Constraints

### 6.1 Behavioral Priority Order

When migrating from frameworks like Next.js:

1. **User-Observable Behavior** (highest priority)
   - What the user sees and experiences

2. **SSR HTML Output**
   - Server-rendered HTML structure

3. **SEO / Metadata**
   - Meta tags, Open Graph, structured data

4. **Interaction Timing**
   - When events fire, state updates

### 6.2 What NOT to Do

**Prohibited Migration Approaches:**
- Do NOT 1:1 mimic Next.js APIs
- Do NOT introduce RSC-like implicit magic
- Do NOT break Angular architecture just to "look similar"

**Correct Approach:**
- Understand the **behavior** of Next.js features
- Implement the **same behavior** using Angular patterns
- Maintain Angular's explicit, predictable architecture

---

## 7. Allowed and Prohibited List

### 7.1 Allowed

✅ **Signals as Primary State Model**
```typescript
count = signal(0);
doubled = computed(() => this.count() * 2);
```

✅ **Explicit Data Fetching Layer**
```typescript
@Injectable()
export class DataService {
  loadUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
  }
}
```

✅ **Router Resolver for SSR Data Preparation**
```typescript
export const userResolver: ResolveFn<User> = (route) => {
  const service = inject(UserService);
  return service.getUser(route.params['id']);
};
```

### 7.2 Prohibited

❌ **Implicit Side Effects**
```typescript
// ❌ Wrong: Hidden side effect in constructor
constructor() {
  this.loadData(); // Implicit!
}
```

❌ **Logic in Templates**
```html
<!-- ❌ Wrong: Business logic in template -->
@if (users.filter(u => u.age > 18).length > 0) {
  <div>Has adult users</div>
}

<!-- ✅ Correct: Computed signal -->
@if (hasAdultUsers()) {
  <div>Has adult users</div>
}
```

❌ **Undocumented State Sharing**
```typescript
// ❌ Wrong: Global mutable state without documentation
export let globalUser: User; // Who manages this?
```

---

## 8. Pre-Implementation Gate Checklist

Before implementing ANY feature, confirm:

- [ ] **Is SSR behavior clear?**
  - How does this feature render on the server?
  - Are browser APIs properly guarded?

- [ ] **Is data lifecycle explicit?**
  - Where is data fetched?
  - Where is data stored?
  - How is data cleaned up?

- [ ] **Does it comply with Less Zero state principles?**
  - Is state explicit and trackable?
  - Are mutations through clear entry points?

- [ ] **Does it respect Feature boundaries?**
  - Does this feature access another feature's internals?
  - Are dependencies explicit?

**If any checklist item fails, do NOT implement.**

---

## 9. Conclusion

> **Purpose**: This specification is not to slow down development, but to prevent projects from becoming uncontrollable due to implicit behaviors as they grow.

### Deviation Policy

Any design that deviates from this document **must be**:
1. Explicitly documented
2. Reviewed and approved
3. Recorded with justification

### Enforcement

- All code reviews must reference this specification
- CI/CD may include automated compliance checks
- Regular audits against this specification are required

---

## Related Documentation

- [DDD Layer Boundaries](./DDD_LAYER_BOUNDARIES.md) - Domain-Driven Design layer rules
- [Import Rules](./IMPORT_RULES.md) - Module import constraints
- [Testing Standards](./TESTING_STANDARDS.md) - Testing requirements
- [Project Architecture](./PROJECT_ARCHITECTURE.md) - Overall architecture

---

**Original Chinese Version**: [需求文件.md](./需求文件.md)
