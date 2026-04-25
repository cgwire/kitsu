<template>
  <div class="metadata-input" :class="metadataInputClass">
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
    <div class="metadata-value selectable" v-else>
      {{ getMetadataFieldValue(descriptor, entity) }}
    </div>
  </div>
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
    },

    metadataInputClass() {
      return {
        'is-boolean': this.descriptor.data_type === 'boolean',
        'is-checklist':
          this.descriptor.data_type === 'checklist' &&
          this.getDescriptorChecklistValues(this.descriptor).length,
        'is-list': this.descriptor.data_type === 'list',
        'is-taglist': this.descriptor.data_type === 'taglist'
      }
    }
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
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
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
  z-index: 100;

  &[type='checkbox'] {
    display: block;
    flex: none;
    height: 1.15rem;
    margin: 0;
    min-height: 0;
    padding: 0;
    width: 1.15rem;
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
