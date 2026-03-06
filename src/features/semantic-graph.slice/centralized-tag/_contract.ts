import type { TagCategory } from '@/shared-kernel/data-contracts/tag-authority';

export type TagDeleteRule = 'allow' | 'block-if-referenced';

export interface CentralizedTagEntry {
  tagSlug: string;
  label: string;
  category: TagCategory;
  deprecatedAt?: string;
  replacedByTagSlug?: string;
  deleteRule: TagDeleteRule;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
