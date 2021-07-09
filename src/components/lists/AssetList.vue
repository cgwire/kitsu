<template>
<div class="data-list">
  <div
    class="datatable-wrapper"
    ref="body"
    v-scroll="onBodyScroll"
  >

    <table-header-menu
      ref="headerMenu"
      :is-minimized="hiddenColumns[lastHeaderMenuDisplayed]"
      :is-current-user-admin="isCurrentUserAdmin"
      :is-sticked="stickedColumns[lastHeaderMenuDisplayed]"
      @minimize-clicked="onMinimizeColumnToggled()"
      @delete-all-clicked="onDeleteAllTasksClicked()"
      @sort-by-clicked="onSortByTaskTypeClicked()"
      @select-column="onSelectColumn"
      @toggle-stick="stickColumnClicked()"
    />

    <table-metadata-header-menu
      ref="headerMetadataMenu"
      :is-current-user-admin="isCurrentUserAdmin"
      :is-sticked="stickedColumns[lastMetadaDataHeaderMenuDisplayed]"
      @edit-clicked="onEditMetadataClicked()"
      @delete-clicked="onDeleteMetadataClicked()"
      @sort-by-clicked="onSortByMetadataClicked()"
      @toggle-stick="metadataStickColumnClicked($event)"
    />

    <table class="datatable">
      <thead
        class="datatable-head"
        v-columns-resizable
        id="datatable-asset"
      >
        <tr>
          <th
            scope="col"
            class="episode"
            ref="th-episode"
            v-if="isTVShow"
          >
            {{ $t('assets.fields.episode') }}
          </th>
          <th
            scope="col"
            class="name datatable-row-header"
            ref="th-name"
          >
            <div class="flexrow">
              <span class="flexrow-item">
                {{ $t('assets.fields.name') }}
              </span>
              <button-simple
                class="is-small flexrow-item"
                icon="plus"
                :text="''"
                @click="onAddMetadataClicked"
                v-if="isCurrentUserAdmin && !isLoading"
              />
            </div>
          </th>
          <metadata-header
            :ref="`editor-${j}`"
            :key="descriptor.id"
            :descriptor="descriptor"
            :left="offsets['editor-' + j] ? `${offsets['editor-' + j]}px` : '0'"
            is-stick
            @show-metadata-header-menu="event => showMetadataHeaderMenu(descriptor.id, event)"
            v-for="(descriptor, j) in stickedVisibleMetadataDescriptors"
            v-if="isShowInfos"
          />
          <validation-header
            :ref="`validation-${columnIndexInGrid}`"
            :key="columnId"
            :hidden-columns="hiddenColumns"
            :column-id="columnId"
            :task-type-map="taskTypeMap"
            :validation-style="getValidationStyle(columnId)"
            :left="offsets['validation-' + columnIndexInGrid] ? `${offsets['validation-' + columnIndexInGrid]}px` : '0'"
            type="assets"
            is-stick
            @show-header-menu="event => showHeaderMenu(columnId, columnIndexInGrid, event)"
            v-for="(columnId, columnIndexInGrid) in stickedDisplayedValidationColumns"
            v-if="!isLoading"
          />

          <th
            scope="col"
            class="description"
            ref="th-description"
            v-if="!isCurrentUserClient && isShowInfos && isAssetDescription"
          >
            {{ $t('assets.fields.description') }}
          </th>

          <metadata-header
            :key="descriptor.id"
            :descriptor="descriptor"
            @show-metadata-header-menu="event => showMetadataHeaderMenu(descriptor.id, event)"
            v-for="descriptor in nonStickedVisibleMetadataDescriptors"
            v-if="isShowInfos"
          />
          <th
            scope="col"
            class="time-spent"
            ref="th-spent"
            v-if="!isCurrentUserClient &&
                  isShowInfos &&
                  isAssetTime &&
                  metadataDisplayHeaders.timeSpent"
          >
            {{ $t('assets.fields.time_spent') }}
          </th>
          <th
            scope="col"
            class="estimation"
            ref="th-spent"
            v-if="!isCurrentUserClient &&
                  isShowInfos &&
                  isAssetEstimation &&
                  metadataDisplayHeaders.estimation"
          >
            {{ $t('main.estimation_short') }}
          </th>

          <validation-header
            :key="columnId"
            :hidden-columns="hiddenColumns"
            :column-id="columnId"
            :task-type-map="taskTypeMap"
            :validation-style="getValidationStyle(columnId)"
            type="assets"
            @show-header-menu="event => showHeaderMenu(columnId, columnIndexInGrid, event)"
            v-for="(columnId, columnIndexInGrid) in nonStickedDisplayedValidationColumns"
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
              v-if="isCurrentUserManager &&
                    displayedAssets.length > 0 &&
                    !isLoading"
            />

            <table-metadata-selector-menu
              ref="headerMetadataSelectorMenu"
              :metadataDisplayHeaders.sync="metadataDisplayHeaders"
              :descriptors="assetMetadataDescriptors"
              :exclude="{
                timeSpent: !isAssetTime,
                estimation: !isAssetEstimation
              }"
              namespace="assets"
              v-show="columnSelectorDisplayed && isShowInfos"
            />

            <button-simple
              class="is-small is-pulled-right"
              icon="down"
              @click="toggleColumnSelector"
              v-if="assetMetadataDescriptors.length > 0 && isShowInfos"
            />
          </th>
        </tr>
      </thead>
      <tbody
        class="datatable-body"
        :key="getGroupKey(group, k, 'asset_type_id')"
        v-for="(group, k) in displayedAssets"
        v-if="!isLoading && isListVisible"
      >
        <tr class="datatable-type-header">
          <th
            scope="rowgroup"
            :colspan="visibleColumns"
          >
            <span class="datatable-row-header">
              {{ group[0] ? group[0].asset_type_name : '' }}
            </span>
          </th>
        </tr>
        <tr
          class="datatable-row"
          scope="row"
          :key="asset.id"
          :class="{canceled: asset.canceled}"
          v-for="(asset, i) in group"
        >
          <td class="episode" v-if="isTVShow">
            <div class="flexrow">
              <input
                type="checkbox"
                class="mr1"
                :checked="selectedAssets.has(asset.id)"
                @input="event => toggleLine(asset, event)"
              >
              {{
                episodeMap.get(asset.episode_id)
                ? episodeMap.get(asset.episode_id).name
                : 'MP'
              }}
            </div>
          </td>
          <th
            :class="{
              'datatable-row-header': true,
              name: true,
              bold: !asset.canceled
            }">
            <div class="flexrow">
              <input
                type="checkbox"
                class="mr1"
                :checked="selectedAssets.has(asset.id)"
                @input="event => toggleLine(asset, event)"
                v-if="!isTVShow"
              >
              <entity-thumbnail :entity="asset" :empty-height="32" />
              <router-link
                tabindex="-1"
                class="asset-link asset-name"
                :to="assetPath(asset.id)"
                :title="asset.full_name"
              >
                {{ asset.name }}
              </router-link>
            </div>
          </th>

          <!-- Metadata stick -->
          <td
            class="metadata-descriptor datatable-row-header"
            :title="asset.data ? asset.data[descriptor.field_name] : ''"
            :style="{'left': offsets['editor-' + j] ? `${offsets['editor-' + j]}px` : '0'}"
            :key="asset.id + '-' + descriptor.id"
            v-for="(descriptor, j) in stickedVisibleMetadataDescriptors"
            v-if="isShowInfos"
          >
            <input
              class="input-editor"
              @input="event => onMetadataFieldChanged(asset, descriptor, event)"
              @keyup.ctrl="event => onInputKeyUp(event, getIndex(i, k), j)"
              :value="getMetadataFieldValue(descriptor, asset)"
              v-if="descriptor.choices.length === 0 && isCurrentUserManager"
            />
            <span
              class="select"
              v-else-if="isCurrentUserManager"
            >
            <select
              class="select-input"
              @keyup.ctrl="event => onInputKeyUp(event, getIndex(i, k), j)"
              @change="event => onMetadataFieldChanged(asset, descriptor, event)"
            >
              <option
                v-for="(option, i) in getDescriptorChoicesOptions(descriptor)"
                :key="`${asset.id}-${descriptor.id}-${i}-${option.label}-${option.value}`"
                :value="option.value"
                :selected="getMetadataFieldValue(descriptor, asset) === option.value"
              >
                {{ option.label }}
              </option>
            </select>
            </span>
              <span class="metadata-value selectable" v-else>
              {{ getMetadataFieldValue(descriptor, asset) }}
            </span>
          </td>

          <validation-cell
            :ref="`validation-${getIndex(i, k)}-${j}`"
            :class="{
              'validation-cell': !hiddenColumns[columnId],
              'hidden-validation-cell': hiddenColumns[columnId],
              'datatable-row-header': true
            }"
            :key="columnId + '-' + asset.id"
            :column="taskTypeMap.get(columnId)"
            :entity="asset"
            :task-test="taskMap.get(asset.validations.get(columnId))"
            :selected="isSelected(i, k, j)"
            :rowX="getIndex(i, k)"
            :columnY="j"
            :minimized="hiddenColumns[columnId]"
            :is-static="true"
            :is-assignees="isShowAssignations"
            :left="offsets['validation-' + j] ? `${offsets['validation-' + j]}px` : '0'"
            :sticked="true"
            @select="(infos) => onTaskSelected(infos, true)"
            @unselect="(infos) => onTaskUnselected(infos, true)"
            v-for="(columnId, j) in stickedDisplayedValidationColumns"
            v-if="!isLoading"
          />
          <description-cell
            class="description"
            @description-changed="value => onDescriptionChanged(asset, value)"
            :editable="isCurrentUserManager"
            v-if="!isCurrentUserClient && isShowInfos && isAssetDescription"
            :entry="asset"
          />

          <!-- other Metadata cells -->
          <td
            class="metadata-descriptor"
            :title="asset.data ? asset.data[descriptor.field_name] : ''"
            :key="asset.id + '-' + descriptor.id"
            v-for="(descriptor, j) in nonStickedVisibleMetadataDescriptors"
            v-if="isShowInfos"
          >
            <input
              class="input-editor"
              @input="event => onMetadataFieldChanged(asset, descriptor, event)"
              @keyup.ctrl="event => onInputKeyUp(event, getIndex(i, k), j)"
              :value="getMetadataFieldValue(descriptor, asset)"
              v-if="descriptor.choices.length === 0 && isCurrentUserManager"
            />
            <span
              class="select"
              v-else-if="isCurrentUserManager"
            >
            <select
              class="select-input"
              @keyup.ctrl="event => onInputKeyUp(event, getIndex(i, k), j)"
              @change="event => onMetadataFieldChanged(asset, descriptor, event)"
            >
              <option
                v-for="(option, i) in getDescriptorChoicesOptions(descriptor)"
                :key="`${asset.id}-${descriptor.id}-${i}-${option.label}-${option.value}`"
                :value="option.value"
                :selected="getMetadataFieldValue(descriptor, asset) === option.value"
              >
                {{ option.label }}
              </option>
            </select>
            </span>
              <span class="metadata-value selectable" v-else>
              {{ getMetadataFieldValue(descriptor, asset) }}
            </span>
          </td>

          <td
            class="time-spent selectable"
            v-if="!isCurrentUserClient &&
                  isShowInfos &&
                  isAssetTime &&
                  metadataDisplayHeaders.timeSpent"
          >
            {{ formatDuration(asset.timeSpent) }}
          </td>

          <td
            class="estimation selectable"
            v-if="!isCurrentUserClient &&
                  isShowInfos &&
                  isAssetEstimation &&
                  metadataDisplayHeaders.estimation"
          >
            {{ formatDuration(asset.estimation) }}
          </td>

          <validation-cell
            :ref="`validation-${getIndex(i, k)}-${j + stickedDisplayedValidationColumns.length}`"
            :class="{
              'validation-cell': !hiddenColumns[columnId],
              'hidden-validation-cell': hiddenColumns[columnId]
            }"
            :key="columnId + '-' + asset.id"
            :column="taskTypeMap.get(columnId)"
            :entity="asset"
            :task-test="taskMap.get(asset.validations.get(columnId))"
            :selected="isSelected(i, k, j + stickedDisplayedValidationColumns.length)"
            :rowX="getIndex(i, k)"
            :columnY="j"
            :minimized="hiddenColumns[columnId]"
            :is-static="true"
            :is-assignees="isShowAssignations"
            @select="onTaskSelected"
            @unselect="onTaskUnselected"
            v-for="(columnId, j) in nonStickedDisplayedValidationColumns"
            v-if="!isLoading"
          />
          <row-actions-cell
            :entry="asset"
            @edit-clicked="$emit('edit-clicked', asset)"
            @delete-clicked="$emit('delete-clicked', asset)"
            @restore-clicked="$emit('restore-clicked', asset)"
            v-if="isCurrentUserManager"
          />
          <td class="actions" v-else></td>
        </tr>
      </tbody>
    </table>
  </div>

  <table-info
    :is-loading="isLoading"
    :is-error="isError"
  />

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

  <p
    class="has-text-centered nb-assets"
    v-if="!isEmptyList && !isLoading"
  >
    {{ displayedAssetsLength }} {{ $tc('assets.number', displayedAssetsLength) }}
    ({{ formatDuration(displayedAssetsTimeSpent) }}
     {{ $tc('main.days_spent', displayedAssetsTimeSpent) }},
     {{ formatDuration(displayedAssetsEstimation) }}
     {{ $tc('main.man_days', displayedAssetsEstimation) }})
  </p>

</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import { descriptorMixin } from '@/components/mixins/descriptors'
import { entityListMixin } from '@/components/mixins/entity_list'
import { formatListMixin } from '@/components/mixins/format'
import { range } from '@/lib/time'
import { selectionListMixin } from '@/components/mixins/selection'

import DescriptionCell from '@/components/cells/DescriptionCell'
import ButtonSimple from '@/components/widgets/ButtonSimple'
import EntityThumbnail from '@/components/widgets/EntityThumbnail'
import MetadataHeader from '@/components/cells/MetadataHeader'
import RowActionsCell from '@/components/cells/RowActionsCell'
import TableHeaderMenu from '@/components/widgets/TableHeaderMenu'
import TableInfo from '@/components/widgets/TableInfo'
import TableMetadataHeaderMenu from
  '@/components/widgets/TableMetadataHeaderMenu'
import TableMetadataSelectorMenu from
  '@/components/widgets/TableMetadataSelectorMenu'
import ValidationCell from '@/components/cells/ValidationCell'
import ValidationHeader from '@/components/cells/ValidationHeader'

export default {
  name: 'asset-list',
  mixins: [
    entityListMixin,
    descriptorMixin,
    formatListMixin,
    selectionListMixin
  ],

  components: {
    ButtonSimple,
    DescriptionCell,
    EntityThumbnail,
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
    }
  },

  data () {
    return {
      lastSelection: null,
      hiddenColumns: {},
      lastHeaderMenuDisplayed: null,
      lastMetadaDataHeaderMenuDisplayed: null,
      columnSelectorDisplayed: false,
      lastHeaderMenuDisplayedIndexInGrid: null,
      metadataDisplayHeaders: {
        estimation: true,
        timeSpent: true
      },
      stickedColumns: {},
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
      'episodeMap',
      'currentEpisode',
      'currentProduction',
      'displayedAssetsLength',
      'displayedAssetsTimeSpent',
      'displayedAssetsEstimation',
      'nbSelectedTasks',
      'isAssetDescription',
      'isCurrentUserAdmin',
      'isCurrentUserClient',
      'isCurrentUserManager',
      'isShowAssignations',
      'isShowInfos',
      'isAssetEstimation',
      'isAssetTime',
      'isTVShow',
      'selectedAssets',
      'selectedTasks',
      'taskMap',
      'taskTypeMap'
    ]),

    createTasksPath () {
      return this.getPath('create-asset-tasks')
    },

    isEmptyList () {
      return this.displayedAssetsLength === 0 &&
             !this.isLoading &&
             !this.isError &&
             (!this.assetSearchText || this.assetSearchText.length === 0)
    },

    isEmptyTask () {
      return !this.isEmptyList &&
      !this.isLoading &&
      this.validationColumns &&
      this.validationColumns.length === 0
    },

    isListVisible () {
      return (
        !this.isLoading &&
        !this.isError &&
        (
          this.displayedAssetsLength > 0
        )
      )
    },

    visibleColumns () {
      let count = 1
      count += this.isTVShow ? 1 : 0
      count += !this.isCurrentUserClient &&
        this.isShowInfos &&
        this.isAssetDescription
        ? 1
        : 0
      count += this.visibleMetadataDescriptors.length
      count += !this.isCurrentUserClient &&
        this.isShowInfos &&
        this.isAssetTime && this.metadataDisplayHeaders.timeSpent
        ? 1
        : 0
      count += !this.isCurrentUserClient &&
        this.isShowInfos &&
        this.isAssetEstimation && this.metadataDisplayHeaders.estimation
        ? 1
        : 0
      count += this.displayedValidationColumns.length
      return count
    },

    displayedValidationColumns () {
      return this.validationColumns.filter(columnId => {
        return this.assetFilledColumns[columnId] &&
          (!this.hiddenColumns[columnId] || this.isShowInfos)
      })
    },

    metadataDescriptors () {
      return this.assetMetadataDescriptors
    },

    localStorageStickKey () {
      return `stick-assets-${this.currentProduction.id}`
    }
  },

  methods: {
    ...mapActions([
      'displayMoreAssets',
      'setAssetSelection'
    ]),

    isSelected (indexInGroup, groupIndex, columnIndex) {
      const lineIndex = this.getIndex(indexInGroup, groupIndex)
      return this.assetSelectionGrid[lineIndex][columnIndex]
    },

    toggleLine (asset, event) {
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
          [startAssetIndex, endAssetIndex] = [endAssetIndex, startAssetIndex]
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

    onBodyScroll (event, position) {
      this.$emit('scroll', position.scrollTop)

      const maxHeight =
        this.$refs.body.scrollHeight - this.$refs.body.offsetHeight
      if (maxHeight < (position.scrollTop + 100)) {
        this.loadMoreAssets()
      }
    },

    loadMoreAssets () {
      this.displayMoreAssets()
    },

    getIndex (i, k) {
      return this.getEntityLineNumber(this.displayedAssets, i, k)
    },

    newAssetPath () {
      return this.getPath('new-asset')
    },

    assetPath (assetId) {
      return this.getPath('asset', assetId)
    },

    getPath (section, assetId) {
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

    onInputKeyUp (event, i, j) {
      const listWidth = this.visibleMetadataDescriptors.length
      const listHeight = this.displayedAssetsLength
      this.keyMetadataNavigation(listWidth, listHeight, i, j, event.key)
    },

    toggleStickedColumns (columnId) {
      const sticked = !this.stickedColumns[columnId]
      this.stickedColumns = {
        ...this.stickedColumns,
        [columnId]: sticked
      }
      localStorage.setItem(this.localStorageStickKey, JSON.stringify(this.stickedColumns))
    },

    stickColumnClicked () {
      this.toggleStickedColumns(this.lastHeaderMenuDisplayed)
      this.showHeaderMenu()
    },

    metadataStickColumnClicked (event) {
      this.toggleStickedColumns(this.lastMetadaDataHeaderMenuDisplayed)
      this.showMetadataHeaderMenu(this.lastMetadaDataHeaderMenuDisplayed, event)
    },

    updateOffsets () {
      if (this.isLoading) {
        return
      }
      this.$nextTick(function () {
        let offset = this.$refs['th-name'].clientWidth
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
          offset +=
            this.$refs[`validation-${validationCol}`][0].$el.clientWidth
        }
      })
    }
  },

  watch: {
    displayedAssets () {
      this.$options.lineIndex = {}
    },

    validationColumns () {
      this.initHiddenColumns(this.validationColumns, this.hiddenColumns)
    },

    stickedColumns () {
      this.updateOffsets()
    },

    isLoading () {
      this.updateOffsets()
    }
  },

  mounted () {
    this.stickedColumns = JSON.parse(
      localStorage.getItem(this.localStorageStickKey)
    ) || {}
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
  min-width: 70px;
  width: 70px;
}

.episode {
  min-width: 50px;
  width: 50px;
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

.datatable-row th.name {
  font-size: 1.1em;
  padding: 6px;

  .flexrow {
  }
}

.asset-name {
  color: inherit
}

.info img {
  max-width: 80vh;
}

// Metadata cell CSS

td.metadata-descriptor {
  height: 3.1rem;
  padding: 0;
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
</style>
