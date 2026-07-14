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
        @select-column="onSelectColumn('edit')"
        @toggle-stick="stickColumnClicked()"
      />

      <table-metadata-header-menu
        ref="headerMetadataMenu"
        :is-edit-allowed="
          isMetadataColumnEditAllowed(lastMetadataHeaderMenuDisplayed)
        "
        :is-sticked="stickedColumns[lastMetadataHeaderMenuDisplayed]"
        @edit-clicked="onEditMetadataClicked()"
        @delete-clicked="onDeleteMetadataClicked()"
        @sort-by-clicked="onSortByMetadataClicked()"
        @toggle-stick="metadataStickColumnClicked($event)"
      />

      <table
        class="datatable"
        :class="{ 'expand-task-types': displaySettings.fullTaskTypeNames }"
      >
        <thead class="datatable-head" id="datatable-edit" v-columns-resizable>
          <tr>
            <th scope="col" class="episode" ref="th-episode" v-if="isTVShow">
              {{ $t('edits.fields.episode') }}
            </th>
            <th
              scope="col"
              class="name edit-name datatable-row-header"
              ref="th-edit"
            >
              <div class="flexrow">
                <span class="flexrow-item">
                  {{ $t('edits.fields.name') }}
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

            <th scope="col" class="resolution" v-if="displaySettings.showInfos">
              {{ $t('shots.fields.resolution') }}
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
            <template v-if="!isLoading">
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
                type="edits"
                is-stick
                @show-header-menu="
                  event => showHeaderMenu(columnId, columnIndexInGrid, event)
                "
                v-for="(
                  columnId, columnIndexInGrid
                ) in stickedDisplayedValidationColumns"
              />
            </template>

            <th
              scope="col"
              class="description selectable"
              v-if="
                !isCurrentUserClient &&
                displaySettings.showInfos &&
                isEditDescription
              "
            >
              {{ $t('edits.fields.description') }}
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
                isEditTime &&
                metadataDisplayHeaders.timeSpent
              "
            >
              {{ $t('edits.fields.time_spent') }}
            </th>
            <th
              scope="col"
              class="estimation"
              :title="$t('main.estimation')"
              ref="th-spent"
              v-if="
                !isCurrentUserClient &&
                displaySettings.showInfos &&
                isEditEstimation &&
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
                type="edits"
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
                  displayedEdits.length > 0 &&
                  !isLoading
                "
              />

              <table-metadata-selector-menu
                :descriptors="editMetadataDescriptors"
                :exclude="{
                  timeSpent: !isEditTime,
                  estimation: !isEditEstimation
                }"
                namespace="edits"
                v-model="metadataDisplayHeaders"
                v-model:is-open="columnSelectorDisplayed"
                v-if="displaySettings.showInfos"
              />

              <button-simple
                class="is-small is-pulled-right mr05"
                icon="down"
                @click="toggleColumnSelector"
                v-if="
                  editMetadataDescriptors.length > 0 &&
                  displaySettings.showInfos
                "
              />
            </th>
          </tr>
        </thead>
        <tbody class="datatable-body">
          <template v-if="!isLoading && isListVisible">
            <!--
              PERF-1 pilot: virtualized rows (@tanstack/vue-virtual). Only
              the rows near the viewport are actually rendered below; these
              two spacer rows reproduce the true scroll height of the
              rows above/below them so the scrollbar and column widths
              behave like a fully-rendered table.
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
              :key="edit.id"
              :ref="el => rowVirtualizer.measureElement(el)"
              :data-index="i"
              :class="{
                canceled: edit.canceled,
                'stripe-even': i % 2 === 0,
                'stripe-odd': i % 2 === 1
              }"
              v-for="{ edit, i } in visibleRows"
            >
              <td class="episode" v-if="isTVShow">
                <div class="flexrow">
                  <input
                    type="checkbox"
                    class="mr1"
                    :checked="selectedEdits.has(edit.id) || null"
                    @input="event => toggleLine(edit, event)"
                    v-if="isCurrentUserManager"
                  />
                  {{
                    episodeMap.get(edit.parent_id)
                      ? episodeMap.get(edit.parent_id).name
                      : '-'
                  }}
                </div>
              </td>
              <th
                :class="{
                  'datatable-row-header': true,
                  'edit-name': true,
                  name: true,
                  bold: !edit.canceled
                }"
              >
                <div class="flexrow">
                  <input
                    type="checkbox"
                    class="mr1"
                    :checked="selectedEdits.has(edit.id) || null"
                    @input="event => toggleLine(edit, event)"
                    v-if="!isTVShow && isCurrentUserManager"
                  />
                  <entity-thumbnail
                    :entity="edit"
                    :width="displaySettings.bigThumbnails ? 150 : 50"
                    :height="displaySettings.bigThumbnails ? 100 : 33"
                    :empty-width="displaySettings.bigThumbnails ? 150 : 50"
                    :empty-height="displaySettings.bigThumbnails ? 100 : 34"
                  />
                  <router-link
                    tabindex="-1"
                    :title="edit.full_name"
                    :to="editPath(edit.id)"
                    v-if="!isCurrentUserClient"
                  >
                    {{ edit.name }}
                  </router-link>
                  <template v-else>
                    {{ edit.name }}
                  </template>
                </div>
              </th>

              <td class="resolution" v-if="displaySettings.showInfos">
                <input
                  :class="{
                    'input-editor': true,
                    error: !isValidResolution(edit)
                  }"
                  :value="
                    getMetadataFieldValue({ field_name: 'resolution' }, edit)
                  "
                  @input="
                    event =>
                      onMetadataFieldChanged(
                        edit,
                        { field_name: 'resolution' },
                        event
                      )
                  "
                  @keyup.ctrl="
                    event =>
                      onInputKeyUp(event, getIndex(i, k), descriptorLength)
                  "
                  v-if="isCurrentUserManager"
                />
                <span class="metadata-value selectable" v-else>
                  {{
                    getMetadataFieldValue({ field_name: 'resolution' }, edit)
                  }}
                </span>
              </td>

              <!-- Metadata stick -->
              <td
                :ref="`editor-${i}-${j}`"
                class="metadata-descriptor datatable-row-header"
                :title="edit.data ? edit.data[descriptor.field_name] : ''"
                :style="{
                  'z-index': 1000 - i, // Need for combo to be above the next cell
                  left: offsets['editor-' + j]
                    ? `${offsets['editor-' + j]}px`
                    : '0'
                }"
                :key="edit.id + '-' + descriptor.id"
                v-for="(descriptor, j) in stickedVisibleMetadataDescriptors"
              >
                <metadata-input
                  :entity="edit"
                  :descriptor="descriptor"
                  :indexes="{ i, j }"
                  @metadata-changed="$emit('metadata-changed', $event)"
                />
              </td>

              <template v-if="!isLoading">
                <validation-cell
                  :ref="`validation-${i}-${j}`"
                  :key="columnId + '-' + edit.id"
                  :class="{
                    'validation-cell': !hiddenColumns[columnId],
                    'hidden-validation-cell': hiddenColumns[columnId],
                    'datatable-row-header': true
                  }"
                  :contact-sheet="displaySettings.contactSheetMode"
                  :column="taskTypeMap.get(columnId)"
                  :column-y="j"
                  :entity="edit"
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
                  :task-test="taskMap.get(edit.validations.get(columnId))"
                  @select="infos => onTaskSelected(infos, true)"
                  @unselect="infos => onTaskUnselected(infos, true)"
                  v-for="(columnId, j) in stickedDisplayedValidationColumns"
                />
              </template>

              <description-cell
                class="description"
                :entry="edit"
                :editable="isCurrentUserManager"
                @description-changed="
                  value => onDescriptionChanged(edit, value)
                "
                v-if="
                  !isCurrentUserClient &&
                  displaySettings.showInfos &&
                  isEditDescription
                "
              />

              <!-- other Metadata cells -->
              <template v-if="displaySettings.showInfos">
                <td
                  class="metadata-descriptor"
                  :title="edit.data ? edit.data[descriptor.field_name] : ''"
                  :key="edit.id + '-' + descriptor.id"
                  v-for="(
                    descriptor, j
                  ) in nonStickedVisibleMetadataDescriptors"
                >
                  <metadata-input
                    :entity="edit"
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
                  isEditTime &&
                  metadataDisplayHeaders.timeSpent
                "
              >
                {{ formatDuration(edit.timeSpent) }}
              </td>

              <td
                class="estimation selectable"
                v-if="
                  !isCurrentUserClient &&
                  displaySettings.showInfos &&
                  isEditEstimation &&
                  metadataDisplayHeaders.estimation
                "
              >
                {{ formatDuration(edit.estimation) }}
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
                  :key="`${columnId}-${edit.id}`"
                  :column="taskTypeMap.get(columnId)"
                  :entity="edit"
                  :task-test="
                    taskMap.get(
                      edit.validations ? edit.validations.get(columnId) : null
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
                :entry="edit"
                :hide-history="false"
                @delete-clicked="$emit('delete-clicked', edit)"
                @edit-clicked="$emit('edit-clicked', edit)"
                @history-clicked="$emit('edit-history', edit)"
                @restore-clicked="$emit('restore-clicked', edit)"
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
        <img src="../../assets/illustrations/empty_edit.png" alt="" />
      </p>
      <p class="info">{{ $t('edits.empty_list') }}</p>
      <button-simple
        class="level-item big-button"
        :text="$t('edits.new_edits')"
        @click="$emit('add-edits')"
      />
    </div>
    <div
      class="has-text-centered"
      v-if="isEmptyList && isCurrentUserClient && !isLoading"
    >
      <p class="info">
        <img src="../../assets/illustrations/empty_edit.png" alt="" />
      </p>
      <p class="info">{{ $t('edits.empty_list_client') }}</p>
    </div>

    <p class="has-text-centered nb-edits" v-if="!isEmptyList && !isLoading">
      {{ displayedEditsLength }}
      {{ $t('edits.number', displayedEditsLength) }}
      <span v-if="displayedEditsTimeSpent > 0 || displayedEditsEstimation > 0">
        ({{ formatDuration(displayedEditsTimeSpent) }}
        {{
          isDurationInHours
            ? $t(
                'main.hours_spent',
                formatDuration(displayedEditsTimeSpent, false)
              )
            : $t(
                'main.days_spent',
                formatDuration(displayedEditsTimeSpent, false)
              )
        }},
        {{ formatDuration(displayedEditsEstimation) }}
        {{
          isDurationInHours
            ? $t(
                'main.hours_estimated',
                formatDuration(displayedEditsEstimation, false)
              )
            : $t(
                'main.man_days',
                formatDuration(displayedEditsEstimation, false)
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

import preferences from '@/lib/preferences'
import { range } from '@/lib/time'

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

// PERF-1 pilot: row-height estimates per display mode. Heights are meant to
// be fixed within a mode (the assignee-avatar stack is capped via
// maxAssignees below so it can never wrap the row taller);
// rowVirtualizer.measureElement stays in place as a safety net for anything
// still content-driven.
const ROW_HEIGHT_ESTIMATE = 52
const ROW_HEIGHT_ESTIMATE_BIG_THUMBNAILS = 116
const ROW_HEIGHT_ESTIMATE_CONTACT_SHEET = 102

// Cap on assignee avatars per validation cell (rest collapses into "+N"):
// 3 avatars + status tag fit the 150px cell on one line, keeping row
// heights constant for the virtualizer whatever the assignation count.
const MAX_ASSIGNEES_PER_CELL = 3

export default {
  name: 'edit-list',

  mixins: [
    descriptorMixin,
    domMixin,
    formatListMixin,
    entityListMixin,
    selectionListMixin
  ],

  props: {
    displayedEdits: {
      type: Array,
      default: () => []
    },
    displaySettings: {
      type: Object,
      default: () => {}
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

  emits: [
    'add-edits',
    'create-tasks',
    'delete-clicked',
    'edit-clicked',
    'edit-history',
    'metadata-changed',
    'restore-clicked'
    // 'scroll' and 'keep-task-panel-open' come from entityListMixin
  ],

  // PERF-1 pilot: useVirtualizer is a composable, so it needs a setup()
  // hook even though this component is otherwise Options API. `body` is
  // returned so it doubles as `this.$refs.body` for the existing mixin
  // methods (setScrollPosition, onBodyScroll's scrollHeight check, ...)
  // and as the virtualizer's scroll element.
  setup(props) {
    const body = ref(null)
    const rowVirtualizer = useVirtualizer(
      computed(() => ({
        count: props.displayedEdits.length,
        getScrollElement: () => body.value,
        // bigThumbnails first: when combined with contact sheet, the name
        // column's 100px thumbnail + cell padding is the taller of the two.
        estimateSize: () => {
          if (props.displaySettings.bigThumbnails) {
            return ROW_HEIGHT_ESTIMATE_BIG_THUMBNAILS
          }
          if (props.displaySettings.contactSheetMode) {
            return ROW_HEIGHT_ESTIMATE_CONTACT_SHEET
          }
          return ROW_HEIGHT_ESTIMATE
        },
        getItemKey: index => props.displayedEdits[index]?.id ?? index,
        overscan: 10
      }))
    )

    return { body, rowVirtualizer }
  },

  data() {
    return {
      type: 'edit',
      hiddenColumns: {},
      lastHeaderMenuDisplayed: null,
      lastMetadataHeaderMenuDisplayed: null,
      lastHeaderMenuDisplayedIndexInGrid: null,
      lastSelectedEdit: null,
      lastSelection: null,
      metadataDisplayHeaders: {
        estimation: true,
        timeSpent: true
      },
      offsets: {},
      stickedColumns: {}
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
      'edits',
      'episodes',
      'currentProduction',
      'episodeMap',
      'currentEpisode',
      'displayedEditsEstimation',
      'displayedEditsCount',
      'displayedEditsLength',
      'displayedEditsTimeSpent',
      'isCurrentUserAdmin',
      'isCurrentUserManager',
      'isCurrentUserSupervisor',
      'isCurrentUserClient',
      'isSingleEpisode',
      'isEditDescription',
      'isEditEstimation',
      'isEditTime',
      'isTVShow',
      'nbSelectedTasks',
      'selectedEdits',
      'edits',
      'editFilledColumns',
      'editMap',
      'editMetadataDescriptors',
      'editSearchText',
      'editSelectionGrid',
      'selectedTasks',
      'taskMap',
      'taskTypeMap',
      'user'
    ]),

    isEmptyList() {
      return (
        this.displayedEdits.length &&
        this.displayedEdits[0].length === 0 &&
        !this.isLoading &&
        !this.isError &&
        (!this.editSearchText || this.editSearchText.length === 0)
      )
    },

    isEmptyTask() {
      return (
        !this.isEmptyList &&
        !this.isLoading &&
        this.validationColumns &&
        this.validationColumns.length === 0
      )
    },

    isListVisible() {
      return !this.isLoading && !this.isError && this.displayedEditsCount > 0
    },

    displayedValidationColumns() {
      return this.validationColumns.filter(columnId => {
        return (
          this.editFilledColumns[columnId] &&
          (!this.hiddenColumns[columnId] || this.displaySettings.showInfos)
        )
      })
    },

    metadataDescriptors() {
      return this.editMetadataDescriptors
    },

    localStorageStickKey() {
      return `stick-edits-${this.currentProduction?.id}`
    },

    // PERF-1 pilot: row virtualization. Only the rows tanstack decides are
    // near the viewport are ever mounted; everything below reasons in terms
    // of `displayedEdits` indexes (never DOM order), so filtering/sorting/
    // real-time updates keep working exactly as before virtualization.
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

    // { edit, i } pairs for the rows tanstack currently renders, `i` being
    // the row's real index in `displayedEdits` (not its position among the
    // rendered subset) so every existing i-based computation (isSelected,
    // z-index, editor/validation refs, ...) stays correct unchanged.
    visibleRows() {
      return this.virtualRows
        .filter(
          virtualRow => this.displayedEdits[virtualRow.index] !== undefined
        )
        .map(virtualRow => ({
          edit: this.displayedEdits[virtualRow.index],
          i: virtualRow.index
        }))
    },

    maxAssigneesPerCell() {
      return MAX_ASSIGNEES_PER_CELL
    },

    // Spans the spacer rows across every column currently in the header,
    // so they don't leave a jagged one-column-wide row in the table.
    totalColumnsCount() {
      let count = 1 // edit name column, always present
      if (this.isTVShow) count++
      if (this.displaySettings.showInfos) {
        count++ // resolution
        count += this.stickedVisibleMetadataDescriptors.length
        count += this.nonStickedVisibleMetadataDescriptors.length
      }
      if (!this.isLoading) {
        count += this.stickedDisplayedValidationColumns.length
        count += this.nonStickedDisplayedValidationColumns.length
      }
      if (
        !this.isCurrentUserClient &&
        this.displaySettings.showInfos &&
        this.isEditDescription
      ) {
        count++
      }
      if (
        !this.isCurrentUserClient &&
        this.displaySettings.showInfos &&
        this.isEditTime &&
        this.metadataDisplayHeaders.timeSpent
      ) {
        count++
      }
      if (
        !this.isCurrentUserClient &&
        this.displaySettings.showInfos &&
        this.isEditEstimation &&
        this.metadataDisplayHeaders.estimation
      ) {
        count++
      }
      count++ // actions column, always present
      return count
    }
  },

  methods: {
    ...mapActions(['setEditSelection']),

    isSelected(lineIndex, columnIndex) {
      return this.editSelectionGrid.has(`${lineIndex}-${columnIndex}`)
    },

    // Hook for entity_list.js's data-driven shift-rectangle selection.
    entityForRow(lineIndex) {
      return this.displayedEdits[lineIndex]
    },

    toggleLine(edit, event) {
      const selected = event.target.checked
      const editsToSelect = [edit]
      if (selected && this.shiftKeyPressed && this.lastSelectedEdit) {
        const editsFlatten = this.displayedEdits.flat()
        let startEditIndex = editsFlatten.findIndex(
          displayedEdit => displayedEdit.id === this.lastSelectedEdit.id
        )
        let endEditIndex = editsFlatten.findIndex(
          displayedEdit => displayedEdit.id === edit.id
        )
        if (startEditIndex > endEditIndex) {
          ;[startEditIndex, endEditIndex] = [endEditIndex, startEditIndex]
        }
        if (startEditIndex >= 0 && endEditIndex >= 0) {
          range(startEditIndex, endEditIndex).forEach(index => {
            editsToSelect.push(editsFlatten[index])
          })
        }
      }
      if (selected) {
        this.lastSelectedEdit = edit
      }
      editsToSelect.forEach(edit => {
        this.setEditSelection({ edit, selected })
      })
    },

    // PERF-1: no local onBodyScroll anymore. The store now displays the
    // full result at once (rows are virtualized), so the old
    // scroll-to-bottom -> displayMoreEdits wiring is gone and the mixin's
    // onBodyScroll (scroll-position emit only) takes over.

    editPath(editId) {
      return this.getPath('edit', editId)
    },

    getPath(section, editId) {
      const route = {
        name: section,
        params: {
          production_id: this.currentProduction?.id
        }
      }

      if (this.isTVShow && this.currentEpisode) {
        route.name = `episode-${section}`
        route.params.episode_id = this.currentEpisode.id
      }

      if (editId) {
        route.params.edit_id = editId
      }

      return route
    },

    onInputKeyUp(event, i, j) {
      const listWidth = this.visibleMetadataDescriptors.length + 4
      const listHeight = this.displayedEditsCount
      this.keyMetadataNavigation(listWidth, listHeight, i, j, event.key)
      return this.pauseEvent(event)
    },

    toggleStickedColumns(columnId) {
      const sticked = !this.stickedColumns[columnId]
      this.stickedColumns = {
        ...this.stickedColumns,
        [columnId]: sticked
      }
      preferences.setObjectPreference(
        this.localStorageStickKey,
        this.stickedColumns
      )
    },

    stickColumnClicked() {
      this.toggleStickedColumns(this.lastHeaderMenuDisplayed)
      this.showHeaderMenu()
    },

    metadataStickColumnClicked(event) {
      this.toggleStickedColumns(this.lastMetadataHeaderMenuDisplayed)
      this.showMetadataHeaderMenu(this.lastMetadataHeaderMenuDisplayed, event)
    },

    updateOffsets() {
      if (this.isLoading) {
        return
      }
      this.$nextTick(() => {
        let offset = this.$refs['th-edit'].clientWidth
        this.offsets = {}

        if (this.displaySettings.showInfos) {
          for (
            let metadataCol = 0;
            metadataCol < this.stickedVisibleMetadataDescriptors.length;
            metadataCol++
          ) {
            this.offsets[`editor-${metadataCol}`] = offset
            offset += this.$refs[`editor-${metadataCol}`][0].$el.clientWidth
          }
        }
        for (
          let validationCol = 0;
          validationCol < this.stickedDisplayedValidationColumns.length;
          validationCol++
        ) {
          this.offsets[`validation-${validationCol}`] = offset
          offset += this.$refs[`validation-${validationCol}`][0].$el.clientWidth
        }
      })
    }
  },

  watch: {
    displayedEdits() {
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
  },

  mounted() {
    this.stickedColumns =
      preferences.getObjectPreference(this.localStorageStickKey) || {}
  }
}
</script>

<style lang="scss" scoped>
// Firefox scroll anchoring fights windowed updates: when the top spacer
// row resizes it re-anchors the scroll position and produces micro-jumps
// (standard TanStack Virtual mitigation). Scoped: only this virtualized
// wrapper opts out, other datatables keep the default.
.datatable-wrapper {
  overflow-anchor: none;
}

// PERF-1 pilot: spacer rows standing in for the off-screen virtualized
// rows above/below the rendered window (see the datatable-body template).
// Qualified with .datatable-body so it outranks shared.scss's
// `.data-list .datatable-body td` padding by specificity, not by
// stylesheet injection order.
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

.project {
  min-width: 60px;
  width: 60px;
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

.bold {
  font-weight: bold;
}

.name a {
  color: inherit;
}

thead .name.edit-name {
  min-width: 110px;
  width: 110px;
}

.episode {
  min-width: 100px;
  width: 100px;
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

td.name {
  font-size: 1.2em;
}

.canceled {
  text-decoration: line-through;
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

.resolution {
  min-width: 110px;
  max-width: 110px;
  width: 110px;
}

td.resolution {
  height: 3.1rem;
  padding: 0;
}
</style>
