import { flushPromises, mount } from '@vue/test-utils'
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

import i18n from '@/lib/i18n'

import TableMetadataSelectorMenu from '@/components/widgets/TableMetadataSelectorMenu.vue'

import './setup'

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

  const openMenu = async ({ namespace = 'shots', hostTop }) => {
    const store = createStore({
      getters: { isCurrentUserManager: () => false }
    })
    wrapper = mount(TableMetadataSelectorMenu, {
      props: { descriptors, modelValue: {}, namespace },
      global: { plugins: [i18n, store] }
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
      wrapper = mount(TableMetadataSelectorMenu, {
        props: {
          descriptors: shownColumns,
          isOpen: true,
          modelValue: {},
          namespace: 'assets'
        },
        global: { plugins: [i18n, store] }
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
