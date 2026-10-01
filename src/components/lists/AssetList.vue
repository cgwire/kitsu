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
          v-columns-resizable="currentProduction?.id"
          id="datatable-asset"
        >
          <tr>
            <th
              ref="th-name"
              data-column-key="name"
              :class="{
                name: true,
                'datatable-row-header': true,
                'datatable-row-header--nobd': hasStickyEpisode
              }"
              scope="col"
            >
              <sortable-field-header
                field-name="name"
                :label="$t('assets.fields.name')"
                @show-menu="showFieldHeaderMenu"
              >
                <template #actions>
                  <button-simple
                    class="is-small flexrow-item add-metadata-button"
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

            <th
              scope="col"
              class="episode datatable-row-header"
              data-resize-column="name"
              ref="th-episode"
              :style="{ left: `${nameWidth}px` }"
              v-if="hasStickyEpisode"
            >
              <sortable-field-header
                field-name="episode_id"
                :label="$t('assets.fields.episode')"
                @show-menu="showFieldHeaderMenu"
              />
            </th>

            <template v-if="displaySettings.showInfos">
              <metadata-header
                :ref="`editor-${j}`"
                :key="'sticky-header' + descriptor.id"
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
              <sortable-field-header
                field-name="ready_for"
                :label="$t('assets.fields.ready_for')"
                @show-menu="showFieldHeaderMenu"
              />
            </th>

            <th
              scope="col"
              class="description"
              data-column-key="description"
              v-if="
                !isCurrentUserClient &&
                displaySettings.showInfos &&
                isAssetDescription
              "
            >
              <sortable-field-header
                field-name="description"
                :label="$t('assets.fields.description')"
                @show-menu="showFieldHeaderMenu"
              />
            </th>

            <th
              scope="col"
              class="time-spent number-cell"
              v-if="
                !isCurrentUserClient &&
                displaySettings.showInfos &&
                isAssetTime &&
                metadataDisplayHeaders.timeSpent
              "
            >
              <sortable-field-header
                field-name="timeSpent"
                :label="$t('assets.fields.time_spent')"
                @show-menu="showFieldHeaderMenu"
              />
            </th>

            <th
              scope="col"
              class="estimation number-cell"
              :title="$t('main.estimation')"
              v-if="
                !isCurrentUserClient &&
                displaySettings.showInfos &&
                isAssetEstimation &&
                metadataDisplayHeaders.estimation
              "
            >
              <sortable-field-header
                field-name="estimation"
                :label="$t('main.estimation_short')"
                @show-menu="showFieldHeaderMenu"
              />
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
              <sortable-field-header
                field-name="resolution"
                :label="$t('shots.fields.resolution')"
                @show-menu="showFieldHeaderMenu"
              />
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
            :key="'group-' + getGroupKey(group, k, 'asset_type_id')"
            @mousedown="startBrowsing"
            @touchstart="startBrowsing"
            v-for="(group, k) in filteredDisplayedAssets"
          >
            <tr class="datatable-type-header" v-if="group[0]">
              <th scope="rowgroup">
                <span
                  class="datatable-row-header pointer"
                  role="button"
                  tabindex="0"
                  @click="$emit('asset-type-clicked', group[0].asset_type_name)"
                  @keydown.enter.prevent="
                    $emit('asset-type-clicked', group[0].asset_type_name)
                  "
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
                  'datatable-row-header--nobd': hasStickyEpisode,
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
                    v-if="!asset.shared && !isCurrentUserClient"
                  >
                    {{ asset.name }}
                  </router-link>
                  <template v-else>
                    {{ asset.name }}
                  </template>
                </div>
              </th>

              <td
                class="episode datatable-row-header"
                :style="{ left: `${nameWidth}px` }"
                v-if="hasStickyEpisode"
              >
                <div class="flexrow" :title="assetEpisodes(asset, true)">
                  {{ assetEpisodes(asset, false) }}
                </div>
              </td>

              <!-- Metadata stick -->
              <template v-if="displaySettings.showInfos">
                <td
                  class="metadata-descriptor datatable-row-header"
                  @keyup.ctrl="onInputKeyUp"
                  :title="asset.data ? asset.data[descriptor.field_name] : ''"
                  :style="{
                    'z-index':
                      descriptor.data_type === 'taglist'
                        ? 1000 - (getIndex(i, k) % 1000) // Needed for combo to be above the next cell
                        : undefined,
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
              </template>

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
                  :task-href="taskHref(asset.validations.get(columnId))"
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
                  @keyup.ctrl="onInputKeyUp"
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
                  @keyup.ctrl="onInputKeyUp"
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
                  :task-href="taskHref(asset.validations.get(columnId))"
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

      <empty-list
        :text="$t('assets.empty_list')"
        :read-only-text="$t('assets.empty_list_read_only')"
        :button-text="$t('assets.new_assets')"
        :illustration="emptyAssetIllustration"
        @create="$emit('new-clicked')"
        v-if="isEmptyList && !isLoading"
      />

      <table-info :is-loading="isLoading" :is-error="isError" big-cells />
    </div>

    <asset-list-numbers
      :assets="assetCache.result"
      v-if="!isEmptyList && !isLoading"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

import emptyAssetIllustration from '@/assets/illustrations/empty_asset.png'
import { useEntityList } from '@/composables/entityList'
import { useFormat } from '@/composables/format'
import { getMetadataFieldValue } from '@/lib/descriptors'
import { getTaskHref } from '@/lib/path'
import { sortTaskTypes } from '@/lib/sorting'
import { range } from '@/lib/time'
import assetStore from '@/store/modules/assets'
import assetTypeStore from '@/store/modules/assettypes'
import episodeStore from '@/store/modules/episodes'

/* eslint-disable no-unused-vars */
import DescriptionCell from '@/components/cells/DescriptionCell.vue'
import MetadataHeader from '@/components/cells/MetadataHeader.vue'
import MetadataInput from '@/components/cells/MetadataInput.vue'
import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import ValidationCell from '@/components/cells/ValidationCell.vue'
import ValidationHeader from '@/components/cells/ValidationHeader.vue'
import AssetListNumbers from '@/components/widgets/AssetListNumbers.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import EmptyList from '@/components/widgets/EmptyList.vue'
import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'
import SortableFieldHeader from '@/components/widgets/SortableFieldHeader.vue'
import TableHeaderMenu from '@/components/widgets/TableHeaderMenu.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'
import TableMetadataHeaderMenu from '@/components/widgets/TableMetadataHeaderMenu.vue'
import TableMetadataSelectorMenu from '@/components/widgets/TableMetadataSelectorMenu.vue'
/* eslint-enable no-unused-vars */

const { t } = useI18n()
const router = useRouter()
const store = useStore()
const { formatDuration } = useFormat()

// Non-reactive store caches, read at call time.
const assetCache = assetStore.cache
const assetTypeMap = assetTypeStore.cache.assetTypeMap
const episodeMap = episodeStore.cache.episodeMap

// Props / Emits
// --------------------------------------------------------------------------

const props = defineProps({
  contactSheetMode: { type: Boolean, default: false },
  displaySettings: { type: Object, default: () => ({}) },
  displayedAssets: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: true },
  isError: { type: Boolean, default: true },
  validationColumns: { type: Array, default: () => [] },
  departmentFilter: { type: Array, default: () => [] }
})

const emit = defineEmits([
  'add-metadata',
  'asset-changed',
  'asset-type-clicked',
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
  'new-clicked',
  'restore-clicked',
  'scroll'
])

// State
// --------------------------------------------------------------------------

const lastSelectedAsset = ref(null)

// Computed
// --------------------------------------------------------------------------

const assetMetadataDescriptors = computed(
  () => store.getters.assetMetadataDescriptors
)
const assetSearchText = computed(() => store.getters.assetSearchText)
const assetSelectionGrid = computed(() => store.getters.assetSelectionGrid)
const currentEpisode = computed(() => store.getters.currentEpisode)
const currentProduction = computed(() => store.getters.currentProduction)
const displayedAssetsCount = computed(() => store.getters.displayedAssetsCount)
const isAssetDescription = computed(() => store.getters.isAssetDescription)
const isAssetEstimation = computed(() => store.getters.isAssetEstimation)
const isAssetResolution = computed(() => store.getters.isAssetResolution)
const isAssetTime = computed(() => store.getters.isAssetTime)
const isCurrentUserClient = computed(() => store.getters.isCurrentUserClient)
// Production-scoped: effective role on the current production (global
// admins/managers still pass, but a per-project override wins).
const isCurrentUserManager = computed(
  () => store.getters.isCurrentUserProductionManager
)
const isCurrentUserSupervisor = computed(
  () => store.getters.isCurrentUserProductionSupervisor
)
const isTVShow = computed(() => store.getters.isTVShow)
const productionAssetTaskTypes = computed(
  () => store.getters.productionAssetTaskTypes
)
const productionShotTaskTypes = computed(
  () => store.getters.productionShotTaskTypes
)
const selectedAssets = computed(() => store.getters.selectedAssets)
const taskMap = computed(() => store.getters.taskMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

const isEmptyList = computed(
  () =>
    displayedAssetsCount.value === 0 &&
    !props.isLoading &&
    !props.isError &&
    (!assetSearchText.value || assetSearchText.value.length === 0)
)

const isListVisible = computed(
  () => !props.isLoading && !props.isError && displayedAssetsCount.value > 0
)

const isAssetsOnly = computed(
  () => currentProduction.value?.production_type === 'assets'
)

const hasStickyEpisode = computed(
  () => isTVShow.value && props.displaySettings.showInfos
)

const readyForTaskTypes = computed(() => [
  { id: null, name: t('tasks.fields.no_task_type'), color: '#CCC' },
  ...sortTaskTypes(productionShotTaskTypes.value, currentProduction.value)
])

// Task types an asset type accepts: its own workflow, or every production
// task type when it has none.
const getAllowedTaskTypeIds = assetTypeId => {
  const taskTypeIds = assetTypeMap.get(assetTypeId)?.task_types
  return taskTypeIds?.length
    ? taskTypeIds
    : productionAssetTaskTypes.value.map(taskType => taskType.id)
}

// A column counts as filled only when at least one displayed asset has a
// task whose type is part of the asset type's workflow. Tasks lingering
// on assets whose type no longer accepts that task type (workflow-change
// leftovers, asset type reassignments) are treated as if they did not
// exist, so the column hides instead of being kept visible by orphaned
// tasks the artist cannot actually edit.
const inWorkflowFilledColumns = computed(() =>
  props.displayedAssets.reduce((filled, typeGroup) => {
    if (typeGroup.length) {
      const allowed = new Set(getAllowedTaskTypeIds(typeGroup[0].asset_type_id))
      typeGroup.forEach(asset => {
        Array.from(asset.validations?.keys() || [])
          .filter(columnId => allowed.has(columnId))
          .forEach(columnId => {
            filled[columnId] = true
          })
      })
    }
    return filled
  }, {})
)

// Filter the displayed assets by the display settings.
const filteredDisplayedAssets = computed(() => {
  const { showSharedAssets, showLinkedAssets } = props.displaySettings
  if (showSharedAssets && showLinkedAssets) return props.displayedAssets
  const episodeId = currentEpisode.value?.id
  return props.displayedAssets.map(typeList =>
    typeList.filter(
      asset =>
        (showSharedAssets || !asset.shared) &&
        (!isTVShow.value ||
          showLinkedAssets ||
          ['all', asset.episode_id || 'main'].includes(episodeId))
    )
  )
})

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
  nameWidth,
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
  toggleColumnSelector
} = useEntityList({
  type: 'asset',
  props,
  emit,
  entities: computed(() => props.displayedAssets),
  filledColumns: inWorkflowFilledColumns,
  metadataDescriptors: assetMetadataDescriptors,
  metadataDisplayHeaders: {
    estimation: true,
    readyFor: true,
    resolution: true,
    timeSpent: true
  },
  isEmptyList,
  onScrollEnd: () => store.dispatch('displayMoreAssets')
})

// Functions
// --------------------------------------------------------------------------

const assetEpisodes = (asset, full) => {
  if (!episodeMap) return ''
  const mainEpisodeName = episodeMap.get(asset.episode_id)?.name || 'MP'
  const episodeNames = (asset.casting_episode_ids || [])
    .map(episodeId => episodeMap.get(episodeId)?.name)
    .filter(name => name && name !== mainEpisodeName)
  if (episodeNames.length === 0) return mainEpisodeName
  const listedNames =
    episodeNames.length > 2 && !full
      ? `${episodeNames.slice(0, 2).join(', ')}, ...`
      : episodeNames.join(', ')
  return `${mainEpisodeName}, ${listedNames}`
}

// Selectable if the cell already holds a task or if the task type is
// included in the workflow. Cells with existing tasks stay actionable
// even when a workflow change removed their task type, so they can
// still be selected and managed instead of freezing.
const isSelectable = (asset, columnId) => {
  if (asset.shared) return false
  if (taskMap.value.get(asset.validations?.get(columnId))) return true
  return getAllowedTaskTypeIds(asset.asset_type_id).includes(columnId)
}

const getIndex = (i, k) => getEntityLineNumber(props.displayedAssets, i, k)

const isSelected = (indexInGroup, groupIndex, columnIndex) =>
  assetSelectionGrid.value.has(
    `${getIndex(indexInGroup, groupIndex)}-${columnIndex}`
  )

// Shift-click selects every line between the last selected one and this
// one.
const toggleLine = (asset, event) => {
  const selected = event.target.checked
  const assetsToSelect = [asset]
  if (selected && shiftKeyPressed.value && lastSelectedAsset.value) {
    const assets = props.displayedAssets.flat()
    const indexes = [lastSelectedAsset.value.id, asset.id].map(id =>
      assets.findIndex(displayedAsset => displayedAsset.id === id)
    )
    const [startIndex, endIndex] = indexes.sort((a, b) => a - b)
    if (startIndex >= 0) {
      range(startIndex, endIndex).forEach(index => {
        assetsToSelect.push(assets[index])
      })
    }
  }
  if (selected) {
    lastSelectedAsset.value = asset
  }
  assetsToSelect.forEach(asset => {
    store.dispatch('setAssetSelection', { asset, selected })
  })
}

// A change on a selected line applies to every selected line.
const onReadyForChanged = (asset, taskTypeId) => {
  const assetsToChange = selectedAssets.value.has(asset.id)
    ? selectedAssets.value
    : [asset]
  assetsToChange.forEach(({ id }) => {
    emit('asset-changed', { id, ready_for: taskTypeId })
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

const assetPath = assetId => {
  const route = {
    name: 'asset',
    params: { production_id: currentProduction.value?.id, asset_id: assetId }
  }
  if (isTVShow.value && currentEpisode.value) {
    route.name = 'episode-asset'
    route.params.episode_id = currentEpisode.value.id
  }
  return route
}

// The pages drive the list through a ref.
defineExpose({ selectTaskFromQuery, setScrollPosition })
</script>

<style lang="scss" scoped>
.actions {
  min-width: 160px;
  padding: 0.4em;
  position: sticky;
}

thead .name {
  min-width: 200px;
  width: 300px;
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
  min-width: 80px;
  width: 80px;
}

.bold {
  font-weight: bold;
}

.description {
  min-width: 200px;
  width: 200px;
}

.validation-cell {
  min-width: 150px;
  max-width: 150px;
  width: 150px;
  margin-right: 1em;
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

// Metadata cell CSS

td.resolution,
td.metadata-descriptor {
  height: 3.1rem;
  padding: 0;
}

.metadata-value {
  padding: 0.5rem 0.75rem;
}
</style>
