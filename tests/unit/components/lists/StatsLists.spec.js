import { shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'

vi.mock('@/store', () => ({ default: {} }))

import EpisodeStatsList from '@/components/lists/EpisodeStatsList.vue'
import ProductionAssetTypeList from '@/components/lists/ProductionAssetTypeList.vue'
import SequenceStatsList from '@/components/lists/SequenceStatsList.vue'
import EmptyList from '@/components/widgets/EmptyList.vue'

const retakeStats = {
  'episode-1': {
    all: {
      max_retake_count: 1,
      evolution: {},
      retake: { count: 1 },
      done: { count: 0 },
      other: { count: 0 }
    }
  }
}

const RouterLinkStub = {
  name: 'RouterLink',
  props: { to: { type: Object, default: () => ({}) } },
  template: '<a><slot /></a>'
}

const mountList = (component, props = {}, getters = {}) => {
  const store = createStore({
    getters: {
      currentEpisode: () => null,
      currentProduction: () => ({ id: 'production-1' }),
      displayedEpisodesLength: () => 1,
      displayedSequencesLength: () => 1,
      episodeRetakeStats: () => retakeStats,
      episodeSearchText: () => '',
      episodeStats: () => ({}),
      isCurrentUserClient: () => false,
      isTVShow: () => false,
      sequenceSearchText: () => '',
      taskTypeMap: () => new Map(),
      ...getters
    }
  })
  return shallowMount(component, {
    props: { entries: [{ id: 'episode-1', name: 'E01' }], ...props },
    global: {
      plugins: [store],
      mocks: { $t: key => key },
      stubs: { RouterLink: RouterLinkStub }
    }
  })
}

// The pages drive these lists through a template ref, so the scroll API must
// stay reachable from the parent.
describe.each([
  ['EpisodeStatsList', EpisodeStatsList, {}],
  ['SequenceStatsList', SequenceStatsList, { sequenceStats: {} }]
])('lists/%s', (name, component, props) => {
  test('restores the scroll position asked by the page', () => {
    const wrapper = mountList(component, props)
    wrapper.vm.setScrollPosition(120)
    expect(wrapper.find('.datatable-wrapper').element.scrollTop).toBe(120)
  })

  test('reports its scroll position to the page', async () => {
    const wrapper = mountList(component, props)
    const body = wrapper.find('.datatable-wrapper')
    body.element.scrollTop = 80
    await body.trigger('scroll')
    expect(wrapper.emitted('scroll')).toEqual([[80]])
  })

})

describe.each([
  ['EpisodeStatsList', EpisodeStatsList, {}],
  ['ProductionAssetTypeList', ProductionAssetTypeList, { assetTypeStats: {} }],
  ['SequenceStatsList', SequenceStatsList, { sequenceStats: {} }]
])('lists/%s', (name, component, props) => {
  // scope is only valid on header cells.
  test('puts no scope on data cells', () => {
    const wrapper = mountList(component, { ...props, showAll: true })
    expect(wrapper.findAll('td[scope]')).toHaveLength(0)
  })
})

describe('lists/ProductionAssetTypeList', () => {
  const entries = [
    { id: 'chars', name: 'Characters' },
    { id: 'props', name: 'Props' }
  ]
  const mountAssetTypes = (props = {}, getters = {}) =>
    mountList(
      ProductionAssetTypeList,
      { entries, assetCounts: { chars: 12, props: 3 }, ...props },
      getters
    )

  test('links an asset type to the assets filtered on it', () => {
    const wrapper = mountAssetTypes()
    expect(wrapper.findComponent(RouterLinkStub).props('to')).toEqual({
      name: 'assets',
      params: { production_id: 'production-1' },
      query: { search: 'type=[Characters]' }
    })
  })

  test('keeps the link inside the current episode', () => {
    const wrapper = mountAssetTypes(
      {},
      { isTVShow: () => true, currentEpisode: () => ({ id: 'episode-1' }) }
    )
    expect(wrapper.findComponent(RouterLinkStub).props('to')).toEqual({
      name: 'episode-assets',
      params: { production_id: 'production-1', episode_id: 'episode-1' },
      query: { search: 'type=[Characters]' }
    })
  })

  test('shows the number of assets of each type', () => {
    const wrapper = mountAssetTypes()
    const counts = wrapper
      .findAll('td.name .asset-count')
      .map(count => count.text())
    expect(counts).toEqual(['12 assets.number', '3 assets.number'])
  })

  test('totals the assets of the displayed types', () => {
    const wrapper = mountAssetTypes()
    expect(wrapper.find('.all-line .asset-count').text()).toBe(
      '15 assets.number'
    )
  })

  test('counts the displayed asset types', () => {
    const wrapper = mountAssetTypes()
    expect(wrapper.find('.nb-asset-types').text()).toBe('2 asset_types.number')
  })

  test('invites to create assets when the production has none', () => {
    const wrapper = mountAssetTypes({ entries: [] })
    expect(wrapper.findComponent(EmptyList).exists()).toBe(true)
  })

  // Hiding every asset type empties the table of a production that has assets.
  test('says that every asset type is hidden rather than that there is no asset', () => {
    const wrapper = mountAssetTypes({ entries: [], isFiltered: true })
    expect(wrapper.findComponent(EmptyList).exists()).toBe(false)
    expect(wrapper.find('.all-hidden').text()).toBe('asset_types.all_hidden')
    expect(wrapper.find('.nb-asset-types').exists()).toBe(false)
  })

  test('keeps the hidden message for an empty table only', () => {
    const wrapper = mountAssetTypes({ isFiltered: true })
    expect(wrapper.find('.all-hidden').exists()).toBe(false)
    expect(wrapper.find('.nb-asset-types').exists()).toBe(true)
  })

  test('hides the total row when no asset type is displayed', () => {
    const wrapper = mountAssetTypes({ entries: [] })
    expect(wrapper.find('.all-line').exists()).toBe(false)
  })
})

describe('lists/EpisodeStatsList', () => {
  const taskTypeMap = () =>
    new Map([['task-type-1', { id: 'task-type-1', name: 'Story', color: '#ff0000' }]])

  // Episode task types have their own route, outside any current episode.
  test('links a column to the episodes task type page', () => {
    const wrapper = mountList(
      EpisodeStatsList,
      { validationColumns: ['task-type-1'] },
      { isTVShow: () => true, currentEpisode: () => null, taskTypeMap }
    )
    expect(wrapper.findComponent(RouterLinkStub).props('to')).toEqual({
      name: 'episodes-task-type',
      params: { production_id: 'production-1', task_type_id: 'task-type-1' }
    })
  })

  test('hides the episode count while loading', () => {
    const wrapper = mountList(EpisodeStatsList, { isLoading: true })
    expect(wrapper.find('.nb-episodes').exists()).toBe(false)
  })
})

// max_retake_count 1 gives two takes: the retake and the current one.
const takeRows = wrapper =>
  wrapper.findAll('td.name').filter(cell => cell.text().startsWith('- Take'))

describe('lists/EpisodeStatsList expander', () => {
  test('toggles the take rows of an episode', async () => {
    const wrapper = mountList(EpisodeStatsList, { dataMode: 'retakes' })
    const expander = wrapper.find('td.expander[role="button"]')
    expect(takeRows(wrapper)).toHaveLength(0)

    await expander.trigger('click')
    expect(takeRows(wrapper)).toHaveLength(2)

    await expander.trigger('click')
    expect(takeRows(wrapper)).toHaveLength(0)
  })

  test('collapses every episode when leaving the retakes mode', async () => {
    const wrapper = mountList(EpisodeStatsList, { dataMode: 'retakes' })
    await wrapper.find('td.expander[role="button"]').trigger('click')
    await wrapper.setProps({ dataMode: 'status' })
    await wrapper.setProps({ dataMode: 'retakes' })
    expect(takeRows(wrapper)).toHaveLength(0)
  })
})
