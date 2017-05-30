<template>
  <div class="people page">
    <div class="people-list">
      <h1 class="title">People</h1>
      <div class="level">
        <div class="level-left">
          <div class="level-item">
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
            <button class="button level-item">
              Import a .csv file
            </button>
            <button class="button level-item">
              Export as a .csv file
            </button>
            <button class="button level-item">
              Add a new employee
            </button>
          </div>
        </div>
      </div>
      <people-list
        :entries="people"
        :is-loading="isPeopleLoading"
        :is-error="isPeopleLoadingError"
        :on-edit-clicked="editPeople"
      ></people-list>
      <p class="has-text-centered nb-persons">
        {{ people.length }} persons
      </p>
    </div>
    <delete-modal
      :active="isDeleteModalShown"
      :text="text"
      :on-confirm-clicked="confirmDeletePeople"
      :cancel-route="'/people'"
      :is-loading="isDeleteLoading"
      :is-error="isDeleteLoadingError"
      :error-text="'An error occured while deleting this person. There are probably data linked to it. Are you sure this person has no assignation or wrote no comment?'" >
    </delete-modal>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import PeopleList from './lists/PeopleList'
import DeleteModal from './widgets/DeleteModal'
import Filters from './widgets/Filters.vue'

export default {
  name: 'menu',
  components: {
    PeopleList,
    DeleteModal,
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
      const path = this.$store.state.route.path
      const personId = this.$store.state.route.params
      if (path.indexOf('delete') > 0) {
        this.$store.dispatch('showPersonDeleteModal', personId)
      }
    })
  },
  watch: {
    '$route' (to, from) {
      const path = this.$store.state.route.path
      const personId = this.$store.state.route.params
      if (path.indexOf('delete') > 0) {
        this.$store.dispatch('showPersonDeleteModal', personId)
      } else {
        this.$store.dispatch('hidePersonDeleteModal', personId)
      }
    }
  },
  computed: {
    ...mapGetters([
      'people',
      'isPeopleLoading',
      'isPeopleLoadingError',
      'isDeleteModalShown',
      'isDeleteLoading',
      'isDeleteLoadingError',
      'personToDelete'
    ]),
    text () {
      const person = this.personToDelete
      if (person !== undefined) {
        const personName = `${person.first_name} ${person.last_name}`
        return `Are you sure you want to remove ${personName} from ` +
               `your database ?`
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
    editPeople () {
      console.log('edit')
    },
    confirmDeletePeople () {
      this.$store.dispatch('deletePeople', () => {
        this.$store.push('/people')
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
</style>
