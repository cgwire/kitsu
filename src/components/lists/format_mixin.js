export const formatListMixin = {

  created () {
  },

  mounted () {
  },

  beforeDestroy () {
  },

  computed: {
  },

  methods: {
    formatDuration (duration) {
      if (duration) {
        return (duration / 60 / 8).toLocaleString(
          'fullwide', { maximumFractionDigits: 1 }
        )
      } else {
        return 0
      }
    }
  }
}
