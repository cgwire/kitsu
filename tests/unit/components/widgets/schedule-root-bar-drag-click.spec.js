import { mount } from '@vue/test-utils'
import moment from 'moment'
import { vi } from 'vitest'

vi.mock('vuex', () => ({
  useStore: () => ({
    getters: {
      currentProduction: { id: 'production-1', name: 'Production' },
      dateFormat: 'YYYY-MM-DD',
      departmentMap: new Map(),
      isCurrentUserProductionManager: true,
      isDarkTheme: false,
      milestones: [],
      openProductions: [],
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

const mountSchedule = rootElement =>
  mount(Schedule, {
    props: {
      startDate: moment('2026-07-05'),
      endDate: moment('2026-10-23'),
      hierarchy: [rootElement],
      zoomLevel: 1,
      withMilestones: false,
      isLoading: false
    },
    attachTo: document.body
  })

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
    const wrapper = mountSchedule(rootElement)

    const bar = wrapper.find('.timebar-center')
    await dragBar(wrapper, bar, 500, 560)

    // the drag itself moved the bar's dates
    expect(rootElement.startDate.isSame(moment('2026-08-15'))).toBe(false)

    // but the trailing click must not also select/expand the row
    expect(wrapper.emitted('root-element-selected')).toBeFalsy()

    wrapper.unmount()
  })

  test('a real click with no movement still selects the row', async () => {
    const rootElement = buildRootElement()
    const wrapper = mountSchedule(rootElement)

    const bar = wrapper.find('.timebar-center')
    await dragBar(wrapper, bar, 500, 500)

    expect(wrapper.emitted('root-element-selected')).toBeTruthy()

    wrapper.unmount()
  })
})
