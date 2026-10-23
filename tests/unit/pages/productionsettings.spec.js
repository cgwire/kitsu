import { flushPromises, shallowMount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'
import { describe, expect, it, vi } from 'vitest'

import {
  dropBefore,
  isArmed,
  pressOn,
  recordListenerErrors,
  release,
  startDrag
} from '../fixtures/sortable'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))

import AssetTypeSettings from '@/components/pages/production/AssetTypeSettings.vue'
import ProductionSettings from '@/components/pages/ProductionSettings.vue'

const allAssetTypes = [
  { id: 'at-1', name: 'Character' },
  { id: 'at-2', name: 'Prop' },
  { id: 'at-3', name: 'Set' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'not-found', component: { template: '<div />' } },
    {
      path: '/settings',
      name: 'production-settings',
      component: { template: '<div />' }
    }
  ]
})

const mountWithAssetTypes = async (assetTypeIds, path = '/settings') => {
  const store = createStore({
    getters: {
      assetTypes: () => allAssetTypes,
      currentProduction: () => ({
        id: 'prod-1',
        name: 'Test',
        asset_types: assetTypeIds,
        task_statuses: []
      }),
      isCurrentUserProductionManager: () => true,
      productionTaskStatuses: () => [],
      taskStatus: () => [],
      // Mirrors the real getter: an empty asset_types means "all".
      productionAssetTypes: () =>
        assetTypeIds.length
          ? allAssetTypes.filter(at => assetTypeIds.includes(at.id))
          : allAssetTypes
    }
  })
  store.dispatch = vi.fn()
  await router.push(path)
  await router.isReady()
  return shallowMount(ProductionSettings, {
    global: {
      plugins: [store, router],
      mocks: { $t: key => key },
      // The menu and the tabs render through the layout
      stubs: { SettingsLayout: false }
    }
  })
}

describe('ProductionSettings — asset types tab', () => {
  // Regression: the tab must edit the production's explicit restriction set.
  // Feeding it productionAssetTypes (empty => every asset type) made the last
  // removal repaint the whole list and blocked removing asset types.
  it('passes an empty list when the production restricts no asset type', async () => {
    const wrapper = await mountWithAssetTypes([])
    expect(wrapper.findComponent(AssetTypeSettings).props('assetTypes')).toEqual(
      []
    )
  })

  it('passes only the explicit asset types, not every one', async () => {
    const wrapper = await mountWithAssetTypes(['at-2'])
    expect(
      wrapper.findComponent(AssetTypeSettings).props('assetTypes')
    ).toEqual([{ id: 'at-2', name: 'Prop' }])
  })
})

describe('ProductionSettings — tab from the URL', () => {
  // The menu rows follow menuGroups: parameters, brief, clients, ...
  const activeTab = wrapper =>
    wrapper.findAll('.settings-menu li').findIndex(row => row.classes('is-active'))

  it('opens the tab of the query on mount', async () => {
    const wrapper = await mountWithAssetTypes([], '/settings?tab=clients')
    expect(activeTab(wrapper)).toBe(2)
  })

  it('ignores an unknown tab', async () => {
    const wrapper = await mountWithAssetTypes([], '/settings?tab=foo')
    expect(activeTab(wrapper)).toBe(0)
  })
})

const taskStatuses = ['Todo', 'WIP', 'WFA', 'Retake', 'Done'].map(
  (name, index) => ({ id: name.toLowerCase(), name, priority: index + 1 })
)

// Mounts the real vuedraggable, so that SortableJS handles the rows.
const mountWithTaskStatuses = async (taskStatusIds, { errorHandler } = {}) => {
  const store = createStore({
    state: { taskStatusIds },
    getters: {
      assetTypes: () => [],
      currentProduction: state => ({
        id: 'prod-1',
        name: 'Test',
        asset_types: [],
        task_statuses: state.taskStatusIds
      }),
      isCurrentUserProductionManager: () => true,
      productionAssetTypes: () => [],
      productionTaskStatuses: state =>
        taskStatuses.filter(status => state.taskStatusIds.includes(status.id)),
      taskStatus: () => taskStatuses
    },
    mutations: {
      setTaskStatusIds: (state, ids) => {
        state.taskStatusIds = ids
      }
    }
  })
  store.dispatch = vi.fn()
  await router.push('/settings')
  await router.isReady()
  const wrapper = shallowMount(ProductionSettings, {
    global: {
      config: { errorHandler },
      plugins: [store, router],
      mocks: { $t: key => key },
      stubs: { draggable: false, SettingsLayout: false }
    }
  })
  return { store, wrapper }
}

describe('ProductionSettings task status tab', () => {
  // Regression: quick removals made a reload put a removed status back while
  // the next Remove button was held. On the release, Sortable reported the
  // shifted row as moved, vuedraggable threw, and no drag worked afterwards.
  it('keeps the rows draggable when they shift under a held Remove button', async () => {
    const { store, wrapper } = await mountWithTaskStatuses([
      'todo',
      'wip',
      'retake',
      'done'
    ])
    const rows = () => wrapper.findAll('tr.task-status')
    const names = () => rows().map(row => row.findAll('td')[1].text())

    const errors = await recordListenerErrors(async () => {
      pressOn(rows()[2].find('button').element)
      store.commit('setTaskStatusIds', ['todo', 'wip', 'wfa', 'retake', 'done'])
      await flushPromises()
      expect(names()).toEqual(['Todo', 'WIP', 'WFA', 'Retake', 'Done'])
      release()
    })

    expect(errors).toEqual([])
    expect(names()).toEqual(['Todo', 'WIP', 'WFA', 'Retake', 'Done'])
    pressOn(rows()[0].find('td.grab').element)
    expect(isArmed(rows()[0])).toBe(true)
    release()
  })

  it('keeps the rows draggable when they shift under a pressed row', async () => {
    const { store, wrapper } = await mountWithTaskStatuses([
      'todo',
      'wip',
      'retake',
      'done'
    ])
    const rows = () => wrapper.findAll('tr.task-status')
    const names = () => rows().map(row => row.findAll('td')[1].text())

    const errors = await recordListenerErrors(async () => {
      pressOn(rows()[2].findAll('td')[1].element)
      store.commit('setTaskStatusIds', ['todo', 'wip', 'wfa', 'retake', 'done'])
      await flushPromises()
      release()
      await flushPromises()
    })

    expect(errors).toEqual([])
    expect(names()).toEqual(['Todo', 'WIP', 'WFA', 'Retake', 'Done'])
    pressOn(rows()[0].find('td.grab').element)
    expect(isArmed(rows()[0])).toBe(true)
    release()
  })

  // Regression: the row before which vuedraggable puts the dragged row back
  // was gone, and the drop threw.
  it('saves the dropped order when a reload removes a status during the drag', async () => {
    const { store, wrapper } = await mountWithTaskStatuses([
      'todo',
      'wip',
      'retake',
      'done'
    ])
    const rows = () => wrapper.findAll('tr.task-status')
    const names = () => rows().map(row => row.findAll('td')[1].text())
    const [first, , , last] = rows().map(row => row.element)

    const errors = await recordListenerErrors(async () => {
      await startDrag(last.querySelector('td.grab'))
      store.commit('setTaskStatusIds', ['todo', 'retake', 'done'])
      await flushPromises()
      dropBefore(last, first)
      await flushPromises()
    })

    expect(errors).toEqual([])
    expect(names()).toEqual(['Done', 'Todo', 'WIP', 'Retake'])
    expect(store.dispatch).toHaveBeenCalledWith('reorderTaskStatusLinks', {
      projectId: 'prod-1',
      taskStatusIds: ['done', 'todo', 'wip', 'retake']
    })

    // The reload that follows the save.
    store.commit('setTaskStatusIds', ['todo', 'retake'])
    await flushPromises()
    expect(names()).toEqual(['Todo', 'Retake'])
  })

  // Regression: a failed save brings no reload, so the list kept what it
  // showed during the drag, a status removed meanwhile included.
  it('rebuilds the list from the production when the save fails', async () => {
    const errorHandler = vi.fn()
    const { store, wrapper } = await mountWithTaskStatuses(
      ['todo', 'wip', 'retake', 'done'],
      { errorHandler }
    )
    const error = new Error('Bad Gateway')
    store.dispatch.mockImplementation(async action => {
      if (action === 'reorderTaskStatusLinks') throw error
    })
    const rows = () => wrapper.findAll('tr.task-status')
    const names = () => rows().map(row => row.findAll('td')[1].text())
    const [first, , , last] = rows().map(row => row.element)

    await startDrag(last.querySelector('td.grab'))
    store.commit('setTaskStatusIds', ['todo', 'retake', 'done'])
    await flushPromises()
    dropBefore(last, first)
    await flushPromises()

    expect(errorHandler.mock.calls[0][0]).toBe(error)
    expect(names()).toEqual(['Todo', 'Retake', 'Done'])
  })

  it('keeps the saved order when the reload after the save fails', async () => {
    const errorHandler = vi.fn()
    const { store, wrapper } = await mountWithTaskStatuses(
      ['todo', 'wip', 'retake', 'done'],
      { errorHandler }
    )
    const error = new Error('Bad Gateway')
    store.dispatch.mockImplementation(async action => {
      if (action === 'loadContext') throw error
    })
    const rows = () => wrapper.findAll('tr.task-status')
    const names = () => rows().map(row => row.findAll('td')[1].text())
    const [first, , , last] = rows().map(row => row.element)

    await startDrag(last.querySelector('td.grab'))
    dropBefore(last, first)
    await flushPromises()

    expect(errorHandler.mock.calls[0][0]).toBe(error)
    expect(names()).toEqual(['Done', 'Todo', 'WIP', 'Retake'])
  })
})
