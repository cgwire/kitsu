/**
 * Finds the intersection of multiple arrays
 * @param {Array<Array>} arrays - An array containing the arrays to compare
 * @returns {Array} - An array containing only elements present in all arrays
 */
export const intersection = arrays => {
  if (!arrays?.length) return []
  const [first, ...rest] = arrays
  const sets = rest.map(arr => new Set(arr))
  return first.filter(item => sets.every(set => set.has(item)))
}
