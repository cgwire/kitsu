<template>
<div
  :id="entity.id"
  :class="{
    shot: true,
    selected: selected,
    unselectable: true,
    stdby: entity.is_casting_standby,
    'text-mode': textMode
  }"
  @click="onClicked($event)"
>
  <div class="flexrow">
    <span class="flexrow flexrow-item">
      <entity-thumbnail
        :entity="{}"
        :height="30"
        :empty-width="40"
        :empty-height="30"
        :preview-file-id="previewFileId"
      />
    </span>
    <div class="shot-name flexrow-item">
      {{ name }}
    </div>
    <div class="standby-column flexrow-item">
      <input
        type="checkbox"
        :checked="entity.is_casting_standby"
        :disabled="!isCurrentUserManager"
        :style="[isCurrentUserManager ? {cursor: 'pointer'} : {cursor: 'auto'}]"
        @input="event => onStandbyChanged(entity, event)"
      />
    </div>
    <div
      class="description-column flexrow-item"
      v-if="!isShowInfosBreakdown"
    >
      <div
        class="tooltip-text"
        v-html="compileMarkdown(entity.description)"
        v-if="readOnly"
      >
      </div>
      <textarea
        class="tooltip-editor"
        ref="text"
        :value="entity.description"
        @input="event => onDescriptionChanged(entity, event)"
        v-else
      >
      </textarea>
    </div>
    <div
      class="metadata-descriptor flexrow-item"
      :title="entity.data ? entity.data[descriptor.field_name] : ''"
      :key="'desc' + entity.id + '-' + descriptor.id"
      v-for="(descriptor, j) in visibleMetadataDescriptors"
      v-if="!isShowInfosBreakdown"
    >
      <input
        class="input-editor"
        @input="event => onMetadataFieldChanged(entity, descriptor, event)"
        @keyup.ctrl="event => onInputKeyUp(event, getIndex(i, k), j)"
        :value="getMetadataFieldValue(descriptor, entity)"
        v-if="descriptor.choices.length === 0 && (isCurrentUserManager
        || isSupervisorInDepartments(descriptor.departments))"
      />
      <div
        class="metadata-value selectable"
        v-else-if="descriptor.choices.length > 0 && getDescriptorChecklistValues(descriptor).length > 0"
      >
        <p
          v-for="(option, i) in getDescriptorChecklistValues(descriptor)"
          :key="`${entity.id}-${descriptor.id}-${i}-${option.text}-div`"
        >
          <input
            type="checkbox"
            @change="event => onMetadataChecklistChanged(entity, descriptor, option.text, event)"
            :id="`${entity.id}-${descriptor.id}-${i}-${option.text}-input`"
            :checked="getMetadataChecklistValues(descriptor, entity)[option.text]"
            :disabled="!(isCurrentUserManager
              || isSupervisorInDepartments(descriptor.departments))"
            :style="[isCurrentUserManager
              || isSupervisorInDepartments(descriptor.departments) ?
                {cursor: 'pointer'} : {cursor: 'auto'}]"
          />
          <label
            :for="`${entity.id}-${descriptor.id}-${i}-${option.text}-input`"
            :style="[isCurrentUserManager
              || isSupervisorInDepartments(descriptor.departments) ?
                {cursor: 'pointer'} : {cursor: 'auto'}]"
          >
            {{ option.text }}
          </label>
        </p>
      </div>
      <span
        class="select"
        v-else-if="isCurrentUserManager
        || isSupervisorInDepartments(descriptor.departments)"
      >
        <select
          class="select-input"
          @keyup.ctrl="event => onInputKeyUp(event, getIndex(i, k), j)"
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
      <span class="metadata-value selectable" v-else>
        {{ getMetadataFieldValue(descriptor, entity) }}
      </span>
    </div>
    <div
      class="asset-list flexrow-item"
      v-if="isShowInfosBreakdown"
    >
      <div
        class="asset-type-line flexrow"
        :key="typeAssets.length > 0 ? typeAssets[0].asset_type_name : ''"
        v-for="typeAssets in assets"
      >
        <span class="asset-type-name flexrow-item">
          {{ typeAssets.length > 0 ? typeAssets[0].asset_type_name : '' }}
          ({{ typeAssets.reduce((acc, a) => acc + a.nb_occurences, 0) }})
        </span>
        <div class="asset-type-items flexrow-item">
          <asset-block
            class="flexrow-item"
            :key="asset.id"
            :asset="asset"
            :nb-occurences="asset.nb_occurences"
            :read-only="readOnly"
            :text-mode="textMode"
            @edit-label="onEditLabelClicked"
            @remove-one="removeOneAsset"
            @remove-ten="removeTenAssets"
            v-for="asset in typeAssets"
          />
        </div>
      </div>
      <div
        class="asset-type-line flexrow empty mt05 mb05"
        v-if="assets.length === 0"
      >
        {{ $t('breakdown.empty') }}
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { mapGetters } from 'vuex'
import { renderMarkdown } from '@/lib/render'
import { entityListMixin } from '@/components/mixins/entity_list'
import { descriptorMixin } from '@/components/mixins/descriptors'

import AssetBlock from '@/components/pages/breakdown/AssetBlock'
import EntityThumbnail from '@/components/widgets/EntityThumbnail'

export default {
  name: 'shot-line',
  mixins: [
    entityListMixin,
    descriptorMixin
  ],
  components: {
    AssetBlock,
    EntityThumbnail
  },

  props: {
    entity: {
      default: () => {},
      type: Object
    },
    previewFileId: {
      default: '',
      type: String
    },
    selected: {
      default: false,
      type: Boolean
    },
    name: {
      default: '',
      type: String
    },
    assets: {
      default: () => [],
      type: Array
    },
    readOnly: {
      default: false,
      type: Boolean
    },
    textMode: {
      default: false,
      type: Boolean
    },
    metadataDescriptors: {
      default: () => [],
      type: Array
    },
    metadataDisplayHeaders: {
      default: () => {},
      type: Object
    }
  },

  computed: {
    ...mapGetters([
      'isCurrentUserManager',
      'isShowInfosBreakdown'
    ])
  },

  methods: {
    onClicked (event) {
      this.$emit('click', this.entity.id, event)
    },

    onEditLabelClicked (asset, label) {
      this.$emit('edit-label', asset, label, this.entity.id)
    },

    removeOneAsset (assetId, nbOccurences) {
      this.$emit('remove-one', assetId, this.entity.id, nbOccurences)
    },

    removeTenAssets (assetId, nbOccurences) {
      this.$emit('remove-ten', assetId, this.entity.id, nbOccurences)
    },

    onDescriptionChanged (entity, event) {
      this.$emit('description-changed', entity, event.target.value)
    },

    onStandbyChanged (entity, event) {
      this.$emit('standby-changed', entity, event.target.checked)
    },

    compileMarkdown (input) {
      return renderMarkdown(input)
    }
  }
}
</script>
<style lang="scss" scoped>
.dark {
  .asset-type-name {
    color: $light-grey-light;
  }
}

.asset-list {
  border-left: 1px solid $light-grey;
  padding-left: 1em;
  padding-top: 0.5em;
  align-self: stretch;
}

.text-mode .asset-list {
  padding-top: 0em;
}

.asset-type-line:not(:first-child) {
  margin-top: 0.5em;
}

.shot-name {
  width: 100px;
  padding-top: 0;
  flex: 0 0 100px;
  word-break: break-all;
}

.asset-type-name {
  display: flex;
  flex: 0 0 150px;
  align-items: center;
  align-self: flex-start;
  margin-right: 1em;
  width: 150px;
  height: 40px;
  color: $grey-strong;
  text-transform: uppercase;
}

.asset-type-items {
  flex: 1 1 auto;
  display: flex;
  flex-wrap: wrap;
}

.shot {
  font-size: 1.1em;
  padding: 0 .5em 0;
  border-bottom: 1px solid $light-grey;
  cursor: pointer;
}

.shot:hover {
  background: var(--background-selectable);
}

.shot.selected {
  background: var(--background-selected);
}

.empty {
  font-style: italic;
  color: $light-grey;
}

.description-column,
.metadata-descriptor,
.standby-column {
  align-items: center;
  align-self: stretch;
  border-left: 1px solid $light-grey;
  display: flex;
  margin-right: 0;
  padding-top: 0;

  &:last-child {
    border-right: 1px solid $light-grey;
  }
}

.metadata-descriptor {
  width: 120px;
}

.description-column {
  width: 150px;
}

.standby-column {
  min-width: 60px;
  max-width: 60px;
  justify-content: center;
}

.tooltip-editor {
  resize: none;
}

div .tooltip-text {
  padding: 0.5rem;
  word-break: break-all;
}

.metadata-value {
  word-break: break-all;
}

.dark {
  .select select,
  div .input-editor,
  div .tooltip-editor {
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

div .input-editor,
div .tooltip-editor {
  color: $grey-strong;
  padding: 0.5rem;
  width: 100%;
  background: transparent;
  border: 1px solid transparent;
  z-index: 100;

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

div .input-editor {
  height: 40px;
}

div .tooltip-editor {
  height: 100%;
}

.metadata-descriptor .select {
  color: $grey-strong;
  margin: 0;
  height: 40px;
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
.description-column .selectable,
.metadata-descriptor .selectable {
  padding: 0.5rem;
}

.stdby {
  background: var(--background-disabled);
}
</style>
