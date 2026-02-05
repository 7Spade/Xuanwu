# Next.js Demo Project - Complete File Tree

> **Document Type**: Reference (Information-oriented)  
> **Target Audience**: Developers working on Next.js demo  
> **Purpose**: Complete file tree for reproducing the Next.js demonstration project  
> **Version**: 1.0  
> **Project**: OrgVerse (Next.js Implementation)  
> **Last Updated**: 2026-02-05

## When to Use This

- 📝 **Reproducing the demo** - Follow exact file structure
- 🎯 **Understanding organization** - See how Next.js demo is structured
- 🤖 **AI code generation** - Reference for creating new files
- 📋 **Code navigation** - Locate specific files quickly

**Prerequisites**: Basic Next.js knowledge  
**Related Docs**: [Blueprint](./blueprint.md) (Architecture), [Backend Schema](./backend.json) (Data models), [Function Reference](./NEXTJS_FUNCTION_REFERENCE.md) (API reference)

---

## 🎯 Project Overview

This is a Next.js 15 demonstration implementing the OrgVerse architecture - a multi-dimensional workspace collaboration system with Firebase backend and AI-powered UI adaptation.

### Technology Stack

- **Framework**: Next.js 15 (App Router)
- **UI Library**: ShadCN UI + Tailwind CSS
- **State Management**: Zustand (with persist)
- **AI Engine**: Google Genkit v1.x (Gemini 2.5 Flash)
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Styling**: Tailwind CSS v4.x
- **Font**: Inter (Headline & Body)

---

## 📁 Complete Directory Structure

```
docs/nextjs/
├── .idx/                                  # IDX workspace configuration
│   ├── dev.nix                           # Nix environment setup
│   ├── icon.png                          # Workspace icon
│   ├── integrations.json                 # IDE integrations
│   └── mcp.json                          # MCP configuration
│
├── docs/                                  # 📚 Documentation
│   ├── blueprint.md                      # Architecture blueprint
│   ├── backend.json                      # Backend schema definitions
│   ├── NEXTJS_PROJECT_TREE.md            # This file
│   ├── NEXTJS_FUNCTION_REFERENCE.md      # Function/component catalog
│   └── NEXTJS_NAMING_AUDIT.md            # Naming conventions audit
│
├── src/                                   # 🎨 Source code
│   ├── app/                              # Next.js App Router
│   │   ├── layout.tsx                    # Root layout
│   │   ├── page.tsx                      # Landing page
│   │   ├── globals.css                   # Global styles
│   │   ├── favicon.ico                   # Favicon
│   │   │
│   │   ├── login/                        # Login feature
│   │   │   └── page.tsx                  # Login page
│   │   │
│   │   └── dashboard/                    # Dashboard feature
│   │       ├── layout.tsx                # Dashboard layout
│   │       ├── page.tsx                  # Dashboard home
│   │       │
│   │       ├── _components/              # Dashboard-specific components
│   │       │   ├── stat-cards.tsx        # Statistics cards
│   │       │   ├── recent-organizations.tsx
│   │       │   ├── recent-workspaces.tsx
│   │       │   ├── recent-containers.tsx
│   │       │   └── permission-constellation.tsx
│   │       │
│   │       ├── settings/                 # User settings
│   │       │   └── page.tsx
│   │       │
│   │       ├── team/                     # Team management
│   │       │   └── page.tsx
│   │       │
│   │       ├── blocks/                   # Blocks overview
│   │       │   └── page.tsx
│   │       │
│   │       ├── organization/             # Organization management
│   │       │   ├── settings/
│   │       │   │   └── page.tsx
│   │       │   ├── members/
│   │       │   │   └── page.tsx
│   │       │   ├── teams/
│   │       │   │   ├── page.tsx
│   │       │   │   └── [id]/
│   │       │   │       └── page.tsx
│   │       │   ├── partners/
│   │       │   │   ├── page.tsx
│   │       │   │   └── [id]/
│   │       │   │       └── page.tsx
│   │       │   ├── audit/
│   │       │   │   └── page.tsx
│   │       │   ├── daily/
│   │       │   │   └── page.tsx
│   │       │   ├── schedule/
│   │       │   │   └── page.tsx
│   │       │   ├── matrix/
│   │       │   │   └── page.tsx
│   │       │   └── external/
│   │       │       └── page.tsx
│   │       │
│   │       └── workspaces/               # Workspace management
│   │           ├── page.tsx              # Workspaces list
│   │           ├── blocks/
│   │           │   └── page.tsx
│   │           ├── capabilities/
│   │           │   └── page.tsx
│   │           ├── _components/
│   │           │   └── create-workspace-dialog.tsx
│   │           └── [id]/                 # Workspace detail
│   │               ├── page.tsx
│   │               ├── workspace-context.tsx
│   │               └── _components/
│   │                   ├── acceptance/
│   │                   │   └── workspace-acceptance.tsx
│   │                   ├── capabilities/
│   │                   │   └── workspace-capabilities.tsx
│   │                   ├── daily/
│   │                   │   └── workspace-daily.tsx
│   │                   ├── dialogs/
│   │                   │   └── workspace-dialogs.tsx
│   │                   ├── files/
│   │                   │   └── workspace-files.tsx
│   │                   ├── finance/
│   │                   │   └── workspace-finance.tsx
│   │                   ├── issues/
│   │                   │   └── workspace-issues.tsx
│   │                   ├── members/
│   │                   │   └── workspace-members-management.tsx
│   │                   ├── qa/
│   │                   │   └── workspace-qa.tsx
│   │                   └── tasks/
│   │                       └── workspace-tasks.tsx
│   │
│   ├── components/                       # 🧩 Shared components
│   │   ├── dashboard/                    # Dashboard components
│   │   │   ├── dashboard-header.tsx      # Header with user menu
│   │   │   ├── dashboard-sidebar.tsx     # Navigation sidebar
│   │   │   ├── global-switcher.tsx       # Org/workspace switcher
│   │   │   ├── page-header.tsx           # Page title component
│   │   │   ├── ui-adapter.tsx            # AI-powered theme adapter
│   │   │   └── firebase-error-listener.tsx # Error handling
│   │   │
│   │   ├── organization/                 # Organization components
│   │   │   └── organization-card.tsx
│   │   │
│   │   ├── workspaces/                   # Workspace components
│   │   │   ├── workspace-card.tsx
│   │   │   └── workspace-list-item.tsx
│   │   │
│   │   └── ui/                           # ShadCN UI components
│   │       ├── accordion.tsx
│   │       ├── alert.tsx
│   │       ├── alert-dialog.tsx
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── calendar.tsx
│   │       ├── card.tsx
│   │       ├── carousel.tsx
│   │       ├── chart.tsx
│   │       ├── checkbox.tsx
│   │       ├── collapsible.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── form.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── menubar.tsx
│   │       ├── popover.tsx
│   │       ├── progress.tsx
│   │       ├── radio-group.tsx
│   │       ├── scroll-area.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── sidebar.tsx
│   │       ├── skeleton.tsx
│   │       ├── slider.tsx
│   │       ├── switch.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       ├── textarea.tsx
│   │       ├── toast.tsx
│   │       └── toaster.tsx
│   │       └── tooltip.tsx
│   │
│   ├── firebase/                         # 🔥 Firebase integration
│   │   ├── index.ts                      # Barrel exports
│   │   ├── config.ts                     # Firebase configuration
│   │   ├── provider.tsx                  # Firebase context provider
│   │   ├── client-provider.tsx           # Client-side provider
│   │   ├── errors.ts                     # Error definitions
│   │   ├── error-emitter.ts              # Error event emitter
│   │   │
│   │   ├── auth/                         # Authentication
│   │   │   └── use-user.tsx              # User authentication hook
│   │   │
│   │   └── firestore/                    # Firestore hooks
│   │       ├── use-collection.tsx        # Collection subscription hook
│   │       └── use-doc.tsx               # Document subscription hook
│   │
│   ├── ai/                               # 🤖 AI/Genkit integration
│   │   ├── genkit.ts                     # Genkit setup
│   │   ├── dev.ts                        # Development server
│   │   └── flows/                        # AI flows
│   │       └── adapt-ui-color-to-org-context.ts
│   │
│   ├── hooks/                            # 🎣 Custom React hooks
│   │   ├── use-toast.ts                  # Toast notifications
│   │   ├── use-mobile.tsx                # Mobile detection
│   │   └── use-dimension-sync.ts         # Dimension synchronization
│   │
│   ├── lib/                              # 📚 Utility libraries
│   │   ├── utils.ts                      # General utilities
│   │   ├── store.ts                      # Zustand store
│   │   ├── placeholder-images.ts         # Image placeholders
│   │   └── placeholder-images.json       # Image data
│   │
│   └── types/                            # 📝 TypeScript types
│       └── domain.ts                     # Domain type definitions
│
├── .firebase/                            # Firebase CLI cache
│   └── (auto-generated)
│
├── .firebaserc                           # Firebase project aliases
├── firebase.json                         # Firebase configuration
├── firestore.rules                       # Firestore security rules
├── firestore.indexes.json                # Firestore indexes
├── storage.rules                         # Storage security rules
├── apphosting.yaml                       # App Hosting configuration
│
├── next.config.ts                        # Next.js configuration
├── tailwind.config.ts                    # Tailwind configuration
├── postcss.config.mjs                    # PostCSS configuration
├── components.json                       # ShadCN components config
├── tsconfig.json                         # TypeScript configuration
│
├── package.json                          # Dependencies
├── package-lock.json                     # Lock file
│
└── README.md                             # Project README
```

---

## 📊 File Statistics

### By Category

| Category | File Count | Description |
|----------|------------|-------------|
| Pages (App Router) | ~30 | Next.js page components |
| Shared Components | ~40 | Reusable UI components |
| UI Components | ~35 | ShadCN/Radix components |
| Firebase Integration | 7 | Auth, Firestore hooks |
| AI/Genkit | 3 | AI flow implementations |
| Hooks | 3 | Custom React hooks |
| Utilities | 4 | Helper functions |
| Configuration | 8 | Project config files |
| Documentation | 5 | Markdown documentation |

### By Type

| Extension | Count | Purpose |
|-----------|-------|---------|
| `.tsx` | ~80 | React components |
| `.ts` | ~15 | TypeScript modules |
| `.json` | ~8 | Configuration/data |
| `.md` | 5 | Documentation |
| `.css` | 1 | Global styles |
| `.yaml` | 1 | App Hosting config |
| `.rules` | 2 | Security rules |

---

## 🎨 Architectural Layers

### Layer 1: App Router (`src/app/`)
- **Purpose**: Next.js routing and page components
- **Pattern**: File-system based routing
- **Conventions**: 
  - `page.tsx` = Route page
  - `layout.tsx` = Shared layout
  - `_components/` = Page-specific components (not routes)

### Layer 2: Components (`src/components/`)
- **Purpose**: Reusable UI components
- **Pattern**: Feature-based organization
- **Conventions**:
  - `dashboard/` = Dashboard-specific
  - `ui/` = Generic UI components (ShadCN)
  - `organization/`, `workspaces/` = Domain components

### Layer 3: Firebase (`src/firebase/`)
- **Purpose**: Backend integration
- **Pattern**: Service adapters + React hooks
- **Conventions**:
  - `config.ts` = Firebase initialization
  - `use-*.tsx` = Custom hooks for Firebase data

### Layer 4: AI (`src/ai/`)
- **Purpose**: Genkit AI flows
- **Pattern**: Flow-based architecture
- **Conventions**:
  - `genkit.ts` = AI instance
  - `flows/` = Individual AI flows

### Layer 5: Supporting (`src/lib/`, `src/hooks/`, `src/types/`)
- **Purpose**: Utilities, hooks, types
- **Pattern**: Functional organization
- **Conventions**:
  - `lib/` = Pure functions
  - `hooks/` = Custom React hooks
  - `types/` = TypeScript definitions

---

## 🔍 Key Files Reference

### Entry Points

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout with providers |
| `src/app/page.tsx` | Landing page |
| `src/app/dashboard/layout.tsx` | Dashboard shell |
| `src/firebase/config.ts` | Firebase initialization |
| `src/ai/genkit.ts` | AI engine setup |

### Core Components

| File | Purpose |
|------|---------|
| `src/components/dashboard/dashboard-header.tsx` | Top navigation bar |
| `src/components/dashboard/dashboard-sidebar.tsx` | Left sidebar navigation |
| `src/components/dashboard/global-switcher.tsx` | Org/workspace switcher |
| `src/components/dashboard/ui-adapter.tsx` | AI theme adapter |

### Firebase Integration

| File | Purpose |
|------|---------|
| `src/firebase/provider.tsx` | Firebase context provider |
| `src/firebase/auth/use-user.tsx` | Auth state hook |
| `src/firebase/firestore/use-collection.tsx` | Collection subscription |
| `src/firebase/firestore/use-doc.tsx` | Document subscription |

### State Management

| File | Purpose |
|------|---------|
| `src/lib/store.ts` | Zustand global store |
| `src/hooks/use-dimension-sync.ts` | Org/workspace sync |

---

## 🚨 Important Conventions

### File Naming
- **Pages**: `page.tsx` (Next.js convention)
- **Layouts**: `layout.tsx` (Next.js convention)
- **Components**: `kebab-case.tsx` (e.g., `workspace-card.tsx`)
- **Hooks**: `use-{name}.tsx` (e.g., `use-toast.ts`)
- **Utilities**: `{name}.ts` (e.g., `utils.ts`)

### Directory Naming
- **Routes**: `kebab-case` (e.g., `/dashboard/organization/members`)
- **Private components**: `_components/` (underscore prefix)
- **Dynamic routes**: `[id]/` (brackets for params)

### Import Patterns
```typescript
// Absolute imports from src
import { useUser } from '@/firebase/auth/use-user';
import { Button } from '@/components/ui/button';

// Relative imports for nearby files
import { StatCards } from './_components/stat-cards';
```

---

## 📖 Related Documentation

- [Blueprint](./blueprint.md) - System architecture vision
- [Backend Schema](./backend.json) - Firestore data models
- [Function Reference](./NEXTJS_FUNCTION_REFERENCE.md) - Complete API reference
- [Naming Audit](./NEXTJS_NAMING_AUDIT.md) - Naming compliance report

---

**Version History**:
- v1.0 (2026-02-05): Initial complete file tree documentation
