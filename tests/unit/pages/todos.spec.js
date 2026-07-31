import { describe, expect, it } from 'vitest'

// Pre-load the real store to avoid circular-import race from child components.
import '@/lib/auth'

import Todos from '@/components/pages/Todos.vue'

const feedbackStatus = { id: 'status-1', is_feedback_request: true }
const wipStatus = { id: 'status-2', is_feedback_request: false }

const pendingTask = { id: 'task-1', task_status_id: feedbackStatus.id }
const wipTask = { id: 'task-2', task_status_id: wipStatus.id }
// A status created after the context load is missing from the map.
const unknownStatusTask = { id: 'task-3', task_status_id: 'status-3' }

const buildContext = sortedTasks => ({
  sortedTasks,
  taskStatusMap: new Map([
    [feedbackStatus.id, feedbackStatus],
    [wipStatus.id, wipStatus]
  ])
})

describe('Todos page', () => {
  describe('pendingTasks', () => {
    it('keeps the tasks waiting for a feedback', () => {
      const context = buildContext([pendingTask, wipTask])
      expect(Todos.computed.pendingTasks.call(context)).toEqual([pendingTask])
    })

    it('ignores a task whose status is missing from the map', () => {
      const context = buildContext([pendingTask, unknownStatusTask])
      expect(Todos.computed.pendingTasks.call(context)).toEqual([pendingTask])
    })
  })

  describe('notPendingTasks', () => {
    it('keeps the tasks not waiting for a feedback', () => {
      const context = buildContext([pendingTask, wipTask])
      expect(Todos.computed.notPendingTasks.call(context)).toEqual([wipTask])
    })

    it('keeps a task whose status is missing from the map', () => {
      const context = buildContext([wipTask, unknownStatusTask])
      expect(Todos.computed.notPendingTasks.call(context)).toEqual([
        wipTask,
        unknownStatusTask
      ])
    })
  })
})
