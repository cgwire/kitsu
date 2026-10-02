import { flushPromises, shallowMount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))

import '@/lib/auth'

import csv from '@/lib/csv'

import SequenceStatsList from '@/components/lists/SequenceStatsList.vue'
import SequenceStats from '@/components/pages/SequenceStats.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxTaskTypeOptions from '@/components/widgets/ComboboxTaskTypeOptions.vue'
import ComboboxVisibleOptions from '@/components/widgets/ComboboxVisibleOptions.vue'

const status = (count, frames) => ({
  done: { name: 'done', color: '#22d160', count, frames, drawings: 0 }
})
const sequenceStats = {
  all: { all: status(9, 90), layout: status(5, 50), anim: status(4, 40) },
  sq01: { all: status(3, 30), layout: status(1, 10), anim: status(2, 20) },
  sq02: { all: status(6, 60), layout: status(4, 40), anim: status(2, 20) }
}
const sq01 = { id: 'sq01', name: 'SQ01' }
const sq02 = { id: 'sq02', name: 'SQ02' }
const taskTypes = [
  { id: 'layout', name: 'Layout' },
  { id: 'anim', name: 'Animation' }
]

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

let wrapper

const mountPage = async ({ dispatch, getters = {}, query = {} } = {}) => {
  const store = createStore({
    getters: {
      currentEpisode: () => null,
      currentProduction: () => ({ id: 'production-1', name: 'Wing It' }),
      displayedSequences: () => [sq01, sq02],
      isPaperProduction: () => false,
      isShotsLoading: () => false,
      isShotsLoadingError: () => false,
      isTVShow: () => false,
      searchSequenceFilters: () => ({}),
      sequenceMap: () => new Map([sq01, sq02].map(s => [s.id, s])),
      sequenceSearchQueries: () => [],
      sequenceSearchText: () => '',
      sequenceShotCounts: () => ({ sq01: 12, sq02: 3 }),
      sequenceStats: () => sequenceStats,
      shotValidationColumns: () => ['layout', 'anim'],
      taskStatusMap: () => new Map(),
      taskTypeMap: () => new Map(taskTypes.map(t => [t.id, t])),
      ...getters
    }
  })
  store.dispatch = dispatch || vi.fn(() => Promise.resolve())
  await router.push({ path: '/productions/production-1/sequence-stats', query })
  await router.isReady()
  const push = vi.spyOn(router, 'push')
  const replace = vi.spyOn(router, 'replace')
  wrapper = shallowMount(SequenceStats, {
    global: {
      plugins: [store, router],
      mocks: { $t: key => key },
      stubs: { SearchField: false }
    }
  })
  await flushPromises()
  return { store, wrapper, push, replace }
}

const listProps = () => wrapper.findComponent(SequenceStatsList).props()

const taskTypeFilter = () => wrapper.findComponent(ComboboxTaskTypeOptions)

const sequenceFilter = () => wrapper.findComponent(ComboboxVisibleOptions)

const findButton = icon =>
  wrapper
    .findAllComponents(ButtonSimple)
    .find(button => button.props('icon') === icon)

describe('SequenceStats page', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
    vi.restoreAllMocks()
  })

  test('stops loading when a reload fails', async () => {
    let failing = false
    await mountPage({
      dispatch: vi.fn(action =>
        failing && action === 'loadShots'
          ? Promise.reject(new Error(action))
          : Promise.resolve()
      )
    })
    failing = true
    await findButton('refresh').vm.$emit('click')
    await flushPromises()
    expect(listProps().isLoading).toBe(false)
  })

  test('applies the search of the URL at mount, without a history entry', async () => {
    const { store, push, replace } = await mountPage({
      query: { search: 'sq01' }
    })
    expect(store.dispatch).toHaveBeenCalledWith('setSequenceStatsSearch', 'sq01')
    expect(push).not.toHaveBeenCalled()
    expect(replace).toHaveBeenCalledWith({ query: { search: 'sq01' } })
  })

  test('lets the user choose the sequences to display, all by default', async () => {
    await mountPage()
    expect(sequenceFilter().props()).toMatchObject({
      label: 'sequences.title',
      options: [
        { label: 'SQ01', value: 'sq01' },
        { label: 'SQ02', value: 'sq02' }
      ],
      hidden: []
    })
    expect(listProps().entries).toEqual([sq01, sq02])
    expect(listProps().isFiltered).toBe(false)
  })

  test('restores the hidden sequences from the URL', async () => {
    await mountPage({ query: { hiddenSequences: 'sq02' } })
    expect(sequenceFilter().props('hidden')).toEqual(['sq02'])
    expect(listProps().entries).toEqual([sq01])
    expect(listProps().isFiltered).toBe(true)
  })

  test('takes a hidden sequence out of the table, the totals and the URL', async () => {
    const { replace } = await mountPage()
    await sequenceFilter().vm.$emit('update:hidden', ['sq02'])
    expect(listProps().entries).toEqual([sq01])
    const stats = listProps().sequenceStats
    expect(Object.keys(stats).sort()).toEqual(['all', 'sq01'])
    expect(stats.all.all.done.count).toBe(3)
    expect(replace).toHaveBeenCalledWith({ query: { hiddenSequences: 'sq02' } })
  })

  test('lets the user choose the task types to display, all by default', async () => {
    await mountPage()
    expect(taskTypeFilter().props()).toMatchObject({
      label: 'task_types.title',
      taskTypes,
      hidden: []
    })
    expect(listProps().validationColumns).toEqual(['layout', 'anim'])
  })

  test('restores the hidden task types from the URL', async () => {
    await mountPage({ query: { hiddenTaskTypes: 'anim' } })
    expect(taskTypeFilter().props('hidden')).toEqual(['anim'])
    expect(listProps().validationColumns).toEqual(['layout'])
  })

  test('takes a hidden task type out of the columns, the totals and the URL', async () => {
    const { replace } = await mountPage()
    await taskTypeFilter().vm.$emit('update:hidden', ['anim'])
    expect(listProps().validationColumns).toEqual(['layout'])
    const stats = listProps().sequenceStats
    expect(Object.keys(stats.sq01).sort()).toEqual(['all', 'layout'])
    expect(stats.sq01.all.done).toMatchObject({ count: 1, frames: 10 })
    expect(stats.all.all.done).toMatchObject({ count: 5, frames: 50 })
    expect(replace).toHaveBeenCalledWith({
      query: { hiddenTaskTypes: 'anim' }
    })
  })

  test('totals the displayed sequences only', async () => {
    await mountPage({ getters: { displayedSequences: () => [sq01] } })
    const stats = listProps().sequenceStats
    expect(Object.keys(stats).sort()).toEqual(['all', 'sq01'])
    expect(stats.all.all.done).toMatchObject({ count: 3, frames: 30 })
    expect(stats.all.anim.done.count).toBe(2)
  })

  test('gives the shot counts to the list', async () => {
    await mountPage()
    expect(listProps().shotCounts).toEqual({ sq01: 12, sq02: 3 })
  })

  test('exports the displayed sequences and task types only', async () => {
    const generateStatReports = vi
      .spyOn(csv, 'generateStatReports')
      .mockImplementation(() => {})
    await mountPage({
      getters: { displayedSequences: () => [sq01] },
      query: { hiddenTaskTypes: 'anim' }
    })

    await findButton('download').vm.$emit('click')

    const [, exportedStats, , , , countMode] = generateStatReports.mock.calls[0]
    expect(Object.keys(exportedStats).sort()).toEqual(['all', 'sq01'])
    expect(Object.keys(exportedStats.all).sort()).toEqual(['all', 'layout'])
    expect(countMode).toBe('count')
  })

  // Mobile is read-only: the page hides the export through this class.
  test('marks the export button as such', async () => {
    await mountPage()
    expect(findButton('download').classes()).toContain('export-button')
    expect(findButton('refresh').classes()).not.toContain('export-button')
  })

  test('offers the stacked bars and the heatmap as display modes', async () => {
    await mountPage()
    const options = wrapper.findAllComponents(Combobox)[0].props('options')
    expect(options.map(option => option.value)).toEqual([
      'pie',
      'count',
      'bars',
      'heatmap'
    ])
  })

  test('remembers the display mode between visits', async () => {
    await mountPage()
    expect(listProps().displayMode).toBe('pie')
    await wrapper
      .findAllComponents(Combobox)[0]
      .vm.$emit('update:model-value', 'bars')
    wrapper.unmount()

    await mountPage()
    expect(listProps().displayMode).toBe('bars')
  })

  // The scroll position of the store belongs to the Sequences list page.
  test('leaves the scroll position of the sequences page alone', async () => {
    const { store } = await mountPage()
    await wrapper.findComponent(SequenceStatsList).vm.$emit('scroll', 120)
    expect(store.dispatch).not.toHaveBeenCalledWith(
      'setSequenceListScrollPosition',
      120
    )
  })
})
