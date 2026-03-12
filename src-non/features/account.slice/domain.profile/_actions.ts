/**
 * @fileoverview user.commands.ts - Pure business logic for user account operations.
 * @description Contains framework-agnostic action functions for creating user
 * accounts and managing user profiles. These functions can be called from React
 * hooks, context, or future Server Actions without any React dependencies.
 *
 * Per 00-logic-overview.md [R4] COMMAND_RESULT_CONTRACT:
 *   All mutations return CommandResult discriminated union.
 */

import {
  createUserAccount as createUserAccountFacade,
  updateUserProfile as updateUserProfileFacade,
} from "@/shared-infra/firebase-client/firestore/firestore.facade";
import { uploadProfilePicture as uploadProfilePictureFacade } from "@/shared-infra/firebase-client/storage/storage.facade";
import {
  type CommandResult,
  commandSuccess,
  commandFailureFrom,
} from "@/shared-kernel";
import type { Account } from "@/shared-kernel";

export async function createUserAccount(
  userId: string,
  name: string,
  email: string
): Promise<CommandResult> {
  try {
    await createUserAccountFacade(userId, name, email);
    return commandSuccess(userId, Date.now());
  } catch (err) {
    return commandFailureFrom(
      "CREATE_USER_ACCOUNT_FAILED",
      err instanceof Error ? err.message : "Failed to create user account"
    );
  }
}

export async function updateUserProfile(
  userId: string,
  data: Partial<Account>
): Promise<CommandResult> {
  try {
    await updateUserProfileFacade(userId, data);
    return commandSuccess(userId, Date.now());
  } catch (err) {
    return commandFailureFrom(
      "UPDATE_USER_PROFILE_FAILED",
      err instanceof Error ? err.message : "Failed to update user profile"
    );
  }
}

/**
 * Uploads a profile picture for the given user and returns the download URL.
 */
export async function uploadUserAvatar(
  userId: string,
  file: File,
): Promise<string> {
  return uploadProfilePictureFacade(userId, file);
}
