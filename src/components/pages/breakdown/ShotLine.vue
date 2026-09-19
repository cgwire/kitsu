<template>
  <div
    :id="entity.id"
    class="shot unselectable"
    :class="{
      selected,
      stdby: entity ? entity.is_casting_standby : false,
      'text-mode': textMode
    }"
    role="button"
    tabindex="0"
    @click="onClicked($event)"
    @keydown.enter.prevent="onClicked($event)"
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
        :class="{ 'is-editable': isCurrentUserManager }"
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
            descriptor.choices.length === 0 && canEditDescriptor(descriptor)
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
              :disabled="!canEditDescriptor(descriptor)"
              :class="{ 'is-editable': canEditDescriptor(descriptor) }"
            />
            <label
              class="ml05"
              :for="`${entity.id}-${descriptor.id}-${i}-${option.text}-input`"
              :class="{ 'is-editable': canEditDescriptor(descriptor) }"
            >
              {{ option.text }}
            </label>
          </p>
        </div>
        <span class="select" v-else-if="canEditDescriptor(descriptor)">
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
      :class="{ 'is-empty': assetsByAssetTypesMap[assetType] === undefined }"
      :data-label="assetType"
      :key="entity.id + '-' + assetType"
      v-for="assetType in assetTypes"
    >
      <div
        class="asset-type-line flexcolumn"
        v-if="assetsByAssetTypesMap[assetType] !== undefined"
      >
        <div class="flexrow-item mb05">
          {{ nbAssetsForType(assetType) }}
          {{ $t('assets.number', { count: nbAssetsForType(assetType) }) }}
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

<script setup>
/* eslint-disable no-unused-vars */
import { computed } from 'vue'
import { useStore } from 'vuex'

import {
  getDescriptorChecklistValues,
  getDescriptorChoicesOptions,
  getMetadataChecklistValues,
  getMetadataEventValue,
  getMetadataFieldValue
} from '@/composables/descriptors'
import { renderMarkdown } from '@/lib/render'

import AssetBlock from '@/components/pages/breakdown/AssetBlock.vue'
import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'
/* eslint-enable no-unused-vars */

const store = useStore()

// Props / Emits
// --------------------------------------------------------------------------

const props = defineProps({
  entity: { type: Object, default: () => ({}) },
  previewFileId: { type: String, default: '' },
  selection: { type: Object, default: () => ({}) },
  name: { type: String, default: '' },
  assetTypes: { type: Array, default: () => [] },
  readOnly: { type: Boolean, default: false },
  textMode: { type: Boolean, default: false },
  metadataDescriptors: { type: Array, default: () => [] },
  metadataDisplayHeaders: { type: Object, default: () => ({}) },
  bigMode: { type: Boolean, default: false },
  isDescription: { type: Boolean, default: true },
  isSaveError: { type: Boolean, default: false },
  columnWidth: { type: Object, default: () => ({}) }
})

const emit = defineEmits([
  'add-one',
  'click',
  'edit-label',
  'field-changed',
  'metadata-changed',
  'remove-one'
])

// Computed
// --------------------------------------------------------------------------

const isCurrentUserManager = computed(
  () => store.getters.isCurrentUserProductionManager
)
const isCurrentUserSupervisor = computed(
  () => store.getters.isCurrentUserProductionSupervisor
)
const isFrameIn = computed(() => store.getters.isFrameIn)
const isFrameOut = computed(() => store.getters.isFrameOut)
const isFrames = computed(() => store.getters.isFrames)
const isShowInfosBreakdown = computed(() => store.getters.isShowInfosBreakdown)
const user = computed(() => store.getters.user)

// Read from the selection map of the page so that a click renders the lines
// it changes, not the page and its whole list.
const selected = computed(() => Boolean(props.selection[props.entity.id]))

const chunks = computed(() =>
  props.name.split(' / ').filter(chunk => chunk && chunk !== 'undefined')
)

// Read from the store, not passed by the page: casting an asset then renders
// this line alone, where a prop would make the page render its whole list.
const assetsByAssetTypesMap = computed(() =>
  Object.fromEntries(
    (store.getters.castingByType[props.entity.id] || [])
      .filter(assetTypeAssets => assetTypeAssets[0])
      .map(assetTypeAssets => [
        assetTypeAssets[0].asset_type_name,
        assetTypeAssets
      ])
  )
)

const visibleMetadataDescriptors = computed(() =>
  props.metadataDescriptors.filter(descriptor => {
    const header = props.metadataDisplayHeaders[descriptor.field_name]
    return header === undefined || header
  })
)

// Functions
// --------------------------------------------------------------------------

const onClicked = event => emit('click', props.entity.id, event)

const onEditLabelClicked = (asset, label) =>
  emit('edit-label', asset, label, props.entity.id)

const removeOneAsset = assetId => emit('remove-one', assetId)

const addOneAsset = assetId => emit('add-one', assetId)

const emitFieldChanged = (entry, fieldName, value) =>
  emit('field-changed', { entry, fieldName, value })

const onDescriptionChanged = (entity, event) =>
  emitFieldChanged(entity, 'description', event.target.value)

const onNbFramesChanged = (entity, event) =>
  emitFieldChanged(entity, 'nb_frames', event.target.value)

const onStandbyChanged = (entity, event) =>
  emitFieldChanged(entity, 'is_casting_standby', event.target.checked)

const onMetadataFieldChanged = (entry, descriptor, event) => {
  const value = getMetadataEventValue(descriptor, entry, event)
  if (value !== undefined) {
    // If the line is selected, also modify the cells of the other selected
    // lines.
    const selection = [
      store.getters.selectedShots,
      store.getters.selectedAssets,
      store.getters.selectedEdits
    ].find(selected => selected.has(entry.id))
    const entries = selection ? Array.from(selection.values()) : [entry]
    entries.forEach(selectedEntry => {
      emit('metadata-changed', { entry: selectedEntry, descriptor, value })
    })
  }
}

const onMetadataChecklistChanged = (entry, descriptor, option, event) => {
  const values = {
    ...getMetadataChecklistValues(descriptor, entry),
    [option]: event.target.checked
  }
  event.target.value = JSON.stringify(values)
  onMetadataFieldChanged(entry, descriptor, event)
}

const isSupervisorInDepartments = (departments = []) => {
  const departmentIds = Array.isArray(departments) ? departments : [departments]
  return (
    isCurrentUserSupervisor.value &&
    (user.value.departments.length === 0 ||
      user.value.departments.some(department =>
        departmentIds.includes(department)
      ))
  )
}

const canEditDescriptor = descriptor =>
  isCurrentUserManager.value ||
  isSupervisorInDepartments(descriptor.departments)

const nbAssetsForType = assetType =>
  assetsByAssetTypesMap.value[assetType].reduce(
    (acc, asset) => acc + asset.nb_occurences,
    0
  )
</script>

<style lang="scss" scoped>
input[type='checkbox'],
label {
  cursor: auto;

  &.is-editable {
    cursor: pointer;
  }
}

.dark {
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

// Mobile shows one card per entity: the asset type columns stack under the
// name, each one titled from its data-label since the header row is hidden.
@media screen and (max-width: 768px) {
  .standby-column,
  .description-column,
  .frames-column,
  .metadata-descriptor,
  .asset-list.is-empty {
    display: none;
  }

  .shot {
    border: 1px solid var(--border);
    border-radius: 10px;
    flex-direction: column;
    margin-bottom: 0.5em;
    overflow: hidden;
  }

  // The width is set inline from the column resizing preference.
  .sticky {
    border-right: 0;
    max-width: 100% !important;
    min-width: 100% !important;
    position: static;
    width: 100%;
  }

  .shot-name {
    flex: 1;
    max-width: none;
    min-width: 0;
  }

  // The rule sits on the sections, not under the head: a card without casting
  // would double its own bottom border.
  .asset-list {
    border-left: 0;
    border-top: 1px solid var(--border);
    max-width: none;
    min-width: 0;
    padding: 0 0.5em;

    &:last-child {
      border-right: 0;
    }

    &::before {
      color: var(--text-alt);
      content: attr(data-label);
      display: block;
      font-size: 0.8em;
      font-weight: 600;
      letter-spacing: 1px;
      padding-top: 0.5em;
      text-transform: uppercase;
    }
  }

  .asset-type-line {
    padding-top: 0;
  }

  // Light theme only: the tiles get lost on the white card, while the dark
  // alt background is lighter than the card and would wash them out. A
  // standby card keeps its own tint.
  .shot:not(.stdby) .asset-list {
    background: var(--background-alt);

    .dark & {
      background: transparent;
    }
  }
}
</style>
