<template>
  <div class="shots page">

   <div class="shots-list">
      <div class="level">
        <div class="level-left">
          <page-title :text="$t('shots.title')"></page-title>
        </div>
        <div class="level-right">
          <div class="level-item">
            <button-link
              class="level-item"
              :text="$t('main.csv.import_file')"
              icon="fa-upload"
              :path="{
                name: 'import-shots',
                params: {production_id: getCurrentProduction.id}
              }"
            >
            </button-link>
            <button-href-link
              class="level-item"
              :text="$t('main.csv.export_file')"
              icon="fa-download"
              :path="'/api/export/csv/shots.csv?project_id=' + getCurrentProduction.id"
            >
            </button-href-link>
          </div>
        </div>
      </div>

      <shot-list
        :entries="shots"
        :is-loading="isShotsLoading"
        :is-error="isShotsLoadingError"
        :validation-columns="shotValidationColumns"
      ></shot-list>
    </div>

    <delete-modal
      :active="modals.isDeleteDisplayed"
      :is-loading="deleteShot.isLoading"
      :is-error="deleteShot.isError"
      :cancel-route="{
        name: 'shots',
        params: {production_id: getCurrentProduction.id}
      }"
      :text="deleteText()"
      :error-text="$t('shots.delete_error')"
      @confirm="confirmDeleteShot"
    >
    </delete-modal>

    <import-modal
      :active="modals.isImportDisplayed"
      :is-loading="loading.importing"
      :is-error="errors.importing"
      :cancel-route="{
        name: 'shots',
        params: {production_id: getCurrentProduction.id}
      }"
      :form-data="shotsCsvFormData"
      :columns="columns"
      @fileselected="selectFile"
      @confirm="uploadImportFile"
    >
    </import-modal>

    <create-tasks-modal
      :active="modals.isCreateTasksDisplayed"
      :is-loading="loading.creatingTasks"
      :is-error="errors.creatingTasks"
      :cancel-route="{
        name: 'shots',
        params: {production_id: getCurrentProduction.id}
      }"
      :title="$t('tasks.create_tasks_shot')"
      :text="$t('tasks.create_tasks_shot_explaination')"
      :error-text="$t('tasks.create_tasks_shot_failed')"
      @confirm="confirmCreateTasks"
    >
    </create-tasks-modal>

  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import ShotList from './lists/ShotList.vue'
import DeleteModal from './widgets/DeleteModal'
import ImportModal from './modals/ImportModal'
import CreateTasksModal from './modals/CreateTasksModal'
import Filters from './widgets/Filters'
import ButtonLink from './widgets/ButtonLink'
import ButtonHrefLink from './widgets/ButtonHrefLink'
import PageTitle from './widgets/PageTitle'

export default {
  name: 'menu',

  components: {
    ShotList,
    DeleteModal,
    ImportModal,
    CreateTasksModal,
    Filters,
    ButtonLink,
    ButtonHrefLink,
    PageTitle
  },

  data () {
    return {
      modals: {
        isNewDisplayed: false,
        isDeleteDisplayed: false,
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
      choices: [],
      shotFilters: [{
        type: 'Type',
        value: {
          name: 'open'
        }
      }],
      columns: [
        'Project',
        'Episode',
        'Sequence',
        'Name',
        'Description',
        'FPS',
        'Frame In',
        'Frame Out'
      ],
      shotFilterTypes: [
        'Type'
      ]
    }
  },

  computed: {
    ...mapGetters([
      'shots',
      'shotsCsvFormData',
      'sequences',
      'openProductions',
      'isShotsLoading',
      'isShotsLoadingError',
      'editShot',
      'deleteShot',
      'getShot',
      'shotValidationColumns',
      'currentProduction',
      'getCurrentProduction'
    ])
  },

  created () {
    const productionId = this.$store.state.route.params.production_id
    this.$store.commit(
      'SET_CURRENT_PRODUCTION',
      productionId
    )

    this.loadShots((err) => {
      if (!err) this.handleModalsDisplay()
    })
  },

  methods: {
    ...mapActions([
      'loadShots'
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
            this.$router.push({
              name: 'shots',
              params: {production_id: this.getCurrentProduction.id}
            })
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
            this.$router.push({
              name: 'shots',
              params: {production_id: this.getCurrentProduction.id}
            })
          }
        }
      })
    },

    confirmCreateTasks (form) {
      this.loading.creatingTasks = true
      this.errors.creatingTasks = false
      this.$store.dispatch('createTasks', {
        task_type_id: form.task_type_id,
        project_id: this.getCurrentProduction.id,
        type: 'shots',
        callback: (err) => {
          this.loading.creatingTasks = false
          if (err) {
            this.errors.creatingTasks = true
          } else {
            this.modals.isCreateTasks = false
            this.$router.push({
              name: 'shots',
              params: {production_id: this.getCurrentProduction.id}
            })
            this.$store.dispatch('loadShots')
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

    handleModalsDisplay () {
      const path = this.$store.state.route.path
      const shotId = this.$store.state.route.params.shot_id
      this.editShot.isSuccess = false
      this.editShot.isError = false

      if (path.indexOf('new') > 0) {
        this.resetEditModal()
        this.modals.isNewDisplayed = true
      } else if (path.indexOf('edit') > 0) {
        this.shotToEdit = this.getShot(shotId)
        this.modals.isNewDisplayed = true
      } else if (path.indexOf('delete') > 0) {
        this.shotToDelete = this.getShot(shotId)
        this.modals.isDeleteDisplayed = true
      } else if (path.indexOf('import') > 0) {
        this.modals.isImportDisplayed = true
      } else if (path.indexOf('create-tasks') > 0) {
        this.modals.isCreateTasksDisplayed = true
      } else {
        this.modals = {
          isNewDisplayed: false,
          isDeleteDisplayed: false,
          isImportDisplayed: false,
          isCreateTasksDisplayed: false
        }
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
          this.$store.dispatch('loadShots')
        } else {
          this.loading.importing = false
          this.errors.importing = true
        }
      })
    }
  },

  watch: {
    $route () { this.handleModalsDisplay() },
    currentProduction () {
      const newPath = {
        name: 'assets',
        params: {production_id: this.getCurrentProduction.id}
      }
      if (this.$route.path.length === 56) this.$router.push(newPath)
      this.$store.dispatch('loadShots')
    }
  }
}
</script>

<style scoped>
.shots-list {
  margin-top: 2em;
}
</style>
