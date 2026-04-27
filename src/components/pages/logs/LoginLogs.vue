<template>
  <div class="mt1">
    <div class="flexrow">
      <date-field
        class="flexrow-item"
        :label="$t('logs.current_date_label')"
        :max-date="today"
        :placeholder="$t('main.date')"
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
        :is-loading="loading.logs"
        :title="$t('main.reload')"
        @click="loadLogs(currentDate)"
      />
    </div>

    <div class="has-text-centered" v-if="loading.logs">
      <spinner />
    </div>
    <div class="mt2 empty" v-else-if="!filteredLogs.length">
      {{ $t('logs.empty_list') }}
    </div>
    <table class="log-list" v-else>
      <tr class="log-line" :key="log.id" v-for="log in filteredLogs">
        <td>
          <span class="tag">{{ log.date }}</span>
        </td>
        <td class="person">
          <span class="flexrow">
            <people-avatar
              class="flexrow-item"
              :size="20"
              :font-size="10"
              :person="log.person"
            />
            <people-name class="flexrow-item" :person="log.person" with-link />
          </span>
        </td>
        <td>{{ log.person?.email }}</td>
        <td>(IP: {{ log.ip_address }})</td>
        <td>{{ log.origin }}</td>
      </tr>
      <tr v-if="hasMoreLogs">
        <td colspan="5" class="has-text-centered">
          <button-simple
            class="mt2"
            :is-loading="loading.moreLogs"
            :text="$t('main.load_more')"
            @click="loadMoreLogs(currentDate)"
          />
        </td>
      </tr>
    </table>
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

const PAGE_SIZE = 100

const { t } = useI18n()
const { today, timezone, formatDate } = useTime()
const route = useRoute()
const router = useRouter()
const store = useStore()

// State

const currentDate = ref(null)
const logs = ref([])
const hasMoreLogs = ref(false)
const selectedPerson = ref(null)
const loading = reactive({ logs: false, moreLogs: false })

// Computed

const people = computed(() => store.getters.people)
const personMap = computed(() => store.getters.personMap)

const filteredLogs = computed(() => {
  if (!selectedPerson.value) return logs.value
  return logs.value.filter(log => log.person?.id === selectedPerson.value.id)
})

// Functions

const onDateChange = value => {
  const date = value ? formatSimpleDate(value) : undefined
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

const formatLogs = rawLogs => {
  return rawLogs.map(log => ({
    id: log.id,
    date: formatDate(log.created_at),
    ip_address: log.ip_address,
    person: personMap.value.get(log.person_id),
    origin: log.origin
  }))
}

const loadLogs = async date => {
  logs.value = []
  loading.logs = true
  try {
    const result = await store.dispatch('loadLoginLogs', {
      limit: PAGE_SIZE,
      ...getDateParams(date)
    })
    logs.value = formatLogs(result)
    hasMoreLogs.value = result.length >= PAGE_SIZE
  } catch (err) {
    console.error(err)
  } finally {
    loading.logs = false
  }
}

const loadMoreLogs = async date => {
  if (!logs.value.length) return

  loading.moreLogs = true
  const lastLoginLogId = logs.value[logs.value.length - 1].id
  try {
    const result = await store.dispatch('loadLoginLogs', {
      lastLoginLogId,
      limit: PAGE_SIZE,
      ...getDateParams(date)
    })
    logs.value = [...logs.value, ...formatLogs(result)]
    hasMoreLogs.value = result.length >= PAGE_SIZE
  } catch (err) {
    console.error(err)
  } finally {
    loading.moreLogs = false
  }
}

// Watchers

watch(
  () => route.query.date,
  date => {
    if (!date) {
      currentDate.value = null
    } else {
      const parsedDate = parseSimpleDate(date)
      currentDate.value = parsedDate.isValid() ? parsedDate.toDate() : null
    }
    loadLogs(currentDate.value)
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

useHead({ title: computed(() => `${t('logs.logins.title')} - Kitsu`) })
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

.log-line {
  transition: background 0.2s ease;

  &:hover {
    background: var(--background-selectable);
  }

  .tag {
    border-radius: 4px;
    font-variant-numeric: tabular-nums;
    font-weight: 500;
  }

  td {
    padding: 0.5em;

    &:first-child {
      padding-left: 0.25em;
    }

    &:last-child {
      padding-right: 0.25em;
    }
  }
}

.log-list {
  color: var(--text);
  width: auto;
}
</style>
