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
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'
import { useI18n } from 'vue-i18n'
import moment from 'moment'

import {
  formatFullDateWithRevertedTimezone,
  formatSimpleDate,
  parseSimpleDate
} from '@/lib/time'
import { useTime } from '@/composables/time'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import DateField from '@/components/widgets/DateField.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import PeopleField from '@/components/widgets/PeopleField.vue'
import PeopleName from '@/components/widgets/PeopleName.vue'
import Spinner from '@/components/widgets/Spinner.vue'

const PAGE_SIZE = 1000

const store = useStore()
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { today, timezone, formatDate } = useTime()

const people = computed(() => store.getters.people)
const personMap = computed(() => store.getters.personMap)

const currentDate = ref(new Date())
const events = ref([])
const hasMoreEvents = ref(false)
const selectedEvents = ref({})
const selectedPerson = ref(null)
const loading = ref({ events: false, moreEvents: false })

const filteredEvents = computed(() => {
  if (!selectedPerson.value) return events.value
  return events.value.filter(event => event.user_id === selectedPerson.value.id)
})

function onDateChange(value) {
  const date = formatSimpleDate(value)
  if (route.query.date !== date) {
    router.push({ query: { ...route.query, date } })
  }
}

function onPersonSelect(person) {
  const personId = person?.id
  if (route.query.person_id !== personId) {
    router.push({ query: { ...route.query, person_id: personId } })
  }
}

function getDateParams(date) {
  if (!date) return {}
  const after = moment(date)
  const before = moment(date).add(1, 'days')
  return {
    after: formatFullDateWithRevertedTimezone(after, timezone.value),
    before: formatFullDateWithRevertedTimezone(before, timezone.value)
  }
}

function formatEvents(rawEvents) {
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

async function loadDayEvents(date) {
  selectedEvents.value = {}
  events.value = []
  loading.value.events = true
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
    loading.value.events = false
  }
}

async function loadMoreEvents(date) {
  if (!events.value.length) return

  loading.value.moreEvents = true
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
    loading.value.moreEvents = false
  }
}

function selectLine(event) {
  selectedEvents.value[event.id] = !selectedEvents.value[event.id]
}

function isLink(key) {
  const linkKeys = ['project_id', 'task_id']
  return linkKeys.includes(key)
}

function getLink(event, key) {
  const productionId = event.data.project_id
  const entityType = key.substring(0, key.length - 3)
  if (entityType === 'project') {
    return `/productions/${productionId}/news-feed`
  } else if (entityType === 'task') {
    const entityId = event.data[key]
    return `/productions/${productionId}/entity/tasks/${entityId}`
  } else {
    const entityId = event.data[key]
    return `/productions/${productionId}/${entityType}s/${entityId}`
  }
}

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

useHead({ title: computed(() => `${t('logs.audit.title')} - Kitsu`) })
</script>

<style lang="scss" scoped>
.dark {
  .tag {
    color: $white;
    background: $dark-grey;
  }

  .nb-events {
    color: $white;
  }
}

.empty {
  color: var(--text);
  font-style: italic;
}

.log-list {
  display: flex;
  flex-direction: column;
  margin-bottom: 2em;
}

.event-line {
  cursor: pointer;
  padding: 0.25em;
  border-radius: 4px;
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
    text-transform: uppercase;
    min-width: 50px;
  }

  .type[data-status='new'] {
    color: white;
    background: $green;
  }

  .type[data-status='upd'] {
    color: white;
    background: $blue;
  }

  .type[data-status='add'] {
    color: white;
    background: $dark-purple;
  }

  .type[data-status='del'] {
    color: white;
    background: $red;
  }

  .type[data-status='sta'] {
    color: white;
    background: $pink;
  }

  .type[data-status='set'] {
    background: $purple;
  }

  ul {
    cursor: default;
    color: var(--text);
    border-left: 3px solid $light-grey;
    list-style-type: none;
    margin: 1em 1em 2em 0.2em;
    padding-left: 1em;

    .key {
      font-weight: 500;
      width: 170px;
      display: inline-block;
    }

    a {
      color: var(--text);

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
