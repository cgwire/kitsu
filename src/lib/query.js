const query = {
  buildFilterString: (filters = []) => {
    let queryString = ''

    if (filters.length > 0) {
      const queryFilters = filters.map((filter) => {
        let field = ''
        if (filter.type === 'Production') {
          field = 'project_id'
        } else if (filter.type === 'Assignee') {
          field = 'assignees'
        } else if (filter.type === 'Sequence') {
          field = 'parent_id'
        }
        return { field, value: filter.value.id }
      })
      queryString = `&filter=${JSON.stringify(queryFilters)}`
    }

    return queryString
  },

  addFiltersToPath: (path, filters = []) => {
    if (filters.length > 0) {
      const queryString = query.buildFilterString(filters)
      path += `?${queryString}`
    }
    return path
  }
}

export default query
