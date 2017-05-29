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
        v-bind:entries="people"
        v-bind:is-loading="isPeopleLoading"
        v-bind:is-error="isPeopleLoadingError"
      ></people-list>
      <p class="has-text-centered nb-persons">
        {{ people.length }} persons
      </p>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import PeopleList from './lists/PeopleList'
import Filters from './widgets/Filters.vue'

export default {
  name: 'menu',
  components: {
    PeopleList,
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
    this.$store.dispatch('loadPeople')
  },
  computed: {
    ...mapGetters([
      'people',
      'isPeopleLoading',
      'isPeopleLoadingError'
    ])
  },
  methods: {
    ...mapActions([
    ]),
    addPersonFilter (newFilter) {
    },
    removePersonFilter (newFilter) {
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
