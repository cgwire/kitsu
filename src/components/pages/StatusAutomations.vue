<template>
  <div class="status-automations page fixed-page">
    <list-page-header
      :title="$t('status_automations.title')"
      :new-entry-label="$t('status_automations.new_status_automation')"
      :is-exportable="isActiveTab"
      @export-clicked="onExportClicked"
      @new-clicked="onNewClicked"
    />

    <route-tabs class="mt2" :active-tab="activeTab" :tabs="tabs" />

    <status-automation-list
      class="status-automation-list"
      :entries="statusAutomationsList"
      :is-editable="true"
      :is-loading="loading.list"
      :is-error="errors.list"
      @edit-clicked="onEditClicked"
      @delete-clicked="onDeleteClicked"
    />

    <edit-status-automation-modal
      :active="modals.edit"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :status-automation-to-edit="statusAutomationToEdit"
      @cancel="modals.edit = false"
      @confirm="confirmEditStatusAutomation"
    />

    <delete-modal
      :active="modals.del"
      :is-loading="loading.del"
      :is-error="errors.del"
      :text="deleteText"
      :error-text="$t('status_automations.delete_error')"
      @cancel="modals.del = false"
      @confirm="confirmDeleteStatusAutomation"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHead } from '@unhead/vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import csv from '@/lib/csv'
import stringHelpers from '@/lib/string'

import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditStatusAutomationModal from '@/components/modals/EditStatusAutomationModal.vue'
import ListPageHeader from '@/components/widgets/ListPageHeader.vue'
import RouteTabs from '@/components/widgets/RouteTabs.vue'
import StatusAutomationList from '@/components/lists/StatusAutomationList.vue'

const { t } = useI18n()
const route = useRoute()
const store = useStore()

// State

const activeTab = ref(route.query.tab || 'active')
const statusAutomationToDelete = ref(null)
const statusAutomationToEdit = ref(null)
const modals = reactive({ edit: false, del: false })
const loading = reactive({ edit: false, del: false, list: false })
const errors = reactive({ edit: false, del: false, list: false })

// Computed

const statusAutomations = computed(() => store.getters.statusAutomations)
const archivedStatusAutomations = computed(
  () => store.getters.archivedStatusAutomations
)
const taskStatusMap = computed(() => store.getters.taskStatusMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

const tabs = computed(() => [
  { name: 'active', label: t('main.active') },
  { name: 'archived', label: t('main.archived') }
])

const isActiveTab = computed(() => activeTab.value === 'active')

const statusAutomationsList = computed(() =>
  isActiveTab.value ? statusAutomations.value : archivedStatusAutomations.value
)

const deleteText = computed(() => {
  const sa = statusAutomationToDelete.value
  return sa ? t('custom_actions.delete_text', { name: sa.name }) : ''
})

// Functions

const confirmEditStatusAutomation = form => {
  const isEdit = !!statusAutomationToEdit.value?.id
  if (isEdit) form.id = statusAutomationToEdit.value.id

  loading.edit = true
  errors.edit = false
  store
    .dispatch(isEdit ? 'editStatusAutomation' : 'newStatusAutomation', form)
    .then(() => {
      modals.edit = false
    })
    .catch(err => {
      console.error(err)
      errors.edit = true
    })
    .finally(() => {
      loading.edit = false
    })
}

const confirmDeleteStatusAutomation = () => {
  loading.del = true
  errors.del = false
  store
    .dispatch('deleteStatusAutomation', statusAutomationToDelete.value)
    .then(() => {
      modals.del = false
    })
    .catch(err => {
      console.error(err)
      errors.del = true
    })
    .finally(() => {
      loading.del = false
    })
}

const onExportClicked = () => {
  const name = stringHelpers.slugify(t('status_automations.title'))
  const headers = [
    t('main.type'),
    t('status_automations.fields.entity_type'),
    t('status_automations.fields.in_task_type'),
    t('status_automations.fields.in_task_status'),
    t('status_automations.fields.out_field_type'),
    t('status_automations.fields.out_task_type'),
    t('status_automations.fields.out_task_status'),
    t('status_automations.fields.import_last_revision')
  ]
  const entries = [
    headers,
    ...statusAutomations.value.map(sa => [
      sa.type,
      sa.entity_type,
      taskTypeMap.value.get(sa.in_task_type_id)?.name,
      taskStatusMap.value.get(sa.in_task_status_id)?.short_name,
      sa.out_field_type === 'ready_for'
        ? t('status_automations.change_ready_for')
        : t('status_automations.change_status'),
      taskTypeMap.value.get(sa.out_task_type_id)?.name,
      sa.out_field_type === 'status'
        ? taskStatusMap.value.get(sa.out_task_status_id)?.short_name
        : undefined,
      sa.import_last_revision
    ])
  ]
  csv.buildCsvFile(name, entries)
}

const onNewClicked = () => {
  statusAutomationToEdit.value = {}
  errors.edit = false
  modals.edit = true
}

const onEditClicked = sa => {
  statusAutomationToEdit.value = sa
  errors.edit = false
  modals.edit = true
}

const onDeleteClicked = sa => {
  statusAutomationToDelete.value = sa
  errors.del = false
  modals.del = true
}

// Watchers

watch(
  () => route.query.tab,
  tab => {
    activeTab.value = tab || 'active'
  }
)

// Lifecycle

onMounted(async () => {
  loading.list = true
  errors.list = false
  try {
    await store.dispatch('loadStatusAutomations')
  } catch {
    errors.list = true
  }
  loading.list = false
})

// Head

useHead({
  title: computed(() => `${t('status_automations.title')} - Kitsu`)
})
</script>

<style lang="scss" scoped>
.status-automation-list {
  margin-top: 0;
}
</style>
