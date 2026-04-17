export const buildSelectionGrid = () => {
  return new Set()
}

export const clearSelectionGrid = selectionGrid => {
  for (const key of selectionGrid) {
    selectionGrid.delete(key)
  }
}
