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
        @select-column="onSelectColumn('episode')"
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
          id="datatable-episode"
          v-columns-resizable
        >
          <tr>
            <th
              scope="col"
              class="name episode-name datatable-row-header"
              ref="th-episode"
            >
              <sortable-field-header
                field-name="name"
                :label="$t('episodes.fields.name')"
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
                type="editor"
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
                isEpisodeDescription
              "
            >
              <sortable-field-header
                field-name="description"
                :label="$t('episodes.fields.description')"
                @show-menu="showFieldHeaderMenu"
              />
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
                isEpisodeTime &&
                metadataDisplayHeaders.timeSpent
              "
            >
              {{ $t('episodes.fields.time_spent') }}
            </th>
            <th
              scope="col"
              class="estimation"
              :title="$t('main.estimation')"
              ref="th-spent"
              v-if="
                !isCurrentUserClient &&
                displaySettings.showInfos &&
                isEpisodeEstimation &&
                metadataDisplayHeaders.estimation
              "
            >
              {{ $t('main.estimation_short') }}
            </th>
            <th
              scope="col"
              class="status"
              ref="th-status"
              v-if="displaySettings.showInfos && metadataDisplayHeaders.status"
            >
              {{ $t('main.status') }}
            </th>

            <th
              scope="col"
              class="resolution selectable"
              v-if="
                !isCurrentUserClient &&
                displaySettings.showInfos &&
                isEpisodeResolution
              "
            >
              {{ $t('shots.fields.resolution') }}
            </th>

            <template v-if="!isLoading">
              <validation-header
                :key="columnId"
                :hidden-columns="hiddenColumns"
                :column-id="columnId"
                :validation-style="getValidationStyle(columnId)"
                type="episodes"
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
                  displayedEpisodes.length > 0 &&
                  !isLoading
                "
              />

              <table-metadata-selector-menu
                :descriptors="episodeMetadataDescriptors"
                :exclude="{
                  timeSpent: !isEpisodeTime,
                  estimation: !isEpisodeEstimation
                }"
                namespace="episodes"
                v-model="metadataDisplayHeaders"
                v-model:is-open="columnSelectorDisplayed"
                v-if="displaySettings.showInfos"
              />

              <button-simple
                class="is-small is-pulled-right mr05"
                icon="down"
                @click="toggleColumnSelector"
                v-if="
                  episodeMetadataDescriptors.length > 0 &&
                  displaySettings.showInfos
                "
              />
            </th>
          </tr>
        </thead>
        <tbody class="datatable-body">
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
              :key="episode.id"
              :ref="el => rowVirtualizer.measureElement(el)"
              :data-index="i"
              :class="{
                canceled: episode.canceled,
                'stripe-even': i % 2 === 0,
                'stripe-odd': i % 2 === 1
              }"
              v-for="{ episode, i } in visibleRows"
            >
              <th
                :class="{
                  'datatable-row-header': true,
                  'episode-name': true,
                  name: true,
                  strong: !episode.canceled
                }"
              >
                <div class="flexrow">
                  <entity-thumbnail
                    :entity="episode"
                    :width="displaySettings.bigThumbnails ? 150 : 50"
                    :height="displaySettings.bigThumbnails ? 100 : 33"
                    :empty-width="displaySettings.bigThumbnails ? 150 : 50"
                    :empty-height="displaySettings.bigThumbnails ? 100 : 34"
                  />
                  <router-link
                    tabindex="-1"
                    :title="episode.name"
                    :to="episodePath(episode.id)"
                    v-if="!isCurrentUserClient"
                  >
                    {{ episode.name }}
                  </router-link>
                  <template v-else>
                    {{ episode.name }}
                  </template>
                </div>
              </th>

              <!-- Metadata stick -->
              <template v-if="displaySettings.showInfos">
                <td
                  :ref="`editor-${i}-${j}`"
                  class="metadata-descriptor datatable-row-header"
                  :title="
                    episode.data ? episode.data[descriptor.field_name] : ''
                  "
                  :style="{
                    'z-index': 1000 - i, // Need for combo to be above the next cell
                    left: offsets['editor-' + j]
                      ? `${offsets['editor-' + j]}px`
                      : '0'
                  }"
                  :key="episode.id + '-' + descriptor.id"
                  v-for="(descriptor, j) in stickedVisibleMetadataDescriptors"
                >
                  <metadata-input
                    :entity="episode"
                    :descriptor="descriptor"
                    :indexes="{ i, j }"
                    @metadata-changed="$emit('metadata-changed', $event)"
                  />
                </td>
              </template>

              <template v-if="!isLoading">
                <validation-cell
                  :ref="`validation-${i}-${j}`"
                  :key="columnId + '-' + episode.id"
                  :class="{
                    'validation-cell': !hiddenColumns[columnId],
                    'hidden-validation-cell': hiddenColumns[columnId],
                    'datatable-row-header': true
                  }"
                  :column="taskTypeMap.get(columnId)"
                  :column-y="j"
                  :contact-sheet="displaySettings.contactSheetMode"
                  :entity="episode"
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
                  :task-test="taskMap.get(episode.validations.get(columnId))"
                  @select="infos => onTaskSelected(infos, true)"
                  @unselect="infos => onTaskUnselected(infos, true)"
                  v-for="(columnId, j) in stickedDisplayedValidationColumns"
                />
              </template>

              <description-cell
                class="description"
                :entry="episode"
                :editable="isCurrentUserManager"
                @description-changed="
                  value => onDescriptionChanged(episode, value)
                "
                v-if="
                  !isCurrentUserClient &&
                  displaySettings.showInfos &&
                  isEpisodeDescription
                "
              />

              <!-- other Metadata cells -->
              <template v-if="displaySettings.showInfos">
                <td
                  class="metadata-descriptor"
                  :title="
                    episode.data ? episode.data[descriptor.field_name] : ''
                  "
                  :key="episode.id + '-' + descriptor.id"
                  v-for="(
                    descriptor, j
                  ) in nonStickedVisibleMetadataDescriptors"
                >
                  <metadata-input
                    :entity="episode"
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
                  isEpisodeTime &&
                  metadataDisplayHeaders.timeSpent
                "
              >
                {{ formatDuration(episode.timeSpent) }}
              </td>

              <td
                class="estimation selectable"
                v-if="
                  !isCurrentUserClient &&
                  displaySettings.showInfos &&
                  isEpisodeEstimation &&
                  metadataDisplayHeaders.estimation
                "
              >
                {{ formatDuration(episode.estimation) }}
              </td>

              <td
                scope="col"
                class="status metadata-descriptor"
                ref="th-status"
                v-if="
                  displaySettings.showInfos && metadataDisplayHeaders.status
                "
              >
                <span class="select">
                  <select
                    class="select-input"
                    @change="
                      event =>
                        onEpisodeStatusChanged(episode, event.target.value)
                    "
                  >
                    <option
                      v-for="option in episodeStatusOptions"
                      :key="`${episode.id}-status-option-${option.value}`"
                      :value="option.value"
                      :selected="(episode.status || 'running') === option.value"
                    >
                      {{ $t('episodes.status.' + option.label) }}
                    </option>
                  </select>
                </span>
              </td>

              <td
                class="resolution"
                v-if="isEpisodeResolution && displaySettings.showInfos"
              >
                <input
                  :class="{
                    'input-editor': true,
                    error: !isValidResolution(episode)
                  }"
                  :value="
                    getMetadataFieldValue({ field_name: 'resolution' }, episode)
                  "
                  @input="
                    event =>
                      onMetadataFieldChanged(
                        episode,
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
                    getMetadataFieldValue({ field_name: 'resolution' }, episode)
                  }}
                </span>
              </td>

              <template v-if="!isLoading">
                <validation-cell
                  :ref="`validation-${i}-${
                    j + stickedDisplayedValidationColumns.length
                  }`"
                  :key="`${columnId}-${episode.id}`"
                  :class="{
                    'validation-cell': !hiddenColumns[columnId],
                    'hidden-validation-cell': hiddenColumns[columnId]
                  }"
                  :contact-sheet="displaySettings.contactSheetMode"
                  :column="taskTypeMap.get(columnId)"
                  :entity="episode"
                  :task-test="
                    taskMap.get(
                      episode.validations
                        ? episode.validations.get(columnId)
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
                :entry="episode"
                @delete-clicked="$emit('delete-clicked', episode)"
                @edit-clicked="$emit('edit-clicked', episode)"
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
      v-if="isEmptyList && isCurrentUserClient && !isLoading"
    >
      <p class="info">
        <img src="../../assets/illustrations/empty_shot.png" alt="" />
      </p>
      <p class="info">{{ $t('episodes.empty_list_client') }}</p>
    </div>

    <p class="has-text-centered nb-episodes" v-if="!isEmptyList && !isLoading">
      {{ displayedEpisodesLength }}
      {{ $t('episodes.number', displayedEpisodesLength) }}
      <span
        v-if="displayedEpisodesTimeSpent > 0 || displayedEpisodesEstimation > 0"
      >
        ({{ formatDuration(displayedEpisodesTimeSpent) }}
        {{
          isDurationInHours
            ? $t(
                'main.hours_spent',
                formatDuration(displayedEpisodesTimeSpent, false)
              )
            : $t(
                'main.days_spent',
                formatDuration(displayedEpisodesTimeSpent, false)
              )
        }},
        {{ formatDuration(displayedEpisodesEstimation) }}
        {{
          isDurationInHours
            ? $t(
                'main.hours_estimated',
                formatDuration(displayedEpisodesEstimation, false)
              )
            : $t(
                'main.man_days',
                formatDuration(displayedEpisodesEstimation, false)
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
  name: 'episode-list',

  mixins: [
    descriptorMixin,
    domMixin,
    formatListMixin,
    entityListMixin,
    selectionListMixin
  ],

  props: {
    contactSheetMode: {
      type: Boolean,
      default: false
    },
    displayedEpisodes: {
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
    'create-tasks',
    'delete-clicked',
    'edit-clicked',
    'field-changed',
    'metadata-changed'
  ],

  // PERF-1: virtualized rows, same recipe as the other entity grids. The
  // list is flat (no group headers), so the virtualizer windows directly
  // over displayedEpisodes. `body` doubles as `this.$refs.body` for the
  // mixin methods and as the virtualizer's scroll element.
  setup(props) {
    const body = ref(null)
    const rowVirtualizer = useVirtualizer(
      computed(() => ({
        count: props.displayedEpisodes.length,
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
        getItemKey: index => props.displayedEpisodes[index]?.id ?? index,
        overscan: 10
      }))
    )

    return { body, rowVirtualizer }
  },

  data() {
    return {
      type: 'episode',
      hiddenColumns: {},
      lastFieldHeaderMenuDisplayed: null,
      lastFieldHeaderMenuLabel: null,
      lastHeaderMenuDisplayed: null,
      lastMetadataHeaderMenuDisplayed: null,
      lastHeaderMenuDisplayedIndexInGrid: null,
      lastSelectedEpisode: null,
      lastSelection: null,
      metadataDisplayHeaders: {
        estimation: true,
        timeSpent: true,
        status: true
      },
      offsets: {},
      stickedColumns: {},
      episodeStatusOptions: [
        { label: 'canceled', value: 'canceled' },
        { label: 'complete', value: 'complete' },
        { label: 'running', value: 'running' },
        { label: 'standby', value: 'standby' }
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
      'currentProduction',
      'episodeMap',
      'episodeFilledColumns',
      'episodeMetadataDescriptors',
      'episodes',
      'episodeSearchText',
      'episodeSelectionGrid',
      'currentEpisode',
      'displayedEpisodesEstimation',
      'displayedEpisodesLength',
      'displayedEpisodesTimeSpent',
      'displaySettings.bigThumbnails',
      'isCurrentUserAdmin',
      'isCurrentUserManager',
      'isCurrentUserSupervisor',
      'isCurrentUserClient',
      'isSingleEpisode',
      'isEpisodeDescription',
      'isEpisodeEstimation',
      'isEpisodeResolution',
      'isEpisodeTime',
      'displaySettings.showAssignations',
      'displaySettings.showInfos',
      'nbSelectedTasks',
      'selectedTasks',
      'taskMap',
      'taskTypeMap',
      'user'
    ]),

    isEmptyList() {
      return (
        this.displayedEpisodes.length &&
        this.displayedEpisodes[0].length === 0 &&
        !this.isLoading &&
        !this.isError &&
        (!this.episodeSearchText || this.episodeSearchText.length === 0)
      )
    },

    isListVisible() {
      return (
        !this.isLoading && !this.isError && this.displayedEpisodesLength > 0
      )
    },

    displayedValidationColumns() {
      return this.validationColumns.filter(columnId => {
        return (
          this.episodeFilledColumns[columnId] &&
          (!this.hiddenColumns[columnId] || this.displaySettings.showInfos)
        )
      })
    },

    metadataDescriptors() {
      return this.episodeMetadataDescriptors
    },

    localStorageStickKey() {
      return `stick-episodes-${this.currentProduction?.id}`
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

    // { episode, i } pairs for the rows tanstack currently renders, `i`
    // being the row's real index in displayedEpisodes so every i-based
    // computation (isSelected, refs, z-index) stays correct unchanged.
    visibleRows() {
      return this.virtualRows
        .filter(
          virtualRow => this.displayedEpisodes[virtualRow.index] !== undefined
        )
        .map(virtualRow => ({
          episode: this.displayedEpisodes[virtualRow.index],
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
      let count = 1 // episode name column, always present
      if (showInfos) {
        count += this.stickedVisibleMetadataDescriptors.length
        count += this.nonStickedVisibleMetadataDescriptors.length
      }
      if (!this.isLoading) {
        count += this.stickedDisplayedValidationColumns.length
        count += this.nonStickedDisplayedValidationColumns.length
      }
      if (!this.isCurrentUserClient && showInfos && this.isEpisodeDescription) {
        count++
      }
      if (
        !this.isCurrentUserClient &&
        showInfos &&
        this.isEpisodeTime &&
        this.metadataDisplayHeaders.timeSpent
      ) {
        count++
      }
      if (
        !this.isCurrentUserClient &&
        showInfos &&
        this.isEpisodeEstimation &&
        this.metadataDisplayHeaders.estimation
      ) {
        count++
      }
      if (showInfos && this.metadataDisplayHeaders.status) {
        count++
      }
      if (!this.isCurrentUserClient && showInfos && this.isEpisodeResolution) {
        count++
      }
      count++ // actions column, always present
      return count
    }
  },

  methods: {
    ...mapActions(['setEpisodeSelection']),

    isSelected(lineIndex, columnIndex) {
      return this.episodeSelectionGrid.has(`${lineIndex}-${columnIndex}`)
    },

    // Hook for entity_list.js's data-driven shift-rectangle selection.
    entityForRow(lineIndex) {
      return this.displayedEpisodes[lineIndex]
    },

    episodePath(episodeId) {
      return this.getPath('episode', episodeId)
    },

    getPath(section, episodeId) {
      const route = {
        name: section,
        params: {
          production_id: this.currentProduction?.id
        }
      }
      if (episodeId) {
        route.params.episode_id = episodeId
      }
      return route
    },

    onEpisodeStatusChanged(episode, status) {
      this.$emit('field-changed', {
        entry: episode,
        fieldName: 'status',
        value: status
      })
    }
  },

  watch: {
    displayedEpisodes() {
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
// Firefox scroll anchoring fights windowed updates: when the top spacer
// row resizes it re-anchors the scroll position and produces micro-jumps
// (standard TanStack Virtual mitigation). Scoped: only this virtualized
// wrapper opts out, other datatables keep the default.
.datatable-wrapper {
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

.name a {
  color: inherit;
}

thead .name.episode-name {
  min-width: 110px;
  width: 110px;
}

.description {
  min-width: 200px;
  max-width: 200px;
  width: 200px;
}

.status {
  min-width: 120px;
  max-width: 120px;
  width: 120px;
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

.resolution {
  min-width: 110px;
  max-width: 110px;
  width: 110px;
}
</style>
