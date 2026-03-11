/**
 * Module: api-gateway/_qry-gateway.ts
 * Purpose: L0A CQRS read-only ingress (QRY_API_GW)
 * Responsibilities: Route read queries through the L0A entry point to gateway-query (L6)
 * Constraints: deterministic logic, respect module boundaries
 */

/**
 * infra.api-gateway — _qry-gateway.ts
 *
 * [L0A] QUERY_API_GATEWAY — read-only ingress.
 *
 * Architecture: L0A QRY_API_GW → L6 gateway-query (QGWAY + routes)
 *
 * Per docs/architecture/README.md:
 *   QRY_API_GW["QUERY_API_GATEWAY\nread-only ingress · L0A\nsrc/shared-infra/api-gateway"]
 *   BULKHEAD → QRY_API_GW → QGWAY
 *
 * Invariants:
 *   - This layer is pure ingress routing; all version guards happen in L6/L5.
 *   - Must never accept write requests (writes route through CMD_API_GW).
 *   [D31] Auto-JOIN acl-projection filtering applied by QGWAY (not here).
 */

import { executeQuery } from '@/shared-infra/gateway-query';
import type { QueryRouteName } from '@/shared-infra/gateway-query';

/**
 * L0A read-only ingress: routes a query to the L6 Query Gateway.
 *
 * Callers (Server Components / data-fetching functions) use this as the sole
 * read entry point for projection-backed data.
 *
 * @example
 * const members = await qryApiGateway(QUERY_ROUTES.ORG_ELIGIBLE_MEMBERS, { orgId });
 */
export async function qryApiGateway<TParams, TResult>(
  queryName: QueryRouteName | string,
  params: TParams
): Promise<TResult> {
  return executeQuery<TParams, TResult>(queryName, params);
}
