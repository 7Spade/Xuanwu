/**
 * Firebase Infrastructure — root barrel
 *
 * Re-exports both the client (Web SDK) and admin (Admin SDK) surfaces.
 *
 * Prefer importing from the specific sub-path to keep bundles small and
 * to make the runtime context (client vs. server) explicit:
 *
 * @example
 * // Client Components — Web SDK
 * import { getFirebaseAuth } from "@/infrastructure/firebase/client";
 *
 * // Server Actions / Route Handlers — Admin SDK
 * import { getAdminAuth }    from "@/infrastructure/firebase/admin/auth";
 * import { commitBatch }     from "@/infrastructure/firebase/admin/db/batchWrite";
 * import { cacheAside }      from "@/infrastructure/firebase/admin/db/cacheLayer";
 */

// App init (shared by client adapters)
export { getFirebaseApp, resolvedFirebaseConfig } from "./app";

// Client sub-surface
export * from "./client";
