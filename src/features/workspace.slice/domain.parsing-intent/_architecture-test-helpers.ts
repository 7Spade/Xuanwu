/**
 * Module: _architecture-test-helpers
 * Purpose: File scanning helpers for architecture compliance tests
 * Responsibilities: source file discovery and direct Firebase import detection
 * Constraints: deterministic logic, respect module boundaries
 */

import * as fs from 'node:fs';

/** Recursively collect all .ts/.tsx source files under a directory, excluding tests and node_modules. */
export function collectSourceFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.name === 'node_modules') continue;
    const full = `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(full));
    } else if (
      (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) &&
      !entry.name.endsWith('.test.ts') &&
      !entry.name.endsWith('.test.tsx') &&
      !entry.name.endsWith('.d.ts')
    ) {
      files.push(full);
    }
  }
  return files;
}

/** Returns files that import directly from 'firebase/firestore' or 'firebase/app'. */
export function findDirectFirebaseImports(dir: string): string[] {
  return collectSourceFiles(dir).filter((file) => {
    const content = fs.readFileSync(file, 'utf8');
    return (
      /from ['"]firebase\/firestore['"]/.test(content) ||
      /from ['"]firebase\/app['"]/.test(content)
    );
  });
}
