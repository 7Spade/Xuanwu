'use client';

import { useState } from 'react';

import type { PortalState } from '../../_types';

/**
 * usePortalState — Presentation bridge hook for portal domain state.
 *
 * Exposes the portal's runtime state to presentation layer components.
 * All domain mutations must go through core/_actions.ts [D3].
 */
export function usePortalState(): PortalState {
  const [isInitializing] = useState(false);

  return { isInitializing };
}
