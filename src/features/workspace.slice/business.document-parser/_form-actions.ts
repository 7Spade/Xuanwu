'use server';

import type { WorkItem } from '@/app-runtime/ai/schemas/docu-parse';

export type ActionState = {
  data?: { workItems: WorkItem[] };
  error?: string;
  fileName?: string;
};

export async function extractDataFromDocument(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  void prevState;
  void formData;

  return {
    error: 'Document parser is currently disabled.',
  };
}
