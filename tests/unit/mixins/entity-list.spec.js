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
