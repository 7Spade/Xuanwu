/**
 * Module: page.tsx
 * Purpose: Organization semantic dictionary standalone route.
 * Responsibilities: Render the OrgSemanticDictionaryPanel within the dashboard shell.
 * Constraints: organization.slice owns semantic dictionary semantics; keep business logic inside feature slices.
 */
import { OrgSemanticDictionaryPanel } from "@/features/organization.slice";

export default function SemanticDictionaryPage() {
  return <OrgSemanticDictionaryPanel />;
}
