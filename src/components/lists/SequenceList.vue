<template>
  <div class="data-list">
    <div class="datatable-wrapper" ref="body" @scroll.passive="onBodyScroll">
      <table-header-menu
        ref="headerMenu"
        :is-minimized="hiddenColumns[lastHeaderMenuDisplayed]"
        :is-edit-allowed="isCurrentUserManager"
        :is-sticked="stickedColumns[lastHeaderMenuDisplayed]"
        @minimize-clicked="onMinimizeColumnToggled()"
        @delete-all-clicked="onDeleteAllTasksClicked()"
        @sort-by-clicked="onSortByTaskTypeClicked()"
        @select-column="onSelectColumn('sequence')"
        @toggle-stick="stickColumnClicked()"
      />

      <table-metadata-header-menu
        ref="headerMetadataMenu"
        :is-edit-allowed="isCurrentUserManager"
        :is-sticked="stickedColumns[lastMetadaDataHeaderMenuDisplayed]"
        @edit-clicked="onEditMetadataClicked()"
        @delete-clicked="onDeleteMetadataClicked()"
        @sort-by-clicked="onSortByMetadataClicked()"
        @toggle-stick="metadataStickColumnClicked($event)"
      />

      <table class="datatable">
        <thead
          class="datatable-head"
          id="datatable-sequence"
          v-columns-resizable
        >
          <tr>
            <th
              scope="col"
              class="name sequence-name datatable-row-header"
              ref="th-sequence"
            >
              <div class="flexrow">
                <span class="flexrow-item">
                  {{ $t('sequences.fields.name') }}
                </span>
                <button-simple
                  class="is-small flexrow-item"
                  icon="plus"
                  :text="''"
                  @click="onAddMetadataClicked"
                  v-if="
                    (isCurrentUserManager || isCurrentUserSupervisor) &&
                    !isLoading
                  "
                />
              </div>
            </th>
            <template v-if="displaySettings.showInfos">
              <metadata-header
                :ref="`editor-${j}`"
                :key="descriptor.id"
                :descriptor="descriptor"
                :left="
                  offsets['editor-' + j] ? `${offsets['editor-' + j]}px` : '0'
                "
                is-stick
                :style="{
                  'z-index': 1001
                }"
                @show-metadata-header-menu="
                  event => showMetadataHeaderMenu(descriptor.id, event)
                "
                v-for="(descriptor, j) in stickedVisibleMetadataDescriptors"
              />
            </template>
            <validation-header
              :ref="`validation-${columnIndexInGrid}`"
              :key="columnId"
              :hidden-columns="hiddenColumns"
              :column-id="columnId"
              :validation-style="getValidationStyle(columnId)"
              :left="
                offsets['validation-' + columnIndexInGrid]
                  ? `${offsets['validation-' + columnIndexInGrid]}px`
                  : '0'
              "
              type="editor"
              is-stick
              @show-header-menu="
                event => showHeaderMenu(columnId, columnIndexInGrid, event)
              "
              v-for="(
                columnId, columnIndexInGrid
              ) in stickedDisplayedValidationColumns"
            />

            <th
              scope="col"
              class="description selectable"
              v-if="
                !isCurrentUserClient &&
                displaySettings.showInfos &&
                isSequenceDescription
              "
            >
              {{ $t('sequences.fields.description') }}
            </th>

            <th
              scope="col"
              class="resolution"
              v-if="isSequenceResolution && displaySettings.showInfos"
            >
              {{ $t('shots.fields.resolution') }}
            </th>

            <template v-if="displaySettings.showInfos">
              <metadata-header
                :key="descriptor.id"
                :descriptor="descriptor"
                @show-metadata-header-menu="
                  event => showMetadataHeaderMenu(descriptor.id, event)
                "
                v-for="descriptor in nonStickedVisibleMetadataDescriptors"
              />
            </template>
            <th
              scope="col"
              class="time-spent"
              ref="th-spent"
              v-if="
                !isCurrentUserClient &&
                displaySettings.showInfos &&
                isSequenceTime &&
                metadataDisplayHeaders.timeSpent
              "
            >
              {{ $t('sequences.fields.time_spent') }}
            </th>
            <th
              scope="col"
              class="estimation"
              :title="$t('main.estimation')"
              ref="th-spent"
              v-if="
                !isCurrentUserClient &&
                displaySettings.showInfos &&
                isSequenceEstimation &&
                metadataDisplayHeaders.estimation
              "
            >
              {{ $t('main.estimation_short') }}
            </th>

            <template v-if="!isLoading">
              <validation-header
                :key="columnId"
                :hidden-columns="hiddenColumns"
                :column-id="columnId"
                :validation-style="getValidationStyle(columnId)"
                type="sequences"
                @show-header-menu="
                  event => {
                    showHeaderMenu(columnId, columnIndexInGrid, event)
                  }
                "
                v-for="(
                  columnId, columnIndexInGrid
                ) in nonStickedDisplayedValidationColumns"
              />
            </template>
            <th scope="col" class="actions" ref="actionsSection">
              <button-simple
                :class="{
                  'is-small': true,
                  highlighted: isEmptyTask
                }"
                icon="plus"
                :text="$t('tasks.create_tasks')"
                @click="$emit('create-tasks')"
                v-if="
                  isCurrentUserManager &&
                  displayedSequences.length > 0 &&
                  !isLoading
                "
              />

              <table-metadata-selector-menu
                :descriptors="sequenceMetadataDescriptors"
                :exclude="{
                  timeSpent: !isSequenceTime,
                  estimation: !isSequenceEstimation
                }"
                namespace="sequences"
                v-model="metadataDisplayHeaders"
                v-show="columnSelectorDisplayed"
                v-if="displaySettings.showInfos"
              />

              <button-simple
                class="is-small is-pulled-right mr05"
                icon="down"
                @click="toggleColumnSelector"
                v-if="
                  sequenceMetadataDescriptors.length > 0 &&
                  displaySettings.showInfos
                "
              />
            </th>
          </tr>
        </thead>
        <tbody
          class="datatable-body"
          @mousedown="startBrowsing"
          @touchstart="startBrowsing"
        >
          <template v-if="!isLoading && isListVisible">
            <tr
              class="datatable-row"
              scope="row"
              :key="sequence.id"
              :class="{ canceled: sequence.canceled }"
              v-for="(sequence, i) in displayedSequences"
            >
              <th
                :class="{
                  'datatable-row-header': true,
                  'sequence-name': true,
                  name: true,
                  strong: !sequence.canceled
                }"
              >
                <div class="flexrow">
                  <entity-thumbnail
                    :entity="sequence"
                    :width="displaySettings.bigThumbnails ? 150 : 50"
                    :height="displaySettings.bigThumbnails ? 100 : 33"
                    :empty-width="displaySettings.bigThumbnails ? 150 : 50"
                    :empty-height="displaySettings.bigThumbnails ? 100 : 34"
                  />
                  <router-link
                    tabindex="-1"
                    :title="sequence.name"
                    :to="sequencePath(sequence.id)"
                  >
                    {{ sequence.name }}
                  </router-link>
                </div>
              </th>

              <!-- Metadata stick -->
              <template v-if="displaySettings.showInfos && !isLoading">
                <td
                  :ref="`editor-${i}-${j}`"
                  class="metadata-descriptor datatable-row-header"
                  :title="
                    sequence.data ? sequence.data[descriptor.field_name] : ''
                  "
                  :style="{
                    'z-index': 1000 - i, // Need for combo to be above the next cell
                    left: offsets['editor-' + j]
                      ? `${offsets['editor-' + j]}px`
                      : '0'
                  }"
                  :key="sequence.id + '-' + descriptor.id"
                  v-for="(descriptor, j) in stickedVisibleMetadataDescriptors"
                >
                  <metadata-input
                    :entity="sequence"
                    :descriptor="descriptor"
                    @metadata-changed="$emit('metadata-changed', $event)"
                    :indexes="{ i, j }"
                  />
                </td>
              </template>

              <template v-if="!isLoading">
                <validation-cell
                  :ref="`validation-${i}-${j}`"
                  :key="columnId + '-' + sequence.id"
                  :class="{
                    'validation-cell': !hiddenColumns[columnId],
                    'hidden-validation-cell': hiddenColumns[columnId],
                    'datatable-row-header': true
                  }"
                  :contact-sheet="displaySettings.contactSheetMode"
                  :column="taskTypeMap.get(columnId)"
                  :column-y="j"
                  :entity="sequence"
                  :is-assignees="displaySettings.showAssignations"
                  :is-static="true"
                  :left="
                    offsets['validation-' + j]
                      ? `${offsets['validation-' + j]}px`
                      : '0'
                  "
                  :minimized="hiddenColumns[columnId]"
                  :row-x="i"
                  :selected="isSelected(i, j)"
                  :sticked="true"
                  :task-test="taskMap.get(sequence.validations.get(columnId))"
                  @select="infos => onTaskSelected(infos, true)"
                  @unselect="infos => onTaskUnselected(infos, true)"
                  v-for="(columnId, j) in stickedDisplayedValidationColumns"
                />
              </template>

              <description-cell
                class="description"
                :entry="sequence"
                :editable="isCurrentUserManager"
                @description-changed="
                  value => onDescriptionChanged(sequence, value)
                "
                v-if="
                  !isCurrentUserClient &&
                  displaySettings.showInfos &&
                  isSequenceDescription
                "
              />

              <td
                class="resolution"
                v-if="isSequenceResolution && displaySettings.showInfos"
              >
                <input
                  :class="{
                    'input-editor': true,
                    error: !isValidResolution(sequence)
                  }"
                  :value="
                    getMetadataFieldValue(
                      { field_name: 'resolution' },
                      sequence
                    )
                  "
                  @input="
                    event =>
                      onMetadataFieldChanged(
                        sequence,
                        { field_name: 'resolution' },
                        event
                      )
                  "
                  @keyup.ctrl="
                    event =>
                      onInputKeyUp(event, getIndex(i, k), descriptorLength + 3)
                  "
                  v-if="isCurrentUserManager"
                />

                <span class="metadata-value selectable" v-else>
                  {{
                    getMetadataFieldValue(
                      { field_name: 'resolution' },
                      sequence
                    )
                  }}
                </span>
              </td>

              <!-- other Metadata cells -->
              <template v-if="displaySettings.showInfos">
                <td
                  class="metadata-descriptor"
                  :title="
                    sequence.data ? sequence.data[descriptor.field_name] : ''
                  "
                  :key="sequence.id + '-' + descriptor.id"
                  v-for="(
                    descriptor, j
                  ) in nonStickedVisibleMetadataDescriptors"
                >
                  <metadata-input
                    :entity="sequence"
                    :descriptor="descriptor"
                    :indexes="{ i, j }"
                    @metadata-changed="$emit('metadata-changed', $event)"
                  />
                </td>
              </template>

              <td
                class="time-spent selectable"
                v-if="
                  !isCurrentUserClient &&
                  displaySettings.showInfos &&
                  isSequenceTime &&
                  metadataDisplayHeaders.timeSpent
                "
              >
                {{ formatDuration(sequence.timeSpent) }}
              </td>

              <td
                class="estimation selectable"
                v-if="
                  !isCurrentUserClient &&
                  displaySettings.showInfos &&
                  isSequenceEstimation &&
                  metadataDisplayHeaders.estimation
                "
              >
                {{ formatDuration(sequence.estimation) }}
              </td>

              <template v-if="!isLoading">
                <validation-cell
                  :ref="`validation-${i}-${
                    j + stickedDisplayedValidationColumns.length
                  }`"
                  :class="{
                    'validation-cell': !hiddenColumns[columnId],
                    'hidden-validation-cell': hiddenColumns[columnId]
                  }"
                  :contact-sheet="displaySettings.contactSheetMode"
                  :key="`${columnId}-${sequence.id}`"
                  :column="taskTypeMap.get(columnId)"
                  :entity="sequence"
                  :task-test="
                    taskMap.get(
                      sequence.validations
                        ? sequence.validations.get(columnId)
                        : null
                    )
                  "
                  :minimized="hiddenColumns[columnId]"
                  :selected="
                    isSelected(i, j + stickedDisplayedValidationColumns.length)
                  "
                  :row-x="i"
                  :column-y="j"
                  :is-assignees="displaySettings.showAssignations"
                  @select="onTaskSelected"
                  @unselect="onTaskUnselected"
                  v-for="(columnId, j) in nonStickedDisplayedValidationColumns"
                />
              </template>
              <row-actions-cell
                :entry="sequence"
                @delete-clicked="$emit('delete-clicked', sequence)"
                @edit-clicked="$emit('edit-clicked', sequence)"
                v-if="isCurrentUserManager"
              />
              <td class="actions" v-else></td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <table-info :is-loading="isLoading" :is-error="isError" />

    <div
      class="has-text-centered"
      v-if="isEmptyList && !isCurrentUserClient && !isLoading"
    >
      <p class="info">
        <img src="../../assets/illustrations/empty_shot.png" />
      </p>
      <p class="info">{{ $t('sequences.empty_list_client') }}</p>
    </div>

    <p class="has-text-centered nb-sequences" v-if="!isEmptyList && !isLoading">
      {{ displayedSequencesLength }}
      {{ $tc('sequences.number', displayedSequencesLength) }}
      <span
        v-if="
          displayedSequencesTimeSpent > 0 && displayedSequencesEstimation > 0
        "
      >
        ({{ formatDuration(displayedSequencesTimeSpent) }}
        {{ $tc('main.days_spent', displayedSequencesTimeSpent) }},
        {{ formatDuration(displayedSequencesEstimation) }}
        {{ $tc('main.man_days', displayedSequencesEstimation) }})
      </span>
    </p>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import { getEntityPath } from '@/lib/path'
import { descriptorMixin } from '@/components/mixins/descriptors'
import { domMixin } from '@/components/mixins/dom'
import { entityListMixin } from '@/components/mixins/entity_list'
import { formatListMixin } from '@/components/mixins/format'
import { selectionListMixin } from '@/components/mixins/selection'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import DescriptionCell from '@/components/cells/DescriptionCell.vue'
import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'
import MetadataHeader from '@/components/cells/MetadataHeader.vue'
import MetadataInput from '@/components/cells/MetadataInput.vue'
import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import TableMetadataHeaderMenu from '@/components/widgets/TableMetadataHeaderMenu.vue'
import TableMetadataSelectorMenu from '@/components/widgets/TableMetadataSelectorMenu.vue'
import TableHeaderMenu from '@/components/widgets/TableHeaderMenu.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'
import ValidationCell from '@/components/cells/ValidationCell.vue'
import ValidationHeader from '@/components/cells/ValidationHeader.vue'

export default {
  name: 'sequence-list',

  mixins: [
    descriptorMixin,
    domMixin,
    formatListMixin,
    entityListMixin,
    selectionListMixin
  ],

  props: {
    displaySettings: {
      type: Object,
      default: () => ({})
    },
    displayedSequences: {
      type: Array,
      default: () => []
    },
    isError: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    validationColumns: {
      type: Array,
      default: () => []
    },
    departmentFilter: {
      type: Array,
      default: () => []
    }
  },

  emits: ['create-tasks', 'delete-clicked', 'edit-clicked', 'metadata-changed'],

  data() {
    return {
      type: 'sequence',
      hiddenColumns: {},
      lastHeaderMenuDisplayed: null,
      lastMetadaDataHeaderMenuDisplayed: null,
      lastHeaderMenuDisplayedIndexInGrid: null,
      lastSelectedSequence: null,
      lastSelection: null,
      metadataDisplayHeaders: {
        estimation: true,
        timeSpent: true
      },
      offsets: {},
      stickedColumns: {},
      domEvents: [
        ['mousemove', this.onMouseMove],
        ['touchmove', this.onMouseMove],
        ['mouseup', this.stopBrowsing],
        ['mouseleave', this.stopBrowsing],
        ['touchend', this.stopBrowsing],
        ['touchcancel', this.stopBrowsing],
        ['keyup', this.stopBrowsing]
      ]
    }
  },

  components: {
    ButtonSimple,
    DescriptionCell,
    EntityThumbnail,
    MetadataHeader,
    MetadataInput,
    RowActionsCell,
    TableHeaderMenu,
    TableMetadataHeaderMenu,
    TableMetadataSelectorMenu,
    TableInfo,
    ValidationCell,
    ValidationHeader
  },

  computed: {
    ...mapGetters([
      'currentEpisode',
      'currentProduction',
      'currentSequence',
      'displayedSequencesEstimation',
      'displayedSequencesLength',
      'displayedSequencesTimeSpent',
      'displaySettings.bigThumbnails',
      'isCurrentUserAdmin',
      'isCurrentUserManager',
      'isCurrentUserSupervisor',
      'isCurrentUserClient',
      'isSingleSequence',
      'isSequenceDescription',
      'isSequenceEstimation',
      'isSequenceResolution',
      'isSequenceTime',
      'nbSelectedTasks',
      'selectedTasks',
      'sequenceMap',
      'sequenceFilledColumns',
      'sequenceMetadataDescriptors',
      'sequences',
      'sequenceSearchText',
      'sequenceSelectionGrid',
      'sequences',
      'taskMap',
      'taskTypeMap',
      'user'
    ]),

    isEmptyList() {
      return (
        this.displayedSequences &&
        this.displayedSequences.length === 0 &&
        !this.isLoading &&
        !this.isError &&
        (!this.sequenceSearchText || this.sequenceSearchText.length === 0)
      )
    },

    isListVisible() {
      return (
        !this.isLoading && !this.isError && this.displayedSequencesLength > 0
      )
    },

    visibleColumns() {
      let count = 2
      count +=
        !this.isCurrentUserClient &&
        this.displaySettings.showInfos &&
        this.isSequenceDescription
          ? 1
          : 0
      count += this.visibleMetadataDescriptors.length
      count +=
        !this.isCurrentUserClient &&
        this.displaySettings.showInfos &&
        this.isSequenceTime &&
        this.metadataDisplayHeaders.timeSpent
          ? 1
          : 0
      count +=
        !this.isCurrentUserClient &&
        this.displaySettings.showInfos &&
        this.isSequenceEstimation &&
        this.metadataDisplayHeaders.estimation
          ? 1
          : 0
      count += this.displayedValidationColumns.length
      return count
    },

    displayedValidationColumns() {
      return this.validationColumns.filter(columnId => {
        return (
          this.sequenceFilledColumns[columnId] &&
          (!this.hiddenColumns[columnId] || this.displaySettings.showInfos)
        )
      })
    },

    metadataDescriptors() {
      return this.sequenceMetadataDescriptors
    },

    localStorageStickKey() {
      return `stick-sequences-${this.currentProduction.id}`
    }
  },

  methods: {
    ...mapActions(['setSequenceSelection']),

    isSelected(lineIndex, columnIndex) {
      return (
        this.sequenceSelectionGrid[lineIndex] &&
        this.sequenceSelectionGrid[lineIndex][columnIndex]
      )
    },

    sequencePath(sequenceId) {
      return this.getPath('sequence', sequenceId)
    },

    getPath(section, sequenceId) {
      const productionId = this.currentProduction.id
      const episodeId = this.currentEpisode ? this.currentEpisode.id : null
      return getEntityPath(sequenceId, productionId, section, episodeId)
    }
  },

  watch: {
    displayedSequences() {
      this.$options.lineIndex = {}
    },

    validationColumns() {
      this.initHiddenColumns(this.validationColumns, this.hiddenColumns)
    },

    stickedColumns() {
      this.updateOffsets()
    },

    isLoading() {
      this.updateOffsets()
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  th .input-editor,
  td .select select,
  td .input-editor {
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

.datatable-wrapper {
  min-height: 40px;
}

.actions {
  min-width: 160px;
  position: sticky;
}

th.actions {
  padding: 0.4em;
}

.name {
  min-width: 100px;
  width: 100px;
}

.name a {
  color: inherit;
}

.name.sequence-name {
  min-width: 110px;
  width: 110px;
}

.description {
  min-width: 200px;
  max-width: 200px;
  width: 200px;
}

.validation-cell {
  min-width: 150px;
  max-width: 150px;
  width: 150px;
}

.estimation,
.time-spent {
  min-width: 70px;
  max-width: 70px;
  width: 70px;
}

td.resolution {
  min-width: 110px;
  max-width: 110px;
  width: 110px;
}

td.name {
  font-size: 1.2em;
}

span.thumbnail-empty {
  display: block;
  width: 50px;
  height: 30px;
  background: #f3f3f3;
}

.info {
  margin-top: 2em;
}

.info img {
  max-width: 80vh;
}

.datatable-row th.name {
  font-size: 1.1em;
  padding: 6px;
}

.datatable-row-header {
  cursor: pointer;
}

th .input-editor,
td .input-editor {
  color: $grey-strong;
  height: 100%;
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

  &:invalid {
    color: $red;
  }
}

input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
}

// Metadata cell CSS

td.metadata-descriptor {
  height: 3.1rem;
  max-width: 120px;
  padding: 0;
}

td .select {
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
