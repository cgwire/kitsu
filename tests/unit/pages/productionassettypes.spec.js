import { useHead } from '@unhead/vue'
import { flushPromises, shallowMount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))

// Pre-load the real store to avoid circular-import race from child components.
import '@/lib/auth'

import csv from '@/lib/csv'

import ProductionAssetTypeList from '@/components/lists/ProductionAssetTypeList.vue'
import ProductionAssetTypes from '@/components/pages/ProductionAssetTypes.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxTaskTypeOptions from '@/components/widgets/ComboboxTaskTypeOptions.vue'
import ComboboxVisibleOptions from '@/components/widgets/ComboboxVisibleOptions.vue'

const status = count => ({
  done: { name: 'done', color: '#22d160', count, frames: 0, drawings: 0 }
})
const assetTypeStats = {
  all: { all: status(5), modeling: status(3), rigging: status(2) },
  chars: { all: status(3), modeling: status(1), rigging: status(2) },
  props: { all: status(2), modeling: status(2) }
}
const chars = { id: 'chars', name: 'Characters' }
const props = { id: 'props', name: 'Props' }
const taskTypes = [
  { id: 'modeling', name: 'Modeling' },
  { id: 'rigging', name: 'Rigging' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/productions/:production_id/asset-types',
      name: 'production-asset-types',
      component: ProductionAssetTypes
    }
  ]
})

let wrapper

const mountPage = async (getters = {}, query = {}) => {
  const store = createStore({
    getters: {
      assetTypeAssetCounts: () => ({ chars: 12, props: 3 }),
      assetTypeMap: () => new Map([chars, props].map(t => [t.id, t])),
      assetTypeStats: () => assetTypeStats,
      assetValidationColumns: () => ['modeling', 'rigging'],
      currentEpisode: () => null,
      currentProduction: () => ({ id: 'production-1', name: 'Wing It' }),
      isAssetsLoading: () => false,
      isAssetsLoadingError: () => false,
      isTVShow: () => false,
      taskStatusMap: () => new Map(),
      taskTypeMap: () => new Map(taskTypes.map(t => [t.id, t])),
      usedAssetTypes: () => [chars, props],
      ...getters
    }
  })
  store.dispatch = vi.fn(() => Promise.resolve())
  await router.push({ path: '/productions/production-1/asset-types', query })
  await router.isReady()
  const push = vi.spyOn(router, 'push')
  const replace = vi.spyOn(router, 'replace')
  wrapper = shallowMount(ProductionAssetTypes, {
    global: {
      plugins: [store, router],
      mocks: { $t: key => key }
    }
  })
  await flushPromises()
  return { store, wrapper, push, replace }
}

const listProps = () => wrapper.findComponent(ProductionAssetTypeList).props()

const assetTypeFilter = () => wrapper.findComponent(ComboboxVisibleOptions)
const taskTypeFilter = () => wrapper.findComponent(ComboboxTaskTypeOptions)

const findButton = icon =>
  wrapper
    .findAll('button-simple-stub')
    .find(button => button.attributes('icon') === icon)

const pageTitle = () => useHead.mock.calls.at(-1)[0].title.value

describe('ProductionAssetTypes', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
    vi.restoreAllMocks()
  })

  it('loads the assets as soon as it is mounted', async () => {
    const { store } = await mountPage()
    expect(store.dispatch).toHaveBeenCalledWith('loadAssets')
    expect(store.dispatch).toHaveBeenCalledWith('computeAssetTypeStats')
    expect(listProps().isLoading).toBe(false)
  })

  it('records itself as the last production screen', async () => {
    const { store } = await mountPage()
    expect(store.dispatch).toHaveBeenCalledWith(
      'setLastProductionScreen',
      'production-asset-types'
    )
  })

  it('lets the user choose the asset types to display, all by default', async () => {
    await mountPage()
    expect(assetTypeFilter().props()).toMatchObject({
      label: 'asset_types.title',
      options: [
        { label: 'Characters', value: 'chars' },
        { label: 'Props', value: 'props' }
      ],
      hidden: []
    })
    expect(listProps().entries).toEqual([chars, props])
  })

  it('lets the user choose the task types to display, all by default', async () => {
    await mountPage()
    expect(taskTypeFilter().props()).toMatchObject({
      label: 'task_types.title',
      taskTypes,
      hidden: []
    })
    expect(listProps().validationColumns).toEqual(['modeling', 'rigging'])
  })

  it('restores the hidden asset types and task types from the URL', async () => {
    await mountPage(
      {},
      { hiddenAssetTypes: 'props', hiddenTaskTypes: 'rigging' }
    )
    expect(assetTypeFilter().props('hidden')).toEqual(['props'])
    expect(listProps().entries).toEqual([chars])
    expect(taskTypeFilter().props('hidden')).toEqual(['rigging'])
    expect(listProps().validationColumns).toEqual(['modeling'])
  })

  it('hides an asset type without adding a history entry', async () => {
    const { push, replace } = await mountPage()
    await assetTypeFilter().vm.$emit('update:hidden', ['props'])
    expect(listProps().entries).toEqual([chars])
    expect(push).not.toHaveBeenCalled()
    expect(replace).toHaveBeenCalledWith({
      query: { hiddenAssetTypes: 'props', hiddenTaskTypes: undefined }
    })
  })

  it('tells the list when asset types are hidden', async () => {
    await mountPage()
    expect(listProps().isFiltered).toBe(false)
    await assetTypeFilter().vm.$emit('update:hidden', ['chars', 'props'])
    expect(listProps().entries).toEqual([])
    expect(listProps().isFiltered).toBe(true)
  })

  it('shows a hidden asset type again', async () => {
    await mountPage({}, { hiddenAssetTypes: 'props' })
    await assetTypeFilter().vm.$emit('update:hidden', [])
    expect(listProps().entries).toEqual([chars, props])
  })

  it('takes a hidden task type out of the columns and of the totals', async () => {
    await mountPage()
    await taskTypeFilter().vm.$emit('update:hidden', ['rigging'])
    expect(listProps().validationColumns).toEqual(['modeling'])
    const stats = listProps().assetTypeStats
    expect(Object.keys(stats.chars).sort()).toEqual(['all', 'modeling'])
    expect(stats.chars.all.done.count).toBe(1)
    expect(stats.all.all.done.count).toBe(3)
  })

  it('totals the displayed asset types only', async () => {
    await mountPage({}, { hiddenAssetTypes: 'props' })
    const stats = listProps().assetTypeStats
    expect(Object.keys(stats).sort()).toEqual(['all', 'chars'])
    expect(stats.all.all.done.count).toBe(3)
    expect(stats.all.modeling.done.count).toBe(1)
    expect(stats.chars).toEqual(assetTypeStats.chars)
  })

  it('gives the asset counts to the list', async () => {
    await mountPage()
    expect(listProps().assetCounts).toEqual({ chars: 12, props: 3 })
  })

  it('exports the displayed asset types and task types only', async () => {
    const generateStatReports = vi
      .spyOn(csv, 'generateStatReports')
      .mockImplementation(() => {})
    await mountPage(
      {},
      { hiddenAssetTypes: 'props', hiddenTaskTypes: 'rigging' }
    )

    await findButton('download').trigger('click')

    const [, exportedStats] = generateStatReports.mock.calls[0]
    expect(Object.keys(exportedStats).sort()).toEqual(['all', 'chars'])
    expect(Object.keys(exportedStats.all).sort()).toEqual(['all', 'modeling'])
    expect(exportedStats.all.all.done.count).toBe(1)
  })

  it('writes only the displayed rows and columns in the CSV file', async () => {
    const buildCsvFile = vi
      .spyOn(csv, 'buildCsvFile')
      .mockImplementation(() => {})
    await mountPage(
      {},
      { hiddenAssetTypes: 'props', hiddenTaskTypes: 'rigging' }
    )

    await findButton('download').trigger('click')

    const [, lines] = buildCsvFile.mock.calls[0]
    expect(lines).toEqual([
      ['Name', '', 'All', '', 'Modeling', ''],
      ['All', 'done', 1, '100.00%', 1, '100.00%'],
      [''],
      ['Characters', 'done', 1, '100.00%', 1, '100.00%'],
      ['']
    ])
  })

  // Mobile is read-only: the page hides the export through this class.
  it('marks the export button as such', async () => {
    await mountPage()
    expect(findButton('download').classes()).toContain('export-button')
    expect(findButton('refresh').classes()).not.toContain('export-button')
  })

  it('names the export button', async () => {
    await mountPage()
    expect(findButton('download').attributes('title')).toBe(
      'main.csv.export_file'
    )
  })

  it('offers the stacked bars as a display mode', async () => {
    await mountPage()
    expect(wrapper.findComponent(Combobox).props('options')).toContainEqual({
      label: 'bars',
      value: 'bars'
    })
  })

  it('offers the heatmap as a display mode', async () => {
    await mountPage()
    expect(wrapper.findComponent(Combobox).props('options')).toContainEqual({
      label: 'heatmap',
      value: 'heatmap'
    })
  })

  it('remembers the display mode between visits', async () => {
    await mountPage()
    expect(listProps().displayMode).toBe('pie')
    await wrapper
      .findComponent(Combobox)
      .vm.$emit('update:model-value', 'count')
    wrapper.unmount()

    await mountPage()
    expect(listProps().displayMode).toBe('count')
  })

  it('titles the tab with the production name', async () => {
    await mountPage()
    expect(pageTitle()).toBe('Wing It | asset_types.production_title - Kitsu')
  })

  it('adds the episode to the tab title of a TV show', async () => {
    await mountPage({
      isTVShow: () => true,
      currentEpisode: () => ({ id: 'episode-1', name: 'E01' })
    })
    expect(pageTitle()).toBe(
      'Wing It - E01 | asset_types.production_title - Kitsu'
    )
  })

  // The "all" and "main pack" pseudo-episodes are stored without a name.
  it.each([
    ['all', 'main.all'],
    ['main', 'main.main_pack']
  ])('names the %s pseudo-episode in the tab title', async (id, name) => {
    await mountPage({ isTVShow: () => true, currentEpisode: () => ({ id }) })
    expect(pageTitle()).toBe(
      `Wing It - ${name} | asset_types.production_title - Kitsu`
    )
  })

  it('leaves the production out of the tab title until it is known', async () => {
    await mountPage({ currentProduction: () => null })
    expect(pageTitle()).toBe(' | asset_types.production_title - Kitsu')
  })
})
