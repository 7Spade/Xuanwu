# Xuanwu (玄武 - Black Tortoise)

> **Modern Enterprise Angular Application with SSR + Zoneless Architecture**

## 🚀 Technology Stack

- **Framework**: Angular 21.1.3 (Angular 20+)
- **SSR**: Server-Side Rendering with `@angular/ssr` 21.1.2
- **Architecture**: Zoneless (Pure Reactive without NgZone)
- **State Management**: NgRx Signal Store
- **Backend**: Firebase + Node.js/Express
- **Styling**: Tailwind CSS 4.1+
- **Testing**: Vitest 4.0+
- **DDD**: 8-layer Domain-Driven Design

This project implements a production-ready Angular 20+ application with **Server-Side Rendering (SSR)** and **Zoneless** reactive architecture for optimal performance and SEO.

---

## 📖 Documentation

**Core Documentation** (Diátaxis Framework):
- [📑 Documentation Index](./docs/INDEX.md) - Complete navigation hub
- [🏗️ Architecture Overview](./docs/PROJECT_ARCHITECTURE.md) - 8-layer DDD design (with implementation status)
- [⚡ Quick Reference](./docs/QUICK_REFERENCE.md) - Developer cheat sheet
- [📚 Glossary](./docs/GLOSSARY.md) - Standardized terminology

**Governance & Customization**:
- [🤖 Custom Agents](./AGENTS.md) - 60+ GitHub Copilot agents ([full catalog](./.github/agents/README.md))
- [💡 Custom Instructions](./.github/instructions/README.md) - Coding guidelines for AI
- [🎯 Prompts](./.github/prompts/README.md) - Reusable prompt templates
- [🧠 Skills](./.github/skills/README.md) - Knowledge modules for agents

**Documentation Status**: ✅ Complete - All docs follow [Diátaxis Framework](https://diataxis.fr/) principles

---

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

### Client-Side Build

To build the project for client-side only:

```bash
ng build
```

### SSR Build

To build the project with Server-Side Rendering:

```bash
ng build
```

The SSR build is configured by default in `angular.json` with `"outputMode": "server"`.

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Server-Side Rendering (SSR)

This application uses Angular SSR for improved performance and SEO.

### Running SSR in Production

After building, serve the SSR application:

```bash
npm run serve:ssr:Xuanwu
```

This starts an Express server at `http://localhost:4000` that serves the pre-rendered application.

### SSR Configuration

- **SSR Entry**: `src/server.ts` (Express server configuration)
- **Server Main**: `src/main.server.ts` (Angular server bootstrap)
- **Output Mode**: `server` (configured in `angular.json`)
- **Package**: `@angular/ssr` v21.1.2

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
