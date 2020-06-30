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
      @minimize-clicked="onMinimizeColumnToggled()"
      @delete-all-clicked="onDeleteAllTasksClicked()"
      @sort-by-clicked="onSortByTaskTypeClicked()"
    />

    <table-metadata-header-menu
      ref="headerMetadataMenu"
      :is-current-user-admin="isCurrentUserAdmin"
      @edit-clicked="onEditMetadataClicked()"
      @delete-clicked="onDeleteMetadataClicked()"
      @sort-by-clicked="onSortByMetadataClicked()"
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

          <th
            scope="col"
            class="description"
            ref="th-description"
            v-if="!isCurrentUserClient && isShowInfos && isAssetDescription"
          >
            {{ $t('assets.fields.description') }}
          </th>

          <th
            scope="col"
            class="metadata-descriptor"
            :key="descriptor.id"
            v-for="descriptor in assetMetadataDescriptors"
            v-if="isShowInfos"
          >
            <div class="flexrow">
              <span class="flexrow-item descriptor-name">
                {{ descriptor.name }}
              </span>
              <chevron-down-icon
                @click="showMetadataHeaderMenu(descriptor.id, $event)"
                class="header-icon flexrow-item"
              />
            </div>
          </th>
          <th
            scope="col"
            class="time-spent"
            ref="th-spent"
            v-if="!isCurrentUserClient && isShowInfos && isAssetTime"
          >
            {{ $t('assets.fields.time_spent') }}
          </th>
          <th
            scope="col"
            :class="{
              'validation-cell': !hiddenColumns[columnId],
              'hidden-validation-cell': hiddenColumns[columnId]
            }"
            :key="columnId"
            v-for="columnId in displayedValidationColumns"
            v-if="!isLoading"
          >
            <div
              class="flexrow validation-content"
              :style="getValidationStyle(columnId)"
            >
              <router-link
                class="flexrow-item datatable-dropdown task-type-name"
                style="margin-right: 0;"
                :to="taskTypePath(columnId)"
                v-if="!isCurrentUserClient"
              >
                {{ !hiddenColumns[columnId]
                   ? taskTypeMap[columnId].name
                   : '' }}
              </router-link>
              <span
                class="flexrow-item datatable-dropdown task-type-name"
                style="margin-right: 0;"
                v-else
              >
                {{ !hiddenColumns[columnId]
                  ? taskTypeMap[columnId].name
                  : '' }}
              </span>

              <chevron-down-icon
                @click="showHeaderMenu(columnId, $event)"
                class="header-icon flexrow-item"
              />
            </div>
          </th>
          <th scope="col" class="actions">
            <button-simple
              :class="{
                'is-small': true,
                highlighted: isEmptyTask
              }"
              icon="plus"
              :text="$t('tasks.create_tasks')"
              @click="$emit('create-tasks')"
              v-if="isCurrentUserManager && displayedAssets.length > 0 && !isLoading"
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
            {{ episodeMap[asset.episode_id] ? episodeMap[asset.episode_id].name : 'MP' }}
          </td>
          <th
            :class="{
              'datatable-row-header': true,
              name: true,
              bold: !asset.canceled
            }">
            <div class="flexrow">
              <entity-thumbnail :entity="asset" />
              <router-link
                class="asset-link"
                :to="assetPath(asset.id)"
              >
                {{ asset.name }}
              </router-link>
            </div>
          </th>
          <description-cell
            class="description"
            v-if="!isCurrentUserClient && isShowInfos && isAssetDescription"
            :entry="asset"
          />
          <td
            class="metadata-descriptor"
            :key="asset.id + '-' + descriptor.id"
            v-for="descriptor in assetMetadataDescriptors"
            v-if="isShowInfos"
          >
            <div
              class="ellipsis"
              :title="asset.data ? asset.data[descriptor.field_name] : ''"
            >
              {{ asset.data ? asset.data[descriptor.field_name] : '' }}
            </div>
          </td>
          <td
            class="time-spent"
            v-if="!isCurrentUserClient && isShowInfos && isAssetTime"
          >
            {{ formatDuration(asset.timeSpent) }}
          </td>

          <validation-cell
            :class="{
              'validation-cell': !hiddenColumns[columnId],
              'hidden-validation-cell': hiddenColumns[columnId]
            }"
            :key="columnId + '-' + asset.id"
            :ref="'validation-' + getIndex(i, k) + '-' + j"
            :column="taskTypeMap[columnId]"
            :entity="asset"
            :task-test="taskMap[asset.validations[columnId]]"
            :selected="assetSelectionGrid[getIndex(i, k)][j]"
            :rowX="getIndex(i, k)"
            :columnY="j"
            :minimized="hiddenColumns[columnId]"
            :is-static="true"
            :is-assignees="isShowAssignations"
            @select="onTaskSelected"
            @unselect="onTaskUnselected"
            v-for="(columnId, j) in displayedValidationColumns"
            v-if="!isLoading"
          />
          <row-actions v-if="isCurrentUserManager"
            :entry="asset"
            :edit-route="editPath(asset.id)"
            :delete-route="deletePath(asset.id)"
            :restore-route="restorePath(asset.id)"
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
    <button-link
      class="level-item big-button"
      :text="$t('assets.new_assets')"
      :path="newAssetPath()"
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
  </p>

</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import {
  ChevronDownIcon
} from 'vue-feather-icons'
import { entityListMixin } from './base'
import { formatListMixin } from './format_mixin'
import { selectionListMixin } from './selection'

import DescriptionCell from '../cells/DescriptionCell'
import ButtonLink from '../widgets/ButtonLink'
import ButtonSimple from '../widgets/ButtonSimple'
import EntityThumbnail from '../widgets/EntityThumbnail'
import RowActions from '../widgets/RowActions'
import TableHeaderMenu from '../widgets/TableHeaderMenu'
import TableInfo from '../widgets/TableInfo'
import TableMetadataHeaderMenu from '../widgets/TableMetadataHeaderMenu'
import ValidationCell from '../cells/ValidationCell'

export default {
  name: 'asset-list',
  mixins: [entityListMixin, formatListMixin, selectionListMixin],

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
      lastHeaderMenuDisplayed: null
    }
  },

  components: {
    ButtonLink,
    ButtonSimple,
    DescriptionCell,
    EntityThumbnail,
    ChevronDownIcon,
    RowActions,
    TableInfo,
    TableHeaderMenu,
    TableMetadataHeaderMenu,
    ValidationCell
  },

  computed: {
    ...mapGetters([
      'assets',
      'assetFilledColumns',
      'assetMetadataDescriptors',
      'assetSearchText',
      'assetSelectionGrid',
      'episodeMap',
      'currentEpisode',
      'currentProduction',
      'displayedAssetsLength',
      'nbSelectedTasks',
      'isAssetDescription',
      'isCurrentUserAdmin',
      'isCurrentUserClient',
      'isCurrentUserManager',
      'isShowAssignations',
      'isShowInfos',
      'isAssetTime',
      'isTVShow',
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
      count += this.assetMetadataDescriptors.length
      count += !this.isCurrentUserClient &&
        this.isShowInfos &&
        this.isAssetTime
        ? 1
        : 0
      count += this.displayedValidationColumns.length
      return count
    },

    displayedValidationColumns () {
      return this.validationColumns.filter((columnId) => {
        return this.assetFilledColumns[columnId] &&
          (!this.hiddenColumns[columnId] || this.isShowInfos)
      })
    }
  },

  methods: {
    ...mapActions([
      'displayMoreAssets'
    ]),

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
      let j = 0
      let index = 0
      while (j < k) {
        index += this.displayedAssets[j].length
        j++
      }
      return i + index
    },

    newAssetPath () {
      return this.getPath('new-asset')
    },

    assetPath (assetId) {
      return this.getPath('asset', assetId)
    },

    editPath (assetId) {
      return this.getPath('edit-asset', assetId)
    },

    deletePath (assetId) {
      return this.getPath('delete-asset', assetId)
    },

    restorePath (assetId) {
      return this.getPath('restore-asset', assetId)
    },

    taskTypePath (taskTypeId) {
      const route = {
        name: 'task-type',
        params: {
          production_id: this.currentProduction.id,
          task_type_id: taskTypeId,
          type: 'assets'
        }
      }

      if (this.isTVShow && this.currentEpisode) {
        route.name = 'episode-task-type'
        route.params.episode_id = this.currentEpisode.id
      }

      return route
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

    // Remaining function for retrocompatibility
    resizeHeaders () {
      return true
    }
    //
  },

  watch: {
    validationColumns () {
      this.initHiddenColumns(this.validationColumns, this.hiddenColumns)
    }
  }
}
</script>

<style lang="scss" scoped>

.dark thead tr a {
  color: $light-grey;
}

.actions {
  min-width: 150px;
  padding: 0.4em;
}

.name {
  min-width: 200px;
  width: 200px;
}

th.time-spent,
td.time-spent {
  min-width: 80px;
  width: 80px;
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

th.metadata-descriptor {
  min-width: 120px;
  max-width: 120px;
  width: 120px;
  overflow-wrap: break-word;
  hyphens: auto;
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

td.name {
  font-size: 1.2em;
}

.asset-link {
  color: inherit
}

.info img {
  max-width: 80vh;
}

.task-type-name {
  max-width: 95%;
}
</style>
