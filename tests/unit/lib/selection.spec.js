// @vitest-environment node

import {
  addRowToSelectionGrid,
  buildSelectionGrid,
  clearSelectionGrid
} from '@/lib/selection'

describe('selection', () => {
  test('buildSelectionGrid', () => {
    const result = buildSelectionGrid()
    expect(result).toBeInstanceOf(Set)
    expect(result.size).toBe(0)
  })

  test('clearSelectionGrid', () => {
    const selectionGrid = new Set(['0-0', '1-1', '2-0'])
    clearSelectionGrid(selectionGrid)
    expect(selectionGrid.size).toBe(0)
  })

  // A task of the url out of the displayed rows selects its cell at row -1.
  test('addRowToSelectionGrid leaves the cell of a row out of the list', () => {
    const selectionGrid = new Set(['-1-3', '2-1'])

    expect([...addRowToSelectionGrid(selectionGrid, 1)]).toEqual([
      '-1-3',
      '3-1'
    ])
  })

  test('addRowToSelectionGrid keeps an empty grid', () => {
    const selectionGrid = new Set()

    expect(addRowToSelectionGrid(selectionGrid, 1)).toBe(selectionGrid)
  })

  test('addRowToSelectionGrid moves the cells from that row down', () => {
    const selectionGrid = new Set(['0-1', '2-0', '3-4'])

    expect([...addRowToSelectionGrid(selectionGrid, 2)]).toEqual([
      '0-1',
      '3-0',
      '4-4'
    ])
  })
})
