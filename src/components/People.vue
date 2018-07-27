<template>
  <div class="people page fixed-page">
    <div class="level page-header">
      <div class="level-left">
        <page-title :text="$t('people.title')"></page-title>
      </div>

      <div class="level-right">
        <div class="level-item">
          <button-link v-if="isCurrentUserAdmin"
            class="level-item"
            :text="$t('main.csv.import_file')"
            :is-responsive="true"
            icon="upload"
            path="/people/import"
          />
          <button-href-link
            class="level-item"
            :text="$t('main.csv.export_file')"
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

    <people-list
      :entries="people"
      :is-loading="isPeopleLoading"
      :is-error="isPeopleLoadingError"
    ></people-list>

    <import-modal
      :active="isImportPeopleModalShown"
      :is-loading="isImportPeopleLoading"
      :is-error="isImportPeopleLoadingError"
      :cancel-route="'/people'"
      :form-data="personCsvFormData"
      :columns="csvColumns"
      @fileselected="selectFile"
      @confirm="uploadImportFile"
    >
    </import-modal>

    <edit-person-modal
      :active="isEditModalShown"
      :is-loading="isEditLoading"
      :is-error="isEditLoadingError"
      :cancel-route="'/people'"
      @confirm="confirmEditPeople"
    >
    </edit-person-modal>

    <delete-modal
      :active="isDeleteModalShown"
      :is-loading="isDeleteLoading"
      :is-error="isDeleteLoadingError"
      :cancel-route="'/people'"
      :text="deleteText"
      :error-text="$t('people.delete_error')"
      @confirm="confirmDeletePeople"
    >
    </delete-modal>

  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import PeopleList from './lists/PeopleList'
import DeleteModal from './widgets/DeleteModal'
import EditPersonModal from './modals/EditPersonModal'
import ImportModal from './modals/ImportModal'
import Filters from './widgets/Filters'
import ButtonLink from './widgets/ButtonLink'
import ButtonHrefLink from './widgets/ButtonHrefLink'
import PageTitle from './widgets/PageTitle'

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
    Filters
  },

  data () {
    return {
      choices: [],
      personFilters: [{
        type: 'Situation',
        value: {
          name: 'active'
        }
      }],
      personFilterTypes: [
        'Situation',
        'Skill'
      ],
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
      'people',
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
        return this.$t('people.delete_text', {personName: personName})
      } else {
        return ''
      }
    }
  },

  methods: {
    ...mapActions([
      'loadPeople'
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
      let action = 'editPeople'
      if (this.personToEdit.id === undefined) {
        action = 'newPeople'
      }
      this.$store.dispatch(action, {
        data: form,
        callback: (err) => {
          if (!err) {
            this.$router.push('/people')
          }
        }
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

    changeFilterType (type) {
      if (type === 'Assignee') {
      } else if (type === 'Production') {
        this.choices = this.people
        this.choices = this.productions
      } else {
        this.choices = []
      }
      return this.choices
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
    }
  },

  metaInfo () {
    return {
      title: `${this.$t('people.title')} - Kitsu`
    }
  }
}
</script>

<style scoped>
</style>
