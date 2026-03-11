This file is a merged representation of a subset of the codebase, containing specifically included files and files not matching ignore patterns, combined into a single document by Repomix.
The content has been processed where comments have been removed, empty lines have been removed, content has been compressed (code blocks are separated by ⋮---- delimiter).

# Summary

## Purpose

This is a reference codebase organized into multiple files for AI consumption.
It is designed to be easily searchable using grep and other text-based tools.

## File Structure

This skill contains the following reference files:

| File | Contents |
|------|----------|
| `project-structure.md` | Directory tree with line counts per file |
| `files.md` | All file contents (search with `## File: <path>`) |
| `tech-stack.md` | Languages, frameworks, and dependencies |
| `summary.md` | This file - purpose and format explanation |

## Usage Guidelines

- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

- Pay special attention to the Repository Instruction. These contain important context and guidelines specific to this project.

## Notes

- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: src/**, functions/src/**, docs/architecture/**, .serena/memories/repo/**, .github/skills/xuanwu-skill/**, README.md, package.json, tsconfig.json, vite.config.ts, components.json, docs/repomix-instruction.md
- Files matching these patterns are excluded: **/routeTree.gen.ts, **/project.inlang/cache/**, **/.output/**, **/dist/**, **/build/**, **/out/**, **/coverage/**, **/*.log, firebase-debug.log, firebase-debug.*.log
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Code comments have been removed from supported file types
- Empty lines have been removed from all files
- Content has been compressed - code blocks are separated by ⋮---- delimiter
- Files are sorted by Git change count (files with more changes are at the bottom)

## Statistics

157 files | 7,501 lines

| Language | Files | Lines |
|----------|------:|------:|
| TypeScript (TSX) | 69 | 805 |
| Markdown | 53 | 5,999 |
| TypeScript | 31 | 520 |
| JSON | 3 | 173 |
| CSS | 1 | 4 |

**Largest files:**
- `docs/architecture/use-cases/use-case-diagram-resource.md` (509 lines)
- `docs/architecture/use-cases/use-case-diagram-sub-resource.md` (405 lines)
- `docs/architecture/guidelines/infrastructure-spec.md` (298 lines)
- `docs/architecture/use-cases/use-case-diagram-sub-behavior.md` (297 lines)
- `docs/architecture/use-cases/use-case-diagram-workspace.md` (286 lines)
- `docs/architecture/models/domain-model.md` (280 lines)
- `README.md` (260 lines)
- `docs/architecture/specs/resource-relationship-graph.md` (232 lines)
- `docs/architecture/use-cases/use-case-diagram-saas-basic.md` (198 lines)
- `docs/architecture/specs/scheduling-assignment-architecture.md` (196 lines)