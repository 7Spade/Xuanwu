export type WorkflowBlockersState = Record<string, number>

export type WorkflowBlockersSource = {
  workflowId: string
  blockedBy?: string[]
}

export function applyWorkflowBlocked(
  state: WorkflowBlockersState,
  workflowId: string,
  blockedByCount: number
): WorkflowBlockersState {
  return {
    ...state,
    [workflowId]: Math.max(1, blockedByCount),
  }
}

export function applyWorkflowUnblocked(
  state: WorkflowBlockersState,
  workflowId: string,
  blockedByCount = 0
): WorkflowBlockersState {
  if (blockedByCount > 0) {
    return {
      ...state,
      [workflowId]: blockedByCount,
    }
  }

  const { [workflowId]: _removed, ...rest } = state
  return rest
}

export function deriveWorkflowBlockersFromSources(
  sources: readonly WorkflowBlockersSource[]
): WorkflowBlockersState {
  // Intentional accumulator mutation for O(n) aggregation without spread cloning.
  return sources.reduce<WorkflowBlockersState>((state, source) => {
    const blockedByCount = source.blockedBy?.length ?? 0
    if (blockedByCount === 0) return state
    state[source.workflowId] = blockedByCount
    return state
  }, {})
}

export function summarizeWorkflowBlockers(state: WorkflowBlockersState) {
  const counts = Object.values(state)
  const totalBlockedByCount = counts.reduce((sum, count) => sum + count, 0)
  return {
    blockedWorkflowCount: counts.length,
    totalBlockedByCount,
    hasBlockedWorkflows: counts.length > 0,
  }
}
