<template>
  <div class="has-text-centered pa05">
    {{ activeAssets.length }}
    {{ $tc('assets.number', activeAssets.length) }}
    <template v-if="timeSpent > 0 || estimation > 0">
      ({{ formatDuration(timeSpent) }}
      {{
        isDurationInHours
          ? $tc('main.hours_spent', formatDuration(timeSpent, false))
          : $tc('main.days_spent', formatDuration(timeSpent, false))
      }},
      {{ formatDuration(estimation) }}
      {{
        isDurationInHours
          ? $tc('main.hours_estimated', formatDuration(estimation, false))
          : $tc('main.man_days', formatDuration(estimation, false))
      }})
    </template>
  </div>
</template>

<script>
import { formatListMixin } from '@/components/mixins/format'

export default {
  name: 'asset-list-numbers',

  mixins: [formatListMixin],

  props: {
    assets: {
      type: Array,
      default: () => []
    }
  },

  computed: {
    activeAssets() {
      return this.assets.flat().filter(a => !a.canceled)
    },

    timeSpent() {
      return this.activeAssets.reduce(
        (acc, asset) => acc + (asset.timeSpent || 0),
        0
      )
    },

    estimation() {
      return this.activeAssets.reduce(
        (acc, asset) => acc + (asset.estimation || 0),
        0
      )
    }
  }
}
</script>
