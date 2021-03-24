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
            v-for="descriptor in visibleMetadataDescriptors"
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

          <th scope="col" class="frames" v-if="isFrames && isShowInfos && metadataDisplayHeaders.frames">
            {{ $t('shots.fields.nb_frames') }}
          </th>
          <th scope="col" class="framein" v-if="isFrameIn && isShowInfos && metadataDisplayHeaders.frameIn">
            {{ $t('shots.fields.frame_in') }}
          </th>
          <th scope="col" class="frameout" v-if="isFrameOut && isShowInfos && metadataDisplayHeaders.frameOut">
            {{ $t('shots.fields.frame_out') }}
          </th>
          <th scope="col" class="fps" v-if="isFps && isShowInfos && metadataDisplayHeaders.fps">
            {{ $t('shots.fields.fps') }}
          </th>

          <th
            scope="col"
            ref="th-spent"
            class="time-spent"
            v-if="!isCurrentUserClient && isShowInfos && isShotTime && metadataDisplayHeaders.timeSpent"
           >
            {{ $t('shots.fields.time_spent') }}
          </th>

          <th
            scope="col"
            class="estimation"
            ref="th-spent"
            v-if="!isCurrentUserClient && isShowInfos && isShotEstimation && metadataDisplayHeaders.estimation"
          >
            {{ $t('main.estimation_short') }}
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
              v-show="columnSelectorDisplayed && isShowInfos"
            />

            <button-simple
              class="is-small is-pulled-right"
              icon="down"
              @click="toggleColumnSelector"
              v-if="shotMetadataDescriptors.length > 0 && isShowInfos"
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
            <span
              class="datatable-row-header"
              @click="$emit('sequence-clicked', group[0].sequence_name)"
            >
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
              <entity-thumbnail :entity="shot" :empty-height="32" />
              <router-link
                tabindex="-1"
                :title="shot.full_name"
                :to="shotPath(shot.id)"
              >
                {{ shot.name }}
              </router-link>
            </div>
          </th>
          <description-cell
            class="description"
            :entry="shot"
            :editable="isCurrentUserManager"
            @description-changed="value => onDescriptionChanged(shot, value)"
            v-if="!isCurrentUserClient && isShowInfos && isShotDescription"
          />
          <td
            class="metadata-descriptor"
            :key="shot.id + '-' + descriptor.id"
            v-for="(descriptor, j) in visibleMetadataDescriptors"
            v-if="isShowInfos"
          >
            <input
              :ref="`editor-${getIndex(i, k)}-${j}`"
              class="input-editor"
              :value="getMetadataFieldValue(descriptor, shot)"
              @input="
                event => onMetadataFieldChanged(shot, descriptor, event)"
              @keyup.ctrl="event => onInputKeyUp(event, getIndex(i, k), j)"
              v-if="descriptor.choices.length === 0 && isCurrentUserManager"
            />
            <span
              class="select"
              v-else-if="isCurrentUserManager"
            >
              <select
                class="select-input"
                :ref="`editor-${getIndex(i, k)}-${j}`"
                @keydown.ctrl="pauseEvent"
                @keyup.ctrl="event => onInputKeyUp(event, getIndex(i, k), j)"
                @change="
                  event => onMetadataFieldChanged(shot, descriptor, event)"
              >
                <option
                  v-for="(option, i) in getDescriptorChoicesOptions(descriptor)"
                  :key="`${shot.id}-${descriptor.id}-${i}-${option.label}-${option.value}`"
                  :value="option.value"
                  :selected="getMetadataFieldValue(descriptor, shot) == option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </span>
            <span class="metadata-value" v-else>
              {{ getMetadataFieldValue(descriptor, shot) }}
            </span>
          </td>
          <td class="frames"
            v-if="isFrames && isShowInfos && metadataDisplayHeaders.frames"
          >
            <input
              :ref="`editor-${getIndex(i, k)}-${descriptorLength}`"
              class="input-editor"
              step="1"
              :value="shot.nb_frames"
              type="number"
              min="0"
              @input="event => onNbFramesChanged(shot, event.target.value)"
              @keydown="onNumberFieldKeyDown"
              @keyup.ctrl="event => onInputKeyUp(event, getIndex(i, k), descriptorLength)"
              v-if="isCurrentUserManager"
            />
            <span class="metadata-value" v-else>
              {{ shot.nb_frames }}
            </span>
          </td>
          <td class="framein" v-if="isFrameIn && isShowInfos && metadataDisplayHeaders.frameIn">
            <input
              :ref="`editor-${getIndex(i, k)}-${descriptorLength + 1}`"
              class="input-editor"
              step="1"
              type="number"
              min="0"
              :value="getMetadataFieldValue({field_name: 'frame_in'}, shot)"
              @input="event => onMetadataFieldChanged(shot, {field_name: 'frame_in'}, event)"
              @keydown="onNumberFieldKeyDown"
              @keyup.ctrl="event => onInputKeyUp(event, getIndex(i, k), descriptorLength + 1)"
              v-if="isCurrentUserManager"
            />
            <span class="metadata-value" v-else>
              {{ getMetadataFieldValue({field_name: 'frame_in'}, shot) }}
            </span>
          </td>
          <td class="frameout" v-if="isFrameOut && isShowInfos && metadataDisplayHeaders.frameOut">
            <input
              :ref="`editor-${getIndex(i, k)}-${descriptorLength + 2}`"
              class="input-editor"
              step="1"
              type="number"
              min="0"
              :value="getMetadataFieldValue({field_name: 'frame_out'}, shot)"
              @keydown="onNumberFieldKeyDown"
              @input="event => onMetadataFieldChanged(shot, {field_name: 'frame_out'}, event)"
              @keyup.ctrl="event => onInputKeyUp(event, getIndex(i, k), descriptorLength + 2)"
              v-if="isCurrentUserManager"
            />
            <span class="metadata-value" v-else>
              {{ getMetadataFieldValue({field_name: 'frame_out'}, shot) }}
            </span>
          </td>
          <td class="fps" v-if="isFps && isShowInfos && metadataDisplayHeaders.fps">
            <input
              :ref="`editor-${getIndex(i, k)}-${descriptorLength + 3}`"
              class="input-editor"
              step="1"
              type="number"
              :value="getMetadataFieldValue({field_name: 'fps'}, shot)"
              @keydown="onNumberFieldKeyDown"
              @input="event => onMetadataFieldChanged(shot, {field_name: 'fps'}, event)"
              @keyup.ctrl="event => onInputKeyUp(event, getIndex(i, k), descriptorLength + 3)"
              v-if="isCurrentUserManager"
            />
            <span class="metadata-value" v-else>
              {{ getMetadataFieldValue({field_name: 'fps'}, shot) }}
            </span>
          </td>

          <td
            class="time-spent"
            v-if="!isCurrentUserClient && isShowInfos && isShotTime && metadataDisplayHeaders.timeSpent"
          >
            {{ formatDuration(shot.timeSpent) }}
          </td>

          <td
            class="estimation"
            v-if="!isCurrentUserClient && isShowInfos && isShotEstimation && metadataDisplayHeaders.estimation"
          >
            {{ formatDuration(shot.estimation) }}
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
     {{ $tc('main.days_spent', displayedShotsTimeSpent) }},
     {{ formatDuration(displayedShotsEstimation) }}
     {{ $tc('main.man_days', displayedShotsEstimation) }},
     {{ displayedShotsFrames }} {{ $tc('main.nb_frames', displayedShotsFrames) }})

  </p>

</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import {
  ChevronDownIcon
} from 'vue-feather-icons'
import { descriptorMixin } from '@/components/mixins/descriptors'
import { domMixin } from '@/components/mixins/dom'
import { entityListMixin } from '@/components/mixins/entity_list'
import { formatListMixin } from '@/components/mixins/format'
import { selectionListMixin } from '@/components/mixins/selection'

import ButtonSimple from '@/components/widgets/ButtonSimple'
import DescriptionCell from '@/components/cells/DescriptionCell'
import EntityThumbnail from '@/components/widgets/EntityThumbnail'
import TableMetadataHeaderMenu from
  '@/components/widgets/TableMetadataHeaderMenu'
import TableMetadataSelectorMenu from
  '@/components/widgets/TableMetadataSelectorMenu'
import RowActionsCell from '@/components/cells/RowActionsCell'
import TableHeaderMenu from '@/components/widgets/TableHeaderMenu'
import TableInfo from '@/components/widgets/TableInfo'
import ValidationCell from '@/components/cells/ValidationCell'

export default {
  name: 'shot-list',
  mixins: [
    descriptorMixin,
    domMixin,
    formatListMixin,
    entityListMixin,
    selectionListMixin
  ],

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
      lastHeaderMenuDisplayed: null,
      metadataDisplayHeaders: {
        fps: true,
        frameIn: true,
        frameOut: true,
        frames: true,
        estimation: true,
        timeSpent: true
      }
    }
  },

  components: {
    ButtonSimple,
    ChevronDownIcon,
    DescriptionCell,
    EntityThumbnail,
    RowActionsCell,
    TableHeaderMenu,
    TableMetadataHeaderMenu,
    TableMetadataSelectorMenu,
    TableInfo,
    ValidationCell
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'currentEpisode',
      'displayedShotsEstimation',
      'displayedShotsLength',
      'displayedShotsTimeSpent',
      'displayedShotsFrames',
      'isCurrentUserAdmin',
      'isCurrentUserManager',
      'isCurrentUserClient',
      'isFps',
      'isFrames',
      'isFrameIn',
      'isFrameOut',
      'isSingleEpisode',
      'isShotDescription',
      'isShotEstimation',
      'isShotTime',
      'isShowAssignations',
      'isShowInfos',
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

    visibleMetadataDescriptors () {
      return this.shotMetadataDescriptors.filter(
        descriptor => this.metadataDisplayHeaders[descriptor.field_name] === undefined || this.metadataDisplayHeaders[descriptor.field_name]
      )
    },

    visibleColumns () {
      let count = 2
      count += !this.isCurrentUserClient &&
        this.isShowInfos &&
        this.isShotDescription
        ? 1
        : 0
      count += this.visibleMetadataDescriptors.length
      count += !this.isCurrentUserClient &&
        this.isShowInfos &&
        this.isShotTime && this.metadataDisplayHeaders.timeSpent
        ? 1
        : 0
      count += !this.isCurrentUserClient &&
        this.isShowInfos &&
        this.isShotEstimation && this.metadataDisplayHeaders.estimation
        ? 1
        : 0
      count += this.isShowInfos && this.metadataDisplayHeaders.frames ? 1 : 0
      count += this.isShowInfos && this.isFrameIn && this.metadataDisplayHeaders.frameIn ? 1 : 0
      count += this.isShowInfos && this.isFrameOut && this.metadataDisplayHeaders.frameOut ? 1 : 0
      count += this.isShowInfos && this.isFps && this.metadataDisplayHeaders.fps ? 1 : 0
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

    onInputKeyUp (event, i, j) {
      const listWidth = this.visibleMetadataDescriptors.length + 4
      const listHeight = this.displayedShotsLength
      this.keyMetadataNavigation(listWidth, listHeight, i, j, event.key)
      return this.pauseEvent(event)
    },

    onNbFramesChanged (entry, value) {
      this.$emit('field-changed', {
        entry, fieldName: 'nb_frames', value: this.sanitizeInteger(value)
      })
    },

    getIndex (i, k) {
      return this.getEntityLineNumber(this.displayedShots, i, k)
    }
  },

  watch: {
    displayedShots () {
      this.$options.lineIndex = {}
    },

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
  min-width: 160px;
  position: relative;
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

.datatable-row th.name {
  font-size: 1.1em;
  padding: 6px;

  .flexrow {
  }
}

.datatable-row-header {
  cursor: pointer;
}

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

td.frames,
td.framein,
td.frameout,
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

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

input[type="number"] {
    -moz-appearance: textfield;
}

.metadata-value {
  padding: 0.8rem;
}
</style>
