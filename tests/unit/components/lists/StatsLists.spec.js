import { shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'

vi.mock('@/store', () => ({ default: {} }))

import EpisodeStatsList from '@/components/lists/EpisodeStatsList.vue'
import ProductionAssetTypeList from '@/components/lists/ProductionAssetTypeList.vue'
import SequenceStatsList from '@/components/lists/SequenceStatsList.vue'

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

const mountList = (component, props = {}) => {
  const store = createStore({
    getters: {
      currentEpisode: () => null,
      currentProduction: () => ({ id: 'production-1' }),
      displayedAssetTypesLength: () => 1,
      displayedEpisodesLength: () => 1,
      displayedSequencesLength: () => 1,
      episodeRetakeStats: () => retakeStats,
      episodeSearchText: () => '',
      episodeStats: () => ({}),
      isCurrentUserClient: () => false,
      isTVShow: () => false,
      assetTypeSearchText: () => '',
      sequenceSearchText: () => '',
      taskTypeMap: () => new Map()
    }
  })
  return shallowMount(component, {
    props: { entries: [{ id: 'episode-1', name: 'E01' }], ...props },
    global: { plugins: [store], mocks: { $t: key => key } }
  })
}

// The pages drive these lists through a template ref, so the scroll API must
// stay reachable from the parent.
describe.each([
  ['EpisodeStatsList', EpisodeStatsList, {}],
  ['ProductionAssetTypeList', ProductionAssetTypeList, { assetTypeStats: {} }],
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

  // scope is only valid on header cells.
  test('puts no scope on data cells', () => {
    const wrapper = mountList(component, { ...props, showAll: true })
    expect(wrapper.findAll('td[scope]')).toHaveLength(0)
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
