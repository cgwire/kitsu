<template>
  <div class="people page fixed-page">
    <div class="flexrow mt2 add-people">
      <span class="flexrow-item people-field-label">
        {{ $t('people.add_member_to_team') }}
      </span>
      <people-field
        ref="people-field"
        class="flexrow-item"
        :people="unlistedPeople"
        @enter="addPerson"
        v-model="person"
      />
      <button
        class="button flexrow-item"
        @click="addPerson"
      >
        {{ $t('main.add') }}
      </button>
    </div>

    <production-team-list
      :entries="teamPersons"
      :is-loading="isTeamLoading"
      :is-error="isTeamLoadingError"
      @remove="removePerson"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import { sortPeople } from '../lib/sorting'

import ProductionTeamList from './lists/ProductionTeamList'
import PageTitle from './widgets/PageTitle'
import PeopleField from './widgets/PeopleField'

export default {
  name: 'people',
  components: {
    PageTitle,
    PeopleField,
    ProductionTeamList
  },

  data () {
    return {
      person: null,
      isTeamLoading: false,
      isTeamLoadingError: false
    }
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'productionMap',
      'openProductions',
      'personMap',
      'people'
    ]),

    teamPersons () {
      return sortPeople(this.currentProduction.team
        .map((personId) => this.personMap[personId]))
    },

    unlistedPeople () {
      return this.people.filter((person) => {
        return !this.currentProduction.team.includes(person.id)
      })
    }
  },

  methods: {
    ...mapActions([
      'addPersonToTeam'
    ]),

    addPerson () {
      this.addPersonToTeam(this.person)
      setTimeout(() => {
        this.$refs['people-field'].clear()
      }, 1)
    },

    removePerson (person) {
      this.removePersonFromTeam(person)
    }

  },

  mounted () {
  },

  watch: {
  },

  metaInfo () {
    return {
      title: `${this.currentProduction.name} | ${this.$t('people.team')} - Kitsu`
    }
  }
}
</script>

<style scoped>
.add-people {
  font-size: 1.3em;
}

.people-field-label {
  padding-bottom: 7px;
}
</style>
