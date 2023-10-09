<template>
  <div class="columns fixed-page">
    <div class="column main-column">
      <div class="episodes page">
        <div class="episode-list-header page-header">
          <div class="flexrow">
            <search-field
              ref="episode-search-field"
              :can-save="true"
              :active="isSearchActive"
              @change="onSearchChange"
              @save="saveSearchQuery"
              placeholder="ex: e01 episode=wip"
            />
            <button-simple
              class="flexrow-item"
              :title="$t('entities.build_filter.title')"
              icon="funnel"
              @click="() => (modals.isBuildFilterDisplayed = true)"
            />
            <div class="filler"></div>
            <div class="flexrow flexrow-item" v-if="!isCurrentUserClient">
              <show-assignations-button class="flexrow-item" />
              <show-infos-button class="flexrow-item" />
              <big-thumbnails-button class="flexrow-item" />
            </div>
            <div class="flexrow" v-if="isCurrentUserManager">
              <button-simple
                class="flexrow-item"
                :text="$t('episodes.new_episode')"
                icon="plus"
                @click="showNewModal"
              />
            </div>
          </div>

          <div class="query-list mt1">
            <search-query-list
              :queries="episodeSearchQueries"
              type="episode"
              @change-search="changeSearch"
              @remove-search="removeSearchQuery"
              v-if="!isEpisodesLoading && !initialLoading"
            />
          </div>
        </div>

        <sorting-info
          :label="$t('main.sorted_by')"
          :sorting="episodeSorting"
          @clear-sorting="onChangeSortClicked(null)"
          v-if="episodeSorting && episodeSorting.length > 0"
        />

        <episode-list
          ref="episode-list"
          :displayed-episodes="displayedEpisodes"
          :is-loading="isEpisodesLoading || initialLoading"
          :is-error="isEpisodesLoadingError"
          :validation-columns="episodeValidationColumns"
          :department-filter="departmentFilter"
          @add-metadata="onAddMetadataClicked"
          @change-sort="onChangeSortClicked"
          @create-tasks="showCreateTasksModal"
          @delete-all-tasks="onDeleteAllTasksClicked"
          @delete-clicked="onDeleteClicked"
          @delete-metadata="onDeleteMetadataClicked"
          @edit-clicked="onEditClicked"
          @edit-metadata="onEditMetadataClicked"
          @field-changed="onFieldChanged"
          @metadata-changed="onMetadataChanged"
          @scroll="saveScrollPosition"
          @keep-task-panel-open="onKeepTaskPanelOpenChanged"
        />
      </div>
    </div>

    <div
      id="side-column"
      class="column side-column"
      v-show="isTaskSidePanelOpen"
    >
      <task-info
        :task="selectedTasks.values().next().value"
        entity-type="Episode"
        with-actions
      />
    </div>

    <delete-modal
      ref="delete-episode-modal"
      :active="modals.isDeleteDisplayed"
      :is-loading="loading.del"
      :is-error="errors.del"
      :text="deleteText()"
      :error-text="$t('episodes.delete_error')"
      @cancel="modals.isDeleteDisplayed = false"
      @confirm="confirmDeleteEpisode"
    />

    <delete-modal
      ref="delete-metadata-modal"
      :active="modals.isDeleteMetadataDisplayed"
      :is-loading="loading.deleteMetadata"
      :is-error="errors.deleteMetadata"
      :text="$t('productions.metadata.delete_text')"
      :error-text="$t('productions.metadata.delete_error')"
      @cancel="modals.isDeleteMetadataDisplayed = false"
      @confirm="confirmDeleteMetadata"
    />

    <hard-delete-modal
      ref="delete-all-tasks-modal"
      :active="modals.isDeleteAllTasksDisplayed"
      :is-loading="loading.deleteAllTasks"
      :is-error="errors.deleteAllTasks"
      :text="deleteAllTasksText()"
      :error-text="$t('tasks.delete_all_error')"
      :lock-text="deleteAllTasksLockText"
      :selection-option="true"
      @cancel="modals.isDeleteAllTasksDisplayed = false"
      @confirm="confirmDeleteAllTasks"
    />

    <create-tasks-modal
      :active="modals.isCreateTasksDisplayed"
      :is-loading="loading.creatingTasks"
      :is-loading-stay="loading.creatingTasksStay"
      :is-error="errors.creatingTasks"
      :title="$t('tasks.create_tasks_episode')"
      :text="$t('tasks.create_tasks_episode_explaination')"
      :error-text="$t('tasks.create_tasks_episode_failed')"
      @cancel="hideCreateTasksModal"
      @confirm="confirmCreateTasks"
      @confirm-and-stay="confirmCreateTasksAndStay"
    />

    <add-metadata-modal
      :active="modals.isAddMetadataDisplayed"
      :is-loading="loading.addMetadata"
      :is-loading-stay="loading.addMetadata"
      :is-error="errors.addMetadata"
      :descriptor-to-edit="descriptorToEdit"
      entity-type="Episode"
      @cancel="closeMetadataModal"
      @confirm="confirmAddMetadata"
    />

    <add-thumbnails-modal
      ref="add-thumbnails-modal"
      entity-type="Episode"
      parent="episodes"
      :active="modals.isAddThumbnailsDisplayed"
      :is-loading="loading.addThumbnails"
      :is-error="errors.addThumbnails"
      @cancel="hideAddThumbnailsModal"
      @confirm="confirmAddThumbnails"
      v-if="false"
    />

    <build-filter-modal
      ref="build-filter-modal"
      :active="modals.isBuildFilterDisplayed"
      entity-type="episode"
      @cancel="modals.isBuildFilterDisplayed = false"
      @confirm="confirmBuildFilter"
    />

    <edit-episode-modal
      :active="modals.isNewDisplayed"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :episode-to-edit="episodeToEdit"
      @cancel="modals.isNewDisplayed = false"
      @confirm="confirmEditEpisode"
    />

    <hard-delete-modal
      :active="modals.isDeleteDisplayed"
      :is-loading="loading.del"
      :is-error="errors.del"
      :text="deleteText()"
      :error-text="$t('episodes.delete_error')"
      :lock-text="episodeToDelete ? episodeToDelete.name : ''"
      @cancel="modals.isDeleteDisplayed = false"
      @confirm="confirmDeleteEpisode"
    />
  </div>
</template>

<script>
import moment from 'moment'
import { mapGetters, mapActions } from 'vuex'
import csv from '@/lib/csv'
import { sortByName } from '@/lib/sorting'
import stringHelpers from '@/lib/string'

import { searchMixin } from '@/components/mixins/search'
import { entitiesMixin } from '@/components/mixins/entities'

import AddMetadataModal from '@/components/modals/AddMetadataModal'
import AddThumbnailsModal from '@/components/modals/AddThumbnailsModal'
import BigThumbnailsButton from '@/components/widgets/BigThumbnailsButton'
import BuildFilterModal from '@/components/modals/BuildFilterModal'
import ButtonSimple from '@/components/widgets/ButtonSimple'
import CreateTasksModal from '@/components/modals/CreateTasksModal'
import DeleteModal from '@/components/modals/DeleteModal'
import EditEpisodeModal from '@/components/modals/EditEpisodeModal'
import EpisodeList from '@/components/lists/EpisodeList.vue'
import HardDeleteModal from '@/components/modals/HardDeleteModal'
import SearchField from '@/components/widgets/SearchField'
import SearchQueryList from '@/components/widgets/SearchQueryList'
import SortingInfo from '@/components/widgets/SortingInfo'
import ShowAssignationsButton from '@/components/widgets/ShowAssignationsButton'
import ShowInfosButton from '@/components/widgets/ShowInfosButton'
import TaskInfo from '@/components/sides/TaskInfo.vue'

export default {
  name: 'episodes',
  mixins: [searchMixin, entitiesMixin],

  components: {
    AddMetadataModal,
    AddThumbnailsModal,
    BigThumbnailsButton,
    BuildFilterModal,
    ButtonSimple,
    CreateTasksModal,
    DeleteModal,
    EditEpisodeModal,
    EpisodeList,
    HardDeleteModal,
    SearchField,
    SearchQueryList,
    SortingInfo,
    ShowAssignationsButton,
    ShowInfosButton,
    TaskInfo
  },

  data() {
    return {
      type: 'episode',
      deleteAllTasksLockText: null,
      descriptorToEdit: {},
      departmentFilter: [],
      episodeToDelete: null,
      episodeToEdit: null,
      formData: null,
      genericColumns: [
        'Metadata column name (text value)',
        'Task type name (task status name value)',
        'Task type name + comment (text value)'
      ],
      historyEdit: {},
      initialLoading: true,
      isSearchActive: false,
      optionalColumns: ['Description'],
      pageName: 'Episodes',
      parsedCSV: [],
      selectedDepartment: 'ALL',
      taskTypeForTaskDeletion: null,
      modals: {
        isAddMetadataDisplayed: false,
        isAddThumbnailsDisplayed: false,
        isBuildFilterDisplayed: false,
        isCreateTasksDisplayed: false,
        isDeleteDisplayed: false,
        isDeleteMetadataDisplayed: false,
        isDeleteAllTasksDisplayed: false,
        isImportRenderDisplayed: false,
        isImportDisplayed: false,
        isNewDisplayed: false
      },
      loading: {
        addMetadata: false,
        addThumbnails: false,
        creatingTasks: false,
        creatingTasksStay: false,
        del: false,
        deleteAllTasks: false,
        deleteMetadata: false,
        edit: false,
        episode: false,
        importing: false,
        savingSearch: false,
        stay: false
      },
      errors: {
        addMetadata: false,
        creatingTasks: false,
        deleteAllTasks: false,
        deleteMetadata: false,
        edit: false,
        importing: false,
        importingError: null
      }
    }
  },

  beforeDestroy() {
    this.clearSelectedEpisodes()
  },

  created() {
    this.setLastProductionScreen('episodes')
  },

  mounted() {
    let searchQuery = ''
    if (this.episodeSearchText && this.episodeSearchText.length > 0) {
      this.searchField.setValue(this.episodeSearchText)
    }
    if (this.$route.query.search && this.$route.query.search.length > 0) {
      searchQuery = `${this.$route.query.search}`
    }
    if (searchQuery === 'undefined') searchQuery = ''
    this.$refs['episode-list'].setScrollPosition(this.episodeListScrollPosition)
    this.onSearchChange()
    this.$refs['episode-list'].setScrollPosition(this.episodeListScrollPosition)
    if (!this.isCurrentUserManager && this.user.departments.length > 0) {
      this.selectedDepartment = 'MY_DEPARTMENTS'
      this.departmentFilter = this.user.departments
    } else {
      this.departmentFilter = []
    }

    const finalize = () => {
      this.initialLoading = false
      if (this.$refs['episode-list']) {
        this.$refs['episode-search-field'].setValue(searchQuery)
        this.onSearchChange()
        this.$refs['episode-list'].setScrollPosition(
          this.episodeListScrollPosition
        )
      }
    }

    if (
      this.episodeMap.size < 1 ||
      this.episodeValidationColumns.length === 0 ||
      this.episodeMap.values().next().project_id !== this.currentProduction.id
    ) {
      this.loadEpisodesWithTasks()
        .then(() => {
          this.initialLoading = false
        })
        .catch(console.error)
    } else {
      if (!this.isEpisodesLoading) this.initialLoading = false
      finalize()
    }
  },

  computed: {
    ...mapGetters([
      'currentEpisode',
      'currentProduction',
      'departmentMap',
      'displayedEpisodes',
      'departments',
      'episodeMap',
      'episodes',
      'episodeMap',
      'episodeFilledColumns',
      'episodesCsvFormData',
      'episodeSearchText',
      'episodeValidationColumns',
      'episodeListScrollPosition',
      'episodeSorting',
      'episodeSearchQueries',
      'isCurrentUserClient',
      'isCurrentUserManager',
      'isEpisodeDescription',
      'isEpisodeEstimation',
      'isEpisodeTime',
      'isEpisodesLoading',
      'isEpisodesLoadingError',
      'isShowAssignations',
      'isTVShow',
      'openProductions',
      'productionEpisodeTaskTypes',
      'selectedTasks',
      'taskTypeMap',
      'user'
    ]),

    renderColumns() {
      const collection = [...this.dataMatchers, ...this.optionalColumns]

      this.productionEpisodeTaskTypes.forEach(item => {
        collection.push(item.name)
        collection.push(`${item.name} comment`)
      })
      return collection
    },

    filteredEpisodes() {
      const episodes = {}
      this.displayedEpisodes.forEach(episode => {
        const episodeKey = episode.name
        episodes[episodeKey] = true
      })
      return episodes
    },

    metadataDescriptors() {
      return this.episodeMetadataDescriptors
    }
  },

  methods: {
    ...mapActions([
      'addMetadataDescriptor',
      'createTasks',
      'changeEpisodeSort',
      'clearSelectedEpisodes',
      'commentTaskWithPreview',
      'deleteAllTasks',
      'deleteEpisode',
      'deleteMetadataDescriptor',
      'editEpisode',
      'getEpisodesCsvLines',
      'hideAssignations',
      'loadEpisodesWithTasks',
      'newEpisode',
      'removeEpisodeSearch',
      'saveEpisodeSearch',
      'setLastProductionScreen',
      'setPreview',
      'setEpisodeSearch',
      'showAssignations',
      'uploadEpisodeFile'
    ]),

    confirmAddMetadata(form) {
      this.loading.addMetadata = true
      form.entity_type = 'Episode'
      this.addMetadataDescriptor(form)
        .then(() => {
          this.loading.addMetadata = false
          this.modals.isAddMetadataDisplayed = false
        })
        .catch(err => {
          console.error(err)
          this.loading.addMetadata = false
          this.errors.addMetadata = true
        })
    },

    showNewModal() {
      this.episodeToEdit = {}
      this.modals.isNewDisplayed = true
    },

    confirmDeleteEpisode() {
      this.loading.del = true
      this.errors.del = false
      this.deleteEpisode(this.episodeToDelete)
        .then(() => {
          this.loading.del = false
          this.modals.isDeleteDisplayed = false
        })
        .catch(err => {
          console.error(err)
          this.loading.del = false
          this.errors.del = true
        })
    },

    runTasksCreation(form, selectionOnly) {
      this.errors.creatingTasks = false
      return this.createTasks({
        type: 'episodes',
        task_type_id: form.task_type_id,
        project_id: this.currentProduction.id,
        selectionOnly
      })
    },

    reset() {
      this.initialLoading = false
      this.loadEpisodesWithTasks(err => {
        if (err) console.error(err)
        this.initialLoading = false
      })
    },

    resetEditModal() {
      const form = { name: '' }
      if (this.openProductions.length > 0) {
        form.production_id = this.openProductions[0].id
      }
      this.episodeToEdit = form
    },

    applySearch(searchQuery) {
      this.setEpisodeSearch(searchQuery)
      this.setSearchInUrl()
      this.isSearchActive = true
    },

    saveSearchQuery(searchQuery) {
      if (this.loading.savingSearch) {
        return
      }
      this.loading.savingSearch = true
      this.saveEpisodeSearch(searchQuery)
        .catch(console.error)
        .finally(() => {
          this.loading.savingSearch = false
        })
    },

    removeSearchQuery(searchQuery) {
      this.removeEpisodeSearch(searchQuery).catch(console.error)
    },

    onExportClick() {
      this.getEpisodesCsvLines().then(episodeLines => {
        const nameData = [
          moment().format('YYYY-MM-DD'),
          'kitsu',
          this.currentProduction.name,
          this.$t('episodes.title')
        ]
        const name = stringHelpers.slugify(nameData.join('_'))
        const headers = [
          this.$t('episodes.fields.name'),
          this.$t('episodes.fields.description')
        ]
        if (this.currentEpisode) {
          headers.splice(0, 0, 'Episode')
        }
        sortByName([...this.currentProduction.descriptors])
          .filter(d => d.entity_type === 'Episode')
          .forEach(descriptor => {
            headers.push(descriptor.name)
          })
        if (this.isEpisodeTime) {
          headers.push(this.$t('episodes.fields.time_spent'))
        }
        if (this.isEpisodeEstimation) {
          headers.push(this.$t('main.estimation_short'))
        }
        this.episodeValidationColumns.forEach(taskTypeId => {
          headers.push(this.taskTypeMap.get(taskTypeId).name)
          headers.push('Assignations')
        })
        csv.buildCsvFile(name, [headers].concat(episodeLines))
      })
    },

    onFieldChanged({ entry, fieldName, value }) {
      const data = {
        id: entry.id,
        description: entry.description
      }
      data[fieldName] = value
      this.editEpisode(data)
    },

    onMetadataChanged({ entry, descriptor, value }) {
      const metadata = {}
      metadata[descriptor.field_name] = value
      const data = {
        id: entry.id,
        data: metadata
      }
      this.editEpisode(data)
    },

    onEditClicked(episode) {
      this.episodeToEdit = episode
      this.modals.isNewDisplayed = true
    },

    onDeleteClicked(episode) {
      this.episodeToDelete = episode
      this.modals.isDeleteDisplayed = true
    },

    confirmEditEpisode(form) {
      this.loading.edit = true
      this.errors.edit = false

      if (form.id) {
        this.editEpisode(form)
          .then(() => {
            this.loading.edit = false
            this.modals.isNewDisplayed = false
          })
          .catch(err => {
            console.error(err)
            this.loading.edit = false
            this.errors.edit = true
          })
      } else {
        form.project_id = this.currentProduction.id
        this.newEpisode(form)
          .then(() => {
            this.loading.edit = false
            this.modals.isNewDisplayed = false
          })
          .catch(() => {
            this.loading.edit = false
            this.errors.edit = true
          })
      }
    },

    deleteText() {
      const episode = this.episodeToDelete
      if (episode) {
        return this.$t('episodes.delete_text', { name: episode.name })
      }
      return ''
    }
  },

  watch: {
    $route() {
      if (!this.$route.query) return
      const search = this.$route.query.search
      const actualSearch = this.$refs['episode-search-field'].getValue()
      if (search !== actualSearch) {
        this.searchField.setValue(search)
        this.applySearch(search)
      }
    },

    currentProduction() {
      this.$refs['episode-search-field'].setValue('')
      this.$store.commit('SET_EDIT_LIST_SCROLL_POSITION', 0)
      this.initialLoading = false
      this.reset()
    },

    isEpisodesLoading() {
      if (!this.isEpisodesLoading) {
        let searchQuery = ''
        if (this.$route.query.search && this.$route.query.search.length > 0) {
          searchQuery = `${this.$route.query.search}`
        }
        this.initialLoading = false
        this.$refs['episode-search-field'].setValue(searchQuery)
        this.$nextTick(() => {
          this.applySearch(searchQuery)
        })
        if (this.$refs['episode-list']) {
          this.$refs['episode-list'].setScrollPosition(
            this.episodeListScrollPosition
          )
        }
      }
    }
  },

  metaInfo() {
    return {
      title: `${this.currentProduction.name} ${this.$t(
        'episodes.title'
      )} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.data-list {
  margin-top: 0;
}

.page-header {
  margin-bottom: 1em;
}

.flexcolumn {
  align-items: flex-start;
}

.episodes {
  display: flex;
  flex-direction: column;
}

.columns {
  display: flex;
  flex-direction: row;
  padding: 0;
}

.column {
  overflow-y: auto;
  padding: 0;
}
</style>
