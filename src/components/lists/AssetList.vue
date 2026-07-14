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
        <thead class="datatable-head" v-columns-resizable id="datatable-asset">
          <tr>
            <th
              ref="th-name"
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
              <sortable-field-header
                field-name="ready_for"
                :label="$t('assets.fields.ready_for')"
                @show-menu="showFieldHeaderMenu"
              />
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
              <sortable-field-header
                field-name="description"
                :label="$t('assets.fields.description')"
                @show-menu="showFieldHeaderMenu"
              />
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
              ref="th-spent"
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

        <!--
          PERF-1: virtualized rows (@tanstack/vue-virtual), ported from the
          EditList pilot. The per-asset-type tbodys are linearized into one
          flat list mixing type-header items and asset items (flattenedItems,
          built in setup); only the items near the viewport render below,
          between two spacer rows sized to the off-screen items' total
          height. Type-header rows keep the exact markup/classes they had
          when each group owned its tbody.
        -->
        <tbody
          class="datatable-body"
          @mousedown="startBrowsing"
          @touchstart="startBrowsing"
          v-if="!isLoading && isListVisible"
        >
          <tr class="virtual-spacer-row" v-if="topSpacerHeight > 0">
            <td
              :colspan="totalColumnsCount"
              :style="{ height: `${topSpacerHeight}px` }"
            ></td>
          </tr>
          <template
            :key="key"
            v-for="{
              isHeader,
              group,
              asset,
              i,
              k,
              flatIndex,
              key
            } in visibleItems"
          >
            <tr
              class="datatable-type-header"
              :ref="el => rowVirtualizer.measureElement(el)"
              :data-index="flatIndex"
              v-if="isHeader"
            >
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
                shared: asset.shared,
                'stripe-even': i % 2 === 0,
                'stripe-odd': i % 2 === 1
              }"
              scope="row"
              :ref="el => rowVirtualizer.measureElement(el)"
              :data-index="flatIndex"
              :title="asset.shared ? $t('library.from_library') : undefined"
              v-else
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
              <td
                class="metadata-descriptor datatable-row-header"
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
                  :max-assignees="maxAssigneesPerCell"
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
                  :max-assignees="maxAssigneesPerCell"
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
          </template>
          <tr class="virtual-spacer-row" v-if="bottomSpacerHeight > 0">
            <td
              :colspan="totalColumnsCount"
              :style="{ height: `${bottomSpacerHeight}px` }"
            ></td>
          </tr>
        </tbody>
      </table>

      <div
        class="has-text-centered"
        v-if="isEmptyList && !isCurrentUserClient && !isLoading"
      >
        <p class="info">
          <img src="../../assets/illustrations/empty_asset.png" alt="" />
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
          <img src="../../assets/illustrations/empty_asset.png" alt="" />
        </p>
        <p class="info">{{ $t('assets.empty_list_client') }}</p>
      </div>

      <table-info :is-loading="isLoading" :is-error="isError" big-cells />
    </div>

    <asset-list-numbers
      :assets="assetCache.result"
      v-if="!isEmptyList && !isLoading"
    />
  </div>
</template>

<script>
import { useVirtualizer } from '@tanstack/vue-virtual'
import { computed, ref } from 'vue'
import { mapGetters, mapActions, useStore } from 'vuex'

import { descriptorMixin } from '@/components/mixins/descriptors'
import { domMixin } from '@/components/mixins/dom'
import { entityListMixin } from '@/components/mixins/entity_list'
import { formatListMixin } from '@/components/mixins/format'
import { selectionListMixin } from '@/components/mixins/selection'

import preferences from '@/lib/preferences'
import { sortTaskTypes } from '@/lib/sorting'
import { range } from '@/lib/time'

import DescriptionCell from '@/components/cells/DescriptionCell.vue'
import MetadataHeader from '@/components/cells/MetadataHeader.vue'
import MetadataInput from '@/components/cells/MetadataInput.vue'
import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import ValidationCell from '@/components/cells/ValidationCell.vue'
import ValidationHeader from '@/components/cells/ValidationHeader.vue'
import AssetListNumbers from '@/components/widgets/AssetListNumbers.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'
import SortableFieldHeader from '@/components/widgets/SortableFieldHeader.vue'
import TableHeaderMenu from '@/components/widgets/TableHeaderMenu.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'
import TableMetadataHeaderMenu from '@/components/widgets/TableMetadataHeaderMenu.vue'
import TableMetadataSelectorMenu from '@/components/widgets/TableMetadataSelectorMenu.vue'

import assetStore from '@/store/modules/assets'
import assetTypeStore from '@/store/modules/assettypes'
import episodeStore from '@/store/modules/episodes'
import taskTypeStore from '@/store/modules/tasktypes'

// PERF-1: row-height estimates per display mode (same technique as
// EditList.vue). Heights are fixed within a mode — the assignee-avatar
// stack is capped via maxAssignees below so it can never wrap a row
// taller; rowVirtualizer.measureElement stays as a safety net for
// anything still content-driven.
const ROW_HEIGHT_ESTIMATE = 52
const ROW_HEIGHT_ESTIMATE_BIG_THUMBNAILS = 116
const ROW_HEIGHT_ESTIMATE_CONTACT_SHEET = 102
// Asset-type header row: 1.5rem/0.5rem paddings + one line of 1.1em text.
const TYPE_HEADER_HEIGHT_ESTIMATE = 56

// Cap on assignee avatars per validation cell (rest collapses into "+N"):
// 3 avatars + status tag fit the 150px cell on one line, keeping row
// heights constant for the virtualizer whatever the assignation count.
const MAX_ASSIGNEES_PER_CELL = 3

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
    AssetListNumbers,
    ButtonSimple,
    ComboboxTaskType,
    DescriptionCell,
    EntityThumbnail,
    MetadataInput,
    MetadataHeader,
    RowActionsCell,
    SortableFieldHeader,
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
    'restore-clicked'
    // 'scroll' and 'keep-task-panel-open' come from entityListMixin
  ],

  // PERF-1: virtualized rows, ported from the EditList pilot. useVirtualizer
  // is a composable so it needs a setup() hook even though this component is
  // otherwise Options API. `body` is returned so it doubles as
  // `this.$refs.body` for the existing mixin methods (setScrollPosition,
  // onBodyScroll's scrollHeight check, drag-to-pan) and as the virtualizer's
  // scroll element.
  setup(props) {
    const store = useStore()
    const body = ref(null)

    // Moved from the Options computed block (setup() cannot read Options
    // computeds and the virtualizer's item list derives from it): filters
    // the displayed assets by the display settings.
    const filteredDisplayedAssets = computed(() => {
      if (
        props.displaySettings.showSharedAssets &&
        props.displaySettings.showLinkedAssets
      ) {
        return props.displayedAssets
      }
      const episodeId = store.getters.currentEpisode?.id

      return props.displayedAssets.map(typeList =>
        typeList.filter(asset => {
          if (!props.displaySettings.showSharedAssets && asset.shared) {
            return false
          }
          if (
            store.getters.isTVShow &&
            !props.displaySettings.showLinkedAssets &&
            !['all', asset.episode_id || 'main'].includes(episodeId)
          ) {
            return false
          }
          return true
        })
      )
    })

    // The grouped per-asset-type tbodys, linearized into one flat list of
    // type-header items and asset items (display order preserved) so a
    // single virtualizer can window over the whole grid. `i` and `k` keep
    // their historical meaning (index inside the filtered group / group
    // index), so every getIndex(i, k)-based selection coordinate is
    // unchanged.
    const flattenedItems = computed(() => {
      const items = []
      filteredDisplayedAssets.value.forEach((group, k) => {
        if (group[0]) {
          items.push({
            isHeader: true,
            group,
            k,
            key: `header-${group[0].asset_type_id}`
          })
          group.forEach((asset, i) => {
            items.push({ isHeader: false, asset, i, k, key: asset.id })
          })
        }
      })
      return items
    })

    const rowVirtualizer = useVirtualizer(
      computed(() => ({
        count: flattenedItems.value.length,
        getScrollElement: () => body.value,
        // bigThumbnails first: combined with contact sheet, the name
        // column's 100px thumbnail + cell padding is the taller of the two.
        estimateSize: index => {
          if (flattenedItems.value[index]?.isHeader) {
            return TYPE_HEADER_HEIGHT_ESTIMATE
          }
          if (props.displaySettings.bigThumbnails) {
            return ROW_HEIGHT_ESTIMATE_BIG_THUMBNAILS
          }
          if (props.displaySettings.contactSheetMode) {
            return ROW_HEIGHT_ESTIMATE_CONTACT_SHEET
          }
          return ROW_HEIGHT_ESTIMATE
        },
        getItemKey: index => flattenedItems.value[index]?.key ?? index,
        overscan: 10
      }))
    )

    return { body, filteredDisplayedAssets, flattenedItems, rowVirtualizer }
  },

  data() {
    return {
      type: 'asset',
      columnSelectorDisplayed: false,
      hiddenColumns: {},
      lastSelection: null,
      lastFieldHeaderMenuDisplayed: null,
      lastFieldHeaderMenuLabel: null,
      lastHeaderMenuDisplayed: null,
      lastMetadataHeaderMenuDisplayed: null,
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
      nameWidth: 200,
      nameResizeObserver: null,
      lastSelectedAsset: null
    }
  },

  mounted() {
    this.$nextTick(() => {
      const thName = this.$refs['th-name']
      if (thName && typeof ResizeObserver !== 'undefined') {
        this.nameResizeObserver = new ResizeObserver(() => {
          this.nameWidth = thName.clientWidth
          this.updateOffsets()
        })
        this.nameResizeObserver.observe(thName)
      }
    })
  },

  beforeUnmount() {
    this.nameResizeObserver?.disconnect()
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

    assetCache() {
      return assetStore.cache
    },

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

    /**
     * Map of task type id → true for columns considered "filled" for the
     * displayed assets. A column counts as filled only when at least one
     * displayed asset has a task whose type is part of the asset type's
     * workflow.
     *
     * Tasks lingering on assets whose type no longer accepts that task
     * type (workflow-change leftovers, asset type reassignments, etc.) are
     * deliberately treated as if they did not exist, so the column hides
     * instead of being kept visible by orphaned tasks the artist cannot
     * actually edit.
     */
    inWorkflowFilledColumns() {
      const filled = {}
      const productionTaskTypeIds = this.productionAssetTaskTypes.map(t => t.id)
      for (const typeGroup of this.displayedAssets) {
        if (!typeGroup.length) continue
        const assetType = this.assetTypeMap.get(typeGroup[0].asset_type_id)
        const allowedTaskTypes = assetType?.task_types?.length
          ? assetType.task_types
          : productionTaskTypeIds
        const allowedSet = new Set(allowedTaskTypes)
        for (const asset of typeGroup) {
          if (!asset.validations) continue
          for (const columnId of asset.validations.keys()) {
            if (!filled[columnId] && allowedSet.has(columnId)) {
              filled[columnId] = true
            }
          }
        }
      }
      return filled
    },

    displayedValidationColumns() {
      return this.validationColumns.filter(columnId => {
        return (
          this.inWorkflowFilledColumns[columnId] &&
          (!this.hiddenColumns[columnId] || this.displaySettings.showInfos)
        )
      })
    },

    metadataDescriptors() {
      return this.assetMetadataDescriptors
    },

    localStorageStickKey() {
      return `stick-assets-${this.currentProduction?.id}`
    },

    readyForTaskTypes() {
      return [
        {
          id: null,
          name: this.$t('tasks.fields.no_task_type'),
          color: '#CCC'
        },
        ...sortTaskTypes(this.productionShotTaskTypes, this.currentProduction)
      ]
    },

    isAssetsOnly() {
      return this.currentProduction?.production_type === 'assets'
    },

    formatDurationInHours() {
      return this.organisation.format_duration_in_hours
    },

    hasStickyEpisode() {
      return this.isTVShow && this.displaySettings.showInfos
    },

    // PERF-1: virtualization plumbing (see the EditList pilot). Everything
    // below reasons in data terms (flattenedItems / getIndex coordinates),
    // never DOM order, so filtering, sorting and real-time updates keep
    // working exactly as before virtualization.
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

    // The flattened items tanstack currently renders, `flatIndex` being the
    // index in flattenedItems (used only for data-index / measurement, not
    // for selection coordinates, which stay getIndex(i, k)-based).
    visibleItems() {
      return this.virtualRows
        .filter(virtualRow => this.flattenedItems[virtualRow.index])
        .map(virtualRow => ({
          ...this.flattenedItems[virtualRow.index],
          flatIndex: virtualRow.index
        }))
    },

    // Maps a row's global selection index back to its asset, in the exact
    // coordinate system the rendered cells advertise: getIndex(i, k) offsets
    // come from the unfiltered displayedAssets groups while i indexes the
    // filtered group, mirroring the template's v-for + :row-x combination.
    rowIndexToAsset() {
      const map = new Map()
      this.filteredDisplayedAssets.forEach((group, k) => {
        group.forEach((asset, i) => {
          map.set(this.getIndex(i, k), asset)
        })
      })
      return map
    },

    maxAssigneesPerCell() {
      return MAX_ASSIGNEES_PER_CELL
    },

    // Spans the spacer rows across every column currently in the header,
    // so they don't leave a jagged one-column-wide row in the table.
    totalColumnsCount() {
      let count = 1 // asset name column, always present
      if (this.hasStickyEpisode) count++
      count += this.stickedVisibleMetadataDescriptors.length
      if (!this.isLoading) {
        count += this.stickedDisplayedValidationColumns.length
        count += this.nonStickedDisplayedValidationColumns.length
      }
      if (
        this.isCurrentUserManager &&
        this.displaySettings.showInfos &&
        !this.isAssetsOnly &&
        this.metadataDisplayHeaders.readyFor
      ) {
        count++
      }
      if (
        !this.isCurrentUserClient &&
        this.displaySettings.showInfos &&
        this.isAssetDescription
      ) {
        count++
      }
      if (
        !this.isCurrentUserClient &&
        this.displaySettings.showInfos &&
        this.isAssetTime &&
        this.metadataDisplayHeaders.timeSpent
      ) {
        count++
      }
      if (
        !this.isCurrentUserClient &&
        this.displaySettings.showInfos &&
        this.isAssetEstimation &&
        this.metadataDisplayHeaders.estimation
      ) {
        count++
      }
      if (
        this.isAssetResolution &&
        this.displaySettings.showInfos &&
        this.metadataDisplayHeaders.resolution
      ) {
        count++
      }
      if (this.displaySettings.showInfos) {
        count += this.nonStickedVisibleMetadataDescriptors.length
      }
      count++ // actions column, always present
      return count
    }
  },

  methods: {
    ...mapActions(['editAsset', 'setAssetSelection']),

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

    // Selectable if the cell already holds a task or if the task type is
    // included in the workflow. Cells with existing tasks stay actionable
    // even when a workflow change removed their task type, so they can
    // still be selected and managed instead of freezing.
    isSelectable(asset, columnId) {
      if (asset.shared) {
        return false
      }
      if (this.taskMap.get(asset.validations?.get(columnId))) {
        return true
      }
      const assetType = this.assetTypeMap.get(asset.asset_type_id)
      let taskTypes = assetType?.task_types || []
      if (taskTypes.length === 0) {
        taskTypes = this.productionAssetTaskTypes.map(t => t.id)
      }
      return taskTypes.includes(columnId)
    },

    isSelected(indexInGroup, groupIndex, columnIndex) {
      const lineIndex = this.getIndex(indexInGroup, groupIndex)
      return this.assetSelectionGrid.has(`${lineIndex}-${columnIndex}`)
    },

    // Hook for entity_list.js's data-driven shift-rectangle selection:
    // getIndex(i, k) offsets come from the unfiltered displayedAssets
    // groups while i indexes the filtered group, mirroring the template's
    // v-for + :row-x combination (see rowIndexToAsset).
    entityForRow(lineIndex) {
      return this.rowIndexToAsset.get(lineIndex)
    },

    // Selectability mirrors the template exactly: sticked cells never bind
    // :selectable (always selectable), non-sticked cells use isSelectable()
    // (workflow + shared-asset checks).
    isCellSelectable(asset, columnId, columnIndex) {
      return (
        columnIndex < this.stickedDisplayedValidationColumns.length ||
        this.isSelectable(asset, columnId)
      )
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

    // PERF-1: no local onBodyScroll anymore. The store now displays the
    // full result at once (rows are virtualized), so the old
    // scroll-to-bottom -> displayMoreAssets wiring is gone and the mixin's
    // onBodyScroll (scroll-position emit only) takes over.

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
          production_id: this.currentProduction?.id
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
      this.toggleStickedColumns(this.lastMetadataHeaderMenuDisplayed)
      this.showMetadataHeaderMenu(this.lastMetadataHeaderMenuDisplayed, event)
    },

    updateOffsets() {
      if (this.isLoading) {
        return
      }
      this.$nextTick(function () {
        this.nameWidth = this.$refs['th-name'].clientWidth
        let offset = this.nameWidth
        if (this.$refs['th-episode']) {
          offset += this.$refs['th-episode'].clientWidth
        }
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
    displayedAssets() {
      this.$options.lineIndex = {}
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
    }
  }
}
</script>

<style lang="scss" scoped>
// PERF-1: spacer rows standing in for the off-screen virtualized items
// above/below the rendered window (see the datatable-body template).
// Qualified with .datatable-body so it outranks shared.scss's
// `.data-list .datatable-body td` padding by specificity, not by
// stylesheet injection order.
.datatable-body .virtual-spacer-row td {
  padding: 0;
  border: none;
}

// With virtualization the DOM only holds a window of rows, so the global
// `.multi-section .datatable-row:nth-child(odd/even)` zebra rules
// (App.vue) re-anchor on whatever row happens to be rendered first and
// every stripe flips each time the window shifts by one row. Stripe from
// the group-local data index instead (stripe-even/stripe-odd bound in the
// row's :class, matching the per-tbody parity the nth-child rules
// produced). Hover is redeclared after the stripes so it keeps winning.
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

// Anchored on the th too: with rows virtualized, table auto-layout only
// sees the rendered window, so a td-only min-width stops binding when no
// row is rendered; the thead always is.
th.resolution,
td.resolution {
  min-width: 110px;
  max-width: 110px;
  width: 110px;
}

th.ready-for,
td.ready-for {
  // min-width is the only binding constraint in table auto-layout: with
  // rows virtualized, widths are computed from the rendered window only
  // and `width` alone let the column collapse to 81px.
  min-width: 180px;
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
  max-width: 200px;
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
  // Firefox scroll anchoring fights windowed updates: when the top spacer
  // row resizes it re-anchors the scroll position and produces micro-jumps
  // (standard TanStack Virtual mitigation). Scoped: only this virtualized
  // wrapper opts out, other datatables keep the default.
  overflow-anchor: none;
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
  padding: 0;
}

.metadata-value {
  padding: 0.5rem 0.75rem;
}
</style>
