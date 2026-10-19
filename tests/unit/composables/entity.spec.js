import { mount } from '@vue/test-utils'
import { computed, defineComponent, ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createStore } from 'vuex'
import { describe, expect, it } from 'vitest'

// Pre-load the real store to avoid a circular-import race from the modules.
import '@/lib/auth'

import { useEntity } from '@/composables/entity'

const entities = [{ id: 'entity-0' }, { id: 'entity-1' }, { id: 'entity-2' }]

const mountEntity = async ({ type = 'shot', getters = {} } = {}) => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/:path(.*)*', component: { template: '<div />' } }]
  })
  await router.push('/')
  const store = createStore({
    getters: {
      currentEpisode: () => ({ id: 'episode-1' }),
      currentProduction: () => ({ id: 'production-1' }),
      getTaskTypePriority: () => () => 1,
      isCurrentUserProductionManager: () => false,
      isCurrentUserProductionSupervisor: () => false,
      isTVShow: () => true,
      nbSelectedTasks: () => 0,
      organisation: () => ({}),
      shotsLoadingKey: () => 'production-1/episode-1',
      taskMap: () => new Map(),
      taskTypeMap: () => new Map(),
      user: () => ({ departments: [] }),
      ...getters
    }
  })
  let paths
  const Host = defineComponent({
    setup() {
      paths = useEntity({
        type,
        currentEntity: ref(entities[1]),
        entityList: computed(() => entities),
        init: () => {}
      })
      return () => null
    }
  })
  mount(Host, { global: { plugins: [router, store] } })
  const neighbor = path => path.value?.params[`${type}_id`] ?? null
  return {
    neighbors: [neighbor(paths.previousEntityPath), neighbor(paths.nextEntityPath)],
    nextEntityPath: paths.nextEntityPath.value
  }
}

describe('useEntity', () => {
  describe('previous and next entities', () => {
    it('walks the list loaded for the episode of the page', async () => {
      const { neighbors, nextEntityPath } = await mountEntity()
      expect(neighbors).toEqual(['entity-0', 'entity-2'])
      expect(nextEntityPath.params.episode_id).toBe('episode-1')
    })

    // The page loads its entity by id into the list held by the store, which
    // then records its scope as extended.
    it('offers no link over the list of another episode', async () => {
      const { neighbors } = await mountEntity({
        getters: { shotsLoadingKey: () => 'production-1/episode-3#partial' }
      })
      expect(neighbors).toEqual([null, null])
    })

    it('offers no link over the list of all episodes on a page of one', async () => {
      const { neighbors } = await mountEntity({
        getters: { shotsLoadingKey: () => 'production-1/all' }
      })
      expect(neighbors).toEqual([null, null])
    })

    it('walks the list of a production without episodes', async () => {
      const { neighbors } = await mountEntity({
        getters: {
          currentEpisode: () => null,
          isTVShow: () => false,
          shotsLoadingKey: () => 'production-1/'
        }
      })
      expect(neighbors).toEqual(['entity-0', 'entity-2'])
    })

    it('walks the episodes, listed for the whole production', async () => {
      const { neighbors } = await mountEntity({ type: 'episode' })
      expect(neighbors).toEqual(['entity-0', 'entity-2'])
    })
  })
})
