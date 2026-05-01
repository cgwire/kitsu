<template>
  <base-modal :active="active" :title="modalTitle" @cancel="$emit('cancel')">
    <form @submit.prevent>
      <text-field
        ref="nameField"
        :label="$t('asset_types.fields.name')"
        :maxlength="30"
        v-model="form.name"
        @enter="runConfirmation"
        v-focus
      />
      <text-field
        :label="$t('asset_types.fields.short_name')"
        :maxlength="30"
        v-model="form.short_name"
        @enter="runConfirmation"
      />
      <textarea-field
        :label="$t('asset_types.fields.description')"
        v-model="form.description"
        @enter="runConfirmation"
      />
      <combobox-boolean
        :label="$t('main.archived')"
        @enter="runConfirmation"
        v-model="form.archived"
        v-if="isEditing"
      />

      <label class="label">
        {{ $t('asset_types.fields.task_types') }}
      </label>
      <div class="flexrow task-types mb1">
        <div
          class="flexrow-item mb1"
          :key="taskTypeId"
          @click="removeTaskType(taskTypeId)"
          v-for="taskTypeId in form.task_types"
        >
          <task-type-name
            :task-type="taskTypeMap.get(taskTypeId)"
            :deletable="true"
            v-if="taskTypeId"
          />
        </div>
        <combobox
          class="flexrow-item mb1"
          :options="availableTaskTypes"
          :with-margin="false"
          @update:model-value="addTaskType"
          v-if="availableTaskTypes.length > 1"
        />
      </div>
    </form>

    <modal-footer
      :error-text="$t('asset_types.create_error')"
      :is-error="isError"
      :is-loading="isLoading"
      @confirm="runConfirmation"
      @cancel="$emit('cancel')"
    />
  </base-modal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { sortByName } from '@/lib/sorting'

import BaseModal from '@/components/modals/BaseModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxBoolean from '@/components/widgets/ComboboxBoolean.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'
import TextField from '@/components/widgets/TextField.vue'
import TextareaField from '@/components/widgets/TextareaField.vue'

const { t } = useI18n()
const store = useStore()

// Props / Emits

const props = defineProps({
  active: { type: Boolean, default: false },
  assetTypeToEdit: { type: Object, default: () => ({}) },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false }
})

const emit = defineEmits(['cancel', 'confirm'])

// State

const form = ref({
  name: '',
  short_name: '',
  description: '',
  task_types: []
})
const nameField = ref(null)

// Computed

const taskTypes = computed(() => store.getters.taskTypes)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

const isEditing = computed(() => Boolean(props.assetTypeToEdit?.id))

const modalTitle = computed(() =>
  isEditing.value
    ? `${t('asset_types.edit_title')} ${props.assetTypeToEdit.name}`
    : t('asset_types.new_asset_type')
)

const availableTaskTypes = computed(() => {
  const filtered = sortByName(
    taskTypes.value.filter(
      taskType =>
        !form.value.task_types.includes(taskType.id) &&
        taskType.for_entity === 'Asset'
    )
  )
  return [
    { name: t('task_types.add_task_type_placeholder'), id: '-' },
    ...filtered
  ].map(taskType => ({ label: taskType.name, value: taskType.id }))
})

// Functions

const addTaskType = id => {
  if (taskTypeMap.value.get(id)) {
    form.value.task_types.push(id)
  }
}

const removeTaskType = idToRemove => {
  const index = form.value.task_types.indexOf(idToRemove)
  if (index >= 0) {
    form.value.task_types.splice(index, 1)
  }
}

const runConfirmation = () => {
  emit('confirm', form.value)
}

// Watchers

watch(
  () => props.active,
  active => {
    if (active) {
      setTimeout(() => {
        nameField.value?.focus()
      }, 100)
    }
  }
)

watch(
  () => props.assetTypeToEdit,
  assetType => {
    if (assetType?.id) {
      form.value = {
        name: assetType.name,
        short_name: assetType.short_name,
        description: assetType.description,
        task_types: [...(assetType.task_types || [])],
        archived: String(assetType.archived === true)
      }
    } else {
      form.value = {
        name: '',
        short_name: '',
        description: '',
        task_types: [],
        archived: 'false'
      }
    }
  }
)
</script>

<style lang="scss" scoped>
.task-types {
  flex-wrap: wrap;
}
</style>
