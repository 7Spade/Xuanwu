/**
 * @fileoverview _cost-classifier.ts — Layer-2 Semantic Classification for cost line items.
 *
 * Architecture (per 00-logic-overview.md):
 *   Layer 1: Document parsing → raw ParsedLineItem[]
 *   Layer 2: Semantic Classification (this module, VS8) → each item tagged with CostItemType
 *   Layer 3: Semantic Router → routes items to the correct domain model (tasks vs. finance etc.)
 *
 * This is a pure, side-effect-free module. No Firestore, no SDK imports [D24].
 *
 * [D8]  All tag/semantic logic resides in semantic-graph.slice, not shared-kernel.
 * [D21] Tag categories governed by VS8.
 */

import {
  CostItemType,
  type CostItemTypeValue as CostItemType,
} from '@/shared-kernel';

export { CostItemType };
export type { CostItemType };

export const COST_ITEM_TAG_SLUG = {
  [CostItemType.EXECUTABLE]: 'cost-item-executable',
  [CostItemType.MANAGEMENT]: 'cost-item-management',
  [CostItemType.RESOURCE]: 'cost-item-resource',
  [CostItemType.FINANCIAL]: 'cost-item-financial',
  [CostItemType.PROFIT]: 'cost-item-profit',
  [CostItemType.ALLOWANCE]: 'cost-item-allowance',
} as const

export type SemanticTagSlug = (typeof COST_ITEM_TAG_SLUG)[CostItemType]

export interface CostItemSemanticClassification {
  costItemType: CostItemType
  semanticTagSlug: SemanticTagSlug
}

// =================================================================
// Parser-facing classification axes — Type / Status / Billing Mode
// =================================================================

export const ParserLineItemType = {
  WORK_PACKAGE: 'WORK_PACKAGE',
  TEST_COMMISSIONING: 'TEST_COMMISSIONING',
  LOGISTICS_RESOURCE: 'LOGISTICS_RESOURCE',
  MANAGEMENT_HSE: 'MANAGEMENT_HSE',
  FINANCIAL_TERM: 'FINANCIAL_TERM',
  FINANCIAL_MARGIN: 'FINANCIAL_MARGIN',
  ALLOWANCE_EXPENSE: 'ALLOWANCE_EXPENSE',
} as const

export type ParserLineItemType =
  (typeof ParserLineItemType)[keyof typeof ParserLineItemType]

export const ParserRoutingStatus = {
  TASK_CANDIDATE: 'TASK_CANDIDATE',
  AUTO_ACCEPTED_NO_TASK: 'AUTO_ACCEPTED_NO_TASK',
  FINANCE_ONLY: 'FINANCE_ONLY',
  EXCLUDED: 'EXCLUDED',
} as const

export type ParserRoutingStatus =
  (typeof ParserRoutingStatus)[keyof typeof ParserRoutingStatus]

export const ParserBillingMode = {
  INHERIT_PO_TERMS: 'INHERIT_PO_TERMS',
  BY_PROGRESS: 'BY_PROGRESS',
  ON_COMPLETION: 'ON_COMPLETION',
} as const

export type ParserBillingMode =
  (typeof ParserBillingMode)[keyof typeof ParserBillingMode]

export interface ParserLineItemClassification extends CostItemSemanticClassification {
  lineItemType: ParserLineItemType
  routingStatus: ParserRoutingStatus
  billingMode: ParserBillingMode
}

// =================================================================
// Keyword Rules — ordered from most-specific to least-specific
// =================================================================

/**
 * Each rule maps a set of lower-cased keywords to a CostItemType.
 * Rules are evaluated in declaration order; the first match wins.
 */
const CLASSIFICATION_RULES: Array<{ keywords: string[]; type: CostItemType }> = [
  // PROFIT — profit margin entries (highest specificity)
  {
    keywords: ['利潤', 'profit margin', 'gross profit'],
    type: CostItemType.PROFIT,
  },

  // FINANCIAL — payment milestones, retentions, and financial-only items
  {
    keywords: ['尾款', 'final payment', 'retention', '預付款', 'advance payment', 'milestone payment'],
    type: CostItemType.FINANCIAL,
  },

  // EXECUTABLE OVERRIDE — physical testing / commissioning work that contains QC or inspection
  // keywords but is unambiguously executable field-work (must be checked BEFORE the MANAGEMENT rule
  // so that "機電檢測QC Test" is not mis-classified as management overhead).
  {
    keywords: ['機電檢測', 'qc test', 'commissioning test', '通電測試', '系統測試', 'pre-commissioning'],
    type: CostItemType.EXECUTABLE,
  },

  // MANAGEMENT — admin, supervisory, and work-safety overhead
  // Note: bare "qc" (too broad) was intentionally removed; "quality control" and "品管"
  // (Chinese equivalent) already cover the administrative QC use case precisely.
  {
    keywords: [
      '管理',
      '行政',
      '品管',
      '領班',
      '職安',
      '工安',
      'hse',
      'safety officer',
      'site manager',
      'site management',
      'administration',
      'quality control',
      '安全管理',
    ],
    type: CostItemType.MANAGEMENT,
  },

  // ALLOWANCE — consumables, travel, transport, and miscellaneous expenses
  {
    keywords: [
      '耗材',
      'consumables',
      '差旅',
      '運輸',
      '勘查',
      'travel',
      'transportation',
      'survey',
      'survey & travel',
      '雜支',
      'miscellaneous',
    ],
    type: CostItemType.ALLOWANCE,
  },

  // RESOURCE — storage, warehouse, equipment handling at rest, or manpower pools
  {
    keywords: ['倉儲', 'warehouse', 'storage', '人力', 'manpower', 'resource'],
    type: CostItemType.RESOURCE,
  },

  // EXECUTABLE — physical construction, installation, testing, and commissioning work
  // (catch-all; any item reaching this point is treated as executable work)
]

// =================================================================
// classifyCostItem — pure classification function
// =================================================================

/**
 * Classifies a cost line item by matching its name against keyword rules.
 *
 * Uses a case-insensitive full-text search across all registered keyword rules.
 * The first rule whose keyword appears anywhere in the name wins.
 * Falls back to `EXECUTABLE` when no rule matches.
 *
 * @param name - The cost item name / description string from the parsed document.
 * @returns The semantic CostItemType for this item.
 *
 * @pure No side effects; deterministic for the same input.
 */
function classifyCostItemType(name: string): CostItemType {
  const lower = name.toLowerCase()

  for (const rule of CLASSIFICATION_RULES) {
    // Keywords in CLASSIFICATION_RULES are already lowercase; compare against `lower` directly.
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return rule.type
    }
  }

  // Default: treat as executable work if no specific rule matched
  return CostItemType.EXECUTABLE
}

function toSemanticTagSlug(costItemType: CostItemType): SemanticTagSlug {
  return COST_ITEM_TAG_SLUG[costItemType]
}

function deriveLineItemType(name: string, costItemType: CostItemType): ParserLineItemType {
  const lower = name.toLowerCase()

  if (costItemType === CostItemType.EXECUTABLE) {
    if (
      lower.includes('測試') ||
      lower.includes('調試') ||
      lower.includes('commissioning') ||
      lower.includes('qc test') ||
      lower.includes('testing')
    ) {
      return ParserLineItemType.TEST_COMMISSIONING
    }
    return ParserLineItemType.WORK_PACKAGE
  }

  if (costItemType === CostItemType.MANAGEMENT) {
    return ParserLineItemType.MANAGEMENT_HSE
  }

  if (costItemType === CostItemType.RESOURCE) {
    return ParserLineItemType.LOGISTICS_RESOURCE
  }

  if (costItemType === CostItemType.FINANCIAL) {
    return ParserLineItemType.FINANCIAL_TERM
  }

  if (costItemType === CostItemType.PROFIT) {
    return ParserLineItemType.FINANCIAL_MARGIN
  }

  return ParserLineItemType.ALLOWANCE_EXPENSE
}

function deriveRoutingStatus(costItemType: CostItemType): ParserRoutingStatus {
  if (costItemType === CostItemType.EXECUTABLE) {
    return ParserRoutingStatus.TASK_CANDIDATE
  }

  if (costItemType === CostItemType.FINANCIAL || costItemType === CostItemType.PROFIT) {
    return ParserRoutingStatus.FINANCE_ONLY
  }

  if (costItemType === CostItemType.MANAGEMENT || costItemType === CostItemType.RESOURCE || costItemType === CostItemType.ALLOWANCE) {
    return ParserRoutingStatus.AUTO_ACCEPTED_NO_TASK
  }

  return ParserRoutingStatus.EXCLUDED
}

function deriveBillingMode(name: string, costItemType: CostItemType): ParserBillingMode {
  const lower = name.toLowerCase()

  if (
    lower.includes('尾款') ||
    lower.includes('final payment') ||
    lower.includes('retention')
  ) {
    return ParserBillingMode.ON_COMPLETION
  }

  if (
    costItemType === CostItemType.EXECUTABLE ||
    costItemType === CostItemType.MANAGEMENT ||
    costItemType === CostItemType.RESOURCE ||
    costItemType === CostItemType.ALLOWANCE
  ) {
    return ParserBillingMode.BY_PROGRESS
  }

  return ParserBillingMode.INHERIT_PO_TERMS
}

export function classifyCostItem(name: string): CostItemType
export function classifyCostItem(
  name: string,
  options: { includeSemanticTagSlug: true }
): CostItemSemanticClassification
export function classifyCostItem(
  name: string,
  options?: { includeSemanticTagSlug?: boolean }
): CostItemType | CostItemSemanticClassification {
  const costItemType = classifyCostItemType(name)
  if (options?.includeSemanticTagSlug) {
    return {
      costItemType,
      semanticTagSlug: toSemanticTagSlug(costItemType),
    }
  }
  return costItemType
}

export function classifyCostItemWithSemanticTag(
  name: string
): CostItemSemanticClassification {
  return classifyCostItem(name, { includeSemanticTagSlug: true })
}

/**
 * Parser-level business classification with explicit Type / Status / BillingMode.
 *
 * This keeps semantic type (`costItemType`) and process routing (`routingStatus`)
 * separate, so document-parser never relies on ambiguous labels like
 * MATERIALIZABLE/SKIPPED.
 */
export function classifyParserLineItem(name: string): ParserLineItemClassification {
  const semantic = classifyCostItemWithSemanticTag(name)
  return {
    ...semantic,
    lineItemType: deriveLineItemType(name, semantic.costItemType),
    routingStatus: deriveRoutingStatus(semantic.costItemType),
    billingMode: deriveBillingMode(name, semantic.costItemType),
  }
}

/**
 * Layer-3 semantic routing gate — the single source of truth for whether a cost
 * item may be materialised as a Task.
 *
 * Centralising this decision in `semantic-graph.slice` (VS8) prevents feature
 * slices from hard-coding `=== CostItemType.EXECUTABLE` and ensures any future
 * expansion of the materialisation rule set stays inside the semantic layer.
 *
 * @param costItemType - The semantic type assigned by `classifyCostItem`.
 * @returns `true` when the item should create a Task; `false` to silently skip.
 *
 * @pure No side effects; safe to call at any layer [D8].
 */
export function shouldMaterializeAsTask(costItemType: CostItemType): boolean {
  return costItemType === CostItemType.EXECUTABLE
}
