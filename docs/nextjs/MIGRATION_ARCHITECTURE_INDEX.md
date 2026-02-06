# Next.js to Angular Migration Architecture - Master Index

> **Document Type**: Master Index  
> **Purpose**: Central navigation hub for the 7-phase migration architecture  
> **Status**: ✅ Complete  
> **Last Updated**: 2026-02-06

---

## 📋 Overview

This master index provides complete navigation for the systematic Next.js to Angular migration following a rigorous 7-phase framework. Each phase builds upon the previous, ensuring a methodical and traceable conversion process.

**Total Documentation:** 7 Phase Documents + Master Index  
**Total Pages:** ~100 pages of comprehensive migration guidance  
**Migration Status:** Architecture Complete, Ready for Implementation

---

## 🎯 Quick Navigation

| Phase | Document | Status | Complexity | Est. Time |
|-------|----------|--------|-----------|-----------|
| **Phase 1** | [Pre-conversion Inventory](./PHASE1_PRE_CONVERSION_INVENTORY.md) | ✅ Complete | Medium | 3-5 days |
| **Phase 2** | [Next.js Architecture Analysis](./PHASE2_NEXTJS_ARCHITECTURE_ANALYSIS.md) | ✅ Complete | High | 5-7 days |
| **Phase 3** | [Angular Target Architecture](./PHASE3_ANGULAR_TARGET_ARCHITECTURE.md) | ✅ Complete | High | 5-7 days |
| **Phase 4** | [Functional Module Conversion](./PHASE4_FUNCTIONAL_MODULE_CONVERSION.md) | ✅ Complete | High | 10-15 days |
| **Phase 5** | [SSR/Async/Edge Cases](./PHASE5_SSR_ASYNC_EDGE_CASES.md) | ✅ Complete | High | 5-7 days |
| **Phase 6** | [Validation and Alignment](./PHASE6_VALIDATION_ALIGNMENT.md) | ✅ Complete | Medium | 5-7 days |
| **Phase 7** | [Switch and Deprecation](./PHASE7_SWITCH_DEPRECATION.md) | ✅ Complete | Medium | 3-5 days |

**Total Estimated Time:** 36-53 days (7-10 weeks)

---

## 📚 Phase Summaries

### Phase 1: Pre-conversion Inventory (轉換前盤點)

**Objectives:**
- ✅ Confirm conversion targets (Angular 21, standalone, SSR, signals, zoneless)
- ✅ Establish behavior baseline
- ✅ Complete route inventory (24 pages + 3 dynamic routes)
- ✅ Catalog middleware, API routes, environment variables

**Key Deliverables:**
- Complete route mapping table
- Environment variable mapping
- Behavior baseline documentation
- Technical debt identification

**Success Criteria:**
- All routes documented
- Conversion scope clearly defined
- Baseline established for validation

[→ Read Phase 1](./PHASE1_PRE_CONVERSION_INVENTORY.md)

---

### Phase 2: Next.js Architecture Analysis (架構與行為解析)

**Objectives:**
- ✅ Analyze rendering strategies (SSR/SSG/ISR/CSR)
- ✅ Classify data fetching patterns
- ✅ Deep-dive into Zustand state management
- ✅ Understand component architecture

**Key Findings:**
- Pure CSR architecture (no SSR/SSG in Next.js)
- Firebase direct integration (no API layer)
- Simple global state with Zustand
- Real-time listeners as primary pattern

**Angular Recommendations:**
- Implement SSR for landing page (SEO improvement)
- Use Signals to replace Zustand
- Implement OnPush change detection
- Use NgOptimizedImage for images

[→ Read Phase 2](./PHASE2_NEXTJS_ARCHITECTURE_ANALYSIS.md)

---

### Phase 3: Angular Target Architecture (目標架構設計)

**Objectives:**
- ✅ Verify Angular 21 configuration
- ✅ Design complete route mapping (Next.js → Angular)
- ✅ Design SSR/SEO strategy
- ✅ Design Signals architecture
- ✅ Design service layer architecture

**Key Designs:**
- Complete route configuration with Guards and Resolvers
- SSR setup with prerendering strategy
- AppStateService with Signals
- Feature services architecture
- FirestoreService and AuthService

**Technologies:**
- Angular 21.1.3 (Standalone + Signals + Zoneless)
- Angular Universal for SSR
- Angular Material for UI
- Firebase 12.8.0

[→ Read Phase 3](./PHASE3_ANGULAR_TARGET_ARCHITECTURE.md)

---

### Phase 4: Functional Module Conversion (功能模組化轉換)

**Objectives:**
- ✅ Define UI component conversion strategy
- ✅ Map React Hooks to Angular Signals/Lifecycle
- ✅ Convert JSX to Angular Templates
- ✅ Migrate styles (Tailwind CSS preserved)
- ✅ Map ShadCN UI to Angular Material

**Key Conversions:**
- useState → signal()
- useEffect → effect() / afterNextRender()
- useMemo → computed()
- useContext → inject() + Service
- JSX → Angular Template syntax
- ShadCN → Angular Material

**Example:** Complete WorkspacesPage conversion with code samples

[→ Read Phase 4](./PHASE4_FUNCTIONAL_MODULE_CONVERSION.md)

---

### Phase 5: SSR/Async/Edge Cases (SSR與非同步處理)

**Objectives:**
- ✅ Handle SSR safety (browser API checks)
- ✅ Rebuild async flows with Resolvers
- ✅ Ensure auth consistency (SSR/CSR)
- ✅ Configure environment variables
- ✅ Implement error handling

**Key Patterns:**
- isPlatformBrowser checks
- afterNextRender for browser-only code
- Route Resolvers for data preloading
- TransferState for SSR → CSR data transfer
- Cookie-based auth for SSR support

**Safety Measures:**
- Global Error Handler
- HTTP Interceptor
- Component Error Boundaries
- Firebase SSR safety checks

[→ Read Phase 5](./PHASE5_SSR_ASYNC_EDGE_CASES.md)

---

### Phase 6: Validation and Alignment (驗證與對齊)

**Objectives:**
- ✅ Define behavior comparison procedures
- ✅ Establish SEO validation processes
- ✅ Set performance benchmarks
- ✅ Complete test strategy

**Validation Procedures:**
- Page-level behavior comparison
- Critical user flow validation
- Meta tags verification
- Lighthouse SEO/Performance audits
- Unit test coverage (≥80%)
- E2E test suite (Playwright)

**Target Metrics:**
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1
- SEO Score ≥ 90
- Test Coverage ≥ 80%

[→ Read Phase 6](./PHASE6_VALIDATION_ALIGNMENT.md)

---

### Phase 7: Switch and Deprecation (切換與退場)

**Objectives:**
- ✅ Plan staged rollout (5 phases)
- ✅ Design traffic switching strategy
- ✅ Implement monitoring and rollback
- ✅ Define Next.js deprecation procedure

**Rollout Phases:**
1. Week 0: Preparation
2. Week 1: Beta Testing (team only)
3. Week 2: Canary Deployment (5% traffic)
4. Week 3-4: Progressive Rollout (25% → 50%)
5. Week 5: Full Switch (100%)
6. Week 6+: Next.js Deprecation

**Monitoring:**
- Real-time error tracking (Sentry)
- Performance monitoring (Lighthouse CI)
- Business metrics (Firebase Analytics)
- Auto-rollback triggers

[→ Read Phase 7](./PHASE7_SWITCH_DEPRECATION.md)

---

## 🔗 Related Documentation

### Main Migration Guides
- **[Next.js to Angular Migration Guide](./docs/NEXTJS_TO_ANGULAR_MIGRATION.md)** - Strategy-oriented (52 KB)
- **[Implementation Guide](./docs/NEXTJS_TO_ANGULAR_IMPLEMENTATION_GUIDE.md)** - Step-by-step (37 KB)

### Reference Documentation
- **[Project Tree](./docs/NEXTJS_PROJECT_TREE.md)** - Complete file structure
- **[Function Reference](./docs/NEXTJS_FUNCTION_REFERENCE.md)** - API catalog
- **[Naming Audit](./docs/NEXTJS_NAMING_AUDIT.md)** - Compliance analysis
- **[Blueprint](./docs/blueprint.md)** - System vision
- **[Backend Schema](./docs/backend.json)** - Data models

### Angular Standards
- **[Angular 20 + SSR + Less Zero Spec](../ANGULAR20_SSR_LESSZERO_SPEC.md)** - Technical boundaries
- **[DDD Layer Boundaries](../DDD_LAYER_BOUNDARIES.md)** - Architecture patterns
- **[Naming Conventions](../NAMING_CONVENTIONS.md)** - Project-wide rules
- **[Import Rules](../IMPORT_RULES.md)** - Dependency management

---

## 📊 Migration Statistics

### Codebase Analysis
- **Total Next.js Files:** 115 files
- **Total Characters:** 588,511
- **Total Tokens:** 149,593
- **Total Lines:** 17,037

### Migration Scope
- **Pages to Migrate:** 24 pages
- **Dynamic Routes:** 3 routes
- **Shared Components:** 40+ components
- **UI Components:** 35+ ShadCN components
- **Services:** 12+ services
- **Guards/Resolvers:** 6+ guards, 8+ resolvers

### Technology Stack

| Category | Next.js | Angular |
|----------|---------|---------|
| **Framework** | Next.js 14.x | Angular 21.1.3 |
| **State Management** | Zustand | Signals |
| **Styling** | Tailwind 3.x | Tailwind 4.1.12 |
| **UI Library** | ShadCN | Angular Material |
| **SSR** | Built-in | Angular Universal |
| **Database** | Firebase 10.x | Firebase 12.8.0 |
| **Testing** | Jest (未實作) | Vitest 4.0.8 |

---

## ✅ Quality Assurance

### Documentation Quality
- **Coverage:** 100% (All phases documented)
- **Completeness:** ✅ All checklists provided
- **Actionable:** ✅ Code examples included
- **Traceable:** ✅ Cross-references complete

### Technical Accuracy
- **Angular 21 Compliance:** ✅ Verified
- **SSR Best Practices:** ✅ Applied
- **Signals Pattern:** ✅ Consistent
- **DDD Boundaries:** ✅ Respected

### Process Rigor
- **Mandatory Tools Used:**
  - ✅ Sequential-thinking (analysis)
  - ✅ Repomix (codebase analysis)
  - ✅ Software-planning-mcp (structured planning)
  - ✅ Context7 (best practices research)
  - ✅ Angular-cli (project analysis)

---

## 🎯 Usage Guide

### For Project Managers
1. Start with [Phase 1](./PHASE1_PRE_CONVERSION_INVENTORY.md) for scope understanding
2. Review [Phase 7](./PHASE7_SWITCH_DEPRECATION.md) for rollout strategy
3. Use phase estimates for timeline planning

### For Developers
1. Review [Phase 2](./PHASE2_NEXTJS_ARCHITECTURE_ANALYSIS.md) for architecture understanding
2. Study [Phase 3](./PHASE3_ANGULAR_TARGET_ARCHITECTURE.md) for target design
3. Follow [Phase 4](./PHASE4_FUNCTIONAL_MODULE_CONVERSION.md) for conversion patterns
4. Reference [Implementation Guide](./docs/NEXTJS_TO_ANGULAR_IMPLEMENTATION_GUIDE.md) for daily work

### For QA Engineers
1. Study [Phase 6](./PHASE6_VALIDATION_ALIGNMENT.md) for test strategy
2. Use behavior comparison checklists
3. Follow SEO and performance validation procedures

### For DevOps Engineers
1. Review [Phase 5](./PHASE5_SSR_ASYNC_EDGE_CASES.md) for SSR requirements
2. Study [Phase 7](./PHASE7_SWITCH_DEPRECATION.md) for deployment strategy
3. Set up monitoring and rollback procedures

---

## 📝 Maintenance

### Document Updates
- **Major:** Significant architecture changes (1.x → 2.x)
- **Minor:** New sections or phases (1.0 → 1.1)
- **Patch:** Corrections and clarifications (1.0.0 → 1.0.1)

**Current Version:** 1.0.0

### Feedback
For questions, corrections, or suggestions:
1. Create an issue in the repository
2. Tag with `documentation` and `migration`
3. Reference the specific phase document

---

## 🏆 Success Stories (To be added)

_After successful migration completion, add:_
- Migration completion date
- Final metrics achieved
- Lessons learned
- Team testimonials

---

## 📖 Appendix

### Glossary
- **CSR:** Client-Side Rendering
- **SSR:** Server-Side Rendering
- **SSG:** Static Site Generation
- **ISR:** Incremental Static Regeneration
- **LCP:** Largest Contentful Paint
- **FID:** First Input Delay
- **CLS:** Cumulative Layout Shift
- **TTFB:** Time to First Byte

### External Resources
- [Angular Official Docs](https://angular.dev)
- [Next.js Official Docs](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Angular Material](https://material.angular.io)

---

**Last Updated:** 2026-02-06  
**Version:** 1.0.0  
**Maintained By:** Migration Team  
**Status:** ✅ Complete and Ready for Implementation

---

**Navigation:**
- [→ Start with Phase 1](./PHASE1_PRE_CONVERSION_INVENTORY.md)
- [↑ Back to Next.js Docs Index](./docs/INDEX.md)
- [↑ Back to Main Documentation](../INDEX.md)
