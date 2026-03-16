/**
 * Firebase Cloud Functions — Entry Point
 *
 * Document Intelligence:
 *   processDocument — Phase 1 OCR extraction via Google Cloud Document AI
 */

import { initializeApp, getApps } from "firebase-admin/app";
import { setGlobalOptions } from "firebase-functions/v2";

if (getApps().length === 0) {
  initializeApp();
}

setGlobalOptions({ region: "asia-east1", maxInstances: 10 });

// ── Document Intelligence ────────────────────────────────────────────────────
export { processDocument } from "./document-ai/process-document.fn";
