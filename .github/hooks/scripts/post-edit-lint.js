#!/usr/bin/env node
/**
 * Post-edit ESLint hook: runs `npm run lint:fix` on modified TypeScript/JavaScript files.
 * Invoked by VS Code after each successful tool use via `.github/hooks/quality.json`.
 * Input: JSON payload via stdin (tool_name, tool_input fields).
 * Output: JSON with additionalContext when lint issues are found; exits 0 to remain non-blocking.
 */
'use strict';

const { spawnSync } = require('child_process');

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { raw += chunk; });
process.stdin.on('end', () => {
  try {
    const payload = JSON.parse(raw);
    const ti = payload.tool_input ?? {};

    // Collect modified file paths from various tool input shapes
    const allFiles = [
      ...[].concat(ti.files ?? []),
      ...(ti.path ? [ti.path] : []),
      ...(ti.filePath ? [ti.filePath] : []),
    ].map(String);

    const tsFiles = allFiles.filter((f) => /\.(ts|tsx|js|jsx)$/.test(f));
    if (!tsFiles.length) return;

    const result = spawnSync(
      'npx',
      ['eslint', '--fix', '--max-warnings=0', '--no-error-on-unmatched-pattern', ...tsFiles],
      { encoding: 'utf8', cwd: process.cwd() }
    );

    if (result.status !== 0 && result.stdout) {
      // Return lint feedback as additional context (non-blocking)
      process.stdout.write(
        JSON.stringify({
          hookSpecificOutput: {
            hookEventName: 'PostToolUse',
            additionalContext: `ESLint issues detected:\n${result.stdout.trim()}`,
          },
        }) + '\n'
      );
    }
  } catch (err) {
    // Non-blocking: do not fail the agent session on parse or execution errors
    process.stderr.write('post-edit-lint hook error: ' + (err instanceof Error ? err.message : String(err)) + '\n');
  }
});
