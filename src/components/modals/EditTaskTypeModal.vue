<template>
  <base-modal :active="active" :title="modalTitle" @cancel="$emit('cancel')">
    <form @submit.prevent>
      <text-field
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
      :error-text="$t('task_types.create_error')"
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

// Computed

const taskTypes = computed(() => store.getters.taskTypes)

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

// Functions

const newPriority = forEntity =>
  taskTypes.value.filter(taskType => taskType.for_entity === forEntity).length +
  1

const confirmClicked = () => {
  if (!isEditing.value) {
    form.value.priority = newPriority(form.value.for_entity)
  }
  emit('confirm', form.value)
}

// Watchers

watch(
  () => props.active,
  () => {
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
