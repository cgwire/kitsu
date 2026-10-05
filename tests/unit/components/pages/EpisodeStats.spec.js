import { flushPromises, shallowMount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))

import '@/lib/auth'

import csv from '@/lib/csv'

import EpisodeStatsList from '@/components/lists/EpisodeStatsList.vue'
import EpisodeStats from '@/components/pages/EpisodeStats.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxTaskTypeOptions from '@/components/widgets/ComboboxTaskTypeOptions.vue'
import ComboboxVisibleOptions from '@/components/widgets/ComboboxVisibleOptions.vue'

const status = count => ({
  done: { name: 'done', color: '#22d160', count, frames: 0, drawings: 0 }
})
const retake = (retakes, done, max) => ({
  max_retake_count: max,
  evolution: {},
  retake: { count: retakes, frames: 0, drawings: 0 },
  done: { count: done, frames: 0, drawings: 0 },
  other: { count: 0, frames: 0, drawings: 0 }
})
// The server totals a shot once whatever its task types: its "all" is not the
// sum of the columns.
const episodeStats = {
  all: { all: status(7), layout: status(5), anim: status(4) },
  e01: { all: status(2), layout: status(1), anim: status(2) },
  e02: { all: status(5), layout: status(4), anim: status(2) }
}
const episodeRetakeStats = {
  all: { all: retake(4, 4, 2), layout: retake(3, 3, 1), anim: retake(3, 3, 2) },
  e01: { all: retake(1, 1, 1), layout: retake(1, 1, 1), anim: retake(1, 1, 1) },
  e02: { all: retake(3, 3, 2), layout: retake(2, 2, 1), anim: retake(2, 2, 2) }
}
const e01 = { id: 'e01', name: 'E01', status: 'running' }
const e02 = { id: 'e02', name: 'E02', status: 'complete' }
const taskTypes = [
  { id: 'layout', name: 'Layout' },
  { id: 'anim', name: 'Animation' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/productions/:production_id/episode-stats',
      name: 'episode-stats',
      component: EpisodeStats
    }
  ]
})

let wrapper

const mountPage = async ({ getters = {}, query = {} } = {}) => {
  const store = createStore({
    getters: {
      currentProduction: () => ({ id: 'production-1', name: 'Wing It' }),
      displayedEpisodes: () => [e01, e02],
      episodeMap: () => new Map([e01, e02].map(e => [e.id, e])),
      episodeRetakeStats: () => episodeRetakeStats,
      episodeSearchText: () => '',
      episodeStats: () => episodeStats,
      episodeValidationColumns: () => ['layout', 'anim'],
      isPaperProduction: () => false,
      taskStatusMap: () => new Map(),
      taskTypeMap: () => new Map(taskTypes.map(t => [t.id, t])),
      ...getters
    }
  })
  store.dispatch = vi.fn(() => Promise.resolve())
  await router.push({ path: '/productions/production-1/episode-stats', query })
  await router.isReady()
  const push = vi.spyOn(router, 'push')
  const replace = vi.spyOn(router, 'replace')
  wrapper = shallowMount(EpisodeStats, {
    global: {
      plugins: [store, router],
      mocks: { $t: key => key },
      stubs: { SearchField: false }
    }
  })
  await flushPromises()
  return { store, wrapper, push, replace }
}

const listProps = () => wrapper.findComponent(EpisodeStatsList).props()

const episodeFilter = () => wrapper.findComponent(ComboboxVisibleOptions)
const taskTypeFilter = () => wrapper.findComponent(ComboboxTaskTypeOptions)

const combobox = label =>
  wrapper
    .findAllComponents(Combobox)
    .find(box => box.props('label') === label)

const findButton = icon =>
  wrapper
    .findAllComponents(ButtonSimple)
    .find(button => button.props('icon') === icon)

// The page opens on the running episodes only.
const showAllEpisodes = () =>
  combobox('statistics.episode_status').vm.$emit('update:model-value', 'all')

describe('EpisodeStats page', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
    vi.restoreAllMocks()
  })

  test('applies the search of the URL at mount, without a history entry', async () => {
    const { store, push, replace } = await mountPage({
      query: { search: 'e01' }
    })
    expect(store.dispatch).toHaveBeenCalledWith('setEpisodeSearch', 'e01')
    expect(push).not.toHaveBeenCalled()
    expect(replace).toHaveBeenCalledWith({ query: { search: 'e01' } })
  })

  test('lets the user choose among the episodes of the current status filter', async () => {
    await mountPage()
    expect(episodeFilter().props()).toMatchObject({
      label: 'episodes.title',
      options: [{ label: 'E01', value: 'e01' }],
      hidden: []
    })
    await showAllEpisodes()
    expect(episodeFilter().props('options')).toEqual([
      { label: 'E01', value: 'e01' },
      { label: 'E02', value: 'e02' }
    ])
    expect(listProps().entries).toEqual([e01, e02])
    expect(listProps().isFiltered).toBe(false)
  })

  test('takes a hidden episode out of the table, the totals and the URL', async () => {
    const { replace } = await mountPage()
    await showAllEpisodes()
    await episodeFilter().vm.$emit('update:hidden', ['e02'])
    expect(listProps().entries).toEqual([e01])
    expect(listProps().isFiltered).toBe(true)
    expect(Object.keys(listProps().episodeStats).sort()).toEqual(['all', 'e01'])
    expect(listProps().episodeStats.all.all.done.count).toBe(2)
    expect(listProps().episodeRetakeStats.all.all.retake.count).toBe(1)
    expect(replace).toHaveBeenCalledWith({ query: { hiddenEpisodes: 'e02' } })
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

  // The totals of the server are kept as long as every column is displayed.
  test('keeps the totals of the server while no task type is hidden', async () => {
    await mountPage()
    expect(listProps().episodeStats.e01).toBe(episodeStats.e01)
    expect(listProps().episodeRetakeStats.e01).toBe(episodeRetakeStats.e01)
  })

  test('takes a hidden task type out of the columns and of the totals', async () => {
    await mountPage({ query: { hiddenTaskTypes: 'anim' } })
    expect(taskTypeFilter().props('hidden')).toEqual(['anim'])
    expect(listProps().validationColumns).toEqual(['layout'])
    const stats = listProps().episodeStats
    expect(Object.keys(stats.e01).sort()).toEqual(['all', 'layout'])
    expect(stats.e01.all.done.count).toBe(1)
    const retakeStats = listProps().episodeRetakeStats
    expect(Object.keys(retakeStats.e01).sort()).toEqual(['all', 'layout'])
    expect(retakeStats.e01.all).toMatchObject({
      max_retake_count: 1,
      retake: { count: 1 }
    })
  })

  // The page is reused from a production to the next: the new URL starts
  // without any filter.
  test('follows the hidden ids of the URL when the route changes', async () => {
    await mountPage({
      query: { hiddenEpisodes: 'e01', hiddenTaskTypes: 'anim' }
    })
    await router.push({ path: '/productions/production-2/episode-stats' })
    await flushPromises()
    expect(episodeFilter().props('hidden')).toEqual([])
    expect(taskTypeFilter().props('hidden')).toEqual([])
    expect(listProps().entries).toEqual([e01])
    expect(listProps().validationColumns).toEqual(['layout', 'anim'])
  })

  test('exports the displayed episodes and task types, in the current data mode', async () => {
    const generateRetakeStatReports = vi
      .spyOn(csv, 'generateRetakeStatReports')
      .mockImplementation(() => {})
    const generateStatReports = vi
      .spyOn(csv, 'generateStatReports')
      .mockImplementation(() => {})
    await mountPage({ query: { hiddenTaskTypes: 'anim' } })

    await findButton('download').vm.$emit('click')
    const [, retakeStats] = generateRetakeStatReports.mock.calls[0]
    expect(Object.keys(retakeStats).sort()).toEqual(['all', 'e01'])
    expect(Object.keys(retakeStats.all).sort()).toEqual(['all', 'layout'])

    await combobox('statistics.data_mode').vm.$emit(
      'update:model-value',
      'status'
    )
    await findButton('download').vm.$emit('click')
    const [, stats] = generateStatReports.mock.calls[0]
    expect(Object.keys(stats).sort()).toEqual(['all', 'e01'])
    expect(Object.keys(stats.all).sort()).toEqual(['all', 'layout'])
  })

  test('names the export button and marks it for the mobile layout', async () => {
    await mountPage()
    expect(findButton('download').props('title')).toBe('main.csv.export_file')
    expect(findButton('download').classes()).toContain('export-button')
  })

  test('offers the stacked bars and the heatmap as display modes', async () => {
    await mountPage()
    const options = combobox('statistics.display_mode').props('options')
    expect(options.map(option => option.value)).toEqual([
      'pie',
      'count',
      'bars',
      'heatmap'
    ])
  })

  test('remembers the display mode and the data mode between visits', async () => {
    await mountPage()
    expect(listProps().displayMode).toBe('pie')
    expect(listProps().dataMode).toBe('retakes')
    await combobox('statistics.display_mode').vm.$emit(
      'update:model-value',
      'heatmap'
    )
    await combobox('statistics.data_mode').vm.$emit(
      'update:model-value',
      'status'
    )
    wrapper.unmount()

    await mountPage()
    expect(listProps().displayMode).toBe('heatmap')
    expect(listProps().dataMode).toBe('status')
  })

  // The scroll position of the store belongs to the Episodes list page.
  test('leaves the scroll position of the episodes page alone', async () => {
    const { store } = await mountPage()
    await wrapper.findComponent(EpisodeStatsList).vm.$emit('scroll', 120)
    expect(store.dispatch).not.toHaveBeenCalledWith(
      'setEpisodeListScrollPosition',
      120
    )
  })
})
