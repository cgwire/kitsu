<template>
  <div class="columns fixed-page">
    <action-panel />

    <div class="column main-column">
      <div class="sequences page">
        <div class="sequence-list-header page-header">
          <div class="flexrow">
            <search-field
              ref="sequence-search-field"
              :can-save="true"
              :active="isSearchActive"
              @change="onSearchChange"
              @enter="saveSearchQuery"
              @save="saveSearchQuery"
              placeholder="ex: e01 sequence=wip"
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
                :text="$t('sequences.new_sequence')"
                icon="plus"
                @click="showNewModal"
              />
            </div>
          </div>

          <div class="query-list mt1">
            <search-query-list
              :queries="sequenceSearchQueries"
              @change-search="changeSearch"
              @remove-search="removeSearchQuery"
              v-if="!isSequencesLoading && !initialLoading"
            />
          </div>
        </div>

        <sorting-info
          :label="$t('main.sorted_by')"
          :sorting="sequenceSorting"
          @clear-sorting="onChangeSortClicked(null)"
          v-if="sequenceSorting && sequenceSorting.length > 0"
        />

        <sequence-list
          ref="sequence-list"
          :displayed-sequences="displayedSequences"
          :is-loading="isSequencesLoading || initialLoading"
          :is-error="isSequencesLoadingError"
          :validation-columns="sequenceValidationColumns"
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
      v-show="nbSelectedTasks === 1"
    >
      <task-info :task="selectedTasks.values().next().value" />
    </div>

    <delete-modal
      ref="delete-sequence-modal"
      :active="modals.isDeleteDisplayed"
      :is-loading="loading.del"
      :is-error="errors.del"
      :text="deleteText()"
      :error-text="$t('sequences.delete_error')"
      @cancel="modals.isDeleteDisplayed = false"
      @confirm="confirmDeleteSequence"
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
      :title="$t('tasks.create_tasks_sequence')"
      :text="$t('tasks.create_tasks_sequence_explaination')"
      :error-text="$t('tasks.create_tasks_sequence_failed')"
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
      entity-type="Sequence"
      @cancel="closeMetadataModal"
      @confirm="confirmAddMetadata"
    />

    <add-thumbnails-modal
      ref="add-thumbnails-modal"
      parent="sequences"
      :active="modals.isAddThumbnailsDisplayed"
      :is-loading="loading.addThumbnails"
      :is-error="errors.addThumbnails"
      @cancel="hideAddThumbnailsModal"
      @confirm="confirmAddThumbnails"
    />

    <build-filter-modal
      ref="build-filter-modal"
      :active="modals.isBuildFilterDisplayed"
      entity-type="sequence"
      @cancel="modals.isBuildFilterDisplayed = false"
      @confirm="confirmBuildFilter"
    />

    <edit-sequence-modal
      :active="modals.isNewDisplayed"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :sequence-to-edit="sequenceToEdit"
      @cancel="modals.isNewDisplayed = false"
      @confirm="confirmEditSequence"
    />

    <hard-delete-modal
      :active="modals.isDeleteDisplayed"
      :is-loading="loading.del"
      :is-error="errors.del"
      :text="deleteText()"
      :error-text="$t('sequences.delete_error')"
      :lock-text="sequenceToDelete ? sequenceToDelete.name : ''"
      @cancel="modals.isDeleteDisplayed = false"
      @confirm="confirmDeleteSequence"
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
import ActionPanel from '@/components/tops/ActionPanel'
import BigThumbnailsButton from '@/components/widgets/BigThumbnailsButton'
import BuildFilterModal from '@/components/modals/BuildFilterModal'
import ButtonSimple from '@/components/widgets/ButtonSimple'
import CreateTasksModal from '@/components/modals/CreateTasksModal'
import DeleteModal from '@/components/modals/DeleteModal'
import EditSequenceModal from '@/components/modals/EditSequenceModal'
import SequenceList from '@/components/lists/SequenceList.vue'
import HardDeleteModal from '@/components/modals/HardDeleteModal'
import SearchField from '@/components/widgets/SearchField'
import SearchQueryList from '@/components/widgets/SearchQueryList'
import SortingInfo from '@/components/widgets/SortingInfo'
import ShowAssignationsButton from '@/components/widgets/ShowAssignationsButton'
import ShowInfosButton from '@/components/widgets/ShowInfosButton'
import TaskInfo from '@/components/sides/TaskInfo.vue'

export default {
  name: 'sequences',
  mixins: [searchMixin, entitiesMixin],

  components: {
    ActionPanel,
    AddMetadataModal,
    AddThumbnailsModal,
    BigThumbnailsButton,
    BuildFilterModal,
    ButtonSimple,
    CreateTasksModal,
    DeleteModal,
    EditSequenceModal,
    SequenceList,
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
      type: 'sequence',
      deleteAllTasksLockText: null,
      descriptorToEdit: {},
      departmentFilter: [],
      sequenceToDelete: null,
      sequenceToEdit: null,
      formData: null,
      genericColumns: [
        'metadata_column_name => text value',
        'task_type_name => task_status_name',
        'task_type_name comment => comment text'
      ],
      historyEdit: {},
      initialLoading: true,
      isSearchActive: false,
      optionalColumns: ['Description'],
      pageName: 'Sequences',
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
        deleteAllTasks: false,
        deleteMetadata: false,
        sequence: false,
        del: false,
        importing: false,
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
    this.clearSelectedSequences()
  },

  created() {
    this.setLastProductionScreen('sequences')
  },

  mounted() {
    let searchQuery = ''
    if (this.sequenceSearchText && this.sequenceSearchText.length > 0) {
      this.searchField.setValue(this.sequenceSearchText)
    }
    if (this.$route.query.search && this.$route.query.search.length > 0) {
      searchQuery = '' + this.$route.query.search
    }
    if (searchQuery === 'undefined') searchQuery = ''
    this.$refs['sequence-list'].setScrollPosition(
      this.sequenceListScrollPosition
    )
    this.onSearchChange()
    this.$refs['sequence-list'].setScrollPosition(
      this.sequenceListScrollPosition
    )
    if (!this.isCurrentUserManager && this.user.departments.length > 0) {
      this.selectedDepartment = 'MY_DEPARTMENTS'
      this.departmentFilter = this.user.departments
    } else {
      this.departmentFilter = []
    }

    const finalize = () => {
      this.initialLoading = false
      if (this.$refs['sequence-list']) {
        this.$refs['sequence-search-field'].setValue(searchQuery)
        this.onSearchChange()
        this.$refs['sequence-list'].setScrollPosition(
          this.sequenceListScrollPosition
        )
      }
    }

    if (
      this.sequenceMap.size < 1 ||
      this.sequenceValidationColumns.length === 0 ||
      this.sequenceMap.values().next().project_id !== this.currentProduction.id
    ) {
      this.loadSequencesWithTasks()
        .then(() => {
          this.initialLoading = false
        })
        .catch(console.error)
    } else {
      if (!this.isSequencesLoading) this.initialLoading = false
      finalize()
    }
  },

  computed: {
    ...mapGetters([
      'currentEpisode',
      'currentProduction',
      'displayedSequences',
      'deleteAllTasks',
      'departments',
      'sequenceMap',
      'sequences',
      'sequenceSearchQueries',
      'isCurrentUserClient',
      'isCurrentUserManager',
      'isSequenceDescription',
      'isSequenceEstimation',
      'isSequenceTime',
      'isSequencesLoading',
      'isSequencesLoadingError',
      'isShowAssignations',
      'isTVShow',
      'nbSelectedTasks',
      'openProductions',
      'selectedTasks',
      'sequenceMap',
      'sequenceFilledColumns',
      'sequencesCsvFormData',
      'sequenceSearchText',
      'sequenceValidationColumns',
      'sequenceListScrollPosition',
      'sequenceSorting',
      'taskTypeMap',
      'user',
      'departmentMap',
      'productionSequenceTaskTypes'
    ]),

    renderColumns() {
      var collection = [...this.dataMatchers, ...this.optionalColumns]

      this.productionSequenceTaskTypes.forEach(item => {
        collection.push(item.name)
        collection.push(item.name + ' comment')
      })
      return collection
    },

    filteredSequences() {
      const sequences = {}
      this.displayedSequences.forEach(sequence => {
        const sequenceKey = sequence.name
        sequences[sequenceKey] = true
      })
      return sequences
    },

    metadataDescriptors() {
      return this.sequenceMetadataDescriptors
    }
  },

  methods: {
    ...mapActions([
      'addMetadataDescriptor',
      'createTasks',
      'changeSequenceSort',
      'clearSelectedSequences',
      'commentTaskWithPreview',
      'deleteAllSequenceTasks',
      'deleteSequence',
      'deleteMetadataDescriptor',
      'editSequence',
      'getSequencesCsvLines',
      'hideAssignations',
      'loadSequencesWithTasks',
      'newSequence',
      'removeSequenceSearch',
      'saveSequenceSearch',
      'setLastProductionScreen',
      'setPreview',
      'setSequenceSearch',
      'showAssignations',
      'uploadSequenceFile'
    ]),

    confirmAddMetadata(form) {
      this.loading.addMetadata = true
      form.entity_type = 'Sequence'
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
      this.sequenceToEdit = {}
      this.modals.isNewDisplayed = true
    },

    confirmDeleteSequence() {
      this.loading.del = true
      this.errors.del = false
      this.deleteSequence(this.sequenceToDelete)
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
        type: 'sequences',
        task_type_id: form.task_type_id,
        project_id: this.currentProduction.id,
        selectionOnly
      })
    },

    reset() {
      this.initialLoading = false
      this.loadSequencesWithTasks(err => {
        if (err) console.error(err)
        this.initialLoading = false
      })
    },

    resetEditModal() {
      const form = { name: '' }
      if (this.openProductions.length > 0) {
        form.production_id = this.openProductions[0].id
      }
      this.sequenceToEdit = form
    },

    applySearch(searchQuery) {
      this.setSequenceSearch(searchQuery)
      this.setSearchInUrl()
      this.isSearchActive = true
    },

    saveSearchQuery(searchQuery) {
      this.saveSequenceSearch(searchQuery).catch(console.error)
    },

    removeSearchQuery(searchQuery) {
      this.removeSequenceSearch(searchQuery).catch(console.error)
    },

    onExportClick() {
      this.getSequencesCsvLines().then(sequenceLines => {
        const nameData = [
          moment().format('YYYY-MM-DD'),
          'kitsu',
          this.currentProduction.name,
          this.$t('sequences.title')
        ]
        const name = stringHelpers.slugify(nameData.join('_'))
        const headers = [
          this.$t('sequences.fields.name'),
          this.$t('sequences.fields.description')
        ]
        if (this.currentSequence) {
          headers.splice(0, 0, 'Sequence')
        }
        sortByName([...this.currentProduction.descriptors])
          .filter(d => d.entity_type === 'Sequence')
          .forEach(descriptor => {
            headers.push(descriptor.name)
          })
        if (this.isSequenceTime) {
          headers.push(this.$t('sequences.fields.time_spent'))
        }
        if (this.isSequenceEstimation) {
          headers.push(this.$t('main.estimation_short'))
        }
        this.sequenceValidationColumns.forEach(taskTypeId => {
          headers.push(this.taskTypeMap.get(taskTypeId).name)
          headers.push('Assignations')
        })
        csv.buildCsvFile(name, [headers].concat(sequenceLines))
      })
    },

    onFieldChanged({ entry, fieldName, value }) {
      const data = {
        id: entry.id,
        description: entry.description
      }
      data[fieldName] = value
      this.editSequence(data)
    },

    onMetadataChanged({ entry, descriptor, value }) {
      const metadata = {}
      metadata[descriptor.field_name] = value
      const data = {
        id: entry.id,
        data: metadata
      }
      this.editSequence(data)
    },

    onEditClicked(sequence) {
      this.sequenceToEdit = sequence
      this.modals.isNewDisplayed = true
    },

    onDeleteClicked(sequence) {
      this.sequenceToDelete = sequence
      this.modals.isDeleteDisplayed = true
    },

    confirmEditSequence(form) {
      this.loading.edit = true
      this.errors.edit = false
      if (form.id) {
        this.editSequence(form)
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
        if (this.currentEpisode) {
          form.episode_id = this.currentEpisode.id
        }
        this.newSequence(form)
          .then(() => {
            this.loading.edit = false
            this.modals.isNewDisplayed = false
          })
          .catch(err => {
            console.error(err)
            this.loading.edit = false
            this.errors.edit = true
          })
      }
    },

    deleteText() {
      const sequence = this.sequenceToDelete
      if (sequence) {
        return this.$t('sequences.delete_text', { name: sequence.name })
      } else {
        return ''
      }
    }
  },

  watch: {
    $route() {
      if (!this.$route.query) return
      const search = this.$route.query.search
      const actualSearch = this.$refs['sequence-search-field'].getValue()
      if (search !== actualSearch) {
        this.searchField.setValue(search)
        this.applySearch(search)
      }
    },

    currentProduction() {
      this.$refs['sequence-search-field'].setValue('')
      this.$store.commit('SET_SEQUENCE_LIST_SCROLL_POSITION', 0)
      this.initialLoading = false
      this.reset()
    },

    currentEpisode() {
      this.$refs['sequence-search-field'].setValue('')
      this.$store.commit('SET_SEQUENCE_LIST_SCROLL_POSITION', 0)
      this.initialLoading = false
      this.reset()
    },

    isSequencesLoading() {
      if (!this.isSequencesLoading) {
        let searchQuery = ''
        if (this.$route.query.search && this.$route.query.search.length > 0) {
          searchQuery = '' + this.$route.query.search
        }
        this.initialLoading = false
        this.$refs['sequence-search-field'].setValue(searchQuery)
        this.$nextTick(() => {
          this.applySearch(searchQuery)
        })
        if (this.$refs['sequence-list']) {
          this.$refs['sequence-list'].setScrollPosition(
            this.sequenceListScrollPosition
          )
        }
      }
    }
  },

  metaInfo() {
    return {
      title: `${this.currentProduction.name} ${this.$t(
        'sequences.title'
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

.sequences {
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

.main-column {
  border-right: 3px solid $light-grey;
}
</style>
