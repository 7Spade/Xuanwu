/**
 * projection.wallet-balance — Public API
 *
 * Wallet balance projection read model.
 * EVENTUAL_READ surface for display; transactional operations use STRONG_READ.
 *
 * Per 00-logic-overview.md (PROJ_BUS CRIT_PROJ):
 *   WALLET_V["projection.wallet-balance\n[S3: EVENTUAL_READ]"]
 *   QGWAY_WALLET → projection.wallet-balance (display)
 *                  STRONG_READ → WALLET_AGG (transactions [Q8][D5])
 */

export {
  initWalletBalanceView,
  applyWalletCredited,
  applyWalletDebited,
  syncWalletBalanceFromAggregate,
} from './_projector';
export type { WalletBalanceView } from './_projector';

export { getWalletBalanceView, getDisplayWalletBalance } from './_queries';
