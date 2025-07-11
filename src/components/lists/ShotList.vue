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
          isMetadataColumnEditAllowed(lastMetadaDataHeaderMenuDisplayed)
        "
        :is-sticked="stickedColumns[lastMetadaDataHeaderMenuDisplayed]"
        @edit-clicked="onEditMetadataClicked()"
        @delete-clicked="onDeleteMetadataClicked()"
        @sort-by-clicked="onSortByMetadataClicked()"
        @toggle-stick="metadataStickColumnClicked($event)"
      />

      <table class="datatable multi-section">
        <thead class="datatable-head" id="datatable-shot" v-columns-resizable>
          <tr>
            <th
              scope="col"
              class="name shot-name datatable-row-header"
              ref="th-shot"
            >
              <div class="flexrow">
                <span class="flexrow-item">
                  {{ $t('shots.fields.name') }}
                </span>
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
              </div>
            </th>

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
              :style="{
                'z-index': 1001
              }"
              v-for="(descriptor, j) in stickedVisibleMetadataDescriptors"
            />

            <template v-if="!isLoading">
              <validation-header
                :ref="`validation-${columnIndexInGrid}`"
                :key="columnId"
                :hidden-columns="hiddenColumns"
                :column-id="columnId"
                :title="taskTypeMap.get(columnId).name"
                :validation-style="getValidationStyle(columnId)"
                :left="
                  offsets['validation-' + columnIndexInGrid]
                    ? `${offsets['validation-' + columnIndexInGrid]}px`
                    : '0'
                "
                type="assets"
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
              v-if="
                !isCurrentUserClient &&
                displaySettings.showInfos &&
                isShotDescription
              "
            >
              {{ $t('shots.fields.description') }}
            </th>

            <th
              scope="col"
              ref="th-spent"
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
              ref="th-spent"
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

            <th scope="col" class="actions" ref="actionsSection">
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
                v-model="metadataDisplayHeaders"
                v-show="columnSelectorDisplayed"
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
              <th scope="rowgroup" :colspan="visibleColumns">
                <div
                  class="datatable-row-header"
                  @click="$emit('sequence-clicked', group[0].sequence_name)"
                >
                  {{ group[0] ? group[0].sequence_name : '' }}
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
                  >
                    {{ shot.name }}
                  </router-link>
                </div>
              </th>

              <!-- Metadata stick -->
              <td
                :ref="`editor-${getIndex(i, k)}-${j}`"
                class="metadata-descriptor datatable-row-header"
                :title="shot.data ? shot.data[descriptor.field_name] : ''"
                :style="{
                  'z-index': 1000 - i - k * 100, // Needed for combo to be above the next cell
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
                class="frames number-cell"
                v-if="
                  isFrames &&
                  displaySettings.showInfos &&
                  metadataDisplayHeaders.frames
                "
              >
                <input
                  class="input-editor"
                  step="1"
                  :value="shot.nb_frames"
                  type="number"
                  min="0"
                  @input="event => onNbFramesChanged(shot, event.target.value)"
                  @keydown="onNumberFieldKeyDown"
                  @keyup.ctrl="
                    event =>
                      onInputKeyUp(event, getIndex(i, k), descriptorLength)
                  "
                  v-if="isCurrentUserManager"
                />
                <span class="metadata-value selectable" v-else>
                  {{ shot.nb_frames }}
                </span>
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
                class="framein number-cell"
                :class="{ 'timecode-cell': displaySettings.inOutTimecode }"
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
                  :value="
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
                  @keyup.ctrl="
                    event =>
                      onInputKeyUp(event, getIndex(i, k), descriptorLength + 1)
                  "
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
                  :value="
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
                  @keyup.ctrl="
                    event =>
                      onInputKeyUp(event, getIndex(i, k), descriptorLength + 2)
                  "
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
                  :value="getMetadataFieldValue({ field_name: 'fps' }, shot)"
                  @keydown="onNumberFieldKeyDown"
                  @input="
                    event =>
                      onMetadataFieldChanged(
                        shot,
                        { field_name: 'fps', data_type: 'number' },
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
                  :value="
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
                  @keyup.ctrl="
                    event =>
                      onInputKeyUp(event, getIndex(i, k), descriptorLength + 3)
                  "
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
                  @keyup.ctrl="
                    event =>
                      onInputKeyUp(event, getIndex(i, k), descriptorLength + 3)
                  "
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
    <table-info :is-loading="isLoading" :is-error="isError" />

    <div
      class="has-text-centered"
      v-if="isEmptyList && !isCurrentUserClient && !isLoading"
    >
      <p class="info">
        <img src="../../assets/illustrations/empty_shot.png" />
      </p>
      <p class="info">{{ $t('shots.empty_list') }}</p>
      <button-simple
        class="level-item big-button"
        :text="$t('shots.new_shots')"
        @click="$emit('add-shots')"
      />
    </div>
    <div
      class="has-text-centered"
      v-if="isEmptyList && isCurrentUserClient && !isLoading"
    >
      <p class="info">
        <img src="../../assets/illustrations/empty_shot.png" />
      </p>
      <p class="info">{{ $t('shots.empty_list_client') }}</p>
    </div>

    <p class="has-text-centered nb-shots" v-if="!isEmptyList && !isLoading">
      {{ displayedShotsLength }} {{ $tc('shots.number', displayedShotsLength) }}
      <span v-if="displayedShotsFrames">
        -
        {{ displayedShotsFrames }}
        {{ $tc('main.nb_frames', displayedShotsFrames) }}
      </span>
      <span v-if="isPaperProduction">
        -
        {{ displayedShotsDrawings }}
        {{ $tc('main.nb_drawings', displayedShotsDrawings) }}
      </span>
      <span
        v-show="displayedShotsTimeSpent > 0 || displayedShotsEstimation > 0"
      >
        ({{ formatDuration(displayedShotsTimeSpent) }}
        {{ $tc('main.days_spent', displayedShotsTimeSpent) }},
        {{ formatDuration(displayedShotsEstimation) }}
        {{ $tc('main.man_days', displayedShotsEstimation) }})
      </span>
    </p>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import preferences from '@/lib/preferences'
import { range } from '@/lib/time'
import { formatToTimecode } from '@/lib/video'

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
  name: 'shot-list',

  mixins: [
    descriptorMixin,
    domMixin,
    formatListMixin,
    entityListMixin,
    selectionListMixin
  ],

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

  props: {
    displaySettings: {
      type: Object,
      default: () => ({})
    },
    displayedShots: {
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

  emits: [
    'add-shots',
    'create-tasks',
    'delete-clicked',
    'edit-clicked',
    'field-changed',
    'metadata-changed',
    'restore-clicked',
    'scroll',
    'sequence-clicked',
    'shot-history'
  ],

  data() {
    return {
      type: 'shot',
      hiddenColumns: {},
      lastHeaderMenuDisplayed: null,
      lastMetadaDataHeaderMenuDisplayed: null,
      lastHeaderMenuDisplayedIndexInGrid: null,
      lastSelectedShot: null,
      lastSelection: null,
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

  mounted() {
    this.stickedColumns =
      preferences.getObjectPreference(this.localStorageStickKey) || {}
    this.addEvents(this.domEvents)
  },

  beforeUnmount() {
    this.removeEvents(this.domEvents)
    document.body.style.cursor = 'default'
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'currentEpisode',
      'displayedShotsEstimation',
      'displayedShotsCount',
      'displayedShotsDrawings',
      'displayedShotsFrames',
      'displayedShotsLength',
      'displayedShotsTimeSpent',
      'isBigThumbnails',
      'isCurrentUserAdmin',
      'isCurrentUserManager',
      'isCurrentUserClient',
      'isCurrentUserSupervisor',
      'isFps',
      'isFrames',
      'isFrameIn',
      'isFrameOut',
      'isPaperProduction',
      'isMaxRetakes',
      'isResolution',
      'isSingleEpisode',
      'isShotDescription',
      'isShotEstimation',
      'isShotTime',
      'isShowAssignations',
      'displaySettings.showInfos',
      'isTVShow',
      'nbSelectedTasks',
      'selectedShots',
      'selectedTasks',
      'sequenceMap',
      'shotFilledColumns',
      'shotMap',
      'shotMetadataDescriptors',
      'shots',
      'shotSearchText',
      'shotSelectionGrid',
      'taskMap',
      'taskTypeMap',
      'user'
    ]),

    isEmptyList() {
      return (
        this.displayedShots &&
        this.displayedShots[0].length === 0 &&
        !this.isLoading &&
        !this.isError &&
        (!this.shotSearchText || this.shotSearchText.length === 0)
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
      return !this.isLoading && !this.isError && this.displayedShotsCount > 0
    },

    visibleColumns() {
      let count = 2
      count +=
        !this.isCurrentUserClient &&
        this.displaySettings.showInfos &&
        this.isShotDescription
          ? 1
          : 0
      count += this.visibleMetadataDescriptors.length
      count +=
        !this.isCurrentUserClient &&
        this.displaySettings.showInfos &&
        this.isShotTime &&
        this.metadataDisplayHeaders.timeSpent
          ? 1
          : 0
      count +=
        !this.isCurrentUserClient &&
        this.displaySettings.showInfos &&
        this.isShotEstimation &&
        this.metadataDisplayHeaders.estimation
          ? 1
          : 0

      if (this.isPaperProduction) {
        count +=
          this.displaySettings.showInfos && this.metadataDisplayHeaders.drawings
            ? 1
            : 0
      } else {
        count +=
          this.displaySettings.showInfos && this.metadataDisplayHeaders.frames
            ? 1
            : 0
      }
      count +=
        this.displaySettings.showInfos &&
        this.isFrameIn &&
        this.metadataDisplayHeaders.frameIn
          ? 1
          : 0
      count +=
        this.displaySettings.showInfos &&
        this.isFrameOut &&
        this.metadataDisplayHeaders.frameOut
          ? 1
          : 0
      count +=
        this.displaySettings.showInfos &&
        this.isFps &&
        this.metadataDisplayHeaders.fps
          ? 1
          : 0
      count +=
        this.displaySettings.showInfos &&
        this.isResolution &&
        this.metadataDisplayHeaders.resolution
          ? 1
          : 0
      count +=
        this.displaySettings.showInfos &&
        this.isMaxRetakes &&
        this.metadataDisplayHeaders.max_retakes
          ? 1
          : 0
      count += this.displayedValidationColumns.length
      return count
    },

    displayedValidationColumns() {
      return this.validationColumns.filter(columnId => {
        return (
          this.shotFilledColumns[columnId] &&
          (!this.hiddenColumns[columnId] || this.displaySettings.showInfos)
        )
      })
    },

    metadataDescriptors() {
      return this.shotMetadataDescriptors
    },

    localStorageStickKey() {
      return `stick-shots-${this.currentProduction.id}`
    }
  },

  methods: {
    ...mapActions(['displayMoreShots', 'setShotSelection']),

    formatToTimecode,

    isSelected(indexInGroup, groupIndex, columnIndex) {
      const lineIndex = this.getIndex(indexInGroup, groupIndex)
      return this.shotSelectionGrid[lineIndex][columnIndex]
    },

    isCastingReady(shot, columnId) {
      if (!shot.nb_entities_out) {
        return false
      }
      const task = this.taskMap.get(shot.validations.get(columnId))
      return (
        task &&
        task.nb_assets_ready > 0 &&
        shot.nb_entities_out === task.nb_assets_ready
      )
    },

    castingTitle(shot, columnId) {
      if (!shot.nb_entities_out) {
        return ''
      }
      const task = this.taskMap.get(shot.validations.get(columnId))
      return task
        ? task.nb_assets_ready + ' / ' + shot.nb_entities_out + ' assets ready'
        : ''
    },

    toggleLine(shot, event) {
      const selected = event.target.checked
      const shotsToSelect = [shot]
      if (selected && this.shiftKeyPressed && this.lastSelectedShot) {
        const shotsFlatten = this.displayedShots.flat()
        let startShotIndex = shotsFlatten.findIndex(
          displayedShot => displayedShot.id === this.lastSelectedShot.id
        )
        let endShotIndex = shotsFlatten.findIndex(
          displayedShot => displayedShot.id === shot.id
        )
        if (startShotIndex > endShotIndex) {
          ;[startShotIndex, endShotIndex] = [endShotIndex, startShotIndex]
        }
        if (startShotIndex >= 0 && endShotIndex >= 0) {
          range(startShotIndex, endShotIndex).forEach(index => {
            shotsToSelect.push(shotsFlatten[index])
          })
        }
      }
      if (selected) {
        this.lastSelectedShot = shot
      }
      shotsToSelect.forEach(shot => {
        this.setShotSelection({ shot, selected })
      })
    },

    onBodyScroll(event) {
      if (!this.$refs.body) return
      const position = event.target
      this.$emit('scroll', position.scrollTop)
      const maxHeight =
        this.$refs.body.scrollHeight - this.$refs.body.offsetHeight
      if (maxHeight < position.scrollTop + 100) {
        this.loadMoreShots()
      }
    },

    loadMoreShots() {
      this.displayMoreShots()
    },

    shotPath(shotId) {
      return this.getPath('shot', shotId)
    },

    getPath(section, shotId) {
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

      if (shotId) {
        route.params.shot_id = shotId
      }

      return route
    },

    onInputKeyUp(event, i, j) {
      const listWidth = this.visibleMetadataDescriptors.length + 4
      const listHeight = this.displayedShotsCount
      this.keyMetadataNavigation(listWidth, listHeight, i, j, event.key)
      return this.pauseEvent(event)
    },

    onNbFramesChanged(entry, value) {
      let shotsToChange = []
      if (this.selectedShots.has(entry.id)) {
        shotsToChange = this.selectedShots
      } else {
        shotsToChange = [entry]
      }

      const cleanValue = this.sanitizeIntegerLight(value)

      shotsToChange.forEach(shot => {
        this.$emit('field-changed', {
          entry: shot,
          fieldName: 'nb_frames',
          value: cleanValue
        })
      })
    },

    getIndex(i, k) {
      return this.getEntityLineNumber(this.displayedShots, i, k)
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
        let offset = this.$refs['th-shot'].clientWidth
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
    displayedShots() {
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
    },

    isBigThumbnails() {
      this.updateOffsets()
    }
  }
}
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

.name.shot-name {
  min-width: 110px;
  width: 110px;
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
  min-width: 60px;
  max-width: 60px;
  width: 60px;
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

.timecode-cell {
  min-width: 95px;
  max-width: 95px;
  width: 95px;
  padding: 10px;
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
</style>
