import { flushPromises, shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createStore } from 'vuex'

import MainSchedule from '@/components/pages/MainSchedule.vue'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

const Page = { template: '<div />' }
const ScheduleStub = {
  name: 'Schedule',
  props: ['hierarchy', 'milestones'],
  emits: ['root-element-expanded'],
  template: '<div />',
  methods: { scrollByPeriod: vi.fn(), scrollToToday() {} }
}

const production = {
  id: 'production-1',
  name: 'Production',
  type: 'Project',
  start_date: '2026-01-01',
  end_date: '2026-06-01'
}

const mountPage = async productions => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/main-schedule', component: Page },
      {
        name: 'schedule',
        path: '/productions/:production_id/schedule',
        component: Page
      },
      {
        name: 'episode-schedule',
        path: '/productions/:production_id/episodes/:episode_id/schedule',
        component: Page
      }
    ]
  })
  await router.push('/main-schedule')
  const store = createStore({
    getters: {
      openProductions: () => productions,
      taskTypes: () => [],
      taskTypeMap: () => new Map()
    },
    actions: { loadAllMilestones: () => [] }
  })
  const wrapper = shallowMount(MainSchedule, {
    global: {
      plugins: [router, store],
      stubs: { Schedule: ScheduleStub }
    }
  })
  await flushPromises()
  const [item] = wrapper.findComponent(ScheduleStub).props('hierarchy')
  return router.resolve(item.route).path
}

describe('MainSchedule page', () => {
  it('opens all the episodes of a TV show, where the selector shows', async () => {
    const path = await mountPage([{ ...production, production_type: 'tvshow' }])
    expect(path).toBe('/productions/production-1/episodes/all/schedule')
  })

  it('opens the schedule of a production without episodes', async () => {
    const path = await mountPage([{ ...production, production_type: 'short' }])
    expect(path).toBe('/productions/production-1/schedule')
  })
})

const taskTypes = [
  { id: 'tt-anim', name: 'Animation', color: '#f00' },
  { id: 'tt-light', name: 'Lighting', color: '#0f0' }
]

const mountFilteredPage = async (path = '/main-schedule') => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/main-schedule', component: Page },
      {
        name: 'schedule',
        path: '/productions/:production_id/schedule',
        component: Page
      }
    ]
  })
  await router.push(path)
  const store = createStore({
    getters: {
      openProductions: () => [
        { ...production, task_types: ['tt-anim', 'tt-light'] },
        { ...production, id: 'production-2', name: 'Other', task_types: [] }
      ],
      taskTypes: () => taskTypes,
      taskTypeMap: () => new Map(taskTypes.map(t => [t.id, t]))
    },
    actions: {
      loadAllMilestones: () => [
        { id: 'm1', project_id: 'production-1', name: 'Delivery' },
        { id: 'm2', project_id: 'production-2', name: 'Review' },
        { id: 'm3', project_id: 'closed-production', name: 'Old' }
      ],
      loadScheduleItems: () => [
        { id: 'item-1', task_type_id: 'tt-anim', start_date: '2026-01-01' },
        { id: 'item-2', task_type_id: 'tt-light', start_date: '2026-02-01' }
      ]
    }
  })
  const wrapper = shallowMount(MainSchedule, {
    global: {
      plugins: [router, store],
      stubs: { Schedule: ScheduleStub }
    }
  })
  await flushPromises()
  return wrapper
}

const hierarchyOf = wrapper =>
  wrapper.findComponent(ScheduleStub).props('hierarchy')

describe('MainSchedule filters', () => {
  it('offers the open productions and their task types', async () => {
    const wrapper = await mountFilteredPage()
    const [productionCombo, taskTypeCombo] = wrapper.findAllComponents({
      name: 'ComboboxOptions'
    })
    expect(productionCombo.props('options')).toEqual([
      { label: 'Production', value: 'production-1' },
      { label: 'Other', value: 'production-2' }
    ])
    expect(taskTypeCombo.props('options')).toEqual([
      { label: 'Animation', value: 'tt-anim' },
      { label: 'Lighting', value: 'tt-light' }
    ])
  })

  it('hides the unchecked productions', async () => {
    const wrapper = await mountFilteredPage()
    const [productionCombo] = wrapper.findAllComponents({
      name: 'ComboboxOptions'
    })
    productionCombo.vm.$emit('change', { key: 'production-2', value: false })
    await flushPromises()
    expect(hierarchyOf(wrapper).map(item => item.id)).toEqual(['production-1'])
  })

  it('hides the unchecked task types of the unfolded productions', async () => {
    const wrapper = await mountFilteredPage()
    const schedule = wrapper.findComponent(ScheduleStub)
    schedule.vm.$emit('root-element-expanded', hierarchyOf(wrapper)[0])
    await flushPromises()
    const taskTypeCombo = wrapper.findAllComponents({
      name: 'ComboboxOptions'
    })[1]

    taskTypeCombo.vm.$emit('change', { key: 'tt-anim', value: false })
    await flushPromises()
    expect(hierarchyOf(wrapper)[0].children.map(c => c.id)).toEqual(['item-2'])

    taskTypeCombo.vm.$emit('change', { key: 'tt-anim', value: true })
    await flushPromises()
    expect(hierarchyOf(wrapper)[0].children.map(c => c.id)).toEqual([
      'item-1',
      'item-2'
    ])
  })

  it('shows the milestones of the shown productions', async () => {
    const wrapper = await mountFilteredPage()
    const milestoneNames = () =>
      wrapper
        .findComponent(ScheduleStub)
        .props('milestones')
        .map(milestone => milestone.name)
    expect(milestoneNames()).toEqual(['Production: Delivery', 'Other: Review'])

    const [productionCombo] = wrapper.findAllComponents({
      name: 'ComboboxOptions'
    })
    productionCombo.vm.$emit('change', { key: 'production-2', value: false })
    await flushPromises()
    expect(milestoneNames()).toEqual(['Production: Delivery'])
  })

  it('steps the schedule by the chosen unit', async () => {
    const wrapper = await mountFilteredPage()
    const { scrollByPeriod } = ScheduleStub.methods
    scrollByPeriod.mockClear()

    await wrapper.find('.previous-period').trigger('click')
    wrapper.findComponent({ name: 'Combobox' }).vm.$emit(
      'update:model-value',
      'months'
    )
    await flushPromises()
    await wrapper.find('.next-period').trigger('click')

    expect(scrollByPeriod.mock.calls).toEqual([
      [-1, 'weeks'],
      [1, 'months']
    ])
  })

  it('offers no day step on the week zoom, where it would not move', async () => {
    const wrapper = await mountFilteredPage()
    const unitCombo = () => wrapper.findComponent({ name: 'Combobox' })
    const zoomCombo = wrapper.findComponent({ name: 'ComboboxNumber' })
    unitCombo().vm.$emit('update:model-value', 'days')
    zoomCombo.vm.$emit('update:model-value', 0)
    await flushPromises()

    expect(unitCombo().props('options').map(o => o.value)).toEqual([
      'weeks',
      'months'
    ])
    expect(unitCombo().props('modelValue')).toBe('weeks')
  })

  it('keeps the filters in the URL, for a reload', async () => {
    const wrapper = await mountFilteredPage()
    const [productionCombo, taskTypeCombo] = wrapper.findAllComponents({
      name: 'ComboboxOptions'
    })
    productionCombo.vm.$emit('change', { key: 'production-2', value: false })
    taskTypeCombo.vm.$emit('change', { key: 'tt-anim', value: false })
    await flushPromises()
    const { query } = wrapper.vm.$route
    expect(query.hiddenProductions).toBe('production-2')
    expect(query.hiddenTypes).toBe('tt-anim')

    const reloaded = await mountFilteredPage(
      '/main-schedule?hiddenProductions=production-2,gone&hiddenTypes=tt-anim'
    )
    const [reloadedProductions, reloadedTypes] = reloaded.findAllComponents({
      name: 'ComboboxOptions'
    })
    expect(hierarchyOf(reloaded).map(item => item.id)).toEqual(['production-1'])
    expect(reloadedProductions.props('modelValue')).toEqual({
      'production-1': true,
      'production-2': false
    })
    expect(reloadedTypes.props('modelValue')).toEqual({
      'tt-anim': false,
      'tt-light': true
    })
  })
})
