<template>
  <div>
    <div>
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
              <draggable
                class="datatable-body"
                item-key="taskType.id"
                tag="tbody"
                @end="updatePriorities(taskListObject.list)"
                v-model="taskListObject.list"
              >
                <template #item="{ element: taskTypeData }">
                  <production-task-type
                    class="task-type"
                    :task-type="taskTypeData.taskType"
                    :schedule-item="taskTypeData.scheduleItem"
                    @date-changed="onDateChanged"
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
  </div>
</template>
<script setup>
import draggable from 'vuedraggable'
import moment from 'moment'
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import func from '@/lib/func'
import { sortByName, sortTaskTypes } from '@/lib/sorting'
import { formatFullDate } from '@/lib/time'
import stringHelper from '@/lib/string'

import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import ProductionTaskType from '@/components/pages/production/ProductionTaskType.vue'
import RouteSectionTabs from '@/components/widgets/RouteSectionTabs.vue'
import SettingImporter from '@/components/widgets/SettingImporter.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'

const { t } = useI18n()
const route = useRoute()
const store = useStore()

const activeTab = ref('assets')
const assetTaskTypes = ref({ list: [] })
const editTaskTypes = ref({ list: [] })
const episodeTaskTypes = ref({ list: [] })
const sequenceTaskTypes = ref({ list: [] })
const shotTaskTypes = ref({ list: [] })
const episode_span = ref(0)
const taskTypeId = ref('')
const loading = reactive({
  import: false,
  episode_span: false,
  scheduleTimeUpdate: false,
  scheduleTimeDelete: false
})
const errors = reactive({
  episode_span: false,
  scheduleTimeUpdate: false,
  delete: false
})

let lastCall = 0
let isSaving = false
let newSaveCall = false

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

const groupByType = {
  Asset: { ref: assetTaskTypes, getter: productionAssetTaskTypes },
  Shot: { ref: shotTaskTypes, getter: productionShotTaskTypes },
  Sequence: { ref: sequenceTaskTypes, getter: productionSequenceTaskTypes },
  Episode: { ref: episodeTaskTypes, getter: productionEpisodeTaskTypes },
  Edit: { ref: editTaskTypes, getter: productionEditTaskTypes }
}

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

const taskTypeGroups = computed(() => {
  let groups = []
  if (!isShotsOnly.value) {
    groups.push(assetTaskTypes.value)
  }
  if (!isAssetsOnly.value) {
    groups = groups.concat([
      shotTaskTypes.value,
      editTaskTypes.value,
      sequenceTaskTypes.value,
      episodeTaskTypes.value
    ])
  }
  return groups
})

const taskTypeTabs = computed(() => [
  { label: t('assets.title'), name: 'assets' },
  { label: t('shots.title'), name: 'shots' },
  { label: t('sequences.title'), name: 'sequences' },
  { label: t('episodes.title'), name: 'episodes' },
  { label: t('edits.title'), name: 'edits' }
])

const isEmpty = list => !list || list.length === 0

const getScheduleItemForTaskType = taskType =>
  currentScheduleItems.value.find(
    scheduleItem => scheduleItem.task_type_id === taskType.id
  ) || {
    start_date: formatFullDate(moment()),
    end_date: formatFullDate(moment())
  }

const resetDisplayedTaskTypes = () => {
  Object.entries(groupByType).forEach(([type, { ref: stateRef, getter }]) => {
    let list = sortTaskTypes([...getter.value], currentProduction.value)
    list = list.map(taskType => ({
      taskType,
      scheduleItem: getScheduleItemForTaskType(taskType)
    }))
    stateRef.value = {
      entity: `${type.toLowerCase()}s`,
      title: t(`${type.toLowerCase()}s.title`),
      list
    }
  })
}

const updateTaskTypeIdFromRemaining = () => {
  taskTypeId.value = remainingTaskTypesForEntity.value[0]?.id || null
}

const addTaskType = async taskType => {
  const id = taskType && taskType.id ? taskType.id : taskTypeId.value
  await store.dispatch('addTaskTypeToProduction', {
    taskTypeId: id,
    priority: assetTaskTypes.value.length
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

const removeTaskType = async ({ taskType, scheduleItem }) => {
  errors.delete = false
  try {
    await store.dispatch('removeTaskTypeFromProduction', taskType.id)
    if (scheduleItem !== null) {
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

const onDateChanged = async scheduleItem => {
  errors.scheduleTimeUpdate = false
  try {
    await store.dispatch('saveScheduleItem', scheduleItem)
  } catch (err) {
    console.error(err)
    errors.scheduleTimeUpdate = true
  }
}

const savePriorities = async forms => {
  const now = new Date().getTime()
  if (now - lastCall > 1000 && !isSaving) {
    lastCall = now
    isSaving = true
    await func.runPromiseAsSeries(
      forms.map(async form => store.dispatch('editTaskTypeLink', form))
    )
    isSaving = false
    if (newSaveCall) {
      await savePriorities(forms)
    }
    setTimeout(() => {
      store.commit('SORT_VALIDATION_COLUMNS', taskTypeMap.value)
    }, 100)
  } else {
    newSaveCall = true
  }
}

const updatePriorities = async items => {
  const forms = items.map((item, index) => ({
    projectId: currentProduction.value.id,
    taskTypeId: item.taskType.id,
    priority: index + 1
  }))
  await savePriorities(forms)
  await store.dispatch('loadContext')
}

const importTaskTypesFromProduction = async productionId => {
  loading.import = true
  const imported = getProductionTaskTypes
    .value(productionId)
    .filter(tt => `${tt.for_entity.toLowerCase()}s` === activeTab.value)
  const entityName = stringHelper.capitalize(activeTab.value).slice(0, -1)
  const group = groupByType[entityName]?.ref.value?.list || []
  for (const item of group) {
    await removeTaskType({
      taskType: item.taskType,
      scheduleItem: imported[0] ? getScheduleItemForTaskType(imported[0]) : null
    })
  }
  setTimeout(async () => {
    for (const taskType of imported) {
      await addTaskType(taskType)
    }
    loading.import = false
  }, 500)
}

onMounted(() => {
  updateTaskTypeIdFromRemaining()

  if (route.query.section) {
    activeTab.value = route.query.section
  } else {
    activeTab.value = isShotsOnly.value ? 'shots' : 'assets'
  }

  resetDisplayedTaskTypes()
  if (currentProduction.value) {
    episode_span.value = currentProduction.value.episode_span
    store.dispatch('loadAllScheduleItems', currentProduction.value).then(() => {
      resetDisplayedTaskTypes()
    })
  }
})

watch(
  currentProduction,
  () => {
    episode_span.value = currentProduction.value.episode_span
    store.dispatch('loadAllScheduleItems', currentProduction.value)
    resetDisplayedTaskTypes()
  },
  { deep: true }
)

watch(
  () => route.query.section,
  section => {
    if (!section) return
    activeTab.value = section
    nextTick(() => {
      updateTaskTypeIdFromRemaining()
    })
  }
)
</script>

<style lang="scss" scoped>
.column {
  overflow-y: initial;
}

.datatable th {
  color: var(--text);
}

table {
  margin-bottom: 1.5em;
}

th {
  padding-left: 10px;
  padding-bottom: 5px;
}

td p {
  color: var(--text);
}

.column {
  flex-basis: 400px;
  flex-grow: 0;
}

td.name {
  flex: 1;
}

.start-date {
  width: 135px;
}

.end-date {
  width: 135px;
}

.remove {
  width: 100px;
}

.episode-span-column {
  margin-left: 5rem;
}

.field {
  margin-bottom: 0;
}

.section-title {
  color: $grey;
  font-size: 1.2em;
  margin-bottom: 1em;
  margin-top: 2em;
  text-transform: uppercase;
}

h2 {
  border: 0;
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

.column:last-child {
  padding: 1em;
}

.pointer {
  cursor: pointer;
}

.grab {
  cursor: grab;
}
</style>
