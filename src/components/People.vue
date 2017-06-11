<template>
  <div class="people page">
    <div class="people-list">
      <h1 class="title">{{ $t("people.title") }}</h1>
      <div class="level">

        <div class="level-left">
          <div class="level-item filters">
            <filters
              :filters="personFilters"
              :addFilter="addPersonFilter"
              :removeFilter="removePersonFilter"
              :changeFilterType="changeFilterType"
              :filterTypes="personFilterTypes"
              :choices="choices"
            ></filters>
          </div>
        </div>

        <div class="level-right">
          <div class="level-item">
            <router-link
              class="button level-item"
              to="/people/import"
            >
              {{ $t("people.csv.import_file") }}
            </router-link>
            <a class="button level-item" href="/api/export/csv/persons.csv">
              {{ $t("people.csv.export_file") }}
            </a>
            <router-link
              class="button level-item"
              to="/people/new"
            >
              {{ $t("people.new_person") }}
            </router-link>
          </div>
        </div>

      </div>
      <people-list
        :entries="people"
        :is-loading="isPeopleLoading"
        :is-error="isPeopleLoadingError"
      ></people-list>
      <p class="has-text-centered nb-persons">
        {{ people.length }} {{ $t("people.persons") }}
      </p>
    </div>

    <import-person-modal
      :active="isImportPeopleModalShown"
      :on-confirm-clicked="confirmImportPeople"
      :cancel-route="'/people'"
      :is-loading="isImportPeopleLoading"
      :is-error="isImportPeopleLoadingError"
      :text="text"
    >
    </import-person-modal>

    <edit-person-modal
      :active="isEditModalShown"
      :on-confirm-clicked="confirmEditPeople"
      :cancel-route="'/people'"
      :is-loading="isEditLoading"
      :is-error="isEditLoadingError"
      :text="text"
    >
    </edit-person-modal>

    <delete-modal
      :active="isDeleteModalShown"
      :on-confirm-clicked="confirmDeletePeople"
      :cancel-route="'/people'"
      :is-loading="isDeleteLoading"
      :is-error="isDeleteLoadingError"
      :text="text"
      :error-text="$t('people.delete_error')"
    >
    </delete-modal>

  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import PeopleList from './lists/PeopleList'
import DeleteModal from './widgets/DeleteModal'
import EditPersonModal from './modals/EditPersonModal'
import ImportPersonModal from './modals/ImportPersonModal'
import Filters from './widgets/Filters.vue'

export default {
  name: 'menu',
  components: {
    PeopleList,
    DeleteModal,
    EditPersonModal,
    ImportPersonModal,
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
      ]
    }
  },

  created () {
    this.$store.dispatch('loadPeople', () => {
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

      'personToDelete',
      'personToEdit'
    ]),
    text () {
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
    ]),

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

    confirmImportPeople () {
      console.log('import')
    },

    confirmDeletePeople () {
      this.$store.dispatch('deletePeople', () => {
        this.$router.push('/people')
      })
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
  }
}
</script>

<style scoped>
.people-list {
  margin-top: 1em;
}

.nb-persons {
  font-style: italic;
}

.filters {
  display: none;
}
</style>
