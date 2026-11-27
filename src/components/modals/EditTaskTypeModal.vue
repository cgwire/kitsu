<template>
  <base-modal :active="active" :title="modalTitle" @cancel="$emit('cancel')">
    <form @submit.prevent>
      <text-field
        :errored="isNameTaken"
        :error-text="nameError"
        :label="$t('task_types.fields.name')"
        v-model="form.name"
        @enter="confirmClicked"
        v-focus
      />
      <text-field
        :label="$t('task_types.fields.short_name')"
        v-model="form.short_name"
        @enter="confirmClicked"
      />
      <boolean-field
        is-field
        :label="$t('task_types.fields.allow_timelog')"
        @enter="confirmClicked"
        v-model="form.allow_timelog"
      />
      <textarea-field
        :label="$t('task_types.fields.description')"
        v-model="form.description"
        @enter="confirmClicked"
      />
      <combobox-simple
        class="field"
        :label="$t('task_types.fields.dedicated_to')"
        :options="dedicatedToOptions"
        @enter="confirmClicked"
        v-model="form.for_entity"
        v-if="!isEditing"
      />
      <combobox-department
        :label="$t('task_types.fields.department')"
        @enter="confirmClicked"
        v-model="form.department_id"
      />
      <color-field
        class="mt2"
        :label="$t('task_types.fields.color')"
        v-model="form.color"
      />
      <combobox-boolean
        :label="$t('main.archived')"
        @enter="confirmClicked"
        v-model="form.archived"
        v-if="isEditing"
      />
    </form>

    <modal-footer
      :confirm-label="
        isEditing ? $t('main.save_changes') : $t('task_types.create')
      "
      :error-text="$t('task_types.create_error')"
      :is-disabled="isNameTaken"
      :is-loading="isLoading"
      :is-error="isError"
      @confirm="confirmClicked"
      @cancel="$emit('cancel')"
    />
  </base-modal>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { logRequestFailure } from '@/lib/errors'

import BaseModal from '@/components/modals/BaseModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import BooleanField from '@/components/widgets/BooleanField.vue'
import ColorField from '@/components/widgets/ColorField.vue'
import ComboboxBoolean from '@/components/widgets/ComboboxBoolean.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import ComboboxSimple from '@/components/widgets/ComboboxSimple.vue'
import TextField from '@/components/widgets/TextField.vue'
import TextareaField from '@/components/widgets/TextareaField.vue'

const { t } = useI18n()
const store = useStore()

// Props / Emits

const props = defineProps({
  active: { type: Boolean, default: false },
  forEntity: { type: String, default: 'Asset' },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  taskTypeToEdit: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['cancel', 'confirm'])

// State

const form = ref({
  name: '',
  short_name: '',
  description: '',
  color: '#999999',
  for_entity: 'Asset',
  allow_timelog: 'false',
  department_id: null,
  archived: 'false'
})

// Kitsu does not follow the task type updates made elsewhere, so the store
// may hold names changed since: the check reads the list as Zou has it when
// the modal opens, and the store until that list comes.
const reloadedTaskTypes = ref(null)
let lastReload = 0

// Computed

const taskTypes = computed(() => store.getters.taskTypes)
const archivedTaskTypes = computed(() => store.getters.archivedTaskTypes)
const knownTaskTypes = computed(
  () =>
    reloadedTaskTypes.value ?? [...taskTypes.value, ...archivedTaskTypes.value]
)

const isEditing = computed(() => Boolean(props.taskTypeToEdit?.id))

const modalTitle = computed(() =>
  isEditing.value
    ? `${t('task_types.edit_title')} ${props.taskTypeToEdit.name}`
    : t('task_types.new_task_type')
)

const dedicatedToOptions = computed(() => [
  { label: t('assets.title'), value: 'Asset' },
  { label: t('shots.title'), value: 'Shot' },
  { label: t('sequences.title'), value: 'Sequence' },
  { label: t('episodes.title'), value: 'Episode' },
  { label: t('edits.title'), value: 'Edit' }
])

// Zou refuses a name another task type holds, whatever its entity, archived
// ones included, compared regardless of case. As in Zou, an edit is checked
// only when it changes the name the task type holds now: a task type with a
// legacy case twin stays editable.
const nameTwin = computed(() => {
  const name = form.value.name
  const id = props.taskTypeToEdit?.id
  const heldName =
    knownTaskTypes.value.find(taskType => taskType.id === id)?.name ??
    props.taskTypeToEdit?.name
  if (!name || (isEditing.value && name === heldName)) {
    return null
  }
  const lowerName = name.toLowerCase()
  return (
    knownTaskTypes.value.find(
      taskType =>
        taskType.id !== id && taskType.name?.toLowerCase() === lowerName
    ) ?? null
  )
})

const isNameTaken = computed(() => nameTwin.value !== null)

// The For field offers no concept, but a concept task type can hold the name.
const nameError = computed(() => {
  const twin = nameTwin.value
  if (!twin) return ''
  const entity =
    twin.for_entity === 'Concept'
      ? t('concepts.title')
      : (dedicatedToOptions.value.find(
          option => option.value === twin.for_entity
        )?.label ?? twin.for_entity)
  const params = { entity, name: twin.name }
  return twin.archived
    ? t('task_types.name_taken_archived', params)
    : t('task_types.name_taken', params)
})

// Functions

// The answer of an earlier opening is dropped: it may come last.
const reloadTaskTypes = () => {
  const reload = ++lastReload
  reloadedTaskTypes.value = null
  store
    .dispatch('getTaskTypes')
    .then(list => {
      if (reload === lastReload) reloadedTaskTypes.value = list
    })
    .catch(logRequestFailure)
}

const newPriority = forEntity =>
  taskTypes.value.filter(taskType => taskType.for_entity === forEntity).length +
  1

const confirmClicked = () => {
  if (isNameTaken.value) return
  if (!isEditing.value) {
    form.value.priority = newPriority(form.value.for_entity)
  }
  emit('confirm', form.value)
}

// Watchers

watch(
  () => props.active,
  () => {
    if (props.active) {
      reloadTaskTypes()
    }
    if (props.taskTypeToEdit?.id) {
      form.value = {
        name: props.taskTypeToEdit.name,
        short_name: props.taskTypeToEdit.short_name,
        description: props.taskTypeToEdit.description,
        color: props.taskTypeToEdit.color,
        for_entity: props.taskTypeToEdit.for_entity || 'Asset',
        allow_timelog: String(props.taskTypeToEdit.allow_timelog === true),
        department_id: props.taskTypeToEdit.department_id,
        archived: String(props.taskTypeToEdit.archived === true)
      }
    } else {
      form.value = {
        name: '',
        short_name: '',
        description: '',
        color: '#999999',
        for_entity: props.forEntity,
        allow_timelog: 'false',
        department_id: null,
        archived: 'false'
      }
    }
    nextTick(() => {
      form.value.for_entity = props.forEntity
    })
  }
)
</script>
