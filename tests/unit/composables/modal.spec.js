import { flushPromises, mount } from '@vue/test-utils'
import { nextTick, ref, watch } from 'vue'

import { useModal } from '@/composables/modal'

const createModalWrapper = (active = false) => {
  const TestComponent = {
    setup() {
      const activeRef = ref(active)
      const emit = vi.fn()
      useModal(activeRef, emit)
      return { activeRef, emit }
    },
    template: '<div />'
  }
  return mount(TestComponent)
}

const pressTab = (options = {}, target = window) => {
  const event = new KeyboardEvent('keydown', {
    key: 'Tab',
    bubbles: true,
    cancelable: true,
    ...options
  })
  target.dispatchEvent(event)
  return event
}

describe('composables/modal', () => {
  it('does not add listener when inactive', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    createModalWrapper(false)
    expect(addSpy).not.toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
      false
    )
    addSpy.mockRestore()
  })

  it('adds keydown listener when active', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    const wrapper = createModalWrapper(true)
    expect(addSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
      false
    )
    addSpy.mockRestore()
    wrapper.unmount()
  })

  it('emits cancel on Escape key', async () => {
    const wrapper = createModalWrapper(true)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(wrapper.vm.emit).toHaveBeenCalledWith('cancel')
    wrapper.unmount()
  })

  // A window listener added before the modal opened sees the modal open. One
  // added after it sees it closed: it needs the mark to leave the key alone.
  it('takes the Escape it cancels on', () => {
    const wrapper = createModalWrapper(true)
    const escape = new KeyboardEvent('keydown', {
      key: 'Escape',
      cancelable: true
    })
    window.dispatchEvent(escape)
    expect(wrapper.vm.emit).toHaveBeenCalledWith('cancel')
    expect(escape.defaultPrevented).toBe(true)
    wrapper.unmount()
  })

  it('does not emit cancel on other keys', () => {
    const wrapper = createModalWrapper(true)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(wrapper.vm.emit).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('adds listener when active becomes true', async () => {
    const wrapper = createModalWrapper(false)
    const addSpy = vi.spyOn(window, 'addEventListener')
    wrapper.vm.activeRef = true
    await nextTick()
    expect(addSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
      false
    )
    addSpy.mockRestore()
    wrapper.unmount()
  })

  it('removes listener when active becomes false', async () => {
    const wrapper = createModalWrapper(true)
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    wrapper.vm.activeRef = false
    await nextTick()
    expect(removeSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    )
    removeSpy.mockRestore()
  })

  it('removes listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const wrapper = createModalWrapper(true)
    wrapper.unmount()
    expect(removeSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    )
    removeSpy.mockRestore()
  })

  describe('focus management (CLEAN-4)', () => {
    const buildHost = () => {
      const active = ref(false)
      const Host = {
        setup() {
          const containerRef = ref(null)
          useModal(active, vi.fn(), containerRef)
          return { containerRef }
        },
        template: `
          <div ref="containerRef">
            <button id="first">first</button>
            <button id="last">last</button>
          </div>
        `
      }
      const wrapper = mount(Host, { attachTo: document.body })
      return { active, wrapper }
    }

    it('wraps Tab focus inside the container', async () => {
      const { active, wrapper } = buildHost()
      active.value = true
      await nextTick()

      document.getElementById('last').focus()
      const forward = pressTab()
      expect(forward.defaultPrevented).toBe(true)
      expect(document.activeElement.id).toBe('first')

      const backwards = pressTab({ shiftKey: true })
      expect(backwards.defaultPrevented).toBe(true)
      expect(document.activeElement.id).toBe('last')
      wrapper.unmount()
    })

    it('restores the previously focused element on close', async () => {
      const outside = document.createElement('button')
      outside.id = 'outside'
      document.body.appendChild(outside)
      outside.focus()

      const { active, wrapper } = buildHost()
      active.value = true
      await nextTick()
      document.getElementById('first').focus()

      active.value = false
      await nextTick()
      expect(document.activeElement.id).toBe('outside')

      wrapper.unmount()
      outside.remove()
    })
  })

  describe('keyboard focus in an open modal', () => {
    // Like DeleteModal and the other modals that pass no container.
    const DIALOG = `
      <div class="modal">
        <div class="modal-content">
          <button id="first">first</button>
          <button id="middle">middle</button>
          <button id="last">last</button>
        </div>
      </div>
    `

    const openDialog = async ({ template = DIALOG, withRef = false } = {}) => {
      const active = ref(false)
      const emit = vi.fn()
      const Host = {
        setup() {
          const containerRef = ref(null)
          useModal(active, emit, withRef ? containerRef : null)
          return { containerRef }
        },
        template
      }
      const wrapper = mount(Host, { attachTo: document.body })
      active.value = true
      await flushPromises()
      return { emit, wrapper }
    }

    it('focuses the dialog when it opens', async () => {
      const { wrapper } = await openDialog()

      expect(document.activeElement).toBe(wrapper.element)
      wrapper.unmount()
    })

    it.each([
      ['Shift+Tab from the dialog', { shiftKey: true }, '#last', false],
      ['Tab from the dialog', {}, '#first', false],
      ['Shift+Tab from the page', { shiftKey: true }, '#last', true],
      ['Tab from the page', {}, '#first', true]
    ])('%s lands inside the dialog', async (_, options, target, fromPage) => {
      const pageButton = document.createElement('button')
      document.body.prepend(pageButton)
      const { wrapper } = await openDialog()
      if (fromPage) pageButton.focus()

      const event = pressTab(options)

      expect(event.defaultPrevented).toBe(true)
      expect(document.activeElement).toBe(wrapper.get(target).element)
      wrapper.unmount()
      pageButton.remove()
    })

    it.each([
      ['a hidden field', '<button style="display: none">hidden</button>'],
      [
        'a field in a hidden block',
        '<p style="display: none"><button>hidden</button></p>'
      ],
      ['an invisible field', '<button style="visibility: hidden">x</button>'],
      ['a field out of the Tab order', '<button tabindex="-1">x</button>']
    ])('wraps Tab on the last field when %s follows it', async (_, after) => {
      const { wrapper } = await openDialog({
        template: `
          <div ref="containerRef">
            <button id="first">first</button>
            <button id="last">last</button>
            ${after}
          </div>
        `,
        withRef: true
      })
      wrapper.get('#last').element.focus()

      const event = pressTab()

      expect(event.defaultPrevented).toBe(true)
      expect(document.activeElement).toBe(wrapper.get('#first').element)
      wrapper.unmount()
    })

    it.each([
      ['Shift+Tab from a block before', '#block', { shiftKey: true }, '#last'],
      ['Tab from a note after', '#note', {}, '#first']
    ])(
      '%s the fields wraps inside the dialog',
      async (_, from, options, target) => {
        const { wrapper } = await openDialog({
          withRef: true,
          template: `
            <div class="modal" ref="containerRef">
              <div id="block" tabindex="-1">
                <button id="first">first</button>
                <button id="last">last</button>
              </div>
              <span id="note" tabindex="-1">note</span>
            </div>
          `
        })
        wrapper.get(from).element.focus()

        const event = pressTab(options)

        expect(event.defaultPrevented).toBe(true)
        expect(document.activeElement).toBe(wrapper.get(target).element)
        wrapper.unmount()
      }
    )

    it('keeps the focus on a dialog with nothing to focus', async () => {
      const { wrapper } = await openDialog({
        template: '<div class="modal"><p>Nothing to do</p></div>'
      })

      const event = pressTab()

      expect(event.defaultPrevented).toBe(true)
      expect(document.activeElement).toBe(wrapper.element)
      wrapper.unmount()
    })

    it.each([
      ['Tab', {}],
      ['Shift+Tab', { shiftKey: true }]
    ])('leaves %s between two fields to the browser', async (_, options) => {
      const { wrapper } = await openDialog()
      const middle = wrapper.get('#middle').element
      middle.focus()

      const event = pressTab(options)

      expect(event.defaultPrevented).toBe(false)
      expect(document.activeElement).toBe(middle)
      wrapper.unmount()
    })

    // A modal mounted closed must not take the open one off the stack.
    it('keeps the keyboard on an open modal when a closed one mounts', async () => {
      const { emit, wrapper } = await openDialog()
      const Closed = {
        setup() {
          useModal(ref(false), vi.fn())
        },
        template: '<div class="modal"></div>'
      }
      const closed = mount(Closed, { attachTo: document.body })

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

      expect(emit).toHaveBeenCalledWith('cancel')
      closed.unmount()
      wrapper.unmount()
    })

    // focus() does nothing on an element that is not rendered yet.
    it('focuses a dialog that only renders once open', async () => {
      const active = ref(false)
      const Host = {
        setup() {
          useModal(active, vi.fn())
          return { active }
        },
        template: '<div class="modal" v-if="active"><button>ok</button></div>'
      }
      const wrapper = mount(Host, { attachTo: document.body })

      active.value = true
      await flushPromises()

      expect(document.activeElement).toBe(wrapper.element)
      wrapper.unmount()
    })

    it.each([
      ['before', true],
      ['after', false]
    ])(
      'leaves the focus on a field the modal focuses itself %s useModal',
      async (_, isOwnFocusFirst) => {
        const active = ref(false)
        const Host = {
          setup() {
            const field = ref(null)
            const focusFieldOnOpen = () =>
              watch(active, isActive => {
                if (isActive) nextTick(() => field.value.focus())
              })
            if (isOwnFocusFirst) focusFieldOnOpen()
            useModal(active, vi.fn())
            if (!isOwnFocusFirst) focusFieldOnOpen()
            return { field }
          },
          template: '<div class="modal"><input ref="field" /></div>'
        }
        const wrapper = mount(Host, { attachTo: document.body })

        active.value = true
        await flushPromises()

        expect(document.activeElement).toBe(wrapper.get('input').element)
        wrapper.unmount()
      }
    )

    it('leaves a Tab that a widget already handled', async () => {
      const { wrapper } = await openDialog()
      const first = wrapper.get('#first').element
      const middle = wrapper.get('#middle').element
      // Like the Shift+Tab toggle of the playlist player.
      const toFirst = event => {
        event.preventDefault()
        first.focus()
      }
      document.addEventListener('keydown', toFirst, true)
      middle.focus()

      pressTab({ shiftKey: true }, middle)

      expect(document.activeElement).toBe(first)
      document.removeEventListener('keydown', toFirst, true)
      wrapper.unmount()
    })

    it('leaves Tab to a popup dialog such as the date picker menu', async () => {
      const { wrapper } = await openDialog()
      const menu = document.createElement('div')
      menu.setAttribute('aria-modal', 'true')
      const day = document.createElement('button')
      menu.appendChild(day)
      document.body.appendChild(menu)
      day.focus()

      const event = pressTab()

      expect(event.defaultPrevented).toBe(false)
      expect(document.activeElement).toBe(day)
      menu.remove()
      wrapper.unmount()
    })

    it('lets only the top modal answer Escape and Tab', async () => {
      const lower = await openDialog()
      const upper = await openDialog()
      upper.wrapper.get('#last').element.focus()

      pressTab()
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

      expect(document.activeElement).toBe(upper.wrapper.get('#first').element)
      expect(upper.emit).toHaveBeenCalledWith('cancel')
      expect(lower.emit).not.toHaveBeenCalled()
      upper.wrapper.unmount()
      lower.wrapper.unmount()
    })

    it('gives the focus back to the opener when an open modal unmounts', async () => {
      const opener = document.createElement('button')
      document.body.appendChild(opener)
      opener.focus()
      const { wrapper } = await openDialog()

      wrapper.unmount()

      expect(document.activeElement).toBe(opener)
      opener.remove()
    })

    it('leaves a modal with several root nodes without a trap', async () => {
      const onError = vi.fn()
      window.addEventListener('error', onError)
      const { wrapper } = await openDialog({
        template: '<p>note</p><div class="modal"><button>ok</button></div>'
      })

      const event = pressTab()

      expect(event.defaultPrevented).toBe(false)
      expect(onError).not.toHaveBeenCalled()
      window.removeEventListener('error', onError)
      wrapper.unmount()
    })
  })
})
