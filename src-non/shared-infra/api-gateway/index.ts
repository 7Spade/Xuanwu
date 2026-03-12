/**
 * Module: api-gateway/index.ts
 * Purpose: L0A CQRS Gateway public API — unified read/write ingress split
 * Responsibilities: Export CMD_API_GW (write) and QRY_API_GW (read) ingress functions
 * Constraints: deterministic logic, respect module boundaries
 */

/**
 * infra.api-gateway — Public API
 *
 * [L0A] CQRS Gateway — unified read/write split ingress.
 *
 * Per 01-logical-flow.md UNIFIED_GW:
 *   CMD_API_GW — write-only ingress → L2 gateway-command
 *   QRY_API_GW — read-only ingress  → L6 gateway-query
 *
 * Usage (Server Actions — writes):
 *   import { cmdApiGateway, buildWriteOpts } from '@/shared-infra/api-gateway';
 *   const result = await cmdApiGateway(command, buildWriteOpts(authority));
 *
 * Usage (Server Components — reads):
 *   import { qryApiGateway } from '@/shared-infra/api-gateway';
 *   import { QUERY_ROUTES } from '@/shared-infra/gateway-query';
 *   const data = await qryApiGateway(QUERY_ROUTES.ACCOUNT_VIEW, { accountId });
 */

export { cmdApiGateway, buildWriteOpts } from './_cmd-gateway';
export { qryApiGateway } from './_qry-gateway';
