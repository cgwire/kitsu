import { flushPromises } from '@vue/test-utils'
import { nextTick, reactive } from 'vue'
import { createStore } from 'vuex'

import {
  drop,
  dropBefore,
  pressOn,
  recordListenerErrors,
  release,
  startDrag
} from '../fixtures/sortable'

import TableMetadataSelectorMenu from '@/components/widgets/TableMetadataSelectorMenu.vue'

import { mountWithI18n } from '../fixtures/i18n'

describe('TableMetadataSelectorMenu', () => {
  let theme, wrapper

  const descriptors = Array.from({ length: 12 }, (_, index) => ({
    id: `descriptor-${index}`,
    entity_type: 'Shot',
    field_name: `extra_${index}`,
    name: `Extra ${index}`,
    position: index
  }))

  beforeEach(() => {
    // The menu teleports to the layer that App.vue renders.
    theme = document.createElement('div')
    theme.className = 'theme'
    theme.innerHTML = '<div id="theme-popups"></div>'
    document.body.appendChild(theme)
    vi.stubGlobal('innerWidth', 1366)
    vi.stubGlobal('innerHeight', 600)
  })

  afterEach(() => {
    wrapper.unmount()
    theme.remove()
    localStorage.clear()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  // jsdom lays nothing out: the host gets the rect of a list header.
  const placeHost = top => {
    const host = wrapper.find('.table-metadata-selector-host').element
    vi.spyOn(host, 'getBoundingClientRect').mockReturnValue({
      top,
      bottom: top,
      left: 1358,
      right: 1358
    })
  }

  const openMenu = async ({
    namespace = 'shots',
    hostTop,
    isManager = false,
    props = {}
  }) => {
    const store = createStore({
      getters: { isCurrentUserManager: () => isManager }
    })
    wrapper = mountWithI18n(TableMetadataSelectorMenu, {
      props: { descriptors, modelValue: {}, namespace, ...props },
      global: { plugins: [store] }
    })
    placeHost(hostTop)
    await wrapper.setProps({ isOpen: true })
    await nextTick()
  }

  const menu = () => document.querySelector('.column-menu')

  test('bounds the menu to the room below the Shots header', async () => {
    await openMenu({ hostTop: 219 })
    expect(menu().style.top).toBe('259px')
    expect(menu().style.maxHeight).toBe('333px')
  })

  test('keeps the 400 px height cap in a tall window', async () => {
    vi.stubGlobal('innerHeight', 962)
    await openMenu({ hostTop: 219 })
    expect(menu().style.top).toBe('259px')
    expect(menu().style.maxHeight).toBe('400px')
  })

  test('bounds the menu again when the window gets shorter', async () => {
    vi.stubGlobal('innerHeight', 962)
    await openMenu({ hostTop: 219 })
    vi.stubGlobal('innerHeight', 600)
    window.dispatchEvent(new Event('resize'))
    await nextTick()
    expect(menu().style.maxHeight).toBe('333px')
  })

  test('bounds the menu again when a scroll moves the header', async () => {
    await openMenu({ hostTop: 400 })
    expect(menu().style.maxHeight).toBe('152px')
    placeHost(219)
    document.dispatchEvent(new Event('scroll'))
    await nextTick()
    expect(menu().style.top).toBe('259px')
    expect(menu().style.maxHeight).toBe('333px')
  })

  test('bounds the menu under the Breakdown options row', async () => {
    await openMenu({ namespace: 'breakdown', hostTop: 216 })
    expect(menu().style.top).toBe('246px')
    expect(menu().style.maxHeight).toBe('346px')
  })

  test('keeps 64 px of menu under a header near the window bottom', async () => {
    await openMenu({ hostTop: 580 })
    expect(menu().style.top).toBe('528px')
    expect(menu().style.maxHeight).toBe('64px')
  })

  const pressEscape = () => {
    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true
    })
    document.body.dispatchEvent(event)
    return event
  }

  // A column named "Constructor" has the field name of a property every
  // object inherits.
  describe('Constructor column', () => {
    const openConstructorMenu = async modelValue => {
      const store = createStore({
        getters: { isCurrentUserManager: () => false }
      })
      wrapper = mountWithI18n(TableMetadataSelectorMenu, {
        props: {
          descriptors: [
            {
              id: 'descriptor-c',
              entity_type: 'Shot',
              field_name: 'constructor',
              name: 'Constructor',
              position: 0
            }
          ],
          modelValue,
          namespace: 'shots'
        },
        global: { plugins: [store] }
      })
      placeHost(219)
      await wrapper.setProps({ isOpen: true })
      await nextTick()
    }

    test('lists the column and shows it by default', async () => {
      await openConstructorMenu({})

      expect(wrapper.emitted('update:model-value')[0][0]).toEqual({
        constructor: true
      })
      expect(menu().textContent).toContain('Constructor')
    })

    // The list hands back the headers the menu emitted.
    test('lists the column once among the columns shown', async () => {
      await openConstructorMenu({ constructor: true })

      expect(menu().textContent.match(/Constructor/g)).toHaveLength(1)
      expect(menu().textContent).not.toContain('function')
    })
  })

  // Closed before the page sees the key, the menu leaves only that mark: the
  // action panel would clear the task selection on it too.
  test('takes the Escape it closes on', async () => {
    await openMenu({ hostTop: 219 })

    const escape = pressEscape()

    expect(wrapper.emitted('update:is-open')).toEqual([[false]])
    expect(escape.defaultPrevented).toBe(true)
  })

  test('leaves the Escape to the page once closed', async () => {
    await openMenu({ hostTop: 219 })
    await wrapper.setProps({ isOpen: false })

    expect(pressEscape().defaultPrevented).toBe(false)
  })

  describe('add a metadata column entry', () => {
    const addButton = () => document.querySelector('.column-menu__add')

    test('offers it when the list allows it', async () => {
      await openMenu({ hostTop: 219, props: { isAddAllowed: true } })

      expect(addButton().tagName).toBe('BUTTON')
      expect(addButton().getAttribute('type')).toBe('button')
      expect(addButton().textContent.trim()).toBe('Add metadata column')
    })

    test('closes the menu and asks the list for the new column', async () => {
      await openMenu({ hostTop: 219, props: { isAddAllowed: true } })

      addButton().click()

      expect(wrapper.emitted('update:is-open')).toEqual([[false]])
      expect(wrapper.emitted('add-metadata')).toHaveLength(1)
    })

    test('leaves it out by default', async () => {
      await openMenu({ hostTop: 219 })

      expect(menu()).not.toBeNull()
      expect(addButton()).toBeNull()
    })
  })

  // The menu sits at the end of the page, after every control of the list.
  describe('keyboard', () => {
    // the toggle of the list
    let opener

    beforeEach(() => {
      opener = document.createElement('button')
      document.body.appendChild(opener)
      opener.focus()
    })

    afterEach(() => {
      opener.remove()
    })

    const entries = () => [...menu().querySelectorAll('input, button')]

    const pressKey = (target, init) => {
      const event = new KeyboardEvent('keydown', {
        ...init,
        bubbles: true,
        cancelable: true
      })
      target.dispatchEvent(event)
      return event
    }

    const pressTab = (target, shiftKey = false) =>
      pressKey(target, { key: 'Tab', shiftKey })

    // jsdom moves no focus on a click: a browser focuses the closest
    // focusable ancestor of a spot that takes none, else the page.
    const clickOn = element => {
      const focusable = element.closest('[tabindex]')
      if (focusable) focusable.focus()
      else document.activeElement.blur()
    }

    const title = () => menu().querySelector('.column-menu__title')

    test('is a modal dialog named after its title', async () => {
      await openMenu({ hostTop: 219 })

      const titleId = menu().getAttribute('aria-labelledby')
      expect(menu().getAttribute('role')).toBe('dialog')
      expect(menu().getAttribute('aria-modal')).toBe('true')
      expect(document.getElementById(titleId).textContent).toBe(
        'Visible columns'
      )
    })

    // A manager gets the columns in a list that drags.
    test.each([
      ['an artist', false],
      ['a manager', true]
    ])(
      'takes the focus to the first column of %s when it opens',
      async (_, isManager) => {
        await openMenu({
          hostTop: 219,
          isManager,
          props: { isAddAllowed: true }
        })

        // the 12 columns, then the new column button
        expect(entries()).toHaveLength(13)
        expect(document.activeElement).toBe(entries()[0])
      }
    )

    test.each([
      ['an artist', false],
      ['a manager', true]
    ])('keeps Tab among the entries of %s', async (_, isManager) => {
      await openMenu({
        hostTop: 219,
        isManager,
        props: { isAddAllowed: true }
      })
      const first = entries()[0]
      const last = entries()[entries().length - 1]

      last.focus()
      expect(pressTab(last).defaultPrevented).toBe(true)
      expect(document.activeElement).toBe(first)

      expect(pressTab(first, true).defaultPrevented).toBe(true)
      expect(document.activeElement).toBe(last)
    })

    const columnsBox = () => menu().querySelector('.column-menu__columns')

    // Its columns scroll in that box, where a column the focus reaches
    // scrolls into view: the button below never covers it.
    test('holds its columns in a box apart from the new column button', async () => {
      await openMenu({ hostTop: 219, props: { isAddAllowed: true } })

      expect(columnsBox().querySelectorAll('input')).toHaveLength(12)
      expect(columnsBox().querySelector('.column-menu__add')).toBeNull()
    })

    // The keys then scroll that box.
    test('keeps the focus of a click on its title in the box of its columns', async () => {
      await openMenu({ hostTop: 219, props: { isAddAllowed: true } })

      clickOn(title())

      expect(document.activeElement).toBe(columnsBox())
    })

    test('sends Tab and Shift+Tab from a click on its title to its entries', async () => {
      await openMenu({ hostTop: 219, props: { isAddAllowed: true } })
      const first = entries()[0]
      const last = entries()[entries().length - 1]

      clickOn(title())
      expect(pressTab(document.activeElement, true).defaultPrevented).toBe(
        true
      )
      expect(document.activeElement).toBe(last)

      clickOn(title())
      expect(pressTab(document.activeElement).defaultPrevented).toBe(true)
      expect(document.activeElement).toBe(first)
    })

    test('gives the focus back to its toggle when Escape follows a click on its title', async () => {
      await openMenu({ hostTop: 219 })
      clickOn(title())

      pressEscape()
      await wrapper.setProps({ isOpen: false })

      expect(document.activeElement).toBe(opener)
    })

    // Safari leaves checkboxes out of Tab by default: its own move would
    // leave the menu.
    test('moves the focus itself between two entries', async () => {
      await openMenu({ hostTop: 219, props: { isAddAllowed: true } })

      expect(pressTab(entries()[0]).defaultPrevented).toBe(true)
      expect(document.activeElement).toBe(entries()[1])

      expect(pressTab(entries()[1], true).defaultPrevented).toBe(true)
      expect(document.activeElement).toBe(entries()[0])
    })

    // As after a click on the browser bar: its Tab gives the focus to the
    // page, and the page hears only the next one.
    test('brings back a Tab pressed on the page under it', async () => {
      await openMenu({ hostTop: 219, props: { isAddAllowed: true } })
      const outside = document.createElement('input')
      document.body.appendChild(outside)
      onTestFinished(() => outside.remove())

      outside.focus()
      expect(pressTab(outside).defaultPrevented).toBe(true)
      expect(document.activeElement).toBe(entries()[0])

      outside.focus()
      expect(pressTab(outside, true).defaultPrevented).toBe(true)
      expect(document.activeElement).toBe(entries()[entries().length - 1])
    })

    // The player of the side panel takes Shift+Tab to its comment box.
    test('keeps its Tab from the listeners of the page', async () => {
      await openMenu({ hostTop: 219 })
      const pageListener = vi.fn()
      document.addEventListener('keydown', pageListener, true)
      onTestFinished(() =>
        document.removeEventListener('keydown', pageListener, true)
      )

      pressTab(entries()[0], true)

      expect(pageListener).not.toHaveBeenCalled()
      expect(document.activeElement).toBe(entries()[entries().length - 1])
    })

    // The player of the side panel takes Space and the arrows on the window,
    // and the list Alt+arrows: they would act under the mask.
    test('keeps its keys from the shortcuts of the page', async () => {
      await openMenu({ hostTop: 219, props: { isAddAllowed: true } })
      const pageShortcuts = vi.fn()
      window.addEventListener('keydown', pageShortcuts)
      onTestFinished(() => window.removeEventListener('keydown', pageShortcuts))
      const addButton = menu().querySelector('.column-menu__add')

      // Space still makes the button open the new column modal.
      expect(pressKey(addButton, { key: ' ' }).defaultPrevented).toBe(false)
      pressKey(entries()[0], { key: 'ArrowDown', altKey: true })
      expect(pressKey(addButton, { key: 'Escape' }).defaultPrevented).toBe(true)

      expect(pageShortcuts).not.toHaveBeenCalled()
      expect(wrapper.emitted('update:is-open')).toEqual([[false]])
    })

    // The list follows Shift for the range selection of its rows.
    test('lets a modifier alone reach the page', async () => {
      await openMenu({ hostTop: 219 })
      const pageListener = vi.fn()
      window.addEventListener('keydown', pageListener)
      onTestFinished(() => window.removeEventListener('keydown', pageListener))

      pressKey(entries()[0], { key: 'Shift', shiftKey: true })

      expect(pageListener).toHaveBeenCalledTimes(1)
    })

    // The list kept them from going back or forward in the browser history.
    test('keeps Alt+Left and Alt+Right from the browser', async () => {
      await openMenu({ hostTop: 219, props: { isAddAllowed: true } })
      const addButton = menu().querySelector('.column-menu__add')

      expect(
        pressKey(entries()[0], { key: 'ArrowLeft', altKey: true })
          .defaultPrevented
      ).toBe(true)
      expect(
        pressKey(addButton, { key: 'ArrowRight', altKey: true }).defaultPrevented
      ).toBe(true)
      expect(pressKey(entries()[0], { key: 'ArrowLeft' }).defaultPrevented).toBe(
        false
      )
    })

    // In Chromium, their stack belongs to the page: they would edit a text
    // field under the mask, such as a comment draft. The player of the side
    // panel kept them from it.
    test('keeps undo and redo from the text fields of the page', async () => {
      await openMenu({ hostTop: 219, props: { isAddAllowed: true } })
      const addButton = menu().querySelector('.column-menu__add')

      expect(
        pressKey(entries()[0], { key: 'z', ctrlKey: true }).defaultPrevented
      ).toBe(true)
      expect(
        pressKey(entries()[0], { key: 'Z', metaKey: true, shiftKey: true })
          .defaultPrevented
      ).toBe(true)
      expect(
        pressKey(addButton, { key: 'y', ctrlKey: true }).defaultPrevented
      ).toBe(true)
    })

    test('leaves Tab to the page once closed', async () => {
      await openMenu({ hostTop: 219 })
      await wrapper.setProps({ isOpen: false })

      expect(pressTab(opener).defaultPrevented).toBe(false)
      expect(document.activeElement).toBe(opener)
    })

    test('gives the focus back to its toggle when Escape closes it', async () => {
      await openMenu({ hostTop: 219 })
      entries()[1].focus()

      pressEscape()
      await wrapper.setProps({ isOpen: false })

      expect(document.activeElement).toBe(opener)
    })

    // The modal gives the focus back to where it was when it opened: the
    // button of the menu would be gone by then.
    test('gives the focus back to its toggle before asking for a column', async () => {
      let focused = null
      await openMenu({
        hostTop: 219,
        props: {
          isAddAllowed: true,
          onAddMetadata: () => {
            focused = document.activeElement
          }
        }
      })

      const addButton = document.querySelector('.column-menu__add')
      addButton.focus()
      addButton.click()

      expect(focused).toBe(opener)
    })

    test('leaves the focus alone when a click outside closes it', async () => {
      await openMenu({ hostTop: 219 })
      const outside = document.createElement('input')
      document.body.appendChild(outside)
      outside.focus()

      await wrapper.setProps({ isOpen: false })

      expect(document.activeElement).toBe(outside)
      outside.remove()
    })
  })

  describe('column reorder', () => {
    const columns = (production, names) =>
      names.map((name, index) => ({
        id: `${production}-${index}`,
        entity_type: 'Asset',
        field_name: name.toLowerCase(),
        name,
        position: index + 1
      }))

    // Plays the store: it hands the menu the columns of the current
    // production, and moves them in place once a reorder is answered, the
    // unlisted ones last as Zou does.
    const mountReorderMenu = async initialColumns => {
      let shownColumns = reactive(initialColumns)
      const savedOrders = []
      const answers = []
      const store = createStore({
        getters: { isCurrentUserManager: () => true },
        actions: {
          reorderMetadataDescriptors: (_, { descriptorIds }) => {
            savedOrders.push(descriptorIds)
            return new Promise(resolve => {
              answers.push(() => {
                shownColumns.forEach(column => {
                  const index = descriptorIds.indexOf(column.id)
                  column.position =
                    index >= 0 ? index + 1 : descriptorIds.length + 1
                })
                resolve()
              })
            })
          }
        }
      })
      wrapper = mountWithI18n(TableMetadataSelectorMenu, {
        props: {
          descriptors: shownColumns,
          isOpen: true,
          modelValue: {},
          namespace: 'assets'
        },
        global: { plugins: [store] }
      })
      await flushPromises()

      const rows = () => [...document.querySelectorAll('.column-menu li')]
      const rowOf = name => rows().find(row => row.textContent.trim() === name)
      return {
        answerSave: async () => {
          answers.shift()()
          await flushPromises()
        },
        handleOf: name => rowOf(name).querySelector('.drag-handle'),
        names: () => rows().map(row => row.textContent.trim()),
        rowOf,
        savedOrders,
        setColumns: async newColumns => {
          shownColumns = reactive(newColumns)
          await wrapper.setProps({ descriptors: shownColumns })
        }
      }
    }

    // Regression: the menu kept the columns of the production shown when it
    // mounted, the first one by name on a page load, as long as the next one
    // had as many columns.
    test('lists the columns of a production that has as many', async () => {
      const { names, setColumns } = await mountReorderMenu(
        columns('alpha', ['Vendor', 'Budget', 'Notes'])
      )

      await setColumns(columns('bravo', ['Rig', 'LOD', 'Comments']))

      expect(names()).toEqual(['Rig', 'LOD', 'Comments'])
    })

    // Productions made from one template have the same columns under other
    // ids: Zou refused the order, made of the ids of the other production.
    test('saves the order with the columns of the production shown', async () => {
      const { handleOf, rowOf, savedOrders, setColumns } =
        await mountReorderMenu(columns('alpha', ['Vendor', 'Budget', 'Notes']))
      await setColumns(columns('bravo', ['Vendor', 'Budget', 'Notes']))

      await startDrag(handleOf('Notes'))
      dropBefore(rowOf('Notes'), rowOf('Vendor'))
      await flushPromises()

      expect(savedOrders).toEqual([['bravo-2', 'bravo-0', 'bravo-1']])
    })

    // Regression: a column deleted by another user during a drag rebuilt the
    // menu, and the drop threw: the row before which vuedraggable puts the
    // dragged one back was gone. Zou refuses an order naming a deleted column.
    test('saves the dropped order when a column is deleted during the drag', async () => {
      const alpha = columns('alpha', ['Vendor', 'Budget', 'Outsourced', 'Notes'])
      const { answerSave, handleOf, names, rowOf, savedOrders, setColumns } =
        await mountReorderMenu(alpha)

      const errors = await recordListenerErrors(async () => {
        await startDrag(handleOf('Notes'))
        await setColumns(alpha.filter(column => column.name !== 'Budget'))
        dropBefore(rowOf('Notes'), rowOf('Vendor'))
        await flushPromises()
      })

      expect(errors).toEqual([])
      expect(savedOrders).toEqual([['alpha-3', 'alpha-0', 'alpha-2']])
      await answerSave()
      expect(names()).toEqual(['Notes', 'Vendor', 'Outsourced'])
    })

    // Dropped where it was, the column keeps the order of the store, which
    // the answer then leaves as it was.
    test('leaves out a column deleted during a drag dropped in place', async () => {
      const alpha = columns('alpha', ['Vendor', 'Budget', 'Notes'])
      const { answerSave, handleOf, names, savedOrders, setColumns } =
        await mountReorderMenu(alpha)

      await startDrag(handleOf('Notes'))
      await setColumns(alpha.filter(column => column.name !== 'Budget'))
      drop()
      await flushPromises()

      expect(savedOrders).toEqual([['alpha-0', 'alpha-2']])
      await answerSave()
      expect(names()).toEqual(['Vendor', 'Notes'])
    })

    // Regression: vuedraggable moved the row found at the start index of the
    // drag in the rebuilt menu, so another column moved and was saved.
    test('moves the dragged column when a column is added during the drag', async () => {
      const alpha = columns('alpha', ['Vendor', 'Budget', 'Notes'])
      const { answerSave, handleOf, names, rowOf, savedOrders, setColumns } =
        await mountReorderMenu(alpha)

      await startDrag(handleOf('Notes'))
      await setColumns([
        {
          id: 'alpha-9',
          entity_type: 'Asset',
          field_name: 'outsourced',
          name: 'Outsourced',
          position: 0
        },
        ...alpha
      ])
      dropBefore(rowOf('Notes'), rowOf('Vendor'))
      await flushPromises()

      expect(savedOrders).toEqual([['alpha-2', 'alpha-0', 'alpha-1']])
      await answerSave()
      expect(names()).toEqual(['Notes', 'Vendor', 'Budget', 'Outsourced'])
    })

    // The lists pass a new exclude object on each of their renders, which
    // recomputes the columns while the store still has the old order.
    test('keeps the dropped order until the save answers', async () => {
      const { handleOf, names, rowOf } = await mountReorderMenu(
        columns('alpha', ['Vendor', 'Budget', 'Notes'])
      )

      await startDrag(handleOf('Notes'))
      dropBefore(rowOf('Notes'), rowOf('Vendor'))
      await flushPromises()
      await wrapper.setProps({ exclude: {} })

      expect(names()).toEqual(['Notes', 'Vendor', 'Budget'])
    })

    test('shows a column deleted during a press once the row is released', async () => {
      const alpha = columns('alpha', ['Vendor', 'Budget', 'Notes'])
      const { handleOf, names, setColumns } = await mountReorderMenu(alpha)

      const errors = await recordListenerErrors(async () => {
        pressOn(handleOf('Notes'))
        await flushPromises()
        await setColumns(alpha.filter(column => column.name !== 'Budget'))
        expect(names()).toEqual(['Vendor', 'Budget', 'Notes'])

        release()
        await flushPromises()
      })

      expect(errors).toEqual([])
      expect(names()).toEqual(['Vendor', 'Notes'])
    })

    // Regression: an Escape during a press closed the menu, whose list then
    // never reported the release: the menu kept its columns for good, those
    // of the previous production after a switch.
    test('lists the columns of the next production once closed during a press', async () => {
      const { handleOf, names, setColumns } = await mountReorderMenu(
        columns('alpha', ['Vendor', 'Budget', 'Notes'])
      )

      const errors = await recordListenerErrors(async () => {
        pressOn(handleOf('Notes'))
        await flushPromises()
        await wrapper.setProps({ isOpen: false })
        release()
        await setColumns(columns('bravo', ['Rig', 'LOD']))
        await wrapper.setProps({ isOpen: true })
        await flushPromises()
      })

      expect(errors).toEqual([])
      expect(names()).toEqual(['Rig', 'LOD'])
    })
  })
})
