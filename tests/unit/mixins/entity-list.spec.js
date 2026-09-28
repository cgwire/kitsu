vi.mock('@/store/modules/assets', () => ({ default: {} }))
vi.mock('@/store/modules/edits', () => ({ default: {} }))
vi.mock('@/store/modules/episodes', () => ({ default: {} }))
vi.mock('@/store/modules/sequences', () => ({ default: {} }))
vi.mock('@/store/modules/shots', () => ({ default: {} }))

import { entityListMixin } from '@/components/mixins/entity_list'

const makeContext = () => {
  const menus = {
    headerMenu: document.createElement('div'),
    headerMetadataMenu: document.createElement('div'),
    headerFieldMenu: document.createElement('div')
  }
  const context = {
    $refs: Object.fromEntries(
      Object.entries(menus).map(([name, element]) => [name, { $el: element }])
    ),
    hideHeaderMenu: entityListMixin.methods.hideHeaderMenu,
    hideHeaderMenus: entityListMixin.methods.hideHeaderMenus
  }
  return { context, menus }
}

describe('entity list header menus', () => {
  test('closes a visible menu when its current column is clicked', () => {
    const { context, menus } = makeContext()

    entityListMixin.methods.showHeaderMenuAt.call(
      context,
      'headerFieldMenu',
      {},
      () => document.createElement('th'),
      {},
      true
    )

    expect(menus.headerFieldMenu.classList).toContain('hidden')
  })

  test('repositions a visible menu when another column is clicked', () => {
    const { context, menus } = makeContext()
    const header = document.createElement('th')
    header.getBoundingClientRect = () => ({
      bottom: 60,
      left: 20,
      width: 150
    })

    entityListMixin.methods.showHeaderMenuAt.call(
      context,
      'headerFieldMenu',
      {},
      () => header,
      { left: -3, top: 11 },
      false
    )

    expect(menus.headerFieldMenu.classList).not.toContain('hidden')
    expect(menus.headerFieldMenu.style.left).toBe('17px')
    expect(menus.headerFieldMenu.style.top).toBe('71px')
    expect(menus.headerFieldMenu.style.width).toBe('149px')
  })
})

// Sticky offsets add up full header widths: clientWidth leaves out the
// border and rounds, so each sticky column overlapped the previous one.
const header = (width, clientWidth = Math.floor(width) - 1) => ({
  clientWidth,
  getBoundingClientRect: () => ({ width })
})

describe('entity list sticky offsets', () => {
  test('places the sticky columns after the full width of the previous ones', () => {
    const context = {
      isLoading: false,
      $nextTick: callback => callback(),
      $refs: {
        'th-name': header(200.5),
        'validation-0': [{ $el: header(151) }],
        'validation-1': [{ $el: header(151) }]
      },
      displaySettings: { showInfos: true },
      stickedVisibleMetadataDescriptors: [],
      stickedDisplayedValidationColumns: ['task-type-1', 'task-type-2']
    }

    entityListMixin.methods.updateOffsets.call(context)

    expect(context.offsets).toEqual({
      'validation-0': 200.5,
      'validation-1': 351.5
    })
  })

  test('places the sticky metadata columns after the name', () => {
    const context = {
      isLoading: false,
      $nextTick: callback => callback(),
      $refs: {
        'th-name': header(200.5),
        'editor-0': [{ $el: header(121) }],
        'validation-0': [{ $el: header(151) }]
      },
      displaySettings: { showInfos: true },
      stickedVisibleMetadataDescriptors: [{ id: 'descriptor-1' }],
      stickedDisplayedValidationColumns: ['task-type-1']
    }

    entityListMixin.methods.updateOffsets.call(context)

    expect(context.offsets).toEqual({
      'editor-0': 200.5,
      'validation-0': 321.5
    })
  })
})
