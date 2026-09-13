import moment from 'moment'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import { getEntityPath } from '@/lib/path'
import {
  addBusinessDays,
  getFirstStartDate,
  getLastEndDate,
  minutesToDays,
  parseDate,
  parseSimpleDate
} from '@/lib/time'
import assetStore from '@/store/modules/assets'
import editStore from '@/store/modules/edits'
import episodeStore from '@/store/modules/episodes'
import sequenceStore from '@/store/modules/sequences'
import shotStore from '@/store/modules/shots'

/*
 * Non-reactive cache Map for a given entity type ('Asset', 'shot', ...).
 * Plain function on purpose: the caches are module-level Maps mutated in
 * place, so read them at call time, never iterate them from a computed
 * (an empty first evaluation would cache [] forever).
 */
export const getEntityMap = entityType => {
  const caches = {
    asset: assetStore.cache.assetMap,
    edit: editStore.cache.editMap,
    episode: episodeStore.cache.episodeMap,
    sequence: sequenceStore.cache.sequenceMap,
    shot: shotStore.cache.shotMap
  }
  return caches[entityType.toLowerCase()]
}

/**
 * Composable mirroring src/components/mixins/entity.js for pages that use
 * `<script setup>`. Intentionally narrow: only the parts the entity pages
 * (Edit, Asset, Shot, Sequence, Episode) need.
 *
 * @param {Object} options
 * @param {string} options.type - lowercase entity type (e.g. 'edit').
 * @param {import('vue').Ref<Object|null>} options.currentEntity - the
 *   selected entity ref (e.g. currentEdit). The composable does NOT
 *   derive this from `type` — callers pass it directly.
 * @param {import('vue').ComputedRef<Array>} options.entityList - the
 *   full list of entities (computed from store or page state). Caller
 *   passes a ref/computed.
 * @param {Function} options.init - reset/reload callback fired when the
 *   route params change (mirrors the mixin's `$route` watcher).
 */
export const useEntity = ({ type, currentEntity, entityList, init }) => {
  const route = useRoute()
  const store = useStore()

  // Store getters used by the ported computeds.
  const taskMap = computed(() => store.getters.taskMap)
  const taskTypeMap = computed(() => store.getters.taskTypeMap)
  const getTaskTypePriority = computed(() => store.getters.getTaskTypePriority)
  const currentEpisode = computed(() => store.getters.currentEpisode)
  const currentProduction = computed(() => store.getters.currentProduction)
  const organisation = computed(() => store.getters.organisation)
  const isCurrentUserManager = computed(
    () => store.getters.isCurrentUserProductionManager
  )
  const isCurrentUserSupervisor = computed(
    () => store.getters.isCurrentUserProductionSupervisor
  )
  const user = computed(() => store.getters.user)

  const canEditTaskDates = taskType => {
    const departments = user.value.departments || []
    return (
      isCurrentUserManager.value ||
      (isCurrentUserSupervisor.value &&
        (!departments.length || departments.includes(taskType.department_id)))
    )
  }

  // Local state (mirrors the mixin's `data()` fields used by Edit.vue).
  const currentSection = ref('infos')
  const currentTask = ref(null)
  const zoomLevel = ref(1)
  const scheduleItems = ref([])
  let scheduleItemsSignature = null
  const zoomOptions = [
    { label: '1', value: 1 },
    { label: '2', value: 2 },
    { label: '3', value: 3 }
  ]

  const getEntityIndex = entityId =>
    entityList.value.findIndex(entity => entity.id === entityId)

  const previousEntity = computed(() => {
    if (!currentEntity.value) return null
    const entityIndex = getEntityIndex(currentEntity.value.id)
    if (entityIndex === -1) return null
    return entityIndex > 0
      ? entityList.value[entityIndex - 1]
      : entityList.value[entityList.value.length - 1]
  })

  const nextEntity = computed(() => {
    if (!currentEntity.value) return null
    const entityIndex = getEntityIndex(currentEntity.value.id)
    if (entityIndex === -1) return null
    return entityIndex < entityList.value.length - 1
      ? entityList.value[entityIndex + 1]
      : entityList.value[0]
  })

  const previousEntityPath = computed(() => {
    const entity = previousEntity.value
    if (!entity) return null
    return getEntityPath(
      entity.id,
      currentProduction.value.id,
      type,
      currentEpisode.value?.id
    )
  })

  const nextEntityPath = computed(() => {
    const entity = nextEntity.value
    if (!entity) return null
    return getEntityPath(
      entity.id,
      currentProduction.value.id,
      type,
      currentEpisode.value?.id
    )
  })

  const currentTasks = computed(() => {
    const entity = currentEntity.value
    if (!entity || !entity.tasks) return []
    return entity.tasks
      .map(taskId => taskMap.value.get(taskId))
      .filter(task => task)
      .sort((a, b) => {
        const priorityA = getTaskTypePriority.value(a.task_type_id)
        const priorityB = getTaskTypePriority.value(b.task_type_id)
        return priorityA - priorityB
      })
  })

  const tasksStartDate = computed(() => {
    if (
      scheduleItems.value.length > 0 &&
      scheduleItems.value[0].children.length > 0
    ) {
      return getFirstStartDate(scheduleItems.value[0].children)
        .clone()
        .add(-60, 'days')
    }
    return parseDate(currentProduction.value.start_date)
  })

  const tasksEndDate = computed(() => {
    if (
      scheduleItems.value.length > 0 &&
      scheduleItems.value[0].children.length > 0
    ) {
      return getLastEndDate(scheduleItems.value[0].children)
        .clone()
        .add(60, 'days')
    }
    return parseDate(currentProduction.value.end_date)
  })

  const initScheduleItems = () => {
    let manDays = 0
    const rootElement = {
      avatar: false,
      id: 'root',
      name: 'Tasks',
      color: '#888',
      priority: 1,
      expanded: true,
      loading: false,
      children: [],
      editable: true
    }
    const limitStartDate = moment()
    const children = currentTasks.value
      .map(task => {
        const estimation = task.estimation
        let startDate = limitStartDate.clone()
        let endDate

        if (
          !task.start_date &&
          !task.real_start_date &&
          !task.due_date &&
          !task.end_date
        )
          return null

        if (task.start_date) {
          startDate = parseSimpleDate(task.start_date)
        } else if (task.real_start_date) {
          startDate = parseSimpleDate(task.real_start_date)
        }

        if (task.due_date) {
          endDate = parseSimpleDate(task.due_date)
        } else if (task.end_date) {
          endDate = parseSimpleDate(task.end_date)
        } else if (task.estimation) {
          endDate = addBusinessDays(
            startDate,
            Math.ceil(minutesToDays(organisation.value, estimation)) - 1
          )
        }

        if (!endDate || endDate.isBefore(startDate)) {
          endDate = startDate.clone().add(1, 'days')
        }
        const taskType = taskTypeMap.value.get(task.task_type_id)
        if (!taskType) return null
        if (estimation) manDays += task.estimation

        return {
          ...task,
          name: taskType.name,
          startDate,
          endDate,
          expanded: false,
          loading: false,
          man_days: estimation,
          editable: canEditTaskDates(taskType),
          unresizable: false,
          parentElement: rootElement,
          color: taskType.color,
          children: []
        }
      })
      .filter(c => c !== null)

    // any task mutation in the store retriggers this build: skip the
    // replacement (and the widget re-render) when nothing visible changed
    const signature = children
      .map(
        child =>
          `${child.id}:${child.startDate.valueOf()}:` +
          `${child.endDate.valueOf()}:${child.man_days || 0}`
      )
      .join('|')
    if (signature === scheduleItemsSignature) return
    scheduleItemsSignature = signature

    let rootStartDate = moment()
    let rootEndDate = moment().add(1, 'days')
    if (children.length > 0) {
      rootStartDate = getFirstStartDate(children)
      rootEndDate = getLastEndDate(children)
    }
    Object.assign(rootElement, {
      children,
      startDate: rootStartDate,
      endDate: rootEndDate,
      man_days: manDays
    })
    scheduleItems.value = [rootElement]
  }

  const onTaskSelected = task => {
    store.dispatch('clearSelectedTasks')
    if (!currentTask.value || currentTask.value.id !== task.id) {
      store.dispatch('addSelectedTask', task)
      currentTask.value = task
    } else {
      currentTask.value = null
    }
  }

  const saveTaskScheduleItem = item => {
    if (item.estimation) {
      item.endDate = addBusinessDays(
        item.startDate,
        Math.ceil(minutesToDays(organisation.value, item.estimation)) - 1,
        item.parentElement.daysOff
      )
    }
    item.man_days = item.estimation || 0

    if (item.startDate && item.endDate) {
      store
        .dispatch('updateTask', {
          taskId: item.id,
          data: {
            estimation: item.estimation,
            start_date: item.startDate.format('YYYY-MM-DD'),
            due_date: item.endDate.format('YYYY-MM-DD')
          }
        })
        .catch(console.error)
    }
  }

  // Re-init when the entity id in the URL changes. Compared with the id of
  // the last init, not with the entity shown: that one is still the previous
  // entity while a load runs, and null after a failed load.
  let initEntityId = route.params[`${type}_id`]
  watch(
    () => route.params,
    () => {
      const entityId = route.params[`${type}_id`]
      if (entityId && entityId !== initEntityId) {
        initEntityId = entityId
        init?.()
      }
      currentSection.value = route.query.section || 'infos'
    }
  )

  // Keep schedule items in sync with the current tasks list (mirrors the
  // mixin's `currentTasks` watcher with `immediate: true`).
  watch(currentTasks, () => initScheduleItems(), { immediate: true })

  // the action panel clears the selection from its own close button
  watch(
    () => store.getters.nbSelectedTasks,
    nbSelectedTasks => {
      if (nbSelectedTasks === 0) currentTask.value = null
    }
  )

  return {
    currentSection,
    currentTask,
    zoomLevel,
    zoomOptions,
    scheduleItems,
    previousEntityPath,
    nextEntityPath,
    currentTasks,
    tasksStartDate,
    tasksEndDate,
    onTaskSelected,
    saveTaskScheduleItem
  }
}
