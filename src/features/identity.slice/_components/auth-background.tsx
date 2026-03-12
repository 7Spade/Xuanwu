
"use client";

/**
 * Module: auth-background
 * Purpose: Provide visual backdrop for identity dialogs and pages.
 * Responsibilities: render decorative gradients and texture overlays
 * Constraints: deterministic logic, respect module boundaries
 */

/**
 * AuthBackground - Responsibility: Renders the decorative background effect for the authentication pages.
 */
export function AuthBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 select-none overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,hsl(var(--primary)/0.18),transparent_42%),radial-gradient(circle_at_84%_10%,hsl(var(--accent)/0.26),transparent_34%),linear-gradient(140deg,hsl(var(--background))_10%,hsl(var(--muted)/0.5)_100%)]" />
      <div className="absolute -left-20 top-8 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -right-24 bottom-4 h-80 w-80 rounded-full bg-accent/30 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--border)/0.35)_0.75px,transparent_0.75px)] bg-[size:24px_24px] opacity-25" />
    </div>
  );
}
