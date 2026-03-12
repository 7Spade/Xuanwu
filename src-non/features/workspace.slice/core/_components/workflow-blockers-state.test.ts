import { describe, expect, it } from 'vitest'

import {
  applyWorkflowBlocked,
  applyWorkflowUnblocked,
  deriveWorkflowBlockersFromSources,
  summarizeWorkflowBlockers,
} from './workflow-blockers-state'

describe('workflow blockers state', () => {
  it('tracks blocked workflow count with minimum blocker of one', () => {
    const next = applyWorkflowBlocked({}, 'wf-1', 0)
    expect(next).toEqual({ 'wf-1': 1 })
  })

  it('removes workflow from state when unblocked', () => {
    const blocked = applyWorkflowBlocked({}, 'wf-1', 2)
    const next = applyWorkflowUnblocked(blocked, 'wf-1', 0)
    expect(next).toEqual({})
  })

  it('keeps workflow in state when still blocked by more issues', () => {
    const blocked = applyWorkflowBlocked({}, 'wf-1', 3)
    const next = applyWorkflowUnblocked(blocked, 'wf-1', 2)
    expect(next).toEqual({ 'wf-1': 2 })
  })

  it('derives blocker state from persisted workflow aggregates', () => {
    const state = deriveWorkflowBlockersFromSources([
      { workflowId: 'wf-1', blockedBy: ['issue-1', 'issue-2'] },
      { workflowId: 'wf-2', blockedBy: [] },
      { workflowId: 'wf-3' },
      { workflowId: 'wf-4', blockedBy: ['issue-3'] },
    ])

    expect(state).toEqual({
      'wf-1': 2,
      'wf-4': 1,
    })
  })

  it('summarizes blocked workflows and total blockers', () => {
    const summary = summarizeWorkflowBlockers({ 'wf-1': 2, 'wf-2': 1 })
    expect(summary).toEqual({
      blockedWorkflowCount: 2,
      totalBlockedByCount: 3,
      hasBlockedWorkflows: true,
    })
  })
})
