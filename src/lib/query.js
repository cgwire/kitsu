export const buildQueryString = (path, params) => {
  const result = `${path}?`
  const couples = []
  Object.keys(params).forEach((key) => {
    if (params[key]) couples.push(`${key}=${params[key]}`)
  })
  return result + couples.join('&')
}
