<template>
  <div class="status-stats">
    <div :key="'stat-' + stat.name" class="stat-wrapper" v-for="stat in stats">
      <div
        :key="'stat-value-' + stat.name.toLowerCase()"
        class="stat-line"
        :title="stat.name + ': ' + stat.value"
        :style="{
          background: stat.color,
          width: (stat.value / statMax) * 100 + '%'
        }"
      >
        <span class="stat-text">{{ stat.name }} : {{ stat.value }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'status-stats',

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
    border-radius: 6px;
    display: inline-block;
    margin-right: 1em;
    margin-top: 0;
    margin-bottom: 0.4em;
    padding-left: 4px;
    padding-top: 1px;
    font-size: 0.8em;
    font-weight: bold;
    width: 100%;
    height: 32px;
  }

  .stat-text {
    display: inline-block;
    background: rgba(255, 255, 255, 0.8);
    font-weight: bold;
    padding: 4px 8px;
    margin-top: 3px;
    color: $black;
    border-radius: 6px;
    white-space: nowrap;
  }
}
</style>
