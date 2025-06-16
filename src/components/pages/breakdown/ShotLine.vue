<template>
  <div
    :id="entity.id"
    class="shot unselectable"
    :class="{
      selected,
      stdby: entity ? entity.is_casting_standby : false,
      'text-mode': textMode
    }"
    @click="onClicked($event)"
  >
    <div
      class="flexrow-item sticky"
      :style="{
        'max-width': columnWidth.name ? columnWidth.name + 'px' : '250px',
        'min-width': columnWidth.name ? columnWidth.name + 'px' : '250px'
      }"
    >
      <p class="error has-text-left info-message" v-if="isSaveError">
        {{ $t('breakdown.save_error') }}
      </p>
      <div class="flexrow">
        <entity-thumbnail
          class="flexrow-item mr1"
          :entity="{}"
          :height="bigMode ? 100 : 60"
          :width="bigMode ? 150 : 90"
          :empty-height="bigMode ? 100 : 60"
          :empty-width="bigMode ? 150 : 90"
          :preview-file-id="previewFileId"
        />
        <div class="shot-name flexrow-item ml05">
          <div v-for="(chunk, index) in chunks" :key="`chunk-${index}`">
            {{ chunk }}
          </div>
        </div>
      </div>
    </div>
    <div class="standby-column flexrow-item" v-if="isShowInfosBreakdown">
      <input
        type="checkbox"
        :checked="entity ? entity.is_casting_standby : false"
        :disabled="!isCurrentUserManager"
        :style="[
          isCurrentUserManager ? { cursor: 'pointer' } : { cursor: 'auto' }
        ]"
        @input="event => onStandbyChanged(entity, event)"
      />
    </div>
    <div
      class="description-column flexrow-item"
      v-if="isShowInfosBreakdown && isDescription"
    >
      <div
        class="tooltip-text"
        v-html="renderMarkdown(entity.description)"
        v-if="readOnly"
      ></div>
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
      class="frames-column flexrow-item"
      v-if="isFrames && isShowInfosBreakdown && metadataDisplayHeaders.frames"
    >
      <input
        class="input-editor"
        step="1"
        :value="entity.nb_frames"
        type="number"
        min="0"
        @input="event => onNbFramesChanged(entity, event)"
        v-if="isCurrentUserManager"
      />
      <span class="metadata-value selectable" v-else>
        {{ entity.nb_frames }}
      </span>
    </div>
    <div
      class="frames-column flexrow-item"
      v-if="isFrameIn && isShowInfosBreakdown && metadataDisplayHeaders.frameIn"
    >
      <input
        class="input-editor"
        step="1"
        type="number"
        min="0"
        :value="getMetadataFieldValue({ field_name: 'frame_in' }, entity)"
        @input="
          event =>
            onMetadataFieldChanged(
              entity,
              { field_name: 'frame_in', data_type: 'number' },
              event
            )
        "
        v-if="isCurrentUserManager"
      />
      <span class="metadata-value selectable" v-else>
        {{ getMetadataFieldValue({ field_name: 'frame_in' }, entity) }}
      </span>
    </div>
    <div
      class="frames-column flexrow-item"
      v-if="
        isFrameOut && isShowInfosBreakdown && metadataDisplayHeaders.frameOut
      "
    >
      <input
        class="input-editor"
        step="1"
        type="number"
        min="0"
        :value="getMetadataFieldValue({ field_name: 'frame_out' }, entity)"
        @input="
          event =>
            onMetadataFieldChanged(
              entity,
              { field_name: 'frame_out', data_type: 'number' },
              event
            )
        "
        v-if="isCurrentUserManager"
      />
      <span class="metadata-value selectable" v-else>
        {{ getMetadataFieldValue({ field_name: 'frame_out' }, entity) }}
      </span>
    </div>

    <template v-if="isShowInfosBreakdown">
      <div
        class="metadata-descriptor flexrow-item"
        :title="entity.data ? entity.data[descriptor.field_name] : ''"
        :key="'desc' + entity.id + '-' + descriptor.id"
        :style="{
          'min-width': columnWidth[descriptor.id]
            ? columnWidth[descriptor.id] + 'px'
            : '110px',
          'max-width': columnWidth[descriptor.id]
            ? columnWidth[descriptor.id] + 'px'
            : '110px'
        }"
        v-for="descriptor in visibleMetadataDescriptors"
      >
        <input
          class="input-editor"
          @input="event => onMetadataFieldChanged(entity, descriptor, event)"
          :value="getMetadataFieldValue(descriptor, entity)"
          v-if="
            descriptor.choices.length === 0 &&
            (isCurrentUserManager ||
              isSupervisorInDepartments(descriptor.departments))
          "
        />
        <div
          class="metadata-value selectable"
          v-else-if="
            descriptor.choices.length > 0 &&
            getDescriptorChecklistValues(descriptor).length > 0
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
                  onMetadataChecklistChanged(
                    entity,
                    descriptor,
                    option.text,
                    event
                  )
              "
              :id="`${entity.id}-${descriptor.id}-${i}-${option.text}-input`"
              :checked="
                getMetadataChecklistValues(descriptor, entity)[option.text]
              "
              :disabled="
                !(
                  isCurrentUserManager ||
                  isSupervisorInDepartments(descriptor.departments)
                )
              "
              :style="[
                isCurrentUserManager ||
                isSupervisorInDepartments(descriptor.departments)
                  ? { cursor: 'pointer' }
                  : { cursor: 'auto' }
              ]"
            />
            <label
              class="ml05"
              :for="`${entity.id}-${descriptor.id}-${i}-${option.text}-input`"
              :style="[
                isCurrentUserManager ||
                isSupervisorInDepartments(descriptor.departments)
                  ? { cursor: 'pointer' }
                  : { cursor: 'auto' }
              ]"
            >
              {{ option.text }}
            </label>
          </p>
        </div>
        <span
          class="select"
          v-else-if="
            isCurrentUserManager ||
            isSupervisorInDepartments(descriptor.departments)
          "
        >
          <select
            class="select-input"
            @change="event => onMetadataFieldChanged(entity, descriptor, event)"
          >
            <option
              :key="`desc-value-${entity.id}-${descriptor.id}-${i}-${option.label}-${option.value}`"
              :value="option.value"
              :selected="
                getMetadataFieldValue(descriptor, entity) === option.value
              "
              v-for="(option, i) in getDescriptorChoicesOptions(descriptor)"
            >
              {{ option.label }}
            </option>
          </select>
        </span>
        <span class="metadata-value selectable" v-else>
          {{ getMetadataFieldValue(descriptor, entity) }}
        </span>
      </div>
    </template>
    <div
      class="asset-list flexrow-item"
      :key="entity.id + '-' + assetType"
      v-for="assetType in assetTypes"
    >
      <div
        class="asset-type-line flexcolumn"
        v-if="assetsByAssetTypesMap[assetType] !== undefined"
      >
        <div class="flexrow-item mb05">
          {{ nbAssetsForType(assetType) }}
          {{ $tc('assets.number', nbAssetsForType(assetType)) }}
        </div>
        <div class="asset-type-items flexrow-item">
          <asset-block
            class="flexrow-item"
            :key="asset.id"
            :asset="asset"
            :active="selected"
            :nb-occurences="asset.nb_occurences"
            :read-only="readOnly"
            :text-mode="textMode"
            :big-mode="bigMode"
            @edit-label="onEditLabelClicked"
            @remove-one="removeOneAsset"
            @add-one="addOneAsset"
            v-for="asset in assetsByAssetTypesMap[assetType]"
          />
        </div>
        <div class="actions filler"></div>
      </div>
      <div class="asset-type-line flexrow empty mt05 mb05" v-else>
        {{ $t('breakdown.empty') }}
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import { renderMarkdown } from '@/lib/render'
import { entityListMixin } from '@/components/mixins/entity_list'
import { descriptorMixin } from '@/components/mixins/descriptors'

import AssetBlock from '@/components/pages/breakdown/AssetBlock.vue'
import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'

export default {
  name: 'shot-line',

  mixins: [entityListMixin, descriptorMixin],

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
    assetTypes: {
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
    },
    bigMode: {
      default: false,
      type: Boolean
    },
    isDescription: {
      default: true,
      type: Boolean
    },
    isSaveError: {
      default: false,
      type: Boolean
    },
    columnWidth: {
      default: () => {},
      type: Object
    }
  },

  emits: ['add-one', 'click', 'edit-label', 'field-changed', 'remove-one'],

  computed: {
    ...mapGetters([
      'assetMap',
      'isCurrentUserManager',
      'isCurrentUserSupervisor',
      'isFrameIn',
      'isFrameOut',
      'isFrames',
      'isShowInfosBreakdown',
      'user'
    ]),

    chunks() {
      const chunks = this.name.split(' / ')
      return chunks.filter(chunk => chunk && chunk !== 'undefined')
    },

    assetsByAssetTypesMap() {
      const assetsByAssetTypes = {}
      this.assets.forEach(assetTypeAssets => {
        if (assetTypeAssets[0]) {
          assetsByAssetTypes[assetTypeAssets[0].asset_type_name] =
            assetTypeAssets
        }
      })
      return assetsByAssetTypes
    }
  },

  methods: {
    onClicked(event) {
      this.$emit('click', this.entity.id, event)
    },

    onEditLabelClicked(asset, label) {
      this.$emit('edit-label', asset, label, this.entity.id)
    },

    removeOneAsset(assetId) {
      this.$emit('remove-one', assetId)
    },

    addOneAsset(assetId) {
      this.$emit('add-one', assetId)
    },

    onDescriptionChanged(entity, event) {
      this.$emit('field-changed', {
        entry: entity,
        fieldName: 'description',
        value: event.target.value
      })
    },

    onNbFramesChanged(entity, event) {
      this.$emit('field-changed', {
        entry: entity,
        fieldName: 'nb_frames',
        value: event.target.value
      })
    },

    onStandbyChanged(entity, event) {
      this.$emit('field-changed', {
        entry: entity,
        fieldName: 'is_casting_standby',
        value: event.target.checked
      })
    },

    renderMarkdown,

    nbAssetsForType(assetType) {
      return this.assetsByAssetTypesMap[assetType].reduce(
        (acc, a) => acc + a.nb_occurences,
        0
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .asset-type-name {
    color: $light-grey-light;
  }

  .asset-list {
    color: $light-grey;
  }

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

.asset-list {
  align-self: stretch;
  border-left: 1px solid $light-grey;
  margin-right: 0;
  min-width: 150px;
  max-width: 150px;
  padding-left: 1em;

  &:last-child {
    border-right: 1px solid $light-grey;
  }
}

.text-mode .asset-list {
  padding-top: 0;
}

.asset-type-line {
  padding-bottom: 0.5em;
  padding-top: 0.5em;
}
.asset-type-line:not(:first-child) {
  margin-top: 0.5em;
}

.shot-name {
  color: var(--text);
  font-weight: bold;
  flex: 0 0 100px;
  min-width: 160px;
  max-width: 160px;
  padding-top: 0;
  word-break: break-all;
}

.asset-type-name {
  display: flex;
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
  border-bottom: 1px solid $light-grey;
  color: $grey-strong;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  padding: 0;

  .empty {
    color: $light-grey;
  }

  &.selected {
    .empty {
      color: $grey;
    }
  }
}

.shot:hover {
  background: var(--background-selectable);
  .sticky {
    background: var(--background-selectable);
  }
}

.shot.selected {
  background: var(--background-selected);
  .sticky {
    background: var(--background-selected);
  }
}

.sticky {
  background: var(--background);
  border-right: 1px solid $light-grey;
  flex: 1;
  left: 0;
  padding: 0.5em;
  position: sticky;
  margin-right: 0;
  width: 300px;
  max-width: 300px;
  z-index: 3;
}

.empty {
  font-style: italic;
  color: $grey;
}

.description-column,
.metadata-descriptor,
.frames-column,
.standby-column {
  align-items: flex-start;
  align-self: stretch;
  border-left: 1px solid $light-grey;
  display: flex;
  margin-right: 0;
  padding-top: 0;

  &:last-child {
    border-right: 1px solid $light-grey;
  }
}

.frames-column {
  justify-content: right;
  .metadata-value {
    padding-right: 0.5em;
    padding-top: 0.5em;
  }
  input {
    text-align: right;
  }
}

.standby-column {
  padding-top: 1em;
  min-width: 60px;
  max-width: 60px;
  justify-content: center;
}

.metadata-descriptor {
  min-width: 119px;
  max-width: 119px;
}

.description-column {
  min-width: 250px;
  max-width: 250px;

  .tooltip-editor {
    font-size: 0.85em;
  }
}

.frames-column {
  min-width: 81px;
  max-width: 81px;
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

div .input-editor,
div .tooltip-editor {
  color: $grey-strong;
  padding: 0.5rem;
  width: 100%;
  background: transparent;
  border: 1px solid transparent;

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

div .input-editor {
  height: 40px;
}

div .tooltip-editor {
  height: 100%;
}

.metadata-descriptor .select {
  color: var(--text);
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
    color: var(--text);
    height: 100%;
    width: 100%;
    background: transparent;
    border-radius: 0;
    border: 1px solid transparent;

    &:focus {
      border: 1px solid $green;
      background: var(--background);
      color: var(--text);
    }

    &:hover {
      background: var(--background);
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
  .sticky {
    background: var(--background-disabled);
  }
}

.thumbnail {
  padding: 5px;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield; /* Firefox */
}
</style>
