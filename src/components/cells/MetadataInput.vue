<template>
  <div class="metadata-input" :class="metadataInputClass">
    <!-- long text: preview + popup editor (teleported, escapes the table). -->
    <metadata-textarea
      :model-value="getMetadataFieldValue(descriptor, entity)"
      :editable="isEditable"
      @update:model-value="
        value => onMetadataFieldChanged(entity, descriptor, value)
      "
      v-if="descriptor.data_type === 'textarea'"
    />
    <!-- read-only URL: clickable link until the row is selected -->
    <a
      class="metadata-readonly align-left metadata-link"
      :href="displayValue"
      target="_blank"
      rel="noopener noreferrer"
      @click.stop
      v-else-if="
        selected === false && descriptor.data_type === 'url' && displayValue
      "
    >
      {{ displayValue }}
    </a>
    <!-- person: avatar + name; click opens a teleported picker popup. -->
    <metadata-person
      :person="personValue"
      :people="team"
      :editable="isEditable"
      @select="value => onMetadataFieldChanged(entity, descriptor, value)"
      v-else-if="descriptor.data_type === 'person'"
    />
    <!-- read-only value: editors only appear once the row is selected.
         Boolean keeps its checkbox (disabled below), so it is excluded here. -->
    <div
      class="metadata-readonly"
      :class="{ 'align-left': isTextType }"
      :title="displayValue"
      v-else-if="selected === false && descriptor.data_type !== 'boolean'"
    >
      {{ displayValue }}
    </div>
    <!-- text input -->
    <input
      class="input-editor"
      :readonly="!isEditable"
      @input="event => onMetadataFieldChanged(entity, descriptor, event)"
      :value="getMetadataFieldValue(descriptor, entity)"
      v-else-if="!descriptor.data_type || descriptor.data_type === 'string'"
    />
    <!-- number input -->
    <input
      class="input-editor"
      :readonly="!isEditable"
      type="number"
      step="any"
      @keydown="onNumberFieldKeyDown"
      @input="event => onMetadataFieldChanged(entity, descriptor, event)"
      :value="getMetadataFieldValue(descriptor, entity)"
      v-else-if="descriptor.data_type === 'number'"
    />
    <!-- date input -->
    <date-field
      class="date-editor"
      model-type="yyyy-MM-dd"
      :disabled="!isEditable"
      :format="dateInputFormat"
      :model-value="getMetadataFieldValue(descriptor, entity) || null"
      :placeholder="''"
      :with-margin="false"
      @update:model-value="
        value => onMetadataFieldChanged(entity, descriptor, value ?? '')
      "
      v-else-if="descriptor.data_type === 'date'"
    />
    <!-- url input -->
    <input
      class="input-editor"
      :readonly="!isEditable"
      type="url"
      @input="event => onMetadataFieldChanged(entity, descriptor, event)"
      :value="getMetadataFieldValue(descriptor, entity)"
      v-else-if="descriptor.data_type === 'url'"
    />
    <!-- boolean input -->
    <input
      class="input-editor"
      :disabled="!isEditable || selected === false"
      @input="event => onMetadataFieldChanged(entity, descriptor, event)"
      type="checkbox"
      :checked="getMetadataFieldValue(descriptor, entity) === 'true'"
      v-else-if="descriptor.data_type === 'boolean'"
    />
    <!-- checklist input -->
    <div
      class="metadata-value selectable"
      v-else-if="
        descriptor.data_type === 'checklist' &&
        getDescriptorChecklistValues(descriptor).length
      "
    >
      <p
        :key="`${entity.id}-${descriptor.id}-${i}-${option.text}-div`"
        v-for="(option, i) in getDescriptorChecklistValues(descriptor)"
      >
        <input
          type="checkbox"
          @change="
            event =>
              onMetadataChecklistChanged(entity, descriptor, option.text, event)
          "
          :id="`${entity.id}-${descriptor.id}-${i}-${option.text}-input`"
          :checked="getMetadataChecklistValues(descriptor, entity)[option.text]"
          :disabled="!isEditable"
          :style="[isEditable ? { cursor: 'pointer' } : { cursor: 'auto' }]"
        />
        <label
          :for="`${entity.id}-${descriptor.id}-${i}-${option.text}-input`"
          :style="[isEditable ? { cursor: 'pointer' } : { cursor: 'auto' }]"
          class="ml05"
        >
          {{ option.text }}
        </label>
      </p>
    </div>
    <!-- list input -->
    <span class="select" v-else-if="descriptor.data_type === 'list'">
      <select
        class="select-input"
        @change="event => onMetadataFieldChanged(entity, descriptor, event)"
      >
        <option
          :disabled="!isEditable"
          :key="`desc-value-${entity.id}-${descriptor.id}-${i}-${option.label}-${option.value}`"
          :value="option.value"
          :selected="getMetadataFieldValue(descriptor, entity) === option.value"
          v-for="(option, i) in getDescriptorChoicesOptions(descriptor)"
        >
          {{ option.label }}
        </option>
      </select>
    </span>
    <!-- tag list input -->
    <combobox-tag
      :disabled="!isEditable"
      :options="getDescriptorChoicesOptions(descriptor, false)"
      :shy="true"
      :model-value="getMetadataFieldValue(descriptor, entity)"
      :with-margin="false"
      @update:model-value="
        value => onMetadataFieldChanged(entity, descriptor, value)
      "
      v-else-if="descriptor.data_type === 'taglist'"
    />
    <!-- default -->
    <div class="metadata-value selectable" v-else>
      {{ getMetadataFieldValue(descriptor, entity) }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

import { useFormat } from '@/composables/format'
import {
  getDescriptorChecklistValues,
  getDescriptorChoicesOptions,
  getMetadataChecklistValues,
  getMetadataFieldValue,
  isSupervisorInDepartments
} from '@/lib/descriptors'
import { sortPeople } from '@/lib/sorting'

import MetadataPerson from '@/components/cells/MetadataPerson.vue'
import MetadataTextarea from '@/components/cells/MetadataTextarea.vue'
import ComboboxTag from '@/components/widgets/ComboboxTag.vue'
import DateField from '@/components/widgets/DateField.vue'

const props = defineProps({
  descriptor: { type: Object, required: true },
  entity: { type: Object, required: true },
  // eslint-disable-next-line vue/no-unused-properties
  indexes: { type: Object, default: () => ({}) },
  // null: always editable (assets/shots lists). true/false: gate the editor
  // on row selection (task list), showing a read-only value until selected.
  selected: { type: Boolean, default: null }
})

const emit = defineEmits(['metadata-changed'])

const store = useStore()
const { dateFormat, formatDisplayDate } = useFormat()

// Computed

const isCurrentUserManager = computed(() => store.getters.isCurrentUserManager)
const isCurrentUserSupervisor = computed(
  () => store.getters.isCurrentUserSupervisor
)
const currentProduction = computed(() => store.getters.currentProduction)
const personMap = computed(() => store.getters.personMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)
const selectedAssets = computed(() => store.getters.selectedAssets)
const selectedEdits = computed(() => store.getters.selectedEdits)
const selectedShots = computed(() => store.getters.selectedShots)
const selectedTasks = computed(() => store.getters.selectedTasks)
const user = computed(() => store.getters.user)

// Project team, for the "person" descriptor picker.
const team = computed(() =>
  sortPeople(
    (currentProduction.value?.team || [])
      .map(personId => personMap.value.get(personId))
      .filter(Boolean)
  )
)

const personValue = computed(
  () =>
    personMap.value.get(
      getMetadataFieldValue(props.descriptor, props.entity)
    ) || null
)

// Task metadata editing is gated by the task type's department (matching the
// zou permission), entity metadata by the descriptor's own departments.
const editDepartments = computed(() =>
  props.descriptor.entity_type === 'Task'
    ? taskTypeMap.value.get(props.entity.task_type_id)?.department_id
    : props.descriptor.departments
)

const isEditable = computed(
  () =>
    isCurrentUserManager.value ||
    isSupervisorInDepartments(
      user.value,
      isCurrentUserSupervisor.value,
      editDepartments.value
    )
)

const isReadonly = computed(() => props.selected === false)

const isTextType = computed(
  () =>
    !props.descriptor.data_type ||
    ['string', 'url', 'textarea'].includes(props.descriptor.data_type)
)

// The read-only value uses a plain display, so the editor-specific layout
// classes must not apply (is-date/is-checklist flip the wrapper to static
// flow, which would break the centering). Boolean keeps its checkbox even
// read-only, so is-boolean stays.
const metadataInputClass = computed(() => ({
  'is-readonly': isReadonly.value,
  'is-boolean': props.descriptor.data_type === 'boolean',
  'is-checklist':
    !isReadonly.value &&
    props.descriptor.data_type === 'checklist' &&
    getDescriptorChecklistValues(props.descriptor).length,
  'is-date': !isReadonly.value && props.descriptor.data_type === 'date',
  'is-list': !isReadonly.value && props.descriptor.data_type === 'list',
  'is-taglist': !isReadonly.value && props.descriptor.data_type === 'taglist'
}))

const displayValue = computed(() => {
  const value = getMetadataFieldValue(props.descriptor, props.entity)
  if (props.descriptor.data_type === 'date') {
    return formatDisplayDate(value)
  }
  return value
})

// VueDatePicker's input format uses date-fns tokens; the stored date format
// option (dateFormat) uses moment tokens. Only YYYY/MM/DD tokens are in play.
const dateInputFormat = computed(() =>
  dateFormat.value.replace(/YYYY/g, 'yyyy').replace(/DD/g, 'dd')
)

// Functions

const emitMetadataChanged = (entry, descriptor, value) => {
  emit('metadata-changed', { entry, descriptor, value })
}

const onMetadataFieldChanged = (entity, descriptor, event) => {
  let value
  if (typeof event === 'string') {
    value = event
  } else if (!event.target.validity.valid) {
    return
  } else if (descriptor.data_type === 'boolean') {
    value = event.target.checked ? 'true' : 'false'
  } else if (descriptor.data_type === 'number') {
    value = !isNaN(event.target.valueAsNumber)
      ? event.target.valueAsNumber
      : null
  } else {
    value = event.target.value
  }

  if (selectedShots.value.has(entity.id)) {
    selectedShots.value.forEach(shot =>
      emitMetadataChanged(shot, descriptor, value)
    )
  } else if (selectedAssets.value.has(entity.id)) {
    selectedAssets.value.forEach(asset =>
      emitMetadataChanged(asset, descriptor, value)
    )
  } else if (selectedEdits.value.has(entity.id)) {
    selectedEdits.value.forEach(edit =>
      emitMetadataChanged(edit, descriptor, value)
    )
  } else if (selectedTasks.value.has(entity.id)) {
    selectedTasks.value.forEach(task =>
      emitMetadataChanged(task, descriptor, value)
    )
  } else {
    emitMetadataChanged(entity, descriptor, value)
  }
}

const onMetadataChecklistChanged = (entity, descriptor, option, event) => {
  const values = getMetadataChecklistValues(descriptor, entity)
  values[option] = event.target.checked
  event.target.value = JSON.stringify(values)
  onMetadataFieldChanged(entity, descriptor, event)
}

const onNumberFieldKeyDown = event => {
  if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
    event.stopPropagation()
    event.preventDefault()
  }
}
</script>

<style lang="scss" scoped>
/* Fills the table cell (td.position: relative; inset) set in App.vue .datatable */
.metadata-input {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
}

.metadata-input.is-boolean {
  align-items: center;
  flex-direction: row;
  justify-content: center;
}

.metadata-input.is-checklist {
  position: static;
}

.metadata-input.is-readonly {
  justify-content: center;
}

.metadata-readonly {
  box-sizing: border-box;
  display: block;
  overflow: hidden;
  padding: 0.35rem 0.5rem;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

.metadata-readonly.align-left {
  text-align: left;
}

.metadata-link {
  color: inherit;
  text-decoration: underline;
}

/* Raise the cell so an open inline editor is not trapped behind neighbours. */
.metadata-input:focus-within {
  z-index: 40;
}

/* Let the datepicker flow like the schedule/task date cells instead of being
   pinned by the absolute wrapper, and fill the column width. */
.metadata-input.is-date {
  position: static;

  :deep(.datepicker) {
    max-width: none;
    width: 100%;
  }
}

.metadata-input.is-checklist .metadata-value,
.metadata-input:not(.is-boolean) .input-editor:not([type='checkbox']) {
  flex: 1 1 auto;
  min-height: 0;
}

.metadata-input .select,
.metadata-input .metadata-value {
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
}

.metadata-input.is-taglist :deep(> div) {
  align-items: center;
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
}

.metadata-input.is-taglist :deep(.combo) {
  flex: 1 1 auto;
  min-height: 0;
}

.dark {
  .select select,
  .input-editor {
    color: $white;

    option {
      background: $dark-grey-light;
      color: $white;
    }

    &:focus,
    &:active,
    &:hover {
      background: $dark-grey-light;
    }
  }
}

.input-editor {
  background: transparent;
  border: 1px solid transparent;
  box-sizing: border-box;
  color: $grey-strong;
  margin: 0;
  overflow: hidden;
  padding: 0.35rem 0.5rem;
  text-overflow: ellipsis;
  width: 100%;
  z-index: auto;

  &[type='checkbox'] {
    display: block;
    flex: none;
    height: 1.15rem;
    margin: 0;
    min-height: 0;
    padding: 0;
    width: 1.15rem;
  }

  &[type='number'] {
    -moz-appearance: textfield;

    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }

  &:active,
  &:focus,
  &:hover {
    background: transparent;
    background: white;
  }

  &:active,
  &:focus {
    border: 1px solid $green;
  }

  &:hover {
    border: 1px solid $light-green;
  }

  &:invalid {
    color: $red;
  }
}

.select {
  border: 1px solid transparent;
  color: $grey-strong;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  margin: 0;
  min-height: 0;
  padding: 0;
  width: 100%;

  &::after {
    border-color: transparent;
  }

  &:active,
  &:focus,
  &:hover {
    &::after {
      border-color: $green;
    }
  }

  select {
    background: transparent;
    border: 1px solid transparent;
    border-radius: 0;
    box-sizing: border-box;
    color: $grey-strong;
    flex: 1 1 auto;
    margin: 0;
    min-height: 0;
    padding: 0.35rem 0.5rem;
    width: 100%;

    &:focus {
      border: 1px solid $green;
      background: white;
    }

    &:hover {
      background: transparent;
      background: white;
      border: 1px solid $light-green;
    }
  }
}

.metadata-value {
  box-sizing: border-box;
  flex: 1 1 auto;
  margin: 0;
  max-width: 100%;
  min-height: 0;
  overflow: auto;
  padding: 0.35rem 0.5rem;
  white-space: normal;
}
</style>
