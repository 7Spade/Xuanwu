---
name: chrome-devtools
description: 'Expert-level browser automation, debugging, and performance analysis using Chrome DevTools MCP. Use when interacting with web pages, capturing screenshots, analyzing network traffic, profiling performance, or debugging UI behavior in a running browser. Triggers: "browser debug", "chrome devtools", "capture screenshot", "network analysis", "performance profile".'
---

# Chrome Devtools

## When to Use
- Interacting with a running web page: click, type, fill forms, navigate
- Capturing screenshots or recording network traffic for debugging
- Profiling Core Web Vitals and identifying performance bottlenecks
- Inspecting console errors and JavaScript exceptions in the browser

## Prerequisites
- Chrome or Chromium must be running with the DevTools MCP server connected
- Know the target URL and the expected behavior to test or inspect

## Workflow
1. Use `chrome-devtools-mcp-navigate_page` to load the target URL.
2. Use `chrome-devtools-mcp-take_snapshot` to get the current accessibility/DOM tree.
3. Interact using `chrome-devtools-mcp-click`, `chrome-devtools-mcp-fill`, or `chrome-devtools-mcp-press_key` as needed.
4. Use `chrome-devtools-mcp-take_screenshot` to capture visual state for verification.
5. Use `chrome-devtools-mcp-list_console_messages` to check for JS errors.
6. Use `chrome-devtools-mcp-list_network_requests` to inspect API calls and responses.
7. For performance: use `chrome-devtools-mcp-performance_start_trace` and `chrome-devtools-mcp-performance_stop_trace`, then analyze insights.
8. Always re-take a snapshot after navigation or significant DOM changes.

## Output Contract
- Produce a summary of: actions performed, observed outcomes, console errors, and network anomalies.
- Include screenshots for all UI state verifications.
- List any performance insights with their severity.

## Guardrails
- Do not use `chrome-devtools-mcp-evaluate_script` with untrusted user input — injection risk.
- Do not capture or log credentials, tokens, or personal data visible in the browser.
- Always re-take snapshot before using `uid` values — stale refs cause silent failures.

## Source of Truth
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
