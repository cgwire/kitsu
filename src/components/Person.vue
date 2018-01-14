<template>
  <div class="people page fixed-page">
    <div class="flexrow page-header">
      <div class="flexrow-item">
        <people-avatar
          :person="person"
          :size="80"
          :font-size="30"
          :is-link="false"
        ></people-avatar>
      </div>
      <div class="flexrow-item">
        <page-title :text="person ? person.name : ''"></page-title>
      </div>
    </div>

    <div class="page-header">
    <page-subtitle :text="$t('people.running_tasks')"></page-subtitle>
    </div>
    <todos-list
      :entries="personTasks"
      :is-loading="isTasksLoading"
      :is-error="isTasksLoadingError"
    ></todos-list>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import PageTitle from './widgets/PageTitle'
import PageSubtitle from './widgets/PageSubtitle'
import PeopleAvatar from './widgets/PeopleAvatar'
import TodosList from './lists/TodosList'

export default {
  name: 'person',
  components: {
    PageTitle,
    PageSubtitle,
    PeopleAvatar,
    TodosList
  },

  data () {
    return {
      isTasksLoading: false,
      isTasksLoadingError: false,
      person: {}
    }
  },

  created () {
    this.person = this.personMap[this.$route.params.person_id]
    this.isTasksLoading = true
    this.loadPersonTasks({
      personId: this.person.id,
      callback: (err) => {
        if (err) console.log(err)
        this.isTasksLoading = false
        this.isTasksLoadingError = false
      }
    })
  },

  watch: {
    '$route' (to, from) {
      console.log('route changed')
    }
  },

  computed: {
    ...mapGetters([
      'personMap',
      'personTasks'
    ])
  },

  methods: {
    ...mapActions([
      'loadPersonTasks'
    ])
  },

  metaInfo () {
    return {
      title: this.person ? `${this.person.name} - Kitsu` : '... - Kitsu'
    }
  }
}
</script>

<style scoped>
.name {
  width: 230px;
  min-width: 230px;
}
.email {
  width: 210px;
  min-width: 210px;
}
.phone {
  width: 140px;
  min-width: 140px;
}
.skills {
  width: 250px;
}
</style>
