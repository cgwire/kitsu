<template>
  <div class="mt1">
    <div class="flexrow">
      <date-field
        class="flexrow-item"
        :can-delete="false"
        :label="$t('logs.current_date_label')"
        :max-date="today"
        v-model="currentDate"
        @change="onDateChange"
      />
      <people-field
        class="flexrow-item field"
        :label="$t('main.user')"
        :people="people"
        v-model="selectedPerson"
        @select="onPersonSelect"
      />
      <button-simple
        class="flexrow-item small"
        icon="refresh"
        :is-loading="loading.events"
        :title="$t('main.reload')"
        @click="loadDayEvents(currentDate)"
      />
    </div>

    <div class="has-text-centered" v-if="loading.events">
      <spinner />
    </div>
    <div class="mt2 empty" v-else-if="!filteredEvents.length">
      {{ $t('logs.empty_list') }}
    </div>
    <div class="log-list" v-else>
      <div
        class="event-line"
        :key="event.id"
        @click="selectLine(event)"
        v-for="event in filteredEvents"
      >
        <span class="date tag mr1">{{ event.date }}</span>
        <span
          class="type tag"
          :title="event.type"
          :data-status="event.shortType"
        >
          {{ event.shortType }}
        </span>
        <span class="name tag mr1">{{ event.name }}</span>
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
            <a :href="getLink(event, key)" v-if="isLink(key)">
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
          @click="loadMoreEvents(currentDate)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import moment from 'moment'
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHead } from '@unhead/vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import { useTime } from '@/composables/time'
import {
  formatFullDateWithRevertedTimezone,
  formatSimpleDate,
  parseSimpleDate
} from '@/lib/time'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import DateField from '@/components/widgets/DateField.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import PeopleField from '@/components/widgets/PeopleField.vue'
import PeopleName from '@/components/widgets/PeopleName.vue'
import Spinner from '@/components/widgets/Spinner.vue'

const PAGE_SIZE = 1000
const LINK_KEYS = ['project_id', 'task_id']

const { t } = useI18n()
const { today, timezone, formatDate } = useTime()
const route = useRoute()
const router = useRouter()
const store = useStore()

// State

const currentDate = ref(new Date())
const events = ref([])
const hasMoreEvents = ref(false)
const selectedEvents = ref({})
const selectedPerson = ref(null)
const loading = reactive({ events: false, moreEvents: false })

// Computed

const people = computed(() => store.getters.people)
const personMap = computed(() => store.getters.personMap)

const filteredEvents = computed(() => {
  if (!selectedPerson.value) return events.value
  return events.value.filter(event => event.user_id === selectedPerson.value.id)
})

// Functions

const onDateChange = value => {
  const date = formatSimpleDate(value)
  if (route.query.date !== date) {
    router.push({ query: { ...route.query, date } })
  }
}

const onPersonSelect = person => {
  const personId = person?.id
  if (route.query.person_id !== personId) {
    router.push({ query: { ...route.query, person_id: personId } })
  }
}

const getDateParams = date => {
  if (!date) return {}
  const after = moment(date)
  const before = moment(date).add(1, 'days')
  return {
    after: formatFullDateWithRevertedTimezone(after, timezone.value),
    before: formatFullDateWithRevertedTimezone(before, timezone.value)
  }
}

const formatEvents = rawEvents => {
  return rawEvents.map(event => {
    const [name, type] = event.name.split(':')
    return {
      id: event.id,
      date: formatDate(event.created_at),
      data: event.data,
      name,
      shortType: type.substring(0, 3),
      type,
      user_id: event.user_id,
      person: personMap.value.get(event.user_id)
    }
  })
}

const loadDayEvents = async date => {
  selectedEvents.value = {}
  events.value = []
  loading.events = true
  try {
    const result = await store.dispatch('loadEvents', {
      limit: PAGE_SIZE,
      ...getDateParams(date)
    })
    events.value = formatEvents(result)
    hasMoreEvents.value = result.length >= PAGE_SIZE
  } catch (err) {
    console.error(err)
  } finally {
    loading.events = false
  }
}

const loadMoreEvents = async date => {
  if (!events.value.length) return

  loading.moreEvents = true
  const lastEventId = events.value[events.value.length - 1].id
  try {
    const result = await store.dispatch('loadEvents', {
      lastEventId,
      limit: PAGE_SIZE,
      ...getDateParams(date)
    })
    events.value = [...events.value, ...formatEvents(result)]
    hasMoreEvents.value = result.length >= PAGE_SIZE
  } catch (err) {
    console.error(err)
  } finally {
    loading.moreEvents = false
  }
}

const selectLine = event => {
  selectedEvents.value[event.id] = !selectedEvents.value[event.id]
}

const isLink = key => LINK_KEYS.includes(key)

const getLink = (event, key) => {
  const productionId = event.data.project_id
  const entityType = key.substring(0, key.length - 3)
  if (entityType === 'project') {
    return `/productions/${productionId}/news-feed`
  }
  const entityId = event.data[key]
  if (entityType === 'task') {
    return `/productions/${productionId}/entity/tasks/${entityId}`
  }
  return `/productions/${productionId}/${entityType}s/${entityId}`
}

// Watchers

watch(
  () => route.query.date,
  date => {
    const parsedDate = parseSimpleDate(date)
    currentDate.value = parsedDate.isValid() ? parsedDate.toDate() : new Date()
    loadDayEvents(currentDate.value)
  },
  { immediate: true }
)

watch(
  () => route.query.person_id,
  personId => {
    selectedPerson.value = personMap.value.get(personId) || null
  },
  { immediate: true }
)

// Head

useHead({ title: computed(() => `${t('logs.audit.title')} - Kitsu`) })
</script>

<style lang="scss" scoped>
.dark .tag {
  background: $dark-grey;
  color: $white;
}

.empty {
  color: var(--text);
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
    color: var(--text);
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
