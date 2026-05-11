<template>
  <td class="validation">
    <div class="flexrow" v-if="displayMode === 'pie'">
      <pie-chart
        class="flexrow-item"
        width="70px"
        height="50px"
        :legend="false"
        :colors="colors"
        :data="selectedData"
      />
      <span
        class="tag flexrow-item"
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
      <span
        class="tag flexrow-item"
        :style="{ 'background-color': labelColor }"
        v-if="label"
      >
        {{ label }}
      </span>
    </div>
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

.tag {
  background: $orange-carrot;
  color: white;
  cursor: default;
  font-weight: bold;
  text-transform: uppercase;
}
</style>
