import { mount } from '@vue/test-utils'
import moment from 'moment'
import { vi } from 'vitest'

vi.mock('vuex', () => ({
  useStore: () => ({
    getters: {
      currentProduction: { id: 'production-1', name: 'Production' },
      dateFormat: 'YYYY-MM-DD',
      // the person row renders its departments
      departmentMap: new Map([
        ['dep-2', { id: 'dep-2', name: 'Lighting', color: '#222222' }]
      ]),
      isCurrentUserProductionManager: true,
      isDarkTheme: false,
      milestones: [],
      openProductions: [{ id: 'production-1', team: ['person-1'] }],
      organisation: { hours_by_day: 8 },
      taskMap: new Map(),
      taskStatuses: []
    },
    dispatch: vi.fn()
  })
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: key => key })
}))

import Schedule from '@/components/widgets/Schedule.vue'

const person = {
  id: 'person-1',
  name: 'Ann',
  departments: ['dep-2'],
  color: '#888888',
  editable: true,
  expanded: true,
  loading: false,
  man_days: 0,
  daysOff: [],
  startDate: moment('2026-09-01'),
  endDate: moment('2026-09-30'),
  children: []
}
const task = { id: 'task-1', project_id: 'production-1', department: null }

const mountSchedule = (props = {}, options = {}) =>
  mount(Schedule, {
    props: {
      startDate: moment('2026-08-01'),
      endDate: moment('2026-10-31'),
      hierarchy: [person],
      zoomLevel: 1,
      withMilestones: false,
      isLoading: false,
      ...props
    },
    // The root and child links are v-if'd out (the fixture carries no route),
    // yet Vue still resolves router-link at the top of the render fn.
    global: { stubs: { RouterLink: true } },
    ...options
  })

describe('Schedule widget - assignRule page rule', () => {
  it('lets the drop through without a page rule', () => {
    const wrapper = mountSchedule()

    expect(wrapper.vm.getDropForbiddenReason(task, person)).toBe(null)
    wrapper.unmount()
  })

  it('lets the drop through when the rule returns no reason', () => {
    const wrapper = mountSchedule({ assignRule: () => null })

    expect(wrapper.vm.getDropForbiddenReason(task, person)).toBe(null)
    wrapper.unmount()
  })

  it('refuses the drop with the reason the rule returns', () => {
    const assignRule = vi.fn(() => 'role')
    const wrapper = mountSchedule({ assignRule })

    expect(wrapper.vm.getDropForbiddenReason(task, person)).toBe('role')
    expect(assignRule).toHaveBeenCalledWith(task, person)
    wrapper.unmount()
  })

  it('asks the rule only after the team check', () => {
    const assignRule = vi.fn(() => 'role')
    const wrapper = mountSchedule({ assignRule })

    expect(
      wrapper.vm.getDropForbiddenReason(task, { ...person, id: 'person-9' })
    ).toBe('team')
    expect(assignRule).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('flags the hovered row with the reason on drag enter', async () => {
    const wrapper = mountSchedule({
      assignRule: () => 'task_type',
      draggedItems: [task]
    })
    // the entity panel has its own .children block: aim at the timeline row
    const row = wrapper.find('.children[data-root-element-id]')
    // VTU trigger cannot attach dataTransfer to a jsdom event
    const event = new Event('dragenter', { bubbles: true })
    Object.defineProperty(event, 'dataTransfer', { value: { types: [] } })
    row.element.dispatchEvent(event)
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.dropTarget.forbidden).toBe('task_type')
    expect(wrapper.vm.dropTarget.rootElementId).toBe('person-1')
    expect(wrapper.find('.drop-forbidden-message').text()).toContain(
      'schedule.drop_forbidden_task_type'
    )
    wrapper.unmount()
  })
})

const buildRootElement = () => ({
  id: 'task-type-1',
  name: 'Asset / Rigging',
  color: '#888888',
  editable: true,
  expanded: false,
  loading: false,
  man_days: 0,
  daysOff: [],
  startDate: moment('2026-08-15'),
  endDate: moment('2026-08-29'),
  children: []
})

const mountRootBar = rootElement =>
  mountSchedule(
    {
      startDate: moment('2026-07-05'),
      endDate: moment('2026-10-23'),
      hierarchy: [rootElement]
    },
    { attachTo: document.body }
  )

// Mirrors what a real browser does: mousedown then mouseup on the same
// element still dispatches a trailing click, drag or not.
const dragBar = async (wrapper, bar, fromX, toX) => {
  await bar.trigger('mousedown', { clientX: fromX })
  document.dispatchEvent(
    new MouseEvent('mousemove', { bubbles: true, clientX: toX })
  )
  document.dispatchEvent(
    new MouseEvent('mouseup', { bubbles: true, clientX: toX })
  )
  bar.element.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: toX }))
  await wrapper.vm.$nextTick()
}

describe('Schedule widget - dragging a collapsed root row bar', () => {
  let rafSpy

  beforeEach(() => {
    // the drag is throttled through requestAnimationFrame, which never fires
    // on its own in jsdom
    rafSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation(callback => {
        callback()
        return 0
      })
  })

  afterEach(() => {
    rafSpy.mockRestore()
  })

  test('does not unfold the row via the trailing click after the drag', async () => {
    const rootElement = buildRootElement()
    const wrapper = mountRootBar(rootElement)

    const bar = wrapper.find('.timebar-center')
    await dragBar(wrapper, bar, 500, 560)

    // sanity check: a drag actually happened
    expect(rootElement.startDate.isSame(moment('2026-08-15'))).toBe(false)

    expect(wrapper.emitted('root-element-selected')).toBeFalsy()

    wrapper.unmount()
  })

  test('a real click with no movement still selects the row', async () => {
    const rootElement = buildRootElement()
    const wrapper = mountRootBar(rootElement)

    const bar = wrapper.find('.timebar-center')
    await dragBar(wrapper, bar, 500, 500)

    expect(wrapper.emitted('root-element-selected')).toBeTruthy()

    wrapper.unmount()
  })

  test('a click after a drag released off the bar still selects', async () => {
    const rootElement = buildRootElement()
    const wrapper = mountRootBar(rootElement)

    const bar = wrapper.find('.timebar-center')
    // drag, but release with the cursor elsewhere: the browser fires no
    // trailing click, so the flag would stay armed without the reset
    await bar.trigger('mousedown', { clientX: 500 })
    document.dispatchEvent(
      new MouseEvent('mousemove', { bubbles: true, clientX: 560 })
    )
    document.dispatchEvent(
      new MouseEvent('mouseup', { bubbles: true, clientX: 560 })
    )
    await wrapper.vm.$nextTick()

    await dragBar(wrapper, bar, 600, 600)

    expect(wrapper.emitted('root-element-selected')).toBeTruthy()

    wrapper.unmount()
  })
})
