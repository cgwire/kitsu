<template>
  <div class="production-task-types">
    <div>
      <p class="explanation mb1">
        {{ $t('task_types.production_description') }}
      </p>
      <route-section-tabs
        class="section-tabs"
        :active-tab="activeTab"
        :route="$route"
        :tabs="taskTypeTabs"
      />
      <div class="columns">
        <div class="column">
          <template v-if="remainingTaskTypes.length > 0">
            <div
              class="flexrow mt1 mb1 add-task-type"
              v-if="remainingTaskTypesForEntity.length"
            >
              <combobox-task-type
                class="flexrow-item selector"
                :task-type-list="remainingTaskTypesForEntity"
                v-model="taskTypeId"
              />
              <button
                class="button flexrow-item"
                :disabled="loading.scheduleTimeDelete"
                @click="addTaskType"
              >
                {{ $t('main.add') }}
              </button>
            </div>
          </template>

          <p
            v-if="errors.delete || errors.scheduleTimeUpdate"
            class="error mt1 mb1"
          >
            {{ $t('productions.edit_error') }}
          </p>
          <div class="box" v-if="isEmpty(currentProduction.task_types)">
            {{ $t('settings.production.empty_list') }}
          </div>

          <div
            v-else
            :key="index"
            v-for="(taskListObject, index) in taskTypeGroups"
          >
            <table
              class="datatable list"
              v-if="
                taskListObject.list.length > 0 &&
                taskListObject.entity === activeTab
              "
            >
              <thead>
                <tr>
                  <th class="th-grab"></th>
                  <th>{{ $t('task_types.fields.name') }}</th>
                  <th>{{ $t('task_types.fields.short_name') }}</th>
                  <th class="th-bitrate">
                    <span class="th-bitrate-label">
                      {{ $t('productions.fields.hd_bitrate_short') }}
                      <info-question-mark
                        position="left"
                        :text="bitrateHelp.hd"
                      />
                    </span>
                  </th>
                  <th class="th-bitrate">
                    <span class="th-bitrate-label">
                      {{ $t('productions.fields.ld_bitrate_short') }}
                      <info-question-mark
                        position="left"
                        :text="bitrateHelp.ld"
                      />
                    </span>
                  </th>
                  <th></th>
                </tr>
              </thead>
              <!-- A held button must not arm a drag: a reload that shifted
                   the rows before the release made vuedraggable throw. -->
              <draggable
                class="datatable-body"
                filter="button"
                :item-key="item => item.taskType.id"
                :prevent-on-filter="false"
                tag="tbody"
                @choose="onRowHeld"
                @end="updatePriorities(taskListObject.list)"
                @start="onRowDragged"
                @unchoose="onRowReleased"
                v-model="taskListObject.list"
              >
                <template #item="{ element: taskTypeData }">
                  <production-task-type
                    class="task-type"
                    :task-type="taskTypeData.taskType"
                    :schedule-item="taskTypeData.scheduleItem"
                    @bitrates-changed="onBitratesChanged"
                    @remove="removeTaskType"
                  />
                </template>
              </draggable>
            </table>
            <p
              class="empty"
              v-if="
                taskListObject.list.length === 0 &&
                taskListObject.entity === activeTab
              "
            >
              {{ $t('task_types.no_task_types') }}
            </p>
          </div>
        </div>
        <div class="column">
          <setting-importer
            :items="remainingTaskTypesForEntity"
            :loading-import="loading.import"
            @import-from-production="importTaskTypesFromProduction"
            @import-item="addTaskType"
          >
            <template #item-line="{ item }">
              <task-type-name class="pointer" :task-type="item" />
            </template>
          </setting-importer>
        </div>
      </div>
    </div>

    <remove-task-type-modal
      active
      :is-error="taskTypeRemoval.isError"
      :is-loading="taskTypeRemoval.isLoading"
      :nb-tasks="taskTypeRemoval.nbTasks"
      :task-type="taskTypeRemoval.taskType"
      @cancel="cancelTaskTypeRemoval"
      @confirm="confirmTaskTypeRemoval"
      v-if="taskTypeRemoval.taskType"
    />
  </div>
</template>

<script setup>
import moment from 'moment'
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import draggable from 'vuedraggable'
import { useStore } from 'vuex'

import { useDraggableRebuild } from '@/composables/draggableRebuild'
import { logRequestFailure } from '@/lib/errors'
import func from '@/lib/func'
import { sortByName, sortTaskTypes } from '@/lib/sorting'
import { formatFullDate } from '@/lib/time'

import RemoveTaskTypeModal from '@/components/modals/RemoveTaskTypeModal.vue'
import ProductionTaskType from '@/components/pages/production/ProductionTaskType.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import InfoQuestionMark from '@/components/widgets/InfoQuestionMark.vue'
import RouteSectionTabs from '@/components/widgets/RouteSectionTabs.vue'
import SettingImporter from '@/components/widgets/SettingImporter.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'

const { t } = useI18n()
const route = useRoute()
const store = useStore()

// State
// --------------------------------------------------------------------------
const activeTab = ref('assets')
const assetTaskTypes = ref({ list: [] })
const editTaskTypes = ref({ list: [] })
const episodeTaskTypes = ref({ list: [] })
const sequenceTaskTypes = ref({ list: [] })
const shotTaskTypes = ref({ list: [] })
const taskTypeId = ref('')
const loading = reactive({
  import: false,
  scheduleTimeDelete: false
})
// A removed task type keeps its tasks, hidden from the lists and the
// schedule: when some remain, the modal lets the user delete them first.
const taskTypeRemoval = reactive({
  isError: false,
  isLoading: false,
  nbTasks: 0,
  scheduleItem: null,
  taskType: null
})
const errors = reactive({
  scheduleTimeUpdate: false,
  delete: false
})

// Computed
// --------------------------------------------------------------------------
const currentProduction = computed(() => store.getters.currentProduction)
const currentScheduleItems = computed(() => store.getters.currentScheduleItems)
const getProductionTaskTypes = computed(
  () => store.getters.getProductionTaskTypes
)
const productionAssetTaskTypes = computed(
  () => store.getters.productionAssetTaskTypes
)
const productionShotTaskTypes = computed(
  () => store.getters.productionShotTaskTypes
)
const productionEditTaskTypes = computed(
  () => store.getters.productionEditTaskTypes
)
const productionSequenceTaskTypes = computed(
  () => store.getters.productionSequenceTaskTypes
)
const productionEpisodeTaskTypes = computed(
  () => store.getters.productionEpisodeTaskTypes
)
const taskTypeMap = computed(() => store.getters.taskTypeMap)
const taskTypes = computed(() => store.getters.taskTypes)
const isTVShow = computed(() => store.getters.isTVShow)
const bitrateDefaults = computed(() => store.getters.movieBitrateDefaults)

const groupByType = {
  Asset: { ref: assetTaskTypes, getter: productionAssetTaskTypes },
  Shot: { ref: shotTaskTypes, getter: productionShotTaskTypes },
  Sequence: { ref: sequenceTaskTypes, getter: productionSequenceTaskTypes },
  Episode: { ref: episodeTaskTypes, getter: productionEpisodeTaskTypes },
  Edit: { ref: editTaskTypes, getter: productionEditTaskTypes }
}

// The low definition bitrate of a row stays within its high definition one.
const bitrateHelp = computed(() => {
  const help = maximum =>
    [
      t('productions.video.task_type_bitrates'),
      maximum,
      t('productions.video.next_uploads_only')
    ].join('\n\n')
  return {
    hd: help(
      t('productions.video.bitrate_max', {
        value: bitrateDefaults.value.hd_bitrate_compression
      })
    ),
    ld: help(t('productions.video.task_type_ld_bitrate_max'))
  }
})

const remainingTaskTypes = computed(() =>
  sortByName(
    taskTypes.value.filter(
      tt => !currentProduction.value.task_types.includes(tt.id)
    )
  )
)

const remainingTaskTypesForEntity = computed(() =>
  sortByName(
    remainingTaskTypes.value.filter(
      tt => `${tt.for_entity.toLowerCase()}s` === activeTab.value
    )
  )
)

const isAssetsOnly = computed(
  () => currentProduction.value.production_type === 'assets'
)

const isShotsOnly = computed(
  () => currentProduction.value.production_type === 'shots'
)

const visibleEntities = computed(() =>
  [
    !isShotsOnly.value && 'assets',
    !isAssetsOnly.value && 'shots',
    !isAssetsOnly.value && 'sequences',
    isTVShow.value && 'episodes',
    !isAssetsOnly.value && 'edits'
  ].filter(Boolean)
)

const taskTypeGroups = computed(() =>
  Object.values(groupByType)
    .map(({ ref: stateRef }) => stateRef.value)
    .filter(group => visibleEntities.value.includes(group.entity))
)

const taskTypeTabs = computed(() =>
  visibleEntities.value.map(entity => ({
    label: t(`${entity}.title`),
    name: entity
  }))
)

// Functions
// --------------------------------------------------------------------------
const isEmpty = list => !list || list.length === 0

// The loaded items also hold the entity bars of each task type: keep the
// task type bar, the one attached to no entity.
const getScheduleItemForTaskType = taskType =>
  currentScheduleItems.value.find(
    scheduleItem =>
      scheduleItem.task_type_id === taskType.id && !scheduleItem.object_id
  ) || {
    start_date: formatFullDate(moment()),
    end_date: formatFullDate(moment())
  }

const buildDisplayedTaskTypes = () => {
  Object.entries(groupByType).forEach(([type, { ref: stateRef, getter }]) => {
    stateRef.value = {
      entity: `${type.toLowerCase()}s`,
      list: sortTaskTypes([...getter.value], currentProduction.value).map(
        taskType => ({
          taskType,
          scheduleItem: getScheduleItemForTaskType(taskType)
        })
      )
    }
  })
}

const {
  rebuild: resetDisplayedTaskTypes,
  onRowHeld,
  onRowDragged,
  onRowReleased
} = useDraggableRebuild(buildDisplayedTaskTypes)

const updateTaskTypeIdFromRemaining = () => {
  taskTypeId.value = remainingTaskTypesForEntity.value[0]?.id || null
}

const addTaskType = async taskType => {
  const id = taskType?.id || taskTypeId.value
  const taskTypeToAdd = taskTypeMap.value.get(id)
  if (!taskTypeToAdd) return
  const entityType = taskTypeToAdd.for_entity
  await store.dispatch('addTaskTypeToProduction', {
    taskTypeId: id,
    priority: groupByType[entityType].ref.value.list.length + 1
  })
  try {
    await store.dispatch('createScheduleItem', {
      startDate: moment(),
      endDate: moment(),
      project_id: currentProduction.value.id,
      task_type_id: id
    })
  } catch (err) {
    console.error(err)
  }
  updateTaskTypeIdFromRemaining()
  resetDisplayedTaskTypes()
}

const applyTaskTypeRemoval = async ({ taskType, scheduleItem }) => {
  errors.delete = false
  try {
    await store.dispatch('removeTaskTypeFromProduction', taskType.id)
    // A task type without a bar of its own gets a placeholder with no id.
    if (scheduleItem?.id) {
      loading.scheduleTimeDelete = true
      await store.dispatch('deleteScheduleItem', scheduleItem)
      loading.scheduleTimeDelete = false
    }
  } catch {
    errors.delete = true
    loading.scheduleTimeDelete = false
    return
  }
  await nextTick()
  updateTaskTypeIdFromRemaining()
  resetDisplayedTaskTypes()
}

const removeTaskType = async ({ taskType, scheduleItem }) => {
  errors.delete = false
  let nbTasks
  try {
    nbTasks = await store.dispatch('countTasks', {
      project_id: currentProduction.value.id,
      task_type_id: taskType.id
    })
  } catch (err) {
    console.error(err)
    errors.delete = true
    return
  }
  if (nbTasks > 0) {
    Object.assign(taskTypeRemoval, {
      isError: false,
      nbTasks,
      scheduleItem,
      taskType
    })
  } else {
    await applyTaskTypeRemoval({ taskType, scheduleItem })
  }
}

const confirmTaskTypeRemoval = async isDeletingTasks => {
  const { scheduleItem, taskType } = taskTypeRemoval
  taskTypeRemoval.isError = false
  taskTypeRemoval.isLoading = true
  try {
    if (isDeletingTasks) {
      await store.dispatch('deleteAllTasks', {
        projectId: currentProduction.value.id,
        taskTypeId: taskType.id
      })
    }
  } catch (err) {
    console.error(err)
    taskTypeRemoval.isError = true
    return
  } finally {
    taskTypeRemoval.isLoading = false
  }
  taskTypeRemoval.taskType = null
  await applyTaskTypeRemoval({ taskType, scheduleItem })
}

// A deletion of the tasks cannot be stopped once sent: the modal stays open
// until it ends.
const cancelTaskTypeRemoval = () => {
  if (!taskTypeRemoval.isLoading) taskTypeRemoval.taskType = null
}

const onBitratesChanged = async ({ taskType, ...bitrates }) => {
  errors.scheduleTimeUpdate = false
  try {
    await store.dispatch('addTaskTypeToProduction', {
      taskTypeId: taskType.id,
      ...bitrates
    })
  } catch (err) {
    console.error(err)
    errors.scheduleTimeUpdate = true
  }
}

// The saves of a list never cross on the server, and each drop reloads the
// context once every order of its list is saved. A list holds the task types
// of an entity in a production.
const priorityQueues = new Map()

const savePriorities = order => {
  const listKey = `${order.projectId}-${activeTab.value}`
  if (!priorityQueues.has(listKey)) {
    priorityQueues.set(
      listKey,
      func.queueLatest(value => store.dispatch('reorderTaskTypeLinks', value))
    )
  }
  return priorityQueues.get(listKey)(order)
}

const updatePriorities = async items => {
  try {
    // An order can wait for a save past a switch to another production.
    await savePriorities({
      projectId: currentProduction.value.id,
      taskTypeIds: items.map(item => item.taskType.id)
    })
    setTimeout(() => {
      store.commit('SORT_VALIDATION_COLUMNS', taskTypeMap.value)
    }, 100)
    await store.dispatch('loadContext')
  } catch (err) {
    // After a drop, the lists wait for a reload, which a failure needs too:
    // Zou may hold an order saved after the failed one.
    await store.dispatch('loadContext').catch(logRequestFailure)
    resetDisplayedTaskTypes()
    throw err
  }
}

const importTaskTypesFromProduction = async productionId => {
  loading.import = true
  errors.delete = false
  const imported = getProductionTaskTypes
    .value(productionId)
    .filter(tt => `${tt.for_entity.toLowerCase()}s` === activeTab.value)
  // The imported list replaces the task types of the active tab only: the
  // other tabs' task types are sent along so the replace keeps them.
  const kept = currentProduction.value.task_types.filter(id => {
    const taskType = taskTypeMap.value.get(id)
    return (
      taskType && `${taskType.for_entity.toLowerCase()}s` !== activeTab.value
    )
  })
  try {
    await store.dispatch('addSettingsToProduction', {
      taskTypes: kept
        .map(id => ({ taskTypeId: id }))
        .concat(
          imported.map((taskType, index) => ({
            taskTypeId: taskType.id,
            priority: index + 1
          }))
        ),
      replaceTaskTypes: true
    })
    // The task-types schedule items route creates missing items and drops
    // stale ones server-side: one reload replaces per-task-type calls.
    await store.dispatch('loadScheduleItems', currentProduction.value)
  } catch (err) {
    console.error(err)
    errors.delete = true
  }
  updateTaskTypeIdFromRemaining()
  resetDisplayedTaskTypes()
  loading.import = false
}

// Watchers
// --------------------------------------------------------------------------
watch(
  currentProduction,
  () => {
    store.dispatch('loadAllScheduleItems', currentProduction.value)
    resetDisplayedTaskTypes()
  },
  { deep: true }
)

watch(
  () => route.query.section,
  section => {
    if (!visibleEntities.value.includes(section)) return
    activeTab.value = section
    nextTick(() => {
      updateTaskTypeIdFromRemaining()
    })
  }
)

// Lifecycle
// --------------------------------------------------------------------------
onMounted(() => {
  updateTaskTypeIdFromRemaining()

  activeTab.value = visibleEntities.value.includes(route.query.section)
    ? route.query.section
    : visibleEntities.value[0]

  resetDisplayedTaskTypes()
  if (currentProduction.value) {
    store.dispatch('loadAllScheduleItems', currentProduction.value).then(() => {
      resetDisplayedTaskTypes()
    })
  }
})
</script>

<style lang="scss" scoped>
.column {
  flex-basis: 400px;
  flex-grow: 0;
  overflow-y: initial;

  // The importer keeps its width: shrunk by the wide list, it got narrow
  // as soon as the import from production field was hidden
  &:last-child {
    flex: 0 0 360px;
    padding: 1em;
  }
}

.datatable th {
  color: var(--text);
  padding-bottom: 5px;
  padding-left: 10px;
  padding-top: 1em;
}

.th-grab {
  width: 30px;
}

.th-bitrate {
  min-width: 120px;
  white-space: nowrap;
  // A sticky header cell is its own stacking context: without a z-index, the
  // inputs of the rows (positioned, later in the page) cover its tooltip.
  z-index: 2;

  // The tooltip opens over the next columns: narrow, it stays within the tab
  // on a tablet.
  :deep(.question-text) {
    max-width: 320px;
  }
}

.th-bitrate-label {
  align-items: center;
  display: flex;
  gap: 0.3em;
}

table {
  margin-bottom: 1.5em;
}

.field {
  margin-bottom: 0;
}

.empty {
  color: var(--text);
  font-style: italic;
}

.task-type {
  cursor: grab;
}

.task-type[draggable='true'] {
  cursor: grabbing;
}

.pointer {
  cursor: pointer;
}
</style>
