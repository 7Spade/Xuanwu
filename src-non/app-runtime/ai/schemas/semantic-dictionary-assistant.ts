import { z } from 'genkit';

/**
 * Module: semantic-dictionary-assistant schema
 * Purpose: Define AI contract for suggesting org semantic dictionary entries.
 * Responsibilities: Input/output schemas for task-type and skill-type draft generation.
 * Constraints: deterministic logic, respect module boundaries
 */

const minimumTierSchema = z.enum([
  'apprentice',
  'journeyman',
  'expert',
  'artisan',
  'grandmaster',
  'legendary',
  'titan',
]);

export const SuggestSemanticDraftInputSchema = z.object({
  orgId: z.string().min(1),
  userPrompt: z.string().min(1),
  existingTaskTypeSlugs: z.array(z.string()).default([]),
  existingSkillTypeSlugs: z.array(z.string()).default([]),
});

export const SuggestedTaskSkillRequirementSchema = z.object({
  tagSlug: z.string().min(1),
  minimumTier: minimumTierSchema,
  quantity: z.number().int().min(1).max(99),
  minXp: z.number().int().min(0).optional(),
});

export const SuggestTaskTypeDraftOutputSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  aliases: z.array(z.string()).default([]),
  description: z.string().optional(),
  requiredSkills: z.array(SuggestedTaskSkillRequirementSchema).default([]),
});

export const SuggestSkillTypeDraftOutputSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  aliases: z.array(z.string()).default([]),
  description: z.string().optional(),
});

export type SuggestSemanticDraftInput = z.infer<typeof SuggestSemanticDraftInputSchema>;
export type SuggestTaskTypeDraftOutput = z.infer<typeof SuggestTaskTypeDraftOutputSchema>;
export type SuggestSkillTypeDraftOutput = z.infer<typeof SuggestSkillTypeDraftOutputSchema>;
