<template>
  <div class="columns fixed-page">
    <div class="column main-column">
      <div class="todos page">
        <div class="flexrow">
          <combobox-production
            class="flexrow-item"
            :label="$t('main.production')"
            :production-list="productionList"
            v-model="productionId"
            v-if="productionList.length > 0"
          />

          <combobox
            class="flexrow-item"
            :label="$t('shots.fields.episode')"
            :options="episodeOptions"
            v-model="episodeId"
            v-show="productionId"
            v-if="episodeOptions.length > 0"
          />

          <combobox-task-type
            class="flexrow-item selector"
            :label="$t('news.task_type')"
            :task-type-list="taskTypeList"
            v-model="taskTypeId"
            v-if="taskTypeList.length > 0"
          />

          <combobox-status
            class="flexrow-item selector"
            :label="$t('news.task_status')"
            :task-status-list="taskStatusList"
            v-model="taskStatusId"
          />

          <div class="field flexrow-item selector">
            <label class="label person-label">
              {{ $t('main.person') }}
            </label>
            <people-field :people="assignees" small v-model="person" />
          </div>

          <span class="filler"></span>

          <combobox
            class="flexrow-item"
            :label="$t('main.show')"
            :options="filterOptions"
            locale-key-prefix="tasks."
            v-model="currentFilter"
          />

          <combobox
            class="flexrow-item"
            :label="$t('main.sorted_by')"
            :options="sortOptions"
            locale-key-prefix="tasks.fields."
            v-model="currentSort"
          />
        </div>

        <div class="flexrow">
          <h1 class="title mt1 flexrow-item filler">
            {{ nbTasksToCheck }}
            {{ $t('my_checks.title', { count: nbTasksToCheck }) }}
          </h1>
          <button-simple
            class="flexrow-item"
            @click="isPlaylist = true"
            :text="$t('tasks.build_playlist')"
          />
        </div>

        <todos-list
          :tasks="sortedTasks"
          :is-loading="isLoading"
          :is-error="isLoadingError"
          :selection-grid="selectionGrid"
          is-to-check
        />
      </div>
    </div>

    <div class="column side-column" v-if="nbSelectedTasks === 1">
      <task-info :task="selectedTasks.values().next().value" />
    </div>

    <view-playlist-modal
      active
      :task-ids="sortedTasks.map(task => task.id)"
      @cancel="isPlaylist = false"
      v-if="isPlaylist"
    />
  </div>
</template>

<script setup>
// Imports
import { useHead } from '@unhead/vue'
import moment from 'moment-timezone'
import { firstBy } from 'thenby'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { populateTask } from '@/lib/models'
import { buildSelectionGrid } from '@/lib/selection'
import { sortByName, sortPeople } from '@/lib/sorting'
import { parseDate } from '@/lib/time'

import TodosList from '@/components/lists/TodosList.vue'
import ViewPlaylistModal from '@/components/modals/ViewPlaylistModal.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxProduction from '@/components/widgets/ComboboxProduction.vue'
import ComboboxStatus from '@/components/widgets/ComboboxStatus.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import PeopleField from '@/components/widgets/PeopleField.vue'

// Composables
const { t } = useI18n()
const store = useStore()

// State
// --------------------------------------------------------------------------
const currentFilter = ref('all_tasks')
const currentSort = ref('priority')
const episodeId = ref('')
const isLoading = ref(false)
const isLoadingError = ref(false)
const isPlaylist = ref(false)
const person = ref({})
const productionId = ref('')
const productionList = ref([])
const selectionGrid = ref(buildSelectionGrid())
const taskStatusId = ref('')
const taskStatusList = ref([])
const taskTypeId = ref('')
const taskTypeList = ref([])
const tasksToCheck = ref([])

const filterOptions = ['all_tasks', 'due_this_week'].map(name => ({
  label: name,
  value: name
}))
const sortOptions = [
  'entity_name',
  'priority',
  'due_date',
  'estimation',
  'last_comment_date'
].map(name => ({ label: name, value: name }))

// Computed
// --------------------------------------------------------------------------
const nbSelectedTasks = computed(() => store.getters.nbSelectedTasks)
const personMap = computed(() => store.getters.personMap)
const productionMap = computed(() => store.getters.productionMap)
const selectedTasks = computed(() => store.getters.selectedTasks)
const taskStatusMap = computed(() => store.getters.taskStatusMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

const assignees = computed(() => {
  const personIds = [
    ...new Set(tasksToCheck.value.flatMap(task => task.assignees))
  ]
  return sortPeople(
    personIds.map(personId => personMap.value.get(personId)).filter(Boolean)
  )
})

const episodeOptions = computed(() => {
  if (!productionId.value) return []
  const production = productionMap.value.get(productionId.value)
  if (production?.production_type !== 'tvshow') return []
  const episodes = new Map(
    tasksToCheck.value
      .filter(
        task =>
          task.project_id === productionId.value &&
          task.episode_id &&
          task.entity_type_name === 'Shot'
      )
      .map(task => [
        task.episode_id,
        { label: task.episode_name, value: task.episode_id }
      ])
  )
  const options = [...episodes.values()].sort((a, b) =>
    a.label.localeCompare(b.label, undefined, { numeric: true })
  )
  return [{ label: t('main.all'), value: 'all' }, ...options]
})

const filteredTasks = computed(() =>
  tasksToCheck.value.filter(
    task =>
      (currentFilter.value === 'all_tasks' ||
        moment().startOf('week').isSame(parseDate(task.due_date), 'week')) &&
      (!productionId.value || task.project_id === productionId.value) &&
      (!taskTypeId.value || task.task_type_id === taskTypeId.value) &&
      (!taskStatusId.value || task.task_status_id === taskStatusId.value) &&
      (!person.value?.id || task.assignees.includes(person.value.id)) &&
      (!productionId.value ||
        !episodeId.value ||
        episodeId.value === 'all' ||
        task.episode_id === episodeId.value)
  )
)

const byDueDate = (a, b) => {
  if (!a.due_date) return 1
  if (!b.due_date) return -1
  return a.due_date.localeCompare(b.due_date)
}

const thenByNames = comparator =>
  comparator
    .thenBy('project_name')
    .thenBy('task_type_name')
    .thenBy('entity_name')

const sortedTasks = computed(() => {
  const tasks = [...filteredTasks.value]
  if (currentSort.value === 'entity_name') {
    return tasks.sort(
      firstBy('project_name')
        .thenBy('task_type_name')
        .thenBy('full_entity_name')
    )
  }
  if (currentSort.value === 'priority') {
    return tasks.sort(thenByNames(firstBy('priority', -1).thenBy(byDueDate)))
  }
  if (currentSort.value === 'due_date') {
    return tasks.sort(thenByNames(firstBy(byDueDate)))
  }
  return tasks.sort(thenByNames(firstBy(currentSort.value, -1)))
})

const nbTasksToCheck = computed(
  () =>
    sortedTasks.value.filter(
      task => taskStatusMap.value.get(task.task_status_id)?.is_feedback_request
    ).length
)

// Functions
// --------------------------------------------------------------------------
const taskEntities = (tasks, idField, entityMap) => {
  const entities = new Map(
    tasks
      .map(task => [task[idField], entityMap.get(task[idField])])
      .filter(([, entity]) => entity)
  )
  return sortByName([...entities.values()])
}

const resetFilterLists = tasks => {
  productionList.value = [
    { id: '', name: t('main.all') },
    ...taskEntities(tasks, 'project_id', productionMap.value)
  ]
  taskTypeList.value = [
    { id: '', color: '#999', name: t('news.all') },
    ...taskEntities(tasks, 'task_type_id', taskTypeMap.value)
  ]
  taskStatusList.value = [
    { id: '', color: '#999', name: t('news.all'), short_name: t('news.all') },
    ...taskEntities(tasks, 'task_status_id', taskStatusMap.value)
  ]
}

// Watchers
// --------------------------------------------------------------------------
watch(productionId, () => {
  episodeId.value = ''
})

watch(nbSelectedTasks, () => {
  if (nbSelectedTasks.value === 0) {
    selectionGrid.value = buildSelectionGrid()
  }
})

// Lifecycle
// --------------------------------------------------------------------------
onMounted(async () => {
  isLoading.value = true
  store.dispatch('clearSelectedTasks')
  try {
    const tasks = await store.dispatch('loadTasksToCheck')
    if (tasks) {
      tasks.forEach(populateTask)
      selectionGrid.value = buildSelectionGrid()
      resetFilterLists(tasks)
      tasksToCheck.value = tasks
      isLoading.value = false
    }
  } catch (err) {
    console.error(err)
  }
})

// Head
// --------------------------------------------------------------------------
useHead({ title: computed(() => `${t('tasks.my_checks')} - Kitsu`) })
</script>

<style lang="scss" scoped>
.data-list {
  margin-top: 0;
}

.todos {
  display: flex;
  flex-direction: column;
}

.columns {
  display: flex;
  flex-direction: row;
  padding: 0;
}

.column {
  overflow-y: auto;
  padding: 0;
}

.field {
  margin-bottom: 0;
}
</style>
