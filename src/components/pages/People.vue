<template>
  <div class="people page fixed-page">
    <div class="level page-header">
      <div class="level-left">
        <page-title class="flexrow-item" :text="$t('people.title')" />
      </div>

      <div class="level-right">
        <div class="level-item">
          <button-link v-if="isCurrentUserAdmin"
            class="level-item"
            :title="$t('main.csv.import_file')"
            :is-responsive="true"
            icon="upload"
            path="/people/import"
          />
          <button-href-link
            class="level-item"
            :title="$t('main.csv.export_file')"
            icon="download"
            path="/api/export/csv/persons.csv"
          />
          <button-link v-if="isCurrentUserAdmin"
            class="level-item"
            :text="$t('people.new_person')"
            :is-responsive="true"
            icon="plus"
            path="/people/new"
          />
        </div>
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

    <import-modal
      :active="isImportPeopleModalShown"
      :is-loading="isImportPeopleLoading"
      :is-error="isImportPeopleLoadingError"
      :cancel-route="'/people'"
      :form-data="personCsvFormData"
      :columns="csvColumns"
      @fileselected="selectFile"
      @confirm="uploadImportFile"
    />

    <edit-person-modal
      :active="isEditModalShown"
      :is-loading="loading.edit"
      :is-invite-loading="loading.invite"
      :is-create-invite-loading="loading.createAndInvite"
      :is-error="isEditLoadingError"
      :is-invitation-success="success.invite"
      :is-invitation-error="errors.invite"
      :cancel-route="'/people'"
      @confirm="confirmEditPeople"
      @confirm-invite="confirmCreateAndInvite"
      @invite="confirmInvite"
    />

    <delete-modal
      :active="isDeleteModalShown"
      :is-loading="isDeleteLoading"
      :is-error="isDeleteLoadingError"
      :cancel-route="'/people'"
      :text="deleteText"
      :error-text="$t('people.delete_error')"
      @confirm="confirmDeletePeople"
    />

  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import PeopleList from '../lists/PeopleList'
import DeleteModal from '../widgets/DeleteModal'
import EditPersonModal from '../modals/EditPersonModal'
import ImportModal from '../modals/ImportModal'
import ButtonLink from '../widgets/ButtonLink'
import ButtonHrefLink from '../widgets/ButtonHrefLink'
import PageTitle from '../widgets/PageTitle'
import SearchField from '../widgets/SearchField'

export default {
  name: 'people',
  components: {
    PeopleList,
    DeleteModal,
    EditPersonModal,
    ImportModal,
    ButtonLink,
    ButtonHrefLink,
    PageTitle,
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
      success: {
        invite: false
      },
      csvColumns: [
        'First Name',
        'Last Name',
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

    uploadImportFile () {
      this.$store.dispatch('uploadPersonFile', (err) => {
        if (!err) {
          this.$store.dispatch('loadPeople')
          this.$router.push('/people')
        }
      })
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

    selectFile (formData) {
      this.$store.commit('PERSON_CSV_FILE_SELECTED', formData)
    },

    showImportModalIfNeeded (path) {
      if (path.indexOf('import') > 0) {
        this.$store.dispatch('showPersonImportModal')
      } else {
        this.$store.dispatch('hidePersonImportModal')
      }
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
      this.showImportModalIfNeeded(path, personId)
    },

    onSearchChange () {
      this.peopleSearchChange(this.$refs['people-search-field'].getValue())
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
