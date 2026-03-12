/**
 * Module: wiki/semantic-governance/editor/page
 * Purpose: Provide the VS8 semantic editor route shell.
 * Responsibilities: Host semantic-governance editor entry and describe command boundary.
 * Constraints: No direct graph writes; changes must flow through VS8 command APIs.
 */

export default function SemanticGovernanceEditorPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
      <section className="rounded-2xl bg-card/70 p-6 shadow-sm ring-1 ring-zinc-200/60 backdrop-blur-sm dark:ring-white/10 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Semantic Governance Editor</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Canonical route for editing semantic definitions. Wire this page to VS8 proposal and command
          handlers when editor components are ready.
        </p>
      </section>
    </main>
  );
}
