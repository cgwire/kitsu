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
