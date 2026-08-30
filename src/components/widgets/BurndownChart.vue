<template>
  <div class="burndown-chart">
    <spinner class="spinner" v-if="isLoading" />
    <div class="loading-error" v-else-if="isError">
      {{ $t('main.loading_error') }}
    </div>
    <template v-else-if="burndown">
      <div class="flexrow">
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
          :colors="chartColors"
          :curve="false"
          :data="chartData"
          :min="0"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import moment from 'moment-timezone'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useFormat } from '@/composables/format'
import { hoursToDays } from '@/lib/time'

import Spinner from '@/components/widgets/Spinner.vue'
import ToggleButton from '@/components/widgets/ToggleButton.vue'

// Composables
const { t } = useI18n()
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

const chartColors = ['#00b242', '#999']

// Computed
// --------------------------------------------------------------------------
const round1 = value => Math.round(value * 10) / 10
const toDays = minutes => round1(hoursToDays(organisation.value, minutes / 60))

const totalValue = computed(() =>
  estimationMode.value
    ? toDays(props.burndown.total_estimation)
    : props.burndown.total
)

const remainingSeries = computed(() => {
  const { start_date, done_by_day, total, total_estimation } = props.burndown
  const data = {}
  // accumulate in raw units and convert at store time so per-day rounding
  // never drifts away from the total
  let remaining = estimationMode.value ? total_estimation : total
  const store = date => {
    data[date] = estimationMode.value ? toDays(remaining) : remaining
  }
  if (start_date) store(start_date)
  done_by_day.forEach(day => {
    remaining -= estimationMode.value ? day.done_estimation : day.done
    store(day.date)
  })
  const lastDate = done_by_day.length
    ? done_by_day[done_by_day.length - 1].date
    : start_date
  const today = moment().format('YYYY-MM-DD')
  if (lastDate && today > lastDate) store(today)
  return data
})

const idealSeries = computed(() => {
  const { start_date, end_date } = props.burndown
  if (!start_date || !end_date || start_date === end_date) return {}
  return { [start_date]: totalValue.value, [end_date]: 0 }
})

const chartData = computed(() => [
  {
    name: estimationMode.value
      ? t('burndown.remaining_days')
      : t('burndown.remaining_tasks'),
    data: remainingSeries.value
  },
  {
    name: t('burndown.ideal'),
    data: idealSeries.value,
    dataset: { borderDash: [6, 6], pointRadius: 0 }
  }
])
</script>

<style lang="scss" scoped>
.burndown-chart {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 1em;
  min-height: 0;
}

.chart-wrapper {
  flex: 1;
  min-height: 0;
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
