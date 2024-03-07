<template>
  <div class="status-stats">
    <div :key="'stat-' + stat.name" class="stat-wrapper" v-for="stat in stats">
      <div>{{ stat.name }} : {{ stat.value }}</div>
      <div
        :key="'stat-value-' + stat.name.toLowerCase()"
        class="stat-line"
        :title="stat.name + ': ' + stat.value"
        :style="{
          background: stat.color,
          width: (stat.value / statMax) * 100 + '%'
        }"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'status-stats',

  components: {},

  data() {
    return {}
  },

  props: {
    stats: Array
  },

  computed: {
    statMax() {
      if (this.stats) {
        return this.stats.reduce((max, stat) => {
          return Math.max(stat.value, max)
        }, 0)
      } else {
        return 0
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.status-stats {
  text-align: left;
  width: 100%;
  flex: 1;

  .stat-line {
    border: 1px solid var(--border-alt);
    display: inline-block;
    margin-right: 1em;
    margin-top: 0;
    margin-bottom: 0.4em;
    font-size: 0.8em;
    font-weight: bold;
    width: 100%;
    height: 12px;
    border-radius: 2px;
  }
}
</style>
