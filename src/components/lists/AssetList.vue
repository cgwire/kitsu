<template>
  <div class="data-list">
    <div ref="body" class="datatable-wrapper" @scroll.passive="onBodyScroll">
      <table-header-menu
        ref="headerMenu"
        :is-minimized="hiddenColumns[lastHeaderMenuDisplayed]"
        :is-edit-allowed="isCurrentUserManager"
        :is-sticked="stickedColumns[lastHeaderMenuDisplayed]"
        @minimize-clicked="onMinimizeColumnToggled()"
        @delete-all-clicked="onDeleteAllTasksClicked()"
        @sort-by-clicked="onSortByTaskTypeClicked()"
        @select-column="onSelectColumn('asset')"
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
        <thead class="datatable-head" v-columns-resizable id="datatable-asset">
          <tr>
            <th ref="th-name" class="name datatable-row-header" scope="col">
              <div class="flexrow">
                <span class="flexrow-item">
                  {{ $t('assets.fields.name') }}
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

            <th
              scope="col"
              class="episode"
              ref="th-episode"
              v-if="isTVShow && displaySettings.showInfos"
            >
              {{ $t('assets.fields.episode') }}
            </th>

            <metadata-header
              :ref="`editor-${j}`"
              :key="'sticky-header' + descriptor.id"
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

            <template v-if="!isLoading">
              <validation-header
                :ref="`validation-${columnIndexInGrid}`"
                :key="'sticky-header' + columnId"
                :hidden-columns="hiddenColumns"
                :column-id="columnId"
                :validation-style="getValidationStyle(columnId)"
                :left="
                  offsets['validation-' + columnIndexInGrid]
                    ? `${offsets['validation-' + columnIndexInGrid]}px`
                    : '0'
                "
                type="assets"
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
              ref="th-ready-for"
              scope="col"
              class="ready-for"
              :title="$t('assets.fields.ready_for')"
              v-if="
                isCurrentUserManager &&
                displaySettings.showInfos &&
                !isAssetsOnly &&
                metadataDisplayHeaders.readyFor
              "
            >
              {{ $t('assets.fields.ready_for') }}
            </th>

            <th
              scope="col"
              class="description"
              ref="th-description"
              v-if="
                !isCurrentUserClient &&
                displaySettings.showInfos &&
                isAssetDescription
              "
            >
              {{ $t('assets.fields.description') }}
            </th>

            <th
              scope="col"
              class="time-spent number-cell"
              ref="th-spent"
              v-if="
                !isCurrentUserClient &&
                displaySettings.showInfos &&
                isAssetTime &&
                metadataDisplayHeaders.timeSpent
              "
            >
              {{ $t('assets.fields.time_spent') }}
            </th>

            <th
              scope="col"
              class="estimation number-cell"
              :title="$t('main.estimation')"
              ref="th-spent"
              v-if="
                !isCurrentUserClient &&
                displaySettings.showInfos &&
                isAssetEstimation &&
                metadataDisplayHeaders.estimation
              "
            >
              {{ $t('main.estimation_short') }}
            </th>

            <th
              scope="col"
              class="resolution"
              v-if="
                isAssetResolution &&
                displaySettings.showInfos &&
                metadataDisplayHeaders.resolution
              "
            >
              {{ $t('shots.fields.resolution') }}
            </th>

            <template v-if="displaySettings.showInfos">
              <metadata-header
                :key="'header' + descriptor.id"
                :descriptor="descriptor"
                @show-metadata-header-menu="
                  event => showMetadataHeaderMenu(descriptor.id, event)
                "
                v-for="descriptor in nonStickedVisibleMetadataDescriptors"
              />
            </template>

            <template v-if="!isLoading">
              <validation-header
                :key="'header' + columnId"
                :hidden-columns="hiddenColumns"
                :column-id="columnId"
                :title="taskTypeMap.get(columnId).name"
                :validation-style="getValidationStyle(columnId)"
                type="assets"
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
                  displayedAssets.length > 0 &&
                  !isLoading
                "
              />

              <table-metadata-selector-menu
                :descriptors="assetMetadataDescriptors"
                :exclude="{
                  timeSpent: !isAssetTime,
                  estimation: !isAssetEstimation
                }"
                namespace="assets"
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
            :key="'group-' + getGroupKey(group, k, 'asset_type_id')"
            @mousedown="startBrowsing"
            @touchstart="startBrowsing"
            v-for="(group, k) in displayedAssets"
          >
            <tr class="datatable-type-header" v-if="group[0]">
              <th scope="rowgroup" :colspan="visibleColumns">
                <span
                  class="datatable-row-header pointer"
                  @click="$emit('asset-type-clicked', group[0].asset_type_name)"
                >
                  {{ group[0] ? group[0].asset_type_name : '' }}
                </span>
              </th>
            </tr>

            <tr
              class="datatable-row"
              :class="{
                canceled: asset.canceled,
                shared: asset.shared
              }"
              scope="row"
              :key="`row${asset.id}`"
              :title="asset.shared ? $t('library.from_library') : undefined"
              v-for="(asset, i) in group"
            >
              <th
                :class="{
                  'datatable-row-header': true,
                  name: true,
                  bold: !asset.canceled
                }"
              >
                <div class="flexrow">
                  <input
                    type="checkbox"
                    class="flexrow-item"
                    :checked="selectedAssets.has(asset.id) || null"
                    :disabled="asset.shared"
                    @input="event => toggleLine(asset, event)"
                    v-if="isCurrentUserManager"
                  />
                  <entity-thumbnail
                    class="entity-thumbnail flexrow-item"
                    :entity="asset"
                    :width="displaySettings.bigThumbnails ? 150 : 50"
                    :height="displaySettings.bigThumbnails ? 100 : 30"
                    :empty-width="displaySettings.bigThumbnails ? 150 : 50"
                    :empty-height="displaySettings.bigThumbnails ? 100 : 32"
                  />
                  <router-link
                    tabindex="-1"
                    class="asset-link asset-name flexrow-item"
                    :to="assetPath(asset.id)"
                    :title="asset.full_name"
                    v-if="!asset.shared"
                  >
                    {{ asset.name }}
                  </router-link>
                  <template v-else>
                    {{ asset.name }}
                  </template>
                </div>
              </th>

              <td class="episode" v-if="isTVShow && displaySettings.showInfos">
                <div class="flexrow" :title="assetEpisodes(asset, true)">
                  {{ assetEpisodes(asset, false) }}
                </div>
              </td>

              <!-- Metadata stick -->
              <td
                class="metadata-descriptor datatable-row-header"
                :title="asset.data ? asset.data[descriptor.field_name] : ''"
                :style="{
                  'z-index': 1000 - i - k * 100, // Needed for combo to be above the next cell
                  left: offsets['editor-' + j]
                    ? `${offsets['editor-' + j]}px`
                    : '0'
                }"
                :key="'sticky-desc-' + asset.id + '-' + descriptor.id"
                v-for="(descriptor, j) in stickedVisibleMetadataDescriptors"
              >
                <metadata-input
                  :entity="asset"
                  :descriptor="descriptor"
                  :indexes="{ i, j, k }"
                  @metadata-changed="$emit('metadata-changed', $event)"
                />
              </td>

              <template v-if="!isLoading">
                <validation-cell
                  :ref="`validation-${getIndex(i, k)}-${j}`"
                  :class="{
                    'validation-cell': !hiddenColumns[columnId],
                    'hidden-validation-cell': hiddenColumns[columnId],
                    'datatable-row-header': true
                  }"
                  :contact-sheet="displaySettings.contactSheetMode"
                  :key="'sticky-validation-' + columnId + '-' + asset.id"
                  :canceled="asset.canceled"
                  :column="taskTypeMap.get(columnId)"
                  :entity="asset"
                  :task-test="taskMap.get(asset.validations.get(columnId))"
                  :selected="isSelected(i, k, j)"
                  :row-x="getIndex(i, k)"
                  :column-y="j"
                  :minimized="hiddenColumns[columnId]"
                  :is-static="true"
                  :is-assignees="displaySettings.showAssignations"
                  :left="
                    offsets['validation-' + j]
                      ? `${offsets['validation-' + j]}px`
                      : '0'
                  "
                  :sticked="true"
                  @select="infos => onTaskSelected(infos, true)"
                  @unselect="infos => onTaskUnselected(infos, true)"
                  v-for="(columnId, j) in stickedDisplayedValidationColumns"
                />
              </template>

              <td
                class="task-type-name ready-for"
                v-if="
                  isCurrentUserManager &&
                  displaySettings.showInfos &&
                  !isAssetsOnly &&
                  metadataDisplayHeaders.readyFor
                "
              >
                <combobox-task-type
                  class="mb0"
                  :model-value="asset.ready_for"
                  :task-type-list="readyForTaskTypes"
                  :shy="true"
                  @update:model-value="
                    taskTypeId => onReadyForChanged(asset, taskTypeId)
                  "
                />
              </td>

              <description-cell
                class="description"
                @description-changed="
                  value => onDescriptionChanged(asset, value)
                "
                :editable="isCurrentUserManager && !asset.shared"
                v-if="
                  !isCurrentUserClient &&
                  displaySettings.showInfos &&
                  isAssetDescription
                "
                :entry="asset"
              />

              <td
                class="time-spent selectable number-cell"
                v-if="
                  !isCurrentUserClient &&
                  displaySettings.showInfos &&
                  isAssetTime &&
                  metadataDisplayHeaders.timeSpent
                "
              >
                {{ formatDuration(asset.timeSpent) }}
              </td>

              <td
                class="estimation selectable number-cell"
                v-if="
                  !isCurrentUserClient &&
                  displaySettings.showInfos &&
                  isAssetEstimation &&
                  metadataDisplayHeaders.estimation
                "
              >
                {{ formatDuration(asset.estimation) }}
              </td>

              <td
                class="resolution"
                v-if="
                  isAssetResolution &&
                  displaySettings.showInfos &&
                  metadataDisplayHeaders.resolution
                "
              >
                <input
                  :class="{
                    'input-editor': true,
                    error: !isValidResolution(asset)
                  }"
                  :value="
                    getMetadataFieldValue({ field_name: 'resolution' }, asset)
                  "
                  @input="
                    event =>
                      onMetadataFieldChanged(
                        asset,
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
                    getMetadataFieldValue({ field_name: 'resolution' }, asset)
                  }}
                </span>
              </td>

              <!-- other Metadata cells -->
              <template v-if="displaySettings.showInfos">
                <td
                  class="metadata-descriptor"
                  :title="asset.data ? asset.data[descriptor.field_name] : ''"
                  :key="'desc' + asset.id + '-' + descriptor.id"
                  v-for="(
                    descriptor, j
                  ) in nonStickedVisibleMetadataDescriptors"
                >
                  <metadata-input
                    :entity="asset"
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
                  :key="'validation' + columnId + '-' + asset.id"
                  :canceled="asset.canceled"
                  :column="taskTypeMap.get(columnId)"
                  :contact-sheet="displaySettings.contactSheetMode"
                  :entity="asset"
                  :task-test="taskMap.get(asset.validations.get(columnId))"
                  :selected="
                    isSelected(
                      i,
                      k,
                      j + stickedDisplayedValidationColumns.length
                    )
                  "
                  :row-x="getIndex(i, k)"
                  :column-y="j"
                  :minimized="hiddenColumns[columnId]"
                  :is-static="true"
                  :is-assignees="displaySettings.showAssignations"
                  :selectable="isSelectable(asset, columnId)"
                  :disabled="!isSelectable(asset, columnId)"
                  @select="onTaskSelected"
                  @unselect="onTaskUnselected"
                  v-for="(columnId, j) in nonStickedDisplayedValidationColumns"
                />
              </template>

              <row-actions-cell
                :entry="asset"
                @edit-clicked="$emit('edit-clicked', asset)"
                @delete-clicked="$emit('delete-clicked', asset)"
                @restore-clicked="$emit('restore-clicked', asset)"
                v-if="isCurrentUserManager && !asset.shared"
              />

              <td class="actions" v-else></td>
            </tr>
          </tbody>
        </template>
      </table>

      <div
        class="has-text-centered"
        v-if="isEmptyList && !isCurrentUserClient && !isLoading"
      >
        <p class="info">
          <img src="../../assets/illustrations/empty_asset.png" />
        </p>
        <p class="info">{{ $t('assets.empty_list') }}</p>
        <button-simple
          class="level-item big-button"
          :text="$t('assets.new_assets')"
          @click="$emit('new-clicked')"
        />
      </div>
      <div
        class="has-text-centered"
        v-if="isEmptyList && isCurrentUserClient && !isLoading"
      >
        <p class="info">
          <img src="../../assets/illustrations/empty_asset.png" />
        </p>
        <p class="info">{{ $t('assets.empty_list_client') }}</p>
      </div>

      <table-info :is-loading="isLoading" :is-error="isError" />
    </div>

    <p class="has-text-centered nb-assets" v-if="!isEmptyList && !isLoading">
      {{ displayedAssetsLength }}
      {{ $tc('assets.number', displayedAssetsLength) }}
      <span
        v-show="displayedAssetsTimeSpent > 0 || displayedAssetsEstimation > 0"
      >
        ({{ formatDuration(displayedAssetsTimeSpent) }}
        {{
          isDurationInHours
            ? $tc('main.hours_spent', displayedAssetsTimeSpent)
            : $tc('main.days_spent', displayedAssetsTimeSpent)
        }},
        {{ formatDuration(displayedAssetsEstimation) }}
        {{
          isDurationInHours
            ? $tc('main.hours_estimated', displayedAssetsEstimation)
            : $tc('main.man_days', displayedAssetsEstimation)
        }})
      </span>
    </p>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import { descriptorMixin } from '@/components/mixins/descriptors'
import { domMixin } from '@/components/mixins/dom'
import { entityListMixin } from '@/components/mixins/entity_list'
import { formatListMixin } from '@/components/mixins/format'
import { selectionListMixin } from '@/components/mixins/selection'

import preferences from '@/lib/preferences'
import { sortTaskTypes } from '@/lib/sorting'
import { range } from '@/lib/time'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import DescriptionCell from '@/components/cells/DescriptionCell.vue'
import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'
import MetadataHeader from '@/components/cells/MetadataHeader.vue'
import MetadataInput from '@/components/cells/MetadataInput.vue'
import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import TableHeaderMenu from '@/components/widgets/TableHeaderMenu.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'
import TableMetadataHeaderMenu from '@/components/widgets/TableMetadataHeaderMenu.vue'
import TableMetadataSelectorMenu from '@/components/widgets/TableMetadataSelectorMenu.vue'
import ValidationCell from '@/components/cells/ValidationCell.vue'
import ValidationHeader from '@/components/cells/ValidationHeader.vue'

import assetTypeStore from '@/store/modules/assettypes'
import episodeStore from '@/store/modules/episodes'
import taskTypeStore from '@/store/modules/tasktypes'

export default {
  name: 'asset-list',

  mixins: [
    entityListMixin,
    descriptorMixin,
    domMixin,
    formatListMixin,
    selectionListMixin
  ],

  components: {
    ButtonSimple,
    ComboboxTaskType,
    DescriptionCell,
    EntityThumbnail,
    MetadataInput,
    MetadataHeader,
    RowActionsCell,
    TableInfo,
    TableHeaderMenu,
    TableMetadataHeaderMenu,
    TableMetadataSelectorMenu,
    ValidationCell,
    ValidationHeader
  },

  props: {
    contactSheetMode: {
      type: Boolean,
      default: false
    },
    displaySettings: {
      type: Object,
      default: () => {}
    },
    displayedAssets: {
      type: Array,
      default: () => []
    },
    isLoading: {
      type: Boolean,
      default: true
    },
    isError: {
      type: Boolean,
      default: true
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
    'asset-changed',
    'asset-type-clicked',
    'create-tasks',
    'delete-clicked',
    'edit-clicked',
    'metadata-changed',
    'new-clicked',
    'restore-clicked',
    'scroll'
  ],

  data() {
    return {
      type: 'asset',
      columnSelectorDisplayed: false,
      hiddenColumns: {},
      isSelectableMap: {},
      lastSelection: null,
      lastHeaderMenuDisplayed: null,
      lastMetadaDataHeaderMenuDisplayed: null,
      lastHeaderMenuDisplayedIndexInGrid: null,
      metadataDisplayHeaders: {
        estimation: true,
        readyFor: true,
        resolution: true,
        timeSpent: true
      },
      stickedColumns: {},
      domEvents: [
        ['mousemove', this.onMouseMove],
        ['touchmove', this.onMouseMove],
        ['mouseup', this.stopBrowsing],
        ['mouseleave', this.stopBrowsing],
        ['touchend', this.stopBrowsing],
        ['touchcancel', this.stopBrowsing],
        ['keyup', this.stopBrowsing]
      ],
      offsets: {},
      lastSelectedAsset: null
    }
  },

  computed: {
    ...mapGetters([
      'assets',
      'assetFilledColumns',
      'assetMap',
      'assetMetadataDescriptors',
      'assetSearchText',
      'assetSelectionGrid',
      'currentEpisode',
      'currentProduction',
      'displayedAssetsCount',
      'displayedAssetsLength',
      'displayedAssetsTimeSpent',
      'displayedAssetsEstimation',
      'nbSelectedTasks',
      'organisation',
      'isAssetDescription',
      'isAssetResolution',
      'isCurrentUserClient',
      'isCurrentUserManager',
      'isCurrentUserSupervisor',
      'isShowAssignations',
      'isAssetEstimation',
      'isAssetTime',
      'isTVShow',
      'productionAssetTaskTypes',
      'productionShotTaskTypes',
      'selectedAssets',
      'selectedTasks',
      'taskMap',
      'user'
    ]),

    assetTypeMap() {
      return assetTypeStore.cache.assetTypeMap
    },

    episodeMap() {
      return episodeStore.cache.episodeMap
    },

    taskTypeMap() {
      return taskTypeStore.cache.taskTypeMap
    },

    isEmptyList() {
      return (
        this.displayedAssetsCount === 0 &&
        !this.isLoading &&
        !this.isError &&
        (!this.assetSearchText || this.assetSearchText.length === 0)
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
      return !this.isLoading && !this.isError && this.displayedAssetsCount > 0
    },

    visibleColumns() {
      let count = 1
      count += this.isTVShow ? 1 : 0
      count +=
        !this.isCurrentUserClient &&
        this.displaySettings.showInfos &&
        this.isAssetDescription
          ? 1
          : 0
      count += this.visibleMetadataDescriptors.length
      count +=
        !this.isCurrentUserClient &&
        this.displaySettings.showInfos &&
        this.isAssetTime &&
        this.metadataDisplayHeaders.timeSpent
          ? 1
          : 0
      count +=
        !this.isCurrentUserClient &&
        this.displaySettings.showInfos &&
        this.isAssetEstimation &&
        this.metadataDisplayHeaders.estimation
          ? 1
          : 0
      count += this.displayedValidationColumns.length
      return count
    },

    displayedValidationColumns() {
      return this.validationColumns.filter(columnId => {
        return (
          this.assetFilledColumns[columnId] &&
          (!this.hiddenColumns[columnId] || this.displaySettings.showInfos)
        )
      })
    },

    metadataDescriptors() {
      return this.assetMetadataDescriptors
    },

    localStorageStickKey() {
      return `stick-assets-${this.currentProduction.id}`
    },

    readyForTaskTypes() {
      return [
        {
          id: null,
          name: 'No task type',
          color: '#CCC'
        },
        ...sortTaskTypes(this.productionShotTaskTypes, this.currentProduction)
      ]
    },

    isAssetsOnly() {
      return this.currentProduction.production_type === 'assets'
    },

    formatDurationInHours() {
      return this.organisation.format_duration_in_hours
    }
  },

  methods: {
    ...mapActions(['displayMoreAssets', 'editAsset', 'setAssetSelection']),

    assetEpisodes(asset, full) {
      if (!this.episodeMap) return ''
      const mainEpisode = this.episodeMap.get(asset.episode_id)
      const mainEpisodeName = mainEpisode ? mainEpisode.name : 'MP'
      const episodeNames = (asset.casting_episode_ids || [])
        .map(eId => this.episodeMap.get(eId).name)
        .filter(name => name !== mainEpisodeName)
      let episodeNameString = ''
      if (episodeNames.length > 2) {
        if (full) {
          episodeNameString = episodeNames.join(', ')
        } else {
          episodeNameString = episodeNames.slice(0, 2).join(', ') + ', ...'
        }
      } else if (episodeNames.length > 0) {
        episodeNameString = episodeNames.join(', ')
      }
      return episodeNames.length > 0
        ? mainEpisodeName + ', ' + episodeNameString
        : mainEpisodeName
    },

    // Selectable if the task type is included in the workflow.
    isSelectable(asset, columnId) {
      if (asset.shared) {
        return false
      }
      const key = asset.asset_type_id + columnId
      if (this.isSelectableMap === undefined) this.isSelectableMap = {}
      if (this.isSelectableMap[key] === undefined) {
        const taskType = this.taskTypeMap.get(columnId)
        const assetType = this.assetTypeMap.get(asset.asset_type_id)
        let taskTypes = assetType?.task_types || []
        if (taskTypes.length === 0) {
          taskTypes = this.productionAssetTaskTypes.map(t => t.id)
        }
        this.isSelectable[key] = taskTypes.includes(taskType.id)
      }
      return this.isSelectable[key]
    },

    isSelected(indexInGroup, groupIndex, columnIndex) {
      const lineIndex = this.getIndex(indexInGroup, groupIndex)
      return this.assetSelectionGrid[lineIndex][columnIndex]
    },

    toggleLine(asset, event) {
      const selected = event.target.checked
      const assetsToSelect = [asset]
      if (selected && this.shiftKeyPressed && this.lastSelectedAsset) {
        const assetsFlatten = this.displayedAssets.flat()
        let startAssetIndex = assetsFlatten.findIndex(
          displayedAsset => displayedAsset.id === this.lastSelectedAsset.id
        )
        let endAssetIndex = assetsFlatten.findIndex(
          displayedAsset => displayedAsset.id === asset.id
        )
        if (startAssetIndex > endAssetIndex) {
          ;[startAssetIndex, endAssetIndex] = [endAssetIndex, startAssetIndex]
        }
        if (startAssetIndex >= 0 && endAssetIndex >= 0) {
          range(startAssetIndex, endAssetIndex).forEach(index => {
            assetsToSelect.push(assetsFlatten[index])
          })
        }
      }
      if (selected) {
        this.lastSelectedAsset = asset
      }
      assetsToSelect.forEach(asset => {
        this.setAssetSelection({ asset, selected })
      })
    },

    onBodyScroll(event) {
      if (!this.$refs.body) return
      const position = event.target
      this.$emit('scroll', position.scrollTop)
      const maxHeight =
        this.$refs.body.scrollHeight - this.$refs.body.offsetHeight
      if (maxHeight < position.scrollTop + 100) {
        this.loadMoreAssets()
      }
    },

    onReadyForChanged(asset, taskTypeId) {
      if (this.selectedAssets.has(asset.id)) {
        this.selectedAssets.forEach(asset => {
          const data = { id: asset.id, ready_for: taskTypeId }
          this.$emit('asset-changed', data)
        })
      } else {
        const data = { id: asset.id, ready_for: taskTypeId }
        this.$emit('asset-changed', data)
      }
    },

    loadMoreAssets() {
      this.displayMoreAssets()
    },

    getIndex(i, k) {
      return this.getEntityLineNumber(this.displayedAssets, i, k)
    },

    assetPath(assetId) {
      return this.getPath('asset', assetId)
    },

    getPath(section, assetId) {
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

      if (assetId) {
        route.params.asset_id = assetId
      }

      return route
    },

    onInputKeyUp(event, i, j) {
      const listWidth = this.visibleMetadataDescriptors.length
      const listHeight = this.displayedAssetsCount
      this.keyMetadataNavigation(listWidth, listHeight, i, j, event.key)
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
      this.$nextTick(function () {
        let offset = this.$refs['th-name'].clientWidth
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
    displayedAssets: {
      deep: true,
      handler() {
        this.$options.lineIndex = {}
      }
    },

    validationColumns: {
      deep: true,
      handler() {
        this.initHiddenColumns(this.validationColumns, this.hiddenColumns)
      }
    },

    stickedColumns() {
      this.updateOffsets()
    },

    isLoading() {
      this.updateOffsets()
    },

    'displaySettings.bigThumbnails'() {
      this.updateOffsets()
    },

    currentProduction() {
      // Map used for performance reasons, to avoid array traversals
      this.isSelectableMap = {}
    }
  }
}
</script>

<style lang="scss" scoped>
.dark thead tr a {
  color: $light-grey;

  .asset-name {
    color: $white;
  }

  td .select {
    &:active,
    &:focus,
    &:hover {
      &::after {
        border-color: $green;
      }
    }
  }
}

.actions {
  min-width: 160px;
  padding: 0.4em;
  position: sticky;
}

.name {
  min-width: 200px;
  width: 200px;
}

th.time-spent,
td.time-spent,
th.estimation,
td.estimation {
  min-width: 60px;
  width: 60px;
}

td.resolution {
  min-width: 110px;
  max-width: 110px;
  width: 110px;
}

th.ready-for,
td.ready-for {
  max-width: 180px;
  width: 180px;
  padding: 1px 5px;
}

.episode {
  min-width: 130px;
  width: 130px;
}

.bold {
  font-weight: bold;
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
  margin-right: 1em;
}

.hidden-validation-cell {
  min-width: 30px;
  max-width: 30px;
  width: 30px;
  padding: 4px;
}

.datatable-wrapper {
  min-height: 200px;
  flex: 1;
}

.datatable-row.shared {
  > th,
  > td {
    opacity: 0.6;
    background: color-mix(
      in srgb,
      var(--shared-color) 20%,
      transparent
    ) !important;

    &:hover {
      opacity: 1;
    }
  }
  > td:not(.description-cell) {
    font-size: 0;

    > :deep(*) {
      display: none;
    }
  }
}

.datatable-row th.name {
  font-size: 1.1em;
  padding: 6px;
}

.asset-name {
  color: inherit;
}

.info img {
  max-width: 80vh;
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

td.resolution,
td.metadata-descriptor {
  height: 3.1rem;
  max-width: 120px;
  padding: 0;
}
</style>
