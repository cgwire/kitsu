<template>
  <div class="has-text-centered pa05">
    {{ activeAssets.length }}
    {{ $t('assets.number', { count: activeAssets.length }) }}
    <template v-if="timeSpent > 0 || estimation > 0">
      ({{ formatDuration(timeSpent) }}
      {{
        isDurationInHours
          ? $t('main.hours_spent', { count: formatDuration(timeSpent, false) })
          : $t('main.days_spent', { count: formatDuration(timeSpent, false) })
      }},
      {{ formatDuration(estimation) }}
      {{
        isDurationInHours
          ? $t('main.hours_estimated', {
              count: formatDuration(estimation, false)
            })
          : $t('main.man_days', { count: formatDuration(estimation, false) })
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
