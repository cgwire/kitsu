<template>
  <div class="custom-actions page fixed-page">
    <list-page-header
      :title="$t('custom_actions.title')"
      :new-entry-label="$t('custom_actions.new_custom_action')"
      @export-clicked="onExportClicked"
      @new-clicked="onNewClicked"
    />

    <custom-action-list
      :entries="customActions"
      :is-loading="loading.list"
      :is-error="errors.list"
      @edit-clicked="onEditClicked"
      @delete-clicked="onDeleteClicked"
    />

    <edit-custom-action-modal
      active
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :custom-action-to-edit="customActionToEdit"
      @cancel="modals.edit = false"
      @confirm="confirmEditCustomAction"
      v-if="modals.edit"
    />

    <delete-modal
      active
      :is-loading="loading.del"
      :is-error="errors.del"
      :text="deleteText"
      :error-text="$t('custom_actions.delete_error')"
      @cancel="modals.del = false"
      @confirm="confirmDeleteCustomAction"
      v-if="modals.del"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useHead } from '@unhead/vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import csv from '@/lib/csv'
import stringHelpers from '@/lib/string'

import CustomActionList from '@/components/lists/CustomActionList.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditCustomActionModal from '@/components/modals/EditCustomActionModal.vue'
import ListPageHeader from '@/components/widgets/ListPageHeader.vue'

const { t } = useI18n()
const store = useStore()

// State

const customActionToDelete = ref(null)
const customActionToEdit = ref(null)
const modals = reactive({ edit: false, del: false })
const loading = reactive({ edit: false, del: false, list: false })
const errors = reactive({ edit: false, del: false, list: false })

// Computed

const customActions = computed(() => store.getters.customActions)

const deleteText = computed(() => {
  const customAction = customActionToDelete.value
  return customAction
    ? t('custom_actions.delete_text', { name: customAction.name })
    : ''
})

// Functions

const confirmEditCustomAction = form => {
  const isEdit = !!customActionToEdit.value?.id
  if (isEdit) form.id = customActionToEdit.value.id

  loading.edit = true
  errors.edit = false
  store
    .dispatch(isEdit ? 'editCustomAction' : 'newCustomAction', form)
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

const confirmDeleteCustomAction = () => {
  loading.del = true
  errors.del = false
  store
    .dispatch('deleteCustomAction', customActionToDelete.value)
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
  const name = stringHelpers.slugify(t('custom_actions.title'))
  const headers = [
    t('main.type'),
    t('custom_actions.fields.name'),
    t('custom_actions.fields.url'),
    t('custom_actions.fields.entity_type'),
    t('custom_actions.fields.is_ajax')
  ]
  const entries = [
    headers,
    ...customActions.value.map(customAction => [
      customAction.type,
      customAction.name,
      customAction.url,
      customAction.entity_type,
      customAction.is_ajax
    ])
  ]
  csv.buildCsvFile(name, entries)
}

const onNewClicked = () => {
  customActionToEdit.value = {}
  errors.edit = false
  modals.edit = true
}

const onEditClicked = customAction => {
  customActionToEdit.value = customAction
  errors.edit = false
  modals.edit = true
}

const onDeleteClicked = customAction => {
  customActionToDelete.value = customAction
  errors.del = false
  modals.del = true
}

// Lifecycle

onMounted(async () => {
  loading.list = true
  errors.list = false
  try {
    await store.dispatch('loadCustomActions')
  } catch {
    errors.list = true
  } finally {
    loading.list = false
  }
})

// Head

useHead({ title: computed(() => `${t('custom_actions.title')} - Kitsu`) })
</script>
