/**
 * Module: api-gateway/_cmd-gateway.ts
 * Purpose: L0A CQRS write-only ingress (CMD_API_GW)
 * Responsibilities: Route write commands through the L0A entry point to gateway-command (L2)
 * Constraints: deterministic logic, respect module boundaries
 */

/**
 * infra.api-gateway — _cmd-gateway.ts
 *
 * [L0A] COMMAND_API_GATEWAY — write-only ingress.
 *
 * Architecture: L0A CMD_API_GW → L2 gateway-command (CBG_ENTRY → CBG_AUTH → CBG_ROUTE)
 *
 * Per docs/architecture/README.md:
 *   CMD_API_GW["COMMAND_API_GATEWAY\nwrite-only ingress · L0A\nsrc/shared-infra/api-gateway"]
 *   BULKHEAD → CMD_API_GW → CBG_ENTRY
 *
 * Invariants:
 *   - This layer is pure ingress routing; all auth/tracing happens in L2.
 *   - Must never accept read requests (reads route through QRY_API_GW).
 */

import type { AuthoritySnapshot, CommandResult } from '@/shared-kernel';

import { dispatchCommand } from '@/shared-infra/gateway-command';
import type { GatewayCommand, DispatchOptions } from '@/shared-infra/gateway-command';

/**
 * L0A write-only ingress: routes a command to the L2 Command Gateway.
 *
 * Callers (Server Actions / _actions.ts) use this as the sole write entry point.
 * The L2 CBG_ENTRY pipeline injects traceId and enforces authority.
 *
 * @example
 * const result = await cmdApiGateway(
 *   { commandType: 'workspace:task:assign', aggregateId: wsId, ...payload },
 *   { authority: authoritySnapshot }
 * );
 */
export async function cmdApiGateway<TCmd extends GatewayCommand>(
  command: TCmd,
  opts?: DispatchOptions
): Promise<CommandResult> {
  return dispatchCommand(command, opts);
}

/**
 * Build DispatchOptions from an authority snapshot.
 * Convenience helper for Server Actions that already have an authority snapshot.
 */
export function buildWriteOpts(
  authority: AuthoritySnapshot | null,
  traceId?: string
): DispatchOptions {
  return { authority, traceId };
}
