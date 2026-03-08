---
name: tool-shadcn
description: 'shadcn/ui component implementation guide. Ensure correct usage of component variants, theme tokens, and accessibility attributes for project components.'
tools: [shadcn]
---

# shadcn/ui Component Implementation Guide

## Usage Principles

1. **Prioritize Existing Components:** Before creating new UI elements, search the shadcn registry for existing components.
2. **Theme Token Compliance:** Use CSS Variables (`--background`, `--foreground`, etc.) for colors; hardcoded hex values are not allowed.
3. **Accessibility First:** Each interactive component must include appropriate `aria-*` attributes.

## Project Import Path

All shadcn components in this project must be imported from `@/shadcn-ui/`:

```typescript
// ✅ Correct
import { Button } from "@/shadcn-ui/button";

// ❌ Wrong
import { Button } from "@/components/ui/button";
```

## Component Customization Standards

When customizing `className`, use `cn()` utility:

```typescript
import { cn } from "@/lib/utils";
```

## Common Pattern Reference

- **Form:** `Form` + `FormField` + `FormControl` + `FormMessage`
- **Table:** `Table` + `TableHeader` + `TableRow` + `TableCell`
- **Dialog:** `Dialog` + `DialogContent` + `DialogHeader` + `DialogFooter`
