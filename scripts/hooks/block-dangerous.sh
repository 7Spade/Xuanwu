#!/bin/bash
# Block dangerous terminal commands before execution.
# Fires on PreToolUse; denies destructive patterns per project security policy.

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name')

if [ "$TOOL_NAME" = "runTerminalCommand" ]; then
  COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

  # Block irreversible filesystem destruction
  if echo "$COMMAND" | grep -qE 'rm\s+-rf\s+(/+\s*$|/+\*|\.\s*$|\*)'; then
    echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Irreversible rm -rf blocked by security policy"}}'
    exit 0
  fi

  # Block unrestricted Firebase full-deploy (must specify --only or --config to limit scope)
  if echo "$COMMAND" | grep -qE 'firebase\s+deploy' && ! echo "$COMMAND" | grep -qE '(--only|--config)'; then
    echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask","permissionDecisionReason":"Unrestricted firebase deploy requires confirmation. Use --only or --config to limit scope."}}'
    exit 0
  fi

  # Block destructive SQL statements run through terminal
  if echo "$COMMAND" | grep -qiE '(DROP\s+TABLE|TRUNCATE\s+TABLE|DELETE\s+FROM\s+\w+\s*(;|$))'; then
    echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Destructive SQL statement blocked by security policy"}}'
    exit 0
  fi
fi

echo '{"continue":true}'
