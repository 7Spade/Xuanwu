# Angular Material, Animations, CDK & i18n Infrastructure

> **Layer**: Core Infrastructure & Shared Services  
> **Purpose**: Provide Material Design components, animations, responsive utilities, and internationalization  
> **Dependencies**: @angular/material, @angular/cdk, @angular/animations, @angular/localize

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Angular Animations](#angular-animations)
3. [Material Design](#material-design)
4. [CDK Services](#cdk-services)
5. [i18n & Localization](#i18n--localization)
6. [Material UI Services](#material-ui-services)
7. [Usage Examples](#usage-examples)

---

## Overview

This infrastructure provides a complete set of UI/UX utilities following Material Design 3 principles, with full i18n support and responsive design capabilities.

### Configured Services

- ✅ **Angular Animations** - Smooth UI transitions
- ✅ **Material Design 3** - Modern Material You theming
- ✅ **CDK Utilities** - Responsive breakpoints & platform detection
- ✅ **i18n Support** - English & Traditional Chinese translations
- ✅ **Material UI Services** - Notifications & dialogs

---

## Angular Animations

### Configuration

Animations are configured in `src/app/core/providers/app.config.ts`:

```typescript
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = mergeApplicationConfig(
  {
    providers: [
      provideAnimations()
    ]
  }
);
```

### Usage

All Angular Material components automatically use animations. For custom animations:

```typescript
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0 })),
      transition(':enter', [
        animate('300ms ease-in', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class MyComponent {
  // Component logic
}
```

---

## Material Design

### Theme Configuration

Material 3 theme is configured in `src/styles/material-theme.scss`:

```scss
@use '@angular/material' as mat;

$light-theme: mat.define-theme((
  color: (
    theme-type: light,
    primary: mat.$azure-palette,
    tertiary: mat.$yellow-palette,
  ),
));

html {
  @include mat.all-component-themes($light-theme);
}
```

### Dark Theme Support

Add the `dark-theme` class to enable dark mode:

```typescript
@Component({
  selector: 'app-root',
  template: `
    <div [class.dark-theme]="isDarkMode()">
      <!-- Your app content -->
    </div>
  `
})
export class AppComponent {
  isDarkMode = signal(false);
  
  toggleTheme() {
    this.isDarkMode.update(v => !v);
  }
}
```

### Using Material Components

Import Material components as needed:

```typescript
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-example',
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Example Card</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>Content here</p>
      </mat-card-content>
      <mat-card-actions>
        <button mat-raised-button color="primary">
          <mat-icon>check</mat-icon>
          Save
        </button>
      </mat-card-actions>
    </mat-card>
  `
})
export class ExampleComponent {}
```

---

## CDK Services

### ResponsiveService

Provides reactive signals for responsive breakpoints using Angular CDK.

**Location**: `src/app/shared/services/responsive.service.ts`

**Features**:
- Reactive breakpoint detection with signals
- Mobile, tablet, desktop detection
- Portrait/landscape orientation detection
- Custom media query support

**Usage**:

```typescript
import { ResponsiveService } from '../../shared';

@Component({
  template: `
    @if (responsive.isMobile()) {
      <mobile-view />
    } @else {
      <desktop-view />
    }
    
    <p>Current breakpoint: {{ responsive.currentBreakpoint() }}</p>
  `
})
export class MyComponent {
  responsive = inject(ResponsiveService);
}
```

**Available Signals**:
- `isMobile()` - Returns true on handsets
- `isTablet()` - Returns true on tablets
- `isDesktop()` - Returns true on web/desktop
- `isPortrait()` - Returns true in portrait mode
- `isLandscape()` - Returns true in landscape mode
- `currentBreakpoint()` - Returns 'XSmall' | 'Small' | 'Medium' | 'Large' | 'XLarge'

### PlatformService

Provides platform and browser detection capabilities.

**Location**: `src/app/shared/services/platform.service.ts`

**Usage**:

```typescript
import { PlatformService } from '../../shared';

@Component({
  template: `
    @if (platform.isBrowser) {
      <!-- Browser-only code -->
      <div>Running in browser</div>
    }
    
    @if (platform.isIOS) {
      <!-- iOS-specific features -->
    }
  `
})
export class MyComponent {
  platform = inject(PlatformService);
  
  ngOnInit() {
    if (this.platform.isTouchDevice) {
      // Enable touch-specific features
    }
  }
}
```

**Available Properties**:
- `isBrowser` - True if running in browser
- `isServer` - True if running on server (SSR)
- `isAndroid` - True on Android devices
- `isIOS` - True on iOS devices
- `isSafari`, `isFirefox`, `isEdge`, `isBlink` - Browser detection
- `isTouchDevice` - True if touch is supported

---

## i18n & Localization

### Translation Files

Translation files are stored in `src/assets/i18n/`:
- `en.json` - English translations
- `zh-TW.json` - Traditional Chinese translations

**Structure**:

```json
{
  "app": {
    "title": "Xuanwu",
    "description": "Domain-Driven Design Angular Application"
  },
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete"
  },
  "validation": {
    "required": "This field is required",
    "minLength": "Minimum length is {min}"
  }
}
```

### TranslationService

Provides i18n functionality with signal-based reactivity.

**Location**: `src/app/shared/services/translation.service.ts`

**Usage**:

```typescript
import { TranslationService } from '../../shared';

@Component({
  template: `
    <h1>{{ translate.get('app.title') }}</h1>
    <button (click)="changeLang()">
      Language: {{ translate.currentLanguage() }}
    </button>
    <p>{{ translate.get('validation.minLength', { min: 5 }) }}</p>
  `
})
export class MyComponent {
  translate = inject(TranslationService);
  
  changeLang() {
    const newLang = this.translate.currentLanguage() === 'en' ? 'zh-TW' : 'en';
    this.translate.use(newLang).subscribe();
  }
}
```

**API**:
- `get(key, params?)` - Get translation with optional parameters
- `get$(key, params?)` - Get translation as Observable
- `use(lang)` - Switch language
- `has(key)` - Check if translation exists
- `currentLanguage()` - Get current language signal
- `availableLanguages` - Array of available languages

---

## Material UI Services

### NotificationService

Wrapper for Angular Material Snackbar providing toast notifications.

**Location**: `src/app/shared/services/notification.service.ts`

**Usage**:

```typescript
import { NotificationService } from '../../shared';

@Component({})
export class MyComponent {
  notification = inject(NotificationService);
  
  saveData() {
    this.dataService.save(this.data).subscribe({
      next: () => {
        this.notification.success('Data saved successfully!');
      },
      error: (error) => {
        this.notification.error('Failed to save data');
      }
    });
  }
  
  showWithAction() {
    this.notification
      .show('Item deleted', 'Undo')
      .onAction()
      .subscribe(() => {
        // Handle undo action
      });
  }
}
```

**Methods**:
- `success(message, action?)` - Green notification, 3s duration
- `error(message, action?)` - Red notification, 5s duration
- `warning(message, action?)` - Orange notification, 4s duration
- `info(message, action?)` - Blue notification, 3s duration
- `show(message, action?, config?)` - Custom notification
- `dismiss()` - Dismiss all notifications

### DialogService

Wrapper for Angular Material Dialog.

**Location**: `src/app/shared/services/dialog.service.ts`

**Usage**:

```typescript
import { DialogService } from '../../shared';

@Component({})
export class MyComponent {
  dialog = inject(DialogService);
  
  openDialog() {
    const dialogRef = this.dialog.open(MyDialogComponent, {
      width: '400px',
      data: { id: 123 }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Dialog result:', result);
      }
    });
  }
  
  confirmDelete() {
    this.dialog.confirm({
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item?',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.deleteItem();
      }
    });
  }
}
```

**Methods**:
- `open(component, config?)` - Open a custom dialog
- `confirm(data)` - Open confirmation dialog
- `closeAll()` - Close all open dialogs
- `hasOpenDialogs` - Check if any dialogs are open

---

## Usage Examples

### Example 1: Responsive Layout with Material

```typescript
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ResponsiveService } from '../../shared';

@Component({
  selector: 'app-responsive-layout',
  imports: [CommonModule, MatCardModule, MatButtonModule],
  template: `
    <div [class.mobile]="responsive.isMobile()">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            @if (responsive.isMobile()) {
              Mobile View
            } @else {
              Desktop View
            }
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Breakpoint: {{ responsive.currentBreakpoint() }}</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .mobile mat-card {
      padding: 8px;
    }
  `]
})
export class ResponsiveLayoutComponent {
  responsive = inject(ResponsiveService);
}
```

### Example 2: Multi-language Form

```typescript
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TranslationService, NotificationService } from '../../shared';

@Component({
  selector: 'app-user-form',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-form-field>
        <mat-label>{{ translate.get('auth.email') }}</mat-label>
        <input matInput formControlName="email" type="email">
        @if (form.get('email')?.hasError('required')) {
          <mat-error>{{ translate.get('validation.required') }}</mat-error>
        }
      </mat-form-field>
      
      <button mat-raised-button color="primary" type="submit">
        {{ translate.get('common.save') }}
      </button>
    </form>
  `
})
export class UserFormComponent {
  private fb = inject(FormBuilder);
  translate = inject(TranslationService);
  private notification = inject(NotificationService);
  
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });
  
  onSubmit() {
    if (this.form.valid) {
      this.notification.success(
        this.translate.get('common.success')
      );
    }
  }
}
```

### Example 3: Platform-Specific Features

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { PlatformService } from '../../shared';

@Component({
  selector: 'app-platform-aware',
  template: `
    @if (platform.isBrowser) {
      <div>
        @if (platform.isIOS) {
          <ios-specific-feature />
        } @else if (platform.isAndroid) {
          <android-specific-feature />
        } @else {
          <desktop-feature />
        }
      </div>
    } @else {
      <ssr-placeholder />
    }
  `
})
export class PlatformAwareComponent implements OnInit {
  platform = inject(PlatformService);
  
  ngOnInit() {
    if (this.platform.isBrowser) {
      // Browser-only initialization
      this.initializeBrowserFeatures();
    }
    
    if (this.platform.isTouchDevice) {
      // Enable touch gestures
      this.enableTouchGestures();
    }
  }
  
  private initializeBrowserFeatures() {
    // Browser-specific code
  }
  
  private enableTouchGestures() {
    // Touch gesture handling
  }
}
```

---

## Best Practices

### 1. Use Signals for Reactive State

```typescript
// ✅ Good - Use signals
const isMobile = this.responsive.isMobile();
const currentLang = this.translate.currentLanguage();

// ❌ Bad - Don't use observables when signals are available
```

### 2. Lazy Load Material Modules

```typescript
// ✅ Good - Import only what you need
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  imports: [MatButtonModule, MatCardModule]
})
```

### 3. Use Translation Keys

```typescript
// ✅ Good - Use translation service
this.translate.get('common.save')

// ❌ Bad - Hardcoded strings
'Save'
```

### 4. Handle SSR Properly

```typescript
// ✅ Good - Check platform before using browser APIs
if (this.platform.isBrowser) {
  window.localStorage.setItem('key', 'value');
}

// ❌ Bad - Direct browser API usage
window.localStorage.setItem('key', 'value');
```

### 5. Use Notification Service for Feedback

```typescript
// ✅ Good - User feedback
this.notification.success('Operation completed');

// ❌ Bad - No feedback or console.log
console.log('Operation completed');
```

---

## Configuration Reference

### App Config

```typescript
// src/app/core/providers/app.config.ts
export const appConfig: ApplicationConfig = mergeApplicationConfig(
  {
    providers: [
      provideAnimations(),      // Enables animations
      provideHttpClient(withFetch())  // Required for translations
    ]
  },
  firebaseConfig
);
```

### Angular.json

```json
{
  "projects": {
    "Xuanwu": {
      "architect": {
        "build": {
          "options": {
            "styles": [
              "src/styles/material-theme.scss",
              "src/styles/global.css"
            ]
          }
        }
      }
    }
  }
}
```

---

## Related Documentation

- [Material Design 3](https://m3.material.io/)
- [Angular Material](https://material.angular.io/)
- [Angular CDK](https://material.angular.io/cdk/categories)
- [Angular Animations](https://angular.dev/guide/animations)
- [Project Architecture](../../../docs/PROJECT_ARCHITECTURE.md)

---

**Last Updated**: 2026-02-05  
**Maintainer**: Infrastructure Team
