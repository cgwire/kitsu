import { mount } from '@vue/test-utils'
import moment from 'moment'
import { vi } from 'vitest'
import { isReactive, nextTick, reactive } from 'vue'

const { milestones, organisation } = vi.hoisted(() => ({
  // mutated by the milestone tests, by date
  milestones: {},
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
      milestones,
      openProductions: [{ id: 'production-1', team: ['person-1'] }],
      organisation,
      taskMap: new Map(),
      taskStatuses: []
    },
    dispatch: vi.fn()
  })
}))

const { translate } = vi.hoisted(() => ({ translate: vi.fn(key => key) }))
vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: translate })
}))

import { parseSimpleDate } from '@/lib/time'

import Schedule from '@/components/schedule/Schedule.vue'

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

describe('Schedule widget - milestones', () => {
  afterEach(() => {
    Object.keys(milestones).forEach(date => delete milestones[date])
  })

  it('shows a milestone set on the first day of the range', () => {
    milestones['2026-08-01'] = {
      id: 'milestone-1',
      date: '2026-08-01',
      name: 'Kickoff'
    }
    // the header lists the days in UTC: a UTC start keeps that day first
    const wrapper = mountSchedule({
      startDate: moment.utc('2026-08-01'),
      endDate: moment.utc('2026-10-31'),
      withMilestones: true
    })

    expect(wrapper.find('.milestone-tooltip').text()).toBe('Kickoff')
    expect(wrapper.find('.milestone-vertical-line').exists()).toBe(true)
    wrapper.unmount()
  })
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
    await row.trigger('dragenter')

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

describe('Schedule widget - end of an interaction', () => {
  // An outside script can take the body out of the page: only the end of a
  // move, a resize or a grab resets its cursor.
  test.each(['mouseup', 'mouseleave', 'touchend', 'touchcancel'])(
    'leaves the page body alone on a %s without any interaction',
    type => {
      const wrapper = mountSchedule()
      const onError = vi.fn()
      window.addEventListener('error', onError)
      const body = document.body
      body.remove()

      document.dispatchEvent(new Event(type))

      document.documentElement.append(body)
      window.removeEventListener('error', onError)
      expect(onError).not.toHaveBeenCalled()
      wrapper.unmount()
    }
  )

  // The timeline content ends with its last row: a click below it or on the
  // scrollbar starts nothing, yet it still closes the side panel.
  test('unselects on a click below the rows', () => {
    const wrapper = mountSchedule({}, { attachTo: document.body })
    const area = wrapper.find('.timeline-content-wrapper').element

    area.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    area.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))

    expect(wrapper.emitted('task-unselected')).toHaveLength(1)
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

// The browser still delivers a scroll queued before the unmount (the pages
// scroll the timeline right after loading), once the template refs are null.
describe('Schedule widget - timeline scroll', () => {
  const mountCatchingErrors = errors =>
    mountSchedule(
      {},
      {
        global: {
          stubs: { RouterLink: true },
          config: { errorHandler: err => errors.push(err) }
        }
      }
    )

  it('keeps the entity list in line with the timeline', () => {
    const errors = []
    const wrapper = mountCatchingErrors(errors)
    const timeline = wrapper.find('.timeline-content-wrapper').element
    timeline.scrollTop = 40

    timeline.dispatchEvent(new Event('scroll'))

    expect(wrapper.find('.entities').element.scrollTop).toBe(40)
    expect(errors).toEqual([])
    wrapper.unmount()
  })

  it('ignores a scroll that reaches the detached timeline', () => {
    const errors = []
    const wrapper = mountCatchingErrors(errors)
    const timeline = wrapper.find('.timeline-content-wrapper').element
    wrapper.unmount()

    timeline.dispatchEvent(new Event('scroll'))

    expect(errors).toEqual([])
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

// Production schedule shape: a task type row, entity rows below it, and one
// person row per assignee holding the task bars.
const buildSubchildrenHierarchy = (nbEntities = 3) => {
  const root = {
    id: 'tt-1',
    task_type_id: 'tt-1',
    name: 'Shot / Animation',
    color: '#4a90e2',
    editable: true,
    expanded: true,
    loading: false,
    man_days: 0,
    daysOff: [],
    startDate: moment('2026-08-03'),
    endDate: moment('2026-10-23'),
    people: { 'person-1': { ...person, daysOff: [] } },
    children: []
  }
  for (let e = 0; e < nbEntities; e++) {
    const child = {
      id: `seq-${e}`,
      object_id: `seq-${e}`,
      name: `SEQ${e}`,
      color: '#4a90e2',
      editable: true,
      expanded: true,
      loading: false,
      startDate: moment('2026-08-03'),
      endDate: moment('2026-10-23'),
      parentElement: root,
      children: new Map()
    }
    const task = {
      id: `task-${e}`,
      type: 'Task',
      entity_id: `shot-${e}`,
      entity: { name: `SH${e}` },
      assignees: ['person-1'],
      startDate: moment('2026-08-10').add(e * 7, 'days'),
      endDate: moment('2026-08-14').add(e * 7, 'days'),
      editable: true,
      unresizable: false,
      line: 0,
      parentElement: child
    }
    child.children.set('person-1', [task])
    root.children.push(child)
  }
  return reactive([root])
}

const mountSubchildren = (hierarchy, props = {}) =>
  mountSchedule(
    {
      startDate: moment('2026-08-01'),
      endDate: moment('2026-10-31'),
      hierarchy,
      reassignable: true,
      subchildren: true,
      clipChildren: true,
      isEstimationLinked: true,
      ...props
    },
    { attachTo: document.body }
  )

const selectBar = async (wrapper, bar) => {
  await bar.trigger('mousedown', { clientX: 300 })
  document.dispatchEvent(
    new MouseEvent('mouseup', { bubbles: true, clientX: 300 })
  )
  await nextTick()
}

const dragFrom = async (wrapper, handle, fromX, toX) => {
  await handle.trigger('mousedown', { clientX: fromX })
  document.dispatchEvent(
    new MouseEvent('mousemove', { bubbles: true, clientX: toX })
  )
  await nextTick()
}

describe('Schedule widget - person rows', () => {
  let rafSpy

  beforeEach(() => {
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

  it('keeps the selection instance while a bar is resized', async () => {
    const hierarchy = buildSubchildrenHierarchy()
    const wrapper = mountSubchildren(hierarchy)
    const bar = wrapper.find('.subchild .timebar-center')
    await selectBar(wrapper, bar)
    const selection = wrapper.vm.selection
    const task = hierarchy[0].children[0].children.get('person-1')[0]

    await dragFrom(wrapper, wrapper.find('.subchild .timebar-right-hand'), 300, 360)

    // sanity check: the resize happened
    expect(task.endDate.isSame(moment('2026-08-14'))).toBe(false)
    expect(wrapper.vm.selection).toBe(selection)
    wrapper.unmount()
  })

  it('formats the bar titles from raw moment objects', async () => {
    const hierarchy = buildSubchildrenHierarchy()
    const wrapper = mountSubchildren(hierarchy)
    const format = vi.spyOn(moment.fn, 'format')
    const task = hierarchy[0].children[0].children.get('person-1')[0]

    task.startDate = task.startDate.clone().add(1, 'days')
    await nextTick()

    // a moment read through the reactive hierarchy pays a proxy trap per
    // internal property access, on every bar at every render
    expect(format).toHaveBeenCalled()
    expect(format.mock.contexts.some(isReactive)).toBe(false)
    format.mockRestore()
    wrapper.unmount()
  })

  // Only the person row holding the task may update: the other rows are
  // their own components and nothing of theirs changed.
  const countUpdates = () => {
    const counts = {}
    const mixin = {
      updated() {
        const name = this.$options.__name
        if (name) counts[name] = (counts[name] || 0) + 1
      }
    }
    const reset = () => Object.keys(counts).forEach(key => delete counts[key])
    return { counts, mixin, reset }
  }

  const mountCounted = hierarchy => {
    const { counts, mixin, reset } = countUpdates()
    const wrapper = mountSchedule(
      {
        startDate: moment('2026-08-01'),
        endDate: moment('2026-10-31'),
        hierarchy,
        reassignable: true,
        subchildren: true,
        clipChildren: true,
        isEstimationLinked: true
      },
      {
        attachTo: document.body,
        global: { stubs: { RouterLink: true }, mixins: [mixin] }
      }
    )
    return { wrapper, counts, reset }
  }

  it('updates only the row holding the task on a selection', async () => {
    const { wrapper, counts, reset } = mountCounted(buildSubchildrenHierarchy())
    const bars = wrapper.findAll('.subchild .timebar-center')

    // the widget renders on the mousedown (selection, drag flag) and on
    // the mouseup (drag flag); the entity row and the person row holding
    // the task follow their selection, then show the handles once the
    // mouse is up
    await selectBar(wrapper, bars[0])
    expect(counts).toEqual({
      Schedule: 2,
      ScheduleEntityRow: 2,
      SchedulePersonRow: 2
    })

    reset()
    await selectBar(wrapper, bars[1])
    // the rows losing the selection, then the rows gaining it twice
    expect(counts).toEqual({
      Schedule: 2,
      ScheduleEntityRow: 3,
      SchedulePersonRow: 3
    })
    wrapper.unmount()
  })

  it('updates only the row holding the task on a move frame', async () => {
    const { wrapper, counts, reset } = mountCounted(buildSubchildrenHierarchy())
    const bar = wrapper.find('.subchild .timebar-center')
    await selectBar(wrapper, bar)
    await bar.trigger('mousedown', { clientX: 300 })
    await nextTick()

    reset()
    document.dispatchEvent(
      new MouseEvent('mousemove', { bubbles: true, clientX: 360 })
    )
    await nextTick()

    expect(counts).toEqual({ SchedulePersonRow: 1 })
    document.dispatchEvent(
      new MouseEvent('mouseup', { bubbles: true, clientX: 360 })
    )
    wrapper.unmount()
  })

  it('updates only the row holding the task on a resize frame', async () => {
    const { wrapper, counts, reset } = mountCounted(buildSubchildrenHierarchy())
    await selectBar(wrapper, wrapper.find('.subchild .timebar-center'))
    const handle = wrapper.find('.subchild .timebar-right-hand')
    await handle.trigger('mousedown', { clientX: 300 })
    await nextTick()

    reset()
    document.dispatchEvent(
      new MouseEvent('mousemove', { bubbles: true, clientX: 360 })
    )
    await nextTick()

    expect(counts).toEqual({ SchedulePersonRow: 1 })
    document.dispatchEvent(
      new MouseEvent('mouseup', { bubbles: true, clientX: 360 })
    )
    wrapper.unmount()
  })

  it('does not translate the day titles again on a widget render', async () => {
    const hierarchy = buildSubchildrenHierarchy()
    const wrapper = mountSubchildren(hierarchy, { withMilestones: true })
    expect(wrapper.find('.add-milestone').attributes('title')).toMatch(
      /^schedule\.milestone\.add_milestone \d{4}-\d{2}-\d{2}$/
    )
    translate.mockClear()

    // a line change re-renders the widget: 365 day cells must not each
    // call t() and format a date again (69 % of a drag frame in Firefox)
    hierarchy[0].children[0].children.get('person-1')[0].line = 1
    await nextTick()

    expect(translate).not.toHaveBeenCalledWith(
      'schedule.milestone.add_milestone'
    )
    wrapper.unmount()
  })
})

describe('Schedule widget - dragging an entity bar over its task rows', () => {
  let rafSpy

  beforeEach(() => {
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

  it('keeps moving the bar while the cursor crosses a person row', async () => {
    const hierarchy = buildSubchildrenHierarchy(1)
    const [root] = hierarchy
    const [row] = root.children
    row.endDate = moment('2026-09-30')
    const wrapper = mountSubchildren(hierarchy)

    // the entity bar sits between the root bar and the task bars
    const bar = wrapper
      .findAll('.timebar-center')
      .find(
        ({ element }) =>
          !element.closest('.root-element') && !element.closest('.subchild')
      )
    await bar.trigger('mousedown', { clientX: 300 })
    // the drag handler is on the document: the event bubbles from the row
    wrapper
      .find('.subchild.drop-item-target')
      .element.dispatchEvent(
        new MouseEvent('mousemove', { bubbles: true, clientX: 500 })
      )
    await nextTick()

    expect(row.startDate.format('YYYY-MM-DD')).toBe('2026-08-13')
    document.dispatchEvent(
      new MouseEvent('mouseup', { bubbles: true, clientX: 500 })
    )
    wrapper.unmount()
  })
})

describe('Schedule widget - shift drag with tasks', () => {
  let rafSpy

  beforeEach(() => {
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

  const fmt = date => date.format('YYYY-MM-DD')

  // zoom level 1 is 20px a day: a 200px drag is 10 days
  const shiftDrag = async (wrapper, bar) => {
    await bar.trigger('mousedown', { clientX: 300, shiftKey: true })
    document.dispatchEvent(
      new MouseEvent('mousemove', { bubbles: true, clientX: 500 })
    )
    document.dispatchEvent(
      new MouseEvent('mouseup', { bubbles: true, clientX: 500 })
    )
    await nextTick()
  }

  it('moves the tasks along with their row', async () => {
    const hierarchy = buildSubchildrenHierarchy(1)
    const [root] = hierarchy
    const [row] = root.children
    const [task] = row.children.get('person-1')
    row.endDate = moment('2026-09-30')
    const wrapper = mountSubchildren(hierarchy)

    const bar = wrapper
      .findAll('.timebar-center')
      .find(
        ({ element }) =>
          !element.closest('.root-element') && !element.closest('.subchild')
      )
    await shiftDrag(wrapper, bar)

    expect(fmt(row.startDate)).toBe('2026-08-13')
    expect([fmt(task.startDate), fmt(task.endDate)]).toEqual([
      '2026-08-20',
      '2026-08-24'
    ])
    expect(wrapper.emitted('item-changed').map(([item]) => item.id)).toEqual(
      ['seq-0']
    )
    wrapper.unmount()
  })

  it('moves the tasks of every selected row on a shift drag', async () => {
    const hierarchy = buildSubchildrenHierarchy(2)
    const [root] = hierarchy
    const [first, second] = root.children
    const [firstTask] = first.children.get('person-1')
    first.endDate = moment('2026-09-30')
    second.endDate = moment('2026-09-30')
    const wrapper = mountSubchildren(hierarchy)

    const [firstBar, secondBar] = wrapper
      .findAll('.timebar-center')
      .filter(
        ({ element }) =>
          !element.closest('.root-element') && !element.closest('.subchild')
      )
    await selectBar(wrapper, firstBar)
    // the page snapped the task to a working day since the selection
    firstTask.startDate = moment('2026-08-11')
    firstTask.endDate = moment('2026-08-15')
    await nextTick()
    await secondBar.trigger('mousedown', {
      clientX: 300,
      ctrlKey: true,
      shiftKey: true
    })
    document.dispatchEvent(
      new MouseEvent('mousemove', { bubbles: true, clientX: 500 })
    )
    document.dispatchEvent(
      new MouseEvent('mouseup', { bubbles: true, clientX: 500 })
    )
    await nextTick()

    expect(fmt(first.startDate)).toBe('2026-08-13')
    expect([fmt(firstTask.startDate), fmt(firstTask.endDate)]).toEqual([
      '2026-08-21',
      '2026-08-25'
    ])
    wrapper.unmount()
  })

  it('moves the rows and their tasks along with the root bar', async () => {
    const hierarchy = buildSubchildrenHierarchy(2)
    const [root] = hierarchy
    const [first, second] = root.children
    const [task] = second.children.get('person-1')
    root.endDate = moment('2026-09-30')
    const wrapper = mountSubchildren(hierarchy)

    await shiftDrag(wrapper, wrapper.find('.root-element .timebar-center'))

    expect(fmt(root.startDate)).toBe('2026-08-13')
    expect(fmt(first.startDate)).toBe('2026-08-13')
    expect([fmt(task.startDate), fmt(task.endDate)]).toEqual([
      '2026-08-27',
      '2026-08-31'
    ])
    wrapper.unmount()
  })
})

describe('Schedule widget - rows without dated tasks', () => {
  const buildRoot = children => ({
    id: 'tt-1',
    task_type_id: 'tt-1',
    name: 'Shot / Animation',
    color: '#4a90e2',
    editable: true,
    expanded: true,
    loading: false,
    man_days: 0,
    daysOff: [],
    people: {},
    startDate: moment('2026-08-03'),
    endDate: moment('2026-10-23'),
    children
  })
  const buildSequence = () => ({
    id: 'seq-1',
    object_id: 'seq-1',
    name: 'SEQ01',
    color: '#4a90e2',
    editable: true,
    expanded: true,
    loading: false,
    man_days: 0,
    startDate: moment('2026-08-10'),
    endDate: moment('2026-08-14'),
    children: new Map(),
    nbUndatedTasks: 0
  })
  const mountRows = root =>
    mountSchedule({ hierarchy: reactive([root]), subchildren: true })

  it('tells that a sequence has no task where its assignees go', () => {
    const wrapper = mountRows(buildRoot([buildSequence()]))

    const label = wrapper.find('.subchild-label.empty')
    expect(label.text()).toBe('schedule.no_task')
    expect(label.find('.plan-entity').exists()).toBe(false)
    // the label takes the room of one assignee row
    expect(wrapper.find('.timeline .child-line').attributes('style')).toContain(
      'height: 92px'
    )
  })

  it('offers to plan the tasks a sequence holds without dates', async () => {
    const root = buildRoot([{ ...buildSequence(), nbUndatedTasks: 3 }])
    const wrapper = mountSchedule({
      hierarchy: reactive([root]),
      subchildren: true,
      reassignable: true
    })

    const label = wrapper.find('.subchild-label.empty')
    expect(label.text()).toContain('schedule.nb_undated_tasks')
    await label.find('.plan-entity').trigger('click')

    expect(wrapper.emitted('plan-entity')).toEqual([[root, root.children[0]]])
  })

  it('tells that the tasks of a sequence fall outside the dates shown', () => {
    const wrapper = mountSchedule({
      hierarchy: reactive([buildRoot([{ ...buildSequence(), nbTasksOutOfRange: 3 }])]),
      subchildren: true,
      reassignable: true
    })

    const label = wrapper.find('.subchild-label.empty')
    expect(label.text()).toContain('schedule.nb_tasks_out_of_range')
    expect(label.find('.plan-entity').exists()).toBe(false)
  })

  it('keeps the planning button off a locked schedule', () => {
    const wrapper = mountRows(
      buildRoot([{ ...buildSequence(), nbUndatedTasks: 3 }])
    )

    expect(wrapper.find('.plan-entity').exists()).toBe(false)
  })

  it('tells that a task type has no row at all', () => {
    const wrapper = mountRows(buildRoot([]))

    expect(wrapper.find('.child-empty').text()).toBe('schedule.no_task')
    expect(wrapper.find('.timeline .child-line.empty').exists()).toBe(true)
  })
})

describe('Schedule widget - entity rows', () => {
  let rafSpy

  beforeEach(() => {
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

  const buildEntityHierarchy = (nbEntities = 3) => {
    const root = {
      id: 'tt-1',
      task_type_id: 'tt-1',
      name: 'Shot / Animation',
      color: '#4a90e2',
      editable: true,
      expanded: true,
      loading: false,
      man_days: 0,
      daysOff: [],
      startDate: moment('2026-08-03'),
      endDate: moment('2026-10-23'),
      children: []
    }
    for (let e = 0; e < nbEntities; e++) {
      root.children.push({
        id: `seq-${e}`,
        object_id: `seq-${e}`,
        name: `SEQ${e}`,
        color: '#4a90e2',
        editable: true,
        unresizable: false,
        expanded: true,
        loading: false,
        man_days: 0,
        startDate: moment('2026-08-10').add(e * 7, 'days'),
        endDate: moment('2026-08-14').add(e * 7, 'days'),
        parentElement: root
      })
    }
    return reactive([root])
  }

  const mountCounted = hierarchy => {
    const counts = {}
    const mixin = {
      updated() {
        const name = this.$options.__name
        if (name) counts[name] = (counts[name] || 0) + 1
      }
    }
    const reset = () => Object.keys(counts).forEach(key => delete counts[key])
    const wrapper = mountSchedule(
      { hierarchy, clipChildren: true, isEstimationLinked: true },
      {
        attachTo: document.body,
        global: { stubs: { RouterLink: true }, mixins: [mixin] }
      }
    )
    return { wrapper, counts, reset }
  }

  // zoom level 1 is 20px a day: a 200px drag is 10 days
  const dragRootBar = async (wrapper, toX, options = {}) => {
    const bar = wrapper.find('.root-element .timebar-center')
    await bar.trigger('mousedown', { clientX: 300, ...options })
    document.dispatchEvent(
      new MouseEvent('mousemove', { bubbles: true, clientX: toX })
    )
    document.dispatchEvent(
      new MouseEvent('mouseup', { bubbles: true, clientX: toX })
    )
    await nextTick()
  }

  it('clips the rows to the moved root bar', async () => {
    const hierarchy = buildEntityHierarchy(1)
    const { wrapper } = mountCounted(hierarchy)
    const [root] = hierarchy
    const [row] = root.children
    root.endDate = moment('2026-09-30')

    await dragRootBar(wrapper, 500)

    expect(root.startDate.format('YYYY-MM-DD')).toBe('2026-08-13')
    expect(row.startDate.format('YYYY-MM-DD')).toBe('2026-08-13')
    expect(row.endDate.format('YYYY-MM-DD')).toBe('2026-08-14')
    wrapper.unmount()
  })

  it('moves the rows along with the root bar on a shift drag', async () => {
    const hierarchy = buildEntityHierarchy(2)
    const { wrapper } = mountCounted(hierarchy)
    const [root] = hierarchy
    const [first, second] = root.children
    root.endDate = moment('2026-09-30')

    await dragRootBar(wrapper, 500, { shiftKey: true })

    expect(root.startDate.format('YYYY-MM-DD')).toBe('2026-08-13')
    expect(first.startDate.format('YYYY-MM-DD')).toBe('2026-08-20')
    expect(first.endDate.format('YYYY-MM-DD')).toBe('2026-08-24')
    expect(second.startDate.format('YYYY-MM-DD')).toBe('2026-08-27')
    expect(wrapper.emitted('item-changed').map(([item]) => item.id)).toEqual(
      ['tt-1']
    )
    wrapper.unmount()
  })

  it('moves the rows along with the root bar on the week zoom', async () => {
    const hierarchy = buildEntityHierarchy(1)
    const [root] = hierarchy
    const [row] = root.children
    root.endDate = moment('2026-09-30')
    const wrapper = mountSchedule(
      { hierarchy, zoomLevel: 0, clipChildren: true },
      { attachTo: document.body }
    )

    // the week zoom is 20px a week
    await dragRootBar(wrapper, 320, { shiftKey: true })

    expect(root.startDate.format('YYYY-MM-DD')).toBe('2026-08-10')
    expect(row.startDate.format('YYYY-MM-DD')).toBe('2026-08-17')
    expect(row.endDate.format('YYYY-MM-DD')).toBe('2026-08-21')
    wrapper.unmount()
  })

  it('updates only the row holding the item on a move frame', async () => {
    const { wrapper, counts, reset } = mountCounted(buildEntityHierarchy())
    const bar = wrapper.find('.child-line .timebar-center')
    await selectBar(wrapper, bar)
    await bar.trigger('mousedown', { clientX: 300 })
    await nextTick()

    reset()
    document.dispatchEvent(
      new MouseEvent('mousemove', { bubbles: true, clientX: 360 })
    )
    await nextTick()

    expect(counts).toEqual({ ScheduleEntityRow: 1 })
    document.dispatchEvent(
      new MouseEvent('mouseup', { bubbles: true, clientX: 360 })
    )
    wrapper.unmount()
  })

  it('updates only the row holding the item on a resize frame', async () => {
    const { wrapper, counts, reset } = mountCounted(buildEntityHierarchy())
    await selectBar(wrapper, wrapper.find('.child-line .timebar-center'))
    const handle = wrapper.find('.child-line .timebar-right-hand')
    await handle.trigger('mousedown', { clientX: 300 })
    await nextTick()

    reset()
    document.dispatchEvent(
      new MouseEvent('mousemove', { bubbles: true, clientX: 360 })
    )
    await nextTick()

    expect(counts).toEqual({ ScheduleEntityRow: 1 })
    document.dispatchEvent(
      new MouseEvent('mouseup', { bubbles: true, clientX: 360 })
    )
    wrapper.unmount()
  })
})
