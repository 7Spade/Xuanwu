/**
 * Document AI — Genkit runtime instance.
 *
 * Initializes a single shared `ai` instance backed by Google AI (Gemini).
 * Model default: gemini-2.5-flash (strong OCR reasoning, cost-efficient).
 *
 * Environment requirements:
 *   GOOGLE_GENAI_API_KEY  — Google AI Studio API key (server-only, never client-exposed)
 *
 * Usage:
 *   import { ai } from "@/infrastructure/document-ai/genkit";
 */

import { googleAI } from "@genkit-ai/google-genai";
import { genkit } from "genkit";

export const ai = genkit({
  plugins: [googleAI()],
  model: "googleai/gemini-2.5-flash",
});
