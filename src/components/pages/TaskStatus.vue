<template>
  <div class="task-status page fixed-page">
    <list-page-header
      :title="$t('task_status.library_title')"
      :new-entry-label="$t('task_status.new_task_status')"
      :is-exportable="isActiveTab"
      @export-clicked="onExportClicked"
      @new-clicked="onNewClicked"
    />

    <route-tabs class="mt2" :active-tab="activeTab" :tabs="tabs" />

    <route-tabs :active-tab="entityTab" :tabs="entityTabs" route-key="entity" />

    <div class="column">
      <task-status-list
        :entries="taskStatusList"
        :is-loading="loading.list"
        :is-error="errors.list"
        @edit-clicked="onEditClicked"
        @delete-clicked="onDeleteClicked"
        @update-priorities="updatePriorities"
        v-if="entityTab === 'entities'"
      />
      <task-status-list
        :entries="conceptStatusList"
        :is-loading="loading.list"
        :is-error="errors.list"
        @edit-clicked="onEditClicked"
        @delete-clicked="onDeleteClicked"
        @update-priorities="updatePriorities"
        v-if="entityTab === 'concepts'"
      />
    </div>

    <edit-task-status-modal
      :active="modals.edit"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :task-status-to-edit="taskStatusToEdit"
      @cancel="modals.edit = false"
      @confirm="confirmEditTaskStatus"
    />

    <delete-modal
      :active="modals.del"
      :is-loading="loading.del"
      :is-error="errors.del"
      :text="deleteText"
      :error-text="$t('task_status.delete_error')"
      @cancel="modals.del = false"
      @confirm="confirmDeleteTaskStatus"
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
import stringHelpers from '@/lib/string'

// eslint-disable-next-line no-unused-vars
import TaskStatusList from '@/components/lists/TaskStatusList.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditTaskStatusModal from '@/components/modals/EditTaskStatusModal.vue'
import ListPageHeader from '@/components/widgets/ListPageHeader.vue'
import RouteTabs from '@/components/widgets/RouteTabs.vue'

const { t } = useI18n()
const route = useRoute()
const store = useStore()

// State

const activeTab = ref('active')
const entityTab = ref('entities')
const taskStatusToDelete = ref(null)
const taskStatusToEdit = ref({ color: '#000000' })

const errors = reactive({ del: false, edit: false, list: false })
const loading = reactive({ del: false, edit: false, list: false })
const modals = reactive({ del: false, edit: false })

// Computed

const archivedTaskStatus = computed(() => store.getters.archivedTaskStatus)
const taskStatus = computed(() => store.getters.taskStatus)

const isActiveTab = computed(() => activeTab.value === 'active')

const activeTaskStatuses = computed(() =>
  isActiveTab.value ? taskStatus.value : archivedTaskStatus.value
)

const taskStatusList = computed(() =>
  activeTaskStatuses.value
    .filter(status => !status.for_concept)
    .sort((a, b) => a.priority - b.priority)
)

const conceptStatusList = computed(() =>
  activeTaskStatuses.value
    .filter(status => status.for_concept)
    .sort((a, b) => a.priority - b.priority)
)

const tabs = computed(() => [
  { name: 'active', label: t('main.active') },
  { name: 'archived', label: t('main.archived') }
])

const entityTabs = computed(() => [
  { name: 'entities', label: t('entities.title') },
  { name: 'concepts', label: t('concepts.title') }
])

const deleteText = computed(() =>
  taskStatusToDelete.value
    ? t('task_status.delete_text', { name: taskStatusToDelete.value.name })
    : ''
)

// Functions

const updatePriorities = async taskStatuses => {
  for (const status of taskStatuses) {
    await store.dispatch('updateTaskStatusPriority', status)
  }
}

const confirmEditTaskStatus = async form => {
  loading.edit = true
  errors.edit = false
  try {
    if (taskStatusToEdit.value?.id) {
      await store.dispatch('saveTaskStatus', {
        ...form,
        id: taskStatusToEdit.value.id
      })
    } else {
      await store.dispatch('newTaskStatus', form)
    }
    modals.edit = false
  } catch (err) {
    console.error(err)
    errors.edit = true
  }
  loading.edit = false
}

const confirmDeleteTaskStatus = async () => {
  loading.del = true
  errors.del = false
  try {
    await store.dispatch('deleteTaskStatus', taskStatusToDelete.value)
    modals.del = false
  } catch (err) {
    console.error(err)
    errors.del = true
  }
  loading.del = false
}

const onExportClicked = () => {
  const name = stringHelpers.slugify(t('task_status.title'))
  const headers = [
    t('main.type'),
    t('task_status.fields.name'),
    t('task_status.fields.short_name'),
    t('task_status.fields.description'),
    t('task_status.fields.color'),
    t('task_status.fields.is_default'),
    t('task_status.fields.is_wip'),
    t('task_status.fields.is_done'),
    t('task_status.fields.is_retake'),
    t('task_status.fields.is_artist_allowed'),
    t('task_status.fields.is_client_allowed'),
    t('task_status.fields.is_feedback_request')
  ]
  const rows = taskStatus.value.map(status => [
    status.type,
    status.name,
    status.short_name,
    status.description,
    status.color,
    status.is_default,
    status.is_wip,
    status.is_done,
    status.is_retake,
    status.is_artist_allowed,
    status.is_client_allowed,
    status.is_feedback_request
  ])
  csv.buildCsvFile(name, [headers, ...rows])
}

const onNewClicked = () => {
  taskStatusToEdit.value = { color: '#000000' }
  modals.edit = true
}

const onEditClicked = status => {
  taskStatusToEdit.value = status
  modals.edit = true
}

const onDeleteClicked = status => {
  taskStatusToDelete.value = status
  modals.del = true
}

// Watchers

watch(
  () => route.query,
  () => {
    activeTab.value = route.query.tab || 'active'
    entityTab.value = route.query.entity || 'entities'
  }
)

// Lifecycle

onMounted(() => {
  activeTab.value = route.query.tab || 'active'
  entityTab.value = route.query.entity || 'entities'
})

// Head

useHead({ title: computed(() => `${t('task_status.title')} - Kitsu`) })
</script>

<style lang="scss" scoped>
.help-tooltip {
  margin-left: 0.25rem;
  opacity: 0.5;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }

  .icon.is-small {
    vertical-align: baseline;
  }
}

@media screen and (max-width: 768px) {
  .task-status {
    padding-left: 0.5em;
    padding-right: 0.5em;
  }
}
</style>
