/* Returns the intersection of several arrays */
export const intersection = arrays => {
  let [first, ...rest] = arrays
  rest = rest.map(x => new Set(x))
  return first.filter(x => rest.every(a => a.has(x)))
}

export const flatten = arr => arr.reduce((acc, val) => acc.concat(val), [])
