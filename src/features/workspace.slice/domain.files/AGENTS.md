# AGENTS.md (workspace.slice/domain.files)

Instructions for file governance and parser handoff in `src/features/workspace.slice/domain.files/`.

## Inheritance
- Inherit from `src/features/AGENTS.md`, `src/AGENTS.md`, root `AGENTS.md`, and `.github/copilot-instructions.md`.

## Role
- Role: `Workspace Files Boundary Owner`.

## Core Responsibility
- `DOCUMENT-AI` responsibility in this domain:
  - Input: original document version (PDF/PNG/JPG).
  - Output: structured sidecar JSON (`*.document-ai.json`).
  - Rule: `DOCUMENT-AI` is the producer of `.json`.
- `GENKIT-AI` responsibility in this domain:
  - Input: existing `*.document-ai.json`.
  - Output: parser handoff for semantic tagging/import flow.
  - Rule: `GENKIT-AI` is the consumer of `.json`, not the producer.

## Contract Rules
- Files actions must preserve explicit `parseMode` and `sourceType`.
- `document-ai` handoff sourceType must be `original`.
- `genkit-ai` handoff sourceType must be `structured-sidecar`.
- Keep file/version/source pointer fields (`fileId`, `versionId`, `storagePath`, `downloadURL`) complete and deterministic.

## Forbidden
- Do not collapse `DOCUMENT-AI` and `GENKIT-AI` into one undifferentiated action path.
- Do not treat sidecar JSON as raw upload input for OCR.
- Do not trigger `GENKIT-AI` from raw files when no `*.document-ai.json` exists.
- Do not bypass `useWorkspaceFilesActions` contract with ad-hoc router pushes.

## Verification
- Validate from UI flow: `Workspaces -> Files -> Actions`.
- `document-ai` must create/update `*.document-ai.json`.
- `genkit-ai` must use `*.document-ai.json` as input.
