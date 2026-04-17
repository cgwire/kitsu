/*
 * Set of functions to make data more readable.
 */
import { mapGetters } from 'vuex'

import {
  formatDate,
  formatFullDate,
  formatSimpleDate,
  minutesToDays
} from '@/lib/time'

// Module-level cache for formatDuration results. toLocaleString is expensive
// (~0.05ms per call) and formatDuration is called per-row per-render (3000+
// times). The cache key includes every parameter that affects the output:
// minutes, format_duration_in_hours, toLocale, and hours_by_day (used by
// minutesToDays). The cache is capped at 10k entries and cleared when full.
const _durationCache = new Map()

export const formatListMixin = {
  computed: {
    ...mapGetters(['organisation']),

    isDurationInHours() {
      return this.organisation.format_duration_in_hours
    }
  },

  methods: {
    formatBoolean(booleanValue) {
      return booleanValue ? this.$t('main.yes') : this.$t('main.no')
    },

    formatDate,
    formatFullDate,
    formatSimpleDate,

    formatDuration(minutes, toLocale = true) {
      if (!minutes) {
        return 0
      }

      const inHours = this.organisation.format_duration_in_hours
      const hpd = this.organisation.hours_by_day || 8
      const cacheKey = `${minutes}-${inHours ? 1 : 0}-${toLocale ? 1 : 0}-${hpd}`
      const cached = _durationCache.get(cacheKey)
      if (cached !== undefined) return cached

      const duration = inHours
        ? minutes / 60
        : minutesToDays(this.organisation, minutes)

      let result
      if (toLocale) {
        result = duration.toLocaleString('fullwide', {
          maximumFractionDigits: 2
        })
      } else {
        result = Math.round(duration * 100) / 100
      }
      if (_durationCache.size > 10000) _durationCache.clear()
      _durationCache.set(cacheKey, result)
      return result
    },

    formatPriority(priority) {
      let label = priority + ''
      if (priority === 0) {
        label = 'normal'
      } else if (priority === 1) {
        label = this.$t('tasks.priority.high')
      } else if (priority === 2) {
        label = this.$t('tasks.priority.very_high')
      } else if (priority === 3) {
        label = this.$t('tasks.priority.emergency')
      }
      return label
    },

    formatPrioritySymbol(priority) {
      priority = Math.max(0, Math.min(priority, 3))
      return '!'.repeat(priority)
    },

    sanitizeInteger(value) {
      let val = 0
      if (typeof value === 'string') {
        value = value.replace(/\D/g, '')
        if (value && value.length > 0) val = parseInt(value) || 0
      }
      return val
    },

    sanitizeIntegerLight(value) {
      let val = null
      if (typeof value === 'string') {
        value = value.replace(/\D/g, '')
        if (value && value.length > 0) val = parseInt(value) || null
      }
      return val
    }
  }
}
