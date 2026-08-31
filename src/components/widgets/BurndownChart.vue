<template>
  <div class="burndown-chart">
    <!-- while refiltering, the previous chart stays mounted so chartkick
         swaps the data in place: recreating the canvas mid layout used to
         stall the first paint -->
    <spinner class="spinner" v-if="isLoading && !burndown" />
    <div class="loading-error" v-else-if="isError">
      {{ $t('main.loading_error') }}
    </div>
    <template v-else-if="burndown">
      <div class="flexrow chart-header">
        <span class="flexrow-item legend-item">
          <span class="legend-line remaining"></span>
          {{
            estimationMode
              ? $t('burndown.remaining_days')
              : $t('burndown.remaining_tasks')
          }}
        </span>
        <span class="flexrow-item legend-item" v-if="hasProjection">
          <span class="legend-line projection"></span>
          {{ $t('burndown.projection') }}
        </span>
        <span class="flexrow-item legend-item" v-if="hasIdeal">
          <span class="legend-line ideal"></span>
          {{ $t('burndown.ideal') }}
        </span>
        <div class="filler"></div>
        <toggle-button
          class="flexrow-item"
          :label="$t('burndown.estimations')"
          v-model="estimationMode"
        />
      </div>
      <div class="chart-wrapper">
        <line-chart
          height="100%"
          :curve="false"
          :data="chartData"
          :decimal="decimalSeparator"
          :library="chartLibrary"
          :min="0"
          :thousands="thousandsSeparator"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { Chart } from 'chart.js'
import moment from 'moment-timezone'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { useFormat } from '@/composables/format'
import { hoursToDays } from '@/lib/time'

import Spinner from '@/components/widgets/Spinner.vue'
import ToggleButton from '@/components/widgets/ToggleButton.vue'

// the plugin is registered globally but only draws when a chart passes a
// date through its options, so the other chartkick charts are unaffected
Chart.register({
  id: 'todayLine',
  // a light wash under the datasets marks the zone beyond today, where
  // only the ideal slope continues
  beforeDatasetsDraw(chart, args, options) {
    if (!options.date || !options.futureFill) return
    const { x, y } = chart.scales
    if (!x || !y) return
    const position = x.getPixelForValue(new Date(options.date).getTime())
    if (position < x.left || position >= x.right) return
    const context = chart.ctx
    context.save()
    context.fillStyle = options.futureFill
    context.fillRect(position, y.top, x.right - position, y.bottom - y.top)
    context.restore()
  },
  afterDatasetsDraw(chart, args, options) {
    if (!options.date) return
    const { x, y } = chart.scales
    if (!x || !y) return
    const position = x.getPixelForValue(new Date(options.date).getTime())
    if (position < x.left || position > x.right) return
    const context = chart.ctx
    context.save()
    context.strokeStyle = options.color
    context.setLineDash([3, 4])
    context.lineWidth = 1
    context.beginPath()
    context.moveTo(position, y.top)
    context.lineTo(position, y.bottom)
    context.stroke()
    if (options.label) {
      const flip = position > x.right - 60
      context.setLineDash([])
      context.fillStyle = options.color
      context.font = '10px Lato, sans-serif'
      context.textAlign = flip ? 'right' : 'left'
      context.textBaseline = 'top'
      context.fillText(
        options.label,
        flip ? position - 5 : position + 5,
        y.top + 2
      )
    }
    context.restore()
  }
})

// Composables
const { t } = useI18n()
const store = useStore()
const { organisation } = useFormat()

// Props
const props = defineProps({
  burndown: { type: Object, default: null },
  isLoading: { type: Boolean, default: false },
  isError: { type: Boolean, default: false }
})

// State
// --------------------------------------------------------------------------
const estimationMode = ref(false)

const today = moment().format('YYYY-MM-DD')

// Computed
// --------------------------------------------------------------------------
const isDarkTheme = computed(() => store.getters.isDarkTheme)

// the canvas cannot resolve var(--*) tokens, so the theme values are pinned
const theme = computed(() =>
  isDarkTheme.value
    ? {
        fillTop: 'rgba(0, 178, 66, 0.28)',
        fillBottom: 'rgba(0, 178, 66, 0.03)',
        futureFill: 'rgba(255, 255, 255, 0.04)',
        grid: 'rgba(255, 255, 255, 0.08)',
        muted: '#9a9da8'
      }
    : {
        fillTop: 'rgba(0, 178, 66, 0.22)',
        fillBottom: 'rgba(0, 178, 66, 0.02)',
        futureFill: 'rgba(0, 0, 0, 0.03)',
        grid: 'rgba(0, 0, 0, 0.06)',
        muted: '#7b7e87'
      }
)

// the browser locale, not the UI locale: formatDuration and every number
// in the app already format this way. [1] is the grouping char in every
// locale that groups; guard the ones that do not, where it is a digit
const groupingChar = (1000).toLocaleString()[1]
const thousandsSeparator = /\d/.test(groupingChar) ? undefined : groupingChar
const decimalSeparator = (1.1).toLocaleString()[1]

const round1 = value => Math.round(value * 10) / 10
const toDays = minutes => round1(hoursToDays(organisation.value, minutes / 60))

// the last day the chart displays: the deadline, or the last activity
// when it ran late. An ended schedule stops there, it does not stretch
// to today
const chartEnd = computed(() => {
  const { end_date, done_by_day } = props.burndown
  const lastDone = done_by_day.length
    ? done_by_day[done_by_day.length - 1].date
    : null
  return [end_date, lastDone].filter(Boolean).sort().pop() || today
})

const remainingSeries = computed(() => {
  const { start_date, done_by_day, total, total_estimation } = props.burndown
  const data = {}
  // accumulate in raw units and convert at store time so per-day rounding
  // never drifts away from the total
  let remaining = estimationMode.value ? total_estimation : total
  const record = date => {
    data[date] = estimationMode.value ? toDays(remaining) : remaining
  }
  if (start_date) record(start_date)
  done_by_day.forEach(day => {
    remaining -= estimationMode.value ? day.done_estimation : day.done
    record(day.date)
  })
  const lastDate = done_by_day.length
    ? done_by_day[done_by_day.length - 1].date
    : start_date
  const curveEnd = today < chartEnd.value ? today : chartEnd.value
  if (lastDate && curveEnd > lastDate) record(curveEnd)
  return data
})

const idealSeries = computed(() => {
  const { start_date, end_date, done_by_day } = props.burndown
  // anchor the slope where the drawn curve begins: activity can predate
  // the schedule start date, and a shifted anchor reads as a broken chart
  const firstActivity = done_by_day[0]?.date
  const start =
    start_date && firstActivity
      ? [start_date, firstActivity].sort()[0]
      : start_date || firstActivity
  if (!start || !end_date || end_date <= start) return {}
  const total = estimationMode.value
    ? toDays(props.burndown.total_estimation)
    : props.burndown.total
  const data = { [start]: total, [end_date]: 0 }
  // overdue chart: stay flat at zero up to the displayed end
  if (chartEnd.value > end_date) data[chartEnd.value] = 0
  return data
})

const hasIdeal = computed(() => Object.keys(idealSeries.value).length > 0)

// rough forecast: extend the curve from today at the average velocity
// observed since the first day of activity
const projectionSeries = computed(() => {
  const { done_by_day, total, total_estimation } = props.burndown
  const grandTotal = estimationMode.value ? total_estimation : total
  const doneSum = done_by_day.reduce(
    (sum, day) => sum + (estimationMode.value ? day.done_estimation : day.done),
    0
  )
  const remaining = grandTotal - doneSum
  const firstActivity = done_by_day[0]?.date
  const days = firstActivity ? moment(today).diff(firstActivity, 'days') : 0
  // nothing to project when the schedule already ended
  if (today >= chartEnd.value) return {}
  if (remaining <= 0 || doneSum <= 0 || days <= 0) return {}
  const velocity = doneSum / days
  const convert = value =>
    estimationMode.value ? toDays(value) : Math.round(value)
  const data = { [today]: convert(remaining) }
  const zeroDate = moment(today)
    .add(Math.ceil(remaining / velocity), 'days')
    .format('YYYY-MM-DD')
  if (zeroDate <= chartEnd.value) {
    data[zeroDate] = 0
  } else {
    const daysToEnd = moment(chartEnd.value).diff(today, 'days')
    data[chartEnd.value] = convert(remaining - velocity * daysToEnd)
  }
  return data
})

const hasProjection = computed(
  () => Object.keys(projectionSeries.value).length > 1
)

const gradientFill = context => {
  const { ctx, chartArea } = context.chart
  if (!chartArea) return theme.value.fillBottom
  const gradient = ctx.createLinearGradient(
    0,
    chartArea.top,
    0,
    chartArea.bottom
  )
  gradient.addColorStop(0, theme.value.fillTop)
  gradient.addColorStop(1, theme.value.fillBottom)
  return gradient
}

// chartkick pads every series with nulls on the merged x axis, and its
// spanGaps: false default would break the sparse dashed lines there
const dashedDataset = {
  borderDash: [6, 6],
  borderWidth: 1.5,
  fill: false,
  order: 1,
  pointHoverRadius: 0,
  pointRadius: 0,
  spanGaps: true
}

const chartData = computed(() => {
  const series = [
    {
      name: estimationMode.value
        ? t('burndown.remaining_days')
        : t('burndown.remaining_tasks'),
      color: '#00b242',
      data: remainingSeries.value,
      dataset: {
        backgroundColor: gradientFill,
        borderWidth: 1.5,
        fill: true,
        // higher order draws first, so the dashed lines stay above the fill
        order: 2,
        pointHitRadius: 8,
        pointHoverRadius: 4,
        pointRadius: 0,
        // the other series' anchor dates insert nulls in this one on the
        // merged x axis; without spanGaps they cut the curve into pieces
        spanGaps: true
      }
    }
  ]
  if (hasProjection.value) {
    series.push({
      name: t('burndown.projection'),
      color: '#00b242',
      data: projectionSeries.value,
      dataset: dashedDataset
    })
  }
  if (hasIdeal.value) {
    series.push({
      name: t('burndown.ideal'),
      color: '#999999',
      data: idealSeries.value,
      dataset: dashedDataset
    })
  }
  return series
})

const chartLibrary = computed(() => {
  const font = { family: 'Lato, sans-serif' }
  return {
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    plugins: {
      legend: { display: false },
      todayLine: {
        color: theme.value.muted,
        date: today,
        futureFill: theme.value.futureFill,
        label: t('schedule.today')
      }
    },
    scales: {
      x: {
        border: { color: theme.value.grid },
        grid: { display: false },
        ticks: { color: theme.value.muted, font, maxTicksLimit: 12 }
      },
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: { color: theme.value.grid },
        ticks: { color: theme.value.muted, font, precision: 0 }
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.burndown-chart {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 1em;
  min-height: 0;
}

.chart-header {
  padding: 0 1em;
}

.legend-item {
  align-items: center;
  color: var(--text);
  display: inline-flex;
  font-size: 0.9em;
  gap: 0.5em;
}

.legend-line {
  border-radius: 2px;
  display: inline-block;
  width: 18px;

  &.remaining {
    border-top: 3px solid $green;
  }

  &.projection {
    border-top: 2px dashed $green;
  }

  &.ideal {
    border-top: 2px dashed $grey;
  }
}

.chart-wrapper {
  background: var(--background-alt);
  border-radius: 10px;
  flex: 1;
  min-height: 250px;
  padding: 2.5em;
}

.spinner {
  margin: 2em auto;
}

.loading-error {
  color: $red;
  margin-top: 2em;
  text-align: center;
}
</style>
