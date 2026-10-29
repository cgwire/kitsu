import moment from 'moment-timezone'
import { firstBy } from 'thenby'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import preferences from '@/lib/preferences'
import { getTaskStatusPriorityOfProd } from '@/lib/productions'
import { sortByName } from '@/lib/sorting'
import { parseDate } from '@/lib/time'

const toOptions = names => names.map(name => ({ label: name, value: name }))

const filterOptions = toOptions([
  'all_tasks',
  'due_this_week',
  'due_previous_week'
])

const sortOptions = toOptions([
  'entity_name',
  'priority',
  'task_status_short_name',
  'start_date',
  'due_date',
  'estimation',
  'last_comment_date'
])

const byDate = field => (a, b) => {
  if (!a[field]) return 1
  if (!b[field]) return -1
  return a[field].localeCompare(b[field])
}

const isDueInWeek = (task, filter) => {
  const week = moment().startOf('week')
  if (filter === 'due_previous_week') week.subtract(1, 'week')
  return week.isSame(parseDate(task.due_date), 'week')
}

/*
 * Due date, task type and sort filters of a task list, restored from the URL
 * first, then from the local storage under `storageKey`. The production
 * filter stays with the page: `productionId` only narrows the lists here.
 */
export const useTaskFilters = ({
  storageKey,
  productionId,
  tasks,
  defaultSort = 'priority'
}) => {
  const { t } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const store = useStore()

  // State
  // --------------------------------------------------------------------------
  const storedFilters = preferences.getObjectPreference(storageKey) || {}
  const pickFilter = (key, options, defaultValue) =>
    [route.query[key], storedFilters[key]].find(value =>
      options.some(option => option.value === value)
    ) ?? defaultValue

  const currentFilter = ref(pickFilter('due', filterOptions, 'all_tasks'))
  const currentSort = ref(pickFilter('sort', sortOptions, defaultSort))
  const taskTypeId = ref(
    route.query.taskTypeId ?? storedFilters.taskTypeId ?? ''
  )

  // Computed
  // --------------------------------------------------------------------------
  const taskTypeList = computed(() => {
    const taskTypeIds = new Set(
      tasks.value.filter(isInProduction).map(task => task.task_type_id)
    )
    return [
      { id: '', color: '#999', name: t('main.all') },
      ...sortByName(
        [...taskTypeIds]
          .map(id => store.getters.taskTypeMap.get(id))
          .filter(Boolean)
      )
    ]
  })

  // Functions
  // --------------------------------------------------------------------------
  const isInProduction = task =>
    !productionId.value || task.project_id === productionId.value

  const sortTasks = (tasks, sort) => {
    if (sort === 'entity_name') {
      return tasks.sort(
        firstBy('project_name')
          .thenBy('task_type_name')
          .thenBy('full_entity_name')
      )
    }
    if (sort === 'priority') {
      return tasks.sort(
        firstBy('priority', -1)
          .thenBy(byDate('due_date'))
          .thenBy('project_name')
          .thenBy('task_type_name')
          .thenBy('entity_name')
      )
    }
    if (sort === 'due_date' || sort === 'start_date') {
      return tasks.sort(
        firstBy(byDate(sort))
          .thenBy('project_name')
          .thenBy('task_type_name')
          .thenBy('entity_name')
      )
    }
    if (sort === 'task_status_short_name') {
      // Follow the task status order from the studio / production
      // settings instead of sorting short names alphabetically.
      const statusPriority = task =>
        getTaskStatusPriorityOfProd(
          store.getters.taskStatusMap.get(task.task_status_id),
          store.getters.productionMap.get(task.project_id)
        )
      return tasks.sort(
        firstBy((a, b) => statusPriority(a) - statusPriority(b))
          .thenBy('task_status_short_name')
          .thenBy('project_name')
          .thenBy('task_type_name')
          .thenBy('entity_name')
      )
    }
    return tasks.sort(
      firstBy(sort, -1)
        .thenBy('project_name')
        .thenBy('task_type_name')
        .thenBy('entity_name')
    )
  }

  const filterAndSortTasks = tasks => {
    const filter = currentFilter.value
    const filtered = tasks.filter(
      task =>
        isInProduction(task) &&
        (!taskTypeId.value || task.task_type_id === taskTypeId.value) &&
        (filter === 'all_tasks' || isDueInWeek(task, filter))
    )
    return sortTasks(filtered, currentSort.value)
  }

  const saveFilters = () => {
    preferences.setObjectPreference(storageKey, {
      productionId: productionId.value,
      taskTypeId: taskTypeId.value,
      due: currentFilter.value,
      sort: currentSort.value
    })
  }

  // Watchers
  // --------------------------------------------------------------------------
  watch([taskTypeId, currentFilter, currentSort], () => {
    saveFilters()
    router.replace({
      query: {
        ...route.query,
        taskTypeId: taskTypeId.value || undefined,
        due: currentFilter.value,
        sort: currentSort.value
      }
    })
  })

  return {
    currentFilter,
    currentSort,
    filterAndSortTasks,
    filterOptions,
    saveFilters,
    sortOptions,
    storedFilters,
    taskTypeId,
    taskTypeList
  }
}
