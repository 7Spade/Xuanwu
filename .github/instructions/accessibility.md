---
description: "Angular accessibility best practices and ARIA implementation guidelines"
applies_to: ["**/*.ts", "**/*.html"]
priority: high
---

# Accessibility Standards for Angular

You MUST ensure all Angular code follows accessibility best practices. The application must be usable by people with visual or motor impairments using assistive technologies.

## Core Requirements

- ✅ MUST pass all AXE accessibility checks
- ✅ MUST follow WCAG AA minimums (4.5:1 color contrast, proper focus management)
- ✅ MUST include proper ARIA attributes where semantic HTML is insufficient

## ARIA Attributes

### Binding ARIA Attributes

Use attribute binding for dynamic ARIA values:

```typescript
// ✅ Correct
<button [aria-label]="actionLabel">Save</button>
<section [aria-expanded]="isExpanded">Content</section>

// ✅ Static ARIA attributes
<button aria-label="Save document">Save</button>
```

### ARIA Element References

For ARIA patterns requiring element references, use property binding with element arrays:

```typescript
@Component({
  template: `
    <h2 #dialogTitle>Attention</h2>
    <p #dialogDescription>Review your answers.</p>
    
    <section role="dialog" [ariaLabelledByElements]="[dialogTitle, dialogDescription]">
      <ng-content />
    </section>
  `
})
export class ReviewDialog {}
```

## Native Elements First

### Augment Native Elements

✅ **Prefer**: Use native elements with attribute selectors

```typescript
// Good: Extends native button
@Component({
  selector: 'button[app-primary]',
  template: '<ng-content />'
})
export class PrimaryButton {}
```

❌ **Avoid**: Custom elements re-implementing native behavior

```typescript
// Bad: Custom button element
@Component({
  selector: 'app-button',
  template: '<div (click)="onClick()"><ng-content /></div>'
})
export class CustomButton {}
```

### Container Pattern for Native Controls

When native elements need wrapping (like `<input>`), use content projection:

```typescript
// Good: Container with content projection
@Component({
  selector: 'app-text-field',
  template: `
    <label [for]="inputId">{{label}}</label>
    <ng-content select="input" />
    <span class="hint">{{hint}}</span>
  `
})
export class TextField {
  inputId = input.required<string>();
  label = input.required<string>();
  hint = input<string>();
}
```

## Routing Accessibility

### Focus Management After Navigation

Always update focus after route changes to help screen reader users:

```typescript
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

// In your component or service
constructor() {
  inject(Router).events
    .pipe(filter(e => e instanceof NavigationEnd))
    .subscribe(() => {
      const mainHeader = document.querySelector('#main-content-header');
      if (mainHeader instanceof HTMLElement) {
        mainHeader.focus();
      }
    });
}
```

### Active Link Identification

Use `ariaCurrentWhenActive` to help screen readers identify active links:

```html
<nav>
  <a routerLink="home" 
     routerLinkActive="active-page" 
     ariaCurrentWhenActive="page">
    Home
  </a>
  <a routerLink="about" 
     routerLinkActive="active-page" 
     ariaCurrentWhenActive="page">
    About
  </a>
</nav>
```

## Deferred Loading

When using `@defer`, wrap in ARIA live regions to announce content changes:

```html
<div aria-live="polite" aria-atomic="true">
  @defer (on viewport) {
    <app-dynamic-content />
  } @placeholder {
    <div aria-label="Loading content">...</div>
  }
</div>
```

## Progress Indicators

Make custom progress bars accessible:

```typescript
@Component({
  selector: 'app-progress-bar',
  template: `
    <div class="progress-bar"
         role="progressbar"
         [attr.aria-valuenow]="value()"
         aria-valuemin="0"
         aria-valuemax="100"
         [attr.aria-label]="label()">
      <div class="progress-fill" [style.width.%]="value()"></div>
    </div>
  `
})
export class ProgressBar {
  value = input.required<number>();
  label = input<string>('Progress');
}
```

## Angular Material & CDK

When using Angular Material, leverage the CDK a11y package:

```typescript
import { LiveAnnouncer } from '@angular/cdk/a11y';

// Announce dynamic changes to screen readers
announcer = inject(LiveAnnouncer);

saveData() {
  // ... save logic
  this.announcer.announce('Data saved successfully');
}
```

Use `cdkTrapFocus` for modal dialogs:

```html
<div role="dialog" 
     cdkTrapFocus 
     [cdkTrapFocusAutoCapture]="true">
  <!-- Dialog content -->
</div>
```

## Testing

- Use automated tools: AXE DevTools, Lighthouse
- Test with actual screen readers (NVDA, JAWS, VoiceOver)
- Test keyboard navigation (Tab, Shift+Tab, Arrow keys, Enter, Escape)
- Verify focus indicators are visible
- Check color contrast meets WCAG AA (4.5:1 for normal text)

## Resources

- [Angular Accessibility Guide](https://angular.dev/guide/accessibility)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Angular Material CDK A11y](https://material.angular.dev/cdk/a11y/overview)
