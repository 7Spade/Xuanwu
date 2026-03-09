/**
 * account.slice — Public API
 *
 * Consolidated VS2 Account vertical slice.
 * Covers: User Profile, User Wallet,
 *         Account Governance Role, Account Governance Policy.
 *
 * Organization sub-domains (Org Members, Org Partners, Org Policy,
 * Org Teams, Org Core, Org Event Bus) have been migrated to
 * @/features/organization.slice (VS4).
 *
 * Notification delivery (VS7) has been moved to notification-hub.slice.
 *
 * External consumers import exclusively from this file.
 */

// =================================================================
// User Profile (account-domain.profile)
// =================================================================
export { UserSettingsView, AccountSettingsRouter, UserSettings, ProfileCard, PreferencesCard, SecurityCard, AccountSkillsSection } from './domain.profile';
export { useUser } from './domain.profile';
export { createUserAccount, updateUserProfile } from './domain.profile';
export { getUserProfile } from './domain.profile';

// =================================================================
// User Wallet (account-domain.wallet)
// Strong-consistency financial ledger [SK_READ_CONSISTENCY: STRONG_READ]
// =================================================================
export { creditWallet, debitWallet } from './domain.wallet';
export type { WalletTransaction, TopUpInput, DebitInput } from './domain.wallet';
export { getWalletBalance, subscribeToWalletBalance, subscribeToWalletTransactions } from './domain.wallet';
export type { WalletTransactionRecord } from './domain.wallet';
export { useWallet } from './domain.wallet';

// =================================================================
// Governance: Account Role (account-governance.role)
// Role changes trigger CUSTOM_CLAIMS refresh [S6]
// =================================================================
export { assignAccountRole, revokeAccountRole } from './gov.role';
export type { AccountRoleRecord, AssignRoleInput, TokenRefreshSignal, TokenRefreshReason } from './gov.role';
export { getAccountRole, subscribeToAccountRoles } from './gov.role';
export { useAccountRole } from './gov.role';
export { PermissionMatrixView, PermissionTree } from './gov.role';

// =================================================================
// Governance: Account Policy (account-governance.policy)
// Policy changes trigger CUSTOM_CLAIMS refresh [S6]
// =================================================================
export { createAccountPolicy, updateAccountPolicy, deleteAccountPolicy } from './gov.policy';
export type { AccountPolicy, PolicyRule, CreatePolicyInput, UpdatePolicyInput } from './gov.policy';
export { getAccountPolicy, subscribeToAccountPolicies, getActiveAccountPolicies } from './gov.policy';
export { useAccountPolicy } from './gov.policy';

// =================================================================
// Domain rules (account predicates)
// =================================================================
export { isOwner, getUserTeams, getUserTeamIds } from './_account.rules';

// =================================================================
// Account Event Bus (account-event-bus)
// =================================================================
export { onAccountEvent, publishAccountEvent } from './account-event-bus';
export type {
	AccountEventPayloadMap,
	AccountEventKey,
	AccountRoleChangedPayload,
	AccountPolicyChangedPayload,
} from './account-event-bus';
