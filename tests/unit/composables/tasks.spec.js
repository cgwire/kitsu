// @vitest-environment node
import { createApp } from 'vue'
import { createStore } from 'vuex'

import { useTaskHelpers } from '@/composables/tasks'

const taskType = { id: 'task-type-1', name: 'Animation', for_entity: 'Shot' }
const tvShow = {
  id: 'production-1',
  production_type: 'tvshow',
  first_episode_id: 'episode-1'
}

const setup = ({ taskTypes = [taskType], productions = [] } = {}) => {
  const store = createStore({
    getters: {
      personMap: () => new Map(),
      productionMap: () => new Map(productions.map(p => [p.id, p])),
      taskTypeMap: () => new Map(taskTypes.map(t => [t.id, t]))
    }
  })
  return createApp({}).use(store).runWithContext(useTaskHelpers)
}

describe('useTaskHelpers', () => {
  describe('getTaskType', () => {
    test('scopes a known task type to the task episode', () => {
      const { getTaskType } = setup()

      expect(
        getTaskType({
          task_type_id: taskType.id,
          project_id: 'production-1',
          episode_id: 'episode-2'
        })
      ).toEqual({ ...taskType, episode_id: 'episode-2' })
    })

    test('falls back to the first episode of a TV show', () => {
      const { getTaskType } = setup({ productions: [tvShow] })

      expect(
        getTaskType({
          task_type_id: taskType.id,
          project_id: tvShow.id,
          episode_id: null
        })
      ).toEqual({ ...taskType, episode_id: 'episode-1' })
    })

    // The task cards hand the result to TaskTypeName: a task type missing
    // from the map must not become a partial object the tag renders empty.
    test('returns null for a task type missing from the map', () => {
      const { getTaskType } = setup({ taskTypes: [] })

      expect(
        getTaskType({
          task_type_id: 'task-type-2',
          project_id: 'production-1',
          episode_id: 'episode-2'
        })
      ).toBeNull()
    })
  })
})
