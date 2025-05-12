<template>
  <!-- text input -->
  <input
    class="input-editor"
    :readonly="!isEditable"
    @input="event => onMetadataFieldChanged(entity, descriptor, event)"
    @keyup.ctrl="event => onInputKeyUp(event, indexes.i, indexes.j)"
    :value="getMetadataFieldValue(descriptor, entity)"
    v-if="!descriptor.data_type || descriptor.data_type === 'string'"
  />
  <!-- number input -->
  <input
    class="input-editor"
    :readonly="!isEditable"
    type="number"
    step="any"
    @keydown="onNumberFieldKeyDown"
    @input="event => onMetadataFieldChanged(entity, descriptor, event)"
    @keyup.ctrl="event => onInputKeyUp(event, indexes.i, indexes.j)"
    :value="getMetadataFieldValue(descriptor, entity)"
    v-else-if="descriptor.data_type === 'number'"
  />
  <!-- boolean input -->
  <input
    class="input-editor"
    :disabled="!isEditable"
    @input="event => onMetadataFieldChanged(entity, descriptor, event)"
    @keyup.ctrl="event => onInputKeyUp(event, indexes.i, indexes.j)"
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
      @keyup.ctrl="event => onInputKeyUp(event, indexes.i, indexes.j)"
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
  <span class="metadata-value selectable" v-else>
    {{ getMetadataFieldValue(descriptor, entity) }}
  </span>
</template>

<script>
import { mapGetters } from 'vuex'

import { descriptorMixin } from '@/components/mixins/descriptors'
import { domMixin } from '@/components/mixins/dom'
import { entityListMixin } from '@/components/mixins/entity_list'

import ComboboxTag from '@/components/widgets/ComboboxTag.vue'

export default {
  name: 'metadata-input',

  mixins: [descriptorMixin, domMixin, entityListMixin],

  components: {
    ComboboxTag
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
    indexes: {
      type: Object,
      required: true
    }
  },

  computed: {
    ...mapGetters(['isCurrentUserManager', 'isCurrentUserSupervisor', 'user']),

    isEditable() {
      return (
        this.isCurrentUserManager ||
        this.isSupervisorInDepartments(this.descriptor.departments)
      )
    }
  }
}
</script>

<style lang="scss" scoped>
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
  color: $grey-strong;
  height: 100%;
  padding: 0.5rem;
  width: 100%;
  background: transparent;
  border: 1px solid transparent;
  text-overflow: ellipsis;
  overflow: hidden;
  z-index: 100;

  &[type='checkbox'] {
    display: block;
    width: initial;
    height: initial;
    margin: auto;
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
  color: $grey-strong;
  margin: 0;
  height: 100%;
  width: 100%;
  border: 1px solid transparent;

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
    color: $grey-strong;
    height: 100%;
    width: 100%;
    background: transparent;
    border-radius: 0;
    border: 1px solid transparent;

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
  display: inline-block;
  max-width: 100%;
  padding: 0.8rem;
  overflow: auto;
  white-space: nowrap;
}
</style>
