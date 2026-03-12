/**
 * semantic-graph.slice/core/tags/_actions.ts
 *
 * CTA (Centralized Tag Authority) — CRUD operations for tag management. [D3]
 *
 * Layer: Application Layer — all tag entity mutations are funnelled here.
 *
 * [D3]  All entity mutations MUST go through this file (side-effect funnel).
 * [D8]  Pure validation logic resides in _aggregate.ts; no Firestore calls there.
 * [D21] Tag categories are governed by VS8 (semantic-graph.slice owns authority).
 * [D26] This file is the CTA write gate; slices MUST NOT write tags elsewhere.
 *
 * Per docs/architecture/README.md:
 *   Application Layer orchestrates domain logic and calls infrastructure via ports.
 *   No direct firebase/* imports here — infrastructure delegation is through the
 *   gateway-command channel (infra.gateway-command).
 */

import { commandSuccess, commandFailureFrom } from '@/shared-kernel';
import type { CommandResult } from '@/shared-kernel';
import type {
  CentralizedTagEntry,
  TagCategory,
  CentralizedTagDeleteRule,
} from '@/shared-kernel';

// ─── Input shapes ─────────────────────────────────────────────────────────────

export interface CreateTagInput {
  readonly tagSlug: string;
  readonly label: string;
  readonly category: TagCategory;
  readonly deleteRule?: CentralizedTagDeleteRule;
  readonly createdBy: string;
}

export interface UpdateTagInput {
  readonly label?: string;
  readonly category?: TagCategory;
  readonly deleteRule?: CentralizedTagDeleteRule;
}

// ─── In-memory store (progressive migration stub) ────────────────────────────
// NOTE: This in-memory store supports the progressive DDD migration.
// Replace with a Firestore-backed repository once the ITagRepository port is wired.
const inMemoryTagStore = new Map<string, CentralizedTagEntry>();

/** Returns the current UTC timestamp as an ISO 8601 string. */
function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

// ─── CTA CRUD operations ──────────────────────────────────────────────────────

/**
 * Creates a new centralized tag entry.
 *
 * Returns `{ success: false }` if a tag with the same slug already exists.
 */
export async function createTag(
  input: CreateTagInput
): Promise<CommandResult> {
  try {
    if (inMemoryTagStore.has(input.tagSlug)) {
      return commandFailureFrom(new Error(`Tag '${input.tagSlug}' already exists`));
    }
    const now = getCurrentTimestamp();
    const entry: CentralizedTagEntry = {
      tagSlug: input.tagSlug,
      label: input.label,
      category: input.category,
      deleteRule: input.deleteRule ?? 'block',
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
    };
    inMemoryTagStore.set(input.tagSlug, entry);
    return commandSuccess(input.tagSlug);
  } catch (err) {
    return commandFailureFrom(err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * Updates an existing tag's mutable fields.
 *
 * Returns `{ success: false }` if the tag does not exist.
 */
export async function updateTag(
  tagSlug: string,
  changes: UpdateTagInput
): Promise<CommandResult> {
  try {
    const existing = inMemoryTagStore.get(tagSlug);
    if (!existing) {
      return commandFailureFrom(new Error(`Tag '${tagSlug}' not found`));
    }
    const updated: CentralizedTagEntry = {
      ...existing,
      ...(changes.label !== undefined && { label: changes.label }),
      ...(changes.category !== undefined && { category: changes.category }),
      ...(changes.deleteRule !== undefined && { deleteRule: changes.deleteRule }),
      updatedAt: getCurrentTimestamp(),
    };
    inMemoryTagStore.set(tagSlug, updated);
    return commandSuccess(tagSlug);
  } catch (err) {
    return commandFailureFrom(err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * Marks a tag as deprecated with an optional replacement slug.
 *
 * Returns `{ success: false }` if the tag does not exist.
 */
export async function deprecateTag(
  tagSlug: string,
  replacedByTagSlug?: string
): Promise<CommandResult> {
  try {
    const existing = inMemoryTagStore.get(tagSlug);
    if (!existing) {
      return commandFailureFrom(new Error(`Tag '${tagSlug}' not found`));
    }
    const now = getCurrentTimestamp();
    const updated: CentralizedTagEntry = {
      ...existing,
      deprecatedAt: now,
      ...(replacedByTagSlug !== undefined && { replacedByTagSlug }),
      updatedAt: now,
    };
    inMemoryTagStore.set(tagSlug, updated);
    return commandSuccess(tagSlug);
  } catch (err) {
    return commandFailureFrom(err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * Deletes a tag entry.
 *
 * Returns `{ success: false }` if the tag does not exist.
 */
export async function deleteTag(tagSlug: string): Promise<CommandResult> {
  try {
    if (!inMemoryTagStore.has(tagSlug)) {
      return commandFailureFrom(new Error(`Tag '${tagSlug}' not found`));
    }
    inMemoryTagStore.delete(tagSlug);
    return commandSuccess(tagSlug);
  } catch (err) {
    return commandFailureFrom(err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * Retrieves a tag entry by its slug.
 *
 * Returns the entry or `null` if not found.
 */
export async function getTag(tagSlug: string): Promise<CentralizedTagEntry | null> {
  return inMemoryTagStore.get(tagSlug) ?? null;
}
