/*
 * Set of functions to facilitate usage of a search field in order to filter
 * list.
 */
export const searchMixin = {
  methods: {
    changeSearch(searchQuery) {
      this.searchField.setValue(searchQuery.search_query)
      this.searchField.$emit('change', searchQuery.search_query)
      if (this.resizeHeaders) this.resizeHeaders()
      if (this.applySearch) this.applySearch(searchQuery.search_query)
    },

    focusSearchField(options) {
      if (this.searchField) {
        this.searchField.focus(options)
      }
    },

    setSearchFromUrl() {
      const searchQuery = this.searchField.getValue()
      const searchFromUrl = this.$route.query.search
      if (!searchQuery && searchFromUrl) {
        this.searchField.setValue(searchFromUrl)
      }
    },

    setSearchInUrl() {
      const searchQuery = this.searchField.getValue()
      if (this.$route.query.search !== searchQuery) {
        this.$router.push({
          query: {
            search: searchQuery
          }
        })
      }
    }
  }
}
