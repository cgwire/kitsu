import { flushPromises, shallowMount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

// Pre-load the real store to avoid circular-import race from child components.
import '@/lib/auth'

import AllTaskList from '@/components/lists/AllTaskList.vue'
import AllTasks from '@/components/pages/AllTasks.vue'
import BurndownChart from '@/components/widgets/BurndownChart.vue'
import ComboboxProduction from '@/components/widgets/ComboboxProduction.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import PeopleField from '@/components/widgets/PeopleField.vue'
import SearchQueryList from '@/components/widgets/SearchQueryList.vue'
import StatusStats from '@/components/widgets/StatusStats.vue'

const todoStatus = {
  id: 'status-1',
  short_name: 'todo',
  color: '#f5f5f5',
  is_default: true
}
const wipStatus = {
  id: 'status-2',
  short_name: 'wip',
  color: '#3273dc',
  is_default: false
}

const openTasks = {
  data: [],
  is_more: false,
  stats: {
    status: [
      { task_status_id: todoStatus.id, amount: 3 },
      { task_status_id: wipStatus.id, amount: 1 }
    ]
  }
}

const savedSearch = {
  id: 'search-1',
  name: 'Layout',
  search_query: 'task_type_id=type-2'
}

const ada = { id: 'person-1', active: true, first_name: 'Ada' }
const gone = { id: 'person-2', active: false, first_name: 'Gone' }

const mountPage = async ({
  loadOpenTasks = vi.fn(() => openTasks),
  loadOpenTasksBurndown = vi.fn(() => ({})),
  url = '/'
} = {}) => {
  const store = createStore({
    getters: {
      activePeopleWithoutBot: () => [ada],
      allTasksSearchFilterGroups: () => [],
      allTasksSearchQueries: () => [savedSearch],
      getProductionTaskStatuses: () => () => [],
      getProductionTaskTypes: () => () => [],
      openProductions: () => [],
      personMap: () =>
        new Map([
          [ada.id, ada],
          [gone.id, gone]
        ]),
      productionMap: () => new Map(),
      selectedTasks: () => new Map(),
      taskStatusMap: () =>
        new Map([
          [todoStatus.id, todoStatus],
          [wipStatus.id, wipStatus]
        ])
    },
    actions: {
      clearSelectedTasks: vi.fn(),
      loadOpenTasks,
      loadOpenTasksBurndown
    }
  })
  const router = createRouter({
    history: createWebHashHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/other', component: { template: '<div />' } }
    ]
  })
  await router.push(url)
  const wrapper = shallowMount(AllTasks, {
    global: {
      plugins: [
        store,
        router,
        {
          install: app => {
            app.config.globalProperties.$socket = { on: vi.fn(), off: vi.fn() }
          }
        }
      ],
      // The status stats sit in the side slot of the layout, in the default
      // slot of the task panel.
      stubs: {
        PageLayout: {
          template: '<div><slot name="main" /><slot name="side" /></div>'
        },
        TaskInfo: { template: '<div><slot /></div>' }
      }
    }
  })
  await flushPromises()
  return wrapper
}

describe('AllTasks page', () => {
  // Out of the box the default status is near white, unreadable on the light
  // side panel.
  it('draws the bar of the default status in grey', async () => {
    const wrapper = await mountPage()
    expect(wrapper.findComponent(StatusStats).props('stats')).toEqual([
      { name: 'TODO', color: '#6F727A', value: 3 },
      { name: 'WIP', color: '#3273dc', value: 1 }
    ])
    wrapper.unmount()
  })

  // A production can refuse its open tasks to a person who is client or
  // vendor on it, while the filter lists every open production.
  it('clears the loading error once the tasks load again', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const loadOpenTasks = vi
      .fn()
      .mockRejectedValueOnce(new Error('Forbidden'))
      .mockResolvedValue(openTasks)
    const wrapper = await mountPage({ loadOpenTasks })
    expect(wrapper.findComponent(AllTaskList).props('isError')).toBe(true)
    expect(consoleError).toHaveBeenCalledOnce()

    wrapper
      .findComponent(ComboboxProduction)
      .vm.$emit('update:modelValue', 'production-2')
    await flushPromises()

    expect(loadOpenTasks).toHaveBeenCalledTimes(2)
    expect(wrapper.findComponent(AllTaskList).props('isError')).toBe(false)
    wrapper.unmount()
    consoleError.mockRestore()
  })

  it('lists its saved searches, which hold its whole URL query', async () => {
    const wrapper = await mountPage()
    const list = wrapper.findComponent(SearchQueryList)

    expect(list.props()).toMatchObject({
      queries: [savedSearch],
      type: 'allTasks',
      withRouteQuery: true
    })
    wrapper.unmount()
  })

  // A saved search changes the URL query of the page shown.
  it('loads the filters of a new URL query, and only them', async () => {
    const loadOpenTasks = vi.fn(() => openTasks)
    const wrapper = await mountPage({
      loadOpenTasks,
      url: '/?project_id=production-1'
    })

    await wrapper.vm.$router.push('/?task_type_id=type-2')
    await flushPromises()

    expect(loadOpenTasks).toHaveBeenCalledTimes(2)
    expect(loadOpenTasks.mock.calls[1][1]).toMatchObject({
      project_id: null,
      task_type_id: 'type-2'
    })
    expect(
      wrapper.findComponent(ComboboxTaskType).props('modelValue')
    ).toBe('type-2')
    expect(wrapper.vm.$router.currentRoute.value.query).toEqual({
      task_type_id: 'type-2'
    })
    wrapper.unmount()
  })

  it('shows the view of a new URL query', async () => {
    const loadOpenTasksBurndown = vi.fn(() => ({}))
    const wrapper = await mountPage({ loadOpenTasksBurndown })

    await wrapper.vm.$router.push('/?view=burndown')
    await flushPromises()

    expect(wrapper.findComponent(BurndownChart).exists()).toBe(true)
    expect(loadOpenTasksBurndown).toHaveBeenCalledOnce()
    wrapper.unmount()
  })

  it('loads the burndown once for a query changing filters and view', async () => {
    const loadOpenTasksBurndown = vi.fn(() => ({}))
    const wrapper = await mountPage({ loadOpenTasksBurndown })

    await wrapper.vm.$router.push('/?task_type_id=type-2&view=burndown')
    await flushPromises()

    expect(loadOpenTasksBurndown).toHaveBeenCalledOnce()
    expect(loadOpenTasksBurndown.mock.calls[0][1]).toMatchObject({
      task_type_id: 'type-2'
    })
    wrapper.unmount()
  })

  it('loads the burndown of a page opened on it', async () => {
    const loadOpenTasksBurndown = vi.fn(() => ({}))
    const wrapper = await mountPage({
      loadOpenTasksBurndown,
      url: '/?view=burndown'
    })

    expect(loadOpenTasksBurndown).toHaveBeenCalledOnce()
    wrapper.unmount()
  })

  it('leaves the query of the next page alone', async () => {
    const loadOpenTasks = vi.fn(() => openTasks)
    const wrapper = await mountPage({ loadOpenTasks })

    await wrapper.vm.$router.push('/other?project_id=production-2')
    await flushPromises()

    expect(loadOpenTasks).toHaveBeenCalledOnce()
    expect(wrapper.vm.$router.currentRoute.value.fullPath).toBe(
      '/other?project_id=production-2'
    )
    wrapper.unmount()
  })

  // Dropping them would show the tasks of everybody.
  it('keeps the people gone inactive since a search was saved', async () => {
    const loadOpenTasks = vi.fn(() => openTasks)
    const wrapper = await mountPage({ loadOpenTasks })

    await wrapper.vm.$router.push(`/?person_id=${gone.id}`)
    await flushPromises()

    expect(loadOpenTasks.mock.calls[1][1].person_id).toBe(gone.id)
    const field = wrapper.findComponent(PeopleField)
    expect(field.props('modelValue')).toEqual([gone])
    // The field keeps a selected person only among those it lists.
    expect(field.props('people')).toEqual([ada, gone])
    wrapper.unmount()
  })

  it('opens on the people gone inactive of its URL', async () => {
    const loadOpenTasks = vi.fn(() => openTasks)
    const wrapper = await mountPage({
      loadOpenTasks,
      url: `/?person_id=${ada.id},${gone.id}`
    })

    expect(loadOpenTasks).toHaveBeenCalledOnce()
    expect(loadOpenTasks.mock.calls[0][1].person_id).toBe(
      `${ada.id},${gone.id}`
    )
    wrapper.unmount()
  })
})
