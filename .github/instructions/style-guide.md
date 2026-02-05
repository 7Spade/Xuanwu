---
description: "Angular coding style conventions and best practices"
applies_to: ["**/*.ts", "**/*.html", "**/*.scss"]
priority: high
---

# Angular Style Guide

Follow these conventions for consistent, maintainable Angular code. When these rules conflict with existing file style, prioritize consistency within that file.

## File Naming

### Use Kebab-Case with Hyphens

```
✅ user-profile.component.ts
✅ task-list.service.ts
✅ auth.guard.ts
❌ UserProfile.component.ts
❌ taskList.service.ts
```

### Match File Names to TypeScript Identifiers

```typescript
// File: user-profile.component.ts
export class UserProfile { } // ✅ Correct

// File: user-settings.ts
export class UserSettingsManager { } // ❌ Misleading
export class UserSettings { } // ✅ Correct
```

### Component File Naming

Component files should share the same base name with different extensions:

```
user-profile.component.ts
user-profile.component.html
user-profile.component.scss
user-profile.component.spec.ts
```

### Test File Naming

End test files with `.spec.ts`:

```
✅ user-profile.component.spec.ts
✅ auth.service.spec.ts
❌ user-profile.test.ts
```

## Project Structure

### All UI Code in `src/`

Keep all Angular code (TypeScript, HTML, styles) inside `src/`. Configuration and scripts live outside.

```
✅ src/app/features/tasks/
✅ src/app/shared/components/
❌ app/features/tasks/
❌ components/shared/
```

### Bootstrap in `main.ts`

Application entry point must always be `src/main.ts`.

### Group Related Files Together

Keep component files together, tests alongside code:

```
src/app/features/tasks/
├── task-list.component.ts
├── task-list.component.html
├── task-list.component.scss
├── task-list.component.spec.ts
├── task-item.component.ts
└── task-item.component.spec.ts
```

### Organize by Feature Areas

Structure by features, not by file types:

```
✅ Feature-based structure:
src/app/
├── features/
│   ├── tasks/
│   │   ├── task-list/
│   │   └── task-form/
│   └── users/
│       ├── user-profile/
│       └── user-settings/

❌ Type-based structure:
src/app/
├── components/
├── services/
└── directives/
```

### One Concept Per File

Focus each file on a single component, directive, or service. Small related items can share a file.

## Dependency Injection

### Prefer `inject()` Function

Use `inject()` instead of constructor parameters:

```typescript
// ✅ Preferred
@Component({...})
export class TaskList {
  private taskService = inject(TaskService);
  private router = inject(Router);
}

// ❌ Avoid
@Component({...})
export class TaskList {
  constructor(
    private taskService: TaskService,
    private router: Router
  ) {}
}
```

**Benefits**:
- More readable with many dependencies
- Better type inference
- Easier to add comments
- Simpler field initialization with ES2022+

## Components

### Component Selectors

Use kebab-case with app-specific prefix:

```typescript
✅ selector: 'app-user-profile'
✅ selector: 'admin-dashboard'
❌ selector: 'userProfile'
❌ selector: 'UserProfile'
```

### Group Angular Properties First

Place Angular-specific properties before methods:

```typescript
@Component({...})
export class UserProfile {
  // Inputs/Outputs first
  readonly userId = input.required<string>();
  readonly userSaved = output<void>();
  
  // Queries
  readonly menuItems = viewChildren(MenuItem);
  
  // Injected dependencies
  private userService = inject(UserService);
  
  // Other properties
  displayName = signal('');
  
  // Then methods
  ngOnInit() { }
  saveUser() { }
}
```

### Keep Components Focused on Presentation

Move complex logic into services or utility functions:

```typescript
// ✅ Good
@Component({...})
export class TaskForm {
  private validationService = inject(ValidationService);
  
  validate() {
    return this.validationService.validateTask(this.formData);
  }
}

// ❌ Avoid
@Component({...})
export class TaskForm {
  validate() {
    // 50 lines of validation logic in component
  }
}
```

### Avoid Complex Template Logic

Refactor complex expressions to computed signals or methods:

```typescript
// ✅ Good
@Component({
  template: `<p>{{ fullName() }}</p>`
})
export class UserProfile {
  firstName = input<string>();
  lastName = input<string>();
  fullName = computed(() => `${this.firstName()} ${this.lastName()}`);
}

// ❌ Avoid
@Component({
  template: `<p>{{ firstName() + ' ' + lastName() }}</p>`
})
```

### Use `protected` for Template-Only Members

Mark template-bound members as `protected`, not `public`:

```typescript
@Component({
  template: `<p>{{ fullName() }}</p>`
})
export class UserProfile {
  firstName = input();
  lastName = input();
  
  // ✅ Not part of public API, only for template
  protected fullName = computed(() => 
    `${this.firstName()} ${this.lastName()}`
  );
}
```

### Use `readonly` for Angular-Initialized Properties

```typescript
@Component({...})
export class UserProfile {
  readonly userId = input.required<string>();
  readonly userSaved = output<void>();
  readonly userName = model<string>();
  readonly menuItems = viewChildren(MenuItem);
}
```

### Prefer Class/Style Bindings

Use `[class]` and `[style]` over `ngClass` and `ngStyle`:

```html
✅ Preferred:
<div [class.active]="isActive" 
     [style.color]="textColor">

❌ Avoid:
<div [ngClass]="{active: isActive}" 
     [ngStyle]="{'color': textColor}">
```

### Name Event Handlers Descriptively

Name for what they do, not the event:

```html
✅ <button (click)="saveUserData()">Save</button>
❌ <button (click)="handleClick()">Save</button>

✅ <textarea (keydown.control.enter)="commitNotes()"></textarea>
✅ <textarea (keydown.control.space)="showSuggestions()"></textarea>
```

### Keep Lifecycle Methods Simple

Delegate to well-named methods:

```typescript
// ✅ Good
ngOnInit() {
  this.loadUserData();
  this.startAutoSave();
}

// ❌ Avoid
ngOnInit() {
  this.userService.getUser(this.userId).subscribe(user => {
    this.user.set(user);
    this.displayName.set(user.name);
    // ... more inline logic
  });
}
```

### Implement Lifecycle Interfaces

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({...})
export class UserProfile implements OnInit, OnDestroy {
  ngOnInit() { }
  ngOnDestroy() { }
}
```

## Directives

### Directive Selectors

Use camelCase attribute selectors with prefix:

```typescript
✅ @Directive({ selector: '[appTooltip]' })
✅ @Directive({ selector: '[mrHighlight]' })
❌ @Directive({ selector: '[app-tooltip]' })
❌ @Directive({ selector: '[Tooltip]' })
```

## File Size

Keep files focused and manageable. Consider splitting if:
- File exceeds 400 lines
- Directory has too many files to navigate easily
- Code lacks cohesion

## TypeScript

Refer to [Google's TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html) for general TypeScript practices.

## Key Principles

1. **Consistency**: Maintain consistency within files and the project
2. **Readability**: Code should be self-documenting
3. **Separation of Concerns**: Keep business logic separate from presentation
4. **Testability**: Write code that's easy to test
5. **Performance**: Use OnPush change detection, lazy loading

## Quick Reference

| What | Convention | Example |
|------|-----------|---------|
| File names | kebab-case | `user-profile.component.ts` |
| Class names | PascalCase | `UserProfile` |
| Component selectors | kebab-case with prefix | `app-user-profile` |
| Directive selectors | camelCase with prefix | `[appTooltip]` |
| Service injection | `inject()` function | `inject(UserService)` |
| Template members | `protected` | `protected fullName()` |
| Event handlers | Descriptive verbs | `saveUserData()` |
