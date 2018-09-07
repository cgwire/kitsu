<template>
  <div class="people page fixed-page">
    <div class="level page-header">
      <div class="level-left">
        <page-title
          class="flexrow-item"
          :text="$t('people.team')"
        />
      </div>
    </div>

    <div class="flexrow mt2 add-people">
      <span class="flexrow-item people-field-label">
        {{ $t('people.add_member_to_team') }}
      </span>
      <people-field
        class="flexrow-item"
        v-model="person"
      />
      <button
        class="button flexrow-item"
        @click="addPerson"
      >
        {{ $t('main.add') }}
      </button>
    </div>

    <people-list
      :entries="teamPersons"
      :is-loading="isTeamLoading"
      :is-error="isTeamLoadingError"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import { sortPeople } from '../lib/sorting'

import PeopleList from './lists/PeopleList'
import PageTitle from './widgets/PageTitle'
import PeopleField from './widgets/PeopleField'

export default {
  name: 'people',
  components: {
    PeopleList,
    PeopleField,
    PageTitle
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
      'personMap'
    ]),

    teamPersons () {
      return sortPeople(this.currentProduction.team
        .map((personId) => this.personMap[personId]))
    }
  },

  methods: {
    ...mapActions([
      'addPersonToTeam',
      'setProduction'
    ]),

    addPerson () {
      this.addPersonToTeam(this.person)
    }
  },

  mounted () {
    const currentProductionId = this.$route.params.production_id
    this.setProduction(currentProductionId)
  },

  watch: {
  },

  metaInfo () {
    return {
      title: `${this.$t('people.team')} - Kitsu`
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
