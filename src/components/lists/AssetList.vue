<template>
<div class="data-list">

  <table-header-menu
    ref="headerMenu"
    :is-minimized="hiddenColumns[lastHeaderMenuDisplayed]"
    :is-current-user-admin="isCurrentUserAdmin"
    @minimize-clicked="onMinimizeColumnToggled()"
    @delete-all-clicked="onDeleteAllTasksClicked()"
  />

  <div class="table-header-wrapper">
    <table class="table table-header" ref="headerWrapper">
      <thead>
        <tr>
          <th class="episode" ref="th-episode" v-if="isTVShow">
            {{ $t('assets.fields.episode') }}
          </th>
          <th class="thumbnail" ref="th-thumbnail"></th>
          <th class="name" ref="th-name">{{ $t('assets.fields.name') }}</th>
          <th
            class="description"
            ref="th-description"
            v-if="!isCurrentUserClient"
          >
            {{ $t('assets.fields.description') }}
          </th>
          <th
            :class="{
              'validation-cell': !hiddenColumns[columnId],
              'hidden-validation-cell': hiddenColumns[columnId]
            }"
            :key="columnId"
            :style="getValidationStyle(columnId)"
            v-for="columnId in sortedValidationColumns"
            v-if="!isLoading"
          >
            <div class="flexrow">
              <router-link
                class="flexrow-item"
                style="margin-right: 0;"
                :to="taskTypePath(columnId)"
              >
                {{ !hiddenColumns[columnId] ? taskTypeMap[columnId].name : '' }}
              </router-link>
              <chevron-down-icon
                @click="showHeaderMenu(columnId, $event)"
                class="header-icon flexrow-item"
              />
            </div>
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
              v-if="isCurrentUserManager && displayedAssets.length > 0 && !isLoading"
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
      :path="{
        name: 'new-asset',
        params: {production_id: currentProduction.id}
      }"
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

  <div
    ref="body"
    class="table-body"
    v-scroll="onBodyScroll"
    infinite-scroll-disabled="busy"
    infinite-scroll-distance="120"
    v-if="!isLoading"
  >
    <table
      class="table"
      v-if="isListVisible"
    >
      <tbody
        class="tbody"
        ref="body-tbody"
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
            @select="onTaskSelected"
            @unselect="onTaskUnselected"
            v-for="(columnId, j) in sortedValidationColumns"
          />
          <row-actions v-if="isCurrentUserManager"
            :entry="asset"
            :edit-route="editPath(asset.id)"
            :delete-route="deletePath(asset.id)"
            :restore-route="restorePath(asset.id)"
          />
          <td class="actions" v-else></td>
        </tr>
        <tr class="empty-line"></tr>
      </tbody>
    </table>
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

import DescriptionCell from '../cells/DescriptionCell'
import RowActions from '../widgets/RowActions'
import ButtonLink from '../widgets/ButtonLink'
import ButtonHrefLink from '../widgets/ButtonHrefLink'
import EntityThumbnail from '../widgets/EntityThumbnail'
import PageTitle from '../widgets/PageTitle'
import TableHeaderMenu from '../widgets/TableHeaderMenu'
import TableInfo from '../widgets/TableInfo'
import ValidationCell from '../cells/ValidationCell'

export default {
  name: 'asset-list',
  mixins: [entityListMixin],

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
    ButtonHrefLink,
    DescriptionCell,
    EntityThumbnail,
    ChevronDownIcon,
    PageTitle,
    RowActions,
    TableInfo,
    TableHeaderMenu,
    ValidationCell
  },

  created () {
    this.initHiddenColumns(this.validationColumns, this.hiddenColumns)
  },

  mounted () {
    this.resizeHeaders()
  },

  computed: {
    ...mapGetters([
      'assets',
      'assetFilledColumns',
      'assetSearchText',
      'assetSelectionGrid',
      'episodeMap',
      'currentEpisode',
      'currentProduction',
      'displayedAssetsLength',
      'nbSelectedTasks',
      'isCurrentUserAdmin',
      'isCurrentUserClient',
      'isCurrentUserManager',
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
    }
  },

  methods: {
    ...mapActions([
      'displayMoreAssets'
    ]),

    showHeaderMenu (columnId, event) {
      const headerMenuEl = this.$refs.headerMenu.$el
      if (headerMenuEl.className === 'header-menu') {
        headerMenuEl.className = 'header-menu hidden'
      } else {
        headerMenuEl.className = 'header-menu'
        let headerElement = event.srcElement.parentNode.parentNode
        if (headerElement.tagName !== 'TH') {
          headerElement = headerElement.parentNode
        }
        const left = headerElement.getBoundingClientRect().left + 1
        const top = headerElement.getBoundingClientRect().bottom
        headerMenuEl.style.left = left + 'px'
        headerMenuEl.style.top = top + 'px'
      }
      this.lastHeaderMenuDisplayed = columnId
    },

    onMinimizeColumnToggled () {
      this.hideColumn(this.lastHeaderMenuDisplayed)
      this.showHeaderMenu()
    },

    onDeleteAllTasksClicked () {
      this.$emit('delete-all-tasks', this.lastHeaderMenuDisplayed)
      this.showHeaderMenu()
    },

    onTaskSelected (validationInfo) {
      const selection = []
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
                selection.push({
                  entity: validationCell.entity,
                  column: validationCell.column,
                  task: validationCell.task,
                  x: validationCell.rowX,
                  y: validationCell.columnY
                })
              }
            }
          }
          this.$store.commit('ADD_SELECTED_TASK', validationInfo)
        }
      } else if (!validationInfo.isCtrlKey) {
        this.$store.commit('CLEAR_SELECTED_TASKS')
      }
      if (selection.length === 0) {
        this.$store.commit('ADD_SELECTED_TASK', validationInfo)
      } else {
        this.$store.commit('ADD_SELECTED_TASKS', selection)
      }

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

      const maxHeight =
        this.$refs.body.scrollHeight - this.$refs.body.offsetHeight
      if (maxHeight < (position.scrollTop + 100)) {
        this.loadMoreAssets()
      }
    },

    loadMoreAssets () {
      this.displayMoreAssets()
      this.$nextTick(this.resizeHeaders)
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
    },

    resizeHeaders () {
      if (
        this.$refs['body-tbody'] &&
        this.$refs['body-tbody'][0] &&
        this.$refs['body-tbody'][0].children.length > 0
      ) {
        if (this.$refs['th-episode']) {
          const episodeWidth =
            this.$refs['body-tbody'][0].children[1].children[0].offsetWidth
          this.$refs['th-episode'].style['min-width'] = `${episodeWidth}px`
          const nameWidth =
            this.$refs['body-tbody'][0].children[1].children[2].offsetWidth
          this.$refs['th-name'].style['min-width'] = `${nameWidth}px`
        } else {
          const thumbnailWidth =
            this.$refs['body-tbody'][0].children[1].children[0].offsetWidth
          this.$refs['th-thumbnail'].style['min-width'] = `${thumbnailWidth}px`
          const nameWidth =
            this.$refs['body-tbody'][0].children[1].children[1].offsetWidth
          this.$refs['th-name'].style['min-width'] = `${nameWidth}px`
          const descriptionWidth =
            this.$refs['body-tbody'][0].children[1].children[2].offsetWidth
          this.$refs['th-description'].style['min-width'] =
            `${descriptionWidth}px`
        }
      }
    }
  },

  watch: {
    validationColumns () {
      this.initHiddenColumns(this.validationColumns, this.hiddenColumns)
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
  width: 200px;
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
  min-width: 120px;
  max-width: 120px;
  width: 120px;
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
  position: relative;
  z-index: 1;
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

.empty-line {
  border-right: 0;
  border-left: 0;
  border-bottom: 1px solid #CCC;
  height: 1em;
  box-shadow: inner 2px 2px 2px #EEE;
}

.table-header-wrapper {
  position: relative;
}
</style>
