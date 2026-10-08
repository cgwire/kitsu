<template>
  <div class="productivity-chart">
    <div class="productivity-toolbar">
      <div class="productivity-toolbar-group">
        <button-simple
          :data-level="option.value"
          :is-on="level === option.value"
          :key="option.value"
          :text="option.label"
          @click="emit('level-changed', option.value)"
          v-for="option in levelOptions"
        />
      </div>
      <div class="productivity-toolbar-group">
        <combobox-styled
          class="month-combobox"
          :model-value="`${month}`"
          :options="monthOptions"
          @update:model-value="onMonthChanged"
          v-if="level === 'day'"
        />
        <combobox-styled
          class="year-combobox"
          :model-value="`${year}`"
          :options="yearOptions"
          @update:model-value="onYearChanged"
        />
      </div>
      <span class="productivity-total">{{ totalLabel }}</span>
    </div>
    <div class="productivity-body">
      <spinner class="spinner" v-if="isLoading" />
      <div class="loading-error" v-else-if="isError">
        {{ $t('main.loading_error') }}
      </div>
      <div class="chart-wrapper" :class="{ week: level === 'week' }" v-else>
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
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useChartTheme } from '@/composables/chartTheme'
import { monthToString, range } from '@/lib/time'
import {
  formatTimesheetValue,
  getTimeSpentColumnTotals,
  getTimesheetColumns,
  isCurrentTimesheetColumn,
  timesheetColumnLabel,
  today
} from '@/lib/timesheet'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import Spinner from '@/components/widgets/Spinner.vue'

// Composables
// --------------------------------------------------------------------------
const { t } = useI18n()
const { font, theme } = useChartTheme()

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
  isError: { type: Boolean, default: false }
})

const emit = defineEmits(['column-selected', 'level-changed', 'period-changed'])

// Computed
// --------------------------------------------------------------------------
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

// minutes per column
const totals = computed(() =>
  getTimeSpentColumnTotals(props.timeSpents, props.level, columns.value, {
    productionId: props.productionId,
    taskTypeId: props.taskTypeId
  })
)

const totalHours = computed(
  () => totals.value.reduce((sum, total) => sum + total, 0) / 60
)

const totalLabel = computed(
  () =>
    `${formatTimesheetValue(totalHours.value, 'hour')} ` +
    t('main.hours_spent', { count: totalHours.value })
)

const seriesName = computed(() => t('main.hours_spent', { count: 2 }))

const chartData = computed(() => [
  {
    name: seriesName.value,
    color: '#00b242',
    data: columns.value.map((index, position) => [
      timesheetColumnLabel(props.level, index),
      round(totals.value[position] / 60)
    ]),
    dataset: {
      backgroundColor: props.selectedIndex
        ? columns.value.map(index =>
            index === props.selectedIndex ? '#00b242' : 'rgba(0, 178, 66, 0.55)'
          )
        : '#00b242',
      hoverBackgroundColor: '#33c168',
      borderRadius: 4,
      borderWidth: 0,
      maxBarThickness: 48
    }
  }
])

const chartLibrary = computed(() => ({
  maintainAspectRatio: false,
  onClick: (event, elements) => {
    if (elements.length) {
      emit('column-selected', columns.value[elements[0].index])
    }
  },
  onHover: (event, elements) => {
    event.native.target.style.cursor = elements.length ? 'pointer' : 'default'
  },
  plugins: { legend: { display: false } },
  scales: {
    x: {
      border: { color: theme.value.grid },
      grid: { display: false },
      ticks: {
        color: ({ index }) =>
          isCurrentColumn(columns.value[index]) ? '#00b242' : theme.value.muted,
        font,
        maxRotation: 0
      }
    },
    y: {
      beginAtZero: true,
      border: { display: false },
      grid: { color: theme.value.grid },
      ticks: { color: theme.value.muted, font }
    }
  }
}))

// Functions
// --------------------------------------------------------------------------
const round = value => Math.round(value * 10) / 10

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
  align-items: center;
  display: flex;
  gap: 1em;
}

.productivity-toolbar-group {
  align-items: center;
  display: flex;
  gap: 0.5em;
}

.productivity-total {
  color: var(--text-strong);
  font-size: 0.85rem;
  font-weight: 700;
  margin-left: auto;
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
    flex-wrap: wrap;
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
