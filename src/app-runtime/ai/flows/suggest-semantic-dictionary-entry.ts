'use server';

/**
 * Module: suggest-semantic-dictionary-entry
 * Purpose: Generate draft task-type and skill-type entries for org semantic dictionary.
 * Responsibilities: Invoke Genkit prompts and normalize AI output into safe draft values.
 * Constraints: deterministic logic, respect module boundaries
 */

import { type z } from 'genkit';

import { ai } from '@/app-runtime/ai/genkit';
import {
  SuggestSemanticDraftInputSchema,
  SuggestSkillTypeDraftOutputSchema,
  SuggestTaskTypeDraftOutputSchema,
  type SuggestSkillTypeDraftOutput,
  type SuggestTaskTypeDraftOutput,
} from '@/app-runtime/ai/schemas/semantic-dictionary-assistant';

const slugTokenPattern = /[^a-z0-9-]/g;

function normalizeSlugToken(input: string, fallback: string): string {
  const normalized = input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/_+/g, '-')
    .replace(slugTokenPattern, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return normalized || fallback;
}

function ensureUniqueSlug(candidate: string, existing: Set<string>): string {
  if (!existing.has(candidate)) return candidate;
  let suffix = 2;
  while (existing.has(`${candidate}-${suffix}`)) {
    suffix += 1;
  }
  return `${candidate}-${suffix}`;
}

function normalizeAliases(input: string[] | undefined): string[] {
  if (!input) return [];
  const seen = new Set<string>();
  const aliases: string[] = [];
  for (const alias of input) {
    const normalized = alias.trim();
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    aliases.push(normalized);
  }
  return aliases;
}

function normalizeTaskDraft(
  orgId: string,
  draft: SuggestTaskTypeDraftOutput,
  existingTaskTypeSlugs: string[]
): SuggestTaskTypeDraftOutput {
  const existing = new Set(existingTaskTypeSlugs);
  const slugBody = normalizeSlugToken(draft.slug || draft.name, 'custom-task');
  const fullSlug = ensureUniqueSlug(`org:${orgId}:task-type:${slugBody}`, existing);
  const requiredSkills = (draft.requiredSkills ?? []).map((requirement) => {
    const skillBody = normalizeSlugToken(requirement.tagSlug, 'general-skill');
    return {
      tagSlug: `org:${orgId}:skill-type:${skillBody}`,
      minimumTier: requirement.minimumTier,
      quantity: Math.max(1, Math.min(99, Math.trunc(requirement.quantity || 1))),
      ...(typeof requirement.minXp === 'number' ? { minXp: Math.max(0, Math.trunc(requirement.minXp)) } : {}),
    };
  });

  return {
    slug: fullSlug,
    name: draft.name.trim() || 'Custom Task Type',
    aliases: normalizeAliases(draft.aliases),
    ...(draft.description?.trim() ? { description: draft.description.trim() } : {}),
    requiredSkills,
  };
}

function normalizeSkillDraft(
  orgId: string,
  draft: SuggestSkillTypeDraftOutput,
  existingSkillTypeSlugs: string[]
): SuggestSkillTypeDraftOutput {
  const existing = new Set(existingSkillTypeSlugs);
  const slugBody = normalizeSlugToken(draft.slug || draft.name, 'custom-skill');
  const fullSlug = ensureUniqueSlug(`org:${orgId}:skill-type:${slugBody}`, existing);

  return {
    slug: fullSlug,
    name: draft.name.trim() || 'Custom Skill Type',
    aliases: normalizeAliases(draft.aliases),
    ...(draft.description?.trim() ? { description: draft.description.trim() } : {}),
  };
}

export async function suggestTaskTypeDraftFromAI(
  input: z.infer<typeof SuggestSemanticDraftInputSchema>
): Promise<SuggestTaskTypeDraftOutput> {
  return suggestTaskTypeDraftFlow(input);
}

export async function suggestSkillTypeDraftFromAI(
  input: z.infer<typeof SuggestSemanticDraftInputSchema>
): Promise<SuggestSkillTypeDraftOutput> {
  return suggestSkillTypeDraftFlow(input);
}

const suggestTaskTypePrompt = ai.definePrompt({
  name: 'suggestTaskTypeDraftPrompt',
  input: { schema: SuggestSemanticDraftInputSchema },
  output: { schema: SuggestTaskTypeDraftOutputSchema },
  prompt: `You are helping users create an organization task-type dictionary entry.

User intent: {{{userPrompt}}}
Organization ID: {{{orgId}}}
Existing task-type slugs: {{#each existingTaskTypeSlugs}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Existing skill-type slugs: {{#each existingSkillTypeSlugs}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Return a practical draft using these rules:
- slug should be a short slug token only (no prefix). Example: electrical-installation
- name should be clear and user-facing.
- aliases should include likely synonyms the parser might encounter.
- requiredSkills should reference skill-type slug tokens only (no prefix).
- minimumTier must be one of: apprentice, journeyman, expert, artisan, grandmaster, legendary, titan.
- Keep requiredSkills focused (0-5 items) and realistic.
- description should be concise and implementation-friendly.
`,
});

const suggestSkillTypePrompt = ai.definePrompt({
  name: 'suggestSkillTypeDraftPrompt',
  input: { schema: SuggestSemanticDraftInputSchema },
  output: { schema: SuggestSkillTypeDraftOutputSchema },
  prompt: `You are helping users create an organization skill-type dictionary entry.

User intent: {{{userPrompt}}}
Organization ID: {{{orgId}}}
Existing skill-type slugs: {{#each existingSkillTypeSlugs}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Return a practical draft using these rules:
- slug should be a short slug token only (no prefix). Example: electrical-wiring
- name should be clear and user-facing.
- aliases should include likely synonyms used in documents.
- description should be concise and implementation-friendly.
`,
});

const suggestTaskTypeDraftFlow = ai.defineFlow(
  {
    name: 'suggestTaskTypeDraftFlow',
    inputSchema: SuggestSemanticDraftInputSchema,
    outputSchema: SuggestTaskTypeDraftOutputSchema,
  },
  async (input) => {
    const { output } = await suggestTaskTypePrompt(input);
    if (!output) {
      throw new Error('No output from AI task-type suggestion prompt.');
    }
    return normalizeTaskDraft(input.orgId, output, input.existingTaskTypeSlugs ?? []);
  }
);

const suggestSkillTypeDraftFlow = ai.defineFlow(
  {
    name: 'suggestSkillTypeDraftFlow',
    inputSchema: SuggestSemanticDraftInputSchema,
    outputSchema: SuggestSkillTypeDraftOutputSchema,
  },
  async (input) => {
    const { output } = await suggestSkillTypePrompt(input);
    if (!output) {
      throw new Error('No output from AI skill-type suggestion prompt.');
    }
    return normalizeSkillDraft(input.orgId, output, input.existingSkillTypeSlugs ?? []);
  }
);
