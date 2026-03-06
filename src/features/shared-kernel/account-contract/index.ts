/**
 * shared.kernel/account-contract — SK_ACCOUNT_CONTRACT [D19]
 *
 * Cross-BC canonical types for the Account/Identity domain.
 * Per D19 (docs/logic-overview.md): cross-BC contracts belong in shared.kernel.*;
 * shared/types/ stubs have been removed; import directly from @/features/shared-kernel.
 *
 * Types defined here are referenced by:
 *   – account.slice            (user profile, wallet, role)
 *   – organization.slice       (members, teams, partners)
 *   – notification-hub.slice   (Notification)
 *   – projection.bus           (account-view projector)
 *   – workspace.slice          (MemberReference, PartnerInvite)
 *
 * Dependency rule: ZERO infrastructure imports (no Firebase, no React, no I/O).
 * [D8] This module is pure — no async functions, no Firestore calls, no side effects.
 * [D19] Canonical definition lives here. Import from `@/features/shared-kernel`.
 */

export type {
  AccountType,
  OrganizationRole,
  Presence,
  InviteState,
  NotificationType,
} from './account-identity';

export type {
  Account,
  ThemeConfig,
  Wallet,
  ExpertiseBadge,
} from './account-aggregate';

export type {
  MemberReference,
  Team,
  PartnerInvite,
} from './organization-membership';

export type { Notification } from './notification-contract';
