<template>
  <div class="columns fixed-page">
    <div class="column main-column">
      <div class="sequences page">
        <div class="sequence-list-header page-header">
          <div class="flexrow">
            <search-field
              ref="sequence-search-field"
              :can-save="true"
              @change="onSearchChange"
              @save="saveSearchQuery"
              placeholder="ex: e01 sequence=wip"
            />
            <button-simple
              class="flexrow-item"
              :title="$t('entities.build_filter.title')"
              icon="filter"
              @click="() => (modals.isBuildFilterDisplayed = true)"
            />
            <div class="filler"></div>
            <div class="flexrow flexrow-item" v-if="!isCurrentUserClient">
              <combobox-department
                class="combobox-department flexrow-item"
                :selectable-departments="selectableDepartments('Sequence')"
                :display-all-and-my-departments="true"
                rounded
                v-model="selectedDepartment"
                v-if="departments.length > 0"
              />
              <combobox-display-options
                class="flexrow-item"
                :type="type"
                v-model="displaySettings"
              />
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
              type="sequence"
              @remove-search="removeSearchQuery"
              v-if="!isSequencesLoading && !initialLoading"
            />
          </div>
        </div>

        <sorting-info
          :sorting="sequenceSorting"
          @clear-sorting="onChangeSortClicked(null)"
          v-if="sequenceSorting?.length"
        />
        <sequence-list
          ref="sequence-list"
          :contact-sheet-mode="contactSheetMode"
          :display-settings="displaySettings"
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
      v-show="isTaskSidePanelOpen"
    >
      <task-info
        :task="selectedTasks.values().next().value"
        entity-type="Sequence"
        with-actions
      />
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
      :is-error="errors.addMetadata"
      :descriptor-to-edit="descriptorToEdit"
      entity-type="Sequence"
      @cancel="closeMetadataModal"
      @confirm="confirmAddMetadata"
    />

    <add-thumbnails-modal
      ref="add-thumbnails-modal"
      entity-type="Sequence"
      parent="sequences"
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

import AddMetadataModal from '@/components/modals/AddMetadataModal.vue'
import AddThumbnailsModal from '@/components/modals/AddThumbnailsModal.vue'
import BuildFilterModal from '@/components/modals/BuildFilterModal.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import ComboboxDisplayOptions from '@/components/widgets/ComboboxDisplayOptions.vue'
import CreateTasksModal from '@/components/modals/CreateTasksModal.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditSequenceModal from '@/components/modals/EditSequenceModal.vue'
import SequenceList from '@/components/lists/SequenceList.vue'
import HardDeleteModal from '@/components/modals/HardDeleteModal.vue'
import SearchField from '@/components/widgets/SearchField.vue'
import SearchQueryList from '@/components/widgets/SearchQueryList.vue'
import SortingInfo from '@/components/widgets/SortingInfo.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'

export default {
  name: 'sequences',

  mixins: [searchMixin, entitiesMixin],

  components: {
    AddMetadataModal,
    AddThumbnailsModal,
    BuildFilterModal,
    ButtonSimple,
    ComboboxDepartment,
    ComboboxDisplayOptions,
    CreateTasksModal,
    DeleteModal,
    EditSequenceModal,
    SequenceList,
    HardDeleteModal,
    SearchField,
    SearchQueryList,
    SortingInfo,
    TaskInfo
  },

  data() {
    return {
      type: 'sequence',
      contactSheetMode: false,
      deleteAllTasksLockText: null,
      descriptorToEdit: {},
      departmentFilter: [],
      sequenceToDelete: null,
      sequenceToEdit: null,
      formData: null,
      genericColumns: [
        'Metadata column name (text value)',
        'Task type name (task status name value)',
        'Task type name + comment (text value)'
      ],
      historyEdit: {},
      initialLoading: true,
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
        del: false,
        deleteAllTasks: false,
        deleteMetadata: false,
        edit: false,
        importing: false,
        savingSearch: false,
        sequence: false,
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

  beforeUnmount() {
    this.clearSelectedSequences()
  },

  created() {
    this.setLastProductionScreen('sequences')
  },

  mounted() {
    this.$refs['sequence-list'].setScrollPosition(
      this.sequenceListScrollPosition
    )
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
        this.$refs['sequence-list'].setScrollPosition(
          this.sequenceListScrollPosition
        )
        this.$refs['sequence-list'].selectTaskFromQuery()

        setTimeout(() => {
          this.applySearchFromUrl()
        }, 200)
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
          finalize()
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
      'currentSection',
      'displayedSequences',
      'departmentMap',
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
      'openProductions',
      'productionSequenceTaskTypes',
      'sequenceMap',
      'sequenceFilledColumns',
      'sequenceSearchText',
      'sequenceValidationColumns',
      'sequenceListScrollPosition',
      'sequenceSorting',
      'taskTypeMap',
      'user'
    ]),

    searchField() {
      return this.$refs['sequence-search-field']
    },

    renderColumns() {
      const collection = [...this.dataMatchers, ...this.optionalColumns]

      this.productionSequenceTaskTypes.forEach(item => {
        collection.push(item.name)
        collection.push(`${item.name} comment`)
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
      'deleteAllTasks',
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
        this.applySearchFromUrl()
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

    saveSearchQuery(searchQuery) {
      if (this.loading.savingSearch) {
        return
      }
      this.loading.savingSearch = true
      this.saveSequenceSearch(searchQuery)
        .catch(console.error)
        .finally(() => {
          this.loading.savingSearch = false
        })
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

    async onFieldChanged({ entry, fieldName, value }) {
      const data = {
        id: entry.id,
        [fieldName]: value
      }
      await this.editSequence(data)
      this.applySearchFromUrl(false)
    },

    async onMetadataChanged({ entry, descriptor, value }) {
      const data = {
        id: entry.id,
        data: {
          [descriptor.field_name]: value
        }
      }
      await this.editSequence(data)
      this.applySearchFromUrl(false)
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
            this.applySearchFromUrl(false)
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
      }
      return ''
    }
  },

  watch: {
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

    currentSection() {
      if (
        (this.isTVShow && this.displayedSequences.length === 0) ||
        this.displayedSequences[0]?.episode_id !== this.currentEpisode?.id
      ) {
        this.$refs['sequence-search-field'].setValue('')
        this.$store.commit('SET_SEQUENCE_LIST_SCROLL_POSITION', 0)
        this.initialLoading = false
        this.reset()
      }
    },

    isSequencesLoading() {
      if (!this.isSequencesLoading) {
        this.initialLoading = false
        if (this.$refs['sequence-list']) {
          this.$refs['sequence-list'].setScrollPosition(
            this.sequenceListScrollPosition
          )
        }
      }
    }
  },

  head() {
    if (this.isTVShow) {
      return {
        title:
          `${this.currentProduction?.name || ''}` +
          ` - ${this.currentEpisode?.name || ''}` +
          ` | ${this.$t('sequences.title')} - Kitsu`
      }
    }
    return {
      title: `${this.currentProduction.name} | ${this.$t('sequences.title')} - Kitsu`
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
</style>
