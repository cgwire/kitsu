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
        <status-stats :stats="statusStatsList" v-if="!isLoading" />
      </task-info>
    </template>
  </page-layout>
</template>

<script setup>
// Imports
import { useHead } from '@unhead/vue'
import {
  computed,
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import { sortPeople } from '@/lib/sorting'

import PageLayout from '@/components/layouts/PageLayout.vue'
import AllTaskList from '@/components/lists/AllTaskList.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import ComboboxProduction from '@/components/widgets/ComboboxProduction.vue'
import ComboboxStatus from '@/components/widgets/ComboboxStatus.vue'
import ComboboxStudio from '@/components/widgets/ComboboxStudio.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import PeopleField from '@/components/widgets/PeopleField.vue'
import StatusStats from '@/components/widgets/StatusStats.vue'

// Composables
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()
const socket = getCurrentInstance().appContext.config.globalProperties.$socket

// State
// --------------------------------------------------------------------------
const isLoading = ref(false)
const isLoadingError = ref(false)
const isMore = ref(false)
const isMoreLoading = ref(false)
const stats = ref({ status: [] })
const tasks = ref([])

// reading the query here instead of in onMounted spares the double reload
// the deep filters watcher used to trigger on pages opened with filters
const filters = reactive({
  departmentId: route.query.department_id || null,
  person: route.query.person_id
    ? store.getters.activePeopleWithoutBot.filter(person =>
        route.query.person_id.split(',').includes(person.id)
      )
    : null,
  productionId: route.query.project_id || null,
  studioId: route.query.studio_id || null,
  taskStatusId: route.query.task_status_id || null,
  taskTypeId: route.query.task_type_id || null
})

let page = 1

// Computed
// --------------------------------------------------------------------------
const activePeopleWithoutBot = computed(
  () => store.getters.activePeopleWithoutBot
)
const getProductionTaskStatuses = computed(
  () => store.getters.getProductionTaskStatuses
)
const getProductionTaskTypes = computed(
  () => store.getters.getProductionTaskTypes
)
const openProductions = computed(() => store.getters.openProductions)
const personMap = computed(() => store.getters.personMap)
const productionMap = computed(() => store.getters.productionMap)
const selectedTasks = computed(() => store.getters.selectedTasks)
const taskStatusMap = computed(() => store.getters.taskStatusMap)

const addAllValue = list => [
  { id: '', color: '#999', name: t('main.all'), short_name: t('main.all') },
  ...list
]

const productionList = computed(() => addAllValue(openProductions.value))

const taskStatusList = computed(() =>
  addAllValue(
    getProductionTaskStatuses
      .value(filters.productionId)
      .filter(status => !status.for_concept)
  )
)

const taskTypeList = computed(() =>
  addAllValue(
    getProductionTaskTypes
      .value(filters.productionId)
      .filter(type => type.for_entity !== 'Concept')
  )
)

const personList = computed(() => {
  const production = productionMap.value.get(filters.productionId)
  if (!production) return activePeopleWithoutBot.value
  return sortPeople(
    production.team
      .map(personId => personMap.value.get(personId))
      .filter(person => person && !person.is_bot)
  )
})

const params = computed(() => ({
  project_id: filters.productionId,
  task_status_id: filters.taskStatusId,
  task_type_id: filters.taskTypeId,
  person_id: filters.person?.map(person => person.id).join(',') || null,
  department_id: filters.departmentId,
  studio_id: filters.studioId
}))

// statusStats would shadow the StatusStats component tag in the template
const statusStatsList = computed(() =>
  [...stats.value.status]
    .sort((a, b) => b.amount - a.amount)
    .map(stat => {
      const taskStatus = taskStatusMap.value.get(stat.task_status_id)
      if (!taskStatus) return null
      return {
        name: taskStatus.short_name.toUpperCase(),
        color: taskStatus.color,
        value: stat.amount
      }
    })
    .filter(Boolean)
)

// Functions
// --------------------------------------------------------------------------
const syncRouteQuery = () => {
  const query = Object.fromEntries(
    Object.entries(params.value).filter(([, value]) => value)
  )
  router.push({ query })
}

const reload = async () => {
  isLoading.value = true
  page = 1
  store.dispatch('clearSelectedTasks')
  tasks.value = []
  syncRouteQuery()
  try {
    const taskInfos = await store.dispatch('loadOpenTasks', params.value)
    tasks.value = taskInfos.data
    stats.value = taskInfos.stats
    isMore.value = taskInfos.is_more
  } catch (error) {
    isLoadingError.value = true
    console.error(error)
  }
  isLoading.value = false
}

const loadMore = async () => {
  isMoreLoading.value = true
  try {
    const taskInfos = await store.dispatch('loadOpenTasks', {
      ...params.value,
      page: page + 1
    })
    page += 1
    tasks.value = tasks.value.concat(taskInfos.data)
    isMore.value = taskInfos.is_more
  } catch (error) {
    console.error(error)
  }
  isMoreLoading.value = false
}

const onTaskUpdate = async eventData => {
  const task = tasks.value.find(({ id }) => id === eventData.task_id)
  if (task) {
    const updatedTask = await store.dispatch('loadTask', { taskId: task.id })
    Object.assign(task, updatedTask)
  }
}

// Watchers
// --------------------------------------------------------------------------
watch(filters, () => {
  reload()
})

// Lifecycle
// --------------------------------------------------------------------------
onMounted(() => {
  socket.on('task:update', onTaskUpdate)
  reload()
})

onBeforeUnmount(() => {
  socket.off('task:update', onTaskUpdate)
})

// Head
// --------------------------------------------------------------------------
useHead({ title: computed(() => `${t('tasks.all_tasks')} - Kitsu`) })
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
