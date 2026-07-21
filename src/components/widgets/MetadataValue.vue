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
  <!-- long text: keep line breaks -->
  <span class="pre-wrap" v-else-if="descriptor.data_type === 'textarea'">
    {{ rawValue }}
  </span>
  <!-- url: clickable link -->
  <a
    :href="rawValue"
    target="_blank"
    rel="noopener noreferrer"
    v-else-if="descriptor.data_type === 'url' && rawValue"
  >
    {{ rawValue }}
  </a>
  <!-- person: avatar + name -->
  <span class="person" v-else-if="descriptor.data_type === 'person'">
    <template v-if="person">
      <people-avatar
        :person="person"
        :size="22"
        :font-size="11"
        :is-link="false"
      />
      <span class="ml05">{{ person.name }}</span>
    </template>
  </span>
  <!-- date: honour the date format option -->
  <span v-else-if="descriptor.data_type === 'date'">
    {{ formatDisplayDate(rawValue) }}
  </span>
  <span v-else>{{ rawValue }}</span>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

import { useFormat } from '@/composables/format'
import { descriptorMixin } from '@/components/mixins/descriptors'

import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'

const props = defineProps({
  descriptor: { type: Object, required: true },
  entity: { type: Object, required: true }
})

const store = useStore()
const { formatDisplayDate } = useFormat()

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

const person = computed(
  () => store.getters.personMap.get(rawValue.value) || null
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

.pre-wrap {
  white-space: pre-wrap;
}

.person {
  align-items: center;
  display: inline-flex;
}
</style>
