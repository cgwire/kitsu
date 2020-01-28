export const searchMixin = {

  created () {
  },

  mounted () {
  },

  beforeDestroy () {
  },

  computed: {

  },

  methods: {
    setSearchFromUrl () {
      const searchQuery = this.searchField.getValue()
      const searchFromUrl = this.$route.query.search
      if (!searchQuery && searchFromUrl) {
        this.searchField.setValue(searchFromUrl)
      }
    },

    setSearchInUrl () {
      const searchQuery = this.searchField.getValue()
      if (this.$route.query.search !== searchQuery) {
        this.$router.push({
          query: {
            search: searchQuery
          }
        })
      }
    },

    changeSearch (searchQuery) {
      this.searchField.setValue(searchQuery.search_query)
      this.searchField.$emit('change', searchQuery.search_query)
      if (this.resizeHeaders) this.resizeHeaders()
    },

    focusSearchField () {
      if (this.searchField) {
        this.searchField.focus()
      }
    }
  }
}
