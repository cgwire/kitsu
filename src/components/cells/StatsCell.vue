<template>
<td class="validation">
  <div v-if="displayMode === 'pie'">
    <pie-chart
      width="70px"
      height="50px"
      :legend="false"
      :colors="colors"
      :data="selectedData"
    />
  </div>
  <div v-else>
    <div
      :key="data[0]"
      v-if="data[0]"
      v-for="data in selectedData">
      <span class="stats-name" :style="{ color: data[2] }">
       {{ data[0] }}
      </span>
      <span>
      :
      </span>
      <span class="stats-value">
        {{ data[1] }} ({{ percent(data[1]) }}%)
      </span>
    </div>
  </div>
</td>
</template>

<script>
/**
 * Components to display statistics as a pie or as text depending on the
 * selected display mode. Stats are based on count data (nb of shots or assets)
 * or on frames data (sum of shot frames) depending on the selected count mode.
 */
export default {
  name: 'stats-cell',
  components: {},

  props: {
    colors: {
      type: Array,
      required: true
    },
    countMode: {
      type: String,
      default: 'count'
    },
    data: {
      type: Array,
      default: () => []
    },
    displayMode: {
      type: String,
      default: 'pie'
    },
    framesData: {
      type: Array,
      default: () => []
    }
  },

  computed: {
    selectedData () {
      if (this.countMode === 'frames') {
        return this.framesData
      } else {
        return this.data
      }
    },

    total () {
      return this.selectedData.reduce((acc, entry) => {
        if (entry[1]) {
          return acc + entry[1]
        } else {
          return acc
        }
      }, 0)
    }
  },

  methods: {
    percent (value) {
      let percent = 0
      if (this.total > 0) {
        percent = (value / this.total) * 100
      }
      return percent.toFixed(2)
    }
  }
}
</script>

<style lang="scss" scoped>
.stats-name {
  text-transform: uppercase;
}
</style>
