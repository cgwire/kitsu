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
        id="datatable-shot"
        v-columns-resizable
      >
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
                v-if="isCurrentUserAdmin && !isLoading"
              />
            </div>
          </th>
          <th
            scope="col"
            class="description"
            v-if="!isCurrentUserClient && isShowInfos && isShotDescription"
          >
            {{ $t('shots.fields.description') }}
          </th>
          <th
            scope="col"
            class="metadata-descriptor"
            :key="descriptor.id"
            v-for="descriptor in shotMetadataDescriptors"
            v-if="isShowInfos"
          >
            <div class="flexrow">
              <span class="flexrow-item datatable-dropdown">
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
            ref="th-spent"
            class="time-spent"
            v-if="!isCurrentUserClient && isShowInfos && isTime"
           >
            {{ $t('shots.fields.time_spent') }}
          </th>
          <th scope="col" class="frames" v-if="isShowInfos">
            {{ $t('shots.fields.nb_frames') }}
          </th>
          <th scope="col" class="framein" v-if="isFrameIn && isShowInfos">
            {{ $t('shots.fields.frame_in') }}
          </th>
          <th scope="col" class="frameout" v-if="isFrameOut && isShowInfos">
            {{ $t('shots.fields.frame_out') }}
          </th>
          <th scope="col" class="fps" v-if="isFps && isShowInfos">
            {{ $t('shots.fields.fps') }}
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
              v-if="isCurrentUserManager"
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
          <th
            scope="rowgroup"
            :colspan="visibleColumns"
          >
            <span class="datatable-row-header">
              {{ group[0] ? group[0].sequence_name : '' }}
            </span>
          </th>
        </tr>
        <tr
          class="datatable-row"
          :key="shot.id"
          :class="{canceled: shot.canceled}"
          v-for="(shot, i) in group"
        >
          <th
            scope="row"
            :class="{
              'datatable-row-header': true,
              'shot-name': true,
              name: true,
              bold: !shot.canceled}"
            >
            <div class="flexrow">
              <entity-thumbnail :entity="shot" />
              <router-link :to="shotPath(shot.id)">
                {{ shot.name }}
              </router-link>
            </div>
          </th>
          <description-cell
            class="description"
            :entry="shot"
            v-if="!isCurrentUserClient && isShowInfos && isShotDescription"
          />
          <td
            class="metadata-descriptor"
            :key="shot.id + '-' + descriptor.id"
            v-for="descriptor in shotMetadataDescriptors"
            v-if="isShowInfos"
          >
            <div
              class="ellipsis"
              :title="shot.data ? shot.data[descriptor.field_name] : ''"
            >
              {{ shot.data ? shot.data[descriptor.field_name] : '' }}
            </div>
          </td>
          <td
            class="time-spent"
            v-if="!isCurrentUserClient && isShowInfos && isTime"
          >
            {{ formatDuration(shot.timeSpent) }}
          </td>
          <td class="frames"
            v-if="isShowInfos"
          >
            {{ shot.nb_frames }}
          </td>
          <td class="framein" v-if="isFrameIn && isShowInfos">
            {{ shot.data && shot.data.frame_in ? shot.data.frame_in : ''}}
          </td>
          <td class="frameout" v-if="isFrameOut && isShowInfos">
            {{ shot.data && shot.data.frame_out ? shot.data.frame_out : ''}}
          </td>
          <td class="fps" v-if="isFps && isShowInfos">
            {{ shot.data && shot.data.fps ? shot.data.fps : ''}}
          </td>
          <validation-cell
            :class="{
              'validation-cell': !hiddenColumns[columnId],
              'hidden-validation-cell': hiddenColumns[columnId]
            }"
            :key="`${columnId}-${shot.id}`"
            :ref="`validation-${getIndex(i, k)}-${j}`"
            :column="taskTypeMap[columnId]"
            :entity="shot"
            :task-test="taskMap[shot.validations[columnId]]"
            :minimized="hiddenColumns[columnId]"
            :selected="shotSelectionGrid[getIndex(i, k)][j]"
            :rowX="getIndex(i, k)"
            :columnY="j"
            :is-assignees="isShowAssignations"
            @select="onTaskSelected"
            @unselect="onTaskUnselected"
            v-for="(columnId, j) in displayedValidationColumns"
            v-if="!isLoading"
          />
          <row-actions
            :entry="shot"
            :edit-route="editPath(shot.id)"
            :restore-route="restorePath(shot.id)"
            :delete-route="deletePath(shot.id)"
            :hide-history="false"
            @history-clicked="$emit('shot-history', shot)"
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

  <p
    class="has-text-centered nb-shots"
    v-if="!isEmptyList && !isLoading"
  >
    {{ displayedShotsLength }} {{ $tc('shots.number', displayedShotsLength) }}
    ({{ formatDuration(displayedShotsTimeSpent) }}
     {{ $tc('main.days_spent', displayedShotsTimeSpent) }}, {{ displayedShotsFrames }} {{ $tc('main.nb_frames', displayedShotsFrames) }})

  </p>

</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import {
  ChevronDownIcon
} from 'vue-feather-icons'
import { entityListMixin } from './base'
import { selectionListMixin } from './selection'
import { formatListMixin } from './format_mixin'

import ButtonSimple from '../widgets/ButtonSimple'
import DescriptionCell from '../cells/DescriptionCell'
import EntityThumbnail from '../widgets/EntityThumbnail'
import TableMetadataHeaderMenu from '../widgets/TableMetadataHeaderMenu'
import RowActions from '../widgets/RowActions'
import TableHeaderMenu from '../widgets/TableHeaderMenu'
import TableInfo from '../widgets/TableInfo'
import ValidationCell from '../cells/ValidationCell'

export default {
  name: 'shot-list',
  mixins: [entityListMixin, selectionListMixin, formatListMixin],

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
    ButtonSimple,
    ChevronDownIcon,
    DescriptionCell,
    EntityThumbnail,
    RowActions,
    TableHeaderMenu,
    TableMetadataHeaderMenu,
    TableInfo,
    ValidationCell
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'currentEpisode',
      'displayedShotsLength',
      'displayedShotsTimeSpent',
      'displayedShotsFrames',
      'isCurrentUserAdmin',
      'isCurrentUserManager',
      'isCurrentUserClient',
      'isFps',
      'isFrameIn',
      'isFrameOut',
      'isSingleEpisode',
      'isShotDescription',
      'isShowAssignations',
      'isShowInfos',
      'isTime',
      'isTVShow',
      'nbSelectedTasks',
      'shotFilledColumns',
      'shotMap',
      'shotMetadataDescriptors',
      'shotSearchText',
      'shotSelectionGrid',
      'taskMap',
      'taskTypeMap'
    ]),

    isEmptyList () {
      return this.displayedShots &&
             this.displayedShots[0].length === 0 &&
             !this.isLoading &&
             !this.isError &&
             (!this.shotSearchText || this.shotSearchText.length === 0)
    },

    createTasksPath () {
      return this.getPath('create-shot-tasks')
    },

    manageShotsPath () {
      const route = {
        name: 'manage-shots',
        params: {
          production_id: this.currentProduction.id
        }
      }

      if (this.isTVShow && this.currentEpisode) {
        route.name = 'episode-manage-shots'
        route.params.episode_id = this.currentEpisode.id
      }

      return route
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
          this.displayedShotsLength > 0
        )
      )
    },

    visibleColumns () {
      let count = 2
      count += !this.isCurrentUserClient &&
        this.isShowInfos &&
        this.isShotDescription
        ? 1
        : 0
      count += this.shotMetadataDescriptors.length
      count += !this.isCurrentUserClient &&
        this.isShowInfos &&
        this.isTime
        ? 1
        : 0
      count += this.isShowInfos ? 1 : 0
      count += this.isShowInfos && this.isFrameIn ? 1 : 0
      count += this.isShowInfos && this.isFrameOut ? 1 : 0
      count += this.isShowInfos && this.isFps ? 1 : 0
      count += this.displayedValidationColumns.length
      return count
    },

    displayedValidationColumns () {
      return this.validationColumns.filter((columnId) => {
        return this.shotFilledColumns[columnId] &&
          (!this.hiddenColumns[columnId] || this.isShowInfos)
      })
    }
  },

  methods: {
    ...mapActions([
      'displayMoreShots'
    ]),

    onBodyScroll (event, position) {
      this.$emit('scroll', position.scrollTop)
      const maxHeight =
        this.$refs.body.scrollHeight - this.$refs.body.offsetHeight
      if (maxHeight < (position.scrollTop + 100)) {
        this.loadMoreShots()
      }
    },

    loadMoreShots () {
      this.displayMoreShots()
    },

    // Remaining function for retrocompatibility
    resizeHeaders () {
      return true
    },
    //

    taskTypePath (taskTypeId) {
      if (this.isTVShow && this.currentEpisode) {
        return {
          name: 'episode-task-type',
          params: {
            production_id: this.currentProduction.id,
            episode_id: this.currentEpisode.id,
            task_type_id: taskTypeId,
            type: 'shots'
          }
        }
      } else {
        return {
          name: 'task-type',
          params: {
            production_id: this.currentProduction.id,
            task_type_id: taskTypeId,
            type: 'shots'
          }
        }
      }
    },

    shotPath (shotId) {
      return this.getPath('shot', shotId)
    },

    editPath (shotId) {
      return this.getPath('edit-shot', shotId)
    },

    deletePath (shotId) {
      return this.getPath('delete-shot', shotId)
    },

    restorePath (shotId) {
      return this.getPath('restore-shot', shotId)
    },

    getPath (section, shotId) {
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

    getIndex (i, k) {
      let j = 0
      let index = 0
      while (j < k) {
        index += this.displayedShots[j].length
        j++
      }
      return i + index
    }
  },

  watch: {
    validationColumns () {
      this.initHiddenColumns(this.validationColumns, this.hiddenColumns)
    }
  }
}
</script>

<style lang="scss" scoped>
.project {
  min-width: 60px;
  width: 60px;
}

.actions {
  min-width: 140px;
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

.time-spent {
  min-width: 80px;
  max-width: 80px;
  width: 80px;
}

td.name {
  font-size: 1.2em;
}

td.sequence {
  font-size: 1.2em;
}

.canceled {
  text-decoration: line-through;
}

span.thumbnail-empty {
  display: block;
  width: 50px;
  height: 30px;
  background: #F3F3F3;
}

th.metadata-descriptor {
  min-width: 120px;
  max-width: 120px;
  width: 120px;
}

.info {
  margin-top: 2em;
}

.info img {
  max-width: 80vh;
}

.task-type-name {
  max-width: 95%;
}
</style>
