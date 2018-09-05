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

    <div class="flexrow">
      <span class="flexrow-item">
        $t('people.add_member_to_team')
      </span>
      <people-field
        class="flexrow-item"
        v-model="person"
      />
    </div>

    <people-list
      :entries="[]"
      :is-loading="isTeamLoading"
      :is-error="isTeamLoadingError"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
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

  created () {
    /*
    this.loadTeam(() => {
    })
    */
  },

  watch: {
  },

  computed: {
    ...mapGetters([
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
    ])
  },

  metaInfo () {
    return {
      title: `${this.$t('people.team')} - Kitsu`
    }
  }
}
</script>

<style scoped>
.search {
  margin-top: 2em;
}
</style>
