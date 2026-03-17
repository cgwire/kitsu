<template>
  <page-layout>
    <template #main>
      <div class="all-tasks">
        <div class="filters flexrow">
          <combobox-production
            class="combobox-production flexrow-item mb0"
            :label="$t('main.production')"
            :production-list="productionList"
            v-model="filters.productionId"
          />
          <combobox-status
            class="flexrow-item mb0"
            :label="$t('news.task_status')"
            :task-status-list="taskStatusList"
            v-model="filters.taskStatusId"
          />
          <combobox-task-type
            class="flexrow-item mb0"
            :label="$t('news.task_type')"
            :task-type-list="taskTypeList"
            v-model="filters.taskTypeId"
          />
        </div>
        <div class="filters flexrow">
          <combobox-studio
            class="flexrow-item"
            all-studios-label
            :label="$t('people.fields.studio')"
            v-model="filters.studioId"
          />
          <combobox-department
            class="flexrow-item"
            all-departments-label
            :label="$t('main.department')"
            v-model="filters.departmentId"
          />
          <people-field
            class="flexrow-item"
            :label="$t('main.person')"
            multiple
            :people="personList"
            v-model="filters.person"
          />
        </div>
        <all-task-list
          :tasks="tasks"
          :stats="stats"
          :is-loading="isLoading"
          :is-error="isLoadingError"
          :is-more="isMore"
          :is-more-loading="isMoreLoading"
          @more-clicked="loadMore"
        />
      </div>
    </template>
    <template #side>
      <task-info :task="selectedTasks.values().next().value">
        <status-stats :stats="statusStats" v-if="!isLoading" />
      </task-info>
    </template>
  </page-layout>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import { sortPeople } from '@/lib/sorting'

import AllTaskList from '@/components/lists/AllTaskList.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import ComboboxProduction from '@/components/widgets/ComboboxProduction.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import ComboboxStatus from '@/components/widgets/ComboboxStatus.vue'
import ComboboxStudio from '@/components/widgets/ComboboxStudio.vue'
import PageLayout from '@/components/layouts/PageLayout.vue'
import PeopleField from '@/components/widgets/PeopleField.vue'
import StatusStats from '@/components/widgets/StatusStats.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'

export default {
  name: 'all-tasks',

  components: {
    AllTaskList,
    ComboboxDepartment,
    ComboboxProduction,
    ComboboxTaskType,
    ComboboxStatus,
    ComboboxStudio,
    PageLayout,
    PeopleField,
    StatusStats,
    TaskInfo
  },

  data() {
    return {
      filters: {
        productionId: null,
        departmentId: null,
        studioId: null,
        taskStatusId: null,
        taskTypeId: null,
        person: null
      },
      isMore: false,
      isMoreLoading: false,
      isLoading: false,
      isLoadingError: false,
      tasks: [],
      stats: {
        status: []
      }
    }
  },

  mounted() {
    const routeQuery = this.$route.query
    if (routeQuery.project_id) {
      this.filters.productionId = routeQuery.project_id
    }
    if (routeQuery.task_status_id) {
      this.filters.taskStatusId = routeQuery.task_status_id
    }
    if (routeQuery.task_type_id) {
      this.filters.taskTypeId = routeQuery.task_type_id
    }
    if (routeQuery.person_id) {
      const personIds = routeQuery.person_id.split(',')
      this.filters.person = this.activePeopleWithoutBot.filter(person =>
        personIds.includes(person.id)
      )
    }
    if (routeQuery.department_id) {
      this.filters.departmentId = routeQuery.department_id
    }
    if (routeQuery.studio_id) {
      this.filters.studioId = routeQuery.studio_id
    }

    this.reload()
  },

  computed: {
    ...mapGetters([
      'activePeopleWithoutBot',
      'getProductionTaskStatuses',
      'getProductionTaskTypes',
      'nbSelectedTasks',
      'openProductions',
      'personMap',
      'productionMap',
      'selectedTasks',
      'taskStatus',
      'taskStatusMap',
      'taskTypes'
    ]),

    taskStatusList() {
      const productionId = this.filters.productionId
      const statuses = this.getProductionTaskStatuses(productionId).filter(
        status => !status.for_concept
      )
      return this.addAllValue(statuses)
    },

    taskTypeList() {
      const productionId = this.filters.productionId
      const types = this.getProductionTaskTypes(productionId).filter(
        type => type.for_entity !== 'Concept'
      )
      return this.addAllValue(types)
    },

    personList() {
      const productionId = this.filters.productionId
      const production = this.productionMap.get(productionId)
      if (production) {
        return sortPeople(
          production.team
            .map(personId => this.personMap.get(personId))
            .filter(person => person && !person.is_bot)
        )
      } else {
        return this.activePeopleWithoutBot
      }
    },

    productionList() {
      return this.addAllValue(this.openProductions)
    },

    params() {
      return {
        project_id: this.filters.productionId,
        task_status_id: this.filters.taskStatusId,
        task_type_id: this.filters.taskTypeId,
        person_id:
          this.filters.person?.map(person => person.id).join(',') || null,
        department_id: this.filters.departmentId,
        studio_id: this.filters.studioId
      }
    },

    statusStats() {
      return [...this.stats.status]
        .sort((a, b) => b.amount - a.amount)
        .map(stat => {
          const taskStatus = this.taskStatusMap.get(stat.task_status_id)
          return {
            name: taskStatus.short_name.toUpperCase(),
            color: taskStatus.color,
            value: stat.amount
          }
        })
    }
  },

  methods: {
    ...mapActions(['clearSelectedTasks', 'loadOpenTasks', 'loadTask']),

    addAllValue(list) {
      return [
        {
          id: '',
          color: '#999',
          name: this.$t('main.all'),
          short_name: this.$t('main.all')
        }
      ].concat([...list])
    },

    async reload() {
      this.isLoading = true
      this.page = 1
      this.clearSelectedTasks()
      this.tasks = []
      try {
        const routeQuery = {}
        Object.keys(this.params).forEach(key => {
          if (this.params[key]) {
            routeQuery[key] = this.params[key]
          }
        })
        this.$router.push({ query: routeQuery })
        const taskInfos = await this.loadOpenTasks(this.params)
        this.tasks = taskInfos.data
        this.stats = taskInfos.stats
        this.isMore = taskInfos.is_more
      } catch (error) {
        this.isLoadingError = true
        console.error(error)
      }
      this.isLoading = false
    },

    loadMore() {
      this.isMoreLoading = true
      this.page = (this.page || 1) + 1
      const params = {
        ...this.params,
        page: this.page
      }
      this.loadOpenTasks(params)
        .then(taskInfos => {
          this.tasks = this.tasks.concat(taskInfos.data)
          this.isMore = taskInfos.is_more
          this.isMoreLoading = false
        })
        .catch(error => {
          this.isMoreLoading = false
          this.isMoreLoadingError = true
          console.error(error)
        })
    }
  },

  watch: {
    filters: {
      handler() {
        this.reload()
      },
      deep: true
    }
  },

  socket: {
    events: {
      'task:update'(eventData) {
        const task = this.tasks.find(t => t.id === eventData.task_id)
        if (task) {
          this.loadTask({ taskId: task.id }).then(updatedTask => {
            Object.assign(task, updatedTask)
          })
        }
      }
    }
  },

  head() {
    return { title: `${this.$t('tasks.all_tasks')} - Kitsu` }
  }
}
</script>

<style lang="scss" scoped>
.all-tasks {
  display: flex;
  flex-direction: column;
  gap: 1em;
  max-height: 100%;
  padding: 5em 1em 1em 1em;
  color: var(--text);
}

.filters {
  align-items: flex-start;
}

.combobox-production {
  padding-top: 7px;
}
</style>
