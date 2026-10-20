import { flushPromises, mount } from '@vue/test-utils'
import { computed, defineComponent, onMounted, ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createStore } from 'vuex'
import { describe, expect, it, vi } from 'vitest'

// Pre-load the real store to avoid a circular-import race from the modules.
import '@/lib/auth'

import { useEntity } from '@/composables/entity'

const entities = [{ id: 'entity-0' }, { id: 'entity-1' }, { id: 'entity-2' }]

const mountEntity = async ({
  type = 'shot',
  path = '/productions/production-1/episodes/episode-1/shots/entity-1',
  list = { key: 'production-1/episode-1', isLoading: false },
  getters = {},
  loadList
} = {}) => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/productions/:production_id/episodes/:episode_id/:section/:id',
        component: { template: '<div />' }
      },
      { path: '/:path(.*)*', component: { template: '<div />' } }
    ]
  })
  await router.push(path)
  // The shots store records the scope of its last list load, and raises its
  // loading flag meanwhile.
  const store = createStore({
    state: { list },
    mutations: {
      LOAD_START: (state, key) => {
        state.list = { key, isLoading: true }
      },
      LOAD_END: state => {
        state.list = { ...state.list, isLoading: false }
      },
      MARK_PARTIAL: state => {
        state.list = { ...state.list, key: `${state.list.key}#partial` }
      }
    },
    getters: {
      currentEpisode: () => ({ id: 'episode-1' }),
      currentProduction: () => ({ id: 'production-1' }),
      getTaskTypePriority: () => () => 1,
      isCurrentUserProductionManager: () => false,
      isCurrentUserProductionSupervisor: () => false,
      isShotsLoading: state => state.list.isLoading,
      isTVShow: () => true,
      nbSelectedTasks: () => 0,
      organisation: () => ({}),
      shotsLoadingKey: state => state.list.key,
      taskMap: () => new Map(),
      taskTypeMap: () => new Map(),
      user: () => ({ departments: [] }),
      ...getters
    }
  })
  let paths
  const Host = defineComponent({
    setup() {
      // As the pages: the entity shows once their init has found it.
      const currentEntity = ref(null)
      paths = useEntity({
        type,
        currentEntity,
        entityList: computed(() => entities),
        init: () => {},
        loadList: loadList && (() => loadList(store))
      })
      onMounted(() => {
        currentEntity.value = entities[1]
      })
      return () => null
    }
  })
  mount(Host, { global: { plugins: [router, store] } })
  await flushPromises()
  const neighbor = path => path.value?.params[`${type}_id`] ?? null
  return {
    neighbors: () => [
      neighbor(paths.previousEntityPath),
      neighbor(paths.nextEntityPath)
    ],
    nextEntityPath: () => paths.nextEntityPath.value
  }
}

describe('useEntity', () => {
  describe('previous and next entities', () => {
    it('walks the list loaded for the episode of the page', async () => {
      const { neighbors, nextEntityPath } = await mountEntity()
      expect(neighbors()).toEqual(['entity-0', 'entity-2'])
      expect(nextEntityPath().params.episode_id).toBe('episode-1')
    })

    // The page loads its entity by id into the list held by the store, which
    // then records its scope as extended.
    it('offers no link over the list of another episode', async () => {
      const { neighbors } = await mountEntity({
        list: { key: 'production-1/episode-3#partial', isLoading: false }
      })
      expect(neighbors()).toEqual([null, null])
    })

    it('offers no link over the list of all episodes on a page of one', async () => {
      const { neighbors } = await mountEntity({
        list: { key: 'production-1/all', isLoading: false }
      })
      expect(neighbors()).toEqual([null, null])
    })

    it('offers no link while the list loads', async () => {
      const { neighbors } = await mountEntity({
        list: { key: 'production-1/episode-1', isLoading: true }
      })
      expect(neighbors()).toEqual([null, null])
    })

    it('walks the list of a production without episodes', async () => {
      const { neighbors } = await mountEntity({
        path: '/productions/production-1/shots/entity-1',
        list: { key: 'production-1/', isLoading: false },
        getters: { currentEpisode: () => null, isTVShow: () => false }
      })
      expect(neighbors()).toEqual(['entity-0', 'entity-2'])
    })

    it('walks the episodes, listed for the whole production', async () => {
      const { neighbors } = await mountEntity({ type: 'episode' })
      expect(neighbors()).toEqual(['entity-0', 'entity-2'])
    })
  })

  describe('list of the page', () => {
    const otherList = { key: 'production-1/episode-3#partial', isLoading: false }

    it('loads the list of the page when the store holds another one', async () => {
      const loadList = vi.fn(() => Promise.resolve())
      await mountEntity({ list: otherList, loadList })
      expect(loadList).toHaveBeenCalledTimes(1)
    })

    it('offers the arrows once that list is loaded', async () => {
      const { neighbors } = await mountEntity({
        list: otherList,
        loadList: store => {
          store.commit('LOAD_START', 'production-1/episode-1')
          store.commit('LOAD_END')
          return Promise.resolve()
        }
      })
      expect(neighbors()).toEqual(['entity-0', 'entity-2'])
    })

    // A URL whose episode is not the one of its entity: the list loaded lacks
    // the entity, which the page loads into it again.
    it('loads the list once for an entity', async () => {
      const loadList = vi.fn(store => {
        store.commit('LOAD_START', 'production-1/episode-1')
        store.commit('LOAD_END')
        store.commit('MARK_PARTIAL')
        return Promise.resolve()
      })
      const { neighbors } = await mountEntity({ list: otherList, loadList })
      expect(loadList).toHaveBeenCalledTimes(1)
      expect(neighbors()).toEqual([null, null])
    })

    it('loads nothing when the store holds the list of the page', async () => {
      const loadList = vi.fn(() => Promise.resolve())
      await mountEntity({ loadList })
      expect(loadList).not.toHaveBeenCalled()
    })

    it('loads nothing for a TV show page without an episode in its URL', async () => {
      const loadList = vi.fn(() => Promise.resolve())
      await mountEntity({
        path: '/productions/production-1/shots/entity-1',
        list: otherList,
        loadList
      })
      expect(loadList).not.toHaveBeenCalled()
    })
  })
})
