/**
 * Module: wiki/semantic-governance/sandbox/page
 * Purpose: Provide the VS8 semantic sandbox route shell.
 * Responsibilities: Host experimental semantic simulations and isolated policy experiments.
 * Constraints: Sandbox actions must remain isolated from production projections until approved.
 */

export default function SemanticGovernanceSandboxPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <section className="rounded-2xl bg-card/70 p-6 shadow-sm ring-1 ring-zinc-200/60 backdrop-blur-sm dark:ring-white/10 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">語義沙盒 (Sandbox)</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          這個區域保留給語義實驗與提案模擬，不承載正式關係視覺化。關係圖請使用「關係視覺化」頁面。
        </p>
      </section>
    </main>
  );
}
