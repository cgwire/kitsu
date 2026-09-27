import { flushPromises, shallowMount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))

// Pre-load the real store to avoid circular-import race from child components.
import '@/lib/auth'

import SequenceStatsList from '@/components/lists/SequenceStatsList.vue'
import SequenceStats from '@/components/pages/SequenceStats.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/productions/:production_id/sequence-stats',
      name: 'sequence-stats',
      component: SequenceStats
    }
  ]
})

const mountPage = async dispatch => {
  const store = createStore({
    getters: {
      currentEpisode: () => null,
      currentProduction: () => ({ id: 'production-1', name: 'Wing It' }),
      displayedSequences: () => [],
      isPaperProduction: () => false,
      isShotsLoading: () => false,
      isShotsLoadingError: () => false,
      isTVShow: () => false,
      searchSequenceFilters: () => ({}),
      sequenceMap: () => new Map(),
      sequenceSearchQueries: () => [],
      sequenceSearchText: () => '',
      sequenceStats: () => ({}),
      shotValidationColumns: () => [],
      taskStatusMap: () => new Map(),
      taskTypeMap: () => new Map()
    }
  })
  store.dispatch = dispatch
  await router.push('/productions/production-1/sequence-stats')
  await router.isReady()
  const wrapper = shallowMount(SequenceStats, {
    global: { plugins: [store, router], mocks: { $t: key => key } }
  })
  await flushPromises()
  return wrapper
}

describe('SequenceStats page', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('stops loading when a reload fails', async () => {
    let failing = false
    const wrapper = await mountPage(
      vi.fn(action =>
        failing && action === 'loadShots'
          ? Promise.reject(new Error(action))
          : Promise.resolve()
      )
    )
    failing = true
    const reloadButton = wrapper
      .findAllComponents(ButtonSimple)
      .find(button => button.props('icon') === 'refresh')
    await reloadButton.vm.$emit('click')
    await flushPromises()
    expect(wrapper.findComponent(SequenceStatsList).props('isLoading')).toBe(
      false
    )
  })
})
