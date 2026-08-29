<template>
  <div class="columns fixed-page">
    <div class="column main-column">
      <div class="todos page">
        <div class="filters flexrow mt1">
          <combobox-production
            class="flexrow-item"
            :label="$t('main.production')"
            :production-list="productionList"
            v-model="filters.productionId"
          />

          <combobox
            class="flexrow-item"
            :label="$t('shots.fields.episode')"
            :options="episodeOptions"
            v-model="filters.episodeId"
            v-if="isTVShow && episodes.length > 0"
          />

          <combobox-task-type
            class="flexrow-item selector"
            :label="$t('news.task_type')"
            :task-type-list="taskTypeList"
            v-model="filters.taskTypeId"
          />

          <combobox-status
            class="flexrow-item selector"
            :label="$t('news.task_status')"
            :task-status-list="taskStatusList"
            v-model="filters.taskStatusId"
          />

          <people-field
            class="flexrow-item selector"
            :label="$t('main.person')"
            :people="personList"
            small
            v-model="filters.person"
          />

          <span class="filler"></span>

          <combobox
            class="flexrow-item"
            :label="$t('main.show')"
            :options="filterOptions"
            locale-key-prefix="tasks."
            v-model="filters.currentFilter"
          />

          <combobox
            class="flexrow-item"
            :label="$t('main.sorted_by')"
            :options="sortOptions"
            locale-key-prefix="tasks.fields."
            v-model="filters.currentSort"
          />
        </div>

        <div class="flexrow">
          <h1 class="title mt1 flexrow-item filler">
            {{ stats.total }}
            {{ $t('my_checks.title', { count: stats.total }) }}
          </h1>
          <button-simple
            class="flexrow-item"
            @click="isPlaylist = true"
            :text="buildPlaylistText"
            :title="isMore ? $t('my_checks.build_playlist_loaded_only') : ''"
          />
        </div>

        <to-check-list
          :tasks="tasks"
          :stats="stats"
          :is-loading="isLoading"
          :is-error="isLoadingError"
          :is-more="isMore"
          :is-more-loading="isMoreLoading"
          @more-clicked="loadMore"
        />
      </div>
    </div>

    <div class="column side-column" v-if="nbSelectedTasks === 1">
      <task-info :task="selectedTasks.values().next().value" />
    </div>

    <view-playlist-modal
      active
      :task-ids="tasks.map(task => task.id)"
      @cancel="isPlaylist = false"
      v-if="isPlaylist"
    />
  </div>
</template>

<script setup>
// Imports
import { useHead } from '@unhead/vue'
import moment from 'moment-timezone'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import { sortPeople } from '@/lib/sorting'

import ToCheckList from '@/components/lists/ToCheckList.vue'
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
const route = useRoute()
const router = useRouter()
const store = useStore()

// State
// --------------------------------------------------------------------------
const episodes = ref([])
const filterValues = ref(null)
const isLoading = ref(false)
const isLoadingError = ref(false)
const isMore = ref(false)
const isMoreLoading = ref(false)
const isPlaylist = ref(false)
const page = ref(1)
const stats = ref({ total: 0 })
const tasks = ref([])

const filters = reactive({
  currentFilter: 'all_tasks',
  currentSort: 'priority',
  episodeId: route.query.episode_id || '',
  person:
    store.getters.activePeopleWithoutBot.find(
      person => person.id === route.query.person_id
    ) || null,
  productionId: route.query.project_id || '',
  taskStatusId: route.query.task_status_id || '',
  taskTypeId: route.query.task_type_id || ''
})

const filterOptions = ['all_tasks', 'due_this_week'].map(name => ({
  label: name,
  value: name
}))
const sortOptions = ['entity_name', 'priority', 'due_date', 'estimation'].map(
  name => ({ label: name, value: name })
)

// requests raced by quick filter changes are dropped when stale
let reloadToken = 0

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
const nbSelectedTasks = computed(() => store.getters.nbSelectedTasks)
const openProductions = computed(() => store.getters.openProductions)
const personMap = computed(() => store.getters.personMap)
const productionMap = computed(() => store.getters.productionMap)
const selectedTasks = computed(() => store.getters.selectedTasks)

const addAllValue = list => [
  { id: '', color: '#999', name: t('main.all'), short_name: t('main.all') },
  ...list
]

// while the first filter-values request is in flight, combos fall back to
// the full store lists
const isAvailable = (key, id) =>
  !filterValues.value || filterValues.value[key].has(id)

const productionList = computed(() =>
  addAllValue(
    openProductions.value.filter(production =>
      isAvailable('projectIds', production.id)
    )
  )
)

const taskTypeList = computed(() =>
  addAllValue(
    getProductionTaskTypes
      .value(filters.productionId || null)
      .filter(
        taskType =>
          taskType.for_entity !== 'Concept' &&
          isAvailable('taskTypeIds', taskType.id)
      )
  )
)

const taskStatusList = computed(() =>
  addAllValue(
    getProductionTaskStatuses
      .value(filters.productionId || null)
      .filter(
        status =>
          status.is_feedback_request && isAvailable('taskStatusIds', status.id)
      )
  )
)

const personList = computed(() => {
  const production = productionMap.value.get(filters.productionId)
  const people = production
    ? sortPeople(
        production.team
          .map(personId => personMap.value.get(personId))
          .filter(person => person && !person.is_bot)
      )
    : activePeopleWithoutBot.value
  return people.filter(person => isAvailable('personIds', person.id))
})

const isTVShow = computed(
  () =>
    productionMap.value.get(filters.productionId)?.production_type === 'tvshow'
)

const episodeOptions = computed(() => [
  { label: t('main.all'), value: '' },
  ...episodes.value
    .filter(episode => isAvailable('episodeIds', episode.id))
    .map(episode => ({
      label: episode.name,
      value: episode.id
    }))
])

const buildPlaylistText = computed(() =>
  isMore.value
    ? `${t('tasks.build_playlist')} (${tasks.value.length}/${stats.value.total})`
    : t('tasks.build_playlist')
)

const params = computed(() => {
  const dueThisWeek = filters.currentFilter === 'due_this_week'
  return {
    project_id: filters.productionId,
    episode_id: filters.episodeId,
    task_type_id: filters.taskTypeId,
    task_status_id: filters.taskStatusId,
    person_id: filters.person?.id,
    due_date_since: dueThisWeek
      ? moment().startOf('week').format('YYYY-MM-DD')
      : null,
    due_date_until: dueThisWeek
      ? moment().endOf('week').format('YYYY-MM-DD')
      : null,
    order_by: filters.currentSort
  }
})

// Functions
// --------------------------------------------------------------------------
const syncRouteQuery = () => {
  const query = {}
  if (filters.productionId) query.project_id = filters.productionId
  if (filters.episodeId) query.episode_id = filters.episodeId
  if (filters.taskTypeId) query.task_type_id = filters.taskTypeId
  if (filters.taskStatusId) query.task_status_id = filters.taskStatusId
  if (filters.person?.id) query.person_id = filters.person.id
  router.push({ query })
}

const reload = async () => {
  const token = ++reloadToken
  isLoading.value = true
  isLoadingError.value = false
  page.value = 1
  tasks.value = []
  store.dispatch('clearSelectedTasks')
  syncRouteQuery()
  try {
    const result = await store.dispatch('loadTasksToCheck', params.value)
    if (token !== reloadToken) return
    tasks.value = result.data
    stats.value = result.stats
    isMore.value = result.is_more
    isLoading.value = false
  } catch (error) {
    console.error(error)
    if (token === reloadToken) {
      isLoading.value = false
      isLoadingError.value = true
    }
  }
}

const loadMore = async () => {
  const token = reloadToken
  isMoreLoading.value = true
  try {
    const result = await store.dispatch('loadTasksToCheck', {
      ...params.value,
      page: page.value + 1
    })
    if (token !== reloadToken) return
    page.value += 1
    tasks.value = tasks.value.concat(result.data)
    isMore.value = result.is_more
  } catch (error) {
    console.error(error)
  }
  isMoreLoading.value = false
}

const loadFilterValues = async () => {
  try {
    const result = await store.dispatch('loadTasksToCheckFilterValues')
    filterValues.value = {
      episodeIds: new Set(result.episode_ids),
      personIds: new Set(result.person_ids),
      projectIds: new Set(result.project_ids),
      taskStatusIds: new Set(result.task_status_ids),
      taskTypeIds: new Set(result.task_type_ids)
    }
  } catch (error) {
    console.error(error)
  }
}

const loadEpisodesForProduction = async productionId => {
  episodes.value = []
  const production = productionMap.value.get(productionId)
  if (production?.production_type === 'tvshow') {
    episodes.value = await store.dispatch('loadProductionEpisodes', production)
  }
}

// Watchers
// --------------------------------------------------------------------------
// registered before the deep filters watcher so the episode reset lands in
// the same flush and reload runs once with clean params
watch(
  () => filters.productionId,
  productionId => {
    filters.episodeId = ''
    loadEpisodesForProduction(productionId)
  }
)

watch(filters, () => {
  reload()
})

// Lifecycle
// --------------------------------------------------------------------------
onMounted(() => {
  loadFilterValues()
  if (filters.productionId) {
    loadEpisodesForProduction(filters.productionId)
  }
  reload()
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

// measured on the live row: the Bulma selects are 42px tall while the
// vue-multiselect control stops at 40.6px, and the task-type / status
// combos pad their labels 5px more (status adds a 1px margin on top).
// The centered flexrow turns every difference into a vertical stagger,
// so pin all three metrics to the same values.
.filters {
  :deep(.label) {
    margin-bottom: 5px;
    padding-top: 0;
  }

  :deep(.status-combo) {
    margin-top: 0;
  }

  :deep(.people-field),
  :deep(.multiselect),
  :deep(.multiselect__tags) {
    height: 42px;
    min-height: 42px;
  }
}
</style>
