import { vi } from 'vitest'

vi.mock('@/store', () => ({ default: {} }))

import TeamSchedule from '@/components/pages/TeamSchedule.vue'

describe('TeamSchedule page', () => {
  describe('preview-file:set-main socket handler', () => {
    // The unassigned tasks are enriched copies kept in component state, so
    // no store mutation can refresh their thumbnail.
    const fire = (context, eventData) =>
      TeamSchedule.socket.events['preview-file:set-main'].call(
        context,
        eventData
      )

    test('refreshes the thumbnail of the tasks of the entity', () => {
      const context = {
        unassignedTasks: [
          { id: 'task-1', entity_id: 'entity-1', entity_preview_file_id: '' },
          {
            id: 'task-2',
            entity_id: 'entity-1',
            entity_preview_file_id: 'old'
          },
          {
            id: 'task-3',
            entity_id: 'entity-2',
            entity_preview_file_id: 'old'
          }
        ]
      }

      fire(context, {
        entity_id: 'entity-1',
        preview_file_id: 'preview-1'
      })

      expect(
        context.unassignedTasks.map(task => task.entity_preview_file_id)
      ).toEqual(['preview-1', 'preview-1', 'old'])
    })

    test('ignores an entity absent from the panel', () => {
      const context = {
        unassignedTasks: [
          { id: 'task-1', entity_id: 'entity-1', entity_preview_file_id: 'old' }
        ]
      }

      fire(context, { entity_id: 'entity-9', preview_file_id: 'preview-1' })

      expect(context.unassignedTasks[0].entity_preview_file_id).toEqual('old')
    })
  })
})
