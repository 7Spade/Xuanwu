/**
 * Module: eslint.config.test.ts
 * Purpose: verify the repository ESLint flat config loads successfully
 * Responsibilities: exercise CLI config resolution and guard against circular-config regressions
 * Constraints: deterministic logic, respect module boundaries
 */

import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");
const eslintBinary = path.join(repoRoot, "node_modules", ".bin", "eslint");

describe("eslint.config.mts", () => {
  it("loads the flat config without circular structure errors", () => {
    const printedConfig = execFileSync(
      eslintBinary,
      ["--print-config", "src/app/layout.tsx"],
      {
        cwd: repoRoot,
        encoding: "utf8",
      },
    );

    expect(printedConfig).toContain("\"import/order\"");
    expect(printedConfig).toContain("\"@next/next/no-html-link-for-pages\"");
  });
});
