<template>
  <div
    :class="{
      modal: true,
      'is-active': active
    }"
  >
    <div class="modal-background" @click="$emit('cancel')"></div>

    <div class="modal-content">
      <div class="box content">
        <h1 class="title">
          {{
            isEditing
              ? $t('productions.metadata.edit_title')
              : $t('productions.metadata.title')
          }}
        </h1>

        <p
          class="explanation mb1"
          v-if="!isEditing && entityType === 'Project'"
        >
          {{ $t('productions.metadata.applies_to_all_projects') }}
        </p>

        <text-field
          ref="nameField"
          :label="$t('assets.fields.name')"
          v-model.trim="form.name"
          @enter="confirm"
        />

        <combobox
          :label="$t('assets.fields.type')"
          v-model="form.data_type"
          :options="typeOptions"
          @enter="confirm"
        />

        <div v-if="['list', 'taglist'].includes(form.data_type)">
          <p class="strong">
            {{ $t('productions.metadata.available_values') }}
          </p>

          <div
            ref="valueList"
            class="choice-value-wrapper mb1"
            v-if="form.values.length"
          >
            <p class="choice-value" :key="value" v-for="value in form.values">
              <span>{{ value }}</span>
              <span
                class="remove-button pull-right"
                @click="removeValue(value)"
              >
                x
              </span>
            </p>
          </div>
          <div v-else>
            {{ $t('productions.metadata.add_new_values') }}
          </div>

          <text-field
            v-model.trim="valueToAdd"
            :button-label="$t('main.add')"
            @enter="addValue"
          />
        </div>

        <div v-if="form.data_type === 'checklist'">
          <p class="strong">
            {{ $t('productions.metadata.checklist') }}
          </p>
          <div class="checklist-wrapper">
            <checklist
              :checklist="checklist"
              @add-item="onAddChecklistItem"
              @remove-task="removeTask"
              v-if="checklist.length"
            />
            <button-simple
              :class="{
                button: true,
                active: checklist.length !== 0
              }"
              icon="plus"
              :title="$t('comments.add_checklist')"
              @click="addChecklistEntry(-1)"
            />
          </div>
        </div>

        <div
          class="departments mb2"
          v-if="form.departments.length || selectableDepartments.length"
        >
          <label class="label">
            {{ $t('people.fields.departments') }}
          </label>
          <div
            class="department-element mb1"
            :key="departmentId"
            @click="removeDepartment(departmentId)"
            v-for="departmentId in form.departments"
          >
            <department-name :department="departmentMap.get(departmentId)" />
          </div>
          <div class="flexrow" v-if="selectableDepartments.length">
            <combobox-department
              class="flexrow-item"
              :selectable-departments="selectableDepartments"
              :max-height-select-input="160"
              v-model="selectedDepartment"
            />
            <button
              class="button is-success flexrow-item"
              :class="{
                'is-disabled': selectedDepartment === null
              }"
              @click="addDepartment"
            >
              {{ $t('main.add') }}
            </button>
          </div>
        </div>

        <combobox-boolean
          ref="hiddenField"
          :label="$t('assets.fields.hidden_from_client')"
          v-model="form.for_client"
          @enter="confirm"
        />

        <modal-footer
          :error-text="$t('productions.metadata.error')"
          :is-error="isError"
          :is-loading="isLoading"
          :is-disabled="!isFormFilled"
          @confirm="confirm"
          @cancel="$emit('cancel')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, toRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { useModal } from '@/composables/modal'
import { getDescriptorChecklistValues } from '@/lib/descriptors'
import { remove } from '@/lib/models'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
// eslint-disable-next-line no-unused-vars
import Checklist from '@/components/widgets/Checklist.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxBoolean from '@/components/widgets/ComboboxBoolean.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import DepartmentName from '@/components/widgets/DepartmentName.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import TextField from '@/components/widgets/TextField.vue'

const SIMPLE_TYPES = ['string', 'number', 'boolean']
const VALUE_LIST_TYPES = ['list', 'taglist']

const props = defineProps({
  active: { type: Boolean, default: false },
  descriptorToEdit: { type: Object, default: () => ({}) },
  entityType: { type: String, default: 'Asset' },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false }
})

const emit = defineEmits(['cancel', 'confirm'])

const { t } = useI18n()
const store = useStore()

useModal(toRef(props, 'active'), emit)

// State

const nameField = ref(null)
const valueList = ref(null)

const form = ref({
  name: '',
  data_type: 'string',
  for_client: 'false',
  values: [],
  departments: []
})
const valueToAdd = ref('')
const checklist = ref([])
const selectedDepartment = ref(null)

// Computed

const typeOptions = computed(() => [
  { label: t('productions.metadata.string'), value: 'string' },
  { label: t('productions.metadata.number'), value: 'number' },
  { label: t('productions.metadata.boolean'), value: 'boolean' },
  { label: t('productions.metadata.choices'), value: 'list' },
  { label: t('productions.metadata.tags'), value: 'taglist' },
  { label: t('productions.metadata.checklist'), value: 'checklist' }
])

const currentProduction = computed(() => store.getters.currentProduction)
const departmentMap = computed(() => store.getters.departmentMap)
const isCurrentUserSupervisor = computed(
  () => store.getters.isCurrentUserSupervisor
)
const taskTypeMap = computed(() => store.getters.taskTypeMap)
const user = computed(() => store.getters.user)

const isEditing = computed(() => Boolean(props.descriptorToEdit?.id))

const selectableDepartments = computed(() => {
  if (!currentProduction.value) return []

  let departments = currentProduction.value.task_types
    .map(taskTypeId => {
      const taskType = taskTypeMap.value.get(taskTypeId)
      return taskType && taskType.for_entity === props.entityType
        ? departmentMap.value.get(taskType.department_id)
        : false
    })
    .filter(
      (department, index, self) =>
        department &&
        self.indexOf(department) === index &&
        !form.value.departments.includes(department.id)
    )
  if (isCurrentUserSupervisor.value && user.value.departments.length > 0) {
    departments = departments.filter(department =>
      user.value.departments.includes(department.id)
    )
  }
  return departments
})

const isFormFilled = computed(() => {
  const dataTypeOk =
    SIMPLE_TYPES.includes(form.value.data_type) ||
    (VALUE_LIST_TYPES.includes(form.value.data_type) &&
      form.value.values.length) ||
    (form.value.data_type === 'checklist' && checklist.value?.[0]?.text)
  const supervisorDeptOk =
    !isCurrentUserSupervisor.value ||
    !user.value.departments.length ||
    form.value.departments.length ||
    (props.entityType === 'Project' && selectableDepartments.value.length === 0)
  return form.value.name.length && dataTypeOk && supervisorDeptOk
})

// Functions

const reset = () => {
  if (isEditing.value) {
    form.value = {
      id: props.descriptorToEdit.id,
      name: props.descriptorToEdit.name,
      data_type: props.descriptorToEdit.data_type,
      for_client: props.descriptorToEdit.for_client ? 'true' : 'false',
      values: [...props.descriptorToEdit.choices],
      departments: [...props.descriptorToEdit.departments]
    }
    checklist.value = getDescriptorChecklistValues(props.descriptorToEdit)
    if (form.value.data_type === 'taglist') {
      form.value.values.sort()
    }
  } else {
    form.value = {
      name: '',
      data_type: 'string',
      for_client: 'false',
      values: [],
      departments: []
    }
    checklist.value = []
  }
  valueToAdd.value = ''
}

const addValue = value => {
  if (!value || form.value.values.includes(value)) return value
  form.value.values.push(value)
  if (form.value.data_type === 'taglist') {
    form.value.values.sort()
  }
  valueToAdd.value = ''
  nextTick(() => {
    if (!valueList.value) return
    const newValueIndex = form.value.values.indexOf(value)
    valueList.value.scrollTop =
      (valueList.value.scrollHeight / form.value.values.length) * newValueIndex
  })
  return value
}

const removeValue = valueToRemove => {
  form.value.values = remove(form.value.values, valueToRemove)
}

const addDepartment = () => {
  form.value.departments.push(selectedDepartment.value)
  selectedDepartment.value = null
}

const removeDepartment = idToRemove => {
  const departmentIndex = form.value.departments.indexOf(idToRemove)
  if (departmentIndex >= 0) {
    form.value.departments.splice(departmentIndex, 1)
  }
}

const addChecklistEntry = index => {
  if (index === -1 || index === checklist.value.length - 1) {
    checklist.value.push({ text: '', checked: false })
  }
}

const onAddChecklistItem = item => {
  delete item.index
  checklist.value.push(item)
}

const removeTask = entry => {
  checklist.value = remove(checklist.value, entry)
}

const confirm = () => {
  if (SIMPLE_TYPES.includes(form.value.data_type)) {
    form.value.values = []
  } else if (form.value.data_type === 'checklist') {
    form.value.values = checklist.value
      .filter(Boolean)
      .map(x => (x.checked ? '[x] ' : '[ ] ') + x.text)
  }
  emit('confirm', form.value)
}

// Watchers

watch(
  () => props.active,
  isActive => {
    if (isActive) {
      reset()
      nextTick(() => nameField.value?.focus())
    }
  }
)

// Lifecycle

onMounted(reset)
</script>

<style lang="scss" scoped>
.dark .remove-button:hover {
  background: $grey-strong;
}

.modal-content .box p.text {
  margin-bottom: 1em;
}

.error {
  margin-top: 1em;
}

.description {
  margin-bottom: 1em;
}

.choice-value-wrapper {
  max-height: 120px;
  overflow-y: auto;
}

.content .choice-value {
  border: 1px solid var(--border);
  border-bottom: 0;
  margin: 0;
  padding: 0.5em;
}

.content .choice-value:last-child {
  border-bottom: 1px solid var(--border);
}

.remove-button {
  color: $grey;
  width: 20px;
  text-align: center;
  padding: 0;
  cursor: pointer;
}

.remove-button:hover {
  background: $white-grey;
  border-radius: 50%;
}

.department-element {
  display: inline-block;
  margin-right: 0.2em;
  cursor: pointer;
}

.checklist-wrapper {
  margin-bottom: 1em;
}

.checklist-wrapper .button {
  margin: 0.5em 0.2em;
}
</style>
