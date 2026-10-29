// @vitest-environment node
import moment from 'moment-timezone'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { computed, effectScope, nextTick, reactive, ref } from 'vue'

import { useTaskFilters } from '@/composables/taskFilters'

const route = reactive({ query: {} })
const router = { replace: vi.fn(query => Object.assign(route, query)) }
const taskTypeMap = new Map([
  ['type-1', { id: 'type-1', name: 'Modeling' }],
  ['type-2', { id: 'type-2', name: 'Animation' }],
  ['type-3', { id: 'type-3', name: 'Layout' }]
])

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))
vi.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => router
}))
vi.mock('vuex', () => ({
  useStore: () => ({
    getters: {
      productionMap: new Map(),
      taskStatusMap: new Map(),
      taskTypeMap
    }
  })
}))

const STORAGE_KEY = 'tests:filters'

const setup = ({
  query = {},
  stored,
  tasks = [],
  productionId,
  defaultSort
} = {}) => {
  route.query = query
  router.replace.mockClear()
  if (stored) localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  const scope = effectScope()
  const productionIdRef = ref(productionId)
  const filters = scope.run(() =>
    useTaskFilters({
      storageKey: STORAGE_KEY,
      productionId: productionIdRef,
      tasks: computed(() => tasks),
      defaultSort
    })
  )
  return { filters, scope, productionId: productionIdRef }
}

const dueDate = date => `${date.format('YYYY-MM-DD')}T12:00:00`

describe('useTaskFilters', () => {
  afterEach(() => localStorage.clear())

  describe('initial filters', () => {
    test('defaults to all tasks, by priority, every task type', () => {
      const { filters } = setup()
      expect(filters.currentFilter.value).toBe('all_tasks')
      expect(filters.currentSort.value).toBe('priority')
      expect(filters.taskTypeId.value).toBe('')
    })

    test('sorts by the default sort of the page', () => {
      const { filters } = setup({ defaultSort: 'entity_name' })
      expect(filters.currentSort.value).toBe('entity_name')
    })

    test('reads the filters stored under the storage key', () => {
      const { filters } = setup({
        stored: { taskTypeId: 'type-3', due: 'due_this_week', sort: 'due_date' }
      })
      expect(filters.currentFilter.value).toBe('due_this_week')
      expect(filters.currentSort.value).toBe('due_date')
      expect(filters.taskTypeId.value).toBe('type-3')
    })

    test('ignores the filters stored under another key', () => {
      localStorage.setItem(
        'todos:filters',
        JSON.stringify({ due: 'due_this_week', sort: 'due_date' })
      )
      const { filters } = setup()
      expect(filters.currentFilter.value).toBe('all_tasks')
      expect(filters.currentSort.value).toBe('priority')
    })

    test('the URL wins over the stored filters', () => {
      const { filters } = setup({
        query: {
          taskTypeId: 'type-2',
          due: 'due_previous_week',
          sort: 'estimation'
        },
        stored: { taskTypeId: 'type-3', due: 'due_this_week', sort: 'due_date' }
      })
      expect(filters.currentFilter.value).toBe('due_previous_week')
      expect(filters.currentSort.value).toBe('estimation')
      expect(filters.taskTypeId.value).toBe('type-2')
    })

    test('skips an unknown value for a valid one', () => {
      const { filters } = setup({
        query: { due: 'due_tomorrow', sort: 'size' },
        stored: { due: 'due_this_week' }
      })
      expect(filters.currentFilter.value).toBe('due_this_week')
      expect(filters.currentSort.value).toBe('priority')
    })
  })

  describe('filter changes', () => {
    test('writes the filters into the URL and the storage', async () => {
      const { filters, productionId } = setup({ query: { section: 'todos' } })
      productionId.value = 'prod-1'
      filters.taskTypeId.value = 'type-1'
      filters.currentFilter.value = 'due_previous_week'
      await nextTick()

      expect(router.replace).toHaveBeenCalledWith({
        query: {
          section: 'todos',
          taskTypeId: 'type-1',
          due: 'due_previous_week',
          sort: 'priority'
        }
      })
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual({
        productionId: 'prod-1',
        taskTypeId: 'type-1',
        due: 'due_previous_week',
        sort: 'priority'
      })
    })

    test('drops an empty task type from the URL', async () => {
      const { filters } = setup({ query: { taskTypeId: 'type-1' } })
      filters.taskTypeId.value = ''
      await nextTick()
      expect(router.replace.mock.calls[0][0].query.taskTypeId).toBeUndefined()
    })
  })

  describe('filterAndSortTasks', () => {
    const thisWeek = moment().startOf('week').add(2, 'days')
    const previousWeek = thisWeek.clone().subtract(1, 'week')
    const tasks = [
      { id: 'now', project_id: 'p1', task_type_id: 'type-1', due_date: dueDate(thisWeek) },
      { id: 'before', project_id: 'p1', task_type_id: 'type-2', due_date: dueDate(previousWeek) },
      { id: 'none', project_id: 'p2', task_type_id: 'type-1', due_date: null }
    ]
    const ids = list => list.map(task => task.id).sort()

    test('keeps every task by default', () => {
      const { filters } = setup()
      expect(ids(filters.filterAndSortTasks(tasks))).toEqual([
        'before',
        'none',
        'now'
      ])
    })

    test('keeps the tasks due this week', () => {
      const { filters } = setup({ query: { due: 'due_this_week' } })
      expect(ids(filters.filterAndSortTasks(tasks))).toEqual(['now'])
    })

    test('keeps the tasks due the previous week', () => {
      const { filters } = setup({ query: { due: 'due_previous_week' } })
      expect(ids(filters.filterAndSortTasks(tasks))).toEqual(['before'])
    })

    test('keeps the tasks of the task type and the production', () => {
      const { filters, productionId } = setup({ query: { taskTypeId: 'type-1' } })
      expect(ids(filters.filterAndSortTasks(tasks))).toEqual(['none', 'now'])
      productionId.value = 'p1'
      expect(ids(filters.filterAndSortTasks(tasks))).toEqual(['now'])
    })

    test('sorts by due date, undated tasks last', () => {
      const { filters } = setup({ query: { sort: 'due_date' } })
      expect(filters.filterAndSortTasks(tasks).map(task => task.id)).toEqual([
        'before',
        'now',
        'none'
      ])
    })

    test('leaves the given list untouched', () => {
      const { filters } = setup({ query: { sort: 'due_date' } })
      const list = [...tasks]
      filters.filterAndSortTasks(list)
      expect(list).toEqual(tasks)
    })
  })

  describe('taskTypeList', () => {
    const tasks = [
      { project_id: 'p1', task_type_id: 'type-1' },
      { project_id: 'p1', task_type_id: 'type-1' },
      { project_id: 'p2', task_type_id: 'type-2' },
      { project_id: 'p2', task_type_id: 'unknown' }
    ]

    test('lists the task types of the tasks, after "all"', () => {
      const { filters } = setup({ tasks })
      expect(filters.taskTypeList.value.map(taskType => taskType.id)).toEqual([
        '',
        'type-2',
        'type-1'
      ])
      expect(filters.taskTypeList.value[0].name).toBe('main.all')
    })

    test('keeps the task types of the selected production only', () => {
      const { filters } = setup({ tasks, productionId: 'p2' })
      expect(filters.taskTypeList.value.map(taskType => taskType.id)).toEqual([
        '',
        'type-2'
      ])
    })
  })
})
