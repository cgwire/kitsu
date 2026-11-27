/**
 * Builds a query string by concatenating the given path and parameters.
 * Example: buildQueryString('/api/data/tasks/open-tasks', { status: 'open' })
 * returns '/api/data/tasks/open-tasks?status=open'
 *
 * @param {string} path - The base path for the query.
 * @param {Object} params - The parameters to be included in the query string.
 * @returns {string} The generated query string.
 */
export const buildQueryString = (path, params) => {
  const result = `${path}?`
  const pairs = []
  Object.keys(params).forEach(key => {
    if (
      params[key] ||
      (typeof params[key] === 'boolean' && params[key] === false)
    )
      pairs.push(
        `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
      )
  })
  return result + pairs.join('&')
}

/**
 * A query as one string, whatever the order of its keys: two queries with the
 * same filters give the same string.
 *
 * @param {Object|string} query - A route query, or the string of a saved one.
 * @returns {string} The query string, its keys sorted.
 */
export const toSortedQueryString = query => {
  const searchParams = new URLSearchParams(query)
  searchParams.sort()
  return searchParams.toString()
}
