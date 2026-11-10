vi.mock('@/store', () => ({ default: {} }))

import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { computed, defineComponent, inject, nextTick, ref } from 'vue'
import { createMemoryHistory, createRouter, useRoute } from 'vue-router'

import {
  getNextEditableCell,
  getStickyOffsets,
  showHeaderMenuAt,
  useEntityList
} from '@/composables/entityList'
import shotStore from '@/store/modules/shots'

import {
  allVisible,
  descriptor,
  filledColumns,
  mountEntityList,
  production,
  stickColumns,
  taskTypeId
} from '../fixtures/entity-list'
import { openModalHost } from '../fixtures/modal-host'
import { addTextField, onPlatform, pressAltArrow } from '../fixtures/platform'

enableAutoUnmount(afterEach)

// A bare host: the composable only needs the list props and emit.
const Host = defineComponent({
  props: {
    departmentFilter: { type: Array, default: () => [] },
    displaySettings: { type: Object, default: () => ({}) },
    isError: { type: Boolean, default: false },
    isLoading: { type: Boolean, default: false },
    validationColumns: { type: Array, default: () => [] }
  },
  emits: ['keep-task-panel-open', 'metadata-changed'],
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
  })

  // An outside script can take the body out of the page: only the end of a
  // grab resets its cursor.
  test.each(['mouseup', 'mouseleave', 'touchend', 'touchcancel', 'keyup'])(
    'leaves the page body alone on a %s without any grab',
    async type => {
      await mountEntityList(Host, {
        getters: { currentProduction: production }
      })
      const onError = vi.fn()
      window.addEventListener('error', onError)
      const body = document.body
      body.remove()

      document.dispatchEvent(new Event(type))

      document.documentElement.append(body)
      window.removeEventListener('error', onError)
      expect(onError).not.toHaveBeenCalled()
    }
  )
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

describe('entity list task selection', () => {
  const info = { x: 0, y: 0, task: { id: 'task-1' } }

  test('selects the task of a clicked cell', async () => {
    const wrapper = await mountEntityList(Host, {
      getters: { currentProduction: production }
    })
    wrapper.vm.list.onTaskSelected(info, true)
    expect(wrapper.vm.$store.commit).toHaveBeenCalledWith(
      'ADD_SELECTED_TASK',
      expect.objectContaining({ task: info.task })
    )
  })

  test('selects nothing when the task panel is hidden from the client', async () => {
    const wrapper = await mountEntityList(Host, {
      getters: {
        currentProduction: production,
        clientAccess: { ...allVisible, isTaskPanelVisible: false }
      }
    })
    wrapper.vm.list.onTaskSelected(info, true)
    expect(wrapper.vm.$store.commit).not.toHaveBeenCalled()
    expect(wrapper.emitted('keep-task-panel-open')).toBeUndefined()
  })
})

// A host with the filled task type column and the descriptor of the
// fixtures, the header menus, the headers of the sticky columns, the
// scrolled body, and a grid of validation cells the selection reads through
// their refs.
const HeaderMenu = { template: '<div class="header-menu" />' }

const StickyHeader = { template: '<th />' }

const ValidationCell = {
  props: {
    column: { type: Object, default: null },
    columnY: { type: Number, default: 0 },
    entity: { type: Object, default: null },
    rowX: { type: Number, default: 0 },
    selectable: { type: Boolean, default: true },
    task: { type: Object, default: null }
  },
  template: '<td />'
}

const buildHost = ({ cells = [], descriptors = [descriptor], options } = {}) => ({
    components: { HeaderMenu, StickyHeader, ValidationCell },
    props: {
      departmentFilter: { type: Array, default: () => [] },
      displaySettings: { type: Object, default: () => ({}) },
      isError: { type: Boolean, default: false },
      isLoading: { type: Boolean, default: false },
      validationColumns: { type: Array, default: () => [] }
    },
    emits: [
      'add-metadata',
      'change-sort',
      'delete-all-tasks',
      'delete-metadata',
      'edit-metadata',
      'field-changed',
      'keep-task-panel-open',
      'scroll'
    ],
    setup(props, { emit }) {
      const route = useRoute()
      const list = useEntityList({
        type: 'shot',
        props,
        emit,
        entities: computed(() => []),
        filledColumns: computed(() => filledColumns),
        metadataDescriptors: computed(() => descriptors),
        isEmptyList: computed(() => false),
        ...options
      })
      return { cells, list, route }
    },
    template: `
      <div>
        <header-menu ref="headerMenu" />
        <header-menu ref="headerMetadataMenu" />
        <header-menu ref="headerFieldMenu" />
        <table>
          <thead>
            <tr>
              <sticky-header
                v-for="(stuck, j) in list.stickedVisibleMetadataDescriptors.value"
                :key="stuck.id"
                :ref="'editor-' + j"
              />
              <sticky-header
                v-for="(columnId, j) in list.stickedDisplayedValidationColumns
                  .value"
                :key="columnId"
                :ref="'validation-' + j"
              />
            </tr>
          </thead>
        </table>
        <div ref="body">
          <table>
            <tbody>
              <tr v-for="(row, i) in cells" :key="i">
                <validation-cell
                  v-for="(cell, j) in row"
                  :key="j"
                  :ref="'validation-' + i + '-' + j"
                  v-bind="cell"
                />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `
})

// A click on a header cell, which the header menus show under.
const headerClick = () => {
  const header = document.createElement('th')
  header.getBoundingClientRect = () => ({ bottom: 40, left: 10, width: 120 })
  return { target: header }
}

const mountHost = (getters = {}, { props, ...hostOptions } = {}) =>
  mountEntityList(buildHost(hostOptions), {
    getters: { currentProduction: production, ...getters },
    props
  })

const menuElements = wrapper =>
  wrapper.findAllComponents(HeaderMenu).map(menu => menu.element)

describe('entity list columns', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('minimizes a column from its header menu, and back', async () => {
    const wrapper = await mountHost(
      {},
      { props: { displaySettings: { showInfos: false } } }
    )
    const { list } = wrapper.vm
    const key = `column-${production.id}-${taskTypeId}`

    list.showHeaderMenu(taskTypeId, headerClick())
    list.onMinimizeColumnToggled()
    expect(localStorage.getItem(key)).toBe('true')
    expect(list.hiddenColumns[taskTypeId]).toBe(true)
    expect(list.nonStickedDisplayedValidationColumns.value).toEqual([])
    // The menu closes once its action is done.
    expect(menuElements(wrapper)[0].classList).toContain('hidden')

    list.showHeaderMenu(taskTypeId, headerClick())
    list.onMinimizeColumnToggled()
    expect(localStorage.getItem(key)).toBe('false')
    expect(list.nonStickedDisplayedValidationColumns.value).toEqual([
      taskTypeId
    ])
  })

  test('sticks a task type column and keeps the choice', async () => {
    const wrapper = await mountHost()
    const { list } = wrapper.vm

    list.showHeaderMenu(taskTypeId, headerClick())
    list.stickColumnClicked()

    expect(list.stickedDisplayedValidationColumns.value).toEqual([taskTypeId])
    expect(list.nonStickedDisplayedValidationColumns.value).toEqual([])
    expect(
      JSON.parse(localStorage.getItem(`stick-shots-${production.id}`))
    ).toEqual({ [taskTypeId]: true })
  })

  test('sticks a metadata column and keeps the choice', async () => {
    const wrapper = await mountHost()
    const { list } = wrapper.vm

    list.showMetadataHeaderMenu(descriptor.id, headerClick())
    list.metadataStickColumnClicked(headerClick())

    expect(list.stickedVisibleMetadataDescriptors.value).toEqual([descriptor])
    expect(list.nonStickedVisibleMetadataDescriptors.value).toEqual([])
    expect(
      JSON.parse(localStorage.getItem(`stick-shots-${production.id}`))
    ).toEqual({ [descriptor.id]: true })
  })

  test('opens and closes the column selector', async () => {
    const { list } = (await mountHost()).vm
    list.toggleColumnSelector()
    expect(list.columnSelectorDisplayed.value).toBe(true)
    list.toggleColumnSelector()
    expect(list.columnSelectorDisplayed.value).toBe(false)
  })

  test('shows the columns of the departments of the filter', async () => {
    const byDepartment = departments => ({ ...descriptor, departments })
    const descriptors = [
      { ...byDepartment(['anim']), id: 'anim-descriptor' },
      { ...byDepartment(['layout']), id: 'layout-descriptor' },
      { ...byDepartment([]), id: 'shared-descriptor' }
    ]
    const taskTypes = [
      { id: 'anim-task-type', department_id: 'anim' },
      { id: 'layout-task-type', department_id: 'layout' },
      { id: 'shared-task-type', department_id: null }
    ]
    const columnIds = taskTypes.map(({ id }) => id)
    const wrapper = await mountEntityList(
      buildHost({
        descriptors,
        options: {
          filledColumns: computed(() =>
            Object.fromEntries(columnIds.map(id => [id, true]))
          )
        }
      }),
      {
        getters: {
          currentProduction: production,
          taskTypeMap: new Map(taskTypes.map(taskType => [taskType.id, taskType]))
        },
        props: { departmentFilter: ['anim'], validationColumns: columnIds }
      }
    )
    const { list } = wrapper.vm

    expect(
      list.nonStickedVisibleMetadataDescriptors.value.map(({ id }) => id)
    ).toEqual(['anim-descriptor', 'shared-descriptor'])
    expect(list.nonStickedDisplayedValidationColumns.value).toEqual([
      'anim-task-type',
      'shared-task-type'
    ])
  })
})

describe('entity list header menu actions', () => {
  test('sorts on a field, then the other way', async () => {
    const fieldSort = { type: 'field', column: 'name', ascending: true }
    const sortOn = async shotSorting => {
      const wrapper = await mountHost({ shotSorting })
      wrapper.vm.list.showFieldHeaderMenu('name', 'Name', headerClick())
      wrapper.vm.list.onSortByFieldClicked()
      expect(menuElements(wrapper)[2].classList).toContain('hidden')
      return wrapper.emitted('change-sort')
    }

    expect(await sortOn([])).toEqual([[{ ...fieldSort, name: 'Name' }]])
    expect(await sortOn([fieldSort])).toEqual([
      [{ ...fieldSort, name: 'Name', ascending: false }]
    ])
  })

  test('sorts on the status of a task type', async () => {
    const wrapper = await mountHost({
      taskTypeMap: new Map([[taskTypeId, { name: 'Animation' }]])
    })
    wrapper.vm.list.showHeaderMenu(taskTypeId, headerClick())
    wrapper.vm.list.onSortByTaskTypeClicked()
    expect(wrapper.emitted('change-sort')).toEqual([
      [{ type: 'status', column: taskTypeId, name: 'Animation' }]
    ])
  })

  test('sorts on a metadata column', async () => {
    const wrapper = await mountHost({
      currentProduction: { ...production, descriptors: [descriptor] }
    })
    wrapper.vm.list.showMetadataHeaderMenu(descriptor.id, headerClick())
    wrapper.vm.list.onSortByMetadataClicked()
    expect(wrapper.emitted('change-sort')).toEqual([
      [{ type: 'metadata', column: 'mood', name: 'Mood', data_type: 'string' }]
    ])
  })

  test('hands the other menu actions to the page', async () => {
    const wrapper = await mountHost()
    const { list } = wrapper.vm

    list.showHeaderMenu(taskTypeId, headerClick())
    list.onDeleteAllTasksClicked()
    list.showMetadataHeaderMenu(descriptor.id, headerClick())
    list.onEditMetadataClicked()
    list.showMetadataHeaderMenu(descriptor.id, headerClick())
    list.onDeleteMetadataClicked()
    list.onAddMetadataClicked()

    expect(wrapper.emitted('delete-all-tasks')).toEqual([[taskTypeId]])
    expect(wrapper.emitted('edit-metadata')).toEqual([[descriptor.id]])
    expect(wrapper.emitted('delete-metadata')).toEqual([[descriptor.id]])
    expect(wrapper.emitted('add-metadata')).toEqual([[]])
  })

  test('closes the header menus on a click elsewhere than in a menu', async () => {
    const wrapper = await mountHost()
    const [headerMenu] = menuElements(wrapper)
    headerMenu.classList.remove('hidden')
    const menuContent = document.createElement('div')
    menuContent.className = 'header-menu'
    document.body.append(menuContent)

    menuContent.click()
    expect(headerMenu.classList).not.toContain('hidden')
    document.body.click()
    expect(headerMenu.classList).toContain('hidden')

    menuContent.remove()
  })
})

describe('entity list metadata edition rights', () => {
  const sharedDescriptor = { ...descriptor, departments: ['anim', 'layout'] }

  test.each([
    ['a manager', { isCurrentUserProductionManager: true }, [], true],
    ['an artist', {}, [], false],
    ['a supervisor of every department', { supervisor: true }, [], true],
    [
      'a supervisor of the same departments',
      { supervisor: true },
      ['layout', 'anim'],
      true
    ],
    ['a supervisor of fewer departments', { supervisor: true }, ['anim'], false],
    [
      'a supervisor of other departments',
      { supervisor: true },
      ['anim', 'fx'],
      false
    ]
  ])('%s', async (_, { supervisor = false, ...getters }, departments, allowed) => {
    const wrapper = await mountHost(
      {
        isCurrentUserProductionSupervisor: supervisor,
        user: { departments },
        ...getters
      },
      { descriptors: [sharedDescriptor] }
    )
    expect(wrapper.vm.list.isMetadataColumnEditAllowed(descriptor.id)).toBe(
      allowed
    )
  })

  test('allows nothing on an unknown or a non-string descriptor', async () => {
    const wrapper = await mountHost({
      isCurrentUserProductionManager: true,
      isCurrentUserProductionSupervisor: true,
      user: { departments: [] }
    })
    expect(wrapper.vm.list.isMetadataColumnEditAllowed(42)).toBe(false)

    const supervisorWrapper = await mountHost({
      isCurrentUserProductionSupervisor: true,
      user: { departments: [] }
    })
    expect(
      supervisorWrapper.vm.list.isMetadataColumnEditAllowed('unknown')
    ).toBe(false)
  })
})

describe('entity list scroll', () => {
  test('scrolls the body to a position', async () => {
    const wrapper = await mountHost()
    wrapper.vm.list.setScrollPosition(120)
    expect(wrapper.vm.$refs.body.scrollTop).toBe(120)
  })

  test('reports the scroll, and asks for more rows near the end', async () => {
    const onScrollEnd = vi.fn()
    const wrapper = await mountHost({}, { options: { onScrollEnd } })
    const body = wrapper.vm.$refs.body
    Object.defineProperty(body, 'scrollHeight', { value: 1000 })
    Object.defineProperty(body, 'offsetHeight', { value: 300 })

    wrapper.vm.list.onBodyScroll({ target: { scrollTop: 100 } })
    expect(onScrollEnd).not.toHaveBeenCalled()
    wrapper.vm.list.onBodyScroll({ target: { scrollTop: 650 } })
    expect(onScrollEnd).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('scroll')).toEqual([[100], [650]])
  })
})

const gridCell = (rowX, columnY, fields = {}) => ({
  column: { id: `column-${columnY}` },
  columnY,
  entity: { id: `entity-${rowX}` },
  rowX,
  task: { id: `task-${rowX}-${columnY}` },
  ...fields
})

// Two rows of two cells, the last one not selectable.
const grid = [
  [gridCell(0, 0), gridCell(0, 1)],
  [gridCell(1, 0), gridCell(1, 1, { selectable: false })]
]

const committed = (wrapper, mutation) =>
  wrapper.vm.$store.commit.mock.calls
    .filter(([name]) => name === mutation)
    .map(([, payload]) => payload)

const oneColumnGrid = [
  [gridCell(0, 0)],
  [gridCell(1, 0)],
  [gridCell(2, 0)]
]

describe('entity list task range selection', () => {
  const firstClick = { x: 0, y: 0, task: grid[0][0].task, isUserClick: true }
  const shiftClick = { x: 1, y: 1, task: grid[1][1].task, isShiftKey: true }

  test('selects the selectable cells between two clicks', async () => {
    const wrapper = await mountHost({}, { cells: grid })

    wrapper.vm.list.onTaskSelected(firstClick, true)
    wrapper.vm.list.onTaskSelected(shiftClick, true)

    const selection = committed(wrapper, 'ADD_SELECTED_TASKS')[0]
    expect(selection.map(({ task }) => task.id)).toEqual([
      'task-0-0',
      'task-0-1',
      'task-1-0'
    ])
    expect(selection[1]).toEqual({
      entity: { id: 'entity-0' },
      column: { id: 'column-1' },
      task: { id: 'task-0-1' },
      x: 0,
      y: 1
    })
  })

  test('leaves the cells already selected out of the range', async () => {
    const wrapper = await mountHost(
      { shotSelectionGrid: new Set(['0-0']) },
      { cells: grid }
    )

    wrapper.vm.list.onTaskSelected(firstClick, true)
    wrapper.vm.list.onTaskSelected(shiftClick, true)

    expect(
      committed(wrapper, 'ADD_SELECTED_TASKS')[0].map(({ task }) => task.id)
    ).toEqual(['task-0-1', 'task-1-0'])
  })

  test('selects the clicked cell only without a first click', async () => {
    const wrapper = await mountHost({}, { cells: grid })

    wrapper.vm.list.onTaskSelected(shiftClick, true)

    expect(committed(wrapper, 'ADD_SELECTED_TASKS')).toEqual([])
    expect(committed(wrapper, 'ADD_SELECTED_TASK')).toEqual([shiftClick])
  })

  test('starts from the row of the first click, moved by a new row', async () => {
    const entities = ref([[{ id: 'entity-1' }], [{ id: 'entity-2' }]])
    const wrapper = await mountHost(
      {},
      { cells: oneColumnGrid, options: { entities } }
    )
    wrapper.vm.list.onTaskSelected(
      { ...firstClick, entity: { id: 'entity-1' } },
      true
    )

    entities.value = [
      [{ id: 'entity-0' }, { id: 'entity-1' }],
      [{ id: 'entity-2' }]
    ]
    wrapper.vm.list.onTaskSelected(
      { x: 2, y: 0, task: oneColumnGrid[2][0].task, isShiftKey: true },
      true
    )

    expect(
      committed(wrapper, 'ADD_SELECTED_TASKS')[0].map(({ task }) => task.id)
    ).toEqual(['task-1-0', 'task-2-0'])
  })
})

describe('entity list task unselection', () => {
  const info = { x: 0, y: 0, task: { id: 'task-1' } }

  test('unselects the cell clicked with Ctrl', async () => {
    const wrapper = await mountHost({ nbSelectedTasks: 3 })
    wrapper.vm.list.onTaskUnselected({ ...info, isCtrlKey: true }, true)
    expect(committed(wrapper, 'REMOVE_SELECTED_TASK')).toEqual([
      { ...info, isCtrlKey: true }
    ])
    expect(committed(wrapper, 'CLEAR_SELECTED_TASKS')).toEqual([])
  })

  test('unselects the last selected cell', async () => {
    const wrapper = await mountHost({ nbSelectedTasks: 1 })
    wrapper.vm.list.onTaskUnselected(info, true)
    expect(committed(wrapper, 'REMOVE_SELECTED_TASK')).toEqual([info])
  })

  test('keeps only the clicked cell out of a larger selection', async () => {
    const wrapper = await mountHost({ nbSelectedTasks: 3 })
    wrapper.vm.list.onTaskUnselected(info, true)
    expect(wrapper.vm.$store.commit.mock.calls).toEqual([
      ['CLEAR_SELECTED_TASKS'],
      ['ADD_SELECTED_TASK', info]
    ])
  })

  test('shifts a cell of the scrolled columns past the sticky ones', async () => {
    stickColumns('shot')
    const wrapper = await mountHost({ nbSelectedTasks: 1 })
    wrapper.vm.list.onTaskUnselected(info, false)
    expect(committed(wrapper, 'REMOVE_SELECTED_TASK')).toEqual([
      { ...info, y: 1 }
    ])
    localStorage.clear()
  })

  test('writes the only selected task in the URL', async () => {
    const wrapper = await mountHost({
      nbSelectedTasks: 1,
      selectedTasks: new Map([['task-1', info.task]])
    })
    wrapper.vm.list.onTaskUnselected(info, true)
    await flushPromises()
    expect(wrapper.vm.route.query.task_id).toBe('task-1')
  })
})

describe('entity list scroll to the selected cell', () => {
  const rect = box => () => ({
    ...box,
    right: box.x + box.width,
    bottom: box.top + box.height,
    left: box.x
  })

  const clickCell = async ({ cellBox, scroll = {} }) => {
    const wrapper = await mountHost({ nbSelectedTasks: 1 }, { cells: grid })
    const body = wrapper.vm.$refs.body
    body.getBoundingClientRect = rect({ x: 0, top: 0, width: 800, height: 300 })
    Object.assign(body, scroll)
    wrapper.vm.$refs['validation-0-0'][0].$el.getBoundingClientRect =
      rect(cellBox)
    wrapper.vm.list.onTaskSelected(
      { x: 0, y: 0, task: grid[0][0].task, isUserClick: true },
      true
    )
    await nextTick()
    await nextTick()
    return body
  }

  test('scrolls down to a cell under the list', async () => {
    const body = await clickCell({
      cellBox: { x: 300, top: 320, width: 100, height: 30 }
    })
    expect(body.scrollTop).toBe(70)
  })

  test('scrolls up to a cell above the list', async () => {
    const body = await clickCell({
      cellBox: { x: 300, top: -50, width: 100, height: 30 },
      scroll: { scrollTop: 200 }
    })
    expect(body.scrollTop).toBe(110)
  })

  test('scrolls right to a cell past the list', async () => {
    const body = await clickCell({
      cellBox: { x: 780, top: 100, width: 100, height: 30 }
    })
    expect(body.scrollLeft).toBe(100)
  })

  test('scrolls left to a cell under the sticky columns', async () => {
    const head = document.createElement('div')
    head.className = 'datatable-head'
    const stickyHeader = document.createElement('div')
    stickyHeader.className = 'datatable-row-header'
    Object.defineProperty(stickyHeader, 'offsetWidth', { value: 150 })
    head.append(stickyHeader)
    document.body.append(head)

    const body = await clickCell({
      cellBox: { x: 100, top: 100, width: 100, height: 30 },
      scroll: { scrollLeft: 200 }
    })
    expect(body.scrollLeft).toBe(110)
    head.remove()
  })
})

describe('entity list keyboard selection', () => {
  const pressKey = (type, init, keyCode) => {
    const event = new KeyboardEvent(type, { cancelable: true, ...init })
    Object.defineProperty(event, 'keyCode', { value: keyCode })
    window.dispatchEvent(event)
    return event
  }

  test('moves to the next cell with Alt and an arrow', async () => {
    const wrapper = await mountHost({}, { cells: grid })
    const onClick = vi.fn()
    wrapper.vm.$refs['validation-0-1'][0].$el.addEventListener('click', onClick)
    wrapper.vm.list.onTaskSelected(
      { x: 0, y: 0, task: grid[0][0].task, isUserClick: true },
      true
    )

    expect(pressKey('keydown', {}, 39).defaultPrevented).toBe(false)
    expect(onClick).not.toHaveBeenCalled()
    // The page keeps no default action of the keys it handles.
    expect(pressKey('keydown', { altKey: true }, 39).defaultPrevented).toBe(
      true
    )
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  // Confirming in a modal sent the change to the cell Alt and an arrow reached.
  test('keeps the selection behind a modal', async () => {
    const wrapper = await mountHost({}, { cells: grid })
    const onClick = vi.fn()
    wrapper.vm.$refs['validation-0-1'][0].$el.addEventListener('click', onClick)
    wrapper.vm.list.onTaskSelected(
      { x: 0, y: 0, task: grid[0][0].task, isUserClick: true },
      true
    )
    const closeModal = await openModalHost()

    expect(pressKey('keydown', { altKey: true }, 39).defaultPrevented).toBe(
      true
    )
    expect(onClick).not.toHaveBeenCalled()

    closeModal()
    pressKey('keydown', { altKey: true }, 39)

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  describe('from a text field', () => {
    const mountFromCell = async (text = 'Shot') => {
      const wrapper = await mountHost({}, { cells: grid })
      const onClick = vi.fn()
      wrapper.vm.$refs['validation-0-1'][0].$el.addEventListener(
        'click',
        onClick
      )
      wrapper.vm.list.onTaskSelected(
        { x: 0, y: 0, task: grid[0][0].task, isUserClick: true },
        true
      )
      const field = addTextField('input', text)
      return { wrapper, onClick, field }
    }

    // macOS moves the caret of the field by word on Option and an arrow.
    test('leaves the key to a field out of the list on macOS', async () => {
      onPlatform('MacIntel')
      const { onClick, field } = await mountFromCell()

      expect(pressAltArrow(field, 39).defaultPrevented).toBe(false)
      expect(onClick).not.toHaveBeenCalled()
    })

    // An empty field has no caret to move.
    test('walks from an empty field out of the list on macOS', async () => {
      onPlatform('MacIntel')
      const { onClick, field } = await mountFromCell('')

      expect(pressAltArrow(field, 39).defaultPrevented).toBe(true)
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    test('keeps walking from a field of the list on macOS', async () => {
      onPlatform('MacIntel')
      const { wrapper, onClick } = await mountFromCell()
      // In the page, the keys of the list reach the window.
      document.body.append(wrapper.element)
      onTestFinished(() => wrapper.element.remove())
      const cellField = document.createElement('input')
      cellField.value = 'Shot'
      wrapper.vm.$refs.body.append(cellField)

      expect(pressAltArrow(cellField, 39).defaultPrevented).toBe(true)
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    // Alt and Left would leave the page there.
    test('keeps the key from any field on another system', async () => {
      onPlatform('Win32')
      const { onClick, field } = await mountFromCell()

      expect(pressAltArrow(field, 39).defaultPrevented).toBe(true)
      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })

  test('moves from the row of the last click, moved by a new row', async () => {
    const entities = ref([{ id: 'entity-1' }])
    const wrapper = await mountHost(
      {},
      { cells: oneColumnGrid, options: { entities } }
    )
    wrapper.vm.list.onTaskSelected(
      {
        x: 0,
        y: 0,
        entity: { id: 'entity-1' },
        task: oneColumnGrid[0][0].task,
        isUserClick: true
      },
      true
    )
    entities.value = [
      { id: 'entity-0' },
      { id: 'entity-1' },
      { id: 'entity-2' }
    ]
    const onClick = vi.fn()
    wrapper.vm.$refs['validation-2-0'][0].$el.addEventListener('click', onClick)

    pressKey('keydown', { altKey: true }, 40)

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  test('follows the Shift key', async () => {
    const wrapper = await mountHost()
    pressKey('keydown', { shiftKey: true }, 16)
    expect(wrapper.vm.list.shiftKeyPressed.value).toBe(true)
    pressKey('keyup', { shiftKey: false }, 16)
    expect(wrapper.vm.list.shiftKeyPressed.value).toBe(false)
  })
})

describe('entity list column selection', () => {
  const column = { id: taskTypeId, name: 'Animation' }
  const shot = (id, fields = {}) => ({
    id,
    validations: new Map([[taskTypeId, `task-${id}`]]),
    ...fields
  })
  const shots = [shot('a'), shot('b', { canceled: true }), shot('c')]

  const selectColumn = async options => {
    shotStore.cache.result = shots
    const wrapper = await mountHost(
      {
        taskMap: new Map(shots.map(({ id }) => [`task-${id}`, { id: `task-${id}` }])),
        taskTypeMap: new Map([[taskTypeId, column]])
      },
      { options }
    )
    wrapper.vm.list.showHeaderMenu(taskTypeId, headerClick())
    wrapper.vm.list.onSelectColumn()
    expect(committed(wrapper, 'CLEAR_SELECTED_TASKS')).toHaveLength(1)
    await nextTick()
    shotStore.cache.result = []
    return committed(wrapper, 'ADD_SELECTED_TASKS')[0]
  }

  test('selects the cells of the column for the shots left uncanceled', async () => {
    expect(await selectColumn()).toEqual([
      { entity: shots[0], column, task: { id: 'task-a' }, x: 0, y: 0 },
      { entity: shots[2], column, task: { id: 'task-c' }, x: 1, y: 0 }
    ])
  })

  test('keeps the row numbers of the cells it cannot select', async () => {
    const selection = await selectColumn({
      isCellSelectable: entity => entity.id !== 'a'
    })
    expect(selection.map(({ entity, x }) => [entity.id, x])).toEqual([['c', 1]])
  })
})

describe('entity list rows', () => {
  test('hands a description change to the page', async () => {
    const wrapper = await mountHost()
    const entry = { id: 'shot-1' }
    wrapper.vm.list.onDescriptionChanged(entry, 'A new take')
    expect(wrapper.emitted('field-changed')).toEqual([
      [{ entry, fieldName: 'description', value: 'A new take' }]
    ])
  })

  test('keeps the up and down keys in a number field', async () => {
    const { list } = (await mountHost()).vm
    const keyDown = key => {
      const event = new KeyboardEvent('keydown', { key, cancelable: true })
      list.onNumberFieldKeyDown(event)
      return event.defaultPrevented
    }
    expect(keyDown('ArrowDown')).toBe(true)
    expect(keyDown('ArrowUp')).toBe(true)
    expect(keyDown('ArrowLeft')).toBe(false)
  })

  test.each([
    [undefined, true],
    [{ data: {} }, true],
    [{ data: { resolution: '1920x1080' } }, true],
    [{ data: { resolution: '1920:1080' } }, false]
  ])('tells whether %j has a valid resolution', async (entity, valid) => {
    const { list } = (await mountHost()).vm
    expect(list.isValidResolution(entity)).toBe(valid)
  })

  test('focuses the editor of the next cell from an editor', async () => {
    const { list } = (await mountHost()).vm
    const row = document.createElement('tr')
    const cells = ['input', null, 'input'].map(tag => {
      const cell = document.createElement('td')
      if (tag) cell.append(document.createElement(tag))
      row.append(cell)
      return cell
    })
    const table = document.createElement('table')
    table.append(row)
    document.body.append(table)
    const [first, , last] = cells.map(cell => cell.firstChild)

    const event = new KeyboardEvent('keyup', { key: 'ArrowRight' })
    Object.defineProperty(event, 'target', { value: first })
    expect(list.onInputKeyUp(event)).toBe(false)
    expect(document.activeElement).toBe(last)

    const other = new KeyboardEvent('keyup', { key: 'Enter' })
    Object.defineProperty(other, 'target', { value: last })
    expect(list.onInputKeyUp(other)).toBeUndefined()
    expect(document.activeElement).toBe(last)
    table.remove()
  })
})

describe('entity list grab scroll', () => {
  test('scrolls the body along the grab, until released', async () => {
    const wrapper = await mountHost()
    const body = wrapper.vm.$refs.body
    Object.assign(body, { scrollLeft: 100, scrollTop: 100 })
    const move = (clientX, clientY) =>
      document.dispatchEvent(new MouseEvent('mousemove', { clientX, clientY }))

    wrapper.vm.list.startBrowsing({
      target: document.createElement('td'),
      clientX: 10,
      clientY: 10
    })
    move(30, 50)
    expect([body.scrollLeft, body.scrollTop]).toEqual([80, 60])

    document.dispatchEvent(new Event('mouseup'))
    move(60, 90)
    expect([body.scrollLeft, body.scrollTop]).toEqual([80, 60])
  })

  test('leaves a grab started in a text field to the field', async () => {
    const wrapper = await mountHost()
    const body = wrapper.vm.$refs.body
    Object.assign(body, { scrollLeft: 100, scrollTop: 100 })

    wrapper.vm.list.startBrowsing({
      target: document.createElement('input'),
      clientX: 10,
      clientY: 10
    })
    document.dispatchEvent(
      new MouseEvent('mousemove', { clientX: 30, clientY: 50 })
    )
    expect([body.scrollLeft, body.scrollTop]).toEqual([100, 100])
  })
})

describe('entity list field sort', () => {
  // The sortable headers read the field sort of the list from an injection.
  const SortedField = {
    setup() {
      return { activeFieldSort: inject('activeFieldSort') }
    },
    template: '<span>{{ activeFieldSort?.column }}</span>'
  }

  const mountWithHeader = async shotSorting => {
    const store = {
      getters: {
        currentProduction: production,
        nbSelectedTasks: 0,
        shotSorting
      },
      commit: vi.fn(),
      dispatch: vi.fn()
    }
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', component: { template: '<div />' } }]
    })
    await router.push('/')
    const SortHost = {
      components: { SortedField },
      props: {
        departmentFilter: { type: Array, default: () => [] },
        displaySettings: { type: Object, default: () => ({}) },
        validationColumns: { type: Array, default: () => [] }
      },
      setup(props, { emit }) {
        useEntityList({
          type: 'shot',
          props,
          emit,
          entities: computed(() => []),
          filledColumns: computed(() => ({})),
          metadataDescriptors: computed(() => []),
          isEmptyList: computed(() => true)
        })
      },
      template: '<div><sorted-field /></div>'
    }
    return mount(SortHost, { global: { plugins: [router], provide: { store } } })
  }

  test('hands the sort on a field to the field headers', async () => {
    const wrapper = await mountWithHeader([{ type: 'field', column: 'mood' }])
    expect(wrapper.text()).toBe('mood')
  })

  test('hands no field sort while sorted on a status', async () => {
    const wrapper = await mountWithHeader([{ type: 'status', column: 'mood' }])
    expect(wrapper.text()).toBe('')
  })
})
