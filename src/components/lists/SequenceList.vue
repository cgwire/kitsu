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
        :is-sticked="stickedColumns[lastMetadataHeaderMenuDisplayed]"
        @edit-clicked="onEditMetadataClicked()"
        @delete-clicked="onDeleteMetadataClicked()"
        @sort-by-clicked="onSortByMetadataClicked()"
        @toggle-stick="metadataStickColumnClicked($event)"
      />

      <table-metadata-header-menu
        ref="headerFieldMenu"
        :is-edit-allowed="false"
        :show-stick="false"
        @sort-by-clicked="onSortByFieldClicked()"
      />

      <table
        class="datatable"
        :class="{ 'expand-task-types': displaySettings.fullTaskTypeNames }"
      >
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
              <sortable-field-header
                field-name="name"
                :label="$t('sequences.fields.name')"
                @show-menu="showFieldHeaderMenu"
              >
                <template #actions>
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
                </template>
              </sortable-field-header>
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
              <sortable-field-header
                field-name="description"
                :label="$t('sequences.fields.description')"
                @show-menu="showFieldHeaderMenu"
              />
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
                v-model:is-open="columnSelectorDisplayed"
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
            <!--
              PERF-1: virtualized rows (@tanstack/vue-virtual). Only the rows
              near the viewport render below, between two spacer rows sized
              to the off-screen rows' total height.
            -->
            <tr class="virtual-spacer-row" v-if="topSpacerHeight > 0">
              <td
                :colspan="totalColumnsCount"
                :style="{ height: `${topSpacerHeight}px` }"
              ></td>
            </tr>
            <tr
              class="datatable-row"
              scope="row"
              :key="sequence.id"
              :ref="el => rowVirtualizer.measureElement(el)"
              :data-index="i"
              :class="{
                canceled: sequence.canceled,
                'stripe-even': i % 2 === 0,
                'stripe-odd': i % 2 === 1
              }"
              v-for="{ sequence, i } in visibleRows"
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
                    v-if="!isCurrentUserClient"
                  >
                    {{ sequence.name }}
                  </router-link>
                  <template v-else>
                    {{ sequence.name }}
                  </template>
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
                  :max-assignees="maxAssigneesPerCell"
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
                  :max-assignees="maxAssigneesPerCell"
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
            <tr class="virtual-spacer-row" v-if="bottomSpacerHeight > 0">
              <td
                :colspan="totalColumnsCount"
                :style="{ height: `${bottomSpacerHeight}px` }"
              ></td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <table-info :is-loading="isLoading" :is-error="isError" big-cells />

    <div
      class="has-text-centered"
      v-if="isEmptyList && !isCurrentUserClient && !isLoading"
    >
      <p class="info">
        <img src="../../assets/illustrations/empty_shot.png" alt="" />
      </p>
      <p class="info">{{ $t('sequences.empty_list_client') }}</p>
    </div>

    <p class="has-text-centered nb-sequences" v-if="!isEmptyList && !isLoading">
      {{ displayedSequencesLength }}
      {{ $t('sequences.number', displayedSequencesLength) }}
      <span
        v-if="
          displayedSequencesTimeSpent > 0 || displayedSequencesEstimation > 0
        "
      >
        ({{ formatDuration(displayedSequencesTimeSpent) }}
        {{
          isDurationInHours
            ? $t(
                'main.hours_spent',
                formatDuration(displayedSequencesTimeSpent, false)
              )
            : $t(
                'main.days_spent',
                formatDuration(displayedSequencesTimeSpent, false)
              )
        }},
        {{ formatDuration(displayedSequencesEstimation) }}
        {{
          isDurationInHours
            ? $t(
                'main.hours_estimated',
                formatDuration(displayedSequencesEstimation, false)
              )
            : $t(
                'main.man_days',
                formatDuration(displayedSequencesEstimation, false)
              )
        }})
      </span>
    </p>
  </div>
</template>

<script>
import { useVirtualizer } from '@tanstack/vue-virtual'
import { computed, ref } from 'vue'
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
import SortableFieldHeader from '@/components/widgets/SortableFieldHeader.vue'
import TableMetadataHeaderMenu from '@/components/widgets/TableMetadataHeaderMenu.vue'
import TableMetadataSelectorMenu from '@/components/widgets/TableMetadataSelectorMenu.vue'
import TableHeaderMenu from '@/components/widgets/TableHeaderMenu.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'
import ValidationCell from '@/components/cells/ValidationCell.vue'
import ValidationHeader from '@/components/cells/ValidationHeader.vue'

// PERF-1: row-height estimates per display mode (same technique as the
// other virtualized entity grids); measureElement corrects the rest.
const ROW_HEIGHT_ESTIMATE = 52
const ROW_HEIGHT_ESTIMATE_BIG_THUMBNAILS = 116
const ROW_HEIGHT_ESTIMATE_CONTACT_SHEET = 102

// Cap on assignee avatars per validation cell (rest collapses into "+N"),
// keeping row heights constant whatever the assignation count.
const MAX_ASSIGNEES_PER_CELL = 3

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

  // PERF-1: virtualized rows, same recipe as the other entity grids. The
  // list is flat (no group headers), so the virtualizer windows directly
  // over displayedSequences. `body` doubles as `this.$refs.body` for the
  // mixin methods and as the virtualizer's scroll element.
  setup(props) {
    const body = ref(null)
    const rowVirtualizer = useVirtualizer(
      computed(() => ({
        count: props.displayedSequences.length,
        getScrollElement: () => body.value,
        estimateSize: () => {
          if (props.displaySettings.bigThumbnails) {
            return ROW_HEIGHT_ESTIMATE_BIG_THUMBNAILS
          }
          if (props.displaySettings.contactSheetMode) {
            return ROW_HEIGHT_ESTIMATE_CONTACT_SHEET
          }
          return ROW_HEIGHT_ESTIMATE
        },
        getItemKey: index => props.displayedSequences[index]?.id ?? index,
        overscan: 10
      }))
    )

    return { body, rowVirtualizer }
  },

  data() {
    return {
      type: 'sequence',
      hiddenColumns: {},
      lastFieldHeaderMenuDisplayed: null,
      lastFieldHeaderMenuLabel: null,
      lastHeaderMenuDisplayed: null,
      lastMetadataHeaderMenuDisplayed: null,
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
    SortableFieldHeader,
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
      return `stick-sequences-${this.currentProduction?.id}`
    },

    // PERF-1: virtualization plumbing (see the EditList pilot).
    virtualRows() {
      return this.rowVirtualizer.getVirtualItems()
    },

    totalRowsSize() {
      return this.rowVirtualizer.getTotalSize()
    },

    topSpacerHeight() {
      return this.virtualRows.length > 0 ? this.virtualRows[0].start : 0
    },

    bottomSpacerHeight() {
      if (this.virtualRows.length === 0) return 0
      const lastRow = this.virtualRows[this.virtualRows.length - 1]
      return this.totalRowsSize - lastRow.end
    },

    // { sequence, i } pairs for the rows tanstack currently renders, `i`
    // being the row's real index in displayedSequences so every i-based
    // computation (isSelected, refs, z-index) stays correct unchanged.
    visibleRows() {
      return this.virtualRows
        .filter(
          virtualRow => this.displayedSequences[virtualRow.index] !== undefined
        )
        .map(virtualRow => ({
          sequence: this.displayedSequences[virtualRow.index],
          i: virtualRow.index
        }))
    },

    maxAssigneesPerCell() {
      return MAX_ASSIGNEES_PER_CELL
    },

    // Spans the spacer rows across every column currently in the header,
    // so they don't leave a jagged one-column-wide row in the table.
    totalColumnsCount() {
      const showInfos = this.displaySettings.showInfos
      let count = 1 // sequence name column, always present
      if (showInfos) {
        count += this.stickedVisibleMetadataDescriptors.length
        count += this.nonStickedVisibleMetadataDescriptors.length
      }
      count += this.stickedDisplayedValidationColumns.length
      if (!this.isLoading) {
        count += this.nonStickedDisplayedValidationColumns.length
      }
      if (
        !this.isCurrentUserClient &&
        showInfos &&
        this.isSequenceDescription
      ) {
        count++
      }
      if (this.isSequenceResolution && showInfos) {
        count++
      }
      if (
        !this.isCurrentUserClient &&
        showInfos &&
        this.isSequenceTime &&
        this.metadataDisplayHeaders.timeSpent
      ) {
        count++
      }
      if (
        !this.isCurrentUserClient &&
        showInfos &&
        this.isSequenceEstimation &&
        this.metadataDisplayHeaders.estimation
      ) {
        count++
      }
      count++ // actions column, always present
      return count
    }
  },

  methods: {
    ...mapActions(['setSequenceSelection']),

    isSelected(lineIndex, columnIndex) {
      return this.sequenceSelectionGrid.has(`${lineIndex}-${columnIndex}`)
    },

    // Hook for entity_list.js's data-driven shift-rectangle selection.
    entityForRow(lineIndex) {
      return this.displayedSequences[lineIndex]
    },

    sequencePath(sequenceId) {
      return this.getPath('sequence', sequenceId)
    },

    getPath(section, sequenceId) {
      const productionId = this.currentProduction?.id
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
  // Firefox scroll anchoring fights windowed updates: when the top spacer
  // row resizes it re-anchors the scroll position and produces micro-jumps
  // (standard TanStack Virtual mitigation). Scoped: only this virtualized
  // wrapper opts out, other datatables keep the default.
  overflow-anchor: none;
}

// PERF-1: spacer rows standing in for the off-screen virtualized rows
// above/below the rendered window. Qualified with .datatable-body so it
// outranks shared.scss's `.data-list .datatable-body td` padding by
// specificity, not by stylesheet injection order.
.datatable-body .virtual-spacer-row td {
  padding: 0;
  border: none;
}

// With virtualization the DOM only holds a window of rows, so the global
// `.datatable-row:nth-child(even)` zebra rules (App.vue) re-anchor on
// whatever row happens to be rendered first and every stripe flips each
// time the window shifts by one row. Stripe from the data index instead
// (stripe-even/stripe-odd bound in the row's :class). Hover is redeclared
// after the stripes so it keeps winning over them.
tr.datatable-row.stripe-even,
tr.datatable-row.stripe-even .datatable-row-header {
  background-color: var(--background);
}

tr.datatable-row.stripe-odd,
tr.datatable-row.stripe-odd .datatable-row-header {
  background-color: var(--background-alt);
}

tr.datatable-row:hover,
tr.datatable-row:hover .datatable-row-header {
  background-color: var(--background-hover);
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

thead .name.sequence-name {
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

.expand-task-types :deep(.validation-cell) {
  width: auto;
  min-width: 150px;
  max-width: none;
}

.expand-task-types :deep(.task-type-name) {
  max-width: none;
  overflow: visible;
  text-overflow: clip;
}

.estimation,
.time-spent {
  min-width: 70px;
  max-width: 70px;
  width: 70px;
}

// Anchored on the th too: with rows virtualized, table auto-layout only
// sees the rendered window, so a td-only min-width stops binding when no
// row is rendered; the thead always is.
th.resolution,
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
  padding: 0.5rem 0.75rem;
}
</style>
