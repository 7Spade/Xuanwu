# AGENTS.md (workspace.slice/domain.files)

Instructions for file governance and parser handoff in `src/features/workspace.slice/domain.files/`.

## Inheritance
- Inherit from `src/features/AGENTS.md`, `src/AGENTS.md`, root `AGENTS.md`, and `.github/copilot-instructions.md`.

## Role
- Role: `Workspace Files Boundary Owner`.

## Core Responsibility
- `DOCUMENT-AI` responsibility in this domain:
  - Trigger OCR/Document extraction flow from the selected original file version.
  - Produce/track structured sidecar output (`*.document-ai.json`) as a derived artifact.
- `GENKIT-AI` responsibility in this domain:
  - Do NOT run OCR directly from raw files.
  - Hand off existing structured sidecar (`*.document-ai.json`) context to parser flow for semantic enrichment.

## Contract Rules
- Files actions must preserve explicit `parseMode` and `sourceType`.
- `document-ai` handoff sourceType must be `original`.
- `genkit-ai` handoff sourceType must be `structured-sidecar`.
- Keep file/version/source pointer fields (`fileId`, `versionId`, `storagePath`, `downloadURL`) complete and deterministic.

## Forbidden
- Do not collapse `DOCUMENT-AI` and `GENKIT-AI` into one undifferentiated action path.
- Do not treat sidecar JSON as raw upload input for OCR.
- Do not bypass `useWorkspaceFilesActions` contract with ad-hoc router pushes.

## Verification
- Validate from UI flow: `Workspaces -> Files -> Actions`.
- `document-ai` should enter OCR extraction path.
- `genkit-ai` should use structured JSON context for AI tagging/enrichment flow.
