# UI/UX Layout Concept (Wireframe)

> **Version**: 1.0  
> **Design System**: Linear/Vercel inspired  
> **Last Updated**: 2026-02-05

---

## 🎨 Layout Overview

This layout follows the Linear/Vercel design philosophy, emphasizing clean interfaces with a **two-level context switcher** for navigating between scopes and containers.

---

## 📐 Layout Regions

| Region | Screen Position | Functionality & Interaction Logic |
|--------|-----------------|-----------------------------------|
| **A. Global Context Switcher**<br>(Context Switcher) | **Left Sidebar - Top**<br>`[ Avatar | Account/Org Name ▼ ]` | **Function**: Switch between Personal and Organization contexts.<br>**Interaction**: Click to open dropdown showing all accessible scopes (personal + organizations). Selection updates the entire app context. |
| **B. Container Switcher**<br>(Container Navigator) | **Left Sidebar - Middle**<br>`List / Search Box / Cmd+K` | **Function**: Display all "Logical Containers" within the current context.<br>**Interaction**: Supports quick filtering. Selecting a container loads its content in the main area. |
| **C. Feature Canvas**<br>(Feature Stack Area) | **Right Main Window**<br>`[ Block 1 ] [ Block 2 ]` | **Function**: Container content display area.<br>**Interaction**: Users can add, drag, or stack different feature modules (e.g., Wiki on top, Kanban below). |

---

## 🖼️ Visual Structure

```text
+----------------------+--------------------------------------------------+
| [A] User/Org Switch ▼|  Container Title / Settings / Share              |
+----------------------+--------------------------------------------------+
| [B] Container Nav    |                                                  |
|  🔍 Search...        |  +--------------------------------------------+  |
|                      |  | [Feature Module 1: Project Overview]       |  |
|  📂 Container Alpha  |  | Metrics | Charts | Status                  |  |
|  📂 Container Beta   |  +--------------------------------------------+  |
|     ↳ Sub-page       |                                                  |
|  📂 Container Gamma  |  +--------------------------------------------+  |
|                      |  | [Feature Module 2: Kanban Board]           |  |
|  + New Container     |  | [To Do] [Doing] [Done]                     |  |
|                      |  | • Task 1    • Task 3    • Task 5          |  |
|                      |  | • Task 2    • Task 4                       |  |
| [Settings] [Logout]  |  +--------------------------------------------+  |
|                      |                                                  |
|                      |  +--------------------------------------------+  |
|                      |  | [Feature Module 3: Wiki / Documentation]   |  |
|                      |  | # Project Documentation                    |  |
|                      |  | ## Getting Started                         |  |
+----------------------+--------------------------------------------------+
```

---

## 🎯 Key Interaction Patterns

### 1. Context Switching (Two-Level Navigation)

#### Level 1: Global Context (User vs Organization)

**Location**: Top of left sidebar

**Visual**: 
```
┌─────────────────────────────┐
│ 👤 John Doe            ▼   │  ← Click to switch
├─────────────────────────────┤
│ Personal Workspace          │
│ ────────────────────────    │
│ 🏢 Acme Corporation         │
│ 🏢 DevTeam Inc.             │
└─────────────────────────────┘
```

**Behavior**:
- Default: Shows current context (User or Organization)
- Click: Opens dropdown with all accessible contexts
- Selection: Updates entire UI to show containers for that context
- Persistence: Saved to `USER.current_context_id`

#### Level 2: Container Navigation

**Location**: Middle of left sidebar

**Visual**:
```
┌─────────────────────────────┐
│ 🔍 Search containers...     │
├─────────────────────────────┤
│ 📂 Project Alpha            │ ← Selected (highlighted)
│ 📂 Marketing Campaign       │
│ 📂 Q1 Planning              │
│     ↳ Budget Review         │ ← Sub-page
│     ↳ OKRs                  │
│ + New Container             │
└─────────────────────────────┘
```

**Behavior**:
- Lists all containers in current context
- Supports keyboard navigation (↑↓)
- Search filters in real-time
- Command+K for quick switch
- Drag to reorder (updates sort_order)

---

### 2. Feature Canvas (Stackable Blocks)

**Concept**: Modular, composable workspace

**Available Feature Types**:
- 📊 **Metrics Dashboard**: KPIs, charts, analytics
- 📋 **Kanban Board**: Task management with columns
- 📝 **Wiki/Documentation**: Rich text editor
- 📅 **Calendar**: Events and milestones
- 🔄 **CI/CD Pipeline**: Build status, deployments
- 📈 **Custom Analytics**: User-defined queries

**Interaction**:
```
┌─────────────────────────────────────┐
│ [+] Add Feature Block          ⚙️   │
├─────────────────────────────────────┤
│                                     │
│  ╔════════════════════════════════╗ │
│  ║ 📊 Metrics Dashboard          ║ │ ← Drag handle (⋮⋮)
│  ║ Active Users: 1,234           ║ │
│  ║ Conversion: 3.2%              ║ │
│  ╚════════════════════════════════╝ │
│                                     │
│  ╔════════════════════════════════╗ │
│  ║ 📋 Kanban Board     [Minimize]║ │
│  ║ [To Do] [Doing] [Done]        ║ │
│  ╚════════════════════════════════╝ │
│                                     │
└─────────────────────────────────────┘
```

**Behavior**:
- Click "+ Add Feature" to open feature selector
- Drag blocks to reorder (updates `FEATURE_STACK.sort_order`)
- Click ⚙️ to configure feature-specific settings
- Minimize/expand individual blocks
- Each block is independently scrollable

---

## 🎨 Design Tokens

### Color Palette (Linear-inspired)

```scss
// Neutral
$gray-50: #FAFAFA;
$gray-100: #F5F5F5;
$gray-200: #E5E5E5;
$gray-800: #27272A;
$gray-900: #18181B;

// Primary
$primary-500: #3B82F6;  // Blue
$primary-600: #2563EB;
$primary-700: #1D4ED8;

// Semantic
$success: #10B981;
$warning: #F59E0B;
$error: #EF4444;
$info: #06B6D4;
```

### Typography

```scss
// Font Family
$font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
$font-mono: 'JetBrains Mono', 'Fira Code', monospace;

// Font Sizes
$text-xs: 0.75rem;    // 12px
$text-sm: 0.875rem;   // 14px
$text-base: 1rem;     // 16px
$text-lg: 1.125rem;   // 18px
$text-xl: 1.25rem;    // 20px
$text-2xl: 1.5rem;    // 24px
```

### Spacing

```scss
$spacing-1: 0.25rem;  // 4px
$spacing-2: 0.5rem;   // 8px
$spacing-3: 0.75rem;  // 12px
$spacing-4: 1rem;     // 16px
$spacing-6: 1.5rem;   // 24px
$spacing-8: 2rem;     // 32px
```

### Layout Dimensions

```scss
$sidebar-width: 240px;
$sidebar-collapsed: 64px;
$header-height: 56px;
$feature-block-min-height: 200px;
```

---

## 🔄 Responsive Behavior

### Desktop (> 1024px)

- Full sidebar visible
- Multi-column feature canvas
- Hover states for all interactive elements

### Tablet (768px - 1024px)

- Collapsible sidebar (hamburger menu)
- Single column feature canvas
- Touch-optimized controls

### Mobile (< 768px)

- Overlay sidebar (slides in)
- Single column, stacked features
- Bottom navigation for context switching
- Swipe gestures for navigation

---

## ♿ Accessibility

### Keyboard Navigation

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Open quick switcher |
| `Cmd/Ctrl + B` | Toggle sidebar |
| `Cmd/Ctrl + /` | Show keyboard shortcuts |
| `↑ ↓` | Navigate containers |
| `Enter` | Select container |
| `Esc` | Close modals/dialogs |

### Screen Reader Support

- All interactive elements have ARIA labels
- Landmark regions properly defined
- Focus management for modals
- Announced state changes

### Color Contrast

- All text meets WCAG AA standards (4.5:1 minimum)
- Focus indicators visible at 3:1 ratio
- Interactive elements distinguishable without color alone

---

## 🎬 Animation & Transitions

```scss
// Micro-interactions
$transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
$transition-base: 300ms cubic-bezier(0.4, 0, 0.2, 1);
$transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);

// Usage examples
.sidebar {
  transition: transform $transition-base;
}

.feature-block {
  transition: box-shadow $transition-fast,
              transform $transition-fast;
              
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
}
```

---

## 📱 Mobile-First Considerations

### Bottom Sheet for Context Switching

On mobile, the context switcher becomes a bottom sheet:

```
┌─────────────────────────┐
│                         │
│  Main Content Area      │
│                         │
│                         │
├─────────────────────────┤
│ [Personal] [Acme Corp]  │ ← Tab bar
└─────────────────────────┘
```

### Swipe Gestures

- Swipe right: Open sidebar
- Swipe left: Close sidebar
- Swipe down on feature: Collapse
- Long press: Show context menu

---

## 🧩 Component Hierarchy

```
AppShell
├── Sidebar
│   ├── ContextSwitcher
│   │   └── ContextDropdown
│   ├── ContainerNavigator
│   │   ├── SearchBox
│   │   ├── ContainerList
│   │   │   └── ContainerItem[]
│   │   └── NewContainerButton
│   └── SidebarFooter
│       ├── SettingsButton
│       └── LogoutButton
└── MainContent
    ├── ContainerHeader
    │   ├── ContainerTitle
    │   ├── ShareButton
    │   └── SettingsButton
    └── FeatureCanvas
        ├── AddFeatureButton
        └── FeatureBlock[]
            ├── FeatureHeader
            ├── FeatureContent
            └── FeatureFooter
```

---

## 📚 Related Documentation

- [Database Schema](./DATABASE_SCHEMA.md) - Data model supporting this UI
- [Project Architecture](./PROJECT_ARCHITECTURE.md) - Technical architecture
- [Component Standards](./NAMING_CONVENTIONS.md) - Component naming and structure

---

**Version History**:
- v1.0 (2026-02-05): Initial UI/UX layout documentation

---

**Design References**:
- [Linear](https://linear.app) - Clean, keyboard-first interface
- [Vercel](https://vercel.com) - Minimal, focused design
- [Notion](https://notion.so) - Block-based composition
