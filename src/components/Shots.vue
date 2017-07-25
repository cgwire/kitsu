<template>
  <div class="shots page">
   <div class="shots-list">
      <h1 class="title">{{ $t('shots.title') }}</h1>

      <div class="level">
        <div class="level-left">
        </div>
        <div class="level-right">
          <div class="level-item">
            <button-link
              class="level-item"
              :text="$t('main.csv.import_file')"
              icon="fa-upload"
              path="/shots/import"
            >
            </button-link>
            <button-href-link
              class="level-item"
              :text="$t('main.csv.export_file')"
              icon="fa-download"
              path="/api/export/csv/shots.csv"
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
      :is-error="deleteShot.isCreateError"
      :cancel-route="'/shots'"
      :text="deleteText()"
      :error-text="$t('shots.delete_error')"
      @confirm="confirmDeleteShot"
    >
    </delete-modal>

    <import-modal
      :active="modals.isImportDisplayed"
      :is-loading="loading.importing"
      :is-error="errors.importing"
      :cancel-route="'/shots'"
      :form-data="shotsCsvFormData"
      :columns="columns"
      @fileselected="selectFile"
      @confirm="uploadImportFile"
    >
    </import-modal>

  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import ShotList from './lists/ShotList.vue'
import DeleteModal from './widgets/DeleteModal'
import ImportModal from './modals/ImportModal'
import Filters from './widgets/Filters'
import ButtonLink from './widgets/ButtonLink'
import ButtonHrefLink from './widgets/ButtonHrefLink'

export default {
  name: 'menu',

  components: {
    ShotList,
    DeleteModal,
    ImportModal,
    Filters,
    ButtonLink,
    ButtonHrefLink
  },

  data () {
    return {
      modals: {
        isNewDisplayed: false,
        isDeleteDisplayed: false,
        isImportDisplayed: false
      },
      loading: {
        importing: false,
        edit: false,
        stay: false
      },
      errors: {
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
      'shotValidationColumns'
    ])
  },

  created () {
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
            this.$router.push('/shots')
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
          if (!err) this.modals.isDeleteDisplayed = false
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
      } else {
        this.modals.isNewDisplayed = false
        this.modals.isDeleteDisplayed = false
        this.modals.isImportDisplayed = false
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
    $route () { this.handleModalsDisplay() }
  }
}
</script>

<style scoped>
.shots-list {
  margin-top: 2em;
}

</style>
