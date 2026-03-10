
"use client";

/**
 * AuthBackground - Responsibility: Renders the decorative background effect for the authentication pages.
 */
export function AuthBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 select-none overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,hsl(var(--primary)/0.14),transparent_44%),radial-gradient(circle_at_82%_6%,hsl(var(--accent)/0.2),transparent_36%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--background)))]" />
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -right-28 bottom-8 h-80 w-80 rounded-full bg-accent/25 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.15)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.15)_1px,transparent_1px)] bg-[size:26px_26px] opacity-30" />
    </div>
  );
}
