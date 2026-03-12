/**
 * Module: i-ai-service-adapter.ts
 * Purpose: define SK_PORTS AiServiceAdapter interface in shared-kernel (L9)
 * Responsibilities: abstract AI/ML suggestion capabilities used by domain services
 * Constraints: deterministic logic, no infrastructure imports, respect module boundaries
 *
 * Per docs/architecture/guidelines/infrastructure-spec.md §8 AiServiceAdapter.
 */

export interface SkillSuggestion {
  /** Tag slug of the suggested skill. */
  readonly skillId: string;
  /** Suggested minimum proficiency tier for the task. */
  readonly minimumTier: number;
  /** Confidence score [0, 1]. */
  readonly confidence: number;
}

export interface AiServiceAdapter {
  /**
   * Suggest skill requirements for a task given its description and organisational context.
   * Used by the workspace application service when creating TaskItems without explicit skill requirements.
   *
   * @param taskDescription - Free-text description of the task.
   * @param orgId - Organisation identifier (for org-specific skill vocabularies).
   * @returns Ordered list of skill suggestions (highest confidence first).
   */
  suggestSkillRequirements(
    taskDescription: string,
    orgId: string,
  ): Promise<SkillSuggestion[]>;
}
