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
    }
  }
}
