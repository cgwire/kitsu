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
        @select-column="onSelectColumn('shot')"
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
        class="datatable multi-section"
        :class="{ 'expand-task-types': displaySettings.fullTaskTypeNames }"
      >
        <thead
          class="datatable-head"
          id="datatable-shot"
          v-columns-resizable="currentProduction?.id"
        >
          <tr>
            <th
              scope="col"
              class="name shot-name datatable-row-header"
              data-column-key="name"
              ref="th-name"
            >
              <sortable-field-header
                field-name="name"
                :label="$t('shots.fields.name')"
                @show-menu="showFieldHeaderMenu"
              >
                <template #actions>
                  <button-simple
                    class="is-small flexrow"
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
                @show-metadata-header-menu="
                  event => showMetadataHeaderMenu(descriptor.id, event)
                "
                is-stick
                v-for="(descriptor, j) in stickedVisibleMetadataDescriptors"
              />
            </template>

            <template v-if="!isLoading">
              <validation-header
                :ref="`validation-${columnIndexInGrid}`"
                :key="columnId"
                :hidden-columns="hiddenColumns"
                :column-id="columnId"
                :title="taskTypeMap.get(columnId)?.name"
                :validation-style="getValidationStyle(columnId)"
                :left="
                  offsets['validation-' + columnIndexInGrid]
                    ? `${offsets['validation-' + columnIndexInGrid]}px`
                    : '0'
                "
                type="shots"
                @show-header-menu="
                  event => showHeaderMenu(columnId, columnIndexInGrid, event)
                "
                is-stick
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
                isShotDescription
              "
            >
              <sortable-field-header
                field-name="description"
                :label="$t('shots.fields.description')"
                @show-menu="showFieldHeaderMenu"
              />
            </th>

            <th
              scope="col"
              class="time-spent number-cell"
              v-if="
                !isCurrentUserClient &&
                displaySettings.showInfos &&
                isShotTime &&
                metadataDisplayHeaders.timeSpent
              "
            >
              {{ $t('shots.fields.time_spent') }}
            </th>

            <th
              scope="col"
              class="estimation number-cell"
              :title="$t('main.estimation')"
              v-if="
                !isCurrentUserClient &&
                displaySettings.showInfos &&
                isShotEstimation &&
                metadataDisplayHeaders.estimation
              "
            >
              {{ $t('main.estimation_short') }}
            </th>

            <th
              class="drawings number-cell"
              scope="col"
              v-if="
                displaySettings.showInfos &&
                isPaperProduction &&
                metadataDisplayHeaders.drawings
              "
            >
              {{ $t('shots.fields.nb_drawings') }}
            </th>

            <th
              class="frames number-cell"
              scope="col"
              v-if="
                isFrames &&
                displaySettings.showInfos &&
                !isPaperProduction &&
                metadataDisplayHeaders.frames
              "
            >
              {{ $t('shots.fields.nb_frames') }}
            </th>

            <th
              scope="col"
              class="framein number-cell"
              v-if="
                isFrameIn &&
                displaySettings.showInfos &&
                metadataDisplayHeaders.frameIn
              "
            >
              {{ $t('shots.fields.frame_in') }}
            </th>
            <th
              scope="col"
              class="frameout number-cell"
              v-if="
                isFrameOut &&
                displaySettings.showInfos &&
                metadataDisplayHeaders.frameOut
              "
            >
              {{ $t('shots.fields.frame_out') }}
            </th>

            <th
              scope="col"
              class="fps number-cell"
              v-if="
                isFps && displaySettings.showInfos && metadataDisplayHeaders.fps
              "
            >
              {{ $t('shots.fields.fps') }}
            </th>

            <th
              scope="col"
              class="max-retakes number-cell"
              v-if="
                isMaxRetakes &&
                displaySettings.showInfos &&
                metadataDisplayHeaders.maxRetakes
              "
            >
              {{ $t('shots.fields.max_retakes') }}
            </th>

            <th
              scope="col"
              class="resolution"
              v-if="
                isResolution &&
                displaySettings.showInfos &&
                metadataDisplayHeaders.resolution
              "
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

            <template v-if="!isLoading">
              <validation-header
                :key="columnId"
                :hidden-columns="hiddenColumns"
                :column-id="columnId"
                :validation-style="getValidationStyle(columnId)"
                type="shots"
                @show-header-menu="
                  event => showHeaderMenu(columnId, columnIndexInGrid, event)
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
                v-if="isCurrentUserManager"
              />

              <table-metadata-selector-menu
                :descriptors="shotMetadataDescriptors"
                namespace="shots"
                :exclude="{
                  frames: !isFrames,
                  frameIn: !isFrameIn,
                  frameOut: !isFrameOut,
                  fps: !isFps,
                  estimation: !isShotEstimation,
                  timeSpent: !isShotTime,
                  resolution: !isResolution,
                  max_retakes: !isMaxRetakes
                }"
                :production-id="currentProduction?.id"
                v-model="metadataDisplayHeaders"
                v-model:is-open="columnSelectorDisplayed"
                v-if="displaySettings.showInfos"
              />

              <button-simple
                class="is-small is-pulled-right mr05"
                icon="down"
                @click="toggleColumnSelector"
                v-if="displaySettings.showInfos"
              />
            </th>
          </tr>
        </thead>

        <template v-if="!isLoading && isListVisible">
          <tbody
            class="datatable-body"
            :key="getGroupKey(group, k, 'sequence_id')"
            @mousedown="startBrowsing"
            @touchstart="startBrowsing"
            v-for="(group, k) in displayedShots"
          >
            <tr class="datatable-type-header">
              <th scope="rowgroup">
                <div
                  class="datatable-row-header pointer"
                  role="button"
                  tabindex="0"
                  @click="$emit('sequence-clicked', group[0].sequence_name)"
                  @keydown.enter.prevent="
                    $emit('sequence-clicked', group[0].sequence_name)
                  "
                >
                  {{ groupHeader(group) }}
                </div>
              </th>
            </tr>
            <tr
              class="datatable-row"
              :key="shot.id"
              :class="{ canceled: shot.canceled }"
              v-for="(shot, i) in group"
            >
              <th
                scope="row"
                :class="{
                  'datatable-row-header': true,
                  'shot-name': true,
                  name: true,
                  bold: !shot.canceled
                }"
              >
                <div class="flexrow">
                  <input
                    type="checkbox"
                    class="mr1"
                    :checked="selectedShots.has(shot.id) || null"
                    @input="event => toggleLine(shot, event)"
                    v-if="isCurrentUserManager"
                  />
                  <entity-thumbnail
                    :entity="shot"
                    :width="displaySettings.bigThumbnails ? 150 : 50"
                    :height="displaySettings.bigThumbnails ? 100 : 33"
                    :empty-width="displaySettings.bigThumbnails ? 150 : 50"
                    :empty-height="displaySettings.bigThumbnails ? 100 : 34"
                  />
                  <router-link
                    tabindex="-1"
                    :title="shot.full_name"
                    :to="shotPath(shot.id)"
                    v-if="!isCurrentUserClient"
                  >
                    {{ shot.name }}
                  </router-link>
                  <template v-else>
                    {{ shot.name }}
                  </template>
                </div>
              </th>

              <!-- Metadata stick -->
              <template v-if="displaySettings.showInfos">
                <td
                  class="metadata-descriptor datatable-row-header"
                  @keyup.ctrl="onInputKeyUp"
                  :title="shot.data ? shot.data[descriptor.field_name] : ''"
                  :style="{
                    'z-index':
                      descriptor.data_type === 'taglist'
                        ? 1000 - (getIndex(i, k) % 1000) // Needed for combo to be above the next cell
                        : undefined,
                    left: offsets['editor-' + j]
                      ? `${offsets['editor-' + j]}px`
                      : '0'
                  }"
                  :key="shot.id + '-' + descriptor.id"
                  v-for="(descriptor, j) in stickedVisibleMetadataDescriptors"
                >
                  <metadata-input
                    :entity="shot"
                    :descriptor="descriptor"
                    :indexes="{ i, j, k }"
                    @metadata-changed="$emit('metadata-changed', $event)"
                  />
                </td>
              </template>

              <template v-if="!isLoading">
                <validation-cell
                  :ref="`validation-${getIndex(i, k)}-${j}`"
                  :key="columnId + '-' + shot.id"
                  :class="{
                    canceled: shot.canceled,
                    'validation-cell': !hiddenColumns[columnId],
                    'hidden-validation-cell': hiddenColumns[columnId],
                    'datatable-row-header': true
                  }"
                  :canceled="shot.canceled"
                  :column="taskTypeMap.get(columnId)"
                  :column-y="j"
                  :contact-sheet="displaySettings.contactSheetMode"
                  :entity="shot"
                  :is-assignees="displaySettings.showAssignations"
                  :is-casting-ready="isCastingReady(shot, columnId)"
                  :is-static="true"
                  :left="
                    offsets['validation-' + j]
                      ? `${offsets['validation-' + j]}px`
                      : '0'
                  "
                  :minimized="hiddenColumns[columnId]"
                  :row-x="getIndex(i, k)"
                  :selected="isSelected(i, k, j)"
                  :sticked="true"
                  :task-href="taskHref(shot.validations.get(columnId))"
                  :task-test="taskMap.get(shot.validations.get(columnId))"
                  @select="infos => onTaskSelected(infos, true)"
                  @unselect="infos => onTaskUnselected(infos, true)"
                  v-for="(columnId, j) in stickedDisplayedValidationColumns"
                />
              </template>

              <description-cell
                class="description"
                :entry="shot"
                :editable="isCurrentUserManager"
                @description-changed="
                  value => onDescriptionChanged(shot, value)
                "
                v-if="
                  !isCurrentUserClient &&
                  displaySettings.showInfos &&
                  isShotDescription
                "
              />

              <!-- Fixed attributes -->
              <td
                class="time-spent selectable number-cell"
                v-if="
                  !isCurrentUserClient &&
                  displaySettings.showInfos &&
                  isShotTime &&
                  metadataDisplayHeaders.timeSpent
                "
              >
                {{ formatDuration(shot.timeSpent) }}
              </td>

              <td
                class="estimation selectable number-cell"
                v-if="
                  !isCurrentUserClient &&
                  displaySettings.showInfos &&
                  isShotEstimation &&
                  metadataDisplayHeaders.estimation
                "
              >
                {{ formatDuration(shot.estimation) }}
              </td>

              <td
                class="drawings number-cell"
                v-if="
                  displaySettings.showInfos &&
                  isPaperProduction &&
                  metadataDisplayHeaders.drawings
                "
              >
                {{ shot.nb_drawings }}
              </td>

              <td
                class="frames number-cell"
                v-if="
                  isFrames &&
                  !isPaperProduction &&
                  displaySettings.showInfos &&
                  metadataDisplayHeaders.frames
                "
              >
                <input
                  class="input-editor"
                  step="1"
                  v-number-value="shot.nb_frames"
                  type="number"
                  min="0"
                  @input="event => onNbFramesChanged(shot, event.target)"
                  @keydown="onNumberFieldKeyDown"
                  @keyup.ctrl="onInputKeyUp"
                  v-if="isCurrentUserManager"
                />
                <span class="metadata-value selectable" v-else>
                  {{ shot.nb_frames }}
                </span>
              </td>

              <td
                class="framein number-cell"
                v-if="
                  isFrameIn &&
                  displaySettings.showInfos &&
                  metadataDisplayHeaders.frameIn
                "
              >
                <span
                  class="metadata-value selectable"
                  v-if="displaySettings.inOutTimecode"
                >
                  {{
                    formatToTimecode(
                      getMetadataFieldValue({ field_name: 'frame_in' }, shot)
                    )
                  }}
                </span>
                <input
                  class="input-editor"
                  step="1"
                  type="number"
                  min="0"
                  v-number-value="
                    getMetadataFieldValue({ field_name: 'frame_in' }, shot)
                  "
                  @input="
                    event =>
                      onMetadataFieldChanged(
                        shot,
                        { field_name: 'frame_in', data_type: 'number' },
                        event
                      )
                  "
                  @keydown="onNumberFieldKeyDown"
                  @keyup.ctrl="onInputKeyUp"
                  v-else-if="isCurrentUserManager"
                />
                <span class="metadata-value selectable" v-else>
                  {{ getMetadataFieldValue({ field_name: 'frame_in' }, shot) }}
                </span>
              </td>
              <td
                class="frameout number-cell"
                :class="{ 'timecode-cell': displaySettings.inOutTimecode }"
                v-if="
                  isFrameOut &&
                  displaySettings.showInfos &&
                  metadataDisplayHeaders.frameOut
                "
              >
                <span
                  class="metadata-value selectable"
                  v-if="displaySettings.inOutTimecode"
                >
                  {{
                    formatToTimecode(
                      getMetadataFieldValue({ field_name: 'frame_out' }, shot)
                    )
                  }}
                </span>
                <input
                  class="input-editor"
                  step="1"
                  type="number"
                  min="0"
                  v-number-value="
                    getMetadataFieldValue({ field_name: 'frame_out' }, shot)
                  "
                  @keydown="onNumberFieldKeyDown"
                  @input="
                    event =>
                      onMetadataFieldChanged(
                        shot,
                        { field_name: 'frame_out', data_type: 'number' },
                        event
                      )
                  "
                  @keyup.ctrl="onInputKeyUp"
                  v-else-if="isCurrentUserManager"
                />
                <span class="metadata-value selectable" v-else>
                  {{ getMetadataFieldValue({ field_name: 'frame_out' }, shot) }}
                </span>
              </td>

              <td
                class="fps number-cell"
                v-if="
                  isFps &&
                  displaySettings.showInfos &&
                  metadataDisplayHeaders.fps
                "
              >
                <input
                  class="input-editor"
                  min="0"
                  max="1000"
                  step="0.001"
                  type="number"
                  v-number-value="
                    getMetadataFieldValue({ field_name: 'fps' }, shot)
                  "
                  @keydown="onNumberFieldKeyDown"
                  @input="
                    event =>
                      onMetadataFieldChanged(
                        shot,
                        { field_name: 'fps', data_type: 'number' },
                        event
                      )
                  "
                  @keyup.ctrl="onInputKeyUp"
                  v-if="isCurrentUserManager"
                />
                <span class="metadata-value selectable" v-else>
                  {{ getMetadataFieldValue({ field_name: 'fps' }, shot) }}
                </span>
              </td>

              <td
                class="max-retakes number-cell"
                v-if="
                  isMaxRetakes &&
                  displaySettings.showInfos &&
                  metadataDisplayHeaders.maxRetakes
                "
              >
                <input
                  class="input-editor"
                  type="number"
                  step="1"
                  v-number-value="
                    getMetadataFieldValue({ field_name: 'max_retakes' }, shot)
                  "
                  @keydown="onNumberFieldKeyDown"
                  @input="
                    event =>
                      onMetadataFieldChanged(
                        shot,
                        { field_name: 'max_retakes', data_type: 'number' },
                        event
                      )
                  "
                  @keyup.ctrl="onInputKeyUp"
                  v-if="isCurrentUserManager"
                />
                <span class="metadata-value selectable" v-else>
                  {{
                    getMetadataFieldValue({ field_name: 'max_retakes' }, shot)
                  }}
                </span>
              </td>

              <td
                class="resolution"
                v-if="
                  isResolution &&
                  displaySettings.showInfos &&
                  metadataDisplayHeaders.resolution
                "
              >
                <input
                  :class="{
                    'input-editor': true,
                    error: !isValidResolution(shot)
                  }"
                  :value="
                    getMetadataFieldValue({ field_name: 'resolution' }, shot)
                  "
                  @input="
                    event =>
                      onMetadataFieldChanged(
                        shot,
                        { field_name: 'resolution' },
                        event
                      )
                  "
                  @keyup.ctrl="onInputKeyUp"
                  v-if="isCurrentUserManager"
                />
                <span class="metadata-value selectable" v-else>
                  {{
                    getMetadataFieldValue({ field_name: 'resolution' }, shot)
                  }}
                </span>
              </td>

              <!-- other metadata cells -->
              <template v-if="displaySettings.showInfos">
                <td
                  class="metadata-descriptor"
                  @keyup.ctrl="onInputKeyUp"
                  :title="shot.data ? shot.data[descriptor.field_name] : ''"
                  :key="shot.id + '-' + descriptor.id"
                  v-for="(
                    descriptor, j
                  ) in nonStickedVisibleMetadataDescriptors"
                >
                  <metadata-input
                    :entity="shot"
                    :descriptor="descriptor"
                    :indexes="{ i, j, k }"
                    @metadata-changed="$emit('metadata-changed', $event)"
                  />
                </td>
              </template>

              <template v-if="!isLoading">
                <validation-cell
                  :ref="`validation-${getIndex(i, k)}-${
                    j + stickedDisplayedValidationColumns.length
                  }`"
                  :class="{
                    'validation-cell': !hiddenColumns[columnId],
                    'hidden-validation-cell': hiddenColumns[columnId]
                  }"
                  :canceled="shot.canceled"
                  :key="`${columnId}-${shot.id}`"
                  :column="taskTypeMap.get(columnId)"
                  :contact-sheet="displaySettings.contactSheetMode"
                  :entity="shot"
                  :task-href="taskHref(shot.validations?.get(columnId))"
                  :task-test="
                    taskMap.get(
                      shot.validations ? shot.validations.get(columnId) : null
                    )
                  "
                  :minimized="hiddenColumns[columnId]"
                  :selected="
                    isSelected(
                      i,
                      k,
                      j + stickedDisplayedValidationColumns.length
                    )
                  "
                  :row-x="getIndex(i, k)"
                  :column-y="j"
                  :is-assignees="displaySettings.showAssignations"
                  :is-casting-ready="isCastingReady(shot, columnId)"
                  :casting-title="castingTitle(shot, columnId)"
                  @select="onTaskSelected"
                  @unselect="onTaskUnselected"
                  v-for="(columnId, j) in nonStickedDisplayedValidationColumns"
                />
              </template>
              <row-actions-cell
                :entry="shot"
                :hide-history="false"
                @delete-clicked="$emit('delete-clicked', shot)"
                @edit-clicked="$emit('edit-clicked', shot)"
                @history-clicked="$emit('shot-history', shot)"
                @restore-clicked="$emit('restore-clicked', shot)"
                v-if="isCurrentUserManager"
              />
              <td class="actions" v-else></td>
            </tr>
          </tbody>
        </template>
      </table>
    </div>
    <table-info :is-loading="isLoading" :is-error="isError" big-cells />

    <empty-list
      :text="$t('shots.empty_list')"
      :read-only-text="$t('shots.empty_list_read_only')"
      :button-text="isAllEpisodes ? '' : $t('shots.new_shots')"
      @create="$emit('add-shots')"
      v-if="isEmptyList && !isLoading"
    />

    <p class="has-text-centered nb-shots" v-if="!isEmptyList && !isLoading">
      {{ displayedShotsLength }}
      {{ $t('shots.number', { count: displayedShotsLength }) }}
      <span v-if="displayedShotsFrames">
        -
        {{ displayedShotsFrames }}
        {{ $t('main.nb_frames', { count: displayedShotsFrames }) }}
      </span>
      <span v-if="isPaperProduction">
        -
        {{ displayedShotsDrawings }}
        {{ $t('main.nb_drawings', { count: displayedShotsDrawings }) }}
      </span>
      <span v-if="displayedShotsTimeSpent > 0 || displayedShotsEstimation > 0">
        ({{ formatDuration(displayedShotsTimeSpent) }}
        {{
          isDurationInHours
            ? $t('main.hours_spent', {
                count: formatDuration(displayedShotsTimeSpent, false)
              })
            : $t('main.days_spent', {
                count: formatDuration(displayedShotsTimeSpent, false)
              })
        }},
        {{ formatDuration(displayedShotsEstimation) }}
        {{
          isDurationInHours
            ? $t('main.hours_estimated', {
                count: formatDuration(displayedShotsEstimation, false)
              })
            : $t('main.man_days', {
                count: formatDuration(displayedShotsEstimation, false)
              })
        }})
      </span>
    </p>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

import { useEntityList } from '@/composables/entityList'
import { useFormat } from '@/composables/format'
import vNumberValue from '@/directives/number-value'
import { getMetadataFieldValue } from '@/lib/descriptors'
import { readNumberInput } from '@/lib/number'
import { getTaskHref } from '@/lib/path'
import { range } from '@/lib/time'
import { formatToTimecode } from '@/lib/video'

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
  displayedShots: { type: Array, default: () => [] },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  validationColumns: { type: Array, default: () => [] },
  departmentFilter: { type: Array, default: () => [] }
})

const emit = defineEmits([
  'add-metadata',
  'add-shots',
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
  'restore-clicked',
  'scroll',
  'sequence-clicked',
  'shot-history'
])

// State
// --------------------------------------------------------------------------

const lastSelectedShot = ref(null)

// Computed
// --------------------------------------------------------------------------

const currentEpisode = computed(() => store.getters.currentEpisode)
const currentProduction = computed(() => store.getters.currentProduction)
const displayedShotsCount = computed(() => store.getters.displayedShotsCount)
const displayedShotsDrawings = computed(
  () => store.getters.displayedShotsDrawings
)
const displayedShotsEstimation = computed(
  () => store.getters.displayedShotsEstimation
)
const displayedShotsFrames = computed(() => store.getters.displayedShotsFrames)
const displayedShotsLength = computed(() => store.getters.displayedShotsLength)
const displayedShotsTimeSpent = computed(
  () => store.getters.displayedShotsTimeSpent
)
const isBigThumbnails = computed(() => store.getters.isBigThumbnails)
const isCurrentUserClient = computed(() => store.getters.isCurrentUserClient)
// Production-scoped: effective role on the current production (global
// admins/managers still pass, but a per-project override wins).
const isCurrentUserManager = computed(
  () => store.getters.isCurrentUserProductionManager
)
const isCurrentUserSupervisor = computed(
  () => store.getters.isCurrentUserProductionSupervisor
)
const isFps = computed(() => store.getters.isFps)
const isFrameIn = computed(() => store.getters.isFrameIn)
const isFrameOut = computed(() => store.getters.isFrameOut)
const isFrames = computed(() => store.getters.isFrames)
const isMaxRetakes = computed(() => store.getters.isMaxRetakes)
const isPaperProduction = computed(() => store.getters.isPaperProduction)
const isResolution = computed(() => store.getters.isResolution)
const isShotDescription = computed(() => store.getters.isShotDescription)
const isShotEstimation = computed(() => store.getters.isShotEstimation)
const isShotTime = computed(() => store.getters.isShotTime)
const isTVShow = computed(() => store.getters.isTVShow)
const selectedShots = computed(() => store.getters.selectedShots)
const shotFilledColumns = computed(() => store.getters.shotFilledColumns)
const shotMetadataDescriptors = computed(
  () => store.getters.shotMetadataDescriptors
)
const shotSearchText = computed(() => store.getters.shotSearchText)
const shotSelectionGrid = computed(() => store.getters.shotSelectionGrid)
const taskMap = computed(() => store.getters.taskMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

const isAllEpisodes = computed(
  () => isTVShow.value && currentEpisode.value?.id === 'all'
)

const isEmptyList = computed(
  () =>
    props.displayedShots &&
    props.displayedShots[0].length === 0 &&
    !props.isLoading &&
    !props.isError &&
    (!shotSearchText.value || shotSearchText.value.length === 0)
)

const isListVisible = computed(
  () => !props.isLoading && !props.isError && displayedShotsCount.value > 0
)

const {
  columnSelectorDisplayed,
  getEntityLineNumber,
  getGroupKey,
  getValidationStyle,
  hiddenColumns,
  isEmptyTask,
  isMetadataColumnEditAllowed,
  isValidResolution,
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
  onNumberFieldKeyDown,
  onSelectColumn,
  onSortByFieldClicked,
  onSortByMetadataClicked,
  onSortByTaskTypeClicked,
  onTaskSelected,
  onTaskUnselected,
  selectTaskFromQuery,
  setScrollPosition,
  shiftKeyPressed,
  showFieldHeaderMenu,
  showHeaderMenu,
  showMetadataHeaderMenu,
  startBrowsing,
  stickColumnClicked,
  stickedColumns,
  stickedDisplayedValidationColumns,
  stickedVisibleMetadataDescriptors,
  toggleColumnSelector,
  updateOffsets
} = useEntityList({
  type: 'shot',
  props,
  emit,
  entities: computed(() => props.displayedShots),
  filledColumns: shotFilledColumns,
  metadataDescriptors: shotMetadataDescriptors,
  metadataDisplayHeaders: {
    drawings: true,
    fps: true,
    frameIn: true,
    frameOut: true,
    frames: true,
    estimation: true,
    maxRetakes: true,
    resolution: true,
    timeSpent: true
  },
  isEmptyList,
  onScrollEnd: () => store.dispatch('displayMoreShots')
})

// Functions
// --------------------------------------------------------------------------

const groupHeader = group => {
  const shot = group[0]
  if (!shot) return ''
  // Sequence names repeat across episodes: say which one in All mode.
  return isAllEpisodes.value && shot.episode_name
    ? `${shot.episode_name} / ${shot.sequence_name}`
    : shot.sequence_name
}

const getIndex = (i, k) => getEntityLineNumber(props.displayedShots, i, k)

const isSelected = (indexInGroup, groupIndex, columnIndex) =>
  shotSelectionGrid.value.has(
    `${getIndex(indexInGroup, groupIndex)}-${columnIndex}`
  )

const getCastingTask = (shot, columnId) =>
  shot.nb_entities_out
    ? taskMap.value.get(shot.validations.get(columnId))
    : null

const isCastingReady = (shot, columnId) => {
  const task = getCastingTask(shot, columnId)
  return Boolean(
    task &&
    task.nb_assets_ready > 0 &&
    shot.nb_entities_out === task.nb_assets_ready
  )
}

const castingTitle = (shot, columnId) => {
  const task = getCastingTask(shot, columnId)
  return task
    ? `${task.nb_assets_ready} / ${shot.nb_entities_out} assets ready`
    : ''
}

// Shift-click selects every line between the last selected one and this
// one.
const toggleLine = (shot, event) => {
  const selected = event.target.checked
  const shotsToSelect = [shot]
  if (selected && shiftKeyPressed.value && lastSelectedShot.value) {
    const shots = props.displayedShots.flat()
    const indexes = [lastSelectedShot.value.id, shot.id].map(id =>
      shots.findIndex(displayedShot => displayedShot.id === id)
    )
    const [startIndex, endIndex] = indexes.sort((a, b) => a - b)
    if (startIndex >= 0) {
      range(startIndex, endIndex).forEach(index => {
        shotsToSelect.push(shots[index])
      })
    }
  }
  if (selected) {
    lastSelectedShot.value = shot
  }
  shotsToSelect.forEach(shot => {
    store.dispatch('setShotSelection', { shot, selected })
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

const shotPath = shotId => {
  const route = {
    name: 'shot',
    params: { production_id: currentProduction.value?.id, shot_id: shotId }
  }
  if (isTVShow.value && currentEpisode.value) {
    route.name = 'episode-shot'
    route.params.episode_id = currentEpisode.value.id
  }
  return route
}

// A change on a selected line applies to every selected line.
const onNbFramesChanged = (entry, input) => {
  const value = readNumberInput(input)
  if (value === undefined) return
  const shotsToChange = selectedShots.value.has(entry.id)
    ? selectedShots.value
    : [entry]
  shotsToChange.forEach(shot => {
    emit('field-changed', { entry: shot, fieldName: 'nb_frames', value })
  })
}

// Watchers
// --------------------------------------------------------------------------

watch(isBigThumbnails, updateOffsets)

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

.bold {
  font-weight: bold;
}

.name a {
  color: inherit;
}

thead .name.shot-name {
  min-width: 110px;
  width: 300px;
}

.episode {
  min-width: 100px;
  width: 100px;
}

.sequence {
  min-width: 100px;
  width: 100px;
  font-weight: bold;
}

.framein {
  min-width: 60px;
  width: 60px;
}

.frameout {
  min-width: 60px;
  width: 60px;
}

.fps {
  min-width: 70px;
  max-width: 70px;
  width: 70px;
}

.resolution {
  min-width: 110px;
  max-width: 110px;
  width: 110px;
}

.max-retakes {
  min-width: 80px;
  max-width: 80px;
  width: 80px;
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

.frames {
  min-width: 80px;
  max-width: 80px;
  width: 80px;
}

.drawings {
  min-width: 80px;
  max-width: 80px;
  width: 80px;
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

td.sequence {
  font-size: 1.2em;
}

span.thumbnail-empty {
  display: block;
  width: 50px;
  height: 30px;
  background-color: #f3f3f3;
}

.datatable-row th.name {
  font-size: 1.1em;
  padding: 6px;
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

.metadata-value {
  padding: 0.5rem 0.75rem;
}
</style>
