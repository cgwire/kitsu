<template>
  <div
    :class="{
      modal: true,
      'is-active': active
    }"
  >
    <div class="modal-background" @click="$emit('cancel')"></div>

    <div class="modal-content">
      <div class="box">
        <h1 class="title" v-if="isEditing">
          {{ $t('status_automations.edit_title') }}
        </h1>
        <h1 class="title" v-else>
          {{ $t('status_automations.new_status_automation') }}
        </h1>

        <form @submit.prevent>
          <h3 class="subtitle">
            {{ $t('status_automations.entity_title') }}
          </h3>
          <combobox
            :label="$t('status_automations.fields.entity_type')"
            :options="entityTypeOptions"
            locale-key-prefix="status_automations.entity_types."
            @enter="confirmClicked"
            v-model="form.entityType"
            v-if="!isEditing"
          />
          <span class="entity-type-name" v-else> {{ form.entityType }} </span>

          <h2 class="subtitle">{{ $t('status_automations.in_title') }}</h2>

          <div class="flexrow">
            <combobox-task-type
              class="flexrow-item"
              :label="$t('status_automations.fields.in_task_type')"
              :task-type-list="
                form.inEntityTaskTypes.filter(({ archived }) => !archived)
              "
              v-model="form.inTaskTypeId"
              @enter="confirmClicked"
            />

            <combobox-status
              class="flexrow-item"
              :label="$t('status_automations.fields.in_task_status')"
              :task-status-list="taskStatusList"
              v-model="form.inTaskStatusId"
              @enter="confirmClicked"
            />
          </div>

          <h2 class="subtitle">{{ $t('status_automations.out_title') }}</h2>

          <div class="flexrow">
            <combobox
              class="flexrow-item margin-fix"
              :label="$t('status_automations.fields.out_field_type')"
              :options="fieldTypeOptions"
              locale-key-prefix="status_automations.field_types."
              @enter="confirmClicked"
              v-model="form.outFieldType"
              v-if="!isEditing && form.entityType === 'asset'"
            />
            <span
              class="flexrow-item"
              v-if="isEditing && form.outFieldType === 'ready_for'"
            >
              {{ $t('status_automations.field_types.ready_for') }}
            </span>

            <combobox-task-type
              class="flexrow-item"
              :label="$t('status_automations.fields.out_task_type')"
              :task-type-list="
                form.outEntityTaskTypes.filter(({ archived }) => !archived)
              "
              :open-top="true"
              @enter="confirmClicked"
              v-model="form.outTaskTypeId"
            />

            <combobox-status
              class="flexrow-item"
              :label="$t('status_automations.fields.out_task_status')"
              :task-status-list="taskStatusList"
              :open-top="true"
              @enter="confirmClicked"
              v-model="form.outTaskStatusId"
              v-if="form.outFieldType === 'status'"
            />
          </div>

          <combobox-boolean
            class="mt1"
            :label="$t('status_automations.fields.import_last_revision')"
            @enter="confirmClicked"
            v-model="form.importLastRevision"
          />

          <combobox-boolean
            :label="$t('main.archived')"
            @enter="confirmClicked"
            v-model="form.archived"
            v-if="isEditing"
          />
        </form>

        <modal-footer
          :error-text="$t('status_automations.create_error')"
          :is-error="isError"
          :is-loading="isLoading"
          @confirm="confirmClicked"
          @cancel="$emit('cancel')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, toRef, watch } from 'vue'
import { useStore } from 'vuex'

import { useModal } from '@/composables/modal'

import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxBoolean from '@/components/widgets/ComboboxBoolean.vue'
import ComboboxStatus from '@/components/widgets/ComboboxStatus.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'

const props = defineProps({
  active: { type: Boolean, default: false },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  statusAutomationToEdit: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['cancel', 'confirm'])

const store = useStore()
useModal(toRef(props, 'active'), emit)

// Constants

const entityTypeOptions = [
  { label: 'asset', value: 'asset' },
  { label: 'shot', value: 'shot' }
]
const fieldTypeOptions = [
  { label: 'status', value: 'status' },
  { label: 'ready_for', value: 'ready_for' }
]

// State

const form = reactive({
  entityType: 'asset',
  outFieldType: 'status',
  inEntityTaskTypes: [],
  outEntityTaskTypes: [],
  inTaskTypeId: '',
  outTaskTypeId: '',
  inTaskStatusId: '',
  outTaskStatusId: '',
  importLastRevision: 'false',
  archived: 'false'
})

// Computed

const assetTaskTypes = computed(() => store.getters.assetTaskTypes)
const shotTaskTypes = computed(() => store.getters.shotTaskTypes)
const taskStatuses = computed(() => store.getters.taskStatuses)

const taskStatusList = computed(() =>
  taskStatuses.value.filter(status => !status.for_concept)
)

const isEditing = computed(() => props.statusAutomationToEdit?.id)

// Functions

const setTaskTypes = fieldType => {
  if (fieldType === 'asset') {
    form.inEntityTaskTypes = assetTaskTypes.value
    form.outEntityTaskTypes =
      form.outFieldType === 'status'
        ? assetTaskTypes.value
        : shotTaskTypes.value
  } else if (fieldType === 'shot') {
    form.inEntityTaskTypes = shotTaskTypes.value
    form.outFieldType = 'status'
    form.outEntityTaskTypes = shotTaskTypes.value
  }
}

const confirmClicked = () => {
  emit('confirm', { ...form })
}

// Watchers

watch(
  () => props.statusAutomationToEdit,
  () => {
    if (!props.statusAutomationToEdit) return
    const entityType = isEditing.value
      ? props.statusAutomationToEdit.entity_type
      : 'asset'
    const entityTaskTypes =
      entityType === 'shot' ? shotTaskTypes.value : assetTaskTypes.value
    Object.assign(form, {
      entityType,
      inEntityTaskTypes: entityTaskTypes,
      outEntityTaskTypes: entityTaskTypes,
      inTaskTypeId: isEditing.value
        ? props.statusAutomationToEdit.in_task_type_id
        : entityTaskTypes[0]?.id,
      inTaskStatusId: isEditing.value
        ? props.statusAutomationToEdit.in_task_status_id
        : taskStatusList.value[0]?.id,
      outFieldType: isEditing.value
        ? props.statusAutomationToEdit.out_field_type
        : 'status',
      outTaskTypeId: isEditing.value
        ? props.statusAutomationToEdit.out_task_type_id
        : entityTaskTypes[1]?.id,
      outTaskStatusId: isEditing.value
        ? props.statusAutomationToEdit.out_task_status_id
        : taskStatusList.value[1]?.id,
      importLastRevision: isEditing.value
        ? String(props.statusAutomationToEdit.import_last_revision === true)
        : 'false',
      archived: isEditing.value
        ? String(props.statusAutomationToEdit.archived === true)
        : 'false'
    })
  }
)

watch(
  () => form.entityType,
  entityType => {
    setTaskTypes(entityType)
    if (!isEditing.value) {
      form.inTaskTypeId = form.inEntityTaskTypes[0]?.id
      form.inTaskStatusId = taskStatusList.value[0]?.id
      form.outTaskTypeId = form.outEntityTaskTypes[1]?.id
      form.outTaskStatusId = taskStatusList.value[1]?.id
    }
  }
)

watch(
  () => form.outFieldType,
  outFieldType => {
    if (outFieldType === 'ready_for') {
      form.outEntityTaskTypes = shotTaskTypes.value
      form.outTaskTypeId = shotTaskTypes.value[1]?.id
    } else if (outFieldType === 'status') {
      setTaskTypes(form.entityType)
      form.outTaskTypeId = form.outEntityTaskTypes[1]?.id
    }
  }
)
</script>

<style lang="scss" scoped>
.margin-fix {
  margin-top: 5px;
}
.subtitle {
  font-size: 1.4em;
  margin-top: 2em;
  margin-bottom: 0.5em;
  text-transform: none;
}
.entity-type-name {
  font-size: 1.2em;
  text-transform: capitalize;
}

@media screen and (max-width: 768px) {
  .subtitle {
    font-size: 1.15em;
    margin-top: 1.25em;
  }

  .flexrow {
    flex-direction: column;
    align-items: stretch;
    gap: 0;
  }

  .flexrow > .flexrow-item {
    margin-right: 0;
    width: 100%;
  }

  .flexrow :deep(.field) {
    margin-bottom: 0.4em;
  }

  .margin-fix {
    margin-top: 0;
  }

  :deep(.select),
  :deep(.select select) {
    width: 100%;
  }
}
</style>
