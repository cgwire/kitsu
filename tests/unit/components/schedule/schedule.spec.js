import { mount } from '@vue/test-utils'
import moment from 'moment'
import { vi } from 'vitest'
import {
  defineComponent,
  h,
  isReactive,
  nextTick,
  reactive,
  toRaw
} from 'vue'

const { commit, milestonesByDate, organisation, taskMap } = vi.hoisted(() => ({
  commit: vi.fn(),
  // mutated by the milestone tests: the milestones of each date
  milestonesByDate: {},
  organisation: { hours_by_day: 8, format_duration_in_hours: false },
  // filled by the test of a press on a task bar
  taskMap: new Map()
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
      // read by the department combobox of the milestone modal
      departments: [],
      isCurrentUserManager: true,
      isCurrentUserProductionManager: true,
      isCurrentUserSupervisor: false,
      user: { departments: [] },
      isDarkTheme: false,
      milestonesByDate,
      openProductions: [{ id: 'production-1', team: ['person-1'] }],
      organisation,
      taskMap,
      taskStatuses: []
    },
    commit,
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
    Object.keys(milestonesByDate).forEach(
      date => delete milestonesByDate[date]
    )
  })

  it('shows a milestone set on the first day of the range', () => {
    milestonesByDate['2026-08-01'] = [
      {
        id: 'milestone-1',
        date: '2026-08-01',
        name: 'Kickoff',
        milestone_type: 'kickoff',
        color: null
      }
    ]
    // the header lists the days in UTC: a UTC start keeps that day first
    const wrapper = mountSchedule({
      startDate: moment.utc('2026-08-01'),
      endDate: moment.utc('2026-10-31'),
      withMilestones: true
    })

    expect(wrapper.find('.milestone-flag-name').text()).toBe('Kickoff')
    expect(wrapper.find('.milestone-vertical-line').exists()).toBe(true)
    wrapper.unmount()
  })

  it('merges the milestones of a day into one flag', () => {
    milestonesByDate['2026-08-10'] = [
      { id: 'm1', date: '2026-08-10', name: 'Delivery' },
      { id: 'm2', date: '2026-08-10', name: 'Review' }
    ].map(milestone => ({ ...milestone, milestone_type: 'other', color: null }))
    const wrapper = mountSchedule({ withMilestones: true, zoomLevel: 3 })

    const flags = wrapper.findAll('.milestone-flag')
    expect(flags).toHaveLength(1)
    expect(flags[0].attributes('aria-label')).toBe('Delivery, Review')
    expect(flags[0].findAll('.milestone-flag-stripe')).toHaveLength(2)
    expect(flags[0].find('.milestone-flag-more').text()).toBe('+1')
    expect(wrapper.findAll('.milestone-vertical-line')).toHaveLength(1)
    wrapper.unmount()
  })

  describe('flag popover', () => {
    const milestone = (id, name) => ({
      id,
      name,
      date: '2026-08-10',
      milestone_type: 'other',
      color: null
    })
    const popover = () => document.querySelector('.milestone-popover')
    const mountWithFlag = milestones => {
      milestonesByDate['2026-08-10'] = milestones
      return mountSchedule(
        { withMilestones: true, zoomLevel: 3 },
        { attachTo: document.body }
      )
    }

    it('stays closed when the closing modal gives the focus back', async () => {
      const wrapper = mountWithFlag([milestone('m1', 'Solo')])
      const flag = wrapper.find('.milestone-flag')

      flag.element.focus()
      await flag.trigger('click')
      await nextTick()
      expect(document.querySelector('.modal.is-active')).not.toBeNull()

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
      await nextTick()
      await nextTick()

      expect(document.querySelector('.modal.is-active')).toBeNull()
      expect(document.activeElement).toBe(flag.element)
      expect(popover()).toBeNull()
      wrapper.unmount()
    })

    it('opens when Tab lands on a flag', async () => {
      const wrapper = mountWithFlag([milestone('m1', 'Solo')])

      await wrapper.find('.milestone-flag').trigger('keyup', { key: 'Tab' })

      expect(popover()).not.toBeNull()
      wrapper.unmount()
    })

    it('takes the focus on Enter on a merged flag', async () => {
      const wrapper = mountWithFlag([
        milestone('m1', 'Delivery'),
        milestone('m2', 'Review')
      ])

      await wrapper.find('.milestone-flag').trigger('keydown', { key: 'Enter' })
      await nextTick()

      expect(document.activeElement).toBe(
        popover().querySelector('.milestone-popover-item')
      )
      wrapper.unmount()
    })

    it('leaves the focus on a merged flag clicked with the mouse', async () => {
      const wrapper = mountWithFlag([
        milestone('m1', 'Delivery'),
        milestone('m2', 'Review')
      ])
      const flag = wrapper.find('.milestone-flag')

      flag.element.focus()
      await flag.trigger('click')
      await nextTick()

      expect(popover()).not.toBeNull()
      expect(document.activeElement).toBe(flag.element)
      wrapper.unmount()
    })
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
// person row per assignee holding the task bars. The dates are UTC midnights,
// as the pages parse them: a drag snaps a bar to a UTC midnight, which a
// local moment reads as the day before west of UTC.
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
    startDate: moment.utc('2026-08-03'),
    endDate: moment.utc('2026-10-23'),
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
      startDate: moment.utc('2026-08-03'),
      endDate: moment.utc('2026-10-23'),
      parentElement: root,
      children: new Map()
    }
    const task = {
      id: `task-${e}`,
      type: 'Task',
      entity_id: `shot-${e}`,
      entity: { name: `SH${e}` },
      assignees: ['person-1'],
      startDate: moment.utc('2026-08-10').add(e * 7, 'days'),
      endDate: moment.utc('2026-08-14').add(e * 7, 'days'),
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
      startDate: moment.utc('2026-08-01'),
      endDate: moment.utc('2026-10-31'),
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

describe('Schedule widget - week zoom columns', () => {
  // The header and the line layout count weeks from Monday, while the bar
  // positions counted days / 7 from the schedule start, a Tuesday here:
  // bars of two different weeks landed in one column, on separate lines.
  it('places the bars on the Monday-aligned week of their dates', async () => {
    const hierarchy = buildSubchildrenHierarchy(1)
    const [root] = hierarchy
    const [row] = root.children
    const [wednesday] = row.children.get('person-1')
    wednesday.startDate = moment.utc('2026-10-21')
    wednesday.endDate = moment.utc('2026-10-23')
    const monday = {
      ...wednesday,
      id: 'task-monday',
      startDate: moment.utc('2026-10-26'),
      endDate: moment.utc('2026-10-27')
    }
    const straddling = {
      ...wednesday,
      id: 'task-straddling',
      startDate: moment.utc('2026-10-23'),
      endDate: moment.utc('2026-10-26')
    }
    row.children.set('person-1', [wednesday, monday, straddling])
    const wrapper = mountSubchildren(hierarchy, {
      startDate: moment.utc('2026-09-01'),
      endDate: moment.utc('2026-12-31'),
      zoomLevel: 0
    })
    wrapper.vm.refreshItemPositions(root)
    await nextTick()

    const bars = wrapper
      .findAll('.subchild .timebar')
      .map(bar => [bar.element.style.left, bar.element.style.width, bar.element.style.top])
    // the header starts on Monday 7 September: 21 October is its 7th week
    expect(bars).toEqual([
      ['123px', '16px', '5px'],
      ['143px', '16px', '5px'],
      ['123px', '34px', '43px']
    ])
    wrapper.unmount()
  })
})

describe('Schedule widget - person rows', () => {
  let rafSpy

  // A task with two assignees sits in both person rows as the same object:
  // the line computed for the second row overwrote the first, and the bar
  // landed on another task of the first row.
  it('lays a task shared by two person rows out in each row', async () => {
    const hierarchy = buildSubchildrenHierarchy(1)
    const [root] = hierarchy
    const [row] = root.children
    const [other] = row.children.get('person-1')
    const shared = {
      ...other,
      id: 'task-shared',
      entity: { name: 'SH9' },
      assignees: ['person-1', 'person-2'],
      startDate: moment.utc('2026-08-12'),
      endDate: moment.utc('2026-08-18')
    }
    root.people['person-2'] = { ...person, id: 'person-2', daysOff: [] }
    row.children = new Map([
      ['person-1', [other, shared]],
      ['person-2', [shared]]
    ])
    const wrapper = mountSubchildren(hierarchy)
    wrapper.vm.refreshItemPositions(root)
    await nextTick()

    const rows = wrapper.findAll('.subchild')
    const tops = rows.map(personRow =>
      personRow.findAll('.timebar').map(bar => bar.element.style.top)
    )
    expect(tops).toEqual([['5px', '43px'], ['5px']])
    expect(rows.map(personRow => personRow.element.style.height)).toEqual([
      '80px',
      '40px'
    ])
    wrapper.unmount()
  })

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
    expect(task.endDate.isSame(moment.utc('2026-08-14'))).toBe(false)
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
        startDate: moment.utc('2026-08-01'),
        endDate: moment.utc('2026-10-31'),
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
    row.endDate = moment.utc('2026-09-30')
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

describe('Schedule widget - drag with tasks', () => {
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
  const dragBar = async (bar, options = {}) => {
    await bar.trigger('mousedown', { clientX: 300, ...options })
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
    row.endDate = moment.utc('2026-09-30')
    const wrapper = mountSubchildren(hierarchy)

    const bar = wrapper
      .findAll('.timebar-center')
      .find(
        ({ element }) =>
          !element.closest('.root-element') && !element.closest('.subchild')
      )
    await dragBar(bar)

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

  it('leaves the tasks in place on a shift drag', async () => {
    const hierarchy = buildSubchildrenHierarchy(1)
    const [root] = hierarchy
    const [row] = root.children
    const [task] = row.children.get('person-1')
    const taskDates = [fmt(task.startDate), fmt(task.endDate)]
    row.endDate = moment.utc('2026-09-30')
    const wrapper = mountSubchildren(hierarchy)

    const bar = wrapper
      .findAll('.timebar-center')
      .find(
        ({ element }) =>
          !element.closest('.root-element') && !element.closest('.subchild')
      )
    await dragBar(bar, { shiftKey: true })

    expect(fmt(row.startDate)).toBe('2026-08-13')
    expect([fmt(task.startDate), fmt(task.endDate)]).toEqual(taskDates)
    wrapper.unmount()
  })

  it('moves the tasks of every selected row', async () => {
    const hierarchy = buildSubchildrenHierarchy(2)
    const [root] = hierarchy
    const [first, second] = root.children
    const [firstTask] = first.children.get('person-1')
    first.endDate = moment.utc('2026-09-30')
    second.endDate = moment.utc('2026-09-30')
    const wrapper = mountSubchildren(hierarchy)

    const [firstBar, secondBar] = wrapper
      .findAll('.timebar-center')
      .filter(
        ({ element }) =>
          !element.closest('.root-element') && !element.closest('.subchild')
      )
    await selectBar(wrapper, firstBar)
    // the page snapped the task to a working day since the selection
    firstTask.startDate = moment.utc('2026-08-11')
    firstTask.endDate = moment.utc('2026-08-15')
    await nextTick()
    await secondBar.trigger('mousedown', {
      clientX: 300,
      ctrlKey: true
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
    root.endDate = moment.utc('2026-09-30')
    const wrapper = mountSubchildren(hierarchy)

    await dragBar(wrapper.find('.root-element .timebar-center'))

    expect(fmt(root.startDate)).toBe('2026-08-13')
    expect(fmt(first.startDate)).toBe('2026-08-13')
    expect([fmt(task.startDate), fmt(task.endDate)]).toEqual([
      '2026-08-27',
      '2026-08-31'
    ])
    wrapper.unmount()
  })
})

// A selected bar can be a different object from the bar shown: the task type
// page builds new ones on each task:update event, which Zou sends after every
// save, so a bar still selected after its resize, a multiple move, or a click
// changes object, and the Schedule tab gives a task one per assignee row.
describe('Schedule widget - selected bars and their objects', () => {
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

  // UTC midnights, as in buildSubchildrenHierarchy
  const buildTask = (index, [startDate, endDate], parentElement) => ({
    id: `task-${index}`,
    name: `SH0${index}`,
    editable: true,
    unresizable: false,
    estimation: 8 * 60,
    man_days: 8 * 60,
    startDate: moment.utc(startDate),
    endDate: moment.utc(endDate),
    parentElement,
    children: []
  })

  // The Tasks tab: one hidden root holding a bar per task.
  const buildTaskListRows = (dates = [['2026-08-03', '2026-08-03']]) => {
    const person = { id: 'person-1', daysOff: [] }
    return reactive([
      {
        id: '',
        color: 'transparent',
        expanded: true,
        startDate: moment.utc('2026-08-03'),
        endDate: moment.utc('2026-08-31'),
        timesheet: [],
        children: dates.map((range, index) => buildTask(index, range, person))
      }
    ])
  }

  const mountTaskList = hierarchy =>
    mountSchedule(
      {
        hierarchy,
        hideEntities: true,
        hideRoot: true,
        invertLinesColor: true,
        isEstimationLinked: true
      },
      { attachTo: document.body }
    )

  // The Schedule tab: one row per assignee, where a task assigned to two
  // people is one bar object in each row (task-0 in both rows below).
  const buildAssigneeRows = datesByPerson =>
    reactive(
      Object.entries(datesByPerson).map(([id, dates]) => {
        const personRow = {
          id,
          name: id,
          editable: false,
          expanded: true,
          startDate: moment.utc('2026-08-03'),
          endDate: moment.utc('2026-08-31'),
          daysOff: [],
          timesheet: [],
          children: []
        }
        personRow.children = dates.map((range, index) =>
          buildTask(index, range, personRow)
        )
        return personRow
      })
    )

  const taskBars = wrapper =>
    wrapper
      .findAll('.timebar-center')
      .filter(({ element }) => !element.closest('.root-element'))

  // Zoom level 1 is 20px a day. A mouse sends a move every few pixels, and
  // a few more while it rests on the last day.
  const WEEK_MOVES = [320, 340, 360, 380, 400, 420, 440, 441, 442]

  const dragOneWeek = async (bar, options = {}) => {
    await bar.trigger('mousedown', { clientX: 300, ...options })
    WEEK_MOVES.forEach(clientX => {
      document.dispatchEvent(
        new MouseEvent('mousemove', { bubbles: true, clientX })
      )
    })
    document.dispatchEvent(
      new MouseEvent('mouseup', { bubbles: true, clientX: 442 })
    )
    await nextTick()
  }

  it('moves the bar shown once the page rebuilt it after a resize', async () => {
    const wrapper = mountTaskList(buildTaskListRows())
    await selectBar(wrapper, taskBars(wrapper)[0])
    await dragFrom(wrapper, wrapper.find('.timebar-right-hand'), 300, 360)
    document.dispatchEvent(
      new MouseEvent('mouseup', { bubbles: true, clientX: 360 })
    )
    const [[resized]] = wrapper.emitted('item-changed')
    expect(fmt(resized.endDate)).toBe('2026-08-06')

    // the save of the resize comes back as a task:update event
    const rows = buildTaskListRows([['2026-08-03', '2026-08-06']])
    await wrapper.setProps({ hierarchy: rows })
    const [shownTask] = rows[0].children
    await dragOneWeek(taskBars(wrapper)[0])

    const [moved] = wrapper.emitted('item-changed')[1]
    expect(toRaw(moved)).toBe(toRaw(shownTask))
    expect([fmt(moved.startDate), fmt(moved.endDate)]).toEqual([
      '2026-08-10',
      '2026-08-13'
    ])
    wrapper.unmount()
  })

  it('moves every selected bar once the page rebuilt them', async () => {
    const dates = [
      ['2026-08-03', '2026-08-03'],
      ['2026-08-05', '2026-08-05']
    ]
    const wrapper = mountTaskList(buildTaskListRows(dates))
    const [first, second] = taskBars(wrapper)
    await selectBar(wrapper, first)
    await second.trigger('mousedown', { clientX: 300, ctrlKey: true })
    document.dispatchEvent(
      new MouseEvent('mouseup', { bubbles: true, clientX: 300, ctrlKey: true })
    )
    await nextTick()

    const rows = buildTaskListRows(dates)
    await wrapper.setProps({ hierarchy: rows })
    await dragOneWeek(taskBars(wrapper)[0])

    expect(rows[0].children.map(task => fmt(task.startDate))).toEqual([
      '2026-08-10',
      '2026-08-12'
    ])
    const moved = wrapper.emitted('item-changed').map(([item]) => toRaw(item))
    expect(moved).toHaveLength(2)
    moved.forEach((item, index) => {
      expect(item).toBe(toRaw(rows[0].children[index]))
    })
    wrapper.unmount()
  })

  it('deselects a bar the rebuilt rows no longer hold', async () => {
    const dates = [
      ['2026-08-03', '2026-08-03'],
      ['2026-08-05', '2026-08-05']
    ]
    const wrapper = mountTaskList(buildTaskListRows(dates))
    await selectBar(wrapper, taskBars(wrapper)[0])

    // a search leaves the first task out of the rebuilt rows
    const rows = buildTaskListRows(dates)
    rows[0].children.shift()
    await wrapper.setProps({ hierarchy: rows })
    await dragOneWeek(taskBars(wrapper)[0], { ctrlKey: true })

    expect(wrapper.emitted('item-changed').map(([item]) => item.id)).toEqual([
      'task-1'
    ])
    expect(fmt(rows[0].children[0].startDate)).toBe('2026-08-12')
    wrapper.unmount()
  })

  it('moves the selected bars along with a bar added on a Ctrl drag', async () => {
    const dates = [
      ['2026-08-03', '2026-08-03'],
      ['2026-08-05', '2026-08-05']
    ]
    const wrapper = mountTaskList(buildTaskListRows(dates))
    await selectBar(wrapper, taskBars(wrapper)[0])

    const rows = buildTaskListRows(dates)
    await wrapper.setProps({ hierarchy: rows })
    await dragOneWeek(taskBars(wrapper)[1], { ctrlKey: true })

    expect(rows[0].children.map(task => fmt(task.startDate))).toEqual([
      '2026-08-10',
      '2026-08-12'
    ])
    wrapper.unmount()
  })

  it('moves the bar pressed in the row of another assignee', async () => {
    const hierarchy = buildAssigneeRows({
      'person-1': [['2026-08-03', '2026-08-03']],
      'person-2': [['2026-08-03', '2026-08-03']]
    })
    const wrapper = mountSchedule(
      { hierarchy, isEstimationLinked: true },
      { attachTo: document.body }
    )
    const [firstRowBar, secondRowBar] = taskBars(wrapper)
    await selectBar(wrapper, firstRowBar)

    await dragOneWeek(secondRowBar)

    const [firstRowTask, secondRowTask] = hierarchy.map(
      ({ children }) => children[0]
    )
    expect(fmt(secondRowTask.startDate)).toBe('2026-08-10')
    expect(fmt(firstRowTask.startDate)).toBe('2026-08-03')
    const [[moved]] = wrapper.emitted('item-changed')
    expect(toRaw(moved)).toBe(toRaw(secondRowTask))
    wrapper.unmount()
  })

  it('deselects a task on a Ctrl+click on its bar in another row', async () => {
    const wrapper = mountSchedule(
      {
        hierarchy: buildAssigneeRows({
          'person-1': [['2026-08-03', '2026-08-03']],
          'person-2': [['2026-08-03', '2026-08-03']]
        }),
        isEstimationLinked: true
      },
      { attachTo: document.body }
    )
    const [firstRowBar, secondRowBar] = taskBars(wrapper)
    await selectBar(wrapper, firstRowBar)
    expect(wrapper.findAll('.timebar.selected')).toHaveLength(2)

    await secondRowBar.trigger('mousedown', { clientX: 300, ctrlKey: true })
    document.dispatchEvent(
      new MouseEvent('mouseup', { bubbles: true, clientX: 300, ctrlKey: true })
    )
    await nextTick()

    expect(wrapper.findAll('.timebar.selected')).toHaveLength(0)
    wrapper.unmount()
  })

  // The person page builds its rows in a computed, as plain objects, while
  // the selection holds reactive proxies of them. mount() would make rows
  // passed as props reactive, so a parent component passes them.
  const mountPlainRows = rows =>
    mount(
      defineComponent({
        render: () =>
          h(Schedule, {
            startDate: moment.utc('2026-08-01'),
            endDate: moment.utc('2026-10-31'),
            hierarchy: rows,
            zoomLevel: 1,
            isEstimationLinked: true,
            withMilestones: false,
            isLoading: false
          })
      }),
      { global: { stubs: { RouterLink: true } }, attachTo: document.body }
    )

  const buildProjectRows = dates => {
    const project = {
      id: 'production-1',
      name: 'Production',
      color: '#4a90e2',
      editable: false,
      expanded: true,
      loading: false,
      startDate: moment.utc('2026-08-03'),
      endDate: moment.utc('2026-08-31'),
      daysOff: [],
      children: []
    }
    project.children = dates.map((range, index) =>
      buildTask(index, range, project)
    )
    return [project]
  }

  it('deselects a bar on a Ctrl+click when the page passes plain rows', async () => {
    const wrapper = mountPlainRows(
      buildProjectRows([['2026-08-03', '2026-08-03']])
    )
    const schedule = wrapper.findComponent(Schedule)
    expect(isReactive(schedule.props('hierarchy'))).toBe(false)
    const [bar] = taskBars(wrapper)
    await selectBar(wrapper, bar)
    expect(wrapper.findAll('.timebar.selected')).toHaveLength(1)

    await bar.trigger('mousedown', { clientX: 300, ctrlKey: true })
    document.dispatchEvent(
      new MouseEvent('mouseup', { bubbles: true, clientX: 300, ctrlKey: true })
    )
    await nextTick()

    expect(wrapper.findAll('.timebar.selected')).toHaveLength(0)
    wrapper.unmount()
  })

  // A press marked the store task with the time of the press: a page that
  // copies its tasks in a computed, the person page, then rebuilt its rows
  // under the drag.
  it('leaves the store task alone on a press of its bar', async () => {
    const rows = buildTaskListRows()
    const [task] = rows[0].children
    task.task_type_id = 'type-1'
    taskMap.set(task.id, { id: task.id })
    const wrapper = mountTaskList(rows)

    await selectBar(wrapper, taskBars(wrapper)[0])

    const commits = commit.mock.calls.map(([type]) => type)
    taskMap.clear()
    commit.mockClear()
    wrapper.unmount()
    expect(commits).toEqual([])
  })

  it('keeps each selected bar in its row once the page rebuilt them', async () => {
    const dates = {
      'person-1': [
        ['2026-08-03', '2026-08-03'],
        ['2026-08-05', '2026-08-05']
      ],
      'person-2': [['2026-08-03', '2026-08-03']]
    }
    const wrapper = mountSchedule(
      { hierarchy: buildAssigneeRows(dates), isEstimationLinked: true },
      { attachTo: document.body }
    )
    const [firstTaskBar, secondTaskBar] = taskBars(wrapper)
    await selectBar(wrapper, firstTaskBar)
    await secondTaskBar.trigger('mousedown', { clientX: 300, ctrlKey: true })
    document.dispatchEvent(
      new MouseEvent('mouseup', { bubbles: true, clientX: 300, ctrlKey: true })
    )
    await nextTick()

    const hierarchy = buildAssigneeRows(dates)
    await wrapper.setProps({ hierarchy })
    await dragOneWeek(taskBars(wrapper)[1])

    const [firstRow, secondRow] = hierarchy
    expect(firstRow.children.map(task => fmt(task.startDate))).toEqual([
      '2026-08-10',
      '2026-08-12'
    ])
    expect(fmt(secondRow.children[0].startDate)).toBe('2026-08-03')
    wrapper.unmount()
  })

  // The team schedule gives a task one bar object in each assignee row, and
  // a reassignment unassigns the row of each selected object. The drops go
  // to person-1, the only team member of the mocked production.
  const mountTeamSchedule = () => {
    const [alice, bob, carol] = ['person-2', 'person-3', 'person-1'].map(
      id => ({
        id,
        name: id,
        departments: [],
        editable: false,
        expanded: true,
        loading: false,
        startDate: moment.utc('2026-08-03'),
        endDate: moment.utc('2026-08-31'),
        daysOff: [],
        children: []
      })
    )
    const buildTeamTask = (id, personRow, assignees) => ({
      ...buildTask(0, ['2026-08-03', '2026-08-05'], personRow),
      id,
      project_id: 'production-1',
      assignees
    })
    alice.children.push(
      buildTeamTask('task-a', alice, ['person-2', 'person-3']),
      buildTeamTask('task-b', alice, ['person-2'])
    )
    bob.children.push(buildTeamTask('task-a', bob, ['person-2', 'person-3']))
    return mountSchedule(
      {
        hierarchy: reactive([alice, bob, carol]),
        multiline: true,
        reassignable: true
      },
      { attachTo: document.body }
    )
  }

  const personBars = (wrapper, personId) =>
    wrapper.findAll(`.timeline-element[data-id="${personId}"] .timebar-center`)

  const dropOnPersonRow = async (wrapper, bar, personId) => {
    await bar.trigger('mousedown', { clientX: 300 })
    wrapper
      .find(`.children[data-root-element-id="${personId}"]`)
      .element.dispatchEvent(
        new MouseEvent('mousemove', { bubbles: true, clientX: 300 })
      )
    document.dispatchEvent(
      new MouseEvent('mouseup', { bubbles: true, clientX: 300 })
    )
    await nextTick()
  }

  const unassignedRows = wrapper =>
    wrapper.emitted('item-unassign').map(([item, row]) => [item.id, row.id])

  it('reassigns the selected bar of a task shown in two rows', async () => {
    const wrapper = mountTeamSchedule()
    const person2Bars = personBars(wrapper, 'person-2')
    await selectBar(wrapper, person2Bars[0])
    await person2Bars[1].trigger('mousedown', { clientX: 300, ctrlKey: true })
    document.dispatchEvent(
      new MouseEvent('mouseup', { bubbles: true, clientX: 300, ctrlKey: true })
    )
    await nextTick()

    await dropOnPersonRow(wrapper, person2Bars[1], 'person-1')

    expect(unassignedRows(wrapper)).toEqual([
      ['task-a', 'person-2'],
      ['task-b', 'person-2']
    ])
    wrapper.unmount()
  })

  it('reassigns the bar dragged from the row of another assignee', async () => {
    const wrapper = mountTeamSchedule()
    await selectBar(wrapper, personBars(wrapper, 'person-2')[0])

    await dropOnPersonRow(wrapper, personBars(wrapper, 'person-3')[0], 'person-1')

    expect(unassignedRows(wrapper)).toEqual([['task-a', 'person-3']])
    wrapper.unmount()
  })

  it('moves every selected root bar along with the one pressed', async () => {
    const buildRoot = (id, [startDate, endDate]) => ({
      id,
      name: id,
      color: '#4a90e2',
      editable: true,
      expanded: false,
      loading: false,
      man_days: 0,
      daysOff: [],
      startDate: moment.utc(startDate),
      endDate: moment.utc(endDate),
      children: []
    })
    const hierarchy = reactive([
      buildRoot('tt-1', ['2026-08-03', '2026-08-07']),
      buildRoot('tt-2', ['2026-08-10', '2026-08-14'])
    ])
    const wrapper = mountSchedule({ hierarchy }, { attachTo: document.body })
    const [firstRootBar, secondRootBar] = wrapper.findAll(
      '.root-element .timebar-center'
    )
    await selectBar(wrapper, firstRootBar)
    await secondRootBar.trigger('mousedown', { clientX: 300, ctrlKey: true })
    document.dispatchEvent(
      new MouseEvent('mouseup', { bubbles: true, clientX: 300, ctrlKey: true })
    )
    await nextTick()

    await dragOneWeek(firstRootBar)

    expect(hierarchy.map(root => fmt(root.startDate))).toEqual([
      '2026-08-10',
      '2026-08-17'
    ])
    wrapper.unmount()
  })

  // The production schedule shows its task bars in person rows, below each
  // entity row: the lookup of the selected bars has to reach them there.
  it('moves the selected task bars of the person rows together', async () => {
    const hierarchy = buildSubchildrenHierarchy(2)
    const wrapper = mountSubchildren(hierarchy)
    const [firstBar, secondBar] = wrapper.findAll('.subchild .timebar-center')
    await selectBar(wrapper, firstBar)

    await dragOneWeek(secondBar, { ctrlKey: true })

    const tasks = hierarchy[0].children.map(
      row => row.children.get('person-1')[0]
    )
    expect(tasks.map(task => fmt(task.startDate))).toEqual([
      '2026-08-17',
      '2026-08-24'
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
      startDate: moment.utc('2026-08-03'),
      endDate: moment.utc('2026-10-23'),
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
        startDate: moment.utc('2026-08-10').add(e * 7, 'days'),
        endDate: moment.utc('2026-08-14').add(e * 7, 'days'),
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

  it('clips the rows to the root bar moved on a shift drag', async () => {
    const hierarchy = buildEntityHierarchy(1)
    const { wrapper } = mountCounted(hierarchy)
    const [root] = hierarchy
    const [row] = root.children
    root.endDate = moment.utc('2026-09-30')

    await dragRootBar(wrapper, 500, { shiftKey: true })

    expect(root.startDate.format('YYYY-MM-DD')).toBe('2026-08-13')
    expect(row.startDate.format('YYYY-MM-DD')).toBe('2026-08-13')
    expect(row.endDate.format('YYYY-MM-DD')).toBe('2026-08-14')
    wrapper.unmount()
  })

  // The all-episodes rows are laid out by line: rows snapped to the same
  // edge of the bar must not stay piled up on the line they had before.
  it('lays the multiline rows out again once the root bar clipped them', async () => {
    const hierarchy = buildEntityHierarchy(3)
    const [root] = hierarchy
    root.endDate = moment.utc('2026-09-30')
    const wrapper = mountSchedule(
      { hierarchy, clipChildren: true, multiline: true },
      { attachTo: document.body }
    )
    wrapper.vm.refreshAllItemPositions()
    expect(root.children.map(row => row.line)).toEqual([0, 0, 0])

    await dragRootBar(wrapper, 800, { shiftKey: true })

    root.children.forEach(row => {
      expect(row.startDate.format('YYYY-MM-DD')).toBe('2026-08-28')
    })
    expect(root.children.map(row => row.line)).toEqual([0, 1, 2])
    expect(wrapper.find('.children[data-root-element-id]').element.style.height)
      .toBe('130px')
    wrapper.unmount()
  })

  describe('rows loaded after the drop of a collapsed bar', () => {
    const dropCollapsedBar = async (options = {}) => {
      const hierarchy = buildEntityHierarchy(0)
      const [root] = hierarchy
      root.expanded = false
      root.endDate = moment.utc('2026-09-30')
      const wrapper = mountSchedule(
        { hierarchy, clipChildren: true, multiline: true },
        { attachTo: document.body }
      )
      await dragRootBar(wrapper, 500, options)
      // loaded from the server: the dates the bar had before its move
      root.children = [
        {
          id: 'row-1',
          name: 'E01',
          startDate: moment.utc('2026-08-03'),
          endDate: moment.utc('2026-08-07'),
          parentElement: root
        },
        {
          id: 'row-2',
          name: 'E02',
          startDate: moment.utc('2026-08-04'),
          endDate: moment.utc('2026-08-07'),
          parentElement: root
        }
      ]
      wrapper.vm.applyMoveToLoadedRows(root)
      return { root, wrapper }
    }

    it('clips them to the bar on a shift drag, on lines of their own', async () => {
      const { root, wrapper } = await dropCollapsedBar({ shiftKey: true })
      const [row] = root.children

      expect(row.startDate.format('YYYY-MM-DD')).toBe('2026-08-13')
      expect(row.endDate.format('YYYY-MM-DD')).toBe('2026-08-14')
      expect(row._dragOrigStartDate.format('YYYY-MM-DD')).toBe('2026-08-03')
      expect(root.children.map(({ line }) => line)).toEqual([0, 1])
      wrapper.unmount()
    })

    it('moves them with the bar', async () => {
      const { root, wrapper } = await dropCollapsedBar()
      const [row] = root.children

      expect(row.startDate.format('YYYY-MM-DD')).toBe('2026-08-13')
      expect(row.endDate.format('YYYY-MM-DD')).toBe('2026-08-17')
      wrapper.unmount()
    })
  })

  it('moves the rows along with the root bar', async () => {
    const hierarchy = buildEntityHierarchy(2)
    const { wrapper } = mountCounted(hierarchy)
    const [root] = hierarchy
    const [first, second] = root.children
    root.endDate = moment.utc('2026-09-30')

    await dragRootBar(wrapper, 500)

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
    root.endDate = moment.utc('2026-09-30')
    const wrapper = mountSchedule(
      { hierarchy, zoomLevel: 0, clipChildren: true },
      { attachTo: document.body }
    )

    // the week zoom is 20px a week
    await dragRootBar(wrapper, 320)

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
