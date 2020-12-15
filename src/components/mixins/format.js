/*
 * Set of functions to make data more readable.
 */
import { mapGetters } from 'vuex'

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

    formatDuration (duration) {
      if (duration) {
        return (duration / 60 / this.organisation.hours_by_day).toLocaleString(
          'fullwide', { maximumFractionDigits: 2 }
        )
      } else {
        return 0
      }
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
