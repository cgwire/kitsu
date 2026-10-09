<template>
  <div class="productivity-chart">
    <div class="productivity-toolbar">
      <combobox-styled
        class="metric-combobox"
        :label="$t('statistics.data_mode')"
        :model-value="metric"
        :options="metricOptions"
        @update:model-value="emit('metric-changed', $event)"
      />
      <combobox-styled
        class="level-combobox"
        :label="$t('quota.detail_label')"
        :model-value="level"
        :options="levelOptions"
        @update:model-value="emit('level-changed', $event)"
      />
      <combobox-styled
        class="month-combobox"
        :label="$t('quota.month_label')"
        :model-value="`${month}`"
        :options="monthOptions"
        @update:model-value="onMonthChanged"
        v-if="level === 'day'"
      />
      <combobox-styled
        class="year-combobox"
        :label="$t('quota.year_label')"
        :model-value="`${year}`"
        :options="yearOptions"
        @update:model-value="onYearChanged"
      />
      <template v-if="isQuotas">
        <combobox-styled
          class="count-mode-combobox"
          :label="$t('quota.count_label')"
          :model-value="countMode"
          :options="countModeOptions"
          @update:model-value="emit('count-mode-changed', $event)"
        />
        <combobox-styled
          class="quota-mode-combobox"
          :label="$t('quota.compute_mode')"
          :model-value="quotaMode"
          :options="quotaModeOptions"
          @update:model-value="emit('quota-mode-changed', $event)"
        />
        <info-question-mark
          class="quota-mode-info"
          :text="$t(`quota.explanation_${quotaMode}`)"
        />
      </template>
      <span class="productivity-total">{{ totalLabel }}</span>
      <span class="productivity-average" v-if="average">
        {{ averageLabel }}
      </span>
    </div>
    <div class="productivity-body">
      <spinner class="spinner" v-if="isLoading" />
      <div class="loading-error" v-else-if="isError">
        {{ $t('main.loading_error') }}
      </div>
      <div
        class="chart-wrapper"
        :class="{ week: level === 'week' }"
        ref="chartWrapperRef"
        v-else
      >
        <div class="chart-inner">
          <column-chart
            height="100%"
            :data="chartData"
            :library="chartLibrary"
            :min="0"
            :round="1"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Imports
// --------------------------------------------------------------------------
import moment from 'moment-timezone'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { useChartTheme } from '@/composables/chartTheme'
import { monthToString, range } from '@/lib/time'
import {
  formatTimesheetValue,
  getQuotaColumnTotals,
  getTimeSpentColumnTotals,
  getTimesheetColumns,
  isCurrentTimesheetColumn,
  timesheetColumnLabel,
  today
} from '@/lib/timesheet'

import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import InfoQuestionMark from '@/components/widgets/InfoQuestionMark.vue'
import Spinner from '@/components/widgets/Spinner.vue'

// Composables
// --------------------------------------------------------------------------
const { t } = useI18n()
const { font, theme } = useChartTheme()
const store = useStore()

// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
  level: { type: String, default: 'day' },
  year: { type: Number, default: today.year },
  month: { type: Number, default: today.month },
  timeSpents: { type: Array, default: () => [] },
  productionId: { type: String, default: null },
  taskTypeId: { type: String, default: null },
  selectedIndex: { type: Number, default: 0 },
  isLoading: { type: Boolean, default: false },
  isError: { type: Boolean, default: false },
  metric: { type: String, default: 'time' },
  quotaMode: { type: String, default: 'weighted' },
  countMode: { type: String, default: 'frames' },
  quotas: { type: Array, default: () => [] },
  isPaper: { type: Boolean, default: false }
})

const emit = defineEmits([
  'column-selected',
  'count-mode-changed',
  'level-changed',
  'metric-changed',
  'period-changed',
  'quota-mode-changed'
])

// State
// --------------------------------------------------------------------------
const GREEN = '#00b242'
const FADED_GREEN = 'rgba(0, 178, 66, 0.25)'

const chartWrapperRef = ref(null)

// Computed
// --------------------------------------------------------------------------
const isDarkTheme = computed(() => store.getters.isDarkTheme)
const organisation = computed(() => store.getters.organisation)

const isQuotas = computed(() => props.metric === 'quotas')

// lighter than the tick labels, a step above the grid
const axisColor = computed(() =>
  isDarkTheme.value ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.14)'
)

const metricOptions = computed(() => [
  { label: t('main.timeSpent'), value: 'time' },
  { label: t('quota.title'), value: 'quotas' }
])

const quotaModeOptions = computed(() => [
  { label: t('quota.weighted'), value: 'weighted' },
  { label: t('quota.feedback_date'), value: 'feedback' },
  { label: t('quota.weighted_done'), value: 'weighteddone' },
  { label: t('quota.done_date'), value: 'done' }
])

const countModeOptions = computed(() =>
  (props.isPaper ? ['drawings', 'count'] : ['frames', 'seconds', 'count']).map(
    value => ({ label: t(`quota.${value}`), value })
  )
)

const levelOptions = computed(() =>
  ['day', 'week', 'month'].map(value => ({ label: t(`main.${value}`), value }))
)

const monthOptions = computed(() =>
  range(1, props.year === today.year ? today.month : 12).map(month => ({
    label: monthToString(month),
    value: `${month}`
  }))
)

const yearOptions = computed(() =>
  range(today.year - 4, today.year).map(year => ({
    label: `${year}`,
    value: `${year}`
  }))
)

// getTimesheetColumns builds every level eagerly: the year one needs a
// first year even though this chart has no year level
const columns = computed(() =>
  getTimesheetColumns(props.level, {
    year: props.year,
    month: props.month,
    firstYear: props.year
  })
)

// hours per column in the time metric, count units in the quotas one
const totals = computed(() =>
  isQuotas.value
    ? getQuotaColumnTotals(props.quotas, props.level, columns.value, {
        year: props.year,
        month: props.month,
        taskTypeId: props.taskTypeId,
        countMode: props.countMode
      })
    : getTimeSpentColumnTotals(props.timeSpents, props.level, columns.value, {
        productionId: props.productionId,
        taskTypeId: props.taskTypeId
      }).map(minutes => minutes / 60)
)

const total = computed(() =>
  totals.value.reduce((sum, value) => sum + value, 0)
)

const totalLabel = computed(() =>
  isQuotas.value
    ? `${roundValue(total.value)} ${unitLabel.value}`
    : `${formatTimesheetValue(total.value, 'hour')} ` +
      t('main.hours_spent', { count: total.value })
)

const unitLabel = computed(() => t(`quota.${props.countMode}`))

const seriesName = computed(() =>
  isQuotas.value ? unitLabel.value : t('main.hours_spent', { count: 2 })
)

// the mean of the columns with data, as the Quota page averages
const average = computed(() => {
  const filled = totals.value.filter(value => value > 0)
  return filled.length
    ? filled.reduce((sum, value) => sum + value, 0) / filled.length
    : 0
})

const averageLabel = computed(
  () => `${t('quota.average')} ${roundValue(average.value)}`
)

// What the studio expects over each column: its hours per day times the
// working days, days off left aside. Weekends have none. The month view
// draws no target line.
const targets = computed(() => {
  const hoursByDay = organisation.value?.hours_by_day || 8
  return columns.value.map(index => {
    if (props.level === 'day') {
      const day = moment({
        year: props.year,
        month: props.month - 1,
        day: index
      })
      return day.isoWeekday() > 5 ? null : hoursByDay
    }
    return hoursByDay * 5
  })
})

const valueUnit = computed(() =>
  isQuotas.value ? unitLabel.value : t('main.hours_spent', { count: 2 })
)

const columnLabels = computed(() =>
  columns.value.map(index => timesheetColumnLabel(props.level, index))
)

const chartData = computed(() => {
  const selectedIndex = props.selectedIndex
  return [
    {
      name: seriesName.value,
      color: GREEN,
      data: columnLabels.value.map((label, position) => [
        label,
        roundValue(totals.value[position])
      ]),
      dataset: {
        // new colour functions on each selection: the chart only repaints a
        // dataset that changed, and the functions read the selection
        backgroundColor: context => barColor(context, selectedIndex),
        hoverBackgroundColor: '#33c168',
        borderRadius: { topLeft: 6, topRight: 6 },
        borderColor: ({ dataIndex }) =>
          barBorderColor(dataIndex, selectedIndex),
        borderSkipped: 'bottom',
        borderWidth: 1,
        barPercentage: 0.72,
        categoryPercentage: 0.9,
        maxBarThickness: 40,
        order: 1
      }
    },
    ...(isQuotas.value || props.level === 'month'
      ? []
      : [
          {
            name: t('main.hours_expected', { count: 2 }),
            color: theme.value.muted,
            data: columnLabels.value.map((label, position) => [
              label,
              targets.value[position]
            ]),
            dataset: {
              type: 'line',
              borderColor: theme.value.muted,
              borderDash: [6, 4],
              borderWidth: 1.5,
              fill: false,
              order: 0,
              pointHitRadius: 0,
              pointHoverRadius: 0,
              pointRadius: 0,
              // the weekends have no target: the line runs over them
              spanGaps: true
            }
          }
        ])
  ]
})

const chartLibrary = computed(() => ({
  maintainAspectRatio: false,
  onClick: (event, elements) => {
    const bar = elements.find(({ datasetIndex }) => !datasetIndex)
    if (bar) emit('column-selected', columns.value[bar.index])
  },
  onHover: (event, elements) => {
    event.native.target.style.cursor = elements.length ? 'pointer' : 'default'
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      // light on the dark theme, where a dark one melts into the panel
      backgroundColor: isDarkTheme.value
        ? 'rgba(240, 241, 243, 0.96)'
        : 'rgba(28, 30, 34, 0.92)',
      bodyColor: isDarkTheme.value ? '#1c1e22' : '#ffffff',
      titleColor: isDarkTheme.value ? '#1c1e22' : '#ffffff',
      bodyFont: font,
      caretSize: 0,
      cornerRadius: 8,
      displayColors: false,
      filter: ({ datasetIndex }) => !datasetIndex,
      padding: 10,
      titleFont: { ...font, weight: 'bold' },
      callbacks: {
        title: ([item]) =>
          props.level === 'week'
            ? `${t('main.week')} ${item.label}`
            : item.label,
        label: ({ raw }) => `${raw} ${valueUnit.value}`
      }
    }
  },
  scales: {
    x: {
      border: { color: axisColor.value },
      grid: { display: false },
      ticks: {
        color: ({ index }) =>
          isCurrentColumn(columns.value[index]) ? GREEN : theme.value.muted,
        font,
        maxRotation: 0,
        padding: 6
      }
    },
    y: {
      beginAtZero: true,
      border: { color: axisColor.value, dash: [4, 4] },
      grid: { color: theme.value.grid, drawTicks: false },
      ticks: { color: theme.value.muted, font, maxTicksLimit: 5, padding: 8 }
    }
  }
}))

// Functions
// --------------------------------------------------------------------------
// Around a selected bar, the others fade.
const isFadedBar = (dataIndex, selectedIndex) =>
  Boolean(selectedIndex) && columns.value[dataIndex] !== selectedIndex

const barBorderColor = (dataIndex, selectedIndex) =>
  isFadedBar(dataIndex, selectedIndex) ? FADED_GREEN : GREEN

// a vertical gradient once the chart has its area, a flat colour before
const barColor = ({ chart, dataIndex }, selectedIndex) => {
  const isFaded = isFadedBar(dataIndex, selectedIndex)
  const { chartArea, ctx } = chart
  if (!chartArea) return isFaded ? FADED_GREEN : GREEN
  const gradient = ctx.createLinearGradient(
    0,
    chartArea.bottom,
    0,
    chartArea.top
  )
  gradient.addColorStop(
    0,
    isFaded ? 'rgba(0, 178, 66, 0.06)' : 'rgba(0, 178, 66, 0.45)'
  )
  gradient.addColorStop(
    1,
    isFaded ? 'rgba(0, 178, 66, 0.15)' : 'rgba(0, 178, 66, 0.75)'
  )
  return gradient
}

const roundValue = value =>
  isQuotas.value && props.countMode === 'frames'
    ? Math.round(value)
    : Math.round(value * 10) / 10

const isCurrentColumn = index =>
  isCurrentTimesheetColumn(props.level, index, {
    year: props.year,
    month: props.month
  })

const onMonthChanged = month => {
  emit('period-changed', { year: props.year, month: Number(month) })
}

const onYearChanged = year => {
  emit('period-changed', { year: Number(year), month: props.month })
}

// on a phone the 53 weeks scroll sideways: open on the latest ones
const scrollToLatestWeeks = () => {
  const wrapper = chartWrapperRef.value
  if (
    props.level === 'week' &&
    wrapper &&
    wrapper.scrollWidth > wrapper.clientWidth
  ) {
    wrapper.scrollLeft = wrapper.scrollWidth
  }
}

// Watchers
// --------------------------------------------------------------------------
watch(
  () => [props.level, props.year, props.isLoading, props.isError],
  scrollToLatestWeeks,
  { flush: 'post' }
)

// Lifecycle
// --------------------------------------------------------------------------
onMounted(scrollToLatestWeeks)
</script>

<style lang="scss" scoped>
.productivity-chart {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 1em;
  min-height: 0;
}

.productivity-toolbar,
.productivity-body {
  --text-strong: var(--text-panel);

  background: var(--background-panel-raised);
  border-radius: 12px;
  padding: 1em;
}

.productivity-toolbar {
  // the combos carry their label above them: line them up on the fields
  align-items: flex-end;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75em 1em;
}

.quota-mode-info,
.productivity-total,
.productivity-average {
  // centred on the combo fields rather than on field plus label
  margin-bottom: 0.6em;
}

.productivity-average {
  border-left: 1px solid var(--border);
  color: var(--text-alt);
  font-size: 0.85rem;
  padding-left: 1em;
  white-space: nowrap;
}

.productivity-total {
  color: var(--text-strong);
  font-size: 0.85rem;
  font-weight: 700;
  margin-left: auto;
  white-space: nowrap;
}

.productivity-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.chart-wrapper {
  flex: 1;
  min-height: 300px;
}

.chart-inner {
  height: 100%;
}

.spinner {
  margin: 2em auto;
}

.loading-error {
  color: $red;
  margin-top: 2em;
  text-align: center;
}

@media screen and (max-width: 768px) {
  .productivity-toolbar {
    gap: 0.5em;
    padding: 0.5em;
  }

  // the page scrolls on a phone: the chart keeps a fixed height
  .productivity-body {
    flex: none;
    padding: 0.5em;
  }

  .chart-wrapper {
    flex: none;
    height: 260px;
    min-height: 0;
  }

  // 53 weeks do not fit a phone: the chart scrolls sideways
  .chart-wrapper.week {
    overflow-x: auto;

    .chart-inner {
      min-width: 900px;
    }
  }
}
</style>
