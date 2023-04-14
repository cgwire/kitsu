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
      {{ descriptor.name }}</label
    >
    <div
      class="checkbox-wrapper"
      v-for="(option, i) in descriptorChecklistValues"
      :key="`${descriptor.id}-${i}-${option.text}-wrapper`"
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
    :label="descriptor.name"
    :options="getDescriptorChoicesOptions(descriptor)"
    :value="value"
    @enter="onEnter"
    @input="updateValue"
  />
  <!-- boolean field -->
  <combobox-boolean
    :label="descriptor.name"
    :value="value === 'true' ? value : 'false'"
    @enter="onEnter"
    @input="updateValue"
    v-else-if="descriptor.data_type === 'boolean'"
  />
  <!-- number or text field-->
  <text-field
    :label="descriptor.name"
    :type="descriptor.data_type"
    :value="value"
    :min="null"
    @enter="onEnter"
    @input="updateValue"
    v-else
  />
</template>

<script>
import { mapGetters } from 'vuex'
import { descriptorMixin } from '@/components/mixins/descriptors'
import { entityListMixin } from '@/components/mixins/entity_list'

import Combobox from '@/components/widgets/Combobox'
import ComboboxBoolean from '@/components/widgets/ComboboxBoolean'
import TextField from '@/components/widgets/TextField'

export default {
  name: 'MetadataField',
  mixins: [entityListMixin, descriptorMixin],

  components: {
    Combobox,
    ComboboxBoolean,
    TextField
  },

  props: {
    entity: {
      type: Object,
      required: true
    },
    descriptor: {
      type: Object,
      required: true
    },
    value: {
      type: String,
      default: '',
      required: true
    }
  },

  computed: {
    ...mapGetters(['isCurrentUserManager']),

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
      this.$emit('input', value)
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
