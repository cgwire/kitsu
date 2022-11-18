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

    <div class="flexrow search-options">
      <search-field
        ref="people-search-field"
        class="search flexrow-item"
        :can-save="true"
        @change="onSearchChange"
        @enter="saveSearchQuery"
        @save="saveSearchQuery"
        placeholder="ex: John Doe"
      />
      <button-simple
        class="flexrow-item filter-button"
        :title="$t('entities.build_filter.title')"
        icon="funnel"
        @click="() => modals.isBuildFilterDisplayed = true"
      />
    </div>

    <div class="query-list">
      <search-query-list
        :queries="peopleSearchQueries"
        @change-search="changeSearch"
        @remove-search="removeSearchQuery"
        v-if="!isPeopleLoading"
      />
    </div>

    <people-list
      :entries="displayedPeople"
      :is-loading="isPeopleLoading"
      :is-error="isPeopleLoadingError"
      @edit-clicked="onEditClicked"
      @delete-clicked="onDeleteClicked"
      @change-password-clicked="onChangePasswordClicked"
    />

    <import-render-modal
      :active="modals.isImportRenderDisplayed"
      :is-loading="isImportPeopleLoading"
      :is-error="isImportPeopleLoadingError"
      :parsed-csv="parsedCSV"
      :form-data="personCsvFormData"
      :columns="[...dataMatchers, ...csvColumns, ...optionalCsvColumns]"
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
      :columns="[...dataMatchers, ...csvColumns]"
      :optional-columns="optionalCsvColumns"
      @cancel="hideImportModal"
      @confirm="renderImport"
    />

    <edit-person-modal
      :active="modals.edit"
      :is-create-invite-loading="loading.createAndInvite"
      :is-error="errors.edit"
      :is-invite-loading="loading.invite"
      :is-invitation-success="success.invite"
      :is-invitation-error="errors.invite"
      :is-loading="loading.edit"
      :is-user-limit-error="errors.userLimit"
      :person-to-edit="personToEdit"
      @cancel="modals.edit = false"
      @confirm="confirmEditPeople"
      @confirm-invite="confirmCreateAndInvite"
      @invite="confirmInvite"
    />

    <change-password-modal
      :active="modals.changePassword"
      :person="personToChangePassword"
      @cancel="modals.changePassword = false"
      @confirm="modals.changePassword = false"
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

    <build-people-filter-modal
      ref="build-filter-modal"
      :active="modals.isBuildFilterDisplayed"
      @cancel="modals.isBuildFilterDisplayed = false"
      @confirm="confirmBuildFilter"
    />
  </div>
</template>

<script>

import { mapGetters, mapActions } from 'vuex'

import csv from '@/lib/csv'
import ButtonHrefLink from '@/components/widgets/ButtonHrefLink'
import ButtonSimple from '@/components/widgets/ButtonSimple'
import ChangePasswordModal from '@/components/modals/ChangePasswordModal'
import EditPersonModal from '@/components/modals/EditPersonModal'
import HardDeleteModal from '@/components/modals/HardDeleteModal'
import ImportModal from '@/components/modals/ImportModal'
import ImportRenderModal from '@/components/modals/ImportRenderModal'
import PeopleList from '@/components/lists/PeopleList'
import PageTitle from '@/components/widgets/PageTitle'
import SearchField from '@/components/widgets/SearchField'
import SearchQueryList from '@/components/widgets/SearchQueryList'
import { searchMixin } from '@/components/mixins/search'
import BuildPeopleFilterModal from '@/components/modals/BuildPeopleFilterModal'

export default {
  name: 'people',
  mixins: [searchMixin],
  components: {
    BuildPeopleFilterModal,
    ButtonHrefLink,
    ButtonSimple,
    ChangePasswordModal,
    EditPersonModal,
    HardDeleteModal,
    ImportModal,
    PageTitle,
    PeopleList,
    ImportRenderModal,
    SearchField,
    SearchQueryList
  },

  data () {
    return {
      csvColumns: [
        'First Name',
        'Last Name'
      ],
      optionalCsvColumns: [
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
        changePassword: false,
        importModal: false,
        isImportRenderDisplayed: false,
        isBuildFilterDisplayed: false
      },
      parsedCSV: [],
      personToDelete: {},
      personToEdit: { role: 'user' },
      personToChangePassword: {},
      success: {
        invite: false
      }
    }
  },

  mounted () {
    this.loadPeople(() => {
      this.setSearchFromUrl()
      this.onSearchChange()
    }) // Needed to show department informations
  },

  watch: {
    'modals.edit' () {
      if (this.modals.edit) {
        this.loading.createAndInvite = false
        this.errors.edit = false
        this.errors.invite = false
        this.errors.userLimit = false
        this.loading.edit = false
        this.loading.invite = false
        this.success.invite = false
      }
    }
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

      'peopleSearchQueries',
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
    },

    searchField () {
      return this.$refs['people-search-field']
    }
  },

  methods: {
    ...mapActions([
      'editPerson',
      'deletePeople',
      'invitePerson',
      'loadPeople',
      'loadDepartments',
      'newPerson',
      'newPersonAndInvite',
      'removePeopleSearch',
      'savePeopleSearch',
      'setPeopleSearch',
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
      this.errors.userLimit = false
      this[action](form)
        .then(() => {
          this.loading.edit = false
          this.modals.edit = false
        })
        .catch(err => {
          const isUserLimitReached =
            err.body &&
            err.body.message &&
            err.body.message.indexOf('limit') > 0
          if (isUserLimitReached) {
            this.errors.userLimit = true
          } else {
            this.errors.edit = true
          }
          this.loading.edit = false
        })
    },

    confirmCreateAndInvite (form) {
      this.loading.createAndInvite = true
      this.errors.edit = false
      this.errors.userLimit = false
      this.newPersonAndInvite(form)
        .then(() => {
          this.loading.createAndInvite = false
          this.modals.edit = false
        })
        .catch((err) => {
          const isUserLimitReached =
            err.body &&
            err.body.message &&
            err.body.message.indexOf('limit') > 0
          if (isUserLimitReached) {
            this.errors.userLimit = true
          } else {
            this.errors.edit = true
          }
          this.errors.edit = true
          this.loading.createAndInvite = false
        })
      this.onSearchChange()
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
      this.onSearchChange()
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
      if (!this.searchField) return
      const searchQuery = this.searchField.getValue()
      if (searchQuery.length !== 1) {
        this.setPeopleSearch(searchQuery)
        this.setSearchInUrl()
      }
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

    onChangePasswordClicked (person) {
      this.personToChangePassword = person
      this.modals.changePassword = true
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
    },

    saveSearchQuery (searchQuery) {
      this.savePeopleSearch(searchQuery)
        .catch(console.error)
    },

    removeSearchQuery (searchQuery) {
      this.removePeopleSearch(searchQuery)
        .catch(console.error)
    },

    confirmBuildFilter (query) {
      this.modals.isBuildFilterDisplayed = false
      this.searchField.setValue(query)
      this.onSearchChange()
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
.query-list {
  margin-top: 1.5rem;
}
.search-options {
  align-items: flex-start;
}
.filter-button {
  margin-top: 0.3em;
}
</style>
