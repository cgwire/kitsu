import moment from 'moment-timezone'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

// Pre-load the real store to avoid circular-import race from child components.
import '@/lib/auth'

import ProductionSchedule, {
  parseHiddenTaskTypeIds
} from '@/components/pages/ProductionSchedule.vue'

const {
  getMaxDate,
  getMinDate,
  onScheduleItemChanged,
  onSelectTaskType,
  onTaskTypeVisibilityChanged,
  saveTaskChanged,
  toggleSidePanel,
  updateRoute,
  updateScheduleItem,
  widenScheduleItemParents
} = ProductionSchedule.methods
const {
  filteredScheduleItems,
  hasTaskTypeFilter,
  taskTypeFilterOptions,
  taskTypeFilterTitle,
  taskTypeVisibilityMap
} = ProductionSchedule.computed

const buildTask = assignees => ({
  id: 'task-1',
  versionedTaskId: 'link-1',
  estimation: 480,
  assignees,
  startDate: moment.utc('2026-09-21'),
  endDate: moment.utc('2026-09-22')
})

describe('ProductionSchedule saveTaskChanged', () => {
  it('drops the unassigned placeholder from the versioned task link', async () => {
    const updateScheduleVersionedTask = vi.fn().mockResolvedValue()
    // the drill-down groups unassigned tasks under a local 'unassigned' row
    // that is not a person id known to the API
    const task = buildTask(['unassigned'])

    await saveTaskChanged.call(
      { isVersioned: true, updateScheduleVersionedTask },
      task
    )

    expect(updateScheduleVersionedTask).toHaveBeenCalledWith({
      id: 'link-1',
      estimation: 480,
      startDate: '2026-09-21',
      dueDate: '2026-09-22',
      assignees: []
    })
  })

  it('keeps the real assignees of the versioned task link', async () => {
    const updateScheduleVersionedTask = vi.fn().mockResolvedValue()
    const task = buildTask(['person-1', 'person-2'])

    await saveTaskChanged.call(
      { isVersioned: true, updateScheduleVersionedTask },
      task
    )

    expect(updateScheduleVersionedTask).toHaveBeenCalledWith(
      expect.objectContaining({ assignees: ['person-1', 'person-2'] })
    )
  })
})

describe('ProductionSchedule task type filter', () => {
  const modelingItem = {
    task_type_id: 'tt-modeling',
    name: 'Asset / Modeling',
    for_entity: 'Asset'
  }
  const layoutItem = {
    task_type_id: 'tt-layout',
    name: 'Shot / Layout',
    for_entity: 'Shot'
  }
  const animationItem = {
    task_type_id: 'tt-animation',
    name: 'Shot / Animation',
    for_entity: 'Shot'
  }

  const buildPage = (overrides = {}) => ({
    $refs: { schedule: { resetSelection: vi.fn() } },
    $t: key => key,
    closeSidePanel: vi.fn(),
    entityFilteredScheduleItems: [modelingItem, layoutItem, animationItem],
    entityType: null,
    expandTaskTypeElement: vi.fn(),
    hiddenTaskTypeIds: [],
    scheduleItems: [modelingItem, layoutItem, animationItem],
    selectedTaskType: null,
    updateRoute: vi.fn(),
    ...overrides
  })

  it('removes the hidden types from the rows of the entity filter', () => {
    const page = buildPage({
      entityFilteredScheduleItems: [layoutItem, animationItem],
      hiddenTaskTypeIds: ['tt-modeling', 'tt-animation']
    })

    expect(filteredScheduleItems.call(page)).toEqual([layoutItem])
  })

  it('ticks the visible types of the current view', () => {
    const page = buildPage({
      hiddenTaskTypeIds: ['tt-modeling', 'tt-animation'],
      taskTypeFilterOptions: [
        { label: 'Shot / Layout', value: 'tt-layout' },
        { label: 'Shot / Animation', value: 'tt-animation' }
      ]
    })

    expect(taskTypeVisibilityMap.call(page)).toEqual({
      'tt-layout': true,
      'tt-animation': false
    })
  })

  // The rows are named '<entity> / <task type>', and two entities can share a
  // task type name: the bare name leaves two identical options.
  it('names the options after the schedule rows, in their order', () => {
    const options = taskTypeFilterOptions.call(buildPage())

    expect(options).toEqual([
      { label: 'Asset / Modeling', value: 'tt-modeling' },
      { label: 'Shot / Layout', value: 'tt-layout' },
      { label: 'Shot / Animation', value: 'tt-animation' }
    ])
  })

  it('keeps the types hidden outside the current entity filter', () => {
    const page = buildPage({
      entityType: 'Shot',
      entityFilteredScheduleItems: [layoutItem, animationItem],
      hiddenTaskTypeIds: ['tt-modeling']
    })

    onTaskTypeVisibilityChanged.call(page, {
      key: 'tt-animation',
      value: false
    })

    expect(page.hiddenTaskTypeIds).toEqual(['tt-modeling', 'tt-animation'])
    expect(page.updateRoute).toHaveBeenCalledWith({
      hiddenTypes: 'tt-modeling,tt-animation'
    })
  })

  it('clears the query param once every type is shown again', () => {
    const page = buildPage({ hiddenTaskTypeIds: ['tt-animation'] })

    onTaskTypeVisibilityChanged.call(page, {
      key: 'tt-animation',
      value: true
    })

    expect(page.hiddenTaskTypeIds).toEqual([])
    expect(page.updateRoute).toHaveBeenCalledWith({ hiddenTypes: null })
  })

  // Hidden rows leave the schedule while their tasks stay selected: the next
  // drag would move them out of sight.
  it('drops the schedule selection when a type is hidden', () => {
    const page = buildPage({ selectedTaskType: layoutItem })

    onTaskTypeVisibilityChanged.call(page, { key: 'tt-animation', value: false })

    expect(page.$refs.schedule.resetSelection).toHaveBeenCalled()
    expect(page.closeSidePanel).not.toHaveBeenCalled()

    onTaskTypeVisibilityChanged.call(page, { key: 'tt-layout', value: false })

    expect(page.closeSidePanel).toHaveBeenCalled()
  })

  // Without it the last visible type can be hidden from another entity view,
  // and the filter disappears with no way to bring the row back.
  it('stays on screen while a type of the current view is hidden', () => {
    const page = buildPage({
      entityFilteredScheduleItems: [modelingItem],
      filteredScheduleItems: [],
      hiddenTaskTypeIds: ['tt-modeling'],
      taskTypeFilterOptions: [
        { label: 'Asset / Modeling', value: 'tt-modeling' }
      ]
    })

    expect(hasTaskTypeFilter.call(page)).toBe(true)
  })

  it('hides itself when a single type is left to choose from', () => {
    const page = buildPage({
      entityFilteredScheduleItems: [modelingItem],
      filteredScheduleItems: [modelingItem],
      taskTypeFilterOptions: [
        { label: 'Asset / Modeling', value: 'tt-modeling' }
      ]
    })

    expect(hasTaskTypeFilter.call(page)).toBe(false)
  })

  it('counts the visible types in its title', () => {
    const page = buildPage({
      filteredScheduleItems: [modelingItem],
      taskTypeFilterOptions: [
        { label: 'Asset / Modeling', value: 'tt-modeling' },
        { label: 'Shot / Layout', value: 'tt-layout' },
        { label: 'Shot / Animation', value: 'tt-animation' }
      ]
    })

    expect(taskTypeFilterTitle.call(page)).toBe('(1/3)')

    page.filteredScheduleItems = page.entityFilteredScheduleItems

    expect(taskTypeFilterTitle.call(page)).toBe('main.all')
  })

  // The side panel lists every task type of the production: picking a hidden
  // one used to fill the panel while the schedule showed nothing.
  it('shows a hidden type again when the side panel selects it', () => {
    const page = buildPage({ hiddenTaskTypeIds: ['tt-animation'] })

    onSelectTaskType.call(page, 'tt-animation')

    expect(page.hiddenTaskTypeIds).toEqual([])
    expect(page.updateRoute).toHaveBeenCalledWith({ hiddenTypes: null })
    expect(page.expandTaskTypeElement).toHaveBeenCalled()
  })

  it('clears the entity filter and the task type filter at once', () => {
    const page = buildPage({
      entityType: 'Asset',
      hiddenTaskTypeIds: ['tt-animation']
    })

    onSelectTaskType.call(page, 'tt-animation')

    expect(page.entityType).toBeNull()
    expect(page.updateRoute).toHaveBeenCalledTimes(1)
    expect(page.updateRoute).toHaveBeenCalledWith({
      type: null,
      hiddenTypes: null
    })
  })

  // Expanding a row selects it, and Expand all or the export expand the
  // hidden rows too: the last one would open the panel on a row out of sight.
  it('opens the side panel empty when its row is hidden', () => {
    const page = buildPage({
      assignments: { type: null, entityTypes: null },
      filteredScheduleItems: [modelingItem, layoutItem],
      isSidePanelOpen: false,
      selectedTaskType: animationItem,
      selectTaskTypeElement: vi.fn()
    })

    toggleSidePanel.call(page)

    expect(page.isSidePanelOpen).toBe(true)
    expect(page.selectedTaskType).toBeNull()
    expect(page.selectTaskTypeElement).not.toHaveBeenCalled()
  })

  it('opens the side panel on its row when the row is shown', () => {
    const page = buildPage({
      assignments: { type: null, entityTypes: null },
      filteredScheduleItems: [modelingItem, layoutItem],
      isSidePanelOpen: false,
      selectedTaskType: layoutItem,
      selectTaskTypeElement: vi.fn()
    })

    toggleSidePanel.call(page)

    expect(page.selectTaskTypeElement).toHaveBeenCalledWith(layoutItem)
  })
})

describe('ProductionSchedule hiddenTypes query param', () => {
  const taskTypeMap = new Map([
    ['tt-modeling', { id: 'tt-modeling' }],
    ['tt-animation', { id: 'tt-animation' }]
  ])

  it('reads the comma separated list', () => {
    expect(
      parseHiddenTaskTypeIds('tt-modeling,tt-animation', taskTypeMap)
    ).toEqual(['tt-modeling', 'tt-animation'])
  })

  it('drops the types the production no longer has', () => {
    expect(parseHiddenTaskTypeIds('tt-modeling,tt-gone', taskTypeMap)).toEqual([
      'tt-modeling'
    ])
  })

  // A param repeated in the URL reaches the page as an array: splitting it
  // threw and left the schedule editable in its read-only mode.
  it('reads the param repeated in the URL', () => {
    expect(
      parseHiddenTaskTypeIds(['tt-modeling', 'tt-animation'], taskTypeMap)
    ).toEqual(['tt-modeling', 'tt-animation'])
  })

  it('reads an empty query', () => {
    expect(parseHiddenTaskTypeIds(undefined, taskTypeMap)).toEqual([])
  })

  const buildRoutedPage = () => ({
    $route: { query: { zoom: '1' } },
    $router: { push: vi.fn(), replace: vi.fn() }
  })

  // The page never reads the history back: one entry per ticked checkbox
  // would only take as many Back presses to leave it.
  it('replaces the history entry when the hidden types change', () => {
    const page = buildRoutedPage()

    updateRoute.call(page, { hiddenTypes: 'tt-modeling' })

    expect(page.$router.replace).toHaveBeenCalledWith({
      query: { zoom: '1', hiddenTypes: 'tt-modeling' }
    })
    expect(page.$router.push).not.toHaveBeenCalled()
  })

  it('pushes a history entry for the other settings', () => {
    const page = buildRoutedPage()

    updateRoute.call(page, { mode: 'real' })

    expect(page.$router.push).toHaveBeenCalledWith({
      query: { zoom: '1', mode: 'real' }
    })
    expect(page.$router.replace).not.toHaveBeenCalled()
  })
})

// The Excel export and the side panel date ranges read the raw start_date /
// end_date strings, while a drag moves the startDate / endDate moments.
describe('ProductionSchedule bar date strings', () => {
  const buildPage = (overrides = {}) => ({
    isVersioned: false,
    scheduleItems: [],
    startDate: moment.utc('2026-01-01'),
    endDate: moment.utc('2026-12-31'),
    saveScheduleItem: vi.fn().mockResolvedValue(),
    getMinDate,
    getMaxDate,
    updateScheduleItem,
    widenScheduleItemParents,
    ...overrides
  })

  const buildBar = (start, end) => ({
    start_date: '2026-03-01',
    end_date: '2026-03-02',
    startDate: moment.utc(start),
    endDate: moment.utc(end)
  })

  it('refreshes the raw dates of an entity bar after a drag', async () => {
    const page = buildPage()
    const entityBar = buildBar('2026-10-01', '2026-10-05')

    await updateScheduleItem.call(page, entityBar)

    expect(entityBar.start_date).toBe('2026-10-01')
    expect(entityBar.end_date).toBe('2026-10-05')
    expect(page.saveScheduleItem).toHaveBeenCalledWith(entityBar)
  })

  it('refreshes the raw dates of the task type bar an entity drag resizes', async () => {
    const page = buildPage()
    const taskTypeBar = buildBar('2026-03-01', '2026-03-02')
    const movedBar = buildBar('2026-04-01', '2026-04-10')
    const otherBar = buildBar('2026-05-01', '2026-05-20')
    taskTypeBar.children = [movedBar, otherBar]
    movedBar.parentElement = taskTypeBar
    otherBar.parentElement = taskTypeBar

    await onScheduleItemChanged.call(page, movedBar)

    expect(taskTypeBar.start_date).toBe('2026-04-01')
    expect(taskTypeBar.end_date).toBe('2026-05-20')
    expect(page.saveScheduleItem).toHaveBeenCalledWith(taskTypeBar)
  })

  // A task stretching past both ends of its bars must save each bar once
  // with its two new dates: two requests racing could keep a stale end.
  it('saves each widened parent of a task once', async () => {
    const page = buildPage({
      daysOffByPerson: {},
      organisation: { hours_by_day: 8 },
      saveTaskChanged: vi.fn().mockResolvedValue()
    })
    const taskTypeBar = buildBar('2026-01-06', '2026-01-15')
    const entityBar = buildBar('2026-01-07', '2026-01-14')
    entityBar.parentElement = taskTypeBar
    // Monday 5 to Friday 16: ten working days
    const task = {
      type: 'Task',
      assignees: [],
      estimation: 10 * 8 * 60,
      startDate: moment.utc('2026-01-05'),
      endDate: moment.utc('2026-01-16'),
      parentElement: entityBar
    }

    await onScheduleItemChanged.call(page, task)

    expect(page.saveScheduleItem).toHaveBeenCalledTimes(2)
    expect(page.saveScheduleItem).toHaveBeenCalledWith(entityBar)
    expect(page.saveScheduleItem).toHaveBeenCalledWith(taskTypeBar)
    expect([entityBar.start_date, entityBar.end_date]).toEqual([
      '2026-01-05',
      '2026-01-16'
    ])
    expect([taskTypeBar.start_date, taskTypeBar.end_date]).toEqual([
      '2026-01-05',
      '2026-01-16'
    ])
  })
})
