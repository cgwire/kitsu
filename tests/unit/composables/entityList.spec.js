vi.mock('@/store', () => ({ default: {} }))

import { computed, defineComponent } from 'vue'

import {
  getNextEditableCell,
  getStickyOffsets,
  showHeaderMenuAt,
  useEntityList
} from '@/composables/entityList'

import { mountEntityList, production } from '../fixtures/entity-list'

// A bare host: the composable only needs the list props and emit.
const Host = defineComponent({
  props: {
    departmentFilter: { type: Array, default: () => [] },
    displaySettings: { type: Object, default: () => ({}) },
    isError: { type: Boolean, default: false },
    isLoading: { type: Boolean, default: false },
    validationColumns: { type: Array, default: () => [] }
  },
  emits: ['metadata-changed'],
  setup(props, { emit }) {
    const list = useEntityList({
      type: 'shot',
      props,
      emit,
      entities: computed(() => []),
      filledColumns: computed(() => ({})),
      metadataDescriptors: computed(() => []),
      isEmptyList: computed(() => true)
    })
    return { list }
  },
  template: '<div />'
})

describe('entity list header menus', () => {
  const makeMenus = () => ({
    headerMenu: document.createElement('div'),
    headerMetadataMenu: document.createElement('div'),
    headerFieldMenu: document.createElement('div')
  })

  test('closes a visible menu when its current column is clicked', () => {
    const menus = makeMenus()

    showHeaderMenuAt(
      menus,
      'headerFieldMenu',
      {},
      () => document.createElement('th'),
      {},
      true
    )

    expect(menus.headerFieldMenu.classList).toContain('hidden')
  })

  test('repositions a visible menu when another column is clicked', () => {
    const menus = makeMenus()
    menus.headerMenu.classList.remove('hidden')
    const header = document.createElement('th')
    header.getBoundingClientRect = () => ({
      bottom: 60,
      left: 20,
      width: 150
    })

    showHeaderMenuAt(
      menus,
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
    // The other menus close.
    expect(menus.headerMenu.classList).toContain('hidden')
  })

  // The lists render their header menus as components.
  const HeaderMenu = { template: '<div class="header-menu hidden" />' }

  const MenuHost = {
    ...Host,
    components: { HeaderMenu },
    template: `
      <div>
        <header-menu ref="headerMenu" />
        <header-menu ref="headerMetadataMenu" />
        <header-menu ref="headerFieldMenu" />
      </div>
    `
  }

  const pressEscape = () => {
    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true
    })
    document.body.dispatchEvent(event)
    return event
  }

  // Hidden before the page sees the key, the menu leaves only that mark: the
  // action panel would clear the task selection on it too.
  test('takes the Escape that closes a header menu', async () => {
    const wrapper = await mountEntityList(MenuHost, {
      getters: { currentProduction: production }
    })
    const menus = wrapper
      .findAllComponents(HeaderMenu)
      .map(menu => menu.element)
    menus.forEach(menu => menu.classList.add('hidden'))
    menus[1].classList.remove('hidden')

    const escape = pressEscape()

    expect(menus[1].classList).toContain('hidden')
    expect(escape.defaultPrevented).toBe(true)
    // No menu left open: the next Escape is the page's.
    expect(pressEscape().defaultPrevented).toBe(false)

    wrapper.unmount()
  })
})

const header = width => ({ getBoundingClientRect: () => ({ width }) })

describe('entity list sticky offsets', () => {
  test('places the sticky columns after the full width of the previous ones', () => {
    const refs = {
      'th-name': header(200.5),
      'validation-0': [{ $el: header(151) }],
      'validation-1': [{ $el: header(151) }]
    }

    const sticky = getStickyOffsets(refs, {
      showInfos: true,
      metadataCount: 0,
      validationCount: 2
    })

    expect(sticky.nameWidth).toBe(200.5)
    expect(sticky.offsets).toEqual({
      'validation-0': 200.5,
      'validation-1': 351.5
    })
  })

  test('places the sticky metadata columns after the name and the episode', () => {
    const refs = {
      'th-name': header(200.5),
      'th-episode': header(80),
      'editor-0': [{ $el: header(121) }],
      'validation-0': [{ $el: header(151) }]
    }

    const sticky = getStickyOffsets(refs, {
      showInfos: true,
      metadataCount: 1,
      validationCount: 1
    })

    expect(sticky.offsets).toEqual({
      'editor-0': 280.5,
      'validation-0': 401.5
    })
  })

  test('skips the metadata columns while the infos are hidden', () => {
    const refs = {
      'th-name': header(200),
      'validation-0': [{ $el: header(150) }]
    }

    const sticky = getStickyOffsets(refs, {
      showInfos: false,
      metadataCount: 1,
      validationCount: 1
    })

    expect(sticky.offsets).toEqual({ 'validation-0': 200 })
  })
})

describe('entity list metadata edition', () => {
  const DESCRIPTOR = { field_name: 'duration', data_type: 'string' }
  const shot = (id, duration) => ({ id, data: { duration } })

  const mountHost = (...selectedShots) =>
    mountEntityList(Host, {
      getters: {
        currentProduction: production,
        selectedShots: new Map(selectedShots.map(entry => [entry.id, entry]))
      }
    })

  const makeEvent = (value, inputType) => {
    const input = document.createElement('input')
    input.value = value
    return { target: input, inputType }
  }

  test('a typed value is propagated to every selected entry', async () => {
    const a = shot('shot-a', '120')
    const b = shot('shot-b', '48')
    const wrapper = await mountHost(a, b)

    wrapper.vm.list.onMetadataFieldChanged(
      a,
      DESCRIPTOR,
      makeEvent('96', 'insertText')
    )

    expect(wrapper.emitted('metadata-changed')).toEqual([
      [{ entry: a, descriptor: DESCRIPTOR, value: '96' }],
      [{ entry: b, descriptor: DESCRIPTOR, value: '96' }]
    ])
  })

  test('a value typed on an unselected entry changes that entry only', async () => {
    const a = shot('shot-a', '120')
    const b = shot('shot-b', '48')
    const wrapper = await mountHost(b)

    wrapper.vm.list.onMetadataFieldChanged(
      a,
      DESCRIPTOR,
      makeEvent('96', 'insertText')
    )

    expect(wrapper.emitted('metadata-changed')).toEqual([
      [{ entry: a, descriptor: DESCRIPTOR, value: '96' }]
    ])
  })

  test.each(['historyUndo', 'historyRedo'])(
    'a %s input writes nothing and restores the stored value',
    async inputType => {
      const a = shot('shot-a', '120')
      const b = shot('shot-b', '48')
      const wrapper = await mountHost(a, b)
      const event = makeEvent('96', inputType)

      wrapper.vm.list.onMetadataFieldChanged(a, DESCRIPTOR, event)

      expect(wrapper.emitted('metadata-changed')).toBeUndefined()
      expect(event.target.value).toBe('120')
    }
  )
})

describe('entity list drag browsing', () => {
  const dragStart = () => {
    const event = new Event('dragstart', { bubbles: true, cancelable: true })
    document.body.dispatchEvent(event)
    return event.defaultPrevented
  }

  // Firefox starts a native drag of the task links and thumbnails under
  // the pointer, which swallows the mouse moves the grab scrolls with.
  test('blocks the native drags while the list is grabbed', async () => {
    const wrapper = await mountEntityList(Host, {
      getters: { currentProduction: production }
    })
    expect(dragStart()).toBe(false)

    wrapper.vm.list.startBrowsing({
      target: document.createElement('td'),
      clientX: 10,
      clientY: 10
    })
    expect(dragStart()).toBe(true)

    document.dispatchEvent(new Event('mouseup'))
    expect(dragStart()).toBe(false)

    wrapper.unmount()
  })
})

describe('entity list keyboard navigation', () => {
  // A row per string: "i" is a cell with a text input, "c" a checkbox only,
  // "-" a cell without any editor.
  const buildTable = rows => {
    const table = document.createElement('table')
    const body = document.createElement('tbody')
    table.append(body)
    rows.forEach(cells => {
      const row = document.createElement('tr')
      body.append(row)
      Array.from(cells).forEach(kind => {
        const cell = document.createElement('td')
        if (kind === 'i') cell.append(document.createElement('input'))
        if (kind === 'c') {
          const checkbox = document.createElement('input')
          checkbox.type = 'checkbox'
          cell.append(checkbox)
        }
        row.append(cell)
      })
    })
    return body
  }
  const cell = (body, row, column) => body.children[row].children[column]

  test('moves to the next editable cell of the row, wrapping around', () => {
    const body = buildTable(['i-ic'])

    expect(getNextEditableCell(cell(body, 0, 0), 'ArrowRight')).toBe(
      cell(body, 0, 2)
    )
    expect(getNextEditableCell(cell(body, 0, 2), 'ArrowRight')).toBe(
      cell(body, 0, 0)
    )
    expect(getNextEditableCell(cell(body, 0, 0), 'ArrowLeft')).toBe(
      cell(body, 0, 2)
    )
  })

  test('moves to the same column of the next editable row, wrapping around', () => {
    const body = buildTable(['ii', '-i', 'ii'])

    expect(getNextEditableCell(cell(body, 0, 0), 'ArrowDown')).toBe(
      cell(body, 2, 0)
    )
    expect(getNextEditableCell(cell(body, 2, 0), 'ArrowDown')).toBe(
      cell(body, 0, 0)
    )
    expect(getNextEditableCell(cell(body, 0, 1), 'ArrowUp')).toBe(
      cell(body, 2, 1)
    )
  })

  test('stays when no other cell is editable', () => {
    const body = buildTable(['i-'])

    expect(getNextEditableCell(cell(body, 0, 0), 'ArrowRight')).toBeNull()
    expect(getNextEditableCell(cell(body, 0, 0), 'ArrowDown')).toBeNull()
    expect(getNextEditableCell(cell(body, 0, 0), 'Enter')).toBeNull()
  })
})
