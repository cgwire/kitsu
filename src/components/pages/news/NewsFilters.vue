<template>
  <div>
    <div class="has-text-right filler filter-button">
      <button-simple
        icon="filter"
        :active="isFiltersDisplayed"
        :title="$t('main.more_filters')"
        @click="toggleFilters"
      />
    </div>

    <div class="filters flexrow">
      <combobox
        class="flexrow-item selector filter-episode"
        :label="$t('shots.fields.episode')"
        :options="runningEpisodeOptions"
        v-model="episodeId"
        v-if="!isStudio && isTVShow"
      />
      <combobox-status
        class="flexrow-item selector nowrap"
        :label="$t('news.task_status')"
        :task-status-list="taskStatusList"
        v-model="taskStatusId"
      />
      <combobox-task-type
        class="flexrow-item selector nowrap"
        :label="$t('news.task_type')"
        :task-type-list="taskTypeList"
        v-model="taskTypeId"
      />
      <div class="flexrow-item selector filter-person">
        <label class="label person-label">
          {{ $t('main.person') }}
        </label>
        <people-field
          class="person-field"
          :people="isStudio ? displayedPeople : team"
          v-model="person"
        />
      </div>
    </div>

    <div class="filters flexrow mt1" v-if="isFiltersDisplayed">
      <date-field
        class="flexrow-item"
        :max-date="today"
        :label="$t('main.from')"
        :with-margin="false"
        v-model="after"
      />
      <date-field
        class="flexrow-item"
        :max-date="today"
        :label="$t('main.to')"
        :with-margin="false"
        v-model="before"
      />
      <combobox
        class="flexrow-item selector"
        :label="$t('news.infos')"
        :options="previewOptions"
        v-model="previewMode"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { useTime } from '@/composables/time'
import { sortByName, sortPeople } from '@/lib/sorting'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxStatus from '@/components/widgets/ComboboxStatus.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import DateField from '@/components/widgets/DateField.vue'
import PeopleField from '@/components/widgets/PeopleField.vue'

const { t } = useI18n()
const store = useStore()
const { today } = useTime()

defineProps({
  isStudio: { type: Boolean, default: false }
})

const episodeId = defineModel('episodeId', { type: String, default: '' })
const taskStatusId = defineModel('taskStatusId', { type: String, default: '' })
const taskTypeId = defineModel('taskTypeId', { type: String, default: '' })
const person = defineModel('person', { type: Object, default: null })
const before = defineModel('before', { default: null })
const after = defineModel('after', { default: null })
const previewMode = defineModel('previewMode', {
  type: String,
  default: 'comments'
})

// State

const isFiltersDisplayed = ref(false)

// Computed

const currentProduction = computed(() => store.getters.currentProduction)
const displayedPeople = computed(() => store.getters.displayedPeople)
const isTVShow = computed(() => store.getters.isTVShow)
const personMap = computed(() => store.getters.personMap)
const productionTaskStatuses = computed(
  () => store.getters.productionTaskStatuses
)
const productionTaskTypes = computed(() => store.getters.productionTaskTypes)
const runningEpisodes = computed(() => store.getters.runningEpisodes)

const previewOptions = computed(() => [
  { label: t('news.only_comments'), value: 'comments' },
  { label: t('news.only_previews'), value: 'previews' }
])

const taskStatusList = computed(() => [
  { id: '', color: '#999', short_name: t('news.all') },
  ...sortByName([...productionTaskStatuses.value])
])

const taskTypeList = computed(() => [
  { id: '', color: '#999', name: t('news.all') },
  ...sortByName([...productionTaskTypes.value])
])

const runningEpisodeOptions = computed(() => [
  { value: 'all', label: t('news.all') },
  ...runningEpisodes.value.map(episode => ({
    label: episode.name,
    value: episode.id
  }))
])

const team = computed(() =>
  sortPeople(
    currentProduction.value?.team
      .map(personId => personMap.value.get(personId))
      .filter(Boolean) ?? []
  )
)

// Functions

const toggleFilters = () => {
  isFiltersDisplayed.value = !isFiltersDisplayed.value
}
</script>

<style lang="scss" scoped>
.selector {
  margin-bottom: 0;
  margin-right: 1em;
}

.person-label {
  margin-top: 5px;
  margin-bottom: 4px;
}

.filter-button {
  color: $grey;
  cursor: pointer;
  float: right;
  text-transform: lowercase;
}

// Mobile: keep only task-status + task-type filters, drop the advanced
// filter toggle and the episode/person fields to fit the narrow width.
@media screen and (max-width: 768px) {
  .filter-button,
  .filter-episode,
  .filter-person {
    display: none;
  }
}
</style>
