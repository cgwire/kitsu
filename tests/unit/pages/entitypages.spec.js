import { flushPromises, RouterLinkStub, shallowMount } from '@vue/test-utils'
import { nextTick, reactive } from 'vue'
import { createStore } from 'vuex'

// Importing the pages transitively pulls in the root store
// (lib/models → timezone → @/store); stub it so no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))
vi.mock('@unhead/vue', async importOriginal => ({
  ...(await importOriginal()),
  useHead: vi.fn()
}))
vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))
const routeHolder = vi.hoisted(() => ({ route: null }))
vi.mock('vue-router', async importOriginal => ({
  ...(await importOriginal()),
  useRoute: () => routeHolder.route
}))

import Asset from '@/components/pages/Asset.vue'
import Edit from '@/components/pages/Edit.vue'
import Episode from '@/components/pages/Episode.vue'
import Sequence from '@/components/pages/Sequence.vue'
import Shot from '@/components/pages/Shot.vue'

const production = { id: 'production-1' }

const pages = [
  { name: 'Asset', page: Asset, entityParam: 'asset_id', listRoute: 'assets' },
  { name: 'Edit', page: Edit, entityParam: 'edit_id', listRoute: 'edits' },
  {
    name: 'Episode',
    page: Episode,
    entityParam: 'episode_id',
    listRoute: 'episodes'
  },
  {
    name: 'Sequence',
    page: Sequence,
    entityParam: 'sequence_id',
    listRoute: 'sequences'
  },
  { name: 'Shot', page: Shot, entityParam: 'shot_id', listRoute: 'shots' }
]

// The entity of the URL is found nowhere: the page loads nothing and shows
// its empty state.
const mountPage = async (page, entityParam, currentProduction) => {
  routeHolder.route = reactive({
    params: { production_id: production.id, [entityParam]: 'entity-1' },
    query: {},
    path: '/'
  })
  const loadAction = vi.fn(() => Promise.resolve())
  const store = createStore({
    state: () => ({ currentProduction }),
    getters: {
      assetMetadataDescriptors: () => [],
      assetSearchText: () => '',
      currentEpisode: () => null,
      currentProduction: state => state.currentProduction,
      editMetadataDescriptors: () => [],
      episodeMetadataDescriptors: () => [],
      episodeSearchText: () => '',
      getTaskTypePriority: () => () => 1,
      isCurrentUserProductionManager: () => true,
      isCurrentUserProductionSupervisor: () => false,
      isTVShow: () => false,
      linkedConcepts: () => [],
      nbSelectedTasks: () => 0,
      organisation: () => ({}),
      sequenceMetadataDescriptors: () => [],
      sequenceSearchText: () => '',
      shotMetadataDescriptors: () => [],
      shotSearchText: () => '',
      taskMap: () => new Map(),
      taskStatusMap: () => new Map(),
      taskTypeMap: () => new Map(),
      user: () => ({ departments: [] })
    },
    actions: {
      clearSelectedTasks: vi.fn(),
      loadAsset: loadAction,
      loadAssetCastIn: loadAction,
      loadAssetCasting: loadAction,
      loadEdits: loadAction,
      loadEpisodeCasting: loadAction,
      loadEpisodesWithTasks: loadAction,
      loadLinkedConcepts: loadAction,
      loadSequenceCasting: loadAction,
      loadSequencesWithTasks: loadAction,
      loadShot: loadAction,
      loadShotCasting: loadAction
    }
  })
  const wrapper = shallowMount(page, {
    global: {
      plugins: [store],
      mocks: { $route: routeHolder.route, $t: key => key },
      stubs: { RouterLink: RouterLinkStub }
    }
  })
  await flushPromises()
  return { store, wrapper }
}

describe.each(pages)('$name page', ({ entityParam, listRoute, page }) => {
  test('links back to the list of the current production', async () => {
    const { wrapper } = await mountPage(page, entityParam, production)

    expect(wrapper.findComponent(RouterLinkStub).props('to')).toMatchObject({
      name: listRoute,
      params: { production_id: production.id }
    })
  })

  // A user with no open production has none in the store until the topbar
  // has loaded the one of the URL, or left the page when it cannot.
  test('renders once the store holds a production', async () => {
    const { store, wrapper } = await mountPage(page, entityParam, null)

    expect(wrapper.find('.page-header').exists()).toBe(false)

    store.state.currentProduction = production
    await nextTick()

    expect(wrapper.find('.page-header').exists()).toBe(true)
    expect(wrapper.findComponent(RouterLinkStub).props('to')).toMatchObject({
      name: listRoute,
      params: { production_id: production.id }
    })
  })
})
