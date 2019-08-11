export const buildSelectionGrid = (maxX, maxY) => {
  const result = {}
  for (let i = 0; i < maxX; i++) {
    if (!result[i]) result[i] = {}
    for (let j = 0; j < maxY; j++) {
      result[i][j] = false
    }
  }
  return result
}

export const appendSelectionGrid = (grid, previousX, maxX, maxY) => {
  const result = { ...grid }
  for (let i = previousX; i < maxX; i++) {
    if (!result[i]) result[i] = {}
    for (let j = 0; j < maxY; j++) {
      result[i][j] = false
    }
  }
  return result
}

export const clearSelectionGrid = (selectionGrid) => {
  const maxX = Object.keys(selectionGrid).length
  const maxY = selectionGrid[0] ? Object.keys(selectionGrid[0]).length : 0
  for (let i = 0; i < maxX; i++) {
    for (let j = 0; j < maxY; j++) {
      if (selectionGrid[i][j]) selectionGrid[i][j] = false
    }
  }
  return selectionGrid
}
