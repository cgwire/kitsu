vi.mock('@/store', () => ({ default: {} }))

import EditList from '@/components/lists/EditList.vue'

const isEmptyList = EditList.computed.isEmptyList
const updateOffsets = EditList.methods.updateOffsets

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

// Sticky offsets add up full header widths: clientWidth leaves out the
// border and rounds, so each sticky column overlapped the previous one.
const header = (width, clientWidth = Math.floor(width) - 1) => ({
  clientWidth,
  getBoundingClientRect: () => ({ width })
})

describe('lists/EditList sticky offsets', () => {
  test('places the sticky columns after the full width of the previous ones', () => {
    const context = {
      isLoading: false,
      displaySettings: { showInfos: true },
      $refs: {
        'th-edit': header(300.5),
        'editor-0': [{ $el: header(121) }],
        'validation-0': [{ $el: header(151) }]
      },
      stickedVisibleMetadataDescriptors: [{ id: 'descriptor-1' }],
      stickedDisplayedValidationColumns: ['task-type-1']
    }
    context.$nextTick = callback => callback.call(context)

    updateOffsets.call(context)

    expect(context.offsets).toEqual({
      'editor-0': 300.5,
      'validation-0': 421.5
    })
  })
})
