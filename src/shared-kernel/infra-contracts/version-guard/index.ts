/**
 * shared.kernel/version-guard — SK_VERSION_GUARD [S2]
 */

export interface VersionGuardInput {
  readonly eventVersion: number;
  readonly viewLastProcessedVersion: number;
}

export type VersionGuardResult = 'allow' | 'discard';

export function applyVersionGuard(input: VersionGuardInput): VersionGuardResult {
  return input.eventVersion > input.viewLastProcessedVersion ? 'allow' : 'discard';
}

export function versionGuardAllows(input: VersionGuardInput): boolean {
  return applyVersionGuard(input) === 'allow';
}

export interface ImplementsVersionGuard {
  readonly implementsVersionGuard: true;
}
