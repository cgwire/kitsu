<template>
  <td class="validation">
    <div class="flexrow" v-if="displayMode === 'pie'">
      <pie-chart
        class="flexrow-item"
        width="70px"
        height="50px"
        :legend="false"
        :colors="colors"
        :data="pieData"
        :dataset="PIE_DATASET"
        :library="pieLibrary"
      />
      <span
        class="tag flexrow-item"
        :style="{ 'background-color': labelColor }"
        v-if="label"
      >
        {{ label }}
      </span>
    </div>
    <stats-bar :data="selectedData" v-else-if="displayMode === 'bars'" />
    <div class="heat-cell flexrow" v-else-if="displayMode === 'heatmap'">
      <stats-heat class="heat-tile" :data="selectedData" />
      <span
        class="tag heat-tag"
        :style="{ 'background-color': labelColor }"
        v-if="label"
      >
        {{ label }}
      </span>
    </div>
    <div v-else>
      <div :key="data[0]" v-for="data in selectedData">
        <template v-if="data[0]">
          <span class="stats-name" :style="{ color: data[2] }">
            {{ data[0] }}
          </span>
          <span> : </span>
          <span class="stats-value">
            {{ data[1] }} ({{ percent(data[1]) }}%)
          </span>
        </template>
      </div>
    </div>
    <span
      class="tag flexrow-item"
      :style="{ 'background-color': labelColor }"
      v-if="label && !['pie', 'heatmap'].includes(displayMode)"
    >
      {{ label }}
    </span>
  </td>
</template>

<script setup>
/**
 * Components to display statistics as a pie or as text depending on the
 * selected display mode. Stats are based on count data (nb of shots or assets)
 * or on frames data (sum of shot frames) depending on the selected count mode.
 * Data format:
 * [['name', count, 'color'], ...  ]
 */
import { computed } from 'vue'

import { getPieChartData } from '@/lib/stats'

import StatsBar from '@/components/widgets/StatsBar.vue'
import StatsHeat from '@/components/widgets/StatsHeat.vue'

// Chart.js outlines the slices with 2px by default, heavy on a 50px pie.
const PIE_DATASET = { borderWidth: 1 }

const props = defineProps({
  colors: { type: Array, required: true },
  countMode: { type: String, default: 'count' },
  data: { type: Array, default: () => [] },
  displayMode: { type: String, default: 'pie' },
  drawingsData: { type: Array, default: () => [] },
  framesData: { type: Array, default: () => [] },
  label: { type: String, default: '' },
  labelColor: { type: String, default: '#e67e22' }
})

const selectedData = computed(() => {
  if (props.countMode === 'frames') return props.framesData
  if (props.countMode === 'drawings') return props.drawingsData
  return props.data
})

const pieData = computed(() => getPieChartData(selectedData.value))

// The pie draws the small shares larger than they are: its tooltip gives the
// real value.
const pieLibrary = {
  plugins: {
    tooltip: {
      callbacks: {
        label: context =>
          String(selectedData.value[context.dataIndex]?.[1] ?? 0)
      }
    }
  }
}

const total = computed(() =>
  selectedData.value.reduce((acc, entry) => acc + (entry[1] || 0), 0)
)

const percent = value => {
  if (total.value === 0) return '0.00'
  return ((value / total.value) * 100).toFixed(2)
}
</script>

<style lang="scss" scoped>
.stats-name {
  text-transform: uppercase;
}

// The tile shares its line with the label of the cell.
.heat-tile {
  flex: 1;
}

.heat-tag {
  margin-left: 0.5em;
}

.tag {
  background: $orange-carrot;
  color: white;
  cursor: default;
  font-weight: bold;
  text-transform: uppercase;
}

@media screen and (max-width: 768px) {
  // The lists tint the desktop columns per task type with an inline style.
  .datatable--cards td.validation {
    border-left: 0 !important;
  }

  // Same width on every line, so the bars and tiles of a card compare.
  .datatable--cards .stats-bar,
  .datatable--cards .heat-tile {
    flex: 0 0 55%;
  }

  // The label of the cell moves next to the column name instead of taking
  // room from the value: a card line reads "column, label, value".
  .datatable--cards .heat-cell {
    display: contents;
  }

  .datatable--cards td.validation > div,
  .datatable--cards .heat-tile {
    order: 2;
  }

  // .datatable is repeated to outweigh the tag margins of the global card
  // layout.
  .datatable.datatable--cards td.validation > .tag,
  .datatable.datatable--cards .heat-cell > .tag {
    margin: 0 auto 0 0.5em;
    order: 1;
  }
}
</style>
