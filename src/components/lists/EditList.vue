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
          isMetadataColumnEditAllowed(lastMetadaDataHeaderMenuDisplayed)
        "
        :is-sticked="stickedColumns[lastMetadaDataHeaderMenuDisplayed]"
        @edit-clicked="onEditMetadataClicked()"
        @delete-clicked="onDeleteMetadataClicked()"
        @sort-by-clicked="onSortByMetadataClicked()"
        @toggle-stick="metadataStickColumnClicked($event)"
      />

      <table class="datatable">
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
                :style="{
                  'z-index': 1001
                }"
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
                v-show="columnSelectorDisplayed"
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
            <tr
              class="datatable-row"
              scope="row"
              :key="edit.id"
              :class="{ canceled: edit.canceled }"
              v-for="(edit, i) in displayedEdits"
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
                  >
                    {{ edit.name }}
                  </router-link>
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
        <img src="../../assets/illustrations/empty_edit.png" />
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
        <img src="../../assets/illustrations/empty_edit.png" />
      </p>
      <p class="info">{{ $t('edits.empty_list_client') }}</p>
    </div>

    <p class="has-text-centered nb-edits" v-if="!isEmptyList && !isLoading">
      {{ displayedEditsLength }} {{ $tc('edits.number', displayedEditsLength) }}
      <span v-if="displayedEditsTimeSpent > 0 || displayedEditsEstimation > 0">
        ({{ formatDuration(displayedEditsTimeSpent) }}
        {{ $tc('main.days_spent', displayedEditsTimeSpent) }},
        {{ formatDuration(displayedEditsEstimation) }}
        {{ $tc('main.man_days', displayedEditsEstimation) }})
      </span>
    </p>
  </div>
</template>

<script>
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
    'restore-clicked',
    'scroll'
  ],

  data() {
    return {
      type: 'edit',
      hiddenColumns: {},
      lastHeaderMenuDisplayed: null,
      lastMetadaDataHeaderMenuDisplayed: null,
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

    visibleColumns() {
      let count = 2
      count +=
        !this.isCurrentUserClient &&
        this.displaySettings.showInfos &&
        this.isEditDescription
          ? 1
          : 0
      count += this.visibleMetadataDescriptors.length
      count +=
        !this.isCurrentUserClient &&
        this.displaySettings.showInfos &&
        this.isEditTime &&
        this.metadataDisplayHeaders.timeSpent
          ? 1
          : 0
      count +=
        !this.isCurrentUserClient &&
        this.displaySettings.showInfos &&
        this.isEditEstimation &&
        this.metadataDisplayHeaders.estimation
          ? 1
          : 0
      count += this.displayedValidationColumns.length
      return count
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
      return `stick-edits-${this.currentProduction.id}`
    }
  },

  methods: {
    ...mapActions(['displayMoreEdits', 'setEditSelection']),

    isSelected(lineIndex, columnIndex) {
      return this.editSelectionGrid[lineIndex][columnIndex]
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

    onBodyScroll(event) {
      if (!this.$refs.body) return
      const position = event.target
      this.$emit('scroll', position.scrollTop)
      const maxHeight =
        this.$refs.body.scrollHeight - this.$refs.body.offsetHeight
      if (maxHeight < position.scrollTop + 100) {
        this.loadMoreEdits()
      }
    },

    loadMoreEdits() {
      this.displayMoreEdits()
    },

    editPath(editId) {
      return this.getPath('edit', editId)
    },

    getPath(section, editId) {
      const route = {
        name: section,
        params: {
          production_id: this.currentProduction.id
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
      this.toggleStickedColumns(this.lastMetadaDataHeaderMenuDisplayed)
      this.showMetadataHeaderMenu(this.lastMetadaDataHeaderMenuDisplayed, event)
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

.name.edit-name {
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

.datatable-row-header {
  cursor: pointer;
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
