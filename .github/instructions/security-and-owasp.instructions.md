---
applyTo: '**'
description: "Comprehensive secure coding instructions for all languages and frameworks, based on OWASP Top 10 and industry best practices."
---
# Secure Coding Rules (OWASP-aligned)

Apply these rules to all generated, reviewed, and refactored code.

## Access Control and SSRF

- MUST enforce least privilege and deny-by-default authorization checks.
- MUST validate user-provided URLs with allowlisted protocol, host, port, and path.
- MUST prevent path traversal by normalizing and constraining file-system paths.

## Secrets and Cryptography

- MUST NOT hardcode secrets; load them from environment variables or secret stores.
- MUST use modern password hashing (`argon2`, `bcrypt`) with salt.
- MUST use HTTPS for transport and strong encryption for sensitive data at rest.

## Injection and XSS

- MUST use parameterized queries for all database access.
- MUST avoid shell interpolation with untrusted input.
- MUST render untrusted content as text by default and sanitize HTML when HTML rendering is required.

## Secure Configuration

- SHOULD disable debug and verbose error output in production.
- SHOULD set security headers including CSP, HSTS, and `X-Content-Type-Options`.
- MUST keep dependencies updated and recommend vulnerability scanning tools when dependencies change.

## Authentication and Sessions

- MUST rotate session identifiers after authentication.
- MUST set session cookies with `HttpOnly`, `Secure`, and `SameSite=Strict` unless explicit exception is required.
- SHOULD recommend brute-force protection through rate limits and lockout policies.

## Integrity and Review Behavior

- MUST avoid insecure deserialization of untrusted payloads.
- MUST explain the security risk and mitigation whenever suggesting a security-sensitive change.
