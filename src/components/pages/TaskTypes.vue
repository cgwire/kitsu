<template>
  <div class="task-types page fixed-page">
    <list-page-header
      :title="$t('task_types.library_title')"
      :new-entry-label="$t('task_types.new_task_type')"
      :is-exportable="isActiveTab"
      @export-clicked="onExportClicked"
      @new-clicked="onNewClicked"
    />

    <route-tabs class="mt2" :active-tab="activeTab" :tabs="tabs" />

    <route-tabs :active-tab="entityTab" :tabs="entityTabs" route-key="entity" />

    <task-type-list
      :entries="listTaskTypes"
      :is-loading="loading.taskTypes || loading.departments"
      :is-error="errors.taskTypes || errors.departments"
      @update-priorities="updatePriorities"
      @edit-clicked="onEditClicked"
      @delete-clicked="onDeleteClicked"
    />

    <edit-task-type-modal
      :active="modals.edit"
      :for-entity="forEntity"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :task-type-to-edit="taskTypeToEdit"
      @cancel="modals.edit = false"
      @confirm="confirmEditTaskType"
    />

    <delete-modal
      :active="modals.del"
      :is-loading="loading.del"
      :is-error="errors.del"
      :text="deleteText"
      :error-text="$t('task_types.delete_error')"
      @cancel="modals.del = false"
      @confirm="confirmDeleteTaskType"
    />
  </div>
</template>

<script setup>
import { useHead } from '@unhead/vue'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import csv from '@/lib/csv'
import func from '@/lib/func'
import stringHelpers from '@/lib/string'

// eslint-disable-next-line no-unused-vars
import TaskTypeList from '@/components/lists/TaskTypeList.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditTaskTypeModal from '@/components/modals/EditTaskTypeModal.vue'
import ListPageHeader from '@/components/widgets/ListPageHeader.vue'
import RouteTabs from '@/components/widgets/RouteTabs.vue'

const { t } = useI18n()
const route = useRoute()
const store = useStore()

// State

const activeTab = ref('active')
const entityTab = ref('assets')
const taskTypeToDelete = ref({ color: '#999999' })
const taskTypeToEdit = ref(null)

const errors = reactive({
  taskTypes: false,
  departments: false,
  edit: false,
  del: false
})
const loading = reactive({
  taskTypes: false,
  departments: false,
  edit: false,
  del: false
})
const modals = reactive({ del: false, edit: false })

// Non-reactive scheduling state for savePriorities throttling.
let isSaving = false
let lastCall = 0
let newSaveCall = false

// Computed

const archivedTaskTypes = computed(() => store.getters.archivedTaskTypes)
const departmentMap = computed(() => store.getters.departmentMap)
const taskTypes = computed(() => store.getters.taskTypes)

const isActiveTab = computed(() => activeTab.value === 'active')

const forEntity = computed(() =>
  stringHelpers.capitalize(entityTab.value.slice(0, -1))
)

const listTaskTypes = computed(() => {
  const source = isActiveTab.value ? taskTypes.value : archivedTaskTypes.value
  const entity = entityTab.value.slice(0, -1)
  return source.filter(taskType => taskType.for_entity.toLowerCase() === entity)
})

const tabs = computed(() => [
  { name: 'active', label: t('main.active') },
  { name: 'archived', label: t('main.archived') }
])

const entityTabs = computed(() => [
  { name: 'assets', label: t('assets.title') },
  { name: 'shots', label: t('shots.title') },
  { name: 'sequences', label: t('sequences.title') },
  { name: 'episodes', label: t('episodes.title') },
  { name: 'edits', label: t('edits.title') }
])

const deleteText = computed(() =>
  taskTypeToDelete.value
    ? t('task_types.delete_text', { name: taskTypeToDelete.value.name })
    : ''
)

// Functions

const confirmEditTaskType = async form => {
  loading.edit = true
  errors.edit = false
  try {
    if (taskTypeToEdit.value?.id) {
      await store.dispatch('editTaskType', {
        ...form,
        id: taskTypeToEdit.value.id
      })
    } else {
      await store.dispatch('newTaskType', form)
    }
    modals.edit = false
  } catch (err) {
    console.error(err)
    errors.edit = true
  }
  loading.edit = false
}

const confirmDeleteTaskType = async () => {
  loading.del = true
  errors.del = false
  try {
    await store.dispatch('deleteTaskType', taskTypeToDelete.value)
    modals.del = false
  } catch (err) {
    console.error(err)
    errors.del = true
  }
  loading.del = false
}

const savePriorities = forms => {
  const now = Date.now()
  if (now - lastCall > 1000 && !isSaving) {
    lastCall = now
    isSaving = true
    func
      .runPromiseMapAsSeries(forms, form =>
        store.dispatch('editTaskType', form)
      )
      .then(() => {
        isSaving = false
        if (newSaveCall) {
          newSaveCall = false
          savePriorities(forms)
        }
      })
  } else {
    newSaveCall = true
  }
}

const updatePriorities = forms => {
  forms.forEach(form => store.commit('EDIT_TASK_TYPE_END', form))
  savePriorities(forms)
}

const onExportClicked = () => {
  const name = stringHelpers.slugify(t('task_types.title'))
  const headers = [
    t('main.type'),
    t('task_types.fields.dedicated_to'),
    t('task_types.fields.department'),
    t('task_types.fields.name'),
    t('task_types.fields.description'),
    t('task_types.fields.color'),
    t('task_types.fields.allow_timelog')
  ]
  const rows = taskTypes.value.map(taskType => [
    taskType.type,
    taskType.for_entity,
    departmentMap.value.get(taskType.department_id)?.name,
    taskType.name,
    taskType.description,
    taskType.color,
    taskType.allow_timelog
  ])
  csv.buildCsvFile(name, [headers, ...rows])
}

const onNewClicked = () => {
  taskTypeToEdit.value = { color: '#999999' }
  modals.edit = true
}

const onEditClicked = taskType => {
  taskTypeToEdit.value = taskType
  modals.edit = true
}

const onDeleteClicked = taskType => {
  taskTypeToDelete.value = taskType
  modals.del = true
}

// Watchers

watch(
  () => route.query,
  () => {
    activeTab.value = route.query.tab || 'active'
    entityTab.value = route.query.entity || 'assets'
  }
)

// Lifecycle

onMounted(async () => {
  activeTab.value = route.query.tab || 'active'
  entityTab.value = route.query.entity || 'assets'

  loading.departments = true
  errors.departments = false
  try {
    await store.dispatch('loadDepartments')
  } catch (err) {
    console.error(err)
    errors.departments = true
  }
  loading.departments = false

  loading.taskTypes = true
  errors.taskTypes = false
  try {
    await store.dispatch('loadTaskTypes')
  } catch (err) {
    console.error(err)
    errors.taskTypes = true
  }
  loading.taskTypes = false
})

// Head

useHead({ title: computed(() => `${t('task_types.title')} - Kitsu`) })
</script>
