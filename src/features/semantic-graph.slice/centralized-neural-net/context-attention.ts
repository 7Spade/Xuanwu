/**
 * @deprecated Use centralized-edges/context-attention.ts instead.
 * Backward-compatibility re-export shim.
 *
 * context-attention has been moved to centralized-edges/ (VS8_SL Synapse Layer)
 * per architecture alignment [D21-F] — context attention belongs in the Synapse
 * layer where edges are defined, not in the Neural Computation (VS8_NG) layer.
 */
export { filterTagsByWorkspaceContext } from '../centralized-edges/context-attention';
