---
name: apple-appstore-reviewer
description: 'Review the codebase for Apple App Store guideline compliance, common rejection reasons, and optimization opportunities. Use when preparing a mobile app for App Store submission or auditing for policy violations. Triggers: "app store review", "apple review", "iOS submission", "app rejection", "appstore guidelines", "apple compliance".'
---

# Apple Appstore Reviewer

## When to Use
- Preparing for a new App Store submission or an update
- Auditing a mobile codebase for common rejection reasons
- Checking compliance with Apple Human Interface Guidelines and App Store Review Guidelines

## Prerequisites
- Access to the project source code (iOS/React Native/Flutter/etc.)
- Knowledge of the target iOS version and device support
- Review Apple App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/

## Workflow
1. Check privacy API declarations: ensure all APIs that access photos, location, contacts, etc. have usage description strings in `Info.plist`.
2. Review in-app purchase flows: all digital goods must use StoreKit; no external payment links allowed.
3. Inspect content: flag objectionable, violent, or adult content that lacks appropriate age rating.
4. Check required metadata: app icon (1024×1024), screenshots for each required device, privacy policy URL.
5. Verify network security: ensure `NSAppTransportSecurity` exceptions are justified.
6. Review push notification usage: must not use for marketing without explicit user consent.
7. Check for third-party SDKs with known rejection history (e.g., unapproved fingerprinting).
8. Flag any UI that mimics iOS system interfaces in a deceptive way.

## Output Contract
- Produce a checklist of findings grouped by severity: Blocker / Warning / Suggestion.
- Each finding must reference the specific App Store Review Guideline section.
- Include recommended remediation steps for each Blocker.

## Guardrails
- Do not modify source code during review — report findings only.
- Flag findings even if probability of rejection is low; let the team decide.
- Do not expose user data found in source files.

## Source of Truth
- Apple App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
