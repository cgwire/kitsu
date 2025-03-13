/*
 * Set of functions to facilitate usage of a search field in order to filter
 * list.
 */
export const searchMixin = {
  methods: {
    removeSearchQuery(searchQuery) {
      this.removeShotSearch(searchQuery).catch(console.error)
    },

    focusSearchField(options) {
      this.searchField?.focus(options)
    },

    confirmBuildFilter(query) {
      this.modals.isBuildFilterDisplayed = false
      this.searchField.setValue(query)
      this.setSearchInUrl(query)
      this.onSearchChange()
    },

    onSearchChange(clearSelection = true) {
      if (!this.searchField) return
      const searchQuery = this.searchField.getValue() || ''
      this.setSearchInUrl(searchQuery)
      if (clearSelection) {
        setTimeout(this.clearSelection, 10)
      }
    },

    applySearch(search) {
      this.searchField?.setValue(search)
      const setSearchFunction = `set${this.entityTypeName}Search`
      if (this[setSearchFunction]) {
        this[setSearchFunction](search || '')
      }
      if (this.resizeHeaders) this.resizeHeaders()
    },

    applySearchFromUrl() {
      let searchQuery = ''
      if (this.$route.query.search && this.$route.query.search.length > 0) {
        searchQuery = `${this.$route.query.search}`
      }
      this.applySearch(searchQuery)
    },

    setSearchFromUrl() {
      const searchQuery = this.searchField?.getValue()
      const searchFromUrl = this.$route.query.search
      if (!searchQuery && searchFromUrl) {
        this.searchField?.setValue(searchFromUrl)
      }
    },

    setSearchInUrl(query) {
      const searchQuery = query || this.searchField?.getValue()
      this.$router.push({
        query: {
          ...this.$route.query,
          search: searchQuery || undefined
        }
      })
    }
  },

  watch: {
    $route(newRoute, previousRoute) {
      if (newRoute.query.episode_id !== previousRoute.query.episode_id) {
        this.clearSelection()
      } else {
        if (
          !this.$route.query ||
          !this.type ||
          previousRoute.query.task_id !== newRoute.query.task_id
        ) {
          if (
            newRoute.query.task_id &&
            previousRoute.query.task_id !== newRoute.query.task_id
          ) {
            const listName = `${this.type}-list`
            if (this.clearSelection) {
              this.clearSelection()
            }
            this.$refs[listName]?.selectTaskFromQuery()
          }
          return
        }

        const search = this.$route.query.search
        const searchTextVariable = `${this.type}SearchText`
        if (search !== this[searchTextVariable]) {
          this.applySearchFromUrl()
          if (this.clearSelection) {
            this.clearSelection()
          }
        }
      }
    }
  }
}
