<template>
  <div class="shots page fixed-page">
    <div class="shot-list-header page-header">
      <div class="level header-title">
        <div class="level-left flexcolumn">
          <div class="filters-area flexcolumn-item">
            <search-field
              ref="shot-search-field"
              :can-save="true"
              @change="onSearchChange"
              placeholder="ex: e01 s01, anim=wip"
              @save="saveSearchQuery"
            />
          </div>

          <div class="query-list flexcolumn-item">
            <search-query-list
              :queries="shotSearchQueries"
              @changesearch="changeSearch"
              @removesearch="removeSearchQuery"
              v-if="!isShotsLoading && !initialLoading"
            />
          </div>
        </div>

        <div class="level-right" v-if="isCurrentUserManager">
          <div class="level-item">
            <show-assignations-button />
            <button-link
              class="level-item"
              :text="$t('main.csv.import_file')"
              icon="upload"
              :is-responsive="true"
              :path="importPath"
            />
            <button-href-link
              class="level-item"
              :text="$t('main.csv.export_file')"
              icon="download"
              :is-responsive="true"
              :path="'/api/export/csv/projects/' + currentProduction.id + '/shots.csv'"
            />
            <button-link
              class="level-item"
              :text="$t('shots.manage')"
              icon="plus"
              :is-responsive="true"
              :path="manageShotsPath"
            />
          </div>
        </div>
      </div>
    </div>

    <shot-list
      ref="shot-list"
      :entries="displayedShots"
      :is-loading="isShotsLoading || initialLoading"
      :is-error="isShotsLoadingError"
      :validation-columns="shotValidationColumns"
      @scroll="saveScrollPosition"
    />

    <manage-shots-modal
      :active="modals.isManageDisplayed"
      :is-loading="loading.manage"
      :is-error="false"
      :is-success="false"
      :cancel-route="shotsPath"
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
      @confirmAndStay="confirmNewShotStay"
    />

    <delete-modal
      :active="modals.isDeleteDisplayed"
      :is-loading="deleteShot.isLoading"
      :is-error="deleteShot.isError"
      :cancel-route="shotsPath"
      :text="deleteText()"
      :error-text="$t('shots.delete_error')"
      @confirm="confirmDeleteShot"
    />

    <delete-modal
      :active="modals.isRestoreDisplayed"
      :is-loading="restoreShot.isLoading"
      :is-error="restoreShot.isError"
      :cancel-route="shotsPath"
      :text="restoreText()"
      :error-text="$t('shots.restore_error')"
      @confirm="confirmRestoreShot"
    />

    <import-modal
      :active="modals.isImportDisplayed"
      :is-loading="loading.importing"
      :is-error="errors.importing"
      :cancel-route="shotsPath"
      :form-data="shotsCsvFormData"
      :columns="columns"
      @fileselected="selectFile"
      @confirm="uploadImportFile"
    />

    <create-tasks-modal
      :active="modals.isCreateTasksDisplayed"
      :is-loading="loading.creatingTasks"
      :is-error="errors.creatingTasks"
      :cancel-route="shotsPath"
      :title="$t('tasks.create_tasks_shot')"
      :text="$t('tasks.create_tasks_shot_explaination')"
      :error-text="$t('tasks.create_tasks_shot_failed')"
      @confirm="confirmCreateTasks"
    />

  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { SearchIcon } from 'vue-feather-icons'

import ButtonHrefLink from './widgets/ButtonHrefLink'
import ButtonLink from './widgets/ButtonLink'
import Combobox from './widgets/Combobox'
import CreateTasksModal from './modals/CreateTasksModal'
import DeleteModal from './widgets/DeleteModal'
import EditShotModal from './modals/EditShotModal'
import Filters from './widgets/Filters'
import ImportModal from './modals/ImportModal'
import ManageShotsModal from './modals/ManageShotsModal'
import PageTitle from './widgets/PageTitle'
import SearchField from './widgets/SearchField'
import SearchQueryList from './widgets/SearchQueryList'
import ShowAssignationsButton from './widgets/ShowAssignationsButton'
import ShotList from './lists/ShotList.vue'

export default {
  name: 'shots',

  components: {
    ButtonLink,
    ButtonHrefLink,
    Combobox,
    CreateTasksModal,
    DeleteModal,
    EditShotModal,
    Filters,
    ImportModal,
    ManageShotsModal,
    PageTitle,
    SearchField,
    SearchIcon,
    SearchQueryList,
    ShowAssignationsButton,
    ShotList
  },

  data () {
    return {
      initialLoading: true,
      modals: {
        isNewDisplayed: false,
        isDeleteDisplayed: false,
        isRestoreDisplayed: false,
        isImportDisplayed: false,
        isCreateTasksDisplayed: false
      },
      loading: {
        creatingTasks: false,
        edit: false,
        importing: false,
        stay: false
      },
      errors: {
        creatingTasks: false,
        importing: false
      },
      shotToDelete: null,
      shotToEdit: null,
      columns: [
        'Episode',
        'Sequence',
        'Name',
        'Description',
        'FPS',
        'Frame In',
        'Frame Out'
      ]
    }
  },

  computed: {
    ...mapGetters([
      'currentEpisode',
      'currentProduction',
      'deleteShot',
      'displayedShots',
      'editShot',
      'episodeMap',
      'episodes',
      'isCurrentUserManager',
      'isShotsLoading',
      'isShotsLoadingError',
      'isShowAssignations',
      'isTVShow',
      'openProductions',
      'restoreShot',
      'sequences',
      'shotMap',
      'shotsCsvFormData',
      'shotSearchQueries',
      'shotSearchText',
      'shotsPath',
      'shotValidationColumns',
      'shotListScrollPosition'
    ]),

    importPath () {
      let route = {
        name: 'import-shots',
        params: {
          production_id: this.currentProduction.id
        }
      }

      if (this.isTVShow && this.currentEpisode) {
        route.name = 'episode-import-shots'
        route.params.episode_id = this.currentEpisode.id
      }

      return route
    },

    manageShotsPath () {
      let route = {
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
            this.handleModalsDisplay()
            setTimeout(() => {
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
      this.$refs['shot-list'].setScrollPosition(
        this.shotListScrollPosition
      )
    }
  },

  methods: {
    ...mapActions([
      'loadShots',
      'loadComment',
      'removeShotSearch',
      'saveShotSearch',
      'setLastProductionScreen',
      'setShotSearch',
      'showAssignations',
      'hideAssignations'
    ]),

    confirmNewShotStay (form) {
      let action = 'newShot'
      this.loading.stay = true
      this.editShot.isSuccess = false
      this.editShot.isError = false

      this.$store.dispatch(action, {
        data: form,
        callback: (err) => {
          this.loading.stay = false
          if (!err) {
            this.resetEditModal()
            this.editShot.shotCreated = form.name
            this.editShot.isSuccess = true
          } else {
            this.loading.edit = false
            this.editShot.isCreateError = true
          }
        }
      })
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

    confirmCreateTasks (form) {
      this.loading.creatingTasks = true
      this.errors.creatingTasks = false
      this.$store.dispatch('createTasks', {
        task_type_id: form.task_type_id,
        project_id: this.currentProduction.id,
        type: 'shots',
        callback: (err) => {
          this.loading.creatingTasks = false
          if (err) {
            this.errors.creatingTasks = true
          } else {
            this.modals.isCreateTasks = false
            this.$router.push(this.shotsPath)
            this.loadShots(() => {
              this.resizeHeaders()
            })
          }
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
        return this.$t('shots.delete_text', {name: shot.name})
      } else {
        return ''
      }
    },

    restoreText () {
      const shot = this.shotToRestore
      if (shot) {
        return this.$t('shots.restore_text', {name: shot.name})
      } else {
        return ''
      }
    },

    handleModalsDisplay () {
      const path = this.$route.path
      const shotId = this.$route.params.shot_id
      this.editShot.isSuccess = false
      this.editShot.isError = false

      this.modals = {
        isNewDisplayed: false,
        isRestoreDisplayed: false,
        isDeleteDisplayed: false,
        isImportDisplayed: false,
        isCreateTasksDisplayed: false,
        isManagedDisplayed: false
      }

      if (path.indexOf('new') > 0) {
        this.resetEditModal()
        this.modals.isNewDisplayed = true
      } else if (path.indexOf('edit') > 0) {
        this.shotToEdit = this.shotMap[shotId]
        this.modals.isNewDisplayed = true
      } else if (path.indexOf('delete') > 0) {
        this.shotToDelete = this.shotMap[shotId]
        this.modals.isDeleteDisplayed = true
      } else if (path.indexOf('restore') > 0) {
        this.shotToRestore = this.shotMap[shotId]
        this.modals.isRestoreDisplayed = true
      } else if (path.indexOf('import') > 0) {
        this.modals.isImportDisplayed = true
      } else if (path.indexOf('create-tasks') > 0) {
        this.modals.isCreateTasksDisplayed = true
      } else if (path.indexOf('manage') > 0) {
        this.modals.isManageDisplayed = true
      }
    },

    selectFile (formData) {
      this.$store.commit('SHOT_CSV_FILE_SELECTED', formData)
    },

    uploadImportFile () {
      this.loading.importing = true
      this.errors.importing = false

      this.$store.dispatch('uploadShotFile', (err) => {
        if (!err) {
          this.loading.importing = false
          this.modals.isImportDisplayed = false
          this.loadShots(() => {
            this.resizeHeaders()
          })
        } else {
          this.loading.importing = false
          this.errors.importing = true
        }
      })
    },

    onSearchChange (event) {
      const searchQuery = this.$refs['shot-search-field'].getValue()
      this.setShotSearch(searchQuery)
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
    },

    saveSearchQuery (searchQuery) {
      this.saveShotSearch(searchQuery)
        .then(() => {
        })
        .catch((err) => {
          if (err) console.log('error')
        })
    },

    removeSearchQuery (searchQuery) {
      this.removeShotSearch(searchQuery)
        .then(() => {
        })
        .catch((err) => {
          if (err) console.log('error')
        })
    },

    resizeHeaders () {
      setTimeout(() => {
        if (this.$refs['shot-list']) {
          this.$refs['shot-list'].resizeHeaders()
        }
      }, 0)
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

<style scoped>
.data-list {
  margin-top: 0;
}

.page-header {
  margin-bottom: 1em;
}

.level {
  align-items: flex-start;
}
</style>
