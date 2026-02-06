# OrgVerse - Next.js Demo

> **Project**: Multi-dimensional Workspace Collaboration System  
> **Framework**: Next.js 15 (App Router)  
> **Backend**: Firebase (Auth, Firestore, Storage)  
> **AI Engine**: Google Genkit v1.x (Gemini 2.5 Flash)  
> **UI**: ShadCN UI + Tailwind CSS  
> **Version**: 1.0

---

## 🎯 Project Overview

OrgVerse is a modern workspace architecture system that deconstructs digital identity from single organizations into a multi-dimensional collaboration network. This Next.js implementation demonstrates the core concepts with Firebase backend integration and AI-powered UI adaptation.

### Core Features

- **🔐 Identity Sovereignty Portal**: Unified SSO authentication (demo/12345)
- **🌐 Dimension Switcher**: Seamless organization/workspace switching
- **🎨 AI Theme Adapter**: Context-aware UI color generation via Genkit
- **👥 Dual-Layer Members**: Organization-level + workspace-level permissions
- **📊 Permission Visualization**: Permission constellation diagrams

---

## 📚 Documentation

### Complete Documentation Set

- **[🛠️ Implementation Guide](./docs/NEXTJS_TO_ANGULAR_IMPLEMENTATION_GUIDE.md)** ✨ - Step-by-step migration with file names (NEW!)
- **[🚀 Migration Strategy](./docs/NEXTJS_TO_ANGULAR_MIGRATION.md)** - Convert Next.js to Angular 20+ architecture
- **[📁 Project Tree](./docs/NEXTJS_PROJECT_TREE.md)** - Complete file structure and organization
- **[📖 Function Reference](./docs/NEXTJS_FUNCTION_REFERENCE.md)** - API reference for all functions and components
- **[✅ Naming Audit](./docs/NEXTJS_NAMING_AUDIT.md)** - Naming convention compliance analysis
- **[🏗️ Blueprint](./docs/blueprint.md)** - System architecture and vision
- **[💾 Backend Schema](./docs/backend.json)** - Firestore data models

### Quick Links

- **Daily Implementation**: See [Implementation Guide](./docs/NEXTJS_TO_ANGULAR_IMPLEMENTATION_GUIDE.md) for numbered steps ✨
- **Migration Strategy**: See [Migration Guide](./docs/NEXTJS_TO_ANGULAR_MIGRATION.md) for architecture plan
- **Getting Started**: See [Project Tree](./docs/NEXTJS_PROJECT_TREE.md#-project-overview)
- **API Reference**: See [Function Reference](./docs/NEXTJS_FUNCTION_REFERENCE.md)
- **File Locations**: See [Project Tree](./docs/NEXTJS_PROJECT_TREE.md#-complete-directory-structure)
- **Naming Rules**: See [Naming Audit](./docs/NEXTJS_NAMING_AUDIT.md)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or pnpm
- Firebase project (configured in `firebase.json`)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start Genkit development UI
npm run genkit:dev
```

### Access the Application

- **Main App**: http://localhost:9002
- **Genkit UI**: http://localhost:4000 (when running genkit:dev)

### Demo Credentials

- **Email**: demo
- **Password**: 12345

---

## 🏗️ Architecture

### Hierarchy Model

```
Organization (維度) - Root Boundary
  └── Workspace (空間) - Logic Boundary
      └── Capabilities (能力) - Atomic Units
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 15 App Router | Server & client rendering |
| UI | ShadCN UI + Tailwind CSS | Component library |
| State | Zustand + Persist | Global state management |
| AI | Google Genkit + Gemini 2.5 | Theme generation |
| Auth | Firebase Auth | User authentication |
| Database | Firestore | Real-time NoSQL database |
| Storage | Firebase Storage | File storage |
| Hosting | Firebase App Hosting | Deployment platform |

---

## 📂 Project Structure

```
docs/nextjs/
├── src/
│   ├── app/                    # Next.js App Router pages
│   ├── components/             # Reusable components
│   ├── firebase/               # Firebase integration
│   ├── ai/                     # Genkit AI flows
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities
│   └── types/                  # TypeScript definitions
├── docs/                       # Documentation
├── firebase.json               # Firebase config
└── package.json                # Dependencies
```

**For complete file tree**: See [Project Tree](./docs/NEXTJS_PROJECT_TREE.md)

---

## 🎨 Visual Identity

- **Primary**: Deep Sky Blue (#00BFFF) - Trust & authority
- **Background**: Light Gray (#E0E0E0) - Neutral base
- **Accent**: Coral (#FF807A) - Interactive elements
- **Style**: Atomic, modular overlays, glassmorphism, fluid transitions

---

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start dev server (port 9002)
npm run build           # Production build
npm run start           # Start production server

# AI Development
npm run genkit:dev      # Start Genkit with dev server
npm run genkit:watch    # Start Genkit with auto-reload

# Quality
npm run lint            # Run ESLint
npm run typecheck       # TypeScript type checking
```

---

## 🔥 Firebase Setup

### Required Firebase Services

- ✅ Authentication (Email/Password + Anonymous)
- ✅ Firestore Database
- ✅ Cloud Storage
- ✅ App Hosting

### Firestore Collections

| Collection | Schema | Description |
|------------|--------|-------------|
| `/organizations/{orgId}` | Organization | Top-level dimensions |
| `/organizations/{orgId}/invites/{inviteId}` | PartnerInvite | Partner invitations |
| `/workspaces/{workspaceId}` | Workspace | Logical workspaces |

**Full schema**: See [Backend Schema](./docs/backend.json)

---

## 🤖 AI Integration (Genkit)

### AI Flows

- **`adaptUIColorToOrgContext`**: Generate theme colors based on organization context
  - Input: Organization ID, name, description
  - Output: HSL color scheme (primary, secondary, accent, background)
  - Model: Gemini 2.5 Flash

**API Reference**: See [Function Reference](./docs/NEXTJS_FUNCTION_REFERENCE.md#ai-flows)

---

## 📖 Key Concepts

### Organizations (維度)
Root-level data boundaries. Members have basic identity but not automatic access to all workspaces.

### Workspaces (空間)
Logical runtime environments within organizations. Define context, scope, and security policies.

### Capabilities (能力/Specs)
Atomic technical specification units. Isolated modules communicating via facade interfaces.

**Architecture Details**: See [Blueprint](./docs/blueprint.md)

---

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Type checking
npm run typecheck

# Linting
npm run lint
```

---

## 📦 Deployment

### Firebase App Hosting

```bash
# Deploy to Firebase
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy only functions (if added)
firebase deploy --only functions
```

Configuration: `apphosting.yaml`

---

## 🤝 Contributing

### Naming Conventions

This project follows strict naming conventions:

- **Files/Directories**: `kebab-case`
- **Components**: `PascalCase` exports
- **Functions/Hooks**: `camelCase`
- **Constants**: `SCREAMING_SNAKE_CASE`

**Full Guidelines**: See [Naming Audit](./docs/NEXTJS_NAMING_AUDIT.md)

### Adding New Features

1. Check [Project Tree](./docs/NEXTJS_PROJECT_TREE.md) for structure
2. Follow [Naming Conventions](./docs/NEXTJS_NAMING_AUDIT.md)
3. Update [Function Reference](./docs/NEXTJS_FUNCTION_REFERENCE.md) with new APIs
4. Document in relevant files

---

## 📚 Documentation Index

| Document | Purpose | Target Audience |
|----------|---------|-----------------|
| [README.md](./README.md) | Project overview | All users |
| [Project Tree](./docs/NEXTJS_PROJECT_TREE.md) | Complete file structure | Developers |
| [Function Reference](./docs/NEXTJS_FUNCTION_REFERENCE.md) | API documentation | Developers |
| [Naming Audit](./docs/NEXTJS_NAMING_AUDIT.md) | Naming compliance | Developers/Reviewers |
| [Blueprint](./docs/blueprint.md) | Architecture vision | Architects |
| [Backend Schema](./docs/backend.json) | Data models | Backend developers |

---

## 📝 License

This is a demonstration project for the Xuanwu (玄武) architecture.

---

## 🔗 Related Projects

- **[Xuanwu Main Project](../../)** - Angular implementation with DDD architecture
- **[Documentation Hub](../../docs/INDEX.md)** - Complete project documentation

---

**Last Updated**: 2026-02-05  
**Version**: 1.0  
**Status**: ✅ Documentation Complete
