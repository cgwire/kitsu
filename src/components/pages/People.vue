<template>
  <div class="people page fixed-page">
    <div class="flexrow page-header">
      <page-title class="flexrow-item filler" :text="$t('people.title')" />

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
      <button-simple
        class="flexrow-item"
        :text="$t('people.new_person')"
        :is-responsive="true"
        icon="plus"
        @click="onNewClicked"
        v-if="isCurrentUserAdmin"
      />
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
      @edit-clicked="onEditClicked"
      @delete-clicked="onDeleteClicked"
    />

    <import-render-modal
      :active="modals.isImportRenderDisplayed"
      :is-loading="isImportPeopleLoading"
      :is-error="isImportPeopleLoadingError"
      :parsed-csv="parsedCSV"
      :form-data="personCsvFormData"
      :columns="csvColumns"
      :dataMatchers="dataMatchers"
      :database="filteredPeople"
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
      :active="modals.edit"
      :is-loading="loading.edit"
      :is-invite-loading="loading.invite"
      :is-create-invite-loading="loading.createAndInvite"
      :is-error="errors.edit"
      :is-invitation-success="success.invite"
      :is-invitation-error="errors.invite"
      :person-to-edit="personToEdit"
      @cancel="modals.edit = false"
      @confirm="confirmEditPeople"
      @confirm-invite="confirmCreateAndInvite"
      @invite="confirmInvite"
    />

    <hard-delete-modal
      :active="modals.del"
      :error-text="$t('people.delete_error')"
      :is-loading="loading.del"
      :is-error="errors.del"
      :lock-text="personToDelete ? personToDelete.full_name : ''"
      :text="deleteText"
      @cancel="modals.del = false"
      @confirm="confirmDeletePeople"
    />

  </div>
</template>

<script>

import { mapGetters, mapActions } from 'vuex'

import csv from '../../lib/csv'
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
      csvColumns: [
        'First Name',
        'Last Name',
        'Email',
        'Phone',
        'Role'
      ],
      dataMatchers: [
        'Email'
      ],
      errors: {
        del: false,
        edit: false,
        invite: false
      },
      loading: {
        createAndInvite: false,
        edit: false,
        del: false,
        invite: false
      },
      modals: {
        edit: false,
        del: false,
        importModal: false,
        isImportRenderDisplayed: false
      },
      parsedCSV: [],
      personToDelete: {},
      personToEdit: { role: 'user' },
      success: {
        invite: false
      }
    }
  },

  created () {
    this.loadPeople()
  },

  watch: {
  },

  computed: {
    ...mapGetters([
      'displayedPeople',
      'isCurrentUserAdmin',

      'isPeopleLoading',
      'isPeopleLoadingError',

      'isImportPeopleModalShown',
      'isImportPeopleLoading',
      'isImportPeopleLoadingError',

      'isImportModalShown',
      'isImportLoading',
      'isImportLoadingError',

      'personCsvFormData'
    ]),

    deleteText () {
      const person = this.personToDelete
      if (person !== undefined) {
        const personName = `${person.first_name} ${person.last_name}`
        return this.$t('people.delete_text', { personName })
      } else {
        return ''
      }
    },

    filteredPeople () {
      const persons = {}
      this.displayedPeople.forEach(person => {
        const personKey = person.email
        persons[personKey] = true
      })
      return persons
    }
  },

  methods: {
    ...mapActions([
      'editPerson',
      'deletePeople',
      'invitePerson',
      'loadPeople',
      'newPerson',
      'newPersonAndInvite',
      'peopleSearchChange',
      'uploadPersonFile'
    ]),

    renderImport (data, mode) {
      this.loading.importing = true
      this.errors.importing = false
      this.formData = data
      if (mode === 'file') {
        data = data.get('file')
      }
      csv.processCSV(data)
        .then((results) => {
          this.parsedCSV = results
          this.hideImportModal()
          this.loading.importing = false
          this.showImportRenderModal()
        })
    },

    uploadImportFile (data, toUpdate) {
      const formData = new FormData()
      const filename = 'import.csv'
      const file = new File([data.join('\n')], filename, { type: 'text/csv' })

      formData.append('file', file)

      this.loading.importing = true
      this.errors.importing = false
      this.$store.commit('PERSON_CSV_FILE_SELECTED', formData)

      this.uploadPersonFile(toUpdate)
        .then(() => {
          this.$store.dispatch('loadPeople')
          this.hideImportRenderModal()
        })
        .catch((err) => {
          console.error(err)
          this.loading.importing = false
          this.errors.importing = true
        })
    },

    resetImport () {
      this.errors.importing = false
      this.hideImportRenderModal()
      this.$store.commit('PERSON_CSV_FILE_SELECTED', null)
      this.$refs['import-modal'].reset()
      this.showImportModal()
    },

    confirmEditPeople (form) {
      let action = 'editPerson'
      if (this.personToEdit.id === undefined) action = 'newPerson'
      else form.id = this.personToEdit.id
      this.loading.edit = true
      this.errors.edit = false
      this[action](form)
        .then(() => {
          this.loading.edit = false
          this.modals.edit = false
        })
        .catch((err) => {
          console.error(err)
          this.errors.edit = true
          this.loading.edit = false
        })
    },

    confirmCreateAndInvite (form) {
      this.loading.createAndInvite = true
      this.errors.edit = false
      this.newPersonAndInvite(form)
        .then(() => {
          this.loading.createAndInvite = false
          this.modals.edit = false
        })
        .catch((err) => {
          console.error(err)
          this.errors.edit = true
          this.loading.createAndInvite = false
        })
    },

    confirmInvite (form) {
      form.id = this.personToEdit.id
      this.loading.invite = true
      this.errors.invite = false
      this.invitePerson(form)
        .then(() => {
          this.loading.invite = false
          this.success.invite = true
        })
        .catch((err) => {
          console.error(err)
          this.loading.invite = false
          this.success.invite = false
          this.errors.invite = true
        })
    },

    confirmDeletePeople () {
      this.loading.del = true
      this.errors.del = false
      this.deletePeople(this.personToDelete)
        .then(() => {
          this.loading.del = false
          this.modals.del = false
        })
        .catch((err) => {
          console.error(err)
          this.loading.del = false
          this.errors.del = true
        })
    },

    onSearchChange () {
      this.peopleSearchChange(this.$refs['people-search-field'].getValue())
    },

    onDeleteClicked (person) {
      this.personToDelete = person
      this.modals.del = true
    },

    onEditClicked (person) {
      this.errors.invite = false
      this.success.invite = false
      this.personToEdit = person
      this.modals.edit = true
    },

    onNewClicked () {
      this.errors.invite = false
      this.success.invite = false
      this.personToEdit = { role: 'user' }
      this.modals.edit = true
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
