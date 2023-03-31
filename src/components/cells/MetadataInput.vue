<template>
  <!-- number or text input-->
  <input
    class="input-editor"
    @input="event => onMetadataFieldChanged(entity, descriptor, event)"
    @keyup.ctrl="
      event =>
        onInputKeyUp(
          event,
          indexes.k ? getIndex(indexes.i, indexes.k) : indexes.i,
          indexes.j
        )
    "
    :type="descriptor.data_type === 'number' ? 'number' : 'text'"
    :value="getMetadataFieldValue(descriptor, entity)"
    v-if="
      !descriptor.data_type ||
      (['string', 'number'].includes(descriptor.data_type) && isEditable)
    "
  />
  <!-- boolean input -->
  <input
    class="input-editor"
    @input="event => onMetadataFieldChanged(entity, descriptor, event)"
    @keyup.ctrl="
      event =>
        onInputKeyUp(
          event,
          indexes.k ? getIndex(indexes.i, indexes.k) : indexes.i,
          indexes.j
        )
    "
    type="checkbox"
    :checked="getMetadataFieldValue(descriptor, entity) === 'true'"
    v-else-if="descriptor.data_type === 'boolean' && isEditable"
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
      v-for="(option, i) in getDescriptorChecklistValues(descriptor)"
      :key="`${entity.id}-${descriptor.id}-${i}-${option.text}-div`"
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
      >
        {{ option.text }}
      </label>
    </p>
  </div>
  <!-- list input -->
  <span
    class="select"
    v-else-if="descriptor.data_type === 'list' && isEditable"
  >
    <select
      class="select-input"
      @keyup.ctrl="
        event =>
          onInputKeyUp(
            event,
            indexes.k ? getIndex(indexes.i, indexes.k) : indexes.i,
            indexes.j
          )
      "
      @change="event => onMetadataFieldChanged(entity, descriptor, event)"
    >
      <option
        v-for="(option, i) in getDescriptorChoicesOptions(descriptor)"
        :key="`desc-value-${entity.id}-${descriptor.id}-${i}-${option.label}-${option.value}`"
        :value="option.value"
        :selected="getMetadataFieldValue(descriptor, entity) === option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </span>
  <!-- default -->
  <span class="metadata-value selectable" v-else>
    {{ getMetadataFieldValue(descriptor, entity) }}
  </span>
</template>

<script>
import { mapGetters } from 'vuex'
import { descriptorMixin } from '@/components/mixins/descriptors'
import { entityListMixin } from '@/components/mixins/entity_list'

export default {
  name: 'MetadataInput',
  mixins: [entityListMixin, descriptorMixin],
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
    ...mapGetters(['isCurrentUserManager']),
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
  padding: 0.8rem;
}
</style>
