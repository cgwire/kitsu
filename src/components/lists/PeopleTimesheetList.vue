<template>
  <div class="data-list">
    <div
      class="datatable-wrapper"
      ref="body"
      @mousedown="startBrowsing"
      @touchstart="startBrowsing"
    >
      <table class="datatable datatable--cards">
        <thead class="datatable-head">
          <tr>
            <th scope="col" class="name datatable-row-header">
              {{ $t('people.list.name') }}
            </th>

            <!-- Year columns -->
            <template v-if="detailLevel === 'year'">
              <th
                :key="`year-${year}`"
                scope="col"
                class="time year"
                :class="{ today: isCurrentColumn(year) }"
                v-for="year in columnRange"
              >
                {{ year }}
              </th>
            </template>

            <!-- Month columns -->
            <template v-if="detailLevel === 'month'">
              <th
                :key="`month-${month}`"
                scope="col"
                class="time month"
                :class="{ today: isCurrentColumn(month) }"
                v-for="month in columnRange"
              >
                {{ columnLabel(month) }}
              </th>
            </template>

            <!-- Week columns -->
            <template v-if="detailLevel === 'week'">
              <th
                :key="`week-${week}`"
                scope="col"
                class="daytime"
                :class="{ today: isCurrentColumn(week) }"
                :title="getWeekTitle(week)"
                v-for="week in columnRange"
              >
                {{ week }}
                <span class="week-start">{{ getWeekStart(week) }}</span>
              </th>
            </template>

            <!-- Day columns -->
            <template v-if="detailLevel === 'day'">
              <th
                :key="`day-${day}`"
                scope="col"
                class="daytime"
                :class="{ today: isCurrentColumn(day) }"
                v-for="day in columnRange"
              >
                {{ day }}
              </th>
            </template>
            <th scope="col" class="total">{{ $t('main.total') }}</th>
            <th scope="col" class="actions"></th>
          </tr>
        </thead>
        <tbody class="datatable-body" v-if="!isLoading">
          <tr class="datatable-row" v-for="person in people" :key="person.id">
            <th class="datatable-row-header name">
              <div class="flexrow">
                <people-avatar class="flexrow-item" :person="person" />
                <people-name class="flexrow-item" with-link :person="person" />
              </div>
            </th>

            <!-- Year cells -->
            <template v-if="detailLevel === 'year'">
              <td
                :key="`year-${year}-${person.id}`"
                class="time year"
                :data-label="year"
                :class="{
                  today: isCurrentColumn(year),
                  selected: isSelected(person.id, { year })
                }"
                v-for="year in columnRange"
              >
                <router-link
                  v-if="hours(year, person.id) > 0"
                  class="duration"
                  :class="{ warning: isOvertime(year, person.id) }"
                  :title="getCellTitle(year, person.id)"
                  :to="getDetailRoute(person, { year })"
                >
                  {{ duration(year, person.id) }}
                </router-link>
                <span class="blank" v-else>-</span>
              </td>
            </template>

            <!-- Month cells -->
            <template v-if="detailLevel === 'month'">
              <td
                :key="`month-${month}-${person.id}`"
                class="time month"
                :data-label="columnLabel(month)"
                :class="{
                  today: isCurrentColumn(month),
                  selected: isSelected(person.id, { year, month })
                }"
                v-for="month in columnRange"
              >
                <router-link
                  v-if="hours(month, person.id) > 0"
                  class="duration"
                  :class="{ warning: isOvertime(month, person.id) }"
                  :title="getCellTitle(month, person.id)"
                  :to="getDetailRoute(person, { year, month })"
                >
                  {{ duration(month, person.id) }}
                </router-link>
                <span class="blank" v-else>-</span>
              </td>
            </template>

            <!-- Week cells -->
            <template v-if="detailLevel === 'week'">
              <td
                :key="`week-${week}-${person.id}`"
                class="daytime"
                :data-label="week"
                :class="{
                  today: isCurrentColumn(week),
                  selected: isSelected(person.id, { year, week })
                }"
                v-for="week in columnRange"
              >
                <router-link
                  v-if="hours(week, person.id) > 0"
                  class="duration"
                  :class="{ warning: isOvertime(week, person.id) }"
                  :title="getCellTitle(week, person.id)"
                  :to="getDetailRoute(person, { year, week })"
                >
                  {{ duration(week, person.id) }}
                </router-link>
                <span class="blank" v-else>-</span>
              </td>
            </template>

            <!-- Day cells -->
            <template v-if="detailLevel === 'day'">
              <td
                :key="`day-${day}-${person.id}`"
                class="daytime"
                :data-label="day"
                :class="{
                  weekend: isWeekend(moment({ year, month: month - 1, day })),
                  today: isCurrentColumn(day),
                  selected: isSelected(person.id, { year, month, day })
                }"
                v-for="day in columnRange"
              >
                <span class="blank" v-if="isDayOff(person.id, day)">
                  {{ $t('timesheets.off').toUpperCase() }}
                </span>
                <router-link
                  v-else-if="hours(day, person.id) > 0"
                  class="duration"
                  :class="{ warning: isOvertime(day, person.id) }"
                  :title="getCellTitle(day, person.id)"
                  :to="getDetailRoute(person, { year, month, day })"
                >
                  {{ duration(day, person.id) }}
                </router-link>
                <span class="blank" v-else>-</span>
              </td>
            </template>
            <td class="total" :data-label="$t('main.total')">
              {{ personTotals[person.id] }}
            </td>
            <td class="actions"></td>
          </tr>
          <tr class="datatable-row total-row" v-if="people.length">
            <th class="datatable-row-header name">{{ $t('main.total') }}</th>
            <td
              :key="`total-${index}`"
              class="column-total"
              :data-label="columnLabel(index)"
              v-for="index in columnRange"
            >
              {{ columnTotals[index] }}
            </td>
            <td class="total"></td>
            <td class="actions"></td>
          </tr>
        </tbody>
      </table>
    </div>

    <table-info :is-loading="isLoading" :is-error="isError" variant="grid" />

    <p class="empty" v-if="!isLoading && !isError && !people.length">
      {{ $t('timesheets.empty') }}
    </p>

    <p class="has-text-centered footer-info" v-if="!isLoading && people.length">
      {{ people.length }} {{ $t('people.persons', { count: people.length }) }},
      {{ grandTotalLabel }} {{ $t(totalKey, { count: grandTotalLabel }) }}
    </p>
  </div>
</template>

<script setup>
// Imports
import moment from 'moment-timezone'
import { computed, nextTick, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import { useGrabList } from '@/composables/grabList'
import { formatDisplayDate, getBusinessDays, hoursToDays } from '@/lib/time'
import {
  convertHours,
  formatTimesheetValue,
  getTimesheetColumns,
  getTimesheetPeriod,
  isCurrentTimesheetColumn,
  timesheetColumnLabel
} from '@/lib/timesheet'

import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import PeopleName from '@/components/widgets/PeopleName.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'

// Composables
const { t } = useI18n()
const route = useRoute()
const store = useStore()
const bodyRef = useTemplateRef('body')
const { startBrowsing } = useGrabList(bodyRef)

// Props
const props = defineProps({
  timesheet: { type: Object, default: () => ({}) },
  people: { type: Array, default: () => [] },
  detailLevel: { type: String, default: 'day' },
  year: { type: Number, default: 0 },
  month: { type: Number, default: 0 },
  unit: { type: String, default: 'hour' },
  dailyRates: { type: Object, default: () => ({}) },
  isLoading: { type: Boolean, default: false },
  isError: { type: Boolean, default: false }
})

// Computed
// --------------------------------------------------------------------------
const dateFormat = computed(() => store.getters.dateFormat)
const dayOffMap = computed(() => store.getters.dayOffMap)
const organisation = computed(() => store.getters.organisation)
const use12HourClock = computed(() => store.getters.use12HourClock)
const firstYear = computed(() => store.getters.firstTimesheetYear)

const columnRange = computed(() =>
  getTimesheetColumns(props.detailLevel, {
    year: props.year,
    month: props.month,
    firstYear: firstYear.value
  })
)

const columnPeriod = index =>
  getTimesheetPeriod(props.detailLevel, {
    year: props.detailLevel === 'year' ? index : props.year,
    month: props.detailLevel === 'month' ? index : props.month,
    week: index,
    day: index
  })

// hours a full-time person is expected to log per column: the day rate
// over the working days the column spans, minus the person's days off, as
// the side panel counts them
const expectedHours = computed(() => {
  const hpd = organisation.value.hours_by_day
  const expected = (index, personId) => {
    const { start, end } = columnPeriod(index)
    const offDays = Object.keys(dayOffMap.value[personId] || {}).filter(
      date => {
        const day = moment(date, 'YYYY-MM-DD')
        return day.isBetween(start, end, 'day', '[]') && !isWeekend(day)
      }
    ).length
    return (getBusinessDays(start, end) - offDays) * hpd
  }
  return Object.fromEntries(
    columnRange.value.map(index => [
      index,
      Object.fromEntries(
        props.people.map(({ id }) => [id, expected(index, id)])
      )
    ])
  )
})

// Functions
// --------------------------------------------------------------------------
const hours = (index, personId) =>
  (props.timesheet?.[index]?.[personId] || 0) / 60

// the cell figure in the selected unit: hours, days, or the salary they
// represent at the person's daily rate
const amount = (index, personId) =>
  convertHours(
    hours(index, personId),
    props.unit,
    organisation.value,
    props.dailyRates[personId]
  )

// cells with no time show '-': logged time at no rate reads as a 0 salary
const format = (value, logged = value) =>
  logged ? formatTimesheetValue(value, props.unit, use12HourClock.value) : '-'

// chip labels of the mobile cards, where the header row is hidden
const columnLabel = index => timesheetColumnLabel(props.detailLevel, index)

const duration = (index, personId) =>
  format(amount(index, personId), hours(index, personId))

const sumRow = (personId, cell) =>
  columnRange.value.reduce((total, index) => total + cell(index, personId), 0)

const sumColumn = (index, cell) =>
  props.people.reduce((total, person) => total + cell(index, person.id), 0)

const personTotals = computed(() =>
  Object.fromEntries(
    props.people.map(({ id }) => [
      id,
      format(sumRow(id, amount), sumRow(id, hours))
    ])
  )
)

const columnTotals = computed(() =>
  Object.fromEntries(
    columnRange.value.map(index => [
      index,
      format(sumColumn(index, amount), sumColumn(index, hours))
    ])
  )
)

const grandTotal = computed(() =>
  columnRange.value.reduce((sum, index) => sum + sumColumn(index, amount), 0)
)

// the cell formatter shows '-' for zero, the footer wants a number
const grandTotalLabel = computed(() =>
  grandTotal.value ? format(grandTotal.value) : 0
)

// the titles keep talking time when the cells show salaries
const titleUnit = computed(() => (props.unit === 'day' ? 'day' : 'hour'))

const spentKey = computed(() =>
  titleUnit.value === 'hour' ? 'main.hours_spent' : 'main.days_spent'
)

const expectedKey = computed(() =>
  titleUnit.value === 'hour' ? 'main.hours_expected' : 'main.days_expected'
)

const totalKey = computed(() =>
  props.unit === 'salary' ? 'timesheets.in_salary' : spentKey.value
)

// says why a cell is red, and how far the others are from it
const getCellTitle = (index, personId) => {
  const inTitleUnit = value =>
    Math.round(
      (titleUnit.value === 'day'
        ? hoursToDays(organisation.value, value)
        : value) * 10
    ) / 10
  const logged = inTitleUnit(hours(index, personId))
  const expected = inTitleUnit(expectedHours.value[index][personId])
  return [
    `${logged} ${t(spentKey.value, { count: logged })}`,
    `${expected} ${t(expectedKey.value, { count: expected })}`
  ].join(', ')
}

const isCurrentColumn = index =>
  isCurrentTimesheetColumn(props.detailLevel, index, {
    year: props.year,
    month: props.month
  })

const isOvertime = (index, personId) =>
  hours(index, personId) > expectedHours.value[index][personId]

const isDayOff = (personId, day) =>
  dayOffMap.value[personId]?.[
    moment({ year: props.year, month: props.month - 1, day }).format(
      'YYYY-MM-DD'
    )
  ] === true

const isWeekend = date => [0, 6].includes(date.day())

const isSelected = (personId, params) =>
  route.params.person_id === personId &&
  Object.entries(params).every(
    ([key, value]) => parseInt(route.params[key]) === value
  )

const getDetailRoute = (person, params) => ({
  name: `timesheets-${props.detailLevel}-person`,
  params: { person_id: person.id, ...params },
  query: route.query
})

const getWeekStart = week =>
  moment(`${props.year}-${week}`, 'YYYY-W').format('D MMM')

const getWeekTitle = week => {
  const beginning = moment(`${props.year}-${week}`, 'YYYY-W')
  const end = beginning.clone().add(6, 'days')
  const format = date => formatDisplayDate(date, dateFormat.value)
  return `${format(beginning)} - ${format(end)}`
}

// Watchers
// --------------------------------------------------------------------------
// opening the side column takes 400px from the wrapper, which can push the
// clicked cell out of view: wait for the resize, then scroll it back
watch(
  () => route.fullPath,
  async () => {
    await nextTick()
    bodyRef.value
      ?.querySelector('.selected')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }
)
</script>

<style lang="scss" scoped>
.datatable-wrapper {
  margin-bottom: 2em;
}

.datatable {
  // auto layout recomputes column widths from the cell contents at every
  // reload (the tbody unmounts while loading), which makes the columns
  // jitter: fixed layout sizes them from the header row once
  table-layout: fixed;
  width: 100%;
}

.datatable-body tr:first-child th,
.datatable-body tr:first-child td {
  border-top: 0;
}

.name {
  overflow: hidden;
  width: 230px;
  min-width: 230px;
}

.time {
  width: 70px;
  min-width: 70px;

  &.month {
    width: 80px;
    min-width: 80px;
  }

  &.year {
    width: 90px;
    min-width: 90px;
  }
}

.daytime {
  width: 60px;
  min-width: 60px;
}

.time,
.daytime {
  text-align: center;
  vertical-align: middle;
}

.week-start {
  color: var(--text-alt);
  display: block;
  font-weight: 400;
  white-space: nowrap;
}

th.actions {
  padding: 0;
  width: 100%;
  min-width: auto;
}

.total,
.column-total {
  font-weight: 600;
  text-align: center;
  vertical-align: middle;
}

// the total column closes the grid, the daily columns keep scrolling
.total {
  border-left: 1px solid var(--border);
  width: 80px;
  min-width: 80px;
}

// the other rows get their height from the avatar: pad the plain text
// cells so the total row does not look squeezed under them
.total-row th,
.total-row td {
  font-weight: 600;
  padding-bottom: 1em;
  padding-top: 1em;
}

// the admin lists' empty row, kept out of the table so the text stays
// centered in the viewport when the grid is wider than it
.empty {
  color: var(--text);
  font-size: 1.2rem;
  font-style: italic;
  padding-top: 30px;
  text-align: center;
}

a,
a:hover {
  color: inherit;
}

// logged hours above the expected ones for the column
.duration.warning {
  background: rgba($red, 0.15);
  color: $red;

  &:hover {
    background: rgba($red, 0.25);
  }
}

// translucent so the cell keeps the row striping and the hover colour
// underneath, in both themes. The global last-row rule paints cell
// backgrounds, so the row must be in the selector to win there too
.datatable-row td.weekend {
  background-color: rgba(0, 0, 0, 0.045);
}

.dark .datatable-row td.weekend {
  background-color: rgba(0, 0, 0, 0.16);
}

// after the weekend rule so that a weekend day still reads as today
.datatable-row td.today,
th.today {
  background-color: rgba($green, 0.08);
}

th.today {
  color: $green;
}

.duration:hover {
  background: var(--background-selectable);
}

.selected .duration {
  background: var(--background-selected);

  &:hover {
    background: var(--background-selected);
    cursor: default;
  }
}

.duration {
  border-radius: 0.3em;
  color: var(--text);
  font-weight: 600;
  outline: none;
  padding: 0.5em;

  &:focus-visible {
    box-shadow: 0 0 0 2px var(--background-selectable);
  }
}

.selected .duration.warning {
  background: $red;
  color: $black;
}

// one card per person with a chip per column, seven chips a line,
// following the admin lists' mobile layout (TaskTypeList)
@media screen and (max-width: 768px) {
  .datatable-wrapper {
    background: transparent;
    border: 0;
    overflow: visible;
  }

  .datatable.datatable--cards {
    overflow: visible;

    .datatable-body {
      overflow: visible;
    }

    // seven chips per line
    .datatable-row {
      flex-direction: row;
      flex-wrap: wrap;
      gap: 0.25em;
      padding: 0.75em;
    }

    // the name is a th, out of the shared td rules
    .datatable-row th.name {
      background: transparent !important;
      border: 0;
      min-width: 0;
      padding: 0 0 0.5em;
      position: static;
      width: 100%;

      // the sticky column shadow would stick out of the card
      &::after {
        display: none;
      }
    }

    .datatable-body td[data-label] {
      border-radius: 8px;
      flex-direction: column;
      gap: 0;
      justify-content: flex-start;
      padding: 0.4em 0;
      width: calc((100% - 6 * 0.25em) / 7);

      &::before {
        font-size: 0.7em;
        letter-spacing: 0;
        line-height: 1;
        margin-bottom: 0.2em;
        text-transform: none;
      }
    }

    // same box as the duration link so every chip line has one height
    .blank {
      padding: 0.5em;
    }

    // the tints, restated over the transparent cells of the shared cards
    .datatable-body td.weekend {
      background-color: rgba(0, 0, 0, 0.045) !important;
    }

    .datatable-body td.today {
      background-color: rgba($green, 0.08) !important;
    }

    // the person total closes the card as a full line
    .datatable-body td.total {
      flex-direction: row;
      justify-content: space-between;
      margin-top: 0.5em;
      padding: 0.75em 0.25em 0.25em;
      width: 100%;

      &::before {
        font-size: 0.8em;
        letter-spacing: 0.06em;
        margin-bottom: 0;
        text-transform: uppercase;
      }
    }
  }

  .dark .datatable.datatable--cards .datatable-body td.weekend {
    background-color: rgba(0, 0, 0, 0.16) !important;
  }
}
</style>
