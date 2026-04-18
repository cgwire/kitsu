import { buildSelectionGrid, clearSelectionGrid } from '@/lib/selection'

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

  test('clearSelectionGrid with empty set', () => {
    const selectionGrid = new Set()
    clearSelectionGrid(selectionGrid)
    expect(selectionGrid.size).toBe(0)
  })
})
