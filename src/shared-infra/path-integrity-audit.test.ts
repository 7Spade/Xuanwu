/**
 * Module: path-integrity-audit.test
 * Purpose: Enforce import path integrity and architectural boundary rules across the project
 * Responsibilities: detect broken paths (PI-1/PI-4), cross-slice leaks (PI-2/D2), alias violations (PI-3)
 * Constraints: deterministic logic, respect module boundaries
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

import { describe, expect, it } from 'vitest';

// ─── Constants ────────────────────────────────────────────────────────────────

const PROJECT_ROOT = path.resolve(process.cwd());
const SRC_ROOT = path.join(PROJECT_ROOT, 'src');
const FEATURES_ROOT = path.join(SRC_ROOT, 'features');

/**
 * Directories excluded from scanning:
 * - Firebase Functions: has its own tsconfig and runtime, excluded from project tsconfig
 * - node_modules, .next, dist: build/dependency artifacts
 */
const EXCLUDED_DIRS = new Set(['node_modules', '.next', '.git', 'dist', 'build', 'functions']);

/**
 * Path aliases from tsconfig.json paths configuration.
 * Ordered by specificity (most specific first) to prevent partial matches.
 */
const TSCONFIG_ALIAS_MAP: Array<{ alias: string; target: string }> = [
  { alias: '@/shadcn-ui/lib/utils', target: 'src/lib-ui/shadcn-ui/utils/utils' },
  { alias: '@/shadcn-ui/hooks', target: 'src/lib-ui/shadcn-ui/hooks' },
  { alias: '@/shadcn-ui', target: 'src/lib-ui/shadcn-ui' },
  { alias: '@/lib-ui', target: 'src/lib-ui' },
  { alias: '@/', target: 'src/' },
];

// ─── Utilities ────────────────────────────────────────────────────────────────

/** Normalize path separators to forward-slashes for cross-platform stability. */
function normalizePath(p: string): string {
  return p.replace(/\\/g, '/');
}

/** Recursively collect all .ts/.tsx source files, skipping excluded directories. */
function collectSourceFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDED_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(full));
    } else if (
      (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) &&
      !entry.name.endsWith('.d.ts')
    ) {
      files.push(full);
    }
  }
  return files;
}

/**
 * Try to resolve an absolute path to an existing file by appending common
 * TypeScript/JavaScript extensions and index file variants.
 */
function resolveToExistingFile(absPath: string): string | null {
  const candidates = [
    absPath,
    `${absPath}.ts`,
    `${absPath}.tsx`,
    `${absPath}.js`,
    `${absPath}.jsx`,
    path.join(absPath, 'index.ts'),
    path.join(absPath, 'index.tsx'),
    path.join(absPath, 'index.js'),
    path.join(absPath, 'index.jsx'),
  ];
  for (const candidate of candidates) {
    try {
      const stat = fs.statSync(candidate);
      if (stat.isFile()) return candidate;
    } catch {
      // File does not exist at this path
    }
  }
  return null;
}

/** Resolve a relative import path from a given source file to an absolute path. */
function resolveRelativeImport(importPath: string, fromFile: string): string | null {
  const dir = path.dirname(fromFile);
  const absPath = path.resolve(dir, importPath);
  return resolveToExistingFile(absPath);
}

/** Resolve an @/ alias import to an absolute filesystem path. */
function resolveAliasImport(importPath: string): string | null {
  for (const { alias, target } of TSCONFIG_ALIAS_MAP) {
    if (importPath === alias) {
      return resolveToExistingFile(path.join(PROJECT_ROOT, target));
    }
    const prefix = alias.endsWith('/') ? alias : `${alias}/`;
    if (importPath.startsWith(prefix)) {
      const rest = importPath.slice(prefix.length);
      const targetBase = target.endsWith('/') ? target : `${target}/`;
      return resolveToExistingFile(path.join(PROJECT_ROOT, targetBase + rest));
    }
  }
  return null;
}

/**
 * Strip block and line comments from TypeScript/JavaScript source content.
 * This avoids false-positive matches on import paths that appear only in
 * JSDoc examples or inline comments.
 *
 * NOTE: This is a pragmatic regex-based approach sufficient for catching
 * real broken import paths. It does not handle edges like slash-star inside
 * string literals. Use a full AST parser if higher precision is required.
 */
function stripComments(content: string): string {
  // Remove block comments (/** ... */ and /* ... */)
  let result = content.replace(/\/\*[\s\S]*?\*\//g, '');
  // Remove single-line comments (// ...)
  result = result.replace(/\/\/[^\n]*/g, '');
  return result;
}

/**
 * Extract the static string value of each "from '...'" clause in a source file.
 * Handles both single and double quotes. Comments are stripped first to avoid
 * matching paths that appear only in JSDoc examples or inline comments.
 *
 * NOTE: Dynamic imports (import('path')) are intentionally excluded. This
 * scanner targets only static "from" clauses, which are the source of import
 * path regressions under refactoring.
 */
function extractImportPaths(content: string): string[] {
  const results: string[] = [];
  const stripped = stripComments(content);
  // Match: import ... from '...' / import ... from "..."
  // Also match: export ... from '...' / export ... from "..."
  const re = /\bfrom\s+(['"])([^'"]+)\1/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(stripped)) !== null) {
    results.push(m[2]);
  }
  return results;
}

/** Count leading "../" segments in a relative import path. */
function countParentTraversals(importPath: string): number {
  let count = 0;
  let rest = importPath;
  while (rest.startsWith('../')) {
    count++;
    rest = rest.slice(3);
  }
  return count;
}

/**
 * Return the feature slice name if the file belongs to one,
 * or null if it is outside src/features/*.slice/.
 */
function getSliceOwner(filePath: string): string | null {
  const rel = normalizePath(path.relative(FEATURES_ROOT, filePath));
  if (rel.startsWith('..')) return null;
  const parts = rel.split('/');
  return parts[0] && parts[0].endsWith('.slice') ? parts[0] : null;
}

// ─── Module-level patterns ─────────────────────────────────────────────────────

/**
 * Pattern to detect cross-slice imports: @/features/<slice>/<sub-path>.
 * Defined at module level for reuse and documentation of the D2 detection logic.
 */
const CROSS_SLICE_INTERNAL_PATTERN = /@\/features\/([^/'"]+\.slice)\/([^'"]+)/g;

/**
 * Next.js App Router entry files that make a parallel route slot valid.
 * A slot directory containing at least one of these is considered non-empty.
 */
const SLOT_ENTRY_FILES = new Set([
  'page.tsx',
  'page.ts',
  'layout.tsx',
  'layout.ts',
  'default.tsx',
  'default.ts',
]);

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const ALL_SOURCE_FILES = collectSourceFiles(SRC_ROOT);

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('[Path Integrity] Import path audit', () => {
  /**
   * [PI-1] Relative imports must resolve to existing files.
   *
   * A relative import like "from '../../utils'" is a broken path if no
   * corresponding file exists at the resolved location.
   */
  it('[PI-1] all relative imports resolve to existing files', () => {
    const violations: string[] = [];

    for (const file of ALL_SOURCE_FILES) {
      const content = fs.readFileSync(file, 'utf8');
      const imports = extractImportPaths(content);

      for (const importPath of imports) {
        if (!importPath.startsWith('.')) continue;
        const resolved = resolveRelativeImport(importPath, file);
        if (!resolved) {
          const relFile = normalizePath(path.relative(PROJECT_ROOT, file));
          violations.push(`${relFile}: from '${importPath}'`);
        }
      }
    }

    if (violations.length > 0) {
      console.error('[PI-1] Broken relative imports:\n', violations.join('\n'));
    }
    expect(violations).toEqual([]);
  });

  /**
   * [PI-4] @/ alias imports must resolve to existing files.
   *
   * An @/ alias import is broken if it does not resolve to an existing file
   * after applying the tsconfig.json path alias substitution.
   */
  it('[PI-4] all @/ alias imports resolve to existing files', () => {
    const violations: string[] = [];

    for (const file of ALL_SOURCE_FILES) {
      const content = fs.readFileSync(file, 'utf8');
      const imports = extractImportPaths(content);

      for (const importPath of imports) {
        if (!importPath.startsWith('@/')) continue;
        const resolved = resolveAliasImport(importPath);
        if (!resolved) {
          const relFile = normalizePath(path.relative(PROJECT_ROOT, file));
          violations.push(`${relFile}: from '${importPath}'`);
        }
      }
    }

    if (violations.length > 0) {
      console.error('[PI-4] Broken @/ alias imports:\n', violations.join('\n'));
    }
    expect(violations).toEqual([]);
  });

  /**
   * [PI-2] Feature slices must not import other slices' internal modules (Rule D2).
   *
   * Cross-slice references must go through the target slice's root index.ts.
   * Import pattern @/features/<sliceB>/<any-internal-path> from within <sliceA>
   * violates the VSA (Vertical Slice Architecture) isolation principle.
   *
   * Allowed:   from '@/features/workspace.slice'
   * Violation: from '@/features/workspace.slice/domain.tasks/_types'
   */
  it('[PI-2] feature slices only reference other slices via their public index (D2)', () => {
    const violations: string[] = [];

    for (const file of ALL_SOURCE_FILES) {
      const ownerSlice = getSliceOwner(file);
      if (!ownerSlice) continue; // Only check files within feature slices

      const content = fs.readFileSync(file, 'utf8');
      let m: RegExpExecArray | null;
      // Create a fresh regex per file to avoid lastIndex carry-over from the module-level pattern
      const re = new RegExp(CROSS_SLICE_INTERNAL_PATTERN.source, CROSS_SLICE_INTERNAL_PATTERN.flags);

      while ((m = re.exec(content)) !== null) {
        const targetSlice = m[1];
        const subPath = m[2];

        // Same slice: allowed
        if (targetSlice === ownerSlice) continue;

        // External slice accessed via root index only: allowed
        // Violation: any sub-path that is not just 'index' or empty
        if (subPath && subPath !== 'index') {
          const relFile = normalizePath(path.relative(PROJECT_ROOT, file));
          violations.push(
            `${relFile}: [${ownerSlice}] imports internals of [${targetSlice}] via '@/features/${targetSlice}/${subPath}'`,
          );
        }
      }
    }

    if (violations.length > 0) {
      console.error('[PI-2] Cross-slice boundary violations (D2):\n', violations.join('\n'));
    }
    expect(violations).toEqual([]);
  });

  /**
   * [PI-3] Imports using 4 or more parent traversals (../../../../) should use @/ aliases.
   *
   * Deep relative paths are fragile under directory restructuring and indicate a
   * missed opportunity to use the project's path alias configuration.
   * Use the @/ alias instead of traversing 4+ levels.
   */
  it('[PI-3] no imports use 4 or more parent traversal levels (use @/ alias instead)', () => {
    const violations: string[] = [];

    for (const file of ALL_SOURCE_FILES) {
      const content = fs.readFileSync(file, 'utf8');
      const imports = extractImportPaths(content);

      for (const importPath of imports) {
        if (!importPath.startsWith('../')) continue;
        const depth = countParentTraversals(importPath);
        if (depth >= 4) {
          const relFile = normalizePath(path.relative(PROJECT_ROOT, file));
          violations.push(`${relFile}: from '${importPath}' (depth ${depth})`);
        }
      }
    }

    if (violations.length > 0) {
      console.error('[PI-3] Excessive relative path depth (use @/ alias):\n', violations.join('\n'));
    }
    expect(violations).toEqual([]);
  });
});

describe('[Path Integrity] Parallel route slot integrity', () => {
  /**
   * [PI-5] Next.js parallel route slot directories must contain a page or layout file.
   *
   * Directories under @modal, @sidebar, @businesstab etc. that have been
   * moved or left empty after a refactor are a common source of Next.js build errors.
   */
  it('[PI-5] Next.js parallel route slots contain at least one valid entry file', () => {
    const appDir = path.join(SRC_ROOT, 'app');
    if (!fs.existsSync(appDir)) return;

    const violations: string[] = [];
    const SLOT_PATTERN = /^@/;

    function scanForSlots(dir: string): void {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === 'node_modules' || entry.name === '.next') continue;
        const full = path.join(dir, entry.name);
        if (!entry.isDirectory()) continue;

        if (SLOT_PATTERN.test(entry.name)) {
          // This is a parallel route slot: must contain at least one valid entry file
          const children = fs.readdirSync(full, { withFileTypes: true });
          const hasEntry = children.some(
            (child) => child.isFile() && SLOT_ENTRY_FILES.has(child.name),
          );
          const hasSubDirWithEntry = children.some((child) => {
            if (!child.isDirectory()) return false;
            try {
              return fs
                .readdirSync(path.join(full, child.name), { withFileTypes: true })
                .some((c) => c.isFile() && SLOT_ENTRY_FILES.has(c.name));
            } catch {
              return false;
            }
          });
          if (!hasEntry && !hasSubDirWithEntry) {
            violations.push(normalizePath(path.relative(PROJECT_ROOT, full)));
          }
        }

        scanForSlots(full);
      }
    }

    scanForSlots(appDir);

    if (violations.length > 0) {
      console.error('[PI-5] Empty parallel route slot directories:\n', violations.join('\n'));
    }
    expect(violations).toEqual([]);
  });
});
