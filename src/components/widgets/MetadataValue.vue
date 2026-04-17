<template>
  <div
    class="checklist-readonly"
    v-if="descriptor.data_type === 'checklist' && checklistOptions.length"
  >
    <div
      class="checkbox-wrapper"
      :key="`${descriptor.id}-${i}`"
      v-for="(option, i) in checklistOptions"
    >
      <input type="checkbox" :checked="checklistValues[option.text]" disabled />
      <label class="checkbox-label">
        <span>{{ option.text }}</span>
      </label>
    </div>
  </div>
  <span v-else>{{ rawValue }}</span>
</template>

<script setup>
import { computed } from 'vue'

import { descriptorMixin } from '@/components/mixins/descriptors'

const props = defineProps({
  descriptor: { type: Object, required: true },
  entity: { type: Object, required: true }
})

const { getDescriptorChecklistValues, getMetadataChecklistValues } =
  descriptorMixin.methods

const getMetadataFieldValue = (descriptor, entity) => {
  if (
    entity?.data &&
    descriptor.field_name in entity.data &&
    entity.data[descriptor.field_name] != null
  ) {
    return entity.data[descriptor.field_name]
  }
  return ''
}

const checklistOptions = computed(() =>
  getDescriptorChecklistValues(props.descriptor)
)

const checklistValues = computed(() =>
  getMetadataChecklistValues.call(
    { getMetadataFieldValue, getDescriptorChecklistValues },
    props.descriptor,
    props.entity
  )
)

const rawValue = computed(() =>
  getMetadataFieldValue(props.descriptor, props.entity)
)
</script>

<style lang="scss" scoped>
.checkbox-wrapper {
  align-items: center;
  display: flex;
  white-space: nowrap;
}

.checkbox-label {
  display: inline-flex;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  position: relative;
  white-space: normal;
}
</style>
