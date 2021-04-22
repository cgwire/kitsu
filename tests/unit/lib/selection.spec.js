import {
  buildSelectionGrid,
  appendSelectionGrid,
  clearSelectionGrid
} from '@/lib/selection'

describe('selection', () => {
  test('buildSelectionGrid', () => {
    let result = buildSelectionGrid(2, 2)
    expect(result).toEqual({
      0: { 0: false, 1: false },
      1: { 0: false, 1: false }
    })
    result = buildSelectionGrid(0, 0)
    expect(result).toEqual({})
    result = buildSelectionGrid(3, 2)
    expect(result).toEqual({
      0: { 0: false, 1: false },
      1: { 0: false, 1: false },
      2: { 0: false, 1: false }
    })
  })

  test('appendSelectionGrid', () => {
    const selectionGrid = {
      0: { 0: true, 1: false },
      1: { 0: false, 1: true }
    }
    const result = appendSelectionGrid(selectionGrid, 1, 4, 2)
    expect(result).toEqual({
      0: { 0: true, 1: false },
      1: { 0: false, 1: false },
      2: { 0: false, 1: false },
      3: { 0: false, 1: false }
    })
  })

  test('clearSelectionGrid', () => {
    const selectionGrid = {
      0: { 0: true, 1: false },
      1: { 0: false, 1: true }
    }
    const result = clearSelectionGrid(selectionGrid)
    expect(result).toEqual({
      0: { 0: false, 1: false },
      1: { 0: false, 1: false }
    })
  })
})
