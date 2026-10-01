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
        <thead
          class="datatable-head"
          id="datatable-edit"
          v-columns-resizable="currentProduction?.id"
        >
          <tr>
            <th scope="col" class="episode" ref="th-episode" v-if="isTVShow">
              {{ $t('edits.fields.episode') }}
            </th>
            <th
              scope="col"
              class="name edit-name datatable-row-header"
              data-column-key="name"
              ref="th-name"
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
              data-column-key="description"
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
            <th scope="col" class="actions">
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
                :production-id="currentProduction?.id"
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
                    event => onInputKeyUp(event, i, descriptorLength)
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
              <template v-if="displaySettings.showInfos">
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
              </template>

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
                  :task-href="taskHref(edit.validations.get(columnId))"
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
                  :task-href="taskHref(edit.validations?.get(columnId))"
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

    <table-info :is-loading="isLoading" :is-error="isError" big-cells />

    <empty-list
      :text="$t('edits.empty_list')"
      :read-only-text="$t('edits.empty_list_read_only')"
      :button-text="$t('edits.new_edits')"
      @create="$emit('add-edits')"
      v-if="isEmptyList && !isLoading"
    />

    <p class="has-text-centered nb-edits" v-if="!isEmptyList && !isLoading">
      {{ displayedEditsLength }}
      {{ $t('edits.number', { count: displayedEditsLength }) }}
      <span v-if="displayedEditsTimeSpent > 0 || displayedEditsEstimation > 0">
        ({{ formatDuration(displayedEditsTimeSpent) }}
        {{
          isDurationInHours
            ? $t('main.hours_spent', {
                count: formatDuration(displayedEditsTimeSpent, false)
              })
            : $t('main.days_spent', {
                count: formatDuration(displayedEditsTimeSpent, false)
              })
        }},
        {{ formatDuration(displayedEditsEstimation) }}
        {{
          isDurationInHours
            ? $t('main.hours_estimated', {
                count: formatDuration(displayedEditsEstimation, false)
              })
            : $t('main.man_days', {
                count: formatDuration(displayedEditsEstimation, false)
              })
        }})
      </span>
    </p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

import { useEntityList } from '@/composables/entityList'
import { useFormat } from '@/composables/format'
import { getMetadataFieldValue } from '@/lib/descriptors'
import { getTaskHref } from '@/lib/path'
import { range } from '@/lib/time'

/* eslint-disable no-unused-vars */
import DescriptionCell from '@/components/cells/DescriptionCell.vue'
import MetadataHeader from '@/components/cells/MetadataHeader.vue'
import MetadataInput from '@/components/cells/MetadataInput.vue'
import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import ValidationCell from '@/components/cells/ValidationCell.vue'
import ValidationHeader from '@/components/cells/ValidationHeader.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import EmptyList from '@/components/widgets/EmptyList.vue'
import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'
import TableHeaderMenu from '@/components/widgets/TableHeaderMenu.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'
import TableMetadataHeaderMenu from '@/components/widgets/TableMetadataHeaderMenu.vue'
import TableMetadataSelectorMenu from '@/components/widgets/TableMetadataSelectorMenu.vue'
/* eslint-enable no-unused-vars */

const router = useRouter()
const store = useStore()
const { formatDuration, isDurationInHours } = useFormat()

// Props / Emits
// --------------------------------------------------------------------------

const props = defineProps({
  displayedEdits: { type: Array, default: () => [] },
  displaySettings: { type: Object, default: () => ({}) },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  validationColumns: { type: Array, default: () => [] },
  departmentFilter: { type: Array, default: () => [] }
})

const emit = defineEmits([
  'add-edits',
  'add-metadata',
  'change-sort',
  'create-tasks',
  'delete-all-tasks',
  'delete-clicked',
  'delete-metadata',
  'edit-clicked',
  'edit-history',
  'edit-metadata',
  'field-changed',
  'keep-task-panel-open',
  'metadata-changed',
  'restore-clicked',
  'scroll'
])

// State
// --------------------------------------------------------------------------

const lastSelectedEdit = ref(null)

// Computed
// --------------------------------------------------------------------------

const currentEpisode = computed(() => store.getters.currentEpisode)
const currentProduction = computed(() => store.getters.currentProduction)
const displayedEditsCount = computed(() => store.getters.displayedEditsCount)
const displayedEditsEstimation = computed(
  () => store.getters.displayedEditsEstimation
)
const displayedEditsLength = computed(() => store.getters.displayedEditsLength)
const displayedEditsTimeSpent = computed(
  () => store.getters.displayedEditsTimeSpent
)
const editFilledColumns = computed(() => store.getters.editFilledColumns)
const editMetadataDescriptors = computed(
  () => store.getters.editMetadataDescriptors
)
const editSearchText = computed(() => store.getters.editSearchText)
const editSelectionGrid = computed(() => store.getters.editSelectionGrid)
const episodeMap = computed(() => store.getters.episodeMap)
const isCurrentUserClient = computed(() => store.getters.isCurrentUserClient)
// Production-scoped: effective role on the current production (global
// admins/managers still pass, but a per-project override wins).
const isCurrentUserManager = computed(
  () => store.getters.isCurrentUserProductionManager
)
const isCurrentUserSupervisor = computed(
  () => store.getters.isCurrentUserProductionSupervisor
)
const isEditDescription = computed(() => store.getters.isEditDescription)
const isEditEstimation = computed(() => store.getters.isEditEstimation)
const isEditTime = computed(() => store.getters.isEditTime)
const isTVShow = computed(() => store.getters.isTVShow)
const selectedEdits = computed(() => store.getters.selectedEdits)
const taskMap = computed(() => store.getters.taskMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

const isEmptyList = computed(
  () =>
    props.displayedEdits.length === 0 &&
    !props.isLoading &&
    !props.isError &&
    (!editSearchText.value || editSearchText.value.length === 0)
)

const isListVisible = computed(
  () => !props.isLoading && !props.isError && displayedEditsCount.value > 0
)

const {
  columnSelectorDisplayed,
  descriptorLength,
  hiddenColumns,
  isEmptyTask,
  lastHeaderMenuDisplayed,
  lastMetadataHeaderMenuDisplayed,
  metadataDisplayHeaders,
  metadataStickColumnClicked,
  nonStickedDisplayedValidationColumns,
  nonStickedVisibleMetadataDescriptors,
  offsets,
  onAddMetadataClicked,
  onBodyScroll,
  onDeleteAllTasksClicked,
  onDeleteMetadataClicked,
  onDescriptionChanged,
  onEditMetadataClicked,
  onInputKeyUp,
  onMetadataFieldChanged,
  onMinimizeColumnToggled,
  onSelectColumn,
  onSortByMetadataClicked,
  onSortByTaskTypeClicked,
  onTaskSelected,
  onTaskUnselected,
  getValidationStyle,
  isMetadataColumnEditAllowed,
  isValidResolution,
  selectTaskFromQuery,
  setScrollPosition,
  shiftKeyPressed,
  showHeaderMenu,
  showMetadataHeaderMenu,
  stickColumnClicked,
  stickedColumns,
  stickedDisplayedValidationColumns,
  stickedVisibleMetadataDescriptors,
  toggleColumnSelector
} = useEntityList({
  type: 'edit',
  props,
  emit,
  entities: computed(() => props.displayedEdits),
  filledColumns: editFilledColumns,
  metadataDescriptors: editMetadataDescriptors,
  metadataDisplayHeaders: { estimation: true, timeSpent: true },
  isEmptyList,
  listHeight: () => displayedEditsCount.value,
  onScrollEnd: () => store.dispatch('displayMoreEdits')
})

// Functions
// --------------------------------------------------------------------------

const isSelected = (lineIndex, columnIndex) =>
  editSelectionGrid.value.has(`${lineIndex}-${columnIndex}`)

// Shift-click selects every line between the last selected one and this
// one.
const toggleLine = (edit, event) => {
  const selected = event.target.checked
  const editsToSelect = [edit]
  if (selected && shiftKeyPressed.value && lastSelectedEdit.value) {
    const edits = props.displayedEdits
    const indexes = [lastSelectedEdit.value.id, edit.id].map(id =>
      edits.findIndex(displayedEdit => displayedEdit.id === id)
    )
    const [startIndex, endIndex] = indexes.sort((a, b) => a - b)
    if (startIndex >= 0) {
      range(startIndex, endIndex).forEach(index => {
        editsToSelect.push(edits[index])
      })
    }
  }
  if (selected) {
    lastSelectedEdit.value = edit
  }
  editsToSelect.forEach(edit => {
    store.dispatch('setEditSelection', { edit, selected })
  })
}

const taskHref = taskId =>
  getTaskHref(
    router,
    taskMap.value.get(taskId),
    currentProduction.value,
    isTVShow.value,
    currentEpisode.value,
    taskTypeMap.value
  )

const editPath = editId => {
  const route = {
    name: 'edit',
    params: { production_id: currentProduction.value?.id, edit_id: editId }
  }
  if (isTVShow.value && currentEpisode.value) {
    route.name = 'episode-edit'
    route.params.episode_id = currentEpisode.value.id
  }
  return route
}

// The pages drive the list through a ref.
defineExpose({ selectTaskFromQuery, setScrollPosition })
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

.datatable-row th.name {
  font-size: 1.1em;
  padding: 6px;
}

th .input-editor,
td .input-editor {
  color: var(--text);
  height: 100%;
  padding: 0.5rem;
  width: 100%;
  background: transparent;
  border: 1px solid transparent;
  z-index: 100;

  option {
    background: var(--background-alt-2);
    color: var(--text);
  }

  &:active,
  &:focus,
  &:hover {
    background: var(--background-alt-2);
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

// Metadata cell CSS

td.metadata-descriptor {
  height: 3.1rem;
  padding: 0;
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
