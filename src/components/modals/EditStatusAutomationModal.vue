<template>
  <base-modal :active="active" :title="title" @cancel="$emit('cancel')">
    <form @submit.prevent>
      <section class="automation-block">
        <h2 class="subtitle">{{ $t('status_automations.in_title') }}</h2>

        <div class="trigger-fields">
          <combobox
            class="entity-type-field"
            :label="$t('status_automations.fields.entity_type')"
            :model-value="form.entityType"
            :options="entityTypeOptions"
            locale-key-prefix="status_automations.entity_types."
            @enter="confirmClicked"
            @update:model-value="onEntityTypeChanged"
            v-if="!isEditing"
          />
          <div class="field entity-type-field" v-else>
            <label class="label">
              {{ $t('status_automations.fields.entity_type') }}
            </label>
            <span class="entity-type-name">
              {{ entityTypeName }}
            </span>
          </div>

          <div class="operator-line flexrow" v-if="form.conditions.length > 1">
            <span class="flexrow-item">
              {{ $t('status_automations.trigger_when') }}
            </span>
            <combobox
              class="flexrow-item operator"
              :aria-label="$t('status_automations.trigger_when')"
              :options="operatorOptions"
              :with-margin="false"
              locale-key-prefix="status_automations.operators."
              v-model="form.operator"
            />
          </div>
        </div>

        <template
          :key="condition.key"
          v-for="(condition, index) in form.conditions"
        >
          <p class="condition-connector" v-if="index > 0">
            {{ $t(`status_automations.connectors.${form.operator}`) }}
          </p>
          <div
            class="condition flexrow"
            :class="{ 'is-following': index > 0 }"
            :ref="element => setConditionRef(condition.key, element)"
          >
            <combobox-task-type
              class="flexrow-item"
              :label="$t('status_automations.fields.in_task_type')"
              :task-type-list="getConditionTaskTypes(condition)"
              v-model="condition.taskTypeId"
            />
            <task-status-set-field
              class="flexrow-item"
              :label="$t('status_automations.fields.in_task_status')"
              :task-status-list="taskStatusList"
              v-model="condition.taskStatusIds"
            />
            <button-simple
              class="flexrow-item remove-condition"
              icon="minus"
              :aria-label="getRemoveLabel(condition)"
              :disabled="form.conditions.length === 1"
              :title="getRemoveLabel(condition)"
              type="button"
              @click="removeCondition(index)"
            />
          </div>
          <p
            class="error condition-error"
            role="alert"
            v-if="conditionErrors[index]"
          >
            {{ $t(conditionErrors[index]) }}
          </p>
        </template>

        <button
          type="button"
          class="button add-condition"
          ref="addConditionButton"
          :disabled="!nextConditionTaskType"
          @click="addCondition"
        >
          {{ $t('status_automations.add_condition') }}
        </button>
        <p class="help" v-if="form.conditions.length > 1">
          {{ $t(`status_automations.help.${form.operator}`) }}
        </p>
        <p class="help">
          {{ $t('status_automations.help.new_comments_only') }}
        </p>
      </section>

      <arrow-down-icon class="blocks-arrow" :size="24" />

      <section class="automation-block">
        <h2 class="subtitle">{{ $t('status_automations.out_title') }}</h2>

        <div class="flexrow">
          <combobox
            class="flexrow-item margin-fix"
            :label="$t('status_automations.fields.out_field_type')"
            :model-value="form.outFieldType"
            :options="fieldTypeOptions"
            locale-key-prefix="status_automations.field_types."
            @enter="confirmClicked"
            @update:model-value="onOutFieldTypeChanged"
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
            :task-type-list="outTaskTypeList"
            :open-top="true"
            v-model="form.outTaskTypeId"
          />

          <combobox-status
            class="flexrow-item"
            :label="$t('status_automations.fields.out_task_status')"
            :task-status-list="taskStatusList"
            :open-top="true"
            v-model="form.outTaskStatusId"
            v-if="form.outFieldType === 'status'"
          />
        </div>

        <template v-if="form.outFieldType === 'status'">
          <task-status-set-field
            class="field-with-help"
            :label="$t('status_automations.fields.out_only_if_task_status_ids')"
            :open-top="true"
            :task-status-list="taskStatusList"
            v-model="form.outOnlyIfTaskStatusIds"
          />
          <p class="help">
            {{ $t('status_automations.help.out_only_if') }}
          </p>
        </template>

        <template v-if="form.outFieldType === 'status'">
          <combobox-boolean
            class="mt1 field-with-help"
            :label="$t('status_automations.fields.import_last_revision')"
            @enter="confirmClicked"
            v-model="form.importLastRevision"
          />
          <p class="help" v-if="form.importLastRevision === 'true'">
            {{ $t(importHelpKey) }}
          </p>
        </template>
      </section>

      <combobox-boolean
        class="mt1"
        :label="$t('main.archived')"
        @enter="confirmClicked"
        v-model="form.archived"
        v-if="isEditing"
      />
    </form>

    <modal-footer
      :error-details="errorDetails"
      :error-text="errorText"
      :is-disabled="!isValid"
      :is-error="isError"
      :is-loading="isLoading"
      @confirm="confirmClicked"
      @cancel="$emit('cancel')"
    />
  </base-modal>
</template>

<script setup>
import { ArrowDownIcon } from 'lucide-vue-next'
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import {
  automationToForm,
  getEntityTypeName,
  isFormValid,
  isGuardChanged,
  isTriggerChanged,
  isTriggerOrOutputChanged,
  MAX_CONDITIONS,
  validateConditions
} from '@/lib/statusautomations'

import BaseModal from '@/components/modals/BaseModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxBoolean from '@/components/widgets/ComboboxBoolean.vue'
import ComboboxStatus from '@/components/widgets/ComboboxStatus.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import TaskStatusSetField from '@/components/widgets/TaskStatusSetField.vue'

const { t, te } = useI18n()
const store = useStore()

// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
  active: { type: Boolean, default: false },
  // The reason Zou gives for refusing the automation.
  errorDetails: { type: String, default: '' },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  statusAutomationToEdit: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['cancel', 'confirm'])

// Constants
// --------------------------------------------------------------------------
const entityTypeOptions = [
  { label: 'asset', value: 'asset' },
  { label: 'shot', value: 'shot' },
  { label: 'sequence', value: 'sequence' },
  { label: 'episode', value: 'episode' },
  { label: 'edit', value: 'edit' }
]
const fieldTypeOptions = [
  { label: 'status', value: 'status' },
  { label: 'ready_for', value: 'ready_for' }
]
const operatorOptions = [
  { label: 'and', value: 'and' },
  { label: 'or', value: 'or' }
]

// State
// --------------------------------------------------------------------------
const form = reactive({
  entityType: 'asset',
  operator: 'and',
  conditions: [],
  outFieldType: 'status',
  outTaskTypeId: '',
  outTaskStatusId: '',
  outOnlyIfTaskStatusIds: [],
  importLastRevision: 'false',
  archived: 'false'
})

// The edited automation as stored, to tell what the form changes.
const storedForm = ref(null)

const addConditionButton = ref(null)
const conditionRefs = new Map()
let lastConditionKey = 0

// Computed
// --------------------------------------------------------------------------
const assetTaskTypes = computed(() => store.getters.assetTaskTypes)
const shotTaskTypes = computed(() => store.getters.shotTaskTypes)
const sequenceTaskTypes = computed(() => store.getters.sequenceTaskTypes)
const episodeTaskTypes = computed(() => store.getters.episodeTaskTypes)
const editTaskTypes = computed(() => store.getters.editTaskTypes)
const taskStatuses = computed(() => store.getters.taskStatuses)

const taskTypesByEntityType = computed(() => ({
  asset: assetTaskTypes.value,
  shot: shotTaskTypes.value,
  sequence: sequenceTaskTypes.value,
  episode: episodeTaskTypes.value,
  edit: editTaskTypes.value
}))

const taskStatusList = computed(() =>
  taskStatuses.value.filter(status => !status.for_concept)
)

const entityTypeName = computed(() =>
  getEntityTypeName(form.entityType, { t, te })
)

const entityTaskTypes = computed(
  () => taskTypesByEntityType.value[form.entityType] ?? assetTaskTypes.value
)

// Only assets support a "ready_for" output, which targets shot task types.
const outTaskTypes = computed(() =>
  form.outFieldType === 'ready_for'
    ? shotTaskTypes.value
    : entityTaskTypes.value
)

const outTaskTypeList = computed(() =>
  withArchivedValue(outTaskTypes.value, form.outTaskTypeId)
)

const nextConditionTaskType = computed(() => {
  if (form.conditions.length >= MAX_CONDITIONS) return null
  const usedTaskTypeIds = new Set([
    ...form.conditions.map(condition => condition.taskTypeId),
    ...(form.outFieldType === 'status' ? [form.outTaskTypeId] : [])
  ])
  return (
    entityTaskTypes.value.find(
      taskType => isActive(taskType) && !usedTaskTypeIds.has(taskType.id)
    ) ?? null
  )
})

// Like Zou, which stays the authority: a stored row breaking a rule stays
// editable while its trigger and output stay, and one without conditions
// needs one only when the save sends its trigger.
const isChecked = computed(
  () => !storedForm.value || isTriggerOrOutputChanged(form, storedForm.value)
)
const isTriggerSent = computed(
  () => !storedForm.value || isTriggerChanged(form, storedForm.value)
)
const conditionErrors = computed(() =>
  isChecked.value ? validateConditions(form) : []
)
const isValid = computed(
  () =>
    !isChecked.value ||
    isFormValid(form, { isTriggerSent: isTriggerSent.value })
)

const importHelpKey = computed(() =>
  form.operator === 'and' && form.conditions.length > 1
    ? 'status_automations.help.import_and'
    : 'status_automations.help.import_or'
)

const isEditing = computed(() => props.statusAutomationToEdit?.id)

// Trying again does not help with a refusal.
const errorText = computed(() =>
  props.errorDetails
    ? t('status_automations.save_refused')
    : t('status_automations.create_error')
)

const title = computed(() =>
  isEditing.value
    ? t('status_automations.edit_title')
    : t('status_automations.new_status_automation')
)

// Functions
// --------------------------------------------------------------------------
const isActive = taskType => !taskType.archived

// An archived value a field already holds stays listed, never offered to
// another field.
const withArchivedValue = (taskTypes, taskTypeId) =>
  taskTypes.filter(taskType => isActive(taskType) || taskType.id === taskTypeId)

const getConditionTaskTypes = condition =>
  withArchivedValue(entityTaskTypes.value, condition.taskTypeId)

// The remove buttons are icons: each one names its row for screen readers.
const getRemoveLabel = condition => {
  const taskType = entityTaskTypes.value.find(
    taskType => taskType.id === condition.taskTypeId
  )
  return taskType
    ? t('status_automations.remove_condition_on', { taskType: taskType.name })
    : t('status_automations.remove_condition')
}

const withKey = condition => ({ ...condition, key: ++lastConditionKey })

const buildDefaultCondition = () =>
  withKey({
    taskTypeId: entityTaskTypes.value.find(isActive)?.id,
    taskStatusIds: [taskStatusList.value[0]?.id].filter(Boolean)
  })

// The second task type, the first one making the default condition, unless
// a condition uses it: a status change never applies to a condition task type.
const resetOutput = () => {
  const activeOutTaskTypes = outTaskTypes.value.filter(isActive)
  const isFree = taskType =>
    form.outFieldType !== 'status' ||
    form.conditions.every(condition => condition.taskTypeId !== taskType.id)
  const outTaskType = [activeOutTaskTypes[1], ...activeOutTaskTypes].find(
    taskType => taskType && isFree(taskType)
  )
  form.outTaskTypeId = (outTaskType ?? activeOutTaskTypes[0])?.id
  form.outTaskStatusId = taskStatusList.value[1]?.id
  form.outOnlyIfTaskStatusIds = []
}

const resetForm = () => {
  if (!props.statusAutomationToEdit) return
  if (isEditing.value) {
    const values = automationToForm(props.statusAutomationToEdit)
    Object.assign(form, {
      ...values,
      conditions: values.conditions.map(withKey)
    })
    storedForm.value = automationToForm(props.statusAutomationToEdit)
  } else {
    storedForm.value = null
    Object.assign(form, {
      entityType: 'asset',
      operator: 'and',
      outFieldType: 'status',
      importLastRevision: 'false',
      archived: 'false'
    })
    form.conditions = [buildDefaultCondition()]
    resetOutput()
  }
}

const onEntityTypeChanged = entityType => {
  form.entityType = entityType
  if (entityType !== 'asset') form.outFieldType = 'status'
  form.operator = 'and'
  form.conditions = [buildDefaultCondition()]
  resetOutput()
}

// Zou imports a revision for a status change only.
const onOutFieldTypeChanged = outFieldType => {
  form.outFieldType = outFieldType
  if (outFieldType !== 'status') form.importLastRevision = 'false'
  resetOutput()
}

const setConditionRef = (key, element) => {
  if (element) conditionRefs.set(key, element)
  else conditionRefs.delete(key)
}

// The previous row's statuses, archived ones left out: they are never
// offered for a new choice.
const addCondition = async () => {
  const lastCondition = form.conditions[form.conditions.length - 1]
  const activeTaskStatusIds = (lastCondition?.taskStatusIds ?? []).filter(
    taskStatusId =>
      taskStatusList.value.some(taskStatus => taskStatus.id === taskStatusId)
  )
  const condition = withKey({
    taskTypeId: nextConditionTaskType.value.id,
    taskStatusIds:
      activeTaskStatusIds.length > 0
        ? activeTaskStatusIds
        : [taskStatusList.value[0]?.id].filter(Boolean)
  })
  form.conditions.push(condition)
  await nextTick()
  conditionRefs.get(condition.key)?.querySelector('[role="combobox"]')?.focus()
}

// The focus goes to the next remove button, else to the add button, else,
// when no task type is left to add, to the task type of the nearest row.
const removeCondition = async index => {
  form.conditions.splice(index, 1)
  if (form.conditions.length === 1) form.operator = 'and'
  await nextTick()
  const getRow = position => conditionRefs.get(form.conditions[position]?.key)
  const addButton = addConditionButton.value
  const focusTarget =
    getRow(index)?.querySelector('.remove-condition:not([disabled])') ??
    (addButton?.disabled ? null : addButton) ??
    (getRow(index) ?? getRow(index - 1))?.querySelector('[role="combobox"]')
  focusTarget?.focus()
}

// The comboboxes send Enter here, past the footer button, which is disabled
// or waits for the save.
const confirmClicked = () => {
  if (!isValid.value || props.isLoading) return
  emit('confirm', {
    ...form,
    conditions: form.conditions.map(condition => ({
      taskTypeId: condition.taskTypeId,
      taskStatusIds: [...condition.taskStatusIds]
    })),
    outOnlyIfTaskStatusIds: [...form.outOnlyIfTaskStatusIds],
    isTriggerChanged: isTriggerSent.value,
    isGuardChanged: !storedForm.value || isGuardChanged(form, storedForm.value)
  })
}

// Watchers
// --------------------------------------------------------------------------
watch(() => props.statusAutomationToEdit, resetForm)

// The page hands the same row back after a canceled edit.
watch(
  () => props.active,
  active => {
    if (active) resetForm()
  }
)
</script>

<style lang="scss" scoped>
.margin-fix {
  margin-top: 5px;
}

.subtitle {
  font-size: 1.4em;
  margin-top: 0;
  margin-bottom: 1em;
  text-transform: none;
}

// The look of the settings blocks (.tab .section in SettingsLayout). No overflow
// here: the comboboxes open past the block. The negative margins keep the
// fields as wide as the rest of the form.
.automation-block {
  background: var(--background-block);
  border: 1px solid var(--border);
  border-radius: 1em;
  box-shadow: 0 0 6px var(--box-shadow);
  margin: 0 -1em;
  padding: 1em;

  > :last-child {
    margin-bottom: 0;
  }
}

.blocks-arrow {
  color: var(--text-alt);
  display: block;
  margin: 0.5em auto;
}

// The fields of these rows line up whatever the length of their labels.
.trigger-fields {
  align-items: center;
  display: grid;
  gap: 1em;
  grid-template-columns: max-content 1fr;
  margin-bottom: 1em;
}

.entity-type-field,
.operator-line {
  display: contents;
}

.entity-type-field :deep(.label) {
  margin-bottom: 0;
}

.operator-line > .flexrow-item {
  margin-right: 0;
}

.entity-type-name,
.entity-type-field :deep(select) {
  font-weight: 600;
}

.entity-type-name {
  font-size: 1.2em;
  text-transform: capitalize;
}

// Top aligned: the statuses of a row can wrap over two lines.
.condition {
  align-items: flex-start;
}

.condition :deep(.field) {
  margin-bottom: 0;
}

.remove-condition {
  margin-left: auto;
  margin-top: 2.33em;
}

// The labels of the first condition stand for the next ones, which keep theirs
// for screen readers.
.condition.is-following {
  :deep(.label) {
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }

  .remove-condition {
    margin-top: 0.4em;
  }
}

.condition-connector {
  align-items: center;
  display: flex;
  font-weight: 500;
  gap: 0.8em;
  letter-spacing: 1px;
  margin: 0.8em 0;
  text-transform: uppercase;

  &::after {
    background: var(--border-alt);
    content: '';
    flex: 1;
    height: 1px;
  }
}

.condition-error {
  margin-top: 0.3em;
}

.add-condition {
  margin-left: 0;
  margin-top: 1em;
}

.help {
  color: var(--text-alt);
  margin-top: 0.5em;
}

.add-condition + .help {
  margin-top: 1.75em;
}

.field-with-help {
  margin-bottom: 0;
}

.field-with-help + .help:not(:last-child) {
  margin-bottom: 2.5em;
}

@media screen and (max-width: 768px) {
  .subtitle {
    font-size: 1.15em;
  }

  .automation-block {
    margin-left: 0;
    margin-right: 0;
    padding: 0.8em;
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

  .remove-condition {
    margin-top: 0.4em;
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
