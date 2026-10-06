import { mount } from '@vue/test-utils'
import moment from 'moment'
import { vi } from 'vitest'
import { nextTick, reactive } from 'vue'

const { organisation } = vi.hoisted(() => ({
  organisation: { hours_by_day: 8, format_duration_in_hours: false }
}))

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
      organisation,
      taskMap: new Map(),
      taskStatuses: []
    },
    dispatch: vi.fn()
  })
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: key => key })
}))

import { parseSimpleDate } from '@/lib/time'

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

// The Today buttons of the schedule pages call scrollToToday.
describe('Schedule widget - today', () => {
  // the pages pass the UTC midnight of each day, as parseSimpleDate builds it
  const range = {
    startDate: parseSimpleDate('2026-08-01'),
    endDate: parseSimpleDate('2026-10-31')
  }

  const showTodayOn = day => {
    vi.setSystemTime(new Date(`${day}T15:00:00`))
    const wrapper = mountSchedule(range)
    wrapper.vm.scrollToToday()
    vi.advanceTimersByTime(20)
    const shown = {
      scrollLeft: wrapper.find('.timeline-content-wrapper').element.scrollLeft,
      marker: wrapper.find('.timeline-position.today').element.style.display
    }
    wrapper.unmount()
    return shown
  }

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('scrolls to today and marks it, on the last day of the range too', () => {
    const middle = showTodayOn('2026-09-15')
    const lastDay = showTodayOn('2026-10-31')

    expect(middle.scrollLeft).toBeGreaterThan(0)
    expect(middle.marker).toBe('block')
    expect(lastDay.scrollLeft).toBeGreaterThan(middle.scrollLeft)
    expect(lastDay.marker).toBe('block')
  })

  // Doing nothing there made the button look broken.
  it('goes to the range end closest to a today out of the range', () => {
    const before = showTodayOn('2026-07-01')
    const after = showTodayOn('2026-12-15')

    expect(before.scrollLeft).toBe(showTodayOn('2026-08-01').scrollLeft)
    expect(after.scrollLeft).toBe(showTodayOn('2026-10-31').scrollLeft)
    expect([before.marker, after.marker]).toEqual(['none', 'none'])
  })
})

// The task type, entity and person schedules estimate each task in a field
// next to its name.
describe('Schedule widget - estimation field', () => {
  // Monday 31 August, one working day
  const buildTaskElement = () => ({
    id: 'task-1',
    name: 'Characters / Cat',
    editable: true,
    estimation: 8 * 60,
    man_days: 8 * 60,
    startDate: moment('2026-08-31'),
    endDate: moment('2026-08-31'),
    children: []
  })

  afterEach(() => {
    organisation.format_duration_in_hours = false
  })

  // The value is shown in the unit printed next to it: a typed one is read
  // in that unit too.
  it.each([
    ['hours', true, '8', '16'],
    ['days', false, '1', '2']
  ])(
    'reads the estimation typed in %s',
    async (_, isDurationInHours, shown, typed) => {
      organisation.format_duration_in_hours = isDurationInHours
      const task = buildTaskElement()
      const wrapper = mountSchedule({
        hierarchy: [{ ...person, editable: false, children: [task] }],
        isEstimationLinked: true
      })
      const input = wrapper.find('.man-days-unit-wrapper input')

      expect(input.element.value).toBe(shown)

      await input.setValue(typed)

      expect(wrapper.emitted('estimation-changed')).toEqual([
        [{ taskId: 'task-1', estimation: 16 * 60, item: task, daysOff: [] }]
      ])
      expect([task.estimation, task.man_days]).toEqual([16 * 60, 16 * 60])
      expect(task.endDate.format('YYYY-MM-DD')).toBe('2026-09-01')
      expect(input.element.value).toBe(typed)
      wrapper.unmount()
    }
  )

  // Types into a number field key by key the way a browser does: the field
  // keeps the text typed, which reads as an empty value with a bad input
  // while it is no number yet ("1."), and a value the page sets replaces
  // that text.
  const typeKeys = async (input, keys) => {
    const field = input.element
    const { get, set } = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value'
    )
    let text = ''
    let written
    Object.defineProperty(field, 'value', {
      configurable: true,
      get: () => get.call(field),
      set: value => {
        written = String(value)
        set.call(field, value)
      }
    })
    for (const key of keys) {
      text += key
      set.call(field, text)
      const badInput = get.call(field) === '' && text !== ''
      Object.defineProperty(field, 'validity', {
        configurable: true,
        value: { badInput }
      })
      written = null
      field.dispatchEvent(new Event('input'))
      await nextTick()
      if (written !== null) text = written
    }
    delete field.value
    delete field.validity
    return text
  }

  const typedEstimations = wrapper =>
    wrapper.emitted('estimation-changed').map(([{ estimation }]) => estimation)

  // The pages hand reactive rows over: each estimation typed re-renders the
  // field, which wrote "1." and "1.0" back as 0 and 1, so typing 1.05 gave 5.
  it.each([
    ['days', false, [480, 480, 504]],
    ['hours', true, [60, 60, 63]]
  ])(
    'keeps the decimals typed key by key in %s',
    async (_, isDurationInHours, estimations) => {
      organisation.format_duration_in_hours = isDurationInHours
      const task = buildTaskElement()
      const wrapper = mountSchedule({
        hierarchy: reactive([{ ...person, editable: false, children: [task] }]),
        isEstimationLinked: true
      })
      const input = wrapper.find('.man-days-unit-wrapper input')

      expect(await typeKeys(input, '1.05')).toBe('1.05')
      expect(typedEstimations(wrapper)).toEqual(estimations)
      expect(task.estimation).toBe(estimations[2])
      wrapper.unmount()
    }
  )

  it('keeps the decimals typed key by key in the root field', async () => {
    const rootElement = { ...person, man_days: 0, children: [] }
    const wrapper = mountSchedule({
      hierarchy: reactive([rootElement]),
      // a page that applies the estimation to the row, dates included
      onEstimationChanged: ({ estimation, item }) => {
        item.man_days = estimation
        item.endDate = item.startDate.clone()
      }
    })
    const input = wrapper.find('.man-day-input')

    expect(await typeKeys(input, '1.05')).toBe('1.05')
    expect(typedEstimations(wrapper)).toEqual([480, 480, 504])
    wrapper.unmount()
  })

  // A valid number, it saved -480 minutes.
  it('ignores a negative entry', async () => {
    const task = buildTaskElement()
    const wrapper = mountSchedule({
      hierarchy: reactive([{ ...person, editable: false, children: [task] }]),
      isEstimationLinked: true
    })
    const input = wrapper.find('.man-days-unit-wrapper input')

    expect(await typeKeys(input, '-1')).toBe('-1')
    expect(wrapper.emitted('estimation-changed')).toBeUndefined()
    expect([task.estimation, task.man_days]).toEqual([8 * 60, 8 * 60])
    await input.trigger('blur')

    // the day stored comes back
    expect(input.element.value).toBe('1')
    wrapper.unmount()
  })

  it('shows the estimation in its format once the field is left', async () => {
    const task = buildTaskElement()
    const wrapper = mountSchedule({
      hierarchy: reactive([{ ...person, editable: false, children: [task] }]),
      isEstimationLinked: true
    })
    const input = wrapper.find('.man-days-unit-wrapper input')

    expect(await typeKeys(input, '1.50')).toBe('1.50')
    await input.trigger('blur')

    expect(input.element.value).toBe('1.5')
    expect(typedEstimations(wrapper)).toEqual([480, 720, 720])
    wrapper.unmount()
  })
})
