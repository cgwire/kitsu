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
          v-columns-resizable="currentProduction?.id"
        >
          <tr>
            <th
              scope="col"
              class="name episode-name datatable-row-header"
              data-column-key="name"
              ref="th-name"
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
                type="episodes"
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
                  episodeMetadataDescriptors.length > 0 &&
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
              :key="episode.id"
              :class="{ canceled: episode.canceled }"
              v-for="(episode, i) in displayedEpisodes"
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
                  class="metadata-descriptor datatable-row-header"
                  @keyup.ctrl="onInputKeyUp"
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
                  :minimized="hiddenColumns[columnId]"
                  :row-x="i"
                  :selected="isSelected(i, j)"
                  :sticked="true"
                  :task-href="taskHref(episode.validations?.get(columnId))"
                  :task-test="taskMap.get(episode.validations?.get(columnId))"
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
                  @keyup.ctrl="onInputKeyUp"
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
                  @keyup.ctrl="onInputKeyUp"
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
                  :task-href="taskHref(episode.validations?.get(columnId))"
                  :task-test="
                    taskMap.get(
                      episode.validations
                        ? episode.validations.get(columnId)
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
                :entry="episode"
                @delete-clicked="$emit('delete-clicked', episode)"
                @edit-clicked="$emit('edit-clicked', episode)"
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
      :text="$t('episodes.empty_list')"
      :read-only-text="$t('episodes.empty_list_read_only')"
      :button-text="$t('episodes.new_episodes')"
      @create="$emit('add-episodes')"
      v-if="isEmptyList && !isLoading"
    />

    <p class="has-text-centered nb-episodes" v-if="!isEmptyList && !isLoading">
      {{ displayedEpisodesLength }}
      {{ $t('episodes.number', { count: displayedEpisodesLength }) }}
      <span
        v-if="displayedEpisodesTimeSpent > 0 || displayedEpisodesEstimation > 0"
      >
        ({{ formatDuration(displayedEpisodesTimeSpent) }}
        {{
          isDurationInHours
            ? $t('main.hours_spent', {
                count: formatDuration(displayedEpisodesTimeSpent, false)
              })
            : $t('main.days_spent', {
                count: formatDuration(displayedEpisodesTimeSpent, false)
              })
        }},
        {{ formatDuration(displayedEpisodesEstimation) }}
        {{
          isDurationInHours
            ? $t('main.hours_estimated', {
                count: formatDuration(displayedEpisodesEstimation, false)
              })
            : $t('main.man_days', {
                count: formatDuration(displayedEpisodesEstimation, false)
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
import { getTaskHref } from '@/lib/path'

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

const episodeStatusOptions = ['canceled', 'complete', 'running', 'standby'].map(
  status => ({ label: status, value: status })
)

// Props / Emits
// --------------------------------------------------------------------------

const props = defineProps({
  contactSheetMode: { type: Boolean, default: false },
  displayedEpisodes: { type: Array, default: () => [] },
  displaySettings: { type: Object, default: () => ({}) },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  validationColumns: { type: Array, default: () => [] },
  departmentFilter: { type: Array, default: () => [] }
})

const emit = defineEmits([
  'add-episodes',
  'add-metadata',
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
const displayedEpisodesEstimation = computed(
  () => store.getters.displayedEpisodesEstimation
)
const displayedEpisodesLength = computed(
  () => store.getters.displayedEpisodesLength
)
const displayedEpisodesTimeSpent = computed(
  () => store.getters.displayedEpisodesTimeSpent
)
const episodeFilledColumns = computed(() => store.getters.episodeFilledColumns)
const episodeMetadataDescriptors = computed(
  () => store.getters.episodeMetadataDescriptors
)
const episodeSearchText = computed(() => store.getters.episodeSearchText)
const episodeSelectionGrid = computed(() => store.getters.episodeSelectionGrid)
const isCurrentUserClient = computed(() => store.getters.isCurrentUserClient)
// Production-scoped: effective role on the current production (global
// admins/managers still pass, but a per-project override wins).
const isCurrentUserManager = computed(
  () => store.getters.isCurrentUserProductionManager
)
const isCurrentUserSupervisor = computed(
  () => store.getters.isCurrentUserProductionSupervisor
)
const isEpisodeDescription = computed(() => store.getters.isEpisodeDescription)
const isEpisodeEstimation = computed(() => store.getters.isEpisodeEstimation)
const isEpisodeResolution = computed(() => store.getters.isEpisodeResolution)
const isEpisodeTime = computed(() => store.getters.isEpisodeTime)
const isTVShow = computed(() => store.getters.isTVShow)
const taskMap = computed(() => store.getters.taskMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

const isEmptyList = computed(
  () =>
    props.displayedEpisodes.length === 0 &&
    !props.isLoading &&
    !props.isError &&
    (!episodeSearchText.value || episodeSearchText.value.length === 0)
)

const isListVisible = computed(
  () => !props.isLoading && !props.isError && displayedEpisodesLength.value > 0
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
  isMetadataColumnEditAllowed,
  isValidResolution,
  selectTaskFromQuery,
  setScrollPosition,
  showFieldHeaderMenu,
  showHeaderMenu,
  showMetadataHeaderMenu,
  stickColumnClicked,
  stickedColumns,
  stickedDisplayedValidationColumns,
  stickedVisibleMetadataDescriptors,
  toggleColumnSelector
} = useEntityList({
  type: 'episode',
  props,
  emit,
  entities: computed(() => props.displayedEpisodes),
  filledColumns: episodeFilledColumns,
  metadataDescriptors: episodeMetadataDescriptors,
  metadataDisplayHeaders: { estimation: true, timeSpent: true, status: true },
  isEmptyList
})

// Functions
// --------------------------------------------------------------------------

const isSelected = (lineIndex, columnIndex) =>
  episodeSelectionGrid.value.has(`${lineIndex}-${columnIndex}`)

const taskHref = taskId =>
  getTaskHref(
    router,
    taskMap.value.get(taskId),
    currentProduction.value,
    isTVShow.value,
    currentEpisode.value,
    taskTypeMap.value
  )

const episodePath = episodeId => ({
  name: 'episode',
  params: { production_id: currentProduction.value?.id, episode_id: episodeId }
})

const onEpisodeStatusChanged = (episode, status) => {
  emit('field-changed', { entry: episode, fieldName: 'status', value: status })
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

td .select {
  color: var(--text);
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
    color: var(--text);
    height: 100%;
    width: 100%;
    background: transparent;
    border-radius: 0;
    border: 1px solid transparent;

    option {
      background: var(--background-alt-2);
      color: var(--text);
    }

    &:focus {
      border: 1px solid $green;
      background: var(--background-alt-2);
    }

    &:hover {
      background: var(--background-alt-2);
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
