<template>
  <!-- checklist field -->
  <div
    class="field"
    v-if="
      descriptor.data_type === 'checklist' && descriptorChecklistValues.length
    "
    :key="`${descriptor.id}-checklist-wrapper`"
  >
    <label class="label" :key="`${descriptor.id}-${descriptor.name}`">
      {{ descriptor.name }}
    </label>
    <div
      class="checkbox-wrapper"
      :key="`${descriptor.id}-${i}-${option.text}-wrapper`"
      v-for="(option, i) in descriptorChecklistValues"
    >
      <input
        type="checkbox"
        @change="
          event => onMetadataCheckboxChanged(option.text, event.target.checked)
        "
        :id="`${descriptor.id}-${i}-${option.text}-checkbox`"
        :checked="metadataChecklistValues[option.text]"
        :disabled="!isEditable"
        :style="[isEditable ? { cursor: 'pointer' } : { cursor: 'auto' }]"
      />
      <label
        class="checkbox-label"
        :for="`${descriptor.id}-${i}-${option.text}-checkbox`"
        :style="[isEditable ? { cursor: 'pointer' } : { cursor: 'auto' }]"
      >
        <span>{{ option.text }}</span>
      </label>
    </div>
  </div>
  <!-- list field -->
  <combobox
    v-else-if="descriptor.data_type === 'list'"
    :label="label ?? descriptor.name"
    :options="getDescriptorChoicesOptions(descriptor)"
    :model-value="modelValue"
    @enter="onEnter"
    @update:model-value="updateValue"
  />
  <!-- boolean field -->
  <combobox-boolean
    :label="label ?? descriptor.name"
    :model-value="modelValue === 'true' ? modelValue : 'false'"
    @enter="onEnter"
    @update:model-value="updateValue"
    v-else-if="descriptor.data_type === 'boolean'"
  />
  <!-- tag list field -->
  <combobox-tag
    :label="label ?? descriptor.name"
    :options="getDescriptorChoicesOptions(descriptor, false)"
    :model-value="modelValue"
    @enter="onEnter"
    @update:model-value="updateValue"
    v-else-if="descriptor.data_type === 'taglist'"
  />
  <!-- number or text field-->
  <text-field
    :label="label ?? descriptor.name"
    :type="descriptor.data_type"
    :model-value="modelValue"
    :min="null"
    @enter="onEnter"
    @update:model-value="updateValue"
    v-else
  />
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

import { descriptorMixin } from '@/components/mixins/descriptors'

import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxBoolean from '@/components/widgets/ComboboxBoolean.vue'
import ComboboxTag from '@/components/widgets/ComboboxTag.vue'
import TextField from '@/components/widgets/TextField.vue'

const store = useStore()
const isCurrentUserManager = computed(() => store.getters.isCurrentUserManager)
const isCurrentUserSupervisor = computed(
  () => store.getters.isCurrentUserSupervisor
)
const user = computed(() => store.getters.user)

const props = defineProps({
  descriptor: {
    type: Object,
    required: true
  },
  entity: {
    type: Object,
    required: true
  },
  label: {
    type: String
  },
  modelValue: {
    type: [Number, String, Object],
    default: ''
  }
})

const emit = defineEmits(['enter', 'update:modelValue'])

const {
  getDescriptorChecklistValues,
  getMetadataChecklistValues,
  getDescriptorChoicesOptions,
  isSupervisorInDepartments
} = descriptorMixin.methods

const descriptorChecklistValues = computed(() => {
  return getDescriptorChecklistValues(props.descriptor)
})

const metadataChecklistValues = computed(() => {
  return getMetadataChecklistValues.call(
    { getMetadataFieldValue, getDescriptorChecklistValues },
    props.descriptor,
    props.entity
  )
})

const isEditable = computed(() => {
  return Boolean(
    isCurrentUserManager.value ||
    isSupervisorInDepartments.call(
      {
        isCurrentUserSupervisor: isCurrentUserSupervisor.value,
        user: user.value
      },
      props.descriptor.departments
    )
  )
})

const getMetadataFieldValue = (descriptor, entity) => {
  if (
    entity.data &&
    descriptor.field_name in entity.data &&
    entity.data[descriptor.field_name] != null
  ) {
    return entity.data[descriptor.field_name]
  } else if (
    entity.entity_data &&
    descriptor.field_name in entity.entity_data &&
    entity.entity_data[descriptor.field_name] != null
  ) {
    return entity.entity_data[descriptor.field_name]
  } else {
    return ''
  }
}

const updateValue = value => {
  emit('update:modelValue', value)
}

const onEnter = () => {
  emit('enter')
}

const onMetadataCheckboxChanged = (option, value) => {
  const values = getMetadataChecklistValues.call(
    { getMetadataFieldValue, getDescriptorChecklistValues },
    props.descriptor,
    props.entity
  )
  values[option] = value
  updateValue(JSON.stringify(values))
}
</script>

<style lang="scss" scoped>
.checkbox-wrapper {
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.checkbox-label {
  display: inline-flex;
  position: relative;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  white-space: normal;
  cursor: pointer;
}
</style>
