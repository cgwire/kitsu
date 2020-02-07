<template>
  <div class="people page fixed-page">
    <div class="flexrow page-header">
      <page-title class="flexrow-item filler" :text="$t('people.title')" />

      <div class="flexrow-item">
        <button-simple
          class="flexrow-item"
          :title="$t('main.csv.import_file')"
          :is-responsive="true"
          icon="upload"
          @click="showImportModal"
          v-if="isCurrentUserAdmin"
        />
        <button-href-link
          class="flexrow-item"
          :title="$t('main.csv.export_file')"
          icon="download"
          path="/api/export/csv/persons.csv"
        />
        <button-link
          class="flexrow-item"
          :text="$t('people.new_person')"
          :is-responsive="true"
          icon="plus"
          path="/people/new"
          v-if="isCurrentUserAdmin"
        />
      </div>
    </div>

    <div class="flexrow">
      <search-field
        class="search flexrow-item"
        ref="people-search-field"
        :can-save="false"
        @change="onSearchChange"
        placeholder="ex: John Doe"
      />
    </div>

    <people-list
      :entries="displayedPeople"
      :is-loading="isPeopleLoading"
      :is-error="isPeopleLoadingError"
    />

    <import-render-modal
      :active="modals.isImportRenderDisplayed"
      :is-loading="isImportPeopleLoading"
      :is-error="isImportPeopleLoadingError"
      :parsed-csv="parsedCSV"
      :form-data="personCsvFormData"
      :columns="csvColumns"
      @reupload="resetImport"
      @cancel="hideImportRenderModal"
      @confirm="uploadImportFile"
    />

    <import-modal
      ref="import-modal"
      :active="modals.importModal"
      :is-loading="isImportPeopleLoading"
      :is-error="isImportPeopleLoadingError"
      :form-data="personCsvFormData"
      :columns="csvColumns"
      @cancel="hideImportModal"
      @confirm="renderImport"
    />

    <edit-person-modal
      :active="isEditModalShown"
      :is-loading="loading.edit"
      :is-invite-loading="loading.invite"
      :is-create-invite-loading="loading.createAndInvite"
      :is-error="isEditLoadingError"
      :is-invitation-success="success.invite"
      :is-invitation-error="errors.invite"
      :cancel-route="{ name: 'people'}"
      @confirm="confirmEditPeople"
      @confirm-invite="confirmCreateAndInvite"
      @invite="confirmInvite"
    />

    <hard-delete-modal
      :active="isDeleteModalShown"
      :is-loading="isDeleteLoading"
      :is-error="isDeleteLoadingError"
      :cancel-route="{ name: 'people'}"
      :text="deleteText"
      :error-text="$t('people.delete_error')"
      :lock-text="personToDelete ? personToDelete.full_name : ''"
      @confirm="confirmDeletePeople"
    />

  </div>
</template>

<script>
import Papa from 'papaparse'

import { mapGetters, mapActions } from 'vuex'

import ButtonLink from '../widgets/ButtonLink'
import ButtonHrefLink from '../widgets/ButtonHrefLink'
import ButtonSimple from '../widgets/ButtonSimple'
import EditPersonModal from '../modals/EditPersonModal'
import HardDeleteModal from '../modals/HardDeleteModal'
import ImportModal from '../modals/ImportModal'
import ImportRenderModal from '../modals/ImportRenderModal'
import PeopleList from '../lists/PeopleList'
import PageTitle from '../widgets/PageTitle'
import SearchField from '../widgets/SearchField'

export default {
  name: 'people',
  components: {
    ButtonLink,
    ButtonHrefLink,
    ButtonSimple,
    EditPersonModal,
    HardDeleteModal,
    ImportModal,
    PageTitle,
    PeopleList,
    ImportRenderModal,
    SearchField
  },

  data () {
    return {
      errors: {
        invite: false
      },
      loading: {
        createAndInvite: false,
        edit: false,
        invite: false
      },
      modals: {
        importModal: false,
        isImportRenderDisplayed: false
      },
      parsedCSV: [],
      success: {
        invite: false
      },
      csvColumns: [
        'First Name',
        'Last Name',
        'Email',
        'Phone'
      ]
    }
  },

  created () {
    this.loadPeople(() => {
      this.handleModalsDisplay()
    })
  },

  watch: {
    '$route' (to, from) {
      this.handleModalsDisplay()
    }
  },

  computed: {
    ...mapGetters([
      'displayedPeople',
      'isPeopleLoading',
      'isPeopleLoadingError',

      'isImportPeopleModalShown',
      'isImportPeopleLoading',
      'isImportPeopleLoadingError',

      'isEditModalShown',
      'isEditLoading',
      'isEditLoadingError',

      'isDeleteModalShown',
      'isDeleteLoading',
      'isDeleteLoadingError',

      'isImportModalShown',
      'isImportLoading',
      'isImportLoadingError',

      'personToDelete',
      'personCsvFormData',
      'personToEdit',

      'isCurrentUserAdmin'
    ]),

    deleteText () {
      const person = this.personToDelete
      if (person !== undefined) {
        const personName = `${person.first_name} ${person.last_name}`
        return this.$t('people.delete_text', { personName })
      } else {
        return ''
      }
    }
  },

  methods: {
    ...mapActions([
      'invitePerson',
      'editPerson',
      'newPerson',
      'newPersonAndInvite',
      'loadPeople',
      'peopleSearchChange'
    ]),

    processCSV (data, config) {
      return new Promise((resolve, reject) => {
        Papa.parse(data, {
          config: config,
          error: reject,
          complete: (results) => {
            resolve(results.data)
          }
        })
      })
    },

    cleanUpCsv (data) {
      return data[0].forEach((item, index, data) => {
        data[index] = item[0].toUpperCase() + item.slice(1)
      })
    },

    renderImport (data, mode) {
      this.loading.importing = true
      this.errors.importing = false
      this.formData = data
      if (mode === 'file') {
        data = data.get('file')
      }
      this.processCSV(data)
        .then((results) => {
          this.cleanUpCsv(results)
          this.parsedCSV = results
          this.hideImportModal()
          this.loading.importing = false
          this.showImportRenderModal()
        })
    },

    uploadImportFile (data) {
      const formData = new FormData()
      const filename = 'import.csv'
      const file = new File([data.join('\n')], filename, { type: 'text/csv' })

      formData.append('file', file)

      this.loading.importing = true
      this.errors.importing = false
      this.$store.commit('PERSON_CSV_FILE_SELECTED', formData)

      this.$store.dispatch('uploadPersonFile', (err) => {
        if (!err) {
          this.$store.dispatch('loadPeople')
          this.hideImportRenderModal()
        } else {
          this.loading.importing = false
          this.errors.importing = true
        }
      })
    },

    resetImport () {
      this.errors.importing = false
      this.hideImportRenderModal()
      this.$store.commit('PERSON_CSV_FILE_SELECTED', null)
      this.$refs['import-modal'].reset()
      this.showImportModal()
    },

    addPersonFilter (newFilter) {
    },

    removePersonFilter (newFilter) {
    },

    confirmEditPeople (form) {
      let action = 'editPerson'
      if (this.personToEdit.id === undefined) action = 'newPerson'
      this.loading.edit = true
      this[action](form)
        .then(() => {
          this.$router.push('/people')
          this.loading.edit = false
        })
        .catch(() => {
          this.loading.edit = false
        })
    },

    confirmCreateAndInvite (form) {
      this.loading.createAndInvite = true
      this.newPersonAndInvite(form)
        .then(() => {
          this.loading.createAndInvite = false
          this.$router.push('/people')
        })
        .catch(() => {
          this.loading.createAndInvite = false
        })
    },

    confirmInvite (form) {
      this.loading.invite = true
      this.invitePerson(form)
        .then(() => {
          this.loading.invite = false
          this.success.invite = true
          this.errors.invite = false
        })
        .catch(() => {
          this.loading.invite = false
          this.success.invite = false
          this.errors.invite = true
        })
    },

    confirmDeletePeople () {
      this.$store.dispatch('deletePeople', (err) => {
        if (!err) {
          this.$router.push('/people')
        }
      })
    },

    showDeleteModalIfNeeded (path, personId) {
      if (path.indexOf('delete') > 0) {
        this.$store.dispatch('showPersonDeleteModal', personId)
      } else {
        this.$store.dispatch('hidePersonDeleteModal', personId)
      }
    },

    showEditModalIfNeeded (path, personId) {
      this.errors.invite = false
      this.success.invite = false
      if (path.indexOf('new') > 0) {
        this.$store.dispatch('showPersonEditModal')
      } else if (path.indexOf('edit') > 0) {
        this.$store.dispatch('showPersonEditModal', personId)
      } else {
        this.$store.dispatch('hidePersonEditModal', personId)
      }
    },

    handleModalsDisplay () {
      const path = this.$store.state.route.path
      const personId = this.$store.state.route.params.person_id
      this.showDeleteModalIfNeeded(path, personId)
      this.showEditModalIfNeeded(path, personId)
    },

    onSearchChange () {
      this.peopleSearchChange(this.$refs['people-search-field'].getValue())
    },

    showImportModal () {
      this.modals.importModal = true
    },

    hideImportModal () {
      this.modals.importModal = false
    },

    showImportRenderModal () {
      this.modals.isImportRenderDisplayed = true
    },

    hideImportRenderModal () {
      this.modals.isImportRenderDisplayed = false
    }
  },

  metaInfo () {
    return {
      title: `${this.$t('people.title')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.search {
  margin-top: 2em;
}
</style>
