/**
 * Module: post.machine.ts
 * Purpose: L6 Post aggregate state machine specification (shared-kernel)
 * Responsibilities: define status enum, transition table, and pure transition guard
 * Constraints: NO I/O, NO async, NO side effects — pure state transition rules only
 *
 * Per docs/architecture/models/domain-model.md §Aggregate 2 Post.
 */

// ─── State ────────────────────────────────────────────────────────────────────

/**
 * L6 canonical status values for the Post aggregate.
 * Maps directly to docs/architecture/models/domain-model.md §Aggregate 2.
 */
export type PostStatus =
  | 'draft'     // Author is composing; not visible to others
  | 'published' // Visible in feeds and search
  | 'archived'; // Removed from active feed; retained for record

// ─── Event ────────────────────────────────────────────────────────────────────

export type PostEvent =
  | 'PUBLISH'  // draft → published
  | 'ARCHIVE'; // published → archived

// ─── Transition table ─────────────────────────────────────────────────────────

const POST_TRANSITIONS: Record<PostStatus, readonly PostStatus[]> = {
  draft:     ['published'],
  published: ['archived'],
  archived:  [],
};

// ─── Guard ────────────────────────────────────────────────────────────────────

export const POST_INVALID_TRANSITION = 'POST_INVALID_TRANSITION' as const;

export interface PostTransitionResult {
  readonly ok: boolean;
  readonly next?: PostStatus;
  readonly error?: typeof POST_INVALID_TRANSITION;
}

export function transitionPost(
  current: PostStatus,
  target: PostStatus,
): PostTransitionResult {
  const allowed = POST_TRANSITIONS[current];
  if (allowed.includes(target)) {
    return { ok: true, next: target };
  }
  return { ok: false, error: POST_INVALID_TRANSITION };
}

export function canTransitionPost(current: PostStatus, target: PostStatus): boolean {
  return POST_TRANSITIONS[current].includes(target);
}
