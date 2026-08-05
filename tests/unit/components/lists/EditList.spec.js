vi.mock('@/store', () => ({ default: {} }))

import EditList from '@/components/lists/EditList.vue'

const isEmptyList = EditList.computed.isEmptyList

// displayedEdits is a flat list of edits, not a list of groups like
// displayedShots.
const buildContext = overrides => ({
  displayedEdits: [],
  isLoading: false,
  isError: false,
  editSearchText: '',
  ...overrides
})

describe('lists/EditList', () => {
  describe('isEmptyList', () => {
    test('a production without any edit shows the empty state', () => {
      expect(isEmptyList.call(buildContext())).toBe(true)
    })

    test('a production with edits hides the empty state', () => {
      const context = buildContext({ displayedEdits: [{ id: 'edit-1' }] })
      expect(isEmptyList.call(context)).toBe(false)
    })

    test('a search returning nothing keeps the empty state hidden', () => {
      const context = buildContext({ editSearchText: 'unknown' })
      expect(isEmptyList.call(context)).toBe(false)
    })

    test('the empty state waits for the loading to end', () => {
      expect(isEmptyList.call(buildContext({ isLoading: true }))).toBe(false)
    })

    test('the empty state stays hidden on error', () => {
      expect(isEmptyList.call(buildContext({ isError: true }))).toBe(false)
    })
  })
})
