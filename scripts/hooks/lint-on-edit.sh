#!/bin/bash
# Run ESLint on TypeScript/JavaScript files after agent edits.
# Fires on PostToolUse; injects lint diagnostics as context for the agent.

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name')

if [ "$TOOL_NAME" = "editFiles" ] || [ "$TOOL_NAME" = "createFile" ]; then
  # Collect affected file paths from both editFiles (array) and createFile (single path)
  FILES=$(echo "$INPUT" | jq -r '
    (.tool_input.files[]? // empty),
    (.tool_input.path // empty)
  ' 2>/dev/null)

  LINT_TARGETS=()
  while IFS= read -r FILE; do
    if [ -f "$FILE" ] && echo "$FILE" | grep -qE '\.(ts|tsx|js|jsx|mts|cts)$'; then
      LINT_TARGETS+=("$FILE")
    fi
  done <<< "$FILES"

  if [ "${#LINT_TARGETS[@]}" -gt 0 ]; then
    # Prefer locally installed eslint to avoid version mismatch
    ESLINT_BIN="./node_modules/.bin/eslint"
    if [ ! -x "$ESLINT_BIN" ]; then
      echo '{"continue":true}'
      exit 0
    fi

    LINT_OUTPUT=$("$ESLINT_BIN" --cache --cache-location .eslintcache \
      --config eslint.config.mts --format compact "${LINT_TARGETS[@]}" 2>&1)
    EXIT_CODE=$?

    if [ $EXIT_CODE -ne 0 ]; then
      # Inject lint errors as context so the agent can self-correct
      CONTEXT_MSG="ESLint found issues in edited files:\n$(echo "$LINT_OUTPUT" | head -30)"
      PAYLOAD=$(jq -n --arg ctx "$CONTEXT_MSG" \
        '{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":$ctx}}')
      echo "$PAYLOAD"
      exit 0
    fi
  fi
fi

echo '{"continue":true}'
