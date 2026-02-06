# Quick Reference: Material, CDK, i18n Services

> **For GitHub Copilot**: Use these services in your code suggestions

---

## 🎨 Material Components

```typescript
// Import Material modules
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  imports: [MatButtonModule, MatCardModule, ...]
})
```

---

## 📱 Responsive Service

```typescript
import { ResponsiveService } from '../shared';

responsive = inject(ResponsiveService);

// Use in templates
@if (responsive.isMobile()) {
  <mobile-view />
}

// Available signals
responsive.isMobile()        // true on handsets
responsive.isTablet()        // true on tablets
responsive.isDesktop()       // true on desktop
responsive.isPortrait()      // true in portrait
responsive.isLandscape()     // true in landscape
responsive.currentBreakpoint() // 'XSmall' | 'Small' | 'Medium' | 'Large' | 'XLarge'
```

---

## 🖥️ Platform Service

```typescript
import { PlatformService } from '../shared';

platform = inject(PlatformService);

// Check platform
if (platform.isBrowser) {
  // Browser-only code
}

if (platform.isServer) {
  // SSR code
}

// Device detection
platform.isAndroid
platform.isIOS
platform.isSafari
platform.isFirefox
platform.isTouchDevice
```

---

## 🌍 Translation Service

```typescript
import { TranslationService } from '../shared';

translate = inject(TranslationService);

// Get translations
translate.get('common.save')                    // Returns 'Save' or '儲存'
translate.get('validation.minLength', { min: 5 }) // Returns 'Minimum length is 5'

// Change language
translate.use('zh-TW').subscribe();
translate.use('en').subscribe();

// Current language
translate.currentLanguage()  // Signal: 'en' or 'zh-TW'

// Check if key exists
translate.has('common.save')  // Returns boolean
```

### Translation Keys Reference

```json
{
  "app.title": "Xuanwu / 玄武",
  "common.save": "Save / 儲存",
  "common.cancel": "Cancel / 取消",
  "common.delete": "Delete / 刪除",
  "common.loading": "Loading... / 載入中...",
  "auth.signIn": "Sign In / 登入",
  "auth.signOut": "Sign Out / 登出",
  "validation.required": "This field is required / 此欄位為必填",
  "validation.email": "Please enter a valid email / 請輸入有效的電子郵件"
}
```

---

## 🔔 Notification Service

```typescript
import { NotificationService } from '../shared';

notification = inject(NotificationService);

// Show notifications
notification.success('Data saved successfully!');
notification.error('Failed to save data');
notification.warning('Please check your input');
notification.info('New update available');

// With action button
notification.show('Item deleted', 'Undo').onAction().subscribe(() => {
  // Handle undo
});

// Dismiss all
notification.dismiss();
```

---

## 💬 Dialog Service

```typescript
import { DialogService } from '../shared';

dialog = inject(DialogService);

// Open custom dialog
const dialogRef = dialog.open(MyDialogComponent, {
  width: '400px',
  data: { id: 123 }
});

dialogRef.afterClosed().subscribe(result => {
  console.log('Result:', result);
});

// Confirmation dialog
dialog.confirm({
  title: 'Delete Item',
  message: 'Are you sure?',
  confirmText: 'Delete',
  cancelText: 'Cancel'
}).subscribe(confirmed => {
  if (confirmed) {
    // Delete item
  }
});
```

---

## 📝 Common Patterns

### Responsive Form

```typescript
@Component({
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  template: `
    <form [formGroup]="form" [class.mobile]="responsive.isMobile()">
      <mat-form-field>
        <mat-label>{{ translate.get('auth.email') }}</mat-label>
        <input matInput formControlName="email">
        @if (form.get('email')?.hasError('required')) {
          <mat-error>{{ translate.get('validation.required') }}</mat-error>
        }
      </mat-form-field>
      <button mat-raised-button (click)="save()">
        {{ translate.get('common.save') }}
      </button>
    </form>
  `
})
export class MyFormComponent {
  responsive = inject(ResponsiveService);
  translate = inject(TranslationService);
  notification = inject(NotificationService);
  
  save() {
    this.notification.success(this.translate.get('common.success'));
  }
}
```

### Platform-Aware Component

```typescript
@Component({
  template: `
    @if (platform.isBrowser) {
      @if (responsive.isMobile()) {
        <mobile-layout />
      } @else {
        <desktop-layout />
      }
    } @else {
      <ssr-placeholder />
    }
  `
})
export class MyComponent {
  platform = inject(PlatformService);
  responsive = inject(ResponsiveService);
}
```

### Multi-language Dialog

```typescript
confirmDelete() {
  this.dialog.confirm({
    title: this.translate.get('common.delete'),
    message: this.translate.get('messages.confirmDelete'),
    confirmText: this.translate.get('common.delete'),
    cancelText: this.translate.get('common.cancel')
  }).subscribe(confirmed => {
    if (confirmed) {
      this.deleteItem();
      this.notification.success(
        this.translate.get('messages.deleted')
      );
    }
  });
}
```

---

## 🎯 Import Paths

```typescript
// Services from shared layer
import {
  TranslationService,
  ResponsiveService,
  PlatformService,
  NotificationService,
  DialogService
} from '../shared';  // or '../../shared' depending on location

// Material modules
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
// ... etc
```

---

## ✅ Best Practices Checklist

- [ ] Use `responsive.isMobile()` for mobile-specific layouts
- [ ] Use `platform.isBrowser` before accessing browser APIs
- [ ] Use `translate.get()` instead of hardcoded strings
- [ ] Use `notification` service for user feedback
- [ ] Import only needed Material modules
- [ ] Use signals for reactive state
- [ ] Handle SSR properly with platform checks

---

**Reference**: See [MATERIAL_CDK_I18N_GUIDE.md](./MATERIAL_CDK_I18N_GUIDE.md) for complete documentation
