<template>
  <div class="mt1">
    <div class="flexrow filters">
      <date-field
        class="date-range flexrow-item"
        :can-delete="false"
        :label="$t('logs.date_range_label')"
        :max-date="today"
        :placeholder="$t('logs.date_range_placeholder')"
        range
        v-model="dateRange"
        @change="onDateRangeChange"
      />
      <people-field
        class="field flexrow-item people-filter"
        multiple
        search-email
        :label="$t('logs.people_label')"
        :people="people"
        :placeholder="$t('logs.people_placeholder')"
        v-model="selectedPeople"
        @select="onPeopleSelect"
      />
      <div class="filler"></div>
      <button-simple
        class="flexrow-item small mt2"
        icon="refresh"
        :is-loading="loading.logs"
        :title="$t('main.reload')"
        @click="loadLogs"
      />
    </div>

    <div class="has-text-centered" v-if="loading.logs">
      <spinner />
    </div>
    <div class="mt2 empty" v-else-if="!logs.length">
      {{ $t('logs.empty_list') }}
    </div>
    <div class="data-list" v-else>
      <div class="datatable-wrapper">
        <table class="datatable datatable--cards">
          <thead class="datatable-head">
            <tr>
              <th scope="col" class="date">{{ $t('main.date') }}</th>
              <th scope="col" class="person">{{ $t('logs.logins.user') }}</th>
              <th scope="col" class="email">
                {{ $t('people.fields.email') }}
              </th>
              <th scope="col" class="ip-address">
                {{ $t('logs.logins.ip_address') }}
              </th>
              <th scope="col" class="origin">{{ $t('logs.logins.origin') }}</th>
            </tr>
          </thead>
          <tbody class="datatable-body">
            <tr class="datatable-row" :key="log.id" v-for="log in logs">
              <td class="date" :data-label="$t('main.date')">
                {{ log.date }}
              </td>
              <td class="person card-head">
                <span class="flexrow" v-if="log.person">
                  <people-avatar
                    class="flexrow-item"
                    :size="20"
                    :font-size="10"
                    :person="log.person"
                  />
                  <people-name
                    class="flexrow-item"
                    :person="log.person"
                    with-link
                  />
                </span>
              </td>
              <td
                class="email"
                :data-label="
                  log.person?.email ? $t('people.fields.email') : null
                "
              >
                {{ log.person?.email }}
              </td>
              <td
                class="ip-address"
                :data-label="
                  log.ip_address ? $t('logs.logins.ip_address') : null
                "
              >
                {{ log.ip_address }}
              </td>
              <td
                class="origin"
                :data-label="log.origin ? $t('logs.logins.origin') : null"
              >
                {{ log.origin }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="has-text-centered load-more" v-if="hasMoreLogs">
        <button-simple
          class="mt2"
          :is-loading="loading.moreLogs"
          :text="$t('main.load_more')"
          @click="loadMoreLogs"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useHead } from '@unhead/vue'
import moment from 'moment'
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
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

const dateRange = ref(null)
const logs = ref([])
const hasMoreLogs = ref(false)
const selectedPeople = ref([])
const loading = reactive({ logs: false, moreLogs: false })

// Computed

const asArray = value => {
  if (value === undefined || value === null) return []
  return Array.isArray(value) ? value : [value]
}

const people = computed(() => store.getters.people)
const personMap = computed(() => store.getters.personMap)

// Read from the route rather than from the widget model: the person map may
// still be loading, and an unresolved id must not silently drop the filter
// the URL asked for.
const queryParams = computed(() => {
  const params = {
    limit: PAGE_SIZE,
    personIds: asArray(route.query.person_ids)
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

const resolvePeopleFromQuery = () => {
  selectedPeople.value = asArray(route.query.person_ids)
    .map(personId => personMap.value.get(personId))
    .filter(Boolean)
}

const formatLogs = rawLogs => {
  return rawLogs.map(log => ({
    id: log.id,
    date: formatDate(log.created_at),
    ip_address: log.ip_address,
    person_id: log.person_id,
    person: personMap.value.get(log.person_id),
    origin: log.origin
  }))
}

const loadLogs = async () => {
  logs.value = []
  loading.logs = true
  try {
    const result = await store.dispatch('loadLoginLogs', queryParams.value)
    logs.value = formatLogs(result)
    hasMoreLogs.value = result.length >= PAGE_SIZE
  } catch (err) {
    console.error(err)
  } finally {
    loading.logs = false
  }
}

const loadMoreLogs = async () => {
  if (!logs.value.length) return

  loading.moreLogs = true
  const lastLoginLogId = logs.value[logs.value.length - 1].id
  try {
    const result = await store.dispatch('loadLoginLogs', {
      ...queryParams.value,
      lastLoginLogId
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
  () => route.query,
  () => {
    const after = parseSimpleDate(route.query.after)
    const before = parseSimpleDate(route.query.before)
    dateRange.value =
      after.isValid() && before.isValid()
        ? [after.toDate(), before.toDate()]
        : null
    resolvePeopleFromQuery()
    loadLogs()
  },
  { immediate: true }
)

// The person map is filled asynchronously: names shown in the filter and in
// the log lines have to be resolved again once it lands.
watch(personMap, () => {
  resolvePeopleFromQuery()
  logs.value = logs.value.map(log => ({
    ...log,
    person: personMap.value.get(log.person_id)
  }))
})

// Head

useHead({ title: computed(() => `${t('logs.logins.title')} - Kitsu`) })
</script>

<style lang="scss" scoped>
.empty {
  font-style: italic;
}

.filters {
  align-items: flex-start;
  flex-wrap: wrap;
}

.data-list {
  margin-bottom: 2em;
}

.date {
  max-width: 180px;
  min-width: 180px;
  width: 180px;
}

@media screen and (max-width: 768px) {
  .filters {
    align-items: flex-end;
    row-gap: 0.5em;

    .filler {
      display: none;
    }

    // measured: 32px buttons against the 40px date input
    .button {
      height: 40px;
    }

    .mt2 {
      margin-top: 0;
    }
  }

  // the .field bottom margin of DateField lifted it above the buttons
  .date-range {
    flex: 1;
    margin-bottom: 0;
    min-width: 0;
  }

  .people-filter {
    flex: 0 0 100%;
    margin-right: 0;
    order: 1;
  }

  .datatable-wrapper {
    background: transparent;
    border: 0;
    overflow-x: visible;
  }
}
</style>
