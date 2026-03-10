#!/usr/bin/env node
/**
 * Session start hook: injects Xuanwu project context into the agent session.
 * Invoked by VS Code when a new agent session begins via `.github/hooks/session.json`.
 * Input: JSON payload via stdin (SessionStart fields).
 * Output: JSON with additionalContext containing architecture SSOT references.
 */
'use strict';

const { existsSync } = require('fs');
const { join } = require('path');

const cwd = process.cwd();

const kgExists = existsSync(join(cwd, '.memory', 'knowledge-graph.json'));
const ssotExists = existsSync(join(cwd, 'docs', 'architecture', '00-logic-overview.md'));

const context = [
  '## Xuanwu Project Context',
  `- Architecture SSOT: docs/architecture/00-logic-overview.md${ssotExists ? ' ✓' : ' (missing)'}`,
  `- Entity semantics: .memory/knowledge-graph.json${kgExists ? ' ✓' : ' (missing)'}`,
  '- Skills index: .github/skills/',
  '- Verify: npm run check  (lint + typecheck)',
  '- Dev server: npm run dev  (localhost:9002, Turbopack)',
  '- Local agents: .github/agents/',
  '- Agent plugins: manage through VS Code plugin settings, not .github/agents/ subfolders',
].join('\n');

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: context,
    },
  }) + '\n'
);
