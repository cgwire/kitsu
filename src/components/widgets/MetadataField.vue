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

<script>
import { mapGetters } from 'vuex'

import { descriptorMixin } from '@/components/mixins/descriptors'

import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxBoolean from '@/components/widgets/ComboboxBoolean.vue'
import ComboboxTag from '@/components/widgets/ComboboxTag.vue'
import TextField from '@/components/widgets/TextField.vue'

export default {
  name: 'metadata-field',

  mixins: [descriptorMixin],

  components: {
    Combobox,
    ComboboxBoolean,
    ComboboxTag,
    TextField
  },

  props: {
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
  },

  emits: ['enter', 'update:modelValue'],

  computed: {
    ...mapGetters(['isCurrentUserManager', 'isCurrentUserSupervisor', 'user']),

    descriptorChecklistValues() {
      return this.getDescriptorChecklistValues(this.descriptor)
    },

    metadataChecklistValues() {
      return this.getMetadataChecklistValues(this.descriptor, this.entity)
    },

    isEditable() {
      return Boolean(
        this.isCurrentUserManager ||
        this.isSupervisorInDepartments(this.descriptor.departments)
      )
    }
  },

  methods: {
    updateValue(value) {
      this.$emit('update:modelValue', value)
    },

    onEnter() {
      this.$emit('enter')
    },

    onMetadataCheckboxChanged(option, value) {
      const values = this.metadataChecklistValues
      values[option] = value
      this.updateValue(JSON.stringify(values))
    }
  }
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
