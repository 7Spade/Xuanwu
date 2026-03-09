/**
 * Module: login/page
 * Purpose: Provide a stable login route alias for legacy and direct links.
 * Responsibilities: Redirect /login traffic to the public landing auth entry.
 * Constraints: deterministic logic, respect module boundaries
 */
import { redirect } from "next/navigation";

export default function LoginAliasPage() {
  redirect("/");
}
