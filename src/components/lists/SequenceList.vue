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
          v-columns-resizable="currentProduction?.id"
        >
          <tr>
            <th
              scope="col"
              class="name sequence-name datatable-row-header"
              data-column-key="name"
              ref="th-name"
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
              type="sequences"
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
              data-column-key="description"
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
                  class="metadata-descriptor datatable-row-header"
                  @keyup.ctrl="onInputKeyUp"
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
                  :task-href="taskHref(sequence.validations?.get(columnId))"
                  :task-test="taskMap.get(sequence.validations?.get(columnId))"
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
                  @keyup.ctrl="onInputKeyUp"
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
                  @keyup.ctrl="onInputKeyUp"
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
                  :task-href="taskHref(sequence.validations?.get(columnId))"
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

    <table-info :is-loading="isLoading" :is-error="isError" big-cells />

    <empty-list
      :text="$t('sequences.empty_list')"
      :read-only-text="$t('sequences.empty_list_read_only')"
      :button-text="$t('sequences.new_sequences')"
      @create="$emit('add-sequences')"
      v-if="isEmptyList && !isLoading"
    />

    <p class="has-text-centered nb-sequences" v-if="!isEmptyList && !isLoading">
      {{ displayedSequencesLength }}
      {{ $t('sequences.number', { count: displayedSequencesLength }) }}
      <span
        v-if="
          displayedSequencesTimeSpent > 0 || displayedSequencesEstimation > 0
        "
      >
        ({{ formatDuration(displayedSequencesTimeSpent) }}
        {{
          isDurationInHours
            ? $t('main.hours_spent', {
                count: formatDuration(displayedSequencesTimeSpent, false)
              })
            : $t('main.days_spent', {
                count: formatDuration(displayedSequencesTimeSpent, false)
              })
        }},
        {{ formatDuration(displayedSequencesEstimation) }}
        {{
          isDurationInHours
            ? $t('main.hours_estimated', {
                count: formatDuration(displayedSequencesEstimation, false)
              })
            : $t('main.man_days', {
                count: formatDuration(displayedSequencesEstimation, false)
              })
        }})
      </span>
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

import { useEntityList } from '@/composables/entityList'
import { useFormat } from '@/composables/format'
import { getMetadataFieldValue } from '@/lib/descriptors'
import { getEntityPath, getTaskHref } from '@/lib/path'

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
import SortableFieldHeader from '@/components/widgets/SortableFieldHeader.vue'
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
  displaySettings: { type: Object, default: () => ({}) },
  displayedSequences: { type: Array, default: () => [] },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  validationColumns: { type: Array, default: () => [] },
  departmentFilter: { type: Array, default: () => [] }
})

const emit = defineEmits([
  'add-metadata',
  'add-sequences',
  'change-sort',
  'create-tasks',
  'delete-all-tasks',
  'delete-clicked',
  'delete-metadata',
  'edit-clicked',
  'edit-metadata',
  'field-changed',
  'keep-task-panel-open',
  'metadata-changed',
  'scroll'
])

// Computed
// --------------------------------------------------------------------------

const currentEpisode = computed(() => store.getters.currentEpisode)
const currentProduction = computed(() => store.getters.currentProduction)
const displayedSequencesEstimation = computed(
  () => store.getters.displayedSequencesEstimation
)
const displayedSequencesLength = computed(
  () => store.getters.displayedSequencesLength
)
const displayedSequencesTimeSpent = computed(
  () => store.getters.displayedSequencesTimeSpent
)
const isCurrentUserClient = computed(() => store.getters.isCurrentUserClient)
// Production-scoped: effective role on the current production (global
// admins/managers still pass, but a per-project override wins).
const isCurrentUserManager = computed(
  () => store.getters.isCurrentUserProductionManager
)
const isCurrentUserSupervisor = computed(
  () => store.getters.isCurrentUserProductionSupervisor
)
const isSequenceDescription = computed(
  () => store.getters.isSequenceDescription
)
const isSequenceEstimation = computed(() => store.getters.isSequenceEstimation)
const isSequenceResolution = computed(() => store.getters.isSequenceResolution)
const isSequenceTime = computed(() => store.getters.isSequenceTime)
const isTVShow = computed(() => store.getters.isTVShow)
const sequenceFilledColumns = computed(
  () => store.getters.sequenceFilledColumns
)
const sequenceMetadataDescriptors = computed(
  () => store.getters.sequenceMetadataDescriptors
)
const sequenceSearchText = computed(() => store.getters.sequenceSearchText)
const sequenceSelectionGrid = computed(
  () => store.getters.sequenceSelectionGrid
)
const taskMap = computed(() => store.getters.taskMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

const isEmptyList = computed(
  () =>
    props.displayedSequences &&
    props.displayedSequences.length === 0 &&
    !props.isLoading &&
    !props.isError &&
    (!sequenceSearchText.value || sequenceSearchText.value.length === 0)
)

const isListVisible = computed(
  () => !props.isLoading && !props.isError && displayedSequencesLength.value > 0
)

const {
  columnSelectorDisplayed,
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
  onSortByFieldClicked,
  onSortByMetadataClicked,
  onSortByTaskTypeClicked,
  onTaskSelected,
  onTaskUnselected,
  getValidationStyle,
  isValidResolution,
  selectTaskFromQuery,
  setScrollPosition,
  showFieldHeaderMenu,
  showHeaderMenu,
  showMetadataHeaderMenu,
  startBrowsing,
  stickColumnClicked,
  stickedColumns,
  stickedDisplayedValidationColumns,
  stickedVisibleMetadataDescriptors,
  toggleColumnSelector
} = useEntityList({
  type: 'sequence',
  props,
  emit,
  entities: computed(() => props.displayedSequences),
  filledColumns: sequenceFilledColumns,
  metadataDescriptors: sequenceMetadataDescriptors,
  metadataDisplayHeaders: { estimation: true, timeSpent: true },
  isEmptyList
})

// Functions
// --------------------------------------------------------------------------

const isSelected = (lineIndex, columnIndex) =>
  sequenceSelectionGrid.value.has(`${lineIndex}-${columnIndex}`)

const taskHref = taskId =>
  getTaskHref(
    router,
    taskMap.value.get(taskId),
    currentProduction.value,
    isTVShow.value,
    currentEpisode.value,
    taskTypeMap.value
  )

const sequencePath = sequenceId =>
  getEntityPath(
    sequenceId,
    currentProduction.value?.id,
    'sequence',
    currentEpisode.value ? currentEpisode.value.id : null
  )

// The pages drive the list through a ref.
defineExpose({ selectTaskFromQuery, setScrollPosition })
</script>

<style lang="scss" scoped>
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
</style>
