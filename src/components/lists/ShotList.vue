<template>
  <div class="data-list">
    <div class="datatable-wrapper" ref="body" v-scroll="onBodyScroll">
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
              v-for="(descriptor, j) in stickedVisibleMetadataDescriptors"
            />

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
              v-if="!isLoading"
            />

            <th
              scope="col"
              class="description selectable"
              v-if="!isCurrentUserClient && isShowInfos && isShotDescription"
            >
              {{ $t('shots.fields.description') }}
            </th>

            <th
              scope="col"
              ref="th-spent"
              class="time-spent number-cell"
              v-if="
                !isCurrentUserClient &&
                isShowInfos &&
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
                isShowInfos &&
                isShotEstimation &&
                metadataDisplayHeaders.estimation
              "
            >
              {{ $t('main.estimation_short') }}
            </th>

            <th
              class="frames number-cell"
              scope="col"
              v-if="isFrames && isShowInfos && metadataDisplayHeaders.frames"
            >
              {{ $t('shots.fields.nb_frames') }}
            </th>

            <th
              scope="col"
              class="framein number-cell"
              v-if="isFrameIn && isShowInfos && metadataDisplayHeaders.frameIn"
            >
              {{ $t('shots.fields.frame_in') }}
            </th>
            <th
              scope="col"
              class="frameout number-cell"
              v-if="
                isFrameOut && isShowInfos && metadataDisplayHeaders.frameOut
              "
            >
              {{ $t('shots.fields.frame_out') }}
            </th>

            <th
              scope="col"
              class="fps number-cell"
              v-if="isFps && isShowInfos && metadataDisplayHeaders.fps"
            >
              {{ $t('shots.fields.fps') }}
            </th>

            <th
              scope="col"
              class="max-retakes number-cell"
              v-if="
                isMaxRetakes && isShowInfos && metadataDisplayHeaders.maxRetakes
              "
            >
              {{ $t('shots.fields.max_retakes') }}
            </th>

            <th
              scope="col"
              class="resolution"
              v-if="
                isResolution && isShowInfos && metadataDisplayHeaders.resolution
              "
            >
              {{ $t('shots.fields.resolution') }}
            </th>

            <metadata-header
              :key="descriptor.id"
              :descriptor="descriptor"
              @show-metadata-header-menu="
                event => showMetadataHeaderMenu(descriptor.id, event)
              "
              v-for="descriptor in nonStickedVisibleMetadataDescriptors"
              v-if="isShowInfos"
            />

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
              v-if="!isLoading"
            />

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
                ref="headerMetadataSelectorMenu"
                :metadataDisplayHeaders.sync="metadataDisplayHeaders"
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
                v-show="columnSelectorDisplayed && isShowInfos"
              />

              <button-simple
                class="is-small is-pulled-right"
                icon="down"
                @click="toggleColumnSelector"
                v-if="isShowInfos"
              />
            </th>
          </tr>
        </thead>

        <tbody
          class="datatable-body"
          :key="getGroupKey(group, k, 'sequence_id')"
          v-for="(group, k) in displayedShots"
          v-if="!isLoading && isListVisible"
        >
          <tr class="datatable-type-header">
            <th scope="rowgroup" :colspan="visibleColumns">
              <div
                class="datatable-row-header"
                @click="$emit('sequence-clicked', group[0].sequence_name)"
              >
                {{ group[0] ? group[0].sequence_name : '' }}
                <!--info-question-mark
                class="flexrow-item"
                :text="sequenceMap.get(group[0].sequence_id).description"
                v-if="sequenceMap.get(group[0].sequence_id).description"
              /-->
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
                  :checked="selectedShots.has(shot.id)"
                  @input="event => toggleLine(shot, event)"
                  v-show="isCurrentUserManager"
                />
                <entity-thumbnail
                  :entity="shot"
                  :width="isBigThumbnails ? 150 : 50"
                  :height="isBigThumbnails ? 100 : 33"
                  :empty-width="isBigThumbnails ? 150 : 50"
                  :empty-height="isBigThumbnails ? 100 : 34"
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
                v-on="$listeners"
              />
            </td>

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
              :columnY="j"
              :entity="shot"
              :is-assignees="isShowAssignations"
              :is-casting-ready="isCastingReady(shot, columnId)"
              :is-static="true"
              :left="
                offsets['validation-' + j]
                  ? `${offsets['validation-' + j]}px`
                  : '0'
              "
              :minimized="hiddenColumns[columnId]"
              :rowX="getIndex(i, k)"
              :selected="isSelected(i, k, j)"
              :sticked="true"
              :task-test="taskMap.get(shot.validations.get(columnId))"
              @select="infos => onTaskSelected(infos, true)"
              @unselect="infos => onTaskUnselected(infos, true)"
              v-for="(columnId, j) in stickedDisplayedValidationColumns"
              v-if="!isLoading"
            />

            <description-cell
              class="description"
              :entry="shot"
              :editable="isCurrentUserManager"
              @description-changed="value => onDescriptionChanged(shot, value)"
              v-if="!isCurrentUserClient && isShowInfos && isShotDescription"
            />

            <!-- Fixed attributes -->
            <td
              class="time-spent selectable number-cell"
              v-if="
                !isCurrentUserClient &&
                isShowInfos &&
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
                isShowInfos &&
                isShotEstimation &&
                metadataDisplayHeaders.estimation
              "
            >
              {{ formatDuration(shot.estimation) }}
            </td>

            <td
              class="frames number-cell"
              v-if="isFrames && isShowInfos && metadataDisplayHeaders.frames"
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
                  event => onInputKeyUp(event, getIndex(i, k), descriptorLength)
                "
                v-if="isCurrentUserManager"
              />
              <span class="metadata-value selectable" v-else>
                {{ shot.nb_frames }}
              </span>
            </td>
            <td
              class="framein number-cell"
              v-if="isFrameIn && isShowInfos && metadataDisplayHeaders.frameIn"
            >
              <input
                class="input-editor"
                step="1"
                type="number"
                min="0"
                :value="getMetadataFieldValue({ field_name: 'frame_in' }, shot)"
                @input="
                  event =>
                    onMetadataFieldChanged(
                      shot,
                      { field_name: 'frame_in' },
                      event
                    )
                "
                @keydown="onNumberFieldKeyDown"
                @keyup.ctrl="
                  event =>
                    onInputKeyUp(event, getIndex(i, k), descriptorLength + 1)
                "
                v-if="isCurrentUserManager"
              />
              <span class="metadata-value selectable" v-else>
                {{ getMetadataFieldValue({ field_name: 'frame_in' }, shot) }}
              </span>
            </td>
            <td
              class="frameout number-cell"
              v-if="
                isFrameOut && isShowInfos && metadataDisplayHeaders.frameOut
              "
            >
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
                      { field_name: 'frame_out' },
                      event
                    )
                "
                @keyup.ctrl="
                  event =>
                    onInputKeyUp(event, getIndex(i, k), descriptorLength + 2)
                "
                v-if="isCurrentUserManager"
              />
              <span class="metadata-value selectable" v-else>
                {{ getMetadataFieldValue({ field_name: 'frame_out' }, shot) }}
              </span>
            </td>

            <td
              class="fps number-cell"
              v-if="isFps && isShowInfos && metadataDisplayHeaders.fps"
            >
              <input
                class="input-editor"
                min="0"
                step="1"
                type="number"
                :value="getMetadataFieldValue({ field_name: 'fps' }, shot)"
                @keydown="onNumberFieldKeyDown"
                @input="
                  event =>
                    onMetadataFieldChanged(shot, { field_name: 'fps' }, event)
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
                isMaxRetakes && isShowInfos && metadataDisplayHeaders.maxRetakes
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
                      { field_name: 'max_retakes' },
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
                {{ getMetadataFieldValue({ field_name: 'max_retakes' }, shot) }}
              </span>
            </td>

            <td
              class="resolution"
              v-if="
                isResolution && isShowInfos && metadataDisplayHeaders.resolution
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
                {{ getMetadataFieldValue({ field_name: 'resolution' }, shot) }}
              </span>
            </td>

            <!-- other metadata cells -->
            <td
              class="metadata-descriptor"
              :title="shot.data ? shot.data[descriptor.field_name] : ''"
              :key="shot.id + '-' + descriptor.id"
              v-for="(descriptor, j) in nonStickedVisibleMetadataDescriptors"
              v-if="isShowInfos"
            >
              <metadata-input
                :entity="shot"
                :descriptor="descriptor"
                :indexes="{ i, j, k }"
                v-on="$listeners"
              />
            </td>

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
              :entity="shot"
              :task-test="
                taskMap.get(
                  shot.validations ? shot.validations.get(columnId) : null
                )
              "
              :minimized="hiddenColumns[columnId]"
              :selected="
                isSelected(i, k, j + stickedDisplayedValidationColumns.length)
              "
              :rowX="getIndex(i, k)"
              :columnY="j"
              :is-assignees="isShowAssignations"
              :is-casting-ready="isCastingReady(shot, columnId)"
              :casting-title="castingTitle(shot, columnId)"
              @select="onTaskSelected"
              @unselect="onTaskUnselected"
              v-for="(columnId, j) in nonStickedDisplayedValidationColumns"
              v-if="!isLoading"
            />
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

import { range } from '@/lib/time'
import { descriptorMixin } from '@/components/mixins/descriptors'
import { domMixin } from '@/components/mixins/dom'
import { entityListMixin } from '@/components/mixins/entity_list'
import { formatListMixin } from '@/components/mixins/format'
import { selectionListMixin } from '@/components/mixins/selection'

import ButtonSimple from '@/components/widgets/ButtonSimple'
import DescriptionCell from '@/components/cells/DescriptionCell'
import EntityThumbnail from '@/components/widgets/EntityThumbnail'
import MetadataHeader from '@/components/cells/MetadataHeader'
import MetadataInput from '@/components/cells/MetadataInput'
import RowActionsCell from '@/components/cells/RowActionsCell'
import TableMetadataHeaderMenu from '@/components/widgets/TableMetadataHeaderMenu'
import TableMetadataSelectorMenu from '@/components/widgets/TableMetadataSelectorMenu'
import TableHeaderMenu from '@/components/widgets/TableHeaderMenu'
import TableInfo from '@/components/widgets/TableInfo'
import ValidationCell from '@/components/cells/ValidationCell'
import ValidationHeader from '@/components/cells/ValidationHeader'

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
      stickedColumns: {}
    }
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'currentEpisode',
      'displayedShotsEstimation',
      'displayedShotsCount',
      'displayedShotsLength',
      'displayedShotsTimeSpent',
      'displayedShotsFrames',
      'isBigThumbnails',
      'isCurrentUserAdmin',
      'isCurrentUserManager',
      'isCurrentUserClient',
      'isCurrentUserSupervisor',
      'isFps',
      'isFrames',
      'isFrameIn',
      'isFrameOut',
      'isMaxRetakes',
      'isResolution',
      'isSingleEpisode',
      'isShotDescription',
      'isShotEstimation',
      'isShotTime',
      'isShowAssignations',
      'isShowInfos',
      'isTVShow',
      'nbSelectedTasks',
      'selectedShots',
      'sequenceMap',
      'shotFilledColumns',
      'shotMap',
      'shotMetadataDescriptors',
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
        !this.isCurrentUserClient && this.isShowInfos && this.isShotDescription
          ? 1
          : 0
      count += this.visibleMetadataDescriptors.length
      count +=
        !this.isCurrentUserClient &&
        this.isShowInfos &&
        this.isShotTime &&
        this.metadataDisplayHeaders.timeSpent
          ? 1
          : 0
      count +=
        !this.isCurrentUserClient &&
        this.isShowInfos &&
        this.isShotEstimation &&
        this.metadataDisplayHeaders.estimation
          ? 1
          : 0
      count += this.isShowInfos && this.metadataDisplayHeaders.frames ? 1 : 0
      count +=
        this.isShowInfos &&
        this.isFrameIn &&
        this.metadataDisplayHeaders.frameIn
          ? 1
          : 0
      count +=
        this.isShowInfos &&
        this.isFrameOut &&
        this.metadataDisplayHeaders.frameOut
          ? 1
          : 0
      count +=
        this.isShowInfos && this.isFps && this.metadataDisplayHeaders.fps
          ? 1
          : 0
      count +=
        this.isShowInfos &&
        this.isResolution &&
        this.metadataDisplayHeaders.resolution
          ? 1
          : 0
      count +=
        this.isShowInfos &&
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
          (!this.hiddenColumns[columnId] || this.isShowInfos)
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

    isSelected(indexInGroup, groupIndex, columnIndex) {
      const lineIndex = this.getIndex(indexInGroup, groupIndex)
      return this.shotSelectionGrid[lineIndex][columnIndex]
    },

    isCastingReady(shot, columnId) {
      const task = this.taskMap.get(shot.validations.get(columnId))
      return (
        task &&
        task.nb_assets_ready > 0 &&
        shot.nb_entities_out === task.nb_assets_ready
      )
    },

    castingTitle(shot, columnId) {
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

    onBodyScroll(event, position) {
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
      localStorage.setItem(
        this.localStorageStickKey,
        JSON.stringify(this.stickedColumns)
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

        if (this.isShowInfos) {
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
    }
  },

  mounted() {
    this.stickedColumns =
      JSON.parse(localStorage.getItem(this.localStorageStickKey)) || {}
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

td.frames,
td.framein,
td.frameout,
td.max-retakes,
td.resolution,
td.fps {
  height: 3.1rem;
  padding: 0;
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

  &:invalid,
  &.error {
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
</style>
