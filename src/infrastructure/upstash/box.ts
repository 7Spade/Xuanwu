/**
 * Upstash Box — sandboxed AI coding agent runtime.
 *
 * Creates and manages ephemeral sandboxed environments (Node, Python, etc.)
 * with AI agent (Claude Code / GPT-4o) capabilities: streaming output,
 * structured Zod-typed results, file I/O, git operations, and snapshots.
 *
 * Ideal for agentic workflows where the platform needs to spawn a temporary
 * execution environment to run code, analyse documents, or perform repository
 * operations on behalf of a user.
 *
 * Environment requirements:
 *   UPSTASH_BOX_API_KEY — Upstash Box API key (console.upstash.com/box)
 *
 * Usage — basic agent run:
 *   import { createBox } from "@/infrastructure/upstash/box";
 *   const box = await createBox({ runtime: "node" });
 *   const result = await box.agent.run({ prompt: "…" });
 *   console.log(result.result);
 *   await box.delete();
 *
 * Usage — structured output:
 *   import { createBox } from "@/infrastructure/upstash/box";
 *   import { z } from "zod";
 *   const box = await createBox({ runtime: "python" });
 *   const schema = z.object({ summary: z.string(), confidence: z.number() });
 *   const result = await box.agent.run({ prompt: "…", outputSchema: schema });
 *   console.log(result.structuredOutput); // typed as z.infer<typeof schema>
 *   await box.delete();
 */

import "server-only";

import { Box, Agent, ClaudeCode, type BoxConfig } from "@upstash/box";

export { Box, Agent, ClaudeCode } from "@upstash/box";
export type { BoxConfig } from "@upstash/box";

/**
 * Convenience factory that creates an Upstash Box with the project API key
 * injected from the environment.  Callers only need to specify runtime and
 * agent configuration.
 *
 * @param config - Partial BoxConfig; `apiKey` defaults to `UPSTASH_BOX_API_KEY`.
 */
export async function createBox(
  config: Omit<BoxConfig, "apiKey"> & { apiKey?: string }
): Promise<InstanceType<typeof Box>> {
  return Box.create({
    apiKey: config.apiKey ?? process.env.UPSTASH_BOX_API_KEY!,
    agent: config.agent ?? {
      provider: Agent.ClaudeCode,
      model: ClaudeCode.Sonnet_4_5,
    },
    ...config,
  });
}
