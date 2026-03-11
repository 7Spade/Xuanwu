---
name: agent-governance
description: |
  Patterns and techniques for adding governance, safety, and trust controls to AI agent systems. Use this skill when:
  - Building AI agents that call external tools (APIs, databases, file systems)
  - Implementing policy-based access controls for agent tool usage
  - Adding semantic intent classification to detect dangerous prompts
  - Creating trust scoring systems for multi-agent workflows
  - Building audit trails for agent actions and decisions
  - Enforcing rate limits, content filters, or tool restrictions on agents
  - Working with any agent framework (PydanticAI, CrewAI, OpenAI Agents, LangChain, AutoGen)
---

# Agent Governance

## Consolidation Status
- Canonical agent safety and trust-governance skill.
- Consolidated and removed wrappers: `agentic-eval`, `ai-prompt-engineering-safety-review`.

## When to Use
- Adding safety controls to an agent that calls external APIs, databases, or file systems
- Designing a policy-based access control layer for multi-agent tool usage
- Implementing audit trails, rate limits, or content filters for agent outputs

## Prerequisites
- Identify the agent framework in use (PydanticAI, CrewAI, OpenAI Agents, LangChain, AutoGen)
- List all tools the agent can call and the risk level of each
- Define the trust boundary: who initiates the agent and what they are allowed to request

## Workflow
1. Enumerate all agent tools and classify each as Low / Medium / High risk.
2. Design the policy layer: which roles can invoke which tools and under what conditions.
3. Implement semantic intent classification to detect out-of-policy requests before tool dispatch.
4. Add a trust scoring model: inputs that lower trust (unknown user, high-risk prompt) gate high-risk tools.
5. Implement audit logging: record tool name, inputs, outputs, timestamp, and caller identity for every invocation.
6. Add rate limits and content filters for tools with side effects (write, delete, external API calls).
7. Test with adversarial prompts: verify the governance layer blocks out-of-policy requests.
8. Document the policy rules and trust scoring logic for human review.

## Output Contract
- Produce governance code or configuration with: Policy Rules, Trust Score Logic, Audit Log Schema, Rate Limit Config.
- Each policy rule must be testable with a specific allow/deny example.
- Include at least three adversarial test prompts and expected outcomes.

## Guardrails
- Do not implement governance after the agent is already deployed — design it in from the start.
- Do not log sensitive data (passwords, tokens, PII) in audit trails.
- Do not allow the governance layer to be bypassed by injecting system-level instructions.

## Source of Truth
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
