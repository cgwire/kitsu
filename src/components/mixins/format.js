/*
 * Set of functions to make data more readable.
 */
import { mapGetters } from 'vuex'

import { formatDate, formatFullDate, formatSimpleDate } from '@/lib/time'

export const formatListMixin = {

  created () {
  },

  mounted () {
  },

  beforeDestroy () {
  },

  computed: {
    ...mapGetters([
      'organisation'
    ])
  },

  methods: {
    formatBoolean (booleanValue) {
      return booleanValue ? this.$t('main.yes') : this.$t('main.no')
    },

    formatDate,
    formatFullDate,
    formatSimpleDate,

    formatDuration (duration) {
      if (duration) {
        return (duration / 60 / this.organisation.hours_by_day).toLocaleString(
          'fullwide', { maximumFractionDigits: 2 }
        )
      } else {
        return 0
      }
    },

    formatPriority (priority) {
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

    sanitizeInteger (value) {
      let val = 0
      if (typeof value === 'string') {
        value = value.replace(/\D/g, '')
        if (value && value.length > 0) val = parseInt(value) || 0
      }
      return val
    }
  }
}
