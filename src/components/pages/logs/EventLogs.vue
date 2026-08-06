<template>
  <div class="mt1">
    <div class="flexrow filters">
      <date-field
        class="flexrow-item"
        :can-delete="false"
        :label="$t('logs.date_range_label')"
        :max-date="today"
        :placeholder="$t('logs.date_range_placeholder')"
        range
        v-model="dateRange"
        @change="onDateRangeChange"
      />
      <people-field
        class="flexrow-item field"
        multiple
        search-email
        :label="$t('logs.people_label')"
        :people="people"
        :placeholder="$t('logs.people_placeholder')"
        v-model="selectedPeople"
        @select="onPeopleSelect"
      />
      <combobox-production
        class="flexrow-item"
        :label="$t('main.production')"
        :production-list="productionList"
        v-model="selectedProductionId"
        @update:model-value="onProductionChange"
      />
      <multiselect-field
        class="flexrow-item"
        :label="$t('logs.object_label')"
        :options="objectOptions"
        :placeholder="$t('logs.object_placeholder')"
        v-model="selectedObjects"
        @update:model-value="onObjectsChange"
      />
      <multiselect-field
        class="flexrow-item"
        :label="$t('logs.action_label')"
        :options="actionOptions"
        :placeholder="$t('logs.action_placeholder')"
        v-model="selectedActions"
        @update:model-value="onActionsChange"
      />
      <checkbox
        class="flexrow-item mt2"
        :label="$t('logs.only_files')"
        toggle
        v-model="onlyFiles"
        @change="onOnlyFilesChange"
      />
      <span class="filler"></span>
      <button-simple
        class="flexrow-item small mt2"
        icon="refresh"
        :is-loading="loading.events"
        :title="$t('main.reload')"
        @click="loadEvents"
      />
      <button-simple
        class="flexrow-item small mt2"
        :disabled="!events.length"
        icon="download"
        :title="$t('main.csv.export_file')"
        @click="exportCsv"
      />
    </div>

    <div class="has-text-centered" v-if="loading.events">
      <spinner />
    </div>
    <div class="mt2 empty" v-else-if="!events.length">
      {{ $t('logs.empty_list') }}
    </div>
    <div class="log-list" v-else>
      <div class="event-count">
        {{ $t('logs.nb_events', { count: events.length }) }}
      </div>
      <div
        class="event-line"
        :key="event.id"
        role="button"
        tabindex="0"
        @click="selectLine(event)"
        @keydown.enter.prevent="selectLine(event)"
        v-for="event in events"
      >
        <span class="date tag mr1">{{ event.date }}</span>
        <span class="type tag mr1" :data-status="event.shortType">
          {{ event.type }}
        </span>
        <span class="name tag mr1">{{ event.name }}</span>
        <span class="production tag mr1" v-if="event.production">
          {{ event.production.name }}
        </span>
        <ul v-if="selectedEvents[event.id]" @click.stop>
          <li class="flexrow">
            <span class="key">user</span>
            <people-avatar
              class="flexrow-item"
              :size="20"
              :font-size="10"
              :person="event.person"
              v-if="event.user_id"
            />
            <people-name
              class="flexrow-item"
              :person="event.person"
              with-link
              v-if="event.user_id"
            />
          </li>
          <li
            :key="`${event.id}-${key}`"
            v-for="key in Object.keys(event.data).sort()"
          >
            <span class="key">{{ key }}</span>
            <a :href="getLink(event, key)" v-if="isLink(event, key)">
              {{ event.data[key] }}
            </a>
            <template v-else>{{ event.data[key] }}</template>
          </li>
        </ul>
      </div>
      <div class="has-text-centered mt1" v-if="hasMoreEvents">
        <button-simple
          :is-loading="loading.moreEvents"
          :text="$t('main.load_more')"
          @click="loadMoreEvents"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useHead } from '@unhead/vue'
import moment from 'moment'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import { useTime } from '@/composables/time'
import csv from '@/lib/csv'
import {
  formatFullDateWithRevertedTimezone,
  formatSimpleDate,
  parseSimpleDate
} from '@/lib/time'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Checkbox from '@/components/widgets/Checkbox.vue'
import ComboboxProduction from '@/components/widgets/ComboboxProduction.vue'
import DateField from '@/components/widgets/DateField.vue'
import MultiselectField from '@/components/widgets/MultiselectField.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import PeopleField from '@/components/widgets/PeopleField.vue'
import PeopleName from '@/components/widgets/PeopleName.vue'
import Spinner from '@/components/widgets/Spinner.vue'

const PAGE_SIZE = 1000

// Keys of the event data payload that point at an entity having a detail
// route. The value is the production sub-path used to build the URL. Keys
// without such a route (comment_id, preview_file_id, concept_id) are left
// out on purpose: they would produce dead links.
const ENTITY_LINK_KEYS = {
  asset_id: 'assets',
  shot_id: 'shots',
  sequence_id: 'sequences',
  episode_id: 'episodes',
  edit_id: 'edits'
}

const { t } = useI18n()
const { today, timezone, formatDate } = useTime()
const route = useRoute()
const router = useRouter()
const store = useStore()

// State

const dateRange = ref(null)
const events = ref([])
const eventNames = ref([])
const hasMoreEvents = ref(false)
const onlyFiles = ref(false)
const selectedActions = ref([])
const selectedEvents = ref({})
const selectedObjects = ref([])
const selectedPeople = ref([])
const selectedProductionId = ref('')
const loading = reactive({ events: false, moreEvents: false })

// Functions

const asArray = value => {
  if (value === undefined || value === null) return []
  return Array.isArray(value) ? value : [value]
}

// Computed

const people = computed(() => store.getters.people)
const personMap = computed(() => store.getters.personMap)
const productionMap = computed(() => store.getters.productionMap)

const productionList = computed(() => [
  { id: '', color: '#999', name: t('main.all'), short_name: t('main.all') },
  ...store.getters.productions
])

const objectOptions = computed(() => {
  const objects = eventNames.value.map(name => name.split(':')[0])
  return [...new Set(objects)].sort()
})

const actionOptions = computed(() => {
  const actions = eventNames.value.map(name => name.split(':')[1])
  return [...new Set(actions.filter(Boolean))].sort()
})

// Read from the route rather than from the widget models: the person map
// may still be loading, and an unresolved id must not silently drop the
// filter the URL asked for.
const queryParams = computed(() => {
  const params = {
    limit: PAGE_SIZE,
    personIds: asArray(route.query.person_ids),
    namePrefixes: selectedObjects.value,
    nameSuffixes: selectedActions.value,
    onlyFiles: onlyFiles.value
  }
  if (selectedProductionId.value) {
    params.projectId = selectedProductionId.value
  }
  if (dateRange.value) {
    const [start, end] = dateRange.value
    // The range is inclusive on both ends, so the upper bound is the day
    // after the last selected day.
    params.after = formatFullDateWithRevertedTimezone(
      moment(start),
      timezone.value
    )
    params.before = formatFullDateWithRevertedTimezone(
      moment(end).add(1, 'days'),
      timezone.value
    )
  }
  return params
})

// Functions

const pushQuery = changes => {
  const query = { ...route.query, ...changes }
  Object.keys(query).forEach(key => {
    const value = query[key]
    if (value === undefined || value === '' || value?.length === 0) {
      delete query[key]
    }
  })
  router.push({ query })
}

const onDateRangeChange = value => {
  pushQuery({
    after: value ? formatSimpleDate(value[0]) : undefined,
    before: value ? formatSimpleDate(value[1]) : undefined
  })
}

const onPeopleSelect = selection => {
  pushQuery({ person_ids: (selection ?? []).map(person => person.id) })
}

const onProductionChange = productionId => {
  pushQuery({ project_id: productionId })
}

const onObjectsChange = objects => {
  pushQuery({ objects })
}

const onActionsChange = actions => {
  pushQuery({ actions })
}

const onOnlyFilesChange = () => {
  pushQuery({ only_files: onlyFiles.value ? 'true' : undefined })
}

const resolvePeopleFromQuery = () => {
  selectedPeople.value = asArray(route.query.person_ids)
    .map(personId => personMap.value.get(personId))
    .filter(Boolean)
}

const formatEvents = rawEvents => {
  return rawEvents.map(event => {
    const [name, type] = event.name.split(':')
    return {
      id: event.id,
      date: formatDate(event.created_at),
      data: event.data ?? {},
      name,
      shortType: type.substring(0, 3),
      type,
      user_id: event.user_id,
      person: personMap.value.get(event.user_id),
      project_id: event.project_id,
      production: productionMap.value.get(event.project_id)
    }
  })
}

const loadEvents = async () => {
  selectedEvents.value = {}
  events.value = []
  loading.events = true
  try {
    const result = await store.dispatch('loadEvents', queryParams.value)
    events.value = formatEvents(result)
    hasMoreEvents.value = result.length >= PAGE_SIZE
  } catch (err) {
    console.error(err)
  } finally {
    loading.events = false
  }
}

const loadMoreEvents = async () => {
  if (!events.value.length) return

  loading.moreEvents = true
  const lastEventId = events.value[events.value.length - 1].id
  try {
    const result = await store.dispatch('loadEvents', {
      ...queryParams.value,
      lastEventId
    })
    events.value = [...events.value, ...formatEvents(result)]
    hasMoreEvents.value = result.length >= PAGE_SIZE
  } catch (err) {
    console.error(err)
  } finally {
    loading.moreEvents = false
  }
}

const loadEventNames = async () => {
  try {
    eventNames.value = await store.dispatch('loadEventNames')
  } catch (err) {
    console.error(err)
  }
}

const loadProductions = async () => {
  try {
    await store.dispatch('loadProductions')
  } catch (err) {
    console.error(err)
  }
}

const selectLine = event => {
  selectedEvents.value[event.id] = !selectedEvents.value[event.id]
}

const getProductionId = event => event.project_id ?? event.data.project_id

const isLink = (event, key) => {
  if (key === 'person_id') return true
  if (!getProductionId(event)) return false
  return (
    key === 'project_id' || key === 'task_id' || Boolean(ENTITY_LINK_KEYS[key])
  )
}

const getLink = (event, key) => {
  if (key === 'person_id') {
    return `/people/${event.data[key]}`
  }
  const productionId = getProductionId(event)
  if (key === 'project_id') {
    return `/productions/${productionId}/news-feed`
  }
  const entityId = event.data[key]
  if (key === 'task_id') {
    return `/productions/${productionId}/entity/tasks/${entityId}`
  }
  return `/productions/${productionId}/${ENTITY_LINK_KEYS[key]}/${entityId}`
}

const exportCsv = () => {
  const headers = ['date', 'object', 'action', 'production', 'user', 'data']
  const rows = events.value.map(event => [
    event.date,
    event.name,
    event.type,
    event.production?.name ?? '',
    event.person?.full_name ?? '',
    JSON.stringify(event.data)
  ])
  const name = `activity-logs-${formatSimpleDate(new Date())}`
  csv.buildCsvFile(name, [headers, ...rows])
}

// Watchers

watch(
  () => route.query,
  () => {
    const after = parseSimpleDate(route.query.after)
    const before = parseSimpleDate(route.query.before)
    dateRange.value =
      after.isValid() && before.isValid()
        ? [after.toDate(), before.toDate()]
        : null
    resolvePeopleFromQuery()
    selectedProductionId.value = route.query.project_id || ''
    selectedObjects.value = asArray(route.query.objects)
    selectedActions.value = asArray(route.query.actions)
    onlyFiles.value = route.query.only_files === 'true'
    loadEvents()
  },
  { immediate: true }
)

// The person map is filled asynchronously: names shown in the filter and in
// the log lines have to be resolved again once it lands.
watch(personMap, () => {
  resolvePeopleFromQuery()
  events.value = events.value.map(event => ({
    ...event,
    person: personMap.value.get(event.user_id)
  }))
})

// Lifecycle

onMounted(() => {
  loadEventNames()
  loadProductions()
})

// Head

useHead({ title: computed(() => `${t('logs.audit.title')} - Kitsu`) })
</script>

<style lang="scss" scoped>
.dark .tag {
  background: $dark-grey;
  color: $white;
}

.empty {
  font-style: italic;
}

.filters {
  align-items: flex-start;
  flex-wrap: wrap;
}

.event-count {
  padding: 1em;
  font-style: italic;
}

.event-line {
  border-radius: 4px;
  cursor: pointer;
  padding: 0.25em;
  transition: background 0.2s ease;

  &:hover {
    background: var(--background-selectable);
  }

  .date {
    border-radius: 4px;
    font-variant-numeric: tabular-nums;
    font-weight: 500;
  }

  .type {
    min-width: 50px;
    text-transform: uppercase;
  }

  .type[data-status='add'] {
    background: $dark-purple;
    color: white;
  }

  .type[data-status='del'] {
    background: $red;
    color: white;
  }

  .type[data-status='new'] {
    background: $green;
    color: white;
  }

  .type[data-status='set'] {
    background: $purple;
  }

  .type[data-status='sta'] {
    background: $pink;
    color: white;
  }

  .type[data-status='upd'] {
    background: $blue;
    color: white;
  }

  ul {
    border-left: 3px solid $light-grey;
    cursor: default;
    list-style-type: none;
    margin: 1em 1em 2em 0.2em;
    padding-left: 1em;

    a {
      color: var(--text);

      &:hover {
        text-decoration: underline;
      }
    }

    .key {
      display: inline-block;
      font-weight: 500;
      width: 170px;
    }
  }
}

.log-list {
  display: flex;
  flex-direction: column;
  margin-bottom: 2em;
}
</style>
