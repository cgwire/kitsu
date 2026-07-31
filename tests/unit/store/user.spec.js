import { vi } from 'vitest'

// Importing the user module transitively pulls in the root store
// (lib/models → timezone → @/store); stub it so no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))

import store from '@/store/modules/user'

describe('User store', () => {
  // The todo lists render their own task objects, absent from the tasks
  // module taskMap: the entity modules cannot refresh them.
  describe('SET_PREVIEW', () => {
    test('refreshes the todo and done lists of the entity', () => {
      const todo = { id: 'task-1', entity_id: 'entity-1' }
      const done = { id: 'task-2', entity_id: 'entity-1' }
      const other = { id: 'task-3', entity_id: 'entity-2' }
      const state = {
        todos: [todo, other],
        displayedDoneTasks: [done]
      }

      store.mutations.SET_PREVIEW(state, {
        entityId: 'entity-1',
        previewId: 'preview-1'
      })

      expect(todo.entity_preview_file_id).toEqual('preview-1')
      expect(done.entity_preview_file_id).toEqual('preview-1')
      expect(other.entity_preview_file_id).toBeUndefined()
    })
  })
})
