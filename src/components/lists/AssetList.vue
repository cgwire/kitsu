<template>
<div class="data-list">
  <div class="table-header-wrapper">
    <table class="table table-header" ref="headerWrapper">
      <thead>
        <tr>
          <th class="episode" v-if="isTVShow">
            {{ $t('assets.fields.episode') }}
          </th>
          <th class="thumbnail"></th>
          <th class="name">{{ $t('assets.fields.name') }}</th>
          <th class="description" v-if="!isCurrentUserClient">
            {{ $t('assets.fields.description') }}
          </th>
          <th
            class="validation-cell"
            :key="columnId"
            :style="getValidationStyle(columnId)"
            v-for="columnId in validationColumns"
          >
            <router-link
              :to="taskTypePath(columnId)"
            >
              {{ taskTypeMap[columnId].name }}
            </router-link>
          </th>
          <th class="actions">
            <button-link
              :class="{
                'is-small': true,
                highlighted: isEmptyTask
              }"
              icon="plus"
              :text="$t('tasks.create_tasks')"
              :path="createTasksPath"
              v-if="isCurrentUserManager && displayedAssets.length > 0"
            />
          </th>
        </tr>
      </thead>
    </table>
  </div>

  <table-info
    :is-loading="isLoading"
    :is-error="isError"
  />

  <div class="has-text-centered" v-if="isEmptyList && !isCurrentUserClient">
    <p class="info">
      <img src="../../assets/illustrations/empty_asset.png" />
    </p>
    <p class="info">{{ $t('assets.empty_list') }}</p>
    <button-link
      class="level-item big-button"
      :text="$t('assets.new_assets')"
      :path="{
        name: 'new-asset',
        params: {production_id: currentProduction.id}
      }"
    />
  </div>
  <div class="has-text-centered" v-if="isEmptyList && isCurrentUserClient">
    <p class="info">
      <img src="../../assets/illustrations/empty_asset.png" />
    </p>
    <p class="info">{{ $t('assets.empty_list_client') }}</p>
  </div>

  <div
    ref="body"
    class="table-body"
    v-scroll="onBodyScroll"
    v-infinite-scroll="loadMoreAssets"
    infinite-scroll-disabled="busy"
    infinite-scroll-distance="120"
  >
    <table
      class="table"
      v-if="isListVisible"
    >
      <tbody
        class="tbody"
        :key="group[0] ? group[0].asset_type_id + group[0].canceled : ''"
        v-for="(group, k) in displayedAssets"
      >
        <tr class="type-header">
          <td colspan="30">
            {{ group[0] ? group[0].asset_type_name : '' }}
          </td>
        </tr>
        <tr
          :key="asset.id"
          :class="{canceled: asset.canceled}"
          v-for="(asset, i) in group"
        >
          <td class="episode" v-if="isTVShow">
            {{ episodeMap[asset.episode_id] ? episodeMap[asset.episode_id].name : $t('main.all') }}
          </td>
          <td class="thumbnail">
            <entity-thumbnail :entity="asset" />
          </td>
          <td :class="{name: true, bold: !asset.canceled}">
            <router-link
              class="asset-link"
              :to="assetPath(asset.id)"
            >
              {{ asset.name }}
            </router-link>
          </td>
          <description-cell
            class="description"
            v-if="!isCurrentUserClient"
            :entry="asset"
          />
          <validation-cell
            class="validation-cell"
            :key="columnId + '-' + asset.id"
            :ref="'validation-' + getIndex(i, k) + '-' + j"
            :column="taskTypeMap[columnId]"
            :entity="asset"
            :selected="assetSelectionGrid[getIndex(i, k)][j]"
            :rowX="getIndex(i, k)"
            :columnY="j"
            @select="onTaskSelected"
            @unselect="onTaskUnselected"
            v-for="(columnId, j) in validationColumns"
          />
          <row-actions v-if="isCurrentUserManager"
            :entry="asset"
            :edit-route="editPath(asset.id)"
            :delete-route="deletePath(asset.id)"
            :restore-route="restorePath(asset.id)"
          />
          <td class="actions" v-else>
          </td>
        </tr>
        <tr class="empty-line"></tr>
      </tbody>
    </table>
  </div>

  <p class="has-text-centered nb-assets" v-if="!isEmptyList">
    {{ displayedAssetsLength }} {{ $tc('assets.number', displayedAssetsLength) }}
  </p>

</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import colors from '../../lib/colors'

import DescriptionCell from '../cells/DescriptionCell'
import RowActions from '../widgets/RowActions'
import ButtonLink from '../widgets/ButtonLink'
import ButtonHrefLink from '../widgets/ButtonHrefLink'
import EntityThumbnail from '../widgets/EntityThumbnail'
import PageTitle from '../widgets/PageTitle'
import TableInfo from '../widgets/TableInfo'
import ValidationCell from '../cells/ValidationCell'

export default {
  name: 'asset-list',
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
      busy: false,
      scrollPosition: 0,
      lastSelection: null,
      selectionGrid: null
    }
  },

  components: {
    ButtonLink,
    ButtonHrefLink,
    DescriptionCell,
    EntityThumbnail,
    PageTitle,
    RowActions,
    TableInfo,
    ValidationCell
  },

  computed: {
    ...mapGetters([
      'assets',
      'assetSearchText',
      'assetSelectionGrid',
      'episodeMap',
      'currentEpisode',
      'currentProduction',
      'displayedAssetsLength',
      'nbSelectedTasks',
      'isCurrentUserClient',
      'isCurrentUserManager',
      'isTVShow',
      'selectedTasks',
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
    }
  },

  methods: {
    ...mapActions([
      'displayMoreAssets'
    ]),

    getBackground (color) {
      return colors.hexToRGBa(color, 0.08)
    },

    onTaskSelected (validationInfo) {
      if (validationInfo.isShiftKey) {
        if (this.lastSelection) {
          let startX = this.lastSelection.x
          let endX = validationInfo.x
          let startY = this.lastSelection.y
          let endY = validationInfo.y
          if (validationInfo.x < this.lastSelection.x) {
            startX = validationInfo.x
            endX = this.lastSelection.x
          }
          if (validationInfo.y < this.lastSelection.y) {
            startY = validationInfo.y
            endY = this.lastSelection.y
          }

          for (let i = startX; i <= endX; i++) {
            for (let j = startY; j <= endY; j++) {
              const ref = 'validation-' + i + '-' + j
              const validationCell = this.$refs[ref][0]
              if (!this.assetSelectionGrid[i][j]) {
                validationCell.select({ctrlKey: true, isUserClick: false})
              }
            }
          }
        }
      } else if (!validationInfo.isCtrlKey) {
        this.$store.commit('CLEAR_SELECTED_TASKS')
      }
      this.$store.commit('ADD_SELECTED_TASK', validationInfo)

      if (!validationInfo.isShiftKey && validationInfo.isUserClick) {
        this.lastSelection = {
          x: validationInfo.x,
          y: validationInfo.y
        }
      }
    },

    onTaskUnselected (validationInfo) {
      if (!validationInfo.isCtrlKey) {
        if (this.nbSelectedTasks === 1) {
          this.$store.commit('REMOVE_SELECTED_TASK', validationInfo)
        } else {
          this.$store.commit('CLEAR_SELECTED_TASKS')
          this.$store.commit('ADD_SELECTED_TASK', validationInfo)
        }
      } else {
        this.$store.commit('REMOVE_SELECTED_TASK', validationInfo)
      }
    },

    onBodyScroll (event, position) {
      this.$refs.headerWrapper.style.left = `-${position.scrollLeft}px`
      this.$emit('scroll', position.scrollTop)
    },

    loadMoreAssets () {
      setTimeout(() => {
        this.displayMoreAssets()
      }, 1)
    },

    setScrollPosition (scrollPosition) {
      if (this.$refs.body) {
        this.$refs.body.scrollTop = scrollPosition
      }
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

    getValidationStyle (columnId) {
      const taskType = this.taskTypeMap[columnId]
      return {
        'border-left': `1px solid ${taskType.color}`,
        'background': this.getBackground(taskType.color)
      }
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
      let route = {
        name: 'task-type',
        params: {
          production_id: this.currentProduction.id,
          task_type_id: taskTypeId,
          type: 'assets'
        }
      }

      if (this.isTVShow && this.currentEpisode) {
        route.name = `episode-task-type`
        route.params.episode_id = this.currentEpisode.id
      }

      return route
    },

    getPath (section, assetId) {
      let route = {
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
    }
  }
}
</script>

<style scoped>
.table {
  min-width: 1000px;
}

.actions {
  min-width: 150px;
  padding: 0.4em;
}

.name {
  min-width: 200px;
  max-width: 200px;
  width: 200px;
}

.episode {
  min-width: 50px;
  max-width: 50px;
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
  min-width: 120px;
  max-width: 120px;
  width: 120px;
  margin-right: 1em;
}

td.name {
  font-size: 1.2em;
}

.thumbnail {
  min-width: 50px;
  max-width: 50px;
  width: 50px;
  padding: 0;
}

.thumbnail img {
  margin-top: 5px;
}

.asset-link {
  color: inherit
}

.highlighted {
  background: #00B242;
  color: white;
}

tr {
  border-right: 1px solid #CCC;
  border-left: 1px solid #CCC;
}

thead tr {
  border-right: 1px solid transparent;
  border-left: 1px solid transparent;
}

thead tr a {
  color: #7A7A7A;
}

.table-body {
  padding-top: 1em;
}

tbody:first-child tr:first-child {
  border-top: 1px solid #CCC;
}

tbody:last-child .empty-line:last-child {
  border: 0;
}

tbody {
  user-select: none;
}

.table tr.type-header {
  border-top: 1px solid #CCC;
  font-size: 1.1em;
}

.table tr.type-header:hover {
  background: transparent;
}

.table tr.type-header td {
  font-weight: bold;
  padding-left: 0.3em;
}

.empty-line {
  border-right: 0;
  border-left: 0;
  border-bottom: 1px solid #CCC;
  height: 1em;
  box-shadow: inner 2px 2px 2px #EEE;
}
</style>
