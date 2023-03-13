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
        @select-column="onSelectColumn"
        @toggle-stick="stickColumnClicked()"
      />

      <table-metadata-header-menu
        ref="headerMetadataMenu"
        :is-edit-allowed="
          isMetadataColumnEditAllowed(lastMetadaDataHeaderMenuDisplayed)
        "
        :is-sticked="stickedColumns[lastMetadaDataHeaderMenuDisplayed]"
        @edit-clicked="onEpisodeMetadataClicked()"
        @delete-clicked="onDeleteMetadataClicked()"
        @sort-by-clicked="onSortByMetadataClicked()"
        @toggle-stick="metadataStickColumnClicked($event)"
      />

      <table class="datatable">
        <thead
          class="datatable-head"
          id="datatable-episode"
          v-columns-resizable
        >
          <tr>
            <th
              scope="col"
              class="name episode-name datatable-row-header"
              ref="th-episode"
            >
              <div class="flexrow">
                <span class="flexrow-item">
                  {{ $t('episodes.fields.name') }}
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
            <metadata-header
              :ref="`editor-${j}`"
              :key="descriptor.id"
              :descriptor="descriptor"
              :left="
                offsets['editor-' + j] ? `${offsets['editor-' + j]}px` : '0'
              "
              is-stick
              @show-metadata-header-menu="
                event => showMetadataHeaderMenu(descriptor.id, event)
              "
              v-for="(descriptor, j) in stickedVisibleMetadataDescriptors"
              v-if="isShowInfos"
            />
            <validation-header
              :ref="`validation-${columnIndexInGrid}`"
              :key="columnId"
              :hidden-columns="hiddenColumns"
              :column-id="columnId"
              :validation-style="getValidationStyle(columnId)"
              :left="
                offsets['validation-' + columnIndexInGrid]
                  ? `${offsets['validation-' + columnIndexInGrid]}px`
                  : '0'
              "
              type="editor"
              is-stick
              @show-header-menu="
                event => showHeaderMenu(columnId, columnIndexInGrid, event)
              "
              v-for="(
                columnId, columnIndexInGrid
              ) in stickedDisplayedValidationColumns"
              v-if="!isLoading"
            />

            <th
              scope="col"
              class="description selectable"
              v-if="!isCurrentUserClient && isShowInfos && isEpisodeDescription"
            >
              {{ $t('episodes.fields.description') }}
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
            <th
              scope="col"
              class="time-spent"
              ref="th-spent"
              v-if="
                !isCurrentUserClient &&
                isShowInfos &&
                isEpisodeTime &&
                metadataDisplayHeaders.timeSpent
              "
            >
              {{ $t('episodes.fields.time_spent') }}
            </th>
            <th
              scope="col"
              class="estimation"
              :title="$t('main.estimation')"
              ref="th-spent"
              v-if="
                !isCurrentUserClient &&
                isShowInfos &&
                isEpisodeEstimation &&
                metadataDisplayHeaders.estimation
              "
            >
              {{ $t('main.estimation_short') }}
            </th>
            <th
              scope="col"
              class="status"
              ref="th-status"
              v-if="isShowInfos && metadataDisplayHeaders.status"
            >
              {{ $t('main.status') }}
            </th>

            <validation-header
              :key="columnId"
              :hidden-columns="hiddenColumns"
              :column-id="columnId"
              :validation-style="getValidationStyle(columnId)"
              type="episodes"
              @show-header-menu="
                event => {
                  showHeaderMenu(columnId, columnIndexInGrid, event)
                }
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
                v-if="
                  isCurrentUserManager &&
                  displayedEpisodes.length > 0 &&
                  !isLoading
                "
              />

              <table-metadata-selector-menu
                ref="headerMetadataSelectorMenu"
                :metadataDisplayHeaders.sync="metadataDisplayHeaders"
                :descriptors="episodeMetadataDescriptors"
                :exclude="{
                  timeSpent: !isEpisodeTime,
                  estimation: !isEpisodeEstimation
                }"
                namespace="episodes"
                v-show="columnSelectorDisplayed && isShowInfos"
              />

              <button-simple
                class="is-small is-pulled-right"
                icon="down"
                @click="toggleColumnSelector"
                v-if="episodeMetadataDescriptors.length > 0 && isShowInfos"
              />
            </th>
          </tr>
        </thead>
        <tbody class="datatable-body">
          <tr
            class="datatable-row"
            scope="row"
            :key="episode.id"
            :class="{ canceled: episode.canceled }"
            v-for="(episode, i) in displayedEpisodes"
            v-if="!isLoading && isListVisible"
          >
            <th
              :class="{
                'datatable-row-header': true,
                'episode-name': true,
                name: true,
                strong: !episode.canceled
              }"
            >
              <div class="flexrow">
                <entity-thumbnail
                  :entity="episode"
                  :width="isBigThumbnails ? 150 : 50"
                  :height="isBigThumbnails ? 100 : 33"
                  :empty-width="isBigThumbnails ? 150 : 50"
                  :empty-height="isBigThumbnails ? 100 : 34"
                />
                <router-link
                  tabindex="-1"
                  :title="episode.name"
                  :to="episodePath(episode.id)"
                >
                  {{ episode.name }}
                </router-link>
              </div>
            </th>

            <!-- Metadata stick -->
            <td
              :ref="`editor-${i}-${j}`"
              class="metadata-descriptor datatable-row-header"
              :title="episode.data ? episode.data[descriptor.field_name] : ''"
              :style="{
                left: offsets['editor-' + j]
                  ? `${offsets['editor-' + j]}px`
                  : '0'
              }"
              :key="episode.id + '-' + descriptor.id"
              v-for="(descriptor, j) in stickedVisibleMetadataDescriptors"
              v-if="isShowInfos"
            >
              <input
                class="input-editor"
                @input="
                  event => onMetadataFieldChanged(episode, descriptor, event)
                "
                @keyup.ctrl="event => onInputKeyUp(event, i, j)"
                :value="getMetadataFieldValue(descriptor, episode)"
                v-if="
                  descriptor.choices.length === 0 &&
                  (isCurrentUserManager ||
                    isSupervisorInDepartments(descriptor.departments))
                "
              />
              <span
                class="select"
                v-else-if="
                  isCurrentUserManager ||
                  isSupervisorInDepartments(descriptor.departments)
                "
              >
                <select
                  class="select-input"
                  @keyup.ctrl="event => onInputKeyUp(event, i, j)"
                  @change="
                    event => onMetadataFieldChanged(episode, descriptor, event)
                  "
                >
                  <option
                    v-for="(option, i) in getDescriptorChoicesOptions(
                      descriptor
                    )"
                    :key="`${episode.id}-${descriptor.id}-${i}-${option.label}-${option.value}`"
                    :value="option.value"
                    :selected="
                      getMetadataFieldValue(descriptor, episode) ===
                      option.value
                    "
                  >
                    {{ option.label }}
                  </option>
                </select>
              </span>
              <span class="metadata-value selectable" v-else>
                {{ getMetadataFieldValue(descriptor, episode) }}
              </span>
            </td>

            <validation-cell
              :ref="`validation-${i}-${j}`"
              :key="columnId + '-' + episode.id"
              :class="{
                'validation-cell': !hiddenColumns[columnId],
                'hidden-validation-cell': hiddenColumns[columnId],
                'datatable-row-header': true
              }"
              :column="taskTypeMap.get(columnId)"
              :columnY="j"
              :entity="episode"
              :is-assignees="isShowAssignations"
              :is-static="true"
              :left="
                offsets['validation-' + j]
                  ? `${offsets['validation-' + j]}px`
                  : '0'
              "
              :minimized="hiddenColumns[columnId]"
              :rowX="i"
              :selected="isSelected(i, j)"
              :sticked="true"
              :task-test="taskMap.get(episode.validations.get(columnId))"
              @select="infos => onTaskSelected(infos, true)"
              @unselect="infos => onTaskUnselected(infos, true)"
              v-for="(columnId, j) in stickedDisplayedValidationColumns"
              v-if="!isLoading"
            />

            <description-cell
              class="description"
              :entry="episode"
              :editable="isCurrentUserManager"
              @description-changed="
                value => onDescriptionChanged(episode, value)
              "
              v-if="!isCurrentUserClient && isShowInfos && isEpisodeDescription"
            />

            <!-- other Metadata cells -->
            <td
              class="metadata-descriptor"
              :title="episode.data ? episode.data[descriptor.field_name] : ''"
              :key="episode.id + '-' + descriptor.id"
              v-for="(descriptor, j) in nonStickedVisibleMetadataDescriptors"
              v-if="isShowInfos"
            >
              <input
                class="input-editor"
                @input="
                  event => onMetadataFieldChanged(episode, descriptor, event)
                "
                @keyup.ctrl="event => onInputKeyUp(event, i, j)"
                :value="getMetadataFieldValue(descriptor, episode)"
                v-if="
                  descriptor.choices.length === 0 &&
                  (isCurrentUserManager ||
                    isSupervisorInDepartments(descriptor.departments))
                "
              />
              <span
                class="select"
                v-else-if="
                  isCurrentUserManager ||
                  isSupervisorInDepartments(descriptor.departments)
                "
              >
                <select
                  class="select-input"
                  @keyup.ctrl="event => onInputKeyUp(event, i, j)"
                  @change="
                    event => onMetadataFieldChanged(episode, descriptor, event)
                  "
                >
                  <option
                    v-for="(option, i) in getDescriptorChoicesOptions(
                      descriptor
                    )"
                    :key="`${episode.id}-${descriptor.id}-${i}-${option.label}-${option.value}`"
                    :value="option.value"
                    :selected="
                      getMetadataFieldValue(descriptor, episode) ===
                      option.value
                    "
                  >
                    {{ option.label }}
                  </option>
                </select>
              </span>
              <span class="metadata-value selectable" v-else>
                {{ getMetadataFieldValue(descriptor, episode) }}
              </span>
            </td>

            <td
              class="time-spent selectable"
              v-if="
                !isCurrentUserClient &&
                isShowInfos &&
                isEpisodeTime &&
                metadataDisplayHeaders.timeSpent
              "
            >
              {{ formatDuration(episode.timeSpent) }}
            </td>

            <td
              class="estimation selectable"
              v-if="
                !isCurrentUserClient &&
                isShowInfos &&
                isEpisodeEstimation &&
                metadataDisplayHeaders.estimation
              "
            >
              {{ formatDuration(episode.estimation) }}
            </td>

            <td
              scope="col"
              class="status metadata-descriptor"
              ref="th-status"
              v-if="isShowInfos && metadataDisplayHeaders.status"
            >
              <span class="select">
                <select
                  class="select-input"
                  @change="
                    event => onEpisodeStatusChanged(episode, event.target.value)
                  "
                >
                  <option
                    v-for="option in episodeStatusOptions"
                    :key="`${episode.id}-status-option-${option.value}`"
                    :value="option.value"
                    :selected="(episode.status || 'running') === option.value"
                  >
                    {{ $t('episodes.status.' + option.label) }}
                  </option>
                </select>
              </span>
            </td>

            <validation-cell
              :ref="`validation-${i}-${
                j + stickedDisplayedValidationColumns.length
              }`"
              :class="{
                'validation-cell': !hiddenColumns[columnId],
                'hidden-validation-cell': hiddenColumns[columnId]
              }"
              :key="`${columnId}-${episode.id}`"
              :column="taskTypeMap.get(columnId)"
              :entity="episode"
              :task-test="
                taskMap.get(
                  episode.validations ? episode.validations.get(columnId) : null
                )
              "
              :minimized="hiddenColumns[columnId]"
              :selected="
                isSelected(i, j + stickedDisplayedValidationColumns.length)
              "
              :rowX="i"
              :columnY="j"
              :is-assignees="isShowAssignations"
              @select="onTaskSelected"
              @unselect="onTaskUnselected"
              v-for="(columnId, j) in nonStickedDisplayedValidationColumns"
              v-if="!isLoading"
            />
            <row-actions-cell
              :entry="episode"
              @delete-clicked="$emit('delete-clicked', episode)"
              @edit-clicked="$emit('edit-clicked', episode)"
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
      v-if="isEmptyList && isCurrentUserClient && !isLoading"
    >
      <p class="info">
        <img src="../../assets/illustrations/empty_shot.png" />
      </p>
      <p class="info">{{ $t('episodes.empty_list_client') }}</p>
    </div>

    <p class="has-text-centered nb-episodes" v-if="!isEmptyList && !isLoading">
      {{ displayedEpisodesLength }}
      {{ $tc('episodes.number', displayedEpisodesLength) }}
      <span
        v-if="displayedEpisodesTimeSpent > 0 && displayedEpisodesEstimation > 0"
      >
        ({{ formatDuration(displayedEpisodesTimeSpent) }}
        {{ $tc('main.days_spent', displayedEpisodesTimeSpent) }},
        {{ formatDuration(displayedEpisodesEstimation) }}
        {{ $tc('main.man_days', displayedEpisodesEstimation) }})
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

import ButtonSimple from '@/components/widgets/ButtonSimple'
import DescriptionCell from '@/components/cells/DescriptionCell'
import EntityThumbnail from '@/components/widgets/EntityThumbnail'
import MetadataHeader from '@/components/cells/MetadataHeader'
import RowActionsCell from '@/components/cells/RowActionsCell'
import TableMetadataHeaderMenu from '@/components/widgets/TableMetadataHeaderMenu'
import TableMetadataSelectorMenu from '@/components/widgets/TableMetadataSelectorMenu'
import TableHeaderMenu from '@/components/widgets/TableHeaderMenu'
import TableInfo from '@/components/widgets/TableInfo'
import ValidationCell from '@/components/cells/ValidationCell'
import ValidationHeader from '@/components/cells/ValidationHeader'

export default {
  name: 'episode-list',
  mixins: [
    descriptorMixin,
    domMixin,
    formatListMixin,
    entityListMixin,
    selectionListMixin
  ],

  props: {
    displayedEpisodes: {
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
      type: 'episode',
      hiddenColumns: {},
      lastHeaderMenuDisplayed: null,
      lastMetadaDataHeaderMenuDisplayed: null,
      lastHeaderMenuDisplayedIndexInGrid: null,
      lastSelectedEpisode: null,
      lastSelection: null,
      metadataDisplayHeaders: {
        estimation: true,
        timeSpent: true,
        status: true
      },
      offsets: {},
      stickedColumns: {},
      episodeStatusOptions: [
        { label: 'canceled', value: 'canceled' },
        { label: 'complete', value: 'complete' },
        { label: 'running', value: 'running' },
        { label: 'standby', value: 'standby' }
      ]
    }
  },

  components: {
    ButtonSimple,
    DescriptionCell,
    EntityThumbnail,
    MetadataHeader,
    RowActionsCell,
    TableHeaderMenu,
    TableMetadataHeaderMenu,
    TableMetadataSelectorMenu,
    TableInfo,
    ValidationCell,
    ValidationHeader
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'episodeMap',
      'episodeFilledColumns',
      'episodeMetadataDescriptors',
      'episodes',
      'episodeSearchText',
      'episodeSelectionGrid',
      'currentEpisode',
      'displayedEpisodesEstimation',
      'displayedEpisodesLength',
      'displayedEpisodesTimeSpent',
      'isBigThumbnails',
      'isCurrentUserAdmin',
      'isCurrentUserManager',
      'isCurrentUserSupervisor',
      'isCurrentUserClient',
      'isSingleEpisode',
      'isEpisodeDescription',
      'isEpisodeEstimation',
      'isEpisodeTime',
      'isShowAssignations',
      'isShowInfos',
      'nbSelectedTasks',
      'taskMap',
      'taskTypeMap',
      'user'
    ]),

    isEmptyList() {
      return (
        this.displayedEpisodes.length &&
        this.displayedEpisodes[0].length === 0 &&
        !this.isLoading &&
        !this.isError &&
        (!this.episodeSearchText || this.episodeSearchText.length === 0)
      )
    },

    isListVisible() {
      return (
        !this.isLoading && !this.isError && this.displayedEpisodesLength > 0
      )
    },

    visibleColumns() {
      let count = 2
      count +=
        !this.isCurrentUserClient &&
        this.isShowInfos &&
        this.isEpisodeDescription
          ? 1
          : 0
      count += this.visibleMetadataDescriptors.length
      count +=
        !this.isCurrentUserClient &&
        this.isShowInfos &&
        this.isEpisodeTime &&
        this.metadataDisplayHeaders.timeSpent
          ? 1
          : 0
      count +=
        !this.isCurrentUserClient &&
        this.isShowInfos &&
        this.isEpisodeEstimation &&
        this.metadataDisplayHeaders.estimation
          ? 1
          : 0
      count += this.displayedValidationColumns.length
      return count
    },

    displayedValidationColumns() {
      return this.validationColumns.filter(columnId => {
        return (
          this.episodeFilledColumns[columnId] &&
          (!this.hiddenColumns[columnId] || this.isShowInfos)
        )
      })
    },

    metadataDescriptors() {
      return this.episodeMetadataDescriptors
    },

    localStorageStickKey() {
      return `stick-episodes-${this.currentProduction.id}`
    }
  },

  methods: {
    ...mapActions(['setEpisodeSelection']),

    isSelected(lineIndex, columnIndex) {
      return (
        this.episodeSelectionGrid[lineIndex] &&
        this.episodeSelectionGrid[lineIndex][columnIndex]
      )
    },

    episodePath(episodeId) {
      return this.getPath('episode', episodeId)
    },

    getPath(section, episodeId) {
      const route = {
        name: section,
        params: {
          production_id: this.currentProduction.id
        }
      }
      if (episodeId) {
        route.params.episode_id = episodeId
      }
      return route
    },

    onEpisodeStatusChanged(episode, status) {
      this.$emit('field-changed', {
        entry: episode,
        fieldName: 'status',
        value: status
      })
    }
  },

  watch: {
    displayedEpisodes() {
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
  }
}
</script>

<style lang="scss" scoped>
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

.name a {
  color: inherit;
}

.name.episode-name {
  min-width: 110px;
  width: 110px;
}

.description {
  min-width: 200px;
  max-width: 200px;
  width: 200px;
}

.status {
  min-width: 120px;
  max-width: 120px;
  width: 120px;
}

.validation-cell {
  min-width: 150px;
  max-width: 150px;
  width: 150px;
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
</style>
