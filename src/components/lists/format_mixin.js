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
    formatDuration (duration) {
      if (duration) {
        return (duration / 60 / this.organisation.hours_by_day).toLocaleString(
          'fullwide', { maximumFractionDigits: 1 }
        )
      } else {
        return 0
      }
    },

    formatBoolean (booleanValue) {
      return booleanValue ? this.$t('main.yes') : this.$t('main.no')
    },

    formatEstimation (estimation) {
      if (estimation) {
        if (estimation < 10) {
          return estimation
        } else {
          return this.formatDuration(estimation)
        }
      } else {
        return 0
      }
    }
  }
}
