---
name: Xuanwu Security Guidelines
description: Secure coding and secret management rules
applyTo: "**/*.{ts,tsx,js,jsx,json,yaml,yml}"
---

# Security Guidelines

## Secrets

Never commit secrets to the repository.

Avoid storing:

- API keys
- tokens
- passwords
- private credentials

Use environment variables instead.

Example

process.env.API_KEY

## Input validation

Always validate:

- user input
- API payloads
- query parameters

Reject invalid input early.

## Dependencies

Avoid outdated or vulnerable libraries.

Prefer actively maintained dependencies.

## Data exposure

Do not expose sensitive data in:

- logs
- error messages
- API responses

## Authentication

Always enforce authentication and authorization checks in backend logic.