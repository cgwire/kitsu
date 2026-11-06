export const buildSelectionGrid = () => {
  return new Set()
}

export const clearSelectionGrid = selectionGrid => {
  for (const key of selectionGrid) {
    selectionGrid.delete(key)
  }
}

// The cells are keyed by their position, -1 for a row out of the list: a new
// row moves those it pushes down.
export const addRowToSelectionGrid = (selectionGrid, rowIndex) => {
  if (selectionGrid.size === 0) return selectionGrid
  return new Set(
    [...selectionGrid].map(key => {
      const separator = key.lastIndexOf('-')
      const x = Number(key.slice(0, separator))
      return `${x < rowIndex ? x : x + 1}${key.slice(separator)}`
    })
  )
}
