import moment from 'moment'
import { computed, ref, toRaw, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import { isMissingEntity, logRequestFailure } from '@/lib/errors'
import { getEntityPath } from '@/lib/path'
import { getZoomOptions } from '@/lib/productionSchedule'
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

/*
 * Whether the store holds the list of an entity type ('Asset', 'shot', ...)
 * loaded for the episode of the page, its load over. A detail page may load
 * its entity by id into the list of another episode, and a load replaces the
 * cached list out of sight of Vue: a computed reading this runs again when a
 * load starts and ends. The episodes are listed for the whole production.
 */
export const isListOfPageLoaded = (getters, entityType) => {
  const type = entityType.toLowerCase()
  if (type === 'episode') return true
  const typeName = type[0].toUpperCase() + type.slice(1)
  const scope = getters.isTVShow ? (getters.currentEpisode?.id ?? '') : ''
  return (
    !getters[`is${typeName}sLoading`] &&
    getters[`${type}sLoadingKey`] ===
      `${getters.currentProduction?.id}/${scope}`
  )
}

/**
 * Shared logic of the entity pages (Edit, Asset, Shot, Sequence, Episode).
 * Intentionally narrow: only the parts these pages need.
 *
 * @param {Object} options
 * @param {string} options.type - lowercase entity type (e.g. 'edit').
 * @param {import('vue').Ref<Object|null>} options.currentEntity - the
 *   selected entity ref (e.g. currentEdit). The composable does NOT
 *   derive this from `type` — callers pass it directly.
 * @param {import('vue').ComputedRef<Array>} options.entityList - the
 *   full list of entities (computed from store or page state). Caller
 *   passes a ref/computed.
 * @param {Function} options.readEntity - reads the entity of the URL from
 *   the store, loaded when missing: resolves to the entity, or to null when
 *   the load did not find it, and rejects when the load fails.
 * @param {Function} [options.onEntityRead] - called with the entity a load
 *   of the page shows, and with true as second argument when the list loaded
 *   for the arrows replaces it with its own object.
 * @param {boolean} [options.isMissingReported=true] - false for a page that
 *   leaves an entity its load did not find to the topbar.
 * @param {Function} [options.loadList] - loads the list of the page for the
 *   arrows when the store holds another one; returns a promise.
 */
export const useEntity = ({
  type,
  currentEntity,
  entityList,
  readEntity,
  onEntityRead,
  isMissingReported = true,
  loadList
}) => {
  const route = useRoute()
  const { t } = useI18n()
  const store = useStore()

  // Store getters used by the ported computeds.
  const taskMap = computed(() => store.getters.taskMap)
  const taskTypeMap = computed(() => store.getters.taskTypeMap)
  const getTaskTypePriority = computed(() => store.getters.getTaskTypePriority)
  const currentEpisode = computed(() => store.getters.currentEpisode)
  const currentProduction = computed(() => store.getters.currentProduction)
  const isTVShow = computed(() => store.getters.isTVShow)
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
  const zoomOptions = computed(() => getZoomOptions(t, [1, 2, 3]))

  // Why the entity of the URL is not shown: 'missing' or 'failed'.
  const loadError = ref(null)
  // Loads of the page: only the last one shows its result.
  let initCount = 0
  // A load put off until the production of the URL is set.
  let isInitWaiting = false

  // The store reads the entity, and its list, for the current production. A
  // link to a closed production opens under another one, or none, until the
  // topbar has loaded it; a refused one sends the user home.
  const isRouteProduction = computed(
    () => currentProduction.value?.id === route.params.production_id
  )

  // The title of the page while it shows no entity.
  const loadTitle = computed(() => {
    if (loadError.value === 'missing') return t('not_found.title')
    if (loadError.value === 'failed') return t('main.loading_error')
    return t('main.loading')
  })

  const isListOfPage = computed(() => isListOfPageLoaded(store.getters, type))

  const getEntityIndex = entityId =>
    entityList.value.findIndex(entity => entity.id === entityId)

  const previousEntity = computed(() => {
    if (!currentEntity.value || !isListOfPage.value) return null
    const entityIndex = getEntityIndex(currentEntity.value.id)
    if (entityIndex === -1) return null
    return entityIndex > 0
      ? entityList.value[entityIndex - 1]
      : entityList.value[entityList.value.length - 1]
  })

  const nextEntity = computed(() => {
    if (!currentEntity.value || !isListOfPage.value) return null
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

  const showEntity = (entity, isListRead) => {
    currentEntity.value = entity
    if (entity) {
      onEntityRead?.(entity, isListRead)
    } else if (isMissingReported) {
      loadError.value = 'missing'
    }
  }

  const init = async () => {
    const call = ++initCount
    loadError.value = null
    if (!isRouteProduction.value) {
      // The previous entity would stay shown, and editable, under this URL.
      currentEntity.value = null
      isInitWaiting = true
      return
    }
    isInitWaiting = false
    try {
      const entity = await readEntity()
      // A later load shows its own result.
      if (call !== initCount) return
      currentSection.value = route.query.section || 'infos'
      showEntity(entity, false)
    } catch (err) {
      if (call === initCount) {
        currentEntity.value = null
        loadError.value = isMissingEntity(err) ? 'missing' : 'failed'
      }
      logRequestFailure(err)
    }
  }

  // The list loaded holds its own object for the entity, the one the store
  // updates from then on. Read for the load of the page that asked for the
  // list: a later one, which may wait for another production, reads its own.
  const readListEntity = async call => {
    if (call !== initCount) return
    const entity = await readEntity()
    // A load started meanwhile shows its own result.
    if (call !== initCount) return
    // A list load that kept the object shown, such as one a TV show answers
    // without loading, has nothing new to show.
    if (entity && toRaw(entity) === toRaw(currentEntity.value)) return
    showEntity(entity, true)
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
        init()
      }
      currentSection.value = route.query.section || 'infos'
    }
  )

  watch(isRouteProduction, isCurrent => {
    if (isCurrent && isInitWaiting) init()
  })

  // Opened elsewhere than from its list (news feed, search, a reload), the
  // page shows its entity, then loads the list of its episode for the arrows.
  // Once per entity and episode: a URL naming another episode than the one
  // of its entity would load a list without it again and again, and a TV
  // show sets its episode once the topbar has loaded them, which may answer
  // after the entity. A TV show page without an episode in its URL cannot
  // tell which list it walks. The entity the URL leaves, still shown until
  // the next one is read, loads no list.
  let listLoadKey = null
  watch(
    () => {
      if (!currentEntity.value || isListOfPage.value) return null
      if (currentEntity.value.id !== route.params[`${type}_id`]) return null
      const episodeId = isTVShow.value ? currentEpisode.value?.id : null
      return `${currentEntity.value.id}/${episodeId}`
    },
    key => {
      if (!loadList || !key || key === listLoadKey) return
      if (isTVShow.value && !route.params.episode_id) return
      listLoadKey = key
      const call = initCount
      loadList()
        .then(() => readListEntity(call))
        .catch(logRequestFailure)
    },
    { immediate: true }
  )

  // Only a list without the entity loads once per entity and episode: once
  // the list holds it, as the arrows show, a read by id extending that list
  // later on loads it again.
  watch(previousEntity, entity => {
    if (entity) listLoadKey = null
  })

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
    init,
    loadError,
    loadTitle,
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
