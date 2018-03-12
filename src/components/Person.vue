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

    <page-subtitle :text="$t('people.running_tasks')"></page-subtitle>
    <div class="task-tabs tabs">
      <ul>
        <li
          :class="{'is-active': isCurrentActive}"
          @click="selectCurrent"
        >
          <a>
            {{ $t('tasks.current')}}
          </a>
        </li>
        <li
          :class="{'is-active': isDoneActive}"
          @click="selectDone"
        >
          <a>
            {{ $t('tasks.done') }} ({{ displayedPersonDoneTasks.length }})
          </a>
        </li>
      </ul>
    </div>

    <search-field
      :class="{
        'search-field': true,
        'is-hidden': !isCurrentActive
      }"
      ref="person-tasks-search-field"
      @change="onSearchChange"
    >
    </search-field>

    <todos-list
      :entries="displayedPersonTasks"
      :is-loading="isTasksLoading"
      :is-error="isTasksLoadingError"
      :selection-grid="personTaskSelectionGrid"
      v-if="isCurrentActive"
    ></todos-list>

    <todos-list
      :entries="displayedPersonDoneTasks"
      :is-loading="isTasksLoading"
      :is-error="isTasksLoadingError"
      :done="true"
      :selectionGrid="personTaskSelectionGrid"
      v-if="isDoneActive"
    ></todos-list>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import PageTitle from './widgets/PageTitle'
import PageSubtitle from './widgets/PageSubtitle'
import PeopleAvatar from './widgets/PeopleAvatar'
import SearchField from './widgets/SearchField'
import TodosList from './lists/TodosList'

export default {
  name: 'person',
  components: {
    PageTitle,
    PageSubtitle,
    PeopleAvatar,
    SearchField,
    TodosList
  },

  data () {
    return {
      isTasksLoading: false,
      isTasksLoadingError: false,
      person: {},
      activeTab: 'current'
    }
  },

  created () {
    this.loadPerson(this.$route.params.person_id)
  },

  mounted () {
    if (this.personTasksSearchText.length > 0) {
      this.$refs['person-tasks-search-field'].setValue(
        this.personTasksSearchText
      )
    }
    setTimeout(() => {
      if (this.$refs['person-tasks-search-field']) {
        this.$refs['person-tasks-search-field'].focus()
      }
    }, 100)
  },

  computed: {
    ...mapGetters([
      'personMap',
      'displayedPersonTasks',
      'displayedPersonDoneTasks',
      'personTasksSearchText',
      'personTaskSelectionGrid'
    ]),

    isCurrentActive () {
      return this.activeTab === 'current'
    },

    isDoneActive () {
      return this.activeTab === 'done'
    }
  },

  methods: {
    ...mapActions([
      'loadPersonTasks',
      'setPersonTasksSearch'
    ]),

    onSearchChange (text) {
      this.setPersonTasksSearch(text)
    },

    loadPerson (personId) {
      this.person = this.personMap[personId]
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

    selectCurrent () {
      this.activeTab = 'current'
      setTimeout(() => {
        this.$refs['person-tasks-search-field'].focus()
      }, 100)
    },

    selectDone () {
      this.activeTab = 'done'
    }
  },

  metaInfo () {
    return {
      title: this.person ? `${this.person.name} - Kitsu` : '... - Kitsu'
    }
  },

  watch: {
    $route () {
      this.loadPerson(this.$route.params.person_id)
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
