<template>
  <div class="people-timesheet-info">
    <div class="close">
      <router-link class="close-button" :to="closeRoute">
        <x-icon :size="16" />
      </router-link>
    </div>

    <div class="flexrow">
      <people-avatar class="flexrow-item" :person="person" :is-lazy="false" />
      <page-title class="flexrow-item" :text="person.full_name" />
    </div>

    <div class="info-date">
      <template v-if="level === 'year'">{{ year }}</template>
      <template v-else-if="level === 'month'">
        {{ monthString }} {{ year }}
      </template>
      <template v-else-if="level === 'week'">
        {{ $t('main.week') }} {{ week }}
      </template>
      <template v-else>{{ day }} {{ monthString }} {{ year }}</template>
    </div>
    <div class="info-range" v-if="level === 'week'">
      {{ weekDays }} {{ year }}
    </div>

    <div class="info-stats">
      <div class="info-stat" :title="expectedTitle" v-if="!isLoadingError">
        <span class="info-stat-value" :class="{ skeleton: isLoading }">
          <template v-if="!isLoading">
            <span :class="{ warning: total > expected }">{{
              format(total)
            }}</span>
            <span class="info-stat-expected">/ {{ format(expected) }}</span>
          </template>
        </span>
        <span class="info-stat-label">{{
          $t(totalKey, { count: total })
        }}</span>
      </div>
      <div class="info-stat" v-if="level !== 'day'">
        <span class="info-stat-value">{{ dayOffCount }}</span>
        <span class="info-stat-label">
          {{ $t('days_off.nb_days_off', { count: dayOffCount }) }}
        </span>
      </div>
    </div>

    <time-spent-task-list
      class="time-spent-list"
      :tasks="tasks"
      :is-loading="isLoading"
      :is-error="isLoadingError"
      :unit="unit"
      :daily-rate="dailyRate"
    />
  </div>
</template>

<script setup>
// Imports
import { XIcon } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import { isFreeEscape } from '@/lib/keyboard'
import { getBusinessDays, monthToString } from '@/lib/time'
import {
  convertHours,
  formatTimesheetValue,
  getTimesheetPeriod
} from '@/lib/timesheet'

import TimeSpentTaskList from '@/components/lists/TimeSpentTaskList.vue'
import PageTitle from '@/components/widgets/PageTitle.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'

// Composables
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()

// Props
const props = defineProps({
  person: { type: Object, default: () => ({}) },
  year: { type: Number, default: 0 },
  month: { type: Number, default: 0 },
  week: { type: Number, default: 0 },
  day: { type: Number, default: 0 },
  isLoading: { type: Boolean, default: false },
  isLoadingError: { type: Boolean, default: false },
  tasks: { type: Array, default: () => [] },
  dayOffs: { type: Array, default: () => [] },
  unit: { type: String, default: 'hour' },
  dailyRate: { type: Number, default: 0 }
})

// Computed
// --------------------------------------------------------------------------
const organisation = computed(() => store.getters.organisation)
const use12HourClock = computed(() => store.getters.use12HourClock)

// the panel only shows on the `timesheets-<level>-person` routes
const level = computed(() => route.name.split('-')[1])

const convert = hours =>
  convertHours(hours, props.unit, organisation.value, props.dailyRate)

const format = value =>
  formatTimesheetValue(value, props.unit, use12HourClock.value)

const total = computed(() =>
  convert(props.tasks.reduce((sum, task) => sum + task.duration, 0) / 60)
)

const totalKey = computed(
  () =>
    ({
      hour: 'main.hours_spent',
      day: 'main.days_spent',
      salary: 'timesheets.in_salary'
    })[props.unit]
)

const monthString = computed(() => monthToString(props.month))

const period = computed(() => getTimesheetPeriod(level.value, props))

const weekDays = computed(() => {
  const { start, end } = period.value
  return `${start.date()} - ${end.date()} ${start.format('MMM')}`
})

const businessDays = computed(() =>
  getBusinessDays(period.value.start, period.value.end)
)

const workingDays = computed(() =>
  getBusinessDays(period.value.start, period.value.end, props.dayOffs)
)

const dayOffCount = computed(() => businessDays.value - workingDays.value)

// what a full-time person logs over the working days of the period, in
// the selected unit
const expected = computed(() =>
  convert(workingDays.value * organisation.value.hours_by_day)
)

const expectedTitle = computed(() => {
  const key = {
    hour: 'main.hours_expected',
    day: 'main.days_expected',
    salary: 'timesheets.expected'
  }[props.unit]
  return `${format(expected.value)} ${t(key, { count: expected.value })}`
})

const closeRoute = computed(() => {
  const { year, month, week, day } = props
  const params = {
    year: { year },
    month: { year, month },
    week: { year, week },
    day: { year, month, day }
  }[level.value]
  return {
    name: `timesheets-${level.value}`,
    params,
    query: route.query
  }
})

// Functions
// --------------------------------------------------------------------------
const onKeyDown = event => {
  if (isFreeEscape(event)) router.push(closeRoute.value)
}

// Lifecycle
// --------------------------------------------------------------------------
onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<style lang="scss" scoped>
.data-list {
  padding-bottom: 5em;
}

.people-timesheet-info {
  background: var(--background-panel);
  border-radius: 12px;
  color: var(--text);
  min-height: 100%;
  padding: 1.5em 1.5em 1em;
  position: relative;

  // keep the name clear of the floating close button: it overhangs the
  // padding by about 1em
  > .flexrow {
    margin-right: 1em;
  }

  // the page title is sized for a full-width header: at 2rem uppercase
  // a two-word name already wraps in the 400px column
  :deep(.title) {
    font-size: 1.5rem;
  }
}

.info-date {
  font-size: 1.5em;
  margin-top: 1em;
  text-transform: capitalize;
}

.info-range {
  color: var(--text-alt);
  margin-top: 0.25em;
}

.info-stats {
  display: flex;
  gap: 0.75em;
  margin: 1em 0 2.5em;
}

// figure above its label, on the page surface so the tiles stand out
// of the panel in both themes
.info-stat {
  background: var(--background);
  border-radius: 8px;
  flex: 1;
  padding: 0.75em 1em;
}

.info-stat-value {
  display: block;
  font-size: 1.5em;
  font-weight: 600;
  line-height: 1.2;

  // holds the line while the figures load, so the tile does not jump
  &.skeleton {
    background: rgba(var(--skeleton-rgb), 0.3);
    border-radius: 4px;
    height: 1.2em;
    width: 3em;
  }

  .warning {
    color: $red;
  }
}

.info-stat-expected {
  color: var(--text-alt);
  font-size: 0.7em;
  font-weight: 400;
  // the template whitespace between the two spans is condensed away
  margin-left: 0.3em;
}

.info-stat-label {
  display: block;
  font-size: 0.8em;
  letter-spacing: 0.5px;
  margin-top: 0.25em;
  text-transform: uppercase;
}

// out of the flow: a full line for one icon was too much
.close {
  position: absolute;
  right: 0.75em;
  top: 0.75em;
}

.close-button {
  height: 26px;
  padding-top: 5px;
  width: 26px;

  &:hover {
    background: rgba(var(--skeleton-rgb), 0.25);
  }
}
</style>
