'use server';

/**
 * account-organization.core ??_actions.ts
 *
 * Server actions for core organization lifecycle management.
 *
 * Per docs/architecture/README.md [R4] COMMAND_RESULT_CONTRACT:
 *   All mutations return CommandResult discriminated union.
 *
 * Invariant #1: This BC only writes its own aggregate.
 */

import {
  createOrganization as createOrganizationFacade,
  updateOrganizationSettings as updateOrganizationSettingsFacade,
  deleteOrganization as deleteOrganizationFacade,
  createTeam as createTeamFacade,
} from "@/shared-infra/firebase-client/firestore/firestore.facade";
import { uploadOrganizationAvatar as uploadOrganizationAvatarFacade } from "@/shared-infra/firebase-client/storage/storage.facade";
import {
  type CommandResult,
  commandSuccess,
  commandFailureFrom,
} from "@/shared-kernel";
import type { ThemeConfig } from "@/shared-kernel";

export interface OrganizationOwnerRef {
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

export interface CreateOrganizationCommand {
  readonly organizationName: string;
  readonly owner: OrganizationOwnerRef;
}

export async function createOrganization(
  input: CreateOrganizationCommand
): Promise<CommandResult> {
  try {
    const orgId = await createOrganizationFacade(input.organizationName, input.owner);
    return commandSuccess(orgId, Date.now());
  } catch (err) {
    return commandFailureFrom(
      "CREATE_ORGANIZATION_FAILED",
      err instanceof Error ? err.message : "Failed to create organization"
    );
  }
}

export async function updateOrganizationSettings(
  organizationId: string,
  settings: { name?: string; description?: string; theme?: ThemeConfig | null; photoURL?: string }
): Promise<CommandResult> {
  try {
    await updateOrganizationSettingsFacade(organizationId, settings);
    return commandSuccess(organizationId, Date.now());
  } catch (err) {
    return commandFailureFrom(
      "UPDATE_ORGANIZATION_SETTINGS_FAILED",
      err instanceof Error ? err.message : "Failed to update organization settings"
    );
  }
}

export async function uploadOrganizationAvatar(
  organizationId: string,
  file: File
): Promise<string> {
  return uploadOrganizationAvatarFacade(organizationId, file);
}

export async function deleteOrganization(organizationId: string): Promise<CommandResult> {
  try {
    await deleteOrganizationFacade(organizationId);
    return commandSuccess(organizationId, Date.now());
  } catch (err) {
    return commandFailureFrom(
      "DELETE_ORGANIZATION_FAILED",
      err instanceof Error ? err.message : "Failed to delete organization"
    );
  }
}

export async function setupOrganizationWithTeam(
  input: CreateOrganizationCommand,
  teamName: string,
  teamType: "internal" | "external" = "internal"
): Promise<CommandResult> {
  try {
    const organizationId = await createOrganizationFacade(input.organizationName, input.owner);
    await createTeamFacade(organizationId, teamName, teamType);
    return commandSuccess(organizationId, Date.now());
  } catch (err) {
    return commandFailureFrom(
      "SETUP_ORGANIZATION_WITH_TEAM_FAILED",
      err instanceof Error ? err.message : "Failed to setup organization with team"
    );
  }
}
