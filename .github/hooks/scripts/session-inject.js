#!/usr/bin/env node
/**
 * Session start hook: injects Xuanwu project context into the agent session.
 * Invoked by VS Code when a new agent session begins via `.github/hooks/session.json`.
 * Input: JSON payload via stdin (SessionStart fields).
 * Output: JSON with additionalContext containing architecture SSOT references and available MCP servers.
 */
'use strict';

const { existsSync } = require('fs');
const { join } = require('path');

const cwd = process.cwd();

const kgExists = existsSync(join(cwd, '.memory', 'knowledge-graph.json'));
const ssotExists = existsSync(join(cwd, 'docs', 'architecture', '00-logic-overview.md'));

const context = [
  '## Xuanwu Project Context',
  '',
  '### SSOT References',
  `- Architecture SSOT: docs/architecture/00-logic-overview.md${ssotExists ? ' ✓' : ' (missing)'}`,
  `- Entity semantics: .memory/knowledge-graph.json${kgExists ? ' ✓' : ' (missing)'}`,
  '- Skills index: .github/skills/',
  '- Verify: npm run check  (lint + typecheck)',
  '- Dev server: npm run dev  (localhost:9002, Turbopack)',
  '- Local agents: .github/agents/',
  '',
  '### Knowledge Graph & Memory Workflow',
  '- ALWAYS query .memory/knowledge-graph.json via `memory-search_nodes` at session start before reasoning.',
  '- Persist new discoveries with `memory-create_entities`, `memory-add_observations`, `memory-create_relations`.',
  '- Use `store_memory` (VS Code built-in) to persist naming conventions, patterns, and architectural decisions across sessions.',
  '- Remove stale facts with `memory-delete_entities` or `memory-delete_observations` when contradicted.',
  '',
  '### Code Intelligence (Serena)',
  '- Use `serena/*` tools for symbol search, cross-file references, and code navigation before making changes.',
  '- `serena-find_symbol`: locate classes, functions, variables by name pattern.',
  '- `serena-find_referencing_symbols`: trace callers and usages of a symbol.',
  '- `serena-get_symbols_overview`: understand file structure before editing.',
  '- `serena-search_for_pattern`: find code patterns across the codebase.',
  '',
  '### Repomix and Codebase Skill',
  '- Use `repomix-grep_repomix_output` on `.github/skills/xuanwu-skill/SKILL.md` for broad codebase searches.',
  '- After major codebase changes, regenerate the skill: `repomix-generate_skill({ directory: "<repo-root>", skillName: "xuanwu-skill" })`.',
  '- Prefer xuanwu-skill as first-stop reference for project structure and patterns.',
  '',
  '### Validate Before Implement',
  '- Confirm architecture correctness and slice boundaries before writing any code.',
  '- Read SSOT documents first, then existing patterns, then implement the minimal correct diff.',
  '',
  '### Available MCP Servers',
  '| Server | Tool prefix | Primary use |',
  '|--------|-------------|-------------|',
  '| Firebase | firebase-mcp-server/* | Firebase project, Firestore, Auth, App Hosting |',
  '| Vercel | vercel/* | Deployment and edge-function operations |',
  '| Everything | everything/* | General-purpose MCP protocol testing |',
  '| Filesystem | filesystem/* | Local file read/write |',
  '| Memory | memory/* | Knowledge graph (.memory/knowledge-graph.json) |',
  '| Sequential Thinking | sequential-thinking/* | Step-by-step structured reasoning |',
  '| Software Planning | software-planning/* | Implementation plan and todo tracking |',
  '| Context7 | context7/* | Version-accurate framework/library docs |',
  '| Markitdown | markitdown/* | Convert URLs/files to Markdown |',
  '| Playwright | playwright/* | Browser automation and E2E testing |',
  '| Chrome DevTools | chrome-devtools/* | Browser diagnostics and DOM inspection |',
  '| ESLint | eslint/* | Static code analysis |',
  '| Next.js DevTools | next-devtools/* | Next.js dev-server diagnostics |',
  '| shadcn/ui | shadcn/* | Component registry and add commands |',
  '| SonarQube | sonarqube/* | Code quality gates and security hotspots |',
  '| Codacy | codacy/* | Code quality and security review |',
  '| Repomix | repomix/* | Pack repository for AI analysis |',
  '| Serena | serena/* | Code intelligence: symbols, references, refactoring |',
].join('\n');

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: context,
    },
  }) + '\n'
);
