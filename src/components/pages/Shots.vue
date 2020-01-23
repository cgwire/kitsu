<template>
<div class="columns fixed-page">
  <div class="column main-column">
    <div class="shots page">
      <div class="shot-list-header page-header">
        <div class="level header-title">
          <div class="level-left flexcolumn">
            <div class="filters-area flexcolumn-item">
              <search-field
                ref="shot-search-field"
                :can-save="true"
                @change="onSearchChange"
                @save="saveSearchQuery"
                placeholder="ex: e01 s01 anim=wip"
              />
            </div>
          </div>

          <div class="level-right">
            <div class="flexrow" v-if="!isCurrentUserClient">
              <show-assignations-button class="flexrow-item" />
              <show-infos-button class="flexrow-item" />
              <div class="flexrow-item"></div>
            </div>
            <div class="flexrow" v-if="isCurrentUserManager">
              <button-simple
                class="flexrow-item"
                :title="$t('entities.thumbnails.title')"
                icon="image"
                @click="showAddThumbnailsModal"
              />
              <button-simple
                class="flexrow-item"
                :title="$t('main.csv.import_file')"
                icon="upload"
                @click="showImportModal"
              />
              <button-simple
                class="flexrow-item"
                icon="download"
                :title="$t('main.csv.export_file')"
                @click="onExportClick"
              />
              <button-simple
                class="flexrow-item"
                :text="$t('shots.manage')"
                icon="plus"
                @click="showManageShots"
              />
            </div>
          </div>
        </div>

        <div class="query-list">
          <search-query-list
            :queries="shotSearchQueries"
            @changesearch="changeSearch"
            @removesearch="removeSearchQuery"
            v-if="!isShotsLoading && !initialLoading"
          />
        </div>
      </div>

      <shot-list
        ref="shot-list"
        :displayed-shots="displayedShotsBySequence"
        :is-loading="isShotsLoading || initialLoading"
        :is-error="isShotsLoadingError"
        :validation-columns="shotValidationColumns"
        @create-tasks="showCreateTasksModal"
        @scroll="saveScrollPosition"
        @delete-all-tasks="onDeleteAllTasksClicked"
        @add-metadata="onAddMetadataClicked"
        @delete-metadata="onDeleteMetadataClicked"
        @edit-metadata="onEditMetadataClicked"
        @shot-history="showShotHistoryModal"
        @add-shots="showManageShots"
      />
    </div>
  </div>

  <div
    class="column side-column"
    v-if="nbSelectedTasks === 1"
  >
    <task-info
      :task="Object.values(selectedTasks)[0]"
    />
  </div>

  <manage-shots-modal
    :active="modals.isManageDisplayed"
    :is-loading="loading.manage"
    :is-error="false"
    :is-success="false"
    :cancel-route="shotsPath"
    @cancel="hideManageShots"
  />

  <edit-shot-modal
    :active="modals.isNewDisplayed"
    :is-loading="loading.edit"
    :is-loading-stay="loading.stay"
    :is-error="editShot.isCreateError"
    :is-success="editShot.isSuccess"
    :cancel-route="shotsPath"
    :shot-to-edit="shotToEdit"
    @confirm="confirmEditShot"
  />

  <delete-modal
    ref="delete-shot-modal"
    :active="modals.isDeleteDisplayed"
    :is-loading="deleteShot.isLoading"
    :is-error="deleteShot.isError"
    :cancel-route="shotsPath"
    :text="deleteText()"
    :error-text="$t('shots.delete_error')"
    @confirm="confirmDeleteShot"
  />

  <delete-modal
    ref="restore-shot-modal"
    :active="modals.isRestoreDisplayed"
    :is-loading="restoreShot.isLoading"
    :is-error="restoreShot.isError"
    :cancel-route="shotsPath"
    :text="restoreText()"
    :error-text="$t('shots.restore_error')"
    @confirm="confirmRestoreShot"
  />

  <delete-modal
    ref="delete-metadata-modal"
    :active="modals.isDeleteMetadataDisplayed"
    :is-loading="loading.deleteMetadata"
    :is-error="errors.deleteMetadata"
    @cancel="modals.isDeleteMetadataDisplayed = false"
    :text="$t('productions.metadata.delete_text')"
    :error-text="$t('productions.metadata.delete_error')"
    @confirm="confirmDeleteMetadata"
  />

  <hard-delete-modal
    ref="delete-all-tasks-modal"
    :active="modals.isDeleteAllTasksDisplayed"
    :is-loading="loading.deleteAllTasks"
    :is-error="errors.deleteAllTasks"
    :cancel-route="shotsPath"
    :text="deleteAllTasksText()"
    :error-text="$t('tasks.delete_all_error')"
    :lock-text="deleteAllTasksLockText"
    @confirm="confirmDeleteAllTasks"
  />

  <preview-modal
    :active="modals.isPreviewDisplayed"
    :is-loading="loading.importing"
    :is-error="errors.importing"
    :form-data="parsedCSV"
    @reupload="reuploadFile"
    @cancel="hidePreviewModal"
    @confirm="uploadImportFile"
  />

  <import-modal
    :active="modals.isImportDisplayed"
    :is-loading="loading.importing"
    :is-error="errors.importing"
    :columns="columns"
    @cancel="hideImportModal"
    @fileselected="selectFile"
    @confirm="previewImportFile"
  />

  <create-tasks-modal
    :active="modals.isCreateTasksDisplayed"
    :is-loading="loading.creatingTasks"
    :is-loading-stay="loading.creatingTasksStay"
    :is-error="errors.creatingTasks"
    :title="$t('tasks.create_tasks_shot')"
    :text="$t('tasks.create_tasks_shot_explaination')"
    :error-text="$t('tasks.create_tasks_shot_failed')"
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
    @cancel="closeMetadataModal"
    @confirm="confirmAddMetadata"
  />

  <add-thumbnails-modal
    ref="add-thumbnails-modal"
    :active="modals.isAddThumbnailsDisplayed"
    :is-loading="loading.addThumbnails"
    :is-error="errors.addThumbnails"
    @cancel="hideAddThumbnailsModal"
    @confirm="confirmAddThumbnails"
  />

  <shot-history-modal
    :active="modals.isShotHistoryDisplayed"
    :shot="historyShot"
    @cancel="hideShotHistoryModal"
  />
</div>
</template>

<script>
import moment from 'moment'
import Papa from 'papaparse'
import { mapGetters, mapActions } from 'vuex'
import csv from '../../lib/csv'
import func from '../../lib/func'
import { sortByName } from '../../lib/sorting'
import { slugify } from '../../lib/string'

import AddMetadataModal from '../modals/AddMetadataModal'
import AddThumbnailsModal from '../modals/AddThumbnailsModal'
import ButtonSimple from '../widgets/ButtonSimple'
import CreateTasksModal from '../modals/CreateTasksModal'
import DeleteModal from '../modals/DeleteModal'
import EditShotModal from '../modals/EditShotModal'
import PreviewModal from '../modals/PreviewModal'
import ImportModal from '../modals/ImportModal'
import HardDeleteModal from '../modals/HardDeleteModal'
import ManageShotsModal from '../modals/ManageShotsModal'
import SearchField from '../widgets/SearchField'
import SearchQueryList from '../widgets/SearchQueryList'
import ShowAssignationsButton from '../widgets/ShowAssignationsButton'
import ShowInfosButton from '../widgets/ShowInfosButton'
import ShotHistoryModal from '../modals/ShotHistoryModal'
import ShotList from '../lists/ShotList.vue'
import TaskInfo from '../sides/TaskInfo.vue'

export default {
  name: 'shots',

  components: {
    AddMetadataModal,
    AddThumbnailsModal,
    ButtonSimple,
    CreateTasksModal,
    DeleteModal,
    EditShotModal,
    PreviewModal,
    ImportModal,
    HardDeleteModal,
    ManageShotsModal,
    SearchField,
    SearchQueryList,
    ShotHistoryModal,
    ShowAssignationsButton,
    ShowInfosButton,
    ShotList,
    TaskInfo
  },

  data () {
    return {
      initialLoading: true,
      deleteAllTasksLockText: null,
      descriptorToEdit: {},
      historyShot: {},
      shotToDelete: null,
      shotToEdit: null,
      parsedCSV: null,
      columns: [
        'Episode',
        'Sequence',
        'Name',
        'Description',
        'FPS',
        'Frame In',
        'Frame Out'
      ],
      modals: {
        isAddMetadataDisplayed: false,
        isAddThumbnailsDisplayed: false,
        isCreateTasksDisplayed: false,
        isDeleteDisplayed: false,
        isDeleteMetadataDisplayed: false,
        isDeleteAllTasksDisplayed: false,
        isPreviewDisplayed: false,
        isImportDisplayed: false,
        isManageDisplayed: false,
        isNewDisplayed: false,
        isRestoreDisplayed: false,
        isShotHistoryDisplayed: false
      },
      loading: {
        addMetadata: false,
        addThumbnails: false,
        creatingTasks: false,
        creatingTasksStay: false,
        deleteAllTasks: false,
        deleteMetadata: false,
        edit: false,
        importing: false,
        stay: false
      },
      errors: {
        addMetadata: false,
        deleteMetadata: false,
        creatingTasks: false,
        deleteAllTasks: false,
        importing: false
      }
    }
  },

  computed: {
    ...mapGetters([
      'currentEpisode',
      'currentProduction',
      'deleteShot',
      'displayedShotsBySequence',
      'editShot',
      'episodeMap',
      'episodes',
      'isCurrentUserClient',
      'isCurrentUserManager',
      'isFrameIn',
      'isFrameOut',
      'isFps',
      'isTime',
      'isShotsLoading',
      'isShotsLoadingError',
      'isShowAssignations',
      'isTVShow',
      'nbSelectedTasks',
      'openProductions',
      'restoreShot',
      'sequences',
      'selectedTasks',
      'shotMap',
      'shotFilledColumns',
      'shotsCsvFormData',
      'shotSearchQueries',
      'shotSearchText',
      'shotsPath',
      'shotValidationColumns',
      'shotListScrollPosition',
      'taskTypeMap'
    ]),

    addThumbnailsModal () {
      return this.$refs['add-thumbnails-modal']
    }
  },

  created () {
    this.setLastProductionScreen('shots')
  },

  mounted () {
    if (this.shotSearchText.length > 0) {
      this.$refs['shot-search-field'].setValue(this.shotSearchText)
    }

    if (
      Object.keys(this.shotMap).length < 2 ||
      (
        this.shotValidationColumns.length > 0 &&
        !Object.keys(this.shotMap)[0].validations
      )
    ) {
      setTimeout(() => {
        this.loadShots((err) => {
          setTimeout(() => {
            this.initialLoading = false
          }, 200)
          this.resizeHeaders()
          if (!err) {
            this.onSearchChange()
            this.handleModalsDisplay()
            setTimeout(() => {
              this.resizeHeaders()
              this.$refs['shot-list'].setScrollPosition(
                this.shotListScrollPosition
              )
            }, 500)
          }
        })
      }, 100)
    } else {
      if (!this.isShotsLoading) this.initialLoading = false
      this.resizeHeaders()
      this.onSearchChange()
      this.$refs['shot-list'].setScrollPosition(
        this.shotListScrollPosition
      )
    }
  },

  methods: {
    ...mapActions([
      'addMetadataDescriptor',
      'commentTaskWithPreview',
      'deleteAllTasks',
      'deleteMetadataDescriptor',
      'getShotsCsvLines',
      'hideAssignations',
      'loadShots',
      'loadComment',
      'removeShotSearch',
      'saveShotSearch',
      'setLastProductionScreen',
      'setPreview',
      'setShotSearch',
      'showAssignations',
      'uploadShotFile'
    ]),

    confirmAddMetadata (form) {
      this.loading.addMetadata = true
      form.entity_type = 'Shot'
      this.addMetadataDescriptor(form)
        .then(() => {
          this.loading.addMetadata = false
          this.modals.isAddMetadataDisplayed = false
        })
        .catch((err) => {
          console.error(err)
          this.loading.addMetadata = false
          this.errors.addMetadata = true
        })
    },

    closeMetadataModal () {
      this.modals.isAddMetadataDisplayed = false
    },

    confirmDeleteMetadata () {
      this.errors.deleteMetadata = false
      this.loading.deleteMetadata = true
      this.deleteMetadataDescriptor(this.descriptorIdToDelete)
        .then(() => {
          this.errors.deleteMetadata = false
          this.loading.deleteMetadata = false
          this.modals.isDeleteMetadataDisplayed = false
        }).catch((err) => {
          console.error(err)
          this.errors.deleteMetadata = true
          this.loading.deleteMetadata = false
        })
    },

    onAddMetadataClicked () {
      this.descriptorToEdit = {}
      this.modals.isAddMetadataDisplayed = true
    },

    onDeleteMetadataClicked (descriptorId) {
      this.descriptorIdToDelete = descriptorId
      this.modals.isDeleteMetadataDisplayed = true
    },

    onEditMetadataClicked (descriptorId) {
      this.descriptorToEdit = this.currentProduction.descriptors.find(
        d => d.id === descriptorId
      )
      this.modals.isAddMetadataDisplayed = true
    },

    confirmEditShot (form) {
      let action = 'newShot'
      this.loading.edit = true
      this.editShot.isCreateError = false
      if (this.shotToEdit && this.shotToEdit.id) {
        action = 'editShot'
        form.id = this.shotToEdit.id
      }

      this.$store.dispatch(action, {
        data: form,
        callback: (err) => {
          if (!err) {
            this.loading.edit = false
            this.modals.isNewDisplayed = false
            this.$router.push(this.shotsPath)
          } else {
            this.loading.edit = false
            this.editShot.isCreateError = true
          }
        }
      })
    },

    confirmDeleteAllTasks () {
      const taskTypeId = this.$route.params.task_type_id
      const projectId = this.currentProduction.id
      this.errors.deleteAllTasks = false
      this.loading.deleteAllTasks = true
      this.deleteAllTasks({ projectId, taskTypeId })
        .then(() => {
          this.loading.deleteAllTasks = false
          this.loadShots(() => {
            this.resizeHeaders()
          })
          this.$router.push(this.shotsPath)
        }).catch((err) => {
          console.error(err)
          this.loading.deleteAllTasks = false
          this.errors.deleteAllTasks = true
        })
    },

    confirmDeleteShot () {
      this.$store.dispatch('deleteShot', {
        shot: this.shotToDelete,
        callback: (err) => {
          if (!err) {
            this.$router.push(this.shotsPath)
          }
        }
      })
    },

    confirmRestoreShot () {
      this.$store.dispatch('restoreShot', {
        shot: this.shotToRestore,
        callback: (err) => {
          if (!err) {
            this.$router.push(this.shotsPath)
          }
        }
      })
    },

    confirmAddThumbnails (forms) {
      const addPreview = (form) => {
        this.addThumbnailsModal.markLoading(form.task.entity_id)
        return this.commentTaskWithPreview({
          taskId: form.task.id,
          commentText: '',
          taskStatusId: form.task.task_status_id,
          form: form
        })
          .then(({ newComment, preview }) => {
            return this.setPreview({
              taskId: form.task.id,
              entityId: form.task.entity_id,
              previewId: preview.id
            })
          })
          .then(() => {
            this.addThumbnailsModal.markUploaded(form.task.entity_id)
            return Promise.resolve()
          })
      }
      this.loading.addThumbnails = true
      func.runPromiseMapAsSeries(forms, addPreview)
        .then(() => {
          this.loading.addThumbnails = false
          this.modals.isAddThumbnailsDisplayed = false
        })
    },

    confirmCreateTasks (form) {
      this.loading.creatingTasks = true
      this.runTasksCreation(form, () => {
        this.hideCreateTasksModal()
        this.loading.creatingTasks = false
      })
    },

    confirmCreateTasksAndStay (form) {
      this.loading.creatingTasksStay = true
      this.runTasksCreation(form, () => {
        this.loading.creatingTasksStay = false
      })
    },

    runTasksCreation (form, callback) {
      this.errors.creatingTasks = false
      this.$store.dispatch('createTasks', {
        task_type_id: form.task_type_id,
        project_id: this.currentProduction.id,
        type: 'shots',
        callback: (err) => {
          if (err) {
            this.errors.creatingTasks = true
          } else {
            this.loadShots(() => {
              this.resizeHeaders()
            })
          }
          callback(err)
        }
      })
    },

    resetEditModal () {
      const form = { name: '' }
      if (this.sequences.length > 0) {
        form.sequence_id = this.sequences[0].id
      }
      if (this.openProductions.length > 0) {
        form.production_id = this.openProductions[0].id
      }
      this.shotToEdit = form
    },

    deleteText () {
      const shot = this.shotToDelete
      if (shot) {
        return this.$t('shots.delete_text', { name: shot.name })
      } else {
        return ''
      }
    },

    deleteAllTasksText () {
      const taskType = this.taskTypeMap[this.$route.params.task_type_id]
      if (taskType) {
        return this.$t('tasks.delete_all_text', { name: taskType.name })
      } else {
        return ''
      }
    },

    restoreText () {
      const shot = this.shotToRestore
      if (shot) {
        return this.$t('shots.restore_text', { name: shot.name })
      } else {
        return ''
      }
    },

    handleModalsDisplay () {
      const path = this.$route.path
      const shotId = this.$route.params.shot_id
      this.editShot.isSuccess = false
      this.editShot.isError = false

      Object.assign(this.modals, {
        isAddMetadataDisplayed: false,
        isCreateTasksDisplayed: false,
        isDeleteAllTasksDisplayed: false,
        isDeleteDisplayed: false,
        isDeleteMetadataDisplayed: false,
        isNewDisplayed: false,
        isRestoreDisplayed: false
      })

      if (path.indexOf('new') > 0) {
        this.resetEditModal()
        this.modals.isNewDisplayed = true
      } else if (path.indexOf('edit') > 0) {
        this.shotToEdit = this.shotMap[shotId]
        this.modals.isNewDisplayed = true
      } else if (path.indexOf('delete-all-tasks') > 0) {
        this.modals.isDeleteAllTasksDisplayed = true
      } else if (path.indexOf('delete') > 0) {
        this.shotToDelete = this.shotMap[shotId]
        this.modals.isDeleteDisplayed = true
      } else if (path.indexOf('restore') > 0) {
        this.shotToRestore = this.shotMap[shotId]
        this.modals.isRestoreDisplayed = true
      }
    },

    selectFile (formData) {
      this.$store.commit('SHOT_CSV_FILE_SELECTED', formData)
    },

    processCSVFile (file, config) {
      return new Promise((resolve, reject) => {
        Papa.parse(file, {
          config: config,
          error: reject,
          complete: (results) => {
            resolve(results.data)
          }
        })
      })
    },

    previewImportFile (formData) {
      this.loading.importing = true
      this.errors.importing = false
      const file = formData.get('file')
      this.processCSVFile(file)
        .then((results) => {
          this.parsedCSV = results
          this.hideImportModal()
          this.loading.importing = false
          this.showPreviewModal()
        })
    },

    uploadImportFile () {
      this.loading.importing = true
      this.errors.importing = false

      this.uploadShotFile((err) => {
        if (!err) {
          this.loading.importing = false
          this.hideImportModal()
          this.loadShots(() => {
            this.resizeHeaders()
          })
        } else {
          this.loading.importing = false
          this.errors.importing = true
        }
      })
    },

    reuploadFile () {
      this.hidePreviewModal()
      this.showImportModal()
    },

    onDeleteAllTasksClicked (taskTypeId) {
      const route = this.getPath('delete-all-shot-tasks')
      const taskType = this.taskTypeMap[taskTypeId]
      route.params.task_type_id = taskTypeId
      this.deleteAllTasksLockText = taskType.name
      this.$router.push(route)
    },

    onSearchChange (event) {
      const searchQuery = this.$refs['shot-search-field'].getValue()
      if (searchQuery.length !== 1) {
        this.setShotSearch(searchQuery)
        this.resizeHeaders()
      }
    },

    saveScrollPosition (scrollPosition) {
      this.$store.commit(
        'SET_SHOT_LIST_SCROLL_POSITION',
        scrollPosition
      )
    },

    changeSearch (searchQuery) {
      this.$refs['shot-search-field'].setValue(searchQuery.search_query)
      this.$refs['shot-search-field'].$emit('change', searchQuery.search_query)
      this.resizeHeaders()
    },

    saveSearchQuery (searchQuery) {
      this.saveShotSearch(searchQuery)
        .catch(console.error)
    },

    removeSearchQuery (searchQuery) {
      this.removeShotSearch(searchQuery)
        .catch(console.error)
    },

    resizeHeaders () {
      setTimeout(() => {
        if (this.$refs['shot-list']) {
          this.$refs['shot-list'].resizeHeaders()
        }
      }, 0)
    },

    getPath (section) {
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
      return route
    },

    showManageShots () {
      this.modals.isManageDisplayed = true
    },

    hideManageShots () {
      this.modals.isManageDisplayed = false
    },

    showImportModal () {
      this.modals.isImportDisplayed = true
    },

    hideImportModal () {
      this.modals.isImportDisplayed = false
    },

    showPreviewModal () {
      this.modals.isPreviewDisplayed = true
    },

    hidePreviewModal () {
      this.modals.isPreviewDisplayed = false
    },

    showCreateTasksModal () {
      this.modals.isCreateTasksDisplayed = true
    },

    hideCreateTasksModal () {
      this.modals.isCreateTasksDisplayed = false
    },

    showAddThumbnailsModal () {
      this.modals.isAddThumbnailsDisplayed = true
    },

    hideAddThumbnailsModal () {
      this.modals.isAddThumbnailsDisplayed = false
    },

    showShotHistoryModal (shot) {
      this.historyShot = shot
      this.modals.isShotHistoryDisplayed = true
    },

    hideShotHistoryModal () {
      this.modals.isShotHistoryDisplayed = false
    },

    onExportClick () {
      this.getShotsCsvLines()
        .then((shotLines) => {
          const nameData = [
            moment().format('YYYY-MM-DD'),
            'kitsu',
            this.currentProduction.name,
            this.$t('shots.title')
          ]
          if (this.currentEpisode) {
            nameData.splice(3, 0, this.currentEpisode.name)
          }
          const name = slugify(nameData.join('_'))
          const headers = [
            this.$t('shots.fields.sequence'),
            this.$t('shots.fields.name'),
            this.$t('shots.fields.description')
          ]
          sortByName([...this.currentProduction.descriptors])
            .filter(d => d.entity_type === 'Shot')
            .forEach((descriptor) => {
              headers.push(descriptor.field_name)
            })
          headers.push(this.$t('shots.fields.nb_frames'))
          if (this.isFrameIn) {
            headers.push(this.$t('shots.fields.frame_in'))
          }
          if (this.isFrameOut) {
            headers.push(this.$t('shots.fields.frame_out'))
          }
          if (this.isFps) {
            headers.push(this.$t('shots.fields.fps'))
          }
          if (this.isTime) {
            headers.push(this.$t('shots.fields.time_spent'))
          }
          this.shotValidationColumns
            .forEach((taskTypeId) => {
              headers.push(this.taskTypeMap[taskTypeId].name)
            })
          csv.buildCsvFile(name, [headers].concat(shotLines))
        })
    }
  },

  watch: {
    $route () {
      this.handleModalsDisplay()
    },

    currentProduction () {
      this.$refs['shot-search-field'].setValue('')
      this.$store.commit('SET_SHOT_LIST_SCROLL_POSITION', 0)

      this.initialLoading = true
      if (!this.isTVShow) {
        this.loadShots((err) => {
          this.initialLoading = false
          this.resizeHeaders()
          if (!err) {
            this.handleModalsDisplay()
          }
        })
      }
    },

    currentEpisode () {
      if (this.isTVShow && this.currentEpisode) {
        this.initialLoading = true
        this.loadShots((err) => {
          this.initialLoading = false
          this.resizeHeaders()
          if (!err) {
            this.handleModalsDisplay()
          }
        })
      }
    },

    displayedShots () {
      this.resizeHeaders()
    }
  },

  metaInfo () {
    if (this.isTVShow) {
      return {
        title: `${this.currentProduction ? this.currentProduction.name : ''}` +
               ` - ${this.currentEpisode ? this.currentEpisode.name : ''}` +
               ` | ${this.$t('shots.title')} - Kitsu`
      }
    } else {
      return {
        title: `${this.currentProduction.name} ${this.$t('shots.title')} - Kitsu`
      }
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

.level {
  align-items: flex-start;
}

.flexcolumn {
  align-items: flex-start;
}

.shots {
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
