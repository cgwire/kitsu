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
      episodeSearchText: () => '',
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

  describe('card layout on mobile', () => {
    const status = { done: { name: 'done', color: 'green', count: 1 } }
    const mountCards = () =>
      mountAssetTypes(
        {
          validationColumns: ['modeling'],
          assetTypeStats: {
            all: { all: status, modeling: status },
            chars: { all: status, modeling: status }
          }
        },
        {
          taskTypeMap: () =>
            new Map([
              ['modeling', { id: 'modeling', name: 'Modeling', color: '#ff0000' }]
            ])
        }
      )

    test('opts into the shared card layout', () => {
      expect(mountCards().find('table').classes()).toContain('datatable--cards')
    })

    test('heads each card with its name cell, the total row included', () => {
      const wrapper = mountCards()
      expect(wrapper.findAll('td.name.card-head')).toHaveLength(2)
      expect(wrapper.find('.all-line th.name').classes()).toContain('card-head')
    })

    test('labels each stat with its column', () => {
      const labels = row =>
        row.findAll('stats-cell-stub').map(cell => cell.attributes('data-label'))
      const rows = mountCards().findAll('.datatable-row')
      expect(labels(rows[0])).toEqual(['main.all', 'Modeling'])
      expect(labels(rows[1])).toEqual(['main.all', 'Modeling'])
    })

    // An unlabelled cell is hidden on a card: no empty line for a missing stat.
    test('leaves the cells without stats unlabelled', () => {
      const props = mountCards().findAll('.datatable-row')[2]
      expect(props.findAll('td[data-label]')).toHaveLength(0)
    })
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

describe('lists/SequenceStatsList', () => {
  const entries = [
    { id: 'sq01', name: 'SQ01' },
    { id: 'sq02', name: 'SQ02' }
  ]
  const status = { done: { name: 'done', color: 'green', count: 1 } }
  const mountSequences = (props = {}, getters = {}) =>
    mountList(
      SequenceStatsList,
      {
        entries,
        shotCounts: { sq01: 12, sq02: 3 },
        validationColumns: ['layout'],
        sequenceStats: {
          all: { all: status, layout: status },
          sq01: { all: status, layout: status },
          sq02: { all: status }
        },
        ...props
      },
      {
        taskTypeMap: () =>
          new Map([['layout', { id: 'layout', name: 'Layout', color: '#ff0000' }]]),
        ...getters
      }
    )
  const nameLink = wrapper =>
    wrapper.find('td.name').findComponent(RouterLinkStub)

  test('links a sequence to the shots filtered on it', () => {
    expect(nameLink(mountSequences()).props('to')).toEqual({
      name: 'shots',
      params: { production_id: 'production-1' },
      query: { search: '"SQ01"' }
    })
  })

  test('keeps the link inside the current episode', () => {
    const wrapper = mountSequences(
      {},
      { isTVShow: () => true, currentEpisode: () => ({ id: 'episode-1' }) }
    )
    expect(nameLink(wrapper).props('to')).toEqual({
      name: 'episode-shots',
      params: { production_id: 'production-1', episode_id: 'episode-1' },
      query: { search: '"SQ01"' }
    })
  })

  test('shows the number of shots of each sequence and their total', () => {
    const wrapper = mountSequences()
    const counts = wrapper
      .findAll('td.name .shot-count')
      .map(count => count.text())
    expect(counts).toEqual(['12 shots.number', '3 shots.number'])
    expect(wrapper.find('.all-line .shot-count').text()).toBe('15 shots.number')
  })

  test('counts the displayed sequences', () => {
    expect(mountSequences().find('.nb-sequences').text()).toBe(
      '2 sequences.number'
    )
  })

  // A search drops the sequences without matching shots from the rows.
  test('counts the sequences left by a search', () => {
    const wrapper = mountSequences(
      { sequenceStats: { all: { all: status }, sq01: { all: status } } },
      { sequenceSearchText: () => 'layout=wip' }
    )
    expect(wrapper.findAll('td.name')).toHaveLength(1)
    expect(wrapper.find('.nb-sequences').text()).toBe('1 sequences.number')
  })

  test('says that every sequence is hidden rather than that there is none', () => {
    const wrapper = mountSequences({ entries: [], isFiltered: true })
    expect(wrapper.findComponent(EmptyList).exists()).toBe(false)
    expect(wrapper.find('.all-hidden').text()).toBe('sequences.all_hidden')
    expect(wrapper.find('.nb-sequences').exists()).toBe(false)
  })

  test('shows the total row whenever sequences are displayed', () => {
    expect(mountSequences().find('.all-line').exists()).toBe(true)
    expect(mountSequences({ entries: [] }).find('.all-line').exists()).toBe(
      false
    )
  })

  describe('card layout on mobile', () => {
    test('opts into the shared card layout', () => {
      const wrapper = mountSequences()
      expect(wrapper.find('table').classes()).toContain('datatable--cards')
      expect(wrapper.findAll('td.name.card-head')).toHaveLength(2)
      expect(wrapper.find('.all-line th.name').classes()).toContain('card-head')
    })

    test('labels each stat with its column, cells without stats aside', () => {
      const labels = row =>
        row.findAll('stats-cell-stub').map(cell => cell.attributes('data-label'))
      const rows = mountSequences().findAll('.datatable-row')
      expect(labels(rows[0])).toEqual(['main.all', 'Layout'])
      expect(labels(rows[1])).toEqual(['main.all', 'Layout'])
      expect(labels(rows[2])).toEqual(['main.all'])
      expect(rows[2].findAll('td[data-label]')).toHaveLength(0)
    })
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
    const wrapper = mountEpisodes({ isLoading: true })
    expect(wrapper.find('.nb-episodes').exists()).toBe(false)
  })
})

const mountEpisodes = (props = {}, getters = {}) =>
  mountList(
    EpisodeStatsList,
    { episodeRetakeStats: retakeStats, episodeStats: {}, ...props },
    getters
  )

// max_retake_count 1 gives two takes: the retake and the current one.
const takeRows = wrapper => wrapper.findAll('tr.take-row')

describe('lists/EpisodeStatsList rows', () => {
  const status = { done: { name: 'done', color: 'green', count: 1 } }
  const entries = [
    { id: 'episode-1', name: 'E01' },
    { id: 'episode-2', name: 'E02' }
  ]
  const mountStatus = (props = {}) =>
    mountEpisodes(
      {
        dataMode: 'status',
        entries,
        validationColumns: ['layout'],
        episodeStats: {
          all: { all: status, layout: status },
          'episode-1': { all: status, layout: status },
          'episode-2': { all: status }
        },
        ...props
      },
      {
        taskStatusMap: () => new Map(),
        taskTypeMap: () =>
          new Map([
            ['layout', { id: 'layout', name: 'Layout', color: '#ff0000' }]
          ])
      }
    )

  test('reads the stats the page gives it, total row included', () => {
    const wrapper = mountStatus()
    const rows = wrapper.findAll('.datatable-row')
    expect(rows).toHaveLength(3)
    expect(rows[0].classes()).toContain('all-line')
    expect(rows[1].findAll('stats-cell-stub')).toHaveLength(2)
    expect(rows[2].findAll('stats-cell-stub')).toHaveLength(1)
  })

  test('links an episode to its shots', () => {
    const link = mountStatus()
      .findAll('td.name')[1]
      .findComponent(RouterLinkStub)
    expect(link.props('to')).toEqual({
      name: 'episode-shots',
      params: { production_id: 'production-1', episode_id: 'episode-1' }
    })
  })

  test('counts the displayed episodes', () => {
    expect(mountStatus().find('.nb-episodes').text()).toBe(
      '2 episodes.number'
    )
  })

  test('says that every episode is hidden rather than that there is none', () => {
    const wrapper = mountStatus({ entries: [], isFiltered: true })
    expect(wrapper.findComponent(EmptyList).exists()).toBe(false)
    expect(wrapper.find('.all-hidden').text()).toBe('episodes.all_hidden')
    expect(wrapper.find('.all-line').exists()).toBe(false)
  })

  describe('card layout on mobile', () => {
    test('opts into the shared card layout', () => {
      const wrapper = mountStatus()
      expect(wrapper.find('table').classes()).toContain('datatable--cards')
      expect(wrapper.findAll('td.name.card-head')).toHaveLength(3)
    })

    test('labels each stat with its column, cells without stats aside', () => {
      const labels = row =>
        row.findAll('stats-cell-stub').map(cell => cell.attributes('data-label'))
      const rows = mountStatus().findAll('.datatable-row')
      expect(labels(rows[0])).toEqual(['main.all', 'Layout'])
      expect(labels(rows[1])).toEqual(['main.all', 'Layout'])
      expect(labels(rows[2])).toEqual(['main.all'])
      expect(rows[2].findAll('td[data-label]')).toHaveLength(0)
    })

    // On a phone an expanded episode lists its takes as cards of their own.
    test('turns each take row into a labelled card', async () => {
      const take = retake => ({
        retake: { count: retake },
        other: { count: 0 },
        done: { count: 1 }
      })
      const column = {
        max_retake_count: 1,
        evolution: { 1: take(1), 2: take(0) },
        ...take(0)
      }
      const wrapper = mountEpisodes(
        {
          dataMode: 'retakes',
          validationColumns: ['layout'],
          episodeRetakeStats: { 'episode-1': { all: column, layout: column } },
          episodeStats: { 'episode-1': { all: {}, layout: {} } }
        },
        {
          taskTypeMap: () =>
            new Map([
              ['layout', { id: 'layout', name: 'Layout', color: '#ff0000' }]
            ])
        }
      )
      await wrapper.find('td.expander[role="button"]').trigger('click')
      const takes = wrapper.findAll('tr.take-row')
      expect(takes).toHaveLength(2)
      takes.forEach(row => {
        expect(row.find('td.name').classes()).toContain('card-head')
        expect(
          row.findAll('stats-cell-stub').map(c => c.attributes('data-label'))
        ).toEqual(['Layout'])
      })
    })
  })
})

describe('lists/EpisodeStatsList expander', () => {
  test('toggles the take rows of an episode', async () => {
    const wrapper = mountEpisodes({ dataMode: 'retakes' })
    const expander = wrapper.find('td.expander[role="button"]')
    expect(takeRows(wrapper)).toHaveLength(0)

    await expander.trigger('click')
    expect(takeRows(wrapper)).toHaveLength(2)

    await expander.trigger('click')
    expect(takeRows(wrapper)).toHaveLength(0)
  })

  // Hiding every task type an episode has retakes for empties its total.
  test('expands an episode without retake total into no take row', async () => {
    const wrapper = mountEpisodes({
      dataMode: 'retakes',
      episodeRetakeStats: { 'episode-1': { all: {} } }
    })
    await wrapper.find('td.expander[role="button"]').trigger('click')
    expect(takeRows(wrapper)).toHaveLength(0)
  })

  // Same tag as the "Take N" label of the cells, redder as the takes add up.
  test('tags each take row with its number', async () => {
    const wrapper = mountEpisodes({ dataMode: 'retakes' })
    await wrapper.find('td.expander[role="button"]').trigger('click')
    const tags = wrapper.findAll('tr.take-row td.name .tag')
    expect(tags.map(tag => tag.text())).toEqual(['Take 1', 'Take 2'])
    expect(tags.map(tag => tag.element.style.backgroundColor)).toEqual([
      'rgb(251, 140, 0)',
      'rgb(239, 108, 0)'
    ])
    expect(takeRows(wrapper)[0].find('td.name').text()).toBe('Take 1')
  })

  // The rail of the take rows stops short at both ends of the group.
  test('marks the first and the last take row', async () => {
    const wrapper = mountEpisodes({ dataMode: 'retakes' })
    await wrapper.find('td.expander[role="button"]').trigger('click')
    const [first, last] = takeRows(wrapper)
    expect(first.classes()).toContain('take-row--first')
    expect(first.classes()).not.toContain('take-row--last')
    expect(last.classes()).toContain('take-row--last')
    expect(last.classes()).not.toContain('take-row--first')
  })

  test('collapses every episode when leaving the retakes mode', async () => {
    const wrapper = mountEpisodes({ dataMode: 'retakes' })
    await wrapper.find('td.expander[role="button"]').trigger('click')
    await wrapper.setProps({ dataMode: 'status' })
    await wrapper.setProps({ dataMode: 'retakes' })
    expect(takeRows(wrapper)).toHaveLength(0)
  })
})
