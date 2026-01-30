<template>
  <p class="has-text-centered nb-assets">
    {{ displayedAssetsLength }}
    {{ $tc('assets.number', displayedAssetsLength) }}
    <span v-if="displayedAssetsTimeSpent > 0 || displayedAssetsEstimation > 0">
      ({{ formatDuration(displayedAssetsTimeSpent) }}
      {{
        isDurationInHours
          ? $tc(
              'main.hours_spent',
              formatDuration(displayedAssetsTimeSpent, false)
            )
          : $tc(
              'main.days_spent',
              formatDuration(displayedAssetsTimeSpent, false)
            )
      }},
      {{ formatDuration(displayedAssetsEstimation) }}
      {{
        isDurationInHours
          ? $tc(
              'main.hours_estimated',
              formatDuration(displayedAssetsEstimation, false)
            )
          : $tc(
              'main.man_days',
              formatDuration(displayedAssetsEstimation, false)
            )
      }})
    </span>
  </p>
</template>

<script>
import { formatListMixin } from '@/components/mixins/format'

export default {
  name: 'asset-list-numbers',

  mixins: [formatListMixin],

  props: {
    displayedAssets: {
      type: Array,
      default: () => []
    }
  },

  computed: {
    // Flatten the grouped assets array (array of arrays)
    flattenedAssets() {
      return this.displayedAssets.flat()
    },

    // Count only non-canceled assets
    displayedAssetsLength() {
      return this.flattenedAssets.filter(a => !a.canceled).length
    },

    // Sum time spent from non-canceled assets
    displayedAssetsTimeSpent() {
      return this.flattenedAssets
        .filter(a => !a.canceled)
        .reduce((acc, asset) => acc + (asset.timeSpent || 0), 0)
    },

    // Sum estimation from non-canceled assets
    displayedAssetsEstimation() {
      return this.flattenedAssets
        .filter(a => !a.canceled)
        .reduce((acc, asset) => acc + (asset.estimation || 0), 0)
    }
  }
}
</script>

<style lang="scss" scoped>
.nb-assets {
  padding: 0.5em;
}
</style>
